/**
 * RateLimiterDurableObject — per-IP rate limiting
 * Enforces 100 write requests per minute per IP address.
 */
export class RateLimiterDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    // In-memory counters (reset on cold start)
    this.counters = new Map();
    this.LIMIT = 100;           // requests per window
    this.WINDOW_MS = 60_000;    // 1 minute
  }

  async fetch(request) {
    const method = request.method;
    const url = new URL(request.url);

    if (method === 'POST' && url.pathname === '/check') {
      const body = await request.json().catch(() => ({}));
      const { ip } = body;
      if (!ip) return new Response(JSON.stringify({ allowed: true }), { headers: { 'Content-Type': 'application/json' } });

      const now = Date.now();
      const record = await this.state.storage.get(`rl:${ip}`) || { count: 0, windowStart: now };

      // Reset window if expired
      if (now - record.windowStart > this.WINDOW_MS) {
        record.count = 0;
        record.windowStart = now;
      }

      record.count++;
      await this.state.storage.put(`rl:${ip}`, record, { allowUnconfirmed: true });

      const allowed = record.count <= this.LIMIT;
      const retryAfter = allowed ? null : Math.ceil((record.windowStart + this.WINDOW_MS - now) / 1000);

      return new Response(JSON.stringify({
        allowed,
        remaining: Math.max(0, this.LIMIT - record.count),
        resetAt: new Date(record.windowStart + this.WINDOW_MS).toISOString(),
        ...(retryAfter && { retryAfter }),
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'GET' && url.pathname.startsWith('/status/')) {
      const ip = decodeURIComponent(url.pathname.slice(8));
      const record = await this.state.storage.get(`rl:${ip}`) || { count: 0, windowStart: Date.now() };
      return new Response(JSON.stringify(record), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Not found', { status: 404 });
  }
}
