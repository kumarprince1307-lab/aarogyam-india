/* Admin Downloads Page */

import { initAdminLayout } from './admin-main.js';
import { fetchDownloads } from './admin-api.js';

let currentDownloadsData = []; // For CSV export

function renderDownloadRow(item) {
  return `
    <tr>
      <td>${item.book}</td>
      <td>${item.downloads}</td>
      <td>${item.users}</td>
      <td>${item.lastDownloaded}</td>
    </tr>
  `;
}

function renderDownloadsTable(data) {
  currentDownloadsData = data; // Store for export
  if (!data || data.length === 0) {
    return '<div class="admin-empty"><strong>No download activity available.</strong><br>Try again later.</div>';
  }
  return `
    <div class="admin-table-wrapper sticky-header-table">
      <table class="admin-table">
        <thead>
          <tr><th>Book</th><th>Downloads</th><th>Users</th><th>Last Downloaded</th></tr>
        </thead>
        <tbody>${data.map(renderDownloadRow).join('')}</tbody>
      </table>
    </div>`;
}

export async function initDownloads() {
  // Render layout placeholders inside single-page app's page-content
  initAdminLayout('Downloads', 'Track download activity and book popularity.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-card admin-controls">
        <div class="admin-section-title" style="margin-bottom: 0; flex-grow: 1;">Downloads</div>
        <button id="export-csv-btn" class="admin-button">Export CSV</button>
      </div>
      <div id="downloads-table"></div>
    </div>
  `;

  const container = document.getElementById('downloads-table');
  const exportBtn = document.getElementById('export-csv-btn');
  if (!container) return;
  container.innerHTML = '<div class="admin-loading">Loading downloads…</div>';

  function exportToCsv() {
    if (currentDownloadsData.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = ["Book", "Total Downloads", "Unique Users", "Last Downloaded"];
    const rows = currentDownloadsData.map(d => [
        `"${(d.book || '').replace(/"/g, '""')}"`,
        d.downloads || 0,
        d.users || 0,
        `"${d.lastDownloaded || ''}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `aarogyam_downloads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (exportBtn) exportBtn.addEventListener('click', exportToCsv);

  const result = await fetchDownloads();
  container.innerHTML = result.success ? renderDownloadsTable(result.data) : '<div class="admin-error"><strong>Unable to load downloads.</strong></div>';
}

// TODO: add download source breakdown and retention metrics
