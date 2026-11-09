
function getAutoSyncApiUrl() {
  if (typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')) {
    return 'https://aarogyamindia.online/api/auto-sync-book';
  }
  return '/api/auto-sync-book';
}

async function syncBundlesToAllBackends(bundlesList) {
  const isLocalEditor = typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
  let syncSuccess = false;

  // 1. Direct Local Disk Save (Port 5505) if on localhost
  if (isLocalEditor) {
    try {
      const localRes = await fetch('http://127.0.0.1:5505', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          path: 'data/book-bundles.json',
          content: JSON.stringify(bundlesList, null, 2),
          auto_push: false
        })
      });
      const localData = await localRes.json().catch(() => ({}));
      if (localRes.ok && localData.success) {
        syncSuccess = true;
        console.log('[Book Bundle LocalSync] Saved bundles directly to disk via port 5505');
      }
    } catch (e) {
      console.warn('[Book Bundle LocalSync] Port 5505 fallback to PHP/API:', e);
    }
  }

  // 2. PHP Server Sync (Writes to data/book-bundles.json and commits/pushes to Git)
  try {
    const phpRes = await fetch('/api/save_book_bundles.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_book_bundles',
        bundles: bundlesList
      })
    });
    const phpData = await phpRes.json().catch(() => ({}));
    if (phpRes.ok && phpData.success) {
      syncSuccess = true;
      console.log('[Book Bundle PHP Sync] Saved bundles to server JSON and Git');
    }
  } catch (phpErr) {
    try {
      const phpRes2 = await fetch('/api/save_book_landing.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_book_bundles',
          bundles: bundlesList
        })
      });
      if (phpRes2.ok) syncSuccess = true;
    } catch (_) {}
  }

  // 3. Vercel Auto-Sync API (Production Worldwide Git Commit via GitHub API)
  try {
    const apiUrl = getAutoSyncApiUrl();
    const syncRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_book_bundles',
        bundles: bundlesList
      })
    });
    const syncData = await syncRes.json().catch(() => ({}));
    if (syncRes.ok && syncData.success) {
      syncSuccess = true;
      console.log('[Book Bundle AutoSync] Published bundles to GitHub repo & triggered Vercel deployment');
    }
  } catch (apiErr) {
    console.warn('[Book Bundle AutoSync] API fallback note:', apiErr);
  }

  // 4. Supabase site_configs table sync
  try {
    const db = window.dbClient || window.supabase;
    if (db) {
      await db.from('site_configs').upsert({
        key: 'AAROGYAM_BUNDLE_LANDING_PAGES',
        value: bundlesList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    }
  } catch (err) {
    console.warn("Bundle Supabase sync note:", err);
  }

  return syncSuccess;
}

/* ==========================================================================
   AAROGYAM INDIA — ADMIN MEGA BUNDLE & COMBO LANDING PAGES HUB (V6)
   Features:
   - 100% Dynamic Multi-Book Combo Bundles & Real-Time Price Calculator
   - Top Countdown Timer Ribbon Controls (On/Off, Duration, Text)
   - Dynamic Hero Banner Upload & Live Image Preview
   - Dynamic Expandable KPIs ("➕ नया KPI जोड़ें")
   - AarogyamTube Deep Integration (Select videos directly from library)
   - TTS Sound Replay / Voice Preview in Admin Panel (SpeechSynthesis hi-IN)
   - Dynamic Selected Books Customization (Short Description, Subtitle & Key Points)
   - Inside Sample Pages Selector with Book Page Thumbnails & Custom Uploads
   - Dynamic "Why Buy Combo" Features Editor ("➕ नई विशेषता जोड़ें")
   - Reviews & FAQs with Book Selector Filter & Individual [✕ हटाएं] Buttons
   - OG Image Live Preview & Website Timer Popup Editor with Page Targeting & Live Preview
   - Page Section Manager (Move Up/Down Reordering & ON/OFF Toggles)
   - Final Buy Section KPI & Guarantee Editor
   - In-place updates by ID (Zero duplicates) + LocalStorage & Supabase sync
   ========================================================================== */

import { initAdminLayout, showToast } from './admin-main.js';

let _activeBundlesList = [];
let _catalogBooks = [];
let _allLandingPages = [];
let _aarogyamTubeVideos = [];
let _editingBundleId = null;

// Dynamic sub-collections for current active/editing bundle
let _currentHeroKpis = [
  { icon: "📚", value: "4 संपूर्ण ई-बुक्स", label: "गाइड्स" },
  { icon: "📄", value: "450+ रंगीन पेज", label: "विस्तृत सामग्री" },
  { icon: "🎯", value: "100% वैज्ञानिक गाइड", label: "सटीक समाधान" },
  { icon: "⚡", value: "तुरंत डिजिटल अनलॉकिंग", label: "लाइफटाइम एक्सेस" }
];
let _currentVideos = [];
let _currentReviews = [];
let _currentFaqs = [];
let _currentWhyBuy = [
  { icon: "📚", title: "4 मास्टर गाइड्स एक साथ", desc: "1 किताब के सामान्य मूल्य में पाएं संपूर्ण कृषि समाधान।" },
  { icon: "🎯", title: "सटीक दवा व खाद स्प्रे चार्ट", desc: "दुकानदार के भरोसे नहीं, खुद बनें अपनी फसलों के विशेषज्ञ डॉक्टर।" },
  { icon: "⚡", title: "लाइफटाइम डिजिटल एक्सेस", desc: "पेमेंट होते ही तुरंत अपनी डिजिटल लाइब्रेरी में पढ़ें व ऑफलाइन सेव करें।" },
  { icon: "💰", title: "83% की सीधी महाबचत", desc: "कुल MRP ₹1196 के स्थान पर मात्र ₹199 में पूरा कॉम्बो प्राप्त करें।" }
];
let _currentBookCustomDetails = {};
let _selectedBookIdsOrdered = [];
let _currentDemoImages = [];
let _currentSectionOrder = [
  'sec-top-ribbon',
  'sec-hero',
  'sec-bundle-video',
  'sec-offer-timer',
  'sec-trust-bar',
  'sec-included-books',
  'sec-sample-book',
  'sec-why-bundle',
  'sec-reviews',
  'sec-faqs',
  'sec-final-cta',
  'bundleFloatingAudioPill'
];
let _currentSectionVisibility = {
  'sec-top-ribbon': true,
  'sec-hero': true,
  'sec-bundle-video': true,
  'sec-offer-timer': true,
  'sec-trust-bar': true,
  'sec-included-books': true,
  'sec-sample-book': true,
  'sec-why-bundle': true,
  'sec-reviews': true,
  'sec-faqs': true,
  'sec-final-cta': true,
  'bundleFloatingAudioPill': true
};

const SECTION_METADATA = {
  'sec-top-ribbon': { name: '⚡ 1. टॉप टाइमर रिबन (Top Urgency Ribbon)', icon: '⚡' },
  'sec-hero': { name: '🌟 2. हीरो बैनर व 3D बुक स्टैक (Hero 3D Fan Stack)', icon: '🌟' },
  'sec-bundle-video': { name: '🎥 3. आरोग्यम ट्यूब वीडियो स्लाइडर (Video Carousel)', icon: '🎥' },
  'sec-offer-timer': { name: '⏳ 4. ऑफर काउंटडाउन बार (Countdown Urgency Bar)', icon: '⏳' },
  'sec-trust-bar': { name: '🛡️ 5. ट्रस्ट व गारंटी बैज (Trust & Guarantee Bar)', icon: '🛡️' },
  'sec-included-books': { name: '📚 6. शामिल पुस्तकें व कैलकुलेटर (Books & Savings Stack)', icon: '📚' },
  'sec-sample-book': { name: '📖 7. पुस्तक के अंदर के पृष्ठ (Inside Pages Demo)', icon: '📖' },
  'sec-why-bundle': { name: '✨ 8. कॉम्बो क्यों खरीदें (Why Buy Features)', icon: '✨' },
  'sec-reviews': { name: '⭐ 9. ग्राहक समीक्षाएं (Reviews Section)', icon: '⭐' },
  'sec-faqs': { name: '❓ 10. अक्सर पूछे जाने वाले सवाल (FAQs Section)', icon: '❓' },
  'sec-final-cta': { name: '🎁 11. फाइनल बाय व गारंटी स्टैक (Final Buy CTA)', icon: '🎁' },
  'bundleFloatingAudioPill': { name: '🎙️ 12. फ्लोटिंग ऑडियो नरेशन पिल (Floating Audio)', icon: '🎙️' }
};

export async function renderBookBundlesPage() {
  initAdminLayout('Mega Bundle Hub', 'Create and manage high-converting multi-book combo bundles, live catalog integration, video autoplay, baby browser sheets, tracking pixels, and cross-site popups.');

  const contentArea = document.getElementById('page-content') || document.getElementById('admin-content-area') || document.querySelector('.admin-main-content');
  if (!contentArea) return;

  contentArea.innerHTML = `
    <div class="admin-card" style="padding: 20px; margin-bottom: 24px; background: #0f172a; border: 1.5px solid #10b981; border-radius: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="margin: 0 0 6px 0; color: #fff; font-size: 1.35rem; display: flex; align-items: center; gap: 8px;">
            <span>🎁</span> <span>मेगा कॉम्बो बंडल हब (Multi-Book Combo Landing Pages)</span>
          </h2>
          <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">
            1 के साथ 3 फ्री, त्योहार स्पेशल व 10-बुक्स कॉम्बो लैंडिंग पेज बनाएं। सिंगल चेकआउट से यूजर की लाइब्रेरी में सभी पुस्तकें अलग-अलग अनलॉक होंगी।
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button type="button" id="btnSyncGitBundles" onclick="window.refreshBundlesFromGit()" class="admin-button" style="background: #0284c7; color: #fff; font-weight: 800; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>🔄</span> <span>Git से रीफ़्रेश करें</span>
          </button>
          <button type="button" id="btnOpenCreateBundle" class="admin-button" style="background: #10b981; color: #fff; font-weight: 800; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>➕</span> <span>नया कॉम्बो बंडल बनाएँ</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TABS: 1. Active Bundles List | 2. Bundle Builder Form -->
    <div style="display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 1.5px solid #334155; padding-bottom: 6px;">
      <button type="button" id="tabBtnList" class="admin-tab-btn active" style="background:#1e293b; color:#38bdf8; border:1px solid #38bdf8; padding:8px 16px; border-radius:8px 8px 0 0; font-weight:800; cursor:pointer;">
        📋 सभी सक्रिय बंडल सूची (<span id="bundleCountBadge">0</span>)
      </button>
      <button type="button" id="tabBtnBuilder" class="admin-tab-btn" style="background:transparent; color:#94a3b8; border:none; padding:8px 16px; font-weight:800; cursor:pointer;">
        ✏️ बंडल एडिटर व बिल्डर
      </button>
    </div>

    <!-- VIEW 1: ACTIVE BUNDLES LIST -->
    <div id="bundleListView" style="display: block;">
      <div class="admin-card" style="padding: 0; overflow-x: auto; background: #0f172a; border: 1px solid #334155; border-radius: 12px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem; color: #cbd5e1; text-align: left;">
          <thead>
            <tr style="background: #1e293b; border-bottom: 2px solid #334155;">
              <th style="padding: 12px;">#</th>
              <th style="padding: 12px;">बंडल नाम व ऑफर टाइटल</th>
              <th style="padding: 12px; text-align: center;">शामिल पुस्तकें</th>
              <th style="padding: 12px; text-align: center;">असली MRP</th>
              <th style="padding: 12px; text-align: center;">कॉम्बो ऑफर मूल्य</th>
              <th style="padding: 12px; text-align: center;">पॉपअप / AI</th>
              <th style="padding: 12px; text-align: center;">स्टेटस</th>
              <th style="padding: 12px; text-align: right;">एक्शन</th>
            </tr>
          </thead>
          <tbody id="bundleTableBody">
            <tr>
              <td colspan="8" style="text-align: center; padding: 30px; color: #94a3b8;">लोड हो रहा है...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VIEW 2: DYNAMIC BUNDLE BUILDER FORM -->
    <div id="bundleBuilderView" style="display: none;">
      <form id="bundleBuilderForm" novalidate class="admin-card" style="padding: 24px; background: #0f172a; border: 1.5px solid #38bdf8; border-radius: 14px;">
        
        <!-- SECTION 1: BASIC INFO & HERO BANNER WITH LIVE PREVIEW -->
        <h3 style="color:#38bdf8; margin:0 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; gap:8px;">
          <span>1️⃣</span> <span>ऑफर पहचान व हीरो बैनर (Basic & Hero Settings)</span>
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; margin-bottom:20px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">बंडल ID (Unique):</label>
            <input type="text" id="bFormId" class="admin-input" placeholder="e.g. BUNDLE_KISAN_4IN1" required style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">URL स्लग (Slug):</label>
            <input type="text" id="bFormSlug" class="admin-input" placeholder="e.g. kisan-master-bundle" required style="width:100%; box-sizing:border-box;" />
            <small style="color:#94a3b8; font-size:0.75rem;">लाइव लिंक: /bundle.html?slug=kisan-master-bundle</small>
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">मुख्य टाइटल (Heading):</label>
            <input type="text" id="bFormTitle" class="admin-input" placeholder="e.g. महाबचत 4-इन-1 किसान मास्टर बंडल" required style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">सब-टाइटल / टैगलाइन:</label>
            <input type="text" id="bFormSubtitle" class="admin-input" placeholder="e.g. धान, सोयाबीन, मक्का व संपूर्ण फसल डॉक्टर मास्टर गाइड्स!" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">ऑफर बैज (Badge Text):</label>
            <input type="text" id="bFormBadge" class="admin-input" placeholder="e.g. त्योहार स्पेशल / 83% की महाबचत" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">खरीदें बटन टेक्स्ट (CTA Text):</label>
            <input type="text" id="bFormBuyBtnText" class="admin-input" placeholder="🛒 पूरा कॉम्बो ₹199 में अभी खरीदें" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:800; color:#ec4899; margin-bottom:5px;">🎯 ऐड मोड लीड गेटवे (Ads Mode):</label>
            <select id="bFormAdsModeEnabled" class="admin-select" style="width:100%; box-sizing:border-box; padding:8px 10px; font-weight:800; border:1.5px solid #ec4899; background:#0f172a; color:#ec4899;">
              <option value="false">⚪ सामान्य मोड (Direct Landing Page)</option>
              <option value="true">🎯 ऐड मोड चालू (Front Squeeze Card Active)</option>
            </select>
          </div>
          <div style="grid-column: 1 / -1;">
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">बंडल विस्तृत विवरण (Full Description):</label>
            <textarea id="bFormDescription" class="admin-input" rows="2" style="width:100%; box-sizing:border-box;" placeholder="बीज उपचार से लेकर कटाई तक सम्पूर्ण वैज्ञानिक एवं Practical समाधान।"></textarea>
          </div>
          
          <!-- HERO BACKGROUND BANNER & LIVE PREVIEW -->
          <div style="grid-column: 1 / -1; background:#020617; border:1px solid #334155; border-radius:10px; padding:14px;">
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">
              🌄 पीछे का हीरो बैनर (Hero Background Banner Image):
            </label>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
              <input type="text" id="bFormBannerImage" class="admin-input" placeholder="/images/banners/farmer-community-banner.jpeg" style="flex:1; min-width:260px;" />
              <label class="admin-button" style="background:#0284c7; color:#fff; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:700; margin:0;">
                📁 फोटो अपलोड (WebP)
                <input type="file" id="fileUploadBanner" accept="image/*" style="display:none;" />
              </label>
            </div>
            <!-- Live Preview -->
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:120px; height:68px; border-radius:6px; background:#0f172a; border:1px solid #334155; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                <img id="bannerLivePreview" src="/images/banners/farmer-community-banner.jpeg" alt="Banner Preview" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/farmer-community-banner.jpeg';" />
              </div>
              <span style="font-size:0.75rem; color:#94a3b8;">लाइव बैनर प्रीव्यू (यह इमेज हीरो सेक्शन के पीछे ब्लर/डार्क होकर प्रदर्शित होगी)</span>
            </div>
          </div>
        </div>

        <!-- SECTION 1B: TOP COUNTDOWN TIMER RIBBON CONTROLS (NEW TAB/SECTION) -->
        <h3 style="color:#f43f5e; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; gap:8px;">
          <span>⚡</span> <span>टॉप टाइमर रिबन सेटिंग्स (Top Countdown Urgency Ribbon)</span>
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; margin-bottom:20px; background:#1e293b; padding:16px; border-radius:12px;">
          <div>
            <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:700; color:#fff;">
              <span>⚡ टाइमर रिबन चालू / बंद:</span>
              <input type="checkbox" id="bFormTimerEnabled" checked style="width:20px; height:20px; accent-color:#f43f5e;" />
            </label>
            <p style="font-size:0.75rem; color:#94a3b8; margin:4px 0 0 0;">पेज के सबसे ऊपर लाल रंग की इमरजेंसी रिबन दिखेगी।</p>
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">रिबन मैसेज / बैज टेक्स्ट:</label>
            <input type="text" id="bFormTimerBadge" class="admin-input" value="⚡ महाबचत कॉम्बो ऑफर: यह स्पेशल डिस्काउंट केवल अगले:" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">काउंटडाउन अवधि (मिनटों में):</label>
            <input type="number" id="bFormTimerMinutes" class="admin-input" value="15" style="width:100%; box-sizing:border-box;" />
          </div>
        </div>

        <!-- SECTION 2: LIVE CATALOG BOOKS SELECTOR & CUSTOMIZER -->
        <h3 style="color:#fbbf24; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>2️⃣</span> <span>बंडल में शामिल पुस्तकें (Live Catalog Book Selector)</span>
          </div>
          <span style="font-size:0.8rem; color:#94a3b8;">चुनी गई पुस्तकें: <strong id="selectedBooksCountBadge" style="color:#fbbf24;">0</strong></span>
        </h3>
        <p style="font-size:0.82rem; color:#94a3b8; margin-top:-10px; margin-bottom:12px;">
          लाइव कैटलॉग से वे पुस्तकें चुनें जो इस कॉम्बो में मिलेंगी। टिक करते ही नीचे प्रत्येक पुस्तक का सब-टाइटल, शॉर्ट डिस्क्रिप्शन व मुख्य बिंदु कस्टमाइज़ करने का विकल्प आएगा:
        </p>

        <div id="bFormBooksGrid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-bottom:20px; max-height:350px; overflow-y:auto; padding:8px; background:#020617; border:1px solid #334155; border-radius:10px;">
          <!-- Populated from live catalog books -->
        </div>

        <!-- DYNAMIC SELECTED BOOKS CUSTOMIZATION CARDS WITH SHORT DESCRIPTION -->
        <div id="selectedBooksCustomizerContainer" style="margin-bottom:24px;">
          <h4 style="color:#cbd5e1; font-size:0.9rem; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span>📝</span> <span>चुनी गई पुस्तकों का सब-टाइटल, शॉर्ट डिस्क्रिप्शन व मुख्य बिंदु (Book Custom Details)</span>
          </h4>
          <div id="selectedBooksCustomizerList" style="display:flex; flex-direction:column; gap:12px;">
            <!-- Populated dynamically when checkboxes are toggled -->
          </div>
        </div>

        <!-- SECTION 3: PRICING & DYNAMIC EXPANDABLE KPIS -->
        <h3 style="color:#4ade80; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>3️⃣</span> <span>मूल्य निर्धारण व डायनामिक KPI बैज (Pricing & Dynamic KPIs)</span>
          </div>
          <button type="button" id="btnAddKpiBtn" class="admin-button small-button" style="background:#16a34a; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">
            ➕ नया KPI जोड़ें (Add KPI)
          </button>
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:16px; background:#1e293b; padding:16px; border-radius:12px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">कुल असली MRP (Auto-Calculated):</label>
            <input type="number" id="bFormMrp" class="admin-input" readonly style="width:100%; background:#0f172a; color:#94a3b8; font-weight:800;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:800; color:#34d399; margin-bottom:5px;">🔥 फाइनल कॉम्बो ऑफर मूल्य (₹):</label>
            <input type="number" id="bFormOfferPrice" class="admin-input" placeholder="e.g. 199" required style="width:100%; border:2px solid #10b981; font-weight:900; font-size:1.1rem; color:#10b981;" />
          </div>
          <div style="display:flex; flex-direction:column; justify-content:center;">
            <div style="font-size:0.8rem; color:#94a3b8;">ग्राहक की कुल बचत:</div>
            <div id="bFormSavingsPreview" style="font-size:1.2rem; font-weight:900; color:#fbbf24;">₹0 (0% OFF)</div>
          </div>
        </div>

        <!-- DYNAMIC EXPANDABLE KPIS LIST -->
        <div style="margin-bottom:20px;">
          <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:8px;">हीरो सेक्शन के मुख्य KPI बैज (Dynamic KPI Badges):</label>
          <div id="heroKpisContainer" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px;">
            <!-- Rendered from _currentHeroKpis -->
          </div>
        </div>

        <!-- SECTION 4: AAROGYAMTUBE MULTI-VIDEO CAROUSEL & DEEP INTEGRATION -->
        <h3 style="color:#ec4899; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>4️⃣</span> <span>आरोग्यम ट्यूब व मल्टी-वीडियो स्लाइडर (AarogyamTube Video Carousel)</span>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" id="btnPickAarogyamTubeVideo" class="admin-button small-button" style="background:#0284c7; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">
              📺 आरोग्यम ट्यूब से चुनें
            </button>
            <button type="button" id="btnAddVideoBtn" class="admin-button small-button" style="background:#ec4899; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">
              ➕ वीडियो जोड़ें (Add Video)
            </button>
          </div>
        </h3>

        <div style="background:#1e293b; padding:12px; border-radius:10px; margin-bottom:14px; border:1px solid #334155;">
          <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:700; color:#fff;">
            <span>🎬 पहला वीडियो स्वतः चलाएं (Video Auto-Play):</span>
            <input type="checkbox" id="bFormVideoAutoPlay" style="width:20px; height:20px; accent-color:#10b981;" />
          </label>
          <p style="font-size:0.75rem; color:#94a3b8; margin:4px 0 0 0;">चालू होने पर पहला वीडियो म्यूट होकर स्वतः शुरू होगा।</p>
        </div>

        <div id="bundleVideosList" style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          <!-- Populated from _currentVideos -->
        </div>

        <!-- SECTION 5: AUDIO NARRATION & HINDI SCRIPT WITH VOICE PLAYBACK REPLAY -->
        <h3 style="color:#38bdf8; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>5️⃣</span> <span>ऑडियो नरेशन सिस्टम व वॉइस टेस्ट (Audio Narration & TTS Preview)</span>
          </div>
          <button type="button" id="btnAutoGenerateAudioScript" class="admin-button small-button" style="background:#0284c7; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">
            ✨ चुनी गई किताबों से ऑडियो स्क्रिप्ट स्वतः बनाएं
          </button>
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; margin-bottom:16px;">
          <div style="background:#1e293b; padding:12px; border-radius:10px; border:1px solid #334155;">
            <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:700; color:#fff;">
              <span>🎙️ ऑडियो नरेशन ऑटो-प्ले (Audio Auto-Play):</span>
              <input type="checkbox" id="bFormAudioAutoPlay" checked style="width:20px; height:20px; accent-color:#38bdf8;" />
            </label>
            <p style="font-size:0.75rem; color:#94a3b8; margin:4px 0 0 0;">🛡️ स्मार्ट गार्ड: यदि वीडियो ऑटो-प्ले ऑन है तो ऑडियो स्वतः शांत रहेगा।</p>
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">वैकल्पिक MP3 ऑडियो फ़ाइल लिंक (Optional Audio URL):</label>
            <input type="text" id="bFormAudioUrl" class="admin-input" placeholder="/audio/books/combo-narration.mp3" style="width:100%;" />
            <small style="color:#94a3b8; font-size:0.75rem;">यदि MP3 नहीं है तो नीचे लिखी हिंदी स्क्रिप्ट स्वतः उच्चारित होगी।</small>
          </div>
          <div style="grid-column:1 / -1;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label style="font-size:0.82rem; font-weight:700; color:#cbd5e1;">हिंदी ऑडियो नरेशन स्क्रिप्ट (Hindi Narration Script):</label>
              <div style="display:flex; gap:8px;">
                <button type="button" id="btnTestPlayTts" class="admin-button small-button" style="background:#10b981; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-weight:800; cursor:pointer;">
                  ▶️ टेस्ट ऑडियो सुनें
                </button>
                <button type="button" id="btnStopTts" class="admin-button small-button" style="background:#ef4444; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-weight:800; cursor:pointer;">
                  ⏹️ रोकें
                </button>
              </div>
            </div>
            <textarea id="bFormAudioScript" class="admin-input" rows="3" style="width:100%; box-sizing:border-box;" placeholder="नमस्ते किसान भाइयों! आरोग्यम इंडिया लाया है आपके लिए महाबचत कॉम्बो बंडल..."></textarea>
            <div id="ttsAudioStatusBadge" style="font-size:0.75rem; color:#94a3b8; margin-top:4px;"></div>
          </div>
        </div>

        <!-- SECTION 6: INSIDE SAMPLE PAGES GALLERY WITH BOOK IMAGES PICKER -->
        <h3 style="color:#f59e0b; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>6️⃣</span> <span>पुस्तक के अंदर के पृष्ठ / डेमो गैलरी (Inside Pages Demo Gallery)</span>
          </div>
          <button type="button" id="btnAutoImportDemoImages" class="admin-button small-button" style="background:#10b981; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">
            ⚡ चुनी गई किताबों से 2-2 डेमो पेज स्वतः लोड करें
          </button>
        </h3>

        <!-- Active Demo Images Thumbnails Strip with Delete Buttons -->
        <div style="background:#020617; border:1px solid #334155; border-radius:10px; padding:12px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <label style="font-size:0.8rem; font-weight:700; color:#cbd5e1;">सक्रिय डेमो पृष्ठ (<span id="activeDemoCountBadge">0</span>):</label>
            <small style="color:#94a3b8; font-size:0.75rem;">(उपयोगकर्ता इन्हें पिंच-ज़ूम व लेफ्ट-राइट स्वाइप करके देख सकेंगे)</small>
          </div>
          <div id="demoThumbnailsStrip" style="display:flex; gap:10px; overflow-x:auto; padding:6px 0;">
            <!-- Rendered from _currentDemoImages -->
          </div>
        </div>

        <!-- Add Custom Demo Image URL + Upload -->
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:20px;">
          <input type="text" id="bFormAddDemoUrl" class="admin-input" placeholder="नया डेमो इमेज URL दर्ज करें..." style="flex:1; min-width:260px;" />
          <label class="admin-button" style="background:#334155; color:#fff; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem; margin:0;">
            📁 अपलोड (WebP)
            <input type="file" id="fileUploadDemoPage" accept="image/*" style="display:none;" />
          </label>
          <button type="button" id="btnAddDemoImageBtn" class="admin-button" style="background:#10b981; color:#fff; padding:8px 16px; border-radius:6px; font-weight:800; border:none; cursor:pointer;">
            ➕ इमेज जोड़ें
          </button>
        </div>

        <!-- SECTION 7: WHY BUY COMBO FEATURES (DYNAMIC ADD/REMOVE) -->
        <h3 style="color:#a855f7; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>7️⃣</span> <span>"कॉम्बो क्यों खरीदें" मुख्य विशेषताएं (Why Buy Combo Features)</span>
          </div>
          <button type="button" id="btnAddWhyBuyBtn" class="admin-button small-button" style="background:#a855f7; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">
            ➕ नई विशेषता जोड़ें (Add Feature)
          </button>
        </h3>

        <div id="whyBuyFeaturesContainer" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px; margin-bottom:20px;">
          <!-- Feature cards rendered from _currentWhyBuy -->
        </div>

        <!-- SECTION 8: REVIEWS & FAQS WITH BOOK SELECTOR FILTER -->
        <h3 style="color:#10b981; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>8️⃣</span> <span>ग्राहक समीक्षाएं व अक्सर पूछे जाने वाले सवाल (Reviews & FAQs)</span>
          </div>
        </h3>

        <!-- REVIEWS MANAGER -->
        <div style="background:#1e293b; padding:14px; border-radius:10px; margin-bottom:16px; border:1px solid #334155;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
            <label style="font-size:0.86rem; font-weight:700; color:#cbd5e1;">⭐ ग्राहक समीक्षाएं (Reviews List):</label>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <select id="selBookForReviewImport" class="admin-select" style="font-size:0.78rem; padding:4px 8px;">
                <option value="ALL">सभी चुनी गई पुस्तकें (All Books)</option>
              </select>
              <button type="button" id="btnImportReviews" class="admin-button small-button" style="background:#059669; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                📥 Reviews लोड करें
              </button>
              <button type="button" id="btnAddReviewBtn" class="admin-button small-button" style="background:#334155; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:0.75rem; cursor:pointer;">
                ➕ नया Review जोड़ें
              </button>
            </div>
          </div>
          <div id="bundleReviewsContainer" style="display:flex; flex-direction:column; gap:8px;">
            <!-- Populated from _currentReviews -->
          </div>
        </div>

        <!-- FAQS MANAGER -->
        <div style="background:#1e293b; padding:14px; border-radius:10px; margin-bottom:20px; border:1px solid #334155;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
            <label style="font-size:0.86rem; font-weight:700; color:#cbd5e1;">❓ अक्सर पूछे जाने वाले सवाल (FAQs List):</label>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <select id="selBookForFaqImport" class="admin-select" style="font-size:0.78rem; padding:4px 8px;">
                <option value="ALL">सभी चुनी गई पुस्तकें (All Books)</option>
              </select>
              <button type="button" id="btnImportFaqs" class="admin-button small-button" style="background:#0284c7; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                📥 FAQs लोड करें
              </button>
              <button type="button" id="btnAddFaqBtn" class="admin-button small-button" style="background:#334155; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:0.75rem; cursor:pointer;">
                ➕ नया FAQ जोड़ें
              </button>
            </div>
          </div>
          <div id="bundleFaqsContainer" style="display:flex; flex-direction:column; gap:8px;">
            <!-- Populated from _currentFaqs -->
          </div>
        </div>

        <!-- SECTION 9: SOCIAL OG PREVIEW & WEBSITE TIMER POPUP WITH PAGE TARGETING -->
        <h3 style="color:#fb7185; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; gap:8px;">
          <span>9️⃣</span> <span>सोशल शेयरिंग (OG Tags), पिक्सेल व वेबसाइट टाइमर पॉपअप (Marketing & Popups)</span>
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; margin-bottom:20px;">
          
          <!-- Social OG Image & Preview -->
          <div style="background:#020617; border:1px solid #334155; border-radius:10px; padding:12px;">
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">सोशल शेयरिंग इमेज (OG WebP Image):</label>
            <div style="display:flex; gap:6px; margin-bottom:8px;">
              <input type="text" id="bFormOgImage" class="admin-input" placeholder="/images/banners/farmer-community-banner.jpeg" style="flex:1;" />
              <label class="admin-button" style="background:#334155; color:#fff; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem; margin:0;">
                📁
                <input type="file" id="fileUploadOg" accept="image/*" style="display:none;" />
              </label>
            </div>
            <!-- Live Preview -->
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:100px; height:56px; border-radius:6px; background:#0f172a; border:1px solid #334155; overflow:hidden;">
                <img id="ogLivePreview" src="/images/banners/farmer-community-banner.jpeg" alt="OG Preview" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/farmer-community-banner.jpeg';" />
              </div>
              <span style="font-size:0.75rem; color:#94a3b8;">व्हाट्सऐप / फेसबुक पर शेयर करते समय यह फोटो दिखेगी।</span>
            </div>
          </div>

          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">सोशल टाइटल (OG Title):</label>
            <input type="text" id="bFormOgTitle" class="admin-input" placeholder="धमाका कॉम्बो: 1 किताब की कीमत में 4 मास्टर गाइड्स!" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">SEO कीवर्ड्स (Meta Keywords):</label>
            <input type="text" id="bFormSeoKeywords" class="admin-input" placeholder="Agriculture eBook Bundle, Farming Combo, Aarogyam India" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">फेसबुक मेटा पिक्सेल ID (Meta Pixel):</label>
            <input type="text" id="bFormPixelId" class="admin-input" value="1671873500553134" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">गूगल एनालिटिक्स ID (GA4):</label>
            <input type="text" id="bFormGaId" class="admin-input" placeholder="G-2BWPJVQWPK" style="width:100%; box-sizing:border-box;" />
          </div>
          <div style="grid-column: 1 / -1;">
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">व्हाट्सऐप वायरल शेयर मैसेज (WhatsApp Viral Text):</label>
            <textarea id="bFormWaText" class="admin-input" rows="2" style="width:100%; box-sizing:border-box;" placeholder="🌾 *AAROGYAM INDIA — महाबचत 4-इन-1 कॉम्बो बंडल* 📚\n💰 कुल MRP: ~₹1196~ | आज का विशेष कॉम्बो ऑफर: मात्र *₹199*!\n👇 बंडल अनलॉक करें: {LINK}"></textarea>
            <small style="color:#94a3b8; font-size:0.75rem;">नोट: {LINK} की जगह उपयोगकर्ता का व्यक्तिगत शेयर लिंक स्वतः लग जाएगा।</small>
          </div>
        </div>

        <!-- WEBSITE TIMER POPUP WITH PAGE TARGETING & LIVE PREVIEW -->
        <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:16px; margin-bottom:24px;">
          <h4 style="color:#38bdf8; font-size:0.92rem; margin:0 0 12px 0; display:flex; align-items:center; gap:6px;">
            <span>🚀</span> <span>वेबसाइट टाइमर पॉपअप सेटिंग्स व पेज टारगेटिंग (Cross-Site Popup Controls)</span>
          </h4>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px; margin-bottom:14px;">
            <div>
              <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:700; color:#fff;">
                <span>🚀 टाइमर पॉपअप चालू / बंद:</span>
                <input type="checkbox" id="bFormPopupEnabled" checked style="width:20px; height:20px; accent-color:#10b981;" />
              </label>
              <div style="margin-top:8px;">
                <span style="font-size:0.78rem; color:#cbd5e1;">पॉपअप आने में देरी (सेकंड):</span>
                <input type="number" id="bFormPopupDelay" class="admin-input" value="15" style="width:80px; padding:4px 8px; margin-left:8px;" />
              </div>
            </div>
            <div>
              <label style="display:block; font-size:0.78rem; font-weight:700; color:#cbd5e1; margin-bottom:4px;">पॉपअप शीर्षक (Title):</label>
              <input type="text" id="bFormPopupTitle" class="admin-input" placeholder="🌾 महाबचत 4-इन-1 किसान कॉम्बो ऑफर!" style="width:100%;" />
            </div>
            <div>
              <label style="display:block; font-size:0.78rem; font-weight:700; color:#cbd5e1; margin-bottom:4px;">पॉपअप विवरण (Subtitle):</label>
              <input type="text" id="bFormPopupSubtitle" class="admin-input" placeholder="4 संपूर्ण मास्टर गाइड्स एक साथ 83% की छूट पर!" style="width:100%;" />
            </div>
            <div>
              <label style="display:block; font-size:0.78rem; font-weight:700; color:#cbd5e1; margin-bottom:4px;">पॉपअप बटन टेक्स्ट (CTA):</label>
              <input type="text" id="bFormPopupCtaText" class="admin-input" placeholder="🛒 पूरा कॉम्बो ₹199 में अनलॉक करें" style="width:100%;" />
            </div>
          </div>

          <!-- Page Targeting Checkboxes -->
          <div style="margin-bottom:14px; background:#020617; padding:12px; border-radius:8px; border:1px solid #334155;">
            <label style="display:block; font-size:0.8rem; font-weight:700; color:#fbbf24; margin-bottom:6px;">
              🎯 कहाँ-कहाँ यह पॉपअप दिखाई दे? (Select Pages where popup appears):
            </label>
            <div style="display:flex; gap:14px; flex-wrap:wrap; font-size:0.8rem; color:#cbd5e1;">
              <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                <input type="checkbox" name="popupTargets" value="home" checked style="accent-color:#10b981;" />
                <span>मुख्य होमपेज (index.html)</span>
              </label>
              <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                <input type="checkbox" name="popupTargets" value="library" checked style="accent-color:#10b981;" />
                <span>ई-बुक लाइब्रेरी व कैटलॉग (my-library.html)</span>
              </label>
              <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                <input type="checkbox" name="popupTargets" value="books" checked style="accent-color:#10b981;" />
                <span>एकल पुस्तक लैंडिंग पेज (book-landing.html)</span>
              </label>
              <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                <input type="checkbox" name="popupTargets" value="tube" checked style="accent-color:#10b981;" />
                <span>आरोग्यम ट्यूब (tube.html)</span>
              </label>
              <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                <input type="checkbox" name="popupTargets" value="health" checked style="accent-color:#10b981;" />
                <span>स्वास्थ्य व वेलनेस पेज (health)</span>
              </label>
            </div>
          </div>

          <!-- Live Popup Preview Card -->
          <div style="border-top:1px solid #334155; padding-top:12px;">
            <span style="font-size:0.75rem; color:#94a3b8; display:block; margin-bottom:6px;">👀 लाइव पॉपअप प्रीव्यू (उपयोगकर्ता के स्क्रीन के कोने में ऐसा दिखेगा):</span>
            <div id="popupLivePreviewBox" style="max-width:320px; background:linear-gradient(145deg, #0f172a, #1e293b); border:1.5px solid #10b981; border-radius:12px; padding:12px; color:#fff; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span style="background:rgba(245,158,11,0.2); color:#fbbf24; font-size:0.68rem; font-weight:800; padding:2px 6px; border-radius:4px; border:1px solid #f59e0b;">🎁 विशेष कॉम्बो ऑफर</span>
                <span style="color:#94a3b8; font-size:0.8rem;">✕</span>
              </div>
              <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
                <img id="popupLiveThumb" src="/images/books/kharif-master-guide-2026-cover.webp" alt="Thumb" style="width:40px; height:54px; border-radius:4px; object-fit:cover;" />
                <div>
                  <div id="popupLiveTitle" style="font-size:0.8rem; font-weight:800;">महाबचत 4-इन-1 किसान कॉम्बो</div>
                  <div id="popupLiveSubtitle" style="font-size:0.7rem; color:#94a3b8;">4 मास्टर गाइड्स सिर्फ ₹199 में</div>
                </div>
              </div>
              <div id="popupLiveBtn" style="background:#10b981; color:#fff; font-size:0.75rem; font-weight:800; padding:6px; border-radius:6px; text-align:center;">🛒 पूरा कॉम्बो ₹199 में अनलॉक करें →</div>
            </div>
          </div>
        </div>

        <!-- SECTION 10: PAGE SECTIONS ORDER (MOVE UP/DOWN) & ON/OFF TOGGLES -->
        <h3 style="color:#06b6d4; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>🔟</span> <span>पेज लेआउट व सेक्शन कंट्रोल (Section Order & On/Off Toggles)</span>
          </div>
          <span style="font-size:0.78rem; color:#94a3b8;">⬆️ / ⬇️ बटन से क्रम बदलें या अनचाहे सेक्शन बंद करें</span>
        </h3>

        <div id="pageSectionsControlList" style="display:flex; flex-direction:column; gap:8px; margin-bottom:24px; background:#020617; padding:12px; border-radius:10px; border:1px solid #334155;">
          <!-- Rendered dynamically from _currentSectionOrder & _currentSectionVisibility -->
        </div>

        <!-- SECTION 11: FINAL BUY & GUARANTEE CTA SECTION -->
        <h3 style="color:#eab308; margin:24px 0 16px 0; border-bottom:1px solid #334155; padding-bottom:8px; display:flex; align-items:center; gap:8px;">
          <span>1️⃣1️⃣</span> <span>फाइनल बाय व गारंटी सेक्शन (Final Buy CTA & Guarantees)</span>
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; margin-bottom:24px; background:#1e293b; padding:16px; border-radius:12px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">फाइनल बाय मुख्य शीर्षक (Heading):</label>
            <input type="text" id="bFormFinalHeading" class="admin-input" placeholder="अपनी संपूर्ण कृषि डिजिटल लाइब्रेरी अभी शुरू करें!" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">फाइनल विवरण (Subtitle):</label>
            <input type="text" id="bFormFinalDesc" class="admin-input" placeholder="सीमित समय का विशेष कॉम्बो ऑफर उपलब्ध है। अभी सभी मास्टर गाइड्स प्राप्त करें।" style="width:100%; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:5px;">फाइनल बाय बटन टेक्स्ट (Button CTA):</label>
            <input type="text" id="bFormFinalBuyBtnText" class="admin-input" placeholder="🛒 पूरा कॉम्बो ₹199 में अभी खरीदें" style="width:100%; box-sizing:border-box;" />
          </div>
        </div>

        <!-- FORM ACTION BUTTONS -->
        <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid #334155; padding-top:16px;">
          <button type="button" id="btnCancelBuilder" class="admin-button" style="background:#334155; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
            रद्द करें
          </button>
          <button type="submit" id="btnSaveBundle" class="admin-button" style="background:#10b981; color:#fff; font-weight:800; border:none; padding:10px 24px; border-radius:8px; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.4);">
            💾 बंडल ऑफर सुरक्षित करें (Publish Bundle)
          </button>
        </div>

      </form>
    </div>

    <!-- MODAL: AAROGYAMTUBE VIDEO PICKER -->
    <div id="aarogyamTubePickerModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:1000000; align-items:center; justify-content:center; padding:16px;">
      <div style="background:#0f172a; border:2px solid #0284c7; border-radius:14px; max-width:720px; width:100%; max-height:85vh; display:flex; flex-direction:column; overflow:hidden;">
        <div style="padding:14px 18px; background:#1e293b; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:1.1rem; color:#fff; display:flex; align-items:center; gap:8px;">
            <span>📺</span> <span>आरोग्यम ट्यूब वीडियो लाइब्रेरी से चुनें</span>
          </h3>
          <button type="button" id="btnCloseTubePicker" style="background:transparent; border:none; color:#94a3b8; font-size:1.3rem; cursor:pointer;">✕</button>
        </div>
        <div style="padding:12px 18px; border-bottom:1px solid #334155;">
          <input type="text" id="tubePickerSearch" class="admin-input" placeholder="🔍 वीडियो शीर्षक या विषय से खोजें..." style="width:100%; box-sizing:border-box;" />
        </div>
        <div id="tubePickerGrid" style="padding:16px; overflow-y:auto; flex:1; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <!-- Loaded from recordings -->
        </div>
      </div>
    </div>
  `;

  // Bind Events & Load Catalogs
  bindBundleHubEvents();
  await loadAndRenderBundles();
}

// --- EVENT BINDINGS & CONTROLLER ---
function bindBundleHubEvents() {
  const tabBtnList = document.getElementById('tabBtnList');
  const tabBtnBuilder = document.getElementById('tabBtnBuilder');
  const listView = document.getElementById('bundleListView');
  const builderView = document.getElementById('bundleBuilderView');
  const btnOpenCreate = document.getElementById('btnOpenCreateBundle');
  const btnCancel = document.getElementById('btnCancelBuilder');
  const form = document.getElementById('bundleBuilderForm');
  const offerPriceInput = document.getElementById('bFormOfferPrice');

  function showList() {
    if (tabBtnList) {
      tabBtnList.style.background = '#1e293b';
      tabBtnList.style.color = '#38bdf8';
      tabBtnList.style.border = '1px solid #38bdf8';
    }
    if (tabBtnBuilder) {
      tabBtnBuilder.style.background = 'transparent';
      tabBtnBuilder.style.color = '#94a3b8';
      tabBtnBuilder.style.border = 'none';
      tabBtnBuilder.textContent = '✏️ बंडल एडिटर व बिल्डर';
    }
    if (listView) listView.style.display = 'block';
    if (builderView) builderView.style.display = 'none';
    _editingBundleId = null;
  }

  function showBuilder(isEdit = false) {
    if (tabBtnBuilder) {
      tabBtnBuilder.style.background = '#1e293b';
      tabBtnBuilder.style.color = '#38bdf8';
      tabBtnBuilder.style.border = '1px solid #38bdf8';
      tabBtnBuilder.textContent = isEdit ? '✏️ बंडल संपादित करें' : '➕ नया बंडल बनाएँ';
    }
    if (tabBtnList) {
      tabBtnList.style.background = 'transparent';
      tabBtnList.style.color = '#94a3b8';
      tabBtnList.style.border = 'none';
    }
    if (listView) listView.style.display = 'none';
    if (builderView) builderView.style.display = 'block';
  }

  window.showBundleBuilder = showBuilder;
  window.showBundleList = showList;

  tabBtnList?.addEventListener('click', showList);
  tabBtnBuilder?.addEventListener('click', () => showBuilder(Boolean(_editingBundleId)));
  btnCancel?.addEventListener('click', showList);

  btnOpenCreate?.addEventListener('click', () => {
    resetBundleForm();
    showBuilder(false);
  });

  offerPriceInput?.addEventListener('input', calculateSavingsPreview);

  // Live Banner Preview on typing
  document.getElementById('bFormBannerImage')?.addEventListener('input', (e) => {
    const preview = document.getElementById('bannerLivePreview');
    if (preview) preview.src = e.target.value || '/images/banners/farmer-community-banner.jpeg';
  });

  // Live OG Image Preview on typing
  document.getElementById('bFormOgImage')?.addEventListener('input', (e) => {
    const preview = document.getElementById('ogLivePreview');
    if (preview) preview.src = e.target.value || '/images/banners/farmer-community-banner.jpeg';
  });

  // Dynamic KPI Management
  document.getElementById('btnAddKpiBtn')?.addEventListener('click', () => {
    _currentHeroKpis.push({ icon: "⚡", value: "नया विशेष लाभ", label: "विवरण" });
    renderHeroKpisList();
  });

  // Video Management
  document.getElementById('btnAddVideoBtn')?.addEventListener('click', () => {
    _currentVideos.push({ url: "", title: "", subtitle: "" });
    renderVideosList();
  });

  // AarogyamTube Video Picker
  document.getElementById('btnPickAarogyamTubeVideo')?.addEventListener('click', openAarogyamTubePicker);
  document.getElementById('btnCloseTubePicker')?.addEventListener('click', closeAarogyamTubePicker);
  document.getElementById('tubePickerSearch')?.addEventListener('input', filterAarogyamTubeVideos);

  // TTS Speech Preview in Admin
  document.getElementById('btnTestPlayTts')?.addEventListener('click', playAdminTtsVoice);
  document.getElementById('btnStopTts')?.addEventListener('click', stopAdminTtsVoice);
  document.getElementById('btnAutoGenerateAudioScript')?.addEventListener('click', generateHindiAudioScript);

  // Inside Demo Pages Gallery Management
  document.getElementById('btnAutoImportDemoImages')?.addEventListener('click', autoImportDemoImages);
  document.getElementById('btnAddDemoImageBtn')?.addEventListener('click', addCustomDemoImage);

  // File Upload Handlers (WebP Compression)
  document.getElementById('fileUploadBanner')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUri = await compressImageToWebp(file, 900, 0.75);
      const input = document.getElementById('bFormBannerImage');
      const prev = document.getElementById('bannerLivePreview');
      if (input) input.value = dataUri;
      if (prev) prev.src = dataUri;
      showToast('बैनर इमेज सफलतापूर्वक लोड हुई!', 'success');
    }
  });

  document.getElementById('fileUploadOg')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUri = await compressImageToWebp(file, 900, 0.75);
      const input = document.getElementById('bFormOgImage');
      const prev = document.getElementById('ogLivePreview');
      if (input) input.value = dataUri;
      if (prev) prev.src = dataUri;
      showToast('OG इमेज सफलतापूर्वक लोड हुई!', 'success');
    }
  });

  document.getElementById('fileUploadDemoPage')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUri = await compressImageToWebp(file, 800, 0.75);
      const input = document.getElementById('bFormAddDemoUrl');
      if (input) input.value = dataUri;
      showToast('डेमो पेज फोटो तैयार! "इमेज जोड़ें" दबाएं।', 'info');
    }
  });

  // Dynamic Why Buy Features
  document.getElementById('btnAddWhyBuyBtn')?.addEventListener('click', () => {
    _currentWhyBuy.push({ icon: "🎯", title: "नई मुख्य विशेषता", desc: "इसका विस्तृत विवरण यहाँ दर्ज करें।" });
    renderWhyBuyFeatures();
  });

  // Reviews & FAQ Management
  document.getElementById('btnAddReviewBtn')?.addEventListener('click', () => {
    _currentReviews.push({ name: "", rating: 5, text: "", bookId: "ALL" });
    renderReviewsList();
  });
  document.getElementById('btnAddFaqBtn')?.addEventListener('click', () => {
    _currentFaqs.push({ q: "", a: "", bookId: "ALL" });
    renderFaqsList();
  });
  document.getElementById('btnImportReviews')?.addEventListener('click', autoImportReviews);
  document.getElementById('btnImportFaqs')?.addEventListener('click', autoImportFaqs);

  // Table action delegation
  const tbody = document.getElementById('bundleTableBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-bundle-edit');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const bId = editBtn.getAttribute('data-id');
        window.editBundle(bId);
        return;
      }
      const delBtn = e.target.closest('.btn-bundle-del');
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        const bId = delBtn.getAttribute('data-id');
        window.deleteBundle(bId);
        return;
      }
      const statusBtn = e.target.closest('.btn-bundle-status');
      if (statusBtn) {
        e.preventDefault();
        e.stopPropagation();
        const bId = statusBtn.getAttribute('data-id');
        window.toggleBundleStatus(bId);
        return;
      }
    });
  }

  const handleFormSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const btnSave = document.getElementById('btnSaveBundle');
    if (btnSave) {
      btnSave.disabled = true;
      btnSave.textContent = '⏳ सुरक्षित हो रहा है...';
    }
    try {
      await handleSaveBundle();
      showList();
      await loadAndRenderBundles();
    } catch (err) {
      console.error('[Save Bundle Error]', err);
      alert('बंडल सुरक्षित करने में समस्या आई: ' + (err.message || err));
    } finally {
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.textContent = '💾 बंडल ऑफर सुरक्षित करें (Publish Bundle)';
      }
    }
  };

  form?.addEventListener('submit', handleFormSave);
  document.getElementById('btnSaveBundle')?.addEventListener('click', handleFormSave);
}

