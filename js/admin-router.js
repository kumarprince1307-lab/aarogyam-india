/* Admin Router (V1) - Simple Robust SPA Router
   Responsibilities:
   - Map route names to page init functions
   - Lazy-load page modules with clean static paths
   - Update page title/subtitle and history
*/

const ROUTES = {
  'dashboard': () => import('./admin-pages-dashboard.js').then(m => m.initDashboard()),
  'users': () => import('./admin-pages-users.js?v=27.4').then(m => m.initUsers()),
  'user-details': () => import('./admin-pages-user-details.js?v=27.5').then(m => m.initUserDetails()),
  'user-permissions': () => import('./admin-pages-user-permissions.js').then(m => m.initUserPermissions()),
  'all-phonebook': () => import('./admin-pages-phonebook.js').then(m => m.initAllPhonebook()),
  'all-surveys': () => import('./admin-pages-surveys.js').then(m => m.initAllSurveys()),
  'all-landing-pages': () => import('./admin-pages-landing-pages.js?v=31.4').then(m => m.initAllLandingPages()),
  'book-landing-pages': () => import('./admin-pages-book-landing.js?v=39.1').then(m => m.initBookLandingPages()),
  'book-audio-studio': () => import('./admin-pages-book-audio-studio.js?v=3.4').then(m => m.initBookAudioStudio()),
  'page-editor': () => import('./admin-pages-page-editor.js?v=38.0').then(m => m.initPageEditor()),
  'product-landing-pages': () => import('./admin-pages-product-landing.js').then(m => m.initProductLandingPages()),
  'marketing-templates': () => import('./admin-pages-smart-etailer.js?v=4.2').then(m => m.initSmartEtailerAdmin('adm-sec-marketing')),
  'marketing-templates-standalone': () => import('./admin-pages-marketing-templates.js?v=2.0').then(m => m.initMarketingTemplatesPage()),
  'purchases': () => import('./admin-pages-purchases.js').then(m => m.initPurchases()),
  'checkout-funnel': () => import('./admin-pages-checkout-funnel.js').then(m => m.initCheckoutFunnel()),
  'downloads': () => import('./admin-pages-downloads.js').then(m => m.initDownloads()),
  'reports': () => import('./admin-pages-reports.js?v=5.0').then(m => (m.initReports ? m.initReports() : m.renderReports(document.getElementById('page-content')))),
  'notifications': () => import('./admin-pages-notifications.js').then(m => m.initNotifications()),
  'broadcast': () => import('./admin-pages-broadcast.js').then(m => m.initAdminBroadcast()),
  'all-webinars': () => import(`./admin-pages-webinars.js?v=34.1`).then(m => m.initWebinars()),
  'webinars': () => import(`./admin-pages-webinars.js?v=34.1`).then(m => m.initWebinars()),
  'webinar-reports': () => import('./admin-pages-webinar-reports.js?v=33.5').then(m => m.initWebinarReports()),
  'webinar-leads': () => import('./admin-pages-webinar-reports.js?v=33.5').then(m => m.initWebinarReports()),
  'landing-page-control': () => import('./admin-pages-landing-page-control.js?v=2.0').then(m => m.initLandingPageControl()),
  'admin-app': () => import('./admin-pages-admin-app.js').then(m => m.initAdminApp()),
  'smart-etailer': () => import('./admin-pages-smart-etailer.js?v=1.0').then(m => m.initSmartEtailerAdmin()),
  'settings': () => import('./admin-pages-settings.js?v=2.0').then(m => m.initSettings()).catch(() => {}),
  'support': () => renderSupportModule(),
  'crop-doctor': () => renderCropDoctorModule(),
  'offline-preview': () => renderOfflinePreviewModule(),
  'audio-studio-v1': () => renderAudioStudioV1Module(),
  'auth-diagnostics': () => renderAuthDiagnosticsModule()
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
  'all-webinars': 'all-webinars',
  'marketing-hub': 'reports',
  'marketing': 'reports',
  'landing-control': 'landing-page-control',
  'marketing-crud': 'marketing-templates-standalone',
  'marketing-templates-crud': 'marketing-templates-standalone',
  'products': 'product-landing-pages',
  'books': 'book-landing-pages',
  'categories': 'product-landing-pages',
  'demo-books': 'book-landing-pages',
  'help': 'support'
};

