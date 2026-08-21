/* ==========================================================================
   UCAS ADMIN & REPORTING MODULE
   Admin control:
   - Clickable Dashboard KPI Cards (Total Users, Total Surveys, Total Phonebook)
   - Dynamic Tabbed Tables (Users Directory, Surveys List, Phonebook List)
   - Clickable Phone Numbers (tel:) & Direct WhatsApp Action in all lists
   - Share ID Display (No UUID under User Names)
   - User Details & Profile Breakdown Modal with:
     * Total Direct Referrals Count
     * Total Direct Purchase Amount (e.g., 10 users * 99 = 990)
     * Dynamic Date Filter (Start Date, End Date, Quick Presets)
     * Direct Referred Members Breakdown Table
   - User Permissions Matrix (public.permissions)
   - Real-Time Aggregated Reports & Category Breakdown
   ========================================================================== */

(function (window) {
  'use strict';

  let allUsersList = [];
  let allSurveysList = [];
  let allPhonebookList = [];
  let currentAdminTab = 'users'; // 'users' | 'surveys' | 'phonebook'
  let currentAdminSelectedUser = null;
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
      const [usersRes, surveysRes, phonebookRes] = await Promise.all([
        window.UCAS_DB.getAllProfiles(200),
        window.UCAS_DB.getSurveys(null),
        window.UCAS_DB.getPhonebook(null)
      ]);

      if (usersRes.success) allUsersList = usersRes.data || [];
      if (surveysRes.success) allSurveysList = surveysRes.data || [];
      if (phonebookRes.success) allPhonebookList = phonebookRes.data || [];

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
  // TAB & CARD SWITCHING
  // ==========================================

  function switchAdminTab(tabName) {
    currentAdminTab = tabName;

    // Highlight active card
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
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-users"></i> पंजीकृत यूजर डायरेक्टरी (Users Directory)`;
      if (countEl) countEl.textContent = allUsersList.length;

      theadEl.innerHTML = `
        <tr>
          <th>#</th>
          <th>यूजर का नाम</th>
          <th>मोबाइल (Call / WhatsApp)</th>
          <th>Share ID</th>
          <th>पंजीकरण तारीख</th>
          <th>कार्यवाही</th>
        </tr>
      `;
      renderUsersRows(allUsersList);
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
          <th>नाम (Name)</th>
          <th>मोबाइल (Call / WhatsApp)</th>
          <th>स्थान (Place)</th>
          <th>स्रोत (Source)</th>
          <th>तारीख</th>
        </tr>
      `;
      renderPhonebookRows(allPhonebookList);
    }
  }

  function renderUsersRows(users) {
    const tbody = document.getElementById('ucas-admin-table-body');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">कोई यूजर नहीं मिला।</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map((u, idx) => {
      const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('hi-IN') : '-';
      const shareId = u.referral_code || u.share_id || '-';

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${u.full_name || 'Anonymous'}</div>
            <div style="font-size:0.75rem;color:var(--primary);font-weight:600;">Share ID: <code>${shareId}</code></div>
          </td>
          <td>${renderMobileAction(u.mobile)}</td>
          <td><span style="font-weight:700;color:var(--primary);font-size:0.88rem;">${shareId}</span></td>
          <td>${dateStr}</td>
          <td>
            <div style="display:flex;gap:4px;">
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_ADMIN.openUserDetails('${u.id}')">
                <i class="fa-solid fa-user-gear"></i> Details
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="UCAS_ADMIN.openPermissionsMatrix('${u.id}', '${encodeURIComponent(u.full_name || 'User')}')">
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
      const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString('hi-IN') : '-';
      const cats = Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : (s.selected_categories || 'General');
      const place = s.village || s.district || s.state || '-';

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${s.name}</div>
          </td>
          <td>${renderMobileAction(s.mobile)}</td>
          <td><span style="font-size:0.75rem;background:var(--primary-subtle);color:var(--primary-dark);padding:2px 6px;border-radius:4px;font-weight:600;">${cats}</span></td>
          <td>${place}</td>
          <td>${dateStr}</td>
          <td>
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_SURVEY.viewSurveyDetails('${s.id}')">
              <i class="fa-solid fa-eye"></i> View
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
          <td>
            <div style="font-weight:700;color:var(--text-main);">${c.name}</div>
          </td>
          <td>${renderMobileAction(c.mobile)}</td>
          <td>${c.place || '-'}</td>
          <td>${srcBadge}</td>
          <td>${dateStr}</td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // USER DETAILS & DIRECT REFERRALS WITH DATE FILTER
  // ==========================================

  async function openUserDetails(profileId, startDate = '', endDate = '') {
    const user = allUsersList.find(u => u.id === profileId);
    if (!user) return;

    currentAdminSelectedUser = user;
    currentFilterStartDate = startDate;
    currentFilterEndDate = endDate;

    const modal = document.getElementById('ucas-modal-admin-user-details');
    const content = document.getElementById('ucas-admin-user-details-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="text-align:center;padding:2rem;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:1.8rem;color:var(--primary);"></i>
        <p style="margin-top:8px;font-size:0.9rem;font-weight:600;">यूजर व डायरेक्ट रेफरल डेटा लोड हो रहा है...</p>
      </div>
    `;
    modal.classList.add('active');

    // Fetch user surveys, phonebook, perms and direct referrals with purchase volume
    const [surveysRes, phonebookRes, permsRes, refRes] = await Promise.all([
      window.UCAS_DB.getSurveys(profileId),
      window.UCAS_DB.getPhonebook(profileId),
      window.UCAS_DB.getPermissions(profileId),
      window.UCAS_DB.getDirectReferralsWithPurchases(profileId, user.referral_code, startDate, endDate)
    ]);

    const userSurveys = surveysRes.data || [];
    const userPhonebook = phonebookRes.data || [];
    const userPerms = permsRes.data || [];
    const refData = refRes.data || { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0 };

    const shareId = user.referral_code || user.share_id || '-';

    content.innerHTML = `
      <!-- User Profile Header (Share ID shown, No UUID under name) -->
      <div style="background:#F8FAFC;border:1px solid var(--border);border-radius:var(--radius-md);padding:1rem;margin-bottom:1rem;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--primary-gradient);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;">
            ${(user.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--text-main);">${user.full_name || 'Unknown'}</div>
            <div style="font-size:0.86rem;color:var(--text-muted);display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:3px;">
              ${renderMobileAction(user.mobile)}
              <span>•</span>
              <span style="background:var(--primary-subtle);color:var(--primary-dark);padding:2px 8px;border-radius:4px;font-weight:700;">
                🏷️ Share ID: ${shareId}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Filter Bar for Direct Referrals & Purchases -->
      <div style="background:#FFFFFF;border:1px solid var(--border);border-radius:var(--radius-md);padding:10px 12px;margin-bottom:1rem;">
        <div style="font-size:0.82rem;font-weight:700;color:var(--text-main);margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
          <span><i class="fa-solid fa-calendar-days" style="color:var(--primary);"></i> डायरेक्ट रेफरल व परचेज डेट फ़िल्टर (Date Filter)</span>
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:500;">
            ${startDate || endDate ? `फ़िल्टर: ${startDate || 'शुरुआत'} से ${endDate || 'आज'}` : 'सभी समय का डेटा (All Time)'}
          </span>
        </div>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:0.78rem;color:var(--text-muted);">From:</span>
            <input type="date" id="admin_ref_date_from" value="${startDate}" class="ucas-input" style="padding:4px 8px;font-size:0.8rem;width:130px;">
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:0.78rem;color:var(--text-muted);">To:</span>
            <input type="date" id="admin_ref_date_to" value="${endDate}" class="ucas-input" style="padding:4px 8px;font-size:0.8rem;width:130px;">
          </div>
          <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="UCAS_ADMIN.applyUserDetailsDateFilter('${profileId}')" style="padding:4px 12px;font-size:0.8rem;">
            फ़िल्टर करें
          </button>
          <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_ADMIN.openUserDetails('${profileId}', '', '')" style="padding:4px 8px;font-size:0.8rem;" title="Reset">
            All Time
          </button>
          <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_ADMIN.setThisMonthFilter('${profileId}')" style="padding:4px 8px;font-size:0.8rem;">
            This Month
          </button>
        </div>
      </div>

      <!-- 2 Major Highlight Cards: Total Direct Referrals & Total Direct Purchase Amount -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1rem;text-align:center;">
        <div style="background:#DCFCE7;color:#15803D;padding:12px;border-radius:var(--radius-md);border:1px solid #86EFAC;">
          <div style="font-size:1.5rem;font-weight:800;" id="admin_user_ref_count">${refData.totalReferrals}</div>
          <div style="font-size:0.8rem;font-weight:700;">👥 Total Direct Referrals (ज्वाइनिंग)</div>
        </div>
        <div style="background:#FEF3C7;color:#92400E;padding:12px;border-radius:var(--radius-md);border:1px solid #FCD34D;">
          <div style="font-size:1.5rem;font-weight:800;" id="admin_user_pur_amount">₹${refData.totalPurchaseAmount}</div>
          <div style="font-size:0.8rem;font-weight:700;">💰 Total Direct Purchase (परचेज राशि)</div>
        </div>
      </div>

      <!-- Other KPI Cards: Surveys & Phonebook -->
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;margin-bottom:1rem;text-align:center;">
        <div style="background:#E0F2FE;color:#0369A1;padding:8px;border-radius:var(--radius-md);">
          <div style="font-size:1.15rem;font-weight:800;">${userSurveys.length}</div>
          <div style="font-size:0.72rem;font-weight:600;">Surveys Added</div>
        </div>
        <div style="background:#F3E8FF;color:#6B21A8;padding:8px;border-radius:var(--radius-md);">
          <div style="font-size:1.15rem;font-weight:800;">${userPhonebook.length}</div>
          <div style="font-size:0.72rem;font-weight:600;">Phonebook Contacts</div>
        </div>
        <div style="background:#F1F5F9;color:#334155;padding:8px;border-radius:var(--radius-md);">
          <div style="font-size:1.15rem;font-weight:800;">${userPerms.length}</div>
          <div style="font-size:0.72rem;font-weight:600;">Active Perms</div>
        </div>
      </div>

      <!-- Direct Referred Members Breakdown Table -->
      <div style="margin-bottom:1rem;">
        <div style="font-weight:700;font-size:0.88rem;color:var(--text-main);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
          <span>📋 डायरेक्ट जुड़े सदस्य (${refData.referrals.length}):</span>
          <span style="font-size:0.75rem;color:var(--text-muted);">कुल परचेज: <strong>₹${refData.totalPurchaseAmount}</strong></span>
        </div>
        <div class="ucas-table-wrap" style="max-height:220px;overflow-y:auto;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);">
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
              ${refData.referrals.length === 0 ? `
                <tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--text-muted);">इस अवधि में कोई डायरेक्ट रेफरल नहीं मिला।</td></tr>
              ` : refData.referrals.map((r, i) => `
                <tr>
                  <td><strong>#${i + 1}</strong></td>
                  <td><div style="font-weight:700;">${r.full_name || 'Member'}</div></td>
                  <td>${renderMobileAction(r.mobile)}</td>
                  <td>${r.created_at ? new Date(r.created_at).toLocaleDateString('hi-IN') : '-'}</td>
                  <td>
                    ${r.totalPurchasedAmount > 0 ? `
                      <span style="font-weight:800;color:#15803D;background:#DCFCE7;padding:2px 6px;border-radius:4px;">
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
      </div>

      <div style="font-weight:700;font-size:0.85rem;margin-bottom:6px;">स्थान एवं विवरण:</div>
      <div style="font-size:0.82rem;display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#fff;padding:8px;border:1px solid #E2E8F0;border-radius:6px;">
        <div><strong>राज्य:</strong> ${user.State || user.state || '-'}</div>
        <div><strong>जिला:</strong> ${user.district || '-'}</div>
        <div><strong>लिंग:</strong> ${user.gender || '-'}</div>
        <div><strong>पंजीकरण तारीख:</strong> ${user.created_at ? new Date(user.created_at).toLocaleDateString('hi-IN') : '-'}</div>
      </div>
    `;
  }

  function applyUserDetailsDateFilter(profileId) {
    const fromVal = document.getElementById('admin_ref_date_from')?.value || '';
    const toVal = document.getElementById('admin_ref_date_to')?.value || '';
    openUserDetails(profileId, fromVal, toVal);
  }

  function setThisMonthFilter(profileId) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    openUserDetails(profileId, firstDay, lastDay);
  }

  // ==========================================
  // USER PERMISSIONS MATRIX
  // ==========================================

  async function openPermissionsMatrix(profileId, encodedName) {
    const userName = decodeURIComponent(encodedName);
    currentAdminSelectedUser = { id: profileId, full_name: userName };

    const modal = document.getElementById('ucas-modal-admin-permissions-matrix');
    const titleEl = document.getElementById('ucas-admin-matrix-user-name');
    const tableBody = document.getElementById('ucas-admin-matrix-table-body');
    if (!modal || !tableBody) return;

    const userObj = allUsersList.find(u => u.id === profileId);
    const shareId = userObj?.referral_code || userObj?.share_id || '-';

    if (titleEl) titleEl.textContent = `${userName} (Share ID: ${shareId})`;
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:1rem;">लोड हो रहा है...</td></tr>`;
    modal.classList.add('active');

    // Fetch existing permissions for this user
    const res = await window.UCAS_DB.getPermissions(profileId);
    const existingPermsMap = {};
    if (res.success && Array.isArray(res.data)) {
      res.data.forEach(p => {
        existingPermsMap[p.permission_key] = Boolean(p.allowed);
      });
    }

    const allKeys = window.UCAS_PERMISSIONS.ALL_PERMISSIONS;
    const defaults = window.UCAS_PERMISSIONS.DEFAULT_USER_PERMISSIONS;

    tableBody.innerHTML = allKeys.map((permKey, i) => {
      const isAllowed = typeof existingPermsMap[permKey] !== 'undefined'
        ? existingPermsMap[permKey]
        : Boolean(defaults[permKey]);

      return `
        <tr>
          <td><strong>#${i + 1}</strong></td>
          <td>
            <code>${permKey}</code>
          </td>
          <td>
            <label style="position:relative;display:inline-block;width:44px;height:24px;">
              <input type="checkbox" ${isAllowed ? 'checked' : ''} onchange="UCAS_ADMIN.toggleUserPermission('${profileId}', '${permKey}', this.checked)" style="opacity:0;width:0;height:0;">
              <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:${isAllowed ? '#0B7A3E' : '#ccc'};border-radius:24px;transition:0.3s;" id="switch_${profileId}_${permKey}">
                <span style="position:absolute;content:'';height:18px;width:18px;left:${isAllowed ? '22px' : '3px'};bottom:3px;background-color:white;border-radius:50%;transition:0.3s;"></span>
              </span>
            </label>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function toggleUserPermission(profileId, permissionKey, allowed) {
    const spanSwitch = document.getElementById(`switch_${profileId}_${permissionKey}`);
    if (spanSwitch) {
      spanSwitch.style.backgroundColor = allowed ? '#0B7A3E' : '#ccc';
      const knob = spanSwitch.querySelector('span');
      if (knob) knob.style.left = allowed ? '22px' : '3px';
    }

    const res = await window.UCAS_DB.setPermission(profileId, permissionKey, allowed);
    if (res.success) {
      window.UCAS_APP.showToast(`अनुमति '${permissionKey}' अपडेट हो गई!`, 'success');
    } else {
      window.UCAS_APP.showToast('अनुमति अपडेट करने में त्रुटि: ' + (res.message || ''), 'error');
    }
  }

  // ==========================================
  // REAL-TIME AGGREGATED REPORTS & CATEGORY STATS
  // ==========================================

  function calculateAndRenderAdminReports() {
    const totalUsersEl = document.getElementById('ucas-rep-total-users');
    const totalSurveysEl = document.getElementById('ucas-rep-total-surveys');
    const totalContactsEl = document.getElementById('ucas-rep-total-contacts');

    if (totalUsersEl) totalUsersEl.textContent = allUsersList.length;
    if (totalSurveysEl) totalSurveysEl.textContent = allSurveysList.length;
    if (totalContactsEl) totalContactsEl.textContent = allPhonebookList.length;

    // Category-wise Breakdown
    const catCounts = {
      agriculture: 0,
      healthcare: 0,
      cattlecare: 0,
      beautycare: 0,
      haircare: 0,
      fishpoultry: 0,
      netsurf: 0,
      other: 0
    };

    allSurveysList.forEach(s => {
      const cats = Array.isArray(s.selected_categories) ? s.selected_categories : [s.selected_categories];
      cats.forEach(c => {
        if (c && typeof catCounts[c] !== 'undefined') {
          catCounts[c]++;
        } else if (c) {
          catCounts.other++;
        }
      });
    });

    const categoryBarsContainer = document.getElementById('ucas-admin-category-breakdown');
    if (!categoryBarsContainer) return;

    const totalCatHits = Math.max(1, Object.values(catCounts).reduce((a, b) => a + b, 0));

    const catLabels = {
      agriculture: '🌾 Agriculture',
      healthcare: '❤️ Health Care',
      cattlecare: '🐄 Cattle Care',
      beautycare: '💄 Beauty Care',
      haircare: '💇 Hair Care',
      fishpoultry: '🐟 Fish / Poultry',
      netsurf: '💼 NetSurf',
      other: '➕ Other Needs'
    };

    categoryBarsContainer.innerHTML = Object.entries(catCounts).map(([catKey, count]) => {
      const pct = Math.round((count / totalCatHits) * 100);
      return `
        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:600;margin-bottom:3px;">
            <span>${catLabels[catKey] || catKey}</span>
            <span>${count} (${pct}%)</span>
          </div>
          <div style="background:#E2E8F0;height:8px;border-radius:4px;overflow:hidden;">
            <div style="background:var(--primary);width:${pct}%;height:100%;border-radius:4px;transition:width 0.5s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function searchCurrentAdminTab(query) {
    const q = (query || '').toLowerCase().trim();

    if (currentAdminTab === 'users') {
      if (!q) { renderUsersRows(allUsersList); return; }
      const filtered = allUsersList.filter(u => 
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.mobile && u.mobile.includes(q)) ||
        (u.referral_code && u.referral_code.toLowerCase().includes(q)) ||
        (u.share_id && u.share_id.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );
      renderUsersRows(filtered);
    } else if (currentAdminTab === 'surveys') {
      if (!q) { renderSurveysRows(allSurveysList); return; }
      const filtered = allSurveysList.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.mobile && s.mobile.includes(q)) ||
        (s.village && s.village.toLowerCase().includes(q)) ||
        (s.district && s.district.toLowerCase().includes(q))
      );
      renderSurveysRows(filtered);
    } else if (currentAdminTab === 'phonebook') {
      if (!q) { renderPhonebookRows(allPhonebookList); return; }
      const filtered = allPhonebookList.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.mobile && c.mobile.includes(q)) ||
        (c.place && c.place.toLowerCase().includes(q))
      );
      renderPhonebookRows(filtered);
    }
  }

  window.UCAS_ADMIN = {
    init: initAdminModule,
    loadAdminData,
    switchAdminTab,
    openUserDetails,
    applyUserDetailsDateFilter,
    setThisMonthFilter,
    openPermissionsMatrix,
    toggleUserPermission,
    searchCurrentAdminTab
  };

  console.log('✅ UCAS Admin & Reporting Module (Direct Referrals + Purchase Volume + Date Filter) Ready.');
})(window);
