/* Admin Webinars & Live Events Management Module */

import { initAdminLayout } from './admin-main.js';

function getAdminDb() {
  if (window.dbClient) return window.dbClient;
  if (window.supabaseClient) return window.supabaseClient;
  if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.dbClient = window.supabase.createClient(
      'https://qjhjrzsnrtahmhswxyvb.supabase.co',
      'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU'
    );
    return window.dbClient;
  }
  return null;
}

const PAGE_SIZE = 20;

/**
 * Format Date (YYYY-MM-DD) and Time (HH:mm) into readable Hindi/English string
 */
function formatHindiDateTime(dateVal, timeVal) {
  if (!dateVal) return '';
  const hindiMonths = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];

  try {
    const parts = dateVal.split('-');
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const monthName = hindiMonths[monthIdx] || parts[1];

    let timeString = '';
    if (timeVal) {
      const [hh, mm] = timeVal.split(':');
      const hNum = parseInt(hh, 10);
      const isPM = hNum >= 12;
      const h12 = hNum % 12 || 12;
      const padM = String(mm).padStart(2, '0');
      const padH = String(h12).padStart(2, '0');
      const ampm = isPM ? 'PM' : 'AM';

      let prahar = 'सायं';
      if (hNum < 12) prahar = 'सुबह';
      else if (hNum >= 12 && hNum < 16) prahar = 'दोपहर';
      else prahar = 'सायं';

      timeString = `, ${prahar} ${padH}:${padM} बजे (${padH}:${padM} ${ampm})`;
    }

    return `${day} ${monthName} ${year}${timeString}`;
  } catch (e) {
    return `${dateVal} ${timeVal || ''}`;
  }
}

/**
 * Construct Direct 1-Click Zoom Join Link
 */
function getDirectZoomJoinUrl(zoomLink, meetingId, passcode) {
  const zLink = (zoomLink || '').trim();
  const mId = (meetingId || '').trim();
  const pass = (passcode || '').trim();
  const cleanId = mId.replace(/[^0-9]/g, '');

  if (zLink && !zLink.includes('zoom.us/join') && (zLink.includes('/j/') || zLink.includes('/my/') || zLink.includes('zoom.us'))) {
    if (pass && !zLink.includes('pwd=') && cleanId) {
      const sep = zLink.includes('?') ? '&' : '?';
      return `${zLink}${sep}pwd=${encodeURIComponent(pass)}`;
    }
    return zLink;
  }

  if (cleanId) {
    return `https://zoom.us/j/${cleanId}${pass ? '?pwd=' + encodeURIComponent(pass) : ''}`;
  }

  return zLink || 'https://zoom.us/join';
}

