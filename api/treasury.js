/**
 * Single Treasury Account (STA) & Federal Fiscal Equalization API
 * Aligned with «جمهورية المقرن» (Al-Muqran Republic) Fiscal Constitution:
 *   - Unified append-only SHA-256 hash-chained ledger (sta_ledger)
 *   - Vertical Split: 45% Federal / 50% States Equalization / 5% Sovereign Reserve
 *   - 10% Producing-Region Share for extractive/port resource revenues
 *   - 5-Factor Horizontal Equalization Formula (30% Population, 25% Poverty,
 *     20% War-Damage Affirmative Action, 15% Geographic Area, 10% Fiscal Effort)
 */

export const OID_ROOT = '1.3.6.1.4.1.61026';
export const GENESIS_HASH = '0'.repeat(64);

export const VALID_ENTRY_TYPES = new Set([
  'revenue_customs',
  'revenue_gold_royalty',
  'revenue_port_fee',
  'revenue_tax',
  'revenue_oil_mineral',
  'revenue_other',
  'disbursement_federal',
  'disbursement_state_transfer',
  'disbursement_sovereign_reserve',
]);

export const VERTICAL_SPLIT = Object.freeze({
  federal: 0.45,
  states: 0.50,
  sovereignReserve: 0.05,
  producingRegionRate: 0.10,
});

export const HORIZONTAL_WEIGHTS = Object.freeze({
  population: 0.30,
  povertyIndex: 0.25,
  warDamage: 0.20,
  geographicArea: 0.15,
  fiscalEffort: 0.10,
});

// All 18 Sudanese states with baseline equalization indicators
export const SUDAN_STATES_PROFILE = Object.freeze([
  { code: '01', nameEn: 'Khartoum',       nameAr: 'الخرطوم',       population: 8.5, povertyIndex: 0.35, warDamage: 0.95, geographicArea: 2.2,  fiscalEffort: 0.92 },
  { code: '02', nameEn: 'Red Sea',        nameAr: 'البحر الأحمر',  population: 1.6, povertyIndex: 0.62, warDamage: 0.20, geographicArea: 21.8, fiscalEffort: 0.85 },
  { code: '03', nameEn: 'Kassala',        nameAr: 'كسلا',          population: 2.6, povertyIndex: 0.68, warDamage: 0.25, geographicArea: 5.2,  fiscalEffort: 0.60 },
  { code: '04', nameEn: 'Al Qadarif',     nameAr: 'القضارف',       population: 2.5, povertyIndex: 0.58, warDamage: 0.30, geographicArea: 7.5,  fiscalEffort: 0.72 },
  { code: '05', nameEn: 'River Nile',     nameAr: 'نهر النيل',     population: 1.6, povertyIndex: 0.42, warDamage: 0.22, geographicArea: 12.2, fiscalEffort: 0.80 },
  { code: '06', nameEn: 'Northern',       nameAr: 'الشمالية',      population: 1.0, povertyIndex: 0.38, warDamage: 0.15, geographicArea: 34.8, fiscalEffort: 0.76 },
  { code: '07', nameEn: 'North Kordofan', nameAr: 'شمال كردفان',   population: 3.2, povertyIndex: 0.66, warDamage: 0.78, geographicArea: 18.5, fiscalEffort: 0.55 },
  { code: '08', nameEn: 'South Kordofan', nameAr: 'جنوب كردفان',   population: 2.1, povertyIndex: 0.78, warDamage: 0.85, geographicArea: 15.8, fiscalEffort: 0.45 },
  { code: '09', nameEn: 'West Kordofan',  nameAr: 'غرب كردفان',    population: 1.9, povertyIndex: 0.74, warDamage: 0.72, geographicArea: 11.1, fiscalEffort: 0.58 },
  { code: '10', nameEn: 'Blue Nile',      nameAr: 'النيل الأزرق',  population: 1.2, povertyIndex: 0.80, warDamage: 0.82, geographicArea: 4.5,  fiscalEffort: 0.42 },
  { code: '11', nameEn: 'Sennar',         nameAr: 'سنار',          population: 2.0, povertyIndex: 0.56, warDamage: 0.65, geographicArea: 3.7,  fiscalEffort: 0.64 },
  { code: '12', nameEn: 'White Nile',     nameAr: 'النيل الأبيض',  population: 2.6, povertyIndex: 0.58, warDamage: 0.55, geographicArea: 3.9,  fiscalEffort: 0.66 },
  { code: '13', nameEn: 'North Darfur',   nameAr: 'شمال دارفور',   population: 2.9, povertyIndex: 0.84, warDamage: 0.94, geographicArea: 29.6, fiscalEffort: 0.38 },
  { code: '14', nameEn: 'South Darfur',   nameAr: 'جنوب دارفور',   population: 3.9, povertyIndex: 0.82, warDamage: 0.92, geographicArea: 8.1,  fiscalEffort: 0.42 },
  { code: '15', nameEn: 'West Darfur',    nameAr: 'غرب دارفور',    population: 1.8, povertyIndex: 0.88, warDamage: 0.98, geographicArea: 2.3,  fiscalEffort: 0.32 },
  { code: '16', nameEn: 'Central Darfur', nameAr: 'وسط دارفور',    population: 1.6, povertyIndex: 0.86, warDamage: 0.90, geographicArea: 3.4,  fiscalEffort: 0.35 },
  { code: '17', nameEn: 'East Darfur',    nameAr: 'شرق دارفور',    population: 1.7, povertyIndex: 0.80, warDamage: 0.84, geographicArea: 5.5,  fiscalEffort: 0.40 },
  { code: '18', nameEn: 'Al Jazirah',     nameAr: 'الجزيرة',       population: 5.4, povertyIndex: 0.52, warDamage: 0.88, geographicArea: 2.7,  fiscalEffort: 0.78 },
]);

