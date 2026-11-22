import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { webcrypto } from 'node:crypto';
import worker from '../../api/index.js';
import { calculateFederalEqualization, GENESIS_HASH } from '../../api/treasury.js';
import { evaluateBidConflict } from '../../api/procurement.js';

// Ensure real WebCrypto (SHA-256, HMAC-SHA256, randomUUID) is used instead of jsdom's setupTests stub
beforeAll(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
});

/**
 * Lightweight stateful in-memory D1 mock tailored for the governance tables
 * (sta_ledger, federal_allocations, procurement_tenders, procurement_bids,
 * beneficial_owners, users, land_parcels, land_disputes, citizen_consent_receipts).
 */
function createMockD1() {
  const tables = {
    sta_ledger: [],
    federal_allocations: [],
    procurement_tenders: [],
    procurement_bids: [],
    beneficial_owners: [],
    users: [],
    land_parcels: [],
    land_disputes: [],
    citizen_consent_receipts: [],
  };

  function runQuery(sql, params) {
    const q = sql.replace(/\s+/g, ' ').trim();

    // ─── sta_ledger ──────────────────────────────────────────
    if (q.startsWith('INSERT INTO sta_ledger')) {
      const [
        id, reference_no, entry_type, ministry_oid, state_code, payer_or_payee_oid,
        amount_sdg, currency, description, status, prev_hash, entry_hash, created_at,
      ] = params;
      tables.sta_ledger.push({
        id, reference_no, entry_type, ministry_oid, state_code, payer_or_payee_oid,
        amount_sdg, currency, description, status, prev_hash, entry_hash, created_at,
      });
      return { success: true };
    }
    if (q.startsWith('SELECT entry_hash FROM sta_ledger ORDER BY created_at DESC LIMIT 1')) {
      const last = tables.sta_ledger[tables.sta_ledger.length - 1] || null;
      return { first: last };
    }
    if (q.startsWith('SELECT * FROM sta_ledger')) {
      let rows = [...tables.sta_ledger];
      if (q.includes('ORDER BY created_at DESC')) rows.reverse();
      return { results: rows };
    }

    // ─── federal_allocations ─────────────────────────────────
    if (q.startsWith('INSERT INTO federal_allocations')) {
      const [
        id, fiscal_year, period, total_pool_sdg, federal_share_sdg, states_share_sdg,
        sovereign_reserve_sdg, producing_region_bonus_sdg, formula_version,
        state_breakdown_json, computed_by_oid, entry_hash, created_at,
      ] = params;
      tables.federal_allocations.push({
        id, fiscal_year, period, total_pool_sdg, federal_share_sdg, states_share_sdg,
        sovereign_reserve_sdg, producing_region_bonus_sdg, formula_version,
        state_breakdown_json, computed_by_oid, entry_hash, created_at,
      });
      return { success: true };
    }

    // ─── procurement_tenders ─────────────────────────────────
    if (q.startsWith('INSERT INTO procurement_tenders')) {
      const [
        id, ocid, title_ar, title_en, ministry_oid, state_code, category,
        budget_sdg, currency, status, closing_date, created_at, updated_at,
      ] = params;
      tables.procurement_tenders.push({
        id, ocid, title_ar, title_en, ministry_oid, state_code, category,
        budget_sdg, currency, status, closing_date, created_at, updated_at,
      });
      return { success: true };
    }
    if (q.startsWith('SELECT * FROM procurement_tenders WHERE id = ?')) {
      return { first: tables.procurement_tenders.find((t) => t.id === params[0]) || null };
    }
    if (q.startsWith('SELECT * FROM procurement_tenders WHERE ocid = ?')) {
      return { first: tables.procurement_tenders.find((t) => t.ocid === params[0]) || null };
    }
    if (q.startsWith('SELECT * FROM procurement_tenders')) {
      let rows = [...tables.procurement_tenders];
      let idx = 0;
      if (q.includes('AND state_code = ?')) {
        const sc = params[idx++];
        rows = rows.filter((r) => r.state_code === sc);
      }
      if (q.includes('AND status = ?')) {
        const st = params[idx++];
        rows = rows.filter((r) => r.status === st);
      }
      return { results: rows };
    }

    // ─── beneficial_owners & users ───────────────────────────
    if (q.startsWith('INSERT INTO beneficial_owners')) {
      const [
        id, owner_oid, full_name_ar, full_name_en, entity_oid, ownership_pct,
        is_public_official, official_ministry_oid, is_sanctioned,
        is_military_commercial_affiliate, affiliation_note, created_at,
      ] = params;
      tables.beneficial_owners.push({
        id, owner_oid, full_name_ar, full_name_en, entity_oid, ownership_pct,
        is_public_official, official_ministry_oid, is_sanctioned,
        is_military_commercial_affiliate, affiliation_note, created_at,
      });
      return { success: true };
    }
    if (q.startsWith('SELECT * FROM beneficial_owners WHERE owner_oid = ? OR entity_oid = ?')) {
      return {
        results: tables.beneficial_owners.filter(
          (o) => o.owner_oid === params[0] || o.entity_oid === params[1]
        ),
      };
    }
    if (q.startsWith('SELECT * FROM beneficial_owners')) {
      return { results: [...tables.beneficial_owners] };
    }
    if (q.startsWith('SELECT id, oid, role, ministry_id FROM users WHERE oid = ?')) {
      return { results: tables.users.filter((u) => u.oid === params[0]) };
    }

    // ─── procurement_bids ────────────────────────────────────
    if (q.startsWith('INSERT INTO procurement_bids')) {
      const [
        id, tender_id, ocid, vendor_oid, vendor_name, beneficial_owner_oid,
        bid_amount_sdg, sealed_hash, status, conflict_flagged, conflict_reason, submitted_at,
      ] = params;
      tables.procurement_bids.push({
        id, tender_id, ocid, vendor_oid, vendor_name, beneficial_owner_oid,
        bid_amount_sdg, sealed_hash, status, conflict_flagged, conflict_reason, submitted_at,
      });
      return { success: true };
    }
    if (q.startsWith('SELECT * FROM procurement_bids')) {
      return { results: [...tables.procurement_bids] };
    }

    // ─── land_parcels ────────────────────────────────────────
    if (q.startsWith('INSERT INTO land_parcels')) {
      const [
        id, parcel_oid, owner_oid, owner_name_ar, owner_name_en, state_code,
        locality, area_feddan, tenure_type, dispute_status, coordinates_geojson,
        registered_at, updated_at,
      ] = params;
      tables.land_parcels.push({
        id, parcel_oid, owner_oid, owner_name_ar, owner_name_en, state_code,
        locality, area_feddan, tenure_type, dispute_status, coordinates_geojson,
        registered_at, updated_at,
      });
      return { success: true };
    }
    if (q.startsWith('SELECT * FROM land_parcels WHERE parcel_oid = ?')) {
      return { first: tables.land_parcels.find((p) => p.parcel_oid === params[0]) || null };
    }
    if (q.startsWith('SELECT * FROM land_parcels')) {
      let rows = [...tables.land_parcels];
      let idx = 0;
      if (q.includes('AND state_code = ?')) { const v = params[idx++]; rows = rows.filter((p) => p.state_code === v); }
      if (q.includes('AND owner_oid = ?')) { const v = params[idx++]; rows = rows.filter((p) => p.owner_oid === v); }
      if (q.includes('AND parcel_oid = ?')) { const v = params[idx++]; rows = rows.filter((p) => p.parcel_oid === v); }
      if (q.includes('AND tenure_type = ?')) { const v = params[idx++]; rows = rows.filter((p) => p.tenure_type === v); }
      if (q.includes('AND dispute_status = ?')) { const v = params[idx++]; rows = rows.filter((p) => p.dispute_status === v); }
      return { results: rows };
    }
    if (q.startsWith('UPDATE land_parcels SET owner_oid = ?')) {
      const [newOwner, nameAr, nameEn, updatedAt, parcelOid] = params;
      const p = tables.land_parcels.find((x) => x.parcel_oid === parcelOid);
      if (p) {
        p.owner_oid = newOwner;
        if (nameAr) p.owner_name_ar = nameAr;
        if (nameEn) p.owner_name_en = nameEn;
        p.updated_at = updatedAt;
      }
      return { success: true };
    }
    if (q.startsWith("UPDATE land_parcels SET dispute_status = 'frozen'")) {
      const [updatedAt, parcelOid] = params;
      const p = tables.land_parcels.find((x) => x.parcel_oid === parcelOid);
      if (p) { p.dispute_status = 'frozen'; p.updated_at = updatedAt; }
      return { success: true };
    }
    if (q.startsWith("UPDATE land_parcels SET dispute_status = 'clear'")) {
      const parcelOid = params[params.length - 1];
      const p = tables.land_parcels.find((x) => x.parcel_oid === parcelOid);
      if (p) {
        p.dispute_status = 'clear';
        if (params.length === 3) p.owner_oid = params[0];
        p.updated_at = params[params.length - 2];
      }
      return { success: true };
    }

    // ─── land_disputes ───────────────────────────────────────
    if (q.startsWith('INSERT INTO land_disputes')) {
      const [id, parcel_oid, claimant_oid, dispute_type, status, reason, evidence_hash, filed_at] = params;
      tables.land_disputes.push({
        id, parcel_oid, claimant_oid, dispute_type, status, reason, evidence_hash, filed_at, resolved_at: null,
      });
      return { success: true };
    }
    if (q.startsWith('SELECT * FROM land_disputes WHERE id = ?')) {
      return { first: tables.land_disputes.find((d) => d.id === params[0]) || null };
    }
    if (q.startsWith("SELECT COUNT(*) as cnt FROM land_disputes WHERE parcel_oid = ?")) {
      const cnt = tables.land_disputes.filter(
        (d) => d.parcel_oid === params[0] && ['open', 'frozen', 'under_review'].includes(d.status)
      ).length;
      return { first: { cnt } };
    }
    if (q.startsWith("SELECT * FROM land_disputes WHERE parcel_oid = ? AND status IN")) {
      return {
        results: tables.land_disputes.filter(
          (d) => d.parcel_oid === params[0] && ['open', 'frozen', 'under_review'].includes(d.status)
        ),
      };
    }
    if (q.startsWith('UPDATE land_disputes SET status = ?')) {
      const [status, notes, resolvedBy, resolvedAt, id] = params;
      const d = tables.land_disputes.find((x) => x.id === id);
      if (d) {
        d.status = status;
        d.resolution_notes = notes;
        d.resolved_by_oid = resolvedBy;
        d.resolved_at = resolvedAt;
      }
      return { success: true };
    }

    // ─── citizen_consent_receipts ────────────────────────────
    if (q.startsWith('INSERT INTO citizen_consent_receipts')) {
      const [
        id, receipt_id, citizen_oid, requesting_ministry_oid, scopes, purpose,
        status, expires_at, revoked_at, signature, created_at,
      ] = params;
      tables.citizen_consent_receipts.push({
        id, receipt_id, citizen_oid, requesting_ministry_oid, scopes, purpose,
        status, expires_at, revoked_at, signature, created_at,
      });
      return { success: true };
    }
    if (q.startsWith('SELECT * FROM citizen_consent_receipts WHERE receipt_id = ?')) {
      return { first: tables.citizen_consent_receipts.find((c) => c.receipt_id === params[0]) || null };
    }
    if (q.startsWith('SELECT * FROM citizen_consent_receipts WHERE id = ?')) {
      return { first: tables.citizen_consent_receipts.find((c) => c.id === params[0]) || null };
    }
    if (q.startsWith('SELECT * FROM citizen_consent_receipts WHERE citizen_oid = ? AND requesting_ministry_oid = ?')) {
      return {
        results: tables.citizen_consent_receipts
          .filter((c) => c.citizen_oid === params[0] && c.requesting_ministry_oid === params[1])
          .reverse(),
      };
    }
    if (q.startsWith('SELECT * FROM citizen_consent_receipts')) {
      return { results: [...tables.citizen_consent_receipts] };
    }
    if (q.startsWith("UPDATE citizen_consent_receipts SET status = 'revoked'")) {
      const [revokedAt, id] = params;
      const c = tables.citizen_consent_receipts.find((x) => x.id === id);
      if (c) { c.status = 'revoked'; c.revoked_at = revokedAt; }
      return { success: true };
    }

    return { results: [], first: null, success: true };
  }

  return {
    tables,
    prepare(sql) {
      let boundParams = [];
      const stmt = {
        bind(...args) {
          boundParams = args;
          return stmt;
        },
        async run() {
          return runQuery(sql, boundParams);
        },
        async all() {
          const res = runQuery(sql, boundParams);
          return { results: res.results || [] };
        },
        async first() {
          const res = runQuery(sql, boundParams);
          return res.first !== undefined ? res.first : (res.results?.[0] || null);
        },
      };
      return stmt;
    },
  };
}

