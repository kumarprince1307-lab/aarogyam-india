/* Admin Users Page */

import { initAdminLayout } from './admin-main.js';
import { fetchUsers } from './admin-api.js';

function renderUserRow(user) {
  return `
    <tr>
      <td><a href="user-details.html?id=${user.id}" class="admin-subtle-link">${user.id}</a></td>
      <td>
        <div class="admin-user-name">${user.name}</div>
        <div class="admin-user-email">${user.email}</div>
      </td>
      <td>${user.mobile}</td>
      <td>${user.source}</td>
      <td>N/A</td>
      <td>N/A</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td><span class="admin-pill ${user.status.toLowerCase()}">${user.status}</span></td>
      <td><a href="user-details.html?id=${user.id}" class="admin-button">View</a></td>
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
            <th>ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Reg. Source</th>
            <th>Share ID</th>
            <th>Lead Owner</th>
            <th>Direct Referrals</th>
            <th>Total Shares</th>
            <th>Total Leads</th>
            <th>Total Purchases</th>
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

  await reload();
}

// TODO: support CSV export and quick actions (block/unblock)
