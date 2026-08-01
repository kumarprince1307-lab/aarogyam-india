/* Admin Dashboard Page */

import { initAdminLayout } from './admin-main.js';
import { fetchDashboardData } from './admin-api.js';

function renderKpiGroup(kpis) {
  return `<div class="admin-stats-grid">
    ${kpis.map(kpi => `<div class="admin-stat-card"><h3>${kpi.label}</h3><p>${kpi.value}</p></div>`).join('')}
  </div>`;
}

function renderLeadSources(data) {
  return `<div class="admin-data-grid">
    ${data.map(item => `<div class="admin-data-card">
        <div class="admin-card-title">${item.source}</div>
        <div class="admin-progress"><span class="admin-progress-fill" style="width: ${item.value}%"></span></div>
        <p>${item.value}% share</p>
      </div>`).join('')}
  </div>`;
}

function renderCustomerJourney(data) {
  return `<div class="admin-data-grid">
    ${data.map(item => `<div class="admin-data-card admin-journey-card"><h4>${item.stage}</h4><p>${item.count} users</p></div>`).join('')}
  </div>`;
}

function renderBookSales(data) {
  return `<div class="admin-data-grid">
    ${data.map(item => `<div class="admin-data-card">
        <h4>${item.name}</h4>
        <p>${item.sold} sold</p>
        <small>${item.revenue}</small>
      </div>`).join('')}
  </div>`;
}

function renderActivity(data) {
  return `<div class="admin-section admin-card">
    <div class="admin-section-title">Recent Activity</div>
    <ul class="admin-activity-list">
      ${data.map(item => `<li><strong>${item.date}</strong> — ${item.event} <span>${item.user}</span></li>`).join('')}
    </ul>
  </div>`;
}

function renderTopBooks(data) {
  return `<div class="admin-section admin-card">
    <div class="admin-section-title">Top Books</div>
    <ul class="admin-activity-list">
      ${data.map(b => `<li><strong>${b.name}</strong> — ${b.sold} sold <small>${b.revenue}</small></li>`).join('')}
    </ul>
  </div>`;
}

function renderQuickActions() {
  return `<div class="admin-card admin-section">
    <div class="admin-section-title">Quick Actions</div>
    <div class="u-row">
      <button class="admin-button">Create Campaign</button>
      <button class="admin-button">Export Leads</button>
      <button class="admin-button">Run Report</button>
    </div>
  </div>`;
}

export async function initDashboard() {
  initAdminLayout('Dashboard', 'Business, lead and share metrics in one place.');

  const content = document.getElementById('page-content');
  if (!content) return;
  content.innerHTML = '<div class="admin-loading">Loading dashboard data...</div>';

  try {
    const result = await fetchDashboardData();
    if (!result.success || !result.data) {
      content.innerHTML = '<div class="admin-error"><strong>Unable to load dashboard data.</strong><br>Please try again later.</div>';
      return;
    }

    const { kpis, leadSources, customerJourney, bookSales, recentActivity } = result.data;

    content.innerHTML = `
      <div class="admin-section" id="business-summary">
        <div class="admin-section-title">Business Summary</div>
        ${renderKpiGroup(kpis)}
      </div>
      <div class="admin-section" id="lead-sources">
        <div class="admin-section-title">Lead Sources</div>
        ${renderLeadSources(leadSources)}
      </div>
      <div class="admin-section" id="customer-journey">
        <div class="admin-section-title">Customer Journey</div>
        ${renderCustomerJourney(customerJourney)}
      </div>
      <div class="admin-grid">
        <div class="admin-col">
          <div class="admin-section" id="book-sales">
            <div class="admin-section-title">Book Sales</div>
            ${renderBookSales(bookSales)}
          </div>
          ${renderQuickActions()}
        </div>
        <div class="admin-col">${renderTopBooks(bookSales)}${renderActivity(recentActivity)}</div>
      </div>
    `;
  } catch (err) {
    console.error('admin-pages-dashboard init error', err);
    content.innerHTML = '<div class="admin-error"><strong>Unable to load dashboard.</strong><br>Something went wrong.</div>';
  }
}
