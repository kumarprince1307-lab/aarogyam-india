/**
 * ====================================================================
 * AAROGYAM INDIA — DYNAMIC SOCIAL PROOF & LIVE TOAST ENGINE (ALIAS)
 * Re-exports and ensures compatibility with /js/recent-purchase-toast.js
 * ====================================================================
 */
'use strict';
// If recent-purchase-toast.js is already loaded, window.renderLiveToastCardHtml is available.
if (!window.renderLiveToastCardHtml) {
  const script = document.createElement('script');
  script.src = '/js/recent-purchase-toast.js';
  document.head.appendChild(script);
}
