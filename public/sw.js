// Sudan Digital Identity System - Service Worker
// Offline-first PWA implementation for government services

const CACHE_NAME = 'sudan-identity-v1.0.0';
const OFFLINE_VERSION = 1;
const OFFLINE_URL = '/offline.html';
const CACHE_TIMEOUT = 5000; // 5 seconds timeout for cache operations

// Cache strategies
const CACHE_FIRST = 'cache-first';
const NETWORK_FIRST = 'network-first';
const STALE_WHILE_REVALIDATE = 'stale-while-revalidate';
const NETWORK_ONLY = 'network-only';
const CACHE_ONLY = 'cache-only';

// Critical resources that must be cached for offline functionality
const CRITICAL_CACHE_RESOURCES = [
  '/',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Critical pages
  '/identity',
  '/services',
  '/documents',
  '/emergency',
  // Ministry portals (critical data)
  '/ministries/health',
  '/ministries/education',
  '/ministries/interior',
];

// Resources that can be cached opportunistically
const RUNTIME_CACHE_RESOURCES = [
  // API endpoints for offline access
  '/api/citizen/',
  '/api/documents/',
  '/api/notifications/',
  '/api/services/',
  // Ministry APIs (cached responses)
  '/api/ministries/health/',
  '/api/ministries/education/',
  '/api/ministries/interior/',
  '/api/ministries/finance/',
  // Static assets
  '/static/',
  '/images/',
  '/fonts/',
];

// Resources that should never be cached (sensitive data)
const NO_CACHE_RESOURCES = [
  '/api/auth/',
  '/api/biometric/',
  '/api/blockchain/',
  '/api/admin/',
  '/api/secure/',
  'login',
  'logout',
  'password',
  'token',
  'authentication',
];

// Offline fallback responses
const OFFLINE_FALLBACKS = {
  '/api/': '/offline-api-response.json',
  '/ministries/': '/offline-ministry.html',
  '/services/': '/offline-services.html',
  '/documents/': '/offline-documents.html',
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching critical resources');
        return cache.addAll(CRITICAL_CACHE_RESOURCES);
      })
      .then(() => {
        // Create offline fallback responses
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put('/offline-api-response.json', new Response(
            JSON.stringify({
              error: 'Service temporarily unavailable',
              message: 'This service is currently offline. Please try again when you have an internet connection.',
              message_ar: 'هذه الخدمة غير متاحة حالياً. يرجى المحاولة مرة أخرى عند توفر اتصال بالإنترنت.',
              timestamp: new Date().toISOString(),
              offline: true
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          ));

          cache.put('/offline-ministry.html', new Response(
            createOfflinePage('Ministry Services Offline', 'خدمات الوزارة غير متاحة'),
            { headers: { 'Content-Type': 'text/html' } }
          ));

          return cache.put('/offline-services.html', new Response(
            createOfflinePage('Government Services Offline', 'الخدمات الحكومية غير متاحة'),
            { headers: { 'Content-Type': 'text/html' } }
          ));
        });
      })
      .then(() => {
        console.log('[ServiceWorker] Critical resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Failed to cache critical resources:', error);
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[ServiceWorker] Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip chrome-extension and other internal requests
  if (url.origin !== location.origin && !isAllowedExternalDomain(url.origin)) {
    return;
  }

  // Determine cache strategy based on request type
  const strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
      .catch((error) => {
        console.error('[ServiceWorker] Request failed:', error);
        return getOfflineFallback(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'background-sync-sudan-identity') {
    event.waitUntil(syncOfflineActions());
  }
});

// Push notifications for government alerts
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  let notificationData = {};
  
  if (event.data) {
    notificationData = event.data.json();
  }

  const title = notificationData.title || 'Sudan Digital Identity';
  const options = {
    body: notificationData.body || 'You have a new notification from Sudan Government',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    data: notificationData,
    actions: [
      {
        action: 'view',
        title: 'View - عرض',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss - إغلاق',
        icon: '/icons/action-dismiss.png'
      }
    ],
    requireInteraction: notificationData.urgent || false,
    vibrate: notificationData.urgent ? [200, 100, 200] : [100],
    tag: notificationData.tag || 'sudan-gov-notification'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.notification.data);
  
  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If not, open a new window/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      getCacheStatus().then((status) => {
        event.ports[0].postMessage(status);
      })
    );
  }
});

