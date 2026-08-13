/* Admin Reports Page */

import { initAdminLayout } from './admin-main.js';
import { fetchSalesReport, fetchReferralReport, fetchSourceReport } from './admin-api.js';

let currentReportData = [];
let currentReportType = 'daily';

function renderTable(data, type) {
    if (!data || data.length === 0) {
        return '<div class="admin-empty"><strong>No data available for the selected period.</strong></div>';
    }
    currentReportData = data;
    currentReportType = type;

    let headers, rows;

    switch (type) {
        case 'daily':
            headers = ['Date', 'New Users', 'Orders', 'Revenue'];
            rows = data.map(item => `<tr><td>${new Date(item.date).toLocaleDateString('en-GB')}</td><td>${item.newUsers}</td><td>${item.orders}</td><td>₹${item.revenue.toLocaleString('en-IN')}</td></tr>`).join('');
            break;
        case 'sales':
            headers = ['Book Title', 'Units Sold', 'Revenue'];
            rows = data.map(item => `<tr><td>${item.book}</td><td>${item.unitsSold}</td><td>₹${item.revenue.toLocaleString('en-IN')}</td></tr>`).join('');
            break;
        case 'referrals':
            headers = ['Referrer', 'Share ID', 'Referred Users', 'Total Sales from Referrals', 'Total Revenue from Referrals'];
            rows = data.map(item => `<tr><td><a href="#user-details?id=${item.referrerId}" data-route="user-details" class="admin-subtle-link">${item.referrerName}</a></td><td>${item.shareId}</td><td>${item.referredUsers}</td><td>${item.totalSales}</td><td>₹${item.totalRevenue.toLocaleString('en-IN')}</td></tr>`).join('');
            break;
        case 'sources':
            headers = ['Source', 'Registrations', 'Purchases', 'Revenue'];
            rows = data.map(item => `<tr><td>${item.source}</td><td>${item.registrations}</td><td>${item.purchases}</td><td>₹${(item.revenue || 0).toLocaleString('en-IN')}</td></tr>`).join('');
            break;
        default:
            return '<div class="admin-error">Invalid report type.</div>';
    }

    return `
        <div class="admin-table-wrapper sticky-header-table">
            <table class="admin-table">
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

export async function initReports() {
    initAdminLayout('Reports', 'Sales, referral, and source insights for the business.');

    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = `
        <div class="admin-section">
            <div class="admin-tabs">
                <button class="tab-link active" data-tab="daily">Daily Summary</button>
                <button class="tab-link" data-tab="sales">By Book</button>
                <button class="tab-link" data-tab="referrals">By Referrer</button>
                <button class="tab-link" data-tab="sources">By Source</button>
            </div>
            <div class="admin-card admin-controls">
                <input type="date" id="start-date-filter" class="admin-input" title="Start Date">
                <input type="date" id="end-date-filter" class="admin-input" title="End Date">
                <button id="export-csv-btn" class="admin-button">Export CSV</button>
            </div>
            <div id="reports-output" style="margin-top: 12px;"></div>
        </div>
    `;

    const output = document.getElementById('reports-output');
    const tabs = document.querySelectorAll('.tab-link');
    const startDateFilter = document.getElementById('start-date-filter');
    const endDateFilter = document.getElementById('end-date-filter');
    const exportBtn = document.getElementById('export-csv-btn');

    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
    startDateFilter.value = thirtyDaysAgo.toISOString().split('T')[0];
    endDateFilter.value = today.toISOString().split('T')[0];

    async function loadReport() {
        output.innerHTML = '<div class="admin-loading">Loading report data...</div>';
        const activeTab = document.querySelector('.tab-link.active').dataset.tab;

        const params = {
            startDate: startDateFilter.value,
            endDate: endDateFilter.value
        };

        let result;
        let tableHtml;

        try {
            switch (activeTab) {
                case 'daily':
                case 'sales':
                    result = await fetchSalesReport(params);
                    if (result.success) {
                        tableHtml = renderTable(activeTab === 'daily' ? result.data.daily : result.data.byBook, activeTab);
                    }
                    break;
                case 'referrals':
                    result = await fetchReferralReport(params);
                    if (result.success) tableHtml = renderTable(result.data, 'referrals');
                    break;
                case 'sources':
                    result = await fetchSourceReport(params);
                    if (result.success) tableHtml = renderTable(result.data, 'sources');
                    break;
            }

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data.');
            }
            output.innerHTML = tableHtml;
        } catch (error) {
            console.error(`Failed to load ${activeTab} report:`, error);
            output.innerHTML = `<div class="admin-error"><strong>Error loading report:</strong> ${error.message}</div>`;
        }
    }

    function exportToCsv() {
        if (currentReportData.length === 0) {
            alert("No data to export.");
            return;
        }

        let headers, rows;
        const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

        switch (currentReportType) {
            case 'daily':
                headers = ['Date', 'New Users', 'Orders', 'Revenue'];
                rows = currentReportData.map(item => [item.date, item.newUsers, item.orders, item.revenue].join(','));
                break;
            case 'sales':
                headers = ['Book Title', 'Units Sold', 'Revenue'];
                rows = currentReportData.map(item => [escapeCsv(item.book), item.unitsSold, item.revenue].join(','));
                break;
            case 'referrals':
                headers = ['Referrer', 'Share ID', 'Referred Users', 'Total Sales', 'Total Revenue'];
                rows = currentReportData.map(item => [escapeCsv(item.referrerName), escapeCsv(item.shareId), item.referredUsers, item.totalSales, item.totalRevenue].join(','));
                break;
            case 'sources':
                headers = ['Source', 'Registrations', 'Purchases', 'Revenue'];
                rows = currentReportData.map(item => [escapeCsv(item.source), item.registrations, item.purchases, item.revenue || 0].join(','));
                break;
            default:
                return;
        }

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `aarogyam_report_${currentReportType}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadReport();
        });
    });

    startDateFilter.addEventListener('change', loadReport);
    endDateFilter.addEventListener('change', loadReport);
    exportBtn.addEventListener('click', exportToCsv);

    // Initial load
    loadReport();
}
