const CACHE_NAME = 'aarogyam-admin-pwa-v3';
const OFFLINE_URL = 'offline.html';
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
  OFFLINE_URL
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell and offline page');
        self.skipWaiting(); // नए सर्विस वर्कर को तुरंत एक्टिवेट करें
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell:', error);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      // पुराने कैश को हटाएं
      cacheNames.map(cacheName => {
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          return caches.delete(cacheName);
        }
      })
    )).then(() => self.clients.claim()) // खुले हुए पेजों का कंट्रोल तुरंत लें
  );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Bypass service worker for Supabase API requests to ensure fresh data.
    if (requestUrl.hostname === 'qjhjrzsnrtahmhswxyvb.supabase.co') {
        event.respondWith(fetch(event.request));
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const preloadResponse = await event.preloadResponse;
                if (preloadResponse) return preloadResponse;
                
                const networkResponse = await fetch(event.request);
                return networkResponse;
            } catch (error) {
                console.log('Fetch failed; returning offline page instead.', error);
                const cache = await caches.open(CACHE_NAME);
                return await cache.match(OFFLINE_URL);
            }
        })());
    } else {
        event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
    }
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_TEST_NOTIFICATION') {
    const data = event.data.payload;
    const title = data.title || 'Test Notification';
    const options = {
      body: data.body || 'This is a test.',
      icon: '/images/icons/icon-192x192.png',
      badge: '/images/icons/icon-96x96.png',
      data: {
        url: data.url || '/admin.html'
      }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  const data = event.data.json();

  const title = data.title || 'Aarogyam India Admin';
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-96x96.png',
    data: {
      url: data.url || '/admin.html'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});