/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL SMART LOGIN & REGISTRATION ENGINE
 * Version: 25.0 (Smart 2-Step Mobile Detection, Auto +91 Strip, Granular Source)
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

  // 1. Smart Mobile Sanitizer (+91, 91, 0, spaces, dashes auto-stripped)
  function cleanIndianMobile(val) {
    if (!val) return '';
    let str = String(val).trim();
    // Keep digits and plus for initial prefix inspection
    str = str.replace(/[^\d+]/g, '');
    if (str.startsWith('+91')) {
      str = str.substring(3);
    } else if (str.startsWith('0091')) {
      str = str.substring(4);
    } else if (str.length > 10 && str.startsWith('91')) {
      str = str.substring(2);
    }
    str = str.replace(/\D/g, '');
    while (str.startsWith('0') && str.length > 10) {
      str = str.substring(1);
    }
    if (str.startsWith('0')) {
      str = str.substring(1);
    }
    if (str.length === 12 && str.startsWith('91')) {
      str = str.substring(2);
    }
    return str.slice(0, 10);
  }
  window.cleanIndianMobile = cleanIndianMobile;

  // 2. Precise Granular Page Source Detector (Friendly Hindi/English for Admin)
  function getGranularPageSource() {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('aarogyam-sakhi')) return 'सखी AI (Aarogyam Sakhi)';
    if (path.includes('tube')) return 'आरोग्यमट्यूब (AarogyamTube)';
    if (path.includes('webinar')) return 'लाइव वेबिनार (Webinar)';
    if (path.includes('mandi')) return 'दैनिक मंडी भाव (Mandi)';
    if (path.includes('weather')) return 'मौसम पूर्वानुमान (Weather)';
    if (path.includes('krishi-panchang') || path.includes('panchang')) return 'वैदिक सनातन पंचांग (Panchang)';
    if (path.includes('pashu-palan')) return 'पशु पालन हब (Pashu Palan)';
    if (path.includes('crop-doctor')) return 'फसल डॉक्टर (Crop Doctor)';
    if (path.includes('netsurf-pathfinder')) return 'नेट्सर्फ पाथफाइंडर (Pathfinder)';
    if (path.includes('kharif-master-guide')) return 'खरीफ मास्टर गाइड ई-बुक';
    if (path.includes('kheti-dr')) return 'खेती का डॉक्टर ई-बुक';
    if (path.includes('demo-book') || path.includes('demo-kharif')) return 'फ्री डेमो ई-बुक (Demo Reader)';
    if (path.includes('health/diabetes')) return 'हेल्थ - डायबिटीज';
    if (path.includes('health/joint-care')) return 'हेल्थ - जोड़ों का दर्द';
    if (path.includes('health/weight-loss')) return 'हेल्थ - मोटापा व वजन';
    if (path.includes('health/hair-care')) return 'हेल्थ - हेयर केयर';
    if (path.includes('health/skin-care')) return 'हेल्थ - स्किन केयर';
    if (path.includes('health/heart-care')) return 'हेल्थ - हार्ट केयर';
    if (path.includes('health/kids-care')) return 'हेल्थ - किड्स केयर';
    if (path.includes('health/womens-care')) return 'हेल्थ - महिला स्वास्थ्य';
    if (path.includes('health/dental-care')) return 'हेल्थ - डेंटल केयर';
    if (path.includes('health/liver-care')) return 'हेल्थ - लिवर केयर';
    if (path.includes('health/thyroid-care')) return 'हेल्थ - थायरॉयड केयर';
    if (path.includes('health/sexual-wellness')) return 'हेल्थ - सेक्सुअल वेलनेस';
    if (path.includes('health/home-care')) return 'हेल्थ - होम केयर';
    if (path === '/' || path.endsWith('/index.html') || path === '') return 'मुख्य पृष्ठ (Homepage)';
    return document.title ? document.title.split('-')[0].trim() : 'Aarogyam Portal';
  }
  window.getGranularPageSource = getGranularPageSource;

  // 3. Precise, Reliable Logged-in Verification (10-Digit Mobile Check)
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
                     localStorage.getItem('SAKHI_USER_PHONE') ||
                     localStorage.getItem('aarogyam_user_phone') ||
                     localStorage.getItem('farmer_mobile');

      const cleanMobile = cleanIndianMobile(mobile);
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
  let detectedExistingProfile = null;
  let phoneCheckTimer = null;

  // 4. Build and Inject the Single Universal Smart 2-Step Modal
  function createOrGetAuthModal() {
    let overlay = document.getElementById('ai-universal-auth-modal');
    if (overlay) overlay.remove();

    const sponsorId = getActiveSponsorShareId();
    overlay = document.createElement('div');
    overlay.id = 'ai-universal-auth-modal';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
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
        
        <!-- Header -->
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
            transition: background 0.2s;
          " title="बंद करें">&times;</button>
          
          <img src="/images/logo/logo.png" alt="Aarogyam India" style="height: 40px; max-width: 150px; object-fit: contain; margin-bottom: 6px;" onerror="this.src='/images/logo/fevicon.png'">
          
          <h2 id="ai-auth-modal-title" style="margin: 0; font-size: 1.25rem; font-weight: 900; color: #ffffff; letter-spacing: -0.2px;">
            आरोग्यम इंडिया में स्वागत है
          </h2>
          <p id="ai-auth-modal-subtitle" style="margin: 4px 0 0 0; font-size: 0.82rem; color: #d1fae5; font-weight: 600;">
            1-क्लिक सुरक्षित एक्सेस व किसान सहायता
          </p>

          <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.25); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; color: #fef08a; font-weight: 700;">
            <span>💛 रेफरल कोड:</span>
            <span id="ai-auth-sponsor-badge">${sponsorId}</span>
          </div>
        </div>

        <!-- Form Body -->
        <div style="padding: 20px 20px 18px;">
          <form id="ai-universal-auth-form" style="display: flex; flex-direction: column; gap: 14px;">
            
            <!-- Step 1: Mobile Number Input (Always visible, smart cleaner) -->
            <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
              <label for="ai-auth-input-mobile" style="font-size: 0.84rem; font-weight: 800; color: #334155; display: flex; justify-content: space-between;">
                <span>📱 WhatsApp मोबाइल नंबर <span style="color:#ef4444;">*</span></span>
                <span id="ai-auth-mobile-counter" style="font-size: 0.72rem; color: #64748b; font-weight: 600;">(10 अंक)</span>
              </label>
              <div style="display: flex; align-items: center; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; overflow: hidden; transition: border-color 0.2s;">
                <span style="padding: 12px 12px; font-size: 0.95rem; font-weight: 800; color: #047857; background: #ecfdf5; border-right: 1.5px solid #cbd5e1;">+91</span>
                <input type="tel" id="ai-auth-input-mobile" placeholder="उदा. 9876543210" maxlength="15" autocomplete="tel" autofocus required style="
                  flex: 1; border: none; background: transparent; color: #0f172a; font-size: 1rem; padding: 12px 14px; outline: none; font-family: inherit; font-weight: 700; letter-spacing: 0.5px;
                ">
              </div>
            </div>

            <!-- Notice / Status Box -->
            <div id="ai-auth-form-msg" style="display: none; font-size: 0.82rem; font-weight: 700; padding: 10px 12px; border-radius: 10px; text-align: center; line-height: 1.4; transition: all 0.2s;"></div>

            <!-- Step 2: Name Input (Smooth animated slide-down, visible only for NEW users) -->
            <div id="ai-auth-name-wrapper" style="display: none; flex-direction: column; gap: 4px; text-align: left; opacity: 0; transform: translateY(-8px); transition: all 0.28s ease;">
              <label for="ai-auth-input-name" style="font-size: 0.84rem; font-weight: 800; color: #334155;">
                👤 आपका पूरा शुभ नाम (Full Name) <span style="color:#ef4444;">*</span>
              </label>
              <input type="text" id="ai-auth-input-name" placeholder="उदा. हरिनारायण महतो" autocomplete="name" style="
                width: 100%; box-sizing: border-box; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; color: #0f172a; font-size: 0.95rem; padding: 12px 14px; outline: none; font-family: inherit; font-weight: 600;
              ">
            </div>

            <!-- Submit Button -->
            <button type="submit" id="ai-auth-submit-btn" style="
              background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; border: none; padding: 14px 18px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4); margin-top: 4px; transition: transform 0.15s, background 0.2s;
            ">
              <span id="ai-auth-btn-label">🟢 तुरंत शुरू करें / लॉगिन करें (Continue) &rarr;</span>
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

    document.body.appendChild(overlay);

    // Event Bindings
    const closeBtn = overlay.querySelector('#ai-btn-close-auth-modal');
    const guestBtn = overlay.querySelector('#ai-btn-continue-guest-text');
    const authForm = overlay.querySelector('#ai-universal-auth-form');
    const mobileInput = overlay.querySelector('#ai-auth-input-mobile');
    const nameInput = overlay.querySelector('#ai-auth-input-name');
    const nameWrapper = overlay.querySelector('#ai-auth-name-wrapper');
    const msgBox = overlay.querySelector('#ai-auth-form-msg');
    const submitBtn = overlay.querySelector('#ai-auth-submit-btn');
    const btnLabel = overlay.querySelector('#ai-auth-btn-label');
    const counter = overlay.querySelector('#ai-auth-mobile-counter');

    detectedExistingProfile = null;

    // Mobile Input Realtime Smart Sanitizer & Auto DB Check
    mobileInput?.addEventListener('input', () => {
      const cleaned = cleanIndianMobile(mobileInput.value);
      mobileInput.value = cleaned;

      if (counter) {
        counter.textContent = `(${cleaned.length}/10 अंक)`;
        counter.style.color = cleaned.length === 10 ? '#15803d' : '#64748b';
      }

      clearTimeout(phoneCheckTimer);

      if (cleaned.length < 10) {
        detectedExistingProfile = null;
        if (msgBox) msgBox.style.display = 'none';
        if (nameWrapper) {
          nameWrapper.style.display = 'none';
          nameWrapper.style.opacity = '0';
          nameWrapper.style.transform = 'translateY(-8px)';
          if (nameInput) nameInput.required = false;
        }
        if (btnLabel) btnLabel.innerHTML = '🟢 तुरंत शुरू करें / लॉगिन करें (Continue) &rarr;';
        return;
      }

      // Exactly 10 digits entered: validate starting digit [6-9]
      if (!/^[6-9]\d{9}$/.test(cleaned)) {
        if (msgBox) {
          msgBox.style.display = 'block';
          msgBox.style.background = '#fee2e2';
          msgBox.style.color = '#dc2626';
          msgBox.style.border = '1.5px solid #fca5a5';
          msgBox.innerHTML = '⚠️ कृपया 6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।';
        }
        return;
      }

      // Show looking up spinner
      if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.style.background = '#fef3c7';
        msgBox.style.color = '#b45309';
        msgBox.style.border = '1.5px solid #fde68a';
        msgBox.innerHTML = '⏳ खाता जाँचा जा रहा है...';
      }

      phoneCheckTimer = setTimeout(async () => {
        const db = getDb();
        if (!db) return;

        try {
          const { data } = await db
            .from('profiles')
            .select('id, full_name, mobile, share_id, referral_code, is_active')
            .eq('mobile', cleaned)
            .limit(1)
            .maybeSingle();

          if (data && data.full_name && data.full_name.trim()) {
            // CASE A: EXISTING USER FOUND
            detectedExistingProfile = data;
            if (nameWrapper) {
              nameWrapper.style.display = 'none';
              nameWrapper.style.opacity = '0';
              if (nameInput) {
                nameInput.value = data.full_name;
                nameInput.required = false;
              }
            }
            if (msgBox) {
              msgBox.style.display = 'block';
              msgBox.style.background = '#dcfce7';
              msgBox.style.color = '#15803d';
              msgBox.style.border = '1.5px solid #86efac';
              msgBox.innerHTML = `✅ पूर्व पंजीकृत खाता: <strong>${data.full_name} जी</strong>`;
            }
            if (btnLabel) btnLabel.innerHTML = '🟢 तुरंत लॉगिन करें (Continue) &rarr;';
          } else {
            // CASE B: NEW USER (OR EXISTING PROFILE WITH EMPTY NAME)
            detectedExistingProfile = data || null;
            if (msgBox) {
              msgBox.style.display = 'block';
              msgBox.style.background = '#eff6ff';
              msgBox.style.color = '#1d4ed8';
              msgBox.style.border = '1.5px solid #bfdbfe';
              msgBox.innerHTML = '✨ नया खाता: कृपया नीचे अपना शुभ नाम दर्ज करें';
            }
            if (nameWrapper) {
              nameWrapper.style.display = 'flex';
              setTimeout(() => {
                nameWrapper.style.opacity = '1';
                nameWrapper.style.transform = 'translateY(0)';
              }, 20);
              if (nameInput) {
                nameInput.required = true;
                if (!nameInput.value) nameInput.focus();
              }
            }
            if (btnLabel) btnLabel.innerHTML = '⚡ खाता बनाएं और तुरंत शुरू करें (Register & Continue) &rarr;';
          }
        } catch (err) {
          console.warn('Profile auto-check notice:', err);
          if (nameWrapper) {
            nameWrapper.style.display = 'flex';
            nameWrapper.style.opacity = '1';
            nameWrapper.style.transform = 'translateY(0)';
            if (nameInput) nameInput.required = true;
          }
        }
      }, 250);
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

    // Form Submission Handler
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mobile = cleanIndianMobile(mobileInput?.value || '');
        const enteredName = (nameInput?.value || '').trim();

        if (!/^[6-9]\d{9}$/.test(mobile)) {
          if (msgBox) {
            msgBox.style.display = 'block';
            msgBox.style.background = '#fee2e2';
            msgBox.style.color = '#dc2626';
            msgBox.style.border = '1.5px solid #fca5a5';
            msgBox.innerHTML = 'कृपया 10 अंकों का सही भारतीय WhatsApp मोबाइल नंबर दर्ज करें।';
          }
          mobileInput?.focus();
          return;
        }

        // If new user or profile needs name
        let officialName = (detectedExistingProfile?.full_name || '').trim();
        if (!officialName) {
          if (enteredName.length < 2) {
            if (msgBox) {
              msgBox.style.display = 'block';
              msgBox.style.background = '#fee2e2';
              msgBox.style.color = '#dc2626';
              msgBox.style.border = '1.5px solid #fca5a5';
              msgBox.innerHTML = 'कृपया अपना पूरा शुभ नाम दर्ज करें।';
            }
            if (nameWrapper) {
              nameWrapper.style.display = 'flex';
              nameWrapper.style.opacity = '1';
              nameWrapper.style.transform = 'translateY(0)';
            }
            nameInput?.focus();
            return;
          }
          officialName = enteredName;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.75';
          if (btnLabel) btnLabel.innerHTML = 'सत्यापित हो रहा है... ⏳';
        }

        const sponsorShareId = getActiveSponsorShareId();
        const userUniqueShareId = (mobile === '7974422572' || mobile.endsWith('7974422572')) ? 'AI000004' : ('AI' + mobile.slice(-6));
        const resolvedPageSource = currentAuthOptions?.source || getGranularPageSource();

        const db = getDb();
        let existingProfile = detectedExistingProfile;
        let sponsorProfileId = '52ef705c-bb45-4137-bee4-a3f8df73b676';
        let sponsorMobile = '7974422572';

        if (db) {
          try {
            // Re-verify if not cached
            if (!existingProfile) {
              const { data } = await db
                .from('profiles')
                .select('id, full_name, mobile, share_id, referral_code')
                .eq('mobile', mobile)
                .limit(1)
                .maybeSingle();
              existingProfile = data;
            }

            // Sponsor Lookup
            if (sponsorShareId !== 'AI000004') {
              try {
                const { data: refUser } = await db.from('profiles').select('id, mobile').eq('share_id', sponsorShareId).limit(1).maybeSingle();
                if (refUser && refUser.id) {
                  sponsorProfileId = refUser.id;
                  if (refUser.mobile) sponsorMobile = refUser.mobile;
                }
              } catch(e) {}
            }
          } catch (e) {
            console.warn('Profile check warning:', e);
          }
        }

        let officialShareId = userUniqueShareId;
        let finalUserId = existingProfile?.id || null;

        if (existingProfile) {
          // If profile existed but full_name was empty, heal/update it with the entered name!
          if (!existingProfile.full_name || !existingProfile.full_name.trim()) {
            if (db && officialName) {
              try {
                await db.from('profiles').update({
                  full_name: officialName,
                  registration_source: existingProfile.registration_source || resolvedPageSource
                }).eq('id', existingProfile.id);
              } catch (_) {}
            }
          } else {
            officialName = existingProfile.full_name.trim();
          }

          if (existingProfile.share_id) {
            officialShareId = existingProfile.share_id;
          }
          finalUserId = existingProfile.id;
        } else if (db) {
          // BRAND NEW USER REGISTRATION IN SUPABASE
          try {
            const { data: newReg, error: insErr } = await db.from('profiles').insert([{
              full_name: officialName,
              mobile: mobile,
              share_id: userUniqueShareId,
              referral_code: sponsorShareId,
              referral_mobile: sponsorShareId === 'AI000004' ? '7974422572' : (sponsorMobile || null),
              referred_by: sponsorProfileId,
              registration_source: resolvedPageSource,
              profile_complete: false,
              is_active: false // STRICT: Inactive until user purchases or admin activates
            }]).select().single();

            if (!insErr && newReg) {
              finalUserId = newReg.id;
              if (newReg.share_id) officialShareId = newReg.share_id;
            }

            // Log referral
            if (finalUserId || sponsorProfileId) {
              try {
                await db.from('referrals').insert([{
                  referred_by: sponsorProfileId,
                  referral_code: sponsorShareId,
                  status: 'success',
                  joined_at: new Date().toISOString()
                }]);
              } catch (_) {}
            }
          } catch (e) {
            console.warn('Insert profile warning:', e);
          }
        }

        // Complete 100% Session & Storage Synchronization
        const userObj = {
          id: finalUserId || ('AI_' + mobile),
          name: officialName,
          full_name: officialName,
          mobile: mobile,
          phone: mobile,
          share_id: officialShareId,
          referral_code: existingProfile?.referral_code || sponsorShareId,
          registered_at: new Date().toISOString(),
          source: resolvedPageSource
        };

        try {
          localStorage.setItem('aim_user_name', officialName);
          localStorage.setItem('aim_user_mobile', mobile);
          localStorage.setItem('user_name', officialName);
          localStorage.setItem('user_phone', mobile);
          localStorage.setItem('aarogyam_user_name', officialName);
          localStorage.setItem('aarogyam_user_phone', mobile);
          localStorage.setItem('SAKHI_USER_NAME', officialName);
          localStorage.setItem('SAKHI_USER_PHONE', mobile);
          localStorage.setItem('aarogyam_user_registered', 'true');
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

          if (window.V1_SESSION && typeof window.V1_SESSION.syncAndHealSession === 'function') {
            window.V1_SESSION.syncAndHealSession();
          }
        } catch (err) {
          console.warn('LocalStorage save notice:', err);
        }

        // Close modal smoothly
        window.closeGuestLoginModal();

        // Reset submit button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          if (btnLabel) btnLabel.innerHTML = '🟢 तुरंत शुरू करें / लॉगिन करें (Continue) &rarr;';
        }

        // Broadcast Global Logged-in Event to Universal Drawer & Site
        try {
          if (typeof window.updateUniversalDrawerProfile === 'function') {
            window.updateUniversalDrawerProfile();
          }
          window.dispatchEvent(new CustomEvent('ai:user-logged-in', { detail: userObj }));
        } catch(e) {}

        // Execute Context Callback
        if (typeof pendingAuthCallback === 'function') {
          const cb = pendingAuthCallback;
          pendingAuthCallback = null;
          try { cb(userObj); } catch(e) { console.warn('Auth callback error:', e); }
        }

        // Background Survey sync for digital lead analytics
        if (db) {
          (async () => {
            try {
              await db.from('surveys').insert([{
                phone_number: mobile,
                name: officialName,
                source: resolvedPageSource,
                source_of_registration: resolvedPageSource,
                occupation: 'digital_lead',
                notes: `Registered via ${resolvedPageSource}: ${window.location.pathname}`,
                event_type: 'quick_login_registration',
                category_answers: {
                  referrer_share_id: sponsorShareId,
                  page_url: window.location.href,
                  registered_at: new Date().toISOString(),
                  ...currentAuthOptions?.meta
                }
              }]);
            } catch (dbErr) {
              console.warn('Background survey sync notice:', dbErr);
            }
          })();
        }
      });
    }

    return overlay;
  }

  // 5. Global Control Functions
  window.openGuestLoginModal = function(callback, options) {
    try {
      sessionStorage.setItem('ai_auth_return_url', window.location.pathname + window.location.search);
    } catch (e) {}

    currentAuthOptions = options || {};

    if (window.isUserLoggedIn() && !currentAuthOptions.force) {
      if (typeof callback === 'function') callback();
      return;
    }

    pendingAuthCallback = callback || null;
    createOrGetAuthModal();

    const modal = document.getElementById('ai-universal-auth-modal');
    const card = document.getElementById('ai-universal-auth-card');
    const mobInp = document.getElementById('ai-auth-input-mobile');

    if (modal && card) {
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      card.style.transform = 'scale(1) translateY(0)';
      setTimeout(() => { if (mobInp) mobInp.focus(); }, 120);
    }
  };

  // Aliases for universal access
  window.openUniversalAuthModal = window.openGuestLoginModal;
  window.openLoginPopup = function(title, subtitle, callback) {
    window.openGuestLoginModal(callback, { title, subtitle });
  };

  window.ensureAuthenticatedGuest = function(callback, options = {}) {
    if (typeof window.isUserLoggedIn === 'function' && window.isUserLoggedIn()) {
      if (typeof callback === 'function') callback();
      return true;
    }
    window.openGuestLoginModal(callback, { force: true, ...options });
    return false;
  };

  window.closeGuestLoginModal = function() {
    const modal = document.getElementById('ai-universal-auth-modal');
    const card = document.getElementById('ai-universal-auth-card');
    if (modal && card) {
      modal.style.opacity = '0';
      modal.style.visibility = 'hidden';
      card.style.transform = 'scale(0.92) translateY(16px)';
    }
  };
  window.closeLoginPopup = window.closeGuestLoginModal;

  // 6. 15-Second Idle / Browsing Guest Auto-Popup
  // STRICT RULE: Book landing pages (free demo only), checkout & admin pages are EXCLUDED!
  function init15SecGuestTimer() {
    const path = (window.location.pathname || '').toLowerCase();

    // Check excluded pages
    const isExcluded = 
      path.includes('book-landing') || 
      path.includes('kharif-master-guide') || 
      path.includes('kheti-dr') || 
      path.includes('demo-book') || 
      path.includes('demo-kharif') ||
      path.includes('checkout') || 
      path.includes('admin') || 
      path.includes('registration');

    if (isExcluded) {
      return; // Do not auto-trigger on book landing or checkout pages
    }

    if (window.isUserLoggedIn() || isDismissedThisSession()) {
      return;
    }

    setTimeout(() => {
      if (!window.isUserLoggedIn() && !isDismissedThisSession()) {
        window.openGuestLoginModal(null, { autoTrigger: true, source: getGranularPageSource() });
      }
    }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init15SecGuestTimer);
  } else {
    init15SecGuestTimer();
  }

})();
