/* ==========================================================================
   UCAS V1 SERVICE WORKER
   Network-First strategy for fresh app updates, offline shell fallback.
   No private user data caching.
   ========================================================================== */

const CACHE_NAME = 'ucas-v1-shell-v3';
const STATIC_ASSETS = [
  '/ucas/index.html',
  '/ucas/ucas.css',
  '/ucas/manifest.json',
  '/ucas/js/ucas-app.js',
  '/ucas/js/ucas-session.js',
  '/ucas/js/ucas-db.js',
  '/ucas/js/ucas-permissions.js',
  '/ucas/js/ucas-survey.js',
  '/ucas/js/ucas-phonebook.js',
  '/ucas/js/ucas-leads.js',
  '/ucas/js/ucas-marketing.js',
  '/ucas/js/ucas-admin.js',
  '/ucas/js/ucas-pwa.js',
  '/images/logo/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-First strategy: Always fetch fresh code, fallback to cache if offline
self.addEventListener('fetch', (event) => {
  // Never cache API / Supabase requests or non-GET methods
  if (event.request.url.includes('supabase.co') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/ucas/index.html');
          }
        });
      })
  );
});
