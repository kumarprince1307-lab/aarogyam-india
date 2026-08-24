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

  let activeTab = 'webinars'; // 'webinars' | 'attendees'
  let currentPage = 1;
  let allWebinars = [];
  let allRegistrations = [];
  let allProfiles = [];

  content.innerHTML = `
    <!-- Top Action Row -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>🎥 All Webinars & Live Events Management</span>
            <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Zero-Image Pure Zoom & Survey Gate</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">
            ज़ूम मीटिंग लिंक, पासवर्ड और सर्वे फॉर्म के माध्यम से रजिस्टर्ड अटेंडेंट्स (Leads) को ट्रैक करें।
          </p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button id="btn-toggle-create-webinar" class="admin-button" style="background:#2563eb; color:#fff; font-weight:800; display:inline-flex; align-items:center; gap:6px;">
            <span>➕</span> <span>नया ज़ूम वेबिनार बनाएं</span>
          </button>
          <button id="btn-refresh-webinars" class="admin-button small-button">🔄 Refresh Data</button>
        </div>
      </div>

      <!-- Create Zoom Webinar Form Card (Zero Image, Pure Text) -->
      <div id="admin-create-webinar-card" class="admin-card" style="display:none; background: #0f172a; border: 1.5px solid #2563eb; border-radius: 14px; padding: 20px; margin-top: 14px; box-shadow: 0 10px 30px rgba(37,99,235,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #60a5fa; display:flex; align-items:center; gap:8px;">
            <span>🎥</span> नया ज़ूम वेबिनार तैयार करें (No Image / Fast Zoom Session)
          </h3>
          <button type="button" id="btn-close-create-webinar" class="admin-button small-button" style="background:transparent; color:#94a3b8; border:none; font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>

        <form id="form-admin-create-webinar">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.8rem; color:#cbd5e1;">वेबिनार शीर्षक / Topic: *</label>
              <input type="text" id="adm_wb_title" class="admin-input" placeholder="उदा. आधुनिक जैविक कृषि एवं कीट नियंत्रण लाइव सत्र" required style="width:100%;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.8rem; color:#cbd5e1;">दिनांक व समय (Date & Time Text): *</label>
              <input type="text" id="adm_wb_datetime" class="admin-input" placeholder="उदा. 25 अगस्त 2026, सायं 07:00 बजे" required style="width:100%;" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.8rem; color:#cbd5e1;">Zoom Meeting Join Link: *</label>
              <input type="url" id="adm_wb_zoom_link" class="admin-input" placeholder="https://us02web.zoom.us/j/82345678901?pwd=..." required style="width:100%;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.8rem; color:#cbd5e1;">Meeting ID: *</label>
              <input type="text" id="adm_wb_meeting_id" class="admin-input" placeholder="उदा. 823 4567 8901" required style="width:100%;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.8rem; color:#cbd5e1;">Passcode / Password: *</label>
              <input type="text" id="adm_wb_passcode" class="admin-input" placeholder="उदा. 123456 या AI2026" required style="width:100%;" />
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight:700; font-size:0.8rem; color:#cbd5e1;">वेबिनार संदेश / विवरण (Description):</label>
            <textarea id="adm_wb_desc" class="admin-input" rows="2" placeholder="इस विशेष लाइव वेबिनार में भाग लेने के लिए अपना नाम और मोबाइल नंबर दर्ज करें। रजिस्ट्रेशन के तुरंत बाद Zoom लिंक और पासवर्ड मिल जाएगा।" style="width:100%;"></textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:14px;">
            <div style="font-size:0.82rem; color:#94a3b8;">
              ℹ️ <strong>Zero Media Egress:</strong> कोई इमेज अपलोड नहीं होगी। केवल हल्का ज़ूम टेक्स्ट डेटाबेस में जाएगा।
            </div>
            <button type="submit" id="btn-submit-webinar" class="admin-button" style="background:#10b981; color:#fff; font-weight:800; padding:10px 20px; font-size:0.92rem;">
              🚀 ज़ूम वेबिनार प्रकाशित करें (Publish Webinar)
            </button>
          </div>
        </form>
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

      <!-- Tab Switcher -->
      <div style="display:flex; gap:10px; margin-top:14px; border-bottom: 2px solid var(--admin-border, #334155); padding-bottom: 8px;">
        <button type="button" id="tab-btn-webinars" class="admin-button" style="background:#3b82f6; color:#fff; font-weight:800; font-size:0.88rem; padding:8px 16px;">
          🎥 Webinars List (<span id="tab-count-webinars">0</span>)
        </button>
        <button type="button" id="tab-btn-attendees" class="admin-button" style="background:var(--admin-surface-2, #0f172a); color:var(--admin-muted); font-weight:800; font-size:0.88rem; padding:8px 16px; border:1px solid var(--admin-border, #334155);">
          👥 Attendees Report (<span id="tab-count-attendees">0</span>)
        </button>
      </div>

      <!-- Multi-Filter Bar: User Filter + Date Filter + Search -->
      <div class="admin-card admin-controls" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; background: var(--admin-surface-2, #0f172a);">
        <input id="webinar-search-box" type="search" placeholder="🔍 नाम, मोबाइल, शीर्षक, क्रिएटर से खोजें..." class="admin-input" style="flex: 2; min-width: 220px;" />

        <select id="webinar-user-filter" class="admin-select" style="flex: 1.2; min-width: 170px;">
          <option value="all">👥 All Creators (सभी यूजर्स)</option>
        </select>

        <select id="webinar-date-dropdown" class="admin-select" style="flex: 1; min-width: 140px;">
          <option value="all">📅 All Time (सभी तारीखें)</option>
          <option value="today">Today (आज)</option>
          <option value="7days">Last 7 Days (7 दिन)</option>
          <option value="30days">Last 30 Days (30 दिन)</option>
        </select>
      </div>
    </div>

    <!-- Main Table Container -->
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
  const userFilter = document.getElementById('webinar-user-filter');
  const dateDropdown = document.getElementById('webinar-date-dropdown');
  const refreshBtn = document.getElementById('btn-refresh-webinars');

  const btnToggleCreate = document.getElementById('btn-toggle-create-webinar');
  const btnCloseCreate = document.getElementById('btn-close-create-webinar');
  const createCard = document.getElementById('admin-create-webinar-card');
  const formCreateWebinar = document.getElementById('form-admin-create-webinar');

  btnToggleCreate?.addEventListener('click', () => {
    if (createCard) createCard.style.display = createCard.style.display === 'none' ? 'block' : 'none';
  });

  btnCloseCreate?.addEventListener('click', () => {
    if (createCard) createCard.style.display = 'none';
  });

  formCreateWebinar?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = (document.getElementById('adm_wb_title')?.value || '').trim();
    const datetime = (document.getElementById('adm_wb_datetime')?.value || '').trim();
    const zoomLink = (document.getElementById('adm_wb_zoom_link')?.value || '').trim();
    const meetingId = (document.getElementById('adm_wb_meeting_id')?.value || '').trim();
    const passcode = (document.getElementById('adm_wb_passcode')?.value || '').trim();
    const desc = (document.getElementById('adm_wb_desc')?.value || '').trim();
    const submitBtn = document.getElementById('btn-submit-webinar');

    if (!title || !zoomLink || !meetingId) {
      alert('कृपया शीर्षक, ज़ूम लिंक और मीटिंग आईडी अवश्य भरें।');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ प्रकाशित हो रहा है...';
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newWbId = `WB${randomSuffix}`;

    const newRecord = {
      id: newWbId,
      profile_id: 'ALL_USERS',
      share_id: 'ALL_USERS',
      title: title,
      message: desc || 'इस विशेष लाइव वेबिनार में भाग लेने के लिए अपना नाम और मोबाइल नंबर दर्ज करें।',
      category: 'webinar',
      content_type: 'webinar',
      status: 'active',
      webinar_data: {
        zoom_link: zoomLink,
        meeting_id: meetingId,
        passcode: passcode,
        datetime: datetime
      },
      created_at: new Date().toISOString()
    };

    const db = getAdminDb();
    try {
      if (db) {
        await db.from('landing_pages').insert([newRecord]);
      }
    } catch (err) {
      console.warn('Webinar insert notice:', err);
    }

    // Save in LocalStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
      stored.unshift(newRecord);
      localStorage.setItem('UCAS_LOCAL_LANDING_PAGES', JSON.stringify(stored));
    } catch (err) {}

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '🚀 ज़ूम वेबिनार प्रकाशित करें (Publish Webinar)';
    }

    if (createCard) createCard.style.display = 'none';
    formCreateWebinar.reset();
    alert(`🎉 ज़ूम वेबिनार सफलतापूर्वक प्रकाशित हो गया!\n\nलिंक: https://aarogyamindia.online/webinar.html?id=${newWbId}`);
    loadWebinarData();
  });

  const tabBtnWebinars = document.getElementById('tab-btn-webinars');
  const tabBtnAttendees = document.getElementById('tab-btn-attendees');

  const drawerOverlay = document.getElementById('webinar-drawer-overlay');
  const drawerCloseBtn = document.getElementById('webinar-drawer-close');
  const drawerTitle = document.getElementById('drawer-webinar-title');
  const drawerBody = document.getElementById('webinar-drawer-body');

  tabBtnWebinars?.addEventListener('click', () => {
    activeTab = 'webinars';
    tabBtnWebinars.style.background = '#3b82f6';
    tabBtnWebinars.style.color = '#fff';
    tabBtnAttendees.style.background = 'var(--admin-surface-2, #0f172a)';
    tabBtnAttendees.style.color = 'var(--admin-muted)';
    currentPage = 1;
    renderTable();
  });

  tabBtnAttendees?.addEventListener('click', () => {
    activeTab = 'attendees';
    tabBtnAttendees.style.background = '#10b981';
    tabBtnAttendees.style.color = '#fff';
    tabBtnWebinars.style.background = 'var(--admin-surface-2, #0f172a)';
    tabBtnWebinars.style.color = 'var(--admin-muted)';
    currentPage = 1;
    renderTable();
  });

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
      // 1. Fetch Profiles, Landing Pages & Surveys in parallel
      const [lpRes, surveyRes, profRes] = await Promise.all([
        db.from('landing_pages').select('id, profile_id, share_id, title, category, status, webinar_data, created_at').order('created_at', { ascending: false }),
        db.from('surveys').select('id, profile_id, name, mobile, age, sex, state, district, village, occupation, category_answers, created_at').order('created_at', { ascending: false }),
        db.from('profiles').select('id, full_name, mobile, share_id')
      ]);

      let allLps = lpRes.data || [];
      let allSurveys = surveyRes.data || [];
      allProfiles = profRes.data || [];

      // Scan LocalStorage for local testing
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
        const lpId = s.category_answers?.landing_page_id || '';
        return cat.includes('webinar') || src.includes('webinar') || allWebinars.some(w => w.id === lpId);
      });

      // Populate User Filter Dropdown
      if (userFilter) {
        userFilter.innerHTML = '<option value="all">👥 All Creators (सभी यूजर्स)</option>';
        const creatorIds = new Set();
        allWebinars.forEach(w => { if (w.profile_id) creatorIds.add(w.profile_id); });
        allRegistrations.forEach(r => { if (r.profile_id) creatorIds.add(r.profile_id); });

        creatorIds.forEach(pId => {
          const prof = allProfiles.find(p => p.id === pId);
          const opt = document.createElement('option');
          opt.value = pId;
          opt.textContent = pId === 'ALL_USERS'
            ? '🌐 सभी यूजर्स (All Users Broadcast)'
            : prof ? `${prof.full_name || 'User'} (${prof.share_id || pId.slice(0, 8)})` : pId.slice(0, 8);
          userFilter.appendChild(opt);
        });
      }

      // Calculate KPI Stats
      document.getElementById('kpi-total-webinars').textContent = allWebinars.length;
      document.getElementById('kpi-total-attendees').textContent = allRegistrations.length;
      const activeZoomCount = allWebinars.filter(w => w.webinar_data?.zoom_link).length;
      document.getElementById('kpi-active-sessions').textContent = activeZoomCount;

      const tabCountWb = document.getElementById('tab-count-webinars');
      const tabCountAtt = document.getElementById('tab-count-attendees');
      if (tabCountWb) tabCountWb.textContent = allWebinars.length;
      if (tabCountAtt) tabCountAtt.textContent = allRegistrations.length;

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
    const selectedUserId = userFilter.value;
    const now = new Date();

    return allWebinars.filter(w => {
      // User Filter
      if (selectedUserId !== 'all' && w.profile_id !== selectedUserId) {
        return false;
      }

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
        const prof = allProfiles.find(p => p.id === w.profile_id);
        const creatorName = (prof?.full_name || '').toLowerCase();

        if (!title.includes(query) && !shareId.includes(query) && !meetingId.includes(query) && !zoomUrl.includes(query) && !creatorName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  function getFilteredAttendees() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const dateVal = dateDropdown.value;
    const selectedUserId = userFilter.value;
    const now = new Date();

    return allRegistrations.filter(att => {
      // User Filter
      if (selectedUserId !== 'all' && att.profile_id !== selectedUserId) {
        return false;
      }

      // Date Filter
      if (dateVal !== 'all' && att.created_at) {
        const aDate = new Date(att.created_at);
        if (dateVal === 'today') {
          if (aDate.toDateString() !== now.toDateString()) return false;
        } else if (dateVal === '7days') {
          if ((now - aDate) / (1000 * 60 * 60 * 24) > 7) return false;
        } else if (dateVal === '30days') {
          if ((now - aDate) / (1000 * 60 * 60 * 24) > 30) return false;
        }
      }

      // Search Query
      if (query) {
        const name = (att.name || '').toLowerCase();
        const mob = (att.mobile || '').toLowerCase();
        const place = (att.village || '').toLowerCase();
        const aLpId = att.category_answers?.landing_page_id || '';
        const lp = allWebinars.find(w => w.id === aLpId);
        const title = (lp?.title || '').toLowerCase();
        const prof = allProfiles.find(p => p.id === att.profile_id);
        const creatorName = (prof?.full_name || '').toLowerCase();

        if (!name.includes(query) && !mob.includes(query) && !place.includes(query) && !title.includes(query) && !creatorName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  function renderTable() {
    if (activeTab === 'attendees') {
      renderAttendeesReportTable();
    } else {
      renderWebinarsListTable();
    }
  }

  function renderWebinarsListTable() {
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
                <th>Creator User</th>
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
              <th>Creator User</th>
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
              const attendees = allRegistrations.filter(r => r.category_answers?.webinar_id === w.id || r.category_answers?.landing_page_id === w.id);
              const attendeesCount = attendees.length;
              const dateStr = w.created_at ? new Date(w.created_at).toLocaleDateString('hi-IN') : '-';
              const publicLpUrl = `/webinar.html?id=${encodeURIComponent(w.id)}&ref=${encodeURIComponent(w.share_id || 'ADMIN')}`;
              const creator = allProfiles.find(p => p.id === w.profile_id);

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
                    ${w.profile_id === 'ALL_USERS' || w.share_id === 'ALL_USERS' || w.share_id === 'ADMIN' ? `
                      <div style="font-weight: 800; color: #3b82f6; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                        <span>🌐</span> <span>सभी ${allProfiles.length || 103} यूज़र्स (Broadcast)</span>
                      </div>
                      <div style="font-size: 0.73rem; color: #10b981; font-weight: 700; margin-top: 2px;">
                        ✓ 100% Reach (सभी को डिलीवर)
                      </div>
                      <button type="button" class="btn-view-wb-recipients admin-button small-button" data-webinar-id="${w.id}" style="font-size: 0.72rem; padding: 2px 7px; margin-top: 4px; background: rgba(59,130,246,0.15); color: #2563eb; border: 1px solid rgba(59,130,246,0.3); font-weight: 700;">
                        👥 प्राप्तकर्ता लिस्ट देखें
                      </button>
                    ` : `
                      <div style="font-weight:700; color:var(--admin-text); font-size:0.85rem;">
                        ${creator?.full_name || 'Community'}
                      </div>
                      <span style="font-size: 0.75rem; font-weight: 700; color: var(--admin-primary);">
                        <code>${w.share_id || creator?.share_id || 'AI000000'}</code>
                      </span>
                    `}
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
                    <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                      <a href="${publicLpUrl}" target="_blank" class="admin-button small-button" style="background: rgba(37,99,235,0.15); color: #3b82f6; border: 1px solid rgba(37,99,235,0.3); font-weight: 700; font-size: 0.75rem; padding: 4px 8px; text-decoration:none;" title="Open Clean Webinar Page">
                        🔗 खोलें
                      </a>
                      <button type="button" class="btn-copy-webinar-link admin-button small-button" data-url="https://aarogyamindia.online${publicLpUrl}" style="background: var(--admin-surface); color: var(--admin-text); border: 1px solid var(--admin-border); font-size:0.75rem; font-weight:700; padding:4px 8px;">
                        📋 कॉपी
                      </button>
                      <button type="button" class="btn-view-attendees admin-button small-button" data-webinar-id="${w.id}" style="background: #10b981; color: #fff; font-weight: 700; font-size: 0.75rem; padding: 4px 10px;">
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

    bindPaginationAndActionEvents();
  }

  function renderAttendeesReportTable() {
    const filtered = getFilteredAttendees();
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
                <th>Attendee Name & Place</th>
                <th>Mobile Number</th>
                <th>Webinar Topic / Title</th>
                <th>Creator User</th>
                <th>Joined Date & Time</th>
                <th style="text-align: right;">Action (Call / WA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="7" style="text-align:center;padding:2.5rem;color:var(--admin-muted);">
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">👥</div>
                  <div style="font-size:1rem;font-weight:700;color:var(--admin-text);margin-bottom:4px;">कोई वेबिनार अटेंडेंट रिकॉर्ड नहीं मिला</div>
                  <span style="font-size: 0.85rem; color: var(--admin-muted);">फ़िल्टर बदलें या नया सर्च करें।</span>
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
        <span>दिखा रहे हैं <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${total}</strong> अटेंडेंट्स</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Attendee Name & Place</th>
              <th>Mobile Number</th>
              <th>Webinar Topic / Title</th>
              <th>Creator User</th>
              <th>Joined Date & Time</th>
              <th style="text-align: right;">Action (Call / WA)</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((att, idx) => {
              const rowNum = startIndex + idx + 1;
              const sMob = String(att.mobile || '').replace(/\D/g, '');
              const clean10Mob = sMob.length === 10 ? sMob : sMob.slice(-10);
              const aLpId = att.category_answers?.landing_page_id || '';
              const lp = allWebinars.find(w => w.id === aLpId);
              const webinarTitle = lp?.title || 'लाइव वेबिनार सत्र';
              const regDate = att.created_at ? new Date(att.created_at).toLocaleString('hi-IN') : '-';
              const creator = allProfiles.find(p => p.id === att.profile_id);

              const attendeeName = att.name || 'मित्र';
              const waMsg = `नमस्ते ${attendeeName} जी! आपने हमारे लाइव वेबिनार "${webinarTitle}" में भाग लिया था। आपको वेबिनार कैसा लगा और क्या-क्या समझ में आया? अब आइए आगे का प्लान करते हैं और इस पर चर्चा करते हैं।`;
              const waLink = `https://wa.me/91${clean10Mob}?text=${encodeURIComponent(waMsg)}`;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.92rem;">${att.name}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">
                      📍 <span>${att.village || 'Online'}</span>
                    </div>
                  </td>
                  <td>
                    <a href="tel:${clean10Mob}" class="admin-subtle-link" style="font-weight: 700; font-size: 0.85rem; color: #3b82f6;">
                      📞 ${att.mobile || '-'}
                    </a>
                  </td>
                  <td>
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--admin-text); max-width: 220px;">
                      🎥 ${webinarTitle}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--admin-muted);">ID: <code>${aLpId || '-'}</code></div>
                  </td>
                  <td>
                    <div style="font-weight: 600; font-size: 0.82rem; color: var(--admin-text);">
                      ${creator?.full_name || 'Community'}
                    </div>
                    <span style="font-size: 0.72rem; color: var(--admin-muted);"><code>${creator?.share_id || att.category_answers?.creator_share_id || '-'}</code></span>
                  </td>
                  <td>
                    <div style="font-size: 0.8rem; color: var(--admin-muted);">
                      📅 ${regDate}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                      <a href="tel:${clean10Mob}" class="admin-button small-button" style="background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); font-weight: 700; font-size: 0.75rem; padding: 4px 10px; text-decoration: none;" title="Call Attendee">
                        📞 Call
                      </a>
                      <a href="${waLink}" target="_blank" class="admin-button small-button" style="background: #25D366; color: #fff; font-weight: 700; font-size: 0.75rem; padding: 4px 10px; text-decoration: none;" title="Send WhatsApp Message">
                        💬 WhatsApp
                      </a>
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
          Total Attendees: <strong style="color: var(--admin-text);">${total}</strong>
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

    bindPaginationAndActionEvents();
  }

  function bindPaginationAndActionEvents() {
    // Pagination Listeners
    document.getElementById('webinar-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.getElementById('webinar-next-page')?.addEventListener('click', () => {
      const filtered = activeTab === 'attendees' ? getFilteredAttendees() : getFilteredWebinars();
      const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });

    // View Attendees Click in Webinars List
    tableContainer.querySelectorAll('.btn-view-attendees').forEach(btn => {
      btn.addEventListener('click', () => {
        const wId = btn.dataset.webinarId;
        const webinar = allWebinars.find(w => w.id === wId);
        if (!webinar) return;
        openAttendeesDrawer(webinar);
      });
    });

    // Copy Webinar Link Click
    tableContainer.querySelectorAll('.btn-copy-webinar-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ कॉपी हुआ!';
          setTimeout(() => { btn.innerHTML = orig; }, 1800);
        } else {
          prompt('लिंक कॉपी करें:', url);
        }
      });
    });

    // View Recipients Click in Webinars List
    tableContainer.querySelectorAll('.btn-view-wb-recipients').forEach(btn => {
      btn.addEventListener('click', () => {
        const wId = btn.dataset.webinarId;
        const webinar = allWebinars.find(w => w.id === wId);
        if (!webinar) return;
        openWebinarRecipientsDrawer(webinar);
      });
    });
  }

  function openWebinarRecipientsDrawer(webinar) {
    if (!drawerOverlay || !drawerTitle || !drawerBody) return;
    drawerTitle.innerHTML = `🌐 वेबिनार प्राप्तकर्ता: <span style="color:#3b82f6;">${webinar.title || webinar.id}</span>`;

    const totalCount = allProfiles.length;
    const activeCount = allProfiles.filter(u => u.is_active || u.is_subscriber).length;

    drawerBody.innerHTML = `
      <div style="background: rgba(59,130,246,0.08); border: 1.5px solid #3b82f6; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
        <div style="font-weight: 800; font-size: 0.95rem; color: var(--admin-text); margin-bottom: 6px; display:flex; align-items:center; justify-content:space-between;">
          <span>📢 100% Universal Broadcast Status</span>
          <span style="background:#10b981; color:#fff; font-size:0.72rem; padding:3px 10px; border-radius:12px; font-weight:800;">🟢 लाइव व सक्रिय</span>
        </div>
        <p style="font-size: 0.84rem; color: var(--admin-muted); margin: 0 0 10px 0; line-height: 1.45;">
          यह वेबिनार सिस्टम में मौजूद सभी <strong>${totalCount} यूज़र्स</strong> (और भविष्य में जुड़ने वाले हर नए यूजर) के <strong>My Profile / UCAS Hub</strong> में स्वतः उनके व्यक्तिगत रेफरल लिंक के साथ उपलब्ध है।
        </p>
        <div style="display:flex; gap:10px; flex-wrap:wrap; font-size:0.8rem; font-weight:700;">
          <div style="background:var(--admin-surface); padding:6px 12px; border-radius:6px; border:1px solid var(--admin-border);">
            👥 कुल प्राप्तकर्ता: <strong style="color:#3b82f6;">${totalCount} यूज़र्स</strong>
          </div>
          <div style="background:var(--admin-surface); padding:6px 12px; border-radius:6px; border:1px solid var(--admin-border);">
            🟢 सक्रिय यूज़र्स: <strong style="color:#10b981;">${activeCount}</strong>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <input type="search" id="wb-rcpt-drawer-search" class="admin-input" placeholder="🔍 यूज़र का नाम, मोबाइल नंबर या Share ID से खोजें..." style="width:100%; padding:10px 12px; font-size:0.88rem;" />
      </div>

      <div id="wb-rcpt-drawer-list-wrap" style="max-height: 460px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
        <!-- User rows populated below -->
      </div>
    `;

    const listWrap = document.getElementById('wb-rcpt-drawer-list-wrap');
    const searchBox = document.getElementById('wb-rcpt-drawer-search');

    function renderRecipientUserList(query = '') {
      if (!listWrap) return;
      const q = query.toLowerCase().trim();
      const filtered = allProfiles.filter(u => {
        if (!q) return true;
        const name = (u.name || u.full_name || '').toLowerCase();
        const mobile = (u.mobile || '').toLowerCase();
        const shareId = (u.share_id || u.referral_code || '').toLowerCase();
        return name.includes(q) || mobile.includes(q) || shareId.includes(q);
      });

      if (filtered.length === 0) {
        listWrap.innerHTML = '<div style="text-align:center; padding:20px; color:var(--admin-muted);">कोई यूज़र नहीं मिला।</div>';
        return;
      }

      listWrap.innerHTML = filtered.map(u => {
        const uShareId = u.share_id || u.referral_code || 'AI000000';
        const userShareUrl = `https://aarogyamindia.online/ucas/landing.html?id=${encodeURIComponent(webinar.id)}&share_id=${encodeURIComponent(uShareId)}`;
        const waText = `नमस्ते ${u.name || u.full_name || 'जी'}! आपका लाइव वेबिनार लिंक तैयार है:\n${userShareUrl}`;
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

        return `
          <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div>
              <div style="font-weight: 700; color: var(--admin-text); font-size: 0.9rem;">
                ${u.name || u.full_name || 'Aarogyam User'}
                ${u.is_active || u.is_subscriber ? '<span style="color:#10b981; font-size:0.72rem; font-weight:700; margin-left:6px;">🟢 Active</span>' : '<span style="color:#ef4444; font-size:0.72rem; font-weight:700; margin-left:6px;">🔴 Inactive</span>'}
              </div>
              <div style="font-size: 0.78rem; color: var(--admin-muted); margin-top: 2px;">
                📞 ${u.mobile || 'N/A'} • Share ID: <code style="color:var(--admin-primary); font-weight:800;">${uShareId}</code>
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" class="admin-button small-button btn-copy-user-link" data-url="${userShareUrl}" style="background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); font-size: 0.75rem; font-weight: 700; padding: 4px 8px;">
                📋 लिंक कॉपी
              </button>
              <a href="${waUrl}" target="_blank" class="admin-button small-button" style="background: #25D366; color: #fff; text-decoration: none; font-size: 0.75rem; font-weight: 700; padding: 4px 8px;">
                💬 WhatsApp
              </a>
            </div>
          </div>
        `;
      }).join('');

      listWrap.querySelectorAll('.btn-copy-user-link').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.dataset.url;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            const origText = btn.innerHTML;
            btn.innerHTML = '✓ कॉपी हो गया!';
            setTimeout(() => { btn.innerHTML = origText; }, 1800);
          }
        });
      });
    }

    searchBox?.addEventListener('input', (e) => renderRecipientUserList(e.target.value));
    renderRecipientUserList();

    drawerOverlay.classList.add('active');
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
                const clean10Mob = sMob.length === 10 ? sMob : sMob.slice(-10);
                const regDate = att.created_at ? new Date(att.created_at).toLocaleString('hi-IN') : '-';
                const attendeeName = att.name || 'मित्र';
                const waMsg = `नमस्ते ${attendeeName} जी! आपने हमारे लाइव वेबिनार "${webinar.title || 'लाइव वेबिनार'}" में भाग लिया था। आपको वेबिनार कैसा लगा और क्या-क्या समझ में आया? अब आइए आगे का प्लान करते हैं और इस पर चर्चा करते हैं।`;
                const waLink = `https://wa.me/91${clean10Mob}?text=${encodeURIComponent(waMsg)}`;

                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td>
                      <div style="font-weight: 700; color: var(--admin-text);">${att.name}</div>
                      <div style="font-size: 0.72rem; color: var(--admin-muted);">Place: ${att.village || '-'}</div>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <a href="tel:${clean10Mob}" class="admin-subtle-link" style="font-weight: 700; font-size: 0.82rem; color:#3b82f6;">📞 ${att.mobile || '-'}</a>
                        ${clean10Mob ? `<a href="${waLink}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp Follow-up">💬</a>` : ''}
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
  userFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  dateDropdown?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  refreshBtn?.addEventListener('click', loadWebinarData);

  await loadWebinarData();
}
