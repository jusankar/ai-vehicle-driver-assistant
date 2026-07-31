// Fleet Service Worker - Offline Caching & Background Sync Engine
const CACHE_NAME = 'fleet-assistant-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('SW pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve offline app shell for HTML navigation if network fails
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // For GET requests, use network-first strategy, falling back to cache
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Update cache if valid response
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache when offline
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback for HTML SPA navigation
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline - Network unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
        })
    );
  }
});

// Background Sync Event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-fleet-data') {
    event.waitUntil(
      notifyClientsToSync()
    );
  }
});

// Message Listener for explicit client triggers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    notifyClientsToSync();
  }
});

async function notifyClientsToSync() {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage({
      type: 'SW_ONLINE_SYNC_REQUEST'
    });
  }
}
