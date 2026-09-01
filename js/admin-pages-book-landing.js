/* ==========================================================================
   AAROGYAM INDIA — ULTIMATE ADMIN BOOK LANDING PAGES HUB & MAKER (V26.0)
   Comprehensive features:
   - Auto Book Code Generator (BK003, BK004, BK008...) & Category Creator
   - Save New Books to books.json / Digital Library with 1-Click Sync
   - Fixed 3D Book Cover & Hero Banner Uploader (600x800px 3:4 & 1734x907px)
   - Dynamic KPI Feature Highlights Builder (like Kheti Dr. button KPI badges)
   - "यह पुस्तक क्यों खरीदें?" (Why Buy This Book) 4+ Cards Manager
   - Live Offer Countdown Timer Customizer (Minutes, Message, Style)
   - Aarogyam Pro VIP Subscriber Benefit & Value Stack Calculator (₹1999 VIP Free)
   - Multi-Video Manager (16:9 Landscape & 9:16 Shorts/Reels)
   - Book Preview Gallery & Demo Pages Uploader (Pinch-to-Zoom Enabled)
   - Suggested Books (Frequently Bought Together with 1-Click Cart)
   - "पुस्तक के साथ बिल्कुल FREE" (Bonus & AI Support) Checklist Manager
   - Book Specifications Table & "इस पुस्तक में क्या-क्या है?" TOC Points Builder
   - Customer Reviews Manager with Male/Female Avatar Selectors (👨/👩)
   - FAQs Manager & WhatsApp Helpdesk Prompt
   - **INTERACTIVE CURSOR DRAG & DROP SEGMENT REORDERING SYSTEM (Drag with Mouse / Touch & Move Anywhere)**
   - **UNIVERSAL SECTION BANNERS (Optional banner for every section - shows only if uploaded, hides if empty)**
   - Theme Color Customizer (Forest Green, Royal Orange, Ocean Blue, etc.)
   - One-Click JSON Export / Sync for books.json & universal-book-landing-pages.json
   ========================================================================== */

import { initAdminLayout, showToast } from './admin-main.js';