const VALID_STATE_CODES = new Set(['00', ...SUDAN_STATES_PROFILE.map((s) => s.code)]);

// Fallback STA ledger entries when D1 is empty or unbound (dev/preview mode)
const FALLBACK_LEDGER = [
  {
    id: 'sta-seed-001',
    reference_no: 'STA-2026-PORT-0001',
    entry_type: 'revenue_port_fee',
    ministry_oid: `${OID_ROOT}.4.1.4`,
    state_code: '02',
    payer_or_payee_oid: `${OID_ROOT}.3.02.001.00010`,
    amount_sdg: 420000000,
    currency: 'SDG',
    description: 'Port Sudan Container Terminal Customs & Port Fees',
    status: 'verified',
    prev_hash: GENESIS_HASH,
    entry_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeef1',
    created_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'sta-seed-002',
    reference_no: 'STA-2026-GOLD-0002',
    entry_type: 'revenue_gold_royalty',
    ministry_oid: `${OID_ROOT}.4.1.4`,
    state_code: '05',
    payer_or_payee_oid: `${OID_ROOT}.3.05.002.00044`,
    amount_sdg: 680000000,
    currency: 'SDG',
    description: 'River Nile Licensed Gold Refinery Royalty',
    status: 'verified',
    prev_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeef1',
    entry_hash: 'b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeef002',
    created_at: '2026-01-16T10:30:00.000Z',
  },
  {
    id: 'sta-seed-003',
    reference_no: 'STA-2026-CUST-0003',
    entry_type: 'revenue_customs',
    ministry_oid: `${OID_ROOT}.4.1.4`,
    state_code: '01',
    payer_or_payee_oid: `${OID_ROOT}.3.01.001.00120`,
    amount_sdg: 350000000,
    currency: 'SDG',
    description: 'Federal Customs Digital Clearance Settlement',
    status: 'verified',
    prev_hash: 'b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeef002',
    entry_hash: 'c3d4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeef00003',
    created_at: '2026-01-18T12:15:00.000Z',
  },
  {
    id: 'sta-seed-004',
    reference_no: 'STA-2026-XFER-0004',
    entry_type: 'disbursement_state_transfer',
    ministry_oid: `${OID_ROOT}.4.1.4`,
    state_code: '15',
    payer_or_payee_oid: `${OID_ROOT}.4.3.15`,
    amount_sdg: 180000000,
    currency: 'SDG',
    description: 'West Darfur Q1 War-Damage Reconstruction & Equalization Transfer',
    status: 'verified',
    prev_hash: 'c3d4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeef00003',
    entry_hash: 'd4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeef0000004',
    created_at: '2026-01-20T09:00:00.000Z',
  },
];

