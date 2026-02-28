/**
 * SessionDurableObject — manages authenticated user sessions
 * Uses Durable Object storage for session persistence across Workers.
 */
export class SessionDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    try {
      if (method === 'POST' && path === '/create') {
        const body = await request.json();
        const { sessionId, userId, data } = body;
        if (!sessionId) return new Response('sessionId required', { status: 400 });

        const session = {
          sessionId,
          userId,
          data: data || {},
          createdAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        };

        await this.state.storage.put(`session:${sessionId}`, session);
        return new Response(JSON.stringify({ success: true, session }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'GET' && path.startsWith('/get/')) {
        const sessionId = path.slice(5);
        const session = await this.state.storage.get(`session:${sessionId}`);

        if (!session) {
          return new Response(JSON.stringify({ found: false }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Check expiry
        if (new Date(session.expiresAt) < new Date()) {
          await this.state.storage.delete(`session:${sessionId}`);
          return new Response(JSON.stringify({ found: false, reason: 'expired' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Update last accessed
        session.lastAccessedAt = new Date().toISOString();
        await this.state.storage.put(`session:${sessionId}`, session);

        return new Response(JSON.stringify({ found: true, session }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'DELETE' && path.startsWith('/delete/')) {
        const sessionId = path.slice(8);
        await this.state.storage.delete(`session:${sessionId}`);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'POST' && path === '/cleanup') {
        // Remove expired sessions
        const all = await this.state.storage.list({ prefix: 'session:' });
        const now = new Date();
        let removed = 0;
        for (const [key, session] of all) {
          if (new Date(session.expiresAt) < now) {
            await this.state.storage.delete(key);
            removed++;
          }
        }
        return new Response(JSON.stringify({ cleaned: removed }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not found', { status: 404 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
