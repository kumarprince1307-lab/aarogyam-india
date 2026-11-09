/**
 * ====================================================================
 * AAROGYAM INDIA — ADS LEAD GATEWAY & SQUEEZE FUNNEL (V2.5 ULTRA-CRISP)
 * ====================================================================
 * Features:
 * 1. 100% Single-Screen Mobile Fit: Zero cutting-off, ultra-compact responsive layout.
 * 2. High-Contrast Hybrid Theme:
 *    - Clean White Card Body (#ffffff)
 *    - Sleek Dark Input Boxes (#0f172a) with Bold White Text (#ffffff, weight: 800)
 *    - Deep Emerald High-Contrast CTA Button (#047857) with Ultra-Sharp White Text
 * 3. Browser & Page Source Locking:
 *    - Automatically detects App/Browser: [Facebook / Instagram / WhatsApp / Chrome / PWA App / Safari]
 *    - Automatically detects Page: [बुक बंडल 5-इन-1 / खेती का डॉक्टर / गेहूँ मास्टर गाइड / आदि]
 *    - Locks combined format into profiles: "Facebook | बुक बंडल 5-इन-1 (किसान भाई)"
 *    - NO extra database columns needed; 100% compatible with existing profiles schema!
 * 4. Internal Auto-Login & Single Source of Truth (SSOT):
 *    - If mobile registered previously: auto-logs in; official database name is SSOT.
 *    - Pre-fills checkout so user NEVER re-types Name or Number!
 * ====================================================================
 */

