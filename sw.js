const CACHE_NAME = 'aarogyam-admin-pwa-v2';
const urlsToCache = [
  '/admin.html',
  '/css/admin-main.css',
  '/css/admin-components.css',
  '/js/admin-main.js',
  '/js/admin-router.js',
  '/js/admin-api.js',
  '/js/admin-components-header.js',
  '/js/admin-components-sidebar.js',
  '/js/supabase.js',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => cacheWhitelist.indexOf(cacheName) === -1 ? caches.delete(cacheName) : null)
    ))
  );
});