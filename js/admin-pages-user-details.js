/* Admin User Details Page */

import { initAdminLayout } from './admin-main.js';
import { fetchUserDetails } from './admin-api.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderShareInformation() {
  return `
    <div class="admin-section">
      <div class="admin-section-title">Share Information</div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>Share ID</h4><p>N/A</p></div>
        <div class="admin-data-card"><h4>Total Shares</h4><p>0</p></div>
        <div class="admin-data-card"><h4>Total Clicks</h4><p>0</p></div>
      </div>
    </div>
  `;
}

function renderReferralInformation(detail) {
  const referrals = detail.directReferrals;
  const directReferralCount = referrals ? referrals.length : 0;

  const referredByName = detail.referredBy
    ? `<a href="#user-details?id=${detail.referredBy.id}" data-route="user-details" data-id="${detail.referredBy.id}" class="admin-subtle-link">${detail.referredBy.full_name}</a>`
    : 'N/A';

  let referralsTableHtml;
  if (!referrals || referrals.length === 0) {
    referralsTableHtml = '<div class="admin-empty"><strong>No direct referrals found for this user.</strong></div>';
  } else {
    referralsTableHtml = `
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead><tr><th>Name</th><th>Mobile</th><th>Total Purchases</th></tr></thead>
          <tbody>
            ${referrals.map(ref => `
              <tr>
                <td><a href="#user-details?id=${ref.id}" data-route="user-details" data-id="${ref.id}" class="admin-subtle-link">${ref.name || 'N/A'}</a></td>
                <td>${ref.mobile || 'N/A'}</td>
                <td>${ref.totalPurchases || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  }
  
  return `
    <div class="admin-section">
      <div class="admin-section-title">Referral Information</div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>Referred By</h4><p>${referredByName}</p></div>
        <div class="admin-data-card"><h4>Direct Referrals</h4><p>${directReferralCount}</p></div>
        <div class="admin-data-card"><h4>Total Network</h4><p>${directReferralCount}</p></div>
      </div>
      <div class="admin-section-title" style="margin-top: 24px; margin-bottom: 16px;">Direct Referrals List</div>
      ${referralsTableHtml}
    </div>
  `;
}

function renderSharePerformance() {
  return `
    <div class="admin-section">
      <div class="admin-section-title">Share Performance</div>
      <div class="admin-empty"><strong>No Data Available</strong></div>
    </div>
  `;
}

function renderLeadInformation() {
  return `
    <div class="admin-section">
      <div class="admin-section-title">Lead Information</div>
      <div class="admin-empty"><strong>No Data Available</strong></div>
    </div>
  `;
}

function renderPermissions() {
    const permissions = [
        'Books', 'Library', 'Reports', 'Share', 'Downloads',
        'Products', 'Agriculture', 'Disease', 'Webinar', 'Business', 'Admin Access'
    ];
    return `
    <div class="admin-section">
      <div class="admin-section-title">Permissions</div>
      <div class="admin-data-grid">
        ${permissions.map(p => `<div class="admin-data-card"><h4>${p}</h4><p>N/A</p></div>`).join('')}
      </div>
    </div>
  `;
}

function renderProfile(detail) {
  if (!detail) return '<div class="admin-empty"><strong>User not found.</strong></div>';

  return `
    <div class="admin-section">
      <div class="admin-section-title">Profile</div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>Name</h4><p>${detail.name}</p></div>
        <div class="admin-data-card"><h4>Mobile</h4><p>${detail.mobile}</p></div>
        <div class="admin-data-card"><h4>Email</h4><p>${detail.email}</p></div>
        <div class="admin-data-card"><h4>Source</h4><p>${detail.source}</p></div>
        <div class="admin-data-card"><h4>Status</h4><p>${detail.status}</p></div>
        <div class="admin-data-card"><h4>Joined</h4><p>${detail.joined}</p></div>
        <div class="admin-data-card"><h4>Referral Token</h4><p>${detail.referralToken || 'N/A'}</p></div>
        <div class="admin-data-card"><h4>कुल डाउनलोड</h4><p>${detail.totalDownloads || 0}</p></div>
        <div class="admin-data-card"><h4>डाउनलोड उपयोग (Used/Limit)</h4><p>${detail.totalDownloads || 0} / ${detail.downloadLimit || 0}</p></div>
      </div>
    </div>
    ${renderShareInformation()}
    ${renderReferralInformation(detail)}
    <div class="admin-section">
      <div class="admin-section-title">Purchase Summary</div>
      ${renderPurchases(detail.purchases)}
    </div>
    <div class="admin-section">
      <div class="admin-section-title">Activity Summary</div>
      ${renderActivity(detail.activity)}
    </div>
    ${renderSharePerformance()}
    ${renderLeadInformation()}
    ${renderPermissions()}
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
  const hash = window.location.hash || '';
  const queryString = hash.substring(hash.indexOf('?'));
  const params = new URLSearchParams(queryString);
  const userId = params.get('id');

  content.innerHTML = `
    <div class="admin-action-row">
      <button class="admin-button" data-route="users">Back to Users</button>
    </div>
    <div id="user-details-content"> <div class="admin-loading">Loading user details…</div> </div>
  `;

  const container = document.getElementById('user-details-content');
  if (!container) return;

  if (!userId) {
    container.innerHTML = '<div class="admin-error"><strong>No user ID provided.</strong><br>Please go back to the users list and select a user.</div>';
    return;
  }

  const result = await fetchUserDetails(userId);

  if (!result.success || !result.data) {
    container.innerHTML = '<div class="admin-error"><strong>Unable to load user details.</strong></div>';
    return;
  }

  container.innerHTML = renderProfile(result.data);

  // Handle clicks on data-route links inside the new referrals table
  container.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route="user-details"]');
    if (link && link.dataset.id) {
        window.location.hash = `user-details?id=${link.dataset.id}`;
    }
  });
}

// TODO: add referral network and system notes in Phase-2
