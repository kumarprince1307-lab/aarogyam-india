/**
 * ====================================================================
 * AAROGYAM SAKHI AI - OMNI-DOMAIN AI (KRISHI, SEHAT, PASHU, BEAUTY)
 * Version: 5.0 (Cross-Domain Universal Engine, Context-Aware Greetings,
 *               Aarogyam Tube Integration, Profanity Shield & 2.2s Streaming)
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

  // 1. PAGE DOMAIN DETECTION (कृषि, सेहत, पशु, सौंदर्य या यूनिवर्सल)
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

  // 4. LOAD OMNI-DOMAIN KNOWLEDGE BASE (v5.0)
  async function loadKnowledgeBase() {
    try {
      const res = await fetch('/data/krishi-ai-knowledge.json?v=' + Math.floor(Date.now() / 300000));
      if (res.ok) {
        knowledgeData = await res.json();
      }
    } catch (e) {
      console.warn('[Sakhi AI] Knowledge base fetch notice:', e);
    }
  }

  // 5. PROFANITY & SAFETY SHIELD
  const PROFANITY_REGEX = /(गाली|madarchod|bhenchod|chutiya|harami|bhosdi|gaand|sex|porn|nude|xxx|randi|suicide|zeher|poison\s*dose)/i;

  function checkSafetyAndProfanity(query) {
    if (PROFANITY_REGEX.test(query)) {
      return {
        isSafe: false,
        message: 'आरोग्यम सखी एक मर्यादित व वैज्ञानिक मंच है। कृपया स्वास्थ्य, कृषि, पशुपालन या सौंदर्य संबंधी शालीन व उपयोगी प्रश्न पूछें। 🙏'
      };
    }
    return { isSafe: true };
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

  // 8. BUILD UI DOM ELEMENTS (LEFT ALIGNED FAB & MODAL)
  const isDedicatedPage = window.location.pathname.includes('aarogyam-sakhi.html') || document.body.classList.contains('sakhi-page-body');

  function injectSakhiUI() {
    if (isDedicatedPage) {
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

    if (document.getElementById('sakhiFloatingPill')) return;

    // 1. Floating Action Pill (LEFT ALIGNED)
    const currentDomain = detectCurrentPageDomain();
    let pillLabel = 'आरोग्यम सखी AI';
    if (currentDomain === 'health') pillLabel = 'स्वास्थ्य सखी AI';
    else if (currentDomain === 'pashu') pillLabel = 'पशु सखी AI';
    else if (currentDomain === 'beauty') pillLabel = 'सौंदर्य सखी AI';

    const pill = document.createElement('div');
    pill.id = 'sakhiFloatingPill';
    pill.className = 'sakhi-floating-pill';
    pill.innerHTML = `
      <div class="sakhi-pill-avatar-wrap">
        <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" onerror="this.src='/images/logo/fevicon.png'" />
      </div>
      <span>${pillLabel}</span>
      <span class="sakhi-pill-live-dot"></span>
    `;
    pill.onclick = openSakhiModal;
    document.body.appendChild(pill);

    // 2. Chat Modal Window
    const backdrop = document.createElement('div');
    backdrop.id = 'sakhiModalBackdrop';
    backdrop.className = 'sakhi-modal-backdrop';
    backdrop.innerHTML = buildChatWindowMarkup(false);
    document.body.appendChild(backdrop);

    setupEventListeners(false);
    renderInitialGreeting();
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
          <button type="button" class="sakhi-mic-btn" id="sakhiMicBtn" title="बोलकर पूछें (माइक)">
            <i class="fa-solid fa-microphone"></i>
          </button>
          <input type="text" class="sakhi-text-input" id="sakhiTextInput" placeholder="खेत, सेहत, पशु या ब्यूटी का सवाल बोलें या लिखें..." autocomplete="off" />
          <button type="button" class="sakhi-send-btn" id="sakhiSendBtn" title="भेजें">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
  }

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
        const input = document.getElementById('sakhiTextInput');
        if (input && input.value.trim()) {
          handleUserSubmit(input.value.trim());
        }
      };
    }

    const textInput = document.getElementById('sakhiTextInput');
    if (textInput) {
      textInput.onkeydown = function (e) {
        if (e.key === 'Enter') {
          const val = this.value.trim();
          if (val) handleUserSubmit(val);
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
    const backdrop = document.getElementById('sakhiModalBackdrop');
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
      <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('चने में उकठा और फली छेदक इल्ली नियंत्रण')">
        <span>🌰 चना: उकठा (Wilt) व फली छेदक का जैविक इलाज</span>
        <span>→</span>
      </button>
      <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('कोराजन और इमामेक्टिन की सही डोज क्या है?')">
        <span>🧪 किसी भी दवा की डोज व उपयोग पूछें</span>
        <span>→</span>
      </button>
    `;

    if (domain === 'health') {
      domainGreeting = 'अपनी सेहत की चिंता छोड़िए! डायबिटीज, जोड़ों का दर्द, थायरॉइड, वेट लॉस, हृदय स्वास्थ्य व नेचुरामोरे के बारे में बेझिझक पूछें।';
      domainChips = `
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('डायबिटीज और ब्लड शुगर कंट्रोल का फॉर्मूला')">
          <span>🩺 डायबिटीज व शुगर नियंत्रण (डाइट + नेचुरामोरे)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('घुटने व जोड़ों के दर्द का पक्का इलाज')">
          <span>🦴 जोड़ों का दर्द व गठिया (Joint Care प्रोटोकॉल)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('पेट की चर्बी और वजन घटाने का डाइट प्लान')">
          <span>⚡ मोटापा व वजन घटाना (30-दिवसीय चार्ट)</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('थायरॉइड हॉर्मोन बैलेंस करने का आयुर्वेदिक तरीका')">
          <span>🦋 थायरॉइड हॉर्मोनल संतुलन व धनिया काढ़ा</span>
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
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('तालाब में मछली पालन और प्लवक निर्माण')">
          <span>🐟 मछली पालन: तालाब प्रबंधन व तेजी से वजन</span>
          <span>→</span>
        </button>
      `;
    } else if (domain === 'beauty') {
      domainGreeting = 'प्राकृतिक सौंदर्य की बात सखी के साथ! बाल झड़ना, डैंड्रफ, पिंपल्स, चेहरे का ग्लो व हर्बल स्किन केयर के बारे में पूछें।';
      domainChips = `
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('बाल झड़ना रोकने और नए बाल उगाने का उपाय')">
          <span>✨ बाल झड़ना, रूसी व हेयर सीरम फॉर्मूला</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('चेहरे के पिंपल्स और झाइयां हटाने का नुस्खा')">
          <span>🌟 ग्लोइंग स्किन, पिंपल्स व विटामिन थेरेपी</span>
          <span>→</span>
        </button>
      `;
    } else if (domain === 'omni') {
      domainGreeting = 'खेत, सेहत, पशुपालन व सौंदर्य का एक मंच! आप किसी भी विषय पर मुझसे बेझिझक सवाल पूछ सकते हैं।';
      domainChips = `
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
          <span>🌾 कृषि: गेहूं में कल्ले 2x व रतुआ रोकथाम</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('डायबिटीज और ब्लड शुगर कंट्रोल का फॉर्मूला')">
          <span>🩺 सेहत: डायबिटीज व शुगर नियंत्रण गाइड</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          <span>🐄 पशुपालन: दूध व फैट 8%+ वृद्धि फॉर्मूला</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('बाल झड़ना रोकने का आयुर्वेदिक तरीका')">
          <span>✨ सौंदर्य: बाल झड़ना व हेयर केयर गाइड</span>
          <span>→</span>
        </button>
      `;
    }

    if (userName && userPhone) {
      wrap.innerHTML = `
        <div class="sakhi-msg-row bot">
          <div class="sakhi-msg-bubble">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid #16a34a;" onerror="this.style.display='none'">
              <div>
                <strong>राम-राम ${escapeHtml(userName)} जी! 🙏</strong><br>
                <span style="font-size:0.8rem;color:#166534;">मैं आपकी <strong>आरोग्यम सखी</strong> हूँ।</span>
              </div>
            </div>
            ${domainGreeting}

            <div class="sakhi-choice-pills-wrap" style="margin-top:12px;">
              ${domainChips}
            </div>
          </div>
        </div>
      `;
      speakResponse(`राम-राम ${userName} जी! मैं आपकी आरोग्यम सखी हूँ। बताइए आज मैं आपकी क्या सेवा करूँ?`);
    } else {
      wrap.innerHTML = `
        <div class="sakhi-msg-row bot">
          <div class="sakhi-msg-bubble">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid #16a34a;" onerror="this.style.display='none'">
              <div>
                <strong>राम-राम किसान व मित्र भाई! 🙏</strong><br>
                <span style="font-size:0.8rem;color:#166534;">मैं आपकी <strong>आरोग्यम सखी</strong> हूँ।</span>
              </div>
            </div>
            आपसे बातचीत शुरू करने और आपकी ज़रूरत के अनुसार सटीक सलाह देने के लिए कृपया अपना नाम व मोबाइल नंबर दर्ज करें:

            <div class="sakhi-onboard-card" id="sakhiGuestOnboardCard">
              <h4>🌿 आरोग्यम प्रोफाइल (1-क्लिक निशुल्क रजिस्ट्रेशन)</h4>
              <p>खेत, सेहत, पशु व सौंदर्य की निशुल्क असीमित सलाह हेतु:</p>
              <div class="sakhi-onboard-inputs-row">
                <input type="text" class="sakhi-onboard-input" id="sakhiOnboardName" placeholder="आपका शुभ नाम (जैसे: रमेश कुमार)" />
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

            <div class="sakhi-choice-pills-wrap" style="margin-top:8px;">
              ${domainChips}
            </div>
          </div>
        </div>
      `;
      speakResponse('राम-राम! मैं आपकी आरोग्यम सखी हूँ। बातचीत शुरू करने के लिए अपना नाम और मोबाइल नंबर दर्ज करें।');
    }
  }

  // 10. GUEST ONBOARDING SUBMIT
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
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
          <span>🌾 गेहूं में कल्ले 2x बढ़ाना</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('डायबिटीज और ब्लड शुगर कंट्रोल का फॉर्मूला')">
          <span>🩺 डायबिटीज व शुगर नियंत्रण</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          <span>🐄 गाय-भैंस दूध व फैट 8%+</span>
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

  function streamBotMessage(fullHtmlContent, speechText, bookCardHtml, tubeCardHtml, followupChipsHtml) {
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
    if (q.includes('शुगर') || q.includes('डायबिटीज') || q.includes('गठिया') || q.includes('जोड़') || q.includes('वजन') || q.includes('थायरॉइड') || q.includes('हार्ट') || q.includes('बाल') || q.includes('स्किन')) {
      return {
        id: 'HLT01',
        title: 'आरोग्यम संपूर्ण स्वास्थ्य व आयुर्वेद अमृत गाइड',
        desc: 'डायबिटीज, जोड़ों का दर्द, मोटापा, थायरॉइड व संपूर्ण स्वास्थ्य सुधार चार्ट',
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

  // 13. MAIN SUBMISSION WITH PROFANITY SHIELD & TYPING DELAY
  function handleUserSubmit(userQuery) {
    const query = (userQuery || '').trim();
    if (!query) return;

    const input = document.getElementById('sakhiTextInput');
    if (input) input.value = '';

    appendUserMessage(query);

    // Check Safety / Profanity
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

  // 14. OMNI-DOMAIN INTENT MATCHER (ACROSS ALL SUBJECTS)
  function processKnowledgeQuery(query) {
    const cleanQ = query.toLowerCase();

    if (!knowledgeData || !knowledgeData.intents) {
      fallbackUnanswered(query);
      return;
    }

    let matchedIntent = null;
    let maxScore = 0;

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

      if (matchedIntent.direct_summary) {
        renderDirectSummaryWithSubOptions(matchedIntent, query);
      } else if (matchedIntent.responses) {
        const defaultResp = Object.values(matchedIntent.responses)[0];
        if (defaultResp) {
          renderFinalSolution(defaultResp, query);
        } else {
          fallbackUnanswered(query);
        }
      } else {
        fallbackUnanswered(query);
      }
    } else {
      fallbackUnanswered(query);
    }
  }

  function renderDirectSummaryWithSubOptions(intent, originalQuery) {
    const summary = intent.direct_summary;
    const matchedBook = getRelevantBookForQuery(originalQuery);

    let html = `
      <div style="margin-bottom:10px;">
        <h4 style="margin:0 0 8px 0;color:#15803d;font-size:1.1rem;font-weight:900;">${escapeHtml(summary.title || '🌿 सम्पूर्ण वैज्ञानिक मार्गदर्शन')}</h4>
      </div>

      <div class="sakhi-solution-box">
        <div class="sakhi-solution-header">🌿 1. तुरंत प्रभावी उपचार व डोज (First Aid Protocol):</div>
        <div>${escapeHtml(summary.first_aid)}</div>
      </div>

      <div class="sakhi-curiosity-box">
        <div class="sakhi-curiosity-header">⚠️ 2. वैज्ञानिक चेतावनी, डाइट व स्थायी समाधान:</div>
        <div>${escapeHtml(summary.curiosity_hook)}</div>
      </div>
    `;

    const tubeCardHtml = buildTubeCardMarkup(summary.tube_url, summary.tube_title);
    const bookCardHtml = buildBookCardMarkup(matchedBook);

    let followupChipsHtml = '';
    if (summary.follow_up_suggestions && summary.follow_up_suggestions.length > 0) {
      followupChipsHtml = `
        <div class="sakhi-followup-container">
          <div class="sakhi-followup-title">💡 किसान व परिवार मित्र, क्या आप यह भी जानना चाहते हैं?</div>
          <div class="sakhi-followup-list">
            ${summary.follow_up_suggestions.map((sug) => `
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(sug)}')">
                <span>${escapeHtml(sug)}</span>
                <span>→</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    streamBotMessage(html, summary.audio_text || summary.first_aid, bookCardHtml, tubeCardHtml, followupChipsHtml);
  }

  function renderFinalSolution(resp, query) {
    const matchedBook = getRelevantBookForQuery(query || resp.book_name);

    let html = `
      <div class="sakhi-solution-box">
        <div class="sakhi-solution-header">🌿 1. तुरंत प्रभावी उपचार (First Aid):</div>
        <div>${escapeHtml(resp.first_aid)}</div>
      </div>

      <div class="sakhi-curiosity-box">
        <div class="sakhi-curiosity-header">⚠️ 2. वैज्ञानिक चेतावनी व स्थायी समाधान:</div>
        <div>${escapeHtml(resp.curiosity_hook)}</div>
      </div>
    `;

    const tubeCardHtml = buildTubeCardMarkup(resp.tube_url, resp.tube_title);
    const bookCardHtml = buildBookCardMarkup(matchedBook);

    let followupChipsHtml = '';
    if (resp.follow_up_suggestions && resp.follow_up_suggestions.length > 0) {
      followupChipsHtml = `
        <div class="sakhi-followup-container">
          <div class="sakhi-followup-title">💡 क्या आप यह भी जानना चाहते हैं?</div>
          <div class="sakhi-followup-list">
            ${resp.follow_up_suggestions.map((sug) => `
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(sug)}')">
                <span>${escapeHtml(sug)}</span>
                <span>→</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    streamBotMessage(html, resp.audio_text || resp.first_aid, bookCardHtml, tubeCardHtml, followupChipsHtml);
  }

  // 15. UNANSWERED LOGGING & SMART WHATSAPP FALLBACK
  function fallbackUnanswered(query) {
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

    const waMsg = `नमस्ते आरोग्यम सखी AI जी! 🙏\nमेरा सवाल है: "${query}"\nकृपया इस पर सटीक वैज्ञानिक सलाह और सही समाधान बताएं।`;
    const waUrl = `https://wa.me/91${MASTER_ADMIN_PHONE}?text=${encodeURIComponent(waMsg)}`;

    let html = `
      <div>
        <strong>🌿 यह एक विशेष एवं महत्वपूर्ण प्रश्न है!</strong><br><br>
        इस प्रश्न का अध्ययन हमारे मुख्य विशेषज्ञ कर रहे हैं और इसका समाधान हमारे AI सिस्टम में अपडेट किया जा रहा है।<br><br>
        तुरंत प्रत्यक्ष सहायता के लिए आप हमारे मुख्य विशेषज्ञ से सीधे WhatsApp पर जुड़ सकते हैं:
      </div>

      <div style="margin-top:14px;">
        <a href="${escapeHtml(waUrl)}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#16a34a;color:#ffffff;padding:12px 20px;border-radius:24px;text-decoration:none;font-weight:900;font-size:0.95rem;box-shadow:0 4px 14px rgba(22,163,74,0.3);">
          <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i>
          <span>विशेषज्ञ से WhatsApp पर पूछें →</span>
        </a>
      </div>

      <div class="sakhi-followup-container" style="margin-top:16px;">
        <div class="sakhi-followup-title">💡 आप इन प्रमुख विषयों पर भी पूछ सकते हैं:</div>
        <div class="sakhi-followup-list">
          <button class="sakhi-followup-chip" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
            <span>🌾 गेहूं की पहली सिंचाई व कल्ले बढ़ाना</span>
            <span>→</span>
          </button>
          <button class="sakhi-followup-chip" onclick="window.askSakhiQuick('डायबिटीज और ब्लड शुगर कंट्रोल का फॉर्मूला')">
            <span>🩺 डायबिटीज व शुगर नियंत्रण डाइट</span>
            <span>→</span>
          </button>
          <button class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस में दूध और फैट बढ़ाने का फॉर्मूला')">
            <span>🐄 पशुपालन: दूध व फैट 8%+ वृद्धि</span>
            <span>→</span>
          </button>
          <button class="sakhi-followup-chip" onclick="window.askSakhiQuick('बाल झड़ना रोकने का नुस्खा')">
            <span>✨ सौंदर्य: बाल झड़ना व डैंड्रफ मुक्ति</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;

    streamBotMessage(html, "यह एक विशेष प्रश्न है। तुरंत समाधान के लिए हमारे मुख्य विशेषज्ञ से व्हाट्सएप पर संपर्क करें।");
  }

  // 16. VIRAL SHARE
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

  // 17. GLOBAL BRIDGE FOR CONSULT AI EXPERT BUTTONS
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

  document.addEventListener('DOMContentLoaded', () => {
    loadKnowledgeBase();
    initSpeechRecognition();
    injectSakhiUI();
  });
})();
