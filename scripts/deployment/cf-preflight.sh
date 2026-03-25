#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

REQUIRED_FILES=(
  "workers.toml"
  "wrangler.toml"
  "api/index.js"
  "database/migrations/001_initial.sql"
  "database/migrations/002_analytics.sql"
  "database/migrations/003_users.sql"
)

REQUIRED_WORKER_BINDINGS=(
  "SESSIONS"
  "CACHE"
  "OID_REGISTRY"
  "CITIZEN_PROFILES"
  "DOCUMENTS"
  "MEDIA"
  "AUDIT_LOGS"
  "DB"
  "ANALYTICS_DB"
  "SESSION_DO"
  "RATE_LIMITER"
  "CITIZEN_STREAM"
)

REQUIRED_SECRETS=(
  "JWT_SECRET"
  "ENCRYPTION_KEY"
)

echo "[Preflight] Checking local prerequisites"

# Prefer local wrangler from node_modules, fallback to global binary.
WRANGLER_CMD="npx wrangler"
if command -v wrangler >/dev/null 2>&1; then
  WRANGLER_CMD="wrangler"
elif ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: wrangler CLI is not available (global or via npx). Run: npm ci"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not installed"
  exit 1
fi

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "ERROR: Required file missing: $file"
    exit 1
  fi
done

echo "[Preflight] Checking Cloudflare auth environment"
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "WARN: CLOUDFLARE_API_TOKEN is not set in this shell"
fi
if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "WARN: CLOUDFLARE_ACCOUNT_ID is not set in this shell"
fi

echo "[Preflight] Validating worker bindings in workers.toml"
for binding in "${REQUIRED_WORKER_BINDINGS[@]}"; do
  if ! grep -q "${binding}" workers.toml; then
    echo "ERROR: Binding not found in workers.toml: ${binding}"
    exit 1
  fi
done

echo "[Preflight] Reminder: required Worker secrets"
for secret_name in "${REQUIRED_SECRETS[@]}"; do
  echo " - ${secret_name}"
done

echo "[Preflight] Running production build check"
npm run build >/dev/null

if [[ -n "${CLOUDFLARE_API_TOKEN:-}" && -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "[Preflight] Validating wrangler configuration"
  ${WRANGLER_CMD} deploy --config workers.toml --env="" --dry-run >/dev/null
else
  echo "[Preflight] Skipping wrangler dry-run (missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID)"
fi

echo "[Preflight] OK: deployment prerequisites look good"
