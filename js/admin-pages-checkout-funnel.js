import { initAdminLayout } from './admin-main.js';
import { fetchCheckoutLogs, fetchAllBooks } from './admin-api.js';

let allLogs = [];
let allBooks = [];

function renderLayout() {
    const content = document.getElementById('checkout-funnel-page');
    if (!content) return;

    content.innerHTML = `
        <div class="admin-section admin-card">
            <div id="filters" class="admin-controls checkout-filters">
                <input id="search-input" type="search" placeholder="Search by Name or Mobile" class="admin-input">
                <select id="status-filter" class="admin-select"></select>
                <select id="date-filter" class="admin-select"></select>
                <select id="book-filter" class="admin-select"></select>
            </div>
        </div>
        <div id="logs-table-container" class="admin-section admin-card" style="margin-top: 1rem;"></div>
    `;
}

function renderTable(logs) {
    const container = document.getElementById('logs-table-container');
    if (!container) return;

    if (logs.length === 0) {
        container.innerHTML = '<div class="admin-empty">No checkout logs found for the selected filters.</div>';
        return;
    }

    const statusColors = {
        success: 'success',
        failed: 'danger',
        dropped: 'warning',
        initiated: 'info'
    };

    container.innerHTML = `
        <div class="admin-table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Customer</th>
                        <th>Book</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => {
                        const sanitizedMobile = String(log.customer_mobile || '').replace(/\D/g, '');
                        return `
                        <tr>
                            <td>${new Date(log.created_at).toLocaleString('en-IN')}</td>
                            <td>
                                <div class="admin-user-name">${log.customer_name || 'Unknown Customer'}</div>
                                <div class="admin-user-email">${log.customer_mobile || 'No Mobile'}</div>
                            </td>
                            <td>${log.book_name}</td>
                            <td><span class="admin-pill ${statusColors[log.status] || 'default'}">${log.status.toUpperCase()}</span></td>
                            <td>
                                ${sanitizedMobile ? `<a href="tel:${sanitizedMobile}" class="admin-button small-button">📞 Call</a>` : '<span class="admin-muted">No Action</span>'}
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function applyFiltersAndReload() {
    const container = document.getElementById('logs-table-container');
    if (!container) return;
    container.innerHTML = '<div class="admin-loading">Loading checkout logs...</div>';

    const params = {
        status: document.getElementById('status-filter')?.value || 'all',
        dateRange: document.getElementById('date-filter')?.value || 'all',
        bookId: document.getElementById('book-filter')?.value || 'all',
        search: document.getElementById('search-input')?.value || ''
    };

    const result = await fetchCheckoutLogs(params);

    if (result.success) {
        renderTable(result.data);
    } else {
        container.innerHTML = `<div class="admin-error"><strong>Error:</strong> ${result.error || 'Could not load checkout logs.'}</div>`;
    }
}

function populateFilters(preselectedStatus) {
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const bookFilter = document.getElementById('book-filter');

    if (statusFilter) {
        statusFilter.innerHTML = `
            <option value="all">All Statuses</option>
            <option value="followup">🔥 Follow-up Required</option>
            <option value="initiated">Initiated</option>
            <option value="dropped">Dropped</option>
            <option value="failed">Failed</option>
            <option value="success">Success</option>
        `;
        if (preselectedStatus) {
            statusFilter.value = preselectedStatus;
        }
    }

    if (dateFilter) {
        dateFilter.innerHTML = `
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
        `;
    }

    if (bookFilter) {
        bookFilter.innerHTML = `<option value="all">All Books</option>` + 
        allBooks.map(book => `<option value="${book.id}">${book.name || book.title}</option>`).join('');
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const bookFilter = document.getElementById('book-filter');

    let searchTimeout;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFiltersAndReload();
        }, 400);
    });

    statusFilter?.addEventListener('change', applyFiltersAndReload);
    dateFilter?.addEventListener('change', applyFiltersAndReload);
    bookFilter?.addEventListener('change', applyFiltersAndReload);
}

export async function initCheckoutFunnel() {
    initAdminLayout('Checkout Funnel', 'Track all checkout attempts from customers.');

    const content = document.getElementById('page-content');
    if (!content) return;

    // Render the basic layout first
    content.innerHTML = '<div id="checkout-funnel-page"><div class="admin-loading">Initializing...</div></div>';
    renderLayout();

    // Show loading state for the table
    const tableContainer = document.getElementById('logs-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = '<div class="admin-loading">Loading data...</div>';
    }

    // Fetch books for the filter
    const booksResult = await fetchAllBooks();
    if (booksResult.success) {
        allBooks = booksResult.data;
    } else {
        console.error("Could not load books for filter.");
    }

    // Check for pre-selected status from URL hash
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.substring(hash.indexOf('?')));
    const preselectedStatus = urlParams.get('status');

    // Populate filters with data and pre-selections
    populateFilters(preselectedStatus);

    // Setup event listeners for filters
    setupEventListeners();

    // Initial data load
    await applyFiltersAndReload();
}