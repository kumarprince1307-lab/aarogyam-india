/* Aarogyam India Admin - Isolated Service Worker (V41) */

const CACHE_NAME = 'aarogyam-admin-shell-v46';
const OFFLINE_FALLBACK = '/admin/offline.html';

const APP_SHELL_ASSETS = [
  '/admin/index.html',
  '/admin/page-editor.html',
  '/admin/offline.html',
  '/admin/admin-manifest.json',
  '/css/admin-panel.css',
  '/css/admin-components.css',
  '/images/logo/fevicon.png',
  '/images/logo/logo.png'
];

// Install: Skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Admin SW] Caching Admin App Shell assets');
      return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
        console.warn('[Admin SW] Cache on install warning:', err);
      });
    })
  );
});

// Activate: Clean up old admin caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('aarogyam-admin-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      console.log('[Admin SW] Claiming clients for immediate control');
      return self.clients.claim();
    })
  );
});

// Message listener for instant skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: Strategy Implementation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Localhost development: Always Network-first / Network-only
  if (['localhost', '127.0.0.1'].includes(url.hostname)) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // 1. Live Database & Supabase APIs: ALWAYS Network Only
  if (url.hostname.includes('supabase.co') || url.pathname.includes('/rest/v1/')) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. CRITICAL: ALL Admin scripts (/js/admin-*.js), configs (/data/*) and APIs (/api/*) MUST BE ALWAYS NETWORK-ONLY NO-CACHE!
  if (url.pathname.includes('/js/admin-') || url.pathname.includes('/data/') || url.pathname.includes('/api/')) {
    event.respondWith(fetch(request, { cache: 'no-cache' }));
    return;
  }

  // 2. Navigation Requests (HTML pages): Network First, fallback to cached shell / offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/admin/index.html');
          if (cachedIndex) return cachedIndex;
          const cachedOffline = await cache.match(OFFLINE_FALLBACK);
          return cachedOffline || new Response('Offline Mode — Admin Panel', { headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // 3. Static Assets (CSS, JS, Images, Fonts): Network First, fallback to cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        return new Response('', { status: 408, statusText: 'Offline' });
      })
  );
});
