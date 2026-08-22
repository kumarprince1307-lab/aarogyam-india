import { initAdminLayout } from './admin-main.js';
import { fetchUsers } from './admin-api.js';

const PAGE_SIZE = 20;

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

export async function initAllLandingPages() {
  initAdminLayout('UCAS Landing Pages & Webinars', 'Create, edit on behalf of users, approve, or block landing pages and webinar campaigns.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let currentPage = 1;
  let allPages = [];
  let allUsers = [];
  let allSurveys = [];

  let editingPageId = null;
  let activeContentType = 'image';
  let uploadedImageData = null;
  let detectedYoutubeId = null;
  let detectedYoutubeThumbnail = null;

  // User Target Mode: 'single' | 'multi' | 'all'
  let targetUserMode = 'single';
  let multiSelectedUserIds = new Set();
  let selectedLandingPageIds = new Set();

  content.innerHTML = `
    <!-- Top Header & Action Controls -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📣 UCAS Landing Pages & Webinars Hub</span>
            <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Unified Creator & Editor</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">
            Create or edit landing pages & webinars for one user, multiple users, or all users at once with instant referral attribution.
          </p>
        </div>
        <div style="display:flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-toggle-admin-builder" class="admin-button" style="background: #2563eb; color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <span>🪄</span> <span>+ नया पेज / वेबिनार बनाएं (Create for User)</span>
          </button>
          <button id="lp-refresh-btn" class="admin-button small-button">🔄 Refresh Data</button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-top: 14px;">
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #3b82f6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">📄 कुल पेजेस (Total Created)</div>
          <div id="kpi-lp-total" style="font-size: 1.6rem; font-weight: 800; color: var(--admin-text); margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">⏳ समीक्षा लंबित (Pending Review)</div>
          <div id="kpi-lp-pending" style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #10b981;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🟢 सक्रिय (Active / Live)</div>
          <div id="kpi-lp-active" style="font-size: 1.6rem; font-weight: 800; color: #10b981; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #ef4444;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🔴 ब्लॉक (Blocked / Inactive)</div>
          <div id="kpi-lp-blocked" style="font-size: 1.6rem; font-weight: 800; color: #ef4444; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #8b5cf6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🎥 कुल वेबिनार (Webinars)</div>
          <div id="kpi-lp-webinars" style="font-size: 1.6rem; font-weight: 800; color: #8b5cf6; margin-top: 4px;">0</div>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         ADMIN UNIFIED LANDING PAGE & WEBINAR CREATOR / EDITOR
         ========================================================================= -->
    <div id="admin-lp-builder-card" class="admin-card" style="display: none; margin-bottom: 20px; background: var(--admin-surface-2, #0f172a); border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--admin-border, #334155); padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.4rem;">🪄</span>
          <h3 id="admin-builder-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--admin-text);">
            नया लैंडिंग पेज या वेबिनार बनाएं (Admin Creator)
          </h3>
        </div>
        <button type="button" id="btn-close-admin-builder" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted); font-weight: 700;">
          &times; बंद करें (Close)
        </button>
      </div>

      <form id="admin-lp-form" onsubmit="return false;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          
          <!-- 1. Target User Selector & Multi-User / All-Users Engine -->
          <div class="admin-form-group" style="grid-column: 1 / -1; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.25); border-radius: 10px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
              <label class="admin-label" style="font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px; font-size: 0.92rem; margin: 0;">
                <span>👥 किन यूजर्स के लिए पेज बनाना है? (User Referral Attribution) *</span>
              </label>
              
              <!-- User Target Mode Switcher -->
              <div style="display: flex; gap: 6px; background: var(--admin-surface, #1e293b); padding: 4px; border-radius: 8px; border: 1px solid var(--admin-border);">
                <button type="button" id="adm_mode_single" class="admin-button small-button" style="background: #2563eb; color: #fff; font-weight: 700; font-size: 0.78rem; padding: 4px 10px;">
                  👤 सिंगल यूजर
                </button>
                <button type="button" id="adm_mode_multi" class="admin-button small-button" style="background: transparent; color: var(--admin-text); font-weight: 700; font-size: 0.78rem; padding: 4px 10px;">
                  👥 एक से ज्यादा (Multi-Select)
                </button>
                <button type="button" id="adm_mode_all" class="admin-button small-button" style="background: transparent; color: var(--admin-text); font-weight: 700; font-size: 0.78rem; padding: 4px 10px;">
                  🌐 सभी यूजर्स (All Users)
                </button>
              </div>
            </div>

            <!-- Single User Dropdown Container -->
            <div id="adm_user_single_wrap">
              <select id="adm_lp_user_select" class="admin-select" style="width: 100%; font-weight: 600; padding: 10px 12px;">
                <option value="">-- यूजर चुनें (Select User: Name, Mobile, Share ID) --</option>
              </select>
              <div id="adm_lp_user_info_badge" style="display:none; font-size:0.82rem; color:#10b981; font-weight:700; margin-top:6px;"></div>
            </div>

            <!-- Multi-Select Users Container -->
            <div id="adm_user_multi_wrap" style="display: none; margin-top: 8px;">
              <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; align-items: center;">
                <input type="text" id="adm_multi_search_input" class="admin-input" placeholder="🔍 नाम, मोबाइल या Share ID से खोजें..." style="flex: 2; min-width: 200px; padding: 6px 10px; font-size: 0.85rem;" />
                <button type="button" id="adm_btn_select_all_users" class="admin-button small-button" style="background: #3b82f6; color: #fff; font-size: 0.78rem;">✓ Select All</button>
                <button type="button" id="adm_btn_select_active_users" class="admin-button small-button" style="background: #10b981; color: #fff; font-size: 0.78rem;">🟢 Only Active</button>
                <button type="button" id="adm_btn_deselect_all_users" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted); font-size: 0.78rem;">✕ Clear All</button>
                <span id="adm_multi_count_badge" style="font-size: 0.82rem; font-weight: 800; color: #60a5fa; margin-left: auto;">0 यूजर्स चुने गए</span>
              </div>

              <!-- Multi-select User Checkboxes List -->
              <div id="adm_multi_user_list" style="max-height: 220px; overflow-y: auto; background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border, #334155); border-radius: 8px; padding: 8px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px;">
                <!-- Populated Dynamically -->
              </div>
            </div>

            <!-- All Users Notification Banner -->
            <div id="adm_user_all_wrap" style="display: none; background: rgba(16,185,129,0.12); border: 1.5px solid #10b981; border-radius: 8px; padding: 12px; margin-top: 6px;">
              <div style="font-weight: 800; color: #10b981; font-size: 0.92rem; display: flex; align-items: center; gap: 8px;">
                <span>🌐</span>
                <span>सभी यूजर्स (All Users Broadcast):</span>
              </div>
              <p style="font-size: 0.84rem; color: var(--admin-text); margin: 4px 0 0 0;">
                यह लैंडिंग पेज / वेबिनार सिस्टम में मौजूद <strong>सभी <span id="adm_all_users_count">0</span> यूजर्स</strong> के लिए अलग-अलग जनरेट हो जाएगा। प्रत्येक यूजर के <strong>UCAS "My Profile / Landing Pages"</strong> में उनके व्यक्तिगत Referral Share ID के साथ स्वतः दिखने लगेगा।
              </p>
            </div>

          </div>

          <!-- 2. Campaign Type Selector -->
          <div class="admin-form-group">
            <label class="admin-label" style="font-weight: 700;">अभियान प्रकार (Campaign Type)</label>
            <div style="display: flex; gap: 10px; margin-top: 6px;">
              <label style="flex: 1; padding: 10px; background: var(--admin-surface, #1e293b); border: 1.5px solid #3b82f6; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.88rem;">
                <input type="radio" name="adm_campaign_type" value="landing_page" checked />
                <span>📄 Regular Landing Page</span>
              </label>
              <label style="flex: 1; padding: 10px; background: var(--admin-surface, #1e293b); border: 1.5px solid var(--admin-border); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.88rem;">
                <input type="radio" name="adm_campaign_type" value="webinar" />
                <span>🎥 Webinar & Zoom Event</span>
              </label>
            </div>
          </div>

          <!-- 3. Category Selector -->
          <div class="admin-form-group">
            <label class="admin-label" style="font-weight: 700;">कैटेगरी (Category)</label>
            <select id="adm_lp_category" class="admin-select" style="width: 100%; padding: 10px 12px; margin-top: 6px;">
              <option value="agriculture">🌾 Agriculture (कृषि समाधान)</option>
              <option value="healthcare">🩺 Healthcare (स्वास्थ्य एवं पोषण)</option>
              <option value="wealth">💰 Wealth & Business (व्यापार एवं आय)</option>
              <option value="insurance">🛡️ Insurance (बीमा एवं सुरक्षा)</option>
              <option value="property">🏢 Property (प्रॉपर्टी एवं रियल एस्टेट)</option>
              <option value="women_empowerment">👩 Women Empowerment (महिला सशक्तिकरण)</option>
              <option value="cattlecare">🐄 Cattle Care (पशु पालन)</option>
              <option value="beautycare">✨ Beauty Care (सौंदर्य देखभाल)</option>
              <option value="webinar">🎥 Webinar Invitation (वेबिनार आमंत्रण)</option>
              <option value="other">📦 Other / General (सामान्य)</option>
            </select>
          </div>

          <!-- 4. Title / Heading -->
          <div class="admin-form-group" style="grid-column: 1 / -1;">
            <label class="admin-label" style="font-weight: 700;">पेज का मुख्य शीर्षक / हेडिंग (Title/Heading) *</label>
            <input type="text" id="adm_lp_title" class="admin-input" placeholder="उदा. Aarogyam India विशेष जैविक कृषि मार्गदर्शन" style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 10px 12px;" required />
          </div>

          <!-- 5. Message / Description -->
          <div class="admin-form-group" style="grid-column: 1 / -1;">
            <label class="admin-label" style="font-weight: 700;">विवरण व आमंत्रण संदेश (Message / Body) *</label>
            <textarea id="adm_lp_message" class="admin-textarea" rows="3" placeholder="नमस्ते! Aarogyam India में आपका स्वागत है। विस्तृत जानकारी व सलाह के लिए नीचे दिया गया छोटा सर्वे फॉर्म अवश्य भरें..." style="width: 100%; padding: 10px 12px;" required></textarea>
          </div>

          <!-- 6. Media Options -->
          <div class="admin-form-group" style="grid-column: 1 / -1;">
            <label class="admin-label" style="font-weight: 700;">बैनर मीडिया (Image या YouTube Video)</label>
            <div style="display: flex; gap: 10px; margin-bottom: 8px; margin-top: 4px;">
              <button type="button" id="adm_btn_media_image" class="admin-button small-button" style="background:#2563eb;color:#fff;font-weight:700;">🖼️ Banner Image</button>
              <button type="button" id="adm_btn_media_youtube" class="admin-button small-button" style="background:var(--admin-surface);color:var(--admin-text);border:1px solid var(--admin-border);font-weight:700;">🎥 YouTube Video</button>
            </div>

            <!-- Image File Input -->
            <div id="adm_box_image_input">
              <input type="file" id="adm_lp_image_file" accept="image/*" class="admin-input" style="width: 100%; padding: 8px 12px;" />
              <div id="adm_lp_img_preview_wrap" style="display:none; margin-top: 10px;">
                <img id="adm_lp_img_preview" src="" alt="Preview" style="max-height: 160px; border-radius: 8px; border: 1px solid var(--admin-border);" />
              </div>
            </div>

            <!-- YouTube Video Input -->
            <div id="adm_box_youtube_input" style="display: none;">
              <input type="url" id="adm_lp_youtube_url" class="admin-input" placeholder="https://www.youtube.com/watch?v=... या https://youtu.be/..." style="width: 100%; padding: 10px 12px;" />
              <div id="adm_lp_yt_preview_wrap" style="display:none; margin-top: 10px;">
                <img id="adm_lp_yt_preview" src="" alt="YouTube Preview" style="max-height: 160px; border-radius: 8px; border: 1px solid var(--admin-border);" />
              </div>
            </div>
          </div>

          <!-- 7. Zoom Webinar Details (Conditional) -->
          <div id="adm_webinar_fields_wrap" style="grid-column: 1 / -1; display: none; background: rgba(37,99,235,0.08); border: 1.5px dashed #3b82f6; border-radius: 10px; padding: 14px;">
            <div style="font-weight: 800; color: #3b82f6; margin-bottom: 10px; font-size: 0.95rem; display:flex; align-items:center; gap:6px;">
              <span>🎥</span> <span>Zoom Live Meeting Details (रजिस्ट्रेशन के बाद अनलॉक होंगी)</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
              <div>
                <label class="admin-label" style="font-size:0.8rem; font-weight:700;">📅 दिनांक व समय (Date & Time)</label>
                <input type="text" id="adm_wb_datetime" class="admin-input" placeholder="उदा. 25 अगस्त 2026, शाम 7:00 बजे" style="width:100%;" />
              </div>
              <div>
                <label class="admin-label" style="font-size:0.8rem; font-weight:700;">🔗 Zoom Join Link</label>
                <input type="url" id="adm_wb_zoom_link" class="admin-input" placeholder="https://us05web.zoom.us/j/..." style="width:100%;" />
              </div>
              <div>
                <label class="admin-label" style="font-size:0.8rem; font-weight:700;">🆔 Meeting ID</label>
                <input type="text" id="adm_wb_meeting_id" class="admin-input" placeholder="892 4112 5590" style="width:100%;" />
              </div>
              <div>
                <label class="admin-label" style="font-size:0.8rem; font-weight:700;">🔑 Passcode / Password</label>
                <input type="text" id="adm_wb_passcode" class="admin-input" placeholder="889900" style="width:100%;" />
              </div>
              <div style="grid-column: 1 / -1;">
                <label class="admin-label" style="font-size:0.8rem; font-weight:700;">💬 अनलॉक होने पर बधाई संदेश</label>
                <input type="text" id="adm_wb_success_msg" class="admin-input" placeholder="बधाई! आपकी सीट आरक्षित हो गई है। नीचे दिए गए बटन से ज़ूम जॉइन करें।" style="width:100%;" />
              </div>
            </div>
          </div>

          <!-- 8. Status Approval Selector -->
          <div class="admin-form-group">
            <label class="admin-label" style="font-weight: 700;">स्टेटस (Admin Status Approval)</label>
            <select id="adm_lp_status" class="admin-select" style="width: 100%; padding: 10px 12px; margin-top: 6px;">
              <option value="active">🟢 Active / Live (स्वतः स्वीकृत)</option>
              <option value="pending_review">⏳ Pending Review (समीक्षाधीन)</option>
              <option value="blocked">🔴 Blocked / Disabled (ब्लॉक)</option>
            </select>
          </div>

        </div>

        <!-- Submit Buttons -->
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; border-top: 1px solid var(--admin-border, #334155); padding-top: 14px;">
          <button type="button" id="adm_btn_cancel_edit" class="admin-button" style="display:none; background:transparent; border:1px solid var(--admin-border); color:var(--admin-text); font-weight:700;">
            रद्द करें (Cancel Edit)
          </button>
          <button type="submit" id="adm_btn_save_lp" class="admin-button" style="background:#10b981; color:#fff; font-weight:800; padding: 10px 24px; font-size: 0.95rem;">
            ✨ Generate & Save Page
          </button>
        </div>
      </form>

      <!-- Generated Result Banner -->
      <div id="adm-lp-result-card" style="display: none; margin-top: 16px; background: rgba(16,185,129,0.1); border: 1.5px solid #10b981; border-radius: 10px; padding: 14px;">
        <div id="adm_result_header_msg" style="font-weight: 800; color: #10b981; margin-bottom: 6px; font-size: 0.95rem;">
          🎉 पेज सफलतापूर्वक तैयार हो गया!
        </div>
        <div id="adm_single_result_actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <input type="text" id="adm_lp_result_url" class="admin-input" readonly style="flex: 2; min-width: 260px; font-weight: 600; color: #10b981;" />
          <button type="button" id="adm_btn_copy_url" class="admin-button small-button" style="background:#10b981;color:#fff;">📋 Copy Link</button>
          <button type="button" id="adm_btn_wa_share" class="admin-button small-button" style="background:#25D366;color:#fff;">💬 WhatsApp</button>
          <button type="button" id="adm_btn_fb_share" class="admin-button small-button" style="background:#1877F2;color:#fff;">🌐 Facebook</button>
          <button type="button" id="adm_btn_open_public" class="admin-button small-button" style="background:var(--admin-surface);color:var(--admin-text);border:1px solid var(--admin-border);">👁️ Open URL</button>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         MULTI-FILTER CONTROLS BAR
         ========================================================================= -->
    <div class="admin-card admin-controls" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; background: var(--admin-surface-2, #0f172a);">
      <input id="lp-search-box" type="search" placeholder="🔍 शीर्षक, यूजर, Share ID, मोबाइल से खोजें..." class="admin-input" style="flex: 2; min-width: 200px;" />

      <!-- Creator Filter -->
      <select id="lp-creator-filter" class="admin-select" style="flex: 1.2; min-width: 160px;">
        <option value="all">👥 All Creators (सभी यूजर्स)</option>
      </select>

      <!-- Category & Type Filter (Requested by User) -->
      <select id="lp-type-cat-filter" class="admin-select" style="flex: 1.2; min-width: 170px;">
        <option value="all">📂 All Types & Categories</option>
        <optgroup label="Campaign Types">
          <option value="type_landing_page">📄 Standard Landing Pages</option>
          <option value="type_webinar">🎥 Webinar Invitations</option>
        </optgroup>
        <optgroup label="Categories">
          <option value="agriculture">🌾 Agriculture (कृषि)</option>
          <option value="healthcare">🩺 Healthcare (स्वास्थ्य)</option>
          <option value="wealth">💰 Wealth & NetSurf (व्यवसाय)</option>
          <option value="insurance">🛡️ Insurance (बीमा)</option>
          <option value="property">🏢 Property (प्रॉपर्टी)</option>
          <option value="women_empowerment">👩 Women Empowerment</option>
          <option value="cattlecare">🐄 Cattle Care (पशु पालन)</option>
          <option value="beautycare">✨ Beauty Care</option>
          <option value="webinar">🎥 Webinar</option>
          <option value="other">📦 Other / General</option>
        </optgroup>
      </select>

      <!-- Status Filter -->
      <select id="lp-status-filter" class="admin-select" style="flex: 1; min-width: 140px;">
        <option value="all">⚡ All Statuses</option>
        <option value="pending_review">⏳ Pending Review</option>
        <option value="active">🟢 Active / Approved</option>
        <option value="blocked">🔴 Blocked / Rejected</option>
      </select>

      <!-- Date Filter -->
      <select id="lp-date-filter" class="admin-select" style="flex: 1; min-width: 120px;">
        <option value="all">📅 All Time</option>
        <option value="today">Today</option>
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
      </select>
    </div>

    <!-- =========================================================================
         BULK ACTIONS TOOLBAR (Select All, Bulk Activate, Bulk Block, Bulk Delete)
         ========================================================================= -->
    <div id="lp-bulk-actions-bar" style="display: none; margin-top: 10px; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1.5px solid #3b82f6; border-radius: 10px; padding: 10px 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <span id="lp-bulk-selected-count" style="font-weight:800; color:#60a5fa; font-size:0.92rem;">0 पेजेस चुने गए</span>
        <button type="button" id="btn-bulk-select-all-filtered" class="admin-button small-button" style="background: rgba(59,130,246,0.15); color:#60a5fa; border: 1px solid rgba(59,130,246,0.3); font-size:0.78rem; font-weight:700;">
          ✓ सभी फ़िल्टर चुने (Select All)
        </button>
        <button type="button" id="btn-bulk-deselect-all" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color:var(--admin-muted); font-size:0.78rem; font-weight:700;">
          ✕ अन-सेलेक्ट (Clear)
        </button>
      </div>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <button type="button" id="btn-bulk-activate" class="admin-button small-button" style="background:#10b981; color:#fff; font-weight:800; font-size:0.82rem; padding:6px 14px; box-shadow:0 2px 8px rgba(16,185,129,0.3);">
          🟢 सभी सक्रिय करें (Activate Selected)
        </button>
        <button type="button" id="btn-bulk-block" class="admin-button small-button" style="background:#f59e0b; color:#fff; font-weight:800; font-size:0.82rem; padding:6px 14px; box-shadow:0 2px 8px rgba(245,158,11,0.3);">
          🔴 सभी ब्लॉक करें (Block Selected)
        </button>
        <button type="button" id="btn-bulk-delete" class="admin-button small-button" style="background:#ef4444; color:#fff; font-weight:800; font-size:0.82rem; padding:6px 14px; box-shadow:0 2px 8px rgba(239,68,68,0.3);">
          🗑️ सभी हटाएं (Delete Selected)
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div id="landing-pages-table-wrapper" style="margin-top: 10px;">
      <div class="admin-loading">डेटाबेस से लैंडिंग पेज व वेबिनार डेटा लोड हो रहा है…</div>
    </div>

    <!-- Responses / Attendees Inspection Drawer -->
    <div id="lp-drawer-overlay" class="admin-drawer-overlay">
      <div class="admin-drawer" style="max-width: 620px;">
        <div class="admin-drawer-header">
          <div class="admin-drawer-title">
            <span id="lp-drawer-title">📋 प्राप्त सर्वे रिस्पॉन्स / Attendees</span>
          </div>
          <button type="button" id="lp-drawer-close" class="admin-drawer-close">&times;</button>
        </div>
        <div id="lp-drawer-body" class="admin-drawer-body"></div>
      </div>
    </div>
  `;

  const tableContainer = document.getElementById('landing-pages-table-wrapper');
  const searchInput = document.getElementById('lp-search-box');
  const creatorFilter = document.getElementById('lp-creator-filter');
  const typeCatFilter = document.getElementById('lp-type-cat-filter');
  const statusFilter = document.getElementById('lp-status-filter');
  const dateFilter = document.getElementById('lp-date-filter');
  const refreshBtn = document.getElementById('lp-refresh-btn');

  const builderCard = document.getElementById('admin-lp-builder-card');
  const toggleBuilderBtn = document.getElementById('btn-toggle-admin-builder');
  const closeBuilderBtn = document.getElementById('btn-close-admin-builder');
  const builderTitle = document.getElementById('admin-builder-title');

  // User Mode Buttons & Containers
  const btnModeSingle = document.getElementById('adm_mode_single');
  const btnModeMulti = document.getElementById('adm_mode_multi');
  const btnModeAll = document.getElementById('adm_mode_all');
  const userSingleWrap = document.getElementById('adm_user_single_wrap');
  const userMultiWrap = document.getElementById('adm_user_multi_wrap');
  const userAllWrap = document.getElementById('adm_user_all_wrap');
  const userSelect = document.getElementById('adm_lp_user_select');
  const userInfoBadge = document.getElementById('adm_lp_user_info_badge');
  const multiSearchInput = document.getElementById('adm_multi_search_input');
  const multiUserList = document.getElementById('adm_multi_user_list');
  const multiCountBadge = document.getElementById('adm_multi_count_badge');
  const btnSelectAllUsers = document.getElementById('adm_btn_select_all_users');
  const btnSelectActiveUsers = document.getElementById('adm_btn_select_active_users');
  const btnDeselectAllUsers = document.getElementById('adm_btn_deselect_all_users');
  const allUsersCountEl = document.getElementById('adm_all_users_count');

  const form = document.getElementById('admin-lp-form');
  const titleInput = document.getElementById('adm_lp_title');
  const messageInput = document.getElementById('adm_lp_message');
  const categorySelect = document.getElementById('adm_lp_category');
  const statusSelect = document.getElementById('adm_lp_status');
  const cancelEditBtn = document.getElementById('adm_btn_cancel_edit');
  const saveBtn = document.getElementById('adm_btn_save_lp');

  const webinarFieldsWrap = document.getElementById('adm_webinar_fields_wrap');
  const wbDatetime = document.getElementById('adm_wb_datetime');
  const wbZoomLink = document.getElementById('adm_wb_zoom_link');
  const wbMeetingId = document.getElementById('adm_wb_meeting_id');
  const wbPasscode = document.getElementById('adm_wb_passcode');
  const wbSuccessMsg = document.getElementById('adm_wb_success_msg');

  const btnMediaImg = document.getElementById('adm_btn_media_image');
  const btnMediaYt = document.getElementById('adm_btn_media_youtube');
  const boxImgInput = document.getElementById('adm_box_image_input');
  const boxYtInput = document.getElementById('adm_box_youtube_input');
  const imgFileInput = document.getElementById('adm_lp_image_file');
  const imgPreviewWrap = document.getElementById('adm_lp_img_preview_wrap');
  const imgPreview = document.getElementById('adm_lp_img_preview');
  const ytUrlInput = document.getElementById('adm_lp_youtube_url');
  const ytPreviewWrap = document.getElementById('adm_lp_yt_preview_wrap');
  const ytPreview = document.getElementById('adm_lp_yt_preview');

  const resultCard = document.getElementById('adm-lp-result-card');
  const resultHeaderMsg = document.getElementById('adm_result_header_msg');
  const resultUrlInput = document.getElementById('adm_lp_result_url');

  const drawerOverlay = document.getElementById('lp-drawer-overlay');
  const drawerCloseBtn = document.getElementById('lp-drawer-close');
  const drawerTitle = document.getElementById('lp-drawer-title');
  const drawerBody = document.getElementById('lp-drawer-body');

  drawerCloseBtn?.addEventListener('click', () => drawerOverlay?.classList.remove('active'));
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('active');
  });

  // Builder Toggle
  toggleBuilderBtn?.addEventListener('click', () => {
    if (builderCard.style.display === 'none') {
      resetAdminBuilder();
      builderCard.style.display = 'block';
      builderCard.scrollIntoView({ behavior: 'smooth' });
    } else {
      builderCard.style.display = 'none';
      resetAdminBuilder();
    }
  });

  closeBuilderBtn?.addEventListener('click', () => {
    builderCard.style.display = 'none';
    resetAdminBuilder();
  });

  cancelEditBtn?.addEventListener('click', () => {
    resetAdminBuilder();
    builderCard.style.display = 'none';
  });

  // User Selection Mode Switcher Listeners
  btnModeSingle?.addEventListener('click', () => setUserTargetMode('single'));
  btnModeMulti?.addEventListener('click', () => setUserTargetMode('multi'));
  btnModeAll?.addEventListener('click', () => setUserTargetMode('all'));

  function setUserTargetMode(mode) {
    targetUserMode = mode;
    [btnModeSingle, btnModeMulti, btnModeAll].forEach(btn => {
      if (!btn) return;
      btn.style.background = 'transparent';
      btn.style.color = 'var(--admin-text)';
    });

    if (mode === 'single') {
      btnModeSingle.style.background = '#2563eb';
      btnModeSingle.style.color = '#fff';
      userSingleWrap.style.display = 'block';
      userMultiWrap.style.display = 'none';
      userAllWrap.style.display = 'none';
    } else if (mode === 'multi') {
      btnModeMulti.style.background = '#2563eb';
      btnModeMulti.style.color = '#fff';
      userSingleWrap.style.display = 'none';
      userMultiWrap.style.display = 'block';
      userAllWrap.style.display = 'none';
      renderMultiUserList();
    } else if (mode === 'all') {
      btnModeAll.style.background = '#10b981';
      btnModeAll.style.color = '#fff';
      userSingleWrap.style.display = 'none';
      userMultiWrap.style.display = 'none';
      userAllWrap.style.display = 'block';
      if (allUsersCountEl) allUsersCountEl.textContent = allUsers.length;
    }
  }

  // Multi User Select Actions
  btnSelectAllUsers?.addEventListener('click', () => {
    multiSelectedUserIds = new Set(allUsers.map(u => u.id));
    renderMultiUserList();
  });

  btnSelectActiveUsers?.addEventListener('click', () => {
    multiSelectedUserIds = new Set(allUsers.filter(u => u.is_active || u.is_subscriber).map(u => u.id));
    renderMultiUserList();
  });

  btnDeselectAllUsers?.addEventListener('click', () => {
    multiSelectedUserIds.clear();
    renderMultiUserList();
  });

  multiSearchInput?.addEventListener('input', () => {
    renderMultiUserList();
  });

  function renderMultiUserList() {
    if (!multiUserList) return;
    const q = (multiSearchInput?.value || '').toLowerCase().trim();
    const filteredUsers = allUsers.filter(u => {
      if (!q) return true;
      const n = (u.name || u.full_name || '').toLowerCase();
      const m = (u.mobile || '').toLowerCase();
      const s = (u.share_id || '').toLowerCase();
      return n.includes(q) || m.includes(q) || s.includes(q);
    });

    if (multiCountBadge) {
      multiCountBadge.textContent = `${multiSelectedUserIds.size} / ${allUsers.length} यूजर्स चुने गए`;
    }

    if (filteredUsers.length === 0) {
      multiUserList.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--admin-muted);padding:1rem;">कोई यूजर नहीं मिला</div>';
      return;
    }

    multiUserList.innerHTML = filteredUsers.map(u => {
      const isChecked = multiSelectedUserIds.has(u.id);
      const isAct = u.is_active || u.is_subscriber;
      return `
        <label style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--admin-surface-2, #0f172a);border:1px solid ${isChecked ? '#3b82f6' : 'var(--admin-border)'};border-radius:6px;cursor:pointer;user-select:none;">
          <input type="checkbox" class="adm-user-checkbox" value="${u.id}" ${isChecked ? 'checked' : ''} style="width:16px;height:16px;accent-color:#3b82f6;" />
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.84rem;color:var(--admin-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${u.name || u.full_name || 'User'}
            </div>
            <div style="font-size:0.75rem;color:var(--admin-muted);display:flex;gap:6px;align-items:center;">
              <span>📞 ${u.mobile || '-'}</span>
              <span>•</span>
              <code>${u.share_id || '-'}</code>
            </div>
          </div>
          <div>
            ${isAct ? '<span style="color:#10b981;font-size:0.68rem;font-weight:800;background:rgba(16,185,129,0.15);padding:1px 5px;border-radius:4px;">Active</span>' : '<span style="color:#ef4444;font-size:0.68rem;font-weight:800;background:rgba(239,68,68,0.15);padding:1px 5px;border-radius:4px;">Inactive</span>'}
          </div>
        </label>
      `;
    }).join('');

    multiUserList.querySelectorAll('.adm-user-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.checked) {
          multiSelectedUserIds.add(e.target.value);
        } else {
          multiSelectedUserIds.delete(e.target.value);
        }
        if (multiCountBadge) {
          multiCountBadge.textContent = `${multiSelectedUserIds.size} / ${allUsers.length} यूजर्स चुने गए`;
        }
      });
    });
  }

  // Media Tab Switcher
  btnMediaImg?.addEventListener('click', () => {
    activeContentType = 'image';
    btnMediaImg.style.background = '#2563eb';
    btnMediaImg.style.color = '#fff';
    btnMediaYt.style.background = 'var(--admin-surface)';
    btnMediaYt.style.color = 'var(--admin-text)';
    boxImgInput.style.display = 'block';
    boxYtInput.style.display = 'none';
  });

  btnMediaYt?.addEventListener('click', () => {
    activeContentType = 'youtube';
    btnMediaYt.style.background = '#2563eb';
    btnMediaYt.style.color = '#fff';
    btnMediaImg.style.background = 'var(--admin-surface)';
    btnMediaImg.style.color = 'var(--admin-text)';
    boxImgInput.style.display = 'none';
    boxYtInput.style.display = 'block';
  });

  // Campaign Type Radio Toggle
  form.querySelectorAll('input[name="adm_campaign_type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isWb = e.target.value === 'webinar';
      webinarFieldsWrap.style.display = isWb ? 'block' : 'none';
      if (isWb) categorySelect.value = 'webinar';
    });
  });

  categorySelect?.addEventListener('change', (e) => {
    if (e.target.value === 'webinar') {
      webinarFieldsWrap.style.display = 'block';
      const r = form.querySelector('input[name="adm_campaign_type"][value="webinar"]');
      if (r) r.checked = true;
    }
  });

  // Image Upload Handling & Compression
  imgFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1920;
        let w = img.width;
        let h = img.height;

        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { alpha: file.type === 'image/png' });
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = mimeType === 'image/jpeg' ? 0.92 : undefined;
        uploadedImageData = canvas.toDataURL(mimeType, quality);

        if (imgPreview) imgPreview.src = uploadedImageData;
        if (imgPreviewWrap) imgPreviewWrap.style.display = 'block';
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  function extractYoutubeVideoId(url) {
    if (!url) return null;
    const str = String(url).trim();
    if (!str) return null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }

    const patterns = [
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/,
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }

    const genericMatch = str.match(/(?:[\/=])([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/);
    if (genericMatch && genericMatch[1] && genericMatch[1].length === 11) {
      return genericMatch[1];
    }

    return null;
  }

  function handleAdminYoutubeInput(val) {
    const videoId = extractYoutubeVideoId(val);
    if (videoId) {
      detectedYoutubeId = videoId;
      detectedYoutubeThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      if (ytPreview) ytPreview.src = detectedYoutubeThumbnail;
      if (ytPreviewWrap) ytPreviewWrap.style.display = 'block';
    } else {
      detectedYoutubeId = null;
      detectedYoutubeThumbnail = null;
      if (ytPreviewWrap) ytPreviewWrap.style.display = 'none';
    }
  }

  // YouTube Live Parsing & Thumbnail Extraction (multi-event)
  if (ytUrlInput) {
    ['input', 'paste', 'change', 'blur'].forEach(evtType => {
      ytUrlInput.addEventListener(evtType, () => {
        setTimeout(() => handleAdminYoutubeInput(ytUrlInput.value), 20);
      });
    });
  }

  // User Selection Badge
  userSelect?.addEventListener('change', () => {
    const selId = userSelect.value;
    const u = allUsers.find(x => x.id === selId);
    if (u && userInfoBadge) {
      const isAct = u.is_active || u.is_subscriber;
      userInfoBadge.style.display = 'block';
      userInfoBadge.innerHTML = `👤 चुना गया: <strong>${u.name || u.full_name || 'User'}</strong> • Share ID: <code>${u.share_id || '-'}</code> • Status: ${isAct ? '🟢 Active' : '🔴 Inactive'}`;
    } else if (userInfoBadge) {
      userInfoBadge.style.display = 'none';
    }
  });

  // ==========================================
  // LOAD DATA & POPULATE (Supabase + LocalStorage)
  // ==========================================
  async function loadData() {
    tableContainer.innerHTML = '<div class="admin-loading">डेटाबेस से लैंडिंग पेज व यूजर्स लोड हो रहे हैं…</div>';

    const db = getAdminDb();
    let lpList = [];
    let userList = [];
    let surveyList = [];

    // 1. Fetch Real Users from fetchUsers() API
    try {
      const userRes = await fetchUsers({ status: 'all' });
      if (userRes && userRes.success && Array.isArray(userRes.data) && userRes.data.length > 0) {
        userList = userRes.data.map(u => ({
          id: u.id,
          name: u.name || u.full_name || 'User',
          full_name: u.name || u.full_name || 'User',
          mobile: u.mobile || '-',
          email: u.email || '',
          share_id: u.shareId || u.share_id || 'AI000000',
          is_active: u.status === 'active' || u.is_active === true,
          is_subscriber: u.status === 'active' || u.is_active === true,
          source: u.source || u.registration_source || '-'
        }));
      }
    } catch (e) {
      console.warn('fetchUsers notice:', e);
    }

    // Direct fallback if fetchUsers returned 0 rows
    if (userList.length === 0 && db) {
      try {
        const { data: profs, error: profErr } = await db
          .from('profiles')
          .select('id, full_name, mobile, email, registration_source, is_active, created_at, share_id, referred_by')
          .order('created_at', { ascending: false });

        if (!profErr && profs && profs.length > 0) {
          userList = profs.map(u => ({
            id: u.id,
            name: u.full_name || 'User',
            full_name: u.full_name || 'User',
            mobile: u.mobile || '-',
            email: u.email || '',
            share_id: u.share_id || 'AI000000',
            is_active: Boolean(u.is_active),
            is_subscriber: Boolean(u.is_active),
            source: u.registration_source || '-'
          }));
        }
      } catch (e) {
        console.warn('Direct profiles fetch notice:', e);
      }
    }

    // 2. Fetch Landing Pages & Surveys from Supabase
    if (db) {
      try {
        const [lpRes, surveyRes] = await Promise.all([
          db.from('landing_pages').select('*').order('created_at', { ascending: false }),
          db.from('surveys').select('*').order('created_at', { ascending: false })
        ]);

        if (lpRes && lpRes.data) lpList = lpRes.data;
        if (surveyRes && surveyRes.data) surveyList = surveyRes.data;
      } catch (err) {
        console.warn('Supabase LP/Surveys notice:', err);
      }
    }

    // 3. Scan LocalStorage for all created landing pages & surveys in UCAS
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES')) {
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || '[]');
            const arr = Array.isArray(parsed) ? parsed : [parsed];
            arr.forEach(p => {
              if (p && p.id && !lpList.some(existing => existing.id === p.id)) {
                lpList.push(p);
              }
            });
          } catch (e) {}
        }
        if (key && key.startsWith('UCAS_SURVEYS_')) {
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || '[]');
            const arr = Array.isArray(parsed) ? parsed : [parsed];
            arr.forEach(s => {
              if (s && s.id && !surveyList.some(existing => existing.id === s.id)) {
                surveyList.push(s);
              }
            });
          } catch (e) {}
        }
      }
    } catch (e) {}

    // 4. Fallback: Logged-in user or Seed Users if database is empty
    try {
      const activeUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('current_user') || 'null');
      if (activeUser && !userList.some(u => u.id === activeUser.id)) {
        userList.unshift({
          id: activeUser.id || 'my_profile_user',
          name: activeUser.name || activeUser.full_name || 'My Profile User',
          full_name: activeUser.name || activeUser.full_name || 'My Profile User',
          mobile: activeUser.mobile || '-',
          share_id: activeUser.share_id || activeUser.referral_code || 'AI100001',
          is_active: true,
          is_subscriber: true
        });
      }
    } catch (e) {}

    if (userList.length === 0) {
      userList.push(
        { id: 'usr_admin', name: 'Aarogyam Admin', full_name: 'Aarogyam Admin', mobile: '9876543210', share_id: 'ADMIN01', is_active: true, is_subscriber: true },
        { id: 'usr_001', name: 'Anita Sharma', full_name: 'Anita Sharma', mobile: '9876501123', share_id: 'AI100002', is_active: true, is_subscriber: true },
        { id: 'usr_002', name: 'Deepak Yadav', full_name: 'Deepak Yadav', mobile: '9988776655', share_id: 'AI100003', is_active: false, is_subscriber: false },
        { id: 'usr_003', name: 'Radha Singh', full_name: 'Radha Singh', mobile: '9123456780', share_id: 'AI100004', is_active: true, is_subscriber: true }
      );
    }

    allPages = lpList;
    allUsers = userList;
    allSurveys = surveyList;

    // Populate User Selector Dropdowns & Multi Lists
    populateUserDropdowns();
    renderMultiUserList();
    if (allUsersCountEl) allUsersCountEl.textContent = allUsers.length;

    // Calculate Stats
    const total = allPages.length;
    const pending = allPages.filter(p => p.status === 'pending_review').length;
    const active = allPages.filter(p => !p.status || p.status === 'active' || p.status === 'approved').length;
    const blocked = allPages.filter(p => p.status === 'blocked' || p.status === 'disabled').length;
    const webinars = allPages.filter(p => p.category === 'webinar' || Boolean(p.webinar_data)).length;

    document.getElementById('kpi-lp-total').textContent = total;
    document.getElementById('kpi-lp-pending').textContent = pending;
    document.getElementById('kpi-lp-active').textContent = active;
    document.getElementById('kpi-lp-blocked').textContent = blocked;
    document.getElementById('kpi-lp-webinars').textContent = webinars;

    currentPage = 1;
    renderTable();
  }

  function populateUserDropdowns() {
    // Top Filter Creator Dropdown
    if (creatorFilter) {
      creatorFilter.innerHTML = '<option value="all">👥 All Creators (सभी यूजर्स)</option>';
      allUsers.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.name || u.full_name || 'User'} (${u.share_id || u.mobile || '-'})`;
        creatorFilter.appendChild(opt);
      });
    }

    // Builder User Select Dropdown
    if (userSelect) {
      userSelect.innerHTML = '<option value="">-- यूजर चुनें (Select User: Name, Mobile, Share ID) --</option>';
      allUsers.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        const isAct = u.is_active || u.is_subscriber ? '🟢 Active' : '🔴 Inactive';
        opt.textContent = `${u.name || u.full_name || 'User'} (${u.mobile || '-'}) — Share ID: ${u.share_id || '-'} [${isAct}]`;
        userSelect.appendChild(opt);
      });
    }
  }

  // ==========================================
  // FILTERING & SEARCH LOGIC
  // ==========================================
  function getFilteredPages() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const creatorVal = creatorFilter.value;
    const typeCatVal = typeCatFilter.value;
    const statusVal = statusFilter.value;
    const dateVal = dateFilter.value;
    const now = new Date();

    return allPages.filter(p => {
      const pStatus = p.status || 'active';
      const isWb = p.category === 'webinar' || Boolean(p.webinar_data);

      // Creator Filter
      if (creatorVal !== 'all' && p.profile_id !== creatorVal) return false;

      // Status Filter
      if (statusVal !== 'all') {
        if (statusVal === 'active' && pStatus !== 'active' && pStatus !== 'approved') return false;
        if (statusVal === 'pending_review' && pStatus !== 'pending_review') return false;
        if (statusVal === 'blocked' && pStatus !== 'blocked' && pStatus !== 'disabled') return false;
      }

      // Type & Category Filter
      if (typeCatVal !== 'all') {
        if (typeCatVal === 'type_landing_page' && isWb) return false;
        if (typeCatVal === 'type_webinar' && !isWb) return false;
        if (!typeCatVal.startsWith('type_') && p.category !== typeCatVal) return false;
      }

      // Date Filter
      if (dateVal !== 'all' && p.created_at) {
        const pDate = new Date(p.created_at);
        if (dateVal === 'today') {
          if (pDate.toDateString() !== now.toDateString()) return false;
        } else if (dateVal === '7days') {
          if ((now - pDate) / (1000 * 60 * 60 * 24) > 7) return false;
        } else if (dateVal === '30days') {
          if ((now - pDate) / (1000 * 60 * 60 * 24) > 30) return false;
        }
      }

      // Search Query
      if (query) {
        const title = (p.title || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        const shareId = (p.share_id || '').toLowerCase();
        const user = allUsers.find(u => u.id === p.profile_id);
        const userName = (user?.name || user?.full_name || '').toLowerCase();
        const userMobile = (user?.mobile || '').toLowerCase();

        if (!title.includes(query) && !id.includes(query) && !shareId.includes(query) && !userName.includes(query) && !userMobile.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  // ==========================================
  // RENDER TABLE
  // ==========================================
  function renderTable() {
    const filtered = getFilteredPages();
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
                <th style="width: 44px; text-align: center;">
                  <input type="checkbox" disabled style="opacity:0.5;" />
                </th>
                <th style="width: 50px;">#</th>
                <th>Type & ID</th>
                <th>Title & Preview</th>
                <th>Creator (Attribution)</th>
                <th>Responses</th>
                <th>Review Status</th>
                <th style="text-align: right;">Actions (Edit / Approve / Block)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="8" style="text-align:center;padding:2.5rem;color:var(--admin-muted);">
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">📣</div>
                  <div style="font-size:1rem;font-weight:700;color:var(--admin-text);margin-bottom:4px;">कोई लैंडिंग पेज या वेबिनार नहीं मिला</div>
                  <span style="font-size: 0.85rem; color: var(--admin-muted);">ऊपर '+ नया पेज / वेबिनार बनाएं' बटन पर क्लिक करके किसी भी यूजर के लिए पेज बनाएं।</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      updateBulkActionBar();
      return;
    }

    tableContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:var(--admin-muted);margin-bottom:8px;">
        <span>दिखा रहे हैं <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${total}</strong> पेजेस</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 44px; text-align: center;">
                <input type="checkbox" id="th-select-all-pages" title="वर्तमान पेज के सभी चुनें" style="width: 17px; height: 17px; accent-color: #3b82f6; cursor: pointer;" />
              </th>
              <th style="width: 45px;">#</th>
              <th>Type & ID</th>
              <th>Title & Thumbnail</th>
              <th>Creator (Attribution)</th>
              <th>Responses</th>
              <th>Review Status</th>
              <th style="text-align: right;">Actions (Edit / Approve / Block)</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((p, idx) => {
              const rowNum = startIndex + idx + 1;
              const isChecked = selectedLandingPageIds.has(p.id);
              const isWb = p.category === 'webinar' || Boolean(p.webinar_data);
              const pStatus = p.status || 'active';
              const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('hi-IN') : '-';
              
              const creator = allUsers.find(u => u.id === p.profile_id);
              const creatorName = creator ? (creator.name || creator.full_name) : (p.owner_name || 'Aarogyam User');
              const creatorShareId = p.share_id || creator?.share_id || 'ADMIN';
              const isCreatorActive = creator ? (creator.is_active || creator.is_subscriber) : true;

              // Ensure thumbnail URL & YouTube ID exist
              let thumbUrl = p.thumbnail_url;
              let ytId = null;
              if (p.content_type === 'youtube') {
                ytId = extractYoutubeVideoId(p.media_url);
                if (ytId) thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
              } else if (p.media_url && !p.media_url.startsWith('data:')) {
                thumbUrl = p.media_url;
              }

              let publicUrl = `/ucas/landing.html?id=${encodeURIComponent(p.id)}&share_id=${encodeURIComponent(creatorShareId)}`;
              if (p.title) publicUrl += `&title=${encodeURIComponent(p.title)}`;
              if (ytId) publicUrl += `&yt=${encodeURIComponent(ytId)}`;
              if (thumbUrl && !thumbUrl.startsWith('data:')) publicUrl += `&thumb=${encodeURIComponent(thumbUrl)}`;

              // Responses Count
              const responses = allSurveys.filter(s => s.category_answers?.landing_page_id === p.id);
              const responsesCount = responses.length;

              // Type Badge
              const typeBadge = isWb
                ? '<span style="background:rgba(139,92,246,0.15);color:#8b5cf6;font-size:0.72rem;padding:2px 6px;border-radius:4px;font-weight:700;"><i class="fa-solid fa-video"></i> Webinar</span>'
                : '<span style="background:rgba(16,185,129,0.15);color:#10b981;font-size:0.72rem;padding:2px 6px;border-radius:4px;font-weight:700;"><i class="fa-regular fa-file-lines"></i> Landing Page</span>';

              // Status Badge
              let statusBadge = '<span style="background:rgba(16,185,129,0.15);color:#10b981;font-size:0.75rem;padding:3px 8px;border-radius:4px;font-weight:700;">🟢 Active / Live</span>';
              if (pStatus === 'pending_review') {
                statusBadge = '<span style="background:rgba(245,158,11,0.15);color:#f59e0b;font-size:0.75rem;padding:3px 8px;border-radius:4px;font-weight:700;">⏳ Under Review</span>';
              } else if (pStatus === 'blocked' || pStatus === 'disabled') {
                statusBadge = '<span style="background:rgba(239,68,68,0.15);color:#ef4444;font-size:0.75rem;padding:3px 8px;border-radius:4px;font-weight:700;">🔴 Blocked</span>';
              }

              return `
                <tr style="${isChecked ? 'background: rgba(59,130,246,0.08);' : ''}">
                  <td style="text-align: center;">
                    <input type="checkbox" class="lp-row-checkbox" data-page-id="${p.id}" ${isChecked ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #3b82f6; cursor: pointer;" />
                  </td>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div>${typeBadge}</div>
                    <div style="font-size: 0.78rem; font-weight: 700; color: var(--admin-text); margin-top: 3px;">
                      <code>${p.id}</code>
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      ${thumbUrl ? `<img src="${thumbUrl}" alt="Thumb" style="width: 44px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid var(--admin-border);" />` : ''}
                      <div>
                        <div style="font-weight: 700; color: var(--admin-text); font-size: 0.88rem;">${p.title || 'Untitled'}</div>
                        <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 2px;">
                          Cat: <strong>${p.category || '-'}</strong> • <span>${dateStr}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--admin-text); font-size: 0.85rem;">${creatorName}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-muted);">
                      Share ID: <code style="color:var(--admin-primary); font-weight:700;">${creatorShareId}</code>
                    </div>
                    <div style="margin-top:2px;">
                      ${isCreatorActive ? '<span style="color:#10b981;font-size:0.7rem;font-weight:700;">🟢 Active User</span>' : '<span style="color:#ef4444;font-size:0.7rem;font-weight:700;">🔴 Inactive User</span>'}
                    </div>
                  </td>
                  <td>
                    <button type="button" class="btn-view-responses admin-button small-button" data-page-id="${p.id}" style="background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); font-weight: 800; font-size: 0.8rem; padding: 3px 8px; border-radius: 12px;">
                      👥 ${responsesCount} Leads
                    </button>
                  </td>
                  <td>
                    ${statusBadge}
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 5px; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
                      <!-- Edit Button -->
                      <button type="button" class="btn-edit-page admin-button small-button" data-page-id="${p.id}" style="background:#3b82f6;color:#fff;font-weight:700;font-size:0.75rem;padding:4px 8px;" title="संपादित करें (Edit in Admin Builder)">
                        ✏️ Edit
                      </button>

                      <!-- Approve / Block Toggles -->
                      ${pStatus === 'pending_review' ? `
                        <button type="button" class="btn-approve-page admin-button small-button" data-page-id="${p.id}" style="background:#10b981;color:#fff;font-weight:700;font-size:0.75rem;padding:4px 8px;" title="Approve Campaign">
                          ✓ Approve
                        </button>
                        <button type="button" class="btn-block-page admin-button small-button" data-page-id="${p.id}" style="background:#ef4444;color:#fff;font-weight:700;font-size:0.75rem;padding:4px 8px;" title="Reject / Block">
                          ✕ Reject
                        </button>
                      ` : pStatus === 'blocked' || pStatus === 'disabled' ? `
                        <button type="button" class="btn-approve-page admin-button small-button" data-page-id="${p.id}" style="background:#10b981;color:#fff;font-weight:700;font-size:0.75rem;padding:4px 8px;" title="Unblock / Activate">
                          🟢 Unblock
                        </button>
                      ` : `
                        <button type="button" class="btn-block-page admin-button small-button" data-page-id="${p.id}" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);font-weight:700;font-size:0.75rem;padding:4px 8px;" title="Block / Deactivate URL">
                          🔴 Block
                        </button>
                      `}

                      <!-- Public View Link -->
                      <a href="${publicUrl}" target="_blank" class="admin-button small-button icon-button" title="Open Public Landing Page" style="background: var(--admin-surface); color: var(--admin-text); border: 1px solid var(--admin-border); padding: 4px 8px;">
                        👁️
                      </a>

                      <!-- Delete Button -->
                      <button type="button" class="btn-delete-page admin-button small-button icon-button" data-page-id="${p.id}" title="Delete Page" style="background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 4px 8px;">
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
          Total Records: <strong style="color: var(--admin-text);">${total}</strong>
        </div>

        <div class="admin-pagination-controls">
          <button type="button" id="lp-prev-page" class="admin-button small-button" ${currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ◀ Previous
          </button>
          <span style="font-weight:700;font-size:0.85rem;padding:0 6px;">Page ${currentPage} of ${totalPages} (20 Items/Page)</span>
          <button type="button" id="lp-next-page" class="admin-button small-button" ${currentPage >= totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            Next ▶
          </button>
        </div>
      </div>
    `;

    updateBulkActionBar();

    // Checkbox Listeners
    const thSelectAll = document.getElementById('th-select-all-pages');
    thSelectAll?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      pageItems.forEach(p => {
        if (isChecked) selectedLandingPageIds.add(p.id);
        else selectedLandingPageIds.delete(p.id);
      });
      renderTable();
    });

    tableContainer.querySelectorAll('.lp-row-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.dataset.pageId;
        if (e.target.checked) selectedLandingPageIds.add(id);
        else selectedLandingPageIds.delete(id);
        updateBulkActionBar();
      });
    });

    // Pagination Listeners
    document.getElementById('lp-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.getElementById('lp-next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });

    // Action Listeners
    tableContainer.querySelectorAll('.btn-approve-page').forEach(btn => {
      btn.addEventListener('click', () => updatePageStatus(btn.dataset.pageId, 'active'));
    });

    tableContainer.querySelectorAll('.btn-block-page').forEach(btn => {
      btn.addEventListener('click', () => updatePageStatus(btn.dataset.pageId, 'blocked'));
    });

    tableContainer.querySelectorAll('.btn-edit-page').forEach(btn => {
      btn.addEventListener('click', () => startEditPage(btn.dataset.pageId));
    });

    tableContainer.querySelectorAll('.btn-delete-page').forEach(btn => {
      btn.addEventListener('click', () => deletePage(btn.dataset.pageId));
    });

    tableContainer.querySelectorAll('.btn-view-responses').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = allPages.find(p => p.id === btn.dataset.pageId);
        if (page) openResponsesDrawer(page);
      });
    });
  }

  // ==========================================
  // BULK ACTIONS TOOLBAR CONTROLS & HANDLERS
  // ==========================================
  function updateBulkActionBar() {
    const bar = document.getElementById('lp-bulk-actions-bar');
    const countEl = document.getElementById('lp-bulk-selected-count');
    const thSelectAll = document.getElementById('th-select-all-pages');
    
    if (countEl) {
      countEl.textContent = `${selectedLandingPageIds.size} पेजेस चुने गए`;
    }
    if (bar) {
      bar.style.display = selectedLandingPageIds.size > 0 ? 'flex' : 'none';
    }
    if (thSelectAll) {
      const filtered = getFilteredPages();
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);
      const allVisibleChecked = pageItems.length > 0 && pageItems.every(p => selectedLandingPageIds.has(p.id));
      thSelectAll.checked = allVisibleChecked;
    }
  }

  // Bulk Toolbar Buttons
  document.getElementById('btn-bulk-select-all-filtered')?.addEventListener('click', () => {
    const filtered = getFilteredPages();
    filtered.forEach(p => selectedLandingPageIds.add(p.id));
    renderTable();
  });

  document.getElementById('btn-bulk-deselect-all')?.addEventListener('click', () => {
    selectedLandingPageIds.clear();
    renderTable();
  });

  document.getElementById('btn-bulk-activate')?.addEventListener('click', () => {
    handleBulkStatusChange('active');
  });

  document.getElementById('btn-bulk-block')?.addEventListener('click', () => {
    handleBulkStatusChange('blocked');
  });

  document.getElementById('btn-bulk-delete')?.addEventListener('click', () => {
    handleBulkDelete();
  });

  async function handleBulkStatusChange(newStatus) {
    if (selectedLandingPageIds.size === 0) return;
    const selectedIds = Array.from(selectedLandingPageIds);
    const actionLabel = newStatus === 'active' ? '🟢 सक्रिय (Activate/Approve)' : '🔴 ब्लॉक (Block/Reject)';

    if (!confirm(`क्या आप सचमुच चुने गए सभी ${selectedIds.length} पेजेस को ${actionLabel} करना चाहते हैं?`)) {
      return;
    }

    const db = getAdminDb();
    if (db) {
      try {
        await db
          .from('landing_pages')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .in('id', selectedIds);
      } catch (err) {
        console.warn('Supabase bulk status update error:', err);
      }
    }

    // Sync LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES')) {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          list.forEach(p => {
            if (selectedLandingPageIds.has(p.id)) p.status = newStatus;
          });
          localStorage.setItem(key, JSON.stringify(list));
        }
      }
    } catch (e) {}

    // Update in-memory
    allPages.forEach(p => {
      if (selectedLandingPageIds.has(p.id)) p.status = newStatus;
    });

    alert(`🎉 चुने गए ${selectedIds.length} पेजेस सफलतापूर्वक ${actionLabel} कर दिए गए!`);
    selectedLandingPageIds.clear();
    updateKPIs();
    renderTable();
  }

  async function handleBulkDelete() {
    if (selectedLandingPageIds.size === 0) return;
    const selectedIds = Array.from(selectedLandingPageIds);

    if (!confirm(`⚠️ चेतावनी: क्या आप वाकई चुने गए ${selectedIds.length} पेजेस को हमेशा के लिए हटाना (Delete) चाहते हैं?\n\nयह डेटाबेस और सभी यूजर्स के पोर्टल से हमेशा के लिए हट जाएगा।`)) {
      return;
    }

    const db = getAdminDb();
    if (db) {
      try {
        await db
          .from('landing_pages')
          .delete()
          .in('id', selectedIds);
      } catch (err) {
        console.warn('Supabase bulk delete error:', err);
      }
    }

    // Sync LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES')) {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = list.filter(p => !selectedLandingPageIds.has(p.id));
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      }
    } catch (e) {}

    // Update in-memory
    allPages = allPages.filter(p => !selectedLandingPageIds.has(p.id));

    alert(`🗑️ कुल ${selectedIds.length} पेजेस सफलतापूर्वक हटा दिए गए!`);
    selectedLandingPageIds.clear();
    updateKPIs();
    renderTable();
  }

  function updateKPIs() {
    const total = allPages.length;
    const pending = allPages.filter(p => p.status === 'pending_review').length;
    const active = allPages.filter(p => !p.status || p.status === 'active' || p.status === 'approved').length;
    const blocked = allPages.filter(p => p.status === 'blocked' || p.status === 'disabled').length;
    const webinars = allPages.filter(p => p.category === 'webinar' || Boolean(p.webinar_data)).length;

    const elTotal = document.getElementById('kpi-lp-total');
    const elPending = document.getElementById('kpi-lp-pending');
    const elActive = document.getElementById('kpi-lp-active');
    const elBlocked = document.getElementById('kpi-lp-blocked');
    const elWebinars = document.getElementById('kpi-lp-webinars');

    if (elTotal) elTotal.textContent = total;
    if (elPending) elPending.textContent = pending;
    if (elActive) elActive.textContent = active;
    if (elBlocked) elBlocked.textContent = blocked;
    if (elWebinars) elWebinars.textContent = webinars;
  }

  // ==========================================
  // STATUS TOGGLE & DELETE (Supabase + LocalStorage)
  // ==========================================
  async function updatePageStatus(pageId, newStatus) {
    const actionLabel = newStatus === 'active' ? 'स्वीकृत / सक्रिय (Approve)' : 'ब्लॉक / अस्वीकृत (Block/Reject)';
    if (!confirm(`क्या आप वाकई पेज "${pageId}" को ${actionLabel} करना चाहते हैं?`)) return;

    const db = getAdminDb();
    if (db) {
      try {
        await db
          .from('landing_pages')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', pageId);
      } catch (e) {
        console.warn('DB update status warning:', e);
      }
    }

    // Sync LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES')) {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = list.findIndex(p => p.id === pageId);
          if (idx !== -1) {
            list[idx].status = newStatus;
            localStorage.setItem(key, JSON.stringify(list));
          }
        }
      }
    } catch (e) {}

    alert(`✅ पेज ${pageId} सफलतापूर्वक ${actionLabel} हो गया!`);
    const target = allPages.find(p => p.id === pageId);
    if (target) target.status = newStatus;

    updateKPIs();
    renderTable();
  }

  async function deletePage(pageId) {
    const p = allPages.find(x => x.id === pageId);
    if (!confirm(`क्या आप वाकई पेज "${p?.title || pageId}" को हमेशा के लिए हटाना चाहते हैं?`)) return;

    const db = getAdminDb();
    if (db) {
      try {
        await db
          .from('landing_pages')
          .delete()
          .eq('id', pageId);
      } catch (e) {
        console.warn('DB delete warning:', e);
      }
    }

    // Delete from LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES')) {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = list.filter(item => item.id !== pageId);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      }
    } catch (e) {}

    alert(`🗑️ पेज ${pageId} सफलतापूर्वक हटा दिया गया!`);
    allPages = allPages.filter(x => x.id !== pageId);
    selectedLandingPageIds.delete(pageId);
    updateKPIs();
  }

  // ==========================================
  // EDIT PAGE IN ADMIN BUILDER
  // ==========================================
  function startEditPage(pageId) {
    const page = allPages.find(p => p.id === pageId);
    if (!page) return;

    editingPageId = page.id;
    builderCard.style.display = 'block';
    builderTitle.textContent = `✏️ पेज संपादित करें: ${page.title || page.id}`;
    saveBtn.innerHTML = '💾 Update Landing Page (अपडेट करें)';
    cancelEditBtn.style.display = 'inline-flex';

    // Set to single user mode for editing
    setUserTargetMode('single');

    // Populate Fields
    titleInput.value = page.title || '';
    messageInput.value = page.message || '';
    categorySelect.value = page.category || 'agriculture';
    statusSelect.value = page.status || 'active';

    if (userSelect && page.profile_id) {
      userSelect.value = page.profile_id;
      userSelect.dispatchEvent(new Event('change'));
    }

    const isWb = page.category === 'webinar' || Boolean(page.webinar_data);
    const typeRadio = form.querySelector(`input[name="adm_campaign_type"][value="${isWb ? 'webinar' : 'landing_page'}"]`);
    if (typeRadio) typeRadio.checked = true;
    webinarFieldsWrap.style.display = isWb ? 'block' : 'none';

    if (isWb) {
      const wData = page.webinar_data || {};
      wbDatetime.value = wData.datetime || '';
      wbZoomLink.value = wData.zoom_link || '';
      wbMeetingId.value = wData.meeting_id || '';
      wbPasscode.value = wData.passcode || '';
      wbSuccessMsg.value = wData.success_msg || '';
    }

    // Media
    if (page.content_type === 'youtube') {
      btnMediaYt.click();
      ytUrlInput.value = page.media_url || '';
      ytUrlInput.dispatchEvent(new Event('input'));
    } else {
      btnMediaImg.click();
      uploadedImageData = page.media_url || page.thumbnail_url;
      if (uploadedImageData && imgPreview) {
        imgPreview.src = uploadedImageData;
        imgPreviewWrap.style.display = 'block';
      }
    }

    builderCard.scrollIntoView({ behavior: 'smooth' });
  }

  function resetAdminBuilder() {
    editingPageId = null;
    builderTitle.textContent = 'नया लैंडिंग पेज या वेबिनार बनाएं (Admin Creator)';
    saveBtn.innerHTML = '✨ Generate & Save Page';
    cancelEditBtn.style.display = 'none';
    resultCard.style.display = 'none';

    titleInput.value = '';
    messageInput.value = '';
    categorySelect.value = 'agriculture';
    statusSelect.value = 'active';
    if (userSelect) userSelect.value = '';
    if (userInfoBadge) userInfoBadge.style.display = 'none';

    wbDatetime.value = '';
    wbZoomLink.value = '';
    wbMeetingId.value = '';
    wbPasscode.value = '';
    wbSuccessMsg.value = '';
    webinarFieldsWrap.style.display = 'none';

    const defaultType = form.querySelector('input[name="adm_campaign_type"][value="landing_page"]');
    if (defaultType) defaultType.checked = true;

    btnMediaImg.click();
    uploadedImageData = null;
    detectedYoutubeId = null;
    detectedYoutubeThumbnail = null;
    if (imgFileInput) imgFileInput.value = '';
    if (ytUrlInput) ytUrlInput.value = '';
    if (imgPreviewWrap) imgPreviewWrap.style.display = 'none';
    if (ytPreviewWrap) ytPreviewWrap.style.display = 'none';
  }

  // ==========================================
  // SAVE / CREATE PAGE FORM HANDLER (Single, Multi & All Users)
  // ==========================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const message = messageInput.value.trim();
    const category = categorySelect.value;
    const status = statusSelect.value;

    if (!title) {
      alert('कृपया मुख्य शीर्षक (Title) दर्ज करें।');
      titleInput.focus();
      return;
    }

    if (!message) {
      alert('कृपया विवरण/संदेश (Message) दर्ज करें।');
      messageInput.focus();
      return;
    }

    // Determine target users based on targetUserMode
    let targetUsers = [];
    if (editingPageId) {
      // Editing is single page update
      const selId = userSelect.value;
      const selUser = allUsers.find(u => u.id === selId);
      if (!selUser) {
        alert('कृपया यूजर अवश्य चुनें।');
        return;
      }
      targetUsers = [selUser];
    } else {
      if (targetUserMode === 'single') {
        const selId = userSelect.value;
        const selUser = allUsers.find(u => u.id === selId);
        if (!selUser) {
          alert('कृपया ड्रॉपडाउन से यूजर चुनें।');
          userSelect.focus();
          return;
        }
        targetUsers = [selUser];
      } else if (targetUserMode === 'multi') {
        if (multiSelectedUserIds.size === 0) {
          alert('कृपया चेकबॉक्स से कम से कम एक यूजर अवश्य चुनें।');
          return;
        }
        targetUsers = allUsers.filter(u => multiSelectedUserIds.has(u.id));
      } else if (targetUserMode === 'all') {
        if (allUsers.length === 0) {
          alert('सिस्टम में कोई यूजर उपलब्ध नहीं है।');
          return;
        }
        targetUsers = [...allUsers];
      }
    }

    const campType = form.querySelector('input[name="adm_campaign_type"]:checked')?.value || 'landing_page';
    const isWb = campType === 'webinar' || category === 'webinar';

    let webinarData = null;
    if (isWb) {
      webinarData = {
        datetime: wbDatetime.value.trim(),
        zoom_link: wbZoomLink.value.trim(),
        meeting_id: wbMeetingId.value.trim(),
        passcode: wbPasscode.value.trim(),
        success_msg: wbSuccessMsg.value.trim()
      };
    }

    // Determine Media & Thumbnail
    let mediaUrl = '';
    let thumbUrl = '';

    if (activeContentType === 'youtube') {
      const rawYt = ytUrlInput.value.trim();
      const vidId = extractYoutubeVideoId(rawYt) || detectedYoutubeId;
      if (!vidId) {
        alert('कृपया मान्य YouTube वीडियो लिंक दर्ज करें।');
        ytUrlInput.focus();
        return;
      }
      mediaUrl = `https://www.youtube.com/watch?v=${vidId}`;
      thumbUrl = `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
    } else {
      mediaUrl = uploadedImageData || '';
      thumbUrl = uploadedImageData || '';
    }

    const db = getAdminDb();
    saveBtn.disabled = true;
    saveBtn.innerHTML = `⏳ ${targetUsers.length} यूजर्स के लिए सेव हो रहा है...`;

    try {
      if (editingPageId) {
        // SINGLE UPDATE
        const targetUser = targetUsers[0];
        const lpId = editingPageId;
        const updatePayload = {
          title: title,
          category: category,
          profile_id: targetUser.id,
          share_id: targetUser.share_id || 'ADMIN',
          content_type: activeContentType,
          media_url: mediaUrl,
          thumbnail_url: thumbUrl,
          message: message,
          webinar_data: webinarData,
          status: status
        };

        if (db) {
          try {
            await db
              .from('landing_pages')
              .update(updatePayload)
              .eq('id', lpId);
          } catch (err) {
            console.warn('DB update notice:', err);
          }
        }

        // LocalStorage Sync
        try {
          const localKey = `UCAS_LP_${targetUser.id}`;
          const list = JSON.parse(localStorage.getItem(localKey) || '[]');
          const idx = list.findIndex(x => x.id === lpId);
          if (idx >= 0) list[idx] = { ...list[idx], ...updatePayload, id: lpId };
          else list.unshift({ ...updatePayload, id: lpId });
          localStorage.setItem(localKey, JSON.stringify(list));
        } catch (e) {}

        alert(`✅ पेज ${lpId} सफलतापूर्वक अपडेट हो गया!`);
        showAdminResult({ ...updatePayload, id: lpId }, 1);
        await loadData();
      } else {
        // BATCH / MULTI / ALL / SINGLE INSERT
        const batchPayloads = [];
        const prefix = isWb ? 'WB' : 'LP';
        const nowIso = new Date().toISOString();

        targetUsers.forEach(u => {
          const randomNum = Math.floor(100000 + Math.random() * 900000);
          const lpId = `${prefix}${randomNum}`;
          const p = {
            id: lpId,
            profile_id: u.id,
            share_id: u.share_id || 'AI000000',
            title: title,
            category: category,
            content_type: activeContentType,
            media_url: mediaUrl,
            thumbnail_url: thumbUrl,
            message: message,
            webinar_data: webinarData,
            status: status,
            created_at: nowIso
          };
          batchPayloads.push(p);

          // Sync each user's LocalStorage store
          try {
            const localKey = `UCAS_LP_${u.id}`;
            const list = JSON.parse(localStorage.getItem(localKey) || '[]');
            list.unshift(p);
            localStorage.setItem(localKey, JSON.stringify(list));
          } catch (e) {}
        });

        // Sync Global Store
        try {
          const gList = JSON.parse(localStorage.getItem('UCAS_LP_global') || '[]');
          batchPayloads.forEach(p => gList.unshift(p));
          localStorage.setItem('UCAS_LP_global', JSON.stringify(gList));
        } catch (e) {}

        // Database Batch Insert
        if (db) {
          try {
            await db
              .from('landing_pages')
              .insert(batchPayloads);
          } catch (err) {
            console.warn('DB batch insert notice:', err);
          }
        }

        if (batchPayloads.length === 1) {
          alert(`🎉 नया पेज (${batchPayloads[0].id}) सफलतापूर्वक यूजर "${targetUsers[0].name || targetUsers[0].full_name}" के लिए बन गया!`);
          showAdminResult(batchPayloads[0], 1);
        } else {
          alert(`🎉 कुल ${batchPayloads.length} यूजर्स के लिए लैंडिंग पेज / वेबिनार सफलतापूर्वक बन गया!\n\nसभी यूजर्स के My Profile UCAS में उनके रेफरल लिंक के साथ दिखना शुरू हो गया है।`);
          showAdminResult(batchPayloads[0], batchPayloads.length);
        }

        await loadData();
      }
    } catch (err) {
      console.error('Save page error', err);
      alert('सेव करने में समस्या आई।');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = editingPageId ? '💾 Update Landing Page' : '✨ Generate & Save Page';
    }
  });

  function showAdminResult(page, count = 1) {
    const origin = window.location.origin || 'https://aarogyamindia.in';
    let thumbParam = '';
    if (page.thumbnail_url && !page.thumbnail_url.startsWith('data:')) {
      thumbParam = `&thumb=${encodeURIComponent(page.thumbnail_url)}`;
    }

    const publicUrl = `${origin}/ucas/landing.html?id=${page.id}&share_id=${page.share_id || ''}${thumbParam}`;
    resultUrlInput.value = publicUrl;

    if (count > 1) {
      resultHeaderMsg.innerHTML = `🎉 कुल <strong>${count} यूजर्स</strong> के लिए पेज सफलतापूर्वक तैयार हो गया! (नीचे पहले यूजर का लिंक दिया गया है):`;
    } else {
      resultHeaderMsg.innerHTML = `🎉 पेज सफलतापूर्वक तैयार हो गया!`;
    }

    document.getElementById('adm_btn_copy_url').onclick = () => {
      navigator.clipboard.writeText(publicUrl).then(() => alert('✅ लिंक कॉपी हो गया!'));
    };

    document.getElementById('adm_btn_wa_share').onclick = () => {
      const text = `${page.title}\n\n${page.message}\n\n👉 यहाँ देखें और रजिस्टर करें:\n${publicUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    document.getElementById('adm_btn_fb_share').onclick = () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`, '_blank');
    };

    document.getElementById('adm_btn_open_public').onclick = () => {
      window.open(publicUrl, '_blank');
    };

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
  }

  // ==========================================
  // RESPONSES DRAWER
  // ==========================================
  function openResponsesDrawer(page) {
    if (!drawerOverlay || !drawerTitle || !drawerBody) return;

    const responses = allSurveys.filter(s => s.category_answers?.landing_page_id === page.id);
    drawerTitle.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📋</span>
        <span>${page.title || page.id} — Leads (${responses.length})</span>
      </div>
    `;

    drawerBody.innerHTML = `
      <div style="background: var(--admin-surface-2, #0f172a); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
        <div style="font-weight: 700; color: var(--admin-text);">${page.title}</div>
        <div style="font-size: 0.8rem; color: var(--admin-muted); margin-top: 2px;">
          ID: <code>${page.id}</code> • Category: <strong>${page.category}</strong> • Status: <strong>${page.status || 'active'}</strong>
        </div>
      </div>

      ${responses.length === 0 ? `
        <div class="admin-empty">
          अभी तक इस पेज पर कोई सर्वे या लीड प्राप्त नहीं हुई है।
        </div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Lead / Attendee</th>
                <th>Mobile</th>
                <th>Place</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${responses.map((r, i) => {
                const sMob = String(r.mobile || '').replace(/\D/g, '');
                const regDate = r.created_at ? new Date(r.created_at).toLocaleString('hi-IN') : '-';
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td>
                      <div style="font-weight: 700; color: var(--admin-text);">${r.name}</div>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <a href="tel:${sMob}" class="admin-subtle-link" style="font-weight: 600; font-size: 0.82rem;">📞 ${r.mobile || '-'}</a>
                        ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="admin-button small-button icon-button" style="background:#25D366;color:#fff;padding:2px 6px;font-size:0.75rem;" title="WhatsApp Chat">💬</a>` : ''}
                      </div>
                    </td>
                    <td style="font-size: 0.8rem; color: var(--admin-text);">${r.village || '-'}</td>
                    <td style="font-size: 0.78rem; color: var(--admin-muted);">${regDate}</td>
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

  // Filter Listeners
  searchInput?.addEventListener('input', () => { currentPage = 1; renderTable(); });
  creatorFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  typeCatFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  statusFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  dateFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  refreshBtn?.addEventListener('click', loadData);

  await loadData();
}
