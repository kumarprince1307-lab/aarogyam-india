/* Admin Sidebar Component */

const MENU = [
  { label: 'Dashboard', href: 'dashboard.html', icon: '🏠', route: 'dashboard' },
  { label: '🚀 Marketing Hub (मार्केटिंग हब)', href: 'reports.html', icon: '📈', route: 'reports' },
  { label: 'Users (उपयोगकर्ता)', icon: '👥', children: [ 
    { label: 'All Users (सभी यूजर)', href: 'users.html', route: 'users' }, 
    { label: '🔍 User Details & Search', href: 'user-details.html', route: 'user-details' },
    { label: '🛡️ All User Permissions', href: 'user-permissions.html', route: 'user-permissions' },
    { label: '📱 All Phonebook Contacts', href: 'all-phonebook.html', route: 'all-phonebook' },
    { label: '📋 All Survey List', href: 'all-surveys.html', route: 'all-surveys' }
  ] },
  { label: 'Books & Audio (पुस्तकें)', icon: '📚', children: [ 
    { label: 'Book Landing Pages (बुक पेज)', href: 'book-landing-pages.html', route: 'book-landing-pages' },
    { label: '🎧 Audio Book Studio (वॉइस रिकॉर्डर)', href: 'book-audio-studio.html', route: 'book-audio-studio' },
    { label: '📁 Categories (श्रेणियां)', href: 'book-landing-pages.html#categories', route: 'book-landing-pages' },
    { label: '📚 All Books (सभी पुस्तकें)', href: 'book-landing-pages.html#all-books', route: 'book-landing-pages' },
    { label: '👁️ Demo Books (डेमो पुस्तक)', href: 'book-landing-pages.html#demo-books', route: 'book-landing-pages' }
  ] },
  { label: 'Page Editor (पेज एडिटर)', icon: '📑', children: [
    { label: 'All Site Pages (सभी पेज एडिटर)', href: 'page-editor.html', route: 'page-editor' },
    { label: '🏠 Home Page Editor', href: 'page-editor.html?page=home', route: 'page-editor?page=home' },
    { label: '📚 eBook Store Editor', href: 'page-editor.html?page=ebook', route: 'page-editor?page=ebook' },
    { label: '🌾 Agriculture Hub Editor', href: 'page-editor.html?page=agriculture', route: 'page-editor?page=agriculture' },
    { label: '❤️ Health Hub Editor', href: 'page-editor.html?page=health-hub', route: 'page-editor?page=health-hub' },
    { label: '🩸 Diabetes (मधुमेह) Editor', href: 'page-editor.html?page=page_health_diabetes', route: 'page-editor?page=page_health_diabetes' },
    { label: '⚖️ Weight Loss (मोटापा) Editor', href: 'page-editor.html?page=page_health_weight_loss', route: 'page-editor?page=page_health_weight_loss' },
    { label: '🦴 Joint Care (जोड़ दर्द) Editor', href: 'page-editor.html?page=page_health_joint_care', route: 'page-editor?page=page_health_joint_care' },
    { label: '🌸 Women Care (महिला स्वास्थ्य) Editor', href: 'page-editor.html?page=page_health_womens_care', route: 'page-editor?page=page_health_womens_care' },
    { label: '💇 Hair Care (बाल झड़ना) Editor', href: 'page-editor.html?page=page_health_hair_care', route: 'page-editor?page=page_health_hair_care' },
    { label: '🌺 Skin Care (स्किन) Editor', href: 'page-editor.html?page=page_health_skin_care', route: 'page-editor?page=page_health_skin_care' },
    { label: '🧸 Kids Care (बच्चे) Editor', href: 'page-editor.html?page=page_health_kids_care', route: 'page-editor?page=page_health_kids_care' },
    { label: '🏡 Home Care (घरेलू) Editor', href: 'page-editor.html?page=page_health_home_care', route: 'page-editor?page=page_health_home_care' },
    { label: '🐄 Pashu Palan Editor', href: 'page-editor.html?page=pashu', route: 'page-editor?page=pashu' },
    { label: '🌾 Mandi & Weather Editor', href: 'page-editor.html?page=mandi', route: 'page-editor?page=mandi' },
    { label: '🌾 खरीफ फसल गाइड लैंडिंग पेज', href: 'page-editor.html?page=page_kharif_guide', route: 'page-editor?page=page_kharif_guide' },
    { label: '🩺 खेती का डॉक्टर लैंडिंग पेज', href: 'page-editor.html?page=page_kheti_dr', route: 'page-editor?page=page_kheti_dr' },
    { label: '💼 Netsurf Career (नेटसर्फ करियर) Editor', href: 'page-editor.html?page=page_netsurf_career', route: 'page-editor?page=page_netsurf_career' }
  ] },
  { label: '👑 Smart eTailer (₹8.19L)', icon: '👑', href: 'smart-etailer.html', route: 'smart-etailer' },
  { label: 'Products (उत्पाद)', icon: '🛍️', children: [ 
    { label: 'Product Landing Pages', href: 'product-landing-pages.html', route: 'product-landing-pages' }, 
    { label: '📁 Categories (श्रेणियां)', href: 'product-landing-pages.html#categories', route: 'product-landing-pages' }, 
    { label: '🛍️ All Products (उत्पाद सूची)', href: 'product-landing-pages.html#products', route: 'product-landing-pages' } 
  ] },
  { label: 'Diseases (रोग व समाधान)', icon: '🩺', href: 'crop-doctor.html', route: 'crop-doctor' },
  { label: 'Orders & Sales (ऑर्डर्स)', icon: '🧾', children: [ 
    { label: 'Purchases (खरीद विवरण)', href: 'purchases.html', route: 'purchases' }, 
    { label: 'Checkout Funnel (चेकआउट फ़नल)', href: 'checkout-funnel.html', route: 'checkout-funnel' }, 
    { label: 'Downloads (डाउनलोड आंकड़े)', href: 'downloads.html', route: 'downloads' } 
  ] },
  { label: 'Reports & Analytics (रिपोर्ट्स)', icon: '📈', children: [ 
    { label: '🔄 Share & Offer Conversions (कन्वर्जन)', href: 'reports.html#share-conversions', route: 'reports' }, 
    { label: '🎯 Offer Purchases (ऑफ़र खरीद)', href: 'reports.html#offer-purchases', route: 'reports' }, 
    { label: '👥 Share Links (शेयर कन्वर्जन)', href: 'reports.html#share-report', route: 'reports' }, 
    { label: '📊 Daily Reports (दैनिक रिपोर्ट)', href: 'reports.html#daily-report', route: 'reports' }, 
    { label: '🌐 Lead Source (लीड स्त्रोत)', href: 'reports.html#lead-report', route: 'reports' },
    { label: '🎥 Webinar Reports (वेबिनार रिपोर्ट)', href: 'webinar-reports.html', route: 'webinar-reports' }
  ] },
  { label: 'Marketing (मार्केटिंग)', icon: '📣', children: [ 
    { label: 'UCAS Landing Pages', href: 'all-landing-pages.html', route: 'all-landing-pages' }, 
    { label: 'Hook Templates & Shayari', href: 'smart-etailer.html?tab=adm-sec-marketing', route: 'marketing-templates' }, 
    { label: '👥 Share Links Analytics', href: 'reports.html#share-report', route: 'reports' }, 
    { label: '🎯 Campaigns Analytics', href: 'reports.html#lead-report', route: 'reports' } 
  ] },
  { label: 'Webinars (वेबिनार हब)', href: 'all-webinars.html', icon: '🎥', route: 'all-webinars' },
  { label: 'Notifications (सूचनाएं)', icon: '🔔', children: [ 
    { label: 'All Notifications', href: 'notifications.html', route: 'notifications' }, 
    { label: '📢 Broadcast Center', href: 'broadcast.html', route: 'broadcast' } 
  ] },

  /* ========================================================
     🌟 1. DUPLICATE / REVIEW HUB (2 दिन तुलना और परीक्षण हेतु)
     ======================================================== */
  { label: '🔄 डुप्लीकेट मेनू (Duplicate Hub)', icon: '🔄', children: [
    { label: '📑 1. UCAS Landing Pages (v1)', href: 'all-landing-pages.html', route: 'all-landing-pages' },
    { label: '🛡️ 2. Landing & Webinar Review Shield', href: 'landing-page-control.html', route: 'landing-page-control' },
    { label: '✍️ 3. Marketing Templates (स्टैंडअलोन CRUD)', href: 'marketing-templates.html', route: 'marketing-templates-standalone' },
    { label: '👑 4. Smart eTailer Marketing Hooks Tab', href: 'smart-etailer.html?tab=adm-sec-marketing', route: 'marketing-templates' },
    { label: '📊 5. Marketing Hub (Full Page View)', href: 'reports.html', route: 'reports' },
    { label: '🎥 6. Webinar Reports (Users Sub-Report)', href: 'webinar-reports.html', route: 'webinar-reports' },
    { label: '🎬 7. Webinars Hub (Main Video Hub)', href: 'all-webinars.html', route: 'all-webinars' }
  ] },

  /* ========================================================
     🌟 2. UNUSED / ARCHIVES HUB (सुरक्षित परीक्षण हेतु)
     ======================================================== */
  { label: '📦 अनयूज़्ड व आर्काइव (Archive Hub)', icon: '📦', children: [
    { label: '🎙️ 1. Audio Studio Prototype v1', href: 'book-audio-studio.html?v=1', route: 'audio-studio-v1' },
    { label: '📱 2. Admin App Standalone PWA', href: 'admin-app.html', route: 'admin-app' },
    { label: '📶 3. Offline Mode Screen Check', href: 'offline.html', route: 'offline-preview' },
    { label: '🔐 4. Auth & Session Diagnostics', href: 'settings.html#auth', route: 'auth-diagnostics' },
    { label: '🛒 5. Standalone Checkout Funnel', href: 'checkout-funnel.html', route: 'checkout-funnel' },
    { label: '📥 6. Standalone Downloads', href: 'downloads.html', route: 'downloads' }
  ] },

  { label: 'Admin App', href: 'admin-app.html', icon: '📱', route: 'admin-app' },
  { label: 'Settings', href: 'settings.html', icon: '⚙️', route: 'settings' },
  { label: 'Support (सहायता)', href: 'support.html', icon: '🆘', route: 'support' },
  { label: 'Logout (लॉगआउट)', href: 'javascript:void(0)', icon: '⛔', action: 'logout' }
];

function createMenuItem(item) {
  if (item.action === 'logout' || item.label.includes('Logout')) {
    return `<li><a href="javascript:void(0)" id="admin-logout-btn" class="menu-link"><span class="menu-icon">${item.icon || '⛔'}</span><span class="menu-label">${item.label}</span></a></li>`;
  }

  if (item.children && item.children.length) {
    const id = `menu-${item.label.replace(/[^a-zA-Z0-9]/g,'').toLowerCase()}`;
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

  // --- Admin Logout Button Handler ---
  const logoutBtn = c.querySelector('#admin-logout-btn');
  logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('क्या आप एडमिन पैनल से लॉगआउट करना चाहते हैं? (Are you sure you want to log out?)')) {
      localStorage.removeItem('admin_session');
      sessionStorage.clear();
      window.location.replace('login.html');
    }
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
