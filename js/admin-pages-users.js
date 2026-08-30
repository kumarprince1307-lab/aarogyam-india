/* Admin Users Page */

import { initAdminLayout } from './admin-main.js';
import { fetchUsers, updateUserStatus, batchUpdateUserStatuses } from './admin-api.js';

let currentUsersData = []; // Store current user data for export

function renderUserRow(user) {
  const sanitizedMobile = String(user.mobile || '').replace(/\D/g, '');
  const mobileLink = sanitizedMobile 
    ? `<a href="tel:${sanitizedMobile}" class="admin-subtle-link" style="font-weight:600;" title="Call"><span style="margin-right:2px;">📞</span>${user.mobile}</a>` 
    : (user.mobile || 'N/A');

  let whatsappButtonHTML = '';
  if (sanitizedMobile) {
      let whatsappNumber = sanitizedMobile;
      if (whatsappNumber.length === 10) {
          whatsappNumber = '91' + whatsappNumber;
      }
      const customerName = user.name || 'Customer';
      const message = `नमस्ते ${customerName} जी, मैं आरोग्यम इंडिया से बात कर रहा हूँ।`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      whatsappButtonHTML = `<a href="${whatsappUrl}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;border-color:#22c55e;padding:2px 8px;border-radius:4px;" title="WhatsApp">💬</a>`;
  }

  const isSub = user.status === 'active' || user.totalPurchases > 0;

  return `
    <tr>
      <td>
        <div class="admin-user-name">${user.name}</div>
        <div class="admin-user-email">${user.email || ''}</div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          ${mobileLink}
          ${whatsappButtonHTML}
        </div>
      </td>
      <td>
        ${user.appInstalled 
          ? `<span class="admin-pill active" title="${user.appInstalledAt ? 'Installed: ' + user.appInstalledAt : 'App Installed'}" style="white-space:nowrap; display:inline-flex; align-items:center; gap:3px;">📱 Installed</span>` 
          : `<span class="admin-pill" style="opacity:0.65; white-space:nowrap; display:inline-flex; align-items:center; gap:3px;">🌐 Web Only</span>`
        }
      </td>
      <td>${user.source || 'N/A'}</td>
      <td><a href="#user-details?id=${user.id}" data-route="user-details" data-id="${user.id}" class="admin-subtle-link"><strong>${user.shareId || 'N/A'}</strong></a></td>
      <td>
        <button 
          type="button" 
          class="admin-button small-button btn-user-wb-report" 
          data-user-id="${user.id}" 
          style="background:rgba(37,99,235,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.35); font-weight:800; font-size:0.75rem; padding:4px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; cursor:pointer; white-space:nowrap;"
          title="वेबिनार रिपोर्ट और रजिस्टर्ड किसान देखें"
        >
          <span>🎥</span>
          <span>${user.webinarLeads || 0} Leads</span>
          ${user.webinarJoined > 0 ? `<span style="background:#10b981; color:#fff; border-radius:10px; padding:1px 5px; font-size:0.68rem; font-weight:800;">${user.webinarJoined} Live</span>` : ''}
        </button>
      </td>
      <td>${user.directReferrals || 0}</td>
      <td>${user.totalShares || 0}</td>
      <td>${user.totalClicks || 0}</td>
      <td>${user.totalVisitors || 0}</td>
      <td>${user.totalDirectPurchases || 0}</td>
      <td>${user.totalPurchases || 0}</td>
      <td>₹${(user.totalSpent || 0).toLocaleString('en-IN')}</td>
      <td>${user.totalDownloads || 0} / ${user.downloadLimit || 0}</td>
      <td>
        <span style="font-size:0.75rem;font-weight:800;padding:2px 6px;border-radius:4px;background:${isSub ? '#FEF3C7' : '#F1F5F9'};color:${isSub ? '#92400E' : '#64748B'};">
          ${isSub ? 'YES' : 'NO'}
        </span>
      </td>
      <td>
        <button 
          class="admin-button small-button admin-status-toggle ${user.status.toLowerCase()}"
          data-user-id="${user.id}"
          data-current-status="${user.status.toLowerCase()}"
          title="Click to toggle status"
          style="font-weight:700;"
        >
          ${user.status.toUpperCase()}
        </button>
      </td>
      <td>
        <div style="display: flex; gap: 8px; align-items: center;">
            <a href="#user-details?id=${user.id}" data-route="user-details" data-id="${user.id}" class="admin-button small-button">View</a>
        </div>
      </td>
    </tr>
  `;
}

