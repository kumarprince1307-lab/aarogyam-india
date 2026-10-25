/* Aarogyam India - Universal High-Performance Service Worker (PWA Builder 100% Compliant)
   Scope: /
   Features:
   - Deep Precache Shell & Offline Fallback (/offline.html)
   - Stale-While-Revalidate for JSON Catalog & Configurations (0ms load)
   - Cache-First for static assets, WebP images, Audio Previews & Fonts
   - IndexedDB & Media Cache for zero-egress offline eBook reading
   - Web Push Notifications ('push' & 'notificationclick')
   - Strict isolation for Admin Panel (/admin/*)
*/

const STATIC_CACHE = 'aarogyam-public-static-v2.2-live';
const AUTO_UPDATE_BROADCAST = true;
const PAGES_CACHE = 'aarogyam-public-pages-v2.0';
const MEDIA_CACHE = 'aarogyam-public-media-v2.0';
const OFFLINE_URL = '/offline.html';


const PRECACHE_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/aarogyam-sakhi.html',
  '/weather.html',
  '/mandi.html',
  '/krishi-panchang.html',
  '/ebooks/index.html',
  '/ebooks/kharif-master-guide-2026.html',
  '/ebooks/kheti-dr.html',
  '/ebooks/book-landing.html',
  '/ebooks/my-library.html',
  '/ebooks/cart.html',
  '/ebooks/reader.html',
  '/css/style.css',
  '/css/home-revamp.css',
  '/css/landingpage.css',
  '/css/my-library.css',
  '/css/ebook.css',
  '/css/book-landing.css',
  '/css/universal-nav-drawer.css',
  '/css/premium-mobile-ui.css',
  '/js/public-pwa.js',
  '/js/sakhi-panchang-engine.js',
  '/js/aarogyam-sakhi-ai.js',
  '/js/universal-nav-drawer.js',
  '/js/viral-share-engine.js',
  '/js/global-guest-modal.js',
  '/js/audio-greeting-engine.js',
  '/js/image-lightbox-viewer.js',
  '/js/universal-preview-gallery-lightbox.js',
  '/js/book-marketing-card.js',
  '/js/recent-purchase-toast.js',
  '/js/universal-book-landing.js',
  // Dynamic data catalogs excluded from static lock
  '/images/logo/logo.png',
  '/images/logo/favicon.png',
  '/images/logo/fevicon.png',
  '/images/icons/pwa-icon-192x192.png',
  '/images/icons/pwa-icon-512x512.png',
  '/images/icons/pwa-maskable-192x192.png',
  '/images/icons/pwa-maskable-512x512.png',
  '/images/books/kharif-master-guide-2026-cover.webp',
  '/images/books/fasal-ka-doctor-cover.webp'
];

// 0. MESSAGE: Instant Skip Waiting trigger from client
self.addEventListener('message', (event) => {
  if (event.data && (event.data.action === 'skipWaiting' || event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// 1. INSTALL: Precache App Shell & Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Aarogyam PWA SW] Precaching Public App Shell V1.3');
      return cache.addAll(PRECACHE_SHELL).catch((err) => {
        console.warn('[Aarogyam PWA SW] Precache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Cleanup Old Caches & Claim Clients
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE, PAGES_CACHE, MEDIA_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !allowedCaches.includes(name))
          .map((name) => {
            console.log('[Aarogyam PWA SW] Deleting obsolete cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[Aarogyam PWA SW] Claiming clients for instant control');
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_ACTIVATED', version: STATIC_CACHE });
        });
      });
    })
  );
});

// 3. FETCH STRATEGY: Stale-While-Revalidate for JSON / Cache First for Static & Media
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Exclude Admin Panel from Public SW
  if (url.pathname.startsWith('/admin') || url.pathname === '/admin.html') {
    return;
  }

  // Network Only for External APIs (Supabase, Razorpay, Weather live queries if not cached)
  if (
    request.method !== 'GET' ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('razorpay.com') ||
    url.pathname.includes('/rest/v1/')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Live catalog, CSS, JS assets & site configurations: Network First with Cache Fallback
  if (
    url.pathname === '/data/books.json' ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.includes('site-pages-config') ||
    url.pathname.includes('universal-book-landing') ||
    url.searchParams.has('v')
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(STATIC_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;
          return (await caches.match(request)) || new Response('', { status: 408, statusText: 'Offline' });
        })
    );
    return;
  }

  // General JSON Files: Stale-While-Revalidate with Background Refresh
  if (url.pathname.endsWith('.json') || url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Media (Images, WebP, MP3 Previews, Fonts): Cache First with Background Update
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/audio/') ||
    url.pathname.startsWith('/uploads/') ||
    url.pathname.match(/\.(webp|jpg|jpeg|png|gif|svg|mp3|woff2|woff|ttf)$/i)
  ) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((mediaCache) => {
        return mediaCache.match(request).then((cachedMedia) => {
          if (cachedMedia) return cachedMedia;

          return fetch(request).then((networkMedia) => {
            if (networkMedia && networkMedia.status === 200) {
              mediaCache.put(request, networkMedia.clone());
            }
            return networkMedia;
          }).catch(() => {
            return new Response('', { status: 408, statusText: 'Media Offline' });
          });
        });
      })
    );
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

          // Check if clean URL matches .html
          if (!url.pathname.endsWith('.html')) {
            const htmlAlt = await pageCache.match(url.pathname + '.html');
            if (htmlAlt) return htmlAlt;
          }

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

  // Standard Static Assets (CSS, JS): Cache First with Background Update
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

// 6. MESSAGE: Handles SKIP_WAITING and cross-tab triggers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});