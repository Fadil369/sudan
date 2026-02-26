#!/usr/bin/env bash
set -euo pipefail

# Pre-pull third-party Docker images referenced by docker-compose.yml.
#
# Why:
# - Some environments intermittently fail to pull images with:
#     "net/http: TLS handshake timeout"
# - Pulling with retries can help stabilize `docker compose up -d --build`.
#
# Usage:
#   bash scripts/pull-images.sh
#   bash scripts/pull-images.sh docker-compose.yml
#
# Env:
#   PULL_RETRIES=5            # number of attempts per image
#   PULL_SLEEP_SECONDS=2      # initial sleep between attempts (linear backoff)

COMPOSE_FILE="${1:-docker-compose.yml}"
PULL_RETRIES="${PULL_RETRIES:-5}"
PULL_SLEEP_SECONDS="${PULL_SLEEP_SECONDS:-2}"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed or not on PATH" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose is not available (install Docker Desktop / compose v2)" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is required to parse compose JSON output" >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

images="$(
  docker compose -f "$COMPOSE_FILE" config --format json \
    | node -e "let input='';process.stdin.on('data',c=>input+=c);process.stdin.on('end',()=>{const cfg=JSON.parse(input);const services=cfg.services||{};const images=new Set();for(const svc of Object.values(services)){if(svc && !svc.build && typeof svc.image==='string' && svc.image.trim()) images.add(svc.image.trim());}console.log([...images].sort().join('\\n'));});"
)"

if [[ -z "${images// }" ]]; then
  echo "No third-party images found in $COMPOSE_FILE"
  exit 0
fi

echo "Pulling images referenced by $COMPOSE_FILE:"
echo "$images" | sed 's/^/- /'
echo

while IFS= read -r image; do
  [[ -z "${image// }" ]] && continue

  attempt=1
  while true; do
    echo "docker pull $image (attempt $attempt/$PULL_RETRIES)"
    if docker pull "$image"; then
      echo "OK: $image"
      echo
      break
    fi

    if [[ "$attempt" -ge "$PULL_RETRIES" ]]; then
      echo "ERROR: failed to pull $image after $PULL_RETRIES attempts" >&2
      exit 1
    fi

    sleepSeconds=$((PULL_SLEEP_SECONDS * attempt))
    echo "Retrying in ${sleepSeconds}s..."
    echo
    sleep "$sleepSeconds"
    attempt=$((attempt + 1))
  done
done <<<"$images"

echo "All third-party images pulled successfully."

