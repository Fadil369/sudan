# Cloudflare Pages Functions for Sudan Digital Government Portal

This folder contains Cloudflare Pages Functions (serverless edge functions) that integrate with:
- Cloudflare Workers API
- D1 Database
- KV Namespaces
- R2 Storage
- Durable Objects
- Secrets Store

## Structure

```
functions/
├── api/              # API endpoints (/api/*)
│   ├── [[path]].ts   # Catch-all API proxy to Workers
│   └── health.ts     # Health check endpoint
├── auth/             # Authentication flows
│   └── callback.ts   # OAuth/OIDC callback handler
└── _middleware.ts    # Global middleware (CORS, auth, logging)
```

## Environment Variables

Set via `wrangler pages secret put`:
- JWT_SECRET
- ENCRYPTION_KEY
- BIOMETRIC_API_KEY
- PAYMENT_GATEWAY_KEY
- SMS_API_KEY
- EMAIL_API_KEY

## Bindings

Access via `context.env`:
- DB (D1)
- SESSIONS (KV)
- CACHE (KV)
- DOCUMENTS (R2)
- SESSION_DO (Durable Object)
