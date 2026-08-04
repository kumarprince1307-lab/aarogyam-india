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
          
          <button id="admin-notify" class="admin-button icon-button" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="admin-badge">3</span>
          </button>

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

  const profileBtn = c.querySelector('#admin-profile-btn');
  const profileMenu = c.querySelector('#admin-profile-menu');
  profileBtn?.addEventListener('click', () => {
    const open = profileMenu.getAttribute('aria-hidden') === 'false';
    profileMenu.setAttribute('aria-hidden', String(!open));
    profileMenu.classList.toggle('open', !open);
  });

  // --- Theme Toggle Logic ---
  const themeCheckbox = c.querySelector('#theme-checkbox');
  
  // Set initial state of the checkbox
  if (localStorage.getItem('aarogyam-admin-theme') === 'light') {
    themeCheckbox.checked = false;
  } else {
    themeCheckbox.checked = true;
  }

  themeCheckbox?.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      // Switch to Dark Mode
      document.body.classList.remove('light-theme');
      localStorage.setItem('aarogyam-admin-theme', 'dark');
    } else {
      // Switch to Light Mode
      document.body.classList.add('light-theme');
      localStorage.setItem('aarogyam-admin-theme', 'light');
    }
  });

  // Close profile menu on outside click
  document.addEventListener('click', (e) => {
    if (!c.contains(e.target)) {
      profileMenu?.setAttribute('aria-hidden', 'true');
      profileMenu?.classList.remove('open');
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

// TODO: Add admin notifications dropdown and account menu in Phase-2
