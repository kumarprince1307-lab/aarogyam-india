/*
  Admin Auth (V1 skeleton)
  - Phase-1 safe skeleton only. This file is intentionally inert and is NOT imported by any public pages.
  - Purpose: provide a focused place for future admin-auth client logic. For V1 this file must not contain any privileged keys.

  TODOs for Phase-2 (only as comments):
  - Implement a secure server-side method or Supabase RLS check to verify admin role.
  - Avoid embedding service_role keys on the client. Use serverless endpoints or RLS with JWTs.
*/

(function (window) {
  'use strict';

  // V1 Session Guard: Redirect to login if no session exists.
  // This must run before any other admin logic.
  const isLoginPage = window.location.pathname.endsWith('/admin/login.html');
  const hasSession = localStorage.getItem('admin_session') === 'true';

  if (!hasSession && !isLoginPage) {
    window.location.href = 'login.html';
    return; // Stop further execution
  }

  /**
   * checkAdminProfile
   * - Lightweight helper that checks for the presence of the V1_SESSION object and returns profile info if present.
   * - This function does NOT perform privileged DB queries; it only reads local session data.
   * - Phase-2: replace or augment with server-side validation.
   * @returns {object|null} user profile object if present, otherwise null
   */
  function checkAdminProfile() {
    try {
      if (typeof V1_SESSION !== 'undefined' && typeof V1_SESSION.getCurrentUser === 'function') {
        return V1_SESSION.getCurrentUser();
      }
    } catch (e) {
      console.error('admin-auth: session read error', e);
    }
    return null;
  }

  // Expose minimal API for admin pages to use
  window.ADMIN_AUTH = {
    checkAdminProfile
  };

  console.log('✅ admin-auth.js (skeleton) loaded');

})(window);
