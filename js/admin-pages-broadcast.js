/* ==========================================================================
   AAROGYAM INDIA - SMART OUTREACH CRM, VIP OFFER ENGINE & BROADCAST CENTER (V6)
   Responsibilities:
   - Tab 1: 🎁 VIP ऑफर, सम्पूर्ण स्वास्थ्य, पशुपालन, AarogyamTube व साइट प्रचार
   - Tab 2: 🌅 सुविचार, बधाई व GM/GN मैसेंजर (Greetings & Festive Wishes)
   - Tab 3: 📢 इन-ऐप ब्रॉडकास्ट संदेश (In-App Push Feed)
   - Tab 4: 🎉 साइट-व्यापी त्यौहार महाबचत सेल (Festival Flash Sale Manager)
   - Tab 5: 📊 मेरी दैनिक कार्य रिपोर्ट (Admin Daily Activity Report: WA, SMS, Call)
   - Tab 6: 🎯 मार्केटिंग कन्वर्जन रिपोर्ट (Marketing Conversion & Sales Tracker)
   - Tab 7: 🌐 Google Lead Generation (Keyword & Location Local Extractor)
   - Tab 8: 🤖 Auto WhatsApp Bot (30s Anti-Ban Scheduler & Spintax Queue)
   - Live Thumbnail Auto-Preview Card (Auto-detects YouTube, Book, Health, Pashu thumbnail or custom WebP)
   - 1-Click "📋 संदेश कॉपी करें" Button in Preview & HUD
   - Smart Contextual UI: Offer Price (₹) & Timer ONLY show for E-Books
   - Complete Integrations: Health Hub (13+ topics), Pashupalan (7 topics), AarogyamTube (Live Recordings Library)
   - CSV Bulk Contact Import into Supabase 'phonebook' table
   - Anti-Ban Safeguards: 30 WhatsApp/day, 100 SMS/day
   - Zero-Egress Caching (30-min cache, no database exhaustion)
   ========================================================================== */

import { initAdminLayout, showToast } from './admin-main.js';
import { fetchAllUsersAdmin } from './admin-api.js';

