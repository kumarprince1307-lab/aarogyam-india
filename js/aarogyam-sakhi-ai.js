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
  const MASTER_ADMIN_PHONE = '6260243321';
  const SAKHI_AVATAR_IMG = '/images/sakhi/aarogyam-sakhi.webp';
  const SAKHI_BANNER_IMG = '/images/sakhi/aarogyam-sakhi-banner.webp';

  let knowledgeData = null;
  let isSoundEnabled = true;
  let recognitionInstance = null;
  let isRecording = false;
  let activeSpeechBtn = null;
  let currentActiveDomain = 'omni';

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

  // 3. USER PROFILE HELPERS
  function getUserPhone() {
    return (
      localStorage.getItem('aarogyam_user_phone') ||
      localStorage.getItem('user_phone') ||
      localStorage.getItem('user_mobile') ||
      localStorage.getItem('SAKHI_USER_PHONE') ||
      ''
    ).trim();
  }

  function getUserName() {
    let name = (
      localStorage.getItem('aarogyam_user_name') ||
      localStorage.getItem('user_name') ||
      localStorage.getItem('SAKHI_USER_NAME') ||
      ''
    ).trim();
    if (name === 'null' || name.toLowerCase() === 'undefined') name = '';
    return name;
  }

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
            <span>✨ विषय चुनें (Categories)</span>
            <button type="button" class="sakhi-plus-menu-close" onclick="window.toggleSakhiPlusMenu(false)">✕</button>
          </div>
          <div class="sakhi-plus-grid">
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('🌾 गेहूं व फसलों में कल्ले व पैदावार 2x बढ़ाना')">
              <span class="sakhi-item-icon">🌿</span>
              <div class="sakhi-item-text">
                <strong>खेती व फसलें</strong>
                <small>गेहूं, सरसों, खाद, स्प्रे डोज</small>
              </div>
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('🐄 गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
              <span class="sakhi-item-icon">🐄</span>
              <div class="sakhi-item-text">
                <strong>पशुपालन</strong>
                <small>दूध-फैट 8%+, थनैला उपचार</small>
              </div>
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('🩺 डायबिटीज और शुगर कंट्रोल का फॉर्मूला')">
              <span class="sakhi-item-icon">🩺</span>
              <div class="sakhi-item-text">
                <strong>स्वास्थ्य व रोग</strong>
                <small>शुगर, जोड़ दर्द, बीपी, डाइट</small>
              </div>
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('💄 चेहरे की झाइयां और झुर्रियां मिटाने का नुस्खा')">
              <span class="sakhi-item-icon">💄</span>
              <div class="sakhi-item-text">
                <strong>सौंदर्य व त्वचा</strong>
                <small>झाइयां, झुर्रियां, एलोवेरा लेप</small>
              </div>
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('🧴 नेट्सर्फ बिज़नेस प्लान और ₹8.19L साप्ताहिक कैपिंग')">
              <span class="sakhi-item-icon">🧴</span>
              <div class="sakhi-item-text">
                <strong>नेट्सर्फ प्रॉडक्ट्स</strong>
                <small>बायोफिट, नेचुरामोर, 20%-40% छूट</small>
              </div>
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('🥣 दादी के असली आयुर्वेदिक घरेलू नुस्खे')">
              <span class="sakhi-item-icon">🥣</span>
              <div class="sakhi-item-text">
                <strong>दादी के नुस्खे</strong>
                <small>प्रामाणिक घरेलू व आयुर्वेदिक उपाय</small>
              </div>
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('💼 आरोग्यम डिजिटल ई-टेलर व एफिलिएट कमाई')">
              <span class="sakhi-item-icon">💼</span>
              <div class="sakhi-item-text">
                <strong>कमाई व करियर</strong>
                <small>घर बैठे स्मार्ट ई-टेलर लिंक शेयर</small>
              </div>
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('👑 फाउंडर अवनीश जी का विज़न व सीधा WhatsApp संपर्क')">
              <span class="sakhi-item-icon">👑</span>
              <div class="sakhi-item-text">
                <strong>अवनीश जी से बात</strong>
                <small>डायरेक्ट WhatsApp कंसल्टेशन</small>
              </div>
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

  function getDynamicUserGreetingName() {
    let name = getUserName();
    if (name && name.toLowerCase() !== 'null' && name.toLowerCase() !== 'undefined' && name.toLowerCase() !== 'admin' && name.toLowerCase() !== 'aarogyam master') {
      return name;
    }
    try {
      const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
      if (sess && sess.name && sess.name.trim()) return sess.name.trim();
    } catch (e) {}
    try {
      const user = JSON.parse(localStorage.getItem('AI_USER') || '{}');
      if (user && user.name && user.name.trim()) return user.name.trim();
    } catch (e) {}
    return '';
  }

  // 9. CHATGPT-GRADE GREETING (CLEAN - NO BANNER IMAGE, DYNAMIC USER NAME)
  function renderInitialGreeting() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const rawName = getDynamicUserGreetingName();
    const displayName = rawName ? `${rawName} जी` : 'किसान साथी';
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
  }

  // 11. SUBMISSION HANDLER & LOGGING
  function handleUserSubmit(userQuery) {
    const query = (userQuery || '').trim();
    if (!query) return;

    const input = document.getElementById('sakhiTextInput');
    if (input) input.value = '';

    appendUserMessage(query);

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

    let crisp1 = '';
    if (mainAnatomy) {
      crisp1 = mainAnatomy.split('।')[0] + '।';
    }
    let crisp2 = '';
    if (mainFirstAid) {
      crisp2 = mainFirstAid.split('।').slice(0, 2).join('।') + '।';
    }
    let combinedCrisp = `${crisp1} ${crisp2}`.trim();
    if (!combinedCrisp) combinedCrisp = mainFirstAid || mainAnatomy;

    let emergencyAlert = '';
    if (isEmergencyQuery(originalQuery)) {
      emergencyAlert = `
        <div class="sakhi-emergency-alert" style="background:#fee2e2;border:1.5px solid #ef4444;border-radius:12px;padding:10px;margin-bottom:8px;color:#991b1b;display:flex;gap:8px;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:1.2rem;"></i>
          <div><strong>आपातकालीन चेतावनी:</strong> सीने में तेज दर्द, पसीना या सांस फूलना हार्ट अटैक का लक्षण हो सकता है। तुरंत 108 एम्बुलेंस बुलाएं या नजदीकी अस्पताल जाएं!</div>
        </div>
      `;
    }

    // Action Chips based on STRICT Domain (NO DADI KE NUSKHE ON CROPS!)
    let domainActionPills = '';
    if (domain === 'agri') {
      domainActionPills = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('सही स्प्रे डोज और समय क्या है?')">
          <span>🧪 सही स्प्रे डोज व समय</span> →
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('खेती डॉक्टर ई-बुक कैसे खरीदें?')">
          <span>📚 खेती डॉक्टर ई-बुक (ऑफर ₹99)</span> →
        </button>
      `;
    } else if (domain === 'pashu') {
      domainActionPills = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          <span>🐄 आहार व खुराक (Dose) नियम</span> →
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('थनैला रोग का तुरंत घरेलू और हर्बल इलाज')">
          <span>🔴 थनैला प्राथमिक उपचार</span> →
        </button>
      `;
    } else if (domain === 'health') {
      domainActionPills = `
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('सात्विक डाइट और परहेज चार्ट')">
          <span>🥗 सात्विक डाइट व परहेज</span> →
        </button>
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
        ${escapeHtml(combinedCrisp)}
      </div>
      ${buildMsgAudioBtnMarkup(combinedCrisp)}

      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
        <div style="font-weight:900;color:#15803d;font-size:0.9rem;margin-bottom:8px;">
          👉 क्या आप इसके बारे में आगे यह जानना चाहते हैं?
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${domainActionPills}
          ${subTopicsHtml}
        </div>
      </div>

      ${reference ? `
        <div style="margin-top:8px;font-size:0.75rem;color:#94a3b8;font-style:italic;">
          📜 <strong>संदर्भ:</strong> ${escapeHtml(reference)}
        </div>
      ` : ''}
    `;

    streamBotMessage(html, combinedCrisp);
  }

  // 13. DYNAMIC SYNTHESIZER (WHEN NO EXACT STATIC INTENT MATCHES)
  function synthesizeDynamicAnswer(query, domain) {
    let crispAnswer = `इस समस्या में वैज्ञानिक प्रोटोकॉल का पालन करें। संपूर्ण जैविक पोषण और संतुलित दिनचर्या रखें।`;

    if (domain === 'agri') {
      crispAnswer = `फसल में बढ़वार व कल्ले बढ़ाने हेतु प्रति 15 लीटर पानी में 25ml StimRich + 5ml Bio-99 मिलाकर पहली सिंचाई के बाद स्प्रे करें। जड़ों के विकास हेतु जड़ में Biofit SHET चलाएं।`;
    } else if (domain === 'pashu') {
      crispAnswer = `पशुओं में दूध व फैट वृद्धि के लिए दैनिक चारे में 10 ग्राम Biofit CFL पाउडर सुबह-शाम दें। यह रोमन सूक्ष्मजीवों को सक्रिय कर दूध 2 से 3 लीटर और फैट 8%+ बढ़ाता है।`;
    } else if (domain === 'health') {
      crispAnswer = `पुरानी बीमारियों व दर्द में आंतों की शुद्धि हेतु नेचुरामोर De-Tox लें। जोड़ों के दर्द में नेचुरामोर Joints Care और सुबह गुनगुने पानी में सोंठ-अजवाइन का सेवन अत्यंत लाभकारी है।`;
    } else if (domain === 'beauty') {
      crispAnswer = `त्वचा में निखार व झाइयां दूर करने हेतु रात में सोने से पहले जायफल को कच्चे दूध में घिसकर एलोवेरा जेल के साथ लगाएं। 15 दिन में त्वचा प्राकृतिक रूप से चमकने लगेगी।`;
    } else if (domain === 'netsurf' || domain === 'business') {
      crispAnswer = `आरोग्यम इंडिया व नेट्सर्फ में फ्री जॉइनिंग करके आप 20% से 40% रिटेल मार्जिन और साप्ताहिक टर्नओवर मैचिंग पर ₹8,19,250 तक की आय प्राप्त कर सकते हैं। अधिक जानकारी हेतु अवनीश सर से संपर्क करें।`;
    } else if (domain === 'founder') {
      crispAnswer = `आदरणीय अवनीश कुमार जी आरोग्यम इंडिया के विज़नरी फाउंडर हैं, जिन्होंने भारत के किसानों और परिवारों को रोगमुक्त और आर्थिक रूप से संपन्न बनाने का संकल्प लिया है।`;
    }

    const waMsg = `नमस्ते अवनीश सर! 🙏\nमेरा सवाल है: "${query}"\nकृपया इस पर व्यक्तिगत मार्गदर्शन व समाधान बताएं।`;
    const waUrl = `https://wa.me/91${MASTER_ADMIN_PHONE}?text=${encodeURIComponent(waMsg)}`;

    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.02rem;margin-bottom:6px;">
        🌿 ${escapeHtml(query)} - सटीक समाधान
      </div>
      <div style="font-size:0.96rem;line-height:1.6;color:#1e293b;margin-bottom:6px;">
        ${escapeHtml(crispAnswer)}
      </div>
      ${buildMsgAudioBtnMarkup(crispAnswer)}

      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
        <div style="font-weight:900;color:#15803d;font-size:0.9rem;margin-bottom:8px;">
          👉 व्यक्तिगत मार्गदर्शन व समाधान:
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#ffffff;border-color:#16a34a;text-decoration:none;">
            <i class="fa-brands fa-whatsapp"></i> अवनीश सर से WhatsApp पर पूछें →
          </a>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं में कल्ले 2 गुना कैसे बढ़ाएं?')">
            <span>🌾 कृषि स्प्रे कैलेंडर</span> →
          </button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह और शुगर कंट्रोल का फॉर्मूला')">
            <span>🩺 स्वास्थ्य व डाइट सलाह</span> →
          </button>
        </div>
      </div>
    `;

    streamBotMessage(html, crispAnswer);
  }

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