function createMockEnv(db) {
  const sessions = new Map([
    [
      'session:valid-token',
      {
        token: 'valid-token',
        userId: '1.3.6.1.4.1.61026.2.01.001.123456789.1',
        createdAt: new Date().toISOString(),
      },
    ],
  ]);

  return {
    ENVIRONMENT: 'test',
    CORS_ORIGIN: '*',
    ENCRYPTION_KEY: 'test-sovereign-hmac-secret-key',
    DB: db,
    SESSIONS: {
      async get(key) {
        return sessions.get(key) || null;
      },
      async put(key, val) {
        sessions.set(key, JSON.parse(val));
      },
      async delete(key) {
        sessions.delete(key);
      },
    },
  };
}

const mockCtx = { waitUntil: () => {} };

async function apiCall(env, path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = 'Bearer valid-token';
  const req = new Request(`https://api.sudan.elfadil.com${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const res = await worker.fetch(req, env, mockCtx);
  const data = await res.json();
  return { status: res.status, data };
}

describe('Cloudflare Worker Practical Digital Government APIs', () => {
  let db;
  let env;

  beforeEach(() => {
    db = createMockD1();
    env = createMockEnv(db);
  });

  // ─── Health ──────────────────────────────────────────────────
  it('GET /api/health returns service status and binding metadata', async () => {
    const { status, data } = await apiCall(env, '/api/health');
    expect(status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.bindings.d1_main).toBe(true);
  });

  // ─── Pillar 1: Single Treasury Account & Federal Equalization ─
  describe('Pillar 1: Single Treasury Account (STA) & Federal Fiscal Equalization', () => {
    it('calculates exact 45/50/5 vertical split + 10% producing-region share + 5-factor horizontal distribution', () => {
      const result = calculateFederalEqualization({
        totalPoolSdg: 1000000000,
        producingResourceRevenues: [
          { stateCode: '05', amountSdg: 400000000, resource: 'gold_royalty' }, // 10% = 40M
          { stateCode: '02', amountSdg: 200000000, resource: 'port_fee' },     // 10% = 20M
        ],
      });

      expect(result.totalProducingRegionShareSdg).toBe(60000000);
      expect(result.distributablePoolSdg).toBe(940000000);
      expect(result.verticalSplit.federalShareSdg).toBe(423000000);     // 45% of 940M
      expect(result.verticalSplit.statesPoolSdg).toBe(470000000);       // 50% of 940M
      expect(result.verticalSplit.sovereignReserveSdg).toBe(47000000);  // 5% of 940M
      expect(result.horizontalWeights.warDamagePct).toBe(20);
      expect(result.stateAllocations).toHaveLength(18);

      const riverNile = result.stateAllocations.find((s) => s.stateCode === '05');
      const redSea = result.stateAllocations.find((s) => s.stateCode === '02');
      expect(riverNile.producingRegionShareSdg).toBe(40000000);
      expect(redSea.producingRegionShareSdg).toBe(20000000);
    });

    it('rejects unauthenticated POST /api/treasury/entry with 401', async () => {
      const { status } = await apiCall(env, '/api/treasury/entry', {
        method: 'POST',
        body: { entryType: 'revenue_gold_royalty', stateCode: '05', amountSdg: 5000000 },
      });
      expect(status).toBe(401);
    });

    it('hash-chains consecutive STA entries and aggregates them in GET /api/treasury/summary', async () => {
      const first = await apiCall(env, '/api/treasury/entry', {
        method: 'POST',
        auth: true,
        body: {
          entryType: 'revenue_gold_royalty',
          stateCode: '05',
          amountSdg: 500000000,
          description: 'River Nile Gold Royalty',
        },
      });
      expect(first.status).toBe(201);
      expect(first.data.entry.prev_hash).toBe(GENESIS_HASH);
      expect(first.data.entry.entry_hash).toMatch(/^[a-f0-9]{64}$/);

      const second = await apiCall(env, '/api/treasury/entry', {
        method: 'POST',
        auth: true,
        body: {
          entryType: 'disbursement_state_transfer',
          stateCode: '15',
          amountSdg: 120000000,
          description: 'West Darfur Reconstruction Transfer',
        },
      });
      expect(second.status).toBe(201);
      expect(second.data.entry.prev_hash).toBe(first.data.entry.entry_hash);

      const summary = await apiCall(env, '/api/treasury/summary');
      expect(summary.status).toBe(200);
      expect(summary.data.totalRevenueSdg).toBe(500000000);
      expect(summary.data.totalDisbursementsSdg).toBe(120000000);
      expect(summary.data.netBalanceSdg).toBe(380000000);
      expect(summary.data.latestEntryHash).toBe(second.data.entry.entry_hash);
      expect(summary.data.stateTransfers['15']).toBe(120000000);
    });

    it('persists federal equalization allocation when persist=true', async () => {
      const res = await apiCall(env, '/api/treasury/equalization', {
        method: 'POST',
        auth: true,
        body: { totalPoolSdg: 2000000000, persist: true, fiscalYear: 2026, period: '2026-Q1' },
      });
      expect(res.status).toBe(200);
      expect(res.data.persistedId).toBeTruthy();
      expect(db.tables.federal_allocations).toHaveLength(1);
    });
  });

  // ─── Pillar 2: Open e-Procurement (OCDS) & Conflict Detection ─
  describe('Pillar 2: Open e-Procurement (OCDS) & Beneficial Ownership Conflict-of-Interest', () => {
    it('creates an OCDS tender, accepts clean bids, and blocks military/official/sanctioned UBO bids with 409', async () => {
      // Seed beneficial owners watchlist & official user
      await apiCall(env, '/api/procurement/beneficial-owners', {
        method: 'POST',
        auth: true,
        body: {
          ownerOid: '1.3.6.1.4.1.61026.2.01.001.999000111.3',
          fullNameAr: 'شركة عسكرية تجارية',
          fullNameEn: 'Military Commercial Affiliate Corp',
          entityOid: '1.3.6.1.4.1.61026.3.01.001.88001',
          isMilitaryCommercialAffiliate: true,
        },
      });
      db.tables.users.push({
        id: 'official-1',
        oid: '1.3.6.1.4.1.61026.2.01.001.555000222.8',
        role: 'official',
        ministry_id: 'infrastructure',
      });

      // Publish OCDS tender
      const tenderRes = await apiCall(env, '/api/procurement/tenders', {
        method: 'POST',
        auth: true,
        body: {
          titleAr: 'إعادة تأهيل جسر النيل الأبيض',
          titleEn: 'White Nile Bridge Rehabilitation',
          ministryOid: '1.3.6.1.4.1.61026.4.1.7',
          stateCode: '01',
          budgetSdg: 300000000,
        },
      });
      expect(tenderRes.status).toBe(201);
      const tenderId = tenderRes.data.tender.id;

      // 1. Clean bid succeeds
      const cleanBid = await apiCall(env, '/api/procurement/bids', {
        method: 'POST',
        auth: true,
        body: {
          tenderId,
          vendorOid: '1.3.6.1.4.1.61026.3.01.001.10001',
          vendorName: 'Nile Civil Engineering Ltd',
          beneficialOwnerOid: '1.3.6.1.4.1.61026.2.01.001.111222333.4',
          bidAmountSdg: 285000000,
        },
      });
      expect(cleanBid.status).toBe(201);
      expect(cleanBid.data.conflictFlagged).toBe(false);
      expect(cleanBid.data.bid.sealed_hash).toMatch(/^[a-f0-9]{64}$/);

      // 2. Military commercial affiliate bid is blocked (409) and logged as flagged
      const militaryBid = await apiCall(env, '/api/procurement/bids', {
        method: 'POST',
        auth: true,
        body: {
          tenderId,
          vendorOid: '1.3.6.1.4.1.61026.3.01.001.88001',
          vendorName: 'Frontline Logistics Co',
          beneficialOwnerOid: '1.3.6.1.4.1.61026.2.01.001.999000111.3',
          bidAmountSdg: 270000000,
        },
      });
      expect(militaryBid.status).toBe(409);
      expect(militaryBid.data.blocked).toBe(true);
      expect(militaryBid.data.conflictFlagged).toBe(true);
      expect(militaryBid.data.codes).toContain('military_commercial_affiliate');

      // 3. Government official UBO bid is blocked (409)
      const officialBid = await apiCall(env, '/api/procurement/bids', {
        method: 'POST',
        auth: true,
        body: {
          tenderId,
          vendorOid: '1.3.6.1.4.1.61026.3.01.001.20002',
          vendorName: 'Insider Contracting Group',
          beneficialOwnerOid: '1.3.6.1.4.1.61026.2.01.001.555000222.8',
          bidAmountSdg: 295000000,
        },
      });
      expect(officialBid.status).toBe(409);
      expect(officialBid.data.codes).toContain('government_official_user');
    });

    it('evaluateBidConflict detects sanctioned entities cleanly', () => {
      const result = evaluateBidConflict({
        tender: { ministry_oid: '1.3.6.1.4.1.61026.4.1.4' },
        bid: { vendorOid: 'v1', beneficialOwnerOid: 'ubo-sanctioned' },
        beneficialOwners: [{ owner_oid: 'ubo-sanctioned', is_sanctioned: 1 }],
      });
      expect(result.blocked).toBe(true);
      expect(result.codes).toContain('sanctioned_entity');
    });
  });

  // ─── Pillar 3: Land & Hawakeer Registry & Dispute Freeze ─────
  describe('Pillar 3: OID-Bound Land & Hawakeer Registry with 409 Dispute Freeze', () => {
    it('registers Hawakeer & Freehold parcels, enforces 409 Conflict freeze on dispute, and allows transfer after resolution', async () => {
      // Register a customary Hawakeer parcel in West Darfur (state 15)
      const regRes = await apiCall(env, '/api/land/parcels', {
        method: 'POST',
        auth: true,
        body: {
          parcelOid: '1.3.6.1.4.1.61026.1.15.00077',
          ownerOid: '1.3.6.1.4.1.61026.2.15.002.100000001.2',
          ownerNameAr: 'حاكورة مجتمع الجنينة',
          ownerNameEn: 'El Geneina Community Hawakeer',
          stateCode: '15',
          locality: 'El Geneina',
          areaFeddan: 650,
          tenureType: 'hawakeer_communal',
        },
      });
      expect(regRes.status).toBe(201);
      const parcelOid = regRes.data.parcel.parcel_oid;

      // File a wartime displacement dispute -> automatically freezes parcel
      const disputeRes = await apiCall(env, '/api/land/disputes', {
        method: 'POST',
        auth: true,
        body: {
          parcelOid,
          claimantOid: '1.3.6.1.4.1.61026.2.15.002.100000001.2',
          disputeType: 'wartime_displacement',
          reason: 'Community displaced during conflict; freeze title against fraudulent sale',
        },
      });
      expect(disputeRes.status).toBe(201);
      expect(disputeRes.data.parcelDisputeStatus).toBe('frozen');

      // Attempt to transfer frozen parcel -> MUST fail with 409 Conflict
      const blockedTransfer = await apiCall(env, '/api/land/transfer', {
        method: 'POST',
        auth: true,
        body: {
          parcelOid,
          newOwnerOid: '1.3.6.1.4.1.61026.2.01.001.777777777.9',
        },
      });
      expect(blockedTransfer.status).toBe(409);
      expect(blockedTransfer.data.code).toBe('DISPUTE_FREEZE_ACTIVE');

      // Resolve dispute -> parcel returns to 'clear'
      const resolveRes = await apiCall(env, '/api/land/disputes/resolve', {
        method: 'POST',
        auth: true,
        body: {
          disputeId: disputeRes.data.dispute.id,
          resolutionStatus: 'resolved_restored',
          resolutionNotes: 'Restored by Transitional Justice Land Commission',
        },
      });
      expect(resolveRes.status).toBe(200);
      expect(resolveRes.data.parcelDisputeStatus).toBe('clear');

      // Now authorized transfer succeeds (200)
      const okTransfer = await apiCall(env, '/api/land/transfer', {
        method: 'POST',
        auth: true,
        body: {
          parcelOid,
          newOwnerOid: '1.3.6.1.4.1.61026.2.15.002.200000002.5',
        },
      });
      expect(okTransfer.status).toBe(200);
      expect(okTransfer.data.transferReceipt.newOwnerOid).toBe('1.3.6.1.4.1.61026.2.15.002.200000002.5');
    });
  });

  // ─── Pillar 4: Citizen Consent Receipts ──────────────────────
  describe('Pillar 4: Privacy-Preserving Citizen Consent Receipts', () => {
    it('issues HMAC-signed consent receipt, verifies allowed scopes, and blocks access after revocation', async () => {
      const citizenOid = '1.3.6.1.4.1.61026.2.18.001.445566778.3';
      const ministryOid = '1.3.6.1.4.1.61026.4.1.2';

      // Grant consent
      const grantRes = await apiCall(env, '/api/consent/grant', {
        method: 'POST',
        auth: true,
        body: {
          citizenOid,
          requestingMinistryOid: ministryOid,
          scopes: ['health:vaccination_record', 'identity:age_over_18'],
          purpose: 'Hospital emergency triage',
          ttlSeconds: 3600,
        },
      });
      expect(grantRes.status).toBe(201);
      expect(grantRes.data.receipt.signature).toMatch(/^[a-f0-9]{64}$/);
      const receiptId = grantRes.data.receipt.receipt_id;

      // Verify granted scope -> allowed: true
      const verifyOk = await apiCall(env, '/api/consent/verify', {
        method: 'POST',
        body: { citizenOid, requestingMinistryOid: ministryOid, scope: 'health:vaccination_record' },
      });
      expect(verifyOk.status).toBe(200);
      expect(verifyOk.data.allowed).toBe(true);
      expect(verifyOk.data.signatureValid).toBe(true);

      // Verify ungranted scope -> allowed: false
      const verifyDeniedScope = await apiCall(env, '/api/consent/verify', {
        method: 'POST',
        body: { citizenOid, requestingMinistryOid: ministryOid, scope: 'finance:bank_balance' },
      });
      expect(verifyDeniedScope.status).toBe(200);
      expect(verifyDeniedScope.data.allowed).toBe(false);

      // Revoke consent
      const revokeRes = await apiCall(env, '/api/consent/revoke', {
        method: 'POST',
        auth: true,
        body: { receiptId },
      });
      expect(revokeRes.status).toBe(200);
      expect(revokeRes.data.status).toBe('revoked');

      // Verify after revocation -> allowed: false
      const verifyAfterRevoke = await apiCall(env, '/api/consent/verify', {
        method: 'POST',
        body: { citizenOid, requestingMinistryOid: ministryOid, scope: 'health:vaccination_record' },
      });
      expect(verifyAfterRevoke.status).toBe(200);
      expect(verifyAfterRevoke.data.allowed).toBe(false);
      expect(verifyAfterRevoke.data.reason).toContain('revoked');
    });
  });
});
