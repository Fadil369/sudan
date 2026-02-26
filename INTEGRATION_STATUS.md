# Integration Status — `sudan.md` → Main Repo

Last updated: 2026-02-26

## Git Repository ✅
- Remote: `https://github.com/Fadil369/sudan.git`
- Branch: `main`
- Tracked files: `259`

## Code Integration Complete ✅

### Mobile App ✅
- Central API client: `mobile-app/src/services/api.js`
- Services wired (identity/oid/agency/health/education/infrastructure/mining/agriculture/…)
- Dev routing via Kong (`http://localhost:8000`) for Identity + AI (consistent local API surface)

### Public API ✅
- Service: `backend/public-api` (port `3010`)
- Endpoints:
  - `/api/infrastructure/*`
  - `/api/mining/*` (includes mining license CRUD)
  - `/api/agriculture/*`
  - `/api/oid/*` (OID adapter)
  - `/api/notifications/*` (notifications adapter)

### Mining Licenses (Full Lifecycle) ✅
- DB table: `database/init.sql` (`mining_licenses`)
  - Lifecycle fields: `status`, `approved_at/by`, `revoked_at/by`, `revoke_reason`, `updated_at`
- Gold service CRUD: `backend/gold-treasures-management`
  - List/get/approve/revoke/delete
- Public API mirrors the CRUD endpoints (gold-service-first with DB fallback)
- Optional admin protection:
  - Set `ADMIN_API_KEY` and send `X-Admin-Key` for approve/revoke/delete

### Docker Compose ✅
- `docker-compose.yml` includes portal + Kong + Postgres + Redis + monitoring + 15+ microservices
- Kong routes: `kong/kong.yml`

## Docker Deployment Note (TLS handshake timeout)

If Docker image pulls fail with:
```text
Error: net/http: TLS handshake timeout
```
this is typically an environment/network issue (Docker Hub reachability, DNS, VPN/proxy).

### Recommended fix (with retries)
```bash
bash scripts/pull-images.sh
docker compose up -d --build
```

### Manual pulls (if needed)
```bash
docker pull kong:3.4-alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull nginx:1.25-alpine
docker pull prom/prometheus:v2.45.0
docker pull grafana/grafana:10.0.0
docker pull hyperledger/fabric-peer:2.5
docker pull minio/minio:RELEASE.2023-09-23T03-47-50Z
```

You can also try increasing timeouts:
```bash
export DOCKER_CLIENT_TIMEOUT=180
export COMPOSE_HTTP_TIMEOUT=180
```

## OID System ✅
- Root: `1.3.6.1.4.1.61026`
