/* Admin All User Permissions Page — 20-Permission Horizontal Matrix Table
   Exact Requirements:
   - Clean Filter Bar: Status (All/Active/Inactive), Date (All/Today/7/30), Search (Name/Mobile/Share ID), Permission Filter (20 items)
   - Horizontal Matrix Table: 1 Row Per User with all 20 Permissions across the row
   - Header Top-Left Master Checkbox (Select All)
   - Sticky User Column on Left
   - Column-level All ON / OFF buttons on each of the 20 permission headers
   - Live Real-time Supabase Sync on every toggle
   - Bottom Summary Count Bar: Total Users, Active/Inactive counts, Selected Permission ON/OFF counts
   - Strictly 20 Users Per Page Pagination
*/

import { initAdminLayout } from './admin-main.js';
import { fetchAllUserPermissions, updateUserPermissionAdmin } from './admin-api.js';

export const PERMISSIONS_20 = [
  { key: 'profile_view', label: 'Profile View', short: 'Profile View', desc: 'प्रोफाइल देखने की अनुमति', defaultOff: false },
  { key: 'profile_edit', label: 'Profile Edit', short: 'Profile Edit', desc: 'प्रोफाइल एडिट करने की अनुमति', defaultOff: false },
  { key: 'survey_access', label: 'Survey Access', short: 'Survey Acc', desc: 'सर्वे मॉड्यूल एक्सेस', defaultOff: false },
  { key: 'survey_create', label: 'Survey Create', short: 'Survey Add', desc: 'नया सर्वे सबमिट करना', defaultOff: false },
  { key: 'survey_view', label: 'Survey View', short: 'Survey View', desc: 'सर्वे रिकॉर्ड देखना', defaultOff: false },
  { key: 'phonebook_view', label: 'Phonebook View', short: 'Phone View', desc: 'फोनबुक संपर्क देखना', defaultOff: false },
  { key: 'phonebook_add', label: 'Phonebook Add', short: 'Phone Add', desc: 'नया संपर्क जोड़ना', defaultOff: false },
  { key: 'phonebook_import', label: 'Phonebook Import', short: 'Phone Imp', desc: 'फोन व CSV इम्पोर्ट', defaultOff: false },
  { key: 'marketing_view', label: 'Marketing View', short: 'Mktg View', desc: 'मार्केटिंग सेंटर देखना', defaultOff: false },
  { key: 'marketing_create', label: 'Marketing Create', short: 'Mktg Create', desc: 'मैसेज और कैंपेन बनाना', defaultOff: false },
  { key: 'landing_page_view', label: 'Landing Page View', short: 'LP View', desc: 'लैंडिंग पेज सूची देखना', defaultOff: false },
  { key: 'landing_page_create', label: 'Landing Page Create', short: 'LP Create', desc: 'नया लैंडिंग पेज बनाना', defaultOff: false },
  { key: 'landing_page_share', label: 'Landing Page Share', short: 'LP Share', desc: 'लैंडिंग पेज शेयर करना', defaultOff: false },
  { key: 'library_view', label: 'Library View', short: 'Library', desc: 'डिजिटल लाइब्रेरी एक्सेस', defaultOff: false },
  { key: 'subscription_view', label: 'Subscription View', short: 'Sub View', desc: 'सब्सक्रिप्शन विवरण देखना', defaultOff: false },
  { key: 'user_name_visible', label: 'User Name Visible', short: 'Name Vis.', desc: 'सार्वजनिक नाम प्रदर्शन (Default OFF)', defaultOff: true },
  { key: 'directory_visible', label: 'Directory Visible', short: 'Dir Vis.', desc: 'सार्वजनिक डायरेक्टरी लिस्टिंग (Default OFF)', defaultOff: true },
  { key: 'referral_mobile_visible', label: 'Ref. Mobile Visible', short: 'Ref. Mob Vis', desc: 'डायरेक्ट रेफरल मोबाइल नंबर दिखाना (View/Hide)', defaultOff: false },
  { key: 'admin_center_visible', label: 'Admin Center Page', short: 'Admin Center', desc: 'My Profile में Admin Center पेज दिखना (Default OFF)', defaultOff: true },
  { key: 'admin_permissions_manage', label: 'Admin Perms Manage', short: 'Admin Perms', desc: 'My Profile Admin Center में परमिशन ऑन/ऑफ की अनुमति (Default OFF)', defaultOff: true }
];

