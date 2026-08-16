/* Admin Dashboard Page */

import { navigateTo } from './admin-router.js';
import { initAdminLayout } from './admin-main.js';
import { fetchDashboardData, fetchCheckoutSummary } from './admin-api.js';

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

function renderBirthdaysWidget(birthdays) {
    let content;
    if (!birthdays || birthdays.length === 0) {
        content = '<div class="admin-empty-sm">आज किसी का जन्मदिन नहीं है।</div>';
    } else {
        content = `
            <ul class="admin-activity-list">
                ${birthdays.map(user => {
                    const sanitizedMobile = String(user.mobile || '').replace(/\D/g, '');
                    let whatsappNumber = sanitizedMobile;
                    if (whatsappNumber.length === 10) {
                        whatsappNumber = '91' + whatsappNumber;
                    }
                    const message = `नमस्कार ${user.full_name} जी 🙏\nआपको जन्मदिन की हार्दिक शुभकामनाएँ 🎂🎉\nमैं Aarogyam India का AI सहायक हूँ।\nआपकी क्या मदद कर सकता हूँ?`;
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

                    return `
                        <li style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <strong>🎂 ${user.full_name}</strong>
                                <span>📅 ${new Date(user.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} | 📱 ${user.mobile}</span>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <a href="tel:${sanitizedMobile}" class="admin-button small-button">📞 Call</a>
                                <a href="${whatsappUrl}" target="_blank" class="admin-button small-button">💬 WhatsApp</a>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>`;
    }

    return `
        <div class="admin-section" id="birthdays-widget">
            <div class="admin-section-title">🎂 Today's Birthdays</div>
            ${content}
        </div>`;
}

function renderCheckoutFunnelWidget(summary) {
  if (!summary) return '';
  return `
    <div class="admin-section" id="checkout-funnel-summary">
        <div class="admin-section-header">
          <div class="admin-section-title">Checkout Funnel</div>
          <div class="admin-controls">
            <label for="checkout-date-filter" class="admin-label">📅 Date:</label>
            <select id="checkout-date-filter" class="admin-select">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="thismonth">This Month</option>
              <option value="custom">Custom Date</option>
            </select>
            <input type="date" id="checkout-custom-date" class="admin-input" style="display: none;">
          </div>
        </div>
        <div class="kpi-row" id="checkout-kpi-row">
            <div class="kpi-card clickable" data-status="followup"> <div class="kpi-label">🔥 Follow-up Required</div> <div class="kpi-value">${summary.follow_up || 0}</div> </div>
            <div class="kpi-card clickable" data-status="initiated"> <div class="kpi-label">🟠 Initiated</div> <div class="kpi-value">${summary.initiated || 0}</div> </div>
            <div class="kpi-card clickable" data-status="dropped"> <div class="kpi-label">🔴 Dropped</div> <div class="kpi-value">${summary.dropped || 0}</div> </div>
            <div class="kpi-card clickable" data-status="failed"> <div class="kpi-label">❌ Failed</div> <div class="kpi-value">${summary.failed || 0}</div> </div>
            <div class="kpi-card clickable" data-status="success"> <div class="kpi-label">🟢 Success</div> <div class="kpi-value">${summary.success || 0}</div> </div>
            <div class="kpi-card"> <div class="kpi-label">📈 Conversion</div> <div class="kpi-value">${summary.conversion_rate || '0%'}</div> </div>
        </div>
    </div>`;
}

export async function initDashboard() {
  initAdminLayout('Dashboard', 'Business, lead and share metrics in one place.');

  const content = document.getElementById('page-content');
  if (!content) return;
  content.innerHTML = '<div class="admin-loading">Loading dashboard data...</div>';

  try {
    // This function will fetch data and update the business summary KPIs
    async function updateBusinessSummary() {
        const businessDateFilter = document.getElementById('business-date-filter');
        const businessCustomDate = document.getElementById('business-custom-date');
        const businessSummaryContainer = document.getElementById('business-summary');
        const kpiRowContainer = businessSummaryContainer.querySelector('.kpi-row-container');

        const filterValue = businessDateFilter.value;
        const customDateValue = businessCustomDate.value;
        let startDate, endDate;
        const now = new Date();

        businessCustomDate.style.display = 'none';

        switch (filterValue) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'yesterday':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'last7days':
                startDate = new Date(new Date().setDate(now.getDate() - 6));
                endDate = new Date(new Date().setDate(now.getDate() + 1));
                break;
            case 'thismonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
            case 'custom':
                businessCustomDate.style.display = 'inline-block';
                if (customDateValue) {
                    const selectedDate = new Date(customDateValue);
                    startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
                } else {
                    return; // Don't fetch until a date is picked
                }
                break;
            case 'last30days':
            default:
                startDate = new Date(new Date().setDate(now.getDate() - 29));
                endDate = new Date(new Date().setDate(now.getDate() + 1));
                break;
        }

        if(kpiRowContainer) {
            kpiRowContainer.style.opacity = '0.5';
        }

        const result = await fetchDashboardData({ startDate, endDate });

        if(kpiRowContainer) kpiRowContainer.style.opacity = '1';

        if (result.success && result.data) {
            const { businessKpis } = result.data;
            if (businessSummaryContainer) {
                kpiRowContainer.innerHTML = renderKpiGroup(businessKpis);
            }
        } else {
            console.error("Failed to update business summary");
        }
    }

    const result = await fetchDashboardData(); // Initial load

    if (!result.success || !result.data) {
      content.innerHTML = '<div class="admin-error"><strong>Unable to load dashboard data.</strong><br>Please try again later.</div>';
      return;
    }

    const { shareSummary, businessKpis, leadSources, customerJourney, bookSales, recentActivity, todaysCheckoutSummary, todaysBirthdays } = result.data;
    
    // Use live data for Share KPIs, with fallbacks
    const shareKpis = [
      { label: 'Total Shares', value: shareSummary.totalShares || 0 },
      { label: 'Total Clicks', value: shareSummary.totalClicks || 0 },
      { label: 'Total Visitors', value: shareSummary.totalVisitors || 0 },
      { label: 'Total Leads', value: shareSummary.totalLeads || 0 },
      { label: 'Total Active Users', value: (shareSummary.totalActiveUsers || 0).toLocaleString('en-IN') },
      { label: 'Total Inactive Users', value: (shareSummary.totalInactiveUsers || 0).toLocaleString('en-IN') },
      { label: 'Total Purchases', value: shareSummary.totalPurchases || 0 },
      { label: 'Total Revenue', value: `₹${(shareSummary.totalRevenue || 0).toLocaleString('en-IN')}` }
    ];

    content.innerHTML = `
      <div class="admin-section" id="share-summary">
        <div class="admin-section-title">Share Engine Summary</div>
        ${renderKpiGroup(shareKpis)}
      </div>
      <div class="admin-section" id="business-summary">
        <div class="admin-section-header">
            <div class="admin-section-title">Business Summary</div>
            <div class="admin-controls">
                <select id="business-date-filter" class="admin-select">
                  <option value="last30days" selected>Last 30 Days</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="thismonth">This Month</option>
                  <option value="custom">Custom Date</option>
                </select>
                <input type="date" id="business-custom-date" class="admin-input" style="display: none;">
            </div>
        </div>
        <div class="kpi-row-container">
          ${renderKpiGroup(businessKpis)}
        </div>
      </div>
      ${renderBirthdaysWidget(todaysBirthdays)}
      ${renderCheckoutFunnelWidget(todaysCheckoutSummary)}
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

    // After rendering, set default dates and add listeners for Business Summary
    const businessDateFilter = document.getElementById('business-date-filter');
    const businessCustomDate = document.getElementById('business-custom-date');

    if(businessDateFilter && businessCustomDate) {
        businessCustomDate.value = new Date().toISOString().split('T')[0]; // Set default for custom picker
        businessDateFilter.addEventListener('change', updateBusinessSummary);
        businessCustomDate.addEventListener('change', updateBusinessSummary);
    }

    // Add event listeners for the checkout widget
    const checkoutCards = document.querySelectorAll('#checkout-funnel-summary .kpi-card.clickable');
    checkoutCards.forEach(card => {
        card.addEventListener('click', () => {
            const status = card.dataset.status;
            window.location.hash = `checkout-funnel?status=${status}`;
        });
    });

    const dateFilter = document.getElementById('checkout-date-filter');
    const customDateInput = document.getElementById('checkout-custom-date');

    const handleFilterChange = async () => {
      const filterValue = dateFilter.value;
      let startDate, endDate;
      const now = new Date();

      customDateInput.style.display = 'none';

      switch (filterValue) {
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
          customDateInput.style.display = 'inline-block';
          if (customDateInput.value) {
            const selectedDate = new Date(customDateInput.value);
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
          } else {
            return; // Don't fetch until a date is chosen
          }
          break;
        case 'today':
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
      }
      
      const widget = document.getElementById('checkout-funnel-summary');
      const kpiRow = widget.querySelector('#checkout-kpi-row');
      kpiRow.style.opacity = '0.5';

      const result = await fetchCheckoutSummary({ startDate, endDate });
      
      kpiRow.style.opacity = '1';

      if (result.success) {
        const summary = { initiated: 0, dropped: 0, failed: 0, success: 0 };
        (result.data || []).forEach(log => {
            if (summary.hasOwnProperty(log.status)) summary[log.status]++;
        });
        summary.follow_up = summary.initiated + summary.dropped + summary.failed;
        const totalAttempts = summary.initiated + summary.dropped + summary.failed + summary.success;
        summary.conversion_rate = totalAttempts > 0 ? ((summary.success / totalAttempts) * 100).toFixed(1) + '%' : '0%';

        widget.querySelector('[data-status="followup"] .kpi-value').textContent = summary.follow_up;
        widget.querySelector('[data-status="initiated"] .kpi-value').textContent = summary.initiated;
        widget.querySelector('[data-status="dropped"] .kpi-value').textContent = summary.dropped;
        widget.querySelector('[data-status="failed"] .kpi-value').textContent = summary.failed;
        widget.querySelector('[data-status="success"] .kpi-value').textContent = summary.success;
        widget.querySelector('.kpi-card:not(.clickable) .kpi-value').textContent = summary.conversion_rate;
      }
    };

    dateFilter.addEventListener('change', handleFilterChange);
    customDateInput.addEventListener('change', handleFilterChange);

  } catch (err) {
    console.error('admin-pages-dashboard init error', err);
    content.innerHTML = '<div class="admin-error"><strong>Unable to load dashboard.</strong><br>Something went wrong.</div>';
  }
}