// Helper functions

function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Never cache sensitive resources
  if (NO_CACHE_RESOURCES.some(resource => pathname.includes(resource))) {
    return NETWORK_ONLY;
  }

  // API requests - network first with cache fallback
  if (pathname.startsWith('/api/')) {
    return NETWORK_FIRST;
  }

  // Static assets - cache first
  if (pathname.startsWith('/static/') || pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    return CACHE_FIRST;
  }

  // HTML pages - stale while revalidate
  if (request.headers.get('accept').includes('text/html')) {
    return STALE_WHILE_REVALIDATE;
  }

  // Default strategy
  return NETWORK_FIRST;
}

async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_FIRST:
      return cacheFirst(request);
    case NETWORK_FIRST:
      return networkFirst(request);
    case STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    case NETWORK_ONLY:
      return fetch(request);
    case CACHE_ONLY:
      return caches.match(request);
    default:
      return networkFirst(request);
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request);
    return cachedResponse;
  }
  
  return fetchAndCache(request);
}

async function networkFirst(request) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), CACHE_TIMEOUT)
      )
    ]);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  const networkResponsePromise = fetchAndCache(request);
  
  return cachedResponse || networkResponsePromise;
}

async function fetchAndCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    throw error;
  }
}

function getOfflineFallback(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // API requests
  if (pathname.startsWith('/api/')) {
    return caches.match('/offline-api-response.json');
  }

  // Check for specific offline fallbacks
  for (const [pattern, fallback] of Object.entries(OFFLINE_FALLBACKS)) {
    if (pathname.startsWith(pattern)) {
      return caches.match(fallback);
    }
  }

  // HTML requests
  if (request.headers.get('accept').includes('text/html')) {
    return caches.match(OFFLINE_URL);
  }

  // Default fallback
  return new Response('Resource not available offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

function createOfflinePage(title, titleAr) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${title} | ${titleAr}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 { color: #2c5aa0; margin-bottom: 10px; }
        h2 { color: #666; margin-bottom: 20px; }
        p { color: #777; line-height: 1.6; margin-bottom: 30px; }
        button {
          background: #2c5aa0;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover { background: #1e3d6f; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🇸🇩</div>
        <h1>${titleAr}</h1>
        <h2>${title}</h2>
        <p>
          عذراً، هذه الخدمة غير متاحة حالياً بدون اتصال بالإنترنت. 
          يرجى التحقق من اتصالك والمحاولة مرة أخرى.
        </p>
        <p>
          Sorry, this service is currently unavailable offline. 
          Please check your internet connection and try again.
        </p>
        <button onclick="window.location.reload()">
          إعادة المحاولة / Retry
        </button>
      </div>
    </body>
    </html>
  `;
}

async function syncOfflineActions() {
  try {
    console.log('[ServiceWorker] Syncing offline actions');
    
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await processOfflineAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync action:', error);
      }
    }
    
    console.log('[ServiceWorker] Offline actions synced');
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

async function getOfflineActions() {
  // Mock implementation - in real app, this would read from IndexedDB
  return [];
}

async function processOfflineAction(action) {
  // Mock implementation - process the offline action
  console.log('[ServiceWorker] Processing offline action:', action);
}

async function removeOfflineAction(id) {
  // Mock implementation - remove the processed action
  console.log('[ServiceWorker] Removing processed action:', id);
}

function isAllowedExternalDomain(origin) {
  const allowedDomains = [
    'https://api.sudan.gov.sd',
    'https://health-api.sudan.gov.sd',
    'https://education-api.sudan.gov.sd',
    'https://interior-api.sudan.gov.sd',
    'https://finance-api.sudan.gov.sd',
    'https://energy-api.sudan.gov.sd',
    'https://infrastructure-api.sudan.gov.sd',
    'https://justice-api.sudan.gov.sd',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  return allowedDomains.includes(origin);
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const cacheStatus = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    cacheStatus[cacheName] = {
      size: keys.length,
      resources: keys.map(request => request.url)
    };
  }
  
  return cacheStatus;
}

// Periodic cache cleanup
setInterval(async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    // Remove old entries (older than 7 days)
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of keys) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
        console.log('[ServiceWorker] Removing old cache entry:', request.url);
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Cache cleanup failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily

console.log('[ServiceWorker] Sudan Digital Identity Service Worker loaded');