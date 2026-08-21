/* Admin App / PWA Management Page */

import { initAdminLayout } from './admin-main.js';
import { renderAdminPwaCard, attachPwaCardListeners } from './admin-pwa.js';

export async function initAdminApp() {
  initAdminLayout('Admin App', 'Install and manage the standalone Aarogyam India Admin Application.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-title">Aarogyam India Admin App (PWA)</div>
      
      <div id="admin-app-page-container" style="margin-bottom: 24px;">
        ${renderAdminPwaCard()}
      </div>

      <div class="admin-card" style="background: var(--admin-surface-2, #1e293b); border: 1px solid var(--admin-border, #334155); border-radius: 14px; padding: 22px; box-shadow: var(--admin-shadow);">
        <h4 style="margin: 0 0 14px 0; font-size: 1.05rem; color: var(--admin-text, #f8fafc); display: flex; align-items: center; gap: 8px;">
          <span>⚡</span> Admin App Features & Benefits
        </h4>
        <ul style="margin: 0; padding-left: 20px; color: var(--admin-muted, #94a3b8); font-size: 0.92rem; line-height: 1.8;">
          <li><strong>Standalone Full-Screen:</strong> बिना ब्राउज़र एड्रेस बार के सीधे ऐप विंडो में तेज़ और स्मूथ अनुभव।</li>
          <li><strong>Desktop & Android:</strong> Chrome, Edge और Android होम स्क्रीन पर सीधे 1-क्लिक में इंस्टॉल करें।</li>
          <li><strong>Offline Shell:</strong> नेटवर्क कनेक्शन न होने पर भी Admin App Shell तुरंत खुलता है।</li>
          <li><strong>Real-time Live Sync:</strong> ऑनलाइन आते ही सभी आंकड़े, यूज़र्स और नोटिफिकेशन्स लाइव सिंक होते हैं।</li>
          <li><strong>Official Identity:</strong> Aarogyam India के आधिकारिक लोगो और आइकन के साथ सुरक्षित।</li>
        </ul>
      </div>
    </div>
  `;

  attachPwaCardListeners(document.getElementById('admin-app-page-container'));
}
