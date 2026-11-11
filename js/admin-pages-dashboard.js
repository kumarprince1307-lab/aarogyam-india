/* Admin Dashboard Page - Progressive Load with Today's Priority Action Hub */

import { navigateTo } from './admin-router.js';
import { initAdminLayout } from './admin-main.js';
import { 
  fetchTodayPriorityDashboardData,
  fetchDashboardData, 
  fetchCheckoutSummary, 
  fetchUcasDashboardSummary 
} from './admin-api.js';

// Top-Level Render Helpers for Full Historical Dashboard
function renderUcasDetailWidget(summary) {
  if (!summary) return '';
  return `
    <div class="admin-section" id="ucas-detail-summary" style="margin-bottom: 24px;">
      <div class="admin-section-header">
        <div class="admin-section-title" style="display:flex;align-items:center;gap:8px;">
          <span>⚡ UCAS DETAIL</span>
          <span style="font-size:0.75rem;background:rgba(16,185,129,0.15);color:#10b981;padding:2px 8px;border-radius:12px;font-weight:700;">Live Database</span>
        </div>
      </div>
      <div class="kpi-row" id="ucas-kpi-row">
        <div class="kpi-card clickable" data-route="users" title="सभी यूज़र्स देखें" style="cursor:pointer;">
          <div class="kpi-label">👥 Total UCAS Users</div>
          <div class="kpi-value">${summary.totalUsers || 0}</div>
        </div>
        <div class="kpi-card clickable" data-route="users" data-status="active" title="सक्रिय यूज़र्स देखें" style="cursor:pointer;">
          <div class="kpi-label">🟢 Active Users</div>
          <div class="kpi-value" style="color:#10b981;">${summary.activeUsers || 0}</div>
        </div>
        <div class="kpi-card clickable" data-route="users" data-status="inactive" title="निष्क्रिय यूज़र्स देखें" style="cursor:pointer;">
          <div class="kpi-label">🔴 Inactive Users</div>
          <div class="kpi-value" style="color:#ef4444;">${summary.inactiveUsers || 0}</div>
        </div>
        <div class="kpi-card clickable" data-route="users" data-status="active" title="सब्सक्राइबर्स देखें" style="cursor:pointer;">
          <div class="kpi-label">⭐ Subscribers</div>
          <div class="kpi-value" style="color:#f59e0b;">${summary.totalSubscribers || 0}</div>
        </div>
        <div class="kpi-card clickable" data-route="all-surveys" title="सर्वेक्षण देखें" style="cursor:pointer;">
          <div class="kpi-label">📝 Total Surveys</div>
          <div class="kpi-value" style="color:#8b5cf6;">${summary.totalSurveys || 0}</div>
        </div>
        <div class="kpi-card clickable" data-route="all-phonebook" title="फोनबुक देखें" style="cursor:pointer;">
          <div class="kpi-label">📖 Total Phonebook</div>
          <div class="kpi-value" style="color:#3b82f6;">${summary.totalPhonebook || 0}</div>
        </div>
        <div class="kpi-card clickable" data-route="all-landing-pages" title="लैंडिंग पेज देखें" style="cursor:pointer;">
          <div class="kpi-label">📄 Landing Pages</div>
          <div class="kpi-value" style="color:#ec4899;">${summary.totalLandingPages || 0}</div>
        </div>
        <div class="kpi-card clickable" data-route="product-landing-pages" title="प्रोडक्ट पेज देखें" style="cursor:pointer;border-left:3px solid #f59e0b;">
          <div class="kpi-label">🛍️ Product Pages</div>
          <div class="kpi-value" style="color:#f59e0b;">${summary.totalProductPages || 0}</div>
        </div>
        <div class="kpi-card clickable" data-route="all-webinars" title="वेबिनार दर्शक देखें" style="cursor:pointer;">
          <div class="kpi-label">🎥 Webinar Attendees</div>
          <div class="kpi-value" style="color:#2563eb;">${summary.totalWebinarAttendees || 0}</div>
        </div>
        <div class="kpi-card" title="शेयर व प्रतिक्रियाएं">
          <div class="kpi-label">🔗 Shares / Responses</div>
          <div class="kpi-value">${summary.totalShares || 0} / ${summary.surveyResponses || 0}</div>
        </div>
      </div>
    </div>
  `;
}

