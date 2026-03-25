#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

CF_PAGES_PROJECT="${CF_PAGES_PROJECT:-sudan-gov}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
DEPLOY_ENV="${DEPLOY_ENV:-production}"

WRANGLER_CMD="npx wrangler"
if command -v wrangler >/dev/null 2>&1; then
  WRANGLER_CMD="wrangler"
fi

echo "[Deploy] Running Cloudflare preflight"
bash ./scripts/deployment/cf-preflight.sh

echo "[Deploy] Building frontend"
npm run build

echo "[Deploy] Deploying Pages project: ${CF_PAGES_PROJECT}"
${WRANGLER_CMD} pages deploy dist --project-name "${CF_PAGES_PROJECT}"

echo "[Deploy] Deploying Worker"
if [[ "${DEPLOY_ENV}" == "staging" ]]; then
  ${WRANGLER_CMD} deploy --config workers.toml --env staging
else
  ${WRANGLER_CMD} deploy --config workers.toml --env=""
fi

if [[ "${RUN_MIGRATIONS}" == "true" ]]; then
  echo "[Deploy] Applying D1 migrations"
  if [[ "${DEPLOY_ENV}" == "staging" ]]; then
    bash ./scripts/deployment/cf-migrate.sh --env staging
  else
    bash ./scripts/deployment/cf-migrate.sh
  fi
fi

echo "[Deploy] Done"
