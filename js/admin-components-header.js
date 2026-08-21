/* Admin Header Component */

import { fetchAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './admin-api.js';

export function renderHeader(containerId = 'header-placeholder', title = 'Admin Panel', description = '') {
  const c = document.getElementById(containerId);
  if (!c) return;

  c.innerHTML = `
    <header class="admin-header">
      <div class="admin-header-row">
        <div class="admin-header-left">
          <button id="admin-hamburger" onclick="window.toggleAdminSidebar && window.toggleAdminSidebar(event)" class="admin-button icon-button" aria-label="Toggle navigation" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="pointer-events:none;"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="admin-header-title">
            <p class="admin-breadcrumb">Dashboard</p>
            <div class="admin-title-compact">${title}</div>
          </div>
        </div>

        <div class="admin-header-center admin-header-section">
          <div class="search-wrapper">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <input id="admin-global-search" type="search" class="admin-input" placeholder="Search..." />
          </div>
        </div>

        <div class="admin-header-right admin-header-section">
          <button id="admin-mobile-search-btn" class="admin-button icon-button" title="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        
          <button id="admin-refresh-button" class="admin-button icon-button" title="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 0-3.2 6.4L21 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          
          <!-- Universal Admin Notification Bell -->
          <div class="admin-notif-wrapper" style="position: relative;">
            <button id="admin-notif-bell-btn" class="admin-button icon-button" title="Notifications" aria-label="Notifications" style="position: relative;">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span id="admin-notif-badge" class="notif-badge" style="display: none;">0</span>
            </button>
            
            <div id="admin-notif-dropdown" class="notif-dropdown" aria-hidden="true">
              <div class="notif-dropdown-header">
                <div class="notif-dropdown-title">
                  <strong>Notifications</strong>
                  <span id="notif-unread-pill" class="notif-unread-pill">0 New</span>
                </div>
                <button type="button" id="notif-mark-all-read-btn" class="notif-mark-all-btn">Mark all as read</button>
              </div>
              <div id="notif-dropdown-list" class="notif-dropdown-list">
                <div class="notif-loading">Loading notifications...</div>
              </div>
              <div class="notif-dropdown-footer">
                <a href="#notifications" data-route="notifications" id="notif-view-all-link">View All Notifications →</a>
              </div>
            </div>
          </div>

          <div class="theme-switch-wrapper">
            <label class="theme-switch" for="theme-checkbox" title="Toggle theme">
              <input type="checkbox" id="theme-checkbox" />
              <div class="slider"></div>
            </label>
          </div>

          <div class="admin-profile">
            <button id="admin-profile-btn" class="admin-button profile-button"> <span class="avatar" aria-hidden="true"></span> <span class="profile-name">Admin ▾</span></button>
            <div id="admin-profile-menu" class="admin-profile-menu" aria-hidden="true">
              <a href="#">Profile</a>
              <a href="#" data-route="settings">Settings</a>
              <a href="#" id="admin-logout-btn">Logout</a>
            </div>
          </div>
        </div>

        <div class="mobile-search-view admin-header-section">
            <button id="admin-search-back-btn" class="admin-button icon-button" title="Go back">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="search-wrapper">
              <input id="admin-mobile-search-input" type="search" class="admin-input" placeholder="Search users, books, orders..." />
            </div>
        </div>
      </div>
    </header>
  `;

  // --- Event Listeners ---

  // Logout Button
  const logoutBtn = c.querySelector('#admin-logout-btn');
  logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('admin_session');
    window.location.href = 'login.html';
  });

  // Search Input
  const searchInput = c.querySelector('#admin-global-search');
  searchInput?.addEventListener('input', event => {
    const query = event.target.value;
    document.dispatchEvent(new CustomEvent('admin:global-search', { detail: { query } }));
  });
  
  const refreshButton = c.querySelector('#admin-refresh-button');
  refreshButton?.addEventListener('click', () => window.location.reload());

  // Profile Dropdown
  const profileBtn = c.querySelector('#admin-profile-btn');
  const profileMenu = c.querySelector('#admin-profile-menu');
  profileBtn?.addEventListener('click', () => {
    const open = profileMenu.getAttribute('aria-hidden') === 'false';
    profileMenu.setAttribute('aria-hidden', String(!open));
    profileMenu.classList.toggle('open', !open);
    // Close notif dropdown if open
    if (notifDropdown) {
      notifDropdown.setAttribute('aria-hidden', 'true');
      notifDropdown.classList.remove('open');
    }
  });

  // --- Notification Bell & Dropdown Logic ---
  const notifBellBtn = c.querySelector('#admin-notif-bell-btn');
  const notifBadge = c.querySelector('#admin-notif-badge');
  const notifDropdown = c.querySelector('#admin-notif-dropdown');
  const notifList = c.querySelector('#notif-dropdown-list');
  const notifUnreadPill = c.querySelector('#notif-unread-pill');
  const markAllReadBtn = c.querySelector('#notif-mark-all-read-btn');

  async function updateHeaderNotifications() {
    try {
      const res = await fetchAdminNotifications();
      if (!res.success) return;

      const unreadCount = res.unreadCount || 0;
      if (notifBadge) {
        if (unreadCount > 0) {
          notifBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          notifBadge.style.display = 'flex';
        } else {
          notifBadge.style.display = 'none';
        }
      }

      if (notifUnreadPill) {
        notifUnreadPill.textContent = `${unreadCount} New`;
      }

      if (notifList) {
        const recent = (res.data || []).slice(0, 8);
        if (recent.length === 0) {
          notifList.innerHTML = '<div class="notif-empty">No notifications yet</div>';
        } else {
          notifList.innerHTML = recent.map(n => `
            <div class="notif-item ${n.isRead ? '' : 'unread'}" data-notif-id="${n.id}">
              <div class="notif-item-icon">${n.icon}</div>
              <div class="notif-item-content">
                <div class="notif-item-header">
                  <span class="notif-item-title">${n.title}</span>
                  <span class="notif-item-time">${n.relativeTime}</span>
                </div>
                <div class="notif-item-msg">${n.message}</div>
                <div class="notif-item-meta">
                  ${n.amountFormatted ? `<span class="notif-pill notif-amount">${n.amountFormatted}</span>` : ''}
                  ${n.status ? `<span class="notif-pill notif-status ${n.status.toLowerCase()}">${n.status}</span>` : ''}
                  <span class="notif-item-exact-time">${n.dateFormatted} • ${n.timeFormatted}</span>
                </div>
                <div class="notif-item-actions">
                  ${n.primaryAction ? `<a href="#${n.primaryAction.route}" data-route="${n.primaryAction.route.split('?')[0]}" data-id="${n.primaryAction.id || ''}" class="notif-action-link primary-action">${n.primaryAction.label}</a>` : ''}
                  ${n.secondaryAction ? `<a href="#${n.secondaryAction.route}" data-route="${n.secondaryAction.route.split('?')[0]}" class="notif-action-link secondary-action">${n.secondaryAction.label}</a>` : ''}
                </div>
              </div>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.warn('Error loading header notifications:', err);
    }
  }

  notifBellBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = notifDropdown.getAttribute('aria-hidden') === 'false';
    notifDropdown.setAttribute('aria-hidden', String(!open));
    notifDropdown.classList.toggle('open', !open);
    // Close profile menu if open
    if (profileMenu) {
      profileMenu.setAttribute('aria-hidden', 'true');
      profileMenu.classList.remove('open');
    }
    if (!open) {
      updateHeaderNotifications();
    }
  });

  markAllReadBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    markAllNotificationsAsRead();
  });

  // Handle clicking items in the dropdown
  notifList?.addEventListener('click', (e) => {
    const item = e.target.closest('.notif-item');
    if (item && item.dataset.notifId) {
      markNotificationAsRead(item.dataset.notifId);
      item.classList.remove('unread');
    }
    const link = e.target.closest('a[data-route]');
    if (link) {
      notifDropdown?.setAttribute('aria-hidden', 'true');
      notifDropdown?.classList.remove('open');
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!c.contains(e.target)) {
      notifDropdown?.setAttribute('aria-hidden', 'true');
      notifDropdown?.classList.remove('open');
      profileMenu?.setAttribute('aria-hidden', 'true');
      profileMenu?.classList.remove('open');
    }
  });

  // Listen to global updates
  document.addEventListener('admin:notifications-updated', () => {
    updateHeaderNotifications();
  });

  // Initial load of notifications
  updateHeaderNotifications();

  // --- Theme Toggle Logic ---
  const themeCheckbox = c.querySelector('#theme-checkbox');
  
  if (localStorage.getItem('aarogyam-admin-theme') === 'light') {
    themeCheckbox.checked = false;
  } else {
    themeCheckbox.checked = true;
  }

  themeCheckbox?.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('aarogyam-admin-theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('aarogyam-admin-theme', 'light');
    }
  });

  // --- Mobile Search Logic ---
  const mobileSearchBtn = c.querySelector('#admin-mobile-search-btn');
  const mobileSearchBackBtn = c.querySelector('#admin-search-back-btn');
  const adminHeader = c.querySelector('.admin-header');
  const mobileSearchInput = c.querySelector('#admin-mobile-search-input');
  const adminHeaderLeft = c.querySelector('.admin-header-left');
  const adminHeaderRight = c.querySelector('.admin-header-right');

  mobileSearchBtn?.addEventListener('click', () => {
    adminHeader?.classList.add('mobile-search-active');
    adminHeaderLeft?.classList.add('hidden');
    adminHeaderRight?.classList.add('hidden');
    mobileSearchInput?.focus();
  });

  mobileSearchBackBtn?.addEventListener('click', () => {
    adminHeader?.classList.remove('mobile-search-active');
    adminHeaderLeft?.classList.remove('hidden');
    adminHeaderRight?.classList.remove('hidden');
  });
  
  mobileSearchInput?.addEventListener('input', event => {
    const query = event.target.value;
    document.dispatchEvent(new CustomEvent('admin:global-search', { detail: { query } }));
  });
}

