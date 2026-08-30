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
            ज़ूम मीटिंग लिंक, टाइमर, 3-टियर रिकॉर्डेड ट्रेनिंग गैलरी और अटेंडेंस लीड्स का पूर्ण प्रबंधन।
          </p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <a href="https://aarogyamindia.online/webinar.html" target="_blank" class="admin-button small-button" style="background:#0f172a; border:1.5px solid #3b82f6; color:#93c5fd; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
            <span>🌐</span> <span>स्थायी वेबिनार पेज (/webinar.html)</span>
          </a>
          <button id="btn-toggle-create-webinar" class="admin-button" style="background:#2563eb; color:#fff; font-weight:800; display:inline-flex; align-items:center; gap:6px;">
            <span>➕</span> <span id="btn-create-label">नया ज़ूम वेबिनार</span>
          </button>
          <button id="btn-toggle-create-recording" class="admin-button" style="background:#059669; color:#fff; font-weight:800; display:inline-flex; align-items:center; gap:6px;">
            <span>🎬</span> <span>+ रिकॉर्डेड वीडियो</span>
          </button>
          <button type="button" id="btn-export-webinar-master" class="admin-button small-button" style="background:#0284c7; color:#fff; font-weight:800; display:inline-flex; align-items:center; gap:6px;" title="webinar-master.json डाउनलोड करें">
            <span>📥</span> <span>1-Click Master JSON Export</span>
          </button>
          <button type="button" id="btn-export-webinar-recordings" class="admin-button small-button" style="background:#7c3aed; color:#fff; font-weight:800; display:inline-flex; align-items:center; gap:6px;" title="webinar-recordings.json डाउनलोड करें">
            <span>📥</span> <span>1-Click Recordings JSON Export</span>
          </button>
          <button id="btn-refresh-webinars" class="admin-button small-button">🔄 Refresh</button>
        </div>
      </div>

      <!-- Tab Switcher (Placed at the Very Top for 100% Visibility) -->
      <div style="display:flex; gap:10px; margin-top:16px; border-bottom: 2px solid var(--admin-border, #334155); padding-bottom: 10px; flex-wrap: wrap;">
        <button type="button" id="tab-btn-webinars" class="admin-button" style="background:#3b82f6; color:#fff; font-weight:800; font-size:0.92rem; padding:10px 18px; border-radius:10px; cursor:pointer;">
          🎥 Webinars List (<span id="tab-count-webinars">0</span>)
        </button>
        <button type="button" id="tab-btn-attendees" class="admin-button" style="background:var(--admin-surface-2, #0f172a); color:var(--admin-muted); font-weight:800; font-size:0.92rem; padding:10px 18px; border-radius:10px; border:1px solid var(--admin-border, #334155); cursor:pointer;">
          👥 Attendees Report (<span id="tab-count-attendees">0</span>)
        </button>
        <button type="button" id="tab-btn-recordings" class="admin-button" style="background:var(--admin-surface-2, #0f172a); color:var(--admin-muted); font-weight:800; font-size:0.92rem; padding:10px 18px; border-radius:10px; border:1px solid var(--admin-border, #334155); cursor:pointer;">
          🎬 Recorded Trainings (<span id="tab-count-recordings">0</span>)
        </button>
      </div>

      <!-- KPI Summary Cards (Clickable Quick Switch) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 14px;">
        <div id="kpi-card-webinars" class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #3b82f6; cursor: pointer; transition: transform 0.2s;" title="क्लिक करके वेबिनार लिस्ट देखें">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🎥 कुल वेबिनार (Total Webinars)</div>
          <div id="kpi-total-webinars" style="font-size: 1.6rem; font-weight: 800; color: var(--admin-text); margin-top: 4px;">0</div>
        </div>
        <div id="kpi-card-attendees" class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #10b981; cursor: pointer; transition: transform 0.2s;" title="क्लिक करके अटेंडेंट्स रिपोर्ट देखें">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">👥 कुल रजिस्टर्ड Attendees (Leads)</div>
          <div id="kpi-total-attendees" style="font-size: 1.6rem; font-weight: 800; color: #10b981; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🔗 लाइव Zoom सेशंस (Active Zoom Links)</div>
          <div id="kpi-active-sessions" style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">0</div>
        </div>
        <div id="kpi-card-recordings" class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #8b5cf6; cursor: pointer; transition: transform 0.2s;" title="क्लिक करके सभी रिकॉर्डेड वीडियो / रील्स देखें">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🎬 रिकॉर्डेड ट्रेनिंग (Training Videos)</div>
          <div id="kpi-total-recordings" style="font-size: 1.6rem; font-weight: 800; color: #a78bfa; margin-top: 4px;">0</div>
        </div>
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

      <!-- Create / Edit Recorded Training Video / Shorts & Reels Form Card -->
      <div id="admin-create-recording-card" class="admin-card" style="display:none; background: #0f172a; border: 1.5px solid #10b981; border-radius: 14px; padding: 20px; margin-top: 14px; box-shadow: 0 10px 30px rgba(16,185,129,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <h3 id="form-recording-card-title" style="font-size: 1.05rem; font-weight: 800; color: #34d399; display:flex; align-items:center; gap:8px;">
            <span>🎬</span> नया वीडियो / शॉर्ट्स व रील्स जोड़ें (Add Video / Short / Reel)
          </h3>
          <button type="button" id="btn-close-create-recording" class="admin-button small-button" style="background:transparent; color:#94a3b8; border:none; font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>

        <form id="form-admin-create-recording" onsubmit="return false;">
          <!-- Media Format Selection -->
          <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
            <label class="admin-label" style="font-weight:800; font-size:0.85rem; color:#34d399; margin-bottom:8px; display:block;">
              1. वीडियो फॉर्मेट चुनें (Choose Media Format): *
            </label>
            <div style="display:flex; gap:16px; flex-wrap:wrap;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.88rem; font-weight:700; color:#fff;">
                <input type="radio" name="adm_rec_format" value="short_reel" checked style="accent-color:#10b981; width:17px; height:17px;" />
                <span>📱 Short / Reel (Vertical 9:16 - YouTube Shorts, Instagram Reels, Facebook Reels)</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.88rem; font-weight:700; color:#cbd5e1;">
                <input type="radio" name="adm_rec_format" value="full_video" style="accent-color:#3b82f6; width:17px; height:17px;" />
                <span>🎬 Full Masterclass (Horizontal 16:9 - 45-90 मिनट की क्लास)</span>
              </label>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">प्लेटफ़ॉर्म (Platform Source): *</label>
              <select id="adm_rec_platform" class="admin-select" style="width:100%;">
                <option value="youtube">🔴 YouTube (Shorts / Full Video)</option>
                <option value="instagram">📸 Instagram Reels</option>
                <option value="facebook">🔵 Facebook Reels / Video</option>
              </select>
            </div>

            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">वीडियो शीर्षक (Title): *</label>
              <input type="text" id="adm_rec_title" class="admin-input" placeholder="उदा. 🌾 सोयाबीन में इल्ली का 1-स्प्रे रामबाण इलाज #Shorts" style="width:100%;" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">
                Video / Reel URL or Link: *
                <span style="font-size:0.72rem; color:#10b981; font-weight:600;">(ऑटो-डिटेक्ट)</span>
              </label>
              <input type="text" id="adm_rec_url" class="admin-input" placeholder="उदा. https://youtube.com/shorts/... या instagram.com/reel/..." style="width:100%;" />

              <!-- Instant Live Thumbnail Preview Box -->
              <div id="adm_rec_thumb_preview_box" style="display:flex; align-items:center; gap:12px; margin-top:8px; background:rgba(255,255,255,0.03); border:1px dashed #334155; border-radius:10px; padding:8px 12px;">
                <img id="adm_rec_thumb_img" src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" alt="Preview" style="width:70px; height:90px; border-radius:6px; object-fit:cover; border:1px solid #475569;" />
                <div>
                  <div id="adm_rec_thumb_status" style="font-size:0.78rem; font-weight:800; color:#10b981; display:flex; align-items:center; gap:4px;">
                    <span>✓</span> <span>Media Preview Live</span>
                  </div>
                  <div id="adm_rec_thumb_id_label" style="font-size:0.72rem; color:#94a3b8; margin-top:2px;">
                    Source: <code id="adm_rec_source_tag">YouTube</code>
                  </div>
                </div>
              </div>
            </div>

            <div id="adm_rec_category_container">
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">विषय / श्रेणी (Subject / Category):</label>
              <select id="adm_rec_category" class="admin-select" style="width:100%;">
                <option value="Shorts & Reels">📱 Shorts & Reels (शॉर्ट्स फ़ीड)</option>
                <option value="Crop Protection">कीट नियंत्रण व फसल सुरक्षा</option>
                <option value="Organic Farming">जैविक कृषि व मृदा सुधार</option>
                <option value="Irrigation Tech">उन्नत सिंचाई व पोषण</option>
                <option value="VIP Secrets">👑 VIP प्राइम सीक्रेट्स</option>
                <option value="General">सामान्य कृषि परामर्श</option>
                <option value="custom">➕ नई श्रेणी जोड़ें (+ Add New Category)</option>
              </select>
              <div id="adm_rec_custom_cat_wrapper" style="display:none; margin-top:6px;">
                <input type="text" id="adm_rec_custom_cat_input" class="admin-input" placeholder="नई श्रेणी का नाम लिखें" style="width:100%; font-size:0.82rem;" />
              </div>
            </div>

            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">प्रशिक्षक / विशेषज्ञ (Speaker):</label>
              <input type="text" id="adm_rec_speaker" class="admin-input" placeholder="उदा. डॉ. बी.के. शर्मा" style="width:100%;" />
            </div>

            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">अवधि / Duration:</label>
              <input type="text" id="adm_rec_duration" class="admin-input" placeholder="उदा. 0:58 या 45 मिनट" style="width:100%;" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 14px;">
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">एक्सेस लेवल (Access Tier): *</label>
              <select id="adm_rec_tier" class="admin-select" style="width:100%;">
                <option value="guest">🟢 Guest (खुला - बिना रजिस्ट्रेशन कोई भी देख सकता है)</option>
                <option value="registered">🟡 Registered (रजिस्ट्रेशन आवश्यक - नाम व नंबर से अनलॉक)</option>
                <option value="active_subscriber">🟣 Active Member Only (केवल VIP एक्टिव मेंबर्स)</option>
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-weight:700; font-size:0.82rem; color:#cbd5e1;">स्थिति (Status): *</label>
              <select id="adm_rec_status" class="admin-select" style="width:100%;">
                <option value="active">🟢 Active (वेबसाइट पर दिखेगा)</option>
                <option value="inactive">⚪ Inactive (छिपा रहेगा)</option>
              </select>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" id="btn-cancel-edit-recording" class="admin-button small-button" style="background:#475569; color:#fff;">रद्द करें</button>
            <button type="button" id="btn-submit-recording" class="admin-button" style="background:#10b981; color:#fff; font-weight:800; cursor:pointer;">💾 वीडियो सेव करें</button>
          </div>
        </form>
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
          <!-- Page Mode & Target Audience Policy Selector -->
          <div style="background: rgba(37,99,235,0.08); border: 1.5px solid #3b82f6; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px; flex-wrap:wrap; gap:8px;">
              <label class="admin-label" style="font-weight:800; font-size:0.9rem; color:#60a5fa; margin:0; display:flex; align-items:center; gap:6px;">
                <span>🌐</span> <span>1. वेबिनार पेज का प्रकार व दर्शक (Page Policy & Target Audience): *</span>
              </label>
              
              <!-- 3-Mode Switcher Buttons -->
              <div style="display:flex; gap:6px; background: #0f172a; padding:4px; border-radius:8px; border:1px solid var(--admin-border);">
                <button type="button" id="adm_wb_mode_master" class="admin-button small-button" style="background:#2563eb; color:#fff; font-weight:700; font-size:0.78rem; padding:4px 10px;">
                  🌟 स्थायी मास्टर पेज (/webinar.html)
                </button>
                <button type="button" id="adm_wb_mode_broadcast" class="admin-button small-button" style="background:transparent; color:var(--admin-text); font-weight:700; font-size:0.78rem; padding:4px 10px;">
                  📢 सभी 164 यूज़र्स (Broadcast)
                </button>
                <button type="button" id="adm_wb_mode_single" class="admin-button small-button" style="background:transparent; color:var(--admin-text); font-weight:700; font-size:0.78rem; padding:4px 10px;">
                  👤 व्यक्तिगत यूजर (Single User)
                </button>
              </div>
            </div>

            <!-- Master Info Banner -->
            <div id="adm_wb_master_info_wrap" style="background: rgba(37,99,235,0.12); border: 1px dashed #3b82f6; border-radius: 8px; padding: 10px; font-size: 0.82rem; color: #cbd5e1;">
              🌟 <strong>स्थायी मुख्य मास्टर वेबिनार (Permanent Master Page):</strong> यह मुख्य सार्वजनिक पेज <code>/webinar.html</code> पर हमेशा लाइव रहेगा और किसी भी किसान या यूजर को बिना रेफरल कोड के सीधा दिखेगा।
            </div>

            <!-- Broadcast Info Banner -->
            <div id="adm_wb_broadcast_info_wrap" style="display:none; background: rgba(16,185,129,0.12); border: 1px dashed #10b981; border-radius: 8px; padding: 10px; font-size: 0.82rem; color: #cbd5e1;">
              📢 <strong>सभी 164 यूजर्स ब्रॉडकास्ट (All Users Broadcast):</strong> यह मास्टर पेज के साथ-साथ सभी मेंबर्स के UCAS प्रोफाइल में उनके व्यक्तिगत रेफरल लिंक (<code>?ref=SHARE_ID</code>) के साथ स्वतः जुड़ जाएगा।
            </div>

            <!-- Single User Dropdown -->
            <div id="adm_wb_single_user_wrap" style="display:none; margin-top:10px;">
              <label class="admin-label" style="font-size:0.78rem; font-weight:700; color:#cbd5e1; margin-bottom:4px;">
                यूजर चुनें (Select Target User):
              </label>
              <select id="adm_wb_user_select" class="admin-select" style="width:100%; font-weight:700; padding:8px 12px;">
                <option value="ALL_USERS">🌐 सभी 164 यूज़र्स (Broadcast)</option>
              </select>
            </div>
          </div>

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
          <!-- INTERACTIVE CURSOR DRAG & DROP SECTION REORDERING (DRAG ANYWHERE WITH MOUSE) -->
          <div style="background: linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.12) 100%); border: 2px solid #8b5cf6; border-radius: 12px; padding: 16px; margin-bottom: 14px; box-shadow: 0 8px 20px rgba(139,92,246,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <div>
                <div style="font-weight: 800; color: #c084fc; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                  <span>⠿</span> <span>पेज सेक्शन्स का क्रम व दृश्यता (Drag & Drop Section Reordering)</span>
                </div>
                <p style="font-size: 0.78rem; color: #e2e8f0; margin: 3px 0 0 0;">
                  माउस से पकड़ कर क्रम बदलें अथवा <strong>🟢 चालू / 👁️ बंद</strong> बटन दबाकर किसी भी सेक्शन को छुपाएं या दिखाएं:
                </p>
              </div>
              <button type="button" id="btn_reset_webinar_section_order" class="admin-button small-button" style="background: rgba(255,255,255,0.15); border: 1px solid var(--admin-border); color: #fff; font-weight: 700; font-size: 0.75rem;">
                ↺ डिफ़ॉल्ट क्रम रीसेट करें
              </button>
            </div>
            <div id="wb_sections_reorder_list_wrap" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
              <!-- Rendered with drag & drop handlers by JS -->
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

  // -------------------------------------------------------------
  // INTERACTIVE CURSOR DRAG & DROP SECTION REORDERING ENGINE
  // -------------------------------------------------------------
  const defaultWebinarSections = [
    { key: 'cover', name: '✨ 3D फ्लोटिंग 9:16 कवर', desc: 'Floating 9:16 WebP Hero Cover Image' },
    { key: 'timer', name: '⏱️ डिजिटल काउंटडाउन टाइमर व ज़ूम अनलॉक', desc: '00:00:00 Countdown Timer & 2-Min Lock Box' },
    { key: 'registration', name: '📝 सीट बुकिंग फॉर्म व स्पॉन्सर सहायता', desc: 'Lead Registration Form & WhatsApp Support' },
    { key: 'kpis', name: '🌟 मुख्य विशेषताएँ व लाभ (KPI Highlights)', desc: '1-Line Bullet Points & Key Takeaways' },
    { key: 'banners', name: '🖼️ वेबिनार पोस्टर्स व इमेज बैनर्स', desc: 'Webinar Poster Strips & Carousel' },
    { key: 'videos', name: '▶️ लाइव यूट्यूब वीडियोज व सेशंस', desc: 'YouTube Live / Demo Embedded Player' },
    { key: 'tutorial', name: '📱 ज़ूम जॉइनिंग ट्यूटोरियल गाइड', desc: 'Step-by-Step 4-Step Zoom Tutorial' },
    { key: 'faqs', name: '❓ अक्सर पूछे जाने वाले प्रश्न (FAQs)', desc: 'Interactive Accordion FAQ Questions' }
  ];

  let currentSectionsOrder = defaultWebinarSections.map(s => s.key);
  let currentHiddenSections = [];
  let draggedSectionIndex = null;

  function renderWebinarSectionsReorderingList() {
    const wrap = document.getElementById('wb_sections_reorder_list_wrap');
    if (!wrap) return;

    if (!currentSectionsOrder || currentSectionsOrder.length === 0) {
      currentSectionsOrder = defaultWebinarSections.map(s => s.key);
    }

    wrap.innerHTML = currentSectionsOrder.map((secKey, idx) => {
      const meta = defaultWebinarSections.find(s => s.key === secKey) || { key: secKey, name: secKey, desc: '' };
      const isHidden = currentHiddenSections.includes(secKey);

      return `
        <div 
          class="wb-drag-item"
          id="wb_drag_sec_item_${idx}"
          draggable="true"
          ondragstart="window.handleWbDragStart(event, ${idx})"
          ondragover="window.handleWbDragOver(event, ${idx})"
          ondragenter="window.handleWbDragEnter(event, ${idx})"
          ondragleave="window.handleWbDragLeave(event, ${idx})"
          ondrop="window.handleWbDrop(event, ${idx})"
          ondragend="window.handleWbDragEnd(event)"
          style="background:var(--admin-surface, #1e293b); border:1.5px solid ${isHidden ? '#475569' : '#8b5cf6'}; border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; opacity:${isHidden ? '0.6' : '1'}; box-shadow:0 2px 6px rgba(0,0,0,0.15); cursor:grab;"
        >
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.2rem; color:#c084fc; cursor:grab; padding:2px;" title="माउस से पकड़ कर किसी भी जगह रखें">⠿</span>
            <span style="font-size:0.75rem; background:#8b5cf6; color:#fff; font-weight:800; padding:2px 8px; border-radius:10px;">#${idx + 1}</span>
            <div>
              <div style="font-weight:800; font-size:0.92rem; color:var(--admin-text); display:flex; align-items:center; gap:6px;">
                <span>${meta.name}</span>
              </div>
              <small style="color:var(--admin-muted); font-size:0.75rem;">${meta.desc}</small>
            </div>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <button type="button" onclick="window.moveWbSectionUp(${idx})" class="admin-button small-button" style="background:#3b82f6; color:#fff; padding:3px 8px;" title="ऊपर करें (Move Up)" ${idx === 0 ? 'disabled style="opacity:0.4;"' : ''}>
              ⬆️
            </button>
            <button type="button" onclick="window.moveWbSectionDown(${idx})" class="admin-button small-button" style="background:#3b82f6; color:#fff; padding:3px 8px;" title="नीचे करें (Move Down)" ${idx === currentSectionsOrder.length - 1 ? 'disabled style="opacity:0.4;"' : ''}>
              ⬇️
            </button>
            <button type="button" onclick="window.toggleWbSectionVisibility('${secKey}')" class="admin-button small-button" style="background:${isHidden ? '#64748b' : '#16a34a'}; color:#fff; padding:3px 8px;" title="चालू / बंद">
              ${isHidden ? '👁️ बंद' : '🟢 चालू'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.handleWbDragStart = (e, index) => {
    draggedSectionIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    setTimeout(() => {
      const el = document.getElementById(`wb_drag_sec_item_${index}`);
      if (el) el.style.opacity = '0.4';
    }, 0);
  };

  window.handleWbDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  window.handleWbDragEnter = (e, index) => {
    e.preventDefault();
    const el = document.getElementById(`wb_drag_sec_item_${index}`);
    if (el && index !== draggedSectionIndex) {
      el.style.border = '2px dashed #38bdf8';
    }
  };

  window.handleWbDragLeave = (e, index) => {
    const el = document.getElementById(`wb_drag_sec_item_${index}`);
    if (el) {
      const isHidden = currentHiddenSections.includes(currentSectionsOrder[index]);
      el.style.border = `1.5px solid ${isHidden ? '#475569' : '#8b5cf6'}`;
    }
  };

  window.handleWbDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = draggedSectionIndex;
    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      const itemToMove = currentSectionsOrder.splice(sourceIndex, 1)[0];
      currentSectionsOrder.splice(targetIndex, 0, itemToMove);
    }
    draggedSectionIndex = null;
    renderWebinarSectionsReorderingList();
  };

  window.handleWbDragEnd = (e) => {
    draggedSectionIndex = null;
    renderWebinarSectionsReorderingList();
  };

  window.moveWbSectionUp = (idx) => {
    if (idx > 0) {
      const temp = currentSectionsOrder[idx];
      currentSectionsOrder[idx] = currentSectionsOrder[idx - 1];
      currentSectionsOrder[idx - 1] = temp;
      renderWebinarSectionsReorderingList();
    }
  };

  window.moveWbSectionDown = (idx) => {
    if (idx < currentSectionsOrder.length - 1) {
      const temp = currentSectionsOrder[idx];
      currentSectionsOrder[idx] = currentSectionsOrder[idx + 1];
      currentSectionsOrder[idx + 1] = temp;
      renderWebinarSectionsReorderingList();
    }
  };

  window.toggleWbSectionVisibility = (secKey) => {
    const idx = currentHiddenSections.indexOf(secKey);
    if (idx >= 0) {
      currentHiddenSections.splice(idx, 1);
    } else {
      currentHiddenSections.push(secKey);
    }
    renderWebinarSectionsReorderingList();
  };

  window.resetWbSectionsOrder = () => {
    currentSectionsOrder = defaultWebinarSections.map(s => s.key);
    currentHiddenSections = [];
    renderWebinarSectionsReorderingList();
  };

  document.getElementById('btn_reset_webinar_section_order')?.addEventListener('click', window.resetWbSectionsOrder);

  // Policy Target State Switcher: 'master' | 'broadcast' | 'single'
  let currentTargetPolicy = 'master';

  const btnModeMaster = document.getElementById('adm_wb_mode_master');
  const btnModeBroadcast = document.getElementById('adm_wb_mode_broadcast');
  const btnModeSingle = document.getElementById('adm_wb_mode_single');
  const masterInfoWrap = document.getElementById('adm_wb_master_info_wrap');
  const broadcastInfoWrap = document.getElementById('adm_wb_broadcast_info_wrap');
  const singleUserWrap = document.getElementById('adm_wb_single_user_wrap');

  function setTargetPolicy(policy) {
    currentTargetPolicy = policy;
    if (btnModeMaster) {
      btnModeMaster.style.background = policy === 'master' ? '#2563eb' : 'transparent';
      btnModeMaster.style.color = policy === 'master' ? '#fff' : 'var(--admin-text)';
    }
    if (btnModeBroadcast) {
      btnModeBroadcast.style.background = policy === 'broadcast' ? '#10b981' : 'transparent';
      btnModeBroadcast.style.color = policy === 'broadcast' ? '#fff' : 'var(--admin-text)';
    }
    if (btnModeSingle) {
      btnModeSingle.style.background = policy === 'single' ? '#8b5cf6' : 'transparent';
      btnModeSingle.style.color = policy === 'single' ? '#fff' : 'var(--admin-text)';
    }

    if (masterInfoWrap) masterInfoWrap.style.display = policy === 'master' ? 'block' : 'none';
    if (broadcastInfoWrap) broadcastInfoWrap.style.display = policy === 'broadcast' ? 'block' : 'none';
    if (singleUserWrap) singleUserWrap.style.display = policy === 'single' ? 'block' : 'none';
  }

  btnModeMaster?.addEventListener('click', () => setTargetPolicy('master'));
  btnModeBroadcast?.addEventListener('click', () => setTargetPolicy('broadcast'));
  btnModeSingle?.addEventListener('click', () => setTargetPolicy('single'));

  function resetWebinarForm() {
    editingWebinarId = null;
    setTargetPolicy('master');
    formCreateWebinar?.reset();
    uploadedCoverBase64 = '';
    uploadedBannersArray = [];
    currentSectionsOrder = defaultWebinarSections.map(s => s.key);
    currentHiddenSections = [];
    renderWebinarSectionsReorderingList();
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
      faqs: faqs,
      section_order: currentSectionsOrder,
      hidden_sections: currentHiddenSections
    };

    let targetProfileId = 'ALL_USERS';
    let targetShareId = 'ALL_USERS';

    if (currentTargetPolicy === 'single') {
      const selectedUserId = document.getElementById('adm_wb_user_select')?.value;
      const targetProf = allProfiles.find(p => p.id === selectedUserId);
      if (targetProf) {
        targetProfileId = targetProf.id;
        targetShareId = targetProf.share_id || 'ADMIN';
      }
    }

    if (editingWebinarId) {
      // UPDATE EXISTING WEBINAR
      const updatedData = {
        title: title,
        message: desc || 'इस विशेष लाइव वेबिनार में भाग लेने के लिए अपना नाम और मोबाइल नंबर दर्ज करें।',
        category: 'webinar',
        profile_id: targetProfileId,
        share_id: targetShareId,
        content_type: youtubeLinks.length ? 'youtube' : 'webinar',
        media_url: youtubeLinks[0] || finalCoverImage || '',
        thumbnail_url: finalCoverImage || (banners[0] || ''),
        offer_price: price,
        webinar_data: webinarPayload
      };

      try {
        if (db) {
          await db.from('landing_pages').upsert([{
            id: editingWebinarId,
            status: 'active',
            ...updatedData
          }]);
          if (editingWebinarId === 'WB_MASTER' || currentTargetPolicy === 'master' || currentTargetPolicy === 'broadcast') {
            await db.from('landing_pages').upsert([{ 
              id: 'WB_MASTER', 
              status: 'active', 
              profile_id: 'ALL_USERS',
              share_id: 'ALL_USERS',
              ...updatedData 
            }]);
          }
        }
      } catch (err) {
        console.warn('Webinar update notice:', err);
      }

      // Update LocalStorage & Purge Stale Caches
      try {
        const stored = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
        const idx = stored.findIndex(w => w.id === editingWebinarId);
        if (idx !== -1) {
          stored[idx] = { ...stored[idx], ...updatedData };
        } else {
          stored.unshift({ id: editingWebinarId, status: 'active', ...updatedData });
        }
        localStorage.setItem('UCAS_LOCAL_LANDING_PAGES', JSON.stringify(stored));
        // Clear from deleted IDs set
        try {
          const delArr = JSON.parse(localStorage.getItem('AI_DELETED_WEBINAR_IDS') || '[]');
          const filteredDel = delArr.filter(id => id !== editingWebinarId);
          localStorage.setItem('AI_DELETED_WEBINAR_IDS', JSON.stringify(filteredDel));
        } catch (e) {}

        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('AI_WB_CONFIG_')) localStorage.removeItem(k);
        }
      } catch (err) {}

      // Build & Export Master JSON file (just like Book Landing Page Hub)
      const masterJsonPayload = {
        webinarMaster: {
          id: "WB_MASTER",
          slug: "live-zoom-webinar",
          status: "active",
          is_live_active: true,
          offair_title: "📺 अगला लाइव वेबिनार सत्र जल्द घोषित होगा (Stay Tuned)",
          offair_message: "वर्तमान में कोई लाइव वेबिनार प्रसारित नहीं हो रहा है। आप नीचे दी गई हमारी पिछली विशेष रिकॉर्डेड ट्रेनिंग क्लासेज देख सकते हैं:",
          title: title,
          description: desc || 'आरोग्यम इंडिया के डिजिटल कृषि प्रशिक्षण सत्र में आपका स्वागत है। कृषि विशेषज्ञों से सीधे रूबरू हों और अपनी फसलों की पैदावार, कीट-रोग प्रबंधन और उन्नत जैविक तकनीकों के सटीक समाधान पाएं।',
          default_date: rawDate || todayStr,
          default_time: rawTime || '20:30',
          duration_minutes: duration,
          default_price: price,
          default_zoom_link: zoomLink,
          default_meeting_id: meetingId,
          default_passcode: passcode,
          cover_image: finalCoverImage || '/images/banners/universal-zoom-webinar-og.jpg',
          banners: banners.length ? banners : ['/images/banners/universal-zoom-webinar-og.jpg'],
          youtube_videos: youtubeLinks.length ? youtubeLinks : ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
          section_order: currentSectionsOrder,
          hidden_sections: currentHiddenSections,
          kpis: kpis.length ? kpis : [
            'जैविक एवं वैज्ञानिक कृषि की आधुनिक तकनीक और पैदावार बढ़ाने के व्यावहारिक गुर।',
            'फसल सुरक्षा, कीट-रोग व खरपतवार का संपूर्ण, किफ़ायती व सटीक समाधान।',
            'कृषि वैज्ञानिकों एवं फसल डॉक्टरों के साथ सीधे लाइव सवाल-जवाब एवं परामर्श।',
            'प्रतिभागियों के लिए विशेष गाइड, स्प्रे चार्ट्स और उपयोगी ट्रेनिंग सामग्री।'
          ],
          tutorial_steps: [
            { step: 1, title: 'Zoom App डाउनलोड करें', desc: 'अगर आपके फोन में Zoom App नहीं है, तो प्ले स्टोर या ऐप स्टोर से निःशुल्क इंस्टॉल करें।' },
            { step: 2, title: "'Join Meeting' दबाएं", desc: "वेबिनार समय से 2 मिनट पहले ऊपर दिए गए 'ज़ूम से जुड़ें' बटन पर क्लिक करें।" },
            { step: 3, title: 'ऑडियो (आवाज़) चालू करें', desc: "ज़ूम में जुड़ने के बाद 'Join Audio' दबाकर 'Wifi or Cellular Data' चुनें।" },
            { step: 4, title: 'अपना नाम लिखकर जुड़ें', desc: 'अपना सही नाम दर्ज करें ताकि विशेषज्ञ आपके सवालों का लाइव जवाब दे सकें।' }
          ],
          faqs: faqs.length ? faqs : [
            { q: "क्या यह वेबिनार निशुल्क है?", a: "हाँ, यह विशेष वेबिनार सत्र किसानों व सदस्यों के लिए पूर्णतः निःशुल्क (₹0) है।" },
            { q: "ज़ूम मीटिंग लिंक और पासवर्ड कब मिलेगा?", a: "रजिस्ट्रेशन करने के बाद निर्धारित समय से ठीक 2 मिनट पहले लिंक इसी पेज पर अपने आप अनलॉक हो जाएगी।" },
            { q: "मीटिंग जॉइन करने के लिए क्या करना होगा?", a: "आपको बस ऊपर दिए गए 'ज़ूम से जुड़ें' बटन पर क्लिक करना होगा या ज़ूम ऐप में मीटिंग आईडी व पासवर्ड डालना होगा।" },
            { q: "क्या मैं लाइव सवाल पूछ सकता हूँ?", a: "हाँ, लाइव सत्र के दौरान आप चैट या माइक ऑन करके कृषि विशेषज्ञ से सीधे सवाल पूछ सकते हैं।" }
          ]
        }
      };

      exportWebinarMasterJson(masterJsonPayload);
      alert(`✅ वेबिनार (${editingWebinarId}) सुरक्षित हो गया और 'webinar-master.json' डाउनलोड हो गया!`);
    } else {
      // CREATE NEW WEBINAR
      let newWbId = (currentTargetPolicy === 'master') ? 'WB_MASTER' : `WB${Math.floor(100000 + Math.random() * 900000)}`;

      const newRecord = {
        id: newWbId,
        profile_id: targetProfileId,
        share_id: targetShareId,
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
          await db.from('landing_pages').upsert([newRecord]);
          if (currentTargetPolicy === 'master' || currentTargetPolicy === 'broadcast') {
            await db.from('landing_pages').upsert([{ ...newRecord, id: 'WB_MASTER', profile_id: 'ALL_USERS', share_id: 'ALL_USERS' }]);
          }
        }
      } catch (err) {
        console.warn('Webinar insert notice:', err);
      }

      try {
        const stored = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
        stored.unshift(newRecord);
        localStorage.setItem('UCAS_LOCAL_LANDING_PAGES', JSON.stringify(stored));

        // Clear from deleted list
        try {
          const delArr = JSON.parse(localStorage.getItem('AI_DELETED_WEBINAR_IDS') || '[]');
          const filteredDel = delArr.filter(id => id !== newWbId && id !== 'WB_MASTER');
          localStorage.setItem('AI_DELETED_WEBINAR_IDS', JSON.stringify(filteredDel));
        } catch (e) {}

        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('AI_WB_CONFIG_')) localStorage.removeItem(k);
        }
      } catch (err) {}

      // Build & Export Master JSON file
      const masterJsonPayload = {
        webinarMaster: {
          id: "WB_MASTER",
          slug: "live-zoom-webinar",
          status: "active",
          is_live_active: true,
          offair_title: "📺 अगला लाइव वेबिनार सत्र जल्द घोषित होगा (Stay Tuned)",
          offair_message: "वर्तमान में कोई लाइव वेबिनार प्रसारित नहीं हो रहा है। आप नीचे दी गई हमारी पिछली विशेष रिकॉर्डेड ट्रेनिंग क्लासेज देख सकते हैं:",
          title: title,
          description: desc || 'आरोग्यम इंडिया के डिजिटल कृषि प्रशिक्षण सत्र में आपका स्वागत है। कृषि विशेषज्ञों से सीधे रूबरू हों और अपनी फसलों की पैदावार, कीट-रोग प्रबंधन और उन्नत जैविक तकनीकों के सटीक समाधान पाएं।',
          default_date: rawDate || todayStr,
          default_time: rawTime || '20:30',
          duration_minutes: duration,
          default_price: price,
          default_zoom_link: zoomLink,
          default_meeting_id: meetingId,
          default_passcode: passcode,
          cover_image: finalCoverImage || '/images/banners/universal-zoom-webinar-og.jpg',
          banners: banners.length ? banners : ['/images/banners/universal-zoom-webinar-og.jpg'],
          youtube_videos: youtubeLinks.length ? youtubeLinks : ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
          section_order: currentSectionsOrder,
          hidden_sections: currentHiddenSections,
          kpis: kpis.length ? kpis : [
            'जैविक एवं वैज्ञानिक कृषि की आधुनिक तकनीक और पैदावार बढ़ाने के व्यावहारिक गुर।',
            'फसल सुरक्षा, कीट-रोग व खरपतवार का संपूर्ण, किफ़ायती व सटीक समाधान।',
            'कृषि वैज्ञानिकों एवं फसल डॉक्टरों के साथ सीधे लाइव सवाल-जवाब एवं परामर्श।',
            'प्रतिभागियों के लिए विशेष गाइड, स्प्रे चार्ट्स और उपयोगी ट्रेनिंग सामग्री।'
          ],
          tutorial_steps: [
            { step: 1, title: 'Zoom App डाउनलोड करें', desc: 'अगर आपके फोन में Zoom App नहीं है, तो प्ले स्टोर या ऐप स्टोर से निःशुल्क इंस्टॉल करें।' },
            { step: 2, title: "'Join Meeting' दबाएं", desc: "वेबिनार समय से 2 मिनट पहले ऊपर दिए गए 'ज़ूम से जुड़ें' बटन पर क्लिक करें।" },
            { step: 3, title: 'ऑडियो (आवाज़) चालू करें', desc: "ज़ूम में जुड़ने के बाद 'Join Audio' दबाकर 'Wifi or Cellular Data' चुनें।" },
            { step: 4, title: 'अपना नाम लिखकर जुड़ें', desc: 'अपना सही नाम दर्ज करें ताकि विशेषज्ञ आपके सवालों का लाइव जवाब दे सकें।' }
          ],
          faqs: faqs.length ? faqs : [
            { q: "क्या यह वेबिनार निशुल्क है?", a: "हाँ, यह विशेष वेबिनार सत्र किसानों व सदस्यों के लिए पूर्णतः निःशुल्क (₹0) है।" },
            { q: "ज़ूम मीटिंग लिंक और पासवर्ड कब मिलेगा?", a: "रजिस्ट्रेशन करने के बाद निर्धारित समय से ठीक 2 मिनट पहले लिंक इसी पेज पर अपने आप अनलॉक हो जाएगी।" },
            { q: "मीटिंग जॉइन करने के लिए क्या करना होगा?", a: "आपको बस ऊपर दिए गए 'ज़ूम से जुड़ें' बटन पर क्लिक करना होगा या ज़ूम ऐप में मीटिंग आईडी व पासवर्ड डालना होगा।" },
            { q: "क्या मैं लाइव सवाल पूछ सकता हूँ?", a: "हाँ, लाइव सत्र के दौरान आप चैट या माइक ऑन करके कृषि विशेषज्ञ से सीधे सवाल पूछ सकते हैं।" }
          ]
        }
      };

      exportWebinarMasterJson(masterJsonPayload);
      alert(`🎉 ज़ूम वेबिनार प्रकाशित हो गया और 'webinar-master.json' डाउनलोड हो गया!\n\nरेगुलर लिंक: https://aarogyamindia.online/webinar.html`);
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
  const tabBtnRecordings = document.getElementById('tab-btn-recordings');

  function switchAdminWebinarTab(tab) {
    activeTab = tab;
    currentPage = 1;
    if (tabBtnWebinars) {
      tabBtnWebinars.style.background = tab === 'webinars' ? '#3b82f6' : 'var(--admin-surface-2, #0f172a)';
      tabBtnWebinars.style.color = tab === 'webinars' ? '#fff' : 'var(--admin-muted)';
      tabBtnWebinars.style.border = tab === 'webinars' ? 'none' : '1px solid var(--admin-border, #334155)';
    }
    if (tabBtnAttendees) {
      tabBtnAttendees.style.background = tab === 'attendees' ? '#10b981' : 'var(--admin-surface-2, #0f172a)';
      tabBtnAttendees.style.color = tab === 'attendees' ? '#fff' : 'var(--admin-muted)';
      tabBtnAttendees.style.border = tab === 'attendees' ? 'none' : '1px solid var(--admin-border, #334155)';
    }
    if (tabBtnRecordings) {
      tabBtnRecordings.style.background = tab === 'recordings' ? '#8b5cf6' : 'var(--admin-surface-2, #0f172a)';
      tabBtnRecordings.style.color = tab === 'recordings' ? '#fff' : 'var(--admin-muted)';
      tabBtnRecordings.style.border = tab === 'recordings' ? 'none' : '1px solid var(--admin-border, #334155)';
    }
    renderTable();
  }

  tabBtnWebinars?.addEventListener('click', () => switchAdminWebinarTab('webinars'));
  tabBtnAttendees?.addEventListener('click', () => switchAdminWebinarTab('attendees'));
  tabBtnRecordings?.addEventListener('click', () => switchAdminWebinarTab('recordings'));

  document.getElementById('kpi-card-webinars')?.addEventListener('click', () => switchAdminWebinarTab('webinars'));
  document.getElementById('kpi-card-attendees')?.addEventListener('click', () => switchAdminWebinarTab('attendees'));
  document.getElementById('kpi-card-recordings')?.addEventListener('click', () => switchAdminWebinarTab('recordings'));

  const btnToggleCreateRec = document.getElementById('btn-toggle-create-recording');
  const btnCloseCreateRec = document.getElementById('btn-close-create-recording');
  const btnCancelEditRec = document.getElementById('btn-cancel-edit-recording');
  const createRecCard = document.getElementById('admin-create-recording-card');
  const formCreateRec = document.getElementById('form-admin-create-recording');
  const formRecTitle = document.getElementById('form-recording-card-title');

  const DEFAULT_RECORDINGS = [
    {
      id: "VID_S01",
      format: "short_reel",
      platform: "youtube",
      title: "🌾 सोयाबीन में इल्ली का 1-स्प्रे रामबाण इलाज #Shorts",
      subject: "फसल सुरक्षा टिप्स",
      category: "Shorts & Reels",
      video_url: "https://www.youtube.com/shorts/5i09Z5_R5q4",
      youtube_url: "https://www.youtube.com/shorts/5i09Z5_R5q4",
      youtube_id: "5i09Z5_R5q4",
      thumbnail: "https://img.youtube.com/vi/5i09Z5_R5q4/hqdefault.jpg",
      duration: "0:58",
      speaker: "डॉ. बी.के. शर्मा (फसल डॉक्टर)",
      access_tier: "guest",
      status: "active",
      created_at: "2026-08-28T10:00:00Z",
      views_count: 1240
    },
    {
      id: "VID_S02",
      format: "short_reel",
      platform: "instagram",
      title: "🌱 घर पर 5 दिनों में बनाएं जीवामृत खाद #Reels",
      subject: "जैविक कृषि सीक्रेट्स",
      category: "Shorts & Reels",
      video_url: "https://www.instagram.com/reel/C3zY5vXN9aB/",
      youtube_url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      youtube_id: "dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&auto=format&fit=crop&q=60",
      duration: "0:45",
      speaker: "श्री राजेश पटेल (मास्टर ट्रेनर)",
      access_tier: "guest",
      status: "active",
      created_at: "2026-08-27T12:30:00Z",
      views_count: 890
    },
    {
      id: "VID_S03",
      format: "short_reel",
      platform: "facebook",
      title: "💧 ड्रिप सिंचाई से खाद कैसे दें (फर्टिगेशन ट्रिक) #FBReels",
      subject: "उन्नत सिंचाई टिप्स",
      category: "Shorts & Reels",
      video_url: "https://www.facebook.com/reel/1029384756",
      youtube_url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      youtube_id: "dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1611162616091-2da5b6540fae?w=300&auto=format&fit=crop&q=60",
      duration: "0:52",
      speaker: "इंजीनियर आलोक वर्मा",
      access_tier: "guest",
      status: "active",
      created_at: "2026-08-26T15:00:00Z",
      views_count: 670
    },
    {
      id: "VID_001",
      format: "full_video",
      platform: "youtube",
      title: "🌾 खरीफ फसलों में कीट एवं इल्ली नियंत्रण मास्टरक्लास",
      subject: "कीट नियंत्रण व फसल सुरक्षा",
      category: "Crop Protection",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_id: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "45 मिनट",
      speaker: "डॉ. बी.के. शर्मा (वरिष्ठ कृषि विशेषज्ञ)",
      access_tier: "guest",
      status: "active",
      created_at: "2026-08-15T14:30:00Z",
      views_count: 348
    },
    {
      id: "VID_002",
      format: "full_video",
      platform: "youtube",
      title: "🌱 प्राकृतिक व जैविक खाद निर्माण की सम्पूर्ण विधि",
      subject: "जैविक कृषि व मृदा सुधार",
      category: "Organic Farming",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_id: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "58 मिनट",
      speaker: "श्री राजेश पटेल (मास्टर ट्रेनर)",
      access_tier: "registered",
      status: "active",
      created_at: "2026-08-18T18:00:00Z",
      views_count: 512
    },
    {
      id: "VID_003",
      format: "full_video",
      platform: "youtube",
      title: "💧 ड्रिप इरीगेशन व फर्टिगेशन से 50% अधिक पैदावार",
      subject: "उन्नत सिंचाई व पोषण",
      category: "Irrigation Tech",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_id: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "62 मिनट",
      speaker: "इंजीनियर आलोक वर्मा",
      access_tier: "registered",
      status: "active",
      created_at: "2026-08-22T19:30:00Z",
      views_count: 289
    },
    {
      id: "VID_004",
      format: "full_video",
      platform: "youtube",
      title: "👑 आरोग्यम VIP किसान प्राइम सीक्रेट्स",
      subject: "व्यापार व अधिक लाभ रणनीति",
      category: "VIP Secrets",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_id: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "75 मिनट",
      speaker: "आरोग्यम कोर टीम",
      access_tier: "active_subscriber",
      status: "active",
      created_at: "2026-08-25T20:00:00Z",
      views_count: 174
    }
  ];

  let allRecordings = [...DEFAULT_RECORDINGS];
  let editingRecordingId = null;

  // Create / Edit Recording Form Handlers
  btnToggleCreateRec?.addEventListener('click', () => {
    if (!createRecCard) return;
    if (createRecCard.style.display === 'none') {
      resetRecordingForm();
      createRecCard.style.display = 'block';
      if (formRecTitle) formRecTitle.innerHTML = '<span>🎬</span> नई रिकॉर्डेड ट्रेनिंग जोड़ें (Add Video)';
      createRecCard.scrollIntoView({ behavior: 'smooth' });
    } else {
      createRecCard.style.display = 'none';
    }
  });

  btnCloseCreateRec?.addEventListener('click', () => {
    if (createRecCard) createRecCard.style.display = 'none';
  });

  btnCancelEditRec?.addEventListener('click', () => {
    if (createRecCard) createRecCard.style.display = 'none';
    resetRecordingForm();
  });

  const recUrlInput = document.getElementById('adm_rec_url');
  const recThumbImg = document.getElementById('adm_rec_thumb_img');
  const recThumbStatus = document.getElementById('adm_rec_thumb_status');
  const recThumbIdLabel = document.getElementById('adm_rec_thumb_id_label');
  const recSourceTag = document.getElementById('adm_rec_source_tag');
  const recCatSelect = document.getElementById('adm_rec_category');
  const recCustomCatWrapper = document.getElementById('adm_rec_custom_cat_wrapper');
  const recCustomCatInput = document.getElementById('adm_rec_custom_cat_input');
  const recPlatformSelect = document.getElementById('adm_rec_platform');
  const recFormatRadios = document.querySelectorAll('input[name="adm_rec_format"]');

  function detectPlatformFromUrl(url) {
    const u = (url || '').toLowerCase();
    if (u.includes('instagram.com')) return 'instagram';
    if (u.includes('facebook.com') || u.includes('fb.watch') || u.includes('fb.me')) return 'facebook';
    return 'youtube';
  }

  function updateRecThumbPreview() {
    const url = (recUrlInput?.value || '').trim();
    const detectedPlat = detectPlatformFromUrl(url);
    if (recPlatformSelect && detectedPlat) {
      recPlatformSelect.value = detectedPlat;
    }

    const currentPlat = recPlatformSelect?.value || 'youtube';
    if (recSourceTag) {
      recSourceTag.textContent = currentPlat === 'instagram' ? 'Instagram Reel' : currentPlat === 'facebook' ? 'Facebook Reel' : 'YouTube';
    }

    const ytId = extractYoutubeVideoId(url);
    if (currentPlat === 'youtube' && ytId) {
      if (recThumbImg) recThumbImg.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      if (recThumbStatus) recThumbStatus.innerHTML = '<span style="color:#10b981;font-weight:800;">✓ YouTube Thumbnail Live</span>';
      if (recThumbIdLabel) recThumbIdLabel.innerHTML = `ID: <code>${ytId}</code>`;
    } else if (currentPlat === 'instagram') {
      if (recThumbImg) recThumbImg.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&auto=format&fit=crop&q=60';
      if (recThumbStatus) recThumbStatus.innerHTML = '<span style="color:#e1306c;font-weight:800;">📸 Instagram Reel Detected</span>';
      if (recThumbIdLabel) recThumbIdLabel.innerHTML = 'Platform: <code>Instagram</code>';
    } else if (currentPlat === 'facebook') {
      if (recThumbImg) recThumbImg.src = 'https://images.unsplash.com/photo-1611162616091-2da5b6540fae?w=300&auto=format&fit=crop&q=60';
      if (recThumbStatus) recThumbStatus.innerHTML = '<span style="color:#1877f2;font-weight:800;">🔵 Facebook Reel Detected</span>';
      if (recThumbIdLabel) recThumbIdLabel.innerHTML = 'Platform: <code>Facebook</code>';
    } else {
      if (recThumbImg) recThumbImg.src = 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
      if (recThumbStatus) recThumbStatus.innerHTML = '<span style="color:#94a3b8;">URL दर्ज करें...</span>';
      if (recThumbIdLabel) recThumbIdLabel.innerHTML = 'Source: <code>-</code>';
    }
  }

  recUrlInput?.addEventListener('input', updateRecThumbPreview);
  recUrlInput?.addEventListener('change', updateRecThumbPreview);
  recPlatformSelect?.addEventListener('change', updateRecThumbPreview);

  recFormatRadios.forEach(r => {
    r.addEventListener('change', () => {
      const isShort = r.value === 'short_reel';
      if (isShort && recCatSelect) {
        recCatSelect.value = 'Shorts & Reels';
      }
    });
  });

  recCatSelect?.addEventListener('change', () => {
    if (recCatSelect.value === 'custom') {
      if (recCustomCatWrapper) recCustomCatWrapper.style.display = 'block';
      recCustomCatInput?.focus();
    } else {
      if (recCustomCatWrapper) recCustomCatWrapper.style.display = 'none';
    }
  });

  function resetRecordingForm() {
    editingRecordingId = null;
    formCreateRec?.reset();
    if (recCustomCatWrapper) recCustomCatWrapper.style.display = 'none';
    const statusSelect = document.getElementById('adm_rec_status');
    const tierSelect = document.getElementById('adm_rec_tier');
    if (statusSelect) statusSelect.value = 'active';
    if (tierSelect) tierSelect.value = 'guest';
    const shortRadio = document.querySelector('input[name="adm_rec_format"][value="short_reel"]');
    if (shortRadio) shortRadio.checked = true;
    updateRecThumbPreview();
  }

  async function handleSaveRecording() {
    const title = (document.getElementById('adm_rec_title')?.value || '').trim();
    const format = document.querySelector('input[name="adm_rec_format"]:checked')?.value || 'short_reel';
    const platform = recPlatformSelect?.value || detectPlatformFromUrl(recUrlInput?.value) || 'youtube';

    let category = recCatSelect?.value || (format === 'short_reel' ? 'Shorts & Reels' : 'General');
    let subject = recCatSelect?.selectedOptions[0]?.text || category;

    if (category === 'custom') {
      const customVal = (recCustomCatInput?.value || '').trim();
      if (!customVal) {
        alert('कृपया नई श्रेणी / विषय का नाम लिखें।');
        recCustomCatInput?.focus();
        return;
      }
      category = customVal;
      subject = customVal;
    }

    const url = (recUrlInput?.value || '').trim();
    const speaker = (document.getElementById('adm_rec_speaker')?.value || '').trim() || 'आरोग्यम कृषि विशेषज्ञ';
    const duration = (document.getElementById('adm_rec_duration')?.value || '').trim() || (format === 'short_reel' ? '0:58' : '45 मिनट');
    const accessTier = document.getElementById('adm_rec_tier')?.value || 'guest';
    const status = document.getElementById('adm_rec_status')?.value || 'active';

    if (!title) {
      alert('कृपया वीडियो का शीर्षक (Title) दर्ज करें।');
      document.getElementById('adm_rec_title')?.focus();
      return;
    }
    if (!url) {
      alert('कृपया मान्य Video / Reel Link दर्ज करें।');
      recUrlInput?.focus();
      return;
    }

    const ytId = extractYoutubeVideoId(url) || (platform === 'youtube' ? 'dQw4w9WgXcQ' : '');
    let thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : (platform === 'instagram' ? 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&auto=format&fit=crop&q=60' : 'https://images.unsplash.com/photo-1611162616091-2da5b6540fae?w=300&auto=format&fit=crop&q=60');

    let recId = editingRecordingId;
    if (!recId) {
      const prefix = format === 'short_reel' ? 'VID_S' : 'VID_';
      recId = prefix + String(Date.now()).slice(-6);
    }

    const recObj = {
      id: recId,
      format: format,
      platform: platform,
      title: title,
      subject: subject,
      category: category,
      video_url: url,
      youtube_url: url.startsWith('http') ? url : `https://www.youtube.com/watch?v=${ytId}`,
      youtube_id: ytId,
      thumbnail: thumb,
      duration: duration,
      speaker: speaker,
      access_tier: accessTier,
      status: status,
      created_at: new Date().toISOString(),
      views_count: 0
    };

    const btnSubmit = document.getElementById('btn-submit-recording');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = '⏳ सुरक्षित हो रहा है...';
    }

    // 1. Local Persistence (Instant Guaranteed Response)
    let localList = JSON.parse(localStorage.getItem('AI_LOCAL_RECORDED_VIDEOS') || '[]');
    if (editingRecordingId) {
      const idx = localList.findIndex(v => v.id === editingRecordingId);
      if (idx !== -1) {
        localList[idx] = recObj;
      } else {
        localList.unshift(recObj);
      }
    } else {
      localList.unshift(recObj);
    }
    localStorage.setItem('AI_LOCAL_RECORDED_VIDEOS', JSON.stringify(localList));

    // 2. Cloud Persistence (Supabase landing_pages)
    const db = getAdminDb();
    if (db) {
      try {
        await db.from('landing_pages').upsert([{
          id: recId,
          profile_id: 'ALL_USERS',
          share_id: 'ALL_USERS',
          title: title,
          message: subject,
          category: 'recorded_video',
          content_type: platform === 'youtube' ? 'youtube' : (platform === 'instagram' ? 'instagram' : 'facebook'),
          media_url: url,
          thumbnail_url: thumb,
          offer_price: 0,
          status: status,
          webinar_data: {
            type: 'recorded_video',
            format: format,
            platform: platform,
            video_url: url,
            youtube_id: ytId,
            duration: duration,
            speaker: speaker,
            access_tier: accessTier,
            category_name: subject,
            category_key: category,
            status: status,
            views_count: 0
          }
        }]);
      } catch (err) {
        console.warn('Supabase recording upsert warning:', err);
      }
    }

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = '💾 वीडियो सेव करें';
    }
    if (createRecCard) createRecCard.style.display = 'none';
    resetRecordingForm();

    // Auto-update allRecordings memory state & Trigger 1-Click JSON Export
    const exIdx = allRecordings.findIndex(v => v.id === recId);
    if (exIdx !== -1) {
      allRecordings[exIdx] = recObj;
    } else {
      allRecordings.unshift(recObj);
    }
    exportWebinarRecordingsJson();

    alert(`🎉 ${format === 'short_reel' ? 'शॉर्ट / रील' : 'मास्टरक्लास वीडियो'} सेव हो गया और 'webinar-recordings.json' डाउनलोड हो गया!\n\nशीर्षक: ${title}\nफॉर्मेट: ${format === 'short_reel' ? '9:16 Short/Reel' : '16:9 Full Video'}`);
    
    // Auto-switch to Recordings tab and reload data
    switchAdminWebinarTab('recordings');
    await loadWebinarData();
    switchAdminWebinarTab('recordings');
  }

  // Attach to both form submit and button click
  formCreateRec?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveRecording();
  });
  document.getElementById('btn-submit-recording')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleSaveRecording();
  });

  const drawerOverlay = document.getElementById('webinar-drawer-overlay');
  const drawerCloseBtn = document.getElementById('webinar-drawer-close');
  const drawerTitle = document.getElementById('drawer-webinar-title');
  const drawerBody = document.getElementById('webinar-drawer-body');

  drawerCloseBtn?.addEventListener('click', () => drawerOverlay?.classList.remove('active'));
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('active');
  });

  async function loadWebinarData() {
    tableContainer.innerHTML = '<div class="admin-loading">डेटाबेस से वेबिनार डेटा लोड हो रहा है…</div>';

    const deletedWebinarIds = new Set(JSON.parse(localStorage.getItem('AI_DELETED_WEBINAR_IDS') || '[]'));

    let masterJsonWebinar = null;
    try {
      let resp = await fetch('/data/webinar-master.json?v=' + Date.now());
      if (!resp.ok) resp = await fetch('data/webinar-master.json?v=' + Date.now());
      if (!resp.ok) resp = await fetch('../data/webinar-master.json?v=' + Date.now());
      if (resp.ok) {
        const j = await resp.json();
        if (j && j.webinarMaster) {
          const wm = j.webinarMaster;
          masterJsonWebinar = {
            id: wm.id || 'WB_MASTER',
            profile_id: 'ALL_USERS',
            share_id: 'ALL_USERS',
            title: wm.title || '🌾 लाइव ज़ूम वेबिनार एवं फसल परामर्श सत्र',
            message: wm.description || 'आरोग्यम इंडिया लाइव ज़ूम वेबिनार सत्र',
            category: 'webinar',
            content_type: (wm.youtube_videos && wm.youtube_videos.length) ? 'youtube' : 'webinar',
            media_url: (wm.youtube_videos && wm.youtube_videos[0]) || wm.cover_image || '',
            thumbnail_url: wm.cover_image || (wm.banners && wm.banners[0]) || '',
            offer_price: wm.default_price || 0,
            status: 'active',
            created_at: new Date().toISOString(),
            webinar_data: {
              zoom_link: wm.default_zoom_link || 'https://zoom.us/join',
              meeting_id: wm.default_meeting_id || '812 3456 7890',
              passcode: wm.default_passcode || 'AI2026',
              datetime: formatHindiDateTime(wm.default_date, wm.default_time),
              date: wm.default_date || todayStr,
              time: wm.default_time || '20:30',
              price: wm.default_price || 0,
              duration_minutes: wm.duration_minutes || 90,
              cover_image: wm.cover_image || '/images/banners/universal-zoom-webinar-og.jpg',
              banners: wm.banners || ['/images/banners/universal-zoom-webinar-og.jpg'],
              youtube_links: wm.youtube_videos || ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
              kpis: wm.kpis || ['जैविक एवं वैज्ञानिक कृषि की आधुनिक तकनीक और पैदावार बढ़ाने के गुर।'],
              faqs: wm.faqs || [{ q: 'क्या यह वेबिनार निशुल्क है?', a: 'हाँ, यह विशेष वेबिनार सत्र किसानों व सदस्यों के लिए पूर्णतः निःशुल्क (₹0) है।' }]
            }
          };
        }
      }
    } catch (e) {
      console.warn('webinar-master.json fetch notice:', e);
    }

    let allLps = [];
    let allSurveys = [];
    allProfiles = [];

    const db = getAdminDb();
    if (db) {
      try {
        const [lpRes, surveyRes, profRes] = await Promise.all([
          db.from('landing_pages').select('id, profile_id, share_id, title, message, category, status, webinar_data, created_at').order('created_at', { ascending: false }),
          db.from('surveys').select('id, profile_id, name, mobile, age, sex, state, district, village, occupation, category_answers, created_at').order('created_at', { ascending: false }),
          db.from('profiles').select('id, full_name, mobile, share_id')
        ]);

        if (lpRes.data) allLps = lpRes.data;
        if (surveyRes.data) allSurveys = surveyRes.data;
        if (profRes.data) allProfiles = profRes.data;
      } catch (err) {
        console.warn('Supabase webinar fetch notice:', err);
      }
    }

    // Scan LocalStorage for local testing & caching
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES')) {
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || '[]');
            const arr = Array.isArray(parsed) ? parsed : [parsed];
            arr.forEach(p => {
              if (p && p.id && !deletedWebinarIds.has(p.id) && !allLps.some(existing => existing.id === p.id)) {
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

    // Filter only webinar landing pages
    allWebinars = allLps.filter(lp => !deletedWebinarIds.has(lp.id) && (lp.category === 'webinar' || Boolean(lp.webinar_data)));

    // Guarantee Master Webinar from JSON or Default is ALWAYS in allWebinars
    const defaultMasterWebinar = {
      id: 'WB_MASTER',
      profile_id: 'ALL_USERS',
      share_id: 'ALL_USERS',
      title: '🌾 लाइव ज़ूम वेबिनार एवं फसल परामर्श सत्र (Universal Master)',
      message: 'आरोग्यम इंडिया लाइव ज़ूम वेबिनार सत्र',
      category: 'webinar',
      content_type: 'webinar',
      media_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200',
      thumbnail_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600',
      offer_price: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      webinar_data: {
        zoom_link: 'https://zoom.us/join',
        meeting_id: '812 3456 7890',
        passcode: 'AI2026',
        datetime: 'आज, सायं 08:30 बजे (08:30 PM)',
        date: todayStr,
        time: '20:30',
        price: 0,
        duration_minutes: 90,
        cover_image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200',
        banners: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200'],
        youtube_links: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        kpis: ['जैविक एवं वैज्ञानिक कृषि की आधुनिक तकनीक और पैदावार बढ़ाने के गुर।'],
        faqs: [{ q: 'क्या यह वेबिनार निशुल्क है?', a: 'हाँ, यह विशेष वेबिनार सत्र किसानों व सदस्यों के लिए पूर्णतः निःशुल्क (₹0) है।' }]
      }
    };

    if (!allWebinars.some(w => w.id === 'WB_MASTER' || (masterJsonWebinar && w.id === masterJsonWebinar.id))) {
      allWebinars.unshift(masterJsonWebinar || defaultMasterWebinar);
    }

    // Filter all registrations
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

    // Populate Target User Select in Webinar Creation Form
    const wbUserSelect = document.getElementById('adm_wb_user_select');
    if (wbUserSelect) {
      wbUserSelect.innerHTML = `<option value="ALL_USERS">🌐 सभी ${allProfiles.length || 164} यूज़र्स (Broadcast / Master Landing Page)</option>`;
      allProfiles.forEach(prof => {
        const opt = document.createElement('option');
        opt.value = prof.id;
        opt.textContent = `👤 ${prof.full_name || 'User'} (${prof.mobile || '-'}) — Share ID: ${prof.share_id || 'AI000000'}`;
        wbUserSelect.appendChild(opt);
      });
    }

    // Load Recorded Training Videos (1. Defaults + 2. Git JSON + 3. Supabase DB + 4. Local Storage)
    allRecordings = [...DEFAULT_RECORDINGS];
    try {
      let recResp = await fetch('/data/webinar-recordings.json?v=' + Date.now());
      if (!recResp.ok) recResp = await fetch('data/webinar-recordings.json?v=' + Date.now());
      if (!recResp.ok) recResp = await fetch('../data/webinar-recordings.json?v=' + Date.now());
      if (recResp.ok) {
        const recJson = await recResp.json();
        if (Array.isArray(recJson.recordings)) {
          recJson.recordings.forEach(rec => {
            const idx = allRecordings.findIndex(x => x.id === rec.id);
            if (idx !== -1) allRecordings[idx] = rec;
            else allRecordings.push(rec);
          });
        }
      }
    } catch (e) {}

    // Fetch from Supabase Cloud Table
    if (db) {
      try {
        const { data: supaRecs } = await db.from('landing_pages').select('*').eq('category', 'recorded_video').order('created_at', { ascending: false });
        if (supaRecs && supaRecs.length > 0) {
          supaRecs.forEach(sr => {
            const wData = sr.webinar_data || {};
            const ytId = wData.youtube_id || extractYoutubeVideoId(sr.media_url) || 'dQw4w9WgXcQ';
            const fmt = wData.format || (sr.id.startsWith('VID_S') ? 'short_reel' : 'full_video');
            const plat = wData.platform || (sr.media_url?.includes('instagram') ? 'instagram' : sr.media_url?.includes('facebook') ? 'facebook' : 'youtube');
            const mapped = {
              id: sr.id,
              format: fmt,
              platform: plat,
              title: sr.title,
              subject: sr.message || wData.category_name || (fmt === 'short_reel' ? 'Shorts & Reels' : 'General'),
              category: wData.category_key || sr.message || (fmt === 'short_reel' ? 'Shorts & Reels' : 'General'),
              video_url: sr.media_url || `https://www.youtube.com/watch?v=${ytId}`,
              youtube_url: sr.media_url || `https://www.youtube.com/watch?v=${ytId}`,
              youtube_id: ytId,
              thumbnail: sr.thumbnail_url || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
              duration: wData.duration || (fmt === 'short_reel' ? '0:58' : '45 मिनट'),
              speaker: wData.speaker || 'आरोग्यम कृषि विशेषज्ञ',
              access_tier: wData.access_tier || 'guest',
              status: sr.status || 'active',
              created_at: sr.created_at || new Date().toISOString(),
              views_count: wData.views_count || 0
            };
            const existingIdx = allRecordings.findIndex(x => x.id === sr.id);
            if (existingIdx !== -1) {
              allRecordings[existingIdx] = mapped;
            } else {
              allRecordings.unshift(mapped);
            }
          });
        }
      } catch (err) {
        console.warn('Supabase recordings fetch notice:', err);
      }
    }

    try {
      const localRecs = JSON.parse(localStorage.getItem('AI_LOCAL_RECORDED_VIDEOS') || '[]');
      if (Array.isArray(localRecs) && localRecs.length > 0) {
        localRecs.forEach(lr => {
          if (lr && lr.id) {
            const existingIdx = allRecordings.findIndex(x => x.id === lr.id);
            if (existingIdx !== -1) {
              allRecordings[existingIdx] = lr;
            } else {
              allRecordings.unshift(lr);
            }
          }
        });
      }
    } catch (e) {}

    // Populate Dynamic Category Options in Form Dropdown
    if (recCatSelect) {
      const standardCats = [
        { key: 'Crop Protection', label: 'कीट नियंत्रण व फसल सुरक्षा' },
        { key: 'Organic Farming', label: 'जैविक कृषि व मृदा सुधार' },
        { key: 'Irrigation Tech', label: 'उन्नत सिंचाई व पोषण' },
        { key: 'VIP Secrets', label: '👑 VIP प्राइम सीक्रेट्स' },
        { key: 'General', label: 'सामान्य कृषि परामर्श' }
      ];
      const customCats = new Set();
      allRecordings.forEach(v => {
        const cKey = v.category || v.subject;
        if (cKey && !standardCats.some(s => s.key === cKey || s.label === cKey)) {
          customCats.add(cKey);
        }
      });

      let catOptionsHtml = standardCats.map(c => `<option value="${c.key}">${c.label}</option>`).join('');
      customCats.forEach(c => {
        catOptionsHtml += `<option value="${c}">📂 ${c}</option>`;
      });
      catOptionsHtml += `<option value="custom">➕ नई श्रेणी जोड़ें (+ Add New Category)</option>`;
      recCatSelect.innerHTML = catOptionsHtml;
    }

    // Calculate KPI Stats
    const totalWebinarsEl = document.getElementById('kpi-total-webinars');
    const totalAttendeesEl = document.getElementById('kpi-total-attendees');
    const activeSessionsEl = document.getElementById('kpi-active-sessions');
    const totalRecordingsEl = document.getElementById('kpi-total-recordings');
    if (totalWebinarsEl) totalWebinarsEl.textContent = allWebinars.length;
    if (totalAttendeesEl) totalAttendeesEl.textContent = allRegistrations.length;
    const activeZoomCount = allWebinars.filter(w => w.webinar_data?.zoom_link || w.webinar_data?.meeting_id).length;
    if (activeSessionsEl) activeSessionsEl.textContent = activeZoomCount;
    if (totalRecordingsEl) totalRecordingsEl.textContent = allRecordings.length;

    const tabCountWb = document.getElementById('tab-count-webinars');
    const tabCountAtt = document.getElementById('tab-count-attendees');
    const tabCountRec = document.getElementById('tab-count-recordings');
    if (tabCountWb) tabCountWb.textContent = allWebinars.length;
    if (tabCountAtt) tabCountAtt.textContent = allRegistrations.length;
    if (tabCountRec) tabCountRec.textContent = allRecordings.length;

    currentPage = 1;
    renderTable();
  }

  function renderTable() {
    if (activeTab === 'attendees') {
      renderAttendeesReportTable();
    } else if (activeTab === 'recordings') {
      renderRecordingsTable();
    } else {
      renderWebinarsListTable();
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
              const isMaster = w.id === 'WB_MASTER';
              const publicLpUrl = isMaster ? '/webinar.html' : `/webinar.html?ref=${encodeURIComponent(w.share_id || 'AI000004')}`;
              const fullPublicUrl = `https://aarogyamindia.online${publicLpUrl}`;
              const creator = allProfiles.find(p => p.id === w.profile_id);
              const directZoom = getDirectZoomJoinUrl(wData.zoom_link, wData.meeting_id, wData.passcode);

              const waInviteText = `🎥 *${w.title || 'Aarogyam India Live Webinar'}*\n\n📅 दिनांक व समय: ${wData.datetime || 'लाइव सत्र'}\n\n👉 *Zoom मीटिंग लिंक:* ${directZoom}\n🆔 *Meeting ID:* ${wData.meeting_id || '-'}\n🔑 *Passcode:* ${wData.passcode || '-'}\n\n🔗 *वेबिनार रजिस्ट्रेशन पेज:* ${fullPublicUrl}\n\nसादर,\nAarogyam India`;
              const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waInviteText)}`;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.92rem;">
                      ${isMaster ? '🌟 ' : ''}${w.title || 'Untitled Webinar'}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">
                      Page ID: <code>${w.id}</code> • <span>${dateStr}</span>
                    </div>
                  </td>
                  <td>
                    ${isMaster ? `
                      <div style="font-weight: 800; color: #10b981; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                        <span>🌟</span> <span>स्थायी मास्टर पेज (/webinar.html)</span>
                      </div>
                      <div style="font-size: 0.73rem; color: #60a5fa; font-weight: 700; margin-top: 2px;">
                        🌐 Universal Public Website
                      </div>
                    ` : (w.profile_id === 'ALL_USERS' || w.share_id === 'ALL_USERS' || w.share_id === 'ADMIN') ? `
                      <div style="font-weight: 800; color: #3b82f6; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                        <span>📢</span> <span>सभी ${allProfiles.length || 164} यूज़र्स (Broadcast)</span>
                      </div>
                      <div style="font-size: 0.73rem; color: #10b981; font-weight: 700; margin-top: 2px;">
                        ✓ 100% Reach (सभी मेंबर्स को डिलीवर)
                      </div>
                      <button type="button" class="btn-view-wb-recipients admin-button small-button" data-webinar-id="${w.id}" style="font-size: 0.72rem; padding: 2px 7px; margin-top: 4px; background: rgba(59,130,246,0.15); color: #2563eb; border: 1px solid rgba(59,130,246,0.3); font-weight: 700;">
                        👥 प्राप्तकर्ता लिस्ट देखें
                      </button>
                    ` : `
                      <div style="font-weight:700; color:var(--admin-text); font-size:0.85rem;">
                        👤 ${creator?.full_name || 'Community Member'}
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

  function renderRecordingsTable() {
    const query = (searchInput?.value || '').toLowerCase().trim();
    let filtered = allRecordings;
    if (query) {
      filtered = filtered.filter(v => {
        const title = (v.title || '').toLowerCase();
        const subj = (v.subject || '').toLowerCase();
        const speaker = (v.speaker || '').toLowerCase();
        return title.includes(query) || subj.includes(query) || speaker.includes(query);
      });
    }

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
                <th style="width: 100px;">Thumbnail</th>
                <th>Video Title & Subject</th>
                <th>Speaker</th>
                <th>Duration</th>
                <th>Access Tier</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="8" style="text-align:center;padding:2.5rem;color:var(--admin-muted);">
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">🎬</div>
                  <div style="font-size:1rem;font-weight:700;color:var(--admin-text);margin-bottom:4px;">कोई रिकॉर्डेड ट्रेनिंग नहीं मिली</div>
                  <span style="font-size: 0.85rem; color: var(--admin-muted);">ऊपर '+ रिकॉर्डेड वीडियो' बटन से नई क्लास जोड़ें।</span>
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
        <span>दिखा रहे हैं <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${total}</strong> रिकॉर्डेड वीडियो</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th style="width: 100px;">Thumbnail</th>
              <th>Format & Platform</th>
              <th>Video Title & Subject</th>
              <th>Speaker</th>
              <th>Duration</th>
              <th>Access Tier</th>
              <th>Status</th>
              <th style="text-align: right; min-width: 200px;">Action (Share / Edit)</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((v, idx) => {
              const rowNum = startIndex + idx + 1;
              const ytId = v.youtube_id || extractYoutubeVideoId(v.video_url || v.youtube_url) || 'dQw4w9WgXcQ';
              const thumbUrl = v.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
              const publicVidUrl = `/webinar.html?vid=${encodeURIComponent(v.id)}&ref=ADMIN`;
              const fullPublicVidUrl = `https://aarogyamindia.online${publicVidUrl}`;

              const fmt = v.format || (v.id.startsWith('VID_S') ? 'short_reel' : 'full_video');
              const plat = v.platform || (v.video_url?.includes('instagram') ? 'instagram' : v.video_url?.includes('facebook') ? 'facebook' : 'youtube');

              const formatBadge = fmt === 'short_reel'
                ? '<span style="background:rgba(244,63,94,0.18);color:#fb7185;padding:3px 8px;border-radius:6px;font-size:0.75rem;font-weight:800;display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid fa-mobile-screen"></i> 9:16 Short/Reel</span>'
                : '<span style="background:rgba(59,130,246,0.18);color:#60a5fa;padding:3px 8px;border-radius:6px;font-size:0.75rem;font-weight:800;display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid fa-tv"></i> 16:9 Masterclass</span>';

              const platformBadge = plat === 'instagram'
                ? '<span style="background:rgba(225,48,108,0.18);color:#f43f5e;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:700;margin-top:3px;display:inline-block;"><i class="fa-brands fa-instagram"></i> Instagram</span>'
                : plat === 'facebook'
                ? '<span style="background:rgba(24,119,242,0.18);color:#38bdf8;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:700;margin-top:3px;display:inline-block;"><i class="fa-brands fa-facebook"></i> Facebook</span>'
                : '<span style="background:rgba(239,68,68,0.18);color:#f87171;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:700;margin-top:3px;display:inline-block;"><i class="fa-brands fa-youtube"></i> YouTube</span>';

              let tierLabel = '<span style="background:rgba(16,185,129,0.2);color:#10b981;padding:2px 8px;border-radius:10px;font-size:0.75rem;font-weight:800;">🟢 Guest (Free)</span>';
              if (v.access_tier === 'registered') {
                tierLabel = '<span style="background:rgba(245,158,11,0.2);color:#f59e0b;padding:2px 8px;border-radius:10px;font-size:0.75rem;font-weight:800;">🟡 Registered</span>';
              } else if (v.access_tier === 'active_subscriber') {
                tierLabel = '<span style="background:rgba(139,92,246,0.2);color:#8b5cf6;padding:2px 8px;border-radius:10px;font-size:0.75rem;font-weight:800;">🟣 VIP Active</span>';
              }

              const statusBadge = v.status === 'active'
                ? '<span style="color:#10b981;font-weight:800;font-size:0.75rem;">🟢 Active</span>'
                : '<span style="color:#94a3b8;font-weight:800;font-size:0.75rem;">⚪ Inactive</span>';

              const waShareMsg = `🎬 *${v.title}*\n\n📌 विषय: ${v.subject || 'विशेष कृषि ट्रेनिंग'}\n👤 विशेषज्ञ: ${v.speaker || 'आरोग्यम टीम'}\n\n👉 *यह वीडियो देखने के लिए यहाँ क्लिक करें:*\n${fullPublicVidUrl}\n\nसादर,\nAarogyam India`;
              const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(waShareMsg)}`;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="width: ${fmt === 'short_reel' ? '50px' : '80px'}; aspect-ratio: ${fmt === 'short_reel' ? '9/16' : '16/9'}; border-radius: 6px; overflow: hidden; background: #0f172a; border: 1px solid #334155;">
                      <img src="${thumbUrl}" alt="Thumb" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://img.youtube.com/vi/${ytId}/hqdefault.jpg'">
                    </div>
                  </td>
                  <td>
                    <div>${formatBadge}</div>
                    <div>${platformBadge}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.92rem;">${v.title}</div>
                    <div style="font-size: 0.76rem; color: #38bdf8; margin-top: 2px;">
                      ID: <code>${v.id}</code> • <span>${v.subject || v.category || 'General'}</span>
                    </div>
                  </td>
                  <td>
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--admin-text);">${v.speaker || 'आरोग्यम टीम'}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.82rem; color: var(--admin-muted);">${v.duration || (fmt === 'short_reel' ? '0:58' : '45 मिनट')}</div>
                  </td>
                  <td>${tierLabel}</td>
                  <td>${statusBadge}</td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
                      <a href="${publicVidUrl}" target="_blank" class="admin-button small-button" style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); font-size: 0.75rem; font-weight: 700; padding: 4px 7px; text-decoration: none;" title="Open Video Link">
                        👁️ देखें
                      </a>
                      <a href="${waLink}" target="_blank" class="admin-button small-button" style="background: #25d366; color: #fff; font-size:0.75rem; font-weight:700; padding:4px 7px; text-decoration: none;" title="Share Video via WhatsApp">
                        📲 WA
                      </a>
                      <button type="button" class="btn-edit-recording admin-button small-button" data-recording-id="${v.id}" style="background: #f59e0b; color: #fff; font-weight: 700; font-size: 0.75rem; padding: 4px 7px;" title="Edit Video">
                        ✏️ एडिट
                      </button>
                      <button type="button" class="btn-delete-recording admin-button small-button" data-recording-id="${v.id}" style="background: #ef4444; color: #fff; font-weight: 700; font-size: 0.75rem; padding: 4px 7px;" title="Delete Video">
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
          Total Recordings: <strong style="color: var(--admin-text);">${total}</strong>
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

    bindRecordingActionEvents();
  }

  function bindRecordingActionEvents() {
    // Pagination Listeners
    document.getElementById('webinar-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.getElementById('webinar-next-page')?.addEventListener('click', () => {
      const totalPages = Math.ceil(allRecordings.length / PAGE_SIZE) || 1;
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });

    // Edit Recording Click
    tableContainer.querySelectorAll('.btn-edit-recording').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.dataset.recordingId;
        const rec = allRecordings.find(r => r.id === rId);
        if (!rec) return;
        openEditRecording(rec);
      });
    });

    // Delete Recording Click
    tableContainer.querySelectorAll('.btn-delete-recording').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.dataset.recordingId;
        deleteRecording(rId);
      });
    });
  }

  function openEditRecording(rec) {
    editingRecordingId = rec.id;
    if (createRecCard) createRecCard.style.display = 'block';
    if (formRecTitle) formRecTitle.innerHTML = `<span>✏️</span> एडिट वीडियो / रील: <span style="color:#60a5fa;">${rec.id}</span>`;

    const titleInput = document.getElementById('adm_rec_title');
    const catSelect = document.getElementById('adm_rec_category');
    const urlInput = document.getElementById('adm_rec_url');
    const speakerInput = document.getElementById('adm_rec_speaker');
    const durationInput = document.getElementById('adm_rec_duration');
    const tierSelect = document.getElementById('adm_rec_tier');
    const statusSelect = document.getElementById('adm_rec_status');
    const customCatWrapper = document.getElementById('adm_rec_custom_cat_wrapper');
    const customCatInput = document.getElementById('adm_rec_custom_cat_input');
    const platformSelect = document.getElementById('adm_rec_platform');

    const fmt = rec.format || (rec.id.startsWith('VID_S') ? 'short_reel' : 'full_video');
    const fmtRadio = document.querySelector(`input[name="adm_rec_format"][value="${fmt}"]`);
    if (fmtRadio) fmtRadio.checked = true;

    if (platformSelect) {
      platformSelect.value = rec.platform || detectPlatformFromUrl(rec.video_url || rec.youtube_url);
    }

    if (titleInput) titleInput.value = rec.title || '';
    if (urlInput) urlInput.value = rec.video_url || rec.youtube_url || (rec.youtube_id ? `https://www.youtube.com/watch?v=${rec.youtube_id}` : '');
    if (speakerInput) speakerInput.value = rec.speaker || '';
    if (durationInput) durationInput.value = rec.duration || (fmt === 'short_reel' ? '0:58' : '45 मिनट');
    if (tierSelect) tierSelect.value = rec.access_tier || 'guest';
    if (statusSelect) statusSelect.value = rec.status || 'active';

    if (catSelect) {
      const matchOpt = Array.from(catSelect.options).find(o => o.value === rec.category || o.value === rec.subject);
      if (matchOpt) {
        catSelect.value = matchOpt.value;
        if (customCatWrapper) customCatWrapper.style.display = 'none';
      } else {
        catSelect.value = 'custom';
        if (customCatWrapper) customCatWrapper.style.display = 'block';
        if (customCatInput) customCatInput.value = rec.category || rec.subject || '';
      }
    }

    updateRecThumbPreview();
    createRecCard?.scrollIntoView({ behavior: 'smooth' });
  }

  async function deleteRecording(recId) {
    if (!confirm(`क्या आप रिकॉर्डेड ट्रेनिंग (${recId}) को हटाना चाहते हैं?`)) return;

    // 1. Delete from Supabase Database
    const db = getAdminDb();
    if (db) {
      try {
        await db.from('landing_pages').delete().eq('id', recId);
      } catch (e) {
        console.warn('Supabase recording delete error:', e);
      }
    }

    // 2. Delete from localStorage
    let localList = JSON.parse(localStorage.getItem('AI_LOCAL_RECORDED_VIDEOS') || '[]');
    localList = localList.filter(v => v.id !== recId);
    localStorage.setItem('AI_LOCAL_RECORDED_VIDEOS', JSON.stringify(localList));

    // 3. Update memory state & trigger export
    allRecordings = allRecordings.filter(v => v.id !== recId);
    exportWebinarRecordingsJson();
    alert('🗑️ रिकॉर्डेड ट्रेनिंग सफलतापूर्वक हटा दी गई और webinar-recordings.json डाउनलोड हो गया।');
    loadWebinarData();
  }

  function bindPaginationAndActionEvents() {
    // Pagination Listeners
    document.getElementById('webinar-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.getElementById('webinar-next-page')?.addEventListener('click', () => {
      let filtered = getFilteredWebinars();
      if (activeTab === 'attendees') filtered = getFilteredAttendees();
      else if (activeTab === 'recordings') filtered = allRecordings;
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

    if (webinar.id === 'WB_MASTER') {
      setTargetPolicy('master');
    } else if (webinar.profile_id && webinar.profile_id !== 'ALL_USERS') {
      setTargetPolicy('single');
      const userSel = document.getElementById('adm_wb_user_select');
      if (userSel) userSel.value = webinar.profile_id;
    } else {
      setTargetPolicy('broadcast');
    }

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

    // Populate Section Reordering & Visibility
    if (Array.isArray(wData.section_order) && wData.section_order.length > 0) {
      currentSectionsOrder = [...wData.section_order];
    } else {
      currentSectionsOrder = defaultWebinarSections.map(s => s.key);
    }
    if (Array.isArray(wData.hidden_sections)) {
      currentHiddenSections = [...wData.hidden_sections];
    } else {
      currentHiddenSections = [];
    }
    renderWebinarSectionsReorderingList();

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

    // 1. Add to permanent deleted list in localStorage
    try {
      const deletedArr = JSON.parse(localStorage.getItem('AI_DELETED_WEBINAR_IDS') || '[]');
      if (!deletedArr.includes(webinarId)) {
        deletedArr.push(webinarId);
      }
      localStorage.setItem('AI_DELETED_WEBINAR_IDS', JSON.stringify(deletedArr));
    } catch (e) {}

    // 2. Delete from Supabase database
    const db = getAdminDb();
    try {
      if (db) {
        await db.from('landing_pages').delete().eq('id', webinarId);
        if (webinarId === 'WB_MASTER') {
          await db.from('landing_pages').delete().eq('category', 'webinar');
        }
      }
    } catch (e) {
      console.warn('Webinar delete error:', e);
    }

    // 3. Purge from ALL localStorage caches and keys
    try {
      const stored = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
      const filtered = stored.filter(w => w.id !== webinarId && (webinarId !== 'WB_MASTER' || w.category !== 'webinar'));
      localStorage.setItem('UCAS_LOCAL_LANDING_PAGES', JSON.stringify(filtered));

      localStorage.removeItem(`UCAS_LP_${webinarId}`);
      localStorage.removeItem(`AI_WB_CONFIG_${webinarId}`);
      if (webinarId === 'WB_MASTER') {
        localStorage.removeItem('UCAS_LP_WB_MASTER');
        localStorage.removeItem('AI_WB_CONFIG_WB_MASTER');
      }

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.includes(webinarId) || (webinarId === 'WB_MASTER' && (k.startsWith('AI_WB_') || k.startsWith('UCAS_LP_'))))) {
          try {
            const val = localStorage.getItem(k);
            if (val && (val.includes(webinarId) || val.includes('"category":"webinar"'))) {
              localStorage.removeItem(k);
            }
          } catch (e) {}
        }
      }
    } catch (e) {}

    // 4. Update memory state immediately
    allWebinars = allWebinars.filter(w => w.id !== webinarId);

    alert(`🗑️ वेबिनार (${webinarId}) सफलतापूर्वक हटा दिया गया।`);
    await loadWebinarData();
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

  function exportWebinarMasterJson(customData = null) {
    let masterObj = customData;
    if (!masterObj) {
      const activeMaster = allWebinars.find(w => w.id === 'WB_MASTER') || allWebinars[0];
      const wData = activeMaster?.webinar_data || {};
      masterObj = {
        webinarMaster: {
          id: "WB_MASTER",
          slug: "live-zoom-webinar",
          status: activeMaster?.status || "active",
          is_live_active: true,
          offair_title: "📺 अगला लाइव वेबिनार सत्र जल्द घोषित होगा (Stay Tuned)",
          offair_message: "वर्तमान में कोई लाइव वेबिनार प्रसारित नहीं हो रहा है। आप नीचे दी गई हमारी पिछली विशेष रिकॉर्डेड ट्रेनिंग क्लासेज देख सकते हैं:",
          title: activeMaster?.title || "🌾 लाइव ज़ूम वेबिनार एवं फसल परामर्श सत्र",
          description: activeMaster?.message || "आरोग्यम इंडिया के डिजिटल कृषि प्रशिक्षण सत्र में आपका स्वागत है। कृषि विशेषज्ञों से सीधे रूबरू हों और अपनी फसलों की पैदावार, कीट-रोग प्रबंधन और उन्नत जैविक तकनीकों के सटीक समाधान पाएं।",
          default_date: wData.date || todayStr,
          default_time: wData.time || "20:30",
          duration_minutes: Number(wData.duration_minutes || 90),
          default_price: Number(wData.price || 0),
          default_zoom_link: wData.zoom_link || "https://zoom.us/join",
          default_meeting_id: wData.meeting_id || "812 3456 7890",
          default_passcode: wData.passcode || "AI2026",
          cover_image: wData.cover_image || "/images/banners/universal-zoom-webinar-og.jpg",
          banners: Array.isArray(wData.banners) && wData.banners.length ? wData.banners : [
            "/images/banners/universal-zoom-webinar-og.jpg",
            "/images/banners/agriculture-hero-banner-1.webp",
            "/images/banners/agriculture-hero-banner-2.webp"
          ],
          youtube_videos: Array.isArray(wData.youtube_links) && wData.youtube_links.length ? wData.youtube_links : [
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          ],
          section_order: Array.isArray(wData.section_order) && wData.section_order.length ? wData.section_order : [
            "cover", "timer", "registration", "kpis", "banners", "videos", "tutorial", "faqs"
          ],
          hidden_sections: Array.isArray(wData.hidden_sections) ? wData.hidden_sections : [],
          kpis: Array.isArray(wData.kpis) && wData.kpis.length ? wData.kpis : [
            "जैविक एवं वैज्ञानिक कृषि की आधुनिक तकनीक और पैदावार बढ़ाने के व्यावहारिक गुर।",
            "फसल सुरक्षा, कीट-रोग व खरपतवार का संपूर्ण, किफ़ायती व सटीक समाधान।",
            "कृषि वैज्ञानिकों एवं फसल डॉक्टरों के साथ सीधे लाइव सवाल-जवाब एवं परामर्श।",
            "प्रतिभागियों के लिए विशेष गाइड, स्प्रे चार्ट्स और उपयोगी ट्रेनिंग सामग्री।"
          ],
          tutorial_steps: [
            { step: 1, title: "Zoom App डाउनलोड करें", desc: "अगर आपके फोन में Zoom App नहीं है, तो प्ले स्टोर या ऐप स्टोर से निःशुल्क इंस्टॉल करें।" },
            { step: 2, title: "'Join Meeting' दबाएं", desc: "वेबिनार समय से 2 मिनट पहले ऊपर दिए गए 'ज़ूम से जुड़ें' बटन पर क्लिक करें।" },
            { step: 3, title: "ऑडियो (आवाज़) चालू करें", desc: "ज़ूम में जुड़ने के बाद 'Join Audio' दबाकर 'Wifi or Cellular Data' चुनें।" },
            { step: 4, title: "अपना नाम लिखकर जुड़ें", desc: "अपना सही नाम दर्ज करें ताकि विशेषज्ञ आपके सवालों का लाइव जवाब दे सकें।" }
          ],
          faqs: Array.isArray(wData.faqs) && wData.faqs.length ? wData.faqs : [
            { q: "क्या यह वेबिनार निशुल्क है?", a: "हाँ, यह विशेष वेबिनार सत्र किसानों व सदस्यों के लिए पूर्णतः निःशुल्क (₹0) है।" },
            { q: "ज़ूम मीटिंग लिंक और पासवर्ड कब मिलेगा?", a: "रजिस्ट्रेशन करने के बाद निर्धारित समय से ठीक 2 मिनट पहले लिंक इसी पेज पर अपने आप अनलॉक हो जाएगी।" },
            { q: "मीटिंग जॉइन करने के लिए क्या करना होगा?", a: "आपको बस ऊपर दिए गए 'ज़ूम से जुड़ें' बटन पर क्लिक करना होगा या ज़ूम ऐप में मीटिंग आईडी व पासवर्ड डालना होगा।" },
            { q: "क्या मैं लाइव सवाल पूछ सकता हूँ?", a: "हाँ, लाइव सत्र के दौरान आप चैट या माइक ऑन करके कृषि विशेषज्ञ से सीधे सवाल पूछ सकते हैं।" }
          ]
        }
      };
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(masterObj, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "webinar-master.json");
    dlAnchorElem.click();
  }

  function exportWebinarRecordingsJson() {
    const dataObj = {
      recordings: allRecordings
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "webinar-recordings.json");
    dlAnchorElem.click();
  }

  document.getElementById('btn-export-webinar-master')?.addEventListener('click', () => exportWebinarMasterJson());
  document.getElementById('btn-export-webinar-recordings')?.addEventListener('click', () => exportWebinarRecordingsJson());

  searchInput?.addEventListener('input', () => { currentPage = 1; renderTable(); });
  userFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  dateDropdown?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  refreshBtn?.addEventListener('click', loadWebinarData);

  await loadWebinarData();
}
