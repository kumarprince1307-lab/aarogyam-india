/* Admin Users Page */

import { initAdminLayout } from './admin-main.js';
import { fetchUsers } from './admin-api.js';

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
      <td>₹${(user.totalSpent || 0).toLocaleString('en-IN')}</td>
      <td><span class="admin-pill ${user.status.toLowerCase()}">${user.status}</span></td>
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
    <div class="admin-table-wrapper">
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
      <div class="admin-section-title">Users</div>
      <div class="admin-card admin-controls">
        <input id="user-search" type="search" placeholder="Search by name, mobile, or email" class="admin-input" />
        <select id="user-status-filter" class="admin-select">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div id="users-table" style="margin-top:12px;"></div>
    </div>
  `;

  const container = document.getElementById('users-table');
  const searchInput = document.getElementById('user-search');
  const statusSelect = document.getElementById('user-status-filter');
  if (!container) return;

  async function reload(queryFromEvent) {
    container.innerHTML = '<div class="admin-loading">Loading users…</div>';
    const params = { query: (queryFromEvent !== undefined) ? queryFromEvent : (searchInput?.value || ''), status: statusSelect?.value || 'all' };
    const result = await fetchUsers(params);
    container.innerHTML = result.success ? renderUsersTable(result.data) : '<div class="admin-error"><strong>Unable to load users.</strong></div>';
  }

  if (searchInput) searchInput.addEventListener('input', () => reload());
  if (statusSelect) statusSelect.addEventListener('change', () => reload());

  // Listen to global admin search
  document.addEventListener('admin:global-search', (e) => reload(e.detail?.query || ''));

  // Handle clicks on data-route links inside the table
  container.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route="user-details"]');
    if (link && link.dataset.id) {
        window.location.hash = `user-details?id=${link.dataset.id}`;
    }
  });

  await reload();
}

// TODO: support CSV export and quick actions (block/unblock)
