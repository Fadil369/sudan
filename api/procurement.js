/**
 * Open e-Procurement (OCDS) & Beneficial Ownership Conflict-of-Interest API
 * Aligned with «جمهورية المقرن» Anti-Corruption Architecture:
 *   - Open Contracting Data Standard (OCDS) tender lifecycle
 *   - SHA-256 sealed bid commitments
 *   - Automated Beneficial Ownership (UBO) conflict-of-interest gate:
 *     blocks & flags bids when bidder UBO matches a public official,
 *     sanctioned entity, or military commercial affiliate.
 */

export const OID_ROOT = '1.3.6.1.4.1.61026';

const VALID_STATUSES = new Set(['planning', 'open', 'evaluation', 'awarded', 'cancelled']);
const VALID_CATEGORIES = new Set(['goods', 'works', 'services', 'consulting']);

const FALLBACK_BENEFICIAL_OWNERS = [
  {
    id: 'ubo-watch-001',
    owner_oid: `${OID_ROOT}.2.01.001.900000001.7`,
    full_name_ar: 'شركة واجهة تابعة لمؤسسة عسكرية تجارية',
    full_name_en: 'Military Commercial Holding Affiliate',
    entity_oid: `${OID_ROOT}.3.01.001.77001`,
    ownership_pct: 100,
    is_public_official: 0,
    official_ministry_oid: null,
    is_sanctioned: 0,
    is_military_commercial_affiliate: 1,
    affiliation_note: 'Prohibited under Civilian Procurement Act — military commercial affiliate',
  },
  {
    id: 'ubo-watch-002',
    owner_oid: `${OID_ROOT}.2.01.001.900000002.4`,
    full_name_ar: 'مسؤول حكومي بوزارة البنية التحتية',
    full_name_en: 'Ministry of Infrastructure Senior Official',
    entity_oid: `${OID_ROOT}.3.01.001.77002`,
    ownership_pct: 60,
    is_public_official: 1,
    official_ministry_oid: `${OID_ROOT}.4.1.7`,
    is_sanctioned: 0,
    is_military_commercial_affiliate: 0,
    affiliation_note: 'Active public official — conflict of interest',
  },
  {
    id: 'ubo-watch-003',
    owner_oid: `${OID_ROOT}.2.02.001.900000003.1`,
    full_name_ar: 'كيان خاضع لعقوبات مالية',
    full_name_en: 'Sanctioned Shell Beneficiary',
    entity_oid: `${OID_ROOT}.3.02.001.77003`,
    ownership_pct: 100,
    is_public_official: 0,
    official_ministry_oid: null,
    is_sanctioned: 1,
    is_military_commercial_affiliate: 0,
    affiliation_note: 'Sanctioned under Anti-Corruption & Asset Recovery Registry',
  },
];

const FALLBACK_TENDERS = [
  {
    id: 'tender-seed-001',
    ocid: 'ocds-sd-2026-0001',
    title_ar: 'إعادة تأهيل محطة مياه الخرطوم بحري',
    title_en: 'Khartoum North Water Treatment Plant Rehabilitation',
    ministry_oid: `${OID_ROOT}.4.1.7`,
    state_code: '01',
    category: 'works',
    budget_sdg: 450000000,
    currency: 'SDG',
    status: 'open',
    closing_date: '2026-06-30',
    awarded_vendor_oid: null,
    award_amount_sdg: null,
    bid_count: 3,
    flagged_bid_count: 1,
    created_at: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'tender-seed-002',
    ocid: 'ocds-sd-2026-0002',
    title_ar: 'توريد منظومات طاقة شمسية لمستشفيات دارفور',
    title_en: 'Solar Microgrid Supply for Darfur Regional Hospitals',
    ministry_oid: `${OID_ROOT}.4.1.2`,
    state_code: '13',
    category: 'goods',
    budget_sdg: 290000000,
    currency: 'SDG',
    status: 'open',
    closing_date: '2026-07-15',
    awarded_vendor_oid: null,
    award_amount_sdg: null,
    bid_count: 4,
    flagged_bid_count: 0,
    created_at: '2026-01-14T11:30:00.000Z',
  },
  {
    id: 'tender-seed-003',
    ocid: 'ocds-sd-2026-0003',
    title_ar: 'تطوير قنوات الري الرقمية بمشروع الجزيرة',
    title_en: 'Al Jazirah Scheme Digital Irrigation Telemetry Upgrade',
    ministry_oid: `${OID_ROOT}.4.1.5`,
    state_code: '18',
    category: 'services',
    budget_sdg: 175000000,
    currency: 'SDG',
    status: 'awarded',
    closing_date: '2026-02-28',
    awarded_vendor_oid: `${OID_ROOT}.3.18.001.00412`,
    award_amount_sdg: 162500000,
    bid_count: 5,
    flagged_bid_count: 1,
    created_at: '2026-01-05T08:15:00.000Z',
  },
];

