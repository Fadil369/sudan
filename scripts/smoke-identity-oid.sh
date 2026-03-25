#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8000}"
IDENTITY_BASE_URL="${IDENTITY_BASE_URL:-${BASE_URL}}"
OID_BASE_URL="${OID_BASE_URL:-${BASE_URL}}"
PASSWORD="${PASSWORD:-SmokePass123!}"
STATE_CODE="${STATE_CODE:-01}"
TIMESTAMP="$(date +%s)"
PHONE_SUFFIX="$(printf '%09d' "$((TIMESTAMP % 1000000000))")"
PHONE_NUMBER="+249${PHONE_SUFFIX}"
EMAIL="smoke.${TIMESTAMP}@example.com"

echo "[smoke] Using identity API base: ${IDENTITY_BASE_URL}"
echo "[smoke] Using OID API base: ${OID_BASE_URL}"

register_payload=$(cat <<JSON
{
  "firstName": "Smoke",
  "middleName": "Test",
  "lastName": "Citizen${TIMESTAMP}",
  "dateOfBirth": "1990-01-15",
  "gender": "M",
  "phoneNumber": "${PHONE_NUMBER}",
  "email": "${EMAIL}",
  "address": "Khartoum Test District",
  "stateCode": "${STATE_CODE}",
  "password": "${PASSWORD}"
}
JSON
)

echo "[smoke] Registering test citizen"
register_response=$(curl --silent --show-error --fail \
  -X POST "${IDENTITY_BASE_URL}/api/identity/register" \
  -H 'Content-Type: application/json' \
  --data "${register_payload}")

national_id=$(node -e "const data = JSON.parse(process.argv[1]); process.stdout.write(data.nationalId || data.citizen?.national_id || '');" "$register_response")
oid=$(node -e "const data = JSON.parse(process.argv[1]); process.stdout.write(data.oid || data.citizen?.oid || '');" "$register_response")

if [[ -z "${national_id}" || -z "${oid}" ]]; then
  echo "[smoke] Registration response did not include nationalId and oid"
  echo "$register_response"
  exit 1
fi

echo "[smoke] Registered citizen: nationalId=${national_id} oid=${oid}"

login_payload=$(cat <<JSON
{
  "oid": "${oid}",
  "nationalId": "${national_id}",
  "password": "${PASSWORD}"
}
JSON
)

echo "[smoke] Logging in with OID"
login_response=$(curl --silent --show-error --fail \
  -X POST "${IDENTITY_BASE_URL}/api/identity/login" \
  -H 'Content-Type: application/json' \
  --data "${login_payload}")

token=$(node -e "const data = JSON.parse(process.argv[1]); process.stdout.write(data.token || '');" "$login_response")
login_oid=$(node -e "const data = JSON.parse(process.argv[1]); process.stdout.write(data.citizen?.oid || '');" "$login_response")

if [[ -z "${token}" || "${login_oid}" != "${oid}" ]]; then
  echo "[smoke] Login response was invalid"
  echo "$login_response"
  exit 1
fi

echo "[smoke] Fetching profile"
profile_response=$(curl --silent --show-error --fail \
  -H "Authorization: Bearer ${token}" \
  "${IDENTITY_BASE_URL}/api/identity/profile")

profile_oid=$(node -e "const data = JSON.parse(process.argv[1]); process.stdout.write(data.profile?.oid || '');" "$profile_response")

if [[ "${profile_oid}" != "${oid}" ]]; then
  echo "[smoke] Profile OID mismatch"
  echo "$profile_response"
  exit 1
fi

echo "[smoke] Resolving OID"
oid_response=$(curl --silent --show-error --fail \
  "${OID_BASE_URL}/api/v1/oid/${oid}")

resolved_oid=$(node -e "const data = JSON.parse(process.argv[1]); process.stdout.write(data.data?.oid || '');" "$oid_response")

if [[ "${resolved_oid}" != "${oid}" ]]; then
  echo "[smoke] OID resolution mismatch"
  echo "$oid_response"
  exit 1
fi

echo "[smoke] PASS"
echo "[smoke] Registered nationalId=${national_id} oid=${oid}"