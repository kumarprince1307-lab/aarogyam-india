/* Admin Notifications Page (Universal Notification Hub) */

import { initAdminLayout } from './admin-main.js';
import { fetchAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './admin-api.js';

export async function initNotifications() {
  initAdminLayout('Notifications', 'Universal stream of real-time store & customer activities.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let currentFilter = 'all';
  let cachedNotifications = [];

  content.innerHTML = `
    <div class="admin-section notif-page-wrapper">
      <div class="notif-page-header">
        <div>
          <h2 class="admin-section-title" style="margin-bottom: 4px;">Universal Notification Center</h2>
          <p class="admin-muted" style="font-size: 0.9rem; margin: 0;">Real-time feed of purchases, registrations, and checkout activity.</p>
        </div>
        <div class="notif-header-actions">
          <button id="page-refresh-notifs-btn" class="admin-button icon-button" title="Refresh Feed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 0-3.2 6.4L21 21"></path>
            </svg>
            <span class="btn-text" style="margin-left: 6px;">Refresh</span>
          </button>
          <button id="page-mark-all-read-btn" class="admin-button" style="background: var(--admin-surface-strong); border: 1px solid var(--admin-border); color: var(--admin-text);">
            ✓ Mark All as Read
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="notif-filter-bar">
        <button class="notif-filter-tab active" data-filter="all">All <span class="tab-badge" id="badge-all">0</span></button>
        <button class="notif-filter-tab" data-filter="marketing">🛡️ Pages & Webinars <span class="tab-badge" id="badge-marketing">0</span></button>
        <button class="notif-filter-tab" data-filter="purchases">Purchases <span class="tab-badge" id="badge-purchases">0</span></button>
        <button class="notif-filter-tab" data-filter="checkout">Checkout <span class="tab-badge" id="badge-checkout">0</span></button>
        <button class="notif-filter-tab" data-filter="joining">Registrations <span class="tab-badge" id="badge-joining">0</span></button>
        <button class="notif-filter-tab" data-filter="leads">Leads <span class="tab-badge" id="badge-leads">0</span></button>
      </div>

      <!-- Feed List Container -->
      <div id="notif-page-feed" class="notif-feed-container">
        <div class="admin-loading">Loading notifications…</div>
      </div>
    </div>
  `;

  const feedContainer = document.getElementById('notif-page-feed');
  const refreshBtn = document.getElementById('page-refresh-notifs-btn');
  const markAllBtn = document.getElementById('page-mark-all-read-btn');
  const filterTabs = content.querySelectorAll('.notif-filter-tab');

  async function loadFeed() {
    if (!feedContainer) return;
    feedContainer.innerHTML = '<div class="admin-loading">Loading notifications…</div>';

    try {
      const res = await fetchAdminNotifications();
      if (!res.success) {
        feedContainer.innerHTML = `
          <div class="admin-error">
            <strong>Notifications load नहीं हो सकीं</strong>
            <p>${res.error || 'कृपया पुनः प्रयास करें।'}</p>
            <button id="btn-retry-notifs" class="admin-button small-button" style="margin-top: 10px;">Retry</button>
          </div>
        `;
        feedContainer.querySelector('#btn-retry-notifs')?.addEventListener('click', loadFeed);
        return;
      }

      cachedNotifications = res.data || [];
      updateFilterBadges(cachedNotifications);
      renderCards();
    } catch (err) {
      feedContainer.innerHTML = `
        <div class="admin-error">
          <strong>Notifications load नहीं हो सकीं</strong>
          <p>${err.message || 'त्रुटि उत्पन्न हुई।'}</p>
        </div>
      `;
    }
  }

  function updateFilterBadges(list) {
    const counts = {
      all: list.length,
      marketing: list.filter(n => n.category === 'marketing' || n.type?.includes('landing_page') || n.type?.includes('webinar')).length,
      purchases: list.filter(n => n.category === 'purchases').length,
      checkout: list.filter(n => n.category === 'checkout').length,
      joining: list.filter(n => n.category === 'joining').length,
      leads: list.filter(n => n.category === 'leads').length
    };

    ['all', 'marketing', 'purchases', 'checkout', 'joining', 'leads'].forEach(cat => {
      const el = document.getElementById(`badge-${cat}`);
      if (el) el.textContent = counts[cat] || 0;
    });
  }

  function renderCards() {
    if (!feedContainer) return;

    let filtered = cachedNotifications;
    if (currentFilter !== 'all') {
      filtered = cachedNotifications.filter(n => n.category === currentFilter);
    }

    if (filtered.length === 0) {
      feedContainer.innerHTML = `
        <div class="admin-card notif-empty-state">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔔</div>
          <strong style="font-size: 1.1rem; color: var(--admin-text);">कोई नई notification नहीं है</strong>
          <p class="admin-muted" style="margin-top: 6px; font-size: 0.9rem;">
            ${currentFilter === 'all' ? 'जब कोई नया Purchase, User Joining या Checkout एक्टिविटी होगी, तो वह यहाँ दिखेगी।' : 'इस श्रेणी में अभी कोई नोटिफिकेशन नहीं है।'}
          </p>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = `
      <div class="notif-cards-grid">
        ${filtered.map(n => `
          <div class="notif-card ${n.isRead ? 'read' : 'unread'}" data-notif-id="${n.id}">
            <div class="notif-card-header">
              <div class="notif-card-title-group">
                <span class="notif-card-icon">${n.icon}</span>
                <div>
                  <h4 class="notif-card-title">${n.title}</h4>
                  <p class="notif-card-desc">${n.message}</p>
                </div>
              </div>
              <div class="notif-card-time-group">
                <span class="notif-relative-chip">${n.relativeTime}</span>
                <span class="notif-exact-chip">${n.dateFormatted} • ${n.timeFormatted}</span>
              </div>
            </div>

            <div class="notif-card-meta-grid">
              <div class="notif-meta-cell">
                <span class="notif-meta-label">User</span>
                <span class="notif-meta-val">${n.userName} ${n.userMobile ? `(${n.userMobile})` : ''}</span>
              </div>
              ${n.bookName ? `
                <div class="notif-meta-cell">
                  <span class="notif-meta-label">Book</span>
                  <span class="notif-meta-val">${n.bookName}</span>
                </div>
              ` : ''}
              ${n.amountFormatted ? `
                <div class="notif-meta-cell">
                  <span class="notif-meta-label">Amount</span>
                  <span class="notif-meta-val" style="color: var(--admin-primary); font-weight: bold;">${n.amountFormatted}</span>
                </div>
              ` : ''}
              ${n.status ? `
                <div class="notif-meta-cell">
                  <span class="notif-meta-label">Status</span>
                  <span class="status-pill ${n.status.toLowerCase()}">${n.status}</span>
                </div>
              ` : ''}
              ${n.source ? `
                <div class="notif-meta-cell">
                  <span class="notif-meta-label">Source</span>
                  <span class="notif-meta-val">${n.source}</span>
                </div>
              ` : ''}
            </div>

            <div class="notif-card-footer">
              <div class="notif-status-badge">
                ${n.isRead ? '<span class="read-indicator">✓ Read</span>' : '<span class="unread-indicator">● New</span>'}
              </div>
              <div class="notif-card-actions">
                ${n.primaryAction ? `
                  <a href="#${n.primaryAction.route}" data-route="${n.primaryAction.route.split('?')[0]}" data-id="${n.primaryAction.id || ''}" class="admin-button small-button notif-btn-primary">
                    ${n.primaryAction.label}
                  </a>
                ` : ''}
                ${n.secondaryAction ? `
                  <a href="#${n.secondaryAction.route}" data-route="${n.secondaryAction.route.split('?')[0]}" class="admin-button small-button notif-btn-secondary">
                    ${n.secondaryAction.label}
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Handle Tab clicks
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter || 'all';
      renderCards();
    });
  });

  // Handle Card Clicks and Action Navigation
  feedContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.notif-card');
    if (card && card.dataset.notifId) {
      markNotificationAsRead(card.dataset.notifId);
      card.classList.remove('unread');
      card.classList.add('read');
      const ind = card.querySelector('.unread-indicator');
      if (ind) {
        ind.className = 'read-indicator';
        ind.textContent = '✓ Read';
      }
    }
  });

  refreshBtn?.addEventListener('click', () => loadFeed());

  markAllBtn?.addEventListener('click', () => {
    markAllNotificationsAsRead();
    cachedNotifications.forEach(n => { n.isRead = true; });
    renderCards();
  });

  // Global update sync
  const updateListener = () => {
    fetchAdminNotifications().then(res => {
      if (res.success) {
        cachedNotifications = res.data || [];
        updateFilterBadges(cachedNotifications);
        renderCards();
      }
    });
  };
  document.addEventListener('admin:notifications-updated', updateListener);

  await loadFeed();
}