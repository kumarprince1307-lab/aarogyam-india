/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL COMMON REGISTRATION & LOGIN MODAL ENGINE
 * Version: 21.0 (Flawless Dual-Action Modal on Site / Fast In-Modal on Webinar)
 * ====================================================================
 */
(function() {
  'use strict';

  const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
  let dbClient = null;

  function getDb() {
    if (!dbClient) {
      try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
          dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        } else if (window.dbClient) {
          dbClient = window.dbClient;
        }
      } catch (e) {
        console.warn('Universal modal DB init warning:', e);
      }
    }
    return dbClient;
  }

  // 1. Precise, Reliable Logged-in Verification (10-Digit Mobile Check)
  window.isUserLoggedIn = function() {
    try {
      let aiUser = {};
      try { aiUser = JSON.parse(localStorage.getItem('AI_USER') || '{}'); } catch(e) {}
      let aiProfile = {};
      try { aiProfile = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}'); } catch(e) {}
      let ucasUser = {};
      try { ucasUser = JSON.parse(localStorage.getItem('UCAS_USER') || '{}'); } catch(e) {}

      const mobile = localStorage.getItem('aim_user_mobile') || 
                     aiUser.mobile || aiUser.phone || 
                     aiProfile.mobile || aiProfile.phone || 
                     ucasUser.mobile || ucasUser.phone || 
                     localStorage.getItem('user_phone') || 
                     localStorage.getItem('farmer_mobile');

      const cleanMobile = mobile ? String(mobile).replace(/\D/g, '').slice(-10) : '';
      return cleanMobile.length === 10;
    } catch (e) {
      return false;
    }
  };

  function isDismissedThisSession() {
    try {
      return sessionStorage.getItem('ai_guest_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  }

  function getActiveSponsorShareId() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get('ref') || urlParams.get('share_id') || urlParams.get('share_token') || urlParams.get('sponsor');
      if (urlRef && /^AI\d{4,8}$/i.test(urlRef)) return urlRef;

      const sessionObj = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
      if (sessionObj.referral_share_id && /^AI\d{4,8}$/i.test(sessionObj.referral_share_id)) {
        return sessionObj.referral_share_id;
      }
    } catch (e) {}
    return 'AI000004';
  }

  let pendingAuthCallback = null;
  let currentAuthOptions = {};

  // 2. Build and Inject the Single Universal Modal
  function createOrGetAuthModal(isWebinarMode = false) {
    let overlay = document.getElementById('ai-universal-auth-modal');
    if (overlay) {
      overlay.remove(); // Clean re-render for appropriate layout
    }

    const sponsorId = getActiveSponsorShareId();
    overlay = document.createElement('div');
    overlay.id = 'ai-universal-auth-modal';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.25s ease, visibility 0.25s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    `;

    if (isWebinarMode) {
      // -------------------------------------------------------------
      // LAYOUT A: WEBINAR & AAROGYAMTUBE FAST IN-MODAL FORM
      // -------------------------------------------------------------
      overlay.innerHTML = `
        <div style="
          background: #ffffff;
          color: #0f172a;
          max-width: 420px;
          width: 100%;
          border-radius: 24px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 35px rgba(5, 150, 105, 0.2);
          overflow: hidden;
          position: relative;
          transform: scale(0.92) translateY(16px);
          transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1.5px solid #e2e8f0;
        " id="ai-universal-auth-card">
          
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%); padding: 22px 20px 18px; text-align: center; position: relative; color: #ffffff;">
            <button type="button" id="ai-btn-close-auth-modal" style="
              position: absolute;
              top: 12px;
              right: 12px;
              background: rgba(255, 255, 255, 0.22);
              border: none;
              color: #ffffff;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.25rem;
              cursor: pointer;
            " title="बंद करें">&times;</button>
            
            <img src="/images/logo/logo.png" alt="Aarogyam India" style="height: 40px; max-width: 150px; object-fit: contain; margin-bottom: 6px;" onerror="this.src='/images/logo/aarogyamtube-logo.png'">
            
            <h2 id="ai-auth-modal-title" style="margin: 0; font-size: 1.25rem; font-weight: 900; color: #ffffff;">
              मुफ़्त रजिस्ट्रेशन / लॉगिन
            </h2>
            <p id="ai-auth-modal-subtitle" style="margin: 4px 0 0 0; font-size: 0.82rem; color: #d1fae5; font-weight: 600;">
              लाइव वेबिनार, AarogyamTube एवं ई-बुक्स का आनंद लें
            </p>

            <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.25); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; color: #fef08a; font-weight: 700;">
              <span>💛 रेफरल कोड:</span>
              <span id="ai-auth-sponsor-badge">${sponsorId}</span>
            </div>
          </div>

          <div style="padding: 20px 20px 18px;">
            <form id="ai-universal-auth-form" style="display: flex; flex-direction: column; gap: 14px;">
              <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                <label for="ai-auth-input-name" style="font-size: 0.82rem; font-weight: 800; color: #334155;">
                  👤 आपका पूरा नाम (Full Name) <span style="color:#ef4444;">*</span>
                </label>
                <input type="text" id="ai-auth-input-name" placeholder="उदा. राहुल शर्मा" required autocomplete="name" style="
                  width: 100%; box-sizing: border-box; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; color: #0f172a; font-size: 0.95rem; padding: 12px 14px; outline: none; font-family: inherit; font-weight: 600;
                ">
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                <label for="ai-auth-input-mobile" style="font-size: 0.82rem; font-weight: 800; color: #334155;">
                  📱 10 अंकों का व्हाट्सएप मोबाइल नंबर <span style="color:#ef4444;">*</span>
                </label>
                <input type="tel" id="ai-auth-input-mobile" placeholder="उदा. 9876543210" maxlength="10" pattern="[6-9][0-9]{9}" required autocomplete="tel" style="
                  width: 100%; box-sizing: border-box; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; color: #0f172a; font-size: 0.95rem; padding: 12px 14px; outline: none; font-family: inherit; font-weight: 700;
                ">
              </div>

              <div id="ai-auth-form-msg" style="display: none; font-size: 0.78rem; font-weight: 700; color: #dc2626; padding: 6px 10px; background: #fee2e2; border-radius: 8px; text-align: center;"></div>

              <button type="submit" id="ai-auth-submit-btn" style="
                background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; border: none; padding: 14px 18px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4); margin-top: 4px;
              ">
                <span>🟢 तुरंत शुरू करें/लॉगिन करें (Continue) &rarr;</span>
              </button>
            </form>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 0.74rem; color: #64748b; font-weight: 600;">
              <span>🔒 100% सुरक्षित • कोई पासवर्ड नहीं</span>
              <button type="button" id="ai-btn-continue-guest-text" style="background: transparent; border: none; color: #047857; font-size: 0.76rem; cursor: pointer; font-weight: 800; text-decoration: underline;">
                गेस्ट मोड (Browse as Guest)
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // -------------------------------------------------------------
      // LAYOUT B: HOMEPAGE & GENERAL PAGES DUAL-ACTION CHOICE MODAL
      // -------------------------------------------------------------
      overlay.innerHTML = `
        <div style="
          background: #ffffff;
          color: #0f172a;
          max-width: 440px;
          width: 100%;
          border-radius: 24px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 35px rgba(5, 150, 105, 0.2);
          overflow: hidden;
          position: relative;
          transform: scale(0.92) translateY(16px);
          transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1.5px solid #e2e8f0;
          text-align: center;
        " id="ai-universal-auth-card">
          
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%); padding: 24px 20px 20px; position: relative; color: #ffffff;">
            <button type="button" id="ai-btn-close-auth-modal" style="
              position: absolute;
              top: 12px;
              right: 12px;
              background: rgba(255, 255, 255, 0.22);
              border: none;
              color: #ffffff;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.25rem;
              cursor: pointer;
            " title="बंद करें">&times;</button>
            
            <img src="/images/logo/logo.png" alt="Aarogyam India" style="height: 44px; max-width: 160px; object-fit: contain; margin-bottom: 8px;" onerror="this.src='/images/logo/logo.png'">
            
            <h2 id="ai-auth-modal-title" style="margin: 0; font-size: 1.3rem; font-weight: 900; color: #ffffff;">
              मुफ़्त रजिस्ट्रेशन / लॉगिन
            </h2>
            <p id="ai-auth-modal-subtitle" style="margin: 4px 0 0 0; font-size: 0.86rem; color: #d1fae5; font-weight: 600;">
              Aarogyam India में आपका स्वागत है
            </p>
          </div>

          <div style="padding: 24px 20px 22px;">
            <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 12px 14px; margin-bottom: 20px; font-size: 0.84rem; color: #166534; line-height: 1.45; font-weight: 600;">
              ✨ मुफ़्त रजिस्टर करके अपनी <strong>डिजिटल ई-बुक्स, My Profile</strong> व <strong>UCAS Marketing Tools</strong> का उपयोग करें।
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
              <a href="/registration.html?source=homepage-modal" style="
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: #ffffff;
                padding: 14px 10px;
                border-radius: 14px;
                text-decoration: none;
                font-weight: 800;
                font-size: 0.92rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
              ">
                <span style="font-size: 1.2rem;">👤</span>
                <span>रजिस्ट्रेशन करें</span>
                <span style="font-size: 0.72rem; opacity: 0.85; font-weight: 600;">(New User)</span>
              </a>

              <a href="/registration.html?mode=login&source=homepage-modal" style="
                background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
                color: #ffffff;
                padding: 14px 10px;
                border-radius: 14px;
                text-decoration: none;
                font-weight: 800;
                font-size: 0.92rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);
              ">
                <span style="font-size: 1.2rem;">🔑</span>
                <span>लॉगिन करें</span>
                <span style="font-size: 0.72rem; opacity: 0.85; font-weight: 600;">(Existing User)</span>
              </a>
            </div>

            <div style="margin-top: 10px;">
              <button type="button" id="ai-btn-continue-guest-text" style="
                background: transparent;
                border: none;
                color: #047857;
                font-size: 0.82rem;
                cursor: pointer;
                font-weight: 800;
                text-decoration: underline;
                padding: 4px 8px;
              ">
                गेस्ट के रूप में वेबसाइट देखें (Browse as Guest) &rarr;
              </button>
            </div>
          </div>
        </div>
      `;
    }

    document.body.appendChild(overlay);

    // Event Bindings
    const closeBtn = overlay.querySelector('#ai-btn-close-auth-modal');
    const guestBtn = overlay.querySelector('#ai-btn-continue-guest-text');
    const authForm = overlay.querySelector('#ai-universal-auth-form');
    const mobileInput = overlay.querySelector('#ai-auth-input-mobile');
    const nameInput = overlay.querySelector('#ai-auth-input-name');

    mobileInput?.addEventListener('input', () => {
      mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
    });

    function dismissModal() {
      try {
        sessionStorage.setItem('ai_guest_dismissed', 'true');
      } catch (e) {}
      window.closeGuestLoginModal();
    }

    closeBtn?.addEventListener('click', dismissModal);
    guestBtn?.addEventListener('click', dismissModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismissModal();
    });

    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('ai-auth-submit-btn');
        const msgBox = document.getElementById('ai-auth-form-msg');
        const name = (nameInput?.value || '').trim();
        const mobile = (mobileInput?.value || '').trim().replace(/\D/g, '').slice(-10);

        if (name.length < 2) {
          if (msgBox) {
            msgBox.style.display = 'block';
            msgBox.textContent = 'कृपया अपना पूरा नाम दर्ज करें।';
          }
          nameInput?.focus();
          return;
        }

        if (!/^[6-9]\d{9}$/.test(mobile)) {
          if (msgBox) {
            msgBox.style.display = 'block';
            msgBox.textContent = 'कृपया 10 अंकों का मान्य व्हाट्सएप मोबाइल नंबर दर्ज करें।';
          }
          mobileInput?.focus();
          return;
        }

        if (msgBox) msgBox.style.display = 'none';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.75';
          submitBtn.innerHTML = '<span>सत्यापित हो रहा है...</span> <span>⏳</span>';
        }

        const sponsorShareId = getActiveSponsorShareId();
        const userUniqueShareId = 'AI' + mobile.slice(-6);

        // 1. Instant 0ms Local Storage Session (Zero Lag)
        const userObj = {
          id: 'AI_' + mobile,
          name: name,
          full_name: name,
          mobile: mobile,
          phone: mobile,
          share_id: userUniqueShareId,
          referral_code: sponsorShareId,
          registered_at: new Date().toISOString(),
          source: currentAuthOptions?.source || 'UniversalModal'
        };

        try {
          localStorage.setItem('aim_user_name', name);
          localStorage.setItem('aim_user_mobile', mobile);
          localStorage.setItem('AI_USER', JSON.stringify(userObj));
          localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
          localStorage.setItem('UCAS_USER', JSON.stringify(userObj));
          localStorage.setItem('wb_registered', 'true');
          
          let existingSession = {};
          try { existingSession = JSON.parse(localStorage.getItem('AI_SESSION') || '{}'); } catch(e) {}
          localStorage.setItem('AI_SESSION', JSON.stringify({
            ...existingSession,
            mobile: mobile,
            active: true,
            loginTime: new Date().toISOString(),
            referral_share_id: sponsorShareId
          }));
        } catch (err) {
          console.warn('LocalStorage save notice:', err);
        }

        // Close modal smoothly
        window.closeGuestLoginModal();

        // Reset button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.innerHTML = '<span>🟢 तुरंत शुरू करें/लॉगिन करें (Continue) &rarr;</span>';
        }

        // 2. Broadcast Global Logged-in Event
        try {
          window.dispatchEvent(new CustomEvent('ai:user-logged-in', { detail: userObj }));
        } catch(e) {}

        // 3. Execute Context Callback (e.g. play video, unlock webinar, join zoom)
        if (typeof pendingAuthCallback === 'function') {
          const cb = pendingAuthCallback;
          pendingAuthCallback = null;
          try { cb(userObj); } catch(e) { console.warn('Auth callback error:', e); }
        }

        // 4. Background Non-Blocking Zero-Egress Database Sync (Supabase)
        const db = getDb();
        if (db) {
          (async () => {
            try {
              const { data: existingProfile } = await db
                .from('profiles')
                .select('id, full_name, mobile, share_id')
                .eq('mobile', mobile)
                .limit(1)
                .maybeSingle();

              let sponsorProfileId = '52ef705c-bb45-4137-bee4-a3f8df73b676';
              if (sponsorShareId !== 'AI000004') {
                try {
                  const { data: refUser } = await db.from('profiles').select('id').eq('share_id', sponsorShareId).limit(1).maybeSingle();
                  if (refUser && refUser.id) sponsorProfileId = refUser.id;
                } catch(e) {}
              }

              if (existingProfile) {
                const officialDbName = (existingProfile.full_name && existingProfile.full_name.trim()) 
                  ? existingProfile.full_name.trim() 
                  : name;
                const officialShareId = existingProfile.share_id || userUniqueShareId;

                const syncedObj = {
                  ...userObj,
                  name: officialDbName,
                  full_name: officialDbName,
                  share_id: officialShareId
                };

                try {
                  localStorage.setItem('aim_user_name', officialDbName);
                  localStorage.setItem('AI_USER', JSON.stringify(syncedObj));
                  localStorage.setItem('AI_PROFILE', JSON.stringify(syncedObj));
                  localStorage.setItem('UCAS_USER', JSON.stringify(syncedObj));
                } catch(e) {}

                if (typeof window.updateUniversalDrawerProfile === 'function') {
                  window.updateUniversalDrawerProfile();
                }
                window.dispatchEvent(new CustomEvent('ai:user-logged-in', { detail: syncedObj }));
              } else {
                await db.from('profiles').insert([{
                  full_name: name,
                  mobile: mobile,
                  share_id: userUniqueShareId,
                  referral_code: sponsorShareId,
                  referral_mobile: sponsorShareId === 'AI000004' ? '7974422572' : null,
                  referred_by: sponsorProfileId,
                  registration_source: currentAuthOptions?.source || 'UniversalModal',
                  profile_complete: false,
                  is_active: true
                }]);
              }

              await db.from('surveys').insert([{
                phone_number: mobile,
                name: name,
                source: currentAuthOptions?.source || 'UniversalModal',
                source_of_registration: currentAuthOptions?.source || 'UniversalModal',
                occupation: 'digital_lead',
                notes: `Registered via ${currentAuthOptions?.source || 'Universal Modal'}: ${window.location.pathname}`,
                event_type: 'quick_login_registration',
                category_answers: {
                  referrer_share_id: sponsorShareId,
                  page_url: window.location.href,
                  registered_at: new Date().toISOString(),
                  ...currentAuthOptions?.meta
                }
              }]);
            } catch (dbErr) {
              console.warn('Background Supabase auth sync notice:', dbErr);
            }
          })();
        }
      });
    }

    return overlay;
  }

  // 3. Global Control Functions
  window.openGuestLoginModal = function(callback, options) {
    currentAuthOptions = options || {};

    // Only skip if already logged in AND NOT an explicit user click (force !== true)
    if (window.isUserLoggedIn() && !currentAuthOptions.force) {
      if (typeof callback === 'function') callback();
      return;
    }

    pendingAuthCallback = callback || null;

    const currentPath = (window.location.pathname || '').toLowerCase();
    const isWebinar = currentPath.includes('webinar') || currentAuthOptions?.source === 'WebinarPage';

    createOrGetAuthModal(isWebinar);

    const modal = document.getElementById('ai-universal-auth-modal');
    const card = document.getElementById('ai-universal-auth-card');
    const nameInp = document.getElementById('ai-auth-input-name');

    if (modal && card) {
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      card.style.transform = 'scale(1) translateY(0)';
      setTimeout(() => { if (nameInp) nameInp.focus(); }, 120);
    }
  };

  // Universal alias
  window.openUniversalAuthModal = window.openGuestLoginModal;

  window.closeGuestLoginModal = function() {
    const modal = document.getElementById('ai-universal-auth-modal');
    const card = document.getElementById('ai-universal-auth-card');
    if (modal && card) {
      modal.style.opacity = '0';
      modal.style.visibility = 'hidden';
      card.style.transform = 'scale(0.92) translateY(16px)';
    }
  };

  // 4. Auto-Trigger on Public Page Load (Dual-Action Modal on Site / Fast In-Modal on Webinar)
  function triggerAutoPopupIfApplicable() {
    const currentPath = (window.location.pathname || '').toLowerCase();
    
    // Skip Admin Panels and dedicated registration page
    if (currentPath.includes('/admin') || currentPath.endsWith('admin.html') || currentPath.includes('registration.html')) {
      return;
    }

    // Strictly DO NOT auto-show popup on ANY Book Landing Page or Checkout/Reader Funnel
    const isBookLandingOrFunnel = 
      currentPath.includes('kharif') ||
      currentPath.includes('kheti-dr') ||
      currentPath.includes('book-landing') ||
      currentPath.includes('landing') ||
      currentPath.includes('book-details') ||
      currentPath.includes('demo-book') ||
      currentPath.includes('sample-ai-book') ||
      currentPath.includes('ai-website-guide') ||
      currentPath.includes('demo-kharif') ||
      currentPath.includes('checkout') ||
      currentPath.includes('payment') ||
      currentPath.includes('reader') ||
      currentPath.includes('download') ||
      currentPath.includes('share-rewards');

    if (isBookLandingOrFunnel) {
      return;
    }

    // If user is already logged in, do NOT show modal
    if (window.isUserLoggedIn()) {
      return;
    }

    // Trigger popup smoothly after short delay
    setTimeout(() => {
      if (!window.isUserLoggedIn()) {
        const isWebinar = currentPath.includes('webinar');
        window.openGuestLoginModal(null, {
          source: isWebinar ? 'WebinarPage' : 'PublicPageLoad'
        });
      }
    }, 450);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', triggerAutoPopupIfApplicable);
  } else {
    triggerAutoPopupIfApplicable();
  }

})();
