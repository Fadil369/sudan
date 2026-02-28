# Cloudflare Deployment Guide

Complete guide for deploying the Sudan Digital Government Portal to Cloudflare.

## Prerequisites

- Cloudflare account
- Domain (optional, can use `.pages.dev` subdomain)
- GitHub repository connected
- Wrangler CLI installed: `npm install -g wrangler`

## 1. Cloudflare Pages Setup

### Option A: Connect GitHub (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Click **Create a project** → **Connect to Git**
3. Select your repository: `Fadil369/sudan`
4. Configure build settings:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
   - **Environment variables:** (see below)

### Option B: Direct Upload (Manual)

```bash
# Login to Cloudflare
wrangler login

# Build locally
npm run build

# Deploy
wrangler pages deploy dist --project-name=sudan-gov
```

## 2. Environment Variables (Pages)

Set in Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables

### Production

```
VITE_API_BASE_URL=https://sudan-gov-api.workers.dev
VITE_API_VERSION=v1
VITE_OID_ROOT=1.3.6.1.4.1.61026
VITE_APP_NAME=Sudan Digital Government Portal
VITE_ENABLE_BIOMETRIC=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PWA=true
```

### Preview (optional, same as production)

## 3. Cloudflare Worker Setup

The Worker handles `/api/*` endpoints.

### Deploy Worker

```bash
# Login (if not already)
wrangler login

# Deploy
npm run worker:deploy
```

### Update Worker URL

After deployment, update these files with your actual worker URL:

1. **functions/api/[[path]].ts**
   ```typescript
   const WORKER_URL = 'https://sudan-gov-api.YOURSUBDOMAIN.workers.dev';
   ```

2. **public/_redirects**
   ```
   /api/*  https://sudan-gov-api.YOURSUBDOMAIN.workers.dev/api/:splat  200
   ```

3. Rebuild and redeploy:
   ```bash
   git add -A
   git commit -m "Update worker URL"
   git push
   ```

## 4. KV Namespaces

Create KV namespaces for data storage:

```bash
# Create production namespaces
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "OID_REGISTRY"
wrangler kv:namespace create "CITIZEN_PROFILES"

# Create preview namespaces
wrangler kv:namespace create "SESSIONS" --preview
wrangler kv:namespace create "CACHE" --preview
wrangler kv:namespace create "OID_REGISTRY" --preview
wrangler kv:namespace create "CITIZEN_PROFILES" --preview
```

Update `wrangler.toml` with the IDs returned:

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_SESSIONS_ID"
preview_id = "YOUR_SESSIONS_PREVIEW_ID"
```

## 5. D1 Database

Create D1 databases:

```bash
# Create production database
wrangler d1 create sudan-gov-main
wrangler d1 create sudan-gov-analytics

# Update wrangler.toml with IDs
# Then run migrations
npm run d1:migrate
```

## 6. R2 Storage

Create R2 buckets:

```bash
wrangler r2 bucket create sudan-gov-documents
wrangler r2 bucket create sudan-gov-media
wrangler r2 bucket create sudan-gov-audit-logs

