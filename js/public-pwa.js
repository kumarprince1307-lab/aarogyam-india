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
  lockScreenOrientationPortrait();
  initFloatingInstallBar();
}

function initFloatingInstallBar() {
  if (isStandalone || document.getElementById('pwa-floating-install-bar') || window.location.pathname.includes('/admin/')) return;

  // Check if dismissed in last 7 days
  try {
    const dismissedTs = parseInt(localStorage.getItem('AIM_PWA_FLOATER_DISMISSED') || '0', 10);
    if (Date.now() - dismissedTs < 7 * 24 * 60 * 60 * 1000) return;
  } catch (e) {}

  setTimeout(() => {
    if (isStandalone || document.getElementById('pwa-floating-install-bar')) return;

    const floater = document.createElement('div');
    floater.id = 'pwa-floating-install-bar';
    floater.className = 'pwa-floating-install-bar';
    floater.innerHTML = `
      <style>
        .pwa-floating-install-bar {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(120px);
          z-index: 9995;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(34, 197, 94, 0.35);
          border-radius: 50px;
          padding: 8px 14px 8px 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.45), 0 0 20px rgba(34, 197, 94, 0.2);
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 92vw;
          width: auto;
        }
        .pwa-floating-install-bar.show {
          transform: translateX(-50%) translateY(0);
        }
        .pwa-floater-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(22, 163, 74, 0.4);
        }
        .pwa-floater-text {
          font-size: 0.82rem;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1.25;
          white-space: nowrap;
        }
        .pwa-floater-text small {
          display: block;
          font-size: 0.7rem;
          font-weight: 500;
          color: #86efac;
        }
        .pwa-floater-install-btn {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #ffffff;
          border: none;
          border-radius: 30px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35);
          transition: transform 0.2s ease;
        }
        .pwa-floater-install-btn:hover {
          transform: scale(1.05);
        }
        .pwa-floater-close-btn {
          background: rgba(255,255,255,0.1);
          color: #94a3b8;
          border: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .pwa-floater-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        @media (max-width: 640px) {
          .pwa-floating-install-bar {
            bottom: 75px;
          }
        }
      </style>
      <div class="pwa-floater-icon">📱</div>
      <div class="pwa-floater-text">
        आरोग्यम इंडिया ऐप
        <small>1-Click Fast Install</small>
      </div>
      <button type="button" class="pwa-floater-install-btn" id="pwa-floater-act-btn">इंस्टॉल करें</button>
      <button type="button" class="pwa-floater-close-btn" id="pwa-floater-dismiss-btn" title="बंद करें">✕</button>
    `;

    document.body.appendChild(floater);
    requestAnimationFrame(() => {
      floater.classList.add('show');
    });

    const installActBtn = document.getElementById('pwa-floater-act-btn');
    if (installActBtn) {
      installActBtn.addEventListener('click', (e) => {
        handleInstallClick(e);
        floater.classList.remove('show');
        setTimeout(() => floater.remove(), 400);
      });
    }

    const dismissBtn = document.getElementById('pwa-floater-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        try {
          localStorage.setItem('AIM_PWA_FLOATER_DISMISSED', Date.now().toString());
        } catch (e) {}
        floater.classList.remove('show');
        setTimeout(() => floater.remove(), 400);
      });
    }
  }, 4000);
}

