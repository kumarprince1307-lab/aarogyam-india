/* Aarogyam India - Universal Public PWA Controller (V1)
   Responsibilities:
   - Registers dedicated Public Service Worker (/sw.js)
   - Captures native install prompts (Desktop & Android Chrome/Edge)
   - Updates Desktop Header, Mobile Menu Drawer & My Library install buttons
   - Detects standalone / installed state dynamically
   - Monitors online/offline network connectivity
*/

let deferredPrompt = null;
let isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPublicPwa);
} else {
  initPublicPwa();
}

export function initPublicPwa() {
  registerPublicServiceWorker();
  initInstallPromptCapture();
  initNetworkStatusListener();
  ensureMobileMenuInstallButton();
  bindInstallButtons();
  setupMenuEventListeners();
}

function setupMenuEventListeners() {
  // Guarantee presence whenever user interacts with mobile menu toggles
  document.addEventListener('click', (e) => {
    if (e.target.closest('#menuBtn, .menu-btn, .menu-button, .hamburger, [onclick*="toggleMenu"]')) {
      setTimeout(() => {
        ensureMobileMenuInstallButton();
        bindInstallButtons();
      }, 50);
    }
  });
}

// Global window reference
if (typeof window !== 'undefined') {
  window.AAROGYAM_PWA = {
    init: initPublicPwa,
    update: updateAllInstallButtons,
    prompt: handleInstallClick
  };
}

function ensureMobileMenuInstallButton() {
  // If button already exists, do nothing
  if (document.getElementById('mobile-pwa-install-btn')) return;

  // Search for the mobile menu / drawer container on the page
  const mobileMenu = document.querySelector('#mobileMenu, .mobile-menu, #sideMenu, .side-menu');
  if (!mobileMenu) return;

  const btnWrapper = document.createElement('div');
  btnWrapper.className = 'pwa-mobile-menu-wrapper';
  btnWrapper.style.padding = '0 15px 10px 15px';
  btnWrapper.innerHTML = `
    <button id="mobile-pwa-install-btn" class="mobile-pwa-install-btn" style="display: flex;">
      <span>📱</span> Install App
    </button>
  `;

  // Find the cleanest insertion point
  const loginPrompt = mobileMenu.querySelector('#mobile-login-prompt, .mobile-login-prompt');
  const userCard = mobileMenu.querySelector('#mobile-user-card, .mobile-user-card');
  const navList = mobileMenu.querySelector('.mobile-nav, .side-menu ul, ul');

  if (loginPrompt && loginPrompt.parentNode) {
    loginPrompt.parentNode.insertBefore(btnWrapper, loginPrompt.nextSibling);
  } else if (userCard && userCard.parentNode) {
    userCard.parentNode.insertBefore(btnWrapper, userCard.nextSibling);
  } else if (navList && navList.parentNode) {
    navList.parentNode.insertBefore(btnWrapper, navList);
  } else {
    mobileMenu.appendChild(btnWrapper);
  }
}

function registerPublicServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('✅ [Public PWA] Service Worker registered, scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('⚠️ [Public PWA] Service Worker registration failed:', err);
        });
    });
  }
}

function initInstallPromptCapture() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 [Public PWA] Native install prompt captured');
    updateAllInstallButtons();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    isStandalone = true;
    console.log('🎉 [Public PWA] Aarogyam India App was successfully installed!');
    updateAllInstallButtons();
    syncAppInstallToSupabase();
  });

  if (isStandalone) {
    syncAppInstallToSupabase();
  }

  window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
    isStandalone = evt.matches;
    updateAllInstallButtons();
    if (isStandalone) {
      syncAppInstallToSupabase();
    }
  });
}

export async function syncAppInstallToSupabase() {
  try {
    let userId = null;
    if (typeof window !== 'undefined') {
      if (window.V1_SESSION && typeof window.V1_SESSION.getUserId === 'function') {
        userId = window.V1_SESSION.getUserId();
      }
      if (!userId) {
        const u = localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE');
        if (u) {
          try {
            const parsed = JSON.parse(u);
            userId = parsed.id || parsed.user_id || parsed.userId;
          } catch(e) {}
        }
      }
      if (!userId && window.supabaseClient && typeof window.supabaseClient.auth?.getUser === 'function') {
        const authRes = await window.supabaseClient.auth.getUser();
        userId = authRes?.data?.user?.id;
      }
      if (userId && (window.dbClient || window.supabaseClient)) {
        const db = window.dbClient || window.supabaseClient;
        await db.from('profiles').update({
          app_installed: true,
          app_installed_at: new Date().toISOString()
        }).eq('id', userId);
        console.log('📱 [PWA Track] Synced app_installed = true to Supabase profile for user:', userId);
      }
    }
  } catch (err) {
    console.warn('[PWA Track] App install sync note:', err.message);
  }
}

