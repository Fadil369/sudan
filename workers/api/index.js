const CONFIG_LAST_CHECK_KEY = 'portal:config:lastCheck';
const MAX_SESSION_BYTES = 4096;

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...(init.headers || {}),
    },
    ...init,
  });
}

function buildUpstreamUrl(requestUrl, upstreamBaseUrl) {
  const incoming = new URL(requestUrl);
  const base = `${upstreamBaseUrl || ''}`.replace(/\/$/, '');
  const hasApiSuffix = /\/api$/.test(base);
  const pathname = incoming.pathname === '/api' ? '' : incoming.pathname.replace(/^\/api/, '');
  return new URL(`${hasApiSuffix ? '' : '/api'}${pathname}${incoming.search}`, `${base}/`);
}

export class SessionStore {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method === 'GET') {
      const value = (await this.state.storage.get('session')) || null;
      try {
        return Response.json({ session: value ? JSON.parse(value) : null });
      } catch (error) {
        return Response.json({ session: null });
      }
    }

    if (request.method === 'POST') {
      let payload;
      try {
        payload = await request.json();
      } catch (error) {
        return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }

      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return Response.json({ error: 'Invalid session payload' }, { status: 400 });
      }

      const payloadJson = JSON.stringify(payload);
      const payloadSize = new TextEncoder().encode(payloadJson).length;
      if (payloadSize > MAX_SESSION_BYTES) {
        return Response.json({ error: 'Session payload too large' }, { status: 413 });
      }

      await this.state.storage.put('session', payloadJson);
      return Response.json({ ok: true });
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const upstreamBaseUrl = env.UPSTREAM_API_BASE_URL || env.API_BASE_URL || '';

    if (pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        worker: true,
        upstreamConfigured: Boolean(upstreamBaseUrl),
        bindings: {
          kv: Boolean(env.CACHE_KV),
          d1: Boolean(env.APP_DB),
          r2: Boolean(env.ASSETS_R2),
          durableObject: Boolean(env.SESSION_STORE),
        },
      });
    }

    if (pathname === '/api/config') {
      return jsonResponse({
        app: env.APP_NAME,
        environment: env.APP_ENV,
        configCacheKey: CONFIG_LAST_CHECK_KEY,
        upstreamConfigured: Boolean(upstreamBaseUrl),
      });
    }

    if (pathname.startsWith('/api/') && upstreamBaseUrl) {
      try {
        const targetUrl = buildUpstreamUrl(request.url, upstreamBaseUrl);
        const proxied = new Request(targetUrl, {
          method: request.method,
          headers: request.headers,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
        });
        const response = await fetch(proxied);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (error) {
        return jsonResponse(
          {
            error: 'Upstream API unavailable',
            message: error instanceof Error ? error.message : 'Unknown proxy error',
          },
          { status: 502 }
        );
      }
    }

    return jsonResponse({ error: 'Not Found' }, { status: 404 });
  },
};
