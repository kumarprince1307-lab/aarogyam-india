/* Admin KPI Component (V1 skeleton) */

export function renderKpi(containerId = 'kpi-cards', kpis = []) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = (kpis.length === 0)
    ? '<div class="admin-card">KPIs will appear here (Phase-2)</div>'
    : kpis.map(k => `<div class="admin-card"><strong>${k.label}</strong><div>${k.value}</div></div>`).join('');
}

// TODO: integrate with charting library in Phase-2
