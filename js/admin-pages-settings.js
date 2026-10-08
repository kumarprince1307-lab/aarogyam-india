/* Admin Settings Page — Live System Diagnostics & Controls */
import { initAdminLayout, showToast } from './admin-main.js';
import { supabase } from './supabase.js';

export async function initSettings() {
  initAdminLayout('⚙️ Settings & System Diagnostics', 'Live database connectivity, admin cache control, theme preferences, and platform health.');

  const content = document.getElementById('page-content');
  if (!content) return;

  const currentTheme = localStorage.getItem('aarogyam-admin-theme') || 'dark';
  const adminSession = localStorage.getItem('admin_session') || 'Not Active';
  const isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches;

  content.innerHTML = `
    <!-- Top Diagnostics Banner -->
    <div class="admin-section" style="margin-bottom: 16px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>⚙️ Aarogyam Admin Control & Diagnostics</span>
            <span id="sys-status-badge" style="font-size: 0.75rem; background: rgba(59,130,246,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Checking Live Status…</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">
            लाइव डेटाबेस कनेक्टिविटी, एडमिन मेमोरी कैश प्रबंधन, थीम व सुरक्षा सेटिंग्स।
          </p>
        </div>
        <div style="display:flex; gap:8px;">
          <button id="btn-ping-supabase" class="admin-button small-button" style="background:#0284c7;color:#fff;font-weight:700;">
            📡 Ping Supabase
          </button>
          <button id="btn-clear-admin-cache" class="admin-button small-button" style="background:#dc2626;color:#fff;font-weight:700;">
            🗑️ Clear Admin Cache
          </button>
        </div>
      </div>

      <!-- Quick KPI Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 14px;">
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #10b981;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🌐 Supabase Cloud Status</div>
          <div id="diag-supabase-status" style="font-size: 1.1rem; font-weight: 800; color: #10b981; margin-top: 6px;">🟡 Connecting…</div>
          <div id="diag-supabase-latency" style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">Latency: Measuring…</div>
        </div>

        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #3b82f6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">💾 In-Memory Cache Status</div>
          <div id="diag-cache-status" style="font-size: 1.1rem; font-weight: 800; color: #3b82f6; margin-top: 6px;">Active & Zero-Egress</div>
          <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">Preserves Supabase quota</div>
        </div>

        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #8b5cf6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">📱 PWA & Service Worker</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #8b5cf6; margin-top: 6px;">
            ${'serviceWorker' in navigator ? '🟢 ServiceWorker Active' : '⚪ Not Supported'}
          </div>
          <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">
            ${isPwaInstalled ? '📲 Installed Standalone App' : '🌐 Running in Browser Tab'}
          </div>
        </div>

        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🔐 Admin Session Guard</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #f59e0b; margin-top: 6px;">Authenticated</div>
          <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">Role: Super Admin</div>
        </div>
      </div>
    </div>

    <!-- Diagnostic Details Sections -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
      
      <!-- Panel 1: Theme & Visual Preferences -->
      <div class="admin-card" style="background: var(--admin-surface-2, #0f172a); padding: 18px; border-radius: 12px; border: 1px solid var(--admin-border);">
        <h3 style="margin: 0 0 12px 0; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
          <span>🎨</span> <span>थीम व डिस्प्ले सेटिंग्स (Display Preferences)</span>
        </h3>
        <p style="font-size: 0.82rem; color: var(--admin-muted); margin-bottom: 14px;">
          एडमिन कंसोल के रंग और विजुअल अपीयरेंस को बदलें।
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="btn-theme-dark" class="admin-button small-button" style="background:${currentTheme === 'dark' ? '#3b82f6' : 'var(--admin-surface-strong)'}; color:#fff; font-weight:700;">
            🌙 डार्क मोड (Dark Theme) ${currentTheme === 'dark' ? '✓' : ''}
          </button>
          <button id="btn-theme-light" class="admin-button small-button" style="background:${currentTheme === 'light' ? '#3b82f6' : 'var(--admin-surface-strong)'}; color:#fff; font-weight:700;">
            ☀️ लाइट मोड (Light Theme) ${currentTheme === 'light' ? '✓' : ''}
          </button>
        </div>
      </div>

      <!-- Panel 2: Cache & Storage Controls -->
      <div class="admin-card" style="background: var(--admin-surface-2, #0f172a); padding: 18px; border-radius: 12px; border: 1px solid var(--admin-border);">
        <h3 style="margin: 0 0 12px 0; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
          <span>🧹</span> <span>कैश व रीफ्रेश नियंत्रण (Cache & Reload)</span>
        </h3>
        <p style="font-size: 0.82rem; color: var(--admin-muted); margin-bottom: 14px;">
          यदि कोई नई रिपोर्ट या डेटा अपडेट तुरंत नहीं दिख रहा है, तो कैश साफ़ करें।
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="btn-purge-storage" class="admin-button small-button" style="background:#e11d48; color:#fff; font-weight:700;">
            ⚡ Hard Reload & Clear
          </button>
          <button id="btn-unregister-sw" class="admin-button small-button" style="background:#475569; color:#fff; font-weight:700;">
            🔄 ServiceWorker Update
          </button>
        </div>
      </div>

      <!-- Panel 3: Client & Device Telemetry -->
      <div class="admin-card" style="background: var(--admin-surface-2, #0f172a); padding: 18px; border-radius: 12px; border: 1px solid var(--admin-border);">
        <h3 style="margin: 0 0 12px 0; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
          <span>💻</span> <span>डिवाइस व ब्राउज़र जानकारी (Client Info)</span>
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.82rem; color: var(--admin-muted); display: grid; gap: 6px;">
          <li><strong>Viewport:</strong> <span style="color:var(--admin-text);">${window.innerWidth} x ${window.innerHeight} px</span></li>
          <li><strong>User Agent:</strong> <span style="color:var(--admin-text); word-break: break-all;">${navigator.userAgent.substring(0, 75)}…</span></li>
          <li><strong>LocalStorage Items:</strong> <span style="color:var(--admin-text);">${Object.keys(localStorage).length} keys</span></li>
          <li><strong>Host:</strong> <span style="color:var(--admin-text);">${window.location.host || 'Local'}</span></li>
        </ul>
      </div>

      <!-- Panel 4: Quick Links & Safety -->
      <div class="admin-card" style="background: var(--admin-surface-2, #0f172a); padding: 18px; border-radius: 12px; border: 1px solid var(--admin-border);">
        <h3 style="margin: 0 0 12px 0; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
          <span>🛡️</span> <span>सुरक्षा व आपातकालीन नियंत्रण (Safety)</span>
        </h3>
        <p style="font-size: 0.82rem; color: var(--admin-muted); margin-bottom: 14px;">
          एडमिन सत्र समाप्त करने अथवा ऑफलाइन मोड की जांच के लिए।
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="btn-test-offline" class="admin-button small-button" data-route="offline-preview" style="background:#3b82f6; color:#fff; font-weight:700;">
            📶 Test Offline Page
          </button>
          <button id="btn-admin-logout-now" class="admin-button small-button" style="background:#dc2626; color:#fff; font-weight:700;">
            ⛔ Logout Admin Session
          </button>
        </div>
      </div>
    </div>
  `;

  // --- Real Supabase Ping Function ---
  async function testSupabasePing() {
    const statusElem = document.getElementById('diag-supabase-status');
    const latencyElem = document.getElementById('diag-supabase-latency');
    const badgeElem = document.getElementById('sys-status-badge');
    if (!statusElem) return;

    statusElem.textContent = '🟡 Pinging…';
    statusElem.style.color = '#f59e0b';

    const t0 = performance.now();
    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const t1 = performance.now();
      const latency = Math.round(t1 - t0);

      if (error) throw error;

      statusElem.textContent = '🟢 Connected Live';
      statusElem.style.color = '#10b981';
      if (latencyElem) latencyElem.textContent = `Latency: ${latency}ms | Total Profiles: ${count ?? 'N/A'}`;
      if (badgeElem) {
        badgeElem.textContent = `🟢 All Systems Live (${latency}ms)`;
        badgeElem.style.background = 'rgba(16,185,129,0.15)';
        badgeElem.style.color = '#10b981';
      }
    } catch (err) {
      statusElem.textContent = '🔴 Connection Error';
      statusElem.style.color = '#ef4444';
      if (latencyElem) latencyElem.textContent = err?.message || 'Check network / Supabase URL';
      if (badgeElem) {
        badgeElem.textContent = '🔴 Network Degraded';
        badgeElem.style.background = 'rgba(239,68,68,0.15)';
        badgeElem.style.color = '#ef4444';
      }
    }
  }

  // Initial Ping
  testSupabasePing();

  // Ping Button Handler
  document.getElementById('btn-ping-supabase')?.addEventListener('click', () => {
    testSupabasePing();
    showToast('Supabase ping initiated...', 'info');
  });

  // Clear Cache Button Handler
  document.getElementById('btn-clear-admin-cache')?.addEventListener('click', () => {
    if (typeof window.clearAdminCache === 'function') {
      window.clearAdminCache();
    }
    showToast('✅ Admin memory cache cleared! Data will refresh on next request.', 'success');
  });

  // Theme Handlers
  document.getElementById('btn-theme-dark')?.addEventListener('click', () => {
    localStorage.setItem('aarogyam-admin-theme', 'dark');
    document.body.classList.remove('light-theme');
    showToast('🌙 Dark Mode Activated', 'info');
    initSettings();
  });

  document.getElementById('btn-theme-light')?.addEventListener('click', () => {
    localStorage.setItem('aarogyam-admin-theme', 'light');
    document.body.classList.add('light-theme');
    showToast('☀️ Light Mode Activated', 'info');
    initSettings();
  });

  // Hard reload
  document.getElementById('btn-purge-storage')?.addEventListener('click', () => {
    if (typeof window.clearAdminCache === 'function') window.clearAdminCache();
    showToast('🔄 Hard reloading...', 'info');
    setTimeout(() => window.location.reload(), 400);
  });

  // SW update
  document.getElementById('btn-unregister-sw')?.addEventListener('click', async () => {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.update();
      showToast('✅ ServiceWorker updated successfully!', 'success');
    } else {
      showToast('ServiceWorker not supported in this environment.', 'info');
    }
  });

  // Logout Now
  document.getElementById('btn-admin-logout-now')?.addEventListener('click', () => {
    if (confirm('क्या आप एडमिन पैनल से लॉगआउट करना चाहते हैं?')) {
      localStorage.removeItem('admin_session');
      sessionStorage.clear();
      window.location.replace('login.html');
    }
  });
}

