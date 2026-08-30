/* Admin Webinar Reports & User Leads Module (4-Tab Advanced Hub) */

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

  let activeTab = 'user-reports'; // 'user-reports' | 'all-attendees' | 'share-traffic' | 'video-viewers'
  let currentUsersPage = 1;
  let currentAttendeesPage = 1;
  let currentSharesPage = 1;
  let currentViewersPage = 1;

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
        <h4 style="color:#94a3b8; font-size:0.8rem; margin-bottom:4px;">📺 वीडियो व्यूज व अनलॉक्स</h4>
        <p style="margin:0;"><strong id="kpi_total_views" style="font-size:1.5rem; color:#fb7185;">0</strong> <span style="font-size:0.75rem; color:#94a3b8;">Reels / Videos</span></p>
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
      </div>

      <!-- Quick Action Buttons -->
      <div style="display:flex; gap:8px;">
        <a href="https://aarogyamindia.online/webinar.html" target="_blank" class="admin-button small-button" style="background:#0f172a; border:1px solid #3b82f6; color:#93c5fd; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
          <span>🌐</span> <span>लाइव वेबिनार पेज खोलें</span>
        </a>
        <a href="#all-webinars" data-route="all-webinars" class="admin-button small-button" style="background:linear-gradient(135deg,#047857,#10b981); color:#fff; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
          <span>🎥</span> <span>वेबिनार सेटिंग्स</span>
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

    <!-- Tab 4: Video Viewers & Unlocks -->
    <div id="container_video_viewers" style="display:none;">
      <div class="admin-loading">लोड हो रहा है...</div>
    </div>
  `;

  const btnTabUsers = document.getElementById('tab_btn_user_reports');
  const btnTabAttendees = document.getElementById('tab_btn_all_attendees');
  const btnTabShares = document.getElementById('tab_btn_share_traffic');
  const btnTabVideos = document.getElementById('tab_btn_video_viewers');

  const containerUsers = document.getElementById('container_user_reports');
  const containerAttendees = document.getElementById('container_all_attendees');
  const containerShares = document.getElementById('container_share_traffic');
  const containerVideos = document.getElementById('container_video_viewers');

  const statusFilterWrap = document.getElementById('wb_status_filter_wrap');
  const searchInput = document.getElementById('wb_report_search_input');
  const statusSelect = document.getElementById('wb_attendance_filter');
  const exportBtn = document.getElementById('wb_export_csv_btn');

  function setTabButtonState(activeBtn) {
    [btnTabUsers, btnTabAttendees, btnTabShares, btnTabVideos].forEach(btn => {
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
    }
  }

  btnTabUsers?.addEventListener('click', () => switchTab('user-reports'));
  btnTabAttendees?.addEventListener('click', () => switchTab('all-attendees'));
  btnTabShares?.addEventListener('click', () => switchTab('share-traffic'));
  btnTabVideos?.addEventListener('click', () => switchTab('video-viewers'));

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
        const isVideo = cAns.event_type === 'recorded_video_view' || cAns.event_type === 'video_unlock' || s.occupation === 'video_viewer' || s.selected_categories === 'webinar_video_view';
        const isWb = cAns.event_type === 'webinar_registration' || cAns.event_type === 'webinar_attendance' || s.occupation === 'attendee' || s.selected_categories === 'webinar_lead' || Boolean(cAns.webinar_id);

        if (isVideo) {
          const refId = s.profile_id || cAns.referrer_share_id || '';
          const sponsor = allProfiles.find(p => p.id === refId || p.share_id === refId || p.referral_code === refId || p.mobile === refId);
          allVideoViewsData.push({
            id: s.id,
            name: s.name || 'दर्शक साथी',
            mobile: s.mobile || 'N/A',
            state: s.state || '',
            district: s.district || '',
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
    if (!q) return allVideoViewsData;
    return allVideoViewsData.filter(v => 
      (v.name || '').toLowerCase().includes(q) ||
      (v.mobile || '').includes(q) ||
      (v.videoTitle || '').toLowerCase().includes(q) ||
      (v.sponsorName || '').toLowerCase().includes(q) ||
      (v.district || '').toLowerCase().includes(q)
    );
  }

  // TAB 1: User-Wise Reports Table
  function renderUserReportsTable() {
    const users = getFilteredUsers();
    if (!users || users.length === 0) {
      containerUsers.innerHTML = '<div class="admin-empty"><strong>कोई यूजर नहीं मिला।</strong><br>सर्च बदलकर प्रयास करें।</div>';
      return;
    }

    const total = users.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentUsersPage > totalPages) currentUsersPage = totalPages;
    if (currentUsersPage < 1) currentUsersPage = 1;

    const start = (currentUsersPage - 1) * PAGE_SIZE;
    const paginated = users.slice(start, start + PAGE_SIZE);

    containerUsers.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>Showing <strong>${start + 1}-${Math.min(start + PAGE_SIZE, total)}</strong> of <strong>${total}</strong> Users</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>यूजर का नाम (User)</th>
              <th>मोबाइल नंबर</th>
              <th>Share ID</th>
              <th>व्यक्तिगत वेबिनार लिंक (Personal Link)</th>
              <th style="color:#60a5fa;">कुल लीड्स (Leads)</th>
              <th style="color:#34d399;">ज़ूम अटेंडेंस (Live)</th>
              <th>टर्नआउट दर (%)</th>
              <th>कार्रवाई (Action)</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map((u, i) => {
              const rowNum = start + i + 1;
              const sMob = String(u.mobile || '').replace(/\D/g, '');
              const waMob = sMob.length === 10 ? '91' + sMob : sMob;
              const wbLink = `https://aarogyamindia.online/webinar.html?ref=${encodeURIComponent(u.shareId || 'AI000004')}`;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="font-weight:800; color:#fff;">${u.name}</div>
                    <div style="font-size:0.75rem; color:#94a3b8;">${u.status.toUpperCase()}</div>
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:700;">📞 ${u.mobile}</a>
                      <a href="https://wa.me/${waMob}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; padding:2px 6px; font-size:0.75rem;" title="WhatsApp">💬</a>
                    </div>
                  </td>
                  <td><code style="color:#60a5fa; font-weight:800;">${u.shareId}</code></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <input type="text" readonly value="${wbLink}" style="background:#0b0f19; border:1px solid #1e293b; border-radius:6px; color:#94a3b8; padding:3px 6px; font-size:0.75rem; width:160px;" />
                      <button type="button" class="admin-button small-button btn-copy-link" data-url="${wbLink}" style="padding:2px 6px; font-size:0.75rem;" title="Copy Link">📋</button>
                    </div>
                  </td>
                  <td><strong style="color:#60a5fa; font-size:1.05rem;">${u.webinarLeads}</strong></td>
                  <td><strong style="color:#34d399; font-size:1.05rem;">${u.webinarJoined}</strong></td>
                  <td>
                    <span style="font-weight:800; color:${u.turnoutRate >= 50 ? '#34d399' : u.turnoutRate > 0 ? '#fbbf24' : '#94a3b8'};">
                      ${u.turnoutRate}%
                    </span>
                  </td>
                  <td>
                    <button type="button" class="admin-button small-button btn-view-user-drawer" data-user-id="${u.id}" style="background:#2563eb; color:#fff; font-weight:700; display:inline-flex; align-items:center; gap:4px; font-size:0.75rem; padding:4px 10px;">
                      <span>👥 किसान सूची (${u.webinarLeads})</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="admin-pagination-bar" style="margin-top:12px;">
        <div class="admin-pagination-info">Page <strong>${currentUsersPage}</strong> of <strong>${totalPages}</strong></div>
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
    const attendees = getFilteredAttendees();
    if (!attendees || attendees.length === 0) {
      containerAttendees.innerHTML = '<div class="admin-empty"><strong>कोई किसान/अटेंडी नहीं मिला।</strong><br>सर्च या फिल्टर बदलकर प्रयास करें।</div>';
      return;
    }

    const total = attendees.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentAttendeesPage > totalPages) currentAttendeesPage = totalPages;
    if (currentAttendeesPage < 1) currentAttendeesPage = 1;

    const start = (currentAttendeesPage - 1) * PAGE_SIZE;
    const paginated = attendees.slice(start, start + PAGE_SIZE);

    containerAttendees.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>Showing <strong>${start + 1}-${Math.min(start + PAGE_SIZE, total)}</strong> of <strong>${total}</strong> Registered Attendees</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>किसान का नाम (Farmer)</th>
              <th>मोबाइल नंबर & संपर्क</th>
              <th>स्थान (District / State)</th>
              <th>स्पॉन्सर यूजर (Referrer)</th>
              <th>वेबिनार शीर्षक</th>
              <th>रजिस्ट्रेशन तारीख</th>
              <th>स्थिति (Attendance)</th>
              <th>कार्रवाई (Action)</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map((att, i) => {
              const rowNum = start + i + 1;
              const sMob = String(att.mobile || '').replace(/\D/g, '');
              const waMob = sMob.length === 10 ? '91' + sMob : sMob;
              const waMsg = encodeURIComponent(`नमस्ते ${att.name} जी! मैं आरोग्यम इंडिया से बात कर रहा हूँ। आपने हमारे लाइव वेबिनार में भाग लिया था...`);
              const regDate = att.registeredAt ? new Date(att.registeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td><div style="font-weight:800; color:#fff;">${att.name}</div></td>
                  <td><a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:700;">📞 ${att.mobile}</a></td>
                  <td>${att.district || att.state || '-'}</td>
                  <td>
                    <div style="font-weight:700; color:#cbd5e1;">${att.sponsorName}</div>
                    <code style="font-size:0.75rem; color:#60a5fa;">${att.sponsorId}</code>
                  </td>
                  <td><span style="font-size:0.8rem; color:#94a3b8;">${att.webinarTitle}</span></td>
                  <td><span style="font-size:0.8rem;">${regDate}</span></td>
                  <td>
                    ${att.isJoined 
                      ? `<span class="admin-pill active" style="font-weight:800; font-size:0.75rem; background:rgba(16,185,129,0.2); color:#34d399; border:1px solid rgba(16,185,129,0.4);">🟢 Live Joined</span>` 
                      : `<span class="admin-pill" style="font-weight:700; font-size:0.75rem; opacity:0.8;">⏳ Registered</span>`
                    }
                  </td>
                  <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                      <a href="tel:${sMob}" class="admin-button small-button" style="background:#0f172a; border:1px solid #475569; color:#cbd5e1; padding:3px 8px; font-size:0.75rem;" title="Call">📞 Call</a>
                      <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; padding:3px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;" title="WhatsApp">💬 WhatsApp</a>
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
        <div class="admin-pagination-info">Page <strong>${currentAttendeesPage}</strong> of <strong>${totalPages}</strong></div>
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
    const shares = getFilteredShares();
    if (!shares || shares.length === 0) {
      containerShares.innerHTML = '<div class="admin-empty"><strong>कोई शेयरिंग डेटा नहीं मिला।</strong></div>';
      return;
    }

    const total = shares.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentSharesPage > totalPages) currentSharesPage = totalPages;
    if (currentSharesPage < 1) currentSharesPage = 1;

    const start = (currentSharesPage - 1) * PAGE_SIZE;
    const paginated = shares.slice(start, start + PAGE_SIZE);

    containerShares.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>Showing <strong>${start + 1}-${Math.min(start + PAGE_SIZE, total)}</strong> Users by Sharing Performance</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>प्रमोटर यूजर (Promoter)</th>
              <th>मोबाइल नंबर</th>
              <th>Share ID</th>
              <th style="color:#22d3ee;">📤 कुल शेयर (Shares)</th>
              <th style="color:#60a5fa;">👆 लिंक क्लिक्स (Clicks)</th>
              <th style="color:#a78bfa;">👁️ पेज विजिट्स (Visits)</th>
              <th style="color:#34d399;">📝 जनरेटेड लीड्स (Leads)</th>
              <th>वायरल कन्वर्जन दर (%)</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map((u, i) => {
              const rowNum = start + i + 1;
              const conv = u.totalClicks ? Math.round((u.webinarLeads / u.totalClicks) * 100) : 0;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td><strong>${u.name}</strong></td>
                  <td>${u.mobile}</td>
                  <td><code style="color:#60a5fa; font-weight:800;">${u.shareId}</code></td>
                  <td><strong style="color:#22d3ee; font-size:1.1rem;">${u.totalShares}</strong></td>
                  <td><strong style="color:#60a5fa; font-size:1.1rem;">${u.totalClicks}</strong></td>
                  <td><strong style="color:#a78bfa; font-size:1.1rem;">${u.totalVisitors}</strong></td>
                  <td><strong style="color:#34d399; font-size:1.1rem;">${u.webinarLeads}</strong></td>
                  <td>
                    <span style="font-weight:800; color:${conv > 20 ? '#34d399' : '#fbbf24'};">
                      ${conv}%
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="admin-pagination-bar" style="margin-top:12px;">
        <div class="admin-pagination-info">Page <strong>${currentSharesPage}</strong> of <strong>${totalPages}</strong></div>
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

  // TAB 4: Video Viewers Table
  function renderVideoViewersTable() {
    const views = getFilteredVideoViews();
    if (!views || views.length === 0) {
      containerVideos.innerHTML = '<div class="admin-empty"><strong>कोई रिकॉर्डेड वीडियो दर्शक डेटा नहीं मिला।</strong><br>जैसे ही किसान रिकॉर्डेड ट्रेनिंग अनलॉक करेंगे, डेटा यहाँ दिखेगा।</div>';
      return;
    }

    const total = views.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentViewersPage > totalPages) currentViewersPage = totalPages;
    if (currentViewersPage < 1) currentViewersPage = 1;

    const start = (currentViewersPage - 1) * PAGE_SIZE;
    const paginated = views.slice(start, start + PAGE_SIZE);

    containerVideos.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>Showing <strong>${start + 1}-${Math.min(start + PAGE_SIZE, total)}</strong> of <strong>${total}</strong> Video Viewers</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>दर्शक का नाम (Viewer)</th>
              <th>मोबाइल नंबर & संपर्क</th>
              <th>स्थान (District / State)</th>
              <th>देखा गया वीडियो / रील (Video Title)</th>
              <th>स्पॉन्सर मेंबर (Sponsor)</th>
              <th>देखे जाने की तारीख</th>
              <th>कार्रवाई</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map((v, i) => {
              const rowNum = start + i + 1;
              const sMob = String(v.mobile || '').replace(/\D/g, '');
              const waMob = sMob.length === 10 ? '91' + sMob : sMob;
              const waMsg = encodeURIComponent(`नमस्ते ${v.name} जी! आपने आरोग्यम इंडिया की रिकॉर्डेड वीडियो ट्रेनिंग देखी थी...`);
              const vDate = v.viewedAt ? new Date(v.viewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td><strong>${v.name}</strong></td>
                  <td><a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:700;">📞 ${v.mobile}</a></td>
                  <td>${v.district || v.state || '-'}</td>
                  <td>
                    <div style="font-weight:700; color:#fff; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      🎬 ${v.videoTitle}
                    </div>
                  </td>
                  <td>
                    <div>${v.sponsorName}</div>
                    <code style="font-size:0.75rem; color:#60a5fa;">${v.sponsorId}</code>
                  </td>
                  <td><span style="font-size:0.8rem;">${vDate}</span></td>
                  <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                      <a href="tel:${sMob}" class="admin-button small-button" style="background:#0f172a; border:1px solid #475569; color:#cbd5e1; padding:3px 8px; font-size:0.75rem;">📞 Call</a>
                      <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; padding:3px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;">💬 WhatsApp</a>
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
        <div class="admin-pagination-info">Page <strong>${currentViewersPage}</strong> of <strong>${totalPages}</strong></div>
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

    if (activeTab === 'user-reports') renderUserReportsTable();
    else if (activeTab === 'all-attendees') renderAllAttendeesTable();
    else if (activeTab === 'share-traffic') renderShareTrafficTable();
    else if (activeTab === 'video-viewers') renderVideoViewersTable();
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
    } else if (activeTab === 'video-viewers') {
      const views = getFilteredVideoViews();
      const headers = ["#", "Viewer Name", "Mobile", "District", "State", "Video Title", "Sponsor Name", "Sponsor ID", "Viewed Date"];
      const rows = views.map((v, i) => [
        i + 1,
        `"${(v.name || '').replace(/"/g, '""')}"`,
        `"${v.mobile || ''}"`,
        `"${v.district || ''}"`,
        `"${v.state || ''}"`,
        `"${(v.videoTitle || '').replace(/"/g, '""')}"`,
        `"${(v.sponsorName || '').replace(/"/g, '""')}"`,
        `"${v.sponsorId || ''}"`,
        `"${v.viewedAt || ''}"`
      ].join(','));
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `webinar_video_viewers_${new Date().toISOString().split('T')[0]}.csv`;
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
