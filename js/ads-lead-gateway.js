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
    } catch (_) { }
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
    } catch (_) { }
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
    } catch (_) { }
    return 'AI000004';
  }

  // 6. Get Supabase client safely
  function getDb() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (window._supabase) return window._supabase;
      if (typeof window.getSupabaseClient === 'function') return window.getSupabaseClient();
    } catch (_) { }
    return null;
  }

  // Shared Universal Platform Exit Helper (Facebook / Google / Webview / Referrer Safe Exit)
  function exitToExternalPlatform() {
    try { window.close(); } catch (_) { }

    const ref = document.referrer || '';
    if (ref && !ref.includes(window.location.host)) {
      window.location.replace(ref);
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    try { window.close(); } catch (_) { }
  }

  // 7. Inject Gateway Modal (100% Single-Screen Mobile Fit, Ultra-Crisp High Contrast)
  function renderGatewayModal(config) {
    if (document.getElementById('adsLeadGatewayOverlay')) return;

    const title = config.title || 'आरोग्यम इंडिया — विशेष समाधान';
    const subtitle = config.subtitle || 'अपनी फसल के समस्त कीट-रोग पहचानें और 100% सटीक समाधान पाएं!';
    const isBundlePage = (window.location.pathname || '').includes('bundle') || (window.location.search || '').includes('bundle') || ((config.title || '').includes('5-इन-1') || (config.title || '').includes('कॉम्बो'));
    const defaultCover = '/images/banners/bundle-kisan-5in1-banner.webp';
    let coverImage = config.coverImage || config.cover || defaultCover;
    if (isBundlePage || (config.title && (config.title.includes('5-इन-1') || config.title.includes('कॉम्बो'))) || coverImage.startsWith('data:image') || coverImage.includes('farmer-community-banner') || !coverImage) {
      coverImage = '/images/banners/bundle-kisan-5in1-banner.webp';
    }
    const badgeText = config.badgeText || '🌾 आरोग्यम इंडिया विशेष समाधान (Aarogyam India)';

    const overlay = document.createElement('div');
    overlay.id = 'adsLeadGatewayOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100dvh;
      height: 100vh;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      padding-bottom: max(10px, env(safe-area-inset-bottom));
      margin: 0;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div id="adsLeadGatewayCard" style="
        width: 95%;
        max-width: 425px;
        min-width: 280px;
        margin: auto;
        background: #ffffff;
        color: #000000;
        box-sizing: border-box;
        border: 1.5px solid #cbd5e1;
        border-radius: 12px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: adsGatePop 0.20s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      ">
        <style>
          #adsLeadGatewayOverlay,
          #adsLeadGatewayOverlay * {
            text-shadow: none !important;
            box-sizing: border-box !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          #adsLeadGatewayOverlay::-webkit-scrollbar,
          #adsLeadGatewayOverlay *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
          }
          @keyframes adsGatePop {
            0% { opacity: 0; transform: scale(0.96) translateY(6px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes bookPulseBlink {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.35; transform: scale(1.18); }
          }
          .ads-blinking-book {
            animation: bookPulseBlink 0.9s infinite ease-in-out;
            display: inline-block;
            transform-origin: center;
          }

          /* Desktop / Laptop View (Centered Card Modal) */
          @media (min-width: 769px) {
            #adsLeadGatewayOverlay {
              padding: 16px !important;
              align-items: center !important;
              justify-content: center !important;
              background: rgba(15, 23, 42, 0.88) !important;
              overflow-y: auto !important;
            }
            #adsLeadGatewayCard {
              width: 95% !important;
              max-width: 440px !important;
              min-width: 320px !important;
              margin: auto !important;
              border: 1.5px solid #cbd5e1 !important;
              border-radius: 12px !important;
              box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45) !important;
              max-height: calc(100vh - 24px) !important;
              display: flex !important;
              flex-direction: column !important;
              overflow-y: auto !important;
              background: #ffffff !important;
            }
            #adsGateFormScreen {
              padding: 12px 16px !important;
              gap: 8px !important;
            }
          }

          /* Mobile / Android / Facebook Browser / PWA / Webview (Full-Screen Fit, No Gaps, Big Touch Fields) */
          @media (max-width: 768px) {
            #adsLeadGatewayOverlay {
              padding: 0 !important;
              margin: 0 !important;
              align-items: stretch !important;
              justify-content: flex-start !important;
              overflow-y: auto !important;
              overflow-x: hidden !important;
              background: #ffffff !important;
              width: 100% !important;
              height: 100% !important;
            }
            #adsLeadGatewayCard {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 100% !important;
              min-height: 100dvh !important;
              min-height: 100vh !important;
              margin: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              display: flex !important;
              flex-direction: column !important;
              overflow: visible !important;
              background: #ffffff !important;
            }
            #adsGateFormScreen {
              flex: 1 !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: flex-start !important;
              padding: 12px 14px 24px 14px !important;
              padding-bottom: max(24px, env(safe-area-inset-bottom)) !important;
              gap: 12px !important;
              width: 100% !important;
              box-sizing: border-box !important;
              overflow: visible !important;
            }
            #adsLeadGatewayForm {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              gap: 12px !important;
            }
            #adsLeadGatewayForm > div {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            .ads-input-dark,
            #adsLeadGatewayForm input.ads-input-dark,
            #adsLeadGatewayForm select.ads-input-dark {
              width: 100% !important;
              max-width: 100% !important;
              height: 50px !important;
              min-height: 50px !important;
              font-size: 16.5px !important;
              font-weight: 700 !important;
              padding: 11px 15px !important;
              border-radius: 9px !important;
              border: 1.5px solid #475569 !important;
              background: #0f172a !important;
              color: #ffffff !important;
              box-sizing: border-box !important;
            }
            #adsLeadGatewayForm select#adsGateProfession {
              color: #38bdf8 !important;
              font-size: 16px !important;
              padding-right: 32px !important;
            }
            #adsGateMobile {
              padding-right: 44px !important;
            }
            #adsMobileStatusIcon {
              right: 12px !important;
              font-size: 20px !important;
            }
            #adsLeadGatewayForm label {
              font-size: 14.5px !important;
              font-weight: 800 !important;
              color: #000000 !important;
              margin-bottom: 5px !important;
              display: block !important;
            }
            #btnSubmitAdsGate {
              width: 100% !important;
              max-width: 100% !important;
              min-height: 54px !important;
              font-size: 19px !important;
              font-weight: 900 !important;
              border-radius: 9px !important;
              margin-top: 12px !important;
              margin-bottom: 8px !important;
              box-sizing: border-box !important;
            }
            #adsGateBtnIcon {
              font-size: 21px !important;
            }
            #adsGateBtnLabel {
              font-size: 19px !important;
              font-weight: 900 !important;
              letter-spacing: 0.5px !important;
            }
          }

          /* Sleek High-Contrast Dark Input Boxes (Clean, Responsive & Tight Fit) */
          .ads-input-dark {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 8px 12px;
            background: #0f172a !important;
            border: 1.5px solid #475569;
            border-radius: 7px;
            color: #ffffff !important;
            caret-color: #38bdf8 !important;
            font-size: 15px !important;
            font-weight: 800;
            outline: none;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            transition: border-color 0.15s ease;
            height: 42px;
            min-height: 40px;
            line-height: normal;
          }
          .ads-input-dark::placeholder {
            color: #94a3b8 !important;
            font-weight: 600;
            opacity: 1;
            font-size: 13.5px;
          }
          .ads-input-dark:focus {
            border-color: #0284c7 !important;
          }
          /* Chrome / Facebook In-App Browser Autofill Override */
          .ads-input-dark:-webkit-autofill,
          .ads-input-dark:-webkit-autofill:hover,
          .ads-input-dark:-webkit-autofill:focus,
          .ads-input-dark:-webkit-autofill:active {
            -webkit-text-fill-color: #ffffff !important;
            -webkit-box-shadow: 0 0 0px 1000px #0f172a inset !important;
            box-shadow: 0 0 0px 1000px #0f172a inset !important;
            caret-color: #ffffff !important;
            transition: background-color 5000s ease-in-out 0s;
            font-weight: 800 !important;
            font-size: 15px !important;
            line-height: normal !important;
          }
          /* Razor-Sharp Emerald Button (Solid White, No Text-Shadow, Never Clips) */
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

        <!-- Top Header Strip (Green Free Banner, Clean & Short) -->
        <div id="adsGateHeaderStrip" style="background: #047857; padding: clamp(6px, 1.4vh, 9px) 10px; text-align: center; flex-shrink: 0;">
          <span style="font-size: clamp(12px, 3.4vw, 14px); font-weight: 900; color: #ffffff; letter-spacing: 0.3px;">
            🎁 100% मुफ़्त एक्सेस (FREE)
          </span>
        </div>

        <!-- SCREEN 1: FORM PAGE VIEW (Compact & Elegant Card View) -->
        <div id="adsGateFormScreen" style="
          display: flex;
          flex-direction: column;
          padding: 10px 14px;
          padding-bottom: 12px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
        ">
          <!-- Top Info Group -->
          <div>
            <!-- Compact Hero Card -->
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 6px 10px;">
              <img src="${coverImage}" alt="Cover" style="width: 52px; height: 66px; object-fit: contain; border-radius: 5px; flex-shrink: 0; border: 1.5px solid #cbd5e1; background: #000000;" onerror="this.onerror=null; this.src='/images/banners/bundle-kisan-5in1-banner.jpg';" />
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 2px;">
                  <span style="background: #dcfce7; color: #166534; font-size: 10.5px; font-weight: 900; padding: 1px 6px; border-radius: 3px; border: 1px solid #86efac; text-transform: uppercase;">
                    मुफ़्त ई-बुक
                  </span>
                  <span style="font-size: 12px; font-weight: 800; color: #0284c7;">Aarogyam India</span>
                </div>
                <h4 style="margin: 0; font-size: 13.5px; font-weight: 900; color: #000000 !important; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${title}
                </h4>
              </div>
            </div>

            <!-- Black Box + White Text + Blinking Green Book Banner (Responsive Box) -->
            <div style="background: #000000; border: 1.5px solid #334155; border-radius: 7px; padding: 6px 10px; margin-bottom: 7px; display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box;">
              <span class="ads-blinking-book" style="font-size: 13px; line-height: 1; flex-shrink: 0;">📗</span>
              <div style="font-size: 12.5px; font-weight: 900; color: #ffffff !important; letter-spacing: 0.2px; text-align: center; line-height: 1.25;">
                विवरण दर्ज करके मुफ़्त झलक अनलॉक करें:
              </div>
            </div>

            <!-- Alert Box -->
            <div id="adsGateAlert" style="display: none; padding: 4px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 800; margin-bottom: 4px;"></div>
          </div>

          <!-- Form Fields Group -->
          <form id="adsLeadGatewayForm" method="post" action="javascript:void(0);" autocomplete="on" style="display: flex; flex-direction: column; gap: 8px; margin: 0;">
            <!-- 1. Name Input (Dark Box + Bold White Text) -->
            <div>
              <label for="adsGateName" style="display: block; font-size: 13px; font-weight: 900; color: #000000 !important; margin-bottom: 2px;">
                👤 आपका शुभ नाम (Full Name) <span style="color:#dc2626;">*</span>
              </label>
              <input type="text" id="adsGateName" name="name" autocomplete="name" autocapitalize="words" spellcheck="false" required placeholder="उदा. रमेश कुमार" class="ads-input-dark" />
            </div>

            <!-- 2. WhatsApp Mobile Number -->
            <div>
              <label for="adsGateMobile" style="display: block; font-size: 13px; font-weight: 900; color: #000000 !important; margin-bottom: 2px;">
                📱 WhatsApp मोबाइल नंबर <span style="color:#dc2626;">*</span>
              </label>
              <div style="position: relative;">
                <input type="tel" id="adsGateMobile" name="tel" autocomplete="tel tel-national" inputmode="tel" required maxlength="15" placeholder="10 अंकों का WhatsApp नंबर" class="ads-input-dark" style="padding-right: 36px;" />
                <span id="adsMobileStatusIcon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 1.15rem; pointer-events: none; display: none;"></span>
              </div>
              <div id="adsMobileValidationHint" style="display: none; font-size: 11px; font-weight: 800; margin-top: 1px; margin-bottom: 2px; line-height: 1.2;"></div>
            </div>

            <!-- 3. Email Input (Optional / वैकल्पिक) -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <label for="adsGateEmail" style="font-size: 13px; font-weight: 900; color: #000000 !important; margin: 0;">
                  📧 ईमेल (Email ID)
                </label>
                <span style="font-size: 10px; font-weight: 800; color: #64748b; background: #f1f5f9; padding: 1px 5px; border-radius: 4px; border: 1px solid #e2e8f0;">वैकल्पिक (Optional)</span>
              </div>
              <input type="email" id="adsGateEmail" name="email" autocomplete="email" inputmode="email" placeholder="उदा. kisan@gmail.com" class="ads-input-dark" />
            </div>

            <!-- Warning Note (Red Box + Black Bold Text) -->
            <div style="background: #fee2e2; border: 1.5px solid #ef4444; border-radius: 6px; padding: 5px 8px; box-sizing: border-box;">
              <p style="margin: 0; font-size: 11.5px; color: #000000 !important; line-height: 1.25; font-weight: 800;">
                <span style="color: #dc2626; font-size: 11.5px; vertical-align: -1px;">⚠️</span> <strong style="color: #000000 !important;">नोट:</strong> कृपया सही WhatsApp नंबर ही दर्ज करें। रेफरल लिंक इसी से जुड़ेगी।
              </p>
            </div>

            <!-- 4. Profession / Role Dropdown -->
            <div>
              <label for="adsGateProfession" style="display: block; font-size: 13px; font-weight: 900; color: #000000 !important; margin-bottom: 2px;">
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

            <!-- Submit Button (Dark Solid Emerald Green + Bold White Text, Never Clips) -->
            <button type="submit" id="btnSubmitAdsGate" class="ads-btn-sharp-green" style="
              width: 100%;
              box-sizing: border-box;
              padding: 12px 14px;
              min-height: 50px;
              border-radius: 8px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              margin-top: 8px;
              margin-bottom: 4px;
              flex-shrink: 0;
            ">
              <span id="adsGateBtnIcon" style="font-size: 19px; flex-shrink: 0;">👉</span>
              <span id="adsGateBtnLabel" style="font-size: 18px; font-weight: 900; color: #ffffff !important; text-align: center; line-height: 1.2; letter-spacing: 0.5px;">
                FREE SUBMIT
              </span>
            </button>
          </form>

          <!-- Micro Trust Strip (Clean Responsive Line) -->
          <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 4px; padding-bottom: 2px; flex-shrink: 0;">
            <span style="font-size: 11px; color: #000000 !important; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap;">
              <span>🔒 100% सुरक्षित डेटा</span> • <span>कोई शुल्क नहीं</span> • <span>50,000+ साथी</span>
            </span>
          </div>
        </div>

        <!-- SCREEN 2: CONFIRMATION PAGE VIEW (Real Full-Screen Retention Page, Not Cut Off!) -->
        <div id="adsGateConfirmScreen" style="
          display: none;
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          min-height: 100dvh;
          min-height: 100vh;
          z-index: 99999999;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px 20px max(28px, env(safe-area-inset-bottom)) 20px;
          text-align: center;
          box-sizing: border-box;
          background: #090e1a;
          color: #ffffff;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          animation: adsGatePop 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        ">
          <div style="width: 100%; max-width: 420px; margin: auto; display: flex; flex-direction: column; align-items: center; box-sizing: border-box;">
            <div style="font-size: 3.4rem; margin-bottom: 12px; line-height: 1; animation: bookPulseBlink 0.9s infinite ease-in-out;">🎁</div>
            <h3 style="color: #ffffff; font-size: clamp(1.22rem, 4.6vw, 1.40rem); font-weight: 900; margin: 0 0 12px 0; line-height: 1.34; letter-spacing: 0.2px;">
              रुकिए! क्या आप मुफ़्त झलक नहीं देखना चाहते?
            </h3>
            <p style="color: #f1f5f9; font-size: clamp(0.96rem, 3.6vw, 1.08rem); font-weight: 700; margin: 0 0 24px 0; line-height: 1.48;">
              यह मुफ़्त झलक केवल आज के लिए है। बस अपना विवरण दर्ज करें और पुस्तक का संपूर्ण विवरण व समाधान मुफ़्त में देखें!
            </p>
            <button type="button" id="btnAdsGateStay" class="ads-btn-sharp-green" style="
              width: 100%;
              box-sizing: border-box;
              padding: 14px 16px;
              min-height: 52px;
              border-radius: 9px;
              font-size: clamp(15px, 4vw, 17px);
              font-weight: 900;
              cursor: pointer;
              margin-bottom: 16px;
              box-shadow: 0 4px 14px rgba(4, 120, 87, 0.45);
            ">
              👉 हाँ, मुझे मुफ़्त झलक देखनी है (फॉर्म भरें)
            </button>
            <button type="button" id="btnAdsGateLeave" style="
              background: transparent;
              border: none;
              color: #fca5a5;
              font-size: clamp(13px, 3.4vw, 14.5px);
              font-weight: 800;
              cursor: pointer;
              text-decoration: underline;
              padding: 10px 14px;
              line-height: 1.35;
            ">
              नहीं, मुझे मुफ़्त समाधान नहीं चाहिए (पेज से बाहर निकलें ✕)
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const nameInput = document.getElementById('adsGateName');
    const mobileInput = document.getElementById('adsGateMobile');
    const emailInput = document.getElementById('adsGateEmail');
    const statusIcon = document.getElementById('adsMobileStatusIcon');
    const hintEl = document.getElementById('adsMobileValidationHint');
    const profSelect = document.getElementById('adsGateProfession');
    const formScreen = document.getElementById('adsGateFormScreen');
    const confirmScreen = document.getElementById('adsGateConfirmScreen');
    const btnStay = document.getElementById('btnAdsGateStay');
    const btnLeave = document.getElementById('btnAdsGateLeave');

    function showFormScreen() {
      if (formScreen) formScreen.style.display = 'flex';
      if (confirmScreen) confirmScreen.style.display = 'none';
      const headerStrip = document.getElementById('adsGateHeaderStrip');
      if (headerStrip) headerStrip.style.display = '';
    }

    function showConfirmScreen() {
      if (formScreen) formScreen.style.display = 'none';
      if (confirmScreen) confirmScreen.style.display = 'flex';
      const headerStrip = document.getElementById('adsGateHeaderStrip');
      if (headerStrip) headerStrip.style.display = 'none';
    }

    // Live Mobile Sanitizer & Validator (Auto-removes spaces and +91, detects fake/wrong numbers)
    function handleMobileInput() {
      if (!mobileInput) return '';
      let raw = mobileInput.value || '';
      let cleaned = raw.replace(/[^\d+]/g, '');
      if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
      else if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
      else if (cleaned.startsWith('0') && cleaned.length > 10) cleaned = cleaned.slice(1);
      cleaned = cleaned.replace(/\D/g, '').slice(0, 10);

      // Only update mobileInput.value when 10 full digits or spaces/+91 entered, avoiding typing interruptions
      if (cleaned.length === 10 && mobileInput.value !== cleaned) {
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
    mobileInput?.addEventListener('change', handleMobileInput);
    mobileInput?.addEventListener('blur', () => {
      let raw = mobileInput.value || '';
      let cleaned = cleanIndianMobile(raw);
      if (cleaned && mobileInput.value !== cleaned) {
        mobileInput.value = cleaned;
      }
      handleMobileInput();
    });
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
      } catch (_) { }
      return '';
    }

    // Smart Autofill: Check URL parameters + Cookies + LocalStorage across all prior visits
    try {
      const urlP = new URLSearchParams(window.location.search);
      const urlName = urlP.get('name') || urlP.get('u') || urlP.get('user_name') || '';
      const urlMobile = urlP.get('mobile') || urlP.get('phone') || urlP.get('m') || '';
      const urlEmail = urlP.get('email') || urlP.get('mail') || '';

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

      const cachedEmail = urlEmail ||
        localStorage.getItem('aim_user_email') ||
        localStorage.getItem('user_email') ||
        getSafeCookie('aim_user_email') || '';

      const cachedProf = localStorage.getItem('AI_USER_PROFESSION') ||
        localStorage.getItem('AI_USER_OCCUPATION') || '';

      let finalN = cachedName;
      let finalM = cachedMobile;
      let finalE = cachedEmail;
      let finalP = cachedProf;

      if (!finalN || !finalM || !finalE) {
        const uStr = localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER');
        if (uStr) {
          const u = JSON.parse(uStr);
          if (!finalN) finalN = u.name || u.full_name || '';
          if (!finalM) finalM = u.mobile || u.phone || '';
          if (!finalE) finalE = u.email || '';
          if (!finalP) finalP = u.profession || u.occupation || '';
        }
      }

      if (finalN && nameInput && !nameInput.value) {
        nameInput.value = finalN.trim();
        try { nameInput.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) { }
      }
      if (finalM && mobileInput && !mobileInput.value) {
        mobileInput.value = cleanIndianMobile(finalM);
        handleMobileInput();
        try { mobileInput.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) { }
      }
      if (finalE && emailInput && !emailInput.value) {
        emailInput.value = finalE.trim();
      }
      if (finalP && profSelect) {
        for (let opt of profSelect.options) {
          if (opt.text.includes(finalP) || opt.value === finalP) {
            profSelect.value = opt.value;
            break;
          }
        }
      }
    } catch (_) { }

    // Pinned Page History Back Flow (Real Screen Transition, No Fragile Overlay)
    try {
      const cleanUrl = window.location.href.split('#')[0];

      // 1. PIN TO PAGE: State 0 = Confirmation Screen, State 1 = Form Screen
      window.history.replaceState({ agView: 'confirm' }, '', cleanUrl + '#ads-confirm');
      window.history.pushState({ agView: 'form' }, '', cleanUrl + '#ads-form');

      // 2. Natural Popstate handler (Switches page screens like a real page)
      const onPopState = function () {
        if (!document.body.contains(overlay)) {
          window.removeEventListener('popstate', onPopState);
          return;
        }

        const hash = window.location.hash || '';
        if (hash.includes('ads-form')) {
          showFormScreen();
        } else if (hash.includes('ads-confirm')) {
          // First Back: Form pops back to Confirmation Page!
          showConfirmScreen();
        } else {
          // Second Back: Confirmation pops back naturally to Facebook / external page!
          window.removeEventListener('popstate', onPopState);
          if (overlay && overlay.parentNode) overlay.remove();
          document.body.style.overflow = '';
          // No redundant history navigation needed - browser is already heading back to Facebook!
        }
      };

      window.addEventListener('popstate', onPopState);

      btnStay?.addEventListener('click', () => {
        showFormScreen();
        try {
          window.history.pushState({ agView: 'form' }, '', cleanUrl + '#ads-form');
        } catch (_) { }
        if (!mobileInput?.value) mobileInput?.focus();
        else if (!nameInput?.value) nameInput?.focus();
      });

      btnLeave?.addEventListener('click', () => {
        window.removeEventListener('popstate', onPopState);
        if (overlay && overlay.parentNode) overlay.remove();
        document.body.style.overflow = '';
        exitToExternalPlatform();
      });
    } catch (_) { }

    // Auto-focus field ONLY on desktop with mouse.
    // On touch/mobile devices, NEVER programmatically auto-focus on modal open
    // because programmatic focus suppresses Android Gboard & Chrome native autofill memory chips!
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 600);
    if (!isTouchDevice) {
      setTimeout(() => {
        if (!nameInput?.value) nameInput?.focus();
        else if (!mobileInput?.value) mobileInput?.focus();
      }, 150);
    }

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
    const emailInput = document.getElementById('adsGateEmail');
    const profSelect = document.getElementById('adsGateProfession');
    const alertBox = document.getElementById('adsGateAlert');
    const submitBtn = document.getElementById('btnSubmitAdsGate');
    const btnLabel = document.getElementById('adsGateBtnLabel');

    const enteredName = (nameInput?.value || '').trim();
    const rawMobile = mobileInput?.value || '';
    const cleanMobile = cleanIndianMobile(rawMobile);
    const enteredEmail = (emailInput?.value || '').trim();
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
    // Example: "Facebook | बुक बंडल 5-इन-1" or "Chrome | खेती का डॉक्टर"
    const browserApp = detectBrowserApp();
    const pageName = getCleanPageName(config);
    const sourceLockedString = `${browserApp} | ${pageName}`;

    // --- STEP A: INSTANT LOCAL SESSION & COOKIE WRITING (ZERO LAG) ---
    const userObj = {
      name: enteredName,
      full_name: enteredName,
      mobile: cleanMobile,
      phone: cleanMobile,
      email: enteredEmail,
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
      if (enteredEmail) {
        localStorage.setItem('aim_user_email', enteredEmail);
        localStorage.setItem('user_email', enteredEmail);
        document.cookie = "aim_user_email=" + encodeURIComponent(enteredEmail) + "; max-age=31536000; path=/; SameSite=Lax";
      }
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
        email: enteredEmail,
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
    } catch (_) { }

    // --- STEP B: AUTO-POPULATE & LOCK CHECKOUT INPUTS ---
    prefillCheckoutFields(enteredName, cleanMobile, enteredEmail);

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

      prefillCheckoutFields(enteredName, cleanMobile, enteredEmail);

      // 🛡️ ACTIVATE LANDING PAGE EXIT SHIELD NOW!
      initLandingPageExitShield(config);

      window.dispatchEvent(new CustomEvent('ads-gateway:unlocked', {
        detail: {
          name: enteredName,
          mobile: cleanMobile,
          email: enteredEmail,
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
          .select('id, full_name, mobile, email, share_id, occupation')
          .eq('mobile', cleanMobile)
          .limit(1)
          .maybeSingle();

        let officialName = enteredName;
        let officialShareId = userShareId;

        if (existingProfile) {
          // 🏛️ AAROGYAM CONSTITUTION RULE:
          // रजिस्ट्रेशन के बाद यूजर का नाम व मोबाइल नंबर पब्लिक फॉर्म से अपडेट नहीं होगा।
          // नाम और नंबर केवल एडमिन एडिट कर सकता है। बाकी डेटा (Email, Profession, Source) अपडेट हो सकता है।
          officialName = existingProfile.full_name || enteredName;
          if (existingProfile.share_id) officialShareId = existingProfile.share_id;

          const updatePayload = {
            occupation: professionText,
            updated_at: new Date().toISOString()
          };
          if (!existingProfile.registration_source || existingProfile.registration_source === 'direct' || existingProfile.registration_source === 'checkout' || existingProfile.registration_source === 'Facebook') {
            updatePayload.registration_source = sourceLockedString;
          }
          // नाम व मोबाइल कभी अपडेट नहीं होंगे - केवल ईमेल (यदि नया है) व अन्य विवरण अपडेट होंगे
          if (enteredEmail) updatePayload.email = enteredEmail;

          await db
            .from('profiles')
            .update(updatePayload)
            .eq('id', existingProfile.id);
        } else {
          // नया यूजर रजिस्ट्रेशन
          const insertPayload = {
            full_name: enteredName,
            mobile: cleanMobile,
            share_id: userShareId,
            referral_code: sponsorShareId,
            occupation: professionText,
            registration_source: sourceLockedString,
            created_at: new Date().toISOString()
          };
          if (enteredEmail) insertPayload.email = enteredEmail;

          await db
            .from('profiles')
            .insert(insertPayload);
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
  function prefillCheckoutFields(name, mobile, email) {
    if (!name && !mobile && !email) return;
    try {
      const nameSelectors = [
        '#billing_name', '#cust_name', '#order_name', '#name', '#customerName', '#modalName',
        'input[name="name"]', 'input[name="billing_name"]', 'input[name="cust_name"]'
      ];
      const phoneSelectors = [
        '#billing_phone', '#cust_phone', '#order_phone', '#mobile', '#phone', '#customerMobile', '#modalMobile',
        'input[name="phone"]', 'input[name="mobile"]', 'input[name="billing_phone"]'
      ];
      const emailSelectors = [
        '#billing_email', '#cust_email', '#order_email', '#email', '#customerEmail', '#modalEmail',
        'input[name="email"]', 'input[name="billing_email"]', 'input[name="cust_email"]'
      ];

      if (name) {
        nameSelectors.forEach(sel => {
          const el = document.querySelector(sel);
          if (el) {
            el.value = name;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }

      if (mobile) {
        phoneSelectors.forEach(sel => {
          const el = document.querySelector(sel);
          if (el) {
            el.value = mobile;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }

      if (email) {
        emailSelectors.forEach(sel => {
          const el = document.querySelector(sel);
          if (el) {
            el.value = email;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    } catch (_) { }
  }

  // 10. Landing Page Exit-Intent Confirmation Shield (Retention Safeguard)
  // Handles: Link Click ➔ Gateway Form ➔ Logged In on Landing Page ➔ User clicks Back ➔ Confirmation Offer Modal ➔ Second Back ➔ Exit to Facebook
  function initLandingPageExitShield(config = {}) {
    if (window._landingExitShieldActive) return;
    window._landingExitShieldActive = true;

    try {
      const cleanUrl = window.location.href.split('#')[0];

      // PIN TO LANDING PAGE HISTORY: State 0 = Exit Confirmation, State 1 = Active Offer Page
      window.history.replaceState({ lpView: 'confirm' }, '', cleanUrl + '#offer-confirm');
      window.history.pushState({ lpView: 'page' }, '', cleanUrl + '#offer');

      function getOrCreateLandingExitModal() {
        let modalWrap = document.getElementById('adsLandingExitModal');
        if (modalWrap) return modalWrap;

        modalWrap = document.createElement('div');
        modalWrap.id = 'adsLandingExitModal';
        modalWrap.style.cssText = `
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 9999999;
          align-items: center;
          justify-content: center;
          padding: 14px;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const title = config.title || 'महाबचत किसान 5-इन-1 मास्टर कॉम्बो';

        modalWrap.innerHTML = `
          <div style="
            background: #090e1a;
            border: 2px solid #1e3a8a;
            border-radius: 14px;
            width: 95%;
            max-width: 440px;
            padding: 26px 20px;
            text-align: center;
            color: #ffffff;
            box-sizing: border-box;
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.95);
            animation: adsGatePop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          ">
            <div style="font-size: 3.5rem; margin-bottom: 12px; line-height: 1;">🎁</div>
            <h3 style="color: #ffffff; font-size: 1.32rem; font-weight: 900; margin: 0 0 10px 0; line-height: 1.35; letter-spacing: 0.2px;">
              रुकिए! क्या आप यह विशेष कॉम्बो ऑफर छोड़ना चाहते हैं?
            </h3>
            <p style="color: #f1f5f9; font-size: 1.02rem; font-weight: 700; margin: 0 0 22px 0; line-height: 1.48;">
              आज <strong>${title}</strong> 80% भारी छूट के साथ केवल ₹199 में उपलब्ध है। यह अवसर दोबारा नहीं मिलेगा!
            </p>
            <button type="button" id="btnLandingExitStay" class="ads-btn-sharp-green" style="
              width: 100%;
              padding: 14px 16px;
              min-height: 50px;
              border-radius: 8px;
              font-size: 1.10rem;
              font-weight: 900;
              cursor: pointer;
              margin-bottom: 14px;
              box-shadow: 0 4px 14px rgba(4, 120, 87, 0.45);
            ">
              👉 हाँ, मुझे ऑफर देखना है (पेज पर रहें)
            </button>
            <button type="button" id="btnLandingExitLeave" style="
              background: transparent;
              border: none;
              color: #fca5a5;
              font-size: 0.94rem;
              font-weight: 800;
              cursor: pointer;
              text-decoration: underline;
              padding: 8px 12px;
            ">
              नहीं, मुझे बाहर निकलना है (पेज से बाहर निकलें ✕)
            </button>
          </div>
        `;

        document.body.appendChild(modalWrap);

        const btnStay = modalWrap.querySelector('#btnLandingExitStay');
        const btnLeave = modalWrap.querySelector('#btnLandingExitLeave');

        btnStay?.addEventListener('click', () => {
          modalWrap.style.display = 'none';
          document.body.style.overflow = '';
          try {
            window.history.pushState({ lpView: 'page' }, '', cleanUrl + '#offer');
          } catch (_) { }
        });

        btnLeave?.addEventListener('click', () => {
          exitToExternalPlatform();
        });

        return modalWrap;
      }

      window.addEventListener('popstate', () => {
        if (document.getElementById('adsLeadGatewayOverlay')) return;

        const exitModal = getOrCreateLandingExitModal();
        const hash = window.location.hash || '';

        if (hash.includes('offer-confirm')) {
          // First Back: Show exit confirmation offer!
          exitModal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        } else if (hash.includes('offer')) {
          exitModal.style.display = 'none';
          document.body.style.overflow = '';
        } else {
          // Second Back: User pressed back again from exit confirmation - naturally exit to Facebook!
          exitModal.style.display = 'none';
          document.body.style.overflow = '';
          // No redundant history navigation needed - browser is already heading back to Facebook!
        }
      });

    } catch (_) { }
  }

  // 11. Public Initializer API & Instant Auto-Boot
  window.initAdsLeadGateway = function (config = {}) {
    // If admin explicitly turned off Ads Mode on this bundle/landing page, respect it 100%!
    const explicitlyDisabled = config.ads_mode_enabled === false || config.ads_gateway_enabled === false || String(config.ads_mode_enabled) === 'false' || String(config.ads_gateway_enabled) === 'false';
    const urlParams = new URLSearchParams(window.location.search);
    const forceAd = urlParams.get('ad') === '1' || urlParams.get('ads') === '1' || urlParams.get('lead') === '1';

    if (explicitlyDisabled && !forceAd) {
      // Remove any modal spawned by auto-boot
      const existingModal = document.getElementById('adsLeadGatewayOverlay') || document.getElementById('adsLeadGatewayModal');
      if (existingModal) existingModal.remove();
      return;
    }

    // If user is already registered in this browser, bypass gateway but activate landing page exit shield!
    if (isUserRegistered()) {
      const cachedName = localStorage.getItem('aim_user_name') || '';
      const cachedMob = localStorage.getItem('aim_user_mobile') || '';
      const cachedMail = localStorage.getItem('aim_user_email') || '';
      if (cachedName && cachedMob) prefillCheckoutFields(cachedName, cachedMob, cachedMail);
      initLandingPageExitShield(config);
      return;
    }

    const hasAdSource = urlParams.has('utm_source') || urlParams.has('fbclid') || urlParams.has('gclid') || (urlParams.get('source') || '').toLowerCase().includes('fb');
    const isAdsEnabled = forceAd || (hasAdSource && !explicitlyDisabled) || config.ads_mode_enabled === true || config.ads_gateway_enabled === true;

    if (isAdsEnabled) {
      renderGatewayModal(config);
    }
  };

  // Instant Auto-Boot for 0ms delay: ONLY when explicit ad params (forceAd or tracking) are present
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const forceAd = urlParams.get('ad') === '1' || urlParams.get('ads') === '1' || urlParams.get('lead') === '1';
    const hasAdSource = urlParams.has('utm_source') || urlParams.has('fbclid') || urlParams.has('gclid') || (urlParams.get('source') || '').toLowerCase().includes('fb');

    if (!isUserRegistered() && (forceAd || hasAdSource)) {
      if (document.body) {
        renderGatewayModal();
      } else {
        document.addEventListener('DOMContentLoaded', () => renderGatewayModal(), { once: true });
      }
    }
  } catch (_) { }

  // Auto-prefill on DOM ready if user is known
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const n = localStorage.getItem('aim_user_name');
      const m = localStorage.getItem('aim_user_mobile');
      const e = localStorage.getItem('aim_user_email') || localStorage.getItem('user_email');
      if (n && m) prefillCheckoutFields(n, m, e);
    });
  } else {
    const n = localStorage.getItem('aim_user_name');
    const m = localStorage.getItem('aim_user_mobile');
    const e = localStorage.getItem('aim_user_email') || localStorage.getItem('user_email');
    if (n && m) prefillCheckoutFields(n, m, e);
  }

})();
