/* Admin Users Page */

import { initAdminLayout } from './admin-main.js';
import { fetchUsers, updateUserStatus, batchUpdateUserStatuses } from './admin-api.js';

let currentUsersData = []; // Store current user data for export

function renderUserRow(user) {
  const sanitizedMobile = String(user.mobile || '').replace(/\D/g, '');
  const mobileLink = sanitizedMobile ? `<a href="tel:${sanitizedMobile}" class="admin-subtle-link">${user.mobile}</a>` : (user.mobile || 'N/A');

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
      whatsappButtonHTML = `<a href="${whatsappUrl}" target="_blank" class="admin-button small-button icon-button" title="WhatsApp">💬</a>`;
  }

  return `
    <tr>
      <td>
        <div class="admin-user-name">${user.name}</div>
        <div class="admin-user-email">${user.email}</div>
      </td>
      <td>${mobileLink}</td>
      <td>${user.source || 'N/A'}</td>
      <td><a href="#user-details?id=${user.id}" data-route="user-details" data-id="${user.id}" class="admin-subtle-link">${user.shareId || 'N/A'}</a></td>
      <td>${user.directReferrals || 0}</td>
      <td>${user.totalShares || 0}</td>
      <td>${user.totalClicks || 0}</td>
      <td>${user.totalVisitors || 0}</td>
      <td>${user.totalDirectPurchases || 0}</td>
      <td>${user.totalPurchases || 0}</td>
      <td>₹${(user.totalSpent || 0).toLocaleString('en-IN')}</td>      <td>${user.totalDownloads || 0} / ${user.downloadLimit || 0}</td>
      <td>
        <button 
          class="admin-button small-button admin-status-toggle ${user.status.toLowerCase()}"
          data-user-id="${user.id}"
          data-current-status="${user.status.toLowerCase()}"
          title="Click to toggle status"
        >
          ${user.status}
        </button>
      </td>
      <td>
        <div style="display: flex; gap: 8px; align-items: center;">
            <a href="#user-details?id=${user.id}" data-route="user-details" data-id="${user.id}" class="admin-button small-button">View</a>
            ${whatsappButtonHTML}
        </div>
      </td>
    </tr>
  `;
}

function renderUsersTable(users) {
  if (!users || users.length === 0) {
    return '<div class="admin-empty"><strong>No users found.</strong><br>Try a different search or filter.</div>';
  }

  return `
    <div class="admin-table-wrapper sticky-header-table">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Reg. Source</th>
            <th>Share ID</th>
            <th>Direct Referrals</th>
            <th>Total Shares</th>
            <th>Total Clicks</th>
            <th>Total Visitors</th>
            <th>Total Direct Purchases</th>
            <th>Total Purchases</th>
            <th>Total Spent</th>
            <th>Downloads (Used/Limit)</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(renderUserRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export async function initUsers() {
  initAdminLayout('Users', 'Customer profiles, referral sources and user status.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-title">All Users</div>
      <div class="admin-card admin-controls">
        <input id="user-search" type="search" placeholder="Search by name, mobile, or email" class="admin-input" />
        <input id="user-reg-date-filter" type="date" title="Filter by registration date" class="admin-input" />
        <select id="user-status-filter" class="admin-select">
          <option value="all">All statuses</option>
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
    container.innerHTML = renderUsersTable(currentUsersData);
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

  if (searchInput) searchInput.addEventListener('input', () => reload());
  if (statusSelect) statusSelect.addEventListener('change', () => reload());
  if (dateInput) dateInput.addEventListener('change', () => reload());
  if (sortSelect) sortSelect.addEventListener('change', () => reload());
  if (exportBtn) exportBtn.addEventListener('click', exportToCsv);

  // Listen to global admin search
  document.addEventListener('admin:global-search', (e) => reload(e.detail?.query || ''));

  // Handle clicks on data-route links and status toggles inside the table
  container.addEventListener('click', async (e) => {
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

  // Automatically sync statuses on page load to correct any discrepancies.
  container.innerHTML = '<div class="admin-loading">Syncing user statuses...</div>';
  await batchUpdateUserStatuses();
  await reload();
}

// TODO: support CSV export and quick actions (block/unblock)
