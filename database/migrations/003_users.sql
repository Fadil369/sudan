-- Sudan Digital Government Portal - D1 Main Database Schema
-- Migration 003: Users & WebAuthn Credentials
-- Cloudflare D1 (SQLite-compatible)
--
-- Adds the `users` table required by the Worker's /api/auth/login endpoint
-- (password_hash format: '<salt_hex>:<pbkdf2_sha256_hex>' as produced by
--  AuthService.hashPassword in the frontend and the Worker's PBKDF2 code).
-- Adds `webauthn_credentials` required by /api/auth/biometric.

-- ─── Migration Tracking ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _migrations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT UNIQUE NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO _migrations (name) VALUES ('003_users');

-- ─── Users ────────────────────────────────────────────────────────────────────
-- Stores government portal accounts. national_id and oid are the primary
-- look-up keys used by the Worker's SELECT query.
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,                 -- UUID / generateId()
  national_id     TEXT UNIQUE NOT NULL,             -- Login username (matches citizens.national_id)
  oid             TEXT UNIQUE,                      -- Alternative OID login: 1.3.6.1.4.1.61026.2.XXXX
  password_hash   TEXT NOT NULL,                    -- '<salt_hex>:<pbkdf2_hex>' — never plaintext
  full_name_ar    TEXT,
  full_name_en    TEXT,
  role            TEXT NOT NULL DEFAULT 'citizen'
                    CHECK(role IN ('citizen','official','admin','super_admin','auditor')),
  ministry_id     TEXT,                             -- NULL for citizens
  permissions     TEXT DEFAULT '[]',                -- JSON array of permission strings
  is_active       INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  failed_attempts INTEGER NOT NULL DEFAULT 0,       -- Consecutive failed login counter
  locked_until    TEXT,                             -- ISO datetime; NULL = not locked
  last_login      TEXT,                             -- ISO datetime of last successful login
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);
CREATE INDEX IF NOT EXISTS idx_users_oid         ON users(oid);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_ministry    ON users(ministry_id);

-- ─── WebAuthn Credentials ─────────────────────────────────────────────────────
-- Stores passkey / biometric authenticator registrations.
-- Used by the Worker's /api/auth/biometric endpoint.
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id              TEXT PRIMARY KEY,                 -- UUID / generateId()
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id   TEXT UNIQUE NOT NULL,             -- Base64url encoded credential ID from authenticator
  public_key      TEXT NOT NULL,                    -- COSE-encoded public key (base64url)
  sign_count      INTEGER NOT NULL DEFAULT 0,       -- Monotonic counter — verify on each assertion
  aaguid          TEXT,                             -- Authenticator AAGUID (for attestation metadata)
  device_name     TEXT,                             -- User-friendly name (e.g. "iPhone 15 Face ID")
  transports      TEXT DEFAULT '[]',                -- JSON array: ["internal","hybrid",…]
  backed_up       INTEGER NOT NULL DEFAULT 0 CHECK(backed_up IN (0, 1)),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at    TEXT                              -- ISO datetime of last successful assertion
);

CREATE INDEX IF NOT EXISTS idx_webauthn_user       ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential ON webauthn_credentials(credential_id);

-- ─── Seed: bootstrap super-admin account ─────────────────────────────────────
-- Password hash is a placeholder produced by:
--   salt = crypto.getRandomValues(new Uint8Array(16))     (hex: 0000…00 for seed)
--   PBKDF2(password="ChangeMe123!", salt, 10000, SHA-256) → hash hex
-- IMPORTANT: replace this row immediately after first deploy using the API or
--            wrangler d1 execute with a properly hashed password.
INSERT OR IGNORE INTO users (id, national_id, oid, password_hash, full_name_en, full_name_ar, role, is_active)
VALUES (
  'bootstrap-admin-001',
  'ADMIN000000001',
  '1.3.6.1.4.1.61026.1.0',
  '000000000000000000000000000000000000000000000000000000000000000000000000:PLACEHOLDER_CHANGE_BEFORE_PRODUCTION',
  'System Administrator',
  'مدير النظام',
  'super_admin',
  1
);
