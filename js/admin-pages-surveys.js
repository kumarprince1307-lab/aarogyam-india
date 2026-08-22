/* Admin All Surveys Page — UCAS Real Survey Records
   Features:
   - Pagination (20 surveys per page)
   - Fixed Sticky-Header Table
   - Full Survey Details & Answers Slide-over Drawer
*/

import { initAdminLayout } from './admin-main.js';
import { fetchAllSurveys, fetchUsers } from './admin-api.js';

const PAGE_SIZE = 20;

export async function initAllSurveys() {
  initAdminLayout('All Survey Records', 'View, inspect, and filter survey records with 20-items pagination and details drawer.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let currentPage = 1;
  let allSurveysData = [];

  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-title">📋 All Survey Records Directory</div>
      <div class="admin-card admin-controls" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
        <select id="survey-user-filter" class="admin-select" style="min-width:200px;">
          <option value="all">👥 All Users</option>
        </select>
        <select id="survey-cat-filter" class="admin-select" style="min-width:160px;">
          <option value="all">📂 All Categories</option>
          <option value="agriculture">🌾 Agriculture</option>
          <option value="healthcare">🩺 Healthcare</option>
          <option value="cattlecare">🐄 Cattle Care</option>
          <option value="beautycare">✨ Beauty Care</option>
          <option value="haircare">💆 Hair Care</option>
          <option value="netsurf">🌿 Netsurf</option>
          <option value="other">📌 Other</option>
        </select>
        <select id="survey-date-filter" class="admin-select" style="min-width:140px;">
          <option value="all">📅 All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisweek">This Week</option>
          <option value="thismonth">This Month</option>
        </select>
        <input id="survey-search" type="search" placeholder="Search person, place, mobile..." class="admin-input" style="min-width:220px;" />
        <button id="survey-refresh-btn" class="admin-button small-button">🔄 Refresh</button>
      </div>
      <div id="surveys-table-container" style="margin-top:16px;">
        <div class="admin-loading">Loading surveys…</div>
      </div>
    </div>

    <!-- Side / Bottom Drawer for Survey Details -->
    <div id="survey-drawer-overlay" class="admin-drawer-overlay">
      <div class="admin-drawer">
        <div class="admin-drawer-header">
          <div class="admin-drawer-title">
            <span>📋 सर्वे संपूर्ण विवरण (Survey Details)</span>
          </div>
          <button type="button" id="survey-drawer-close" class="admin-drawer-close">&times;</button>
        </div>
        <div id="survey-drawer-body" class="admin-drawer-body"></div>
      </div>
    </div>
  `;

  const container = document.getElementById('surveys-table-container');
  const userSelect = document.getElementById('survey-user-filter');
  const catSelect = document.getElementById('survey-cat-filter');
  const dateSelect = document.getElementById('survey-date-filter');
  const searchInput = document.getElementById('survey-search');
  const refreshBtn = document.getElementById('survey-refresh-btn');

  const drawerOverlay = document.getElementById('survey-drawer-overlay');
  const drawerCloseBtn = document.getElementById('survey-drawer-close');
  const drawerBody = document.getElementById('survey-drawer-body');

  drawerCloseBtn?.addEventListener('click', () => {
    drawerOverlay?.classList.remove('active');
  });

  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('active');
  });

  // Populate users dropdown
  try {
    const uRes = await fetchUsers();
    if (uRes.success && uRes.data) {
      uRes.data.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.name || 'Unknown'} (${u.mobile || '-'})`;
        userSelect?.appendChild(opt);
      });
    }
  } catch (e) {}

  async function loadData() {
    container.innerHTML = '<div class="admin-loading">Loading survey records…</div>';

    let startDate = null;
    let endDate = null;
    const now = new Date();

    if (dateSelect.value === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (dateSelect.value === 'yesterday') {
      const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      startDate = y.toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (dateSelect.value === 'thisweek') {
      const w = new Date(now.setDate(now.getDate() - 6));
      startDate = w.toISOString();
    } else if (dateSelect.value === 'thismonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    const params = {
      userId: userSelect?.value || 'all',
      category: catSelect?.value || 'all',
      startDate,
      endDate,
      search: searchInput?.value || ''
    };

    const res = await fetchAllSurveys(params);
    if (!res.success) {
      container.innerHTML = '<div class="admin-error"><strong>Unable to load survey records.</strong></div>';
      return;
    }

    allSurveysData = res.data || [];
    currentPage = 1;
    renderTable();
  }

  function renderTable() {
    const totalSurveys = allSurveysData.length;
    const totalPages = Math.ceil(totalSurveys / PAGE_SIZE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalSurveys);
    const paginatedSurveys = allSurveysData.slice(startIndex, endIndex);

    if (totalSurveys === 0) {
      container.innerHTML = '<div class="admin-empty"><strong>No survey records matching filter.</strong></div>';
      return;
    }

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>Showing <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${totalSurveys}</strong> Surveys (20 Surveys Per Page)</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Person Name</th>
              <th>Mobile (Call / WhatsApp)</th>
              <th>Categories</th>
              <th>Place / District</th>
              <th>Submitted By User</th>
              <th>Date</th>
              <th>Drawer</th>
            </tr>
          </thead>
          <tbody>
            ${paginatedSurveys.map((s, i) => {
              const sMob = String(s.mobile || '').replace(/\D/g, '');
              const rowNum = startIndex + i + 1;
              const cats = Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : (s.selected_categories || 'agriculture');

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td><strong>${s.name}</strong></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:600;">📞 ${s.mobile}</a>
                      ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp">💬</a>` : ''}
                    </div>
                  </td>
                  <td><span class="admin-pill active" style="font-size:0.72rem;">${cats.toUpperCase()}</span></td>
                  <td>${s.village || s.district || '-'}</td>
                  <td>
                    <a href="#user-details?id=${s.profile_id}" data-route="user-details" data-id="${s.profile_id}" class="admin-subtle-link">
                      <strong>${s.owner_name}</strong>
                    </a>
                  </td>
                  <td>${s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB') : '-'}</td>
                  <td>
                    <button type="button" class="admin-button small-button btn-open-survey-drawer" data-index="${startIndex + i}" style="padding:2px 8px;font-size:0.78rem;">
                      📋 Answers
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination Bar -->
      <div class="admin-pagination-bar">
        <div class="admin-pagination-info">
          Page <strong>${currentPage}</strong> of <strong>${totalPages}</strong>
        </div>
        <div class="admin-pagination-controls">
          <button type="button" id="survey-prev-page" class="admin-button small-button" ${currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ◀ Previous
          </button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentPage} / ${totalPages}</span>
          <button type="button" id="survey-next-page" class="admin-button small-button" ${currentPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            Next ▶
          </button>
        </div>
      </div>
    `;

    // Pagination Listeners
    document.getElementById('survey-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    document.getElementById('survey-next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });

    // Open Survey Drawer Listeners
    container.querySelectorAll('.btn-open-survey-drawer').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const survey = allSurveysData[idx];
        if (!survey) return;
        openSurveyDrawer(survey);
      });
    });
  }

  function openSurveyDrawer(s) {
    if (!drawerOverlay || !drawerBody) return;
    const sMob = String(s.mobile || '').replace(/\D/g, '');
    const waUrl = sMob ? `https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}` : '#';
    const cats = Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : (s.selected_categories || 'agriculture');
    const answers = s.category_answers || {};

    drawerBody.innerHTML = `
      <div style="background:var(--admin-surface-2,#0f172a);border:1px solid var(--admin-border,#334155);border-radius:12px;padding:16px;margin-bottom:16px;">
        <div style="font-size:1.2rem;font-weight:800;color:var(--admin-text);">${s.name}</div>
        <div style="font-size:0.9rem;color:var(--admin-muted);margin-top:4px;">
          Categories: <span class="admin-pill active" style="font-size:0.75rem;">${cats.toUpperCase()}</span>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <a href="tel:${sMob}" class="admin-button small-button" style="background:#3b82f6;color:#fff;">
            📞 Call Now
          </a>
          <a href="${waUrl}" target="_blank" class="admin-button small-button" style="background:#25D366;color:#fff;">
            💬 WhatsApp
          </a>
        </div>
      </div>

      <div class="admin-data-grid" style="grid-template-columns:1fr;gap:10px;margin-bottom:16px;">
        <div class="admin-data-card"><h4>Mobile</h4><p><code>${s.mobile}</code></p></div>
        <div class="admin-data-card"><h4>Location</h4><p>${s.village || s.area || '-'}, ${s.district || '-'}, ${s.state || '-'}</p></div>
        <div class="admin-data-card"><h4>Occupation / Age / Sex</h4><p>${s.occupation || '-'} | ${s.age || '-'} Yrs | ${s.sex || '-'}</p></div>
        <div class="admin-data-card"><h4>Submitted By</h4><p><strong>${s.owner_name}</strong> (Share ID: <code>${s.owner_share_id}</code>)</p></div>
        <div class="admin-data-card"><h4>Submission Date</h4><p>${s.created_at ? new Date(s.created_at).toLocaleString('en-GB') : '-'}</p></div>
      </div>

      <div style="background:var(--admin-surface-2,#0f172a);border:1px solid var(--admin-border,#334155);border-radius:12px;padding:14px;">
        <div style="font-weight:700;color:var(--admin-text);margin-bottom:8px;font-size:0.95rem;">
          📝 Survey Form Answers:
        </div>
        ${Object.keys(answers).length === 0 ? `
          <div style="color:var(--admin-muted);font-size:0.85rem;">कोई अतिरिक्त उत्तर उपलब्ध नहीं है।</div>
        ` : `
          <div style="display:grid;gap:8px;">
            ${Object.entries(answers).map(([qKey, aVal]) => `
              <div style="background:var(--admin-surface,#1e293b);padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.05);">
                <div style="font-size:0.8rem;color:var(--admin-muted);font-weight:600;">${qKey}</div>
                <div style="font-size:0.88rem;font-weight:700;color:#10b981;margin-top:2px;">
                  ${typeof aVal === 'object' ? JSON.stringify(aVal) : String(aVal)}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    drawerOverlay.classList.add('active');
  }

  userSelect?.addEventListener('change', loadData);
  catSelect?.addEventListener('change', loadData);
  dateSelect?.addEventListener('change', loadData);
  searchInput?.addEventListener('input', loadData);
  refreshBtn?.addEventListener('click', loadData);

  await loadData();
}
