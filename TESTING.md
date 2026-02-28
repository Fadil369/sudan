# Testing Cloudflare Integration

Complete guide for testing the Sudan Digital Government Portal's Cloudflare Pages + Workers integration.

## Quick Start

### 1. Local Development Testing

```bash
# Terminal 1: Start Worker (API backend)
npm run worker:dev

# Terminal 2: Start Vite dev server (frontend)
npm run dev

# Open browser
open http://localhost:3000
```

### 2. Browser Console Testing

Open the browser console and run:

```javascript
// Run comprehensive integration tests
await window.cloudflareTests.runIntegrationTests()

// Test individual components
await window.cloudflareTests.testPagesDeployment()
await window.cloudflareTests.testWorkerAPI()
await window.cloudflareTests.testD1Connection()
await window.cloudflareTests.testKVConnection()
await window.cloudflareTests.testR2Connection()
```

## Test Scenarios

### Frontend (Pages) Tests

**1. Pages Deployment Detection**
```javascript
const pagesTest = await window.cloudflareTests.testPagesDeployment()
console.log(pagesTest)
// Expected: { environment: 'cloudflare-pages' | 'local-development' | 'custom-domain', ... }
```

**2. Routing**
- Navigate to `/` (Landing page)
- Navigate to `/portal` (Main portal)
- Navigate to `/portal/health` (Direct ministry access)
- Navigate to `/login` (Login page)
- Navigate to `/dashboard` (Dashboard - requires auth)

**3. Ministry Direct Routes**
All these should work:
- `/portal/health`
- `/portal/education`
- `/portal/finance`
- `/portal/justice`
- `/portal/foreign-affairs`
- `/portal/labor`
- `/portal/social-welfare`
- `/portal/agriculture`
- `/portal/energy`
- `/portal/infrastructure`
- `/portal/identity`

### Backend (Worker) Tests

**1. Health Endpoint**
```bash
curl https://your-worker-url.workers.dev/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-01T00:00:00.000Z",
  "checks": {
    "d1": "healthy",
    "kv_sessions": "healthy",
    "r2_documents": "healthy"
  }
}
```

**2. Worker API Connectivity**
```javascript
const workerTest = await window.cloudflareTests.testWorkerAPI()
console.log(workerTest)
// Expected: { reachable: true, healthy: true, responseTime: <ms>, ... }
```

### Database (D1) Tests

**1. D1 Health Check**
```javascript
const d1Test = await window.cloudflareTests.testD1Connection()
console.log(d1Test)
// Expected: { available: true, operational: true, error: null }
```

**2. Direct D1 Query (via Wrangler)**
```bash
npm run d1:console
> SELECT 1 as health;
```

### KV Namespace Tests

**1. KV Health Check**
```javascript
const kvTest = await window.cloudflareTests.testKVConnection()
console.log(kvTest)
// Expected: { available: true, operational: true, error: null }
```

**2. List KV Keys**
```bash
npm run kv:list
```

### R2 Storage Tests

**1. R2 Health Check**
```javascript
const r2Test = await window.cloudflareTests.testR2Connection()
console.log(r2Test)
// Expected: { available: true, operational: true, error: null }
```

## Authentication Flow Test

**1. Login Flow**
```javascript
// Test authentication
const authTest = await window.cloudflareTests.testAuthFlow(
  '1.3.6.1.4.1.61026.1.1.1', // OID
  'testpassword' // Password
)
console.log(authTest)
// Expected: { success: true, token: 'jwt-token', error: null }
```

**2. Manual Login Test**
1. Navigate to `/login`
2. Enter OID: `1.3.6.1.4.1.61026.1.1.1`
3. Enter Password: `testpassword`
4. Click "Sign In"
5. Should redirect to `/dashboard`

**3. Biometric Login Test**
1. Navigate to `/login`
2. Click "Biometric Login"
3. (Mock) Should show biometric prompt
4. Should redirect to `/dashboard` on success

## Dashboard Integration Test

