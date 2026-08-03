/*
  Admin Dashboard (V1 skeleton)
  - Phase-1 safe skeleton only. This file is intentionally inert and is NOT imported by any public pages.
  - Purpose: placeholder for admin dashboard initialization and basic read-only helpers.

  TODOs for Phase-2 (only as comments):
  - Add read-only data fetch helpers that call js/supabase.js read-only functions.
  - Render basic KPIs: total_users, total_purchases, revenue, purchases_by_source.
  - Add CSV export and filters. Keep admin pages separate from public UI.
*/

(function (window) {
  'use strict';

  async function initAdminDashboard() {
    try {
      // Check for a local session profile; do not perform privileged checks here.
      const profile = (window.ADMIN_AUTH && typeof window.ADMIN_AUTH.checkAdminProfile === 'function')
        ? window.ADMIN_AUTH.checkAdminProfile()
        : null;

      if (!profile) {
        console.log('admin-dashboard: no local profile found (skeleton). Admin pages should perform server-side checks in Phase-2.');
        return;
      }

      console.log('admin-dashboard: profile present (skeleton)', { id: profile.id, mobile: profile.mobile });

      // Phase-2: call read-only helpers to fetch metrics and render dashboard.

    } catch (err) {
      console.error('admin-dashboard init error', err);
    }
  }

  // Expose API
  window.ADMIN_DASHBOARD = {
    init: initAdminDashboard
  };

  console.log('✅ admin-dashboard.js (skeleton) loaded');

})(window);
