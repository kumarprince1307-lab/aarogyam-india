/* ==========================================================================
   UCAS ADMIN & REPORTING MODULE
   Comprehensive Admin Control:
   - 7 Clickable Dashboard KPI Cards:
     1. Total Users
     2. Active Users (Subscribers)
     3. Inactive Users
     4. Subscribers
     5. Surveys
     6. Phonebook
     7. Landing Pages
   - Clickable Phone Numbers (tel:) & Direct WhatsApp Action in all lists
   - Share ID Display (No UUID under User Names)
   - Complete 8-Tab User Details Modal:
     * Tab 1: 👤 Profile (with 🟢 ACTIVE / 🔴 INACTIVE Admin Status Toggle)
     * Tab 2: 📱 Phonebook (Full contact list with Call & WhatsApp)
     * Tab 3: 📋 Surveys (Detailed survey history & responses)
     * Tab 4: ⚡ Activity Log (Timestamped actions)
     * Tab 5: 👥 Sharing & Direct Referrals (with Dynamic Date Filter & Purchase Volume)
     * Tab 6: 🎯 Landing Pages (User's created landing pages & real-time survey counts)
     * Tab 7: 💳 Subscription (eBook Purchase Date = Start Date, Expiry, Source, Amount)
     * Tab 8: 🛡️ Permissions Matrix (Admin ON/OFF toggles, user_name_visible & directory_visible default OFF)
   ========================================================================== */