export async function initWebinars() {
  initAdminLayout('All Webinars & Live Events', 'Manage Zoom and webinar invitation landing pages and registered attendees.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let activeTab = 'webinars'; // 'webinars' | 'attendees'
  let currentPage = 1;
  let allWebinars = [];
  let allRegistrations = [];
  let allProfiles = [];
  let editingWebinarId = null;

  content.innerHTML = `
    <!-- Top Action Row -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>🎥 All Webinars & Live Events Management</span>
            <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Direct 1-Click Zoom Connect</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">
            ज़ूम मीटिंग लिंक, पासवर्ड और इनबिल्ट डेट-टाइम पिकर के साथ वेबिनार बनाएं और रजिस्टर्ड लीड्स को ट्रैक करें।
          </p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button id="btn-toggle-create-webinar" class="admin-button" style="background:#2563eb; color:#fff; font-weight:800; display:inline-flex; align-items:center; gap:6px;">
            <span>➕</span> <span id="btn-create-label">नया ज़ूम वेबिनार बनाएं</span>
          </button>
          <button id="btn-refresh-webinars" class="admin-button small-button">🔄 Refresh Data</button>
        </div>
      </div>

      <!-- Create / Edit Zoom Webinar Form Card -->
      <div id="admin-create-webinar-card" class="admin-card" style="display:none; background: #0f172a; border: 1.5px solid #2563eb; border-radius: 14px; padding: 20px; margin-top: 14px; box-shadow: 0 10px 30px rgba(37,99,235,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <h3 id="form-card-title" style="font-size: 1.05rem; font-weight: 800; color: #60a5fa; display:flex; align-items:center; gap:8px;">
            <span>🎥</span> नया ज़ूम वेबिनार तैयार करें (Fast Zoom Session)
          </h3>
          <button type="button" id="btn-close-create-webinar" class="admin-button small-button" style="background:transparent; color:#94a3b8; border:none; font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>

        <form id="form-admin-create-webinar">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">वेबिनार शीर्षक / Topic: *</label>
              <input type="text" id="adm_wb_title" class="admin-input" placeholder="उदा. आधुनिक जैविक कृषि एवं फसल सुरक्षा लाइव वेबिनार" required style="width:100%;" />
            </div>

            <!-- Inbuilt Date & Time Selector -->
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">
                📅 दिनांक व समय चुनें (Built-in Date & Time Picker): *
              </label>
              <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap: 8px;">
                <input type="date" id="adm_wb_date" class="admin-input" required style="width:100%; padding:8px 10px; color-scheme:dark; font-weight:700;" title="दिनांक चुनें" />
                <input type="time" id="adm_wb_time" class="admin-input" required style="width:100%; padding:8px 10px; color-scheme:dark; font-weight:700;" title="समय चुनें" />
              </div>
              <input type="text" id="adm_wb_datetime" class="admin-input" placeholder="ऑटो-फॉर्मेटेड दिनांक व समय यहाँ दिखेगा" style="width:100%; margin-top:6px; font-size:0.82rem; color:#60a5fa; font-weight:700; background:rgba(255,255,255,0.05);" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">Meeting ID: *</label>
              <input type="text" id="adm_wb_meeting_id" class="admin-input" placeholder="उदा. 823 4567 8901" required style="width:100%;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">Passcode / Password: *</label>
              <input type="text" id="adm_wb_passcode" class="admin-input" placeholder="उदा. AI2026 या 889900" required style="width:100%;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">
                Zoom Direct Join Link: *
                <span style="font-size:0.72rem; color:#10b981; font-weight:600;">(ऑटो-जनरेटेड)</span>
              </label>
              <input type="url" id="adm_wb_zoom_link" class="admin-input" placeholder="https://zoom.us/j/82345678901?pwd=..." required style="width:100%;" />
            </div>
          </div>

          <!-- 9:16 3D FLOATING COVER SECTION -->
          <div style="background: rgba(45,140,255,0.06); border: 1px solid rgba(45,140,255,0.25); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
            <label class="admin-label" style="font-weight:800; font-size:0.86rem; color:#60a5fa; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <span>✨</span> 3D फ्लोटिंग 9:16 कवर (Floating Hero Cover):
            </label>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
              <div>
                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:700;">Git प्री-सेव्ड कवर चुनें:</label>
                <select id="adm_wb_cover_preset" class="admin-select" style="width:100%;">
                  <option value="">✨ डिफ़ॉल्ट 3D बैज (Default 3D Badge)</option>
                  <option value="/images/books/fasal-ka-doctor-cover.webp">🌾 कवर 1: खेती का डॉक्टर</option>
                  <option value="/images/books/kharif-master-guide-2026-cover.webp">📗 कवर 2: खरीफ फसल मास्टर गाइड 2026</option>
                  <option value="/images/books/jaivik-kheti-guide-cover.webp">🌱 कवर 3: जैविक खेती संपूर्ण गाइड</option>
                  <option value="/images/books/ai-website-guide-cover.webp">🤖 कवर 4: डिजिटल AI ट्रेनिंग</option>
                  <option value="custom_url">🔗 कस्टम कवर इमेज URL डालें</option>
                  <option value="custom_upload">📤 नया 9:16 कवर अपलोड करें (Upload Image)</option>
                </select>
              </div>
              <div id="adm_wb_cover_url_wrapper" style="display:none;">
                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:700;">कवर इमेज URL:</label>
                <input type="url" id="adm_wb_cover_url" class="admin-input" placeholder="https://.../cover.webp" style="width:100%;" />
              </div>
              <div id="adm_wb_cover_upload_wrapper" style="display:none;">
                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:700;">इमेज फाइल चुनें (Auto 9:16 WebP):</label>
                <input type="file" id="adm_wb_cover_file" class="admin-input" accept="image/*" style="width:100%; padding:6px;" />
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">
                रजिस्ट्रेशन शुल्क ₹ (टाइप करें - Any Amount):
                <span style="font-size:0.72rem; color:#34d399; font-weight:700;">(0 = फ्री / निःशुल्क)</span>
              </label>
              <div style="position:relative; display:flex; align-items:center;">
                <span style="position:absolute; left:12px; font-weight:800; color:#34d399; font-size:1.05rem;">₹</span>
                <input type="number" id="adm_wb_price" class="admin-input" value="0" min="0" placeholder="0 (फ्री) या 1, 10, 49, 99..." style="width:100%; padding-left:28px; font-weight:800; font-size:1rem; color:#fff;" />
              </div>
            </div>
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">अवधि (Duration Minutes):</label>
              <input type="number" id="adm_wb_duration" class="admin-input" value="90" placeholder="90 मिनट" style="width:100%;" />
            </div>
          </div>

          <!-- MULTIPLE YOUTUBE VIDEOS SECTION -->
          <div style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <label class="admin-label" style="font-weight:800; font-size:0.86rem; color:#f87171; margin:0; display:flex; align-items:center; gap:6px;">
                <span>▶️</span> यूट्यूब वीडियो / लाइव लिंक्स (YouTube URLs):
              </label>
              <button type="button" id="btn-add-yt-url" class="admin-button small-button" style="background:#ef4444; color:#fff; font-size:0.75rem; padding:3px 8px;">
                ➕ और वीडियो जोड़ें
              </button>
            </div>
            <div id="adm_yt_urls_container" style="display:flex; flex-direction:column; gap:8px;">
              <div class="adm-yt-row" style="display:flex; gap:8px;">
                <input type="url" class="admin-input adm-yt-input" placeholder="https://youtube.com/watch?v=..." style="flex:1;" />
              </div>
            </div>
          </div>

          <!-- WEBINAR BANNERS (MULTI-SELECT / UPLOAD / FILE PICKER) -->
          <div style="background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
              <label class="admin-label" style="font-weight:800; font-size:0.86rem; color:#fbbf24; margin:0; display:flex; align-items:center; gap:6px;">
                <span>🖼️</span> वेबिनार पोस्टर्स व बैनर्स (Webinar Banners & Upload):
              </label>
              <div style="display:flex; gap:6px;">
                <label for="adm_wb_banner_file" class="admin-button small-button" style="background:#3b82f6; color:#fff; font-weight:700; font-size:0.75rem; padding:3px 8px; cursor:pointer; margin:0;">
                  📤 बैनर इमेज अपलोड करें
                </label>
                <input type="file" id="adm_wb_banner_file" accept="image/*" style="display:none;" />
                <button type="button" id="btn-add-banner-url" class="admin-button small-button" style="background:#f59e0b; color:#000; font-weight:800; font-size:0.75rem; padding:3px 8px;">
                  ➕ और बैनर लिंक जोड़ें
                </button>
              </div>
            </div>

            <!-- Uploaded Banners Thumbnail Strip -->
            <div id="adm_uploaded_banners_preview" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;"></div>

            <div id="adm_banners_container" style="display:flex; flex-direction:column; gap:8px;">
              <div class="adm-banner-row" style="display:flex; gap:8px;">
                <select class="admin-select adm-banner-select" style="flex:1;">
                  <option value="/images/banners/webinar-live-banner.webp">बैनर 1: लाइव वेबिनार बैनर</option>
                  <option value="/images/banners/agriculture-hero-banner-1.webp">बैनर 2: कृषि हीरो बैनर 1</option>
                  <option value="/images/banners/kheti-dr-banner-1.webp">बैनर 3: खेती डॉक्टर बैनर</option>
                  <option value="/images/banners/farmer-community-banner.jpeg">बैनर 4: किसान कम्युनिटी बैनर</option>
                  <option value="custom">🔗 कस्टम बैनर URL डालें</option>
                </select>
                <input type="url" class="admin-input adm-banner-custom-url" placeholder="https://.../banner.jpg" style="flex:1; display:none;" />
              </div>
            </div>
          </div>

          <!-- MULTI-LINE DESCRIPTION & FEATURE KPIS -->
          <div style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.25); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <label class="admin-label" style="font-weight:800; font-size:0.86rem; color:#34d399; margin:0; display:flex; align-items:center; gap:6px;">
                <span>✨</span> विशेषताएँ व सीखने योग्य बातें (1-Line KPI Highlights):
              </label>
              <button type="button" id="btn-add-kpi-row" class="admin-button small-button" style="background:#10b981; color:#fff; font-size:0.75rem; padding:3px 8px;">
                ➕ और KPI जोड़ें
              </button>
            </div>
            <div id="adm_kpis_container" style="display:flex; flex-direction:column; gap:8px;">
              <div class="adm-kpi-row" style="display:flex; gap:8px;">
                <input type="text" class="admin-input adm-kpi-input" value="जैविक एवं वैज्ञानिक कृषि की आधुनिक तकनीक और पैदावार बढ़ाने के गुर।" style="flex:1;" />
              </div>
              <div class="adm-kpi-row" style="display:flex; gap:8px;">
                <input type="text" class="admin-input adm-kpi-input" value="फसल सुरक्षा, कीट-रोग व खरपतवार का संपूर्ण व व्यावहारिक समाधान।" style="flex:1;" />
              </div>
              <div class="adm-kpi-row" style="display:flex; gap:8px;">
                <input type="text" class="admin-input adm-kpi-input" value="कृषि विशेषज्ञों के साथ सीधे लाइव सवाल-जवाब एवं परामर्श सत्र।" style="flex:1;" />
              </div>
            </div>
          </div>

          <!-- FAQ ACCORDION MANAGEMENT -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <label class="admin-label" style="font-weight:800; font-size:0.86rem; color:#cbd5e1; margin:0; display:flex; align-items:center; gap:6px;">
                <span>❓</span> अक्सर पूछे जाने वाले प्रश्न (FAQ Items):
              </label>
              <button type="button" id="btn-add-faq-row" class="admin-button small-button" style="background:#334155; color:#cbd5e1; font-size:0.75rem; padding:3px 8px;">
                ➕ नया FAQ जोड़ें
              </button>
            </div>
            <div id="adm_faqs_container" style="display:flex; flex-direction:column; gap:10px;">
              <div class="adm-faq-row" style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px;">
                <input type="text" class="admin-input adm-faq-q" value="ज़ूम मीटिंग लिंक और पासवर्ड कब खुलेगा?" placeholder="प्रश्न लिखें..." style="width:100%; margin-bottom:6px;" />
                <textarea class="admin-input adm-faq-a" rows="2" placeholder="उत्तर लिखें..." style="width:100%;">वेबिनार शुरू होने के ठीक 2 मिनट पहले ऊपर दिया गया 'Join Zoom Meeting' बटन स्वतः सक्रिय हो जाएगा।</textarea>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">मुख्य वेबिनार संदेश / विवरण (Description):</label>
            <textarea id="adm_wb_desc" class="admin-input" rows="2" placeholder="इस विशेष लाइव वेबिनार में भाग लेने के लिए अपना नाम और मोबाइल नंबर दर्ज करें। रजिस्ट्रेशन के तुरंत बाद Zoom लिंक और पासवर्ड मिल जाएगा।" style="width:100%;"></textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:14px;">
            <div style="font-size:0.82rem; color:#94a3b8;">
              ℹ️ <strong>1-Click Connect & Zero Egress:</strong> ज़ूम लिंक व पासवर्ड तय समय से 2 मिनट पहले स्वतः अनलॉक होंगे।
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" id="btn-cancel-edit-webinar" class="admin-button" style="display:none; background:transparent; border:1px solid #475569; color:#cbd5e1;">
                रद्द करें (Cancel)
              </button>
              <button type="submit" id="btn-submit-webinar" class="admin-button" style="background:#10b981; color:#fff; font-weight:800; padding:10px 20px; font-size:0.92rem;">
                🚀 ज़ूम वेबिनार प्रकाशित करें (Publish Webinar)
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 14px;">
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #3b82f6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🎥 कुल वेबिनार (Total Webinars)</div>
          <div id="kpi-total-webinars" style="font-size: 1.6rem; font-weight: 800; color: var(--admin-text); margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #10b981;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">👥 कुल रजिस्टर्ड Attendees (Leads)</div>
          <div id="kpi-total-attendees" style="font-size: 1.6rem; font-weight: 800; color: #10b981; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🔗 लाइव Zoom सेशंस (Active Zoom Links)</div>
          <div id="kpi-active-sessions" style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">0</div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div style="display:flex; gap:10px; margin-top:14px; border-bottom: 2px solid var(--admin-border, #334155); padding-bottom: 8px;">
        <button type="button" id="tab-btn-webinars" class="admin-button" style="background:#3b82f6; color:#fff; font-weight:800; font-size:0.88rem; padding:8px 16px;">
          🎥 Webinars List (<span id="tab-count-webinars">0</span>)
        </button>
        <button type="button" id="tab-btn-attendees" class="admin-button" style="background:var(--admin-surface-2, #0f172a); color:var(--admin-muted); font-weight:800; font-size:0.88rem; padding:8px 16px; border:1px solid var(--admin-border, #334155);">
          👥 Attendees Report (<span id="tab-count-attendees">0</span>)
        </button>
      </div>

      <!-- Multi-Filter Bar -->
      <div class="admin-card admin-controls" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; background: var(--admin-surface-2, #0f172a);">
        <input id="webinar-search-box" type="search" placeholder="🔍 नाम, मोबाइल, शीर्षक, क्रिएटर से खोजें..." class="admin-input" style="flex: 2; min-width: 220px;" />

        <select id="webinar-user-filter" class="admin-select" style="flex: 1.2; min-width: 170px;">
          <option value="all">👥 All Creators (सभी यूजर्स)</option>
        </select>

        <select id="webinar-date-dropdown" class="admin-select" style="flex: 1; min-width: 140px;">
          <option value="all">📅 All Time (सभी तारीखें)</option>
          <option value="today">Today (आज)</option>
          <option value="7days">Last 7 Days (7 दिन)</option>
          <option value="30days">Last 30 Days (30 दिन)</option>
        </select>
      </div>
    </div>

    <!-- Main Table Container -->
    <div id="webinars-table-wrapper" style="margin-top: 10px;">
      <div class="admin-loading">डेटाबेस से वेबिनार डेटा लोड हो रहा है…</div>
    </div>

    <!-- Slide-over Drawer for Viewing Registered Attendees -->
    <div id="webinar-drawer-overlay" class="admin-drawer-overlay">
      <div class="admin-drawer" style="max-width: 600px;">
        <div class="admin-drawer-header">
          <div class="admin-drawer-title">
            <span id="drawer-webinar-title">👥 वेबिनार रजिस्टर्ड Attendees</span>
          </div>
          <button type="button" id="webinar-drawer-close" class="admin-drawer-close">&times;</button>
        </div>
        <div id="webinar-drawer-body" class="admin-drawer-body"></div>
      </div>
    </div>
  `;

  const tableContainer = document.getElementById('webinars-table-wrapper');
  const searchInput = document.getElementById('webinar-search-box');
  const userFilter = document.getElementById('webinar-user-filter');
  const dateDropdown = document.getElementById('webinar-date-dropdown');
  const refreshBtn = document.getElementById('btn-refresh-webinars');

  const btnToggleCreate = document.getElementById('btn-toggle-create-webinar');
  const btnCloseCreate = document.getElementById('btn-close-create-webinar');
  const createCard = document.getElementById('admin-create-webinar-card');
  const formCreateWebinar = document.getElementById('form-admin-create-webinar');
  const formCardTitle = document.getElementById('form-card-title');
  const btnSubmitWebinar = document.getElementById('btn-submit-webinar');
  const btnCancelEdit = document.getElementById('btn-cancel-edit-webinar');

  const wbDateInput = document.getElementById('adm_wb_date');
  const wbTimeInput = document.getElementById('adm_wb_time');
  const wbDatetimeInput = document.getElementById('adm_wb_datetime');
  const wbMeetingIdInput = document.getElementById('adm_wb_meeting_id');
  const wbPasscodeInput = document.getElementById('adm_wb_passcode');
  const wbZoomLinkInput = document.getElementById('adm_wb_zoom_link');

  // Initialize Default Date to Today and Time to 19:00 (7 PM)
  const todayStr = new Date().toISOString().split('T')[0];
  if (wbDateInput) wbDateInput.value = todayStr;
  if (wbTimeInput) wbTimeInput.value = '19:00';
  if (wbDatetimeInput) wbDatetimeInput.value = formatHindiDateTime(todayStr, '19:00');

  // Sync Date & Time pickers to formatted text
  function updateAutoDatetime() {
    const d = wbDateInput?.value || '';
    const t = wbTimeInput?.value || '';
    if (d && wbDatetimeInput) {
      wbDatetimeInput.value = formatHindiDateTime(d, t);
    }
  }

  wbDateInput?.addEventListener('change', updateAutoDatetime);
  wbTimeInput?.addEventListener('change', updateAutoDatetime);

  // Auto-generate Zoom Direct Join link when meeting ID and passcode are entered
  function autoFillZoomLink() {
    const mid = (wbMeetingIdInput?.value || '').trim();
    const pass = (wbPasscodeInput?.value || '').trim();
    const cleanId = mid.replace(/[^0-9]/g, '');
    const currentLink = (wbZoomLinkInput?.value || '').trim();

    if (cleanId && (!currentLink || currentLink === 'https://zoom.us/join' || currentLink.includes('zoom.us/j/'))) {
      wbZoomLinkInput.value = `https://zoom.us/j/${cleanId}${pass ? '?pwd=' + encodeURIComponent(pass) : ''}`;
    }
  }

  wbMeetingIdInput?.addEventListener('input', autoFillZoomLink);
  wbPasscodeInput?.addEventListener('input', autoFillZoomLink);

  function resetWebinarForm() {
    editingWebinarId = null;
    formCreateWebinar?.reset();
    uploadedCoverBase64 = '';
    uploadedBannersArray = [];
    renderUploadedBannersPreview();
    if (coverUrlWrapper) coverUrlWrapper.style.display = 'none';
    if (coverUploadWrapper) coverUploadWrapper.style.display = 'none';
    const priceInput = document.getElementById('adm_wb_price');
    if (priceInput) priceInput.value = '0';
    if (wbDateInput) wbDateInput.value = todayStr;
    if (wbTimeInput) wbTimeInput.value = '19:00';
    const ytCont = document.getElementById('adm_yt_urls_container');
    if (ytCont) {
      ytCont.innerHTML = '';
      ytCont.appendChild(createYtRow(''));
    }
    if (formCardTitle) formCardTitle.innerHTML = '<span>🎥</span> नया ज़ूम वेबिनार तैयार करें (Fast Zoom Session)';
    if (btnSubmitWebinar) btnSubmitWebinar.innerHTML = '🚀 ज़ूम वेबिनार प्रकाशित करें (Publish Webinar)';
    if (btnCancelEdit) btnCancelEdit.style.display = 'none';
  }

  btnToggleCreate?.addEventListener('click', () => {
    if (createCard) {
      if (createCard.style.display === 'none') {
        resetWebinarForm();
        createCard.style.display = 'block';
        createCard.scrollIntoView({ behavior: 'smooth' });
      } else {
        createCard.style.display = 'none';
      }
    }
  });

  btnCloseCreate?.addEventListener('click', () => {
    if (createCard) createCard.style.display = 'none';
    resetWebinarForm();
  });

  btnCancelEdit?.addEventListener('click', () => {
    resetWebinarForm();
    if (createCard) createCard.style.display = 'none';
  });

  // 3D Cover Selector Logic
  const coverPresetSelect = document.getElementById('adm_wb_cover_preset');
  const coverUrlWrapper = document.getElementById('adm_wb_cover_url_wrapper');
  const coverUploadWrapper = document.getElementById('adm_wb_cover_upload_wrapper');
  const coverUrlInput = document.getElementById('adm_wb_cover_url');
  const coverFileInput = document.getElementById('adm_wb_cover_file');
  let uploadedCoverBase64 = '';

  coverPresetSelect?.addEventListener('change', () => {
    const val = coverPresetSelect.value;
    if (val === 'custom_url') {
      if (coverUrlWrapper) coverUrlWrapper.style.display = 'block';
      if (coverUploadWrapper) coverUploadWrapper.style.display = 'none';
    } else if (val === 'custom_upload') {
      if (coverUrlWrapper) coverUrlWrapper.style.display = 'none';
      if (coverUploadWrapper) coverUploadWrapper.style.display = 'block';
    } else {
      if (coverUrlWrapper) coverUrlWrapper.style.display = 'none';
      if (coverUploadWrapper) coverUploadWrapper.style.display = 'none';
    }
  });

  coverFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const maxW = 720;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        uploadedCoverBase64 = canvas.toDataURL('image/jpeg', 0.85);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Webinar Banner Image Upload Handler
  let uploadedBannersArray = [];
  const bannerFileInput = document.getElementById('adm_wb_banner_file');
  const uploadedBannersPreview = document.getElementById('adm_uploaded_banners_preview');

  bannerFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const maxW = 1200;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const b64 = canvas.toDataURL('image/jpeg', 0.85);
        uploadedBannersArray.push(b64);
        renderUploadedBannersPreview();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  function renderUploadedBannersPreview() {
    if (!uploadedBannersPreview) return;
    uploadedBannersPreview.innerHTML = uploadedBannersArray.map((url, idx) => `
      <div style="position:relative; display:inline-block; margin-right:4px; margin-bottom:4px;">
        <img src="${url}" style="width:75px; height:46px; object-fit:cover; border-radius:6px; border:1.5px solid #10b981;" />
        <button type="button" style="position:absolute; top:-6px; right:-6px; background:#ef4444; color:#fff; border:none; border-radius:50%; width:18px; height:18px; font-size:10px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="window.removeUploadedBanner(${idx})">&times;</button>
      </div>
    `).join('');
  }

  window.removeUploadedBanner = function (idx) {
    uploadedBannersArray.splice(idx, 1);
    renderUploadedBannersPreview();
  };

  function extractYoutubeVideoId(url) {
    if (!url) return null;
    const str = String(url).trim();
    if (!str || str.startsWith('data:')) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
    const patterns = [
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i,
      /[?&]v=([a-zA-Z0-9_-]{11})/i,
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    ];
    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match && match[1] && match[1].length === 11) return match[1];
    }
    return null;
  }

  function updateYtPreview(row) {
    const input = row.querySelector('.adm-yt-input');
    const preview = row.querySelector('.adm-yt-preview');
    const thumbImg = row.querySelector('.adm-yt-thumb-img');
    const vidCode = row.querySelector('.adm-yt-vid');
    if (!input || !preview || !thumbImg || !vidCode) return;
    const ytid = extractYoutubeVideoId(input.value);
    if (ytid) {
      thumbImg.src = `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
      vidCode.textContent = ytid;
      preview.style.display = 'flex';
    } else {
      preview.style.display = 'none';
    }
  }

  function createYtRow(val = '') {
    const row = document.createElement('div');
    row.className = 'adm-yt-row';
    row.style.background = 'rgba(0,0,0,0.2)';
    row.style.padding = '8px';
    row.style.borderRadius = '8px';
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    row.style.gap = '6px';
    row.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="url" class="admin-input adm-yt-input" value="${val}" placeholder="https://youtube.com/watch?v=... या youtu.be/..." style="flex:1;" />
        <button type="button" class="admin-button small-button" style="background:#ef4444; color:#fff; padding:4px 8px;" onclick="this.closest('.adm-yt-row').remove()">&times; हटाएं</button>
      </div>
      <div class="adm-yt-preview" style="display:none; align-items:center; gap:10px; background:rgba(255,255,255,0.05); padding:6px; border-radius:6px;">
        <img class="adm-yt-thumb-img" src="" style="width:80px; height:45px; object-fit:cover; border-radius:4px; border:1px solid #ef4444;" />
        <span style="font-size:0.75rem; color:#34d399; font-weight:700;">✅ यूट्यूब वीडियो पहचाना गया (Video ID: <code class="adm-yt-vid" style="color:#38bdf8;"></code>)</span>
      </div>
    `;
    const inp = row.querySelector('.adm-yt-input');
    inp.addEventListener('input', () => updateYtPreview(row));
    inp.addEventListener('change', () => updateYtPreview(row));
    inp.addEventListener('paste', () => setTimeout(() => updateYtPreview(row), 50));
    if (val) updateYtPreview(row);
    return row;
  }

  // Dynamic YouTube URLs (+) Add Row
  document.getElementById('btn-add-yt-url')?.addEventListener('click', () => {
    const cont = document.getElementById('adm_yt_urls_container');
    if (!cont) return;
    cont.appendChild(createYtRow(''));
  });

  // Dynamic Banners (+) Add Row
  document.getElementById('btn-add-banner-url')?.addEventListener('click', () => {
    const cont = document.getElementById('adm_banners_container');
    if (!cont) return;
    const row = document.createElement('div');
    row.className = 'adm-banner-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.innerHTML = `
      <input type="url" class="admin-input adm-banner-custom-url" placeholder="https://.../banner.jpg" style="flex:1;" />
      <button type="button" class="admin-button small-button" style="background:#ef4444; color:#fff; padding:4px 8px;" onclick="this.parentElement.remove()">&times;</button>
    `;
    cont.appendChild(row);
  });

  // Dynamic Feature KPIs (+) Add Row
  document.getElementById('btn-add-kpi-row')?.addEventListener('click', () => {
    const cont = document.getElementById('adm_kpis_container');
    if (!cont) return;
    const row = document.createElement('div');
    row.className = 'adm-kpi-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.innerHTML = `
      <input type="text" class="admin-input adm-kpi-input" placeholder="नया लाभ या विशेषता लिखें..." style="flex:1;" />
      <button type="button" class="admin-button small-button" style="background:#ef4444; color:#fff; padding:4px 8px;" onclick="this.parentElement.remove()">&times;</button>
    `;
    cont.appendChild(row);
  });

  // Dynamic FAQ (+) Add Row
  document.getElementById('btn-add-faq-row')?.addEventListener('click', () => {
    const cont = document.getElementById('adm_faqs_container');
    if (!cont) return;
    const row = document.createElement('div');
    row.className = 'adm-faq-row';
    row.style.background = 'rgba(0,0,0,0.2)';
    row.style.padding = '10px';
    row.style.borderRadius = '8px';
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">नया FAQ प्रश्न:</span>
        <button type="button" class="admin-button small-button" style="background:#ef4444; color:#fff; padding:2px 6px; font-size:0.7rem;" onclick="this.closest('.adm-faq-row').remove()">&times; हटाएं</button>
      </div>
      <input type="text" class="admin-input adm-faq-q" placeholder="प्रश्न लिखें..." style="width:100%; margin-bottom:6px;" />
      <textarea class="admin-input adm-faq-a" rows="2" placeholder="उत्तर लिखें..." style="width:100%;"></textarea>
    `;
    cont.appendChild(row);
  });

  formCreateWebinar?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = (document.getElementById('adm_wb_title')?.value || '').trim();
    const rawDate = wbDateInput?.value || '';
    const rawTime = wbTimeInput?.value || '';
    let datetime = (wbDatetimeInput?.value || '').trim();
    if (!datetime && rawDate) {
      datetime = formatHindiDateTime(rawDate, rawTime);
    }

    const meetingId = (wbMeetingIdInput?.value || '').trim();
    const passcode = (wbPasscodeInput?.value || '').trim();
    let zoomLink = (wbZoomLinkInput?.value || '').trim();
    if (!zoomLink && meetingId) {
      zoomLink = getDirectZoomJoinUrl('', meetingId, passcode);
    }
    const price = parseInt(document.getElementById('adm_wb_price')?.value || '0', 10);
    const duration = parseInt(document.getElementById('adm_wb_duration')?.value || '90', 10);
    const desc = (document.getElementById('adm_wb_desc')?.value || '').trim();

    // Resolve 3D Cover Image
    let finalCoverImage = '';
    const coverPreset = coverPresetSelect?.value || '';
    if (coverPreset === 'custom_url') {
      finalCoverImage = (coverUrlInput?.value || '').trim();
    } else if (coverPreset === 'custom_upload') {
      finalCoverImage = uploadedCoverBase64;
    } else if (coverPreset) {
      finalCoverImage = coverPreset;
    }

    // Resolve YouTube Links
    const youtubeLinks = Array.from(document.querySelectorAll('.adm-yt-input'))
      .map(el => (el.value || '').trim())
      .filter(Boolean);

    // Resolve Banners
    const banners = [];
    document.querySelectorAll('.adm-banner-row').forEach(row => {
      const sel = row.querySelector('.adm-banner-select');
      const cust = row.querySelector('.adm-banner-custom-url');
      if (sel && sel.value && sel.value !== 'custom') banners.push(sel.value);
      else if (cust && cust.value.trim()) banners.push(cust.value.trim());
    });
    if (uploadedBannersArray && uploadedBannersArray.length > 0) {
      banners.push(...uploadedBannersArray);
    }

    // Resolve KPIs
    const kpis = Array.from(document.querySelectorAll('.adm-kpi-input'))
      .map(el => (el.value || '').trim())
      .filter(Boolean);

    // Resolve FAQs
    const faqs = [];
    document.querySelectorAll('.adm-faq-row').forEach(row => {
      const q = (row.querySelector('.adm-faq-q')?.value || '').trim();
      const a = (row.querySelector('.adm-faq-a')?.value || '').trim();
      if (q && a) faqs.push({ q, a });
    });

    if (!title || !meetingId) {
      alert('कृपया शीर्षक और मीटिंग आईडी अवश्य भरें।');
      return;
    }

    if (btnSubmitWebinar) {
      btnSubmitWebinar.disabled = true;
      btnSubmitWebinar.textContent = '⏳ सेव हो रहा है...';
    }

    const db = getAdminDb();

    const webinarPayload = {
      zoom_link: zoomLink,
      meeting_id: meetingId,
      passcode: passcode,
      datetime: datetime,
      date: rawDate,
      time: rawTime,
      price: price,
      duration_minutes: duration,
      cover_image: finalCoverImage,
      banners: banners,
      youtube_links: youtubeLinks,
      kpis: kpis,
      faqs: faqs
    };

    if (editingWebinarId) {
      // UPDATE EXISTING WEBINAR
      const updatedData = {
        title: title,
        message: desc || 'इस विशेष लाइव वेबिनार में भाग लेने के लिए अपना नाम और मोबाइल नंबर दर्ज करें।',
        content_type: youtubeLinks.length ? 'youtube' : 'webinar',
        media_url: youtubeLinks[0] || finalCoverImage || '',
        thumbnail_url: finalCoverImage || (banners[0] || ''),
        webinar_data: webinarPayload
      };

      try {
        if (db) {
          await db.from('landing_pages').update(updatedData).eq('id', editingWebinarId);
        }
      } catch (err) {
        console.warn('Webinar update notice:', err);
      }

      // Also upsert master record for regular page
      try {
        if (db) {
          await db.from('landing_pages').upsert([{ 
            id: 'WB_MASTER', 
            profile_id: 'ALL_USERS', 
            share_id: 'ALL_USERS', 
            category: 'webinar', 
            offer_price: price,
            status: 'active', 
            ...updatedData 
          }]);
        }
      } catch (e) {}

      // Update LocalStorage & Purge Stale Caches
      try {
        const stored = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
        const idx = stored.findIndex(w => w.id === editingWebinarId);
        if (idx !== -1) {
          stored[idx] = { ...stored[idx], ...updatedData };
          localStorage.setItem('UCAS_LOCAL_LANDING_PAGES', JSON.stringify(stored));
        }
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('AI_WB_CONFIG_')) localStorage.removeItem(k);
        }
      } catch (err) {}

      alert(`✅ वेबिनार (${editingWebinarId}) सफलतापूर्वक अपडेट हो गया!`);
    } else {
      // CREATE NEW WEBINAR
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const newWbId = `WB${randomSuffix}`;

      const newRecord = {
        id: newWbId,
        profile_id: 'ALL_USERS',
        share_id: 'ALL_USERS',
        title: title,
        message: desc || 'इस विशेष लाइव वेबिनार में भाग लेने के लिए अपना नाम और मोबाइल नंबर दर्ज करें।',
        category: 'webinar',
        content_type: youtubeLinks.length ? 'youtube' : 'webinar',
        media_url: youtubeLinks[0] || finalCoverImage || '',
        thumbnail_url: finalCoverImage || (banners[0] || ''),
        offer_price: price,
        status: 'active',
        webinar_data: webinarPayload,
        created_at: new Date().toISOString()
      };

      try {
        if (db) {
          await db.from('landing_pages').insert([newRecord]);
          await db.from('landing_pages').upsert([{ ...newRecord, id: 'WB_MASTER' }]);
        }
      } catch (err) {
        console.warn('Webinar insert notice:', err);
      }

      try {
        const stored = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
        stored.unshift(newRecord);
        localStorage.setItem('UCAS_LOCAL_LANDING_PAGES', JSON.stringify(stored));
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('AI_WB_CONFIG_')) localStorage.removeItem(k);
        }
      } catch (err) {}

      alert(`🎉 ज़ूम वेबिनार सफलतापूर्वक प्रकाशित हो गया!\n\nरेगुलर लिंक: https://aarogyamindia.online/webinar.html`);
    }

    if (btnSubmitWebinar) {
      btnSubmitWebinar.disabled = false;
    }

    if (createCard) createCard.style.display = 'none';
    resetWebinarForm();
    loadWebinarData();
  });

  const tabBtnWebinars = document.getElementById('tab-btn-webinars');
  const tabBtnAttendees = document.getElementById('tab-btn-attendees');

  const drawerOverlay = document.getElementById('webinar-drawer-overlay');
  const drawerCloseBtn = document.getElementById('webinar-drawer-close');
  const drawerTitle = document.getElementById('drawer-webinar-title');
  const drawerBody = document.getElementById('webinar-drawer-body');

  tabBtnWebinars?.addEventListener('click', () => {
    activeTab = 'webinars';
    tabBtnWebinars.style.background = '#3b82f6';
    tabBtnWebinars.style.color = '#fff';
    tabBtnAttendees.style.background = 'var(--admin-surface-2, #0f172a)';
    tabBtnAttendees.style.color = 'var(--admin-muted)';
    currentPage = 1;
    renderTable();
  });

  tabBtnAttendees?.addEventListener('click', () => {
    activeTab = 'attendees';
    tabBtnAttendees.style.background = '#10b981';
    tabBtnAttendees.style.color = '#fff';
    tabBtnWebinars.style.background = 'var(--admin-surface-2, #0f172a)';
    tabBtnWebinars.style.color = 'var(--admin-muted)';
    currentPage = 1;
    renderTable();
  });

  drawerCloseBtn?.addEventListener('click', () => drawerOverlay?.classList.remove('active'));
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('active');
  });

  async function loadWebinarData() {
    tableContainer.innerHTML = '<div class="admin-loading">Loading webinars from database…</div>';

    const db = getAdminDb();
    if (!db) {
      tableContainer.innerHTML = '<div class="admin-error"><strong>Supabase client is initializing. Please click Refresh.</strong></div>';
      return;
    }

    try {
      // 1. Fetch Profiles, Landing Pages & Surveys in parallel
      const [lpRes, surveyRes, profRes] = await Promise.all([
        db.from('landing_pages').select('id, profile_id, share_id, title, message, category, status, webinar_data, created_at').order('created_at', { ascending: false }),
        db.from('surveys').select('id, profile_id, name, mobile, age, sex, state, district, village, occupation, category_answers, created_at').order('created_at', { ascending: false }),
        db.from('profiles').select('id, full_name, mobile, share_id')
      ]);

      let allLps = lpRes.data || [];
      let allSurveys = surveyRes.data || [];
      allProfiles = profRes.data || [];

      // Scan LocalStorage for local testing
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES')) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]');
              const arr = Array.isArray(parsed) ? parsed : [parsed];
              arr.forEach(p => {
                if (p && p.id && !allLps.some(existing => existing.id === p.id)) {
                  allLps.push(p);
                }
              });
            } catch (e) {}
          }
          if (key && key.startsWith('UCAS_SURVEYS_')) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]');
              const arr = Array.isArray(parsed) ? parsed : [parsed];
              arr.forEach(s => {
                if (s && s.id && !allSurveys.some(existing => existing.id === s.id)) {
                  allSurveys.push(s);
                }
              });
            } catch (e) {}
          }
        }
      } catch (e) {}

      // Filter only webinar landing pages (or pages with webinar_data)
      allWebinars = allLps.filter(lp => lp.category === 'webinar' || Boolean(lp.webinar_data));
      allRegistrations = allSurveys.filter(s => {
        const cat = String(s.selected_categories || '');
        const src = s.category_answers?.source || '';
        const lpId = s.category_answers?.landing_page_id || s.category_answers?.webinar_id || '';
        return cat.includes('webinar') || src.includes('webinar') || allWebinars.some(w => w.id === lpId);
      });

      // Populate User Filter Dropdown
      if (userFilter) {
        userFilter.innerHTML = '<option value="all">👥 All Creators (सभी यूजर्स)</option>';
        const creatorIds = new Set();
        allWebinars.forEach(w => { if (w.profile_id) creatorIds.add(w.profile_id); });
        allRegistrations.forEach(r => { if (r.profile_id) creatorIds.add(r.profile_id); });

        creatorIds.forEach(pId => {
          const prof = allProfiles.find(p => p.id === pId);
          const opt = document.createElement('option');
          opt.value = pId;
          opt.textContent = pId === 'ALL_USERS'
            ? '🌐 सभी यूजर्स (All Users Broadcast)'
            : prof ? `${prof.full_name || 'User'} (${prof.share_id || pId.slice(0, 8)})` : pId.slice(0, 8);
          userFilter.appendChild(opt);
        });
      }

      // Calculate KPI Stats
      document.getElementById('kpi-total-webinars').textContent = allWebinars.length;
      document.getElementById('kpi-total-attendees').textContent = allRegistrations.length;
      const activeZoomCount = allWebinars.filter(w => w.webinar_data?.zoom_link || w.webinar_data?.meeting_id).length;
      document.getElementById('kpi-active-sessions').textContent = activeZoomCount;

      const tabCountWb = document.getElementById('tab-count-webinars');
      const tabCountAtt = document.getElementById('tab-count-attendees');
      if (tabCountWb) tabCountWb.textContent = allWebinars.length;
      if (tabCountAtt) tabCountAtt.textContent = allRegistrations.length;

      currentPage = 1;
      renderTable();
    } catch (e) {
      console.error('Webinar loading error', e);
      tableContainer.innerHTML = '<div class="admin-error"><strong>Unable to load webinars.</strong></div>';
    }
  }

  function getFilteredWebinars() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const dateVal = dateDropdown.value;
    const selectedUserId = userFilter.value;
    const now = new Date();

    return allWebinars.filter(w => {
      // User Filter
      if (selectedUserId !== 'all' && w.profile_id !== selectedUserId) {
        return false;
      }

      // Date Filter
      if (dateVal !== 'all' && w.created_at) {
        const wDate = new Date(w.created_at);
        if (dateVal === 'today') {
          if (wDate.toDateString() !== now.toDateString()) return false;
        } else if (dateVal === '7days') {
          if ((now - wDate) / (1000 * 60 * 60 * 24) > 7) return false;
        } else if (dateVal === '30days') {
          if ((now - wDate) / (1000 * 60 * 60 * 24) > 30) return false;
        }
      }

      // Search Query
      if (query) {
        const title = (w.title || '').toLowerCase();
        const shareId = (w.share_id || '').toLowerCase();
        const meetingId = (w.webinar_data?.meeting_id || '').toLowerCase();
        const zoomUrl = (w.webinar_data?.zoom_link || '').toLowerCase();
        const prof = allProfiles.find(p => p.id === w.profile_id);
        const creatorName = (prof?.full_name || '').toLowerCase();

        if (!title.includes(query) && !shareId.includes(query) && !meetingId.includes(query) && !zoomUrl.includes(query) && !creatorName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  function getFilteredAttendees() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const dateVal = dateDropdown.value;
    const selectedUserId = userFilter.value;
    const now = new Date();

    return allRegistrations.filter(att => {
      // User Filter
      if (selectedUserId !== 'all' && att.profile_id !== selectedUserId) {
        return false;
      }

      // Date Filter
      if (dateVal !== 'all' && att.created_at) {
        const aDate = new Date(att.created_at);
        if (dateVal === 'today') {
          if (aDate.toDateString() !== now.toDateString()) return false;
        } else if (dateVal === '7days') {
          if ((now - aDate) / (1000 * 60 * 60 * 24) > 7) return false;
        } else if (dateVal === '30days') {
          if ((now - aDate) / (1000 * 60 * 60 * 24) > 30) return false;
        }
      }

      // Search Query
      if (query) {
        const name = (att.name || '').toLowerCase();
        const mob = (att.mobile || '').toLowerCase();
        const place = (att.village || '').toLowerCase();
        const aLpId = att.category_answers?.landing_page_id || att.category_answers?.webinar_id || '';
        const lp = allWebinars.find(w => w.id === aLpId);
        const title = (lp?.title || '').toLowerCase();
        const prof = allProfiles.find(p => p.id === att.profile_id);
        const creatorName = (prof?.full_name || '').toLowerCase();

        if (!name.includes(query) && !mob.includes(query) && !place.includes(query) && !title.includes(query) && !creatorName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  function renderTable() {
    if (activeTab === 'attendees') {
      renderAttendeesReportTable();
    } else {
      renderWebinarsListTable();
    }
  }

  function renderWebinarsListTable() {
    const filtered = getFilteredWebinars();
    const total = filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, total);
    const pageItems = filtered.slice(startIndex, endIndex);

    if (total === 0) {
      tableContainer.innerHTML = `
        <div class="admin-table-wrapper sticky-header-table">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Webinar Title & ID</th>
                <th>Creator User</th>
                <th>Date & Time</th>
                <th>Zoom Link & Passcode</th>
                <th>Registered Attendees</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="7" style="text-align:center;padding:2.5rem;color:var(--admin-muted);">
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">🎥</div>
                  <div style="font-size:1rem;font-weight:700;color:var(--admin-text);margin-bottom:4px;">कोई वेबिनार नहीं मिला (No Webinars Found)</div>
                  <span style="font-size: 0.85rem; color: var(--admin-muted);">ऊपर 'नया ज़ूम वेबिनार बनाएं' बटन से नया सत्र प्रकाशित करें।</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      return;
    }

    tableContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>दिखा रहे हैं <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${total}</strong> वेबिनार</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Webinar Title & ID</th>
              <th>Creator User</th>
              <th>Date & Time</th>
              <th>Zoom Link & Passcode</th>
              <th>Registered Attendees</th>
              <th style="text-align: right; min-width: 240px;">Action (Share / Edit)</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((w, idx) => {
              const rowNum = startIndex + idx + 1;
              const wData = w.webinar_data || {};
              const attendees = allRegistrations.filter(r => r.category_answers?.webinar_id === w.id || r.category_answers?.landing_page_id === w.id);
              const attendeesCount = attendees.length;
              const dateStr = w.created_at ? new Date(w.created_at).toLocaleDateString('hi-IN') : '-';
              const publicLpUrl = `/webinar.html?id=${encodeURIComponent(w.id)}&ref=${encodeURIComponent(w.share_id || 'ADMIN')}`;
              const fullPublicUrl = `https://aarogyamindia.online${publicLpUrl}`;
              const creator = allProfiles.find(p => p.id === w.profile_id);
              const directZoom = getDirectZoomJoinUrl(wData.zoom_link, wData.meeting_id, wData.passcode);

              const waInviteText = `🎥 *${w.title || 'Aarogyam India Live Webinar'}*\n\n📅 दिनांक व समय: ${wData.datetime || 'लाइव सत्र'}\n\n👉 *Zoom मीटिंग लिंक:* ${directZoom}\n🆔 *Meeting ID:* ${wData.meeting_id || '-'}\n🔑 *Passcode:* ${wData.passcode || '-'}\n\n🔗 *वेबिनार रजिस्ट्रेशन पेज:* ${fullPublicUrl}\n\nसादर,\nAarogyam India`;
              const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waInviteText)}`;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.92rem;">${w.title || 'Untitled Webinar'}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">
                      Page ID: <code>${w.id}</code> • <span>${dateStr}</span>
                    </div>
                  </td>
                  <td>
                    ${w.profile_id === 'ALL_USERS' || w.share_id === 'ALL_USERS' || w.share_id === 'ADMIN' ? `
                      <div style="font-weight: 800; color: #3b82f6; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                        <span>🌐</span> <span>सभी ${allProfiles.length || 103} यूज़र्स (Broadcast)</span>
                      </div>
                      <div style="font-size: 0.73rem; color: #10b981; font-weight: 700; margin-top: 2px;">
                        ✓ 100% Reach (सभी को डिलीवर)
                      </div>
                      <button type="button" class="btn-view-wb-recipients admin-button small-button" data-webinar-id="${w.id}" style="font-size: 0.72rem; padding: 2px 7px; margin-top: 4px; background: rgba(59,130,246,0.15); color: #2563eb; border: 1px solid rgba(59,130,246,0.3); font-weight: 700;">
                        👥 प्राप्तकर्ता लिस्ट देखें
                      </button>
                    ` : `
                      <div style="font-weight:700; color:var(--admin-text); font-size:0.85rem;">
                        ${creator?.full_name || 'Community'}
                      </div>
                      <span style="font-size: 0.75rem; font-weight: 700; color: var(--admin-primary);">
                        <code>${w.share_id || creator?.share_id || 'AI000000'}</code>
                      </span>
                    `}
                  </td>
                  <td>
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--admin-text);">
                      📅 ${wData.datetime || 'लाइव सत्र'}
                    </div>
                  </td>
                  <td>
                    <div>
                      ${wData.zoom_link || wData.meeting_id ? `
                        <a href="${directZoom}" target="_blank" class="admin-subtle-link" style="color: #3b82f6; font-weight: 700; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                          <span>🔗 Direct Zoom Link</span>
                        </a>
                      ` : '<span style="color: var(--admin-muted); font-size: 0.75rem;">-</span>'}
                      <div style="font-size: 0.72rem; color: var(--admin-muted); margin-top: 2px;">
                        ${wData.meeting_id ? `ID: <code>${wData.meeting_id}</code>` : ''} 
                        ${wData.passcode ? `• Pass: <strong style="color:#10b981;">${wData.passcode}</strong>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button type="button" class="btn-view-attendees admin-button small-button" data-webinar-id="${w.id}" style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); font-weight: 800; font-size: 0.85rem; padding: 4px 10px; border-radius: 20px;">
                      👥 ${attendeesCount} Registered
                    </button>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 5px; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
                      <a href="${publicLpUrl}" target="_blank" class="admin-button small-button" style="background: rgba(37,99,235,0.15); color: #3b82f6; border: 1px solid rgba(37,99,235,0.3); font-weight: 700; font-size: 0.75rem; padding: 4px 7px; text-decoration:none;" title="Open Clean Webinar Page">
                        🔗 खोलें
                      </a>
                      <button type="button" class="btn-copy-webinar-link admin-button small-button" data-url="${fullPublicUrl}" style="background: var(--admin-surface); color: var(--admin-text); border: 1px solid var(--admin-border); font-size:0.75rem; font-weight:700; padding:4px 7px;" title="Copy Link">
                        📋 कॉपी
                      </button>
                      <a href="${waUrl}" target="_blank" class="admin-button small-button" style="background: #25D366; color: #fff; text-decoration:none; font-size:0.75rem; font-weight:700; padding:4px 7px;" title="WhatsApp Share With Message">
                        💬 WA
                      </a>
                      <button type="button" class="btn-native-share-webinar admin-button small-button" data-title="${encodeURIComponent(w.title || '')}" data-text="${encodeURIComponent(waInviteText)}" data-url="${fullPublicUrl}" style="background: #3b82f6; color: #fff; font-size:0.75rem; font-weight:700; padding:4px 7px;" title="Share via Mobile Apps">
                        📲 शेयर
                      </button>
                      <button type="button" class="btn-edit-webinar admin-button small-button" data-webinar-id="${w.id}" style="background: #f59e0b; color: #fff; font-weight: 700; font-size: 0.75rem; padding: 4px 7px;" title="Edit Webinar">
                        ✏️ एडिट
                      </button>
                      <button type="button" class="btn-delete-webinar admin-button small-button" data-webinar-id="${w.id}" style="background: #ef4444; color: #fff; font-weight: 700; font-size: 0.75rem; padding: 4px 7px;" title="Delete Webinar">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px 16px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="font-size: 0.85rem; color: var(--admin-muted);">
          Total Webinars: <strong style="color: var(--admin-text);">${total}</strong>
        </div>

        <div class="admin-pagination-controls">
          <button type="button" id="webinar-prev-page" class="admin-button small-button" ${currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ◀ Previous
          </button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">Page ${currentPage} of ${totalPages} (20 Items/Page)</span>
          <button type="button" id="webinar-next-page" class="admin-button small-button" ${currentPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            Next ▶
          </button>
        </div>
      </div>
    `;

    bindPaginationAndActionEvents();
  }

  function renderAttendeesReportTable() {
    const filtered = getFilteredAttendees();
    const total = filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, total);
    const pageItems = filtered.slice(startIndex, endIndex);

    if (total === 0) {
      tableContainer.innerHTML = `
        <div class="admin-table-wrapper sticky-header-table">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Attendee Name & Place</th>
                <th>Mobile Number</th>
                <th>Webinar Topic / Title</th>
                <th>Creator User</th>
                <th>Joined Date & Time</th>
                <th style="text-align: right;">Action (Call / WA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="7" style="text-align:center;padding:2.5rem;color:var(--admin-muted);">
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">👥</div>
                  <div style="font-size:1rem;font-weight:700;color:var(--admin-text);margin-bottom:4px;">कोई वेबिनार अटेंडेंट रिकॉर्ड नहीं मिला</div>
                  <span style="font-size: 0.85rem; color: var(--admin-muted);">फ़िल्टर बदलें या नया सर्च करें।</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      return;
    }

    tableContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>दिखा रहे हैं <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${total}</strong> अटेंडेंट्स</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Attendee Name & Place</th>
              <th>Mobile Number</th>
              <th>Webinar Topic / Title</th>
              <th>Creator User</th>
              <th>Joined Date & Time</th>
              <th style="text-align: right;">Action (Call / WA)</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((att, idx) => {
              const rowNum = startIndex + idx + 1;
              const sMob = String(att.mobile || '').replace(/\D/g, '');
              const clean10Mob = sMob.length === 10 ? sMob : sMob.slice(-10);
              const aLpId = att.category_answers?.landing_page_id || att.category_answers?.webinar_id || '';
              const lp = allWebinars.find(w => w.id === aLpId);
              const webinarTitle = lp?.title || 'लाइव वेबिनार सत्र';
              const regDate = att.created_at ? new Date(att.created_at).toLocaleString('hi-IN') : '-';
              const creator = allProfiles.find(p => p.id === att.profile_id);

              const attendeeName = att.name || 'मित्र';
              const waMsg = `नमस्ते ${attendeeName} जी! आपने हमारे लाइव वेबिनार "${webinarTitle}" में भाग लिया था। आपको वेबिनार कैसा लगा और क्या-क्या समझ में आया? अब आइए आगे का प्लान करते हैं और इस पर चर्चा करते हैं।`;
              const waLink = `https://wa.me/91${clean10Mob}?text=${encodeURIComponent(waMsg)}`;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.92rem;">${att.name}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">
                      📍 <span>${att.village || 'Online'}</span>
                    </div>
                  </td>
                  <td>
                    <a href="tel:${clean10Mob}" class="admin-subtle-link" style="font-weight: 700; font-size: 0.85rem; color: #3b82f6;">
                      📞 ${att.mobile || '-'}
                    </a>
                  </td>
                  <td>
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--admin-text); max-width: 220px;">
                      🎥 ${webinarTitle}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--admin-muted);">ID: <code>${aLpId || '-'}</code></div>
                  </td>
                  <td>
                    <div style="font-weight: 600; font-size: 0.82rem; color: var(--admin-text);">
                      ${creator?.full_name || 'Community'}
                    </div>
                    <span style="font-size: 0.72rem; color: var(--admin-muted);"><code>${creator?.share_id || att.category_answers?.creator_share_id || '-'}</code></span>
                  </td>
                  <td>
                    <div style="font-size: 0.8rem; color: var(--admin-muted);">
                      📅 ${regDate}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                      <a href="tel:${clean10Mob}" class="admin-button small-button" style="background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); font-weight: 700; font-size: 0.75rem; padding: 4px 10px; text-decoration: none;" title="Call Attendee">
                        📞 Call
                      </a>
                      <a href="${waLink}" target="_blank" class="admin-button small-button" style="background: #25D366; color: #fff; font-weight: 700; font-size: 0.75rem; padding: 4px 10px; text-decoration: none;" title="Send WhatsApp Message">
                        💬 WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px 16px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="font-size: 0.85rem; color: var(--admin-muted);">
          Total Attendees: <strong style="color: var(--admin-text);">${total}</strong>
        </div>

        <div class="admin-pagination-controls">
          <button type="button" id="webinar-prev-page" class="admin-button small-button" ${currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ◀ Previous
          </button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">Page ${currentPage} of ${totalPages} (20 Items/Page)</span>
          <button type="button" id="webinar-next-page" class="admin-button small-button" ${currentPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            Next ▶
          </button>
        </div>
      </div>
    `;

    bindPaginationAndActionEvents();
  }

  function bindPaginationAndActionEvents() {
    // Pagination Listeners
    document.getElementById('webinar-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.getElementById('webinar-next-page')?.addEventListener('click', () => {
      const filtered = activeTab === 'attendees' ? getFilteredAttendees() : getFilteredWebinars();
      const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });

    // View Attendees Click in Webinars List
    tableContainer.querySelectorAll('.btn-view-attendees').forEach(btn => {
      btn.addEventListener('click', () => {
        const wId = btn.dataset.webinarId;
        const webinar = allWebinars.find(w => w.id === wId);
        if (!webinar) return;
        openAttendeesDrawer(webinar);
      });
    });

    // Copy Webinar Link Click
    tableContainer.querySelectorAll('.btn-copy-webinar-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ कॉपी हुआ!';
          setTimeout(() => { btn.innerHTML = orig; }, 1800);
        } else {
          prompt('लिंक कॉपी करें:', url);
        }
      });
    });

    // Native Share Button in Table
    tableContainer.querySelectorAll('.btn-native-share-webinar').forEach(btn => {
      btn.addEventListener('click', async () => {
        const title = decodeURIComponent(btn.dataset.title || 'Aarogyam India Live Webinar');
        const text = decodeURIComponent(btn.dataset.text || '');
        const url = btn.dataset.url || '';

        if (navigator.share) {
          try {
            await navigator.share({ title, text, url });
          } catch (e) {}
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ संदेश कॉपी!';
          setTimeout(() => { btn.innerHTML = orig; }, 1800);
        }
      });
    });

    // Edit Webinar Click
    tableContainer.querySelectorAll('.btn-edit-webinar').forEach(btn => {
      btn.addEventListener('click', () => {
        const wId = btn.dataset.webinarId;
        const webinar = allWebinars.find(w => w.id === wId);
        if (!webinar) return;
        openEditWebinar(webinar);
      });
    });

    // Delete Webinar Click
    tableContainer.querySelectorAll('.btn-delete-webinar').forEach(btn => {
      btn.addEventListener('click', () => {
        const wId = btn.dataset.webinarId;
        deleteWebinar(wId);
      });
    });

    // View Recipients Click in Webinars List
    tableContainer.querySelectorAll('.btn-view-wb-recipients').forEach(btn => {
      btn.addEventListener('click', () => {
        const wId = btn.dataset.webinarId;
        const webinar = allWebinars.find(w => w.id === wId);
        if (!webinar) return;
        openWebinarRecipientsDrawer(webinar);
      });
    });
  }

  function openEditWebinar(webinar) {
    editingWebinarId = webinar.id;
    const wData = webinar.webinar_data || {};

    const titleInput = document.getElementById('adm_wb_title');
    const descInput = document.getElementById('adm_wb_desc');

    if (titleInput) titleInput.value = webinar.title || '';
    if (descInput) descInput.value = webinar.message || '';

    if (wbDateInput) wbDateInput.value = wData.date || todayStr;
    if (wbTimeInput) wbTimeInput.value = wData.time || '19:00';
    if (wbDatetimeInput) wbDatetimeInput.value = wData.datetime || formatHindiDateTime(wbDateInput?.value, wbTimeInput?.value);

    if (wbMeetingIdInput) wbMeetingIdInput.value = wData.meeting_id || '';
    if (wbPasscodeInput) wbPasscodeInput.value = wData.passcode || '';
    if (wbZoomLinkInput) wbZoomLinkInput.value = wData.zoom_link || '';

    const priceSelect = document.getElementById('adm_wb_price');
    if (priceSelect) priceSelect.value = String(wData.price || 0);

    const durationInput = document.getElementById('adm_wb_duration');
    if (durationInput) durationInput.value = String(wData.duration_minutes || 90);

    // Populate Cover Image
    if (wData.cover_image) {
      if (coverPresetSelect) {
        const matchingOpt = Array.from(coverPresetSelect.options).find(o => o.value === wData.cover_image);
        if (matchingOpt) {
          coverPresetSelect.value = wData.cover_image;
          if (coverUrlWrapper) coverUrlWrapper.style.display = 'none';
        } else {
          coverPresetSelect.value = 'custom_url';
          if (coverUrlWrapper) coverUrlWrapper.style.display = 'block';
          if (coverUrlInput) coverUrlInput.value = wData.cover_image;
        }
      }
    }

    // Populate Banners
    uploadedBannersArray = [];
    const bArr = Array.isArray(wData.banners) ? wData.banners : (wData.banner_url ? [wData.banner_url] : []);
    if (bArr.length > 0) {
      bArr.forEach(b => {
        if (b.startsWith('data:image') || b.includes('base64')) {
          uploadedBannersArray.push(b);
        }
      });
      renderUploadedBannersPreview();
    }
    const ytCont = document.getElementById('adm_yt_urls_container');
    const yts = Array.isArray(wData.youtube_links) ? wData.youtube_links : (webinar.media_url && webinar.content_type === 'youtube' ? [webinar.media_url] : []);
    if (ytCont) {
      ytCont.innerHTML = '';
      if (yts.length > 0) {
        yts.forEach(url => ytCont.appendChild(createYtRow(url)));
      } else {
        ytCont.appendChild(createYtRow(''));
      }
    }

    // Populate KPIs
    const kpiCont = document.getElementById('adm_kpis_container');
    const kpis = Array.isArray(wData.kpis) ? wData.kpis : [];
    if (kpiCont && kpis.length > 0) {
      kpiCont.innerHTML = kpis.map((kpi, i) => `
        <div class="adm-kpi-row" style="display:flex; gap:8px;">
          <input type="text" class="admin-input adm-kpi-input" value="${kpi}" style="flex:1;" />
          ${i > 0 ? `<button type="button" class="admin-button small-button" style="background:#ef4444; color:#fff; padding:4px 8px;" onclick="this.parentElement.remove()">&times;</button>` : ''}
        </div>
      `).join('');
    }

    // Populate FAQs
    const faqCont = document.getElementById('adm_faqs_container');
    const faqs = Array.isArray(wData.faqs) ? wData.faqs : [];
    if (faqCont && faqs.length > 0) {
      faqCont.innerHTML = faqs.map(f => `
        <div class="adm-faq-row" style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">FAQ प्रश्न:</span>
            <button type="button" class="admin-button small-button" style="background:#ef4444; color:#fff; padding:2px 6px; font-size:0.7rem;" onclick="this.closest('.adm-faq-row').remove()">&times; हटाएं</button>
          </div>
          <input type="text" class="admin-input adm-faq-q" value="${f.q || ''}" placeholder="प्रश्न लिखें..." style="width:100%; margin-bottom:6px;" />
          <textarea class="admin-input adm-faq-a" rows="2" placeholder="उत्तर लिखें..." style="width:100%;">${f.a || ''}</textarea>
        </div>
      `).join('');
    }

    if (formCardTitle) formCardTitle.innerHTML = `<span>✏️</span> वेबिनार एडिट करें: <code style="color:#38bdf8;">${webinar.id}</code>`;
    if (btnSubmitWebinar) btnSubmitWebinar.innerHTML = '💾 वेबिनार अपडेट करें (Update Webinar)';
    if (btnCancelEdit) btnCancelEdit.style.display = 'inline-block';

    if (createCard) {
      createCard.style.display = 'block';
      createCard.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function deleteWebinar(webinarId) {
    const webinar = allWebinars.find(w => w.id === webinarId);
    if (!confirm(`क्या आप वाकई वेबिनार "${webinar ? webinar.title : webinarId}" को हटाना चाहते हैं?`)) return;

    const db = getAdminDb();
    try {
      if (db) {
        await db.from('landing_pages').delete().eq('id', webinarId);
      }
    } catch (e) {
      console.warn('Webinar delete error:', e);
    }

    try {
      const stored = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
      const filtered = stored.filter(w => w.id !== webinarId);
      localStorage.setItem('UCAS_LOCAL_LANDING_PAGES', JSON.stringify(filtered));
    } catch (e) {}

    alert(`🗑️ वेबिनार (${webinarId}) सफलतापूर्वक हटा दिया गया।`);
    loadWebinarData();
  }

  function openWebinarRecipientsDrawer(webinar) {
    if (!drawerOverlay || !drawerTitle || !drawerBody) return;
    drawerTitle.innerHTML = `🌐 वेबिनार प्राप्तकर्ता: <span style="color:#3b82f6;">${webinar.title || webinar.id}</span>`;

    const totalCount = allProfiles.length;
    const activeCount = allProfiles.filter(u => u.is_active || u.is_subscriber).length;

    drawerBody.innerHTML = `
      <div style="background: rgba(59,130,246,0.08); border: 1.5px solid #3b82f6; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
        <div style="font-weight: 800; font-size: 0.95rem; color: var(--admin-text); margin-bottom: 6px; display:flex; align-items:center; justify-content:space-between;">
          <span>📢 100% Universal Broadcast Status</span>
          <span style="background:#10b981; color:#fff; font-size:0.72rem; padding:3px 10px; border-radius:12px; font-weight:800;">🟢 लाइव व सक्रिय</span>
        </div>
        <p style="font-size: 0.84rem; color: var(--admin-muted); margin: 0 0 10px 0; line-height: 1.45;">
          यह वेबिनार सिस्टम में मौजूद सभी <strong>${totalCount} यूज़र्स</strong> (और भविष्य में जुड़ने वाले हर नए यूजर) के <strong>My Profile / UCAS Hub</strong> में स्वतः उनके व्यक्तिगत रेफरल लिंक के साथ उपलब्ध है।
        </p>
        <div style="display:flex; gap:10px; flex-wrap:wrap; font-size:0.8rem; font-weight:700;">
          <div style="background:var(--admin-surface); padding:6px 12px; border-radius:6px; border:1px solid var(--admin-border);">
            👥 कुल प्राप्तकर्ता: <strong style="color:#3b82f6;">${totalCount} यूज़र्स</strong>
          </div>
          <div style="background:var(--admin-surface); padding:6px 12px; border-radius:6px; border:1px solid var(--admin-border);">
            🟢 सक्रिय यूज़र्स: <strong style="color:#10b981;">${activeCount}</strong>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <input type="search" id="wb-rcpt-drawer-search" class="admin-input" placeholder="🔍 यूज़र का नाम, मोबाइल नंबर या Share ID से खोजें..." style="width:100%; padding:10px 12px; font-size:0.88rem;" />
      </div>

      <div id="wb-rcpt-drawer-list-wrap" style="max-height: 460px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
        <!-- User rows populated below -->
      </div>
    `;

    const listWrap = document.getElementById('wb-rcpt-drawer-list-wrap');
    const searchBox = document.getElementById('wb-rcpt-drawer-search');

    function renderRecipientUserList(query = '') {
      if (!listWrap) return;
      const q = query.toLowerCase().trim();
      const filtered = allProfiles.filter(u => {
        if (!q) return true;
        const name = (u.name || u.full_name || '').toLowerCase();
        const mobile = (u.mobile || '').toLowerCase();
        const shareId = (u.share_id || u.referral_code || '').toLowerCase();
        return name.includes(q) || mobile.includes(q) || shareId.includes(q);
      });

      if (filtered.length === 0) {
        listWrap.innerHTML = '<div style="text-align:center; padding:20px; color:var(--admin-muted);">कोई यूज़र नहीं मिला।</div>';
        return;
      }

      listWrap.innerHTML = filtered.map(u => {
        const uShareId = u.share_id || u.referral_code || 'AI000000';
        const userShareUrl = `https://aarogyamindia.online/webinar.html?id=${encodeURIComponent(webinar.id)}&ref=${encodeURIComponent(uShareId)}`;
        const waText = `🎥 *${webinar.title || 'Aarogyam India Live Webinar'}*\n\nनमस्ते ${u.name || u.full_name || 'जी'}! आपका व्यक्तिगत वेबिनार शेयरिंग लिंक तैयार है:\n${userShareUrl}`;
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

        return `
          <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div>
              <div style="font-weight: 700; color: var(--admin-text); font-size: 0.9rem;">
                ${u.name || u.full_name || 'Aarogyam User'}
                ${u.is_active || u.is_subscriber ? '<span style="color:#10b981; font-size:0.72rem; font-weight:700; margin-left:6px;">🟢 Active</span>' : '<span style="color:#ef4444; font-size:0.72rem; font-weight:700; margin-left:6px;">🔴 Inactive</span>'}
              </div>
              <div style="font-size: 0.78rem; color: var(--admin-muted); margin-top: 2px;">
                📞 ${u.mobile || 'N/A'} • Share ID: <code style="color:var(--admin-primary); font-weight:800;">${uShareId}</code>
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" class="admin-button small-button btn-copy-user-link" data-url="${userShareUrl}" style="background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); font-size: 0.75rem; font-weight: 700; padding: 4px 8px;">
                📋 लिंक कॉपी
              </button>
              <a href="${waUrl}" target="_blank" class="admin-button small-button" style="background: #25D366; color: #fff; text-decoration: none; font-size: 0.75rem; font-weight: 700; padding: 4px 8px;">
                💬 WhatsApp
              </a>
            </div>
          </div>
        `;
      }).join('');

      listWrap.querySelectorAll('.btn-copy-user-link').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.dataset.url;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            const origText = btn.innerHTML;
            btn.innerHTML = '✓ कॉपी हो गया!';
            setTimeout(() => { btn.innerHTML = origText; }, 1800);
          }
        });
      });
    }

    searchBox?.addEventListener('input', (e) => renderRecipientUserList(e.target.value));
    renderRecipientUserList();

    drawerOverlay.classList.add('active');
  }

  function openAttendeesDrawer(webinar) {
    if (!drawerOverlay || !drawerTitle || !drawerBody) return;

    const attendees = allRegistrations.filter(r => r.category_answers?.landing_page_id === webinar.id || r.category_answers?.webinar_id === webinar.id);
    const wData = webinar.webinar_data || {};
    const directZoom = getDirectZoomJoinUrl(wData.zoom_link, wData.meeting_id, wData.passcode);

    drawerTitle.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>👥</span>
        <span>${webinar.title || 'Webinar'} — Attendees (${attendees.length})</span>
      </div>
    `;

    drawerBody.innerHTML = `
      <div style="background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
        <div style="font-weight: 700; color: var(--admin-text);">${webinar.title}</div>
        <div style="font-size: 0.8rem; color: var(--admin-muted); margin-top: 4px;">
          📅 ${wData.datetime || '-'} • Zoom: <a href="${directZoom}" target="_blank" style="color:#3b82f6; font-weight:700;">Direct Join Link</a> • ID: <code>${wData.meeting_id || '-'}</code> • Pass: <code>${wData.passcode || '-'}</code>
        </div>
      </div>

      ${attendees.length === 0 ? `
        <div class="admin-empty">
          अभी तक किसी ने इस वेबिनार के लिए रजिस्ट्रेशन नहीं किया है।
        </div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Attendee Name</th>
                <th>Mobile (Call / WA)</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              ${attendees.map((att, i) => {
                const sMob = String(att.mobile || '').replace(/\D/g, '');
                const clean10Mob = sMob.length === 10 ? sMob : sMob.slice(-10);
                const regDate = att.created_at ? new Date(att.created_at).toLocaleString('hi-IN') : '-';
                const attendeeName = att.name || 'मित्र';
                const waMsg = `नमस्ते ${attendeeName} जी! आपने हमारे लाइव वेबिनार "${webinar.title || 'लाइव वेबिनार'}" में भाग लिया था। आपको वेबिनार कैसा लगा और क्या-क्या समझ में आया? अब आइए आगे का प्लान करते हैं और इस पर चर्चा करते हैं।`;
                const waLink = `https://wa.me/91${clean10Mob}?text=${encodeURIComponent(waMsg)}`;

                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td>
                      <div style="font-weight: 700; color: var(--admin-text);">${att.name}</div>
                      <div style="font-size: 0.72rem; color: var(--admin-muted);">Place: ${att.village || '-'}</div>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <a href="tel:${clean10Mob}" class="admin-subtle-link" style="font-weight: 700; font-size: 0.82rem; color:#3b82f6;">📞 ${att.mobile || '-'}</a>
                        ${clean10Mob ? `<a href="${waLink}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp Follow-up">💬</a>` : ''}
                      </div>
                    </td>
                    <td style="font-size: 0.78rem; color: var(--admin-muted);">
                      ${regDate}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    drawerOverlay.classList.add('active');
  }

  searchInput?.addEventListener('input', () => { currentPage = 1; renderTable(); });
  userFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  dateDropdown?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  refreshBtn?.addEventListener('click', loadWebinarData);

  await loadWebinarData();
}
