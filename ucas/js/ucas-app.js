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
    if (viewName === 'leads' && window.UCAS_LEADS) window.UCAS_LEADS.loadLeads();
    if (viewName === 'marketing' && window.UCAS_MARKETING) window.UCAS_MARKETING.updateMarketingEngine();
    if (viewName === 'webinars' && window.UCAS_WEBINARS) window.UCAS_WEBINARS.loadWebinars();
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
    const user = window.UCAS_SESSION.getCurrentUser() || {};
    const name = user.full_name || user.name || 'Aarogyam Member';
    const mobile = user.mobile || '';
    const shareId = window.UCAS_SESSION.getShareId();
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

    if (heroName) heroName.textContent = name;
    if (heroShareId) heroShareId.textContent = shareId;
    if (heroMobile) heroMobile.textContent = mobile;

    if (netsurfId && heroNetsurfPill && heroNetsurfId) {
      heroNetsurfPill.style.display = 'inline-flex';
      heroNetsurfId.textContent = netsurfId;
    } else if (heroNetsurfPill) {
      heroNetsurfPill.style.display = 'none';
    }

    // 🟢 Active / Inactive Status & 365-Day Subscription Timer
    updateUcasSubscriptionState(user);

    // 📊 Profile Completion Progress Calculation
    calculateUcasProfileProgress(user);

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

  function updateUcasSubscriptionState(user) {
    const isActive = Boolean(user.is_active || user.is_subscriber || user.status === 'active');
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

  function calculateUcasProfileProgress(user) {
    let score = 0;
    const totalFields = 11; // 11 fields including NetSurf ID

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

    const percentage = Math.min(100, Math.round((score / totalFields) * 100));

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
        statusHint.textContent = `⚠️ (केवल ${percentage}% पूर्ण — 100% पूरा करें)`;
        statusHint.style.color = '#d97706';
      }
    }

    // Persistent Popup Reminder if < 100%
    if (nudgePopup) {
      if (percentage < 100 && (user.id || user.mobile)) {
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
      interest: interest
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

  async function refreshDashboardKPIs(startDate = '', endDate = '') {
    const profileId = window.UCAS_SESSION.getUserId();
    const shareId = window.UCAS_SESSION.getShareId();
    if (!profileId) return;

    try {
      const [surveysRes, phonebookRes, refRes] = await Promise.all([
        window.UCAS_DB.getSurveys(profileId),
        window.UCAS_DB.getPhonebook(profileId),
        window.UCAS_DB.getDirectReferralsWithPurchases(profileId, shareId, startDate, endDate)
      ]);

      const surveys = surveysRes.data || [];
      const contacts = phonebookRes.data || [];
      const refData = refRes.data || { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0 };

      // Leads status metadata
      const leadMetaStore = JSON.parse(localStorage.getItem(`UCAS_LEAD_META_${profileId}`) || '{}');
      let interested = 0;
      let converted = 0;

      // Count across surveys
      surveys.forEach(s => {
        const meta = leadMetaStore['survey_' + s.id];
        const status = meta?.status || s.category_answers?.status || 'new';
        if (status === 'interested' || status === 'followup') interested++;
        if (status === 'converted') converted++;
      });

      // Count across phonebook
      contacts.forEach(p => {
        const meta = leadMetaStore['pb_' + p.id];
        const status = meta?.status || 'new';
        if (status === 'interested' || status === 'followup') interested++;
        if (status === 'converted') converted++;
      });

      const totalSurveys = surveys.length;
      const totalContacts = contacts.length;
      const totalLeads = totalSurveys + totalContacts;

      // Update KPI Counter DOM Elements
      animateCounter('kpi_total_surveys', totalSurveys);
      animateCounter('kpi_total_contacts', totalContacts);
      animateCounter('kpi_total_leads', totalLeads);
      animateCounter('kpi_total_interested', interested);
      animateCounter('kpi_total_converted', converted);

      // Direct Referrals & Purchases Counters
      const dirRefEl = document.getElementById('kpi_direct_referrals');
      const dirPurEl = document.getElementById('kpi_direct_purchases');
      if (dirRefEl) dirRefEl.textContent = refData.totalReferrals;
      if (dirPurEl) dirPurEl.textContent = `₹${refData.totalPurchaseAmount}`;

      renderProfileReferralsList(refData.referrals);

      // Render Recent Activity Feed
      renderRecentActivity(surveys, contacts);
    } catch (e) {
      console.warn('Dashboard KPI refresh error', e);
    }
  }

  function filterProfileReferrals() {
    const fromVal = document.getElementById('profile_ref_date_from')?.value || '';
    const toVal = document.getElementById('profile_ref_date_to')?.value || '';
    refreshDashboardKPIs(fromVal, toVal);
  }

  function resetProfileReferralsDate() {
    const fromEl = document.getElementById('profile_ref_date_from');
    const toEl = document.getElementById('profile_ref_date_to');
    if (fromEl) fromEl.value = '';
    if (toEl) toEl.value = '';
    refreshDashboardKPIs('', '');
  }

  function renderProfileReferralsList(list) {
    const container = document.getElementById('ucas-profile-referrals-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;background:#F8FAFC;border-radius:var(--radius-md);">
          इस अवधि में कोई डायरेक्ट रेफरल नहीं जुड़ा है। अपनी Share ID शेयर करके नए सदस्य जोड़ें।
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="ucas-table-wrap" style="border:1px solid var(--border);border-radius:var(--radius-md);">
        <table class="ucas-table" style="font-size:0.82rem;">
          <thead>
            <tr>
              <th>#</th>
              <th>सदस्य का नाम</th>
              <th>मोबाइल</th>
              <th>ज्वाइन तारीख</th>
              <th>परचेज राशि</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((r, i) => `
              <tr>
                <td><strong>#${i + 1}</strong></td>
                <td><div style="font-weight:700;color:var(--text-main);">${r.full_name || 'Member'}</div></td>
                <td>
                  <a href="tel:${r.mobile}" style="color:var(--primary-dark);font-weight:700;text-decoration:none;">
                    📞 <code>${r.mobile}</code>
                  </a>
                </td>
                <td>${r.created_at ? new Date(r.created_at).toLocaleDateString('hi-IN') : '-'}</td>
                <td>
                  ${r.totalPurchasedAmount > 0 ? `
                    <span style="font-weight:800;color:#15803D;background:#DCFCE7;padding:2px 8px;border-radius:4px;">
                      ₹${r.totalPurchasedAmount}
                    </span>
                  ` : `
                    <span style="color:var(--text-muted);font-size:0.75rem;">₹0</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function animateCounter(elementId, targetVal) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const startVal = parseInt(el.textContent, 10) || 0;
    const duration = 500;
    const steps = 15;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentVal = Math.round(startVal + (targetVal - startVal) * (currentStep / steps));
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

    surveys.forEach(s => {
      combined.push({
        type: 'survey',
        title: `नया सर्वे: ${s.name}`,
        subtitle: `${s.village || s.district || 'अज्ञात स्थान'} • ${Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : s.selected_categories}`,
        time: s.created_at,
        icon: 'fa-clipboard-list',
        badge: 'Survey'
      });
    });

    contacts.forEach(c => {
      combined.push({
        type: 'contact',
        title: `संपर्क जोड़ा: ${c.name}`,
        subtitle: `${c.mobile} • स्रोत: ${c.source}`,
        time: c.created_at,
        icon: 'fa-address-book',
        badge: 'Contact'
      });
    });

    combined.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
    const recent = combined.slice(0, 5);

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

  window.UCAS_APP = {
    init: initApp,
    switchView,
    openUserDrawer,
    closeUserDrawer,
    toggleUserDrawer,
    openModal,
    closeModal,
    showToast,
    refreshDashboardKPIs,
    filterProfileReferrals,
    resetProfileReferralsDate
  };

  console.log('✅ UCAS Main Controller Ready.');
})(window);