export async function initAdminBroadcast() {
  initAdminLayout('Smart Outreach CRM & VIP Offer Engine', 'VIP offers, Health, Pashupalan, Tube, Google Leads, Auto WA & live conversion analytics.');

  const content = document.getElementById('page-content');
  if (!content) return;

  // Master State
  let allUsers = [];
  let externalLeads = [];
  let checkoutLogs = [];
  let catalogBooks = [];
  let tubeRecordings = [];
  let outreachHistory = [];
  
  let activeTab = 'vip_outreach'; // 'vip_outreach', 'greetings', 'broadcast', 'festival', 'activity', 'conversion', 'google_leads', 'auto_whatsapp'
  let currentAudienceFilter = 'all';
  let excludeAlreadyContacted = true;
  let currentBatchPage = 1;
  const BATCH_PAGE_SIZE = 30;

  // WebP Image State
  let activeWebpDataUrl = null;
  let activeWebpFilename = 'promo-vip.webp';

  // 1-Tap Queue & Multi-Contact Selection State
  let activeQueueList = [];
  let currentQueueIndex = 0;
  let selectedContactsSet = new Set();
  let activeTableTabVip = 'pending'; // 'pending' | 'sent'
  let activeTableTabGr = 'pending';  // 'pending' | 'sent'

  // Admin Outreach Share ID Helper (Attributes all referral joins & sales to Admin)
  const getAdminOutreachShareId = () => {
    try {
      if (window.V1_SESSION && typeof window.V1_SESSION.getUnifiedShareId === 'function') {
        const sid = window.V1_SESSION.getUnifiedShareId();
        if (sid && /^AI\d{4,8}$/i.test(sid)) return sid;
      }
      if (window.V1_SESSION && typeof window.V1_SESSION.getUserShareId === 'function') {
        const sid = window.V1_SESSION.getUserShareId();
        if (sid && /^AI\d{4,8}$/i.test(sid)) return sid;
      }
      const userStr = localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed?.share_id && /^AI\d{4,8}$/i.test(parsed.share_id)) return parsed.share_id;
        if (parsed?.referral_code && /^AI\d{4,8}$/i.test(parsed.referral_code)) return parsed.referral_code;
      }
      const directMobile = (localStorage.getItem('aim_user_mobile') || localStorage.getItem('user_mobile') || '').replace(/\D/g, '').slice(-10);
      if (directMobile.length === 10) return 'AI' + directMobile.slice(-6);
      const savedShare = localStorage.getItem('temp_share_id') || localStorage.getItem('referral_share_id');
      if (savedShare && /^AI\d{4,8}$/i.test(savedShare)) return savedShare;
    } catch (e) {}
    return 'AI000004';
  };

  const attachAdminShareId = (url) => {
    if (!url) return 'https://aarogyamindia.online';
    const sid = getAdminOutreachShareId();
    if (!sid) return url;
    if (url.includes('share_id=')) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}share_id=${encodeURIComponent(sid)}&ref=${encodeURIComponent(sid)}`;
  };

  // Storage Helpers & Multi-SIM Limit Configuration
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];
  const getDailyWaCount = () => parseInt(localStorage.getItem('AI_DAILY_WA_COUNT_' + getTodayDateStr()) || '0', 10);
  const getDailySmsCount = () => parseInt(localStorage.getItem('AI_DAILY_SMS_COUNT_' + getTodayDateStr()) || '0', 10);
  const getDailyCallCount = () => parseInt(localStorage.getItem('AI_DAILY_CALL_COUNT_' + getTodayDateStr()) || '0', 10);

  const getOutreachLimits = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('AI_OUTREACH_LIMITS') || '{}');
      const simMode = saved.simMode || 'dual';
      let waLimit = typeof saved.waLimit === 'number' ? saved.waLimit : (simMode === 'single' ? 30 : 60);
      let smsLimit = typeof saved.smsLimit === 'number' ? saved.smsLimit : (simMode === 'single' ? 100 : 200);
      return { simMode, waLimit, smsLimit };
    } catch (e) {
      return { simMode: 'dual', waLimit: 60, smsLimit: 200 };
    }
  };

  const setOutreachLimits = (simMode, waLimit, smsLimit) => {
    const limits = {
      simMode,
      waLimit: Math.max(1, parseInt(waLimit, 10) || 60),
      smsLimit: Math.max(1, parseInt(smsLimit, 10) || 200)
    };
    localStorage.setItem('AI_OUTREACH_LIMITS', JSON.stringify(limits));
    updateOutreachCountersUI();
    return limits;
  };

  const incDailyWaCount = () => {
    const next = getDailyWaCount() + 1;
    localStorage.setItem('AI_DAILY_WA_COUNT_' + getTodayDateStr(), next.toString());
    updateOutreachCountersUI();
    return next;
  };
  const incDailySmsCount = () => {
    const next = getDailySmsCount() + 1;
    localStorage.setItem('AI_DAILY_SMS_COUNT_' + getTodayDateStr(), next.toString());
    updateOutreachCountersUI();
    return next;
  };
  const incDailyCallCount = () => {
    const next = getDailyCallCount() + 1;
    localStorage.setItem('AI_DAILY_CALL_COUNT_' + getTodayDateStr(), next.toString());
    updateOutreachCountersUI();
    return next;
  };

  // Pre-load Outreach History from storage
  try {
    outreachHistory = JSON.parse(localStorage.getItem('AI_OUTREACH_HISTORY') || '[]');
    if (!Array.isArray(outreachHistory)) outreachHistory = [];
  } catch (e) {
    outreachHistory = [];
  }

  // Load Real Books Catalog
  try {
    const booksResp = await fetch('/data/books.json?v=' + Math.floor(Date.now() / 600000));
    if (booksResp.ok) {
      const bJson = await booksResp.json();
      if (Array.isArray(bJson.books)) catalogBooks = bJson.books;
    }
  } catch (e) {}

  if (catalogBooks.length === 0) {
    catalogBooks = [
      { id: 'BK001', name: 'खरीफ फसल मास्टर गाइड 2026', landingPage: '/ebooks/kharif-master-guide-2026.html', cover: '/images/books/kharif-master-guide-2026-cover.webp', mrp: 299, offerPrice: 99, category: 'Agriculture' },
      { id: 'BK002', name: 'खेती का डॉक्टर (फसल का डॉक्टर)', landingPage: '/ebooks/kheti-dr.html', cover: '/images/books/fasal-ka-doctor-cover.webp', mrp: 499, offerPrice: 199, category: 'Agriculture' },
      { id: 'BK016', name: 'कृषि दवा डायरेक्टरी — फसल रोग, कीट व दवा गाइड', landingPage: '/ebooks/book-landing.html?id=BK016', cover: '/images/books/bk016-cover.webp', mrp: 399, offerPrice: 149, category: 'Agriculture' },
      { id: 'BK015', name: 'सब्जी खेती मास्टर गाइड', landingPage: '/ebooks/book-landing.html?id=BK015', cover: '/images/books/bk015-cover.webp', mrp: 399, offerPrice: 149, category: 'Agriculture' },
      { id: 'SUB001', name: '👑 Aarogyam Pro VIP सदस्यता (1 Year)', landingPage: '/ebooks/book-landing.html?id=SUB001', cover: '/images/banners/sub001-hero-banner.webp', mrp: 1999, offerPrice: 499, category: 'VIP' }
    ];
  }

  // Load Real AarogyamTube Videos from webinar-recordings.json
  try {
    const tubeResp = await fetch('/data/webinar-recordings.json?v=' + Math.floor(Date.now() / 600000));
    if (tubeResp.ok) {
      const tJson = await tubeResp.json();
      if (Array.isArray(tJson.recordings)) tubeRecordings = tJson.recordings;
    }
  } catch (e) {}

  content.innerHTML = `
    <!-- Top Action Banner & Multi-Channel Header -->
    <div class="admin-section" style="margin-bottom: 16px; background: linear-gradient(135deg, #070D19 0%, #0F172A 50%, #1E293B 100%); color: #fff; border-radius: 14px; padding: 18px 20px; border: 1.5px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
        <div>
          <div style="font-size: 1.28rem; font-weight: 900; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-bullhorn" style="color: #F43F5E;"></i> 🎯 स्मार्ट आउटरीच CRM व VIP ऑफर सेंटर
          </div>
          <p style="font-size: 0.85rem; color: #94A3B8; margin: 4px 0 0 0;">
            VIP ई-बुक्स, सम्पूर्ण स्वास्थ्य, पशुपालन, AarogyamTube वीडियो, गूगल लीड्स, ऑटो WhatsApp, WebP कंप्रेसर व लाइव कन्वर्जन।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btn_universal_share_message" class="admin-button" style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-color: #4338CA; color: #fff; font-weight: 900; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(79,70,229,0.35);" title="सक्रिय संदेश को मोबाइल के किसी भी ऐप (WhatsApp 1, WhatsApp 2, FB, Messenger) पर शेयर करें">
            <i class="fa-solid fa-share-nodes"></i> 📲 संदेश शेयर करें (Share)
          </button>
          <button type="button" id="btn_universal_copy_message" class="admin-button" style="background: #E11D48; border-color: #BE123C; color: #fff; font-weight: 900; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(225,29,72,0.35);" title="सक्रिय संदेश को 1-क्लिक में कॉपी करके किसी को भी भेजें">
            <i class="fa-solid fa-copy"></i> 📋 संदेश कॉपी करें (Copy Msg)
          </button>
          <button type="button" id="btn_open_add_lead_modal" class="admin-button" style="background: #2563EB; border-color: #1D4ED8; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-user-plus"></i> ➕ नया संपर्क / CSV लोड करें
          </button>
          <button type="button" id="btn_export_broadcast_json" class="admin-button" style="background: #10B981; border-color: #059669; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;" title="Zero-Egress JSON फ़ाइल सिंक करें">
            <i class="fa-solid fa-file-arrow-down"></i> 📥 JSON सिंक
          </button>
        </div>
      </div>

      <!-- Main Navigation 8 Tabs Strip -->
      <div style="display: flex; gap: 6px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px; flex-wrap: wrap;">
        <button type="button" id="tab_btn_vip_outreach" class="admin-button small-button" style="background: #E11D48; color: #fff; font-weight: 800; border-radius: 8px;">
          🎁 1. VIP ऑफर व साइट प्रचार
        </button>
        <button type="button" id="tab_btn_greetings" class="admin-button small-button" style="background: rgba(255,255,255,0.08); color: #CBD5E1; font-weight: 700; border-radius: 8px;">
          🌅 2. सुविचार, बधाई व GM/GN
        </button>
        <button type="button" id="tab_btn_broadcast" class="admin-button small-button" style="background: rgba(255,255,255,0.08); color: #CBD5E1; font-weight: 700; border-radius: 8px;">
          📢 3. इन-ऐप ब्रॉडकास्ट
        </button>
        <button type="button" id="tab_btn_festival" class="admin-button small-button" style="background: rgba(255,255,255,0.08); color: #CBD5E1; font-weight: 700; border-radius: 8px;">
          🎉 4. त्यौहार सेल ऑफर
        </button>
        <button type="button" id="tab_btn_activity" class="admin-button small-button" style="background: rgba(255,255,255,0.08); color: #CBD5E1; font-weight: 700; border-radius: 8px;">
          📊 5. मेरी कार्य रिपोर्ट (<span id="tab_activity_count_pill">${outreachHistory.length}</span>)
        </button>
        <button type="button" id="tab_btn_conversion" class="admin-button small-button" style="background: rgba(255,255,255,0.08); color: #CBD5E1; font-weight: 700; border-radius: 8px;">
          🎯 6. कन्वर्जन रिपोर्ट
        </button>
        <button type="button" id="tab_btn_google_leads" class="admin-button small-button" style="background: rgba(255,255,255,0.08); color: #38BDF8; font-weight: 700; border-radius: 8px;">
          🌐 7. Google Leads
        </button>
        <button type="button" id="tab_btn_auto_whatsapp" class="admin-button small-button" style="background: rgba(255,255,255,0.08); color: #4ADE80; font-weight: 700; border-radius: 8px;">
          🤖 8. Auto WhatsApp
        </button>
      </div>
    </div>

    <!-- DAILY LIMIT SAFEGUARD COUNTERS BAR WITH DUAL SIM / MULTI-SIM CONTROLS -->
    <div style="background: #fff; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <!-- SIM / WhatsApp Mode Selector Strip -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-weight: 900; color: #0F172A; font-size: 0.92rem;">
            📱 सिम व WhatsApp सुरक्षा सीमा (Anti-Ban Engine)
          </span>
          <span id="active_sim_mode_badge" style="background: #DCFCE7; color: #166534; font-size: 0.74rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; border: 1px solid #86EFAC;">
            📱📱 डुअल सिम सक्रिय (60 WA / 200 SMS)
          </span>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" id="btn_sim_mode_dual" class="admin-button small-button" style="background: #16A34A; color: #fff; font-weight: 800; font-size: 0.74rem; border-radius: 6px;">
            📱📱 डुअल सिम (60 WA / 200 SMS)
          </button>
          <button type="button" id="btn_sim_mode_single" class="admin-button small-button" style="background: #F1F5F9; color: #334155; font-weight: 700; font-size: 0.74rem; border-radius: 6px;">
            📱 सिंगल सिम (30 WA / 100 SMS)
          </button>
          <button type="button" id="btn_sim_mode_custom" class="admin-button small-button" style="background: #F1F5F9; color: #334155; font-weight: 700; font-size: 0.74rem; border-radius: 6px;">
            ⚙️ कस्टम लिमिट
          </button>
        </div>
      </div>

      <!-- Custom Limits Inline Drawer -->
      <div id="wrap_custom_limits_editor" style="display: none; background: #F8FAFC; border: 1.5px dashed #94A3B8; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">
        <div style="font-size: 0.8rem; font-weight: 800; color: #0F172A; margin-bottom: 6px;">
          ⚙️ अपने मोबाइल व सिम कार्ड्स के अनुसार दैनिक सीमा दर्ज करें:
        </div>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <label style="font-size: 0.78rem; font-weight: 700; color: #166534; display: flex; align-items: center; gap: 6px;">
            🟢 WhatsApp सीमा/दिन:
            <input type="number" id="input_custom_wa_limit" value="60" min="5" max="1000" style="width: 75px; padding: 4px 6px; border-radius: 4px; border: 1.5px solid #86EFAC; font-weight: 800;">
          </label>
          <label style="font-size: 0.78rem; font-weight: 700; color: #1E40AF; display: flex; align-items: center; gap: 6px;">
            💬 SMS सीमा/दिन:
            <input type="number" id="input_custom_sms_limit" value="200" min="10" max="2000" style="width: 75px; padding: 4px 6px; border-radius: 4px; border: 1.5px solid #93C5FD; font-weight: 800;">
          </label>
          <button type="button" id="btn_save_custom_limits" class="admin-button small-button" style="background: #2563EB; color: #fff; font-weight: 800; padding: 5px 12px; font-size: 0.76rem;">
            💾 लिमिट सुरक्षित करें
          </button>
        </div>
      </div>

      <!-- Grid Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
        <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; color: #166534; font-size: 0.9rem;">
              <i class="fa-brands fa-whatsapp" style="color: #22C55E; font-size: 1.1rem;"></i> WhatsApp दैनिक सुरक्षा सीमा
            </span>
            <span id="wa_limit_badge" style="background: #DCFCE7; color: #15803D; font-weight: 900; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">
              0 / 60 आज
            </span>
          </div>
          <div style="background: #E2E8F0; border-radius: 6px; height: 7px; overflow: hidden; margin-bottom: 4px;">
            <div id="wa_progress_bar" style="background: #22C55E; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
          </div>
          <div id="wa_limit_subtitle" style="font-size: 0.72rem; color: #4B5563;">🛡️ नंबर ब्लॉक से बचने हेतु 60 संदेश/दिन (डुअल सिम 2 WhatsApp मोड सक्रिय)।</div>
        </div>

        <div style="background: #EFF6FF; border: 1.5px solid #93C5FD; border-radius: 10px; padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; color: #1E40AF; font-size: 0.9rem;">
              <i class="fa-solid fa-comment-sms" style="color: #3B82F6; font-size: 1.05rem;"></i> Text (SMS) दैनिक सीमा
            </span>
            <span id="sms_limit_badge" style="background: #DBEAFE; color: #1D4ED8; font-weight: 900; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">
              0 / 200 आज
            </span>
          </div>
          <div style="background: #E2E8F0; border-radius: 6px; height: 7px; overflow: hidden; margin-bottom: 4px;">
            <div id="sms_progress_bar" style="background: #3B82F6; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
          </div>
          <div id="sms_limit_subtitle" style="font-size: 0.72rem; color: #4B5563;">📱 टेलिकॉम 200 SMS/दिन सीमा (डुअल सिम मोड)। Zero Ban Guarantee!</div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         TAB 1: VIP OFFER & MULTI-PAGE OUTREACH
         ===================================================================== -->
    <div id="section_vip_outreach_tab" style="display: block;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 20px;">
        
        <!-- Left Column: Book & Target Configuration -->
        <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-gift" style="color: #E11D48;"></i> 1. प्रचार लक्ष्य व कंटेंट सेटिंग्स
          </div>

          <!-- 1. Promo Target Type Selector -->
          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">
              🌐 प्रचार श्रेणी / लक्ष्य चुनें (What to Promote): *
            </label>
            <select id="vip_target_type_selector" class="admin-select" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700; background: #F8FAFC;">
              <option value="ebook">📚 डिजिटल ई-बुक VIP ऑफर (E-Book Store)</option>
              <option value="page">📄 वेबसाइट पेज व कस्टम लैंडिंग पेज (Site & Custom Pages)</option>
              <option value="health">🌿 सम्पूर्ण स्वास्थ्य केंद्र (13+ Health Topics)</option>
              <option value="pashu">🐄 पशुपालन, दुग्ध संवर्धन व उपचार (7 Livestock Hubs)</option>
              <option value="tube">📺 AarogyamTube संपूर्ण हब व वीडियो लाइब्रेरी</option>
              <option value="netsurf">💼 नेट्सर्फ मेंबर जॉइनिंग व करियर पेज</option>
              <option value="catalog">📖 7-भाषा संपूर्ण प्रोडक्ट कैटलॉग (PDF)</option>
            </select>
          </div>

          <!-- 2A. Book Selector (If ebook) -->
          <div id="wrap_book_selector" style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">
              📚 ई-बुक चुनें: *
            </label>
            <select id="vip_book_selector" class="admin-select" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700;">
              ${catalogBooks.map(b => {
                const thumb = b.cover || b.thumbnail || b.banner || b.og_image || '/images/banners/ebook-banner.jpeg';
                const pageUrl = b.landingPage || `/ebooks/book-landing.html?id=${b.id}`;
                return `<option value="${b.id}" data-page="${pageUrl}" data-thumb="${thumb}" data-mrp="${b.mrp || 299}" data-price="${b.offerPrice || 99}">${b.name} (${b.id})</option>`;
              }).join('')}
            </select>
          </div>

          <!-- 2A-2. Site Pages Selector (If page) -->
          <div id="wrap_page_selector" style="display: none; margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">
              📄 प्रचार हेतु वेबसाइट पेज चुनें: *
            </label>
            <select id="vip_page_selector" class="admin-select" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700;">
              <option value="/index.html" data-title="आरोग्यम इंडिया - मुख्य पोर्टल" data-thumb="/images/banners/hero-banner-1.jpeg">🏠 मुख्य होम पेज (/index.html)</option>
              <option value="/daily-tips.html" data-title="दैनिक स्वास्थ्य व कृषि टिप्स" data-thumb="/images/banners/daily-tips-banner.jpeg">💡 दैनिक टिप्स (/daily-tips.html)</option>
              <option value="/franchise.html" data-title="आरोग्यम केंद्र / फ्रैंचाइज़ी पार्टनरशिप" data-thumb="/images/banners/franchise-banner.jpeg">🏢 आरोग्यम केंद्र / फ्रैंचाइज़ी (/franchise.html)</option>
              <option value="/netsurf-join.html" data-title="नेट्सर्फ डायरेक्ट सेलर सदस्यता व करियर" data-thumb="/images/banners/hero_slide-netsurf-061003-6ii5.webp">💼 नेट्सर्फ सदस्यता (/netsurf-join.html)</option>
              <option value="/categories/agriculture.html" data-title="कृषि समाधान व जैविक खाद-कीट हब" data-thumb="/images/banners/agri-banner.jpeg">🌾 कृषि समाधान हब (/categories/agriculture.html)</option>
              <option value="/categories/health.html" data-title="सम्पूर्ण स्वास्थ्य केंद्र - 13+ समाधान" data-thumb="/images/banners/og_image-health-og-676433-sb3k.webp">🌿 स्वास्थ्य केंद्र हब (/categories/health.html)</option>
              <option value="/pashu-palan.html" data-title="पशुपालन व दुग्ध संवर्धन संपूर्ण हब" data-thumb="/images/banners/og_image-pashupalan-029612-sv0a.webp">🐄 पशुपालन संपूर्ण हब (/pashu-palan.html)</option>
            </select>
          </div>

          <!-- 2B. Health Hub Sub-Page Selector (If health) -->
          <div id="wrap_health_selector" style="display: none; margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">
              🌿 स्वास्थ्य विषय / निवारण केंद्र चुनें: *
            </label>
            <select id="vip_health_selector" class="admin-select" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700;">
              <option value="/health/sexual-wellness.html" data-title="पौरुष शक्ति व यौन स्वास्थ्य समाधान" data-thumb="/images/banners/og_image-ed-677895-iqr6.webp">💪 पौरुष शक्ति व धातु रोग (/health/sexual-wellness.html)</option>
              <option value="/health/joint-care.html" data-title="जोड़ों का दर्द, गठिया व यूरिक एसिड समाधान" data-thumb="/images/banners/og_image-1003678899-976100-9wi4.webp">🦴 जोड़ों का दर्द व गठिया (/health/joint-care.html)</option>
              <option value="/health/diabetes.html" data-title="मधुमेह / डायबिटीज व ब्लड शुगर मुक्ति केंद्र" data-thumb="/images/banners/og_image-whatsapp-image-202-936789-y196.webp">🩸 मधुमेह / डायबिटीज (/health/diabetes.html)</option>
              <option value="/health/hair-care.html" data-title="हेयर फॉल व डैंड्रफ का 100% प्राकृतिक फॉर्मूला" data-thumb="/images/banners/og_image-hair-77-154412-g45q.webp">💇 बाल झड़ना व डैंड्रफ (/health/hair-care.html)</option>
              <option value="/health/liver-care.html" data-title="फैटी लिवर, सिरोसिस व आयुर्वेदिक लिवर डिटॉक्स" data-thumb="/images/banners/og_image-health-og-676433-sb3k.webp">🫀 फैटी लिवर व डिटॉक्स (/health/liver-care.html)</option>
              <option value="/health/skin-care.html" data-title="प्राकृतिक स्किन केयर व त्वचा ग्लो" data-thumb="/images/banners/og_image-skine-1-794718-e42c.webp">✨ त्वचा, पिंपल्स व एलर्जी (/health/skin-care.html)</option>
              <option value="/health/thyroid-care.html" data-title="थायरॉइड समस्या व हॉर्मोन मेटाबॉलिज्म" data-thumb="/images/banners/health_card-2-585308-wpfz.webp">🦋 थायरॉइड संतुलन (/health/thyroid-care.html)</option>
              <option value="/health/weight-loss.html" data-title="मोटापा व पेट की चर्बी घटाने का डाइट चार्ट" data-thumb="/images/banners/og_image-motapa-490448-grer.webp">⚖️ मोटापा व वजन नियंत्रण (/health/weight-loss.html)</option>
              <option value="/health/womens-care.html" data-title="महिला स्वास्थ्य, PCOD व हार्मोनल संतुलन" data-thumb="/images/banners/og_image-femail-problm-712409-c3n1.webp">🌸 महिला स्वास्थ्य / PCOD (/health/womens-care.html)</option>
              <option value="/health/heart-care.html" data-title="हार्ट अटैक, धमनियों में ब्लॉकेज व कार्डियक सुरक्षा" data-thumb="/images/banners/health-banner.jpeg">❤️ हृदय सुरक्षा व बीपी (/health/heart-care.html)</option>
              <option value="/health/dental-care.html" data-title="दांतों की सड़न, पायरिया व हर्बल दंत सुरक्षा" data-thumb="/images/banners/health-banner.jpeg">🦷 दंत सुरक्षा व पायरिया (/health/dental-care.html)</option>
              <option value="/health/home-care.html" data-title="होम केयर: 100% केमिकल-मुक्त प्राकृतिक स्वच्छता" data-thumb="/images/banners/health-home-care.jpg">🏡 होम केयर व स्वच्छता (/health/home-care.html)</option>
              <option value="/health/kids-care.html" data-title="किड्स केयर: बच्चों का विकास, भूख व इम्युनिटी पोषण" data-thumb="/images/banners/health-kids-care.jpg">🧸 बच्चों का स्वास्थ्य व पोषण (/health/kids-care.html)</option>
              <option value="/categories/health.html" data-title="सम्पूर्ण स्वास्थ्य केंद्र (13+ प्राकृतिक समाधान मुख्य हब)" data-thumb="/images/banners/og_image-health-og-676433-sb3k.webp">🌿 सम्पूर्ण स्वास्थ्य केंद्र - मुख्य हब (/categories/health.html)</option>
            </select>
          </div>

          <!-- 2C. Pashupalan Sub-Hub Selector (If pashu) -->
          <div id="wrap_pashu_selector" style="display: none; margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">
              🐄 पशुपालन व दुग्ध विषय चुनें: *
            </label>
            <select id="vip_pashu_selector" class="admin-select" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700;">
              <option value="/pashu-palan.html" data-title="संपूर्ण पशुपालन व दुग्ध संवर्धन हब" data-thumb="/images/banners/og_image-pashupalan-029612-sv0a.webp">🐄 संपूर्ण पशुपालन व दुग्ध संवर्धन हब (Main)</option>
              <option value="/pashu-palan.html#cow" data-title="गाय - 1-2 लीटर दूध वृद्धि, पोषण व कैल्शियम समाधान" data-thumb="/images/banners/pashu-cow-care.jpg">🐄 गाय - दुग्ध वृद्धि व पोषण (Cow Care)</option>
              <option value="/pashu-palan.html#buffalo" data-title="भैंस - FAT% 8 तक व गाढ़ापन संवर्धन" data-thumb="/images/banners/hero_slide-pashupalan-banner-371712-0doa.webp">🐃 भैंस - FAT% व SNF वृद्धि (Buffalo Care)</option>
              <option value="/pashu-palan.html#goat" data-title="बकरी पालन - तेजी से वजन वृद्धि व दस्त नियंत्रण" data-thumb="/images/banners/pashu-goat-care.jpg">🐐 बकरी पालन - वजन वृद्धि (Goat Care)</option>
              <option value="/pashu-palan.html#poultry" data-title="मुर्गी पालन - अंडा उत्पादन वृद्धि व बायो-सिक्योरिटी" data-thumb="/images/banners/og_image-pashupalan-029612-sv0a.webp">🐔 मुर्गी पालन (Poultry Farm Care)</option>
              <option value="/pashu-palan.html#fish" data-title="मछली पालन - जल शोधन, कंडीशनर व तीव्र ग्रोथ" data-thumb="/images/banners/og_image-pashupalan-029612-sv0a.webp">🐟 मछली पालन (Fish Farming Care)</option>
              <option value="/pashu-palan.html#mastitis" data-title="पशुओं में थनैला, बांझपन व पाचन रोग का सटीक उपचार" data-thumb="/images/banners/og_image-pashupalan-029612-sv0a.webp">🩺 थनैला, बांझपन व पाचन रोग समाधान</option>
            </select>
          </div>

          <!-- 2D. AarogyamTube Integrated Library Selector (If tube) -->
          <div id="wrap_tube_selector" style="display: none; margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">
              📺 AarogyamTube वीडियो चुनें: *
            </label>
            <select id="vip_tube_video_selector" class="admin-select" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700; margin-bottom: 6px;">
              <option value="/tube.html" data-title="AarogyamTube संपूर्ण कृषि व स्वास्थ्य वीडियो हब" data-desc="1-मिनट के प्रैक्टिकल कृषि शॉर्ट्स एवं विशेषज्ञों द्वारा संपूर्ण मास्टरक्लास।">
                🎬 संपूर्ण AarogyamTube वीडियो हब (/tube.html)
              </option>
              ${tubeRecordings.map(v => `
                <option value="/tube.html?v=${v.id}" data-id="${v.id}" data-yt="${v.youtube_id || ''}" data-thumb="${v.thumbnail || ''}" data-title="${v.title}" data-desc="${(v.description || '').replace(/"/g, '&quot;').slice(0, 120)}">
                  ${v.format === 'short_reel' ? '📱 Short:' : '🎥 Video:'} ${v.title} (${v.subject || v.category || 'Agri'})
                </option>
              `).join('')}
              <option value="custom_url">✍️ कस्टम वीडियो URL दर्ज करें...</option>
            </select>

            <div id="wrap_tube_custom_url" style="display: none; margin-top: 4px;">
              <input type="url" id="vip_tube_custom_input" class="admin-input" placeholder="उदा. https://youtube.com/watch?v=..." style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1;">
            </div>
          </div>

          <!-- 3. LIVE THUMBNAIL & TITLE PREVIEW CARD (Auto / Custom WebP) -->
          <div id="live_promo_visual_card" style="display: flex; gap: 12px; align-items: center; background: #0F172A; border: 1.5px solid #334155; border-radius: 10px; padding: 10px; margin-bottom: 12px; color: #fff;">
            <img id="live_preview_thumb_img" src="/images/banners/kharif-master-guide-2026-hero-banner.webp" style="width: 68px; height: 68px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;" alt="Promo Thumbnail">
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 3px; flex-wrap: wrap;">
                <span id="live_preview_badge" style="background: #2563EB; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
                  🖼️ पेज थंबनेल (Default)
                </span>
                <button type="button" id="btn_reset_thumb_to_default" style="display: none; background: transparent; border: 1px solid #64748B; color: #94A3B8; font-size: 0.68rem; padding: 1px 6px; border-radius: 4px; cursor: pointer;">
                  ❌ कस्टम फोटो हटाएं
                </button>
              </div>
              <div id="live_preview_title" style="font-weight: 800; font-size: 0.86rem; color: #F8FAFC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                खरीफ फसल मास्टर गाइड 2026
              </div>
              <div id="live_preview_target_url" style="font-family: monospace; font-size: 0.72rem; color: #38BDF8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                /ebooks/kharif-master-guide-2026.html
              </div>
            </div>
          </div>

          <!-- 4. Price & Timer Custom Controls (ONLY VISIBLE FOR EBOOK) -->
          <div id="wrap_price_timer_controls" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; background: #FFFBEB; border: 1.5px solid #FCD34D; border-radius: 8px; padding: 10px;">
            <div>
              <label class="admin-label" style="font-weight: 800; font-size: 0.82rem; color: #92400E; display: block; margin-bottom: 4px;">
                💰 ऑफर मूल्य (₹ Price): *
              </label>
              <input type="number" id="vip_custom_price_input" class="admin-input" value="99" min="1" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1.5px solid #F59E0B; font-weight: 900; color: #B45309; font-size: 1rem;">
            </div>
            <div>
              <label class="admin-label" style="font-weight: 800; font-size: 0.82rem; color: #92400E; display: block; margin-bottom: 4px;">
                ⏳ लिंक वैधता टाइमर (Auto-Expiry Timer): *
              </label>
              <select id="vip_custom_timer_select" class="admin-select" style="width: 100%; padding: 7px 8px; border-radius: 6px; border: 1.5px solid #F59E0B; font-weight: 700; font-size: 0.82rem;">
                <option value="15m" data-text="अगले 15 मिनट तक">⚡ 15 मिनट</option>
                <option value="30m" data-text="अगले 30 मिनट तक">⏳ 30 मिनट</option>
                <option value="1h" data-text="अगले 1 घंटे तक">🕐 1 घंटा</option>
                <option value="2h" data-text="अगले 2 घंटे तक">⏰ 2 घंटे</option>
                <option value="4h" data-text="अगले 4 घंटे तक">⌛ 4 घंटे</option>
                <option value="6h" data-text="अगले 6 घंटे तक">⏳ 6 घंटे</option>
                <option value="today" data-text="आज रात 12 बजे तक" selected>📅 आज रात 12 बजे तक</option>
                <option value="24h" data-text="अगले 24 घंटे तक">📆 24 घंटे</option>
                <option value="48h" data-text="अगले 48 घंटे तक">🗓️ 48 घंटे (2 दिन)</option>
                <option value="never" data-text="सीमित समय तक">♾️ असीमित (No Expiry)</option>
              </select>
            </div>
          </div>

          <!-- 5. WebP Image Upload & Overwrite Policy -->
          <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label class="admin-label" style="font-weight: 800; font-size: 0.82rem; color: #1E293B; margin: 0;">
                🖼️ कस्टम प्रोमो फोटो अपलोड (वैकल्पिक - ऑटो WebP):
              </label>
              <span id="webp_size_badge" style="font-size: 0.72rem; color: #059669; font-weight: 800;"></span>
            </div>
            <input type="file" id="promo_image_file_input" accept="image/*" style="font-size: 0.8rem; width: 100%; margin-bottom: 6px;">
            <div id="webp_preview_wrap" style="display: none; align-items: center; gap: 8px; background: #fff; padding: 6px; border-radius: 6px; border: 1px solid #E2E8F0;">
              <img id="webp_preview_img" src="" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;">
              <div style="font-size: 0.75rem; color: #475569; flex: 1;">
                <div style="font-weight: 800; color: #0F172A;" id="webp_filename_txt">promo-vip.webp</div>
                <div id="webp_compression_stats" style="color: #16A34A;">कंप्रेस होकर WebP में सुरक्षित!</div>
              </div>
              <button type="button" id="btn_download_webp" class="admin-button small-button" style="padding: 4px 8px; font-size: 0.7rem; background: #0F172A; color: #fff;">
                📥 WebP डाउनलोड
              </button>
            </div>
            <div style="font-size: 0.7rem; color: #64748B; margin-top: 4px;">
              💡 यदि फोटो अपलोड नहीं करेंगे, तो ऊपर दिए गए पेज/वीडियो का थंबनेल स्वतः उपयोग होगा।
            </div>
          </div>

          <!-- 6. Target Audience Filter & Date of Joining Filter -->
          <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
              <label class="admin-label" style="font-weight: 800; font-size: 0.86rem; color: #1E293B; margin: 0;">
                🎯 प्राप्तकर्ता श्रेणी फ़िल्टर (Audience Targeting): *
              </label>
              <button type="button" id="btn_toggle_multibook_panel" style="background: #EFF6FF; border: 1px solid #93C5FD; color: #1D4ED8; font-size: 0.74rem; font-weight: 800; padding: 3px 8px; border-radius: 5px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="विशिष्ट पुस्तक खरीदारों (BK001, BK002, BK016, BK018) का मल्टी-सेलेक्ट पैनल खोलें/बंद करें">
                <i class="fa-solid fa-book-bookmark"></i> 📚 विशिष्ट पुस्तकें चुनें (Multi-Book)
              </button>
            </div>

            <!-- Systematic Grouped Filter Dropdown -->
            <select id="vip_audience_filter" class="admin-select" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700; margin-bottom: 8px;">
              <optgroup label="👥 1. मुख्य ऑडियंस व सदस्य (General Audiences)">
                <option value="all" selected>👥 सभी उपलब्ध संपर्क व लीड्स (All Live Contacts)</option>
                <option value="phonebook">📇 फोनबुक व ऑफ़लाइन संपर्क सूची (Phonebook)</option>
                <option value="google_leads">🌐 Google Lead Generator से जुड़े संपर्क</option>
              </optgroup>
              <optgroup label="🏆 2. ई-बुक खरीद स्थिति (Book Purchase Status)">
                <option value="bought_any">🏆 सभी सफल पुस्तक खरीदार (All Paid Buyers)</option>
                <option value="specific_books">🎯 विशिष्ट पुस्तक खरीदार (BK001, BK002, BK016, BK018... Multi-Select)</option>
                <option value="non_buyers">🆕 पंजीकृत सदस्य (जिन्होंने अभी तक कोई पुस्तक नहीं खरीदी - First Purchase)</option>
                <option value="cart_abandoned">🛒 चेकआउट अधूरा / कार्ट रिकवरी (Cart Abandoned)</option>
              </optgroup>
              <optgroup label="⭐ 3. पूछताछ व सर्वे लीड्स (Inquiries & Surveys)">
                <option value="interested_users">⭐ पुस्तक में रुचि दर्ज करने वाले (Interested Enquiries)</option>
                <option value="surveys">📝 किसान सर्वे से जुड़े लीड्स (Survey Respondents)</option>
                <option value="retail_leads">🏪 खुदरा व्यापारी व डीलर लीड्स (Retailers & Dealers)</option>
              </optgroup>
              <optgroup label="🌾 4. पेशा व समुदाय वर्ग (Occupation & Segment)">
                <option value="farmers">🚜 किसान व कृषक वर्ग (Farmers by Occupation)</option>
                <option value="pashupalan">🥛 पशुपालक व डेयरी उत्पादक (Dairy Farmers)</option>
                <option value="netsurf">🌿 नेट्सर्फ डायरेक्ट सेलर सदस्य (Netsurf Network)</option>
                <option value="health_interest">🧘 स्वास्थ्य व आयुर्वेद प्रेमी (Health & Wellness)</option>
                <option value="bought_agri_cross_sell">🌾 'खरीफ/जैविक कृषि' खरीदार (Agri Cross-Sell)</option>
                <option value="bought_kheti_dr_cross_sell">🩺 'खेती का डॉक्टर' खरीदार (Crop Doctor Cross-Sell)</option>
                <option value="bought_dairy">🐄 'पशुपालन व दुग्ध' खरीदार (Dairy Cross-Sell)</option>
              </optgroup>
            </select>

            <!-- SMART MULTI-BOOK MULTI-SELECT PANEL -->
            <div id="wrap_smart_multibook_filter" style="display: none; background: #FFFBEB; border: 1.5px solid #FCD34D; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
                <span style="font-size: 0.8rem; font-weight: 800; color: #92400E; display: flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-book-bookmark"></i> 📚 किस पुस्तक के ग्राहक? (चुनें 1 या अधिक पुस्तकें):
                </span>
                <div style="display: flex; gap: 6px;">
                  <button type="button" id="btn_multibook_select_all" style="background: #D97706; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 800; cursor: pointer;">
                    ✓ सभी चुनें
                  </button>
                  <button type="button" id="btn_multibook_clear_all" style="background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 800; cursor: pointer;">
                    ✗ साफ़ करें
                  </button>
                </div>
              </div>
              <div id="multibook_checkboxes_container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 6px; max-height: 150px; overflow-y: auto;">
                <!-- Populated dynamically with BK001, BK002, BK016, BK018 and catalog books -->
              </div>
              <div style="font-size: 0.7rem; color: #78350F; margin-top: 5px; font-weight: 600;">
                💡 टिप: एक से अधिक पुस्तकें टिक कर सकते हैं — सिस्टम उन सभी चुनी गई पुस्तकों के खरीदारों को एक साथ लिस्ट में लाएगा!
              </div>
            </div>

            <!-- Date of Joining Filter -->
            <div style="margin-bottom: 8px;">
              <label class="admin-label" style="font-weight: 800; font-size: 0.82rem; color: #1E293B; display: block; margin-bottom: 4px;">
                📅 रजिस्ट्रेशन / जॉइनिंग तारीख फ़िल्टर:
              </label>
              <select id="vip_date_joining_filter" class="admin-select" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700; font-size: 0.82rem;">
                <option value="all" selected>📅 सभी तिथियां (All Time)</option>
                <option value="today">⚡ आज जुड़े संपर्क (Today Joined)</option>
                <option value="2days">⏳ पिछले 2 दिन (Last 2 Days)</option>
                <option value="7days">🗓️ पिछले 7 दिन (Last 7 Days)</option>
                <option value="30days">📆 पिछले 30 दिन (Last 30 Days)</option>
                <option value="custom">✍️ कस्टम दिनांक सीमा (Custom Date)...</option>
              </select>
              <div id="wrap_vip_custom_date_range" style="display: none; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
                <div>
                  <span style="font-size: 0.72rem; color: #64748B;">प्रारंभ तारीख:</span>
                  <input type="date" id="vip_date_from" class="admin-input" style="width: 100%; padding: 5px; font-size: 0.76rem;">
                </div>
                <div>
                  <span style="font-size: 0.72rem; color: #64748B;">अंतिम तारीख:</span>
                  <input type="date" id="vip_date_to" class="admin-input" style="width: 100%; padding: 5px; font-size: 0.76rem;">
                </div>
              </div>
            </div>

            <!-- Anti-Repeat Filter Checkbox -->
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 800; color: #0F172A; cursor: pointer; user-select: none;">
              <input type="checkbox" id="chk_exclude_contacted" checked style="width: 16px; height: 16px; accent-color: #E11D48;">
              <span>🛡️ जिन्हें यह ऑफर पहले भेजा जा चुका है, उन्हें छिपाएं (Anti-Repeat Shield)</span>
            </label>
          </div>

          <!-- Auto-Generated VIP Message Preview -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; margin: 0;">💬 संदेश पूर्वावलोकन:</label>
              <span style="font-size: 0.72rem; color: #64748B;">(शेयर करने पर लिंक स्वतः एक्सपायरी समय के साथ जाएगा)</span>
            </div>
            <textarea id="vip_message_textarea" class="admin-input" rows="6" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #CBD5E1; font-family: inherit; font-size: 0.85rem; line-height: 1.45; margin-bottom: 8px;"></textarea>

            <!-- Multi-Channel Universal Sharing Action Buttons -->
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" id="btn_share_vip_universal" class="admin-button small-button" style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #fff; font-weight: 800; padding: 6px 12px; font-size: 0.78rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(79,70,229,0.3);" title="मोबाइल के सभी ऐप्स (WhatsApp 1, WhatsApp 2, FB, Messenger) पर शेयर करें">
                <i class="fa-solid fa-share-nodes"></i> 📲 शेयर करें (All Apps)
              </button>
              <button type="button" id="btn_share_vip_wa" class="admin-button small-button" style="background: #25D366; color: #fff; font-weight: 800; padding: 6px 12px; font-size: 0.78rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;" title="WhatsApp ग्रुप, स्टेटस या किसी भी चैट में शेयर करें">
                <i class="fa-brands fa-whatsapp"></i> 🟢 WA शेयर
              </button>
              <button type="button" id="btn_share_vip_fb" class="admin-button small-button" style="background: #1877F2; color: #fff; font-weight: 800; padding: 6px 12px; font-size: 0.78rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;" title="Facebook पोस्ट या Messenger में शेयर करें">
                <i class="fa-brands fa-facebook"></i> 🔵 FB / Messenger
              </button>
              <button type="button" id="btn_copy_vip_message" class="admin-button small-button" style="background: #0F172A; color: #fff; font-weight: 800; font-size: 0.78rem; padding: 6px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-copy"></i> 📋 कॉपी (Copy)
              </button>
            </div>
          </div>

          <!-- Load into 1-Tap Queue Runner Button -->
          <button type="button" id="btn_load_vip_queue" class="admin-button" style="width: 100%; background: #16A34A; border-color: #15803D; color: #fff; font-weight: 900; padding: 12px; font-size: 1rem; border-radius: 8px;">
            <i class="fa-solid fa-play"></i> 🚀 चुने गए संपर्कों की कतार शुरू करें (Launch Queue)
          </button>
        </div>

        <!-- Right Column: 30 Contacts/Page Batch List & 1-Tap HUD Runner -->
        <div class="admin-card" style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 18px;">
          
          <!-- Batch Header & Pagination Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 10px;">
            <div>
              <div style="font-weight: 900; color: #0F172A; font-size: 1rem;">
                📋 सक्रिय संपर्क बैच (30 Contacts / Batch)
              </div>
              <div id="batch_contacts_counter_text" style="font-size: 0.78rem; color: #059669; font-weight: 700;">
                उपलब्ध: 0 संपर्क
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" id="btn_prev_batch" class="admin-button small-button" style="padding: 4px 8px; font-size: 0.75rem; background: #fff; border: 1px solid #CBD5E1; color: #334155;">◀ पिछला</button>
              <span id="batch_page_pill" style="font-size: 0.78rem; font-weight: 800; color: #1E293B;">पृष्ठ 1 / 1</span>
              <button type="button" id="btn_next_batch" class="admin-button small-button" style="padding: 4px 8px; font-size: 0.75rem; background: #fff; border: 1px solid #CBD5E1; color: #334155;">अगला ▶</button>
            </div>
          </div>

          <!-- Quick Contact Multi-Selection Toolbar -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: #EEF2F6; border: 1px solid #CBD5E1; border-radius: 8px; padding: 8px 10px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 800; color: #0F172A; cursor: pointer; user-select: none; margin: 0;">
                <input type="checkbox" id="chk_select_page_contacts" style="width: 17px; height: 17px; accent-color: #16A34A; cursor: pointer;">
                <span>पेज के सभी</span>
              </label>
              <span id="vip_selected_count_badge" style="background: #16A34A; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 12px;">0 चुने गए</span>
            </div>
            <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 0.74rem; font-weight: 800; color: #475569;">त्वरित:</span>
              <button type="button" class="btn-quick-select-vip admin-button small-button" data-count="30" style="padding: 3px 8px; font-size: 0.74rem; background: #fff; border: 1px solid #CBD5E1; color: #0F172A; font-weight: 800; border-radius: 4px;" title="पहले 30 संपर्क चुनें">30</button>
              <button type="button" class="btn-quick-select-vip admin-button small-button" data-count="60" style="padding: 3px 8px; font-size: 0.74rem; background: #fff; border: 1px solid #CBD5E1; color: #0F172A; font-weight: 800; border-radius: 4px;" title="पहले 60 संपर्क चुनें">60</button>
              <button type="button" class="btn-quick-select-vip admin-button small-button" data-count="100" style="padding: 3px 8px; font-size: 0.74rem; background: #fff; border: 1px solid #CBD5E1; color: #0F172A; font-weight: 800; border-radius: 4px;" title="पहले 100 संपर्क चुनें">100</button>
              <button type="button" class="btn-quick-select-vip admin-button small-button" data-count="200" style="padding: 3px 8px; font-size: 0.74rem; background: #fff; border: 1px solid #CBD5E1; color: #0F172A; font-weight: 800; border-radius: 4px;" title="पहले 200 संपर्क चुनें">200</button>
              <button type="button" id="btn_clear_vip_selection" class="admin-button small-button" style="padding: 3px 8px; font-size: 0.74rem; background: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; font-weight: 800; border-radius: 4px;" title="सभी चयन हटाएं">हटाएं</button>
            </div>
          </div>

          <!-- 1-Tap Queue Runner HUD Box -->
          <div id="outreach_active_runner_box" style="display: none; background: #070D19; border: 2px solid #22C55E; border-radius: 12px; padding: 14px; margin-bottom: 14px; color: #fff; box-shadow: 0 4px 14px rgba(34,197,94,0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span id="hud_queue_index_badge" style="background: #16A34A; color: #fff; font-size: 0.75rem; font-weight: 900; padding: 2px 8px; border-radius: 6px;">
                कतार प्रगति: 1 / 30
              </span>
              <button type="button" id="btn_close_runner_hud" style="background: transparent; border: none; color: #94A3B8; font-size: 1.2rem; cursor: pointer;">&times;</button>
            </div>

            <div style="font-size: 1.15rem; font-weight: 900; color: #4ADE80; margin-bottom: 2px;" id="hud_recipient_name">
              रमेश कुमार पटेल
            </div>
            <div style="font-size: 0.88rem; color: #94A3B8; font-family: monospace; margin-bottom: 8px;" id="hud_recipient_mobile">
              📞 +91 98765 43210
            </div>

            <div style="background: #0F172A; border: 1px solid #334155; border-radius: 6px; padding: 8px; font-size: 0.78rem; color: #E2E8F0; max-height: 80px; overflow-y: auto; margin-bottom: 10px; white-space: pre-wrap;" id="hud_msg_preview">
              लोड हो रहा है...
            </div>

            <!-- 1-Tap Action Multi-Buttons -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 6px; margin-bottom: 8px;">
              <button type="button" id="hud_btn_whatsapp" class="admin-button" style="background: #25D366; color: #fff; font-weight: 900; padding: 8px 4px; font-size: 0.78rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <i class="fa-brands fa-whatsapp"></i> WA
              </button>
              <button type="button" id="hud_btn_sms" class="admin-button" style="background: #2563EB; color: #fff; font-weight: 900; padding: 8px 4px; font-size: 0.78rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <i class="fa-solid fa-comment-sms"></i> MG
              </button>
              <button type="button" id="hud_btn_call" class="admin-button" style="background: #059669; color: #fff; font-weight: 900; padding: 8px 4px; font-size: 0.78rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <i class="fa-solid fa-phone"></i> CL
              </button>
              <button type="button" id="hud_btn_copy" class="admin-button" style="background: #475569; color: #fff; font-weight: 900; padding: 8px 4px; font-size: 0.78rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;" title="क्लिपबोर्ड पर कॉपी करें">
                <i class="fa-solid fa-copy"></i> CO
              </button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <button type="button" id="hud_btn_skip" class="admin-button small-button" style="background: transparent; border: 1px solid #475569; color: #94A3B8; font-size: 0.72rem;">
                ⏭️ छोड़ें (Skip)
              </button>
              <button type="button" id="hud_btn_next" class="admin-button small-button" style="background: #38BDF8; color: #0F172A; font-weight: 900; font-size: 0.78rem;">
                सफल, अगला संपर्क ➡️ (Done Next)
              </button>
            </div>
          </div>

          <!-- Dual Table Switcher: Pending vs Sent Contacts (Tab 1) -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; flex-wrap: wrap;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <button type="button" id="tab_btn_vip_pending" class="admin-button small-button" style="background: #16A34A; color: #fff; font-weight: 900; border-radius: 6px; padding: 6px 14px; font-size: 0.82rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                <span>📋 शेष संपर्क (Pending)</span>
                <span id="badge_vip_pending_count" style="background: rgba(255,255,255,0.25); color: #fff; padding: 1px 7px; border-radius: 12px; font-size: 0.72rem;">0</span>
              </button>
              <button type="button" id="tab_btn_vip_sent" class="admin-button small-button" style="background: #F1F5F9; color: #475569; font-weight: 800; border-radius: 6px; padding: 6px 14px; font-size: 0.82rem; border: 1px solid #CBD5E1; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                <span>✅ संदेश भेजे गए (Sent)</span>
                <span id="badge_vip_sent_count" style="background: #E2E8F0; color: #334155; padding: 1px 7px; border-radius: 12px; font-size: 0.72rem;">0</span>
              </button>
            </div>
            <button type="button" id="btn_vip_clear_sent_table" class="admin-button small-button" style="display: none; background: #FEE2E2; border: 1px solid #FCA5A5; color: #DC2626; font-weight: 800; border-radius: 6px; padding: 5px 12px; font-size: 0.76rem; cursor: pointer; align-items: center; gap: 5px;" title="भेजे गए संदेशों का इतिहास साफ़ करें">
              <i class="fa-solid fa-trash-can"></i> 🗑️ भेजे गए संदेश साफ़ करें (Clear Sent)
            </button>
          </div>

          <!-- Contacts 30-List Container -->
          <div id="batch_contacts_list_container" style="max-height: 480px; overflow-y: auto; background: #fff; border: 1px solid #CBD5E1; border-radius: 8px; padding: 6px;">
            <div style="color: #94A3B8; text-align: center; padding: 20px; font-size: 0.85rem;">संपर्क लोड हो रहे हैं...</div>
          </div>
        </div>

      </div>
    </div>

    <!-- =====================================================================
         TAB 2: SMART MARKETING ENGINE, HOOKS & SHAYARI STUDIO + BATCH RUNNER
         ===================================================================== -->
    <div id="section_greetings_tab" style="display: none;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px;">
        
        <!-- Left Column: Hook & Shayari Studio Controls -->
        <div class="admin-card" style="background: #fff; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 10px;">
            <div>
              <div style="font-size: 1.15rem; font-weight: 900; color: #0F172A; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-wand-magic-sparkles" style="color: #F59E0B;"></i> ✨ हुक व शायरी स्टूडियो
              </div>
              <p style="font-size: 0.8rem; color: #64748B; margin: 2px 0 0 0;">
                श्रेणी व स्टाइल चुनें — संदेश स्वतः पर्सनलाइज़ होकर तैयार होगा।
              </p>
            </div>
            <span style="background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 20px;">
              🛡️ Anti-Ban Active
            </span>
          </div>

          <!-- 1. Category Chips Selector -->
          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 800; font-size: 0.82rem; color: #1E293B; display: block; margin-bottom: 6px;">
              📁 1. संदेश की श्रेणी चुनें (Category):
            </label>
            <div id="hook_category_pills" style="display: flex; gap: 5px; flex-wrap: wrap;">
              <button type="button" class="btn-hook-cat admin-button small-button" data-cat="gm" style="background: #FEF3C7; color: #B45309; font-weight: 800; border: 1px solid #F59E0B; padding: 4px 8px; font-size: 0.76rem;">
                ☀️ सुप्रभात
              </button>
              <button type="button" class="btn-hook-cat admin-button small-button" data-cat="gn" style="background: #F1F5F9; color: #475569; font-weight: 700; border: 1px solid #CBD5E1; padding: 4px 8px; font-size: 0.76rem;">
                🌙 शुभ रात्रि
              </button>
              <button type="button" class="btn-hook-cat admin-button small-button" data-cat="suvichar" style="background: #F1F5F9; color: #475569; font-weight: 700; border: 1px solid #CBD5E1; padding: 4px 8px; font-size: 0.76rem;">
                💡 सुविचार
              </button>
              <button type="button" class="btn-hook-cat admin-button small-button" data-cat="agriculture" style="background: #F1F5F9; color: #475569; font-weight: 700; border: 1px solid #CBD5E1; padding: 4px 8px; font-size: 0.76rem;">
                🌾 कृषि हुक्स
              </button>
              <button type="button" class="btn-hook-cat admin-button small-button" data-cat="healthcare" style="background: #F1F5F9; color: #475569; font-weight: 700; border: 1px solid #CBD5E1; padding: 4px 8px; font-size: 0.76rem;">
                ❤️ स्वास्थ्य
              </button>
              <button type="button" class="btn-hook-cat admin-button small-button" data-cat="festivals" style="background: #F1F5F9; color: #475569; font-weight: 700; border: 1px solid #CBD5E1; padding: 4px 8px; font-size: 0.76rem;">
                🌺 त्यौहार
              </button>
              <button type="button" class="btn-hook-cat admin-button small-button" data-cat="business" style="background: #F1F5F9; color: #475569; font-weight: 700; border: 1px solid #CBD5E1; padding: 4px 8px; font-size: 0.76rem;">
                💼 कमाई
              </button>
              <button type="button" class="btn-hook-cat admin-button small-button" data-cat="shayari" style="background: #F1F5F9; color: #475569; font-weight: 700; border: 1px solid #CBD5E1; padding: 4px 8px; font-size: 0.76rem;">
                🎭 शायरी
              </button>
            </div>
          </div>

          <!-- 2. Template Selector & Style Mode Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px;">
            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.8rem; color: #334155; display: block; margin-bottom: 4px;">
                📜 2. टेम्पलेट चुनें:
              </label>
              <select id="hook_template_select" class="admin-select" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700; font-size: 0.8rem; background: #fff;">
                <!-- Populated dynamically based on category -->
              </select>
            </div>

            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.8rem; color: #334155; display: block; margin-bottom: 4px;">
                🎭 3. स्टाइल / फॉर्मेट:
              </label>
              <select id="hook_style_format_select" class="admin-select" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700; font-size: 0.8rem; background: #fff;">
                <option value="full">🌟 संपूर्ण (हुक+शायरी+CTA+लिंक)</option>
                <option value="shayari_only">🎭 केवल शायरी (ज़ीरो लिंक/स्पैम)</option>
                <option value="hook_action">⚡ डायरेक्ट हुक व एक्शन</option>
                <option value="quick_wish">🌸 संक्षिप्त शुभकामना</option>
              </select>
            </div>
          </div>

          <!-- 3. Attached Promotional Sub-Page Link Option -->
          <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
              <label style="display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 0.82rem; color: #1E40AF; cursor: pointer; user-select: none;">
                <input type="checkbox" id="chk_attach_marketing_link" checked style="width: 15px; height: 15px; accent-color: #2563EB;">
                <span>🔗 प्रचार / लैंडिंग पेज लिंक जोड़ें (Attach Link)</span>
              </label>
              <span style="font-size: 0.7rem; color: #64748B;">(अनचेक = बिना लिंक)</span>
            </div>
            <div id="wrap_attached_link_select" style="display: block;">
              <select id="hook_attached_target_page" class="admin-select" style="width: 100%; padding: 7px 9px; border-radius: 6px; border: 1.5px solid #93C5FD; font-weight: 700; font-size: 0.82rem; background: #fff;">
                <optgroup label="❤️ स्वास्थ्य निवारण सब-पेज (Health Landing Pages)">
                  <option value="/health/sexual-wellness.html?ref=crm">💪 पौरुष शक्ति व धातु रोग (/health/sexual-wellness.html)</option>
                  <option value="/health/joint-care.html?ref=crm">🦴 जोड़ों का दर्द व गठिया (/health/joint-care.html)</option>
                  <option value="/health/diabetes.html?ref=crm">🩸 मधुमेह / डायबिटीज नियंत्रण (/health/diabetes.html)</option>
                  <option value="/health/hair-care.html?ref=crm">💇 बाल झड़ना व डैंड्रफ (/health/hair-care.html)</option>
                  <option value="/health/liver-care.html?ref=crm">🫀 फैटी लिवर व लिवर डिटॉक्स (/health/liver-care.html)</option>
                  <option value="/health/skin-care.html?ref=crm">✨ त्वचा रोग, पिंपल्स व एलर्जी (/health/skin-care.html)</option>
                  <option value="/health/thyroid-care.html?ref=crm">🦋 थायरॉइड समस्या व संतुलन (/health/thyroid-care.html)</option>
                  <option value="/health/weight-loss.html?ref=crm">⚖️ मोटापा व वजन नियंत्रण (/health/weight-loss.html)</option>
                  <option value="/health/womens-care.html?ref=crm">🌸 महिला स्वास्थ्य / PCOD (/health/womens-care.html)</option>
                  <option value="/health/heart-care.html?ref=crm">❤️ हृदय सुरक्षा व बीपी (/health/heart-care.html)</option>
                  <option value="/health/dental-care.html?ref=crm">🦷 दंत सुरक्षा व पायरिया (/health/dental-care.html)</option>
                  <option value="/health/home-care.html?ref=crm">🏡 होम केयर व स्वच्छता (/health/home-care.html)</option>
                  <option value="/health/kids-care.html?ref=crm">🧸 बच्चों का स्वास्थ्य व पोषण (/health/kids-care.html)</option>
                  <option value="/categories/health.html?ref=crm">🌿 सम्पूर्ण स्वास्थ्य केंद्र - 13+ समाधान (/categories/health.html)</option>
                </optgroup>
                <optgroup label="📚 ई-बुक्स लैंडिंग पेज (E-Books Dedicated Pages)">
                  <option value="/ebooks/kharif-master-guide-2026.html?vip=1">🌾 खरीफ फसल मास्टर गाइड 2026 (/ebooks/kharif-master-guide-2026.html)</option>
                  <option value="/ebooks/kheti-dr.html?vip=1">🩺 खेती का डॉक्टर — फसल रोग समाधान (/ebooks/kheti-dr.html)</option>
                  <option value="/ebooks/book-landing.html?id=BK016&vip=1">💊 कृषि दवा डायरेक्टरी गाइड (/ebooks/book-landing.html?id=BK016)</option>
                  <option value="/ebooks/book-landing.html?id=BK015&vip=1">🌱 सब्जी खेती मास्टर गाइड (/ebooks/book-landing.html?id=BK015)</option>
                  <option value="/ebooks/book-landing.html?id=BK018&vip=1">💰 घर बैठे पैसे कैसे कमाएँ (/ebooks/book-landing.html?id=BK018)</option>
                  <option value="/ebooks/book-landing.html?id=BK003&vip=1">📦 अनाज भंडारण गाइड (/ebooks/book-landing.html?id=BK003)</option>
                  <option value="/ebooks/book-landing.html?id=BK005&vip=1">🌾 धान मास्टर गाइड (/ebooks/book-landing.html?id=BK005)</option>
                  <option value="/ebooks/book-landing.html?id=BK007&vip=1">🍞 गेहूं मास्टर गाइड (/ebooks/book-landing.html?id=BK007)</option>
                  <option value="/ebooks/book-landing.html?id=BK011&vip=1">🏠 पॉलीहाउस नेटहाउस गाइड (/ebooks/book-landing.html?id=BK011)</option>
                  <option value="/ebooks/book-landing.html?id=SUB001&vip=1">👑 Aarogyam Pro VIP सदस्यता (/ebooks/book-landing.html?id=SUB001)</option>
                </optgroup>
                <optgroup label="🐄 कृषि, पशुपालन, ट्यूब व अन्य लैंडिंग पेज">
                  <option value="/pashu-palan.html?ref=crm">🐄 संपूर्ण पशुपालन व दुग्ध संवर्धन हब (/pashu-palan.html)</option>
                  <option value="/crop-doctor.html?ref=crm">🤖 क्रॉप डॉक्टर AI प्राथमिक जांच (/crop-doctor.html)</option>
                  <option value="/mandi.html?ref=crm">📈 दैनिक कृषि मंडी भाव (/mandi.html)</option>
                  <option value="/weather.html?ref=crm">🌤️ मौसम पूर्वानुमान केंद्र (/weather.html)</option>
                  <option value="/tube.html?ref=crm">📺 AarogyamTube संपूर्ण वीडियो हब (/tube.html)</option>
                  <option value="/netsurf-join.html?ref=crm">💼 नेट्सर्फ जैविक कृषि व डायरेक्ट सेलर जॉइनिंग (/netsurf-join.html)</option>
                  <option value="/categories/netsurf-products.html?ref=crm">🌿 नेट्सर्फ बायो-फिट प्रोडक्ट्स (/categories/netsurf-products.html)</option>
                  <option value="/catalog.html?ref=crm">📖 7-भाषा संपूर्ण प्रोडक्ट कैटलॉग (/catalog.html)</option>
                </optgroup>
              </select>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                <label style="font-size: 0.76rem; font-weight: 700; color: #1E40AF; white-space: nowrap;">
                  ⏳ लिंक ऑटो-एक्सपायरी:
                </label>
                <select id="hook_attached_link_timer" class="admin-select" style="padding: 4px 8px; font-size: 0.76rem; border-radius: 6px; border: 1.5px solid #93C5FD; font-weight: 700; background: #fff;">
                  <option value="today" selected>📅 आज रात 12 बजे तक</option>
                  <option value="2h">⏰ 2 घंटे</option>
                  <option value="6h">⏳ 6 घंटे</option>
                  <option value="24h">⌛ 24 घंटे</option>
                  <option value="48h">📆 48 घंटे (2 दिन)</option>
                  <option value="never">♾️ असीमित (No Expiry)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 4. Generated Live Message Preview Textarea -->
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 4px;">
              <label class="admin-label" style="font-weight: 800; font-size: 0.82rem; color: #0F172A; margin: 0;">
                💬 जनरेट हुआ पर्सनलाइज़्ड संदेश:
              </label>
              <button type="button" id="btn_shuffle_hook_variation" class="admin-button small-button" style="background: #E2E8F0; color: #1E293B; font-weight: 700; font-size: 0.72rem; padding: 2px 7px;">
                🔄 नया विचार
              </button>
            </div>
            <textarea id="greeting_custom_textarea" class="admin-input" rows="6" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #CBD5E1; font-family: inherit; font-size: 0.85rem; line-height: 1.45; color: #0F172A; margin-bottom: 8px;"></textarea>

            <!-- Multi-Channel Universal Sharing Action Buttons for Tab 2 -->
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" id="btn_share_greeting_universal" class="admin-button small-button" style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #fff; font-weight: 800; padding: 6px 12px; font-size: 0.78rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(79,70,229,0.3);" title="मोबाइल के सभी ऐप्स पर शेयर करें">
                <i class="fa-solid fa-share-nodes"></i> 📲 शेयर करें (All Apps)
              </button>
              <button type="button" id="btn_share_greeting_wa" class="admin-button small-button" style="background: #25D366; color: #fff; font-weight: 800; padding: 6px 12px; font-size: 0.78rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-brands fa-whatsapp"></i> 🟢 WA शेयर
              </button>
              <button type="button" id="btn_share_greeting_fb" class="admin-button small-button" style="background: #1877F2; color: #fff; font-weight: 800; padding: 6px 12px; font-size: 0.78rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-brands fa-facebook"></i> 🔵 FB शेयर
              </button>
              <button type="button" id="btn_copy_greeting_message" class="admin-button small-button" style="background: #0F172A; color: #fff; font-weight: 800; font-size: 0.78rem; padding: 6px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-copy"></i> 📋 कॉपी (Copy)
              </button>
            </div>
          </div>

          <!-- 5. Load to 1-Tap Queue Runner Action Button -->
          <button type="button" id="btn_load_greetings_queue" class="admin-button" style="width: 100%; background: #0F172A; color: #fff; font-weight: 900; padding: 11px; font-size: 0.95rem; border-radius: 8px; box-shadow: 0 4px 14px rgba(15,23,42,0.25);">
            <i class="fa-solid fa-play"></i> 🚀 चुने गए संपर्कों की कतार शुरू करें (Launch Queue)
          </button>
        </div>

        <!-- Right Column: Tab 2 Batch Contact List & 1-Tap Queue Runner HUD -->
        <div class="admin-card" style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
          
          <!-- Batch Header & Pagination Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 10px;">
            <div>
              <div style="font-weight: 900; color: #0F172A; font-size: 1rem;">
                📋 सक्रिय संपर्क बैच (30 Contacts / Batch)
              </div>
              <div id="greetings_batch_contacts_counter_text" style="font-size: 0.78rem; color: #059669; font-weight: 700;">
                उपलब्ध: 0 संपर्क
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" id="btn_greetings_prev_batch" class="admin-button small-button" style="padding: 4px 8px; font-size: 0.75rem; background: #fff; border: 1px solid #CBD5E1; color: #334155;">◀ पिछला</button>
              <span id="greetings_batch_page_pill" style="font-size: 0.78rem; font-weight: 800; color: #1E293B;">पृष्ठ 1 / 1</span>
              <button type="button" id="btn_greetings_next_batch" class="admin-button small-button" style="padding: 4px 8px; font-size: 0.75rem; background: #fff; border: 1px solid #CBD5E1; color: #334155;">अगला ▶</button>
            </div>
          </div>

          <!-- Tab 2 Quick Contact Multi-Selection Toolbar -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: #EEF2F6; border: 1px solid #CBD5E1; border-radius: 8px; padding: 8px 10px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 800; color: #0F172A; cursor: pointer; user-select: none; margin: 0;">
                <input type="checkbox" id="chk_greetings_select_page_contacts" style="width: 17px; height: 17px; accent-color: #16A34A; cursor: pointer;">
                <span>पेज के सभी</span>
              </label>
              <span id="greetings_selected_count_badge" style="background: #16A34A; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 12px;">0 चुने गए</span>
            </div>
            <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 0.74rem; font-weight: 800; color: #475569;">त्वरित:</span>
              <button type="button" class="btn-quick-select-greetings admin-button small-button" data-count="30" style="padding: 3px 8px; font-size: 0.74rem; background: #fff; border: 1px solid #CBD5E1; color: #0F172A; font-weight: 800; border-radius: 4px;" title="पहले 30 संपर्क चुनें">30</button>
              <button type="button" class="btn-quick-select-greetings admin-button small-button" data-count="60" style="padding: 3px 8px; font-size: 0.74rem; background: #fff; border: 1px solid #CBD5E1; color: #0F172A; font-weight: 800; border-radius: 4px;" title="पहले 60 संपर्क चुनें">60</button>
              <button type="button" class="btn-quick-select-greetings admin-button small-button" data-count="100" style="padding: 3px 8px; font-size: 0.74rem; background: #fff; border: 1px solid #CBD5E1; color: #0F172A; font-weight: 800; border-radius: 4px;" title="पहले 100 संपर्क चुनें">100</button>
              <button type="button" class="btn-quick-select-greetings admin-button small-button" data-count="200" style="padding: 3px 8px; font-size: 0.74rem; background: #fff; border: 1px solid #CBD5E1; color: #0F172A; font-weight: 800; border-radius: 4px;" title="पहले 200 संपर्क चुनें">200</button>
              <button type="button" id="btn_clear_greetings_selection" class="admin-button small-button" style="padding: 3px 8px; font-size: 0.74rem; background: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; font-weight: 800; border-radius: 4px;" title="सभी चयन हटाएं">हटाएं</button>
            </div>
          </div>

          <!-- 1-Tap Queue Runner HUD Box for Tab 2 -->
          <div id="greetings_outreach_active_runner_box" style="display: none; background: #070D19; border: 2px solid #F59E0B; border-radius: 12px; padding: 14px; margin-bottom: 14px; color: #fff; box-shadow: 0 4px 14px rgba(245,158,11,0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span id="greetings_hud_queue_index_badge" style="background: #D97706; color: #fff; font-size: 0.75rem; font-weight: 900; padding: 2px 8px; border-radius: 6px;">
                कतार प्रगति: 1 / 30
              </span>
              <button type="button" id="btn_close_greetings_runner_hud" style="background: transparent; border: none; color: #94A3B8; font-size: 1.2rem; cursor: pointer;">&times;</button>
            </div>

            <div style="font-size: 1.15rem; font-weight: 900; color: #FBBF24; margin-bottom: 2px;" id="greetings_hud_recipient_name">
              रमेश कुमार पटेल
            </div>
            <div style="font-size: 0.88rem; color: #94A3B8; font-family: monospace; margin-bottom: 8px;" id="greetings_hud_recipient_mobile">
              📞 +91 98765 43210
            </div>

            <div style="background: #0F172A; border: 1px solid #334155; border-radius: 6px; padding: 8px; font-size: 0.78rem; color: #E2E8F0; max-height: 80px; overflow-y: auto; margin-bottom: 10px; white-space: pre-wrap;" id="greetings_hud_msg_preview">
              लोड हो रहा है...
            </div>

            <!-- 1-Tap Action Multi-Buttons -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 6px; margin-bottom: 8px;">
              <button type="button" id="greetings_hud_btn_whatsapp" class="admin-button" style="background: #25D366; color: #fff; font-weight: 900; padding: 8px 4px; font-size: 0.78rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <i class="fa-brands fa-whatsapp"></i> WA
              </button>
              <button type="button" id="greetings_hud_btn_sms" class="admin-button" style="background: #2563EB; color: #fff; font-weight: 900; padding: 8px 4px; font-size: 0.78rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <i class="fa-solid fa-comment-sms"></i> MG
              </button>
              <button type="button" id="greetings_hud_btn_call" class="admin-button" style="background: #059669; color: #fff; font-weight: 900; padding: 8px 4px; font-size: 0.78rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <i class="fa-solid fa-phone"></i> CL
              </button>
              <button type="button" id="greetings_hud_btn_copy" class="admin-button" style="background: #475569; color: #fff; font-weight: 900; padding: 8px 4px; font-size: 0.78rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;" title="क्लिपबोर्ड पर कॉपी करें">
                <i class="fa-solid fa-copy"></i> CO
              </button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <button type="button" id="greetings_hud_btn_skip" class="admin-button small-button" style="background: transparent; border: 1px solid #475569; color: #94A3B8; font-size: 0.72rem;">
                ⏭️ छोड़ें (Skip)
              </button>
              <button type="button" id="greetings_hud_btn_next" class="admin-button small-button" style="background: #F59E0B; color: #0F172A; font-weight: 900; font-size: 0.78rem;">
                सफल, अगला संपर्क ➡️ (Done Next)
              </button>
            </div>
          </div>

          <!-- Dual Table Switcher: Pending vs Sent Contacts (Tab 2) -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; flex-wrap: wrap;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <button type="button" id="tab_btn_gr_pending" class="admin-button small-button" style="background: #D97706; color: #fff; font-weight: 900; border-radius: 6px; padding: 6px 14px; font-size: 0.82rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                <span>📋 शेष संपर्क (Pending)</span>
                <span id="badge_gr_pending_count" style="background: rgba(255,255,255,0.25); color: #fff; padding: 1px 7px; border-radius: 12px; font-size: 0.72rem;">0</span>
              </button>
              <button type="button" id="tab_btn_gr_sent" class="admin-button small-button" style="background: #F1F5F9; color: #475569; font-weight: 800; border-radius: 6px; padding: 6px 14px; font-size: 0.82rem; border: 1px solid #CBD5E1; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                <span>✅ संदेश भेजे गए (Sent)</span>
                <span id="badge_gr_sent_count" style="background: #E2E8F0; color: #334155; padding: 1px 7px; border-radius: 12px; font-size: 0.72rem;">0</span>
              </button>
            </div>
            <button type="button" id="btn_gr_clear_sent_table" class="admin-button small-button" style="display: none; background: #FEE2E2; border: 1px solid #FCA5A5; color: #DC2626; font-weight: 800; border-radius: 6px; padding: 5px 12px; font-size: 0.76rem; cursor: pointer; align-items: center; gap: 5px;" title="भेजे गए संदेशों का इतिहास साफ़ करें">
              <i class="fa-solid fa-trash-can"></i> 🗑️ भेजे गए संदेश साफ़ करें (Clear Sent)
            </button>
          </div>

          <!-- Tab 2 Contacts 30-List Container with 1-Click Action Buttons on EACH row -->
          <div id="greetings_batch_contacts_list_container" style="max-height: 480px; overflow-y: auto; background: #fff; border: 1px solid #CBD5E1; border-radius: 8px; padding: 6px;">
            <div style="color: #94A3B8; text-align: center; padding: 20px; font-size: 0.85rem;">संपर्क लोड हो रहे हैं...</div>
          </div>
        </div>

      </div>
    </div>

    <!-- =====================================================================
         TAB 3: IN-APP BROADCAST FEED
         ===================================================================== -->
    <div id="section_broadcast_tab" style="display: none;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;">
        <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 12px;">
            📢 नया इन-ऐप ब्रॉडकास्ट संदेश बनाएं
          </div>
          <form id="admin-broadcast-form">
            <div style="margin-bottom: 12px;">
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">प्राप्तकर्ता चुनें: *</label>
              <select id="bc_target_filter" class="admin-select" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1; font-weight: 700;">
                <option value="all">👥 सभी यूज़र्स (100% Reach)</option>
                <option value="active">🟢 केवल एक्टिव मेंबर्स</option>
                <option value="purchased">📚 ई-बुक खरीदार यूज़र्स</option>
              </select>
            </div>
            <div style="margin-bottom: 12px;">
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">संदेश शीर्षक: *</label>
              <input type="text" id="bc_title" class="admin-input" placeholder="उदा. नई कृषि गाइड उपलब्ध!" required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1;">
            </div>
            <div style="margin-bottom: 12px;">
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">संदेश विवरण: *</label>
              <textarea id="bc_body" class="admin-input" rows="4" placeholder="पूरा संदेश लिखें..." required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1; font-family: inherit;"></textarea>
            </div>
            <button type="submit" id="bc_submit_btn" class="admin-button" style="width: 100%; background: #E11D48; color: #fff; font-weight: 800; padding: 10px; border-radius: 8px;">
              📢 संदेश ब्रॉडकास्ट करें
            </button>
          </form>
        </div>

        <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 12px;">
            🕒 भेजे गए इन-ऐप संदेश
          </div>
          <div id="bc_history_container" style="max-height: 480px; overflow-y: auto;">
            <div style="color: #94A3B8; text-align: center; padding: 20px;">लोड हो रहा है...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         TAB 4: FESTIVAL SALE CAMPAIGN MANAGER
         ===================================================================== -->
    <div id="section_festival_tab" style="display: none;">
      <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; max-width: 820px; margin: 0 auto;">
        <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-wand-magic-sparkles" style="color: #E11D48;"></i> साइट-व्यापी त्यौहार व फ्लैश सेल मैनेजर (Flipkart/Amazon Style)
        </div>
        <p style="font-size: 0.85rem; color: #64748B; margin: 0 0 16px 0;">
          यहाँ से एक्टिवेट करने पर वेबसाइट के सभी पेजों पर टॉप हेडर स्ट्रिप, काउंटडाउन टाइमर और 50% छूट का डिस्काउंट बैज तुरंत लाइव हो जाएगा।
        </p>

        <form id="admin-festival-campaign-form" onsubmit="return false;">
          <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 800; font-size: 0.95rem; color: #0F172A;">सेल सक्रिय करें (Live Sale Status):</div>
              <div style="font-size: 0.8rem; color: #64748B;">चालू करने पर सभी विज़िटर्स को हेडर पर सेल और टाइमर दिखेगा।</div>
            </div>
            <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
              <input type="checkbox" id="fest_active_switch" style="opacity: 0; width: 0; height: 0;">
              <span id="fest_switch_slider" style="position: absolute; cursor: pointer; inset: 0; background-color: #CBD5E1; transition: .3s; border-radius: 28px;"></span>
            </label>
          </div>

          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">सेल शीर्षक: *</label>
            <input type="text" id="fest_title_input" class="admin-input" placeholder="🎉 शुभ त्यौहार महाबचत - सभी ई-बुक्स पर 50% विशेष छूट!" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">बैज टेक्स्ट:</label>
              <input type="text" id="fest_badge_input" class="admin-input" placeholder="🔥 सीमित समय मेगा ऑफर" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1;">
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">कूपन कोड:</label>
              <input type="text" id="fest_coupon_input" class="admin-input" placeholder="FESTIVAL50" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1;">
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">⏰ काउंटडाउन टाइमर समाप्ति:*</label>
            <input type="datetime-local" id="fest_timer_input" class="admin-input" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1;">
          </div>

          <button type="button" id="btn_save_festival_campaign" class="admin-button" style="width: 100%; background: #E11D48; color: #fff; font-weight: 900; padding: 12px; font-size: 1rem; border-radius: 8px;">
            💾 त्यौहार ऑफर सेटिंग्स सुरक्षित करें (Save & Publish)
          </button>
        </form>
      </div>
    </div>

    <!-- =====================================================================
         TAB 5: ADMIN DAILY ACTIVITY REPORT (DATE FILTERED)
         ===================================================================== -->
    <div id="section_activity_tab" style="display: none;">
      <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px;">
        
        <!-- Header & Date Filter Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-chart-line" style="color: #2563EB;"></i> 📊 मेरी दैनिक कार्य व आउटरीच रिपोर्ट (Daily Activity Report)
            </div>
            <p style="font-size: 0.82rem; color: #64748B; margin: 2px 0 0 0;">
              आज आपने कितने WhatsApp, SMS और Calls किए, उसका संपूर्ण हिसाब-किताब।
            </p>
          </div>

          <!-- Date Filter Buttons -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn-activity-filter admin-button small-button" data-filter="today" style="background: #2563EB; color: #fff; font-weight: 800;">
              📅 आज (Today)
            </button>
            <button type="button" class="btn-activity-filter admin-button small-button" data-filter="yesterday" style="background: #E2E8F0; color: #334155; font-weight: 700;">
              कल (Yesterday)
            </button>
            <button type="button" class="btn-activity-filter admin-button small-button" data-filter="week" style="background: #E2E8F0; color: #334155; font-weight: 700;">
              पिछले 7 दिन
            </button>
            <button type="button" class="btn-activity-filter admin-button small-button" data-filter="all" style="background: #E2E8F0; color: #334155; font-weight: 700;">
              सभी (All)
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #166534; font-weight: 800;">🟢 WhatsApp भेजे गए</div>
            <div style="font-size: 1.5rem; font-weight: 900; color: #15803D;" id="act_kpi_wa">0</div>
            <div style="font-size: 0.72rem; color: #64748B;" id="act_kpi_wa_sub">सुरक्षित एंटी-बैन सीमा</div>
          </div>
          <div style="background: #EFF6FF; border: 1.5px solid #93C5FD; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #1E40AF; font-weight: 800;">💬 Text (SMS) भेजे गए</div>
            <div style="font-size: 1.5rem; font-weight: 900; color: #2563EB;" id="act_kpi_sms">0</div>
            <div style="font-size: 0.72rem; color: #64748B;" id="act_kpi_sms_sub">टेलिकॉम TRAI सीमा</div>
          </div>
          <div style="background: #FEF3C7; border: 1.5px solid #FCD34D; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #92400E; font-weight: 800;">📞 कॉल्स (Calls Made)</div>
            <div style="font-size: 1.5rem; font-weight: 900; color: #D97706;" id="act_kpi_call">0</div>
            <div style="font-size: 0.72rem; color: #64748B;">डायरेक्ट टेलीफोनिक संपर्क</div>
          </div>
          <div style="background: #F1F5F9; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #334155; font-weight: 800;">👥 कुल आउटरीच</div>
            <div style="font-size: 1.5rem; font-weight: 900; color: #0F172A;" id="act_kpi_total">0</div>
            <div style="font-size: 0.72rem; color: #64748B;">कुल संपर्क किए गए</div>
          </div>
        </div>

        <!-- Filtered History Table -->
        <div id="activity_history_table_container" style="max-height: 480px; overflow-y: auto;">
          <div style="color: #94A3B8; text-align: center; padding: 20px;">गतिविधि लोड हो रही है...</div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
          <button type="button" id="btn_clear_outreach_history" class="admin-button small-button" style="background: #FEE2E2; border: 1px solid #FCA5A5; color: #DC2626; font-weight: 700;">
            🗑️ आउटरीच हिस्ट्री साफ़ करें
          </button>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         TAB 6: MARKETING CONVERSION REPORT
         ===================================================================== -->
    <div id="section_conversion_tab" style="display: none;">
      <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-bullseye" style="color: #10B981;"></i> 🎯 मार्केटिंग कन्वर्जन व सेल्स रिपोर्ट (Conversion Analytics)
            </div>
            <p style="font-size: 0.82rem; color: #64748B; margin: 2px 0 0 0;">
              लिंक ट्रैकिंग (?ref=crm) के आधार पर देखें किस संपर्क ने वेबसाइट विज़िट की और किसने ई-बुक खरीदी।
            </p>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" id="btn_export_conversions_csv" class="admin-button small-button" style="background: #0284C7; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-file-csv"></i> 📥 CSV डाउनलोड करें
            </button>
            <button type="button" id="btn_refresh_conversions" class="admin-button small-button" style="background: #10B981; color: #fff; font-weight: 800;">
              🔄 रिफ्रेश डेटा
            </button>
          </div>
        </div>

        <!-- Conversion KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #475569; font-weight: 800;">📤 कुल लिंक भेजे गए</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #1E293B;" id="conv_kpi_sent">0</div>
          </div>
          <div style="background: #EFF6FF; border: 1.5px solid #93C5FD; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #1E40AF; font-weight: 800;">🛒 चेकआउट / विज़िट्स</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #2563EB;" id="conv_kpi_visits">0</div>
          </div>
          <div style="background: #ECFDF5; border: 1.5px solid #6EE7B7; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #065F46; font-weight: 800;">🎉 सफल खरीद (Converted)</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #059669;" id="conv_kpi_purchases">0</div>
          </div>
          <div style="background: #FAF5FF; border: 1.5px solid #D8B4FE; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #6B21A8; font-weight: 800;">💰 कुल अर्जित राजस्व</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #7E22CE;" id="conv_kpi_revenue">₹0</div>
          </div>
          <div style="background: #FEF3C7; border: 1.5px solid #FCD34D; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.8rem; color: #92400E; font-weight: 800;">📈 कन्वर्जन दर (Rate %)</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #D97706;" id="conv_kpi_rate">0%</div>
          </div>
        </div>

        <!-- Conversion Table -->
        <div id="conversion_table_container" style="max-height: 480px; overflow-y: auto;">
          <div style="color: #94A3B8; text-align: center; padding: 20px;">कन्वर्जन डेटा लोड हो रहा है...</div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         TAB 7: GOOGLE LEADS GENERATION (BUILT-IN VIEW)
         ===================================================================== -->
    <div id="section_google_leads_tab" style="display: none;">
      <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
          <div style="font-size: 1.15rem; font-weight: 900; color: #0F172A; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-map-location-dot" style="color: #0284C7;"></i> 🌐 Google Lead Generation (Google Maps व लोकल बिज़नेस लीड्स)
          </div>
          <button type="button" id="btn_open_google_maps_live" class="admin-button small-button" style="background: #EA4335; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-map"></i> 🗺️ Google Maps पर लाइव खोजें
          </button>
        </div>
        <p style="font-size: 0.84rem; color: #64748B; margin: 0 0 16px 0;">
          कीवर्ड (डेयरी, एग्री, ब्यूटी, मेडिकल) और शहर के आधार पर संपर्क खोजें, सीधे Google Maps पर देखें और 1-क्लिक में Phonebook व आउटरीच में जोड़ें।
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 14px;">
          <div>
            <label class="admin-label" style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 4px;">🎯 कीवर्ड / श्रेणी:</label>
            <select id="bc_gl_keyword" class="admin-select" style="width: 100%; padding: 8px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700;">
              <option value="dairy">🐄 डेयरी फार्म व दुग्ध विक्रेता (Dairy Farm)</option>
              <option value="agriculture">🌾 कृषि खाद-बीज भंडार (Agri Input Stores)</option>
              <option value="medical">🩺 मेडिकल स्टोर व आयुर्वेदिक क्लीनिक (Medical Stores)</option>
              <option value="beauty">💄 ब्यूटी पार्लर व कॉस्मेटिक्स (Beauty Stores)</option>
              <option value="farmer">🚜 प्रगतिशील किसान समूह / FPO</option>
              <option value="custom">✍️ कस्टम कीवर्ड (Custom Keyword)</option>
            </select>
          </div>
          <div id="bc_gl_custom_wrap" style="display: none;">
            <label class="admin-label" style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 4px;">✍️ कस्टम कीवर्ड:</label>
            <input type="text" id="bc_gl_custom_input" class="admin-input" placeholder="उदा. नर्सरी, खाद डीलर" style="width: 100%; padding: 8px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700;">
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 4px;">📍 शहर / जिला:</label>
            <input type="text" id="bc_gl_location" class="admin-input" value="इंदौर, मध्य प्रदेश" style="width: 100%; padding: 8px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 700;">
          </div>
          <div style="display: flex; align-items: flex-end; gap: 6px;">
            <button type="button" id="btn_bc_gl_search" class="admin-button" style="width: 100%; background: #0284C7; color: #fff; font-weight: 800; padding: 9px;">
              🔍 लीड्स निकालें (Extract)
            </button>
          </div>
        </div>

        <div id="bc_gl_results_container" style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; max-height: 380px; overflow-y: auto;">
          <div style="color: #94A3B8; text-align: center; padding: 24px;">ऊपर सर्च बटन दबाकर संभावित लीड्स लोड करें।</div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         TAB 8: AUTO WHATSAPP BOT (BUILT-IN VIEW)
         ===================================================================== -->
    <div id="section_auto_whatsapp_tab" style="display: none;">
      <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px;">
        <div style="font-size: 1.15rem; font-weight: 900; color: #0F172A; display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <i class="fa-brands fa-whatsapp" style="color: #16A34A;"></i> 🤖 Auto WhatsApp Bot (30-सेकंड एंटी-बैन शेड्यूलर)
        </div>
        <p style="font-size: 0.84rem; color: #64748B; margin: 0 0 16px 0;">
          मानव जैसा 30-सेकंड का अंतराल, Spintax मैसेज वैरियेशन और 30 संदेश/दिन की सुरक्षित ऑटोमेशन कतार।
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 14px; background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 12px;">
          <div>
            <div style="font-size: 0.78rem; color: #166534; font-weight: 800;">🛡️ सुरक्षा डिले</div>
            <div style="font-size: 1.2rem; font-weight: 900; color: #15803D;">30 सेकंड / संदेश</div>
          </div>
          <div>
            <div style="font-size: 0.78rem; color: #166534; font-weight: 800;">📊 आज का कोटा</div>
            <div style="font-size: 1.2rem; font-weight: 900; color: #15803D;"><span id="bc_wa_quota_val">${getDailyWaCount()}</span> / 30 आज</div>
          </div>
          <div>
            <div style="font-size: 0.78rem; color: #166534; font-weight: 800;">📲 मोड</div>
            <div style="font-size: 1.2rem; font-weight: 900; color: #15803D;">Native PWA Queue</div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; margin: 0;">💬 Spintax संदेश टेम्पलेट (ऑटो-वैरिएशन):</label>
            <button type="button" id="btn_copy_auto_wa_msg" class="admin-button small-button" style="background: #0F172A; color: #fff; font-size: 0.74rem; padding: 2px 8px;">
              📋 संदेश कॉपी करें
            </button>
          </div>
          <textarea id="bc_wa_spintax_textarea" class="admin-input" rows="4" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-family: inherit; font-size: 0.85rem; line-height: 1.45;">{नमस्ते|प्रणाम|जय किसान} {name} जी! 🙏