export async function initBookLandingPages() {
  initAdminLayout('Book Landing Pages Hub', 'Create and manage rich high-converting dynamic book landing pages with drag & drop segment reordering, KPI badges, total value stack, multi-video, avatar reviews, and custom themes.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let allBooks = [];
  let allLandingPages = [];
  let editingBookId = null;

  // Dynamic Array States
  let currentKpis = [];
  let currentWhyCards = [];
  let currentVideos = [];
  let currentReviews = [];
  let currentDemoImages = [];
  let currentBonuses = [];
  let currentBonusPoints = [];
  let currentTocPoints = [];
  let currentFaqs = [];
  let currentSuggestedBooks = [];
  let currentSectionsOrder = [];
  let currentHiddenSections = [];
  let currentSectionBanners = {};
  let selectedThemePrimary = '#2E7D32';
  let selectedThemeDark = '#1B5E20';
  let selectedCoverEffect = '3d_float';
  let draggedItemIndex = null;

  const defaultSectionsList = [
    { key: 'sec_hero', name: '📖 1. Hero 3D Book & Main Pitch', desc: '3D कवर, शीर्षक, रेटिंग, मूल्य एवं एक्शन बटन' },
    { key: 'sec_timer', name: '⏳ 2. Offer Countdown Timer', desc: 'सीमित समय ऑफर काउंटडाउन बार' },
    { key: 'sec_kpis', name: '⚡ 3. Feature Highlights / KPI Badges', desc: '120 पेज, 300+ फोटो, स्प्रे साइंस बैजेस' },
    { key: 'sec_trust', name: '🛡️ 4. Trust & Security Bar', desc: 'Instant Download, 100% Satisfaction' },
    { key: 'sec_why_buy', name: '🌱 5. "यह पुस्तक क्यों खरीदें?"', desc: '4+ वैज्ञानिक व प्रैक्टिकल कारण कार्ड्स' },
    { key: 'sec_vip_stack', name: '👑 6. VIP Subscriber Benefit & Value Stack', desc: '₹1999 VIP Pro Free + ₹99 Book' },
    { key: 'sec_video', name: '🎥 7. YouTube Video Demo Section', desc: '16:9 Landscape व 9:16 Shorts/Reels' },
    { key: 'sec_preview', name: '🔍 8. Book Inside Preview & Pinch Zoom', desc: 'डेमो पेजेस गैलरी विथ पिंच-ज़ूम' },
    { key: 'sec_suggested', name: '🛒 9. Suggested / Related Books', desc: 'साथ में ये पुस्तकें भी खरीदें + 1-Click Cart' },
    { key: 'sec_bonuses', name: '🎁 10. बंडल में शामिल अतिरिक्त मुफ्त पुस्तकें', desc: '100% Free Bonus Books + Key Feature KPIs' },
    { key: 'sec_ai_support', name: '🤖 11. 24×7 WhatsApp AI कृषि डॉक्टर सहायता', desc: 'WhatsApp AI हेल्प व त्वरित समाधान' },
    { key: 'sec_specs_toc', name: '📑 12. Book Specifications & TOC Points', desc: 'पुस्तक विवरण तालिका व अध्याय पॉइंट्स' },
    { key: 'sec_reviews', name: '⭐ 13. Customer Reviews & Ratings', desc: 'पाठकों की राय व 👨/👩 अवतार' },
    { key: 'sec_faqs', name: '❓ 14. FAQs Accordion', desc: 'अक्सर पूछे जाने वाले सवाल' },
    { key: 'sec_final_buy', name: '🚀 15. Final CTA Buy Box & Benefits', desc: 'अंतिम आर्डर बॉक्स व लाभ सूची' },
    { key: 'sec_help', name: '💬 16. Help & WhatsApp Support', desc: 'हेल्पलाइन लिंक व सहायता बॉक्स' },
    { key: 'sec_pdf_main', name: '📄 17. Book PDF / DOC Upload & File Management', desc: 'Paid book PDF/DOC upload and management' },
    { key: 'sec_pdf_free', name: '📄 18. Free Book PDF / DOC Upload & File Management', desc: 'Free book PDF/DOC upload and management' }
  ];

  content.innerHTML = `
    <!-- Top Action Header -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📚 Universal Book Landing Pages Hub</span>
            <span style="font-size: 0.75rem; background: rgba(46,125,50,0.15); color: #16a34a; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Ultimate PRO V21</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 4px 0 0 0;">
            FB Pixel, Google ID, ₹1999 VIP वैल्यू स्टैक, मल्टी-वीडियो, अवतार रिव्यूज व कार्ट इंटीग्रेशन के साथ संपूर्ण बुक लैंडिंग पेज बनाएं।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-toggle-book-builder" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(22,163,74,0.3);">
            <span>✨</span> <span>+ नया बुक लैंडिंग पेज बनाएं</span>
          </button>
          <a href="/ebooks/cart.html" target="_blank" class="admin-button small-button" style="background: #2563eb; color: #fff; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <span>🛒</span> <span>लाइव कार्ट देखें</span>
          </a>
          <button id="book-lp-refresh-btn" class="admin-button small-button" style="background: #6366f1; color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <span>🔄</span> <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 14px;">
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #16a34a;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">📚 कुल लैंडिंग पेजेस</div>
          <div id="kpi-book-total" style="font-size: 1.6rem; font-weight: 800; color: #16a34a; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🎁 बोनस बंडल्स</div>
          <div id="kpi-book-bundles" style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #3b82f6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🟢 लाइव (Online)</div>
          <div id="kpi-book-active" style="font-size: 1.6rem; font-weight: 800; color: #3b82f6; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #8b5cf6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🎥 मल्टी-वीडियो पेजेस</div>
          <div id="kpi-book-videos" style="font-size: 1.6rem; font-weight: 800; color: #8b5cf6; margin-top: 4px;">0</div>
        </div>
      </div>
    </div>

    <!-- ADMIN SUB-TABS NAVIGATION BAR -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid var(--admin-border); padding-bottom: 8px; flex-wrap: wrap;">
      <button type="button" id="tab-btn-landing-pages" onclick="window.switchAdminSubTab('pages')" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 800;">
        📚 1. सभी बुक पेजेस व बिल्डर (All Books & Pages)
      </button>
      <button type="button" id="tab-btn-shelves-mgr" onclick="window.switchAdminSubTab('shelves')" class="admin-button" style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); color: var(--admin-text); font-weight: 800;">
        🏪 2. स्टोर शेल्फ व सेग्मेंट कस्टमाइज़र (Shelves Manager)
      </button>
      <button type="button" id="tab-btn-coming-soon-leads" onclick="window.switchAdminSubTab('leads')" class="admin-button" style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); color: var(--admin-text); font-weight: 800;">
        🔔 3. कमिंग सून इंटरेस्ट लीड्स (Farmer Leads)
      </button>
    </div>

    <!-- =========================================================================
         ADVANCED BOOK LANDING PAGE BUILDER FORM
         ========================================================================= -->
    <div id="admin-book-builder-card" class="admin-card" style="display: none; margin-bottom: 20px; background: var(--admin-surface-2, #0f172a); border: 2px solid #16a34a; border-radius: 12px; padding: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--admin-border, #334155); padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.4rem;">📖</span>
          <h3 id="admin-book-builder-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--admin-text);">
            नया बुक लैंडिंग पेज बनाएं (Universal Book Creator)
          </h3>
        </div>
        <button type="button" id="btn-close-book-builder" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted); font-weight: 700;">
          &times; बंद करें (Close)
        </button>
      </div>

      <form id="admin-book-lp-form" onsubmit="return false;">
        
        <!-- SECTION 1: BOOK CODE / ID & CATEGORY & LIBRARY SAVE -->
        <div style="background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <label style="font-weight: 800; color: #16a34a; font-size: 0.95rem; margin: 0;">
              🆔 1. बुक कोड व कैटेगरी चयन (Book Code & Category) *
            </label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" id="btn_generate_book_code" class="admin-button small-button" style="background: #16a34a; color: #fff; font-weight: 700; padding: 4px 12px;">
                ⚡ नया Book Code जनरेट करें
              </button>
              <button type="button" id="btn_add_new_category" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 700; padding: 4px 12px;">
                + नया Category जोड़ें
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1.2fr 1fr; gap: 12px;">
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">मौजूदा लाइब्रेरी से चुनें:</label>
              <select id="blp_select_existing_book" class="admin-select" style="width: 100%; padding: 8px 10px; font-weight: 600;">
                <!-- Populated dynamically -->
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">Book ID / Code: *</label>
              <input type="text" id="blp_input_book_id" class="admin-input" placeholder="उदा. BK008" style="width: 100%; padding: 8px 10px; font-family: monospace; font-weight: 800; color: #16a34a;" required />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">कैटेगरी (Category): *</label>
              <select id="blp_category_select" class="admin-select" style="width: 100%; padding: 8px 10px; font-weight: 700;">
                <option value="Agriculture">🌾 Agriculture (कृषि)</option>
                <option value="Health">❤️ Health (स्वास्थ्य)</option>
                <option value="Business">💼 Business (व्यापार)</option>
                <option value="NETSURF">🌿 NETSURF (नेटसर्फ)</option>
                <option value="Education">📘 Education (शिक्षा)</option>
                <option value="Digital AI">🤖 Digital AI (डिजिटल कौशल)</option>
                <option value="Membership">👑 Membership (सदस्यता)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SECTION 2: HERO DETAILS & PRICING -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; margin-bottom: 12px;">
            📝 2. पुस्तक का मुख्य शीर्षक, उप-शीर्षक एवं मूल्य (Hero Details & Pricing)
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
            <div>
              <label class="admin-label" style="font-weight: 700;">बैज टैग (Hero Tag):</label>
              <input type="text" id="blp_hero_tag" class="admin-input" placeholder="🌾 Bestseller Agriculture eBook" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div style="grid-column: span 2;">
              <label class="admin-label" style="font-weight: 700;">पुस्तक का मुख्य शीर्षक (Title): *</label>
              <input type="text" id="blp_hero_title" class="admin-input" placeholder="उदा. खरीफ फसल मास्टर गाइड 2026" required style="width: 100%; padding: 8px 12px; font-weight: 700;" />
            </div>
            <div style="grid-column: 1 / -1;">
              <label class="admin-label" style="font-weight: 700;">उप-शीर्षक (Subtitle / Highlights):</label>
              <input type="text" id="blp_hero_subtitle" class="admin-input" placeholder="धान • सोयाबीन • मक्का की सम्पूर्ण Practical Guide" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div style="grid-column: 1 / -1;">
              <label class="admin-label" style="font-weight: 700;">संक्षिप्त विवरण (Short Pitch Description):</label>
              <textarea id="blp_hero_desc" class="admin-textarea" rows="2" placeholder="बीज उपचार से लेकर कटाई तक सम्पूर्ण जानकारी..." style="width: 100%; padding: 8px 12px;"></textarea>
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700;">MRP (असली मूल्य ₹):</label>
              <input type="number" id="blp_hero_mrp" class="admin-input" placeholder="299" value="299" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700; color: #16a34a;">ऑफर मूल्य (Offer Price ₹): *</label>
              <input type="number" id="blp_hero_offer_price" class="admin-input" placeholder="99" value="99" required style="width: 100%; padding: 8px 12px; font-weight: 800;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700;">ऑफर बैज (Offer Badge):</label>
              <input type="text" id="blp_hero_badge" class="admin-input" placeholder="Launch Offer" value="Launch Offer" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700;">रेटिंग स्कोर व पाठकों की संख्या:</label>
              <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 8px;">
                <input type="text" id="blp_rating_score" class="admin-input" placeholder="4.9" value="4.9" style="width:100%; padding:8px 10px;" />
                <input type="text" id="blp_rating_count" class="admin-input" placeholder="120+ Ratings" value="120+ Ratings" style="width:100%; padding:8px 10px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: IMAGE UPLOADERS WITH FIXED 3D COVER PREVIEW & DIMENSION GUIDELINES -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem;">
              🖼️ 3. 3D बुक कवर व मुख्य हीरो बैनर (Fixed 3D Aspect Ratio Mockup)
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 0.78rem; color: var(--admin-muted);">3D इफेक्ट:</span>
              <select id="blp_cover_effect" class="admin-select" style="padding: 4px 8px; font-size: 0.8rem; font-weight: 700;">
                <option value="3d_float">✨ 3D Floating Animation (हवा में तैरता 3D कवर)</option>
                <option value="static">📐 Static 3D Mockup (स्थिर 3D कवर)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1.5fr; gap: 16px;">
            <!-- 3D Book Cover -->
            <div id="sec_box_cover" style="background: rgba(0,0,0,0.25); border: 1.5px dashed #16a34a; border-radius: 8px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-weight: 700; font-size: 0.84rem; color: #4ade80;">
                  📸 3D बुक कवर (Cover Mockup) *
                </label>
                <button type="button" onclick="window.clearImageField('cover')" class="admin-button small-button" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 2px 8px; font-size: 0.72rem; border-radius: 4px;">
                  🗑️ कवर हटाएं
                </button>
              </div>
              <div style="margin-bottom: 8px;">
                <label class="admin-label" style="font-size: 0.75rem; color: var(--admin-muted);">Option A: GitHub रिपॉजिटरी की इमेज चुनें (No Re-upload):</label>
                <select id="blp_select_git_cover" class="admin-select" style="width: 100%; padding: 6px 8px; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px;">
                  <option value="">-- GitHub से कवर इमेज चुनें --</option>
                  <option value="/images/books/sabji-kheti-guide-cover.webp">🌾 सब्जी खेती गाइड (सब्जियों की वैज्ञानिक खेती)</option>
                  <option value="/images/books/kharif-master-guide-2026-cover.webp">🌾 खरीफ फसल मास्टर गाइड 2026</option>
                  <option value="/images/books/fasal-ka-doctor-cover.webp">🌿 खेती का डॉक्टर (Pocket Doctor)</option>
                  <option value="/images/books/dhan-master-guide-cover.webp">🌾 धान मास्टर गाइड</option>
                  <option value="/images/books/gehu-master-guide-cover.webp">🌾 गेहूँ मास्टर गाइड</option>
                  <option value="/images/books/soyabean-master-guide-cover.webp">🌾 सोयाबीन मास्टर गाइड</option>
                  <option value="/images/books/makka-master-guide-cover.webp">🌾 मक्का मास्टर गाइड</option>
                  <option value="/images/books/jaivik-kheti-guide-cover.webp">🌱 जैविक खेती गाइड</option>
                  <option value="/images/books/phool-kheti-guide-cover.webp">🌸 फूल खेती गाइड</option>
                  <option value="/images/books/polyhouse-nethouse-guide-cover.webp">🏡 पॉलीहाउस व नेटहाउस गाइड</option>
                  <option value="/images/books/anaj-bhandaran-guide-cover.webp">🌾 अनाज भंडारण गाइड</option>
                  <option value="/images/books/chawal-processing-guide-cover.webp">🍚 चावल प्रोसेसिंग गाइड</option>
                  <option value="/images/books/ai-website-guide-cover.webp">🤖 AI वेबसाइट गाइड</option>
                </select>
              </div>
              <div style="margin-bottom: 6px;">
                <label class="admin-label" style="font-size: 0.75rem; color: var(--admin-muted);">Option B: कंप्यूटर से नई फ़ाइल अपलोड करें:</label>
                <input type="file" id="blp_file_cover" accept="image/*" class="admin-input" style="width: 100%; padding: 6px; font-size: 0.78rem; margin-bottom: 6px;" />
              </div>
              <input type="text" id="blp_cover_url" class="admin-input" placeholder="इमेज URL / Path दर्ज करें" required style="width: 100%; padding: 6px 10px; font-size: 0.8rem;" />
              <div style="margin-top: 10px; text-align: center; background: rgba(0,0,0,0.4); padding: 14px; border-radius: 8px;">
                <img id="blp_preview_cover_img" src="/images/books/kharif-master-guide-2026-cover.webp" alt="Cover Preview" style="height: 180px; width: auto; max-width: 140px; object-fit: contain; margin: 0 auto; border-radius: 10px; box-shadow: -8px 15px 30px rgba(0,0,0,0.5);" />
              </div>
            </div>

            <!-- Hero Background Banner -->
            <div id="sec_box_banner" style="background: rgba(0,0,0,0.25); border: 1.5px dashed #0284c7; border-radius: 8px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-weight: 700; font-size: 0.84rem; color: #38bdf8;">
                  🖼️ बैकग्राउंड बैनर (Hero Background Banner)
                </label>
                <button type="button" onclick="window.clearImageField('banner')" class="admin-button small-button" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 2px 8px; font-size: 0.72rem; border-radius: 4px;">
                  🗑️ बैनर हटाएं
                </button>
              </div>
              <div style="margin-bottom: 8px;">
                <label class="admin-label" style="font-size: 0.75rem; color: var(--admin-muted);">Option A: GitHub रिपॉजिटरी का बैनर चुनें (No Re-upload):</label>
                <select id="blp_select_git_banner" class="admin-select" style="width: 100%; padding: 6px 8px; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px;">
                  <option value="">-- GitHub से बैनर चुनें --</option>
                  <option value="/images/banners/kharif-master-guide-2026-hero-banner.webp">🌾 खरीफ मास्टर गाइड 2026 हीरो बैनर</option>
                  <option value="/images/banners/agriculture-hero-banner-1.webp">🌾 कृषि हीरो बैनर 1</option>
                  <option value="/images/banners/agriculture-hero-banner-2.webp">🌾 कृषि हीरो बैनर 2</option>
                  <option value="/images/banners/agriculture-hero-banner-3.webp">🌾 कृषि हीरो बैनर 3</option>
                  <option value="/images/banners/digital-training-banner.jpeg">💻 डिजिटल ट्रेनिंग व करियर प्लान बैनर (Zoom)</option>
                  <option value="/images/banners/webinar-live-banner.webp">🎥 लाइव वेबिनार बैनर</option>
                  <option value="/images/banners/achievers-banner.jpeg">🏆 अचीवर्स बैनर</option>
                  <option value="/images/banners/offer-banner-kharif-2026.webp">⚡ खरीफ स्पेशल ऑफर बैनर</option>
                </select>
              </div>
              <div style="margin-bottom: 6px;">
                <label class="admin-label" style="font-size: 0.75rem; color: var(--admin-muted);">Option B: कंप्यूटर से नया बैनर अपलोड करें:</label>
                <input type="file" id="blp_file_banner" accept="image/*" class="admin-input" style="width: 100%; padding: 6px; font-size: 0.78rem; margin-bottom: 6px;" />
              </div>
              <input type="text" id="blp_banner_url" class="admin-input" placeholder="इमेज URL / Path दर्ज करें" style="width: 100%; padding: 6px 10px; font-size: 0.8rem;" />
              <div style="margin-top: 10px; text-align: center; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
                <img id="blp_preview_banner_img" src="/images/banners/kharif-master-guide-2026-hero-banner.webp" alt="Banner Preview" style="height: 140px; width: 100%; object-fit: cover; border-radius: 6px; border: 1px solid var(--admin-border);" />
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 4: DYNAMIC KPI & FEATURE BADGES BUILDER (WITH SECTION BANNER) -->
        <div style="background: rgba(16,185,129,0.08); border: 1.5px solid rgba(16,185,129,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #10b981; font-size: 0.95rem;">
                ⚡ 4. हीरो बैनर के नीचे फीचर हाईलाइट्स / KPI बैजेस (Feature Highlights & Badges)
              </div>
              <small style="color: var(--admin-muted);">जैसे: 120 पेज, 300+ फोटो, स्प्रे साइंस, फ्री बोनस PDF</small>
            </div>
            <button type="button" id="btn_add_kpi_badge_item" class="admin-button small-button" style="background: #10b981; color: #fff; font-weight: 800;">
              + नया KPI बैज जोड़ें
            </button>
          </div>
          
          <!-- Optional Section Banner for KPIs -->
          ${renderSectionBannerUploaderBlock('sec_kpis', '⚡ KPI हाईलाइट्स सेक्शन बैनर (वैकल्पिक - अपलोड करने पर दिखेगा)')}

          <div id="blp_kpi_badges_list_wrap" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- SECTION 5: "WHY BUY THIS BOOK" (WITH SECTION BANNER) -->
        <div style="background: rgba(245,158,11,0.08); border: 1.5px solid rgba(245,158,11,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f59e0b; font-size: 0.95rem;">
                🌱 5. "यह पुस्तक क्यों खरीदें?" (Why Buy This Book Cards Manager)
              </div>
              <small style="color: var(--admin-muted);">सेक्शन हेडिंग, सबटाइटल्स और 4+ कारण कार्ड्स</small>
            </div>
            <button type="button" id="btn_add_why_card_item" class="admin-button small-button" style="background: #f59e0b; color: #000; font-weight: 800;">
              + नया Why Card जोड़ें
            </button>
          </div>

          <!-- Optional Section Banner for Why Buy -->
          ${renderSectionBannerUploaderBlock('sec_why_buy', '🌱 "यह पुस्तक क्यों खरीदें" सेक्शन बैनर (वैकल्पिक - अपलोड करने पर दिखेगा)')}

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin: 10px 0;">
            <input type="text" id="blp_why_title" class="admin-input" placeholder="यह पुस्तक क्यों खरीदें?" value="यह पुस्तक क्यों खरीदें?" style="padding:6px 10px; font-weight:700;" />
            <input type="text" id="blp_why_desc" class="admin-input" placeholder="संक्षिप्त विवरण (Pitch Subtitle)" style="padding:6px 10px;" />
          </div>
          <div id="blp_why_cards_list_wrap" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- SECTION 6: OFFER COUNTDOWN TIMER (WITH SECTION BANNER) -->
        <div style="background: rgba(220,38,38,0.08); border: 1.5px solid rgba(220,38,38,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #ef4444; font-size: 0.95rem;">
              ⏳ 6. ऑफर काउंटडाउन टाइमर (Offer Urgency Countdown Timer)
            </div>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: var(--admin-text);">
              <input type="checkbox" id="blp_timer_enabled" checked style="accent-color: #ef4444; width: 16px; height: 16px;" />
              <span>टाइमर चालू रखें</span>
            </label>
          </div>

          <!-- Optional Section Banner for Timer -->
          ${renderSectionBannerUploaderBlock('sec_timer', '⏳ ऑफर टाइमर सेक्शन बैनर (वैकल्पिक)')}

          <div style="display: grid; grid-template-columns: 1fr 2.5fr; gap: 12px; margin-top: 10px;">
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">टाइमर समय (Minutes):</label>
              <input type="number" id="blp_timer_minutes" value="15" class="admin-input" style="width:100%; padding:6px 10px; font-weight:800;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">ऑफर मैसेज:</label>
              <input type="text" id="blp_timer_text" value="⚡ सीमित समय ऑफर: यह विशेष छूट केवल अगले 15 मिनट के लिए मान्य है!" class="admin-input" style="width:100%; padding:6px 10px;" />
            </div>
          </div>
        </div>

        <!-- SECTION 7: TOTAL VALUE STACK & VIP SUBSCRIBER CARD -->
        <div style="background: linear-gradient(135deg, rgba(5,46,22,0.15) 0%, rgba(20,83,45,0.15) 100%); border: 2px solid #22c55e; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 900; color: #4ade80; font-size: 0.95rem; margin-bottom: 8px;">
            💎 7. टोटल वैल्यू स्टैक कैलकुलेशन व VIP Pro कार्ड (Total Value Stack - ₹1999 VIP Free)
          </div>

          <!-- Optional Section Banner for VIP Stack -->
          ${renderSectionBannerUploaderBlock('sec_vip_stack', '👑 VIP स्टैक बैनर इमेज (वैकल्पिक)')}

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin: 12px 0;">
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">मुख्य ई-बुक MRP:</label>
              <input type="number" id="blp_stack_book_mrp" value="299" class="admin-input" style="width:100%;padding:6px 10px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">1 वर्ष VIP Pro मेंबरशिप वैल्यू:</label>
              <input type="number" id="blp_stack_vip_val" value="1999" class="admin-input" style="width:100%;padding:6px 10px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">बोनस चार्ट्स व गिफ्ट्स वैल्यू:</label>
              <input type="number" id="blp_stack_bonus_val" value="199" class="admin-input" style="width:100%;padding:6px 10px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem;color:#4ade80;font-weight:800;">आज का ऑफर मूल्य:</label>
              <input type="number" id="blp_stack_offer_val" value="99" class="admin-input" style="width:100%;padding:6px 10px;font-weight:800;color:#16a34a;" />
            </div>
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.78rem;">VIP मुख्य संदेश (Perk Text):</label>
            <input type="text" id="blp_vip_perk_text" value="👑 Aarogyam Pro VIP मेंबर्स के लिए यह गाइड उनके प्लान में 100% मुफ्त शामिल है।" class="admin-input" style="width:100%;padding:6px 10px;" />
          </div>
        </div>

        <!-- SECTION 8: MULTI-VIDEO MANAGER (WITH SECTION BANNER) -->
        <div style="background: rgba(59,130,246,0.08); border: 1.5px solid rgba(59,130,246,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #3b82f6; font-size: 0.95rem;">
              🎥 8. मल्टी-वीडियो मैनेजर (16:9 Landscape & 9:16 Shorts/Reels)
            </div>
            <button type="button" id="btn_add_video_item" class="admin-button small-button" style="background: #2563eb; color: #fff; font-weight: 700;">
              + नया वीडियो जोड़ें
            </button>
          </div>

          <!-- Optional Section Banner for Video -->
          ${renderSectionBannerUploaderBlock('sec_video', '🎥 वीडियो सेक्शन बैनर (वैकल्पिक)')}

          <div id="blp_videos_list_wrap" style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- SECTION 9: DEMO PAGES GALLERY & PINCH ZOOM (WITH SECTION BANNER) -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #fbbf24; font-size: 0.95rem;">
              🔍 9. पुस्तक के अंदर के डेमो पेजेस (Pinch-to-Zoom Gallery & Panoramic Banner)
            </div>
            <button type="button" id="btn_add_demo_image" class="admin-button small-button" style="background: #d97706; color: #fff; font-weight: 700;">
              + नया डेमो पेज जोड़ें
            </button>
          </div>

          <!-- Optional Preview Panoramic Banner -->
          ${renderSectionBannerUploaderBlock('sec_preview', '🔍 प्रीव्यू सेक्शन पैनोरमिक बैनर (1200 × 400 px - वैकल्पिक)')}

          <div id="blp_demo_images_wrap" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- SECTION 10: SUGGESTED / RELATED BOOKS (WITH SECTION BANNER) -->
        <div style="background: rgba(245,158,11,0.08); border: 1.5px solid rgba(245,158,11,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f59e0b; font-size: 0.95rem;">
                🛒 10. साथ में यह पुस्तक भी खरीदें (Frequently Bought Together 2-Book Combo)
              </div>
              <small style="color: var(--admin-muted);">लाइब्रेरी से दूसरी पुस्तक चुनें (जैसे BK001 या BK002), यह पेज पर 2-बुक कॉम्बो (₹198) बनाकर दिखाएगी</small>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <select id="blp_suggested_library_select" onchange="window.addExistingBookToSuggested(this.value)" class="admin-select" style="font-weight:700;padding:5px 10px;background:#f59e0b;color:#000;border-color:#f59e0b;font-size:0.8rem;">
                <option value="">📚 लाइब्रेरी से संबंधित बुक चुनें...</option>
              </select>
              <button type="button" id="btn_add_suggested_book_item" class="admin-button small-button" style="background: #f59e0b; color: #000; font-weight: 800;">
                + कस्टम बुक जोड़ें
              </button>
            </div>
          </div>

          <!-- Optional Section Banner for Suggested Books -->
          ${renderSectionBannerUploaderBlock('sec_suggested', '🛒 संबंधित पुस्तकें सेक्शन बैनर (वैकल्पिक)')}

          <div id="blp_suggested_books_list_wrap" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- SECTION 11: बंडल में शामिल अतिरिक्त मुफ्त पुस्तकें (FREE BONUS BOOKS & KPI FEATURES) -->
        <div style="background: rgba(22,163,74,0.08); border: 1.5px solid rgba(22,163,74,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #16a34a; font-size: 0.95rem;">
                🎁 11. बंडल में शामिल अतिरिक्त मुफ्त पुस्तकें (100% Free Books & Feature KPIs)
              </div>
              <small style="color: var(--admin-muted);">प्रत्येक मुफ़्त पुस्तक को कवर, मूल्य और उसके विशेष फीचर्स/KPIs के साथ जोड़ें</small>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <select id="blp_bonus_library_select" onchange="window.addExistingBookToBonus(this.value)" class="admin-select" style="font-weight:700;padding:5px 10px;background:#0284c7;color:#fff;border-color:#0284c7;font-size:0.8rem;">
                <option value="">📚 लाइब्रेरी से मुफ़्त बुक जोड़ें...</option>
              </select>
              <button type="button" id="btn_add_bonus_book_item" onclick="window.addNewBonusBook()" class="admin-button small-button" style="background: #16a34a; color: #fff; font-weight: 800;">
                + नई मुफ़्त पुस्तक जोड़ें
              </button>
            </div>
          </div>

          <!-- Optional Section Banner for Bonuses -->
          ${renderSectionBannerUploaderBlock('sec_bonuses', '🎁 बोनस बंडल सेक्शन बैनर (वैकल्पिक)')}

          <div id="blp_bonuses_list_wrap" style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            <!-- Rendered dynamically with KPI features -->
          </div>
        </div>

        <!-- SECTION 12: 24×7 WHATSAPP AI AGRI DOCTOR SUPPORT -->
        <div style="background: rgba(37,99,235,0.08); border: 1.5px solid rgba(37,99,235,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #3b82f6; font-size: 0.95rem;">
                🤖 12. 24×7 WhatsApp AI कृषि डॉक्टर सहायता (AI Support Manager)
              </div>
              <small style="color: var(--admin-muted);">किताब पढ़ते समय त्वरित समाधान और सपोर्ट पॉइंट्स</small>
            </div>
            <button type="button" id="btn_add_bonus_point_item" class="admin-button small-button" style="background: #2563eb; color: #fff; font-weight: 800;">
              + नया AI सपोर्ट पॉइंट जोड़ें
            </button>
          </div>

          <!-- Optional Section Banner for AI Support -->
          ${renderSectionBannerUploaderBlock('sec_ai_support', '🤖 AI सपोर्ट सेक्शन बैनर (वैकल्पिक)')}

          <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-top: 10px; margin-bottom: 10px;">
            <div>
              <label class="admin-label" style="font-size: 0.78rem; font-weight: 700;">AI सपोर्ट शीर्षक (Title):</label>
              <input type="text" id="blp_ai_support_title" placeholder="🌾 FREE AI WHATSAPP SUPPORT & SPRAY FORMULA 🎁" class="admin-input" style="padding: 6px 10px; font-size: 0.85rem; font-weight: 700; width: 100%;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem; font-weight: 700;">AI सपोर्ट इमेज URL / Icon:</label>
              <input type="text" id="blp_ai_support_cover" placeholder="/images/books/kharif-fasal-hero-2.webp" class="admin-input" style="padding: 6px 10px; font-size: 0.85rem; width: 100%;" />
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <label class="admin-label" style="font-size: 0.78rem; font-weight: 700;">AI सपोर्ट विवरण (Description):</label>
            <textarea id="blp_ai_support_desc" placeholder="किताब पढ़ते समय अगर कोई बात समझ न आए, तो WhatsApp Help बटन पर क्लिक करें..." class="admin-textarea" rows="2" style="padding: 6px 10px; font-size: 0.82rem; width: 100%;"></textarea>
          </div>

          <div style="border-top: 1px dashed var(--admin-border); padding-top: 10px;">
            <label class="admin-label" style="font-size: 0.78rem; font-weight: 700;">AI सपोर्ट चेकलिस्ट पॉइंट्स (Checklist Items):</label>
            <div id="blp_bonus_points_list_wrap" style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- SECTION 13: BOOK SPECIFICATIONS & TABLE OF CONTENTS -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 0.92rem;">
              📑 13. पुस्तक विवरण तालिका व "इस पुस्तक में क्या-क्या है?" (TOC Points)
            </div>
            <button type="button" id="btn_add_toc_point_item" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 700;">
              + नया अध्याय पॉइंट जोड़ें
            </button>
          </div>

          <!-- Optional Section Banner for Specs -->
          ${renderSectionBannerUploaderBlock('sec_specs_toc', '📑 पुस्तक जानकारी व TOC सेक्शन बैनर (वैकल्पिक)')}

          <div id="blp_toc_points_list_wrap" style="display: flex; flex-direction: column; gap: 6px; margin-top: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- SECTION 14: ADVANCED REVIEWS & AVATARS -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f59e0b; font-size: 0.95rem;">
              ⭐ 14. कस्टमर रिव्यूज व ऑटो मेल/फीमेल अवतार (👨/👩)
            </div>
            <button type="button" id="btn_add_review_item" class="admin-button small-button" style="background: #d97706; color: #fff; font-weight: 700;">
              + नया रिव्यू जोड़ें
            </button>
          </div>

          <!-- Optional Section Banner for Reviews -->
          ${renderSectionBannerUploaderBlock('sec_reviews', '⭐ पाठकों की राय सेक्शन बैनर (वैकल्पिक)')}

          <div id="blp_reviews_list_wrap" style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- SECTION 15: FAQs MANAGER -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem;">
              ❓ 15. अक्सर पूछे जाने वाले सवाल (FAQs Manager)
            </div>
            <button type="button" id="btn_add_faq_item" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 700;">
              + नया FAQ जोड़ें
            </button>
          </div>

          <!-- Optional Section Banner for FAQs -->
          ${renderSectionBannerUploaderBlock('sec_faqs', '❓ FAQ सेक्शन बैनर (वैकल्पिक)')}

          <div id="blp_faqs_list_wrap" style="display: flex; flex-direction: column; gap: 8px; margin: 10px 0 14px 0;">
            <!-- Rendered dynamically -->
          </div>
          <div>
            <label class="admin-label" style="font-weight: 700;">💬 WhatsApp हेल्पडेस्क प्रॉम्प्ट मैसेज:</label>
            <input type="text" id="blp_wa_prompt" class="admin-input" placeholder="नमस्ते, मुझे पुस्तक के बारे में और जानकारी चाहिए।" style="width: 100%; padding: 8px 12px;" />
          </div>
        </div>

        <!-- SECTION 16: MULTI-PAGE PUBLISHING TARGETS & STORE BADGES -->
        <div style="background: rgba(147,51,234,0.08); border: 1.5px solid rgba(147,51,234,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 800; color: #a855f7; font-size: 0.95rem; margin-bottom: 6px;">
            📍 16. मल्टी-पेज पब्लिशिंग टार्गेट्स व स्टोर विजिबिलिटी (Publish to Pages & Badges)
          </div>
          <p style="font-size: 0.8rem; color: var(--admin-muted); margin-bottom: 12px;">
            चुनें कि यह पुस्तक लाइव होने के बाद किन-किन पेजों पर और किस मार्केटिंग बैज के साथ दिखेगी:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 14px;">
            <label style="display: flex; align-items: center; gap: 8px; background: var(--admin-surface, #1e293b); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--admin-border); cursor: pointer;">
              <input type="checkbox" id="blp_pub_ebook_store" checked style="width: 18px; height: 18px; accent-color: #a855f7;" />
              <div>
                <strong style="font-size: 0.85rem; display: block; color: #fff;">🏪 eBook Store</strong>
                <small style="color: var(--admin-muted); font-size: 0.72rem;">ebooks/ebook.html</small>
              </div>
            </label>

            <label style="display: flex; align-items: center; gap: 8px; background: var(--admin-surface, #1e293b); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--admin-border); cursor: pointer;">
              <input type="checkbox" id="blp_pub_category_page" checked style="width: 18px; height: 18px; accent-color: #a855f7;" />
              <div>
                <strong style="font-size: 0.85rem; display: block; color: #fff;">🌾 Category Hub</strong>
                <small style="color: var(--admin-muted); font-size: 0.72rem;">उदा. agriculture.html</small>
              </div>
            </label>

            <label style="display: flex; align-items: center; gap: 8px; background: var(--admin-surface, #1e293b); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--admin-border); cursor: pointer;">
              <input type="checkbox" id="blp_pub_my_library" checked style="width: 18px; height: 18px; accent-color: #a855f7;" />
              <div>
                <strong style="font-size: 0.85rem; display: block; color: #fff;">📖 My Library Store</strong>
                <small style="color: var(--admin-muted); font-size: 0.72rem;">my-library.html</small>
              </div>
            </label>

            <label style="display: flex; align-items: center; gap: 8px; background: var(--admin-surface, #1e293b); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--admin-border); cursor: pointer;">
              <input type="checkbox" id="blp_pub_home_page" checked style="width: 18px; height: 18px; accent-color: #a855f7;" />
              <div>
                <strong style="font-size: 0.85rem; display: block; color: #fff;">🏠 Home Page</strong>
                <small style="color: var(--admin-muted); font-size: 0.72rem;">index.html</small>
              </div>
            </label>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.78rem;">🏷️ स्टोर मार्केटिंग बैज (Store Badge):</label>
              <select id="blp_store_badge" class="admin-select" style="width: 100%; padding: 7px 10px; font-weight: 700;">
                <option value="best_seller">🔥 Best Seller (सर्वाधिक बिकने वाली)</option>
                <option value="new_arrival">🆕 New Arrival (नई पुस्तक)</option>
                <option value="trending">⭐ Trending (चर्चित)</option>
                <option value="coming_soon">⏳ Coming Soon (जल्द आ रही है)</option>
                <option value="special_bundle">🎁 Special Bonus Bundle</option>
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.78rem;">⏳ प्री-लॉन्च / कमिंग सून स्थिति:</label>
              <select id="blp_is_coming_soon" class="admin-select" style="width: 100%; padding: 7px 10px; font-weight: 700;">
                <option value="false">🟢 Live / Ready to Buy (तुरंत खरीदने योग्य)</option>
                <option value="true">⏳ Coming Soon (प्री-लॉन्च / लीड्स मोड)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SECTION 17: BOOK PDF / DOC FILE MANAGEMENT (PAID BOOK FULL PDF/DOC) -->
        <div id="sec_box_main_pdf" style="background: rgba(14,165,233,0.08); border: 1.5px solid rgba(14,165,233,0.35); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>📄</span> <span>17. मुख्य ई-बुक PDF / DOC फाइल प्रबंधन (Paid Book Full PDF)</span>
              </div>
              <small style="color: var(--admin-muted);">भुगतान के बाद पाठक को मिलने वाली मुख्य सम्पूर्ण ई-बुक फाइल (GitHub Limit: 25 MB)</small>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 0.72rem; background: #0284c7; color: #fff; padding: 3px 8px; border-radius: 6px; font-weight: 800;">
                🔒 Paid Full Book Access
              </span>
              <button type="button" onclick="window.clearBookPdf('main')" class="admin-button small-button" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 2px 8px; font-size: 0.72rem; border-radius: 4px;">
                🗑️ PDF हटाएं
              </button>
            </div>
          </div>

          <!-- Optional Section Banner for Main PDF -->
        <!-- SECTION 17: BOOK PDF / DOC FILE MANAGEMENT (PAID BOOK FULL PDF/DOC) -->
        <div id="sec_box_main_pdf" style="background: rgba(14,165,233,0.08); border: 1.5px solid rgba(14,165,233,0.35); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>📄</span> <span>17. मुख्य ई-बुक PDF / DOC फाइल प्रबंधन (Paid Book Full PDF)</span>
              </div>
              <small style="color: var(--admin-muted);">भुगतान के बाद पाठक को मिलने वाली मुख्य सम्पूर्ण ई-बुक फाइल (GitHub Limit: 25 MB)</small>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 0.72rem; background: #0284c7; color: #fff; padding: 3px 8px; border-radius: 6px; font-weight: 800;">
                🔒 Paid Full Book Access
              </span>
              <button type="button" onclick="window.clearBookPdf('main')" class="admin-button small-button" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 2px 8px; font-size: 0.72rem; border-radius: 4px;">
                🗑️ PDF हटाएं
              </button>
            </div>
          </div>

          <!-- Optional Section Banner for Main PDF -->
          ${renderSectionBannerUploaderBlock('sec_pdf_main', '📄 मुख्य PDF सेक्शन बैनर (वैकल्पिक)')}

          <div style="background: rgba(0,0,0,0.25); border: 1.5px dashed #0284c7; border-radius: 8px; padding: 14px; margin-top: 10px;">
            <div style="display: grid; grid-template-columns: 1.2fr 1.2fr 1fr; gap: 12px; align-items: start;">
              <!-- Option A: GitHub Repository Dropdown -->
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #38bdf8;">Option A: GitHub रिपॉजिटरी से PDF चुनें:</label>
                <select id="blp_select_git_main_pdf" class="admin-select" style="width: 100%; padding: 6px 8px; font-size: 0.8rem; font-weight: 600;">
                  <option value="">-- GitHub से PDF चुनें --</option>
                  <option value="/uploads/books/BK001_main.pdf">📄 BK001: खरीफ फसल मास्टर गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK002_main.pdf">📄 BK002: खेती का डॉक्टर (Full PDF)</option>
                  <option value="/uploads/books/BK003_main.pdf">📄 BK003: धान मास्टर गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK004_main.pdf">📄 BK004: गेहूँ मास्टर गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK005_main.pdf">📄 BK005: सोयाबीन मास्टर गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK006_main.pdf">📄 BK006: मक्का मास्टर गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK007_main.pdf">📄 BK007: जैविक खेती गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK008_main.pdf">📄 BK008: सब्जी खेती गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK009_main.pdf">📄 BK009: फूल खेती गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK010_main.pdf">📄 BK010: पॉलीहाउस व नेटहाउस गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK011_main.pdf">📄 BK011: अनाज भंडारण गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK012_main.pdf">📄 BK012: चावल प्रोसेसिंग गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK013_main.pdf">📄 BK013: AI वेबसाइट गाइड (Full PDF)</option>
                  <option value="/uploads/books/BK015_main.pdf">📄 BK015: सब्जी खेती गाइड Part 1 (24.7MB)</option>
                </select>
              </div>

              <!-- Option B: Direct Path / Link -->
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700;">Option B: या डायरेक्ट फ़ाइल Path / URL:</label>
                <input type="text" id="blp_main_pdf_url" placeholder="उदा. /uploads/books/BK015_main.pdf" oninput="window.updatePdfStatusPreview('main', this.value)" class="admin-input" style="width: 100%; padding: 6px 10px; font-size: 0.82rem; font-family: monospace;" />
              </div>

              <!-- Option C: File Upload -->
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #38bdf8;">Option C: कंप्यूटर से PDF (Max 25MB):</label>
                <input type="file" id="blp_file_main_pdf" accept=".pdf,.doc,.docx,application/pdf" onchange="window.handleBookPdfSelect('main', event)" class="admin-input" style="width: 100%; padding: 5px; font-size: 0.75rem;" />
              </div>
            </div>

            <!-- Option D: Manual Git Path Copy Helper -->
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(56,189,248,0.25); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 0.76rem; color: #94a3b8;">
                💡 <strong>Option D (Git में मैन्युअल अपलोड):</strong> अगर आप Git में सीधे PDF डालना चाहते हैं, तो इस बटन पर क्लिक करें:
              </span>
              <button type="button" onclick="window.copyGitPdfPath('main')" class="admin-button small-button" style="background: rgba(14,165,233,0.25); border: 1px solid #38bdf8; color: #38bdf8; padding: 4px 10px; font-size: 0.76rem; border-radius: 6px; font-weight: 700; cursor: pointer;">
                📋 Option D: Git मैन्युअल अपलोड पाथ कॉपी करें
              </button>
            </div>

            <div id="blp_main_pdf_status_wrap" style="margin-top: 10px; font-size: 0.8rem; color: #94a3b8; display: none;">
              <!-- Current file status indicator -->
            </div>
          </div>
        </div>

        <!-- SECTION 18: FREE / DEMO BOOK PDF / DOC FILE MANAGEMENT -->
        <div id="sec_box_free_pdf" style="background: rgba(16,185,129,0.08); border: 1.5px solid rgba(16,185,129,0.35); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #34d399; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🎁</span> <span>18. मुफ़्त / डेमो ई-बुक PDF / DOC फाइल प्रबंधन (Free/Demo Book PDF)</span>
              </div>
              <small style="color: var(--admin-muted);">पाठकों के लिए निःशुल्क सैंपल या बोनस ई-बुक फाइल (GitHub Limit: 25 MB)</small>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 0.72rem; background: #059669; color: #fff; padding: 3px 8px; border-radius: 6px; font-weight: 800;">
                🎁 100% Free Demo Access
              </span>
              <button type="button" onclick="window.clearBookPdf('free')" class="admin-button small-button" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 2px 8px; font-size: 0.72rem; border-radius: 4px;">
                🗑️ PDF हटाएं
              </button>
            </div>
          </div>

          <!-- Optional Section Banner for Free PDF -->
          ${renderSectionBannerUploaderBlock('sec_pdf_free', '🎁 फ्री PDF सेक्शन बैनर (वैकल्पिक)')}

          <div style="background: rgba(0,0,0,0.25); border: 1.5px dashed #059669; border-radius: 8px; padding: 14px; margin-top: 10px;">
            <div style="display: grid; grid-template-columns: 1.2fr 1.2fr 1fr; gap: 12px; align-items: start;">
              <!-- Option A: GitHub Repository Dropdown -->
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #34d399;">Option A: GitHub रिपॉजिटरी से PDF चुनें:</label>
                <select id="blp_select_git_free_pdf" class="admin-select" style="width: 100%; padding: 6px 8px; font-size: 0.8rem; font-weight: 600;">
                  <option value="">-- GitHub से फ्री PDF चुनें --</option>
                  <option value="/uploads/books/BK001_free.pdf">🎁 BK001: खरीफ फसल मास्टर गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK002_free.pdf">🎁 BK002: खेती का डॉक्टर (Free Demo)</option>
                  <option value="/uploads/books/BK003_free.pdf">🎁 BK003: धान मास्टर गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK004_free.pdf">🎁 BK004: गेहूँ मास्टर गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK005_free.pdf">🎁 BK005: सोयाबीन मास्टर गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK006_free.pdf">🎁 BK006: मक्का मास्टर गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK007_free.pdf">🎁 BK007: जैविक खेती गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK008_free.pdf">🎁 BK008: सब्जी खेती गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK009_free.pdf">🎁 BK009: फूल खेती गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK010_free.pdf">🎁 BK010: पॉलीहाउस व नेटहाउस गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK011_free.pdf">🎁 BK011: अनाज भंडारण गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK012_free.pdf">🎁 BK012: चावल प्रोसेसिंग गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK013_free.pdf">🎁 BK013: AI वेबसाइट गाइड (Free Demo)</option>
                  <option value="/uploads/books/BK015_free.pdf">🎁 BK015: सब्जी खेती गाइड Free Demo (PDF)</option>
                </select>
              </div>

              <!-- Option B: Direct Path / Link -->
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700;">Option B: या डायरेक्ट फ़ाइल Path / URL:</label>
                <input type="text" id="blp_free_pdf_url" placeholder="उदा. /uploads/books/BK015_free.pdf" oninput="window.updatePdfStatusPreview('free', this.value)" class="admin-input" style="width: 100%; padding: 6px 10px; font-size: 0.82rem; font-family: monospace;" />
              </div>

              <!-- Option C: File Upload -->
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #34d399;">Option C: कंप्यूटर से PDF (Max 25MB):</label>
                <input type="file" id="blp_file_free_pdf" accept=".pdf,.doc,.docx,application/pdf" onchange="window.handleBookPdfSelect('free', event)" class="admin-input" style="width: 100%; padding: 5px; font-size: 0.75rem;" />
              </div>
            </div>

            <!-- Option D: Manual Git Path Copy Helper -->
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(52,211,153,0.25); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 0.76rem; color: #94a3b8;">
                💡 <strong>Option D (Git में मैन्युअल अपलोड):</strong> अगर आप Git में सीधे फ्री PDF डालना चाहते हैं, तो इस बटन पर क्लिक करें:
              </span>
              <button type="button" onclick="window.copyGitPdfPath('free')" class="admin-button small-button" style="background: rgba(16,185,129,0.25); border: 1px solid #34d399; color: #34d399; padding: 4px 10px; font-size: 0.76rem; border-radius: 6px; font-weight: 700; cursor: pointer;">
                📋 Option D: Git फ्री PDF पाथ कॉपी करें
              </button>
            </div>

            <div id="blp_free_pdf_status_wrap" style="margin-top: 10px; font-size: 0.8rem; color: #94a3b8; display: none;">
              <!-- Current file status indicator -->
            </div>
          </div>
        </div>

        <!-- SECTION 19: SEO, OPENGRAPH (OG) & WHATSAPP SOCIAL SHARE LIVE PREVIEW -->
        <div style="background: rgba(34,197,94,0.08); border: 1.5px solid rgba(34,197,94,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 800; color: #22c55e; font-size: 0.95rem; margin-bottom: 6px;">
            🌐 19. SEO, OpenGraph (OG) व WhatsApp शेयर प्रीव्यू (Social Media Thumbnail & Title)
          </div>
          <p style="font-size: 0.8rem; color: var(--admin-muted); margin-bottom: 12px;">
            जब आप इस पुस्तक का लिंक WhatsApp, Facebook या सोशल मीडिया पर शेयर करेंगे, तो यह थंबनेल, शीर्षक और विवरण कार्ड दिखाई देगा:
          </p>

          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; align-items: start;">
            <!-- Inputs -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div>
                <label class="admin-label" style="font-weight: 700;">OG Title (शेयर शीर्षक):</label>
                <input type="text" id="blp_og_title" oninput="window.updateSocialSharePreview()" class="admin-input" placeholder="पुस्तक का शेयर शीर्षक" style="width: 100%; padding: 8px 12px;" />
              </div>
              <div>
                <label class="admin-label" style="font-weight: 700;">OG Description (शेयर विवरण):</label>
                <textarea id="blp_og_description" oninput="window.updateSocialSharePreview()" class="admin-textarea" rows="2" placeholder="सम्पूर्ण Practical Guide। अभी 67% विशेष छूट पर उपलब्ध।" style="width: 100%; padding: 8px 12px; font-size: 0.85rem;"></textarea>
              </div>
              <div>
                <label class="admin-label" style="font-weight: 700;">OG Image (शेयर थंबनेल URL):</label>
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="blp_og_image" oninput="window.updateSocialSharePreview()" class="admin-input" placeholder="/images/books/cover.webp" style="flex: 1; padding: 8px 12px;" />
                  <label class="admin-button small-button" style="background:#22c55e;color:#000;font-weight:700;cursor:pointer;white-space:nowrap;margin:0;display:flex;align-items:center;">
                    📁 अपलोड
                    <input type="file" accept="image/*" onchange="window.uploadOgImage(event)" style="display:none;" />
                  </label>
                </div>
              </div>
            </div>

            <!-- WhatsApp Social Card Live Preview Box -->
            <div style="background: #0f172a; border: 1.5px solid #334155; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.3);">
              <div style="background: #1e293b; padding: 6px 12px; font-size: 0.75rem; font-weight: 700; color: #22c55e; border-bottom: 1px solid #334155; display: flex; align-items: center; gap: 6px;">
                <span>💬 WhatsApp / Social Media Card Live Preview</span>
              </div>
              <div id="blp_social_preview_img_wrap" style="width: 100%; height: 130px; background: #1e293b; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img id="blp_social_preview_img" src="/images/books/kharif-master-guide-2026-cover.webp" style="width: 100%; height: 100%; object-fit: cover;" alt="Share Thumbnail" />
              </div>
              <div style="padding: 10px 12px; background: #0b1329;">
                <div id="blp_social_preview_title" style="font-weight: 800; color: #f8fafc; font-size: 0.88rem; line-height: 1.3; margin-bottom: 4px;">
                  खरीफ फसल मास्टर गाइड 2026
                </div>
                <div id="blp_social_preview_desc" style="color: #94a3b8; font-size: 0.75rem; line-height: 1.3; margin-bottom: 6px;">
                  बीज उपचार से लेकर कटाई तक सम्पूर्ण जानकारी। अभी ₹99 विशेष ऑफर में पाएं।
                </div>
                <div style="font-size: 0.7rem; color: #64748b; font-weight: 600;">
                  aarogyamindia.online
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 16: INTERACTIVE CURSOR DRAG & DROP SEGMENT REORDERING (DRAG ANYWHERE WITH MOUSE) -->
        <div style="background: linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.15) 100%); border: 2.5px solid #8b5cf6; border-radius: 12px; padding: 18px; margin-bottom: 16px; box-shadow: 0 8px 20px rgba(139,92,246,0.15);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 900; color: #c084fc; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
                <span>⠿</span> <span>16. कर्सर से पकड़ कर रीऑर्डर व चालू/बंद करें (Interactive Reorder & Visibility)</span>
              </div>
              <p style="font-size: 0.82rem; color: #e2e8f0; margin: 3px 0 0 0;">
                माउस से पकड़ कर क्रम बदलें अथवा <strong>🟢 चालू / 👁️ बंद</strong> बटन दबाकर किसी भी सेक्शन को छुपाएं या दिखाएं:
              </p>
            </div>
            <button type="button" id="btn_reset_section_order" class="admin-button small-button" style="background: rgba(255,255,255,0.15); border: 1px solid var(--admin-border); color: #fff; font-weight: 700;">
              ↺ डिफ़ॉल्ट क्रम रीसेट करें
            </button>
          </div>
          <div id="blp_sections_reorder_list_wrap" style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
            <!-- Rendered with drag & drop handlers by JS -->
          </div>
        </div>

        <!-- SECTION 17: THEME COLOR & STYLING & STATUS -->
        <div style="background: rgba(139,92,246,0.08); border: 1.5px solid rgba(139,92,246,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <label style="font-weight: 800; color: #a78bfa; font-size: 0.95rem; display: block; margin-bottom: 8px;">
            🎨 17. थीम कलर व पेज स्टेटस (Theme Color Palette System)
          </label>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 14px;">
            <button type="button" class="admin-button small-button theme-color-btn" data-color="#2E7D32" data-dark="#1B5E20" style="background: #2E7D32; color: #fff; font-weight: 700;">🟢 Forest Green</button>
            <button type="button" class="admin-button small-button theme-color-btn" data-color="#EA580C" data-dark="#C2410C" style="background: #EA580C; color: #fff; font-weight: 700;">🟠 Royal Orange</button>
            <button type="button" class="admin-button small-button theme-color-btn" data-color="#1D4ED8" data-dark="#1E40AF" style="background: #1D4ED8; color: #fff; font-weight: 700;">🔵 Ocean Blue</button>
            <button type="button" class="admin-button small-button theme-color-btn" data-color="#DC2626" data-dark="#991B1B" style="background: #DC2626; color: #fff; font-weight: 700;">🔴 Crimson Red</button>
            <button type="button" class="admin-button small-button theme-color-btn" data-color="#7C3AED" data-dark="#5B21B6" style="background: #7C3AED; color: #fff; font-weight: 700;">🟣 Deep Purple</button>
            <button type="button" class="admin-button small-button theme-color-btn" data-color="#D97706" data-dark="#B45309" style="background: #D97706; color: #fff; font-weight: 700;">🟡 Royal Gold</button>
            <div style="display: flex; align-items: center; gap: 6px; margin-left: 8px;">
              <span style="font-size: 0.8rem; color: var(--admin-muted);">कस्टम रंग:</span>
              <input type="color" id="blp_custom_theme_color" value="#2E7D32" style="width: 34px; height: 34px; border: none; border-radius: 6px; cursor: pointer;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="admin-label" style="font-weight: 700;">लाइव / ऑफलाइन स्टेटस:</label>
              <select id="blp_status" class="admin-select" style="width: 100%; padding: 8px 12px; font-weight: 800;">
                <option value="active">🟢 Live / Online</option>
                <option value="draft">⏳ Draft / Offline</option>
                <option value="disabled">🔴 Disabled</option>
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700;">Sticky Button Text:</label>
              <input type="text" id="blp_sticky_btn_text" class="admin-input" placeholder="खरीदें (Buy Now)" value="खरीदें" style="width: 100%; padding: 8px 12px;" />
            </div>
          </div>
        </div>

        <!-- SECTION 18: TRACKING PIXELS & GOOGLE CONSOLE (BUILT-IN AUTOMATIC - SELECT / DESELECT ONLY) -->
        <div style="background: rgba(37,99,235,0.08); border: 1.5px solid rgba(37,99,235,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <label style="font-weight: 800; color: #3b82f6; font-size: 0.95rem; display: block; margin-bottom: 6px;">
            📊 18. ट्रैकिंग पिक्सल्स व गूगल सर्च कंसोल (Kheti Dr. ऑटोमैटिक बिल्ट-इन)
          </label>
          <p style="font-size: 0.8rem; color: var(--admin-muted); margin-bottom: 12px;">
            (खेती डॉक्टर वाला ओरिजिनल Facebook Pixel व Google Tag कोड पहले से सेट है। आपको कोई कोड डालने की ज़रूरत नहीं है, केवल चालू या बंद सेलेक्ट करें:)
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <label style="display: flex; align-items: center; gap: 10px; background: var(--admin-surface, #1e293b); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--admin-border); cursor: pointer;">
              <input type="checkbox" id="blp_fb_pixel_enabled" checked style="width: 20px; height: 20px; accent-color: #2563eb;" />
              <div>
                <div style="font-weight: 800; color: #3b82f6; font-size: 0.9rem;">🔵 Facebook Meta Pixel</div>
                <small style="color: var(--admin-muted); font-size: 0.75rem;">ID: 1671873500553134 (PageView & AddToCart)</small>
              </div>
            </label>
            <label style="display: flex; align-items: center; gap: 10px; background: var(--admin-surface, #1e293b); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--admin-border); cursor: pointer;">
              <input type="checkbox" id="blp_google_tag_enabled" checked style="width: 20px; height: 20px; accent-color: #16a34a;" />
              <div>
                <div style="font-weight: 800; color: #22c55e; font-size: 0.9rem;">📈 Google Analytics & Search Tag</div>
                <small style="color: var(--admin-muted); font-size: 0.75rem;">ID: G-2BWPJVQWPK (Traffic & Ads Conversion)</small>
              </div>
            </label>
          </div>
        </div>

        <!-- SUBMIT & CANCEL BUTTONS -->
        <div style="display: flex; gap: 10px; border-top: 1px solid var(--admin-border); padding-top: 16px; flex-wrap: wrap;">
          <button type="button" id="btn_save_book_lp" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 800; padding: 12px 28px; font-size: 1rem; box-shadow: 0 4px 14px rgba(22,163,74,0.4);">
            💾 बुक लैंडिंग पेज व लाइब्रेरी सुरक्षित करें (Save Page)
          </button>
          <button type="button" id="btn_cancel_book_lp" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted);">
            रद्द करें (Cancel)
          </button>
        </div>
      </form>
    </div>

    <!-- SUB-TAB 1: Active Landing Pages List -->
    <div id="admin-pages-subtab-container" class="admin-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--admin-text);">
          📋 सक्रिय बुक लैंडिंग पेज सूची (All Book Landing Pages)
        </h3>
        <input type="text" id="blp_search_input" class="admin-input" placeholder="🔍 खोजें..." style="max-width: 280px; padding: 6px 10px; font-size: 0.82rem;" />
      </div>

      <div id="blp_table_container" class="admin-table-wrapper">
        <div class="admin-loading">डेटा लोड हो रहा है...</div>
      </div>
    </div>

    <!-- SUB-TAB 2: Storefront Shelves & Segment Manager -->
    <div id="admin-shelves-subtab-container" class="admin-card" style="display: none; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #a855f7;">
            🏪 स्टोरफ्रंट शेल्फ कस्टमाइज़र (Storefront Shelves Manager)
          </h3>
          <p style="font-size: 0.82rem; color: var(--admin-muted); margin: 3px 0 0 0;">
            चुनें कि मुख्य स्टोर (ebooks/ebook.html) पर कौन-सी पुस्तक किस शेल्फ में दिखेगी:
          </p>
        </div>
      </div>
      <div id="admin-shelves-grid-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- SUB-TAB 3: Coming Soon Farmer Leads -->
    <div id="admin-leads-subtab-container" class="admin-card" style="display: none; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #38bdf8;">
            🔔 कमिंग सून इंटरेस्ट लीड्स (Coming Soon Farmer Leads)
          </h3>
          <p style="font-size: 0.82rem; color: var(--admin-muted); margin: 3px 0 0 0;">
            जिन किसानों ने आगामी पुस्तकों के लिए 'Notify Me' किया है, उनकी सूची व WhatsApp संपर्क:
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" onclick="window.exportComingSoonLeadsCsv()" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 700;">
            📥 Export CSV
          </button>
          <button type="button" onclick="window.renderComingSoonLeadsTab()" class="admin-button small-button">
            🔄 Refresh
          </button>
        </div>
      </div>
      <div id="admin-leads-table-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Helper to render section banner uploader blocks in HTML
  function renderSectionBannerUploaderBlock(secKey, labelText) {
    return `
      <div style="background: rgba(0,0,0,0.25); border: 1.5px dashed rgba(255,255,255,0.2); border-radius: 8px; padding: 10px 12px; margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
          <label style="font-weight: 700; font-size: 0.8rem; color: #93c5fd;">${labelText}</label>
          <button type="button" onclick="window.clearSectionBanner('${secKey}')" class="admin-button small-button" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 1px 6px; font-size: 0.72rem;">
            🗑️ बैनर हटाएं
          </button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; align-items: center;">
          <input type="file" accept="image/*" onchange="window.uploadSectionBannerFile('${secKey}', event)" style="font-size: 0.75rem;" />
          <input type="text" id="blp_sec_banner_${secKey}" placeholder="या इमेज URL / Path दर्ज करें" oninput="window.setSectionBannerUrl('${secKey}', this.value)" class="admin-input" style="padding: 4px 8px; font-size: 0.78rem;" />
        </div>
        <div id="blp_sec_banner_preview_wrap_${secKey}" style="margin-top: 6px; display: none;">
          <img id="blp_sec_banner_preview_${secKey}" src="" style="width: 100%; max-height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid var(--admin-border);" />
        </div>
      </div>
    `;
  }

  // Bind Top Listeners
  const builderCard = document.getElementById('admin-book-builder-card');
  const toggleBtn = document.getElementById('btn-toggle-book-builder');
  const closeBtn = document.getElementById('btn-close-book-builder');
  const cancelBtn = document.getElementById('btn_cancel_book_lp');
  const refreshBtn = document.getElementById('book-lp-refresh-btn');
  const saveBtn = document.getElementById('btn_save_book_lp');
  const bookSelect = document.getElementById('blp_select_existing_book');
  const genCodeBtn = document.getElementById('btn_generate_book_code');
  const newCatBtn = document.getElementById('btn_add_new_category');
  const exportBtn = document.getElementById('btn_export_all_json');
  const resetOrderBtn = document.getElementById('btn_reset_section_order');
  const searchInput = document.getElementById('blp_search_input');

  setupImagePreview('blp_file_cover', 'blp_cover_url', 'blp_preview_cover_img');
  setupImagePreview('blp_file_banner', 'blp_banner_url', 'blp_preview_banner_img');

  // Window Section Banner Helpers
  window.setSectionBannerUrl = function(secKey, url) {
    if (url && url.trim().length > 0) {
      currentSectionBanners[secKey] = url.trim();
      const wrap = document.getElementById(`blp_sec_banner_preview_wrap_${secKey}`);
      const img = document.getElementById(`blp_sec_banner_preview_${secKey}`);
      if (img && wrap) {
        img.src = url.trim();
        wrap.style.display = 'block';
      }
    } else {
      delete currentSectionBanners[secKey];
      const wrap = document.getElementById(`blp_sec_banner_preview_wrap_${secKey}`);
      if (wrap) wrap.style.display = 'none';
    }
  };

  window.uploadSectionBannerFile = function(secKey, event) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const dataUrl = re.target.result;
        const input = document.getElementById(`blp_sec_banner_${secKey}`);
        if (input) input.value = dataUrl;
        window.setSectionBannerUrl(secKey, dataUrl);
        showToast(`📸 ${file.name} बैनर लोड हो गया!`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  window.clearSectionBanner = function(secKey) {
    delete currentSectionBanners[secKey];
    const input = document.getElementById(`blp_sec_banner_${secKey}`);
    const wrap = document.getElementById(`blp_sec_banner_preview_wrap_${secKey}`);
    if (input) input.value = '';
    if (wrap) wrap.style.display = 'none';
    showToast('🗑️ सेक्शन बैनर हटा दिया गया', 'info');
  };

  // PDF / DOC Uploader Functions
  window.updatePdfStatusPreview = function(sectionType, url) {
    const wrap = document.getElementById(sectionType === 'main' ? 'blp_main_pdf_status_wrap' : 'blp_free_pdf_status_wrap');
    if (!wrap) return;
    if (url && url.trim().length > 0) {
      const cleanUrl = url.trim();
      wrap.style.display = 'block';
      wrap.innerHTML = `
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #4ade80; font-weight: 800;">✅ फाइल सेट है:</span>
            <code style="color: #38bdf8; font-size: 0.8rem; background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px;">${escapeHtml(cleanUrl)}</code>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <a href="${cleanUrl}" target="_blank" class="admin-button small-button" style="background: #16a34a; color: #fff; padding: 4px 10px; font-size: 0.75rem; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
              <span>📥</span> <span>टेस्ट डाउनलोड / देखें</span>
            </a>
            <button type="button" onclick="window.removeBookPdf('${sectionType}')" class="admin-button small-button" style="background: #ef4444; color: #fff; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="इस फाइल का लिंक हटाएं">
              <span>🗑️</span> <span>हटाएं</span>
            </button>
          </div>
        </div>
      `;
    } else {
      wrap.style.display = 'none';
      wrap.innerHTML = '';
    }
  };

  window.removeBookPdf = function(sectionType) {
    const input = document.getElementById(sectionType === 'main' ? 'blp_main_pdf_url' : 'blp_free_pdf_url');
    const fileInput = document.getElementById(sectionType === 'main' ? 'blp_file_main_pdf' : 'blp_file_free_pdf');
    if (input) input.value = '';
    if (fileInput) fileInput.value = '';
    window.updatePdfStatusPreview(sectionType, '');
    showToast(`🗑️ ${sectionType === 'main' ? 'मुख्य' : 'मुफ़्त/डेमो'} PDF फाइल पाथ हटा दिया गया।`, 'info');
  };

  window.handleBookPdfSelect = async function(sectionType, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    await window.executeBookPdfUpload(sectionType, file);
  };

  window.triggerBookPdfUpload = async function(sectionType) {
    const fileInput = document.getElementById(sectionType === 'main' ? 'blp_file_main_pdf' : 'blp_file_free_pdf');
    const file = fileInput?.files?.[0];
    if (!file) {
      showToast('कृपया पहले फाइल चुनें।', 'error');
      return;
    }
    await window.executeBookPdfUpload(sectionType, file);
  };

  window.executeBookPdfUpload = async function(sectionType, file) {
    const bookId = (document.getElementById('blp_input_book_id')?.value || 'BK013').trim().toUpperCase();
    if (!bookId) {
      showToast('कृपया पहले Book ID (जैसे BK013) दर्ज करें।', 'error');
      return;
    }

    const btn = document.getElementById(sectionType === 'main' ? 'btn_upload_main_pdf' : 'btn_upload_free_pdf');
    const origText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ अपलोड हो रहा है...';
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bookId', bookId);
      formData.append('section', sectionType);

      showToast(`⏳ ${file.name} अपलोड हो रही है...`, 'info');
      const res = await fetch('/api/upload_book_landing.php', {
        method: 'POST',
        body: formData
      });

      let data = {};
      try {
        data = await res.json();
      } catch (pe) {
        data = { error: `Server HTTP ${res.status}: ${res.statusText}` };
      }

      if (res.ok && data.success && data.fileUrl) {
        const urlInput = document.getElementById(sectionType === 'main' ? 'blp_main_pdf_url' : 'blp_free_pdf_url');
        if (urlInput) {
          urlInput.value = data.fileUrl;
        }
        window.updatePdfStatusPreview(sectionType, data.fileUrl);
        showToast(`✅ ${file.name} सफलतापूर्वक अपलोड हो गई!`, 'success');
      } else {
        showToast(`❌ अपलोड विफल: ${data.error || 'Server error'}`, 'error');
      }
    } catch (err) {
      console.error('PDF upload error:', err);
      showToast(`❌ अपलोड एरर: ${err.message || 'सर्वर से कनेक्ट नहीं हो सका'}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  };

  // Theme Color Buttons
  document.querySelectorAll('.theme-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedThemePrimary = btn.dataset.color;
      selectedThemeDark = btn.dataset.dark;
      document.getElementById('blp_custom_theme_color').value = selectedThemePrimary;
      showToast(`🎨 थीम कलर: ${btn.textContent.trim()} चुना गया`, 'info');
    });
  });

  document.getElementById('blp_custom_theme_color')?.addEventListener('input', (e) => {
    selectedThemePrimary = e.target.value;
    selectedThemeDark = adjustColorBrightness(e.target.value, -30);
  });

  toggleBtn?.addEventListener('click', () => {
    if (builderCard.style.display === 'none') {
      resetBookBuilder();
      builderCard.style.display = 'block';
      builderCard.scrollIntoView({ behavior: 'smooth' });
    } else {
      builderCard.style.display = 'none';
    }
  });

  closeBtn?.addEventListener('click', () => { builderCard.style.display = 'none'; resetBookBuilder(); });
  cancelBtn?.addEventListener('click', () => { builderCard.style.display = 'none'; resetBookBuilder(); });
  refreshBtn?.addEventListener('click', loadAllData);
  saveBtn?.addEventListener('click', saveBookLandingPage);
  searchInput?.addEventListener('input', renderTable);
  genCodeBtn?.addEventListener('click', autoGenerateBookId);
  newCatBtn?.addEventListener('click', addNewCategoryPrompt);
  exportBtn?.addEventListener('click', exportJsonFiles);
  resetOrderBtn?.addEventListener('click', resetSectionsOrder);

  bookSelect?.addEventListener('change', (e) => {
    const bId = e.target.value;
    const b = allBooks.find(x => x.id === bId);
    if (!b) return;

    document.getElementById('blp_input_book_id').value = b.id;
    document.getElementById('blp_category_select').value = b.category || 'Agriculture';
    document.getElementById('blp_hero_title').value = b.heading || b.name || '';
    document.getElementById('blp_hero_mrp').value = b.mrp || 299;
    document.getElementById('blp_hero_offer_price').value = b.offerPrice || 99;
    document.getElementById('blp_cover_url').value = b.cover || b.thumbnail || '';
    document.getElementById('blp_banner_url').value = b.banner || '/images/banners/kharif-master-guide-2026-hero-banner.webp';
    document.getElementById('blp_preview_cover_img').src = b.cover || b.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp';
    document.getElementById('blp_preview_banner_img').src = b.banner || '/images/banners/kharif-master-guide-2026-hero-banner.webp';
  });

  document.getElementById('btn_add_kpi_badge_item')?.addEventListener('click', () => {
    currentKpis.push({ icon: 'fa-seedling', text: '120+ रंगीन पेज' });
    renderKpiBadgesInBuilder();
  });

  document.getElementById('btn_add_why_card_item')?.addEventListener('click', () => {
    currentWhyCards.push({ icon: '🌱', title: 'नया कारण शीर्षक', desc: 'विवरण यहाँ लिखें...' });
    renderWhyCardsInBuilder();
  });

  document.getElementById('btn_add_video_item')?.addEventListener('click', () => {
    currentVideos.push({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '🎥 नया वीडियो डेमो', ratio: '16:9' });
    renderVideosInBuilder();
  });

  document.getElementById('btn_add_review_item')?.addEventListener('click', () => {
    currentReviews.push({ name: 'संतुष्ट पाठक', location: 'भारत', rating: 5, gender: 'male', comment: 'बहुत ही उपयोगी व व्यावहारिक पुस्तक है।' });
    renderReviewsInBuilder();
  });

  document.getElementById('btn_add_demo_image')?.addEventListener('click', () => {
    currentDemoImages.push('/images/books/kharif-master-guide-2026-preview-01.webp');
    renderDemoImagesInBuilder();
  });

  document.getElementById('btn_add_suggested_book_item')?.addEventListener('click', () => {
    currentSuggestedBooks.push({
      image: '/images/books/kharif-master-guide-2026-cover.webp',
      title: 'संबंधित ई-बुक गाइड',
      offerPrice: 99,
      mrp: 299,
      link: 'BK002'
    });
    renderSuggestedBooksInBuilder();
  });

  document.getElementById('btn_add_bonus_point_item')?.addEventListener('click', () => {
    currentBonusPoints.push('✅ नया बोनस पॉइंट');
    renderBonusPointsInBuilder();
  });

  document.getElementById('btn_add_toc_point_item')?.addEventListener('click', () => {
    currentTocPoints.push('नया अध्याय व विषय');
    renderTocPointsInBuilder();
  });

  // GitHub Cover Image Dropdown Sync (Mutual Exclusion: Clears File Input)
  document.getElementById('blp_select_git_cover')?.addEventListener('change', (e) => {
    if (e.target.value) {
      const val = e.target.value;
      const urlInput = document.getElementById('blp_cover_url');
      const prevImg = document.getElementById('blp_preview_cover_img');
      const fileInput = document.getElementById('blp_file_cover');
      if (fileInput) fileInput.value = ''; // Clear file input so no duplicate upload
      if (urlInput) urlInput.value = val;
      if (prevImg) prevImg.src = val;
      showToast(`📸 GitHub कवर चुना गया (डुप्लिकेट अपलोड नहीं होगा): ${val}`, 'info');
    }
  });

  // GitHub Hero Banner Dropdown Sync (Mutual Exclusion: Clears File Input)
  document.getElementById('blp_select_git_banner')?.addEventListener('change', (e) => {
    if (e.target.value) {
      const val = e.target.value;
      const urlInput = document.getElementById('blp_banner_url');
      const prevImg = document.getElementById('blp_preview_banner_img');
      const fileInput = document.getElementById('blp_file_banner');
      if (fileInput) fileInput.value = ''; // Clear file input so no duplicate upload
      if (urlInput) urlInput.value = val;
      if (prevImg) prevImg.src = val;
      showToast(`🖼️ GitHub बैनर चुना गया (डुप्लिकेट अपलोड नहीं होगा): ${val}`, 'info');
    }
  });

  // GitHub Main Paid PDF Dropdown Sync (Mutual Exclusion: Clears File Input)
  document.getElementById('blp_select_git_main_pdf')?.addEventListener('change', (e) => {
    if (e.target.value) {
      const val = e.target.value;
      const urlInput = document.getElementById('blp_main_pdf_url');
      const fileInput = document.getElementById('blp_file_main_pdf');
      if (fileInput) fileInput.value = ''; // Clear file input so no duplicate upload
      if (urlInput) urlInput.value = val;
      window.updatePdfStatusPreview('main', val);
      showToast(`📄 GitHub मुख्य PDF चुनी गई (री-अपलोड नहीं होगा): ${val}`, 'info');
    }
  });

  // GitHub Free Demo PDF Dropdown Sync (Mutual Exclusion: Clears File Input)
  document.getElementById('blp_select_git_free_pdf')?.addEventListener('change', (e) => {
    if (e.target.value) {
      const val = e.target.value;
      const urlInput = document.getElementById('blp_free_pdf_url');
      const fileInput = document.getElementById('blp_file_free_pdf');
      if (fileInput) fileInput.value = ''; // Clear file input so no duplicate upload
      if (urlInput) urlInput.value = val;
      window.updatePdfStatusPreview('free', val);
      showToast(`🎁 GitHub फ्री PDF चुनी गई (री-अपलोड नहीं होगा): ${val}`, 'info');
    }
  });

  // Wire up Live Image Preview & FileReader for Cover & Banner
  setupImagePreview('blp_file_cover', 'blp_cover_url', 'blp_preview_cover_img');
  setupImagePreview('blp_file_banner', 'blp_banner_url', 'blp_preview_banner_img');

  await loadAllData();

  function autoGenerateBookId() {
    let maxNum = 0;
    const combined = [...allBooks, ...allLandingPages];
    combined.forEach(b => {
      if (b.id && b.id.startsWith('BK')) {
        const num = parseInt(b.id.replace('BK', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextCode = `BK${String(maxNum + 1).padStart(3, '0')}`;
    document.getElementById('blp_input_book_id').value = nextCode;
    showToast(`⚡ नया Book Code जनरेट हुआ: ${nextCode}`, 'success');
  }

  function addNewCategoryPrompt() {
    const newCat = prompt('नया Category का नाम दर्ज करें (उदा. Organic Farming, Horticulture, Seeds):');
    if (newCat && newCat.trim()) {
      const cleanCat = newCat.trim();
      const select = document.getElementById('blp_category_select');
      if (select) {
        const opt = document.createElement('option');
        opt.value = cleanCat;
        opt.textContent = `📁 ${cleanCat}`;
        opt.selected = true;
        select.appendChild(opt);
        showToast(`📁 नई कैटेगरी '${cleanCat}' जोड़ी गई!`, 'success');
      }
    }
  }

  function setupImagePreview(fileInputId, urlInputId, previewImgId) {
    const fileInput = document.getElementById(fileInputId);
    const urlInput = document.getElementById(urlInputId);
    const previewImg = previewImgId ? document.getElementById(previewImgId) : null;

    urlInput?.addEventListener('input', () => {
      if (urlInput.value && previewImg) previewImg.src = urlInput.value;
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (fileInputId === 'blp_file_cover') {
          const s = document.getElementById('blp_select_git_cover');
          if (s) s.value = '';
        }
        if (fileInputId === 'blp_file_banner') {
          const s = document.getElementById('blp_select_git_banner');
          if (s) s.value = '';
        }
        const reader = new FileReader();
        reader.onload = (re) => {
          const dataUrl = re.target.result;
          if (urlInput) urlInput.value = dataUrl;
          if (previewImg) previewImg.src = dataUrl;
          showToast(`📸 ${file.name} इमेज लोड हो गई!`, 'info');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  async function loadAllData() {
    const tableWrap = document.getElementById('blp_table_container');
    if (tableWrap) tableWrap.innerHTML = '<div class="admin-loading">डेटा लोड हो रहा है...</div>';

    try {
      const res = await fetch('/data/books.json?v=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        allBooks = json.books || [];
      }
    } catch (e) {}

    // Check localStorage custom books
    try {
      const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      if (Array.isArray(customBooks)) {
        customBooks.forEach(cb => {
          const idx = allBooks.findIndex(x => x.id === cb.id);
          if (idx >= 0) allBooks[idx] = cb;
          else allBooks.push(cb);
        });
      }
    } catch (e) {}

    if (bookSelect) {
      bookSelect.innerHTML = '<option value="">-- लाइब्रेरी से ई-बुक चुनें (Auto-Fill) --</option>' +
        allBooks.map(b => `<option value="${b.id}">${b.id}: ${b.heading || b.name} (₹${b.offerPrice || 99})</option>`).join('');
    }

    const bonusLibSelect = document.getElementById('blp_bonus_library_select');
    if (bonusLibSelect) {
      bonusLibSelect.innerHTML = '<option value="">📚 लाइब्रेरी से बुक बंडल में जोड़ें...</option>' +
        allBooks.map(b => `<option value="${b.id}">+ [${b.id}] ${b.heading || b.name} (मूल्य: ₹${b.offerPrice || 99})</option>`).join('');
    }

    const suggestedLibSelect = document.getElementById('blp_suggested_library_select');
    if (suggestedLibSelect) {
      suggestedLibSelect.innerHTML = '<option value="">📚 लाइब्रेरी से संबंधित बुक चुनें...</option>' +
        allBooks.map(b => `<option value="${b.id}">+ [${b.id}] ${b.heading || b.name} (₹${b.offerPrice || 99})</option>`).join('');
    }

    allLandingPages = [];
    try {
      const res = await fetch('/data/universal-book-landing-pages.json?v=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        allLandingPages = json.bookLandingPages || [];
      }
    } catch (e) {}

    try {
      const stored = localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES');
      if (stored) {
        const localList = JSON.parse(stored);
        if (Array.isArray(localList)) {
          localList.forEach(item => {
            const idx = allLandingPages.findIndex(x => x.id === item.id);
            if (idx >= 0) allLandingPages[idx] = item;
            else allLandingPages.push(item);
          });
        }
      }
    } catch (e) {}

    updateKPIs();
    renderTable();
  }

  function updateKPIs() {
    const total = allLandingPages.length;
    const active = allLandingPages.filter(p => (p.status || 'active') === 'active').length;
    const bundles = allLandingPages.filter(p => (p.bonuses && p.bonuses.length > 0) || (p.bonus_books && p.bonus_books.length > 0)).length;
    const videos = allLandingPages.filter(p => (p.videos && p.videos.length > 0) || (p.video && p.video.enabled)).length;

    const elTotal = document.getElementById('kpi-book-total');
    const elActive = document.getElementById('kpi-book-active');
    const elBundles = document.getElementById('kpi-book-bundles');
    const elVideos = document.getElementById('kpi-book-videos');

    if (elTotal) elTotal.textContent = total;
    if (elActive) elActive.textContent = active;
    if (elBundles) elBundles.textContent = bundles;
    if (elVideos) elVideos.textContent = videos;
  }

  function renderTable() {
    const tableWrap = document.getElementById('blp_table_container');
    if (!tableWrap) return;

    const q = (searchInput?.value || '').toLowerCase().trim();
    const filtered = allLandingPages.filter(p => {
      const id = (p.id || '').toLowerCase();
      const title = (p.hero?.title || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return id.includes(q) || title.includes(q) || cat.includes(q);
    });

    if (filtered.length === 0) {
      tableWrap.innerHTML = '<div class="admin-empty" style="text-align:center;padding:2rem;color:var(--admin-muted);">कोई बुक लैंडिंग पेज नहीं मिला।</div>';
      return;
    }

    tableWrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Book ID</th>
            <th>कवर</th>
            <th>शीर्षक व कैटेगरी</th>
            <th>स्टोर शेल्फ व पब्लिशिंग</th>
            <th>मूल्य</th>
            <th>स्थिति (Status)</th>
            <th style="text-align:center;">एक्शन (Actions)</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(p => {
            const rawId = (p.id || '').toUpperCase();
            let liveUrl = `/ebooks/book-landing.html?id=${encodeURIComponent(p.id)}`;
            if (rawId === 'BK001') liveUrl = '/ebooks/kharif-master-guide-2026.html';
            else if (rawId === 'BK002') liveUrl = '/ebooks/kheti-dr.html';
            const isLive = (p.status || 'active') === 'active';
            const isComingSoon = p.is_coming_soon === true || p.store_badge === 'coming_soon';
            const themeCol = p.theme_primary || '#2E7D32';
            const badgeText = p.store_badge || 'best_seller';
            const targets = p.publish_targets || ['ebook_store', 'category_page', 'my_library', 'home_page'];

            return `
              <tr>
                <td><strong style="font-family:monospace;color:${themeCol};font-size:1rem;">${p.id}</strong></td>
                <td>
                  <img src="${p.hero?.cover_image || '/images/books/kharif-master-guide-2026-cover.webp'}" alt="Cover" style="width:42px;height:56px;object-fit:cover;border-radius:6px;border:1px solid var(--admin-border);" />
                </td>
                <td>
                  <div style="font-weight:800;color:var(--admin-text);font-size:0.92rem;">${p.hero?.title || 'Untitled'}</div>
                  <div style="font-size:0.75rem;color:#16a34a;font-weight:700;">📁 ${p.category || 'Agriculture'}</div>
                </td>
                <td>
                  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
                    <span style="font-size:0.72rem;background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:800;">
                      🏷️ ${badgeText}
                    </span>
                  </div>
                  <div style="font-size:0.7rem;color:var(--admin-muted);">
                    ${targets.map(t => `<span style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px;margin-right:3px;">${t.replace('_', ' ')}</span>`).join('')}
                  </div>
                </td>
                <td>
                  <strong style="color:#16a34a;font-size:1rem;">₹${p.hero?.offer_price || 99}</strong>
                  <span style="font-size:0.75rem;color:var(--admin-muted);text-decoration:line-through;margin-left:4px;">₹${p.hero?.mrp || 299}</span>
                </td>
                <td>
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <button type="button" onclick="window.toggleLiveStatus('${p.id}')" class="admin-button small-button" style="background:${isLive ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)'};color:${isLive ? '#16a34a' : '#ef4444'};border:1px solid ${isLive ? '#16a34a' : '#ef4444'};padding:3px 8px;border-radius:6px;font-size:0.78rem;font-weight:800;">
                      ${isLive ? '🟢 Live' : '🔴 Offline'}
                    </button>
                    ${isComingSoon ? '<span style="font-size:0.68rem;background:#fee2e2;color:#991b1b;padding:1px 4px;border-radius:3px;font-weight:700;text-align:center;">⏳ Coming Soon</span>' : ''}
                  </div>
                </td>
                <td>
                  <div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;">
                    <button type="button" onclick="window.editBookLandingPage('${p.id}')" class="admin-button small-button" style="background:#f59e0b;color:#000;font-weight:900;padding:6px 12px;border-radius:8px;box-shadow:0 2px 8px rgba(245,158,11,0.3);" title="इस पेज को एडिट करें">
                      ✏️ पेज एडिट करें
                    </button>
                    <a href="${liveUrl}" target="_blank" class="admin-button small-button" style="background:#2563eb;color:#fff;text-decoration:none;font-weight:700;" title="लाइव पेज देखें">
                      👁️ देखें
                    </a>
                    <button type="button" onclick="window.copyBookLandingUrl('${p.id}')" class="admin-button small-button" style="background:transparent;border:1px solid var(--admin-border);color:var(--admin-muted);" title="लिंक कॉपी करें">
                      📋 लिंक
                    </button>
                    <button type="button" onclick="window.deleteBookLandingPage('${p.id}')" class="admin-button small-button" style="background:#ef4444;color:#fff;" title="हटाएं">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // -------------------------------------------------------------
  // SUB-TAB SWITCHING LOGIC (Pages vs Shelves vs Leads)
  // -------------------------------------------------------------
  window.switchAdminSubTab = function(tab) {
    const pagesCard = document.getElementById('admin-pages-subtab-container');
    const shelvesCard = document.getElementById('admin-shelves-subtab-container');
    const leadsCard = document.getElementById('admin-leads-subtab-container');

    const btnPages = document.getElementById('tab-btn-landing-pages');
    const btnShelves = document.getElementById('tab-btn-shelves-mgr');
    const btnLeads = document.getElementById('tab-btn-coming-soon-leads');

    if (pagesCard) pagesCard.style.display = tab === 'pages' ? 'block' : 'none';
    if (shelvesCard) shelvesCard.style.display = tab === 'shelves' ? 'block' : 'none';
    if (leadsCard) leadsCard.style.display = tab === 'leads' ? 'block' : 'none';

    if (btnPages) btnPages.style.background = tab === 'pages' ? '#16a34a' : 'var(--admin-surface, #1e293b)';
    if (btnPages) btnPages.style.color = tab === 'pages' ? '#fff' : 'var(--admin-text)';

    if (btnShelves) btnShelves.style.background = tab === 'shelves' ? '#a855f7' : 'var(--admin-surface, #1e293b)';
    if (btnShelves) btnShelves.style.color = tab === 'shelves' ? '#fff' : 'var(--admin-text)';

    if (btnLeads) btnLeads.style.background = tab === 'leads' ? '#0284c7' : 'var(--admin-surface, #1e293b)';
    if (btnLeads) btnLeads.style.color = tab === 'leads' ? '#fff' : 'var(--admin-text)';

    if (tab === 'shelves') window.renderStoreShelvesTab();
    if (tab === 'leads') window.renderComingSoonLeadsTab();
  };

  // -------------------------------------------------------------
  // RENDER STORE SHELVES & SEGMENTS MANAGER
  // -------------------------------------------------------------
  // RENDER STORE SHELVES & SEGMENTS MANAGER
  // -------------------------------------------------------------
  window.renderStoreShelvesTab = function() {
    const wrap = document.getElementById('admin-shelves-grid-container');
    if (!wrap) return;

    // Combine all unique books from books.json + custom books + landing pages
    const combinedBooksMap = new Map();
    allBooks.forEach(b => {
      if (b && b.id) {
        combinedBooksMap.set(b.id, {
          id: b.id,
          title: b.heading || b.name || b.id,
          cover: b.cover || b.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
          category: b.category || 'Agriculture',
          offerPrice: b.offerPrice || 99,
          mrp: b.mrp || 299,
          badge: b.badge || b.store_badge || (b.isComingSoon || b.status === 'coming_soon' ? 'coming_soon' : 'best_seller'),
          isComingSoon: b.isComingSoon || b.status === 'coming_soon'
        });
      }
    });
    allLandingPages.forEach(p => {
      if (p && p.id) {
        const existing = combinedBooksMap.get(p.id) || {};
        combinedBooksMap.set(p.id, {
          ...existing,
          id: p.id,
          title: p.hero?.title || existing.title || p.id,
          cover: p.hero?.cover_image || existing.cover || '/images/books/kharif-master-guide-2026-cover.webp',
          category: p.category || existing.category || 'Agriculture',
          offerPrice: p.hero?.offer_price || existing.offerPrice || 99,
          mrp: p.hero?.mrp || existing.mrp || 299,
          badge: p.store_badge || existing.badge || 'best_seller',
          isComingSoon: p.is_coming_soon || existing.isComingSoon || false
        });
      }
    });

    const uniqueBookList = Array.from(combinedBooksMap.values());

    const shelves = [
      { key: 'best_seller', title: '🔥 Best Sellers Shelf (सर्वाधिक बिकने वाली)', desc: 'स्टोर पर सबसे ऊपर मुख्य ग्रिड में दिखने वाली ई-बुक्स।' },
      { key: 'new_arrival', title: '🆕 New Arrivals Shelf (नई पुस्तकें)', desc: 'हाल ही में जोड़ी गई नई ई-बुक्स और रिसर्च गाइड्स।' },
      { key: 'trending', title: '⭐ Trending Shelf (ट्रेंडिंग)', desc: 'सर्वाधिक खोजी व चर्चित ई-बुक्स।' },
      { key: 'coming_soon', title: '⏳ Coming Soon Shelf (आगामी पुस्तकें)', desc: 'प्री-लॉन्च पुस्तकें जहाँ किसान "Notify Me" बटन दबा सकते हैं।' }
    ];

    wrap.innerHTML = shelves.map(shelf => {
      const booksInShelf = uniqueBookList.filter(b => {
        const lp = allLandingPages.find(p => p.id === b.id);
        const currentBadge = lp ? (lp.store_badge || (lp.is_coming_soon ? 'coming_soon' : '')) : (b.badge || (b.isComingSoon ? 'coming_soon' : ''));
        return currentBadge === shelf.key || (shelf.key === 'coming_soon' && (b.isComingSoon || lp?.is_coming_soon));
      });

      return `
        <div style="background:var(--admin-surface, #1e293b);border:1.5px solid var(--admin-border);border-radius:12px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div style="font-weight:800;font-size:1rem;color:#f8fafc;">
              ${shelf.title}
            </div>
            <span style="font-size:0.75rem;background:rgba(168,85,247,0.15);color:#c084fc;padding:2px 8px;border-radius:12px;font-weight:800;">
              ${booksInShelf.length} पुस्तकें
            </span>
          </div>
          <p style="font-size:0.75rem;color:var(--admin-muted);margin-bottom:12px;">
            ${shelf.desc}
          </p>

          <div style="background:#0f172a;border-radius:8px;padding:10px;min-height:90px;max-height:220px;overflow-y:auto;margin-bottom:12px;">
            ${booksInShelf.length === 0 ? '<div style="color:var(--admin-muted);font-size:0.78rem;text-align:center;padding:10px;">इस शेल्फ में अभी कोई पुस्तक नहीं है।</div>' : 
              booksInShelf.map(b => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e293b;gap:8px;">
                  <div style="display:flex;align-items:center;gap:8px;overflow:hidden;">
                    <img src="${b.cover}" alt="Cover" style="width:26px;height:34px;object-fit:cover;border-radius:3px;flex-shrink:0;" />
                    <span style="font-size:0.82rem;font-weight:700;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${b.title}">
                      [${b.id}] ${b.title}
                    </span>
                  </div>
                  <button type="button" onclick="window.removeBookFromShelf('${b.id}')" style="background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#ef4444;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:0.75rem;font-weight:800;flex-shrink:0;">
                    &times; हटाएं
                  </button>
                </div>
              `).join('')
            }
          </div>

          <div style="display:flex;gap:6px;">
            <select id="shelf_add_select_${shelf.key}" class="admin-select" style="flex:1;padding:6px;font-size:0.78rem;font-weight:700;">
              <option value="">📚 लाइब्रेरी से पुस्तक चुनें (${uniqueBookList.length} उपलब्ध)...</option>
              ${uniqueBookList.map(b => `<option value="${b.id}">[${b.id}] ${b.title} (₹${b.offerPrice})</option>`).join('')}
            </select>
            <button type="button" onclick="window.addBookToShelf('${shelf.key}')" class="admin-button small-button" style="background:#16a34a;color:#fff;font-weight:800;">
              जोड़ें
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  window.addBookToShelf = function(shelfKey) {
    const sel = document.getElementById(`shelf_add_select_${shelfKey}`);
    const bId = sel?.value;
    if (!bId) {
      showToast('⚠️ कृपया जोड़ने के लिए पुस्तक चुनें!', 'error');
      return;
    }

    let page = allLandingPages.find(p => p.id === bId);
    const bookObj = allBooks.find(b => b.id === bId);

    if (!page && bookObj) {
      page = {
        id: bookObj.id,
        slug: bookObj.slug || bookObj.id.toLowerCase(),
        category: bookObj.category || 'Agriculture',
        status: 'active',
        theme_primary: '#15803d',
        theme_dark: '#0e5227',
        store_badge: shelfKey,
        is_coming_soon: shelfKey === 'coming_soon',
        publish_targets: ['ebook_store', 'category_page', 'my_library', 'home_page'],
        hero: {
          tag: '🌾 Agriculture eBook Guide',
          title: bookObj.heading || bookObj.name || bookObj.id,
          subtitle: 'सम्पूर्ण वैज्ञानिक व व्यावहारिक मार्गदर्शिका',
          description: 'इस डिजिटल पुस्तक में फसल प्रबंधन और समाधान के प्रमाणित तरीके विस्तार से समझाए गए हैं।',
          mrp: bookObj.mrp || 299,
          offer_price: bookObj.offerPrice || 99,
          offer_badge: 'Launch Offer',
          rating_score: '4.9',
          rating_count: '120+ Ratings',
          cover_image: bookObj.cover || bookObj.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
          banner_image: bookObj.banner || '/images/banners/kharif-master-guide-2026-hero-banner.webp',
          features: ['120+ रंगीन पेज', 'रोग व कीट पहचान', 'स्प्रे चार्ट', 'आजीवन डिजिटल एक्सेस']
        }
      };
      allLandingPages.unshift(page);
    } else if (page) {
      page.store_badge = shelfKey;
      page.is_coming_soon = shelfKey === 'coming_soon';
    }

    if (bookObj) {
      bookObj.badge = shelfKey;
      bookObj.store_badge = shelfKey;
      bookObj.isComingSoon = shelfKey === 'coming_soon';
    }

    try {
      localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(allLandingPages));
      
      const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      const cbIdx = customBooks.findIndex(x => x.id === bId);
      const updatedCustom = {
        ...(bookObj || {}),
        id: bId,
        heading: page?.hero?.title || bookObj?.heading || bId,
        name: page?.hero?.title || bookObj?.name || bId,
        badge: shelfKey,
        store_badge: shelfKey,
        isComingSoon: shelfKey === 'coming_soon'
      };
      if (cbIdx >= 0) customBooks[cbIdx] = updatedCustom;
      else customBooks.unshift(updatedCustom);
      localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(customBooks));
    } catch (e) {}

    window.renderStoreShelvesTab();
    renderTable();
    updateKPIs();
    showToast(`✅ [${bId}] पुस्तक को '${shelfKey}' शेल्फ में जोड़ दिया गया!`, 'success');
  };

  window.removeBookFromShelf = function(bId) {
    const page = allLandingPages.find(p => p.id === bId);
    if (page) {
      page.store_badge = 'other';
      page.is_coming_soon = false;
    }

    const bookObj = allBooks.find(b => b.id === bId);
    if (bookObj) {
      bookObj.badge = 'other';
      bookObj.store_badge = 'other';
      bookObj.isComingSoon = false;
    }

    try {
      localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(allLandingPages));
      const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      const cbIdx = customBooks.findIndex(x => x.id === bId);
      if (cbIdx >= 0) {
        customBooks[cbIdx].badge = 'other';
        customBooks[cbIdx].store_badge = 'other';
        customBooks[cbIdx].isComingSoon = false;
        localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(customBooks));
      }
    } catch (e) {}

    window.renderStoreShelvesTab();
    renderTable();
    updateKPIs();
    showToast(`🗑️ [${bId}] पुस्तक को शेल्फ से हटा दिया गया।`, 'info');
  };

  // -------------------------------------------------------------
  // RENDER COMING SOON LEADS TAB
  // -------------------------------------------------------------
  window.renderComingSoonLeadsTab = function() {
    const wrap = document.getElementById('admin-leads-table-container');
    if (!wrap) return;

    let leads = [];
    try {
      leads = JSON.parse(localStorage.getItem('AAROGYAM_COMING_SOON_LEADS') || '[]');
    } catch (e) {}

    if (!leads || leads.length === 0) {
      wrap.innerHTML = `
        <div style="text-align:center;padding:40px;background:#0f172a;border-radius:12px;color:var(--admin-muted);border:1px dashed var(--admin-border);">
          <span style="font-size:2.5rem;">🔔</span>
          <h4 style="color:#f8fafc;margin:10px 0 4px 0;">अभी कोई कमिंग सून लीड्स नहीं हैं</h4>
          <p style="font-size:0.82rem;margin:0;">जब भी किसान किसी आगामी पुस्तक पर "Notify Me" दबाएंगे, उनके नाम व WhatsApp नंबर यहाँ आ जाएंगे।</p>
        </div>
      `;
      return;
    }

    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>👤 किसान का नाम</th>
            <th>📱 WhatsApp मोबाइल</th>
            <th>📖 इच्छुक ई-बुक</th>
            <th>📅 तारीख व समय</th>
            <th>💬 1-Click WhatsApp</th>
            <th>एक्शन</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map((ld, idx) => {
            const cleanPhone = String(ld.userPhone || '').replace(/[^0-9]/g, '');
            const waText = encodeURIComponent(`नमस्ते ${ld.userName || 'किसान भाई'} जी, Aarogyam India पर '${ld.bookTitle || 'ई-बुक'}' में रुचि दिखाने के लिए धन्यवाद! आपकी पुस्तक अब तैयार है।`);
            const waUrl = `https://wa.me/91${cleanPhone}?text=${waText}`;

            return `
              <tr>
                <td>${idx + 1}</td>
                <td><strong style="color:#f8fafc;">${ld.userName || 'Unknown'}</strong></td>
                <td><strong style="color:#38bdf8;font-family:monospace;">${ld.userPhone}</strong></td>
                <td><span style="color:#16a34a;font-weight:700;">${ld.bookTitle}</span></td>
                <td><small style="color:var(--admin-muted);">${ld.registeredAt || 'हाल ही में'}</small></td>
                <td>
                  <a href="${waUrl}" target="_blank" class="admin-button small-button" style="background:#25D366;color:#fff;text-decoration:none;font-weight:800;display:inline-flex;align-items:center;gap:4px;">
                    💬 मैसेज भेजें
                  </a>
                </td>
                <td>
                  <button type="button" onclick="window.deleteComingSoonLead(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:2px 6px;">
                    🗑️
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  };

  window.deleteComingSoonLead = function(idx) {
    try {
      let leads = JSON.parse(localStorage.getItem('AAROGYAM_COMING_SOON_LEADS') || '[]');
      leads.splice(idx, 1);
      localStorage.setItem('AAROGYAM_COMING_SOON_LEADS', JSON.stringify(leads));
      window.renderComingSoonLeadsTab();
      showToast('🗑️ लीड हटा दी गई।', 'info');
    } catch (e) {}
  };

  window.exportComingSoonLeadsCsv = function() {
    let leads = [];
    try {
      leads = JSON.parse(localStorage.getItem('AAROGYAM_COMING_SOON_LEADS') || '[]');
    } catch (e) {}

    if (leads.length === 0) {
      alert('एक्सपोर्ट करने के लिए कोई लीड उपलब्ध नहीं है।');
      return;
    }

    let csv = "Name,Mobile,BookTitle,RegisteredAt\n";
    leads.forEach(l => {
      csv += `"${l.userName}","${l.userPhone}","${l.bookTitle}","${l.registeredAt}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aarogyam-coming-soon-leads-${Date.now()}.csv`;
    a.click();
    showToast('📥 CSV फाइल डाउनलोड हो गई!', 'success');
  };

  // ==========================================================
  // BUILDER REPEATERS
  // ==========================================================
  function renderKpiBadgesInBuilder() {
    const wrap = document.getElementById('blp_kpi_badges_list_wrap');
    if (!wrap) return;
    if (currentKpis.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:8px;">कोई KPI बैज नहीं है। "+ नया KPI बैज जोड़ें" पर क्लिक करें।</div>';
      return;
    }
    wrap.innerHTML = currentKpis.map((kpi, idx) => `
      <div style="background:var(--admin-surface, #1e293b);border:1px solid var(--admin-border);border-radius:8px;padding:8px 10px;display:grid;grid-template-columns:1fr 2fr auto;gap:8px;align-items:center;">
        <select onchange="window.updateKpiField(${idx}, 'icon', this.value)" class="admin-select" style="padding:4px 8px;font-size:0.82rem;font-weight:700;">
          <option value="fa-seedling" ${kpi.icon === 'fa-seedling' ? 'selected' : ''}>🌱 fa-seedling</option>
          <option value="fa-camera" ${kpi.icon === 'fa-camera' ? 'selected' : ''}>📷 fa-camera</option>
          <option value="fa-circle-check" ${kpi.icon === 'fa-circle-check' ? 'selected' : ''}>✅ fa-circle-check</option>
          <option value="fa-gift" ${kpi.icon === 'fa-gift' ? 'selected' : ''}>🎁 fa-gift</option>
          <option value="fa-flask" ${kpi.icon === 'fa-flask' ? 'selected' : ''}>🧪 fa-flask</option>
          <option value="fa-user-doctor" ${kpi.icon === 'fa-user-doctor' ? 'selected' : ''}>🩺 fa-user-doctor</option>
          <option value="fa-shield-halved" ${kpi.icon === 'fa-shield-halved' ? 'selected' : ''}>🛡️ fa-shield-halved</option>
          <option value="fa-bolt" ${kpi.icon === 'fa-bolt' ? 'selected' : ''}>⚡ fa-bolt</option>
          <option value="fa-book-open" ${kpi.icon === 'fa-book-open' ? 'selected' : ''}>📖 fa-book-open</option>
        </select>
        <input type="text" placeholder="बैज टेक्स्ट (उदा. 120 पेज की प्रीमियम)" value="${escapeHtml(kpi.text || '')}" onchange="window.updateKpiField(${idx}, 'text', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;font-weight:700;" />
        <button type="button" onclick="window.removeKpiItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:3px 8px;">&times;</button>
      </div>
    `).join('');
  }

  function renderWhyCardsInBuilder() {
    const wrap = document.getElementById('blp_why_cards_list_wrap');
    if (!wrap) return;
    if (currentWhyCards.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:8px;">कोई कारण कार्ड नहीं है। "+ नया Why Card जोड़ें" पर क्लिक करें।</div>';
      return;
    }
    wrap.innerHTML = currentWhyCards.map((card, idx) => `
      <div style="background:var(--admin-surface, #1e293b);border:1px solid var(--admin-border);border-radius:8px;padding:10px;margin-bottom:6px;">
        <div style="display:grid;grid-template-columns:80px 1.5fr auto;gap:8px;align-items:center;margin-bottom:6px;">
          <input type="text" placeholder="इमोजी 🌱" value="${escapeHtml(card.icon || '🌱')}" onchange="window.updateWhyCardField(${idx}, 'icon', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.85rem;text-align:center;" />
          <input type="text" placeholder="कारण शीर्षक (उदा. वैज्ञानिक जानकारी)" value="${escapeHtml(card.title || '')}" onchange="window.updateWhyCardField(${idx}, 'title', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.85rem;font-weight:700;" />
          <button type="button" onclick="window.removeWhyCardItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:3px 8px;">&times;</button>
        </div>
        <textarea placeholder="कार्ड का विवरण..." onchange="window.updateWhyCardField(${idx}, 'desc', this.value)" class="admin-textarea" rows="2" style="width:100%;padding:4px 8px;font-size:0.82rem;">${escapeHtml(card.desc || '')}</textarea>
      </div>
    `).join('');
  }

  function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    url = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    
    // Standard watch URL: youtube.com/watch?v=ID
    const vMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (vMatch && vMatch[1]) return vMatch[1];
    
    // Shorts URL: youtube.com/shorts/ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

    // Live URL: youtube.com/live/ID
    const liveMatch = url.match(/youtube\.com\/live\/([^"&?\/\s]{11})/i);
    if (liveMatch && liveMatch[1]) return liveMatch[1];

    return null;
  }

  function renderVideosInBuilder() {
    const wrap = document.getElementById('blp_videos_list_wrap');
    if (!wrap) return;
    if (currentVideos.length === 0) {
      wrap.innerHTML = `
        <div style="background: rgba(0,0,0,0.25); border: 1.5px dashed #3b82f6; border-radius: 8px; padding: 14px; text-align: center; color: var(--admin-muted); font-size: 0.84rem;">
          🎥 कोई वीडियो नहीं जोड़ा गया है।
          <div style="margin-top: 8px; display: flex; gap: 8px; justify-content: center;">
            <button type="button" onclick="window.addNewVideoTemplate('landscape')" class="admin-button small-button" style="background:#2563eb;color:#fff;font-weight:700;">+ 📺 Landscape वीडियो (16:9)</button>
            <button type="button" onclick="window.addNewVideoTemplate('shorts')" class="admin-button small-button" style="background:#7c3aed;color:#fff;font-weight:700;">+ 📱 Shorts / Reels (9:16)</button>
          </div>
        </div>
      `;
      return;
    }
    wrap.innerHTML = currentVideos.map((v, idx) => {
      const ytId = extractYouTubeId(v.url || '');
      return `
        <div style="background:var(--admin-surface, #1e293b);border:1.5px solid var(--admin-border);border-radius:10px;padding:12px;display:grid;grid-template-columns:56px 1.8fr 1.4fr 120px auto;gap:10px;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
          <div id="video_thumb_preview_${idx}" style="width:56px;height:42px;border-radius:6px;background:#0f172a;overflow:hidden;display:flex;align-items:center;justify-content:center;border:1px solid var(--admin-border);">
            ${ytId ? `<img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover;" title="YouTube Thumbnail" />` : '<span style="font-size:1rem;">🎥</span>'}
          </div>
          <div>
            <label style="font-size:0.72rem;color:var(--admin-muted);font-weight:700;display:block;margin-bottom:2px;">YouTube Link (Watch / Shorts / Embed):</label>
            <input type="url" placeholder="उदा. https://youtu.be/... या https://youtube.com/shorts/..." value="${escapeHtml(v.url || '')}" oninput="window.updateVideoField(${idx}, 'url', this.value)" class="admin-input" style="width:100%;padding:6px 8px;font-size:0.82rem;font-family:monospace;" />
          </div>
          <div>
            <label style="font-size:0.72rem;color:var(--admin-muted);font-weight:700;display:block;margin-bottom:2px;">वीडियो शीर्षक (Title):</label>
            <input type="text" placeholder="उदा. फसल स्प्रे डेमो वीडियो" value="${escapeHtml(v.title || '')}" oninput="window.updateVideoField(${idx}, 'title', this.value)" class="admin-input" style="width:100%;padding:6px 8px;font-size:0.82rem;font-weight:700;" />
          </div>
          <div>
            <label style="font-size:0.72rem;color:var(--admin-muted);font-weight:700;display:block;margin-bottom:2px;">फॉर्मेट / रेशियो:</label>
            <select onchange="window.updateVideoField(${idx}, 'ratio', this.value)" class="admin-select" style="width:100%;padding:6px 8px;font-size:0.8rem;font-weight:700;">
              <option value="16:9" ${v.ratio === '16:9' ? 'selected' : ''}>📺 16:9 TV</option>
              <option value="9:16" ${v.ratio === '9:16' ? 'selected' : ''}>📱 9:16 Shorts</option>
            </select>
          </div>
          <div style="padding-top:16px;">
            <button type="button" onclick="window.removeVideoItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;font-weight:800;padding:6px 12px;border-radius:6px;" title="वीडियो हटाएं">
              🗑️ हटाएं
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderReviewsInBuilder() {
    const wrap = document.getElementById('blp_reviews_list_wrap');
    if (!wrap) return;
    if (currentReviews.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:8px;">कोई रिव्यू नहीं है। "+ नया रिव्यू जोड़ें" पर क्लिक करें।</div>';
      return;
    }
    wrap.innerHTML = currentReviews.map((r, idx) => `
      <div style="background:var(--admin-surface, #1e293b);border:1px solid var(--admin-border);border-radius:8px;padding:10px;margin-bottom:8px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr auto;gap:8px;align-items:center;margin-bottom:6px;">
          <input type="text" placeholder="ग्राहक का नाम" value="${escapeHtml(r.name)}" onchange="window.updateReviewField(${idx}, 'name', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;font-weight:700;" />
          <input type="text" placeholder="स्थान" value="${escapeHtml(r.location || '')}" onchange="window.updateReviewField(${idx}, 'location', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;" />
          <select onchange="window.updateReviewField(${idx}, 'gender', this.value)" class="admin-select" style="padding:4px 8px;font-size:0.8rem;font-weight:700;">
            <option value="male" ${r.gender === 'male' ? 'selected' : ''}>👨 Male Avatar</option>
            <option value="female" ${r.gender === 'female' ? 'selected' : ''}>👩 Female Avatar</option>
          </select>
          <select onchange="window.updateReviewField(${idx}, 'rating', parseInt(this.value,10))" class="admin-select" style="padding:4px 8px;font-size:0.8rem;font-weight:700;">
            <option value="5" ${r.rating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ (5)</option>
            <option value="4" ${r.rating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ (4)</option>
          </select>
          <button type="button" onclick="window.removeReviewItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:3px 8px;">&times;</button>
        </div>
        <textarea placeholder="रिव्यू संदेश" onchange="window.updateReviewField(${idx}, 'comment', this.value)" class="admin-textarea" rows="2" style="width:100%;padding:4px 8px;font-size:0.82rem;">${escapeHtml(r.comment)}</textarea>
      </div>
    `).join('');
  }

  function renderDemoImagesInBuilder() {
    const wrap = document.getElementById('blp_demo_images_wrap');
    if (!wrap) return;
    wrap.innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;width:100%;">
        ${currentDemoImages.map((img, idx) => `
          <div style="position:relative;width:68px;height:90px;border-radius:6px;overflow:hidden;border:1.5px solid var(--admin-border);box-shadow:0 2px 6px rgba(0,0,0,0.2);">
            <img src="${img}" style="width:100%;height:100%;object-fit:cover;" />
            <button type="button" onclick="window.removeDemoImage(${idx})" style="position:absolute;top:2px;right:2px;background:#ef4444;color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;">&times;</button>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:10px;width:100%;flex-wrap:wrap;">
        <input type="text" id="blp_new_demo_img_url" placeholder="डेमो इमेज URL (उदा. /images/books/kheti-dr-demo-1.webp)" class="admin-input" style="flex:1;min-width:220px;padding:6px 10px;font-size:0.8rem;" />
        <button type="button" onclick="window.addDemoImageUrl()" class="admin-button small-button" style="background:#0284c7;color:#fff;font-weight:700;">+ URL जोड़ें</button>
        <label class="admin-button small-button" style="background:#16a34a;color:#fff;cursor:pointer;margin:0;">
          📁 फाइल अपलोड करें
          <input type="file" accept="image/*" onchange="window.uploadDemoImage(event)" style="display:none;" />
        </label>
      </div>
    `;
  }

  function renderBonusesInBuilder() {
    const wrap = document.getElementById('blp_bonuses_list_wrap');
    if (!wrap) return;
    if (currentBonuses.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:8px;">कोई मुफ़्त पुस्तक नहीं है। "+ नई मुफ़्त पुस्तक जोड़ें" पर क्लिक करें या ऊपर लाइब्रेरी से चुनें।</div>';
      return;
    }
    wrap.innerHTML = currentBonuses.map((b, idx) => {
      const featStr = Array.isArray(b.features) ? b.features.join(', ') : (b.features || '');
      return `
        <div style="background:var(--admin-surface, #1e293b);border:1.5px solid rgba(22,163,74,0.3);border-radius:10px;padding:12px;margin-bottom:8px;box-shadow:0 4px 10px rgba(0,0,0,0.15);">
          <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:8px;align-items:center;margin-bottom:8px;">
            <div>
              <label style="font-size:0.72rem;color:var(--admin-muted);display:block;font-weight:700;">📖 मुफ़्त पुस्तक का नाम (Title):</label>
              <input type="text" placeholder="मुफ़्त पुस्तक का नाम" value="${escapeHtml(b.title)}" onchange="window.updateBonusField(${idx}, 'title', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;font-weight:700;" />
            </div>
            <div>
              <label style="font-size:0.72rem;color:var(--admin-muted);display:block;font-weight:700;">📸 कवर इमेज URL / File:</label>
              <input type="text" placeholder="/images/books/cover.webp" value="${escapeHtml(b.image || b.cover || '')}" onchange="window.updateBonusField(${idx}, 'image', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.8rem;" />
            </div>
            <div>
              <label style="font-size:0.72rem;color:var(--admin-muted);display:block;font-weight:700;">📄 मुफ़्त PDF / Doc लिंक:</label>
              <input type="text" placeholder="/files/bonus.pdf" value="${escapeHtml(b.file_url || b.pdf_url || '')}" onchange="window.updateBonusField(${idx}, 'file_url', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.8rem;" />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:8px;align-items:center;margin-bottom:8px;">
            <div>
              <label style="font-size:0.72rem;color:var(--admin-muted);display:block;font-weight:700;">📝 संक्षिप्त विवरण (Description):</label>
              <input type="text" placeholder="संक्षिप्त विवरण (उदा. रोग, कीट व स्प्रे साइंस की सम्पूर्ण गाइड)" value="${escapeHtml(b.description || '')}" onchange="window.updateBonusField(${idx}, 'description', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;" />
            </div>
            <div>
              <label style="font-size:0.72rem;color:var(--admin-muted);display:block;font-weight:700;">💰 बाज़ार मूल्य ₹ (MRP):</label>
              <input type="number" placeholder="मूल्य ₹ (MRP)" value="${b.mrp || 199}" onchange="window.updateBonusField(${idx}, 'mrp', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;font-weight:700;" />
            </div>
            <div style="align-self:flex-end;">
              <button type="button" onclick="window.removeBonusItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:6px 10px;font-weight:800;">&times; हटाएं</button>
            </div>
          </div>

          <!-- Individual Key Features / KPI Badges Field for this Free Book -->
          <div style="background:rgba(22,163,74,0.06);border:1px dashed #22c55e;border-radius:6px;padding:8px;margin-top:6px;">
            <label style="font-size:0.75rem;color:#16a34a;display:block;font-weight:800;margin-bottom:3px;">
              🌟 इस पुस्तक के मुख्य फीचर्स / KPI बैजेस (कॉमा लगाकर लिखें):
            </label>
            <input type="text" placeholder="उदा. 120+ रंगीन पेज, 300+ फोटो, स्प्रे साइंस चार्ट, Mobile PDF" value="${escapeHtml(featStr)}" onchange="window.updateBonusField(${idx}, 'features', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;width:100%;border-color:#86efac;font-weight:600;" />
          </div>
        </div>
      `;
    }).join('');
  }

  window.removeBonusItem = (idx) => {
    currentBonuses.splice(idx, 1);
    renderBonusesInBuilder();
  };

  function renderBonusPointsInBuilder() {
    const wrap = document.getElementById('blp_bonus_points_list_wrap');
    if (!wrap) return;
    wrap.innerHTML = currentBonusPoints.map((pt, idx) => `
      <div style="display:flex;gap:6px;align-items:center;">
        <input type="text" value="${escapeHtml(pt)}" onchange="window.updateBonusPointField(${idx}, this.value)" class="admin-input" style="width:100%;padding:4px 8px;font-size:0.82rem;" />
        <button type="button" onclick="window.removeBonusPointItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:3px 8px;">&times;</button>
      </div>
    `).join('');
  }

  function renderTocPointsInBuilder() {
    const wrap = document.getElementById('blp_toc_points_list_wrap');
    if (!wrap) return;
    wrap.innerHTML = currentTocPoints.map((pt, idx) => `
      <div style="display:flex;gap:6px;align-items:center;">
        <span style="color:#16a34a;font-weight:700;">✅</span>
        <input type="text" value="${escapeHtml(pt)}" onchange="window.updateTocPointField(${idx}, this.value)" class="admin-input" style="width:100%;padding:4px 8px;font-size:0.82rem;" />
        <button type="button" onclick="window.removeTocPointItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:3px 8px;">&times;</button>
      </div>
    `).join('');
  }

  function renderFaqsInBuilder() {
    const wrap = document.getElementById('blp_faqs_list_wrap');
    if (!wrap) return;
    if (currentFaqs.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:8px;">कोई FAQ नहीं है। "+ नया FAQ जोड़ें" पर क्लिक करें।</div>';
      return;
    }
    wrap.innerHTML = currentFaqs.map((f, idx) => `
      <div style="background:var(--admin-surface, #1e293b);border:1px solid var(--admin-border);border-radius:8px;padding:10px;margin-bottom:6px;">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
          <input type="text" placeholder="प्रश्न" value="${escapeHtml(f.q)}" onchange="window.updateFaqField(${idx}, 'q', this.value)" class="admin-input" style="width:100%;padding:4px 8px;font-size:0.85rem;font-weight:700;" />
          <button type="button" onclick="window.removeFaqItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:3px 8px;">&times;</button>
        </div>
        <textarea placeholder="उत्तर" onchange="window.updateFaqField(${idx}, 'a', this.value)" class="admin-textarea" rows="2" style="width:100%;padding:4px 8px;font-size:0.82rem;">${escapeHtml(f.a)}</textarea>
      </div>
    `).join('');
  }

  function renderSuggestedBooksInBuilder() {
    const wrap = document.getElementById('blp_suggested_books_list_wrap');
    if (!wrap) return;
    if (currentSuggestedBooks.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:8px;">कोई संबंधित पुस्तक नहीं जोड़ी गई। "+ संबंधित पुस्तक जोड़ें" पर क्लिक करें।</div>';
      return;
    }
    wrap.innerHTML = currentSuggestedBooks.map((sb, idx) => `
      <div style="background:var(--admin-surface, #1e293b);border:1px solid var(--admin-border);border-radius:8px;padding:10px;margin-bottom:6px;">
        <div style="display:grid;grid-template-columns:1.5fr 1.5fr 1fr 1fr 1fr auto;gap:8px;align-items:center;">
          <div>
            <label style="font-size:0.72rem;color:var(--admin-muted);display:block;">📸 कवर इमेज URL:</label>
            <input type="text" placeholder="/images/books/cover.webp" value="${escapeHtml(sb.image || '')}" onchange="window.updateSuggestedBookField(${idx}, 'image', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.8rem;" />
          </div>
          <div>
            <label style="font-size:0.72rem;color:var(--admin-muted);display:block;">📘 पुस्तक का नाम:</label>
            <input type="text" placeholder="पुस्तक का शीर्षक" value="${escapeHtml(sb.title || '')}" onchange="window.updateSuggestedBookField(${idx}, 'title', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.8rem;font-weight:700;" />
          </div>
          <div>
            <label style="font-size:0.72rem;color:var(--admin-muted);display:block;">💰 ऑफर मूल्य ₹:</label>
            <input type="number" placeholder="99" value="${sb.offerPrice || 99}" onchange="window.updateSuggestedBookField(${idx}, 'offerPrice', parseInt(this.value,10))" class="admin-input" style="padding:4px 8px;font-size:0.8rem;font-weight:800;color:#22c55e;" />
          </div>
          <div>
            <label style="font-size:0.72rem;color:var(--admin-muted);display:block;">🏷️ MRP ₹:</label>
            <input type="number" placeholder="299" value="${sb.mrp || 299}" onchange="window.updateSuggestedBookField(${idx}, 'mrp', parseInt(this.value,10))" class="admin-input" style="padding:4px 8px;font-size:0.8rem;" />
          </div>
          <div>
            <label style="font-size:0.72rem;color:var(--admin-muted);display:block;">🔗 लिंक / ID:</label>
            <input type="text" placeholder="BK002 या URL" value="${escapeHtml(sb.link || sb.id || '')}" onchange="window.updateSuggestedBookField(${idx}, 'link', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.8rem;" />
          </div>
          <div style="padding-top:14px;">
            <button type="button" onclick="window.removeSuggestedBookItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:4px 8px;" title="हटाएं">&times;</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================
  // INTERACTIVE CURSOR DRAG & DROP REORDERING ENGINE
  // ==========================================================
  function renderSectionsReorderingList() {
    const wrap = document.getElementById('blp_sections_reorder_list_wrap');
    if (!wrap) return;

    if (!currentSectionsOrder || currentSectionsOrder.length === 0) {
      currentSectionsOrder = defaultSectionsList.map(s => s.key);
    }

    wrap.innerHTML = currentSectionsOrder.map((secKey, idx) => {
      const meta = defaultSectionsList.find(s => s.key === secKey) || { key: secKey, name: secKey, desc: '' };
      const isHidden = currentHiddenSections.includes(secKey);
      const hasBanner = !!currentSectionBanners[secKey];

      return `
        <div 
          class="ubl-drag-item"
          id="drag_sec_item_${idx}"
          draggable="true"
          ondragstart="window.handleDragStart(event, ${idx})"
          ondragover="window.handleDragOver(event, ${idx})"
          ondragenter="window.handleDragEnter(event, ${idx})"
          ondragleave="window.handleDragLeave(event, ${idx})"
          ondrop="window.handleDrop(event, ${idx})"
          ondragend="window.handleDragEnd(event)"
          style="background:var(--admin-surface, #1e293b); border:1.5px solid ${isHidden ? '#475569' : '#8b5cf6'}; border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; opacity:${isHidden ? '0.6' : '1'}; box-shadow:0 2px 6px rgba(0,0,0,0.15);"
        >
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.2rem; color:#c084fc; cursor:grab; padding:2px;" title="माउस से पकड़ कर किसी भी जगह रखें">⠿</span>
            <span style="font-size:0.75rem; background:#8b5cf6; color:#fff; font-weight:800; padding:2px 8px; border-radius:10px;">#${idx + 1}</span>
            <div>
              <div style="font-weight:800; font-size:0.92rem; color:var(--admin-text); display:flex; align-items:center; gap:6px;">
                <span>${meta.name}</span>
                ${hasBanner ? '<span style="font-size:0.68rem;background:#15803d;color:#fff;padding:1px 6px;border-radius:4px;font-weight:700;">🖼️ बैनर चालू</span>' : ''}
              </div>
              <small style="color:var(--admin-muted); font-size:0.75rem;">${meta.desc}</small>
            </div>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <button type="button" onclick="window.moveSectionUp(${idx})" class="admin-button small-button" style="background:#3b82f6; color:#fff; padding:3px 8px;" title="ऊपर करें (Move Up)" ${idx === 0 ? 'disabled style="opacity:0.4;"' : ''}>
              ⬆️
            </button>
            <button type="button" onclick="window.moveSectionDown(${idx})" class="admin-button small-button" style="background:#3b82f6; color:#fff; padding:3px 8px;" title="नीचे करें (Move Down)" ${idx === currentSectionsOrder.length - 1 ? 'disabled style="opacity:0.4;"' : ''}>
              ⬇️
            </button>
            <button type="button" onclick="window.toggleSectionVisibility('${secKey}')" class="admin-button small-button" style="background:${isHidden ? '#64748b' : '#16a34a'}; color:#fff; padding:3px 8px;" title="चालू / बंद">
              ${isHidden ? '👁️ बंद' : '🟢 चालू'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // HTML5 Drag and Drop Handlers
  window.handleDragStart = (e, index) => {
    draggedItemIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    setTimeout(() => {
      const el = document.getElementById(`drag_sec_item_${index}`);
      if (el) el.classList.add('dragging');
    }, 0);
  };

  window.handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  window.handleDragEnter = (e, index) => {
    e.preventDefault();
    if (index !== draggedItemIndex) {
      const el = document.getElementById(`drag_sec_item_${index}`);
      if (el) el.classList.add('drag-over');
    }
  };

  window.handleDragLeave = (e, index) => {
    const el = document.getElementById(`drag_sec_item_${index}`);
    if (el) el.classList.remove('drag-over');
  };

  window.handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = draggedItemIndex;
    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      const itemToMove = currentSectionsOrder.splice(sourceIndex, 1)[0];
      currentSectionsOrder.splice(targetIndex, 0, itemToMove);
      showToast(`⠿ सेक्शन #${sourceIndex + 1} को #${targetIndex + 1} स्थान पर रखा गया!`, 'success');
    }
    draggedItemIndex = null;
    renderSectionsReorderingList();
  };

  window.handleDragEnd = (e) => {
    draggedItemIndex = null;
    document.querySelectorAll('.ubl-drag-item').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });
  };

  window.moveSectionUp = (idx) => {
    if (idx > 0) {
      const temp = currentSectionsOrder[idx];
      currentSectionsOrder[idx] = currentSectionsOrder[idx - 1];
      currentSectionsOrder[idx - 1] = temp;
      renderSectionsReorderingList();
      showToast('⬆️ सेक्शन ऊपर खिसकाया गया', 'info');
    }
  };

  window.moveSectionDown = (idx) => {
    if (idx < currentSectionsOrder.length - 1) {
      const temp = currentSectionsOrder[idx];
      currentSectionsOrder[idx] = currentSectionsOrder[idx + 1];
      currentSectionsOrder[idx + 1] = temp;
      renderSectionsReorderingList();
      showToast('⬇️ सेक्शन नीचे खिसकाया गया', 'info');
    }
  };

  window.toggleSectionVisibility = (secKey) => {
    const idx = currentHiddenSections.indexOf(secKey);
    if (idx >= 0) {
      currentHiddenSections.splice(idx, 1);
    } else {
      currentHiddenSections.push(secKey);
    }
    renderSectionsReorderingList();
  };

  function resetSectionsOrder() {
    currentSectionsOrder = defaultSectionsList.map(s => s.key);
    currentHiddenSections = [];
    renderSectionsReorderingList();
    showToast('↺ डिफ़ॉल्ट सेक्शन क्रम रीसेट हो गया!', 'info');
  }

  // Window Field Updaters
  window.updateKpiField = (idx, fld, val) => { if (currentKpis[idx]) currentKpis[idx][fld] = val; };
  window.removeKpiItem = (idx) => { currentKpis.splice(idx, 1); renderKpiBadgesInBuilder(); };
  window.updateWhyCardField = (idx, fld, val) => { if (currentWhyCards[idx]) currentWhyCards[idx][fld] = val; };
  window.removeWhyCardItem = (idx) => { currentWhyCards.splice(idx, 1); renderWhyCardsInBuilder(); };
  window.addWhyCardItem = () => { currentWhyCards.push({ icon: '🌱', title: 'नया कारण शीर्षक', desc: 'विवरण यहाँ लिखें...' }); renderWhyCardsInBuilder(); };
  
  window.addNewBonusBook = () => {
    currentBonuses.push({
      title: '🎁 नई मुफ़्त बोनस ई-बुक',
      description: 'इस मुख्य पुस्तक के साथ बिल्कुल फ्री लाइफटाइम एक्सेस।',
      mrp: 199,
      image: '/images/books/kharif-master-guide-2026-cover.webp',
      file_url: '',
      features: ['120+ रंगीन पेज', '300+ फोटो', 'स्प्रे साइंस चार्ट', 'Mobile PDF']
    });
    renderBonusesInBuilder();
  };

  window.addExistingBookToBonus = function(bId) {
    if (!bId) return;
    const found = allBooks.find(b => b.id === bId);
    if (!found) return;
    currentBonuses.push({
      title: `FREE: ${found.heading || found.name}`,
      description: `विशेष बंडल बोनस: ${found.heading || found.name} (${found.totalPages || 120}+ रंगीन पेज)।`,
      mrp: found.mrp || 299,
      image: found.cover || found.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
      file_url: found.pdf_url || found.file || '',
      features: [`${found.totalPages || 120}+ रंगीन पेज`, '300+ फोटो', 'प्रमाणित समाधान', 'Mobile PDF']
    });
    renderBonusesInBuilder();
    showToast(`🎁 '${found.heading || found.name}' बोनस बंडल में जोड़ दी गई!`, 'success');
    const sel = document.getElementById('blp_bonus_library_select');
    if (sel) sel.value = '';
  };

  window.addExistingBookToSuggested = function(bId) {
    if (!bId) return;
    const found = allBooks.find(b => b.id === bId);
    if (!found) return;
    currentSuggestedBooks.push({
      id: found.id,
      link: found.id,
      title: found.heading || found.name,
      image: found.cover || found.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
      offerPrice: found.offerPrice || 99,
      mrp: found.mrp || 299
    });
    renderSuggestedBooksInBuilder();
    showToast(`🛒 '${found.heading || found.name}' संबंधित पुस्तक कॉम्बो में जोड़ दी गई!`, 'success');
    const sel = document.getElementById('blp_suggested_library_select');
    if (sel) sel.value = '';
  };

  window.addNewVideoTemplate = function(type = 'landscape') {
    if (type === 'shorts') {
      currentVideos.push({
        url: 'https://youtube.com/shorts/sample',
        title: '📱 फसल रील्स व शॉर्ट्स डेमो',
        ratio: '9:16'
      });
    } else {
      currentVideos.push({
        url: 'https://www.youtube.com/watch?v=sample',
        title: '📺 मुख्य पुस्तक व परिणाम वीडियो डेमो',
        ratio: '16:9'
      });
    }
    renderVideosInBuilder();
    showToast(`🎥 नया ${type === 'shorts' ? 'Shorts (9:16)' : 'Landscape (16:9)'} वीडियो जोड़ा गया!`, 'info');
  };

  window.updateVideoField = (idx, field, val) => { 
    if (currentVideos[idx]) {
      currentVideos[idx][field] = val;
      if (field === 'url') {
        const ytId = extractYouTubeId(val);
        const thumbEl = document.getElementById(`video_thumb_preview_${idx}`);
        if (thumbEl) {
          thumbEl.innerHTML = ytId ? `<img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover;" title="YouTube Thumbnail Live" />` : '<span style="font-size:1rem;">🎥</span>';
        }
      }
    }
  };

  window.removeVideoItem = (idx) => { 
    currentVideos.splice(idx, 1); 
    renderVideosInBuilder(); 
    showToast('🗑️ वीडियो हटा दिया गया', 'info');
  };

  window.updateSocialSharePreview = function() {
    const title = document.getElementById('blp_og_title')?.value || document.getElementById('blp_hero_title')?.value || 'Aarogyam India eBook';
    const desc = document.getElementById('blp_og_description')?.value || document.getElementById('blp_hero_desc')?.value || 'सम्पूर्ण Practical Guide। अभी विशेष छूट पर उपलब्ध।';
    const imgUrl = document.getElementById('blp_og_image')?.value || document.getElementById('blp_cover_url')?.value || '/images/books/kharif-master-guide-2026-cover.webp';

    const pTitle = document.getElementById('blp_social_preview_title');
    const pDesc = document.getElementById('blp_social_preview_desc');
    const pImg = document.getElementById('blp_social_preview_img');

    if (pTitle) pTitle.textContent = title;
    if (pDesc) pDesc.textContent = desc;
    if (pImg && imgUrl) pImg.src = imgUrl;
  };

  window.clearImageField = function(type) {
    if (type === 'cover') {
      const fileInput = document.getElementById('blp_file_cover');
      const gitSelect = document.getElementById('blp_select_git_cover');
      const urlInput = document.getElementById('blp_cover_url');
      const prevImg = document.getElementById('blp_preview_cover_img');
      if (fileInput) fileInput.value = '';
      if (gitSelect) gitSelect.value = '';
      if (urlInput) urlInput.value = '';
      if (prevImg) prevImg.src = '/images/books/kharif-master-guide-2026-cover.webp';
      showToast('🗑️ कवर इमेज हटा दी गई', 'info');
    } else if (type === 'banner') {
      const fileInput = document.getElementById('blp_file_banner');
      const gitSelect = document.getElementById('blp_select_git_banner');
      const urlInput = document.getElementById('blp_banner_url');
      const prevImg = document.getElementById('blp_preview_banner_img');
      if (fileInput) fileInput.value = '';
      if (gitSelect) gitSelect.value = '';
      if (urlInput) urlInput.value = '';
      if (prevImg) prevImg.src = '/images/banners/kharif-master-guide-2026-hero-banner.webp';
      showToast('🗑️ बैनर इमेज हटा दी गई', 'info');
    }
  };

  window.handleBookPdfSelect = function(type, e) {
    const file = e.target.files?.[0];
    const statusWrap = document.getElementById(type === 'main' ? 'blp_main_pdf_status_wrap' : 'blp_free_pdf_status_wrap');
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    if (file.size > 25 * 1024 * 1024) {
      if (statusWrap) {
        statusWrap.style.display = 'block';
        statusWrap.innerHTML = `
          <div style="background: rgba(239,68,68,0.15); border: 1.5px solid #ef4444; border-radius: 8px; padding: 12px; color: #fca5a5; font-size: 0.84rem; line-height: 1.5;">
            <strong>❌ [सेक्शन ${type === 'main' ? '17' : '18'}] फ़ाइल 25MB से बड़ी है (${sizeMB} MB):</strong><br/>
            GitHub रिपॉजिटरी की अधिकतम फ़ाइल लिमिट <strong>25 MB</strong> है।<br/>
            💡 <strong>समाधान:</strong> कृपया इसे <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" style="color:#38bdf8;text-decoration:underline;font-weight:700;">iLovePDF Compress Tool</a> से 25MB से कम करें या Part 1 / Part 2 में बांटें।
          </div>
        `;
      }
      showToast(`⚠️ [सेक्शन ${type === 'main' ? '17' : '18'}] PDF फ़ाइल (${sizeMB}MB) 25MB से बड़ी है।`, 'error');
    } else {
      if (statusWrap) {
        statusWrap.style.display = 'block';
        statusWrap.innerHTML = `
          <div style="background: rgba(34,197,94,0.15); border: 1px solid #22c55e; border-radius: 6px; padding: 8px 12px; color: #86efac; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center;">
            <span>✅ <strong>${file.name}</strong> (${sizeMB} MB) - लाइव अपलोड के लिए तैयार</span>
            <button type="button" onclick="window.clearBookPdf('${type}')" style="background:#ef4444;color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:0.75rem;cursor:pointer;font-weight:700;">🗑️ हटाएं</button>
          </div>
        `;
      }
      // Clear GitHub dropdown if computer file is picked
      const sel = document.getElementById(type === 'main' ? 'blp_select_git_main_pdf' : 'blp_select_git_free_pdf');
      if (sel) sel.value = '';
      showToast(`📄 PDF फ़ाइल (${file.name} - ${sizeMB}MB) चुनी गई!`, 'info');
    }
  };

  window.clearBookPdf = function(type) {
    const input = document.getElementById(type === 'main' ? 'blp_file_main_pdf' : 'blp_file_free_pdf');
    const urlInput = document.getElementById(type === 'main' ? 'blp_main_pdf_url' : 'blp_free_pdf_url');
    const gitSelect = document.getElementById(type === 'main' ? 'blp_select_git_main_pdf' : 'blp_select_git_free_pdf');
    const statusWrap = document.getElementById(type === 'main' ? 'blp_main_pdf_status_wrap' : 'blp_free_pdf_status_wrap');
    if (input) input.value = '';
    if (urlInput) urlInput.value = '';
    if (gitSelect) gitSelect.value = '';
    if (statusWrap) {
      statusWrap.innerHTML = '';
      statusWrap.style.display = 'none';
    }
    showToast(`🗑️ ${type === 'main' ? 'मुख्य' : 'फ्री'} PDF हटा दी गई`, 'info');
  };

  window.updatePdfStatusPreview = function(type, url) {
    const statusWrap = document.getElementById(type === 'main' ? 'blp_main_pdf_status_wrap' : 'blp_free_pdf_status_wrap');
    if (!statusWrap) return;
    if (url && url.trim()) {
      statusWrap.style.display = 'block';
      statusWrap.innerHTML = `
        <div style="background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; border-radius: 6px; padding: 6px 10px; color: #bae6fd; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
          <span>🔗 <strong>लिंक्ड PDF:</strong> ${url.trim()}</span>
          <button type="button" onclick="window.clearBookPdf('${type}')" style="background:#ef4444;color:#fff;border:none;border-radius:4px;padding:2px 6px;font-size:0.72rem;cursor:pointer;">🗑️ हटाएं</button>
        </div>
      `;
    } else {
      statusWrap.style.display = 'none';
    }
  };

  window.copyGitPdfPath = function(type) {
    const bId = (document.getElementById('blp_input_book_id')?.value || 'BK015').trim().toUpperCase() || 'BK015';
    const filename = `${bId}_${type === 'main' ? 'main' : 'free'}.pdf`;
    const fullPath = `/uploads/books/${filename}`;
    const gitFolder = `uploads/books/${filename}`;

    const urlInput = document.getElementById(type === 'main' ? 'blp_main_pdf_url' : 'blp_free_pdf_url');
    const fileInput = document.getElementById(type === 'main' ? 'blp_file_main_pdf' : 'blp_file_free_pdf');
    const gitSelect = document.getElementById(type === 'main' ? 'blp_select_git_main_pdf' : 'blp_select_git_free_pdf');

    if (urlInput) urlInput.value = fullPath;
    if (fileInput) fileInput.value = '';
    if (gitSelect) gitSelect.value = '';
    window.updatePdfStatusPreview(type, fullPath);

    navigator.clipboard?.writeText(fullPath).catch(() => {});
    showToast(`📋 पाथ कॉपी हुआ: ${fullPath} | Git फोल्डर '${gitFolder}' में इस नाम से PDF अपलोड करें!`, 'success');
  };

  window.triggerBookPdfUpload = function(type) {
    showToast(`💡 PDF फ़ाइल नीचे "💾 Save Page" बटन दबाते ही ऑटोमैटिक अपलोड व लिंक हो जाएगी!`, 'info');
  };

  function highlightSectionError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      el.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.7)';
      el.style.borderColor = '#ef4444';
      setTimeout(() => {
        if (el) el.style.boxShadow = '';
      }, 4500);
    }
    showToast(message, 'error');
  }

  window.removeVideoItem = (idx) => { currentVideos.splice(idx, 1); renderVideosInBuilder(); };
  window.updateReviewField = (idx, field, val) => { if (currentReviews[idx]) currentReviews[idx][field] = val; };
  window.removeReviewItem = (idx) => { currentReviews.splice(idx, 1); renderReviewsInBuilder(); };
  window.uploadDemoImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        currentDemoImages.push(re.target.result);
        renderDemoImagesInBuilder();
      };
      reader.readAsDataURL(file);
    }
  };
  window.addDemoImageUrl = () => {
    const input = document.getElementById('blp_new_demo_img_url');
    if (input && input.value.trim()) {
      currentDemoImages.push(input.value.trim());
      input.value = '';
      renderDemoImagesInBuilder();
      showToast('📸 डेमो इमेज जुड़ गई!', 'success');
    }
  };
  window.removeDemoImage = (idx) => { currentDemoImages.splice(idx, 1); renderDemoImagesInBuilder(); };
  window.updateBonusField = (idx, field, val) => {
    if (!currentBonuses[idx]) return;
    if (field === 'mrp') {
      currentBonuses[idx].mrp = parseInt(val, 10) || 199;
    } else if (field === 'features') {
      if (typeof val === 'string') {
        currentBonuses[idx].features = val.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      } else {
        currentBonuses[idx].features = val;
      }
    } else {
      currentBonuses[idx][field] = val;
    }
  };
  window.removeBonusItem = (idx) => { currentBonuses.splice(idx, 1); renderBonusesInBuilder(); };
  window.updateBonusPointField = (idx, val) => { currentBonusPoints[idx] = val; };
  window.removeBonusPointItem = (idx) => { currentBonusPoints.splice(idx, 1); renderBonusPointsInBuilder(); };
  window.updateTocPointField = (idx, val) => { currentTocPoints[idx] = val; };
  window.removeTocPointItem = (idx) => { currentTocPoints.splice(idx, 1); renderTocPointsInBuilder(); };
  window.updateFaqField = (idx, field, val) => { if (currentFaqs[idx]) currentFaqs[idx][field] = val; };
  window.removeFaqItem = (idx) => { currentFaqs.splice(idx, 1); renderFaqsInBuilder(); };
  window.updateSuggestedBookField = (idx, field, val) => { if (currentSuggestedBooks[idx]) currentSuggestedBooks[idx][field] = val; };
  window.removeSuggestedBookItem = (idx) => { currentSuggestedBooks.splice(idx, 1); renderSuggestedBooksInBuilder(); };

  window.toggleLiveStatus = function(bId) {
    const page = allLandingPages.find(p => p.id === bId);
    if (!page) return;
    page.status = (page.status === 'active') ? 'draft' : 'active';
    try {
      localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(allLandingPages));
    } catch (e) {}
    updateKPIs();
    renderTable();
    showToast(`स्टेटस बदला गया: ${page.status === 'active' ? '🟢 Live' : '🔴 Offline'}`, 'success');
  };

  function resetBookBuilder() {
    editingBookId = null;
    currentKpis = [
      { icon: 'fa-seedling', text: '120 पेज की प्रीमियम' },
      { icon: 'fa-camera', text: '300+ फोटो' },
      { icon: 'fa-flask', text: 'Spray Science' },
      { icon: 'fa-gift', text: 'Free Bonus PDF' }
    ];
    currentWhyCards = [
      { icon: '🌱', title: 'वैज्ञानिक जानकारी', desc: 'कृषि विशेषज्ञों द्वारा तैयार प्रमाणित एवं Practical जानकारी।' },
      { icon: '📷', title: '300+ वास्तविक फोटो', desc: 'रोग, कीट एवं पोषक तत्वों की वास्तविक पहचान आसान होगी।' },
      { icon: '📘', title: 'Step by Step Guide', desc: 'बीज उपचार से लेकर कटाई तक सम्पूर्ण जानकारी।' },
      { icon: '🎁', title: 'Free Bonus PDF', desc: 'इस पुस्तक के साथ विशेष Bonus PDF बिल्कुल निःशुल्क।' }
    ];
    currentBonuses = [
      {
        title: 'FREE AI WHATSAPP SUPPORT & SPRAY CHART',
        description: 'किताब पढ़ते समय अगर कोई बात समझ न आए, तो WhatsApp Help पर तुरंत समाधान पाएं।',
        mrp: 199,
        image: '/images/books/kharif-fasal-hero-2.webp'
      }
    ];
    currentBonusPoints = [
      '24×7 WhatsApp Support',
      '💬 आपका सवाल → हमारी मदद → आसान समाधान',
      '📖 किताब की जानकारी समझने में सहायता',
      '🌱 फसल संबंधी सवाल',
      '📱 Mobile Friendly PDF & Lifetime Access'
    ];
    currentTocPoints = [
      'बीज उपचार',
      'खेत की तैयारी',
      'बुवाई की वैज्ञानिक विधि',
      'उर्वरक प्रबंधन',
      'खरपतवार नियंत्रण',
      'रोग एवं कीट प्रबंधन',
      'पोषक तत्वों की कमी',
      'स्प्रे चार्ट',
      'IPM तकनीक',
      'अधिक उत्पादन के उपाय',
      'विशेषज्ञ सुझाव'
    ];
    currentVideos = [];
    currentReviews = [];
    currentDemoImages = [];
    currentFaqs = [];
    currentSuggestedBooks = [];
    currentSectionsOrder = defaultSectionsList.map(s => s.key);
    currentHiddenSections = [];
    currentSectionBanners = {};
    selectedThemePrimary = '#2E7D32';
    selectedThemeDark = '#1B5E20';
    selectedCoverEffect = '3d_float';

    document.getElementById('admin-book-builder-title').textContent = 'नया बुक लैंडिंग पेज बनाएं (Universal Book Creator)';
    document.getElementById('admin-book-lp-form').reset();
    document.getElementById('blp_preview_cover_img').src = '/images/books/kharif-master-guide-2026-cover.webp';
    document.getElementById('blp_preview_banner_img').src = '/images/banners/kharif-master-guide-2026-hero-banner.webp';
    if (document.getElementById('blp_fb_pixel_enabled')) document.getElementById('blp_fb_pixel_enabled').checked = true;
    if (document.getElementById('blp_google_tag_enabled')) document.getElementById('blp_google_tag_enabled').checked = true;
    
    if (document.getElementById('blp_og_title')) document.getElementById('blp_og_title').value = '';
    if (document.getElementById('blp_og_description')) document.getElementById('blp_og_description').value = '';
    if (document.getElementById('blp_og_image')) document.getElementById('blp_og_image').value = '';
    if (document.getElementById('blp_pub_ebook_store')) document.getElementById('blp_pub_ebook_store').checked = true;
    if (document.getElementById('blp_pub_category_page')) document.getElementById('blp_pub_category_page').checked = true;
    if (document.getElementById('blp_pub_my_library')) document.getElementById('blp_pub_my_library').checked = true;
    if (document.getElementById('blp_pub_home_page')) document.getElementById('blp_pub_home_page').checked = true;
    if (document.getElementById('blp_store_badge')) document.getElementById('blp_store_badge').value = 'best_seller';
    if (document.getElementById('blp_is_coming_soon')) document.getElementById('blp_is_coming_soon').value = 'false';
    window.updateSocialSharePreview();

    if (document.getElementById('blp_main_pdf_url')) document.getElementById('blp_main_pdf_url').value = '';
    if (document.getElementById('blp_free_pdf_url')) document.getElementById('blp_free_pdf_url').value = '';
    if (document.getElementById('blp_file_main_pdf')) document.getElementById('blp_file_main_pdf').value = '';
    if (document.getElementById('blp_file_free_pdf')) document.getElementById('blp_file_free_pdf').value = '';
    window.updatePdfStatusPreview('main', '');
    window.updatePdfStatusPreview('free', '');

    // Clear all section banner previews
    defaultSectionsList.forEach(s => {
      const input = document.getElementById(`blp_sec_banner_${s.key}`);
      const wrap = document.getElementById(`blp_sec_banner_preview_wrap_${s.key}`);
      if (input) input.value = '';
      if (wrap) wrap.style.display = 'none';
    });

    renderKpiBadgesInBuilder();
    renderWhyCardsInBuilder();
    renderVideosInBuilder();
    renderReviewsInBuilder();
    renderDemoImagesInBuilder();
    renderBonusesInBuilder();
    renderBonusPointsInBuilder();
    renderTocPointsInBuilder();
    renderFaqsInBuilder();
    renderSuggestedBooksInBuilder();
    renderSectionsReorderingList();
  }

  window.editBookLandingPage = function(bId) {
    if (!bId) return;
    const cleanId = String(bId).trim().toUpperCase();
    const page = allLandingPages.find(p => p && p.id && p.id.trim().toUpperCase() === cleanId);
    
    if (!page) {
      const bObj = allBooks.find(b => b && b.id && b.id.trim().toUpperCase() === cleanId);
      if (bObj) {
        resetBookBuilder();
        editingBookId = bObj.id;
        document.getElementById('admin-book-builder-title').textContent = `✏️ एडिट बुक: ${bObj.id}`;
        document.getElementById('blp_input_book_id').value = bObj.id;
        document.getElementById('blp_hero_title').value = bObj.heading || bObj.name || '';
        document.getElementById('blp_category_select').value = bObj.category || 'Agriculture';
        document.getElementById('blp_hero_mrp').value = bObj.mrp || 299;
        document.getElementById('blp_hero_offer_price').value = bObj.offerPrice || 99;
        document.getElementById('blp_cover_url').value = bObj.cover || bObj.thumbnail || '';
        if (bObj.cover) document.getElementById('blp_preview_cover_img').src = bObj.cover;
        builderCard.style.display = 'block';
        window.scrollTo({ top: builderCard.offsetTop - 50, behavior: 'smooth' });
        showToast(`✏️ कैटलॉग से बुक (${cleanId}) लोड की गई`, 'info');
        return;
      }
      showToast(`पेज (${bId}) नहीं मिला।`, 'error');
      return;
    }

    editingBookId = page.id;
    document.getElementById('admin-book-builder-title').textContent = `✏️ एडिट बुक लैंडिंग पेज: ${page.id}`;
    
    document.getElementById('blp_input_book_id').value = page.id || '';
    if (bookSelect) bookSelect.value = page.id || '';
    document.getElementById('blp_category_select').value = page.category || 'Agriculture';

    // PDF / DOC files
    const mainPdfUrl = page.mainPdf || page.main_pdf || page.hero?.mainPdf || '';
    const freePdfUrl = page.freePdf || page.free_pdf || page.demoPdf || page.hero?.demoPdf || '';
    if (document.getElementById('blp_main_pdf_url')) document.getElementById('blp_main_pdf_url').value = mainPdfUrl;
    if (document.getElementById('blp_free_pdf_url')) document.getElementById('blp_free_pdf_url').value = freePdfUrl;
    window.updatePdfStatusPreview('main', mainPdfUrl);
    window.updatePdfStatusPreview('free', freePdfUrl);

    const hero = page.hero || {};
    document.getElementById('blp_hero_tag').value = hero.tag || '';
    document.getElementById('blp_hero_title').value = hero.title || '';
    document.getElementById('blp_hero_subtitle').value = hero.subtitle || '';
    document.getElementById('blp_hero_desc').value = hero.description || '';
    document.getElementById('blp_hero_mrp').value = hero.mrp || '';
    document.getElementById('blp_hero_offer_price').value = hero.offer_price || '';
    document.getElementById('blp_hero_badge').value = hero.offer_badge || '';
    document.getElementById('blp_rating_score').value = hero.rating_score || '4.9';
    document.getElementById('blp_rating_count').value = hero.rating_count || '120+ Ratings';
    document.getElementById('blp_cover_url').value = hero.cover_image || '';
    document.getElementById('blp_banner_url').value = hero.banner_image || '';
    document.getElementById('blp_cover_effect').value = page.cover_effect || '3d_float';
    
    if (hero.cover_image) document.getElementById('blp_preview_cover_img').src = hero.cover_image;
    if (hero.banner_image) document.getElementById('blp_preview_banner_img').src = hero.banner_image;

    // OG Tags
    if (document.getElementById('blp_og_title')) document.getElementById('blp_og_title').value = page.og_title || hero.title || '';
    if (document.getElementById('blp_og_description')) document.getElementById('blp_og_description').value = page.og_description || hero.description || '';
    if (document.getElementById('blp_og_image')) document.getElementById('blp_og_image').value = page.og_image || hero.cover_image || '';
    window.updateSocialSharePreview();

    // Publishing Targets & Badges
    const targets = page.publish_targets || ['ebook_store', 'category_page', 'my_library', 'home_page'];
    if (document.getElementById('blp_pub_ebook_store')) document.getElementById('blp_pub_ebook_store').checked = targets.includes('ebook_store');
    if (document.getElementById('blp_pub_category_page')) document.getElementById('blp_pub_category_page').checked = targets.includes('category_page');
    if (document.getElementById('blp_pub_my_library')) document.getElementById('blp_pub_my_library').checked = targets.includes('my_library');
    if (document.getElementById('blp_pub_home_page')) document.getElementById('blp_pub_home_page').checked = targets.includes('home_page');
    if (document.getElementById('blp_store_badge')) document.getElementById('blp_store_badge').value = page.store_badge || 'best_seller';
    if (document.getElementById('blp_is_coming_soon')) document.getElementById('blp_is_coming_soon').value = (page.is_coming_soon === true || page.is_coming_soon === 'true') ? 'true' : 'false';

    // Tracking Select / De-select
    const isFbActive = page.facebook_pixel_id !== 'disabled' && page.facebook_pixel_enabled !== false;
    const isGaActive = page.google_analytics_id !== 'disabled' && page.google_analytics_enabled !== false;
    if (document.getElementById('blp_fb_pixel_enabled')) {
      document.getElementById('blp_fb_pixel_enabled').checked = isFbActive;
    }
    if (document.getElementById('blp_google_tag_enabled')) {
      document.getElementById('blp_google_tag_enabled').checked = isGaActive;
    }

    // Section Banners Mapping
    currentSectionBanners = page.section_banners || {};
    if (page.preview_banner && !currentSectionBanners.sec_preview) {
      currentSectionBanners.sec_preview = page.preview_banner;
    }
    if (page.value_stack?.vip_banner && !currentSectionBanners.sec_vip_stack) {
      currentSectionBanners.sec_vip_stack = page.value_stack.vip_banner;
    }

    defaultSectionsList.forEach(s => {
      const bannerUrl = currentSectionBanners[s.key];
      const input = document.getElementById(`blp_sec_banner_${s.key}`);
      const wrap = document.getElementById(`blp_sec_banner_preview_wrap_${s.key}`);
      const img = document.getElementById(`blp_sec_banner_preview_${s.key}`);
      if (bannerUrl) {
        if (input) input.value = bannerUrl;
        if (img) img.src = bannerUrl;
        if (wrap) wrap.style.display = 'block';
      } else {
        if (input) input.value = '';
        if (wrap) wrap.style.display = 'none';
      }
    });

    // Timer
    const timerCfg = page.timer || {};
    document.getElementById('blp_timer_enabled').checked = timerCfg.enabled !== false;
    document.getElementById('blp_timer_minutes').value = timerCfg.minutes || 15;
    document.getElementById('blp_timer_text').value = timerCfg.text || '⚡ सीमित समय ऑफर: यह विशेष छूट केवल अगले 15 मिनट के लिए मान्य है!';

    // Suggested Books List
    currentSuggestedBooks = page.suggested_books_list || [];
    if (!currentSuggestedBooks || currentSuggestedBooks.length === 0) {
      const sugs = page.suggested_books || [];
      currentSuggestedBooks = sugs.map(s => {
        if (typeof s === 'object') return s;
        const b = allBooks.find(x => x.id === s);
        return {
          image: b?.cover || b?.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
          title: b?.heading || b?.name || s,
          offerPrice: b?.offerPrice || 99,
          mrp: b?.mrp || 299,
          link: s
        };
      });
    }

    // Value stack
    const stack = page.value_stack || {};
    document.getElementById('blp_stack_book_mrp').value = stack.book_mrp || hero.mrp || 299;
    document.getElementById('blp_stack_vip_val').value = stack.vip_value || 1999;
    document.getElementById('blp_stack_bonus_val').value = stack.bonus_value || 199;
    document.getElementById('blp_stack_offer_val').value = stack.offer_price || hero.offer_price || 99;
    document.getElementById('blp_vip_perk_text').value = stack.subscriber_perk || '';

    // Theme Color
    selectedThemePrimary = page.theme_primary || '#2E7D32';
    selectedThemeDark = page.theme_dark || '#1B5E20';
    document.getElementById('blp_custom_theme_color').value = selectedThemePrimary;

    document.getElementById('blp_wa_prompt').value = page.whatsapp_prompt || '';
    document.getElementById('blp_status').value = page.status || 'active';
    document.getElementById('blp_sticky_btn_text').value = page.sticky_button_text || 'खरीदें';

    // AI Support fields
    if (document.getElementById('blp_ai_support_title')) document.getElementById('blp_ai_support_title').value = page.ai_support_title || '';
    if (document.getElementById('blp_ai_support_cover')) document.getElementById('blp_ai_support_cover').value = page.ai_support_cover || '';
    if (document.getElementById('blp_ai_support_desc')) document.getElementById('blp_ai_support_desc').value = page.ai_support_desc || '';

    // Repeaters data
    currentKpis = hero.features || [
      { icon: 'fa-seedling', text: '120 पेज की प्रीमियम' },
      { icon: 'fa-camera', text: '300+ फोटो' }
    ];
    currentWhyCards = page.why_read?.cards || [];
    document.getElementById('blp_why_title').value = page.why_read?.title || 'यह पुस्तक क्यों खरीदें?';
    document.getElementById('blp_why_desc').value = page.why_read?.subtitle || '';

    currentVideos = page.videos || [];
    currentReviews = page.testimonials || [];
    currentDemoImages = page.demo_images || [];
    currentBonuses = page.bonuses || page.bonus_books || [];
    currentBonusPoints = page.bonus_points || [
      '24×7 WhatsApp Priority Support',
      '💬 आपका सवाल → हमारी मदद → आसान समाधान',
      '📖 किताब की जानकारी समझने में सहायता',
      '🌱 फसल संबंधी विशेष स्प्रे फॉर्मूला',
      '📱 Mobile Friendly PDF & Lifetime Access'
    ];
    currentTocPoints = page.table_of_contents || [
      'बीज उपचार',
      'खेत की तैयारी',
      'बुवाई की वैज्ञानिक विधि',
      'उर्वरक प्रबंधन',
      'रोग एवं कीट प्रबंधन'
    ];
    currentFaqs = page.faqs || [];
    currentSectionsOrder = (page.sections_order && Array.isArray(page.sections_order) && page.sections_order.length > 0) ? 
      [...page.sections_order] : defaultSectionsList.map(s => s.key);
    if (!currentSectionsOrder.includes('sec_ai_support')) {
      const bonusIdx = currentSectionsOrder.indexOf('sec_bonuses');
      if (bonusIdx >= 0) {
        currentSectionsOrder.splice(bonusIdx + 1, 0, 'sec_ai_support');
      } else {
        currentSectionsOrder.push('sec_ai_support');
      }
    }
    currentHiddenSections = page.hidden_sections || [];

    renderKpiBadgesInBuilder();
    renderWhyCardsInBuilder();
    renderVideosInBuilder();
    renderReviewsInBuilder();
    renderDemoImagesInBuilder();
    renderBonusesInBuilder();
    renderBonusPointsInBuilder();
    renderTocPointsInBuilder();
    renderFaqsInBuilder();
    renderSuggestedBooksInBuilder();
    renderSectionsReorderingList();

    builderCard.style.display = 'block';
    builderCard.scrollIntoView({ behavior: 'smooth' });
  };

  window.copyBookLandingUrl = function(bId) {
    const rawId = String(bId || '').toUpperCase();
    const shareUrl = `${window.location.origin}/api/share?id=${encodeURIComponent(bId)}`;
    let liveUrl = `${window.location.origin}/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`;
    if (rawId === 'BK001') liveUrl = `${window.location.origin}/ebooks/kharif-master-guide-2026.html`;
    else if (rawId === 'BK002') liveUrl = `${window.location.origin}/ebooks/kheti-dr.html`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast(`📲 WhatsApp/सोशल शेयर लिंक कॉपी हुआ: ${shareUrl}`, 'success');
    }).catch(() => {
      prompt('WhatsApp सोशल शेयर लिंक कॉपी करें:', shareUrl);
    });
  };

  window.deleteBookLandingPage = async function(bId) {
    if (!bId) return;
    if (!confirm(`क्या आप वाकई बुक लैंडिंग पेज (${bId}) को सर्वर व GitHub से हमेशा के लिए हटाना चाहते हैं?`)) return;

    const bIdUpper = bId.trim().toUpperCase();
    if (bIdUpper === 'BK001' || bIdUpper === 'BK002') {
      showToast(`⚠️ सुरक्षा नियम: ${bIdUpper} मुख्य सुरक्षित बुक है और इसे हटाया नहीं जा सकता।`, 'error');
      return;
    }

    allLandingPages = allLandingPages.filter(p => p.id && p.id.trim().toUpperCase() !== bIdUpper);
    try {
      localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(allLandingPages));
      
      const deletedIds = JSON.parse(localStorage.getItem('AAROGYAM_DELETED_LANDING_PAGES') || '[]');
      if (!deletedIds.includes(bIdUpper)) {
        deletedIds.push(bIdUpper);
        localStorage.setItem('AAROGYAM_DELETED_LANDING_PAGES', JSON.stringify(deletedIds));
      }

      // Also clean from custom books
      const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      const filteredCustom = customBooks.filter(x => x.id && x.id.toUpperCase() !== bIdUpper);
      localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(filteredCustom));
    } catch (e) {}

    updateKPIs();
    renderTable();
    showToast(`⏳ बुक (${bIdUpper}) को GitHub सर्वर से हटाया जा रहा है...`, 'info');

    try {
      const delRes = await fetch('/api/auto-sync-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          bookId: bIdUpper
        })
      });
      const delData = await delRes.json();
      if (delRes.ok && delData.success) {
        showToast(`🗑️ बुक (${bIdUpper}) GitHub सर्वर से 100% डिलीट हो गई! (लाइव अपडेट 20s में)`, 'success');
      } else {
        showToast(`⚠️ सर्वर से हटाने में समस्या: ${delData.error || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      showToast(`⚠️ नेटवर्क त्रुटि: ${err.message}`, 'error');
    }
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  function compressImageFile(file, maxWidth = 1400, quality = 0.85) {
    return new Promise((resolve) => {
      if (!file || !file.type || !file.type.startsWith('image/')) {
        if (file) {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = () => resolve(null);
          r.readAsDataURL(file);
        } else {
          resolve(null);
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            if (w > maxWidth) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/webp', quality);
            resolve(dataUrl);
          } catch (err) {
            resolve(e.target.result);
          }
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  async function saveBookLandingPage() {
    const bId = (document.getElementById('blp_input_book_id')?.value || '').trim().toUpperCase();
    const category = document.getElementById('blp_category_select')?.value || 'Agriculture';
    const title = (document.getElementById('blp_hero_title')?.value || '').trim();
    const offerPrice = parseInt(document.getElementById('blp_hero_offer_price')?.value, 10) || 99;
    const coverUrlInput = (document.getElementById('blp_cover_url')?.value || '').trim();
    const coverFileInput = document.getElementById('blp_file_cover');
    const bannerFileInput = document.getElementById('blp_file_banner');
    const bannerUrlInput = (document.getElementById('blp_banner_url')?.value || '').trim();
    const mainPdfFileInput = document.getElementById('blp_file_main_pdf');
    const freePdfFileInput = document.getElementById('blp_file_free_pdf');

    // SECTION-BY-SECTION VALIDATION WITH EXACT SECTION LOCATOR
    if (!bId) { 
      highlightSectionError('blp_input_book_id', '❌ [सेक्शन 1: ई-बुक पहचान] कृपया Book ID दर्ज करें (उदा. BK016)'); 
      return; 
    }
    if (!title) { 
      highlightSectionError('blp_hero_title', '❌ [सेक्शन 2: मुख्य शीर्षक] कृपया पुस्तक का नाम/टाइटल दर्ज करें'); 
      return; 
    }
    if (!coverUrlInput && (!coverFileInput || coverFileInput.files.length === 0)) {
      highlightSectionError('sec_box_cover', '❌ [सेक्शन 3: 3D कवर इमेज] कृपया 3D कवर इमेज चुनें या अपलोड करें');
      return;
    }

    // Strict guard for BK001 & BK002
    if (bId === 'BK001' || bId === 'BK002') {
      highlightSectionError('blp_input_book_id', `⚠️ सुरक्षा नियम: ${bId} सुरक्षित मुख्य बुक है और इसे संशोधित नहीं किया जा सकता।`);
      return;
    }

    // Check PDF size in Section 17 & 18 before proceeding (25MB GitHub limit)
    if (mainPdfFileInput?.files?.[0] && mainPdfFileInput.files[0].size > 25 * 1024 * 1024) {
      const mb = (mainPdfFileInput.files[0].size / (1024 * 1024)).toFixed(1);
      highlightSectionError('sec_box_main_pdf', `❌ [सेक्शन 17: मुख्य PDF] फ़ाइल (${mb}MB) 25MB से बड़ी है। कृपया इसे 25MB से कम करें।`);
      return;
    }

    if (freePdfFileInput?.files?.[0] && freePdfFileInput.files[0].size > 25 * 1024 * 1024) {
      const mb = (freePdfFileInput.files[0].size / (1024 * 1024)).toFixed(1);
      highlightSectionError('sec_box_free_pdf', `❌ [सेक्शन 18: फ्री PDF] फ़ाइल (${mb}MB) 25MB से बड़ी है। कृपया इसे 25MB से कम करें।`);
      return;
    }

    const mrp = parseInt(document.getElementById('blp_hero_mrp')?.value, 10) || 299;
    const coverEffect = document.getElementById('blp_cover_effect')?.value || '3d_float';
    const isTimerOn = document.getElementById('blp_timer_enabled')?.checked !== false;

    // Filter non-empty section banners
    const cleanSectionBanners = {};
    Object.keys(currentSectionBanners).forEach(k => {
      const v = currentSectionBanners[k];
      if (v && typeof v === 'string' && v.trim().length > 0) {
        cleanSectionBanners[k] = v.trim();
      }
    });

    const isFbOn = document.getElementById('blp_fb_pixel_enabled')?.checked !== false;
    const isGaOn = document.getElementById('blp_google_tag_enabled')?.checked !== false;

    const ogTitle = (document.getElementById('blp_og_title')?.value || '').trim() || title;
    const ogDesc = (document.getElementById('blp_og_description')?.value || '').trim() || (document.getElementById('blp_hero_desc')?.value || `${title} - सम्पूर्ण Practical Guide।`);

    const publishTargets = [];
    if (document.getElementById('blp_pub_ebook_store')?.checked) publishTargets.push('ebook_store');
    if (document.getElementById('blp_pub_category_page')?.checked) publishTargets.push('category_page');
    if (document.getElementById('blp_pub_my_library')?.checked) publishTargets.push('my_library');
    if (document.getElementById('blp_pub_home_page')?.checked) publishTargets.push('home_page');

    const storeBadge = document.getElementById('blp_store_badge')?.value || 'best_seller';
    const isComingSoon = document.getElementById('blp_is_coming_soon')?.value === 'true';

    // File Upload Packaging & 25MB Limit Check
    const uploadedFiles = [];
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

    // 1. Cover Image (File or Data URL with auto-compression)
    let finalCoverPath = coverUrlInput || `/images/books/${bId.toLowerCase()}-cover.webp`;
    if (coverFileInput?.files?.[0]) {
      const cFile = coverFileInput.files[0];
      if (cFile.size > MAX_FILE_SIZE) {
        showToast(`❌ कवर इमेज 25MB से बड़ी है (${(cFile.size/(1024*1024)).toFixed(1)}MB)।`, 'error');
        return;
      }
      const b64 = await compressImageFile(cFile, 1200, 0.85);
      finalCoverPath = `/images/books/${bId.toLowerCase()}-cover.webp`;
      uploadedFiles.push({ path: `images/books/${bId.toLowerCase()}-cover.webp`, base64: b64 });
    } else if (coverUrlInput && coverUrlInput.startsWith('data:image/')) {
      finalCoverPath = `/images/books/${bId.toLowerCase()}-cover.webp`;
      uploadedFiles.push({ path: `images/books/${bId.toLowerCase()}-cover.webp`, base64: coverUrlInput });
    }

    // 2. Banner Image (File or Data URL with auto-compression)
    let finalBannerPath = bannerUrlInput || `/images/banners/${bId.toLowerCase()}-hero-banner.webp`;
    if (bannerFileInput?.files?.[0]) {
      const bFile = bannerFileInput.files[0];
      if (bFile.size > MAX_FILE_SIZE) {
        showToast(`❌ बैनर इमेज 25MB से बड़ी है (${(bFile.size/(1024*1024)).toFixed(1)}MB)।`, 'error');
        return;
      }
      const b64 = await compressImageFile(bFile, 1600, 0.85);
      finalBannerPath = `/images/banners/${bId.toLowerCase()}-hero-banner.webp`;
      uploadedFiles.push({ path: `images/banners/${bId.toLowerCase()}-hero-banner.webp`, base64: b64 });
    } else if (bannerUrlInput && bannerUrlInput.startsWith('data:image/')) {
      finalBannerPath = `/images/banners/${bId.toLowerCase()}-hero-banner.webp`;
      uploadedFiles.push({ path: `images/banners/${bId.toLowerCase()}-hero-banner.webp`, base64: bannerUrlInput });
    }

    // 3. Section Banners
    Object.keys(cleanSectionBanners).forEach((secKey) => {
      const sUrl = cleanSectionBanners[secKey];
      if (sUrl && sUrl.startsWith('data:image/')) {
        const sPath = `images/banners/${bId.toLowerCase()}-${secKey}-banner.webp`;
        uploadedFiles.push({ path: sPath, base64: sUrl });
        cleanSectionBanners[secKey] = `/${sPath}`;
      }
    });

    // 4. Main Paid PDF
    let finalMainPdfPath = (document.getElementById('blp_main_pdf_url')?.value || '').trim();
    if (mainPdfFileInput?.files?.[0]) {
      const pdfFile = mainPdfFileInput.files[0];
      if (pdfFile.size > MAX_FILE_SIZE) {
        showToast(`❌ मुख्य PDF 25MB से बड़ी है (${(pdfFile.size/(1024*1024)).toFixed(1)}MB)। कृपया इसे 25MB से कम करें।`, 'error');
        return;
      }
      const b64 = await fileToBase64(pdfFile);
      finalMainPdfPath = `/uploads/books/${bId}_main.pdf`;
      uploadedFiles.push({ path: `uploads/books/${bId}_main.pdf`, base64: b64 });
    }

    // 5. Free Demo PDF
    let finalFreePdfPath = (document.getElementById('blp_free_pdf_url')?.value || '').trim();
    if (freePdfFileInput?.files?.[0]) {
      const fPdfFile = freePdfFileInput.files[0];
      if (fPdfFile.size > MAX_FILE_SIZE) {
        showToast(`❌ फ्री PDF 25MB से बड़ी है (${(fPdfFile.size/(1024*1024)).toFixed(1)}MB)।`, 'error');
        return;
      }
      const b64 = await fileToBase64(fPdfFile);
      finalFreePdfPath = `/uploads/books/${bId}_free.pdf`;
      uploadedFiles.push({ path: `uploads/books/${bId}_free.pdf`, base64: b64 });
    }

    // 6. Demo Images
    const cleanedDemoImages = [];
    for (let i = 0; i < currentDemoImages.length; i++) {
      const dImg = currentDemoImages[i];
      if (typeof dImg === 'string' && dImg.startsWith('data:image/')) {
        const dPath = `images/books/${bId.toLowerCase()}-preview-${i + 1}.webp`;
        uploadedFiles.push({ path: dPath, base64: dImg });
        cleanedDemoImages.push(`/${dPath}`);
      } else if (dImg) {
        cleanedDemoImages.push(dImg);
      }
    }

    const ogImg = (document.getElementById('blp_og_image')?.value || '').trim() || finalCoverPath;

    const pageData = {
      id: bId,
      slug: bId.toLowerCase(),
      category: category,
      status: document.getElementById('blp_status')?.value || 'active',
      facebook_pixel_id: isFbOn ? '1671873500553134' : 'disabled',
      google_analytics_id: isGaOn ? 'G-2BWPJVQWPK' : 'disabled',
      facebook_pixel_enabled: isFbOn,
      google_analytics_enabled: isGaOn,
      theme_primary: selectedThemePrimary,
      theme_dark: selectedThemeDark,
      cover_effect: coverEffect,
      sticky_button_text: document.getElementById('blp_sticky_btn_text')?.value || 'खरीदें',
      sections_order: currentSectionsOrder,
      hidden_sections: currentHiddenSections,
      section_banners: cleanSectionBanners,
      og_title: ogTitle,
      og_description: ogDesc,
      og_image: ogImg,
      mainPdf: finalMainPdfPath,
      main_pdf: finalMainPdfPath,
      freePdf: finalFreePdfPath,
      free_pdf: finalFreePdfPath,
      demoPdf: finalFreePdfPath,
      ai_support_title: (document.getElementById('blp_ai_support_title')?.value || '').trim(),
      ai_support_cover: (document.getElementById('blp_ai_support_cover')?.value || '').trim(),
      ai_support_desc: (document.getElementById('blp_ai_support_desc')?.value || '').trim(),
      bonuses: currentBonuses,
      bonus_books: currentBonuses,
      bonus_points: currentBonusPoints,
      timer: {
        enabled: isTimerOn,
        minutes: parseInt(document.getElementById('blp_timer_minutes')?.value, 10) || 15,
        text: document.getElementById('blp_timer_text')?.value || '⚡ सीमित समय ऑफर: यह विशेष छूट केवल अगले 15 मिनट के लिए मान्य है!',
        banner_image: cleanSectionBanners.sec_timer || undefined
      },
      hero: {
        tag: document.getElementById('blp_hero_tag')?.value || '🌾 Bestseller Agriculture eBook',
        title: title,
        subtitle: document.getElementById('blp_hero_subtitle')?.value || '',
        description: document.getElementById('blp_hero_desc')?.value || '',
        mrp: mrp,
        offer_price: offerPrice,
        offer_badge: document.getElementById('blp_hero_badge')?.value || 'Launch Offer',
        rating_score: document.getElementById('blp_rating_score')?.value || '4.9',
        rating_count: document.getElementById('blp_rating_count')?.value || '120+ Ratings',
        cover_image: finalCoverPath,
        banner_image: finalBannerPath,
        features: currentKpis
      },
      value_stack: {
        book_mrp: parseInt(document.getElementById('blp_stack_book_mrp')?.value, 10) || mrp,
        vip_value: parseInt(document.getElementById('blp_stack_vip_val')?.value, 10) || 1999,
        bonus_value: parseInt(document.getElementById('blp_stack_bonus_val')?.value, 10) || 199,
        offer_price: offerPrice,
        vip_banner: cleanSectionBanners.sec_vip_stack || undefined,
        subscriber_perk: document.getElementById('blp_vip_perk_text')?.value || '👑 VIP मेंबर्स के लिए 1 वर्ष का Pro सब्सक्रिप्शन 100% मुफ्त शामिल है।'
      },
      why_read: {
        title: document.getElementById('blp_why_title')?.value || 'यह पुस्तक क्यों खरीदें?',
        subtitle: document.getElementById('blp_why_desc')?.value || '',
        banner_image: cleanSectionBanners.sec_why_buy || undefined,
        cards: currentWhyCards
      },
      preview_banner: cleanSectionBanners.sec_preview || undefined,
      demo_images: cleanedDemoImages.length > 0 ? cleanedDemoImages : undefined,
      suggested_books_list: currentSuggestedBooks,
      suggested_books: currentSuggestedBooks.map(x => x.link || x.id || x.title).filter(Boolean),
      bonuses: currentBonuses,
      bonus_books: currentBonuses,
      bonus_points: currentBonusPoints,
      table_of_contents: currentTocPoints,
      videos: currentVideos,
      testimonials: currentReviews,
      faqs: currentFaqs.length > 0 ? currentFaqs : undefined,
      whatsapp_prompt: document.getElementById('blp_wa_prompt')?.value || `नमस्ते, मुझे '${title}' पुस्तक के बारे में और जानकारी चाहिए।`
    };

    const existingIdx = allLandingPages.findIndex(p => p.id === bId);
    if (existingIdx >= 0) allLandingPages[existingIdx] = pageData;
    else allLandingPages.unshift(pageData);

    const newBookObj = {
      id: bId,
      slug: bId.toLowerCase(),
      heading: title,
      name: title,
      category: category,
      language: 'Hindi',
      mrp: mrp,
      offerPrice: offerPrice,
      cover: finalCoverPath,
      thumbnail: finalCoverPath,
      banner: finalBannerPath,
      status: pageData.status,
      publish_targets: publishTargets,
      store_badge: storeBadge,
      badge: storeBadge,
      isComingSoon: isComingSoon,
      mainPdf: finalMainPdfPath,
      pdf_url: finalMainPdfPath,
      freePdf: finalFreePdfPath,
      demoPdf: finalFreePdfPath,
      features: currentKpis.map(k => (typeof k === 'object' ? k.text : k)).filter(Boolean),
      totalPages: 120,
      landingPage: `/ebooks/book-landing.html?id=${bId}`,
      checkoutPage: '/ebooks/checkout.html',
      readerPage: '/ebooks/reader.html'
    };

    try {
      localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(allLandingPages));
      const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      const bIdx = customBooks.findIndex(x => x.id === bId);
      if (bIdx >= 0) customBooks[bIdx] = newBookObj;
      else customBooks.unshift(newBookObj);
      localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(customBooks));

      const existingBookIdx = allBooks.findIndex(x => x.id === bId);
      if (existingBookIdx >= 0) allBooks[existingBookIdx] = newBookObj;
      else allBooks.unshift(newBookObj);
    } catch (e) {}

    // Trigger Secure Modular Auto Git Sync API (Eliminates 413 by uploading files individually)
    const saveButtonEl = document.getElementById('btn_save_book_lp');
    const origSaveText = saveButtonEl ? saveButtonEl.innerHTML : '';
    if (saveButtonEl) {
      saveButtonEl.disabled = true;
      saveButtonEl.innerHTML = '⏳ GitHub पर लाइव सिंक हो रहा है...';
    }

    showToast(`⏳ बुक (${bId}) को GitHub पर सिंक किया जा रहा है...`, 'info');

    let syncSuccess = false;
    let syncErrorMsg = '';

    try {
      // Step 1: Upload individual media files (Images, PDFs) separately to stay far below 4.5MB
      for (let i = 0; i < uploadedFiles.length; i++) {
        const fileItem = uploadedFiles[i];
        if (saveButtonEl) {
          saveButtonEl.innerHTML = `⏳ फ़ाइल (${i + 1}/${uploadedFiles.length}) अपलोड हो रही है...`;
        }
        const fileRes = await fetch('/api/auto-sync-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload_asset',
            path: fileItem.path,
            base64: fileItem.base64
          })
        });
        const fileData = await fileRes.json().catch(() => ({}));
        if (!fileRes.ok || !fileData.success) {
          throw new Error(fileData.error || `फ़ाइल (${fileItem.path}) अपलोड विफल (HTTP ${fileRes.status})`);
        }
      }

      // Step 2: Save metadata JSON (Catalog & Landing Page)
      if (saveButtonEl) {
        saveButtonEl.innerHTML = '⏳ कैटलॉग व लैंडिंग डेटा सुरक्षित हो रहा है...';
      }
      const syncRes = await fetch('/api/auto-sync-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          pageData,
          bookData: newBookObj,
          uploadedFiles: [] // Already uploaded in Step 1
        })
      });

      let syncData = {};
      try {
        syncData = await syncRes.json();
      } catch (pe) {
        syncData = { error: `Server HTTP ${syncRes.status}: ${syncRes.statusText}` };
      }

      if (syncRes.ok && syncData.success) {
        syncSuccess = true;
      } else {
        syncErrorMsg = syncData.error || 'Unknown server error';
      }
    } catch (netErr) {
      syncErrorMsg = netErr.message || 'Network error connecting to /api/auto-sync-book';
    } finally {
      if (saveButtonEl) {
        saveButtonEl.disabled = false;
        saveButtonEl.innerHTML = origSaveText;
      }
    }

    if (syncSuccess) {
      try {
        let deletedIds = JSON.parse(localStorage.getItem('AAROGYAM_DELETED_LANDING_PAGES') || '[]');
        deletedIds = deletedIds.filter(id => id !== bId);
        localStorage.setItem('AAROGYAM_DELETED_LANDING_PAGES', JSON.stringify(deletedIds));
      } catch (e) {}

      showToast(`🎉 बुक (${bId}) 100% लाइव सिंक हो गई! (GitHub Commit सफल, 20-30s में लाइव)`, 'success');
      builderCard.style.display = 'none';
      resetBookBuilder();
      await loadAllData();
    } else {
      showToast(`❌ लाइव सिंक विफल: ${syncErrorMsg}`, 'error');
      // Keep builder card open so user does not lose input
    }
  }

  function exportJsonFiles() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ bookLandingPages: allLandingPages }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "universal-book-landing-pages.json");
    dlAnchorElem.click();
    showToast('📥 universal-book-landing-pages.json डाउनलोड हो गया!', 'success');
  }

  function adjustColorBrightness(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
}
