/* Admin Downloads Page */

import { initAdminLayout } from './admin-main.js';
import { fetchDownloads } from './admin-api.js';

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
  if (!data || data.length === 0) {
    return '<div class="admin-empty"><strong>No download activity available.</strong><br>Try again later.</div>';
  }
  return `
    <div class="admin-table-wrapper">
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
      <div class="admin-section-title">Downloads</div>
      <div id="downloads-table"></div>
    </div>
  `;

  const container = document.getElementById('downloads-table');
  if (!container) return;
  container.innerHTML = '<div class="admin-loading">Loading downloads…</div>';

  const result = await fetchDownloads();
  container.innerHTML = result.success ? renderDownloadsTable(result.data) : '<div class="admin-error"><strong>Unable to load downloads.</strong></div>';
}

// TODO: add download source breakdown and retention metrics