const PAGE_SIZE = 20;
let currentUsersPage = 1;

function renderUsersTable(users) {
  if (!users || users.length === 0) {
    return '<div class="admin-empty"><strong>No users found.</strong><br>Try a different search or filter.</div>';
  }

  const totalUsers = users.length;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE) || 1;

  if (currentUsersPage > totalPages) currentUsersPage = totalPages;
  if (currentUsersPage < 1) currentUsersPage = 1;

  const startIndex = (currentUsersPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalUsers);
  const paginatedUsers = users.slice(startIndex, endIndex);

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
      <span>Showing <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${totalUsers}</strong> Users (20 Users Per Page)</span>
    </div>

    <div class="admin-table-wrapper sticky-header-table">
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>App Status</th>
            <th>Reg. Source</th>
            <th>Share ID</th>
            <th style="background: rgba(37,99,235,0.15); color: #60a5fa; white-space: nowrap;">🎥 Webinar Report</th>
            <th>Direct Referrals</th>
            <th>Total Shares</th>
            <th>Total Clicks</th>
            <th>Total Visitors</th>
            <th>Total Direct Purchases</th>
            <th>Total Purchases</th>
            <th>Total Spent</th>
            <th>Downloads (Used/Limit)</th>
            <th>Subscriber</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${paginatedUsers.map((u, idx) => {
            const sanitizedMobile = String(u.mobile || '').replace(/\D/g, '');
            const mobileLink = sanitizedMobile 
              ? `<a href="tel:${sanitizedMobile}" class="admin-subtle-link" style="font-weight:600;" title="Call"><span style="margin-right:2px;">📞</span>${u.mobile}</a>` 
              : (u.mobile || 'N/A');

            let whatsappButtonHTML = '';
            if (sanitizedMobile) {
                let whatsappNumber = sanitizedMobile;
                if (whatsappNumber.length === 10) {
                    whatsappNumber = '91' + whatsappNumber;
                }
                const customerName = u.name || 'Customer';
                const message = `नमस्ते ${customerName} जी, मैं आरोग्यम इंडिया से बात कर रहा हूँ।`;
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
                whatsappButtonHTML = `<a href="${whatsappUrl}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;border-color:#22c55e;padding:2px 8px;border-radius:4px;" title="WhatsApp">💬</a>`;
            }

            const isSub = u.status === 'active' || u.totalPurchases > 0;
            const rowNum = startIndex + idx + 1;

            return `
              <tr>
                <td><strong>#${rowNum}</strong></td>
                <td>
                  <div class="admin-user-name">${u.name}</div>
                  <div class="admin-user-email">${u.email || ''}</div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px;">
                    ${mobileLink}
                    ${whatsappButtonHTML}
                  </div>
                </td>
                <td>
                  ${u.appInstalled 
                    ? `<span class="admin-pill active" title="${u.appInstalledAt ? 'Installed: ' + u.appInstalledAt : 'App Installed'}" style="white-space:nowrap; display:inline-flex; align-items:center; gap:3px;">📱 Installed</span>` 
                    : `<span class="admin-pill" style="opacity:0.65; white-space:nowrap; display:inline-flex; align-items:center; gap:3px;">🌐 Web Only</span>`
                  }
                </td>
                <td>${u.source || 'N/A'}</td>
                <td><a href="#user-details?id=${u.id}" data-route="user-details" data-id="${u.id}" class="admin-subtle-link"><strong>${u.shareId || 'N/A'}</strong></a></td>
                <td>
                  <button 
                    type="button" 
                    class="admin-button small-button btn-user-wb-report" 
                    data-user-id="${u.id}" 
                    style="background:rgba(37,99,235,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.35); font-weight:800; font-size:0.75rem; padding:4px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; cursor:pointer; white-space:nowrap;"
                    title="वेबिनार रिपोर्ट और रजिस्टर्ड किसान देखें"
                  >
                    <span>🎥</span>
                    <span>${u.webinarLeads || 0} Leads</span>
                    ${u.webinarJoined > 0 ? `<span style="background:#10b981; color:#fff; border-radius:10px; padding:1px 5px; font-size:0.68rem; font-weight:800;">${u.webinarJoined} Live</span>` : ''}
                  </button>
                </td>
                <td>${u.directReferrals || 0}</td>
                <td>${u.totalShares || 0}</td>
                <td>${u.totalClicks || 0}</td>
                <td>${u.totalVisitors || 0}</td>
                <td>${u.totalDirectPurchases || 0}</td>
                <td>${u.totalPurchases || 0}</td>
                <td>₹${(u.totalSpent || 0).toLocaleString('en-IN')}</td>
                <td>${u.totalDownloads || 0} / ${u.downloadLimit || 0}</td>
                <td>
                  <span style="font-size:0.75rem;font-weight:800;padding:2px 6px;border-radius:4px;background:${isSub ? '#FEF3C7' : '#F1F5F9'};color:${isSub ? '#92400E' : '#64748B'};">
                    ${isSub ? 'YES' : 'NO'}
                  </span>
                </td>
                <td>
                  <button 
                    class="admin-button small-button admin-status-toggle ${u.status.toLowerCase()}"
                    data-user-id="${u.id}"
                    data-current-status="${u.status.toLowerCase()}"
                    title="Click to toggle status"
                    style="font-weight:700;"
                  >
                    ${u.status.toUpperCase()}
                  </button>
                </td>
                <td>
                  <div style="display: flex; gap: 6px; align-items: center;">
                      <a href="#user-details?id=${u.id}" data-route="user-details" data-id="${u.id}" class="admin-button small-button">View</a>
                      <a href="#user-permissions?userId=${u.id}" data-route="user-permissions" data-id="${u.id}" class="admin-button small-button" style="background:#0F172A;color:#FBBF24;border:1px solid #F59E0B;" title="Manage Granular Media & Platform Permissions">🔒 Perms</a>
                  </div>
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
        Page <strong>${currentUsersPage}</strong> of <strong>${totalPages}</strong>
      </div>
      <div class="admin-pagination-controls">
        <button type="button" id="users-prev-page" class="admin-button small-button" ${currentUsersPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          ◀ Previous
        </button>
        <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentUsersPage} / ${totalPages}</span>
        <button type="button" id="users-next-page" class="admin-button small-button" ${currentUsersPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          Next ▶
        </button>
      </div>
    </div>
  `;
}

export async function initUsers() {
  initAdminLayout('Users', 'Customer profiles, referral sources, media services and user status.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-section">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
        <div class="admin-section-title" style="margin:0;">All Users</div>
        <a href="#user-permissions" data-route="user-permissions" class="admin-button" style="background:linear-gradient(135deg, #1E293B 0%, #0F172A 100%);color:#FBBF24;border:1.5px solid #F59E0B;display:inline-flex;align-items:center;gap:6px;font-weight:800;text-decoration:none;padding:8px 14px;border-radius:8px;">
          <span>🛡️</span> All User Permissions Matrix
        </a>
      </div>
      <div class="admin-card admin-controls">
        <input id="user-search" type="search" placeholder="🔍 नाम, मोबाइल, Share ID (e.g. AI639559), या ईमेल से खोजें..." class="admin-input" style="flex: 2; min-width: 260px;" />
        <input id="user-reg-date-filter" type="date" title="Filter by registration date" class="admin-input" />
        <select id="user-status-filter" class="admin-select">
          <option value="all">All statuses</option>
          <option value="installed">📱 App Installed</option>
          <option value="web">🌐 Web Only</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select id="user-sort-filter" class="admin-select">
          <option value="default">Sort by Registration Date</option>
          <option value="directReferrals">Direct Referrals (High-Low)</option>
          <option value="totalShares">Total Shares (High-Low)</option>
          <option value="totalClicks">Total Clicks (High-Low)</option>
          <option value="totalVisitors">Total Visitors (High-Low)</option>
          <option value="totalDirectPurchases">Total Direct Purchases (High-Low)</option>
          <option value="totalPurchases">Total Purchases (High-Low)</option>
          <option value="totalSpent">Total Spent (High-Low)</option>
          <option value="totalDownloads">Total Downloads (High-Low)</option>
        </select>
        <button id="export-csv-btn" class="admin-button">Export CSV</button>
      </div>
      <div id="users-table" style="margin-top:12px;"></div>
    </div>
  `;

  const container = document.getElementById('users-table');
  const searchInput = document.getElementById('user-search');
  const statusSelect = document.getElementById('user-status-filter');
  const dateInput = document.getElementById('user-reg-date-filter');
  const sortSelect = document.getElementById('user-sort-filter');
  const exportBtn = document.getElementById('export-csv-btn');

  if (!container) return;

  // Read URL query parameters (e.g. #users?status=active)
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex !== -1) {
    const urlParams = new URLSearchParams(hash.substring(qIndex));
    const statusParam = urlParams.get('status');
    if (statusParam && statusSelect) {
      statusSelect.value = statusParam;
    }
  }

  async function reload(queryFromEvent) {
    container.innerHTML = '<div class="admin-loading">Loading users…</div>';
    const params = { 
      query: (queryFromEvent !== undefined) ? queryFromEvent : (searchInput?.value || ''), 
      status: statusSelect?.value || 'all',
      registrationDate: dateInput?.value || null
    };
    const result = await fetchUsers(params);

    let users = result.success ? result.data : [];

    // Client-side sorting
    const sortValue = sortSelect?.value;
    if (sortValue && sortValue !== 'default' && users.length > 0) {
        users.sort((a, b) => (b[sortValue] || 0) - (a[sortValue] || 0));
    }

    currentUsersData = users; // Store for CSV export
    renderTableWithPagination();
  }

  function renderTableWithPagination() {
    container.innerHTML = renderUsersTable(currentUsersData);

    document.getElementById('users-prev-page')?.addEventListener('click', () => {
      if (currentUsersPage > 1) {
        currentUsersPage--;
        renderTableWithPagination();
      }
    });

    document.getElementById('users-next-page')?.addEventListener('click', () => {
      const totalPages = Math.ceil(currentUsersData.length / PAGE_SIZE) || 1;
      if (currentUsersPage < totalPages) {
        currentUsersPage++;
        renderTableWithPagination();
      }
    });
  }

  function exportToCsv() {
    if (currentUsersData.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = [
        "Name", "Mobile", "Reg. Source", "Share ID", "Direct Referrals", 
        "Total Shares", "Total Clicks", "Total Visitors", "Total Direct Purchases", 
        "Total Purchases", "Total Spent", "Total Downloads", "Download Limit", "Status", "Registration Date"
    ];
    const rows = currentUsersData.map(user => [
        `"${(user.name || '').replace(/"/g, '""')}"`,
        `"${user.mobile || ''}"`,
        `"${user.source || ''}"`,
        `"${user.shareId || ''}"`,
        user.directReferrals || 0,
        user.totalShares || 0,
        user.totalClicks || 0,
        user.totalVisitors || 0,
        user.totalDirectPurchases || 0,
        user.totalPurchases || 0,
        user.totalSpent || 0,
        user.totalDownloads || 0,
        user.downloadLimit || 0,
        `"${user.status || ''}"`,
        `"${user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('en-CA') : ''}"` // YYYY-MM-DD
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `aarogyam_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (searchInput) searchInput.addEventListener('input', () => { currentUsersPage = 1; reload(); });
  if (statusSelect) statusSelect.addEventListener('change', () => { currentUsersPage = 1; reload(); });
  if (dateInput) dateInput.addEventListener('change', () => { currentUsersPage = 1; reload(); });
  if (sortSelect) sortSelect.addEventListener('change', () => { currentUsersPage = 1; reload(); });
  if (exportBtn) exportBtn.addEventListener('click', exportToCsv);

  // Listen to global admin search
  document.addEventListener('admin:global-search', (e) => reload(e.detail?.query || ''));

  // Handle clicks on data-route links, webinar report drawers, and status toggles inside the table
  container.addEventListener('click', async (e) => {
    const wbReportBtn = e.target.closest('.btn-user-wb-report');
    if (wbReportBtn) {
      const uId = wbReportBtn.dataset.userId;
      const targetUser = currentUsersData.find(u => u.id === uId);
      if (targetUser) {
        openUserWebinarReportDrawer(targetUser);
      }
      return;
    }

    const link = e.target.closest('[data-route="user-details"]');
    if (link && link.dataset.id) {
        window.location.hash = `user-details?id=${link.dataset.id}`;
        return; // It's a navigation link, stop here.
    }

    const toggleBtn = e.target.closest('.admin-status-toggle');
    if (toggleBtn) {
        const userId = toggleBtn.dataset.userId;
        const currentStatus = toggleBtn.dataset.currentStatus;
        const newStatusBool = currentStatus === 'inactive';

        const originalText = toggleBtn.textContent;
        toggleBtn.disabled = true;
        toggleBtn.textContent = '...';

        const result = await updateUserStatus(userId, newStatusBool);

        if (result.success) {
            const newStatusString = newStatusBool ? 'active' : 'inactive';
            toggleBtn.dataset.currentStatus = newStatusString;
            toggleBtn.textContent = newStatusString;
            toggleBtn.classList.remove('active', 'inactive');
            toggleBtn.classList.add(newStatusString);
        } else {
            alert('Failed to update status. Please try again.');
            toggleBtn.textContent = originalText; // revert text
        }
        toggleBtn.disabled = false;
    }
  });

function openUserWebinarReportDrawer(user) {
  let drawer = document.getElementById('adm-user-webinar-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'adm-user-webinar-drawer';
    drawer.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 600px;
      background: #0f172a;
      border-left: 2px solid #3b82f6;
      box-shadow: -10px 0 35px rgba(0,0,0,0.85);
      z-index: 100000;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(drawer);
  }

  const sanitizedMobile = String(user.mobile || '').replace(/\D/g, '');
  const userShareId = user.shareId || 'AI000004';
  const webinarShareUrl = `https://aarogyamindia.online/webinar.html?ref=${encodeURIComponent(userShareId)}`;
  const attendees = user.webinarAttendees || [];
  const leadsCount = user.webinarLeads || 0;
  const joinedCount = user.webinarJoined || 0;
  const conversionRate = leadsCount ? Math.round((joinedCount / leadsCount) * 100) : 0;

  drawer.innerHTML = `
    <!-- Header -->
    <div style="padding: 16px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 1.05rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
          <span>🎥</span> <span>वेबिनार रिपोर्ट (Webinar Performance)</span>
        </div>
        <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 3px;">
          👤 <strong>${user.name}</strong> • <code>${userShareId}</code> • 📞 ${user.mobile}
        </div>
      </div>
      <button type="button" id="close-user-wb-drawer" style="background:transparent; border:none; color:#94a3b8; font-size:1.5rem; cursor:pointer; line-height:1;">✕</button>
    </div>

    <!-- Body Content -->
    <div style="flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- Referral Link Box -->
      <div style="background: rgba(37,99,235,0.08); border: 1.5px dashed #3b82f6; border-radius: 12px; padding: 12px 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.75rem; font-weight:700; color:#93c5fd;">🌐 इस यूजर का व्यक्तिगत वेबिनार आमंत्रण लिंक:</span>
          <span class="admin-pill" style="font-size:0.7rem; background:#10b981; color:#fff;">Active Link</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" readonly value="${webinarShareUrl}" id="user-wb-link-input" style="flex:1; background:#0b0f19; border:1px solid #1e293b; border-radius:6px; color:#60a5fa; padding:6px 10px; font-size:0.8rem; font-weight:700; outline:none;" />
          <button type="button" id="btn-copy-user-wb-link" class="admin-button small-button" style="background:#2563eb; color:#fff; font-weight:700; font-size:0.75rem; white-space:nowrap;">
            📋 कॉपी
          </button>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`🌾 *आरोग्यम इंडिया लाइव कृषि वेबिनार*\n\n👉 *मुफ्त रजिस्ट्रेशन व ज़ूम लिंक:*\n${webinarShareUrl}`)}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; font-weight:700; font-size:0.75rem; white-space:nowrap; text-decoration:none;">
            💬 शेयर
          </a>
        </div>
      </div>

      <!-- 3 Metrics KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">कुल रजिस्ट्रेशन</div>
          <div style="font-size: 1.4rem; font-weight: 900; color: #60a5fa; margin-top: 2px;">${leadsCount}</div>
          <div style="font-size: 0.68rem; color: #64748b;">Registered Leads</div>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">ज़ूम अटेंडेंस</div>
          <div style="font-size: 1.4rem; font-weight: 900; color: #34d399; margin-top: 2px;">${joinedCount}</div>
          <div style="font-size: 0.68rem; color: #64748b;">Live Attended</div>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">अटेंडेंस दर</div>
          <div style="font-size: 1.4rem; font-weight: 900; color: #fbbf24; margin-top: 2px;">${conversionRate}%</div>
          <div style="font-size: 0.68rem; color: #64748b;">Turnout Ratio</div>
        </div>
      </div>

      <!-- Attendees Table -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size: 0.9rem; font-weight: 800; color: #fff;">
            👥 रजिस्टर्ड किसानों की सूची (${attendees.length})
          </div>
          ${attendees.length > 0 ? `
            <button type="button" id="btn-export-user-wb-csv" class="admin-button small-button" style="font-size:0.72rem; padding:3px 8px;">
              📥 CSV डाउनलोड
            </button>
          ` : ''}
        </div>

        ${attendees.length === 0 ? `
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 24px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
            <span style="font-size: 1.8rem; display: block; margin-bottom: 6px;">🌾</span>
            इस यूजर के रेफरल लिंक से अभी कोई वेबिनार रजिस्ट्रेशन नहीं हुआ है।<br>
            <span style="font-size: 0.75rem; color: #64748b;">रेफरल लिंक शेयर करते ही आने वाले किसान यहाँ स्वतः दिखेंगे।</span>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${attendees.map((att, idx) => {
              const attMob = String(att.mobile || '').replace(/\D/g, '');
              const waMob = attMob.length === 10 ? '91' + attMob : attMob;
              const waMsg = encodeURIComponent(`नमस्ते ${att.name} जी! मैं आरोग्यम इंडिया से बात कर रहा हूँ। आपने हमारे लाइव वेबिनार में भाग लिया था...`);
              const regDate = att.registeredAt ? new Date(att.registeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

              return `
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #fff; display: flex; align-items: center; gap: 6px;">
                      <span>#${idx + 1}</span>
                      <span>${att.name}</span>
                      ${att.isJoined 
                        ? `<span style="background:rgba(16,185,129,0.2); color:#34d399; border:1px solid rgba(16,185,129,0.4); font-size:0.65rem; font-weight:800; padding:1px 6px; border-radius:10px;">🟢 Live Joined</span>` 
                        : `<span style="background:rgba(148,163,184,0.15); color:#cbd5e1; font-size:0.65rem; font-weight:700; padding:1px 6px; border-radius:10px;">⏳ Registered</span>`
                      }
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">
                      📍 ${att.district || att.state || 'स्थान उपलब्ध नहीं'} • 📅 ${regDate}
                    </div>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <a href="tel:${attMob}" class="admin-button small-button" style="background:#0f172a; border:1px solid #475569; color:#94a3b8; font-size:0.75rem; padding:3px 8px; text-decoration:none;" title="Direct Call">
                      📞 Call
                    </a>
                    <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; border-color:#22c55e; font-size:0.75rem; padding:3px 8px; text-decoration:none; display:inline-flex; align-items:center; gap:3px;" title="WhatsApp Follow-up">
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

    </div>
  `;

  // Animate Open
  requestAnimationFrame(() => {
    drawer.style.transform = 'translateX(0)';
  });

  // Attach Close & Copy handlers
  document.getElementById('close-user-wb-drawer')?.addEventListener('click', () => {
    drawer.style.transform = 'translateX(100%)';
  });

  document.getElementById('btn-copy-user-wb-link')?.addEventListener('click', function () {
    const input = document.getElementById('user-wb-link-input');
    if (input) {
      navigator.clipboard.writeText(input.value);
      const btn = this;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = '📋 कॉपी'; }, 2000);
    }
  });

  document.getElementById('btn-export-user-wb-csv')?.addEventListener('click', () => {
    const headers = ["#", "Name", "Mobile", "District", "State", "Registration Date", "Live Joined Status"];
    const rows = attendees.map((att, i) => [
      i + 1,
      `"${(att.name || '').replace(/"/g, '""')}"`,
      `"${att.mobile || ''}"`,
      `"${att.district || ''}"`,
      `"${att.state || ''}"`,
      `"${att.registeredAt ? new Date(att.registeredAt).toISOString() : ''}"`,
      att.isJoined ? "Joined Live" : "Registered Only"
    ].join(','));
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `webinar_leads_${user.shareId || 'user'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

  // Automatically sync statuses on page load to correct any discrepancies.
  container.innerHTML = '<div class="admin-loading">Syncing user statuses...</div>';
  await batchUpdateUserStatuses();
  await reload();
}

// TODO: support CSV export and quick actions (block/unblock)
