/**
 * Digital Land & Hawakeer Registry API
 * Anchored on ISO/ITU-T X.660 OID 1.3.6.1.4.1.61026.1.<state>.<seq>
 *
 * Key Constitutional Safeguards:
 *   - Reconciles statutory Freehold/Leasehold titles with customary Hawakeer communal land
 *   - Enforces automatic `409 Conflict` Transitional-Justice Dispute Freeze on transfer
 *     whenever a parcel has an active dispute (`dispute_status !== 'clear'`).
 */

export const OID_ROOT = '1.3.6.1.4.1.61026';
export const PLACE_OID_PREFIX = `${OID_ROOT}.1`;

const VALID_STATE_CODES = new Set([
  '01', '02', '03', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18',
]);

const VALID_TENURE_TYPES = new Set(['freehold', 'leasehold', 'hawakeer_communal', 'state_trust']);
const VALID_DISPUTE_TYPES = new Set([
  'wartime_displacement',
  'forged_deed',
  'boundary_overlap',
  'hawakeer_customary',
  'competing_title',
]);

const FALLBACK_PARCELS = [
  {
    id: 'parcel-seed-001',
    parcel_oid: `${PLACE_OID_PREFIX}.18.001.00042`,
    owner_oid: `${OID_ROOT}.2.18.001.445566778.3`,
    owner_name_ar: 'تعاونية مزارعي ود مدني الزراعية',
    owner_name_en: 'Wad Madani Farmers Cooperative',
    state_code: '18',
    locality: 'Wad Madani',
    area_feddan: 120.5,
    tenure_type: 'freehold',
    dispute_status: 'clear',
    coordinates_geojson: null,
    registered_at: '2026-01-08T09:00:00.000Z',
    updated_at: '2026-01-08T09:00:00.000Z',
  },
  {
    id: 'parcel-seed-002',
    parcel_oid: `${PLACE_OID_PREFIX}.15.002.00108`,
    owner_oid: `${OID_ROOT}.2.15.002.881122334.9`,
    owner_name_ar: 'حاكورة مجتمع الجنينة التقليدية',
    owner_name_en: 'El Geneina Customary Hawakeer Community',
    state_code: '15',
    locality: 'El Geneina',
    area_feddan: 840.0,
    tenure_type: 'hawakeer_communal',
    dispute_status: 'frozen',
    coordinates_geojson: null,
    registered_at: '2026-01-09T11:20:00.000Z',
    updated_at: '2026-01-12T14:00:00.000Z',
  },
  {
    id: 'parcel-seed-003',
    parcel_oid: `${PLACE_OID_PREFIX}.01.003.00519`,
    owner_oid: `${OID_ROOT}.2.01.003.112233445.5`,
    owner_name_ar: 'أسرة أحمد النيل — أم درمان',
    owner_name_en: 'Ahmed El-Nile Family — Omdurman',
    state_code: '01',
    locality: 'Omdurman',
    area_feddan: 0.75,
    tenure_type: 'freehold',
    dispute_status: 'frozen',
    coordinates_geojson: null,
    registered_at: '2026-01-11T08:45:00.000Z',
    updated_at: '2026-01-15T16:10:00.000Z',
  },
];

const FALLBACK_DISPUTES = [
  {
    id: 'dispute-seed-001',
    parcel_oid: `${PLACE_OID_PREFIX}.15.002.00108`,
    claimant_oid: `${OID_ROOT}.2.15.002.881122334.9`,
    dispute_type: 'wartime_displacement',
    status: 'frozen',
    reason: 'Transitional-justice freeze: community displaced during 2023-2025 conflict',
    evidence_hash: 'e1f2a3b4c5d60718293a4b5c6d7e8f9011223344556677889900aabbccddeeff',
    filed_at: '2026-01-12T14:00:00.000Z',
    resolved_at: null,
  },
  {
    id: 'dispute-seed-002',
    parcel_oid: `${PLACE_OID_PREFIX}.01.003.00519`,
    claimant_oid: `${OID_ROOT}.2.01.003.112233445.5`,
    dispute_type: 'forged_deed',
    status: 'frozen',
    reason: 'Suspected wartime fraudulent transfer pending Land Restitution Commission review',
    evidence_hash: 'f2a3b4c5d60718293a4b5c6d7e8f9011223344556677889900aabbccddeeff11',
    filed_at: '2026-01-15T16:10:00.000Z',
    resolved_at: null,
  },
];

