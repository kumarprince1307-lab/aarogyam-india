/* Admin Webinars & Live Events Management Module */

import { initAdminLayout } from './admin-main.js';
function getAdminDb() {
  if (window.dbClient) return window.dbClient;
  if (window.supabaseClient) return window.supabaseClient;
  if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.dbClient = window.supabase.createClient(
      'https://qjhjrzsnrtahmhswxyvb.supabase.co',
      'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU'
    );
    return window.dbClient;
  }
  return null;
}

const PAGE_SIZE = 20;

export async function initWebinars() {
  initAdminLayout('All Webinars & Live Events', 'Manage Zoom and webinar invitation landing pages and registered attendees.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let currentPage = 1;
  let allWebinars = [];
  let allRegistrations = [];

  content.innerHTML = `
    <!-- Top Action Row -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>🎥 All Webinars & Live Events Management</span>
            <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Live Zoom Tracking</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">
            Track webinar landing pages, Zoom meeting links, passcodes, and registered attendee leads.
          </p>
        </div>
        <button id="btn-refresh-webinars" class="admin-button small-button">🔄 Refresh Data</button>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 14px;">
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #3b82f6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🎥 कुल वेबिनार (Total Webinars)</div>
          <div id="kpi-total-webinars" style="font-size: 1.6rem; font-weight: 800; color: var(--admin-text); margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #10b981;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">👥 कुल रजिस्टर्ड Attendees (Leads)</div>
          <div id="kpi-total-attendees" style="font-size: 1.6rem; font-weight: 800; color: #10b981; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🔗 लाइव Zoom सेशंस (Active Zoom Links)</div>
          <div id="kpi-active-sessions" style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">0</div>
        </div>
      </div>

      <!-- Multi-Filter Bar -->
      <div class="admin-card admin-controls" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; background: var(--admin-surface-2, #0f172a);">
        <input id="webinar-search-box" type="search" placeholder="🔍 शीर्षक, क्रिएटर, Meeting ID से खोजें..." class="admin-input" style="flex: 2; min-width: 220px;" />

        <select id="webinar-date-dropdown" class="admin-select" style="flex: 1; min-width: 140px;">
          <option value="all">📅 All Time (सभी तारीखें)</option>
          <option value="today">Today (आज)</option>
          <option value="7days">Last 7 Days (7 दिन)</option>
          <option value="30days">Last 30 Days (30 दिन)</option>
        </select>
      </div>
    </div>

    <!-- Table Container -->
    <div id="webinars-table-wrapper" style="margin-top: 10px;">
      <div class="admin-loading">डेटाबेस से वेबिनार डेटा लोड हो रहा है…</div>
    </div>

    <!-- Slide-over Drawer for Viewing Registered Attendees -->
    <div id="webinar-drawer-overlay" class="admin-drawer-overlay">
      <div class="admin-drawer" style="max-width: 600px;">
        <div class="admin-drawer-header">
          <div class="admin-drawer-title">
            <span id="drawer-webinar-title">👥 वेबिनार रजिस्टर्ड Attendees</span>
          </div>
          <button type="button" id="webinar-drawer-close" class="admin-drawer-close">&times;</button>
        </div>
        <div id="webinar-drawer-body" class="admin-drawer-body"></div>
      </div>
    </div>
  `;

  const tableContainer = document.getElementById('webinars-table-wrapper');
  const searchInput = document.getElementById('webinar-search-box');
  const dateDropdown = document.getElementById('webinar-date-dropdown');
  const refreshBtn = document.getElementById('btn-refresh-webinars');

  const drawerOverlay = document.getElementById('webinar-drawer-overlay');
  const drawerCloseBtn = document.getElementById('webinar-drawer-close');
  const drawerTitle = document.getElementById('drawer-webinar-title');
  const drawerBody = document.getElementById('webinar-drawer-body');

  drawerCloseBtn?.addEventListener('click', () => drawerOverlay?.classList.remove('active'));
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('active');
  });

  async function loadWebinarData() {
    tableContainer.innerHTML = '<div class="admin-loading">Loading webinars from database…</div>';

    const db = getAdminDb();
    if (!db) {
      tableContainer.innerHTML = '<div class="admin-error"><strong>Supabase client is initializing. Please click Refresh.</strong></div>';
      return;
    }

    try {
      // 1. Fetch Landing Pages with category = webinar or all landing pages
      const { data: lpData, error: lpErr } = await db
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch Surveys / Leads with category = webinar or source = webinar_landing_page
      const { data: surveyData, error: sErr } = await db
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (lpErr) console.warn('LP fetch error', lpErr);
      if (sErr) console.warn('Survey fetch error', sErr);

      let allLps = lpData || [];
      let allSurveys = surveyData || [];

      // Scan LocalStorage
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES')) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]');
              const arr = Array.isArray(parsed) ? parsed : [parsed];
              arr.forEach(p => {
                if (p && p.id && !allLps.some(existing => existing.id === p.id)) {
                  allLps.push(p);
                }
              });
            } catch (e) {}
          }
          if (key && key.startsWith('UCAS_SURVEYS_')) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]');
              const arr = Array.isArray(parsed) ? parsed : [parsed];
              arr.forEach(s => {
                if (s && s.id && !allSurveys.some(existing => existing.id === s.id)) {
                  allSurveys.push(s);
                }
              });
            } catch (e) {}
          }
        }
      } catch (e) {}

      // Filter only webinar landing pages (or pages with webinar_data)
      allWebinars = allLps.filter(lp => lp.category === 'webinar' || Boolean(lp.webinar_data));
      allRegistrations = allSurveys.filter(s => {
        const cat = String(s.selected_categories || '');
        const src = s.category_answers?.source || '';
        return cat.includes('webinar') || src.includes('webinar');
      });

      // Calculate KPI Stats
      document.getElementById('kpi-total-webinars').textContent = allWebinars.length;
      document.getElementById('kpi-total-attendees').textContent = allRegistrations.length;
      const activeZoomCount = allWebinars.filter(w => w.webinar_data?.zoom_link).length;
      document.getElementById('kpi-active-sessions').textContent = activeZoomCount;

      currentPage = 1;
      renderTable();
    } catch (e) {
      console.error('Webinar loading error', e);
      tableContainer.innerHTML = '<div class="admin-error"><strong>Unable to load webinars.</strong></div>';
    }
  }

  function getFilteredWebinars() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const dateVal = dateDropdown.value;
    const now = new Date();

    return allWebinars.filter(w => {
      // Date Filter
      if (dateVal !== 'all' && w.created_at) {
        const wDate = new Date(w.created_at);
        if (dateVal === 'today') {
          if (wDate.toDateString() !== now.toDateString()) return false;
        } else if (dateVal === '7days') {
          if ((now - wDate) / (1000 * 60 * 60 * 24) > 7) return false;
        } else if (dateVal === '30days') {
          if ((now - wDate) / (1000 * 60 * 60 * 24) > 30) return false;
        }
      }

      // Search Query
      if (query) {
        const title = (w.title || '').toLowerCase();
        const shareId = (w.share_id || '').toLowerCase();
        const meetingId = (w.webinar_data?.meeting_id || '').toLowerCase();
        const zoomUrl = (w.webinar_data?.zoom_link || '').toLowerCase();

        if (!title.includes(query) && !shareId.includes(query) && !meetingId.includes(query) && !zoomUrl.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  function renderTable() {
    const filtered = getFilteredWebinars();
    const total = filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, total);
    const pageItems = filtered.slice(startIndex, endIndex);

    if (total === 0) {
      tableContainer.innerHTML = `
        <div class="admin-table-wrapper sticky-header-table">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Webinar Title & ID</th>
                <th>Creator Share ID</th>
                <th>Date & Time</th>
                <th>Zoom Link & Passcode</th>
                <th>Registered Attendees</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="7" style="text-align:center;padding:2.5rem;color:var(--admin-muted);">
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">🎥</div>
                  <div style="font-size:1rem;font-weight:700;color:var(--admin-text);margin-bottom:4px;">कोई वेबिनार नहीं मिला (No Webinars Found)</div>
                  <span style="font-size: 0.85rem; color: var(--admin-muted);">UCAS पोर्टल में 'Webinars' टैब पर जाकर 'Create Webinar' से नया वेबिनार बनाएं।</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      return;
    }

    tableContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>दिखा रहे हैं <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${total}</strong> वेबिनार</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Webinar Title & ID</th>
              <th>Creator Share ID</th>
              <th>Date & Time</th>
              <th>Zoom Link & Passcode</th>
              <th>Registered Attendees</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((w, idx) => {
              const rowNum = startIndex + idx + 1;
              const wData = w.webinar_data || {};
              const attendees = allRegistrations.filter(r => r.category_answers?.landing_page_id === w.id);
              const attendeesCount = attendees.length;
              const dateStr = w.created_at ? new Date(w.created_at).toLocaleDateString('hi-IN') : '-';
              const publicLpUrl = `/ucas/landing.html?id=${w.id}&share_id=${w.share_id || ''}`;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.92rem;">${w.title || 'Untitled Webinar'}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">
                      Page ID: <code>${w.id}</code> • <span>${dateStr}</span>
                    </div>
                  </td>
                  <td>
                    <span style="font-size: 0.82rem; font-weight: 700; color: var(--admin-primary);">
                      <code>${w.share_id || 'AI000000'}</code>
                    </span>
                  </td>
                  <td>
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--admin-text);">
                      📅 ${wData.datetime || 'लाइव सत्र'}
                    </div>
                  </td>
                  <td>
                    <div>
                      ${wData.zoom_link ? `
                        <a href="${wData.zoom_link}" target="_blank" class="admin-subtle-link" style="color: #3b82f6; font-weight: 700; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                          <span>🔗 Zoom Link</span>
                        </a>
                      ` : '<span style="color: var(--admin-muted); font-size: 0.75rem;">-</span>'}
                      <div style="font-size: 0.72rem; color: var(--admin-muted); margin-top: 2px;">
                        ${wData.meeting_id ? `ID: <code>${wData.meeting_id}</code>` : ''} 
                        ${wData.passcode ? `• Pass: <strong style="color:#10b981;">${wData.passcode}</strong>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button type="button" class="btn-view-attendees admin-button small-button" data-webinar-id="${w.id}" style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); font-weight: 800; font-size: 0.85rem; padding: 4px 10px; border-radius: 20px;">
                      👥 ${attendeesCount} Registered
                    </button>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                      <a href="${publicLpUrl}" target="_blank" class="admin-button small-button icon-button" title="View Public Landing Page" style="background: var(--admin-surface); color: var(--admin-text); border: 1px solid var(--admin-border);">
                        👁️
                      </a>
                      <button type="button" class="btn-view-attendees admin-button small-button" data-webinar-id="${w.id}" style="background: var(--admin-primary); color: #fff; font-weight: 700; font-size: 0.75rem; padding: 4px 10px;">
                        Attendees
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px 16px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="font-size: 0.85rem; color: var(--admin-muted);">
          Total Webinars: <strong style="color: var(--admin-text);">${total}</strong>
        </div>

        <div class="admin-pagination-controls">
          <button type="button" id="webinar-prev-page" class="admin-button small-button" ${currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ◀ Previous
          </button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">Page ${currentPage} of ${totalPages} (20 Items/Page)</span>
          <button type="button" id="webinar-next-page" class="admin-button small-button" ${currentPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            Next ▶
          </button>
        </div>
      </div>
    `;

    // Pagination Listeners
    document.getElementById('webinar-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.getElementById('webinar-next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });

    // View Attendees Click
    tableContainer.querySelectorAll('.btn-view-attendees').forEach(btn => {
      btn.addEventListener('click', () => {
        const wId = btn.dataset.webinarId;
        const webinar = allWebinars.find(w => w.id === wId);
        if (!webinar) return;
        openAttendeesDrawer(webinar);
      });
    });
  }

  function openAttendeesDrawer(webinar) {
    if (!drawerOverlay || !drawerTitle || !drawerBody) return;

    const attendees = allRegistrations.filter(r => r.category_answers?.landing_page_id === webinar.id);
    const wData = webinar.webinar_data || {};

    drawerTitle.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>👥</span>
        <span>${webinar.title || 'Webinar'} — Attendees (${attendees.length})</span>
      </div>
    `;

    drawerBody.innerHTML = `
      <div style="background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
        <div style="font-weight: 700; color: var(--admin-text);">${webinar.title}</div>
        <div style="font-size: 0.8rem; color: var(--admin-muted); margin-top: 2px;">
          📅 ${wData.datetime || '-'} • Zoom: <a href="${wData.zoom_link || '#'}" target="_blank" style="color:#3b82f6;">Join Link</a> • ID: <code>${wData.meeting_id || '-'}</code> • Pass: <code>${wData.passcode || '-'}</code>
        </div>
      </div>

      ${attendees.length === 0 ? `
        <div class="admin-empty">
          अभी तक किसी ने इस वेबिनार के लिए रजिस्ट्रेशन नहीं किया है।
        </div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Attendee Name</th>
                <th>Mobile (Call / WA)</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              ${attendees.map((att, i) => {
                const sMob = String(att.mobile || '').replace(/\D/g, '');
                const regDate = att.created_at ? new Date(att.created_at).toLocaleString('hi-IN') : '-';
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td>
                      <div style="font-weight: 700; color: var(--admin-text);">${att.name}</div>
                      <div style="font-size: 0.72rem; color: var(--admin-muted);">Place: ${att.village || '-'}</div>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight: 600; font-size: 0.82rem;">📞 ${att.mobile || '-'}</a>
                        ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp Chat">💬</a>` : ''}
                      </div>
                    </td>
                    <td style="font-size: 0.78rem; color: var(--admin-muted);">
                      ${regDate}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    drawerOverlay.classList.add('active');
  }

  searchInput?.addEventListener('input', () => { currentPage = 1; renderTable(); });
  dateDropdown?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  refreshBtn?.addEventListener('click', loadWebinarData);

  await loadWebinarData();
}