function renderSakhiDashboardWidget(sakhi) {
  if (!sakhi) return '';
  const totalUsers = sakhi.totalUsers || 0;
  const totalQuestions = sakhi.totalInteractions || 0;
  const domains = sakhi.domainCounts || {};
  const topDomainList = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([dom, cnt]) => `<span class="admin-pill" style="background:rgba(22,163,74,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.3);font-size:0.75rem;">${dom}: <strong>${cnt}</strong></span>`)
    .join(' ');

  return `
    <div class="admin-section" id="sakhi-summary-widget" style="background: linear-gradient(135deg, rgba(6,78,59,0.35) 0%, rgba(15,23,42,0.6) 100%); border: 1.5px solid rgba(16,185,129,0.4); border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #15803d; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
            🌾
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 900; color: #f8fafc; letter-spacing: -0.2px;">
              आरोग्यम सखी AI — मुख्य सांख्यिकी (Sakhi AI Insights)
            </h3>
            <p style="margin: 2px 0 0 0; font-size: 0.78rem; color: #a7f3d0;">
              24x7 किसान साथियों की खेती व स्वास्थ्य सहायता डैशबोर्ड
            </p>
          </div>
        </div>
        <a href="#sakhi-ai-hub" data-route="sakhi-ai-hub" class="admin-button small-button" style="background: #059669; color: #fff; border: none; font-weight: 800; font-size: 0.78rem; padding: 6px 14px; border-radius: 20px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <span>सखी AI हब देखें &rarr;</span>
        </a>
      </div>

      <div class="kpi-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 4px;">
        <div class="kpi-card" style="background: rgba(15,23,42,0.7); border: 1px solid rgba(52,211,153,0.3); border-radius: 12px; padding: 12px 16px;">
          <div class="kpi-label" style="color: #94a3b8; font-size: 0.75rem; font-weight: 700;">सखी से जुड़े किसान</div>
          <div class="kpi-value" style="color: #34d399; font-size: 1.5rem; font-weight: 900;">${totalUsers.toLocaleString('en-IN')}</div>
        </div>
        <div class="kpi-card" style="background: rgba(15,23,42,0.7); border: 1px solid rgba(56,189,248,0.3); border-radius: 12px; padding: 12px 16px;">
          <div class="kpi-label" style="color: #94a3b8; font-size: 0.75rem; font-weight: 700;">कुल पूछे गए सवाल / परामर्श</div>
          <div class="kpi-value" style="color: #38bdf8; font-size: 1.5rem; font-weight: 900;">${totalQuestions.toLocaleString('en-IN')}</div>
        </div>
        <div class="kpi-card" style="background: rgba(15,23,42,0.7); border: 1px solid rgba(251,191,36,0.3); border-radius: 12px; padding: 12px 16px;">
          <div class="kpi-label" style="color: #94a3b8; font-size: 0.75rem; font-weight: 700;">प्रमुख परामर्श विषय</div>
          <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">
            ${topDomainList || '<span style="color:#64748b;font-size:0.75rem;">धान, गेहूं, गन्ना, पशुपालन</span>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

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
    return '<div class="admin-empty-sm">No book sales data available for this period.</div>';
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
    <div class="u-row" style="flex-wrap:wrap;gap:8px;">
      <a href="product-landing-pages.html" class="admin-button" style="background:#f59e0b;color:#fff;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">🛍️ Product Landing Pages</a>
      <a href="all-landing-pages.html" class="admin-button" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">📢 Create Campaign</a>
      <a href="marketing-templates.html" class="admin-button" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">🪝 Hook Templates</a>
    </div>
  </div>`;
}

