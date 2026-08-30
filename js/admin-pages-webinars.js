/* ==========================================================================
   AAROGYAM INDIA — UNIVERSAL WEBINAR & AAROGYAMTUBE ADMIN HUB (V30.0)
   Features:
   - 1-Form Master Zoom Webinar & Live Countdown Manager
   - Live 3D Cover Image Preview & OG Social Card Live Preview
   - Drag & Drop Section Placement System (Up/Down Controls)
   - Unified AarogyamTube Videos & Reels Manager (YouTube, Insta, Facebook)
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
  let editingRecordingId = null;

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
    <!-- Top Action Header -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📹 Universal Webinar & AarogyamTube Hub</span>
            <span style="font-size: 0.75rem; background: rgba(45,140,255,0.15); color: #2D8CFF; padding: 2px 8px; border-radius: 12px; font-weight: 700;">PRO V30</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 4px 0 0 0;">
            लाइव ज़ूम वेबिनार, 3D कवर, AarogyamTube रील्स एवं सोशल शेयरिंग को 1-क्लिक में कंट्रोल करें।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/webinar.html" target="_blank" class="admin-button small-button" style="background: #2D8CFF; color: #fff; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <span>👁️</span> <span>लाइव वेबिनार पेज देखें</span>
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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 4px;">
            🎬 AarogyamTube वीडियो एवं रील्स लाइब्रेरी
          </h3>
          <p style="font-size: 0.82rem; color: var(--admin-muted); margin: 0;">
            YouTube Shorts, Instagram Reels, Facebook Reels एवं 16:9 मास्टरक्लास जोड़ें।
          </p>
        </div>
        <button type="button" id="btn-open-add-video-modal" class="admin-button" style="background: #F43F5E; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
          <span>+ नई रील / वीडियो जोड़ें</span>
        </button>
      </div>

      <!-- Videos & Reels Table -->
      <div style="overflow-x: auto; background: #0f172a; border-radius: 8px; border: 1px solid var(--admin-border);">
        <table class="admin-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--admin-border); text-align: left; font-size: 0.8rem; color: var(--admin-muted);">
              <th style="padding: 10px;">थंबनेल</th>
              <th style="padding: 10px;">फॉर्मेट / प्लेटफॉर्म</th>
              <th style="padding: 10px;">शीर्षक एवं विषय</th>
              <th style="padding: 10px;">अवधि</th>
              <th style="padding: 10px; text-align: right;">एक्शन</th>
            </tr>
          </thead>
          <tbody id="adm_recordings_tbody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: ADD / EDIT VIDEO OR REEL -->
    <div id="modal-video-editor" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 16px;">
      <div style="background: #1e293b; border: 1.5px solid #334155; border-radius: 12px; max-width: 540px; width: 100%; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="font-weight: 800; font-size: 1.1rem; color: #fff;" id="modal-video-title">
            🎬 नई रील / वीडियो जोड़ें
          </h4>
          <button type="button" id="btn-close-video-modal" style="background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer;">&times;</button>
        </div>

        <form id="form-video-editor">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="admin-label">फॉर्मेट (Format): *</label>
                <select id="modal_rec_format" class="admin-select" style="width: 100%;">
                  <option value="short_reel">📱 9:16 Short / Reel (रील)</option>
                  <option value="full_video">🖥️ 16:9 Masterclass (फुल वीडियो)</option>
                </select>
              </div>
              <div>
                <label class="admin-label">प्लेटफॉर्म (Platform): *</label>
                <select id="modal_rec_platform" class="admin-select" style="width: 100%;">
                  <option value="youtube">🔴 YouTube (Shorts/Video)</option>
                  <option value="instagram">📷 Instagram (Reel)</option>
                  <option value="facebook">📘 Facebook (Reel/Watch)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="admin-label">Video / Reel URL Link: *</label>
              <input type="url" id="modal_rec_url" class="admin-input" placeholder="https://youtube.com/shorts/... या https://instagram.com/reel/..." required style="width: 100%;" />
            </div>

            <div>
              <label class="admin-label">रील / वीडियो का शीर्षक (Title): *</label>
              <input type="text" id="modal_rec_title" class="admin-input" placeholder="उदा. सोयाबीन में इल्ली का 1-स्प्रे रामबाण इलाज" required style="width: 100%;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="admin-label">विषय / श्रेणी (Category):</label>
                <select id="modal_rec_category" class="admin-select" style="width: 100%;">
                  <option value="Crop Protection">कीट व रोग नियंत्रण</option>
                  <option value="Organic Farming">जैविक कृषि</option>
                  <option value="Irrigation Tech">सिंचाई व पोषण</option>
                  <option value="Shorts & Reels">Shorts & Reels</option>
                </select>
              </div>
              <div>
                <label class="admin-label">अवधि (Duration):</label>
                <input type="text" id="modal_rec_duration" class="admin-input" placeholder="उदा. 0:58 या 45 मिनट" value="0:58" style="width: 100%;" />
              </div>
            </div>

            <div>
              <label class="admin-label">विशेषज्ञ / वक्ता (Speaker):</label>
              <input type="text" id="modal_rec_speaker" class="admin-input" placeholder="उदा. डॉ. बी.के. शर्मा (फसल डॉक्टर)" value="आरोग्यम कृषि विशेषज्ञ" style="width: 100%;" />
            </div>

            <div style="margin-top: 8px;">
              <button type="submit" id="btn-save-video-entry" class="admin-button" style="background: #F43F5E; color: #fff; width: 100%; font-weight: 800; padding: 12px;">
                <span>💾 वीडियो सेव करें (Save Video)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  // -------------------------------------------------------------
  // INITIALIZE DATA & EVENT BINDINGS
  // -------------------------------------------------------------
  async function loadData() {
    // 1. Master JSON
    try {
      const resp = await fetch('/data/webinar-master.json?v=' + Date.now());
      if (resp.ok) {
        const json = await resp.json();
        const wm = json.webinarMaster || json || {};
        if (wm.title) masterWebinar = { ...masterWebinar, ...wm };
      }
    } catch (e) {}

    // Overlay Direct LocalStorage (Instant Live Binding)
    try {
      const directStored = localStorage.getItem('AAROGYAM_WEBINAR_MASTER');
      if (directStored) {
        const parsed = JSON.parse(directStored);
        if (parsed && parsed.title) masterWebinar = { ...masterWebinar, ...parsed };
      }
    } catch (e) {}

    try {
      const localStored = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
      const match = localStored.find(p => p.id === 'WB_MASTER' || p.category === 'webinar');
      if (match && match.webinar_data) {
        masterWebinar = { ...masterWebinar, ...match.webinar_data, title: match.title || masterWebinar.title };
      }
    } catch (e) {}

    // 2. Recordings JSON
    try {
      const rResp = await fetch('/data/webinar-recordings.json?v=' + Date.now());
      if (rResp.ok) {
        const rJson = await rResp.json();
        const list = Array.isArray(rJson.recordings) ? rJson.recordings : (Array.isArray(rJson) ? rJson : []);
        if (list.length > 0) allRecordings = list;
      }
    } catch (e) {}

    // Overlay LocalStorage recordings
    try {
      const directRecs = JSON.parse(localStorage.getItem('AAROGYAM_WEBINAR_RECORDINGS') || '[]');
      if (Array.isArray(directRecs) && directRecs.length > 0) {
        directRecs.forEach(dr => {
          const exIdx = allRecordings.findIndex(x => x.id === dr.id);
          if (exIdx !== -1) allRecordings[exIdx] = dr;
          else allRecordings.unshift(dr);
        });
      }
    } catch (e) {}

    try {
      const localRecs = JSON.parse(localStorage.getItem('AI_LOCAL_RECORDED_VIDEOS') || '[]');
      if (Array.isArray(localRecs) && localRecs.length > 0) {
        localRecs.forEach(lr => {
          const exIdx = allRecordings.findIndex(x => x.id === lr.id);
          if (exIdx !== -1) allRecordings[exIdx] = lr;
          else allRecordings.unshift(lr);
        });
      }
    } catch (e) {}

    populateMasterWebinarForm();
    renderSectionsList();
    renderKpisList();
    renderFaqsList();
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

    // Cover Image
    const coverUrl = masterWebinar.cover_image || '/images/banners/agriculture-hero-banner-1.webp';
    const previewEl = document.getElementById('adm_cover_live_preview');
    if (previewEl) previewEl.src = coverUrl;

    // OG Metadata
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

  // OG Image Selector & Uploader
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

  // Cover Image Selector & Uploader
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

  fileInp?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        masterWebinar.cover_image = re.target.result;
        if (previewImg) previewImg.src = re.target.result;
        showToast('📸 3D कवर इमेज लोड हो गई!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  // -------------------------------------------------------------
  // SECTIONS REORDERING (DRAG & UP/DOWN BUTTONS)
  // -------------------------------------------------------------
  function renderSectionsList() {
    const cont = document.getElementById('adm_sections_order_container');
    if (!cont) return;

    const order = masterWebinar.section_order || defaultSections.map(s => s.key);

    cont.innerHTML = order.map((sKey, idx) => {
      const meta = defaultSections.find(s => s.key === sKey) || { key: sKey, name: sKey, desc: '' };
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px 12px;">
          <div>
            <div style="font-weight: 700; font-size: 0.85rem; color: #e2e8f0;">${meta.name}</div>
            <div style="font-size: 0.72rem; color: #64748b;">${meta.desc}</div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button type="button" onclick="window.moveWbSection(${idx}, -1)" class="admin-button small-button" style="background: rgba(255,255,255,0.1); padding: 2px 8px;" title="ऊपर करें">⬆️</button>
            <button type="button" onclick="window.moveWbSection(${idx}, 1)" class="admin-button small-button" style="background: rgba(255,255,255,0.1); padding: 2px 8px;" title="नीचे करें">⬇️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.moveWbSection = function(idx, delta) {
    const order = masterWebinar.section_order || defaultSections.map(s => s.key);
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const temp = order[idx];
    order[idx] = order[targetIdx];
    order[targetIdx] = temp;
    masterWebinar.section_order = order;
    renderSectionsList();
    showToast('↕️ सेक्शन का क्रम बदला गया', 'info');
  };

  document.getElementById('btn-reset-sections-order')?.addEventListener('click', () => {
    masterWebinar.section_order = defaultSections.map(s => s.key);
    renderSectionsList();
    showToast('↺ डिफ़ॉल्ट सेक्शन क्रम रीसेट हो गया!', 'info');
  });

  // -------------------------------------------------------------
  // KPIS & FAQS MANAGERS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // SAVE MASTER WEBINAR FORM
  // -------------------------------------------------------------
  document.getElementById('form-master-webinar')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-master-webinar');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ सुरक्षित हो रहा है...';
    }

    // Read form values
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

    // Read KPIs
    masterWebinar.kpis = Array.from(document.querySelectorAll('.adm-kpi-input')).map(el => el.value.trim()).filter(Boolean);

    // Read FAQs
    const faqs = [];
    document.querySelectorAll('#adm_faqs_container > div').forEach(row => {
      const q = (row.querySelector('.adm-faq-q')?.value || '').trim();
      const a = (row.querySelector('.adm-faq-a')?.value || '').trim();
      if (q && a) faqs.push({ q, a });
    });
    masterWebinar.faqs = faqs;

    // 1. Direct LocalStorage Persistence (Instant Live Binding)
    try {
      localStorage.setItem('AAROGYAM_WEBINAR_MASTER', JSON.stringify(masterWebinar));
      let localPages = JSON.parse(localStorage.getItem('UCAS_LOCAL_LANDING_PAGES') || '[]');
      const exIdx = localPages.findIndex(p => p.id === 'WB_MASTER');
      const payload = {
        id: 'WB_MASTER',
        title: masterWebinar.title,
        message: masterWebinar.description,
        category: 'webinar',
        status: 'active',
        webinar_data: masterWebinar
      };
      if (exIdx !== -1) localPages[exIdx] = payload;
      else localPages.unshift(payload);
      localStorage.setItem('UCAS_LOCAL_LANDING_PAGES', JSON.stringify(localPages));
    } catch (e) {}

    // 2. Permanent Supabase Cloud Sync
    const db = getSupabaseDb();
    if (db) {
      try {
        await db.from('landing_pages').upsert([{
          id: 'WB_MASTER',
          title: masterWebinar.title,
          message: masterWebinar.description,
          category: 'webinar',
          status: 'active',
          webinar_data: masterWebinar
        }]);
      } catch (err) {
        console.warn('Supabase webinar sync notice:', err);
      }
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = '💾 वेबिनार सेटिंग्स सेव करें (Save & Sync)';
    }

    showToast('✅ वेबिनार सेटिंग्स सुरक्षित हो गईं!', 'success');
  });

  function exportWebinarMasterJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ webinarMaster: masterWebinar }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "webinar-master.json");
    dlAnchor.click();
  }

  // -------------------------------------------------------------
  // AAROGYAMTUBE VIDEOS & REELS MANAGER
  // -------------------------------------------------------------
  function renderRecordingsTable() {
    const tbody = document.getElementById('adm_recordings_tbody');
    const badge = document.getElementById('reels-count-badge');
    if (badge) badge.textContent = allRecordings.length;
    if (!tbody) return;

    if (allRecordings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px; color: var(--admin-muted);">
            लाइब्रेरी में अभी कोई वीडियो या रील नहीं है। ऊपर दिए '+ नई रील / वीडियो जोड़ें' बटन से जोड़ें।
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = allRecordings.map((r, idx) => {
      const fallback = r.platform === 'instagram' ? '/images/banners/agriculture-hero-banner-2.webp' : '/images/banners/agriculture-hero-banner-1.webp';
      const thumb = r.thumbnail || fallback;
      const isShort = r.format === 'short_reel' || r.id.startsWith('VID_S');

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem;">
          <td style="padding: 10px;">
            <img src="${thumb}" alt="Thumb" style="width: 44px; height: ${isShort ? '60px' : '28px'}; object-fit: cover; border-radius: 4px;" onerror="this.onerror=null; this.src='${fallback}'" />
          </td>
          <td style="padding: 10px;">
            <span style="font-weight: 800; font-size: 0.75rem; background: ${isShort ? '#F43F5E' : '#2D8CFF'}; color: #fff; padding: 2px 6px; border-radius: 4px;">
              ${isShort ? '9:16 Reel' : '16:9 Video'}
            </span>
            <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; margin-top: 2px;">
              ${r.platform || 'YouTube'}
            </div>
          </td>
          <td style="padding: 10px;">
            <div style="font-weight: 700; color: #f8fafc;">${r.title}</div>
            <div style="font-size: 0.75rem; color: #64748b;">${r.speaker || 'आरोग्यम विशेषज्ञ'} • ${r.category || 'General'}</div>
          </td>
          <td style="padding: 10px; color: #94a3b8; font-family: monospace;">
            ${r.duration || '0:58'}
          </td>
          <td style="padding: 10px; text-align: right;">
            <button type="button" onclick="window.deleteRecordingItem('${r.id}')" class="admin-button small-button" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid #ef4444; padding: 4px 8px; font-weight: 800;">
              &times; हटाएं
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.deleteRecordingItem = async function(rId) {
    if (!confirm('क्या आप वाकई इस वीडियो / रील को हटाना चाहते हैं?')) return;
    allRecordings = allRecordings.filter(x => x.id !== rId);
    
    // Update LocalStorage
    try {
      localStorage.setItem('AI_LOCAL_RECORDED_VIDEOS', JSON.stringify(allRecordings));
    } catch (e) {}

    // Delete from Supabase Cloud
    const db = getSupabaseDb();
    if (db) {
      try {
        await db.from('landing_pages').delete().eq('id', rId);
      } catch (err) {}
    }

    renderRecordingsTable();
    showToast('🗑️ वीडियो हटा दिया गया!', 'info');
  };

  // Video Modal Triggers
  const videoModal = document.getElementById('modal-video-editor');
  document.getElementById('btn-open-add-video-modal')?.addEventListener('click', () => {
    editingRecordingId = null;
    document.getElementById('form-video-editor')?.reset();
    document.getElementById('modal-video-title').textContent = '🎬 नई रील / वीडियो जोड़ें';
    if (videoModal) videoModal.style.display = 'flex';
  });

  document.getElementById('btn-close-video-modal')?.addEventListener('click', () => {
    if (videoModal) videoModal.style.display = 'none';
  });

  // Video Form Submit
  document.getElementById('form-video-editor')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const format = document.getElementById('modal_rec_format')?.value || 'short_reel';
    const platform = document.getElementById('modal_rec_platform')?.value || 'youtube';
    const url = (document.getElementById('modal_rec_url')?.value || '').trim();
    const title = (document.getElementById('modal_rec_title')?.value || '').trim();
    const category = document.getElementById('modal_rec_category')?.value || 'Shorts & Reels';
    const duration = (document.getElementById('modal_rec_duration')?.value || '').trim() || '0:58';
    const speaker = (document.getElementById('modal_rec_speaker')?.value || '').trim() || 'आरोग्यम कृषि विशेषज्ञ';

    if (!url || !title) {
      alert('कृपया URL लिंक और शीर्षक भरें।');
      return;
    }

    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i);
    const ytId = ytMatch ? ytMatch[1] : '';

    let thumb = platform === 'instagram' ? '/images/banners/agriculture-hero-banner-2.webp' : '/images/banners/agriculture-hero-banner-1.webp';
    if (platform === 'youtube' && ytId) {
      thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const recObj = {
      id: (format === 'short_reel' ? 'VID_S' : 'VID_') + String(Date.now()).slice(-6),
      format: format,
      platform: platform,
      title: title,
      subject: category,
      category: category,
      video_url: url,
      youtube_url: url,
      youtube_id: ytId,
      thumbnail: thumb,
      duration: duration,
      speaker: speaker,
      access_tier: 'guest',
      status: 'active',
      created_at: new Date().toISOString()
    };

    allRecordings.unshift(recObj);

    // 1. Save LocalStorage
    try {
      localStorage.setItem('AI_LOCAL_RECORDED_VIDEOS', JSON.stringify(allRecordings));
    } catch (e) {}

    // 2. Permanent Supabase Cloud Save
    const db = getSupabaseDb();
    if (db) {
      try {
        await db.from('landing_pages').upsert([{
          id: recObj.id,
          profile_id: 'ALL_USERS',
          share_id: 'ALL_USERS',
          title: recObj.title,
          message: recObj.subject,
          category: 'recorded_video',
          content_type: platform === 'youtube' ? 'youtube' : (platform === 'instagram' ? 'instagram' : 'facebook'),
          media_url: recObj.video_url,
          thumbnail_url: recObj.thumbnail,
          offer_price: 0,
          status: 'active',
          webinar_data: recObj
        }]);
      } catch (err) {}
    }

    if (videoModal) videoModal.style.display = 'none';
    renderRecordingsTable();
    showToast(`🎉 ${format === 'short_reel' ? 'रील' : 'मास्टरक्लास वीडियो'} सफलतापूर्वक सेव हो गया!`, 'success');
  });

  function getSupabaseDb() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.dbClient) return window.dbClient;
    if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      window.supabaseClient = window.supabase.createClient(
        'https://qjhjrzsnrtahmhswxyvb.supabase.co',
        'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU'
      );
      return window.supabaseClient;
    }
    return null;
  }

  function exportWebinarRecordingsJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ recordings: allRecordings }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "webinar-recordings.json");
    dlAnchor.click();
  }

  // -------------------------------------------------------------
  // TABS NAVIGATION & EXPORT BUTTONS
  // -------------------------------------------------------------
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

  document.getElementById('btn-export-json-files')?.addEventListener('click', () => {
    exportWebinarMasterJson();
    setTimeout(exportWebinarRecordingsJson, 500);
    showToast('📥 दोनों JSON फ़ाइलें डाउनलोड हो गईं!', 'success');
  });

  document.getElementById('btn-wb-refresh')?.addEventListener('click', () => {
    loadData();
    showToast('🔄 डेटा रीफ्रेश हो गया!', 'info');
  });

  // Initial Data Load
  loadData();
}
