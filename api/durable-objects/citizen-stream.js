/**
 * CitizenStreamDurableObject — WebSocket-based real-time event streaming
 * Broadcasts government service updates, notifications, and live stats
 * to connected clients using the WebSocket Hibernation API.
 *
 * The Hibernation API (state.acceptWebSocket) allows the DO to be evicted
 * from memory between messages without dropping established connections,
 * significantly reducing CPU/memory costs for long-lived streams.
 */
export class CitizenStreamDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Hibernation API: CF runtime re-delivers messages after eviction
      this.state.acceptWebSocket(server);

      server.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Sudan Gov Portal real-time stream',
        timestamp: new Date().toISOString(),
      }));

      return new Response(null, { status: 101, webSocket: client });
    }

    const url = new URL(request.url);

    // HTTP endpoint for broadcasting messages (called by Worker routes)
    if (request.method === 'POST' && url.pathname === '/broadcast') {
      const body = await request.json().catch(() => ({}));
      const count = this._broadcast(body);
      return new Response(JSON.stringify({ delivered: count }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET' && url.pathname === '/status') {
      return new Response(JSON.stringify({
        connections: this.state.getWebSockets().length,
        timestamp: new Date().toISOString(),
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(
      'WebSocket endpoint. Connect using Upgrade: websocket header.',
      { status: 426 }
    );
  }

  // Called by the CF runtime for each inbound WS message (survives hibernation)
  webSocketMessage(ws, message) {
    try {
      const msg = JSON.parse(message);
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', ts: new Date().toISOString() }));
      } else if (msg.type === 'subscribe') {
        ws.send(JSON.stringify({ type: 'subscribed', channels: msg.channels }));
      }
    } catch (_) {}
  }

  // CF runtime calls this when a WS closes; no manual cleanup needed
  webSocketClose(_ws, _code, _reason, _wasClean) {}

  webSocketError(ws, _error) {
    ws.close(1011, 'Internal error');
  }

  _broadcast(message) {
    const data = JSON.stringify({ ...message, timestamp: new Date().toISOString() });
    let delivered = 0;
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(data);
        delivered++;
      } catch (_) {
        // CF runtime automatically removes dead sockets; safe to ignore
      }
    }
    return delivered;
  }
}
