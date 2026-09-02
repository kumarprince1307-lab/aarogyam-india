/* Admin User Details Page — Complete UCAS Data Integration */

import { initAdminLayout } from './admin-main.js';
import { 
  fetchUserDetails, 
  fetchUserUcasDetail, 
  updateUserStatus, 
  fetchAvailableBooks, 
  addManualPurchase, 
  deletePurchase,
  updateUserPermissionAdmin
} from './admin-api.js';

function renderSubscriptionSection(sub) {
  if (!sub) return '';
  const sDate = sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-GB') : '-';
  const eDate = sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString('en-GB') : '-';

  return `
    <div class="admin-section">
      <div class="admin-section-header">
        <div class="admin-section-title">💳 Subscription Details (eBook & Direct)</div>
        <span class="admin-pill ${sub.isActive ? 'active' : ''}" style="font-weight:800;">${sub.status}</span>
      </div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>Plan</h4><p><strong>${sub.plan || 'Basic (1 Year)'}</strong></p></div>
        <div class="admin-data-card"><h4>Subscriber</h4><p><strong style="color:${sub.subscriber === 'YES' ? '#10b981' : '#64748b'};">${sub.subscriber}</strong></p></div>
        <div class="admin-data-card"><h4>Source</h4><p><span class="admin-pill" style="font-size:0.75rem;">${sub.source}</span></p></div>
        <div class="admin-data-card"><h4>Amount</h4><p><strong style="color:#10b981;">${sub.amount}</strong></p></div>
        <div class="admin-data-card"><h4>Start Date (Purchase Date)</h4><p>${sDate}</p></div>
        <div class="admin-data-card"><h4>Expiry Date (1 Year - 1 Day)</h4><p>${eDate}</p></div>
        <div class="admin-data-card"><h4>Payment / Order ID</h4><p><code>${sub.paymentId || 'N/A'}</code></p></div>
        <div class="admin-data-card"><h4>Days Remaining</h4><p><strong>${sub.daysRemaining || 0} Days</strong></p></div>
      </div>
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:12px;margin-top:12px;font-size:0.85rem;">
        <strong style="color:#10b981;">💡 Subscription Rule:</strong> eBook खरीद तारीख (<strong>${sDate}</strong>) ही सब्सक्रिप्शन Start Date है। Expiry Date 1 वर्ष - 1 दिन (<strong>${eDate}</strong>) लागू है।
      </div>
    </div>
  `;
}