const memoryTenders = [...FALLBACK_TENDERS];
const memoryOwners = [...FALLBACK_BENEFICIAL_OWNERS];
const memoryBids = [];

async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function json(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Powered-By': 'Cloudflare Workers', ...corsHeaders },
  });
}

/**
 * Pure Conflict-of-Interest Evaluator.
 * Blocks/flags any bid whose Beneficial Owner (UBO) or Vendor OID matches:
 *   1. A sanctioned entity
 *   2. A military commercial affiliate
 *   3. A public official (especially within the procuring ministry)
 *   4. A registered government official/admin/auditor in the `users` table
 */
export function evaluateBidConflict({ tender, bid, beneficialOwners = [], officialUsers = [] }) {
  const reasons = [];
  const codes = [];

  const uboMatches = beneficialOwners.filter(
    (o) =>
      o.owner_oid === bid.beneficialOwnerOid ||
      (o.entity_oid && o.entity_oid === bid.vendorOid)
  );

  for (const owner of uboMatches) {
    if (Number(owner.is_sanctioned) === 1) {
      codes.push('sanctioned_entity');
      reasons.push(`Sanctioned beneficial owner detected (${owner.owner_oid})`);
    }
    if (Number(owner.is_military_commercial_affiliate) === 1) {
      codes.push('military_commercial_affiliate');
      reasons.push(`Military commercial affiliate prohibited from civilian procurement (${owner.owner_oid})`);
    }
    if (Number(owner.is_public_official) === 1) {
      const sameMinistry = owner.official_ministry_oid && tender?.ministry_oid === owner.official_ministry_oid;
      codes.push(sameMinistry ? 'procuring_ministry_official' : 'public_official_conflict');
      reasons.push(
        sameMinistry
          ? `Direct conflict: UBO ${owner.owner_oid} is an official in procuring ministry ${tender.ministry_oid}`
          : `Public official conflict of interest (${owner.owner_oid})`
      );
    }
  }

  const officialUserMatch = officialUsers.find(
    (u) =>
      u.oid === bid.beneficialOwnerOid &&
      ['official', 'admin', 'super_admin', 'auditor'].includes(u.role)
  );
  if (officialUserMatch) {
    codes.push('government_official_user');
    reasons.push(
      `Government ${officialUserMatch.role} account (${officialUserMatch.oid}) matched bidder beneficial owner`
    );
  }

  const conflictFlagged = reasons.length > 0;
  return {
    conflictFlagged,
    blocked: conflictFlagged,
    codes: [...new Set(codes)],
    reasons,
    reasonSummary: reasons.join('; ') || null,
  };
}

