/**
 * ====================================================================
 * AAROGYAM SAKHI AI - BUTTER-SMOOTH VOICE & DIAGNOSTIC CHATBOT
 * Version: 2.0 (ICAR Agronomy Verified, Biofit Protocol & Book Funnel)
 * ====================================================================
 */

'use strict';

(function () {
  const MASTER_ADMIN_PHONE = '7974422572';
  const DEFAULT_GUEST_LIMIT = 5;
  const ACTIVE_MEMBER_LIMIT = 20;

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

  // 1. GET CURRENT USER PHONE & UNLIMITED STATUS
  function getUserPhone() {
    return (
      localStorage.getItem('aarogyam_user_phone') ||
      localStorage.getItem('user_phone') ||
      localStorage.getItem('user_mobile') ||
      localStorage.getItem('SAKHI_USER_PHONE') ||
      ''
    ).trim();
  }

  function isUnlimitedUser() {
    const phone = getUserPhone();
    return phone === MASTER_ADMIN_PHONE || phone.includes('7974422572');
  }

  // 2. DAILY QUOTA CONTROLLER
  function getTodayKey() {
    const d = new Date();
    return `SAKHI_QUOTA_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
  }

  function getDailyQuestionsUsed() {
    if (isUnlimitedUser()) return 0;
    try {
      return parseInt(localStorage.getItem(getTodayKey()) || '0', 10);
    } catch (e) {
      return 0;
    }
  }

  function incrementDailyQuestions() {
    if (isUnlimitedUser()) return 0;
    const current = getDailyQuestionsUsed();
    try {
      localStorage.setItem(getTodayKey(), String(current + 1));
    } catch (e) {}
    return current + 1;
  }

  function getMaxQuestionsLimit() {
    if (isUnlimitedUser()) return 999999;
    const isMember = localStorage.getItem('aarogyam_user_id') || localStorage.getItem('user_session_id');
    return isMember ? ACTIVE_MEMBER_LIMIT : DEFAULT_GUEST_LIMIT;
  }

  function isQuotaExhausted() {
    if (isUnlimitedUser()) return false;
    return getDailyQuestionsUsed() >= getMaxQuestionsLimit();
  }

  // 3. INITIALIZE KNOWLEDGE BASE
  async function loadKnowledgeBase() {
    try {
      const res = await fetch('/data/krishi-ai-knowledge.json?v=' + Math.floor(Date.now() / 3600000));
      if (res.ok) {
        knowledgeData = await res.json();
      }
    } catch (e) {
      console.warn('[Sakhi AI] Knowledge base fetch notice:', e);
    }
  }

  // 4. SPEECH RECOGNITION (STT - बोलकर पूछें)
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('[Sakhi AI] Web Speech API not supported on this browser.');
      return;
    }

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

      recognitionInstance.onerror = function (event) {
        console.warn('[Sakhi AI] Mic error:', event.error);
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
      alert('माइक सुविधा के लिए कृपया Chrome या आधुनिक ब्राउज़र का उपयोग करें।');
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
    if (input) input.placeholder = 'अपना सवाल बोलें या लिखें (जैसे: धान में पीलापन)...';
  }

  // 5. TEXT-TO-SPEECH (TTS - आवाज़ में बोलकर उत्तर दें)
  function speakResponse(text) {
    if (!isSoundEnabled || !window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel(); // Stop any active speech
    const cleanText = text.replace(/[*#_~`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95; // Clear natural pace for farmers
    utterance.pitch = 1.05; // Friendly warm pitch

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
  function injectSakhiUI() {
    if (document.getElementById('sakhiFloatingPill')) return;

    // 1. Floating Pill
    const pill = document.createElement('div');
    pill.id = 'sakhiFloatingPill';
    pill.className = 'sakhi-floating-pill';
    pill.innerHTML = `
      <div class="sakhi-pill-avatar-wrap">👩‍🌾</div>
      <span>आरोग्यम सखी AI</span>
      <span class="sakhi-pill-live-dot"></span>
    `;
    pill.onclick = openSakhiModal;
    document.body.appendChild(pill);

    // 2. Chat Modal Window
    const backdrop = document.createElement('div');
    backdrop.id = 'sakhiModalBackdrop';
    backdrop.className = 'sakhi-modal-backdrop';
    backdrop.innerHTML = `
      <div class="sakhi-chat-window" id="sakhiChatWindow">
        <!-- Header -->
        <div class="sakhi-header">
          <div class="sakhi-header-left">
            <div class="sakhi-avatar-frame" id="sakhiAvatarFrame">👩‍🌾</div>
            <div class="sakhi-header-info">
              <h3>आरोग्यम सखी AI <span style="font-size:0.7rem;background:#22c55e;color:#fff;padding:2px 6px;border-radius:10px;">ऑनलाइन</span></h3>
              <p>24×7 वैज्ञानिक फसल डॉक्टर व सलाहकार</p>
            </div>
          </div>
          <div class="sakhi-header-actions">
            <button type="button" class="sakhi-sound-toggle-btn" id="sakhiSoundToggleBtn" title="आवाज़ चालू/बंद करें">
              <i class="fa-solid fa-volume-high"></i>
            </button>
            <button type="button" class="sakhi-close-btn" id="sakhiCloseBtn" title="बंद करें">✕</button>
          </div>
        </div>

        <!-- Quota Bar -->
        <div class="sakhi-quota-bar" id="sakhiQuotaBar">
          <span style="color:#64748b;">आज का किसान परामर्श कोटा:</span>
          <span class="sakhi-quota-pill" id="sakhiQuotaBadge">5 / 5 शेष</span>
        </div>

        <!-- Messages Area -->
        <div class="sakhi-messages-wrap" id="sakhiMessagesWrap">
          <!-- Welcome message rendered dynamically -->
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
          <input type="text" class="sakhi-text-input" id="sakhiTextInput" placeholder="अपना सवाल बोलें या लिखें (जैसे: धान में पीलापन)..." autocomplete="off" />
          <button type="button" class="sakhi-send-btn" id="sakhiSendBtn" title="भेजें">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Event Bindings
    document.getElementById('sakhiCloseBtn').onclick = closeSakhiModal;
    backdrop.onclick = function (e) {
      if (e.target === backdrop) closeSakhiModal();
    };

    document.getElementById('sakhiSoundToggleBtn').onclick = toggleSound;
    document.getElementById('sakhiMicBtn').onclick = toggleRecording;
    document.getElementById('sakhiSendBtn').onclick = function () {
      const input = document.getElementById('sakhiTextInput');
      if (input && input.value.trim()) {
        handleUserSubmit(input.value.trim());
      }
    };

    document.getElementById('sakhiTextInput').onkeydown = function (e) {
      if (e.key === 'Enter') {
        const val = this.value.trim();
        if (val) handleUserSubmit(val);
      }
    };

    updateQuotaDisplay();
    renderWelcomeMessage();
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

  function updateQuotaDisplay() {
    const badge = document.getElementById('sakhiQuotaBadge');
    if (!badge) return;

    if (isUnlimitedUser()) {
      badge.className = 'sakhi-quota-pill unlimited';
      badge.innerHTML = `👑 VIP अनलिमिटेड (7974422572)`;
      return;
    }

    const used = getDailyQuestionsUsed();
    const max = getMaxQuestionsLimit();
    const remaining = Math.max(0, max - used);

    if (remaining === 0) {
      badge.className = 'sakhi-quota-pill low';
      badge.innerHTML = `⚠️ 0 / ${max} शेष (समाप्त)`;
    } else {
      badge.className = 'sakhi-quota-pill';
      badge.innerHTML = `⚡ ${remaining} / ${max} सवाल शेष`;
    }
  }

  function openSakhiModal() {
    const backdrop = document.getElementById('sakhiModalBackdrop');
    if (backdrop) {
      backdrop.classList.add('active');
      updateQuotaDisplay();
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

  function renderWelcomeMessage() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="sakhi-msg-row bot">
        <div class="sakhi-msg-bubble">
          <strong>राम-राम किसान भाई! 🙏</strong> मैं आपकी <strong>आरोग्यम सखी AI</strong> हूँ।<br><br>
          अपनी फसल (धान, सोयाबीन, गेहूं, कपास, मक्का, टमाटर, मिर्च आदि) के किसी भी रोग, पीलापन, सुंडी, फूल झड़ने या <strong>Biofit जैविक खाद व दवा</strong> के बारे में नीचे माइक 🎤 दबाकर बोलें या लिखें।
          
          <div class="sakhi-choice-pills-wrap" style="margin-top:10px;">
            <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('फसल में पत्तियां पीली पड़ रही हैं और बढ़वार रुकी है')">
              <span>🌾 पत्तियां पीली पड़ रही हैं व कल्ले कम हैं</span>
              <span>→</span>
            </button>
            <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('इल्ली व तना छेदक सुंडी का जैविक इलाज')">
              <span>🐛 इल्ली, सुंडी व तना छेदक नियंत्रण</span>
              <span>→</span>
            </button>
            <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('फूल फल झड़ रहे हैं और दाने में वजन नहीं है')">
              <span>🌸 फूल-फल झड़ रहे हैं व दाना हल्का है</span>
              <span>→</span>
            </button>
            <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('नेटसर्फ बायोफिट उत्पादों की सही डोज और तरीका')">
              <span>📦 Biofit उत्पादों की सही डोज व उपयोग</span>
              <span>→</span>
            </button>
            <button class="sakhi-choice-btn" onclick="window.askSakhiQuick('गाँव में कृषि एजेंसी से कमाई का प्लान')">
              <span>💼 गाँव में कृषि एजेंसी से ₹1 लाख/माह प्लान</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 7. MESSAGE RENDERING HELPERS
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

  function appendThinkingMessage() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return null;
    const row = document.createElement('div');
    row.className = 'sakhi-msg-row bot thinking-row';
    row.id = 'sakhiThinkingRow';
    row.innerHTML = `
      <div class="sakhi-msg-bubble" style="color:#64748b;font-weight:700;">
        🌾 सोच रही हूँ... समाधान खोजा जा रहा है...
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

  // 8. CORE QUESTION SUBMIT & MATCHING LOGIC
  function handleUserSubmit(userQuery) {
    const query = userQuery.trim();
    if (!query) return;

    // Clear input
    const input = document.getElementById('sakhiTextInput');
    if (input) input.value = '';

    appendUserMessage(query);

    // CHECK QUOTA
    if (isQuotaExhausted()) {
      renderLimitExhaustedResponse(query);
      return;
    }

    incrementDailyQuestions();
    updateQuotaDisplay();

    appendThinkingMessage();

    setTimeout(() => {
      removeThinkingMessage();
      processKnowledgeQuery(query);
    }, 450);
  }

  function processKnowledgeQuery(query) {
    const cleanQ = query.toLowerCase();

    if (!knowledgeData || !knowledgeData.intents) {
      fallbackUnanswered(query);
      return;
    }

    // Match intent
    let matchedIntent = null;
    let maxScore = 0;

    knowledgeData.intents.forEach((intent) => {
      let score = 0;
      intent.keywords.forEach((kw) => {
        if (cleanQ.includes(kw.toLowerCase())) score++;
      });
      if (score > maxScore) {
        maxScore = score;
        matchedIntent = intent;
      }
    });

    if (matchedIntent && maxScore > 0) {
      currentDiagnosticIntent = matchedIntent;

      // Check if multi-turn diagnostic question exists
      if (matchedIntent.diagnostic_question) {
        renderDiagnosticQuestion(matchedIntent);
      } else {
        // Direct answer fallback
        const defaultResp = Object.values(matchedIntent.responses || {})[0];
        if (defaultResp) {
          renderFinalSolution(defaultResp);
        } else {
          fallbackUnanswered(query);
        }
      }
    } else {
      fallbackUnanswered(query);
    }
  }

  function renderDiagnosticQuestion(intent) {
    const dq = intent.diagnostic_question;
    let html = `<strong>${escapeHtml(dq.text)}</strong><div class="sakhi-choice-pills-wrap">`;
    dq.options.forEach((opt) => {
      html += `
        <button type="button" class="sakhi-choice-btn" onclick="window.selectSakhiOption('${escapeHtml(opt.value)}')">
          <span>${escapeHtml(opt.label)}</span>
          <span>→</span>
        </button>
      `;
    });
    html += `</div>`;

    appendBotMessage(html, dq.text);
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
        <div class="sakhi-solution-header">🌿 1. तुरंत आपातकालीन जैविक उपचार (First Aid):</div>
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

    appendBotMessage(html, resp.audio_text || resp.first_aid);
  }

  // 9. QUOTA EXHAUSTED VIEW (DIRECT HOOK TO RELEVANT BOOK)
  function renderLimitExhaustedResponse(query) {
    const book = lastMatchedBook;
    const isMember = localStorage.getItem('aarogyam_user_id') || localStorage.getItem('user_session_id');

    let html = `
      <div class="sakhi-limit-exhausted-box">
        <h3>🛑 आज का 5 सवालों का कोटा पूर्ण हुआ!</h3>
        <p>
          किसान भाई, आपने आज अपनी फसल के लिए महत्वपूर्ण सलाह ली है। इस समस्या (रोग, कीट, स्प्रे कैलेंडर व खाद) का <strong>100% स्थायी वैज्ञानिक समाधान</strong> लेखक अविनीश मिश्रा जी की प्रामाणिक ई-बुक में उपलब्ध है।
        </p>

        <div class="sakhi-book-cta-card" style="margin: 10px 0; text-align: left;">
          <div class="sakhi-book-cta-info">
            <h4>📖 ${escapeHtml(book.name)}</h4>
            <p>मूल्य <s>₹299</s> मात्र ₹${book.price} (लाइफटाइम सुरक्षित)</p>
          </div>
          <a href="${escapeHtml(book.link)}" class="sakhi-book-buy-btn">
            <span>तुरंत ई-बुक खोलें →</span>
          </a>
        </div>

        <div style="font-size:0.8rem;color:#7f1d1d;margin-top:10px;">
          💡 ई-बुक लेते ही आपका AI परामर्श कोटा स्वतः <strong>20 सवाल प्रतिदिन</strong> में अपग्रेड हो जाता है!
        </div>
      </div>
    `;

    appendBotMessage(html, "किसान भाई, आज का आपका 5 सवालों का दैनिक कोटा पूरा हो गया है। सम्पूर्ण स्प्रे कैलेंडर के लिए अपनी ई-बुक अनलॉक करें।");
  }

  // 10. FALLBACK FOR UNANSWERED QUESTIONS (LOGS & OFFERS WHATSAPP)
  function fallbackUnanswered(query) {
    // Log to localStorage for admin analysis
    try {
      const logs = JSON.parse(localStorage.getItem('SAKHI_UNANSWERED_LOGS') || '[]');
      logs.push({
        query: query,
        timestamp: new Date().toISOString(),
        phone: getUserPhone()
      });
      localStorage.setItem('SAKHI_UNANSWERED_LOGS', JSON.stringify(logs.slice(-50)));
    } catch (e) {}

    const waMsg = `नमस्ते आरोग्यम कृषि विशेषज्ञ जी! 🙏\nमेरा सवाल है: "${query}"\nकृपया इस पर सटीक सलाह और सही दवा की डोज बताएं।`;
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
    `;

    appendBotMessage(html, "यह एक विशेष प्रश्न है। तुरंत समाधान के लिए हमारे मुख्य कृषि विशेषज्ञ से व्हाट्सएप पर संपर्क करें।");
  }

  // Quick Action Helper
  window.askSakhiQuick = function (query) {
    handleUserSubmit(query);
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
    open: openSakhiModal,
    close: closeSakhiModal,
    ask: handleUserSubmit,
    isUnlimited: isUnlimitedUser,
    getDailyUsed: getDailyQuestionsUsed
  };

  // AUTO INIT ON DOM READY
  document.addEventListener('DOMContentLoaded', () => {
    loadKnowledgeBase();
    initSpeechRecognition();
    injectSakhiUI();
  });
})();
