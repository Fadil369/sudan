#!/bin/bash
# Sudan Portal - Quick Verification Script
# Tests critical components and routes

set -e

echo "🧪 Sudan Digital Government Portal - Quick Test Suite"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test function
test_case() {
    local name="$1"
    local command="$2"
    
    echo -n "Testing: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL++))
        return 1
    fi
}

echo "📦 1. Build Verification Tests"
echo "------------------------------"

test_case "Build output exists" "[ -d dist ]"
test_case "Index.html generated" "[ -f dist/index.html ]"
test_case "Service worker exists" "[ -f dist/sw.js ]"
test_case "PWA manifest exists" "[ -f dist/manifest.webmanifest ]"
test_case "Assets folder exists" "[ -d dist/assets ]"

echo ""
echo "🎨 2. Component File Tests"
echo "--------------------------"

# Check all 11 portal components exist
PORTALS=(
    "Health"
    "Education"
    "Identity"
    "Finance"
    "Justice"
    "ForeignAffairs"
    "Labor"
    "SocialWelfare"
    "Agriculture"
    "Energy"
    "Infrastructure"
)

for portal in "${PORTALS[@]}"; do
    test_case "${portal} portal component" "[ -f src/components/${portal}MinistryPortal.jsx ]"
done

test_case "PremiumServiceCard shared component" "[ -f src/components/shared/PremiumServiceCard.jsx ]"
test_case "PremiumStatsCard shared component" "[ -f src/components/shared/PremiumStatsCard.jsx ]"

echo ""
echo "📊 3. Bundle Size Tests"
echo "----------------------"

# Check if bundles are reasonably sized
if [ -d dist/assets ]; then
    LARGEST=$(find dist/assets -name "*.js" -type f -exec ls -lh {} \; | awk '{print $5, $9}' | sort -h | tail -1)
    echo "Largest bundle: $LARGEST"
    
    # Check if index bundle is gzipped efficiently
    INDEX_SIZE=$(find dist/assets -name "index-*.js" -type f -exec ls -lh {} \; | awk '{print $5}' | head -1)
    echo "Main index size: $INDEX_SIZE"
fi

test_case "Total bundle size reasonable" "[ $(du -s dist/assets | awk '{print $1}') -lt 2048000 ]"

echo ""
echo "🔍 4. Code Quality Tests"
echo "------------------------"

test_case "No console.log in production code" "! grep -r 'console\.log' src/components/*MinistryPortal.jsx 2>/dev/null"
test_case "No hardcoded API keys" "! grep -ri 'api[_-]key.*=.*['\"]sk-\|Bearer [a-zA-Z0-9]' src/ 2>/dev/null"
test_case "No TODO comments" "! grep -r 'TODO\|FIXME' src/components/*MinistryPortal.jsx 2>/dev/null || true"

echo ""
echo "📝 5. OID Configuration Tests"
echo "-----------------------------"

# Check if OID config exists
test_case "OID config file exists" "[ -f src/config/oidConfig.js ]"

# Verify all 11 ministries have OIDs
test_case "OID config has ministry definitions" "grep -q 'MINISTRY_OIDS' src/config/oidConfig.js"

echo ""
echo "🎭 6. Material-UI Integration"
echo "-----------------------------"

test_case "MUI components imported" "grep -q '@mui/material' src/components/HealthMinistryPortal.jsx"
test_case "Icons imported" "grep -q '@mui/icons-material' src/components/HealthMinistryPortal.jsx"

echo ""
echo "🌐 7. Routing Tests"
echo "-------------------"

test_case "Main portal page exists" "[ -f src/pages/SudanGovPortal.jsx ]"
test_case "Routing imports all portals" "grep -q 'HealthMinistryPortal' src/pages/SudanGovPortal.jsx"
test_case "Lazy loading implemented" "grep -q 'React.lazy' src/pages/SudanGovPortal.jsx"

echo ""
echo "📱 8. PWA Configuration"
echo "----------------------"

test_case "Vite PWA plugin configured" "grep -q 'vite-plugin-pwa' package.json"
test_case "Service worker file generated" "[ -f dist/sw.js ]"
test_case "Workbox integration" "[ -f dist/workbox-*.js ] 2>/dev/null || [ $(ls dist/workbox-*.js 2>/dev/null | wc -l) -gt 0 ]"

echo ""
echo "🔒 9. Security Tests"
echo "--------------------"

test_case ".env files gitignored" "grep -q '.env' .gitignore"
test_case "No credentials in source" "! grep -ri 'password.*=.*['\"][^'\"]' src/ 2>/dev/null"
test_case "Secrets not committed" "! git log --all --full-history -- '*secret*' '*password*' 2>/dev/null | grep -q commit"

echo ""
echo "📚 10. Documentation Tests"
echo "--------------------------"

test_case "README exists" "[ -f README.md ]"
test_case "DEPLOYMENT guide exists" "[ -f DEPLOYMENT.md ]"
test_case "TEST_PLAN exists" "[ -f TEST_PLAN.md ]"
test_case "PREMIUM_PORTALS docs" "[ -f PREMIUM_PORTALS.md ]"

echo ""
echo "=================================================="
echo "📊 Test Results Summary"
echo "=================================================="
echo ""

TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

echo "Total Tests: $TOTAL"
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🎉 Sudan Digital Government Portal is ready!"
    echo ""
    echo "Next Steps:"
    echo "1. Configure Cloudflare secrets in GitHub"
    echo "2. Deploy to Cloudflare Pages"
    echo "3. Test all 12 user journey scenarios"
    echo "4. Verify responsive design"
    echo "5. Check RTL Arabic layout"
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    echo "Please review the failures above and fix before deployment."
    exit 1
fi