export async function handleProcurement(request, env, { subResource, method, url, corsHeaders, getSession }) {
  // GET /api/procurement/tenders
  if ((subResource === 'tenders' || !subResource) && method === 'GET') {
    const stateCode = url.searchParams.get('state_code');
    const status = url.searchParams.get('status');

    let tenders = [];
    if (env?.DB) {
      let query = 'SELECT * FROM procurement_tenders WHERE 1=1';
      const params = [];
      if (stateCode) {
        query += ' AND state_code = ?';
        params.push(stateCode);
      }
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      query += ' ORDER BY created_at DESC';
      const res = await env.DB.prepare(query).bind(...params).all();
      tenders = res?.results || [];
    } else {
      tenders = memoryTenders.filter(
        (t) => (!stateCode || t.state_code === stateCode) && (!status || t.status === status)
      );
    }

    if (tenders.length === 0 && !stateCode && !status && !env?.DB) {
      tenders = FALLBACK_TENDERS;
    }

    return json({ ocdsVersion: '1.1', tenders, count: tenders.length }, 200, corsHeaders);
  }

  // POST /api/procurement/tenders (authenticated)
  if (subResource === 'tenders' && method === 'POST') {
    const session = await getSession();
    if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body', status: 400 }, 400, corsHeaders);

    const {
      titleAr,
      titleEn,
      ministryOid,
      stateCode = '00',
      category = 'works',
      budgetSdg,
      closingDate = null,
      status = 'open',
    } = body;

    if (!titleAr || !titleEn || !ministryOid) {
      return json({ error: 'titleAr, titleEn, and ministryOid are required', status: 400 }, 400, corsHeaders);
    }
    const budget = Number(budgetSdg);
    if (!Number.isFinite(budget) || budget <= 0) {
      return json({ error: 'budgetSdg must be a positive number', status: 400 }, 400, corsHeaders);
    }
    if (!VALID_CATEGORIES.has(category)) {
      return json({ error: `Invalid category: ${category}`, status: 400 }, 400, corsHeaders);
    }
    if (!VALID_STATUSES.has(status)) {
      return json({ error: `Invalid status: ${status}`, status: 400 }, 400, corsHeaders);
    }

    const id = crypto.randomUUID();
    const year = new Date().getUTCFullYear();
    const ocid = body.ocid || `ocds-sd-${year}-${id.slice(0, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    const tender = {
      id,
      ocid,
      title_ar: titleAr,
      title_en: titleEn,
      ministry_oid: ministryOid,
      state_code: String(stateCode),
      category,
      budget_sdg: budget,
      currency: 'SDG',
      status,
      closing_date: closingDate,
      awarded_vendor_oid: null,
      award_amount_sdg: null,
      created_at: now,
      updated_at: now,
    };

    if (env?.DB) {
      await env.DB.prepare(
        `INSERT INTO procurement_tenders
          (id, ocid, title_ar, title_en, ministry_oid, state_code, category,
           budget_sdg, currency, status, closing_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          tender.id,
          tender.ocid,
          tender.title_ar,
          tender.title_en,
          tender.ministry_oid,
          tender.state_code,
          tender.category,
          tender.budget_sdg,
          tender.currency,
          tender.status,
          tender.closing_date,
          tender.created_at,
          tender.updated_at
        )
        .run();
    } else {
      memoryTenders.unshift(tender);
    }

    return json({ success: true, tender }, 201, corsHeaders);
  }

  // GET /api/procurement/bids
  if (subResource === 'bids' && method === 'GET') {
    const tenderId = url.searchParams.get('tender_id');
    const ocid = url.searchParams.get('ocid');
    let bids = [];

    if (env?.DB) {
      let query = 'SELECT * FROM procurement_bids WHERE 1=1';
      const params = [];
      if (tenderId) {
        query += ' AND tender_id = ?';
        params.push(tenderId);
      }
      if (ocid) {
        query += ' AND ocid = ?';
        params.push(ocid);
      }
      query += ' ORDER BY submitted_at DESC';
      const res = await env.DB.prepare(query).bind(...params).all();
      bids = res?.results || [];
    } else {
      bids = memoryBids.filter(
        (b) => (!tenderId || b.tender_id === tenderId) && (!ocid || b.ocid === ocid)
      );
    }

    return json({ bids, count: bids.length }, 200, corsHeaders);
  }

  // POST /api/procurement/bids (authenticated + automated UBO conflict-of-interest gate)
  if (subResource === 'bids' && method === 'POST') {
    const session = await getSession();
    if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body', status: 400 }, 400, corsHeaders);

    const { tenderId, ocid, vendorOid, vendorName, beneficialOwnerOid, bidAmountSdg } = body;
    if ((!tenderId && !ocid) || !vendorOid || !vendorName || !beneficialOwnerOid) {
      return json(
        { error: 'tenderId (or ocid), vendorOid, vendorName, and beneficialOwnerOid are required', status: 400 },
        400,
        corsHeaders
      );
    }
    const amount = Number(bidAmountSdg);
    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ error: 'bidAmountSdg must be a positive number', status: 400 }, 400, corsHeaders);
    }

    // Lookup tender
    let tender = null;
    if (env?.DB) {
      tender = tenderId
        ? await env.DB.prepare('SELECT * FROM procurement_tenders WHERE id = ?').bind(tenderId).first()
        : await env.DB.prepare('SELECT * FROM procurement_tenders WHERE ocid = ?').bind(ocid).first();
    } else {
      tender = memoryTenders.find((t) => (tenderId && t.id === tenderId) || (ocid && t.ocid === ocid));
    }

    if (!tender) {
      return json({ error: 'Tender not found', status: 404 }, 404, corsHeaders);
    }
    if (tender.status !== 'open') {
      return json({ error: `Tender is not open for bidding (status: ${tender.status})`, status: 409 }, 409, corsHeaders);
    }

    // Query Beneficial Ownership registry & government officials table
    let beneficialOwners = [];
    let officialUsers = [];
    if (env?.DB) {
      const uboRes = await env.DB.prepare(
        'SELECT * FROM beneficial_owners WHERE owner_oid = ? OR entity_oid = ?'
      )
        .bind(beneficialOwnerOid, vendorOid)
        .all()
        .catch(() => ({ results: [] }));
      beneficialOwners = uboRes?.results || [];

      const userRes = await env.DB.prepare(
        'SELECT id, oid, role, ministry_id FROM users WHERE oid = ?'
      )
        .bind(beneficialOwnerOid)
        .all()
        .catch(() => ({ results: [] }));
      officialUsers = userRes?.results || [];
    } else {
      beneficialOwners = memoryOwners;
    }

    const evaluation = evaluateBidConflict({
      tender,
      bid: { vendorOid, beneficialOwnerOid },
      beneficialOwners,
      officialUsers,
    });

    const bidId = crypto.randomUUID();
    const submittedAt = new Date().toISOString();
    const sealedHash = await sha256Hex(
      `${tender.id}|${tender.ocid}|${vendorOid}|${beneficialOwnerOid}|${amount}|${submittedAt}`
    );

    const bid = {
      id: bidId,
      tender_id: tender.id,
      ocid: tender.ocid,
      vendor_oid: vendorOid,
      vendor_name: vendorName,
      beneficial_owner_oid: beneficialOwnerOid,
      bid_amount_sdg: amount,
      sealed_hash: sealedHash,
      status: evaluation.blocked ? 'blocked' : 'submitted',
      conflict_flagged: evaluation.conflictFlagged ? 1 : 0,
      conflict_reason: evaluation.reasonSummary,
      submitted_at: submittedAt,
    };

    if (env?.DB) {
      await env.DB.prepare(
        `INSERT INTO procurement_bids
          (id, tender_id, ocid, vendor_oid, vendor_name, beneficial_owner_oid,
           bid_amount_sdg, sealed_hash, status, conflict_flagged, conflict_reason, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          bid.id,
          bid.tender_id,
          bid.ocid,
          bid.vendor_oid,
          bid.vendor_name,
          bid.beneficial_owner_oid,
          bid.bid_amount_sdg,
          bid.sealed_hash,
          bid.status,
          bid.conflict_flagged,
          bid.conflict_reason,
          bid.submitted_at
        )
        .run();
    } else {
      memoryBids.push(bid);
    }

    if (evaluation.blocked) {
      return json(
        {
          success: false,
          blocked: true,
          conflictFlagged: true,
          codes: evaluation.codes,
          reasons: evaluation.reasons,
          error: 'Bid blocked by Beneficial Ownership conflict-of-interest screen',
          bid,
        },
        409,
        corsHeaders
      );
    }

    return json({ success: true, blocked: false, conflictFlagged: false, bid }, 201, corsHeaders);
  }

  // GET / POST /api/procurement/beneficial-owners
  if (subResource === 'beneficial-owners') {
    if (method === 'GET') {
      let owners = [];
      if (env?.DB) {
        const res = await env.DB.prepare('SELECT * FROM beneficial_owners ORDER BY created_at DESC').all();
        owners = res?.results || [];
      } else {
        owners = memoryOwners;
      }
      return json({ beneficialOwners: owners, count: owners.length }, 200, corsHeaders);
    }

    if (method === 'POST') {
      const session = await getSession();
      if (!session) return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);

      const body = await request.json().catch(() => null);
      if (!body || !body.ownerOid || !body.fullNameAr || !body.fullNameEn) {
        return json({ error: 'ownerOid, fullNameAr, and fullNameEn are required', status: 400 }, 400, corsHeaders);
      }

      const owner = {
        id: crypto.randomUUID(),
        owner_oid: body.ownerOid,
        full_name_ar: body.fullNameAr,
        full_name_en: body.fullNameEn,
        entity_oid: body.entityOid || null,
        ownership_pct: Number(body.ownershipPct ?? 100),
        is_public_official: body.isPublicOfficial ? 1 : 0,
        official_ministry_oid: body.officialMinistryOid || null,
        is_sanctioned: body.isSanctioned ? 1 : 0,
        is_military_commercial_affiliate: body.isMilitaryCommercialAffiliate ? 1 : 0,
        affiliation_note: body.affiliationNote || null,
        created_at: new Date().toISOString(),
      };

      if (env?.DB) {
        await env.DB.prepare(
          `INSERT INTO beneficial_owners
            (id, owner_oid, full_name_ar, full_name_en, entity_oid, ownership_pct,
             is_public_official, official_ministry_oid, is_sanctioned,
             is_military_commercial_affiliate, affiliation_note, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            owner.id,
            owner.owner_oid,
            owner.full_name_ar,
            owner.full_name_en,
            owner.entity_oid,
            owner.ownership_pct,
            owner.is_public_official,
            owner.official_ministry_oid,
            owner.is_sanctioned,
            owner.is_military_commercial_affiliate,
            owner.affiliation_note,
            owner.created_at
          )
          .run();
      } else {
        memoryOwners.push(owner);
      }

      return json({ success: true, beneficialOwner: owner }, 201, corsHeaders);
    }
  }

  return json({ error: 'Procurement endpoint not found', status: 404 }, 404, corsHeaders);
}
