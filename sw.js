/* ==========================================================
   AAROGYAM INDIA V1 - SERVICE WORKER
   ========================================================== */

"use strict";

const CACHE_NAME = 'aarogyam-india-v1-cache';

// List of files to cache
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/about.html',
    '/blog-details.html',
    '/blog.html',
    '/checkout.html',
    '/contact.html',
    '/crop-doctor.html',
    '/disclaimer.html',
    '/ebooks.html',
    '/faq.html',
    '/mandi.html',
    '/my-library.html',
    '/privacy-policy.html',
    '/privacy.html',
    '/profile.html',
    '/purchases.html',
    '/reader.html',
    '/refund-policy.html',
    '/registration.html',
    '/return-refund.html',
    '/shipping-policy.html',
    '/store.html',
    '/terms-conditions.html',
    '/terms.html',
    '/weather.html',
    '/admin/forgot-password.html',
    '/admin/login.html',
    '/admin/register.html',
    '/books/index.html',
    '/books/kharif-fasal-master-guide-2026.html',
    '/categories/business.html',
    '/categories/digital-ai.html',
    '/categories/education.html',
    '/categories/health.html',
    '/categories/netsurf.html',
    '/css/admin.css',
    '/css/agriculture.css',
    '/css/book-landing.css',
    '/css/cart.css',
    '/css/checkout.css',
    '/css/demo-book.css',
    '/css/download.css',
    '/css/ebook.css',
    '/css/landingpage.css',
    '/css/my-library.css',
    '/css/payment-failed.css',
    '/css/payment-success.css',
    '/css/purchases.css',
    '/css/reader.css',
    '/css/registration.css',
    '/css/responsive.css',
    '/css/style.css',
    '/css/wallet.css',
    '/js/admin.js',
    '/js/agriculture.js',
    '/js/book-landing.js',
    '/js/cart.js',
    '/js/checkout.js',
    '/js/demo-book.js',
    '/js/download.js',
    '/js/ebook.js',
    '/js/landingpage.js',
    '/js/my-library.js',
    '/js/payment-failed.js',
    '/js/payment-success.js',
    '/js/purchases.js',
    '/js/reader.js',
    '/js/registration.js',
    '/js/script.js',
    '/js/supabase.js',
    '/js/wallet.js',
    '/manifest.json',
    '/images/logo/logo.png',
    '/images/logo/fevicon.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
];

// Install event: open cache and add all URLs to it
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});