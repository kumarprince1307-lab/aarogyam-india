/* Admin Webinar Reports & User Leads Module (5-Tab Advanced Hub) */

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

const PAGE_SIZE = 25;

export async function initWebinarReports() {
  initAdminLayout('Webinar Reports & Analytics Hub', 'संपूर्ण वेबिनार प्रदर्शन, यूजर-वाइज लीड्स, वीडियो दर्शक, शेयरिंग व वायरल ट्रैफ़िक रिपोर्ट।');

  const content = document.getElementById('page-content');
  if (!content) return;

  let activeTab = 'user-reports'; // 'user-reports' | 'all-attendees' | 'share-traffic' | 'video-viewers' | 'video-analytics'
  let currentUsersPage = 1;
  let currentAttendeesPage = 1;
  let currentSharesPage = 1;
  let currentViewersPage = 1;
  let currentAnalyticsPage = 1;

  let allUsersData = [];
  let allAttendeesData = [];
  let allSharesData = [];
  let allVideoViewsData = [];
  let allProfiles = [];

  content.innerHTML = `
    <!-- Top Summary KPI Row -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
      <div class="admin-data-card" style="border-left: 4px solid #3b82f6; background: rgba(15,23,42,0.85);">
        <h4 style="color:#94a3b8; font-size:0.8rem; margin-bottom:4px;">👥 कुल रजिस्टर्ड किसान (Total Leads)</h4>
        <p style="margin:0;"><strong id="kpi_total_leads" style="font-size:1.5rem; color:#60a5fa;">0</strong> <span style="font-size:0.75rem; color:#94a3b8;">Leads</span></p>
      </div>

      <div class="admin-data-card" style="border-left: 4px solid #10b981; background: rgba(15,23,42,0.85);">
        <h4 style="color:#94a3b8; font-size:0.8rem; margin-bottom:4px;">🔴 ज़ूम में शामिल हुए (Live Turnout)</h4>
        <p style="margin:0;"><strong id="kpi_total_joined" style="font-size:1.5rem; color:#34d399;">0</strong> <span style="font-size:0.75rem; color:#94a3b8;">Attended</span></p>
      </div>

      <div class="admin-data-card" style="border-left: 4px solid #06b6d4; background: rgba(15,23,42,0.85);">
        <h4 style="color:#94a3b8; font-size:0.8rem; margin-bottom:4px;">🚀 कुल वेबिनार शेयर्स व क्लिक्स</h4>
        <p style="margin:0;"><strong id="kpi_total_shares" style="font-size:1.5rem; color:#22d3ee;">0</strong> <span style="font-size:0.75rem; color:#94a3b8;">Shares / Clicks</span></p>
      </div>

      <div class="admin-data-card" style="border-left: 4px solid #f43f5e; background: rgba(15,23,42,0.85);">
        <h4 style="color:#94a3b8; font-size:0.8rem; margin-bottom:4px;">📺 वीडियो व्यूज, लाइक व कमेंट्स</h4>
        <p style="margin:0;"><strong id="kpi_total_views" style="font-size:1.5rem; color:#fb7185;">0</strong> <span style="font-size:0.75rem; color:#94a3b8;">Activities</span></p>
      </div>

      <div class="admin-data-card" style="border-left: 4px solid #f59e0b; background: rgba(15,23,42,0.85);">
        <h4 style="color:#94a3b8; font-size:0.8rem; margin-bottom:4px;">📊 औसत अटेंडेंस दर (%)</h4>
        <p style="margin:0;"><strong id="kpi_turnout_rate" style="font-size:1.5rem; color:#fbbf24;">0%</strong></p>
      </div>
    </div>

    <!-- Navigation Tabs & Global Actions -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
      <!-- Tab Switcher -->
      <div style="display:inline-flex; background:rgba(30,41,59,0.9); padding:4px; border-radius:10px; border:1px solid var(--admin-border); flex-wrap:wrap; gap:4px;">
        <button type="button" id="tab_btn_user_reports" class="admin-button small-button" style="background:#2563eb; color:#fff; font-weight:800; padding:6px 12px; border-radius:8px;">
          👤 1. यूजर-वाइज लीड्स (User Reports)
        </button>
        <button type="button" id="tab_btn_all_attendees" class="admin-button small-button" style="background:transparent; color:var(--admin-text); font-weight:800; padding:6px 12px; border-radius:8px;">
          🌾 2. सभी रजिस्टर्ड किसान (All Attendees)
        </button>
        <button type="button" id="tab_btn_share_traffic" class="admin-button small-button" style="background:transparent; color:var(--admin-text); font-weight:800; padding:6px 12px; border-radius:8px;">
          🚀 3. शेयर व वायरल क्लिक्स (Shares & Traffic)
        </button>
        <button type="button" id="tab_btn_video_viewers" class="admin-button small-button" style="background:transparent; color:var(--admin-text); font-weight:800; padding:6px 12px; border-radius:8px;">
          📺 4. वीडियो व रील्स दर्शक (Video Viewers)
        </button>
        <button type="button" id="tab_btn_video_analytics" class="admin-button small-button" style="background:transparent; color:var(--admin-text); font-weight:800; padding:6px 12px; border-radius:8px;">
          📊 5. वीडियो विश्लेषण व रैंकिंग (Video Analytics)
        </button>
      </div>

      <!-- Quick Action Buttons -->
      <div style="display:flex; gap:8px;">
        <a href="https://aarogyamindia.online/tube.html" target="_blank" class="admin-button small-button" style="background:#0f172a; border:1px solid #ef4444; color:#fca5a5; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
          <span>🎬</span> <span>AarogyamTube खोलें</span>
        </a>
        <a href="https://aarogyamindia.online/webinar.html" target="_blank" class="admin-button small-button" style="background:#0f172a; border:1px solid #3b82f6; color:#93c5fd; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
          <span>🌐</span> <span>लाइव वेबिनार पेज</span>
        </a>
        <a href="#all-webinars" data-route="all-webinars" class="admin-button small-button" style="background:linear-gradient(135deg,#047857,#10b981); color:#fff; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
          <span>🎥</span> <span>वेबिनार व वीडियो सेटिंग्स</span>
        </a>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="admin-filter-bar" style="background: var(--admin-surface); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--admin-border); margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
      <div style="flex: 1; min-width: 240px;">
        <input type="text" id="wb_report_search_input" class="admin-input" placeholder="🔍 नाम, मोबाइल नंबर, जिला, वीडियो या Share ID से खोजें..." style="width: 100%;" />
      </div>

      <div id="wb_status_filter_wrap" style="display:none;">
        <select id="wb_attendance_filter" class="admin-select" style="min-width: 160px; font-weight: 700;">
          <option value="all">सभी स्थिति (All Status)</option>
          <option value="joined">🟢 सिर्फ Live Joined</option>
          <option value="registered">⏳ सिर्फ Registered</option>
        </select>
      </div>

      <div>
        <button type="button" id="wb_export_csv_btn" class="admin-button small-button" style="background:#1e293b; color:#cbd5e1; border:1px solid var(--admin-border); font-weight:700; display:inline-flex; align-items:center; gap:6px;">
          <span>📥</span> <span>CSV डाउनलोड</span>
        </button>
      </div>
    </div>

    <!-- Tab 1: User-Wise Reports -->
    <div id="container_user_reports">
      <div class="admin-loading">लोड हो रहा है...</div>
    </div>

    <!-- Tab 2: All Attendees Master List -->
    <div id="container_all_attendees" style="display:none;">
      <div class="admin-loading">लोड हो रहा है...</div>
    </div>

    <!-- Tab 3: Shares & Viral Traffic -->
    <div id="container_share_traffic" style="display:none;">
      <div class="admin-loading">लोड हो रहा है...</div>
    </div>

    <!-- Tab 4: Video Viewers Log -->
    <div id="container_video_viewers" style="display:none;">
      <div class="admin-loading">लोड हो रहा है...</div>
    </div>

    <!-- Tab 5: Video Performance & Analytics -->
    <div id="container_video_analytics" style="display:none;">
      <div class="admin-loading">लोड हो रहा है...</div>
    </div>
  `;

  const btnTabUsers = document.getElementById('tab_btn_user_reports');
  const btnTabAttendees = document.getElementById('tab_btn_all_attendees');
  const btnTabShares = document.getElementById('tab_btn_share_traffic');
  const btnTabVideos = document.getElementById('tab_btn_video_viewers');
  const btnTabAnalytics = document.getElementById('tab_btn_video_analytics');

  const containerUsers = document.getElementById('container_user_reports');
  const containerAttendees = document.getElementById('container_all_attendees');
  const containerShares = document.getElementById('container_share_traffic');
  const containerVideos = document.getElementById('container_video_viewers');
  const containerAnalytics = document.getElementById('container_video_analytics');

  const statusFilterWrap = document.getElementById('wb_status_filter_wrap');
  const searchInput = document.getElementById('wb_report_search_input');
  const statusSelect = document.getElementById('wb_attendance_filter');
  const exportBtn = document.getElementById('wb_export_csv_btn');

  function setTabButtonState(activeBtn) {
    [btnTabUsers, btnTabAttendees, btnTabShares, btnTabVideos, btnTabAnalytics].forEach(btn => {
      if (!btn) return;
      if (btn === activeBtn) {
        btn.style.background = '#2563eb';
        btn.style.color = '#fff';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--admin-text)';
      }
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    containerUsers.style.display = tab === 'user-reports' ? 'block' : 'none';
    containerAttendees.style.display = tab === 'all-attendees' ? 'block' : 'none';
    containerShares.style.display = tab === 'share-traffic' ? 'block' : 'none';
    containerVideos.style.display = tab === 'video-viewers' ? 'block' : 'none';
    containerAnalytics.style.display = tab === 'video-analytics' ? 'block' : 'none';

    if (statusFilterWrap) {
      statusFilterWrap.style.display = tab === 'all-attendees' ? 'block' : 'none';
    }

    if (tab === 'user-reports') {
      setTabButtonState(btnTabUsers);
      renderUserReportsTable();
    } else if (tab === 'all-attendees') {
      setTabButtonState(btnTabAttendees);
      renderAllAttendeesTable();
    } else if (tab === 'share-traffic') {
      setTabButtonState(btnTabShares);
      renderShareTrafficTable();
    } else if (tab === 'video-viewers') {
      setTabButtonState(btnTabVideos);
      renderVideoViewersTable();
    } else if (tab === 'video-analytics') {
      setTabButtonState(btnTabAnalytics);
      renderVideoAnalyticsTable();
    }
  }

  btnTabUsers?.addEventListener('click', () => switchTab('user-reports'));
  btnTabAttendees?.addEventListener('click', () => switchTab('all-attendees'));
  btnTabShares?.addEventListener('click', () => switchTab('share-traffic'));
  btnTabVideos?.addEventListener('click', () => switchTab('video-viewers'));
  btnTabAnalytics?.addEventListener('click', () => switchTab('video-analytics'));

  // Load Data
  async function loadWebinarReportData() {
    const db = getAdminDb();
    if (!db) return;

    try {
      const [profilesRes, surveysRes, shareLogsRes] = await Promise.all([
        db.from('profiles').select('id, full_name, mobile, email, registration_source, share_id, referral_code, is_active').order('created_at', { ascending: false }),
        db.from('surveys').select('id, profile_id, name, mobile, state, district, occupation, selected_categories, category_answers, created_at').order('created_at', { ascending: false }),
        db.from('share_logs').select('share_token, event_type, created_at').order('created_at', { ascending: false })
      ]);

      allProfiles = profilesRes.data || [];
      const allSurveys = surveysRes.data || [];
      const allLogs = shareLogsRes.data || [];

      // 1. Separate Webinar Registrations vs Video Watches
      const webinarSurveys = [];
      allVideoViewsData = [];

      allSurveys.forEach(s => {
        const cAns = s.category_answers || {};

        const isVideo = cAns.event_type === 'recorded_video_view' || 
                        cAns.event_type === 'video_unlock' || 
                        s.occupation === 'video_viewer' || 
                        (Array.isArray(s.selected_categories) ? s.selected_categories.includes('webinar_video_view') : String(s.selected_categories || '').includes('webinar_video_view')) ||
                        Boolean(cAns.video_id);

        const isWb = !isVideo && (cAns.event_type === 'webinar_registration' || 
                     cAns.event_type === 'webinar_attendance' || 
                     s.occupation === 'attendee' || 
                     (Array.isArray(s.selected_categories) ? s.selected_categories.includes('webinar_lead') : String(s.selected_categories || '').includes('webinar_lead')) || 
                     Boolean(cAns.webinar_id));

        if (isVideo) {
          const refId = cAns.referrer_share_id || s.profile_id || 'AI000004';
          const sponsor = allProfiles.find(p => p.id === refId || p.share_id === refId || p.referral_code === refId || p.mobile === refId);
          allVideoViewsData.push({
            id: s.id,
            name: s.name || 'दर्शक साथी',
            mobile: s.mobile || 'N/A',
            state: s.state || '',
            district: s.district || '',
            actionType: cAns.action_type || 'view',
            comment: cAns.comment || '',
            videoTitle: cAns.video_title || 'रिकॉर्डेड ट्रेनिंग क्लास',
            videoId: cAns.video_id || 'VID_001',
            viewedAt: cAns.viewed_at || cAns.unlocked_at || s.created_at,
            sponsorId: refId || 'ALL_USERS',
            sponsorName: sponsor?.full_name || (refId === 'ALL_USERS' ? '🌐 Universal' : refId)
          });
        }

        if (isWb) {
          webinarSurveys.push(s);
        }
      });

      // 2. Map Attendees
      allAttendeesData = webinarSurveys.map(s => {
        const cAns = s.category_answers || {};
        const isJoined = cAns.event_type === 'webinar_attendance' || Boolean(cAns.joined_at);
        const refId = s.profile_id || cAns.referrer_share_id || '';
        const sponsorProfile = allProfiles.find(p => p.id === refId || p.share_id === refId || p.referral_code === refId || p.mobile === refId);

        return {
          id: s.id,
          name: s.name || 'किसान साथी',
          mobile: s.mobile || 'N/A',
          state: s.state || '',
          district: s.district || '',
          registeredAt: cAns.registered_at || s.created_at,
          joinedAt: cAns.joined_at || null,
          isJoined: isJoined,
          webinarTitle: cAns.webinar_title || '🌾 लाइव ज़ूम वेबिनार एवं फसल परामर्श',
          sponsorId: refId || 'ALL_USERS',
          sponsorName: sponsorProfile?.full_name || (refId === 'ALL_USERS' ? '🌐 Aarogyam Universal' : refId),
          sponsorMobile: sponsorProfile?.mobile || ''
        };
      });

      // 3. Map Share Logs
      const shareStatsMap = {};
      allLogs.forEach(log => {
        const token = log.share_token;
        if (!token) return;
        if (!shareStatsMap[token]) shareStatsMap[token] = { shares: 0, clicks: 0, visitors: 0 };
        if (log.event_type === 'share') shareStatsMap[token].shares++;
        if (log.event_type === 'click') shareStatsMap[token].clicks++;
        if (log.event_type === 'visit') shareStatsMap[token].visitors++;
      });

      // Build User-Wise Aggregations
      const userWbMap = {};
      allAttendeesData.forEach(att => {
        const refKey = att.sponsorId || 'ALL_USERS';
        if (!userWbMap[refKey]) {
          userWbMap[refKey] = { leads: 0, joined: 0, attendees: [] };
        }
        if (att.isJoined) userWbMap[refKey].joined++;
        else userWbMap[refKey].leads++;
        userWbMap[refKey].attendees.push(att);
      });

      allUsersData = allProfiles.map(u => {
        const sId = u.share_id || u.referral_code || 'N/A';
        const wb = userWbMap[u.id] || userWbMap[sId] || userWbMap[u.mobile] || { leads: 0, joined: 0, attendees: [] };
        const sh = shareStatsMap[sId] || shareStatsMap[u.id] || { shares: 0, clicks: 0, visitors: 0 };
        const totalLeads = (wb.leads || 0) + (wb.joined || 0);

        return {
          id: u.id,
          name: u.full_name,
          mobile: u.mobile,
          shareId: sId,
          status: u.is_active ? 'active' : 'inactive',
          webinarLeads: totalLeads,
          webinarJoined: wb.joined || 0,
          totalShares: sh.shares,
          totalClicks: sh.clicks,
          totalVisitors: sh.visitors,
          turnoutRate: totalLeads ? Math.round(((wb.joined || 0) / totalLeads) * 100) : 0,
          attendees: wb.attendees || []
        };
      });

      allUsersData.sort((a, b) => (b.webinarLeads - a.webinarLeads || b.totalShares - a.totalShares));
      allSharesData = [...allUsersData].sort((a, b) => (b.totalShares + b.totalClicks) - (a.totalShares + a.totalClicks));

      // Calculate KPIs
      const totalLeadsCount = allAttendeesData.length;
      const totalJoinedCount = allAttendeesData.filter(a => a.isJoined).length;
      const totalSharesAndClicks = allLogs.length;
      const totalVideoWatches = allVideoViewsData.length;
      const overallTurnout = totalLeadsCount ? Math.round((totalJoinedCount / totalLeadsCount) * 100) : 0;

      const elTotalLeads = document.getElementById('kpi_total_leads');
      const elTotalJoined = document.getElementById('kpi_total_joined');
      const elTotalShares = document.getElementById('kpi_total_shares');
      const elTotalViews = document.getElementById('kpi_total_views');
      const elTurnoutRate = document.getElementById('kpi_turnout_rate');

      if (elTotalLeads) elTotalLeads.textContent = totalLeadsCount;
      if (elTotalJoined) elTotalJoined.textContent = totalJoinedCount;
      if (elTotalShares) elTotalShares.textContent = totalSharesAndClicks;
      if (elTotalViews) elTotalViews.textContent = totalVideoWatches;
      if (elTurnoutRate) elTurnoutRate.textContent = `${overallTurnout}%`;

      renderUserReportsTable();
      renderAllAttendeesTable();
      renderShareTrafficTable();
      renderVideoViewersTable();
      renderVideoAnalyticsTable();

    } catch (err) {
      console.error('Failed to load webinar report data:', err);
    }
  }

  function getFilteredUsers() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (!q) return allUsersData;
    return allUsersData.filter(u => 
      (u.name || '').toLowerCase().includes(q) ||
      (u.mobile || '').includes(q) ||
      (u.shareId || '').toLowerCase().includes(q)
    );
  }

  function getFilteredAttendees() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const statusVal = statusSelect?.value || 'all';

    return allAttendeesData.filter(att => {
      if (statusVal === 'joined' && !att.isJoined) return false;
      if (statusVal === 'registered' && att.isJoined) return false;

      if (q) {
        const matchName = (att.name || '').toLowerCase().includes(q);
        const matchMob = (att.mobile || '').includes(q);
        const matchDistrict = (att.district || '').toLowerCase().includes(q) || (att.state || '').toLowerCase().includes(q);
        const matchSponsor = (att.sponsorName || '').toLowerCase().includes(q) || (att.sponsorId || '').toLowerCase().includes(q);
        if (!matchName && !matchMob && !matchDistrict && !matchSponsor) return false;
      }
      return true;
    });
  }

  function getFilteredShares() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (!q) return allSharesData;
    return allSharesData.filter(u => 
      (u.name || '').toLowerCase().includes(q) ||
      (u.mobile || '').includes(q) ||
      (u.shareId || '').toLowerCase().includes(q)
    );
  }

  function getFilteredVideoViews() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    return allVideoViewsData.filter(v => {
      if (q) {
        const mName = (v.name || '').toLowerCase().includes(q);
        const mMob = (v.mobile || '').includes(q);
        const mTitle = (v.videoTitle || '').toLowerCase().includes(q);
        const mSponsor = (v.sponsorName || '').toLowerCase().includes(q);
        const mDistrict = (v.district || '').toLowerCase().includes(q);
        const mAction = (v.actionType || '').toLowerCase().includes(q);
        const mComment = (v.comment || '').toLowerCase().includes(q);
        if (!mName && !mMob && !mTitle && !mSponsor && !mDistrict && !mAction && !mComment) return false;
      }
      return true;
    });
  }

  let selectedAnalyticsVideoTitle = 'all';
  let selectedAnalyticsAction = 'all';

  function getFilteredAnalyticsViews() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    return allVideoViewsData.filter(v => {
      if (selectedAnalyticsVideoTitle !== 'all' && (v.videoTitle || '') !== selectedAnalyticsVideoTitle && (v.videoId || '') !== selectedAnalyticsVideoTitle) {
        return false;
      }
      if (selectedAnalyticsAction !== 'all' && (v.actionType || 'view') !== selectedAnalyticsAction) {
        return false;
      }
      if (q) {
        const mName = (v.name || '').toLowerCase().includes(q);
        const mMob = (v.mobile || '').includes(q);
        const mTitle = (v.videoTitle || '').toLowerCase().includes(q);
        const mSponsor = (v.sponsorName || '').toLowerCase().includes(q);
        const mDistrict = (v.district || '').toLowerCase().includes(q);
        const mAction = (v.actionType || '').toLowerCase().includes(q);
        const mComment = (v.comment || '').toLowerCase().includes(q);
        if (!mName && !mMob && !mTitle && !mSponsor && !mDistrict && !mAction && !mComment) return false;
      }
      return true;
    });
  }

  // TAB 1: User Reports Table
  function renderUserReportsTable() {
    if (!containerUsers) return;

    const users = getFilteredUsers();
    const total = users.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentUsersPage > totalPages) currentUsersPage = totalPages;
    if (currentUsersPage < 1) currentUsersPage = 1;

    const start = (currentUsersPage - 1) * PAGE_SIZE;
    const paginated = users.slice(start, start + PAGE_SIZE);

    if (users.length === 0) {
      containerUsers.innerHTML = `<div class="admin-empty">कोई यूजर या लीड्स रिकॉर्ड नहीं मिला।</div>`;
      return;
    }

    containerUsers.innerHTML = `
      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>यूजर / स्पॉन्सर नाम</th>
              <th>मोबाइल नंबर</th>
              <th>Share ID</th>
              <th>वेबिनार लीड्स</th>
              <th>ज़ूम अटेंडेड</th>
              <th>टर्नआउट (%)</th>
              <th>कुल शेयर्स</th>
              <th>क्लिक्स</th>
              <th>व्यक्तिगत वेबिनार लिंक</th>
              <th>विवरण / लीड्स</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map((u, i) => {
              const rowNum = start + i + 1;
              const sId = u.shareId || 'AI000004';
              const wbUrl = `https://aarogyamindia.online/webinar.html?ref=${encodeURIComponent(sId)}`;
              const waShareText = encodeURIComponent(`🌾 *आरोग्यम इंडिया लाइव कृषि वेबिनार*\n\n👉 *मुफ्त रजिस्ट्रेशन व ज़ूम लिंक:*\n${wbUrl}`);
              const cleanMobile = String(u.mobile || '').replace(/\D/g, '');

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: #fff;">${u.name || 'Unknown'}</div>
                    <span class="admin-pill" style="background:${u.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color:${u.status === 'active' ? '#34d399' : '#f87171'}; font-size: 0.65rem;">
                      ${u.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <a href="tel:${cleanMobile}" class="admin-subtle-link" style="font-weight: 700;">📞 ${u.mobile}</a>
                  </td>
                  <td>
                    <code style="background: rgba(30,41,59,0.9); padding: 2px 6px; border-radius: 4px; color: #60a5fa; font-weight: 700;">
                      ${sId}
                    </code>
                  </td>
                  <td>
                    <span style="font-weight: 800; color: #60a5fa; font-size: 1rem;">${u.webinarLeads}</span>
                  </td>
                  <td>
                    <span style="font-weight: 800; color: #34d399; font-size: 1rem;">${u.webinarJoined}</span>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <strong style="color: ${u.turnoutRate >= 50 ? '#34d399' : (u.turnoutRate >= 20 ? '#fbbf24' : '#94a3b8')};">${u.turnoutRate}%</strong>
                      <div style="width: 40px; height: 5px; background: #334155; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${u.turnoutRate}%; height: 100%; background: ${u.turnoutRate >= 50 ? '#10b981' : (u.turnoutRate >= 20 ? '#f59e0b' : '#64748b')};"></div>
                      </div>
                    </div>
                  </td>
                  <td><strong style="color: #22d3ee;">${u.totalShares}</strong></td>
                  <td><strong style="color: #fb7185;">${u.totalClicks}</strong></td>
                  <td>
                    <div style="display: flex; gap: 4px; align-items: center;">
                      <button type="button" class="admin-button small-button btn-copy-link" data-url="${wbUrl}" style="padding: 3px 7px; font-size: 0.75rem;" title="लिंक कॉपी करें">📋</button>
                      <a href="https://api.whatsapp.com/send?text=${waShareText}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; padding:3px 7px; font-size:0.75rem;" title="WhatsApp शेयर">💬</a>
                    </div>
                  </td>
                  <td>
                    <button type="button" class="admin-button small-button btn-view-user-drawer" data-user-id="${u.id}" style="background: rgba(37,99,235,0.2); border: 1px solid #3b82f6; color: #93c5fd; padding: 4px 10px; font-weight: 700;">
                      👁️ लीड्स (${u.webinarLeads})
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="admin-pagination-bar" style="margin-top: 16px;">
        <div class="admin-pagination-info">Page <strong>${currentUsersPage}</strong> of <strong>${totalPages}</strong> (${total} Users)</div>
        <div class="admin-pagination-controls">
          <button type="button" id="users-report-prev" class="admin-button small-button" ${currentUsersPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>◀ Previous</button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentUsersPage} / ${totalPages}</span>
          <button type="button" id="users-report-next" class="admin-button small-button" ${currentUsersPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Next ▶</button>
        </div>
      </div>
    `;

    document.getElementById('users-report-prev')?.addEventListener('click', () => {
      if (currentUsersPage > 1) { currentUsersPage--; renderUserReportsTable(); }
    });
    document.getElementById('users-report-next')?.addEventListener('click', () => {
      if (currentUsersPage < totalPages) { currentUsersPage++; renderUserReportsTable(); }
    });
  }

  // TAB 2: All Attendees Table
  function renderAllAttendeesTable() {
    if (!containerAttendees) return;

    const attendees = getFilteredAttendees();
    const total = attendees.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentAttendeesPage > totalPages) currentAttendeesPage = totalPages;
    if (currentAttendeesPage < 1) currentAttendeesPage = 1;

    const start = (currentAttendeesPage - 1) * PAGE_SIZE;
    const paginated = attendees.slice(start, start + PAGE_SIZE);

    if (attendees.length === 0) {
      containerAttendees.innerHTML = `<div class="admin-empty">कोई रजिस्टर्ड किसान रिकॉर्ड नहीं मिला।</div>`;
      return;
    }

    containerAttendees.innerHTML = `
      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>किसान का नाम</th>
              <th>मोबाइल नंबर</th>
              <th>राज्य / जिला</th>
              <th>वेबिनार स्थिति</th>
              <th>स्पॉन्सर / प्रमोटर</th>
              <th>रजिस्ट्रेशन दिनांक</th>
              <th>सीधा संपर्क (Call / WA)</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map((a, i) => {
              const rowNum = start + i + 1;
              const sMob = String(a.mobile || '').replace(/\D/g, '');
              const waMob = sMob.length === 10 ? '91' + sMob : sMob;
              const waMsg = encodeURIComponent(`नमस्ते ${a.name} जी! आरोग्यम इंडिया लाइव वेबिनार में भाग लेने के लिए धन्यवाद। क्या आपके पास कोई प्रश्न है?`);
              const regDate = a.registeredAt ? new Date(a.registeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td><strong style="color: #fff;">${a.name}</strong></td>
                  <td><a href="tel:${sMob}" class="admin-subtle-link" style="font-weight: 700;">📞 ${a.mobile}</a></td>
                  <td>${a.district || a.state || '-'}</td>
                  <td>
                    ${a.isJoined 
                      ? `<span class="admin-pill" style="background:rgba(16,185,129,0.2); color:#34d399; font-weight:800;">🟢 Live Joined</span>` 
                      : `<span class="admin-pill" style="background:rgba(245,158,11,0.2); color:#fbbf24; font-weight:700;">⏳ Registered</span>`
                    }
                  </td>
                  <td>
                    <div style="font-weight:700; color:#cbd5e1;">${a.sponsorName}</div>
                    <code style="font-size:0.75rem; color:#60a5fa;">${a.sponsorId}</code>
                  </td>
                  <td><span style="font-size: 0.82rem; color: #94a3b8;">${regDate}</span></td>
                  <td>
                    <div style="display: flex; gap: 6px; align-items: center;">
                      <a href="tel:${sMob}" class="admin-button small-button" style="background:#0f172a; border:1px solid #475569; color:#cbd5e1; padding:3px 8px; font-size:0.75rem;" title="Call">📞 Call</a>
                      <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; padding:3px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;" title="WhatsApp">💬 WA</a>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="admin-pagination-bar" style="margin-top: 16px;">
        <div class="admin-pagination-info">Page <strong>${currentAttendeesPage}</strong> of <strong>${totalPages}</strong> (${total} Attendees)</div>
        <div class="admin-pagination-controls">
          <button type="button" id="attendees-report-prev" class="admin-button small-button" ${currentAttendeesPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>◀ Previous</button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentAttendeesPage} / ${totalPages}</span>
          <button type="button" id="attendees-report-next" class="admin-button small-button" ${currentAttendeesPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Next ▶</button>
        </div>
      </div>
    `;

    document.getElementById('attendees-report-prev')?.addEventListener('click', () => {
      if (currentAttendeesPage > 1) { currentAttendeesPage--; renderAllAttendeesTable(); }
    });
    document.getElementById('attendees-report-next')?.addEventListener('click', () => {
      if (currentAttendeesPage < totalPages) { currentAttendeesPage++; renderAllAttendeesTable(); }
    });
  }

  // TAB 3: Shares & Viral Traffic Table
  function renderShareTrafficTable() {
    if (!containerShares) return;

    const shares = getFilteredShares();
    const total = shares.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentSharesPage > totalPages) currentSharesPage = totalPages;
    if (currentSharesPage < 1) currentSharesPage = 1;

    const start = (currentSharesPage - 1) * PAGE_SIZE;
    const paginated = shares.slice(start, start + PAGE_SIZE);

    if (shares.length === 0) {
      containerShares.innerHTML = `<div class="admin-empty">कोई शेयरिंग या वायरल ट्रैफ़िक रिकॉर्ड नहीं मिला।</div>`;
      return;
    }

    containerShares.innerHTML = `
      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>प्रमोटर / यूजर नाम</th>
              <th>मोबाइल नंबर</th>
              <th>Share Token / ID</th>
              <th>कुल शेयर्स (Shares)</th>
              <th>क्लिक्स (Clicks)</th>
              <th>विजिटर्स (Visitors)</th>
              <th>कन्वर्जन लीड्स (Leads)</th>
              <th>कन्वर्जन रेट (%)</th>
              <th>एक्शन</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map((u, i) => {
              const rowNum = start + i + 1;
              const convRate = u.totalClicks ? Math.round((u.webinarLeads / u.totalClicks) * 100) : 0;
              const sId = u.shareId || 'AI000004';
              const cleanMobile = String(u.mobile || '').replace(/\D/g, '');

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td><strong style="color: #fff;">${u.name || 'Unknown'}</strong></td>
                  <td><a href="tel:${cleanMobile}" class="admin-subtle-link" style="font-weight: 700;">📞 ${u.mobile}</a></td>
                  <td><code style="color: #60a5fa; font-weight: 700;">${sId}</code></td>
                  <td><strong style="color: #22d3ee; font-size: 1rem;">${u.totalShares}</strong></td>
                  <td><strong style="color: #fb7185; font-size: 1rem;">${u.totalClicks}</strong></td>
                  <td><strong style="color: #fbbf24; font-size: 1rem;">${u.totalVisitors}</strong></td>
                  <td><strong style="color: #34d399; font-size: 1rem;">${u.webinarLeads}</strong></td>
                  <td>
                    <span class="admin-pill" style="background:rgba(59,130,246,0.15); color:#60a5fa; font-weight:800;">
                      ${convRate}% Conv
                    </span>
                  </td>
                  <td>
                    <button type="button" class="admin-button small-button btn-view-user-drawer" data-user-id="${u.id}" style="padding: 3px 8px; font-size: 0.75rem;">
                      📊 विस्तृत रिपोर्ट
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="admin-pagination-bar" style="margin-top: 16px;">
        <div class="admin-pagination-info">Page <strong>${currentSharesPage}</strong> of <strong>${totalPages}</strong> (${total} Promoters)</div>
        <div class="admin-pagination-controls">
          <button type="button" id="shares-report-prev" class="admin-button small-button" ${currentSharesPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>◀ Previous</button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentSharesPage} / ${totalPages}</span>
          <button type="button" id="shares-report-next" class="admin-button small-button" ${currentSharesPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Next ▶</button>
        </div>
      </div>
    `;

    document.getElementById('shares-report-prev')?.addEventListener('click', () => {
      if (currentSharesPage > 1) { currentSharesPage--; renderShareTrafficTable(); }
    });
    document.getElementById('shares-report-next')?.addEventListener('click', () => {
      if (currentSharesPage < totalPages) { currentSharesPage++; renderShareTrafficTable(); }
    });
  }

  // TAB 4: Video Viewers Chronological Activity Log (Classic View)
  function renderVideoViewersTable() {
    if (!containerVideos) return;

    const views = getFilteredVideoViews();
    const total = views.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentViewersPage > totalPages) currentViewersPage = totalPages;
    if (currentViewersPage < 1) currentViewersPage = 1;

    const start = (currentViewersPage - 1) * PAGE_SIZE;
    const paginated = views.slice(start, start + PAGE_SIZE);

    if (views.length === 0) {
      containerVideos.innerHTML = `<div class="admin-empty">कोई वीडियो दर्शक या गतिविधि रिकॉर्ड नहीं मिला।</div>`;
      return;
    }

    containerVideos.innerHTML = `
      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>दर्शक का नाम (Viewer)</th>
              <th>मोबाइल नंबर & संपर्क</th>
              <th>स्थान (District / State)</th>
              <th>गतिविधि (Action)</th>
              <th>वीडियो / रील शीर्षक (Video Title)</th>
              <th>कमेंट / फीडबैक</th>
              <th>स्पॉन्सर मेंबर (Sponsor)</th>
              <th>तारीख व समय</th>
              <th>कार्रवाई (Direct Action)</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map((v, i) => {
              const rowNum = start + i + 1;
              const sMob = String(v.mobile || '').replace(/\D/g, '');
              const waMob = sMob.length === 10 ? '91' + sMob : sMob;
              const waMsg = encodeURIComponent(`नमस्ते ${v.name} जी! आपने आरोग्यम इंडिया पर "${v.videoTitle}" वीडियो देखा था...`);
              const vDate = v.viewedAt ? new Date(v.viewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

              let actionBadge = `<span class="admin-pill" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); font-size:0.75rem; font-weight:700;">👁️ देखा (View)</span>`;
              if (v.actionType === 'like') {
                actionBadge = `<span class="admin-pill" style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); font-size:0.75rem; font-weight:700;">❤️ पसंद (Like)</span>`;
              } else if (v.actionType === 'share') {
                actionBadge = `<span class="admin-pill" style="background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.3); font-size:0.75rem; font-weight:700;">📤 शेयर (Share)</span>`;
              } else if (v.actionType === 'comment') {
                actionBadge = `<span class="admin-pill" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); font-size:0.75rem; font-weight:700;">💬 कमेंट (Comment)</span>`;
              }

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td><strong style="color:#fff;">${v.name}</strong></td>
                  <td><a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:700;">📞 ${v.mobile}</a></td>
                  <td>${v.district || v.state || '-'}</td>
                  <td>${actionBadge}</td>
                  <td>
                    <div style="font-weight:700; color:#fff; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${v.videoTitle}">
                      🎬 ${v.videoTitle}
                    </div>
                  </td>
                  <td>
                    ${v.comment ? `<div style="font-size:0.8rem; color:#cbd5e1; font-style:italic; max-width:200px; overflow:hidden; text-overflow:ellipsis;" title="${v.comment}">💬 "${v.comment}"</div>` : '<span style="color:#64748b;">-</span>'}
                  </td>
                  <td>
                    <div style="font-weight:700; color:#cbd5e1;">${v.sponsorName}</div>
                    <code style="font-size:0.75rem; color:#60a5fa;">${v.sponsorId}</code>
                  </td>
                  <td><span style="font-size:0.8rem; color:#94a3b8;">${vDate}</span></td>
                  <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                      <a href="tel:${sMob}" class="admin-button small-button" style="background:#0f172a; border:1px solid #475569; color:#cbd5e1; padding:3px 8px; font-size:0.75rem;" title="Call">📞 Call</a>
                      <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; padding:3px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;" title="WhatsApp">💬 WA</a>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="admin-pagination-bar" style="margin-top: 16px;">
        <div class="admin-pagination-info">Page <strong>${currentViewersPage}</strong> of <strong>${totalPages}</strong> (${total} Activities)</div>
        <div class="admin-pagination-controls">
          <button type="button" id="viewers-report-prev" class="admin-button small-button" ${currentViewersPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>◀ Previous</button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentViewersPage} / ${totalPages}</span>
          <button type="button" id="viewers-report-next" class="admin-button small-button" ${currentViewersPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Next ▶</button>
        </div>
      </div>
    `;

    document.getElementById('viewers-report-prev')?.addEventListener('click', () => {
      if (currentViewersPage > 1) { currentViewersPage--; renderVideoViewersTable(); }
    });
    document.getElementById('viewers-report-next')?.addEventListener('click', () => {
      if (currentViewersPage < totalPages) { currentViewersPage++; renderVideoViewersTable(); }
    });
  }

  // TAB 5: Video Performance & Analytics (Top Leaderboard & Per-Video Inspector)
  function renderVideoAnalyticsTable() {
    if (!containerAnalytics) return;

    // 1. Calculate Video-wise Performance Aggregations
    const videoStatsMap = {};
    allVideoViewsData.forEach(v => {
      const vKey = v.videoTitle || v.videoId || 'Unknown Video';
      if (!videoStatsMap[vKey]) {
        videoStatsMap[vKey] = { title: vKey, videoId: v.videoId, views: 0, likes: 0, shares: 0, comments: 0, total: 0 };
      }
      const act = v.actionType || 'view';
      if (act === 'view') videoStatsMap[vKey].views++;
      else if (act === 'like') videoStatsMap[vKey].likes++;
      else if (act === 'share') videoStatsMap[vKey].shares++;
      else if (act === 'comment') videoStatsMap[vKey].comments++;
      videoStatsMap[vKey].total++;
    });

    const topVideosList = Object.values(videoStatsMap).sort((a, b) => b.total - a.total);
    const uniqueTitles = Object.keys(videoStatsMap).sort();

    const views = getFilteredAnalyticsViews();

    const total = views.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentAnalyticsPage > totalPages) currentAnalyticsPage = totalPages;
    if (currentAnalyticsPage < 1) currentAnalyticsPage = 1;

    const start = (currentAnalyticsPage - 1) * PAGE_SIZE;
    const paginated = views.slice(start, start + PAGE_SIZE);

    containerAnalytics.innerHTML = `
      <!-- 1. Top Performing Videos Leaderboard Summary -->
      <div style="background:rgba(30,41,59,0.7); border:1px solid #334155; border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="font-size:0.95rem; font-weight:800; color:#fff; display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <span style="display:flex; align-items:center; gap:8px;">
            <span>🏆</span> <span>टॉप लोकप्रिय वीडियो लीडरबोर्ड (Top Performing Videos)</span>
          </span>
          <span style="font-size:0.75rem; color:#94a3b8;">कुल ${topVideosList.length} वीडियो सक्रिय</span>
        </div>

        ${topVideosList.length === 0 ? `
          <div style="color:#94a3b8; font-size:0.85rem; text-align:center; padding:10px;">अभी तक कोई वीडियो इंटरैक्शन नहीं हुआ है।</div>
        ` : `
          <div class="admin-table-wrapper" style="max-height:220px; overflow-y:auto;">
            <table class="admin-table" style="font-size:0.82rem;">
              <thead>
                <tr>
                  <th>#</th>
                  <th>वीडियो शीर्षक (Video Title)</th>
                  <th style="color:#60a5fa;">👁️ व्यूज (Views)</th>
                  <th style="color:#f87171;">❤️ लाइक्स (Likes)</th>
                  <th style="color:#4ade80;">📤 शेयर (Shares)</th>
                  <th style="color:#c084fc;">💬 कमेंट्स (Comments)</th>
                  <th>कुल गतिविधि</th>
                  <th>फिल्टर</th>
                </tr>
              </thead>
              <tbody>
                ${topVideosList.slice(0, 10).map((tv, idx) => `
                  <tr style="${selectedAnalyticsVideoTitle === tv.title ? 'background:rgba(37,99,235,0.15);' : ''}">
                    <td><strong>#${idx + 1}</strong></td>
                    <td><strong style="color:#fff;">🎬 ${tv.title}</strong></td>
                    <td><span style="color:#60a5fa; font-weight:700;">${tv.views}</span></td>
                    <td><span style="color:#f87171; font-weight:700;">${tv.likes}</span></td>
                    <td><span style="color:#4ade80; font-weight:700;">${tv.shares}</span></td>
                    <td><span style="color:#c084fc; font-weight:700;">${tv.comments}</span></td>
                    <td><strong style="color:#38bdf8;">${tv.total}</strong></td>
                    <td>
                      <button type="button" class="admin-button small-button btn-filter-analytics-video" data-vtitle="${tv.title}" style="background:${selectedAnalyticsVideoTitle === tv.title ? '#2563eb' : '#1e293b'}; color:#fff; font-size:0.72rem; padding:2px 8px;">
                        ${selectedAnalyticsVideoTitle === tv.title ? '✓ चयनित' : '🔍 दर्शक देखें'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- 2. Video & Action Filter Bar -->
      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:10px; padding:10px 14px; margin-bottom:14px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <label style="font-size:0.75rem; font-weight:700; color:#94a3b8;">🎬 वीडियो चुनें:</label>
            <select id="sel_analytics_video_title" style="background:#1e293b; border:1px solid #334155; border-radius:6px; color:#fff; padding:5px 8px; font-size:0.8rem; max-width:240px;">
              <option value="all" ${selectedAnalyticsVideoTitle === 'all' ? 'selected' : ''}>सभी वीडियो (All Videos)</option>
              ${uniqueTitles.map(t => `<option value="${t}" ${selectedAnalyticsVideoTitle === t ? 'selected' : ''}>${t.slice(0, 40)}</option>`).join('')}
            </select>
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <label style="font-size:0.75rem; font-weight:700; color:#94a3b8;">⚡ गतिविधि:</label>
            <select id="sel_analytics_action" style="background:#1e293b; border:1px solid #334155; border-radius:6px; color:#fff; padding:5px 8px; font-size:0.8rem;">
              <option value="all" ${selectedAnalyticsAction === 'all' ? 'selected' : ''}>सभी गतिविधियां (All Actions)</option>
              <option value="view" ${selectedAnalyticsAction === 'view' ? 'selected' : ''}>👁️ केवल देखे गए (Views)</option>
              <option value="like" ${selectedAnalyticsAction === 'like' ? 'selected' : ''}>❤️ केवल पसंद (Likes)</option>
              <option value="share" ${selectedAnalyticsAction === 'share' ? 'selected' : ''}>📤 केवल शेयर (Shares)</option>
              <option value="comment" ${selectedAnalyticsAction === 'comment' ? 'selected' : ''}>💬 केवल कमेंट्स (Comments)</option>
            </select>
          </div>

          ${(selectedAnalyticsVideoTitle !== 'all' || selectedAnalyticsAction !== 'all') ? `
            <button type="button" id="btn_reset_analytics_filters" class="admin-button small-button" style="background:#334155; color:#cbd5e1; font-size:0.75rem; padding:4px 8px;">
              ✕ फिल्टर हटाएं
            </button>
          ` : ''}
        </div>

        <div style="font-size:0.82rem; color:#94a3b8;">
          Showing <strong>${views.length}</strong> Results
        </div>
      </div>

      <!-- 3. Filtered Viewers & Likers Table -->
      ${views.length === 0 ? `
        <div class="admin-empty"><strong>इस फिल्टर में कोई दर्शक या गतिविधि नहीं मिली।</strong><br>फिल्टर बदलकर देखें।</div>
      ` : `
        <div class="admin-table-wrapper sticky-header-table">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>दर्शक का नाम (Viewer)</th>
                <th>मोबाइल नंबर & संपर्क</th>
                <th>स्थान (District / State)</th>
                <th>गतिविधि (Action)</th>
                <th>वीडियो / रील शीर्षक (Video Title)</th>
                <th>कमेंट / नोट</th>
                <th>स्पॉन्सर मेंबर (Sponsor)</th>
                <th>तारीख व समय</th>
                <th>कार्रवाई (Action)</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.map((v, i) => {
                const rowNum = start + i + 1;
                const sMob = String(v.mobile || '').replace(/\D/g, '');
                const waMob = sMob.length === 10 ? '91' + sMob : sMob;
                const waMsg = encodeURIComponent(`नमस्ते ${v.name} जी! आपने आरोग्यम इंडिया पर "${v.videoTitle}" वीडियो देखा था...`);
                const vDate = v.viewedAt ? new Date(v.viewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

                let actionBadge = `<span class="admin-pill" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); font-size:0.75rem; font-weight:700;">👁️ देखा (View)</span>`;
                if (v.actionType === 'like') {
                  actionBadge = `<span class="admin-pill" style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); font-size:0.75rem; font-weight:700;">❤️ पसंद (Like)</span>`;
                } else if (v.actionType === 'share') {
                  actionBadge = `<span class="admin-pill" style="background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.3); font-size:0.75rem; font-weight:700;">📤 शेयर (Share)</span>`;
                } else if (v.actionType === 'comment') {
                  actionBadge = `<span class="admin-pill" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); font-size:0.75rem; font-weight:700;">💬 कमेंट (Comment)</span>`;
                }

                return `
                  <tr>
                    <td><strong>#${rowNum}</strong></td>
                    <td><strong style="color:#fff;">${v.name}</strong></td>
                    <td><a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:700;">📞 ${v.mobile}</a></td>
                    <td>${v.district || v.state || '-'}</td>
                    <td>${actionBadge}</td>
                    <td>
                      <div style="font-weight:700; color:#fff; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${v.videoTitle}">
                        🎬 ${v.videoTitle}
                      </div>
                    </td>
                    <td>
                      ${v.comment ? `<div style="font-size:0.8rem; color:#cbd5e1; font-style:italic; max-width:200px; overflow:hidden; text-overflow:ellipsis;" title="${v.comment}">💬 "${v.comment}"</div>` : '<span style="color:#64748b;">-</span>'}
                    </td>
                    <td>
                      <div style="font-weight:700; color:#cbd5e1;">${v.sponsorName}</div>
                      <code style="font-size:0.75rem; color:#60a5fa;">${v.sponsorId}</code>
                    </td>
                    <td><span style="font-size:0.8rem; color:#94a3b8;">${vDate}</span></td>
                    <td>
                      <div style="display:flex; gap:6px; align-items:center;">
                        <a href="tel:${sMob}" class="admin-button small-button" style="background:#0f172a; border:1px solid #475569; color:#cbd5e1; padding:3px 8px; font-size:0.75rem;" title="Call">📞 Call</a>
                        <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; padding:3px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;" title="WhatsApp">💬 WA</a>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="admin-pagination-bar" style="margin-top:12px;">
          <div class="admin-pagination-info">Page <strong>${currentAnalyticsPage}</strong> of <strong>${totalPages}</strong></div>
          <div class="admin-pagination-controls">
            <button type="button" id="analytics-report-prev" class="admin-button small-button" ${currentAnalyticsPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>◀ Previous</button>
            <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentAnalyticsPage} / ${totalPages}</span>
            <button type="button" id="analytics-report-next" class="admin-button small-button" ${currentAnalyticsPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Next ▶</button>
          </div>
        </div>
      `}
    `;

    // Bind Analytics Filter Dropdown Events
    document.getElementById('sel_analytics_video_title')?.addEventListener('change', (e) => {
      selectedAnalyticsVideoTitle = e.target.value;
      currentAnalyticsPage = 1;
      renderVideoAnalyticsTable();
    });

    document.getElementById('sel_analytics_action')?.addEventListener('change', (e) => {
      selectedAnalyticsAction = e.target.value;
      currentAnalyticsPage = 1;
      renderVideoAnalyticsTable();
    });

    document.getElementById('btn_reset_analytics_filters')?.addEventListener('click', () => {
      selectedAnalyticsVideoTitle = 'all';
      selectedAnalyticsAction = 'all';
      currentAnalyticsPage = 1;
      renderVideoAnalyticsTable();
    });

    document.querySelectorAll('.btn-filter-analytics-video').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedAnalyticsVideoTitle = btn.dataset.vtitle || 'all';
        currentAnalyticsPage = 1;
        renderVideoAnalyticsTable();
      });
    });

    document.getElementById('analytics-report-prev')?.addEventListener('click', () => {
      if (currentAnalyticsPage > 1) { currentAnalyticsPage--; renderVideoAnalyticsTable(); }
    });
    document.getElementById('analytics-report-next')?.addEventListener('click', () => {
      if (currentAnalyticsPage < totalPages) { currentAnalyticsPage++; renderVideoAnalyticsTable(); }
    });
  }

  // Handle Global Delegation
  document.addEventListener('click', (e) => {
    // Copy Link
    const copyBtn = e.target.closest('.btn-copy-link');
    if (copyBtn && copyBtn.dataset.url) {
      navigator.clipboard.writeText(copyBtn.dataset.url);
      copyBtn.textContent = '✓';
      setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
      return;
    }

    // View User Drawer
    const viewBtn = e.target.closest('.btn-view-user-drawer');
    if (viewBtn) {
      const uId = viewBtn.dataset.userId;
      const target = allUsersData.find(u => u.id === uId);
      if (target) openWebinarUserDrawer(target);
      return;
    }
  });

  function openWebinarUserDrawer(user) {
    let drawer = document.getElementById('adm-wb-reports-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'adm-wb-reports-drawer';
      drawer.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: 600px;
        background: #0f172a;
        border-left: 2px solid #3b82f6;
        box-shadow: -10px 0 35px rgba(0,0,0,0.85);
        z-index: 100000;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(drawer);
    }

    const sId = user.shareId || 'AI000004';
    const wbUrl = `https://aarogyamindia.online/webinar.html?ref=${encodeURIComponent(sId)}`;
    const attendees = user.attendees || [];

    drawer.innerHTML = `
      <div style="padding: 16px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 1.05rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
            <span>🎥</span> <span>${user.name} — वेबिनार रिपोर्ट</span>
          </div>
          <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 3px;">
            <code>${sId}</code> • 📞 ${user.mobile}
          </div>
        </div>
        <button type="button" id="close-wb-reports-drawer" style="background:transparent; border:none; color:#94a3b8; font-size:1.5rem; cursor:pointer; line-height:1;">✕</button>
      </div>

      <div style="flex:1; overflow-y:auto; padding:18px 20px; display:flex; flex-direction:column; gap:16px;">
        <!-- Link Box -->
        <div style="background: rgba(37,99,235,0.08); border: 1.5px dashed #3b82f6; border-radius: 12px; padding: 12px 14px;">
          <div style="font-size:0.75rem; font-weight:700; color:#93c5fd; margin-bottom:6px;">🌐 यूजर का पर्सनल वेबिनार आमंत्रण लिंक:</div>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" readonly value="${wbUrl}" id="drawer-wb-url-input" style="flex:1; background:#0b0f19; border:1px solid #1e293b; border-radius:6px; color:#60a5fa; padding:6px 10px; font-size:0.8rem; font-weight:700;" />
            <button type="button" id="btn-copy-drawer-link" class="admin-button small-button" style="background:#2563eb; color:#fff; font-weight:700; font-size:0.75rem; white-space:nowrap;">📋 कॉपी</button>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`🌾 *आरोग्यम इंडिया लाइव कृषि वेबिनार*\n\n👉 *मुफ्त रजिस्ट्रेशन व ज़ूम लिंक:*\n${wbUrl}`)}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; font-weight:700; font-size:0.75rem; white-space:nowrap; text-decoration:none;">💬 शेयर</a>
          </div>
        </div>

        <!-- 3 KPIs -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
          <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:12px; text-align:center;">
            <div style="font-size:0.72rem; color:#94a3b8;">कुल रजिस्ट्रेशन</div>
            <div style="font-size:1.4rem; font-weight:900; color:#60a5fa;">${user.webinarLeads}</div>
          </div>
          <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:12px; text-align:center;">
            <div style="font-size:0.72rem; color:#94a3b8;">ज़ूम अटेंडेंस</div>
            <div style="font-size:1.4rem; font-weight:900; color:#34d399;">${user.webinarJoined}</div>
          </div>
          <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:12px; text-align:center;">
            <div style="font-size:0.72rem; color:#94a3b8;">टर्नआउट दर</div>
            <div style="font-size:1.4rem; font-weight:900; color:#fbbf24;">${user.turnoutRate}%</div>
          </div>
        </div>

        <!-- Attendees Table -->
        <div>
          <div style="font-size:0.9rem; font-weight:800; color:#fff; margin-bottom:10px;">
            👥 रजिस्टर्ड किसानों की सूची (${attendees.length})
          </div>

          ${attendees.length === 0 ? `
            <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:24px; text-align:center; color:#94a3b8; font-size:0.85rem;">
              इस यूजर के रेफरल लिंक से अभी कोई वेबिनार रजिस्ट्रेशन नहीं हुआ है।
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${attendees.map((att, idx) => {
                const attMob = String(att.mobile || '').replace(/\D/g, '');
                const waMob = attMob.length === 10 ? '91' + attMob : attMob;
                const waMsg = encodeURIComponent(`नमस्ते ${att.name} जी! मैं आरोग्यम इंडिया से बात कर रहा हूँ। आपने हमारे लाइव वेबिनार में भाग लिया था...`);
                const regDate = att.registeredAt ? new Date(att.registeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

                return `
                  <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                      <div style="font-weight:800; font-size:0.88rem; color:#fff; display:flex; align-items:center; gap:6px;">
                        <span>#${idx + 1}</span>
                        <span>${att.name}</span>
                        ${att.isJoined 
                          ? `<span style="background:rgba(16,185,129,0.2); color:#34d399; font-size:0.65rem; font-weight:800; padding:1px 6px; border-radius:10px;">🟢 Live Joined</span>` 
                          : `<span style="background:rgba(148,163,184,0.15); color:#cbd5e1; font-size:0.65rem; font-weight:700; padding:1px 6px; border-radius:10px;">⏳ Registered</span>`
                        }
                      </div>
                      <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">
                        📍 ${att.district || att.state || '-'} • 📅 ${regDate}
                      </div>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                      <a href="tel:${attMob}" class="admin-button small-button" style="background:#0f172a; border:1px solid #475569; color:#94a3b8; font-size:0.75rem; padding:3px 8px; text-decoration:none;">📞 Call</a>
                      <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; border-color:#22c55e; font-size:0.75rem; padding:3px 8px; text-decoration:none;">💬 WhatsApp</a>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    requestAnimationFrame(() => { drawer.style.transform = 'translateX(0)'; });

    document.getElementById('close-wb-reports-drawer')?.addEventListener('click', () => {
      drawer.style.transform = 'translateX(100%)';
    });

    document.getElementById('btn-copy-drawer-link')?.addEventListener('click', function () {
      const input = document.getElementById('drawer-wb-url-input');
      if (input) {
        navigator.clipboard.writeText(input.value);
        this.textContent = '✓ Copied!';
        setTimeout(() => { this.textContent = '📋 कॉपी'; }, 2000);
      }
    });
  }

  // Filters Listeners
  if (searchInput) searchInput.addEventListener('input', () => {
    currentUsersPage = 1;
    currentAttendeesPage = 1;
    currentSharesPage = 1;
    currentViewersPage = 1;
    currentAnalyticsPage = 1;

    if (activeTab === 'user-reports') renderUserReportsTable();
    else if (activeTab === 'all-attendees') renderAllAttendeesTable();
    else if (activeTab === 'share-traffic') renderShareTrafficTable();
    else if (activeTab === 'video-viewers') renderVideoViewersTable();
    else if (activeTab === 'video-analytics') renderVideoAnalyticsTable();
  });

  if (statusSelect) statusSelect.addEventListener('change', () => {
    currentAttendeesPage = 1;
    renderAllAttendeesTable();
  });

  if (exportBtn) exportBtn.addEventListener('click', () => {
    if (activeTab === 'user-reports') {
      const users = getFilteredUsers();
      const headers = ["#", "Name", "Mobile", "Share ID", "Total Leads", "Live Joined", "Turnout %", "Status"];
      const rows = users.map((u, i) => [
        i + 1,
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${u.mobile || ''}"`,
        `"${u.shareId || ''}"`,
        u.webinarLeads,
        u.webinarJoined,
        `${u.turnoutRate}%`,
        u.status
      ].join(','));
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `user_webinar_performance_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'share-traffic') {
      const shares = getFilteredShares();
      const headers = ["#", "Name", "Mobile", "Share ID", "Shares", "Clicks", "Visits", "Leads", "Conversion %"];
      const rows = shares.map((u, i) => [
        i + 1,
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${u.mobile || ''}"`,
        `"${u.shareId || ''}"`,
        u.totalShares,
        u.totalClicks,
        u.totalVisitors,
        u.webinarLeads,
        u.totalClicks ? `${Math.round((u.webinarLeads / u.totalClicks) * 100)}%` : '0%'
      ].join(','));
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `webinar_shares_traffic_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'video-viewers' || activeTab === 'video-analytics') {
      const views = activeTab === 'video-analytics' ? getFilteredAnalyticsViews() : getFilteredVideoViews();
      const headers = ["#", "Viewer Name", "Mobile", "District", "State", "Action", "Video Title", "Comment", "Sponsor Name", "Sponsor ID", "Viewed Date"];
      const rows = views.map((v, i) => [
        i + 1,
        `"${(v.name || '').replace(/"/g, '""')}"`,
        `"${v.mobile || ''}"`,
        `"${v.district || ''}"`,
        `"${v.state || ''}"`,
        `"${v.actionType || 'view'}"`,
        `"${(v.videoTitle || '').replace(/"/g, '""')}"`,
        `"${(v.comment || '').replace(/"/g, '""')}"`,
        `"${(v.sponsorName || '').replace(/"/g, '""')}"`,
        `"${v.sponsorId || ''}"`,
        `"${v.viewedAt || ''}"`
      ].join(','));
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `aarogyamtube_video_activities_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const attendees = getFilteredAttendees();
      const headers = ["#", "Farmer Name", "Mobile", "District", "State", "Sponsor Name", "Sponsor ID", "Webinar", "Registered Date", "Status"];
      const rows = attendees.map((a, i) => [
        i + 1,
        `"${(a.name || '').replace(/"/g, '""')}"`,
        `"${a.mobile || ''}"`,
        `"${a.district || ''}"`,
        `"${a.state || ''}"`,
        `"${(a.sponsorName || '').replace(/"/g, '""')}"`,
        `"${a.sponsorId || ''}"`,
        `"${(a.webinarTitle || '').replace(/"/g, '""')}"`,
        `"${a.registeredAt || ''}"`,
        a.isJoined ? "Live Joined" : "Registered"
      ].join(','));
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `webinar_all_attendees_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });

  await loadWebinarReportData();
}