function lockScreenOrientationPortrait() {
  const tryLock = () => {
    try {
      if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
        window.screen.orientation.lock('portrait-primary')
          .catch(() => window.screen.orientation.lock('portrait').catch(() => {}));
      }
    } catch (e) {}
  };

  tryLock();

  // Retry locking upon first user interaction and fullscreen changes
  window.addEventListener('orientationchange', tryLock, { passive: true });
  document.addEventListener('fullscreenchange', tryLock, { passive: true });
  document.addEventListener('touchstart', tryLock, { once: true, passive: true });
  document.addEventListener('click', tryLock, { once: true, passive: true });
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
    if (typeof window === 'undefined') return;

    let userId = null;
    let userMobile = null;

    if (window.V1_SESSION) {
      if (typeof window.V1_SESSION.getUserId === 'function') userId = window.V1_SESSION.getUserId();
      if (typeof window.V1_SESSION.getCurrentUser === 'function') {
        const cu = window.V1_SESSION.getCurrentUser();
        if (cu) {
          if (!userId) userId = cu.id || cu.userId;
          if (!userMobile) userMobile = cu.mobile;
        }
      }
    }

    const rawUser = localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('AI_SESSION');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (!userId) userId = parsed.id || parsed.user_id || parsed.userId;
        if (!userMobile) userMobile = parsed.mobile;
      } catch(e) {}
    }

    const db = window.dbClient || (window.supabase && typeof window.supabase.from === 'function' ? window.supabase : null);
    if (!db) {
      setTimeout(syncAppInstallToSupabase, 1000);
      return;
    }

    // Update existing registration_source column to 'pwa'
    if (userId) {
      const { error } = await db.from('profiles').update({
        registration_source: 'pwa'
      }).eq('id', userId);
      if (!error) {
        console.log('📱 [PWA Track] Synced App Install (pwa) for user:', userId);
      }
      try {
        await db.from('profiles').update({
          app_installed: true,
          app_installed_at: new Date().toISOString()
        }).eq('id', userId);
      } catch(e) {}
    } else if (userMobile) {
      const cleanMobile = String(userMobile).replace(/\D/g, '').slice(-10);
      if (cleanMobile.length === 10) {
        const { error } = await db.from('profiles').update({
          registration_source: 'pwa'
        }).eq('mobile', cleanMobile);
        if (!error) {
          console.log('📱 [PWA Track] Synced App Install (pwa) for mobile:', cleanMobile);
        }
        try {
          await db.from('profiles').update({
            app_installed: true,
            app_installed_at: new Date().toISOString()
          }).eq('mobile', cleanMobile);
        } catch(e) {}
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

  if (desktopBtn) {
    desktopBtn.style.display = ''; // Clear inline style so CSS controls desktop/mobile display
  }

  if (isStandalone) {
    // App is running in standalone mode
    if (desktopBtn) {
      desktopBtn.innerHTML = '<span>✓</span> App Installed';
      desktopBtn.classList.add('pwa-installed-btn');
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
    banner.innerHTML = `<span>🌾 ऑफ़लाइन मोड — पहले से खोली गई पुस्तकें व ऑडियो बिना इंटरनेट उपलब्ध हैं।</span>`;
    banner.style.display = 'flex';
  } else {
    banner.className = 'public-network-banner online';
    banner.innerHTML = `<span>✅ इंटरनेट कनेक्टेड — लाइव सिंक सक्रिय है।</span>`;
    banner.style.display = 'flex';
    setTimeout(() => {
      banner.style.display = 'none';
    }, 2500);
  }
}

// --- Background Idle Asset Pre-Fetcher (Zero-Egress Precache) ---
function initBackgroundIdlePrefetch() {
  if (window.location.pathname.includes('/admin/')) return;

  const runPrefetch = () => {
    try {
      fetch('/data/books.json').then(r => r.json()).then(data => {
        const books = data.books || [];
        const topBooks = books.slice(0, 8);
        topBooks.forEach(b => {
          if (b.cover) {
            const img = new Image();
            img.src = b.cover;
          }
          if (b.thumbnail && b.thumbnail !== b.cover) {
            const tImg = new Image();
            tImg.src = b.thumbnail;
          }
        });
      }).catch(() => {});
    } catch(e) {}
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(runPrefetch, { timeout: 4000 });
  } else {
    setTimeout(runPrefetch, 2500);
  }
}

// --- Universal IndexedDB Offline Cache Helper ---
window.AarogyamOfflineDB = {
  dbName: 'AarogyamOfflineStore',
  dbVersion: 1,
  open: function() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open(this.dbName, this.dbVersion);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('offline_books')) {
          db.createObjectStore('offline_books', { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    });
  },
  saveBook: async function(bookId, bookData) {
    const db = await this.open();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('offline_books', 'readwrite');
        const store = tx.objectStore('offline_books');
        store.put({ id: bookId, data: bookData, updated_at: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch(e) { resolve(false); }
    });
  },
  getBook: async function(bookId) {
    const db = await this.open();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('offline_books', 'readonly');
        const store = tx.objectStore('offline_books');
        const req = store.get(bookId);
        req.onsuccess = () => resolve(req.result?.data || null);
        req.onerror = () => resolve(null);
      } catch(e) { resolve(null); }
    });
  }
};

setTimeout(initBackgroundIdlePrefetch, 1500);

console.log('✅ public-pwa.js V7 loaded with Deep Offline Caching & IndexedDB');
