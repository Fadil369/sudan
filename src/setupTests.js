import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}

  disconnect() {}

  observe() {}

  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  
  observe() {}
  
  unobserve() {}
  
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
      args[0]?.includes?.('Warning: Each child in a list should have a unique') ||
      args[0]?.includes?.('Warning: Failed prop type')
    ) {
      return;
    }
    originalError(...args);
  };

  console.warn = (...args) => {
    if (
      args[0]?.includes?.('componentWillReceiveProps has been renamed') ||
      args[0]?.includes?.('componentWillMount has been renamed')
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock crypto.subtle for biometric tests
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      generateKey: jest.fn().mockResolvedValue({}),
      sign: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      verify: jest.fn().mockResolvedValue(true),
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      encrypt: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      decrypt: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
    getRandomValues: jest.fn().mockReturnValue(new Uint32Array(10)),
  }
});

// Mock navigator.mediaDevices for camera/microphone tests
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [
        {
          stop: jest.fn(),
        },
      ],
    }),
    enumerateDevices: jest.fn().mockResolvedValue([]),
  }
});

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn().mockImplementation((success) =>
      success({
        coords: {
          latitude: 15.5007,
          longitude: 32.5599,
          accuracy: 1,
        },
      })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  }
});

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Mock Web Workers
class MockWorker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
    this.onerror = null;
  }

  postMessage(msg) {
    // Simulate async message handling
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: msg });
      }
    }, 0);
  }

  terminate() {}
}

Object.defineProperty(window, 'Worker', {
  value: MockWorker,
});

// Mock Notification API
class MockNotification {
  constructor(title, options) {
    this.title = title;
    this.options = options;
    this.onclick = null;
    this.onshow = null;
    this.onerror = null;
    this.onclose = null;
    
    // Simulate notification show
    setTimeout(() => {
      if (this.onshow) this.onshow();
    }, 0);
  }

  close() {
    if (this.onclose) this.onclose();
  }

  static requestPermission() {
    return Promise.resolve('granted');
  }
}

MockNotification.permission = 'granted';

Object.defineProperty(window, 'Notification', {
  value: MockNotification,
});

// Mock Canvas API for QR code generation tests
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
  }),
  putImageData: jest.fn(),
  createImageData: jest.fn().mockReturnValue([]),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn().mockReturnValue({ width: 0 }),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
});

// Mock HTMLMediaElement methods
Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  writable: true,
  value: false,
});

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: jest.fn(),
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Clear any DOM modifications
  document.body.innerHTML = '';
  document.head.innerHTML = '<meta charset="utf-8">';
  
  // Reset document properties
  document.documentElement.className = '';
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', 'en');
  
  // Clear any timers
  jest.clearAllTimers();
});

// Global test utilities
global.testUtils = {
  // Create a mock user for tests
  createMockUser: (overrides = {}) => ({
    id: 'test-user-123',
    name: 'Test User',
    oidNumber: '1.3.6.1.4.1.61026.1.1.01.001.123456789.1',
    nationalId: '199501234567890',
    email: 'test@example.com',
    phone: '+249123456789',
    ...overrides,
  }),

  // Create mock biometric data
  createMockBiometric: () => ({
    fingerprint: 'mock-fingerprint-hash',
    face: 'mock-face-hash',
    iris: 'mock-iris-hash',
    voice: 'mock-voice-hash',
  }),

  // Create mock OID structure
  createMockOID: (suffix = '1') => `1.3.6.1.4.1.61026.1.1.01.001.123456789.${suffix}`,

  // Wait for next tick (useful for async operations)
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),
};

// Setup performance observer mock
global.PerformanceObserver = class PerformanceObserver {
  constructor() {}
  observe() {}
  disconnect() {}
};

// Mock requestIdleCallback
global.requestIdleCallback = (cb) => {
  return setTimeout(cb, 0);
};

global.cancelIdleCallback = (id) => {
  clearTimeout(id);
};