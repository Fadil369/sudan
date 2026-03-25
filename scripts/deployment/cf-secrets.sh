#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

WRANGLER_CMD="npx wrangler"
if command -v wrangler >/dev/null 2>&1; then
  WRANGLER_CMD="wrangler"
elif ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: wrangler CLI is not available (global or via npx). Run: npm ci"
  exit 1
fi

SECRETS=(
  "JWT_SECRET"
  "ENCRYPTION_KEY"
  "BIOMETRIC_API_KEY"
  "PAYMENT_GATEWAY_KEY"
  "SMS_API_KEY"
  "EMAIL_API_KEY"
  "BLOCKCHAIN_NODE_URL"
)

echo "Setting Cloudflare Worker secrets for workers.toml"
echo "You will be prompted securely for each secret value."

for secret_name in "${SECRETS[@]}"; do
  echo ""
  echo "Setting secret: ${secret_name}"
  ${WRANGLER_CMD} secret put "${secret_name}" --config workers.toml
done

echo "All requested secrets were submitted."
