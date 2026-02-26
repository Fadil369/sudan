#!/usr/bin/env bash
set -euo pipefail

# Build (and optionally push) Docker images for this repo.
# - Always builds the main web portal image from ./Dockerfile
# - Optionally builds backend microservices if they exist under ./backend/<service>/Dockerfile
#
# Usage:
#   VERSION=1.0.0 REGISTRY=registry.example.com PUSH=true ./scripts/deployment/build-and-push.sh

REGISTRY="${REGISTRY:-your-registry.com}"
VERSION="${VERSION:-1.0.0}"
PUSH="${PUSH:-false}"

# Backend microservices (built only if present)
BACKEND_SERVICES=(
  "oid-service"
  "identity-service"
  "agency-integration"
  "ussd-service"
  "ai-service"
  "public-api"
  "audit-service"
  "data-quality-engine"
  "fraud-detection-system"
  "reporting-analytics-engine"
  "compliance-audit-engine"
  "backup-recovery-system"
  "notification-system"
  "access-control-engine"
  "integration-orchestrator"
  "performance-monitor"
  "nile-water-management"
  "farming-agriculture-system"
  "gold-treasures-management"
  "red-sea-ports-management"
  "education-management"
  "healthcare-management"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if ! command -v docker >/dev/null 2>&1; then
  echo -e "${RED}✗ docker is not installed or not in PATH${NC}"
  exit 1
fi

echo -e "${GREEN}Starting build process...${NC}"

# Build main web portal
echo -e "${YELLOW}Building sudan-digital-identity (web portal)...${NC}"
docker build \
  -t "${REGISTRY}/sudan-digital-identity:${VERSION}" \
  -t "${REGISTRY}/sudan-digital-identity:latest" \
  -f Dockerfile \
  .
echo -e "${GREEN}✓ sudan-digital-identity built successfully${NC}"

# Build backend microservices if present
for service in "${BACKEND_SERVICES[@]}"; do
  if [[ -f "backend/${service}/Dockerfile" ]]; then
    echo -e "${YELLOW}Building ${service}...${NC}"
    docker build \
      -t "${REGISTRY}/${service}:${VERSION}" \
      -t "${REGISTRY}/${service}:latest" \
      -f "backend/${service}/Dockerfile" \
      "backend/${service}/"
    echo -e "${GREEN}✓ ${service} built successfully${NC}"
  else
    echo -e "${YELLOW}↷ Skipping ${service} (missing backend/${service}/Dockerfile)${NC}"
  fi
done

if [[ "${PUSH}" == "true" ]]; then
  echo -e "${GREEN}PUSH=true → pushing images...${NC}"

  docker push "${REGISTRY}/sudan-digital-identity:${VERSION}"
  docker push "${REGISTRY}/sudan-digital-identity:latest"

  for service in "${BACKEND_SERVICES[@]}"; do
    if [[ -f "backend/${service}/Dockerfile" ]]; then
      docker push "${REGISTRY}/${service}:${VERSION}"
      docker push "${REGISTRY}/${service}:latest"
    fi
  done

  echo -e "${GREEN}✓ Push complete${NC}"
else
  echo -e "${YELLOW}PUSH=false → not pushing images${NC}"
fi

echo -e "${GREEN}All requested images built successfully!${NC}"
