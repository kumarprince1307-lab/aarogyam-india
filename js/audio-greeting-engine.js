/**
 * Aarogyam India - Audio Greeting & Interactive Floating Action Engine
 * Client-Side, Zero Supabase Egress, Web Speech Synthesis (Hindi)
 */

(function () {
  'use strict';

  // 1. Determine active page path & metadata
  const currentPath = window.location.pathname.toLowerCase();

  // Page Specific Audio Transcripts (Hindi)
  const pageAudioScripts = {
    'index': {
      title: 'मुख्य पृष्ठ (होम)',
      category: 'कृषि व स्वास्थ्य डिजिटल हब',
      text: (name) => `नमस्ते ${name} जी! आरोग्यम इंडिया में आपका हार्दिक स्वागत है। यह भारत का पहला संपूर्ण डिजिटल ज्ञान मंच है जहाँ किसानों और परिवारों के लिए सभी समाधान उपलब्ध हैं। यहाँ आपको खरीफ फसल मास्टर गाइड और खेती का डॉक्टर जैसी प्रमाणित ई-बुक्स, फसलों का सचित्र वैज्ञानिक स्प्रे शेड्यूल, गाय और भैंस में दूध व फैट वृद्धि के उपाय, और डायबिटीज, जोड़ों का दर्द व मोटापे का प्राकृतिक आयुर्वेदिक परामर्श मिलता है। किसी भी सवाल या समस्या के लिए आप सीधे व्हाट्सएप पर हमारे विशेषज्ञों से 24 घंटे निःशुल्क सलाह ले सकते हैं। आरोग्यम इंडिया के साथ जुड़ने के लिए धन्यवाद!`
    },
    'agriculture': {
      title: 'वैज्ञानिक कृषि व फसल सुरक्षा हब',
      category: 'कृषि ई-बुक्स व बायो-ऑर्गेनिक समाधान',
      text: (name) => `नमस्ते ${name} जी! आरोग्यम कृषि हब में आपका स्वागत है। यहाँ आप खरीफ फसल मास्टर गाइड और फसल का डॉक्टर ई-बुक प्राप्त कर सकते हैं। साथ ही सभी प्रमुख फसलों के रोग, जैविक उपचार और नेटसर्फ बायो-फिट स्प्रे शेड्यूल की पूरी जानकारी देख सकते हैं।`
    },
    'health': {
      title: 'आरोग्यम संपूर्ण स्वास्थ्य केंद्र',
      category: 'लाइफस्टाइल रोग व प्राकृतिक समाधान',
      text: (name) => `नमस्ते ${name} जी! आरोग्यम स्वास्थ्य केंद्र में आपका स्वागत है। यहाँ आपको मोटापा, डायबिटीज, जोड़ों का दर्द, हेयर केयर और महिला स्वास्थ्य की संपूर्ण प्राकृतिक डाइट, योगासन और हर्बल उपचार मिलेंगे। अपनी समस्या का चयन करें और स्थायी स्वास्थ्य लाभ पाएं।`
    },
    'pashu-palan': {
      title: 'पशु पालन व दुग्ध संवर्धन हब',
      category: 'पशु स्वास्थ्य व पोषण',
      text: (name) => `राम राम ${name} जी! आरोग्यम पशु पालन केंद्र में आपका स्वागत है। यहाँ गाय-भैंस में थनैला रोग, दूध व फैट बढ़ाने के फॉर्मूले, बांझपन और पाचन समस्याओं का 100% सफल समाधान मिलेगा। आप सीएफएल और बायो-फिट उत्पाद सीधे व्हाट्सएप द्वारा ऑर्डर कर सकते हैं।`
    },
    'weight-loss': {
      title: 'मोटापा व प्राकृतिक वजन नियंत्रण',
      category: 'नेचुरल फैट बर्न',
      text: (name) => `नमस्ते ${name} जी! वेट लॉस गाइड में आपका स्वागत है। यहाँ आपको पेट की जिद्दी चर्बी घटाने के मुख्य कारण, लक्षण, 24 घंटे का संपूर्ण डाइट चार्ट और फैट बर्नर हर्बल सप्लीमेंट की जानकारी मिलेगी। आप नीचे से उत्पाद चुनकर सीधे व्हाट्सएप पर ऑर्डर कर सकते हैं।`
    },
    'diabetes': {
      title: 'डायबिटीज व ब्लड शुगर नियंत्रण',
      category: 'प्राकृतिक शुगर रिवर्सल',
      text: (name) => `नमस्ते ${name} जी! डायबिटीज केयर पेज पर आपका स्वागत है। यहाँ इंसुलिन रेजिस्टेंस दूर करने, शुगर लेवल सामान्य रखने की प्राकृतिक डाइट, एक्सरसाइज और आयुर्वेदिक फार्मूला उपलब्ध है।`
    },
    'joint-care': {
      title: 'जोड़ों का दर्द व गठिया राहत',
      category: 'ज्वाइंट मोबिलिटी',
      text: (name) => `नमस्ते ${name} जी! जोड़ों के दर्द व आर्थराइटिस केयर पेज पर आपका स्वागत है। कार्टिलेज को दोबारा मजबूत बनाने, यूरिक एसिड घटाने और सूजन दूर करने की सम्पूर्ण जानकारी यहाँ दी गई है।`
    },
    'hair-care': {
      title: 'हेयर केयर व डैंड्रफ समाधान',
      category: 'हेयर फॉल रिवर्सल',
      text: (name) => `नमस्ते ${name} जी! हेयर केयर गाइड में आपका स्वागत है। नए बाल उगाने, बालों का झड़ना तुरंत रोकने और डैंड्रफ खत्म करने के प्राकृतिक फॉर्मूले और ऑयल्स की जानकारी यहाँ देखें।`
    },
    'skin-care': {
      title: 'स्किन ग्लो व त्वचा सुरक्षा',
      category: 'नेचुरल स्किन केयर',
      text: (name) => `नमस्ते ${name} जी! नेचुरल स्किन केयर पेज पर आपका स्वागत है। पिंपल्स, झाइयां और डल स्किन को ठीक कर चेहरे पर प्राकृतिक ग्लो लाने की आयुर्वेदिक टिप्स यहाँ उपलब्ध हैं।`
    },
    'womens-care': {
      title: 'महिला स्वास्थ्य व हार्मोनल संतुलन',
      category: 'PCOD, थायरॉयड व हीमोग्लोबिन',
      text: (name) => `नमस्ते ${name} जी! महिला स्वास्थ्य केंद्र में आपका स्वागत है। पीसीओडी, अनियमित माहवारी, कमजोरी और हार्मोनल असंतुलन का सुरक्षित व हर्बल समाधान यहाँ मिलेगा।`
    },
    'kids-care': {
      title: 'बच्चों का मानसिक व शारीरिक विकास',
      category: 'किड्स न्यूट्रिशन',
      text: (name) => `नमस्ते ${name} जी! किड्स केयर पेज पर आपका स्वागत है। बच्चों की याददाश्त, एकाग्रता, लंबाई और रोग प्रतिरोधक क्षमता बढ़ाने का सम्पूर्ण पोषण प्लान यहाँ देखें।`
    },
    'home-care': {
      title: 'नेचुरल होम केयर व टॉक्सिन-मुक्त घर',
      category: 'हर्बल होम सुरक्षा',
      text: (name) => `नमस्ते ${name} जी! होम केयर पेज पर आपका स्वागत है। घर को केमिकल-मुक्त, स्वच्छ व सुरक्षित रखने के इको-फ्रेंडली समाधान यहाँ उपलब्ध हैं।`
    }
  };

  // Merge Admin Customized Page Audio Scripts from CMS
  try {
    const customScripts = JSON.parse(localStorage.getItem('AAROGYAM_PAGE_AUDIO_SCRIPTS') || '{}');
    Object.keys(customScripts).forEach(k => {
      if (customScripts[k] && customScripts[k].script) {
        pageAudioScripts[k] = {
          title: customScripts[k].title || (pageAudioScripts[k] ? pageAudioScripts[k].title : 'आरोग्यम इंडिया'),
          category: pageAudioScripts[k] ? pageAudioScripts[k].category : 'ऑडियो परिचय',
          text: (name) => customScripts[k].script.replace(/\{name\}/g, name)
        };
      }
    });
  } catch (e) {}

  // 2. Identify Current Page Key
  function getActivePageKey() {
    for (const key of Object.keys(pageAudioScripts)) {
      if (key !== 'index' && currentPath.includes(key)) {
        return key;
      }
    }
    return 'index';
  }

  // 3. User Name Detection
  function getUserDisplayName() {
    let name = localStorage.getItem('aarogyam_user_name') || 
               localStorage.getItem('user_name') || 
               localStorage.getItem('farmer_name');
    if (!name || name.trim() === '' || name.toLowerCase() === 'null') {
      // Friendly cultural defaults based on context
      if (currentPath.includes('pashu') || currentPath.includes('agri')) {
        return 'किसान भाई';
      }
      return 'साथी';
    }
    return name.trim();
  }

  // 4. Speech Synthesis Controller
  let isSpeaking = false;
  let synth = window.speechSynthesis;
  let currentUtterance = null;
  let userMutedAudio = false;

  function stopAudio() {
    userMutedAudio = true;
    try {
      sessionStorage.setItem('aoi_audio_user_stopped', '1');
      sessionStorage.setItem('aoi_audio_stopped_' + getActivePageKey(), '1');
    } catch (e) {}

    if (synth) {
      synth.cancel();
    }

    // Halt any HTML5 audio tags on the page
    document.querySelectorAll('audio').forEach(a => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch (err) {}
    });

    isSpeaking = false;
    updateAudioUIState(false);
    hideAudioToast();
  }

  function playAudioGreeting(isAutoPlay = false) {
    if (isAutoPlay) {
      try {
        if (sessionStorage.getItem('aoi_audio_user_stopped') === '1' || sessionStorage.getItem('aoi_audio_stopped_' + getActivePageKey()) === '1') {
          return; // User explicitly stopped it
        }
      } catch (e) {}
    } else {
      // User explicitly clicked play button - clear mute flag
      userMutedAudio = false;
      try {
        sessionStorage.removeItem('aoi_audio_user_stopped');
        sessionStorage.removeItem('aoi_audio_stopped_' + getActivePageKey());
      } catch (e) {}
    }

    if (!synth) {
      if (!isAutoPlay) alert('आपके ब्राउज़र में ऑडियो स्पीच सपोर्ट उपलब्ध नहीं है।');
      return;
    }

    if (isSpeaking) {
      stopAudio();
      return;
    }

    synth.cancel(); // Stop any pending speech

    const pageKey = getActivePageKey();
    const config = pageAudioScripts[pageKey] || pageAudioScripts['index'];
    const userName = getUserDisplayName();
    const textToSpeak = config.text(userName);

    currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
    currentUtterance.lang = 'hi-IN';
    currentUtterance.rate = 0.95; // Clear natural pace
    currentUtterance.pitch = 1.0;

    // Pick best Hindi Voice if available
    const voices = synth.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('india'));
    if (hindiVoice) {
      currentUtterance.voice = hindiVoice;
    }

    currentUtterance.onstart = function () {
      isSpeaking = true;
      updateAudioUIState(true);
      showAudioToast(`🔊 सुन रहे हैं: ${config.title}`);
    };

    currentUtterance.onend = function () {
      isSpeaking = false;
      updateAudioUIState(false);
      hideAudioToast();
    };

    currentUtterance.onerror = function () {
      isSpeaking = false;
      updateAudioUIState(false);
      hideAudioToast();
    };

    synth.speak(currentUtterance);
  }

  function updateAudioUIState(playing) {
    const btns = [
      document.getElementById('floating-audio-btn'),
      document.getElementById('universal-sticky-audio-btn')
    ];

    btns.forEach(btn => {
      if (!btn) return;
      if (playing) {
        btn.classList.add('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-stop';
        const label = btn.querySelector('.pill-label') || btn.querySelector('.floating-btn-tooltip');
        if (label) label.textContent = 'बंद करें';
      } else {
        btn.classList.remove('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-volume-high';
        const label = btn.querySelector('.pill-label') || btn.querySelector('.floating-btn-tooltip');
        if (label) label.textContent = 'Audio';
      }
    });
  }

  function showAudioToast(msg) {
    let toast = document.getElementById('audio-live-pill-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'audio-live-pill-toast';
      toast.className = 'audio-live-pill-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="audio-equalizer-bars"><span></span><span></span><span></span></div>
      <span>${msg}</span>
      <button type="button" onclick="window.stopPageAudioGreeting()" style="background:none; border:none; color:#f87171; font-weight:900; cursor:pointer; font-size:1rem; margin-left:6px;">✕</button>
    `;
    toast.classList.add('show');
  }

  function hideAudioToast() {
    const toast = document.getElementById('audio-live-pill-toast');
    if (toast) {
      toast.classList.remove('show');
    }
  }

  // 5. Injects the Floating Action Bar (Audio, Share, WhatsApp)
  function renderFloatingActionBar() {
    // If the universal sticky widget already exists, simply ensure the audio button is ready
    if (document.getElementById('universal-sticky-float-widget')) {
      const uAudioBtn = document.getElementById('universal-sticky-audio-btn');
      if (uAudioBtn) {
        uAudioBtn.style.display = 'inline-flex';
      }
      return;
    }

    if (document.getElementById('floating-action-pill')) return;

    const container = document.createElement('div');
    container.id = 'floating-action-pill';
    container.className = 'floating-action-pill';

    const pageKey = getActivePageKey();
    const config = pageAudioScripts[pageKey] || pageAudioScripts['index'];

    container.innerHTML = `
      <button type="button" id="floating-audio-btn" class="floating-action-btn floating-btn-audio" onclick="window.togglePageAudioGreeting()" title="पेज का परिचय सुनें">
        <i class="fa-solid fa-volume-high"></i>
        <span class="floating-btn-tooltip">पेज ऑडियो सुनें</span>
      </button>

      <button type="button" class="floating-action-btn floating-btn-share" onclick="window.triggerViralPageShare()" title="यह पेज शेयर करें">
        <i class="fa-solid fa-share-nodes"></i>
        <span class="floating-btn-tooltip">मित्रों को शेयर करें</span>
      </button>

      <a href="https://wa.me/917974422572?text=${encodeURIComponent('नमस्ते आरोग्यम टीम, मुझे ' + config.title + ' के बारे में जानकारी चाहिए।')}" target="_blank" rel="noopener noreferrer" class="floating-action-btn floating-btn-whatsapp" title="सीधे व्हाट्सएप पर बात करें">
        <i class="fa-brands fa-whatsapp"></i>
        <span class="floating-btn-tooltip">WhatsApp परामर्श</span>
      </a>
    `;

    document.body.appendChild(container);
  }

  // 6. Injects Mobile Sticky Bottom Navigation (Zero duplication)
  function renderMobileBottomNav() {
    if (document.getElementById('mobile-bottom-nav-bar') || document.getElementById('universal-mobile-bottom-nav') || document.querySelector('.universal-mobile-bottom-nav')) return;

    const nav = document.createElement('nav');
    nav.id = 'mobile-bottom-nav-bar';
    nav.className = 'mobile-bottom-nav';

    const isHome = currentPath === '/' || currentPath.endsWith('index.html');
    const isEbook = currentPath.includes('/ebooks/ebook.html') || currentPath.includes('/store.html');
    const isAgri = currentPath.includes('agriculture') || currentPath.includes('crop');
    const isHealth = currentPath.includes('/health/') || currentPath.includes('/categories/health.html');
    const isPashu = currentPath.includes('pashu-palan');

    nav.innerHTML = `
      <div class="mobile-bottom-nav-inner">
        <a href="/index.html" class="mobile-nav-item ${isHome ? 'active' : ''}">
          <span class="nav-emoji">🏠</span>
          <span>होम</span>
        </a>

        <a href="/ebooks/ebook.html" class="mobile-nav-item ${isEbook ? 'active' : ''}">
          <span class="nav-emoji">📚</span>
          <span>ई-बुक्स</span>
          <span class="nav-badge">ऑफ़र</span>
        </a>

        <a href="/ebooks/agriculture.html" class="mobile-nav-item ${isAgri ? 'active' : ''}">
          <span class="nav-emoji">🌱</span>
          <span>कृषि हब</span>
        </a>

        <a href="/categories/health.html" class="mobile-nav-item ${isHealth ? 'active' : ''}">
          <span class="nav-emoji">❤️</span>
          <span>स्वास्थ्य</span>
        </a>

        <a href="/pashu-palan.html" class="mobile-nav-item ${isPashu ? 'active' : ''}">
          <span class="nav-emoji">🐄</span>
          <span>पशु पालन</span>
        </a>

        <a href="https://wa.me/917974422572?text=${encodeURIComponent('नमस्ते आरोग्यम टीम, मुझे सहायता चाहिए।')}" target="_blank" rel="noopener noreferrer" class="mobile-nav-item" style="color:#16a34a;">
          <span class="nav-emoji">💬</span>
          <span>WhatsApp</span>
        </a>
      </div>
    `;

    document.body.appendChild(nav);
  }

  // -------------------------------------------------------------
  // SLIM LEAD REGISTRATION GATE (ACTION-GATED POPUP)
  // -------------------------------------------------------------
  let pendingLeadAction = null;

  function isUserRegistered() {
    try {
      if (localStorage.getItem('aarogyam_user_registered') === 'true') return true;
      const ph = (localStorage.getItem('aarogyam_user_phone') || '').replace(/\D/g, '');
      if (ph.length === 10) return true;
    } catch (e) {}
    return false;
  }

  function checkRegistrationGate(actionCallback) {
    if (isUserRegistered()) {
      if (typeof actionCallback === 'function') actionCallback();
      return;
    }
    openSlimLeadModal(actionCallback);
  }

  function openSlimLeadModal(callback) {
    pendingLeadAction = callback;

    let modal = document.getElementById('aarogyam-slim-lead-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aarogyam-slim-lead-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.8);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeInModal 0.22s ease-out;';
      modal.innerHTML = `
        <div style="background:#0f172a; border:2px solid #38bdf8; border-radius:18px; width:100%; max-width:390px; padding:24px 22px; box-shadow:0 24px 60px rgba(0,0,0,0.7); position:relative; color:#f8fafc; font-family:'Outfit',sans-serif;">
          <button type="button" onclick="window.closeSlimLeadModal()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.12);border:none;color:#cbd5e1;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;transition:background 0.2s;">✕</button>

          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="font-size:1.8rem;">🇮🇳</span>
            <div>
              <h4 style="margin:0;font-size:1.15rem;font-weight:900;color:#38bdf8;letter-spacing:-0.3px;">Aarogyam India</h4>
              <p style="margin:0;font-size:0.75rem;color:#94a3b8;">त्वरित 1-क्लिक एक्सेस व वीआईपी सहायता</p>
            </div>
          </div>

          <p style="font-size:0.86rem;color:#e2e8f0;margin:0 0 16px 0;line-height:1.45;">
            ऑडियो सुनने, शेयर करने व विशेष लाभ के लिए कृपया अपना नाम व WhatsApp नंबर दर्ज करें:
          </p>

          <form id="aarogyam-slim-lead-form" onsubmit="window.submitSlimLeadForm(event)">
            <div style="margin-bottom:12px;">
              <label style="display:block;font-size:0.75rem;font-weight:700;color:#94a3b8;margin-bottom:4px;">आपका नाम (Full Name)*</label>
              <input type="text" id="slim_lead_name" required placeholder="उदा. राहुल शर्मा" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;" />
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:0.75rem;font-weight:700;color:#94a3b8;margin-bottom:4px;">WhatsApp नंबर (10 Digit Mobile)*</label>
              <div style="display:flex;align-items:center;background:#1e293b;border:1px solid #334155;border-radius:10px;overflow:hidden;">
                <span style="padding:10px 12px;font-size:0.88rem;color:#94a3b8;background:#0f172a;font-weight:800;border-right:1px solid #334155;">+91</span>
                <input type="tel" id="slim_lead_phone" required pattern="[0-9]{10}" maxlength="10" placeholder="9876543210" style="flex:1;padding:10px 12px;border:none;background:transparent;color:#fff;font-size:0.9rem;outline:none;" />
              </div>
            </div>

            <button type="submit" style="width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg, #16a34a 0%, #15803d 100%);color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 16px rgba(22,163,74,0.45);transition:transform 0.15s ease;">
              <span>⚡ तुरंत एक्सेस करें</span>
            </button>
          </form>

          <p style="margin:12px 0 0 0;text-align:center;font-size:0.7rem;color:#64748b;">
            🔒 आपकी जानकारी 100% सुरक्षित है। कोई अनचाहा कॉल नहीं।
          </p>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    setTimeout(() => {
      document.getElementById('slim_lead_name')?.focus();
    }, 100);
  }

  window.closeSlimLeadModal = function () {
    const modal = document.getElementById('aarogyam-slim-lead-modal');
    if (modal) modal.style.display = 'none';
  };

  window.submitSlimLeadForm = function (e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('slim_lead_name');
    const phoneInput = document.getElementById('slim_lead_phone');
    const name = (nameInput?.value || '').trim();
    const phone = (phoneInput?.value || '').replace(/\D/g, '');

    if (!name || phone.length !== 10) {
      alert('कृपया अपना सही नाम और 10 अंकों का WhatsApp नंबर दर्ज करें।');
      return;
    }

    // Capture referral context & page source
    const urlParams = new URLSearchParams(window.location.search);
    const referral = urlParams.get('ref') || urlParams.get('referrer') || document.referrer || 'direct';
    const pageSource = window.location.pathname;

    try {
      localStorage.setItem('aarogyam_user_registered', 'true');
      localStorage.setItem('aarogyam_user_name', name);
      localStorage.setItem('aarogyam_user_phone', phone);
      localStorage.setItem('user_name', name);
    } catch (err) {}

    // Save local lead storage
    try {
      const existingLeads = JSON.parse(localStorage.getItem('aarogyam_leads') || '[]');
      existingLeads.unshift({
        name,
        phone,
        page: pageSource,
        pageTitle: document.title,
        ref: referral,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('aarogyam_leads', JSON.stringify(existingLeads.slice(0, 100)));
    } catch (err) {}

    // Silent background lead ping to auto-sync
    try {
      const apiUrl = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
        ? 'https://aarogyamindia.online/api/auto-sync-book'
        : '/api/auto-sync-book';
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_lead',
          lead: { name, phone, page: pageSource, ref: referral, timestamp: new Date().toISOString() }
        })
      }).catch(() => {});
    } catch (err) {}

    window.closeSlimLeadModal();
    showAudioToast(`✅ स्वागत है ${name} जी!`);

    if (typeof pendingLeadAction === 'function') {
      const act = pendingLeadAction;
      pendingLeadAction = null;
      act();
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC CMS OG & SHARE ENGINE LAYER
  // -------------------------------------------------------------
  function getCurrentPageCmsConfig() {
    try {
      const allPages = JSON.parse(localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG') || '[]');
      const curPath = window.location.pathname;
      const match = allPages.find(p => p && (
        (p.url && curPath.endsWith(p.url)) ||
        (p.slug && curPath.includes(p.slug)) ||
        ((curPath === '/' || curPath.endsWith('index.html')) && (p.slug === 'index' || p.id === 'page_home'))
      ));
      if (match) return match;
    } catch (e) {}

    try {
      if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        const homeConfig = JSON.parse(localStorage.getItem('AAROGYAM_HOME_CMS_CONFIG') || '{}');
        if (homeConfig && (homeConfig.og_title || homeConfig.share_message)) return homeConfig;
      }
    } catch (e) {}

    return null;
  }

  // Helper to resolve best referral / share ID
  function getBestReferralCode() {
    let ref = '';
    if (typeof window.getUserShareId === 'function') {
      try { ref = window.getUserShareId() || ''; } catch (e) {}
    }
    if (!ref) {
      try { ref = localStorage.getItem('aarogyam_user_phone') || ''; } catch (e) {}
    }
    if (!ref) {
      try {
        const u = window.AI_USER || JSON.parse(localStorage.getItem('AI_USER') || '{}');
        ref = u.share_id || u.mobile || '';
      } catch (e) {}
    }
    if (!ref) {
      try {
        const session = JSON.parse(localStorage.getItem('aoi_user_session') || localStorage.getItem('admin_session') || '{}');
        if (session && (session.phone || session.mobile || session.id)) {
          ref = session.phone || session.mobile || session.id;
        }
      } catch (e) {}
    }
    if (!ref) {
      try { ref = sessionStorage.getItem('AOI_REFERRER_ID') || ''; } catch (e) {}
    }
    return ref || 'AI000004';
  }

  // 7. Universal Viral Share Trigger (Action Gated + Dynamic OG Layer)
  window.triggerViralPageShare = function (customData) {
    checkRegistrationGate(() => {
      const cms = getCurrentPageCmsConfig();
      const pageKey = getActivePageKey();
      const config = pageAudioScripts[pageKey] || pageAudioScripts['index'];
      const refCode = getBestReferralCode();

      const currentUrlObj = new URL(window.location.href);
      if (refCode) {
        currentUrlObj.searchParams.set('ref', refCode);
        currentUrlObj.searchParams.set('share_id', refCode);
      }
      const shareUrl = currentUrlObj.href;

      const title = customData?.title || cms?.og_title || `${config.title} - Aarogyam India`;
      const desc = customData?.text || cms?.og_description || `🌾 क्या आप भी ${config.title} का संपूर्ण समाधान ढूंढ रहे हैं? Aarogyam India पर प्रामाणिक जानकारी व उपचार देखें:`;

      let shareMessage = '';
      if (cms?.share_message && cms.share_message.trim()) {
        shareMessage = cms.share_message
          .replace(/\{title\}/g, title)
          .replace(/\{description\}/g, desc)
          .replace(/\{desc\}/g, desc)
          .replace(/\{url\}/g, shareUrl);
        if (!shareMessage.includes(shareUrl)) {
          shareMessage += `\n\n👉 यहाँ देखें: ${shareUrl}`;
        }
      } else {
        shareMessage = `🌾 *${title}*\n${desc}\n\n👉 यहाँ देखें:\n${shareUrl}`;
      }

      // Do NOT pass url separately as shareMessage already contains it, preventing double URL in mobile share
      if (navigator.share) {
        navigator.share({ title, text: shareMessage }).catch(() => {});
      } else {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(waUrl, '_blank');
      }
    });
  };

  window.triggerUniversalShare = function (customData) {
    window.triggerViralPageShare(customData);
  };

  // Universal KPI Card Audio Player (Hindi Speech Synthesis + Action Gated)
  window.playKpiCardAudio = function (event, title, text) {
    if (event) {
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }

    checkRegistrationGate(() => {
      if (!('speechSynthesis' in window)) {
        alert('आपके डिवाइस में हिंदी ऑडियो सिंथेसाइज़र समर्थित नहीं है।');
        return;
      }
      const targetBtn = event?.currentTarget || (event?.target?.closest ? event.target.closest('.kpi-audio-btn') : null);
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        document.querySelectorAll('.kpi-audio-btn').forEach(b => b.classList.remove('playing'));
        return;
      }
      const cleanTitle = (title || 'आरोग्यम समाधान').replace(/<[^>]+>/g, '');
      const cleanText = (text || '').replace(/<[^>]+>/g, '');
      const speechStr = `${cleanTitle}। ${cleanText}। सम्पूर्ण वैज्ञानिक समाधान व परामर्श के लिए आरोग्यम इंडिया पर संपर्क करें।`;
      const utterance = new SpeechSynthesisUtterance(speechStr);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      if (targetBtn) targetBtn.classList.add('playing');

      utterance.onend = function () {
        if (targetBtn) targetBtn.classList.remove('playing');
      };
      utterance.onerror = function () {
        if (targetBtn) targetBtn.classList.remove('playing');
      };
      window.speechSynthesis.speak(utterance);
    });
  };

  // Universal KPI Card Blue Share Trigger (Native WebShare + Action Gated)
  window.triggerKpiNativeShare = function (event, title, text, targetUrl) {
    if (event) {
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }

    checkRegistrationGate(() => {
      const cms = getCurrentPageCmsConfig();
      const refCode = getBestReferralCode();

      const targetUrlObj = new URL(targetUrl || window.location.href, window.location.origin);
      if (refCode) {
        targetUrlObj.searchParams.set('ref', refCode);
        targetUrlObj.searchParams.set('share_id', refCode);
      }
      const pageUrl = targetUrlObj.href;

      const cleanTitle = (title || cms?.og_title || 'Aarogyam India').replace(/<[^>]+>/g, '');
      const cleanText = (text || cms?.og_description || '').replace(/<[^>]+>/g, '');

      let shareMessage = '';
      if (cms?.share_message && cms.share_message.trim()) {
        shareMessage = cms.share_message
          .replace(/\{title\}/g, cleanTitle)
          .replace(/\{description\}/g, cleanText)
          .replace(/\{desc\}/g, cleanText)
          .replace(/\{url\}/g, pageUrl);
        if (!shareMessage.includes(pageUrl)) {
          shareMessage += `\n\n👉 सम्पूर्ण विवरण व समाधान देखें:\n${pageUrl}`;
        }
      } else {
        shareMessage = `🌾 *${cleanTitle}*\n${cleanText ? cleanText + '\n\n' : ''}👉 सम्पूर्ण विवरण व आयुर्वेदिक उपाय देखें:\n${pageUrl}`;
      }

      // Do NOT pass url separately to avoid duplication in Android/WhatsApp
      if (navigator.share) {
        navigator.share({
          title: cleanTitle,
          text: shareMessage
        }).catch(() => {});
      } else {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(waUrl, '_blank');
      }
    });
  };

  // Public APIs
  window.togglePageAudioGreeting = function () {
    if (!isSpeaking) {
      checkRegistrationGate(() => {
        playAudioGreeting(false);
      });
    } else {
      stopAudio();
    }
  };
  window.stopPageAudioGreeting = stopAudio;
  window.playPageAudioGreeting = playAudioGreeting;

  // 8. Reliable Page Audio Auto-Play Controller (Respects user stop)
  let autoPlayHandled = false;

  function attemptPageAudioAutoPlay() {
    if (autoPlayHandled) return;
    const pageKey = getActivePageKey();
    if (sessionStorage.getItem('aoi_audio_user_stopped') === '1' || sessionStorage.getItem('aoi_audio_stopped_' + pageKey) === '1') {
      return;
    }
    const sessionKey = 'aoi_audio_played_' + pageKey;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    autoPlayHandled = true;
    window.removeEventListener('click', handleFirstUserGesture);
    window.removeEventListener('touchstart', handleFirstUserGesture);
    window.removeEventListener('scroll', handleFirstUserGesture);

    try {
      sessionStorage.setItem(sessionKey, '1');
      playAudioGreeting(true);
    } catch (e) {}
  }

  function handleFirstUserGesture() {
    attemptPageAudioAutoPlay();
  }

  // Register user gesture triggers for browsers requiring user interaction
  window.addEventListener('click', handleFirstUserGesture, { once: true, passive: true });
  window.addEventListener('touchstart', handleFirstUserGesture, { once: true, passive: true });
  window.addEventListener('scroll', handleFirstUserGesture, { once: true, passive: true });

  // 9. Universal Robust Hero Carousel Engine (Works on all pages & subpages)
  function initUniversalHeroCarousel(customSelector) {
    const selector = customSelector || '.bighaat-carousel-container, .home-hero-section, .ebook-hero-slider-section, .bighaat-carousel-wrap';
    const containers = document.querySelectorAll(selector);

    if (!containers || !containers.length) return;

    containers.forEach((container) => {
      if (container.dataset.carouselInit === 'true') return;
      container.dataset.carouselInit = 'true';

      const slides = container.querySelectorAll('.home-hero-slide-item, .bighaat-carousel-slide');
      if (!slides.length) return;

      const parentWrap = container.closest('section') || container.parentElement || container;
      const dots = parentWrap.querySelectorAll('.bighaat-carousel-dot, .hero-dot-indicator');
      const prevBtn = container.querySelector('.bighaat-carousel-arrow.prev') || parentWrap.querySelector('.bighaat-carousel-arrow.prev');
      const nextBtn = container.querySelector('.bighaat-carousel-arrow.next') || parentWrap.querySelector('.bighaat-carousel-arrow.next');

      let activeIndex = 0;
      let timer = null;

      function goToSlide(idx) {
        if (idx < 0) idx = slides.length - 1;
        if (idx >= slides.length) idx = 0;

        slides.forEach((s, i) => {
          if (i === idx) {
            s.style.display = 'block';
            s.style.opacity = '0';
            s.style.transition = 'opacity 0.4s ease';
            requestAnimationFrame(() => { s.style.opacity = '1'; });
          } else {
            s.style.display = 'none';
          }
        });

        dots.forEach((d, i) => {
          if (i === idx) {
            d.classList.add('active');
            d.style.background = '#16a34a';
            d.style.width = '28px';
          } else {
            d.classList.remove('active');
            d.style.background = '#cbd5e1';
            d.style.width = '8px';
          }
        });

        activeIndex = idx;
      }

      function startTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          goToSlide(activeIndex + 1);
        }, 5000);
      }

      function stopTimer() {
        if (timer) clearInterval(timer);
      }

      goToSlide(0);

      if (slides.length > 1) {
        startTimer();

        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(activeIndex - 1);
            startTimer();
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(activeIndex + 1);
            startTimer();
          });
        }

        dots.forEach((dot, dotIdx) => {
          dot.addEventListener('click', () => {
            goToSlide(dotIdx);
            startTimer();
          });
        });

        container.addEventListener('mouseenter', stopTimer);
        container.addEventListener('mouseleave', startTimer);

        // Mobile touch swipe
        let touchStartX = 0;
        container.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
          const touchEndX = e.changedTouches[0].screenX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) goToSlide(activeIndex + 1);
            else goToSlide(activeIndex - 1);
            startTimer();
          }
        }, { passive: true });
      }
    });
  }

  window.initPanoramicCarousel = initUniversalHeroCarousel;
  window.checkRegistrationGate = checkRegistrationGate;
  window.openSlimLeadModal = openSlimLeadModal;
  window.isUserRegistered = isUserRegistered;

  // Initialize once DOM is ready
  function initEngine() {
    renderFloatingActionBar();
    renderMobileBottomNav();
    initUniversalHeroCarousel();

    // Auto-play attempt on page load after brief delay
    setTimeout(() => {
      attemptPageAudioAutoPlay();
    }, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }
})();

