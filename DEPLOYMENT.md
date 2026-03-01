# Cloudflare Deployment Guide

Complete guide for deploying Sudan Digital Government Portal to Cloudflare Pages + Workers.

---

## 🚀 Quick Deploy

### Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com
2. **API Token** - Generate with Pages:Edit and Workers:Edit permissions
3. **GitHub Secrets** - Configure in repository settings

---

## 📋 Step-by-Step Deployment

### Step 1: Get Cloudflare Credentials

#### 1.1 Get Account ID
```bash
# Login to Cloudflare dashboard
# Navigate to: Account > Overview
# Copy your Account ID (right sidebar)
```

#### 1.2 Create API Token
```bash
# Go to: Account > API Tokens > Create Token
# Use template: "Edit Cloudflare Workers"
# OR create custom token with:
#   - Account.Cloudflare Pages: Edit
#   - Account.Cloudflare Workers Scripts: Edit
#   - Account.D1: Edit (for database)
#   - Account.Workers KV Storage: Edit
#   - Account.Workers R2 Storage: Edit
```

---

### Step 2: Configure GitHub Secrets

Go to: **Repository Settings > Secrets and variables > Actions > New repository secret**

Add these secrets:

```bash
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

Optional secrets:
```bash
CF_PAGES_PROJECT=sudan-gov  # Default: sudan-gov
REACT_APP_API_URL=https://your-worker-url.workers.dev/api
```

---

### Step 3: Create Cloudflare Resources

#### 3.1 Create Pages Project

**Option A: Via Dashboard**
```
1. Login to Cloudflare Dashboard
2. Go to Pages
3. Create Project > Connect to Git
4. Select: Fadil369/sudan repository
5. Build settings:
   - Framework: Vite
   - Build command: npm run build
   - Build output: dist
   - Node version: 22
6. Click "Save and Deploy"
```

**Option B: Via CLI**
```bash
cd /Users/fadil369/sudan/sudan-main

# Build locally
npm run build

# Deploy to Pages
npx wrangler pages deploy dist --project-name=sudan-gov
```

#### 3.2 Create Worker

```bash
# Deploy worker (API backend)
npx wrangler deploy

# This creates: sudan-gov-api.{your-subdomain}.workers.dev
```

#### 3.3 Create D1 Databases

```bash
# Create main database
npx wrangler d1 create sudan-gov-main

# Create analytics database
npx wrangler d1 create sudan-gov-analytics

# Copy the database IDs and update wrangler.toml
```

#### 3.4 Create KV Namespaces

```bash
# Create KV namespaces
npx wrangler kv:namespace create "SESSIONS"
npx wrangler kv:namespace create "CACHE"
npx wrangler kv:namespace create "OID_REGISTRY"
npx wrangler kv:namespace create "CITIZEN_PROFILES"

# Copy the IDs and update wrangler.toml
```

#### 3.5 Create R2 Buckets

```bash
# Create R2 bucket for documents
npx wrangler r2 bucket create sudan-gov-documents

# Update wrangler.toml with bucket name
```

---

### Step 4: Update Configuration

#### 4.1 Update `wrangler.toml`

Replace placeholder IDs with real ones:

```toml
name = "sudan-gov-api"
main = "api/index.js"
compatibility_date = "2024-01-01"

# Replace with your actual IDs
[[kv_namespaces]]
binding = "SESSIONS"
id = "your_sessions_kv_id"

[[kv_namespaces]]
binding = "CACHE"
id = "your_cache_kv_id"

[[d1_databases]]
binding = "DB"
database_name = "sudan-gov-main"
database_id = "your_d1_database_id"

[[r2_buckets]]
binding = "DOCUMENTS"
bucket_name = "sudan-gov-documents"
```

#### 4.2 Set Environment Variables (Secrets)

```bash
# Set JWT secret
npx wrangler secret put JWT_SECRET
# Enter a strong random string (32+ characters)

# Set encryption key
npx wrangler secret put ENCRYPTION_KEY
# Enter another strong random string

# Set admin API key (optional)
npx wrangler secret put ADMIN_API_KEY
# Enter admin access key
```

---

### Step 5: Deploy Everything

#### 5.1 Commit and Push

```bash
cd /Users/fadil369/sudan/sudan-main

# Commit workflow fixes
git add .github/workflows/deploy-cloudflare.yml
git commit -m "🔧 Fix Cloudflare deployment workflow"
git push origin main
```

#### 5.2 Watch GitHub Actions

```bash
# Monitor deployment
gh run watch

# Or check in browser:
# https://github.com/Fadil369/sudan/actions
```

#### 5.3 Manual Deploy (if needed)

```bash
# Build frontend
npm run build

# Deploy Pages
npx wrangler pages deploy dist --project-name=sudan-gov

# Deploy Worker
npx wrangler deploy

# Run migrations
npx wrangler d1 execute sudan-gov-main --file=./database/migrations/001_initial.sql --remote
```

---

## 🧪 Testing Deployment

### Test Pages (Frontend)

```bash
# Your Pages URL will be:
https://sudan-gov.pages.dev