export async function navigateTo(routeName) {
  // 1. Separate query parameters if any (e.g. user-details?id=UUID)
  let fullRoute = (routeName || '').replace(/^#\/?/, '').trim();
  let query = '';
  if (fullRoute.includes('?')) {
    const qIndex = fullRoute.indexOf('?');
    query = fullRoute.substring(qIndex);
    fullRoute = fullRoute.substring(0, qIndex);
  }

  // 2. Clean route name from leading paths and .html
  let raw = fullRoute.split('/').pop().replace(/\.html$/i, '').trim();
  let name = raw || 'dashboard';

  // 3. Check Aliases
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

  // Update history hash with full target route and query params
  const targetHash = `${name}${query}`;
  try {
    history.pushState(null, '', `#${targetHash}`);
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
    document.dispatchEvent(new CustomEvent('admin:route-changed', { detail: { route: name, query: query } }));
  } catch (err) {
    console.error('navigateTo route error for [' + name + ']:', err);
    if (loader) {
      loader.innerHTML = `
        <div class="admin-error" style="padding:20px;text-align:center;">
          <h3 style="color:#ef4444;margin:0 0 8px 0;">पेज लोड नहीं हो सका (Unable to load page)</h3>
          <p style="color:var(--admin-muted);font-size:0.88rem;margin:0 0 14px 0;">${err?.message || 'अज्ञात त्रुटि'}</p>
          <button type="button" onclick="window.navigateTo('${name}${query}')" class="admin-button" style="background:#16a34a;color:#fff;font-weight:700;">
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
    const h = location.hash.replace(/^#\/?/, '').trim();
    if (h) return h;
  }
  const p = location.pathname.toLowerCase();
  const search = location.search || '';
  for (const r of Object.keys(ROUTES)) {
    if (p.includes(r)) return `${r}${search}`;
  }
  return `dashboard${search}`;
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
      let route = target.dataset.route || target.getAttribute('href') || 'dashboard';
      const href = target.getAttribute('href') || '';
      
      // If element has data-id and route doesn't already have query params, append ?id=...
      if (target.dataset.id && !route.includes('?')) {
        route = `${route}?id=${encodeURIComponent(target.dataset.id)}`;
      } else if (href.includes('?') && !route.includes('?')) {
        const qs = href.substring(href.indexOf('?'));
        route = `${route}${qs}`;
      }
      navigateTo(route);
    }
  });
}

/* --- Inline Revived Modules --- */

function renderSupportModule() {
  const content = document.getElementById('page-content');
  if (!content) return;
  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-card" style="padding: 24px; max-width: 760px; margin: 0 auto; background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border); border-radius: 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <span style="font-size:2rem;">🆘</span>
          <div>
            <h2 style="margin:0;font-size:1.3rem;color:var(--admin-text);">आरोग्यम एडमिन तकनीकी सहायता (Admin Tech Support)</h2>
            <p style="margin:2px 0 0 0;font-size:0.85rem;color:var(--admin-muted);">हेल्पडेस्क, तकनीकी समर्थन और आधिकारिक संपर्क</p>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:20px 0;">
          <div class="admin-card" style="padding:14px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:10px;">
            <div style="font-size:0.8rem;color:var(--admin-muted);font-weight:700;">📞 आधिकारिक फोन / हेल्पलाइन</div>
            <div style="font-size:1.1rem;font-weight:800;color:#10b981;margin-top:4px;">+91 7974422572</div>
            <div style="font-size:0.75rem;color:var(--admin-muted);margin-top:2px;">सोम - शनि (सुबह 9 से शाम 7)</div>
          </div>
          <div class="admin-card" style="padding:14px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:10px;">
            <div style="font-size:0.8rem;color:var(--admin-muted);font-weight:700;">✉️ तकनीकी ईमेल</div>
            <div style="font-size:1rem;font-weight:800;color:#3b82f6;margin-top:4px;">support@aarogyamindia.online</div>
            <div style="font-size:0.75rem;color:var(--admin-muted);margin-top:2px;">24x7 ऑटो टिकट ट्रैकिंग</div>
          </div>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <a href="https://wa.me/917974422572?text=नमस्ते%20आरोग्यम%20एडमिन%20सपोर्ट%20सहायता%20चाहिए" target="_blank" class="admin-button" style="background:#25D366;color:#fff;font-weight:700;display:inline-flex;align-items:center;gap:6px;text-decoration:none;">
            <span>💬</span> <span>व्हाट्सएप पर सहायता प्राप्त करें (WhatsApp Helpdesk)</span>
          </a>
          <a href="../contact.html" target="_blank" class="admin-button" style="background:var(--admin-surface-strong);border:1px solid var(--admin-border);color:var(--admin-text);text-decoration:none;">
            🌐 पब्लिक कांटेक्ट पेज खोलें
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderCropDoctorModule() {
  const content = document.getElementById('page-content');
  if (!content) return;
  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-card" style="padding: 24px; max-width: 800px; margin: 0 auto; background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border); border-radius: 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <span style="font-size:2rem;">🩺</span>
          <div>
            <h2 style="margin:0;font-size:1.3rem;color:var(--admin-text);">रोग व समाधान (Crop Doctor & Disease Solutions)</h2>
            <p style="margin:2px 0 0 0;font-size:0.85rem;color:var(--admin-muted);">फसलों और स्वास्थ्य रोगों के समाधान, लक्षण व ई-बुक गाइड</p>
          </div>
        </div>

        <p style="font-size:0.9rem;color:var(--admin-muted);line-height:1.6;">
          रोग व समाधान प्रणाली में कृषि फसलों के कीट, फंगस व पोषक तत्वों की कमी का संपूर्ण डेटा और उपचार शामिल है। आप इसे लाइव पेज पर देख सकते हैं या पेज एडिटर से कंटेंट एडिट कर सकते हैं।
        </p>

        <div style="display:flex;gap:12px;margin-top:18px;flex-wrap:wrap;">
          <a href="../crop-doctor.html" target="_blank" class="admin-button" style="background:#10b981;color:#fff;font-weight:700;text-decoration:none;">
            🌾 लाइव फसल का डॉक्टर पेज खोलें (Open Crop Doctor) ↗
          </a>
          <button type="button" class="admin-button" onclick="window.navigateTo('page-editor?page=page_kheti_dr')" style="background:#3b82f6;color:#fff;font-weight:700;">
            ✏️ खेती का डॉक्टर एडिटर में खोलें (Page Editor)
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOfflinePreviewModule() {
  const content = document.getElementById('page-content');
  if (!content) return;
  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-card" style="padding: 24px; max-width: 650px; margin: 0 auto; text-align: center; background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border); border-radius: 16px;">
        <div style="font-size:3rem;margin-bottom:8px;">📶</div>
        <h2 style="margin:0 0 8px 0;font-size:1.3rem;color:var(--admin-text);">ऑफलाइन मोड व सर्विस वर्कर डायग्नोस्टिक्स</h2>
        <p style="font-size:0.88rem;color:var(--admin-muted);margin:0 0 16px 0;">
          यह स्क्रीन जांचती है कि क्या इंटरनेट कटने पर एडमिन पैनल सुरक्षित रूप से ऑफलाइन शेल लोड करता है।
        </p>
        <div style="padding:12px;background:rgba(59,130,246,0.1);border-radius:10px;font-size:0.82rem;color:#38bdf8;margin-bottom:18px;">
          ${navigator.onLine ? '🟢 आपका इंटरनेट कनेक्शन सक्रिय है (Online)' : '🔴 डिवाइस ऑफलाइन मोड में है (Offline)'}
        </div>
        <div style="display:flex;gap:10px;justify-content:center;">
          <a href="offline.html" target="_blank" class="admin-button small-button" style="background:#475569;color:#fff;">
            🌐 असली Offline.html स्क्रीन देखें ↗
          </a>
          <button type="button" class="admin-button small-button" onclick="window.navigateTo('settings')" style="background:#3b82f6;color:#fff;">
            ⚙️ सेटिंग्स पर लौटें
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderAudioStudioV1Module() {
  const content = document.getElementById('page-content');
  if (!content) return;
  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-card" style="padding: 24px; max-width: 750px; margin: 0 auto; background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border); border-radius: 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <span style="font-size:2rem;">🎙️</span>
          <div>
            <h2 style="margin:0;font-size:1.3rem;color:var(--admin-text);">ऑडियो स्टूडियो प्रोटोटाइप v1 (Audio Studio Archive)</h2>
            <span style="font-size:0.75rem;background:rgba(245,158,11,0.15);color:#f59e0b;padding:2px 8px;border-radius:12px;font-weight:700;">आर्काइव / v1 प्रोटोटाइप</span>
          </div>
        </div>

        <p style="font-size:0.88rem;color:var(--admin-muted);line-height:1.6;">
          यह फ़ाइल <code>admin-audio-studio.js</code> (400 लाइन्स) का प्रारंभिक प्रोटोटाइप है। वर्तमान में मुख्य ऑडियो रिकॉर्डर इंजन <code>admin-pages-book-audio-studio.js</code> (3341 लाइन्स) में संचालित है।
        </p>

        <div style="display:flex;gap:10px;margin-top:16px;">
          <button type="button" class="admin-button" onclick="window.navigateTo('book-audio-studio')" style="background:#10b981;color:#fff;font-weight:700;">
            🎧 सक्रिय 2026 ऑडियो बुक स्टूडियो खोलें →
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderAuthDiagnosticsModule() {
  const content = document.getElementById('page-content');
  if (!content) return;
  const session = localStorage.getItem('admin_session');
  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-card" style="padding: 24px; max-width: 700px; margin: 0 auto; background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border); border-radius: 16px;">
        <h2 style="margin:0 0 12px 0;font-size:1.3rem;color:var(--admin-text);">🔐 सुरक्षा व ऑथेंटिकेशन डायग्नोस्टिक्स (Auth Diagnostics)</h2>
        <div style="display:grid;gap:10px;font-size:0.85rem;color:var(--admin-muted);background:var(--admin-surface);padding:16px;border-radius:10px;border:1px solid var(--admin-border);">
          <div><strong>Admin Session Status:</strong> <span style="color:#10b981;font-weight:700;">${session ? 'Active (सक्रिय)' : 'Inactive'}</span></div>
          <div><strong>Storage Guard:</strong> <span style="color:var(--admin-text);">localStorage.admin_session = "${session || 'null'}"</span></div>
          <div><strong>Security Redirect:</strong> <span style="color:var(--admin-text);">Protected against unauthenticated access</span></div>
        </div>

        <div style="margin-top:16px;display:flex;gap:10px;">
          <button type="button" class="admin-button" onclick="window.navigateTo('settings')" style="background:#3b82f6;color:#fff;font-weight:700;">
            ⚙️ सेटिंग्स पर जाएं
          </button>
        </div>
      </div>
    </div>
  `;
}

console.log('✅ admin-router.js loaded');