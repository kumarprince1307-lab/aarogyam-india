/* Admin Sidebar Component */

const MENU = [
  { label: 'Dashboard', href: 'dashboard.html', icon: '🏠' },
  { label: 'Users', icon: '👥', children: [ 
    { label: 'All Users', href: 'users.html' }, 
    { label: 'User Details', href: 'user-details.html' },
    { label: 'All User Permissions', href: 'user-permissions.html' },
    { label: 'All Phonebook', href: 'all-phonebook.html' },
    { label: 'All Survey List', href: 'all-surveys.html' }
  ] },
  { label: 'Books', icon: '📚', children: [ { label: 'Categories', href: '#' }, { label: 'Books', href: '#' }, { label: 'Demo Books', href: '#' } ] },
  { label: 'Products', icon: '🛍️', children: [ { label: 'Product Landing Pages', href: 'product-landing-pages.html' }, { label: 'Categories', href: '#' }, { label: 'Products', href: '#' } ] },
  { label: 'Diseases', href: '#', icon: '🧾' },
  { label: 'Orders', icon: '🧾', children: [ { label: 'Purchases', href: 'purchases.html' }, { label: 'Checkout Funnel', href: 'checkout-funnel.html' }, { label: 'Downloads', href: 'downloads.html' } ] },
  { label: 'Reports', icon: '📈', children: [ { label: 'Daily', href: 'reports.html#daily-report' }, { label: 'Monthly', href: '#' }, { label: 'Sales', href: '#' }, { label: 'Referral', href: 'reports.html#share-report' }, { label: 'Source', href: 'reports.html#lead-report' } ] },
  { label: 'Marketing', icon: '📣', children: [ { label: 'UCAS Landing Pages', href: 'all-landing-pages.html' }, { label: 'Hook Templates & Shayari', href: 'marketing-templates.html' }, { label: 'Share Links', href: '#' }, { label: 'Campaigns', href: '#' } ] },
  { label: 'Webinars', href: 'all-webinars.html', icon: '🎥' },
  { label: 'Wallet', href: '#', icon: '💰' },
  { label: 'Notifications', icon: '🔔', children: [ { label: 'All Notifications', href: 'notifications.html' }, { label: '📢 Broadcast Center', href: 'broadcast.html' } ] },
  { label: 'Admin App', href: 'admin-app.html', icon: '📱' },
  { label: 'Settings', href: 'settings.html', icon: '⚙️' },
  { label: 'Support', href: '#', icon: '🆘' },
  { label: 'Logout', href: '#', icon: '⛔' }
];

function createMenuItem(item) {
  if (item.children && item.children.length) {
    const id = `menu-${item.label.replace(/\s+/g,'').toLowerCase()}`;
    return `
      <li class="menu-group">
        <button class="menu-toggle" data-target="${id}"><span class="menu-icon">${item.icon || ''}</span><span class="menu-label">${item.label}</span><span class="menu-caret">▸</span></button>
        <ul id="${id}" class="menu-children">
          ${item.children.map(c => `<li><a href="#" data-route="${(c.href || '').split('.').shift()}">${c.label}</a></li>`).join('')}
        </ul>
      </li>
    `;
  }
  // for top-level links map known pages to data-route for SPA
  const routeName = ['dashboard','users','all-webinars','webinars','purchases','checkout-funnel','downloads','reports','notifications','broadcast','admin-app','settings'].includes((item.href||'').split('.').shift()) ? (item.href||'').split('.').shift() : '';
  return `<li><a href="#" ${routeName?`data-route="${routeName}"`:''} class="menu-link"><span class="menu-icon">${item.icon || ''}</span><span class="menu-label">${item.label}</span></a></li>`;
}

export function renderSidebar(containerId = 'sidebar-placeholder') {
  const c = document.getElementById(containerId);
  if (!c) return;

  const currentHash = (location.hash || '#dashboard').replace('#','');

  c.innerHTML = `
    <aside class="admin-sidebar" aria-hidden="false">
      <div class="admin-sidebar-top">
        <div class="admin-logo">
          <span class="logo-mark" aria-hidden="true"></span>
          <strong class="menu-label">Aarogyam Admin</strong>
        </div>
        <button id="admin-sidebar-close-btn" onclick="window.toggleMobileDrawer && window.toggleMobileDrawer(false)" class="admin-sidebar-close-btn" aria-label="Close menu" type="button" style="background:transparent; border:none; color:var(--admin-muted); font-size:1.4rem; cursor:pointer; padding:4px 8px; display:none;">✕</button>
      </div>
      <nav>
        <ul class="menu-root">
          ${MENU.map(createMenuItem).join('')}
        </ul>
      </nav>
      <div class="admin-sidebar-footer">
        <small class="admin-muted menu-label">Admin Panel V1 • UI Only</small>
      </div>
    </aside>
  `;

  // --- Mobile Close Button Handler ---
  const closeBtn = c.querySelector('#admin-sidebar-close-btn');
  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.remove('mobile-drawer-open');
  });

  // --- Close mobile drawer on any route link click ---
  c.querySelectorAll('a[data-route]').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        document.body.classList.remove('mobile-drawer-open');
      }
    });
  });

  // --- Professional Accordion Menu Logic ---
  const menuToggles = c.querySelectorAll('.menu-toggle');
  menuToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const target = document.getElementById(targetId);
      if (!target) return;

      const isOpening = !target.classList.contains('open');

      // Close all other open menus
      c.querySelectorAll('.menu-children.open').forEach(openMenu => {
        if (openMenu.id !== targetId) {
          openMenu.classList.remove('open');
          openMenu.style.maxHeight = '0px';
          const otherBtn = c.querySelector(`.menu-toggle[data-target="${openMenu.id}"]`);
          otherBtn?.classList.remove('open');
        }
      });

      // Toggle the clicked menu
      if (isOpening) {
        target.classList.add('open');
        target.style.maxHeight = target.scrollHeight + 'px';
        btn.classList.add('open');
      } else {
        target.classList.remove('open');
        target.style.maxHeight = '0px';
        btn.classList.remove('open');
      }
    });
  });


  // --- Active Link Updater ---
  function updateActive(route) {
    c.querySelectorAll('.menu-link').forEach(a => a.classList.remove('active'));
    c.querySelectorAll('.menu-children li a').forEach(a => a.classList.remove('active'));

    const activeLink = c.querySelector(`a[data-route="${route}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      
      const parentSubMenu = activeLink.closest('.menu-children');
      if (parentSubMenu && !parentSubMenu.classList.contains('open')) {
        // Auto-open the accordion if the active link is inside
        const toggleBtn = parentSubMenu.previousElementSibling;
        toggleBtn?.click();
      }
    }
  }

  // Set initial active link
  updateActive(currentHash || 'dashboard');

  // Listen for route changes from the router to update active link
  document.addEventListener('admin:route-changed', (e) => updateActive(e.detail.route));
}

// TODO: add permissions-aware items and icons in Phase-2