(function (window) {
  'use strict';

  let allUsersList = [];
  let allSurveysList = [];
  let allPhonebookList = [];
  let allLandingPagesList = [];
  let currentAdminTab = 'users'; // 'users' | 'active_users' | 'inactive_users' | 'subscribers' | 'surveys' | 'phonebook' | 'landing_pages'
  let currentAdminSelectedUser = null;
  let currentUserActiveTab = 'profile'; // 'profile' | 'phonebook' | 'surveys' | 'activity' | 'sharing' | 'landing_pages' | 'subscription' | 'perms'
  let currentFilterStartDate = '';
  let currentFilterEndDate = '';

  function initAdminModule() {
    bindAdminEvents();
    loadAdminData();
  }

  function bindAdminEvents() {
    const searchInput = document.getElementById('ucas-admin-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchCurrentAdminTab(e.target.value);
    });
  }

  async function loadAdminData() {
    if (!window.UCAS_PERMISSIONS.isAdmin()) {
      return;
    }

    try {
      const [usersRes, surveysRes, phonebookRes, lpsRes] = await Promise.all([
        window.UCAS_DB.getAllProfiles(500),
        window.UCAS_DB.getSurveys(null),
        window.UCAS_DB.getPhonebook(null),
        window.UCAS_DB.getAllLandingPagesAdmin()
      ]);

      if (usersRes.success) allUsersList = usersRes.data || [];
      if (surveysRes.success) allSurveysList = surveysRes.data || [];
      if (phonebookRes.success) allPhonebookList = phonebookRes.data || [];
      if (lpsRes.success) allLandingPagesList = lpsRes.data || [];

      // Compute subscription status for each user
      for (const u of allUsersList) {
        const sub = await window.UCAS_DB.getUserSubscription(u.id);
        u.subscription = sub;
        u.isActive = sub.isActive;
        u.isSubscriber = sub.subscriber === 'YES';
      }

      calculateAndRenderAdminReports();
      renderActiveAdminTab();
    } catch (e) {
      console.error('UCAS Admin: load error', e);
    }
  }

  function normalizeIndianMobile(rawTel) {
    if (!rawTel) return null;
    let digits = String(rawTel).replace(/\D/g, '').trim();
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    else if (digits.length === 13 && digits.startsWith('091')) digits = digits.slice(3);
    else if (digits.length === 14 && digits.startsWith('0091')) digits = digits.slice(4);
    if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return digits;
    return null;
  }

  function renderMobileAction(rawMobile) {
    const clean = normalizeIndianMobile(rawMobile);
    if (!clean) {
      return `<code>${rawMobile || '-'}</code>`;
    }
    return `
      <div style="display:inline-flex;align-items:center;gap:6px;">
        <a href="tel:${clean}" style="color:var(--primary-dark);font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:3px;" title="कॉल करें">
          <i class="fa-solid fa-phone" style="color:var(--primary);font-size:0.8rem;"></i> <code>${clean}</code>
        </a>
        <a href="https://wa.me/91${clean}" target="_blank" class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" style="padding:2px 6px;font-size:0.72rem;border-radius:4px;" title="WhatsApp खोलें">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
      </div>
    `;
  }

  // ==========================================
  // 7 CLICKABLE KPI CARDS & REPORTING
  // ==========================================

  function calculateAndRenderAdminReports() {
    const activeUsers = allUsersList.filter(u => u.isActive);
    const inactiveUsers = allUsersList.filter(u => !u.isActive);
    const subscribers = allUsersList.filter(u => u.isSubscriber);

    // Set KPI Values
    setText('ucas-rep-total-users', allUsersList.length);
    setText('ucas-rep-active-users', activeUsers.length);
    setText('ucas-rep-inactive-users', inactiveUsers.length);
    setText('ucas-rep-total-subscribers', subscribers.length);
    setText('ucas-rep-total-surveys', allSurveysList.length);
    setText('ucas-rep-total-contacts', allPhonebookList.length);
    setText('ucas-rep-total-lps', allLandingPagesList.length);

    // Render Category Breakdown
    renderCategoryBreakdown();
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderCategoryBreakdown() {
    const container = document.getElementById('ucas-admin-category-breakdown');
    if (!container) return;

    const catCounts = {};
    allSurveysList.forEach(s => {
      const cats = Array.isArray(s.selected_categories) ? s.selected_categories : ['other'];
      cats.forEach(c => {
        catCounts[c] = (catCounts[c] || 0) + 1;
      });
    });

    const total = allSurveysList.length || 1;
    const catKeys = Object.keys(catCounts);

    if (catKeys.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:1rem;color:var(--text-muted);font-size:0.85rem;">अभी कोई श्रेणी डेटा उपलब्ध नहीं है।</div>`;
      return;
    }

    container.innerHTML = catKeys.map(cat => {
      const count = catCounts[cat];
      const pct = Math.round((count / total) * 100);
      return `
        <div style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;margin-bottom:2px;">
            <span>${cat.toUpperCase()}</span>
            <span>${count} Surveys (${pct}%)</span>
          </div>
          <div style="height:8px;background:#F1F5F9;border-radius:4px;overflow:hidden;">
            <div style="height:100%;background:var(--primary);width:${pct}%;border-radius:4px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function switchAdminTab(tabName) {
    currentAdminTab = tabName;

    // Highlight active KPI card
    document.querySelectorAll('.ucas-admin-kpi-card').forEach(card => {
      if (card.dataset.admintab === tabName) {
        card.style.borderColor = 'var(--primary)';
        card.style.boxShadow = '0 0 0 2px rgba(11,122,62,0.2)';
        card.style.background = 'var(--primary-subtle)';
      } else {
        card.style.borderColor = 'var(--border)';
        card.style.boxShadow = 'none';
        card.style.background = 'var(--bg-card)';
      }
    });

    // Reset search box
    const searchInput = document.getElementById('ucas-admin-search-input');
    if (searchInput) searchInput.value = '';

    renderActiveAdminTab();
  }

  function renderActiveAdminTab() {
    const titleEl = document.getElementById('ucas-admin-table-title');
    const theadEl = document.getElementById('ucas-admin-table-head');
    const tbodyEl = document.getElementById('ucas-admin-table-body');
    const countEl = document.getElementById('ucas-admin-active-count');

    if (!theadEl || !tbodyEl) return;

    if (currentAdminTab === 'users') {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-users"></i> सभी पंजीकृत यूजर डायरेक्टरी (All Users)`;
      if (countEl) countEl.textContent = allUsersList.length;
      theadEl.innerHTML = getUserTableHead();
      renderUsersRows(allUsersList);
    } else if (currentAdminTab === 'active_users') {
      const activeList = allUsersList.filter(u => u.isActive);
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-user-check" style="color:#15803D;"></i> एक्टिव यूजर्स (Active Users - Subscribers)`;
      if (countEl) countEl.textContent = activeList.length;
      theadEl.innerHTML = getUserTableHead();
      renderUsersRows(activeList);
    } else if (currentAdminTab === 'inactive_users') {
      const inactiveList = allUsersList.filter(u => !u.isActive);
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-user-xmark" style="color:#DC2626;"></i> इनएक्टिव यूजर्स (Inactive Users)`;
      if (countEl) countEl.textContent = inactiveList.length;
      theadEl.innerHTML = getUserTableHead();
      renderUsersRows(inactiveList);
    } else if (currentAdminTab === 'subscribers') {
      const subList = allUsersList.filter(u => u.isSubscriber);
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-crown" style="color:#D97706;"></i> एक्टिव सब्सक्राइबर्स (Subscribers)`;
      if (countEl) countEl.textContent = subList.length;
      theadEl.innerHTML = getUserTableHead();
      renderUsersRows(subList);
    } else if (currentAdminTab === 'surveys') {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-clipboard-list"></i> सभी सर्वे रिकॉर्ड्स (All Surveys)`;
      if (countEl) countEl.textContent = allSurveysList.length;
      theadEl.innerHTML = `
        <tr>
          <th>#</th>
          <th>व्यक्ति का नाम</th>
          <th>मोबाइल (Call / WhatsApp)</th>
          <th>कैटेगरी</th>
          <th>स्थान (Place)</th>
          <th>तारीख</th>
          <th>विवरण</th>
        </tr>
      `;
      renderSurveysRows(allSurveysList);
    } else if (currentAdminTab === 'phonebook') {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-address-book"></i> सभी फोनबुक संपर्क (All Phonebook Contacts)`;
      if (countEl) countEl.textContent = allPhonebookList.length;
      theadEl.innerHTML = `
        <tr>
          <th>#</th>
          <th>संपर्क नाम</th>
          <th>मोबाइल (Call / WhatsApp)</th>
          <th>स्थान (Place)</th>
          <th>स्रोत (Source)</th>
          <th>जोड़ा गया</th>
        </tr>
      `;
      renderPhonebookRows(allPhonebookList);
    } else if (currentAdminTab === 'landing_pages') {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles" style="color:var(--secondary-dark);"></i> सभी लैंडिंग पेज (All Landing Pages)`;
      if (countEl) countEl.textContent = allLandingPagesList.length;
      theadEl.innerHTML = `
        <tr>
          <th>#</th>
          <th>लैंडिंग पेज</th>
          <th>क्रिएटर Share ID</th>
          <th>कैटेगरी / मीडिया</th>
          <th>तारीख</th>
          <th>कार्यवाही</th>
        </tr>
      `;
      renderLandingPagesRows(allLandingPagesList);
    }
  }

  function getUserTableHead() {
    return `
      <tr>
        <th>#</th>
        <th>यूजर का नाम</th>
        <th>मोबाइल (Call / WhatsApp)</th>
        <th>स्थिति (Status)</th>
        <th>सब्सक्राइबर</th>
        <th>पंजीकरण तारीख</th>
        <th>कार्यवाही</th>
      </tr>
    `;
  }

  function renderUsersRows(users) {
    const tbody = document.getElementById('ucas-admin-table-body');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">कोई यूजर नहीं मिला।</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map((u, idx) => {
      const shareId = u.referral_code || u.share_id || 'AI000000';
      const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('hi-IN') : '-';
      const statusBadge = u.isActive
        ? `<span style="background:#DCFCE7;color:#15803D;padding:2px 8px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:700;"><i class="fa-solid fa-circle-check"></i> ACTIVE</span>`
        : `<span style="background:#FEE2E2;color:#DC2626;padding:2px 8px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:700;"><i class="fa-solid fa-circle-xmark"></i> INACTIVE</span>`;
      
      const subBadge = u.isSubscriber
        ? `<span style="background:#FEF3C7;color:#92400E;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:800;">YES</span>`
        : `<span style="background:#F1F5F9;color:#64748B;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:700;">NO</span>`;

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${u.full_name || 'Unknown'}</div>
            <div style="font-size:0.75rem;color:var(--primary-dark);font-weight:600;">Share ID: <code>${shareId}</code></div>
          </td>
          <td>${renderMobileAction(u.mobile)}</td>
          <td>${statusBadge}</td>
          <td>${subBadge}</td>
          <td>${dateStr}</td>
          <td>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="UCAS_ADMIN.openUserDetails('${u.id}')" title="संपूर्ण विवरण (Details)">
                <i class="fa-solid fa-id-card"></i> Details
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_ADMIN.openPermissionsMatrix('${u.id}')" title="अनुमतियां (Perms)">
                <i class="fa-solid fa-shield-halved"></i> Perms
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderSurveysRows(surveys) {
    const tbody = document.getElementById('ucas-admin-table-body');
    if (!tbody) return;

    if (surveys.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">कोई सर्वे रिकॉर्ड नहीं मिला।</td></tr>`;
      return;
    }

    tbody.innerHTML = surveys.map((s, idx) => {
      const cats = Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : (s.selected_categories || 'agriculture');
      const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString('hi-IN') : '-';
      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td><div style="font-weight:700;color:var(--text-main);">${s.name}</div></td>
          <td>${renderMobileAction(s.mobile)}</td>
          <td><span style="font-size:0.75rem;background:var(--primary-subtle);color:var(--primary-dark);padding:2px 6px;border-radius:4px;font-weight:600;">${cats.toUpperCase()}</span></td>
          <td>${s.village || s.district || '-'}</td>
          <td>${dateStr}</td>
          <td>
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_APP.viewSurveyDetails('${s.id}')">
              <i class="fa-solid fa-eye"></i> देखें
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderPhonebookRows(contacts) {
    const tbody = document.getElementById('ucas-admin-table-body');
    if (!tbody) return;

    if (contacts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">कोई फोनबुक संपर्क नहीं मिला।</td></tr>`;
      return;
    }

    tbody.innerHTML = contacts.map((c, idx) => {
      const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString('hi-IN') : '-';
      const srcBadge = c.source === 'phonebook' 
        ? '<span style="background:#DCFCE7;color:#15803D;padding:2px 6px;border-radius:4px;font-size:0.75rem;font-weight:700;">📱 Phonebook</span>'
        : c.source === 'csv'
        ? '<span style="background:#E0F2FE;color:#0369A1;padding:2px 6px;border-radius:4px;font-size:0.75rem;font-weight:700;">📊 CSV</span>'
        : '<span style="background:#F1F5F9;color:#475569;padding:2px 6px;border-radius:4px;font-size:0.75rem;font-weight:700;">✍️ Manual</span>';

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td><div style="font-weight:700;color:var(--text-main);">${c.name}</div></td>
          <td>${renderMobileAction(c.mobile)}</td>
          <td>${c.place || '-'}</td>
          <td>${srcBadge}</td>
          <td>${dateStr}</td>
        </tr>
      `;
    }).join('');
  }

  function renderLandingPagesRows(pages) {
    const tbody = document.getElementById('ucas-admin-table-body');
    if (!tbody) return;

    if (pages.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">कोई लैंडिंग पेज नहीं मिला।</td></tr>`;
      return;
    }

    tbody.innerHTML = pages.map((lp, idx) => {
      const dateStr = lp.created_at ? new Date(lp.created_at).toLocaleDateString('hi-IN') : '-';
      const origin = window.location.origin || 'https://aarogyamindia.in';
      const publicUrl = `${origin}/ucas/landing.html?id=${lp.id}&share_id=${lp.share_id || 'AI000004'}`;
      const mediaBadge = lp.content_type === 'youtube'
        ? '<span style="background:#FEE2E2;color:#DC2626;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:700;"><i class="fa-brands fa-youtube"></i> YouTube</span>'
        : '<span style="background:#E0F2FE;color:#0284C7;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:700;"><i class="fa-regular fa-image"></i> Image</span>';

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${lp.title}</div>
            <div style="font-size:0.75rem;color:var(--primary-dark);font-weight:600;">ID: <code>${lp.id}</code></div>
          </td>
          <td><code>${lp.share_id || '-'}</code></td>
          <td>
            <span style="font-size:0.75rem;background:var(--primary-subtle);color:var(--primary-dark);padding:2px 6px;border-radius:4px;font-weight:600;">
              ${lp.category.toUpperCase()}
            </span>
            <div style="margin-top:2px;">${mediaBadge}</div>
          </td>
          <td>${dateStr}</td>
          <td>
            <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="window.open('${publicUrl}', '_blank')">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> लाइव देखें
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function searchCurrentAdminTab(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      renderActiveAdminTab();
      return;
    }

    if (currentAdminTab === 'users' || currentAdminTab === 'active_users' || currentAdminTab === 'inactive_users' || currentAdminTab === 'subscribers') {
      let baseList = allUsersList;
      if (currentAdminTab === 'active_users') baseList = allUsersList.filter(u => u.isActive);
      if (currentAdminTab === 'inactive_users') baseList = allUsersList.filter(u => !u.isActive);
      if (currentAdminTab === 'subscribers') baseList = allUsersList.filter(u => u.isSubscriber);

      const filtered = baseList.filter(u => 
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.mobile || '').includes(q) ||
        (u.referral_code || u.share_id || '').toLowerCase().includes(q)
      );
      renderUsersRows(filtered);
    } else if (currentAdminTab === 'surveys') {
      const filtered = allSurveysList.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.mobile || '').includes(q) ||
        (s.village || '').toLowerCase().includes(q)
      );
      renderSurveysRows(filtered);
    } else if (currentAdminTab === 'phonebook') {
      const filtered = allPhonebookList.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.mobile || '').includes(q) ||
        (c.place || '').toLowerCase().includes(q)
      );
      renderPhonebookRows(filtered);
    } else if (currentAdminTab === 'landing_pages') {
      const filtered = allLandingPagesList.filter(lp =>
        (lp.title || '').toLowerCase().includes(q) ||
        (lp.id || '').toLowerCase().includes(q) ||
        (lp.share_id || '').toLowerCase().includes(q)
      );
      renderLandingPagesRows(filtered);
    }
  }

  // ==========================================
  // COMPLETE 8-TAB USER DETAILS MODAL
  // ==========================================

  async function openUserDetails(profileId, startDate = '', endDate = '', activeTab = 'profile') {
    const user = allUsersList.find(u => u.id === profileId);
    if (!user) return;

    currentAdminSelectedUser = user;
    currentFilterStartDate = startDate;
    currentFilterEndDate = endDate;
    currentUserActiveTab = activeTab;

    const modal = document.getElementById('ucas-modal-admin-user-details');
    const content = document.getElementById('ucas-admin-user-details-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="text-align:center;padding:2rem;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:1.8rem;color:var(--primary);"></i>
        <p style="margin-top:8px;font-size:0.9rem;font-weight:600;">यूजर रिकॉर्ड्स व 8-टैब विवरण लोड हो रहा है...</p>
      </div>
    `;
    modal.classList.add('active');

    // Fetch user surveys, phonebook, perms, subscription, landing pages and activity
    const [surveysRes, phonebookRes, permsRes, refRes, subData, lpsRes, activityRes] = await Promise.all([
      window.UCAS_DB.getSurveys(profileId),
      window.UCAS_DB.getPhonebook(profileId),
      window.UCAS_DB.getPermissions(profileId),
      window.UCAS_DB.getDirectReferralsWithPurchases(profileId, user.referral_code, startDate, endDate),
      window.UCAS_DB.getUserSubscription(profileId),
      window.UCAS_DB.getLandingPages(profileId),
      window.UCAS_DB.getUserActivityLogs(profileId)
    ]);

    const userSurveys = surveysRes.data || [];
    const userPhonebook = phonebookRes.data || [];
    const userPerms = permsRes.data || [];
    const refData = refRes.data || { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0 };
    const userLandingPages = lpsRes.data || [];
    const userLogs = activityRes.data || [];

    const shareId = user.referral_code || user.share_id || 'AI000000';

    // Update user object with fresh subscription
    user.subscription = subData;
    user.isActive = subData.isActive;
    user.isSubscriber = subData.subscriber === 'YES';

    renderUserDetailsModalLayout(user, {
      userSurveys,
      userPhonebook,
      userPerms,
      refData,
      subData,
      userLandingPages,
      userLogs,
      shareId,
      startDate,
      endDate
    });
  }

  function switchUserDetailsTab(tabKey) {
    currentUserActiveTab = tabKey;
    document.querySelectorAll('.ucas-user-tab-btn').forEach(btn => {
      if (btn.dataset.utab === tabKey) {
        btn.className = 'ucas-btn ucas-btn-sm ucas-btn-primary ucas-user-tab-btn';
      } else {
        btn.className = 'ucas-btn ucas-btn-sm ucas-btn-outline ucas-user-tab-btn';
      }
    });

    document.querySelectorAll('.ucas-user-tab-pane').forEach(pane => {
      if (pane.id === `ucas-utab-pane-${tabKey}`) {
        pane.style.display = 'block';
      } else {
        pane.style.display = 'none';
      }
    });
  }

  function renderUserDetailsModalLayout(user, data) {
    const content = document.getElementById('ucas-admin-user-details-content');
    if (!content) return;

    const { userSurveys, userPhonebook, userPerms, refData, subData, userLandingPages, userLogs, shareId, startDate, endDate } = data;

    const regDate = user.created_at ? new Date(user.created_at).toLocaleDateString('hi-IN') : '-';
    const subStartDate = subData.startDate ? new Date(subData.startDate).toLocaleDateString('hi-IN') : '-';
    const subExpDate = subData.expiryDate ? new Date(subData.expiryDate).toLocaleDateString('hi-IN') : '-';

    content.innerHTML = `
      <!-- User Profile Header Card -->
      <div style="background:#F8FAFC;border:1px solid var(--border);border-radius:var(--radius-md);padding:1rem;margin-bottom:1rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;border-radius:50%;background:var(--primary-gradient);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;">
              ${(user.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style="font-size:1.15rem;font-weight:800;color:var(--text-main);">${user.full_name || 'Unknown'}</div>
              <div style="font-size:0.86rem;color:var(--text-muted);display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:2px;">
                ${renderMobileAction(user.mobile)}
                <span>•</span>
                <span style="background:var(--primary-subtle);color:var(--primary-dark);padding:2px 8px;border-radius:4px;font-weight:700;">
                  🏷️ Share ID: ${shareId}
                </span>
              </div>
            </div>
          </div>

          <!-- Status Badge & Admin Toggle -->
          <div style="display:flex;align-items:center;gap:8px;">
            ${subData.isActive 
              ? `<span style="background:#DCFCE7;color:#15803D;padding:4px 10px;border-radius:var(--radius-full);font-size:0.82rem;font-weight:800;"><i class="fa-solid fa-circle-check"></i> ACTIVE</span>`
              : `<span style="background:#FEE2E2;color:#DC2626;padding:4px 10px;border-radius:var(--radius-full);font-size:0.82rem;font-weight:800;"><i class="fa-solid fa-circle-xmark"></i> INACTIVE</span>`
            }
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_ADMIN.toggleUserStatus('${user.id}')" title="स्थिति बदलें (Toggle Status)" style="font-size:0.75rem;padding:4px 8px;">
              <i class="fa-solid fa-arrows-rotate"></i> स्थिति बदलें
            </button>
          </div>
        </div>
      </div>

      <!-- 8-Tab Navigation Bar -->
      <div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:6px;margin-bottom:1rem;border-bottom:1px solid var(--border);">
        <button class="ucas-btn ucas-btn-sm ucas-user-tab-btn ${currentUserActiveTab === 'profile' ? 'ucas-btn-primary' : 'ucas-btn-outline'}" data-utab="profile" onclick="UCAS_ADMIN.switchUserDetailsTab('profile')">
          👤 Profile
        </button>
        <button class="ucas-btn ucas-btn-sm ucas-user-tab-btn ${currentUserActiveTab === 'phonebook' ? 'ucas-btn-primary' : 'ucas-btn-outline'}" data-utab="phonebook" onclick="UCAS_ADMIN.switchUserDetailsTab('phonebook')">
          📱 Phonebook (${userPhonebook.length})
        </button>
        <button class="ucas-btn ucas-btn-sm ucas-user-tab-btn ${currentUserActiveTab === 'surveys' ? 'ucas-btn-primary' : 'ucas-btn-outline'}" data-utab="surveys" onclick="UCAS_ADMIN.switchUserDetailsTab('surveys')">
          📋 Surveys (${userSurveys.length})
        </button>
        <button class="ucas-btn ucas-btn-sm ucas-user-tab-btn ${currentUserActiveTab === 'activity' ? 'ucas-btn-primary' : 'ucas-btn-outline'}" data-utab="activity" onclick="UCAS_ADMIN.switchUserDetailsTab('activity')">
          ⚡ Activity
        </button>
        <button class="ucas-btn ucas-btn-sm ucas-user-tab-btn ${currentUserActiveTab === 'sharing' ? 'ucas-btn-primary' : 'ucas-btn-outline'}" data-utab="sharing" onclick="UCAS_ADMIN.switchUserDetailsTab('sharing')">
          👥 Referrals (${refData.totalReferrals})
        </button>
        <button class="ucas-btn ucas-btn-sm ucas-user-tab-btn ${currentUserActiveTab === 'landing_pages' ? 'ucas-btn-primary' : 'ucas-btn-outline'}" data-utab="landing_pages" onclick="UCAS_ADMIN.switchUserDetailsTab('landing_pages')">
          🎯 Landing Pages (${userLandingPages.length})
        </button>
        <button class="ucas-btn ucas-btn-sm ucas-user-tab-btn ${currentUserActiveTab === 'subscription' ? 'ucas-btn-primary' : 'ucas-btn-outline'}" data-utab="subscription" onclick="UCAS_ADMIN.switchUserDetailsTab('subscription')">
          💳 Subscription
        </button>
        <button class="ucas-btn ucas-btn-sm ucas-user-tab-btn ${currentUserActiveTab === 'perms' ? 'ucas-btn-primary' : 'ucas-btn-outline'}" data-utab="perms" onclick="UCAS_ADMIN.switchUserDetailsTab('perms')">
          🛡️ Permissions
        </button>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 1: PROFILE & BASIC INFO -->
      <!-- =================================================================== -->
      <div id="ucas-utab-pane-profile" class="ucas-user-tab-pane" style="display:${currentUserActiveTab === 'profile' ? 'block' : 'none'};">
        <div style="font-weight:700;font-size:0.88rem;color:var(--primary-dark);margin-bottom:8px;">
          <i class="fa-solid fa-address-card"></i> व्यक्तिगत विवरण (Profile Details):
        </div>
        <div style="font-size:0.84rem;display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#fff;padding:12px;border:1px solid #E2E8F0;border-radius:var(--radius-md);margin-bottom:1rem;">
          <div><strong>User ID:</strong> <code style="font-size:0.75rem;">${user.id}</code></div>
          <div><strong>Share ID:</strong> <strong style="color:var(--primary);">${shareId}</strong></div>
          <div><strong>पूरा नाम:</strong> ${user.full_name || '-'}</div>
          <div><strong>मोबाइल:</strong> ${renderMobileAction(user.mobile)}</div>
          <div><strong>राज्य:</strong> ${user.State || user.state || '-'}</div>
          <div><strong>जिला:</strong> ${user.district || '-'}</div>
          <div><strong>ग्राम / स्थान:</strong> ${user.village || '-'}</div>
          <div><strong>लिंग:</strong> ${user.gender || '-'}</div>
          <div><strong>व्यवसाय:</strong> ${user.occupation || '-'}</div>
          <div><strong>कैटेगरी:</strong> <span style="background:var(--primary-subtle);color:var(--primary-dark);padding:2px 6px;border-radius:4px;font-weight:700;">${user.category || 'Basic User'}</span></div>
          <div><strong>पंजीकरण तारीख:</strong> ${regDate}</div>
          <div><strong>सब्सक्राइबर:</strong> <strong>${subData.subscriber}</strong></div>
        </div>

        <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:var(--radius-md);padding:10px;font-size:0.84rem;">
          <strong>🎯 करंट यूजर स्टेटस:</strong>
          <span style="font-weight:800;color:${subData.isActive ? '#15803D' : '#DC2626'};">${subData.status}</span>
          <span style="color:var(--text-muted);font-size:0.78rem;">(Subscriber = Active User rule लागू है)</span>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 2: PHONEBOOK -->
      <!-- =================================================================== -->
      <div id="ucas-utab-pane-phonebook" class="ucas-user-tab-pane" style="display:${currentUserActiveTab === 'phonebook' ? 'block' : 'none'};">
        <div style="font-weight:700;font-size:0.88rem;color:var(--primary-dark);margin-bottom:6px;">
          📱 यूजर की फोनबुक (${userPhonebook.length} संपर्क):
        </div>
        <div class="ucas-table-wrap" style="max-height:280px;overflow-y:auto;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);">
          <table class="ucas-table" style="font-size:0.82rem;">
            <thead>
              <tr><th>#</th><th>नाम</th><th>मोबाइल</th><th>स्थान</th><th>तारीख</th></tr>
            </thead>
            <tbody>
              ${userPhonebook.length === 0 ? `
                <tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--text-muted);">कोई संपर्क नहीं मिला।</td></tr>
              ` : userPhonebook.map((c, i) => `
                <tr>
                  <td><strong>#${i + 1}</strong></td>
                  <td><div style="font-weight:700;">${c.name}</div></td>
                  <td>${renderMobileAction(c.mobile)}</td>
                  <td>${c.place || '-'}</td>
                  <td>${c.created_at ? new Date(c.created_at).toLocaleDateString('hi-IN') : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 3: SURVEYS -->
      <!-- =================================================================== -->
      <div id="ucas-utab-pane-surveys" class="ucas-user-tab-pane" style="display:${currentUserActiveTab === 'surveys' ? 'block' : 'none'};">
        <div style="font-weight:700;font-size:0.88rem;color:var(--primary-dark);margin-bottom:6px;">
          📋 यूजर द्वारा किए गए सर्वे (${userSurveys.length} रिकॉर्ड):
        </div>
        <div class="ucas-table-wrap" style="max-height:280px;overflow-y:auto;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);">
          <table class="ucas-table" style="font-size:0.82rem;">
            <thead>
              <tr><th>#</th><th>व्यक्ति</th><th>मोबाइल</th><th>स्थान</th><th>कैटेगरी</th><th>तारीख</th></tr>
            </thead>
            <tbody>
              ${userSurveys.length === 0 ? `
                <tr><td colspan="6" style="text-align:center;padding:1.5rem;color:var(--text-muted);">कोई सर्वे रिकॉर्ड नहीं मिला।</td></tr>
              ` : userSurveys.map((s, i) => `
                <tr>
                  <td><strong>#${i + 1}</strong></td>
                  <td><div style="font-weight:700;">${s.name}</div></td>
                  <td>${renderMobileAction(s.mobile)}</td>
                  <td>${s.village || s.district || '-'}</td>
                  <td><span style="font-size:0.75rem;background:var(--primary-subtle);color:var(--primary-dark);padding:2px 6px;border-radius:4px;font-weight:600;">${(Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : 'agriculture').toUpperCase()}</span></td>
                  <td>${s.created_at ? new Date(s.created_at).toLocaleDateString('hi-IN') : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 4: ACTIVITY LOG -->
      <!-- =================================================================== -->
      <div id="ucas-utab-pane-activity" class="ucas-user-tab-pane" style="display:${currentUserActiveTab === 'activity' ? 'block' : 'none'};">
        <div style="font-weight:700;font-size:0.88rem;color:var(--primary-dark);margin-bottom:6px;">
          ⚡ यूजर एक्टिविटी लॉग:
        </div>
        <div style="max-height:280px;overflow-y:auto;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);padding:8px;">
          ${userLogs.length === 0 ? `
            <div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;">कोई गतिविधि रिकॉर्ड नहीं मिली।</div>
          ` : userLogs.map(log => `
            <div style="padding:8px 10px;border-bottom:1px solid #F1F5F9;display:flex;justify-content:space-between;align-items:flex-start;font-size:0.82rem;">
              <div>
                <div style="font-weight:700;color:var(--text-main);">${log.action}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${log.detail || ''}</div>
              </div>
              <span style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap;margin-left:8px;">
                ${log.date ? new Date(log.date).toLocaleString('hi-IN') : '-'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 5: SHARING & DIRECT REFERRALS WITH DATE FILTER -->
      <!-- =================================================================== -->
      <div id="ucas-utab-pane-sharing" class="ucas-user-tab-pane" style="display:${currentUserActiveTab === 'sharing' ? 'block' : 'none'};">
        <!-- Date Filter Bar -->
        <div style="background:#F8FAFC;border:1px solid var(--border);border-radius:var(--radius-md);padding:10px 12px;margin-bottom:10px;">
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-main);margin-bottom:6px;display:flex;justify-content:space-between;">
            <span><i class="fa-solid fa-calendar-days" style="color:var(--primary);"></i> डेट फ़िल्टर (Date Filter)</span>
            <span style="font-size:0.75rem;color:var(--text-muted);">${startDate || endDate ? `${startDate || 'शुरुआत'} से ${endDate || 'आज'}` : 'All Time'}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;">
            <input type="date" id="admin_ref_date_from" value="${startDate}" class="ucas-input" style="padding:4px 8px;font-size:0.78rem;width:125px;">
            <input type="date" id="admin_ref_date_to" value="${endDate}" class="ucas-input" style="padding:4px 8px;font-size:0.78rem;width:125px;">
            <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="UCAS_ADMIN.applyUserDetailsDateFilter('${user.id}')" style="padding:4px 10px;font-size:0.78rem;">
              फ़िल्टर
            </button>
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_ADMIN.openUserDetails('${user.id}', '', '', 'sharing')" style="padding:4px 8px;font-size:0.78rem;">
              All Time
            </button>
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_ADMIN.setThisMonthFilter('${user.id}')" style="padding:4px 8px;font-size:0.78rem;">
              This Month
            </button>
          </div>
        </div>

        <!-- 2 Major Highlight Cards -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;text-align:center;">
          <div style="background:#DCFCE7;color:#15803D;padding:10px;border-radius:var(--radius-md);border:1px solid #86EFAC;">
            <div style="font-size:1.4rem;font-weight:800;">${refData.totalReferrals}</div>
            <div style="font-size:0.75rem;font-weight:700;">👥 Direct Referrals</div>
          </div>
          <div style="background:#FEF3C7;color:#92400E;padding:10px;border-radius:var(--radius-md);border:1px solid #FCD34D;">
            <div style="font-size:1.4rem;font-weight:800;">₹${refData.totalPurchaseAmount}</div>
            <div style="font-size:0.75rem;font-weight:700;">💰 Direct Purchases</div>
          </div>
        </div>

        <!-- Direct Referred Members Table -->
        <div class="ucas-table-wrap" style="max-height:200px;overflow-y:auto;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);">
          <table class="ucas-table" style="font-size:0.8rem;">
            <thead>
              <tr><th>#</th><th>सदस्य</th><th>मोबाइल</th><th>ज्वाइन तारीख</th><th>परचेज राशि</th></tr>
            </thead>
            <tbody>
              ${refData.referrals.length === 0 ? `
                <tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--text-muted);">कोई डायरेक्ट रेफरल नहीं मिला।</td></tr>
              ` : refData.referrals.map((r, i) => `
                <tr>
                  <td><strong>#${i + 1}</strong></td>
                  <td><div style="font-weight:700;">${r.full_name || 'Member'}</div></td>
                  <td>${renderMobileAction(r.mobile)}</td>
                  <td>${r.created_at ? new Date(r.created_at).toLocaleDateString('hi-IN') : '-'}</td>
                  <td><strong>₹${r.totalPurchasedAmount || 0}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 6: LANDING PAGES -->
      <!-- =================================================================== -->
      <div id="ucas-utab-pane-landing_pages" class="ucas-user-tab-pane" style="display:${currentUserActiveTab === 'landing_pages' ? 'block' : 'none'};">
        <div style="font-weight:700;font-size:0.88rem;color:var(--primary-dark);margin-bottom:6px;">
          🎯 यूजर द्वारा बनाए गए लैंडिंग पेज (${userLandingPages.length}):
        </div>
        <div class="ucas-table-wrap" style="max-height:280px;overflow-y:auto;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);">
          <table class="ucas-table" style="font-size:0.82rem;">
            <thead>
              <tr><th>#</th><th>लैंडिंग पेज</th><th>कैटेगरी</th><th>सर्वे रिस्पॉन्स</th><th>तारीख</th><th>कार्यवाही</th></tr>
            </thead>
            <tbody>
              ${userLandingPages.length === 0 ? `
                <tr><td colspan="6" style="text-align:center;padding:1.5rem;color:var(--text-muted);">कोई लैंडिंग पेज नहीं बनाया गया है।</td></tr>
              ` : userLandingPages.map((lp, i) => {
                const origin = window.location.origin || 'https://aarogyamindia.in';
                const shareUrl = `${origin}/ucas/landing.html?id=${lp.id}&share_id=${shareId}`;
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td>
                      <div style="font-weight:700;">${lp.title}</div>
                      <div style="font-size:0.75rem;color:var(--primary);"><code>${lp.id}</code></div>
                    </td>
                    <td>${lp.category.toUpperCase()}</td>
                    <td><strong style="color:#15803D;">${lp.response_count || 0} Surveys</strong></td>
                    <td>${lp.created_at ? new Date(lp.created_at).toLocaleDateString('hi-IN') : '-'}</td>
                    <td>
                      <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="window.open('${shareUrl}', '_blank')">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> देखें
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 7: SUBSCRIPTION & PURCHASE LINK -->
      <!-- =================================================================== -->
      <div id="ucas-utab-pane-subscription" class="ucas-user-tab-pane" style="display:${currentUserActiveTab === 'subscription' ? 'block' : 'none'};">
        <div style="background:#FFFFFF;border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:1rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #F1F5F9;">
            <div style="font-size:1.05rem;font-weight:800;color:var(--primary-dark);">
              <i class="fa-solid fa-crown" style="color:#D97706;"></i> ${subData.plan}
            </div>
            <span style="font-size:0.8rem;background:${subData.isActive ? '#DCFCE7' : '#FEE2E2'};color:${subData.isActive ? '#15803D' : '#DC2626'};padding:3px 10px;border-radius:var(--radius-full);font-weight:800;">
              ${subData.status}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.84rem;margin-bottom:12px;">
            <div><strong>सब्सक्रिप्शन स्रोत (Source):</strong> <span style="background:#E0F2FE;color:#0369A1;padding:2px 6px;border-radius:4px;font-weight:700;">${subData.source}</span></div>
            <div><strong>राशि (Amount):</strong> <strong style="color:#15803D;">${subData.amount}</strong></div>
            <div><strong>शुरुआत तारीख (Start Date):</strong> <strong>${subStartDate}</strong></div>
            <div><strong>समाप्ति तारीख (Expiry Date):</strong> <strong>${subExpDate}</strong></div>
            <div><strong>पेमेंट / रिफ ID:</strong> <code>${subData.paymentId}</code></div>
            <div><strong>शेष दिन (Days Left):</strong> <strong>${subData.daysRemaining} दिन</strong></div>
          </div>

          <!-- Purchase Date = Subscription Start Date Relationship Callout -->
          <div style="background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:var(--radius-md);padding:10px 12px;font-size:0.82rem;color:var(--text-main);">
            <div style="font-weight:800;color:#15803D;margin-bottom:2px;">
              <i class="fa-solid fa-circle-check"></i> eBook Purchase ➔ Free 1-Year Subscription Rule:
            </div>
            <div>
              eBook खरीद तारीख (<strong>${subStartDate}</strong>) = सब्सक्रिप्शन Start Date (<strong>${subStartDate}</strong>)
              व समाप्ति तारीख (<strong>${subExpDate}</strong>) लागू है।
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 8: PERMISSIONS MATRIX -->
      <!-- =================================================================== -->
      <div id="ucas-utab-pane-perms" class="ucas-user-tab-pane" style="display:${currentUserActiveTab === 'perms' ? 'block' : 'none'};">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-weight:700;font-size:0.88rem;color:var(--primary-dark);">
            🛡️ यूजर परमिशन मैट्रिक्स (Permissions Matrix):
          </div>
          <span style="font-size:0.72rem;color:var(--text-muted);">user_name_visible व directory_visible डिफॉल्ट रूप से OFF हैं</span>
        </div>
        <div class="ucas-table-wrap" style="max-height:280px;overflow-y:auto;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);">
          <table class="ucas-table" style="font-size:0.82rem;">
            <thead>
              <tr><th>#</th><th>Permission Key</th><th>अनुमति (Toggle)</th></tr>
            </thead>
            <tbody>
              ${renderPermissionsMatrixRows(user.id, userPerms)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderPermissionsMatrixRows(profileId, userPerms) {
    const keys = [
      'profile_view',
      'profile_edit',
      'survey_access',
      'survey_create',
      'survey_view',
      'phonebook_view',
      'phonebook_add',
      'phonebook_import',
      'marketing_view',
      'marketing_create',
      'landing_page_view',
      'landing_page_create',
      'landing_page_share',
      'library_view',
      'subscription_view',
      'user_name_visible',
      'directory_visible',
      'referral_mobile_visible',
      'admin_center_visible',
      'admin_permissions_manage'
    ];

    const permsMap = {};
    userPerms.forEach(p => {
      if (p.permission_key) permsMap[p.permission_key] = Boolean(p.allowed);
    });

    return keys.map((key, i) => {
      // Default: user_name_visible, directory_visible, admin_center_visible, admin_permissions_manage = OFF
      const isDefaultOff = (key === 'user_name_visible' || key === 'directory_visible' || key === 'admin_center_visible' || key === 'admin_permissions_manage');
      const isAllowed = typeof permsMap[key] !== 'undefined' ? permsMap[key] : !isDefaultOff;

      return `
        <tr>
          <td><strong>#${i + 1}</strong></td>
          <td>
            <code>${key}</code>
            ${isDefaultOff ? '<span style="font-size:0.7rem;color:#D97706;margin-left:4px;">(Default OFF)</span>' : ''}
          </td>
          <td>
            <label style="display:inline-flex;align-items:center;cursor:pointer;gap:6px;">
              <input type="checkbox" ${isAllowed ? 'checked' : ''} onchange="UCAS_ADMIN.toggleUserPermission('${profileId}', '${key}', this.checked)" style="transform:scale(1.2);">
              <span style="font-size:0.8rem;font-weight:700;color:${isAllowed ? '#15803D' : '#DC2626'};">${isAllowed ? 'ON' : 'OFF'}</span>
            </label>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function toggleUserStatus(profileId) {
    const user = allUsersList.find(u => u.id === profileId);
    if (!user) return;

    const newStatus = user.isActive ? 'INACTIVE' : 'ACTIVE';
    try {
      await window.UCAS_DB.setUserStatus(profileId, newStatus);
      window.UCAS_APP.showToast(`✅ यूजर स्थिति बदलकर ${newStatus} कर दी गई!`, 'success');
      await openUserDetails(profileId, currentFilterStartDate, currentFilterEndDate, currentUserActiveTab);
      await loadAdminData();
    } catch (e) {
      console.error('Toggle status error', e);
      window.UCAS_APP.showToast('त्रुटि हुई। कृपया पुनः प्रयास करें।', 'error');
    }
  }

  async function toggleUserPermission(profileId, permissionKey, isAllowed) {
    try {
      await window.UCAS_DB.setPermission(profileId, permissionKey, isAllowed);
      window.UCAS_APP.showToast(`✅ ${permissionKey}: ${isAllowed ? 'ON' : 'OFF'} सुरक्षित किया गया।`, 'success');
    } catch (e) {
      console.error('Toggle perms error', e);
      window.UCAS_APP.showToast('परमिशन बदलने में त्रुटि हुई।', 'error');
    }
  }

  function applyUserDetailsDateFilter(profileId) {
    const fromVal = document.getElementById('admin_ref_date_from')?.value || '';
    const toVal = document.getElementById('admin_ref_date_to')?.value || '';
    openUserDetails(profileId, fromVal, toVal, 'sharing');
  }

  function setThisMonthFilter(profileId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    openUserDetails(profileId, startOfMonth, endOfMonth, 'sharing');
  }

  function openPermissionsMatrix(profileId) {
    openUserDetails(profileId, '', '', 'perms');
  }

  window.UCAS_ADMIN = {
    init: initAdminModule,
    switchAdminTab,
    openUserDetails,
    switchUserDetailsTab,
    toggleUserStatus,
    toggleUserPermission,
    applyUserDetailsDateFilter,
    setThisMonthFilter,
    openPermissionsMatrix
  };

  console.log('✅ UCAS Admin Module (7 KPI Cards + 8-Tab User Details) Ready.');
})(window);
