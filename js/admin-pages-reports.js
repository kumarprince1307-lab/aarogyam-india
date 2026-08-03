/* Admin Reports Page */

import { initAdminLayout } from './admin-main.js';
import { fetchLeadReport, fetchShareReport, fetchDailyReport, fetchTotalReport } from './admin-api.js';

// NOTE: this module will be lazy-loaded by admin-router.js


function renderLeadReportTable(data) {
  if (!data || data.length === 0) {
    return '<div class="admin-empty"><strong>No leads found.</strong></div>';
  }
  return `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Mobile</th><th>Source</th><th>Status</th><th>Assigned</th></tr></thead>
        <tbody>${data.map(item => `<tr><td>${item.name}</td><td>${item.mobile}</td><td>${item.source}</td><td>${item.status}</td><td>${item.assigned}</td></tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function renderShareReportTable(data) {
  if (!data || data.length === 0) {
    return '<div class="admin-empty"><strong>No share data available.</strong></div>';
  }
  return `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead><tr><th>Token</th><th>Clicks</th><th>Conversions</th><th>Revenue</th></tr></thead>
        <tbody>${data.map(item => `<tr><td>${item.token}</td><td>${item.clicks}</td><td>${item.conversions}</td><td>${item.revenue}</td></tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function renderReportCards(data) {
  return `<div class="admin-stats-grid">
    ${data.map(item => `<div class="admin-stat-card"><h3>${item.label}</h3><p>${item.value}</p>${item.change ? `<small class="admin-muted">${item.change}</small>` : ''}</div>`).join('')}
  </div>`;
}

export async function initReports() {
  initAdminLayout('Reports', 'Lead, share, daily, and total insights for the business.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-section admin-card">
      <div id="reports-filters" class="admin-controls"></div>
    </div>
    <div id="reports-output"></div>
  `;

  const filters = document.getElementById('reports-filters');
  const output = document.getElementById('reports-output');
  if (!filters || !output) return;

  let leadData = [];
  let shareData = [];
  let dailyData = [];
  let totalData = [];

  function applyFilters() {
    const query = document.getElementById('lead-search')?.value.toLowerCase() || '';
    const status = document.getElementById('lead-status')?.value || 'all';

    const filteredLeadData = leadData.filter(item => {
      const matchQuery = item.name.toLowerCase().includes(query) || item.mobile.includes(query) || item.source.toLowerCase().includes(query);
      const matchStatus = status === 'all' || item.status.toLowerCase() === status;
      return matchQuery && matchStatus;
    });

    output.innerHTML = `
      <section class="admin-section" id="daily-report">
        <div class="admin-section-title">Daily Report</div>
        ${renderReportCards(dailyData)}
      </section>
      <section class="admin-section" id="total-report">
        <div class="admin-section-title">Total Report</div>
        ${renderReportCards(totalData)}
      </section>

      {/* Share Report → share_links */}
      <section class="admin-section" id="share-report">
        <div class="admin-section-title">Share Report</div>
        ${renderShareReportTable(shareData)}
      </section>

      {/* Referral Report → profiles */}
      <section class="admin-section" id="referral-report-placeholder">
        <div class="admin-section-title">Referral Report</div>
        <div class="admin-empty"><strong>No Data Available</strong></div>
      </section>
      
      {/* Asset Report → share_assets */}
      <section class="admin-section" id="asset-report-placeholder">
        <div class="admin-section-title">Asset Report</div>
        <div class="admin-empty"><strong>No Data Available</strong></div>
      </section>

      {/* Lead Owner Report → lead_owners */}
      <section class="admin-section" id="lead-owner-report-placeholder">
        <div class="admin-section-title">Lead Owner Report</div>
        <div class="admin-empty"><strong>No Data Available</strong></div>
      </section>

      {/* Source Report → registration_sources */}
      <section class="admin-section" id="source-report-placeholder">
        <div class="admin-section-title">Source Report</div>
        <div class="admin-empty"><strong>No Data Available</strong></div>
      </section>

      <section class="admin-section" id="performance-report-placeholder">
        <div class="admin-section-title">Performance Report</div>
        <div class="admin-empty"><strong>No Data Available</strong></div>
      </section>

      <section class="admin-section" id="legacy-lead-report">
        <div class="admin-section-title">Lead Report (Legacy)</div>
        ${renderLeadReportTable(filteredLeadData)}
      </section>
    `;
  }

  filters.innerHTML = `
    <div class="admin-controls">
      <input id="lead-search" type="search" placeholder="Search lead name, mobile or source" class="admin-input" />
      <select id="lead-status" class="admin-select">
        <option value="all">All statuses</option>
        <option value="contacted">Contacted</option>
        <option value="interested">Interested</option>
        <option value="converted">Converted</option>
      </select>
    </div>
  `;

  output.innerHTML = '<div class="admin-loading">Loading report data…</div>';

  try {
    const [leadResult, shareResult, dailyResult, totalResult] = await Promise.all([
      fetchLeadReport(),
      fetchShareReport(),
      fetchDailyReport(),
      fetchTotalReport()
    ]);

    if (!leadResult.success || !shareResult.success || !dailyResult.success || !totalResult.success) {
      output.innerHTML = '<div class="admin-error"><strong>Unable to load report data.</strong></div>';
      return;
    }

    leadData = leadResult.data;
    shareData = shareResult.data;
    dailyData = dailyResult.data;
    totalData = totalResult.data;

    applyFilters();

    const leadSearch = document.getElementById('lead-search');
    const leadStatus = document.getElementById('lead-status');
    leadSearch?.addEventListener('input', () => applyFilters());
    leadStatus?.addEventListener('change', () => applyFilters());

    // global search integration
    document.addEventListener('admin:global-search', (e) => {
      const q = e.detail?.query || '';
      document.getElementById('lead-search').value = q;
      applyFilters();
    });
  } catch (error) {
    output.innerHTML = '<div class="admin-error"><strong>Unable to load reports.</strong></div>';
    console.error('initReports error', error);
  }
}

// TODO: add export and chart visuals in Phase-2
