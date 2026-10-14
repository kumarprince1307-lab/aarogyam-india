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

  // Multi-Turn Conversation Memory State
  const sakhiConversationState = {
    lastActiveDomain: null,
    lastActiveEntity: null,
    lastActiveEntityName: '',
    lastActiveCrop: null,
    lastAnswerSnippet: '',
    history: []
  };

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

  // 8. TEXT-TO-SPEECH (TTS) CLEANER & SPEECH ENGINE
  function cleanTextForTTS(rawText) {
    if (!rawText) return '';
    let t = String(rawText);

    // 1. Remove HTML tags
    t = t.replace(/<[^>]*>/g, ' ');

    // 2. Fix NPK Ratios & Time-Like Colon Patterns (Prevent "19 bajke 19 minute 19 second")
    t = t.replace(/\b19\s*:\s*19\s*:\s*19\b/gi, 'उन्नीस उन्नीस उन्नीस')
         .replace(/\b0\s*:\s*52\s*:\s*34\b/gi, 'जीरो बावन चौंतीस')
         .replace(/\b0\s*:\s*0\s*:\s*50\b/gi, 'जीरो जीरो पचास')
         .replace(/\b12\s*:\s*61\s*:\s*0\b/gi, 'बारह इकसठ जीरो')
         .replace(/\b13\s*:\s*0\s*:\s*45\b/gi, 'तेरह जीरो पैंतालीस')
         .replace(/\b(\d+)\s*:\s*(\d+)\s*:\s*(\d+)\b/g, '$1 $2 $3')
         .replace(/\b(\d+)\s*:\s*(\d+)\b/g, '$1 अनुपात $2');

    // 3. Fix '+' symbol (Prevent TTS reading it as 'जोड़')
    // e.g. "स्टिमरिच + बायो-99" -> "स्टिमरिच और बायो-99"
    t = t.replace(/\s*\+\s*/g, ' और ');

    // 4. Strip ALL Unicode Emojis (Prevents TTS reading emojis as "jadi buti", "haddi", etc.)
    t = t.replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{200D}\u{FE0F}]/gu, '');

    // 5. Clean arrows, bullets, symbols & markdown
    t = t.replace(/[→⇒•●★☆✔✓👉👉🏻👉🏼👉🏽👉🏾👉🏿]/gu, ' ')
         .replace(/[*#_~`|]/g, ' ')
         .replace(/\s+/g, ' ')
         .trim();

    return t;
  }

  // 8. TEXT-TO-SPEECH (TTS) CLEANER & CONTINUOUS SPEECH ENGINE
  let speechChunkWatchdog = null;
  window._sakhiSpeechUtterances = [];

  function stopAllSpeech() {
    if (speechChunkWatchdog) {
      clearTimeout(speechChunkWatchdog);
      speechChunkWatchdog = null;
    }
    window._sakhiSpeechUtterances = [];
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    const avatar = document.getElementById('sakhiAvatarFrame');
    if (avatar) avatar.classList.remove('speaking');
    if (activeSpeechBtn) {
      activeSpeechBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>सुनें</span>';
      activeSpeechBtn.classList.remove('speaking');
      activeSpeechBtn = null;
    }
  }

  function getBestHindiVoice() {
    if (!window.speechSynthesis) return null;
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const hi = voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN' || (v.lang && v.lang.startsWith('hi')));
      if (hi) return hi;
      const inEn = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN');
      if (inEn) return inEn;
    } catch (e) {}
    return null;
  }

  function splitTextIntoSentences(text) {
    if (!text) return [];
    // Split on Hindi purna viram (।), newline (\n), question (?), exclamation (!), semicolon (;)
    const rawTokens = text.split(/([।\n?!;]+)/);
    const chunks = [];
    let current = '';

    for (let i = 0; i < rawTokens.length; i++) {
      const tok = rawTokens[i];
      if (/^[।\n?!;]+$/.test(tok)) {
        current += tok;
        const trimmed = current.trim();
        if (trimmed) chunks.push(trimmed);
        current = '';
      } else {
        if (tok.length > 85) {
          const parts = tok.split(/([,]+)/);
          for (let j = 0; j < parts.length; j++) {
            current += parts[j];
            if (current.length >= 65 || parts[j] === ',') {
              const tr = current.trim();
              if (tr) chunks.push(tr);
              current = '';
            }
          }
        } else {
          current += tok;
        }
      }
    }
    if (current.trim()) {
      chunks.push(current.trim());
    }
    return chunks.length > 0 ? chunks : [text];
  }

  function playChunkedSpeech(text, onStart, onFinish) {
    if (!window.speechSynthesis || !text) {
      if (typeof onFinish === 'function') onFinish();
      return;
    }

    stopAllSpeech();

    const cleanText = cleanTextForTTS(text);
    if (!cleanText) {
      if (typeof onFinish === 'function') onFinish();
      return;
    }

    const chunks = splitTextIntoSentences(cleanText);
    if (!chunks.length) {
      if (typeof onFinish === 'function') onFinish();
      return;
    }

    // Small delay ensures previous speech synthesizer queue is flushed
    setTimeout(() => {
      if (typeof onStart === 'function') onStart();
      let currentIndex = 0;

      function speakNextChunk() {
        if (speechChunkWatchdog) {
          clearTimeout(speechChunkWatchdog);
          speechChunkWatchdog = null;
        }

        if (currentIndex >= chunks.length) {
          stopAllSpeech();
          if (typeof onFinish === 'function') onFinish();
          return;
        }

        const chunkText = chunks[currentIndex++];
        if (!chunkText || !chunkText.trim()) {
          speakNextChunk();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        const voice = getBestHindiVoice();
        if (voice) utterance.voice = voice;

        // Prevent V8 garbage collection
        window._sakhiSpeechUtterances.push(utterance);

        let advanced = false;
        function proceed() {
          if (advanced) return;
          advanced = true;
          if (speechChunkWatchdog) {
            clearTimeout(speechChunkWatchdog);
            speechChunkWatchdog = null;
          }
          speakNextChunk();
        }

        utterance.onend = proceed;
        utterance.onerror = function (e) {
          if (e && e.error === 'canceled') return;
          proceed();
        };

        // Watchdog: If browser drops onend event, advance automatically after estimated reading time
        const maxTime = Math.max(3000, chunkText.length * 150 + 2000);
        speechChunkWatchdog = setTimeout(() => {
          proceed();
        }, maxTime);

        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          proceed();
        }
      }

      speakNextChunk();
    }, 50);
  }

  function speakResponse(text) {
    if (!isSoundEnabled || !window.speechSynthesis || !text) return;
    playChunkedSpeech(text, () => {
      const avatar = document.getElementById('sakhiAvatarFrame');
      if (avatar) avatar.classList.add('speaking');
    }, () => {
      const avatar = document.getElementById('sakhiAvatarFrame');
      if (avatar) avatar.classList.remove('speaking');
    });
  }

  window.toggleMessageSpeech = function (btn, encodedText) {
    const text = decodeURIComponent(encodedText);
    if (!window.speechSynthesis) return;

    if (activeSpeechBtn === btn && window.speechSynthesis.speaking) {
      stopAllSpeech();
      return;
    }

    if (activeSpeechBtn && activeSpeechBtn !== btn) {
      stopAllSpeech();
    }

    activeSpeechBtn = btn;
    btn.innerHTML = '<i class="fa-solid fa-stop"></i> <span>रोकें</span>';
    btn.classList.add('speaking');

    playChunkedSpeech(text, () => {
      const avatar = document.getElementById('sakhiAvatarFrame');
      if (avatar) avatar.classList.add('speaking');
    }, () => {
      stopAllSpeech();
    });
  };

  function buildMsgAudioBtnMarkup(text) {
    if (!text) return '';
    const cleanForSpeech = cleanTextForTTS(text);
    const enc = encodeURIComponent(cleanForSpeech);
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

          <!-- Quick Topic Pills (Same as Plus Menu) -->
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:10px 12px;margin-bottom:8px;">
            <div style="font-size:0.80rem;font-weight:800;color:#166534;margin-bottom:6px;">👉 मुख्य विषय चुनें:</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं व फसलों में कल्ले और पैदावार बढ़ाने का फॉर्मूला')">🌾 खेती व फसलें</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">🐄 पशुपालन व डेयरी</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('डायबिटीज और शुगर कंट्रोल का फॉर्मूला')">🩺 स्वास्थ्य व रोग</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('चेहरे की झाइयां और झुर्रियां मिटाने का नुस्खा')">✨ सौंदर्य व त्वचा</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ बिज़नेस प्लान और ₹8.19L साप्ताहिक कैपिंग')">💼 नेट्सर्फ प्रोडक्ट्स</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('खेती का डॉक्टर व कृषि ई-बुक्स की जानकारी')">📚 ई-बुक्स</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('दादी के असली आयुर्वेदिक घरेलू नुस्खे')">🌸 दादी के नुस्खे</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('आरोग्यम डिजिटल ई-टेलर व एफिलिएट कमाई')">💰 कमाई व करियर</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('फाउंडर अवनीश जी का विज़न व सीधा WhatsApp संपर्क')">💬 अवनीश जी से संपर्क</button>
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
      .replace(/stirich/gi, 'stimrich')
      .replace(/नेट\s*सर्फ/gi, 'नेट्सर्फ')
      .replace(/net\s*surf/gi, 'netsurf')
      .replace(/नेचुरा\s*मोर/gi, 'नेचुरामोर')
      .replace(/natura\s*more/gi, 'naturamore')
      .replace(/बायो\s*फिट/gi, 'बायोफिट')
      .replace(/bio\s*fit/gi, 'biofit')
      .replace(/cfc\s*plus/gi, 'cfc')
      .replace(/सी\s*एफ\s*सी/gi, 'cfc')
      .replace(/pet\s*vet/gi, 'pet vet')
      .replace(/पेट\s*वेट/gi, 'pet vet')
      .replace(/petvet/gi, 'pet vet')
      .replace(/joint\s*care/gi, 'joint care')
      .replace(/जॉइंट\s*केयर/gi, 'joint care')
      .replace(/जोड़\s*केयर/gi, 'joint care')
      .replace(/nutri\s*heart/gi, 'nutri heart')
      .replace(/न्यूट्री\s*हार्ट/gi, 'nutri heart')
      .replace(/न्यूट्रि\s*हार्ट/gi, 'nutri heart')
      .replace(/anti\s*viral/gi, 'antiviral')
      .replace(/एंटी\s*वायरल/gi, 'antiviral')
      .replace(/tamatr/gi, 'टमाटर')
      .replace(/tamatar/gi, 'टमाटर')
      .replace(/kukda/gi, 'कुकड़ा')
      .replace(/भाटा/gi, 'बैंगन')
      .replace(/bhata/gi, 'बैंगन')
      .replace(/bhate/gi, 'बैंगन')
      .replace(/baigan/gi, 'बैंगन')
      .replace(/baingan/gi, 'बैंगन')
      .replace(/bhindi/gi, 'भिंडी')
      .replace(/ful/gi, 'फूल')
      .replace(/phul/gi, 'फूल')
      .replace(/dudh/gi, 'दूध')
      .replace(/doodh/gi, 'दूध')
      .replace(/gay/gi, 'गाय')
      .replace(/bhains/gi, 'भैंस')
      .replace(/bhes/gi, 'भैंस')
      .replace(/stemal/gi, 'उपयोग')
      .replace(/istemal/gi, 'उपयोग')
      .replace(/mousam/gi, 'मौसम')
      .replace(/mausam/gi, 'मौसम')
      .replace(/hystry/gi, 'history')
      .replace(/स्प्रे\s*कैलेंडर/gi, 'स्प्रे कैलेंडर')
      .replace(/spray\s*calendar/gi, 'spray calendar');
  }

  // 14. EVERYDAY CONVERSATIONS & CASUAL GREETINGS ROUTER (मानवीय व्यावहारिक बातचीत)
  function handleEverydayConversations(cleanQ, rawQ) {
    // 1. "kaise ho" / "kaisi ho" / "kya haal hai"
    if (cleanQ.includes('kaise ho') || cleanQ.includes('kaisi ho') || cleanQ.includes('kya hal') || cleanQ.includes('kya haal') || cleanQ.includes('kaisa chal raha') || cleanQ.includes('how are you') || cleanQ.includes('kaise hain') || cleanQ.includes('आप कैसी हैं') || cleanQ.includes('आप कैसे हैं')) {
      const resp = `नमस्ते! 🙏 मैं बिल्कुल स्वस्थ और आपकी सेवा में सदैव तत्पर हूँ। आप कैसे हैं? आशा है आपकी खेती व परिवार में सब कुशल-मंगल होगा।\n\nआज मैं आपकी खेती (खाद-स्प्रे), पशुपालन (दूध-फैट), सेहत या नेट्सर्फ में किस विषय पर सहायता करूँ?`;
      renderCrispSpecialBox('🌸 आरोग्यम सखी AI — आपका स्वागत है', resp, [
        { text: '🌾 गेहूं/सरसों स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '📚 कृषि ई-बुक्स गाइड', query: 'खेती का डॉक्टर व कृषि ई-बुक्स की जानकारी' },
        { text: '🐄 गाय-भैंस का दूध व फैट बढ़ाना', query: 'गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला' },
        { text: '🩺 जोड़ों का दर्द व गठिया इलाज', query: 'नेचुरामोर जॉइंट केयर के बारे में बताओ' }
      ], 'casual', 'greeting');
      return true;
    }

    // 2. "kya kar rahe ho" / "kya kar rahi ho"
    if (cleanQ.includes('kya kar rahe') || cleanQ.includes('kya kar rahi') || cleanQ.includes('kya karti ho') || cleanQ.includes('kya kaam hai')) {
      const resp = `मैं हमारे किसान साथियों और परिवारों के लिए खेती के वैज्ञानिक स्प्रे, पशुओं में दूध-फैट वृद्धि और आयुर्वेदिक स्वास्थ्य के 100% सटीक व प्रमाणित समाधान तैयार कर रही हूँ! 👩‍🌾✨\n\nबताइए, आज आपकी किस समस्या का समाधान करूँ?`;
      renderCrispSpecialBox('✨ 24×7 वैज्ञानिक AI सहायता', resp, [
        { text: '🌾 फसल में खाद व स्प्रे फॉर्मूला', query: 'फसलों में खाद व स्प्रे फॉर्मूला बताएं' },
        { text: '🐄 पशु पोषण व दूध-फैट सप्लीमेंट', query: 'पेट वेट और सीएफसी प्लस का काम बताओ' },
        { text: '🩺 नेचुरामोर स्वास्थ्य सप्लीमेंट्स', query: 'नेचुरामोर सप्लीमेंट्स की जानकारी' }
      ], 'casual', 'doing');
      return true;
    }

    // 3. "meri bat kisase ho rahi hai" / "tum kaun ho" / "apna parichay do"
    if (cleanQ.includes('kisase ho rahi') || cleanQ.includes('kisse ho rahi') || cleanQ.includes('tum kaun') || cleanQ.includes('apna parichay') || cleanQ.includes('who are you') || cleanQ.includes('apna naam') || cleanQ.includes('naam kya hai') || cleanQ.includes('तुम कौन हो') || cleanQ.includes('मेरी बात किससे')) {
      const resp = `आपकी बात **आरोग्यम सखी AI** से हो रही है — जो आरोग्यम इंडिया का 24×7 समर्पित डिजिटल डॉक्टर व किसान सलाहकार है।\n\nमैं आधुनिक कृषि विज्ञान (फसल रोग, कीटनाशक, जैविक स्प्रे), पशुपालन (दुग्ध वृद्धि), आयुर्वेदिक स्वास्थ्य और नेट्सर्फ के सभी प्रमाणित उत्पादों की सही डोज व समय का प्रामाणिक मार्गदर्शन देती हूँ।`;
      renderCrispSpecialBox('👩‍🌾 आरोग्यम सखी AI — डिजिटल डॉक्टर व किसान सखी', resp, [
        { text: '🌾 खेती व फसल रोग समाधान', query: 'फसल सुरक्षा व स्प्रे कैलेंडर' },
        { text: '🩺 प्राकृतिक स्वास्थ्य समाधान', query: 'नेचुरामोर स्वास्थ्य उत्पाद' },
        { text: '💬 अवनीश सर से सीधा संपर्क', query: 'फाउंडर अवनीश जी का विज़न व सीधा WhatsApp संपर्क' }
      ], 'casual', 'identity');
      return true;
    }

    // 4. "tumne galat jankari di hai" / "galat bataya" / "ye galat hai"
    if (cleanQ.includes('galat jankari') || cleanQ.includes('galat bataya') || cleanQ.includes('galat bata') || cleanQ.includes('ye galat hai') || cleanQ.includes('kuch bhi bata') || cleanQ.includes('kuch ka kuch') || cleanQ.includes('गलत जानकारी') || cleanQ.includes('गलत बता रहे')) {
      const resp = `माफ़ी चाहती हूँ! 🙏 यदि मेरे पिछले उत्तर में कोई भ्रम या गलत संदर्भ आया हो, तो मैं उसे तुरंत सुधारना चाहती हूँ।\n\nकृपया अपनी फसल का नाम, बीमारी का लक्षण या उत्पाद का नाम लिखकर बताएं, ताकि मैं आपको 100% सही व सटीक वैज्ञानिक जानकारी प्रस्तुत कर सकूँ।`;
      renderCrispSpecialBox('🙏 क्षमा याचना व सुधार का अवसर', resp, [
        { text: '🦴 नेचुरामोर जॉइंट केयर (घटक व खुराक)', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
        { text: '🌱 बायोफिट स्टिमरिच (डोज व स्प्रे)', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '💬 सीधे अवनीश सर से बात करें', query: 'फाउंडर अवनीश जी का विज़न व सीधा WhatsApp संपर्क' }
      ], 'casual', 'apology');
      return true;
    }

    // 5. "tumhara malik kya hai" / "founder kaun hai" / "company kiski hai"
    if (cleanQ.includes('malik') || cleanQ.includes('मालिक') || cleanQ.includes('founder') || cleanQ.includes('फाउंडर') || cleanQ.includes('company kiski') || cleanQ.includes('owner')) {
      const resp = `आरोग्यम इंडिया के संस्थापक व विज़नरी लीडर **श्री अवनीश जी** हैं।\n\nउनका मुख्य मिशन भारत के प्रत्येक किसान भाई को वैज्ञानिक ज्ञान और जैविक तकनीक द्वारा समृद्ध बनाना तथा प्रत्येक परिवार को रोगमुक्त व आत्मनिर्भर जीवन देना है। यदि आप उनसे सीधे मार्गदर्शन या WhatsApp परामर्श चाहते हैं, तो नीचे क्लिक कर सकते हैं।`;
      const waUrl = buildAvneeshWhatsAppHandoffUrl('अवनीश जी से सीधा मार्गदर्शन');
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🇮🇳 आरोग्यम इंडिया के संस्थापक — श्री अवनीश जी
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;margin-bottom:12px;">
          ${escapeHtml(resp)}
        </div>
        <div style="margin-top:10px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-brands fa-whatsapp"></i> अवनीश सर से सीधा WhatsApp पर जुड़ें →
          </a>
        </div>
      `;
      streamBotMessage(html, 'आरोग्यम इंडिया के संस्थापक श्री अवनीश जी हैं।');
      return true;
    }

    // 6. "mausam kaisa hai" / "aaj ka mausam"
    if (cleanQ.includes('mausam') || cleanQ.includes('mousam') || cleanQ.includes('मौसम') || cleanQ.includes('barish') || cleanQ.includes('weather')) {
      const resp = `हमारे 'मौसम रिपोर्ट' पेज पर आप अपने क्षेत्र का 7-दिवसीय सटीक तापमान, वर्षा की संभावना व हवा की गति देख सकते हैं।\n\n👉 **सुझाव:** छिड़काव हमेशा शांत मौसम और खिली धूप या शाम के समय करें। बारिश की संभावना होने पर बायो-99 (5ml/15L) अवश्य मिलाएं ताकि दवा 30 मिनट में चिपक जाए।`;
      renderCrispSpecialBox('⛅ मौसम रिपोर्ट व स्प्रे सावधानी', resp, [
        { text: '⛅ 7-दिवसीय मौसम रिपोर्ट खोलें', query: 'मौसम पूर्वानुमान कैसे देखें' },
        { text: '💧 बायो-99 बारिश में सुरक्षा फॉर्मूला', query: 'बायो-99 की सही डोज व उपयोग' }
      ], 'agri', 'weather');
      return true;
    }

    // 7. Polite Pleasantries ("dhanyawad", "thank you", "theek hai")
    if (cleanQ === 'dhanyawad' || cleanQ === 'thank you' || cleanQ === 'thanks' || cleanQ === 'shukriya' || cleanQ === 'theek hai' || cleanQ === 'thik hai' || cleanQ === 'धन्यवाद') {
      const resp = `आपका बहुत-बहुत धन्यवाद! 🙏 आरोग्यम सखी AI हमेशा आपकी सेवा में 24×7 तत्पर है। जब भी कोई नया सवाल हो, बेझिझक पूछें। स्वस्थ रहें, समृद्ध रहें! 🌾🇮🇳`;
      renderCrispSpecialBox('🌸 आपका स्वागत है!', resp, [
        { text: '🌾 नया सवाल पूछें', query: 'फसलों का स्प्रे कैलेंडर' },
        { text: '🛒 नेट्सर्फ उत्पाद सूची', query: 'बायोफिट उत्पाद गाइड' }
      ], 'casual', 'thanks');
      return true;
    }

    return false;
  }

  // 14.5 COMPREHENSIVE E-BOOKS & PAYMENT ASSISTANCE ROUTER (BK001, BK002, BK015, BK016, BK018)
  function handleBookInquiriesAndFaq(cleanQ, rawQ) {
    const isBookGeneral = cleanQ.includes('e-book') || cleanQ.includes('ebook') || cleanQ.includes('किताब') || cleanQ.includes('पुस्तक') || cleanQ.includes('pdf') || cleanQ.includes('लाइब्रेरी') || cleanQ.includes('बुक');
    const isPaymentIssue = cleanQ.includes('payment fail') || cleanQ.includes('पेमेंट फेल') || cleanQ.includes('पेमेंट नहीं') || cleanQ.includes('pay nahi') || cleanQ.includes('upi se') || cleanQ.includes('upi') || cleanQ.includes('phonepe') || cleanQ.includes('gpay') || cleanQ.includes('paytm') || cleanQ.includes('पैसे कट') || cleanQ.includes('khareed nahi pa');
    const isWhyBuy = cleanQ.includes('kyo kharide') || cleanQ.includes('क्यों खरीदें') || cleanQ.includes('kya fayda') || cleanQ.includes('क्या फायदा') || cleanQ.includes('kyo padhe');

    // 1. Direct UPI / Payment Failure Assistance
    if (isPaymentIssue) {
      const resp = `💳 **पेमेंट समस्या व डायरेक्ट UPI सहायता:**\nक्या आपका पेमेंट गेटवे पर फेल हुआ या ऑनलाइन भुगतान में कोई रुकावट आ रही है? चिंता न करें!\n\nआप बिना किसी झंझट के सीधे हमारे अधिकृत खाते पर भुगतान कर सकते हैं:\n• **PhonePe / Google Pay / Paytm नंबर:** 7974422572\n• **UPI ID:** 7974422572@upi\n• **नाम:** अवनीश कुमार मिश्रा (संस्थापक, आरोग्यम इंडिया)\n\n👉 **प्रक्रिया:** मात्र ₹99 या ₹149 का भुगतान कर उसका स्क्रीनशॉट हमारे WhatsApp नंबर (7974422572) पर भेजें। 2 मिनट के भीतर आपकी ई-बुक और डिजिटल लाइब्रेरी में आजीवन (Lifetime) एक्सेस एक्टिवेट कर दिया जाएगा!`;
      const waUrl = buildAvneeshWhatsAppHandoffUrl('पेमेंट स्क्रीनशॉट व ई-बुक एक्टिवेशन');
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          💳 डायरेक्ट UPI भुगतान व तुरंत एक्टिवेशन सहायता
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${escapeHtml(resp)}
        </div>
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp पर पेमेंट स्क्रीनशॉट भेजें →
          </a>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'business';
      sakhiConversationState.lastActiveEntity = 'book_payment_upi';
      sakhiConversationState.lastActiveEntityName = 'डायरेक्ट UPI भुगतान';
      streamBotMessage(html, 'आप सीधे 7974422572 पर फोनपे या गूगलपे से भुगतान करके व्हाट्सएप पर स्क्रीनशॉट भेज सकते हैं। 2 मिनट में ई-बुक शुरू हो जाएगी।');
      return true;
    }

    // 2. Kheti Ka Doctor (BK002)
    if (cleanQ.includes('bk002') || cleanQ.includes('bk 002') || cleanQ.includes('kheti ka doctor') || cleanQ.includes('खेती का डॉक्टर') || cleanQ.includes('fasal ka doctor') || cleanQ.includes('फसल का डॉक्टर') || cleanQ.includes('pocket doctor') || cleanQ.includes('रोग पहचान की बुक') || cleanQ.includes('रोग पहचान')) {
      const resp = `🌾 **'खेती का डॉक्टर' (Pocket Doctor) — अपनी फसल के खुद डॉक्टर बनें:**\n• **यह पुस्तक क्यों जरूरी है?** खेत में जब पत्तियां पीली होती हैं या धब्बे पड़ते हैं, तो दुकानदार के पास जाने पर बिना जरूरत ₹1,500 की दवा पकड़ा दी जाती है। इस पुस्तक में 300+ असली एचडी फोटो देखकर आप खुद पहचान सकते हैं कि समस्या फंगस की है, कीट की या पोषण कमी की।\n• **मुख्य विशेषताएं:** 120 पेज की प्रैक्टिकल गाइड, 300+ वास्तविक फोटो, फसलवार रोग-कीट निदान चार्ट व स्प्रे साइंस।\n• **व्यावहारिक लाभ:** आप न सिर्फ अपने खेत के हजारों रुपये बचा सकते हैं, बल्कि अपने पड़ोसियों व गांव के खेतों में भी सही जानकारी दे सकते हैं।\n💰 **ऑफर मूल्य:** मात्र ₹99 (MRP ₹299)।`;
      renderCrispSpecialBox('🌾 खेती का डॉक्टर — फोटो सहित रोग पहचान ई-बुक', resp, [
        { text: '📖 खेती का डॉक्टर अभी पढ़ें', query: 'खेती का डॉक्टर ई-बुक कैसे प्राप्त करें' },
        { text: '🧪 कृषि दवा डायरेक्टरी देखें', query: 'कृषि दवा डायरेक्टरी के बारे में बताओ' },
        { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'agri', 'book_kheti_dr');
      return true;
    }

    // 3. Krishi Dawa Directory (BK016)
    if (cleanQ.includes('bk016') || cleanQ.includes('bk 016') || cleanQ.includes('krishi dawa directory') || cleanQ.includes('कृषि दवा डायरेक्टरी') || cleanQ.includes('dawa directory') || cleanQ.includes('दवा डायरेक्टरी') || cleanQ.includes('दवा की गाइड') || cleanQ.includes('chemical dawa')) {
      const resp = `🧪 **'कृषि दवा डायरेक्टरी' — फसल के रोग, कीट और असली दवा की संपूर्ण गाइड:**\n• **दुकानदार के झांसे से मुक्ति:** दवा की दुकान पर एक ही दवा के 50 अलग-अलग नाम होते हैं। इस डायरेक्टरी से आप असली टेक्निकल (Active Ingredient) समझेंगे ताकि कोई आपको महंगी दवा न बेच सके।\n• **मुख्य विशेषताएं:** फफूंदनाशी, कीटनाशक व खरपतवारनाशक की संपूर्ण गाइड, कम खर्च वाले जैविक व देसी नुस्खे, 4-पेज Quick Reference (रोग ➔ फसल और Chemical ➔ रोग)।\n💰 **ऑफर मूल्य:** मात्र ₹99 (MRP ₹499)।`;
      renderCrispSpecialBox('🧪 कृषि दवा डायरेक्टरी — रोग, कीट व दवा की पूरी गाइड', resp, [
        { text: '📖 कृषि दवा डायरेक्टरी पढ़ें', query: 'कृषि दवा डायरेक्टरी कैसे प्राप्त करें' },
        { text: '🌾 खेती का डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' },
        { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'agri', 'book_dawa_dir');
      return true;
    }

    // 4. Kharif Fasal Master Guide 2026 (BK001)
    if (cleanQ.includes('bk001') || cleanQ.includes('bk 001') || cleanQ.includes('kharif') || cleanQ.includes('खरीफ फसल') || cleanQ.includes('धान सोयाबीन मक्का') || cleanQ.includes('खरीफ गाइड')) {
      const resp = `🌾 **'खरीफ फसल मास्टर गाइड 2026' — धान, सोयाबीन व मक्का उत्पादन की सम्पूर्ण गाइड:**\n• **विशेषताएं:** 150+ रंगीन पेज, 300+ वास्तविक फोटो, बीज उपचार से लेकर कटाई तक का सम्पूर्ण वैज्ञानिक प्रबंधन।\n• **कवर विषय:** खरपतवार नियंत्रण, खाद व पोषण प्रबंधन, कल्ले बढ़ाने का फॉर्मूला और कीट-रोग का वैज्ञानिक स्प्रे शेड्यूल।\n💰 **ऑफर मूल्य:** मात्र ₹99 (MRP ₹299)।`;
      renderCrispSpecialBox('🌾 खरीफ फसल मास्टर गाइड 2026 — सम्पूर्ण उत्पादन गाइड', resp, [
        { text: '📖 खरीफ मास्टर गाइड अभी पढ़ें', query: 'खरीफ फसल मास्टर गाइड कैसे प्राप्त करें' },
        { text: '🌾 खेती का डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' },
        { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'agri', 'book_kharif');
      return true;
    }

    // 5. Sabji Kheti Master (BK015)
    if (cleanQ.includes('bk015') || cleanQ.includes('bk 015') || cleanQ.includes('sabji kheti') || cleanQ.includes('सब्जी खेती मास्टर') || cleanQ.includes('सब्जी खेती') || cleanQ.includes('सब्जी की किताब')) {
      const resp = `🥦 **'सब्जी खेती मास्टर (PART 1)' — 11 प्रमुख सब्जियों की वैज्ञानिक खेती:**\n• **कवर फसलें:** टमाटर, मिर्च, शिमला मिर्च, बैंगन, भिंडी, खीरा, ककड़ी, लौकी, करेला, तोरई और कद्दू।\n• **विशेषताएं:** 154 पेज, बीज चयन से लेकर नर्सरी, पौधों की दूरी, ड्रिप-मल्चिंग, खाद-स्प्रे कैलेंडर और बाजार भाव तक सम्पूर्ण गाइड।\n💰 **ऑफर मूल्य:** मात्र ₹149 (MRP ₹1999)।`;
      renderCrispSpecialBox('🥦 सब्जी खेती मास्टर (Part 1) — 11 प्रमुख सब्जियों की खेती', resp, [
        { text: '📖 सब्जी खेती मास्टर पढ़ें', query: 'सब्जी खेती मास्टर कैसे प्राप्त करें' },
        { text: '🧪 कृषि दवा डायरेक्टरी देखें', query: 'कृषि दवा डायरेक्टरी के बारे बताओ' },
        { text: '💳 डायरेक्ट UPI से ₹149 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'agri', 'book_sabji');
      return true;
    }

    // 6. Ghar Baithe Paise Kaise Kamaye (BK018)
    if (cleanQ.includes('ghar baithe paise') || cleanQ.includes('घर बैठे पैसे') || cleanQ.includes('income guide') || cleanQ.includes('कमाई की किताब') || cleanQ.includes('कमाई कैसे करें') || cleanQ.includes('nk018') || cleanQ.includes('bk018')) {
      const resp = `💼 **'घर बैठे पैसे कैसे कमाएँ? Income Guide' — डिजिटल व ऑफलाइन कमाई की संपूर्ण गाइड:**\n• **विशेषताएं:** 60 ऑनलाइन और ऑफलाइन कमाई के वास्तविक तरीके, 150+ जांची-परखी वेबसाइट्स की लिस्ट, बिना किसी बड़े बजट के शुरुआत करने की व्यावहारिक तकनीक।\n• **सुरक्षा:** ऑनलाइन फ्रॉड और धोखाधड़ी से बचने के सुनहरे नियम।\n💰 **ऑफर मूल्य:** मात्र ₹149 (MRP ₹1001)।`;
      renderCrispSpecialBox('💼 घर बैठे पैसे कैसे कमाएँ? — 60 कमाई के तरीके', resp, [
        { text: '📖 इनकम गाइड अभी पढ़ें', query: 'घर बैठे पैसे कैसे कमाएं ई-बुक कैसे प्राप्त करें' },
        { text: '💳 डायरेक्ट UPI से ₹149 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'business', 'book_income');
      return true;
    }

    // 7. General: Why Buy E-Books? (किताब क्यों खरीदें?)
    if (isWhyBuy || (isBookGeneral && (cleanQ.includes('list') || cleanQ.includes('guide') || cleanQ.includes('faq')))) {
      const resp = `📚 **आरोग्यम इंडिया की ई-बुक्स क्यों खरीदें? — ज्ञान जो हर साल हजारों रुपये बचाए:**\n• 1. **खुद डॉक्टर बनें:** 300+ असली फोटो देखकर खेत में कीट व बीमारी खुद पहचानें और सही दवा चुनें।\n• 2. **दुकानदारों के कमीशन से मुक्ति:** गैर-जरूरी और नकली रसायनों के चक्कर से छुटकारा पाएं।\n• 3. **आजीवन डिजिटल लाइब्रेरी:** फोन में कभी भी, कहीं भी ऑफलाइन पढ़ने व सुनने की सुविधा।\n• 4. **मात्र ₹99 से शुरुआत:** एक स्प्रे के खर्च से भी कम में पूरे जीवन का ज्ञान!`;
      renderCrispSpecialBox('📚 आरोग्यम डिजिटल लाइब्रेरी — सम्पूर्ण पुस्तक सूची', resp, [
        { text: '🌾 खेती का डॉक्टर (₹99)', query: 'खेती का डॉक्टर के बारे में बताओ' },
        { text: '🧪 कृषि दवा डायरेक्टरी (₹99)', query: 'कृषि दवा डायरेक्टरी के बारे में बताओ' },
        { text: '🥦 सब्जी खेती मास्टर (₹149)', query: 'सब्जी खेती मास्टर के बारे में बताओ' },
        { text: '💳 डायरेक्ट UPI से भुगतान विधि', query: 'UPI से पेमेंट कैसे करें' }
      ], 'business', 'books_catalog');
      return true;
    }

    return false;
  }

  // 14.6 13 HEALTH PAGES, MEDICAL SCIENCE, DIET CHARTS & SPONSOR HANDOFF ROUTER
  function handle13HealthPagesAndSponsor(cleanQ, rawQ) {
    const isNetsurfBuy = cleanQ.includes('netsurf product') || cleanQ.includes('product lena') || cleanQ.includes('product kharid') || cleanQ.includes('order karna') || cleanQ.includes('प्रोडक्ट लेना') || cleanQ.includes('सामान लेना') || cleanQ.includes('दवा मंगवाना') || cleanQ.includes('order kaise kare') || cleanQ.includes('product kaise le');

    // Case 1: General "Netsurf Product Lena Hai"
    if (isNetsurfBuy && !cleanQ.includes('joint') && !cleanQ.includes('heart') && !cleanQ.includes('sugar') && !cleanQ.includes('liver') && !cleanQ.includes('pet') && !cleanQ.includes('dard')) {
      const resp = `आरोग्यम इंडिया पर नेट्सर्फ के 100% प्रामाणिक आयुर्वेदिक व जैविक उत्पाद उपलब्ध हैं।\n\nकृपया नीचे से अपनी मुख्य समस्या या विषय चुनें, ताकि मैं आपको सही डाइट चार्ट, वैज्ञानिक इलाज और सीधे प्रोडक्ट पेज का लिंक दे सकूँ:`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🛒 नेट्सर्फ उत्पाद चयन व स्वास्थ्य समाधान
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;margin-bottom:12px;">
          ${escapeHtml(resp)}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <a href="/health/joint-care.html" class="sakhi-followup-chip" style="text-decoration:none;">🦴 जोड़ों का दर्द (जॉइंट केयर)</a>
          <a href="/health/diabetes.html" class="sakhi-followup-chip" style="text-decoration:none;">🩸 शुगर व डायबिटीज केयर</a>
          <a href="/health/heart-care.html" class="sakhi-followup-chip" style="text-decoration:none;">❤️ हार्ट व कोलेस्ट्रॉल केयर</a>
          <a href="/health/liver-care.html" class="sakhi-followup-chip" style="text-decoration:none;">🍃 लिवर डिटॉक्स व गैस-कब्ज</a>
          <a href="/health/womens-care.html" class="sakhi-followup-chip" style="text-decoration:none;">🌸 महिला स्वास्थ्य (PCOD/PCOS)</a>
          <a href="/health/sexual-wellness.html" class="sakhi-followup-chip" style="text-decoration:none;">⚡ पुरुष स्टैमिना व ऊर्जा</a>
          <a href="/health/weight-loss.html" class="sakhi-followup-chip" style="text-decoration:none;">⚖️ मोटापा व वजन घटाना</a>
          <a href="/health/skin-care.html" class="sakhi-followup-chip" style="text-decoration:none;">✨ त्वचा रोग व ग्लो</a>
          <a href="/health/hair-care.html" class="sakhi-followup-chip" style="text-decoration:none;">💇 बाल झड़ना व डैंड्रफ</a>
          <a href="/health/thyroid-care.html" class="sakhi-followup-chip" style="text-decoration:none;">🦋 थायरॉयड केयर</a>
        </div>
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:12px;font-size:0.88rem;color:#166534;line-height:1.5;">
          👉 <strong>खरीदने का सही नियम:</strong> संबंधित पेज पर जाकर उत्पाद को <strong>कार्ट (Add to Cart)</strong> में जोड़ें और जिस <strong>प्रायोजक (Sponsor)</strong> ने आपको आरोग्यम इंडिया ऐप डाउनलोड कराया है, उन्हें तुरंत कॉल या WhatsApp करें ताकि वे आपको विशेष छूट व समय पर होम डिलीवरी में पूरी सहायता कर सकें!
        </div>
      `;
      streamBotMessage(html, 'कृपया अपनी स्वास्थ्य समस्या चुनें। उत्पाद को कार्ट में डालकर अपने प्रायोजक को संपर्क करें।');
      return true;
    }

    // Helper for rendering Health Science, Diet Chart, Page Link & Sponsor instructions
    function renderHealthTopicPage(title, organFunction, dietDo, dietDont, products, pageUrl, domainKey, entityKey) {
      const resp = `🩺 **${title}:**\n• **ऑर्गन कार्यप्रणाली व कारण:** ${organFunction}\n\n🥗 **डाइट चार्ट (पथ्य व अपथ्य):**\n✅ **क्या खाएं:** ${dietDo}\n❌ **क्या न खाएं:** ${dietDont}\n\n💊 **प्रमाणित नेट्सर्फ समाधान:** ${products}\n\n👉 **ऑर्डर व डिलीवरी नियम:** नीचे दिए गए लिंक से पेज खोलकर उत्पाद को कार्ट (Add to Cart) में डालें और जिस **प्रायोजक (Sponsor)** ने आपको ऐप डाउनलोड कराया है, उन्हें तुरंत कॉल या WhatsApp करें।`;

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          ${escapeHtml(title)}
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${escapeHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 उत्पाद देखें व कार्ट में जोड़ें:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <a href="${pageUrl}" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              🛒 ${escapeHtml(title)} पेज खोलें व कार्ट में डालें →
            </a>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ उत्पाद खरीदने के लिए प्रायोजक से संपर्क')">
              👥 प्रायोजक से संपर्क विधि
            </button>
          </div>
          <div style="font-size:0.82rem;color:#166534;line-height:1.4;">
            💡 <strong>नोट:</strong> जिस प्रायोजक (Sponsor) ने आपको आरोग्यम इंडिया ऐप डाउनलोड कराया है, वे आपकी डिलीवरी और अतिरिक्त छूट में पूरी मदद करेंगे।
          </div>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'health';
      sakhiConversationState.lastActiveEntity = entityKey;
      sakhiConversationState.lastActiveEntityName = title;
      streamBotMessage(html, title + ' की संपूर्ण कार्यप्रणाली, डाइट चार्ट और नेट्सर्फ समाधान प्रस्तुत है।');
      return true;
    }

    // 1. Diabetes / Sugar
    if (cleanQ.includes('diabetes') || cleanQ.includes('डायबिटीज') || cleanQ.includes('sugar') || cleanQ.includes('शुगर') || cleanQ.includes('मधुमेह')) {
      return renderHealthTopicPage(
        'मधुमेह व ब्लड शुगर नियंत्रण',
        'पैंक्रियाज (Pancreas) की बीटा कोशिकाएं जब पर्याप्त इंसुलिन नहीं बनातीं, तो ग्लूकोज कोशिकाओं में जाने की बजाय खून में बढ़ने लगता है।',
        'मेथी दाना, करेला, जामुन सिरका, जौ-चना मिश्रित आटा, हरी पत्तेदार सब्जियां व पर्याप्त पानी।',
        'चीनी, गुड़, मैदा, आलू, सफेद चावल, डिब्बा बंद जूस व तला-भुना भोजन।',
        'नेचुरामोर लाइफस्टाइल प्लस कैप्सूल (भोजन से 30 मिनट पहले 1 कैप्सूल सुबह-शाम) + नेचुरामोर मसाला मिल्क पाउडर।',
        '/health/diabetes.html',
        'health',
        'diabetes'
      );
    }

    // 2. Liver Care & Digestion
    if (cleanQ.includes('liver') || cleanQ.includes('लिवर') || cleanQ.includes('fatty liver') || cleanQ.includes('फैटी लिवर') || cleanQ.includes('कब्ज') || cleanQ.includes('constipation') || cleanQ.includes('एसिडिटी')) {
      return renderHealthTopicPage(
        'लिवर डिटॉक्स, फैटी लिवर व पेट शुद्धि',
        'लिवर शरीर का मुख्य केमिकल फिल्टर है। वसा जमने (Fatty Liver) व टॉक्सिन्स जमा होने से पाचन रस (Bile) नहीं बनता और गैस, कब्ज व भारीपन शुरू होता है।',
        'पपीता, चुकंदर, आंवला, लौकी सूप, रात में गुनगुना पानी व फाइबर युक्त आहार।',
        'शराब, तंबाकू, अत्यधिक मिर्च-मसाला, रिफाइंड तेल, मैदा व देर रात भारी भोजन।',
        'नेचुरामोर ईजी डिटॉक्स (Easy Detox - रात को 1-2 गोली गुनगुने पानी से) + नेचुरामोर पाउडर।',
        '/health/liver-care.html',
        'health',
        'liver_care'
      );
    }

    // 3. Heart & BP
    if (cleanQ.includes('heart') || cleanQ.includes('हार्ट') || cleanQ.includes('dil') || cleanQ.includes('बीपी') || cleanQ.includes('कोलेस्ट्रॉल') || cleanQ.includes('ब्लॉकेज')) {
      return renderHealthTopicPage(
        'हार्ट सुरक्षा, बीपी व कोलेस्ट्रॉल संतुलन',
        'धमनियों (Arteries) में खराब कोलेस्ट्रॉल (LDL) और ट्राइग्लिसराइड्स जमने से नसों का लचीलापन घटता है, जिससे ब्लड प्रेशर बढ़ता है और हार्ट अटैक का खतरा होता है।',
        'अर्जुन छाल का काढ़ा, लहसुन की कली, लौकी का जूस, अलसी के बीज व हरी सब्जियां।',
        'अत्यधिक नमक, डालडा, रिफाइंड तेल, रेड मीट, मैदा व मानसिक तनाव।',
        'नेचुरामोर न्यूट्री हार्ट कैप्सूल (1 कैप्सूल सुबह और 1 शाम भोजनोपरांत) + नेचुरामोर प्लस पाउडर।',
        '/health/heart-care.html',
        'health',
        'nutri_heart'
      );
    }

    // 4. Women Care & PCOD
    if (cleanQ.includes('pcod') || cleanQ.includes('pcos') || cleanQ.includes('महिला') || cleanQ.includes('मासिक धर्म') || cleanQ.includes('पीरियड्स') || cleanQ.includes('कमर दर्द')) {
      return renderHealthTopicPage(
        'महिला स्वास्थ्य, PCOD/PCOS व हार्मोनल संतुलन',
        'एस्ट्रोजन और प्रोजेस्टेरोन हार्मोन के असंतुलन से ओवरी में छोटे सिस्ट बनते हैं, जिससे अनियमित माहवारी, वजन बढ़ना व चेहरे पर अनचाहे बाल आते हैं।',
        'शतावरी, दालचीनी, कद्दू व अलसी के बीज, नारियल पानी, हरी पत्तेदार सब्जियां।',
        'जंक फूड, अत्यधिक चीनी, कोल्ड ड्रिंक्स, डेयरी प्रोडक्ट्स का अत्यधिक सेवन।',
        'नेचुरामोर फॉर विमेन (Masala Milk / French Vanilla) 1 चम्मच सुबह दूध में + वुमन केयर कैप्सूल।',
        '/health/womens-care.html',
        'health',
        'womens_care'
      );
    }

    // 5. Weight Loss & Obesity
    if (cleanQ.includes('weight loss') || cleanQ.includes('वजन घटाना') || cleanQ.includes('मोटापा') || cleanQ.includes('चर्बी') || cleanQ.includes('fat kam')) {
      return renderHealthTopicPage(
        'प्राकृतिक मोटापा व वजन नियंत्रण',
        'धीमा मेटाबॉलिज्म (Metabolism) और थायरॉयड की सुस्ती भोजन की कैलोरी को फैट में बदलकर पेट व कमर पर जमा करती है।',
        'खीरा-सलाद, ग्रीन टी, अंकुरित मूंग, नींबू-गुनगुना पानी, दलिया व छाछ।',
        'चीनी, कोल्ड ड्रिंक, सफेद चावल, मैदा, समोसे-पकौड़े व रात का भारी डिनर।',
        'नेचुरामोर ईजी डिटॉक्स (रात को 1 गोली) + नेचुरामोर फ्रेंच वैनिला पाउडर (सुबह नाश्ते की जगह गुनगुने पानी से)।',
        '/health/weight-loss.html',
        'health',
        'weight_loss'
      );
    }

    // 6. Men Vitality & Stamina
    if (cleanQ.includes('stamina') || cleanQ.includes('पुरुष') || cleanQ.includes('पौरुष') || cleanQ.includes('कमजोरी') || cleanQ.includes('शुक्राणु') || cleanQ.includes('मर्दाना')) {
      return renderHealthTopicPage(
        'पुरुष स्वास्थ्य, ऊर्जा व स्टैमिना वृद्धि',
        'टेस्टोस्टेरोन हार्मोन की कमी, तनाव व खराब रक्त संचार से दिनभर थकान और पौरुष कमजोरी महसूस होती है।',
        'अश्वगंधा, सफेद मूसली, खजूर, दूध, बादाम, अखरोट व केला।',
        'तंबाकू, गुटखा, शराब, अत्यधिक चाय-कॉफी व तनाव।',
        'नेचुरामोर प्लस पाउडर (सुबह दूध के साथ 1 चम्मच) + लाइफस्टाइल मेन कैप्सूल।',
        '/health/sexual-wellness.html',
        'health',
        'mens_care'
      );
    }

    // 7. Lungs & Respiratory Care
    if (cleanQ.includes('lungs') || cleanQ.includes('फेफड़े') || cleanQ.includes('अस्थमा') || cleanQ.includes('दमा') || cleanQ.includes('खांसी') || cleanQ.includes('सांस फूलना')) {
      return renderHealthTopicPage(
        'फेफड़ों की मजबूती व श्वसन तंत्र सुरक्षा',
        'प्रदूषण, धूल व कफ जमा होने से ब्रोंकियल नलियों में सूजन आती है, जिससे ऑक्सीजन का प्रवाह बाधित होता है और सांस फूलती है।',
        'तुलसी, अदरक, काली मिर्च, मुलेठी, गुनगुना पानी व भाप (Steam)।',
        'ठंडा पानी, आइसक्रीम, सिगरेट/धुआं, दही व रात में भारी चावल।',
        'नेचुरामोर इम्यून प्लस कैप्सूल (1 कैप्सूल सुबह-शाम गुनगुने पानी से) + नेचुरामोर पाउडर।',
        '/health/home-care.html',
        'health',
        'respiratory_care'
      );
    }

    return false;
  }

  // 15. PRONOUN & MULTI-TURN CONTEXT RESOLVER (संदर्भ व फॉलो-अप डिटेक्टर)
  function resolveFollowUpQuery(cleanQ, rawQ) {
    const isIngredients = cleanQ.includes('iske andar') || cleanQ.includes('isme kya') || cleanQ.includes('kya kya hai') || cleanQ.includes('kya samagri') || cleanQ.includes('ingredients') || cleanQ.includes('composition') || cleanQ.includes('kisse bana') || cleanQ.includes('ghatak') || cleanQ.includes('इसके अंदर') || cleanQ.includes('क्या सामग्री');
    const isDosage = cleanQ.includes('kaise khaye') || cleanQ.includes('kaise le') || cleanQ.includes('kab le') || cleanQ.includes('kab khaye') || cleanQ.includes('khuraak') || cleanQ.includes('खुराक') || cleanQ.includes('dose') || cleanQ.includes('डोज') || cleanQ.includes('kaise use') || cleanQ.includes('kaise spray') || cleanQ.includes('उपयोग कैसे') || cleanQ.includes('कैसे खाएं') || cleanQ.includes('कैसे लें');
    const isPrice = cleanQ.includes('kitne ka hai') || cleanQ.includes('price') || cleanQ.includes('rate') || cleanQ.includes('cost') || cleanQ.includes('kimat') || cleanQ.includes('कीमत') || cleanQ.includes('mrp') || cleanQ.includes('discount') || cleanQ.includes('छूट');
    const isBenefits = cleanQ.includes('fayde') || cleanQ.includes('fayda') || cleanQ.includes('labh') || cleanQ.includes('लाभ') || cleanQ.includes('फायदे') || cleanQ.includes('kya kaam') || cleanQ.includes('क्या काम') || cleanQ.includes('benefits');
    const isMore = cleanQ.includes('aur batao') || cleanQ.includes('aur jankari') || cleanQ.includes('और बताओ') || cleanQ.includes('aage batao') || cleanQ.includes('aur kya');

    const activeEntity = sakhiConversationState.lastActiveEntity;
    if (!activeEntity) return false;

    // Entity 1: Joint Care Follow-ups
    if (activeEntity === 'joint_care' || activeEntity.includes('joint')) {
      if (isIngredients || isMore) {
        const resp = `🌿 **नेचुरामोर जॉइंट केयर (Naturamore Joint Care) के 4 मुख्य प्राकृतिक सक्रिय घटक:**\n\n1. **ग्लूकोसामाइन हाइड्रोक्लोराइड (Glucosamine HCl):** घिस चुकी कार्टिलेज (हड्डियों की कुदरती गद्दी) का पुनर्निर्माण करता है और जोड़ों के बीच घर्षण को रोकता है।\n2. **सलाई गुग्गुल (Boswellia serrata - 65% Boswellic Acid):** जोड़ों की पुरानी सूजन, अकड़न व असहनीय दर्द को प्राकृतिक रूप से शांत करता है।\n3. **हड़जोड़ (Cissus quadrangularis):** हड्डियों की सघनता बढ़ाता है और लिगामेंट्स व टेंडन्स को मजबूत करता है।\n4. **रसना व गुग्गुल (Rasna & Guggal):** वात दोष का शमन कर जोड़ों की लचीलापन वापस लाता है।\n\n💊 **खुराक:** 1 कैप्सूल सुबह और 1 शाम, भोजन के 30 मिनट बाद गुनगुने पानी से लें।`;
        renderCrispSpecialBox('🦴 नेचुरामोर जॉइंट केयर — सक्रिय प्राकृतिक घटक', resp, [
          { text: '🥛 नेचुरामोर पाउडर के साथ कैसे लें?', query: 'नेचुरामोर पाउडर और जॉइंट केयर कैसे लें' },
          { text: '⏳ कितने दिनों में राहत मिलेगी?', query: 'जॉइंट केयर कितने दिन में असर करता है' },
          { text: '💰 कीमत व डिस्काउंट ऑफर', query: 'नेचुरामोर जॉइंट केयर की कीमत व ऑफर' }
        ], 'health', 'joint_care');
        return true;
      }
      if (isDosage) {
        const resp = `💊 **नेचुरामोर जॉइंट केयर सेवन विधि व समय:**\n• **खुराक:** 1 कैप्सूल सुबह और 1 कैप्सूल शाम को, भोजन करने के 30 मिनट बाद गुनगुने पानी के साथ लें।\n• **अवधि:** स्थायी व दीर्घकालीन लाभ के लिए इसे कम से कम 3 से 6 महीने नियमित लें।\n• **सर्वोत्तम कॉम्बो:** साथ में 1 चम्मच नेचुरामोर प्लस पाउडर (दूध या पानी में) लेने से शरीर को भरपूर कैल्शियम, ओमेगा व प्रोटीन मिलता है।`;
        renderCrispSpecialBox('💊 नेचुरामोर जॉइंट केयर — सही खुराक व सेवन नियम', resp, [
          { text: '🌿 इसके अंदर क्या-क्या घटक हैं?', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
          { text: '💰 कीमत व ऑर्डर कैसे करें', query: 'नेचुरामोर जॉइंट केयर की कीमत व ऑफर' }
        ], 'health', 'joint_care');
        return true;
      }
      if (isPrice) {
        const resp = `💰 **नेचुरामोर जॉइंट केयर (30 कैप्सूल पैक):**\n• एमआरपी (MRP): मात्र ₹650\n• आरोग्यम इंडिया विशेष ऑफर: नेचुरामोर प्लस पाउडर के साथ कॉम्बो लेने पर 15% से 30% तक की सीधी छूट व फ्री होम डिलीवरी उपलब्ध है।`;
        renderCrispSpecialBox('💰 नेचुरामोर जॉइंट केयर — प्रामाणिक कीमत व छूट', resp, [
          { text: '🌿 इसके घटक व कार्य', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
          { text: '💊 सेवन की सही विधि', query: 'जॉइंट केयर कैसे खाएं' }
        ], 'health', 'joint_care');
        return true;
      }
    }

    // Entity 2: Nutri Heart Follow-ups
    if (activeEntity === 'nutri_heart' || activeEntity.includes('heart')) {
      if (isIngredients || isDosage || isBenefits || isMore) {
        const resp = `❤️ **नेचुरामोर न्यूट्री हार्ट (Nutri Heart) के घटक व लाभ:**\n• **सक्रिय घटक:** अर्जुन छाल (Arjuna), अंगूर बीज अर्क (Grape Seed Extract), लहसुन अर्क (Garlic) और को-एंजाइम Q10 (CoQ10)।\n• **मुख्य लाभ:** धमनियों को लचीला रखता है, नसों में ब्लॉकेज जमने से रोकता है, खराब कोलेस्ट्रॉल (LDL) घटाता है और सामान्य ब्लड प्रेशर बनाए रखता है।\n💊 **खुराक:** 1 कैप्सूल सुबह और 1 कैप्सूल शाम, भोजन के 30 मिनट बाद गुनगुने पानी से।`;
        renderCrispSpecialBox('❤️ नेचुरामोर न्यूट्री हार्ट — घटक व सेवन विधि', resp, [
          { text: '🩺 बीपी व कोलेस्ट्रॉल में असर', query: 'न्यूट्री हार्ट से बीपी कैसे कंट्रोल होता है' },
          { text: '💰 कीमत व कॉम्बो ऑफर', query: 'न्यूट्री हार्ट की कीमत व ऑफर' }
        ], 'health', 'nutri_heart');
        return true;
      }
    }

    // Entity 3: Pet Vet / CFC Plus Follow-ups
    if (activeEntity === 'cfc_plus' || activeEntity === 'pet_vet' || activeEntity.includes('cfc')) {
      if (isIngredients || isDosage || isBenefits || isMore) {
        const resp = `🐄 **बायोफिट सीएफसी प्लस / पेट वेट (CFC Plus / Pet Vet) - संपूर्ण पशु पोषण:**\n• **घटक:** शतावरी, मेथी, विटामिन्स (A, D3, E), मिनरल्स (जिंक, कॉपर, कोबाल्ट, कैल्शियम), प्रीबायोटिक्स व प्रोबायोटिक्स।\n• **मुख्य लाभ:** पाचन तंत्र दुरुस्त करता है, 10 से 20% दूध बढ़ाता है, फैट 0.5 से 1.2 डिग्री सुधारता है और बांझपन दूर करता है।\n🥄 **खुराक:** 10 से 15 ग्राम प्रतिदिन प्रति दुधारू गाय/भैंस दाने या चारे में मिलाकर दें। 10-12 दिन में स्पष्ट परिणाम दिखता है।`;
        renderCrispSpecialBox('🐄 सीएफसी प्लस / पेट वेट — घटक व दूध-फैट वृद्धि', resp, [
          { text: '🥛 गाय-भैंस का दूध और फैट कैसे बढ़ाएं?', query: 'गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला' },
          { text: '💰 सीएफसी 500g व 1kg पैक कीमत', query: 'सीएफसी पशु आहार सप्लीमेंट ऑफर' }
        ], 'pashu', 'cfc_plus');
        return true;
      }
    }

    // Entity 4: Antiviral & Tomato Leaf Curl Follow-ups
    if (activeEntity === 'antiviral' || activeEntity.includes('kukda')) {
      if (isIngredients || isDosage || isBenefits || isMore) {
        const resp = `🍅 **बायोफिट एंटीवायरल (Antiviral) - कुकड़ा व वायरस का वैज्ञानिक इलाज:**\n• **घटक:** सक्रिय पादप अर्क जो वायरस के मल्टीप्लिकेशन (प्रसार) को तुरंत रोकते हैं।\n• **स्प्रे फॉर्मूला (प्रति 15 लीटर पंप):** एंटीवायरल 35ml + बायो-99 5ml + इन्काउंटर / नीम तेल 30ml (सफेद मक्खी नियंत्रण हेतु)।\n• **परिणाम:** पत्तियों का मुड़ना रुकता है और 5 से 7 दिनों में नई सीधी, चमकदार व स्वस्थ पत्तियां फूटती हैं।`;
        renderCrispSpecialBox('🛡️ बायोफिट एंटीवायरल — कुकड़ा नाशक फॉर्मूला', resp, [
          { text: '💧 बायो-99 की सही डोज क्या है?', query: 'बायो-99 की सही डोज व उपयोग' },
          { text: '🌸 फूल बढ़ाने के लिए स्टिमरिच', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' }
        ], 'agri', 'antiviral');
        return true;
      }
    }

    // Entity 5: Stimrich Follow-ups
    if (activeEntity === 'stimrich' || activeEntity.includes('stimrich')) {
      if (isIngredients || isDosage || isBenefits || isMore) {
        const resp = `🌱 **बायोफिट स्टिमरिच (Stimrich) - 100% जैविक ग्रोथ प्रमोटर:**\n• **घटक:** पादप हार्मोन्स (Auxins, Cytokinins) और प्रोटीन हाइड्रोलाइज़ेट।\n• **खुराक:** 30 से 35 ml प्रति 15 लीटर पंप, 5 ml बायो-99 के साथ मिलाकर स्प्रे करें।\n• **कार्य:** कल्ले 30-40% बढ़ाता है, फूलों का झड़ना रोकता है और दानों को वजनदार व चमकदार बनाता है।`;
        renderCrispSpecialBox('🌱 बायोफिट स्टिमरिच — संपूर्ण घटक व डोज', resp, [
          { text: '💧 बायो-99 की सही डोज', query: 'बायो-99 की सही डोज व उपयोग' },
          { text: '🌾 गेहूं में स्टिमरिच का समय', query: 'गेहूं में स्टिमरिच स्प्रे कब करें' }
        ], 'agri', 'stimrich');
        return true;
      }
    }

    // Entity 6: Book Kheti Dr Follow-ups
    if (activeEntity === 'book_kheti_dr') {
      if (isPrice || isBenefits || isMore) {
        const resp = `🌾 **'खेती का डॉक्टर' ई-बुक:**\n• **कीमत:** मात्र ₹99 (MRP ₹299)।\n• **लाभ:** 300+ असली फोटो देखकर खुद रोग पहचानें, गलत दवाओं के हजारों रुपये बचाएं।\n• **भुगतान:** आप सीधे 7974422572 पर UPI से भुगतान कर सकते हैं।`;
        renderCrispSpecialBox('🌾 खेती का डॉक्टर — कीमत व लाभ', resp, [
          { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' },
          { text: '🧪 कृषि दवा डायरेक्टरी देखें', query: 'कृषि दवा डायरेक्टरी के बारे में बताओ' }
        ], 'agri', 'book_kheti_dr');
        return true;
      }
    }

    // Entity 7: Book Dawa Directory Follow-ups
    if (activeEntity === 'book_dawa_dir') {
      if (isPrice || isBenefits || isMore) {
        const resp = `🧪 **'कृषि दवा डायरेक्टरी' ई-बुक:**\n• **कीमत:** मात्र ₹99 (MRP ₹499)।\n• **लाभ:** टेक्निकल (Active Ingredient) समझें, दुकानदार के झांसे से बचें, जैविक व देसी नुस्खे सीखें।\n• **भुगतान:** 7974422572 पर PhonePe/GooglePay से ₹99 भेजकर तुरंत एक्टिवेट कराएं।`;
        renderCrispSpecialBox('🧪 कृषि दवा डायरेक्टरी — कीमत व लाभ', resp, [
          { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' },
          { text: '🌾 खेती का डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
        ], 'agri', 'book_dawa_dir');
        return true;
      }
    }

    return false;
  }

  // 16. COMPREHENSIVE NETSURF & AGRI PRODUCT CATALOG HANDLER
  function handleComprehensiveNetsurfCatalog(cleanQ, rawQ) {
    // A. Naturamore Joint Care
    if (cleanQ.includes('joint care') || cleanQ.includes('जॉइंट केयर') || cleanQ.includes('जोड़ों का दर्द') || cleanQ.includes('घुटनों का दर्द') || cleanQ.includes('गठिया')) {
      const resp = `🦴 **नेचुरामोर जॉइंट केयर (Naturamore Joint Care) - कार्टिलेज पुनर्जनन का विज्ञान:**\n• **घटक:** ग्लूकोसामाइन HCl, सलाई गुग्गुल (Boswellia 65%), हड़जोड़ (Cissus) और रसना।\n• **कार्य:** घिस चुकी कार्टिलेज (गद्दी) को दोबारा बनाता है, सूजन व दर्द को शांत करता है और जोड़ों का लचीलापन लौटाता है।\n💊 **खुराक:** 1 कैप्सूल सुबह और 1 शाम, भोजन के 30 मिनट बाद गुनगुने पानी से लें।`;
      renderCrispSpecialBox('🦴 नेचुरामोर जॉइंट केयर — दर्द व कार्टिलेज समाधान', resp, [
        { text: '🌿 इसके अंदर क्या-क्या घटक हैं?', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
        { text: '💊 सेवन की सही विधि व समय', query: 'जॉइंट केयर कैसे खाएं' },
        { text: '🥛 नेचुरामोर पाउडर के साथ कॉम्बो', query: 'नेचुरामोर पाउडर और जॉइंट केयर कैसे लें' }
      ], 'health', 'joint_care');
      return true;
    }

    // B. Naturamore Nutri Heart
    if (cleanQ.includes('nutri heart') || cleanQ.includes('न्यूट्री हार्ट') || cleanQ.includes('कोलेस्ट्रॉल') || cleanQ.includes('ब्लॉकेज') || cleanQ.includes('हार्ट केयर')) {
      const resp = `❤️ **नेचुरामोर न्यूट्री हार्ट (Naturamore Nutri Heart) - स्वस्थ हृदय का प्राकृतिक सुरक्षा कवच:**\n• **घटक:** अर्जुन छाल अर्क, लहसुन, अंगूर बीज अर्क और को-एंजाइम Q10।\n• **कार्य:** नसों में लचीलापन बनाए रखता है, खराब कोलेस्ट्रॉल (LDL) कम करता है और सामान्य रक्तचाप (BP) बनाए रखता है।\n💊 **खुराक:** 1 कैप्सूल सुबह और 1 शाम भोजन के बाद गुनगुने पानी से।`;
      renderCrispSpecialBox('❤️ नेचुरामोर न्यूट्री हार्ट — हृदय व नस सुरक्षा गाइड', resp, [
        { text: '💊 सेवन विधि व खुराक', query: 'न्यूट्री हार्ट कैसे खाएं' },
        { text: '🌿 घटक व सामग्री क्या है?', query: 'न्यूट्री हार्ट के घटक क्या हैं' }
      ], 'health', 'nutri_heart');
      return true;
    }

    // C. Pet Vet / CFC Plus & Cow Milk Boost
    if (cleanQ.includes('pet vet') || cleanQ.includes('पेट वेट') || cleanQ.includes('cfc') || cleanQ.includes('सीएफसी') || cleanQ.includes('गाय का दूध') || cleanQ.includes('भैंस का दूध') || cleanQ.includes('दूध कम') || cleanQ.includes('dudh kam') || cleanQ.includes('दूध और फैट') || ((cleanQ.includes('गाय') || cleanQ.includes('भैंस') || cleanQ.includes('पशु')) && (cleanQ.includes('दूध') || cleanQ.includes('फैट')))) {
      const resp = `🐄 **बायोफिट सीएफसी प्लस / पेट वेट — दुग्ध व फैट वृद्धि फॉर्मूला:**\n• **समस्या:** पाचन विकार व पोषक तत्वों की कमी से गाय-भैंस का दूध व फैट घट जाता है।\n• **वैज्ञानिक समाधान:** सीएफसी प्लस (CFC Plus) में शतावरी, मेथी, विटामिन्स, मिनरल्स व प्री-प्रोबायोटिक्स हैं।\n🥄 **खुराक:** 10 से 15 ग्राम प्रतिदिन प्रति दुधारू पशु दाने या चारे में मिलाकर दें। 10-12 दिनों में दूध 15-20% और फैट 0.5 से 1.2 डिग्री बढ़ जाता है।`;
      renderCrispSpecialBox('🐄 सीएफसी प्लस / पेट वेट — दूध व फैट वृद्धि फॉर्मूला', resp, [
        { text: '🌿 इसके अंदर क्या-क्या घटक हैं?', query: 'सीएफसी प्लस के अंदर क्या है' },
        { text: '🥄 देने की सही विधि व खुराक', query: 'सीएफसी प्लस कैसे खिलाएं' },
        { text: '💰 सीएफसी 500g व 1kg पैक ऑफर', query: 'सीएफसी पशु आहार सप्लीमेंट ऑफर' }
      ], 'pashu', 'cfc_plus');
      return true;
    }

    // D. Tomato Leaf Curl Virus & Antiviral (टमाटर में कुकड़ा रोग)
    if (cleanQ.includes('kukda') || cleanQ.includes('कुकड़ा') || cleanQ.includes('antiviral') || cleanQ.includes('एंटीवायरल') || cleanQ.includes('leaf curl') || cleanQ.includes('मरोड़िया') || cleanQ.includes('टमाटर')) {
      const resp = `🍅 **टमाटर में कुकड़ा रोग (Leaf Curl Virus) का वैज्ञानिक समाधान:**\nकुकड़ा रोग सफेद मक्खी द्वारा फैलाया जाने वाला वायरस है।\n🧪 **स्प्रे फॉर्मूला (प्रति 15 लीटर पंप):**\n1. **बायोफिट एंटीवायरल (Antiviral):** 35 मिली (वायरस का फैलाव रोकने हेतु)\n2. **बायो-99 (Bio-99):** 5 मिली (दवा को नसों तक पहुंचाने हेतु)\n3. **बायोफिट इन्काउंटर / नीम तेल:** 30 मिली (सफेद मक्खी नियंत्रण हेतु)\n👉 5 से 7 दिनों में नई स्वस्थ, सीधी व हरी पत्तियां आनी शुरू हो जाती हैं।`;
      renderCrispSpecialBox('🛡️ टमाटर कुकड़ा रोग व बायोफिट एंटीवायरल फॉर्मूला', resp, [
        { text: '💧 बायो-99 की सही डोज क्या है?', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '🌱 फूल बढ़ाने के लिए स्टिमरिच डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' }
      ], 'agri', 'antiviral');
      return true;
    }

    // E. Flower Drop & Bloom Stagnation (बैंगन, भिंडी, मिर्च में फूल न आना)
    if ((cleanQ.includes('बैंगन') || cleanQ.includes('भिंडी') || cleanQ.includes('मिर्च') || cleanQ.includes('सब्जी')) && (cleanQ.includes('फूल') || cleanQ.includes('ful') || cleanQ.includes('फल') || cleanQ.includes('कल्ले'))) {
      const resp = `🌸 **बैंगन, भिंडी व मिर्च में बंपर फूल व पैदावार का फॉर्मूला:**\nजब पौधे में हार्मोनल असंतुलन होता है, तो फूल नहीं आते या गिर जाते हैं।\n🧪 **स्प्रे फॉर्मूला (प्रति 15 लीटर पंप):**\n1. **बायोफिट स्टिमरिच (Stimrich):** 35 मिली (फूलों की संख्या 35-40% बढ़ाता है)\n2. **बायो-99 (Bio-99):** 5 मिली (दवा को पत्तियों में तुरंत सोखने हेतु)\n3. **घुलनशील बोरॉन 20%:** 20 ग्राम (फूलों का गिरना पूरी तरह रोकने हेतु)\n👉 स्प्रे के 4 से 6 दिनों में नई कलियों और फूलों की बहार आ जाती है।`;
      renderCrispSpecialBox('🌸 सब्जी फसलों में फूल व पैदावार वृद्धि फॉर्मूला', resp, [
        { text: '🌱 स्टिमरिच व बायो-99 की सही डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '🌾 सब्जी फसलों का पूरा स्प्रे कैलेंडर', query: 'सब्जी मिर्च का स्प्रे कैलेंडर' }
      ], 'agri', 'stimrich');
      return true;
    }

    // F. Biofit Stimrich
    if (cleanQ.includes('stimrich') || cleanQ.includes('स्टिमरिच')) {
      const resp = `🌱 **बायोफिट स्टिमरिच (Stimrich) - 100% जैविक पौध वृद्धि टॉनिक:**\n• **खुराक:** 30 से 35 ml प्रति 15 लीटर पानी का पंप (5 ml बायो-99 के साथ)।\n• **बीज उपचार:** 10-15 ml प्रति किलो बीज (100% स्वस्थ फुटाव)।\n• **लाभ:** शाखाएं व कल्ले 30-40% बढ़ाता है, फूलों का झड़ना रोकता है और उपज में 25-35% की ठोस वृद्धि करता है।`;
      renderCrispSpecialBox('🌱 बायोफिट स्टिमरिच (Stimrich) संपूर्ण डोज व उपयोग विधि', resp, [
        { text: '🌿 इसके अंदर क्या-क्या घटक हैं?', query: 'स्टिमरिच के अंदर क्या है' },
        { text: '💧 बायो-99 की सही डोज क्या है?', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '🌾 गेहूं में स्टिमरिच स्प्रे कब करें?', query: 'गेहूं में स्टिमरिच स्प्रे कब करें' }
      ], 'agri', 'stimrich');
      return true;
    }

    // G. Biofit Bio-99
    if (cleanQ.includes('bio-99') || cleanQ.includes('bio99') || cleanQ.includes('बायो-99') || cleanQ.includes('बायो 99')) {
      const resp = `💧 **बायो-99 (Bio-99) - 100% सिलिकॉन सुपर स्प्रेडर, एक्टिवेटर व स्टिकर:**\n• **खुराक:** मात्र 5 ml प्रति 15 लीटर पानी का पंप (प्रति एकड़ 30-40 ml)।\n• **लाभ:** दवा को पत्तियों के आर-पार फैलाता है, 30 मिनट में बारिश से सुरक्षित करता है और किसी भी स्प्रे की कार्यक्षमता 35-40% बढ़ा देता है। घोल में सबसे अंत में मिलाएं।`;
      renderCrispSpecialBox('💧 बायो-99 (Bio-99) सटीक डोज व उपयोग विधि', resp, [
        { text: '🌱 स्टिमरिच की सही डोज क्या है?', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '🌾 गेहूं में बायो-99 स्प्रे', query: 'गेहूं में बायो-99 स्प्रे' }
      ], 'agri', 'bio99');
      return true;
    }

    // H. Biofit SHET (Soil Health Enhancement Technology)
    if (cleanQ.includes('shet') || cleanQ.includes('शेत') || cleanQ.includes('मिट्टी सुधार')) {
      const resp = `🌱 **बायोफिट शेत (SHET) - मृदा संवर्धक जैविक जीवाणु खाद:**\n• **खुराक:** 1 लीटर प्रति एकड़ (ड्रिप सिंचाई, फ्लड सिंचाई या 50 किलो गोबर खाद में मिलाकर)।\n• **लाभ:** जमीन को भुरभुरी बनाता है, जैविक कार्बन सुधारता है और मिट्टी में फिक्स पड़े फास्फोरस व पोटाश को पौधों की जड़ों तक पहुंचाता है।`;
      renderCrispSpecialBox('🌱 बायोफिट शेत (SHET) मृदा सुधारक गाइड', resp, [
        { text: '🌱 स्टिमरिच डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '💧 बायो-99 डोज', query: 'बायो-99 की सही डोज व उपयोग' }
      ], 'agri', 'shet');
      return true;
    }

    // I. Biofit Wrap-up
    if (cleanQ.includes('wrapup') || cleanQ.includes('wrap-up') || cleanQ.includes('रैपअप')) {
      const resp = `🛡️ **बायोफिट रैप-अप (Wrap-up) - प्राकृतिक जैविक फसल सुरक्षा कवच:**\n• **खुराक:** 30 से 40 ml प्रति 15 लीटर पानी का पंप।\n• **लाभ:** पत्तियों पर प्राकृतिक नैनो-फिल्म (सुरक्षा परत) बना देता है, जिससे फंगस, बैक्टीरिया व वायरस के जीवाणु पत्तों में प्रवेश नहीं कर पाते।`;
      renderCrispSpecialBox('🛡️ बायोफिट रैप-अप (Wrap-up) सुरक्षा कवच गाइड', resp, [
        { text: '💧 बायो-99 डोज', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '🌱 स्टिमरिच डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' }
      ], 'agri', 'wrapup');
      return true;
    }

    // J. Naturamore General Nutrition
    if (cleanQ.includes('naturamore') || cleanQ.includes('नेचुरामोर')) {
      const resp = `🌿 **नेचुरामोर (Naturamore) - 100% हर्बल न्यूट्रिशनल हेल्थ सप्लीमेंट:**\n• **सेवन विधि:** 1 चम्मच (10 ग्राम) सुबह गुनगुने दूध या पानी के साथ।\n• **घटक:** 5 तरह के प्राकृतिक प्रोटीन, 13 जरूरी विटामिन्स, 10 मिनरल्स, एलोवेरा, अश्वगंधा व ओमेगा-3 DHA।\n• **लाभ:** दिनभर ऊर्जा, रोग प्रतिरोधक क्षमता (Immunity) और मांसपेशियों व हड्डियों की संपूर्ण मजबूती।`;
      renderCrispSpecialBox('🌿 नेचुरामोर संपूर्ण स्वास्थ्य पोषण गाइड', resp, [
        { text: '🦴 जोड़ों के दर्द में जॉइंट केयर', query: 'नेचुरामोर जॉइंट केयर के बारे में बताओ' },
        { text: '❤️ हृदय स्वास्थ्य में न्यूट्री हार्ट', query: 'न्यूट्री हार्ट कैसे खाएं' },
        { text: '🩺 शुगर/डायबिटीज में उपयोग', query: 'शुगर में नेचुरामोर कैसे लें' }
      ], 'health', 'naturamore');
      return true;
    }

    // K. Homonym Disambiguation for "जड़" (Plant roots vs Hair roots)
    if (cleanQ.includes('जड़') || cleanQ.includes('jad') || cleanQ.includes('jado') || cleanQ.includes('जड़ों')) {
      const isHair = cleanQ.includes('बाल') || cleanQ.includes('hair') || cleanQ.includes('खालित्य') || sakhiConversationState.lastActiveDomain === 'beauty';
      const isPlant = cleanQ.includes('पौधा') || cleanQ.includes('फसल') || cleanQ.includes('खेत') || cleanQ.includes('गलन') || cleanQ.includes('माहू') || sakhiConversationState.lastActiveDomain === 'agri';

      if (isHair) {
        const resp = `💇 **बालों की जड़ों की मजबूती व पोषण फॉर्मूला:**\nबालों की जड़ें जब कमजोर होती हैं, तो हेयरफॉल शुरू होता है।\n• **नेट्सर्फ हर्ब्स एंड मोर हेयर न्यूट्रिएंट्स:** स्कैल्प में रक्त संचार बढ़ाकर जड़ों को पोषण देता है।\n• **विटामिन थेरेपी शैम्पू:** जड़ों को बिना केमिकल सुखाए डैंड्रफ मुक्त करता है।`;
        renderCrispSpecialBox('💇 बालों की जड़ों की मजबूती व पोषण', resp, [
          { text: '✨ हेयर न्यूट्रिएंट्स उपयोग विधि', query: 'नेट्सर्फ हेयर न्यूट्रिएंट्स का उपयोग कैसे करें' },
          { text: '🌸 रूसी व डैंड्रफ का इलाज', query: 'डैंड्रफ और बाल झड़ने का उपाय' }
        ], 'beauty', 'hair_roots');
        return true;
      } else if (isPlant) {
        const resp = `🌱 **फसल व पौधों की जड़ों की मजबूती (जड़ गलन व फुटाव):**\n• **जड़ गलन/फफूंद:** ट्राइकोडर्मा 2 किलो प्रति एकड़ या बायोफिट शेत (SHET) 1 लीटर प्रति एकड़ ड्रिप/पानी में दें।\n• **जड़ों का फुटाव:** स्टिमरिच 35ml + बायो-99 5ml का स्प्रे जड़ों के विकास और सफेद जड़ों की संख्या 40% तक बढ़ा देता है।`;
        renderCrispSpecialBox('🌱 फसल की जड़ों का विकास व जड़ गलन रोकथाम', resp, [
          { text: '🌱 शेत (SHET) मृदा सुधारक डोज', query: 'बायोफिट शेत की सही डोज' },
          { text: '🧪 स्टिमरिच कल्ले व फुटाव डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' }
        ], 'agri', 'plant_roots');
        return true;
      } else {
        const resp = `किसान साथी, 'जड़' से आपका क्या तात्पर्य है? कृपया नीचे से सही विषय चुनें ताकि मैं बिल्कुल सटीक जानकारी दे सकूँ:`;
        renderCrispSpecialBox('🔍 विषय स्पष्ट करें: जड़ों का संदर्भ', resp, [
          { text: '🌱 फसल/पौधे की जड़ें (कृषि व जड़ गलन)', query: 'फसल की जड़ों का विकास और जड़ गलन उपाय' },
          { text: '💇 बालों की जड़ें व मजबूती (हेयर केयर)', query: 'बालों की जड़ों को मजबूत करने का उपाय' }
        ], 'omni', 'roots_disambiguation');
        return true;
      }
    }

    return false;
  }

  // 17. DEDICATED SPRAY CALENDAR ROUTER (CROPS & GENERAL MENU)
  function handleDedicatedSprayQuery(cleanQ, query) {
    const isSprayQ = cleanQ.includes('स्प्रे') || cleanQ.includes('spray') || cleanQ.includes('दवा का छिड़काव') || cleanQ.includes('छिड़काव');
    if (!isSprayQ) return false;

    const isWheat = cleanQ.includes('गेहूं') || cleanQ.includes('wheat') || cleanQ.includes('gehu');
    const isMustard = cleanQ.includes('सरसों') || cleanQ.includes('mustard') || cleanQ.includes('sarso') || cleanQ.includes('sarson');
    const isChana = cleanQ.includes('चना') || cleanQ.includes('gram') || cleanQ.includes('chana');
    const isVeg = cleanQ.includes('सब्जी') || cleanQ.includes('टमाटर') || cleanQ.includes('मिर्च') || cleanQ.includes('बैंगन') || cleanQ.includes('प्याज') || cleanQ.includes('veg');

    if (isWheat) {
      const resp = `🌾 **गेहूं फसल का 4-चरण वैज्ञानिक स्प्रे कैलेंडर:**\n• 1. कल्ले व फुटाव (21-25 दिन, पहली सिंचाई बाद): स्टिमरिच 35ml + बायो-99 5ml + 19:19:19 75g प्रति 15L पंप।\n• 2. गांठ बनते समय (40-45 दिन): एनपीके 12:61:0 75g + बायो-99 5ml।\n• 3. गभोट अवस्था (60-65 दिन): एनपीके 0:52:34 75g + बोरॉन 20% 20g (लंबी बालियां व परागण)।\n• 4. दाना भराव (दूधिया अवस्था): एनपीके 0:0:50 (पोटाश) 75g प्रति पंप (वजनदार व चमकदार दाना)।`;
      renderCrispSpecialBox('🌾 गेहूं फसल का वैज्ञानिक 4-चरण स्प्रे कैलेंडर', resp, [
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' },
        { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' },
        { text: '🧪 स्टिमरिच डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' }
      ], 'agri', 'wheat_calendar');
      return true;
    }

    if (isMustard) {
      const resp = `🌱 **सरसों फसल का वैज्ञानिक स्प्रे कैलेंडर:**\n• 1. शाखा फुटाव (25-30 दिन): स्टिमरिच 35ml + बायो-99 5ml + घुलनशील सल्फर 40g प्रति 15L पंप।\n• 2. फूल आने से पूर्व (45-50 दिन): बोरॉन 20% 20g + 19:19:19 75g प्रति पंप।\n• 3. माहू/चेपा दिखने पर: इमिडाक्लोप्रिड 17.8% SL 6ml + बायो-99 5ml प्रति 15L पंप।\n• 4. फली दाना बनते समय: एनपीके 0:0:50 75g (तेल प्रतिशत व दाना वजन बढ़ाने हेतु)।`;
      renderCrispSpecialBox('🌱 सरसों फसल का वैज्ञानिक स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' }
      ], 'agri', 'mustard_calendar');
      return true;
    }

    if (isChana) {
      const resp = `🌿 **चना फसल का वैज्ञानिक स्प्रे कैलेंडर:**\n• 1. शाखाएं व कल्ले (30-35 दिन): स्टिमरिच 35ml + बायो-99 5ml + 19:19:19 75g।\n• 2. फूल आने से पूर्व: बोरॉन 20% 20g प्रति 15L पंप (फूल झड़ने से रोकने हेतु)।\n• 3. घटी-इल्ली रोकथाम: इमामेक्टिन बेंजोएट 5% SG 8g + बायो-99 5ml प्रति 15L पंप।\n• 4. दाना भराव: 0:0:50 75g प्रति 15L पंप।`;
      renderCrispSpecialBox('🌿 चना फसल का वैज्ञानिक स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' }
      ], 'agri', 'chana_calendar');
      return true;
    }

    if (isVeg) {
      const resp = `🥦 **सब्जी, मिर्च व टमाटर का वैज्ञानिक स्प्रे कैलेंडर:**\n• 1. रोपाई के 15-20 दिन: स्टिमरिच 35ml + बायो-99 5ml + 19:19:19 75g।\n• 2. फूल आने के समय: बोरॉन 20% 20g + स्टिमरिच 35ml प्रति पंप।\n• 3. रसचूसक कीट (थ्रिप्स/सफेद मक्खी): एसिटामिप्रिड 20% SP 8g + बायो-99 5ml।\n• 4. फल विकास: एनपीके 13:0:45 या 0:0:50 75g प्रति 15L पंप।`;
      renderCrispSpecialBox('🥦 सब्जी, मिर्च व टमाटर का स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' }
      ], 'agri', 'veg_calendar');
      return true;
    }

    // General Spray Calendar Selection (Interactive crop menu)
    const prompt = `किसान साथी! हर फसल का स्प्रे समय और दवाओं का कॉम्बिनेशन अलग होता है। कृपया नीचे अपनी फसल चुनें ताकि उसका सटीक 4-चरण स्प्रे कैलेंडर देख सकें:`;
    renderCrispSpecialBox('📅 फसलों का संपूर्ण वैज्ञानिक स्प्रे कैलेंडर', prompt, [
      { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
      { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' },
      { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' },
      { text: '🥦 सब्जी, मिर्च व टमाटर कैलेंडर', query: 'सब्जी मिर्च का स्प्रे कैलेंडर' }
    ], 'agri', 'spray_menu');
    return true;
  }

  // 18. DEDICATED NETSURF DIRECT SELLING & ₹8.19L CAPPING PLAN ROUTER
  function handleNetsurfPlanQuery(cleanQ, query) {
    const isNetsurf = cleanQ.includes('netsurf') || cleanQ.includes('नेट्सर्फ');
    const isPlan = cleanQ.includes('plan') || cleanQ.includes('प्लान') || cleanQ.includes('कमीशन') || cleanQ.includes('commission') || cleanQ.includes('8.19') || cleanQ.includes('8,19,250') || cleanQ.includes('कैपिंग') || cleanQ.includes('बाइनरी') || cleanQ.includes('डायरेक्ट सेलिंग') || cleanQ.includes('रिटेल') || cleanQ.includes('क्लब नेट्सर्फ') || cleanQ.includes('बिजनेस प्लान') || cleanQ.includes('बिज़नेस प्लान');

    if (isNetsurf && isPlan || (cleanQ.includes('नेट्सर्फ प्लान') || cleanQ.includes('netsurf plan') || cleanQ.includes('8,19,250') || cleanQ.includes('8.19 लाख'))) {
      const planAnswer = `🌿 **नेट्सर्फ डायरेक्ट सेलिंग बिज़नेस व कमीशन प्लान (प्रमाणित):**\n• 1. रिटेल डिस्काउंट: एमआरपी (MRP) पर 15% से 30% तक की सीधी छूट।\n• 2. रिटेल बोनस: क्लब नेट्सर्फ के माध्यम से 5% से 15% का अतिरिक्त टर्नओवर लाभ।\n• 3. जनरेशन इनकम: आपकी टीम के प्रथम जनरेशन के लीडर्स की कमाई का 3% से 8% हिस्सा।\n• 4. टर्नओवर मैचिंग बोनस: दोनों टीमों (Team A & Team B) के मैचिंग टर्नओवर पर 3% से 6% सीधा कमीशन।\n• 5. सर्वोच्च साप्ताहिक कैपिंग: प्रति सप्ताह अधिकतम ₹8,19,250 (मासिक ₹32,77,000)।\n• 6. फैमिली प्रोटेक्शन: ₹2 लाख से ₹10 लाख का एक्सीडेंटल बीमा व नॉमिनी सुरक्षा सुविधा।`;

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
      sakhiConversationState.lastActiveDomain = 'netsurf';
      sakhiConversationState.lastActiveEntity = 'netsurf_plan';
      sakhiConversationState.lastActiveEntityName = 'नेट्सर्फ बिज़नेस प्लान';
      streamBotMessage(html, 'नेट्सर्फ डायरेक्ट सेलिंग में 15 से 30 प्रतिशत रिटेल डिस्काउंट और अधिकतम 8 लाख 19 हजार 250 रुपये साप्ताहिक कैपिंग उपलब्ध है।');
      return true;
    }
    return false;
  }

  // 19. CORE INTENT RETRIEVAL & DOMAIN FIREWALL
  function processKnowledgeQuery(query) {
    const rawQ = query.trim();
    const cleanQ = normalizeQueryText(rawQ);
    const targetDomain = classifyQueryDomain(cleanQ);

    // Track user input in history
    sakhiConversationState.history.push({
      role: 'user',
      query: rawQ,
      clean: cleanQ,
      time: Date.now()
    });

    // 1. Everyday Conversational & Casual Social Router
    if (handleEverydayConversations(cleanQ, rawQ)) {
      return;
    }

    // 1.1 E-Books Intelligence, FAQs & Direct UPI Payment Assistance (BK001, BK002, BK015, BK016, BK018)
    if (handleBookInquiriesAndFaq(cleanQ, rawQ)) {
      return;
    }

    // 1.2 13 Specialized Health Pages, Medical Science, Diet Charts & Sponsor Guidance Router
    if (handle13HealthPagesAndSponsor(cleanQ, rawQ)) {
      return;
    }

    // 2. Multi-Turn Pronoun & Follow-Up Context Resolver (e.g., "kya kya hai iske andar", "kaise khaye", etc.)
    if (resolveFollowUpQuery(cleanQ, rawQ)) {
      return;
    }

    // 3. Comprehensive Netsurf Products & Agricultural Entities Handler
    if (handleComprehensiveNetsurfCatalog(cleanQ, rawQ)) {
      return;
    }

    // 4. Dedicated Spray Calendar Router (Wheat, Mustard, Chana, Veg, or Interactive Menu)
    if (handleDedicatedSprayQuery(cleanQ, rawQ)) {
      return;
    }

    // 5. Certified Netsurf Business & ₹8.19L Capping Plan Router
    if (handleNetsurfPlanQuery(cleanQ, rawQ)) {
      return;
    }

    if (!knowledgeData || !knowledgeData.intents) {
      synthesizeDynamicAnswer(query, targetDomain);
      return;
    }

    // 6. Strict Domain Isolation Filter (Health NEVER leaks to Agri, Agri NEVER leaks to Health!)
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

    // 7. Token-Weighted Intent Scorer
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
  function renderCrispSpecialBox(title, bodyText, chips, domain, entityKey) {
    if (domain) sakhiConversationState.lastActiveDomain = domain;
    if (entityKey) sakhiConversationState.lastActiveEntity = entityKey;
    if (title) sakhiConversationState.lastActiveEntityName = title;
    sakhiConversationState.lastAnswerSnippet = (bodyText || '').slice(0, 150);

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

    // Update conversation state and entity memory
    sakhiConversationState.lastActiveDomain = intent.domain || domain || sakhiConversationState.lastActiveDomain;
    sakhiConversationState.lastActiveEntity = intent.id || (title ? title.toLowerCase() : null);
    sakhiConversationState.lastActiveEntityName = title;

    // Normalize known entity keys
    const titleLow = title.toLowerCase();
    if (titleLow.includes('joint') || titleLow.includes('जॉइंट') || titleLow.includes('गठिया') || titleLow.includes('जोड़ों')) {
      sakhiConversationState.lastActiveEntity = 'joint_care';
      sakhiConversationState.lastActiveDomain = 'health';
    } else if (titleLow.includes('हार्ट') || titleLow.includes('heart')) {
      sakhiConversationState.lastActiveEntity = 'nutri_heart';
      sakhiConversationState.lastActiveDomain = 'health';
    } else if (titleLow.includes('cfc') || titleLow.includes('सीएफसी') || titleLow.includes('पशु') || titleLow.includes('दूध')) {
      sakhiConversationState.lastActiveEntity = 'cfc_plus';
      sakhiConversationState.lastActiveDomain = 'pashu';
    } else if (titleLow.includes('stimrich') || titleLow.includes('स्टिमरिच')) {
      sakhiConversationState.lastActiveEntity = 'stimrich';
      sakhiConversationState.lastActiveDomain = 'agri';
    } else if (titleLow.includes('bio-99') || titleLow.includes('bio99') || titleLow.includes('बायो-99')) {
      sakhiConversationState.lastActiveEntity = 'bio99';
      sakhiConversationState.lastActiveDomain = 'agri';
    } else if (titleLow.includes('antiviral') || titleLow.includes('एंटीवायरल') || titleLow.includes('कुकड़ा')) {
      sakhiConversationState.lastActiveEntity = 'antiviral';
      sakhiConversationState.lastActiveDomain = 'agri';
    }

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
    if (cleanQ.includes('अवनीश') || cleanQ.includes('avneesh') || cleanQ.includes('बात करो') || cleanQ.includes('नंबर') || cleanQ.includes('हेल्प') || consecutiveAmbiguousCount >= 2) {
      consecutiveAmbiguousCount = 0;
      const waUrl = buildAvneeshWhatsAppHandoffUrl(query);
      const speech = `नमस्ते! मैं आपको हमारे मुख्य विशेषज्ञ अवनीश मिश्रा जी का सीधा WhatsApp लिंक देती हूँ।`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
          🤝 व्यक्तिगत मार्गदर्शन: अवनीश मिश्रा जी से सीधा संपर्क
        </div>
        <div style="font-size:0.95rem;line-height:1.6;color:#1e293b;margin-bottom:12px;">
          आपके इस प्रश्न <strong>"${escapeHtml(query)}"</strong> पर 100% सटीक व्यक्तिगत मार्गदर्शन हेतु आप हमारे मुख्य विशेषज्ञ अवनीश मिश्रा जी से सीधे WhatsApp पर जुड़ सकते हैं।
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

    // Context Retention: Check if user is currently discussing an active entity
    const prevEntity = sakhiConversationState.lastActiveEntity;
    const prevName = sakhiConversationState.lastActiveEntityName;

    if (prevEntity && prevName) {
      const speech = `माफ़ कीजिए, क्या आप ${prevName} के बारे में कुछ और पूछना चाहते हैं?`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.02rem;margin-bottom:6px;">
          🌸 बातचीत का संदर्भ: ${escapeHtml(prevName)}
        </div>
        <div style="font-size:0.95rem;line-height:1.6;color:#334155;margin-bottom:10px;">
          माफ़ कीजिए, मैं आपके पिछले वाक्य <strong>"${escapeHtml(query)}"</strong> को पूरी तरह समझ नहीं पाई। क्या आप <strong>${escapeHtml(prevName)}</strong> से जुड़ा कुछ जानना चाहते हैं?
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('इसके अंदर क्या क्या सामग्री है?')">
            🌿 इसके अंदर क्या-क्या है?
          </button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('इसे लेने या स्प्रे करने की सही खुराक और नियम क्या है?')">
            💊 सही खुराक व सेवन विधि
          </button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('इसकी सही कीमत और डिस्काउंट ऑफर क्या है?')">
            💰 कीमत व डिस्काउंट ऑफर
          </button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं व फसलों का स्प्रे कैलेंडर')">
            🌾 नया विषय शुरू करें
          </button>
        </div>
      `;
      streamBotMessage(html, speech);
      return;
    }

    const speech = `नमस्ते! आपका सवाल बहुत महत्वपूर्ण है। कृपया नीचे से अपना मुख्य विषय चुनें:`;
    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.02rem;margin-bottom:6px;">
        🌸 क्षमा करें, सवाल स्पष्ट करने में सहायता करें
      </div>
      <div style="font-size:0.95rem;line-height:1.6;color:#334155;margin-bottom:10px;">
        आपके प्रश्न <strong>"${escapeHtml(query)}"</strong> पर बिल्कुल सटीक जानकारी देने के लिए कृपया नीचे से सही विषय चुनें:
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं व फसलों में कल्ले और पैदावार बढ़ाने का फॉर्मूला')">
          🌾 <span>खेती व फसलें</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          🐄 <span>पशुपालन व डेयरी</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('डायबिटीज और शुगर कंट्रोल का फॉर्मूला')">
          🩺 <span>स्वास्थ्य व रोग</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('चेहरे की झाइयां और झुर्रियां मिटाने का नुस्खा')">
          ✨ <span>सौंदर्य व त्वचा</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ बिज़नेस प्लान और ₹8.19L साप्ताहिक कैपिंग')">
          💼 <span>नेट्सर्फ प्रोडक्ट्स</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('खेती का डॉक्टर व कृषि ई-बुक्स की जानकारी')">
          📚 <span>ई-बुक्स</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('दादी के असली आयुर्वेदिक घरेलू नुस्खे')">
          🌸 <span>दादी के नुस्खे</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('आरोग्यम डिजिटल ई-टेलर व एफिलिएट कमाई')">
          💰 <span>कमाई व करियर</span>
        </button>
      </div>

      <div style="background:#f8fafc;border:1.5px dashed #cbd5e1;border-radius:12px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span style="font-size:0.82rem;color:#64748b;">या सीधे अवनीश मिश्रा जी से बात करना चाहते हैं?</span>
        <button type="button" class="sakhi-choice-btn" style="padding:6px 12px;font-size:0.82rem;margin:0;width:auto;" onclick="window.connectToAvneeshMishra('${escapeHtml(query)}')">
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
              💼 नेट्सर्फ प्रोडक्ट्स
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('खेती का डॉक्टर व कृषि ई-बुक्स की जानकारी')">
              📚 ई-बुक्स
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('दादी के असली आयुर्वेदिक घरेलू नुस्खे')">
              🌸 दादी के नुस्खे
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('आरोग्यम डिजिटल ई-टेलर व एफिलिएट कमाई')">
              💰 कमाई व करियर
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
      backdrop.style.display = 'flex';
      backdrop.style.visibility = 'visible';
      backdrop.style.opacity = '1';
      backdrop.style.pointerEvents = 'auto';
      updateSakhiHeaderUserBadge();
      setTimeout(() => {
        const input = document.getElementById('sakhiTextInput');
        if (input && window.innerWidth > 640) input.focus();
      }, 300);
    }
  };

  window.closeSakhiModal = function () {
    const backdrop = document.getElementById('sakhiModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.style.display = 'none';
      backdrop.style.visibility = 'hidden';
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
    }
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
