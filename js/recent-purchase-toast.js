/**
 * ====================================================================
 * AAROGYAM INDIA - RECENT PURCHASE TOASTS & NETFLIX-STYLE 3D POPUP ENGINE
 * Version: 3.0 (Smart Daily Limit, Position Above Bottom Nav, Contextual 3D Popups)
 * ====================================================================
 */

(function () {
  'use strict';

  /* ====================================================================
     1. RECENT PURCHASE SOCIAL PROOF TOAST ENGINE
     ==================================================================== */
  const LIVE_SALES_DATA = [
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
      name: 'Suresh Kumar Yadav',
      city: 'Karnal, Haryana',
      bookTitle: 'खेती का डॉक्टर (Pocket Doctor)',
      price: '₹99',
      image: '/images/books/fasal-ka-doctor-cover.webp',
      link: '/ebooks/kheti-dr.html',
      timeAgo: '2 मिनट पहले'
    },
    {
      name: 'Dinesh Sharma',
      city: 'Jaipur, Rajasthan',
      bookTitle: 'Aarogyam Pro VIP Pass',
      price: '₹99',
      image: '/images/logo/logo.png',
      link: '/subscription.html',
      timeAgo: '4 मिनट पहले'
    },
    {
      name: 'Kamlesh Patidar',
      city: 'Indore, MP',
      bookTitle: '2-Book सुपर सेवर कॉम्बो',
      price: '₹198',
      image: '/images/books/kharif-master-guide-2026-cover.webp',
      link: '/ebooks/checkout.html?combo=agri2',
      timeAgo: '6 मिनट पहले'
    },
    {
      name: 'Balwant Singh',
      city: 'Ludhiana, Punjab',
      bookTitle: 'खरीफ फसल मास्टर गाइड 2026',
      price: '₹99',
      image: '/images/books/kharif-master-guide-2026-cover.webp',
      link: '/ebooks/kharif-master-guide-2026.html',
      timeAgo: '8 मिनट पहले'
    },
    {
      name: 'Rajesh Verma',
      city: 'Sitapur, UP',
      bookTitle: 'खेती का डॉक्टर (Pocket Doctor)',
      price: '₹99',
      image: '/images/books/fasal-ka-doctor-cover.webp',
      link: '/ebooks/kheti-dr.html',
      timeAgo: '11 मिनट पहले'
    }
  ];

  let toastIndex = 0;
  let toastTimer = null;

  function createPurchaseToastContainer() {
    let container = document.getElementById('ai-live-purchase-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ai-live-purchase-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showNextPurchaseToast() {
    const container = createPurchaseToastContainer();
    const item = LIVE_SALES_DATA[toastIndex % LIVE_SALES_DATA.length];
    toastIndex++;

    const toast = document.createElement('div');
    toast.className = 'ai-purchase-toast-card';
    toast.style.cssText = `
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #ffffff;
      border: 1.5px solid rgba(59, 130, 246, 0.5);
      border-left: 4px solid #3b82f6;
      border-radius: 16px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
      max-width: 320px;
      cursor: pointer;
      transform: translate3d(-120%, 0, 0);
      opacity: 0;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      position: relative;
      overflow: hidden;
      margin-top: 8px;
    `;

    toast.innerHTML = `
      <div style="width: 42px; height: 52px; flex-shrink: 0; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);">
        <img src="${item.image}" alt="${item.bookTitle}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 2px;">
          <span style="font-weight: 800; font-size: 0.84rem; color: #fde047; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
            ${item.name}
          </span>
          <span style="font-size: 0.68rem; color: #94a3b8; flex-shrink: 0;">
            ${item.timeAgo}
          </span>
        </div>
        <div style="font-size: 0.72rem; color: #cbd5e1; margin-bottom: 2px;">
          📍 ${item.city}
        </div>
        <div style="font-size: 0.78rem; font-weight: 700; color: #ffffff; line-height: 1.2; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
          🌾 ${item.bookTitle}
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
          <span style="background: #16a34a; color: #ffffff; font-size: 0.62rem; font-weight: 800; padding: 2px 6px; border-radius: 10px;">
            ✓ Verified Purchase
          </span>
          <span style="font-size: 0.72rem; font-weight: 900; color: #38bdf8;">
            ${item.price}
          </span>
        </div>
      </div>
      <button type="button" class="ai-toast-close" style="position: absolute; top: 4px; right: 4px; background: transparent; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 2px 6px;">&times;</button>
      <div class="ai-toast-progress" style="position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(90deg, #10b981, #3b82f6); width: 100%; transition: width 4.5s linear;"></div>
    `;

    toast.onclick = (e) => {
      if (e.target.classList.contains('ai-toast-close')) {
        e.stopPropagation();
        removeToast(toast);
        return;
      }
      window.location.href = item.link;
    };

    container.appendChild(toast);

    // Animate In
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
    toast.style.transform = 'translate3d(-120%, 0, 0)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }

  function startPurchaseToastStream() {
    // Initial delay of 10 seconds (doubled time as requested)
    setTimeout(() => {
      showNextPurchaseToast();
      // Repeat every 25 seconds (doubled interval between toasts)
      toastTimer = setInterval(() => {
        showNextPurchaseToast();
      }, 25000);
    }, 10000);
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
    const purchased = getPurchasedBookIds();
    const user = getUserProfile();
    const currentPath = (window.location.pathname || '').toLowerCase();

    // 1. Unpurchased Book Rule:
    // If user has not purchased BK001 (Kharif Guide) and is not already on that page:
    if (!purchased.includes('BK001') && !currentPath.includes('kharif-master-guide-2026')) {
      return {
        type: 'book_kharif',
        badge: '🌾 अनुशंसित ई-बुक',
        title: 'खरीफ फसल मास्टर गाइड 2026',
        desc: 'धान, सोयाबीन, मक्का व कपास की 300+ सचित्र वैज्ञानिक गाइड व स्प्रे चार्ट!',
        priceTag: 'मात्र ₹99',
        ctaText: '📖 ई-बुक देखें',
        link: '/ebooks/kharif-master-guide-2026.html',
        image: '/images/books/kharif-master-guide-2026-cover.webp'
      };
    }

    // If user has BK001 but NOT BK002 (Kheti Ka Doctor):
    if (!purchased.includes('BK002') && !currentPath.includes('kheti-dr')) {
      return {
        type: 'book_kheti_dr',
        badge: '🩺 फसल सुरक्षा गाइड',
        title: 'खेती का डॉक्टर (Pocket Doctor)',
        desc: 'पत्तियों के रंग व कीट पहचान कर सही दवा छिड़कने की सम्पूर्ण विधि!',
        priceTag: 'मात्र ₹99',
        ctaText: '📖 ई-बुक देखें',
        link: '/ebooks/kheti-dr.html',
        image: '/images/books/fasal-ka-doctor-cover.webp'
      };
    }

    // 2. VIP Subscription Rule (if user is not a VIP member):
    if (!user.isVip && !currentPath.includes('subscription')) {
      return {
        type: 'vip_pass',
        badge: '👑 VIP ऑल-एक्सेस पास',
        title: 'Aarogyam Pro VIP सदस्यता',
        desc: 'सभी डिजिटल ई-बुक्स, अनकंडीशनल अप्रूवल व 24×7 AI एक्सपर्ट मात्र ₹99 में!',
        priceTag: '₹99/Year',
        ctaText: '👑 VIP पास लें',
        link: '/subscription.html',
        image: '/images/logo/logo.png'
      };
    }

    // 3. Guest Profile Completion Rule:
    if (!user.name && !user.phone) {
      return {
        type: 'profile_welcome',
        badge: '🎁 ₹50 वेलकम बोनस',
        title: 'निःशुल्क किसान प्रोफाइल बनाएं',
        desc: 'अपना नाम जोड़ें और ₹50 का वेलकम रिवार्ड + 24×7 AI एक्सपर्ट तुरंत पाएं!',
        priceTag: '100% मुफ़्त',
        ctaText: '👤 प्रोफाइल बनाएं',
        link: '/ucas/index.html',
        image: '/images/logo/logo.png'
      };
    }

    // 4. Live Webinar / Notification Rule:
    if (!currentPath.includes('webinar')) {
      return {
        type: 'webinar_live',
        badge: '🔴 आज शाम 7:00 बजे',
        title: 'लाइव ज़ूम कृषि वेबिनार',
        desc: 'आधुनिक स्प्रे साइंस व जैविक तकनीकों पर विशेष ऑनलाइन प्रशिक्षण!',
        priceTag: 'Free Pass',
        ctaText: '📺 वेबिनार जॉइन करें',
        link: '/webinar.html',
        image: '/images/banners/farmer-community-banner.jpeg'
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

    // Show 6 seconds after page load
    setTimeout(() => {
      renderNetflix3dPopup(popupData);
      markPopupShownToday();
    }, 6000);
  }

  function renderNetflix3dPopup(data) {
    const wrap = document.createElement('div');
    wrap.className = 'netflix-3d-popup-wrap';

    wrap.innerHTML = `
      <div class="netflix-3d-popup-card" id="netflix-3d-popup-card-elem">
        <button type="button" class="netflix-popup-close-btn" title="Close" id="netflix-popup-close-trigger">&times;</button>
        
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
          <div style="width: 48px; height: 60px; border-radius: 8px; overflow: hidden; flex-shrink: 0; box-shadow: 0 6px 14px rgba(0,0,0,0.6); border: 1.5px solid rgba(255,255,255,0.2);">
            <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/logo/logo.png';" />
          </div>
          <div style="flex: 1; min-width: 0;">
            <span class="netflix-badge-tag">
              ${data.badge}
            </span>
            <h4 style="font-size: 0.98rem; font-weight: 800; margin: 4px 0 2px 0; color: #ffffff; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
              ${data.title}
            </h4>
            <div style="font-size: 0.76rem; color: #fde047; font-weight: 800;">
              ${data.priceTag}
            </div>
          </div>
        </div>

        <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.4; margin: 0 0 12px 0;">
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
