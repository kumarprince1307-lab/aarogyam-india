/**
 * =========================================================================
 * ADMIN MY TEAM SECURITY VAULT MODULE
 * Route: #team-security or admin/team-security.html
 * =========================================================================
 */

import { initAdminLayout } from './admin-main.js';

const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';

let allVaultRecords = [];
let adminPassRevealed = false;

export async function initTeamSecurity() {
  initAdminLayout('🔐 My Team सुरक्षा व PIN रीसेट हब', 'लीडर वर्कबेंच, बहीखाता, डायरी और टू-डू पेजों के 4-अंकीय PIN, डिवाइस टोकन और 15-मिनट लॉक का नियंत्रण केंद्र');

  const container = document.getElementById('page-content') || document.getElementById('user-details-content') || document.querySelector('.admin-container') || document.querySelector('main');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 10px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; margin-bottom: 20px;">
        <div>
          <h2 style="margin:0; font-size:1.5rem; font-weight:900; color:#38bdf8; display:flex; align-items:center; gap:8px;">
            <span>🔐</span> <span>My Team सुरक्षा व PIN रीसेट हब</span>
          </h2>
          <p style="margin:4px 0 0; color:#94a3b8; font-size:0.86rem;">
            यहाँ से आप किसी भी लीडर का 4-अंकीय PIN देख सकते हैं, रीसेट कर सकते हैं, और नए फोन में लॉगिन हेतु डिवाइस टोकन हटा सकते हैं।
          </p>
        </div>
        <button type="button" id="btnRefreshVaultData" class="admin-button" style="background:#2563eb; color:#fff; font-weight:800; padding:9px 16px; border-radius:8px; border:none; cursor:pointer;">
          🔄 रीफ़्रेश डेटा
        </button>
      </div>

      <!-- Quick Stats -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:20px;">
        <div class="admin-card" style="padding:16px; background:#1e293b; border:1px solid #334155; border-radius:12px;">
          <div style="font-size:0.78rem; color:#94a3b8; font-weight:700;">कुल सेट किए गए PIN</div>
          <div id="statTotalPins" style="font-size:1.8rem; font-weight:900; color:#38bdf8; margin-top:4px;">0</div>
        </div>
        <div class="admin-card" style="padding:16px; background:#1e293b; border:1px solid #334155; border-radius:12px;">
          <div style="font-size:0.78rem; color:#94a3b8; font-weight:700;">अधिकृत डिवाइस (Locked Devices)</div>
          <div id="statTotalDevices" style="font-size:1.8rem; font-weight:900; color:#4ade80; margin-top:4px;">0</div>
        </div>
        <div class="admin-card" style="padding:16px; background:#1e293b; border:1px solid #334155; border-radius:12px;">
          <div style="font-size:0.78rem; color:#94a3b8; font-weight:700;">वर्तमान में ब्लॉक (15 Min Strike)</div>
          <div id="statTotalLocked" style="font-size:1.8rem; font-weight:900; color:#ef4444; margin-top:4px;">0</div>
        </div>
      </div>

      <!-- Admin Testing Bypass Switch Card -->
      <div class="admin-card" style="padding:18px 22px; background:linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #6366f1; border-radius:14px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <div style="font-weight:900; font-size:1.05rem; color:#c7d2fe; display:flex; align-items:center; gap:8px;">
            <span>🛡️</span> <span>एडमिन टेस्टिंग बाईपास स्विच (Admin Master Bypass Switch)</span>
          </div>
          <p style="margin:4px 0 0; font-size:0.84rem; color:#94a3b8; line-height:1.4;">
            जब यह स्विच ON रहेगा, तब आप अपने अधिकृत फोन/लैपटॉप पर किसी भी यूज़र का बहीखाता, डायरी या टीम पेज <strong>बिना PIN के सीधे</strong> खोल सकेंगे।
          </p>
        </div>
        <div style="display:flex; align-items:center; gap:14px;">
          <span id="bypassStatusLabel" style="font-weight:800; font-size:0.86rem; color:#94a3b8;">⚪ बंद (OFF)</span>
          <label style="position:relative; display:inline-block; width:56px; height:30px; cursor:pointer;">
            <input type="checkbox" id="toggleAdminBypass" style="opacity:0; width:0; height:0;">
            <span id="toggleSlider" style="position:absolute; inset:0; background-color:#334155; transition:0.3s; border-radius:30px; border:2px solid #475569;"></span>
          </label>
        </div>
      </div>

      <!-- 1. DEDICATED MASTER ADMIN SECURITY & CREDENTIALS BOX -->
      <div class="admin-card" id="adminMasterCard"
        style="padding:22px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border:1.5px solid #eab308; border-radius:14px; margin-bottom:24px; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <div style="font-weight:900; font-size:1.15rem; color:#facc15; display:flex; align-items:center; gap:8px;">
              <span>👑</span> <span>मुख्य एडमिन क्रेडेंशियल्स व हार्डवेयर सुरक्षा (Master Admin Security)</span>
            </div>
            <p style="margin:4px 0 0; font-size:0.84rem; color:#94a3b8; line-height:1.4;">
              एडमिन पैनल और वेब पोर्टल के लिए 1 मुख्य लॉगिन ID, पासवर्ड व पिन। दोनों अधिकृत फोन और दोनों डिवाइसेज (लैपटॉप + मोबाइल) यहाँ से प्रबंधित करें।
            </p>
          </div>
          <div>
            <button type="button" class="admin-button" onclick="window.actEditAdminCredentials()"
              style="background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; font-weight:800; font-size:0.84rem; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(245,158,11,0.3);">
              <span>✏️</span> <span>ID व पासवर्ड बदलें</span>
            </button>
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table class="admin-table" id="adminVaultTable" style="width:100%; margin:0; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid #334155; background:#0f172a;">
                <th style="padding:10px; text-align:left; color:#facc15; font-size:0.78rem;">एडमिन लॉगिन ID</th>
                <th style="padding:10px; text-align:left; color:#facc15; font-size:0.78rem;">पासवर्ड</th>
                <th style="padding:10px; text-align:left; color:#facc15; font-size:0.78rem;">अधिकृत फोन नंबर</th>
                <th style="padding:10px; text-align:left; color:#facc15; font-size:0.78rem;">मास्टर PIN</th>
                <th style="padding:10px; text-align:left; color:#facc15; font-size:0.78rem;">अधिकृत डिवाइसेज (Laptop + Mobile)</th>
                <th style="padding:10px; text-align:left; color:#facc15; font-size:0.78rem;">गलत प्रयास</th>
                <th style="padding:10px; text-align:left; color:#facc15; font-size:0.78rem;">स्थिति</th>
                <th style="padding:10px; text-align:left; color:#facc15; font-size:0.78rem;">एक्शन (Controls)</th>
              </tr>
            </thead>
            <tbody id="adminVaultTableBody">
              <tr>
                <td colspan="8" style="text-align:center; padding:16px; color:#94a3b8;">एडमिन क्रेडेंशियल्स लोड हो रहे हैं...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. DEDICATED TEAM USERS VAULT SECTION -->
      <div style="margin:24px 0 10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <h3 style="margin:0; font-size:1.1rem; font-weight:900; color:#f8fafc; display:flex; align-items:center; gap:8px;">
            <span>👥</span> <span>टीम सदस्य व डिजिटल डायरी सुरक्षा (All Team Users Vault)</span>
          </h3>
          <span style="font-size:0.80rem; color:#94a3b8;">नियमित लीडर्स व यूज़र्स के 4-अंकीय पिन व 1-डिवाइस लॉक</span>
        </div>
      </div>

      <!-- Search Input -->
      <div class="admin-card" style="padding:14px; background:#1e293b; border:1px solid #334155; border-radius:12px; margin-bottom:18px;">
        <input type="text" id="vaultSearchInput" placeholder="यूज़र मोबाइल नंबर से खोजें (उदा. 6260004158 या 9826...)" 
          style="width:100%; padding:10px 14px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:0.92rem; font-weight:700; box-sizing:border-box; outline:none;">
      </div>

      <!-- Table Container -->
      <div class="admin-card" style="padding:18px; background:#1e293b; border:1px solid #334155; border-radius:14px; overflow-x:auto;">
        <div id="vaultLoading" style="text-align:center; padding:30px; color:#94a3b8; font-weight:700;">डेटा लोड हो रहा है...</div>
        <table class="admin-table" id="vaultTable" style="display:none; width:100%; border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid #334155; background:#0f172a;">
              <th style="padding:10px; text-align:left; color:#94a3b8; font-size:0.78rem;">#</th>
              <th style="padding:10px; text-align:left; color:#94a3b8; font-size:0.78rem;">मोबाइल नंबर</th>
              <th style="padding:10px; text-align:left; color:#94a3b8; font-size:0.78rem;">4-अंकीय PIN</th>
              <th style="padding:10px; text-align:left; color:#94a3b8; font-size:0.78rem;">अधिकृत डिवाइस टोकन</th>
              <th style="padding:10px; text-align:left; color:#94a3b8; font-size:0.78rem;">गलत प्रयास</th>
              <th style="padding:10px; text-align:left; color:#94a3b8; font-size:0.78rem;">लॉक स्थिति</th>
              <th style="padding:10px; text-align:left; color:#94a3b8; font-size:0.78rem;">एक्शन (Controls)</th>
            </tr>
          </thead>
          <tbody id="vaultTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const bypassToggle = document.getElementById('toggleAdminBypass');

  const currentBypass = localStorage.getItem('AI_ADMIN_TEST_BYPASS') === 'true';
  updateBypassUI(currentBypass);

  bypassToggle?.addEventListener('change', async (e) => {
    const isChecked = e.target.checked;
    localStorage.setItem('AI_ADMIN_TEST_BYPASS', isChecked ? 'true' : 'false');
    sessionStorage.setItem('AI_CLOUD_BYPASS', isChecked ? 'true' : 'false');
    updateBypassUI(isChecked);

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.7974422572`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ is_bypass_active: isChecked, updated_at: new Date().toISOString() })
      });
    } catch (err) {
      console.warn('Bypass patch cloud error:', err);
    }
  });

  document.getElementById('btnRefreshVaultData')?.addEventListener('click', loadVaultData);
  document.getElementById('vaultSearchInput')?.addEventListener('input', (e) => {
    filterTable(e.target.value);
  });

  await loadVaultData();
}

function updateBypassUI(isOn) {
  const bypassToggle = document.getElementById('toggleAdminBypass');
  const bypassLabel = document.getElementById('bypassStatusLabel');
  const bypassSlider = document.getElementById('toggleSlider');
  if (bypassToggle) bypassToggle.checked = isOn;
  if (bypassLabel) {
    bypassLabel.textContent = isOn ? '🟢 चालू (ON) - कोई भी नंबर बिना PIN के खुलेगा' : '⚪ बंद (OFF) - पिन व डिवाइस लॉक सक्रिय';
    bypassLabel.style.color = isOn ? '#4ade80' : '#94a3b8';
  }
  if (bypassSlider) {
    bypassSlider.style.backgroundColor = isOn ? '#22c55e' : '#334155';
  }
}

async function loadVaultData() {
  const loading = document.getElementById('vaultLoading');
  const table = document.getElementById('vaultTable');
  if (loading) loading.style.display = 'block';
  if (table) table.style.display = 'none';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?select=*&order=created_at.desc`, {
      cache: 'no-store',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    allVaultRecords = await res.json();

    // Auto-seed admin 7974422572 if table is empty or missing admin
    const hasAdmin = Array.isArray(allVaultRecords) && allVaultRecords.some(r => r.phone === '7974422572');
    if (!hasAdmin) {
      try {
        const clientToken = localStorage.getItem('AI_DEVICE_TOKEN') || ('DEV_' + Date.now().toString(36));
        await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?on_conflict=phone`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=representation'
          },
          body: JSON.stringify({
            phone: '7974422572',
            pin_code: '7974',
            device_token: clientToken,
            attempts: 0,
            locked_until: null,
            updated_at: new Date().toISOString()
          })
        });
        const r2 = await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?select=*&order=created_at.desc`, {
          cache: 'no-store',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        allVaultRecords = await r2.json();
      } catch (_) { }
    }

    const adminRec = Array.isArray(allVaultRecords) && (allVaultRecords.find(r => r.phone === '7974422572') || allVaultRecords.find(r => r.admin_username));
    if (adminRec && adminRec.is_bypass_active !== undefined) {
      updateBypassUI(adminRec.is_bypass_active);
      localStorage.setItem('AI_ADMIN_TEST_BYPASS', adminRec.is_bypass_active ? 'true' : 'false');
      sessionStorage.setItem('AI_CLOUD_BYPASS', adminRec.is_bypass_active ? 'true' : 'false');
    }

    renderAdminTable(adminRec);
    renderVaultTable(allVaultRecords);
  } catch (err) {
    if (loading) loading.innerHTML = `<div style="color:#ef4444;">डेटा लोड करने में त्रुटि: ${err.message}</div>`;
  }
}

function renderAdminTable(r) {
  const tbody = document.getElementById('adminVaultTableBody');
  if (!tbody) return;
  if (!r) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:16px;">एडमिन रिकॉर्ड उपलब्ध नहीं है।</td></tr>';
    return;
  }

  const isLocked = r.locked_until && new Date(r.locked_until).getTime() > Date.now();

  let devBadges = '<span style="color:#64748b;">कोई डिवाइस लॉक नहीं</span>';
  if (r.device_token) {
    const tokens = r.device_token.split(',').map(t => t.trim()).filter(Boolean);
    devBadges = tokens.map((t, idx) => {
      const isLap = idx === 0;
      const icon = isLap ? '💻' : '📱';
      const label = isLap ? 'Laptop / PC' : 'Mobile Phone';
      return `<div style="margin:3px 0;"><span style="color:#facc15; font-size:0.75rem; font-weight:800;">${icon} ${label}:</span> <code style="color:#4ade80; background:#0f172a; padding:2px 6px; border-radius:4px; font-size:0.75rem;">${t}</code></div>`;
    }).join('');
  }

  const passMasked = adminPassRevealed
    ? `<span style="font-family:monospace; color:#4ade80; font-weight:900; background:#0f172a; padding:4px 8px; border-radius:6px; font-size:0.95rem;">${r.admin_password || 'ai2345'}</span>`
    : `<span style="font-family:monospace; color:#38bdf8; background:#0f172a; padding:4px 8px; border-radius:6px;">••••••••</span>`;

  tbody.innerHTML = `
    <tr style="background:rgba(234, 179, 8, 0.06); border-bottom:1px solid #334155;">
      <td style="padding:10px;">
        <strong style="font-family:monospace; font-size:1.05rem; color:#facc15; background:#0f172a; padding:4px 8px; border-radius:6px;">${r.admin_username || 'Admin007'}</strong>
      </td>
      <td style="padding:10px; white-space:nowrap;">
        ${passMasked}
        <button type="button" onclick="window.actToggleAdminPass()" style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:0.95rem; margin-left:6px;" title="पासवर्ड देखें / छिपाएं">
          ${adminPassRevealed ? '🙈' : '👁️'}
        </button>
      </td>
      <td style="padding:10px;">
        <strong style="color:#fff; font-size:0.95rem;">+91 7974422572</strong> <span style="font-size:0.72rem; color:#facc15; font-weight:800; background:rgba(234,179,8,0.2); padding:1px 6px; border-radius:4px;">मुख्य</span><br>
        <strong style="color:#cbd5e1; font-size:0.88rem;">+91 7049294111</strong> <span style="font-size:0.72rem; color:#94a3b8;">सेकेंडरी</span>
      </td>
      <td style="padding:10px;">
        <span style="font-family:monospace; font-size:1.15rem; font-weight:900; color:#38bdf8; background:#0f172a; padding:3px 8px; border-radius:6px; letter-spacing:2px;">${(r.pin_code && r.pin_code !== 'RESET') ? r.pin_code : '7974'}</span>
      </td>
      <td style="padding:10px;">
        ${devBadges}
      </td>
      <td style="padding:10px;">
        <span style="font-weight:800; color:${r.attempts > 0 ? '#f87171' : '#4ade80'};">${r.attempts || 0} / 3</span>
      </td>
      <td style="padding:10px;">
        ${isLocked ? '<span style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid #ef4444; border-radius:12px; padding:2px 8px; font-size:0.75rem; font-weight:800;">⛔ 15-Min लॉक</span>' : '<span style="background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid #22c55e; border-radius:12px; padding:2px 8px; font-size:0.75rem; font-weight:800;">🟢 सामान्य</span>'}
      </td>
      <td style="padding:10px; white-space:nowrap;">
        <button type="button" class="admin-button small-button" style="background:#f59e0b; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:800; padding:4px 8px; cursor:pointer; margin-right:4px;" onclick="window.actEditAdminCredentials()" title="यूजरनेम व पासवर्ड बदलें">
          ✏️ ID/पासवर्ड
        </button>
        <button type="button" class="admin-button small-button" style="background:#6366f1; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:800; padding:4px 8px; cursor:pointer; margin-right:4px;" onclick="window.actSetCustomPin('${r.phone}')" title="मास्टर पिन बदलें">
          ✏️ PIN बदलें
        </button>
        <button type="button" class="admin-button small-button" style="background:#3b82f6; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:800; padding:4px 8px; cursor:pointer; margin-right:4px;" onclick="window.actUnbindDevice('${r.phone}')" title="डिवाइस टोकन खाली करें ताकि नए लैपटॉप/फोन पर तुरंत खुल सके">
          📱 डिवाइस रीसेट
        </button>
        ${(r.attempts > 0 || isLocked) ? `
          <button type="button" class="admin-button small-button" style="background:#10b981; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:800; padding:4px 8px; cursor:pointer;" onclick="window.actUnlockStrikes('${r.phone}')" title="गलत प्रयास 0 करें">
            ⏳ अनलॉक
          </button>
        ` : ''}
      </td>
    </tr>
  `;
}

window.actToggleAdminPass = function() {
  adminPassRevealed = !adminPassRevealed;
  const adminRec = (allVaultRecords || []).find(r => r.phone === '7974422572') || (allVaultRecords || []).find(r => r.admin_username);
  if (adminRec) renderAdminTable(adminRec);
};

window.actEditAdminCredentials = async function() {
  const adminRec = (allVaultRecords || []).find(r => r.phone === '7974422572') || (allVaultRecords || []).find(r => r.admin_username);
  const currentId = adminRec?.admin_username || 'Admin007';
  const currentPass = adminRec?.admin_password || 'ai2345';

  const newId = prompt('नया एडमिन लॉगिन ID (यूज़रनेम) दर्ज करें:', currentId);
  if (newId === null) return;
  const cleanId = newId.trim();
  if (!cleanId) { alert('अमान्य ID! खाली नहीं छोड़ सकते।'); return; }

  const newPass = prompt('नया एडमिन पासवर्ड दर्ज करें:', currentPass);
  if (newPass === null) return;
  const cleanPass = newPass.trim();
  if (!cleanPass) { alert('अमान्य पासवर्ड! खाली नहीं छोड़ सकते।'); return; }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.7974422572`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        admin_username: cleanId,
        admin_password: cleanPass,
        updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error('Status: ' + res.status);
    alert(`✅ एडमिन क्रेडेंशियल्स सफलतापूर्वक अपडेट हो गए!\n\nलॉगिन ID: ${cleanId}\nपासवर्ड: ${cleanPass}`);
    loadVaultData();
  } catch (e) {
    alert('त्रुटि: ' + e.message);
  }
};

function renderVaultTable(list) {
  const loading = document.getElementById('vaultLoading');
  const table = document.getElementById('vaultTable');
  const tbody = document.getElementById('vaultTableBody');

  let pinCount = 0;
  let devCount = 0;
  let lockCount = 0;

  // Stats across all records
  (list || []).forEach(r => {
    if (r.pin_code && r.pin_code !== 'RESET') pinCount++;
    if (r.device_token) devCount++;
    if (r.locked_until && new Date(r.locked_until).getTime() > Date.now()) lockCount++;
  });

  const pEl = document.getElementById('statTotalPins');
  const dEl = document.getElementById('statTotalDevices');
  const lEl = document.getElementById('statTotalLocked');
  if (pEl) pEl.textContent = pinCount;
  if (dEl) dEl.textContent = devCount;
  if (lEl) lEl.textContent = lockCount;

  // Filter out admin rows (7974422572 & 7049294111) so regular team users are isolated
  const teamUsers = (list || []).filter(r => r.phone !== '7974422572' && r.phone !== '7049294111');

  if (!teamUsers || teamUsers.length === 0) {
    if (loading) {
      loading.innerHTML = '<div style="color:#94a3b8; padding:30px;">कोई टीम सदस्य सुरक्षा रिकॉर्ड नहीं मिला। (नया सदस्य बहीखाता या डायरी में प्रविष्टि करने पर यहाँ जुड़ेगा)</div>';
      loading.style.display = 'block';
    }
    if (table) table.style.display = 'none';
    return;
  }

  if (loading) loading.style.display = 'none';
  if (table) table.style.display = 'table';
  if (tbody) tbody.innerHTML = '';

  teamUsers.forEach((r, idx) => {
    const isLocked = r.locked_until && new Date(r.locked_until).getTime() > Date.now();

    let devDisplay = '<span style="color:#64748b; font-size:0.80rem;">अनबाउंड (सभी फोन खुले हैं)</span>';
    if (r.device_token) {
      const devList = r.device_token.split(',').map(t => t.trim()).filter(Boolean);
      devDisplay = devList.map(t => `<code style="display:inline-block; color:#4ade80; background:#0f172a; padding:2px 6px; border-radius:4px; font-size:0.75rem; margin:2px 0;">📱 ${t}</code>`).join('<br>');
    }

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #334155';
    tr.innerHTML = `
      <td style="padding:10px;">${idx + 1}</td>
      <td style="padding:10px;">
        <strong style="color:#f8fafc; font-size:0.95rem;">+91 ${r.phone}</strong>
      </td>
      <td style="padding:10px;">
        ${(r.pin_code && r.pin_code !== 'RESET')
        ? `<span style="font-family:monospace; font-size:1.1rem; font-weight:900; color:#38bdf8; background:#0f172a; padding:3px 8px; border-radius:6px; letter-spacing:2px;">${r.pin_code}</span>`
        : '<span style="color:#f59e0b; font-weight:800; font-size:0.80rem; background:rgba(245,158,11,0.15); padding:2px 6px; border-radius:4px;">🔄 रीसेट (नया पिन प्रतीक्षित)</span>'}
      </td>
      <td style="padding:10px;">
        ${devDisplay}
      </td>
      <td style="padding:10px;">
        <span style="font-weight:800; color:${r.attempts > 0 ? '#f87171' : '#4ade80'};">${r.attempts || 0} / 3</span>
      </td>
      <td style="padding:10px;">
        ${isLocked
        ? `<span style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid #ef4444; border-radius:12px; padding:2px 8px; font-size:0.75rem; font-weight:800;">⛔ 15-Min लॉक</span>`
        : `<span style="background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid #22c55e; border-radius:12px; padding:2px 8px; font-size:0.75rem; font-weight:800;">🟢 सामान्य</span>`}
      </td>
      <td style="padding:10px; white-space:nowrap;">
        <button type="button" class="admin-button small-button" onclick="window.actSetCustomPin('${r.phone}')" style="background:#6366f1; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:800; padding:4px 8px; cursor:pointer; margin-right:4px;" title="नया 4-अंकीय पिन सेट करें">
          ✏️ PIN सेट करें
        </button>
        <button type="button" class="admin-button small-button" onclick="window.actResetPin('${r.phone}')" style="background:#f59e0b; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:800; padding:4px 8px; cursor:pointer; margin-right:4px;" title="पिन रीसेट करें ताकि यूजर नया पिन बना सके">
          🔄 पिन रीसेट
        </button>
        <button type="button" class="admin-button small-button" onclick="window.actUnbindDevice('${r.phone}')" style="background:#3b82f6; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:800; padding:4px 8px; cursor:pointer; margin-right:4px;" title="डिवाइस टोकन हटाएं ताकि नए फोन पर खुल सके">
          📱 डिवाइस हटाएं
        </button>
        ${(r.attempts > 0 || isLocked) ? `
          <button type="button" class="admin-button small-button" onclick="window.actUnlockStrikes('${r.phone}')" style="background:#10b981; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:800; padding:4px 8px; cursor:pointer;" title="गलत प्रयासों को 0 करें और लॉक हटाएं">
            ⏳ अनलॉक
          </button>
        ` : ''}
      </td>
    `;
    if (tbody) tbody.appendChild(tr);
  });
}

function filterTable(q) {
  const query = String(q || '').trim().toLowerCase();
  if (!query) {
    renderVaultTable(allVaultRecords);
    return;
  }
  const filtered = allVaultRecords.filter(r => (r.phone && r.phone.includes(query)) || (r.pin_code && r.pin_code.includes(query)));
  renderVaultTable(filtered);
}

// Global actions
window.actSetCustomPin = async function (phone) {
  const newPin = prompt(`+91 ${phone} के लिए नया 4-अंकीय सुरक्षा PIN दर्ज करें:`, '');
  if (!newPin) return;
  const clean = newPin.trim();
  if (!/^\d{4}$/.test(clean)) {
    alert('कृपया केवल 4 अंकों का मान्य पिन दर्ज करें (उदा. 1234)!');
    return;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?on_conflict=phone`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({
        phone: phone,
        pin_code: clean,
        attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error('Status: ' + res.status);
    alert(`✅ +91 ${phone} का नया PIN (${clean}) Supabase में सफलतापूर्वक सुरक्षित हो गया!`);
    loadVaultData();
  } catch (e) {
    alert("त्रुटि: " + e.message);
  }
};

window.actResetPin = async function (phone) {
  if (!confirm(`क्या आप +91 ${phone} का 4-अंकीय सुरक्षा पिन रीसेट करना चाहते हैं?\n\nयूजर को अगली बार नया पिन बनाने के लिए कहा जाएगा।`)) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${phone}`, {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ pin_code: 'RESET', device_token: null, attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
    });
    if (!res.ok) throw new Error('Status: ' + res.status);
    alert(`✅ +91 ${phone} का पिन सफलतापूर्वक रीसेट कर दिया गया है!\n\nअब यूजर जब भी My Team खोलेगा, उसे नया पिन सेट करने का विकल्प मिलेगा।`);
    loadVaultData();
  } catch (e) {
    alert("त्रुटि: " + e.message);
  }
};

window.actUnbindDevice = async function (phone) {
  if (!confirm(`क्या आप +91 ${phone} का अधिकृत डिवाइस लॉक हटाना चाहते हैं?\n\nयूजर अब किसी भी नए फोन पर आसानी से लॉगिन कर सकेगा।`)) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${phone}`, {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_token: null, updated_at: new Date().toISOString() })
    });
    alert(`✅ +91 ${phone} का डिवाइस लॉक हटा दिया गया है!`);
    loadVaultData();
  } catch (e) {
    alert("त्रुटि: " + e.message);
  }
};

window.actUnlockStrikes = async function (phone) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${phone}`, {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
    });
    alert(`✅ +91 ${phone} का 15-मिनट लॉक व गलत प्रयास सफलतापूर्वक हटा दिए गए हैं!`);
    loadVaultData();
  } catch (e) {
    alert("त्रुटि: " + e.message);
  }
};
