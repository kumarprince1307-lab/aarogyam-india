/* Admin Header Component */

export function renderHeader(containerId = 'header-placeholder', title = 'Admin Panel', description = '') {
  const c = document.getElementById(containerId);
  if (!c) return;

  c.innerHTML = `
    <header class="admin-header">
      <div class="admin-header-row">
        <div class="admin-header-left">
          <button id="admin-hamburger" class="admin-button icon-button" aria-label="Toggle navigation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="admin-header-title">
            <p class="admin-breadcrumb">Dashboard</p>
            <div class="admin-title-compact">${title}</div>
          </div>
        </div>

        <div class="admin-header-center">
          <div class="search-wrapper">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <input id="admin-global-search" type="search" class="admin-input" placeholder="Search users, books, orders..." />
          </div>
        </div>

        <div class="admin-header-right">
          <button id="admin-refresh-button" class="admin-button icon-button" title="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 0-3.2 6.4L21 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>

          <button id="admin-notify" class="admin-button icon-button" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="admin-badge">3</span>
          </button>

          <button id="admin-darkmode" class="admin-button icon-button" title="Dark mode (placeholder)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>

          <div class="admin-profile">
            <button id="admin-profile-btn" class="admin-button profile-button"> <span class="avatar" aria-hidden="true"></span> Admin ▾</button>
            <div id="admin-profile-menu" class="admin-profile-menu" aria-hidden="true">
              <a href="#">Profile</a>
              <a href="#" data-route="settings">Settings</a>
              <a href="#">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  // Events
  const hamburger = c.querySelector('#admin-hamburger');
  hamburger?.addEventListener('click', () => document.body.classList.toggle('admin-sidebar-collapsed'));

  const searchInput = c.querySelector('#admin-global-search');
  searchInput?.addEventListener('input', event => {
    const query = event.target.value;
    document.dispatchEvent(new CustomEvent('admin:global-search', { detail: { query } }));
  });

  const refreshButton = c.querySelector('#admin-refresh-button');
  refreshButton?.addEventListener('click', () => window.location.reload());

  const profileBtn = c.querySelector('#admin-profile-btn');
  const profileMenu = c.querySelector('#admin-profile-menu');
  profileBtn?.addEventListener('click', () => {
    const open = profileMenu.getAttribute('aria-hidden') === 'false';
    profileMenu.setAttribute('aria-hidden', String(!open));
    profileMenu.classList.toggle('open', !open);
  });

  // Close profile menu on outside click
  document.addEventListener('click', (e) => {
    if (!c.contains(e.target)) {
      profileMenu?.setAttribute('aria-hidden', 'true');
      profileMenu?.classList.remove('open');
    }
  });
}

// TODO: Add admin notifications dropdown and account menu in Phase-2