// --- DATA LOGIC & RENDERING ---
async function loadAndRenderBundles() {
  _catalogBooks = await fetchCatalogBooks();
  _allLandingPages = await fetchLandingPages();
  _aarogyamTubeVideos = await fetchAarogyamTubeVideos();

  populateBooksSelector();
  renderHeroKpisList();
  renderWhyBuyFeatures();
  renderSectionControls();

  _activeBundlesList = await fetchAllBundles();

  const countBadge = document.getElementById('bundleCountBadge');
  if (countBadge) countBadge.textContent = _activeBundlesList.length;

  const tbody = document.getElementById('bundleTableBody');
  if (!tbody) return;

  if (_activeBundlesList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:36px; color:#94a3b8;">
          <div style="font-size:1.6rem; margin-bottom:6px;">🎁</div>
          <div style="font-weight:700; color:#f8fafc;">अभी कोई कॉम्बो बंडल नहीं बना है।</div>
          <p style="font-size:0.8rem; margin-top:4px;">"नया कॉम्बो बंडल बनाएँ" पर क्लिक करके पहला आकर्षक बंडल तैयार करें।</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = _activeBundlesList.map((b, idx) => {
    const bookCount = (b.bookIds || []).length;
    const isAct = b.status === 'active';
    const liveUrl = `/bundle.html?id=${encodeURIComponent(b.id)}`;

    return `
      <tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 12px; font-weight:700; color:#94a3b8;">#${idx + 1}</td>
        <td style="padding: 12px;">
          <strong style="color:#f8fafc; display:block; font-size:0.92rem;">${escapeHtml(b.title)}</strong>
          <span style="font-size:0.75rem; color:#38bdf8;">ID: ${escapeHtml(b.id)} • /bundle.html?slug=${escapeHtml(b.slug || b.id)}</span>
        </td>
        <td style="padding: 12px; text-align:center;">
          <span style="background:rgba(56,189,248,0.15); color:#38bdf8; font-weight:800; padding:2px 8px; border-radius:6px; font-size:0.78rem;">
            📚 ${bookCount} पुस्तकें
          </span>
        </td>
        <td style="padding: 12px; text-align:center; text-decoration:line-through; color:#94a3b8;">
          ₹${b.mrp || 1196}
        </td>
        <td style="padding: 12px; text-align:center; font-weight:900; color:#10b981; font-size:1rem;">
          ₹${b.offerPrice || 199}
        </td>
        <td style="padding: 12px; text-align:center; font-size:0.78rem;">
          ${b.popupEnabled !== false ? '<span style="color:#10b981;">🚀 पॉपअप ON</span>' : '<span style="color:#64748b;">पॉपअप OFF</span>'}<br/>
          ${b.sakhiTriggerEnabled !== false ? '<span style="color:#38bdf8;">🤖 AI ट्रिगर ON</span>' : ''}
        </td>
        <td style="padding: 12px; text-align:center;">
          <button type="button" class="btn-bundle-status admin-button small-button" data-id="${b.id}" style="background:${isAct ? '#15803d' : '#854d0e'}; color:#fff; border:none; font-weight:800; font-size:0.72rem; padding:3px 10px; border-radius:12px; cursor:pointer;">
            ${isAct ? 'ACTIVE' : 'INACTIVE'}
          </button>
        </td>
        <td style="padding: 12px; text-align:right; white-space:nowrap;">
          <a href="${liveUrl}" target="_blank" class="admin-button small-button" style="background:#0284c7; color:#fff; text-decoration:none; padding:4px 10px; border-radius:6px; font-weight:700; margin-right:4px;">
            👁️ लाइव देखें
          </a>
          <button type="button" class="btn-bundle-edit admin-button small-button" data-id="${b.id}" style="background:#334155; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-weight:700; margin-right:4px; cursor:pointer;">
            ✏️ एडिट
          </button>
          <button type="button" class="btn-bundle-del admin-button small-button" data-id="${b.id}" style="background:#991b1b; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-weight:700; cursor:pointer;">
            ✕
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.onBundleBookToggle = function(checkbox) {
  const bId = checkbox.value;
  if (checkbox.checked) {
    if (!_selectedBookIdsOrdered.includes(bId)) {
      _selectedBookIdsOrdered.push(bId);
    }
  } else {
    _selectedBookIdsOrdered = _selectedBookIdsOrdered.filter(id => id.toUpperCase() !== bId.toUpperCase());
  }
  window.recalcBundleMrp();
  window.syncSelectedBooksCustomizer();
  window.updateBookSelectorDropdowns();
};

function populateBooksSelector() {
  const container = document.getElementById('bFormBooksGrid');
  if (!container) return;

  container.innerHTML = _catalogBooks.map(b => `
    <label style="display:flex; align-items:center; gap:10px; background:#0f172a; padding:8px 10px; border-radius:8px; border:1px solid #334155; cursor:pointer;">
      <input type="checkbox" name="bundleBooks" value="${b.id}" data-mrp="${b.mrp || 299}" onchange="window.onBundleBookToggle(this)" style="width:18px; height:18px; accent-color:#10b981;" />
      <img src="${b.cover || '/images/books/' + b.id + '-cover.webp'}" alt="Cover" style="width:36px; height:50px; border-radius:4px; object-fit:cover; flex-shrink:0;" />
      <div style="flex:1; min-width:0;">
        <div style="font-weight:700; color:#fff; font-size:0.82rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${escapeHtml(b.heading || b.name || b.id)}
        </div>
        <div style="font-size:0.75rem; color:#94a3b8;">
          ID: ${b.id} • MRP: <strong style="color:#fbbf24;">₹${b.mrp || 299}</strong>
        </div>
      </div>
    </label>
  `).join('');
}

window.moveBundleBookOrder = function(index, dir) {
  const newIdx = index + dir;
  if (newIdx < 0 || newIdx >= _selectedBookIdsOrdered.length) return;
  const temp = _selectedBookIdsOrdered[index];
  _selectedBookIdsOrdered[index] = _selectedBookIdsOrdered[newIdx];
  _selectedBookIdsOrdered[newIdx] = temp;
  window.syncSelectedBooksCustomizer();
  window.updateBookSelectorDropdowns();
};

window.makeBookCenterFront = function(index) {
  if (_selectedBookIdsOrdered.length < 3) return;
  const centerIdx = Math.floor(_selectedBookIdsOrdered.length / 2);
  const item = _selectedBookIdsOrdered.splice(index, 1)[0];
  _selectedBookIdsOrdered.splice(centerIdx, 0, item);
  window.syncSelectedBooksCustomizer();
  window.updateBookSelectorDropdowns();
};

window.syncSelectedBooksCustomizer = function () {
  const container = document.getElementById('selectedBooksCustomizerList');
  if (!container) return;

  const checked = document.querySelectorAll('input[name="bundleBooks"]:checked');
  const checkedSet = new Set(Array.from(checked).map(c => c.value.toUpperCase()));

  // Filter _selectedBookIdsOrdered to only currently checked books
  _selectedBookIdsOrdered = _selectedBookIdsOrdered.filter(id => checkedSet.has(id.toUpperCase()));

  // Add any checked book not yet in ordered list
  checked.forEach(cb => {
    if (!_selectedBookIdsOrdered.some(id => id.toUpperCase() === cb.value.toUpperCase())) {
      _selectedBookIdsOrdered.push(cb.value);
    }
  });

  const countBadge = document.getElementById('selectedBooksCountBadge');
  if (countBadge) countBadge.textContent = _selectedBookIdsOrdered.length;

  if (_selectedBookIdsOrdered.length === 0) {
    container.innerHTML = `
      <div style="padding:14px; background:#020617; border:1px dashed #334155; border-radius:8px; text-align:center; color:#64748b; font-size:0.8rem;">
        कृपया ऊपर बंडल में पुस्तकें चुनें ताकि उनके विवरण व 3D स्टैक क्रम कस्टमाइज़ किए जा सकें।
      </div>
    `;
    return;
  }

  const total = _selectedBookIdsOrdered.length;

  container.innerHTML = _selectedBookIdsOrdered.map((bId, idx) => {
    const book = _catalogBooks.find(b => (b.id || '').toUpperCase() === bId.toUpperCase()) || {};
    const existing = _currentBookCustomDetails[bId] || _currentBookCustomDetails[bId.toUpperCase()] || {};
    const subVal = existing.subtitle || book.heading || '';
    const descVal = existing.shortDesc || existing.desc || book.description || 'फसलों के सम्पूर्ण कीट, रोग नियंत्रण व पैदावार बढ़ाने की व्यावहारिक वैज्ञानिक जानकारी।';
    const showPts = existing.showPoints !== false;
    const ptsVal = Array.isArray(existing.keyPoints) ? existing.keyPoints.join('\n') : '';

    // 3D Fan Stack Layer Label based on position
    let stackLabel = `#${idx + 1}`;
    let isCenter = false;
    if (total === 5) {
      if (idx === 0) stackLabel = '1️⃣ बायाँ छोर (Far Left)';
      else if (idx === 1) stackLabel = '2️⃣ मध्य-बायाँ (Mid Left)';
      else if (idx === 2) { stackLabel = '⭐ 3️⃣ मुख्य सामने वाला कवर (Center Front — सबसे आगे!)'; isCenter = true; }
      else if (idx === 3) stackLabel = '4️⃣ मध्य-दायाँ (Mid Right)';
      else if (idx === 4) stackLabel = '5️⃣ दायाँ छोर (Far Right)';
    } else if (total === 4) {
      if (idx === 0) stackLabel = '1️⃣ बायाँ छोर (Left)';
      else if (idx === 1) { stackLabel = '⭐ 2️⃣ मुख्य सामने-बायाँ (Front Left)'; isCenter = true; }
      else if (idx === 2) { stackLabel = '⭐ 3️⃣ मुख्य सामने-दायाँ (Front Right)'; isCenter = true; }
      else if (idx === 4) stackLabel = '4️⃣ दायाँ छोर (Right)';
    } else {
      if (idx === Math.floor(total / 2)) {
        stackLabel = `⭐ #${idx + 1} (मुख्य सामने वाला कवर)`;
        isCenter = true;
      } else {
        stackLabel = `#${idx + 1} लेयर`;
      }
    }

    return `
      <div style="background:${isCenter ? '#064e3b' : '#020617'}; border:1.5px solid ${isCenter ? '#10b981' : '#334155'}; border-radius:10px; padding:12px; margin-bottom:12px; display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start;">
        <img src="${book.cover || '/images/books/' + bId + '-cover.webp'}" alt="Cover" style="width:52px; height:74px; border-radius:6px; object-fit:cover; flex-shrink:0; border:1px solid rgba(255,255,255,0.2);" />
        
        <div style="flex:1; min-width:240px;">
          <!-- Header with Position Badge and Up/Down Buttons -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div>
              <strong style="color:#f8fafc; font-size:0.9rem;">${escapeHtml(book.heading || book.name || bId)} (${bId})</strong>
              <div style="margin-top:2px;">
                <span style="background:${isCenter ? '#10b981' : 'rgba(56,189,248,0.2)'}; color:${isCenter ? '#ffffff' : '#38bdf8'}; font-weight:800; font-size:0.75rem; padding:2px 8px; border-radius:6px; display:inline-block;">
                  3D स्टैक स्थिति: ${stackLabel}
                </span>
              </div>
            </div>
            
            <!-- Up / Down / Make Center Front Buttons -->
            <div style="display:flex; align-items:center; gap:5px;">
              <button type="button" onclick="window.moveBundleBookOrder(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.4;"' : ''} class="admin-button small-button" style="background:#334155; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-weight:800; cursor:pointer;" title="स्टैक में ऊपर ले जाएँ">
                ⬆️ ऊपर
              </button>
              <button type="button" onclick="window.moveBundleBookOrder(${idx}, 1)" ${idx === total - 1 ? 'disabled style="opacity:0.4;"' : ''} class="admin-button small-button" style="background:#334155; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-weight:800; cursor:pointer;" title="स्टैक में नीचे ले जाएँ">
                ⬇️ नीचे
              </button>
              ${!isCenter ? `
                <button type="button" onclick="window.makeBookCenterFront(${idx})" class="admin-button small-button" style="background:#15803d; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-weight:800; cursor:pointer;" title="इसे 3D स्टैक में सबसे आगे रखें">
                  ⭐ मुख्य सामने लाएँ
                </button>
              ` : ''}
              <label style="display:flex; align-items:center; gap:5px; font-size:0.75rem; color:#cbd5e1; cursor:pointer; margin-left:6px;">
                <input type="checkbox" id="chkShowPts_${bId}" ${showPts ? 'checked' : ''} style="accent-color:#10b981;" />
                <span>मुख्य बिंदु दिखाएं</span>
              </label>
            </div>
          </div>

          <div style="margin-bottom:6px;">
            <span style="font-size:0.75rem; color:#94a3b8;">पुस्तक सब-टाइटल / टैगलाइन:</span>
            <input type="text" id="txtSub_${bId}" value="${escapeHtml(subVal)}" class="admin-input" style="width:100%; font-size:0.8rem; margin-top:2px;" placeholder="जैसे: धान, सोयाबीन व मक्का की सम्पूर्ण वैज्ञानिक गाइड" />
          </div>
          <div style="margin-bottom:6px;">
            <span style="font-size:0.75rem; color:#38bdf8;">📖 संक्षिप्त विवरण (Short Description — जिज्ञासा व ज्ञान बढ़ाने के लिए):</span>
            <textarea id="txtDesc_${bId}" class="admin-input" rows="2" style="width:100%; font-size:0.78rem; margin-top:2px;" placeholder="बीज उपचार से लेकर कटाई तक सम्पूर्ण प्रैक्टिकल समाधान। रोग व कीट पहचान की वैज्ञानिक पद्धति।">${escapeHtml(descVal)}</textarea>
          </div>
          <div>
            <span style="font-size:0.75rem; color:#94a3b8;">✨ मुख्य बिंदु (प्रति पंक्ति 1 बिंदु):</span>
            <textarea id="txtPts_${bId}" class="admin-input" rows="2" style="width:100%; font-size:0.78rem; font-family:monospace; margin-top:2px;" placeholder="रोग-कीट पहचान एवं सटीक दवा चार्ट&#10;उर्वरक व स्प्रे का वैज्ञानिक शेड्यूल">${escapeHtml(ptsVal)}</textarea>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.updateBookSelectorDropdowns = function () {
  const checked = document.querySelectorAll('input[name="bundleBooks"]:checked');
  const checkedIds = Array.from(checked).map(c => c.value);

  const selRev = document.getElementById('selBookForReviewImport');
  const selFaq = document.getElementById('selBookForFaqImport');

  const optionsHtml = `
    <option value="ALL">सभी चुनी गई पुस्तकें (${checkedIds.length})</option>
    ${checkedIds.map(id => {
      const b = _catalogBooks.find(x => (x.id || '').toUpperCase() === id.toUpperCase());
      return `<option value="${id}">${escapeHtml(b ? (b.heading || b.name || id) : id)} (${id})</option>`;
    }).join('')}
  `;

  if (selRev) selRev.innerHTML = optionsHtml;
  if (selFaq) selFaq.innerHTML = optionsHtml;
};

window.recalcBundleMrp = function () {
  const checked = document.querySelectorAll('input[name="bundleBooks"]:checked');
  let totalMrp = 0;
  checked.forEach(cb => {
    totalMrp += Number(cb.dataset.mrp || 299);
  });
  const mrpInput = document.getElementById('bFormMrp');
  if (mrpInput) mrpInput.value = totalMrp;
  calculateSavingsPreview();
};

function calculateSavingsPreview() {
  const mrp = Number(document.getElementById('bFormMrp')?.value || 0);
  const offer = Number(document.getElementById('bFormOfferPrice')?.value || 0);
  const preview = document.getElementById('bFormSavingsPreview');
  if (!preview) return;

  if (mrp > 0 && offer > 0 && offer < mrp) {
    const save = mrp - offer;
    const pct = Math.round((save / mrp) * 100);
    preview.textContent = `₹${save} (${pct}% OFF)`;
  } else {
    preview.textContent = `₹0 (0% OFF)`;
  }
}

// --- DYNAMIC HERO KPIS RENDERER ---
function renderHeroKpisList() {
  const container = document.getElementById('heroKpisContainer');
  if (!container) return;

  container.innerHTML = _currentHeroKpis.map((kpi, idx) => `
    <div style="background:#020617; border:1px solid #334155; border-radius:8px; padding:8px 10px; display:flex; gap:6px; align-items:center;">
      <input type="text" value="${escapeHtml(kpi.icon || '⚡')}" onchange="window.updateHeroKpi(${idx}, 'icon', this.value)" class="admin-input" style="width:36px; text-align:center; font-size:1rem; padding:4px;" />
      <input type="text" value="${escapeHtml(kpi.value || '')}" onchange="window.updateHeroKpi(${idx}, 'value', this.value)" class="admin-input" placeholder="हाईलाइट (e.g. 4 संपूर्ण ई-बुक्स)" style="flex:1.5; font-size:0.8rem; font-weight:700;" />
      <input type="text" value="${escapeHtml(kpi.label || '')}" onchange="window.updateHeroKpi(${idx}, 'label', this.value)" class="admin-input" placeholder="लेबल (e.g. गाइड्स)" style="flex:1; font-size:0.78rem;" />
      <button type="button" onclick="window.removeHeroKpi(${idx})" class="admin-button small-button" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;" title="हटाएं">✕</button>
    </div>
  `).join('');
}

window.updateHeroKpi = function (idx, key, val) {
  if (_currentHeroKpis[idx]) _currentHeroKpis[idx][key] = val;
};
window.removeHeroKpi = function (idx) {
  _currentHeroKpis.splice(idx, 1);
  renderHeroKpisList();
};

// --- AAROGYAMTUBE INTEGRATION ---
function extractYouTubeId(url) {
  if (!url) return '';
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

async function fetchAarogyamTubeVideos() {
  try {
    const resp = await fetch('/data/webinar-recordings.json?v=' + Date.now());
    if (resp.ok) {
      const json = await resp.json();
      return Array.isArray(json.recordings) ? json.recordings : (Array.isArray(json) ? json : []);
    }
  } catch (_) { }
  return [];
}

async function openAarogyamTubePicker() {
  const modal = document.getElementById('aarogyamTubePickerModal');
  if (modal) {
    modal.style.display = 'flex';
    const grid = document.getElementById('tubePickerGrid');
    if (grid) grid.innerHTML = '<div style="color:#38bdf8; text-align:center; padding:30px; grid-column:1/-1;">⏳ आरोग्यम ट्यूब वीडियो लोड हो रहे हैं...</div>';
    try {
      _aarogyamTubeVideos = await fetchAarogyamTubeVideos();
      renderAarogyamTubeGrid(_aarogyamTubeVideos);
    } catch (e) {
      if (grid) grid.innerHTML = '<div style="color:#ef4444; text-align:center; padding:20px; grid-column:1/-1;">वीडियो लोड करने में त्रुटि आई।</div>';
    }
  }
}

function closeAarogyamTubePicker() {
  const modal = document.getElementById('aarogyamTubePickerModal');
  if (modal) modal.style.display = 'none';
}

function renderAarogyamTubeGrid(list) {
  const grid = document.getElementById('tubePickerGrid');
  if (!grid) return;

  if (!list || list.length === 0) {
    grid.innerHTML = '<div style="color:#94a3b8; text-align:center; padding:20px; grid-column:1/-1;">कोई वीडियो नहीं मिला।</div>';
    return;
  }

  grid.innerHTML = list.slice(0, 60).map(v => {
    const rawUrl = v.video_url || v.youtube_url || (v.youtube_id ? `https://www.youtube.com/watch?v=${v.youtube_id}` : '');
    const ytId = extractYouTubeId(rawUrl) || v.youtube_id || '';
    const isShort = rawUrl.includes('/shorts/') || v.format === 'short' || v.format === 'shorts' || v.format === 'short_reel';
    const cleanWatchUrl = isShort && ytId 
      ? `https://youtube.com/shorts/${ytId}` 
      : (ytId ? `https://www.youtube.com/watch?v=${ytId}` : rawUrl);
    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : (v.thumbnail || '/images/banners/aarogyamtube-default-thumb.svg');
    const displayCategory = v.subject || v.category || 'AarogyamTube';

    return `
      <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <div style="position:relative; width:100%; height:115px; background:#020617; overflow:hidden;">
          <img src="${thumb}" alt="Thumb" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.src='/images/banners/aarogyamtube-default-thumb.svg';" />
          <span style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.82); color:#f8fafc; font-size:0.65rem; font-weight:800; padding:2px 6px; border-radius:4px;">
            ${isShort ? '📱 SHORTS (9:16)' : (v.duration || 'VIDEO')}
          </span>
        </div>
        <div style="padding:10px; flex:1; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
          <div>
            <span style="font-size:0.65rem; color:#38bdf8; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">${escapeHtml(displayCategory)}</span>
            <h5 style="margin:4px 0 0 0; color:#fff; font-size:0.8rem; font-weight:700; line-height:1.35; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
              ${escapeHtml(v.title || '')}
            </h5>
          </div>
          <button type="button" onclick="window.pickTubeVideo('${encodeURIComponent(cleanWatchUrl)}', '${encodeURIComponent(v.title || '')}', '${encodeURIComponent(v.speaker || v.subject || '')}', '${isShort ? '9:16' : '16:9'}')" class="admin-button small-button" style="background:#10b981; color:#fff; width:100%; border:none; padding:7px 10px; border-radius:6px; font-weight:800; font-size:0.75rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span>➕</span> <span>यह वीडियो जोड़ें</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.pickTubeVideo = function (encUrl, encTitle, encSub, encRatio) {
  const url = decodeURIComponent(encUrl);
  const title = decodeURIComponent(encTitle);
  const sub = decodeURIComponent(encSub);
  const ratio = encRatio ? decodeURIComponent(encRatio) : (url.includes('/shorts/') ? '9:16' : '16:9');
  const isVert = ratio === '9:16';

  _currentVideos.push({
    url: url,
    title: title,
    subtitle: sub || "आरोग्यम ट्यूब विशेष वीडियो",
    isVertical: isVert,
    aspectRatio: ratio
  });

  renderVideosList();
  closeAarogyamTubePicker();
  showToast('✅ वीडियो सफलतापूर्वक बंडल में जुड़ गया!', 'success');
};

function filterAarogyamTubeVideos(e) {
  const q = (e.target.value || '').toLowerCase().trim();
  if (!q) {
    renderAarogyamTubeGrid(_aarogyamTubeVideos);
    return;
  }
  const filtered = _aarogyamTubeVideos.filter(v =>
    (v.title && v.title.toLowerCase().includes(q)) ||
    (v.subject && v.subject.toLowerCase().includes(q)) ||
    (v.category && v.category.toLowerCase().includes(q))
  );
  renderAarogyamTubeGrid(filtered);
}

// --- TTS VOICE PLAYBACK IN ADMIN PANEL ---
let _adminSpeechUtterance = null;
function playAdminTtsVoice() {
  const scriptText = document.getElementById('bFormAudioScript')?.value.trim();
  const statusEl = document.getElementById('ttsAudioStatusBadge');

  if (!scriptText) {
    alert('कृपया पहले नीचे हिंदी ऑडियो स्क्रिप्ट लिखें!');
    return;
  }

  if (!('speechSynthesis' in window)) {
    alert('आपका ब्राउज़र Speech Synthesis को सपोर्ट नहीं करता।');
    return;
  }

  window.speechSynthesis.cancel();
  _adminSpeechUtterance = new SpeechSynthesisUtterance(scriptText);
  _adminSpeechUtterance.lang = 'hi-IN';
  _adminSpeechUtterance.rate = 0.95;
  _adminSpeechUtterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const hiVoice = voices.find(v => v.lang && (v.lang.startsWith('hi') || v.name.includes('Hindi')));
  if (hiVoice) _adminSpeechUtterance.voice = hiVoice;

  _adminSpeechUtterance.onstart = () => {
    if (statusEl) statusEl.innerHTML = '<span style="color:#10b981; font-weight:800;">🔊 बोल रहा है... (Speaking Audio Script)</span>';
  };
  _adminSpeechUtterance.onend = () => {
    if (statusEl) statusEl.innerHTML = '<span style="color:#94a3b8;">[ऑडियो समाप्त हुआ]</span>';
  };
  _adminSpeechUtterance.onerror = () => {
    if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444;">[ऑडियो एरर]</span>';
  };

  window.speechSynthesis.speak(_adminSpeechUtterance);
}

function stopAdminTtsVoice() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const statusEl = document.getElementById('ttsAudioStatusBadge');
  if (statusEl) statusEl.innerHTML = '<span style="color:#94a3b8;">[ऑडियो रोका गया]</span>';
}

function generateHindiAudioScript() {
  const checked = document.querySelectorAll('input[name="bundleBooks"]:checked');
  const bookIds = Array.from(checked).map(c => c.value.toUpperCase());
  if (bookIds.length === 0) {
    alert('कृपया पहले ऊपर बंडल में कुछ पुस्तकें चुनें!');
    return;
  }

  const titles = bookIds.map(bId => {
    const b = _catalogBooks.find(x => (x.id || '').toUpperCase() === bId);
    return b ? (b.heading || b.name || bId) : bId;
  });

  const offer = document.getElementById('bFormOfferPrice')?.value || '199';
  const scriptText = `नमस्ते किसान भाइयों! आरोग्यम इंडिया लाया है आपके लिए महाबचत कॉम्बो बंडल। इसमें आपको ${titles.join(', ')} की संपूर्ण डिजिटल ई-बुक्स सिर्फ ${offer} रुपये में मिल रही हैं। बीज उपचार, रोग-कीट नियंत्रण और वैज्ञानिक खाद प्रबंधन का यह संपूर्ण संग्रह आज ही अनलॉक करें और अपनी फसल की लागत घटाकर पैदावार बढ़ाएं!`;

  const scriptInput = document.getElementById('bFormAudioScript');
  if (scriptInput) {
    scriptInput.value = scriptText;
    showToast('✨ हिंदी ऑडियो स्क्रिप्ट तैयार कर दी गई!', 'success');
  }
}

// --- SUB-COLLECTION RENDERERS ---
function renderVideosList() {
  const container = document.getElementById('bundleVideosList');
  if (!container) return;

  if (_currentVideos.length === 0) {
    container.innerHTML = `
      <div style="padding:10px; background:#020617; border:1px dashed #334155; border-radius:8px; text-align:center; color:#64748b; font-size:0.8rem;">
        कोई वीडियो नहीं जोड़ा गया। "📺 आरोग्यम ट्यूब से चुनें" या "➕ वीडियो जोड़ें" दबाएं।
      </div>
    `;
    return;
  }

  container.innerHTML = _currentVideos.map((v, i) => {
    const ytId = extractYouTubeId(v.url || '');
    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '';
    return `
      <div id="videoRow_${i}" style="background:#020617; border:1px solid #334155; border-radius:8px; padding:10px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <span style="color:#ec4899; font-weight:900; font-size:0.82rem;">#${i + 1}</span>
        <img class="video-thumb-preview" src="${thumb}" alt="Thumb" style="width:52px; height:34px; object-fit:cover; border-radius:4px; border:1px solid #334155; ${thumb ? '' : 'display:none;'}" onerror="this.style.display='none';" />
        <input type="text" placeholder="वीडियो लिंक (YouTube / Shorts URL)" value="${escapeHtml(v.url || '')}" oninput="window.updateVideoItem(${i}, 'url', this.value)" onchange="window.updateVideoItem(${i}, 'url', this.value)" class="admin-input" style="flex:2; min-width:200px; font-size:0.8rem;" />
        <input type="text" placeholder="शीर्षक (Title)" value="${escapeHtml(v.title || '')}" oninput="window.updateVideoItem(${i}, 'title', this.value)" class="admin-input" style="flex:1.5; min-width:160px; font-size:0.8rem;" />
        <input type="text" placeholder="उप-शीर्षक (Subtitle)" value="${escapeHtml(v.subtitle || '')}" oninput="window.updateVideoItem(${i}, 'subtitle', this.value)" class="admin-input" style="flex:1.5; min-width:160px; font-size:0.8rem;" />
        <button type="button" onclick="window.removeVideoItem(${i})" class="admin-button small-button" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-weight:800; cursor:pointer;" title="हटाएं">✕</button>
      </div>
    `;
  }).join('');
}

window.updateVideoItem = function (idx, key, val) {
  if (_currentVideos[idx]) {
    _currentVideos[idx][key] = val;
    if (key === 'url') {
      const ytId = extractYouTubeId(val);
      const row = document.getElementById(`videoRow_${idx}`);
      if (row) {
        const img = row.querySelector('.video-thumb-preview');
        if (img) {
          if (ytId) {
            img.src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
            img.style.display = 'block';
          } else {
            img.style.display = 'none';
          }
        }
      }
    }
  }
};
window.removeVideoItem = function (idx) {
  _currentVideos.splice(idx, 1);
  renderVideosList();
};

function renderReviewsList() {
  const container = document.getElementById('bundleReviewsContainer');
  if (!container) return;

  if (_currentReviews.length === 0) {
    container.innerHTML = `
      <div style="padding:10px; background:#020617; border:1px dashed #334155; border-radius:8px; text-align:center; color:#64748b; font-size:0.8rem;">
        कोई समीक्षा नहीं जोड़ी गई। "📥 Reviews लोड करें" या "➕ नया Review जोड़ें" दबाएं।
      </div>
    `;
    return;
  }

  container.innerHTML = _currentReviews.map((r, i) => `
    <div style="background:#020617; border:1px solid #334155; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <input type="text" placeholder="किसान का नाम व पता" value="${escapeHtml(r.name || '')}" onchange="window.updateReviewItem(${i}, 'name', this.value)" class="admin-input" style="flex:2; font-size:0.82rem; font-weight:700;" />
        <select onchange="window.updateReviewItem(${i}, 'rating', Number(this.value))" class="admin-select" style="width:100px; font-size:0.8rem;">
          <option value="5" ${r.rating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ (5)</option>
          <option value="4" ${r.rating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ (4)</option>
        </select>
        <button type="button" onclick="window.removeReviewItem(${i})" class="admin-button small-button" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;" title="हटाएं">✕ हटाएं</button>
      </div>
      <textarea placeholder="ग्राहक का अनुभव / समीक्षा संदेश" onchange="window.updateReviewItem(${i}, 'text', this.value)" class="admin-input" rows="2" style="width:100%; font-size:0.8rem;">${escapeHtml(r.text || '')}</textarea>
    </div>
  `).join('');
}

window.updateReviewItem = function (idx, key, val) {
  if (_currentReviews[idx]) _currentReviews[idx][key] = val;
};
window.removeReviewItem = function (idx) {
  _currentReviews.splice(idx, 1);
  renderReviewsList();
};

function renderFaqsList() {
  const container = document.getElementById('bundleFaqsContainer');
  if (!container) return;

  if (_currentFaqs.length === 0) {
    container.innerHTML = `
      <div style="padding:10px; background:#020617; border:1px dashed #334155; border-radius:8px; text-align:center; color:#64748b; font-size:0.8rem;">
        कोई FAQ नहीं जोड़ा गया। "📥 FAQs लोड करें" या "➕ नया FAQ जोड़ें" दबाएं।
      </div>
    `;
    return;
  }

  container.innerHTML = _currentFaqs.map((f, i) => `
    <div style="background:#020617; border:1px solid #334155; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <input type="text" placeholder="प्रश्न (जैसे: क्या किताबें तुरंत मिलेंगी?)" value="${escapeHtml(f.q || '')}" onchange="window.updateFaqItem(${i}, 'q', this.value)" class="admin-input" style="flex:1; font-size:0.82rem; font-weight:700;" />
        <button type="button" onclick="window.removeFaqItem(${i})" class="admin-button small-button" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;" title="हटाएं">✕ हटाएं</button>
      </div>
      <textarea placeholder="उत्तर (जैसे: जी हाँ! पेमेंट होते ही तुरंत लाइब्रेरी में अनलॉक हो जाती हैं।)" onchange="window.updateFaqItem(${i}, 'a', this.value)" class="admin-input" rows="2" style="width:100%; font-size:0.8rem;">${escapeHtml(f.a || '')}</textarea>
    </div>
  `).join('');
}

window.updateFaqItem = function (idx, key, val) {
  if (_currentFaqs[idx]) _currentFaqs[idx][key] = val;
};
window.removeFaqItem = function (idx) {
  _currentFaqs.splice(idx, 1);
  renderFaqsList();
};

function renderWhyBuyFeatures() {
  const container = document.getElementById('whyBuyFeaturesContainer');
  if (!container) return;

  container.innerHTML = _currentWhyBuy.map((item, i) => `
    <div style="background:#020617; border:1px solid #334155; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; gap:6px; align-items:center;">
        <input type="text" value="${escapeHtml(item.icon || '✨')}" onchange="window.updateWhyBuyItem(${i}, 'icon', this.value)" class="admin-input" style="width:40px; text-align:center; font-size:1rem;" />
        <input type="text" value="${escapeHtml(item.title || '')}" onchange="window.updateWhyBuyItem(${i}, 'title', this.value)" class="admin-input" placeholder="फ़ीचर शीर्षक" style="flex:1; font-weight:700; font-size:0.82rem;" />
        <button type="button" onclick="window.removeWhyBuyItem(${i})" class="admin-button small-button" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;" title="हटाएं">✕</button>
      </div>
      <textarea onchange="window.updateWhyBuyItem(${i}, 'desc', this.value)" class="admin-input" rows="2" style="width:100%; font-size:0.78rem;" placeholder="फ़ीचर विवरण">${escapeHtml(item.desc || '')}</textarea>
    </div>
  `).join('');
}

window.updateWhyBuyItem = function (idx, key, val) {
  if (_currentWhyBuy[idx]) _currentWhyBuy[idx][key] = val;
};
window.removeWhyBuyItem = function (idx) {
  _currentWhyBuy.splice(idx, 1);
  renderWhyBuyFeatures();
};

// --- INSIDE DEMO PAGES GALLERY LOGIC ---
function renderDemoThumbnailsStrip() {
  const container = document.getElementById('demoThumbnailsStrip');
  const countBadge = document.getElementById('activeDemoCountBadge');
  if (countBadge) countBadge.textContent = _currentDemoImages.length;
  if (!container) return;

  if (_currentDemoImages.length === 0) {
    container.innerHTML = `
      <div style="color:#64748b; font-size:0.8rem; padding:10px;">
        कोई डेमो इमेज नहीं है। ऊपर "⚡ 2-2 डेमो पेज स्वतः लोड करें" दबाएं या नई इमेज जोड़ें।
      </div>
    `;
    return;
  }

  container.innerHTML = _currentDemoImages.map((imgUrl, idx) => `
    <div style="position:relative; width:80px; height:110px; border-radius:6px; border:1px solid #334155; overflow:hidden; flex-shrink:0; background:#0f172a;">
      <img src="${imgUrl}" alt="Demo" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';" />
      <button type="button" onclick="window.removeDemoImage(${idx})" style="position:absolute; top:2px; right:2px; background:rgba(239,68,68,0.9); color:#fff; border:none; border-radius:50%; width:20px; height:20px; font-size:0.75rem; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="हटाएं">✕</button>
    </div>
  `).join('');
}

window.removeDemoImage = function (idx) {
  _currentDemoImages.splice(idx, 1);
  renderDemoThumbnailsStrip();
};

function addCustomDemoImage() {
  const input = document.getElementById('bFormAddDemoUrl');
  const url = input?.value.trim();
  if (!url) {
    alert('कृपया इमेज URL दर्ज करें या फाइल चुनें!');
    return;
  }
  if (!_currentDemoImages.includes(url)) {
    _currentDemoImages.push(url);
    renderDemoThumbnailsStrip();
    if (input) input.value = '';
    showToast('✅ डेमो इमेज गैलरी में जुड़ गई!', 'success');
  }
}

async function autoImportDemoImages() {
  const checked = document.querySelectorAll('input[name="bundleBooks"]:checked');
  const bookIds = Array.from(checked).map(c => c.value.toUpperCase());
  if (bookIds.length === 0) {
    alert('कृपया पहले ऊपर बंडल में कुछ पुस्तकें चुनें!');
    return;
  }

  const collectedImages = [];
  bookIds.forEach(bId => {
    const lp = _allLandingPages.find(p => (p.id || '').toUpperCase() === bId);
    const cb = _catalogBooks.find(b => (b.id || '').toUpperCase() === bId);
    let demos = lp?.demo_images || lp?.preview_images || cb?.demoImages || [];
    if (!demos || demos.length === 0) {
      demos = [`/images/books/${bId.toLowerCase()}-cover.webp`];
    }
    demos.slice(0, 3).forEach(img => {
      if (!collectedImages.includes(img)) collectedImages.push(img);
    });
  });

  _currentDemoImages = collectedImages;
  renderDemoThumbnailsStrip();
  showToast(`✅ ${collectedImages.length} डेमो पृष्ठ सफलतापूर्वक लोड कर लिए गए!`, 'success');
}

// --- REVIEWS & FAQS IMPORT BY BOOK FILTER ---
async function autoImportReviews() {
  const targetBook = document.getElementById('selBookForReviewImport')?.value || 'ALL';
  const checked = document.querySelectorAll('input[name="bundleBooks"]:checked');
  let bookIds = Array.from(checked).map(c => c.value.toUpperCase());

  if (targetBook !== 'ALL') {
    bookIds = [targetBook.toUpperCase()];
  }

  if (bookIds.length === 0) {
    alert('कृपया पहले ऊपर बंडल में पुस्तकें चुनें!');
    return;
  }

  let imported = [];
  bookIds.forEach(bId => {
    const lp = _allLandingPages.find(p => (p.id || '').toUpperCase() === bId);
    if (lp && Array.isArray(lp.reviews)) {
      lp.reviews.forEach(r => {
        if (!imported.some(x => x.name === r.name)) {
          imported.push({
            name: r.name || 'किसान साथी',
            rating: Number(r.rating || 5),
            text: r.text || r.comment || '',
            bookId: bId
          });
        }
      });
    }
  });

  if (imported.length === 0) {
    imported = [
      { name: "राजेश पाटीदार (उज्जैन)", rating: 5, text: "सोयाबीन और धान में कीटों की पहचान बहुत आसान हो गई। पैसे वसूल संग्रह!", bookId: "BK001" },
      { name: "महेश बिश्नोई (सिरसा)", rating: 5, text: "स्प्रे का सही समय पता चलने से लागत आधी हो गई।", bookId: "BK002" }
    ];
  }

  _currentReviews = imported;
  renderReviewsList();
  showToast(`✅ ${imported.length} समीक्षाएं सफलतापूर्वक लोड हुईं!`, 'success');
}

async function autoImportFaqs() {
  const targetBook = document.getElementById('selBookForFaqImport')?.value || 'ALL';
  const checked = document.querySelectorAll('input[name="bundleBooks"]:checked');
  let bookIds = Array.from(checked).map(c => c.value.toUpperCase());

  if (targetBook !== 'ALL') {
    bookIds = [targetBook.toUpperCase()];
  }

  if (bookIds.length === 0) {
    alert('कृपया पहले ऊपर बंडल में पुस्तकें चुनें!');
    return;
  }

  let imported = [];
  bookIds.forEach(bId => {
    const lp = _allLandingPages.find(p => (p.id || '').toUpperCase() === bId);
    if (lp && Array.isArray(lp.faq)) {
      lp.faq.forEach(f => {
        if (!imported.some(x => x.q === (f.q || f.question))) {
          imported.push({
            q: f.q || f.question || '',
            a: f.a || f.answer || '',
            bookId: bId
          });
        }
      });
    }
  });

  if (imported.length === 0) {
    imported = [
      { q: "क्या पेमेंट के बाद सभी पुस्तकें तुरंत मिलेंगी?", a: "जी हाँ! पेमेंट सफल होते ही सभी पुस्तकें तुरंत आपकी 'मेरी लाइब्रेरी' में स्वतः अनलॉक हो जाती हैं।", bookId: "ALL" },
      { q: "क्या मैं इन्हें बिना इंटरनेट के भी पढ़ सकता हूँ?", a: "बिल्कुल! एक बार खोलने के बाद पुस्तकें आपके फोन में सुरक्षित सेव हो जाती हैं।", bookId: "ALL" }
    ];
  }

  _currentFaqs = imported;
  renderFaqsList();
  showToast(`✅ ${imported.length} FAQs सफलतापूर्वक लोड हुए!`, 'success');
}

// --- PAGE SECTIONS ORDER (MOVE UP/DOWN) & ON/OFF TOGGLES ---
function renderSectionControls() {
  const container = document.getElementById('pageSectionsControlList');
  if (!container) return;

  container.innerHTML = _currentSectionOrder.map((secId, idx) => {
    const meta = SECTION_METADATA[secId] || { name: secId, icon: '📄' };
    const isVisible = _currentSectionVisibility[secId] !== false;

    return `
      <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" ${isVisible ? 'checked' : ''} onchange="window.toggleSectionVisibility('${secId}', this.checked)" style="width:18px; height:18px; accent-color:#10b981;" />
            <strong style="color:${isVisible ? '#f8fafc' : '#64748b'}; font-size:0.85rem;">${meta.name}</strong>
          </label>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" onclick="window.moveSectionOrder(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : 'style="cursor:pointer;"'} class="admin-button small-button" style="background:#334155; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem;">
            ⬆️ ऊपर
          </button>
          <button type="button" onclick="window.moveSectionOrder(${idx}, 1)" ${idx === _currentSectionOrder.length - 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : 'style="cursor:pointer;"'} class="admin-button small-button" style="background:#334155; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem;">
            ⬇️ नीचे
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleSectionVisibility = function (secId, isVis) {
  _currentSectionVisibility[secId] = Boolean(isVis);
  renderSectionControls();
};

window.moveSectionOrder = function (idx, dir) {
  const targetIdx = idx + dir;
  if (targetIdx < 0 || targetIdx >= _currentSectionOrder.length) return;
  const temp = _currentSectionOrder[idx];
  _currentSectionOrder[idx] = _currentSectionOrder[targetIdx];
  _currentSectionOrder[targetIdx] = temp;
  renderSectionControls();
};

// --- SAVE / EDIT / DELETE CONTROLLERS ---
async function handleSaveBundle() {
  const idEl = document.getElementById('bFormId');
  const id = idEl ? idEl.value.trim() : '';
  const titleEl = document.getElementById('bFormTitle');
  const title = titleEl ? titleEl.value.trim() : '';
  const slug = (document.getElementById('bFormSlug')?.value.trim()) || (id ? id.toLowerCase().replace(/[^a-z0-9_-]/g, '-') : `bundle-${Date.now()}`);

  if (!id) {
    alert('कृपया बंडल ID अवश्य दर्ज करें!');
    if (idEl) idEl.focus();
    return;
  }
  if (!title) {
    alert('कृपया बंडल का शीर्षक (Title) अवश्य दर्ज करें!');
    if (titleEl) titleEl.focus();
    return;
  }

  const subtitle = document.getElementById('bFormSubtitle')?.value.trim() || '';
  const description = document.getElementById('bFormDescription')?.value.trim() || '';
  const badge = document.getElementById('bFormBadge')?.value.trim() || '';
  const buyBtnText = document.getElementById('bFormBuyBtnText')?.value.trim() || '';
  const bannerImage = document.getElementById('bFormBannerImage')?.value.trim() || '';

  const mrp = Number(document.getElementById('bFormMrp')?.value || 1196);
  const offerPrice = Number(document.getElementById('bFormOfferPrice')?.value || 199);

  // Top Countdown Timer Config
  const timerConfig = {
    enabled: Boolean(document.getElementById('bFormTimerEnabled')?.checked),
    badgeText: document.getElementById('bFormTimerBadge')?.value.trim() || '⚡ महाबचत कॉम्बो ऑफर: यह स्पेशल डिस्काउंट केवल अगले:',
    durationMinutes: Number(document.getElementById('bFormTimerMinutes')?.value || 15)
  };

  // Selected books & their custom details (exact user-defined order)
  const checked = document.querySelectorAll('input[name="bundleBooks"]:checked');
  const checkedSet = new Set(Array.from(checked).map(c => c.value.toUpperCase()));
  const bookIds = (_selectedBookIdsOrdered && _selectedBookIdsOrdered.length > 0)
    ? _selectedBookIdsOrdered.filter(id => checkedSet.has(id.toUpperCase()))
    : Array.from(checked).map(c => c.value);

  if (bookIds.length === 0) {
    alert('कृपया बंडल में कम से कम 1 पुस्तक अवश्य चुनें!');
    return;
  }

  const bookCustomDetails = {};
  bookIds.forEach(bId => {
    const subVal = document.getElementById(`txtSub_${bId}`)?.value.trim() || '';
    const descVal = document.getElementById(`txtDesc_${bId}`)?.value.trim() || '';
    const showPts = document.getElementById(`chkShowPts_${bId}`)?.checked !== false;
    const ptsText = document.getElementById(`txtPts_${bId}`)?.value || '';
    const keyPoints = ptsText.split('\n').map(x => x.trim()).filter(Boolean);

    bookCustomDetails[bId] = {
      subtitle: subVal,
      shortDesc: descVal,
      showPoints: showPts,
      keyPoints: keyPoints
    };
  });

  // Media
  const videoAutoPlay = Boolean(document.getElementById('bFormVideoAutoPlay')?.checked);
  const audioAutoPlay = Boolean(document.getElementById('bFormAudioAutoPlay')?.checked);
  const audioUrl = document.getElementById('bFormAudioUrl')?.value.trim() || '';
  const audioScript = document.getElementById('bFormAudioScript')?.value.trim() || '';

  // Marketing
  const ogImage = document.getElementById('bFormOgImage')?.value.trim() || '';
  const ogTitle = document.getElementById('bFormOgTitle')?.value.trim() || '';
  const seoKeywords = document.getElementById('bFormSeoKeywords')?.value.trim() || '';
  const metaPixelId = document.getElementById('bFormPixelId')?.value.trim() || '';
  const gaId = document.getElementById('bFormGaId')?.value.trim() || '';
  const waText = document.getElementById('bFormWaText')?.value.trim() || '';

  // Promotions & Popup
  const popupEnabled = Boolean(document.getElementById('bFormPopupEnabled')?.checked);
  const popupDelaySeconds = Number(document.getElementById('bFormPopupDelay')?.value || 15);
  const popupTitle = document.getElementById('bFormPopupTitle')?.value.trim() || title;
  const popupSubtitle = document.getElementById('bFormPopupSubtitle')?.value.trim() || subtitle;
  const popupCtaText = document.getElementById('bFormPopupCtaText')?.value.trim() || `🛒 पूरा कॉम्बो ₹${offerPrice} में अनलॉक करें`;

  const popupTargets = Array.from(document.querySelectorAll('input[name="popupTargets"]:checked')).map(c => c.value);

  // Final CTA
  const finalCta = {
    heading: document.getElementById('bFormFinalHeading')?.value.trim() || 'अपनी संपूर्ण कृषि डिजिटल लाइब्रेरी अभी शुरू करें!',
    desc: document.getElementById('bFormFinalDesc')?.value.trim() || 'सीमित समय का विशेष कॉम्बो ऑफर उपलब्ध है। अभी सभी मास्टर गाइड्स प्राप्त करें।',
    buttonText: document.getElementById('bFormFinalBuyBtnText')?.value.trim() || `🛒 पूरा कॉम्बो ₹${offerPrice} में अभी खरीदें`
  };

  const bundleObj = {
    id: id || `BUNDLE_${Date.now()}`,
    slug: slug || id.toLowerCase(),
    title,
    subtitle,
    description,
    badge,
    buyBtnText: buyBtnText || `🛒 पूरा कॉम्बो ₹${offerPrice} में अभी खरीदें`,
    bannerImage,
    ads_mode_enabled: document.getElementById('bFormAdsModeEnabled')?.value === 'true',
    ads_gateway_enabled: document.getElementById('bFormAdsModeEnabled')?.value === 'true',
    bookIds,
    mrp,
    offerPrice,
    timerConfig,
    heroKpis: _currentHeroKpis,
    videos: _currentVideos.filter(v => v && (v.url || v.videoUrl)),
    videoAutoPlay,
    audioAutoPlay,
    audioUrl,
    audioScript,
    bookCustomDetails,
    demoImages: _currentDemoImages,
    whyBuyFeatures: _currentWhyBuy,
    reviews: _currentReviews,
    faqs: _currentFaqs,
    finalCta,
    ogImage,
    ogTitle,
    seoKeywords,
    metaPixelId,
    gaId,
    whatsappShareText: waText,
    popupEnabled,
    popupDelaySeconds,
    popupTitle,
    popupSubtitle,
    popupCtaText,
    popupTargets,
    sectionOrder: _currentSectionOrder,
    sectionVisibility: _currentSectionVisibility,
    status: 'active',
    updated_at: new Date().toISOString()
  };

  // 1. Update in local array in-place without duplicates
  let localBundles = [];
  try {
    localBundles = JSON.parse(localStorage.getItem('AAROGYAM_BUNDLE_LANDING_PAGES') || '[]');
  } catch (_) { localBundles = []; }

  const existIdx = localBundles.findIndex(b => String(b.id || '').toLowerCase() === String(bundleObj.id || '').toLowerCase());
  if (existIdx >= 0) {
    localBundles[existIdx] = bundleObj;
  } else {
    localBundles.unshift(bundleObj);
  }

  // Safe localStorage persistence (never fail if quota exceeded)
  try {
    localStorage.setItem('AAROGYAM_BUNDLE_LANDING_PAGES', JSON.stringify(localBundles));
  } catch (quotaErr) {
    console.warn('[LocalStorage Quota Exceeded] Trimming heavy Base64 previews for local cache:', quotaErr);
    try {
      const lightweightBundles = localBundles.map(b => {
        const copy = Object.assign({}, b);
        if (copy.bannerImage && copy.bannerImage.startsWith('data:')) {
          copy.bannerImage = '/images/banners/aarogyamtube-default-thumb.svg';
        }
        if (Array.isArray(copy.demoImages)) {
          copy.demoImages = copy.demoImages.map(img => (typeof img === 'string' && img.startsWith('data:')) ? '' : img).filter(Boolean);
        }
        return copy;
      });
      localStorage.setItem('AAROGYAM_BUNDLE_LANDING_PAGES', JSON.stringify(lightweightBundles));
    } catch (_) {
      try { localStorage.removeItem('AAROGYAM_BUNDLE_LANDING_PAGES'); } catch (_) {}
    }
  }

  // 2. Triple-Sync to Git (PHP + Vercel GitHub Auto-Sync + Port 5505 + Supabase)
  await syncBundlesToAllBackends(localBundles);

  showToast('🎉 कॉम्बो बंडल सफलतापूर्वक सुरक्षित व लाइव कर दिया गया है!', 'success');
  _editingBundleId = null;
}

window.editBundle = function (bundleId) {
  let bundle = _activeBundlesList.find(b => String(b.id || '').toLowerCase() === String(bundleId || '').toLowerCase());
  if (!bundle) {
    try {
      const local = JSON.parse(localStorage.getItem('AAROGYAM_BUNDLE_LANDING_PAGES') || '[]');
      bundle = local.find(b => String(b.id || '').toLowerCase() === String(bundleId || '').toLowerCase());
    } catch (_) { }
  }
  if (!bundle) {
    alert('बंडल डेटा नहीं मिला: ' + bundleId);
    return;
  }

  _editingBundleId = bundle.id || bundleId;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = (val !== undefined && val !== null) ? val : '';
  };
  const setChk = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = Boolean(val);
  };

  setVal('bFormId', bundle.id);
  setVal('bFormSlug', bundle.slug);
  setVal('bFormTitle', bundle.title);
  setVal('bFormSubtitle', bundle.subtitle);
  setVal('bFormDescription', bundle.description);
  setVal('bFormBadge', bundle.badge);
  setVal('bFormBuyBtnText', bundle.buyBtnText || `🛒 पूरा कॉम्बो ₹${bundle.offerPrice || 199} में अभी खरीदें`);
  setVal('bFormAdsModeEnabled', (bundle.ads_mode_enabled || bundle.ads_gateway_enabled) ? 'true' : 'false');
  setVal('bFormBannerImage', bundle.bannerImage);

  const prevBanner = document.getElementById('bannerLivePreview');
  if (prevBanner) prevBanner.src = bundle.bannerImage || '/images/banners/farmer-community-banner.jpeg';

  setVal('bFormMrp', bundle.mrp || 0);
  setVal('bFormOfferPrice', bundle.offerPrice || 199);

  // Timer Ribbon
  const tc = bundle.timerConfig || {};
  setChk('bFormTimerEnabled', tc.enabled !== false);
  setVal('bFormTimerBadge', tc.badgeText || '⚡ महाबचत कॉम्बो ऑफर: यह स्पेशल डिस्काउंट केवल अगले:');
  setVal('bFormTimerMinutes', tc.durationMinutes || 15);

  // Hero KPIs
  if (Array.isArray(bundle.heroKpis) && bundle.heroKpis.length > 0) {
    _currentHeroKpis = JSON.parse(JSON.stringify(bundle.heroKpis));
  }
  renderHeroKpisList();

  // Media
  setChk('bFormVideoAutoPlay', bundle.videoAutoPlay);
  setChk('bFormAudioAutoPlay', bundle.audioAutoPlay !== false);
  setVal('bFormAudioUrl', bundle.audioUrl);
  setVal('bFormAudioScript', bundle.audioScript);

  _currentDemoImages = Array.isArray(bundle.demoImages) ? JSON.parse(JSON.stringify(bundle.demoImages)) : [];
  renderDemoThumbnailsStrip();

  // Marketing
  setVal('bFormOgImage', bundle.ogImage);
  const prevOg = document.getElementById('ogLivePreview');
  if (prevOg) prevOg.src = bundle.ogImage || '/images/banners/farmer-community-banner.jpeg';

  setVal('bFormOgTitle', bundle.ogTitle);
  setVal('bFormSeoKeywords', bundle.seoKeywords || 'Agriculture eBook Bundle, Farming Combo');
  setVal('bFormPixelId', bundle.metaPixelId || '1671873500553134');
  setVal('bFormGaId', bundle.gaId || 'G-2BWPJVQWPK');
  setVal('bFormWaText', bundle.whatsappShareText);

  // Promotions & Popup
  setChk('bFormPopupEnabled', bundle.popupEnabled !== false);
  setVal('bFormPopupDelay', bundle.popupDelaySeconds || 15);
  setVal('bFormPopupTitle', bundle.popupTitle || bundle.title);
  setVal('bFormPopupSubtitle', bundle.popupSubtitle || bundle.subtitle);
  setVal('bFormPopupCtaText', bundle.popupCtaText || `🛒 पूरा कॉम्बो ₹${bundle.offerPrice || 199} में अनलॉक करें`);

  const pTargets = new Set(bundle.popupTargets || ['home', 'library', 'books', 'tube', 'health']);
  document.querySelectorAll('input[name="popupTargets"]').forEach(cb => {
    cb.checked = pTargets.has(cb.value);
  });

  // Final CTA
  const fCta = bundle.finalCta || {};
  setVal('bFormFinalHeading', fCta.heading || 'अपनी संपूर्ण कृषि डिजिटल लाइब्रेरी अभी शुरू करें!');
  setVal('bFormFinalDesc', fCta.desc || 'सीमित समय का विशेष कॉम्बो ऑफर उपलब्ध है। अभी सभी मास्टर गाइड्स प्राप्त करें।');
  setVal('bFormFinalBuyBtnText', fCta.buttonText || `🛒 पूरा कॉम्बो ₹${bundle.offerPrice || 199} में अभी खरीदें`);

  // Sub-collections
  _currentVideos = Array.isArray(bundle.videos) ? JSON.parse(JSON.stringify(bundle.videos)) : [];
  if (_currentVideos.length === 0 && bundle.videoUrl) {
    _currentVideos = [{ url: bundle.videoUrl, title: bundle.videoTitle || '', subtitle: bundle.videoSubtitle || '' }];
  }
  renderVideosList();

  _currentReviews = Array.isArray(bundle.reviews) ? JSON.parse(JSON.stringify(bundle.reviews)) : [];
  renderReviewsList();

  _currentFaqs = Array.isArray(bundle.faqs) ? JSON.parse(JSON.stringify(bundle.faqs)) : [];
  renderFaqsList();

  if (Array.isArray(bundle.whyBuyFeatures) && bundle.whyBuyFeatures.length > 0) {
    _currentWhyBuy = JSON.parse(JSON.stringify(bundle.whyBuyFeatures));
  }
  renderWhyBuyFeatures();

  _currentBookCustomDetails = bundle.bookCustomDetails || {};

  // Sections order & visibility
  if (Array.isArray(bundle.sectionOrder) && bundle.sectionOrder.length > 0) {
    _currentSectionOrder = JSON.parse(JSON.stringify(bundle.sectionOrder));
  }
  if (bundle.sectionVisibility) {
    _currentSectionVisibility = Object.assign({}, _currentSectionVisibility, bundle.sectionVisibility);
  }
  renderSectionControls();

  // Initialize selected books in exact stored sequence
  _selectedBookIdsOrdered = Array.isArray(bundle.bookIds) ? [...bundle.bookIds] : [];
  const bSet = new Set(_selectedBookIdsOrdered.map(x => String(x).toUpperCase()));
  document.querySelectorAll('input[name="bundleBooks"]').forEach(cb => {
    cb.checked = bSet.has(String(cb.value).toUpperCase());
  });

  if (typeof window.recalcBundleMrp === 'function') {
    window.recalcBundleMrp();
  }
  if (typeof window.syncSelectedBooksCustomizer === 'function') {
    window.syncSelectedBooksCustomizer();
  }
  if (typeof window.updateBookSelectorDropdowns === 'function') {
    window.updateBookSelectorDropdowns();
  }

  // Switch to Builder tab
  if (typeof window.showBundleBuilder === 'function') {
    window.showBundleBuilder(true);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.toggleBundleStatus = async function (bundleId) {
  let list = (_activeBundlesList && _activeBundlesList.length > 0)
    ? _activeBundlesList
    : JSON.parse(localStorage.getItem('AAROGYAM_BUNDLE_LANDING_PAGES') || '[]');

  if (!list || list.length === 0) {
    try {
      const resp = await fetch('/data/book-bundles.json?v=' + Date.now());
      if (resp.ok) list = await resp.json();
    } catch (_) {}
  }

  const bIdNorm = String(bundleId || '').trim().toLowerCase();
  const item = (list || []).find(b => b && b.id && b.id.toLowerCase() === bIdNorm);

  if (item) {
    // 1. Optimistic instant flip
    item.status = item.status === 'active' ? 'inactive' : 'active';
    item.updated_at = new Date().toISOString();
    _activeBundlesList = list;
    try {
      localStorage.setItem('AAROGYAM_BUNDLE_LANDING_PAGES', JSON.stringify(list));
    } catch (_) {}

    // 2. Instant DOM visual feedback (0ms latency)
    const btn = document.querySelector(`.btn-bundle-status[data-id="${bundleId}"]`);
    if (btn) {
      const isAct = item.status === 'active';
      btn.style.background = isAct ? '#15803d' : '#854d0e';
      btn.textContent = isAct ? 'ACTIVE' : 'INACTIVE';
    }

    if (typeof showToast === 'function') {
      showToast(`बंडल "${item.title || bundleId}" अब ${item.status === 'active' ? 'ACTIVE' : 'INACTIVE'} है।`, 'success');
    }

    // 3. Non-blocking background sync (never freezes the admin panel)
    syncBundlesToAllBackends(list).then(() => {
      console.log('[Admin Bundle] Synced status update to backends successfully');
    }).catch(err => {
      console.warn('[Admin Bundle] Sync warning:', err);
    });
  } else {
    alert('कॉम्बो बंडल नहीं मिला: ' + bundleId);
  }
};

window.deleteBundle = async function (bundleId) {
  if (!confirm(`क्या आप वाकई कॉम्बो बंडल "${bundleId}" को हटाना चाहते हैं?`)) return;

  let localBundles = JSON.parse(localStorage.getItem('AAROGYAM_BUNDLE_LANDING_PAGES') || '[]');
  localBundles = localBundles.filter(b => b.id !== bundleId);
  localStorage.setItem('AAROGYAM_BUNDLE_LANDING_PAGES', JSON.stringify(localBundles));

  await syncBundlesToAllBackends(localBundles);

  await loadAndRenderBundles();
};

function resetBundleForm() {
  document.getElementById('bundleBuilderForm')?.reset();
  _editingBundleId = null;
  _currentHeroKpis = [
    { icon: "📚", value: "4 संपूर्ण ई-बुक्स", label: "गाइड्स" },
    { icon: "📄", value: "450+ रंगीन पेज", label: "विस्तृत सामग्री" },
    { icon: "🎯", value: "100% वैज्ञानिक गाइड", label: "सटीक समाधान" },
    { icon: "⚡", value: "तुरंत डिजिटल अनलॉकिंग", label: "लाइफटाइम एक्सेस" }
  ];
  _currentVideos = [
    { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "🎥 सम्पूर्ण कॉम्बो बंडल वीडियो झलक", subtitle: "जानिए कैसे यह संग्रह आपकी समस्याओं का समाधान करेगा:" }
  ];
  _currentReviews = [];
  _currentFaqs = [];
  _currentDemoImages = [];
  _currentBookCustomDetails = {};

  document.getElementById('bFormId').value = 'BUNDLE_' + Date.now();
  document.getElementById('bFormSlug').value = 'mega-combo-' + Math.floor(Math.random() * 900 + 100);
  document.getElementById('bFormPixelId').value = '1671873500553134';
  document.getElementById('bFormGaId').value = 'G-2BWPJVQWPK';
  document.getElementById('bFormOfferPrice').value = '199';
  setVal('bFormAdsModeEnabled', 'false');

  const cbs = document.querySelectorAll('input[name="bundleBooks"]');
  cbs.forEach((cb, i) => {
    cb.checked = (i < 4);
  });

  window.recalcBundleMrp();
  window.syncSelectedBooksCustomizer();
  window.updateBookSelectorDropdowns();
  renderHeroKpisList();
  renderVideosList();
  renderReviewsList();
  renderFaqsList();
  renderWhyBuyFeatures();
  renderDemoThumbnailsStrip();
  renderSectionControls();
}

async function fetchAllBundles() {
  let serverBundles = [];
  try {
    const resp = await fetch('/data/book-bundles.json?v=' + Date.now());
    if (resp.ok) {
      const data = await resp.json();
      serverBundles = Array.isArray(data) ? data : (data.bundles || []);
    }
  } catch (_) { }

  // If server had bundles, merge local overrides by matching id
  try {
    const local = JSON.parse(localStorage.getItem('AAROGYAM_BUNDLE_LANDING_PAGES') || '[]');
    if (Array.isArray(local) && local.length > 0) {
      local.forEach(locItem => {
        if (!locItem || !locItem.id) return;
        const sIdx = serverBundles.findIndex(sb => sb.id.toLowerCase() === locItem.id.toLowerCase());
        if (sIdx >= 0) {
          // Keep newer
          if (new Date(locItem.updated_at || 0) > new Date(serverBundles[sIdx].updated_at || 0)) {
            serverBundles[sIdx] = locItem;
          }
        } else {
          serverBundles.push(locItem);
        }
      });
      return serverBundles;
    }
  } catch (_) { }

  if (serverBundles.length > 0) {
    try {
      localStorage.setItem('AAROGYAM_BUNDLE_LANDING_PAGES', JSON.stringify(serverBundles));
    } catch (_) {}
    return serverBundles;
  }

  // Fallback to Supabase if server empty
  try {
    const db = window.dbClient || window.supabase;
    if (db) {
      const { data } = await db.from('site_configs').select('value').eq('key', 'AAROGYAM_BUNDLE_LANDING_PAGES').maybeSingle();
      if (data && data.value) {
        return Array.isArray(data.value) ? data.value : JSON.parse(data.value || '[]');
      }
    }
  } catch (_) { }

  return [];
}

async function fetchCatalogBooks() {
  try {
    const resp = await fetch('/data/books.json?v=' + Math.floor(Date.now() / 300000));
    if (resp.ok) {
      const data = await resp.json();
      return data.books || data || [];
    }
  } catch (_) { }
  return [];
}

async function fetchLandingPages() {
  try {
    const resp = await fetch('/data/universal-book-landing-pages.json?v=' + Math.floor(Date.now() / 300000));
    if (resp.ok) {
      const data = await resp.json();
      return data.bookLandingPages || data || [];
    }
  } catch (_) { }
  return [];
}

function compressImageToWebp(file, maxDim = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

export const initBookBundles = renderBookBundlesPage;