# Test routes:
https://sudan-gov.pages.dev/
https://sudan-gov.pages.dev/portal
https://sudan-gov.pages.dev/portal/health
https://sudan-gov.pages.dev/portal/education
https://sudan-gov.pages.dev/portal/identity
https://sudan-gov.pages.dev/portal/finance
https://sudan-gov.pages.dev/login
https://sudan-gov.pages.dev/dashboard
```

### Test Worker (Backend API)

```bash
# Health check
curl https://sudan-gov-api.{your-subdomain}.workers.dev/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-03-01T19:57:00.000Z",
  "checks": {
    "d1": "healthy",
    "kv_sessions": "healthy",
    "r2_documents": "healthy"
  }
}
```

### Run Integration Tests

```bash
# In browser console (on deployed Pages URL)
await window.cloudflareTests.runIntegrationTests()

# Expected:
# ✓ Pages deployment detected
# ✓ Worker API reachable
# ✓ D1 database operational
# ✓ KV namespaces operational
# ✓ R2 storage operational
```

---

## 🔄 Continuous Deployment

Once set up, every push to `main` triggers:

1. ✅ Build React app (Node 22.x)
2. ✅ Deploy to Cloudflare Pages
3. ✅ Deploy Worker API
4. ✅ Run D1 migrations
5. ✅ Health check

**Auto-deploy enabled!** Just push to main and Cloudflare handles the rest.

---

## 🐛 Troubleshooting

### Issue: "API Token not found"

**Solution:**
```bash
# Check GitHub secrets are set
gh secret list

# Add if missing
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

### Issue: "Wrangler requires Node 20+"

**Solution:** Already fixed in workflow (uses Node 22.x now)

### Issue: "Directory 'build' not found"

**Solution:** Already fixed (changed to `dist`)

### Issue: "KV namespace not found"

**Solution:**
```bash
# Create KV namespaces
npx wrangler kv:namespace create "SESSIONS"

# Update wrangler.toml with the returned ID
```

### Issue: "D1 database not found"

**Solution:**
```bash
# Create database
npx wrangler d1 create sudan-gov-main

# Update wrangler.toml with database_id
```

---

## 📊 Monitor Deployment

### Cloudflare Dashboard

```
Pages: https://dash.cloudflare.com/pages
Workers: https://dash.cloudflare.com/workers
D1: https://dash.cloudflare.com/d1
```

### GitHub Actions

```bash
# Watch latest run
gh run watch

# List recent runs
gh run list --limit 5

# View specific run
gh run view <run-id> --log
```

### Logs

```bash
# Stream Worker logs
npx wrangler tail

# View Pages deployment logs
# Go to Cloudflare Dashboard > Pages > Deployment
```

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain to Pages

```
1. Cloudflare Dashboard > Pages > sudan-gov
2. Custom domains > Set up a custom domain
3. Enter: portal.sudan.gov (or your domain)
4. Cloudflare will add DNS records automatically
5. Wait for SSL certificate (usually <5 minutes)
```

### Add Custom Domain to Worker

```
1. Cloudflare Dashboard > Workers > sudan-gov-api
2. Triggers > Add Custom Domain
3. Enter: api.sudan.gov
4. DNS records added automatically
```

---

## 📝 Environment Variables

### Pages Environment Variables

```bash
# Set in Cloudflare Dashboard > Pages > Settings > Environment variables

VITE_API_BASE_URL=https://api.sudan.gov
VITE_ENVIRONMENT=production
```

### Worker Secrets

```bash
# Set via Wrangler CLI
npx wrangler secret put JWT_SECRET
npx wrangler secret put ENCRYPTION_KEY
npx wrangler secret put ADMIN_API_KEY

# Or in Dashboard > Workers > sudan-gov-api > Settings > Variables
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] GitHub secrets configured (API token, Account ID)
- [ ] Cloudflare Pages project created
- [ ] Worker deployed successfully
- [ ] D1 databases created and migrated
- [ ] KV namespaces created and bound
- [ ] R2 bucket created and bound
- [ ] Secrets set (JWT_SECRET, etc.)
- [ ] Health check returns healthy
- [ ] Integration tests pass
- [ ] All ministry portals accessible
- [ ] Custom domains configured (optional)
- [ ] SSL certificates active

---

## 🚀 Quick Commands

```bash
# Build locally
npm run build

# Deploy Pages
npx wrangler pages deploy dist --project-name=sudan-gov

# Deploy Worker
npx wrangler deploy

# Stream logs
npx wrangler tail

# List deployments
npx wrangler deployments list

# Run migrations
npx wrangler d1 execute sudan-gov-main --file=./database/migrations/001_initial.sql --remote

# Test health
curl https://sudan-gov-api.workers.dev/api/health
```

---

**Status:** Ready to deploy! 🎉
**Estimated Time:** 10-15 minutes for full setup
**Support:** See Cloudflare docs at https://developers.cloudflare.com
