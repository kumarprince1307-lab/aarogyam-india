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

  function stopAudio() {
    if (synth) {
      synth.cancel();
    }
    isSpeaking = false;
    updateAudioUIState(false);
  }

  function playAudioGreeting() {
    if (!synth) {
      alert('आपके ब्राउज़र में ऑडियो स्पीच सपोर्ट उपलब्ध नहीं है।');
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

  // 6. Injects Mobile Sticky Bottom Navigation
  function renderMobileBottomNav() {
    if (document.getElementById('mobile-bottom-nav-bar')) return;

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

  // 7. Universal Viral Share Trigger
  window.triggerViralPageShare = function (customData) {
    const pageKey = getActivePageKey();
    const config = pageAudioScripts[pageKey] || pageAudioScripts['index'];
    const title = customData?.title || `${config.title} - Aarogyam India`;
    const text = customData?.text || `🌾 क्या आप भी ${config.title} का संपूर्ण समाधान ढूंढ रहे हैं? Aarogyam India पर प्रामाणिक जानकारी व उपचार देखें:`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n\n👉 यहाँ देखें: ' + url)}`;
      window.open(waUrl, '_blank');
    }
  };

  // Public APIs
  window.togglePageAudioGreeting = playAudioGreeting;
  window.stopPageAudioGreeting = stopAudio;
  window.playPageAudioGreeting = playAudioGreeting;

  // 8. Polite First-Gesture Smart Auto-Play Controller
  let autoPlayHandled = false;
  function handleFirstUserGesture() {
    if (autoPlayHandled) return;
    autoPlayHandled = true;

    window.removeEventListener('click', handleFirstUserGesture);
    window.removeEventListener('touchstart', handleFirstUserGesture);

    const pageKey = getActivePageKey();
    const sessionKey = 'aoi_audio_played_' + pageKey;
    if (sessionStorage.getItem(sessionKey)) {
      return; // Already played for this page in this session
    }

    // Auto-play after 400ms following user's first natural interaction
    setTimeout(() => {
      try {
        sessionStorage.setItem(sessionKey, '1');
        playAudioGreeting();
      } catch (e) {}
    }, 400);
  }

  window.addEventListener('click', handleFirstUserGesture, { once: true, passive: true });
  window.addEventListener('touchstart', handleFirstUserGesture, { once: true, passive: true });

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderFloatingActionBar();
      renderMobileBottomNav();
    });
  } else {
    renderFloatingActionBar();
    renderMobileBottomNav();
  }
})();