const memoryParcels = [...FALLBACK_PARCELS];
const memoryDisputes = [...FALLBACK_DISPUTES];

function json(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Powered-By': 'Cloudflare Workers', ...corsHeaders },
  });
}

function isValidSudanOid(oid) {
  return typeof oid === 'string' && oid.startsWith(`${OID_ROOT}.`);
}

export async function handleLand(request, env, { subResource, subAction, method, url, corsHeaders, getSession }) {
  // GET /api/land/parcels
  if ((subResource === 'parcels' || !subResource) && method === 'GET') {
    const stateCode = url.searchParams.get('state_code');
    const ownerOid = url.searchParams.get('owner_oid');
    const parcelOid = url.searchParams.get('parcel_oid');
    const tenureType = url.searchParams.get('tenure_type');
    const disputeStatus = url.searchParams.get('dispute_status');

    let parcels = [];
    if (env?.DB) {
      let query = 'SELECT * FROM land_parcels WHERE 1=1';
      const params = [];
      if (stateCode) { query += ' AND state_code = ?'; params.push(stateCode); }
      if (ownerOid) { query += ' AND owner_oid = ?'; params.push(ownerOid); }
      if (parcelOid) { query += ' AND parcel_oid = ?'; params.push(parcelOid); }
      if (tenureType) { query += ' AND tenure_type = ?'; params.push(tenureType); }
      if (disputeStatus) { query += ' AND dispute_status = ?'; params.push(disputeStatus); }
      query += ' ORDER BY registered_at DESC';
      const res = await env.DB.prepare(query).bind(...params).all();
      parcels = res?.results || [];
    } else {
      parcels = memoryParcels.filter(
        (p) =>
          (!stateCode || p.state_code === stateCode) &&
          (!ownerOid || p.owner_oid === ownerOid) &&
          (!parcelOid || p.parcel_oid === parcelOid) &&
          (!tenureType || p.tenure_type === tenureType) &&
          (!disputeStatus || p.dispute_status === disputeStatus)
      );
    }

    return json({ oidRoot: PLACE_OID_PREFIX, parcels, count: parcels.length }, 200, corsHeaders);
  }

  // POST /api/land/parcels (authenticated)
  if (subResource === 'parcels' && method === 'POST') {
    const session = await getSession();
    if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body', status: 400 }, 400, corsHeaders);

    const {
      parcelOid,
      ownerOid,
      ownerNameAr = null,
      ownerNameEn = null,
      stateCode,
      locality,
      areaFeddan,
      tenureType,
      disputeStatus = 'clear',
      coordinatesGeojson = null,
    } = body;

    if (!VALID_STATE_CODES.has(String(stateCode))) {
      return json({ error: `Invalid stateCode: ${stateCode}. Must be '01'..'18'`, status: 400 }, 400, corsHeaders);
    }
    if (!isValidSudanOid(ownerOid)) {
      return json({ error: `ownerOid must be anchored under ${OID_ROOT}`, status: 400 }, 400, corsHeaders);
    }
    if (!locality) {
      return json({ error: 'locality is required', status: 400 }, 400, corsHeaders);
    }
    const area = Number(areaFeddan);
    if (!Number.isFinite(area) || area <= 0) {
      return json({ error: 'areaFeddan must be a positive number', status: 400 }, 400, corsHeaders);
    }
    if (!VALID_TENURE_TYPES.has(tenureType)) {
      return json({ error: `Invalid tenureType: ${tenureType}`, status: 400 }, 400, corsHeaders);
    }

    const id = crypto.randomUUID();
    const seq = String(Math.floor(10000 + Math.random() * 89999));
    const resolvedParcelOid = parcelOid || `${PLACE_OID_PREFIX}.${stateCode}.${seq}`;
    if (!resolvedParcelOid.startsWith(`${PLACE_OID_PREFIX}.`)) {
      return json({ error: `parcelOid must start with ${PLACE_OID_PREFIX}.`, status: 400 }, 400, corsHeaders);
    }

    const now = new Date().toISOString();
    const parcel = {
      id,
      parcel_oid: resolvedParcelOid,
      owner_oid: ownerOid,
      owner_name_ar: ownerNameAr,
      owner_name_en: ownerNameEn,
      state_code: String(stateCode),
      locality,
      area_feddan: area,
      tenure_type: tenureType,
      dispute_status: ['clear', 'frozen', 'under_review'].includes(disputeStatus) ? disputeStatus : 'clear',
      coordinates_geojson: coordinatesGeojson ? JSON.stringify(coordinatesGeojson) : null,
      registered_at: now,
      updated_at: now,
    };

    if (env?.DB) {
      await env.DB.prepare(
        `INSERT INTO land_parcels
          (id, parcel_oid, owner_oid, owner_name_ar, owner_name_en, state_code,
           locality, area_feddan, tenure_type, dispute_status, coordinates_geojson,
           registered_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          parcel.id,
          parcel.parcel_oid,
          parcel.owner_oid,
          parcel.owner_name_ar,
          parcel.owner_name_en,
          parcel.state_code,
          parcel.locality,
          parcel.area_feddan,
          parcel.tenure_type,
          parcel.dispute_status,
          parcel.coordinates_geojson,
          parcel.registered_at,
          parcel.updated_at
        )
        .run();
    } else {
      memoryParcels.unshift(parcel);
    }

    return json({ success: true, parcel }, 201, corsHeaders);
  }

  // POST /api/land/transfer (authenticated — enforces 409 Conflict Dispute Freeze)
  if (subResource === 'transfer' && method === 'POST') {
    const session = await getSession();
    if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

    const body = await request.json().catch(() => null);
    if (!body || !body.parcelOid || !body.newOwnerOid) {
      return json({ error: 'parcelOid and newOwnerOid are required', status: 400 }, 400, corsHeaders);
    }
    if (!isValidSudanOid(body.newOwnerOid)) {
      return json({ error: `newOwnerOid must be anchored under ${OID_ROOT}`, status: 400 }, 400, corsHeaders);
    }

    let parcel = null;
    if (env?.DB) {
      parcel = await env.DB.prepare('SELECT * FROM land_parcels WHERE parcel_oid = ?')
        .bind(body.parcelOid)
        .first();
    } else {
      parcel = memoryParcels.find((p) => p.parcel_oid === body.parcelOid);
    }

    if (!parcel) {
      return json({ error: 'Land parcel not found', status: 404 }, 404, corsHeaders);
    }

    // Constitutional Transitional-Justice Dispute Freeze Gate
    if (parcel.dispute_status !== 'clear') {
      let activeDisputes = [];
      if (env?.DB) {
        const dRes = await env.DB.prepare(
          "SELECT * FROM land_disputes WHERE parcel_oid = ? AND status IN ('open','frozen','under_review')"
        )
          .bind(parcel.parcel_oid)
          .all()
          .catch(() => ({ results: [] }));
        activeDisputes = dRes?.results || [];
      } else {
        activeDisputes = memoryDisputes.filter(
          (d) => d.parcel_oid === parcel.parcel_oid && ['open', 'frozen', 'under_review'].includes(d.status)
        );
      }

      return json(
        {
          error: 'Parcel transfer blocked: active transitional-justice dispute freeze',
          code: 'DISPUTE_FREEZE_ACTIVE',
          parcelOid: parcel.parcel_oid,
          disputeStatus: parcel.dispute_status,
          activeDisputes,
          status: 409,
        },
        409,
        corsHeaders
      );
    }

    const previousOwnerOid = parcel.owner_oid;
    const now = new Date().toISOString();

    if (env?.DB) {
      await env.DB.prepare(
        'UPDATE land_parcels SET owner_oid = ?, owner_name_ar = COALESCE(?, owner_name_ar), owner_name_en = COALESCE(?, owner_name_en), updated_at = ? WHERE parcel_oid = ?'
      )
        .bind(body.newOwnerOid, body.newOwnerNameAr || null, body.newOwnerNameEn || null, now, parcel.parcel_oid)
        .run();
    } else {
      parcel.owner_oid = body.newOwnerOid;
      if (body.newOwnerNameAr) parcel.owner_name_ar = body.newOwnerNameAr;
      if (body.newOwnerNameEn) parcel.owner_name_en = body.newOwnerNameEn;
      parcel.updated_at = now;
    }

    return json(
      {
        success: true,
        transferReceipt: {
          transferId: crypto.randomUUID(),
          parcelOid: parcel.parcel_oid,
          previousOwnerOid,
          newOwnerOid: body.newOwnerOid,
          tenureType: parcel.tenure_type,
          authorityRef: body.authorityRef || session.userId,
          transferredAt: now,
        },
      },
      200,
      corsHeaders
    );
  }

  // GET / POST /api/land/disputes and POST /api/land/disputes/resolve
  if (subResource === 'disputes') {
    if (method === 'GET') {
      const parcelOid = url.searchParams.get('parcel_oid');
      const status = url.searchParams.get('status');
      let disputes = [];
      if (env?.DB) {
        let query = 'SELECT * FROM land_disputes WHERE 1=1';
        const params = [];
        if (parcelOid) { query += ' AND parcel_oid = ?'; params.push(parcelOid); }
        if (status) { query += ' AND status = ?'; params.push(status); }
        query += ' ORDER BY filed_at DESC';
        const res = await env.DB.prepare(query).bind(...params).all();
        disputes = res?.results || [];
      } else {
        disputes = memoryDisputes.filter(
          (d) => (!parcelOid || d.parcel_oid === parcelOid) && (!status || d.status === status)
        );
      }
      return json({ disputes, count: disputes.length }, 200, corsHeaders);
    }

    if (method === 'POST' && subAction === 'resolve') {
      const session = await getSession();
      if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

      const body = await request.json().catch(() => null);
      if (!body || !body.disputeId || !body.resolutionStatus) {
        return json({ error: 'disputeId and resolutionStatus are required', status: 400 }, 400, corsHeaders);
      }
      if (!['resolved_restored', 'resolved_dismissed'].includes(body.resolutionStatus)) {
        return json({ error: 'resolutionStatus must be resolved_restored or resolved_dismissed', status: 400 }, 400, corsHeaders);
      }

      const now = new Date().toISOString();
      let dispute = null;
      if (env?.DB) {
        dispute = await env.DB.prepare('SELECT * FROM land_disputes WHERE id = ?')
          .bind(body.disputeId)
          .first();
      } else {
        dispute = memoryDisputes.find((d) => d.id === body.disputeId);
      }
      if (!dispute) return json({ error: 'Dispute not found', status: 404 }, 404, corsHeaders);

      if (env?.DB) {
        await env.DB.prepare(
          'UPDATE land_disputes SET status = ?, resolution_notes = ?, resolved_by_oid = ?, resolved_at = ? WHERE id = ?'
        )
          .bind(body.resolutionStatus, body.resolutionNotes || '', session.userId || null, now, dispute.id)
          .run();

        const remaining = await env.DB.prepare(
          "SELECT COUNT(*) as cnt FROM land_disputes WHERE parcel_oid = ? AND status IN ('open','frozen','under_review')"
        )
          .bind(dispute.parcel_oid)
          .first();
        if (!remaining || Number(remaining.cnt) === 0) {
          if (body.restoredOwnerOid && isValidSudanOid(body.restoredOwnerOid)) {
            await env.DB.prepare(
              "UPDATE land_parcels SET dispute_status = 'clear', owner_oid = ?, updated_at = ? WHERE parcel_oid = ?"
            )
              .bind(body.restoredOwnerOid, now, dispute.parcel_oid)
              .run();
          } else {
            await env.DB.prepare(
              "UPDATE land_parcels SET dispute_status = 'clear', updated_at = ? WHERE parcel_oid = ?"
            )
              .bind(now, dispute.parcel_oid)
              .run();
          }
        }
      } else {
        dispute.status = body.resolutionStatus;
        dispute.resolution_notes = body.resolutionNotes || '';
        dispute.resolved_by_oid = session.userId || null;
        dispute.resolved_at = now;
        const stillOpen = memoryDisputes.some(
          (d) => d.parcel_oid === dispute.parcel_oid && ['open', 'frozen', 'under_review'].includes(d.status)
        );
        if (!stillOpen) {
          const parcel = memoryParcels.find((p) => p.parcel_oid === dispute.parcel_oid);
          if (parcel) {
            parcel.dispute_status = 'clear';
            if (body.restoredOwnerOid && isValidSudanOid(body.restoredOwnerOid)) {
              parcel.owner_oid = body.restoredOwnerOid;
            }
            parcel.updated_at = now;
          }
        }
      }

      return json(
        {
          success: true,
          disputeId: dispute.id,
          parcelOid: dispute.parcel_oid,
          resolutionStatus: body.resolutionStatus,
          parcelDisputeStatus: 'clear',
          resolvedAt: now,
        },
        200,
        corsHeaders
      );
    }

    if (method === 'POST') {
      const session = await getSession();
      if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

      const body = await request.json().catch(() => null);
      if (!body || !body.parcelOid || !body.claimantOid || !body.reason) {
        return json({ error: 'parcelOid, claimantOid, and reason are required', status: 400 }, 400, corsHeaders);
      }
      const disputeType = body.disputeType || 'wartime_displacement';
      if (!VALID_DISPUTE_TYPES.has(disputeType)) {
        return json({ error: `Invalid disputeType: ${disputeType}`, status: 400 }, 400, corsHeaders);
      }

      let parcel = null;
      if (env?.DB) {
        parcel = await env.DB.prepare('SELECT * FROM land_parcels WHERE parcel_oid = ?')
          .bind(body.parcelOid)
          .first();
      } else {
        parcel = memoryParcels.find((p) => p.parcel_oid === body.parcelOid);
      }
      if (!parcel) return json({ error: 'Land parcel not found', status: 404 }, 404, corsHeaders);

      const now = new Date().toISOString();
      const dispute = {
        id: crypto.randomUUID(),
        parcel_oid: body.parcelOid,
        claimant_oid: body.claimantOid,
        dispute_type: disputeType,
        status: 'frozen',
        reason: body.reason,
        evidence_hash: body.evidenceHash || null,
        filed_at: now,
        resolved_at: null,
      };

      if (env?.DB) {
        await env.DB.prepare(
          `INSERT INTO land_disputes
            (id, parcel_oid, claimant_oid, dispute_type, status, reason, evidence_hash, filed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            dispute.id,
            dispute.parcel_oid,
            dispute.claimant_oid,
            dispute.dispute_type,
            dispute.status,
            dispute.reason,
            dispute.evidence_hash,
            dispute.filed_at
          )
          .run();
        await env.DB.prepare(
          "UPDATE land_parcels SET dispute_status = 'frozen', updated_at = ? WHERE parcel_oid = ?"
        )
          .bind(now, body.parcelOid)
          .run();
      } else {
        memoryDisputes.unshift(dispute);
        parcel.dispute_status = 'frozen';
        parcel.updated_at = now;
      }

      return json({ success: true, dispute, parcelDisputeStatus: 'frozen' }, 201, corsHeaders);
    }
  }

  return json({ error: 'Land registry endpoint not found', status: 404 }, 404, corsHeaders);
}
