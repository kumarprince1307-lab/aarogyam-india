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

  const currentPath = location.pathname.split('/').pop();

  c.innerHTML = `
    <aside class="admin-sidebar admin-card" aria-hidden="false">
      <div class="admin-sidebar-top">
        <div class="admin-logo">
          <strong>Aarogyam Admin</strong>
        </div>
        <button id="admin-sidebar-collapse" class="admin-button" aria-label="Toggle sidebar">☰</button>
      </div>
      <nav>
        <ul class="menu-root">
          ${MENU.map(createMenuItem).join('')}
        </ul>
      </nav>
      <div class="admin-sidebar-footer">
        <small class="admin-muted">Admin Panel V1 (UI)</small>
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
    document.body.classList.toggle('admin-sidebar-collapsed');
  });

  // Highlight current link if matches
  c.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.split('/').pop() === currentPath) a.classList.add('active');
  });
}

// TODO: add permissions-aware items and icons in Phase-2
