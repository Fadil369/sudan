const CONFIG_LAST_CHECK_KEY = 'portal:config:lastCheck';
const MAX_SESSION_BYTES = 4096;

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

    if (pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        worker: true,
        bindings: {
          kv: Boolean(env.CACHE_KV),
          d1: Boolean(env.APP_DB),
          r2: Boolean(env.ASSETS_R2),
          durableObject: Boolean(env.SESSION_STORE),
        },
      });
    }

    if (pathname === '/api/config') {
      return Response.json({
        app: env.APP_NAME,
        environment: env.APP_ENV,
        configCacheKey: CONFIG_LAST_CHECK_KEY,
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
