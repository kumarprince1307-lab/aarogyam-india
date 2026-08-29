/* Admin Sidebar Component */

const MENU = [
  { label: 'Dashboard', href: 'dashboard.html', icon: '🏠', route: 'dashboard' },
  { label: 'Users', icon: '👥', children: [ 
    { label: 'All Users', href: 'users.html', route: 'users' }, 
    { label: 'User Details', href: 'user-details.html', route: 'user-details' },
    { label: 'All User Permissions', href: 'user-permissions.html', route: 'user-permissions' },
    { label: 'All Phonebook', href: 'all-phonebook.html', route: 'all-phonebook' },
    { label: 'All Survey List', href: 'all-surveys.html', route: 'all-surveys' }
  ] },
  { label: 'Books', icon: '📚', children: [ 
    { label: 'Book Landing Pages (बुक पेज)', href: 'book-landing-pages.html', route: 'book-landing-pages' },
    { label: 'Categories', href: '#' },
    { label: 'Books', href: '#' },
    { label: 'Demo Books', href: '#' }
  ] },
  { label: 'Page Editor (पेज एडिटर)', icon: '📑', children: [
    { label: 'All Site Pages (सभी पेज एडिटर)', href: 'page-editor.html', route: 'page-editor' },
    { label: '🌾 खरीफ फसल गाइड लैंडिंग पेज', href: 'page-editor.html?page=page_kharif_guide', route: 'page-editor?page=page_kharif_guide' },
    { label: '🩺 खेती का डॉक्टर लैंडिंग पेज', href: 'page-editor.html?page=page_kheti_dr', route: 'page-editor?page=page_kheti_dr' },
    { label: '🏠 Home Page Editor', href: 'page-editor.html?page=home', route: 'page-editor?page=home' },
    { label: '🌾 Agriculture Hub Editor', href: 'page-editor.html?page=agriculture', route: 'page-editor?page=agriculture' },
    { label: '📚 eBook Store Editor', href: 'page-editor.html?page=ebook', route: 'page-editor?page=ebook' },
    { label: '🛒 Shopping Cart Editor', href: 'page-editor.html?page=cart', route: 'page-editor?page=cart' },
    { label: '📖 My Library Editor', href: 'page-editor.html?page=library', route: 'page-editor?page=library' },
    { label: '🌾 Mandi & Weather Editor', href: 'page-editor.html?page=mandi', route: 'page-editor?page=mandi' }
  ] },
  { label: 'Products', icon: '🛍️', children: [ 
    { label: 'Product Landing Pages', href: 'product-landing-pages.html', route: 'product-landing-pages' }, 
    { label: 'Categories', href: '#' }, 
    { label: 'Products', href: '#' } 
  ] },
  { label: 'Diseases', icon: '🩺', href: '#' },
  { label: 'Orders', icon: '🧾', children: [ 
    { label: 'Purchases', href: 'purchases.html', route: 'purchases' }, 
    { label: 'Checkout Funnel', href: 'checkout-funnel.html', route: 'checkout-funnel' }, 
    { label: 'Downloads', href: 'downloads.html', route: 'downloads' } 
  ] },
  { label: 'Reports', icon: '📈', children: [ 
    { label: 'Daily', href: 'reports.html#daily-report', route: 'reports' }, 
    { label: 'Monthly', href: '#' }, 
    { label: 'Sales', href: '#' }, 
    { label: 'Referral', href: 'reports.html#share-report', route: 'reports' }, 
    { label: 'Source', href: 'reports.html#lead-report', route: 'reports' } 
  ] },
  { label: 'Marketing', icon: '📣', children: [ 
    { label: 'UCAS Landing Pages', href: 'all-landing-pages.html', route: 'all-landing-pages' }, 
    { label: 'Hook Templates & Shayari', href: 'marketing-templates.html', route: 'marketing-templates' }, 
    { label: 'Share Links', href: '#' }, 
    { label: 'Campaigns', href: '#' } 
  ] },
  { label: 'Webinars', href: 'all-webinars.html', icon: '🎥', route: 'all-webinars' },
  { label: 'Notifications', icon: '🔔', children: [ 
    { label: 'All Notifications', href: 'notifications.html', route: 'notifications' }, 
    { label: '📢 Broadcast Center', href: 'broadcast.html', route: 'broadcast' } 
  ] },
  { label: 'Admin App', href: 'admin-app.html', icon: '📱', route: 'admin-app' },
  { label: 'Settings', href: 'settings.html', icon: '⚙️', route: 'settings' },
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
          ${item.children.map(c => {
            const r = c.route || (c.href || '').split('.').shift();
            return `<li><a href="${c.href || '#'}" data-route="${r}">${c.label}</a></li>`;
          }).join('')}
        </ul>
      </li>
    `;
  }
  // for top-level links map to data-route for SPA
  const routeName = item.route || ((item.href || '').split('.').shift());
  return `<li><a href="${item.href || '#'}" ${routeName ? `data-route="${routeName}"` : ''} class="menu-link"><span class="menu-icon">${item.icon || ''}</span><span class="menu-label">${item.label}</span></a></li>`;
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
        if (toggleBtn) toggleBtn.classList.add('open');
        parentSubMenu.classList.add('open');
        parentSubMenu.style.maxHeight = parentSubMenu.scrollHeight + 'px';
      }
    }
  }

  // Update on route changed event
  document.addEventListener('admin:route-changed', (e) => {
    if (e.detail && e.detail.route) {
      updateActive(e.detail.route);
    }
  });

  // Initial active link sync
  updateActive(currentHash);
}
