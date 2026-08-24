/* ==========================================================================
   AAROGYAM INDIA — ULTIMATE ADMIN BOOK LANDING PAGES HUB (V21.0)
   Comprehensive features:
   - Auto Book Code Generator (BK008, BK009, etc.)
   - Facebook Pixel ID & Google Analytics ID Tracker
   - Category Selection (Agriculture, Health, Business, NETSURF, Education, Digital AI)
   - Visual Image Uploader with Dimension Frame Guides (Banner 1734x907, Cover 600x800, OG Image 1200x630, VIP Banner 1200x400)
   - Total Value Stack Calculator (₹1999 VIP Free + ₹99 Book = ₹2098+ Value for ₹99)
   - Multi-Video Manager (16:9 Landscape & 9:16 Vertical Shorts/Reels)
   - Advanced Customer Reviews Manager with Male/Female Avatar Selectors (👨/👩)
   - OpenGraph & Social SEO Meta Manager (OG Title, Desc, Image)
   - Customizable Sticky Action Bar (Button Text & Color)
   - Aarogyam Pro VIP Subscriber Perk Customizer with Banner Uploader
   - Dynamic KPIs & Feature Badges Builder
   - Demo Pages Gallery Uploader
   - Free Bonus Books & Bundles Manager
   - FAQs Manager
   - Global Library Sync
   ========================================================================== */

import { initAdminLayout, showToast } from './admin-main.js';

