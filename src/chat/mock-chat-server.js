import { EventEmitter } from 'events';

class MockSocket extends EventEmitter {
  constructor() {
    super();
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
    this.emit('disconnect');
  }
}

class MockChatServer extends EventEmitter {
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
