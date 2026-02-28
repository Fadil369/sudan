class SimpleEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, listener) {
    const existing = this.listeners.get(event) || [];
    existing.push(listener);
    this.listeners.set(event, existing);
    return this;
  }

  off(event, listener) {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(
      event,
      existing.filter((currentListener) => currentListener !== listener)
    );
    return this;
  }

  emit(event, ...args) {
    const existing = this.listeners.get(event) || [];
    existing.forEach((listener) => listener(...args));
    return existing.length > 0;
  }
}

class MockSocket extends SimpleEmitter {
  constructor() {
    super();
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
    this.emit('disconnect');
  }
}

class MockChatServer extends SimpleEmitter {
  constructor() {
    super();
    this.sockets = [];
  }

  connect() {
    const socket = new MockSocket();
    this.sockets.push(socket);
    this.emit('connection', socket);

    socket.on('message', (message) => {
      this.sockets.forEach((s) => {
        if (s.connected) {
          s.emit('message', message);
        }
      });
    });

    socket.on('disconnect', () => {
      this.sockets = this.sockets.filter((s) => s !== socket);
    });

    return socket;
  }
}

const mockChatServer = new MockChatServer();

export const connectToChatServer = () => {
  return mockChatServer.connect();
};
