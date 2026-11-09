/* Admin Users Page */

import { initAdminLayout } from './admin-main.js';
import { fetchUsers, fetchUsersDelta, updateUserStatus, batchUpdateUserStatuses, deleteUserProfile } from './admin-api.js';

let masterUsersList = []; // In-memory master list to eliminate repeated egress
let currentUsersData = []; // Filtered data for table and CSV export
let lastSyncTimestamp = null; // Timestamp of last successful sync

function renderUserRow(user) {
  const sanitizedMobile = String(user.mobile || '').replace(/\D/g, '');
  const mobileLink = sanitizedMobile 
    ? `<a href="tel:${sanitizedMobile}" class="admin-subtle-link" style="font-weight:600;" title="Call"><span style="margin-right:2px;">📞</span>${user.mobile}</a>` 
    : (user.mobile || 'N/A');

  let whatsappButtonHTML = '';
  if (sanitizedMobile) {
      let whatsappNumber = sanitizedMobile;
      if (whatsappNumber.length === 10) {
          whatsappNumber = '91' + whatsappNumber;
      }
      const customerName = user.name || 'Customer';
      const message = `नमस्ते ${customerName} जी, मैं आरोग्यम इंडिया से बात कर रहा हूँ।`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      whatsappButtonHTML = `<a href="${whatsappUrl}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;border-color:#22c55e;padding:2px 8px;border-radius:4px;" title="WhatsApp">💬</a>`;
  }

  const isSub = user.status === 'active' || user.totalPurchases > 0;

  return `
    <tr>
      <td>
        <div class="admin-user-name">${user.name}</div>
        <div class="admin-user-email">${user.email || ''}</div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          ${mobileLink}
          ${whatsappButtonHTML}
        </div>
      </td>
      <td>
        ${user.appInstalled 
          ? `<span class="admin-pill active" title="${user.appInstalledAt ? 'Installed: ' + user.appInstalledAt : 'App Installed'}" style="white-space:nowrap; display:inline-flex; align-items:center; gap:3px;">📱 Installed</span>` 
          : `<span class="admin-pill" style="opacity:0.65; white-space:nowrap; display:inline-flex; align-items:center; gap:3px;">🌐 Web Only</span>`
        }
      </td>
      <td>${user.source || 'N/A'}</td>
      <td><a href="#user-details?id=${user.id}" data-route="user-details?id=${user.id}" data-id="${user.id}" class="admin-subtle-link"><strong>${user.shareId || 'N/A'}</strong></a></td>
      <td>
        <button 
          type="button" 
          class="admin-button small-button btn-user-wb-report" 
          data-user-id="${user.id}" 
          style="background:rgba(37,99,235,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.35); font-weight:800; font-size:0.75rem; padding:4px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; cursor:pointer; white-space:nowrap;"
          title="वेबिनार रिपोर्ट और रजिस्टर्ड किसान देखें"
        >
          <span>🎥</span>
          <span>${user.webinarLeads || 0} Leads</span>
          ${user.webinarJoined > 0 ? `<span style="background:#10b981; color:#fff; border-radius:10px; padding:1px 5px; font-size:0.68rem; font-weight:800;">${user.webinarJoined} Live</span>` : ''}
        </button>
      </td>
      <td>
        <a 
          href="#user-details?id=${user.id}" 
          data-route="user-details?id=${user.id}" 
          data-id="${user.id}" 
          class="admin-button small-button" 
          style="background:rgba(22,163,74,0.12); color:#4ade80; border:1px solid rgba(34,197,94,0.35); font-weight:800; font-size:0.75rem; padding:4px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; text-decoration:none; white-space:nowrap;"
          title="सखी AI अंतर्दृष्टि देखें"
        >
          <span>🌸</span>
          <span>${user.sakhiChatCount || 0} Chats</span>
          ${user.sakhiPrimaryDomain ? `<span style="background:#166534; color:#bbf7d0; border-radius:10px; padding:1px 5px; font-size:0.68rem; font-weight:800;">${user.sakhiPrimaryDomain}</span>` : ''}
        </a>
      </td>
      <td>${user.directReferrals || 0}</td>
      <td>${user.totalShares || 0}</td>
      <td>${user.totalClicks || 0}</td>
      <td>${user.totalVisitors || 0}</td>
      <td>${user.totalDirectPurchases || 0}</td>
      <td>${user.totalPurchases || 0}</td>
      <td>₹${(user.totalSpent || 0).toLocaleString('en-IN')}</td>
      <td>${user.totalDownloads || 0} / ${user.downloadLimit || 0}</td>
      <td>
        <span style="font-size:0.75rem;font-weight:800;padding:2px 6px;border-radius:4px;background:${isSub ? '#FEF3C7' : '#F1F5F9'};color:${isSub ? '#92400E' : '#64748B'};">
          ${isSub ? 'YES' : 'NO'}
        </span>
      </td>
      <td>
        <button 
          class="admin-button small-button admin-status-toggle ${user.status.toLowerCase()}"
          data-user-id="${user.id}"
          data-current-status="${user.status.toLowerCase()}"
          title="Click to toggle status"
          style="font-weight:700;"
        >
          ${user.status.toUpperCase()}
        </button>
      </td>
      <td>
        <div style="display: flex; gap: 8px; align-items: center;">
            <a href="#user-details?id=${user.id}" data-route="user-details?id=${user.id}" data-id="${user.id}" class="admin-button small-button">View</a>
        </div>
      </td>
    </tr>
  `;
}

const PAGE_SIZE = 20;
let currentUsersPage = 1;

