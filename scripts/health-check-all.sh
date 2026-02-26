#!/usr/bin/env bash
set -euo pipefail

# Simple health checks for local docker-compose stack.
#
# Usage:
#   ./scripts/health-check-all.sh
#
# You can override endpoints:
#   PORTAL_HEALTH_URL=http://localhost:3000/health ./scripts/health-check-all.sh

PORTAL_HEALTH_URL="${PORTAL_HEALTH_URL:-http://localhost:3000/health}"
IDENTITY_HEALTH_URL="${IDENTITY_HEALTH_URL:-http://localhost:3001/health}"
OID_HEALTH_URL="${OID_HEALTH_URL:-http://localhost:3002/health}"
AUDIT_HEALTH_URL="${AUDIT_HEALTH_URL:-http://localhost:3004/health}"
AGENCY_HEALTH_URL="${AGENCY_HEALTH_URL:-http://localhost:3005/health}"
USSD_HEALTH_URL="${USSD_HEALTH_URL:-http://localhost:3006/health}"
AI_HEALTH_URL="${AI_HEALTH_URL:-http://localhost:3007/health}"
PUBLIC_API_HEALTH_URL="${PUBLIC_API_HEALTH_URL:-http://localhost:3010/health}"
DATA_QUALITY_HEALTH_URL="${DATA_QUALITY_HEALTH_URL:-http://localhost:3011/health}"
FRAUD_HEALTH_URL="${FRAUD_HEALTH_URL:-http://localhost:3012/health}"
REPORTING_HEALTH_URL="${REPORTING_HEALTH_URL:-http://localhost:3013/health}"
COMPLIANCE_HEALTH_URL="${COMPLIANCE_HEALTH_URL:-http://localhost:3014/health}"
BACKUP_HEALTH_URL="${BACKUP_HEALTH_URL:-http://localhost:3015/health}"
NOTIFICATION_HEALTH_URL="${NOTIFICATION_HEALTH_URL:-http://localhost:3016/health}"
ACCESS_HEALTH_URL="${ACCESS_HEALTH_URL:-http://localhost:3017/health}"
INTEGRATION_HEALTH_URL="${INTEGRATION_HEALTH_URL:-http://localhost:3018/health}"
PERFORMANCE_HEALTH_URL="${PERFORMANCE_HEALTH_URL:-http://localhost:3019/health}"
NILE_WATER_HEALTH_URL="${NILE_WATER_HEALTH_URL:-http://localhost:3020/health}"
FARMING_HEALTH_URL="${FARMING_HEALTH_URL:-http://localhost:3021/health}"
GOLD_HEALTH_URL="${GOLD_HEALTH_URL:-http://localhost:3022/health}"
PORTS_HEALTH_URL="${PORTS_HEALTH_URL:-http://localhost:3023/health}"
EDUCATION_HEALTH_URL="${EDUCATION_HEALTH_URL:-http://localhost:3024/health}"
HEALTHCARE_HEALTH_URL="${HEALTHCARE_HEALTH_URL:-http://localhost:3025/health}"
KONG_ADMIN_URL="${KONG_ADMIN_URL:-http://localhost:8001/status}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090/-/ready}"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3008/api/health}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
  local name="$1"
  local url="$2"
  echo -e "${YELLOW}→ ${name}: ${url}${NC}"
  if curl -fsS --max-time 5 "$url" >/dev/null; then
    echo -e "${GREEN}✓ ${name} OK${NC}"
  else
    echo -e "${RED}✗ ${name} FAILED${NC}"
    return 1
  fi
}

check "Portal" "${PORTAL_HEALTH_URL}"
check "Identity Service" "${IDENTITY_HEALTH_URL}"
check "OID Service" "${OID_HEALTH_URL}"
check "Audit Service" "${AUDIT_HEALTH_URL}"
check "Agency Integration" "${AGENCY_HEALTH_URL}"
check "USSD Service" "${USSD_HEALTH_URL}"
check "AI Service" "${AI_HEALTH_URL}"
check "Public API" "${PUBLIC_API_HEALTH_URL}"
check "Data Quality Engine" "${DATA_QUALITY_HEALTH_URL}"
check "Fraud Detection" "${FRAUD_HEALTH_URL}"
check "Reporting & Analytics" "${REPORTING_HEALTH_URL}"
check "Compliance Audit" "${COMPLIANCE_HEALTH_URL}"
check "Backup & Recovery" "${BACKUP_HEALTH_URL}"
check "Notification System" "${NOTIFICATION_HEALTH_URL}"
check "Access Control" "${ACCESS_HEALTH_URL}"
check "Integration Orchestrator" "${INTEGRATION_HEALTH_URL}"
check "Performance Monitor" "${PERFORMANCE_HEALTH_URL}"
check "Nile Water Management" "${NILE_WATER_HEALTH_URL}"
check "Farming & Agriculture" "${FARMING_HEALTH_URL}"
check "Gold & Treasures" "${GOLD_HEALTH_URL}"
check "Red Sea & Ports" "${PORTS_HEALTH_URL}"
check "Education Management" "${EDUCATION_HEALTH_URL}"
check "Healthcare Management" "${HEALTHCARE_HEALTH_URL}"
check "Kong Admin" "${KONG_ADMIN_URL}"
check "Prometheus" "${PROMETHEUS_URL}"
check "Grafana" "${GRAFANA_URL}"

echo -e "${GREEN}All health checks passed.${NC}"
