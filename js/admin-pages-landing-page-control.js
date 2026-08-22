/* Admin Landing Page & Webinar URL Control Module */

import { initAdminLayout } from './admin-main.js';
import { supabase } from './supabase.js';

const PAGE_SIZE = 20;

export async function initLandingPageControl() {
  initAdminLayout('Landing Page & Webinar Control', 'Review, approve, activate, or block landing page and webinar URLs.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let currentPage = 1;
  let allPages = [];
  let allUsers = [];
  let allSurveys = [];

  content.innerHTML = `
    <!-- Top Header & Actions -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>🛡️ Landing Page & Webinar URL Control</span>
            <span style="font-size: 0.75rem; background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Anti-Abuse & Review Shield</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">
            Review inactive users' landing pages/webinars, approve valid campaigns, or block any URL instantly to prevent misuse.
          </p>
        </div>
        <button id="btn-refresh-control" class="admin-button small-button">🔄 Refresh Data</button>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 14px;">
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #3b82f6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">📄 कुल पेजेस (Total Created)</div>
          <div id="kpi-ctrl-total" style="font-size: 1.6rem; font-weight: 800; color: var(--admin-text); margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">⏳ समीक्षा लंबित (Pending Review)</div>
          <div id="kpi-ctrl-pending" style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #10b981;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🟢 सक्रिय / स्वीकृत (Active / Approved)</div>
          <div id="kpi-ctrl-active" style="font-size: 1.6rem; font-weight: 800; color: #10b981; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #ef4444;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🔴 ब्लॉक / निष्क्रिय (Blocked / Inactive)</div>
          <div id="kpi-ctrl-blocked" style="font-size: 1.6rem; font-weight: 800; color: #ef4444; margin-top: 4px;">0</div>
        </div>
      </div>

      <!-- Multi-Filter Controls Bar -->
      <div class="admin-card admin-controls" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; background: var(--admin-surface-2, #0f172a);">
        <input id="ctrl-search-box" type="search" placeholder="🔍 शीर्षक, क्रिएटर, ID या मोबाइल से खोजें..." class="admin-input" style="flex: 2; min-width: 200px;" />

        <select id="ctrl-status-filter" class="admin-select" style="flex: 1; min-width: 150px;">
          <option value="all">⚡ All Statuses (सभी स्थिति)</option>
          <option value="pending_review">⏳ Pending Review (समीक्षा लंबित)</option>
          <option value="active">🟢 Active / Approved (सक्रिय)</option>
          <option value="blocked">🔴 Blocked / Disabled (ब्लॉक)</option>
        </select>

        <select id="ctrl-type-filter" class="admin-select" style="flex: 1; min-width: 140px;">
          <option value="all">📂 All Types (सभी प्रकार)</option>
          <option value="landing_page">📄 Regular Landing Pages</option>
          <option value="webinar">🎥 Webinar Invitations</option>
        </select>

        <select id="ctrl-date-filter" class="admin-select" style="flex: 1; min-width: 130px;">
          <option value="all">📅 All Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>
    </div>

    <!-- Table Container -->
    <div id="ctrl-table-wrapper" style="margin-top: 10px;">
      <div class="admin-loading">डेटाबेस से लैंडिंग पेज डेटा लोड हो रहा है…</div>
    </div>

    <!-- Responses / Attendees Inspection Drawer -->
    <div id="ctrl-drawer-overlay" class="admin-drawer-overlay">
      <div class="admin-drawer" style="max-width: 620px;">
        <div class="admin-drawer-header">
          <div class="admin-drawer-title">
            <span id="ctrl-drawer-title">📋 प्राप्त सर्वे रिस्पॉन्स / Attendees</span>
          </div>
          <button type="button" id="ctrl-drawer-close" class="admin-drawer-close">&times;</button>
        </div>
        <div id="ctrl-drawer-body" class="admin-drawer-body"></div>
      </div>
    </div>
  `;

  const tableContainer = document.getElementById('ctrl-table-wrapper');
  const searchInput = document.getElementById('ctrl-search-box');
  const statusFilter = document.getElementById('ctrl-status-filter');
  const typeFilter = document.getElementById('ctrl-type-filter');
  const dateFilter = document.getElementById('ctrl-date-filter');
  const refreshBtn = document.getElementById('btn-refresh-control');

  const drawerOverlay = document.getElementById('ctrl-drawer-overlay');
  const drawerCloseBtn = document.getElementById('ctrl-drawer-close');
  const drawerTitle = document.getElementById('ctrl-drawer-title');
  const drawerBody = document.getElementById('ctrl-drawer-body');

  drawerCloseBtn?.addEventListener('click', () => drawerOverlay?.classList.remove('active'));
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('active');
  });

  async function loadControlData() {
    tableContainer.innerHTML = '<div class="admin-loading">Loading landing pages & webinars…</div>';

    try {
      // 1. Fetch Landing Pages
      const { data: lpData, error: lpErr } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch Users (Profiles) to check Active / Inactive status
      const { data: userData, error: uErr } = await supabase
        .from('profiles')
        .select('id, name, mobile, share_id, is_active, is_subscriber');

      // 3. Fetch Surveys / Leads for response counts
      const { data: surveyData, error: sErr } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (lpErr) console.warn('LP fetch error', lpErr);
      if (uErr) console.warn('User fetch error', uErr);
      if (sErr) console.warn('Survey fetch error', sErr);

      allPages = lpData || [];
      allUsers = userData || [];
      allSurveys = surveyData || [];

      // Calculate KPI Stats
      const total = allPages.length;
      const pending = allPages.filter(p => p.status === 'pending_review').length;
      const active = allPages.filter(p => !p.status || p.status === 'active' || p.status === 'approved').length;
      const blocked = allPages.filter(p => p.status === 'blocked' || p.status === 'disabled').length;

      document.getElementById('kpi-ctrl-total').textContent = total;
      document.getElementById('kpi-ctrl-pending').textContent = pending;
      document.getElementById('kpi-ctrl-active').textContent = active;
      document.getElementById('kpi-ctrl-blocked').textContent = blocked;

      currentPage = 1;
      renderTable();
    } catch (e) {
      console.error('Control data loading error', e);
      tableContainer.innerHTML = '<div class="admin-error"><strong>Unable to load landing pages.</strong></div>';
    }
  }

  function getFilteredPages() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const statusVal = statusFilter.value;
    const typeVal = typeFilter.value;
    const dateVal = dateFilter.value;
    const now = new Date();

    return allPages.filter(p => {
      const pStatus = p.status || 'active';

      // Status Filter
      if (statusVal !== 'all') {
        if (statusVal === 'active' && pStatus !== 'active' && pStatus !== 'approved') return false;
        if (statusVal === 'pending_review' && pStatus !== 'pending_review') return false;
        if (statusVal === 'blocked' && pStatus !== 'blocked' && pStatus !== 'disabled') return false;
      }

      // Type Filter
      if (typeVal !== 'all') {
        const isWb = p.category === 'webinar' || Boolean(p.webinar_data);
        if (typeVal === 'webinar' && !isWb) return false;
        if (typeVal === 'landing_page' && isWb) return false;
      }

      // Date Filter
      if (dateVal !== 'all' && p.created_at) {
        const pDate = new Date(p.created_at);
        if (dateVal === 'today') {
          if (pDate.toDateString() !== now.toDateString()) return false;
        } else if (dateVal === '7days') {
          if ((now - pDate) / (1000 * 60 * 60 * 24) > 7) return false;
        } else if (dateVal === '30days') {
          if ((now - pDate) / (1000 * 60 * 60 * 24) > 30) return false;
        }
      }

      // Search Query
      if (query) {
        const title = (p.title || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        const shareId = (p.share_id || '').toLowerCase();
        const user = allUsers.find(u => u.id === p.profile_id);
        const userName = (user?.name || '').toLowerCase();
        const userMobile = (user?.mobile || '').toLowerCase();

        if (!title.includes(query) && !id.includes(query) && !shareId.includes(query) && !userName.includes(query) && !userMobile.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  function renderTable() {
    const filtered = getFilteredPages();
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
                <th>Type & ID</th>
                <th>Title & Preview</th>
                <th>Creator & Status</th>
                <th>Responses</th>
                <th>Page Status</th>
                <th style="text-align: right;">Review & URL Control</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="7" style="text-align:center;padding:2.5rem;color:var(--admin-muted);">
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">🛡️</div>
                  <div style="font-size:1rem;font-weight:700;color:var(--admin-text);margin-bottom:4px;">कोई लैंडिंग पेज नहीं मिला (No Pages Found)</div>
                  <span style="font-size: 0.85rem; color: var(--admin-muted);">चयनित फ़िल्टर के अनुसार कोई लैंडिंग पेज या वेबिनार उपलब्ध नहीं है।</span>
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
        <span>दिखा रहे हैं <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${total}</strong> पेजेस</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Type & ID</th>
              <th>Title & Details</th>
              <th>Creator Info</th>
              <th>Responses</th>
              <th>Review Status</th>
              <th style="text-align: right;">1-Click Control Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((p, idx) => {
              const rowNum = startIndex + idx + 1;
              const isWb = p.category === 'webinar' || Boolean(p.webinar_data);
              const pStatus = p.status || 'active';
              const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('hi-IN') : '-';
              const publicUrl = `/ucas/landing.html?id=${p.id}&share_id=${p.share_id || ''}`;
              
              // Creator Details
              const creator = allUsers.find(u => u.id === p.profile_id);
              const isCreatorActive = creator ? (creator.is_active || creator.is_subscriber) : true;
              const creatorName = creator ? creator.name : 'Unknown User';
              const creatorShareId = p.share_id || creator?.share_id || '-';

              // Responses count
              const responses = allSurveys.filter(s => s.category_answers?.landing_page_id === p.id);
              const responsesCount = responses.length;

              // Type Badge
              const typeBadge = isWb
                ? '<span style="background:rgba(37,99,235,0.15);color:#3b82f6;font-size:0.72rem;padding:2px 6px;border-radius:4px;font-weight:700;"><i class="fa-solid fa-video"></i> Webinar</span>'
                : '<span style="background:rgba(16,185,129,0.15);color:#10b981;font-size:0.72rem;padding:2px 6px;border-radius:4px;font-weight:700;"><i class="fa-regular fa-file-lines"></i> Landing Page</span>';

              // Status Badge
              let statusBadge = '<span style="background:rgba(16,185,129,0.15);color:#10b981;font-size:0.75rem;padding:3px 8px;border-radius:4px;font-weight:700;">🟢 Active / Live</span>';
              if (pStatus === 'pending_review') {
                statusBadge = '<span style="background:rgba(245,158,11,0.15);color:#f59e0b;font-size:0.75rem;padding:3px 8px;border-radius:4px;font-weight:700;">⏳ Pending Review</span>';
              } else if (pStatus === 'blocked' || pStatus === 'disabled') {
                statusBadge = '<span style="background:rgba(239,68,68,0.15);color:#ef4444;font-size:0.75rem;padding:3px 8px;border-radius:4px;font-weight:700;">🔴 URL Blocked</span>';
              }

              // Creator Status Badge
              const creatorStatusBadge = isCreatorActive
                ? '<span style="color:#10b981;font-size:0.7rem;font-weight:700;">🟢 Active User</span>'
                : '<span style="color:#ef4444;font-size:0.7rem;font-weight:700;">🔴 Inactive User</span>';

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div>${typeBadge}</div>
                    <div style="font-size: 0.78rem; font-weight: 700; color: var(--admin-text); margin-top: 3px;">
                      <code>${p.id}</code>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.9rem;">${p.title || 'Untitled'}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">
                      Cat: <strong>${p.category || '-'}</strong> • <span>${dateStr}</span>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.85rem;">${creatorName}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-muted);">
                      ID: <code style="color:var(--admin-primary);">${creatorShareId}</code> • ${creatorStatusBadge}
                    </div>
                  </td>
                  <td>
                    <button type="button" class="btn-view-responses admin-button small-button" data-page-id="${p.id}" style="background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); font-weight: 800; font-size: 0.8rem; padding: 3px 8px; border-radius: 12px;">
                      👥 ${responsesCount} Leads
                    </button>
                  </td>
                  <td>
                    ${statusBadge}
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
                      ${pStatus === 'pending_review' ? `
                        <button type="button" class="btn-approve-page admin-button small-button" data-page-id="${p.id}" style="background:#10b981;color:#fff;font-weight:700;font-size:0.75rem;padding:4px 10px;">
                          ✓ Approve
                        </button>
                        <button type="button" class="btn-block-page admin-button small-button" data-page-id="${p.id}" style="background:#ef4444;color:#fff;font-weight:700;font-size:0.75rem;padding:4px 10px;">
                          ✕ Block
                        </button>
                      ` : pStatus === 'blocked' || pStatus === 'disabled' ? `
                        <button type="button" class="btn-approve-page admin-button small-button" data-page-id="${p.id}" style="background:#10b981;color:#fff;font-weight:700;font-size:0.75rem;padding:4px 10px;">
                          🟢 Unblock URL
                        </button>
                      ` : `
                        <button type="button" class="btn-block-page admin-button small-button" data-page-id="${p.id}" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);font-weight:700;font-size:0.75rem;padding:4px 10px;">
                          🔴 Block URL
                        </button>
                      `}
                      <a href="${publicUrl}" target="_blank" class="admin-button small-button icon-button" title="View Public URL" style="background: var(--admin-surface); color: var(--admin-text); border: 1px solid var(--admin-border);">
                        👁️
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
          Total Records: <strong style="color: var(--admin-text);">${total}</strong>
        </div>

        <div class="admin-pagination-controls">
          <button type="button" id="ctrl-prev-page" class="admin-button small-button" ${currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ◀ Previous
          </button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">Page ${currentPage} of ${totalPages} (20 Items/Page)</span>
          <button type="button" id="ctrl-next-page" class="admin-button small-button" ${currentPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            Next ▶
          </button>
        </div>
      </div>
    `;

    // Pagination Listeners
    document.getElementById('ctrl-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.getElementById('ctrl-next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });

    // Action Listeners
    tableContainer.querySelectorAll('.btn-approve-page').forEach(btn => {
      btn.addEventListener('click', () => updatePageStatus(btn.dataset.pageId, 'active'));
    });

    tableContainer.querySelectorAll('.btn-block-page').forEach(btn => {
      btn.addEventListener('click', () => updatePageStatus(btn.dataset.pageId, 'blocked'));
    });

    tableContainer.querySelectorAll('.btn-view-responses').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.dataset.pageId;
        const page = allPages.find(p => p.id === pageId);
        if (page) openResponsesDrawer(page);
      });
    });
  }

  async function updatePageStatus(pageId, newStatus) {
    const actionLabel = newStatus === 'active' ? 'स्वीकृत / सक्रिय (Approve)' : 'ब्लॉक / निष्क्रिय (Block)';
    if (!confirm(`क्या आप वाकई पेज "${pageId}" को ${actionLabel} करना चाहते हैं?`)) return;

    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({ status: newStatus })
        .eq('id', pageId);

      if (error) {
        alert('स्टेटस अपडेट करने में त्रुटि: ' + error.message);
        return;
      }

      alert(`✅ पेज ${pageId} सफलतापूर्वक ${actionLabel} हो गया!`);
      const target = allPages.find(p => p.id === pageId);
      if (target) target.status = newStatus;

      // Update KPI counters
      const pending = allPages.filter(p => p.status === 'pending_review').length;
      const active = allPages.filter(p => !p.status || p.status === 'active' || p.status === 'approved').length;
      const blocked = allPages.filter(p => p.status === 'blocked' || p.status === 'disabled').length;

      document.getElementById('kpi-ctrl-pending').textContent = pending;
      document.getElementById('kpi-ctrl-active').textContent = active;
      document.getElementById('kpi-ctrl-blocked').textContent = blocked;

      renderTable();
    } catch (e) {
      console.error('Update status error', e);
      alert('अपडेट करने में समस्या आई।');
    }
  }

  function openResponsesDrawer(page) {
    if (!drawerOverlay || !drawerTitle || !drawerBody) return;

    const responses = allSurveys.filter(s => s.category_answers?.landing_page_id === page.id);
    drawerTitle.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📋</span>
        <span>${page.title || page.id} — Leads (${responses.length})</span>
      </div>
    `;

    drawerBody.innerHTML = `
      <div style="background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
        <div style="font-weight: 700; color: var(--admin-text);">${page.title}</div>
        <div style="font-size: 0.8rem; color: var(--admin-muted); margin-top: 2px;">
          ID: <code>${page.id}</code> • Category: <strong>${page.category}</strong> • Status: <strong>${page.status || 'active'}</strong>
        </div>
      </div>

      ${responses.length === 0 ? `
        <div class="admin-empty">
          अभी तक इस पेज पर कोई सर्वे या लीड प्राप्त नहीं हुई है।
        </div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Lead / Attendee</th>
                <th>Mobile</th>
                <th>Place</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${responses.map((r, i) => {
                const sMob = String(r.mobile || '').replace(/\D/g, '');
                const regDate = r.created_at ? new Date(r.created_at).toLocaleString('hi-IN') : '-';
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td>
                      <div style="font-weight: 700; color: var(--admin-text);">${r.name}</div>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight: 600; font-size: 0.82rem;">📞 ${r.mobile || '-'}</a>
                        ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp Chat">💬</a>` : ''}
                      </div>
                    </td>
                    <td style="font-size: 0.8rem; color: var(--admin-text);">${r.village || '-'}</td>
                    <td style="font-size: 0.78rem; color: var(--admin-muted);">${regDate}</td>
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
  statusFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  typeFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  dateFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  refreshBtn?.addEventListener('click', loadControlData);

  await loadControlData();
}
