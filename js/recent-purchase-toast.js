/**
 * ====================================================================
 * AAROGYAM INDIA - RECENT PURCHASE TOASTS & NETFLIX-STYLE 3D POPUP ENGINE
 * Version: 3.0 (Smart Daily Limit, Position Above Bottom Nav, Contextual 3D Popups)
 * ====================================================================
 */

(function () {
  'use strict';

  /* ====================================================================
     1. RECENT PURCHASE SOCIAL PROOF TOAST ENGINE (DYNAMIC ADMIN CONTROLLED)
     ==================================================================== */
  let LIVE_SALES_DATA = [
    {
      name: 'Rameshwar Patel',
      city: 'Ujjain, MP',
      bookTitle: 'खरीफ फसल मास्टर गाइड 2026',
      price: '₹99',
      image: '/images/books/kharif-master-guide-2026-cover.webp',
      link: '/ebooks/kharif-master-guide-2026.html',
      timeAgo: 'अभी-अभी'
    },
    {
      name: 'धर्मेन्द्र सिंह पटेल',
      city: 'जबलपुर, MP',
      bookTitle: 'कृषि दवा डायरेक्टरी व स्प्रे गाइड',
      price: '₹149',
      image: '/images/books/bk016-cover.webp',
      link: '/ebooks/book-landing.html?id=BK016',
      timeAgo: '1 मिनट पहले'
    },
    {
      name: 'अमन वर्मा',
      city: 'लखनऊ, UP',
      bookTitle: 'घर बैठे पैसे कैसे कमाएँ? Income Guide',
      price: '₹149',
      image: '/images/books/bk018-cover.webp',
      link: '/ebooks/book-landing.html?id=BK018',
      timeAgo: '2 मिनट पहले'
    },
    {
      name: 'Suresh Kumar Yadav',
      city: 'Karnal, Haryana',
      bookTitle: 'खेती का डॉक्टर (Pocket Doctor)',
      price: '₹99',
      image: '/images/books/fasal-ka-doctor-cover.webp',
      link: '/ebooks/kheti-dr.html',
      timeAgo: '3 मिनट पहले'
    },
    {
      name: 'हरविंदर सिंह संधू',
      city: 'लुधियाना, पंजाब',
      bookTitle: 'कृषि दवा डायरेक्टरी (BK016)',
      price: '₹149',
      image: '/images/books/bk016-cover.webp',
      link: '/ebooks/book-landing.html?id=BK016',
      timeAgo: '5 मिनट पहले'
    },
    {
      name: 'विकास गुप्ता',
      city: 'जयपुर, राजस्थान',
      bookTitle: 'घर बैठे पैसे कैसे कमाएँ? Income Guide',
      price: '₹149',
      image: '/images/books/bk018-cover.webp',
      link: '/ebooks/book-landing.html?id=BK018',
      timeAgo: '7 मिनट पहले'
    },
    {
      name: 'Kamlesh Patidar',
      city: 'Indore, MP',
      bookTitle: '2-Book सुपर सेवर कॉम्बो',
      price: '₹198',
      image: '/images/books/kharif-master-guide-2026-cover.webp',
      link: '/ebooks/checkout.html?combo=agri2',
      timeAgo: '9 मिनट पहले'
    },
    {
      name: 'रोहन कुलकर्णी',
      city: 'पुणे, महाराष्ट्र',
      bookTitle: 'घर बैठे पैसे कैसे कमाएँ? Income Guide',
      price: '₹149',
      image: '/images/books/bk018-cover.webp',
      link: '/ebooks/book-landing.html?id=BK018',
      timeAgo: '11 मिनट पहले'
    },
    {
      name: 'रामनिवास जाट',
      city: 'सीकर, राजस्थान',
      bookTitle: 'कृषि दवा डायरेक्टरी व स्प्रे गाइड',
      price: '₹149',
      image: '/images/books/bk016-cover.webp',
      link: '/ebooks/book-landing.html?id=BK016',
      timeAgo: '13 मिनट पहले'
    },
    {
      name: 'आकाशदीप शर्मा',
      city: 'भोपाल, MP',
      bookTitle: 'घर बैठे पैसे कैसे कमाएँ? Income Guide',
      price: '₹149',
      image: '/images/books/bk018-cover.webp',
      link: '/ebooks/book-landing.html?id=BK018',
      timeAgo: '15 मिनट पहले'
    },
    {
      name: 'Rajesh Verma',
      city: 'Sitapur, UP',
      bookTitle: 'खेती का डॉक्टर (Pocket Doctor)',
      price: '₹99',
      image: '/images/books/fasal-ka-doctor-cover.webp',
      link: '/ebooks/kheti-dr.html',
      timeAgo: '18 मिनट पहले'
    }
  ];

  let toastIndex = 0;
  let toastTimer = null;
  let isToastsEnabled = true;
  let toastIntervalSeconds = 55;

  async function loadPopupAndToastConfig() {
    try {
      // 1. Try local storage admin overrides
      const localConf = localStorage.getItem('AAROGYAM_NOTIFS_POPUPS_CONFIG');
      if (localConf) {
        const parsed = JSON.parse(localConf);
        applyConfig(parsed);
        return;
      }
    } catch(e) {}

    // 2. Fetch data/notifications-popups.json
    try {
      const res = await fetch('/data/notifications-popups.json');
      if (res.ok) {
        const json = await res.json();
        applyConfig(json);
      }
    } catch(e) {}
  }

  function applyConfig(cfg) {
    if (!cfg) return;
    const sp = cfg.social_proof_toasts;
    if (sp) {
      if (typeof sp.enabled === 'boolean') isToastsEnabled = sp.enabled;
      if (sp.interval_seconds) toastIntervalSeconds = parseInt(sp.interval_seconds, 10) || 15;
      if (Array.isArray(sp.items) && sp.items.length > 0) {
        LIVE_SALES_DATA = sp.items;
      }
    }
  }

  loadPopupAndToastConfig();

  function createPurchaseToastContainer() {
    let container = document.getElementById('ai-live-purchase-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ai-live-purchase-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function getCurrentPageItemPool() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const curId = (urlParams.get('id') || urlParams.get('book') || (typeof currentBookId !== 'undefined' ? currentBookId : '')).toUpperCase().trim();

      if (curId === 'BK016') {
        const matched = LIVE_SALES_DATA.filter(it => (it.bookTitle || '').includes('BK016') || (it.bookTitle || '').includes('दवा') || (it.link || '').includes('BK016'));
        if (matched.length > 0) return matched;
      } else if (curId === 'BK018') {
        const matched = LIVE_SALES_DATA.filter(it => (it.bookTitle || '').includes('BK018') || (it.bookTitle || '').includes('पैसे कैसे कमाएँ') || (it.bookTitle || '').includes('Income') || (it.link || '').includes('BK018'));
        if (matched.length > 0) return matched;
      } else if (curId === 'BK001') {
        const matched = LIVE_SALES_DATA.filter(it => (it.bookTitle || '').includes('खरीफ') || (it.link || '').includes('kharif'));
        if (matched.length > 0) return matched;
      } else if (curId === 'BK002') {
        const matched = LIVE_SALES_DATA.filter(it => (it.bookTitle || '').includes('डॉक्टर') || (it.link || '').includes('kheti-dr'));
        if (matched.length > 0) return matched;
      }
    } catch (e) {}
    return LIVE_SALES_DATA;
  }

  function showNextPurchaseToast() {
    if (sessionStorage.getItem('AI_TOAST_DISMISSED') === 'true') return;
    if (!isToastsEnabled || LIVE_SALES_DATA.length === 0) return;
    const container = createPurchaseToastContainer();
    const pool = getCurrentPageItemPool();
    const rawItem = pool[toastIndex % pool.length];
    toastIndex++;

    const item = {
      name: rawItem.name || 'ग्राहक साथी',
      city: rawItem.city || rawItem.city_state || 'भारत',
      bookTitle: rawItem.bookTitle || rawItem.book_title || 'डिजिटल ई-बुक',
      price: rawItem.price || '₹149',
      image: rawItem.image || rawItem.cover_image || '/images/books/kharif-master-guide-2026-cover.webp',
      link: rawItem.link || '/ebooks/cart.html',
      timeAgo: rawItem.timeAgo || rawItem.time_ago || 'अभी-अभी'
    };

    const toast = document.createElement('div');
    toast.className = 'ai-purchase-toast-card';
    toast.style.cssText = `
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #ffffff;
      border: 1.5px solid rgba(59, 130, 246, 0.4);
      border-left: 3.5px solid #3b82f6;
      border-radius: 12px;
      padding: 7px 11px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      max-width: 280px;
      cursor: pointer;
      transform: translate3d(120%, 0, 0);
      opacity: 0;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      position: relative;
      overflow: hidden;
      margin-top: 6px;
    `;

    toast.innerHTML = `
      <div style="width: 38px; height: 48px; flex-shrink: 0; border-radius: 5px; overflow: hidden; box-shadow: 0 3px 8px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);">
        <img src="${item.image}" alt="${item.bookTitle}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';" />
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 2px;">
          <span style="font-weight: 800; font-size: 0.82rem; color: #fde047; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
            ${item.name}
          </span>
          <span style="font-size: 0.65rem; color: #94a3b8; flex-shrink: 0;">
            ${item.timeAgo}
          </span>
        </div>
        <div style="font-size: 0.70rem; color: #cbd5e1; margin-bottom: 2px;">
          📍 ${item.city}
        </div>
        <div style="font-size: 0.75rem; font-weight: 700; color: #ffffff; line-height: 1.2; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
          📘 ${item.bookTitle}
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
          <span style="background: #16a34a; color: #ffffff; font-size: 0.60rem; font-weight: 800; padding: 1px 5px; border-radius: 8px;">
            ✓ Verified Purchase
          </span>
          <span style="font-size: 0.70rem; font-weight: 900; color: #38bdf8;">
            ${item.price}
          </span>
        </div>
      </div>
      <button type="button" class="ai-toast-close" style="position: absolute; top: 3px; right: 3px; background: transparent; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 2px 6px;">&times;</button>
      <div class="ai-toast-progress" style="position: absolute; bottom: 0; left: 0; height: 2.5px; background: linear-gradient(90deg, #10b981, #3b82f6); width: 100%; transition: width 4.5s linear;"></div>
    `;

    toast.onclick = (e) => {
      if (e.target.classList.contains('ai-toast-close')) {
        e.stopPropagation();
        sessionStorage.setItem('AI_TOAST_DISMISSED', 'true');
        if (toastTimer) clearInterval(toastTimer);
        removeToast(toast);
        return;
      }
      window.location.href = item.link;
    };

    container.appendChild(toast);

    // Animate In from Right
    requestAnimationFrame(() => {
      toast.style.transform = 'translate3d(0, 0, 0)';
      toast.style.opacity = '1';
      const bar = toast.querySelector('.ai-toast-progress');
      if (bar) {
        requestAnimationFrame(() => { bar.style.width = '0%'; });
      }
    });

    // Auto Remove after 4.5 seconds
    setTimeout(() => {
      removeToast(toast);
    }, 4500);
  }

  function removeToast(toast) {
    if (!toast) return;
    toast.style.transform = 'translate3d(120%, 0, 0)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }

  let sessionToastCount = 0;
  const MAX_SESSION_TOASTS = 2;

  function startPurchaseToastStream() {
    if (sessionStorage.getItem('AI_TOAST_DISMISSED') === 'true') return;

    // Non-intrusive timing: first toast at 28 seconds, subsequent at 55-60 seconds, max 2 per session
    setTimeout(() => {
      if (sessionStorage.getItem('AI_TOAST_DISMISSED') === 'true') return;
      if (sessionToastCount >= MAX_SESSION_TOASTS) return;
      sessionToastCount++;
      showNextPurchaseToast();

      if (toastTimer) clearInterval(toastTimer);
      const intervalMs = Math.max(50000, (toastIntervalSeconds && toastIntervalSeconds > 20 ? toastIntervalSeconds : 55) * 1000);
      toastTimer = setInterval(() => {
        if (sessionStorage.getItem('AI_TOAST_DISMISSED') === 'true' || sessionToastCount >= MAX_SESSION_TOASTS) {
          clearInterval(toastTimer);
          return;
        }
        sessionToastCount++;
        showNextPurchaseToast();
      }, intervalMs);
    }, 28000);
  }

  /* ====================================================================
     2. SMART NETFLIX-STYLE 3D MINI POPUP SYSTEM (ONCE A DAY PER USER)
     ==================================================================== */
  function getTodayKey() {
    const d = new Date();
    return `AAROGYAM_NETFLIX_POPUP_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
  }

  function hasShownPopupToday() {
    try {
      return localStorage.getItem(getTodayKey()) === '1';
    } catch (e) {
      return false;
    }
  }

  function markPopupShownToday() {
    try {
      localStorage.setItem(getTodayKey(), '1');
    } catch (e) {}
  }

  function getPurchasedBookIds() {
    try {
      const p = JSON.parse(localStorage.getItem('AAROGYAM_PURCHASED_BOOKS') || localStorage.getItem('purchased_ebooks') || '[]');
      if (Array.isArray(p)) {
        return p.map(b => (typeof b === 'string' ? b : b.id || b.code || '')).filter(Boolean);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  function getUserProfile() {
    try {
      return JSON.parse(localStorage.getItem('AAROGYAM_USER') || localStorage.getItem('aarogyam_user_data') || '{}');
    } catch (e) {
      return {};
    }
  }

  function determineContextualPopup() {
    const currentPath = (window.location.pathname || '').toLowerCase();
    const currentSearch = (window.location.search || '').toLowerCase();

    // 1. Strictly SUPPRESS big intrusive popups on dedicated book pages, reader, or checkout
    if (
      currentPath.includes('book-landing') || 
      currentPath.includes('reader') || 
      currentPath.includes('checkout') || 
      currentPath.includes('cart') || 
      currentPath.includes('payment') || 
      currentPath.includes('kharif-master-guide') || 
      currentPath.includes('kheti-dr') ||
      currentSearch.includes('id=bk') ||
      currentSearch.includes('book=bk')
    ) {
      return null;
    }

    const purchased = getPurchasedBookIds();
    const user = getUserProfile();

    // 2. Unpurchased Book Rule for General Pages (Home / Catalog only):
    if (!purchased.includes('BK001')) {
      return {
        type: 'book_kharif',
        badge: '🌾 लोकप्रिय ई-बुक',
        title: 'खरीफ फसल मास्टर गाइड 2026',
        desc: '300+ सचित्र वैज्ञानिक गाइड व स्प्रे चार्ट!',
        priceTag: 'मात्र ₹99',
        ctaText: '📖 ई-बुक देखें',
        link: '/ebooks/kharif-master-guide-2026.html',
        image: '/images/books/kharif-master-guide-2026-cover.webp'
      };
    }

    if (!purchased.includes('BK002')) {
      return {
        type: 'book_kheti_dr',
        badge: '🩺 फसल सुरक्षा गाइड',
        title: 'खेती का डॉक्टर (Pocket Doctor)',
        desc: 'रोग पहचान व सही स्प्रे की सम्पूर्ण विधि!',
        priceTag: 'मात्र ₹99',
        ctaText: '📖 ई-बुक देखें',
        link: '/ebooks/kheti-dr.html',
        image: '/images/books/fasal-ka-doctor-cover.webp'
      };
    }

    return null;
  }

  function initNetflixStyleMiniPopup() {
    // ANTI-IRRITATION CHECK: Show strictly ONCE per day per user
    if (hasShownPopupToday()) {
      return;
    }

    const popupData = determineContextualPopup();
    if (!popupData) return;

    // Show after 45 seconds on allowed general pages (not right after landing)
    setTimeout(() => {
      renderNetflix3dPopup(popupData);
      markPopupShownToday();
    }, 45000);
  }

  function renderNetflix3dPopup(data) {
    const wrap = document.createElement('div');
    wrap.className = 'netflix-3d-popup-wrap';

    wrap.innerHTML = `
      <div class="netflix-3d-popup-card" id="netflix-3d-popup-card-elem">
        <button type="button" class="netflix-popup-close-btn" title="Close" id="netflix-popup-close-trigger">&times;</button>
        
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
          <div style="width: 40px; height: 50px; border-radius: 6px; overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2);">
            <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/logo/logo.png';" />
          </div>
          <div style="flex: 1; min-width: 0;">
            <span class="netflix-badge-tag">
              ${data.badge}
            </span>
            <h4 style="font-size: 0.88rem; font-weight: 800; margin: 3px 0 2px 0; color: #ffffff; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
              ${data.title}
            </h4>
            <div style="font-size: 0.72rem; color: #fde047; font-weight: 800;">
              ${data.priceTag}
            </div>
          </div>
        </div>

        <p style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.35; margin: 0 0 8px 0;">
          ${data.desc}
        </p>

        <div style="display: flex; align-items: center; justify-content: space-between;">
          <a href="${data.link}" class="netflix-popup-btn-cta">
            <span>${data.ctaText}</span> &rarr;
          </a>
          <span style="font-size: 0.7rem; color: #94a3b8;">
            ✓ 100% सुरक्षित
          </span>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    const card = document.getElementById('netflix-3d-popup-card-elem');
    const closeBtn = document.getElementById('netflix-popup-close-trigger');

    // 3D Animation In
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (card) card.classList.add('show');
      }, 50);
    });

    function closePopup() {
      if (card) {
        card.classList.remove('show');
        card.classList.add('hide');
      }
      setTimeout(() => {
        wrap.remove();
      }, 400);
    }

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        closePopup();
      };
    }
  }

  // Initialize both systems on page ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      startPurchaseToastStream();
      initNetflixStyleMiniPopup();
    });
  } else {
    startPurchaseToastStream();
    initNetflixStyleMiniPopup();
  }
})();
