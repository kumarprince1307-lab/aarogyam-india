/* Admin Purchases Page */

import { initAdminLayout } from './admin-main.js';
import { fetchPurchases } from './admin-api.js';

function renderPurchaseRow(item) {
  return `
    <tr>
      <td>${item.order}</td>
      <td>${item.customer}</td>
      <td>${item.book}</td>
      <td>${item.amount}</td>
      <td>${item.source}</td>
      <td><span class="status-pill ${item.status}">${item.status}</span></td>
      <td>${item.date}</td>
    </tr>
  `;
}

function renderPurchasesTable(purchases) {
  if (!purchases || purchases.length === 0) {
    return '<div class="admin-empty"><strong>No purchases found.</strong><br>Adjust filters or search terms.</div>';
  }
  return `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Book</th><th>Amount</th><th>Source</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>${purchases.map(renderPurchaseRow).join('')}</tbody>
      </table>
    </div>`;
}

export async function initPurchases() {
  initAdminLayout('Purchases', 'Browse order history with status and source filters.');

  const content = document.getElementById('page-content');
  if (!content) return;
  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-title">Purchases</div>
      <div class="admin-card admin-controls">
        <input id="purchase-search" type="search" placeholder="Search orders by ID, book or customer" class="admin-input" />
        <select id="purchase-status-filter" class="admin-select">
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div id="purchases-table" style="margin-top:12px;"></div>
    </div>
  `;

  const container = document.getElementById('purchases-table');
  const searchInput = document.getElementById('purchase-search');
  const statusSelect = document.getElementById('purchase-status-filter');
  if (!container) return;

  async function reload(queryFromEvent) {
    container.innerHTML = '<div class="admin-loading">Loading purchases…</div>';
    const params = { query: (queryFromEvent !== undefined) ? queryFromEvent : (searchInput?.value || ''), status: statusSelect?.value || 'all' };
    const result = await fetchPurchases(params);
    container.innerHTML = result.success ? renderPurchasesTable(result.data) : '<div class="admin-error"><strong>Unable to load purchases.</strong></div>';
  }

  if (searchInput) searchInput.addEventListener('input', () => reload());
  if (statusSelect) statusSelect.addEventListener('change', () => reload());

  document.addEventListener('admin:global-search', (e) => reload(e.detail?.query || ''));

  await reload();
}

// TODO: add paging and date range filters in Phase-2
