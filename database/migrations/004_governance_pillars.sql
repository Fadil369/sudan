-- Sudan Digital Government Portal - D1 Main Database Schema
-- Migration 004: Practical Digital Government Pillars («جمهورية المقرن»)
-- Cloudflare D1 (SQLite-compatible)
--
-- Adds four constitutional digital-governance registries anchored on ISO OID 1.3.6.1.4.1.61026:
--   1. Single Treasury Account (sta_ledger) & Federal Fiscal Equalization (federal_allocations)
--   2. Open e-Procurement OCDS (procurement_tenders, beneficial_owners, procurement_bids)
--   3. Digital Land & Hawakeer Registry (land_parcels, land_disputes)
--   4. Citizen Consent Receipts (citizen_consent_receipts)

-- ─── Migration Tracking ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _migrations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT UNIQUE NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO _migrations (name) VALUES ('004_governance_pillars');

-- ─── 1. Single Treasury Account (STA) Ledger ───────────────────────────────────
-- Append-only, SHA-256 hash-chained ledger for all federal & state public revenues
-- and disbursements (eliminates off-budget parallel accounts and cash leakage).
CREATE TABLE IF NOT EXISTS sta_ledger (
  id                 TEXT PRIMARY KEY,
  reference_no       TEXT UNIQUE NOT NULL,
  entry_type         TEXT NOT NULL CHECK(entry_type IN (
                       'revenue_customs',
                       'revenue_gold_royalty',
                       'revenue_port_fee',
                       'revenue_tax',
                       'revenue_oil_mineral',
                       'revenue_other',
                       'disbursement_federal',
                       'disbursement_state_transfer',
                       'disbursement_sovereign_reserve'
                     )),
  ministry_oid       TEXT NOT NULL,                 -- e.g. 1.3.6.1.4.1.61026.4.1.4
  state_code         TEXT NOT NULL,                 -- '00' federal or '01'..'18'
  payer_or_payee_oid TEXT,                          -- Citizen / Business / State OID
  amount_sdg         REAL NOT NULL CHECK(amount_sdg > 0),
  currency           TEXT NOT NULL DEFAULT 'SDG',
  description        TEXT,
  status             TEXT NOT NULL DEFAULT 'posted' CHECK(status IN ('posted','verified','flagged')),
  prev_hash          TEXT NOT NULL,                 -- SHA-256 of previous ledger entry (64 zeros for genesis)
  entry_hash         TEXT NOT NULL UNIQUE,          -- SHA-256 hash chain digest
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sta_ledger_type       ON sta_ledger(entry_type);
CREATE INDEX IF NOT EXISTS idx_sta_ledger_state      ON sta_ledger(state_code);
CREATE INDEX IF NOT EXISTS idx_sta_ledger_created_at ON sta_ledger(created_at);

-- ─── Federal Fiscal Equalization Allocations ───────────────────────────────────
-- Transparent statutory distribution: 45% Federal / 50% States / 5% Sovereign Reserve
-- + 10% Producing-Region share + 5-factor horizontal equalization (incl. 20% war damage).
CREATE TABLE IF NOT EXISTS federal_allocations (
  id                         TEXT PRIMARY KEY,
  fiscal_year                INTEGER NOT NULL,
  period                     TEXT NOT NULL,         -- e.g. '2026-Q1' or '2026-FY'
  total_pool_sdg             REAL NOT NULL CHECK(total_pool_sdg > 0),
  federal_share_sdg          REAL NOT NULL,
  states_share_sdg           REAL NOT NULL,
  sovereign_reserve_sdg      REAL NOT NULL,
  producing_region_bonus_sdg REAL NOT NULL DEFAULT 0,
  formula_version            TEXT NOT NULL DEFAULT 'muqran-v1',
  state_breakdown_json       TEXT NOT NULL,         -- JSON array of per-state allocations
  computed_by_oid            TEXT,
  entry_hash                 TEXT NOT NULL,
  created_at                 TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_federal_allocations_fy ON federal_allocations(fiscal_year, period);

-- ─── 2. Open e-Procurement (OCDS) & Beneficial Ownership Registry ──────────────
-- Beneficial Ownership (UBO) & Conflict-of-Interest Watchlist
CREATE TABLE IF NOT EXISTS beneficial_owners (
  id                             TEXT PRIMARY KEY,
  owner_oid                      TEXT UNIQUE NOT NULL,  -- Citizen or entity OID
  full_name_ar                   TEXT NOT NULL,
  full_name_en                   TEXT NOT NULL,
  entity_oid                     TEXT,                  -- Associated business OID 1.3.6.1.4.1.61026.3.*
  ownership_pct                  REAL DEFAULT 100.0 CHECK(ownership_pct >= 0 AND ownership_pct <= 100),
  is_public_official             INTEGER NOT NULL DEFAULT 0 CHECK(is_public_official IN (0, 1)),
  official_ministry_oid          TEXT,
  is_sanctioned                  INTEGER NOT NULL DEFAULT 0 CHECK(is_sanctioned IN (0, 1)),
  is_military_commercial_affiliate INTEGER NOT NULL DEFAULT 0 CHECK(is_military_commercial_affiliate IN (0, 1)),
  affiliation_note               TEXT,
  verified_at                    TEXT DEFAULT (datetime('now')),
  created_at                     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ubo_owner_oid  ON beneficial_owners(owner_oid);
CREATE INDEX IF NOT EXISTS idx_ubo_entity_oid ON beneficial_owners(entity_oid);

-- Public Tenders (Open Contracting Data Standard)
CREATE TABLE IF NOT EXISTS procurement_tenders (
  id                 TEXT PRIMARY KEY,
  ocid               TEXT UNIQUE NOT NULL,          -- e.g. ocds-sd-2026-0001
  title_ar           TEXT NOT NULL,
  title_en           TEXT NOT NULL,
  ministry_oid       TEXT NOT NULL,
  state_code         TEXT NOT NULL,                 -- '00' federal or '01'..'18'
  category           TEXT DEFAULT 'works' CHECK(category IN ('goods','works','services','consulting')),
  budget_sdg         REAL NOT NULL CHECK(budget_sdg > 0),
  currency           TEXT NOT NULL DEFAULT 'SDG',
  status             TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('planning','open','evaluation','awarded','cancelled')),
  closing_date       TEXT,
  awarded_vendor_oid TEXT,
  award_amount_sdg   REAL,
  awarded_at         TEXT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tenders_ocid   ON procurement_tenders(ocid);
CREATE INDEX IF NOT EXISTS idx_tenders_state  ON procurement_tenders(state_code);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON procurement_tenders(status);

-- Sealed Bids with Automated Conflict-of-Interest Screening
CREATE TABLE IF NOT EXISTS procurement_bids (
  id                   TEXT PRIMARY KEY,
  tender_id            TEXT NOT NULL REFERENCES procurement_tenders(id),
  ocid                 TEXT NOT NULL,
  vendor_oid           TEXT NOT NULL,
  vendor_name          TEXT NOT NULL,
  beneficial_owner_oid TEXT NOT NULL,
  bid_amount_sdg       REAL NOT NULL CHECK(bid_amount_sdg > 0),
  sealed_hash          TEXT NOT NULL,               -- SHA-256 sealed commitment
  status               TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','flagged','blocked','qualified','awarded','rejected')),
  conflict_flagged     INTEGER NOT NULL DEFAULT 0 CHECK(conflict_flagged IN (0, 1)),
  conflict_reason      TEXT,
  submitted_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bids_tender   ON procurement_bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_bids_vendor   ON procurement_bids(vendor_oid);
CREATE INDEX IF NOT EXISTS idx_bids_ubo      ON procurement_bids(beneficial_owner_oid);
CREATE INDEX IF NOT EXISTS idx_bids_conflict ON procurement_bids(conflict_flagged);

-- ─── 3. Digital Land & Hawakeer Registry ───────────────────────────────────────
-- OID-bound parcels supporting statutory Freehold, Leasehold, and customary Hawakeer
CREATE TABLE IF NOT EXISTS land_parcels (
  id                  TEXT PRIMARY KEY,
  parcel_oid          TEXT UNIQUE NOT NULL,         -- 1.3.6.1.4.1.61026.1.<state>.<seq>
  owner_oid           TEXT NOT NULL,
  owner_name_ar       TEXT,
  owner_name_en       TEXT,
  state_code          TEXT NOT NULL,                -- '01'..'18'
  locality            TEXT NOT NULL,
  area_feddan         REAL NOT NULL CHECK(area_feddan > 0),
  tenure_type         TEXT NOT NULL CHECK(tenure_type IN ('freehold','leasehold','hawakeer_communal','state_trust')),
  dispute_status      TEXT NOT NULL DEFAULT 'clear' CHECK(dispute_status IN ('clear','frozen','under_review')),
  coordinates_geojson TEXT,
  registered_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_land_parcel_oid    ON land_parcels(parcel_oid);
CREATE INDEX IF NOT EXISTS idx_land_owner_oid     ON land_parcels(owner_oid);
CREATE INDEX IF NOT EXISTS idx_land_state_code    ON land_parcels(state_code);
CREATE INDEX IF NOT EXISTS idx_land_tenure_type   ON land_parcels(tenure_type);
CREATE INDEX IF NOT EXISTS idx_land_dispute_state ON land_parcels(dispute_status);

-- Transitional-Justice Land Disputes (triggers automatic transfer freeze)
CREATE TABLE IF NOT EXISTS land_disputes (
  id               TEXT PRIMARY KEY,
  parcel_oid       TEXT NOT NULL REFERENCES land_parcels(parcel_oid),
  claimant_oid     TEXT NOT NULL,
  dispute_type     TEXT NOT NULL DEFAULT 'wartime_displacement' CHECK(dispute_type IN (
                     'wartime_displacement',
                     'forged_deed',
                     'boundary_overlap',
                     'hawakeer_customary',
                     'competing_title'
                   )),
  status           TEXT NOT NULL DEFAULT 'frozen' CHECK(status IN (
                     'open',
                     'frozen',
                     'under_review',
                     'resolved_restored',
                     'resolved_dismissed'
                   )),
  reason           TEXT NOT NULL,
  evidence_hash    TEXT,
  resolution_notes TEXT,
  resolved_by_oid  TEXT,
  filed_at         TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at      TEXT
);

CREATE INDEX IF NOT EXISTS idx_land_disputes_parcel ON land_disputes(parcel_oid);
CREATE INDEX IF NOT EXISTS idx_land_disputes_status ON land_disputes(status);

-- ─── 4. Citizen Consent Receipts ───────────────────────────────────────────────
-- Privacy-preserving, purpose-bound, HMAC-SHA256 signed inter-agency data access grants
CREATE TABLE IF NOT EXISTS citizen_consent_receipts (
  id                      TEXT PRIMARY KEY,
  receipt_id              TEXT UNIQUE NOT NULL,
  citizen_oid             TEXT NOT NULL,
  requesting_ministry_oid TEXT NOT NULL,
  scopes                  TEXT NOT NULL,            -- JSON array of permitted scopes
  purpose                 TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked','expired')),
  expires_at              TEXT NOT NULL,
  revoked_at              TEXT,
  signature               TEXT NOT NULL,            -- HMAC-SHA256 hex digest
  created_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_consent_citizen  ON citizen_consent_receipts(citizen_oid);
CREATE INDEX IF NOT EXISTS idx_consent_ministry ON citizen_consent_receipts(requesting_ministry_oid);
CREATE INDEX IF NOT EXISTS idx_consent_status   ON citizen_consent_receipts(status);
