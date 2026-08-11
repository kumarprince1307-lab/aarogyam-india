/* Admin Purchases Page */

import { initAdminLayout } from './admin-main.js';
import { fetchPurchases, fetchPurchaseFilterOptions } from './admin-api.js';

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
        <select id="purchase-date-filter" class="admin-select">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="thismonth">This Month</option>
            <option value="custom">Custom Date</option>
        </select>
        <input type="date" id="purchase-custom-date" class="admin-input" style="display: none;">
        <select id="purchase-source-filter" class="admin-select">
          <option value="all">All Sources</option>
        </select>
        <select id="purchase-book-filter" class="admin-select">
          <option value="all">All Books</option>
        </select>
      </div>
      <div id="purchases-table" style="margin-top:12px;"></div>
    </div>
  `;

  const container = document.getElementById('purchases-table');
  const searchInput = document.getElementById('purchase-search');
  const statusSelect = document.getElementById('purchase-status-filter');
  const dateSelect = document.getElementById('purchase-date-filter');
  const customDateInput = document.getElementById('purchase-custom-date');
  const sourceSelect = document.getElementById('purchase-source-filter');
  const bookSelect = document.getElementById('purchase-book-filter');

  if (!container) return;

  async function populateFilters() {
    const result = await fetchPurchaseFilterOptions();
    if (result.success) {
      const { books, sources } = result.data;
      sources.forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        sourceSelect.appendChild(option);
      });
      books.forEach(bookId => {
        const option = document.createElement('option');
        option.value = bookId;
        option.textContent = bookId;
        bookSelect.appendChild(option);
      });
    }
  }

  async function reload(queryFromEvent) {
    container.innerHTML = '<div class="admin-loading">Loading purchases…</div>';

    const dateFilterValue = dateSelect.value;
    let startDate, endDate;
    const now = new Date();

    switch (dateFilterValue) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'yesterday':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'last7days':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'thismonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        case 'custom':
            if (customDateInput.value) {
                const selectedDate = new Date(customDateInput.value);
                startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
            }
            break;
    }

    const params = { 
      query: (queryFromEvent !== undefined) ? queryFromEvent : (searchInput?.value || ''), 
      status: statusSelect?.value || 'all',
      source: sourceSelect?.value || 'all',
      bookId: bookSelect?.value || 'all',
      startDate,
      endDate
    };
    const result = await fetchPurchases(params);
    container.innerHTML = result.success ? renderPurchasesTable(result.data) : '<div class="admin-error"><strong>Unable to load purchases.</strong></div>';
  }

  if (searchInput) searchInput.addEventListener('input', () => reload());
  if (statusSelect) statusSelect.addEventListener('change', () => reload());
  if (sourceSelect) sourceSelect.addEventListener('change', () => reload());
  if (bookSelect) bookSelect.addEventListener('change', () => reload());
  if (dateSelect) dateSelect.addEventListener('change', () => {
    customDateInput.style.display = dateSelect.value === 'custom' ? 'block' : 'none';
    if (dateSelect.value !== 'custom') reload();
  });
  if (customDateInput) customDateInput.addEventListener('change', () => reload());

  document.addEventListener('admin:global-search', (e) => reload(e.detail?.query || ''));

  await populateFilters();
  await reload();
}

// TODO: add paging and date range filters in Phase-2
