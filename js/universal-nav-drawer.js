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
    if (window.V1_SESSION && typeof window.V1_SESSION.getUnifiedShareId === 'function') {
      return window.V1_SESSION.getUnifiedShareId();
    }
    let savedUser = {};
    try {
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || '{}');
    } catch (e) {}
    if (savedUser.share_id && /^AI\d{4,8}$/i.test(savedUser.share_id)) return savedUser.share_id;
    if (savedUser.referral_code && /^AI\d{4,8}$/i.test(savedUser.referral_code)) return savedUser.referral_code;
    const cleanMob = (savedUser.mobile || localStorage.getItem('aim_user_mobile') || '').replace(/\D/g, '').slice(-10);
    if (cleanMob.length === 10) {
      return 'AI' + cleanMob.slice(-6);
    }
    return 'AI000004';
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
    try {
      // Return true ONLY when running inside the installed standalone PWA app window
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
      if (isStandalone) return true;

      // Android TWA / WebAPK wrapper
      if (document.referrer && document.referrer.startsWith('android-app://')) {
        return true;
      }
    } catch(e) {}
    return false;
  }

  function checkPwaInstallState() {
    const installed = isPwaInstalled();
    const installBtns = document.querySelectorAll('#universal-sticky-pwa-install-btn, .sticky-float-install-pill, #header-pwa-install-btn, .btn-pwa-install');
    installBtns.forEach(btn => {
      if (installed) {
        btn.style.setProperty('display', 'none', 'important');
      } else {
        btn.style.removeProperty('display');
      }
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    checkPwaInstallState();
  });

  window.addEventListener('appinstalled', () => {
    try { localStorage.setItem('AI_PWA_INSTALLED', 'true'); } catch(e) {}
    const installBtns = document.querySelectorAll('#universal-sticky-pwa-install-btn, .sticky-float-install-pill, #header-pwa-install-btn, .btn-pwa-install');
    installBtns.forEach(btn => btn.style.setProperty('display', 'none', 'important'));
  });

  try {
    if (window.matchMedia) {
      window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
        checkPwaInstallState();
      });
    }
  } catch(e) {}

  window.triggerPwaInstall = function () {
    if (isPwaInstalled()) {
      showDrawerToast('🎉 Aarogyam India App पहले से आपके मोबाइल में इंस्टॉल है!', 'success');
      checkPwaInstallState();
      return;
    }
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          try { localStorage.setItem('AI_PWA_INSTALLED', 'true'); } catch(e) {}
          const installBtns = document.querySelectorAll('#universal-sticky-pwa-install-btn, .sticky-float-install-pill');
          installBtns.forEach(btn => btn.style.setProperty('display', 'none', 'important'));
          showDrawerToast('🎉 Aarogyam India App installed successfully!', 'success');
        }
        deferredPwaPrompt = null;
      });
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        alert('📲 Aarogyam App को iPhone / iPad पर इनस्टॉल करने के लिए:\n1. नीचे Safari Share बटन (⎋) दबाएं।\n2. "Add to Home Screen" (+) चुनें।');
      } else {
        alert('📲 Aarogyam App इनस्टॉल करने के लिए ब्राउज़र मेनू (⋮) खोलें और "Add to Home screen" या "Install App" दबाएं।');
      }
    }
  };

  // -------------------------------------------------------------
  // 5. MULTI-PLATFORM REFERRAL SHARE ENGINE MODAL (TRANSPARENT 5-BUTTON STACK)
  // -------------------------------------------------------------
  window.openUniversalShareModal = function (title, text, url) {
    if (typeof window.triggerViralPageShare === 'function') {
      window.triggerViralPageShare({ title: title, text: text, url: url });
      return;
    }

    const isLogged = (window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function')
      ? window.V1_SESSION.isLoggedIn()
      : (typeof window.isUserLoggedIn === 'function' ? window.isUserLoggedIn() : false);

    if (!isLogged) {
      if (typeof window.openGuestLoginModal === 'function') {
        window.openGuestLoginModal(() => {
          window.openUniversalShareModal(title, text, url);
        }, { force: false, source: 'UniversalShareGate' });
        return;
      }
    }

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
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || localStorage.getItem('AI_SESSION') || '{}');
    } catch (e) {}

    const userPhone = (localStorage.getItem('aim_user_mobile') || localStorage.getItem('aarogyam_user_phone') || localStorage.getItem('SAKHI_USER_PHONE') || savedUser.mobile || savedUser.phone || '').replace(/\D/g, '').slice(-10);
    const isLogged = typeof window.isUserLoggedIn === 'function' ? window.isUserLoggedIn() : (userPhone.length === 10);
    let userName = localStorage.getItem('aim_user_name') || localStorage.getItem('aarogyam_user_name') || localStorage.getItem('SAKHI_USER_NAME') || savedUser.full_name || savedUser.name || savedUser.fullName || '';
    if (!userName || userName.toLowerCase() === 'null' || userName.toLowerCase() === 'undefined' || userName.toLowerCase().includes('guest')) {
      userName = isLogged ? 'किसान साथी' : 'Guest User';
    }
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
          ${userPhone ? `<div style="font-size:0.78rem;color:#93c5fd;font-weight:700;margin-top:2px;"><i class="fa-solid fa-phone" style="font-size:0.72rem;margin-right:5px;color:#38bdf8;"></i>+91 ${userPhone}</div>` : ''}
          <div style="font-size:0.72rem;color:#34d399;font-weight:800;margin-top:3px;display:inline-flex;align-items:center;gap:5px;background:rgba(52,211,153,0.15);padding:2px 8px;border-radius:6px;border:1px solid rgba(52,211,153,0.35);">
            <span>🎯 Share ID:</span>
            <span style="letter-spacing:0.5px;">${shareId}</span>
          </div>
        </div>
      </div>

      <!-- Profile & Login / Logout Action -->
      <div class="drawer-hdr-actions">
        ${isLogged ? `
          <a href="/ucas/index.html" class="drawer-hdr-pill-btn drawer-hdr-profile-btn">
            <i class="fa-solid fa-user-circle"></i>
            <span>My Profile</span>
          </a>
          <button type="button" onclick="window.logoutUniversalUser()" class="drawer-hdr-pill-btn drawer-hdr-logout-btn">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        ` : `
          <button type="button" onclick="window.openUniversalLoginHandler()" class="drawer-hdr-pill-btn drawer-hdr-login-btn">
            <i class="fa-solid fa-key"></i>
            <span>Login / Register</span>
          </button>
        `}
      </div>
    `;
  }

  window.logoutUniversalUser = function() {
    if (!confirm('क्या आप सचमुच लॉग आउट करना चाहते हैं?')) return;
    localStorage.removeItem('aim_user_name');
    localStorage.removeItem('aim_user_mobile');
    localStorage.removeItem('aarogyam_user_name');
    localStorage.removeItem('aarogyam_user_phone');
    localStorage.removeItem('SAKHI_USER_NAME');
    localStorage.removeItem('SAKHI_USER_PHONE');
    localStorage.removeItem('AI_USER');
    localStorage.removeItem('AI_PROFILE');
    localStorage.removeItem('UCAS_USER');
    try {
      const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
      delete sess.name;
      delete sess.mobile;
      delete sess.phone;
      delete sess.loggedIn;
      localStorage.setItem('AI_SESSION', JSON.stringify(sess));
    } catch (e) {}
    window.updateUniversalDrawerProfile();
    window.dispatchEvent(new CustomEvent('ai:user-logged-out'));
    if (typeof window.renderInitialGreeting === 'function') {
      window.renderInitialGreeting();
    }
  };

  window.openUniversalLoginHandler = function() {
    if (typeof window.closeUniversalDrawer === 'function') {
      window.closeUniversalDrawer();
    }
    const isSakhiPage = window.location.pathname.includes('aarogyam-sakhi');
    if (isSakhiPage && typeof window.openSakhiAuthModal === 'function') {
      window.openSakhiAuthModal();
    } else if (typeof window.openGuestLoginModal === 'function') {
      window.openGuestLoginModal(null, { force: true, fastForm: true });
    } else {
      window.location.href = '/registration.html?mode=login';
    }
  };

  function updateHeaderUserBadge() {
    try {
      const headerActions = document.querySelector('.header-actions');
      if (!headerActions) return;

      const isLogged = (window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function')
        ? window.V1_SESSION.isLoggedIn()
        : (typeof window.isUserLoggedIn === 'function' ? window.isUserLoggedIn() : false);

      let existingBadge = document.getElementById('header-unified-user-badge');
      if (!existingBadge) {
        existingBadge = document.createElement('div');
        existingBadge.id = 'header-unified-user-badge';
        existingBadge.style.cssText = 'display:inline-flex;align-items:center;margin:0 2px;';
        const menuBtn = headerActions.querySelector('.menu-button');
        if (menuBtn) {
          headerActions.insertBefore(existingBadge, menuBtn);
        } else {
          headerActions.appendChild(existingBadge);
        }
      }

      if (isLogged) {
        let savedUser = {};
        try {
          savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || '{}');
        } catch (e) {}
        const name = (savedUser && (savedUser.full_name || savedUser.name)) || localStorage.getItem('aim_user_name') || 'सदस्य';
        const isVip = Boolean(savedUser.isVip);
        existingBadge.innerHTML = `
          <a href="/ucas/index.html" class="header-user-status-pill" title="मेरी प्रोफाइल (My Profile)" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.35);color:#fde047;padding:5px 11px;border-radius:20px;text-decoration:none;font-weight:800;font-size:0.75rem;display:inline-flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:all 0.2s;">
            <span style="font-size:0.88rem;">${isVip ? '👑' : '👨‍🌾'}</span>
            <span style="max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ffffff;">${name}</span>
          </a>
        `;
      } else {
        existingBadge.innerHTML = `
          <button type="button" onclick="window.openUniversalLoginHandler()" class="header-login-quick-btn" title="लॉगिन करें" style="background:#fde047;color:#0f172a;border:none;padding:5px 12px;border-radius:20px;font-weight:900;font-size:0.75rem;cursor:pointer;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,0.18);">
            <span>🔑</span> <span>लॉगिन</span>
          </button>
        `;
      }
    } catch(e) {
      console.warn("Header user badge notice:", e);
    }
  }

  window.updateUniversalDrawerProfile = function() {
    const headerEl = document.querySelector('#universal-drawer-card .drawer-profile-header');
    if (headerEl) {
      headerEl.innerHTML = generateDrawerProfileHeaderHtml();
    }
    updateHeaderUserBadge();
  };

  window.addEventListener('ai:user-logged-in', () => {
    window.updateUniversalDrawerProfile();
  });

  function ensureDrawerStylesInjected() {
    if (document.getElementById('universal-nav-drawer-runtime-style')) return;
    const style = document.createElement('style');
    style.id = 'universal-nav-drawer-runtime-style';
    style.textContent = `
      #universal-drawer-card {
        background: #080f1e !important;
        color: #ffffff !important;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
      }
      .drawer-profile-header {
        background: linear-gradient(135deg, #0d1b38 0%, #081126 100%) !important;
        color: #ffffff !important;
        border-bottom: 2px solid #1e3a8a !important;
      }
      .drawer-user-name {
        color: #ffffff !important;
        font-weight: 800 !important;
      }
      .drawer-user-role {
        color: #38bdf8 !important;
      }
      .drawer-hdr-actions {
        margin-top: 14px !important;
        display: flex !important;
        gap: 10px !important;
        align-items: center !important;
        flex-wrap: wrap !important;
      }
      .drawer-hdr-pill-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 7px !important;
        padding: 7px 16px !important;
        border-radius: 20px !important;
        font-size: 0.8rem !important;
        font-weight: 800 !important;
        text-decoration: none !important;
        cursor: pointer !important;
        border: none !important;
      }
      .drawer-hdr-profile-btn {
        background: #2563eb !important;
        color: #ffffff !important;
        border: 1px solid #60a5fa !important;
        box-shadow: 0 3px 10px rgba(37, 99, 235, 0.45) !important;
      }
      .drawer-hdr-logout-btn {
        background: #dc2626 !important;
        color: #ffffff !important;
        border: 1px solid #ef4444 !important;
        box-shadow: 0 3px 10px rgba(220, 38, 38, 0.5) !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .drawer-hdr-login-btn {
        background: #16a34a !important;
        color: #ffffff !important;
        border: 1px solid #4ade80 !important;
      }
      .drawer-menu-list {
        padding: 12px 10px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 7px !important;
        background: transparent !important;
      }
      .drawer-nav-item-btn {
        width: 100% !important;
        background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%) !important;
        color: #ffffff !important;
        border: 1.5px solid #3b82f6 !important;
        border-radius: 14px !important;
        padding: 13px 15px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        cursor: pointer !important;
        text-align: left !important;
        text-decoration: none !important;
        box-sizing: border-box !important;
        box-shadow: 0 4px 14px rgba(29, 78, 216, 0.4) !important;
      }
      .drawer-nav-item-btn:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.55) !important;
        color: #ffffff !important;
      }
      .drawer-nav-item-btn.active-pill {
        background: #1e3a8a !important;
        border-color: #60a5fa !important;
        color: #ffffff !important;
        box-shadow: 0 0 16px rgba(96, 165, 250, 0.45) !important;
      }
      .drawer-nav-item-btn.accordion-open {
        background: #1e3a8a !important;
        border-color: #38bdf8 !important;
        color: #ffffff !important;
      }
      .drawer-icon-box {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        border-radius: 10px !important;
        background: rgba(255, 255, 255, 0.22) !important;
        color: #ffffff !important;
        border: 1.5px solid rgba(255, 255, 255, 0.35) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.12rem !important;
        flex-shrink: 0 !important;
      }
      .drawer-item-title {
        font-size: 1.02rem !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        line-height: 1.25 !important;
        letter-spacing: 0.2px !important;
      }
      .drawer-accordion-arrow {
        font-size: 0.92rem !important;
        color: #ffffff !important;
        flex-shrink: 0 !important;
        margin-left: 8px !important;
      }
      .drawer-tag-pill {
        font-size: 0.7rem !important;
        font-weight: 800 !important;
        padding: 2px 8px !important;
        border-radius: 6px !important;
        background: rgba(255, 255, 255, 0.22) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        letter-spacing: 0.2px !important;
        flex-shrink: 0 !important;
      }
      .drawer-submenu-panel {
        display: none;
        flex-direction: column !important;
        gap: 5px !important;
        background: #060e1d !important;
        border-radius: 0 12px 12px 12px !important;
        margin: 4px 0 10px 14px !important;
        padding: 8px !important;
        border: 1px solid #1e3a8a !important;
        border-left: 3.5px solid #38bdf8 !important;
      }
      .drawer-submenu-panel.open {
        display: flex !important;
      }
      .drawer-sub-link-item {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 8px 11px !important;
        background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%) !important;
        color: #ffffff !important;
        text-decoration: none !important;
        font-weight: 700 !important;
        font-size: 0.84rem !important;
        border-radius: 8px !important;
        border: 1px solid #38bdf8 !important;
        box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25) !important;
      }
      .drawer-sub-link-item:hover {
        background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%) !important;
        color: #ffffff !important;
      }
      .drawer-sub-link-item span {
        color: #ffffff !important;
        font-size: 0.84rem !important;
      }
      .drawer-sub-icon-box {
        width: 24px !important;
        height: 24px !important;
        min-width: 24px !important;
        border-radius: 6px !important;
        background: rgba(255, 255, 255, 0.25) !important;
        color: #ffffff !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 0.78rem !important;
        flex-shrink: 0 !important;
      }
      .drawer-sub-section-title {
        font-size: 0.72rem !important;
        font-weight: 800 !important;
        color: #fde047 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.6px !important;
        padding: 6px 6px 3px 6px !important;
        margin-top: 6px !important;
        border-top: 1px solid rgba(56, 189, 248, 0.3) !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }
    `;
    document.head.appendChild(style);
  }

  function injectUniversalSideDrawer() {
    ensureDrawerStylesInjected();
    updateHeaderUserBadge();
    if (window.USER_NOTIFICATIONS && typeof window.USER_NOTIFICATIONS.ensureBellIcon === 'function') {
      window.USER_NOTIFICATIONS.ensureBellIcon();
    }
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
    const isInstalled = isPwaInstalled();

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

          <!-- Clean Executive Blue Canvas Menu List -->
          <div class="drawer-menu-list" style="flex:1;overflow-y:auto;">

            <!-- 1. HOME (Main Menu Direct Button) -->
            <a href="/index.html" class="drawer-nav-item-btn ${currentPath === '/' || currentPath.endsWith('index.html') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-icon-box"><i class="fa-solid fa-house"></i></div>
                <span class="drawer-item-title">होम (Home)</span>
              </div>
            </a>

            <!-- 1.1 AAROGYAM SAKHI AI (24x7 Digital Doctor & Kisan Sakhi) -->
            <a href="/aarogyam-sakhi.html" onclick="if(window.openSakhiModal){window.openSakhiModal();window.closeUniversalDrawer();return false;}" class="drawer-nav-item-btn ${currentPath.includes('aarogyam-sakhi') ? 'active-pill' : ''}" style="background:linear-gradient(135deg, #15803d 0%, #16a34a 100%) !important; border-color:#86efac !important; box-shadow:0 4px 14px rgba(22,163,74,0.45) !important;">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#0f172a; border-color:#4ade80;"><i class="fa-solid fa-robot" style="color:#4ade80;"></i></div>
                <span class="drawer-item-title">आरोग्यम सखी AI (24×7 डॉक्टर)</span>
              </div>
              <span class="drawer-tag-pill" style="background:#fde047; color:#0f172a; font-weight:900;">AI 👩‍🌾</span>
            </a>

            <!-- 2. MY LIBRARY (Main Menu Direct Button) -->
            <a href="/ebooks/my-library.html" class="drawer-nav-item-btn ${currentPath.includes('my-library') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-icon-box"><i class="fa-solid fa-book-open-reader"></i></div>
                <span class="drawer-item-title">मेरी लाइब्रेरी (My Library)</span>
              </div>
              <span class="drawer-tag-pill">रीडर 📖</span>
            </a>

            <!-- 2. E-BOOKS (Accordion with Submenus) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-ebooks" onclick="window.toggleDrawerAccordion('ebooks', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box"><i class="fa-solid fa-book-bookmark"></i></div>
                <span class="drawer-item-title">ई-बुक्स (eBooks)</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-ebooks">
              <a href="/ebooks/ebook.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-store"></i></div>
                  <span>सभी ई-बुक्स स्टोर (Store)</span>
                </div>
              </a>
              <a href="/ebooks/agriculture.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-seedling"></i></div>
                  <span>कृषि ई-बुक्स (Agriculture)</span>
                </div>
              </a>
              <a href="/ebooks/wishlist.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-heart"></i></div>
                  <span>पसंदीदा ई-बुक्स (Wishlist)</span>
                </div>
                <span class="drawer-tag-pill" style="display:${wishCount > 0 ? 'inline-block' : 'none'};">${wishCount}</span>
              </a>
              <a href="/ebooks/cart.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-cart-shopping"></i></div>
                  <span>शॉपिंग कार्ट (Shopping Cart)</span>
                </div>
                <span class="drawer-tag-pill" style="display:${cartCount > 0 ? 'inline-block' : 'none'};">${cartCount}</span>
              </a>
            </div>

            <!-- 3. NETSURF (Main Menu with Submenus: Agri, Pashu Palan, Health & Sub-pages) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-netsurf" onclick="window.toggleDrawerAccordion('netsurf', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box"><i class="fa-solid fa-boxes-stacked"></i></div>
                <span class="drawer-item-title">नेटसर्फ (NetSurf)</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-netsurf">
              <a href="/categories/netsurf-products.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-file-pdf"></i></div>
                  <span>सम्पूर्ण कैटलॉग (All Products)</span>
                </div>
                <span class="drawer-tag-pill">7 भाषा PDF</span>
              </a>
              <a href="/categories/netsurf.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-briefcase"></i></div>
                  <span>नेटसर्फ करियर (Direct Selling)</span>
                </div>
              </a>

              <!-- Agriculture & Pashupalan Subsection -->
              <div class="drawer-sub-section-title"><i class="fa-solid fa-seedling"></i> कृषि व पशु पालन</div>
              <a href="/ebooks/agriculture.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-wheat-awn"></i></div>
                  <span>कृषि मुख्य पृष्ठ (Agriculture)</span>
                </div>
              </a>
              <a href="/pashu-palan.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-cow"></i></div>
                  <span>पशु पालन व डेयरी हब (Pashu Palan)</span>
                </div>
              </a>

              <!-- Health Subsection & All Health Subpages -->
              <div class="drawer-sub-section-title"><i class="fa-solid fa-heart-pulse"></i> स्वास्थ्य व वेलनेस (Health)</div>
              <a href="/categories/health.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-hospital"></i></div>
                  <span>स्वास्थ्य मुख्य पृष्ठ (Health Hub)</span>
                </div>
                <span class="drawer-tag-pill">MAIN</span>
              </a>
              <a href="/health/diabetes.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-droplet"></i></div><span>डायबिटीज केयर (Diabetes)</span></div>
              </a>
              <a href="/health/joint-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-bone"></i></div><span>जोड़ों का दर्द (Joint Care)</span></div>
              </a>
              <a href="/health/heart-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-heart"></i></div><span>हृदय स्वास्थ्य (Heart Care)</span></div>
              </a>
              <a href="/health/womens-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-person-dress"></i></div><span>महिला स्वास्थ्य (Women's Care)</span></div>
              </a>
              <a href="/health/weight-loss.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-weight-scale"></i></div><span>वजन नियंत्रण (Weight Loss)</span></div>
              </a>
              <a href="/health/liver-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-shield-virus"></i></div><span>लिवर केयर (Liver Care)</span></div>
              </a>
              <a href="/health/thyroid-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-dna"></i></div><span>थायराइड केयर (Thyroid Care)</span></div>
              </a>
              <a href="/health/skin-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-spa"></i></div><span>स्किन केयर (Skin Care)</span></div>
              </a>
              <a href="/health/hair-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-wind"></i></div><span>हेयर केयर (Hair Care)</span></div>
              </a>
              <a href="/health/kids-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-child"></i></div><span>किड्स केयर (Kids Care)</span></div>
              </a>
              <a href="/health/dental-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-tooth"></i></div><span>डेंटल केयर (Dental Care)</span></div>
              </a>
              <a href="/health/home-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-house-chimney-medical"></i></div><span>होम केयर (Home Care)</span></div>
              </a>
              <a href="/health/sexual-wellness.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-venus-mars"></i></div><span>सेक्सुअल वेलनेस (Wellness)</span></div>
              </a>
            </div>

            <!-- 4. KISAN SERVICES (Accordion: Mandi Bhav, Weather, Crop Doctor, Webinar, WhatsApp) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-services" onclick="window.toggleDrawerAccordion('services', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                <span class="drawer-item-title">किसान सेवाएं (Kisan Services)</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-services">
              <a href="/mandi.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-chart-line"></i></div>
                  <span>लाइव कृषि मंडी भाव (Mandi Bhav)</span>
                </div>
                <span class="drawer-tag-pill">LIVE 🔴</span>
              </a>
              <a href="/weather.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-cloud-sun"></i></div>
                  <span>7-दिवसीय मौसम पूर्वानुमान (Weather)</span>
                </div>
              </a>
              <a href="/aarogyam-sakhi.html" onclick="if(window.openSakhiModal){window.openSakhiModal();window.closeUniversalDrawer();return false;}" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box" style="background:#15803d; color:#ffffff;"><i class="fa-solid fa-robot"></i></div>
                  <span>आरोग्यम सखी AI (फसल, पशु व सेहत डॉक्टर)</span>
                </div>
                <span class="drawer-tag-pill" style="background:#22c55e; color:#0f172a; font-weight:900;">AI 🔬</span>
              </a>
              <a href="/webinar.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-video"></i></div>
                  <span>लाइव ज़ूम वेबिनार (Live Webinar)</span>
                </div>
                <span class="drawer-tag-pill">ज़ूम</span>
              </a>
              <a href="javascript:void(0)" onclick="window.location.href=window.getPersonalizedWhatsAppUrl('24x7 AI Expert Consultation'); window.closeUniversalDrawer();" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-brands fa-whatsapp"></i></div>
                  <span>24×7 WhatsApp AI एक्सपर्ट परामर्श</span>
                </div>
                <span class="drawer-tag-pill">24×7</span>
              </a>
            </div>

            <!-- 5. LIVE WEBINAR (Main Menu Direct Button) -->
            <a href="/webinar.html" class="drawer-nav-item-btn ${currentPath.includes('webinar') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#dc2626;"><i class="fa-solid fa-video"></i></div>
                <span class="drawer-item-title">लाइव वेबिनार (Live Webinar)</span>
              </div>
              <span class="drawer-tag-pill" style="background:#dc2626;">LIVE 🔴</span>
            </a>

            <!-- 6. AAROGYAM TUBE (Main Menu Direct Button) -->
            <a href="/tube.html" class="drawer-nav-item-btn ${currentPath.includes('tube') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#ef4444;"><i class="fa-brands fa-youtube"></i></div>
                <span class="drawer-item-title">आरोग्यम ट्यूब (AarogyamTube)</span>
              </div>
              <span class="drawer-tag-pill" style="background:#dc2626;">HD 🎬</span>
            </a>

            <!-- 6. PROFILE & ACCOUNT (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-profile" onclick="window.toggleDrawerAccordion('profile', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box"><i class="fa-solid fa-user-gear"></i></div>
                <span class="drawer-item-title">प्रोफाइल व खाता (Profile)</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-profile">
              <a href="/purchases.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                  <span>मेरी खरीद व टैक्स इनवॉइस</span>
                </div>
                <span class="drawer-tag-pill">बिल 🧾</span>
              </a>
              <a href="/subscription.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-crown"></i></div>
                  <span>VIP पास सदस्यता (₹99)</span>
                </div>
                <span class="drawer-tag-pill">VIP</span>
              </a>
              <a href="/pages/smart-etailer.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-wallet"></i></div>
                  <span>स्मार्ट ई-टेलर खाता (₹8.19L)</span>
                </div>
                <span class="drawer-tag-pill">HOT 🔥</span>
              </a>
              <a href="/ucas/index.html" class="drawer-sub-link-item">
                <div class="drawer-item-left">
                  <div class="drawer-sub-icon-box"><i class="fa-solid fa-sliders"></i></div>
                  <span>UCAS प्रोफाइल डैशबोर्ड</span>
                </div>
              </a>
            </div>

            <!-- 7. SUPPORT & POLICIES (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-support" onclick="window.toggleDrawerAccordion('support', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box"><i class="fa-solid fa-headset"></i></div>
                <span class="drawer-item-title">सहायता व नीतियां (Support)</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-support">
              <a href="/faq.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-circle-question"></i></div><span>अक्सर पूछे जाने वाले सवाल (FAQ)</span></div>
              </a>
              <a href="/terms.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-file-contract"></i></div><span>नियम व शर्तें (Terms & Conditions)</span></div>
              </a>
              <a href="/privacy-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-shield-halved"></i></div><span>गोपनीयता नीति (Privacy Policy)</span></div>
              </a>
              <a href="/shipping-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-truck"></i></div><span>शिपिंग व डिलीवरी नीति</span></div>
              </a>
              <a href="/refund-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-rotate-left"></i></div><span>रिफंड नीति (Refund Policy)</span></div>
              </a>
              <a href="/contact.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-phone-volume"></i></div><span>संपर्क सूत्र (Contact Us)</span></div>
              </a>
            </div>

          </div>

        </div>
      </div>

      <!-- Sticky Floating Actions Container on Page (Fixed Right Corner - Strictly Icon-Only) -->
      <div class="sticky-float-widget-container" id="universal-sticky-float-widget">
        <!-- 1. Red Sticky Install App Button (Only in Browser mode; auto-hidden if opened in installed standalone app) -->
        <button type="button" onclick="window.triggerPwaInstall()" class="sticky-float-pill sticky-float-install-pill" id="universal-sticky-pwa-install-btn" title="ऐप इंस्टॉल करें (Install App)" aria-label="Install App" style="width:42px; height:42px; min-width:42px; max-width:42px; border-radius:50%; padding:0; ${isInstalled ? 'display:none !important;' : 'display:inline-flex;'}; align-items:center; justify-content:center;">
          <i class="fa-solid fa-mobile-screen-button"></i>
        </button>

        <!-- 2. Purple Audio Greeting Button -->
        <button type="button" onclick="if(window.togglePageAudioGreeting){window.togglePageAudioGreeting();}else if(window.playPageAudioGreeting){window.playPageAudioGreeting();}" class="sticky-float-pill sticky-float-audio-pill" id="universal-sticky-audio-btn" title="पेज ऑडियो सुनें" aria-label="Audio" style="width:42px; height:42px; min-width:42px; max-width:42px; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center;">
          <i class="fa-solid fa-volume-high"></i>
        </button>

        <!-- 3. Blue Share Referral Button -->
        <button type="button" onclick="if(window.triggerUniversalPageShare){window.triggerUniversalPageShare();}else if(window.triggerUniversalShare){window.triggerUniversalShare();}else{window.triggerViralPageShare();}" class="sticky-float-pill sticky-float-share-pill" id="universal-sticky-share-btn" title="शेयर करें (Share)" aria-label="Share" style="width:42px; height:42px; min-width:42px; max-width:42px; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center;">
          <i class="fa-solid fa-share-nodes"></i>
        </button>

        <!-- 4. Green AI Expert Consultation Button -->
        <a href="javascript:void(0)" onclick="if(window.consultAiExpert){window.consultAiExpert('AI एक्सपर्ट परामर्श');}else{window.location.href=window.getPersonalizedWhatsAppUrl('AI एक्सपर्ट परामर्श');}" class="sticky-float-pill sticky-float-ai-pill" id="universal-sticky-ai-btn" title="WhatsApp AI एक्सपर्ट" aria-label="AI Expert" style="width:42px; height:42px; min-width:42px; max-width:42px; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center;">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
      </div>

      <!-- Universal Sticky Mobile Bottom Navigation Bar (Mobile & Tablet) -->
      <nav class="universal-mobile-bottom-nav" id="universal-mobile-bottom-nav">
        <!-- 1. Home -->
        <a href="/index.html" class="u-nav-tab ${(currentPath === '/' || currentPath.endsWith('index.html')) && !currentPath.includes('ucas') && !currentPath.includes('smart-etailer') && !currentPath.includes('tube') && !currentPath.includes('netsurf') && !currentPath.includes('health') && !currentPath.includes('pashu') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-house"></i></div>
          <span>Home</span>
        </a>
        <!-- 2. AarogyamTube (RED ICON) -->
        <a href="/tube.html" class="u-nav-tab ${currentPath.includes('tube') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-brands fa-youtube" style="color:#ef4444;font-size:1.15rem;"></i></div>
          <span style="color:#ef4444;font-weight:800;">Tube</span>
        </a>
        <!-- 3. My Library -->
        <a href="/ebooks/my-library.html" class="u-nav-tab ${currentPath.includes('my-library') || (currentPath.includes('ebook') && !currentPath.includes('smart-etailer')) ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-book-bookmark"></i></div>
          <span>Library</span>
        </a>
        <!-- 4. Netsurf All Products Catalog -->
        <a href="/categories/netsurf-products.html" class="u-nav-tab ${currentPath.includes('netsurf-products') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-boxes-stacked" style="color:#10b981;"></i></div>
          <span style="color:#10b981;font-weight:800;">कैटलॉग</span>
        </a>
        <!-- 4.1 Netsurf Career -->
        <a href="/categories/netsurf.html" class="u-nav-tab ${currentPath.includes('netsurf') && !currentPath.includes('netsurf-products') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-briefcase" style="color:#059669;"></i></div>
          <span style="color:#059669;font-weight:800;">Netsurf</span>
        </a>
        <!-- 5. Health -->
        <a href="/categories/health.html" class="u-nav-tab ${currentPath.includes('health') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-heart-pulse" style="color:#ec4899;"></i></div>
          <span style="color:#ec4899;font-weight:800;">Health</span>
        </a>
        <!-- 6. Pashupalan -->
        <a href="/pashu-palan.html" class="u-nav-tab ${currentPath.includes('pashu') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-cow" style="color:#0284c7;"></i></div>
          <span style="color:#0284c7;font-weight:800;">पशु पालन</span>
        </a>
        <!-- 7. eTailer -->
        <a href="/pages/smart-etailer.html" class="u-nav-tab ${currentPath.includes('smart-etailer') || currentPath.includes('marketing') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-crown" style="color:#10b981;"></i></div>
          <span style="color:#10b981;font-weight:800;">eTailer</span>
        </a>
        <!-- 8. Profile -->
        <a href="/ucas/index.html" class="u-nav-tab ${(currentPath.includes('ucas') || currentPath.includes('profile')) && !currentPath.includes('smart-etailer') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-user" style="color:#3b82f6;"></i></div>
          <span>Profile</span>
        </a>
        <!-- 9. Drawer / Menu Trigger -->
        <button type="button" onclick="window.openUniversalDrawer(event)" class="u-nav-tab" style="cursor:pointer;" title="सभी मेनू व सेवाएं खोलें">
          <div class="u-icon-wrap"><i class="fa-solid fa-bars" style="color:#8b5cf6;"></i></div>
          <span style="color:#8b5cf6;font-weight:800;">Drawer</span>
        </button>
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
    if (window.USER_NOTIFICATIONS && typeof window.USER_NOTIFICATIONS.updateBadgeCount === 'function') {
      window.USER_NOTIFICATIONS.updateBadgeCount();
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
    if (window.V1_SESSION && typeof window.V1_SESSION.logout === 'function') {
      window.V1_SESSION.logout();
      return;
    }
    localStorage.removeItem('AI_USER');
    localStorage.removeItem('AI_PROFILE');
    localStorage.removeItem('AI_SESSION');
    localStorage.removeItem('AI_LOGIN_STATUS');
    localStorage.removeItem('AI_PURCHASES');
    localStorage.removeItem('purchases');
    localStorage.removeItem('user_purchases');
    localStorage.removeItem('aim_purchases');
    localStorage.removeItem('UCAS_USER');
    localStorage.removeItem('aim_user_name');
    localStorage.removeItem('aim_user_mobile');
    localStorage.removeItem('aarogyam_user_registered');
    localStorage.removeItem('aarogyam_user_phone');
    localStorage.removeItem('aarogyam_user_name');
    localStorage.removeItem('aoi_user_session');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('aarogyam_user');
    localStorage.removeItem('CURRENT_USER');
    localStorage.removeItem('wb_registered');
    try { sessionStorage.clear(); } catch(e) {}
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

  // Universal Auto-Loader & Direct FAB Injector for Aarogyam Sakhi AI Omni-Domain Engine
  function injectSakhiPillDirectly() {
    if (document.getElementById('sakhiFloatingPill')) return;
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('aarogyam-sakhi.html')) return;

    let pillLabel = 'आरोग्यम सखी AI';
    if (path.includes('hair') || path.includes('skin') || path.includes('beauty')) {
      pillLabel = 'सौंदर्य सखी AI';
    } else if (path.includes('pashu') || path.includes('dairy')) {
      pillLabel = 'पशु सखी AI';
    } else if (path.includes('health') || path.includes('diabetes') || path.includes('joint') || path.includes('thyroid')) {
      pillLabel = 'स्वास्थ्य सखी AI';
    }

    const pill = document.createElement('div');
    pill.id = 'sakhiFloatingPill';
    pill.className = 'sakhi-floating-pill';
    pill.setAttribute('role', 'button');
    pill.setAttribute('aria-label', pillLabel);
    pill.innerHTML = `
      <div class="sakhi-pill-avatar-wrap">
        <img src="/images/sakhi/aarogyam-sakhi.webp" alt="Aarogyam Sakhi" onerror="this.src='/images/logo/fevicon.png'" />
      </div>
      <span class="sakhi-pill-label">${pillLabel}</span>
      <span class="sakhi-pill-live-dot"></span>
    `;

    pill.onclick = function(e) {
      if (e) e.preventDefault();
      if (window.AarogyamSakhi && typeof window.AarogyamSakhi.open === 'function') {
        try {
          window.AarogyamSakhi.open();
          return;
        } catch(err) {
          console.warn('[Sakhi FAB] modal error, navigating to dedicated page:', err);
          window.location.href = '/aarogyam-sakhi.html';
          return;
        }
      }
      ensureAarogyamSakhiLoaded();
      let retries = 0;
      const checkInterval = setInterval(() => {
        retries++;
        if (window.AarogyamSakhi && typeof window.AarogyamSakhi.open === 'function') {
          clearInterval(checkInterval);
          try {
            window.AarogyamSakhi.open();
          } catch(err) {
            window.location.href = '/aarogyam-sakhi.html';
          }
        } else if (retries > 12) {
          clearInterval(checkInterval);
          window.location.href = '/aarogyam-sakhi.html';
        }
      }, 50);
    };

    if (document.body) {
      document.body.appendChild(pill);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(pill));
    }

    // 5-SECOND SMART AUTO-COLLAPSE (CUT TEXT, KEEP AVATAR COIN)
    let collapseTimer = setTimeout(() => {
      if (pill) pill.classList.add('collapsed');
    }, 5000);

    pill.addEventListener('mouseenter', () => {
      clearTimeout(collapseTimer);
      pill.classList.remove('collapsed');
    });

    pill.addEventListener('mouseleave', () => {
      collapseTimer = setTimeout(() => {
        if (pill) pill.classList.add('collapsed');
      }, 3000);
    });
  }

  function ensureAarogyamSakhiLoaded() {
    if (!document.querySelector('link[href*="aarogyam-sakhi-ai.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/css/aarogyam-sakhi-ai.css?v=20261015_v120';
      document.head.appendChild(link);
    }
    if (!window.AarogyamSakhi && !document.querySelector('script[src*="aarogyam-sakhi-ai.js"]')) {
      const script = document.createElement('script');
      script.src = '/js/aarogyam-sakhi-ai.js?v=20261015_v120';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  function initUniversalDrawerAndSakhi() {
    injectUniversalSideDrawer();
    checkPwaInstallState();
    ensureAarogyamSakhiLoaded();
    injectSakhiPillDirectly();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalDrawerAndSakhi);
  } else {
    initUniversalDrawerAndSakhi();
  }
  window.addEventListener('load', () => {
    checkPwaInstallState();
    injectSakhiPillDirectly();
  });
})();
