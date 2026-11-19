/**
 * ====================================================================
 * AAROGYAM INDIA — UNIVERSAL SOCIAL TOAST SYNC (COMPATIBILITY LAYER)
 * Loads and delegates directly to recent-purchase-toast.js
 * ====================================================================
 */
(function() {
  'use strict';
  if (window.renderLiveToastCardHtml) {
    return; // Already initialized by recent-purchase-toast.js
  }
  const script = document.createElement('script');
  script.src = '/js/recent-purchase-toast.js?v=' + (window.AAROGYAM_CACHE_BUST || Date.now());
  script.async = true;
  document.head.appendChild(script);
})();