export function bindInstallButtons() {
  ensureMobileMenuInstallButton();

  const desktopBtn = document.getElementById('desktop-pwa-install-btn');
  const mobileBtn = document.getElementById('mobile-pwa-install-btn');
  const libraryBtn = document.getElementById('library-pwa-install-btn');
  const libraryCard = document.getElementById('library-pwa-card');

  const buttons = [desktopBtn, mobileBtn, libraryBtn].filter(Boolean);

  buttons.forEach((btn) => {
    btn.onclick = handleInstallClick;
  });

  updateAllInstallButtons();
}

export function updateAllInstallButtons() {
  const desktopBtn = document.getElementById('desktop-pwa-install-btn');
  const mobileBtn = document.getElementById('mobile-pwa-install-btn');
  const libraryBtn = document.getElementById('library-pwa-install-btn');
  const libraryCard = document.getElementById('library-pwa-card');

  if (isStandalone) {
    // App is running in standalone mode
    if (desktopBtn) {
      desktopBtn.innerHTML = '<span>✓</span> App Installed';
      desktopBtn.classList.add('pwa-installed-btn');
      desktopBtn.style.display = 'inline-flex';
    }
    if (mobileBtn) {
      mobileBtn.innerHTML = '<span>✓</span> App Installed';
      mobileBtn.classList.add('pwa-installed-btn');
      mobileBtn.style.display = 'flex';
    }
    if (libraryCard) {
      libraryCard.style.display = 'none'; // Don't nag user inside installed app
    }
  } else {
    // Browser mode
    if (desktopBtn) {
      desktopBtn.innerHTML = '<span>📱</span> Install App';
      desktopBtn.classList.remove('pwa-installed-btn');
      desktopBtn.style.display = 'inline-flex';
    }
    if (mobileBtn) {
      mobileBtn.innerHTML = '<span>📱</span> Install App';
      mobileBtn.classList.remove('pwa-installed-btn');
      mobileBtn.style.display = 'flex';
    }
    if (libraryCard) {
      libraryCard.style.display = 'block';
    }
    if (libraryBtn) {
      libraryBtn.innerHTML = '<span>📱</span> Install App Now';
    }
  }
}

async function handleInstallClick(e) {
  if (e) e.preventDefault();

  if (isStandalone) {
    // Already in standalone
    alert('Aarogyam India App पहले से आपके डिवाइस में स्थापित (Installed) है।');
    return;
  }

  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[Public PWA] Install prompt outcome: ${outcome}`);
    deferredPrompt = null;
    updateAllInstallButtons();
  } else {
    // Show instruction for iOS Safari / older browsers
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      alert('iPhone/iPad पर इंस्टॉल करने के लिए:\n1. नीचे Share बटन (⬆) दबाएँ।\n2. "Add to Home Screen" (+) चुनें।');
    } else {
      alert('Aarogyam India App इंस्टॉल करने के लिए अपने ब्राउज़र मेनू (⋮) में जाकर "Install App" या "Add to Home Screen" चुनें।');
    }
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
  let banner = document.getElementById('public-network-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'public-network-banner';
    banner.className = 'public-network-banner';
    document.body.prepend(banner);
  }

  if (!isOnline) {
    banner.className = 'public-network-banner offline';
    banner.innerHTML = `<span>⚠️ Offline Mode — Previously loaded pages are available. Live updates will sync once connected.</span>`;
    banner.style.display = 'flex';
  } else {
    banner.className = 'public-network-banner online';
    banner.innerHTML = `<span>✅ Back Online — Live connection restored.</span>`;
    banner.style.display = 'flex';
    setTimeout(() => {
      banner.style.display = 'none';
    }, 2500);
  }
}

console.log('✅ public-pwa.js loaded');