function renderUsersTable(users) {
  if (!users || users.length === 0) {
    return '<div class="admin-empty"><strong>No users found.</strong><br>Try a different search or filter.</div>';
  }

  const totalUsers = users.length;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE) || 1;

  if (currentUsersPage > totalPages) currentUsersPage = totalPages;
  if (currentUsersPage < 1) currentUsersPage = 1;

  const startIndex = (currentUsersPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalUsers);
  const paginatedUsers = users.slice(startIndex, endIndex);

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
      <span>Showing <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${totalUsers}</strong> Users (20 Users Per Page)</span>
    </div>

    <div class="admin-table-wrapper sticky-header-table">
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>App Status / Device (Reset)</th>
            <th>Reg. Source</th>
            <th>Share ID</th>
            <th style="background: rgba(37,99,235,0.15); color: #60a5fa; white-space: nowrap;">🎥 Webinar Report</th>
            <th style="background: rgba(22,163,74,0.15); color: #4ade80; white-space: nowrap;">🌸 सखी चैट (Sakhi Chat)</th>
            <th>Downloads (Used/Limit)</th>
            <th>Subscriber</th>
            <th>Status</th>
            <th>Action</th>
            <th>Direct Referrals</th>
            <th style="background: rgba(245,158,11,0.15); color: #f59e0b; white-space: nowrap;">🪙 Points Earned</th>
            <th style="background: rgba(34,197,94,0.15); color: #22c55e; white-space: nowrap;">💰 Wallet Balance</th>
            <th style="background: rgba(99,102,241,0.15); color: #818cf8; white-space: nowrap;">📜 Passbook</th>
            <th>Total Shares</th>
            <th>Total Clicks</th>
            <th>Total Direct Purchases</th>
            <th>Total Purchases</th>
            <th>Total Spent</th>
          </tr>
        </thead>
        <tbody>
          ${paginatedUsers.map((u, idx) => {
            const sanitizedMobile = String(u.mobile || '').replace(/\D/g, '');
            const mobileLink = sanitizedMobile 
              ? `<a href="tel:${sanitizedMobile}" class="admin-subtle-link" style="font-weight:600;" title="Call"><span style="margin-right:2px;">📞</span>${u.mobile}</a>` 
              : (u.mobile || 'N/A');

            const isSub = u.status === 'active' || u.totalPurchases > 0;
            let whatsappButtonHTML = '';
            if (sanitizedMobile) {
                let whatsappNumber = sanitizedMobile;
                if (whatsappNumber.length === 10) {
                    whatsappNumber = '91' + whatsappNumber;
                }
                const customerName = u.name || 'किसान साथी';
                let message = '';
                if (isSub) {
                    message = `🙏 नमस्ते ${customerName} जी!

🎉 बहुत-बहुत बधाई और स्वागत है! आप आरोग्यम इंडिया के सम्मानित सदस्य हैं।

📖 *1. My Library (ऑनलाइन पढ़ें व ऑडियो सुनें):*
अपनी ई-बुक्स को कभी भी पढ़ने और ऑडियो सुनने हेतु यहाँ क्लिक करें:
👉 https://aarogyamindia.online/my-library.html

📲 *2. आरोग्यम इंडिया ऐप सीधे इंस्टॉल करें:*
बिना ब्राउज़र खोले तुरंत उपयोग करने हेतु ऐप इंस्टॉल करें:
👉 https://aarogyamindia.online/aarogyam-app.html

🌸 *3. 24x7 निःशुल्क 'आरोग्यम सखी AI' की सुविधा:*
फसल के रोग, कीटनाशक स्प्रे चार्ट, पशुपालन या सेहत का कोई भी सवाल या फोटो भेजकर तुरंत वैज्ञानिक सलाह पाएं:
👉 https://aarogyamindia.online/aarogyam-sakhi.html

🎁 *विशेष ऑफर्स व सहायता हेतु हमसे संपर्क करें:*
📞 WhatsApp / कॉल: +91 7974422572

आपका शुभचिंतक,  
*आरोग्यम इंडिया टीम* 🌿`;
                } else {
                    message = `🙏 नमस्ते ${customerName} जी!

आरोग्यम इंडिया परिवार में आपका हार्दिक स्वागत है 🌿

📲 *1. आरोग्यम इंडिया ऐप सीधे इंस्टॉल करें:*
खेती, पशुपालन व डिजिटल कृषि पुस्तकों के लिए हमारा ऐप इंस्टॉल करें:
👉 https://aarogyamindia.online/aarogyam-app.html

🌸 *2. 24x7 निःशुल्क 'आरोग्यम सखी AI' की सुविधा:*
फसल के रोग, सही जैविक स्प्रे चार्ट, पशुपालन व स्वास्थ्य का कोई भी सवाल पूछें या फोटो भेजकर तुरंत वैज्ञानिक सलाह पाएं:
👉 https://aarogyamindia.online/aarogyam-sakhi.html

🎁 *विशेष डिस्काउंट व ऑफर्स के लिए हमसे संपर्क करें:*
📞 WhatsApp / कॉल: +91 7974422572

सप्रेम व आदर सहित,  
*आरोग्यम इंडिया टीम* 🌾`;
                }
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
                whatsappButtonHTML = `<a href="${whatsappUrl}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;border-color:#22c55e;padding:2px 8px;border-radius:4px;" title="WhatsApp पर स्वागत / फॉलो-अप संदेश भेजें">💬</a>`;
            }
            const rowNum = startIndex + idx + 1;

            return `
              <tr>
                <td><strong>#${rowNum}</strong></td>
                <td>
                  <div class="admin-user-name">${u.name}</div>
                  <div class="admin-user-email">${u.email || ''}</div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px;">
                    ${mobileLink}
                    ${whatsappButtonHTML}
                  </div>
                </td>
                <td>
                  <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
                    ${u.appInstalled 
                      ? `<span class="admin-pill active" title="${u.appInstalledAt ? 'Installed: ' + u.appInstalledAt : 'App Installed'}" style="white-space:nowrap; display:inline-flex; align-items:center; gap:3px;">📱 App</span>` 
                      : `<span class="admin-pill" style="opacity:0.65; white-space:nowrap; display:inline-flex; align-items:center; gap:3px;">🌐 Web</span>`
                    }
                    <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
                      <span id="devStatusPill_${u.id}" class="admin-pill" style="background:#f1f5f9;color:#475569;font-size:0.68rem;padding:2px 5px;font-weight:700;">📱 Active</span>
                      <button type="button" class="admin-button small-button btn-reset-user-device" onclick="window.resetUserDevice('${u.id}', '${sanitizedMobile}', this)" style="background:#f59e0b;color:#fff;border:1px solid #d97706;font-size:0.68rem;padding:2px 6px;border-radius:4px;font-weight:800;cursor:pointer;white-space:nowrap;" title="उपयोगकर्ता का डिवाइस रीसेट करें ताकि वे नए फोन पर लॉगिन कर सकें">🔄 Reset</button>
                    </div>
                  </div>
                </td>
                <td>${u.source || 'N/A'}</td>
                <td><a href="#user-details?id=${u.id}" data-route="user-details?id=${u.id}" data-id="${u.id}" class="admin-subtle-link"><strong>${u.shareId || 'N/A'}</strong></a></td>
                <td>
                  <button 
                    type="button" 
                    class="admin-button small-button btn-user-wb-report" 
                    data-user-id="${u.id}" 
                    style="background:rgba(37,99,235,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.35); font-weight:800; font-size:0.75rem; padding:4px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; cursor:pointer; white-space:nowrap;"
                    title="वेबिनार रिपोर्ट और रजिस्टर्ड किसान देखें"
                  >
                    <span>🎥</span>
                    <span>${u.webinarLeads || 0} Leads</span>
                    ${u.webinarJoined > 0 ? `<span style="background:#10b981; color:#fff; border-radius:10px; padding:1px 5px; font-size:0.68rem; font-weight:800;">${u.webinarJoined} Live</span>` : ''}
                  </button>
                </td>
                <td>
                  <a 
                    href="#user-details?id=${u.id}" 
                    data-route="user-details?id=${u.id}" 
                    data-id="${u.id}" 
                    class="admin-button small-button" 
                    style="background:rgba(22,163,74,0.12); color:#4ade80; border:1px solid rgba(34,197,94,0.35); font-weight:800; font-size:0.75rem; padding:4px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; text-decoration:none; white-space:nowrap;"
                    title="सखी AI अंतर्दृष्टि देखें"
                  >
                    <span>🌸</span>
                    <span>${u.sakhiChatCount || 0} Chats</span>
                    ${u.sakhiPrimaryDomain ? `<span style="background:#166534; color:#bbf7d0; border-radius:10px; padding:1px 5px; font-size:0.68rem; font-weight:800;">${u.sakhiPrimaryDomain}</span>` : ''}
                  </a>
                </td>
                <td>${u.totalDownloads || 0} / ${u.downloadLimit || 0}</td>
                <td>
                  <span style="font-size:0.75rem;font-weight:800;padding:2px 6px;border-radius:4px;background:${isSub ? '#FEF3C7' : '#F1F5F9'};color:${isSub ? '#92400E' : '#64748B'};">
                    ${isSub ? 'YES' : 'NO'}
                  </span>
                </td>
                <td>
                  <button 
                    class="admin-button small-button admin-status-toggle ${u.status.toLowerCase()}"
                    data-user-id="${u.id}"
                    data-current-status="${u.status.toLowerCase()}"
                    title="Click to toggle status"
                    style="font-weight:700;"
                  >
                    ${u.status.toUpperCase()}
                  </button>
                </td>
                <td>
                  <div style="display: flex; gap: 5px; align-items: center; flex-wrap: nowrap;">
                      <a href="#user-details?id=${u.id}" data-route="user-details?id=${u.id}" data-id="${u.id}" class="admin-button small-button">View</a>
                      <a href="#user-permissions?userId=${u.id}" data-route="user-permissions" data-id="${u.id}" class="admin-button small-button" style="background:#0F172A;color:#FBBF24;border:1px solid #F59E0B;" title="Manage Granular Media & Platform Permissions">🔒 Perms</a>
                      <button type="button" class="admin-button small-button btn-user-quota" onclick="window.openUserQuotaModal('${u.id}', '${sanitizedMobile}', '${(u.name || '').replace(/'/g, "\\'")}', '${u.status}')" style="background:#0284c7;color:#fff;border:1px solid #38bdf8;font-weight:800;white-space:nowrap;" title="सखी AI क्रेडिट व कोटा कस्टमाइज़ करें">⚡ क्रेडिट</button>
                      <button type="button" class="admin-button small-button btn-delete-user" data-user-id="${u.id}" data-user-name="${(u.name || 'User').replace(/"/g, '&quot;')}" style="background:#ef4444;color:#fff;border:1px solid #dc2626;font-weight:800;padding:4px 8px;border-radius:5px;white-space:nowrap;cursor:pointer;" title="यूज़र को डेटाबेस से हमेशा के लिए हटाएं">🗑️ हटाएं</button>
                  </div>
                </td>
                <td>${u.directReferrals || 0}</td>
                <td style="font-weight:800; color:#f59e0b; text-align:center;">
                  ${(u.sharePointsEarned || 0) > 0 ? `🪙 ${u.sharePointsEarned}` : '<span style="color:#64748b;">0</span>'}
                </td>
                <td style="font-weight:800; color:#10b981; text-align:center;">
                  ${(u.walletBalance || 0) > 0 ? `₹${u.walletBalance}` : '<span style="color:#64748b;">₹0</span>'}
                </td>
                <td style="text-align:center;">
                  <button type="button" class="admin-button small-button" onclick="window.openAdminUserPassbookModal('${u.id}')" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; padding:3px 8px; border-radius:6px; font-weight:800; font-size:0.75rem; cursor:pointer; white-space:nowrap;" title="उपयोगकर्ता की पूरी पासबुक व क्रेडिट/डेबिट लेन-देन देखें">
                    📜 पासबुक
                  </button>
                </td>
                <td style="text-align:center; font-weight:700;">${u.totalShares || 0}</td>
                <td style="text-align:center; font-weight:700;">${u.totalClicks || 0}</td>
                <td>${u.totalDirectPurchases || 0}</td>
                <td>${u.totalPurchases || 0}</td>
                <td>₹${(u.totalSpent || 0).toLocaleString('en-IN')}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Pagination Bar -->
    <div class="admin-pagination-bar">
      <div class="admin-pagination-info">
        Page <strong>${currentUsersPage}</strong> of <strong>${totalPages}</strong>
      </div>
      <div class="admin-pagination-controls">
        <button type="button" id="users-prev-page" class="admin-button small-button" ${currentUsersPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          ◀ Previous
        </button>
        <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">${currentUsersPage} / ${totalPages}</span>
        <button type="button" id="users-next-page" class="admin-button small-button" ${currentUsersPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          Next ▶
        </button>
      </div>
    </div>
  `;
}

export async function initUsers() {
  initAdminLayout('Users', 'Customer profiles, referral sources, media services and user status.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-section">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <div class="admin-section-title" style="margin:0;">All Users</div>
          <span id="user-sync-badge" style="font-size:0.75rem;font-weight:700;padding:3px 8px;border-radius:12px;background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.3);display:inline-flex;align-items:center;gap:4px;">
            <span>🟢</span> <span id="user-sync-text">Loading...</span>
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <button id="btn-sync-delta" class="admin-button" style="background:#0284c7;color:#fff;border-color:#0369a1;display:inline-flex;align-items:center;gap:5px;font-weight:700;padding:6px 12px;border-radius:6px;cursor:pointer;" title="Fetch only new users and updates since last sync">
            <span>⚡</span> Sync New
          </button>
          <button id="btn-hard-refresh" class="admin-button" style="background:#334155;color:#f8fafc;border-color:#475569;display:inline-flex;align-items:center;gap:5px;font-weight:700;padding:6px 12px;border-radius:6px;cursor:pointer;" title="Full fresh database reload">
            <span>🔄</span> Full Reload
          </button>
          <a href="#user-permissions" data-route="user-permissions" class="admin-button" style="background:linear-gradient(135deg, #1E293B 0%, #0F172A 100%);color:#FBBF24;border:1.5px solid #F59E0B;display:inline-flex;align-items:center;gap:6px;font-weight:800;text-decoration:none;padding:6px 14px;border-radius:8px;">
            <span>🛡️</span> Permissions Matrix
          </a>
        </div>
      </div>
      <div class="admin-card admin-controls" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
        <input id="user-search" type="search" placeholder="🔍 नाम, मोबाइल, Share ID (e.g. AI639559), या ईमेल से खोजें..." class="admin-input" style="flex: 2; min-width: 240px;" />
        <div style="display:inline-flex;align-items:center;gap:4px;">
          <input id="user-reg-date-filter" type="date" title="Filter by registration date" class="admin-input" style="min-width:140px;" />
          <button id="btn-clear-date-filter" type="button" class="admin-button small-button" style="padding:4px 8px;font-size:0.75rem;background:#475569;color:#fff;" title="Clear date filter">❌</button>
        </div>
        <select id="user-status-filter" class="admin-select" style="min-width:145px;">
          <option value="all">All statuses</option>
          <option value="wallet_earners">🪙 Wallet Earners (>0 Pts)</option>
          <option value="active_sharers">📲 Active Sharers (Shares >0)</option>
          <option value="has_referrals">👥 Referrers (Refs >0)</option>
          <option value="installed">📱 App Installed</option>
          <option value="web">🌐 Web Only</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select id="user-sort-filter" class="admin-select" style="min-width:185px;">
          <option value="default">Sort by Registration Date</option>
          <option value="walletBalance">💰 Wallet Balance (High-Low)</option>
          <option value="sharePointsEarned">🪙 Share Points (High-Low)</option>
          <option value="totalShares">📲 Total Shares (High-Low)</option>
          <option value="totalClicks">👆 Total Clicks (High-Low)</option>
          <option value="directReferrals">Direct Referrals (High-Low)</option>
          <option value="sakhiChats">🌸 सखी संवाद संख्या (Sakhi Chats: High-Low)</option>
          <option value="totalDirectPurchases">Total Direct Purchases (High-Low)</option>
          <option value="totalPurchases">Total Purchases (High-Low)</option>
          <option value="totalSpent">Total Spent (High-Low)</option>
          <option value="totalDownloads">Total Downloads (High-Low)</option>
        </select>
        <button id="export-csv-btn" class="admin-button">Export CSV</button>
      </div>
      <div id="users-filter-stat-bar" style="font-size:0.82rem;color:#94a3b8;margin-top:8px;padding:6px 12px;background:rgba(15,23,42,0.4);border-radius:8px;border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span id="users-count-label">Showing 0 users</span>
      </div>
      <div id="users-table" style="margin-top:8px;"></div>
    </div>
  `;

  const container = document.getElementById('users-table');
  const searchInput = document.getElementById('user-search');
  const statusSelect = document.getElementById('user-status-filter');
  const dateInput = document.getElementById('user-reg-date-filter');
  const clearDateBtn = document.getElementById('btn-clear-date-filter');
  const sortSelect = document.getElementById('user-sort-filter');
  const exportBtn = document.getElementById('export-csv-btn');
  const syncDeltaBtn = document.getElementById('btn-sync-delta');
  const hardRefreshBtn = document.getElementById('btn-hard-refresh');
  const syncBadgeText = document.getElementById('user-sync-text');
  const usersCountLabel = document.getElementById('users-count-label');

  if (!container) return;

  // Read URL query parameters (e.g. #users?status=active)
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex !== -1) {
    const urlParams = new URLSearchParams(hash.substring(qIndex));
    const statusParam = urlParams.get('status');
    if (statusParam && statusSelect) {
      statusSelect.value = statusParam;
    }
  }

  function updateSyncBadge(statusMsg) {
    if (!syncBadgeText) return;
    if (statusMsg) {
      syncBadgeText.textContent = statusMsg;
      return;
    }
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    syncBadgeText.textContent = `Live Synced: ${timeStr} (${masterUsersList.length} Users)`;
  }

  // Instant Client-Side In-Memory Filtering (0ms, 0 Egress)
  function applyFilters() {
    const rawQ = String(searchInput?.value || '').trim().toLowerCase();
    const statusVal = statusSelect?.value || 'all';
    const selectedDate = dateInput?.value || null; // Format: YYYY-MM-DD
    const sortVal = sortSelect?.value || 'default';

    let result = [...masterUsersList];

    // 1. Text Search Filter (Multi-Field)
    if (rawQ) {
      result = result.filter(u => {
        const nameMatch = String(u.name || '').toLowerCase().includes(rawQ);
        const mobileMatch = String(u.mobile || '').replace(/\D/g, '').includes(rawQ.replace(/\D/g, ''));
        const emailMatch = String(u.email || '').toLowerCase().includes(rawQ);
        const shareIdMatch = String(u.shareId || '').toLowerCase().includes(rawQ);
        return nameMatch || mobileMatch || emailMatch || shareIdMatch;
      });
    }

    // 2. Status Filter
    if (statusVal !== 'all') {
      if (statusVal === 'wallet_earners') {
        result = result.filter(u => (u.sharePointsEarned || 0) > 0 || (u.walletBalance || 0) > 0);
      } else if (statusVal === 'active_sharers') {
        result = result.filter(u => (u.totalShares || 0) > 0 || (u.totalClicks || 0) > 0);
      } else if (statusVal === 'has_referrals') {
        result = result.filter(u => (u.directReferrals || 0) > 0);
      } else if (statusVal === 'installed') {
        result = result.filter(u => u.appInstalled === true || String(u.source || '').toLowerCase().includes('pwa') || String(u.source || '').toLowerCase().includes('app'));
      } else if (statusVal === 'web') {
        result = result.filter(u => !u.appInstalled && !String(u.source || '').toLowerCase().includes('pwa') && !String(u.source || '').toLowerCase().includes('app'));
      } else if (statusVal === 'active') {
        result = result.filter(u => u.status === 'active');
      } else if (statusVal === 'inactive') {
        result = result.filter(u => u.status === 'inactive');
      }
    }

    // 3. Date Filter (Timezone-safe Indian Standard Time match)
    if (selectedDate) {
      result = result.filter(u => {
        const reg = u.registrationDate || u.createdAt;
        if (!reg) return false;
        try {
          const d = new Date(reg);
          if (isNaN(d.getTime())) return false;
          // toLocaleDateString('en-CA') returns exact YYYY-MM-DD in local time
          return d.toLocaleDateString('en-CA') === selectedDate;
        } catch (_) {
          return false;
        }
      });
    }

    // 4. Sorting
    if (sortVal && sortVal !== 'default' && result.length > 0) {
      if (sortVal === 'sakhiChats') {
        result.sort((a, b) => (b.sakhiChatCount || 0) - (a.sakhiChatCount || 0));
      } else {
        result.sort((a, b) => (Number(b[sortVal]) || 0) - (Number(a[sortVal]) || 0));
      }
    } else {
      // Default: Most recent registrations first
      result.sort((a, b) => new Date(b.registrationDate || b.createdAt || 0) - new Date(a.registrationDate || a.createdAt || 0));
    }

    currentUsersData = result;
    currentUsersPage = 1;

    // Calculate aggregated metrics across master users
    let totalAllPoints = 0;
    let totalAllShares = 0;
    let totalAllClicks = 0;
    masterUsersList.forEach(u => {
      totalAllPoints += (u.sharePointsEarned || 0);
      totalAllShares += (u.totalShares || 0);
      totalAllClicks += (u.totalClicks || 0);
    });

    if (usersCountLabel) {
      usersCountLabel.innerHTML = `
        <span>Showing <strong>${currentUsersData.length}</strong> of ${masterUsersList.length} users</span>
        <span style="display:inline-flex;gap:14px;align-items:center;flex-wrap:wrap;">
          <span style="color:#f59e0b;font-weight:800;">🪙 कुल बांटे गए पॉइंट्स: <strong>${totalAllPoints.toLocaleString('en-IN')}</strong></span>
          <span style="color:#38bdf8;font-weight:800;">📲 कुल शेयर्स: <strong>${totalAllShares.toLocaleString('en-IN')}</strong></span>
          <span style="color:#4ade80;font-weight:800;">👆 कुल क्लिक्स: <strong>${totalAllClicks.toLocaleString('en-IN')}</strong></span>
        </span>
      `;
    }
    renderTableWithPagination();
  }

  // Load Full Users List (Runs on first page load or Hard Refresh)
  async function loadInitialUsers(forceRefresh = false) {
    container.innerHTML = '<div class="admin-loading">डेटाबेस से यूज़र्स लोड हो रहे हैं…</div>';
    updateSyncBadge('Syncing...');

    const result = await fetchUsers({ forceRefresh });
    if (result.success && Array.isArray(result.data)) {
      masterUsersList = result.data;
      lastSyncTimestamp = new Date().toISOString();
      updateSyncBadge();
    } else {
      console.error("fetchUsers failed:", result.error);
      updateSyncBadge('⚠️ Sync failed');
    }

    applyFilters();
  }

  // Delta Sync: Fetches ONLY new records since last sync (Zero egress leak)
  async function syncDeltaUsers() {
    if (!lastSyncTimestamp || masterUsersList.length === 0) {
      return await loadInitialUsers(true);
    }

    if (syncDeltaBtn) {
      syncDeltaBtn.disabled = true;
      syncDeltaBtn.innerHTML = '<span>⏳</span> Syncing...';
    }
    updateSyncBadge('Checking for new records...');

    try {
      const deltaRes = await fetchUsersDelta(lastSyncTimestamp);
      if (deltaRes.success) {
        const { newProfiles, newPurchases, newSakhi } = deltaRes;
        let changeCount = 0;

        // Merge new or updated profiles
        if (newProfiles && newProfiles.length > 0) {
          newProfiles.forEach(np => {
            const existingIdx = masterUsersList.findIndex(u => u.id === np.id);
            const userObj = {
              id: np.id,
              name: np.full_name,
              mobile: np.mobile,
              email: np.email,
              source: np.registration_source || 'Direct',
              status: np.is_active ? 'active' : 'inactive',
              shareId: np.share_id || np.referral_code || (String(np.mobile || '').replace(/\D/g, '').slice(-6) ? ('AI' + String(np.mobile || '').replace(/\D/g, '').slice(-6)) : 'AI000004'),
              directReferrals: 0,
              totalShares: 0,
              totalClicks: 0,
              totalVisitors: 0,
              totalDirectPurchases: 0,
              totalPurchases: 0,
              totalSpent: 0,
              totalDownloads: 0,
              downloadLimit: 0,
              appInstalled: String(np.registration_source || '').toLowerCase().includes('pwa') || String(np.registration_source || '').toLowerCase().includes('app'),
              appInstalledAt: null,
              registrationDate: np.created_at || null,
              createdAt: np.created_at || null,
              webinarLeads: 0,
              webinarJoined: 0,
              webinarAttendees: [],
              sakhiChatCount: 0,
              sakhiPrimaryDomain: null,
              sakhiLastTopic: null,
              sakhiRecoEbook: 'BK002'
            };

            if (existingIdx !== -1) {
              masterUsersList[existingIdx] = { ...masterUsersList[existingIdx], ...userObj };
            } else {
              masterUsersList.unshift(userObj);
              changeCount++;
            }
          });
        }

        // Merge new purchases to update total purchases and spend
        if (newPurchases && newPurchases.length > 0) {
          newPurchases.forEach(pur => {
            const u = masterUsersList.find(x => x.id === pur.profile_id);
            if (u) {
              const bIds = String(pur.book_id || '').split(',').map(x => x.trim()).filter(Boolean);
              const count = bIds.length > 0 ? bIds.length : 1;
              u.totalPurchases = (u.totalPurchases || 0) + count;
              u.totalSpent = (u.totalSpent || 0) + (Number(pur.amount) || 0);
              u.downloadLimit = (u.totalPurchases || 0) * 3;
              changeCount++;
            }
          });
        }

        // Merge new Sakhi chats
        if (newSakhi && newSakhi.length > 0) {
          newSakhi.forEach(sak => {
            const cleanM = String(sak.mobile || '').replace(/\D/g, '').slice(-10);
            const u = masterUsersList.find(x => x.id === sak.profile_id || (cleanM && String(x.mobile || '').includes(cleanM)));
            if (u) {
              u.sakhiChatCount = sak.interaction_count || u.sakhiChatCount || 1;
              u.sakhiPrimaryDomain = sak.primary_domain || u.sakhiPrimaryDomain;
              changeCount++;
            }
          });
        }

        lastSyncTimestamp = new Date().toISOString();
        updateSyncBadge();
        applyFilters();

        if (changeCount > 0) {
          console.log(`[Admin] ⚡ Delta sync: ${changeCount} updates applied successfully.`);
        }
      } else {
        // Fallback to full load if delta failed
        await loadInitialUsers(true);
      }
    } catch (err) {
      console.warn("Delta sync failed, performing full refresh:", err);
      await loadInitialUsers(true);
    } finally {
      if (syncDeltaBtn) {
        syncDeltaBtn.disabled = false;
        syncDeltaBtn.innerHTML = '<span>⚡</span> Sync New';
      }
    }
  }

  function renderTableWithPagination() {
    container.innerHTML = renderUsersTable(currentUsersData);

    document.getElementById('users-prev-page')?.addEventListener('click', () => {
      if (currentUsersPage > 1) {
        currentUsersPage--;
        renderTableWithPagination();
      }
    });

    document.getElementById('users-next-page')?.addEventListener('click', () => {
      const totalPages = Math.ceil(currentUsersData.length / PAGE_SIZE) || 1;
      if (currentUsersPage < totalPages) {
        currentUsersPage++;
        renderTableWithPagination();
      }
    });
  }

  function exportToCsv() {
    if (currentUsersData.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = [
        "Name", "Mobile", "Reg. Source", "Share ID", "Direct Referrals", 
        "Total Shares", "Total Clicks", "Total Direct Purchases", 
        "Total Purchases", "Total Spent", "Total Downloads", "Download Limit", "Status", "Registration Date"
    ];
    const rows = currentUsersData.map(user => [
        `"${(user.name || '').replace(/"/g, '""')}"`,
        `"${user.mobile || ''}"`,
        `"${user.source || ''}"`,
        `"${user.shareId || ''}"`,
        user.directReferrals || 0,
        user.totalShares || 0,
        user.totalClicks || 0,
        user.totalDirectPurchases || 0,
        user.totalPurchases || 0,
        user.totalSpent || 0,
        user.totalDownloads || 0,
        user.downloadLimit || 0,
        `"${user.status || ''}"`,
        `"${user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('en-CA') : ''}"` // YYYY-MM-DD
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `aarogyam_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Debounced search for zero-lag instant filtering
  let searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        applyFilters();
      }, 100);
    });
  }

  if (statusSelect) statusSelect.addEventListener('change', applyFilters);
  if (dateInput) dateInput.addEventListener('change', applyFilters);
  if (clearDateBtn) {
    clearDateBtn.addEventListener('click', () => {
      if (dateInput) dateInput.value = '';
      applyFilters();
    });
  }
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  if (exportBtn) exportBtn.addEventListener('click', exportToCsv);

  if (syncDeltaBtn) syncDeltaBtn.addEventListener('click', syncDeltaUsers);
  if (hardRefreshBtn) hardRefreshBtn.addEventListener('click', () => loadInitialUsers(true));

  // Listen to global admin search
  document.addEventListener('admin:global-search', (e) => {
    if (searchInput) {
      searchInput.value = e.detail?.query || '';
      applyFilters();
    }
  });

  // Handle clicks on data-route links, webinar report drawers, and status toggles inside the table
  container.addEventListener('click', async (e) => {
    const wbReportBtn = e.target.closest('.btn-user-wb-report');
    if (wbReportBtn) {
      const uId = wbReportBtn.dataset.userId;
      const targetUser = currentUsersData.find(u => u.id === uId);
      if (targetUser) {
        openUserWebinarReportDrawer(targetUser);
      }
      return;
    }

    const link = e.target.closest('[data-route^="user-details"]');
    if (link) {
      e.preventDefault();
      const uId = link.dataset.id || (link.getAttribute('href') ? new URLSearchParams(link.getAttribute('href').substring(link.getAttribute('href').indexOf('?'))).get('id') : null);
      if (uId) {
        sessionStorage.setItem('admin_last_viewed_user_id', uId);
        if (typeof window.navigateTo === 'function') {
          window.navigateTo(`user-details?id=${encodeURIComponent(uId)}`);
        } else {
          window.location.hash = `user-details?id=${encodeURIComponent(uId)}`;
        }
        return;
      }
    }

    const toggleBtn = e.target.closest('.admin-status-toggle');
    if (toggleBtn) {
        const userId = toggleBtn.dataset.userId;
        const currentStatus = toggleBtn.dataset.currentStatus;
        const newStatusBool = currentStatus === 'inactive';

        const originalText = toggleBtn.textContent;
        toggleBtn.disabled = true;
        toggleBtn.textContent = '...';

        const result = await updateUserStatus(userId, newStatusBool);

        if (result.success) {
            const newStatusString = newStatusBool ? 'active' : 'inactive';
            toggleBtn.dataset.currentStatus = newStatusString;
            toggleBtn.textContent = newStatusString.toUpperCase();
            toggleBtn.classList.remove('active', 'inactive');
            toggleBtn.classList.add(newStatusString);

            // Live-sync the in-memory master list
            const targetU = masterUsersList.find(x => x.id === userId);
            if (targetU) targetU.status = newStatusString;
        } else {
            alert('Failed to update status. Please try again.');
            toggleBtn.textContent = originalText; // revert text
        }
        toggleBtn.disabled = false;
    }

    const deleteBtn = e.target.closest('.btn-delete-user');
    if (deleteBtn) {
      const uId = deleteBtn.dataset.userId;
      const uName = deleteBtn.dataset.userName || 'इस यूज़र';
      if (!confirm(`⚠️ क्या आप वाकई "${uName}" (ID: ${uId}) को डेटाबेस से हमेशा के लिए हटाना चाहते हैं?\n\nयह कार्यवाही वापस नहीं ली जा सकती!`)) {
        return;
      }
      deleteBtn.disabled = true;
      deleteBtn.textContent = 'हटाया जा रहा...';
      const delRes = await deleteUserProfile(uId);
      if (delRes.success) {
        alert(`✅ यूज़र "${uName}" सफलतापूर्वक हटा दिया गया है।`);
        masterUsersList = masterUsersList.filter(x => x.id !== uId);
        applyFilters();
      } else {
        alert('हटाने में त्रुटि: ' + (delRes.error || 'अज्ञात त्रुटि'));
        deleteBtn.disabled = false;
        deleteBtn.textContent = '🗑️ हटाएं';
      }
      return;
    }
  });

function openUserWebinarReportDrawer(user) {
  let drawer = document.getElementById('adm-user-webinar-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'adm-user-webinar-drawer';
    drawer.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 600px;
      background: #0f172a;
      border-left: 2px solid #3b82f6;
      box-shadow: -10px 0 35px rgba(0,0,0,0.85);
      z-index: 100000;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(drawer);
  }

  const sanitizedMobile = String(user.mobile || '').replace(/\D/g, '');
  const userShareId = user.shareId || 'AI000004';
  const webinarShareUrl = `https://aarogyamindia.online/webinar.html?ref=${encodeURIComponent(userShareId)}`;
  const attendees = user.webinarAttendees || [];
  const leadsCount = user.webinarLeads || 0;
  const joinedCount = user.webinarJoined || 0;
  const conversionRate = leadsCount ? Math.round((joinedCount / leadsCount) * 100) : 0;

  drawer.innerHTML = `
    <!-- Header -->
    <div style="padding: 16px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 1.05rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
          <span>🎥</span> <span>वेबिनार रिपोर्ट (Webinar Performance)</span>
        </div>
        <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 3px;">
          👤 <strong>${user.name}</strong> • <code>${userShareId}</code> • 📞 ${user.mobile}
        </div>
      </div>
      <button type="button" id="close-user-wb-drawer" style="background:transparent; border:none; color:#94a3b8; font-size:1.5rem; cursor:pointer; line-height:1;">✕</button>
    </div>

    <!-- Body Content -->
    <div style="flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- Referral Link Box -->
      <div style="background: rgba(37,99,235,0.08); border: 1.5px dashed #3b82f6; border-radius: 12px; padding: 12px 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.75rem; font-weight:700; color:#93c5fd;">🌐 इस यूजर का व्यक्तिगत वेबिनार आमंत्रण लिंक:</span>
          <span class="admin-pill" style="font-size:0.7rem; background:#10b981; color:#fff;">Active Link</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" readonly value="${webinarShareUrl}" id="user-wb-link-input" style="flex:1; background:#0b0f19; border:1px solid #1e293b; border-radius:6px; color:#60a5fa; padding:6px 10px; font-size:0.8rem; font-weight:700; outline:none;" />
          <button type="button" id="btn-copy-user-wb-link" class="admin-button small-button" style="background:#2563eb; color:#fff; font-weight:700; font-size:0.75rem; white-space:nowrap;">
            📋 कॉपी
          </button>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`🌾 *आरोग्यम इंडिया लाइव कृषि वेबिनार*\n\n👉 *मुफ्त रजिस्ट्रेशन व ज़ूम लिंक:*\n${webinarShareUrl}`)}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; font-weight:700; font-size:0.75rem; white-space:nowrap; text-decoration:none;">
            💬 शेयर
          </a>
        </div>
      </div>

      <!-- 3 Metrics KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">कुल रजिस्ट्रेशन</div>
          <div style="font-size: 1.4rem; font-weight: 900; color: #60a5fa; margin-top: 2px;">${leadsCount}</div>
          <div style="font-size: 0.68rem; color: #64748b;">Registered Leads</div>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">ज़ूम अटेंडेंस</div>
          <div style="font-size: 1.4rem; font-weight: 900; color: #34d399; margin-top: 2px;">${joinedCount}</div>
          <div style="font-size: 0.68rem; color: #64748b;">Live Attended</div>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">अटेंडेंस दर</div>
          <div style="font-size: 1.4rem; font-weight: 900; color: #fbbf24; margin-top: 2px;">${conversionRate}%</div>
          <div style="font-size: 0.68rem; color: #64748b;">Turnout Ratio</div>
        </div>
      </div>

      <!-- Attendees Table -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size: 0.9rem; font-weight: 800; color: #fff;">
            👥 रजिस्टर्ड किसानों की सूची (${attendees.length})
          </div>
          ${attendees.length > 0 ? `
            <button type="button" id="btn-export-user-wb-csv" class="admin-button small-button" style="font-size:0.72rem; padding:3px 8px;">
              📥 CSV डाउनलोड
            </button>
          ` : ''}
        </div>

        ${attendees.length === 0 ? `
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 24px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
            <span style="font-size: 1.8rem; display: block; margin-bottom: 6px;">🌾</span>
            इस यूजर के रेफरल लिंक से अभी कोई वेबिनार रजिस्ट्रेशन नहीं हुआ है।<br>
            <span style="font-size: 0.75rem; color: #64748b;">रेफरल लिंक शेयर करते ही आने वाले किसान यहाँ स्वतः दिखेंगे।</span>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${attendees.map((att, idx) => {
              const attMob = String(att.mobile || '').replace(/\D/g, '');
              const waMob = attMob.length === 10 ? '91' + attMob : attMob;
              const waMsg = encodeURIComponent(`नमस्ते ${att.name} जी! मैं आरोग्यम इंडिया से बात कर रहा हूँ। आपने हमारे लाइव वेबिनार में भाग लिया था...`);
              const regDate = att.registeredAt ? new Date(att.registeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

              return `
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #fff; display: flex; align-items: center; gap: 6px;">
                      <span>#${idx + 1}</span>
                      <span>${att.name}</span>
                      ${att.isJoined 
                        ? `<span style="background:rgba(16,185,129,0.2); color:#34d399; border:1px solid rgba(16,185,129,0.4); font-size:0.65rem; font-weight:800; padding:1px 6px; border-radius:10px;">🟢 Live Joined</span>` 
                        : `<span style="background:rgba(148,163,184,0.15); color:#cbd5e1; font-size:0.65rem; font-weight:700; padding:1px 6px; border-radius:10px;">⏳ Registered</span>`
                      }
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">
                      📍 ${att.district || att.state || 'स्थान उपलब्ध नहीं'} • 📅 ${regDate}
                    </div>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <a href="tel:${attMob}" class="admin-button small-button" style="background:#0f172a; border:1px solid #475569; color:#94a3b8; font-size:0.75rem; padding:3px 8px; text-decoration:none;" title="Direct Call">
                      📞 Call
                    </a>
                    <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; border-color:#22c55e; font-size:0.75rem; padding:3px 8px; text-decoration:none; display:inline-flex; align-items:center; gap:3px;" title="WhatsApp Follow-up">
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

    </div>
  `;

  // Animate Open
  requestAnimationFrame(() => {
    drawer.style.transform = 'translateX(0)';
  });

  // Attach Close & Copy handlers
  document.getElementById('close-user-wb-drawer')?.addEventListener('click', () => {
    drawer.style.transform = 'translateX(100%)';
  });

  document.getElementById('btn-copy-user-wb-link')?.addEventListener('click', function () {
    const input = document.getElementById('user-wb-link-input');
    if (input) {
      navigator.clipboard.writeText(input.value);
      const btn = this;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = '📋 कॉपी'; }, 2000);
    }
  });

  document.getElementById('btn-export-user-wb-csv')?.addEventListener('click', () => {
    const headers = ["#", "Name", "Mobile", "District", "State", "Registration Date", "Live Joined Status"];
    const rows = attendees.map((att, i) => [
      i + 1,
      `"${(att.name || '').replace(/"/g, '""')}"`,
      `"${att.mobile || ''}"`,
      `"${att.district || ''}"`,
      `"${att.state || ''}"`,
      `"${att.registeredAt ? new Date(att.registeredAt).toISOString() : ''}"`,
      att.isJoined ? "Joined Live" : "Registered Only"
    ].join(','));
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `webinar_leads_${user.shareId || 'user'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

  // Initial load of users with in-memory caching and instant zero-egress filtering
  await loadInitialUsers();
}

// =========================================================================
// 🌟 USER-LEVEL SAKHI AI CREDIT & QUOTA MANAGEMENT MODAL
// =========================================================================
window.openUserQuotaModal = function(userId, mobile, name, status) {
  const existing = document.getElementById('userCustomQuotaModal');
  if (existing) existing.remove();

  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  let customMap = {};
  try {
    customMap = JSON.parse(localStorage.getItem('SAKHI_CUSTOM_USER_QUOTAS') || '{}');
  } catch(e) {}
  const uQuota = customMap[cleanMobile] || {};

  const bonusImg = uQuota.bonusImages || 0;
  const bonusChat = uQuota.bonusChats || 0;
  const customImg = typeof uQuota.customImages === 'number' ? uQuota.customImages : '';
  const customChat = typeof uQuota.customChats === 'number' ? uQuota.customChats : '';
  const isBlocked = Boolean(uQuota.blocked);

  const modal = document.createElement('div');
  modal.id = 'userCustomQuotaModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.8);backdrop-filter:blur(6px);z-index:99999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
  
  modal.innerHTML = `
    <div style="background:#ffffff;border-radius:20px;max-width:440px;width:100%;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,0.4);border:1.5px solid #38bdf8;box-sizing:border-box;color:#0f172a;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #e2e8f0;padding-bottom:10px;">
        <h3 style="margin:0;font-size:1.15rem;font-weight:900;color:#0f172a;display:flex;align-items:center;gap:8px;">
          <span>⚡</span> सखी AI यूजर क्रेडिट कस्टमाइज़ेशन
        </h3>
        <button type="button" onclick="document.getElementById('userCustomQuotaModal').remove()" style="background:#f1f5f9;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.1rem;color:#64748b;">&times;</button>
      </div>

      <div style="background:#f8fafc;border-radius:10px;padding:10px 12px;margin-bottom:14px;font-size:0.84rem;">
        <div>👤 <strong>यूजर नाम:</strong> ${name || 'N/A'}</div>
        <div>📱 <strong>मोबाइल:</strong> ${cleanMobile || 'N/A'}</div>
        <div>⚡ <strong>सिस्टम स्टेटस:</strong> <span style="font-weight:800;color:${status === 'active' ? '#15803d' : '#ca8a04'};">${(status || 'INACTIVE').toUpperCase()}</span></div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px;">
        <!-- Bonus Credits -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="font-size:0.75rem;font-weight:800;color:#334155;display:block;margin-bottom:4px;">🎁 बोनस फोटो (+Images):</label>
            <input type="number" id="modalUserBonusImages" value="${bonusImg}" min="0" max="500" class="admin-input" style="width:100%;box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:800;color:#334155;display:block;margin-bottom:4px;">🎁 बोनस चैट (+Chats):</label>
            <input type="number" id="modalUserBonusChats" value="${bonusChat}" min="0" max="5000" class="admin-input" style="width:100%;box-sizing:border-box;" />
          </div>
        </div>

        <!-- Custom Limit Override -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="font-size:0.75rem;font-weight:800;color:#334155;display:block;margin-bottom:4px;">⚙️ फिक्स फोटो सीमा:</label>
            <input type="number" id="modalUserCustomImages" placeholder="डिफ़ॉल्ट" value="${customImg}" min="0" max="1000" class="admin-input" style="width:100%;box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:800;color:#334155;display:block;margin-bottom:4px;">⚙️ फिक्स चैट सीमा:</label>
            <input type="number" id="modalUserCustomChats" placeholder="डिफ़ॉल्ट" value="${customChat}" min="0" max="10000" class="admin-input" style="width:100%;box-sizing:border-box;" />
          </div>
        </div>

        <!-- Block Gemini API for this user -->
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:0.80rem;font-weight:900;color:#b91c1c;">🛑 जेमिनी AI एक्सेस ब्लॉक करें</div>
            <div style="font-size:0.70rem;color:#7f1d1d;">इस यूजर के लिए सखी AI पूरी तरह बंद करें</div>
          </div>
          <input type="checkbox" id="modalUserBlockGemini" ${isBlocked ? 'checked' : ''} style="width:18px;height:18px;accent-color:#dc2626;cursor:pointer;" />
        </div>
      </div>

      <div style="display:flex;gap:8px;">
        <button type="button" id="modalSaveUserQuotaBtn" style="flex:1;background:#0284c7;color:#fff;border:none;border-radius:10px;padding:10px;font-weight:900;font-size:0.90rem;cursor:pointer;">
          💾 क्रेडिट सेटिंग सुरक्षित करें
        </button>
        <button type="button" onclick="document.getElementById('userCustomQuotaModal').remove()" style="background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer;">
          रद्द करें
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('modalSaveUserQuotaBtn').onclick = function() {
    const bImg = Number(document.getElementById('modalUserBonusImages').value) || 0;
    const bChat = Number(document.getElementById('modalUserBonusChats').value) || 0;
    const cImgRaw = document.getElementById('modalUserCustomImages').value.trim();
    const cChatRaw = document.getElementById('modalUserCustomChats').value.trim();
    const blocked = Boolean(document.getElementById('modalUserBlockGemini').checked);

    customMap[cleanMobile] = {
      bonusImages: bImg,
      bonusChats: bChat,
      customImages: cImgRaw !== '' ? Number(cImgRaw) : undefined,
      customChats: cChatRaw !== '' ? Number(cChatRaw) : undefined,
      blocked: blocked,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('SAKHI_CUSTOM_USER_QUOTAS', JSON.stringify(customMap));
    if (window.SakhiModeration) {
      if (blocked && typeof window.SakhiModeration.adminBlockUser === 'function') {
        window.SakhiModeration.adminBlockUser(cleanMobile, 24, 'Admin Users Modal Block');
      } else if (!blocked && typeof window.SakhiModeration.adminUnblockUser === 'function') {
        window.SakhiModeration.adminUnblockUser(cleanMobile);
      }
    }
    alert(`✅ ${name} (${cleanMobile}) के सखी AI क्रेडिट सफलतापूर्वक अपडेट किए गए!`);
    modal.remove();
  };
};

// =========================================================================
// 1-CLICK DEVICE RESET HELPER (Enables customer login on a new phone)
// =========================================================================
window.resetUserDevice = async function(userId, mobile, btnEl) {
  const cleanMob = String(mobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMob) {
    alert("यूजर का मोबाइल नंबर उपलब्ध नहीं है।");
    return;
  }

  if (!confirm(`क्या आप मोबाइल +91 ${cleanMob} का डिवाइस रीसेट करना चाहते हैं?\n\nरीसेट करने के बाद यूजर अपने नए फोन पर ई-बुक / सखी AI आसानी से खोल सकेगा।`)) {
    return;
  }

  if (btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = '...';
  }

  try {
    const db = window.dbClient || (window.supabase && typeof window.supabase.from === 'function' ? window.supabase : null);
    if (db) {
      await db.from('surveys').delete().eq('phone_number', cleanMob).eq('event_type', 'device_lock');
    }

    try {
      sessionStorage.removeItem('AI_AUTH_DEV_' + cleanMob);
      localStorage.removeItem('AI_AUTH_DEV_' + cleanMob);
    } catch(_) {}

    const pill = document.getElementById('devStatusPill_' + userId);
    if (pill) {
      pill.textContent = '🔓 Reset';
      pill.style.background = '#dcfce7';
      pill.style.color = '#15803d';
    }

    if (btnEl) {
      btnEl.textContent = '✓ Done';
      btnEl.style.background = '#16a34a';
    }

    alert(`✅ मोबाइल +91 ${cleanMob} का डिवाइस सफलतापूर्वक रीसेट हो गया है!\n\nअब यूजर अपने नए फोन पर सीधे अपनी ई-बुक और सखी AI का उपयोग कर सकते हैं।`);
  } catch(err) {
    console.error("Device reset error:", err);
    alert("डिवाइस रीसेट करने में समस्या आई: " + err.message);
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = '🔄 Reset';
    }
  }
};

// =========================================================================
// 📜 ADMIN USER PASSBOOK MODAL (Full Points Credit / Debit History)
// =========================================================================
window.openAdminUserPassbookModal = function (userId) {
  const user = (masterUsersList && masterUsersList.find(x => x.id === userId)) || (currentUsersData && currentUsersData.find(x => x.id === userId));
  if (!user) {
    alert("उपयोगकर्ता का डेटा नहीं मिला।");
    return;
  }

  const old = document.getElementById('admin-user-passbook-modal');
  if (old) old.remove();

  const ledger = user.passbookLedger || [];
  let ledgerRows = '';

  if (ledger.length === 0) {
    ledgerRows = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:26px;font-size:0.88rem;">अभी तक कोई पॉइंट्स लेन-देन (Transactions) दर्ज नहीं हुआ है।</td></tr>';
  } else {
    ledger.forEach(entry => {
      const isCredit = entry.type === 'credit';
      const sign = isCredit ? '+' : '-';
      const color = isCredit ? '#10b981' : '#ef4444';
      const bg = isCredit ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)';
      const badge = isCredit 
        ? '<span style="background:#dcfce7;color:#15803d;padding:3px 8px;border-radius:6px;font-weight:800;font-size:0.72rem;letter-spacing:0.5px;">CREDIT</span>' 
        : '<span style="background:#fee2e2;color:#b91c1c;padding:3px 8px;border-radius:6px;font-weight:800;font-size:0.72rem;letter-spacing:0.5px;">DEBIT</span>';
      
      const dateStr = entry.created_at 
        ? new Date(entry.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
        : '-';

      ledgerRows += `
        <tr style="background:${bg};border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 12px;font-size:0.8rem;color:#94a3b8;white-space:nowrap;">${dateStr}</td>
          <td style="padding:10px 12px;font-size:0.86rem;color:#f8fafc;font-weight:600;">${entry.title || 'लेन-देन'}</td>
          <td style="padding:10px 12px;text-align:center;">${badge}</td>
          <td style="padding:10px 12px;text-align:right;font-weight:900;font-size:0.95rem;color:${color};white-space:nowrap;">${sign}₹${Math.abs(entry.amount || 0)}</td>
        </tr>
      `;
    });
  }

  const modal = document.createElement('div');
  modal.id = 'admin-user-passbook-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,17,32,0.85);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.innerHTML = `
    <div style="background:#0f172a;border:1.5px solid #334155;border-radius:20px;max-width:640px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 25px 50px rgba(0,0,0,0.85);color:#fff;font-family:system-ui,sans-serif;overflow:hidden;">
      <!-- Modal Header -->
      <div style="padding:16px 20px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;background:#1e293b;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 4px 12px rgba(16,185,129,0.35);">📜</div>
          <div>
            <div style="font-size:1.08rem;font-weight:800;color:#fff;">उपयोगकर्ता पासबुक लेजर (Wallet Passbook)</div>
            <div style="font-size:0.78rem;color:#94a3b8;margin-top:2px;">
              👤 <strong>${user.name}</strong> • <code>${user.shareId || 'AI000004'}</code> • 📞 ${user.mobile}
            </div>
          </div>
        </div>
        <button type="button" onclick="document.getElementById('admin-user-passbook-modal').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#cbd5e1;width:34px;height:34px;border-radius:10px;font-size:1.2rem;cursor:pointer;">&times;</button>
      </div>

      <!-- Quick Summary Cards -->
      <div style="padding:14px 20px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;background:rgba(15,23,42,0.6);border-bottom:1px solid #1e293b;">
        <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:0.72rem;color:#86efac;font-weight:700;">वर्तमान उपलब्ध बैलेंस</div>
          <div style="font-size:1.3rem;font-weight:900;color:#22c55e;margin-top:2px;">₹${user.walletBalance || 0}</div>
        </div>
        <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:0.72rem;color:#fde047;font-weight:700;">कुल अर्जित पॉइंट्स</div>
          <div style="font-size:1.3rem;font-weight:900;color:#f59e0b;margin-top:2px;">+${user.sharePointsEarned || 0}</div>
        </div>
        <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:0.72rem;color:#fca5a5;font-weight:700;">कुल खर्च / रिडीम</div>
          <div style="font-size:1.3rem;font-weight:900;color:#ef4444;margin-top:2px;">-${user.totalSpentPoints || 0}</div>
        </div>
      </div>

      <!-- Passbook Table -->
      <div style="padding:14px 20px;overflow-y:auto;flex:1;">
        <div style="font-size:0.76rem;font-weight:800;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
          क्रेडिट एवं डेबिट लेन-देन इतिहास (Ledger):
        </div>
        <table style="width:100%;border-collapse:collapse;text-align:left;">
          <thead>
            <tr style="border-bottom:1px solid #334155;color:#94a3b8;font-size:0.75rem;">
              <th style="padding:8px 12px;">तारीख</th>
              <th style="padding:8px 12px;">विवरण (Description)</th>
              <th style="padding:8px 12px;text-align:center;">प्रकार</th>
              <th style="padding:8px 12px;text-align:right;">अंक (Points)</th>
            </tr>
          </thead>
          <tbody>
            ${ledgerRows}
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="padding:12px 20px;border-top:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;background:#1e293b;">
        <span style="font-size:0.75rem;color:#94a3b8;">*Aarogyam Manas Zero-Egress Ledger Engine</span>
        <button type="button" onclick="document.getElementById('admin-user-passbook-modal').remove()" style="background:#334155;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-weight:700;cursor:pointer;">बंद करें (Close)</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

