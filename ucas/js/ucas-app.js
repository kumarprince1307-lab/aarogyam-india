/* ==========================================================================
   UCAS APPLICATION CONTROLLER
   Main router, view switcher, auth verification, drawer and KPI coordinator.
   ========================================================================== */

(function (window) {
  'use strict';

  let currentView = 'profile';

  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  async function initApp() {
    bindNavigationEvents();
    bindGlobalModalEvents();

    // Check Authentication
    const loggedIn = window.UCAS_SESSION.isLoggedIn();
    if (!loggedIn) {
      showAuthGate();
      return;
    }

    showAuthenticatedApp();
    await loadUserProfileAndPermissions();

    // Initialize sub-modules
    if (window.UCAS_SURVEY) window.UCAS_SURVEY.init();
    if (window.UCAS_PHONEBOOK) window.UCAS_PHONEBOOK.init();
    if (window.UCAS_LEADS) window.UCAS_LEADS.init();
    if (window.UCAS_MARKETING) window.UCAS_MARKETING.init();
    if (window.UCAS_LANDING_BUILDER) window.UCAS_LANDING_BUILDER.init();
    if (window.UCAS_PRODUCT_LANDING) window.UCAS_PRODUCT_LANDING.init();
    if (window.UCAS_HOOK_TEMPLATES) window.UCAS_HOOK_TEMPLATES.init();
    if (window.UCAS_WEBINARS) window.UCAS_WEBINARS.init();
    if (window.UCAS_ADMIN) window.UCAS_ADMIN.init();

    // Check URL parameters for direct view switching
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTab = urlParams.get('tab');
    if (requestedTab) {
      switchView(requestedTab);
    } else {
      switchView('profile');
    }

    await refreshDashboardKPIs();
  }

  // ==========================================
  // AUTH STATES (BEFORE LOGIN vs AFTER LOGIN)
  // ==========================================

  function showAuthGate() {
    const authGate = document.getElementById('ucas-auth-gate');
    const authApp = document.getElementById('ucas-app-authenticated');
    if (authGate) authGate.style.display = 'flex';
    if (authApp) authApp.style.display = 'none';

    // Bind Auth Gate Login Form
    const gateForm = document.getElementById('ucas-gate-login-form');
    gateForm?.addEventListener('submit', handleGateLoginSubmit);
  }

  function showAuthenticatedApp() {
    const authGate = document.getElementById('ucas-auth-gate');
    const authApp = document.getElementById('ucas-app-authenticated');
    if (authGate) authGate.style.display = 'none';
    if (authApp) authApp.style.display = 'flex';
  }

  async function handleGateLoginSubmit(e) {
    if (e) e.preventDefault();

    const mobileInput = document.getElementById('ucas-gate-mobile');
    const mobile = (mobileInput?.value || '').trim();

    if (!mobile || mobile.length !== 10) {
      showToast('कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।', 'error');
      return;
    }

    const submitBtn = document.getElementById('ucas-gate-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> लॉगिन हो रहा है...';
    }

    const res = await window.UCAS_SESSION.loginWithMobile(mobile);

    if (res.success) {
      showToast('✅ लॉगिन सफल! UCAS में आपका स्वागत है।', 'success');
      showAuthenticatedApp();
      window.location.reload();
    } else {
      showToast(res.message || 'लॉगिन विफल।', 'error');
      const msgEl = document.getElementById('ucas-gate-login-msg');
      if (msgEl) {
        if (res.notFound) {
          msgEl.innerHTML = `<span style="color:var(--danger);">यह नंबर पंजीकृत नहीं है। <a href="/registration.html" style="color:var(--primary);font-weight:bold;text-decoration:underline;">यहाँ नया अकाउंट बनाएं</a></span>`;
        } else {
          msgEl.innerHTML = `<span style="color:var(--danger);">${res.message}</span>`;
        }
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> लॉगिन करें (Login)';
    }
  }

  // ==========================================
  // NAVIGATION & TAB SWITCHING
  // ==========================================

  function bindNavigationEvents() {
    // Desktop Sidebar Nav Items
    document.querySelectorAll('.ucas-sidebar .ucas-nav-item button, .ucas-sidebar .ucas-nav-item a').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.dataset.tab;
        if (tab) {
          e.preventDefault();
          if (tab === 'library') {
            window.location.href = '/ebooks/my-library.html';
            return;
          }
          switchView(tab);
        }
      });
    });

    // Mobile Bottom Tabs
    document.querySelectorAll('.ucas-bottom-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', (e) => {
        const tab = tabBtn.dataset.tab;
        if (tab) {
          e.preventDefault();
          if (tab === 'library') {
            window.location.href = '/ebooks/my-library.html';
            return;
          }
          switchView(tab);
        }
      });
    });
  }

  function switchView(viewName) {
    if (viewName === 'library') {
      window.location.href = '/ebooks/my-library.html';
      return;
    }

    if (viewName === 'admin' && !window.UCAS_PERMISSIONS.isAdmin()) {
      showToast('आपको एडमिन पैनल देखने की अनुमति नहीं है।', 'error');
      return;
    }

    currentView = viewName;

    // Update active view DOM
    document.querySelectorAll('.ucas-view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update Desktop Nav Active Class
    document.querySelectorAll('.ucas-sidebar .ucas-nav-item').forEach(item => {
      const btn = item.querySelector('button, a');
      if (btn && btn.dataset.tab === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update User Drawer Nav Active Class
    document.querySelectorAll('.ucas-drawer .ucas-nav-item').forEach(item => {
      const btn = item.querySelector('button, a');
      if (btn && btn.dataset.tab === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Mobile Bottom Nav Active Class
    document.querySelectorAll('.ucas-bottom-tab').forEach(tab => {
      if (tab.dataset.tab === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // View specific refresh hooks
    if (viewName === 'profile') refreshDashboardKPIs();
    if (viewName === 'survey' && window.UCAS_SURVEY) window.UCAS_SURVEY.loadSurveys();
    if (viewName === 'phonebook' && window.UCAS_PHONEBOOK) window.UCAS_PHONEBOOK.loadPhonebook();
    if (viewName === 'leads' && window.UCAS_LEADS && typeof window.UCAS_LEADS.loadLeads === 'function') {
      window.UCAS_LEADS.loadLeads();
    }
    if (viewName === 'product-landing' && window.UCAS_PRODUCT_LANDING && typeof window.UCAS_PRODUCT_LANDING.loadProductLandingPages === 'function') {
      window.UCAS_PRODUCT_LANDING.loadProductLandingPages();
    }
    if (viewName === 'hook-templates' && window.UCAS_HOOK_TEMPLATES && typeof window.UCAS_HOOK_TEMPLATES.filterTemplates === 'function') {
      window.UCAS_HOOK_TEMPLATES.filterTemplates('all');
    }
    if (viewName === 'broadcast-messages') {
      renderBroadcastView();
    }
    if (viewName === 'webinars' && window.UCAS_WEBINARS && typeof window.UCAS_WEBINARS.loadWebinars === 'function') {
      window.UCAS_WEBINARS.loadWebinars();
    }
    if (viewName === 'permissions' && window.UCAS_PERMISSIONS && typeof window.UCAS_PERMISSIONS.renderPermissionsTable === 'function') {
      window.UCAS_PERMISSIONS.renderPermissionsTable();
    }
    if (viewName === 'marketing') {
      if (window.UCAS_LANDING_BUILDER && typeof window.UCAS_LANDING_BUILDER.loadMyLandingPages === 'function') {
        window.UCAS_LANDING_BUILDER.loadMyLandingPages();
      }
      if (window.UCAS_MARKETING && typeof window.UCAS_MARKETING.refreshLandingPages === 'function') {
        window.UCAS_MARKETING.refreshLandingPages();
      }
      if (window.UCAS_MARKETING && typeof window.UCAS_MARKETING.updateMarketingEngine === 'function') {
        window.UCAS_MARKETING.updateMarketingEngine();
      }
    }
    if (viewName === 'admin' && window.UCAS_ADMIN) window.UCAS_ADMIN.loadAdminData();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // SLIDE-OUT USER MENU DRAWER
  // ==========================================

  function openUserDrawer() {
    const overlay = document.getElementById('ucas-drawer-overlay');
    const drawer = document.getElementById('ucas-user-drawer');
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
  }

  function closeUserDrawer() {
    const overlay = document.getElementById('ucas-drawer-overlay');
    const drawer = document.getElementById('ucas-user-drawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
  }

  function toggleUserDrawer() {
    const drawer = document.getElementById('ucas-user-drawer');
    if (drawer && drawer.classList.contains('active')) {
      closeUserDrawer();
    } else {
      openUserDrawer();
    }
  }

  // ==========================================
  // USER PROFILE, SUBSCRIPTION TIMER & PROGRESS
  // ==========================================

  async function loadUserProfileAndPermissions() {
    let user = window.UCAS_SESSION.getCurrentUser();
    if (!user) return;
    const db = window.UCAS_DB?.getDb();

    if (db) {
      try {
        const mob = user.mobile;
        const sid = user.share_id || user.referral_code;
        const uid = user.id;

        if (mob || sid || uid) {
          let query = db.from('profiles').select('id, full_name, mobile, email, gender, State, district, address, occupation, interest, dob, netsurf_id, share_id, referral_code, is_active, role, created_at');
          if (mob) query = query.eq('mobile', mob);
          else if (sid) query = query.eq('share_id', sid);
          else if (uid) query = query.eq('id', uid);

          const { data: dbProfile } = await query.maybeSingle();
          if (dbProfile) {
            user = { ...user, ...dbProfile };
            window.UCAS_SESSION.saveUser(user);
          }
        }
      } catch (e) {
        console.warn('Profile sync notice:', e);
      }
    }

    const name = user.full_name || user.name || 'Aarogyam Member';
    const mobile = user.mobile || '';
    const shareId = user.share_id || window.UCAS_SESSION.getShareId() || 'AI000004';
    const netsurfId = user.netsurf_id || '';

    // Populate Header Elements
    const nameEls = document.querySelectorAll('.ucas-user-name');
    const shareEls = document.querySelectorAll('.ucas-user-shareid');
    const avatarEls = document.querySelectorAll('.ucas-user-avatar');

    nameEls.forEach(el => el.textContent = name);
    shareEls.forEach(el => el.textContent = `ID: ${shareId}`);
    avatarEls.forEach(el => el.textContent = name.charAt(0).toUpperCase());

    // Populate Hero Section
    const heroName = document.getElementById('ucas-hero-user-name');
    const heroShareId = document.getElementById('ucas-hero-share-id');
    const heroMobile = document.getElementById('ucas-hero-mobile');
    const heroNetsurfPill = document.getElementById('ucas-hero-netsurf-pill');
    const heroNetsurfId = document.getElementById('ucas-hero-netsurf-id');
    const drawerPhone = document.getElementById('ucas-drawer-user-phone');

    if (heroName) heroName.textContent = name;
    if (heroShareId) heroShareId.textContent = shareId;
    if (heroMobile) heroMobile.textContent = mobile;
    if (drawerPhone) drawerPhone.textContent = mobile ? `+91 ${mobile}` : '+91 ----------';

    if (netsurfId && heroNetsurfPill && heroNetsurfId) {
      heroNetsurfPill.style.display = 'inline-flex';
      heroNetsurfId.textContent = netsurfId;
    } else if (heroNetsurfPill) {
      heroNetsurfPill.style.display = 'none';
    }

    // 🟢 Active / Inactive Status & 365-Day Subscription Timer
    updateUcasSubscriptionState(user);

    // 🪙 Aarogyam Wallet & Share Rewards (90-Day Timer & Zero Egress)
    updateUcasWalletCard(user);

    // 📊 Profile Completion Progress Calculation
    calculateUcasProfileProgress(user);

    // 📊 Activity Stats Overview (Merged from profile.html)
    try {
      const purchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
      const booksEl = document.getElementById('profile-stat-books');
      if (booksEl) {
        booksEl.textContent = Array.isArray(purchases) && purchases.length > 0 ? purchases.length : 2;
      }
      const wishlist = JSON.parse(localStorage.getItem('user_wishlist') || '[]');
      const wishEl = document.getElementById('profile-stat-wishlist');
      if (wishEl) {
        wishEl.textContent = Array.isArray(wishlist) ? wishlist.length : 0;
      }
    } catch (e) {}

    // Load User Permissions
    await window.UCAS_PERMISSIONS.loadUserPermissions(user.id);

    // Show/Hide Admin Nav Items in Sidebar and Drawer
    const adminNavItems = document.querySelectorAll('.ucas-nav-admin-only');
    if (window.UCAS_PERMISSIONS.isAdmin()) {
      adminNavItems.forEach(el => el.style.display = 'block');
    } else {
      adminNavItems.forEach(el => el.style.display = 'none');
    }
  }

  function checkIsUserActive(user) {
    if (!user) user = (window.UCAS_SESSION && window.UCAS_SESSION.getCurrentUser()) || (window.AarogyamWallet && window.AarogyamWallet.getCurrentUser()) || {};

    // 1. Direct user properties
    if (user.is_active === true || user.is_active === 'true' || user.is_active === 1) return true;
    if (user.is_subscriber === true || user.is_subscriber === 'true' || user.is_subscriber === 1) return true;
    if (user.status === 'active' || user.subscription_status === 'active') return true;
    if (user.has_active_pass || user.vip_pass) return true;

    // 2. Master sponsor AI000004 or Admin Phone is always active
    const sid = String(user.share_id || user.referral_code || '').toUpperCase();
    if (sid === 'AI000004' || String(user.mobile || '') === '7974422572') return true;

    // 3. LocalStorage flags
    if (localStorage.getItem('user_is_active') === 'true') return true;
    if (localStorage.getItem('is_active') === 'true') return true;
    if (localStorage.getItem('user_is_subscriber') === 'true') return true;

    // 4. Purchases array or total purchase amounts
    if (Array.isArray(user.purchases) && user.purchases.length > 0) return true;
    if (Number(user.totalPurchasedAmount) > 0) return true;
    if (Number(user.spent_total) > 0 || Number(user.self_spent_total) > 0) return true;

    // 5. Wallet engine state check
    try {
      if (window.AarogyamWallet && typeof window.AarogyamWallet.getState === 'function') {
        const ws = window.AarogyamWallet.getState();
        if (ws && (Number(ws.self_spent_total) > 0 || Number(ws.earned_self) > 0 || Number(ws.balance) > 0)) return true;
      }
      const rawWs = localStorage.getItem('aarogyam_wallet_state');
      if (rawWs) {
        const parsedWs = JSON.parse(rawWs);
        if (Number(parsedWs.self_spent_total) > 0 || Number(parsedWs.earned_self) > 0 || Number(parsedWs.balance) > 0) return true;
      }
    } catch (e) {}

    // 6. LocalStorage purchases lists (AI_PURCHASES / purchases)
    try {
      const aiPur = JSON.parse(localStorage.getItem('AI_PURCHASES') || '[]');
      if (Array.isArray(aiPur) && aiPur.length > 0) return true;
      const pur = JSON.parse(localStorage.getItem('purchases') || '[]');
      if (Array.isArray(pur) && pur.length > 0) return true;
    } catch (e) {}

    // 7. Stored user objects in other keys
    try {
      const u1 = JSON.parse(localStorage.getItem('aarogyam_user') || '{}');
      if (u1.is_active || u1.is_subscriber || u1.status === 'active' || (Array.isArray(u1.purchases) && u1.purchases.length > 0)) return true;
      const u2 = JSON.parse(localStorage.getItem('user') || '{}');
      if (u2.is_active || u2.is_subscriber || u2.status === 'active' || (Array.isArray(u2.purchases) && u2.purchases.length > 0)) return true;
      const u3 = JSON.parse(localStorage.getItem('AI_USER') || '{}');
      if (u3.is_active || u3.is_subscriber || u3.status === 'active' || (Array.isArray(u3.purchases) && u3.purchases.length > 0)) return true;
    } catch (e) {}

    return false;
  }

  function recordLocalPageShare(pageUrl, shareId) {
    try {
      const cleanPage = '/' + String(pageUrl).replace(/^https?:\/\/[^\/]+/, '').replace(/^\//, '');
      const list = JSON.parse(localStorage.getItem('AOI_SHARE_TELEMETRY') || '[]');
      list.push({
        page: cleanPage,
        url: cleanPage,
        share_id: shareId,
        event_type: 'share',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('AOI_SHARE_TELEMETRY', JSON.stringify(list));

      if (window.dbClient || window.supabase) {
        const client = window.dbClient || window.supabase;
        if (typeof client.from === 'function') {
          client.from('share_logs').insert([{
            share_token: shareId,
            event_type: 'share',
            page: cleanPage,
            url: window.location.origin + cleanPage,
            created_at: new Date().toISOString()
          }]).then(() => {}).catch(() => {});
        }
      }

      // Live update dashboard KPIs
      setTimeout(() => {
        refreshDashboardKPIs('', '', true);
      }, 400);
    } catch(e) {
      console.warn('recordLocalPageShare note:', e);
    }
  }

  function updateUcasSubscriptionState(user) {
    const isActive = checkIsUserActive(user);
    const badgeEl = document.getElementById('ucas-user-status-badge');
    const badgeText = document.getElementById('ucas-user-status-text');
    const activeCard = document.getElementById('ucas-active-subscription-card');
    const inactiveBanner = document.getElementById('ucas-inactive-subscription-banner');

    if (badgeEl && badgeText) {
      if (isActive) {
        badgeEl.style.background = 'rgba(16,185,129,0.2)';
        badgeEl.style.color = '#fff';
        badgeEl.style.borderColor = 'rgba(16,185,129,0.5)';
        badgeText.textContent = '🟢 Active VIP Subscriber';
      } else {
        badgeEl.style.background = 'rgba(239,68,68,0.2)';
        badgeEl.style.color = '#fff';
        badgeEl.style.borderColor = 'rgba(239,68,68,0.4)';
        badgeText.textContent = '🔴 Inactive / Free Member';
      }
    }

    if (isActive) {
      if (activeCard) activeCard.style.display = 'block';
      if (inactiveBanner) inactiveBanner.style.display = 'none';

      // 365-Day Timer Calculation
      const regDateStr = user.created_at || user.subscribed_at || new Date().toISOString();
      const startDate = new Date(regDateStr);
      const endDate = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
      const now = new Date();

      const diffTime = endDate - now;
      const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const subStartDateEl = document.getElementById('ucas-sub-start-date');
      const subEndDateEl = document.getElementById('ucas-sub-end-date');
      const daysBadge = document.getElementById('ucas-sub-days-badge');

      if (subStartDateEl) subStartDateEl.textContent = startDate.toLocaleDateString('hi-IN');
      if (subEndDateEl) subEndDateEl.textContent = endDate.toLocaleDateString('hi-IN');
      if (daysBadge) daysBadge.textContent = `⏳ ${daysLeft} दिन शेष`;
    } else {
      if (activeCard) activeCard.style.display = 'none';
      if (inactiveBanner) inactiveBanner.style.display = 'block';
    }
  }

  let _isUpdatingWalletCard = false;

  function updateUcasWalletCard(user) {
    if (!window.AarogyamWallet || _isUpdatingWalletCard) return;
    _isUpdatingWalletCard = true;
    try {
      const w = window.AarogyamWallet;
      if (!w.state) {
        w.init();
      }
      const state = w.state || {};

      const balEl = document.getElementById('ucas-wallet-balance');
      const selfEl = document.getElementById('ucas-wallet-self');
      const refEl = document.getElementById('ucas-wallet-ref');
      const refCountEl = document.getElementById('ucas-wallet-ref-count');
      const spentEl = document.getElementById('ucas-wallet-spent');

      if (balEl) balEl.textContent = state.balance || 0;
      if (selfEl) selfEl.textContent = state.earned_self || 0;
      if (refEl) refEl.textContent = state.earned_referral || 0;
      if (refCountEl) refCountEl.textContent = state.referred_buyers_count || 0;
      if (spentEl) spentEl.textContent = state.total_spent || 0;

      // Start live 90-day countdown timer
      if (typeof w.startCountdownUI === 'function') {
        w.startCountdownUI('ucas-wallet-timer');
      }

      // Trigger background sync with Supabase (without blocking or re-triggering init)
      if (typeof w.refreshFromRemoteAsync === 'function') {
        w.refreshFromRemoteAsync();
      }

      // Check if expiry warning popup needed
      setTimeout(() => {
        if (typeof w.showExpiryWarningModalIfNeeded === 'function') {
          w.showExpiryWarningModalIfNeeded();
        }
      }, 1500);
    } catch (e) {
      console.warn("UCAS Wallet card update error:", e);
    } finally {
      _isUpdatingWalletCard = false;
    }
  }

  window.shareUcasReferralLink = function() {
    const user = (window.AarogyamWallet && window.AarogyamWallet.getCurrentUser()) || (window.UCAS_SESSION && window.UCAS_SESSION.getCurrentUser()) || {};
    const sid = user.share_id || user.mobile || 'AI000004';
    const shareUrl = `https://aarogyamindia.online/?ref=${encodeURIComponent(sid)}`;
    const msg = `🌾 *नमस्ते किसान भाई!* 🙏\n\nआरोग्यम इंडिया पर कृषि व पशुपालन की सभी ई-बुक्स, फसल डॉक्टर AI और खाद-दवा डायरेक्टरी उपलब्ध हैं।\n\n👉 *नीचे दिए गए विशेष लिंक से जुड़ें और 20% तक की छूट का लाभ उठाएं:*\n${shareUrl}\n\nधन्यवाद!\n_आरोग्यम इंडिया_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  window.shareTubeVideoLink = function() {
    const user = (window.AarogyamWallet && window.AarogyamWallet.getCurrentUser()) || (window.UCAS_SESSION && window.UCAS_SESSION.getCurrentUser()) || {};
    const sid = user.share_id || user.mobile || 'AI000004';
    const shareUrl = `https://aarogyamindia.online/tube.html?ref=${encodeURIComponent(sid)}`;

    // 🎥 Real-time share telemetry record
    recordLocalPageShare('/tube.html', sid);

    const msg = `📺 *नमस्ते किसान भाई!* 🙏\n\nआरोग्यम इंडिया पर कृषि, पशुपालन, बागवानी और जैविक खेती के बेहतरीन वीडियो और रील्स उपलब्ध हैं।\n\n👉 *नीचे दिए गए विशेष लिंक से वीडियो देखें और चैनल शेयर करें:*\n${shareUrl}\n\nधन्यवाद!\n_आरोग्यम इंडिया_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  window.copyTubeVideoLink = function() {
    const user = (window.AarogyamWallet && window.AarogyamWallet.getCurrentUser()) || (window.UCAS_SESSION && window.UCAS_SESSION.getCurrentUser()) || {};
    const sid = user.share_id || user.mobile || 'AI000004';
    const shareUrl = `https://aarogyamindia.online/tube.html?ref=${encodeURIComponent(sid)}`;

    // 🎥 Real-time share telemetry record
    recordLocalPageShare('/tube.html', sid);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("✓ AarogyamTube वीडियो लिंक क्लिपबोर्ड में कॉपी हो गया!");
      });
    } else {
      const temp = document.createElement('textarea');
      temp.value = shareUrl;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      alert("✓ AarogyamTube वीडियो लिंक क्लिपबोर्ड में कॉपी हो गया!");
    }
  };

  // Safe Re-render wallet card when updated (Direct DOM update — NO recursive init loop)
  window.addEventListener('aoi:wallet_updated', (e) => {
    if (_isUpdatingWalletCard) return;
    const state = e.detail || (window.AarogyamWallet && window.AarogyamWallet.state) || {};
    const balEl = document.getElementById('ucas-wallet-balance');
    const selfEl = document.getElementById('ucas-wallet-self');
    const refEl = document.getElementById('ucas-wallet-ref');
    const refCountEl = document.getElementById('ucas-wallet-ref-count');
    const spentEl = document.getElementById('ucas-wallet-spent');

    if (balEl && typeof state.balance !== 'undefined') balEl.textContent = state.balance;
    if (selfEl && typeof state.earned_self !== 'undefined') selfEl.textContent = state.earned_self;
    if (refEl && typeof state.earned_referral !== 'undefined') refEl.textContent = state.earned_referral;
    if (refCountEl && typeof state.referred_buyers_count !== 'undefined') refCountEl.textContent = state.referred_buyers_count;
    if (spentEl && typeof state.total_spent !== 'undefined') spentEl.textContent = state.total_spent;
  });

  function calculateUcasProfileProgress(user) {
    let score = 0;
    const isProfileMarkedDone = localStorage.getItem('ai_profile_completed') === 'true';

    if (user.full_name || user.name) score++;
    if (user.mobile) score++;
    if (user.email) score++;
    if (user.gender) score++;
    if (user.state || user.State) score++;
    if (user.dob && String(user.dob).trim()) score++;
    if (user.district || user.city) score++;
    if (user.address) score++;
    if (user.occupation) score++;
    if (user.interest) score++;
    if (user.netsurf_id && String(user.netsurf_id).trim()) score++;

    // If core profile fields are present or marked completed, treat as 100%
    const hasCoreFields = Boolean((user.full_name || user.name) && user.mobile && (user.state || user.State || user.district || user.city));
    let percentage = Math.min(100, Math.round((score / 11) * 100));
    if (isProfileMarkedDone || (hasCoreFields && score >= 4)) {
      percentage = 100;
    }

    const percentText = document.getElementById('ucas-profile-percent-text');
    const progressBar = document.getElementById('ucas-profile-progress-bar');
    const statusHint = document.getElementById('ucas-profile-status-hint');
    const nudgePopup = document.getElementById('profile100NudgePopup');
    const nudgePercent = document.getElementById('nudgePercentText');

    if (percentText) percentText.textContent = `${percentage}%`;
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
      if (percentage === 100) {
        progressBar.style.background = '#10b981';
      } else if (percentage >= 60) {
        progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #10b981)';
      } else {
        progressBar.style.background = '#f59e0b';
      }
    }

    if (statusHint) {
      if (percentage === 100) {
        statusHint.textContent = '🟢 (100% पूर्ण)';
        statusHint.style.color = '#10b981';
      } else {
        statusHint.textContent = `⚠️ (केवल ${percentage}% पूर्ण — अपडेट करें)`;
        statusHint.style.color = '#d97706';
      }
    }

    // Persistent Popup Reminder only if strictly incomplete AND not dismissed
    if (nudgePopup) {
      const isDismissed = sessionStorage.getItem('ai_profile_nudge_dismissed') === 'true' || isProfileMarkedDone;
      if (percentage < 100 && (user.id || user.mobile) && !isDismissed) {
        nudgePopup.style.display = 'block';
        if (nudgePercent) nudgePercent.textContent = `${percentage}%`;
      } else {
        nudgePopup.style.display = 'none';
      }
    }
  }

  // Profile Modal Global Handlers
  window.openLeadModal = function() {
    const user = window.UCAS_SESSION.getCurrentUser() || {};
    const modal = document.getElementById('leadModal');
    if (!modal) return;

    if (document.getElementById('leadName')) document.getElementById('leadName').value = user.full_name || user.name || '';
    if (document.getElementById('leadPhone')) document.getElementById('leadPhone').value = user.mobile || '';
    if (document.getElementById('leadNetsurfId')) document.getElementById('leadNetsurfId').value = user.netsurf_id || '';
    if (document.getElementById('leadEmail')) document.getElementById('leadEmail').value = user.email || '';
    if (document.getElementById('leadGender')) document.getElementById('leadGender').value = user.gender || '';
    if (document.getElementById('leadState')) document.getElementById('leadState').value = user.state || user.State || '';
    if (document.getElementById('leadDob')) document.getElementById('leadDob').value = user.dob || '';
    if (document.getElementById('leadCity')) document.getElementById('leadCity').value = user.city || user.district || '';
    if (document.getElementById('leadOccupation')) document.getElementById('leadOccupation').value = user.occupation || '';
    if (document.getElementById('leadInterest')) document.getElementById('leadInterest').value = user.interest || '';
    if (document.getElementById('leadAddress')) document.getElementById('leadAddress').value = user.address || '';

    modal.style.display = 'flex';
  };

  window.closeLeadModal = function() {
    const modal = document.getElementById('leadModal');
    if (modal) modal.style.display = 'none';
  };

  window.submitLeadForm = async function(event) {
    if (event) event.preventDefault();

    const fullName = document.getElementById('leadName')?.value.trim();
    const mobile = document.getElementById('leadPhone')?.value.trim();
    const netsurfId = document.getElementById('leadNetsurfId')?.value.trim() || null;
    const email = document.getElementById('leadEmail')?.value.trim() || null;
    const gender = document.getElementById('leadGender')?.value || null;
    const state = document.getElementById('leadState')?.value.trim() || null;
    const dob = document.getElementById('leadDob')?.value.trim() || null;
    const city = document.getElementById('leadCity')?.value.trim() || null;
    const occupation = document.getElementById('leadOccupation')?.value.trim() || null;
    const interest = document.getElementById('leadInterest')?.value.trim() || null;
    const address = document.getElementById('leadAddress')?.value.trim() || null;
    const khet = document.getElementById('leadKhet')?.value.trim() ? parseFloat(document.getElementById('leadKhet').value.trim()) : null;
    const pashu = document.getElementById('leadPashu')?.value.trim() || null;

    if (!fullName || !mobile) {
      alert('कृपया नाम और मोबाइल नंबर दर्ज करें।');
      return;
    }

    const user = window.UCAS_SESSION.getCurrentUser() || {};
    if (!user.id) {
      alert('लॉगिन सेशन नहीं मिला।');
      return;
    }

    const profileData = {
      full_name: fullName,
      netsurf_id: netsurfId,
      email: email,
      gender: gender,
      dob: dob,
      State: state,
      district: city,
      address: address,
      occupation: occupation,
      interest: interest,
      khet_acres: khet,
      pashu_details: pashu
    };

    const submitBtn = document.getElementById('leadSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सेव हो रहा है...';
    }

    try {
      const db = window.dbClient || window.supabase;
      if (db) {
        await db.from('profiles').update(profileData).eq('id', user.id);
      }

      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('UCAS_USER', JSON.stringify(updatedUser));
      localStorage.setItem('AI_USER', JSON.stringify(updatedUser));
      localStorage.setItem('ai_profile_completed', 'true');
      sessionStorage.setItem('ai_profile_nudge_dismissed', 'true');
      if (typeof ProfileStorage !== 'undefined') ProfileStorage.save(updatedUser);

      alert('🎉 बधाई हो! आपकी प्रोफाइल (NetSurf ID सहित) सफलतापूर्वक सहेज ली गई है।');
      window.closeLeadModal();
      await loadUserProfileAndPermissions();
    } catch (err) {
      console.error('UCAS Profile update error', err);
      alert('प्रोफाइल सेव करने में समस्या आई।');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '✨ जानकारी सुरक्षित करें (Save Profile)';
      }
    }
  };

  let _isRefreshingKPIs = false;
  let _pendingRefresh = false;

  async function refreshDashboardKPIs(startDate = '', endDate = '', forceRefresh = false) {
    if (_isRefreshingKPIs) {
      _pendingRefresh = true;
      return;
    }
    _isRefreshingKPIs = true;
    _pendingRefresh = false;

    let profileId = window.UCAS_SESSION.getUserId();
    const shareId = window.UCAS_SESSION.getShareId() || 'AI000004';
    const user = window.UCAS_SESSION.getCurrentUser() || {};

    const isUuid = (val) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val).trim()));
    if (!profileId || !isUuid(profileId)) {
      if (user.id && isUuid(user.id)) {
        profileId = user.id;
      } else {
        profileId = '52ef705c-bb45-4137-bee4-a3f8df73b676';
      }
    }

    try {
      const results = await Promise.allSettled([
        window.UCAS_DB.getSurveys(profileId),
        window.UCAS_DB.getPhonebook(profileId),
        window.UCAS_DB.getDirectReferralsWithPurchases(profileId, shareId, startDate, endDate, forceRefresh),
        window.UCAS_DB.getUserShareAnalytics(shareId, profileId, forceRefresh),
        window.UCAS_DB.resolveUplineSponsor(user.referred_by, shareId)
      ]);

      const surveysRes = results[0].status === 'fulfilled' ? results[0].value : { success: false, data: [] };
      const phonebookRes = results[1].status === 'fulfilled' ? results[1].value : { success: false, data: [] };
      const refRes = results[2].status === 'fulfilled' ? results[2].value : { success: false, data: { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0, totalPurchasesCount: 0 } };
      const shareRes = results[3].status === 'fulfilled' ? results[3].value : { success: false, data: { totalShares: 0, totalClicks: 0, pages: [] } };
      const uplineSponsor = results[4].status === 'fulfilled' ? results[4].value : { name: 'श्री अवनीश कुमार मिश्रा', phone: '7974422572', shareId: 'AI000004' };

      const surveys = surveysRes?.data || [];
      const contacts = phonebookRes?.data || [];
      const refData = refRes?.data || { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0, totalPurchasesCount: 0 };
      const shareAnalytics = shareRes?.data || { totalShares: 0, totalClicks: 0, pages: [] };

      const totalSurveys = surveys.length;
      const totalContacts = contacts.length;
      const totalLeads = totalSurveys + totalContacts;

      // 1. Update Core Personal KPI Counter DOM Elements
      animateCounter('kpi_user_total_shares', shareAnalytics.totalShares || 0);
      animateCounter('kpi_user_total_clicks', shareAnalytics.totalClicks || 0);
      animateCounter('kpi_user_total_leads', totalLeads || 0);

      // 6th KPI: AarogyamTube Video Shares & Views (100% REAL dynamic data, no hardcoded baseline)
      const tubePage = (shareAnalytics.pages || []).find(p => p.pageUrl && p.pageUrl.includes('tube'));
      const tubeShares = tubePage ? (Number(tubePage.shares) || 0) : 0;
      const tubeViews = tubePage ? (Number(tubePage.clicks) || 0) : 0;
      const tubeKpiEl = document.getElementById('kpi_tube_shares_views');
      if (tubeKpiEl) {
        tubeKpiEl.innerHTML = `${tubeShares} <span style="font-size:0.8rem;font-weight:700;color:#fca5a5;">शेयर</span> | ${tubeViews} <span style="font-size:0.8rem;font-weight:700;color:#fca5a5;">व्यूज</span>`;
      }

      const isCurrentUserActive = checkIsUserActive(user);
      updateUcasSubscriptionState(user);

      const dirPurEl = document.getElementById('kpi_direct_purchases');
      const dirPurSub = document.getElementById('kpi_direct_purchases_sub');
      const dirRefEl = document.getElementById('kpi_direct_referrals');

      if (!isCurrentUserActive) {
        if (dirRefEl) dirRefEl.innerHTML = `<span style="filter: blur(4px); user-select: none;">8</span> <span style="font-size:0.65rem; background:#fee2e2; color:#dc2626; padding:1px 6px; border-radius:8px; font-weight:800; vertical-align:middle;">🔒 लॉक</span>`;
        if (dirPurEl) dirPurEl.innerHTML = `<span style="filter: blur(4px); user-select: none;">₹1,480</span> <span style="font-size:0.65rem; background:#fee2e2; color:#dc2626; padding:1px 6px; border-radius:8px; font-weight:800; vertical-align:middle;">🔒 लॉक</span>`;
        if (dirPurSub) dirPurSub.textContent = `🔒 अनलॉक करने के लिए ID एक्टिव करें`;
      } else {
        animateCounter('kpi_direct_referrals', refData.totalReferrals || 0);
        if (dirPurEl) dirPurEl.textContent = `₹${refData.totalPurchaseAmount || 0}`;
        if (dirPurSub) dirPurSub.textContent = `${refData.totalPurchasesCount || refData.referrals.filter(r => r.purchaseCount > 0).length} किताबें बिकीं`;
      }

      // 2. Render Granular Page-Wise Link & Share Analytics
      renderPageShareAnalytics(shareAnalytics.pages || [], refData.referrals || [], shareId);

      // 3. Render Pathfinder Viral Auto-Sponsor & Digital Identity Cards
      renderUcasViralSponsorCards(user, shareId, uplineSponsor);

      // 4. Direct Referrals & Purchases Data
      allLoadedReferrals = refData.referrals || [];
      applyReferralsFilter();

      // 5. Render Recent Activity Feed
      renderRecentActivity(surveys, contacts);
    } catch (e) {
      console.warn('Dashboard KPI refresh error', e);
    } finally {
      _isRefreshingKPIs = false;
      if (_pendingRefresh) {
        _pendingRefresh = false;
        setTimeout(() => refreshDashboardKPIs(startDate, endDate), 100);
      }
    }
  }

  function renderPageShareAnalytics(pages, referrals, shareId) {
    const container = document.getElementById('ucas-page-share-list');
    if (!container) return;

    if (!pages || pages.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:1.5rem;color:#64748b;font-size:0.85rem;">
          📢 आपने अभी तक कोई लिंक शेयर नहीं किया है। नीचे दिए गए बटनों से शेयर करना शुरू करें!
        </div>
      `;
      return;
    }

    const pageUserMap = {};
    (referrals || []).forEach(r => {
      const src = String(r.source || r.registration_source || '').toLowerCase();
      pages.forEach(p => {
        const pKey = p.pageUrl.toLowerCase();
        const slug = pKey.split('/').pop().replace('.html', '');
        if (src.includes(slug) || (slug.includes('pathfinder') && src.includes('teamfest'))) {
          if (!pageUserMap[p.pageUrl]) pageUserMap[p.pageUrl] = { members: 0, purchases: 0, books: [] };
          pageUserMap[p.pageUrl].members++;
          if (r.purchaseCount > 0) {
            pageUserMap[p.pageUrl].purchases += r.purchaseCount;
            if (r.purchases && Array.isArray(r.purchases)) {
              r.purchases.forEach(pur => {
                if (pur.book_name && !pageUserMap[p.pageUrl].books.includes(pur.book_name)) {
                  pageUserMap[p.pageUrl].books.push(pur.book_name);
                }
              });
            }
          }
        }
      });
    });

    container.innerHTML = pages.map(p => {
      const matched = pageUserMap[p.pageUrl] || { members: 0, purchases: 0, books: [] };
      const totalMembersJoined = Math.max(p.registrations || 0, matched.members);
      const totalBooksBought = Math.max(p.purchases || 0, matched.purchases);

      let bookTag = '';
      if (matched.books && matched.books.length > 0) {
        bookTag = `<div style="font-size:0.75rem;color:#059669;margin-top:4px;display:flex;align-items:center;gap:4px;flex-wrap:wrap;"><span>🛍️ बिकी किताबें:</span> ${matched.books.map(b => `<span style="background:#ecfdf5;border:1px solid #a7f3d0;padding:1px 6px;border-radius:4px;font-weight:700;">${b}</span>`).join(' ')}</div>`;
      } else if (totalBooksBought > 0) {
        bookTag = `<div style="font-size:0.75rem;color:#059669;margin-top:4px;">🛍️ ${totalBooksBought} किताबें खरीदी गईं</div>`;
      }

      return `
        <div class="ucas-pa-item">
          <div class="ucas-pa-info">
            <div class="ucas-pa-icon"><i class="${p.icon}"></i></div>
            <div>
              <div class="ucas-pa-title">
                <span>${p.title}</span>
                <span class="ucas-pa-badge">${p.badge || 'पेज'}</span>
              </div>
              <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">
                <code>${p.pageUrl}</code>
              </div>
              ${bookTag}
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <div class="ucas-pa-stats">
              <span class="ucas-pa-stat-pill" title="कुल शेयर">🚀 शेयर: <strong>${p.shares}</strong></span>
              <span class="ucas-pa-stat-pill" title="कुल लिंक क्लिक्स" style="border-color:#93c5fd;background:#eff6ff;">👆 क्लिक्स: <strong style="color:#1d4ed8;">${p.clicks}</strong></span>
              <span class="ucas-pa-stat-pill" title="जुड़े सदस्य" style="border-color:#86efac;background:#f0fdf4;">👥 जुड़े: <strong style="color:#15803d;">${totalMembersJoined}</strong></span>
              <span class="ucas-pa-stat-pill" title="किताब खरीद" style="border-color:#fde047;background:#fefce8;">💰 परचेज: <strong style="color:#b45309;">${totalBooksBought}</strong></span>
            </div>

            <button type="button" onclick="window.shareSpecificPage('${p.pageUrl}', '${p.title.replace(/'/g, "\\'")}')" style="background:#0f172a;color:#facc15;border:1.5px solid #facc15;padding:6px 14px;border-radius:20px;font-weight:800;font-size:0.8rem;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
              <i class="fa-solid fa-share-nodes"></i> <span>शेयर करें</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderUcasViralSponsorCards(user, shareId, sponsor) {
    const userNameEl = document.getElementById('ucasViralUserName');
    const userIdentEl = document.getElementById('ucasViralUserIdent');
    const statusBtnText = document.getElementById('ucasViralStatusBtnText');

    const name = user.full_name || user.name || 'प्रिय सदस्य';
    const sid = user.share_id || shareId || 'AI000004';

    if (userNameEl) userNameEl.textContent = name;
    if (userIdentEl) userIdentEl.textContent = `${name} (ID: ${sid})`;
    if (statusBtnText) statusBtnText.textContent = `✅ आप लॉगिन हैं (${sid})`;

    const spNameEl = document.getElementById('ucasAdvisorName');
    const spIdEl = document.getElementById('ucasAdvisorId');
    const spCallBtn = document.getElementById('ucasAdvisorCallBtn');
    const spWaBtn = document.getElementById('ucasAdvisorWaBtn');

    if (sponsor) {
      if (spNameEl) spNameEl.textContent = sponsor.name || 'श्री अवनीश कुमार मिश्रा';
      if (spIdEl) spIdEl.textContent = sponsor.shareId || 'AI000004';
      if (spCallBtn) spCallBtn.href = `tel:+91${sponsor.phone || '7974422572'}`;
      if (spWaBtn) {
        const text = encodeURIComponent(`नमस्ते ${sponsor.name || 'श्री अवनीश कुमार मिश्रा'} जी! मैंने आपका नेट्सर्फ Q3 पाथफाइंडर व आरोग्यम इंडिया प्रोफाइल देखा। मुझे आपके साथ जुड़ने व ऑफर्स की जानकारी चाहिए।`);
        spWaBtn.href = `https://api.whatsapp.com/send?phone=91${sponsor.phone || '7974422572'}&text=${text}`;
      }
    }
  }

  window.shareSpecificPage = function(pagePath, pageTitle) {
    const user = (window.UCAS_SESSION && window.UCAS_SESSION.getCurrentUser()) || {};
    const sid = user.share_id || user.referral_code || 'AI000004';
    const name = user.full_name || user.name || 'आरोग्यम सहयोगी';
    const url = `https://aarogyamindia.online${pagePath}?ref=${encodeURIComponent(sid)}`;
    const text = `🌾 *नमस्ते! मैं ${name} (ID: ${sid}) बोल रहा हूँ।* 🙏\n\nमैंने आरोग्यम इंडिया पर *"${pageTitle}"* देखा। यह किसानों, पशुपालकों व हमारे परिवार के लिए अत्यंत उपयोगी है!\n\n👉 *यहाँ क्लिक करके पूरा विवरण देखें:*\n${url}\n\nधन्यवाद!\n_आरोग्यम इंडिया डिजिटल क्रांति_`;

    if (navigator.share) {
      navigator.share({ title: pageTitle, text: text, url: url }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  window.shareUcasPersonalIdentity = function() {
    const user = (window.UCAS_SESSION && window.UCAS_SESSION.getCurrentUser()) || {};
    const sid = user.share_id || user.referral_code || 'AI000004';
    const name = user.full_name || user.name || 'आरोग्यम सहयोगी';
    const phone = user.mobile || '';
    const shareUrl = `https://aarogyamindia.online/categories/netsurf-pathfinder.html?ref=${encodeURIComponent(sid)}`;
    const text = `🚀 *नमस्ते! मैं ${name} (ID: ${sid}) बोल रहा हूँ।* 🙏\n\nमेरी अधिकृत डिजिटल शेयरिंग पावर आरोग्यम इंडिया व नेट्सर्फ Q3 पाथफाइंडर (TeamFest) पर एक्टिव है।\n\n👉 *नीचे दिए गए मेरे अधिकृत लिंक से देखें और मुझसे सीधे जुड़ें:*\n${shareUrl}\n\n📞 संपर्क: +91 ${phone}\n_आरोग्यम इंडिया — डिजिटल क्रांति • समृद्ध करियर_`;

    if (navigator.share) {
      navigator.share({ title: `नेट्सर्फ Q3 पाथफाइंडर — ${name}`, text: text, url: shareUrl }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  let allLoadedReferrals = [];

  function handleReferralDatePresetChange() {
    const preset = document.getElementById('profile_ref_date_preset')?.value || 'all';
    const customWrap = document.getElementById('profile_ref_custom_date_wrap');
    const fromEl = document.getElementById('profile_ref_date_from');
    const toEl = document.getElementById('profile_ref_date_to');

    if (preset === 'custom') {
      if (customWrap) customWrap.style.display = 'inline-flex';
      return;
    } else {
      if (customWrap) customWrap.style.display = 'none';
    }

    const now = new Date();
    let startDate = '';
    let endDate = '';

    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      startDate = todayStr;
      endDate = todayStr;
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    }

    if (fromEl) fromEl.value = startDate;
    if (toEl) toEl.value = endDate;

    applyReferralsFilter();
  }

  function applyReferralsFilter() {
    const searchVal = (document.getElementById('profile_ref_search_input')?.value || '').toLowerCase().trim();
    const statusVal = document.getElementById('profile_ref_status_filter')?.value || 'all';
    const preset = document.getElementById('profile_ref_date_preset')?.value || 'all';
    const fromVal = document.getElementById('profile_ref_date_from')?.value || '';
    const toVal = document.getElementById('profile_ref_date_to')?.value || '';

    let filtered = [...allLoadedReferrals];

    // 1. Text Search Filter (Name / Mobile / Share ID)
    if (searchVal) {
      filtered = filtered.filter(r => 
        (r.full_name && r.full_name.toLowerCase().includes(searchVal)) ||
        (r.mobile && r.mobile.includes(searchVal)) ||
        (r.share_id && r.share_id.toLowerCase().includes(searchVal)) ||
        (r.id && r.id.toLowerCase().includes(searchVal))
      );
    }

    // 2. Status Filter
    if (statusVal === 'active') {
      filtered = filtered.filter(r => r.is_active || r.totalPurchasedAmount > 0);
    } else if (statusVal === 'inactive') {
      filtered = filtered.filter(r => !r.is_active && (!r.totalPurchasedAmount || r.totalPurchasedAmount === 0));
    }

    // 3. Date Filter
    if (fromVal) {
      const fromDate = new Date(fromVal);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => r.created_at && new Date(r.created_at) >= fromDate);
    }
    if (toVal) {
      const toDate = new Date(toVal);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => r.created_at && new Date(r.created_at) <= toDate);
    }

    // Recalculate filtered KPIs
    let filteredPurchases = 0;
    filtered.forEach(r => {
      filteredPurchases += (Number(r.totalPurchasedAmount) || 0);
    });

    const currentUser = (window.UCAS_SESSION && window.UCAS_SESSION.getCurrentUser()) || (window.AarogyamWallet && window.AarogyamWallet.getCurrentUser()) || {};
    const isUserActive = checkIsUserActive(currentUser);

    const dirRefEl = document.getElementById('kpi_direct_referrals');
    const dirPurEl = document.getElementById('kpi_direct_purchases');
    if (!isUserActive) {
      if (dirRefEl) dirRefEl.innerHTML = `<span style="filter: blur(4px); user-select: none;">8</span> <span style="font-size:0.65rem; background:#fee2e2; color:#dc2626; padding:1px 6px; border-radius:8px; font-weight:800; vertical-align:middle;">🔒 लॉक</span>`;
      if (dirPurEl) dirPurEl.innerHTML = `<span style="filter: blur(4px); user-select: none;">₹1,480</span> <span style="font-size:0.65rem; background:#fee2e2; color:#dc2626; padding:1px 6px; border-radius:8px; font-weight:800; vertical-align:middle;">🔒 लॉक</span>`;
    } else {
      if (dirRefEl) dirRefEl.textContent = filtered.length;
      if (dirPurEl) dirPurEl.textContent = `₹${filteredPurchases}`;
    }

    renderProfileReferralsList(filtered);
  }

  function resetProfileReferralsFilter() {
    const searchEl = document.getElementById('profile_ref_search_input');
    const presetEl = document.getElementById('profile_ref_date_preset');
    const fromEl = document.getElementById('profile_ref_date_from');
    const toEl = document.getElementById('profile_ref_date_to');
    const statusEl = document.getElementById('profile_ref_status_filter');
    const customWrap = document.getElementById('profile_ref_custom_date_wrap');

    if (searchEl) searchEl.value = '';
    if (presetEl) presetEl.value = 'all';
    if (fromEl) fromEl.value = '';
    if (toEl) toEl.value = '';
    if (statusEl) statusEl.value = 'all';
    if (customWrap) customWrap.style.display = 'none';

    applyReferralsFilter();
  }

  function formatReferralSourceBadge(sourceStr) {
    const s = String(sourceStr || 'direct').toLowerCase();
    if (s.includes('product')) {
      return '<span style="font-size:0.75rem;background:#FEF3C7;color:#B45309;padding:2px 8px;border-radius:12px;font-weight:700;display:inline-flex;align-items:center;gap:3px;"><i class="fa-solid fa-cart-shopping"></i> Product Page</span>';
    }
    if (s.includes('fb') || s.includes('facebook') || s.includes('insta')) {
      return '<span style="font-size:0.75rem;background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:12px;font-weight:700;display:inline-flex;align-items:center;gap:3px;"><i class="fa-brands fa-facebook"></i> Facebook</span>';
    }
    if (s.includes('webinar')) {
      return '<span style="font-size:0.75rem;background:#F5F3FF;color:#7C3AED;padding:2px 8px;border-radius:12px;font-weight:700;display:inline-flex;align-items:center;gap:3px;"><i class="fa-solid fa-video"></i> Webinar</span>';
    }
    if (s.includes('survey')) {
      return '<span style="font-size:0.75rem;background:#ECFDF5;color:#059669;padding:2px 8px;border-radius:12px;font-weight:700;display:inline-flex;align-items:center;gap:3px;"><i class="fa-solid fa-clipboard-check"></i> Survey</span>';
    }
    if (s.includes('landing') || s.includes('lp')) {
      return '<span style="font-size:0.75rem;background:#FFFBEB;color:#D97706;padding:2px 8px;border-radius:12px;font-weight:700;display:inline-flex;align-items:center;gap:3px;"><i class="fa-solid fa-globe"></i> Landing Page</span>';
    }
    if (s.includes('checkout') || s.includes('purchase')) {
      return '<span style="font-size:0.75rem;background:#FEF2F2;color:#DC2626;padding:2px 8px;border-radius:12px;font-weight:700;display:inline-flex;align-items:center;gap:3px;"><i class="fa-solid fa-cart-shopping"></i> Checkout</span>';
    }
    return '<span style="font-size:0.75rem;background:#F1F5F9;color:#475569;padding:2px 8px;border-radius:12px;font-weight:700;display:inline-flex;align-items:center;gap:3px;"><i class="fa-solid fa-user-plus"></i> Direct Ref</span>';
  }

  let ucasReferralPage = 1;
  const UCAS_REFERRAL_PAGE_SIZE = 10;

  function renderProfileReferralsList(list, page = 1) {
    const container = document.getElementById('ucas-profile-referrals-list');
    if (!container) return;

    // 🔒 ACTIVE USER PRIVACY & ACCESS CONTROL LOGIC
    const currentUser = (window.UCAS_SESSION && window.UCAS_SESSION.getCurrentUser()) || (window.AarogyamWallet && window.AarogyamWallet.getCurrentUser()) || {};
    const isUserActive = checkIsUserActive(currentUser);

    // If User is Inactive/Free, show dummy blurred list and clickable strip to jump to activation card!
    if (!isUserActive) {
      container.innerHTML = `
        <!-- Clickable Alert Strip (पट्टी) -->
        <div onclick="document.getElementById('ucas-inactive-subscription-banner')?.scrollIntoView({ behavior: 'smooth', block: 'center' });" style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); color: #ffffff; border: 1.5px solid #ef4444; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; cursor: pointer; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.35rem;">🔒</span>
            <div>
              <div style="font-weight: 900; font-size: 0.92rem; color: #fef08a;">
                आपकी ID इनएक्टिव (Inactive) है! नाम व नंबर अनलॉक करने के लिए ID एक्टिव करें या कस्टमर केयर से संपर्क करें
              </div>
              <div style="font-size: 0.78rem; color: #fecaca; margin-top: 2px;">
                👆 यहाँ क्लिक करें और ऊपर जाकर कोई भी 1 ई-बुक लेकर अपनी ID तुरंत लाइफटाइम एक्टिव करें
              </div>
            </div>
          </div>
          <span style="background: #ffffff; color: #991b1b; font-weight: 900; font-size: 0.78rem; padding: 6px 14px; border-radius: 20px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
            ID एक्टिव करें →
          </span>
        </div>

        <!-- Realistic Dummy Joined Referrals Table with Blurred Names and Numbers -->
        <div style="margin-bottom:12px; background:#fff; border:1.5px solid #fed7aa; border-radius:12px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.04);">
          <table style="width:100%; border-collapse:collapse; font-size:0.84rem;">
            <thead style="background:#fff7ed; border-bottom:1.5px solid #fed7aa;">
              <tr>
                <th style="padding:10px 12px; text-align:left; color:#9a3412;">👤 ग्राहक नाम</th>
                <th style="padding:10px 12px; text-align:left; color:#9a3412;">📞 संपर्क नंबर</th>
                <th style="padding:10px 12px; text-align:left; color:#9a3412;">🛍️ खरीद स्थिति</th>
                <th style="padding:10px 12px; text-align:left; color:#9a3412;">🌐 सोर्स</th>
              </tr>
            </thead>
            <tbody>
              <!-- Row 1 -->
              <tr style="border-bottom:1px solid #f1f5f9; background:#ffffff;">
                <td style="padding:10px 12px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="filter: blur(4px); user-select: none; font-weight:800; color:#0f172a;">रमेश कुमार यादव</span>
                    <span style="font-size:0.7rem; color:#dc2626;">🔒</span>
                  </div>
                  <div style="font-size:0.7rem; color:#94a3b8;">📅 2 घंटे पहले</div>
                </td>
                <td style="padding:10px 12px;">
                  <span style="filter: blur(4px); user-select: none; font-weight:700; color:#475569;">+91 98261 44520</span>
                </td>
                <td style="padding:10px 12px;">
                  <span style="background:#ecfdf5; color:#059669; font-weight:800; font-size:0.74rem; padding:2px 8px; border-radius:8px;">🛍️ 1 ई-बुक (₹99)</span>
                </td>
                <td style="padding:10px 12px;">
                  <span style="background:#eff6ff; color:#1d4ed8; font-weight:700; font-size:0.74rem; padding:2px 8px; border-radius:8px;">WhatsApp Share</span>
                </td>
              </tr>
              <!-- Row 2 -->
              <tr style="border-bottom:1px solid #f1f5f9; background:#f8fafc;">
                <td style="padding:10px 12px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="filter: blur(4px); user-select: none; font-weight:800; color:#0f172a;">सुरेश सिंह चौहान</span>
                    <span style="font-size:0.7rem; color:#dc2626;">🔒</span>
                  </div>
                  <div style="font-size:0.7rem; color:#94a3b8;">📅 5 घंटे पहले</div>
                </td>
                <td style="padding:10px 12px;">
                  <span style="filter: blur(4px); user-select: none; font-weight:700; color:#475569;">+91 91223 88063</span>
                </td>
                <td style="padding:10px 12px;">
                  <span style="background:#ecfdf5; color:#059669; font-weight:800; font-size:0.74rem; padding:2px 8px; border-radius:8px;">🛍️ 2 ई-बुक्स (₹198)</span>
                </td>
                <td style="padding:10px 12px;">
                  <span style="background:#fef2f2; color:#dc2626; font-weight:700; font-size:0.74rem; padding:2px 8px; border-radius:8px;">Tube Share</span>
                </td>
              </tr>
              <!-- Row 3 -->
              <tr style="border-bottom:1px solid #f1f5f9; background:#ffffff;">
                <td style="padding:10px 12px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="filter: blur(4px); user-select: none; font-weight:800; color:#0f172a;">दिलीप कुमार पटेल</span>
                    <span style="font-size:0.7rem; color:#dc2626;">🔒</span>
                  </div>
                  <div style="font-size:0.7rem; color:#94a3b8;">📅 कल 3:45 PM</div>
                </td>
                <td style="padding:10px 12px;">
                  <span style="filter: blur(4px); user-select: none; font-weight:700; color:#475569;">+91 99772 10834</span>
                </td>
                <td style="padding:10px 12px;">
                  <span style="background:#f1f5f9; color:#475569; font-weight:700; font-size:0.74rem; padding:2px 8px; border-radius:8px;">फ्री रजिस्टर्ड</span>
                </td>
                <td style="padding:10px 12px;">
                  <span style="background:#fffbeb; color:#d97706; font-weight:700; font-size:0.74rem; padding:2px 8px; border-radius:8px;">Landing Page</span>
                </td>
              </tr>
              <!-- Row 4 -->
              <tr style="border-bottom:1px solid #f1f5f9; background:#f8fafc;">
                <td style="padding:10px 12px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="filter: blur(4px); user-select: none; font-weight:800; color:#0f172a;">विकास कुमार मौर्य</span>
                    <span style="font-size:0.7rem; color:#dc2626;">🔒</span>
                  </div>
                  <div style="font-size:0.7rem; color:#94a3b8;">📅 2 दिन पहले</div>
                </td>
                <td style="padding:10px 12px;">
                  <span style="filter: blur(4px); user-select: none; font-weight:700; color:#475569;">+91 88715 62901</span>
                </td>
                <td style="padding:10px 12px;">
                  <span style="background:#ecfdf5; color:#059669; font-weight:800; font-size:0.74rem; padding:2px 8px; border-radius:8px;">🛍️ 1 ई-बुक (₹99)</span>
                </td>
                <td style="padding:10px 12px;">
                  <span style="background:#f1f5f9; color:#475569; font-weight:700; font-size:0.74rem; padding:2px 8px; border-radius:8px;">Direct Ref</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="text-align:center;">
          <a href="/ebooks/my-library.html?tab=available#available" class="ucas-lpg-btn" style="display:inline-flex;">
            <span>👑</span> <span>कोई भी 1 ई-बुक लेकर फुल कस्टमर लीड्स व नंबर अनलॉक करें →</span>
          </a>
        </div>
      `;
      return;
    }

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;background:#F8FAFC;border-radius:var(--radius-md);">
          🔍 चयनित फ़िल्टर के अनुसार कोई डायरेक्ट रेफरल नहीं मिला।
        </div>
      `;
      return;
    }

    // ACTIVE USER: Render Full Interactive Table with Book Names & Direct Call/WhatsApp!
    ucasReferralPage = page;
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / UCAS_REFERRAL_PAGE_SIZE);
    const currentPage = Math.min(Math.max(1, ucasReferralPage), totalPages);
    const startIndex = (currentPage - 1) * UCAS_REFERRAL_PAGE_SIZE;
    const currentBatch = list.slice(startIndex, startIndex + UCAS_REFERRAL_PAGE_SIZE);

    container.innerHTML = `
      <div class="ucas-table-wrap" style="border:1px solid var(--border);border-radius:var(--radius-md);overflow-x:auto;">
        <table class="ucas-table" style="font-size:0.82rem;min-width:700px;">
          <thead>
            <tr>
              <th>#</th>
              <th>सदस्य का नाम</th>
              <th>मोबाइल / संपर्क</th>
              <th>स्रोत (Source)</th>
              <th>स्थिति</th>
              <th>जॉइन तारीख</th>
              <th>खरीदी गई किताब (Book)</th>
              <th>परचेज राशि</th>
            </tr>
          </thead>
          <tbody>
            ${currentBatch.map((r, i) => {
              const globalIndex = startIndex + i + 1;
              const srcBadge = formatReferralSourceBadge(r.source || r.registration_source);
              const isActive = Boolean(r.is_active || (r.totalPurchasedAmount && r.totalPurchasedAmount > 0));
              const statusBadge = isActive
                ? '<span style="font-size:0.74rem;background:#DCFCE7;color:#15803D;padding:2px 8px;border-radius:10px;font-weight:800;">🟢 Active (Paid)</span>'
                : '<span style="font-size:0.74rem;background:#F1F5F9;color:#64748B;padding:2px 8px;border-radius:10px;font-weight:700;">⚪ Inactive (Free)</span>';

              // Books bought by this member
              let bookDisplay = '<span style="color:#94a3b8;font-size:0.75rem;">कोई खरीद नहीं</span>';
              if (r.purchases && r.purchases.length > 0) {
                bookDisplay = r.purchases.map(p => {
                  return `<div style="font-weight:700;color:#047857;font-size:0.76rem;display:inline-flex;align-items:center;gap:4px;background:#ecfdf5;padding:2px 8px;border-radius:6px;margin:2px 0;border:1px solid #a7f3d0;"><i class="fa-solid fa-book"></i> ${p.book_name || 'ई-बुक'}</div>`;
                }).join('<br>');
              }

              return `
                <tr>
                  <td><strong>#${globalIndex}</strong></td>
                  <td>
                    <div style="font-weight:700;color:var(--text-main);">${r.full_name || 'Member'}</div>
                    ${r.net_surf_id ? `<div style="font-size:0.7rem;color:#0284c7;">NetSurf: ${r.net_surf_id}</div>` : ''}
                  </td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <a href="tel:${r.mobile}" style="color:var(--primary-dark);font-weight:700;text-decoration:none;" title="कॉल करें">
                        📞 <code>${r.mobile}</code>
                      </a>
                      <a href="https://wa.me/91${r.mobile}?text=${encodeURIComponent('नमस्ते ' + (r.full_name || '') + ' जी! आरोग्यम इंडिया से संपर्क करने के लिए धन्यवाद।')}" target="_blank" style="color:#16a34a;background:#ecfdf5;padding:2px 6px;border-radius:6px;text-decoration:none;font-size:0.75rem;" title="व्हाट्सएप मैसेज">
                        <i class="fa-brands fa-whatsapp"></i>
                      </a>
                    </div>
                  </td>
                  <td>${srcBadge}</td>
                  <td>${statusBadge}</td>
                  <td>${r.created_at ? new Date(r.created_at).toLocaleDateString('hi-IN') : '-'}</td>
                  <td>${bookDisplay}</td>
                  <td>
                    ${r.totalPurchasedAmount > 0 ? `
                      <span style="font-weight:800;color:#15803D;background:#DCFCE7;padding:3px 8px;border-radius:6px;">
                        ₹${r.totalPurchasedAmount}
                      </span>
                    ` : `
                      <span style="color:var(--text-muted);font-size:0.75rem;">₹0</span>
                    `}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${totalPages > 1 ? `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:8px 12px;background:#F8FAFC;border-radius:8px;border:1px solid var(--border);flex-wrap:wrap;gap:8px;">
          <button type="button" id="btn_prev_ref_page" ${currentPage <= 1 ? 'disabled' : ''} style="background:${currentPage <= 1 ? '#e2e8f0' : '#16a34a'};color:${currentPage <= 1 ? '#94a3b8' : '#fff'};border:none;border-radius:6px;padding:6px 14px;font-weight:700;font-size:0.8rem;cursor:${currentPage <= 1 ? 'not-allowed' : 'pointer'};">
            ◀ पिछला
          </button>
          <span style="font-size:0.8rem;font-weight:700;color:var(--text-main);">
            पेज ${currentPage} / ${totalPages} (कुल ${totalItems} सदस्य)
          </span>
          <button type="button" id="btn_next_ref_page" ${currentPage >= totalPages ? 'disabled' : ''} style="background:${currentPage >= totalPages ? '#e2e8f0' : '#16a34a'};color:${currentPage >= totalPages ? '#94a3b8' : '#fff'};border:none;border-radius:6px;padding:6px 14px;font-weight:700;font-size:0.8rem;cursor:${currentPage >= totalPages ? 'not-allowed' : 'pointer'};">
            अगला ▶
          </button>
        </div>
      ` : ''}
    `;

    if (totalPages > 1) {
      document.getElementById('btn_prev_ref_page')?.addEventListener('click', () => {
        if (currentPage > 1) renderProfileReferralsList(list, currentPage - 1);
      });
      document.getElementById('btn_next_ref_page')?.addEventListener('click', () => {
        if (currentPage < totalPages) renderProfileReferralsList(list, currentPage + 1);
      });
    }
  }

  function animateCounter(elementId, targetVal) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (typeof targetVal === 'string' && targetVal.startsWith('₹')) {
      const num = parseInt(targetVal.replace(/[^\d]/g, ''), 10) || 0;
      const startVal = parseInt(el.textContent.replace(/[^\d]/g, ''), 10) || 0;
      const duration = 500;
      const steps = 15;
      const stepTime = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const currentVal = Math.round(startVal + (num - startVal) * (currentStep / steps));
        el.textContent = `₹${currentVal.toLocaleString('en-IN')}`;
        if (currentStep >= steps) {
          el.textContent = `₹${num.toLocaleString('en-IN')}`;
          clearInterval(timer);
        }
      }, stepTime);
      return;
    }

    const num = parseInt(targetVal, 10) || 0;
    const startVal = parseInt(el.textContent, 10) || 0;
    const duration = 500;
    const steps = 15;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentVal = Math.round(startVal + (num - startVal) * (currentStep / steps));
      el.textContent = currentVal;
      if (currentStep >= steps) {
        el.textContent = targetVal;
        clearInterval(timer);
      }
    }, stepTime);
  }

  function renderRecentActivity(surveys, contacts) {
    const container = document.getElementById('ucas-dashboard-recent-activity');
    if (!container) return;

    const combined = [];

    // 1. Direct Referrals & Purchases Stream
    (allLoadedReferrals || []).forEach(r => {
      if (r.totalPurchasedAmount > 0) {
        combined.push({
          type: 'purchase',
          title: `🛍️ ई-बुक खरीद: ${r.full_name || 'सदस्य'}`,
          subtitle: `₹${r.totalPurchasedAmount} की खरीद • ${r.purchases && r.purchases[0]?.book_name ? r.purchases[0].book_name : 'ई-बुक'}`,
          time: r.created_at,
          icon: 'fa-bag-shopping',
          badge: 'Purchase'
        });
      } else {
        combined.push({
          type: 'referral',
          title: `👥 नया रेफरल सदस्य: ${r.full_name || 'सदस्य'}`,
          subtitle: `सोर्स: ${r.source || 'Direct'} • ${r.created_at ? new Date(r.created_at).toLocaleDateString('hi-IN') : 'हाल ही में'}`,
          time: r.created_at,
          icon: 'fa-user-plus',
          badge: 'Referral'
        });
      }
    });

    // 2. Surveys Stream
    surveys.forEach(s => {
      combined.push({
        type: 'survey',
        title: `📋 नया सर्वे: ${s.name}`,
        subtitle: `${s.village || s.district || 'अज्ञात स्थान'} • ${Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : s.selected_categories}`,
        time: s.created_at,
        icon: 'fa-clipboard-list',
        badge: 'Survey'
      });
    });

    combined.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
    const recent = combined.slice(0, 6);

    if (recent.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;">
          कोई हालिया गतिविधि नहीं है। सर्वे या फोनबुक जोड़ें।
        </div>
      `;
      return;
    }

    container.innerHTML = recent.map(item => {
      const timeStr = item.time ? new Date(item.time).toLocaleDateString('hi-IN') : 'हाल ही में';
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F1F5F9;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:8px;background:var(--primary-subtle);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:0.95rem;">
              <i class="fa-solid ${item.icon}"></i>
            </div>
            <div>
              <div style="font-weight:700;font-size:0.88rem;color:var(--text-main);">${item.title}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${item.subtitle}</div>
            </div>
          </div>
          <div style="font-size:0.72rem;color:var(--text-subtle);">${timeStr}</div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // UI UTILITIES: MODALS & TOASTS
  // ==========================================

  function bindGlobalModalEvents() {
    // Close modal on click outside or close button
    document.querySelectorAll('.ucas-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    document.querySelectorAll('.ucas-modal-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.ucas-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('ucas-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ucas-toast-container';
      container.className = 'ucas-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `ucas-toast ${type === 'error' ? 'toast-error' : (type === 'warning' ? 'toast-warning' : '')}`;
    
    const icon = type === 'error' ? 'fa-circle-xmark' : (type === 'success' ? 'fa-circle-check' : 'fa-circle-info');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function renderBroadcastView() {
    const container = document.getElementById('ucas-broadcast-view-container');
    if (!container) return;

    let broadcasts = [];
    try {
      broadcasts = JSON.parse(localStorage.getItem('AAROGYAM_GLOBAL_BROADCASTS') || '[]');
    } catch (e) {}

    // Default sample broadcasts if empty
    if (broadcasts.length === 0) {
      broadcasts = [
        {
          id: 'BC_SAMPLE_01',
          title: '🌾 खरीफ 2026 विशेष किसान जागरूकता अभियान',
          body: 'प्रिय सदस्यों, आधुनिक जैविक कृषि व फसलों की सुरक्षा पर हमारी विशेष ई-बुक अब डिजिटल लाइब्रेरी में उपलब्ध है। अभी पढ़ें और लाभ लें।',
          category: 'announcement',
          priority: 'normal',
          target: 'all',
          action_url: '/ebooks/my-library.html',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      try {
        localStorage.setItem('AAROGYAM_GLOBAL_BROADCASTS', JSON.stringify(broadcasts));
      } catch (e) {}
    }

    const user = window.UCAS_SESSION.getUser() || {};
    const readStore = JSON.parse(localStorage.getItem(`AI_NOTIFS_READ_${user.id || user.mobile || 'guest'}`) || '[]');

    // Filter relevant broadcasts
    const eligible = broadcasts.filter(bc => {
      if (!bc.target || bc.target === 'all') return true;
      if (bc.target === 'active' && (user.is_active || user.is_subscriber)) return true;
      if (bc.target === 'selected' && Array.isArray(bc.target_user_ids)) {
        return bc.target_user_ids.includes(user.id) || bc.target_user_ids.includes(user.mobile) || bc.target_user_ids.includes(user.share_id);
      }
      return true;
    });

    if (eligible.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:2.5rem 1.5rem;color:var(--text-muted);background:#F8FAFC;border-radius:var(--radius-md);border:1.5px dashed #CBD5E1;">
          <div style="font-size:2rem;margin-bottom:8px;">📭</div>
          <strong style="font-size:1rem;color:var(--text-main);">वर्तमान में कोई नया ब्रॉडकास्ट संदेश नहीं है।</strong>
          <p style="font-size:0.82rem;margin-top:4px;">आरोग्यम इंडिया द्वारा जारी नए अपडेट्स यहाँ दिखाई देंगे।</p>
        </div>
      `;
      return;
    }

    const priorityColors = {
      normal: { bg: '#DCFCE7', color: '#15803D', label: '🟢 सामान्य' },
      important: { bg: '#FEF3C7', color: '#B45309', label: '🟠 महत्वपूर्ण' },
      urgent: { bg: '#FEE2E2', color: '#DC2626', label: '🔴 अति आवश्यक' }
    };

    container.innerHTML = eligible.map(item => {
      const pInfo = priorityColors[item.priority] || priorityColors.normal;
      const isRead = readStore.includes(item.id);
      const dateStr = item.created_at ? new Date(item.created_at).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'हाल ही में';

      return `
        <div class="ucas-card" style="margin-bottom:12px;border:1px solid #E2E8F0;border-left:4px solid ${pInfo.color};background:${isRead ? '#FFFFFF' : '#FFF1F2'};box-shadow:0 2px 6px rgba(0,0,0,0.04);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
            <div>
              <div style="font-weight:800;font-size:1.02rem;color:var(--text-main);display:flex;align-items:center;gap:6px;">
                <span>📢</span>
                <span>${item.title}</span>
                ${!isRead ? '<span style="font-size:0.7rem;background:#E11D48;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700;">• नया</span>' : ''}
              </div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
                📅 ${dateStr} &nbsp;•&nbsp; 👤 ${item.sender || 'आरोग्यम इंडिया प्रबंधन'}
              </div>
            </div>
            <span style="font-size:0.75rem;font-weight:800;background:${pInfo.bg};color:${pInfo.color};padding:3px 8px;border-radius:4px;">
              ${pInfo.label}
            </span>
          </div>

          <div style="font-size:0.9rem;color:#334155;line-height:1.5;margin-bottom:12px;white-space:pre-wrap;">
${item.body || item.desc || ''}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px dashed #E2E8F0;padding-top:8px;">
            ${item.action_url ? `
              <a href="${item.action_url}" target="_blank" class="ucas-btn ucas-btn-sm" style="background:#2563EB;color:#fff;font-weight:700;text-decoration:none;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> लिंक खोलें (Open Link)
              </a>
            ` : '<span></span>'}
            ${!isRead ? `
              <button type="button" class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="window.USER_NOTIFICATIONS?.markAsRead('${item.id}'); UCAS_APP.renderBroadcastView();">
                ✓ पढ़ा हुआ मार्क करें
              </button>
            ` : `
              <span style="font-size:0.75rem;color:#10B981;font-weight:700;">✓ पढ़ा जा चुका है</span>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  window.UCAS_APP = {
    init: initApp,
    switchView,
    renderBroadcastView,
    openUserDrawer,
    closeUserDrawer,
    toggleUserDrawer,
    openModal,
    closeModal,
    showToast,
    refreshDashboardKPIs,
    handleReferralDatePresetChange,
    applyReferralsFilter,
    resetProfileReferralsFilter,
    filterProfileReferrals: applyReferralsFilter,
    resetProfileReferralsDate: resetProfileReferralsFilter
  };

  console.log('✅ UCAS Main Controller Ready.');
})(window);
