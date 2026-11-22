/**
 * Citizen Consent Receipts & Privacy-Preserving Data Exchange API
 * Aligned with «جمهورية المقرن» Constitutional Privacy Safeguards:
 *   - No ministry may silently scrape citizen records
 *   - Inter-agency reads require an explicit, time-bounded, purpose-scoped,
 *     HMAC-SHA256 signed Citizen Consent Receipt
 *   - Citizens can list and instantly revoke active consent grants
 */

export const OID_ROOT = '1.3.6.1.4.1.61026';
const DEFAULT_TTL_SECONDS = 86400 * 30; // 30 days
const MAX_TTL_SECONDS = 86400 * 365; // 1 year

const FALLBACK_CONSENTS = [
  {
    id: 'consent-seed-001',
    receipt_id: 'CR-2026-HEALTH-001',
    citizen_oid: `${OID_ROOT}.2.01.001.123456789.1`,
    requesting_ministry_oid: `${OID_ROOT}.4.1.2`,
    scopes: JSON.stringify(['health:vaccination_record', 'identity:age_over_18']),
    purpose: 'Khartoum Teaching Hospital Emergency Care Verification',
    status: 'active',
    expires_at: '2027-06-30T23:59:59.000Z',
    revoked_at: null,
    signature: 'seed-signature-verified-in-dev',
    created_at: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'consent-seed-002',
    receipt_id: 'CR-2026-AGRI-002',
    citizen_oid: `${OID_ROOT}.2.01.001.123456789.1`,
    requesting_ministry_oid: `${OID_ROOT}.4.1.5`,
    scopes: JSON.stringify(['land:parcel_ownership', 'finance:subsidy_eligibility']),
    purpose: 'Al Jazirah Seasonal Agricultural Micro-Credit Enrollment',
    status: 'active',
    expires_at: '2027-09-30T23:59:59.000Z',
    revoked_at: null,
    signature: 'seed-signature-verified-in-dev',
    created_at: '2026-01-18T14:30:00.000Z',
  },
];

const memoryConsents = [...FALLBACK_CONSENTS];

function getSigningSecret(env) {
  return env?.ENCRYPTION_KEY || env?.JWT_SECRET || 'sd-sovereign-consent-dev-secret';
}

function canonicalConsentMessage(receipt) {
  const scopesStr = Array.isArray(receipt.scopes)
    ? JSON.stringify([...receipt.scopes].sort())
    : receipt.scopes;
  return [
    receipt.receipt_id,
    receipt.citizen_oid,
    receipt.requesting_ministry_oid,
    scopesStr,
    receipt.purpose,
    receipt.expires_at,
  ].join('|');
}

