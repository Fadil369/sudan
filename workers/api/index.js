export class SessionStore {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method === 'GET') {
      const value = await this.state.storage.get('session') || null;
      return Response.json({ session: value });
    }

    if (request.method === 'POST') {
      const payload = await request.json();
      await this.state.storage.put('session', payload);
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
      const key = 'portal:config:lastCheck';
      if (env.CACHE_KV) {
        await env.CACHE_KV.put(key, new Date().toISOString());
      }
      return Response.json({
        app: env.APP_NAME,
        environment: env.APP_ENV,
        lastCheckKey: key,
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
