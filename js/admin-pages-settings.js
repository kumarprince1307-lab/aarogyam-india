/* Admin Settings Page (V1 placeholder)
   Exposes initSettings used by admin-router.js
*/
import { initAdminLayout } from './admin-main.js';

export async function initSettings() {
  initAdminLayout('Settings', 'Admin settings and feature flag configuration (UI-only, Phase-1).');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-title">Settings</div>
      <div class="admin-card">
        <p>Settings UI (Phase-1). No active configuration changes are performed in this version.</p>
        <div class="admin-controls" style="margin-top:12px;">
          <div class="admin-card">Feature flags and configuration will appear here in Phase-2.</div>
          <div class="admin-card">User roles and permissions UI will be added in Phase-2.</div>
        </div>
      </div>
    </div>
  `;
}
