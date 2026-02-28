/**
 * CitizenStreamDurableObject — WebSocket-based real-time event streaming
 * Broadcasts government service updates, notifications, and live stats
 * to connected clients using the WebSocket hibernation API.
 */
export class CitizenStreamDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    // Track connected WebSocket clients (per session)
    this.connections = new Set();
  }

  async fetch(request) {
    const upgradeHeader = request.headers.get('Upgrade');

    if (upgradeHeader === 'websocket') {
      return this._handleWebSocket(request);
    }

    // HTTP endpoint for broadcasting messages
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/broadcast') {
      const body = await request.json().catch(() => ({}));
      const count = this._broadcast(body);
      return new Response(JSON.stringify({ delivered: count }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET' && url.pathname === '/status') {
      return new Response(JSON.stringify({
        connections: this.connections.size,
        timestamp: new Date().toISOString(),
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('WebSocket endpoint. Connect with ws://', { status: 400 });
  }

  _handleWebSocket(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept and configure the server-side WebSocket
    server.accept();
    this.connections.add(server);

    // Send welcome message
    server.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Sudan Gov Portal real-time stream',
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    server.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ping') {
          server.send(JSON.stringify({ type: 'pong', ts: new Date().toISOString() }));
        } else if (msg.type === 'subscribe') {
          server.send(JSON.stringify({ type: 'subscribed', channels: msg.channels }));
        }
      } catch (_) {}
    });

    // Clean up on close
    server.addEventListener('close', () => {
      this.connections.delete(server);
    });

    server.addEventListener('error', () => {
      this.connections.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  _broadcast(message) {
    const data = JSON.stringify({ ...message, timestamp: new Date().toISOString() });
    let delivered = 0;
    for (const ws of this.connections) {
      try {
        ws.send(data);
        delivered++;
      } catch (_) {
        this.connections.delete(ws);
      }
    }
    return delivered;
  }
}