(function () {
  'use strict';

  // 1. Mobile Sanitizer (+91, spaces, dashes auto-stripped)
  function cleanIndianMobile(val) {
    if (!val) return '';
    let str = String(val).trim().replace(/[^\d+]/g, '');
    if (str.startsWith('+91')) str = str.slice(3);
    else if (str.startsWith('91') && str.length > 10) str = str.slice(2);
    else if (str.startsWith('0') && str.length > 10) str = str.slice(1);
    return str.replace(/\D/g, '').slice(0, 10);
  }

  // Live validator for Indian Mobile
  function validateMobileValue(clean) {
    if (!clean || clean.length < 10) {
      return { valid: false, err: 'कृपया 10 अंकों का WhatsApp नंबर दर्ज करें।' };
    }
    if (!/^[6-9]/.test(clean)) {
      return { valid: false, err: 'WhatsApp नंबर 6, 7, 8 या 9 से शुरू होना चाहिए।' };
    }
    if (/^(\d)\1{9}$/.test(clean) || clean === '1234567890' || clean === '0123456789') {
      return { valid: false, err: 'अमान्य नंबर! कृपया अपना असली WhatsApp नंबर दर्ज करें।' };
    }
    return { valid: true };
  }

  // 2. Accurate Browser & In-App Webview Detector
  function detectBrowserApp() {
    try {
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      const search = window.location.search || '';

      if (/FBAN|FBAV/i.test(ua) || search.includes('fbclid') || /utm_source=fb|utm_source=facebook/i.test(search)) {
        return 'Facebook';
      }
      if (/Instagram/i.test(ua) || /utm_source=ig|utm_source=instagram/i.test(search)) {
        return 'Instagram';
      }
      if (/WhatsApp/i.test(ua) || /utm_source=wa|utm_source=whatsapp/i.test(search)) {
        return 'WhatsApp';
      }
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        return 'PWA App';
      }
      if (/Edg/i.test(ua)) {
        return 'Edge';
      }
      if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
        return 'Chrome';
      }
      if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
        return 'Safari';
      }
      if (/Firefox/i.test(ua)) {
        return 'Firefox';
      }
    } catch (_) {}
    return 'Browser';
  }

  // 3. Clean Page / Product Name Resolver
  function getCleanPageName(config) {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();

      if (path.includes('bundle') || search.includes('bundle')) {
        const params = new URLSearchParams(window.location.search);
        const bId = (params.get('id') || params.get('bundle') || '').toUpperCase();
        if (bId.includes('5IN1') || bId.includes('KISAN') || (config.title && config.title.includes('5-इन-1'))) {
          return 'बुक बंडल 5-इन-1';
        }
        return 'मेगा बुक बंडल';
      }
      if (path.includes('kheti-dr') || search.includes('bk002')) return 'खेती का डॉक्टर';
      if (search.includes('bk017') || path.includes('gehu')) return 'गेहूँ की खेती';
      if (search.includes('bk019') || path.includes('chana')) return 'चना की खेती';
      if (search.includes('bk020') || path.includes('sarson')) return 'सरसों की खेती';
      if (search.includes('bk015') || path.includes('sabji')) return '11 सब्जी मास्टर गाइड';
      if (search.includes('bk001') || path.includes('kharif')) return 'खरीफ मास्टर गाइड';

      if (config.title && config.title.trim()) {
        return config.title.replace(/[|•].*$/, '').trim();
      }
      if (document.title) return document.title.replace(/[|•].*$/, '').trim();
    } catch (_) {}
    return 'आरोग्यम लैंडिंग पेज';
  }

  // 4. Check if user is already registered or logged in
  function isUserRegistered() {
    try {
      const search = window.location.search || '';
      // Force preview/test when requested
      if (search.includes('test_ad=1') || search.includes('preview_ad=1') || search.includes('force_ad=1')) {
        return false;
      }

      // If user passed or already logged in with verified 10-digit mobile, never block again!
      if (sessionStorage.getItem('ads_gateway_passed') === 'true') return true;

      const m = localStorage.getItem('aim_user_mobile') || 
                localStorage.getItem('user_phone') || 
                localStorage.getItem('aarogyam_user_phone') ||
                getSafeCookie('aim_user_mobile');
      const cleanM = cleanIndianMobile(m);
      if (cleanM && cleanM.length === 10) {
        sessionStorage.setItem('ads_gateway_passed', 'true');
        return true;
      }

      const uStr = localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER');
      if (uStr) {
        const u = JSON.parse(uStr);
        const uMob = cleanIndianMobile(u.mobile || u.phone);
        if (uMob && uMob.length === 10) {
          sessionStorage.setItem('ads_gateway_passed', 'true');
          return true;
        }
      }

      return false;
    } catch (_) {
      return false;
    }
  }

  // 5. Get Active Referral / Sponsor Share ID from URL
  function getActiveSponsor() {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('share_id') || params.get('s') || '';
      if (ref && /^AI\d{4,8}[A-Z]?$/i.test(ref.trim())) return ref.trim().toUpperCase();
      const cached = localStorage.getItem('AI_SPONSOR_SHARE_ID') || localStorage.getItem('ref');
      if (cached && /^AI\d{4,8}[A-Z]?$/i.test(cached.trim())) return cached.trim().toUpperCase();
    } catch (_) {}
    return 'AI000004';
  }

  // 6. Get Supabase client safely
  function getDb() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (window._supabase) return window._supabase;
      if (typeof window.getSupabaseClient === 'function') return window.getSupabaseClient();
    } catch (_) {}
    return null;
  }

  // 7. Inject Gateway Modal (100% Single-Screen Mobile Fit, Ultra-Crisp High Contrast)
  function renderGatewayModal(config) {
    if (document.getElementById('adsLeadGatewayOverlay')) return;

    const title = config.title || 'आरोग्यम इंडिया — विशेष समाधान';
    const subtitle = config.subtitle || 'अपनी फसल के समस्त कीट-रोग पहचानें और 100% सटीक समाधान पाएं!';
    const coverImage = config.coverImage || config.cover || '/images/books/kharif-master-guide-2026-cover.webp';
    const badgeText = config.badgeText || '🌾 आरोग्यम इंडिया विशेष समाधान (Aarogyam India)';

    const overlay = document.createElement('div');
    overlay.id = 'adsLeadGatewayOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      padding-bottom: max(10px, env(safe-area-inset-bottom));
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div id="adsLeadGatewayCard" style="
        background: #ffffff;
        border: 2px solid #cbd5e1;
        border-radius: 12px;
        width: 94%;
        max-width: 440px;
        min-width: 280px;
        margin: auto;
        color: #000000;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
        animation: adsGatePop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      ">
        <style>
          #adsLeadGatewayOverlay * {
            text-shadow: none !important;
          }
          #adsLeadGatewayOverlay::-webkit-scrollbar,
          #adsLeadGatewayCard::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          @keyframes adsGatePop {
            0% { opacity: 0; transform: scale(0.96) translateY(8px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          /* Blinking Green Book Animation (NO Drop-Shadow, Zero Blur) */
          @keyframes bookPulseBlink {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.18); }
          }
          .ads-blinking-book {
            animation: bookPulseBlink 0.9s infinite ease-in-out;
            display: inline-block;
            transform-origin: center;
          }
          /* Sleek High-Contrast Dark Input Boxes (15px/16px responsive, Large font for farmers) */
          .ads-input-dark {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 7px 10px;
            background: #0f172a !important;
            border: 1.5px solid #475569;
            border-radius: 6px;
            color: #ffffff !important;
            font-size: 15px !important;
            font-weight: 800;
            outline: none;
            touch-action: manipulation;
            transition: border-color 0.15s ease;
          }
          .ads-input-dark::placeholder {
            color: #94a3b8 !important;
            font-weight: 600;
            opacity: 1;
            font-size: 0.90rem;
          }
          .ads-input-dark:focus {
            border-color: #0284c7 !important;
          }
          /* Razor-Sharp Emerald Button (NO Text-Shadow, Solid White) */
          .ads-btn-sharp-green {
            background: #046a38 !important;
            border: 2px solid #02381f !important;
            color: #ffffff !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: geometricPrecision;
            touch-action: manipulation;
            transition: transform 0.12s ease;
          }
          .ads-btn-sharp-green:hover {
            background: #057a44 !important;
            transform: translateY(-1px);
          }
          .ads-btn-sharp-green:active {
            transform: translateY(0);
          }
        </style>

        <!-- Top Header Strip (Green Free Banner) -->
        <div style="background: #047857; padding: 4px 8px; text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 900; color: #ffffff; letter-spacing: 0.3px;">
            🎁 100% मुफ़्त एक्सेस (FREE) • कोई शुल्क नहीं
          </span>
        </div>

        <div style="padding: 10px 12px; position: relative;">
          <!-- Exit Confirmation Overlay (Zero Blur, Sharp Text, True Exit Outside Page) -->
          <div id="adsGateExitConfirm" style="
            display: none;
            position: absolute;
            inset: 0;
            background: #090e1a;
            border-radius: 10px;
            z-index: 99;
            padding: 24px 18px;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            box-sizing: border-box;
            animation: adsGatePop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          ">
            <div style="font-size: 3.2rem; margin-bottom: 12px; line-height: 1; animation: bookPulseBlink 0.9s infinite ease-in-out;">🎁</div>
            <h3 style="color: #ffffff; font-size: 1.30rem; font-weight: 900; margin: 0 0 10px 0; line-height: 1.32; letter-spacing: 0.2px;">
              रुकिए! क्या आप मुफ़्त झलक नहीं देखना चाहते?
            </h3>
            <p style="color: #f1f5f9; font-size: 0.96rem; font-weight: 700; margin: 0 0 20px 0; line-height: 1.45;">
              यह मुफ़्त झलक केवल आज के लिए है। बस अपना विवरण दर्ज करें और पुस्तक का संपूर्ण विवरण व समाधान मुफ़्त में देखें!
            </p>
            <button type="button" id="btnAdsGateStay" class="ads-btn-sharp-green" style="
              width: 100%;
              padding: 13px 14px;
              border-radius: 8px;
              font-size: 1.05rem;
              font-weight: 900;
              cursor: pointer;
              margin-bottom: 14px;
              box-shadow: 0 4px 12px rgba(4, 120, 87, 0.4);
            ">
              👉 हाँ, मुझे मुफ़्त झलक देखनी है (फॉर्म भरें)
            </button>
            <button type="button" id="btnAdsGateLeave" style="
              background: transparent;
              border: none;
              color: #fca5a5;
              font-size: 0.90rem;
              font-weight: 800;
              cursor: pointer;
              text-decoration: underline;
              padding: 6px 12px;
            ">
              नहीं, मुझे मुफ़्त समाधान नहीं चाहिए (पेज से बाहर निकलें ✕)
            </button>
          </div>

          <!-- Compact Hero Card -->
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 6px;">
            <img src="${coverImage}" alt="Cover" style="width: 36px; height: 48px; object-fit: cover; border-radius: 4px; flex-shrink: 0; border: 1px solid #cbd5e1;" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';" />
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 1px;">
                <span style="background: #dcfce7; color: #166534; font-size: 0.60rem; font-weight: 900; padding: 1px 4px; border-radius: 3px; border: 1px solid #86efac; text-transform: uppercase;">
                  मुफ़्त ई-बुक
                </span>
                <span style="font-size: 0.64rem; font-weight: 800; color: #0284c7;">Aarogyam India</span>
              </div>
              <h4 style="margin: 0; font-size: 0.86rem; font-weight: 900; color: #000000 !important; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${title}
              </h4>
            </div>
          </div>

          <!-- Black Box + White Text + Blinking Green Book Banner (Large Font for Farmers, NO Shadow) -->
          <div style="background: #000000; border: 1.5px solid #334155; border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 5px;">
            <span class="ads-blinking-book" style="font-size: 1.15rem; line-height: 1;">📗</span>
            <div style="font-size: 0.88rem; font-weight: 900; color: #ffffff !important; letter-spacing: 0.2px; text-align: center;">
              कृपया विवरण दर्ज करके मुफ़्त झलक अनलॉक करें:
            </div>
          </div>

          <!-- Alert Box -->
          <div id="adsGateAlert" style="display: none; padding: 4px 6px; border-radius: 5px; font-size: 0.76rem; font-weight: 800; margin-bottom: 5px;"></div>

          <form id="adsLeadGatewayForm" autocomplete="on">
            <!-- 1. Name Input (Dark Box + Bold White Text) -->
            <div style="margin-bottom: 5px;">
              <label style="display: block; font-size: 0.82rem; font-weight: 900; color: #000000 !important; margin-bottom: 2px;">
                👤 आपका शुभ नाम (Full Name) <span style="color:#dc2626;">*</span>
              </label>
              <input type="text" id="adsGateName" name="name" autocomplete="name" required placeholder="उदा. रमेश कुमार" class="ads-input-dark" />
            </div>

            <!-- 2. WhatsApp Mobile Number (No separate +91, auto-sanitizes spaces & +91, auto-detects wrong numbers) -->
            <div style="margin-bottom: 4px;">
              <label style="display: block; font-size: 0.82rem; font-weight: 900; color: #000000 !important; margin-bottom: 2px;">
                📱 WhatsApp मोबाइल नंबर <span style="color:#dc2626;">*</span>
              </label>
              <div style="position: relative;">
                <input type="tel" id="adsGateMobile" name="tel" autocomplete="tel" inputmode="numeric" required maxlength="15" placeholder="10 अंकों का WhatsApp नंबर दर्ज करें" class="ads-input-dark" style="padding-right: 34px;" />
                <span id="adsMobileStatusIcon" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 1.1rem; pointer-events: none; display: none;"></span>
              </div>
              <div id="adsMobileValidationHint" style="display: none; font-size: 0.72rem; font-weight: 800; margin-top: 2px; margin-bottom: 3px; line-height: 1.2;"></div>
            </div>

            <!-- Warning Note (Red Box + Black Bold Text) -->
            <div style="margin-bottom: 5px; background: #fee2e2; border: 1.5px solid #ef4444; border-radius: 5px; padding: 4px 6px;">
              <p style="margin: 0; font-size: 0.74rem; color: #000000 !important; line-height: 1.3; font-weight: 800;">
                <span style="color: #dc2626; font-size: 0.85rem; vertical-align: -1px;">⚠️</span> <strong style="color: #000000 !important;">नोट:</strong> कृपया सही WhatsApp नंबर ही दर्ज करें। भविष्य में आपकी आधिकारिक रेफरल लिंक इसी से जुड़ेगी।
              </p>
            </div>

            <!-- 3. Profession / Role Dropdown (Decent, Clean, Fits inside mobile perfectly) -->
            <div style="margin-bottom: 7px;">
              <label style="display: block; font-size: 0.82rem; font-weight: 900; color: #000000 !important; margin-bottom: 2px;">
                💼 आप क्या करते हैं? (Role / Profession) <span style="color:#dc2626;">*</span>
              </label>
              <select id="adsGateProfession" name="profession" required class="ads-input-dark" style="cursor: pointer; color: #38bdf8 !important;">
                <option value="farmer">🌾 किसान भाई (Farmer)</option>
                <option value="netsurf">💼 नेट्सर्फ डायरेक्ट सेलर (Netsurf)</option>
                <option value="dealer">💊 कृषि दवा विक्रेता (Dealer)</option>
                <option value="trader">🏢 व्यापारी / व्यवसायी (Business)</option>
                <option value="student">🎓 छात्र / शोधकर्ता (Student)</option>
                <option value="other">🏠 अन्य (Other)</option>
              </select>
            </div>

            <!-- Submit Button (Dark Solid Emerald Green + Big Bold White Text) -->
            <button type="submit" id="btnSubmitAdsGate" class="ads-btn-sharp-green" style="
              width: 100%;
              padding: 9px 12px;
              border-radius: 7px;
              font-size: 0.98rem;
              font-weight: 900;
              letter-spacing: 0.2px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            ">
              <span id="adsGateBtnIcon" style="font-size: 1.05rem;">👉</span>
              <span id="adsGateBtnLabel" style="font-weight: 900; color: #ffffff !important;">मुफ़्त झलक देखें और सम्पूर्ण समाधान पाएँ →</span>
            </button>
          </form>

          <!-- Micro Trust Strip (Black Bold Text) -->
          <div style="margin-top: 4px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 3px;">
            <span style="font-size: 0.66rem; color: #000000 !important; font-weight: 900; display: inline-flex; align-items: center; gap: 4px;">
              <span>🔒 100% सुरक्षित डेटा</span> • <span>कोई शुल्क नहीं</span> • <span>50,000+ किसान व साथी</span>
            </span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const nameInput = document.getElementById('adsGateName');
    const mobileInput = document.getElementById('adsGateMobile');
    const statusIcon = document.getElementById('adsMobileStatusIcon');
    const hintEl = document.getElementById('adsMobileValidationHint');
    const profSelect = document.getElementById('adsGateProfession');
    const exitModal = document.getElementById('adsGateExitConfirm');
    const btnStay = document.getElementById('btnAdsGateStay');
    const btnLeave = document.getElementById('btnAdsGateLeave');

    // Live Mobile Sanitizer & Validator (Auto-removes spaces and +91, detects fake/wrong numbers)
    function handleMobileInput() {
      if (!mobileInput) return '';
      let raw = mobileInput.value || '';
      let cleaned = raw.replace(/[^\d+]/g, '');
      if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
      else if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
      else if (cleaned.startsWith('0') && cleaned.length > 10) cleaned = cleaned.slice(1);
      cleaned = cleaned.replace(/\D/g, '').slice(0, 10);

      // Auto update input if raw had spaces, dashes or +91
      if (mobileInput.value !== cleaned && cleaned.length > 0) {
        mobileInput.value = cleaned;
      }

      if (cleaned.length === 0) {
        if (statusIcon) statusIcon.style.display = 'none';
        if (hintEl) hintEl.style.display = 'none';
        mobileInput.style.borderColor = '#475569';
        return cleaned;
      }

      // First digit check
      if (!/^[6-9]/.test(cleaned)) {
        if (statusIcon) { statusIcon.style.display = 'block'; statusIcon.textContent = '❌'; }
        if (hintEl) {
          hintEl.style.display = 'block';
          hintEl.style.color = '#dc2626';
          hintEl.textContent = '⚠️ भारतीय WhatsApp नंबर 6, 7, 8 या 9 से शुरू होना चाहिए।';
        }
        mobileInput.style.borderColor = '#dc2626';
        return cleaned;
      }

      // Fake repetitive check
      if (cleaned.length === 10 && (/^(\d)\1{9}$/.test(cleaned) || cleanIndianMobile(cleaned) === '1234567890' || cleanIndianMobile(cleaned) === '0123456789')) {
        if (statusIcon) { statusIcon.style.display = 'block'; statusIcon.textContent = '❌'; }
        if (hintEl) {
          hintEl.style.display = 'block';
          hintEl.style.color = '#dc2626';
          hintEl.textContent = '⚠️ अमान्य नंबर! कृपया अपना वास्तविक WhatsApp नंबर दर्ज करें।';
        }
        mobileInput.style.borderColor = '#dc2626';
        return cleaned;
      }

      // Valid 10 digits
      if (cleaned.length === 10) {
        if (statusIcon) { statusIcon.style.display = 'block'; statusIcon.textContent = '✅'; }
        if (hintEl) {
          hintEl.style.display = 'block';
          hintEl.style.color = '#15803d';
          hintEl.textContent = '✅ सही WhatsApp नंबर दर्ज है';
        }
        mobileInput.style.borderColor = '#10b981';
      } else {
        if (statusIcon) statusIcon.style.display = 'none';
        if (hintEl) hintEl.style.display = 'none';
        mobileInput.style.borderColor = '#0284c7';
      }

      return cleaned;
    }

    mobileInput?.addEventListener('input', handleMobileInput);
    mobileInput?.addEventListener('paste', () => setTimeout(handleMobileInput, 20));

    // Helper: Read Cookie Safely
    function getSafeCookie(cname) {
      try {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i].trim();
          if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
      } catch (_) {}
      return '';
    }

    // Smart Autofill: Check URL parameters + Cookies + LocalStorage across all prior visits
    try {
      const urlP = new URLSearchParams(window.location.search);
      const urlName = urlP.get('name') || urlP.get('u') || urlP.get('user_name') || '';
      const urlMobile = urlP.get('mobile') || urlP.get('phone') || urlP.get('m') || '';

      const cachedName = urlName ||
                         localStorage.getItem('aim_user_name') ||
                         localStorage.getItem('user_name') ||
                         localStorage.getItem('aarogyam_user_name') ||
                         localStorage.getItem('SAKHI_USER_NAME') ||
                         getSafeCookie('aim_user_name') || '';

      const cachedMobile = urlMobile ||
                           localStorage.getItem('aim_user_mobile') ||
                           localStorage.getItem('user_phone') ||
                           localStorage.getItem('aarogyam_user_phone') ||
                           localStorage.getItem('SAKHI_USER_PHONE') ||
                           getSafeCookie('aim_user_mobile') || '';

      const cachedProf = localStorage.getItem('AI_USER_PROFESSION') ||
                         localStorage.getItem('AI_USER_OCCUPATION') || '';

      let finalN = cachedName;
      let finalM = cachedMobile;
      let finalP = cachedProf;

      if (!finalN || !finalM) {
        const uStr = localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER');
        if (uStr) {
          const u = JSON.parse(uStr);
          if (!finalN) finalN = u.name || u.full_name || '';
          if (!finalM) finalM = u.mobile || u.phone || '';
          if (!finalP) finalP = u.profession || u.occupation || '';
        }
      }

      if (finalN && nameInput && !nameInput.value) {
        nameInput.value = finalN.trim();
      }
      if (finalM && mobileInput && !mobileInput.value) {
        mobileInput.value = cleanIndianMobile(finalM);
        handleMobileInput();
      }
      if (finalP && profSelect) {
        for (let opt of profSelect.options) {
          if (opt.text.includes(finalP) || opt.value === finalP) {
            profSelect.value = opt.value;
            break;
          }
        }
      }
    } catch (_) {}

    // Back-Button Interception (Exit-Intent Squeeze Dialog & True Exit Outside)
    try {
      window.history.pushState({ adsGatewayModal: true }, '');
      let exitPromptShown = false;

      function exitPageCompletely() {
        window.removeEventListener('popstate', onPopState);
        if (overlay && overlay.parentNode) overlay.remove();
        document.body.style.overflow = '';

        // 1. Try closing window/tab (works in webview / direct popup)
        try { window.close(); } catch (_) {}

        // 2. If referrer is external (Facebook, Google, Instagram, etc.), go back to referrer
        const ref = document.referrer || '';
        if (ref && !ref.includes(window.location.host)) {
          window.location.replace(ref);
          return;
        }

        // 3. If history has previous pages, go back
        if (window.history.length > 2) {
          window.history.go(-2);
        } else if (window.history.length > 1) {
          window.history.back();
        }

        // 4. Reliable fallback: If still on same page after 300ms, navigate away to home
        setTimeout(() => {
          window.location.replace(ref || '/index.html');
        }, 300);
      }

      const onPopState = function () {
        if (!document.body.contains(overlay)) {
          window.removeEventListener('popstate', onPopState);
          return;
        }
        if (!exitPromptShown) {
          exitPromptShown = true;
          if (exitModal) exitModal.style.display = 'flex';
          try { window.history.pushState({ adsExitShown: true }, ''); } catch (_) {}
        } else {
          // Exit prompt already shown and user pressed Back again -> completely leave page!
          exitPageCompletely();
        }
      };
      window.addEventListener('popstate', onPopState);

      btnStay?.addEventListener('click', () => {
        if (exitModal) exitModal.style.display = 'none';
        exitPromptShown = false;
        if (!mobileInput?.value) mobileInput?.focus();
        else if (!nameInput?.value) nameInput?.focus();
      });

      btnLeave?.addEventListener('click', () => {
        exitPageCompletely();
      });
    } catch (_) {}

    // Auto-focus field
    setTimeout(() => {
      if (!nameInput?.value) nameInput?.focus();
      else if (!mobileInput?.value) mobileInput?.focus();
    }, 150);

    // Form Submit Handler
    const form = document.getElementById('adsLeadGatewayForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleGatewaySubmit(config);
    });
  }

  // 8. Internal Auto-Login & Registration Engine
  async function handleGatewaySubmit(config) {
    const nameInput = document.getElementById('adsGateName');
    const mobileInput = document.getElementById('adsGateMobile');
    const profSelect = document.getElementById('adsGateProfession');
    const alertBox = document.getElementById('adsGateAlert');
    const submitBtn = document.getElementById('btnSubmitAdsGate');
    const btnLabel = document.getElementById('adsGateBtnLabel');

    const enteredName = (nameInput?.value || '').trim();
    const rawMobile = mobileInput?.value || '';
    const cleanMobile = cleanIndianMobile(rawMobile);
    const profession = profSelect?.value || 'farmer';
    const professionText = profSelect?.options[profSelect.selectedIndex]?.text || profession;

    function showAlert(msg, isError = true) {
      if (!alertBox) return;
      alertBox.style.display = 'block';
      alertBox.style.background = isError ? '#fef2f2' : '#f0fdf4';
      alertBox.style.color = isError ? '#991b1b' : '#166534';
      alertBox.style.border = isError ? '1px solid #f87171' : '1px solid #86efac';
      alertBox.innerHTML = msg;
    }

    if (enteredName.length < 2) {
      showAlert('कृपया अपना सही व पूरा नाम दर्ज करें।');
      nameInput?.focus();
      return;
    }

    const checkMobile = validateMobileValue(cleanMobile);
    if (!checkMobile.valid) {
      showAlert(checkMobile.err);
      mobileInput?.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.8';
      if (btnLabel) btnLabel.textContent = 'सत्यापित व लॉगिन हो रहा है... ⏳';
    }

    const sponsorShareId = getActiveSponsor();
    const userShareId = (cleanMobile === '7974422572' || cleanMobile.endsWith('7974422572')) ? 'AI000004' : ('AI' + cleanMobile.slice(-6));

    // Browser + Page Locking: Exactly as User Requested!
    // Example: "Facebook | बुक बंडल 5-इन-1 (🌾 किसान भाई)" or "Chrome | खेती का डॉक्टर"
    const browserApp = detectBrowserApp();
    const pageName = getCleanPageName(config);
    const sourceLockedString = `${browserApp} | ${pageName} (${professionText})`;

    // --- STEP A: INSTANT LOCAL SESSION & COOKIE WRITING (ZERO LAG) ---
    const userObj = {
      name: enteredName,
      full_name: enteredName,
      mobile: cleanMobile,
      phone: cleanMobile,
      share_id: userShareId,
      profession: profession,
      occupation: professionText,
      referral_code: sponsorShareId,
      source: sourceLockedString,
      is_existing: false,
      login_time: new Date().toISOString()
    };

    try {
      localStorage.setItem('aim_user_name', enteredName);
      localStorage.setItem('aim_user_mobile', cleanMobile);
      localStorage.setItem('aim_user_share_id', userShareId);
      localStorage.setItem('user_name', enteredName);
      localStorage.setItem('user_phone', cleanMobile);
      localStorage.setItem('aarogyam_user_name', enteredName);
      localStorage.setItem('aarogyam_user_phone', cleanMobile);
      localStorage.setItem('farmer_name', enteredName);
      localStorage.setItem('farmer_mobile', cleanMobile);
      localStorage.setItem('SAKHI_USER_NAME', enteredName);
      localStorage.setItem('SAKHI_USER_PHONE', cleanMobile);
      localStorage.setItem('AI_USER_PROFESSION', professionText);
      localStorage.setItem('AI_USER_OCCUPATION', professionText);
      localStorage.setItem('AI_USER_LOGGED_IN', 'true');
      localStorage.setItem('AI_LOGIN_STATUS', 'true');
      localStorage.setItem('aarogyam_user_registered', 'true');
      localStorage.setItem('AI_USER', JSON.stringify(userObj));
      localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
      localStorage.setItem('UCAS_USER', JSON.stringify(userObj));
      localStorage.setItem('AI_SESSION', JSON.stringify({
        name: enteredName,
        mobile: cleanMobile,
        phone: cleanMobile,
        loggedIn: true,
        active: true,
        loginTime: new Date().toISOString(),
        referral_share_id: sponsorShareId
      }));
      sessionStorage.setItem('ads_gateway_passed', 'true');
      document.cookie = "aim_user_mobile=" + cleanMobile + "; max-age=31536000; path=/; SameSite=Lax";
      document.cookie = "aim_user_name=" + encodeURIComponent(enteredName) + "; max-age=31536000; path=/; SameSite=Lax";

      // Update universal navigation drawer profile on current page immediately!
      if (typeof window.updateUniversalDrawerProfile === 'function') {
        window.updateUniversalDrawerProfile();
      }
      if (typeof window.syncAndHealSession === 'function') {
        window.syncAndHealSession();
      }
      window.dispatchEvent(new CustomEvent('ai:user-logged-in', { detail: userObj }));
      window.dispatchEvent(new CustomEvent('auth:login-success', { detail: userObj }));
    } catch (_) {}

    // --- STEP B: AUTO-POPULATE & LOCK CHECKOUT INPUTS ---
    prefillCheckoutFields(enteredName, cleanMobile);

    // --- STEP C: SMOOTH CARD DISMISSAL (INSTANT ACCESS FOR FARMER) ---
    const card = document.getElementById('adsLeadGatewayCard');
    const overlay = document.getElementById('adsLeadGatewayOverlay');

    if (card) {
      card.style.transition = 'all 0.22s ease';
      card.style.transform = 'scale(0.96) translateY(-10px)';
      card.style.opacity = '0';
    }

    setTimeout(() => {
      if (overlay) overlay.remove();
      document.body.style.overflow = '';

      prefillCheckoutFields(enteredName, cleanMobile);

      window.dispatchEvent(new CustomEvent('ads-gateway:unlocked', {
        detail: {
          name: enteredName,
          mobile: cleanMobile,
          profession: professionText,
          source: sourceLockedString
        }
      }));
    }, 220);

    // --- STEP D: ASYNC SUPABASE PROFILE SYNC (BACKGROUND WORKER, NON-BLOCKING) ---
    (async () => {
      const db = getDb();
      if (!db) return;

      try {
        const { data: existingProfile } = await db
          .from('profiles')
          .select('id, full_name, mobile, share_id, occupation')
          .eq('mobile', cleanMobile)
          .limit(1)
          .maybeSingle();

        let officialName = enteredName;
        let officialShareId = userShareId;

        if (existingProfile) {
          officialName = (enteredName && enteredName.trim().length >= 2) ? enteredName.trim() : (existingProfile.full_name || enteredName);
          if (existingProfile.share_id) officialShareId = existingProfile.share_id;

          await db
            .from('profiles')
            .update({
              full_name: officialName,
              occupation: professionText,
              source: sourceLockedString,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProfile.id);
        } else {
          await db
            .from('profiles')
            .insert({
              full_name: enteredName,
              mobile: cleanMobile,
              share_id: userShareId,
              referral_code: sponsorShareId,
              occupation: professionText,
              registration_source: sourceLockedString,
              source: sourceLockedString,
              created_at: new Date().toISOString()
            });
        }

        // Heal local storage with authoritative Supabase data if needed
        if (officialShareId !== userShareId || officialName !== enteredName) {
          userObj.name = officialName;
          userObj.full_name = officialName;
          userObj.share_id = officialShareId;
          localStorage.setItem('aim_user_name', officialName);
          localStorage.setItem('aim_user_share_id', officialShareId);
          localStorage.setItem('AI_USER', JSON.stringify(userObj));
          localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
          if (typeof window.updateUniversalDrawerProfile === 'function') {
            window.updateUniversalDrawerProfile();
          }
        }
      } catch (err) {
        console.warn('[Ads Gateway Profile Sync Notice]:', err);
      }
    })();
  }

  // 9. Auto-prefill any checkout or order forms on the page
  function prefillCheckoutFields(name, mobile) {
    if (!name && !mobile) return;
    try {
      const nameSelectors = [
        '#billing_name', '#cust_name', '#order_name', '#name', '#customerName', '#modalName',
        'input[name="name"]', 'input[name="billing_name"]', 'input[name="cust_name"]'
      ];
      const phoneSelectors = [
        '#billing_phone', '#cust_phone', '#order_phone', '#mobile', '#phone', '#customerMobile', '#modalMobile',
        'input[name="phone"]', 'input[name="mobile"]', 'input[name="billing_phone"]'
      ];

      nameSelectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
          el.value = name;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      phoneSelectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
          el.value = mobile;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    } catch (_) {}
  }

  // 10. Public Initializer API
  window.initAdsLeadGateway = function (config = {}) {
    // If user is already registered in this browser, bypass smoothly
    if (isUserRegistered()) {
      const cachedName = localStorage.getItem('aim_user_name') || '';
      const cachedMob = localStorage.getItem('aim_user_mobile') || '';
      if (cachedName && cachedMob) prefillCheckoutFields(cachedName, cachedMob);
      return;
    }

    // Check if Ads Mode is active
    const urlParams = new URLSearchParams(window.location.search);
    const forceAd = urlParams.get('ad') === '1' || urlParams.get('ads') === '1' || urlParams.get('lead') === '1';
    const isAdsEnabled = forceAd || config.ads_mode_enabled === true || config.ads_gateway_enabled === true;

    if (isAdsEnabled) {
      renderGatewayModal(config);
    }
  };

  // Auto-prefill on DOM ready if user is known
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const n = localStorage.getItem('aim_user_name');
      const m = localStorage.getItem('aim_user_mobile');
      if (n && m) prefillCheckoutFields(n, m);
    });
  } else {
    const n = localStorage.getItem('aim_user_name');
    const m = localStorage.getItem('aim_user_mobile');
    if (n && m) prefillCheckoutFields(n, m);
  }

})();
