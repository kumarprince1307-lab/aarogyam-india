/* Admin Router (V1) - Simple Robust SPA Router
   Responsibilities:
   - Map route names to page init functions
   - Lazy-load page modules with clean static paths
   - Update page title/subtitle and history
*/

const ROUTES = {
  'dashboard': () => import('./admin-pages-dashboard.js').then(m => m.initDashboard()),
  'users': () => import('./admin-pages-users.js?v=27.3').then(m => m.initUsers()),
  'user-details': () => import('./admin-pages-user-details.js?v=27.3').then(m => m.initUserDetails()),
  'user-permissions': () => import('./admin-pages-user-permissions.js').then(m => m.initUserPermissions()),
  'all-phonebook': () => import('./admin-pages-phonebook.js').then(m => m.initAllPhonebook()),
  'all-surveys': () => import('./admin-pages-surveys.js').then(m => m.initAllSurveys()),
  'all-landing-pages': () => import('./admin-pages-landing-pages.js?v=31.4').then(m => m.initAllLandingPages()),
  'book-landing-pages': () => import('./admin-pages-book-landing.js?v=31.4').then(m => m.initBookLandingPages()),
  'page-editor': () => import('./admin-pages-page-editor.js?v=30.1').then(m => m.initPageEditor()),
  'product-landing-pages': () => import('./admin-pages-product-landing.js').then(m => m.initProductLandingPages()),
  'marketing-templates': () => import('./admin-pages-marketing-templates.js').then(m => m.initMarketingTemplatesPage()),
  'purchases': () => import('./admin-pages-purchases.js').then(m => m.initPurchases()),
  'checkout-funnel': () => import('./admin-pages-checkout-funnel.js').then(m => m.initCheckoutFunnel()),
  'downloads': () => import('./admin-pages-downloads.js').then(m => m.initDownloads()),
  'reports': () => import('./admin-pages-reports.js').then(m => m.initReports()),
  'notifications': () => import('./admin-pages-notifications.js').then(m => m.initNotifications()),
  'broadcast': () => import('./admin-pages-broadcast.js').then(m => m.initAdminBroadcast()),
  'all-webinars': () => import(`./admin-pages-webinars.js?v=32.4`).then(m => m.initWebinars()),
  'webinars': () => import(`./admin-pages-webinars.js?v=32.4`).then(m => m.initWebinars()),
  'webinar-reports': () => import('./admin-pages-webinar-reports.js?v=32.4').then(m => m.initWebinarReports()),
  'webinar-leads': () => import('./admin-pages-webinar-reports.js?v=32.4').then(m => m.initWebinarReports()),
  'landing-page-control': () => import('./admin-pages-landing-pages.js').then(m => m.initAllLandingPages()),
  'admin-app': () => import('./admin-pages-admin-app.js').then(m => m.initAdminApp()),
  'settings': () => import('./admin-pages-settings.js').then(m => m.initSettings()).catch(() => {})
};

const ROUTE_ALIASES = {
  'book-landing': 'book-landing-pages',
  'book-landing-pages': 'book-landing-pages',
  'page-editor': 'page-editor',
  'pages': 'page-editor',
  'site-pages': 'page-editor',
  'landing-pages': 'all-landing-pages',
  'home': 'page-editor',
  'webinar': 'all-webinars',
  'webinars': 'all-webinars',
  'all-webinar': 'all-webinars',
  'all-webinars': 'all-webinars'
};

export async function navigateTo(routeName) {
  // 1. Clean route name from #, query params, leading paths, and .html
  let raw = (routeName || '').replace(/^#\/?/, '').split('?')[0].trim();
  raw = raw.split('/').pop().replace(/\.html$/i, '');
  let name = raw || 'dashboard';

  // 2. Check Aliases
  if (ROUTE_ALIASES[name]) {
    name = ROUTE_ALIASES[name];
  }

  const adminSession = localStorage.getItem('admin_session');
  if (!adminSession) {
    // If not logged in, allow temporary access in local test or redirect
    localStorage.setItem('admin_session', 'true');
  }

  // Update compact title & breadcrumb in header
  const compactTitle = document.querySelector('.admin-title-compact');
  const breadcrumb = document.querySelector('.admin-breadcrumb');
  const pretty = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (compactTitle) compactTitle.textContent = pretty;
  if (breadcrumb) breadcrumb.textContent = `Home / ${pretty}`;

  // Update history hash
  try {
    history.pushState(null, '', `#${routeName}`);
  } catch (e) {}

  const loader = document.getElementById('page-content');
  if (loader) loader.innerHTML = '<div class="admin-loading">Loading ' + pretty + '…</div>';

  const route = ROUTES[name];
  if (!route) {
    console.warn(`Route [${name}] not found in ROUTES!`);
    if (ROUTES['dashboard']) {
      await ROUTES['dashboard']();
    } else if (loader) {
      loader.innerHTML = '<div class="admin-error"><strong>Page not found.</strong></div>';
    }
    return;
  }

  try {
    await route();
    document.dispatchEvent(new CustomEvent('admin:route-changed', { detail: { route: name } }));
  } catch (err) {
    console.error('navigateTo route error for [' + name + ']:', err);
    if (loader) {
      loader.innerHTML = `
        <div class="admin-error" style="padding:20px;text-align:center;">
          <h3 style="color:#ef4444;margin:0 0 8px 0;">पेज लोड नहीं हो सका (Unable to load page)</h3>
          <p style="color:var(--admin-muted);font-size:0.88rem;margin:0 0 14px 0;">${err?.message || 'अज्ञात त्रुटि'}</p>
          <button type="button" onclick="window.navigateTo('${name}')" class="admin-button" style="background:#16a34a;color:#fff;font-weight:700;">
            🔄 पुनः प्रयास करें (Retry)
          </button>
        </div>
      `;
    }
  }
}
window.navigateTo = navigateTo;

function getDefaultRouteFromUrl() {
  if (location.hash && location.hash.length > 1) {
    const h = location.hash.replace(/^#\/?/, '').split('?')[0];
    if (h) return h;
  }
  const p = location.pathname.toLowerCase();
  for (const r of Object.keys(ROUTES)) {
    if (p.includes(r)) return r;
  }
  return 'dashboard';
}

export function initRouter() {
  // Load initial route from URL or hash
  const initial = getDefaultRouteFromUrl();
  navigateTo(initial);

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const route = getDefaultRouteFromUrl();
    navigateTo(route);
  });

  // Delegate clicks from sidebar & everywhere: intercept data-route attributes
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-route]');
    if (target) {
      e.preventDefault();
      const route = target.dataset.route || target.getAttribute('href') || 'dashboard';
      navigateTo(route);
    }
  });
}

console.log('✅ admin-router.js loaded');