1. Login successfully
2. Navigate to `/dashboard`
3. Check Cloudflare Integration Status card:
   - Frontend (Pages): Should show "Deployed" or "Local Dev"
   - Backend (Worker): Should show "Healthy"

4. Test Quick Actions:
   - Click "Health Services" → Should navigate to `/portal/health`
   - Click "Education" → Should navigate to `/portal/education`
   - Click "Finance" → Should navigate to `/portal/finance`

## Performance Testing

### Response Times

```javascript
// Measure API response time
const start = performance.now()
await fetch('/api/health')
const duration = performance.now() - start
console.log(`API response: ${duration.toFixed(2)}ms`)
```

**Targets:**
- Worker API: < 100ms (global average)
- D1 queries: < 50ms
- KV reads: < 10ms
- R2 reads: < 200ms

### Build Output Analysis

```bash
npm run build

# Check output
ls -lh dist/
# Expected: ~1.5-2MB total (dist/ folder)

# Check individual chunks
ls -lh dist/assets/
# vendor chunk: ~150KB gzipped
# mui chunk: ~350KB gzipped  
# app chunk: ~750KB gzipped
```

## CI/CD Integration Test

### GitHub Actions

Push to `main` branch should trigger:

1. ✅ Build React App (Node 22.x)
2. ✅ Deploy to Cloudflare Pages
3. ✅ Deploy API Worker
4. ✅ Post-Deploy Health Check

Check status:
```bash
gh run list --repo Fadil369/sudan --limit 5
gh run view <run-id> --log
```

### Cloudflare Pages Build

Configuration check:
- Build command: `npm run build`
- Build output: `dist`
- Node version: 22.x (set via `NODE_VERSION` env var)

Successful build output should show:
```
✓ 13969 modules transformed
✓ built in ~10s
PWA v1.2.0
files generated
  dist/sw.js
  dist/workbox-*.js
```

## Error Scenarios

### 1. Worker Unreachable

**Simulate:**
```javascript
// Set invalid API URL
localStorage.setItem('test_api_url', 'https://invalid-worker.workers.dev')
```

**Expected Behavior:**
- Dashboard shows Backend status as "Error"
- Login fails with "connection error" message

### 2. D1 Database Down

**Expected Behavior:**
- Health endpoint returns `{ status: 'degraded', checks: { d1: 'error' } }`
- Dashboard shows degraded status

### 3. Authentication Failure

**Test:**
1. Navigate to `/login`
2. Enter invalid credentials
3. Submit

**Expected:**
- Error message: "Invalid credentials or connection error"
- No redirect
- No token stored

## Production Checklist

Before deploying to production:

- [ ] All integration tests pass
- [ ] Worker health endpoint returns `healthy`
- [ ] D1, KV, R2 all operational
- [ ] Authentication flow works
- [ ] All ministry routes accessible
- [ ] PWA installs correctly
- [ ] Service worker registers
- [ ] Mobile navigation works
- [ ] Response times within targets
- [ ] Build completes successfully
- [ ] No console errors in production build

## Debugging

### Common Issues

**Build fails with ESM error:**
- Check `package.json` has `"type": "module"`
- Check Node version >= 22.x

**Worker not accessible:**
- Verify worker is deployed: `wrangler deployments list`
- Check worker URL in environment variables
- Test worker directly: `curl https://your-worker.workers.dev/api/health`

**KV/D1/R2 not available:**
- Check bindings in `wrangler.toml`
- Verify namespace/database IDs
- Check Cloudflare dashboard

**401 Unauthorized:**
- Check JWT token in localStorage
- Verify token hasn't expired
- Check worker authentication middleware

### Logging

**Frontend logs:**
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'app:*')
```

**Worker logs:**
```bash
npm run worker:tail
```

## Monitoring

Post-deployment monitoring:

```bash
# Watch worker logs
wrangler tail sudan-gov-api

# Check analytics (requires Cloudflare dashboard)
# Pages → sudan-gov → Analytics
# Workers → sudan-gov-api → Analytics
```

---

**Test Coverage:** All critical paths covered
**Last Updated:** 2026-03-01
**Maintainer:** Sudan Digital Transformation Initiative
