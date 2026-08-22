/* Admin All Phonebook Page — UCAS Real Contacts Management
   Features:
   - Pagination (20 contacts per page)
   - Fixed Sticky-Header Table
   - Contact Details Slide-over Drawer
*/

import { initAdminLayout } from './admin-main.js';
import { fetchAllPhonebook, fetchUsers } from './admin-api.js';

const PAGE_SIZE = 20;

export async function initAllPhonebook() {
  initAdminLayout('All Phonebook Contacts', 'View, inspect, and filter phonebook contacts with 20-items pagination and details drawer.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let currentPage = 1;
  let allContactsData = [];

  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-title">📱 All Phonebook Contacts Directory</div>
      <div class="admin-card admin-controls" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
        <select id="pb-user-filter" class="admin-select" style="min-width:200px;">
          <option value="all">👥 All Users</option>
        </select>
        <select id="pb-source-filter" class="admin-select" style="min-width:160px;">
          <option value="all">📂 All Sources</option>
          <option value="phonebook">📱 Phone Contacts</option>
          <option value="csv">📊 CSV Import</option>
          <option value="manual">✍️ Manual</option>
          <option value="survey">📋 Survey</option>
        </select>
        <input id="pb-search" type="search" placeholder="Search contact, place, or user..." class="admin-input" style="min-width:220px;" />
        <button id="pb-refresh-btn" class="admin-button small-button">🔄 Refresh</button>
      </div>
      <div id="phonebook-table-container" style="margin-top:16px;">
        <div class="admin-loading">Loading phonebook records…</div>
      </div>
    </div>

    <!-- Side / Bottom Drawer for Contact Details -->
    <div id="pb-drawer-overlay" class="admin-drawer-overlay">
      <div class="admin-drawer">
        <div class="admin-drawer-header">
          <div class="admin-drawer-title">
            <span>📱 संपर्क विवरण (Contact Details)</span>
          </div>
          <button type="button" id="pb-drawer-close" class="admin-drawer-close">&times;</button>
        </div>
        <div id="pb-drawer-body" class="admin-drawer-body"></div>
      </div>
    </div>
  `;

  const container = document.getElementById('phonebook-table-container');
  const userSelect = document.getElementById('pb-user-filter');
  const sourceSelect = document.getElementById('pb-source-filter');
  const searchInput = document.getElementById('pb-search');
  const refreshBtn = document.getElementById('pb-refresh-btn');

  const drawerOverlay = document.getElementById('pb-drawer-overlay');
  const drawerCloseBtn = document.getElementById('pb-drawer-close');
  const drawerBody = document.getElementById('pb-drawer-body');

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
    container.innerHTML = '<div class="admin-loading">Loading phonebook contacts…</div>';
    const params = {
      userId: userSelect?.value || 'all',
      source: sourceSelect?.value || 'all',
      search: searchInput?.value || ''
    };

    const res = await fetchAllPhonebook(params);
    if (!res.success) {
      container.innerHTML = '<div class="admin-error"><strong>Unable to load phonebook records.</strong></div>';
      return;
    }

    allContactsData = res.data || [];
    currentPage = 1;
    renderTable();
  }

  function renderTable() {
    const totalContacts = allContactsData.length;
    const totalPages = Math.ceil(totalContacts / PAGE_SIZE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalContacts);
    const paginatedContacts = allContactsData.slice(startIndex, endIndex);

    if (totalContacts === 0) {
      container.innerHTML = '<div class="admin-empty"><strong>No contacts found matching filter.</strong></div>';
      return;
    }

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>Showing <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${totalContacts}</strong> Contacts (20 Contacts Per Page)</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Contact Name</th>
              <th>Mobile (Call / WhatsApp)</th>
              <th>Place</th>
              <th>Source</th>
              <th>Owner User</th>
              <th>Added Date</th>
              <th>Drawer</th>
            </tr>
          </thead>
          <tbody>
            ${paginatedContacts.map((c, i) => {
              const sMob = String(c.mobile || '').replace(/\D/g, '');
              const rowNum = startIndex + i + 1;
              const srcBadge = c.source === 'phonebook'
                ? '<span class="admin-pill active">📱 Phonebook</span>'
                : c.source === 'csv'
                ? '<span class="admin-pill">📊 CSV</span>'
                : '<span class="admin-pill">✍️ Manual</span>';

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td><strong>${c.name}</strong></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:600;">📞 ${c.mobile}</a>
                      ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp">💬</a>` : ''}
                    </div>
                  </td>
                  <td>${c.place || '-'}</td>
                  <td>${srcBadge}</td>
                  <td>
                    <a href="#user-details?id=${c.profile_id}" data-route="user-details" data-id="${c.profile_id}" class="admin-subtle-link">
                      <strong>${c.owner_name}</strong>
                    </a>
                  </td>
                  <td>${c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB') : '-'}</td>
                  <td>
                    <button type="button" class="admin-button small-button btn-open-pb-drawer" data-index="${startIndex + i}" style="padding:2px 8px;font-size:0.78rem;">
                      👁️ Drawer
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
          <button type="button" id="pb-prev-page" class="admin-button small-button" ${currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ◀ Previous
          </button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentPage} / ${totalPages}</span>
          <button type="button" id="pb-next-page" class="admin-button small-button" ${currentPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            Next ▶
          </button>
        </div>
      </div>
    `;

    // Pagination Click Listeners
    document.getElementById('pb-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    document.getElementById('pb-next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });

    // Drawer Listeners
    container.querySelectorAll('.btn-open-pb-drawer').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const contact = allContactsData[idx];
        if (!contact) return;
        openContactDrawer(contact);
      });
    });
  }

  function openContactDrawer(c) {
    if (!drawerOverlay || !drawerBody) return;
    const sMob = String(c.mobile || '').replace(/\D/g, '');
    const waUrl = sMob ? `https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}` : '#';

    drawerBody.innerHTML = `
      <div style="background:var(--admin-surface-2,#0f172a);border:1px solid var(--admin-border,#334155);border-radius:12px;padding:16px;margin-bottom:16px;">
        <div style="font-size:1.2rem;font-weight:800;color:var(--admin-text);">${c.name}</div>
        <div style="font-size:0.9rem;color:var(--admin-muted);margin-top:4px;">Place: <strong>${c.place || 'N/A'}</strong></div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <a href="tel:${sMob}" class="admin-button small-button" style="background:#3b82f6;color:#fff;">
            📞 Call Now
          </a>
          <a href="${waUrl}" target="_blank" class="admin-button small-button" style="background:#25D366;color:#fff;">
            💬 WhatsApp Chat
          </a>
        </div>
      </div>

      <div class="admin-data-grid" style="grid-template-columns:1fr;gap:10px;">
        <div class="admin-data-card"><h4>Mobile</h4><p><code>${c.mobile}</code></p></div>
        <div class="admin-data-card"><h4>Source</h4><p><span class="admin-pill">${c.source || 'manual'}</span></p></div>
        <div class="admin-data-card"><h4>Owner User</h4><p><strong>${c.owner_name}</strong> (Mobile: ${c.owner_mobile})</p></div>
        <div class="admin-data-card"><h4>Owner Share ID</h4><p><code>${c.owner_share_id}</code></p></div>
        <div class="admin-data-card"><h4>Added Date</h4><p>${c.created_at ? new Date(c.created_at).toLocaleString('en-GB') : '-'}</p></div>
      </div>
    `;

    drawerOverlay.classList.add('active');
  }

  userSelect?.addEventListener('change', loadData);
  sourceSelect?.addEventListener('change', loadData);
  searchInput?.addEventListener('input', loadData);
  refreshBtn?.addEventListener('click', loadData);

  await loadData();
}