export async function initBookLandingPages() {
  initAdminLayout('Book Landing Pages Hub', 'Create and manage rich high-converting dynamic book landing pages with FB Pixel, Google ID, Total Value Stack, multi-video, avatar reviews, and custom themes.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let allBooks = [];
  let allLandingPages = [];
  let editingBookId = null;

  // Dynamic Array States
  let currentBonuses = [];
  let currentKpis = [];
  let currentDemoImages = [];
  let currentVideos = [];
  let currentReviews = [];
  let currentFaqs = [];
  let currentSuggestedBooks = [];
  let selectedThemePrimary = '#2E7D32';
  let selectedThemeDark = '#1B5E20';

  content.innerHTML = `
    <!-- Top Action Header -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📚 Universal Book Landing Pages Hub</span>
            <span style="font-size: 0.75rem; background: rgba(46,125,50,0.15); color: #16a34a; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Ultimate PRO V21</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">
            FB Pixel, Google ID, ₹1999 VIP वैल्यू स्टैक, मल्टी-वीडियो, अवतार रिव्यूज व कार्ट इंटीग्रेशन के साथ संपूर्ण बुक लैंडिंग पेज बनाएं।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-toggle-book-builder" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(22,163,74,0.3);">
            <span>✨</span> <span>+ नया बुक लैंडिंग पेज बनाएं</span>
          </button>
          <a href="/ebooks/cart.html" target="_blank" class="admin-button small-button" style="background: #2563eb; color: #fff; text-decoration: none; font-weight: 700;">
            🛒 लाइव कार्ट देखें
          </a>
          <button id="book-lp-refresh-btn" class="admin-button small-button">🔄 Refresh</button>
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
        
        <!-- SECTION 1: BOOK CODE / ID & CATEGORY -->
        <div style="background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <label style="font-weight: 800; color: #16a34a; font-size: 0.95rem; margin: 0;">
              🆔 1. बुक कोड व कैटेगरी चयन (Book Code & Category) *
            </label>
            <button type="button" id="btn_generate_book_code" class="admin-button small-button" style="background: #16a34a; color: #fff; font-weight: 700; padding: 4px 12px;">
              ⚡ नया Book Code जनरेट करें
            </button>
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

        <!-- SECTION 2: MARKETING & TRACKING (FIXED BUILT-IN ON/OFF TOGGLES) -->
        <div style="background: rgba(37,99,235,0.08); border: 1.5px solid rgba(37,99,235,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 800; color: #60a5fa; font-size: 0.95rem; margin-bottom: 8px;">
            📊 2. मार्केटिंग ट्रैकिंग एवं पिक्सल (One-Click Active Toggles)
          </div>
          <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: var(--admin-text); cursor: pointer;">
              <input type="checkbox" id="blp_fb_pixel_enabled" checked style="accent-color: #2563eb; width: 18px; height: 18px;" />
              <span>🔵 Facebook Pixel (ID: 1671873500553134) चालू रखें</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: var(--admin-text); cursor: pointer;">
              <input type="checkbox" id="blp_ga_enabled" checked style="accent-color: #2563eb; width: 18px; height: 18px;" />
              <span>🔴 Google Analytics व Ads Conversion चालू रखें</span>
            </label>
          </div>
        </div>

        <!-- SECTION 2.1: SUGGESTED / RELATED BOOKS (IMAGE, TITLE, PRICE, LINK & ADD TO CART) -->
        <div style="background: rgba(245,158,11,0.08); border: 1.5px solid rgba(245,158,11,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-weight: 800; color: #f59e0b; font-size: 0.95rem;">
              🛒 2.1 संबंधित / सुझाई गई पुस्तकें (Suggested Books with Image, Title, Price & Cart)
            </div>
            <button type="button" id="btn_add_suggested_book_item" class="admin-button small-button" style="background: #f59e0b; color: #000; font-weight: 800;">
              + संबंधित पुस्तक जोड़ें
            </button>
          </div>
          <p style="font-size: 0.78rem; color: var(--admin-muted); margin: 0 0 10px 0;">
            पेज के नीचे दिखने वाली पुस्तकें जोड़ें। इसमें कवर फोटो, शीर्षक, मूल्य, लिंक और "Add to Cart" बटन स्वतः सक्रिय रहेगा:
          </p>
          <div id="blp_suggested_books_list_wrap" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- SECTION 3: HERO DETAILS & PRICING -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 16px;">
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
            <input type="number" id="blp_hero_mrp" class="admin-input" placeholder="299" style="width: 100%; padding: 8px 12px;" />
          </div>
          <div>
            <label class="admin-label" style="font-weight: 700; color: #16a34a;">ऑफर मूल्य (Offer Price ₹): *</label>
            <input type="number" id="blp_hero_offer_price" class="admin-input" placeholder="99" required style="width: 100%; padding: 8px 12px; font-weight: 800;" />
          </div>
          <div>
            <label class="admin-label" style="font-weight: 700;">ऑफर बैज (Offer Badge):</label>
            <input type="text" id="blp_hero_badge" class="admin-input" placeholder="Launch Offer" style="width: 100%; padding: 8px 12px;" />
          </div>
          <div>
            <label class="admin-label" style="font-weight: 700;">रेटिंग स्कोर व पाठकों की संख्या:</label>
            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 8px;">
              <input type="text" id="blp_rating_score" class="admin-input" placeholder="4.9" style="width:100%; padding:8px 10px;" />
              <input type="text" id="blp_rating_count" class="admin-input" placeholder="120+ Ratings" style="width:100%; padding:8px 10px;" />
            </div>
          </div>
        </div>

        <!-- SECTION 4: IMAGE UPLOADERS WITH DIMENSION FRAME GUIDES -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; margin-bottom: 12px;">
            🖼️ 3. इमेज अपलोडर व साइज/फ्रेम गाइडलाइन (Dimension Frames & Upload)
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <!-- Hero Background Banner -->
            <div style="background: rgba(0,0,0,0.25); border: 1.5px dashed #0284c7; border-radius: 8px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-weight: 700; font-size: 0.84rem; color: #38bdf8;">
                  🖼️ बैकग्राउंड बैनर (Hero Banner)
                </label>
                <span style="font-size: 0.72rem; background: #0369a1; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 800;">
                  📐 1734 × 907 px (16:9)
                </span>
              </div>
              <input type="file" id="blp_file_banner" accept="image/*" class="admin-input" style="width: 100%; padding: 6px; font-size: 0.78rem; margin-bottom: 6px;" />
              <input type="text" id="blp_banner_url" class="admin-input" placeholder="या इमेज URL / Path दर्ज करें" style="width: 100%; padding: 6px 10px; font-size: 0.8rem;" />
              <div style="margin-top: 8px; text-align: center;">
                <img id="blp_preview_banner_img" src="../images/banners/kharif-master-guide-2026-hero-banner.webp" alt="Banner Preview" style="max-height: 80px; width: 100%; object-fit: cover; border-radius: 4px; border: 1px solid var(--admin-border);" />
              </div>
            </div>

            <!-- 3D Book Cover -->
            <div style="background: rgba(0,0,0,0.25); border: 1.5px dashed #16a34a; border-radius: 8px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-weight: 700; font-size: 0.84rem; color: #4ade80;">
                  📸 3D बुक कवर (Book Mockup Cover) *
                </label>
                <span style="font-size: 0.72rem; background: #15803d; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 800;">
                  📐 600 × 800 px (3:4 Portrait)
                </span>
              </div>
              <input type="file" id="blp_file_cover" accept="image/*" class="admin-input" style="width: 100%; padding: 6px; font-size: 0.78rem; margin-bottom: 6px;" />
              <input type="text" id="blp_cover_url" class="admin-input" placeholder="या इमेज URL / Path दर्ज करें" required style="width: 100%; padding: 6px 10px; font-size: 0.8rem;" />
              <div style="margin-top: 8px; text-align: center;">
                <img id="blp_preview_cover_img" src="../images/books/kharif-master-guide-2026-cover.webp" alt="Cover Preview" style="max-height: 80px; width: 60px; object-fit: cover; margin: 0 auto; border-radius: 4px; border: 1px solid var(--admin-border);" />
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 5: TOTAL VALUE STACK CALCULATION (₹1999 Free + ₹99 Book) -->
        <div style="background: linear-gradient(135deg, rgba(5,46,22,0.15) 0%, rgba(20,83,45,0.15) 100%); border: 2px solid #22c55e; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 900; color: #4ade80; font-size: 0.95rem; margin-bottom: 8px;">
            💎 4. टोटल वैल्यू स्टैक कैलकुलेशन (Total Value Stack - ₹1999 VIP Free)
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
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
        </div>

        <!-- SECTION 6: VIP SUBSCRIBER BENEFIT CARD WITH BANNER UPLOADER -->
        <div style="background: rgba(250,204,21,0.08); border: 1.5px solid rgba(250,204,21,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 800; color: #facc15; font-size: 0.95rem; margin-bottom: 10px;">
            👑 5. Aarogyam Pro VIP सब्सक्राइबर लाभ कार्ड (VIP Perks & Banner)
          </div>
          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; margin-bottom: 10px;">
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">VIP बैनर इमेज URL / Upload (1200 × 400 px):</label>
              <input type="file" id="blp_file_vip_banner" accept="image/*" class="admin-input" style="width:100%;padding:4px;font-size:0.75rem;margin-bottom:4px;" />
              <input type="text" id="blp_vip_banner_url" class="admin-input" placeholder="या VIP बैनर URL दर्ज करें" style="width:100%;padding:6px 10px;font-size:0.8rem;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">VIP मुख्य संदेश (Heading):</label>
              <input type="text" id="blp_vip_perk_text" class="admin-input" placeholder="👑 VIP मेंबर्स के लिए यह गाइड 100% मुफ्त शामिल है।" style="width:100%;padding:6px 10px;" />
            </div>
          </div>
        </div>

        <!-- SECTION 7: THEME COLOR CUSTOMIZER -->
        <div style="background: rgba(139,92,246,0.08); border: 1.5px solid rgba(139,92,246,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <label style="font-weight: 800; color: #a78bfa; font-size: 0.95rem; display: block; margin-bottom: 8px;">
            🎨 6. थीम कलर कस्टमाइजर (Theme Color Palette System)
          </label>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
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
        </div>

        <!-- SECTION 8: MULTI-VIDEO MANAGER -->
        <div style="background: rgba(59,130,246,0.08); border: 1.5px solid rgba(59,130,246,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <div style="font-weight: 800; color: #3b82f6; font-size: 0.95rem;">
                🎥 7. मल्टी-वीडियो मैनेजर (16:9 Landscape & 9:16 Shorts/Reels)
              </div>
            </div>
            <button type="button" id="btn_add_video_item" class="admin-button small-button" style="background: #2563eb; color: #fff; font-weight: 700;">
              + नया वीडियो जोड़ें
            </button>
          </div>
          <div id="blp_videos_list_wrap" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- SECTION 9: ADVANCED REVIEWS & AVATARS -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <div style="font-weight: 800; color: #f59e0b; font-size: 0.95rem;">
                ⭐ 8. कस्टमर रिव्यूज व ऑटो मेल/फीमेल अवतार (👨/👩)
              </div>
            </div>
            <button type="button" id="btn_add_review_item" class="admin-button small-button" style="background: #d97706; color: #fff; font-weight: 700;">
              + नया रिव्यू जोड़ें
            </button>
          </div>
          <div id="blp_reviews_list_wrap" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- SECTION 10: OPENGRAPH & SOCIAL SEO META -->
        <div style="background: rgba(16,185,129,0.08); border: 1.5px solid rgba(16,185,129,0.3); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 800; color: #10b981; font-size: 0.95rem; margin-bottom: 10px;">
            🌐 9. सोशल मीडिया शेयरिंग एवं OpenGraph Meta (1200 × 630 px)
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">OG Title:</label>
              <input type="text" id="blp_og_title" class="admin-input" placeholder="खरीफ फसल मास्टर गाइड 2026" style="width:100%;padding:6px 10px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.78rem;">OG Image URL (1200 × 630 px):</label>
              <input type="text" id="blp_og_image" class="admin-input" placeholder="https://aarogyamindia.online/images/books/kharif-fasal-og.webp" style="width:100%;padding:6px 10px;" />
            </div>
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.78rem;">OG Description:</label>
            <input type="text" id="blp_og_desc" class="admin-input" placeholder="सम्पूर्ण Practical Guide। अभी ₹299 की जगह ₹99 में उपलब्ध।" style="width:100%;padding:6px 10px;" />
          </div>
        </div>

        <!-- SECTION 11: DEMO GALLERY & BONUSES -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: 800; color: #fbbf24; font-size: 0.95rem;">
              📖 10. डेमो पेजेस व बोनस पुस्तकें
            </div>
            <button type="button" id="btn_add_demo_image" class="admin-button small-button" style="background: #d97706; color: #fff; font-weight: 700;">
              + नया डेमो पेज जोड़ें
            </button>
          </div>
          <div id="blp_demo_images_wrap" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px;">
            <!-- Rendered dynamically -->
          </div>

          <div style="border-top: 1px dashed var(--admin-border); padding-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-weight: 800; color: #f59e0b; font-size: 0.92rem;">
                🎁 मुफ्त बोनस पुस्तकें एवं बंडल गिफ्ट्स
              </div>
              <button type="button" id="btn_add_bonus_item" class="admin-button small-button" style="background: #f59e0b; color: #000; font-weight: 800;">
                + बोनस बुक जोड़ें
              </button>
            </div>
            <div id="blp_bonuses_list_wrap" style="display: flex; flex-direction: column; gap: 8px;">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- SECTION 12: FAQS & WHATSAPP PROMPT -->
        <div style="background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem;">
              ❓ 11. अक्सर पूछे जाने वाले सवाल (FAQs Manager)
            </div>
            <button type="button" id="btn_add_faq_item" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 700;">
              + नया FAQ जोड़ें
            </button>
          </div>
          <div id="blp_faqs_list_wrap" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
            <!-- Rendered dynamically -->
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
            <div>
              <label class="admin-label" style="font-weight: 700;">💬 WhatsApp हेल्पडेस्क प्रॉम्प्ट मैसेज:</label>
              <input type="text" id="blp_wa_prompt" class="admin-input" placeholder="नमस्ते, मुझे पुस्तक के बारे में और जानकारी चाहिए।" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700;">लाइव / ऑफलाइन स्टेटस:</label>
              <select id="blp_status" class="admin-select" style="width: 100%; padding: 8px 12px; font-weight: 800;">
                <option value="active">🟢 Live / Online</option>
                <option value="draft">⏳ Draft / Offline</option>
                <option value="disabled">🔴 Disabled</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SUBMIT & CANCEL BUTTONS -->
        <div style="display: flex; gap: 10px; border-top: 1px solid var(--admin-border); padding-top: 16px;">
          <button type="button" id="btn_save_book_lp" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 800; padding: 12px 28px; font-size: 1rem;">
            💾 बुक लैंडिंग पेज सुरक्षित करें (Save Page)
          </button>
          <button type="button" id="btn_cancel_book_lp" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted);">
            रद्द करें (Cancel)
          </button>
        </div>
      </form>
    </div>

    <!-- Active Landing Pages List -->
    <div class="admin-card">
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
  `;

  // Bind Listeners
  const builderCard = document.getElementById('admin-book-builder-card');
  const toggleBtn = document.getElementById('btn-toggle-book-builder');
  const closeBtn = document.getElementById('btn-close-book-builder');
  const cancelBtn = document.getElementById('btn_cancel_book_lp');
  const refreshBtn = document.getElementById('book-lp-refresh-btn');
  const saveBtn = document.getElementById('btn_save_book_lp');
  const bookSelect = document.getElementById('blp_select_existing_book');
  const genCodeBtn = document.getElementById('btn_generate_book_code');
  const searchInput = document.getElementById('blp_search_input');

  setupImagePreview('blp_file_banner', 'blp_banner_url', 'blp_preview_banner_img');
  setupImagePreview('blp_file_cover', 'blp_cover_url', 'blp_preview_cover_img');
  setupImagePreview('blp_file_vip_banner', 'blp_vip_banner_url', null);

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
    document.getElementById('blp_banner_url').value = b.banner || '../images/banners/kharif-master-guide-2026-hero-banner.webp';
    document.getElementById('blp_preview_cover_img').src = b.cover || b.thumbnail || '../images/books/kharif-master-guide-2026-cover.webp';
    document.getElementById('blp_preview_banner_img').src = b.banner || '../images/banners/kharif-master-guide-2026-hero-banner.webp';
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
    currentDemoImages.push('../images/books/kharif-master-guide-2026-preview-01.webp');
    renderDemoImagesInBuilder();
  });

  document.getElementById('btn_add_bonus_item')?.addEventListener('click', () => {
    currentBonuses.push({ title: 'नई बोनस ई-बुक', description: 'मुफ्त प्रैक्टिकल गाइड', mrp: 199, image: '../images/books/kharif-fasal-hero-2.webp' });
    renderBonusesInBuilder();
  });

  document.getElementById('btn_add_faq_item')?.addEventListener('click', () => {
    currentFaqs.push({ q: 'नया प्रश्न यहाँ लिखें?', a: 'उत्तर यहाँ लिखें।' });
    renderFaqsInBuilder();
  });

  document.getElementById('btn_add_suggested_book_item')?.addEventListener('click', () => {
    currentSuggestedBooks.push({
      image: '../images/books/kharif-master-guide-2026-cover.webp',
      title: 'संबंधित ई-बुक गाइड',
      offerPrice: 99,
      mrp: 299,
      link: 'BK002'
    });
    renderSuggestedBooksInBuilder();
  });

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

    if (bookSelect) {
      bookSelect.innerHTML = '<option value="">-- लाइब्रेरी से ई-बुक चुनें (Auto-Fill) --</option>' +
        allBooks.map(b => `<option value="${b.id}">${b.id}: ${b.heading || b.name} (₹${b.offerPrice || 99})</option>`).join('');
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
            <th>मूल्य</th>
            <th>ट्रैकिंग</th>
            <th>थीम</th>
            <th>स्टेटस</th>
            <th>एक्शन</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(p => {
            const hasPixel = !!p.facebook_pixel_id;
            const liveUrl = `/ebooks/book-landing.html?id=${encodeURIComponent(p.id)}`;
            const isLive = (p.status || 'active') === 'active';
            const themeCol = p.theme_primary || '#2E7D32';

            return `
              <tr>
                <td><strong style="font-family:monospace;color:${themeCol};">${p.id}</strong></td>
                <td>
                  <img src="${p.hero?.cover_image || '../images/books/kharif-master-guide-2026-cover.webp'}" alt="Cover" style="width:38px;height:50px;object-fit:cover;border-radius:4px;border:1px solid var(--admin-border);" />
                </td>
                <td>
                  <div style="font-weight:800;color:var(--admin-text);">${p.hero?.title || 'Untitled'}</div>
                  <div style="font-size:0.75rem;color:#16a34a;font-weight:700;">📁 ${p.category || 'Agriculture'}</div>
                </td>
                <td>
                  <strong style="color:#16a34a;font-size:0.95rem;">₹${p.hero?.offer_price || 99}</strong>
                  <span style="font-size:0.75rem;color:var(--admin-muted);text-decoration:line-through;margin-left:4px;">₹${p.hero?.mrp || 299}</span>
                </td>
                <td>
                  <span style="font-size:0.72rem;background:${hasPixel ? 'rgba(37,99,235,0.15)' : 'rgba(100,116,139,0.15)'};color:${hasPixel ? '#3b82f6' : '#64748b'};padding:2px 6px;border-radius:4px;font-weight:700;">
                    ${hasPixel ? '📊 Pixel ON' : 'No Pixel'}
                  </span>
                </td>
                <td>
                  <div style="width:14px;height:14px;border-radius:50%;background:${themeCol};"></div>
                </td>
                <td>
                  <button type="button" onclick="window.toggleLiveStatus('${p.id}')" class="admin-button small-button" style="background:${isLive ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)'};color:${isLive ? '#16a34a' : '#ef4444'};border:1px solid ${isLive ? '#16a34a' : '#ef4444'};padding:3px 8px;border-radius:6px;font-size:0.78rem;font-weight:800;">
                    ${isLive ? '🟢 Live' : '🔴 Offline'}
                  </button>
                </td>
                <td>
                  <div style="display:flex;gap:6px;align-items:center;">
                    <a href="${liveUrl}" target="_blank" class="admin-button small-button" style="background:#2563eb;color:#fff;text-decoration:none;" title="लाइव पेज देखें">
                      👁️ देखें
                    </a>
                    <button type="button" onclick="window.editBookLandingPage('${p.id}')" class="admin-button small-button" style="background:#f59e0b;color:#000;font-weight:700;" title="एडिट करें">
                      ✏️
                    </button>
                    <button type="button" onclick="window.copyBookLandingUrl('${p.id}')" class="admin-button small-button" style="background:transparent;border:1px solid var(--admin-border);color:var(--admin-muted);" title="लिंक कॉपी करें">
                      📋
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

  function renderVideosInBuilder() {
    const wrap = document.getElementById('blp_videos_list_wrap');
    if (!wrap) return;
    if (currentVideos.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:8px;">कोई वीडियो नहीं है। "+ नया वीडियो जोड़ें" पर क्लिक करें।</div>';
      return;
    }
    wrap.innerHTML = currentVideos.map((v, idx) => `
      <div style="background:var(--admin-surface, #1e293b);border:1px solid var(--admin-border);border-radius:8px;padding:10px;display:grid;grid-template-columns:2fr 1.5fr 1fr auto;gap:8px;align-items:center;">
        <input type="url" placeholder="YouTube URL" value="${escapeHtml(v.url || '')}" onchange="window.updateVideoField(${idx}, 'url', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;" />
        <input type="text" placeholder="वीडियो शीर्षक" value="${escapeHtml(v.title || '')}" onchange="window.updateVideoField(${idx}, 'title', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;" />
        <select onchange="window.updateVideoField(${idx}, 'ratio', this.value)" class="admin-select" style="padding:4px 8px;font-size:0.8rem;font-weight:700;">
          <option value="16:9" ${v.ratio === '16:9' ? 'selected' : ''}>📺 16:9 Landscape</option>
          <option value="9:16" ${v.ratio === '9:16' ? 'selected' : ''}>📱 9:16 Shorts/Reels</option>
        </select>
        <button type="button" onclick="window.removeVideoItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:3px 8px;">&times;</button>
      </div>
    `).join('');
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
    wrap.innerHTML = currentDemoImages.map((img, idx) => `
      <div style="position:relative;width:60px;height:80px;border-radius:4px;overflow:hidden;border:1px solid var(--admin-border);">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;" />
        <button type="button" onclick="window.removeDemoImage(${idx})" style="position:absolute;top:2px;right:2px;background:#ef4444;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;">&times;</button>
      </div>
    `).join('') + `
      <div style="display:flex;align-items:center;">
        <input type="file" accept="image/*" onchange="window.uploadDemoImage(event)" style="font-size:0.75rem;max-width:180px;" />
      </div>
    `;
  }

  function renderBonusesInBuilder() {
    const wrap = document.getElementById('blp_bonuses_list_wrap');
    if (!wrap) return;
    if (currentBonuses.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:8px;">कोई बोनस बुक नहीं जोड़ी गई। "+ बोनस बुक जोड़ें" पर क्लिक करें।</div>';
      return;
    }
    wrap.innerHTML = currentBonuses.map((b, idx) => `
      <div style="background:var(--admin-surface, #1e293b);border:1px solid var(--admin-border);border-radius:8px;padding:10px;display:grid;grid-template-columns:1.5fr 2fr 1fr 1.5fr auto;gap:8px;align-items:center;">
        <input type="text" placeholder="बोनस शीर्षक" value="${escapeHtml(b.title)}" onchange="window.updateBonusField(${idx}, 'title', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;" />
        <input type="text" placeholder="विवरण" value="${escapeHtml(b.description || '')}" onchange="window.updateBonusField(${idx}, 'description', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;" />
        <input type="number" placeholder="मूल्य ₹" value="${b.mrp || 199}" onchange="window.updateBonusField(${idx}, 'mrp', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;" />
        <input type="text" placeholder="इमेज URL" value="${escapeHtml(b.image || '')}" onchange="window.updateBonusField(${idx}, 'image', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.82rem;" />
        <button type="button" onclick="window.removeBonusItem(${idx})" class="admin-button small-button" style="background:#ef4444;color:#fff;padding:3px 8px;">&times;</button>
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
            <input type="text" placeholder="../images/books/cover.webp" value="${escapeHtml(sb.image || '')}" onchange="window.updateSuggestedBookField(${idx}, 'image', this.value)" class="admin-input" style="padding:4px 8px;font-size:0.8rem;" />
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

  window.updateVideoField = (idx, field, val) => { if (currentVideos[idx]) currentVideos[idx][field] = val; };
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
  window.removeDemoImage = (idx) => { currentDemoImages.splice(idx, 1); renderDemoImagesInBuilder(); };
  window.updateBonusField = (idx, field, val) => { if (currentBonuses[idx]) currentBonuses[idx][field] = field === 'mrp' ? parseInt(val, 10) : val; };
  window.removeBonusItem = (idx) => { currentBonuses.splice(idx, 1); renderBonusesInBuilder(); };
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
    currentBonuses = [];
    currentKpis = [];
    currentVideos = [];
    currentReviews = [];
    currentDemoImages = [];
    currentFaqs = [];
    currentSuggestedBooks = [];
    selectedThemePrimary = '#2E7D32';
    selectedThemeDark = '#1B5E20';

    document.getElementById('admin-book-builder-title').textContent = 'नया बुक लैंडिंग पेज बनाएं (Universal Book Creator)';
    document.getElementById('admin-book-lp-form').reset();
    document.getElementById('blp_preview_cover_img').src = '../images/books/kharif-master-guide-2026-cover.webp';
    document.getElementById('blp_preview_banner_img').src = '../images/banners/kharif-master-guide-2026-hero-banner.webp';
    
    renderVideosInBuilder();
    renderReviewsInBuilder();
    renderDemoImagesInBuilder();
    renderBonusesInBuilder();
    renderFaqsInBuilder();
    renderSuggestedBooksInBuilder();
  }

  window.editBookLandingPage = function(bId) {
    const page = allLandingPages.find(p => p.id === bId);
    if (!page) return;

    editingBookId = page.id;
    document.getElementById('admin-book-builder-title').textContent = `✏️ एडिट बुक लैंडिंग पेज: ${page.id}`;
    
    document.getElementById('blp_input_book_id').value = page.id || '';
    if (bookSelect) bookSelect.value = page.id || '';
    document.getElementById('blp_category_select').value = page.category || 'Agriculture';

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
    
    if (hero.cover_image) document.getElementById('blp_preview_cover_img').src = hero.cover_image;
    if (hero.banner_image) document.getElementById('blp_preview_banner_img').src = hero.banner_image;

    // Tracking Toggles
    const fbPixelEnabled = document.getElementById('blp_fb_pixel_enabled');
    if (fbPixelEnabled) fbPixelEnabled.checked = page.facebook_pixel_id !== false && page.facebook_pixel_id !== 'disabled';
    const gaEnabled = document.getElementById('blp_ga_enabled');
    if (gaEnabled) gaEnabled.checked = page.google_analytics_id !== false && page.google_analytics_id !== 'disabled';

    // Suggested Books List
    currentSuggestedBooks = page.suggested_books_list || [];
    if (!currentSuggestedBooks || currentSuggestedBooks.length === 0) {
      const sugs = page.suggested_books || [];
      currentSuggestedBooks = sugs.map(s => {
        if (typeof s === 'object') return s;
        const b = allBooks.find(x => x.id === s);
        return {
          image: b?.cover || b?.thumbnail || '../images/books/kharif-master-guide-2026-cover.webp',
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

    // VIP banner
    document.getElementById('blp_vip_banner_url').value = stack.vip_banner || '';
    document.getElementById('blp_vip_perk_text').value = stack.subscriber_perk || '';

    // Theme Color
    selectedThemePrimary = page.theme_primary || '#2E7D32';
    selectedThemeDark = page.theme_dark || '#1B5E20';
    document.getElementById('blp_custom_theme_color').value = selectedThemePrimary;

    // OG Tags
    document.getElementById('blp_og_title').value = page.og_title || hero.title || '';
    document.getElementById('blp_og_desc').value = page.og_description || hero.description || '';
    document.getElementById('blp_og_image').value = page.og_image || hero.banner_image || '';

    document.getElementById('blp_wa_prompt').value = page.whatsapp_prompt || '';
    document.getElementById('blp_status').value = page.status || 'active';

    currentVideos = page.videos || [];
    currentReviews = page.testimonials || [];
    currentDemoImages = page.demo_images || [];
    currentBonuses = page.bonuses || page.bonus_books || [];
    currentFaqs = page.faqs || [];

    renderVideosInBuilder();
    renderReviewsInBuilder();
    renderDemoImagesInBuilder();
    renderBonusesInBuilder();
    renderFaqsInBuilder();
    renderSuggestedBooksInBuilder();

    builderCard.style.display = 'block';
    builderCard.scrollIntoView({ behavior: 'smooth' });
  };

  window.copyBookLandingUrl = function(bId) {
    const url = `${window.location.origin}/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('📋 बुक लैंडिंग पेज लिंक कॉपी हो गया!', 'success');
    });
  };

  window.deleteBookLandingPage = function(bId) {
    if (!confirm(`क्या आप वाकई बुक लैंडिंग पेज (${bId}) को हटाना चाहते हैं?`)) return;

    allLandingPages = allLandingPages.filter(p => p.id !== bId);
    try {
      localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(allLandingPages));
    } catch (e) {}

    updateKPIs();
    renderTable();
    showToast('🗑️ बुक लैंडिंग पेज हटा दिया गया।', 'info');
  };

  function saveBookLandingPage() {
    const bId = (document.getElementById('blp_input_book_id')?.value || '').trim().toUpperCase();
    const category = document.getElementById('blp_category_select')?.value || 'Agriculture';
    const title = (document.getElementById('blp_hero_title')?.value || '').trim();
    const offerPrice = parseInt(document.getElementById('blp_hero_offer_price')?.value, 10) || 99;
    const coverUrl = (document.getElementById('blp_cover_url')?.value || '').trim();

    if (!bId) { showToast('कृपया Book ID दर्ज करें।', 'error'); return; }
    if (!title) { showToast('कृपया पुस्तक का शीर्षक दर्ज करें।', 'error'); return; }
    if (!coverUrl) { showToast('कृपया बुक कवर इमेज दर्ज/अपलोड करें।', 'error'); return; }

    const mrp = parseInt(document.getElementById('blp_hero_mrp')?.value, 10) || 299;

    const isFbPixelOn = document.getElementById('blp_fb_pixel_enabled')?.checked !== false;
    const isGaOn = document.getElementById('blp_ga_enabled')?.checked !== false;

    const pageData = {
      id: bId,
      slug: bId.toLowerCase(),
      category: category,
      status: document.getElementById('blp_status')?.value || 'active',
      facebook_pixel_id: isFbPixelOn ? '1671873500553134' : 'disabled',
      google_analytics_id: isGaOn ? 'G-DEFAULT' : 'disabled',
      suggested_books_list: currentSuggestedBooks,
      suggested_books: currentSuggestedBooks.map(x => x.link || x.id || x.title).filter(Boolean),
      theme_primary: selectedThemePrimary,
      theme_dark: selectedThemeDark,
      og_title: document.getElementById('blp_og_title')?.value || title,
      og_description: document.getElementById('blp_og_desc')?.value || document.getElementById('blp_hero_desc')?.value,
      og_image: document.getElementById('blp_og_image')?.value || document.getElementById('blp_banner_url')?.value,
      value_stack: {
        book_mrp: parseInt(document.getElementById('blp_stack_book_mrp')?.value, 10) || mrp,
        vip_value: parseInt(document.getElementById('blp_stack_vip_val')?.value, 10) || 1999,
        bonus_value: parseInt(document.getElementById('blp_stack_bonus_val')?.value, 10) || 199,
        offer_price: offerPrice,
        vip_banner: document.getElementById('blp_vip_banner_url')?.value || '',
        subscriber_perk: document.getElementById('blp_vip_perk_text')?.value || '👑 VIP मेंबर्स के लिए 1 वर्ष का Pro सब्सक्रिप्शन 100% मुफ्त शामिल है।'
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
        cover_image: coverUrl,
        banner_image: document.getElementById('blp_banner_url')?.value || '../images/banners/kharif-master-guide-2026-hero-banner.webp',
        features: [
          { icon: 'fa-seedling', text: '150+ रंगीन पेज' },
          { icon: 'fa-camera', text: '300+ फोटो' }
        ]
      },
      videos: currentVideos,
      testimonials: currentReviews,
      demo_images: currentDemoImages.length > 0 ? currentDemoImages : undefined,
      bonuses: currentBonuses,
      bonus_books: currentBonuses,
      faqs: currentFaqs.length > 0 ? currentFaqs : undefined,
      whatsapp_prompt: document.getElementById('blp_wa_prompt')?.value || `नमस्ते, मुझे '${title}' पुस्तक के बारे में और जानकारी चाहिए।`
    };

    const existingIdx = allLandingPages.findIndex(p => p.id === bId);
    if (existingIdx >= 0) allLandingPages[existingIdx] = pageData;
    else allLandingPages.unshift(pageData);

    try {
      localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(allLandingPages));
      
      const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      const bIdx = customBooks.findIndex(x => x.id === bId);
      const newBookObj = {
        id: bId,
        slug: bId.toLowerCase(),
        heading: title,
        name: title,
        category: category,
        language: 'Hindi',
        mrp: mrp,
        offerPrice: offerPrice,
        cover: coverUrl,
        thumbnail: coverUrl,
        banner: pageData.hero.banner_image,
        status: pageData.status,
        landingPage: `/ebooks/book-landing.html?id=${bId}`
      };
      if (bIdx >= 0) customBooks[bIdx] = newBookObj;
      else customBooks.unshift(newBookObj);
      localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(customBooks));
    } catch (e) {}

    showToast(`✅ बुक लैंडिंग पेज (${bId}) सुरक्षित हो गया!`, 'success');
    builderCard.style.display = 'none';
    resetBookBuilder();
    updateKPIs();
    renderTable();
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
