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

      <!-- Search Input -->
      <div class="admin-card" style="padding:14px; background:#1e293b; border:1px solid #334155; border-radius:12px; margin-bottom:18px;">
        <input type="text" id="vaultSearchInput" placeholder="मोबाइल नंबर से खोजें (उदा. 6260004158 या 7049...)" 
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

  document.getElementById('btnRefreshVaultData')?.addEventListener('click', loadVaultData);
  document.getElementById('vaultSearchInput')?.addEventListener('input', (e) => {
    filterTable(e.target.value);
  });

  await loadVaultData();
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
    renderVaultTable(allVaultRecords);
  } catch (err) {
    if (loading) loading.innerHTML = `<div style="color:#ef4444;">डेटा लोड करने में त्रुटि: ${err.message}</div>`;
  }
}

function renderVaultTable(list) {
  const loading = document.getElementById('vaultLoading');
  const table = document.getElementById('vaultTable');
  const tbody = document.getElementById('vaultTableBody');

  if (!list || list.length === 0) {
    if (loading) {
      loading.innerHTML = '<div style="color:#94a3b8; padding:30px;">कोई सुरक्षा रिकॉर्ड नहीं मिला।</div>';
      loading.style.display = 'block';
    }
    if (table) table.style.display = 'none';
    return;
  }

  if (loading) loading.style.display = 'none';
  if (table) table.style.display = 'table';
  if (tbody) tbody.innerHTML = '';

  let pinCount = 0;
  let devCount = 0;
  let lockCount = 0;

  list.forEach((r, idx) => {
    if (r.pin_code) pinCount++;
    if (r.device_token) devCount++;
    const isLocked = r.locked_until && new Date(r.locked_until).getTime() > Date.now();
    if (isLocked) lockCount++;

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #334155';
    tr.innerHTML = `
      <td style="padding:10px;">${idx + 1}</td>
      <td style="padding:10px;"><strong style="color:#f8fafc; font-size:0.95rem;">+91 ${r.phone}</strong></td>
      <td style="padding:10px;">
        ${(r.pin_code && r.pin_code !== 'RESET')
        ? `<span style="font-family:monospace; font-size:1.1rem; font-weight:900; color:#38bdf8; background:#0f172a; padding:3px 8px; border-radius:6px; letter-spacing:2px;">${r.pin_code}</span>`
        : '<span style="color:#f59e0b; font-weight:800; font-size:0.80rem; background:rgba(245,158,11,0.15); padding:2px 6px; border-radius:4px;">🔄 रीसेट (नया पिन प्रतीक्षित)</span>'}
      </td>
      <td style="padding:10px;">
        ${r.device_token
        ? `<code style="color:#4ade80; background:#0f172a; padding:2px 6px; border-radius:4px; font-size:0.75rem;">${r.device_token}</code>`
        : '<span style="color:#64748b; font-size:0.80rem;">अनबाउंड (सभी फोन खुले हैं)</span>'}
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

  const pEl = document.getElementById('statTotalPins');
  const dEl = document.getElementById('statTotalDevices');
  const lEl = document.getElementById('statTotalLocked');
  if (pEl) pEl.textContent = pinCount;
  if (dEl) dEl.textContent = devCount;
  if (lEl) lEl.textContent = lockCount;
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
