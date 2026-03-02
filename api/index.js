/**
 * Sudan Digital Government Portal — Cloudflare Worker
 *
 * Cloudflare primitives used:
 *   KV         — SESSIONS, CACHE, OID_REGISTRY, CITIZEN_PROFILES
 *   R2         — DOCUMENTS, MEDIA, AUDIT_LOGS
 *   D1         — DB (main), ANALYTICS_DB
 *   Durable Objects — SESSION_DO, RATE_LIMITER, CITIZEN_STREAM
 *   Secrets    — JWT_SECRET, ENCRYPTION_KEY, …
 */

// ─── Durable Object Exports ───────────────────────────────────────────────────
export { SessionDurableObject } from './durable-objects/session.js';
export { RateLimiterDurableObject } from './durable-objects/rate-limiter.js';
export { CitizenStreamDurableObject } from './durable-objects/citizen-stream.js';

const CACHE_TTL = 300; // seconds (5 minutes)

const CORS_HEADERS = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
});

function jsonResponse(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Powered-By': 'Cloudflare Workers', ...extra },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message, status }, status);
}

function nowISO() { return new Date().toISOString(); }
function generateId() { return crypto.randomUUID(); }

async function checkRateLimit(env, request) {
  if (!env.RATE_LIMITER) return { allowed: true };
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const id = env.RATE_LIMITER.idFromName(`rate:${ip}`);
  const stub = env.RATE_LIMITER.get(id);
  try {
    const res = await stub.fetch(new Request('https://internal/check', {
      method: 'POST',
      body: JSON.stringify({ ip, ts: Date.now() }),
    }));
    return res.json();
  } catch (_) { return { allowed: true }; }
}

async function getSession(env, request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (!token || !env.SESSIONS) return null;
  return await env.SESSIONS.get(`session:${token}`, { type: 'json' });
}

async function cachedFetch(env, cacheKey, fetcher, ttl = CACHE_TTL) {
  if (env.CACHE) {
    const cached = await env.CACHE.get(cacheKey, { type: 'json' });
    if (cached) return { data: cached, fromCache: true };
  }
  const data = await fetcher();
  if (env.CACHE && data) {
    await env.CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: ttl });
  }
  return { data, fromCache: false };
}