// In-memory store used only when env.DB is not bound
const memoryLedger = [...FALLBACK_LEDGER];

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeStaEntryHash(prevHash, entry) {
  const canonical = [
    prevHash || GENESIS_HASH,
    entry.reference_no,
    entry.entry_type,
    entry.ministry_oid,
    entry.state_code,
    String(entry.amount_sdg),
    entry.created_at,
  ].join('|');
  return sha256Hex(canonical);
}

/**
 * Pure Federal Fiscal Equalization Calculator («جمهورية المقرن»).
 *
 * Vertical Distribution:
 *   - First, 10% of qualifying producing-region resource revenues is ring-fenced
 *     directly for the producing states (producingRegionShare).
 *   - The remaining distributable pool is split:
 *       45% Federal Government
 *       50% States Horizontal Equalization Pool
 *        5% Sovereign Future Generations Reserve
 *
 * Horizontal Distribution across the 18 States (5-factor formula):
 *   - 30% Population
 *   - 25% Poverty / Deprivation Index
 *   - 20% War-Damage Affirmative Action
 *   - 15% Geographic Area
 *   - 10% Local Fiscal Effort
 */
export function calculateFederalEqualization({
  totalPoolSdg,
  producingResourceRevenues = [],
  states = SUDAN_STATES_PROFILE,
  weights = HORIZONTAL_WEIGHTS,
} = {}) {
  const pool = Number(totalPoolSdg);
  if (!Number.isFinite(pool) || pool <= 0) {
    throw new Error('totalPoolSdg must be a positive number');
  }

  // Validate horizontal weights sum to 1.0 (within float tolerance)
  const weightSum =
    Number(weights.population || 0) +
    Number(weights.povertyIndex || 0) +
    Number(weights.warDamage || 0) +
    Number(weights.geographicArea || 0) +
    Number(weights.fiscalEffort || 0);
  if (Math.abs(weightSum - 1) > 0.001) {
    throw new Error(`Horizontal equalization weights must sum to 1.0 (got ${weightSum})`);
  }

  // Step 1: 10% producing-region resource share
  const producingBonusByState = new Map();
  let totalProducingRevenue = 0;
  let totalProducingRegionShareSdg = 0;

  for (const item of producingResourceRevenues) {
    const amount = Number(item?.amountSdg || 0);
    const code = String(item?.stateCode || '');
    if (amount > 0 && VALID_STATE_CODES.has(code) && code !== '00') {
      const bonus = round2(amount * VERTICAL_SPLIT.producingRegionRate);
      totalProducingRevenue += amount;
      totalProducingRegionShareSdg = round2(totalProducingRegionShareSdg + bonus);
      producingBonusByState.set(code, round2((producingBonusByState.get(code) || 0) + bonus));
    }
  }

  if (totalProducingRegionShareSdg > pool) {
    throw new Error('Producing-region 10% share exceeds totalPoolSdg');
  }

  // Step 2: Vertical split (45% Federal / 50% States / 5% Sovereign Reserve)
  const distributablePoolSdg = round2(pool - totalProducingRegionShareSdg);
  const federalShareSdg = round2(distributablePoolSdg * VERTICAL_SPLIT.federal);
  const statesPoolSdg = round2(distributablePoolSdg * VERTICAL_SPLIT.states);
  const sovereignReserveSdg = round2(distributablePoolSdg - federalShareSdg - statesPoolSdg);

  // Step 3: 5-factor horizontal equalization across states
  const totals = states.reduce(
    (acc, s) => ({
      population: acc.population + Number(s.population || 0),
      povertyIndex: acc.povertyIndex + Number(s.povertyIndex || 0),
      warDamage: acc.warDamage + Number(s.warDamage || 0),
      geographicArea: acc.geographicArea + Number(s.geographicArea || 0),
      fiscalEffort: acc.fiscalEffort + Number(s.fiscalEffort || 0),
    }),
    { population: 0, povertyIndex: 0, warDamage: 0, geographicArea: 0, fiscalEffort: 0 }
  );

  const stateAllocations = states.map((s) => {
    const popShare = totals.population > 0 ? s.population / totals.population : 0;
    const povShare = totals.povertyIndex > 0 ? s.povertyIndex / totals.povertyIndex : 0;
    const warShare = totals.warDamage > 0 ? s.warDamage / totals.warDamage : 0;
    const areaShare = totals.geographicArea > 0 ? s.geographicArea / totals.geographicArea : 0;
    const effortShare = totals.fiscalEffort > 0 ? s.fiscalEffort / totals.fiscalEffort : 0;

    const compositeFactor =
      popShare * weights.population +
      povShare * weights.povertyIndex +
      warShare * weights.warDamage +
      areaShare * weights.geographicArea +
      effortShare * weights.fiscalEffort;

    const horizontalShareSdg = round2(statesPoolSdg * compositeFactor);
    const producingRegionShareSdg = producingBonusByState.get(s.code) || 0;
    const totalTransferSdg = round2(horizontalShareSdg + producingRegionShareSdg);

    return {
      stateCode: s.code,
      nameEn: s.nameEn,
      nameAr: s.nameAr,
      compositeFactorPct: round2(compositeFactor * 100),
      warDamageIndex: s.warDamage,
      horizontalShareSdg,
      producingRegionShareSdg,
      totalTransferSdg,
    };
  });

  // Sort by totalTransferSdg descending for executive clarity
  stateAllocations.sort((a, b) => b.totalTransferSdg - a.totalTransferSdg);

  return {
    formulaVersion: 'muqran-v1',
    totalPoolSdg: pool,
    producingResourceRevenueSdg: round2(totalProducingRevenue),
    producingRegionShareRate: VERTICAL_SPLIT.producingRegionRate,
    totalProducingRegionShareSdg,
    distributablePoolSdg,
    verticalSplit: {
      federalPct: 45,
      statesPct: 50,
      sovereignReservePct: 5,
      federalShareSdg,
      statesPoolSdg,
      sovereignReserveSdg,
    },
    horizontalWeights: {
      populationPct: round2(weights.population * 100),
      povertyIndexPct: round2(weights.povertyIndex * 100),
      warDamagePct: round2(weights.warDamage * 100),
      geographicAreaPct: round2(weights.geographicArea * 100),
      fiscalEffortPct: round2(weights.fiscalEffort * 100),
    },
    stateAllocations,
  };
}