export const ALL_PERMISSION_KEYS = PERMISSIONS_20.map(p => p.key);
const PAGE_SIZE = 20;

function isPermAllowed(permsByUser, userId, key) {
  const uPerms = permsByUser[userId] || {};
  const permObj = PERMISSIONS_20.find(p => p.key === key);
  const isDefaultOff = permObj ? permObj.defaultOff : false;
  return typeof uPerms[key] !== 'undefined' ? Boolean(uPerms[key]) : !isDefaultOff;
}

export async function initUserPermissions() {
  initAdminLayout('All User Permissions', '20-Permission matrix with multi-filter and horizontal row controls.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let currentPage = 1;
  let cachedProfiles = [];
  let cachedPerms = {};
  let selectedUserIds = new Set();

  content.innerHTML = `
    <!-- Top Action Row -->
    <div class="admin-section" style="margin-bottom: 12px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
          <span>🛡️ All User Permissions Matrix (20 Permissions)</span>
          <span style="font-size: 0.75rem; background: rgba(16,185,129,0.15); color: #10b981; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Live Sync</span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-perm-safe-preset" class="admin-button small-button" style="background: #3b82f6; border-color: #2563eb; color: #fff; font-weight: 700;" title="सुरक्षित डिफ़ॉल्ट लागू करें">
            🛡️ Safe Default (16 ON / 4 OFF)
          </button>
          <button id="btn-perm-all-on" class="admin-button small-button" style="background: #10b981; border-color: #059669; color: #fff; font-weight: 700;" title="सभी 20 अनुमतियां चालू करें">
            👑 Full Access (All 20 ON)
          </button>
          <button id="btn-perm-all-off" class="admin-button small-button" style="background: #ef4444; border-color: #dc2626; color: #fff; font-weight: 700;" title="सभी अनुमतियां बंद करें">
            ✕ All 20 OFF
          </button>
        </div>
      </div>

      <!-- Multi-Filter Controls Bar -->
      <div class="admin-card admin-controls" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 10px; background: var(--admin-surface-2, #0f172a);">
        <!-- 1. Search Box -->
        <input id="perm-search-box" type="search" placeholder="🔍 नाम, मोबाइल या Share ID से खोजें..." class="admin-input" style="flex: 2; min-width: 220px;" />

        <!-- 2. Status Filter -->
        <select id="perm-status-dropdown" class="admin-select" style="flex: 1; min-width: 160px;">
          <option value="all">👥 All Statuses (सभी)</option>
          <option value="active">🟢 Active / Subscriber</option>
          <option value="inactive">🔴 Inactive / Unsubscriber</option>
        </select>

        <!-- 3. Date Filter -->
        <select id="perm-date-dropdown" class="admin-select" style="flex: 1; min-width: 140px;">
          <option value="all">📅 All Time (सभी दिन)</option>
          <option value="today">Today (आज)</option>
          <option value="7days">Last 7 Days (7 दिन)</option>
          <option value="30days">Last 30 Days (30 दिन)</option>
        </select>

        <!-- 4. Permission Filter -->
        <select id="perm-key-dropdown" class="admin-select" style="flex: 1.5; min-width: 200px;">
          <option value="all">🛡️ All 20 Permissions</option>
          ${PERMISSIONS_20.map((p, i) => `<option value="${p.key}">#${i + 1} ${p.label} ${p.defaultOff ? '(Default OFF)' : ''}</option>`).join('')}
        </select>

        <button id="perm-refresh-data-btn" class="admin-button small-button">🔄 Refresh</button>
      </div>

      <!-- Bulk Actions Bar for Checked Users -->
      <div id="perm-bulk-bar" style="display: none; align-items: center; justify-content: space-between; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 8px 14px; margin-top: 10px;">
        <div style="font-size: 0.9rem; font-weight: 700; color: #60a5fa;">
          <span id="bulk-selected-count">0</span> यूजर सेलेक्ट किए गए हैं
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" id="btn-bulk-turn-on" class="admin-button small-button" style="background: #10b981; color: #fff; font-size: 0.78rem;">
            ✓ सेलेक्टेड यूजर्स को All ON करें
          </button>
          <button type="button" id="btn-bulk-turn-off" class="admin-button small-button" style="background: #ef4444; color: #fff; font-size: 0.78rem;">
            ✕ सेलेक्टेड यूजर्स को All OFF करें
          </button>
          <button type="button" id="btn-bulk-safe" class="admin-button small-button" style="background: #3b82f6; color: #fff; font-size: 0.78rem;">
            🛡️ Safe Default लागू करें
          </button>
        </div>
      </div>
    </div>

    <!-- 20-Permission Horizontal Matrix Container -->
    <div id="permissions-matrix-wrapper" style="margin-top: 8px;">
      <div class="admin-loading">डेटाबेस से 20 परमिशन मैट्रिक्स लोड हो रही है…</div>
    </div>

    <!-- Live Toast Notification -->
    <div id="perm-toast-box" style="position: fixed; bottom: 24px; right: 24px; background: #10b981; color: #fff; padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 10px 25px rgba(0,0,0,0.4); display: none; z-index: 99999; align-items: center; gap: 8px;">
      <span>✓</span> <span id="toast-text">Permission Updated</span>
    </div>
  `;

  const matrixContainer = document.getElementById('permissions-matrix-wrapper');
  const searchInput = document.getElementById('perm-search-box');
  const statusDropdown = document.getElementById('perm-status-dropdown');
  const dateDropdown = document.getElementById('perm-date-dropdown');
  const permDropdown = document.getElementById('perm-key-dropdown');
  const refreshBtn = document.getElementById('perm-refresh-data-btn');

  const bulkBar = document.getElementById('perm-bulk-bar');
  const bulkCountSpan = document.getElementById('bulk-selected-count');
  const btnBulkOn = document.getElementById('btn-bulk-turn-on');
  const btnBulkOff = document.getElementById('btn-bulk-turn-off');
  const btnBulkSafe = document.getElementById('btn-bulk-safe');

  const btnPermSafe = document.getElementById('btn-perm-safe-preset');
  const btnPermAllOn = document.getElementById('btn-perm-all-on');
  const btnPermAllOff = document.getElementById('btn-perm-all-off');

  const toastBox = document.getElementById('perm-toast-box');
  const toastText = document.getElementById('toast-text');

  function showToast(msg) {
    if (!toastBox || !toastText) return;
    toastText.textContent = msg;
    toastBox.style.display = 'flex';
    setTimeout(() => { toastBox.style.display = 'none'; }, 2000);
  }

  async function loadData() {
    matrixContainer.innerHTML = '<div class="admin-loading">Loading permissions from database…</div>';
    const res = await fetchAllUserPermissions();
    if (!res.success) {
      matrixContainer.innerHTML = '<div class="admin-error"><strong>Unable to load permissions.</strong></div>';
      return;
    }

    cachedProfiles = res.data.profiles || [];
    cachedPerms = res.data.permsByUser || {};

    currentPage = 1;
    selectedUserIds.clear();
    updateBulkBar();
    renderMatrix();
  }

  function getFilteredUsers() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const statusVal = statusDropdown.value;
    const dateVal = dateDropdown.value;

    const now = new Date();

    return cachedProfiles.filter(u => {
      // 1. Status Filter
      const isActive = u.is_active || u.status === 'active';
      if (statusVal === 'active' && !isActive) return false;
      if (statusVal === 'inactive' && isActive) return false;

      // 2. Date Filter
      if (dateVal !== 'all' && u.created_at) {
        const uDate = new Date(u.created_at);
        if (dateVal === 'today') {
          const isToday = uDate.toDateString() === now.toDateString();
          if (!isToday) return false;
        } else if (dateVal === '7days') {
          const diffDays = (now - uDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        } else if (dateVal === '30days') {
          const diffDays = (now - uDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      }

      // 3. Search Filter
      if (query) {
        const name = (u.full_name || '').toLowerCase();
        const mob = String(u.mobile || '');
        const shareId = (u.share_id || u.referral_token || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        if (!name.includes(query) && !mob.includes(query) && !shareId.includes(query) && !email.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  function updateBulkBar() {
    if (selectedUserIds.size > 0) {
      bulkBar.style.display = 'flex';
      bulkCountSpan.textContent = selectedUserIds.size;
    } else {
      bulkBar.style.display = 'none';
    }
  }

  function renderMatrix() {
    const filteredUsers = getFilteredUsers();
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / PAGE_SIZE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalUsers);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const selectedPermKey = permDropdown.value;

    // Calculate counts for bottom summary
    let onCount = 0;
    let offCount = 0;
    let activeUsersCount = 0;
    let inactiveUsersCount = 0;

    filteredUsers.forEach(u => {
      const isActive = u.is_active || u.status === 'active';
      if (isActive) activeUsersCount++; else inactiveUsersCount++;

      if (selectedPermKey !== 'all') {
        const allowed = isPermAllowed(cachedPerms, u.id, selectedPermKey);
        if (allowed) onCount++; else offCount++;
      }
    });

    if (totalUsers === 0) {
      matrixContainer.innerHTML = '<div class="admin-empty"><strong>कोई यूजर नहीं मिला।</strong><br>कृपया सर्च या फ़िल्टर बदलें।</div>';
      return;
    }

    const allPageSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.has(u.id));

    matrixContainer.innerHTML = `
      <div class="matrix-table-container">
        <table class="matrix-table">
          <thead>
            <tr>
              <!-- Master Select All Checkbox Header -->
              <th style="width: 40px; text-align: center; position: sticky; left: 0; z-index: 25; background: var(--admin-surface-2, #0f172a); border-right: 1px solid var(--admin-border);">
                <input type="checkbox" id="header-select-all-users" ${allPageSelected ? 'checked' : ''} style="cursor: pointer; transform: scale(1.2);" title="इस पेज के सभी यूजर्स को सेलेक्ट करें">
              </th>
              
              <!-- Sticky User Column Header -->
              <th class="sticky-col-user" style="left: 40px; z-index: 24;">
                User Name & Share ID
              </th>

              <th style="min-width: 130px;">Contact (Call/WA)</th>
              <th style="min-width: 90px;">Status</th>

              <!-- 20 Horizontal Permission Column Headers with Column-wise All ON/OFF -->
              ${PERMISSIONS_20.map((p, idx) => {
                const isSelectedPerm = selectedPermKey === p.key;
                return `
                  <th style="min-width: 100px; max-width: 120px; ${isSelectedPerm ? 'background: rgba(59,130,246,0.25); border: 2px solid #3b82f6;' : ''}" title="${p.desc}">
                    <div style="font-weight: 800; font-size: 0.72rem; color: ${p.defaultOff ? '#f59e0b' : 'var(--admin-text)'};">
                      #${idx + 1} ${p.short}
                    </div>
                    <div style="font-size: 0.65rem; color: var(--admin-muted); margin-bottom: 4px;"><code>${p.key}</code></div>
                    <div style="display: flex; gap: 2px; justify-content: center;">
                      <button type="button" class="btn-col-toggle-on perm-col-header-btn" data-perm-key="${p.key}" title="इस कॉलम के सभी यूजर्स को ON करें">
                        ✓ ON
                      </button>
                      <button type="button" class="btn-col-toggle-off perm-col-header-btn" data-perm-key="${p.key}" title="इस कॉलम के सभी यूजर्स को OFF करें">
                        ✕ OFF
                      </button>
                    </div>
                  </th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${paginatedUsers.map((u, rowIdx) => {
              const isChecked = selectedUserIds.has(u.id);
              const sMob = String(u.mobile || '').replace(/\D/g, '');
              const rowNum = startIndex + rowIdx + 1;
              const isActive = u.is_active || u.status === 'active';

              return `
                <tr>
                  <!-- Row Select Checkbox -->
                  <td style="position: sticky; left: 0; z-index: 6; background: var(--admin-surface, #1e293b); text-align: center; border-right: 1px solid var(--admin-border);">
                    <input type="checkbox" class="row-user-checkbox" data-user-id="${u.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; transform: scale(1.15);">
                  </td>

                  <!-- Sticky User Column -->
                  <td class="sticky-col-user" style="left: 40px; z-index: 5;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 0.75rem; font-weight: 700; color: var(--admin-muted);">#${rowNum}</span>
                      <div>
                        <a href="#user-details?id=${u.id}" data-route="user-details" data-id="${u.id}" class="admin-subtle-link" style="font-weight: 700; font-size: 0.88rem;">
                          ${u.full_name || 'Unknown'}
                        </a>
                        <div style="font-size: 0.72rem; color: var(--admin-muted);">
                          Share ID: <code style="color: var(--admin-primary);">${u.share_id || u.referral_token || 'AI000000'}</code>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Mobile & WhatsApp -->
                  <td>
                    <div style="display: flex; align-items: center; gap: 4px; justify-content: center;">
                      <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight: 600; font-size: 0.8rem;">📞 ${u.mobile || '-'}</a>
                      ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 5px;font-size:0.7rem;" title="WhatsApp">💬</a>` : ''}
                    </div>
                  </td>

                  <!-- Status -->
                  <td>
                    <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${isActive ? '#10b981' : '#ef4444'};">
                      ${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}
                    </span>
                  </td>

                  <!-- 20 Horizontal Permission Checkboxes for This User Row -->
                  ${PERMISSIONS_20.map(p => {
                    const allowed = isPermAllowed(cachedPerms, u.id, p.key);
                    const isSelectedPerm = selectedPermKey === p.key;

                    return `
                      <td style="${isSelectedPerm ? 'background: rgba(59,130,246,0.15);' : ''}">
                        <label style="display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 4px;" title="${p.label}: ${allowed ? 'ON' : 'OFF'} (${p.desc})">
                          <input type="checkbox" class="matrix-perm-toggle" data-user-id="${u.id}" data-perm-key="${p.key}" ${allowed ? 'checked' : ''}>
                        </label>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Real-time Summary Count Bar at Bottom & Pagination -->
      <div style="background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px 16px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; font-size: 0.85rem;">
          <div>👥 कुल यूजर्स (Total): <strong style="color: var(--admin-text);">${totalUsers}</strong></div>
          <div>🟢 Active / Subscribers: <strong style="color: #10b981;">${activeUsersCount}</strong></div>
          <div>🔴 Inactive / Unsubscribers: <strong style="color: #ef4444;">${inactiveUsersCount}</strong></div>
          
          ${selectedPermKey !== 'all' ? `
            <div style="border-left: 2px solid var(--admin-border); padding-left: 14px;">
              🛡️ Selected Permission (<strong><code>${selectedPermKey}</code></strong>): 
              <span style="color: #10b981; font-weight: 800; margin-left: 4px;">ON: ${onCount}</span> | 
              <span style="color: #ef4444; font-weight: 800; margin-left: 4px;">OFF: ${offCount}</span>
            </div>
          ` : ''}
        </div>

        <!-- 20-Item Pagination Controls -->
        <div class="admin-pagination-controls">
          <button type="button" id="matrix-prev-page" class="admin-button small-button" ${currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ◀ Previous
          </button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">Page ${currentPage} of ${totalPages} (20 Users/Page)</span>
          <button type="button" id="matrix-next-page" class="admin-button small-button" ${currentPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            Next ▶
          </button>
        </div>
      </div>
    `;

    // 1. Header Select All Checkbox
    document.getElementById('header-select-all-users')?.addEventListener('change', (e) => {
      const isAll = e.target.checked;
      paginatedUsers.forEach(u => {
        if (isAll) selectedUserIds.add(u.id);
        else selectedUserIds.delete(u.id);
      });
      updateBulkBar();
      renderMatrix();
    });

    // 2. Individual Row Select Checkboxes
    matrixContainer.querySelectorAll('.row-user-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const uId = e.target.dataset.userId;
        if (e.target.checked) selectedUserIds.add(uId);
        else selectedUserIds.delete(uId);
        updateBulkBar();
      });
    });

    // 3. Pagination Listeners
    document.getElementById('matrix-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderMatrix(); }
    });
    document.getElementById('matrix-next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderMatrix(); }
    });

    // 4. In-cell Checkbox Toggles (Instant Real-time Sync)
    matrixContainer.querySelectorAll('.matrix-perm-toggle').forEach(input => {
      input.addEventListener('change', async (e) => {
        const uId = e.target.dataset.userId;
        const key = e.target.dataset.permKey;
        const allowed = e.target.checked;

        if (!cachedPerms[uId]) cachedPerms[uId] = {};
        cachedPerms[uId][key] = allowed;

        await updateUserPermissionAdmin(uId, key, allowed);
        showToast(`'${key}' set to ${allowed ? 'ON' : 'OFF'}`);
      });
    });

    // 5. Column-level All ON / OFF Buttons
    matrixContainer.querySelectorAll('.btn-col-toggle-on').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.permKey;
        for (const u of paginatedUsers) {
          if (!cachedPerms[u.id]) cachedPerms[u.id] = {};
          cachedPerms[u.id][key] = true;
          await updateUserPermissionAdmin(u.id, key, true);
        }
        showToast(`Column '${key}' set to ON for current page`);
        renderMatrix();
      });
    });

    matrixContainer.querySelectorAll('.btn-col-toggle-off').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.permKey;
        for (const u of paginatedUsers) {
          if (!cachedPerms[u.id]) cachedPerms[u.id] = {};
          cachedPerms[u.id][key] = false;
          await updateUserPermissionAdmin(u.id, key, false);
        }
        showToast(`Column '${key}' set to OFF for current page`);
        renderMatrix();
      });
    });
  }

  // Bulk Actions for Selected Rows
  btnBulkOn?.addEventListener('click', async () => {
    if (selectedUserIds.size === 0) return;
    btnBulkOn.disabled = true;
    for (const uId of selectedUserIds) {
      if (!cachedPerms[uId]) cachedPerms[uId] = {};
      for (const k of ALL_PERMISSION_KEYS) {
        cachedPerms[uId][k] = true;
        await updateUserPermissionAdmin(uId, k, true);
      }
    }
    btnBulkOn.disabled = false;
    showToast(`All 20 permissions turned ON for ${selectedUserIds.size} users`);
    renderMatrix();
  });

  btnBulkOff?.addEventListener('click', async () => {
    if (selectedUserIds.size === 0) return;
    btnBulkOff.disabled = true;
    for (const uId of selectedUserIds) {
      if (!cachedPerms[uId]) cachedPerms[uId] = {};
      for (const k of ALL_PERMISSION_KEYS) {
        cachedPerms[uId][k] = false;
        await updateUserPermissionAdmin(uId, k, false);
      }
    }
    btnBulkOff.disabled = false;
    showToast(`All 20 permissions turned OFF for ${selectedUserIds.size} users`);
    renderMatrix();
  });

  btnBulkSafe?.addEventListener('click', async () => {
    if (selectedUserIds.size === 0) return;
    btnBulkSafe.disabled = true;
    for (const uId of selectedUserIds) {
      if (!cachedPerms[uId]) cachedPerms[uId] = {};
      for (const p of PERMISSIONS_20) {
        const val = !p.defaultOff;
        cachedPerms[uId][p.key] = val;
        await updateUserPermissionAdmin(uId, p.key, val);
      }
    }
    btnBulkSafe.disabled = false;
    showToast(`Safe default applied to ${selectedUserIds.size} users`);
    renderMatrix();
  });

  // Top Global Header Action Buttons
  btnPermSafe?.addEventListener('click', async () => {
    const filtered = getFilteredUsers();
    if (!confirm(`क्या आप फ़िल्टर किए गए सभी ${filtered.length} यूजर्स पर "Safe Default" (16 ON / 4 OFF) लागू करना चाहते हैं?`)) return;
    btnPermSafe.disabled = true;
    btnPermSafe.textContent = 'लागू हो रहा है...';

    for (const u of filtered) {
      if (!cachedPerms[u.id]) cachedPerms[u.id] = {};
      for (const p of PERMISSIONS_20) {
        const val = !p.defaultOff;
        cachedPerms[u.id][p.key] = val;
        await updateUserPermissionAdmin(u.id, p.key, val);
      }
    }

    btnPermSafe.disabled = false;
    btnPermSafe.textContent = '🛡️ Safe Default (16 ON / 4 OFF)';
    showToast('Safe Default लागू किया गया');
    renderMatrix();
  });

  btnPermAllOn?.addEventListener('click', async () => {
    const filtered = getFilteredUsers();
    if (!confirm(`क्या आप सभी ${filtered.length} यूजर्स की सभी 20 अनुमतियां चालू करना चाहते हैं?`)) return;
    btnPermAllOn.disabled = true;
    btnPermAllOn.textContent = 'चालू हो रहा है...';

    for (const u of filtered) {
      if (!cachedPerms[u.id]) cachedPerms[u.id] = {};
      for (const k of ALL_PERMISSION_KEYS) {
        cachedPerms[u.id][k] = true;
        await updateUserPermissionAdmin(u.id, k, true);
      }
    }

    btnPermAllOn.disabled = false;
    btnPermAllOn.textContent = '👑 Full Access (All 20 ON)';
    showToast('सभी 20 अनुमतियां चालू की गईं');
    renderMatrix();
  });

  btnPermAllOff?.addEventListener('click', async () => {
    const filtered = getFilteredUsers();
    if (!confirm(`चेतावनी: क्या आप सभी ${filtered.length} यूजर्स की सभी 20 अनुमतियां बंद करना चाहते हैं?`)) return;
    btnPermAllOff.disabled = true;
    btnPermAllOff.textContent = 'बंद हो रहा है...';

    for (const u of filtered) {
      if (!cachedPerms[u.id]) cachedPerms[u.id] = {};
      for (const k of ALL_PERMISSION_KEYS) {
        cachedPerms[u.id][k] = false;
        await updateUserPermissionAdmin(u.id, k, false);
      }
    }

    btnPermAllOff.disabled = false;
    btnPermAllOff.textContent = '✕ All 20 OFF';
    showToast('सभी अनुमतियां बंद कर दी गईं');
    renderMatrix();
  });

  // Filter Event Listeners
  searchInput?.addEventListener('input', () => { currentPage = 1; renderMatrix(); });
  statusDropdown?.addEventListener('change', () => { currentPage = 1; renderMatrix(); });
  dateDropdown?.addEventListener('change', () => { currentPage = 1; renderMatrix(); });
  permDropdown?.addEventListener('change', () => { currentPage = 1; renderMatrix(); });
  refreshBtn?.addEventListener('click', loadData);

  await loadData();
}
