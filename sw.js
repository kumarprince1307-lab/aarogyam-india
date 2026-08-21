/* Aarogyam India - Dedicated Public Website Service Worker (V1)
   Scope: /
   Responsibilities:
   - Cache First for public static assets (CSS, JS, Images, Fonts)
   - Network First with automatic runtime caching for all current & future public HTML pages
   - Network Only for Supabase API, Razorpay, and Auth
   - Strict Isolation: Admin Panel (/admin/*, admin.html) is never cached by public SW
*/

const STATIC_CACHE = 'aarogyam-public-static-v3';
const PAGES_CACHE = 'aarogyam-public-pages-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/style.css',
  '/css/landingpage.css',
  '/css/my-library.css',
  '/css/ebook.css',
  '/js/public-pwa.js',
  '/js/landingpage.js',
  '/js/my-library.js',
  '/images/logo/logo.png',
  '/images/logo/fevicon.png'
];

// Install: Precache Core App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Public SW] Precaching Public App Shell');
        self.skipWaiting();
        return cache.addAll(PRECACHE_SHELL).catch((err) => {
          console.warn('[Public SW] Precache partial warning:', err);
        });
      })
  );
});

// Activate: Clean up old public caches while preserving admin caches
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE, PAGES_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old public caches or legacy root caches, leave isolated admin-shell caches alone
            return (name.startsWith('aarogyam-public-') && !allowedCaches.includes(name)) ||
                   name.startsWith('aarogyam-admin-pwa-');
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      console.log('[Public SW] Claiming clients for immediate control');
      return self.clients.claim();
    })
  );
});

// Fetch Strategy Implementation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Admin Panel Strict Isolation: Never intercept or cache Admin Panel
  if (url.pathname.startsWith('/admin') || url.pathname === '/admin.html') {
    return; // Pass through to browser / admin-sw
  }

  // 2. Dynamic Live APIs: Supabase, Razorpay, Non-GET requests (Network Only)
  if (
    request.method !== 'GET' ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('razorpay.com') ||
    url.pathname.includes('/rest/v1/')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // 3. Navigation Requests (Public HTML pages): Network First, fallback to runtime Pages Cache / offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Check runtime pages cache first
          const pageCache = await caches.open(PAGES_CACHE);
          const cachedPage = await pageCache.match(request);
          if (cachedPage) return cachedPage;

          // Check static shell cache for index.html if navigating to root
          if (url.pathname === '/' || url.pathname === '/index.html') {
            const staticCache = await caches.open(STATIC_CACHE);
            const cachedHome = await staticCache.match('/index.html');
            if (cachedHome) return cachedHome;
          }

          // Fallback to offline page
          const staticCache = await caches.open(STATIC_CACHE);
          const cachedOffline = await staticCache.match(OFFLINE_URL);
          return cachedOffline || new Response('Offline - Aarogyam India', { headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // 4. Static Assets (CSS, JS, Fonts, Images): Cache First, background refresh
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to keep cache up-to-date
        fetch(request).then((freshResponse) => {
          if (freshResponse && freshResponse.status === 200) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, freshResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});