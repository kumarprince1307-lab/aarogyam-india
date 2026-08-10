/* Admin Dashboard Page */

import { initAdminLayout } from './admin-main.js'; // Already exists
import { fetchDashboardData } from './admin-api.js'; // Already exists

function renderKpiGroup(kpis) {
  return `<div class="kpi-row">
    ${kpis.map(kpi => `<div class="kpi-card"><div class="kpi-label">${kpi.label}</div><div class="kpi-value">${kpi.value}</div></div>`).join('')}
  </div>`;
}

function renderLeadSources(data) {
  if (!data || data.length === 0) {
    return '<div class="admin-empty-sm">No lead source data available.</div>';
  }
  return `<div class="admin-data-grid">
    ${data.map(item => `<div class="admin-data-card">
        <div class="admin-card-title">${item.source}</div>
        <div class="admin-progress"><span class="admin-progress-fill" style="width: ${item.value}%"></span></div>
        <p>${item.value}% share</p>
      </div>`).join('')}
  </div>`;
}

function renderCustomerJourney(data) {
  if (!data || data.length === 0) {
    return '<div class="admin-empty-sm">No journey data available.</div>';
  }
  return `<div class="admin-data-grid">
    ${data.map(item => `<div class="admin-data-card admin-journey-card"><h4>${item.stage}</h4><p>${item.count} users</p></div>`).join('')}
  </div>`;
}

function renderBookSales(data) {
  if (!data || data.length === 0) {
    return '<div class="admin-empty-sm">No book sales data available.</div>';
  }
  return `<div class="admin-data-grid">
    ${data.map(item => `<div class="admin-data-card">
        <h4>${item.name}</h4>
        <p>${item.sold} sold</p>
        <small>${item.revenue}</small>
      </div>`).join('')}
  </div>`;
}

function renderActivity(data) {
  if (!data || data.length === 0) {
    return '<div class="admin-empty-sm">No recent activity.</div>';
  }
  return `<div class="admin-section admin-card">
    <div class="admin-section-title">Recent Activity</div>
    <ul class="admin-activity-list">
      ${data.map(item => `<li><strong>${item.date}</strong> — ${item.event} <span>${item.user}</span></li>`).join('')}
    </ul>
  </div>`;
}

function renderTopBooks(data) {
  if (!data || data.length === 0) {
    return '<div class="admin-empty-sm">No top books data available.</div>';
  }
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

    const { shareSummary, businessKpis, leadSources, customerJourney, bookSales, recentActivity } = result.data;
    
    // Use live data for Share KPIs, with fallbacks
    const shareKpis = [ // This is a local const, not a duplicate declaration
      { label: 'Total Shares', value: shareSummary.totalShares || 0 },
      { label: 'Total Clicks', value: shareSummary.totalClicks || 0 },
      { label: 'Total Visitors', value: shareSummary.totalVisitors || 0 },
      { label: 'Total Leads', value: shareSummary.totalLeads || 0 },
      { label: 'Total Registrations', value: shareSummary.totalRegistrations || 0 },
      { label: 'Total Purchases', value: shareSummary.totalPurchases || 0 },
      { label: 'Total Revenue', value: `₹${(shareSummary.totalRevenue || 0).toLocaleString('en-IN')}` },
      { label: 'Conversion Rate', value: shareSummary.conversionRate || '0.00%' }
    ];

    content.innerHTML = `
      <div class="admin-section" id="share-summary">
        <div class="admin-section-title">Share Engine Summary</div>
        ${renderKpiGroup(shareKpis)}
      </div>
      <div class="admin-section" id="business-summary">
        <div class="admin-section-title">Business Summary</div>
        ${renderKpiGroup(businessKpis)}
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
