#!/usr/bin/env bash
set -euo pipefail

# Database migration helper for local/dev Postgres.
# Applies ./database/init.sql by default.
#
# Usage:
#   DB_HOST=localhost DB_PORT=5432 DB_NAME=sudan_identity DB_USER=sudan_admin DB_PASSWORD=... ./scripts/deployment/migrate.sh

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sudan_identity}"
DB_USER="${DB_USER:-sudan_admin}"
DB_PASSWORD="${DB_PASSWORD:-SudanDB2024!}"
SCHEMA_FILE="${SCHEMA_FILE:-database/init.sql}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! command -v psql >/dev/null 2>&1; then
  echo -e "${RED}✗ psql is not installed or not in PATH${NC}"
  exit 1
fi

if [[ ! -f "${SCHEMA_FILE}" ]]; then
  echo -e "${RED}✗ Schema file not found: ${SCHEMA_FILE}${NC}"
  exit 1
fi

export PGPASSWORD="${DB_PASSWORD}"

echo -e "${YELLOW}Checking database existence...${NC}"
DB_EXISTS=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}';" || true)

if [[ "${DB_EXISTS}" != "1" ]]; then
  echo -e "${YELLOW}Creating database ${DB_NAME}...${NC}"
  psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${DB_NAME}\";"
  echo -e "${GREEN}✓ Database created${NC}"
else
  echo -e "${GREEN}✓ Database exists${NC}"
fi

echo -e "${YELLOW}Applying schema: ${SCHEMA_FILE}${NC}"
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 -f "${SCHEMA_FILE}"
echo -e "${GREEN}✓ Migration complete${NC}"

