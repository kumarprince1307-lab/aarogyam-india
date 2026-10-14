/**
 * ====================================================================
 * AAROGYAM SAKHI AI - UNIVERSAL KRISHI ENCYCLOPEDIA & VOICE DOCTOR
 * Version: 3.5 (Real Avatar Photo, 100% Free Unlimited, Guest Onboarding,
 *               Instant Comprehensive Answers, Proactive Chips & Viral Share)
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
  let lastMatchedBook = {
    id: 'BK002',
    name: 'खेती का डॉक्टर (सम्पूर्ण फसल सुरक्षा)',
    mrp: 299,
    price: 99,
    link: '/ebooks/kheti-dr.html'
  };

  // 1. USER PROFILE HELPERS
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

  // 2. UNLIMITED QUOTA (100% FREE FOR ALL FARMERS)
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

  // 3. LOAD KNOWLEDGE BASE
  async function loadKnowledgeBase() {
    try {
      const res = await fetch('/data/krishi-ai-knowledge.json?v=' + Math.floor(Date.now() / 1800000));
      if (res.ok) {
        knowledgeData = await res.json();
      }
    } catch (e) {
      console.warn('[Sakhi AI] Knowledge base fetch notice:', e);
    }
  }

  // 4. SPEECH RECOGNITION (बोलकर पूछें)
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
    if (input) input.placeholder = 'अपना सवाल बोलें या लिखें (जैसे: गेहूं में कल्ले, धान में पीलापन)...';
  }

  // 5. TEXT-TO-SPEECH (TTS - आवाज़ में उत्तर)
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

  // 6. BUILD UI DOM ELEMENTS
  const isDedicatedPage = window.location.pathname.includes('aarogyam-sakhi.html') || document.body.classList.contains('sakhi-page-body');

  function injectSakhiUI() {
    if (isDedicatedPage) {
      // Standalone Fullscreen Mode
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

    // 1. Floating Pill (LEFT ALIGNED)
    const pill = document.createElement('div');
    pill.id = 'sakhiFloatingPill';
    pill.className = 'sakhi-floating-pill';
    pill.innerHTML = `
      <div class="sakhi-pill-avatar-wrap">
        <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" onerror="this.src='/images/logo/fevicon.png'" />
      </div>
      <span>आरोग्यम सखी AI</span>
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
    return `
      <div class="sakhi-chat-window" id="sakhiChatWindow">
        <!-- Header -->
        <div class="sakhi-header">
          <div class="sakhi-header-left">
            ${isFullscreen ? `
              <a href="javascript:void(0)" onclick="window.history.length > 1 ? window.history.back() : window.location.href='/ebooks/agriculture.html'" class="sakhi-back-btn" title="वापस जाएं">
                <i class="fa-solid fa-arrow-left"></i>
              </a>
            ` : ''}
            <div class="sakhi-avatar-frame" id="sakhiAvatarFrame">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" onerror="this.src='/images/logo/fevicon.png'" />
            </div>
            <div class="sakhi-header-info">
              <h3>आरोग्यम सखी AI <span style="font-size:0.7rem;background:#22c55e;color:#fff;padding:2px 8px;border-radius:10px;">ऑनलाइन 24×7</span></h3>
              <p>आपकी अपनी डिजिटल कृषि विशेषज्ञ व सलाहकार</p>
            </div>
          </div>
          <div class="sakhi-header-actions" style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="sakhi-share-btn" onclick="window.shareAarogyamSakhi()" title="सखी AI को किसान भाइयों से शेयर करें">
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
          <span style="color:#15803d;font-weight:800;">🌾 किसान सेवा में समर्पित:</span>
          <span class="sakhi-quota-pill unlimited" id="sakhiQuotaBadge">✨ 100% निशुल्क असीमित सलाह</span>
        </div>

        <!-- Messages Area -->
        <div class="sakhi-messages-wrap" id="sakhiMessagesWrap">
          <!-- Rendered dynamically -->
        </div>

        <!-- Legal Note -->
        <div class="sakhi-legal-note">
          ⚖️ सूचनात्मक मार्गदर्शन: उपयोग से पूर्व उत्पाद लेबल निर्देश व स्थानीय कृषि विशेषज्ञ की अनुशंसा का संज्ञान अवश्य लें।
        </div>

        <!-- Input Footer -->
        <div class="sakhi-input-footer">
          <button type="button" class="sakhi-mic-btn" id="sakhiMicBtn" title="बोलकर पूछें (माइक)">
            <i class="fa-solid fa-microphone"></i>
          </button>
          <input type="text" class="sakhi-text-input" id="sakhiTextInput" placeholder="अपना सवाल बोलें या लिखें (जैसे: गेहूं में कल्ले, धान में पीलापन)..." autocomplete="off" />
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

  // 7. INITIAL GREETING & GUEST ONBOARDING FLOW
  function renderInitialGreeting() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const userName = getUserName();
    const userPhone = getUserPhone();

    if (userName && userPhone) {
      // Registered User Greeting
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
            खेत की चिंता छोड़िए! गेहूं, धान, सरसों, चना, सब्जियां या किसी भी कृषि दवा (जैसे कोराजन, साफ, टिल्ट) के बारे में बेझिझक पूछें।

            <div class="sakhi-choice-pills-wrap" style="margin-top:12px;">
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
              <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गाय-भैंस में दूध और फैट बढ़ाने का फॉर्मूला')">
                <span>🐄 पशुपालन: दूध व फैट वृद्धि फॉर्मूला</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      `;
      speakResponse(`राम-राम ${userName} जी! मैं आपकी आरोग्यम सखी हूँ। बताइए आज आपकी फसल में क्या सेवा करूँ?`);
    } else {
      // Guest Onboarding Greeting
      wrap.innerHTML = `
        <div class="sakhi-msg-row bot">
          <div class="sakhi-msg-bubble">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid #16a34a;" onerror="this.style.display='none'">
              <div>
                <strong>राम-राम किसान भाई! 🙏</strong><br>
                <span style="font-size:0.8rem;color:#166534;">मैं आपकी <strong>आरोग्यम सखी</strong> हूँ।</span>
              </div>
            </div>
            आपसे बातचीत शुरू करने और आपकी फसल के अनुसार व्यक्तिगत सलाह देने के लिए कृपया अपना नाम व मोबाइल नंबर दर्ज करें:

            <div class="sakhi-onboard-card" id="sakhiGuestOnboardCard">
              <h4>🌾 किसान प्रोफाइल (1-क्लिक निशुल्क रजिस्ट्रेशन)</h4>
              <p>निशुल्क असीमित सलाह, मौसम अपडेट और सही दवा डोज के लिए:</p>
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
              या नीचे दिए गए सीधे सवाल पर क्लिक करें:
            </div>

            <div class="sakhi-choice-pills-wrap" style="margin-top:8px;">
              <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
                <span>🌾 गेहूं की खेती व कल्ले बढ़ाना</span>
                <span>→</span>
              </button>
              <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('सरसों में माहू चेपा रोकथाम')">
                <span>🟡 सरसों में माहू (चेपा) नियंत्रण</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      `;
      speakResponse('राम-राम किसान भाई! मैं आपकी आरोग्यम सखी हूँ। बातचीत शुरू करने के लिए अपना नाम और मोबाइल नंबर दर्ज करें।');
    }
  }

  // 8. GUEST ONBOARDING SUBMISSION
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
          ✅ बहुत-बहुत धन्यवाद ${escapeHtml(name)} जी! आपका स्वागत है। 🌾
        </div>
      `;
    }

    appendBotMessage(`
      <div>
        <strong>राम-राम ${escapeHtml(name)} जी! 🙏</strong><br><br>
        आपका नंबर दर्ज हो गया है। अब आप बेझिझक कोई भी सवाल पूछ सकते हैं—गेहूं, सरसों, चना, धान, सब्जियों या किसी भी दवा के बारे में!
      </div>
      <div class="sakhi-choice-pills-wrap" style="margin-top:12px;">
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गेहूं के बारे में बताओ')">
          <span>🌾 गेहूं की सम्पूर्ण जानकारी व कल्ले 2x बढ़ाना</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('सरसों में माहू चेपा और सफेद रतुआ रोकथाम')">
          <span>🟡 सरसों: माहू (चेपा) व सफेद रतुआ</span>
          <span>→</span>
        </button>
        <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('चने में उकठा और फली छेदक इल्ली नियंत्रण')">
          <span>🌰 चना: उकठा (Wilt) व फली छेदक का जैविक इलाज</span>
          <span>→</span>
        </button>
      </div>
    `, `धन्यवाद ${name} जी! अब बताइए आपका क्या सवाल है?`);
  };

  // 9. MESSAGE RENDERING
  function appendUserMessage(text) {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;
    const row = document.createElement('div');
    row.className = 'sakhi-msg-row user';
    row.innerHTML = `<div class="sakhi-msg-bubble">${escapeHtml(text)}</div>`;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function appendBotMessage(htmlContent, speechText) {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;
    const row = document.createElement('div');
    row.className = 'sakhi-msg-row bot';
    row.innerHTML = `<div class="sakhi-msg-bubble">${htmlContent}</div>`;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;

    if (speechText) {
      speakResponse(speechText);
    }
  }

  function appendThinkingMessage() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return null;
    const row = document.createElement('div');
    row.className = 'sakhi-msg-row bot thinking-row';
    row.id = 'sakhiThinkingRow';
    row.innerHTML = `
      <div class="sakhi-msg-bubble" style="color:#15803d;font-weight:800;display:flex;align-items:center;gap:8px;">
        <span class="sakhi-tts-indicator"><span class="sakhi-tts-bar"></span><span class="sakhi-tts-bar"></span><span class="sakhi-tts-bar"></span></span>
        <span>सखी सोच रही हैं... सटीक वैज्ञानिक उत्तर तैयार किया जा रहा है...</span>
      </div>
    `;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
    return row;
  }

  function removeThinkingMessage() {
    const el = document.getElementById('sakhiThinkingRow');
    if (el) el.remove();
  }

  // 10. CORE QUESTION SUBMISSION & FUZZY MATCHING
  function handleUserSubmit(userQuery) {
    const query = (userQuery || '').trim();
    if (!query) return;

    const input = document.getElementById('sakhiTextInput');
    if (input) input.value = '';

    appendUserMessage(query);
    incrementDailyQuestions();

    appendThinkingMessage();

    setTimeout(() => {
      removeThinkingMessage();
      processKnowledgeQuery(query);
    }, 350);
  }

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

      // Check if user asked for a sub-option directly
      let directSubResponse = null;
      if (matchedIntent.responses) {
        for (const [key, resp] of Object.entries(matchedIntent.responses)) {
          if (cleanQ.includes(key.toLowerCase())) {
            directSubResponse = resp;
            break;
          }
        }
      }

      if (directSubResponse) {
        renderFinalSolution(directSubResponse);
        return;
      }

      // If intent has direct_summary (e.g. for "गेहूं के बारे में बताओ"):
      if (matchedIntent.direct_summary) {
        renderDirectSummaryWithSubOptions(matchedIntent);
      } else if (matchedIntent.responses) {
        const defaultResp = Object.values(matchedIntent.responses)[0];
        if (defaultResp) {
          renderFinalSolution(defaultResp);
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

  function renderDirectSummaryWithSubOptions(intent) {
    const summary = intent.direct_summary;
    let html = `
      <div style="margin-bottom:10px;">
        <h4 style="margin:0 0 8px 0;color:#15803d;font-size:1.1rem;font-weight:900;">${escapeHtml(summary.title || '🌾 फसल संपूर्ण मार्गदर्शन')}</h4>
      </div>

      <div class="sakhi-solution-box">
        <div class="sakhi-solution-header">🌿 1. तुरंत खेत में डालने योग्य उपचार व खाद डोज:</div>
        <div>${escapeHtml(summary.first_aid)}</div>
      </div>

      <div class="sakhi-curiosity-box">
        <div class="sakhi-curiosity-header">⚠️ 2. वैज्ञानिक चेतावनी एवं उत्पादन बढ़ाने का सीक्रेट:</div>
        <div>${escapeHtml(summary.curiosity_hook)}</div>
      </div>

      <div class="sakhi-book-cta-card">
        <div class="sakhi-book-cta-info">
          <h4>📖 ${escapeHtml(summary.book_name || 'खेती का डॉक्टर ई-बुक')}</h4>
          <p>सम्पूर्ण 120+ पेज वैज्ञानिक स्प्रे कैलेंडर व गाइड</p>
        </div>
        <a href="${escapeHtml(summary.book_link || '/ebooks/kheti-dr.html')}" class="sakhi-book-buy-btn">
          <span>₹${summary.book_price || 99} में पढ़ें →</span>
        </a>
      </div>
    `;

    // Add drill-down options if available
    if (intent.diagnostic_question && intent.diagnostic_question.options) {
      html += `
        <div style="margin-top:14px;padding:12px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <div style="font-size:0.84rem;font-weight:900;color:#334155;margin-bottom:8px;">
            🔍 ${escapeHtml(intent.diagnostic_question.text || 'इस विषय पर और गहराई से जानें:')}
          </div>
          <div class="sakhi-choice-pills-wrap">
            ${intent.diagnostic_question.options.map((opt) => `
              <button type="button" class="sakhi-choice-btn" onclick="window.selectSakhiOption('${escapeHtml(opt.value)}')">
                <span>${escapeHtml(opt.label)}</span>
                <span>→</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Follow-up prompt chips
    if (summary.follow_up_suggestions && summary.follow_up_suggestions.length > 0) {
      html += `
        <div class="sakhi-followup-container">
          <div class="sakhi-followup-title">💡 किसान भाई, क्या आप यह भी जानना चाहते हैं?</div>
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

    appendBotMessage(html, summary.audio_text || summary.first_aid);
  }

  window.selectSakhiOption = function (optionValue) {
    if (!currentDiagnosticIntent || !currentDiagnosticIntent.responses) return;

    const resp = currentDiagnosticIntent.responses[optionValue];
    if (resp) {
      renderFinalSolution(resp);
    } else {
      const first = Object.values(currentDiagnosticIntent.responses)[0];
      if (first) renderFinalSolution(first);
    }
  };

  function renderFinalSolution(resp) {
    if (resp.book_id) {
      lastMatchedBook = {
        id: resp.book_id,
        name: resp.book_name,
        price: resp.book_price || 99,
        link: resp.book_link || '/ebooks/kheti-dr.html'
      };
    }

    let html = `
      <div class="sakhi-solution-box">
        <div class="sakhi-solution-header">🌿 1. तुरंत खेत में डालने योग्य उपचार (First Aid Dose):</div>
        <div>${escapeHtml(resp.first_aid)}</div>
      </div>

      <div class="sakhi-curiosity-box">
        <div class="sakhi-curiosity-header">⚠️ 2. वैज्ञानिक चेतावनी एवं स्थायी समाधान:</div>
        <div>${escapeHtml(resp.curiosity_hook)}</div>
      </div>

      <div class="sakhi-book-cta-card">
        <div class="sakhi-book-cta-info">
          <h4>📖 ${escapeHtml(resp.book_name || 'खेती का डॉक्टर ई-बुक')}</h4>
          <p>सम्पूर्ण 120+ पेज वैज्ञानिक सारणी व स्प्रे कैलेंडर</p>
        </div>
        <a href="${escapeHtml(resp.book_link || '/ebooks/kheti-dr.html')}" class="sakhi-book-buy-btn">
          <span>₹${resp.book_price || 99} में पढ़ें →</span>
        </a>
      </div>
    `;

    // PROACTIVE FOLLOW-UP SUGGESTIONS
    if (resp.follow_up_suggestions && resp.follow_up_suggestions.length > 0) {
      html += `
        <div class="sakhi-followup-container">
          <div class="sakhi-followup-title">💡 किसान भाई, क्या आप यह भी जानना चाहते हैं?</div>
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

    appendBotMessage(html, resp.audio_text || resp.first_aid);
  }

  // 11. SMART FALLBACK FOR UNANSWERED QUESTIONS
  function fallbackUnanswered(query) {
    try {
      const logs = JSON.parse(localStorage.getItem('SAKHI_UNANSWERED_LOGS') || '[]');
      logs.push({
        query: query,
        timestamp: new Date().toISOString(),
        phone: getUserPhone()
      });
      localStorage.setItem('SAKHI_UNANSWERED_LOGS', JSON.stringify(logs.slice(-50)));
    } catch (e) {}

    const waMsg = `नमस्ते आरोग्यम सखी AI जी! 🙏\nमेरा सवाल है: "${query}"\nकृपया इस पर सटीक वैज्ञानिक सलाह और सही दवा की डोज बताएं।`;
    const waUrl = `https://wa.me/91${MASTER_ADMIN_PHONE}?text=${encodeURIComponent(waMsg)}`;

    let html = `
      <div>
        <strong>🌾 यह एक विशेष एवं महत्वपूर्ण प्रश्न है!</strong><br><br>
        इस प्रश्न का अध्ययन हमारे मुख्य कृषि विशेषज्ञ कर रहे हैं और इसका समाधान हमारे AI सिस्टम में अपडेट किया जा रहा है।<br><br>
        तुरंत प्रत्यक्ष सहायता के लिए आप हमारे मुख्य कृषि विशेषज्ञ से सीधे WhatsApp पर जुड़ सकते हैं:
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
          <button class="sakhi-followup-chip" onclick="window.askSakhiQuick('सरसों में माहू चेपा और सफेद रतुआ रोकथाम')">
            <span>🟡 सरसों: माहू (चेपा) व सफेद रतुआ</span>
            <span>→</span>
          </button>
          <button class="sakhi-followup-chip" onclick="window.askSakhiQuick('चने में उकठा और फली छेदक इल्ली नियंत्रण')">
            <span>🌰 चना: उकठा व फली छेदक</span>
            <span>→</span>
          </button>
          <button class="sakhi-followup-chip" onclick="window.askSakhiQuick('कोराजन और इमामेक्टिन की सही डोज क्या है?')">
            <span>🧪 रासायनिक दवाओं की सही डोज</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;

    appendBotMessage(html, "यह एक विशेष प्रश्न है। तुरंत समाधान के लिए हमारे मुख्य कृषि विशेषज्ञ से व्हाट्सएप पर संपर्क करें।");
  }

  // 12. VIRAL SHARE FUNCTION
  window.shareAarogyamSakhi = function () {
    const refCode = getBestReferralCode();
    const shareUrl = `${window.location.origin}/aarogyam-sakhi.html?ref=${encodeURIComponent(refCode)}`;

    const shareTitle = 'आरोग्यम सखी AI - आपके सभी कृषि सवालों का तुरंत वैज्ञानिक जवाब!';
    const shareText = `🌾 किसान भाइयों के लिए बड़ी खुशखबरी! 🌾\n\nअब गेहूं, सरसों, चना, धान, सब्जियों के रोग और किसी भी कृषि दवा की डोज जानने के लिए किसी के चक्कर काटने की जरूरत नहीं!\n\nमिलिए "आरोग्यम सखी AI" से — जो देती हैं हर सवाल का 100% सही व वैज्ञानिक जवाब! 👩‍🌾🔬\n\nअभी अपना सवाल पूछें बिल्कुल फ्री:\n${shareUrl}`;

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

  // 13. GLOBAL BRIDGE FOR CONSULT AI EXPERT BUTTONS
  window.consultAiExpert = function (topic, details) {
    openSakhiModal();
    const query = `${topic || 'कृषि समस्या'}${details ? ': ' + details : ''}`;
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
    share: window.shareAarogyamSakhi
  };

  document.addEventListener('DOMContentLoaded', () => {
    loadKnowledgeBase();
    initSpeechRecognition();
    injectSakhiUI();
  });
})();
