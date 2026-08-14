/* Admin Notifications Page */
import { initAdminLayout } from './admin-main.js';

export async function initNotifications() {
  initAdminLayout('Notifications', 'View recent updates and alerts.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-title">Notifications</div>
      <div class="admin-card">
        <div class="admin-empty">
          <strong>Real-time notifications are being set up.</strong>
          <br>
          Important updates like new purchases and user registrations will appear here soon.
        </div>
      </div>
    </div>
  `;
}