function summarizeLedgerRows(rows) {
  const revenuesBySource = {
    revenue_customs: 0,
    revenue_gold_royalty: 0,
    revenue_port_fee: 0,
    revenue_tax: 0,
    revenue_oil_mineral: 0,
    revenue_other: 0,
  };
  const disbursementsByType = {
    disbursement_federal: 0,
    disbursement_state_transfer: 0,
    disbursement_sovereign_reserve: 0,
  };
  const stateTransfers = {};

  let totalRevenueSdg = 0;
  let totalDisbursementsSdg = 0;

  for (const row of rows) {
    const amount = Number(row.amount_sdg || 0);
    if (row.entry_type.startsWith('revenue_')) {
      totalRevenueSdg = round2(totalRevenueSdg + amount);
      revenuesBySource[row.entry_type] = round2((revenuesBySource[row.entry_type] || 0) + amount);
    } else {
      totalDisbursementsSdg = round2(totalDisbursementsSdg + amount);
      disbursementsByType[row.entry_type] = round2((disbursementsByType[row.entry_type] || 0) + amount);
      if (row.entry_type === 'disbursement_state_transfer' && row.state_code && row.state_code !== '00') {
        stateTransfers[row.state_code] = round2((stateTransfers[row.state_code] || 0) + amount);
      }
    }
  }

  const latest = rows.length > 0 ? rows[rows.length - 1] : null;
  const netBalanceSdg = round2(totalRevenueSdg - totalDisbursementsSdg);

  return {
    totalRevenueSdg,
    totalDisbursementsSdg,
    netBalanceSdg,
    entryCount: rows.length,
    latestEntryHash: latest ? latest.entry_hash : GENESIS_HASH,
    revenuesBySource,
    disbursementsByType,
    stateTransfers,
  };
}