# Preview buckets
wrangler r2 bucket create sudan-gov-documents-preview
wrangler r2 bucket create sudan-gov-media-preview
wrangler r2 bucket create sudan-gov-audit-logs-preview
```

## 7. Secrets

Set sensitive secrets (never commit these):

### Worker Secrets

```bash
wrangler secret put JWT_SECRET
wrangler secret put ENCRYPTION_KEY
wrangler secret put BIOMETRIC_API_KEY
wrangler secret put PAYMENT_GATEWAY_KEY
wrangler secret put SMS_API_KEY
wrangler secret put EMAIL_API_KEY
wrangler secret put BLOCKCHAIN_NODE_URL
```

### Pages Secrets

```bash
wrangler pages secret put JWT_SECRET --project-name=sudan-gov
# Repeat for all secrets
```

## 8. Durable Objects

Durable Objects require paid Workers plan.

1. Enable in dashboard: Workers & Pages → Your Worker → Settings → Durable Objects
2. Bindings are already configured in `wrangler.toml`
3. Deploy worker: `npm run worker:deploy`

## 9. Custom Domain (Optional)

### Add Domain to Pages

1. Cloudflare Dashboard → Pages → Your Project → Custom Domains
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `portal.gov.sd`)
4. Follow DNS instructions
5. Wait for SSL certificate provisioning (~5 min)

### Update CORS

Update `wrangler.toml`:

```toml
[vars]
CORS_ORIGIN = "https://portal.gov.sd"
```

Redeploy worker: `npm run worker:deploy`

## 10. Bindings in Pages Functions

Update Pages bindings in Cloudflare Dashboard:

1. Pages → Your Project → Settings → Functions
2. Add bindings:
   - **KV Namespace bindings:** SESSIONS, CACHE, OID_REGISTRY, CITIZEN_PROFILES
   - **D1 Database bindings:** DB, ANALYTICS_DB
   - **R2 Bucket bindings:** DOCUMENTS, MEDIA, AUDIT_LOGS
   - **Durable Object bindings:** SESSION_DO, RATE_LIMITER, CITIZEN_STREAM

## 11. Verify Deployment

### Test Pages

```bash
curl https://sudan-gov.pages.dev
```

### Test Worker

```bash
curl https://sudan-gov-api.YOURSUBDOMAIN.workers.dev/api/health
```

### Test Pages Functions

```bash
curl https://sudan-gov.pages.dev/api/health
```

## 12. Monitoring

### Analytics

- Dashboard → Pages → Your Project → Analytics
- Real-time visitors, bandwidth, requests

### Logs

```bash
# Worker logs
npm run worker:tail

# Or via Wrangler
wrangler tail sudan-gov-api
```

### Error Tracking

Consider integrating:
- Sentry (error tracking)
- Cloudflare Web Analytics (privacy-friendly)

## 13. CI/CD (Automatic Deployments)

Already configured via GitHub integration!

- **Push to `main`** → Deploys to production
- **Push to any branch** → Creates preview deployment
- **Pull requests** → Automatic preview comments

## Troubleshooting

### Build Fails

```bash
# Check build locally
npm run build

# Check logs in Cloudflare Dashboard
```

### API not working

1. Verify worker is deployed: `wrangler deployments list`
2. Check worker URL in `functions/api/[[path]].ts`
3. Verify CORS settings in worker

### Bindings not available

1. Check Pages Settings → Functions → Bindings
2. Verify IDs in `wrangler.toml`
3. Redeploy after changes

### Environment variables not working

- Client vars need `VITE_` prefix
- Set in Pages dashboard (not `.env` for production)
- Rebuild after changes

## Cost Estimate

### Free Plan (Suitable for MVP/Demo)
- Pages: Unlimited sites, 500 builds/month
- Workers: 100,000 requests/day
- KV: 100,000 reads/day, 1,000 writes/day
- D1: 100,000 rows read/day, 1GB storage
- R2: 10GB storage, 1M reads/month

### Paid Plan (Production)
- Workers Paid: $5/month (10M requests)
- R2: $0.015/GB/month storage
- D1: Based on usage
- Durable Objects: $0.15/million requests

## Security Checklist

- [ ] All secrets set (not committed)
- [ ] CORS restricted to production domain
- [ ] CSP headers configured (in `_headers`)
- [ ] Rate limiting enabled (via Durable Objects)
- [ ] SSL/TLS enabled (automatic on Cloudflare)
- [ ] API authentication implemented
- [ ] Audit logging active

## Next Steps

1. Complete initial deployment
2. Configure custom domain
3. Set up monitoring/alerts
4. Load test with realistic data
5. Security audit
6. User acceptance testing

---

**Support:**
- Cloudflare Docs: https://developers.cloudflare.com
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler
- Community Discord: https://discord.gg/cloudflaredev
