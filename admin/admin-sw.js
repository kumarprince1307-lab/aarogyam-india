/* Aarogyam India Admin - Isolated Service Worker (V10) */

const CACHE_NAME = 'aarogyam-admin-shell-v10';
const OFFLINE_FALLBACK = '/admin/offline.html';

const APP_SHELL_ASSETS = [
  '/admin/index.html',
  '/admin/offline.html',
  '/admin/admin-manifest.json',
  '/css/admin-panel.css',
  '/css/admin-components.css',
  '/js/admin-main.js',
  '/js/admin-router.js',
  '/js/admin-api.js',
  '/js/admin-pwa.js',
  '/js/admin-components-header.js',
  '/js/admin-components-sidebar.js',
  '/js/admin-pages-dashboard.js',
  '/js/admin-pages-notifications.js',
  '/js/admin-pages-users.js',
  '/js/admin-pages-user-details.js',
  '/js/admin-pages-user-permissions.js',
  '/js/admin-pages-phonebook.js',
  '/js/admin-pages-surveys.js',
  '/js/admin-pages-landing-pages.js',
  '/js/admin-pages-purchases.js',
  '/js/admin-pages-checkout-funnel.js',
  '/js/admin-pages-downloads.js',
  '/js/admin-pages-reports.js',
  '/js/admin-pages-settings.js',
  '/js/supabase.js',
  '/images/logo/fevicon.png',
  '/images/logo/logo.png'
];

// Install: Cache isolated Admin App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Admin SW] Caching Admin App Shell assets');
        self.skipWaiting();
        return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
          console.warn('[Admin SW] Some static assets could not be cached on install:', err);
        });
      })
  );
});

// Activate: Clean up old admin caches
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

// Fetch: Strategy Implementation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Live Database & Supabase APIs: ALWAYS Network Only (Never serve stale DB cache)
  if (url.hostname.includes('supabase.co') || url.pathname.includes('/rest/v1/')) {
    event.respondWith(fetch(request));
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
