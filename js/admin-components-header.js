/* Admin Header Component */

export function renderHeader(containerId = 'header-placeholder', title = 'Admin Panel', description = '') {
  const c = document.getElementById(containerId);
  if (!c) return;

  c.innerHTML = `
    <header class="admin-header">
      <div class="admin-header-row">
        <div class="admin-header-left">
          <button id="admin-hamburger" class="admin-button" aria-label="Toggle navigation">☰</button>
          <div>
            <p class="admin-breadcrumb">Home / ${title}</p>
            <h1>${title}</h1>
          </div>
        </div>
        <div class="admin-header-right">
          <input id="admin-global-search" type="search" class="admin-input" placeholder="Search across admin data" />
          <button id="admin-notify" class="admin-button" title="Notifications">🔔<span class="admin-badge">3</span></button>
          <button id="admin-refresh-button" class="admin-button" title="Refresh">⟳</button>
          <button id="admin-darkmode" class="admin-button" title="Dark mode (placeholder)">🌙</button>
          <div class="admin-profile">
            <button id="admin-profile-btn" class="admin-button">Admin ▾</button>
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
