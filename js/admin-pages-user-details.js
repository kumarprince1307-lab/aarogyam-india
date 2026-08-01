/* Admin User Details Page */

import { initAdminLayout } from './admin-main.js';
import { fetchUserDetails } from './admin-api.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderProfile(detail) {
  if (!detail) return '<div class="admin-empty"><strong>User not found.</strong></div>';

  return `
    <div class="admin-section admin-data-grid">
      <div class="admin-data-card"><h4>Name</h4><p>${detail.name}</p></div>
      <div class="admin-data-card"><h4>Mobile</h4><p>${detail.mobile}</p></div>
      <div class="admin-data-card"><h4>Email</h4><p>${detail.email}</p></div>
      <div class="admin-data-card"><h4>Source</h4><p>${detail.source}</p></div>
      <div class="admin-data-card"><h4>Status</h4><p>${detail.status}</p></div>
      <div class="admin-data-card"><h4>Joined</h4><p>${detail.joined}</p></div>
      <div class="admin-data-card"><h4>Referral Token</h4><p>${detail.referralToken || 'N/A'}</p></div>
    </div>
    <div class="admin-section">
      <div class="admin-section-title">Recent Purchases</div>
      ${renderPurchases(detail.purchases)}
    </div>
    <div class="admin-section">
      <div class="admin-section-title">Activity Timeline</div>
      ${renderActivity(detail.activity)}
    </div>
  `;
}

function renderPurchases(purchases) {
  if (!purchases || purchases.length === 0) {
    return '<div class="admin-empty"><strong>No purchases found for this user.</strong></div>';
  }
  return `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead><tr><th>Order</th><th>Book</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${purchases.map(p => `<tr><td>${p.order}</td><td>${p.book}</td><td>${p.amount}</td><td><span class="status-pill ${p.status}">${p.status}</span></td><td>${p.date}</td></tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function renderActivity(activity) {
  if (!activity || activity.length === 0) {
    return '<div class="admin-empty"><strong>No activity recorded.</strong></div>';
  }
  return `<ul class="admin-activity-list">
    ${activity.map(item => `<li><strong>${item.date}</strong> — ${item.description}</li>`).join('')}
  </ul>`;
}

export async function initUserDetails() {
  initAdminLayout('User Details', 'Inspect an individual customer profile.');

  const content = document.getElementById('page-content');
  if (!content) return;

  // the user id can be provided via hash query or via selection from Users page
  const hash = location.hash || '';
  const params = new URLSearchParams(hash.replace('#',''));
  const userId = params.get('id') || params.get('user') || 'U001';

  content.innerHTML = `
    <div class="admin-action-row">
      <button class="admin-button" data-route="users">Back to Users</button>
    </div>
    <div id="user-details-content"> <div class="admin-loading">Loading user details…</div> </div>
  `;

  const container = document.getElementById('user-details-content');
  if (!container) return;

  const result = await fetchUserDetails(userId);

  if (!result.success || !result.data) {
    container.innerHTML = '<div class="admin-error"><strong>Unable to load user details.</strong></div>';
    return;
  }

  container.innerHTML = renderProfile(result.data);
}

// TODO: add referral network and system notes in Phase-2
