/**
 * ====================================================================
 * AAROGYAM SAKHI AI - OMNI-DOMAIN AI (KRISHI, SEHAT, PASHU, BEAUTY)
 * Version: 6.0 (Sakhi's Secret Nuskhe, Emergency Alert, Symptom Synthesizer,
 *               Cross-Domain Universal Intelligence & 2.2s Streaming)
 * ====================================================================
 */

'use strict';

(function () {
  const MASTER_ADMIN_PHONE = '7974422572';
  const SAKHI_AVATAR_IMG = '/images/sakhi/aarogyam-sakhi.jpg';

  let knowledgeData = null;
  let isSoundEnabled = true;
  let recognitionInstance = null;
  let isRecording = false;
  let currentDiagnosticIntent = null;

  // 1. PAGE DOMAIN DETECTION
  function detectCurrentPageDomain() {
    const path = (window.location.pathname || '').toLowerCase();

    if (path.includes('hair') || path.includes('skin') || path.includes('beauty')) {
      return 'beauty';
    }
    if (path.includes('pashu') || path.includes('dairy') || path.includes('cattle') || path.includes('poultry') || path.includes('fish')) {
      return 'pashu';
    }
    if (
      path.includes('health/') ||
      path.includes('diabetes') ||
      path.includes('joint') ||
      path.includes('thyroid') ||
      path.includes('weight') ||
      path.includes('heart') ||
      path.includes('liver') ||
      path.includes('women') ||
      path.includes('kids') ||
      path.includes('dental') ||
      path.includes('sexual')
    ) {
      return 'health';
    }
    if (
      path.includes('agriculture') ||
      path.includes('kharif') ||
      path.includes('kheti') ||
      path.includes('fasal') ||
      path.includes('ebooks/')
    ) {
      return 'agri';
    }

    return 'omni';
  }

  // 2. USER PROFILE HELPERS
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

  function getBestReferralCode() {
    return (
      localStorage.getItem('aarogyam_referral_code') ||
      localStorage.getItem('user_referral_code') ||
      getUserPhone() ||
      'AGRI2026'
    );
  }

  // 3. UNLIMITED ACCESS
  function isUnlimitedUser() {
    return true;
  }

  function getDailyQuestionsUsed() {
    try {
      const d = new Date();
      const key = `SAKHI_QUOTA_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
      return parseInt(localStorage.getItem(key) || '0', 10);
    } catch (e) {
      return 0;
    }
  }

  function incrementDailyQuestions() {
    try {
      const d = new Date();
      const key = `SAKHI_QUOTA_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
      const current = getDailyQuestionsUsed();
      localStorage.setItem(key, String(current + 1));
      return current + 1;
    } catch (e) {
      return 1;
    }
  }

  // 4. LOAD OMNI-DOMAIN KNOWLEDGE BASE (v6.0)
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

  // 5. PROFANITY & EMERGENCY SHIELD
  const PROFANITY_REGEX = /(गाली|madarchod|bhenchod|chutiya|harami|bhosdi|gaand|porn|nude|xxx|randi|suicide|zeher|poison\s*dose)/i;

  function checkSafetyAndProfanity(query) {
    if (PROFANITY_REGEX.test(query)) {
      return {
        isSafe: false,
        message: 'आरोग्यम सखी एक मर्यादित व वैज्ञानिक मंच है। कृपया स्वास्थ्य, कृषि, पशुपालन या सौंदर्य संबंधी शालीन व उपयोगी प्रश्न पूछें। 🙏'
      };
    }
    return { isSafe: true };
  }

  function isEmergencyQuery(query) {
    const q = query.toLowerCase();
    return q.includes('सीने में दर्द') || q.includes('chest pain') || q.includes('हार्ट अटैक') || q.includes('heart attack') || q.includes('बेहोश');
  }

  // 6. SPEECH RECOGNITION (बोलकर पूछें)
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
    if (input) input.placeholder = 'खेत, सेहत, पशु या ब्यूटी का सवाल बोलें या लिखें...';
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

  let activeSpeechBtn = null;

  window.toggleMessageSpeech = function (btn, encodedText) {
    if (!window.speechSynthesis) return;

    const text = decodeURIComponent(encodedText || '').trim();

    // If currently speaking this exact message, mute it!
    if (activeSpeechBtn === btn) {
      window.speechSynthesis.cancel();
      btn.classList.remove('speaking');
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>सुनें</span>';
      activeSpeechBtn = null;
      const avatar = document.getElementById('sakhiAvatarFrame');
      if (avatar) avatar.classList.remove('speaking');
      return;
    }

    // Stop any other active speech
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
    const safeText = encodeURIComponent(text.replace(/<[^>]*>/g, '').trim());
    return `
      <div style="margin-top:8px;">
        <button type="button" class="sakhi-msg-audio-btn" onclick="window.toggleMessageSpeech(this, '${safeText}')" title="आवाज़ में सुनें या म्यूट करें">
          <i class="fa-solid fa-volume-high"></i>
          <span>सुनें</span>
        </button>
      </div>
    `;
  }

  // 8. BUILD UI DOM ELEMENTS (LEFT ALIGNED FAB & MODAL)
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

    // 1. Pill Setup (Check if already injected by universal-nav-drawer)
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

      // 5-SECOND SMART AUTO-COLLAPSE (TO COMPACT FLOATING AVATAR)
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
      pill.onclick = openSakhiModal;
    }

    // 2. ALWAYS ENSURE MODAL BACKDROP EXISTS IN DOM
    ensureModalBackdropExists();
  }

  function buildChatWindowMarkup(isFullscreen) {
    const currentDomain = detectCurrentPageDomain();
    let domainSubtitle = 'आपकी अपनी डिजिटल कृषि, स्वास्थ्य व पशु विशेषज्ञ';
    if (currentDomain === 'health') domainSubtitle = 'आपकी अपनी पर्सनल हेल्थ व नेचुरामोरे सलाहकार';
    else if (currentDomain === 'pashu') domainSubtitle = 'आपकी अपनी पशु मित्र व डेयरी-पोल्ट्री सलाहकार';
    else if (currentDomain === 'beauty') domainSubtitle = 'आपकी अपनी नेचुरल स्किन व हेयर केयर सलाहकार';

    return `
      <div class="sakhi-chat-window" id="sakhiChatWindow">
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
              <h3>आरोग्यम सखी AI <span style="font-size:0.7rem;background:#22c55e;color:#fff;padding:2px 8px;border-radius:10px;">ऑनलाइन 24×7</span></h3>
              <p>${domainSubtitle}</p>
            </div>
          </div>
          <div class="sakhi-header-actions" style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="sakhi-share-btn" onclick="window.shareAarogyamSakhi()" title="सखी AI को शेयर करें">
              <i class="fa-solid fa-share-nodes"></i>
              <span>शेयर</span>
            </button>
            <button type="button" class="sakhi-sound-toggle-btn" id="sakhiSoundToggleBtn" title="आवाज़ चालू/बंद करें">
              <i class="fa-solid fa-volume-high"></i>
            </button>
            ${!isFullscreen ? `
              <a href="/aarogyam-sakhi.html" class="sakhi-sound-toggle-btn" title="फुल स्क्रीन में खोलें" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center;">
                <i class="fa-solid fa-expand" style="font-size:0.85rem;"></i>
              </a>
              <button type="button" class="sakhi-close-btn" id="sakhiCloseBtn" title="बंद करें">✕</button>
            ` : ''}
          </div>
        </div>

        <!-- Quota Bar -->
        <div class="sakhi-quota-bar" id="sakhiQuotaBar">
          <span style="color:#15803d;font-weight:800;">🌿 संपूर्ण किसान व परिवार सेवा:</span>
          <span class="sakhi-quota-pill unlimited" id="sakhiQuotaBadge">✨ 100% निशुल्क असीमित सलाह</span>
        </div>

        <!-- Messages Area -->
        <div class="sakhi-messages-wrap" id="sakhiMessagesWrap">
          <!-- Rendered dynamically -->
        </div>

        <!-- Legal Note -->
        <div class="sakhi-legal-note">
          ⚖️ सूचनात्मक मार्गदर्शन: उपयोग से पूर्व उत्पाद लेबल निर्देश व स्थानीय विशेषज्ञ की अनुशंसा का संज्ञान अवश्य लें।
        </div>

        <!-- Input Footer -->
        <div class="sakhi-input-footer">
          <button type="button" class="sakhi-mic-btn" id="sakhiMicBtn" title="बोलकर पूछें (माइक)" onclick="if(window.AarogyamSakhiToggleRec)window.AarogyamSakhiToggleRec();">
            <i class="fa-solid fa-microphone"></i>
          </button>
          <input type="text" class="sakhi-text-input" id="sakhiTextInput" placeholder="खेत, सेहत, पशु या ब्यूटी का सवाल बोलें या लिखें..." autocomplete="off" onkeydown="if(event.key==='Enter'){event.preventDefault();window.submitSakhiFromInput();}" />
          <button type="button" class="sakhi-send-btn" id="sakhiSendBtn" title="भेजें" onclick="window.submitSakhiFromInput();">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
  }

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
    // If background page audio greeting is playing, stop it so only Sakhi talks
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

  // 9. CONTEXT-AWARE INITIAL GREETING & CHIPS
  function renderInitialGreeting() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const userName = getUserName();
    const userPhone = getUserPhone();
    const domain = detectCurrentPageDomain();

    let domainGreeting = 'खेत की चिंता छोड़िए! गेहूं, धान, सरसों, चना, सब्जियां या कृषि दवाओं के बारे में बेझिझक पूछें।';
    let domainChips = `
      <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
        <span>🌾 गेहूं की वैज्ञानिक खेती व कल्ले 2x बढ़ाना</span>
        <span>→</span>
      </button>
      <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('सरसों में माहू चेपा और सफेद रतुआ रोकथाम')">
        <span>🟡 सरसों: माहू (चेपा) व सफेद रतुआ से सुरक्षा</span>
        <span>→</span>
      </button>
      <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('कोराजन और इमामेक्टिन की सही डोज क्या है?')">
        <span>🧪 किसी भी दवा की डोज व उपयोग पूछें</span>
        <span>→</span>
      </button>
    `;

    if (domain === 'health') {
      domainGreeting = 'अपनी सेहत की चिंता छोड़िए! जोड़ों का दर्द, उंगली में दर्द, डायबिटीज, थायरॉइड, नींद न आना या लिवर-किडनी के बारे में पूछें।';
      domainChips = `
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('जोड़ों में दर्द और उंगलियों में अकड़न का इलाज')">
          <span>🦴 जोड़ों व उंगलियों में दर्द (यूरिक एसिड व ग्रीस)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('डायबिटीज और ब्लड शुगर कंट्रोल का फॉर्मूला')">
          <span>🩺 डायबिटीज व शुगर नियंत्रण (डाइट + नेचुरामोरे)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('नींद नहीं आती और तनाव रहता है क्या करें')">
          <span>🌙 गहरी नींद व अनिद्रा का पादभ्यंग नुस्खा</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('पौरुष कमजोरी और ED का समाधान')">
          <span>⚡ पौरुष स्वास्थ्य व स्टैमिना (Man Wellness)</span>
          <span>→</span>
        </button>
      `;
    } else if (domain === 'pashu') {
      domainGreeting = 'पशु, डेयरी व पोल्ट्री की चिंता छोड़िए! गाय-भैंस में दूध-फैट वृद्धि, थनैला, मुर्गी पालन या मछली पालन के बारे में पूछें।';
      domainChips = `
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट 2 गुना बढ़ाने का फॉर्मूला')">
          <span>🐄 दूध 2-3L व फैट 8%+ (Biofit CFL फॉर्मूला)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('थनैला रोग का तुरंत घरेलू और हर्बल इलाज')">
          <span>🔴 थनैला (Mastitis) आपातकालीन राहत नुस्खा</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('मुर्गी पालन में रानीखेत से बचाव और वजन बढ़ाना')">
          <span>🐔 मुर्गी पालन: रानीखेत, CRD व वजन वृद्धि</span>
          <span>→</span>
        </button>
      `;
    } else if (domain === 'beauty') {
      domainGreeting = 'प्राकृतिक सौंदर्य की बात सखी के साथ! चेहरे पर झुर्रियां, झाइयां, पिंपल्स, बाल झड़ना व विटामिन-ई के बारे में पूछें।';
      domainChips = `
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('चेहरे की झाइयां और झुर्रियां हटाने का नुस्खा')">
          <span>🌟 झाइयां, झुर्रियां व जायफल-एलोवेरा लेप</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('बालों में विटामिन ई कैसे लगाएं और बाल झड़ना रोकें')">
          <span>✨ बाल झड़ना, रूसी व विटामिन-E का सही प्रयोग</span>
          <span>→</span>
        </button>
      `;
    } else if (domain === 'omni') {
      domainGreeting = 'खेत, सेहत, पशुपालन व सौंदर्य का एक मंच! आप किसी भी विषय पर मुझसे बेझिझक सवाल पूछ सकते हैं।';
      domainChips = `
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('जोड़ों में दर्द और उंगलियों में अकड़न का इलाज')">
          <span>🦴 जोड़ों का दर्द व यूरिक एसिड नुस्खा</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('चेहरे की झाइयां और झुर्रियां हटाने का नुस्खा')">
          <span>🌟 चेहरे की झाइयां व झुर्रियां (जायफल लेप)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
          <span>🌾 कृषि: गेहूं में कल्ले 2x व रतुआ रोकथाम</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          <span>🐄 पशुपालन: दूध व फैट 8%+ वृद्धि फॉर्मूला</span>
          <span>→</span>
        </button>
      `;
    }

    let cleanName = userName;
    if (!cleanName || cleanName.toLowerCase() === 'aarogyam master' || cleanName.toLowerCase() === 'admin') {
      cleanName = 'अवनीश';
    }

    const universalFourPills = `
      <div class="sakhi-choice-pills-wrap" style="margin-top:12px;">
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
          <span>🌾 <strong>कृषि व फसल रक्षा</strong> (गेहूं, सरसों, कीटनाशक डोज)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('मधुमेह और शुगर कंट्रोल का फॉर्मूला')">
          <span>🩺 <strong>स्वास्थ्य व पुरानी बीमारियां</strong> (डायबिटीज, जोड़ों का दर्द, बीपी, लिवर)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('चेहरे की झाइयां और झुर्रियां हटाने का नुस्खा')">
          <span>✨ <strong>सौंदर्य, त्वचा व बाल</strong> (झाइयां, झुर्रियां, बाल झड़ना, विटामिन ई)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          <span>🐄 <strong>पशुपालन, डेयरी व पोल्ट्री</strong> (दूध व फैट वृद्धि, सीएफसी, थनैला)</span>
          <span>→</span>
        </button>
      </div>
    `;

    const greetingSpeechText = `नमस्ते ${cleanName} जी! मैं आपकी आरोग्यम सखी हूँ। आज मैं आपकी क्या मदद कर सकती हूँ?`;

    if (userName || userPhone) {
      wrap.innerHTML = `
        <div class="sakhi-msg-row bot">
          <div class="sakhi-msg-bubble">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid #16a34a;" onerror="this.style.display='none'">
              <div>
                <strong>नमस्ते ${escapeHtml(cleanName)} जी! 🙏</strong><br>
                <span style="font-size:0.8rem;color:#166534;">मैं आपकी <strong>आरोग्यम सखी</strong> हूँ।</span>
              </div>
            </div>
            आज मैं आपकी क्या मदद कर सकती हूँ? आप मुझसे कृषि, स्वास्थ्य, सौंदर्य/त्वचा, पशुपालन या किसी भी विषय पर बेझिझक सवाल पूछ सकते हैं।

            ${buildMsgAudioBtnMarkup(greetingSpeechText)}

            ${universalFourPills}
          </div>
        </div>
      `;
    } else {
      wrap.innerHTML = `
        <div class="sakhi-msg-row bot">
          <div class="sakhi-msg-bubble">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid #16a34a;" onerror="this.style.display='none'">
              <div>
                <strong>नमस्ते! 🙏</strong><br>
                <span style="font-size:0.8rem;color:#166534;">मैं आपकी <strong>आरोग्यम सखी</strong> हूँ।</span>
              </div>
            </div>
            आपसे बातचीत शुरू करने और आपकी ज़रूरत के अनुसार सटीक सलाह देने के लिए कृपया अपना नाम व मोबाइल नंबर दर्ज करें:

            <div class="sakhi-onboard-card" id="sakhiGuestOnboardCard">
              <h4>🌿 आरोग्यम प्रोफाइल (1-क्लिक निशुल्क रजिस्ट्रेशन)</h4>
              <p>खेत, सेहत, पशु व सौंदर्य की निशुल्क असीमित सलाह हेतु:</p>
              <div class="sakhi-onboard-inputs-row">
                <input type="text" class="sakhi-onboard-input" id="sakhiOnboardName" placeholder="आपका शुभ नाम (जैसे: अवनीश कुमार)" />
                <input type="tel" class="sakhi-onboard-input" id="sakhiOnboardPhone" placeholder="10-अंकों का मोबाइल नंबर" maxlength="10" />
              </div>
              <button type="button" class="sakhi-onboard-submit-btn" onclick="window.submitSakhiOnboarding()">
                <span>सखी AI से बात शुरू करें</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div style="margin-top:10px;font-size:0.82rem;color:#64748b;text-align:center;">
              या नीचे दिए गए सीधे विषय पर क्लिक करें:
            </div>

            ${universalFourPills}
          </div>
        </div>
      `;
    }
  }

  // 10. GUEST ONBOARDING SUBMISSION
  window.submitSakhiOnboarding = function () {
    const nameInput = document.getElementById('sakhiOnboardName');
    const phoneInput = document.getElementById('sakhiOnboardPhone');

    let name = (nameInput?.value || '').trim();
    let phone = (phoneInput?.value || '').trim().replace(/\D/g, '');

    if (!name) {
      alert('कृपया अपना शुभ नाम दर्ज करें।');
      nameInput?.focus();
      return;
    }

    if (phone.length < 10) {
      alert('कृपया 10-अंकों का सही मोबाइल नंबर दर्ज करें।');
      phoneInput?.focus();
      return;
    }

    localStorage.setItem('aarogyam_user_name', name);
    localStorage.setItem('aarogyam_user_phone', phone);
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_phone', phone);
    localStorage.setItem('SAKHI_USER_NAME', name);
    localStorage.setItem('SAKHI_USER_PHONE', phone);

    const card = document.getElementById('sakhiGuestOnboardCard');
    if (card) {
      card.innerHTML = `
        <div style="background:#dcfce7;color:#166534;font-weight:900;padding:10px 14px;border-radius:12px;text-align:center;">
          ✅ बहुत-बहुत धन्यवाद ${escapeHtml(name)} जी! आपका स्वागत है। 🌿
        </div>
      `;
    }

    streamBotMessage(`
      <div>
        <strong>राम-राम ${escapeHtml(name)} जी! 🙏</strong><br><br>
        आपका नंबर दर्ज हो गया है। अब आप बेझिझक कोई भी सवाल पूछ सकते हैं—खेत, सेहत, पशुपालन, पोल्ट्री या ब्यूटी के बारे में!
      </div>
      <div class="sakhi-choice-pills-wrap" style="margin-top:12px;">
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('जोड़ों में दर्द और उंगलियों में अकड़न का इलाज')">
          <span>🦴 जोड़ों का दर्द व यूरिक एसिड नुस्खा</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('चेहरे की झाइयां और झुर्रियां हटाने का नुस्खा')">
          <span>🌟 चेहरे की झाइयां व झुर्रियां (जायफल लेप)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
          <span>🌾 गेहूं में कल्ले 2x बढ़ाना</span>
          <span>→</span>
        </button>
      </div>
    `, `धन्यवाद ${name} जी! अब बताइए आपका क्या सवाल है?`);
  };

  // 11. STREAMING & TYPING INDICATOR
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
        <span class="sakhi-typing-label">आरोग्यम सखी टाइप कर रही हैं... ✍️</span>
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

  function streamBotMessage(fullHtmlContent, speechText, bookCardHtml, tubeCardHtml, followupChipsHtml, nuskhaBtnHtml) {
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

        let finalHtml = fullHtmlContent;
        if (nuskhaBtnHtml) {
          finalHtml += nuskhaBtnHtml;
        }
        if (tubeCardHtml) {
          finalHtml += tubeCardHtml;
        }
        if (bookCardHtml) {
          finalHtml += bookCardHtml;
        }
        if (followupChipsHtml) {
          finalHtml += followupChipsHtml;
        }

        bubble.innerHTML = finalHtml;
        wrap.scrollTop = wrap.scrollHeight;
      }
    }, 28);
  }

  // 12. MATCH RELEVANT BOOK BASED ON QUERY
  function getRelevantBookForQuery(query) {
    const q = (query || '').toLowerCase();

    if (q.includes('सब्जी') || q.includes('टमाटर') || q.includes('मिर्च') || q.includes('आलू') || q.includes('प्याज') || q.includes('लहसुन')) {
      return {
        id: 'BK015',
        title: 'सब्जी मास्टर गाइड (11 प्रमुख सब्जियां)',
        desc: 'सब्जियों का सम्पूर्ण वैज्ञानिक स्प्रे कैलेंडर व रोग नियंत्रण तालिका',
        price: 99,
        link: '/ebooks/book-landing.html?id=BK015'
      };
    }
    if (q.includes('धान') || q.includes('चावल') || q.includes('सोयाबीन') || q.includes('मक्का') || q.includes('कपास')) {
      return {
        id: 'BK001',
        title: 'खरीफ फसल मास्टर गाइड 2026',
        desc: 'धान, सोयाबीन, कपास व मक्का की सम्पूर्ण प्रैक्टिकल सचित्र गाइड',
        price: 99,
        link: '/ebooks/kharif-master-guide-2026.html'
      };
    }
    if (q.includes('पशु') || q.includes('गाय') || q.includes('भैंस') || q.includes('दूध') || q.includes('फैट') || q.includes('थनैला') || q.includes('मुर्गी') || q.includes('मछली')) {
      return {
        id: 'PASHU01',
        title: 'खेती का डॉक्टर व पशु मित्र गाइड',
        desc: 'पशु, डेयरी, पोल्ट्री व मत्स्य पालन का 100% सफल वैज्ञानिक चार्ट',
        price: 99,
        link: '/pashu-palan.html'
      };
    }
    if (q.includes('शुगर') || q.includes('डायबिटीज') || q.includes('गठिया') || q.includes('जोड़') || q.includes('उंगली') || q.includes('वजन') || q.includes('थायरॉइड') || q.includes('हार्ट') || q.includes('नींद') || q.includes('खून') || q.includes('sexual') || q.includes('पौरुष') || q.includes('बाल') || q.includes('स्किन') || q.includes('झाइयां')) {
      return {
        id: 'HLT01',
        title: 'आरोग्यम संपूर्ण स्वास्थ्य व आयुर्वेद अमृत गाइड',
        desc: 'डायबिटीज, जोड़ों का दर्द, मोटापा, थायरॉइड, त्वचा व संपूर्ण स्वास्थ्य सुधार चार्ट',
        price: 99,
        link: '/health/diabetes.html'
      };
    }

    return {
      id: 'BK002',
      title: 'खेती का डॉक्टर (सम्पूर्ण फसल सुरक्षा)',
      desc: 'गेहूं, चना, सरसों, सभी रोग, कीड़े व 50+ दवाओं का मास्टर स्प्रे कैलेंडर',
      price: 99,
      link: '/ebooks/kheti-dr.html'
    };
  }

  function buildBookCardMarkup(book) {
    if (!book) return '';
    return `
      <div class="sakhi-book-cta-card" style="margin-top:14px;">
        <div class="sakhi-book-cta-info">
          <h4>📖 ${escapeHtml(book.title)}</h4>
          <p>${escapeHtml(book.desc)}</p>
        </div>
        <a href="${escapeHtml(book.link)}" class="sakhi-book-buy-btn">
          <span>₹${book.price || 99} में पढ़ें →</span>
        </a>
      </div>
    `;
  }

  function buildTubeCardMarkup(tubeUrl, tubeTitle) {
    if (!tubeUrl) return '';
    return `
      <a href="${escapeHtml(tubeUrl)}" target="_blank" class="sakhi-tube-card" title="प्रैक्टिकल वीडियो देखें">
        <div class="sakhi-tube-card-info">
          <div class="sakhi-tube-icon"><i class="fa-solid fa-play"></i></div>
          <div class="sakhi-tube-text">${escapeHtml(tubeTitle || '📺 आरोग्यम ट्यूब: लाइव प्रैक्टिकल परिणाम देखें')}</div>
        </div>
        <span class="sakhi-tube-btn-chip">वीडियो देखें →</span>
      </a>
    `;
  }

  // 13. SAKHI'S SECRET NUSKHA REVEAL HANDLER
  window.revealSakhiNuskha = function (intentId, btn) {
    if (!knowledgeData || !knowledgeData.intents) return;
    const intent = knowledgeData.intents.find(i => i.id === intentId);
    if (!intent || !intent.sakhi_nuskha) return;

    if (btn) btn.style.display = 'none';

    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    let nuskhaInner = '';
    let speechText = '';
    const n = intent.sakhi_nuskha;
    if (typeof n === 'string') {
      nuskhaInner = `<div class="sakhi-nuskha-text">${escapeHtml(n)}</div>`;
      speechText = n;
    } else {
      speechText = `${n.title || 'सखी का नुस्खा'}। आवश्यक सामग्री: ${n.ingredients || ''}। प्रयोग विधि: ${n.usage || ''}`;
      nuskhaInner = `
        <div style="font-weight:900;color:#9d174d;font-size:1.02rem;margin-bottom:8px;">🌸 ${escapeHtml(n.title || 'सखी का दादी-नानी का नुस्खा')}</div>
        ${n.ingredients ? `<div style="margin-bottom:6px;font-size:0.9rem;"><strong>🌿 आवश्यक सामग्री:</strong> ${escapeHtml(n.ingredients)}</div>` : ''}
        ${n.method ? `<div style="margin-bottom:6px;font-size:0.9rem;"><strong>🥣 बनाने की विधि:</strong> ${escapeHtml(n.method)}</div>` : ''}
        ${n.usage ? `<div style="margin-bottom:6px;font-size:0.9rem;color:#166534;"><strong>✨ सेवन व प्रयोग विधि:</strong> ${escapeHtml(n.usage)}</div>` : ''}
      `;
    }

    const row = document.createElement('div');
    row.className = 'sakhi-msg-row bot';
    row.innerHTML = `
      <div class="sakhi-msg-bubble">
        <div class="sakhi-nuskha-box">
          <div class="sakhi-nuskha-header">
            <span>✨</span> <strong>सखी का दादी-नानी का प्रमाणित नुस्खा</strong>
          </div>
          ${nuskhaInner}
          ${buildMsgAudioBtnMarkup(speechText)}
        </div>
      </div>
    `;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
  };

  // 14. MAIN SUBMISSION WITH PROFANITY SHIELD & 2.2s DELAY
  function handleUserSubmit(userQuery) {
    const query = (userQuery || '').trim();
    if (!query) return;

    const input = document.getElementById('sakhiTextInput');
    if (input) input.value = '';

    appendUserMessage(query);

    // Safety / Profanity Check
    const safetyCheck = checkSafetyAndProfanity(query);
    if (!safetyCheck.isSafe) {
      appendTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        streamBotMessage(
          `<div style="color:#b91c1c;background:#fef2f2;padding:12px;border-radius:12px;border:1.5px solid #fecaca;"><strong>⚠️ सूचना:</strong> ${safetyCheck.message}</div>`,
          safetyCheck.message
        );
      }, 1000);
      return;
    }

    incrementDailyQuestions();
    appendTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      processKnowledgeQuery(query);
    }, 2200);
  }

  // 15. DYNAMIC SYMPTOM SYNTHESIZER & KNOWLEDGE MATCHER
  function processKnowledgeQuery(query) {
    const cleanQ = query.toLowerCase();

    if (!knowledgeData || !knowledgeData.intents) {
      synthesizeDynamicMedicalAgriAnswer(query);
      return;
    }

    let matchedIntent = null;
    let maxScore = 0;

    // Check if user clicked a specific subtopic title
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

    knowledgeData.intents.forEach((intent) => {
      let score = 0;
      (intent.keywords || []).forEach((kw) => {
        const kwLower = kw.toLowerCase();
        if (cleanQ.includes(kwLower)) {
          score += (kwLower.length >= 4 ? 3 : 2);
        }
      });
      if (score > maxScore) {
        maxScore = score;
        matchedIntent = intent;
      }
    });

    if (matchedIntent && maxScore > 0) {
      currentDiagnosticIntent = matchedIntent;
      renderDirectSummaryWithSubOptions(matchedIntent, query);
    } else {
      // Dynamic Intelligent Symptom Synthesizer Fallback
      synthesizeDynamicMedicalAgriAnswer(query);
    }
  }

  function renderSubTopicDirect(subTopic, parentIntent) {
    const matchedBook = getRelevantBookForQuery(subTopic.title);
    const tubeUrl = parentIntent.tube_url || '/tube.html';

    const html = `
      <div style="font-weight:900;color:#15803d;font-size:1.02rem;margin-bottom:6px;">
        ${escapeHtml(subTopic.title)}
      </div>
      <div style="font-size:0.95rem;line-height:1.6;color:#1e293b;margin-bottom:6px;">
        ${escapeHtml(subTopic.content)}
      </div>
      ${buildMsgAudioBtnMarkup(subTopic.content)}

      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
        <div style="font-weight:900;color:#15803d;font-size:0.9rem;margin-bottom:8px;">
          👉 क्या आप आगे यह भी जानना चाहते हैं?
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${parentIntent.sakhi_nuskha ? `
            <button type="button" class="sakhi-followup-chip" style="background:#fdf2f8;border-color:#f472b6;color:#be185d;" onclick="window.revealSakhiNuskha('${parentIntent.id}', this)">
              <span>🌸 सखी का अचूक नुस्खा</span>
              <span>→</span>
            </button>
          ` : ''}
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(parentIntent.title)}')">
            <span>🌿 इस रोग/फसल का संपूर्ण नियम</span>
            <span>→</span>
          </button>
          <a href="${escapeHtml(tubeUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#fef2f2;border-color:#fca5a5;color:#dc2626;text-decoration:none;">
            <span>📺 वीडियो परिणाम देखें</span>
            <span>→</span>
          </a>
        </div>
      </div>
    `;

    const bookCardHtml = buildBookCardMarkup(matchedBook);
    streamBotMessage(html, subTopic.content, bookCardHtml, '', '', '');
  }

  function renderDirectSummaryWithSubOptions(intent, originalQuery) {
    const summary = intent.direct_summary || {};
    const title = intent.title || summary.title || '🌿 सम्पूर्ण वैज्ञानिक मार्गदर्शन';
    const mainFirstAid = intent.ayurvedic_protocol || summary.first_aid || '';
    const mainAnatomy = intent.anatomy_physiology || intent.scientific_cause || summary.curiosity_hook || '';
    const reference = intent.reference || '';
    const matchedBook = getRelevantBookForQuery(originalQuery);

    let html = '';

    // Emergency warning check
    if (isEmergencyQuery(originalQuery)) {
      html += `
        <div class="sakhi-emergency-alert">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:1.2rem;margin-top:2px;"></i>
          <div>
            <strong>आपातकालीन चेतावनी (Emergency Alert):</strong> सीने में तेज दर्द, पसीना या घबराहट हार्ट अटैक का लक्षण हो सकता है। तुरंत 108 एम्बुलेंस बुलाएं या नजदीकी इमरजेंसी जाएं!
          </div>
        </div>
      `;
    }

    // CRISP 1-2 LINES PUNCHY REAL ANSWER
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

    html += `
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
        ${escapeHtml(title)}
      </div>

      <div style="font-size:0.96rem;line-height:1.6;color:#1e293b;margin-bottom:6px;">
        ${escapeHtml(combinedCrisp)}
      </div>
      ${buildMsgAudioBtnMarkup(combinedCrisp)}

      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
        <div style="font-weight:900;color:#15803d;font-size:0.9rem;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <span>👉</span> <strong>क्या आप इसके बारे में आगे यह जानना चाहते हैं?</strong>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
    `;

    // Interactive Subtopic Chips
    if (intent.sub_topics && intent.sub_topics.length > 0) {
      intent.sub_topics.forEach((st) => {
        html += `
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(st.title)}')">
            <span>${escapeHtml(st.title)}</span>
            <span>→</span>
          </button>
        `;
      });
    }

    // Nuskha Chip
    if (intent.sakhi_nuskha) {
      html += `
        <button type="button" class="sakhi-followup-chip" style="background:#fdf2f8;border-color:#f472b6;color:#be185d;" onclick="window.revealSakhiNuskha('${intent.id}', this)">
          <span>🌸 सखी का दादी-नानी का नुस्खा बताएं</span>
          <span>→</span>
        </button>
      `;
    }

    // Video Chip
    const tubeUrl = intent.tube_url || summary.tube_url || '/tube.html';
    html += `
        <a href="${escapeHtml(tubeUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#fef2f2;border-color:#fca5a5;color:#dc2626;text-decoration:none;">
          <span>📺 प्रैक्टिकल वीडियो देखें</span>
          <span>→</span>
        </a>
      </div>
    </div>
    `;

    if (reference) {
      html += `
        <div style="margin-top:8px;font-size:0.75rem;color:#94a3b8;font-style:italic;">
          📜 <strong>संदर्भ:</strong> ${escapeHtml(reference)}
        </div>
      `;
    }

    const bookCardHtml = buildBookCardMarkup(matchedBook);
    streamBotMessage(html, combinedCrisp, bookCardHtml, '', '', '');
  }

  // 16. DYNAMIC SYMPTOM SYNTHESIZER (WHEN NO EXACT STATIC INTENT MATCHES)
  function synthesizeDynamicMedicalAgriAnswer(query) {
    try {
      const logs = JSON.parse(localStorage.getItem('SAKHI_UNANSWERED_LOGS') || '[]');
      logs.push({
        query: query,
        domain: detectCurrentPageDomain(),
        timestamp: new Date().toISOString(),
        phone: getUserPhone()
      });
      localStorage.setItem('SAKHI_UNANSWERED_LOGS', JSON.stringify(logs.slice(-50)));
    } catch (e) {}

    const q = query.toLowerCase();
    const matchedBook = getRelevantBookForQuery(query);

    let crispAnswer = `इस समस्या में शरीर/फसल को विषाक्तता (Toxins) से मुक्त रखें। पर्याप्त पानी, सात्विक आहार और नेट्सर्फ De-Tox या Biofit जैविक पोषण का उपयोग करें।`;

    if (q.includes('दर्द') || q.includes('सूजन') || q.includes('चोट')) {
      crispAnswer = `जोड़ों व मांसपेशियों के दर्द में तिल के तेल में लहसुन-अजवाइन पकाकर गुनगुनी मालिश करें। नेचुरामोर Joints Care और रात को 1 चम्मच सोंठ चूर्ण तुरंत आराम देता है।`;
    } else if (q.includes('पेट') || q.includes('गैस') || q.includes('कब्ज') || q.includes('अपच')) {
      crispAnswer = `कब्ज व गैस में सुबह खाली पेट गुनगुने पानी में हींग, काला नमक व जीरा चूर्ण लें। आंतों की संपूर्ण सफाई हेतु नेचुरामोर De-Tox अत्यंत लाभकारी है।`;
    } else if (q.includes('पौधा') || q.includes('पत्ती') || q.includes('कीड़ा') || q.includes('फसल')) {
      crispAnswer = `फसल में पत्तियों के पीलेपन व विकास हेतु 15L पंप में 25ml StimRich + 5ml Bio-99 का स्प्रे करें और जड़ में Biofit SHET चलाएं।`;
    }

    const waMsg = `नमस्ते आरोग्यम सखी AI! 🙏\nमेरा सवाल है: "${query}"\nकृपया इस पर व्यक्तिगत सलाह और खुराक बताएं।`;
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
          👉 क्या आप इसके बारे में व्यक्तिगत मार्गदर्शन चाहते हैं?
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#ffffff;border-color:#16a34a;text-decoration:none;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp पर विशेषज्ञ से पूछें →
          </a>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह और शुगर कंट्रोल का फॉर्मूला')">
            <span>🩺 स्वास्थ्य व डाइट सलाह</span> →
          </button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
            <span>🌾 कृषि स्प्रे कैलेंडर</span> →
          </button>
        </div>
      </div>
    `;

    const bookCardHtml = buildBookCardMarkup(matchedBook);
    streamBotMessage(html, crispAnswer, bookCardHtml, '', '', '');
  }

  // 17. VIRAL SHARE
  window.shareAarogyamSakhi = function () {
    const refCode = getBestReferralCode();
    const shareUrl = `${window.location.origin}/aarogyam-sakhi.html?ref=${encodeURIComponent(refCode)}`;

    const shareTitle = 'आरोग्यम सखी AI - खेत, सेहत, पशुपालन व सौंदर्य के हर सवाल का वैज्ञानिक समाधान!';
    const shareText = `🌿 किसान व परिवारजनों के लिए बड़ी खुशखबरी! 🌿\n\nअब खेती, गेहूं, सरसों, धान, पशुपालन (दूध-फैट), सेहत (डायबिटीज, जोड़ दर्द) और सौंदर्य के लिए किसी के चक्कर काटने की जरूरत नहीं!\n\nमिलिए "आरोग्यम सखी AI" से — जो देती हैं हर सवाल का 100% सही व वैज्ञानिक जवाब! 👩‍🌾🩺\n\nअभी अपना सवाल पूछें बिल्कुल फ्री:\n${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      }).catch(() => {
        openWhatsAppDirect(shareText);
      });
    } else {
      openWhatsAppDirect(shareText);
    }
  };

  function openWhatsAppDirect(text) {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  window.askSakhiQuick = function (query) {
    handleUserSubmit(query);
  };

  // 18. GLOBAL BRIDGE FOR CONSULT AI EXPERT BUTTONS
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
    isUnlimited: isUnlimitedUser,
    getDailyUsed: getDailyQuestionsUsed,
    share: window.shareAarogyamSakhi,
    detectDomain: detectCurrentPageDomain
  };

  // AUTO-BOOT ENGINE ON DOM READY OR IMMEDIATELY IF ALREADY LOADED
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
