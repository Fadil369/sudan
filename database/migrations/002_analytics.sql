-- Sudan Digital Government Portal - D1 Analytics Database Schema
-- Migration 002: Analytics Schema
-- Cloudflare D1 (SQLite-compatible)

PRAGMA journal_mode=WAL;

-- ─── Migration Tracking ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _migrations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT UNIQUE NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO _migrations (name) VALUES ('002_analytics');

-- ─── Page Views / Traffic ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id            TEXT PRIMARY KEY,
  path          TEXT NOT NULL,
  ministry      TEXT,
  session_id    TEXT,
  country       TEXT,
  city          TEXT,
  device_type   TEXT CHECK(device_type IN ('desktop','mobile','tablet','unknown')),
  browser       TEXT,
  referrer      TEXT,
  duration_ms   INTEGER,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_pv_ministry ON page_views(ministry);

-- ─── Service Usage Metrics ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_metrics (
  id            TEXT PRIMARY KEY,
  ministry      TEXT NOT NULL,
  service_type  TEXT NOT NULL,
  action        TEXT NOT NULL CHECK(action IN ('view','apply','submit','download','search')),
  count         INTEGER DEFAULT 1,
  date          TEXT NOT NULL,               -- YYYY-MM-DD
  hour          INTEGER,                     -- 0-23
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sm_ministry ON service_metrics(ministry);
CREATE INDEX IF NOT EXISTS idx_sm_date ON service_metrics(date);

-- ─── Daily Aggregates ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_stats (
  date              TEXT PRIMARY KEY,         -- YYYY-MM-DD
  total_visits      INTEGER DEFAULT 0,
  unique_visitors   INTEGER DEFAULT 0,
  total_requests    INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests   INTEGER DEFAULT 0,
  new_citizens      INTEGER DEFAULT 0,
  documents_issued  INTEGER DEFAULT 0,
  transactions_total INTEGER DEFAULT 0,
  transactions_value REAL DEFAULT 0,
  top_ministry      TEXT,
  updated_at        TEXT DEFAULT (datetime('now'))
);

-- ─── Performance Metrics ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS performance_metrics (
  id            TEXT PRIMARY KEY,
  endpoint      TEXT NOT NULL,
  method        TEXT NOT NULL,
  status_code   INTEGER,
  duration_ms   INTEGER,
  country       TEXT,
  colo          TEXT,                        -- Cloudflare colo/datacenter
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_perf_endpoint ON performance_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_perf_created ON performance_metrics(created_at);

-- ─── Citizen Satisfaction Surveys ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id            TEXT PRIMARY KEY,
  citizen_id    TEXT,
  ministry      TEXT NOT NULL,
  service_type  TEXT,
  rating        INTEGER CHECK(rating BETWEEN 1 AND 5),
  feedback      TEXT,
  submitted_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_survey_ministry ON satisfaction_surveys(ministry);
CREATE INDEX IF NOT EXISTS idx_survey_rating ON satisfaction_surveys(rating);
