/* Admin Sidebar Component */

const MENU = [
  { label: 'Dashboard', href: 'dashboard.html', icon: '🏠' },
  { label: 'Users', icon: '👥', children: [ { label: 'All Users', href: 'users.html' }, { label: 'User Details', href: 'user-details.html' } ] },
  { label: 'Books', icon: '📚', children: [ { label: 'Categories', href: '#' }, { label: 'Books', href: '#' }, { label: 'Demo Books', href: '#' } ] },
  { label: 'Products', icon: '🛍️', children: [ { label: 'Categories', href: '#' }, { label: 'Products', href: '#' } ] },
  { label: 'Diseases', href: '#', icon: '🧾' },
  { label: 'Orders', icon: '🧾', children: [ { label: 'Purchases', href: 'purchases.html' }, { label: 'Downloads', href: 'downloads.html' } ] },
  { label: 'Reports', icon: '📈', children: [ { label: 'Daily', href: 'reports.html#daily-report' }, { label: 'Monthly', href: '#' }, { label: 'Sales', href: '#' }, { label: 'Referral', href: 'reports.html#share-report' }, { label: 'Source', href: 'reports.html#lead-report' } ] },
  { label: 'Marketing', icon: '📣', children: [ { label: 'Landing Pages', href: '#' }, { label: 'Share Links', href: '#' }, { label: 'Campaigns', href: '#' } ] },
  { label: 'Webinars', href: '#', icon: '🎥' },
  { label: 'Wallet', href: '#', icon: '💰' },
  { label: 'Notifications', href: '#', icon: '🔔' },
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
  const routeName = ['dashboard','users','purchases','downloads','reports','settings'].includes((item.href||'').split('.').shift()) ? (item.href||'').split('.').shift() : '';
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
          <strong>Aarogyam</strong>
        </div>
        <button id="admin-sidebar-collapse" class="admin-button" aria-label="Toggle sidebar">☰</button>
      </div>
      <nav>
        <ul class="menu-root">
          ${MENU.map(createMenuItem).join('')}
        </ul>
      </nav>
      <div class="admin-sidebar-footer">
        <small class="admin-muted">Admin Panel V1 • UI Only</small>
      </div>
    </aside>
  `;

  // Attach toggle handlers for collapsible groups
  c.querySelectorAll('.menu-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const expanded = target.classList.toggle('open');
      btn.classList.toggle('open', expanded);
    });
  });

  // Sidebar collapse (mobile)
  const collapseBtn = c.querySelector('#admin-sidebar-collapse');
  collapseBtn?.addEventListener('click', () => {
    const open = !document.body.classList.contains('admin-sidebar-collapsed');
    document.body.classList.toggle('admin-sidebar-collapsed');

    // add backdrop for mobile
    let backdrop = document.getElementById('admin-sidebar-backdrop');
    if (open) {
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'admin-sidebar-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.inset = '0';
        backdrop.style.background = 'rgba(0,0,0,0.4)';
        backdrop.style.zIndex = '45';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', () => {
          document.body.classList.remove('admin-sidebar-collapsed');
          backdrop.remove();
        });
      }
    } else {
      backdrop?.remove();
    }
  });

  // Update active link based on hash-driven route
  function updateActive(route) {
    c.querySelectorAll('.menu-link').forEach(a => a.classList.remove('active'));
    c.querySelectorAll('.menu-children li a').forEach(a => a.classList.remove('active'));

    // top-level matches
    const top = c.querySelector(`.menu-link[data-route="${route}"]`);
    if (top) top.classList.add('active');
    // child matches
    const child = c.querySelector(`.menu-children a[data-route="${route}"]`);
    if (child) {
      child.classList.add('active');
      // open parent
      const parent = child.closest('.menu-children');
      if (parent) parent.classList.add('open');
      const toggle = parent.previousElementSibling;
      if (toggle) toggle.classList.add('open');
    }
  }

  // initial active
  updateActive(currentHash || 'dashboard');

  // listen for route changes
  document.addEventListener('admin:route-changed', (e) => updateActive(e.detail.route));

  // remove backdrop on route change
  document.addEventListener('admin:route-changed', () => {
    const backdrop = document.getElementById('admin-sidebar-backdrop');
    backdrop?.remove();
    document.body.classList.remove('admin-sidebar-collapsed');
  });

}

// TODO: add permissions-aware items and icons in Phase-2
