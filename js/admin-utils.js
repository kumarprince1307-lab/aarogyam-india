/* Admin Utils (V1 skeleton)
   - Small reusable helper functions for admin UI
*/

export function formatCurrency(n) {
  return '₹' + (Number(n) || 0).toFixed(2);
}

export function noop() { }

// TODO: Add date formatting, CSV helpers in Phase-2