async function logRequest(env, request, path, statusCode, durationMs) {
  if (!env.ANALYTICS_DB) return;
  try {
    await env.ANALYTICS_DB.prepare(
      `INSERT INTO performance_metrics (id, endpoint, method, status_code, duration_ms, country, colo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      generateId(), path, request.method, statusCode, durationMs,
      request.cf?.country || 'unknown', request.cf?.colo || 'unknown', nowISO()
    ).run();
  } catch (_) {}
}

// Ministry data modules (each file exports a getData(sub, env) function)
const MINISTRY_MODULES = {
  health: () => import('./health.js'),
  education: () => import('./education.js'),
  finance: () => import('./finance.js'),
  agriculture: () => import('./agriculture.js'),
  energy: () => import('./energy.js'),
  infrastructure: () => import('./infrastructure.js'),
  justice: () => import('./justice.js'),
  labor: () => import('./labor.js'),
  social_welfare: () => import('./social_welfare.js'),
  foreign_affairs: () => import('./foreign_affairs.js'),
  mining: () => import('./mining.js'),
};

export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = CORS_HEADERS(env.CORS_ORIGIN === '*' ? '*' : origin);

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check (unauthenticated)
    if (path === '/api/health' || path === '/health') {
      return jsonResponse({
        status: 'ok', service: 'Sudan Digital Government API', version: '1.0.0',
        environment: env.ENVIRONMENT || 'production', timestamp: nowISO(),
        cf: { colo: request.cf?.colo, country: request.cf?.country },
        bindings: {
          kv_sessions: !!env.SESSIONS, kv_cache: !!env.CACHE,
          kv_oid: !!env.OID_REGISTRY, r2_documents: !!env.DOCUMENTS,
          d1_main: !!env.DB, d1_analytics: !!env.ANALYTICS_DB,
          do_session: !!env.SESSION_DO, do_ratelimit: !!env.RATE_LIMITER,
        },
      }, 200, corsHeaders);
    }

    if (method !== 'GET') {
      const { allowed } = await checkRateLimit(env, request);
      if (!allowed) return errorResponse('Too many requests', 429);
    }

    const segments = path.slice(1).split('/').filter(Boolean);
    if (segments[0] !== 'api') return errorResponse('Not found', 404);

    const resource = segments[1];
    const subResource = segments[2];
    let response;

    try {
      // Ministry data routes
      if (MINISTRY_MODULES[resource]) {
        const cacheKey = `ministry:${resource}:${subResource || 'overview'}`;
        const { data } = await cachedFetch(env, cacheKey, async () => {
          try {
            const mod = await MINISTRY_MODULES[resource]();
            if (mod.default && typeof mod.default.fetch === 'function') {
              const res = await mod.default.fetch(request, env);
              if (!res.ok) return { error: `Ministry module returned ${res.status}` };
              const contentType = res.headers.get('Content-Type') || '';
              if (!contentType.includes('application/json')) return { error: 'Ministry module returned non-JSON response' };
              return res.json();
            }
            if (typeof mod.getData === 'function') return mod.getData(subResource, env);
            if (mod.default && typeof mod.default === 'object') return mod.default;
            return { error: 'Ministry module not available' };
          } catch (_) {
            return { error: 'Ministry data temporarily unavailable' };
          }
        });
        return jsonResponse({ ...data, _timestamp: nowISO() }, 200, corsHeaders);
      }

      switch (resource) {
        case 'citizen': {
          if (subResource === 'search' && method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const { nationalId } = body;
            if (!nationalId) { response = errorResponse('nationalId required'); break; }
            if (env.CITIZEN_PROFILES) {
              const profile = await env.CITIZEN_PROFILES.get(`nid:${nationalId}`, { type: 'json' });
              if (profile) { response = jsonResponse({ found: true, profile }, 200, corsHeaders); break; }
            }
            if (env.DB) {
              const result = await env.DB.prepare(
                'SELECT id, national_id, oid, full_name_ar, full_name_en, state, status FROM citizens WHERE national_id = ?'
              ).bind(nationalId).first();
              if (result) { response = jsonResponse({ found: true, profile: result }, 200, corsHeaders); break; }
            }
            response = jsonResponse({ found: false }, 200, corsHeaders);
          } else { response = errorResponse('Not found', 404); }
          break;
        }

        case 'documents': {
          if (method === 'POST' && subResource === 'upload') {
            const formData = await request.formData().catch(() => null);
            if (!formData) { response = errorResponse('Invalid form data'); break; }
            const file = formData.get('file');
            const citizenId = formData.get('citizenId') || 'anonymous';
            const docType = formData.get('docType') || 'document';
            if (env.DOCUMENTS) {
              const key = `${citizenId}/${docType}/${generateId()}`;
              await env.DOCUMENTS.put(key, file, {
                httpMetadata: { contentType: 'application/pdf' },
                customMetadata: { citizenId, docType, uploadedAt: nowISO() },
              });
              if (env.DB) {
                await env.DB.prepare(
                  'INSERT INTO documents (id, citizen_id, doc_type, r2_key, created_at) VALUES (?, ?, ?, ?, ?)'
                ).bind(generateId(), citizenId, docType, key, nowISO()).run();
              }
              response = jsonResponse({ success: true, documentKey: key }, 201, corsHeaders);
            } else {
              response = errorResponse('Document storage not available', 503);
            }
          } else if (method === 'GET' && subResource) {
            const obj = env.DOCUMENTS ? await env.DOCUMENTS.get(decodeURIComponent(subResource)) : null;
            if (!obj) { response = errorResponse('Document not found', 404); break; }
            response = new Response(obj.body, {
              headers: { 'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream', ...corsHeaders },
            });
          } else { response = errorResponse('Not found', 404); }
          break;
        }

        case 'services': {
          if (subResource === 'request' && method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const { citizenId, ministry, serviceType, notes } = body;
            if (!ministry || !serviceType) { response = errorResponse('ministry and serviceType required'); break; }
            const reqId = generateId();
            const refNo = `REF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            if (env.DB) {
              await env.DB.prepare(
                'INSERT INTO service_requests (id, citizen_id, ministry, service_type, reference_no, notes, submitted_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
              ).bind(reqId, citizenId || null, ministry, serviceType, refNo, notes || null, nowISO(), nowISO()).run();
            }
            response = jsonResponse({ success: true, requestId: reqId, referenceNo: refNo }, 201, corsHeaders);
          } else { response = errorResponse('Not found', 404); }
          break;
        }

        case 'analytics': {
          if (subResource === 'dashboard') {
            const { data } = await cachedFetch(env, 'analytics:dashboard', async () => {
              if (env.ANALYTICS_DB) {
                const stats = await env.ANALYTICS_DB.prepare(
                  'SELECT * FROM daily_stats ORDER BY date DESC LIMIT 7'
                ).all();
                return { stats: stats.results || [], generated_at: nowISO() };
              }
              return { stats: [], note: 'Analytics DB not connected', generated_at: nowISO() };
            }, 60);
            response = jsonResponse(data, 200, corsHeaders);
          } else { response = errorResponse('Not found', 404); }
          break;
        }

        case 'oid': {
          if (!subResource) { response = errorResponse('OID parameter required'); break; }
          if (env.OID_REGISTRY) {
            const entry = await env.OID_REGISTRY.get(`oid:${subResource}`, { type: 'json' });
            if (entry) { response = jsonResponse({ oid: subResource, ...entry }, 200, corsHeaders); break; }
          }
          if (env.DB) {
            const result = await env.DB.prepare('SELECT * FROM oid_registry WHERE oid = ?').bind(subResource).first();
            if (result) { response = jsonResponse(result, 200, corsHeaders); break; }
          }
          response = jsonResponse({ oid: subResource, found: false }, 404, corsHeaders);
          break;
        }

        case 'stream': {
          if (!env.CITIZEN_STREAM) { response = errorResponse('Streaming not available', 503); break; }
          const streamId = env.CITIZEN_STREAM.idFromName('global');
          const stub = env.CITIZEN_STREAM.get(streamId);
          response = await stub.fetch(request);
          break;
        }

        case 'auth': {
          if ((subResource === 'session' || subResource === 'login') && method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const username = body.username || body.oid;
            const { password } = body;
            if (!username || !password) { response = errorResponse('username/oid and password required'); break; }
            const sessionToken = generateId();
            const session = {
              token: sessionToken, userId: username, createdAt: nowISO(),
              expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
            };
            if (env.SESSIONS) {
              await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify(session), { expirationTtl: 8 * 3600 });
            }
            response = jsonResponse({ success: true, token: sessionToken, expiresAt: session.expiresAt }, 201, corsHeaders);
          } else if (subResource === 'biometric' && method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const { credentialId, assertion } = body;
            const sessionToken = generateId();
            const session = {
              token: sessionToken, userId: credentialId || 'biometric-user', createdAt: nowISO(),
              expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
              authMethod: 'biometric',
            };
            if (env.SESSIONS) {
              await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify(session), { expirationTtl: 8 * 3600 });
            }
            response = jsonResponse({ success: true, token: sessionToken, expiresAt: session.expiresAt, authMethod: 'biometric' }, 201, corsHeaders);
          } else if (subResource === 'logout' && method === 'POST') {
            const session = await getSession(env, request);
            if (session && env.SESSIONS) await env.SESSIONS.delete(`session:${session.token}`);
            response = jsonResponse({ success: true }, 200, corsHeaders);
          } else { response = errorResponse('Not found', 404); }
          break;
        }

        case 'user': {
          if (subResource === 'profile' && method === 'GET') {
            const session = await getSession(env, request);
            if (!session) { response = errorResponse('Unauthorized', 401); break; }
            let profile = null;
            if (env.CITIZEN_PROFILES) {
              profile = await env.CITIZEN_PROFILES.get(`user:${session.userId}`, { type: 'json' });
            }
            if (env.DB && !profile) {
              profile = await env.DB.prepare(
                'SELECT id, national_id, oid, full_name_ar, full_name_en, state, status FROM citizens WHERE national_id = ? OR oid = ?'
              ).bind(session.userId, session.userId).first();
            }
            response = jsonResponse({
              success: true,
              userId: session.userId,
              profile: profile || { userId: session.userId },
              session: { createdAt: session.createdAt, expiresAt: session.expiresAt },
            }, 200, corsHeaders);
          } else { response = errorResponse('Not found', 404); }
          break;
        }

        default:
          response = errorResponse('API endpoint not found', 404);
      }
    } catch (err) {
      console.error('[Worker] Error:', err);
      response = errorResponse('Internal server error', 500);
    }

    const duration = Date.now() - startTime;
    ctx.waitUntil(logRequest(env, request, path, response.status, duration));
    if (method !== 'GET' && env.AUDIT_LOGS) {
      ctx.waitUntil(env.AUDIT_LOGS.put(
        `logs/${nowISO().slice(0, 10)}/${generateId()}.json`,
        JSON.stringify({ method, path, ip: request.headers.get('CF-Connecting-IP'), status: response.status, duration, ts: nowISO() })
      ));
    }
    return response;
  },
};