function renderPhonebookSection(phonebook) {
  return `
    <div class="admin-section">
      <div class="admin-section-header">
        <div class="admin-section-title">📱 User Phonebook (${(phonebook || []).length} Contacts)</div>
      </div>
      ${(!phonebook || phonebook.length === 0) ? `
        <div class="admin-empty-sm">इस यूजर की फोनबुक में कोई संपर्क नहीं है।</div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Place</th>
                <th>Source</th>
                <th>Added Date</th>
              </tr>
            </thead>
            <tbody>
              ${phonebook.map((c, i) => {
                const sMob = String(c.mobile || '').replace(/\D/g, '');
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td><strong>${c.name}</strong></td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px;">
                        <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:600;">📞 ${c.mobile}</a>
                        ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp">💬</a>` : ''}
                      </div>
                    </td>
                    <td>${c.place || '-'}</td>
                    <td><span class="admin-pill" style="font-size:0.72rem;">${c.source || 'manual'}</span></td>
                    <td>${c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB') : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function renderSurveySection(surveys) {
  return `
    <div class="admin-section">
      <div class="admin-section-header">
        <div class="admin-section-title">📋 User Surveys (${(surveys || []).length} Records)</div>
      </div>
      ${(!surveys || surveys.length === 0) ? `
        <div class="admin-empty-sm">इस यूजर द्वारा कोई सर्वे दर्ज नहीं किया गया है।</div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Category</th>
                <th>Place / District</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${surveys.map((s, i) => {
                const sMob = String(s.mobile || '').replace(/\D/g, '');
                const cats = Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : (s.selected_categories || 'agriculture');
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td><strong>${s.name}</strong></td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px;">
                        <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:600;">📞 ${s.mobile}</a>
                        ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp">💬</a>` : ''}
                      </div>
                    </td>
                    <td><span class="admin-pill active" style="font-size:0.72rem;">${cats.toUpperCase()}</span></td>
                    <td>${s.village || s.district || '-'}</td>
                    <td>${s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB') : '-'}</td>
                    <td>
                      <button type="button" class="admin-button small-button btn-view-survey-json" data-answers='${JSON.stringify(s.category_answers || {})}'>
                        View Answers
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function renderSharingSection(landingPages, detail) {
  const origin = window.location.origin || 'https://aarogyamindia.in';
  return `
    <div class="admin-section">
      <div class="admin-section-header">
        <div class="admin-section-title">🎯 User Landing Pages & Sharing (${(landingPages || []).length} Pages)</div>
      </div>
      ${(!landingPages || landingPages.length === 0) ? `
        <div class="admin-empty-sm">इस यूजर ने अभी कोई लैंडिंग पेज नहीं बनाया है।</div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>LP ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Content</th>
                <th>Surveys</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${landingPages.map(lp => {
                const publicUrl = `${origin}/ucas/landing.html?id=${lp.id}&share_id=${lp.share_id || detail.shareId || 'AI000004'}`;
                return `
                  <tr>
                    <td><code>${lp.id}</code></td>
                    <td><strong>${lp.title}</strong></td>
                    <td><span class="admin-pill" style="font-size:0.72rem;">${(lp.category || '').toUpperCase()}</span></td>
                    <td>${lp.content_type === 'youtube' ? '🎬 YouTube' : '🖼️ Image'}</td>
                    <td><strong style="color:#10b981;">${lp.response_count || 0} Surveys</strong></td>
                    <td>${lp.created_at ? new Date(lp.created_at).toLocaleDateString('en-GB') : '-'}</td>
                    <td>
                      <a href="${publicUrl}" target="_blank" class="admin-button small-button">
                        View Page
                      </a>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function renderUserWebinarSection(surveys, detail) {
  const wbAttendees = (surveys || []).filter(s => {
    const cAns = s.category_answers || {};
    return cAns.event_type === 'webinar_registration' || cAns.event_type === 'webinar_attendance' || s.occupation === 'attendee' || s.selected_categories === 'webinar_lead' || Boolean(cAns.webinar_id);
  });

  const origin = window.location.origin || 'https://aarogyamindia.online';
  const userWebinarLink = `${origin}/webinar.html?ref=${encodeURIComponent(detail.shareId || detail.referralToken || detail.mobile || 'AI000004')}`;
  const joinedCount = wbAttendees.filter(a => (a.category_answers?.event_type === 'webinar_attendance' || Boolean(a.category_answers?.joined_at))).length;
  const leadsCount = wbAttendees.length;
  const turnoutRate = leadsCount ? Math.round((joinedCount / leadsCount) * 100) : 0;

  return `
    <div class="admin-section" style="border: 1.5px solid rgba(59,130,246,0.35); background: rgba(15,23,42,0.65);">
      <div class="admin-section-header" style="flex-wrap:wrap; gap:10px;">
        <div class="admin-section-title" style="display:flex; align-items:center; gap:8px;">
          <span>🎥</span>
          <span>User Webinar Performance & Leads (${leadsCount} Leads)</span>
        </div>
        <div style="display:flex; gap:8px;">
          <a href="${userWebinarLink}" target="_blank" class="admin-button small-button" style="background:#2563eb; color:#fff; font-weight:700; text-decoration:none;">
            🔗 Open Webinar Page
          </a>
        </div>
      </div>

      <!-- Personal Webinar Referral Link Bar -->
      <div style="background: rgba(37,99,235,0.08); border: 1.5px dashed #3b82f6; border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <span style="font-size:0.75rem; font-weight:700; color:#93c5fd; display:block;">🌐 इस यूजर का व्यक्तिगत वेबिनार आमंत्रण लिंक:</span>
          <code style="font-size:0.85rem; font-weight:700; color:#60a5fa;">${userWebinarLink}</code>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="admin-button small-button" onclick="navigator.clipboard.writeText('${userWebinarLink}'); alert('लिंक कॉपी हो गया!');" style="background:#0f172a; border:1px solid #3b82f6; color:#93c5fd; font-weight:700;">
            📋 कॉपी लिंक
          </button>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`🌾 *आरोग्यम इंडिया लाइव कृषि वेबिनार*\n\n👉 *मुफ्त रजिस्ट्रेशन व ज़ूम लिंक:*\n${userWebinarLink}`)}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; font-weight:700; text-decoration:none;">
            💬 WhatsApp शेयर
          </a>
        </div>
      </div>

      <!-- 3 Metrics Grid -->
      <div class="admin-data-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:14px;">
        <div class="admin-data-card" style="border-left: 3px solid #3b82f6;">
          <h4>कुल वेबिनार रजिस्ट्रेशन</h4>
          <p><strong style="font-size:1.3rem; color:#60a5fa;">${leadsCount}</strong> <span style="font-size:0.8rem; color:#94a3b8;">Leads</span></p>
        </div>
        <div class="admin-data-card" style="border-left: 3px solid #10b981;">
          <h4>ज़ूम में शामिल हुए (Live Joined)</h4>
          <p><strong style="font-size:1.3rem; color:#34d399;">${joinedCount}</strong> <span style="font-size:0.8rem; color:#94a3b8;">Attendees</span></p>
        </div>
        <div class="admin-data-card" style="border-left: 3px solid #f59e0b;">
          <h4>टर्नआउट कन्वर्जन दर</h4>
          <p><strong style="font-size:1.3rem; color:#fbbf24;">${turnoutRate}%</strong></p>
        </div>
      </div>

      <!-- Attendees Table -->
      ${wbAttendees.length === 0 ? `
        <div class="admin-empty-sm">इस यूजर के रेफरल लिंक से अभी कोई वेबिनार रजिस्ट्रेशन दर्ज नहीं हुआ है।</div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>किसान का नाम</th>
                <th>मोबाइल नंबर</th>
                <th>स्थान / जिला</th>
                <th>रजिस्ट्रेशन तारीख</th>
                <th>अटेंडेंस स्थिति</th>
                <th>फॉलो-अप</th>
              </tr>
            </thead>
            <tbody>
              ${wbAttendees.map((att, i) => {
                const sMob = String(att.mobile || '').replace(/\D/g, '');
                const waMob = sMob.length === 10 ? '91' + sMob : sMob;
                const waMsg = encodeURIComponent(`नमस्ते ${att.name} जी! मैं आरोग्यम इंडिया से बात कर रहा हूँ। आपने हमारे लाइव वेबिनार में भाग लिया था...`);
                const isJoined = att.category_answers?.event_type === 'webinar_attendance' || Boolean(att.category_answers?.joined_at);
                const regDate = att.category_answers?.registered_at || att.created_at;
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td><strong>${att.name}</strong></td>
                    <td><a href="tel:${sMob}" class="admin-subtle-link" style="font-weight:700;">📞 ${att.mobile}</a></td>
                    <td>${att.district || att.village || att.state || '-'}</td>
                    <td>${regDate ? new Date(regDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td>
                      ${isJoined 
                        ? `<span class="admin-pill active" style="font-weight:800; font-size:0.72rem;">🟢 Live Joined</span>` 
                        : `<span class="admin-pill" style="font-weight:700; font-size:0.72rem; opacity:0.8;">⏳ Registered</span>`
                      }
                    </td>
                    <td>
                      <a href="https://wa.me/${waMob}?text=${waMsg}" target="_blank" class="admin-button small-button" style="background:#25D366; color:#fff; padding:2px 8px; font-weight:700; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                        <span>💬</span> <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function renderActivitySection(activityLogs) {
  return `
    <div class="admin-section">
      <div class="admin-section-header">
        <div class="admin-section-title">⚡ Real Activity Summary (${(activityLogs || []).length} Events)</div>
      </div>
      ${(!activityLogs || activityLogs.length === 0) ? `
        <div class="admin-empty-sm">कोई गतिविधि दर्ज नहीं है।</div>
      ` : `
        <ul class="admin-activity-list" style="max-height:300px;overflow-y:auto;">
          ${activityLogs.map(item => `
            <li>
              <strong>${item.date ? new Date(item.date).toLocaleString('en-GB') : '-'}</strong> — 
              <span style="font-weight:700;">${item.action}</span> 
              <span style="color:var(--admin-muted);font-size:0.85rem;">(${item.detail || ''})</span>
            </li>
          `).join('')}
        </ul>
      `}
    </div>
  `;
}

export const ALL_PERMISSIONS_26 = [
  // 🌟 1. UCAS Media & Marketing Services Permissions (6 Core Services)
  { key: 'image', label: '🖼️ Image Landing Page Post', short: '🖼️ Image', desc: 'इमेज लैंडिंग पेज बनाने की अनुमति', defaultOff: false, isMedia: true, category: 'Media Services' },
  { key: 'youtube', label: '🎥 YouTube Video Post', short: '🎥 YouTube', desc: 'यूट्यूब वीडियो लैंडिंग पेज बनाने की अनुमति', defaultOff: true, isMedia: true, category: 'Media Services' },
  { key: 'facebook', label: '📸 FB/Insta Reel Post', short: '📸 FB/Insta', desc: 'फेसबुक व इंस्टाग्राम रील पोस्ट की अनुमति', defaultOff: true, isMedia: true, category: 'Media Services' },
  { key: 'product_landing', label: '🛒 Product Landing Page', short: '🛒 Product', desc: 'प्रोडक्ट लैंडिंग पेज बनाने व प्रबंधित करने की अनुमति', defaultOff: false, isMedia: true, category: 'Media Services' },
  { key: 'webinar_landing', label: '🎥 Webinar & Live Events', short: '🎥 Webinar', desc: 'वेबिनार लैंडिंग पेज व ज़ूम इवेंट्स की अनुमति', defaultOff: true, isMedia: true, category: 'Media Services' },
  { key: 'hook_templates', label: '✍️ Hook & Shayari Templates', short: '✍️ Shayari', desc: 'हुक व शायरी टेम्पलेट्स का उपयोग करने की अनुमति', defaultOff: false, isMedia: true, category: 'Media Services' },

  // 🛡️ 2. Standard Platform & Profile Permissions (20 Platform Permissions)
  { key: 'profile_view', label: 'Profile View', short: 'Profile View', desc: 'प्रोफाइल देखने की अनुमति', defaultOff: false, category: 'Platform' },
  { key: 'profile_edit', label: 'Profile Edit', short: 'Profile Edit', desc: 'प्रोफाइल एडिट करने की अनुमति', defaultOff: false, category: 'Platform' },
  { key: 'survey_access', label: 'Survey Access', short: 'Survey Acc', desc: 'सर्वे मॉड्यूल एक्सेस', defaultOff: false, category: 'Platform' },
  { key: 'survey_create', label: 'Survey Create', short: 'Survey Add', desc: 'नया सर्वे सबमिट करना', defaultOff: false, category: 'Platform' },
  { key: 'survey_view', label: 'Survey View', short: 'Survey View', desc: 'सर्वे रिकॉर्ड देखना', defaultOff: false, category: 'Platform' },
  { key: 'phonebook_view', label: 'Phonebook View', short: 'Phone View', desc: 'फोनबुक संपर्क देखना', defaultOff: false, category: 'Platform' },
  { key: 'phonebook_add', label: 'Phonebook Add', short: 'Phone Add', desc: 'नया संपर्क जोड़ना', defaultOff: false, category: 'Platform' },
  { key: 'phonebook_import', label: 'Phonebook Import', short: 'Phone Imp', desc: 'फोन व CSV इम्पोर्ट', defaultOff: false, category: 'Platform' },
  { key: 'marketing_view', label: 'Marketing View', short: 'Mktg View', desc: 'मार्केटिंग सेंटर देखना', defaultOff: false, category: 'Platform' },
  { key: 'marketing_create', label: 'Marketing Create', short: 'Mktg Create', desc: 'मैसेज और कैंपेन बनाना', defaultOff: false, category: 'Platform' },
  { key: 'landing_page_view', label: 'Landing Page View', short: 'LP View', desc: 'लैंडिंग पेज सूची देखना', defaultOff: false, category: 'Platform' },
  { key: 'landing_page_create', label: 'Landing Page Create', short: 'LP Create', desc: 'नया लैंडिंग पेज बनाना', defaultOff: false, category: 'Platform' },
  { key: 'landing_page_share', label: 'Landing Page Share', short: 'LP Share', desc: 'लैंडिंग पेज शेयर करना', defaultOff: false, category: 'Platform' },
  { key: 'library_view', label: 'Library View', short: 'Library', desc: 'डिजिटल लाइब्रेरी एक्सेस', defaultOff: false, category: 'Platform' },
  { key: 'subscription_view', label: 'Subscription View', short: 'Sub View', desc: 'सब्सक्रिप्शन विवरण देखना', defaultOff: false, category: 'Platform' },
  { key: 'user_name_visible', label: 'User Name Visible', short: 'Name Vis.', desc: 'सार्वजनिक नाम प्रदर्शन (Default OFF)', defaultOff: true, category: 'Platform' },
  { key: 'directory_visible', label: 'Directory Visible', short: 'Dir Vis.', desc: 'सार्वजनिक डायरेक्टरी लिस्टिंग (Default OFF)', defaultOff: true, category: 'Platform' },
  { key: 'referral_mobile_visible', label: 'Ref. Mobile Visible', short: 'Ref. Mob Vis', desc: 'डायरेक्ट रेफरल मोबाइल नंबर दिखाना', defaultOff: false, category: 'Platform' },
  { key: 'admin_center_visible', label: 'Admin Center Page', short: 'Admin Center', desc: 'My Profile में Admin Center पेज दिखना (Default OFF)', defaultOff: true, category: 'Platform' },
  { key: 'admin_permissions_manage', label: 'Admin Perms Manage', short: 'Admin Perms', desc: 'My Profile Admin Center में परमिशन ऑन/ऑफ की अनुमति (Default OFF)', defaultOff: true, category: 'Platform' }
];

function renderPermissionsSection(userId, userPerms) {
  const map = {};
  (userPerms || []).forEach(p => {
    if (p.permission_key) map[p.permission_key] = Boolean(p.allowed);
  });

  // Check local UCAS media cache
  try {
    const local = JSON.parse(localStorage.getItem(`UCAS_MEDIA_PERMS_${userId}`) || '{}');
    Object.keys(local).forEach(k => {
      if (typeof local[k] !== 'undefined') map[k] = Boolean(local[k]);
    });
  } catch(e) {}

  const mediaPerms = ALL_PERMISSIONS_26.filter(p => p.isMedia);
  const standardPerms = ALL_PERMISSIONS_26.filter(p => !p.isMedia);

  function renderCard(p) {
    const isAllowed = typeof map[p.key] !== 'undefined' ? map[p.key] : !p.defaultOff;
    return `
      <div class="admin-data-card" style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-left: 3px solid ${p.isMedia ? '#10b981' : '#3b82f6'};">
        <div style="flex: 1; padding-right: 8px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
            <code style="font-size:0.82rem;font-weight:700;color:var(--admin-text);">${p.key}</code>
            ${p.isMedia ? '<span style="font-size:0.68rem;background:rgba(16,185,129,0.15);color:#10b981;padding:1px 5px;border-radius:4px;font-weight:700;">Media</span>' : ''}
            ${p.defaultOff ? '<span style="font-size:0.68rem;background:rgba(245,158,11,0.15);color:#f59e0b;padding:1px 5px;border-radius:4px;font-weight:700;">Def OFF</span>' : ''}
          </div>
          <div style="font-size:0.75rem;color:var(--admin-muted);">${p.label}</div>
        </div>
        <label style="display:inline-flex;align-items:center;cursor:pointer;gap:6px;flex-shrink:0;">
          <input type="checkbox" class="user-perm-toggle" data-user-id="${userId}" data-perm-key="${p.key}" ${isAllowed ? 'checked' : ''} style="transform:scale(1.25);cursor:pointer;">
          <span class="perm-status-label" style="font-size:0.82rem;font-weight:800;min-width:28px;color:${isAllowed ? '#10b981' : '#ef4444'};">${isAllowed ? 'ON' : 'OFF'}</span>
        </label>
      </div>
    `;
  }

  return `
    <div class="admin-section">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="margin-bottom: 2px;">🛡️ User Permissions Matrix (Total 26 Permissions)</div>
          <span style="font-size:0.78rem;color:var(--admin-muted);">6 Media & Marketing Services + 20 Platform Permissions (Live Supabase & Cache Sync)</span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btn-detail-perm-safe" class="admin-button small-button" style="background:#3b82f6;color:#fff;font-weight:700;">
            🛡️ Safe Default
          </button>
          <button type="button" id="btn-detail-perm-all-on" class="admin-button small-button" style="background:#10b981;color:#fff;font-weight:700;">
            👑 All 26 ON
          </button>
          <button type="button" id="btn-detail-perm-all-off" class="admin-button small-button" style="background:#ef4444;color:#fff;font-weight:700;">
            ✕ All 26 OFF
          </button>
        </div>
      </div>

      <!-- 1. Media & Marketing Services (6 Permissions) -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.85rem; font-weight: 800; color: #10b981; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>🌟 1. UCAS Media & Marketing Services (6 Permissions)</span>
        </div>
        <div class="admin-data-grid" style="grid-template-columns:repeat(auto-fill, minmax(250px, 1fr));gap:10px;">
          ${mediaPerms.map(renderCard).join('')}
        </div>
      </div>

      <!-- 2. Core Profile & Standard Platform (20 Permissions) -->
      <div>
        <div style="font-size: 0.85rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>🛡️ 2. Core Profile & Platform Controls (20 Permissions)</span>
        </div>
        <div class="admin-data-grid" style="grid-template-columns:repeat(auto-fill, minmax(250px, 1fr));gap:10px;">
          ${standardPerms.map(renderCard).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderProfile(detail, ucasData) {
  if (!detail) return '<div class="admin-empty"><strong>User not found.</strong></div>';

  const sanitizedMobile = String(detail.mobile || '').replace(/\D/g, '');
  const mobileLink = sanitizedMobile 
    ? `<a href="tel:${sanitizedMobile}" class="admin-subtle-link" title="Click to Call">📞 ${detail.mobile}</a>` 
    : (detail.mobile || 'N/A');

  let whatsappButtonHTML = '';
  if (sanitizedMobile) {
      let whatsappNumber = sanitizedMobile;
      if (whatsappNumber.length === 10) {
          whatsappNumber = '91' + whatsappNumber;
      }
      const customerName = detail.name || 'Customer';
      const message = `नमस्ते ${customerName} जी, मैं आरोग्यम इंडिया से बात कर रहा हूँ।`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      whatsappButtonHTML = `<a href="${whatsappUrl}" target="_blank" class="admin-button small-button" style="background:#25D366;color:#fff;border-color:#22c55e;padding:2px 8px;margin-left:8px;" title="WhatsApp Chat">💬 WhatsApp</a>`;
  }

  const sub = ucasData?.subscription || {};
  const phonebook = ucasData?.phonebook || [];
  const surveys = ucasData?.surveys || [];
  const landingPages = ucasData?.landingPages || [];
  const permissions = ucasData?.permissions || [];
  const activityLogs = ucasData?.activityLogs || [];
  const uProfile = ucasData?.profile || {};

  return `
    <div class="admin-section">
      <div class="admin-section-header">
        <div class="admin-section-title">👤 User Profile</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="admin-pill ${detail.status === 'active' ? 'active' : ''}" style="font-weight:800;">${detail.status.toUpperCase()}</span>
          <button 
            class="admin-button small-button admin-status-toggle ${detail.status.toLowerCase()}"
            data-user-id="${detail.id}"
            data-current-status="${detail.status.toLowerCase()}"
            title="Toggle Status"
          >
            Toggle Status
          </button>
        </div>
      </div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>User ID</h4><p><code>${detail.id}</code></p></div>
        <div class="admin-data-card"><h4>Share ID</h4><p><strong style="color:var(--admin-primary);">${detail.shareId || detail.referralToken || 'AI000000'}</strong></p></div>
        <div class="admin-data-card"><h4>Name</h4><p><strong>${detail.name}</strong></p></div>
        <div class="admin-data-card">
          <h4>Mobile</h4>
          <p style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin: 0;">
            ${mobileLink}
            ${whatsappButtonHTML}
          </p>
        </div>
        <div class="admin-data-card"><h4>State / राज्य</h4><p>${uProfile.State || uProfile.state || '-'}</p></div>
        <div class="admin-data-card"><h4>District / जिला</h4><p>${uProfile.district || '-'}</p></div>
        <div class="admin-data-card"><h4>Area / Village</h4><p>${uProfile.village || '-'}</p></div>
        <div class="admin-data-card"><h4>Occupation / व्यवसाय</h4><p>${uProfile.occupation || '-'}</p></div>
        <div class="admin-data-card"><h4>Category</h4><p><span class="admin-pill" style="font-size:0.75rem;">${uProfile.category || 'Basic User'}</span></p></div>
        <div class="admin-data-card"><h4>Email</h4><p>${detail.email || 'N/A'}</p></div>
        <div class="admin-data-card"><h4>Registration Source</h4><p>${detail.source || 'N/A'}</p></div>
        <div class="admin-data-card"><h4>Joined Date & Time</h4><p>${detail.joinedDate || detail.joined || 'N/A'} ${detail.joinedTime || ''}</p></div>
      </div>
    </div>

    <!-- 1. Subscription Section -->
    ${renderSubscriptionSection(sub)}

    <!-- 2. Phonebook Section -->
    ${renderPhonebookSection(phonebook)}

    <!-- 3. Survey Section -->
    ${renderSurveySection(surveys)}

    <!-- 4. Sharing & Landing Pages Section -->
    ${renderSharingSection(landingPages, detail)}

    <!-- 5. User Webinar Performance & Leads Report Section -->
    ${renderUserWebinarSection(surveys, detail)}

    <!-- 6. Real Activity Section -->
    ${renderActivitySection(activityLogs)}

    <!-- 7. Direct Referral Summary Section -->
    ${renderReferralInformation(detail)}

    <!-- 7. Purchases Section -->
    <div class="admin-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <div class="admin-section-title" style="margin-bottom: 0;">💰 Purchase Orders</div>
        <button id="btn-open-add-purchase" class="admin-button small-button" style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="font-size: 1.1rem; font-weight: bold; line-height: 1;">+</span> Add Purchase
        </button>
      </div>
      ${renderPurchases(detail.purchases)}
    </div>

    <!-- 8. Permissions Matrix Section -->
    ${renderPermissionsSection(detail.id, permissions)}
  `;
}

function renderReferralInformation(detail) {
  const referrals = detail.directReferrals || [];
  const directReferralCount = referrals.length;

  const referredByName = detail.referredBy
    ? `<a href="#user-details?id=${detail.referredBy.id}" data-route="user-details" data-id="${detail.referredBy.id}" class="admin-subtle-link">${detail.referredBy.full_name}</a>`
    : 'N/A';

  return `
    <div class="admin-section">
      <div class="admin-section-header">
        <div class="admin-section-title">👥 Direct Referrals Information</div>
      </div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>Referred By</h4><p>${referredByName}</p></div>
        <div class="admin-data-card"><h4>Direct Referrals Count</h4><p><strong>${directReferralCount} Members</strong></p></div>
      </div>
      ${referrals.length === 0 ? `
        <div class="admin-empty-sm" style="margin-top:12px;">कोई डायरेक्ट रेफरल सदस्य नहीं है।</div>
      ` : `
        <div class="admin-table-wrapper" style="margin-top:12px;">
          <table class="admin-table">
            <thead><tr><th>Name</th><th>Mobile</th><th>Total Purchases</th></tr></thead>
            <tbody>
              ${referrals.map(ref => {
                const refSanitized = String(ref.mobile || '').replace(/\D/g, '');
                return `
                  <tr>
                    <td><a href="#user-details?id=${ref.id}" data-route="user-details" data-id="${ref.id}" class="admin-subtle-link">${ref.name || 'Member'}</a></td>
                    <td><a href="tel:${refSanitized}" class="admin-subtle-link">📞 ${ref.mobile}</a></td>
                    <td><strong>${ref.totalPurchases || 0}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function renderPurchases(purchases) {
  if (!purchases || purchases.length === 0) {
    return '<div class="admin-empty"><strong>No purchases found for this user.</strong></div>';
  }
  return `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead><tr><th>Order</th><th>Book</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>${purchases.map(p => `<tr>
          <td>${p.order}</td>
          <td>${p.book}</td>
          <td>${p.amount}</td>
          <td><span class="status-pill ${p.status.toLowerCase()}">${p.status}</span></td>
          <td>${p.date}</td>
          <td>
            <button 
              class="admin-button small-button admin-delete-purchase-btn" 
              data-purchase-id="${p.id || p.order}" 
              data-book-name="${p.book}" 
              style="background-color: var(--admin-danger, #ef4444); border-color: #d73737; padding: 4px 8px; font-size: 0.8rem;"
              title="Delete Purchase"
            >
              Delete
            </button>
          </td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function renderAddPurchaseModalHtml() {
  return `
    <div id="add-purchase-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 10000; padding: 16px;">
      <div class="admin-card" style="width: 100%; max-width: 480px; background: var(--admin-surface-2); border: 1px solid var(--admin-border); border-radius: 16px; padding: 24px; box-shadow: var(--admin-shadow); position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--admin-border); padding-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1.25rem; color: var(--admin-text);">Add Purchase</h3>
          <button type="button" id="btn-close-purchase-modal" style="background: transparent; border: none; font-size: 1.5rem; color: var(--admin-muted); cursor: pointer; line-height: 1;">&times;</button>
        </div>
        <form id="manual-purchase-form" style="display: grid; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Payment ID <span style="color: var(--admin-danger);">*</span></label>
            <input type="text" id="modal-payment-id" class="admin-input" placeholder="e.g. PAY_MANUAL_1001" required style="width: 100%;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Book <span style="color: var(--admin-danger);">*</span></label>
            <select id="modal-book-id" class="admin-select" required style="width: 100%;">
              <option value="">-- Select Book --</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Amount (₹) <span style="color: var(--admin-danger);">*</span></label>
            <input type="number" id="modal-amount" class="admin-input" min="0" step="1" placeholder="e.g. 99" required style="width: 100%;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Status</label>
            <input type="text" id="modal-status" class="admin-input" value="SUCCESS" readonly style="width: 100%; background: rgba(16,185,129,0.1); color: #34d399; font-weight: bold; border-color: rgba(16,185,129,0.3); cursor: not-allowed;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Purchase Date <span style="color: var(--admin-danger);">*</span></label>
            <input type="date" id="modal-purchase-date" class="admin-input" required style="width: 100%;" />
          </div>
          <div id="modal-form-error" style="display: none; color: var(--admin-danger); font-size: 0.9rem; padding: 8px; background: rgba(239,68,68,0.1); border-radius: 8px;"></div>
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;">
            <button type="button" id="btn-cancel-purchase-modal" class="admin-button" style="background: var(--admin-surface-strong); border: 1px solid var(--admin-border); color: var(--admin-text);">Cancel</button>
            <button type="submit" id="btn-submit-purchase" class="admin-button" style="background: var(--admin-primary);">Save Purchase</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export async function initUserDetails() {
  initAdminLayout('User Details', 'Inspect an individual customer profile with full UCAS integration.');

  const content = document.getElementById('page-content');
  if (!content) return;

  // Multi-source extraction of user ID (Hash, URL Search, or SessionStorage)
  let userId = null;
  const hash = window.location.hash || '';
  if (hash.includes('?')) {
    const hashParams = new URLSearchParams(hash.substring(hash.indexOf('?')));
    userId = hashParams.get('id') || hashParams.get('userId') || hashParams.get('user_id');
  }
  if (!userId) {
    const searchParams = new URLSearchParams(window.location.search || '');
    userId = searchParams.get('id') || searchParams.get('userId') || searchParams.get('user_id');
  }
  if (userId) {
    sessionStorage.setItem('admin_last_viewed_user_id', userId);
  } else {
    userId = sessionStorage.getItem('admin_last_viewed_user_id');
  }

  content.innerHTML = `
    <div class="admin-action-row" style="margin-bottom:16px;">
      <button class="admin-button" data-route="users">← Back to Users</button>
    </div>
    <div id="user-details-content"> <div class="admin-loading">Loading user details and UCAS data…</div> </div>
    ${renderAddPurchaseModalHtml()}
  `;

  const container = document.getElementById('user-details-content');
  if (!container) return;

  if (!userId) {
    container.innerHTML = '<div class="admin-error"><strong>No user ID provided.</strong><br>Please go back to the users list and select a user.</div>';
    return;
  }

  // --- Purchase Modal Controls & Form Logic ---
  const modalOverlay = document.getElementById('add-purchase-modal-overlay');
  const modalCloseBtn = document.getElementById('btn-close-purchase-modal');
  const modalCancelBtn = document.getElementById('btn-cancel-purchase-modal');
  const modalForm = document.getElementById('manual-purchase-form');
  const modalBookSelect = document.getElementById('modal-book-id');
  const modalPaymentId = document.getElementById('modal-payment-id');
  const modalAmount = document.getElementById('modal-amount');
  const modalPurchaseDate = document.getElementById('modal-purchase-date');
  const modalError = document.getElementById('modal-form-error');

  function closePurchaseModal() {
    if (modalOverlay) modalOverlay.style.display = 'none';
    if (modalError) {
      modalError.style.display = 'none';
      modalError.textContent = '';
    }
  }

  modalCloseBtn?.addEventListener('click', closePurchaseModal);
  modalCancelBtn?.addEventListener('click', closePurchaseModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closePurchaseModal();
  });

  // Auto-fill price when book is selected
  modalBookSelect?.addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    if (selectedOption && selectedOption.dataset.price) {
      modalAmount.value = selectedOption.dataset.price;
    }
  });

  // Form Submit Handler
  modalForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('btn-submit-purchase');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }
    if (modalError) modalError.style.display = 'none';

    const paymentId = modalPaymentId.value.trim();
    const bookId = modalBookSelect.value.trim();
    const amount = Number(modalAmount.value);
    const purchaseDate = modalPurchaseDate.value;

    const res = await addManualPurchase({
      profileId: userId,
      paymentId,
      bookId,
      amount,
      purchaseDate
    });

    if (res.success) {
      closePurchaseModal();
      modalForm.reset();
      alert('✅ पुस्तक / खरीद सफलतापूर्वक जोड़ दी गई है!');
      await loadAndRender();
    } else {
      if (modalError) {
        modalError.textContent = '❌ ' + (res.error || 'Failed to add purchase.');
        modalError.style.display = 'block';
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Purchase';
    }
  });

  async function loadAndRender() {
    container.innerHTML = '<div class="admin-loading">Loading user details & real UCAS records…</div>';
    const [result, ucasRes] = await Promise.all([
      fetchUserDetails(userId),
      fetchUserUcasDetail(userId)
    ]);

    if (!result.success || !result.data) {
      container.innerHTML = '<div class="admin-error"><strong>Unable to load user details.</strong></div>';
      return;
    }

    const ucasData = ucasRes.success ? ucasRes.data : null;
    container.innerHTML = renderProfile(result.data, ucasData);

    // 1. Bind Open "Add Purchase" Button
    const openAddPurchaseBtn = document.getElementById('btn-open-add-purchase');
    openAddPurchaseBtn?.addEventListener('click', async () => {
      if (modalPaymentId) modalPaymentId.value = 'PAY_MANUAL_' + Date.now();
      if (modalPurchaseDate) modalPurchaseDate.value = new Date().toISOString().split('T')[0];
      if (modalAmount) modalAmount.value = '';
      if (modalError) modalError.style.display = 'none';

      // Populate books list
      if (modalBookSelect) {
        modalBookSelect.innerHTML = '<option value="">-- लोड हो रहा है... --</option>';
        const booksRes = await fetchAvailableBooks();
        const booksList = booksRes.success ? booksRes.data : [];
        modalBookSelect.innerHTML = '<option value="">-- पुस्तक चुनें --</option>' + 
          booksList.map(b => `<option value="${b.id}" data-price="${b.offerPrice || 99}">${b.title || b.name || b.id} (${b.id}) — ₹${b.offerPrice || 99}</option>`).join('');
      }

      if (modalOverlay) modalOverlay.style.display = 'flex';
    });

    // 2. Bind Delete Purchase Buttons
    container.querySelectorAll('.admin-delete-purchase-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pId = btn.dataset.purchaseId;
        const bName = btn.dataset.bookName || 'this book';
        if (confirm(`क्या आप "${bName}" की खरीद को हटाना चाहते हैं?`)) {
          btn.disabled = true;
          btn.textContent = '...';
          const res = await deletePurchase(pId, userId);
          if (res.success) {
            alert('✅ खरीद सफलतापूर्वक हटा दी गई है।');
            await loadAndRender();
          } else {
            alert('❌ खरीद हटाने में त्रुटि: ' + (res.error || 'Unknown error'));
            btn.disabled = false;
            btn.textContent = 'Delete';
          }
        }
      });
    });

    // 3. Bind permissions toggles
    container.querySelectorAll('.user-perm-toggle').forEach(input => {
      input.addEventListener('change', async (e) => {
        const uId = e.target.dataset.userId;
        const key = e.target.dataset.permKey;
        const allowed = e.target.checked;
        const label = e.target.closest('label')?.querySelector('.perm-status-label');

        if (label) {
          label.textContent = allowed ? 'ON' : 'OFF';
          label.style.color = allowed ? '#10b981' : '#ef4444';
        }

        await updateUserPermissionAdmin(uId, key, allowed);
      });
    });

    // 4. Bind Quick Preset Buttons in Permissions Header
    const btnSafePreset = document.getElementById('btn-detail-perm-safe');
    const btnAllOn = document.getElementById('btn-detail-perm-all-on');
    const btnAllOff = document.getElementById('btn-detail-perm-all-off');

    async function applyPresetToAll(predicate) {
      const inputs = container.querySelectorAll('.user-perm-toggle');
      for (const input of inputs) {
        const key = input.dataset.permKey;
        const permObj = ALL_PERMISSIONS_26.find(p => p.key === key);
        const shouldBeOn = predicate(permObj || { key, defaultOff: false });
        input.checked = shouldBeOn;
        const label = input.closest('label')?.querySelector('.perm-status-label');
        if (label) {
          label.textContent = shouldBeOn ? 'ON' : 'OFF';
          label.style.color = shouldBeOn ? '#10b981' : '#ef4444';
        }
        await updateUserPermissionAdmin(userId, key, shouldBeOn);
      }
    }

    btnSafePreset?.addEventListener('click', async () => {
      btnSafePreset.disabled = true;
      btnSafePreset.textContent = 'Applying...';
      await applyPresetToAll(p => !p.defaultOff);
      btnSafePreset.disabled = false;
      btnSafePreset.textContent = '🛡️ Safe Default';
      alert('✅ सुरक्षित डिफ़ॉल्ट (Safe Default) 26 अनुमतियां लागू कर दी गई हैं!');
    });

    btnAllOn?.addEventListener('click', async () => {
      btnAllOn.disabled = true;
      btnAllOn.textContent = 'Applying...';
      await applyPresetToAll(() => true);
      btnAllOn.disabled = false;
      btnAllOn.textContent = '👑 All 26 ON';
      alert('✅ सभी 26 अनुमतियां चालू (ON) कर दी गई हैं!');
    });

    btnAllOff?.addEventListener('click', async () => {
      btnAllOff.disabled = true;
      btnAllOff.textContent = 'Applying...';
      await applyPresetToAll(() => false);
      btnAllOff.disabled = false;
      btnAllOff.textContent = '✕ All 26 OFF';
      alert('✅ सभी 26 अनुमतियां बंद (OFF) कर दी गई हैं!');
    });

    // 5. Bind View Answers button
    container.querySelectorAll('.btn-view-survey-json').forEach(btn => {
      btn.addEventListener('click', () => {
        try {
          const json = JSON.parse(btn.dataset.answers || '{}');
          alert(`Survey Answers:\n\n` + JSON.stringify(json, null, 2));
        } catch (e) {
          alert('No extra answers available.');
        }
      });
    });
  }

  await loadAndRender();

  // Status toggle handler
  container.addEventListener('click', async (e) => {
    const toggleBtn = e.target.closest('.admin-status-toggle');
    if (toggleBtn) {
      const uId = toggleBtn.dataset.userId || userId;
      const currentStatus = toggleBtn.dataset.currentStatus;
      const newStatusBool = currentStatus === 'inactive';

      toggleBtn.disabled = true;
      toggleBtn.textContent = '...';

      const result = await updateUserStatus(uId, newStatusBool);

      if (result.success) {
        await loadAndRender();
      } else {
        alert('Failed to update status.');
        toggleBtn.disabled = false;
      }
    }
  });
}
