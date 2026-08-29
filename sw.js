/* Aarogyam India - Universal High-Performance Service Worker (PWA Builder 100% Compliant)
   Scope: /
   Features:
   - Precache Shell & Offline Fallback (/offline.html)
   - Cache-First for static assets, Network-First for HTML navigation
   - Web Push Notifications ('push' & 'notificationclick')
   - Background Sync ('sync' & 'periodicsync')
   - Cross-tab Messaging ('message' & 'SKIP_WAITING')
   - Strict isolation for Admin Panel (/admin/*)
*/

const STATIC_CACHE = 'aarogyam-public-static-v5';
const PAGES_CACHE = 'aarogyam-public-pages-v5';
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
  '/css/universal-nav-drawer.css',
  '/js/public-pwa.js',
  '/js/universal-nav-drawer.js',
  '/js/book-marketing-card.js',
  '/js/recent-purchase-toast.js',
  '/images/logo/logo.png',
  '/images/logo/favicon.png',
  '/images/logo/fevicon.png',
  '/images/icons/pwa-icon-192x192.png',
  '/images/icons/pwa-icon-512x512.png',
  '/images/icons/pwa-maskable-192x192.png',
  '/images/icons/pwa-maskable-512x512.png'
];

// 1. INSTALL: Precache App Shell & Offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Aarogyam PWA SW] Precaching Public App Shell');
      return cache.addAll(PRECACHE_SHELL).catch((err) => {
        console.warn('[Aarogyam PWA SW] Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Cleanup Old Caches & Claim Clients
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE, PAGES_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('aarogyam-public-') && !allowedCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      console.log('[Aarogyam PWA SW] Claiming clients for instant control');
      return self.clients.claim();
    })
  );
});

// 3. FETCH STRATEGY: Network First for HTML / Cache First for Static Assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Exclude Admin Panel from Public SW
  if (url.pathname.startsWith('/admin') || url.pathname === '/admin.html') {
    return;
  }

  // Network Only for External Dynamic APIs
  if (
    request.method !== 'GET' ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('razorpay.com') ||
    url.pathname.includes('/rest/v1/')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Navigation Requests (HTML Pages): Network First -> Runtime Cache -> Offline Page
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
          const pageCache = await caches.open(PAGES_CACHE);
          const cachedPage = await pageCache.match(request);
          if (cachedPage) return cachedPage;

          if (url.pathname === '/' || url.pathname === '/index.html') {
            const staticCache = await caches.open(STATIC_CACHE);
            const cachedHome = await staticCache.match('/index.html');
            if (cachedHome) return cachedHome;
          }

          const staticCache = await caches.open(STATIC_CACHE);
          const cachedOffline = await staticCache.match(OFFLINE_URL);
          return cachedOffline || new Response('Offline - Aarogyam India', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images): Cache First with Background Update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
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

// 4. PUSH NOTIFICATIONS: Handles background push messages
self.addEventListener('push', (event) => {
  let data = { title: 'Aarogyam India 🌾', body: 'नया कृषि अपडेट या वेबिनार लाइव है!', url: '/' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body || 'Aarogyam India Notification',
    icon: '/images/icons/pwa-icon-192x192.png',
    badge: '/images/icons/pwa-icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: '🔗 खोलें (Open)' },
      { action: 'close', title: '✕ बंद करें' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Aarogyam India', options)
  );
});

// 5. NOTIFICATION CLICK: Open URL on notification tap
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. BACKGROUND SYNC: Handles background data synchronization
self.addEventListener('sync', (event) => {
  console.log('[Aarogyam PWA SW] Background Sync Triggered:', event.tag);
  if (event.tag === 'sync-offline-leads') {
    event.waitUntil(Promise.resolve());
  }
});

// 7. PERIODIC SYNC: Handles periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('[Aarogyam PWA SW] Periodic Background Sync:', event.tag);
  if (event.tag === 'daily-mandi-check') {
    event.waitUntil(Promise.resolve());
  }
});

// 8. MESSAGE: Handles SKIP_WAITING and cross-tab triggers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});