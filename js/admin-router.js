/* Admin Router (V1) - simple SPA router
  Responsibilities:
  - Map route names to page init functions
  - Lazy-load page modules where possible
  - Update page title/subtitle and history
*/

const ROUTES = {
 'dashboard': () => import('./admin-pages-dashboard.js?v=9.0').then(m => m.initDashboard()),
 'users': () => import('./admin-pages-users.js?v=9.0').then(m => m.initUsers()),
 'user-details': () => import('./admin-pages-user-details.js?v=9.0').then(m => m.initUserDetails()),
 'user-permissions': () => import('./admin-pages-user-permissions.js?v=9.0').then(m => m.initUserPermissions()),
 'all-phonebook': () => import('./admin-pages-phonebook.js?v=9.0').then(m => m.initAllPhonebook()),
 'all-surveys': () => import('./admin-pages-surveys.js?v=9.0').then(m => m.initAllSurveys()),
 'all-landing-pages': () => import('./admin-pages-landing-pages.js?v=9.0').then(m => m.initAllLandingPages()),
 'purchases': () => import('./admin-pages-purchases.js?v=9.0').then(m => m.initPurchases()),
 'checkout-funnel': () => import('./admin-pages-checkout-funnel.js?v=9.0').then(m => m.initCheckoutFunnel()),
 'downloads': () => import('./admin-pages-downloads.js?v=9.0').then(m => m.initDownloads()),
 'reports': () => import('./admin-pages-reports.js?v=9.0').then(m => m.initReports()),
 'notifications': () => import('./admin-pages-notifications.js?v=9.0').then(m => m.initNotifications()),
 'all-webinars': () => import('./admin-pages-webinars.js?v=9.0').then(m => m.initWebinars()),
 'webinars': () => import('./admin-pages-webinars.js?v=9.0').then(m => m.initWebinars()),
 'landing-page-control': () => import('./admin-pages-landing-pages.js?v=9.0').then(m => m.initAllLandingPages()),
 'admin-app': () => import('./admin-pages-admin-app.js?v=9.0').then(m => m.initAdminApp()),
 'settings': () => import('./admin-pages-settings.js?v=9.0').then(m => m.initSettings()).catch(() => { /* settings may be placeholder */ })
};

export async function navigateTo(routeName) {
 // Fix: Split route from query params to handle URLs like #checkout-funnel?status=dropped
 const name = (routeName || '').replace('#','').split('?')[0] || 'dashboard';
 const adminSession = localStorage.getItem('admin_session');
 if (!adminSession) {
   window.location.href = 'admin/login.html';
   return;
 }

 // update compact title in header if present
 const compactTitle = document.querySelector('.admin-title-compact');
 const breadcrumb = document.querySelector('.admin-breadcrumb');
 const pretty = name.charAt(0).toUpperCase() + name.slice(1);
 if (compactTitle) compactTitle.textContent = pretty;
 if (breadcrumb) breadcrumb.textContent = `Home / ${pretty}`;

 // update history
 try { history.pushState(null, '', `#${routeName}`); } catch(e){}

 const loader = document.getElementById('page-content');
 if (loader) loader.innerHTML = '<div class="admin-loading">Loading ' + name + '…</div>';

 const route = ROUTES[name];
 if (!route) {
   if (loader) loader.innerHTML = '<div class="admin-error"><strong>Page not found.</strong></div>';
   return;
 }

 try {
   await route();
   // notify other components of route change
   document.dispatchEvent(new CustomEvent('admin:route-changed', { detail: { route: name } }));
 } catch (err) {
   console.error('navigateTo route error', err);
   if (loader) loader.innerHTML = '<div class="admin-error"><strong>Unable to load page.</strong></div>';
 }
}

export function initRouter() {
 // load initial route from hash
 const initial = location.hash.replace('#','') || 'dashboard';
 navigateTo(initial);

 // handle back/forward
 window.addEventListener('popstate', () => {
   const route = location.hash.replace('#','') || 'dashboard';
   navigateTo(route);
 });

 // Delegate clicks from sidebar: intercept data-route attributes
 document.addEventListener('click', (e) => {
   const target = e.target.closest('[data-route]');
   if (target) {
     e.preventDefault();
     const route = target.getAttribute('href')?.replace('#', '') || target.dataset.route;
     navigateTo(route);
   }
 });
}

console.log('✅ admin-router.js loaded');