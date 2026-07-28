const CACHE_NAME = 'aarogyam-pwa-v2';
const urlsToCache = [
  '/',
  '/ebooks/my-library.html',
  '/css/style.css',
  '/css/ebook.css',
  '/js/ebook.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
