/* Admin Auth Client (V1 skeleton)
   - Lightweight client helpers that read local session only.
   - Must NOT contain service_role keys or privileged logic in client.
   - Phase-2: augment with server-side auth endpoints.
*/

export function getLocalAdminProfile() {
  if (typeof window.ADMIN_AUTH !== 'undefined' && typeof window.ADMIN_AUTH.checkAdminProfile === 'function') {
    return window.ADMIN_AUTH.checkAdminProfile();
  }
  return null;
}

export function isAdminLocal() {
  const p = getLocalAdminProfile();
  return !!(p && (p.is_admin || p.role === 'admin'));
}

// TODO(Phase-2): implement secure server-side validation
