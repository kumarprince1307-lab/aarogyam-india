/* Aarogyam India Admin PWA Controller (V1)
   Responsibilities:
   - Registers isolated Admin Service Worker (/admin/admin-sw.js)
   - Captures native install prompts (Desktop & Android)
   - Manages smart Dashboard PWA card state
   - Manages Network Connectivity (Online/Offline) sync banner
   - Provides clear Uninstall Guidance Modal
*/

let deferredPrompt = null;
let isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export function initAdminPwa() {
  registerAdminServiceWorker();
  initInstallPromptCapture();
  initNetworkStatusListener();
  renderUninstallModalHtml();
}

function registerAdminServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/admin/admin-sw.js', { scope: '/admin/' })
        .then((reg) => {
          console.log('✅ [Admin PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('⚠️ [Admin PWA] Service Worker registration failed:', err);
        });
    });
  }
}

function initInstallPromptCapture() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 [Admin PWA] Native install prompt captured');
    updatePwaDashboardCard();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    isStandalone = true;
    console.log('🎉 [Admin PWA] App was successfully installed!');
    updatePwaDashboardCard();
  });

  // Watch for display-mode changes
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
    isStandalone = evt.matches;
    updatePwaDashboardCard();
  });
}

export function renderAdminPwaCard() {
  if (isStandalone) {
    return `
      <div class="admin-card pwa-smart-card pwa-installed">
        <div class="pwa-card-header">
          <div class="pwa-icon-box">✓</div>
          <div>
            <h3 class="pwa-card-title">Admin App Installed</h3>
            <p class="pwa-card-desc">Aarogyam India Admin standalone मोड में सक्रिय है।</p>
          </div>
        </div>
        <div class="pwa-card-actions">
          <button id="btn-pwa-open" class="admin-button small-button pwa-btn-primary">
            🚀 Open Dashboard
          </button>
          <button id="btn-pwa-uninstall" class="admin-button small-button pwa-btn-secondary">
            🗑️ Remove / Uninstall
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="admin-card pwa-smart-card">
      <div class="pwa-card-header">
        <div class="pwa-icon-box">📱</div>
        <div>
          <h3 class="pwa-card-title">Admin App</h3>
          <p class="pwa-card-desc">Aarogyam India Admin को App की तरह अपने डिवाइस (Desktop/Android) में इस्तेमाल करें।</p>
        </div>
      </div>
      <div class="pwa-card-actions">
        <button id="btn-pwa-install" class="admin-button pwa-btn-primary" ${deferredPrompt ? '' : 'title="Browser menu से Install App चुनें"'}>
          ⬇️ Install Admin App
        </button>
      </div>
    </div>
  `;
}

export function attachPwaCardListeners(container) {
  if (!container) return;

  const btnInstall = container.querySelector('#btn-pwa-install');
  const btnUninstall = container.querySelector('#btn-pwa-uninstall');
  const btnOpen = container.querySelector('#btn-pwa-open');

  btnInstall?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[Admin PWA] Install prompt outcome: ${outcome}`);
      deferredPrompt = null;
      updatePwaDashboardCard();
    } else {
      // Fallback instruction for browsers without direct prompt exposure
      alert('Aarogyam India Admin App इंस्टॉल करने के लिए अपने ब्राउज़र मेनू (⋮) में जाकर "Install App" या "Add to Home screen" चुनें।');
    }
  });

  btnUninstall?.addEventListener('click', () => {
    showUninstallModal();
  });

  btnOpen?.addEventListener('click', () => {
    window.location.hash = 'dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function updatePwaDashboardCard() {
  const container = document.getElementById('admin-pwa-card-container');
  if (container) {
    container.innerHTML = renderAdminPwaCard();
    attachPwaCardListeners(container);
  }
}

// --- Network Status Sync Banner ---
function initNetworkStatusListener() {
  window.addEventListener('offline', () => {
    showNetworkBanner(false);
  });

  window.addEventListener('online', () => {
    showNetworkBanner(true);
  });

  if (!navigator.onLine) {
    showNetworkBanner(false);
  }
}

function showNetworkBanner(isOnline) {
  let banner = document.getElementById('admin-network-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'admin-network-banner';
    banner.className = 'admin-network-banner';
    document.body.prepend(banner);
  }

  if (!isOnline) {
    banner.className = 'admin-network-banner offline';
    banner.innerHTML = `<span>⚠️ Offline Mode — Live data unavailable. Admin App Shell is active.</span>`;
    banner.style.display = 'flex';
  } else {
    banner.className = 'admin-network-banner online';
    banner.innerHTML = `<span>✅ Back Online — Syncing live data...</span>`;
    banner.style.display = 'flex';
    setTimeout(() => {
      // Trigger notification and dashboard refresh
      document.dispatchEvent(new CustomEvent('admin:notifications-updated'));
      banner.style.display = 'none';
    }, 2200);
  }
}

// --- Uninstall Guidance Modal ---
function renderUninstallModalHtml() {
  if (document.getElementById('pwa-uninstall-modal-overlay')) return;

  const modal = document.createElement('div');
  modal.id = 'pwa-uninstall-modal-overlay';
  modal.className = 'admin-modal-overlay';
  modal.style.display = 'none';

  modal.innerHTML = `
    <div class="admin-modal-card">
      <div class="admin-modal-header">
        <h3 style="margin: 0; font-size: 1.2rem; color: var(--admin-text, #f8fafc);">Remove / Uninstall Admin App</h3>
        <button id="btn-close-uninstall-modal" class="admin-modal-close">&times;</button>
      </div>
      <div class="admin-modal-body" style="padding: 16px 0; font-size: 0.92rem; color: var(--admin-muted, #94a3b8); line-height: 1.6;">
        <p style="margin-top: 0;">Admin App को हटाने के लिए अपने डिवाइस के अनुसार नीचे दिए गए आसान निर्देश का पालन करें:</p>
        <div style="background: var(--admin-surface-strong, #0f172a); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--admin-border, #334155); margin-bottom: 12px;">
          <strong style="color: var(--admin-text, #f8fafc); display: block; margin-bottom: 4px;">📱 Android Users:</strong>
          Home Screen पर <strong>Admin</strong> ऐप आइकॉन को दबाकर रखें (Long Press) और <strong>Uninstall</strong> चुनें।
        </div>
        <div style="background: var(--admin-surface-strong, #0f172a); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--admin-border, #334155);">
          <strong style="color: var(--admin-text, #f8fafc); display: block; margin-bottom: 4px;">💻 Desktop (Chrome/Edge):</strong>
          Admin App विंडो के ऊपर दाएँ कोने में 3-डॉट मेनू (⋮) पर क्लिक करें और <strong>"Uninstall Aarogyam India Admin..."</strong> चुनें।
        </div>
      </div>
      <div class="admin-modal-footer" style="display: flex; justify-content: flex-end; margin-top: 8px;">
        <button id="btn-dismiss-uninstall-modal" class="admin-button pwa-btn-primary">ठीक है (Got It)</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const btnClose = modal.querySelector('#btn-close-uninstall-modal');
  const btnDismiss = modal.querySelector('#btn-dismiss-uninstall-modal');

  const closeModal = () => { modal.style.display = 'none'; };
  btnClose?.addEventListener('click', closeModal);
  btnDismiss?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function showUninstallModal() {
  const modal = document.getElementById('pwa-uninstall-modal-overlay');
  if (modal) modal.style.display = 'flex';
}
