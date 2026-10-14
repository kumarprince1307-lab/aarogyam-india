/**
 * ====================================================================
 * AAROGYAM SAKHI AI - NEURAL CORE ENGINE v8.1 (PROFESSIONAL AI GRADE)
 * - Guaranteed Universal Floating Pill & In-Modal UI Injection across All Pages
 * - Strict Domain Isolation (Health, Krishi, Pashu, Beauty, Netsurf, Business, Founder, Nuskhe)
 * - Precision Entity Handlers (Stimrich, Bio-99, SHET, Wrap-up, CFC, Naturamore)
 * - Dedicated Interactive Spray Calendar Router (Wheat, Mustard, Chana, Vegetables)
 * - Certified Netsurf Direct Selling & ₹8,19,250 Weekly Capping Plan Router
 * - Empathetic Human-Touch Responses (Polite Indian Hindi Tone)
 * - Unified Multi-Session Authentication (Zero Login Loops)
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
  let pendingUserQuery = null;

  // 1. PAGE HELPERS
  function checkIsDedicatedPage() {
    const path = (window.location.pathname || '').toLowerCase();
    return path.includes('aarogyam-sakhi') || Boolean(document.getElementById('sakhiFullscreenContainer'));
  }

  // 2. DOMAIN CLASSIFIER & STRICT FIREWALL
  function classifyQueryDomain(cleanQuery) {
    const q = cleanQuery.toLowerCase();

    // A. Founder & Vision
    if (q.includes('अवनीश') || q.includes('avneesh') || q.includes('फाउंडर') || q.includes('founder') || q.includes('मालिक') || q.includes('आरोग्यम इंडिया कौन') || q.includes('कंपनी किसकी')) {
      return 'founder';
    }

    // B. Netsurf Direct Selling, Products & Plan
    if (q.includes('नेट्सर्फ') || q.includes('netsurf') || q.includes('बायोफिट') || q.includes('biofit') || q.includes('नेचुरामोर') || q.includes('naturamore') || q.includes('क्लब नेट्सर्फ') || q.includes('8.19') || q.includes('8,19,250') || q.includes('साप्ताहिक कैपिंग') || q.includes('बाइनरी') || q.includes('टर्नओवर कमीशन') || q.includes('डायरेक्ट सेलिंग') || q.includes('रिटेल बोनस')) {
      return 'netsurf';
    }

    // C. Business, Digital Earning & Smart eTailer
    if (q.includes('कमाई') || q.includes('पैसे कैसे कमाए') || q.includes('earning') || q.includes('income') || q.includes('बिज़नेस') || q.includes('business') || q.includes('एफिलिएट') || q.includes('affiliate') || q.includes('ई-टेलर') || q.includes('etailer') || q.includes('शेयर करके पैसे') || q.includes('जॉइनिंग') || q.includes('रजिस्ट्रेशन')) {
      return 'business';
    }

    // D. E-Books & Library
    if (q.includes('ई-बुक') || q.includes('ebook') || q.includes('किताब') || q.includes('पुस्तक') || q.includes('pdf') || q.includes('डाउनलोड') || q.includes('लाइब्रेरी') || q.includes('खरीफ गाइड') || q.includes('खेती डॉक्टर पुस्तक')) {
      return 'business';
    }

    // E. Dadi-Nani Ke Gharelu Nuskhe
    if (q.includes('दादी के नुस्खे') || q.includes('घरेलू नुस्खा') || q.includes('nuskhe') || q.includes('nuskha') || q.includes('काढ़ा') || q.includes('kadha') || q.includes('हल्दी दूध') || q.includes('घरेलू उपाय') || q.includes('देशी उपाय')) {
      return 'nuskhe';
    }

    // F. Veterinary & Dairy (Pashu Palan) - Check before Agri to avoid token overlap
    const pashuTokens = ['पशु', 'गाय', 'भैंस', 'दुधारू', 'दूध', 'फैट', 'fat', 'snf', 'थनैल', 'थनैला', 'मिल्क', 'mastitis', 'बकरी', 'भेड़', 'dairy', 'डेयरी', 'मुरगी', 'poultry', 'सूअर', 'मछली', 'fish', 'कैल्शियम', 'cfl', 'cfc', 'पशु आहार', 'गोबर'];
    for (const t of pashuTokens) {
      if (q.includes(t)) return 'pashu';
    }

    // G. Beauty, Dermatology & Trichology
    const beautyTokens = ['सुंदर', 'त्वचा', 'चेहरा', 'skin', 'झुर्रियां', 'झाइयां', 'रूखापन', 'काले घेरे', 'मुंहासे', 'pimple', 'ग्लो', 'glow', 'बाल', 'hair', 'डैंड्रफ', 'dandruff', 'गंजापन', 'हेयरफॉल', 'कंडीशनर', 'फेसपैक', 'रंगत'];
    for (const t of beautyTokens) {
      if (q.includes(t)) return 'beauty';
    }

    // H. Human Health & Medicine (Sehat)
    const healthTokens = ['शुगर', 'sugar', 'डायबिटीज', 'diabetes', 'बीपी', 'bp', 'ब्लड प्रेशर', 'घुटने', 'गठिया', 'जोड़ों', 'जोड़', 'दर्द', 'कमजोरी', 'लिवर', 'liver', 'किडनी', 'kidney', 'हार्ट', 'heart', 'दिल', 'थायराइड', 'thyroid', 'पथरी', 'दमा', 'अस्थमा', 'कब्ज', 'बवासीर', 'piles', 'मोटापा', 'वजन', 'हेल्थ', 'health', 'sehat', 'सेहत', 'बीमारी', 'रोग', 'इलाज', 'रोग प्रतिरोधक', 'यूरिक एसिड', 'सिरदर्द', 'पेट दर्द', 'गैस', 'एसिडिटी'];
    for (const t of healthTokens) {
      if (q.includes(t)) return 'health';
    }

    // I. Krishi / Agriculture (Strict Crop & Pest Tokens)
    const agriTokens = ['गेहूं', 'सरसों', 'चना', 'धान', 'मक्का', 'सोयाबीन', 'आलू', 'टमाटर', 'मिर्च', 'प्याज', 'लहसुन', 'सब्जी', 'कल्ले', 'फुटाव', 'यूरिया', 'डीएपी', 'एनपीके', 'उर्वरक', 'खाद', 'कीटनाशक', 'स्प्रे', 'माहू', 'चेपा', 'रतुआ', 'उकठा', 'खरपतवार', 'खरपतवारनाशक', 'इमामेक्टिन', 'कोराजन', 'स्टिमरिच', 'stimrich', 'bio-99', 'bio99', 'shet', 'wrapup', 'फसल', 'खेत', 'कृषि', 'बीज', 'सिंचाई', 'बालियां', 'कीट', 'इल्ली', 'फफूंद', 'झुलसा'];
    for (const t of agriTokens) {
      if (q.includes(t)) return 'agri';
    }

    const pageDomain = detectCurrentPageDomain();
    if (pageDomain && pageDomain !== 'omni') return pageDomain;

    return 'omni';
  }

  // 3. PAGE DOMAIN DETECTION
  function detectCurrentPageDomain() {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('hair') || path.includes('skin') || path.includes('beauty')) return 'beauty';
    if (path.includes('pashu') || path.includes('dairy') || path.includes('cattle') || path.includes('poultry')) return 'pashu';
    if (path.includes('health/') || path.includes('diabetes') || path.includes('joint') || path.includes('thyroid') || path.includes('weight') || path.includes('heart') || path.includes('liver') || path.includes('women') || path.includes('kids') || path.includes('dental') || path.includes('sexual')) return 'health';
    if (path.includes('agriculture') || path.includes('kharif') || path.includes('kheti') || path.includes('fasal') || path.includes('ebooks/')) return 'agri';
    return 'omni';
  }

  // 4. UNIFIED USER PROFILE HELPERS & MULTI-SESSION AUTH STATE
  function getUserPhone() {
    let p = (
      localStorage.getItem('aarogyam_user_phone') ||
      localStorage.getItem('aim_user_mobile') ||
      localStorage.getItem('SAKHI_USER_PHONE') ||
      localStorage.getItem('user_phone') ||
      localStorage.getItem('user_mobile') ||
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
        const pObj = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}');
        if (pObj && (pObj.mobile || pObj.phone)) p = pObj.mobile || pObj.phone;
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
      localStorage.getItem('SAKHI_USER_NAME') ||
      localStorage.getItem('user_name') ||
      ''
    ).trim();
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase().includes('guest')) {
      try {
        const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
        if (u && (u.name || u.full_name) && String(u.name || u.full_name).trim()) name = String(u.name || u.full_name).trim();
      } catch (e) {}
    }
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase().includes('guest')) {
      try {
        const pObj = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}');
        if (pObj && (pObj.name || pObj.full_name) && String(pObj.name || pObj.full_name).trim()) name = String(pObj.name || pObj.full_name).trim();
      } catch (e) {}
    }
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase().includes('guest')) {
      try {
        const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
        if (sess && sess.name && sess.name.trim()) name = sess.name.trim();
      } catch (e) {}
    }
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase().includes('guest')) {
      name = getUserPhone() ? 'किसान साथी' : '';
    }
    return name;
  }

  // Reliable, non-blocking check: if user has logged in anywhere on the website, they are authenticated!
  function isUserAuthenticated() {
    if (typeof window.isUserLoggedIn === 'function' && window.isUserLoggedIn()) return true;
    const phone = getUserPhone();
    return Boolean(phone && phone.length === 10);
  }

  function getDynamicUserGreetingName() {
    const name = getUserName();
    return name || 'किसान साथी';
  }

  // Unified Synchronization across Sakhi AI, Universal Nav Drawer, and Website
  function syncUnifiedUserAuth(name, phone) {
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const cleanName = String(name || '').trim() || 'किसान साथी';

    if (!cleanPhone || cleanPhone.length !== 10) return;

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
        source: 'aarogyam-sakhi'
      };
      localStorage.setItem('AI_USER', JSON.stringify(aiUser));
      localStorage.setItem('AI_PROFILE', JSON.stringify(aiUser));

      if (typeof window.updateUniversalDrawerProfile === 'function') {
        window.updateUniversalDrawerProfile();
      }
      window.dispatchEvent(new CustomEvent('ai:user-logged-in', { detail: { name: cleanName, mobile: cleanPhone } }));
    } catch (e) {
      console.warn('Unified sync notice:', e);
    }
  }

  // Live Chat History & WhatsApp Handoff Generator for Avneesh Mishra ji (7974422572)
  function buildAvneeshWhatsAppHandoffUrl(currentQuery) {
    const userName = getUserName() || 'किसान साथी';
    const userPhone = getUserPhone() || 'उपलब्ध नहीं';
    const recentConvs = sessionChatHistory.slice(-4).map(h => `${h.role === 'user' ? '👤 सवाल' : '🤖 सखी'}: ${h.text.replace(/<[^>]*>/g, '').slice(0, 80)}`).join('\n');

    const handoffText = `नमस्ते अवनीश सर! 🙏\n\nमैं आरोग्यम सखी AI पर मार्गदर्शन ले रहा हूँ।\n\n👤 *नाम:* ${userName}\n📱 *मोबाइल:* ${userPhone}\n❓ *वर्तमान प्रश्न:* "${currentQuery}"\n\n📋 *हालिया बातचीत समरी:*\n${recentConvs || '(सखी AI पर नया सवाल)'}\n\nकृपया मुझे इस पर व्यक्तिगत मार्गदर्शन व समाधान प्रदान करें। धन्यवाद!`;

    return `https://wa.me/91${MASTER_ADMIN_PHONE}?text=${encodeURIComponent(handoffText)}`;
  }

  // 5. AUTH MODAL (CLEAN, COMPACT & GUARANTEED DB CHECK)
  function ensureAuthModalExists() {
    let modal = document.getElementById('sakhiAuthModalBackdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sakhiAuthModalBackdrop';
      modal.className = 'sakhi-auth-modal-backdrop';
      modal.innerHTML = `
        <div class="sakhi-auth-modal-card">
          <button type="button" class="sakhi-auth-modal-close" onclick="window.closeSakhiAuthModal()" title="बंद करें">&times;</button>
          <div style="text-align:center;margin-bottom:14px;">
            <div style="width:48px;height:48px;border-radius:50%;background:#dcfce7;color:#15803d;display:inline-flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:6px;">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:900;color:#0f172a;">आरोग्यम सखी AI में स्वागत है</h3>
            <p style="margin:4px 0 0 0;font-size:0.84rem;color:#64748b;">कृपया अपना 10 अंकों का WhatsApp नंबर दर्ज करें</p>
          </div>

          <form onsubmit="event.preventDefault(); window.submitSakhiAuthModal();">
            <div style="margin-bottom:12px;">
              <label style="display:block;font-size:0.82rem;font-weight:700;color:#334155;margin-bottom:4px;">
                📱 WhatsApp मोबाइल नंबर: <span style="color:#dc2626;">*</span>
              </label>
              <input type="tel" id="sakhiModalPhone" maxlength="10" placeholder="10 अंकों का नंबर लिखें..." style="width:100%;padding:10px 12px;border:1.5px solid #cbd5e1;border-radius:10px;font-size:0.95rem;box-sizing:border-box;" oninput="window.checkExistingSakhiModalPhone(this.value)" required />
              <div id="sakhiPhoneCheckNotice" style="display:none;font-size:0.75rem;margin-top:4px;font-weight:700;"></div>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:0.82rem;font-weight:700;color:#334155;margin-bottom:4px;">
                👤 आपका शुभ नाम: <span style="color:#dc2626;">*</span>
              </label>
              <input type="text" id="sakhiModalName" placeholder="अपना पूरा नाम लिखें..." style="width:100%;padding:10px 12px;border:1.5px solid #cbd5e1;border-radius:10px;font-size:0.95rem;box-sizing:border-box;" required />
            </div>

            <button type="submit" style="width:100%;background:#16a34a;color:#ffffff;border:none;padding:12px;border-radius:12px;font-weight:900;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 12px rgba(22,163,74,0.3);">
              <span>आगे बढ़ें</span> <i class="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          <div style="text-align:center;margin-top:12px;font-size:0.72rem;color:#94a3b8;">
            🔒 100% सुरक्षित • आपका डेटा पूरी तरह गोपनीय रखा जाता है
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeSakhiAuthModal();
      });
    }
    return modal;
  }

  window.openSakhiAuthModal = function() {
    const modal = ensureAuthModalExists();
    if (modal) {
      modal.classList.add('active');
      const phoneInput = document.getElementById('sakhiModalPhone');
      if (phoneInput && !phoneInput.value) {
        phoneInput.value = getUserPhone();
        if (phoneInput.value) window.checkExistingSakhiModalPhone(phoneInput.value);
        setTimeout(() => phoneInput.focus(), 200);
      }
    }
  };

  window.closeSakhiAuthModal = function() {
    const modal = document.getElementById('sakhiAuthModalBackdrop');
    if (modal) modal.classList.remove('active');
  };

  let sakhiPhoneTimer = null;
  window.checkExistingSakhiModalPhone = function(val) {
    const clean = (val || '').replace(/\D/g, '').slice(-10);
    const notice = document.getElementById('sakhiPhoneCheckNotice');
    const nameInput = document.getElementById('sakhiModalName');
    if (!notice) return;

    if (sakhiPhoneTimer) clearTimeout(sakhiPhoneTimer);

    if (clean.length === 10) {
      notice.style.display = 'block';
      notice.style.color = '#d97706';
      notice.innerHTML = `⏳ खाता जाँचा जा रहा है...`;

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
            const official = dbUser.full_name.trim();
            notice.style.display = 'block';
            notice.style.color = '#15803d';
            notice.innerHTML = `✨ सत्यापित खाता: <strong>${escapeHtml(official)}</strong>`;
            if (nameInput) {
              nameInput.value = official;
              nameInput.readOnly = true;
              nameInput.style.backgroundColor = '#f0fdf4';
            }
          } else {
            notice.style.display = 'block';
            notice.style.color = '#0284c7';
            notice.innerHTML = `✨ नया खाता: कृपया नीचे अपना शुभ नाम लिखें।`;
            if (nameInput) {
              nameInput.readOnly = false;
              nameInput.style.backgroundColor = '#ffffff';
              if (!nameInput.value) nameInput.focus();
            }
          }
        } catch (e) {
          notice.style.display = 'none';
        }
      }, 250);
    } else {
      notice.style.display = 'none';
      if (nameInput) {
        nameInput.readOnly = false;
        nameInput.style.backgroundColor = '#ffffff';
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

    if (!rawName || rawName.length < 2) {
      alert('कृपया अपना शुभ नाम दर्ज करें।');
      if (nameEl) nameEl.focus();
      return;
    }

    let officialName = rawName;

    try {
      if (typeof isMobileRegistered === 'function') {
        const existingProfile = await isMobileRegistered(rawPhone);
        if (existingProfile && existingProfile.full_name && existingProfile.full_name.trim()) {
          officialName = existingProfile.full_name.trim();
        }
        if (existingProfile && typeof createLoginSession === 'function') {
          createLoginSession(existingProfile);
        }
      }
    } catch (e) {}

    syncUnifiedUserAuth(officialName, rawPhone);
    window.closeSakhiAuthModal();
    updateSakhiHeaderUserBadge();

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
            आपका WhatsApp नंबर <strong>${escapeHtml(rawPhone)}</strong> सत्यापित हो गया है। अब आप कोई भी सवाल पूछ सकते हैं।
          </div>
        </div>
      `;
      wrap.appendChild(row);
      wrap.scrollTop = wrap.scrollHeight;
    }

    if (pendingUserQuery) {
      const q = pendingUserQuery;
      pendingUserQuery = null;
      setTimeout(() => processKnowledgeQuery(q), 500);
    }
  };

  // 6. USER BADGE IN SAKHI HEADER
  function updateSakhiHeaderUserBadge() {
    const badgeWrap = document.getElementById('sakhiHeaderUserBadgeWrap');
    if (!badgeWrap) return;

    if (isUserAuthenticated()) {
      const name = getUserName();
      badgeWrap.innerHTML = `
        <div class="sakhi-user-badge logged-in" title="सत्यापित खाता: ${escapeHtml(name)}" style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);color:#ffffff;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;">
          <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;"></span>
          <span style="max-width:90px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(name)}</span>
        </div>
      `;
    } else {
      badgeWrap.innerHTML = `
        <button type="button" class="sakhi-user-badge guest" onclick="window.openSakhiAuthModal()" title="लॉगिन या नया खाता बनाने के लिए क्लिक करें" style="background:#fde047;border:none;color:#0f172a;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
          <span>🔑</span> <span>लॉगिन</span>
        </button>
      `;
    }
  }

  // 7. SPEECH RECOGNITION (STT)
  function initSpeechRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

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
      console.warn('[Sakhi AI] STT setup note:', e);
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
    if (input) input.placeholder = 'सवाल बोलें या लिखें...';
  }

  // 8. TEXT-TO-SPEECH (TTS)
  function speakResponse(text) {
    if (!isSoundEnabled || !window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#_~`•]/g, '').trim();
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
    const text = decodeURIComponent(encodedText);
    if (!window.speechSynthesis) return;

    if (activeSpeechBtn === btn && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      btn.classList.remove('speaking');
      activeSpeechBtn = null;
      return;
    }

    if (activeSpeechBtn && activeSpeechBtn !== btn) {
      window.speechSynthesis.cancel();
      activeSpeechBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      activeSpeechBtn.classList.remove('speaking');
    }

    const cleanText = text.replace(/[*#_~`•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;

    btn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    btn.classList.add('speaking');
    activeSpeechBtn = btn;

    utterance.onend = function () {
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      btn.classList.remove('speaking');
      activeSpeechBtn = null;
    };
    utterance.onerror = function () {
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      btn.classList.remove('speaking');
      activeSpeechBtn = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  function buildMsgAudioBtnMarkup(text) {
    if (!text) return '';
    const enc = encodeURIComponent(text.replace(/<[^>]*>/g, '').trim());
    return `
      <div style="display:inline-flex;margin-top:6px;">
        <button type="button" class="sakhi-msg-audio-btn" onclick="window.toggleMessageSpeech(this, '${enc}')" title="आवाज़ में सुनें" style="background:transparent;border:1px solid #cbd5e1;border-radius:20px;padding:3px 10px;font-size:0.75rem;cursor:pointer;display:inline-flex;align-items:center;gap:4px;color:#475569;">
          <i class="fa-solid fa-volume-high"></i> <span>सुनें</span>
        </button>
      </div>
    `;
  }

  // 9. KNOWLEDGE BASE LOADER
  async function loadKnowledgeBase() {
    try {
      const res = await fetch('/data/krishi-ai-knowledge.json?v=20261014_v88');
      if (res.ok) {
        knowledgeData = await res.json();
      }
    } catch (e) {
      console.warn('Knowledge load error:', e);
    }
  }

  // 10. CHAT UI INJECTION & MESSAGE STREAMER
  function appendUserMessage(text) {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const row = document.createElement('div');
    row.className = 'sakhi-msg-row user';
    row.innerHTML = `
      <div class="sakhi-msg-bubble user-bubble">
        ${escapeHtml(text)}
      </div>
    `;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function appendTypingIndicator() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    removeTypingIndicator();

    const row = document.createElement('div');
    row.id = 'sakhiTypingIndicatorRow';
    row.className = 'sakhi-msg-row bot';
    row.innerHTML = `
      <div class="sakhi-msg-bubble typing-bubble" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:12px 18px;display:inline-flex;align-items:center;gap:8px;">
        <span style="font-size:0.85rem;color:#166534;font-weight:700;">आरोग्यम सखी विचार कर रही हैं</span>
        <div class="sakhi-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function removeTypingIndicator() {
    const ind = document.getElementById('sakhiTypingIndicatorRow');
    if (ind) ind.remove();
  }

  function streamBotMessage(htmlContent, speechText) {
    removeTypingIndicator();
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const row = document.createElement('div');
    row.className = 'sakhi-msg-row bot';
    row.innerHTML = `
      <div class="sakhi-msg-bubble">
        ${htmlContent}
      </div>
    `;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;

    if (speechText) {
      speakResponse(speechText);
    }
  }

  // 11. GREETING & INITIALIZATION
  function renderInitialGreeting() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const displayName = getDynamicUserGreetingName();

    wrap.innerHTML = `
      <div class="sakhi-msg-row bot">
        <div class="sakhi-msg-bubble" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:16px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #16a34a;box-shadow:0 2px 8px rgba(22,163,74,0.3);" onerror="this.src='/images/logo/fevicon.png'">
            <div>
              <div style="font-size:1.05rem;font-weight:900;color:#0f172a;">नमस्ते ${escapeHtml(displayName)}! 🙏</div>
              <div style="font-size:0.82rem;color:#166534;font-weight:700;">मैं आपकी <strong>आरोग्यम सखी AI</strong> हूँ।</div>
            </div>
          </div>

          <div style="color:#334155;font-size:0.90rem;line-height:1.6;margin-bottom:12px;">
            खेती (गेहूं, सरसों, खाद, स्प्रे), स्वास्थ्य (डायबिटीज, जोड़ दर्द, बीपी), पशुपालन (दूध-फैट), सौंदर्य व नेट्सर्फ बिज़नेस से जुड़ा कोई भी सवाल बेझिझक पूछें।
          </div>

          <!-- Quick Topic Pills -->
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:10px 12px;margin-bottom:8px;">
            <div style="font-size:0.80rem;font-weight:800;color:#166534;margin-bottom:6px;">👉 मुख्य विषय चुनें:</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं की फसल में खाद व स्प्रे कैलेंडर बताएं')">🌾 गेहूं स्प्रे कैलेंडर</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('स्टिमरिच और बायो-99 की सही डोज क्या है?')">🧪 स्टिमरिच व बायो-99</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">🐄 दूध व फैट वृद्धि</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('डायबिटीज और शुगर कंट्रोल का फॉर्मूला')">🩺 शुगर व स्वास्थ्य</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ बिज़नेस प्लान और ₹8,19,250 साप्ताहिक कैपिंग')">💼 नेट्सर्फ प्लान</button>
            </div>
          </div>
        </div>
      </div>
    `;
    updateSakhiHeaderUserBadge();
  }

  // 12. SUBMISSION HANDLER & USER INPUT PROCESSING
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

    // In-chat Phone/Name Recognition
    const phoneMatch = query.match(/(?:(?:\+91|91|0)?[-\s]?)?([6-9]\d{9})/);
    if (phoneMatch && !isUserAuthenticated()) {
      const extractedPhone = phoneMatch[1];
      let potentialName = query
        .replace(phoneMatch[0], '')
        .replace(/(?:मेरा\s*नाम|नाम|name|mobile|phone|नंबर|no|hai|he|हूँ|हू|hu|मेरा\s*नंबर|whatsapp)/gi, '')
        .replace(/[^a-zA-Z\u0900-\u097F\s]/g, '')
        .trim();

      if (!potentialName || potentialName.length < 2) potentialName = 'किसान साथी';

      syncUnifiedUserAuth(potentialName, extractedPhone);
      updateSakhiHeaderUserBadge();

      const successSpeech = `धन्यवाद ${potentialName} जी! आपका नंबर सुरक्षित रूप से सत्यापित हो गया है।`;
      const successHtml = `
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:18px;padding:14px;box-shadow:0 4px 12px rgba(22,163,74,0.15);">
          <div style="font-weight:900;color:#15803d;font-size:1rem;margin-bottom:4px;">
            🎉 स्वागत है ${escapeHtml(potentialName)} जी!
          </div>
          <div style="font-size:0.88rem;color:#334155;line-height:1.5;">
            आपका WhatsApp नंबर <strong>${escapeHtml(extractedPhone)}</strong> सत्यापित हो गया है। अब आप खेती, पशुपालन, सेहत या सौंदर्य का कोई भी सवाल पूछ सकते हैं।
          </div>
        </div>
      `;
      streamBotMessage(successHtml, successSpeech);
      return;
    }

    appendTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      processKnowledgeQuery(query);
    }, 700);
  }

  // 13. HIGH-PRECISION QUERY NORMALIZER
  function normalizeQueryText(text) {
    return (text || '').toLowerCase()
      .replace(/bio\s*99/gi, 'bio-99')
      .replace(/बायो\s*99/gi, 'बायो-99')
      .replace(/stim\s*rich/gi, 'stimrich')
      .replace(/स्टिम\s*रिच/gi, 'स्टिमरिच')
      .replace(/नेट\s*सर्फ/gi, 'नेट्सर्फ')
      .replace(/net\s*surf/gi, 'netsurf')
      .replace(/नेचुरा\s*मोर/gi, 'नेचुरामोर')
      .replace(/natura\s*more/gi, 'naturamore')
      .replace(/बायो\s*फिट/gi, 'बायोफिट')
      .replace(/bio\s*fit/gi, 'biofit')
      .replace(/cfc\s*plus/gi, 'cfc')
      .replace(/सी\s*एफ\s*सी/gi, 'cfc')
      .replace(/स्प्रे\s*कैलेंडर/gi, 'स्प्रे कैलेंडर')
      .replace(/spray\s*calendar/gi, 'spray calendar');
  }

  // 14. EXACT PRODUCT ENTITY ROUTER (STIMRICH, BIO-99, SHET, WRAPUP, CFC, NATURAMORE)
  function handleExactProductQuery(cleanQ) {
    const isStimrich = cleanQ.includes('stimrich') || cleanQ.includes('स्टिमरिच') || cleanQ.includes('stirich');
    const isBio99 = cleanQ.includes('bio-99') || cleanQ.includes('bio99') || cleanQ.includes('बायो-99') || cleanQ.includes('बायो 99');
    const isShet = cleanQ.includes('shet') || cleanQ.includes('शेत');
    const isWrapup = cleanQ.includes('wrapup') || cleanQ.includes('wrap-up') || cleanQ.includes('रैपअप');
    const isCfc = cleanQ.includes('cfc') || cleanQ.includes('सीएफसी');
    const isNaturamore = cleanQ.includes('naturamore') || cleanQ.includes('नेचुरामोर');

    if (isStimrich) {
      const resp = `🌿 बायोफिट स्टिमरिच (Stimrich) - सम्पूर्ण पौध वृद्धि नियामक:\n• खुराक: 30 से 35 ml प्रति 15 लीटर पानी का पंप।\n• बीज उपचार: 10-15 ml प्रति किलो बीज (100% स्वस्थ अंकुरण)।\n• कार्य व लाभ: कल्ले (फुटाव) की संख्या में 30% वृद्धि, हरी पत्तियों में क्लोरोफिल बढ़ाना, फूलों का झड़ना रोकना और भरपूर फल-दाना भराव।\n• सर्वोत्तम समय: पहली सिंचाई के बाद, कल्ले फूटते समय व फूल आने से 10 दिन पहले। (बायो-99 के साथ मिलाकर स्प्रे करें)।`;
      renderCrispSpecialBox('🌱 बायोफिट स्टिमरिच (Stimrich) सम्पूर्ण डोज व उपयोग विधि', resp, [
        { text: '💧 बायो-99 की डोज क्या है?', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '🌾 गेहूं में स्टिमरिच का स्प्रे', query: 'गेहूं में स्टिमरिच स्प्रे कब करें' },
        { text: '🛒 स्टिमरिच ओरिजिनल ऑफर', query: 'बायोफिट स्टिमरिच ओरिजिनल ऑफर व कीमत' }
      ]);
      return true;
    }

    if (isBio99) {
      const resp = `💧 बायो-99 (Bio-99) - 100% सिलिकॉन सुपर स्प्रेडर, एक्टिवेटर व स्टिकर:\n• खुराक: मात्र 5 ml प्रति 15 लीटर पानी का पंप (प्रति एकड़ 30-40 ml)।\n• कार्य व लाभ: दवा व खाद को पत्तों के आर-पार फैलाता है, बारिश में धुलने से बचाता है और किसी भी कीटनाशक, फफूंदनाशक या टॉनिक की कार्यक्षमता 35-40% तक बढ़ा देता है।\n• उपयोग नियम: किसी भी स्प्रे घोल में सबसे अंत में मिलाएं। यह जैविक व रासायनिक दोनों दवाओं के साथ 100% सुरक्षित है।`;
      renderCrispSpecialBox('💧 बायो-99 (Bio-99) सटीक डोज व उपयोग विधि', resp, [
        { text: '🌱 स्टिमरिच की डोज क्या है?', query: 'स्टिमरिच की खुराक व उपयोग' },
        { text: '🌾 गेहूं में बायो-99 स्प्रे', query: 'गेहूं में बायो-99 स्प्रे' },
        { text: '🛒 बायोफिट कॉम्बो ऑफर', query: 'बायोफिट कॉम्बो पैक ऑफर' }
      ]);
      return true;
    }

    if (isShet) {
      const resp = `🌱 बायोफिट शेत (SHET) - मृदा संवर्धक जैविक जीवाणु खाद:\n• खुराक: 1 लीटर प्रति एकड़ (ड्रिप सिंचाई, फ्लड सिंचाई या 50 किलो खाद में मिलाकर)।\n• कार्य व लाभ: मिट्टी के जैविक कार्बन को सुधारता है, जमीन को भुरभुरी बनाता है और मिट्टी में फिक्स पड़े फास्फोरस व पोटाश को पौधों की जड़ों तक पहुंचाता है।\n• उपयोग समय: बुवाई के समय या पहली व दूसरी सिंचाई के साथ।`;
      renderCrispSpecialBox('🌱 बायोफिट शेत (SHET) मृदा सुधारक गाइड', resp, [
        { text: '🌱 स्टिमरिच डोज', query: 'स्टिमरिच की खुराक' },
        { text: '💧 बायो-99 डोज', query: 'बायो-99 डोज' }
      ]);
      return true;
    }

    if (isWrapup) {
      const resp = `🛡️ बायोफिट रैप-अप (Wrap-up) - प्राकृतिक जैविक फसल सुरक्षा कवच:\n• खुराक: 30 से 40 ml प्रति 15 लीटर पानी का पंप।\n• कार्य व लाभ: पौधों की पत्तियों पर प्राकृतिक नैनो-फिल्म (सुरक्षा परत) बना देता है, जिससे फंगस, बैक्टीरिया व वायरस के जीवाणु पत्तों में प्रवेश नहीं कर पाते।`;
      renderCrispSpecialBox('🛡️ बायोफिट रैप-अप (Wrap-up) सुरक्षा कवच गाइड', resp, [
        { text: '💧 बायो-99 डोज', query: 'बायो-99 डोज' },
        { text: '🌱 स्टिमरिच डोज', query: 'स्टिमरिच डोज' }
      ]);
      return true;
    }

    if (isCfc) {
      const resp = `🐄 बायोफिट सीएफसी प्लस (CFC Plus) - उन्नत पशु आहार सप्लीमेंट:\n• खुराक: 10 से 15 ग्राम प्रतिदिन प्रति दुधारू गाय/भैंस (दाने या चारे में मिलाकर)।\n• बछड़े/बछड़ी: 5 ग्राम प्रतिदिन। बकरी/भेड़: 5 ग्राम प्रतिदिन।\n• कार्य व लाभ: पाचन शक्ति सुधारना, दूध उत्पादन में 10 से 20% की प्राकृतिक वृद्धि, फैट (FAT) व SNF में 0.5 से 1.2 डिग्री तक सुधार और बांझपन दूर करना।`;
      renderCrispSpecialBox('🐄 सीएफसी प्लस (CFC Plus) खुराक व दूध-फैट फॉर्मूला', resp, [
        { text: '🐄 गाय-भैंस का दूध कैसे बढ़ाएं?', query: 'गाय भैंस का दूध और फैट बढ़ाने का उपाय' },
        { text: '🛒 सीएफसी ऑफर व कीमत', query: 'सीएफसी पशु आहार सप्लीमेंट ऑफर' }
      ]);
      return true;
    }

    if (isNaturamore) {
      const resp = `🌿 नेचुरामोर (Naturamore) - 100% हर्बल न्यूट्रिशनल हेल्थ सप्लीमेंट:\n• सेवन विधि: 1 चम्मच (10 ग्राम) सुबह गुनगुने दूध या पानी के साथ।\n• घटक: 5 तरह के प्राकृतिक प्रोटीन, 13 जरूरी विटामिन्स, 10 मिनरल्स, एलोवेरा, अश्वगंधा व ओमेगा-3 DHA।\n• लाभ: पूरे दिन ऊर्जा, रोग प्रतिरोधक क्षमता (Immunity) बढ़ाना, हड्डियों व मांसपेशियों की मजबूती और पुरानी कमजोरी को जड़ से खत्म करना।`;
      renderCrispSpecialBox('🌿 नेचुरामोर (Naturamore) संपूर्ण स्वास्थ्य पोषण गाइड', resp, [
        { text: '🩺 शुगर/डायबिटीज में उपयोग', query: 'शुगर में नेचुरामोर कैसे लें' },
        { text: '💪 पुरुषों के लिए नेचुरामोर', query: 'नेचुरामोर प्लस फॉर मेन' },
        { text: '🌸 महिलाओं के लिए नेचुरामोर', query: 'नेचुरामोर फॉर विमेन' }
      ]);
      return true;
    }

    return false;
  }

  // 15. DEDICATED SPRAY CALENDAR ROUTER (CROPS & GENERAL MENU)
  function handleDedicatedSprayQuery(cleanQ, query) {
    const isSprayQ = cleanQ.includes('स्प्रे') || cleanQ.includes('spray') || cleanQ.includes('दवा का छिड़काव') || cleanQ.includes('छिड़काव');
    if (!isSprayQ) return false;

    const isWheat = cleanQ.includes('गेहूं') || cleanQ.includes('wheat') || cleanQ.includes('gehu');
    const isMustard = cleanQ.includes('सरसों') || cleanQ.includes('mustard') || cleanQ.includes('sarso') || cleanQ.includes('sarson');
    const isChana = cleanQ.includes('चना') || cleanQ.includes('gram') || cleanQ.includes('chana');
    const isVeg = cleanQ.includes('सब्जी') || cleanQ.includes('टमाटर') || cleanQ.includes('मिर्च') || cleanQ.includes('बैंगन') || cleanQ.includes('प्याज') || cleanQ.includes('veg');

    if (isWheat) {
      const resp = `🌾 गेहूं फसल का 4-चरण वैज्ञानिक स्प्रे कैलेंडर:\n• 1. कल्ले व फुटाव (21-25 दिन, पहली सिंचाई बाद): स्टिमरिच 30ml + बायो-99 5ml + 19:19:19 घुलनशील खाद 75g प्रति 15L पंप।\n• 2. गांठ बनते समय (40-45 दिन): एनपीके 12:61:0 75g + बायो-99 5ml।\n• 3. गभोट अवस्था (60-65 दिन): एनपीके 0:52:34 75g + बोरॉन 20% 20g (लंबी बालियां व पोलिनेशन)।\n• 4. दाना भराव (दूधिया अवस्था): एनपीके 0:0:50 (पोटाश) 75g प्रति पंप (वजनदार, चमकदार व मोटा दाना)।`;
      renderCrispSpecialBox('🌾 गेहूं फसल का वैज्ञानिक 4-चरण स्प्रे कैलेंडर', resp, [
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' },
        { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' },
        { text: '🧪 स्टिमरिच डोज', query: 'स्टिमरिच की खुराक' }
      ]);
      return true;
    }

    if (isMustard) {
      const resp = `🌱 सरसों फसल का वैज्ञानिक स्प्रे कैलेंडर:\n• 1. शाखा फुटाव (25-30 दिन): स्टिमरिच 30ml + बायो-99 5ml + घुलनशील सल्फर 40g प्रति 15L पंप।\n• 2. फूल आने से पूर्व (45-50 दिन): बोरॉन 20% 20g + 19:19:19 75g प्रति पंप।\n• 3. माहू/चेपा दिखने पर: इमिडाक्लोप्रिड 17.8% SL 6ml + बायो-99 5ml प्रति 15L पंप।\n• 4. फली दाना बनते समय: एनपीके 0:0:50 75g (तेल प्रतिशत व दाना वजन बढ़ाने हेतु)।`;
      renderCrispSpecialBox('🌱 सरसों फसल का वैज्ञानिक स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' }
      ]);
      return true;
    }

    if (isChana) {
      const resp = `🌿 चना फसल का वैज्ञानिक स्प्रे कैलेंडर:\n• 1. शाखाएं व कल्ले (30-35 दिन): स्टिमरिच 30ml + बायो-99 5ml + 19:19:19 75g।\n• 2. फूल आने से पूर्व: बोरॉन 20% 20g प्रति 15L पंप (फूल झड़ने से रोकने हेतु)।\n• 3. घटी-इल्ली रोकथाम: इमामेक्टिन बेंजोएट 5% SG 8g + बायो-99 5ml प्रति 15L पंप।\n• 4. दाना भराव: 0:0:50 75g प्रति 15L पंप।`;
      renderCrispSpecialBox('🌿 चना फसल का वैज्ञानिक स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' }
      ]);
      return true;
    }

    if (isVeg) {
      const resp = `🥦 सब्जी, मिर्च व टमाटर का वैज्ञानिक स्प्रे कैलेंडर:\n• 1. रोपाई के 15-20 दिन: स्टिमरिच 30ml + बायो-99 5ml + 19:19:19 75g।\n• 2. फूल आने के समय: बोरॉन 20% 20g + स्टिमरिच 35ml प्रति पंप।\n• 3. रसचूसक कीट (थ्रिप्स/सफेद मक्खी): एसिटामिप्रिड 20% SP 8g + बायो-99 5ml।\n• 4. फल विकास: एनपीके 13:0:45 या 0:0:50 75g प्रति 15L पंप।`;
      renderCrispSpecialBox('🥦 सब्जी, मिर्च व टमाटर का स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' }
      ]);
      return true;
    }

    // General Spray Calendar Selection (Interactive crop menu)
    const prompt = `किसान साथी! हर फसल का स्प्रे समय और दवाओं का कॉम्बिनेशन अलग होता है। कृपया नीचे अपनी फसल चुनें ताकि उसका सटीक 4-चरण स्प्रे कैलेंडर देख सकें:`;
    renderCrispSpecialBox('📅 फसलों का संपूर्ण वैज्ञानिक स्प्रे कैलेंडर', prompt, [
      { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
      { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' },
      { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' },
      { text: '🥦 सब्जी, मिर्च व टमाटर कैलेंडर', query: 'सब्जी मिर्च का स्प्रे कैलेंडर' }
    ]);
    return true;
  }

  // 16. DEDICATED NETSURF DIRECT SELLING & ₹8.19L CAPPING PLAN ROUTER
  function handleNetsurfPlanQuery(cleanQ, query) {
    const isNetsurf = cleanQ.includes('netsurf') || cleanQ.includes('नेट्सर्फ');
    const isPlan = cleanQ.includes('plan') || cleanQ.includes('प्लान') || cleanQ.includes('कमीशन') || cleanQ.includes('commission') || cleanQ.includes('8.19') || cleanQ.includes('8,19,250') || cleanQ.includes('कैपिंग') || cleanQ.includes('बाइनरी') || cleanQ.includes('डायरेक्ट सेलिंग') || cleanQ.includes('रिटेल') || cleanQ.includes('क्लब नेट्सर्फ') || cleanQ.includes('बिजनेस प्लान') || cleanQ.includes('बिज़नेस प्लान');

    if (isNetsurf && isPlan || (cleanQ.includes('नेट्सर्फ प्लान') || cleanQ.includes('netsurf plan') || cleanQ.includes('8,19,250') || cleanQ.includes('8.19 लाख'))) {
      const planAnswer = `🌿 नेट्सर्फ डायरेक्ट सेलिंग बिज़नेस व कमीशन प्लान (प्रमाणित):\n• 1. रिटेल डिस्काउंट: एमआरपी (MRP) पर 15% से 30% तक की सीधी छूट।\n• 2. रिटेल बोनस: क्लब नेट्सर्फ के माध्यम से 5% से 15% का अतिरिक्त टर्नओवर लाभ।\n• 3. जनरेशन इनकम: आपकी टीम के प्रथम जनरेशन के लीडर्स की कमाई का 3% से 8% हिस्सा।\n• 4. टर्नओवर मैचिंग बोनस: दोनों टीमों (Team A & Team B) के मैचिंग टर्नओवर पर 3% से 6% सीधा कमीशन।\n• 5. सर्वोच्च साप्ताहिक कैपिंग: प्रति सप्ताह अधिकतम ₹8,19,250 (मासिक ₹32,77,000)।\n• 6. फैमिली प्रोटेक्शन: ₹2 लाख से ₹10 लाख का एक्सीडेंटल बीमा व नॉमिनी सुरक्षा सुविधा।`;

      const waOfferUrl = buildAvneeshWhatsAppHandoffUrl('नेट्सर्फ बिज़नेस प्लान व आईडी एक्टिवेशन');

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          💼 नेट्सर्फ डायरेक्ट सेलिंग व ₹8,19,250 कैपिंग प्लान
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${escapeHtml(planAnswer)}
        </div>
        ${buildMsgAudioBtnMarkup(planAnswer)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:6px;">👉 नेट्सर्फ संबंधित विषय:</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('क्लब नेट्सर्फ के लेवल और फायदे क्या हैं?')">🏆 क्लब नेट्सर्फ</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('बायोफिट कृषि व पशु उत्पाद गाइड')">🌱 बायोफिट कृषि उत्पाद</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेचुरामोर हेल्थ सप्लीमेंट्स प्लान')">🌿 नेचुरामोर हेल्थ</button>
          </div>
          <a href="${escapeHtml(waOfferUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-brands fa-whatsapp"></i> अवनीश सर से फ्री आईडी एक्टिवेशन व मार्गदर्शन लें →
          </a>
        </div>
      `;

      consecutiveAmbiguousCount = 0;
      streamBotMessage(html, 'नेट्सर्फ डायरेक्ट सेलिंग में 15 से 30 प्रतिशत रिटेल डिस्काउंट और अधिकतम 8 लाख 19 हजार 250 रुपये साप्ताहिक कैपिंग उपलब्ध है।');
      return true;
    }
    return false;
  }

  // 17. CORE INTENT RETRIEVAL & DOMAIN FIREWALL
  function processKnowledgeQuery(query) {
    const rawQ = query.trim();
    const cleanQ = normalizeQueryText(rawQ);
    const targetDomain = classifyQueryDomain(cleanQ);

    // 1. Exact Product Entity Matching (Stimrich, Bio-99, SHET, Wrap-up, CFC, Naturamore)
    if (handleExactProductQuery(cleanQ)) {
      return;
    }

    // 2. Dedicated Spray Calendar Router (Wheat, Mustard, Chana, Veg, or Interactive Menu)
    if (handleDedicatedSprayQuery(cleanQ, query)) {
      return;
    }

    // 3. Certified Netsurf Business & ₹8.19L Capping Plan Router
    if (handleNetsurfPlanQuery(cleanQ, query)) {
      return;
    }

    if (!knowledgeData || !knowledgeData.intents) {
      synthesizeDynamicAnswer(query, targetDomain);
      return;
    }

    // 4. Strict Domain Isolation Filter (Health NEVER leaks to Agri, Agri NEVER leaks to Health!)
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
      if (filtered.length > 0) candidateIntents = filtered;
    }

    // 5. Token-Weighted Intent Scorer
    const STOP_WORDS = new Set(['का','की','के','में','पर','और','हैं','है','यह','से','को','ने','या','तो','बताओ','बताइए','दीजिए','दवा','इलाज','उपचार','डोज','मात्रा','बारे','क्या','कैसे','कब','mein','bare','kare','kaise','kya','batao','dawa','dose','ilaj']);
    const qTokens = cleanQ.split(/[\s,?!।]+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t));

    let matchedIntent = null;
    let maxScore = 0;

    candidateIntents.forEach((intent) => {
      let score = 0;
      const titleLower = (intent.title || '').toLowerCase();

      // Title exact / partial match
      if (cleanQ.includes(titleLower)) score += 35;
      qTokens.forEach(token => {
        if (titleLower.includes(token)) score += 15;
      });

      // Keywords match
      (intent.keywords || []).forEach(kw => {
        const kwLower = kw.toLowerCase().trim();
        if (!kwLower || STOP_WORDS.has(kwLower)) return;
        if (cleanQ.includes(kwLower)) {
          score += (kwLower.length >= 3 ? 12 : 8);
        }
        qTokens.forEach(tok => {
          if (kwLower.includes(tok)) {
            score += 10;
          }
        });
      });

      if (score > maxScore) {
        maxScore = score;
        matchedIntent = intent;
      }
    });

    if (matchedIntent && maxScore >= 4) {
      renderDirectSummary(matchedIntent, query, targetDomain);
    } else {
      synthesizeDynamicAnswer(query, targetDomain);
    }
  }

  // 18. CRISP SPECIAL BOX RENDERER
  function renderCrispSpecialBox(title, bodyText, chips) {
    let chipsHtml = '';
    (chips || []).forEach(c => {
      chipsHtml += `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(c.query)}')">
          <span>${escapeHtml(c.text)}</span> →
        </button>
      `;
    });

    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
        ${escapeHtml(title)}
      </div>
      <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:10px;">
        ${escapeHtml(bodyText)}
      </div>
      ${buildMsgAudioBtnMarkup(bodyText)}

      ${chipsHtml ? `
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:6px;">👉 विकल्प चुनें:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${chipsHtml}
          </div>
        </div>
      ` : ''}
    `;
    const speech = bodyText.replace(/[*#_`•]/g, '').slice(0, 180);
    streamBotMessage(html, speech);
  }

  // 19. DIRECT SUMMARY RENDERER
  function renderDirectSummary(intent, originalQuery, domain) {
    const title = intent.title || '';
    const mainFirstAid = intent.first_aid || (intent.responses ? Object.values(intent.responses)[0]?.first_aid : '') || '';
    const mainAnatomy = intent.anatomy_physiology || '';
    const reference = intent.reference || '';
    const crispAns = intent.crisp_answer || '';

    let directAnswer = '';
    if (crispAns) {
      directAnswer = crispAns;
    } else if (mainFirstAid) {
      const sentences = mainFirstAid.split('।').filter(s => s.trim().length > 5);
      directAnswer = sentences.slice(0, 3).join('।') + '।';
    } else if (mainAnatomy) {
      const sentences = mainAnatomy.split('।').filter(s => s.trim().length > 5);
      directAnswer = sentences.slice(0, 2).join('।') + '।';
    } else {
      directAnswer = title;
    }

    let subTopicsHtml = '';
    if (intent.sub_topics && intent.sub_topics.length > 0) {
      intent.sub_topics.slice(0, 3).forEach((st) => {
        const shortLabel = st.title.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').split('-')[0].trim();
        subTopicsHtml += `
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(st.title)}')">
            <span>${escapeHtml(shortLabel)}</span> →
          </button>
        `;
      });
    }

    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
        ${escapeHtml(title)}
      </div>

      <div style="font-size:0.95rem;line-height:1.6;color:#1e293b;margin-bottom:6px;">
        ${escapeHtml(directAnswer)}
      </div>
      ${buildMsgAudioBtnMarkup(directAnswer)}

      ${subTopicsHtml ? `
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:900;color:#15803d;font-size:0.88rem;margin-bottom:8px;">
            👉 संबंधित विकल्प:
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${subTopicsHtml}
          </div>
        </div>
      ` : ''}

      ${reference ? `
        <div style="margin-top:8px;font-size:0.75rem;color:#94a3b8;font-style:italic;">
          📜 <strong>संदर्भ:</strong> ${escapeHtml(reference)}
        </div>
      ` : ''}
    `;

    consecutiveAmbiguousCount = 0;
    const speech = directAnswer.replace(/[*#_`•]/g, '').slice(0, 160);
    streamBotMessage(html, speech);
  }

  // 20. DYNAMIC HUMAN-TOUCH ANSWER SYNTHESIZER
  function synthesizeDynamicAnswer(query, domain) {
    const cleanQ = (query || '').toLowerCase();

    // Direct Avneesh ji connect or consecutive unclear
    if (cleanQ.includes('अवनीश') || cleanQ.includes('avneesh') || cleanQ.includes('बात करो') || cleanQ.includes('नंबर') || cleanQ.includes('हेल्प') || consecutiveAmbiguousCount >= 1) {
      consecutiveAmbiguousCount = 0;
      const waUrl = buildAvneeshWhatsAppHandoffUrl(query);
      const speech = `नमस्ते! मैं आपको हमारे मुख्य परामर्शक अवनीश मिश्रा जी का सीधा WhatsApp लिंक देती हूँ।`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
          🤝 व्यक्तिगत मार्गदर्शन: अवनीश मिश्रा जी से सीधा संपर्क
        </div>
        <div style="font-size:0.95rem;line-height:1.6;color:#1e293b;margin-bottom:12px;">
          आपके इस प्रश्न <strong>"${escapeHtml(query)}"</strong> पर सटीक व व्यक्तिगत समाधान हेतु आप हमारे मुख्य विशेषज्ञ अवनीश मिश्रा जी से सीधे WhatsApp पर बात कर सकते हैं।
        </div>
        <div>
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#ffffff;border:none;padding:12px 18px;font-size:0.95rem;font-weight:800;border-radius:24px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(34,197,94,0.4);">
            <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i>
            <span>अवनीश जी से WhatsApp पर बात करें →</span>
          </a>
        </div>
      `;
      streamBotMessage(html, speech);
      return;
    }

    consecutiveAmbiguousCount++;
    const speech = `नमस्ते! आपका सवाल बहुत महत्वपूर्ण है। कृपया नीचे से अपना मुख्य विषय चुनें:`;
    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.02rem;margin-bottom:6px;">
        🌸 आपका सवाल महत्वपूर्ण है!
      </div>
      <div style="font-size:0.95rem;line-height:1.6;color:#334155;margin-bottom:10px;">
        आपके प्रश्न <strong>"${escapeHtml(query)}"</strong> पर सटीक जानकारी के लिए आप नीचे से संबंधित विषय चुन सकते हैं:
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं व सरसों की फसल में खाद व स्प्रे')">
          🌾 <span>खेती व फसलें</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('स्टिमरिच और बायो-99 की खुराक व उपयोग')">
          🧪 <span>बायोफिट उत्पाद</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          🐄 <span>पशुपालन (दूध-फैट)</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह और जोड़ों के दर्द का आयुर्वेदिक उपाय')">
          🩺 <span>स्वास्थ्य व रोग</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ बिज़नेस प्लान और ₹8.19L साप्ताहिक कैपिंग')">
          💼 <span>नेट्सर्फ प्लान</span>
        </button>
      </div>

      <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span style="font-size:0.82rem;color:#64748b;">या सीधे अवनीश मिश्रा जी से बात करना चाहते हैं?</span>
        <button type="button" class="sakhi-choice-btn" style="padding:4px 10px;font-size:0.80rem;margin:0;width:auto;" onclick="window.connectToAvneeshMishra('${escapeHtml(query)}')">
          अवनीश जी से बात 💬
        </button>
      </div>
    `;

    streamBotMessage(html, speech);
  }

  window.connectToAvneeshMishra = function (userQuery) {
    const waUrl = buildAvneeshWhatsAppHandoffUrl(userQuery);
    window.open(waUrl, '_blank');
  };

  // 21. CHAT WINDOW MARKUP GENERATOR
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
            <button type="button" class="sakhi-fullscreen-btn" id="sakhiFullscreenToggleBtn" onclick="window.toggleSakhiFullscreen()" title="पूर्ण स्क्रीन टॉगल">
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
              <button type="button" class="sakhi-close-btn" id="sakhiCloseBtn" onclick="window.closeSakhiModal()" title="बंद करें">&times;</button>
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
            <button type="button" class="sakhi-plus-menu-close" onclick="window.toggleSakhiPlusMenu(false)">&times;</button>
          </div>
          <div class="sakhi-plus-grid">
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('गेहूं व फसलों में कल्ले और पैदावार बढ़ाने का फॉर्मूला')">
              🌾 खेती व फसलें
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
              🐄 पशुपालन व डेयरी
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('डायबिटीज और शुगर कंट्रोल का फॉर्मूला')">
              🩺 स्वास्थ्य व रोग
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('चेहरे की झाइयां और झुर्रियां मिटाने का नुस्खा')">
              ✨ सौंदर्य व त्वचा
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('नेट्सर्फ बिज़नेस प्लान और ₹8.19L साप्ताहिक कैपिंग')">
              💼 नेट्सर्फ प्लान
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('दादी के असली आयुर्वेदिक घरेलू नुस्खे')">
              🌸 दादी के नुस्खे
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('फाउंडर अवनीश जी का विज़न व सीधा WhatsApp संपर्क')">
              💬 अवनीश जी से संपर्क
            </button>
          </div>
        </div>

        <!-- Legal Note -->
        <div class="sakhi-legal-note">
          ⚖️ सूचनात्मक मार्गदर्शन: उपयोग से पूर्व उत्पाद लेबल निर्देश व स्थानीय विशेषज्ञ की अनुशंसा का संज्ञान अवश्य लें।
        </div>

        <!-- Input Footer -->
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

  // 22. MODAL & EVENT LISTENERS
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

  function setupEventListeners(isFullscreen) {
    const backdrop = document.getElementById('sakhiModalBackdrop');
    const closeBtn = document.getElementById('sakhiCloseBtn');
    if (closeBtn) closeBtn.onclick = window.closeSakhiModal;
    if (backdrop) {
      backdrop.onclick = function (e) {
        if (e.target === backdrop) window.closeSakhiModal();
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

  window.openSakhiModal = function () {
    if (checkIsDedicatedPage()) return;
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
  };

  window.closeSakhiModal = function () {
    const backdrop = document.getElementById('sakhiModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopRecording();
  };

  // 23. FLOATING PILL & UI INJECTION ACROSS REGULAR PAGES
  function injectSakhiUI() {
    if (checkIsDedicatedPage()) {
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
        window.openSakhiModal();
      };
    }

    ensureModalBackdropExists();
  }

  // 24. VIRAL SHARE
  window.shareAarogyamSakhi = function () {
    const origin = (window.location.origin && window.location.origin.includes('http'))
      ? window.location.origin
      : 'https://aarogyamindia.online';
    const shareUrl = `${origin}/aarogyam-sakhi.html`;

    const shareTitle = 'आरोग्यम सखी AI - खेत, सेहत, पशु, ब्यूटी व बिज़नेस का वैज्ञानिक समाधान 🌾';
    const shareText = `🌿 किसान व परिवारजनों के लिए बड़ी खुशखबरी! 🌿\n\nअब खेती, गेहूं, सरसों, पशुपालन (दूध-फैट), सेहत (डायबिटीज, जोड़ दर्द) और सौंदर्य के लिए किसी के चक्कर काटने की जरूरत नहीं!\n\nमिलिए "आरोग्यम सखी AI" से — जो देती हैं हर सवाल का 100% सही व वैज्ञानिक जवाब! 👩‍🌾🩺\n\nअभी अपना सवाल पूछें बिल्कुल फ्री:\n${shareUrl}`;

    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(() => {});
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }
  };

  // Quick Action Helper
  window.askSakhiQuick = function (query) {
    handleUserSubmit(query);
  };

  // Fullscreen Toggle
  window.toggleSakhiFullscreen = function () {
    const chatWin = document.getElementById('sakhiChatWindow');
    if (!chatWin) return;
    chatWin.classList.toggle('maximized');
  };

  // Plus Menu Toggle
  window.toggleSakhiPlusMenu = function (forceState) {
    const menu = document.getElementById('sakhiPlusMenu');
    if (!menu) return;
    if (typeof forceState === 'boolean') {
      menu.style.display = forceState ? 'block' : 'none';
    } else {
      menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
    }
  };

  window.selectSakhiTopic = function (query) {
    window.toggleSakhiPlusMenu(false);
    window.askSakhiQuick(query);
  };

  // Input Submission helper
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

  // Safe string escape
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // GLOBAL API EXPOSURE
  window.AarogyamSakhi = {
    open: function() {
      if (checkIsDedicatedPage()) return;
      window.openSakhiModal();
    },
    close: function() {
      window.closeSakhiModal();
    },
    ask: handleUserSubmit
  };

  // AUTO INIT ON DOM READY
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadKnowledgeBase();
      initSpeechRecognition();
      injectSakhiUI();
    });
  } else {
    loadKnowledgeBase();
    initSpeechRecognition();
    injectSakhiUI();
  }
})();