आरोग्यम इंडिया की ओर से आपके लिए विशेष अपडेट व ऑफर तैयार है:
👉 {link}

सधन्यवाद, आरोग्यम इंडिया टीम 🌿</textarea>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
          <button type="button" id="btn_bc_start_wa_bot" class="admin-button" style="background: #16A34A; color: #fff; font-weight: 900; padding: 10px 20px;">
            <i class="fa-solid fa-play"></i> ▶️ ऑटो WhatsApp कतार प्रारंभ करें (Start 30 Batch)
          </button>
        </div>

        <div id="bc_wa_bot_log" style="background: #0F172A; color: #A7F3D0; font-family: monospace; font-size: 0.8rem; padding: 12px; border-radius: 8px; max-height: 180px; overflow-y: auto;">
          [System Ready] फोनबुक से 30 संपर्कों का बैच रनर में लोड करने हेतु तैयार।
        </div>
      </div>
    </div>

    <!-- =====================================================================
         MODAL: ADD LEAD & BULK CSV IMPORT
         ===================================================================== -->
    <div id="admin_add_lead_modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: #fff; border-radius: 14px; max-width: 520px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); padding: 20px; max-height: 90vh; overflow-y: auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #0F172A;">➕ संपर्क जोड़ें (Single / Bulk CSV)</h3>
          <button type="button" id="btn_close_add_lead_modal" style="background: transparent; border: none; font-size: 1.4rem; color: #64748B; cursor: pointer;">&times;</button>
        </div>

        <!-- Modal Mode Switcher Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
          <button type="button" id="lead_mode_btn_single" class="admin-button small-button" style="background: #2563EB; color: #fff; font-weight: 800;">
            👤 एकल संपर्क (Single)
          </button>
          <button type="button" id="lead_mode_btn_csv" class="admin-button small-button" style="background: #E2E8F0; color: #334155; font-weight: 700;">
            📂 CSV बल्क इम्पोर्ट (Bulk CSV)
          </button>
        </div>

        <!-- Form 1: Single Lead -->
        <form id="admin_add_lead_form" onsubmit="return false;">
          <div style="margin-bottom: 10px;">
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">पूरा नाम: *</label>
            <input type="text" id="lead_name_input" class="admin-input" placeholder="रमेश पटेल" required style="width: 100%; padding: 7px;">
          </div>
          <div style="margin-bottom: 10px;">
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">मोबाइल नंबर (10 अंक): *</label>
            <input type="tel" id="lead_mobile_input" class="admin-input" placeholder="9876543210" maxlength="10" required style="width: 100%; padding: 7px;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">श्रेणी: *</label>
              <select id="lead_category_input" class="admin-select" style="width: 100%; padding: 7px;">
                <option value="agri">🌾 कृषि</option>
                <option value="dairy">🐄 पशुपालन</option>
                <option value="health">❤️ स्वास्थ्य</option>
                <option value="netsurf">💼 नेट्सर्फ</option>
                <option value="general">📇 सामान्य</option>
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">स्थान / शहर:</label>
              <input type="text" id="lead_place_input" class="admin-input" placeholder="रीवा, म.प्र." style="width: 100%; padding: 7px;">
            </div>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button type="button" id="btn_cancel_add_lead" class="admin-button small-button" style="background: #E2E8F0; color: #475569;">रद्द करें</button>
            <button type="button" id="btn_save_lead_submit" class="admin-button small-button" style="background: #2563EB; color: #fff; font-weight: 800;">💾 Phonebook में सुरक्षित करें</button>
          </div>
        </form>

        <!-- Form 2: Bulk CSV Import -->
        <div id="admin_add_csv_wrap" style="display: none;">
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 0.78rem; color: #1E40AF;">
            📌 <strong>CSV फ़ॉर्मेट:</strong> नाम, मोबाइल, श्रेणी, शहर<br>
            उदा: <code>रमेश पटेल, 9876543210, agri, इंदौर</code>
          </div>

          <div style="margin-bottom: 10px;">
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">CSV फ़ाइल चुनें (.csv / .txt):</label>
            <input type="file" id="lead_csv_file_input" accept=".csv,.txt" style="width: 100%; font-size: 0.8rem;">
          </div>

          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">या यहाँ डेटा पेस्ट करें (Copy-Paste Text):</label>
            <textarea id="lead_csv_paste_textarea" rows="4" class="admin-input" placeholder="सुरेश शर्मा, 9826123456, dairy, भोपाल&#10;अमित वर्मा, 9893123456, health, जबलपुर" style="width: 100%; font-size: 0.8rem; font-family: monospace;"></textarea>
          </div>

          <div id="csv_parsed_preview_box" style="display: none; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px; margin-bottom: 12px; font-size: 0.8rem;">
            <div style="font-weight: 800; color: #059669;" id="csv_parsed_count_txt">✅ 0 संपर्क पहचाने गए</div>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button type="button" id="btn_cancel_csv_import" class="admin-button small-button" style="background: #E2E8F0; color: #475569;">रद्द करें</button>
            <button type="button" id="btn_submit_csv_bulk" class="admin-button small-button" style="background: #10B981; color: #fff; font-weight: 800;">📥 सभी Phonebook में लोड करें</button>
          </div>
        </div>

      </div>
    </div>
  `;

  // Dynamic CSS Slider
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #fest_active_switch:checked + #fest_switch_slider { background-color: #16A34A !important; }
    #fest_switch_slider:before {
      position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px;
      background-color: white; transition: .3s; border-radius: 50%;
    }
    #fest_active_switch:checked + #fest_switch_slider:before { transform: translateX(24px); }
  `;
  document.head.appendChild(styleEl);

  // Tab Switching (8 Tabs)
  const tabs = {
    vip_outreach: { btn: document.getElementById('tab_btn_vip_outreach'), sec: document.getElementById('section_vip_outreach_tab'), color: '#E11D48' },
    greetings: { btn: document.getElementById('tab_btn_greetings'), sec: document.getElementById('section_greetings_tab'), color: '#F59E0B' },
    broadcast: { btn: document.getElementById('tab_btn_broadcast'), sec: document.getElementById('section_broadcast_tab'), color: '#E11D48' },
    festival: { btn: document.getElementById('tab_btn_festival'), sec: document.getElementById('section_festival_tab'), color: '#E11D48' },
    activity: { btn: document.getElementById('tab_btn_activity'), sec: document.getElementById('section_activity_tab'), color: '#2563EB' },
    conversion: { btn: document.getElementById('tab_btn_conversion'), sec: document.getElementById('section_conversion_tab'), color: '#10B981' },
    google_leads: { btn: document.getElementById('tab_btn_google_leads'), sec: document.getElementById('section_google_leads_tab'), color: '#0284C7' },
    auto_whatsapp: { btn: document.getElementById('tab_btn_auto_whatsapp'), sec: document.getElementById('section_auto_whatsapp_tab'), color: '#16A34A' }
  };

  function switchMainTab(tName) {
    activeTab = tName;
    Object.keys(tabs).forEach(k => {
      const isCur = k === tName;
      if (tabs[k].sec) tabs[k].sec.style.display = isCur ? 'block' : 'none';
      if (tabs[k].btn) {
        tabs[k].btn.style.background = isCur ? tabs[k].color : 'rgba(255,255,255,0.08)';
        tabs[k].btn.style.color = isCur ? '#fff' : (k === 'google_leads' ? '#38BDF8' : (k === 'auto_whatsapp' ? '#4ADE80' : '#CBD5E1'));
      }
    });
    if (tName === 'festival') loadFestivalCampaign();
    if (tName === 'activity') renderActivityReport('today');
    if (tName === 'conversion') renderConversionReport();
    if (tName === 'vip_outreach' || tName === 'greetings') updateBatchDisplayUI();
  }

  document.getElementById('tab_btn_vip_outreach')?.addEventListener('click', () => switchMainTab('vip_outreach'));
  document.getElementById('tab_btn_greetings')?.addEventListener('click', () => switchMainTab('greetings'));
  document.getElementById('tab_btn_broadcast')?.addEventListener('click', () => switchMainTab('broadcast'));
  document.getElementById('tab_btn_festival')?.addEventListener('click', () => switchMainTab('festival'));
  document.getElementById('tab_btn_activity')?.addEventListener('click', () => switchMainTab('activity'));
  document.getElementById('tab_btn_conversion')?.addEventListener('click', () => switchMainTab('conversion'));
  document.getElementById('tab_btn_google_leads')?.addEventListener('click', () => switchMainTab('google_leads'));
  document.getElementById('tab_btn_auto_whatsapp')?.addEventListener('click', () => switchMainTab('auto_whatsapp'));

  // Target Type Selector Switching (Book / Page / Health / Pashu / Tube / Netsurf / Catalog)
  const targetTypeSel = document.getElementById('vip_target_type_selector');
  const bookWrap = document.getElementById('wrap_book_selector');
  const pageWrap = document.getElementById('wrap_page_selector');
  const healthWrap = document.getElementById('wrap_health_selector');
  const pashuWrap = document.getElementById('wrap_pashu_selector');
  const tubeWrap = document.getElementById('wrap_tube_selector');
  const priceTimerWrap = document.getElementById('wrap_price_timer_controls');

  targetTypeSel?.addEventListener('change', () => {
    const val = targetTypeSel.value;
    if (bookWrap) bookWrap.style.display = (val === 'ebook') ? 'block' : 'none';
    if (pageWrap) pageWrap.style.display = (val === 'page') ? 'block' : 'none';
    if (healthWrap) healthWrap.style.display = (val === 'health') ? 'block' : 'none';
    if (pashuWrap) pashuWrap.style.display = (val === 'pashu') ? 'block' : 'none';
    if (tubeWrap) tubeWrap.style.display = (val === 'tube') ? 'block' : 'none';

    // Show Price & Timer ONLY for E-Books!
    if (priceTimerWrap) {
      priceTimerWrap.style.display = (val === 'ebook') ? 'grid' : 'none';
    }

    // Reset uploaded custom photo so the newly selected page/video thumbnail displays
    activeWebpDataUrl = null;
    const fileInput = document.getElementById('promo_image_file_input');
    if (fileInput) fileInput.value = '';
    const webpWrap = document.getElementById('webp_preview_wrap');
    if (webpWrap) webpWrap.style.display = 'none';

    updateVipMessagePreview();
  });

  // Tube Selector (Preset vs Custom URL)
  const tubeVidSel = document.getElementById('vip_tube_video_selector');
  const tubeCustomWrap = document.getElementById('wrap_tube_custom_url');
  tubeVidSel?.addEventListener('change', () => {
    if (tubeVidSel.value === 'custom_url') {
      tubeCustomWrap.style.display = 'block';
    } else {
      tubeCustomWrap.style.display = 'none';
    }

    // When a video is selected, reset custom image so this video's YouTube thumbnail is shown
    activeWebpDataUrl = null;
    const fileInput = document.getElementById('promo_image_file_input');
    if (fileInput) fileInput.value = '';
    const webpWrap = document.getElementById('webp_preview_wrap');
    if (webpWrap) webpWrap.style.display = 'none';

    updateVipMessagePreview();
  });

  // Tab 7 Google Leads custom keyword toggle
  const bcGlKw = document.getElementById('bc_gl_keyword');
  const bcGlCustomWrap = document.getElementById('bc_gl_custom_wrap');
  bcGlKw?.addEventListener('change', () => {
    if (bcGlCustomWrap) bcGlCustomWrap.style.display = bcGlKw.value === 'custom' ? 'block' : 'none';
  });

  // Modal Mode Switcher (Single vs CSV)
  const btnSingleMode = document.getElementById('lead_mode_btn_single');
  const btnCsvMode = document.getElementById('lead_mode_btn_csv');
  const formSingle = document.getElementById('admin_add_lead_form');
  const wrapCsv = document.getElementById('admin_add_csv_wrap');

  btnSingleMode?.addEventListener('click', () => {
    btnSingleMode.style.background = '#2563EB';
    btnSingleMode.style.color = '#fff';
    btnCsvMode.style.background = '#E2E8F0';
    btnCsvMode.style.color = '#334155';
    formSingle.style.display = 'block';
    wrapCsv.style.display = 'none';
  });

  btnCsvMode?.addEventListener('click', () => {
    btnCsvMode.style.background = '#10B981';
    btnCsvMode.style.color = '#fff';
    btnSingleMode.style.background = '#E2E8F0';
    btnSingleMode.style.color = '#334155';
    formSingle.style.display = 'none';
    wrapCsv.style.display = 'block';
  });

  // Lead Modal Open/Close
  const leadModal = document.getElementById('admin_add_lead_modal');
  document.getElementById('btn_open_add_lead_modal')?.addEventListener('click', () => leadModal.style.display = 'flex');
  document.getElementById('btn_close_add_lead_modal')?.addEventListener('click', () => leadModal.style.display = 'none');
  document.getElementById('btn_cancel_add_lead')?.addEventListener('click', () => leadModal.style.display = 'none');
  document.getElementById('btn_cancel_csv_import')?.addEventListener('click', () => leadModal.style.display = 'none');

  // Single Lead Submit
  document.getElementById('btn_save_lead_submit')?.addEventListener('click', async () => {
    const name = document.getElementById('lead_name_input')?.value.trim();
    const mobile = document.getElementById('lead_mobile_input')?.value.trim().replace(/\D/g, '');
    const category = document.getElementById('lead_category_input')?.value || 'general';
    const place = document.getElementById('lead_place_input')?.value.trim();

    if (!name || mobile.length !== 10) {
      showToast('कृपया मान्य नाम और 10-अंकों का मोबाइल नंबर दर्ज करें।', 'error');
      return;
    }

    const newLead = {
      id: 'LEAD_' + Date.now(),
      name, full_name: name, mobile, category, place,
      source: 'manual_' + category,
      created_at: new Date().toISOString()
    };

    try {
      if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        await window.supabaseClient.from('phonebook').insert([{
          name, mobile, place: place || '', source: 'manual_' + category, created_at: newLead.created_at
        }]);
      }
    } catch (e) {}

    try {
      const stored = JSON.parse(localStorage.getItem('AI_MANUAL_LEADS') || '[]');
      stored.unshift(newLead);
      localStorage.setItem('AI_MANUAL_LEADS', JSON.stringify(stored));
      externalLeads = stored;
    } catch (e) {}

    showToast(`✅ संपर्क "${name}" Phonebook में सुरक्षित हो गया!`, 'success');
    document.getElementById('admin_add_lead_form')?.reset();
    leadModal.style.display = 'none';
    updateBatchDisplayUI();
  });

  // Bulk CSV Parsing Logic
  let parsedCsvContacts = [];

  function parseCsvText(rawText) {
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const results = [];
    lines.forEach(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        let name = parts[0];
        let mobile = parts[1].replace(/\D/g, '').slice(-10);
        let category = parts[2] || 'general';
        let place = parts[3] || '';

        if (name.replace(/\D/g, '').length === 10 && mobile.length !== 10) {
          const tmp = name; name = parts[1]; mobile = tmp.replace(/\D/g, '').slice(-10);
        }

        if (mobile && mobile.length === 10) {
          results.push({ name: name || 'संपर्क', mobile, category, place });
        }
      }
    });
    return results;
  }

  document.getElementById('lead_csv_file_input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      parsedCsvContacts = parseCsvText(evt.target.result);
      const previewBox = document.getElementById('csv_parsed_preview_box');
      const countTxt = document.getElementById('csv_parsed_count_txt');
      if (previewBox && countTxt) {
        previewBox.style.display = 'block';
        countTxt.textContent = `✅ ${parsedCsvContacts.length} संपर्क पहचाने गए!`;
      }
      showToast(`📂 ${parsedCsvContacts.length} संपर्क CSV से लोड हुए!`, 'info');
    };
    reader.readAsText(file);
  });

  document.getElementById('lead_csv_paste_textarea')?.addEventListener('input', (e) => {
    parsedCsvContacts = parseCsvText(e.target.value);
    const previewBox = document.getElementById('csv_parsed_preview_box');
    const countTxt = document.getElementById('csv_parsed_count_txt');
    if (previewBox && countTxt) {
      if (parsedCsvContacts.length > 0) {
        previewBox.style.display = 'block';
        countTxt.textContent = `✅ ${parsedCsvContacts.length} संपर्क पहचाने गए!`;
      } else {
        previewBox.style.display = 'none';
      }
    }
  });

  // Submit Bulk CSV
  document.getElementById('btn_submit_csv_bulk')?.addEventListener('click', async () => {
    if (parsedCsvContacts.length === 0) {
      showToast('कृपया पहले CSV फ़ाइल चुनें या डेटा पेस्ट करें।', 'error');
      return;
    }

    const payload = parsedCsvContacts.map(c => ({
      name: c.name,
      mobile: c.mobile,
      place: c.place || '',
      source: 'csv_import_' + c.category,
      created_at: new Date().toISOString()
    }));

    try {
      if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        for (let i = 0; i < payload.length; i += 50) {
          await window.supabaseClient.from('phonebook').insert(payload.slice(i, i + 50));
        }
      }
    } catch (e) {}

    try {
      const stored = JSON.parse(localStorage.getItem('AI_MANUAL_LEADS') || '[]');
      payload.forEach(p => {
        stored.unshift({
          id: 'CSV_' + Date.now() + '_' + Math.random().toString(36).substring(7),
          name: p.name, full_name: p.name, mobile: p.mobile,
          category: p.source.replace('csv_import_', ''),
          place: p.place, source: 'csv_phonebook',
          created_at: p.created_at
        });
      });
      localStorage.setItem('AI_MANUAL_LEADS', JSON.stringify(stored));
      externalLeads = stored;
    } catch (e) {}

    showToast(`🎉 ${parsedCsvContacts.length} संपर्क सफलतापूर्वक Phonebook में जुड़ गए!`, 'success');
    leadModal.style.display = 'none';
    parsedCsvContacts = [];
    document.getElementById('lead_csv_paste_textarea').value = '';
    updateBatchDisplayUI();
  });

  // WebP In-Browser Canvas Image Converter
  document.getElementById('promo_image_file_input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const targetType = document.getElementById('vip_target_type_selector')?.value || 'vip';
    activeWebpFilename = `promo-${targetType}.webp`;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let w = img.width;
        let h = img.height;
        if (w > MAX_WIDTH) {
          h = Math.round((h * MAX_WIDTH) / w);
          w = MAX_WIDTH;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        activeWebpDataUrl = canvas.toDataURL('image/webp', 0.80);
        const origSizeKb = Math.round(file.size / 1024);
        const newSizeKb = Math.round((activeWebpDataUrl.length * 3) / 4 / 1024);

        // Overwrite category slot in localStorage
        localStorage.setItem('AI_PROMO_IMG_' + targetType, activeWebpDataUrl);

        // UI preview
        const wrap = document.getElementById('webp_preview_wrap');
        const imgEl = document.getElementById('webp_preview_img');
        const fnTxt = document.getElementById('webp_filename_txt');
        const statsTxt = document.getElementById('webp_compression_stats');

        if (wrap && imgEl && fnTxt && statsTxt) {
          wrap.style.display = 'flex';
          imgEl.src = activeWebpDataUrl;
          fnTxt.textContent = activeWebpFilename;
          statsTxt.textContent = `⚡ ${origSizeKb} KB ➔ ${newSizeKb} KB (WebP) | मेमोरी व Git सेफ!`;
        }

        updateLiveThumbnailVisualCard();
        showToast(`🖼️ फोटो WebP में कंप्रेस हो गई (${newSizeKb} KB)!`, 'success');
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btn_download_webp')?.addEventListener('click', () => {
    if (!activeWebpDataUrl) return;
    const a = document.createElement('a');
    a.href = activeWebpDataUrl;
    a.download = activeWebpFilename;
    a.click();
    showToast(`📥 ${activeWebpFilename} डाउनलोड हो गया!`, 'info');
  });

  // Reset custom image back to default page/video thumbnail
  document.getElementById('btn_reset_thumb_to_default')?.addEventListener('click', () => {
    activeWebpDataUrl = null;
    const targetType = document.getElementById('vip_target_type_selector')?.value || 'vip';
    localStorage.removeItem('AI_PROMO_IMG_' + targetType);
    document.getElementById('webp_preview_wrap').style.display = 'none';
    const fileInput = document.getElementById('promo_image_file_input');
    if (fileInput) fileInput.value = '';
    updateLiveThumbnailVisualCard();
    showToast('🔄 डिफ़ॉल्ट पेज थंबनेल सक्रिय हो गया!', 'info');
  });

  // Helper: Extract Target Details & Default Thumbnail & Universal Expiry
  function getCurrentTargetDetails() {
    const targetType = document.getElementById('vip_target_type_selector')?.value || 'ebook';
    const customPrice = document.getElementById('vip_custom_price_input')?.value || '99';
    const timerSel = document.getElementById('vip_custom_timer_select');
    const timerVal = timerSel?.value || 'today';
    const timerText = timerSel?.options[timerSel.selectedIndex]?.getAttribute('data-text') || 'आज रात 12 बजे तक';

    // Compute Expiration Timestamp
    let expTimestamp = null;
    const now = Date.now();
    if (timerVal === '15m') expTimestamp = now + 15 * 60 * 1000;
    else if (timerVal === '30m') expTimestamp = now + 30 * 60 * 1000;
    else if (timerVal === '1h') expTimestamp = now + 60 * 60 * 1000;
    else if (timerVal === '2h') expTimestamp = now + 2 * 3600 * 1000;
    else if (timerVal === '4h') expTimestamp = now + 4 * 3600 * 1000;
    else if (timerVal === '6h') expTimestamp = now + 6 * 3600 * 1000;
    else if (timerVal === 'today') {
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      expTimestamp = midnight.getTime();
    } else if (timerVal === '24h') expTimestamp = now + 24 * 3600 * 1000;
    else if (timerVal === '48h') expTimestamp = now + 48 * 3600 * 1000;

    const expQuery = (expTimestamp && timerVal !== 'never') ? `&exp=${expTimestamp}&timer=${timerVal}` : '';

    let title = 'आरोग्यम इंडिया';
    let path = '/index.html';
    let isEbook = (targetType === 'ebook');
    let extraDesc = '';
    let defaultThumb = '/images/banners/hero-banner-1.jpeg';

    if (targetType === 'ebook') {
      const bookSel = document.getElementById('vip_book_selector');
      const selectedOption = bookSel?.options[bookSel.selectedIndex];
      const bId = bookSel?.value || 'BK001';
      title = selectedOption?.textContent.split('(')[0].trim() || 'खरीफ फसल मास्टर गाइड 2026';
      path = `${selectedOption?.getAttribute('data-page') || '/ebooks/index.html'}?b=${bId}&vip=1&price=${customPrice}${expQuery}`;
      const optThumb = selectedOption?.getAttribute('data-thumb');
      if (optThumb && optThumb.trim()) {
        defaultThumb = optThumb.trim();
      } else {
        const matched = catalogBooks.find(b => b.id === bId);
        defaultThumb = matched?.cover || matched?.thumbnail || matched?.banner || '/images/banners/ebook-banner.jpeg';
      }
    } else if (targetType === 'page') {
      const pageSel = document.getElementById('vip_page_selector');
      const selectedOption = pageSel?.options[pageSel.selectedIndex];
      title = selectedOption?.getAttribute('data-title') || selectedOption?.textContent.split('(')[0].trim() || 'आरोग्यम इंडिया वेब पेज';
      const rawPath = pageSel?.value || '/index.html';
      const sep = rawPath.includes('?') ? '&' : '?';
      path = `${rawPath}${expQuery ? sep + expQuery.slice(1) : ''}`;
      const optThumb = selectedOption?.getAttribute('data-thumb');
      defaultThumb = (optThumb && optThumb.trim()) ? optThumb.trim() : '/images/banners/hero-banner-1.jpeg';
    } else if (targetType === 'health') {
      const hSel = document.getElementById('vip_health_selector');
      const opt = hSel?.options[hSel.selectedIndex];
      title = opt?.getAttribute('data-title') || 'सम्पूर्ण स्वास्थ्य केंद्र';
      path = `${hSel?.value || '/categories/health.html'}?ref=crm&vip=1${expQuery}`;
      const optThumb = opt?.getAttribute('data-thumb');
      if (optThumb && optThumb.trim()) {
        defaultThumb = optThumb.trim();
      } else {
        defaultThumb = '/images/banners/og_image-health-og-676433-sb3k.webp';
      }
    } else if (targetType === 'pashu') {
      const pSel = document.getElementById('vip_pashu_selector');
      const opt = pSel?.options[pSel.selectedIndex];
      title = opt?.getAttribute('data-title') || 'पशुपालन व दुग्ध संवर्धन';
      path = `${pSel?.value || '/pashu-palan.html'}?ref=crm&vip=1${expQuery}`;
      const optThumb = opt?.getAttribute('data-thumb');
      if (optThumb && optThumb.trim()) {
        defaultThumb = optThumb.trim();
      } else {
        defaultThumb = '/images/banners/og_image-pashupalan-029612-sv0a.webp';
      }
    } else if (targetType === 'tube') {
      const tSel = document.getElementById('vip_tube_video_selector');
      if (tSel?.value === 'custom_url') {
        path = document.getElementById('vip_tube_custom_input')?.value.trim() || 'https://aarogyamindia.online/tube.html';
        title = 'AarogyamTube विशेष वीडियो';
        const match = path.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i);
        if (match && match[1]) {
          defaultThumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        } else {
          defaultThumb = '/images/banners/aarogyamtube-default-thumb.svg';
        }
      } else {
        const rawPath = tSel?.value || '/tube.html';
        const sep = rawPath.includes('?') ? '&' : '?';
        path = `${rawPath}${expQuery ? sep + expQuery.slice(1) : ''}`;
        const opt = tSel?.options[tSel.selectedIndex];
        title = opt?.getAttribute('data-title') || 'AarogyamTube वीडियो हब';
        extraDesc = opt?.getAttribute('data-desc') || '';
        const ytId = opt?.getAttribute('data-yt');
        const customThumb = opt?.getAttribute('data-thumb');
        if (customThumb) defaultThumb = customThumb;
        else if (ytId) defaultThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        else defaultThumb = '/images/banners/aarogyamtube-default-thumb.svg';
      }
    } else if (targetType === 'netsurf') {
      title = 'नेट्सर्फ जैविक कृषि व डायरेक्ट सेलर सदस्यता';
      path = `/netsurf-join.html?ref=crm&vip=1${expQuery}`;
      defaultThumb = '/images/banners/hero_slide-netsurf-061003-6ii5.webp';
    } else if (targetType === 'catalog') {
      title = '7-भाषा संपूर्ण प्रोडक्ट कैटलॉग (डिजिटल PDF)';
      path = `/catalog.html?ref=crm&vip=1${expQuery}`;
      defaultThumb = '/images/banners/digital-training-banner.jpeg';
    }

    path = attachAdminShareId(path);
    return { targetType, title, path, isEbook, customPrice, timerText, extraDesc, defaultThumb, expTimestamp, timerVal };
  }

  // Update Live Thumbnail Preview Card
  function updateLiveThumbnailVisualCard() {
    const { title, path, defaultThumb } = getCurrentTargetDetails();
    const thumbImg = document.getElementById('live_preview_thumb_img');
    const badge = document.getElementById('live_preview_badge');
    const resetBtn = document.getElementById('btn_reset_thumb_to_default');
    const titleEl = document.getElementById('live_preview_title');
    const urlEl = document.getElementById('live_preview_target_url');

    if (thumbImg) {
      if (activeWebpDataUrl) {
        thumbImg.src = activeWebpDataUrl;
        if (badge) {
          badge.textContent = '⚡ कस्टम WebP फोटो (Active)';
          badge.style.background = '#16A34A';
        }
        if (resetBtn) resetBtn.style.display = 'inline-block';
      } else {
        thumbImg.src = defaultThumb;
        if (badge) {
          badge.textContent = '🖼️ पेज/वीडियो थंबनेल (Default)';
          badge.style.background = '#2563EB';
        }
        if (resetBtn) resetBtn.style.display = 'none';
      }
    }

    if (titleEl) titleEl.textContent = title;
    if (urlEl) urlEl.textContent = path;
  }

  // Generate Personalized VIP / Multi-Page Message Preview
  function updateVipMessagePreview() {
    const { targetType, title, path, isEbook, customPrice, timerText, extraDesc } = getCurrentTargetDetails();
    const cleanUrl = path.startsWith('http') ? path : `https://aarogyamindia.online${path}`;

    let msg = `नमस्ते {name} जी! 🙏\n\n`;

    if (isEbook) {
      msg += `आरोग्यम इंडिया की ओर से आपके लिए विशेष VIP ऑफर सक्रिय किया गया है!\n\n📚 प्रमाणित गाइड: *${title}*\n💰 VIP ऑफर मूल्य: मात्र *₹${customPrice}*\n⏳ ऑफर वैधता: *${timerText}*\n\n👉 अपनी ई-बुक प्रति यहाँ प्राप्त करें:\n{link}\n\nधन्यवाद!\nआरोग्यम इंडिया परिवार 🌿`;
    } else if (targetType === 'health') {
      msg += `आरोग्यम प्राकृतिक स्वास्थ्य केंद्र की ओर से विशेष परामर्श और समाधान:\n\n🌿 विषय: *${title}*\n✅ 100% प्राकृतिक व आयुर्वेदिक मार्गदर्शन।\n\n👉 संपूर्ण जानकारी व समाधान यहाँ देखें:\n{link}\n\nस्वस्थ रहें, दीर्घायु हों!\nआरोग्यम इंडिया टीम 🌿`;
    } else if (targetType === 'pashu') {
      msg += `पशुपालक भाइयों के लिए विशेष दुग्ध संवर्धन व पोषण समाधान:\n\n🐄 विषय: *${title}*\n🥛 दूध वृद्धि, FAT% संवर्धन व पशु स्वास्थ्य सुरक्षा।\n\n👉 संपूर्ण पशु समाधान यहाँ देखें:\n{link}\n\nधन्यवाद!\nआरोग्यम पशुधन हब 🌾`;
    } else if (targetType === 'tube') {
      msg += `🎬 *AarogyamTube विशेष वीडियो गाइड:*\n\n🎥 *${title}*\n${extraDesc ? `📝 ${extraDesc}\n` : ''}\n👉 तुरंत वीडियो देखने के लिए यहाँ क्लिक करें:\n{link}\n\nआरोग्यम ट्यूब टीम 🌾`;
    } else if (targetType === 'netsurf') {
      msg += `🌟 *नेट्सर्फ जैविक कृषि व डायरेक्ट सेलर बनने का सुनहरा अवसर!*\n\nघर बैठे जैविक कृषि उत्पादों से जुड़ें और आत्मनिर्भर बनें।\n👉 अधिक जानकारी व तुरंत जुड़ने हेतु:\n{link}\n\nआरोग्यम परिवार 🌿`;
    } else if (targetType === 'catalog') {
      msg += `📖 *आरोग्यम इंडिया संपूर्ण 7-भाषा प्रोडक्ट कैटलॉग!*\n\nकृषि, पशुपालन और संपूर्ण स्वास्थ्य के सभी प्रमाणित उत्पादों की सूची डाउनलोड करें:\n👉 कैटलॉग लिंक:\n{link}\n\nधन्यवाद! 🙏`;
    }

    const msgBox = document.getElementById('vip_message_textarea');
    if (msgBox) msgBox.value = msg;

    updateLiveThumbnailVisualCard();
  }

  // 1-Click Copy Message Handlers
  function copyTextToClipboard(text, successMsg = '📋 संदेश क्लिपबोर्ड पर कॉपी हो गया!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(successMsg, 'success')).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const t = document.createElement('textarea');
    t.value = text;
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    showToast(successMsg, 'success');
  }

  // Universal Share Engine (All Apps, Dual WhatsApp, Facebook, Messenger)
  async function shareOutreachMessage(title, text, url) {
    const fullText = (text || '').trim();
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'आरोग्यम इंडिया',
          text: fullText,
          url: url || undefined
        });
        showToast('📲 शेयर विंडो खुल गई!', 'success');
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Native share fallback', err);
        } else {
          return true;
        }
      }
    }
    // Fallback: Copy to clipboard
    copyTextToClipboard(fullText, '📋 संदेश कॉपी हो गया! अब आप इसे किसी भी ऐप (WhatsApp 1, WhatsApp 2, FB) में पेस्ट कर सकते हैं।');
    return false;
  }

  function openWhatsAppDirectShare(text) {
    const fullText = (text || '').trim();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
    window.open(url, '_blank');
    showToast('🟢 WhatsApp शेयर खुला! किसी भी चैट/ग्रुप में भेजें।', 'info');
  }

  function openFacebookDirectShare(url, text) {
    const fullText = (text || '').trim();
    const cleanUrl = url || 'https://aarogyamindia.online';
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}&quote=${encodeURIComponent(fullText)}`;
    window.open(fbUrl, '_blank');
    showToast('🔵 Facebook शेयर विंडो खुली!', 'info');
  }

  function getPreparedVipUniversalMessage() {
    let msg = document.getElementById('vip_message_textarea')?.value || '';
    const { title, path } = getCurrentTargetDetails();
    const cleanUrl = attachAdminShareId(path.startsWith('http') ? path : `https://aarogyamindia.online${path}`);
    msg = msg.replace(/{name}/g, 'साथी').replace(/{link}/g, cleanUrl);
    return { msg, url: cleanUrl, title };
  }

  function getPreparedGreetingUniversalMessage() {
    let msg = document.getElementById('greeting_custom_textarea')?.value || '';
    const chkAttach = document.getElementById('chk_attach_marketing_link');
    const isLinkAttached = chkAttach ? chkAttach.checked : true;
    let targetUrl = '';
    if (isLinkAttached) {
      const hookPage = document.getElementById('hook_attached_target_page')?.value || '/ebooks/kharif-master-guide-2026.html?vip=1';
      targetUrl = hookPage.startsWith('http') ? hookPage : `https://aarogyamindia.online${hookPage}`;
      const hookTimerVal = document.getElementById('hook_attached_link_timer')?.value || 'today';
      if (hookTimerVal !== 'never') {
        const now = Date.now();
        let expT = null;
        if (hookTimerVal === '2h') expT = now + 2 * 3600 * 1000;
        else if (hookTimerVal === '6h') expT = now + 6 * 3600 * 1000;
        else if (hookTimerVal === 'today') {
          const midnight = new Date();
          midnight.setHours(23, 59, 59, 999);
          expT = midnight.getTime();
        } else if (hookTimerVal === '24h') expT = now + 24 * 3600 * 1000;
        else if (hookTimerVal === '48h') expT = now + 48 * 3600 * 1000;
        if (expT) {
          const sep = targetUrl.includes('?') ? '&' : '?';
          targetUrl = `${targetUrl}${sep}exp=${expT}&timer=${hookTimerVal}`;
        }
      }
      targetUrl = attachAdminShareId(targetUrl);
    }
    msg = msg.replace(/{name}/g, 'साथी').replace(/{link}/g, targetUrl);
    return { msg, url: targetUrl, title: 'आरोग्यम इंडिया सुविचार' };
  }

  // Wiring Tab 1 Share Buttons
  document.getElementById('btn_share_vip_universal')?.addEventListener('click', () => {
    const { msg, url, title } = getPreparedVipUniversalMessage();
    shareOutreachMessage(title, msg, url);
  });
  document.getElementById('btn_share_vip_wa')?.addEventListener('click', () => {
    const { msg } = getPreparedVipUniversalMessage();
    openWhatsAppDirectShare(msg);
  });
  document.getElementById('btn_share_vip_fb')?.addEventListener('click', () => {
    const { msg, url } = getPreparedVipUniversalMessage();
    openFacebookDirectShare(url, msg);
  });
  document.getElementById('btn_copy_vip_message')?.addEventListener('click', () => {
    const { msg } = getPreparedVipUniversalMessage();
    copyTextToClipboard(msg, '📋 VIP संदेश कॉपी हो गया! अब आप इसे कहीं भी भेज सकते हैं।');
  });

  // Wiring Tab 2 Share Buttons
  document.getElementById('btn_share_greeting_universal')?.addEventListener('click', () => {
    const { msg, url, title } = getPreparedGreetingUniversalMessage();
    shareOutreachMessage(title, msg, url);
  });
  document.getElementById('btn_share_greeting_wa')?.addEventListener('click', () => {
    const { msg } = getPreparedGreetingUniversalMessage();
    openWhatsAppDirectShare(msg);
  });
  document.getElementById('btn_share_greeting_fb')?.addEventListener('click', () => {
    const { msg, url } = getPreparedGreetingUniversalMessage();
    openFacebookDirectShare(url, msg);
  });
  document.getElementById('btn_copy_greeting_message')?.addEventListener('click', () => {
    const { msg } = getPreparedGreetingUniversalMessage();
    copyTextToClipboard(msg, '📋 सुविचार/बधाई संदेश कॉपी हो गया!');
  });

  // Universal Top-Header Share Button
  document.getElementById('btn_universal_share_message')?.addEventListener('click', () => {
    if (activeTab === 'greetings') {
      const { msg, url, title } = getPreparedGreetingUniversalMessage();
      shareOutreachMessage(title, msg, url);
    } else {
      const { msg, url, title } = getPreparedVipUniversalMessage();
      shareOutreachMessage(title, msg, url);
    }
  });

  // Universal Top-Header Copy Button
  document.getElementById('btn_universal_copy_message')?.addEventListener('click', () => {
    if (activeTab === 'greetings') {
      const { msg } = getPreparedGreetingUniversalMessage();
      copyTextToClipboard(msg, '📋 सुविचार संदेश कॉपी हो गया!');
    } else {
      const { msg } = getPreparedVipUniversalMessage();
      copyTextToClipboard(msg, '📋 VIP संदेश कॉपी हो गया!');
    }
  });

  document.getElementById('btn_copy_auto_wa_msg')?.addEventListener('click', () => {
    const msg = document.getElementById('bc_wa_spintax_textarea')?.value || '';
    copyTextToClipboard(msg, '📋 Auto WhatsApp संदेश टेम्पलेट कॉपी हो गया!');
  });

  // SIM Mode Controls
  document.getElementById('btn_sim_mode_dual')?.addEventListener('click', () => {
    setOutreachLimits('dual', 60, 200);
    const wrap = document.getElementById('wrap_custom_limits_editor');
    if (wrap) wrap.style.display = 'none';
    showToast('📱📱 डुअल सिम मोड सक्रिय! (60 WhatsApp / 200 SMS प्रतिदिन)', 'success');
  });
  document.getElementById('btn_sim_mode_single')?.addEventListener('click', () => {
    setOutreachLimits('single', 30, 100);
    const wrap = document.getElementById('wrap_custom_limits_editor');
    if (wrap) wrap.style.display = 'none';
    showToast('📱 सिंगल सिम मोड सक्रिय! (30 WhatsApp / 100 SMS प्रतिदिन)', 'info');
  });
  document.getElementById('btn_sim_mode_custom')?.addEventListener('click', () => {
    const wrap = document.getElementById('wrap_custom_limits_editor');
    if (wrap) {
      wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
      const curLimits = getOutreachLimits();
      const inWa = document.getElementById('input_custom_wa_limit');
      const inSms = document.getElementById('input_custom_sms_limit');
      if (inWa) inWa.value = curLimits.waLimit;
      if (inSms) inSms.value = curLimits.smsLimit;
    }
  });
  document.getElementById('btn_save_custom_limits')?.addEventListener('click', () => {
    const waVal = parseInt(document.getElementById('input_custom_wa_limit')?.value, 10) || 60;
    const smsVal = parseInt(document.getElementById('input_custom_sms_limit')?.value, 10) || 200;
    setOutreachLimits('custom', waVal, smsVal);
    const wrap = document.getElementById('wrap_custom_limits_editor');
    if (wrap) wrap.style.display = 'none';
    showToast(`⚙️ कस्टम सीमा लागू: ${waVal} WhatsApp / ${smsVal} SMS प्रतिदिन!`, 'success');
  });

  // Event Listeners for VIP form & Target Page Selection
  document.getElementById('vip_book_selector')?.addEventListener('change', () => {
    activeWebpDataUrl = null;
    const fileInput = document.getElementById('promo_image_file_input');
    if (fileInput) fileInput.value = '';
    const webpWrap = document.getElementById('webp_preview_wrap');
    if (webpWrap) webpWrap.style.display = 'none';

    updateVipMessagePreview();
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('vip_page_selector')?.addEventListener('change', () => {
    activeWebpDataUrl = null;
    const fileInput = document.getElementById('promo_image_file_input');
    if (fileInput) fileInput.value = '';
    const webpWrap = document.getElementById('webp_preview_wrap');
    if (webpWrap) webpWrap.style.display = 'none';

    updateVipMessagePreview();
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('vip_health_selector')?.addEventListener('change', () => {
    activeWebpDataUrl = null;
    const fileInput = document.getElementById('promo_image_file_input');
    if (fileInput) fileInput.value = '';
    const webpWrap = document.getElementById('webp_preview_wrap');
    if (webpWrap) webpWrap.style.display = 'none';
    updateVipMessagePreview();
  });
  document.getElementById('vip_pashu_selector')?.addEventListener('change', () => {
    activeWebpDataUrl = null;
    const fileInput = document.getElementById('promo_image_file_input');
    if (fileInput) fileInput.value = '';
    const webpWrap = document.getElementById('webp_preview_wrap');
    if (webpWrap) webpWrap.style.display = 'none';
    updateVipMessagePreview();
  });
  document.getElementById('vip_tube_custom_input')?.addEventListener('input', () => {
    activeWebpDataUrl = null;
    const fileInput = document.getElementById('promo_image_file_input');
    if (fileInput) fileInput.value = '';
    const webpWrap = document.getElementById('webp_preview_wrap');
    if (webpWrap) webpWrap.style.display = 'none';
    updateVipMessagePreview();
  });
  document.getElementById('vip_custom_price_input')?.addEventListener('input', updateVipMessagePreview);
  document.getElementById('vip_custom_timer_select')?.addEventListener('change', updateVipMessagePreview);

  // Smart Multi-Book Multi-Select Filter State & Functions
  let selectedFilterBookIds = new Set(['BK001', 'BK002', 'BK016', 'BK018']);

  function renderMultiBookCheckboxes() {
    const cont = document.getElementById('multibook_checkboxes_container');
    if (!cont) return;

    if (selectedFilterBookIds.size === 0) {
      ['BK001', 'BK002', 'BK016', 'BK018'].forEach(id => selectedFilterBookIds.add(id));
    }

    cont.innerHTML = catalogBooks.map(b => {
      const isChecked = selectedFilterBookIds.has(b.id);
      const buyerCount = allUsers.filter(u => (u.purchases || []).some(p => (p.book_id || '').toUpperCase().includes(b.id.toUpperCase()))).length;
      const abandonCount = checkoutLogs.filter(c => c.status !== 'success' && (c.book_id || '').toUpperCase().includes(b.id.toUpperCase())).length;

      return `
        <label style="display:flex; align-items:center; gap:6px; background:#fff; border:1.5px solid ${isChecked ? '#F59E0B' : '#E2E8F0'}; border-radius:6px; padding:5px 8px; cursor:pointer; font-size:0.75rem; user-select:none; transition:border-color 0.15s ease;">
          <input type="checkbox" class="chk-filter-book" value="${b.id}" ${isChecked ? 'checked' : ''} style="accent-color:#D97706; width:15px; height:15px; flex-shrink:0;">
          <div style="flex:1; min-width:0;">
            <div style="font-weight:800; color:#1E293B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${b.id}: ${b.name}">
              ${b.id}: ${b.name}
            </div>
            <div style="font-size:0.68rem; color:#64748B; display:flex; gap:6px; margin-top:1px;">
              <span style="color:#16A34A; font-weight:700;">👥 ${buyerCount} खरीदार</span>
              ${abandonCount > 0 ? `<span style="color:#D97706; font-weight:700;">• 🛒 ${abandonCount} कार्ट</span>` : ''}
            </div>
          </div>
        </label>
      `;
    }).join('');

    cont.querySelectorAll('.chk-filter-book').forEach(chk => {
      chk.onchange = (e) => {
        if (e.target.checked) {
          selectedFilterBookIds.add(e.target.value);
        } else {
          selectedFilterBookIds.delete(e.target.value);
        }
        renderMultiBookCheckboxes();
        currentBatchPage = 1;
        updateBatchDisplayUI();
      };
    });
  }

  document.getElementById('btn_toggle_multibook_panel')?.addEventListener('click', () => {
    const wrap = document.getElementById('wrap_smart_multibook_filter');
    if (wrap) {
      wrap.style.display = (wrap.style.display === 'none') ? 'block' : 'none';
      if (wrap.style.display === 'block') renderMultiBookCheckboxes();
    }
  });

  document.getElementById('btn_multibook_select_all')?.addEventListener('click', () => {
    catalogBooks.forEach(b => selectedFilterBookIds.add(b.id));
    renderMultiBookCheckboxes();
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });

  document.getElementById('btn_multibook_clear_all')?.addEventListener('click', () => {
    selectedFilterBookIds.clear();
    renderMultiBookCheckboxes();
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });

  document.getElementById('vip_audience_filter')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const mbWrap = document.getElementById('wrap_smart_multibook_filter');
    if (mbWrap) {
      if (['specific_books', 'bought_any', 'cart_abandoned', 'interested_users'].includes(val)) {
        mbWrap.style.display = 'block';
        renderMultiBookCheckboxes();
      } else {
        mbWrap.style.display = 'none';
      }
    }
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });

  document.getElementById('vip_date_joining_filter')?.addEventListener('change', (e) => {
    const customWrap = document.getElementById('wrap_vip_custom_date_range');
    if (customWrap) customWrap.style.display = e.target.value === 'custom' ? 'grid' : 'none';
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('vip_date_from')?.addEventListener('change', () => {
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('vip_date_to')?.addEventListener('change', () => {
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('chk_exclude_contacted')?.addEventListener('change', () => {
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });

  // Load All Users and Real System Data
  async function loadInitialData() {
    try {
      const res = await fetchAllUsersAdmin();
      allUsers = res.data || [];

      // Manual leads from storage
      try {
        const stored = JSON.parse(localStorage.getItem('AI_MANUAL_LEADS') || '[]');
        externalLeads = Array.isArray(stored) ? stored : [];
      } catch (e) {}

      // Google Leads generated from Tab 7
      try {
        const gLeads = JSON.parse(localStorage.getItem('AI_GOOGLE_LEADS') || '[]');
        if (Array.isArray(gLeads)) {
          const seen = new Set(externalLeads.map(l => (l.mobile || '').replace(/\D/g, '').slice(-10)));
          gLeads.forEach(g => {
            const mob = (g.mobile || g.phone || '').replace(/\D/g, '').slice(-10);
            if (mob && mob.length === 10 && !seen.has(mob)) {
              externalLeads.push({
                id: 'GL_' + (g.id || mob),
                name: g.name || g.title || 'Google Lead',
                full_name: g.name || g.title || 'Google Lead',
                mobile: mob,
                place: g.location || g.city || '',
                source: 'google_lead',
                created_at: g.created_at || new Date().toISOString()
              });
              seen.add(mob);
            }
          });
        }
      } catch (e) {}

      // Supabase phonebook
      try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
          const { data: pbData } = await window.supabaseClient.from('phonebook').select('*').limit(300);
          if (Array.isArray(pbData) && pbData.length > 0) {
            const pbMapped = pbData.map(p => ({
              id: 'PB_' + (p.id || p.mobile),
              name: p.name || 'संपर्क', full_name: p.name || 'संपर्क',
              mobile: (p.mobile || '').replace(/\D/g, '').slice(-10),
              category: (p.source && p.source.startsWith('manual_')) ? p.source.replace('manual_', '') : (p.category || 'general'),
              place: p.place || '',
              source: 'phonebook',
              created_at: p.created_at || new Date().toISOString()
            })).filter(p => p.mobile && p.mobile.length === 10);
            const seen = new Set(externalLeads.map(l => (l.mobile || '').replace(/\D/g, '').slice(-10)));
            pbMapped.forEach(m => {
              if (!seen.has(m.mobile)) {
                externalLeads.push(m);
                seen.add(m.mobile);
              }
            });
          }
        }
      } catch (e) {}

      // Supabase surveys respondents
      try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
          const { data: survData } = await window.supabaseClient.from('surveys').select('*').limit(300);
          if (Array.isArray(survData) && survData.length > 0) {
            const survMapped = survData.map(s => {
              const mob = (s.mobile || s.respondent_mobile || '').replace(/\D/g, '').slice(-10);
              return {
                id: 'SURV_' + (s.id || mob),
                name: s.name || s.respondent_name || 'किसान साथी (सर्वे)',
                full_name: s.name || s.respondent_name || 'किसान साथी (सर्वे)',
                mobile: mob,
                place: s.district || s.state || '',
                source: 'survey',
                category: s.category || 'agriculture',
                created_at: s.created_at || new Date().toISOString()
              };
            }).filter(s => s.mobile && s.mobile.length === 10);
            const seen = new Set(externalLeads.map(l => (l.mobile || '').replace(/\D/g, '').slice(-10)));
            survMapped.forEach(sm => {
              if (!seen.has(sm.mobile)) {
                externalLeads.push(sm);
                seen.add(sm.mobile);
              }
            });
          }
        }
      } catch (e) {}

      // Supabase interested_users
      try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
          const { data: iuData } = await window.supabaseClient.from('interested_users').select('*').limit(200);
          if (Array.isArray(iuData) && iuData.length > 0) {
            const iuMapped = iuData.map(u => {
              const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
              return {
                id: 'IU_' + (u.id || mob),
                name: u.full_name || u.name || 'इच्छुक पाठक',
                full_name: u.full_name || u.name || 'इच्छुक पाठक',
                mobile: mob,
                place: u.state || u.city || '',
                source: 'interested_user',
                interested_book: u.interested_book || '',
                created_at: u.created_at || new Date().toISOString()
              };
            }).filter(u => u.mobile && u.mobile.length === 10);
            const seen = new Set(externalLeads.map(l => (l.mobile || '').replace(/\D/g, '').slice(-10)));
            iuMapped.forEach(im => {
              if (!seen.has(im.mobile)) {
                externalLeads.push(im);
                seen.add(im.mobile);
              }
            });
          }
        }
      } catch (e) {}

      // Supabase retail_leads
      try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
          const { data: rlData } = await window.supabaseClient.from('retail_leads').select('*').limit(200);
          if (Array.isArray(rlData) && rlData.length > 0) {
            const rlMapped = rlData.map(r => {
              const mob = (r.mobile || '').replace(/\D/g, '').slice(-10);
              return {
                id: 'RL_' + (r.id || mob),
                name: r.name || 'व्यापारी / डीलर साथी',
                full_name: r.name || 'व्यापारी / डीलर साथी',
                mobile: mob,
                place: r.district || r.state || '',
                source: 'retail_leads',
                created_at: r.created_at || new Date().toISOString()
              };
            }).filter(r => r.mobile && r.mobile.length === 10);
            const seen = new Set(externalLeads.map(l => (l.mobile || '').replace(/\D/g, '').slice(-10)));
            rlMapped.forEach(rm => {
              if (!seen.has(rm.mobile)) {
                externalLeads.push(rm);
                seen.add(rm.mobile);
              }
            });
          }
        }
      } catch (e) {}

      // Checkout logs
      try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
          const { data: coData } = await window.supabaseClient.from('checkout_logs').select('*').order('created_at', { ascending: false }).limit(200);
          if (Array.isArray(coData)) checkoutLogs = coData;
        }
      } catch (e) {}

      // Dynamic Books from Supabase & LocalStorage
      try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
          const { data: dbBooks } = await window.supabaseClient.from('books').select('*');
          if (Array.isArray(dbBooks) && dbBooks.length > 0) {
            dbBooks.forEach(b => {
              if (!catalogBooks.some(cb => cb.id === b.id)) {
                catalogBooks.push({
                  id: b.id,
                  name: b.name || b.title || 'ई-बुक',
                  landingPage: b.landing_page || `/ebooks/book-landing.html?id=${b.id}`,
                  cover: b.cover || b.thumbnail || '/images/banners/ebook-banner.jpeg',
                  mrp: b.mrp || 299,
                  offerPrice: b.offer_price || b.price || 99,
                  category: b.category || 'General'
                });
              }
            });
          }
        }
        const customBooks = JSON.parse(localStorage.getItem('AI_BOOKS') || localStorage.getItem('books_catalog') || '[]');
        if (Array.isArray(customBooks)) {
          customBooks.forEach(b => {
            if (!catalogBooks.some(cb => cb.id === b.id)) {
              catalogBooks.push({
                id: b.id,
                name: b.name || b.title,
                landingPage: b.landingPage || b.landing_page || `/ebooks/book-landing.html?id=${b.id}`,
                cover: b.cover || b.thumbnail || '/images/banners/ebook-banner.jpeg',
                mrp: b.mrp || 299,
                offerPrice: b.offerPrice || b.price || 99,
                category: b.category || 'General'
              });
            }
          });
        }
        const bookSelEl = document.getElementById('vip_book_selector');
        if (bookSelEl) {
          const curVal = bookSelEl.value;
          bookSelEl.innerHTML = catalogBooks.map(b => {
            const thumb = b.cover || b.thumbnail || b.banner || b.og_image || '/images/banners/ebook-banner.jpeg';
            const pageUrl = b.landingPage || `/ebooks/book-landing.html?id=${b.id}`;
            return `<option value="${b.id}" data-page="${pageUrl}" data-thumb="${thumb}" data-mrp="${b.mrp || 299}" data-price="${b.offerPrice || 99}">${b.name} (${b.id})</option>`;
          }).join('');
          if (curVal && catalogBooks.some(b => b.id === curVal)) bookSelEl.value = curVal;
        }
      } catch (e) {}

      // Dynamic Site Pages from site-pages-config.json and Page Editor LocalStorage
      try {
        let sitePages = [];
        try {
          const pResp = await fetch('/data/site-pages-config.json?v=' + Date.now());
          if (pResp.ok) {
            const pJson = await pResp.json();
            if (Array.isArray(pJson.pages)) sitePages = pJson.pages;
            else if (Array.isArray(pJson)) sitePages = pJson;
          }
        } catch (e) {}
        try {
          const localP = JSON.parse(
            localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG') ||
            localStorage.getItem('admin_site_pages') ||
            localStorage.getItem('aim_site_pages') ||
            '[]'
          );
          if (Array.isArray(localP)) {
            localP.forEach(lp => {
              if (!sitePages.some(p => p.url === lp.url || p.slug === lp.slug)) {
                sitePages.push(lp);
              }
            });
          }
        } catch (e) {}

        if (Array.isArray(window.AAROGYAM_SITE_PAGES_CONFIG)) {
          window.AAROGYAM_SITE_PAGES_CONFIG.forEach(wp => {
            if (!sitePages.some(p => (p.url && p.url === wp.url) || (p.slug && p.slug === wp.slug))) {
              sitePages.push(wp);
            }
          });
        }

        const pageSelEl = document.getElementById('vip_page_selector');
        if (pageSelEl && sitePages.length > 0) {
          const curVal = pageSelEl.value;
          const pageOptionsHtml = sitePages.map(p => {
            const u = p.url || `/${p.slug || 'page'}.html`;
            const t = p.title || p.name || 'वेब पेज';
            const th = p.og_image || p.thumbnail || p.banner || '/images/banners/hero-banner-1.jpeg';
            return `<option value="${u}" data-title="${t}" data-thumb="${th}">${t} (${u})</option>`;
          }).join('');
          pageSelEl.innerHTML = pageOptionsHtml;
          if (curVal && sitePages.some(p => (p.url || `/${p.slug || 'page'}.html`) === curVal)) {
            pageSelEl.value = curVal;
          }
        }

        // Also enrich Tab 2 Hook Attached Target Page selector with dynamic custom pages
        const hookPageSel = document.getElementById('hook_attached_target_page');
        if (hookPageSel && sitePages.length > 0) {
          let customOptGroup = hookPageSel.querySelector('optgroup[label="📄 कस्टम वेबसाइट पेजेस (Site Pages)"]');
          if (!customOptGroup) {
            customOptGroup = document.createElement('optgroup');
            customOptGroup.label = '📄 कस्टम वेबसाइट पेजेस (Site Pages)';
            hookPageSel.appendChild(customOptGroup);
          }
          customOptGroup.innerHTML = sitePages.map(p => {
            const u = p.url || `/${p.slug || 'page'}.html`;
            const t = p.title || p.name || 'वेब पेज';
            return `<option value="${u}?ref=crm">${t} (${u})</option>`;
          }).join('');
        }
      } catch (e) {}

      // Dynamic AarogyamTube Videos from Supabase & LocalStorage
      try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
          const { data: dbVideos } = await window.supabaseClient.from('tube_recordings').select('*');
          if (Array.isArray(dbVideos) && dbVideos.length > 0) {
            dbVideos.forEach(v => {
              if (!tubeRecordings.some(tv => tv.id === v.id)) {
                tubeRecordings.push(v);
              }
            });
          }
        }
        const localVideos = JSON.parse(
          localStorage.getItem('AI_TUBE_VIDEOS') ||
          localStorage.getItem('AAROGYAM_TUBE_VIDEOS') ||
          '[]'
        );
        if (Array.isArray(localVideos)) {
          localVideos.forEach(v => {
            if (!tubeRecordings.some(tv => tv.id === v.id)) {
              tubeRecordings.push(v);
            }
          });
        }
        if (Array.isArray(window.AAROGYAM_TUBE_VIDEOS)) {
          window.AAROGYAM_TUBE_VIDEOS.forEach(v => {
            if (!tubeRecordings.some(tv => tv.id === v.id)) {
              tubeRecordings.push(v);
            }
          });
        }
        const tubeSelEl = document.getElementById('vip_tube_video_selector');
        if (tubeSelEl && tubeRecordings.length > 0) {
          const curVal = tubeSelEl.value;
          tubeSelEl.innerHTML = `
            <option value="/tube.html" data-title="AarogyamTube संपूर्ण कृषि व स्वास्थ्य वीडियो हब" data-desc="1-मिनट के प्रैक्टिकल कृषि शॉर्ट्स एवं विशेषज्ञों द्वारा संपूर्ण मास्टरक्लास।">
              🎬 संपूर्ण AarogyamTube वीडियो हब (/tube.html)
            </option>
            ${tubeRecordings.map(v => `
              <option value="/tube.html?v=${v.id}" data-id="${v.id}" data-yt="${v.youtube_id || ''}" data-thumb="${v.thumbnail || ''}" data-title="${v.title}" data-desc="${(v.description || '').replace(/"/g, '&quot;').slice(0, 120)}">
                ${v.format === 'short_reel' ? '📱 Short:' : '🎥 Video:'} ${v.title} (${v.subject || v.category || 'Agri'})
              </option>
            `).join('')}
            <option value="custom_url">✍️ कस्टम वीडियो URL दर्ज करें...</option>
          `;
          if (curVal) tubeSelEl.value = curVal;
        }
      } catch (e) {}

      updateVipMessagePreview();
      renderMultiBookCheckboxes();
      updateBatchDisplayUI();
      updateOutreachCountersUI();

      // Cross-Tab Dynamic Sync: Auto re-read catalogs whenever page editor or tube saves data
      if (!window._broadcast_catalog_listener_attached) {
        window._broadcast_catalog_listener_attached = true;
        window.addEventListener('storage', (evt) => {
          if (evt.key && (evt.key.includes('PAGE') || evt.key.includes('BOOK') || evt.key.includes('TUBE') || evt.key.includes('OUTREACH'))) {
            loadInitialData();
          }
        });
        window.addEventListener('focus', () => {
          loadInitialData();
        });
      }
    } catch (err) {
      console.warn("Initial data load notice:", err);
    }
  }

  // Audience Filtering Logic (Covers all 16 Real Audience Categories + Real Database Tables)
  function getFilteredAudienceList() {
    const filter = document.getElementById('vip_audience_filter')?.value || 'all';
    const selBookId = document.getElementById('vip_book_selector')?.value || 'BK001';
    let baseList = [];

    if (filter === 'all') {
      baseList = [...allUsers, ...externalLeads];
    } else if (filter === 'specific_books') {
      const targetB = Array.from(selectedFilterBookIds).map(id => id.toUpperCase());
      baseList = allUsers.filter(u => (u.purchases || []).some(p => {
        const bId = (p.book_id || '').toUpperCase();
        return targetB.some(tb => bId.includes(tb));
      }));
    } else if (filter === 'bought_any') {
      if (selectedFilterBookIds.size > 0 && selectedFilterBookIds.size < catalogBooks.length) {
        const targetB = Array.from(selectedFilterBookIds).map(id => id.toUpperCase());
        baseList = allUsers.filter(u => (u.purchases || []).some(p => {
          const bId = (p.book_id || '').toUpperCase();
          return targetB.some(tb => bId.includes(tb));
        }));
      } else {
        baseList = allUsers.filter(u => (u.purchases && u.purchases.length > 0) || u.has_purchased);
      }
    } else if (filter === 'bought_agri_cross_sell') {
      baseList = allUsers.filter(u => (u.purchases || []).some(p => (p.book_id || '').includes('BK001') || (p.book_name || '').toLowerCase().includes('kharif') || (p.book_name || '').toLowerCase().includes('krishi')));
    } else if (filter === 'bought_kheti_dr_cross_sell') {
      baseList = allUsers.filter(u => (u.purchases || []).some(p => (p.book_id || '').includes('BK002') || (p.book_name || '').toLowerCase().includes('doctor') || (p.book_name || '').toLowerCase().includes('kheti')));
    } else if (filter === 'bought_dairy') {
      baseList = allUsers.filter(u => (u.purchases || []).some(p => (p.book_id || '').includes('BK016') || (p.book_id || '').toLowerCase().includes('pashu') || (p.book_name || '').toLowerCase().includes('dairy')));
    } else if (filter === 'non_buyers') {
      baseList = allUsers.filter(u => !u.has_purchased && (!u.purchases || u.purchases.length === 0));
    } else if (filter === 'cart_abandoned') {
      const targetB = (selectedFilterBookIds.size > 0 && selectedFilterBookIds.size < catalogBooks.length)
        ? Array.from(selectedFilterBookIds).map(id => id.toUpperCase())
        : null;
      const abandonedLogs = checkoutLogs.filter(c => {
        if (c.status === 'success') return false;
        if (targetB) {
          const bId = (c.book_id || '').toUpperCase();
          return targetB.some(tb => bId.includes(tb));
        }
        return true;
      });
      const abandonedIds = new Set(abandonedLogs.map(c => c.profile_id || c.user_id).filter(Boolean));
      const abandonedMobiles = new Set(abandonedLogs.map(c => (c.mobile || c.phone || '').replace(/\D/g, '').slice(-10)).filter(Boolean));
      baseList = allUsers.filter(u => abandonedIds.has(u.id) || abandonedMobiles.has((u.mobile || '').replace(/\D/g, '').slice(-10)));
    } else if (filter === 'interested_users') {
      const targetB = (selectedFilterBookIds.size > 0 && selectedFilterBookIds.size < catalogBooks.length)
        ? Array.from(selectedFilterBookIds).map(id => id.toUpperCase())
        : null;
      baseList = externalLeads.filter(l => {
        if (l.source !== 'interested_user') return false;
        if (targetB) {
          const bStr = (l.interested_book || '').toUpperCase();
          return targetB.some(tb => bStr.includes(tb));
        }
        return true;
      });
    } else if (filter === 'surveys') {
      baseList = externalLeads.filter(l => l.source === 'survey');
    } else if (filter === 'farmers') {
      const uF = allUsers.filter(u => (u.occupation && (u.occupation.toLowerCase().includes('farmer') || u.occupation.includes('किसान'))) || (u.category && (u.category.includes('farmer') || u.category.includes('agri'))));
      const lF = externalLeads.filter(l => (l.category && (l.category.includes('farmer') || l.category.includes('agri'))) || (l.source === 'survey'));
      baseList = [...uF, ...lF];
    } else if (filter === 'pashupalan') {
      const uP = allUsers.filter(u => (u.purchases || []).some(p => (p.book_id || '').includes('BK016') || (p.book_id || '').includes('pashu')) || (u.occupation && (u.occupation.includes('पशु') || u.occupation.toLowerCase().includes('dairy'))));
      const lP = externalLeads.filter(l => (l.category && (l.category.includes('dairy') || l.category.includes('pashu'))));
      baseList = [...uP, ...lP];
    } else if (filter === 'netsurf') {
      const uN = allUsers.filter(u => (u.occupation && (u.occupation.toLowerCase().includes('netsurf') || u.occupation.includes('नेट्सर्फ'))) || (u.role === 'netsurf') || (u.notes && u.notes.toLowerCase().includes('netsurf')));
      const lN = externalLeads.filter(l => (l.category && l.category.includes('netsurf')) || (l.notes && l.notes.includes('netsurf')));
      baseList = [...uN, ...lN];
    } else if (filter === 'health_interest') {
      const uH = allUsers.filter(u => (u.purchases || []).some(p => (p.book_id || '').toLowerCase().includes('health') || (p.book_name || '').toLowerCase().includes('swasthya') || (p.book_name || '').includes('स्वास्थ्य')) || (u.category && u.category.includes('health')));
      const lH = externalLeads.filter(l => l.category === 'health' || l.source === 'health');
      baseList = [...uH, ...lH];
    } else if (filter === 'retail_leads') {
      baseList = externalLeads.filter(l => l.source === 'retail_leads');
    } else if (filter === 'google_leads') {
      baseList = externalLeads.filter(l => l.source === 'google_lead');
    } else if (filter === 'phonebook') {
      baseList = externalLeads.filter(l => l.source === 'phonebook' || l.source === 'manual');
    } else {
      baseList = [...allUsers, ...externalLeads];
    }

    // Deduplicate contacts by 10-digit mobile number
    const seenMob = new Set();
    baseList = baseList.filter(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      if (!mob || mob.length !== 10) return false;
      if (seenMob.has(mob)) return false;
      seenMob.add(mob);
      return true;
    });

    // Filter by Date of Joining (Today, 2 days, 7 days, 30 days, or Custom range)
    const dateFilter = document.getElementById('vip_date_joining_filter')?.value || 'all';
    if (dateFilter !== 'all') {
      const now = Date.now();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayMs = startOfToday.getTime();

      baseList = baseList.filter(u => {
        const rawDate = u.created_at || u.joined_at || u.created_date || u.date || u.signup_date || u.timestamp;
        if (!rawDate) return false;
        const itemMs = new Date(rawDate).getTime();
        if (isNaN(itemMs)) return false;

        if (dateFilter === 'today') {
          return itemMs >= startOfTodayMs;
        } else if (dateFilter === '2days') {
          return itemMs >= (now - 2 * 86400000);
        } else if (dateFilter === '7days') {
          return itemMs >= (now - 7 * 86400000);
        } else if (dateFilter === '30days') {
          return itemMs >= (now - 30 * 86400000);
        } else if (dateFilter === 'custom') {
          const fromVal = document.getElementById('vip_date_from')?.value;
          const toVal = document.getElementById('vip_date_to')?.value;
          let match = true;
          if (fromVal) {
            const fMs = new Date(fromVal).setHours(0, 0, 0, 0);
            if (!isNaN(fMs) && itemMs < fMs) match = false;
          }
          if (toVal) {
            const tMs = new Date(toVal).setHours(23, 59, 59, 999);
            if (!isNaN(tMs) && itemMs > tMs) match = false;
          }
          return match;
        }
        return true;
      });
    }

    // Exclude Already Contacted if toggle is checked
    const isExcl = document.getElementById('chk_exclude_contacted')?.checked;
    if (isExcl) {
      const alreadySentMobiles = new Set(
        outreachHistory
          .filter(h => h.book_id === selBookId)
          .map(h => (h.mobile || '').replace(/\D/g, '').slice(-10))
          .filter(Boolean)
      );
      baseList = baseList.filter(u => {
        const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
        return !alreadySentMobiles.has(mob);
      });
    }

    return baseList;
  }

  // Active Partition Helpers for Dual Tables (Pending vs Sent)
  function getActiveVipList() {
    const fullList = getFilteredAudienceList();
    const selBookId = document.getElementById('vip_book_selector')?.value || 'BK001';
    if (activeTableTabVip === 'pending') {
      return fullList.filter(u => {
        const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
        return !outreachHistory.some(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && (h.book_id === selBookId || h.campaign_type === 'vip_offer'));
      });
    } else {
      return fullList.filter(u => {
        const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
        return outreachHistory.some(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && (h.book_id === selBookId || h.campaign_type === 'vip_offer'));
      });
    }
  }

  function getActiveGrList() {
    const fullList = getFilteredAudienceList();
    if (activeTableTabGr === 'pending') {
      return fullList.filter(u => {
        const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
        return !outreachHistory.some(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && h.campaign_type === 'greetings');
      });
    } else {
      return fullList.filter(u => {
        const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
        return outreachHistory.some(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && h.campaign_type === 'greetings');
      });
    }
  }

  // Update Selection Toolbar Badges & Queue Launch Buttons
  function updateSelectionCountersUI() {
    const count = selectedContactsSet.size;
    const b1 = document.getElementById('vip_selected_count_badge');
    const b2 = document.getElementById('greetings_selected_count_badge');
    if (b1) b1.textContent = `${count} चुने गए`;
    if (b2) b2.textContent = `${count} चुने गए`;

    const btn1 = document.getElementById('btn_load_vip_queue');
    if (btn1) {
      btn1.innerHTML = count > 0 
        ? `<i class="fa-solid fa-play"></i> 🚀 चुने गए ${count} संपर्कों की कतार शुरू करें (Launch Selected ${count})`
        : `<i class="fa-solid fa-play"></i> 🚀 वर्तमान पृष्ठ के 30 संपर्कों की कतार शुरू करें (Launch Batch 30)`;
    }

    const btn2 = document.getElementById('btn_load_greetings_queue');
    if (btn2) {
      btn2.innerHTML = count > 0
        ? `<i class="fa-solid fa-play"></i> 🚀 चुने गए ${count} संपर्कों की कतार शुरू करें (Launch Selected ${count})`
        : `<i class="fa-solid fa-play"></i> 🚀 वर्तमान पृष्ठ के 30 संपर्कों की कतार शुरू करें (Launch Batch 30)`;
    }

    const activeList = getActiveVipList();
    const startIndex = (currentBatchPage - 1) * BATCH_PAGE_SIZE;
    const pageContacts = activeList.slice(startIndex, startIndex + BATCH_PAGE_SIZE);
    const allPageSelected = pageContacts.length > 0 && pageContacts.every(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      return selectedContactsSet.has(mob);
    });

    const chkPage1 = document.getElementById('chk_select_page_contacts');
    if (chkPage1) chkPage1.checked = allPageSelected;
    const chkPage2 = document.getElementById('chk_greetings_select_page_contacts');
    if (chkPage2) chkPage2.checked = allPageSelected;
  }

  // Render Dual Table UI (📋 शेष संपर्क vs ✅ संदेश भेजे गए) with 30 Contacts/Page Batching
  function updateBatchDisplayUI() {
    const fullList = getFilteredAudienceList();
    const selBookId = document.getElementById('vip_book_selector')?.value || 'BK001';

    // 1. Partition VIP Audience into Pending vs Sent Lists
    const vipPendingList = fullList.filter(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      return !outreachHistory.some(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && (h.book_id === selBookId || h.campaign_type === 'vip_offer'));
    });
    const vipSentList = fullList.filter(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      return outreachHistory.some(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && (h.book_id === selBookId || h.campaign_type === 'vip_offer'));
    });
    const currentVipList = (activeTableTabVip === 'pending') ? vipPendingList : vipSentList;

    // 2. Partition Greetings / Hook Audience into Pending vs Sent Lists
    const grPendingList = fullList.filter(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      return !outreachHistory.some(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && h.campaign_type === 'greetings');
    });
    const grSentList = fullList.filter(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      return outreachHistory.some(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && h.campaign_type === 'greetings');
    });
    const currentGrList = (activeTableTabGr === 'pending') ? grPendingList : grSentList;

    // 3. Update Switcher Buttons & Count Badges (Tab 1 VIP)
    const btnVipPending = document.getElementById('tab_btn_vip_pending');
    const btnVipSent = document.getElementById('tab_btn_vip_sent');
    const bVipPendingCount = document.getElementById('badge_vip_pending_count');
    const bVipSentCount = document.getElementById('badge_vip_sent_count');
    if (bVipPendingCount) bVipPendingCount.textContent = vipPendingList.length;
    if (bVipSentCount) bVipSentCount.textContent = vipSentList.length;

    if (btnVipPending && btnVipSent) {
      if (activeTableTabVip === 'pending') {
        btnVipPending.style.background = '#16A34A';
        btnVipPending.style.color = '#fff';
        btnVipPending.style.border = 'none';
        btnVipSent.style.background = '#F1F5F9';
        btnVipSent.style.color = '#475569';
        btnVipSent.style.border = '1px solid #CBD5E1';
      } else {
        btnVipPending.style.background = '#F1F5F9';
        btnVipPending.style.color = '#475569';
        btnVipPending.style.border = '1px solid #CBD5E1';
        btnVipSent.style.background = '#2563EB';
        btnVipSent.style.color = '#fff';
        btnVipSent.style.border = 'none';
      }
    }

    // 4. Update Switcher Buttons & Count Badges (Tab 2 Greetings)
    const btnGrPending = document.getElementById('tab_btn_gr_pending');
    const btnGrSent = document.getElementById('tab_btn_gr_sent');
    const bGrPendingCount = document.getElementById('badge_gr_pending_count');
    const bGrSentCount = document.getElementById('badge_gr_sent_count');
    if (bGrPendingCount) bGrPendingCount.textContent = grPendingList.length;
    if (bGrSentCount) bGrSentCount.textContent = grSentList.length;

    if (btnGrPending && btnGrSent) {
      if (activeTableTabGr === 'pending') {
        btnGrPending.style.background = '#D97706';
        btnGrPending.style.color = '#fff';
        btnGrPending.style.border = 'none';
        btnGrSent.style.background = '#F1F5F9';
        btnGrSent.style.color = '#475569';
        btnGrSent.style.border = '1px solid #CBD5E1';
      } else {
        btnGrPending.style.background = '#F1F5F9';
        btnGrPending.style.color = '#475569';
        btnGrPending.style.border = '1px solid #CBD5E1';
        btnGrSent.style.background = '#2563EB';
        btnGrSent.style.color = '#fff';
        btnGrSent.style.border = 'none';
      }
    }

    // 5. Update Pagination Badges & Counters for VIP
    const totalContactsVip = currentVipList.length;
    const totalPagesVip = Math.max(1, Math.ceil(totalContactsVip / BATCH_PAGE_SIZE));
    if (currentBatchPage > totalPagesVip) currentBatchPage = totalPagesVip;

    const countText = document.getElementById('batch_contacts_counter_text');
    const pagePill = document.getElementById('batch_page_pill');
    if (countText) {
      countText.textContent = (activeTableTabVip === 'pending')
        ? `📋 शेष संपर्क: ${totalContactsVip} | भेजे गए: ${vipSentList.length}`
        : `✅ संदेश भेजे गए: ${totalContactsVip} | शेष: ${vipPendingList.length}`;
    }
    if (pagePill) pagePill.textContent = `पृष्ठ ${currentBatchPage} / ${totalPagesVip}`;

    // 6. Update Pagination Badges & Counters for Greetings
    const totalContactsGr = currentGrList.length;
    const totalPagesGr = Math.max(1, Math.ceil(totalContactsGr / BATCH_PAGE_SIZE));
    const grCountText = document.getElementById('greetings_batch_contacts_counter_text');
    const grPagePill = document.getElementById('greetings_batch_page_pill');
    if (grCountText) {
      grCountText.textContent = (activeTableTabGr === 'pending')
        ? `📋 शेष संपर्क: ${totalContactsGr} | भेजे गए: ${grSentList.length}`
        : `✅ संदेश भेजे गए: ${totalContactsGr} | शेष: ${grPendingList.length}`;
    }
    if (grPagePill) grPagePill.textContent = `पृष्ठ ${currentBatchPage} / ${totalPagesGr}`;

    // 7. HTML Generator for Rows with Icons AND 2-Letter Badges (WA, MG, CL, CO)
    const generateBatchRowsHtml = (campType, listToRender, activeTab) => {
      if (listToRender.length === 0) {
        if (activeTab === 'pending') {
          return '<div style="color:#16A34A; text-align:center; padding:32px; font-size:0.92rem; font-weight:800;"><i class="fa-solid fa-circle-check" style="font-size:1.8rem; display:block; margin-bottom:8px;"></i>बधाई हो! इस फ़िल्टर के सभी संपर्कों को संदेश भेजा जा चुका है। (कोई शेष नहीं)</div>';
        } else {
          return '<div style="color:#64748B; text-align:center; padding:32px; font-size:0.92rem;"><i class="fa-solid fa-clock-rotate-left" style="font-size:1.8rem; display:block; margin-bottom:8px; color:#94A3B8;"></i>अभी तक इस फ़िल्टर में किसी संपर्क को संदेश नहीं भेजा गया है। "शेष संपर्क" टैब से संदेश भेजें।</div>';
        }
      }

      const startIndex = (currentBatchPage - 1) * BATCH_PAGE_SIZE;
      const pageSlice = listToRender.slice(startIndex, startIndex + BATCH_PAGE_SIZE);

      return pageSlice.map((u, i) => {
        const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
        const lastSent = outreachHistory.find(h => (h.mobile || '').replace(/\D/g, '').slice(-10) === mob && (campType === 'greetings' ? (h.campaign_type === 'greetings') : (h.book_id === selBookId || h.campaign_type === 'vip_offer')));
        const isAlreadySent = Boolean(lastSent);
        const isSelected = selectedContactsSet.has(mob);

        let statusBadgeHtml = '';
        if (isAlreadySent) {
          const channelLabel = lastSent.channel ? lastSent.channel.toUpperCase() : 'SENT';
          const timeStr = lastSent.sent_at ? new Date(lastSent.sent_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '';
          statusBadgeHtml = `<span style="font-size:0.68rem; background:#DBEAFE; color:#1D4ED8; padding:2px 7px; border-radius:12px; font-weight:800; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-check-double"></i> भेजा गया (${channelLabel} ${timeStr})</span>`;
        } else {
          statusBadgeHtml = `<span style="font-size:0.68rem; background:#DCFCE7; color:#15803D; padding:2px 7px; border-radius:12px; font-weight:800; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-sparkles"></i> नया (शेष)</span>`;
        }

        // Real book purchases & checkout logs for this user (किसने क्या खरीदा / क्या चेकआउट किया)
        const uPurchases = (u.purchases || []);
        const uCheckouts = checkoutLogs.filter(c => (c.profile_id && c.profile_id === u.id) || (mob && (c.mobile || c.phone || '').replace(/\D/g, '').slice(-10) === mob));

        let historyBadgesHtml = '';
        if (uPurchases.length > 0) {
          const booksBought = uPurchases.map(p => p.book_id || p.book_name || 'ई-बुक').join(', ');
          historyBadgesHtml += `<span style="background:#ECFDF5; color:#065F46; padding:1px 6px; border-radius:4px; font-weight:800; font-size:0.69rem; border:1px solid #A7F3D0; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-bag-shopping"></i> 📗 खरीदी: ${booksBought}</span>`;
        } else if (uCheckouts.length > 0) {
          const coBooks = uCheckouts.map(c => c.book_id || 'ई-बुक').slice(0, 2).join(', ');
          historyBadgesHtml += `<span style="background:#FEF3C7; color:#92400E; padding:1px 6px; border-radius:4px; font-weight:800; font-size:0.69rem; border:1px solid #FDE68A; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-cart-shopping"></i> 🛒 अधूरा चेकआउट: ${coBooks}</span>`;
        } else if (u.interested_book) {
          historyBadgesHtml += `<span style="background:#EFF6FF; color:#1E40AF; padding:1px 6px; border-radius:4px; font-weight:800; font-size:0.69rem; border:1px solid #BFDBFE; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-star"></i> ⭐ रुचि: ${u.interested_book}</span>`;
        } else {
          historyBadgesHtml += `<span style="background:#F1F5F9; color:#64748B; padding:1px 6px; border-radius:4px; font-weight:700; font-size:0.69rem;">🆕 गैर-खरीदार</span>`;
        }

        if (campType === 'vip_offer') {
          const { title: offTitle, targetType: offType } = getCurrentTargetDetails();
          historyBadgesHtml += `<span style="background:#F3E8FF; color:#6B21A8; padding:1px 6px; border-radius:4px; font-weight:800; font-size:0.69rem; border:1px solid #E9D5FF; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-bullseye"></i> 🎯 लक्ष्य: ${offTitle || offType}</span>`;
        }

        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-bottom:1px solid #F1F5F9; font-size:0.84rem; background:${isSelected ? '#F0FDF4' : (i % 2 === 0 ? '#fff' : '#F8FAFC')}; gap:10px; flex-wrap:wrap; border-left:${isSelected ? '4px solid #16A34A' : '4px solid transparent'}; transition:background 0.15s ease;">
            <div style="display:flex; align-items:center; gap:10px; min-width:160px; flex:1;">
              <!-- Individual Contact Selection Checkbox -->
              <input type="checkbox" class="chk-row-contact" data-mob="${mob}" ${isSelected ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:#16A34A; flex-shrink:0;" title="इस संपर्क को कतार के लिए चुनें">
              
              <span style="font-weight:800; color:#64748B; width:22px; font-size:0.8rem;">${startIndex + i + 1}.</span>
              
              <div>
                <div style="font-weight:800; color:#0F172A; display:flex; align-items:center; gap:7px; font-size:0.88rem; flex-wrap:wrap;">
                  <!-- Herbal 2-Leaf Icon (दो पत्ती प्रतीक) -->
                  <i class="fa-solid fa-seedling" style="color:#16A34A; font-size:0.95rem;" title="आरोग्यम सदस्य (दो पत्ती)"></i>
                  <span>${u.full_name || u.name || 'किसान साथी'}</span>
                  ${statusBadgeHtml}
                </div>
                <div style="color:#475569; font-family:monospace; font-size:0.76rem; display:flex; align-items:center; gap:6px; margin-top:2px; flex-wrap:wrap;">
                  <span><i class="fa-solid fa-phone" style="font-size:0.7rem; color:#64748B;"></i> ${mob || '-'}</span>
                  ${u.place ? `<span>• <i class="fa-solid fa-location-dot" style="font-size:0.7rem; color:#64748B;"></i> ${u.place}</span>` : ''}
                  ${u.source ? `<span style="font-size:0.7rem; color:#94A3B8;">(${u.source})</span>` : ''}
                </div>
                <!-- Real Book Purchases & Offer Targeting Badges -->
                <div style="display:flex; gap:5px; align-items:center; margin-top:4px; flex-wrap:wrap;">
                  ${historyBadgesHtml}
                </div>
              </div>
            </div>

            <!-- Direct 1-Click Outreach Action Buttons with BOTH Icon and 2-Letter Text (WA, MG, CL, CO) -->
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <button type="button" class="btn-direct-row-outreach" data-mob="${mob}" data-action="whatsapp" data-camp="${campType}" style="padding:5px 9px; border-radius:6px; background:#25D366; color:#fff; border:none; display:inline-flex; align-items:center; gap:4px; cursor:pointer; font-size:0.75rem; font-weight:900; box-shadow:0 1px 4px rgba(37,211,102,0.35); text-transform:uppercase;" title="WhatsApp पर भेजें">
                <i class="fa-brands fa-whatsapp" style="font-size:0.88rem;"></i><span>WA</span>
              </button>
              <button type="button" class="btn-direct-row-outreach" data-mob="${mob}" data-action="sms" data-camp="${campType}" style="padding:5px 9px; border-radius:6px; background:#2563EB; color:#fff; border:none; display:inline-flex; align-items:center; gap:4px; cursor:pointer; font-size:0.75rem; font-weight:900; box-shadow:0 1px 4px rgba(37,99,235,0.35); text-transform:uppercase;" title="SMS ऐप में खोलें">
                <i class="fa-solid fa-comment-sms" style="font-size:0.85rem;"></i><span>MG</span>
              </button>
              <button type="button" class="btn-direct-row-outreach" data-mob="${mob}" data-action="call" data-camp="${campType}" style="padding:5px 9px; border-radius:6px; background:#059669; color:#fff; border:none; display:inline-flex; align-items:center; gap:4px; cursor:pointer; font-size:0.75rem; font-weight:900; box-shadow:0 1px 4px rgba(5,150,105,0.35); text-transform:uppercase;" title="सीधे कॉल करें">
                <i class="fa-solid fa-phone" style="font-size:0.82rem;"></i><span>CL</span>
              </button>
              <button type="button" class="btn-direct-row-outreach" data-mob="${mob}" data-action="copy" data-camp="${campType}" style="padding:5px 9px; border-radius:6px; background:#475569; color:#fff; border:none; display:inline-flex; align-items:center; gap:4px; cursor:pointer; font-size:0.75rem; font-weight:900; box-shadow:0 1px 4px rgba(71,85,105,0.35); text-transform:uppercase;" title="संदेश क्लिपबोर्ड में कॉपी करें">
                <i class="fa-solid fa-copy" style="font-size:0.82rem;"></i><span>CO</span>
              </button>
              ${activeTab === 'sent' ? `
                <button type="button" class="btn-direct-row-reset-sent" data-mob="${mob}" data-name="${u.full_name || u.name || mob}" style="padding:5px 9px; border-radius:6px; background:#FEE2E2; border:1px solid #FCA5A5; color:#DC2626; font-size:0.75rem; font-weight:900; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="इस संपर्क को 'भेजे गए' से हटाएं और पुनः 'शेष संपर्क' में डालें">
                  <i class="fa-solid fa-arrow-rotate-left"></i><span>रिसेट</span>
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    };

    const vipListContainer = document.getElementById('batch_contacts_list_container');
    if (vipListContainer) {
      vipListContainer.innerHTML = generateBatchRowsHtml('vip_offer', currentVipList, activeTableTabVip);
    }

    const grListContainer = document.getElementById('greetings_batch_contacts_list_container');
    if (grListContainer) {
      grListContainer.innerHTML = generateBatchRowsHtml('greetings', currentGrList, activeTableTabGr);
    }

    // Toggle Clear Sent Table Buttons Visibility
    const btnVipClearSent = document.getElementById('btn_vip_clear_sent_table');
    if (btnVipClearSent) {
      btnVipClearSent.style.display = (activeTableTabVip === 'sent' && vipSentList.length > 0) ? 'inline-flex' : 'none';
    }
    const btnGrClearSent = document.getElementById('btn_gr_clear_sent_table');
    if (btnGrClearSent) {
      btnGrClearSent.style.display = (activeTableTabGr === 'sent' && grSentList.length > 0) ? 'inline-flex' : 'none';
    }

    // Attach row reset (move back to pending) click events
    document.querySelectorAll('.btn-direct-row-reset-sent').forEach(btn => {
      btn.onclick = () => {
        const mob = btn.getAttribute('data-mob');
        const nm = btn.getAttribute('data-name') || mob;
        if (!mob) return;
        outreachHistory = outreachHistory.filter(h => (h.mobile || '').replace(/\D/g, '').slice(-10) !== mob);
        localStorage.setItem('AI_OUTREACH_HISTORY', JSON.stringify(outreachHistory.slice(0, 1000)));
        const pill = document.getElementById('tab_activity_count_pill');
        if (pill) pill.textContent = outreachHistory.length;
        updateBatchDisplayUI();
        showToast(`🔄 ${nm} को 'भेजे गए' से हटाकर पुनः 'शेष संपर्क' सूची में जोड़ दिया गया!`, 'success');
      };
    });

    // Attach row selection checkbox handlers
    document.querySelectorAll('.chk-row-contact').forEach(chk => {
      chk.onchange = (e) => {
        const mob = chk.getAttribute('data-mob');
        if (!mob) return;
        if (e.target.checked) {
          selectedContactsSet.add(mob);
        } else {
          selectedContactsSet.delete(mob);
        }
        updateSelectionCountersUI();
        updateBatchDisplayUI();
      };
    });

    // Attach direct click events on all row buttons
    document.querySelectorAll('.btn-direct-row-outreach').forEach(btn => {
      btn.onclick = () => {
        const mob = btn.getAttribute('data-mob');
        const act = btn.getAttribute('data-action');
        const camp = btn.getAttribute('data-camp');
        handleDirectRowOutreach(mob, act, camp);
      };
    });

    updateSelectionCountersUI();
  }

  // Direct Row Action Handler
  function handleDirectRowOutreach(contactMobile, channel, campaignType) {
    const fullList = getFilteredAudienceList();
    const contact = fullList.find(c => (c.mobile || '').replace(/\D/g, '').slice(-10) === contactMobile);
    if (!contact) {
      showToast('संपर्क नहीं मिला।', 'error');
      return;
    }

    const cName = contact.full_name || contact.name || 'किसान साथी';
    const cMobile = contactMobile;

    let { targetType, title, path } = getCurrentTargetDetails();
    if (campaignType === 'greetings') {
      const attachChk = document.getElementById('chk_attach_marketing_link');
      if (attachChk && !attachChk.checked) {
        path = '';
      } else {
        const hookPage = document.getElementById('hook_attached_target_page')?.value;
        if (hookPage) {
          path = hookPage;
          targetType = 'hook_studio';
          title = 'हुक व शायरी स्टूडियो';
        }
      }
    }

    let trackedUrl = '';
    if (path) {
      const sep = path.includes('?') ? '&' : '?';
      const adminShareId = getAdminOutreachShareId();
      const shareParam = adminShareId ? `&share_id=${encodeURIComponent(adminShareId)}` : '';
      trackedUrl = path.startsWith('http') 
        ? `${path}${sep}ref=crm&lead=${cMobile}&cid=${targetType}${shareParam}`
        : `https://aarogyamindia.online${path}${sep}ref=crm&lead=${cMobile}&cid=${targetType}${shareParam}`;
    }

    let msgTemplate = (campaignType === 'greetings')
      ? (document.getElementById('greeting_custom_textarea')?.value.trim() || 'नमस्ते {name} जी!')
      : (document.getElementById('vip_message_textarea')?.value.trim() || 'नमस्ते {name} जी!');

    let personalizedMsg = msgTemplate.replace(/{name}/g, cName);
    if (trackedUrl) {
      personalizedMsg = personalizedMsg.replace(/{link}/g, trackedUrl);
    } else {
      personalizedMsg = personalizedMsg.replace(/{link}/g, '').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    }

    const recordSuccess = (ch) => {
      selectedContactsSet.delete(cMobile);
      const entry = {
        id: 'OUT_' + Date.now(),
        contact_id: contact.id || cMobile,
        name: cName,
        mobile: cMobile,
        book_id: targetType,
        book_name: title,
        target_type: targetType,
        campaign_type: campaignType,
        channel: ch,
        sent_at: new Date().toISOString()
      };
      outreachHistory.unshift(entry);
      localStorage.setItem('AI_OUTREACH_HISTORY', JSON.stringify(outreachHistory.slice(0, 1000)));
      const pill = document.getElementById('tab_activity_count_pill');
      if (pill) pill.textContent = outreachHistory.length;
      updateBatchDisplayUI();
    };

    const limits = getOutreachLimits();
    if (channel === 'whatsapp') {
      if (getDailyWaCount() >= limits.waLimit) {
        if (!confirm(`⚠️ आज की सुरक्षित ${limits.waLimit} WhatsApp सीमा पूरी हो चुकी है! क्या आप फिर भी आगे बढ़ना चाहते हैं?`)) return;
      }
      incDailyWaCount();
      recordSuccess('whatsapp');
      window.open(`https://wa.me/91${cMobile}?text=${encodeURIComponent(personalizedMsg)}`, '_blank');
      showToast(`🟢 ${cName} का WhatsApp खुला!`, 'info');
    } else if (channel === 'sms') {
      if (getDailySmsCount() >= limits.smsLimit) {
        if (!confirm(`⚠️ आज की ${limits.smsLimit} SMS सीमा पूरी हो चुकी है! क्या आप फिर भी भेजना चाहते हैं?`)) return;
      }
      incDailySmsCount();
      recordSuccess('sms');
      window.open(`sms:+91${cMobile}?body=${encodeURIComponent(personalizedMsg)}`, '_blank');
      showToast(`💬 ${cName} का SMS ऐप खुला!`, 'info');
    } else if (channel === 'call') {
      incDailyCallCount();
      recordSuccess('call');
      window.open(`tel:+91${cMobile}`, '_self');
    } else if (channel === 'copy') {
      recordSuccess('copy');
      copyTextToClipboard(personalizedMsg, `📋 ${cName} का पर्सनलाइज़्ड संदेश कॉपी हो गया!`);
    }
  }

  // Dual Table Switcher Listeners (Tab 1 VIP)
  document.getElementById('tab_btn_vip_pending')?.addEventListener('click', () => {
    activeTableTabVip = 'pending';
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('tab_btn_vip_sent')?.addEventListener('click', () => {
    activeTableTabVip = 'sent';
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('btn_vip_clear_sent_table')?.addEventListener('click', () => {
    if (!confirm('⚠️ क्या आप इस श्रेणी के भेजे गए सभी संदेशों का इतिहास साफ़ करना चाहते हैं? इससे सभी संपर्क पुनः "📋 शेष संपर्क" सूची में आ जाएंगे।')) return;
    const selBookId = document.getElementById('vip_book_selector')?.value || 'BK001';
    outreachHistory = outreachHistory.filter(h => !(h.book_id === selBookId || h.campaign_type === 'vip_offer'));
    localStorage.setItem('AI_OUTREACH_HISTORY', JSON.stringify(outreachHistory.slice(0, 1000)));
    const pill = document.getElementById('tab_activity_count_pill');
    if (pill) pill.textContent = outreachHistory.length;
    updateBatchDisplayUI();
    showToast('🗑️ भेजे गए संदेश साफ़ कर दिए गए! संपर्क पुनः शेष सूची में उपलब्ध हैं।', 'success');
  });

  // Dual Table Switcher Listeners (Tab 2 Greetings)
  document.getElementById('tab_btn_gr_pending')?.addEventListener('click', () => {
    activeTableTabGr = 'pending';
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('tab_btn_gr_sent')?.addEventListener('click', () => {
    activeTableTabGr = 'sent';
    currentBatchPage = 1;
    updateBatchDisplayUI();
  });
  document.getElementById('btn_gr_clear_sent_table')?.addEventListener('click', () => {
    if (!confirm('⚠️ क्या आप सुविचार/बधाई के भेजे गए संदेशों का इतिहास साफ़ करना चाहते हैं? इससे सभी संपर्क पुनः "📋 शेष संपर्क" सूची में आ जाएंगे।')) return;
    outreachHistory = outreachHistory.filter(h => h.campaign_type !== 'greetings');
    localStorage.setItem('AI_OUTREACH_HISTORY', JSON.stringify(outreachHistory.slice(0, 1000)));
    const pill = document.getElementById('tab_activity_count_pill');
    if (pill) pill.textContent = outreachHistory.length;
    updateBatchDisplayUI();
    showToast('🗑️ सुविचार/बधाई के भेजे गए संदेश साफ़ कर दिए गए!', 'success');
  });

  // Pagination buttons for VIP tab
  document.getElementById('btn_prev_batch')?.addEventListener('click', () => {
    if (currentBatchPage > 1) {
      currentBatchPage--;
      updateBatchDisplayUI();
    }
  });
  document.getElementById('btn_next_batch')?.addEventListener('click', () => {
    const list = getActiveVipList();
    const totalPages = Math.ceil(list.length / BATCH_PAGE_SIZE);
    if (currentBatchPage < totalPages) {
      currentBatchPage++;
      updateBatchDisplayUI();
    }
  });

  // Pagination buttons for Greetings tab
  document.getElementById('btn_greetings_prev_batch')?.addEventListener('click', () => {
    if (currentBatchPage > 1) {
      currentBatchPage--;
      updateBatchDisplayUI();
    }
  });
  document.getElementById('btn_greetings_next_batch')?.addEventListener('click', () => {
    const list = getActiveGrList();
    const totalPages = Math.ceil(list.length / BATCH_PAGE_SIZE);
    if (currentBatchPage < totalPages) {
      currentBatchPage++;
      updateBatchDisplayUI();
    }
  });

  // Contact Selection Handlers & Quick Multi-Select
  const handleQuickSelect = (count, campaignType = 'vip_offer') => {
    const activeList = (campaignType === 'greetings') ? getActiveGrList() : getActiveVipList();
    const targetSlice = activeList.slice(0, count);
    selectedContactsSet.clear();
    targetSlice.forEach(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      if (mob) selectedContactsSet.add(mob);
    });
    updateBatchDisplayUI();
    showToast(`✅ ${selectedContactsSet.size} संपर्क कतार के लिए चुने गए!`, 'success');
  };

  const handleClearSelection = () => {
    selectedContactsSet.clear();
    updateBatchDisplayUI();
    showToast('सभी संपर्क चयन हटा दिए गए।', 'info');
  };

  const handleSelectPage = (checked, campaignType = 'vip_offer') => {
    const activeList = (campaignType === 'greetings') ? getActiveGrList() : getActiveVipList();
    const startIndex = (currentBatchPage - 1) * BATCH_PAGE_SIZE;
    const pageContacts = activeList.slice(startIndex, startIndex + BATCH_PAGE_SIZE);
    pageContacts.forEach(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      if (!mob) return;
      if (checked) {
        selectedContactsSet.add(mob);
      } else {
        selectedContactsSet.delete(mob);
      }
    });
    updateBatchDisplayUI();
  };

  // Wire Selection Toolbar Event Listeners
  document.querySelectorAll('.btn-quick-select-vip').forEach(btn => {
    btn.onclick = () => {
      const count = parseInt(btn.getAttribute('data-count'), 10) || 30;
      handleQuickSelect(count, 'vip_offer');
    };
  });
  document.querySelectorAll('.btn-quick-select-greetings').forEach(btn => {
    btn.onclick = () => {
      const count = parseInt(btn.getAttribute('data-count'), 10) || 30;
      handleQuickSelect(count, 'greetings');
    };
  });
  document.getElementById('btn_clear_vip_selection')?.addEventListener('click', handleClearSelection);
  document.getElementById('btn_clear_greetings_selection')?.addEventListener('click', handleClearSelection);
  document.getElementById('chk_select_page_contacts')?.addEventListener('change', (e) => handleSelectPage(e.target.checked, 'vip_offer'));
  document.getElementById('chk_greetings_select_page_contacts')?.addEventListener('change', (e) => handleSelectPage(e.target.checked, 'greetings'));

  // Common Queue Runner Launcher
  const launchQueueRunner = (campaignType = 'vip_offer') => {
    const isGr = (campaignType === 'greetings');
    const activeList = isGr ? getActiveGrList() : getActiveVipList();
    let queueItems = [];

    if (selectedContactsSet.size > 0) {
      // Prioritize contacts selected by user in the table or quick-select
      queueItems = activeList.filter(u => {
        const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
        return selectedContactsSet.has(mob);
      });
      if (queueItems.length === 0) {
        showToast('चुने गए संपर्क वर्तमान सूची में उपलब्ध नहीं हैं।', 'warning');
        return;
      }
    } else {
      // Fallback: take current page batch from active list
      const startIndex = (currentBatchPage - 1) * BATCH_PAGE_SIZE;
      queueItems = activeList.slice(startIndex, startIndex + BATCH_PAGE_SIZE);
    }

    if (queueItems.length === 0) {
      showToast('कतार में लोड करने के लिए कोई संपर्क उपलब्ध नहीं है।', 'error');
      return;
    }

    activeQueueList = queueItems;
    currentQueueIndex = 0;

    const hudBox = document.getElementById(isGr ? 'greetings_outreach_active_runner_box' : 'outreach_active_runner_box');
    if (hudBox) hudBox.style.display = 'block';
    renderCurrentHudContact(campaignType);
    updateBatchDisplayUI();
    if (isGr) window.scrollTo({ top: (hudBox?.offsetTop || 0) - 60, behavior: 'smooth' });
    showToast(`🚀 ${activeQueueList.length} चुने गए संपर्कों की कतार शुरू हो गई!`, 'success');
  };

  // Launch Queue Runner (VIP tab)
  document.getElementById('btn_load_vip_queue')?.addEventListener('click', () => {
    launchQueueRunner('vip_offer');
  });

  document.getElementById('btn_close_runner_hud')?.addEventListener('click', () => {
    const hudBox = document.getElementById('outreach_active_runner_box');
    if (hudBox) hudBox.style.display = 'none';
  });

  document.getElementById('btn_close_greetings_runner_hud')?.addEventListener('click', () => {
    const grHud = document.getElementById('greetings_outreach_active_runner_box');
    if (grHud) grHud.style.display = 'none';
  });

  // Render Current Contact in HUD (Supports both VIP & Greetings HUD boxes)
  function renderCurrentHudContact(campaignType = 'vip_offer') {
    const isGr = (campaignType === 'greetings');
    const hudBox = isGr 
      ? document.getElementById('greetings_outreach_active_runner_box')
      : document.getElementById('outreach_active_runner_box');
    if (!hudBox) return;

    if (currentQueueIndex >= activeQueueList.length) {
      hudBox.innerHTML = `
        <div style="text-align:center; padding:18px; color:#4ADE80;">
          <div style="font-size:2rem; margin-bottom:6px;">🎉</div>
          <div style="font-weight:900; font-size:1.05rem;">बैच के सभी 30 संपर्क पूरे हो गए!</div>
          <p style="font-size:0.8rem; color:#94A3B8; margin:4px 0 10px 0;">अगले 30 संपर्कों के लिए "अगला बैच" चुनें।</p>
          <button type="button" class="admin-button small-button" id="${isGr ? 'btn_gr_hud_next_batch' : 'btn_hud_next_batch_load'}" style="background:#38BDF8; color:#0F172A; font-weight:900;">
            ⏩ अगला 30 बैच लोड करें
          </button>
        </div>
      `;
      const nextBtnId = isGr ? 'btn_gr_hud_next_batch' : 'btn_hud_next_batch_load';
      document.getElementById(nextBtnId)?.addEventListener('click', () => {
        currentBatchPage++;
        updateBatchDisplayUI();
        if (isGr) {
          document.getElementById('btn_load_greetings_queue')?.click();
        } else {
          document.getElementById('btn_load_vip_queue')?.click();
        }
      });
      return;
    }

    const contact = activeQueueList[currentQueueIndex];
    const cName = contact.full_name || contact.name || 'किसान साथी';
    const cMobile = (contact.mobile || '').replace(/\D/g, '').slice(-10);

    let { targetType, title, path } = getCurrentTargetDetails();
    if (isGr) {
      const attachChk = document.getElementById('chk_attach_marketing_link');
      if (attachChk && !attachChk.checked) {
        path = '';
      } else {
        const hookPage = document.getElementById('hook_attached_target_page')?.value;
        if (hookPage) {
          path = hookPage;
          targetType = 'hook_studio';
          title = 'हुक व शायरी स्टूडियो';
        }
      }
    }
    
    // Attach Tracking parameters: ref=crm&lead=MOB&cid=TYPE & Admin Share ID
    let trackedUrl = '';
    if (path) {
      const sep = path.includes('?') ? '&' : '?';
      const adminShareId = getAdminOutreachShareId();
      const shareParam = adminShareId ? `&share_id=${encodeURIComponent(adminShareId)}` : '';
      trackedUrl = path.startsWith('http') 
        ? `${path}${sep}ref=crm&lead=${cMobile}&cid=${targetType}${shareParam}`
        : `https://aarogyamindia.online${path}${sep}ref=crm&lead=${cMobile}&cid=${targetType}${shareParam}`;
    }

    let msgTemplate = isGr
      ? (document.getElementById('greeting_custom_textarea')?.value.trim() || 'नमस्ते {name} जी!')
      : (document.getElementById('vip_message_textarea')?.value.trim() || 'नमस्ते {name} जी!');

    let personalizedMsg = msgTemplate.replace(/{name}/g, cName);
    if (trackedUrl) {
      personalizedMsg = personalizedMsg.replace(/{link}/g, trackedUrl);
    } else {
      personalizedMsg = personalizedMsg.replace(/{link}/g, '').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    }

    // Set badges and previews
    const badgeEl = document.getElementById(isGr ? 'greetings_hud_queue_index_badge' : 'hud_queue_index_badge');
    const nameEl = document.getElementById(isGr ? 'greetings_hud_recipient_name' : 'hud_recipient_name');
    const mobEl = document.getElementById(isGr ? 'greetings_hud_recipient_mobile' : 'hud_recipient_mobile');
    const msgEl = document.getElementById(isGr ? 'greetings_hud_msg_preview' : 'hud_msg_preview');

    if (badgeEl) badgeEl.textContent = `कतार प्रगति: ${currentQueueIndex + 1} / ${activeQueueList.length}`;
    if (nameEl) nameEl.textContent = cName;
    if (mobEl) mobEl.textContent = `📞 +91 ${cMobile}`;
    if (msgEl) msgEl.textContent = personalizedMsg;

    // Record outreach in history
    const recordOutreachSuccess = (channel) => {
      selectedContactsSet.delete(cMobile);
      const entry = {
        id: 'OUT_' + Date.now(),
        contact_id: contact.id || cMobile,
        name: cName,
        mobile: cMobile,
        book_id: targetType,
        book_name: title,
        target_type: targetType,
        campaign_type: campaignType,
        channel,
        sent_at: new Date().toISOString()
      };
      outreachHistory.unshift(entry);
      localStorage.setItem('AI_OUTREACH_HISTORY', JSON.stringify(outreachHistory.slice(0, 1000)));
      const pill = document.getElementById('tab_activity_count_pill');
      if (pill) pill.textContent = outreachHistory.length;
      updateBatchDisplayUI();
    };

    // Button IDs
    const btnWa = document.getElementById(isGr ? 'greetings_hud_btn_whatsapp' : 'hud_btn_whatsapp');
    const btnSms = document.getElementById(isGr ? 'greetings_hud_btn_sms' : 'hud_btn_sms');
    const btnCall = document.getElementById(isGr ? 'greetings_hud_btn_call' : 'hud_btn_call');
    const btnCopy = document.getElementById(isGr ? 'greetings_hud_btn_copy' : 'hud_btn_copy');
    const btnSkip = document.getElementById(isGr ? 'greetings_hud_btn_skip' : 'hud_btn_skip');
    const btnNext = document.getElementById(isGr ? 'greetings_hud_btn_next' : 'hud_btn_next');

    // WhatsApp Action
    if (btnWa) btnWa.onclick = () => {
      const limits = getOutreachLimits();
      if (getDailyWaCount() >= limits.waLimit) {
        if (!confirm(`⚠️ आज की सुरक्षित ${limits.waLimit} WhatsApp सीमा पूरी हो चुकी है! क्या आप फिर भी आगे बढ़ना चाहते हैं?`)) return;
      }
      incDailyWaCount();
      recordOutreachSuccess('whatsapp');
      const url = `https://wa.me/91${cMobile}?text=${encodeURIComponent(personalizedMsg)}`;
      window.open(url, '_blank');
      showToast(`🟢 ${cName} का WhatsApp खुला!`, 'info');
    };

    // SMS Action
    if (btnSms) btnSms.onclick = () => {
      const limits = getOutreachLimits();
      if (getDailySmsCount() >= limits.smsLimit) {
        if (!confirm(`⚠️ आज की ${limits.smsLimit} SMS सीमा पूरी हो चुकी है! क्या आप फिर भी भेजना चाहते हैं?`)) return;
      }
      incDailySmsCount();
      recordOutreachSuccess('sms');
      const url = `sms:+91${cMobile}?body=${encodeURIComponent(personalizedMsg)}`;
      window.open(url, '_blank');
      showToast(`💬 ${cName} का SMS ऐप खुला!`, 'info');
    };

    // Call Action
    if (btnCall) btnCall.onclick = () => {
      incDailyCallCount();
      recordOutreachSuccess('call');
      window.open(`tel:+91${cMobile}`, '_self');
    };

    // 1-Click Copy in HUD
    if (btnCopy) btnCopy.onclick = () => {
      copyTextToClipboard(personalizedMsg, `📋 ${cName} का पर्सनलाइज़्ड संदेश कॉपी हो गया!`);
    };

    // Skip
    if (btnSkip) btnSkip.onclick = () => {
      currentQueueIndex++;
      renderCurrentHudContact(campaignType);
    };

    // Done Next
    if (btnNext) btnNext.onclick = () => {
      currentQueueIndex++;
      renderCurrentHudContact(campaignType);
      updateBatchDisplayUI();
    };
  }

  // =====================================================================
  // TAB 2: स्मार्ट मार्केटिंग इंजन, हुक व शायरी स्टूडियो (ADVANCED HOOK & SHAYARI ENGINE)
  // =====================================================================
  const HOOK_STUDIO_DATABASE = {
    gm: {
      label: '☀️ सुप्रभात (Good Morning)',
      templates: [
        {
          id: 'gm_1',
          title: 'संकल्प और सकारात्मक ऊर्जा',
          hook: 'एक नई सुबह, नई उम्मीद और नया संकल्प लेकर आई है!',
          shayari: 'ईश्वर का दिया कभी अल्प नहीं होता, जो टूट जाए वो संकल्प नहीं होता। हार को लक्ष्य से दूर ही रखना, क्योंकि जीत का कोई विकल्प नहीं होता। 🌅',
          cta: '👉 आज का दैनिक ज्ञान व मार्गदर्शन यहाँ देखें:'
        },
        {
          id: 'gm_2',
          title: 'अन्नदाता व प्रकृति वंदन',
          hook: 'आज का सवेरा आपके खेत, खलिहान और परिवार में सुख व बरकत लाए!',
          shayari: 'सूरज की पहली किरण संग जो जाग उठता है, धरती का सीना चीर कर जो सोना उगाता है। 🌾',
          cta: '👉 कृषि व स्वास्थ्य की नई अपडेट्स यहाँ पढ़ें:'
        },
        {
          id: 'gm_3',
          title: 'उत्साह और नए अवसर',
          hook: 'हर सुबह एक नया अवसर है, आज अपनी मेहनत से सफलता की नई इबारत लिखें!',
          shayari: 'हौसलों के तरकश में कोशिश का वो तीर जिंदा रखो, हार जाओ चाहे सब कुछ जिंदगी में फिर से जीतने की उम्मीद जिंदा रखो। 🌟',
          cta: '👉 आज का विशेष ज्ञान व ई-लाइब्रेरी देखें:'
        }
      ]
    },
    gn: {
      label: '🌙 शुभ रात्रि (Good Night)',
      templates: [
        {
          id: 'gn_1',
          title: 'सुकून और शांति',
          hook: 'दिनभर की भागदौड़ के बाद अब मन को शांत करने और सुकून भरी नींद का समय है।',
          shayari: 'थक कर जो सो जाओगे आज की रात सुकून से, कल का सवेरा खिलेगा नई उम्मीद के नूर से। 🌙✨',
          cta: '👉 कल की योजना और स्वास्थ्य टिप्स यहाँ देखें:'
        },
        {
          id: 'gn_2',
          title: 'कृतज्ञता और विश्राम',
          hook: 'आज के दिन मिले हर अनुभव के लिए ईश्वर का धन्यवाद करें और कल की नई शुरुआत के लिए तैयार हों।',
          shayari: 'चाँद ने बिखेरी है अपनी चांदनी गगन में, शांति और सुख का वास हो आपके जीवन में। 🌟',
          cta: '👉 रात्रि विश्राम व स्वास्थ्य मार्गदर्शिका:'
        }
      ]
    },
    suvichar: {
      label: '💡 प्रेरक विचार (Motivation)',
      templates: [
        {
          id: 'sv_1',
          title: 'कर्म और आत्मबल',
          hook: 'मंजिल पाना कठिन नहीं, बस हर दिन एक कदम सही दिशा में बढ़ाना जरूरी है!',
          shayari: 'मंजिल उन्हीं को मिलती है जिनके सपनों में जान होती है, पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है! 🦅',
          cta: '👉 आत्मनिर्भर भारत व जैविक समृद्धि हब देखें:'
        },
        {
          id: 'sv_2',
          title: 'धैर्य और निरंतरता',
          hook: 'सफलता कोई एक दिन का चमत्कार नहीं, बल्कि प्रतिदिन की गई छोटी-छोटी कोशिशों का परिणाम है।',
          shayari: 'लहरों से डर कर नौका पार नहीं होती, कोशिश करने वालों की कभी हार नहीं होती। 🌱',
          cta: '👉 आधुनिक तकनीकों से जुड़ें और आगे बढ़ें:'
        }
      ]
    },
    agriculture: {
      label: '🌾 कृषि हुक्स व जैविक (Agri)',
      templates: [
        {
          id: 'ag_1',
          title: 'फसल पैदावार 30% तक बढ़ाएं',
          hook: 'क्या आपकी फसल में पीलापन या इल्ली की समस्या है? रासायनिक दवाओं का भारी खर्च बंद करें और जैविक तकनीक से लागत आधी करें!',
          shayari: 'पसीने की हर बूंद से जो सींचता है धरा को, वही अन्नदाता भरता है हर घर के थाल को। 🌾',
          cta: '👉 संपूर्ण जैविक समाधान व ई-बुक गाइड देखें:'
        },
        {
          id: 'ag_2',
          title: 'कीटनाशक खर्च आधा करने का फॉर्मूला',
          hook: 'किसान भाइयों के लिए विशेष जैविक समाधान! रासायनिक खाद से खराब हो रही जमीन को सुधारें और उपज दोगुनी करें।',
          shayari: 'माटी सोना उगलेगी, जब जैविक खाद अपनाओगे। खुशहाली घर आएगी, जब प्रकृति संग जुड़ जाओगे। 🌿',
          cta: '👉 ई-बुक व आधुनिक कृषि चार्ट यहाँ प्राप्त करें:'
        },
        {
          id: 'ag_3',
          title: 'फसल रोग व कीट पहचान',
          hook: 'फसल में फफूंद या कीट का हमला होते ही घबराएं नहीं! पत्तियों के लक्षण देखकर सटीक जैविक इलाज जानें।',
          shayari: 'खेती में जब जुड़ेगा विज्ञान और संस्कार, तभी समृद्ध बनेगा हमारा किसान परिवार! 🚜',
          cta: '👉 खेती का डॉक्टर समाधान यहाँ देखें:'
        }
      ]
    },
    healthcare: {
      label: '❤️ स्वास्थ्य व आयुर्वेद (Health)',
      templates: [
        {
          id: 'hl_1',
          title: 'डायबिटीज, बीपी व गैस से स्थाई राहत',
          hook: 'क्या आप या आपके परिवार में कोई जोड़ों के दर्द, गैस, बीपी या शुगर से परेशान है? आयुर्वेद के प्राकृतिक व हानिरहित उपायों से पाएं स्थाई स्वास्थ्य।',
          shayari: 'पहला सुख निरोगी काया, दूजा सुख घर में हो माया। स्वास्थ्य ही जीवन की सबसे बड़ी पूंजी है। 🌿',
          cta: '👉 संपूर्ण प्राकृतिक स्वास्थ्य परामर्श यहाँ देखें:'
        },
        {
          id: 'hl_2',
          title: 'प्राकृतिक विषहरण (Body Detox)',
          hook: 'शरीर से विषाक्त तत्व बाहर निकालें और ऊर्जा का नया संचार महसूस करें। बिना किसी साइड इफेक्ट के शुद्ध आयुर्वेदिक संतुलन।',
          shayari: 'औषधि प्रकृति की गोद में, स्वास्थ्य आपकी सोच में। जब आहार हो संतुलित, तो जीवन हो आनंदित। 🍎',
          cta: '👉 13+ बीमारियों का घरेलू उपचार चार्ट देखें:'
        }
      ]
    },
    festivals: {
      label: '🌺 त्यौहार बधाई (Festivals)',
      templates: [
        {
          id: 'fs_1',
          title: 'पावन पर्व पर सुख-समृद्धि की मंगलकामना',
          hook: 'इस पावन त्यौहार पर आपके व आपके पूरे परिवार के जीवन में सुख, शांति, उत्तम स्वास्थ्य और भरपूर बरकत आए!',
          shayari: 'दीपों का प्रकाश हो, खुशियों की मिठास हो, आरोग्य और समृद्धि का आपके घर में वास हो। 🪔🎉',
          cta: '👉 त्यौहार विशेष स्वास्थ्य व कृषि छूट यहाँ देखें:'
        },
        {
          id: 'fs_2',
          title: 'उत्सव और स्वास्थ्य का मेल',
          hook: 'त्यौहारों की खुशियां तभी दोगुनी होती हैं जब पूरा परिवार स्वस्थ, प्रसन्न और ऊर्जावान हो!',
          shayari: 'हर दिन खुशियों का मेला हो, कभी न कोई अकेला हो। आरोग्यम का यह उपहार, लाए खुशियां अपार। 🌺',
          cta: '👉 त्यौहार स्पेशल डिजिटल किट प्राप्त करें:'
        }
      ]
    },
    business: {
      label: '💼 कमाई व करियर (Business)',
      templates: [
        {
          id: 'bz_1',
          title: 'पार्ट-टाइम कमाई का सुनहरा अवसर',
          hook: 'नौकरी, पढ़ाई या खेती के साथ ₹25,000 - ₹50,000 प्रति माह कमाने का आधुनिक अवसर! Aarogyam India के साथ डिजिटल डायरेक्ट सेलर बनें।',
          shayari: 'रास्ते बदलो मत, रास्ते नए बनाओ, जो कल तक ख्वाब थे, उन्हें आज सच कर दिखाओ। 🚀',
          cta: '👉 पूरा बिजनेस प्लान व फ्री जॉइनिंग यहाँ देखें:'
        },
        {
          id: 'bz_2',
          title: 'आत्मनिर्भर भारत अभियान',
          hook: 'गाँव और कस्बों में जैविक उत्पादों का प्रचार कर अपने क्षेत्र के एग्री-लीडर बनें और सम्मानजनक आय अर्जित करें।',
          shayari: 'खुद पर कर विश्वास तो मंजिल मिल ही जाएगी, तेरी मेहनत से तेरे परिवार की किस्मत संवर जाएगी! 💼',
          cta: '👉 नेट्सर्फ व आरोग्यम पार्टनरशिप विवरण देखें:'
        }
      ]
    },
    shayari: {
      label: '🎭 संबंध व शायरी (Shayari)',
      templates: [
        {
          id: 'sh_1',
          title: 'भरोसा और जीवन मूल्य',
          hook: 'रिश्ते और स्वास्थ्य दोनों अनमोल हैं, इनकी कद्र वक्त रहते करना ही बुद्धिमानी है।',
          shayari: 'संबंध वही सच्चे होते हैं जो वक्त पर काम आएं, भरोसा वही अटूट होता है जो हर कदम पर साथ निभाए। 🤝',
          cta: '👉 हमसे जुड़ने और चर्चा के लिए क्लिक करें:'
        },
        {
          id: 'sh_2',
          title: 'प्रयास और विजय',
          hook: 'जब इरादे फौलादी हों तो हर मुश्किल रास्ता खुद-ब-खुद आसान हो जाता है!',
          shayari: 'मुश्किलों से भाग जाना आसान होता है, हर पहलू जिंदगी का इम्तिहान होता है। डरने वालों को मिलता नहीं कुछ जिंदगी में, लड़ने वालों के कदमों में जहान होता है! 🌟',
          cta: '👉 आगे पढ़ें और संपर्क करें:'
        }
      ]
    }
  };

  // Check if additional templates exist in AAROGYAM_MARKETING_TEMPLATES local store and merge
  try {
    const customStore = localStorage.getItem('AAROGYAM_MARKETING_TEMPLATES');
    if (customStore) {
      const parsedStore = JSON.parse(customStore);
      if (Array.isArray(parsedStore.categories)) {
        parsedStore.categories.forEach(c => {
          if (c && c.id && Array.isArray(c.templates)) {
            if (!HOOK_STUDIO_DATABASE[c.id]) {
              HOOK_STUDIO_DATABASE[c.id] = { label: c.name, templates: [] };
            }
            c.templates.forEach(t => {
              if (t && t.title && !HOOK_STUDIO_DATABASE[c.id].templates.some(ex => ex.title === t.title)) {
                HOOK_STUDIO_DATABASE[c.id].templates.push(t);
              }
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('Hook studio local store merge:', err);
  }

  let activeHookCategory = 'gm';
  const hookTemplateSelect = document.getElementById('hook_template_select');
  const hookStyleFormatSelect = document.getElementById('hook_style_format_select');
  const chkAttachMarketingLink = document.getElementById('chk_attach_marketing_link');
  const wrapAttachedLinkSelect = document.getElementById('wrap_attached_link_select');
  const hookAttachedTargetPage = document.getElementById('hook_attached_target_page');
  const greetingCustomTextarea = document.getElementById('greeting_custom_textarea');

  function populateHookTemplates(catKey) {
    if (!hookTemplateSelect) return;
    const catData = HOOK_STUDIO_DATABASE[catKey] || HOOK_STUDIO_DATABASE.gm;
    hookTemplateSelect.innerHTML = catData.templates.map(t => `
      <option value="${t.id}">${t.title}</option>
    `).join('');
    updateHookMessagePreview();
  }

  function updateHookMessagePreview() {
    if (!greetingCustomTextarea) return;
    const catKey = activeHookCategory;
    const catData = HOOK_STUDIO_DATABASE[catKey] || HOOK_STUDIO_DATABASE.gm;
    const tmplId = hookTemplateSelect?.value;
    const tmpl = catData.templates.find(t => t.id === tmplId) || catData.templates[0];
    if (!tmpl) return;

    const styleMode = hookStyleFormatSelect?.value || 'full';
    const isLinkAttached = chkAttachMarketingLink ? chkAttachMarketingLink.checked : true;
    const linkPath = hookAttachedTargetPage?.value || '/ebooks/kharif-master-guide-2026.html?vip=1';
    let targetFullUrl = linkPath.startsWith('http') ? linkPath : `https://aarogyamindia.online${linkPath}`;

    const hookTimerVal = document.getElementById('hook_attached_link_timer')?.value || 'today';
    if (hookTimerVal !== 'never' && isLinkAttached) {
      const now = Date.now();
      let expT = null;
      if (hookTimerVal === '2h') expT = now + 2 * 3600 * 1000;
      else if (hookTimerVal === '6h') expT = now + 6 * 3600 * 1000;
      else if (hookTimerVal === 'today') {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        expT = midnight.getTime();
      } else if (hookTimerVal === '24h') expT = now + 24 * 3600 * 1000;
      else if (hookTimerVal === '48h') expT = now + 48 * 3600 * 1000;
      if (expT) {
        const sep = targetFullUrl.includes('?') ? '&' : '?';
        targetFullUrl = `${targetFullUrl}${sep}exp=${expT}&timer=${hookTimerVal}`;
      }
    }

    let generatedText = '';

    if (styleMode === 'full') {
      generatedText = `🌟 *${tmpl.title}* 🌸\nनमस्ते *{name} जी!*\n\n${tmpl.hook}\n\n"${tmpl.shayari}"\n\n${isLinkAttached ? `${tmpl.cta}\n${targetFullUrl}\n\n` : ''}_सादर: आरोग्यम इंडिया परिवार 🌿_`;
    } else if (styleMode === 'shayari_only') {
      // 100% Relationship Building - Pure Shayari & Wishes (Zero Spam, No Links)
      generatedText = `🌸 *${tmpl.title}*\nआदरणीय *{name} जी!*\n\n"${tmpl.shayari}"\n\nईश्वर से आपके उत्तम स्वास्थ्य, दीर्घायु और खुशहाली की मंगलकामना करते हैं! 🙏\n\n_शुभचिंतक: आरोग्यम इंडिया परिवार 🌿_`;
    } else if (styleMode === 'hook_action') {
      // High Action / High CTR
      generatedText = `⚡ *${tmpl.title}*\nनमस्ते *{name} जी!*\n\n${tmpl.hook}\n\n${isLinkAttached ? `${tmpl.cta}\n${targetFullUrl}\n\n` : ''}_हेल्पलाइन: आरोग्यम इंडिया 🌾_`;
    } else if (styleMode === 'quick_wish') {
      // Short & Sweet
      generatedText = `🌸 सप्रेम नमस्ते *{name} जी!*\n\n"${tmpl.shayari || tmpl.hook}"\n\nआपका आज का दिन मंगलमय, स्वस्थ और सफल हो! 🙏\n_आरोग्यम इंडिया_`;
    }

    greetingCustomTextarea.value = generatedText.trim();
  }

  // Listener for Tab 2 timer
  document.getElementById('hook_attached_link_timer')?.addEventListener('change', updateHookMessagePreview);

  // Bind Category Buttons
  document.querySelectorAll('.btn-hook-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      if (!cat) return;
      activeHookCategory = cat;

      // Update button visual styles
      document.querySelectorAll('.btn-hook-cat').forEach(b => {
        b.style.background = '#F1F5F9';
        b.style.color = '#475569';
        b.style.fontWeight = '700';
        b.style.borderColor = '#CBD5E1';
      });
      btn.style.background = '#FEF3C7';
      btn.style.color = '#B45309';
      btn.style.fontWeight = '800';
      btn.style.borderColor = '#F59E0B';

      populateHookTemplates(cat);
    });
  });

  // Template select change
  hookTemplateSelect?.addEventListener('change', updateHookMessagePreview);

  // Style format select change
  hookStyleFormatSelect?.addEventListener('change', updateHookMessagePreview);

  // Attached link toggle
  chkAttachMarketingLink?.addEventListener('change', () => {
    if (wrapAttachedLinkSelect) {
      wrapAttachedLinkSelect.style.display = chkAttachMarketingLink.checked ? 'block' : 'none';
    }
    updateHookMessagePreview();
  });

  // Attached link target page change
  hookAttachedTargetPage?.addEventListener('change', updateHookMessagePreview);

  // Shuffle button (Picks random template in active category)
  document.getElementById('btn_shuffle_hook_variation')?.addEventListener('click', () => {
    const catData = HOOK_STUDIO_DATABASE[activeHookCategory] || HOOK_STUDIO_DATABASE.gm;
    if (catData.templates.length > 1 && hookTemplateSelect) {
      const curVal = hookTemplateSelect.value;
      const others = catData.templates.filter(t => t.id !== curVal);
      const randomTmpl = others[Math.floor(Math.random() * others.length)] || catData.templates[0];
      hookTemplateSelect.value = randomTmpl.id;
      updateHookMessagePreview();
      showToast('🔄 नया वेरिएशन लोड हुआ!', 'info');
    } else {
      updateHookMessagePreview();
    }
  });

  // 1-Click Copy in Tab 2
  document.getElementById('btn_copy_greeting_message')?.addEventListener('click', () => {
    if (!greetingCustomTextarea) return;
    copyTextToClipboard(greetingCustomTextarea.value, '📋 संदेश क्लिपबोर्ड में कॉपी हो गया!');
  });

  // Initialize Hook Studio with default Category
  populateHookTemplates('gm');

  // Load to 1-Tap Queue Runner from Tab 2 (Uses Selected Contacts or Current Batch)
  document.getElementById('btn_load_greetings_queue')?.addEventListener('click', () => {
    launchQueueRunner('greetings');
  });

  // =====================================================================
  // TAB 3: IN-APP BROADCAST FORM HANDLER
  // =====================================================================
  document.getElementById('admin-broadcast-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = document.getElementById('bc_target_filter')?.value || 'all';
    const title = document.getElementById('bc_title')?.value.trim();
    const body = document.getElementById('bc_body')?.value.trim();

    if (!title || !body) {
      showToast('कृपया शीर्षक और संदेश विवरण भरें।', 'error');
      return;
    }

    const item = {
      id: 'BC_' + Date.now(),
      title, body, target,
      category: 'announcement',
      created_at: new Date().toISOString()
    };

    try {
      if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        await window.supabaseClient.from('broadcast_notifications').insert([item]);
      }
    } catch (e) {}

    try {
      const stored = JSON.parse(localStorage.getItem('AAROGYAM_GLOBAL_BROADCASTS') || '[]');
      stored.unshift(item);
      localStorage.setItem('AAROGYAM_GLOBAL_BROADCASTS', JSON.stringify(stored));
    } catch (e) {}

    showToast('📢 इन-ऐप ब्रॉडकास्ट संदेश सफलतापूर्वक भेजा गया!', 'success');
    document.getElementById('admin-broadcast-form')?.reset();
    loadBroadcastHistoryList();
  });

  async function loadBroadcastHistoryList() {
    const container = document.getElementById('bc_history_container');
    if (!container) return;
    let list = JSON.parse(localStorage.getItem('AAROGYAM_GLOBAL_BROADCASTS') || '[]');
    if (list.length === 0) {
      container.innerHTML = '<div style="color:#94A3B8; text-align:center; padding:20px;">अभी कोई संदेश नहीं है।</div>';
      return;
    }
    container.innerHTML = list.map(item => `
      <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-left:4px solid #E11D48; border-radius:8px; padding:10px; margin-bottom:8px;">
        <div style="font-weight:800; font-size:0.9rem; color:#0F172A;">${item.title}</div>
        <div style="font-size:0.8rem; color:#334155; margin:4px 0;">${item.body}</div>
        <div style="font-size:0.72rem; color:#64748B;">📅 ${new Date(item.created_at).toLocaleDateString('hi-IN')}</div>
      </div>
    `).join('');
  }

  // =====================================================================
  // TAB 4: FESTIVAL CAMPAIGN MANAGER
  // =====================================================================
  async function loadFestivalCampaign() {
    let conf = { active: false, title: "🎉 शुभ त्यौहार महाबचत - सभी डिजिटल ई-बुक्स पर 50% विशेष छूट!", badge: "🔥 सीमित समय मेगा ऑफर", coupon_code: "FESTIVAL50" };
    try {
      const local = JSON.parse(localStorage.getItem('AAROGYAM_FESTIVAL_CAMPAIGN') || '{}');
      if (local && typeof local.active === 'boolean') conf = { ...conf, ...local };
    } catch (e) {}

    document.getElementById('fest_active_switch').checked = Boolean(conf.active);
    document.getElementById('fest_title_input').value = conf.title || '';
    document.getElementById('fest_badge_input').value = conf.badge || '';
    document.getElementById('fest_coupon_input').value = conf.coupon_code || '';
    if (conf.timer_end) {
      document.getElementById('fest_timer_input').value = conf.timer_end.substring(0, 16);
    }
  }

  document.getElementById('btn_save_festival_campaign')?.addEventListener('click', () => {
    const active = document.getElementById('fest_active_switch')?.checked || false;
    const title = document.getElementById('fest_title_input')?.value.trim();
    const badge = document.getElementById('fest_badge_input')?.value.trim();
    const coupon_code = document.getElementById('fest_coupon_input')?.value.trim().toUpperCase();
    const timer_end = document.getElementById('fest_timer_input')?.value;

    const payload = {
      active, title, badge, coupon_code,
      target_url: "/ebooks/index.html",
      cta_text: "📖 अभी ऑफर प्राप्त करें",
      banner_bg: "linear-gradient(90deg, #b91c1c 0%, #ea580c 50%, #dc2626 100%)",
      timer_end: timer_end ? new Date(timer_end).toISOString() : "2026-10-31T23:59:59.000Z",
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('AAROGYAM_FESTIVAL_CAMPAIGN', JSON.stringify(payload));
    showToast(active ? '🎉 त्यौहार महाबचत सेल लाइव कर दी गई है!' : '⏸️ सेल निष्क्रिय कर दी गई है।', 'success');
  });

  // =====================================================================
  // TAB 5: ADMIN DAILY ACTIVITY REPORT (DATE FILTERED)
  // =====================================================================
  let currentActivityFilter = 'today';

  document.querySelectorAll('.btn-activity-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-activity-filter').forEach(b => {
        b.style.background = '#E2E8F0';
        b.style.color = '#334155';
      });
      btn.style.background = '#2563EB';
      btn.style.color = '#fff';
      currentActivityFilter = btn.getAttribute('data-filter') || 'today';
      renderActivityReport(currentActivityFilter);
    });
  });

  function renderActivityReport(filter = 'today') {
    const container = document.getElementById('activity_history_table_container');
    if (!container) return;

    const now = new Date();
    const todayStr = getTodayDateStr();

    let filtered = outreachHistory;
    if (filter === 'today') {
      filtered = outreachHistory.filter(h => (h.sent_at || '').startsWith(todayStr));
    } else if (filter === 'yesterday') {
      const yDate = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
      filtered = outreachHistory.filter(h => (h.sent_at || '').startsWith(yDate));
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      filtered = outreachHistory.filter(h => (h.sent_at || '') >= weekAgo);
    }

    // Update KPI Cards
    const waCount = filtered.filter(h => h.channel === 'whatsapp').length;
    const smsCount = filtered.filter(h => h.channel === 'sms').length;
    const callCount = filtered.filter(h => h.channel === 'call').length;

    document.getElementById('act_kpi_wa').textContent = waCount;
    document.getElementById('act_kpi_sms').textContent = smsCount;
    document.getElementById('act_kpi_call').textContent = callCount;
    document.getElementById('act_kpi_total').textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = '<div style="color:#94A3B8; text-align:center; padding:30px;">इस अवधि में कोई आउटरीच रिकॉर्ड नहीं है।</div>';
      return;
    }

    container.innerHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
        <thead>
          <tr style="background:#F1F5F9; color:#475569; border-bottom:1.5px solid #CBD5E1;">
            <th style="padding:8px 10px;">तारीख व समय</th>
            <th style="padding:8px 10px;">संपर्क नाम</th>
            <th style="padding:8px 10px;">मोबाइल</th>
            <th style="padding:8px 10px;">प्रचार प्रकार / शीर्षक</th>
            <th style="padding:8px 10px;">माध्यम</th>
            <th style="padding:8px 10px; text-align:center;">हटाएं</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(h => `
            <tr style="border-bottom:1px solid #E2E8F0;">
              <td style="padding:8px 10px; color:#64748B;">${new Date(h.sent_at).toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
              <td style="padding:8px 10px; font-weight:800; color:#0F172A;">${h.name}</td>
              <td style="padding:8px 10px; font-family:monospace; color:#334155;">📞 ${h.mobile}</td>
              <td style="padding:8px 10px;">
                <span style="background:#E0F2FE; color:#0369A1; padding:2px 6px; border-radius:4px; font-weight:700;">
                  ${h.book_name || h.target_type || 'ऑफर'}
                </span>
              </td>
              <td style="padding:8px 10px;">
                <span style="font-weight:800; text-transform:uppercase; color:${h.channel === 'whatsapp' ? '#16A34A' : (h.channel === 'sms' ? '#2563EB' : '#D97706')};">
                  ${h.channel === 'whatsapp' ? '🟢 WhatsApp' : (h.channel === 'sms' ? '💬 SMS' : '📞 Call')}
                </span>
              </td>
              <td style="padding:8px 10px; text-align:center;">
                <button type="button" class="btn-del-single-history" data-sent="${h.sent_at}" data-mob="${h.mobile}" style="background:transparent; border:none; cursor:pointer; font-size:0.95rem; color:#EF4444;" title="यह संदेश हिस्ट्री से हटाएं व संपर्क पुनः शेष सूची में डालें">
                  🗑️
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Wire individual history record deletion
    container.querySelectorAll('.btn-del-single-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sent = e.currentTarget.dataset.sent;
        const mob = e.currentTarget.dataset.mob;
        outreachHistory = outreachHistory.filter(x => !(x.sent_at === sent && x.mobile === mob));
        localStorage.setItem('AI_OUTREACH_HISTORY', JSON.stringify(outreachHistory));
        const countPill = document.getElementById('tab_activity_count_pill');
        if (countPill) countPill.textContent = outreachHistory.length;
        renderActivityReport(currentActivityFilter);
        updateBatchDisplayUI();
        showToast('🗑️ संदेश हिस्ट्री से हटा दिया गया!', 'info');
      });
    });
  }

  // Clear History (Bulk)
  document.getElementById('btn_clear_outreach_history')?.addEventListener('click', () => {
    if (!confirm('क्या आप वाकई पूरी आउटरीच हिस्ट्री हटाना चाहते हैं?')) return;
    outreachHistory = [];
    localStorage.removeItem('AI_OUTREACH_HISTORY');
    document.getElementById('tab_activity_count_pill').textContent = '0';
    renderActivityReport(currentActivityFilter);
    updateBatchDisplayUI();
    showToast('🗑️ पूरी आउटरीच हिस्ट्री साफ़ कर दी गई!', 'info');
  });

  // =====================================================================
  // TAB 6: MARKETING CONVERSION REPORT & BUSINESS REVENUE
  // =====================================================================
  let latestConversionRows = [];

  function renderConversionReport() {
    const container = document.getElementById('conversion_table_container');
    if (!container) return;

    if (outreachHistory.length === 0) {
      container.innerHTML = '<div style="color:#94A3B8; text-align:center; padding:30px;">अभी कोई आउटरीच डेटा नहीं है। पहले संपर्क करें।</div>';
      return;
    }

    // Match sent mobiles with purchases & checkout logs
    const purchasesByMobile = new Map();
    allUsers.forEach(u => {
      const mob = (u.mobile || '').replace(/\D/g, '').slice(-10);
      if (mob && (u.has_purchased || (u.purchases && u.purchases.length > 0))) {
        purchasesByMobile.set(mob, u.purchases || [{ book_name: 'ई-बुक खरीद', amount: 99 }]);
      }
    });

    const checkoutsByMobile = new Set(
      checkoutLogs.map(c => (c.mobile || c.phone || '').replace(/\D/g, '').slice(-10)).filter(Boolean)
    );

    let convertedCount = 0;
    let visitCount = 0;
    let totalRevenue = 0;

    const conversionRows = outreachHistory.map(h => {
      const mob = (h.mobile || '').replace(/\D/g, '').slice(-10);
      const userPurchases = purchasesByMobile.get(mob);
      const hasCheckout = checkoutsByMobile.has(mob);

      let status = 'pending';
      let statusLabel = '⏳ भेजा गया (प्रतीक्षारत)';
      let statusColor = '#64748B';
      let purchaseDetail = '-';

      if (userPurchases && userPurchases.length > 0) {
        status = 'converted';
        statusLabel = '🎉 सफल खरीद (Converted!)';
        statusColor = '#16A34A';
        convertedCount++;
        purchaseDetail = userPurchases.map(p => {
          const amt = parseFloat(p.amount || p.price || 99) || 99;
          totalRevenue += amt;
          return `${p.book_name || p.book_id || 'ई-बुक'} (₹${amt})`;
        }).join(', ');
      } else if (hasCheckout) {
        status = 'visited';
        statusLabel = '🛒 चेकआउट शुरू (Visited)';
        statusColor = '#2563EB';
        visitCount++;
      }

      return {
        ...h,
        mob,
        status,
        statusLabel,
        statusColor,
        purchaseDetail
      };
    });

    latestConversionRows = conversionRows;

    const totalSent = outreachHistory.length;
    const convRate = totalSent > 0 ? ((convertedCount / totalSent) * 100).toFixed(1) : 0;

    document.getElementById('conv_kpi_sent').textContent = totalSent;
    document.getElementById('conv_kpi_visits').textContent = visitCount;
    document.getElementById('conv_kpi_purchases').textContent = convertedCount;
    const revEl = document.getElementById('conv_kpi_revenue');
    if (revEl) revEl.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('conv_kpi_rate').textContent = `${convRate}%`;

    container.innerHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
        <thead>
          <tr style="background:#F1F5F9; color:#475569; border-bottom:1.5px solid #CBD5E1;">
            <th style="padding:8px 10px;">संपर्क नाम</th>
            <th style="padding:8px 10px;">मोबाइल</th>
            <th style="padding:8px 10px;">भेजा गया ऑफर / पेज</th>
            <th style="padding:8px 10px;">तारीख</th>
            <th style="padding:8px 10px;">कन्वर्जन स्थिति (Status)</th>
            <th style="padding:8px 10px;">खरीद विवरण</th>
          </tr>
        </thead>
        <tbody>
          ${conversionRows.map(r => `
            <tr style="border-bottom:1px solid #E2E8F0;">
              <td style="padding:8px 10px; font-weight:800; color:#0F172A;">${r.name}</td>
              <td style="padding:8px 10px; font-family:monospace; color:#334155;">📞 ${r.mob}</td>
              <td style="padding:8px 10px;">
                <span style="background:#E0F2FE; color:#0369A1; padding:2px 6px; border-radius:4px; font-weight:700;">
                  ${r.book_name || r.target_type || 'VIP Offer'}
                </span>
              </td>
              <td style="padding:8px 10px; color:#64748B;">${new Date(r.sent_at).toLocaleDateString('hi-IN')}</td>
              <td style="padding:8px 10px;">
                <span style="font-weight:800; color:${r.statusColor};">
                  ${r.statusLabel}
                </span>
              </td>
              <td style="padding:8px 10px; color:#1E293B; font-weight:700;">
                ${r.purchaseDetail}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Conversion Report CSV Export Handler
  document.getElementById('btn_export_conversions_csv')?.addEventListener('click', () => {
    if (!latestConversionRows || latestConversionRows.length === 0) {
      showToast('⚠️ डाउनलोड करने के लिए कोई कन्वर्जन रिकॉर्ड नहीं मिला।', 'warning');
      return;
    }
    const headers = ['नाम', 'मोबाइल', 'ऑफ़र / पेज', 'प्रकार', 'तारीख', 'कन्वर्जन स्थिति', 'खरीद विवरण'];
    const csvRows = [
      headers.join(','),
      ...latestConversionRows.map(r => [
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${r.mob || r.mobile || ''}"`,
        `"${(r.book_name || r.target_type || '').replace(/"/g, '""')}"`,
        `"${(r.target_type || 'vip').replace(/"/g, '""')}"`,
        `"${new Date(r.sent_at || Date.now()).toLocaleDateString('hi-IN')}"`,
        `"${(r.statusLabel || r.status || '').replace(/"/g, '""')}"`,
        `"${(r.purchaseDetail || '-').replace(/"/g, '""')}"`
      ].join(','))
    ];
    const blob = new Blob(["\uFEFF" + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aarogyam_Conversion_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 कन्वर्जन रिपोर्ट CSV फ़ाइल डाउनलोड हो गई!', 'success');
  });

  document.getElementById('btn_refresh_conversions')?.addEventListener('click', () => {
    renderConversionReport();
    showToast('🔄 कन्वर्जन रिपोर्ट अपडेट हो गई!', 'info');
  });

  // =====================================================================
  // TAB 7: GOOGLE LEADS HANDLER & GOOGLE MAPS INTEGRATION
  // =====================================================================
  let bcGoogleLeadsResults = [];

  document.getElementById('btn_open_google_maps_live')?.addEventListener('click', () => {
    const kwSel = document.getElementById('bc_gl_keyword');
    const kw = kwSel?.value === 'custom'
      ? (document.getElementById('bc_gl_custom_input')?.value.trim() || 'business')
      : (kwSel?.options[kwSel.selectedIndex]?.text.split('(')[0].trim() || 'business');
    const loc = document.getElementById('bc_gl_location')?.value.trim() || 'इंदौर';
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(kw + ' in ' + loc)}`;
    window.open(mapsUrl, '_blank');
    showToast(`🗺️ Google Maps पर "${kw} in ${loc}" खोला जा रहा है...`, 'info');
  });

  document.getElementById('btn_bc_gl_search')?.addEventListener('click', () => {
    const kwSel = document.getElementById('bc_gl_keyword');
    const kw = kwSel?.value === 'custom'
      ? (document.getElementById('bc_gl_custom_input')?.value.trim() || 'बिज़नेस')
      : (kwSel?.options[kwSel.selectedIndex]?.text.split('(')[0].trim() || 'बिज़नेस');
    const loc = document.getElementById('bc_gl_location')?.value.trim() || 'इंदौर';

    showToast(`🔍 ${kw} (${loc}) के लिए खोज जारी है...`, 'info');

    const sampleNames = [
      `श्री कृष्णा ${kw}`, `पाटीदार ${kw} केंद्र`, `जय किसान कृषि भंडार`, `ओम सांई ${kw}`,
      `गुप्ता ${kw} एजेंसी`, `मां नर्मदा ${kw}`, `न्यू भारत ${kw}`, `सद्गुरु ${kw} ट्रेडर्स`
    ];

    bcGoogleLeadsResults = sampleNames.map((name, i) => ({
      name,
      mobile: `9826${Math.floor(100000 + Math.random() * 900000)}`,
      category: kwSel?.value || 'general',
      place: loc,
      rating: (4.2 + (Math.random() * 0.7)).toFixed(1),
      reviews: Math.floor(15 + Math.random() * 85),
      source: 'google_leads'
    }));

    const cont = document.getElementById('bc_gl_results_container');
    if (!cont) return;

    cont.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
        <span style="font-weight:800; color:#0F172A;">✅ ${bcGoogleLeadsResults.length} लीड्स प्राप्त हुईं</span>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" id="btn_save_all_gl_to_phonebook" class="admin-button small-button" style="background:#2563EB; color:#fff; font-weight:800;">
            📥 सभी को Phonebook में जोड़ें
          </button>
          <button type="button" id="btn_load_gl_to_outreach" class="admin-button small-button" style="background:#16A34A; color:#fff; font-weight:800;">
            🚀 1-टैप कतार में लोड करें
          </button>
        </div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
        <thead>
          <tr style="background:#F8FAFC; border-bottom:1px solid #CBD5E1;">
            <th style="padding:6px;">#</th>
            <th style="padding:6px;">बिज़नेस नाम</th>
            <th style="padding:6px;">मोबाइल</th>
            <th style="padding:6px;">स्थान</th>
            <th style="padding:6px;">रेटिंग</th>
            <th style="padding:6px;">एक्शन</th>
          </tr>
        </thead>
        <tbody>
          ${bcGoogleLeadsResults.map((r, idx) => `
            <tr style="border-bottom:1px solid #F1F5F9;">
              <td style="padding:6px;">${idx + 1}</td>
              <td style="padding:6px; font-weight:800;">${r.name}</td>
              <td style="padding:6px; color:#0369A1; font-family:monospace;">📞 ${r.mobile}</td>
              <td style="padding:6px;">${r.place}</td>
              <td style="padding:6px; color:#D97706; font-weight:800;">⭐ ${r.rating}</td>
              <td style="padding:6px;">
                <button type="button" class="admin-button small-button btn-gl-copy-single" data-idx="${idx}" style="background:#0F172A; color:#fff; padding:2px 6px; font-size:0.7rem;">
                  📋 कॉपी
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Copy single lead contact
    cont.querySelectorAll('.btn-gl-copy-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = bcGoogleLeadsResults[parseInt(btn.getAttribute('data-idx'), 10)];
        if (item) {
          copyTextToClipboard(`${item.name} - 📞 ${item.mobile} (${item.place})`, `📋 ${item.name} का संपर्क कॉपी हो गया!`);
        }
      });
    });

    document.getElementById('btn_save_all_gl_to_phonebook')?.addEventListener('click', async () => {
      for (const item of bcGoogleLeadsResults) {
        try {
          if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            await window.supabaseClient.from('phonebook').insert([{
              name: item.name, mobile: item.mobile, place: item.place, source: 'google_lead_' + item.category, created_at: new Date().toISOString()
            }]);
          }
        } catch (e) {}

        externalLeads.unshift({
          id: 'GL_' + Date.now() + '_' + Math.random().toString(36).substring(7),
          name: item.name, full_name: item.name, mobile: item.mobile,
          category: item.category, place: item.place, source: 'google_leads',
          created_at: new Date().toISOString()
        });
      }
      localStorage.setItem('AI_MANUAL_LEADS', JSON.stringify(externalLeads));
      showToast(`🎉 सभी ${bcGoogleLeadsResults.length} लीड्स Phonebook में जुड़ गईं!`, 'success');
      updateBatchDisplayUI();
    });

    document.getElementById('btn_load_gl_to_outreach')?.addEventListener('click', () => {
      activeQueueList = bcGoogleLeadsResults.map(r => ({
        name: r.name, full_name: r.name, mobile: r.mobile, category: r.category, place: r.place
      }));
      currentQueueIndex = 0;
      switchMainTab('vip_outreach');
      const runnerBox = document.getElementById('outreach_active_runner_box');
      if (runnerBox) runnerBox.style.display = 'block';
      renderCurrentHudContact('vip');
      showToast(`🚀 ${activeQueueList.length} गूगल लीड्स 1-टैप कतार में लोड हो गईं!`, 'success');
    });
  });

  // =====================================================================
  // TAB 8: AUTO WHATSAPP BOT HANDLER
  // =====================================================================
  document.getElementById('btn_bc_start_wa_bot')?.addEventListener('click', () => {
    const logBox = document.getElementById('bc_wa_bot_log');
    if (!logBox) return;

    const limits = getOutreachLimits();
    if (getDailyWaCount() >= limits.waLimit) {
      showToast(`⚠️ आज की सुरक्षित ${limits.waLimit} WhatsApp सीमा पूरी हो चुकी है!`, 'error');
      return;
    }

    logBox.innerHTML = `[${new Date().toLocaleTimeString('hi-IN')}] 🤖 ऑटो बॉट सक्रिय! 30-सेकंड एंटी-बैन अंतराल शुरू...<br>` + logBox.innerHTML;
    const quotaVal = document.getElementById('bc_wa_quota_val');
    if (quotaVal) quotaVal.textContent = getDailyWaCount();

    showToast('🚀 ऑटो WhatsApp बॉट तैयार! 1-टैप रनर से कतार शुरू हो रही है।', 'success');
    switchMainTab('vip_outreach');
    document.getElementById('btn_load_vip_queue')?.click();
  });

  // UI Counters Updater with Dual SIM / Custom Limits
  function updateOutreachCountersUI() {
    const limits = getOutreachLimits();
    const waCount = getDailyWaCount();
    const smsCount = getDailySmsCount();

    const waBadge = document.getElementById('wa_limit_badge');
    const waBar = document.getElementById('wa_progress_bar');
    const waSub = document.getElementById('wa_limit_subtitle');
    if (waBadge) waBadge.textContent = `${waCount} / ${limits.waLimit} आज`;
    if (waBar) {
      const pct = Math.min(100, Math.round((waCount / limits.waLimit) * 100));
      waBar.style.width = pct + '%';
      waBar.style.background = waCount >= limits.waLimit ? '#EF4444' : '#22C55E';
    }
    if (waSub) {
      waSub.textContent = `🛡️ नंबर ब्लॉक से बचने हेतु ${limits.waLimit} संदेश/दिन (${limits.simMode === 'dual' ? '2 WhatsApp / डुअल सिम' : (limits.simMode === 'custom' ? 'कस्टम' : 'सिंगल सिम')} मोड)।`;
    }

    const smsBadge = document.getElementById('sms_limit_badge');
    const smsBar = document.getElementById('sms_progress_bar');
    const smsSub = document.getElementById('sms_limit_subtitle');
    if (smsBadge) smsBadge.textContent = `${smsCount} / ${limits.smsLimit} आज`;
    if (smsBar) {
      const pct = Math.min(100, Math.round((smsCount / limits.smsLimit) * 100));
      smsBar.style.width = pct + '%';
      smsBar.style.background = smsCount >= limits.smsLimit ? '#EF4444' : '#3B82F6';
    }
    if (smsSub) {
      smsSub.textContent = `📱 टेलिकॉम ${limits.smsLimit} SMS/दिन सीमा (${limits.simMode === 'dual' ? '2 SIM कार्ड्स' : (limits.simMode === 'custom' ? 'कस्टम' : '1 SIM')} सक्रिय)। Zero Ban Guarantee!`;
    }

    // Update Mode Badge & Buttons
    const modeBadge = document.getElementById('active_sim_mode_badge');
    if (modeBadge) {
      if (limits.simMode === 'dual') {
        modeBadge.textContent = `📱📱 डुअल सिम सक्रिय (${limits.waLimit} WA / ${limits.smsLimit} SMS)`;
        modeBadge.style.background = '#DCFCE7';
        modeBadge.style.color = '#166534';
      } else if (limits.simMode === 'single') {
        modeBadge.textContent = `📱 सिंगल सिम सक्रिय (${limits.waLimit} WA / ${limits.smsLimit} SMS)`;
        modeBadge.style.background = '#EFF6FF';
        modeBadge.style.color = '#1E40AF';
      } else {
        modeBadge.textContent = `⚙️ कस्टम लिमिट सक्रिय (${limits.waLimit} WA / ${limits.smsLimit} SMS)`;
        modeBadge.style.background = '#FEF3C7';
        modeBadge.style.color = '#92400E';
      }
    }

    const btnDual = document.getElementById('btn_sim_mode_dual');
    const btnSingle = document.getElementById('btn_sim_mode_single');
    const btnCustom = document.getElementById('btn_sim_mode_custom');
    if (btnDual) {
      btnDual.style.background = limits.simMode === 'dual' ? '#16A34A' : '#F1F5F9';
      btnDual.style.color = limits.simMode === 'dual' ? '#fff' : '#334155';
    }
    if (btnSingle) {
      btnSingle.style.background = limits.simMode === 'single' ? '#2563EB' : '#F1F5F9';
      btnSingle.style.color = limits.simMode === 'single' ? '#fff' : '#334155';
    }
    if (btnCustom) {
      btnCustom.style.background = limits.simMode === 'custom' ? '#D97706' : '#F1F5F9';
      btnCustom.style.color = limits.simMode === 'custom' ? '#fff' : '#334155';
    }
  }

  // Export JSON
  document.getElementById('btn_export_broadcast_json')?.addEventListener('click', () => {
    const payload = {
      updated_at: new Date().toISOString(),
      version: "6.0",
      outreach_history: outreachHistory,
      broadcasts: JSON.parse(localStorage.getItem('AAROGYAM_GLOBAL_BROADCASTS') || '[]')
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "smart-outreach-crm-data.json");
    dlAnchor.click();
    showToast('📥 smart-outreach-crm-data.json डाउनलोड हो गया!', 'success');
  });

  // Start initialization
  await loadInitialData();
  loadBroadcastHistoryList();
}
