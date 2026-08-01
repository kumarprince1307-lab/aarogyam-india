/* Admin Data Table Component (V1 skeleton) */

export function renderTable(container, columns = [], rows = []) {
  if (typeof container === 'string') container = document.getElementById(container);
  if (!container) return;
  // Phase-1: simple placeholder render
  container.innerHTML = '<div class="admin-card">Data table placeholder (Phase-2)</div>';
}

// TODO: add sorting, paging, virtualized rows in Phase-2
