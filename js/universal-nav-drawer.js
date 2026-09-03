/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL RESPONSIVE ACCORDION DRAWER & SHARE ENGINE
 * Version: 17.0 (Zero Lag, Instant Accordion Toggle, Exact Verified Routes)
 * ====================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. GET USER REFERRAL / SHARE ID
  // -------------------------------------------------------------
  window.getUserShareId = function () {
    let savedUser = {};
    try {
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('aarogyam_user') || localStorage.getItem('CURRENT_USER') || '{}');
    } catch (e) {}
    let savedProfile = {};
    try {
      savedProfile = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}');
    } catch (e) {}
    return savedUser.share_id || savedProfile.share_id || savedUser.referral_code || 'AI000004';
  };

  // -------------------------------------------------------------
  // 2. GENERATE REFERRAL-ATTACHED SHARE URL
  // -------------------------------------------------------------
  window.generateReferralShareUrl = function (targetUrl) {
    const base = targetUrl || window.location.href;
    const urlObj = new URL(base, window.location.origin);
    const shareId = window.getUserShareId();
    urlObj.searchParams.set('share_id', shareId);
    urlObj.searchParams.set('ref', shareId);
    return urlObj.toString();
  };

  // -------------------------------------------------------------
  // 3. PERSONALIZED WHATSAPP URL GENERATOR
  // -------------------------------------------------------------
  window.getPersonalizedWhatsAppUrl = function (topic) {
    let savedUser = {};
    try {
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('aarogyam_user') || localStorage.getItem('CURRENT_USER') || '{}');
    } catch (e) {}

    const userName = savedUser.full_name || savedUser.name || savedUser.fullName || 'Valued User';
    const userPhone = savedUser.mobile || savedUser.phone || '';
    const userMeta = userPhone ? ` (Mobile: ${userPhone})` : '';
    const cleanTopic = topic || 'Aarogyam India Services & Consultation';
    
    const message = `Hello Aarogyam, my name is ${userName}${userMeta}. I would like expert AI consultation regarding "${cleanTopic}".`;
    return `https://api.whatsapp.com/send?phone=917974422572&text=${encodeURIComponent(message)}`;
  };

  // -------------------------------------------------------------
  // 4. UNIVERSAL PWA INSTALLATION CONTROLLER (SMART DETECTION)
  // -------------------------------------------------------------
  let deferredPwaPrompt = null;

  function isPwaInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true || 
           localStorage.getItem('AI_PWA_INSTALLED') === 'true';
  }

  function checkPwaInstallState() {
    const installed = isPwaInstalled();
    const installBtns = document.querySelectorAll('#universal-sticky-pwa-install-btn, .sticky-float-install-pill, #header-pwa-install-btn, .btn-pwa-install');
    installBtns.forEach(btn => {
      if (installed) {
        btn.style.display = 'none';
      }
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    checkPwaInstallState();
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('AI_PWA_INSTALLED', 'true');
    checkPwaInstallState();
  });

  window.triggerPwaInstall = function () {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          localStorage.setItem('AI_PWA_INSTALLED', 'true');
          checkPwaInstallState();
          showDrawerToast('🎉 Aarogyam India App installed successfully!', 'success');
        }
        deferredPwaPrompt = null;
      });
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        alert('📲 To install Aarogyam App on iPhone / iPad:\n1. Tap the Share button ⎋ below.\n2. Select "Add to Home Screen" (+).');
      } else {
        alert('📲 To install Aarogyam App, open your browser menu (⋮) and tap "Add to Home screen" or "Install App".');
      }
    }
  };

  // -------------------------------------------------------------
  // 5. MULTI-PLATFORM REFERRAL SHARE ENGINE MODAL (TRANSPARENT 5-BUTTON STACK)
  // -------------------------------------------------------------
  window.openUniversalShareModal = function (title, text, url) {
    const referralUrl = window.generateReferralShareUrl(url);
    title = title || document.title || 'Aarogyam India - Digital Agriculture & Healthcare Hub';
    
    const fullShareText = `🌾 *${title}*\n\nExplore Agriculture Guides, Crop Protection, Healthcare, and Digital eBooks!\n👉 Visit via my referral link:\n${referralUrl}`;

    let overlay = document.getElementById('ai-share-drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ai-share-drawer-overlay';
      overlay.className = 'ai-share-drawer-overlay';
      document.body.appendChild(overlay);
    }

    const encodedUrl = encodeURIComponent(referralUrl);
    const encodedText = encodeURIComponent(fullShareText);

    overlay.innerHTML = `
      <div class="ai-share-buttons-stack" id="ai-share-buttons-stack">
        
        <!-- 1. WhatsApp Button -->
        <a href="https://api.whatsapp.com/send?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-whatsapp" onclick="window.closeUniversalShareModal()">
          <div class="ai-share-icon-wrap" style="background:#25D366;color:#fff;">
            <i class="fa-brands fa-whatsapp"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>WhatsApp</strong>
            <span>किसान ग्रुप्स व दोस्तों को तुरंत मैसेज भेजें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 2. Facebook Button -->
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" class="ai-share-btn-item ch-facebook" onclick="window.closeUniversalShareModal()">
          <div class="ai-share-icon-wrap" style="background:#1877F2;color:#fff;">
            <i class="fa-brands fa-facebook-f"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Facebook</strong>
            <span>फेसबुक फीड या मैसेंजर पर पोस्ट करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 3. Twitter / X Button -->
        <a href="https://twitter.com/intent/tweet?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-twitter" onclick="window.closeUniversalShareModal()">
          <div class="ai-share-icon-wrap" style="background:#000000;color:#fff;">
            <i class="fa-brands fa-x-twitter"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Twitter / X</strong>
            <span>ट्विटर पर पोस्ट या ट्वीट करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 4. Telegram Button -->
        <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" target="_blank" class="ai-share-btn-item ch-telegram" onclick="window.closeUniversalShareModal()">
          <div class="ai-share-icon-wrap" style="background:#229ED9;color:#fff;">
            <i class="fa-brands fa-telegram"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Telegram</strong>
            <span>टेलीग्राम ग्रुप व चैनल्स में शेयर करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 5. Copy Link Button -->
        <div class="ai-share-btn-item ch-copylink" id="ai-share-copy-row-btn" style="cursor:pointer;">
          <div class="ai-share-icon-wrap" style="background:#2563eb;color:#fff;">
            <i class="fa-solid fa-link"></i>
          </div>
          <div class="ai-share-btn-text" style="overflow:hidden;">
            <strong id="ai-share-copy-title">Copy Link</strong>
            <span style="font-family:monospace;font-size:0.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">${referralUrl}</span>
          </div>
          <button type="button" class="ai-share-copy-badge" id="ai-share-copy-badge-action">
            📋 कॉपी करें
          </button>
        </div>

      </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);

    overlay.onclick = function (e) {
      if (e.target === overlay) {
        window.closeUniversalShareModal();
      }
    };

    const copyRow = document.getElementById('ai-share-copy-row-btn');
    const copyBadge = document.getElementById('ai-share-copy-badge-action');
    const copyTitle = document.getElementById('ai-share-copy-title');

    function performCopy(e) {
      if (e) e.stopPropagation();
      navigator.clipboard.writeText(referralUrl).then(() => {
        if (copyBadge) {
          copyBadge.textContent = '✅ कॉपी हो गया!';
          copyBadge.style.background = '#16a34a';
        }
        if (copyTitle) copyTitle.textContent = '✅ लिंक कॉपी हो गया!';
        showDrawerToast('📋 रेफरल लिंक सफलतापूर्वक कॉपी हो गया!', 'success');
        setTimeout(() => {
          if (copyBadge) {
            copyBadge.textContent = '📋 कॉपी करें';
            copyBadge.style.background = '#2563eb';
          }
          if (copyTitle) copyTitle.textContent = 'Copy Link';
        }, 2000);
      }).catch(() => {
        if (copyBadge) copyBadge.textContent = '✅ कॉपी हो गया!';
      });
    }

    copyRow?.addEventListener('click', performCopy);
    copyBadge?.addEventListener('click', performCopy);
  };

  window.closeUniversalShareModal = function () {
    const overlay = document.getElementById('ai-share-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 250);
    }
  };

  window.triggerUniversalPageShare = function () {
    window.openUniversalShareModal(document.title, '🌾 Aarogyam India - Digital Agriculture & Healthcare Hub', window.location.href);
  };

  // -------------------------------------------------------------
  // 6. INSTANT ACCORDION TOGGLE CONTROLLER
  // -------------------------------------------------------------
  window.toggleDrawerAccordion = function (key, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const targetPanel = document.getElementById(`drawer-panel-${key}`);
    const targetBtn = document.getElementById(`drawer-btn-${key}`);
    if (!targetPanel) return;

    const isAlreadyOpen = targetPanel.classList.contains('open');

    // Close all other accordions
    document.querySelectorAll('.drawer-submenu-panel').forEach(p => p.classList.remove('open'));
    document.querySelectorAll('.drawer-nav-item-btn').forEach(b => b.classList.remove('accordion-open'));

    // Toggle clicked accordion
    if (!isAlreadyOpen) {
      targetPanel.classList.add('open');
      if (targetBtn) targetBtn.classList.add('accordion-open');
    }
  };

  // -------------------------------------------------------------
  // 7. INJECT UNIVERSAL RESPONSIVE DRAWER & STICKY FLOATING STACK
  // -------------------------------------------------------------
  function generateDrawerProfileHeaderHtml() {
    let savedUser = {};
    try {
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || '{}');
    } catch (e) {}

    const isLogged = typeof window.isUserLoggedIn === 'function' ? window.isUserLoggedIn() : Boolean(savedUser.mobile || savedUser.phone || localStorage.getItem('aim_user_mobile'));
    const userName = localStorage.getItem('aim_user_name') || savedUser.full_name || savedUser.name || savedUser.fullName || 'Guest User';
    const userPhone = localStorage.getItem('aim_user_mobile') || savedUser.mobile || savedUser.phone || '';
    const userRole = savedUser.isVip ? '👑 Pro VIP Member' : (isLogged ? '🌱 Verified Member' : 'Guest Mode');
    const shareId = window.getUserShareId();

    return `
      <button type="button" class="drawer-close-btn" onclick="window.closeUniversalDrawer()" title="Close Menu">&times;</button>
      
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="drawer-avatar-wrap">
          ${isLogged ? (savedUser.isVip ? '👑' : '👨‍🌾') : '👤'}
        </div>
        <div class="drawer-user-meta">
          <h3 class="drawer-user-name">${userName}</h3>
          <span class="drawer-user-role">${userRole}</span>
          ${userPhone ? `<div style="font-size:0.72rem;color:#cbd5e1;font-weight:600;">📱 +91 ${userPhone}</div>` : ''}
          <div style="font-size:0.7rem;color:#fde047;font-weight:800;margin-top:2px;">🎯 Share ID: ${shareId}</div>
        </div>
      </div>

      <!-- Profile & Login / Logout Action -->
      <div style="margin-top:14px;display:flex;gap:8px;align-items:center;">
        ${isLogged ? `
          <a href="/ucas/index.html" style="background:#fde047;color:#000;font-size:0.78rem;font-weight:800;padding:5px 14px;border-radius:20px;text-decoration:none;box-shadow:0 3px 10px rgba(0,0,0,0.2);">
            👤 My Profile
          </a>
          <button type="button" onclick="window.logoutUniversalUser()" style="background:rgba(239,68,68,0.25);color:#fff;border:1px solid #ef4444;font-size:0.75rem;font-weight:700;padding:5px 12px;border-radius:20px;cursor:pointer;">
            Logout
        ` : `
          <button type="button" onclick="window.openUniversalLoginHandler()" style="background:#fde047;color:#000;font-size:0.8rem;font-weight:900;padding:6px 16px;border-radius:20px;border:none;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,0.2);">
            🔑 Login / Register
          </button>
        `}
      </div>
    `;
  }

  window.openUniversalLoginHandler = function() {
    if (typeof window.closeUniversalDrawer === 'function') {
      window.closeUniversalDrawer();
    }
    if (typeof window.openGuestLoginModal === 'function') {
      window.openGuestLoginModal(null, { force: true });
    } else {
      window.location.href = '/registration.html';
    }
  };

  window.updateUniversalDrawerProfile = function() {
    const headerEl = document.querySelector('#universal-drawer-card .drawer-profile-header');
    if (headerEl) {
      headerEl.innerHTML = generateDrawerProfileHeaderHtml();
    }
  };

  window.addEventListener('ai:user-logged-in', () => {
    window.updateUniversalDrawerProfile();
  });

  function injectUniversalSideDrawer() {
    if (document.getElementById('universal-side-drawer-wrap')) {
      window.updateUniversalDrawerProfile();
      return;
    }

    let cartCount = 0;
    try {
      const c = JSON.parse(localStorage.getItem('AI_CART_ITEMS') || '[]');
      cartCount = Array.isArray(c) ? c.length : 0;
    } catch (e) {}

    let wishCount = 0;
    try {
      const w = JSON.parse(localStorage.getItem('AAROGYAM_WISHLIST') || '[]');
      wishCount = Array.isArray(w) ? w.length : 0;
    } catch (e) {}

    const currentPath = (window.location.pathname || '').toLowerCase();
    const currentSearch = (window.location.search || '').toLowerCase();

    const drawerHtml = `
      <div id="universal-side-drawer-wrap">
        <!-- Backdrop Overlay -->
        <div id="universal-drawer-backdrop" onclick="window.closeUniversalDrawer()"></div>

        <!-- Slide-in Drawer Card (Desktop Left / Mobile Right via CSS) -->
        <div id="universal-drawer-card">
          
          <!-- Sleek Black User Profile Header Banner -->
          <div class="drawer-profile-header">
            ${generateDrawerProfileHeaderHtml()}
          </div>

          <!-- Pure White Canvas Menu List -->
          <div class="drawer-menu-list" style="flex:1;overflow-y:auto;">

            <!-- 1. HOME (Direct Link) -->
            <a href="/index.html" class="drawer-nav-item-btn ${currentPath === '/' || currentPath.endsWith('index.html') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <i class="fa-solid fa-house drawer-item-icon" style="color:#10b981;"></i>
                <span>Home</span>
              </div>
            </a>

            <!-- 2. MY PROFILE ▼ (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-profile" onclick="window.toggleDrawerAccordion('profile', event)">
              <div class="drawer-item-left">
                <i class="fa-solid fa-user-gear drawer-item-icon" style="color:#0ea5e9;"></i>
                <span>My Profile</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-profile">
              <a href="/ucas/index.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-user-gear" style="color:#0ea5e9;"></i><span>My Profile & UCAS</span></div>
              </a>
              <a href="/subscription.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-crown" style="color:#f59e0b;"></i><span>VIP Pass (Subscription)</span></div>
                <span class="drawer-cat-badge" style="background:#fef3c7;color:#b45309;">₹99</span>
              </a>
              <a href="/purchases.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-file-invoice" style="color:#10b981;"></i><span>My Purchases & Invoices</span></div>
              </a>
              <a href="/ucas/index.html?tab=survey" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-clipboard-list" style="color:#0284c7;"></i><span>Smart Survey</span></div>
              </a>
              <a href="/ucas/index.html?tab=phonebook" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-address-book" style="color:#8b5cf6;"></i><span>My Phonebook</span></div>
              </a>
              <a href="/ucas/index.html?tab=leads" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-user-group" style="color:#ea580c;"></i><span>My Share Leads</span></div>
              </a>
              <a href="/ucas/index.html?tab=marketing" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-rocket" style="color:#ec4899;"></i><span>Marketing Engine</span></div>
              </a>
              <a href="/ucas/index.html?tab=product-landing" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-cart-shopping" style="color:#f59e0b;"></i><span>Product Landing Page</span></div>
              </a>
              <a href="/ucas/index.html?tab=hook-templates" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-pen-nib" style="color:#8b5cf6;"></i><span>हुक व शायरी (Hook & Shayari)</span></div>
              </a>
              <a href="/ucas/index.html?tab=sandesh" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-bullhorn" style="color:#ef4444;"></i><span>आरोग्यम संदेश</span></div>
              </a>
              <a href="/ucas/index.html?tab=permissions" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-shield-halved" style="color:#64748b;"></i><span>Permissions</span></div>
              </a>
              <a href="/admin.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-screwdriver-wrench" style="color:#ea580c;"></i><span style="color:#ea580c;font-weight:800;">Admin Center</span></div>
              </a>
            </div>

            <!-- 3. MY LIBRARY (Direct Link) -->
            <a href="/ebooks/my-library.html" class="drawer-nav-item-btn ${currentPath.includes('my-library') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <i class="fa-solid fa-book-open drawer-item-icon" style="color:#2563eb;"></i>
                <span>My Library</span>
              </div>
            </a>

            <!-- 4. LIVE ZOOM WEBINAR (Prominent Top-Level Link) -->
            <a href="/webinar.html" class="drawer-nav-item-btn ${currentPath.includes('webinar') ? 'active-pill' : ''}" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.18) 100%); border: 1px solid rgba(239, 68, 68, 0.3);">
              <div class="drawer-item-left">
                <i class="fa-solid fa-video drawer-item-icon" style="color:#dc2626;"></i>
                <span style="font-weight: 800; color: #dc2626;">🔴 लाइव ज़ूम वेबिनार</span>
              </div>
              <span class="drawer-cat-badge" style="background:#fee2e2;color:#dc2626;font-weight:900;">LIVE</span>
            </a>

            <!-- 5. EBOOKS ▼ (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-ebooks" onclick="window.toggleDrawerAccordion('ebooks', event)">
              <div class="drawer-item-left">
                <i class="fa-solid fa-book-bookmark drawer-item-icon" style="color:#10b981;"></i>
                <span>eBooks</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-ebooks">
              <a href="/ebooks/ebook.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-store" style="color:#2563eb;"></i><span>All eBooks Store</span></div>
              </a>
              <a href="/ebooks/kharif-master-guide-2026.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-wheat-awn" style="color:#d97706;"></i><span>Kharif Master Guide 2026</span></div>
                <span class="drawer-cat-badge" style="background:#fef3c7;color:#b45309;">Best Seller</span>
              </a>
              <a href="/ebooks/kheti-dr.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-stethoscope" style="color:#dc2626;"></i><span>Kheti Ka Doctor</span></div>
                <span class="drawer-cat-badge" style="background:#fee2e2;color:#991b1b;">Top Seller</span>
              </a>
              <a href="/ebooks/agriculture.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-seedling" style="color:#16a34a;"></i><span>Agriculture Books</span></div>
              </a>
              <a href="/ebooks/ai-website-guide.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-laptop-code" style="color:#0284c7;"></i><span>AI Website Guide</span></div>
              </a>
              <a href="/ebooks/business.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-chart-line" style="color:#8b5cf6;"></i><span>Business eBooks</span></div>
              </a>
              <a href="/ebooks/wishlist.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-heart" style="color:#ef4444;"></i><span>Wishlist</span></div>
                <span class="drawer-cat-badge" style="background:#fee2e2;color:#991b1b;display:${wishCount > 0 ? 'inline-block' : 'none'};">${wishCount}</span>
              </a>
              <a href="/ebooks/cart.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-cart-shopping" style="color:#059669;"></i><span>Shopping Cart</span></div>
                <span class="drawer-cat-badge" style="background:#dcfce7;color:#166534;display:${cartCount > 0 ? 'inline-block' : 'none'};">${cartCount}</span>
              </a>
            </div>

            <!-- 6. CATEGORIES ▼ (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-categories" onclick="window.toggleDrawerAccordion('categories', event)">
              <div class="drawer-item-left">
                <i class="fa-solid fa-layer-group drawer-item-icon" style="color:#f59e0b;"></i>
                <span>Categories</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-categories">
              <a href="/ebooks/agriculture.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-seedling" style="color:#16a34a;"></i><span>🌾 Agriculture (कृषि हब)</span></div>
              </a>
              <a href="/ebooks/health.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-heart-pulse" style="color:#ec4899;"></i><span>❤️ Health & Wellness</span></div>
              </a>
              <a href="/ebooks/business.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-briefcase" style="color:#8b5cf6;"></i><span>💼 Business (बिज़नेस)</span></div>
              </a>
              <a href="/ebooks/netsurf.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-network-wired" style="color:#2563eb;"></i><span>🌐 NetSurf Direct</span></div>
              </a>
              <a href="/ebooks/education.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-graduation-cap" style="color:#0284c7;"></i><span>🎓 Education & Training</span></div>
              </a>
              <a href="/ebooks/digital-ai.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-robot" style="color:#d97706;"></i><span>🤖 Digital AI Tools</span></div>
              </a>
              <a href="/index.html#sec-pashu-palan" class="drawer-sub-link-item" onclick="window.closeUniversalDrawer()">
                <div class="drawer-item-left"><i class="fa-solid fa-cow" style="color:#15803d;"></i><span>🐄 Livestock & Dairy (पशु पालन)</span></div>
              </a>
            </div>

            <!-- 7. SERVICES ▼ (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-services" onclick="window.toggleDrawerAccordion('services', event)">
              <div class="drawer-item-left">
                <i class="fa-solid fa-screwdriver-wrench drawer-item-icon" style="color:#8b5cf6;"></i>
                <span>Services</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-services">
              <a href="/mandi.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-seedling" style="color:#10b981;"></i><span>कृषि मंडी भाव (Mandi Bhav)</span></div>
                <span class="drawer-cat-badge" style="background:#fef3c7;color:#b45309;">Live</span>
              </a>
              <a href="/weather.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-cloud-sun" style="color:#0284c7;"></i><span>मौसम अपडेट (Weather)</span></div>
              </a>
              <a href="/crop-doctor.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-microscope" style="color:#0ea5e9;"></i><span>फसल डॉक्टर AI (Crop Doctor)</span></div>
              </a>
              <a href="/webinar.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-video" style="color:#dc2626;"></i><span>🔴 लाइव ज़ूम वेबिनार</span></div>
                <span class="drawer-cat-badge" style="background:#fee2e2;color:#dc2626;">Live</span>
              </a>
              <a href="javascript:void(0)" onclick="window.location.href=window.getPersonalizedWhatsAppUrl('24x7 AI Expert Consultation'); window.closeUniversalDrawer();" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-brands fa-whatsapp" style="color:#25d366;"></i><span>AI Expert Consultation</span></div>
                <span class="drawer-cat-badge" style="background:#dcfce7;color:#15803d;">24×7</span>
              </a>
            </div>

            <!-- 8. ABOUT (Direct Link) -->
            <a href="/about.html" class="drawer-nav-item-btn ${currentPath.includes('about') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <i class="fa-solid fa-circle-info drawer-item-icon" style="color:#0284c7;"></i>
                <span>About</span>
              </div>
            </a>

            <!-- 9. BLOG (Direct Link) -->
            <a href="/blog.html" class="drawer-nav-item-btn ${currentPath.includes('blog') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <i class="fa-solid fa-newspaper drawer-item-icon" style="color:#8b5cf6;"></i>
                <span>Blog & News</span>
              </div>
            </a>

            <!-- 10. CONTACT (Direct Link) -->
            <a href="/contact.html" class="drawer-nav-item-btn ${currentPath.includes('contact') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <i class="fa-solid fa-phone-volume drawer-item-icon" style="color:#10b981;"></i>
                <span>Contact</span>
              </div>
            </a>

            <!-- 11. SUPPORT ▼ (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-support" onclick="window.toggleDrawerAccordion('support', event)">
              <div class="drawer-item-left">
                <i class="fa-solid fa-headset drawer-item-icon" style="color:#ea580c;"></i>
                <span>Support</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-support">
              <a href="/faq.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-circle-question" style="color:#0284c7;"></i><span>FAQ</span></div>
              </a>
              <a href="/terms.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-file-contract" style="color:#64748b;"></i><span>Terms & Conditions</span></div>
              </a>
              <a href="/shipping-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-truck" style="color:#0ea5e9;"></i><span>Shipping Policy</span></div>
              </a>
              <a href="/privacy-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-shield-halved" style="color:#10b981;"></i><span>Privacy Policy</span></div>
              </a>
              <a href="/refund-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-rotate-left" style="color:#f59e0b;"></i><span>Refund Policy</span></div>
              </a>
              <a href="/disclaimer.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><i class="fa-solid fa-triangle-exclamation" style="color:#dc2626;"></i><span>Disclaimer</span></div>
              </a>
            </div>

          </div>

        </div>
      </div>

      <!-- Sticky Floating Actions Container on Page (Fixed Right Corner) -->
      <div class="sticky-float-widget-container" id="universal-sticky-float-widget">
        <!-- 1. Red Sticky Install App Button (Smart PWA Detection) -->
        <button type="button" onclick="window.triggerPwaInstall()" class="sticky-float-pill sticky-float-install-pill" id="universal-sticky-pwa-install-btn" title="Install Aarogyam App">
          <i class="fa-solid fa-mobile-screen-button"></i>
          <span class="pill-label">Install App</span>
        </button>

        <!-- 2. Green WhatsApp AI Expert Consultation -->
        <a href="javascript:void(0)" onclick="window.location.href=window.getPersonalizedWhatsAppUrl('Instant AI Consultation');" class="sticky-float-pill" title="Consult AI Expert">
          <i class="fa-brands fa-whatsapp"></i>
          <span class="pill-label">AI Expert</span>
        </a>

        <!-- 3. Blue Universal Referral Share -->
        <button type="button" onclick="window.triggerUniversalPageShare()" class="sticky-float-pill sticky-float-share-pill" title="Share Referral Link">
          <i class="fa-solid fa-share-nodes" style="color:#fde047;"></i>
          <span class="pill-label">Share Link</span>
        </button>
      </div>

      <!-- Universal Sticky Mobile Bottom 8-Tab Navigation Bar (Mobile & Tablet) -->
      <nav class="universal-mobile-bottom-nav" id="universal-mobile-bottom-nav">
        <!-- 1. Home -->
        <a href="/index.html" class="u-nav-tab ${(currentPath === '/' || currentPath.endsWith('index.html')) && !currentPath.includes('ucas') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-house"></i></div>
          <span>Home</span>
        </a>
        <!-- 2. Survey -->
        <a href="/ucas/index.html?tab=survey" class="u-nav-tab ${currentSearch.includes('tab=survey') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-clipboard-list"></i></div>
          <span>Survey</span>
        </a>
        <!-- 3. Library -->
        <a href="/ebooks/my-library.html" class="u-nav-tab ${currentPath.includes('my-library') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-book-bookmark"></i></div>
          <span>Library</span>
        </a>
        <!-- 4. eBooks -->
        <a href="/ebooks/ebook.html" class="u-nav-tab ${currentPath.includes('ebook') && !currentPath.includes('my-library') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-book-open"></i></div>
          <span>eBooks</span>
        </a>
        <!-- 5. Mandi -->
        <a href="/mandi.html" class="u-nav-tab ${currentPath.includes('mandi') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-seedling"></i></div>
          <span>Mandi</span>
        </a>
        <!-- 6. Marketing Engine -->
        <a href="/ucas/index.html?tab=marketing" class="u-nav-tab ${currentSearch.includes('tab=marketing') || currentPath.includes('marketing') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-bullhorn"></i></div>
          <span>Marketing</span>
        </a>
        <!-- 7. Webinar -->
        <a href="/webinar.html" class="u-nav-tab ${currentPath.includes('webinar') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-video"></i></div>
          <span>Webinar</span>
        </a>
        <!-- 8. Profile -->
        <a href="/ucas/index.html" class="u-nav-tab ${(currentPath.includes('ucas') || currentPath.includes('profile')) && !currentSearch.includes('tab=survey') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-user"></i></div>
          <span>Profile</span>
        </a>
      </nav>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHtml);
    bindDrawerTriggers();
    checkPwaInstallState();
  }

  function bindDrawerTriggers() {
    const triggers = document.querySelectorAll('.menu-button, #btn-drawer-toggle, [data-drawer-toggle], .header-menu-btn, .navbar-toggler, #mobile-menu-btn, .menu-btn, #menuBtn');
    triggers.forEach(btn => {
      if (btn.dataset.drawerBound) return;
      btn.dataset.drawerBound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openUniversalDrawer(e);
      });
    });

    const backdrop = document.getElementById('universal-drawer-backdrop');
    if (backdrop && !backdrop.dataset.bound) {
      backdrop.dataset.bound = 'true';
      backdrop.addEventListener('click', window.closeUniversalDrawer);
    }
  }

  window.openUniversalDrawer = function (e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const backdrop = document.getElementById('universal-drawer-backdrop');
    const card = document.getElementById('universal-drawer-card');
    if (backdrop) backdrop.classList.add('open');
    if (card) card.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  window.closeUniversalDrawer = function (e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const backdrop = document.getElementById('universal-drawer-backdrop');
    const card = document.getElementById('universal-drawer-card');
    if (backdrop) backdrop.classList.remove('open');
    if (card) card.classList.remove('open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeUniversalDrawer();
    }
  });

  window.logoutUniversalUser = function () {
    localStorage.removeItem('AI_USER');
    localStorage.removeItem('AI_PROFILE');
    localStorage.removeItem('UCAS_USER');
    localStorage.removeItem('aim_user_name');
    localStorage.removeItem('aim_user_mobile');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('aarogyam_user');
    localStorage.removeItem('CURRENT_USER');
    localStorage.removeItem('wb_registered');
    sessionStorage.removeItem('ai_guest_dismissed');
    alert('आप सफलतापूर्वक लॉगआउट हो चुके हैं। (Logged out successfully)');
    window.location.reload();
  };

  function showDrawerToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${type === 'success' ? '#16a34a' : '#1e293b'};color:#fff;padding:10px 18px;border-radius:25px;font-weight:700;font-size:0.85rem;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:9999999;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUniversalSideDrawer);
  } else {
    injectUniversalSideDrawer();
  }
})();