function json(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Powered-By': 'Cloudflare Workers', ...corsHeaders },
  });
}

export async function getTreasurySummaryData(env) {
  let rows = [];
  let source = 'fallback';
  if (env?.DB) {
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM sta_ledger ORDER BY created_at ASC'
      ).all();
      rows = res?.results || [];
      source = rows.length > 0 ? 'd1' : 'd1_empty_fallback';
    } catch (_) {
      rows = [];
    }
  }
  if (rows.length === 0) {
    rows = env?.DB ? FALLBACK_LEDGER : memoryLedger;
  }

  const summary = summarizeLedgerRows(rows);
  const equalizationPreview = calculateFederalEqualization({
    totalPoolSdg: Math.max(summary.totalRevenueSdg, 1000000000),
    producingResourceRevenues: [
      { stateCode: '02', amountSdg: summary.revenuesBySource.revenue_port_fee || 0, resource: 'port_fee' },
      { stateCode: '05', amountSdg: summary.revenuesBySource.revenue_gold_royalty || 0, resource: 'gold_royalty' },
    ],
  });

  return {
    ...summary,
    source,
    equalizationPreview,
    generatedAt: new Date().toISOString(),
  };
}

export async function handleTreasury(request, env, { subResource, method, url, corsHeaders, getSession }) {
  // GET /api/treasury/summary
  if ((subResource === 'summary' || !subResource) && method === 'GET') {
    const data = await getTreasurySummaryData(env);
    return json(data, 200, corsHeaders);
  }

  // GET /api/treasury/ledger
  if (subResource === 'ledger' && method === 'GET') {
    const stateCode = url.searchParams.get('state_code');
    const entryType = url.searchParams.get('entry_type');
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

    let rows = [];
    if (env?.DB) {
      let query = 'SELECT * FROM sta_ledger WHERE 1=1';
      const params = [];
      if (stateCode) {
        query += ' AND state_code = ?';
        params.push(stateCode);
      }
      if (entryType) {
        query += ' AND entry_type = ?';
        params.push(entryType);
      }
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);
      const res = await env.DB.prepare(query).bind(...params).all();
      rows = res?.results || [];
    } else {
      rows = memoryLedger
        .filter((r) => (!stateCode || r.state_code === stateCode) && (!entryType || r.entry_type === entryType))
        .slice(-limit)
        .reverse();
    }

    return json({ entries: rows, count: rows.length }, 200, corsHeaders);
  }

  // POST /api/treasury/entry (authenticated)
  if (subResource === 'entry' && method === 'POST') {
    const session = await getSession();
    if (!session) {
      return json({ error: 'Unauthorized', status: 401 }, 401, corsHeaders);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return json({ error: 'Invalid JSON body', status: 400 }, 400, corsHeaders);
    }

    const {
      referenceNo,
      entryType,
      ministryOid = `${OID_ROOT}.4.1.4`,
      stateCode = '00',
      payerOrPayeeOid = null,
      amountSdg,
      currency = 'SDG',
      description = '',
    } = body;

    if (!VALID_ENTRY_TYPES.has(entryType)) {
      return json({ error: `Invalid entryType: ${entryType}`, status: 400 }, 400, corsHeaders);
    }
    if (!VALID_STATE_CODES.has(String(stateCode))) {
      return json({ error: `Invalid stateCode: ${stateCode}. Must be '00' or '01'..'18'`, status: 400 }, 400, corsHeaders);
    }
    const numericAmount = Number(amountSdg);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return json({ error: 'amountSdg must be a positive number', status: 400 }, 400, corsHeaders);
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const refNo = referenceNo || `STA-${createdAt.slice(0, 4)}-${id.slice(0, 8).toUpperCase()}`;

    let prevHash = GENESIS_HASH;
    if (env?.DB) {
      const latest = await env.DB.prepare(
        'SELECT entry_hash FROM sta_ledger ORDER BY created_at DESC LIMIT 1'
      ).first();
      if (latest?.entry_hash) prevHash = latest.entry_hash;
    } else if (memoryLedger.length > 0) {
      prevHash = memoryLedger[memoryLedger.length - 1].entry_hash;
    }

    const entry = {
      id,
      reference_no: refNo,
      entry_type: entryType,
      ministry_oid: ministryOid,
      state_code: String(stateCode),
      payer_or_payee_oid: payerOrPayeeOid,
      amount_sdg: round2(numericAmount),
      currency,
      description,
      status: 'posted',
      prev_hash: prevHash,
      created_at: createdAt,
    };
    entry.entry_hash = await computeStaEntryHash(prevHash, entry);

    if (env?.DB) {
      await env.DB.prepare(
        `INSERT INTO sta_ledger
          (id, reference_no, entry_type, ministry_oid, state_code, payer_or_payee_oid,
           amount_sdg, currency, description, status, prev_hash, entry_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          entry.id,
          entry.reference_no,
          entry.entry_type,
          entry.ministry_oid,
          entry.state_code,
          entry.payer_or_payee_oid,
          entry.amount_sdg,
          entry.currency,
          entry.description,
          entry.status,
          entry.prev_hash,
          entry.entry_hash,
          entry.created_at
        )
        .run();
    } else {
      memoryLedger.push(entry);
    }

    return json({ success: true, entry }, 201, corsHeaders);
  }

  // GET or POST /api/treasury/equalization
  if (subResource === 'equalization' && (method === 'GET' || method === 'POST')) {
    try {
      let payload;
      if (method === 'GET') {
        const pool = Number(url.searchParams.get('pool') || 1000000000);
        payload = { totalPoolSdg: pool };
      } else {
        payload = (await request.json().catch(() => null)) || {};
      }

      const result = calculateFederalEqualization({
        totalPoolSdg: payload.totalPoolSdg ?? 1000000000,
        producingResourceRevenues: payload.producingResourceRevenues || [],
        states: payload.states || SUDAN_STATES_PROFILE,
        weights: payload.weights || HORIZONTAL_WEIGHTS,
      });

      if (method === 'POST' && payload.persist && env?.DB) {
        const session = await getSession();
        if (!session) {
          return json({ error: 'Unauthorized to persist allocation', status: 401 }, 401, corsHeaders);
        }
        const allocId = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const entryHash = await sha256Hex(
          `${allocId}|${result.totalPoolSdg}|${result.verticalSplit.federalShareSdg}|${createdAt}`
        );
        await env.DB.prepare(
          `INSERT INTO federal_allocations
            (id, fiscal_year, period, total_pool_sdg, federal_share_sdg, states_share_sdg,
             sovereign_reserve_sdg, producing_region_bonus_sdg, formula_version,
             state_breakdown_json, computed_by_oid, entry_hash, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            allocId,
            Number(payload.fiscalYear || new Date().getUTCFullYear()),
            String(payload.period || `${new Date().getUTCFullYear()}-FY`),
            result.totalPoolSdg,
            result.verticalSplit.federalShareSdg,
            result.verticalSplit.statesPoolSdg,
            result.verticalSplit.sovereignReserveSdg,
            result.totalProducingRegionShareSdg,
            result.formulaVersion,
            JSON.stringify(result.stateAllocations),
            session.userId || null,
            entryHash,
            createdAt
          )
          .run();
        result.persistedId = allocId;
        result.entryHash = entryHash;
      }

      return json(result, 200, corsHeaders);
    } catch (err) {
      return json({ error: err.message || 'Equalization calculation error', status: 400 }, 400, corsHeaders);
    }
  }

  return json({ error: 'Treasury endpoint not found', status: 404 }, 404, corsHeaders);
}
