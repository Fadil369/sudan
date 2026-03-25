#!/usr/bin/env bash
# Sudan Digital Government Portal — Cloudflare D1 Migration Script
# Applies all database migrations to the Cloudflare D1 databases.
#
# Usage:
#   ./scripts/deployment/cf-migrate.sh [--env staging] [--dry-run]
#
# Environment variables required:
#   CLOUDFLARE_API_TOKEN   — Cloudflare API token with D1 write permissions
#   CLOUDFLARE_ACCOUNT_ID  — Cloudflare account ID
#
# Options:
#   --env staging   Apply to staging databases (uses wrangler --env staging flag)
#   --dry-run       Print the wrangler commands without executing them

set -euo pipefail

# ─── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[migrate]${NC} $*"; }
success() { echo -e "${GREEN}[migrate]${NC} $*"; }
warn()    { echo -e "${YELLOW}[migrate]${NC} $*"; }
error()   { echo -e "${RED}[migrate]${NC} $*" >&2; }

# ─── Parse arguments ──────────────────────────────────────────────────────────
ENV_NAME=""
DRY_RUN=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      if [[ $# -lt 2 ]]; then
        error "--env requires a value (e.g. --env staging)"
        exit 1
      fi
      ENV_NAME="$2"
      shift 2
      ;;
    --env=*)
      ENV_NAME="${1#*=}"
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      error "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# ─── Validate prerequisites ───────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
WORKERS_CONFIG="${REPO_ROOT}/workers.toml"
MIGRATIONS_DIR="${REPO_ROOT}/database/migrations"

if ! command -v wrangler &>/dev/null && ! command -v npx &>/dev/null; then
  error "wrangler (or npx) not found. Run: npm ci"
  exit 1
fi

# Prefer local wrangler from node_modules
WRANGLER_CMD="npx wrangler"
if command -v wrangler &>/dev/null; then
  WRANGLER_CMD="wrangler"
fi

if [[ ! -f "${WORKERS_CONFIG}" ]]; then
  error "workers.toml not found at ${WORKERS_CONFIG}"
  exit 1
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  error "CLOUDFLARE_API_TOKEN is not set. Export it before running this script."
  exit 1
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  warn "CLOUDFLARE_ACCOUNT_ID is not set — wrangler may prompt for it."
fi

# ─── Migration definitions ────────────────────────────────────────────────────
# Format: "DATABASE_NAME:migration_file.sql"
# DATABASE_NAME must match the `database_name` field in workers.toml
declare -a MIGRATIONS=(
  "sudan-gov-main:001_initial.sql"
  "brainsait-unified-api:002_analytics.sql"
  "sudan-gov-main:003_users.sql"
)

# ─── Run migrations ───────────────────────────────────────────────────────────
info "Starting D1 migrations (repo: ${REPO_ROOT})"
[[ "${DRY_RUN}" == "true" ]] && warn "DRY RUN — commands will be printed but not executed."
if [[ -n "${ENV_NAME}" ]]; then
  info "Target environment: ${ENV_NAME}"
fi
echo ""

APPLIED=0
FAILED=0

for entry in "${MIGRATIONS[@]}"; do
  db_name="${entry%%:*}"
  migration_file="${entry#*:}"
  migration_path="${MIGRATIONS_DIR}/${migration_file}"

  if [[ ! -f "${migration_path}" ]]; then
    warn "Migration file not found, skipping: ${migration_path}"
    continue
  fi

  if [[ -n "${ENV_NAME}" ]]; then
    cmd="${WRANGLER_CMD} d1 execute ${db_name} --config ${WORKERS_CONFIG} --file=${migration_path} --remote --env ${ENV_NAME} --yes"
  else
    cmd="${WRANGLER_CMD} d1 execute ${db_name} --config ${WORKERS_CONFIG} --file=${migration_path} --remote --yes"
  fi

  info "Applying ${migration_file} → ${db_name}"
  info "  ${cmd}"

  if [[ "${DRY_RUN}" == "true" ]]; then
    success "  [dry-run] would execute the above command"
    APPLIED=$((APPLIED + 1))
    continue
  fi

  if [[ -n "${ENV_NAME}" ]]; then
    if ${WRANGLER_CMD} d1 execute "${db_name}" \
          --config "${WORKERS_CONFIG}" \
          --file="${migration_path}" \
          --remote \
          --env "${ENV_NAME}" \
          --yes; then
      success "  Applied ${migration_file} successfully."
      APPLIED=$((APPLIED + 1))
    else
      error "  Failed to apply ${migration_file} to ${db_name}."
      FAILED=$((FAILED + 1))
      # Continue trying remaining migrations but exit with error at the end
    fi
  else
    if ${WRANGLER_CMD} d1 execute "${db_name}" \
          --config "${WORKERS_CONFIG}" \
          --file="${migration_path}" \
          --remote \
          --yes; then
      success "  Applied ${migration_file} successfully."
      APPLIED=$((APPLIED + 1))
    else
      error "  Failed to apply ${migration_file} to ${db_name}."
      FAILED=$((FAILED + 1))
      # Continue trying remaining migrations but exit with error at the end
    fi
  fi
  echo ""
done

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
info "Migration summary: ${APPLIED} applied, ${FAILED} failed."
if (( FAILED > 0 )); then
  error "One or more migrations failed. Review the output above."
  exit 1
fi
success "All migrations completed successfully."