function renderBirthdaysWidget(birthdays) {
  let content;
  if (!birthdays || birthdays.length === 0) {
    content = '<div class="admin-empty-sm">आज किसी साथी का जन्मदिन नहीं है।</div>';
  } else {
    content = `
      <ul class="admin-activity-list">
        ${birthdays.map(user => {
          const sanitizedMobile = String(user.mobile || '').replace(/\D/g, '');
          let whatsappNumber = sanitizedMobile;
          if (whatsappNumber.length === 10) {
            whatsappNumber = '91' + whatsappNumber;
          }
          const message = `नमस्ते ${user.full_name} जी! 🎂\nआज आपके जन्मदिन की हार्दिक शुभकामनाएं! 🎉\nआप सदैव स्वस्थ व समृद्ध रहें।`;
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
            <div class="kpi-card clickable" data-status="followup"> <div class="kpi-label">📞 Follow-up Required</div> <div class="kpi-value">${summary.follow_up || 0}</div> </div>
            <div class="kpi-card clickable" data-status="initiated"> <div class="kpi-label">🟢 Initiated</div> <div class="kpi-value">${summary.initiated || 0}</div> </div>
            <div class="kpi-card clickable" data-status="dropped"> <div class="kpi-label">🔴 Dropped</div> <div class="kpi-value">${summary.dropped || 0}</div> </div>
            <div class="kpi-card clickable" data-status="failed"> <div class="kpi-label">⚠️ Failed</div> <div class="kpi-value">${summary.failed || 0}</div> </div>
            <div class="kpi-card clickable" data-status="success"> <div class="kpi-label">✅ Success</div> <div class="kpi-value">${summary.success || 0}</div> </div>
            <div class="kpi-card"> <div class="kpi-label">📈 Conversion</div> <div class="kpi-value">${summary.conversion_rate || '0%'}</div> </div>
        </div>
    </div>`;
}

// =========================================================================
// TODAY'S PRIORITY LIVE ACTION HUB (LIGHTNING SPEED, LOW-EGRESS)
// =========================================================================
function formatTime12h(isoDateStr) {
  if (!isoDateStr) return '';
  try {
    const d = new Date(isoDateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (_) {
    return '';
  }
}

function cleanPhoneForWa(mobile) {
  if (!mobile) return '';
  const digits = String(mobile).replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

function renderTodayPriorityHub(data) {
  const { todayCount, todayProfiles, todayPurchases, todayDropped } = data;
  const todayFormatted = new Date().toLocaleDateString('hi-IN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return `
    <div class="admin-section" id="today-priority-hub" style="background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92)); border: 2px solid #3b82f6; border-radius: 18px; padding: 20px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
      
      <!-- Hub Header with Live Pulse & Quick Refresh -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 4px 12px rgba(37,99,235,0.4);">
            ⚡
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="margin: 0; font-size: 1.3rem; font-weight: 900; color: #f8fafc; letter-spacing: -0.3px;">
                आज की मुख्य हलचल (Today's Pulse)
              </h2>
              <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(34,197,94,0.18); border: 1px solid #22c55e; color: #4ade80; padding: 2px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e; display: inline-block;"></span> 
                लाइव ट्रैकर
              </span>
            </div>
            <p style="margin: 4px 0 0 0; font-size: 0.82rem; color: #94a3b8;">
              📅 ${todayFormatted} • दिन में बार-बार चेक करने हेतु सुपर-फास्ट मोड
            </p>
          </div>
        </div>

        <button type="button" id="btn-refresh-today-hub" class="admin-button small-button" style="background: rgba(59,130,246,0.15); border: 1px solid #3b82f6; color: #60a5fa; font-weight: 800; font-size: 0.82rem; padding: 8px 16px; border-radius: 24px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <span>🔄 अभी रिफ्रेश करें</span>
        </button>
      </div>

      <!-- 3 Primary Action KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 16px;">
        
        <!-- CARD 1: आज कितने जुड़े -->
        <div class="kpi-card" style="background: rgba(15,23,42,0.8); border: 1.5px solid rgba(59,130,246,0.4); border-radius: 14px; padding: 16px; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div class="kpi-label" style="color: #93c5fd; font-size: 0.82rem; font-weight: 700;">👥 आज कितने जुड़े (New Users)</div>
              <div class="kpi-value" style="color: #60a5fa; font-size: 2.1rem; font-weight: 900; margin: 4px 0;">${todayCount.joined}</div>
              <div style="font-size: 0.75rem; color: #64748b;">आज नए पंजीकृत प्रोफाइल</div>
            </div>
            <button type="button" class="admin-button small-button today-expand-btn" data-target="detail-today-joined" style="background: #2563eb; color: #fff; font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; border: none; cursor: pointer;">
              📋 सूची देखें (${todayProfiles.length})
            </button>
          </div>
        </div>

        <!-- CARD 2: किसने खरीदा -->
        <div class="kpi-card" style="background: rgba(15,23,42,0.8); border: 1.5px solid rgba(34,197,94,0.4); border-radius: 14px; padding: 16px; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div class="kpi-label" style="color: #86efac; font-size: 0.82rem; font-weight: 700;">💰 किसने खरीदा (Successful Sales)</div>
              <div class="kpi-value" style="color: #4ade80; font-size: 2.1rem; font-weight: 900; margin: 4px 0;">
                ${todayCount.purchased} <span style="font-size: 1.1rem; color: #bbf7d0; font-weight: 700;">(₹${todayCount.revenue})</span>
              </div>
              <div style="font-size: 0.75rem; color: #64748b;">आज सफल ई-बुक बिक्री</div>
            </div>
            <button type="button" class="admin-button small-button today-expand-btn" data-target="detail-today-buyers" style="background: #16a34a; color: #fff; font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; border: none; cursor: pointer;">
              📋 खरीदार (${todayPurchases.length})
            </button>
          </div>
        </div>

        <!-- CARD 3: किसने ड्रॉप किया -->
        <div class="kpi-card" style="background: rgba(15,23,42,0.8); border: 1.5px solid rgba(239,68,68,0.4); border-radius: 14px; padding: 16px; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div class="kpi-label" style="color: #fca5a5; font-size: 0.82rem; font-weight: 700;">🚨 किसने ड्रॉप किया (Follow-up Leads)</div>
              <div class="kpi-value" style="color: #f87171; font-size: 2.1rem; font-weight: 900; margin: 4px 0;">${todayCount.dropped}</div>
              <div style="font-size: 0.75rem; color: #64748b;">ऑर्डर शुरू किया पर पेमेंट अधूरा</div>
            </div>
            <button type="button" class="admin-button small-button today-expand-btn" data-target="detail-today-dropped" style="background: #dc2626; color: #fff; font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; border: none; cursor: pointer;">
              📞 फॉलो-अप (${todayDropped.length})
            </button>
          </div>
        </div>

      </div>

      <!-- Expandable Detail Panes (Zero Clutter, Opens On Tap) -->
      
      <!-- Detail 1: आज जुड़े किसान -->
      <div id="detail-today-joined" class="today-detail-drawer" style="display: none; background: rgba(15,23,42,0.9); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: #60a5fa; font-size: 0.92rem;">👥 आज जुड़े नए किसान साथियों की सूची (${todayProfiles.length}):</strong>
          <span style="font-size: 0.75rem; color: #94a3b8;">1-क्लिक WhatsApp उपलब्ध</span>
        </div>
        ${todayProfiles.length === 0 ? '<div style="color:#64748b;font-size:0.85rem;padding:8px 0;">आज अभी तक कोई नया रजिस्ट्रेशन नहीं हुआ है।</div>' : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">
                  <th style="padding: 6px 8px;">नाम</th>
                  <th style="padding: 6px 8px;">मोबाइल</th>
                  <th style="padding: 6px 8px;">समय</th>
                  <th style="padding: 6px 8px;">सोर्स</th>
                  <th style="padding: 6px 8px; text-align: right;">एक्शन</th>
                </tr>
              </thead>
              <tbody>
                ${todayProfiles.map(u => {
                  const waNumber = cleanPhoneForWa(u.mobile);
                  const waMsg = encodeURIComponent(`नमस्ते ${u.full_name || 'किसान साथी'} जी! 🙏 आरोग्यम इंडिया में आपका स्वागत है। खेती या फसल संबंधी किसी भी सलाह हेतु सखी AI का उपयोग कर सकते हैं।`);
                  return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0;">
                      <td style="padding: 8px;"><strong>${u.full_name || 'अज्ञात'}</strong></td>
                      <td style="padding: 8px;">${u.mobile ? `<a href="tel:${u.mobile}" style="color:#38bdf8;text-decoration:none;">${u.mobile}</a>` : '—'}</td>
                      <td style="padding: 8px; color: #94a3b8; font-size: 0.78rem;">${formatTime12h(u.created_at)}</td>
                      <td style="padding: 8px;"><span style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-size:0.72rem;">${u.registration_source || 'direct'}</span></td>
                      <td style="padding: 8px; text-align: right;">
                        ${waNumber ? `<a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#22c55e;color:#000;font-weight:700;font-size:0.72rem;padding:3px 8px;border-radius:4px;text-decoration:none;">💬 WhatsApp</a>` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Detail 2: आज के खरीदार -->
      <div id="detail-today-buyers" class="today-detail-drawer" style="display: none; background: rgba(15,23,42,0.9); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: #4ade80; font-size: 0.92rem;">💰 आज खरीदार साथियों की सूची (${todayPurchases.length}):</strong>
          <span style="font-size: 0.75rem; color: #94a3b8;">कुल आय: ₹${todayCount.revenue}</span>
        </div>
        ${todayPurchases.length === 0 ? '<div style="color:#64748b;font-size:0.85rem;padding:8px 0;">आज अभी तक कोई सफल खरीदारी नहीं हुई है।</div>' : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">
                  <th style="padding: 6px 8px;">खरीदार साथी</th>
                  <th style="padding: 6px 8px;">मोबाइल</th>
                  <th style="padding: 6px 8px;">किताब</th>
                  <th style="padding: 6px 8px;">राशि</th>
                  <th style="padding: 6px 8px;">समय</th>
                  <th style="padding: 6px 8px; text-align: right;">धन्यवाद सन्देश</th>
                </tr>
              </thead>
              <tbody>
                ${todayPurchases.map(p => {
                  const waNumber = cleanPhoneForWa(p.customer_mobile);
                  const waMsg = encodeURIComponent(`नमस्ते ${p.customer_name} जी! 🙏 आरोग्यम इंडिया से "${p.book_title}" ई-बुक खरीदने के लिए आपका धन्यवाद! आपकी ई-बुक आपकी डिजिटल लाइब्रेरी में जोड़ दी गई है। कोई सहायता चाहिए तो बताएं।`);
                  return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0;">
                      <td style="padding: 8px;"><strong>${p.customer_name}</strong></td>
                      <td style="padding: 8px;">${p.customer_mobile ? `<a href="tel:${p.customer_mobile}" style="color:#38bdf8;text-decoration:none;">${p.customer_mobile}</a>` : '—'}</td>
                      <td style="padding: 8px; color: #fef08a;">${p.book_title}</td>
                      <td style="padding: 8px; font-weight: 800; color: #4ade80;">₹${p.amount}</td>
                      <td style="padding: 8px; color: #94a3b8; font-size: 0.78rem;">${formatTime12h(p.purchase_date)}</td>
                      <td style="padding: 8px; text-align: right;">
                        ${waNumber ? `<a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#16a34a;color:#fff;font-weight:700;font-size:0.72rem;padding:3px 8px;border-radius:4px;text-decoration:none;">🎉 धन्यवाद भेजें</a>` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Detail 3: आज किसने ड्रॉप किया (Follow-up) -->
      <div id="detail-today-dropped" class="today-detail-drawer" style="display: none; background: rgba(15,23,42,0.9); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: #f87171; font-size: 0.92rem;">🚨 तुरंत फॉलो-अप सूची (${todayDropped.length}) — ऑर्डर ड्रॉप करने वाले:</strong>
          <span style="font-size: 0.75rem; color: #94a3b8;">1-क्लिक फॉलो-अप से सेल कन्वर्ट करें</span>
        </div>
        ${todayDropped.length === 0 ? '<div style="color:#64748b;font-size:0.85rem;padding:8px 0;">शानदार! आज कोई अधूरा चेकआउट या ड्रॉप नहीं है।</div>' : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">
                  <th style="padding: 6px 8px;">किसान साथी</th>
                  <th style="padding: 6px 8px;">मोबाइल</th>
                  <th style="padding: 6px 8px;">किताब</th>
                  <th style="padding: 6px 8px;">स्टेटस</th>
                  <th style="padding: 6px 8px;">समय</th>
                  <th style="padding: 6px 8px; text-align: right;">फॉलो-अप एक्शन</th>
                </tr>
              </thead>
              <tbody>
                ${todayDropped.map(d => {
                  const waNumber = cleanPhoneForWa(d.customer_mobile);
                  const rawBook = String(d.book_id || d.book_title || '').trim();
                  const isBundle = rawBook.includes(',') || rawBook.toUpperCase().includes('BUNDLE') || rawBook.toUpperCase().includes('COMBO');
                  
                  const KNOWN_BOOKS = {
                    'BK017': { title: 'गेहूँ, चना, सरसों व रबी फसलें मास्टर गाइड 2026', desc: 'बीज से कटाई तक सम्पूर्ण रबी स्प्रे व खाद प्रबंधन' },
                    'BK016': { title: 'कृषि दवा डायरेक्टरी व टेक्निकल फॉर्मूले', desc: 'सभी कीटनाशक, फफूंदनाशी के असली टेक्निकल नाम व सही डोज' },
                    'BK002': { title: "'खेती का डॉक्टर' (Pocket Doctor)", desc: '300+ असली फोटो सहित फसलों के सभी रोग, कीट व पहचान' },
                    'BK019': { title: 'आधुनिक मक्का व तिलहन उत्पादन तकनीक', desc: 'कम लागत में बंपर पैदावार का संपूर्ण वैज्ञानिक फॉर्मूला' },
                    'BK020': { title: 'प्राकृतिक खेती व जैविक खाद निर्माण गाइड', desc: 'जीवामृत, घनजीवामृत व जैविक कीटनाशक बनाने की विधि' },
                    'BK001': { title: 'खरीफ फसल मास्टर गाइड 2026', desc: 'धान, सोयाबीन, मक्का व दलहन का 150+ पेज का संपूर्ण वैज्ञानिक समाधान' },
                    'BK015': { title: 'सब्जी की उन्नत वैज्ञानिक खेती', desc: '11 प्रमुख सब्जियों की संपूर्ण वैज्ञानिक बुवाई व देखभाल' },
                    'BK018': { title: 'घर बैठे पैसे कैसे कमाएँ? (Income Guide)', desc: 'व्यावहारिक कमाई के तरीके व आत्मनिर्भर बनने की गाइड' }
                  };

                  let displayBookTitle = 'ई-बुक';
                  let waMsgText = '';

                  if (isBundle) {
                    displayBookTitle = '📚 5-इन-1 सम्पूर्ण किसान कॉम्बो (5 पुस्तकें)';
                    const ids = rawBook.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
                    const activeIds = ids.length > 0 ? ids : ['BK017', 'BK016', 'BK002', 'BK019', 'BK020'];
                    let listText = '';
                    activeIds.forEach((id, idx) => {
                      const b = KNOWN_BOOKS[id] || { title: id, desc: 'डिजिटल गाइड' };
                      listText += `${idx + 1}. *${b.title}* — ${b.desc}\n`;
                    });

                    waMsgText = `नमस्ते ${d.customer_name || 'किसान साथी'} जी! 🙏\n\nआशा है आप सपरिवार सकुशल व प्रसन्नचित्त होंगे 🌿\n\nहमने देखा कि आप आरोग्यम इंडिया से *5-इन-1 सम्पूर्ण किसान डिजिटल कॉम्बो (5 पुस्तकें)* प्राप्त करने का प्रयास कर रहे थे, लेकिन किसी तकनीकी रुकावट या व्यस्तता के कारण आपका ऑर्डर अधूरा रह गया।\n\n📚 *इस कॉम्बो में शामिल हैं ये 5 महत्वपूर्ण पुस्तकें:*\n${listText}\n❤️ *हम आपके साथ हैं:*\nयदि ऑनलाइन पेमेंट करने में कोई परेशानी आ रही हो, तो आप मात्र ₹149 सीधे हमारे आधिकारिक UPI (7974422572) पर भेजकर स्क्रीनशॉट दे सकते हैं। हम आपकी 5 पुस्तकें तुरंत सक्रिय (Activate) कर देंगे।\n\nआपकी आरोग्यम इंडिया टीम 🌾`;
                  } else {
                    const cleanId = rawBook.toUpperCase();
                    const single = KNOWN_BOOKS[cleanId] || { title: d.book_title || rawBook, desc: 'सम्पूर्ण वैज्ञानिक गाइड' };
                    displayBookTitle = single.title;
                    waMsgText = `नमस्ते ${d.customer_name || 'किसान साथी'} जी! 🙏\n\nआशा है आप सपरिवार सकुशल व प्रसन्नचित्त होंगे 🌿\n\nहमने देखा कि आप आरोग्यम इंडिया से *"${single.title}"* ई-बुक प्राप्त करने का प्रयास कर रहे थे, लेकिन किसी तकनीकी समस्या के कारण आपका ऑर्डर अधूरा रह गया।\n\n📖 *पुस्तक विवरण:* ${single.desc}।\n\n❤️ *हम आपके साथ हैं:*\nयदि ऑनलाइन पेमेंट करने में कोई परेशानी आ रही हो, तो आप सीधे हमारे आधिकारिक UPI (7974422572) पर भेजकर स्क्रीनशॉट दे सकते हैं, आपकी ई-बुक तुरंत सक्रिय कर दी जाएगी।\n\nआपकी आरोग्यम इंडिया टीम 🌾`;
                  }

                  const waMsg = encodeURIComponent(waMsgText);
                  return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0;">
                      <td style="padding: 8px;"><strong>${d.customer_name}</strong></td>
                      <td style="padding: 8px;">${d.customer_mobile ? `<a href="tel:${d.customer_mobile}" style="color:#f87171;text-decoration:none;">${d.customer_mobile}</a>` : '—'}</td>
                      <td style="padding: 8px; color: #fde047; font-weight: 700;">${displayBookTitle}</td>
                      <td style="padding: 8px;"><span style="background:rgba(239,68,68,0.15);color:#fca5a5;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:700;">${d.status}</span></td>
                      <td style="padding: 8px; color: #94a3b8; font-size: 0.78rem;">${formatTime12h(d.created_at)}</td>
                      <td style="padding: 8px; text-align: right; white-space: nowrap;">
                        ${d.customer_mobile ? `<a href="tel:${d.customer_mobile}" class="admin-button small-button" style="background:#334155;color:#fff;font-size:0.72rem;padding:3px 7px;border-radius:4px;text-decoration:none;margin-right:4px;">📞 Call</a>` : ''}
                        ${waNumber ? `<a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#dc2626;color:#fff;font-weight:700;font-size:0.72rem;padding:3px 8px;border-radius:4px;text-decoration:none;">💬 सहायता सन्देश</a>` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

    </div>
  `;
}

// =========================================================================
// MAIN EXPORTED DASHBOARD INITIALIZER
// =========================================================================
export async function initDashboard() {
  initAdminLayout('Dashboard', 'बिजनेस, लाइव हलचल व शेयर मेट्रिक्स');

  const content = document.getElementById('page-content');
  if (!content) return;

  // Ultra-fast instant loader
  content.innerHTML = `
    <div style="padding: 30px; text-align: center; color: #94a3b8;">
      <div style="font-size: 2rem; margin-bottom: 8px;">⚡</div>
      <div style="font-size: 1rem; font-weight: 700; color: #f8fafc;">आज की मुख्य हलचल लोड हो रही है...</div>
      <div style="font-size: 0.78rem; color: #64748b; margin-top: 4px;">कम इंटरनेट स्पीड में भी सुपर-फास्ट लोडिंग</div>
    </div>
  `;

  try {
    // Step 1: Fetch ONLY Today's Priority Data (Fast indexed query in <250ms)
    const priorityResult = await fetchTodayPriorityDashboardData();
    if (!priorityResult.success || !priorityResult.data) {
      content.innerHTML = '<div class="admin-error"><strong>डैशबोर्ड डेटा लोड नहीं हो सका।</strong><br>कृपया दोबारा प्रयास करें।</div>';
      return;
    }

    const todayData = priorityResult.data;

    // Render Initial View: Today's Pulse Hub + Lazy Load Full Dashboard Button
    content.innerHTML = `
      ${renderTodayPriorityHub(todayData)}

      <!-- Lazy Load Full Dashboard Toggle Container -->
      <div style="margin: 28px 0 20px; text-align: center;">
        <button type="button" id="btn-toggle-full-dashboard" class="admin-button" style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #f8fafc; border: 1.5px solid #334155; padding: 12px 28px; border-radius: 30px; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.25); transition: all 0.2s ease;">
          <span id="full-dashboard-btn-icon">📊</span>
          <span id="full-dashboard-btn-text">पूरा डैशबोर्ड एनालिटिक्स व 30-दिन डेटा लोड करें ↓</span>
        </button>
        <p style="font-size: 0.78rem; color: #64748b; margin-top: 6px;">
          💡 कम इंटरनेट व तेज़ स्पीड हेतु पुराना व विस्तृत डेटा तभी लोड होगा जब आप ऊपर क्लिक करेंगे।
        </p>
      </div>

      <!-- Container where full dashboard will lazily expand -->
      <div id="full-dashboard-container" style="display: none;"></div>
    `;

    // Wire Up Today Priority Hub Interaction (Toggles & Refresh)
    setupTodayHubListeners(todayData);

    // Wire Up Lazy Full Dashboard Loading
    let fullDashboardLoaded = false;
    let fullDashboardVisible = false;
    const toggleBtn = document.getElementById('btn-toggle-full-dashboard');
    const fullContainer = document.getElementById('full-dashboard-container');
    const btnIcon = document.getElementById('full-dashboard-btn-icon');
    const btnText = document.getElementById('full-dashboard-btn-text');

    if (toggleBtn && fullContainer) {
      toggleBtn.addEventListener('click', async () => {
        if (!fullDashboardLoaded) {
          btnText.textContent = 'विस्तृत एनालिटिक्स लोड हो रहा है...';
          btnIcon.textContent = '⏳';
          fullContainer.style.display = 'block';
          fullContainer.innerHTML = `
            <div style="padding: 24px; text-align: center; color: #94a3b8; background: rgba(15,23,42,0.6); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.15);">
              <div style="font-size: 1.5rem; margin-bottom: 6px;">📊</div>
              <div>UCAS, सखी AI, शेयर व 30-दिन रिपोर्ट लोड हो रही है...</div>
            </div>
          `;

          await loadFullDashboard(fullContainer);
          fullDashboardLoaded = true;
          fullDashboardVisible = true;
          btnText.textContent = 'विस्तृत एनालिटिक्स छुपाएं ↑';
          btnIcon.textContent = '🔼';
          toggleBtn.style.background = '#334155';
        } else {
          fullDashboardVisible = !fullDashboardVisible;
          fullContainer.style.display = fullDashboardVisible ? 'block' : 'none';
          btnText.textContent = fullDashboardVisible ? 'विस्तृत एनालिटिक्स छुपाएं ↑' : 'पूरा डैशबोर्ड एनालिटिक्स व पुराना डेटा देखें ↓';
          btnIcon.textContent = fullDashboardVisible ? '🔼' : '📊';
        }
      });
    }

  } catch (err) {
    console.error('admin-pages-dashboard init error', err);
    content.innerHTML = '<div class="admin-error"><strong>डैशबोर्ड लोड करने में समस्या आई।</strong><br>कृपया नेटवर्क जांचें।</div>';
  }
}

// =========================================================================
// HELPER: WIRE UP TODAY'S HUB LISTENERS
// =========================================================================
function setupTodayHubListeners(todayData) {
  // Detail Drawers Toggling
  const expandBtns = document.querySelectorAll('.today-expand-btn');
  expandBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const drawer = document.getElementById(targetId);
      if (!drawer) return;

      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      // Close other drawers
      document.querySelectorAll('.today-detail-drawer').forEach(d => {
        if (d.id !== targetId) d.style.display = 'none';
      });
      drawer.style.display = isHidden ? 'block' : 'none';
    });
  });

  // Quick Refresh Hub Button
  const refreshBtn = document.getElementById('btn-refresh-today-hub');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<span>⏳ रिफ्रेश हो रहा है...</span>';
      try {
        const priorityResult = await fetchTodayPriorityDashboardData();
        if (priorityResult.success && priorityResult.data) {
          const oldHub = document.getElementById('today-priority-hub');
          if (oldHub) {
            oldHub.outerHTML = renderTodayPriorityHub(priorityResult.data);
            setupTodayHubListeners(priorityResult.data);
          }
        }
      } catch (e) {
        console.error("Refresh today hub failed:", e);
      }
    });
  }
}

// =========================================================================
// HELPER: LAZY LOAD FULL HISTORICAL DASHBOARD
// =========================================================================
async function loadFullDashboard(container) {
  try {
    const [result, ucasRes] = await Promise.all([
      fetchDashboardData(),
      fetchUcasDashboardSummary()
    ]);

    if (!result.success || !result.data) {
      container.innerHTML = '<div class="admin-error">विस्तृत डेटा लोड नहीं हो सका।</div>';
      return;
    }

    const { 
      shareSummary, 
      businessKpis, 
      leadSources, 
      customerJourney, 
      bookSales, 
      recentActivity, 
      todaysCheckoutSummary, 
      todaysBirthdays, 
      sakhiSummary 
    } = result.data;

    const ucasSummary = ucasRes.success ? ucasRes.data : {};

    const shareKpis = [
      { label: 'Total Shares', value: shareSummary.totalShares || 0 },
      { label: 'Total Clicks', value: shareSummary.totalClicks || 0 },
      { label: 'Total Visitors', value: shareSummary.totalVisitors || 0 },
      { label: 'Total Leads', value: shareSummary.totalLeads || 0 },
      { label: 'Total App Installs', value: (shareSummary.totalAppInstalls || 0).toLocaleString('en-IN') },
      { label: 'Total Active Users', value: (shareSummary.totalActiveUsers || 0).toLocaleString('en-IN') },
      { label: 'Total Inactive Users', value: (shareSummary.totalInactiveUsers || 0).toLocaleString('en-IN') },
      { label: 'Total Purchases', value: shareSummary.totalPurchases || 0 },
      { label: 'Total Revenue', value: `₹${(shareSummary.totalRevenue || 0).toLocaleString('en-IN')}` }
    ];

    container.innerHTML = `
      ${renderUcasDetailWidget(ucasSummary)}
      ${renderSakhiDashboardWidget(sakhiSummary)}
      <div class="admin-section" id="share-summary">
        <div class="admin-section-title">Share Engine Summary</div>
        ${renderKpiGroup(shareKpis)}
      </div>
      <div class="admin-section" id="business-summary">
        <div class="admin-section-header">
            <div class="admin-section-title">Business Summary (Historical)</div>
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
            <div class="admin-section-header">
              <div class="admin-section-title">Book Sales</div>
              <div class="admin-controls">
                  <select id="booksales-date-filter" class="admin-select">
                    <option value="last30days" selected>Last 30 Days</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="thismonth">This Month</option>
                    <option value="custom">Custom Date</option>
                  </select>
                  <input type="date" id="booksales-custom-date" class="admin-input" style="display: none;">
              </div>
            </div>
            <div id="book-sales-content">${renderBookSales(bookSales)}</div>
          </div>
          ${renderQuickActions()}
        </div>
        <div class="admin-col">${renderTopBooks(bookSales)}${renderActivity(recentActivity)}</div>
      </div>
    `;

    // UCAS Detail KPI Click Handlers
    container.querySelectorAll('#ucas-kpi-row .kpi-card.clickable').forEach(card => {
      card.addEventListener('click', () => {
        const route = card.dataset.route;
        const status = card.dataset.status;
        const param = card.dataset.param;
        if (route) {
          if (param) {
            window.location.href = `${route}.html?${param}`;
          } else if (status) {
            window.location.hash = `${route}?status=${status}`;
          } else {
            window.location.hash = route;
          }
        }
      });
    });

    // Business Summary Date Filter Handler
    const businessDateFilter = container.querySelector('#business-date-filter');
    const businessCustomDate = container.querySelector('#business-custom-date');
    const businessSummaryContainer = container.querySelector('#business-summary');
    const kpiRowContainer = businessSummaryContainer?.querySelector('.kpi-row-container');

    async function updateBusinessSummary() {
      if (!businessDateFilter || !businessSummaryContainer) return;
      const filterValue = businessDateFilter.value;
      const customDateValue = businessCustomDate?.value;
      let startDate, endDate;
      const now = new Date();

      if (businessCustomDate) businessCustomDate.style.display = 'none';

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
          if (businessCustomDate) businessCustomDate.style.display = 'inline-block';
          if (customDateValue) {
            const selectedDate = new Date(customDateValue);
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
          } else {
            return;
          }
          break;
        case 'last30days':
        default:
          startDate = new Date(new Date().setDate(now.getDate() - 29));
          endDate = new Date(new Date().setDate(now.getDate() + 1));
          break;
      }

      if (kpiRowContainer) kpiRowContainer.style.opacity = '0.5';
      const bRes = await fetchDashboardData({ startDate, endDate });
      if (kpiRowContainer) kpiRowContainer.style.opacity = '1';

      if (bRes.success && bRes.data && kpiRowContainer) {
        kpiRowContainer.innerHTML = renderKpiGroup(bRes.data.businessKpis);
      }
    }

    if (businessDateFilter && businessCustomDate) {
      businessCustomDate.value = new Date().toISOString().split('T')[0];
      businessDateFilter.addEventListener('change', updateBusinessSummary);
      businessCustomDate.addEventListener('change', updateBusinessSummary);
    }

    // Book Sales Date Filter Handler
    const bookSalesDateFilter = container.querySelector('#booksales-date-filter');
    const bookSalesCustomDate = container.querySelector('#booksales-custom-date');
    const contentContainer = container.querySelector('#book-sales-content');

    async function updateBookSalesWidget() {
      if (!bookSalesDateFilter || !contentContainer) return;
      const filterValue = bookSalesDateFilter.value;
      const customDateValue = bookSalesCustomDate?.value;
      let startDate, endDate;
      const now = new Date();

      if (bookSalesCustomDate) bookSalesCustomDate.style.display = 'none';

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
          if (bookSalesCustomDate) bookSalesCustomDate.style.display = 'inline-block';
          if (customDateValue) {
            const selectedDate = new Date(customDateValue);
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
          } else {
            return;
          }
          break;
        case 'last30days':
        default:
          startDate = new Date(new Date().setDate(now.getDate() - 29));
          endDate = new Date(new Date().setDate(now.getDate() + 1));
          break;
      }

      contentContainer.innerHTML = '<div class="admin-loading-sm">Loading...</div>';
      const sRes = await fetchDashboardData({ startDate, endDate });
      if (sRes.success && sRes.data) {
        contentContainer.innerHTML = renderBookSales(sRes.data.bookSales);
      } else {
        contentContainer.innerHTML = '<div class="admin-error-sm">Could not load data.</div>';
      }
    }

    if (bookSalesDateFilter && bookSalesCustomDate) {
      bookSalesDateFilter.addEventListener('change', updateBookSalesWidget);
      bookSalesCustomDate.addEventListener('change', updateBookSalesWidget);
    }

    // Checkout Funnel status clicks
    const checkoutCards = container.querySelectorAll('#checkout-funnel-summary .kpi-card.clickable');
    checkoutCards.forEach(card => {
      card.addEventListener('click', () => {
        const status = card.dataset.status;
        window.location.hash = `checkout-funnel?status=${status}`;
      });
    });

    const chkDateFilter = container.querySelector('#checkout-date-filter');
    const chkCustomDate = container.querySelector('#checkout-custom-date');
    if (chkDateFilter && chkCustomDate) {
      chkDateFilter.addEventListener('change', async () => {
        const fVal = chkDateFilter.value;
        let sDate, eDate;
        const now = new Date();
        chkCustomDate.style.display = (fVal === 'custom') ? 'inline-block' : 'none';
        if (fVal === 'custom') return;

        switch (fVal) {
          case 'yesterday':
            sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            eDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'last7days':
            sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            eDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case 'thismonth':
            sDate = new Date(now.getFullYear(), now.getMonth(), 1);
            eDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
          case 'today':
          default:
            sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            eDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        }

        const widget = container.querySelector('#checkout-funnel-summary');
        const kpiRow = widget?.querySelector('#checkout-kpi-row');
        if (kpiRow) kpiRow.style.opacity = '0.5';

        const chkRes = await fetchCheckoutSummary({ startDate: sDate, endDate: eDate });
        if (kpiRow) kpiRow.style.opacity = '1';

        if (chkRes.success && widget) {
          const sum = chkRes.data;
          widget.querySelector('[data-status="followup"] .kpi-value').textContent = sum.follow_up || 0;
          widget.querySelector('[data-status="initiated"] .kpi-value').textContent = sum.initiated || 0;
          widget.querySelector('[data-status="dropped"] .kpi-value').textContent = sum.dropped || 0;
          widget.querySelector('[data-status="failed"] .kpi-value').textContent = sum.failed || 0;
          widget.querySelector('[data-status="success"] .kpi-value').textContent = sum.success || 0;
          widget.querySelector('.kpi-card:not(.clickable) .kpi-value').textContent = sum.conversion_rate || '0%';
        }
      });
    }

  } catch (err) {
    console.error('loadFullDashboard error:', err);
    container.innerHTML = '<div class="admin-error">डेटा लोड करने में असमर्थ।</div>';
  }
}
