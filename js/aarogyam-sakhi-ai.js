/**
 * ====================================================================
 * AAROGYAM SAKHI AI - NEURAL CORE ENGINE v7.0 (CHATGPT & GEMINI GRADE)
 * - Strict Domain Isolation (Krishi, Sehat, Pashu, Beauty, Netsurf, Business, Founder, Nuskhe)
 * - Human-Touch Crisp 2-3 Line Answers (Zero Robot Cliche)
 * - E-Book Smart Funnel & Negotiation Connect (Direct Avneesh Sir WhatsApp)
 * - Clean Viral WhatsApp Sharing (No Duplicate Links)
 * - Admin Knowledge Hub & Live Analytics Logging
 * ====================================================================
 */

'use strict';

(function () {
  const MASTER_ADMIN_PHONE = '7974422572';
  const SAKHI_AVATAR_IMG = '/images/sakhi/aarogyam-sakhi.webp';
  const SAKHI_BANNER_IMG = '/images/sakhi/aarogyam-sakhi-banner.webp';

  let knowledgeData = null;
  let isSoundEnabled = true;
  let recognitionInstance = null;
  let isRecording = false;
  let activeSpeechBtn = null;
  let currentActiveDomain = 'omni';
  const sessionChatHistory = [];
  let consecutiveAmbiguousCount = 0;

  // 1. DOMAIN CLASSIFIER & STRICT FIREWALL
  function classifyQueryDomain(cleanQuery) {
    const q = cleanQuery.toLowerCase();

    // A. Founder & Vision
    if (q.includes('अवनीश') || q.includes('avneesh') || q.includes('फाउंडर') || q.includes('founder') || q.includes('मालिक') || q.includes('आरोग्यम इंडिया कौन') || q.includes('कंपनी किसकी')) {
      return 'founder';
    }

    // B. Netsurf Direct Selling & Products
    if (q.includes('नेट्सर्फ') || q.includes('netsurf') || q.includes('बायोफिट') || q.includes('biofit') || q.includes('नेचुरामोर') || q.includes('naturamore') || q.includes('क्लब नेट्सर्फ') || q.includes('सप्ताह') || q.includes('साप्ताहिक कैपिंग') || q.includes('8.19') || q.includes('8,19,250') || q.includes('बाइनरी')) {
      return 'netsurf';
    }

    // C. Business, Digital Earning & Smart eTailer
    if (q.includes('कमाई') || q.includes('पैसे कैसे कमाए') || q.includes('earning') || q.includes('income') || q.includes('बिज़नेस') || q.includes('business') || q.includes('एफिलिएट') || q.includes('affiliate') || q.includes('ई-टेलर') || q.includes('etailer') || q.includes('शेयर करके पैसे') || q.includes('जॉइनिंग') || q.includes('रजिस्ट्रेशन')) {
      return 'business';
    }

    // D. E-Books & Library Support
    if (q.includes('ई-बुक') || q.includes('ebook') || q.includes('किताब') || q.includes('pdf') || q.includes('डाउनलोड') || q.includes('लाइब्रेरी') || q.includes('खरीफ गाइड') || q.includes('खेती डॉक्टर')) {
      return 'business';
    }

    // E. Dadi-Nani Ke Gharelu Nuskhe (Explicit Nuskhe)
    if (q.includes('दादी के नुस्खे') || q.includes('घरेलू नुस्खा') || q.includes('nuskhe') || q.includes('nuskha') || q.includes('काढ़ा') || q.includes('kadha') || q.includes('हल्दी दूध') || q.includes('घरेलू उपाय')) {
      return 'nuskhe';
    }

    // F. Krishi / Agriculture (Strict Crop & Pest Tokens)
    const agriTokens = ['गेहूं', 'सरसों', 'चना', 'धान', 'मक्का', 'सोयाबीन', 'आलू', 'टमाटर', 'मिर्च', 'प्याज', 'लहसुन', 'सब्जी', 'कल्ले', 'फूट', 'यूरिया', 'डीएपी', 'एनपीके', 'उर्वरक', 'खाद', 'कीटनाशक', 'स्प्रे', 'माहू', 'चेपा', 'रतुआ', 'उकठा', 'खरपतवार', 'खरपतवारनाशक', 'इमामेक्टिन', 'कोराजन', 'स्टिमरिच', 'stimrich', 'bio-99', 'bio99', 'shet', 'wrapup', 'फसल', 'खेत', 'कृषि', 'बीज', 'सिंचाई'];
    for (const t of agriTokens) {
      if (q.includes(t)) return 'agri';
    }

    // G. Veterinary & Dairy (Pashu Palan)
    const pashuTokens = ['गाय', 'भैंस', 'बछड़ा', 'दुग्ध', 'दूध', 'फैट', 'fat', 'snf', 'एसएनएफ', 'थनैला', 'mastitis', 'पशु', 'डेयरी', 'dairy', 'मुर्गी', 'poultry', 'बकरा', 'बकरी', 'मछली', 'fish', 'सीएफएल', 'cfl', 'cfc', 'पशु आहार', 'चारा'];
    for (const t of pashuTokens) {
      if (q.includes(t)) return 'pashu';
    }

    // H. Beauty, Dermatology & Trichology
    const beautyTokens = ['चेहरा', 'त्वचा', 'स्किन', 'skin', 'झाइयां', 'झुर्रियां', 'काले घेरे', 'मुहासे', 'पिंपल', 'pimple', 'ग्लो', 'glow', 'बाल', 'hair', 'रूसी', 'dandruff', 'गंजापन', 'विटामिन ई', 'एलोवेरा', 'फेशियल', 'सौंदर्य'];
    for (const t of beautyTokens) {
      if (q.includes(t)) return 'beauty';
    }

    // I. Human Health & Medicine
    const healthTokens = ['मधुमेह', 'sugar', 'शुगर', 'diabetes', 'बीपी', 'bp', 'ब्लड प्रेशर', 'जोड़', 'जोड़ों', 'घुटना', 'दर्द', 'यूरिक एसिड', 'गठिया', 'लिवर', 'liver', 'किडनी', 'kidney', 'हार्ट', 'heart', 'सीने', 'थायरॉइड', 'thyroid', 'मोटापा', 'वजन', 'नींद', 'अनिद्रा', 'तनाव', 'कमजोरी', 'पौरुष', 'ed', 'stamina', 'गैस', 'कब्ज', 'अपच', 'एसिडिटी', 'पेट', 'सीने में दर्द'];
    for (const t of healthTokens) {
      if (q.includes(t)) return 'health';
    }

    const pageDomain = detectCurrentPageDomain();
    if (pageDomain && pageDomain !== 'omni') return pageDomain;

    return 'omni';
  }

  // 2. PAGE DOMAIN DETECTION
  function detectCurrentPageDomain() {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('hair') || path.includes('skin') || path.includes('beauty')) return 'beauty';
    if (path.includes('pashu') || path.includes('dairy') || path.includes('cattle') || path.includes('poultry')) return 'pashu';
    if (path.includes('health/') || path.includes('diabetes') || path.includes('joint') || path.includes('thyroid') || path.includes('weight') || path.includes('heart') || path.includes('liver') || path.includes('women') || path.includes('kids') || path.includes('dental') || path.includes('sexual')) return 'health';
    if (path.includes('agriculture') || path.includes('kharif') || path.includes('kheti') || path.includes('fasal') || path.includes('ebooks/')) return 'agri';
    return 'omni';
  }

  let pendingUserQuery = null;

  // 3. UNIFIED USER PROFILE HELPERS & AUTH STATE
  function getUserPhone() {
    let p = (
      localStorage.getItem('aarogyam_user_phone') ||
      localStorage.getItem('aim_user_mobile') ||
      localStorage.getItem('user_phone') ||
      localStorage.getItem('user_mobile') ||
      localStorage.getItem('SAKHI_USER_PHONE') ||
      ''
    ).trim();
    if (!p) {
      try {
        const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
        if (u && (u.mobile || u.phone)) p = u.mobile || u.phone;
      } catch (e) {}
    }
    if (!p) {
      try {
        const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
        if (sess && (sess.mobile || sess.phone)) p = sess.mobile || sess.phone;
      } catch (e) {}
    }
    const cleanDigits = String(p || '').replace(/\D/g, '').slice(-10);
    return cleanDigits.length === 10 ? cleanDigits : '';
  }

  function getUserName() {
    let name = (
      localStorage.getItem('aarogyam_user_name') ||
      localStorage.getItem('aim_user_name') ||
      localStorage.getItem('user_name') ||
      localStorage.getItem('SAKHI_USER_NAME') ||
      ''
    ).trim();
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase() === 'aarogyam master' || name.toLowerCase().includes('guest')) {
      try {
        const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
        if (u && (u.name || u.full_name) && String(u.name || u.full_name).trim()) name = String(u.name || u.full_name).trim();
      } catch (e) {}
    }
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase() === 'aarogyam master' || name.toLowerCase().includes('guest')) {
      try {
        const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
        if (sess && sess.name && sess.name.trim()) name = sess.name.trim();
      } catch (e) {}
    }
    if (name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase() === 'aarogyam master' || name.toLowerCase().includes('guest')) {
      name = '';
    }
    return name;
  }

  function isUserAuthenticated() {
    const phone = getUserPhone();
    const name = getUserName();
    return Boolean(phone && phone.length === 10 && name && name.length >= 2);
  }

  function getDynamicUserGreetingName() {
    if (!isUserAuthenticated()) return '';
    return getUserName();
  }

  // Unified Synchronization across Sakhi AI, Universal Nav Drawer, and Website
  function syncUnifiedUserAuth(name, phone) {
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const cleanName = String(name || '').trim();

    if (!cleanPhone || cleanPhone.length !== 10 || !cleanName) return;

    try {
      localStorage.setItem('aarogyam_user_name', cleanName);
      localStorage.setItem('aim_user_name', cleanName);
      localStorage.setItem('SAKHI_USER_NAME', cleanName);
      localStorage.setItem('aarogyam_user_phone', cleanPhone);
      localStorage.setItem('aim_user_mobile', cleanPhone);
      localStorage.setItem('SAKHI_USER_PHONE', cleanPhone);

      const aiUser = {
        name: cleanName,
        full_name: cleanName,
        mobile: cleanPhone,
        phone: cleanPhone,
        loggedIn: true,
        share_id: 'AI' + cleanPhone.slice(-6)
      };
      localStorage.setItem('AI_USER', JSON.stringify(aiUser));
      localStorage.setItem('AI_SESSION', JSON.stringify(aiUser));
      localStorage.setItem('UCAS_USER', JSON.stringify(aiUser));

      const leads = JSON.parse(localStorage.getItem('sakhi_registered_leads') || '[]');
      const idx = leads.findIndex(l => l.phone && l.phone.slice(-10) === cleanPhone);
      if (idx >= 0) {
        leads[idx].name = cleanName;
        leads[idx].last_login = new Date().toISOString();
      } else {
        leads.unshift({ name: cleanName, phone: cleanPhone, timestamp: new Date().toISOString() });
      }
      localStorage.setItem('sakhi_registered_leads', JSON.stringify(leads.slice(0, 150)));

      // Immediately refresh universal nav drawer header
      if (typeof window.updateUniversalDrawerProfile === 'function') {
        window.updateUniversalDrawerProfile();
      }
      window.dispatchEvent(new CustomEvent('ai:user-logged-in', { detail: { name: cleanName, phone: cleanPhone } }));
    } catch (e) {
      console.warn('Sync auth error:', e);
    }
  }

  function syncUnifiedUserLogout() {
    localStorage.removeItem('aarogyam_user_name');
    localStorage.removeItem('aim_user_name');
    localStorage.removeItem('SAKHI_USER_NAME');
    localStorage.removeItem('aarogyam_user_phone');
    localStorage.removeItem('aim_user_mobile');
    localStorage.removeItem('SAKHI_USER_PHONE');
    localStorage.removeItem('AI_USER');
    localStorage.removeItem('AI_PROFILE');
    localStorage.removeItem('UCAS_USER');
    try {
      const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
      delete sess.name;
      delete sess.mobile;
      delete sess.phone;
      delete sess.loggedIn;
      localStorage.setItem('AI_SESSION', JSON.stringify(sess));
    } catch (e) {}

    if (typeof window.updateUniversalDrawerProfile === 'function') {
      window.updateUniversalDrawerProfile();
    }
    window.dispatchEvent(new CustomEvent('ai:user-logged-out'));
  }

  // Simple, Non-Complicated Login / Register Popup Modal
  function ensureAuthModalExists() {
    let modal = document.getElementById('sakhiAuthModalBackdrop');
    if (!modal && document.body) {
      modal = document.createElement('div');
      modal.id = 'sakhiAuthModalBackdrop';
      modal.className = 'sakhi-auth-modal-backdrop';
      modal.innerHTML = `
        <div class="sakhi-auth-modal-card">
          <button type="button" class="sakhi-auth-modal-close" onclick="window.closeSakhiAuthModal()" title="बंद करें">&times;</button>
          
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
            <div style="width:46px;height:46px;border-radius:50%;background:#dcfce7;color:#15803d;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <div>
              <div style="font-weight:900;color:#0f172a;font-size:1.1rem;">लॉगिन / नया खाता बनाएं</div>
              <div style="font-size:0.80rem;color:#16a34a;font-weight:700;">आरोग्यम सखी AI सुरक्षित सेवा</div>
            </div>
          </div>

          <p style="font-size:0.88rem;color:#475569;line-height:1.5;margin-bottom:16px;">
            नमस्ते किसान साथी! 🙏 सवाल का सही व प्रामाणिक उत्तर देखने और अपनी व्यक्तिगत सलाह रिपोर्ट सुरक्षित रखने के लिए अपना 10 अंकों का WhatsApp नंबर दर्ज करें:
          </p>

          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px;">
            <div>
              <label style="font-size:0.82rem;font-weight:800;color:#334155;display:block;margin-bottom:4px;">
                📱 WhatsApp मोबाइल नंबर (10 अंक): <span style="color:#dc2626;">*</span>
              </label>
              <input type="tel" id="sakhiModalPhone" maxlength="10" placeholder="उदा. 9876543210" oninput="window.checkExistingSakhiModalPhone(this.value)" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #cbd5e1;border-radius:12px;font-size:0.95rem;font-weight:700;color:#0f172a;outline:none;background:#f8fafc;" />
              <div id="sakhiModalPhoneNotice" style="font-size:0.78rem;margin-top:4px;display:none;font-weight:700;"></div>
            </div>

            <div>
              <label style="font-size:0.82rem;font-weight:800;color:#334155;display:block;margin-bottom:4px;">
                👤 आपका शुभ नाम: <span style="color:#dc2626;">*</span>
              </label>
              <input type="text" id="sakhiModalName" placeholder="अपना पूरा नाम दर्ज करें" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #cbd5e1;border-radius:12px;font-size:0.95rem;font-weight:600;color:#0f172a;outline:none;background:#f8fafc;" />
            </div>
          </div>

          <button type="button" onclick="window.submitSakhiAuthModal()" style="width:100%;background:#16a34a;color:#ffffff;border:none;border-radius:12px;padding:13px;font-size:1rem;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 6px 18px rgba(22,163,74,0.35);transition:all 0.2s;">
            <span>प्रवेश करें / आगे बढ़ें</span> <i class="fa-solid fa-arrow-right"></i>
          </button>

          <div style="font-size:0.75rem;color:#94a3b8;text-align:center;margin-top:12px;">
            🔒 100% सुरक्षित • आपका डेटा पूर्णतः गोपनीय रखा जाता है।
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.onclick = function(e) {
        if (e.target === modal) window.closeSakhiAuthModal();
      };
    }
    return modal;
  }

  window.openSakhiAuthModal = function() {
    const modal = ensureAuthModalExists();
    if (modal) {
      modal.classList.add('active');
      const phoneInput = document.getElementById('sakhiModalPhone');
      if (phoneInput) {
        setTimeout(() => phoneInput.focus(), 300);
      }
    }
  };

  window.closeSakhiAuthModal = function() {
    const modal = document.getElementById('sakhiAuthModalBackdrop');
    if (modal) modal.classList.remove('active');
  };

  let sakhiPhoneTimer = null;
  window.checkExistingSakhiModalPhone = function(val) {
    const clean = String(val || '').replace(/\D/g, '').slice(-10);
    const notice = document.getElementById('sakhiModalPhoneNotice');
    const nameInput = document.getElementById('sakhiModalName');
    if (!notice) return;

    clearTimeout(sakhiPhoneTimer);

    if (clean.length === 10) {
      let foundName = '';
      try {
        const leads = JSON.parse(localStorage.getItem('sakhi_registered_leads') || '[]');
        const lead = leads.find(l => l.phone && l.phone.slice(-10) === clean);
        if (lead && lead.name) foundName = lead.name;
      } catch (e) {}

      if (!foundName) {
        try {
          const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
          if (sess && (sess.mobile || sess.phone) && String(sess.mobile || sess.phone).slice(-10) === clean && (sess.name || sess.full_name)) {
            foundName = sess.name || sess.full_name;
          }
        } catch (e) {}
      }

      if (!foundName) {
        try {
          const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
          if (u && (u.mobile || u.phone) && String(u.mobile || u.phone).slice(-10) === clean && (u.name || u.full_name)) {
            foundName = u.name || u.full_name;
          }
        } catch (e) {}
      }

      const applyFound = (name) => {
        notice.style.display = 'block';
        notice.style.color = '#15803d';
        notice.innerHTML = `✅ पूर्व पंजीकृत खाता: <strong>${escapeHtml(name)}</strong> (आगे बढ़ें दबाएं)`;
        if (nameInput) {
          nameInput.value = name;
          nameInput.readOnly = true;
          nameInput.style.backgroundColor = '#f1f5f9';
        }
      };

      if (foundName) {
        applyFound(foundName);
      } else {
        notice.style.display = 'block';
        notice.style.color = '#d97706';
        notice.innerHTML = `⏳ खाता जाँचा जा रहा है...`;
      }

      // Supabase Live Database Verification
      sakhiPhoneTimer = setTimeout(async () => {
        try {
          let dbUser = null;
          if (typeof isMobileRegistered === 'function') {
            dbUser = await isMobileRegistered(clean);
          } else if (window.dbClient || window.supabase) {
            const client = window.dbClient || window.supabase;
            const { data } = await client.from('profiles').select('id, full_name, mobile, share_id').eq('mobile', clean).limit(1).maybeSingle();
            dbUser = data;
          }

          if (dbUser && dbUser.full_name && dbUser.full_name.trim()) {
            applyFound(dbUser.full_name.trim());
          } else if (!foundName) {
            notice.style.display = 'block';
            notice.style.color = '#0284c7';
            notice.innerHTML = `✨ नया खाता: कृपया नीचे अपना शुभ नाम लिखें।`;
            if (nameInput) {
              nameInput.readOnly = false;
              nameInput.style.backgroundColor = '#f8fafc';
              if (!nameInput.value) nameInput.focus();
            }
          }
        } catch (e) {
          console.warn('DB check note:', e);
        }
      }, 250);
    } else {
      notice.style.display = 'none';
      if (nameInput) {
        nameInput.readOnly = false;
        nameInput.style.backgroundColor = '#f8fafc';
      }
    }
  };

  window.submitSakhiAuthModal = async function() {
    const phoneEl = document.getElementById('sakhiModalPhone');
    const nameEl = document.getElementById('sakhiModalName');
    const rawPhone = phoneEl ? phoneEl.value.replace(/\D/g, '').slice(-10) : '';
    const rawName = nameEl ? nameEl.value.trim() : '';

    if (!rawPhone || !/^[6-9]\d{9}$/.test(rawPhone)) {
      alert('कृपया 10 अंकों का सही भारतीय WhatsApp मोबाइल नंबर दर्ज करें।');
      if (phoneEl) phoneEl.focus();
      return;
    }

    if (!rawName || rawName.length < 2 || rawName.toLowerCase() === 'kisan mitra' || rawName.toLowerCase() === 'null') {
      alert('कृपया अपना शुभ नाम दर्ज करें। बिना नाम के रजिस्ट्रेशन पूरा नहीं हो सकता।');
      if (nameEl) nameEl.focus();
      return;
    }

    const submitBtn = document.querySelector('#sakhiAuthModalBackdrop button[onclick*="submitSakhiAuthModal"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>सत्यापित हो रहा है...</span> ⏳';
    }

    let officialName = rawName;

    try {
      // 1. Check if user already exists in Supabase
      let existingProfile = null;
      if (typeof isMobileRegistered === 'function') {
        existingProfile = await isMobileRegistered(rawPhone);
      } else if (window.dbClient || window.supabase) {
        const client = window.dbClient || window.supabase;
        const { data } = await client.from('profiles').select('*').eq('mobile', rawPhone).limit(1).maybeSingle();
        existingProfile = data;
      }

      if (existingProfile) {
        // PRESERVE DATABASE PROFILE NAME: Never overwrite with typo
        if (existingProfile.full_name && existingProfile.full_name.trim()) {
          officialName = existingProfile.full_name.trim();
        }
        if (typeof createLoginSession === 'function') {
          createLoginSession(existingProfile);
        }
      } else if (typeof registerUser === 'function') {
        // Register new user in Supabase
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref') || urlParams.get('share_id') || 'AI000004';
        const res = await registerUser({
          fullName: rawName,
          mobile: rawPhone,
          source: 'aarogyam-sakhi',
          referralCode: refCode,
          landing_page: window.location.pathname
        });
        if (res && res.profile && res.profile.full_name) {
          officialName = res.profile.full_name;
        }
      }
    } catch (e) {
      console.warn('Auth submit sync note:', e);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>प्रवेश करें / आगे बढ़ें</span> <i class="fa-solid fa-arrow-right"></i>';
      }
    }

    syncUnifiedUserAuth(officialName, rawPhone);
    window.closeSakhiAuthModal();
    updateSakhiHeaderUserBadge();

    const welcomeMsg = `नमस्ते ${officialName} जी! 🙏 आपका खाता सफलतापूर्वक सत्यापित हो गया है।`;
    speakResponse(`स्वागत है ${officialName} जी!`);

    const wrap = document.getElementById('sakhiMessagesWrap');
    if (wrap) {
      const row = document.createElement('div');
      row.className = 'sakhi-msg-row bot';
      row.innerHTML = `
        <div class="sakhi-msg-bubble" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:18px;padding:14px;box-shadow:0 4px 12px rgba(22,163,74,0.15);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <span style="font-size:1.4rem;">🎉</span>
            <div style="font-weight:900;color:#15803d;font-size:1rem;">स्वागत है ${escapeHtml(officialName)} जी!</div>
          </div>
          <div style="font-size:0.88rem;color:#334155;line-height:1.5;">
            आपका WhatsApp नंबर <strong>${escapeHtml(rawPhone)}</strong> सत्यापित हो गया है। ${pendingUserQuery ? 'अब आपके सवाल का उत्तर प्रस्तुत किया जा रहा है...' : 'अब आप नीचे अपना सवाल पूछ सकते हैं।'}
          </div>
        </div>
      `;
      wrap.appendChild(row);
      wrap.scrollTop = wrap.scrollHeight;
    }

    if (pendingUserQuery) {
      const q = pendingUserQuery;
      pendingUserQuery = null;
      setTimeout(() => {
        appendTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          processKnowledgeQuery(q);
        }, 800);
      }, 500);
    }
  };

  window.logoutSakhiUser = function() {
    if (!confirm('क्या आप सचमुच लॉग आउट करना चाहते हैं?')) return;
    syncUnifiedUserLogout();
    updateSakhiHeaderUserBadge();
    alert('आप सफलतापूर्वक लॉग आउट हो गए हैं। नया सवाल पूछने पर लॉगिन आवश्यक होगा।');
    renderInitialGreeting();
  };

  function updateSakhiHeaderUserBadge() {
    const badgeWrap = document.getElementById('sakhiHeaderUserBadgeWrap');
    if (!badgeWrap) return;

    if (isUserAuthenticated()) {
      const name = getUserName();
      badgeWrap.innerHTML = `
        <span class="sakhi-user-badge logged-in" onclick="window.logoutSakhiUser()" title="लॉग आउट करने के लिए क्लिक करें">
          👤 ${escapeHtml(name)} <i class="fa-solid fa-right-from-bracket" style="font-size:0.68rem;margin-left:2px;"></i>
        </span>
      `;
    } else {
      badgeWrap.innerHTML = `
        <span class="sakhi-user-badge guest" onclick="window.openSakhiAuthModal()" title="लॉगिन या नया खाता बनाने के लिए क्लिक करें">
          <i class="fa-solid fa-lock"></i> <span>लॉगिन</span>
        </span>
      `;
    }
  }

  // Live Chat History & WhatsApp Handoff Generator for Avneesh Mishra ji (7974422572)
  function buildAvneeshWhatsAppHandoffUrl(currentQuery) {
    const rawName = getDynamicUserGreetingName();
    const userName = rawName ? rawName : 'किसान साथी (Guest)';
    const userPhone = getUserPhone() || 'उपलब्ध नहीं';

    let historyLines = sessionChatHistory.slice(-6).map(item => {
      const tag = item.role === 'user' ? `👤 ${userName}` : `👩‍🌾 सखी AI`;
      const clean = (item.text || '').replace(/\n+/g, ' ').slice(0, 90);
      return `${tag}: ${clean}`;
    }).join('\n');

    if (!historyLines) {
      historyLines = `👤 ${userName}: ${currentQuery || 'आरोग्यम सखी AI पर परामर्श'}`;
    }

    const msg = `प्रणाम अवनीश जी! 🙏\nमैं आरोग्यम सखी AI से आपसे सीधी बात करने के लिए आया हूँ।\n\n` +
      `👤 नाम: ${userName}\n` +
      `📱 मोबाइल: ${userPhone}\n` +
      `❓ वर्तमान सवाल: "${currentQuery || 'मार्गदर्शन चाहिए'}"\n\n` +
      `📝 सखी AI के साथ हालिया बातचीत:\n${historyLines}\n\n` +
      `कृपया मुझे इस विषय पर सही समाधान व मार्गदर्शन प्रदान करें।`;

    return `https://api.whatsapp.com/send?phone=91${MASTER_ADMIN_PHONE}&text=${encodeURIComponent(msg)}`;
  }

  // Unanswered Questions Logger for Admin Review
  function logUnansweredQuery(query, domain) {
    try {
      const list = JSON.parse(localStorage.getItem('sakhi_unanswered_queries') || '[]');
      const existing = list.find(item => item.query && item.query.toLowerCase() === query.toLowerCase());
      if (existing) {
        existing.count = (existing.count || 1) + 1;
        existing.last_seen = new Date().toISOString();
      } else {
        list.unshift({
          id: 'uq_' + Date.now(),
          query: query,
          domain: domain || 'omni',
          user: getDynamicUserGreetingName() || 'Guest',
          phone: getUserPhone() || '',
          count: 1,
          timestamp: new Date().toISOString()
        });
      }
      localStorage.setItem('sakhi_unanswered_queries', JSON.stringify(list.slice(0, 200)));
    } catch (e) {}
  }

  // Guest Lead Capture Card HTML (Inline fallback)
  function buildGuestLeadCardHtml() {
    if (isUserAuthenticated()) return '';
    return `
      <div class="sakhi-guest-reg-card" id="sakhiGuestRegCard" style="background:linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:12px;">
        <div style="font-weight:800;color:#166534;font-size:0.9rem;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
          <span>🌾</span> <span>नमस्ते किसान साथी!</span>
        </div>
        <div style="font-size:0.83rem;color:#334155;line-height:1.45;margin-bottom:8px;">
          अपनी फसल, पशु व स्वास्थ्य की पूरी रिपोर्ट और विशेष सलाह सीधे WhatsApp पर पाने के लिए अपना नाम व नंबर दर्ज करें:
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          <input type="text" id="sakhiLeadName" placeholder="आपका शुभ नाम" style="flex:1;min-width:110px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.82rem;outline:none;background:#fff;" />
          <input type="tel" id="sakhiLeadPhone" placeholder="WhatsApp नंबर (10 अंक)" maxlength="10" style="flex:1;min-width:120px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.82rem;outline:none;background:#fff;" />
          <button type="button" onclick="window.saveSakhiLeadFromCard()" style="background:#16a34a;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-weight:700;font-size:0.82rem;cursor:pointer;">
            सुरक्षित करें ✔
          </button>
        </div>
      </div>
    `;
  }

  window.saveSakhiLeadFromCard = function () {
    const nameEl = document.getElementById('sakhiLeadName');
    const phoneEl = document.getElementById('sakhiLeadPhone');
    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.replace(/\D/g, '').slice(-10) : '';

    if (!name) {
      alert('कृपया अपना शुभ नाम लिखें।');
      if (nameEl) nameEl.focus();
      return;
    }
    if (phone && phone.length !== 10) {
      alert('कृपया 10 अंकों का सही मोबाइल नंबर लिखें।');
      if (phoneEl) phoneEl.focus();
      return;
    }

    syncUnifiedUserAuth(name, phone);

    const card = document.getElementById('sakhiGuestRegCard');
    if (card) {
      card.innerHTML = `
        <div style="font-weight:800;color:#15803d;font-size:0.9rem;display:flex;align-items:center;gap:6px;">
          <span>✅</span> <span>बहुत-बहुत धन्यवाद ${escapeHtml(name)} जी! आपकी जानकारी सुरक्षित हो गई है।</span>
        </div>
      `;
    }

    updateSakhiHeaderUserBadge();
    const greetingSpeech = `बहुत-बहुत धन्यवाद ${name} जी! आपकी जानकारी सुरक्षित हो गई है। अब आप बेझिझक कोई भी सवाल पूछें।`;
    speakResponse(greetingSpeech);
  };

  function formatShareId(code) {
    if (!code) return 'AGRI2026';
    code = String(code).trim();
    // If it's a 10-digit phone number, convert to safe masked code
    if (/^\d{10}$/.test(code)) {
      return 'SAKHI' + code.slice(-4);
    }
    // If it starts with 91 or +91 and 10 digits
    if (/^(\+91|91)\d{10}$/.test(code)) {
      return 'SAKHI' + code.slice(-4);
    }
    // Clean up spaces/symbols
    const cleaned = code.replace(/[^a-zA-Z0-9_-]/g, '');
    return cleaned || 'AGRI2026';
  }

  function getBestReferralCode() {
    let raw = '';
    try {
      const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
      if (sess && sess.share_id) raw = sess.share_id;
    } catch (e) {}
    if (!raw) {
      try {
        const user = JSON.parse(localStorage.getItem('AI_USER') || '{}');
        if (user && user.share_id) raw = user.share_id;
      } catch (e) {}
    }
    if (!raw) {
      raw = (
        localStorage.getItem('aarogyam_share_id') ||
        localStorage.getItem('user_share_id') ||
        localStorage.getItem('aarogyam_referral_code') ||
        localStorage.getItem('user_referral_code') ||
        'AGRI2026'
      );
    }
    return formatShareId(raw);
  }

  // 4. LOAD KNOWLEDGE BASE WITH RETRY & CACHING
  async function loadKnowledgeBase() {
    try {
      const res = await fetch('/data/krishi-ai-knowledge.json?v=' + Math.floor(Date.now() / 180000));
      if (res.ok) {
        knowledgeData = await res.json();
      }
    } catch (e) {
      console.warn('[Sakhi AI] Knowledge base fetch notice:', e);
    }
  }

  // 5. SAFETY & PROFANITY SHIELD
  const PROFANITY_REGEX = /(गाली|madarchod|bhenchod|chutiya|harami|bhosdi|gaand|porn|nude|xxx|randi|suicide|zeher|poison\s*dose)/i;

  function checkSafetyAndProfanity(query) {
    if (PROFANITY_REGEX.test(query)) {
      return {
        isSafe: false,
        message: 'आरोग्यम सखी एक मर्यादित व वैज्ञानिक मंच है। कृपया स्वास्थ्य, कृषि, पशुपालन, सौंदर्य या बिज़नेस संबंधी शालीन प्रश्न पूछें। 🙏'
      };
    }
    return { isSafe: true };
  }

  function isEmergencyQuery(query) {
    const q = query.toLowerCase();
    return q.includes('सीने में दर्द') || q.includes('chest pain') || q.includes('हार्ट अटैक') || q.includes('heart attack') || q.includes('बेहोश');
  }

  // 6. SPEECH RECOGNITION (STT)
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'hi-IN';
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onstart = function () {
        isRecording = true;
        const micBtn = document.getElementById('sakhiMicBtn');
        if (micBtn) micBtn.classList.add('recording');
        const input = document.getElementById('sakhiTextInput');
        if (input) input.placeholder = '🌾 सुन रही हूँ... बोलिए...';
      };

      recognitionInstance.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('sakhiTextInput');
        if (input) {
          input.value = transcript;
          handleUserSubmit(transcript);
        }
      };

      recognitionInstance.onerror = function () {
        stopRecording();
      };

      recognitionInstance.onend = function () {
        stopRecording();
      };
    } catch (e) {
      console.warn('[Sakhi AI] STT setup error:', e);
    }
  }

  function toggleRecording() {
    if (!recognitionInstance) {
      alert('माइक सुविधा के लिए कृपया Chrome या आधुनिक मोबाइल ब्राउज़र का उपयोग करें।');
      return;
    }
    if (isRecording) {
      recognitionInstance.stop();
      stopRecording();
    } else {
      try {
        recognitionInstance.start();
      } catch (e) {
        stopRecording();
      }
    }
  }

  function stopRecording() {
    isRecording = false;
    const micBtn = document.getElementById('sakhiMicBtn');
    if (micBtn) micBtn.classList.remove('recording');
    const input = document.getElementById('sakhiTextInput');
    if (input) input.placeholder = 'खेत, सेहत, पशु, ब्यूटी या बिज़नेस का सवाल पूछें...';
  }

  // 7. TEXT-TO-SPEECH (TTS)
  function speakResponse(text) {
    if (!isSoundEnabled || !window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#_~`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const avatar = document.getElementById('sakhiAvatarFrame');
    if (avatar) avatar.classList.add('speaking');

    utterance.onend = function () {
      if (avatar) avatar.classList.remove('speaking');
    };
    utterance.onerror = function () {
      if (avatar) avatar.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utterance);
  }

  window.toggleMessageSpeech = function (btn, encodedText) {
    if (!window.speechSynthesis) return;

    const text = decodeURIComponent(encodedText || '').trim();

    if (activeSpeechBtn === btn) {
      window.speechSynthesis.cancel();
      btn.classList.remove('speaking');
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>सुनें</span>';
      activeSpeechBtn = null;
      const avatar = document.getElementById('sakhiAvatarFrame');
      if (avatar) avatar.classList.remove('speaking');
      return;
    }

    if (activeSpeechBtn) {
      activeSpeechBtn.classList.remove('speaking');
      activeSpeechBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>सुनें</span>';
    }

    window.speechSynthesis.cancel();

    btn.classList.add('speaking');
    btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>म्यूट करें</span>';
    activeSpeechBtn = btn;

    const avatar = document.getElementById('sakhiAvatarFrame');
    if (avatar) avatar.classList.add('speaking');

    const cleanText = text.replace(/[*#_~`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = function () {
      btn.classList.remove('speaking');
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>सुनें</span>';
      if (avatar) avatar.classList.remove('speaking');
      activeSpeechBtn = null;
    };
    utterance.onerror = function () {
      btn.classList.remove('speaking');
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>सुनें</span>';
      if (avatar) avatar.classList.remove('speaking');
      activeSpeechBtn = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  function buildMsgAudioBtnMarkup(text) {
    if (!text) return '';
    const safeText = encodeURIComponent(text);
    return `
      <div style="margin-top:8px;">
        <button type="button" class="sakhi-msg-audio-btn" onclick="window.toggleMessageSpeech(this, '${safeText}')" title="आवाज़ में सुनें या म्यूट करें">
          <i class="fa-solid fa-volume-high"></i>
          <span>सुनें</span>
        </button>
      </div>
    `;
  }

  // 8. UI BUILDER & INJECTION (CHATGPT & GEMINI GRADE)
  function checkIsDedicatedPage() {
    return Boolean(
      (window.location.pathname && window.location.pathname.includes('aarogyam-sakhi.html')) ||
      (document.body && document.body.classList && document.body.classList.contains('sakhi-page-body'))
    );
  }

  function ensureModalBackdropExists() {
    let backdrop = document.getElementById('sakhiModalBackdrop');
    if (!backdrop && document.body) {
      backdrop = document.createElement('div');
      backdrop.id = 'sakhiModalBackdrop';
      backdrop.className = 'sakhi-modal-backdrop';
      backdrop.innerHTML = buildChatWindowMarkup(false);
      document.body.appendChild(backdrop);
      setupEventListeners(false);
      renderInitialGreeting();
    }
    return backdrop;
  }

  function injectSakhiUI() {
    if (checkIsDedicatedPage()) {
      const container = document.getElementById('sakhiFullscreenContainer') || document.body;
      container.innerHTML = `
        <div class="sakhi-fullscreen-wrapper">
          ${buildChatWindowMarkup(true)}
        </div>
      `;
      setupEventListeners(true);
      renderInitialGreeting();
      return;
    }

    let pill = document.getElementById('sakhiFloatingPill');
    if (!pill && document.body) {
      const currentDomain = detectCurrentPageDomain();
      let pillLabel = 'आरोग्यम सखी AI';
      if (currentDomain === 'health') pillLabel = 'स्वास्थ्य सखी AI';
      else if (currentDomain === 'pashu') pillLabel = 'पशु सखी AI';
      else if (currentDomain === 'beauty') pillLabel = 'सौंदर्य सखी AI';

      pill = document.createElement('div');
      pill.id = 'sakhiFloatingPill';
      pill.className = 'sakhi-floating-pill';
      pill.innerHTML = `
        <div class="sakhi-pill-avatar-wrap">
          <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" onerror="this.src='/images/logo/fevicon.png'" />
        </div>
        <span class="sakhi-pill-label">${pillLabel}</span>
        <span class="sakhi-pill-live-dot"></span>
      `;
      document.body.appendChild(pill);

      let collapseTimer = setTimeout(() => {
        if (pill) pill.classList.add('collapsed');
      }, 5000);

      pill.addEventListener('mouseenter', () => {
        clearTimeout(collapseTimer);
        pill.classList.remove('collapsed');
      });

      pill.addEventListener('mouseleave', () => {
        collapseTimer = setTimeout(() => {
          if (pill) pill.classList.add('collapsed');
        }, 3000);
      });
    }

    if (pill) {
      pill.onclick = function (e) {
        if (e) e.preventDefault();
        openSakhiModal();
      };
    }

    ensureModalBackdropExists();
  }

  function buildChatWindowMarkup(isFullscreen) {
    return `
      <div class="sakhi-chat-window" id="sakhiChatWindow" style="position:relative;">
        <!-- Header -->
        <div class="sakhi-header">
          <div class="sakhi-header-left">
            ${isFullscreen ? `
              <a href="javascript:void(0)" onclick="window.history.length > 1 ? window.history.back() : window.location.href='/index.html'" class="sakhi-back-btn" title="वापस जाएं">
                <i class="fa-solid fa-arrow-left"></i>
              </a>
            ` : ''}
            <div class="sakhi-avatar-frame" id="sakhiAvatarFrame">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" onerror="this.src='/images/logo/fevicon.png'" />
            </div>
            <div class="sakhi-header-info">
              <h3>आरोग्यम सखी AI <span class="sakhi-live-badge" style="font-size:0.7rem;background:#22c55e;color:#fff;padding:2px 8px;border-radius:10px;">ऑनलाइन 24×7</span></h3>
            </div>
          </div>
          <div class="sakhi-header-actions" style="display:flex;align-items:center;gap:6px;">
            <div id="sakhiHeaderUserBadgeWrap" style="display:inline-flex;align-items:center;"></div>
            <button type="button" class="sakhi-fullscreen-btn" id="sakhiFullscreenToggleBtn" onclick="window.toggleSakhiFullscreen()" title="फुल स्क्रीन टॉगल">
              <i class="fa-solid fa-expand"></i>
            </button>
            <button type="button" class="sakhi-share-btn" onclick="window.shareAarogyamSakhi()" title="सखी AI को शेयर करें">
              <i class="fa-solid fa-share-nodes"></i>
              <span>शेयर</span>
            </button>
            <button type="button" class="sakhi-sound-toggle-btn" id="sakhiSoundToggleBtn" title="आवाज़ चालू/बंद करें">
              <i class="fa-solid fa-volume-high"></i>
            </button>
            ${!isFullscreen ? `
              <button type="button" class="sakhi-close-btn" id="sakhiCloseBtn" title="बंद करें">✕</button>
            ` : ''}
          </div>
        </div>

        <!-- Messages Area -->
        <div class="sakhi-messages-wrap" id="sakhiMessagesWrap">
          <!-- Rendered dynamically -->
        </div>

        <!-- ChatGPT-Style Plus Menu (Opened by [+] Button) -->
        <div class="sakhi-plus-menu" id="sakhiPlusMenu" style="display:none;">
          <div class="sakhi-plus-menu-header">
            <span>विषय चुनें</span>
            <button type="button" class="sakhi-plus-menu-close" onclick="window.toggleSakhiPlusMenu(false)">✕</button>
          </div>
          <div class="sakhi-plus-grid">
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('गेहूं व फसलों में कल्ले और पैदावार बढ़ाने का फॉर्मूला')">
              खेती व फसलें
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
              पशुपालन व डेयरी
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('डायबिटीज और शुगर कंट्रोल का फॉर्मूला')">
              स्वास्थ्य व रोग
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('चेहरे की झाइयां और झुर्रियां मिटाने का नुस्खा')">
              सौंदर्य व त्वचा
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('नेट्सर्फ बिज़नेस प्लान और ₹8.19L साप्ताहिक कैपिंग')">
              नेट्सर्फ प्रोडक्ट्स
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('दादी के असली आयुर्वेदिक घरेलू नुस्खे')">
              दादी के नुस्खे
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('आरोग्यम डिजिटल ई-टेलर व एफिलिएट कमाई')">
              कमाई व करियर
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('फाउंडर अवनीश जी का विज़न व सीधा WhatsApp संपर्क')">
              अवनीश जी से संपर्क
            </button>
          </div>
        </div>

        <!-- Legal Note -->
        <div class="sakhi-legal-note">
          ⚖️ सूचनात्मक मार्गदर्शन: उपयोग से पूर्व उत्पाद लेबल निर्देश व स्थानीय विशेषज्ञ की अनुशंसा का संज्ञान अवश्य लें।
        </div>

        <!-- Input Footer (ChatGPT Layout: [+] [Mic] [Input] [Send]) -->
        <div class="sakhi-input-footer">
          <button type="button" class="sakhi-plus-btn" id="sakhiPlusBtn" title="विषय व टूल्स चुनें" onclick="window.toggleSakhiPlusMenu()">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button type="button" class="sakhi-mic-btn" id="sakhiMicBtn" title="बोलकर पूछें (माइक)" onclick="if(window.AarogyamSakhiToggleRec)window.AarogyamSakhiToggleRec();">
            <i class="fa-solid fa-microphone"></i>
          </button>
          <input type="text" class="sakhi-text-input" id="sakhiTextInput" placeholder="सवाल बोलें या लिखें..." autocomplete="off" onkeydown="if(event.key==='Enter'){event.preventDefault();window.submitSakhiFromInput();}" />
          <button type="button" class="sakhi-send-btn" id="sakhiSendBtn" title="भेजें" onclick="window.submitSakhiFromInput();">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
  }

  window.switchSakhiDomain = function (domain, btn) {
    currentActiveDomain = domain;
    document.querySelectorAll('.sakhi-tab-pill').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderInitialGreeting();
  };

  window.submitSakhiFromInput = function () {
    const input = document.getElementById('sakhiTextInput');
    if (input && input.value.trim()) {
      const q = input.value.trim();
      input.value = '';
      handleUserSubmit(q);
    }
  };

  window.AarogyamSakhiToggleRec = function () {
    toggleRecording();
  };

  function setupEventListeners(isFullscreen) {
    const backdrop = document.getElementById('sakhiModalBackdrop');
    const closeBtn = document.getElementById('sakhiCloseBtn');
    if (closeBtn) closeBtn.onclick = closeSakhiModal;
    if (backdrop) {
      backdrop.onclick = function (e) {
        if (e.target === backdrop) closeSakhiModal();
      };
    }

    const soundBtn = document.getElementById('sakhiSoundToggleBtn');
    if (soundBtn) soundBtn.onclick = toggleSound;

    const micBtn = document.getElementById('sakhiMicBtn');
    if (micBtn) micBtn.onclick = toggleRecording;

    const sendBtn = document.getElementById('sakhiSendBtn');
    if (sendBtn) {
      sendBtn.onclick = function () {
        window.submitSakhiFromInput();
      };
    }

    const textInput = document.getElementById('sakhiTextInput');
    if (textInput) {
      textInput.onkeydown = function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.submitSakhiFromInput();
        }
      };
    }
    updateSakhiHeaderUserBadge();
  }

  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    const btn = document.getElementById('sakhiSoundToggleBtn');
    if (btn) {
      btn.innerHTML = isSoundEnabled
        ? '<i class="fa-solid fa-volume-high"></i>'
        : '<i class="fa-solid fa-volume-xmark" style="color:#fca5a5;"></i>';
    }
    if (!isSoundEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function openSakhiModal() {
    if (typeof window.stopPageAudioGreeting === 'function') {
      try { window.stopPageAudioGreeting(); } catch (e) {}
    }
    const backdrop = ensureModalBackdropExists();
    if (backdrop) {
      backdrop.classList.add('active');
      updateSakhiHeaderUserBadge();
      setTimeout(() => {
        const input = document.getElementById('sakhiTextInput');
        if (input && window.innerWidth > 640) input.focus();
      }, 300);
    }
  }

  function closeSakhiModal() {
    const backdrop = document.getElementById('sakhiModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopRecording();
  }

  // MASTER 13+ BOOKS CATALOG FOR LANDING PAGES & DIRECT CONVERSIONS
  const MASTER_BOOKS_CATALOG = [
    {
      id: 'BK002',
      title: 'खेती का डॉक्टर (Pocket Doctor)',
      category: 'Agriculture',
      mrp: 299,
      offer: 99,
      slug: 'fasal-ka-doctor',
      desc: 'फसल के सभी रोग, कीट और सटीक रासायनिक व जैविक स्प्रे कैलेंडर। 300+ रंगीन वास्तविक फोटो सहित सम्पूर्ण समाधान।',
      audioDemo: 'नमस्ते किसान साथी! इस पुस्तक में आपको 300 से अधिक रंगीन वास्तविक फोटो के साथ हर फसल के रोग, कीट और सटीक स्प्रे कैलेंडर मिलेंगे। अभी यह स्पेशल ऑफर में मात्र ₹99 में उपलब्ध है और पेमेंट करते ही तुरंत पीडीएफ आपके फोन में डाउनलोड हो जाएगी।',
      tags: ['डॉक्टर', 'doctor', 'रोग', 'कीट', 'फसल', 'स्प्रे', 'pocket', 'खेती डॉक्टर']
    },
    {
      id: 'BK016',
      title: 'कृषि दवा डायरेक्टरी — रोग, कीट और दवा गाइड',
      category: 'Agriculture',
      mrp: 499,
      offer: 149,
      slug: 'bk016',
      desc: 'भारत में उपलब्ध सभी कृषि कीटनाशक, फफूंदनाशक, टॉनिक व खरपतवारनाशक दवाओं की विस्तृत वैज्ञानिक डायरेक्टरी।',
      audioDemo: 'कृषि दवा डायरेक्टरी में भारत की सभी फसलों की प्रमाणित दवाओं के टेक्निकल नाम, डोज, और स्प्रे समय की पूरी जानकारी दी गई है। यह मात्र ₹149 के ऑफर में तुरंत डाउनलोड के लिए उपलब्ध है।',
      tags: ['दवा', 'कीटनाशक', 'डायरेक्टरी', 'खाद', 'medicine', 'फफूंदनाशक', 'दवाएं']
    },
    {
      id: 'BK017',
      title: 'गेहूँ की खेती — सम्पूर्ण मार्गदर्शिका',
      category: 'Agriculture',
      mrp: 299,
      offer: 99,
      slug: 'bk017',
      desc: 'गेहूं में कल्ले 2 गुना करने, पीला रतुआ रोकने और प्रति एकड़ 28 से 32 क्विंटल बंपर पैदावार का फॉर्मूला।',
      audioDemo: 'गेहूं की खेती गाइड में पहली सिंचाई से लेकर बालियां निकलने तक खाद, पानी व कल्ले बढ़ाने का पूरा वैज्ञानिक कैलेंडर दिया गया है। अभी मात्र ₹99 में पाएं।',
      tags: ['गेहूं', 'गेहूँ', 'wheat', 'गेहूं गाइड']
    },
    {
      id: 'BK015',
      title: '🌱 सब्जी खेती मास्टर (Part 1)',
      category: 'Agriculture',
      mrp: 1999,
      offer: 149,
      slug: 'bk015',
      desc: 'टमाटर, मिर्च, शिमला मिर्च, प्याज, गोभी की व्यावसायिक खेती से लाखों की शुद्ध कमाई का सम्पूर्ण ब्लूप्रिंट।',
      audioDemo: 'सब्जी खेती मास्टर गाइड में बेमौसमी सब्जियों से प्रति एकड़ 3 से 5 लाख तक मुनाफा कमाने के सीक्रेट्स और नर्सरी से मंडी तक का पूरा रोडमैप है। ऑफर प्राइस केवल ₹149 है।',
      tags: ['सब्जी', 'टमाटर', 'मिर्च', 'vegetable', 'गोभी', 'प्याज', 'शिमला मिर्च']
    },
    {
      id: 'BK001',
      title: 'खरीफ फसल मास्टर गाइड 2026',
      category: 'Agriculture',
      mrp: 299,
      offer: 99,
      slug: 'kharif-2026',
      desc: 'धान, सोयाबीन, मक्का की बीज उपचार से लेकर कटाई तक सम्पूर्ण प्रैक्टिकल व वैज्ञानिक गाइड।',
      audioDemo: 'खरीफ फसल मास्टर गाइड में धान, सोयाबीन व मक्का के सभी रोगों की पहचान और सही दवाओं की खुराक का पूरा कैलेंडर दिया गया है। ऑफर मात्र ₹99 है।',
      tags: ['खरीफ', 'धान', 'सोयाबीन', 'मक्का', 'rice']
    },
    {
      id: 'BK018',
      title: 'घर बैठे पैसे कैसे कमाएँ? Income Guide',
      category: 'Business',
      mrp: 1001,
      offer: 149,
      slug: 'bk018',
      desc: 'मोबाइल फोन से बिना पूंजी डिजिटल रेफरल, स्मार्ट ई-टेलर व एफिलिएट से ₹25,000 से ₹50,000 कमाने का फॉर्मूला।',
      audioDemo: 'इनकम गाइड में बिना किसी दुकान या पूंजी के सिर्फ मोबाइल से हर महीने 25 से 50 हजार रुपये कमाने का पूरा स्टेप-बाय-स्टेप तरीका सिखाया गया है। अभी ऑफर मात्र ₹149 है।',
      tags: ['पैसे', 'कमाई', 'income', 'earning', 'बिज़नेस', 'पैसा', 'घर बैठे']
    },
    {
      id: 'SUB001',
      title: '👑 Aarogyam Pro VIP सदस्यता (All 19 Books Access)',
      category: 'VIP',
      mrp: 2999,
      offer: 99,
      slug: 'sub001',
      desc: '1 साल तक सभी 19 ई-बुक्स, लाइव डॉक्टर सपोर्ट, कृषि वेबिनार 100% मुफ़्त एक्सेस।',
      audioDemo: 'आरोग्यम प्रो वीआईपी सदस्यता से आप पूरे 1 साल तक हमारी सभी 19 ई-बुक्स मुफ्त पढ़ सकते हैं और विशेषज्ञों से सीधे सवाल पूछ सकते हैं। सीमित समय ऑफर केवल ₹99 है।',
      tags: ['vip', 'सदस्यता', 'सब्सक्रिप्शन', 'pass', 'ऑल एक्सेस']
    },
    {
      id: 'BK006',
      title: 'AI वेबसाइट निर्माण गाइड 2026',
      category: 'Digital AI',
      mrp: 1299,
      offer: 199,
      slug: 'bk006',
      desc: 'बिना कोडिंग ChatGPT और आधुनिक AI टूल्स से अपनी व्यावसायिक वेबसाइट व ऑनलाइन स्टोर बनाने की गाइड।',
      audioDemo: 'एआई वेबसाइट गाइड में सीखें कैसे बिना कोडिंग केवल 1 घंटे में अपनी वेबसाइट बनाकर ऑनलाइन कमाई शुरू करें। ऑफर केवल ₹199।',
      tags: ['ai वेबसाइट', 'वेबसाइट', 'blog', 'website', 'डिजिटल']
    },
    {
      id: 'BK005',
      title: 'धान मास्टर गाइड — सम्पूर्ण धान खेती',
      category: 'Agriculture',
      mrp: 299,
      offer: 99,
      slug: 'bk005',
      desc: 'धान की उन्नत किस्में, नर्सरी, झुलसा व तनाछेदक नियंत्रण और रिकॉर्ड 35 क्विंटल प्रति एकड़ पैदावार।',
      audioDemo: 'धान मास्टर गाइड में बासमती व हाइब्रिड धान की रिकॉर्ड पैदावार और कीट नियंत्रण का पूरा शेड्यूल है। ऑफर मात्र ₹99।',
      tags: ['धान', 'paddy', 'बासमती', 'चावल']
    },
    {
      id: 'BK004',
      title: 'चावल प्रोसेसिंग व मिनी राइस मिल गाइड',
      category: 'Agriculture',
      mrp: 299,
      offer: 99,
      slug: 'bk004',
      desc: 'धान से चावल मिलिंग, ग्रेडिंग, पॉलिशिंग और मिनी राइस मिल बिज़नेस से गांव में मोटी कमाई का तरीका।',
      audioDemo: 'चावल प्रोसेसिंग गाइड में गांव में मिनी राइस मिल प्लांट लगाकर लाखों कमाने की पूरी जानकारी है। ऑफर मात्र ₹99।',
      tags: ['चावल प्रोसेसिंग', 'राइस मिल', 'processing']
    },
    {
      id: 'BK003',
      title: 'अनाज भंडारण गाइड — सुरक्षित भंडारण तकनीक',
      category: 'Agriculture',
      mrp: 299,
      offer: 99,
      slug: 'bk003',
      desc: 'गेहूं, चना व धान को घुन, सीलन व कीटों से 2 साल तक बिना दवा सुरक्षित रखने की देशी व वैज्ञानिक तकनीक।',
      audioDemo: 'अनाज भंडारण गाइड में सीखें बिना जहरीली दवाओं के गेहूं व दालों को सालों साल नया जैसा कैसे रखें। ऑफर मात्र ₹99।',
      tags: ['अनाज भंडारण', 'storage', 'घुन', 'भंडारण']
    },
    {
      id: 'BK011',
      title: 'पॉलीहाउस व नेटहाउस खेती गाइड',
      category: 'Agriculture',
      mrp: 299,
      offer: 99,
      slug: 'bk011',
      desc: 'सरकारी सब्सिडी, ग्रीनहाउस निर्माण और बेमौसमी खीरा, शिमला मिर्च, टमाटर से लाखों की कमाई।',
      audioDemo: 'पॉलीहाउस गाइड में 50 से 70 प्रतिशत सरकारी सब्सिडी और संरक्षित खेती से मुनाफा कमाने के नियम हैं। ऑफर मात्र ₹99।',
      tags: ['पॉलीहाउस', 'नेटहाउस', 'polyhouse']
    },
    {
      id: 'BK010',
      title: 'व्यावसायिक फूल खेती गाइड',
      category: 'Agriculture',
      mrp: 299,
      offer: 99,
      slug: 'bk010',
      desc: 'गेंदा, गुलाब, जरबेरा व रजनीगंधा की खेती से हर हफ्ते लगातार नकद आमदनी का अचूक फॉर्मूला।',
      audioDemo: 'फूल खेती गाइड में कम जमीन में गेंदा व गुलाब की खेती से त्योहारों पर लाखों कमाने की विधि है। ऑफर मात्र ₹99।',
      tags: ['फूल', 'गेंदा', 'गुलाब', 'flower']
    }
  ];

  function detectActivePageBook() {
    const path = (window.location.pathname || '').toLowerCase();
    const search = window.location.search || '';
    const params = new URLSearchParams(search);
    const paramId = (params.get('id') || params.get('book') || '').toUpperCase();

    if (paramId) {
      const match = MASTER_BOOKS_CATALOG.find(b => b.id.toUpperCase() === paramId || b.slug.toUpperCase() === paramId);
      if (match) return match;
    }

    for (const b of MASTER_BOOKS_CATALOG) {
      if (path.includes(b.slug.toLowerCase())) return b;
      if (path.includes(b.id.toLowerCase())) return b;
    }

    if (path.includes('kharif')) return MASTER_BOOKS_CATALOG.find(b => b.id === 'BK001');
    if (path.includes('fasal-ka-doctor') || path.includes('kheti-dr')) return MASTER_BOOKS_CATALOG.find(b => b.id === 'BK002');

    const shareEl = document.getElementById('book-share-data');
    if (shareEl && shareEl.dataset && shareEl.dataset.id) {
      const domId = shareEl.dataset.id.toUpperCase();
      const match = MASTER_BOOKS_CATALOG.find(b => b.id === domId);
      if (match) return match;
    }

    return null;
  }

  function detectContextPage() {
    let path = (window.location.pathname || '').toLowerCase();
    let search = window.location.search || '';
    let referrer = (document.referrer || '').toLowerCase();
    let sourceParam = new URLSearchParams(search).get('source') || new URLSearchParams(search).get('page') || '';

    // If on dedicated sakhi page, look at referrer, URL params, or sessionStorage
    if (path.includes('aarogyam-sakhi.html')) {
      if (sourceParam) path = sourceParam.toLowerCase();
      else if (referrer && referrer.includes('aarogyamindia')) {
        try {
          const refUrl = new URL(referrer);
          path = refUrl.pathname.toLowerCase();
          search = refUrl.search;
        } catch (e) {}
      } else {
        path = (sessionStorage.getItem('sakhi_last_page') || '').toLowerCase();
      }
    } else {
      // Remember current page in sessionStorage so if user navigates to dedicated page, we know!
      try {
        sessionStorage.setItem('sakhi_last_page', window.location.pathname + window.location.search);
        sessionStorage.setItem('sakhi_last_page_title', document.title || '');
      } catch (e) {}
    }

    // A. Check for Books
    const activeBook = detectActivePageBook();
    if (activeBook) {
      return {
        type: 'book',
        title: activeBook.title,
        book: activeBook,
        prompt: `क्या आप "${activeBook.title}" ई-बुक (ऑफर मात्र ₹${activeBook.offer}) के बारे में जानना चाहते हैं?`
      };
    }

    // B. Check for Specific Categories / Pages
    if (path.includes('diabetes')) {
      return { type: 'topic', title: 'मधुमेह व ब्लड शुगर नियंत्रण', prompt: 'क्या आप मधुमेह / ब्लड शुगर को 100% प्राकृतिक रूप से नियंत्रित करने के बारे में जानना चाहते हैं?' };
    }
    if (path.includes('joint') || path.includes('arthritis')) {
      return { type: 'topic', title: 'जोड़ों व घुटनों का पुराना दर्द', prompt: 'क्या आप जोड़ों के दर्द, गठिया और यूरिक एसिड के आयुर्वेदिक उपचार के बारे में जानना चाहते हैं?' };
    }
    if (path.includes('pashu') || path.includes('dairy')) {
      return { type: 'topic', title: 'पशुपालन, दूध व फैट वृद्धि', prompt: 'क्या आप गाय-भैंस का दूध 2-3 लीटर और फैट 8%+ बढ़ाने व थनैला से बचाव के बारे में जानना चाहते हैं?' };
    }
    if (path.includes('kharif') || path.includes('kheti') || path.includes('crop-doctor')) {
      return { type: 'topic', title: 'फसल सुरक्षा व स्प्रे कैलेंडर', prompt: 'क्या आप अपनी फसल के रोग, कीट और सटीक स्प्रे व खाद के बारे में जानना चाहते हैं?' };
    }
    if (path.includes('netsurf')) {
      return { type: 'topic', title: 'नेट्सर्फ बायोफिट व बिज़नेस', prompt: 'क्या आप नेट्सर्फ बायोफिट तकनीक से 50% रासायनिक खाद खर्च घटाने व बिज़नेस प्लान के बारे में जानना चाहते हैं?' };
    }
    if (path.includes('skin') || path.includes('beauty') || path.includes('hair')) {
      return { type: 'topic', title: 'प्राकृतिक त्वचा व सौंदर्य देखभाल', prompt: 'क्या आप चेहरे के दाग, झाइयां मिटाने और बालों के प्राकृतिक विकास के बारे में जानना चाहते हैं?' };
    }
    if (path.includes('business') || path.includes('earning')) {
      return { type: 'topic', title: 'घर बैठे मोबाइल से कमाई', prompt: 'क्या आप घर बैठे मोबाइल फोन से डिजिटल रेफरल व ₹25,000-₹50,000 कमाने के बारे में जानना चाहते हैं?' };
    }

    return null;
  }

  // 9. CHATGPT-GRADE GREETING (CLEAN - NO BANNER IMAGE, DYNAMIC USER & CONTEXT AWARE)
  function renderInitialGreeting() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const rawName = getDynamicUserGreetingName();
    const displayName = rawName ? `${rawName} जी` : 'किसान साथी';

    // A. BOOK LANDING PAGE SPECIALIZED PITCH & AUDIO DEMO
    const activeBook = detectActivePageBook();
    if (activeBook) {
      const bookDemoSpeech = `नमस्ते ${displayName}! मैं आपकी आरोग्यम सखी AI हूँ। क्या आप "${activeBook.title}" के बारे में जानना चाहते हैं? ${activeBook.audioDemo} अभी स्पेशल ऑफर में यह केवल ₹${activeBook.offer} में उपलब्ध है।`;
      const bookBuyUrl = `/ebooks/book-landing.html?id=${encodeURIComponent(activeBook.id)}`;
      const waBookHandoffUrl = `https://api.whatsapp.com/send?phone=91${MASTER_ADMIN_PHONE}&text=${encodeURIComponent(`नमस्ते अवनीश सर! 🙏\nमैं आरोग्यम सखी AI पर आपकी "${activeBook.title}" ई-बुक (ऑफर ₹${activeBook.offer}) देख रहा हूँ। कृपया इस पर विशेष कॉम्बो या डिस्काउंट बताएं।`)}`;

      wrap.innerHTML = `
        <div class="sakhi-msg-row bot">
          <div class="sakhi-msg-bubble" style="background:#ffffff;border:1.5px solid #86efac;border-radius:18px;padding:16px;box-shadow:0 4px 16px rgba(22,163,74,0.12);">
            <!-- Avatar + Book Greeting Header -->
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #16a34a;box-shadow:0 2px 8px rgba(22,163,74,0.3);" onerror="this.src='/images/logo/fevicon.png'">
              <div>
                <div style="font-size:1.05rem;font-weight:800;color:#0f172a;">नमस्ते ${escapeHtml(displayName)}! 🙏</div>
                <div style="font-size:0.84rem;color:#166534;font-weight:700;">📖 <strong>${escapeHtml(activeBook.title)}</strong> विशेष गाइड</div>
              </div>
            </div>

            <div style="color:#334155;font-size:0.92rem;line-height:1.55;margin-bottom:12px;">
              ${escapeHtml(activeBook.desc)}
            </div>

            <!-- Feature & Price Box -->
            <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                <span style="background:#fef3c7;color:#92400e;font-size:0.75rem;font-weight:800;padding:3px 8px;border-radius:6px;">
                  ⭐ 4.9/5 रेटिंग • 100% Instant PDF
                </span>
                <div>
                  <span style="font-size:0.85rem;color:#94a3b8;text-decoration:line-through;">₹${activeBook.mrp}</span>
                  <span style="font-size:1.25rem;font-weight:900;color:#15803d;margin-left:6px;">मात्र ₹${activeBook.offer}</span>
                </div>
              </div>
              <div style="font-size:0.80rem;color:#475569;margin-bottom:10px;">
                🔒 Razorpay सुरक्षित भुगतान • तुरंत डाउनलोड लिंक WhatsApp व स्क्रीन पर।
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <a href="${bookBuyUrl}" target="_blank" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;border:none;font-weight:800;padding:8px 14px;text-decoration:none;">
                  ⚡ अभी खरीदें (₹${activeBook.offer}) →
                </a>
                <a href="${escapeHtml(waBookHandoffUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border:none;font-weight:800;padding:8px 14px;text-decoration:none;">
                  <i class="fa-brands fa-whatsapp"></i> अवनीश सर से ऑफर लें →
                </a>
              </div>
            </div>

            <!-- Book Specific Quick Questions -->
            <div style="margin-bottom:10px;">
              <div style="font-size:0.82rem;font-weight:800;color:#166534;margin-bottom:6px;">
                👉 इस पुस्तक के बारे में तुरंत पूछें:
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(activeBook.title)} की मुख्य विशेषताएं क्या हैं?')">
                  📖 इस किताब की खासियत
                </button>
                <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(activeBook.title)} खरीदने के बाद डाउनलोड कैसे मिलेगी?')">
                  📥 डाउनलोड प्रक्रिया
                </button>
                <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('क्या इसके साथ कोई फ्री बोनस या WhatsApp सपोर्ट है?')">
                  🎁 फ्री बोनस व सपोर्ट
                </button>
              </div>
            </div>

            ${buildMsgAudioBtnMarkup(bookDemoSpeech)}
            ${buildGuestLeadCardHtml()}
          </div>
        </div>
      `;

      if (isSoundEnabled) {
        speakResponse(bookDemoSpeech);
      }
      return;
    }

    // B. TOPIC / CURRENT SOURCE PAGE AWARE GREETING
    const ctx = detectContextPage();
    if (ctx && ctx.type === 'topic') {
      const topicGreeting = `नमस्ते ${displayName}! मैं आपकी आरोग्यम सखी AI हूँ। क्या आप ${ctx.title} के बारे में कुछ जानना चाहते हैं?`;
      wrap.innerHTML = `
        <div class="sakhi-msg-row bot">
          <div class="sakhi-msg-bubble" style="background:#ffffff;border:1.5px solid #86efac;border-radius:18px;padding:16px;box-shadow:0 4px 16px rgba(22,163,74,0.12);">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #16a34a;box-shadow:0 2px 8px rgba(22,163,74,0.3);" onerror="this.src='/images/logo/fevicon.png'">
              <div>
                <div style="font-size:1.05rem;font-weight:800;color:#0f172a;">नमस्ते ${escapeHtml(displayName)}! 🙏</div>
                <div style="font-size:0.84rem;color:#166534;font-weight:700;">🌟 <strong>${escapeHtml(ctx.title)}</strong> विशेष परामर्श</div>
              </div>
            </div>

            <div style="color:#1e293b;font-size:0.94rem;line-height:1.55;margin-bottom:12px;font-weight:600;">
              ${escapeHtml(ctx.prompt)}
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(ctx.title)} का पूरा समाधान बताएं')">
                👉 ${escapeHtml(ctx.title)} का समाधान
              </button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(ctx.title)} में सही डोज व सावधानियां क्या हैं?')">
                🧪 सही डोज व सावधानियां
              </button>
              <button type="button" class="sakhi-followup-chip" onclick="window.connectToAvneeshMishra('${escapeHtml(ctx.title)}')">
                💬 अवनीश सर से सीधी सलाह
              </button>
            </div>

            ${buildMsgAudioBtnMarkup(topicGreeting)}
            ${buildGuestLeadCardHtml()}
          </div>
        </div>
      `;
      if (isSoundEnabled) {
        speakResponse(topicGreeting);
      }
      return;
    }

    // C. GENERAL OMNI GREETING
    const greetingSpeech = `नमस्ते ${displayName}! मैं आपकी आरोग्यम सखी AI हूँ। आज मैं आपकी क्या सेवा कर सकती हूँ?`;

    wrap.innerHTML = `
      <div class="sakhi-msg-row bot">
        <div class="sakhi-msg-bubble" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:16px;">
          <!-- Avatar + Dynamic Greeting -->
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #16a34a;box-shadow:0 2px 8px rgba(22,163,74,0.3);" onerror="this.src='/images/logo/fevicon.png'">
            <div>
              <div style="font-size:1.05rem;font-weight:800;color:#0f172a;">नमस्ते ${escapeHtml(displayName)}! 🙏</div>
              <div style="font-size:0.84rem;color:#166534;font-weight:600;">मैं आपकी <strong>आरोग्यम सखी AI</strong> हूँ।</div>
            </div>
          </div>

          <div style="color:#334155;font-size:0.88rem;line-height:1.55;margin-bottom:12px;">
            खेती (गेहूं, सरसों, खाद), पशुपालन (दूध-फैट), सेहत (डायबिटीज, जोड़ दर्द), सौंदर्य या घर बैठे कमाई से जुड़ा कोई भी सवाल नीचे पूछें।
          </div>

          <!-- Quick Tip with Plus Button Trigger -->
          <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <div style="font-size:0.80rem;color:#475569;">
              ✨ नीचे <strong>[+]</strong> बटन दबाकर किसी भी विषय का सवाल चुनें।
            </div>
            <button type="button" class="sakhi-choice-btn" style="padding:4px 10px;font-size:0.78rem;margin:0;width:auto;" onclick="window.toggleSakhiPlusMenu(true)">
              विषय सूची (+)
            </button>
          </div>

          ${buildMsgAudioBtnMarkup(greetingSpeech)}
          ${buildGuestLeadCardHtml()}
        </div>
      </div>
    `;
  }

  // Plus Menu & Fullscreen Controllers
  window.toggleSakhiPlusMenu = function (forceState) {
    const menu = document.getElementById('sakhiPlusMenu');
    if (!menu) return;
    const isShowing = menu.style.display === 'block';
    const next = (typeof forceState === 'boolean') ? forceState : !isShowing;
    menu.style.display = next ? 'block' : 'none';
  };

  window.selectSakhiTopic = function (promptText) {
    window.toggleSakhiPlusMenu(false);
    const input = document.getElementById('sakhiTextInput');
    if (input) {
      input.value = promptText;
      window.submitSakhiFromInput();
    }
  };

  window.toggleSakhiFullscreen = function () {
    if (checkIsDedicatedPage()) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } else {
      const windowEl = document.getElementById('sakhiChatWindow');
      if (windowEl) {
        windowEl.classList.toggle('fullscreen-expanded');
      } else {
        window.location.href = '/aarogyam-sakhi.html';
      }
    }
  };

  // 10. TYPING & STREAMING
  function appendUserMessage(text) {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;
    const row = document.createElement('div');
    row.className = 'sakhi-msg-row user';
    row.innerHTML = `<div class="sakhi-msg-bubble">${escapeHtml(text)}</div>`;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function appendTypingIndicator() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return null;
    const row = document.createElement('div');
    row.className = 'sakhi-msg-row bot thinking-row';
    row.id = 'sakhiThinkingRow';
    row.innerHTML = `
      <div class="sakhi-msg-bubble sakhi-typing-bubble">
        <div class="sakhi-typing-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="sakhi-typing-label">आरोग्यम सखी विचार कर रही हैं... ✍️</span>
      </div>
    `;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
    return row;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('sakhiThinkingRow');
    if (el) el.remove();
  }

  function streamBotMessage(fullHtmlContent, speechText) {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const row = document.createElement('div');
    row.className = 'sakhi-msg-row bot';
    const bubble = document.createElement('div');
    bubble.className = 'sakhi-msg-bubble';
    row.appendChild(bubble);
    wrap.appendChild(row);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHtmlContent;
    const solutionText = tempDiv.innerText || tempDiv.textContent || '';
    const words = solutionText.split(' ');

    let wordIdx = 0;
    bubble.innerHTML = `<span class="sakhi-streaming-text"></span><span class="sakhi-streaming-caret"></span>`;
    const textSpan = bubble.querySelector('.sakhi-streaming-text');
    const caret = bubble.querySelector('.sakhi-streaming-caret');

    if (speechText) {
      speakResponse(speechText);
    }

    const streamInterval = setInterval(() => {
      if (wordIdx < words.length) {
        textSpan.textContent += (wordIdx === 0 ? '' : ' ') + words[wordIdx];
        wordIdx++;
        wrap.scrollTop = wrap.scrollHeight;
      } else {
        clearInterval(streamInterval);
        if (caret) caret.remove();
        bubble.innerHTML = fullHtmlContent;
        wrap.scrollTop = wrap.scrollHeight;
      }
    }, 24);

    try {
      sessionChatHistory.push({
        role: 'sakhi',
        text: speechText || solutionText,
        time: new Date().toLocaleTimeString('hi-IN')
      });
    } catch (e) {}
  }

  // 11. SUBMISSION HANDLER & STRICT AUTH GATE
  function handleUserSubmit(userQuery) {
    const query = (userQuery || '').trim();
    if (!query) return;

    const input = document.getElementById('sakhiTextInput');
    if (input) input.value = '';

    appendUserMessage(query);

    try {
      sessionChatHistory.push({
        role: 'user',
        text: query,
        time: new Date().toLocaleTimeString('hi-IN')
      });
    } catch (e) {}

    // A. IN-CHAT NLP REGISTRATION PARSER (If user writes mobile/name directly in chat)
    const phoneMatch = query.match(/(?:(?:\+91|91|0)?[-\s]?)?([6-9]\d{9})/);
    if (phoneMatch && !isUserAuthenticated()) {
      const extractedPhone = phoneMatch[1];
      let potentialName = query
        .replace(phoneMatch[0], '')
        .replace(/(?:मेरा\s*नाम|नाम|name|mobile|phone|नंबर|no|hai|he|हूँ|हू|hu|मेरा\s*नंबर|whatsapp)/gi, '')
        .replace(/[^a-zA-Z\u0900-\u097F\s]/g, '')
        .trim();
      
      if (!potentialName || potentialName.length < 2) {
        try {
          const leads = JSON.parse(localStorage.getItem('sakhi_registered_leads') || '[]');
          const lead = leads.find(l => l.phone && l.phone.slice(-10) === extractedPhone);
          if (lead && lead.name) potentialName = lead.name;
        } catch (e) {}
      }

      if (potentialName && potentialName.length >= 2) {
        let officialName = potentialName;
        (async () => {
          try {
            if (typeof isMobileRegistered === 'function') {
              const existing = await isMobileRegistered(extractedPhone);
              if (existing && existing.full_name && existing.full_name.trim()) {
                officialName = existing.full_name.trim();
              } else if (typeof registerUser === 'function') {
                const res = await registerUser({ fullName: potentialName, mobile: extractedPhone, source: 'aarogyam-sakhi' });
                if (res && res.profile && res.profile.full_name) officialName = res.profile.full_name;
              }
            }
          } catch (e) {}
          syncUnifiedUserAuth(officialName, extractedPhone);
          updateSakhiHeaderUserBadge();
        })();
        const successSpeech = `धन्यवाद ${potentialName} जी! आपका नंबर रजिस्टर हो गया है।`;
        const successHtml = `
          <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:18px;padding:14px;box-shadow:0 4px 12px rgba(22,163,74,0.15);">
            <div style="font-weight:900;color:#15803d;font-size:1rem;margin-bottom:4px;">
              🎉 स्वागत है ${escapeHtml(potentialName)} जी!
            </div>
            <div style="font-size:0.88rem;color:#334155;line-height:1.5;">
              आपका WhatsApp नंबर <strong>${escapeHtml(extractedPhone)}</strong> सफलतापूर्वक रजिस्टर व लॉगिन हो गया है। अब आप खेती, पशुपालन, सेहत या सौंदर्य का कोई भी सवाल पूछ सकते हैं।
            </div>
          </div>
        `;
        streamBotMessage(successHtml, successSpeech);
        return;
      } else {
        window.openSakhiAuthModal();
        const phoneInput = document.getElementById('sakhiModalPhone');
        if (phoneInput) phoneInput.value = extractedPhone;
        const nameInput = document.getElementById('sakhiModalName');
        if (nameInput) setTimeout(() => nameInput.focus(), 350);
        return;
      }
    }

    // B. STRICT AUTH GATE: Do not answer if not authenticated with 10-digit phone & name!
    if (!isUserAuthenticated()) {
      pendingUserQuery = query;
      window.openSakhiAuthModal();
      const gateSpeech = 'नमस्ते किसान साथी! सवाल का उत्तर देखने के लिए कृपया पहले अपना शुभ नाम और WhatsApp नंबर दर्ज करें या लॉगिन करें।';
      const gateHtml = `
        <div style="background:#ffffff;border:2px solid #22c55e;border-radius:18px;padding:16px;box-shadow:0 6px 20px rgba(22,163,74,0.15);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="width:36px;height:36px;border-radius:50%;background:#dcfce7;color:#15803d;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">
              <i class="fa-solid fa-lock"></i>
            </div>
            <div style="font-weight:900;color:#14532d;font-size:1.02rem;">लॉगिन आवश्यक है</div>
          </div>
          <div style="font-size:0.90rem;color:#334155;line-height:1.55;margin-bottom:12px;">
            नमस्ते किसान साथी! 🙏 आपके सवाल <strong>"${escapeHtml(query)}"</strong> का प्रमाणित वैज्ञानिक उत्तर तैयार है। उत्तर देखने के लिए कृपया पहले अपना नाम और 10 अंकों का WhatsApp नंबर दर्ज करें (या लॉगिन करें)।
          </div>
          <button type="button" onclick="window.openSakhiAuthModal()" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:0.92rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(22,163,74,0.3);">
            <i class="fa-solid fa-key"></i> <span>अभी लॉगिन / रजिस्टर करें →</span>
          </button>
        </div>
      `;
      streamBotMessage(gateHtml, gateSpeech);
      return;
    }

    // Safety / Profanity
    const safetyCheck = checkSafetyAndProfanity(query);
    if (!safetyCheck.isSafe) {
      appendTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        streamBotMessage(
          `<div style="color:#b91c1c;background:#fef2f2;padding:12px;border-radius:12px;border:1.5px solid #fecaca;"><strong>⚠️ सूचना:</strong> ${safetyCheck.message}</div>`,
          safetyCheck.message
        );
      }, 800);
      return;
    }

    // Analytics Logging (Local Analytics for Admin Panel)
    try {
      const logs = JSON.parse(localStorage.getItem('SAKHI_ANALYTICS_LOGS') || '[]');
      const qDomain = classifyQueryDomain(query);
      logs.unshift({
        query: query,
        domain: qDomain,
        timestamp: new Date().toISOString(),
        phone: getUserPhone()
      });
      localStorage.setItem('SAKHI_ANALYTICS_LOGS', JSON.stringify(logs.slice(0, 100)));
    } catch (e) {}

    appendTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      processKnowledgeQuery(query);
    }, 1200);
  }

  // 12. MATCH INTENT WITH DOMAIN ISOLATION
  function processKnowledgeQuery(query) {
    const cleanQ = query.toLowerCase();
    const targetDomain = classifyQueryDomain(cleanQ);

    if (!knowledgeData || !knowledgeData.intents) {
      synthesizeDynamicAnswer(query, targetDomain);
      return;
    }

    // Check Subtopic Direct Matches
    for (const item of knowledgeData.intents) {
      if (item.sub_topics) {
        for (const st of item.sub_topics) {
          if (cleanQ.includes(st.title.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '')) || cleanQ === st.title.toLowerCase()) {
            renderSubTopicDirect(st, item);
            return;
          }
        }
      }
    }

    // Filter intents by targetDomain for STRICT ZERO-LEAKAGE
    let candidateIntents = knowledgeData.intents;
    if (targetDomain !== 'omni') {
      const filtered = candidateIntents.filter(item => {
        const itemDom = (item.domain || '').toLowerCase();
        if (targetDomain === 'agri') return itemDom === 'agri' || itemDom === 'krishi';
        if (targetDomain === 'pashu') return itemDom === 'pashu' || itemDom === 'veterinary';
        if (targetDomain === 'health') return itemDom === 'health' || itemDom === 'ayurveda';
        if (targetDomain === 'beauty') return itemDom === 'beauty' || itemDom === 'dermatology';
        if (targetDomain === 'netsurf') return itemDom === 'netsurf' || itemDom === 'business';
        if (targetDomain === 'business') return itemDom === 'business' || itemDom === 'netsurf';
        if (targetDomain === 'founder') return itemDom === 'founder';
        if (targetDomain === 'nuskhe') return itemDom === 'nuskhe' || itemDom === 'health';
        return true;
      });
      if (filtered.length > 0) {
        candidateIntents = filtered;
      }
    }

    let matchedIntent = null;
    let maxScore = 0;

    candidateIntents.forEach((intent) => {
      let score = 0;
      (intent.keywords || []).forEach((kw) => {
        const kwLower = kw.toLowerCase();
        if (cleanQ.includes(kwLower)) {
          score += (kwLower.length >= 4 ? 4 : 2);
        }
      });
      if (score > maxScore) {
        maxScore = score;
        matchedIntent = intent;
      }
    });

    if (matchedIntent && maxScore > 0) {
      renderDirectSummary(matchedIntent, query, targetDomain);
    } else {
      synthesizeDynamicAnswer(query, targetDomain);
    }
  }

  function renderSubTopicDirect(subTopic, parentIntent) {
    const parentDomain = (parentIntent.domain || 'omni').toLowerCase();
    const title = subTopic.title;
    const content = subTopic.content;

    let actionChips = '';
    if (parentDomain === 'agri') {
      actionChips = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('खेती डॉक्टर ई-बुक कैसे खरीदें?')">
          <span>📚 संपूर्ण स्प्रे कैलेंडर व ई-बुक गाइड</span> →
        </button>
      `;
    } else if (parentDomain === 'pashu') {
      actionChips = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          <span>🐄 आहार व खुराक (Dose) नियम</span> →
        </button>
      `;
    } else if (parentDomain === 'health') {
      actionChips = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह और शुगर कंट्रोल का फॉर्मूला')">
          <span>🩺 सात्विक डाइट व परहेज</span> →
        </button>
      `;
    }

    const html = `
      <div style="font-weight:900;color:#15803d;font-size:1.02rem;margin-bottom:6px;">
        ${escapeHtml(title)}
      </div>
      <div style="font-size:0.95rem;line-height:1.6;color:#1e293b;margin-bottom:6px;">
        ${escapeHtml(content)}
      </div>
      ${buildMsgAudioBtnMarkup(content)}

      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
        <div style="font-weight:900;color:#15803d;font-size:0.9rem;margin-bottom:8px;">
          👉 आगे यह भी जानिए:
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${actionChips}
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(parentIntent.title)}')">
            <span>🌿 इस विषय की मुख्य जानकारी</span> →
          </button>
        </div>
      </div>
    `;

    streamBotMessage(html, content);
  }

  function renderDirectSummary(intent, originalQuery, domain) {
    const title = intent.title || '🌿 प्रामाणिक वैज्ञानिक समाधान';
    const mainFirstAid = intent.ayurvedic_protocol || intent.direct_summary?.answer_crisp || '';
    const mainAnatomy = intent.anatomy_physiology || intent.scientific_cause || '';
    const reference = intent.reference || '';

    // Analyze exact aspect queried by the user
    const qLower = (originalQuery || '').toLowerCase();
    const asksCause = qLower.includes('कारण') || qLower.includes('वजह') || qLower.includes('लक्षण') || qLower.includes('पहचान') || qLower.includes('क्यों') || qLower.includes('क्यो');
    const asksTreatment = qLower.includes('दवा') || qLower.includes('इलाज') || qLower.includes('स्प्रे') || qLower.includes('उपचार') || qLower.includes('डोज') || qLower.includes('रोकथाम') || qLower.includes('मात्रा') || qLower.includes('समय') || qLower.includes('कैसे ठीक') || qLower.includes('कैसे बढाएं') || qLower.includes('कैसे बढाए') || qLower.includes('formula') || qLower.includes('फॉर्मूला');

    let directAnswer = '';
    let followUpChips = [];

    if (asksCause && !asksTreatment && mainAnatomy) {
      // User ONLY asked for cause/symptoms -> Return ONLY 1-2 sentence cause
      directAnswer = (mainAnatomy.split('।').slice(0, 2).join('।') + '।').trim();
      followUpChips.push({ text: '🧪 सही स्प्रे दवा व डोज', query: `${title} की सही दवा और स्प्रे डोज क्या है?` });
      followUpChips.push({ text: '🛡️ जैविक व घरेलू रोकथाम', query: `${title} का जैविक व घरेलू उपचार क्या है?` });
    } else if (asksTreatment && !asksCause && mainFirstAid) {
      // User ONLY asked for treatment/dose -> Return ONLY 1-2 sentence treatment
      directAnswer = (mainFirstAid.split('।').slice(0, 2).join('।') + '।').trim();
      followUpChips.push({ text: '🔬 रोग का मुख्य कारण व लक्षण पहचान', query: `${title} का मुख्य कारण और लक्षण पहचान क्या है?` });
      followUpChips.push({ text: '📅 स्प्रे का सही समय व सावधानियां', query: `${title} में स्प्रे का सही समय व सावधानियां` });
    } else {
      // General or balanced query: Return single crisp core solution (no dumping)
      if (mainFirstAid) {
        directAnswer = (mainFirstAid.split('।').slice(0, 2).join('।') + '।').trim();
      } else if (mainAnatomy) {
        directAnswer = (mainAnatomy.split('।').slice(0, 2).join('।') + '।').trim();
      } else {
        directAnswer = title;
      }
      followUpChips.push({ text: '🔬 मुख्य कारण व लक्षण पहचान', query: `${title} का मुख्य कारण और लक्षण पहचान क्या है?` });
      followUpChips.push({ text: '🧪 स्प्रे दवा व सटीक डोज', query: `${title} की सही दवा और स्प्रे डोज क्या है?` });
    }

    if (!directAnswer) directAnswer = mainFirstAid || mainAnatomy || title;

    let emergencyAlert = '';
    if (isEmergencyQuery(originalQuery)) {
      emergencyAlert = `
        <div class="sakhi-emergency-alert" style="background:#fee2e2;border:1.5px solid #ef4444;border-radius:12px;padding:10px;margin-bottom:8px;color:#991b1b;display:flex;gap:8px;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:1.2rem;"></i>
          <div><strong>आपातकालीन चेतावनी:</strong> सीने में तेज दर्द, पसीना या सांस फूलना हार्ट अटैक का लक्षण हो सकता है। तुरंत 108 एम्बुलेंस बुलाएं या नजदीकी अस्पताल जाएं!</div>
        </div>
      `;
    }

    // Interactive Follow-up Question Chips
    let followUpChipsHtml = '';
    followUpChips.forEach(chip => {
      followUpChipsHtml += `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(chip.query)}')">
          <span>${escapeHtml(chip.text)}</span> →
        </button>
      `;
    });

    // Action Chips based on STRICT Domain (NO DADI KE NUSKHE ON CROPS!)
    let domainActionPills = '';
    if (domain === 'agri') {
      domainActionPills = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('खेती डॉक्टर ई-बुक कैसे खरीदें?')">
          <span>📚 खेती डॉक्टर ई-बुक (ऑफर ₹99)</span> →
        </button>
      `;
    } else if (domain === 'pashu') {
      domainActionPills = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          <span>🐄 आहार व खुराक (Dose) नियम</span> →
        </button>
      `;
    } else if (domain === 'health') {
      domainActionPills = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेचुरामोर आयुर्वेदिक सप्लीमेंट का उपयोग')">
          <span>🌿 नेचुरामोर संपूर्ण पोषण</span> →
        </button>
      `;
    } else if (domain === 'beauty' || domain === 'nuskhe') {
      domainActionPills = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('दादी-नानी के घरेलू नुस्खे बताएं')">
          <span>🌸 सिद्ध घरेलू लेप व नुस्खा</span> →
        </button>
      `;
    } else if (domain === 'netsurf' || domain === 'business') {
      const waOfferMsg = `नमस्ते अवनीश सर! 🙏\nमैं आरोग्यम सखी AI पर नेट्सर्फ बिज़नेस प्लान व स्पेशल ई-बुक ऑफर के बारे में बात कर रहा हूँ। कृपया मुझे विशेष ऑफर प्रदान करें।`;
      const waUrl = `https://wa.me/91${MASTER_ADMIN_PHONE}?text=${encodeURIComponent(waOfferMsg)}`;
      domainActionPills = `
        <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;">
          <i class="fa-brands fa-whatsapp"></i> अवनीश सर से स्पेशल ऑफर लें →
        </a>
      `;
    } else if (domain === 'founder') {
      const waFounderMsg = `प्रणाम अवनीश सर! 🙏\nमैं आरोग्यम सखी AI के माध्यम से आपसे सीधे मार्गदर्शन हेतु संपर्क कर रहा हूँ।`;
      const waUrl = `https://wa.me/91${MASTER_ADMIN_PHONE}?text=${encodeURIComponent(waFounderMsg)}`;
      domainActionPills = `
        <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;">
          <i class="fa-brands fa-whatsapp"></i> अवनीश जी से सीधे WhatsApp पर बात करें →
        </a>
      `;
    }

    // Subtopics from intent
    let subTopicsHtml = '';
    if (intent.sub_topics && intent.sub_topics.length > 0) {
      intent.sub_topics.forEach((st) => {
        subTopicsHtml += `
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(st.title)}')">
            <span>${escapeHtml(st.title)}</span> →
          </button>
        `;
      });
    }

    const html = `
      ${emergencyAlert}
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
        ${escapeHtml(title)}
      </div>

      <div style="font-size:0.96rem;line-height:1.6;color:#1e293b;margin-bottom:6px;">
        ${escapeHtml(directAnswer)}
      </div>
      ${buildMsgAudioBtnMarkup(directAnswer)}

      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
        <div style="font-weight:900;color:#15803d;font-size:0.9rem;margin-bottom:8px;">
          👉 क्या आप इसके बारे में आगे यह जानना चाहते हैं?
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${followUpChipsHtml}
          ${domainActionPills}
          ${subTopicsHtml}
        </div>
      </div>

      ${reference ? `
        <div style="margin-top:8px;font-size:0.75rem;color:#94a3b8;font-style:italic;">
          📜 <strong>संदर्भ:</strong> ${escapeHtml(reference)}
        </div>
      ` : ''}
      ${buildGuestLeadCardHtml()}
    `;

    consecutiveAmbiguousCount = 0;
    streamBotMessage(html, directAnswer);
  }

  // 13. MASTER E-BOOK RECOMMENDATION ENGINE (ONE BY ONE INTERACTIVE)
  function renderBookRecommendation(cleanQ) {
    let selected = MASTER_BOOKS_CATALOG[0];
    for (const b of MASTER_BOOKS_CATALOG) {
      if (b.tags && b.tags.some(t => cleanQ.includes(t))) {
        selected = b;
        break;
      }
    }

    const bookUrl = `/books/${selected.slug}.html`;
    const waNegotiate = `नमस्ते अवनीश सर! 🙏\nमैं आरोग्यम सखी AI पर आपकी "${selected.title}" ई-बुक (ऑफर ₹${selected.offer}) के बारे में पूछ रहा हूँ। क्या इस पर कोई कॉम्बो या विशेष डिस्काउंट ऑफर उपलब्ध है?`;
    const waBookUrl = `https://wa.me/91${MASTER_ADMIN_PHONE}?text=${encodeURIComponent(waNegotiate)}`;
    const speech = `हमारी सबसे लोकप्रिय पुस्तक "${selected.title}" है। इसका एमआरपी ₹${selected.mrp} है, लेकिन अभी स्पेशल ऑफर केवल ₹${selected.offer} में उपलब्ध है। पेमेंट के बाद तुरंत पीडीएफ डाउनलोड हो जाएगी।`;

    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
        📚 ई-बुक अनुशंसा: ${escapeHtml(selected.title)}
      </div>
      <div style="font-size:0.95rem;line-height:1.55;color:#334155;margin-bottom:10px;">
        ${escapeHtml(selected.desc)}
      </div>

      <!-- Single Book Feature Card -->
      <div style="background:#ffffff;border:2px solid #86efac;border-radius:14px;padding:14px;margin-bottom:12px;box-shadow:0 4px 14px rgba(22,163,74,0.12);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <span style="background:#fef3c7;color:#92400e;font-size:0.75rem;font-weight:800;padding:3px 8px;border-radius:6px;">
            ⭐ 4.9/5 रेटिंग • 100% Instant PDF
          </span>
          <div>
            <span style="font-size:0.85rem;color:#94a3b8;text-decoration:line-through;">₹${selected.mrp}</span>
            <span style="font-size:1.25rem;font-weight:900;color:#15803d;margin-left:6px;">मात्र ₹${selected.offer}</span>
          </div>
        </div>
        <div style="font-size:0.82rem;color:#475569;margin-bottom:12px;">
          🔒 100% सुरक्षित Razorpay पेमेंट गेटवे • तुरंत डाउनलोड लिंक WhatsApp व स्क्रीन पर उपलब्ध।
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <a href="${bookUrl}" target="_blank" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;border:none;font-weight:800;padding:8px 14px;text-decoration:none;">
            ⚡ अभी खरीदें (₹${selected.offer}) →
          </a>
          <a href="${escapeHtml(waBookUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border:none;font-weight:800;padding:8px 14px;text-decoration:none;">
            <i class="fa-brands fa-whatsapp"></i> अवनीश सर से ऑफर लें →
          </a>
        </div>
      </div>

      <!-- Category Chips (EK-EK KARKE BATAO) -->
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:10px;">
        <div style="font-size:0.82rem;font-weight:800;color:#166534;margin-bottom:6px;">
          📖 अन्य पुस्तकें एक-एक करके देखें:
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं की खेती सम्पूर्ण गाइड किताब')">🌾 गेहूं गाइड (₹99)</button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('कृषि दवा डायरेक्टरी पुस्तक')">💊 दवा डायरेक्टरी (₹149)</button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('सब्जी खेती मास्टर पुस्तक')">🥬 सब्जी मास्टर (₹149)</button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('घर बैठे पैसे कैसे कमाएँ किताब')">💰 कमाई गाइड (₹149)</button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('Aarogyam Pro VIP सदस्यता पास')">👑 VIP पास (₹99)</button>
        </div>
      </div>
      ${buildGuestLeadCardHtml()}
    `;

    consecutiveAmbiguousCount = 0;
    streamBotMessage(html, speech);
  }

  // 14. DYNAMIC SYNTHESIZER & 2-STEP AMBIGUOUS QUERY ROUTER
  function synthesizeDynamicAnswer(query, domain) {
    const cleanQ = (query || '').toLowerCase();

    // A. If query is asking about eBooks
    if (cleanQ.includes('ई-बुक') || cleanQ.includes('ebook') || cleanQ.includes('किताब') || cleanQ.includes('पुस्तक') || cleanQ.includes('pdf')) {
      consecutiveAmbiguousCount = 0;
      renderBookRecommendation(cleanQ);
      return;
    }

    // B. Direct Netsurf Commission/Plan query (Accurate figures)
    if (domain === 'netsurf' || cleanQ.includes('कमीशन') || cleanQ.includes('commission') || cleanQ.includes('रिटेल') || cleanQ.includes('प्लान')) {
      consecutiveAmbiguousCount = 0;
      const netsurfAnswer = `नेट्सर्फ डायरेक्ट सेलिंग में 25% का फ्लैट डिस्काउंट, 5% से 15% रिटेल कमीशन, 3% से 8% जनरेशन इनकम और 3% से 6% टीम कमीशन मिलता है। शीर्ष साप्ताहिक कैपिंग ₹8,19,250 है। अधिक जानकारी व आईडी एक्टिवेशन हेतु अवनीश सर से संपर्क करें।`;
      const waUrl = buildAvneeshWhatsAppHandoffUrl(query);
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.02rem;margin-bottom:6px;">
          🌿 नेट्सर्फ बिज़नेस व कमीशन प्लान (प्रमाणित)
        </div>
        <div style="font-size:0.96rem;line-height:1.6;color:#1e293b;margin-bottom:8px;">
          ${escapeHtml(netsurfAnswer)}
        </div>
        ${buildMsgAudioBtnMarkup(netsurfAnswer)}
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;">
            <i class="fa-brands fa-whatsapp"></i> अवनीश सर से नेट्सर्फ आईडी व ऑफर लें →
          </a>
        </div>
        ${buildGuestLeadCardHtml()}
      `;
      streamBotMessage(html, netsurfAnswer);
      return;
    }

    // C. Step 2 Fallback: If user asks for Avneesh ji OR second unclear query in row
    if (cleanQ.includes('अवनीश') || cleanQ.includes('avneesh') || cleanQ.includes('बात करो') || cleanQ.includes('नंबर') || cleanQ.includes('हेल्प') || consecutiveAmbiguousCount >= 1) {
      consecutiveAmbiguousCount = 0;
      logUnansweredQuery(query, domain);
      const waUrl = buildAvneeshWhatsAppHandoffUrl(query);
      const speech = `रुकिए! मैं आपको अपने मुख्य आरोग्यम सहायक अवनीश मिश्रा जी का लिंक देती हूँ, आप उनसे सीधी बात करें।`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
          🤝 रुकिए! मैं आपको अपने मुख्य आरोग्यम सहायक अवनीश मिश्रा जी का लिंक देती हूँ।
        </div>
        <div style="font-size:0.95rem;line-height:1.6;color:#1e293b;margin-bottom:12px;">
          आप उनसे सीधे WhatsApp पर व्यक्तिगत मार्गदर्शन प्राप्त कर सकते हैं। आपकी अब तक की बातचीत की पूरी समरी उनके पास सुरक्षित रूप से पहुंच जाएगी ताकि वे तुरंत पूरी बात समझ सकें।
        </div>
        <div style="margin-bottom:12px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#ffffff;border:none;padding:12px 18px;font-size:0.95rem;font-weight:800;border-radius:24px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(34,197,94,0.4);">
            <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i>
            <span>अवनीश मिश्रा जी से WhatsApp पर सीधी बात करें →</span>
          </a>
        </div>
        ${buildGuestLeadCardHtml()}
      `;
      streamBotMessage(html, speech);
      return;
    }

    // D. Step 1 Fallback: First ambiguous / unrecognized question
    consecutiveAmbiguousCount++;
    logUnansweredQuery(query, domain);

    const speech = `क्षमा करिए! आपका सवाल मैं पूरी तरह समझ नहीं पाई। क्या आपको नीचे मेनू से किसी विषय में जानकारी चाहिए?`;
    const html = `
      <div style="font-weight:900;color:#dc2626;font-size:1.02rem;margin-bottom:6px;">
        🙏 क्षमा करिए! आपका सवाल मैं समझ नहीं पाई।
      </div>
      <div style="font-size:0.95rem;line-height:1.6;color:#334155;margin-bottom:10px;">
        क्या आपको नीचे मेनू <strong>[+]</strong> में से किसी विषय के बारे में जानकारी चाहिए? आप नीचे विषय चुन सकते हैं:
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं व सरसों की फसल में खाद व स्प्रे')">
          🌾 <span>खेती व फसलें</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          🐄 <span>पशुपालन (दूध-फैट)</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह और जोड़ों के दर्द का आयुर्वेदिक उपाय')">
          🩺 <span>स्वास्थ्य व रोग</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('चेहरे पर निखार और झाइयों का उपाय')">
          💄 <span>सौंदर्य व त्वचा</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ बायोफिट व नेचुरामोर उत्पाद')">
          🧴 <span>नेट्सर्फ प्रोडक्ट्स</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('घर बैठे पैसे कैसे कमाएं?')">
          💼 <span>कमाई व करियर</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('कृषि व स्वास्थ्य ई-बुक गाइड')">
          📚 <span>ई-बुक्स गाइड</span>
        </button>
      </div>

      <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span style="font-size:0.82rem;color:#64748b;">या सीधे अवनीश मिश्रा जी से बात करना चाहते हैं?</span>
        <button type="button" class="sakhi-choice-btn" style="padding:4px 10px;font-size:0.80rem;margin:0;width:auto;" onclick="window.connectToAvneeshMishra('${escapeHtml(query)}')">
          अवनीश जी से बात 💬
        </button>
      </div>

      ${buildGuestLeadCardHtml()}
    `;

    streamBotMessage(html, speech);
  }

  window.connectToAvneeshMishra = function (userQuery) {
    const waUrl = buildAvneeshWhatsAppHandoffUrl(userQuery);
    window.open(waUrl, '_blank');
  };

  // 14. VIRAL SHARE (CLEAN - NO DUPLICATE LINK, NO RAW PHONE NUMBERS)
  window.shareAarogyamSakhi = function () {
    const refCode = getBestReferralCode();
    const origin = (window.location.origin && window.location.origin.includes('http'))
      ? window.location.origin
      : 'https://aarogyamindia.online';
    const shareUrl = `${origin}/aarogyam-sakhi.html?ref=${encodeURIComponent(refCode)}`;

    const shareTitle = 'आरोग्यम सखी AI - खेत, सेहत, पशु, ब्यूटी व बिज़नेस का वैज्ञानिक समाधान 🌾';
    const shareText = `🌿 किसान व परिवारजनों के लिए बड़ी खुशखबरी! 🌿\n\nअब खेती, गेहूं, सरसों, धान, पशुपालन (दूध-फैट), सेहत (डायबिटीज, जोड़ दर्द) और सौंदर्य के लिए किसी के चक्कर काटने की जरूरत नहीं!\n\nमिलिए "आरोग्यम सखी AI" से — जो देती हैं हर सवाल का 100% सही व वैज्ञानिक जवाब! 👩‍🌾🩺\n\nअभी अपना सवाल पूछें बिल्कुल फ्री:\n${shareUrl}`;

    openWhatsAppDirect(shareText);
  };

  function openWhatsAppDirect(text) {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  window.askSakhiQuick = function (query) {
    handleUserSubmit(query);
  };

  window.consultAiExpert = function (topic, details) {
    openSakhiModal();
    const query = `${topic || 'परामर्श'}${details ? ': ' + details : ''}`;
    setTimeout(() => {
      handleUserSubmit(query);
    }, 400);
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.AarogyamSakhi = {
    open: openSakhiModal,
    close: closeSakhiModal,
    ask: handleUserSubmit,
    isUnlimited: () => true,
    share: window.shareAarogyamSakhi,
    detectDomain: detectCurrentPageDomain,
    classifyDomain: classifyQueryDomain
  };

  function bootSakhiEngine() {
    loadKnowledgeBase();
    initSpeechRecognition();
    injectSakhiUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSakhiEngine);
  } else {
    bootSakhiEngine();
  }
})();