export async function signConsentPayload(receipt, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(canonicalConsentMessage(receipt))
  );
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyConsentSignature(receipt, signature, secret) {
  const expected = await signConsentPayload(receipt, secret);
  if (typeof signature !== 'string' || signature.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

function parseScopes(raw) {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function formatReceipt(row) {
  return {
    ...row,
    scopes: parseScopes(row.scopes),
  };
}

function json(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Powered-By': 'Cloudflare Workers', ...corsHeaders },
  });
}

export async function handleConsent(request, env, { subResource, method, url, corsHeaders, getSession }) {
  const secret = getSigningSecret(env);

  // GET /api/consent/list
  if ((subResource === 'list' || !subResource) && method === 'GET') {
    const citizenOid = url.searchParams.get('citizen_oid');
    const ministryOid = url.searchParams.get('ministry_oid');
    const status = url.searchParams.get('status');

    let rows = [];
    if (env?.DB) {
      let query = 'SELECT * FROM citizen_consent_receipts WHERE 1=1';
      const params = [];
      if (citizenOid) { query += ' AND citizen_oid = ?'; params.push(citizenOid); }
      if (ministryOid) { query += ' AND requesting_ministry_oid = ?'; params.push(ministryOid); }
      if (status) { query += ' AND status = ?'; params.push(status); }
      query += ' ORDER BY created_at DESC';
      const res = await env.DB.prepare(query).bind(...params).all();
      rows = res?.results || [];
    } else {
      rows = memoryConsents.filter(
        (c) =>
          (!citizenOid || c.citizen_oid === citizenOid) &&
          (!ministryOid || c.requesting_ministry_oid === ministryOid) &&
          (!status || c.status === status)
      );
    }

    const receipts = rows.map(formatReceipt);
    return json({ receipts, count: receipts.length }, 200, corsHeaders);
  }

  // POST /api/consent/grant (authenticated)
  if (subResource === 'grant' && method === 'POST') {
    const session = await getSession();
    if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body', status: 400 }, 400, corsHeaders);

    const {
      citizenOid,
      requestingMinistryOid,
      scopes,
      purpose,
      ttlSeconds = DEFAULT_TTL_SECONDS,
    } = body;

    if (!citizenOid || !citizenOid.startsWith(`${OID_ROOT}.`)) {
      return json({ error: `citizenOid must be anchored under ${OID_ROOT}`, status: 400 }, 400, corsHeaders);
    }
    if (!requestingMinistryOid || !requestingMinistryOid.startsWith(`${OID_ROOT}.`)) {
      return json({ error: `requestingMinistryOid must be anchored under ${OID_ROOT}`, status: 400 }, 400, corsHeaders);
    }
    if (!Array.isArray(scopes) || scopes.length === 0) {
      return json({ error: 'scopes must be a non-empty array of scope strings', status: 400 }, 400, corsHeaders);
    }
    if (!purpose) {
      return json({ error: 'purpose is required', status: 400 }, 400, corsHeaders);
    }

    const ttl = Math.min(Math.max(Number(ttlSeconds) || DEFAULT_TTL_SECONDS, 60), MAX_TTL_SECONDS);
    const nowMs = Date.now();
    const createdAt = new Date(nowMs).toISOString();
    const expiresAt = new Date(nowMs + ttl * 1000).toISOString();
    const id = crypto.randomUUID();
    const receiptId = `CR-${createdAt.slice(0, 4)}-${id.slice(0, 8).toUpperCase()}`;
    const sortedScopesJson = JSON.stringify([...new Set(scopes)].sort());

    const receipt = {
      id,
      receipt_id: receiptId,
      citizen_oid: citizenOid,
      requesting_ministry_oid: requestingMinistryOid,
      scopes: sortedScopesJson,
      purpose,
      status: 'active',
      expires_at: expiresAt,
      revoked_at: null,
      created_at: createdAt,
    };
    receipt.signature = await signConsentPayload(receipt, secret);

    if (env?.DB) {
      await env.DB.prepare(
        `INSERT INTO citizen_consent_receipts
          (id, receipt_id, citizen_oid, requesting_ministry_oid, scopes, purpose,
           status, expires_at, revoked_at, signature, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          receipt.id,
          receipt.receipt_id,
          receipt.citizen_oid,
          receipt.requesting_ministry_oid,
          receipt.scopes,
          receipt.purpose,
          receipt.status,
          receipt.expires_at,
          receipt.revoked_at,
          receipt.signature,
          receipt.created_at
        )
        .run();
    } else {
      memoryConsents.unshift(receipt);
    }

    return json({ success: true, receipt: formatReceipt(receipt) }, 201, corsHeaders);
  }

  // POST /api/consent/revoke (authenticated)
  if (subResource === 'revoke' && method === 'POST') {
    const session = await getSession();
    if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

    const body = await request.json().catch(() => null);
    if (!body || (!body.receiptId && !body.id)) {
      return json({ error: 'receiptId or id is required', status: 400 }, 400, corsHeaders);
    }

    const now = new Date().toISOString();
    let row = null;
    if (env?.DB) {
      row = body.receiptId
        ? await env.DB.prepare('SELECT * FROM citizen_consent_receipts WHERE receipt_id = ?').bind(body.receiptId).first()
        : await env.DB.prepare('SELECT * FROM citizen_consent_receipts WHERE id = ?').bind(body.id).first();
    } else {
      row = memoryConsents.find(
        (c) => (body.receiptId && c.receipt_id === body.receiptId) || (body.id && c.id === body.id)
      );
    }

    if (!row) {
      return json({ error: 'Consent receipt not found', status: 404 }, 404, corsHeaders);
    }

    if (env?.DB) {
      await env.DB.prepare(
        "UPDATE citizen_consent_receipts SET status = 'revoked', revoked_at = ? WHERE id = ?"
      )
        .bind(now, row.id)
        .run();
    } else {
      row.status = 'revoked';
      row.revoked_at = now;
    }

    return json(
      {
        success: true,
        receiptId: row.receipt_id,
        status: 'revoked',
        revokedAt: now,
      },
      200,
      corsHeaders
    );
  }

  // POST /api/consent/verify
  if (subResource === 'verify' && method === 'POST') {
    const body = await request.json().catch(() => null);
    if (!body || !body.citizenOid || !body.requestingMinistryOid || !body.scope) {
      return json(
        { error: 'citizenOid, requestingMinistryOid, and scope are required', status: 400 },
        400,
        corsHeaders
      );
    }

    let candidates = [];
    if (env?.DB) {
      const res = await env.DB.prepare(
        'SELECT * FROM citizen_consent_receipts WHERE citizen_oid = ? AND requesting_ministry_oid = ? ORDER BY created_at DESC'
      )
        .bind(body.citizenOid, body.requestingMinistryOid)
        .all();
      candidates = res?.results || [];
    } else {
      candidates = memoryConsents.filter(
        (c) => c.citizen_oid === body.citizenOid && c.requesting_ministry_oid === body.requestingMinistryOid
      );
    }

    if (candidates.length === 0) {
      return json(
        { allowed: false, reason: 'No consent receipt found for citizen and ministry' },
        200,
        corsHeaders
      );
    }

    const nowMs = Date.now();
    for (const candidate of candidates) {
      if (candidate.status !== 'active') continue;
      if (new Date(candidate.expires_at).getTime() <= nowMs) continue;

      const scopes = parseScopes(candidate.scopes);
      if (!scopes.includes(body.scope) && !scopes.includes('*')) continue;

      const signatureValid = await verifyConsentSignature(candidate, candidate.signature, secret);
      if (!signatureValid) {
        return json(
          {
            allowed: false,
            reason: 'Consent receipt signature verification failed (tampered receipt)',
            receiptId: candidate.receipt_id,
            signatureValid: false,
          },
          200,
          corsHeaders
        );
      }

      return json(
        {
          allowed: true,
          receiptId: candidate.receipt_id,
          purpose: candidate.purpose,
          scopes,
          expiresAt: candidate.expires_at,
          signatureValid: true,
        },
        200,
        corsHeaders
      );
    }

    const latest = candidates[0];
    const reason =
      latest.status === 'revoked'
        ? 'Consent receipt has been revoked by citizen'
        : new Date(latest.expires_at).getTime() <= nowMs
        ? 'Consent receipt has expired'
        : `Requested scope '${body.scope}' is not authorized by active consent`;

    return json({ allowed: false, reason, receiptId: latest.receipt_id }, 200, corsHeaders);
  }

  return json({ error: 'Consent endpoint not found', status: 404 }, 404, corsHeaders);
}
