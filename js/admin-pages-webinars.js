/* ==========================================================================
   AAROGYAM INDIA — UNIVERSAL WEBINAR & AAROGYAMTUBE ADMIN HUB (V31.0 PRO)
   Features:
   - 1-Form Master Zoom Webinar & Live Countdown Manager
   - Live 3D Cover Image Preview & OG Social Card Live Preview
   - Drag & Drop Section Placement System (Up/Down Controls)
   - AarogyamTube Dual-Format (16:9 + 9:16 Both), Shorts & Masterclass Manager
   - Real-time Multi-Filter & Search Engine (Title, Format, Category, Playlist)
   - Slide-out Side Drawer (Desktop) & Bottom Sheet (Mobile) with Fixed Sticky Header/Footer
   - YouTube Channel Preset Manager (@AAROGYAMINDIA, etc.) & Direct Subscribe Integration
   - Playlist Creator & Sequence Manager with 1-Click Full Playlist Sharing
   - Dynamic Category Auto-Save to Master Categories
   - 1-Click JSON Sync & Export for webinar-master.json & webinar-recordings.json
   - Zero-Egress Cloud & LocalStorage Persistence
   ========================================================================== */

import { initAdminLayout, showToast } from './admin-main.js';

export async function initWebinars() {
  initAdminLayout('Universal Webinar & AarogyamTube Hub', 'लाइव ज़ूम वेबिनार, AarogyamTube रील्स एवं वीडियो, सोशल शेयर प्रीव्यू और 1-क्लिक JSON सिंक प्रबंधित करें।');

  const content = document.getElementById('page-content');
  if (!content) return;

  let masterWebinar = {
    id: 'WB_MASTER',
    title: 'प्राकृतिक एवं जैविक खेती से 3x मुनाफा लाइव वेबिनार 2026',
    description: 'इस विशेष लाइव ज़ूम वेबिनार में भाग लेने के लिए अपना नाम और मोबाइल नंबर दर्ज करें।',
    date: '',
    time: '',
    duration_minutes: 90,
    price: 0,
    zoom_link: '',
    meeting_id: '',
    passcode: '',
    cover_image: '/images/banners/agriculture-hero-banner-1.webp',
    banners: ['/images/banners/agriculture-hero-banner-1.webp', '/images/banners/agriculture-hero-banner-2.webp'],
    youtube_videos: [],
    kpis: [
      '🔴 100% लाइव इंटरएक्टिव ज़ूम क्लास',
      '🌱 जैविक खाद एवं स्प्रे फॉर्मूला',
      '🎁 फ्री ई-बुक एवं स्टडी नोट्स',
      '💬 लाइव सवाल-जवाब एवं समाधान'
    ],
    faqs: [
      { q: 'ज़ूम मीटिंग लिंक और पासवर्ड कब खुलेगा?', a: 'वेबिनार समय से ठीक 2 मिनट पहले Join Zoom Meeting बटन सक्रिय हो जाएगा।' },
      { q: 'क्या यह वेबिनार फ्री है?', a: 'हाँ, यह वेबिनार पूरी तरह निःशुल्क है।' }
    ],
    section_order: [
      'sec_hero_zoom',
      'sec_timer',
      'sec_kpis',
      'sec_aarogyamtube_shorts',
      'sec_aarogyamtube_videos',
      'sec_tutorial',
      'sec_faqs'
    ],
    og_title: '🔴 Aarogyam India — लाइव ज़ूम वेबिनार एवं AarogyamTube',
    og_description: 'लाइव ज़ूम ट्रेनिंग में भाग लें और 1-मिनट के कृषि शॉर्ट्स देखें।',
    og_image: '/images/banners/universal-zoom-webinar-og.jpg'
  };

  let allRecordings = [];
  let allChannels = [
    {
      id: 'CH_AAROGYAM_MAIN',
      name: 'Aarogyam India Official',
      handle: '@AAROGYAMINDIA',
      url: 'https://www.youtube.com/@AAROGYAMINDIA',
      subscribe_url: 'https://www.youtube.com/@AAROGYAMINDIA?sub_confirmation=1',
      avatar: '/images/logo/logo.png',
      is_default: true
    }
  ];
  let masterCategories = [
    'Crop Protection',
    'Organic Farming',
    'Irrigation Tech',
    'Dairy & Animal Husbandry',
    'Biofit Products Training',
    'Shorts & Reels'
  ];
  let allPlaylists = [
    {
      id: 'PL_ORGANIC_2026',
      title: '🌾 संपूर्ण जैविक खेती व पशु पोषण मास्टरक्लास',
      description: 'प्राकृतिक एवं जैविक खेती से 3X मुनाफा, दुग्ध उत्पादन और Biofit ट्रेनिंग की संपूर्ण वीडियो श्रृंखला।',
      cover: 'https://img.youtube.com/vi/2JYn-bcDLuU/hqdefault.jpg',
      video_ids: ['VID_712495', 'VID_513998', 'VID_378682', 'VID_M10001']
    }
  ];

  let editingRecordingId = null;

  // Real-time Filters state
  let searchFilterQuery = '';
  let formatFilterVal = 'all';
  let categoryFilterVal = 'all';
  let playlistFilterVal = 'all';

  const defaultSections = [
    { key: 'sec_hero_zoom', name: '🎥 1. Hero Zoom Meeting Box', desc: 'शीर्षक, 3D कवर, ज़ूम जॉइन बटन व रजिस्ट्रेशन' },
    { key: 'sec_timer', name: '⏳ 2. Live Countdown Timer', desc: 'लाइव वेबिनार काउंटडाउन बार' },
    { key: 'sec_kpis', name: '⚡ 3. KPI Feature Highlights', desc: 'वेबिनार के 4 मुख्य बिंदु व लाभ' },
    { key: 'sec_aarogyamtube_shorts', name: '📱 4. AarogyamTube Shorts & Reels', desc: '9:16 वर्टिकल रील्स फीड (YouTube, Insta, FB)' },
    { key: 'sec_aarogyamtube_videos', name: '📚 5. AarogyamTube Masterclasses', desc: '16:9 रिकॉर्डेड वीडियो गैलरी' },
    { key: 'sec_tutorial', name: '📖 6. Zoom Step-by-Step Tutorial', desc: 'ज़ूम से कैसे जुड़ें 4-स्टेप्स गाइड' },
    { key: 'sec_faqs', name: '❓ 7. FAQs Accordion', desc: 'अक्सर पूछे जाने वाले प्रश्न' }
  ];

  content.innerHTML = `
    <style>
      .adm-section-drag-item {
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
      }
      .adm-section-drag-item:hover {
        border-color: #60a5fa !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(37, 99, 235, 0.25);
      }
      .adm-section-drag-item.adm-dragging {
        opacity: 0.45 !important;
        border: 2px dashed #3b82f6 !important;
        background: #1e293b !important;
        transform: scale(0.98);
      }
      .adm-section-drag-item.adm-drag-over {
        border-top: 3.5px solid #38bdf8 !important;
        background: rgba(56, 189, 248, 0.18) !important;
        transform: translateY(3px);
      }
      .adm-rec-drag-row {
        transition: all 0.2s ease;
      }
      .adm-rec-drag-row:hover {
        background: rgba(255, 255, 255, 0.05) !important;
      }
      .adm-rec-drag-row.adm-rec-row-dragging {
        opacity: 0.45 !important;
        background: #1e293b !important;
        border: 2px dashed #38bdf8 !important;
      }
      .adm-rec-drag-row.adm-rec-row-dragover {
        border-top: 3.5px solid #38bdf8 !important;
        background: rgba(56, 189, 248, 0.22) !important;
      }
      .adm-drag-handle {
        cursor: grab;
        user-select: none;
      }
      .adm-drag-handle:active {
        cursor: grabbing;
      }

      /* Slide-out Side Drawer (Desktop) & Bottom Sheet (Mobile) */
      .adm-drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.82);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 9999;
        display: none;
        align-items: stretch;
        justify-content: flex-end;
        transition: opacity 0.25s ease;
      }
      .adm-drawer-overlay.active {
        display: flex;
      }
      .adm-drawer-content {
        background: #0f172a;
        border-left: 2px solid #334155;
        width: 100%;
        max-width: 580px;
        height: 100vh;
        display: flex;
        flex-direction: column;
        box-shadow: -10px 0 45px rgba(0, 0, 0, 0.8);
        position: relative;
        animation: slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @media (max-width: 768px) {
        .adm-drawer-overlay {
          align-items: flex-end;
          justify-content: center;
        }
        .adm-drawer-content {
          max-width: 100%;
          height: 92vh;
          border-left: none;
          border-top: 2px solid #3b82f6;
          border-radius: 20px 20px 0 0;
          animation: slideUpBottom 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUpBottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      }
      .adm-drawer-header {
        padding: 16px 20px;
        background: #1e293b;
        border-bottom: 1.5px solid #334155;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .adm-drawer-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .adm-drawer-footer {
        padding: 14px 20px;
        background: #1e293b;
        border-top: 1.5px solid #334155;
        position: sticky;
        bottom: 0;
        z-index: 10;
      }
    </style>

    <!-- Top Action Header -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📹 Universal Webinar & AarogyamTube Hub</span>
            <span style="font-size: 0.75rem; background: rgba(45,140,255,0.15); color: #2D8CFF; padding: 2px 8px; border-radius: 12px; font-weight: 700;">PRO V31</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 4px 0 0 0;">
            लाइव ज़ूम वेबिनार, 3D कवर, AarogyamTube रील्स, प्लेलिस्ट्स व YouTube सब्सक्राइब को 1-क्लिक में कंट्रोल करें।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/tube.html" target="_blank" class="admin-button small-button" style="background: #ef4444; color: #fff; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <span>🎬</span> <span>AarogyamTube लाइव देखें</span>
          </a>
          <a href="/webinar.html" target="_blank" class="admin-button small-button" style="background: #2D8CFF; color: #fff; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <span>👁️</span> <span>लाइव वेबिनार पेज</span>
          </a>
          <button id="btn-export-json-files" class="admin-button small-button" style="background: #10B981; color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <span>📥</span> <span>Export JSON (Git Sync)</span>
          </button>
          <button id="btn-wb-refresh" class="admin-button small-button" style="background: #6366f1; color: #fff; font-weight: 700;">
            <span>🔄</span> <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 8px; margin-top: 14px; border-bottom: 1px solid var(--admin-border); padding-bottom: 10px;">
        <button type="button" id="tab-btn-webinar" class="admin-button small-button" style="background: #2D8CFF; color: #fff; font-weight: 800;">
          <span>🔴 1. Master Webinar Manager</span>
        </button>
        <button type="button" id="tab-btn-reels" class="admin-button small-button" style="background: var(--admin-surface); color: var(--admin-text); font-weight: 700;">
          <span>🎬 2. AarogyamTube Videos & Reels (<span id="reels-count-badge">0</span>)</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: MASTER WEBINAR FORM -->
    <div id="tab-pane-webinar" class="admin-card" style="margin-bottom: 24px; padding: 20px;">
      <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-video" style="color: #2D8CFF;"></i>
        <span>लाइव ज़ूम वेबिनार एवं मुख्य कॉन्फिगरेशन</span>
      </h3>

      <form id="form-master-webinar">
        <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
          
          <!-- Basic Info -->
          <div>
            <label class="admin-label">वेबिनार का मुख्य शीर्षक: *</label>
            <input type="text" id="adm_wb_title" class="admin-input" placeholder="उदा. प्राकृतिक एवं जैविक खेती से 3x मुनाफा लाइव वेबिनार 2026" required style="width: 100%; font-weight: 700;" />
          </div>

          <div>
            <label class="admin-label">वेबिनार का विवरण (Description):</label>
            <textarea id="adm_wb_desc" class="admin-input" rows="2" placeholder="वेबिनार का संक्षिप्त विवरण यहाँ लिखें..." style="width: 100%;"></textarea>
          </div>

          <!-- Date & Time Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; background: rgba(0,0,0,0.2); padding: 14px; border-radius: 8px;">
            <div>
              <label class="admin-label">📅 वेबिनार की तारीख (Date):</label>
              <input type="date" id="adm_wb_date" class="admin-input" style="width: 100%;" />
            </div>
            <div>
              <label class="admin-label">⏰ वेबिनार का समय (Time):</label>
              <input type="time" id="adm_wb_time" class="admin-input" style="width: 100%;" />
            </div>
            <div>
              <label class="admin-label">⏱️ अवधि (Minutes):</label>
              <input type="number" id="adm_wb_duration" class="admin-input" value="90" style="width: 100%;" />
            </div>
            <div>
              <label class="admin-label">💰 फीस / मूल्य (₹ 0 = Free):</label>
              <input type="number" id="adm_wb_price" class="admin-input" value="0" style="width: 100%;" />
            </div>
          </div>

          <!-- Zoom Credentials -->
          <div style="background: rgba(45,140,255,0.08); border: 1.5px solid rgba(45,140,255,0.3); border-radius: 8px; padding: 14px;">
            <div style="font-weight: 800; font-size: 0.95rem; color: #93C5FD; margin-bottom: 10px;">
              <i class="fa-solid fa-key"></i> ज़ूम मीटिंग क्रेडेंशियल्स (Zoom Meeting Access)
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
              <div>
                <label class="admin-label">Meeting ID:</label>
                <input type="text" id="adm_wb_meeting_id" class="admin-input" placeholder="उदा. 812 3456 7890" style="width: 100%; font-weight: 800; font-family: monospace;" />
              </div>
              <div>
                <label class="admin-label">Passcode (पासवर्ड):</label>
                <input type="text" id="adm_wb_passcode" class="admin-input" placeholder="उदा. AI2026" style="width: 100%; font-weight: 800; font-family: monospace;" />
              </div>
              <div>
                <label class="admin-label">Direct Zoom Join Link (वैकल्पिक):</label>
                <input type="url" id="adm_wb_zoom_link" class="admin-input" placeholder="https://zoom.us/j/..." style="width: 100%;" />
              </div>
            </div>
          </div>

          <!-- 3D Cover Image Selector with Live Preview -->
          <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; background: rgba(0,0,0,0.2); padding: 14px; border-radius: 8px;">
            <div>
              <label class="admin-label">🖼️ 3D वेबिनार कवर इमेज चुनें या अपलोड करें:</label>
              <select id="adm_wb_cover_preset" class="admin-select" style="width: 100%; margin-bottom: 8px;">
                <option value="/images/banners/agriculture-hero-banner-1.webp">🌾 Agriculture Hero Banner 1 (Default)</option>
                <option value="/images/banners/agriculture-hero-banner-2.webp">🌿 Agriculture Hero Banner 2</option>
                <option value="/images/banners/universal-zoom-webinar-og.jpg">📺 Official Live Zoom Webinar Banner</option>
                <option value="custom_url">🔗 Custom Image URL दर्ज करें</option>
                <option value="custom_upload">📤 अपने फोन/कंप्यूटर से नई फोटो अपलोड करें</option>
              </select>

              <input type="text" id="adm_wb_cover_url" class="admin-input" placeholder="https://..." style="width: 100%; display: none; margin-bottom: 8px;" />
              <input type="file" id="adm_wb_cover_file" class="admin-input" accept="image/*" style="width: 100%; display: none; margin-bottom: 8px;" />
            </div>

            <!-- Live Cover Preview Box -->
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">Live 3D Cover Preview:</span>
              <div style="width: 100%; height: 130px; background: #0f172a; border-radius: 8px; overflow: hidden; border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: center; perspective: 800px; padding: 6px;">
                <img id="adm_cover_live_preview" src="/images/banners/agriculture-hero-banner-1.webp" alt="Cover Preview" style="width: 90%; height: 90%; object-fit: cover; border-radius: 8px; transform: rotateY(-8deg) rotateX(4deg); box-shadow: 0 10px 20px rgba(0,0,0,0.5);" onerror="this.src='/images/banners/universal-zoom-webinar-og.jpg'" />
              </div>
            </div>
          </div>

          <!-- Social Share / OpenGraph Live Preview -->
          <div style="background: rgba(0,0,0,0.25); border-radius: 8px; padding: 14px;">
            <div style="font-weight: 800; font-size: 0.95rem; color: #F59E0B; margin-bottom: 10px;">
              <i class="fa-solid fa-share-nodes"></i> WhatsApp & Social Share (OG Title, Description & Image)
            </div>
            <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 14px;">
              <div>
                <label class="admin-label">WhatsApp Share Title:</label>
                <input type="text" id="adm_og_title" class="admin-input" placeholder="🔴 Aarogyam India — लाइव ज़ूम वेबिनार" style="width: 100%; margin-bottom: 8px;" />
                
                <label class="admin-label">WhatsApp Share Description:</label>
                <textarea id="adm_og_desc" class="admin-input" rows="2" placeholder="लाइव ज़ूम ट्रेनिंग में भाग लें और 1-मिनट के कृषि शॉर्ट्स देखें..." style="width: 100%; margin-bottom: 8px;"></textarea>
                
                <label class="admin-label">🖼️ WhatsApp शेयर इमेज (OG Image):</label>
                <select id="adm_og_image_preset" class="admin-select" style="width: 100%; margin-bottom: 6px;">
                  <option value="/images/banners/universal-zoom-webinar-og.jpg">📺 Official Live Zoom Webinar OG (1200x630)</option>
                  <option value="/images/banners/agriculture-hero-banner-1.webp">🌾 Agriculture Hero Banner 1</option>
                  <option value="/images/banners/agriculture-hero-banner-2.webp">🌿 Agriculture Hero Banner 2</option>
                  <option value="custom_url">🔗 Custom Image URL दर्ज करें</option>
                  <option value="custom_upload">📤 नई फोटो अपलोड करें</option>
                </select>
                <input type="text" id="adm_og_image_url" class="admin-input" placeholder="https://..." style="width: 100%; display: none; margin-bottom: 6px;" />
                <input type="file" id="adm_og_image_file" class="admin-input" accept="image/*" style="width: 100%; display: none;" />
              </div>

              <!-- Live WhatsApp Card Preview -->
              <div style="background: #0B141A; border: 1px solid #1f2c34; border-radius: 10px; padding: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
                <div style="font-size: 0.72rem; color: #25D366; font-weight: 800; margin-bottom: 6px;">📱 Live WhatsApp Card Preview:</div>
                <div style="background: #111B21; border-radius: 8px; overflow: hidden; border: 1px solid #202c33;">
                  <img id="adm_og_preview_img" src="/images/banners/universal-zoom-webinar-og.jpg" alt="OG Image" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block;" onerror="this.src='/images/banners/agriculture-hero-banner-1.webp'" />
                  <div style="padding: 8px 10px;">
                    <div style="font-size: 0.68rem; color: #8696a0; text-transform: uppercase; letter-spacing: 0.5px;">aarogyamindia.online</div>
                    <div style="font-weight: 700; color: #e9edef; font-size: 0.82rem; margin: 2px 0;" id="adm_og_preview_title">🔴 Aarogyam India — लाइव ज़ूम वेबिनार</div>
                    <div style="color: #8696a0; font-size: 0.72rem; line-height: 1.3;" id="adm_og_preview_desc">लाइव ज़ूम ट्रेनिंग में भाग लें...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Multi-Banners / Posters Section Manager -->
          <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 800; font-size: 0.95rem; color: #38bdf8;">
                <i class="fa-solid fa-images"></i> 🖼️ मल्टी-बैनर एवं पोस्टर्स प्रबंधक (Banners & Posters)
              </span>
              <button type="button" id="btn-add-banner-item" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 800;">
                + नया पोस्टर / बैनर जोड़ें
              </button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div>
                <label class="admin-label">सेक्शन मुख्य शीर्षक:</label>
                <input type="text" id="adm_posters_title" class="admin-input" placeholder="उदा. 🖼️ विशेष वेबिनार एवं कृषि पोस्टर्स" style="width: 100%; font-weight:700;" />
              </div>
              <div>
                <label class="admin-label">सेक्शन उप-शीर्षक (Subtitle):</label>
                <input type="text" id="adm_posters_subtitle" class="admin-input" placeholder="उदा. नवीनतम अध्ययन सामग्री एवं स्पेशल वेबिनार कवर्स" style="width: 100%;" />
              </div>
            </div>

            <div id="adm_banners_container" style="display: flex; flex-direction: column; gap: 8px;">
              <!-- Dynamic Banner Rows Rendered by JS -->
            </div>
          </div>

          <!-- Drag & Drop Section Placement Manager -->
          <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-weight: 800; font-size: 0.95rem; color: #a855f7;">
                <i class="fa-solid fa-arrows-up-down"></i> पेज सेक्शंस का क्रम (Drag / Move Placement)
              </div>
              <button type="button" id="btn-reset-sections-order" class="admin-button small-button" style="background: rgba(255,255,255,0.1); color: #e2e8f0; font-size: 0.75rem;">
                ↺ डिफ़ॉल्ट क्रम
              </button>
            </div>
            <div id="adm_sections_order_container" style="display: flex; flex-direction: column; gap: 6px;">
              <!-- Rendered by JS -->
            </div>
          </div>

          <!-- Dynamic KPI Highlights -->
          <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 800; font-size: 0.95rem; color: #34D399;">⚡ KPI मुख्य बिंदु (Feature Highlights)</span>
              <button type="button" id="btn-add-kpi-item" class="admin-button small-button" style="background: #10B981; color: #fff; font-weight: 800;">+ बिंदु जोड़ें</button>
            </div>
            <div id="adm_kpi_container" style="display: flex; flex-direction: column; gap: 6px;">
              <!-- Rendered by JS -->
            </div>
          </div>

          <!-- Dynamic FAQs Manager -->
          <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 800; font-size: 0.95rem; color: #F59E0B;">❓ अक्सर पूछे जाने वाले सवाल (FAQs)</span>
              <button type="button" id="btn-add-faq-item" class="admin-button small-button" style="background: #F59E0B; color: #000; font-weight: 800;">+ नया प्रश्न जोड़ें</button>
            </div>
            <div id="adm_faqs_container" style="display: flex; flex-direction: column; gap: 8px;">
              <!-- Rendered by JS -->
            </div>
          </div>

          <!-- Submit Button -->
          <div style="margin-top: 10px;">
            <button type="submit" id="btn-save-master-webinar" class="admin-button" style="background: #2D8CFF; color: #fff; font-size: 1rem; font-weight: 800; width: 100%; padding: 14px; box-shadow: 0 4px 20px rgba(45,140,255,0.4);">
              <span>💾 वेबिनार सेटिंग्स सेव करें (Save & Sync)</span>
            </button>
          </div>

        </div>
      </form>
    </div>

    <!-- TAB 2: AAROGYAMTUBE VIDEOS & REELS MANAGER -->
    <div id="tab-pane-reels" class="admin-card" style="display: none; margin-bottom: 24px; padding: 20px;">
      
      <!-- Top Action Bar with Multi-Managers -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
            <span>🎬 AarogyamTube वीडियो एवं रील्स लाइब्रेरी</span>
            <span id="filtered-count-badge" style="font-size: 0.75rem; background: rgba(244,63,94,0.15); color: #f43f5e; padding: 2px 8px; border-radius: 10px; font-weight: 700;">0 वीडियो</span>
          </h3>
          <p style="font-size: 0.82rem; color: var(--admin-muted); margin: 0;">
            16:9 मास्टरक्लास, 9:16 रील्स, Dual-Format (दोनों जगह), YouTube चैनल व प्लेलिस्ट्स प्रबंधित करें।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btn-open-channels-modal" class="admin-button small-button" style="background: #3b82f6; color: #fff; font-weight: 700;">
            <span>📺 YouTube चैनल प्रबंधक</span>
          </button>
          <button type="button" id="btn-open-playlists-modal" class="admin-button small-button" style="background: #8b5cf6; color: #fff; font-weight: 700;">
            <span>📑 प्लेलिस्ट प्रबंधक</span>
          </button>
          <button type="button" id="btn-open-add-video-modal" class="admin-button small-button" style="background: #F43F5E; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <span>+ नई रील / वीडियो जोड़ें</span>
          </button>
        </div>
      </div>

      <!-- Real-time Live Search & Filter Bar -->
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; margin-bottom: 16px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <div style="flex: 1.4; min-width: 200px; position: relative;">
          <input type="text" id="adm_rec_search" class="admin-input" placeholder="🔍 शीर्षक, विषय या वक्ता खोजें..." style="width: 100%; font-size: 0.85rem; padding-left: 10px;" />
        </div>
        <div style="flex: 1; min-width: 150px;">
          <select id="adm_filter_format" class="admin-select" style="width: 100%; font-size: 0.85rem;">
            <option value="all">🌟 सभी फॉर्मेट (All Formats)</option>
            <option value="short_reel">📱 9:16 Shorts / Reel (रील्स)</option>
            <option value="full_video">🖥️ 16:9 Masterclass (फुल वीडियो)</option>
            <option value="both">🌟 Dual Format (दोनों जगह - Both)</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <select id="adm_filter_category" class="admin-select" style="width: 100%; font-size: 0.85rem;">
            <option value="all">📁 सभी श्रेणियां (All Categories)</option>
            <!-- Dynamically populated -->
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <select id="adm_filter_playlist" class="admin-select" style="width: 100%; font-size: 0.85rem;">
            <option value="all">📑 सभी प्लेलिस्ट्स (All Playlists)</option>
            <!-- Dynamically populated -->
          </select>
        </div>
        <button type="button" id="btn-reset-filters" class="admin-button small-button" style="background: rgba(255,255,255,0.1); color: #cbd5e1; font-size: 0.78rem;" title="फ़िल्टर रीसेट करें">
          ↺ Reset
        </button>
      </div>

      <!-- Videos & Reels Table -->
      <div style="overflow-x: auto; background: #0f172a; border-radius: 8px; border: 1px solid var(--admin-border);">
        <table class="admin-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--admin-border); text-align: left; font-size: 0.8rem; color: var(--admin-muted);">
              <th style="padding: 10px; width: 45px; text-align: center;">क्रम (Drag)</th>
              <th style="padding: 10px;">थंबनेल</th>
              <th style="padding: 10px;">फॉर्मेट / चैनल</th>
              <th style="padding: 10px;">शीर्षक एवं विवरण</th>
              <th style="padding: 10px;">श्रेणी व अवधि</th>
              <th style="padding: 10px; text-align: right;">एक्शन</th>
            </tr>
          </thead>
          <tbody id="adm_recordings_tbody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SLIDE-OUT SIDE DRAWER: ADD / EDIT VIDEO OR REEL -->
    <!-- ============================================================= -->
    <div id="drawer-video-editor" class="adm-drawer-overlay">
      <div class="adm-drawer-content">
        <div class="adm-drawer-header">
          <h4 style="font-weight: 800; font-size: 1.1rem; color: #fff; margin: 0; display: flex; align-items: center; gap: 8px;" id="drawer-video-title">
            🎬 नई रील / वीडियो जोड़ें
          </h4>
          <button type="button" id="btn-close-video-drawer" style="background: rgba(255,255,255,0.1); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>

        <form id="form-video-drawer" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
          <div class="adm-drawer-body">
            
            <!-- Format & Platform Grid -->
            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 10px;">
              <div>
                <label class="admin-label">फॉर्मेट (Format): *</label>
                <select id="drawer_rec_format" class="admin-select" style="width: 100%;">
                  <option value="both">🌟 Dual Format (16:9 + 9:16 दोनों जगह)</option>
                  <option value="short_reel">📱 9:16 Short / Reel (केवल रील)</option>
                  <option value="full_video">🖥️ 16:9 Masterclass (केवल फुल वीडियो)</option>
                </select>
              </div>
              <div>
                <label class="admin-label">प्लेटफॉर्म (Platform): *</label>
                <select id="drawer_rec_platform" class="admin-select" style="width: 100%;">
                  <option value="youtube">🔴 YouTube</option>
                  <option value="instagram">📷 Instagram</option>
                  <option value="facebook">📘 Facebook</option>
                </select>
              </div>
            </div>

            <!-- YouTube Channel Preset Selector -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <label class="admin-label" style="margin: 0;">📺 YouTube चैनल (Channel Preset):</label>
                <button type="button" id="btn-drawer-add-new-ch" style="background: none; border: none; color: #60a5fa; font-size: 0.72rem; font-weight: 700; cursor: pointer;">+ नया चैनल जोड़ें</button>
              </div>
              <select id="drawer_rec_channel" class="admin-select" style="width: 100%;">
                <!-- Dynamically populated from allChannels -->
              </select>
            </div>

            <div>
              <label class="admin-label">Video / Reel URL Link: *</label>
              <input type="url" id="drawer_rec_url" class="admin-input" placeholder="https://youtube.com/watch?v=... या https://youtube.com/shorts/..." required style="width: 100%;" />
            </div>

            <div>
              <label class="admin-label">वीडियो का मुख्य शीर्षक (Title): *</label>
              <input type="text" id="drawer_rec_title" class="admin-input" placeholder="उदा. सोयाबीन में इल्ली का 1-स्प्रे रामबाण इलाज" required style="width: 100%; font-weight: 700;" />
            </div>

            <div>
              <label class="admin-label">विवरण (Description / Caption):</label>
              <textarea id="drawer_rec_desc" class="admin-input" rows="2" placeholder="वीडियो या रील के बारे में संक्षिप्त जानकारी..." style="width: 100%;"></textarea>
            </div>

            <!-- Category & Playlist Assignment Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="admin-label">विषय / श्रेणी (Category): *</label>
                <select id="drawer_rec_category" class="admin-select" style="width: 100%;">
                  <!-- Dynamically populated -->
                </select>
                <input type="text" id="drawer_rec_custom_category" class="admin-input" placeholder="नई श्रेणी का नाम लिखें..." style="width: 100%; display: none; margin-top: 6px;" />
              </div>
              <div>
                <label class="admin-label">प्लेलिस्ट में जोड़ें (Playlist):</label>
                <select id="drawer_rec_playlist" class="admin-select" style="width: 100%;">
                  <option value="">(कोई प्लेलिस्ट नहीं)</option>
                  <!-- Dynamically populated -->
                </select>
              </div>
            </div>

            <!-- Duration & Speaker Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="admin-label">अवधि (Duration):</label>
                <input type="text" id="drawer_rec_duration" class="admin-input" placeholder="उदा. 0:58 या 45 मिनट" value="45:00" style="width: 100%;" />
              </div>
              <div>
                <label class="admin-label">विशेषज्ञ / वक्ता (Speaker):</label>
                <input type="text" id="drawer_rec_speaker" class="admin-input" placeholder="उदा. आरोग्यम कृषि विशेषज्ञ" value="आरोग्यम कृषि विशेषज्ञ" style="width: 100%;" />
              </div>
            </div>

            <!-- Zero-Egress Priority & Pinning Controls -->
            <div style="background: rgba(30,41,59,0.7); border: 1px solid #3b82f6; border-radius: 8px; padding: 12px;">
              <div style="font-size: 0.8rem; font-weight: 800; color: #60a5fa; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span>⚡</span> <span>प्राथमिकता व सीक्वेंसिंग (Priority & Pinning):</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label class="admin-label">सीक्वेंस मोड (Order Type):</label>
                  <select id="drawer_rec_order_type" class="admin-select" style="width: 100%;">
                    <option value="normal">⏱️ Normal (तारीख अनुसार - Newest First)</option>
                    <option value="pinned">📌 Pinned Video (हमेशा टॉप पर)</option>
                    <option value="priority">🔢 Priority Score (1-100 अंक)</option>
                    <option value="random">🎲 Random Shuffle (रैंडम)</option>
                  </select>
                </div>
                <div>
                  <label class="admin-label">प्राथमिकता अंक (Priority 1-100):</label>
                  <input type="number" id="drawer_rec_priority" class="admin-input" min="0" max="100" value="50" style="width: 100%;" />
                </div>
              </div>
              <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="drawer_rec_pinned" style="width: 18px; height: 18px; accent-color: #3b82f6; cursor: pointer;" />
                <label for="drawer_rec_pinned" style="font-size: 0.82rem; color: #f8fafc; cursor: pointer; font-weight: 700;">
                  📌 इस वीडियो को सबसे ऊपर पिन रखें (Pin this Video to Top)
                </label>
              </div>
            </div>

            <!-- Access Tier -->
            <div>
              <label class="admin-label">विजिबिलिटी / एक्सेस (Access):</label>
              <select id="drawer_rec_access" class="admin-select" style="width: 100%;">
                <option value="all">🌟 सभी के लिए (All Users - Public)</option>
                <option value="registration_only">🔒 केवल रजिस्टर्ड यूजर (Only Registered)</option>
                <option value="active_only">🟢 केवल एक्टिव यूजर (Only Active)</option>
              </select>
            </div>

            <!-- Thumbnail Options -->
            <div>
              <label class="admin-label">थंबनेल (Thumbnail Cover):</label>
              <select id="drawer_rec_thumb_type" class="admin-select" style="width: 100%; margin-bottom: 6px;">
                <option value="auto">⚡ Auto (Video URL से स्वतः लें)</option>
                <option value="aarogyamtube_mono">🛡️ AarogyamTube Official Default Mono</option>
                <option value="custom_url">🔗 Custom Image URL</option>
                <option value="custom_upload">📤 नई फोटो अपलोड करें</option>
              </select>
              <input type="text" id="drawer_rec_custom_thumb_url" class="admin-input" placeholder="https://..." style="width: 100%; display: none; margin-bottom: 6px;" />
              <input type="file" id="drawer_rec_custom_thumb_file" class="admin-input" accept="image/*" style="width: 100%; display: none;" />
            </div>

            <!-- Live Card Preview -->
            <div style="background: #000; border: 1px solid #334155; border-radius: 8px; padding: 10px; display: flex; gap: 12px; align-items: center;">
              <div style="width: 80px; height: 50px; background: #1e293b; border-radius: 6px; overflow: hidden; position: relative; flex-shrink: 0;">
                <img id="drawer_rec_preview_img" src="/images/banners/aarogyamtube-default-thumb.svg" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.72rem; color: #38bdf8; font-weight: 800;">📺 Live Card Preview:</div>
                <div id="drawer_rec_preview_title" style="font-size: 0.82rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">शीर्षक यहाँ दिखेगा...</div>
                <div id="drawer_rec_preview_meta" style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">आरोग्यम विशेषज्ञ • 45:00</div>
              </div>
            </div>

          </div>

          <!-- Sticky Bottom Footer -->
          <div class="adm-drawer-footer">
            <button type="submit" id="btn-save-video-entry" class="admin-button" style="background: #F43F5E; color: #fff; width: 100%; font-weight: 800; padding: 12px; font-size: 0.95rem; box-shadow: 0 4px 16px rgba(244,63,94,0.4);">
              <span>💾 वीडियो सुरक्षित करें (Save & Sync)</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- CHANNELS PRESET MANAGER DRAWER -->
    <!-- ============================================================= -->
    <div id="drawer-channels-manager" class="adm-drawer-overlay">
      <div class="adm-drawer-content">
        <div class="adm-drawer-header">
          <h4 style="font-weight: 800; font-size: 1.1rem; color: #fff; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>📺 YouTube चैनल प्रबंधक (Channels)</span>
          </h4>
          <button type="button" id="btn-close-channels-drawer" style="background: rgba(255,255,255,0.1); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>

        <div class="adm-drawer-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 700;">मौजूदा चैनल्स सूची:</span>
            <button type="button" id="btn-add-new-channel-row" class="admin-button small-button" style="background: #10B981; color: #fff; font-size: 0.78rem;">+ नया चैनल जोड़ें</button>
          </div>
          <div id="adm_channels_list_container" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Channels List -->
          </div>
        </div>

        <div class="adm-drawer-footer">
          <button type="button" id="btn-save-channels-data" class="admin-button" style="background: #3b82f6; color: #fff; width: 100%; font-weight: 800; padding: 12px;">
            <span>💾 चैनल सूची सेव करें (Save Channels)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- PLAYLISTS MANAGER DRAWER -->
    <!-- ============================================================= -->
    <div id="drawer-playlists-manager" class="adm-drawer-overlay">
      <div class="adm-drawer-content">
        <div class="adm-drawer-header">
          <h4 style="font-weight: 800; font-size: 1.1rem; color: #fff; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>📑 प्लेलिस्ट प्रबंधक (Playlists)</span>
          </h4>
          <button type="button" id="btn-close-playlists-drawer" style="background: rgba(255,255,255,0.1); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>

        <div class="adm-drawer-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 700;">मौजूदा प्लेलिस्ट्स:</span>
            <button type="button" id="btn-add-new-playlist-row" class="admin-button small-button" style="background: #8b5cf6; color: #fff; font-size: 0.78rem;">+ नई प्लेलिस्ट बनाएं</button>
          </div>
          <div id="adm_playlists_list_container" style="display: flex; flex-direction: column; gap: 14px;">
            <!-- Playlists List -->
          </div>
        </div>

        <div class="adm-drawer-footer">
          <button type="button" id="btn-save-playlists-data" class="admin-button" style="background: #8b5cf6; color: #fff; width: 100%; font-weight: 800; padding: 12px;">
            <span>💾 प्लेलिस्ट्स सेव करें (Save Playlists)</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // -------------------------------------------------------------
  // INITIALIZE DATA & EVENT BINDINGS
  // -------------------------------------------------------------
  async function loadData() {
    // 1. Master Webinar JSON
    try {
      const resp = await fetch('/data/webinar-master.json?v=' + Date.now());
      if (resp.ok) {
        const json = await resp.json();
        const wm = json.webinarMaster || json || {};
        if (wm.title) masterWebinar = { ...masterWebinar, ...wm };
      }
    } catch (e) { }

    // 2. Recordings, Channels, Categories, Playlists JSON
    try {
      const rResp = await fetch('/data/webinar-recordings.json?v=' + Date.now());
      if (rResp.ok) {
        const rJson = await rResp.json();
        const list = Array.isArray(rJson.recordings) ? rJson.recordings : (Array.isArray(rJson) ? rJson : []);
        if (list.length > 0) allRecordings = list;

        if (Array.isArray(rJson.channels) && rJson.channels.length > 0) {
          allChannels = rJson.channels;
        }
        if (Array.isArray(rJson.master_categories) && rJson.master_categories.length > 0) {
          masterCategories = rJson.master_categories;
        }
        if (Array.isArray(rJson.playlists) && rJson.playlists.length > 0) {
          allPlaylists = rJson.playlists;
        }
      }
    } catch (e) { }

    // Check LocalStorage overrides
    try {
      const localRec = localStorage.getItem('AI_LOCAL_RECORDED_VIDEOS');
      if (localRec) {
        const p = JSON.parse(localRec);
        if (Array.isArray(p) && p.length > 0) allRecordings = p;
      }
      const localCats = localStorage.getItem('AI_LOCAL_MASTER_CATEGORIES');
      if (localCats) {
        const p = JSON.parse(localCats);
        if (Array.isArray(p) && p.length > 0) masterCategories = p;
      }
      const localChs = localStorage.getItem('AI_LOCAL_CHANNELS');
      if (localChs) {
        const p = JSON.parse(localChs);
        if (Array.isArray(p) && p.length > 0) allChannels = p;
      }
      const localPls = localStorage.getItem('AI_LOCAL_PLAYLISTS');
      if (localPls) {
        const p = JSON.parse(localPls);
        if (Array.isArray(p) && p.length > 0) allPlaylists = p;
      }
    } catch(e) {}

    populateMasterWebinarForm();
    renderSectionsList();
    renderBannersList();
    renderKpisList();
    renderFaqsList();
    populateCategoryAndPlaylistDropdowns();
    renderRecordingsTable();
  }

  function populateMasterWebinarForm() {
    document.getElementById('adm_wb_title').value = masterWebinar.title || '';
    document.getElementById('adm_wb_desc').value = masterWebinar.description || masterWebinar.desc || '';
    document.getElementById('adm_wb_date').value = masterWebinar.date || '';
    document.getElementById('adm_wb_time').value = masterWebinar.time || '';
    document.getElementById('adm_wb_duration').value = masterWebinar.duration_minutes || 90;
    document.getElementById('adm_wb_price').value = masterWebinar.price || 0;
    document.getElementById('adm_wb_meeting_id').value = masterWebinar.meeting_id || '';
    document.getElementById('adm_wb_passcode').value = masterWebinar.passcode || '';
    document.getElementById('adm_wb_zoom_link').value = masterWebinar.zoom_link || '';

    const pTitle = document.getElementById('adm_posters_title');
    const pSub = document.getElementById('adm_posters_subtitle');
    if (pTitle) pTitle.value = masterWebinar.posters_title || '🖼️ विशेष वेबिनार एवं कृषि पोस्टर्स';
    if (pSub) pSub.value = masterWebinar.posters_subtitle || 'नवीनतम अध्ययन सामग्री एवं स्पेशल वेबिनार कवर्स';

    const coverUrl = masterWebinar.cover_image || '/images/banners/webinar-cover-live.webp';
    const previewEl = document.getElementById('adm_cover_live_preview');
    if (previewEl) previewEl.src = coverUrl;

    const coverPresetSel = document.getElementById('adm_wb_cover_preset');
    const coverUrlInp = document.getElementById('adm_wb_cover_url');
    if (coverPresetSel) {
      let matched = false;
      for (let opt of coverPresetSel.options) {
        if (opt.value === coverUrl) {
          coverPresetSel.value = coverUrl;
          matched = true;
          break;
        }
      }
      if (!matched) {
        coverPresetSel.value = 'custom_url';
        if (coverUrlInp) {
          coverUrlInp.value = coverUrl;
          coverUrlInp.style.display = 'block';
        }
      } else {
        if (coverUrlInp) coverUrlInp.style.display = 'none';
      }
    }

    document.getElementById('adm_og_title').value = masterWebinar.og_title || masterWebinar.title || '';
    document.getElementById('adm_og_desc').value = masterWebinar.og_description || masterWebinar.description || '';
    updateOgPreview();
  }

  function updateOgPreview() {
    const t = document.getElementById('adm_og_title')?.value || masterWebinar.title;
    const d = document.getElementById('adm_og_desc')?.value || masterWebinar.description;
    const pt = document.getElementById('adm_og_preview_title');
    const pd = document.getElementById('adm_og_preview_desc');
    if (pt) pt.textContent = t;
    const ogImg = masterWebinar.og_image || '/images/banners/universal-zoom-webinar-og.jpg';
    const ogPreviewImg = document.getElementById('adm_og_preview_img');
    if (ogPreviewImg) ogPreviewImg.src = ogImg;
    if (pd) pd.textContent = d;
  }

  document.getElementById('adm_og_title')?.addEventListener('input', updateOgPreview);
  document.getElementById('adm_og_desc')?.addEventListener('input', updateOgPreview);

  const ogPresetSel = document.getElementById('adm_og_image_preset');
  const ogUrlInp = document.getElementById('adm_og_image_url');
  const ogFileInp = document.getElementById('adm_og_image_file');
  const ogPreviewImg = document.getElementById('adm_og_preview_img');

  ogPresetSel?.addEventListener('change', () => {
    const val = ogPresetSel.value;
    if (val === 'custom_url') {
      ogUrlInp.style.display = 'block';
      ogFileInp.style.display = 'none';
    } else if (val === 'custom_upload') {
      ogUrlInp.style.display = 'none';
      ogFileInp.style.display = 'block';
    } else {
      ogUrlInp.style.display = 'none';
      ogFileInp.style.display = 'none';
      masterWebinar.og_image = val;
      if (ogPreviewImg) ogPreviewImg.src = val;
    }
  });

  ogUrlInp?.addEventListener('input', () => {
    if (ogUrlInp.value.trim()) {
      masterWebinar.og_image = ogUrlInp.value.trim();
      if (ogPreviewImg) ogPreviewImg.src = ogUrlInp.value.trim();
    }
  });

  ogFileInp?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        masterWebinar.og_image = re.target.result;
        if (ogPreviewImg) ogPreviewImg.src = re.target.result;
        showToast('📸 WhatsApp शेयर इमेज लोड हो गई!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  const presetSel = document.getElementById('adm_wb_cover_preset');
  const urlInp = document.getElementById('adm_wb_cover_url');
  const fileInp = document.getElementById('adm_wb_cover_file');
  const previewImg = document.getElementById('adm_cover_live_preview');

  presetSel?.addEventListener('change', () => {
    const val = presetSel.value;
    if (val === 'custom_url') {
      urlInp.style.display = 'block';
      fileInp.style.display = 'none';
    } else if (val === 'custom_upload') {
      urlInp.style.display = 'none';
      fileInp.style.display = 'block';
    } else {
      urlInp.style.display = 'none';
      fileInp.style.display = 'none';
      masterWebinar.cover_image = val;
      if (previewImg) previewImg.src = val;
    }
  });

  urlInp?.addEventListener('input', () => {
    if (urlInp.value.trim()) {
      masterWebinar.cover_image = urlInp.value.trim();
      if (previewImg) previewImg.src = urlInp.value.trim();
    }
  });

  function renderSectionsList() {
    const cont = document.getElementById('adm_sections_order_container');
    if (!cont) return;
    const currentOrder = masterWebinar.section_order || defaultSections.map(s => s.key);
    cont.innerHTML = currentOrder.map((sKey, idx) => {
      const secMeta = defaultSections.find(s => s.key === sKey) || { name: sKey, desc: '' };
      return `
        <div class="adm-section-drag-item" draggable="true" data-index="${idx}" style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px 14px; cursor: grab;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.1rem; color: #60a5fa;" class="adm-drag-handle">☰</span>
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">${secMeta.name}</div>
              <div style="font-size: 0.72rem; color: #94a3b8;">${secMeta.desc}</div>
            </div>
          </div>
          <div style="display: flex; gap: 4px; align-items: center;">
            <button type="button" onclick="window.moveSectionPlacement(${idx}, -1)" class="admin-button small-button" style="background: rgba(59,130,246,0.2); color: #60a5fa; border: 1px solid #3b82f6; padding: 4px 8px; font-weight: 800;" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
            <button type="button" onclick="window.moveSectionPlacement(${idx}, 1)" class="admin-button small-button" style="background: rgba(59,130,246,0.2); color: #60a5fa; border: 1px solid #3b82f6; padding: 4px 8px; font-weight: 800;" ${idx === currentOrder.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.moveSectionPlacement = (idx, delta) => {
    if (!masterWebinar.section_order) masterWebinar.section_order = defaultSections.map(s => s.key);
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= masterWebinar.section_order.length) return;
    const temp = masterWebinar.section_order[idx];
    masterWebinar.section_order[idx] = masterWebinar.section_order[targetIdx];
    masterWebinar.section_order[targetIdx] = temp;
    renderSectionsList();
  };

  document.getElementById('btn-reset-sections-order')?.addEventListener('click', () => {
    masterWebinar.section_order = defaultSections.map(s => s.key);
    renderSectionsList();
    showToast('↺ सेक्शंस का क्रम डिफ़ॉल्ट रीसेट हो गया!', 'info');
  });

  function renderBannersList() {
    const cont = document.getElementById('adm_banners_container');
    if (!cont) return;
    const list = masterWebinar.banners || [];
    cont.innerHTML = list.map((b, idx) => {
      const bTitle = typeof b === 'object' ? (b.title || '') : `पोस्टर #${idx + 1}`;
      const bUrl = typeof b === 'object' ? (b.url || '') : b;
      return `
        <div style="display: grid; grid-template-columns: 60px 1fr auto; gap: 10px; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px;">
          <div style="width:60px; height:38px; background:#000; border-radius:4px; overflow:hidden;">
            <img src="${bUrl}" alt="Banner" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/agriculture-hero-banner-1.webp'" />
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <input type="text" class="admin-input adm-banner-title" placeholder="पोस्टर शीर्षक" value="${bTitle}" style="font-size:0.82rem; font-weight:700; width:100%;" />
            <input type="text" class="admin-input adm-banner-url" placeholder="इमेज URL" value="${bUrl}" style="font-size:0.75rem; width:100%;" />
          </div>
          <div style="display: flex; gap: 4px; align-items: center;">
            <button type="button" onclick="window.moveBannerItem(${idx}, -1)" class="admin-button small-button" style="background:rgba(59,130,246,0.2); color:#60a5fa; border:1px solid #3b82f6; padding:4px 8px; font-weight:800;" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
            <button type="button" onclick="window.moveBannerItem(${idx}, 1)" class="admin-button small-button" style="background:rgba(59,130,246,0.2); color:#60a5fa; border:1px solid #3b82f6; padding:4px 8px; font-weight:800;" ${idx === list.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
            <button type="button" onclick="window.removeBannerItem(${idx})" class="admin-button small-button" style="background:#ef4444; color:#fff; padding:4px 8px;">&times;</button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.moveBannerItem = (idx, delta) => {
    if (!masterWebinar.banners) return;
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= masterWebinar.banners.length) return;
    const temp = masterWebinar.banners[idx];
    masterWebinar.banners[idx] = masterWebinar.banners[targetIdx];
    masterWebinar.banners[targetIdx] = temp;
    renderBannersList();
  };

  window.removeBannerItem = (idx) => {
    if (!masterWebinar.banners) return;
    masterWebinar.banners.splice(idx, 1);
    renderBannersList();
  };

  document.getElementById('btn-add-banner-item')?.addEventListener('click', () => {
    if (!masterWebinar.banners) masterWebinar.banners = [];
    masterWebinar.banners.push({ title: 'नया कृषि पोस्टर', url: '/images/banners/agriculture-hero-banner-1.webp' });
    renderBannersList();
  });

  function renderKpisList() {
    const cont = document.getElementById('adm_kpi_container');
    if (!cont) return;
    cont.innerHTML = (masterWebinar.kpis || []).map((kpi, idx) => `
      <div style="display: flex; gap: 6px; align-items: center;">
        <input type="text" class="admin-input adm-kpi-input" value="${kpi}" style="flex: 1;" />
        <button type="button" onclick="window.removeKpiItem(${idx})" class="admin-button small-button" style="background: #ef4444; color: #fff;">&times;</button>
      </div>
    `).join('');
  }

  window.removeKpiItem = (idx) => {
    masterWebinar.kpis.splice(idx, 1);
    renderKpisList();
  };

  document.getElementById('btn-add-kpi-item')?.addEventListener('click', () => {
    if (!masterWebinar.kpis) masterWebinar.kpis = [];
    masterWebinar.kpis.push('नया महत्वपूर्ण बिंदु...');
    renderKpisList();
  });

  function renderFaqsList() {
    const cont = document.getElementById('adm_faqs_container');
    if (!cont) return;
    cont.innerHTML = (masterWebinar.faqs || []).map((faq, idx) => `
      <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 700;">प्रश्न #${idx + 1}:</span>
          <button type="button" onclick="window.removeFaqItem(${idx})" class="admin-button small-button" style="background: #ef4444; color: #fff; padding: 2px 6px; font-size: 0.7rem;">&times; हटाएं</button>
        </div>
        <input type="text" class="admin-input adm-faq-q" value="${faq.q}" placeholder="प्रश्न लिखें..." style="width: 100%; margin-bottom: 6px;" />
        <textarea class="admin-input adm-faq-a" rows="2" placeholder="उत्तर लिखें..." style="width: 100%;">${faq.a}</textarea>
      </div>
    `).join('');
  }

  window.removeFaqItem = (idx) => {
    masterWebinar.faqs.splice(idx, 1);
    renderFaqsList();
  };

  document.getElementById('btn-add-faq-item')?.addEventListener('click', () => {
    if (!masterWebinar.faqs) masterWebinar.faqs = [];
    masterWebinar.faqs.push({ q: 'नया प्रश्न यहाँ लिखें...', a: 'उत्तर यहाँ लिखें...' });
    renderFaqsList();
  });

  // Save Master Webinar
  document.getElementById('form-master-webinar')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-master-webinar');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ सुरक्षित हो रहा है...';
    }

    masterWebinar.title = (document.getElementById('adm_wb_title')?.value || '').trim();
    masterWebinar.description = (document.getElementById('adm_wb_desc')?.value || '').trim();
    masterWebinar.date = document.getElementById('adm_wb_date')?.value || '';
    masterWebinar.time = document.getElementById('adm_wb_time')?.value || '';
    masterWebinar.duration_minutes = parseInt(document.getElementById('adm_wb_duration')?.value, 10) || 90;
    masterWebinar.price = parseInt(document.getElementById('adm_wb_price')?.value, 10) || 0;
    masterWebinar.meeting_id = (document.getElementById('adm_wb_meeting_id')?.value || '').trim();
    masterWebinar.passcode = (document.getElementById('adm_wb_passcode')?.value || '').trim();
    masterWebinar.zoom_link = (document.getElementById('adm_wb_zoom_link')?.value || '').trim();
    masterWebinar.og_title = (document.getElementById('adm_og_title')?.value || '').trim() || masterWebinar.title;
    masterWebinar.og_description = (document.getElementById('adm_og_desc')?.value || '').trim() || masterWebinar.description;

    const presetVal = document.getElementById('adm_wb_cover_preset')?.value;
    const urlVal = document.getElementById('adm_wb_cover_url')?.value?.trim();
    if (presetVal === 'custom_url' && urlVal) {
      masterWebinar.cover_image = urlVal;
    } else if (presetVal && presetVal !== 'custom_url' && presetVal !== 'custom_upload') {
      masterWebinar.cover_image = presetVal;
    }

    masterWebinar.posters_title = (document.getElementById('adm_posters_title')?.value || '').trim() || '🖼️ विशेष वेबिनार एवं कृषि पोस्टर्स';
    masterWebinar.posters_subtitle = (document.getElementById('adm_posters_subtitle')?.value || '').trim() || 'नवीनतम अध्ययन सामग्री एवं स्पेशल वेबिनार कवर्स';

    const banners = [];
    document.querySelectorAll('#adm_banners_container > div').forEach(row => {
      const bTitle = (row.querySelector('.adm-banner-title')?.value || '').trim();
      const bUrl = (row.querySelector('.adm-banner-url')?.value || '').trim();
      if (bUrl) banners.push({ title: bTitle, url: bUrl });
    });
    if (banners.length > 0) masterWebinar.banners = banners;

    masterWebinar.kpis = Array.from(document.querySelectorAll('.adm-kpi-input')).map(el => el.value.trim()).filter(Boolean);

    const faqs = [];
    document.querySelectorAll('#adm_faqs_container > div').forEach(row => {
      const q = (row.querySelector('.adm-faq-q')?.value || '').trim();
      const a = (row.querySelector('.adm-faq-a')?.value || '').trim();
      if (q && a) faqs.push({ q, a });
    });
    masterWebinar.faqs = faqs;

    try {
      localStorage.setItem('AAROGYAM_WEBINAR_MASTER', JSON.stringify(masterWebinar));
    } catch (e) { }

    try {
      await fetch('/api/auto-sync-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_webinar_master', webinarMaster: masterWebinar })
      });
      showToast('🚀 लाइव ज़ूम वेबिनार सेटिंग्स सुरक्षित हो गईं!', 'success');
    } catch (err) {
      showToast('✅ वेबिनार सेटिंग्स स्थानीय रूप से सुरक्षित हो गईं।', 'success');
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = '💾 वेबिनार सेटिंग्स सेव करें (Save & Sync)';
    }
  });

  // -------------------------------------------------------------
  // DROPDOWNS & FILTER POPULATION
  // -------------------------------------------------------------
  function populateCategoryAndPlaylistDropdowns() {
    // 1. Drawer Channel selector
    const chSel = document.getElementById('drawer_rec_channel');
    if (chSel) {
      chSel.innerHTML = allChannels.map(ch => `
        <option value="${ch.id}">${ch.name} (${ch.handle}) ${ch.is_default ? '🌟 Default' : ''}</option>
      `).join('');
    }

    // 2. Drawer Category selector
    const catSel = document.getElementById('drawer_rec_category');
    if (catSel) {
      const distinctCats = Array.from(new Set([...masterCategories, ...allRecordings.map(v => v.category).filter(Boolean)]));
      catSel.innerHTML = `
        ${distinctCats.map(c => `<option value="${c}">${c}</option>`).join('')}
        <option value="custom">➕ नई श्रेणी जोड़ें (Add Custom)</option>
      `;
    }

    // 3. Drawer Playlist selector
    const plSel = document.getElementById('drawer_rec_playlist');
    if (plSel) {
      plSel.innerHTML = `
        <option value="">(कोई प्लेलिस्ट नहीं)</option>
        ${allPlaylists.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
      `;
    }

    // 4. Filter Toolbar Category dropdown
    const fCatSel = document.getElementById('adm_filter_category');
    if (fCatSel) {
      const distinctCats = Array.from(new Set([...masterCategories, ...allRecordings.map(v => v.category).filter(Boolean)]));
      fCatSel.innerHTML = `
        <option value="all">📁 सभी श्रेणियां (All Categories)</option>
        ${distinctCats.map(c => `<option value="${c}">${c}</option>`).join('')}
      `;
    }

    // 5. Filter Toolbar Playlist dropdown
    const fPlSel = document.getElementById('adm_filter_playlist');
    if (fPlSel) {
      fPlSel.innerHTML = `
        <option value="all">📑 सभी प्लेलिस्ट्स (All Playlists)</option>
        ${allPlaylists.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
      `;
    }
  }

  // -------------------------------------------------------------
  // AAROGYAMTUBE VIDEOS & REELS TABLE (WITH LIVE MULTI-FILTER)
  // -------------------------------------------------------------
  function getFilteredRecordings() {
    return allRecordings.filter(r => {
      // 1. Text Search Query
      if (searchFilterQuery) {
        const q = searchFilterQuery.toLowerCase();
        const t = (r.title || '').toLowerCase();
        const d = (r.description || '').toLowerCase();
        const s = (r.speaker || '').toLowerCase();
        const c = (r.category || '').toLowerCase();
        if (!t.includes(q) && !d.includes(q) && !s.includes(q) && !c.includes(q)) return false;
      }

      // 2. Format Filter
      if (formatFilterVal !== 'all') {
        if (formatFilterVal === 'both') {
          if (r.format !== 'both') return false;
        } else if (formatFilterVal === 'short_reel') {
          if (r.format !== 'short_reel' && r.format !== 'both' && !r.id.startsWith('VID_S')) return false;
        } else if (formatFilterVal === 'full_video') {
          if (r.format !== 'full_video' && r.format !== 'masterclass' && r.format !== 'both' && (r.format === 'short_reel' || r.id.startsWith('VID_S'))) return false;
        }
      }

      // 3. Category Filter
      if (categoryFilterVal !== 'all') {
        if (r.category !== categoryFilterVal && r.subject !== categoryFilterVal) return false;
      }

      // 4. Playlist Filter
      if (playlistFilterVal !== 'all') {
        const pl = allPlaylists.find(p => p.id === playlistFilterVal);
        if (!pl || !pl.video_ids || !pl.video_ids.includes(r.id)) return false;
      }

      return true;
    });
  }

  function renderRecordingsTable() {
    const tbody = document.getElementById('adm_recordings_tbody');
    const badge = document.getElementById('reels-count-badge');
    const fBadge = document.getElementById('filtered-count-badge');
    if (badge) badge.textContent = allRecordings.length;
    if (!tbody) return;

    const filteredList = getFilteredRecordings();
    if (fBadge) fBadge.textContent = `दिखाए गए: ${filteredList.length} / कुल: ${allRecordings.length}`;

    if (filteredList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 26px; color: var(--admin-muted);">
            ${allRecordings.length === 0 ? 'लाइब्रेरी में अभी कोई वीडियो नहीं है।' : '🔍 खोजे गए फ़िल्टर के अनुसार कोई वीडियो नहीं मिला।'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredList.map((r, fIdx) => {
      const actualIdx = allRecordings.findIndex(x => x.id === r.id);
      const fallback = r.platform === 'instagram' ? '/images/banners/agriculture-hero-banner-2.webp' : '/images/banners/agriculture-hero-banner-1.webp';
      const thumb = r.thumbnail || fallback;
      const isBoth = r.format === 'both';
      const isShort = r.format === 'short_reel' || (!isBoth && r.id.startsWith('VID_S'));

      const chObj = allChannels.find(c => c.id === r.channel_id) || allChannels[0];

      return `
        <tr class="adm-rec-drag-row" draggable="true" data-index="${actualIdx}" style="border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem; transition: all 0.2s ease;">
          <td style="padding: 10px; text-align: center; cursor: grab; user-select: none;" class="adm-drag-handle" title="ऊपर-नीचे ड्रैग करके क्रम बदलें">
            <span style="font-size: 1.2rem; color: #60a5fa; cursor: grab;">☰</span>
            <div style="font-size: 0.68rem; color: #94a3b8; font-weight: 800;">#${actualIdx + 1}</div>
          </td>
          <td style="padding: 10px;">
            <img src="${thumb}" alt="Thumb" style="width: 48px; height: ${isShort ? '64px' : '30px'}; object-fit: cover; border-radius: 4px;" onerror="this.onerror=null; this.src='${fallback}'" />
          </td>
          <td style="padding: 10px;">
            <span style="font-weight: 800; font-size: 0.72rem; background: ${isBoth ? 'linear-gradient(135deg, #10B981, #2563EB)' : (isShort ? '#F43F5E' : '#2D8CFF')}; color: #fff; padding: 2px 6px; border-radius: 4px;">
              ${isBoth ? '🌟 Both (16:9 & 9:16)' : (isShort ? '📱 9:16 Reel' : '🖥️ 16:9 Video')}
            </span>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 3px; display: flex; align-items: center; gap: 4px;">
              <span>${r.platform || 'YouTube'}</span>
              ${chObj ? `<span style="color:#ef4444;font-weight:700;">• ${chObj.handle}</span>` : ''}
            </div>
            <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
              ${r.pinned ? '<span style="font-size: 0.65rem; background: #3b82f6; color: #fff; padding: 1px 5px; border-radius: 3px; font-weight: 800;">📌 Pinned</span>' : ''}
              ${r.priority ? `<span style="font-size: 0.65rem; background: #8b5cf6; color: #fff; padding: 1px 5px; border-radius: 3px; font-weight: 700;">🔢 P:${r.priority}</span>` : ''}
            </div>
          </td>
          <td style="padding: 10px;">
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.88rem;">${r.title}</div>
            <div style="font-size: 0.74rem; color: #64748b;">${r.speaker || 'आरोग्यम विशेषज्ञ'}</div>
            ${r.description ? `<div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px; display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">${r.description}</div>` : ''}
          </td>
          <td style="padding: 10px;">
            <span style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 0.74rem; color: #cbd5e1; font-weight: 700;">
              ${r.category || 'General'}
            </span>
            <div style="color: #94a3b8; font-family: monospace; font-size: 0.75rem; margin-top: 4px;">
              ⏱️ ${r.duration || '0:58'}
            </div>
          </td>
          <td style="padding: 10px; text-align: right; white-space: nowrap;">
            <button type="button" onclick="window.moveRecordingItem(${actualIdx}, -1)" class="admin-button small-button" style="background: rgba(59,130,246,0.2); color: #60a5fa; border: 1px solid #3b82f6; padding: 4px 8px; font-weight: 800; margin-right: 3px;" title="ऊपर ले जाएं" ${actualIdx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
            <button type="button" onclick="window.moveRecordingItem(${actualIdx}, 1)" class="admin-button small-button" style="background: rgba(59,130,246,0.2); color: #60a5fa; border: 1px solid #3b82f6; padding: 4px 8px; font-weight: 800; margin-right: 6px;" title="नीचे ले जाएं" ${actualIdx === allRecordings.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
            <button type="button" onclick="window.editRecordingItem('${r.id}')" class="admin-button small-button" style="background: rgba(45,140,255,0.15); color: #60a5fa; border: 1px solid #60a5fa; padding: 4px 8px; font-weight: 800; margin-right: 4px;">✏️ एडिट</button>
            <button type="button" onclick="window.deleteRecordingItem('${r.id}')" class="admin-button small-button" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid #ef4444; padding: 4px 8px; font-weight: 800;">&times; हटाएं</button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Drag & Drop Listeners
    let dragRecSrcIdx = null;
    const rows = tbody.querySelectorAll('.adm-rec-drag-row');
    rows.forEach(row => {
      row.addEventListener('dragstart', (e) => {
        dragRecSrcIdx = Number(row.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
        row.classList.add('adm-rec-row-dragging');
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        row.classList.add('adm-rec-row-dragover');
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('adm-rec-row-dragover');
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('adm-rec-row-dragover');
        const targetIdx = Number(row.dataset.index);
        if (dragRecSrcIdx !== null && dragRecSrcIdx !== targetIdx) {
          const [movedItem] = allRecordings.splice(dragRecSrcIdx, 1);
          allRecordings.splice(targetIdx, 0, movedItem);
          saveAllRecordingsToStorageAndCloud();
          renderRecordingsTable();
          showToast('✅ वीडियो का क्रम सफलतापूर्वक बदल गया और सेव हो गया!', 'success');
        }
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('adm-rec-row-dragging');
        rows.forEach(r => r.classList.remove('adm-rec-row-dragover'));
      });
    });
  }

  // Filter toolbar event listeners
  document.getElementById('adm_rec_search')?.addEventListener('input', (e) => {
    searchFilterQuery = e.target.value.trim();
    renderRecordingsTable();
  });

  document.getElementById('adm_filter_format')?.addEventListener('change', (e) => {
    formatFilterVal = e.target.value;
    renderRecordingsTable();
  });

  document.getElementById('adm_filter_category')?.addEventListener('change', (e) => {
    categoryFilterVal = e.target.value;
    renderRecordingsTable();
  });

  document.getElementById('adm_filter_playlist')?.addEventListener('change', (e) => {
    playlistFilterVal = e.target.value;
    renderRecordingsTable();
  });

  document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
    searchFilterQuery = '';
    formatFilterVal = 'all';
    categoryFilterVal = 'all';
    playlistFilterVal = 'all';
    document.getElementById('adm_rec_search').value = '';
    document.getElementById('adm_filter_format').value = 'all';
    document.getElementById('adm_filter_category').value = 'all';
    document.getElementById('adm_filter_playlist').value = 'all';
    renderRecordingsTable();
  });

  window.moveRecordingItem = function(idx, delta) {
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= allRecordings.length) return;
    const temp = allRecordings[idx];
    allRecordings[idx] = allRecordings[targetIdx];
    allRecordings[targetIdx] = temp;
    saveAllRecordingsToStorageAndCloud();
    renderRecordingsTable();
    showToast('↕️ वीडियो का क्रम अपडेट हो गया!', 'info');
  };

  async function saveAllRecordingsToStorageAndCloud() {
    try {
      localStorage.setItem('AI_LOCAL_RECORDED_VIDEOS', JSON.stringify(allRecordings));
      localStorage.setItem('AI_LOCAL_MASTER_CATEGORIES', JSON.stringify(masterCategories));
      localStorage.setItem('AI_LOCAL_CHANNELS', JSON.stringify(allChannels));
      localStorage.setItem('AI_LOCAL_PLAYLISTS', JSON.stringify(allPlaylists));
    } catch(e) {}

    const payload = {
      recordings: allRecordings,
      channels: allChannels,
      master_categories: masterCategories,
      playlists: allPlaylists
    };

    try {
      fetch('/save-recordings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetch('/api/auto-sync-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_webinar_recordings', ...payload })
      });
    } catch(err) {}
  }

  // -------------------------------------------------------------
  // VIDEO EDITOR DRAWER LOGIC
  // -------------------------------------------------------------
  const videoDrawer = document.getElementById('drawer-video-editor');
  const recUrlInput = document.getElementById('drawer_rec_url');
  const recTitleInput = document.getElementById('drawer_rec_title');
  const recSpeakerInput = document.getElementById('drawer_rec_speaker');
  const recDurationInput = document.getElementById('drawer_rec_duration');
  const recCategorySelect = document.getElementById('drawer_rec_category');
  const recCustomCategoryInput = document.getElementById('drawer_rec_custom_category');
  const recThumbTypeSelect = document.getElementById('drawer_rec_thumb_type');
  const recCustomThumbUrl = document.getElementById('drawer_rec_custom_thumb_url');
  const recCustomThumbFile = document.getElementById('drawer_rec_custom_thumb_file');
  const recPreviewImg = document.getElementById('drawer_rec_preview_img');
  const recPreviewTitle = document.getElementById('drawer_rec_preview_title');
  const recPreviewMeta = document.getElementById('drawer_rec_preview_meta');

  function updateVideoDrawerLivePreview() {
    const url = (recUrlInput?.value || '').trim();
    const title = (recTitleInput?.value || '').trim() || 'शीर्षक यहाँ दिखेगा...';
    const speaker = (recSpeakerInput?.value || '').trim() || 'आरोग्यम विशेषज्ञ';
    const duration = (recDurationInput?.value || '').trim() || '45:00';
    const thumbType = recThumbTypeSelect?.value || 'auto';

    if (recPreviewTitle) recPreviewTitle.textContent = title;
    if (recPreviewMeta) recPreviewMeta.textContent = `${speaker} • ${duration}`;

    let resolvedThumb = '/images/banners/aarogyamtube-default-thumb.svg';
    if (thumbType === 'aarogyamtube_mono') {
      resolvedThumb = '/images/banners/aarogyamtube-default-thumb.svg';
    } else if (thumbType === 'custom_url' && recCustomThumbUrl?.value?.trim()) {
      resolvedThumb = recCustomThumbUrl.value.trim();
    } else if (thumbType === 'auto') {
      const ytMatch = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|shorts\\/|live\\/|watch\\?v=|watch\\?.+&v=))([a-zA-Z0-9_-]{11})/i);
      if (ytMatch && ytMatch[1]) {
        resolvedThumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      } else if (url.includes('instagram.com')) {
        resolvedThumb = '/images/banners/agriculture-hero-banner-2.webp';
      }
    }

    if (recPreviewImg) recPreviewImg.src = resolvedThumb;
  }

  recUrlInput?.addEventListener('input', () => {
    const url = recUrlInput.value.trim();
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      document.getElementById('drawer_rec_platform').value = 'youtube';
      if (url.includes('/shorts/')) {
        document.getElementById('drawer_rec_format').value = 'short_reel';
        document.getElementById('drawer_rec_duration').value = '0:58';
      }
    } else if (url.includes('instagram.com')) {
      document.getElementById('drawer_rec_platform').value = 'instagram';
      document.getElementById('drawer_rec_format').value = 'short_reel';
    } else if (url.includes('facebook.com')) {
      document.getElementById('drawer_rec_platform').value = 'facebook';
    }
    updateVideoDrawerLivePreview();
  });

  recTitleInput?.addEventListener('input', updateVideoDrawerLivePreview);
  recSpeakerInput?.addEventListener('input', updateVideoDrawerLivePreview);
  recDurationInput?.addEventListener('input', updateVideoDrawerLivePreview);

  recCategorySelect?.addEventListener('change', () => {
    if (recCategorySelect.value === 'custom') {
      if (recCustomCategoryInput) recCustomCategoryInput.style.display = 'block';
    } else {
      if (recCustomCategoryInput) recCustomCategoryInput.style.display = 'none';
    }
  });

  recThumbTypeSelect?.addEventListener('change', () => {
    const val = recThumbTypeSelect.value;
    if (recCustomThumbUrl) recCustomThumbUrl.style.display = val === 'custom_url' ? 'block' : 'none';
    if (recCustomThumbFile) recCustomThumbFile.style.display = val === 'custom_upload' ? 'block' : 'none';
    updateVideoDrawerLivePreview();
  });

  recCustomThumbUrl?.addEventListener('input', updateVideoDrawerLivePreview);
  recCustomThumbFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        if (recPreviewImg) recPreviewImg.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  window.editRecordingItem = function (rId) {
    const item = allRecordings.find(x => x.id === rId);
    if (!item) return;
    editingRecordingId = rId;

    document.getElementById('drawer-video-title').textContent = '✏️ वीडियो / रील एडिट करें';
    document.getElementById('drawer_rec_format').value = item.format || (item.id.startsWith('VID_S') ? 'short_reel' : 'full_video');
    document.getElementById('drawer_rec_platform').value = item.platform || 'youtube';
    document.getElementById('drawer_rec_channel').value = item.channel_id || allChannels[0]?.id || '';
    document.getElementById('drawer_rec_url').value = item.video_url || item.youtube_url || '';
    document.getElementById('drawer_rec_title').value = item.title || '';
    document.getElementById('drawer_rec_desc').value = item.description || '';
    document.getElementById('drawer_rec_duration').value = item.duration || '45:00';
    document.getElementById('drawer_rec_speaker').value = item.speaker || 'आरोग्यम कृषि विशेषज्ञ';
    document.getElementById('drawer_rec_access').value = item.access_tier || 'all';

    const pinnedCb = document.getElementById('drawer_rec_pinned');
    const priorityInp = document.getElementById('drawer_rec_priority');
    const orderTypeSel = document.getElementById('drawer_rec_order_type');
    if (pinnedCb) pinnedCb.checked = Boolean(item.pinned);
    if (priorityInp) priorityInp.value = item.priority || (item.pinned ? 100 : 50);
    if (orderTypeSel) orderTypeSel.value = item.order_type || (item.pinned ? 'pinned' : 'normal');

    // Playlist assignment check
    const plSel = document.getElementById('drawer_rec_playlist');
    if (plSel) {
      const assignedPl = allPlaylists.find(p => p.video_ids && p.video_ids.includes(rId));
      plSel.value = assignedPl ? assignedPl.id : '';
    }

    const catSelect = document.getElementById('drawer_rec_category');
    const customCatInput = document.getElementById('drawer_rec_custom_category');
    const existingOptions = Array.from(catSelect.options).map(o => o.value);

    if (existingOptions.includes(item.category)) {
      catSelect.value = item.category;
      if (customCatInput) customCatInput.style.display = 'none';
    } else {
      catSelect.value = 'custom';
      if (customCatInput) {
        customCatInput.style.display = 'block';
        customCatInput.value = item.category || '';
      }
    }

    const thumbTypeSelect = document.getElementById('drawer_rec_thumb_type');
    const customThumbUrlInput = document.getElementById('drawer_rec_custom_thumb_url');
    if (item.thumbnail && item.thumbnail.includes('aarogyamtube-default-thumb')) {
      thumbTypeSelect.value = 'aarogyamtube_mono';
      if (customThumbUrlInput) customThumbUrlInput.style.display = 'none';
    } else if (item.thumbnail && (item.thumbnail.startsWith('http') || item.thumbnail.startsWith('data:'))) {
      thumbTypeSelect.value = 'custom_url';
      if (customThumbUrlInput) {
        customThumbUrlInput.style.display = 'block';
        customThumbUrlInput.value = item.thumbnail;
      }
    } else {
      thumbTypeSelect.value = 'auto';
      if (customThumbUrlInput) customThumbUrlInput.style.display = 'none';
    }

    updateVideoDrawerLivePreview();
    if (videoDrawer) videoDrawer.classList.add('active');
  };

  window.deleteRecordingItem = async function (rId) {
    if (!confirm('क्या आप वाकई इस वीडियो / रील को हटाना चाहते हैं?')) return;
    allRecordings = allRecordings.filter(x => x.id !== rId);

    // Remove from playlists if present
    allPlaylists.forEach(pl => {
      if (pl.video_ids) pl.video_ids = pl.video_ids.filter(id => id !== rId);
    });

    saveAllRecordingsToStorageAndCloud();
    renderRecordingsTable();
    showToast('🗑️ वीडियो हटा दिया गया!', 'info');
  };

  document.getElementById('btn-open-add-video-modal')?.addEventListener('click', () => {
    editingRecordingId = null;
    document.getElementById('form-video-drawer')?.reset();
    document.getElementById('drawer-video-title').textContent = '🎬 नई रील / वीडियो जोड़ें';
    if (recCustomCategoryInput) recCustomCategoryInput.style.display = 'none';
    if (recCustomThumbUrl) recCustomThumbUrl.style.display = 'none';
    if (recCustomThumbFile) recCustomThumbFile.style.display = 'none';
    populateCategoryAndPlaylistDropdowns();
    updateVideoDrawerLivePreview();
    if (videoDrawer) videoDrawer.classList.add('active');
  });

  document.getElementById('btn-close-video-drawer')?.addEventListener('click', () => {
    if (videoDrawer) videoDrawer.classList.remove('active');
  });

  // Submit Video Drawer Form
  document.getElementById('form-video-drawer')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const format = document.getElementById('drawer_rec_format')?.value || 'both';
    const platform = document.getElementById('drawer_rec_platform')?.value || 'youtube';
    const channelId = document.getElementById('drawer_rec_channel')?.value || allChannels[0]?.id || 'CH_AAROGYAM_MAIN';
    const url = (document.getElementById('drawer_rec_url')?.value || '').trim();
    const title = (document.getElementById('drawer_rec_title')?.value || '').trim();
    const desc = (document.getElementById('drawer_rec_desc')?.value || '').trim();

    let category = document.getElementById('drawer_rec_category')?.value || 'Organic Farming';
    if (category === 'custom') {
      const customCat = (document.getElementById('drawer_rec_custom_category')?.value || '').trim();
      if (customCat) {
        category = customCat;
        // Auto-save category into masterCategories array
        if (!masterCategories.includes(customCat)) {
          masterCategories.push(customCat);
        }
      } else {
        category = 'General';
      }
    }

    const duration = (document.getElementById('drawer_rec_duration')?.value || '').trim() || (format === 'short_reel' ? '0:58' : '45:00');
    const speaker = (document.getElementById('drawer_rec_speaker')?.value || '').trim() || 'आरोग्यम कृषि विशेषज्ञ';
    const accessTier = document.getElementById('drawer_rec_access')?.value || 'all';

    const isPinned = Boolean(document.getElementById('drawer_rec_pinned')?.checked);
    const priorityVal = Number(document.getElementById('drawer_rec_priority')?.value || (isPinned ? 100 : 50));
    const orderTypeVal = document.getElementById('drawer_rec_order_type')?.value || (isPinned ? 'pinned' : 'normal');

    if (!url || !title) {
      alert('कृपया URL लिंक और शीर्षक भरें।');
      return;
    }

    const ytMatch = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|shorts\\/|live\\/|watch\\?v=|watch\\?.+&v=))([a-zA-Z0-9_-]{11})/i);
    const ytId = ytMatch ? ytMatch[1] : '';

    let thumb = recPreviewImg?.src || '/images/banners/aarogyamtube-default-thumb.svg';
    if (thumb.startsWith('data:') === false && !thumb.includes('http') && !thumb.startsWith('/')) {
      thumb = '/images/banners/aarogyamtube-default-thumb.svg';
    }

    const newRecId = editingRecordingId || ((format === 'short_reel' ? 'VID_S' : 'VID_') + String(Date.now()).slice(-6));

    const recObj = {
      id: newRecId,
      format: format,
      platform: platform,
      channel_id: channelId,
      title: title,
      description: desc,
      subject: category,
      category: category,
      video_url: url,
      youtube_url: url,
      youtube_id: ytId,
      thumbnail: thumb,
      duration: duration,
      speaker: speaker,
      access_tier: accessTier,
      pinned: isPinned,
      priority: priorityVal,
      order_type: orderTypeVal,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const exIdx = allRecordings.findIndex(x => x.id === recObj.id);
    if (exIdx !== -1) {
      allRecordings[exIdx] = recObj;
    } else {
      allRecordings.unshift(recObj);
    }

    // Playlist assignment handling
    const selectedPlaylistId = document.getElementById('drawer_rec_playlist')?.value;
    allPlaylists.forEach(pl => {
      if (!pl.video_ids) pl.video_ids = [];
      if (pl.id === selectedPlaylistId) {
        if (!pl.video_ids.includes(newRecId)) pl.video_ids.push(newRecId);
      } else {
        pl.video_ids = pl.video_ids.filter(id => id !== newRecId);
      }
    });

    saveAllRecordingsToStorageAndCloud();
    populateCategoryAndPlaylistDropdowns();
    renderRecordingsTable();

    if (videoDrawer) videoDrawer.classList.remove('active');
    showToast(`🎉 ${format === 'both' ? 'Dual-Format वीडियो' : (format === 'short_reel' ? 'रील' : 'मास्टरक्लास')} सफलतापूर्वक सुरक्षित हो गई!`, 'success');
  });

  // -------------------------------------------------------------
  // CHANNELS PRESET MANAGER LOGIC
  // -------------------------------------------------------------
  const channelsDrawer = document.getElementById('drawer-channels-manager');

  function renderChannelsManagerList() {
    const cont = document.getElementById('adm_channels_list_container');
    if (!cont) return;

    cont.innerHTML = allChannels.map((ch, idx) => `
      <div style="background: #1e293b; border: 1.5px solid #334155; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #fff; font-size: 0.9rem;">${ch.name}</strong>
          <div style="display: flex; gap: 6px; align-items: center;">
            ${ch.is_default ? '<span style="font-size:0.7rem; background:#10B981; color:#fff; padding:2px 6px; border-radius:4px; font-weight:700;">🌟 Default</span>' : `<button type="button" onclick="window.setDefaultChannel('${ch.id}')" class="admin-button small-button" style="background:rgba(255,255,255,0.1); color:#94a3b8; font-size:0.7rem;">Make Default</button>`}
            <button type="button" onclick="window.removeChannelPreset(${idx})" class="admin-button small-button" style="background: #ef4444; color: #fff; padding: 2px 6px; font-size: 0.7rem;">&times;</button>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div>
            <label class="admin-label">चैनल का नाम:</label>
            <input type="text" class="admin-input ch-name-inp" data-idx="${idx}" value="${ch.name}" style="width: 100%; font-size: 0.8rem;" />
          </div>
          <div>
            <label class="admin-label">Handle (उदा. @AAROGYAMINDIA):</label>
            <input type="text" class="admin-input ch-handle-inp" data-idx="${idx}" value="${ch.handle}" style="width: 100%; font-size: 0.8rem; font-weight:700; color:#ef4444;" />
          </div>
        </div>
        <div>
          <label class="admin-label">Direct Channel Subscribe URL:</label>
          <input type="url" class="admin-input ch-sub-inp" data-idx="${idx}" value="${ch.subscribe_url || `https://www.youtube.com/${ch.handle}?sub_confirmation=1`}" style="width: 100%; font-size: 0.78rem;" />
        </div>
      </div>
    `).join('');
  }

  window.setDefaultChannel = (chId) => {
    allChannels.forEach(c => { c.is_default = (c.id === chId); });
    renderChannelsManagerList();
    saveAllRecordingsToStorageAndCloud();
  };

  window.removeChannelPreset = (idx) => {
    if (allChannels.length <= 1) {
      alert('कम से कम 1 चैनल होना अनिवार्य है।');
      return;
    }
    allChannels.splice(idx, 1);
    renderChannelsManagerList();
  };

  document.getElementById('btn-add-new-channel-row')?.addEventListener('click', () => {
    allChannels.push({
      id: 'CH_' + String(Date.now()).slice(-6),
      name: 'नया YouTube चैनल',
      handle: '@AAROGYAMINDIA',
      url: 'https://www.youtube.com/@AAROGYAMINDIA',
      subscribe_url: 'https://www.youtube.com/@AAROGYAMINDIA?sub_confirmation=1',
      avatar: '/images/logo/logo.png',
      is_default: false
    });
    renderChannelsManagerList();
  });

  document.getElementById('btn-open-channels-modal')?.addEventListener('click', () => {
    renderChannelsManagerList();
    if (channelsDrawer) channelsDrawer.classList.add('active');
  });

  document.getElementById('btn-drawer-add-new-ch')?.addEventListener('click', () => {
    renderChannelsManagerList();
    if (channelsDrawer) channelsDrawer.classList.add('active');
  });

  document.getElementById('btn-close-channels-drawer')?.addEventListener('click', () => {
    if (channelsDrawer) channelsDrawer.classList.remove('active');
  });

  document.getElementById('btn-save-channels-data')?.addEventListener('click', () => {
    document.querySelectorAll('.ch-name-inp').forEach(inp => {
      const idx = Number(inp.dataset.idx);
      if (allChannels[idx]) allChannels[idx].name = inp.value.trim();
    });
    document.querySelectorAll('.ch-handle-inp').forEach(inp => {
      const idx = Number(inp.dataset.idx);
      if (allChannels[idx]) {
        let h = inp.value.trim();
        if (!h.startsWith('@')) h = '@' + h;
        allChannels[idx].handle = h;
      }
    });
    document.querySelectorAll('.ch-sub-inp').forEach(inp => {
      const idx = Number(inp.dataset.idx);
      if (allChannels[idx]) allChannels[idx].subscribe_url = inp.value.trim();
    });

    saveAllRecordingsToStorageAndCloud();
    populateCategoryAndPlaylistDropdowns();
    if (channelsDrawer) channelsDrawer.classList.remove('active');
    showToast('✅ YouTube चैनल्स सफलतापूर्वक सेव हो गए!', 'success');
  });

  // -------------------------------------------------------------
  // PLAYLISTS MANAGER LOGIC
  // -------------------------------------------------------------
  const playlistsDrawer = document.getElementById('drawer-playlists-manager');

  function renderPlaylistsManagerList() {
    const cont = document.getElementById('adm_playlists_list_container');
    if (!cont) return;

    cont.innerHTML = allPlaylists.map((pl, idx) => {
      const count = pl.video_ids ? pl.video_ids.length : 0;
      return `
        <div style="background: #1e293b; border: 1.5px solid #8b5cf6; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #c4b5fd; font-size: 0.95rem;">${pl.title}</strong>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size:0.72rem; background:rgba(139,92,246,0.3); color:#fff; padding:2px 6px; border-radius:4px;">${count} Videos</span>
              <button type="button" onclick="window.removePlaylistPreset(${idx})" class="admin-button small-button" style="background: #ef4444; color: #fff; padding: 2px 6px; font-size: 0.7rem;">&times;</button>
            </div>
          </div>
          <div>
            <label class="admin-label">प्लेलिस्ट का शीर्षक:</label>
            <input type="text" class="admin-input pl-title-inp" data-idx="${idx}" value="${pl.title}" style="width: 100%; font-size: 0.85rem; font-weight:700;" />
          </div>
          <div>
            <label class="admin-label">संक्षिप्त विवरण (Description):</label>
            <textarea class="admin-input pl-desc-inp" data-idx="${idx}" rows="2" style="width: 100%; font-size: 0.8rem;">${pl.description || ''}</textarea>
          </div>
          <div>
            <label class="admin-label">कवर थंबनेल URL:</label>
            <input type="url" class="admin-input pl-cover-inp" data-idx="${idx}" value="${pl.cover || ''}" placeholder="https://..." style="width: 100%; font-size: 0.78rem;" />
          </div>
        </div>
      `;
    }).join('');
  }

  window.removePlaylistPreset = (idx) => {
    if (!confirm('क्या आप इस प्लेलिस्ट को हटाना चाहते हैं?')) return;
    allPlaylists.splice(idx, 1);
    renderPlaylistsManagerList();
  };

  document.getElementById('btn-add-new-playlist-row')?.addEventListener('click', () => {
    allPlaylists.push({
      id: 'PL_' + String(Date.now()).slice(-6),
      title: 'नई कृषि प्लेलिस्ट',
      description: 'कृषि वीडियो श्रृंखला',
      cover: 'https://img.youtube.com/vi/2JYn-bcDLuU/hqdefault.jpg',
      video_ids: []
    });
    renderPlaylistsManagerList();
  });

  document.getElementById('btn-open-playlists-modal')?.addEventListener('click', () => {
    renderPlaylistsManagerList();
    if (playlistsDrawer) playlistsDrawer.classList.add('active');
  });

  document.getElementById('btn-close-playlists-drawer')?.addEventListener('click', () => {
    if (playlistsDrawer) playlistsDrawer.classList.remove('active');
  });

  document.getElementById('btn-save-playlists-data')?.addEventListener('click', () => {
    document.querySelectorAll('.pl-title-inp').forEach(inp => {
      const idx = Number(inp.dataset.idx);
      if (allPlaylists[idx]) allPlaylists[idx].title = inp.value.trim();
    });
    document.querySelectorAll('.pl-desc-inp').forEach(inp => {
      const idx = Number(inp.dataset.idx);
      if (allPlaylists[idx]) allPlaylists[idx].description = inp.value.trim();
    });
    document.querySelectorAll('.pl-cover-inp').forEach(inp => {
      const idx = Number(inp.dataset.idx);
      if (allPlaylists[idx]) allPlaylists[idx].cover = inp.value.trim();
    });

    saveAllRecordingsToStorageAndCloud();
    populateCategoryAndPlaylistDropdowns();
    if (playlistsDrawer) playlistsDrawer.classList.remove('active');
    showToast('✅ प्लेलिस्ट्स सफलतापूर्वक सुरक्षित हो गईं!', 'success');
  });

  // -------------------------------------------------------------
  // EXPORT JSON & REFRESH
  // -------------------------------------------------------------
  function exportWebinarMasterJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ webinarMaster: masterWebinar }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "webinar-master.json");
    dlAnchor.click();
  }

  function exportWebinarRecordingsJson() {
    const payload = {
      recordings: allRecordings,
      channels: allChannels,
      master_categories: masterCategories,
      playlists: allPlaylists
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "webinar-recordings.json");
    dlAnchor.click();
  }

  document.getElementById('btn-export-json-files')?.addEventListener('click', () => {
    exportWebinarMasterJson();
    setTimeout(exportWebinarRecordingsJson, 500);
    showToast('📥 दोनों JSON फ़ाइलें डाउनलोड हो गईं!', 'success');
  });

  document.getElementById('btn-wb-refresh')?.addEventListener('click', () => {
    loadData();
    showToast('🔄 डेटा रीफ्रेश हो गया!', 'info');
  });

  // Tabs switching
  const btnTabWb = document.getElementById('tab-btn-webinar');
  const btnTabReels = document.getElementById('tab-btn-reels');
  const paneWb = document.getElementById('tab-pane-webinar');
  const paneReels = document.getElementById('tab-pane-reels');

  btnTabWb?.addEventListener('click', () => {
    btnTabWb.style.background = '#2D8CFF';
    btnTabWb.style.color = '#fff';
    btnTabReels.style.background = 'var(--admin-surface)';
    btnTabReels.style.color = 'var(--admin-text)';
    paneWb.style.display = 'block';
    paneReels.style.display = 'none';
  });

  btnTabReels?.addEventListener('click', () => {
    btnTabReels.style.background = '#F43F5E';
    btnTabReels.style.color = '#fff';
    btnTabWb.style.background = 'var(--admin-surface)';
    btnTabWb.style.color = 'var(--admin-text)';
    paneReels.style.display = 'block';
    paneWb.style.display = 'none';
  });

  // Initial load
  loadData();
}