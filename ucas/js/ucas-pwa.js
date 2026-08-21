/* ==========================================================================
   UCAS PWA MANAGER
   Manages isolated service worker registration and standalone installation.
   ========================================================================== */

(function (window) {
  'use strict';

  let deferredPrompt = null;

  function initPWA() {
    registerServiceWorker();
    listenForInstallPrompt();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/ucas/sw.js')
          .then((reg) => {
            console.log('✅ UCAS Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.log('UCAS Service Worker registration note:', err);
          });
      });
    }
  }

  function listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      const installBtn = document.getElementById('ucas-pwa-install-btn');
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ UCAS App was installed successfully');
      deferredPrompt = null;
      const installBtn = document.getElementById('ucas-pwa-install-btn');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    });
  }

  function triggerInstall() {
    if (!deferredPrompt) {
      window.UCAS_APP?.showToast('ऐप पहले से इंस्टॉल है या ब्राउज़र में सपोर्टेड नहीं है।', 'info');
      return;
    }

    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the UCAS install prompt');
      }
      deferredPrompt = null;
    });
  }

  window.UCAS_PWA = {
    init: initPWA,
    triggerInstall
  };

  initPWA();
})(window);
