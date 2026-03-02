-- Sudan Digital Government Portal - D1 Main Database Schema
-- Migration 001: Initial Schema
-- Cloudflare D1 (SQLite-compatible)
-- Note: PRAGMA journal_mode and foreign_keys not supported by D1; removed.

-- ─── Migration Tracking ────────────────────────────────────────────────────────
-- Ensures each migration file is only applied once (idempotent deploys)
CREATE TABLE IF NOT EXISTS _migrations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT UNIQUE NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO _migrations (name) VALUES ('001_initial');

-- ─── Citizens ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizens (
  id            TEXT PRIMARY KEY,             -- OID-based unique identifier
  national_id   TEXT UNIQUE NOT NULL,         -- National ID number
  oid           TEXT UNIQUE,                  -- Full OID: 1.3.6.1.4.1.61026.2.XXXXXXXX
  full_name_ar  TEXT NOT NULL,
  full_name_en  TEXT,
  date_of_birth TEXT NOT NULL,                -- ISO date
  gender        TEXT CHECK(gender IN ('M','F')) NOT NULL,
  state         TEXT NOT NULL,                -- One of Sudan's 18 states
  locality      TEXT,
  nationality   TEXT DEFAULT 'Sudanese',
  status        TEXT DEFAULT 'active' CHECK(status IN ('active','suspended','deceased','expatriate')),
  biometric_hash TEXT,                        -- SHA-256 of biometric template (never raw biometric)
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_citizens_national_id ON citizens(national_id);
CREATE INDEX IF NOT EXISTS idx_citizens_state ON citizens(state);
CREATE INDEX IF NOT EXISTS idx_citizens_status ON citizens(status);

-- ─── Documents ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id            TEXT PRIMARY KEY,
  citizen_id    TEXT NOT NULL REFERENCES citizens(id),
  doc_type      TEXT NOT NULL CHECK(doc_type IN (
                  'birth_certificate','death_certificate','marriage_certificate',
                  'national_id','passport','driving_license','property_deed',
                  'education_certificate','health_record')),
  doc_number    TEXT UNIQUE,
  issue_date    TEXT,
  expiry_date   TEXT,
  issuing_authority TEXT,
  status        TEXT DEFAULT 'valid' CHECK(status IN ('valid','expired','revoked','pending')),
  r2_key        TEXT,                         -- Cloudflare R2 object key for document file
  metadata      TEXT,                         -- JSON blob
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_citizen ON documents(citizen_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- ─── Service Requests ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_requests (
  id            TEXT PRIMARY KEY,
  citizen_id    TEXT REFERENCES citizens(id),
  ministry      TEXT NOT NULL,
  service_type  TEXT NOT NULL,
  status        TEXT DEFAULT 'pending' CHECK(status IN ('pending','processing','approved','rejected','completed')),
  priority      TEXT DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
  reference_no  TEXT UNIQUE,
  submitted_at  TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now')),
  completed_at  TEXT,
  notes         TEXT,
  metadata      TEXT                          -- JSON blob
);

CREATE INDEX IF NOT EXISTS idx_requests_citizen ON service_requests(citizen_id);
CREATE INDEX IF NOT EXISTS idx_requests_ministry ON service_requests(ministry);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);

-- ─── Healthcare Records ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_records (
  id            TEXT PRIMARY KEY,
  citizen_id    TEXT NOT NULL REFERENCES citizens(id),
  record_type   TEXT NOT NULL CHECK(record_type IN (
                  'vaccination','appointment','prescription','lab_result',
                  'diagnosis','surgery','allergy','chronic_condition')),
  facility      TEXT,
  facility_code TEXT,
  date          TEXT NOT NULL,
  details       TEXT,                         -- JSON blob (encrypted)
  doctor_id     TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_health_citizen ON health_records(citizen_id);
CREATE INDEX IF NOT EXISTS idx_health_type ON health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_date ON health_records(date);

-- ─── Education Records ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education_records (
  id            TEXT PRIMARY KEY,
  citizen_id    TEXT NOT NULL REFERENCES citizens(id),
  institution   TEXT NOT NULL,
  institution_code TEXT,
  level         TEXT NOT NULL CHECK(level IN ('primary','middle','secondary','diploma','bachelor','master','phd')),
  field_of_study TEXT,
  enrollment_year INTEGER,
  graduation_year INTEGER,
  status        TEXT DEFAULT 'enrolled' CHECK(status IN ('enrolled','graduated','dropped','transferred')),
  certificate_no TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_education_citizen ON education_records(citizen_id);

-- ─── Transactions / Payments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id            TEXT PRIMARY KEY,
  citizen_id    TEXT REFERENCES citizens(id),
  type          TEXT NOT NULL CHECK(type IN ('fee','fine','tax','subsidy','salary','pension','transfer')),
  amount        REAL NOT NULL,
  currency      TEXT DEFAULT 'SDG',
  ministry      TEXT,
  reference_no  TEXT UNIQUE,
  status        TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','failed','refunded')),
  payment_method TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  completed_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_transactions_citizen ON transactions(citizen_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);

-- ─── OID Registry ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oid_registry (
  oid           TEXT PRIMARY KEY,
  description   TEXT NOT NULL,
  entity_type   TEXT NOT NULL CHECK(entity_type IN (
                  'citizen','place','infrastructure','economic','healthcare',
                  'education','government','document','organization')),
  entity_id     TEXT,
  parent_oid    TEXT,
  state         TEXT,
  metadata      TEXT,                         -- JSON blob
  registered_at TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_oid_entity_type ON oid_registry(entity_type);
CREATE INDEX IF NOT EXISTS idx_oid_parent ON oid_registry(parent_oid);

-- ─── Audit Log ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id            TEXT PRIMARY KEY,
  actor_id      TEXT,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  ip_address    TEXT,
  user_agent    TEXT,
  result        TEXT CHECK(result IN ('success','failure','error')),
  details       TEXT,                         -- JSON blob
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

-- ─── System Config ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_config (
  key           TEXT PRIMARY KEY,
  value         TEXT NOT NULL,
  description   TEXT,
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- Seed initial config
INSERT OR IGNORE INTO system_config (key, value, description) VALUES
  ('oid_root', '1.3.6.1.4.1.61026', 'BRAINSAIT OID root'),
  ('system_version', '1.0.0', 'Portal version'),
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('session_ttl_hours', '8', 'Session time-to-live in hours'),
  ('max_login_attempts', '5', 'Max failed login attempts before lockout');
