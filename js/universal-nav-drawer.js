/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL RESPONSIVE ACCORDION DRAWER & SHARE ENGINE
 * Version: 17.0 (Zero Lag, Instant Accordion Toggle, Exact Verified Routes)
 * ====================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. GET USER REFERRAL / SHARE ID
  // -------------------------------------------------------------
  window.getUserShareId = function () {
    if (window.V1_SESSION && typeof window.V1_SESSION.getUnifiedShareId === 'function') {
      return window.V1_SESSION.getUnifiedShareId();
    }
    let savedUser = {};
    try {
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || '{}');
    } catch (e) { }
    if (savedUser.share_id && /^AI\d{4,8}$/i.test(savedUser.share_id)) return savedUser.share_id;
    if (savedUser.referral_code && /^AI\d{4,8}$/i.test(savedUser.referral_code)) return savedUser.referral_code;

    // Check specific storage keys
    const regShare = localStorage.getItem('user_share_id') || localStorage.getItem('aim_user_share_id') || localStorage.getItem('aarogyam_user_share_id');
    if (regShare && /^AI\d{4,8}$/i.test(regShare)) return regShare;

    // Derive AI-code from stored mobile (Strict: Never raw 10 digits)
    const cleanMob = (savedUser.mobile || localStorage.getItem('aim_user_mobile') || localStorage.getItem('user_mobile') || '').replace(/\D/g, '').slice(-10);
    if (cleanMob.length === 10) {
      return 'AI' + cleanMob.slice(-6);
    }

    // Check URL parameters & referrer caches
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get('ref') || params.get('share_id');
      if (urlRef && /^AI\d{4,8}$/i.test(urlRef)) return urlRef;
      const cachedRef = localStorage.getItem('AOI_REFERRER_ID');
      if (cachedRef && /^AI\d{4,8}$/i.test(cachedRef)) return cachedRef;
    } catch (e) { }

    return 'AI000004';
  };

  // -------------------------------------------------------------
  // 2. GENERATE REFERRAL-ATTACHED SHARE URL
  // -------------------------------------------------------------
  window.generateReferralShareUrl = function (targetUrl) {
    const base = targetUrl || window.location.href;
    const urlObj = new URL(base, window.location.origin);
    const shareId = window.getUserShareId();
    urlObj.searchParams.set('share_id', shareId);
    urlObj.searchParams.delete('from');
    urlObj.searchParams.delete('ref');
    return urlObj.toString();
  };

  // -------------------------------------------------------------
  // 3. AI CONSULTATION & UPLINE PRODUCT CONSULTANT ROUTING ENGINE
  // -------------------------------------------------------------
  window.consultAiExpert = function (topic, details) {
    // 1. Guest Gate: Check if user is registered / has profile
    const isLogged = (window.isUserLoggedIn && typeof window.isUserLoggedIn === 'function')
      ? window.isUserLoggedIn()
      : ((window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') ? window.V1_SESSION.isLoggedIn() : false);

    let savedUser = {};
    try {
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || '{}');
    } catch (e) { }

    const userMobile = (savedUser.mobile || localStorage.getItem('aim_user_mobile') || localStorage.getItem('user_mobile') || '').replace(/\D/g, '').slice(-10);
    const userName = savedUser.full_name || savedUser.name || localStorage.getItem('aim_user_name') || localStorage.getItem('user_name') || '';

    const needsAuth = !isLogged && (!userMobile || !userName || userName === 'प्रिय पाठक' || userName === 'स्वास्थ्य साधक');

    if (needsAuth) {
      if (typeof window.openGuestLoginModal === 'function') {
        window.openGuestLoginModal(() => {
          window.consultAiExpert(topic, details);
        }, {
          force: true,
          title: '🩺 AI डॉक्टर व विशेषज्ञ परामर्श',
          subtitle: 'उचित सलाह व समाधान हेतु अपना नाम व WhatsApp नंबर दर्ज करें'
        });
        return;
      }
    }

    // 2. Identify Consultant (Upline / Sponsor or Master Product Consultant)
    let consultantPhone = '7974422572';
    let consultantName = 'आरोग्यम प्रोडक्ट कंसलटेंट जी';

    try {
      const sponsorMob = localStorage.getItem('AOI_SPONSOR_MOBILE') ||
        localStorage.getItem('aim_sponsor_mobile') ||
        localStorage.getItem('AOI_REFERRER_MOBILE') ||
        savedUser.referred_by_mobile ||
        savedUser.sponsor_mobile;
      if (sponsorMob && /^\d{10}$/.test(String(sponsorMob).replace(/\D/g, '').slice(-10))) {
        consultantPhone = String(sponsorMob).replace(/\D/g, '').slice(-10);
      }
      const sponsorName = localStorage.getItem('AOI_SPONSOR_NAME') || localStorage.getItem('aim_sponsor_name') || savedUser.referred_by_name;
      if (sponsorName && sponsorName.trim()) {
        consultantName = sponsorName.trim() + ' जी';
      }
    } catch (e) { }

    // 3. User Details & Share ID
    const displayName = userName || 'स्वास्थ्य साधक';
    const displayMobile = userMobile ? ` (मोबाइल: ${userMobile})` : '';
    const shareId = window.getUserShareId();

    const pageTitle = (document.title || 'आरोग्यम स्वास्थ्य हब').split('|')[0].trim();
    const topicTitle = topic || pageTitle;
    const cleanDetails = details ? `\n• मुख्य समस्या / लक्षण: ${details.replace(/<[^>]+>/g, '').trim()}` : '';
    const currentUrl = window.location.href.split('?')[0];
    const shareLink = `${currentUrl}?ref=${encodeURIComponent(shareId)}`;

    // 4. Build Complete Structured WhatsApp Message
    const waMessage =
      `नमस्ते ${consultantName},

मेरा नाम: ${displayName}${displayMobile}
विषय: ${pageTitle}
परामर्श: ${topicTitle}${cleanDetails}

मुझे इस समस्या के आयुर्वेदिक समाधान, परहेज, डाइट व प्रमाणित उत्पादों के बारे में आपसे परामर्श चाहिए। कृपया मेरा मार्गदर्शन करें।

🔗 पेज लिंक: ${shareLink}`;

    const waUrl = `https://api.whatsapp.com/send?phone=91${consultantPhone}&text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, '_blank');
  };

  window.getPersonalizedWhatsAppUrl = function (topic, details) {
    let savedUser = {};
    try {
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('aarogyam_user') || localStorage.getItem('CURRENT_USER') || '{}');
    } catch (e) { }

    const userName = savedUser.full_name || savedUser.name || localStorage.getItem('aim_user_name') || 'स्वास्थ्य साधक';
    const userPhone = savedUser.mobile || localStorage.getItem('aim_user_mobile') || '';
    const userMeta = userPhone ? ` (मोबाइल: ${userPhone})` : '';
    const cleanTopic = topic || (document.title || 'आरोग्यम स्वास्थ्य हब').split('|')[0].trim();
    const shareId = window.getUserShareId();
    const shareLink = `${window.location.href.split('?')[0]}?ref=${encodeURIComponent(shareId)}`;

    let consultantPhone = '7974422572';
    let consultantName = 'आरोग्यम प्रोडक्ट कंसलटेंट जी';
    try {
      const sponsorMob = localStorage.getItem('AOI_SPONSOR_MOBILE') || localStorage.getItem('aim_sponsor_mobile');
      if (sponsorMob && /^\d{10}$/.test(String(sponsorMob).replace(/\D/g, '').slice(-10))) {
        consultantPhone = String(sponsorMob).replace(/\D/g, '').slice(-10);
      }
      const sponsorName = localStorage.getItem('AOI_SPONSOR_NAME') || localStorage.getItem('aim_sponsor_name');
      if (sponsorName && sponsorName.trim()) consultantName = sponsorName.trim() + ' जी';
    } catch (e) { }

    const message = `नमस्ते ${consultantName},\n\nमेरा नाम: ${userName}${userMeta}\nविषय: ${cleanTopic}\n${details ? 'विवरण: ' + details + '\n' : ''}\nमुझे इस विषय पर उचित सलाह व उत्पाद मार्गदर्शन चाहिए।\nपेज लिंक: ${shareLink}`;
    return `https://api.whatsapp.com/send?phone=91${consultantPhone}&text=${encodeURIComponent(message)}`;
  };

  // -------------------------------------------------------------
  // 4. UNIVERSAL PWA INSTALLATION CONTROLLER (SMART DETECTION)
  // -------------------------------------------------------------
  let deferredPwaPrompt = null;

  function isPwaInstalled() {
    try {
      // Return true ONLY when running inside the installed standalone PWA app window
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      if (isStandalone) return true;

      // Android TWA / WebAPK wrapper
      if (document.referrer && document.referrer.startsWith('android-app://')) {
        return true;
      }
    } catch (e) { }
    return false;
  }

  function checkPwaInstallState() {
    const installed = isPwaInstalled();
    const installBtns = document.querySelectorAll('#universal-sticky-pwa-install-btn, .sticky-float-install-pill, #header-pwa-install-btn, .btn-pwa-install');
    installBtns.forEach(btn => {
      if (installed) {
        btn.style.setProperty('display', 'none', 'important');
      } else {
        btn.style.removeProperty('display');
      }
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    checkPwaInstallState();
  });

  window.addEventListener('appinstalled', () => {
    try { localStorage.setItem('AI_PWA_INSTALLED', 'true'); } catch (e) { }
    const installBtns = document.querySelectorAll('#universal-sticky-pwa-install-btn, .sticky-float-install-pill, #header-pwa-install-btn, .btn-pwa-install');
    installBtns.forEach(btn => btn.style.setProperty('display', 'none', 'important'));
  });

  try {
    if (window.matchMedia) {
      window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
        checkPwaInstallState();
      });
    }
  } catch (e) { }

  window.triggerPwaInstall = function () {
    if (isPwaInstalled()) {
      showDrawerToast('🎉 Aarogyam India App पहले से आपके मोबाइल में इंस्टॉल है!', 'success');
      checkPwaInstallState();
      return;
    }
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          try { localStorage.setItem('AI_PWA_INSTALLED', 'true'); } catch (e) { }
          const installBtns = document.querySelectorAll('#universal-sticky-pwa-install-btn, .sticky-float-install-pill');
          installBtns.forEach(btn => btn.style.setProperty('display', 'none', 'important'));
          showDrawerToast('🎉 Aarogyam India App installed successfully!', 'success');
        }
        deferredPwaPrompt = null;
      });
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        alert('📲 Aarogyam App को iPhone / iPad पर इनस्टॉल करने के लिए:\n1. नीचे Safari Share बटन (⎋) दबाएं।\n2. "Add to Home Screen" (+) चुनें।');
      } else {
        alert('📲 Aarogyam App इनस्टॉल करने के लिए ब्राउज़र मेनू (⋮) खोलें और "Add to Home screen" या "Install App" दबाएं।');
      }
    }
  };

  // -------------------------------------------------------------
  // 4.1 SMART DRAWER NOTIFICATION PERMISSION CONTROLLER
  // -------------------------------------------------------------
  window.updateDrawerNotificationStatus = function () {
    const btn = document.getElementById('drawer-notif-control-btn');
    const label = document.getElementById('drawer-notif-btn-label');
    const badge = document.getElementById('drawer-notif-status-badge');
    if (!btn || !label || !badge) return;

    if (typeof window === 'undefined' || !('Notification' in window)) {
      btn.style.display = 'none';
      return;
    }

    const perm = Notification.permission;
    if (perm === 'granted') {
      btn.style.background = '#16a34a';
      btn.style.color = '#ffffff';
      btn.style.border = '1.5px solid #15803d';
      btn.style.boxShadow = '0 2px 8px rgba(22,163,74,0.35)';
      badge.textContent = 'Active';
      badge.style.background = '#ffffff';
      badge.style.color = '#15803d';
      label.textContent = 'Notification';
      btn.title = 'Notifications are Active';
    } else if (perm === 'denied') {
      btn.style.background = '#ef4444';
      btn.style.color = '#ffffff';
      btn.style.border = '1.5px solid #dc2626';
      btn.style.boxShadow = '0 2px 8px rgba(239,68,68,0.35)';
      badge.textContent = 'Off';
      badge.style.background = '#ffffff';
      badge.style.color = '#b91c1c';
      label.textContent = 'Notification';
      btn.title = 'Notifications are Blocked';
    } else {
      btn.style.background = '#f59e0b';
      btn.style.color = '#ffffff';
      btn.style.border = '1.5px solid #d97706';
      btn.style.boxShadow = '0 2px 8px rgba(245,158,11,0.35)';
      badge.textContent = 'Enable';
      badge.style.background = '#ffffff';
      badge.style.color = '#b45309';
      label.textContent = 'Notification';
      btn.title = 'Enable Push Notifications';
    }
  };

  window.triggerDrawerNotificationToggle = async function () {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('⚠️ आपके ब्राउज़र में वेब नोटिफिकेशन सपोर्ट उपलब्ध नहीं है।');
      return;
    }

    const perm = Notification.permission;
    if (perm === 'granted') {
      if (typeof showDrawerToast === 'function') {
        showDrawerToast('🔔 सूचनाएं आपके मोबाइल पर पहले से 100% चालू हैं!', 'success');
      }
      // Fire a live sample alert so user instantly sees their phone ring
      if (typeof window.triggerNativePushNotification === 'function') {
        window.triggerNativePushNotification({
          title: 'आरोग्यम सूचनाएं 🌾',
          message: 'बधाई! आपके मोबाइल पर लाइव नोटिफिकेशन सफलतापूर्वक सक्रिय हैं।',
          image: '/images/books/fasal-ka-doctor-cover.webp',
          action_url: '/'
        });
      }
      window.updateDrawerNotificationStatus();
      return;
    }

    if (perm === 'denied') {
      alert('⚠️ आपके मोबाइल/ब्राउज़र में नोटिफिकेशन ब्लॉक (Blocked) किया हुआ है!\n\nइसे चालू करने के लिए:\n1. स्क्रीन के सबसे ऊपर वेबसाइट नाम के पास 🔒 (Lock / Tune Icon) पर क्लिक करें।\n2. "Permissions" या "Site Settings" में जाएं।\n3. "Notifications" को "Allow" (चालू) करें।\n4. इसके बाद पेज को रिफ्रेश करें।');
      return;
    }

    // Default: Request permission now
    try {
      const res = await Notification.requestPermission();
      window.updateDrawerNotificationStatus();
      if (res === 'granted') {
        if (typeof showDrawerToast === 'function') {
          showDrawerToast('🎉 बधाई! नोटिफिकेशन सफलतापूर्वक चालू हो गए!', 'success');
        }
        if (typeof window.triggerNativePushNotification === 'function') {
          window.triggerNativePushNotification({
            title: 'आरोग्यम इंडिया 🌾',
            message: 'नमस्ते! अब आपको मौसम, फसल रोग व पशु पोषण के ताज़ा अलर्ट्स सीधे मिलते रहेंगे।',
            image: '/images/books/fasal-ka-doctor-cover.webp',
            action_url: '/'
          });
        }
      } else if (res === 'denied') {
        alert('⚠️ आपने अनुमति नहीं दी। आप कभी भी ब्राउज़र के 🔒 लॉक आइकॉन पर क्लिक करके नोटिफिकेशन चालू कर सकते हैं।');
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  };

  // -------------------------------------------------------------
  // 5. MULTI-PLATFORM REFERRAL SHARE ENGINE MODAL (TRANSPARENT 5-BUTTON STACK)
  // -------------------------------------------------------------
  window.recordModalShareEvent = function (platform, targetUrl, title) {
    try {
      const sId = (typeof window.getUserShareId === 'function') ? window.getUserShareId() : 'AI000004';
      const event = {
        id: 'sh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        share_id: sId,
        platform: platform || 'universal',
        title: title || document.title || 'Aarogyam India',
        page: window.location.pathname,
        url: targetUrl || window.location.href,
        timestamp: new Date().toISOString()
      };
      const shares = JSON.parse(localStorage.getItem('AOI_SHARE_TELEMETRY') || '[]');
      shares.unshift(event);
      if (shares.length > 300) shares.pop();
      localStorage.setItem('AOI_SHARE_TELEMETRY', JSON.stringify(shares));

      if (typeof fetch === 'function') {
        fetch('https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/rpc/increment_share_count', {
          method: 'POST',
          headers: {
            'apikey': 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_share_token: sId })
        }).catch(() => { });
      }

      // Connect WhatsApp share action with 10-Share Goal Challenge & Audio Chime
      if (platform && platform.startsWith('whatsapp')) {
        if (window.AarogyamPromotionGateway && typeof window.AarogyamPromotionGateway.recordShareAction === 'function') {
          window.AarogyamPromotionGateway.recordShareAction();
        }
      }
    } catch (e) { }
  };

  window.openUniversalShareModal = function (optionsOrTitle, text, url, image) {
    let title = '';
    let targetUrl = '';
    let customText = '';
    let customImage = '';

    if (typeof optionsOrTitle === 'object' && optionsOrTitle !== null) {
      title = optionsOrTitle.title || '';
      customText = optionsOrTitle.text || '';
      targetUrl = optionsOrTitle.url || '';
      customImage = optionsOrTitle.image || optionsOrTitle.thumb || '';
    } else {
      title = optionsOrTitle || '';
      customText = text || '';
      targetUrl = url || '';
      customImage = image || '';
    }

    // 🔒 GUEST GATE: Check if user is logged in before allowing ANY share
    const isLogged = (window.isUserLoggedIn && typeof window.isUserLoggedIn === 'function')
      ? window.isUserLoggedIn()
      : ((window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') ? window.V1_SESSION.isLoggedIn() : false);

    if (!isLogged) {
      if (typeof window.openGuestLoginModal === 'function') {
        window.openGuestLoginModal(() => {
          window.openUniversalShareModal(optionsOrTitle, text, url, image);
        }, { force: false, source: 'UniversalShareGate' });
        return;
      }
    }

    const referralUrl = window.generateReferralShareUrl(targetUrl);
    title = title || document.title || 'Aarogyam India - Digital Agriculture & Healthcare Hub';

    let fullShareText = '';
    const curPath = window.location.pathname.toLowerCase();

    if (curPath.includes('weather')) {
      fullShareText = (typeof window.getDynamicWeatherShareText === 'function') ? window.getDynamicWeatherShareText() : '';
    } else if (curPath.includes('mandi')) {
      fullShareText = (typeof window.getDynamicMandiShareText === 'function') ? window.getDynamicMandiShareText() : '';
    } else if (curPath.includes('panchang')) {
      fullShareText = (typeof window.getDynamicPanchangShareText === 'function') ? window.getDynamicPanchangShareText() : '';
    }

    // 1. Preserve specialized dynamic engines if no card-specific text was provided
    if (!customText) {
      if (curPath.includes('weather') && typeof window.getDynamicWeatherShareText === 'function') {
        fullShareText = window.getDynamicWeatherShareText();
      } else if (curPath.includes('mandi') && typeof window.getDynamicMandiShareText === 'function') {
        fullShareText = window.getDynamicMandiShareText();
      } else if (curPath.includes('panchang') && typeof window.getDynamicPanchangShareText === 'function') {
        fullShareText = window.getDynamicPanchangShareText();
      }
    }

    // 2. If card-specific, video-specific or disease-specific text was passed, use it directly!
    if (!fullShareText) {
      if (customText && customText.length > 5) {
        // 🔒 AUTO-INJECT ATTRIBUTION: Replace {url} or bare internal domain links with referralUrl
        let processed = customText.replace(/\{url\}|\{link\}/gi, referralUrl);
        const domainRegex = /(https?:\/\/(?:www\.)?aarogyamindia\.(?:online|org)[^\s"'>]*)/gi;
        if (domainRegex.test(processed)) {
          processed = processed.replace(domainRegex, (matchedUrl) => {
            return window.generateReferralShareUrl ? window.generateReferralShareUrl(matchedUrl) : matchedUrl;
          });
        }
        if (processed.includes('http')) {
          fullShareText = processed;
        } else {
          fullShareText = `${processed}\n\n👉 यहाँ से पूरा विवरण देखें:\n${referralUrl}`;
        }
      } else if (curPath.includes('weather')) {
        fullShareText = `⛅ *आरोग्यम लाइव कृषि मौसम व वैज्ञानिक स्प्रे एडवाइजरी*\n\n👉 अपने क्षेत्र का 7-दिवसीय मौसम, सटीक वर्षा रडार व स्प्रे निर्णय मीटर अभी देखें:\n${referralUrl}\n\n_Aarogyam India — किसानों की सुरक्षा व आत्मनिर्भरता का डिजिटल मंच_`;
      } else if (curPath.includes('mandi')) {
        fullShareText = `📊 *आरोग्यम लाइव दैनिक मंडी भाव बुलेटिन*\n\n👉 अपने नजदीकी मंडी का आज का ताज़ा भाव, आवक व बाजार स्थिति अभी देखें:\n${referralUrl}\n\n_Aarogyam India — आधुनिक खेती, पारदर्शी बाजार_`;
      } else {
        fullShareText = `🌾 *${title}*\n\nखेती की सम्पूर्ण ई-बुक्स, 50+ फसल सुरक्षा गाइड, लाइव मंडी भाव व 24×7 AI डॉक्टर समाधान!\n👉 मेरे रेफरल लिंक से अभी देखें:\n${referralUrl}`;
      }
    }

    let overlay = document.getElementById('ai-share-drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ai-share-drawer-overlay';
      overlay.className = 'ai-share-drawer-overlay';
      document.body.appendChild(overlay);
    }

    const encodedUrl = encodeURIComponent(referralUrl);
    const encodedText = encodeURIComponent(fullShareText);

    overlay.innerHTML = `
      <div class="ai-share-buttons-stack" id="ai-share-buttons-stack">
        
        <!-- 1. WhatsApp Button -->
        <a href="https://api.whatsapp.com/send?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-whatsapp" onclick="window.recordModalShareEvent('whatsapp', '${referralUrl}', '${title.replace(/'/g, "\\'")}'); window.closeUniversalShareModal();">
          <div class="ai-share-icon-wrap" style="background:#25D366;color:#fff;">
            <i class="fa-brands fa-whatsapp"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>WhatsApp</strong>
            <span>किसान ग्रुप्स व दोस्तों को तुरंत मैसेज भेजें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 2. Facebook Button -->
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" class="ai-share-btn-item ch-facebook" onclick="window.recordModalShareEvent('facebook', '${referralUrl}', '${title.replace(/'/g, "\\'")}'); window.closeUniversalShareModal();">
          <div class="ai-share-icon-wrap" style="background:#1877F2;color:#fff;">
            <i class="fa-brands fa-facebook-f"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Facebook</strong>
            <span>फेसबुक फीड या मैसेंजर पर पोस्ट करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 3. Twitter / X Button -->
        <a href="https://twitter.com/intent/tweet?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-twitter" onclick="window.recordModalShareEvent('twitter', '${referralUrl}', '${title.replace(/'/g, "\\'")}'); window.closeUniversalShareModal();">
          <div class="ai-share-icon-wrap" style="background:#000000;color:#fff;">
            <i class="fa-brands fa-x-twitter"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Twitter / X</strong>
            <span>ट्विटर पर पोस्ट या ट्वीट करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 4. Telegram Button -->
        <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" target="_blank" class="ai-share-btn-item ch-telegram" onclick="window.recordModalShareEvent('telegram', '${referralUrl}', '${title.replace(/'/g, "\\'")}'); window.closeUniversalShareModal();">
          <div class="ai-share-icon-wrap" style="background:#229ED9;color:#fff;">
            <i class="fa-brands fa-telegram"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Telegram</strong>
            <span>टेलीग्राम ग्रुप व चैनल्स में शेयर करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 5. Copy Link Button -->
        <div class="ai-share-btn-item ch-copylink" id="ai-share-copy-row-btn" style="cursor:pointer;">
          <div class="ai-share-icon-wrap" style="background:#2563eb;color:#fff;">
            <i class="fa-solid fa-link"></i>
          </div>
          <div class="ai-share-btn-text" style="overflow:hidden;">
            <strong id="ai-share-copy-title">Copy Link</strong>
            <span style="font-family:monospace;font-size:0.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">${referralUrl}</span>
          </div>
          <button type="button" class="ai-share-copy-badge" id="ai-share-copy-badge-action">
            📋 कॉपी करें
          </button>
        </div>

      </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);

    overlay.onclick = function (e) {
      if (e.target === overlay) {
        window.closeUniversalShareModal();
      }
    };

    const copyRow = document.getElementById('ai-share-copy-row-btn');
    const copyBadge = document.getElementById('ai-share-copy-badge-action');
    const copyTitle = document.getElementById('ai-share-copy-title');

    function performCopy(e) {
      if (e) e.stopPropagation();
      window.recordModalShareEvent('copylink', referralUrl, title);
      navigator.clipboard.writeText(referralUrl).then(() => {
        if (copyBadge) {
          copyBadge.textContent = '✅ कॉपी हो गया!';
          copyBadge.style.background = '#16a34a';
        }
        if (copyTitle) copyTitle.textContent = '✅ लिंक कॉपी हो गया!';
        showDrawerToast('📋 रेफरल लिंक सफलतापूर्वक कॉपी हो गया!', 'success');
        setTimeout(() => {
          if (copyBadge) {
            copyBadge.textContent = '📋 कॉपी करें';
            copyBadge.style.background = '#2563eb';
          }
          if (copyTitle) copyTitle.textContent = 'Copy Link';
        }, 2000);
      }).catch(() => {
        if (copyBadge) copyBadge.textContent = '✅ कॉपी हो गया!';
      });
    }

    copyRow?.addEventListener('click', performCopy);
    copyBadge?.addEventListener('click', performCopy);
  };

  // Direct WhatsApp Share (Preserving UI, enforcing Guest Gate)
  window.triggerDirectWhatsAppShare = function (optionsOrText, customUrl) {
    let text = '';
    let targetUrl = '';

    if (typeof optionsOrText === 'object' && optionsOrText !== null) {
      text = optionsOrText.text || '';
      targetUrl = optionsOrText.url || '';
    } else {
      text = optionsOrText || '';
      targetUrl = customUrl || '';
    }

    const isLogged = (window.isUserLoggedIn && typeof window.isUserLoggedIn === 'function')
      ? window.isUserLoggedIn()
      : ((window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') ? window.V1_SESSION.isLoggedIn() : false);

    if (!isLogged) {
      if (typeof window.openGuestLoginModal === 'function') {
        window.openGuestLoginModal(() => {
          window.triggerDirectWhatsAppShare(optionsOrText, customUrl);
        }, { force: false, source: 'UniversalShareGate' });
        return;
      }
    }

    const referralUrl = window.generateReferralShareUrl(targetUrl);
    let finalMsg = text;
    if (!finalMsg.includes('http')) {
      finalMsg = `${finalMsg ? finalMsg + '\n\n' : ''}👉 पूरा विवरण यहाँ देखें:\n${referralUrl}`;
    }

    window.recordModalShareEvent('whatsapp_direct', referralUrl, 'WhatsApp Direct Share');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(finalMsg)}`, '_blank');
  };

  window.closeUniversalShareModal = function () {
    const overlay = document.getElementById('ai-share-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 250);
    }
  };

  // Universal Exports
  window.triggerUniversalShare = window.openUniversalShareModal;
  window.triggerViralPageShare = window.openUniversalShareModal;
  window.triggerShare = window.openUniversalShareModal;

  window.triggerUniversalPageShare = function () {
    const p = window.location.pathname.toLowerCase();
    if (p.includes('weather') && typeof window.shareWeatherWhatsApp === 'function') {
      window.shareWeatherWhatsApp();
      return;
    }
    if (p.includes('mandi') && typeof window.shareMandiWhatsApp === 'function') {
      window.shareMandiWhatsApp();
      return;
    }
    if (p.includes('panchang') && typeof window.sharePanchangWhatsApp === 'function') {
      window.sharePanchangWhatsApp();
      return;
    }
    window.openUniversalShareModal(document.title, '', window.location.href);
  };

  // -------------------------------------------------------------
  // 6. INSTANT ACCORDION TOGGLE CONTROLLER
  // -------------------------------------------------------------
  window.toggleDrawerAccordion = function (key, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const targetPanel = document.getElementById(`drawer-panel-${key}`);
    const targetBtn = document.getElementById(`drawer-btn-${key}`);
    if (!targetPanel) return;

    const isAlreadyOpen = targetPanel.classList.contains('open');

    // Close all other accordions
    document.querySelectorAll('.drawer-submenu-panel').forEach(p => p.classList.remove('open'));
    document.querySelectorAll('.drawer-nav-item-btn').forEach(b => b.classList.remove('accordion-open'));

    // Toggle clicked accordion
    if (!isAlreadyOpen) {
      targetPanel.classList.add('open');
      if (targetBtn) targetBtn.classList.add('accordion-open');
    }
  };

  // -------------------------------------------------------------
  // 7. INJECT UNIVERSAL RESPONSIVE DRAWER & STICKY FLOATING STACK
  // -------------------------------------------------------------
  function generateDrawerProfileHeaderHtml() {
    function getDrawerCookie(cname) {
      try {
        const name = cname + "=";
        const ca = decodeURIComponent(document.cookie).split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i].trim();
          if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
      } catch (_) { }
      return '';
    }

    let savedUser = {};
    try {
      savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || localStorage.getItem('AI_SESSION') || '{}');
    } catch (e) { }

    const userPhone = (localStorage.getItem('aim_user_mobile') || localStorage.getItem('user_phone') || localStorage.getItem('aarogyam_user_phone') || localStorage.getItem('SAKHI_USER_PHONE') || getDrawerCookie('aim_user_mobile') || savedUser.mobile || savedUser.phone || '').replace(/\D/g, '').slice(-10);
    const isLogged = typeof window.isUserLoggedIn === 'function' ? window.isUserLoggedIn() : (userPhone.length === 10);
    let userName = localStorage.getItem('aim_user_name') || localStorage.getItem('user_name') || localStorage.getItem('aarogyam_user_name') || localStorage.getItem('SAKHI_USER_NAME') || getDrawerCookie('aim_user_name') || savedUser.full_name || savedUser.name || savedUser.fullName || '';
    if (!isLogged || !userName || userName.toLowerCase() === 'null' || userName.toLowerCase() === 'undefined' || userName.toLowerCase().includes('guest')) {
      userName = isLogged ? 'Aarogyam Member' : 'Guest User';
    }
    const memberStatusHtml = isLogged
      ? `<span class="drawer-user-status-pill active" style="display:inline-flex;align-items:center;gap:5px;background:#16a34a;color:#ffffff;font-size:0.75rem;font-weight:800;padding:2px 9px;border-radius:12px;border:1px solid #15803d;box-shadow:none !important;white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:#ffffff;display:inline-block;"></span> ${savedUser.isVip ? 'VIP Active' : 'Active Member'}</span>`
      : `<span class="drawer-user-status-pill inactive" style="display:inline-flex;align-items:center;gap:5px;background:#ef4444;color:#ffffff;font-size:0.75rem;font-weight:800;padding:2px 9px;border-radius:12px;border:1px solid #dc2626;box-shadow:none !important;white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:#ffffff;display:inline-block;"></span> Inactive Guest</span>`;
    const shareId = isLogged ? window.getUserShareId() : null;
    const isAdminUser = Boolean(userPhone === '7974422572' || userPhone === '7049294111');

    return `
      <button type="button" class="drawer-close-btn" onclick="window.closeUniversalDrawer()" title="Close Menu">&times;</button>
      
      <div style="display:flex;align-items:center;gap:14px;">
        <div class="drawer-avatar-wrap" style="width:64px;height:64px;border-radius:50%;background:#ffffff;border:2.5px solid #22c55e;box-shadow:none !important;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;position:relative;padding:0;box-sizing:border-box;">
          <img src="/images/logo/aarogyam-official-avatar.png?v=20261121_v7" alt="Aarogyam India" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;" onerror="this.onerror=null;this.src='/images/logo/logo.png';" />
          ${isLogged ? '<span style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;background:#22c55e;border:2px solid #0f172a;border-radius:50%;box-shadow:0 0 6px #22c55e;"></span>' : ''}
        </div>
        <div class="drawer-user-meta" style="flex:1;min-width:0;">
          <div style="font-size:0.74rem;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Welcome</div>
          <h3 class="drawer-user-name" style="margin:2px 0 0 0;font-size:1.25rem;font-weight:900;color:#38bdf8 !important;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:none !important;">${userName}</h3>
          <div style="display:flex;align-items:center;gap:6px;margin-top:5px;flex-wrap:wrap;">
            ${memberStatusHtml}
            ${isLogged && userPhone ? `<span style="font-size:0.80rem;color:#93c5fd;font-weight:800;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;background:rgba(15,23,42,0.6);padding:2px 8px;border-radius:12px;border:1px solid rgba(147,197,253,0.3);"><i class="fa-solid fa-phone" style="font-size:0.72rem;color:#38bdf8;"></i> +91 ${userPhone}</span>` : ''}
          </div>
        </div>
      </div>

      <!-- 2-Row Balanced Header Action Matrix (Full Responsive for all browsers) -->
      <div class="drawer-header-matrix" style="margin-top:14px;display:flex;flex-direction:column;gap:8px;width:100%;box-sizing:border-box;">

        <!-- Row 1: Share ID & Install App (Clean White Buttons) -->
        <div style="display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;">
          ${isLogged && shareId ? `
            <button type="button" onclick="navigator.clipboard?.writeText('${shareId}');if(window.showDrawerToast){window.showDrawerToast('🎯 Share ID Copied: ${shareId}','success');}" style="flex:1;height:38px;background:#ffffff;color:#0f172a;border:1.5px solid #cbd5e1;border-radius:10px;font-weight:800;font-size:0.80rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 1px 4px rgba(0,0,0,0.06);transition:all 0.2s;" title="Click to copy Share ID">
              <span style="font-size:0.9rem;">🎯</span>
              <span>ID: <strong style="letter-spacing:0.5px;font-family:monospace;color:#0284c7;">${shareId}</strong></span>
            </button>
          ` : `
            <div style="flex:1;height:38px;background:#ffffff;color:#0f172a;border:1.5px solid #cbd5e1;border-radius:10px;font-weight:800;font-size:0.80rem;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
              <span>🌱 Aarogyam Hub</span>
            </div>
          `}

          <a href="/aarogyam-app.html" onclick="window.closeUniversalDrawer();" style="flex:1;height:38px;background:#ffffff;color:#0f172a;border:1.5px solid #cbd5e1;border-radius:10px;font-weight:800;font-size:0.80rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 1px 4px rgba(0,0,0,0.06);transition:all 0.2s;" title="Install App">
            <i class="fa-solid fa-mobile-screen-button" style="color:#2563eb;font-size:0.9rem;"></i>
            <span>Install App</span>
          </a>
        </div>

        <!-- Row 2: Notification (Green ON / Red OFF) & Logout (Red) / Login (Green) -->
        <div style="display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;">
          <button type="button" id="drawer-notif-control-btn" onclick="window.triggerDrawerNotificationToggle()" style="flex:1;height:38px;background:#16a34a;color:#ffffff;border:1.5px solid #15803d;border-radius:10px;font-weight:800;font-size:0.80rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 1px 3px rgba(0,0,0,0.12) !important;transition:all 0.2s;" title="Push Notifications">
            <i class="fa-solid fa-bell" style="font-size:0.88rem;"></i>
            <span id="drawer-notif-btn-label">Notification</span>
            <span id="drawer-notif-status-badge" style="background:#ffffff;color:#15803d;font-size:0.68rem;font-weight:900;padding:2px 6px;border-radius:8px;">Active</span>
          </button>

          ${isLogged ? `
            <button type="button" onclick="window.logoutUniversalUser()" style="flex:1;height:38px;background:#ef4444;color:#ffffff;border:1.5px solid #dc2626;border-radius:10px;font-weight:900;font-size:0.82rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 8px rgba(239,68,68,0.35);transition:all 0.2s;">
              <i class="fa-solid fa-arrow-right-from-bracket" style="font-size:0.88rem;"></i>
              <span>Logout</span>
            </button>
          ` : `
            <button type="button" onclick="window.openUniversalLoginHandler()" style="flex:1;height:38px;background:#16a34a;color:#ffffff;border:1.5px solid #15803d;border-radius:10px;font-weight:900;font-size:0.82rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 1px 3px rgba(0,0,0,0.12) !important;">
              <i class="fa-solid fa-key" style="font-size:0.88rem;"></i>
              <span>Login</span>
            </button>
          `}
        </div>

      </div>
    `;
  }

  function clearAllAuthCookies() {
    const cookiesToClear = [
      'aim_user_mobile', 'aim_user_name', 'user_mobile', 'user_phone',
      'farmer_mobile', 'farmer_name', 'aarogyam_user_phone', 'aarogyam_user_name', 'user_share_id',
      'aim_user_email', 'user_email', 'aarogyam_user_registered', 'AI_USER_LOGGED_IN'
    ];
    const host = window.location.hostname;
    const parts = host.split('.');
    const domains = ['', host, '.' + host];
    if (parts.length > 2) {
      domains.push('.' + parts.slice(-2).join('.'));
    }
    cookiesToClear.forEach(name => {
      domains.forEach(d => {
        const dAttr = d ? `; Domain=${d}` : '';
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0${dAttr}; SameSite=Lax`;
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0${dAttr};`;
      });
    });
  }

  function purgeAllStoredUserData() {
    try {
      if (window.AarogyamTeamSecurity && typeof window.AarogyamTeamSecurity.logoutPurge === 'function') {
        window.AarogyamTeamSecurity.logoutPurge();
      }
    } catch (_) { }
    const keysToRemove = [
      'aim_user_name', 'aim_user_mobile', 'aarogyam_user_name', 'aarogyam_user_phone',
      'aarogyam_user_registered', 'aarogyam_user', 'CURRENT_USER', 'aoi_user_session', 'wb_registered',
      'user_name', 'user_phone', 'user_mobile', 'farmer_mobile', 'farmer_name',
      'SAKHI_USER_NAME', 'SAKHI_USER_PHONE', 'SAKHI_PERSONA_PROFILE', 'SAKHI_CURRENT_SESSION_ID',
      'AI_USER', 'AI_PROFILE', 'UCAS_USER', 'AI_SESSION', 'AI_LOGIN_STATUS',
      'my_purchased_book_ids', 'user_share_id', 'aim_user_share_id', 'aarogyam_user_share_id',
      'AOI_USER_SHARE_ID', 'AOI_REFERRER_ID', 'AOI_SPONSOR_MOBILE', 'AOI_SPONSOR_NAME',
      'AOI_WALLET_VAULT_V1', 'AOI_WALLET_BALANCE', 'AOI_DIRECT_REFERRALS', 'AOI_DIRECT_REFERRALS_LEDGER',
      'AOI_TOTAL_SHARES', 'AOI_SHARE_TELEMETRY', 'AOI_PASSBOOK_CACHED_MOBILE', 'AOI_ACTIVE_SESSION_MOBILE',
      'aarogyam_user_direct_referrals', 'aarogyam_user_shares_count', 'aarogyam_user_wallet_balance',
      'aim_user_direct_referrals', 'aim_user_shares_count', 'aim_user_wallet_balance',
      'AOI_WHATSAPP_OFFER_PURCHASES', 'AI_PURCHASES', 'purchases', 'user_purchases', 'aim_purchases', 'cached_purchases',
      'sakhi_chat_history', 'AAROGYAM_SUPERADMIN_HARDWARE',
      'admin_session', 'admin_user', 'admin_role',
      'AI_DIRECT_REFERRALS_CACHE', 'AI_PHONEBOOK_CACHE', 'AI_CLOUD_SURVEYS_CACHE', 'AI_PICKER_SELECTED_MOBILES',
      'AI_KHATABOOK_ENTRIES', 'AAROGYAM_SMART_DIARY_ENTRIES', 'AAROGYAM_SMART_CASHFLOW', 'AI_LOCAL_VAULT', 'AI_HIDDEN_CONTACTS'
    ];
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (_) { }
    });
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (
          k.startsWith('AOI_') ||
          k.startsWith('AI_PURCHASED_') ||
          k.startsWith('AI_KB_') ||
          k.startsWith('AI_DIARY_') ||
          k.startsWith('AI_KHATABOOK_') ||
          k.startsWith('AAROGYAM_SMART_') ||
          k.startsWith('AI_PHONEBOOK_') ||
          k.startsWith('AI_DIRECT_') ||
          k.startsWith('AI_CLOUD_') ||
          k.startsWith('AI_TEAM_SECURITY_') ||
          k.startsWith('aim_') ||
          k.startsWith('aarogyam_')
        )) {
          localStorage.removeItem(k);
        }
      }
    } catch (_) { }
    try {
      sessionStorage.removeItem('ads_gateway_passed');
      sessionStorage.removeItem('wb_registered');
      sessionStorage.removeItem('admin_session');
      // Clean up cached duplicate purchase flags so new purchases on same browser aren't blocked
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith('AI_PURCHASED_') || k.startsWith('AI_ADM_') || k.startsWith('AI_TEAM_SECURITY_'))) {
          sessionStorage.removeItem(k);
        }
      }
    } catch (_) { }
    clearAllAuthCookies();
  }

  window.logoutUniversalUser = function () {
    if (!confirm('क्या आप सचमुच लॉग आउट करना चाहते हैं?')) return;
    purgeAllStoredUserData();
    if (window.V1_SESSION && typeof window.V1_SESSION.logout === 'function') {
      try { window.V1_SESSION.logout(); } catch (_) { }
    }
    window.updateUniversalDrawerProfile();
    window.dispatchEvent(new CustomEvent('ai:user-logged-out'));
    if (typeof window.renderInitialGreeting === 'function') {
      window.renderInitialGreeting();
    }
    window.location.reload();
  };

  window.openUniversalLoginHandler = function () {
    if (typeof window.closeUniversalDrawer === 'function') {
      window.closeUniversalDrawer();
    }
    const isSakhiPage = window.location.pathname.includes('aarogyam-sakhi');
    if (isSakhiPage && typeof window.openSakhiAuthModal === 'function') {
      window.openSakhiAuthModal();
    } else if (typeof window.openGuestLoginModal === 'function') {
      window.openGuestLoginModal(null, { force: true, fastForm: true });
    } else {
      window.location.href = '/registration.html?mode=login';
    }
  };

  function updateHeaderUserBadge() {
    try {
      const headerActions = document.querySelector('.header-actions');
      if (!headerActions) return;

      const isLogged = (window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function')
        ? window.V1_SESSION.isLoggedIn()
        : (typeof window.isUserLoggedIn === 'function' ? window.isUserLoggedIn() : false);

      let existingBadge = document.getElementById('header-unified-user-badge');
      if (!existingBadge) {
        existingBadge = document.createElement('div');
        existingBadge.id = 'header-unified-user-badge';
        existingBadge.style.cssText = 'display:inline-flex;align-items:center;margin:0 2px;';
        const menuBtn = headerActions.querySelector('.menu-button');
        if (menuBtn) {
          headerActions.insertBefore(existingBadge, menuBtn);
        } else {
          headerActions.appendChild(existingBadge);
        }
      }

      if (isLogged) {
        let savedUser = {};
        try {
          savedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || '{}');
        } catch (e) { }
        const name = (savedUser && (savedUser.full_name || savedUser.name)) || localStorage.getItem('aim_user_name') || 'सदस्य';
        const isVip = Boolean(savedUser.isVip);
        existingBadge.innerHTML = `
          <a href="/ucas/index.html" class="header-user-status-pill" title="मेरी प्रोफाइल (My Profile)" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.35);color:#fde047;padding:5px 11px;border-radius:20px;text-decoration:none;font-weight:800;font-size:0.75rem;display:inline-flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:all 0.2s;">
            <span style="font-size:0.88rem;">${isVip ? '👑' : '👨‍🌾'}</span>
            <span style="max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ffffff;">${name}</span>
          </a>
        `;
      } else {
        existingBadge.innerHTML = `
          <button type="button" onclick="window.openUniversalLoginHandler()" class="header-login-quick-btn" title="लॉगिन करें" style="background:#fde047;color:#0f172a;border:none;padding:5px 12px;border-radius:20px;font-weight:900;font-size:0.75rem;cursor:pointer;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,0.18);">
            <span>🔑</span> <span>लॉगिन</span>
          </button>
        `;
      }
    } catch (e) {
      console.warn("Header user badge notice:", e);
    }
  }

  window.updateUniversalDrawerProfile = function () {
    const headerEl = document.querySelector('#universal-drawer-card .drawer-profile-header');
    if (headerEl) {
      headerEl.innerHTML = generateDrawerProfileHeaderHtml();
    }
    updateHeaderUserBadge();
  };

  window.addEventListener('ai:user-logged-in', () => {
    window.updateUniversalDrawerProfile();
  });

  function ensureDrawerStylesInjected() {
    if (document.getElementById('universal-nav-drawer-runtime-style')) return;
    const style = document.createElement('style');
    style.id = 'universal-nav-drawer-runtime-style';
    style.textContent = `
      #universal-drawer-card {
        position: fixed !important;
        top: 0 !important;
        bottom: 0 !important;
        right: 0 !important;
        left: auto !important;
        width: 340px !important;
        max-width: 90vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        -webkit-font-smoothing: antialiased !important;
        box-shadow: -10px 0 45px rgba(0, 0, 0, 0.28) !important;
        border-left: 1.5px solid #cbd5e1 !important;
        border-right: none !important;
        transform: translate3d(100%, 0, 0) !important;
        transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.26s ease !important;
        z-index: 9999999 !important;
        display: flex !important;
        flex-direction: column !important;
      }
      #universal-drawer-card.open {
        transform: translate3d(0, 0, 0) !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }
      @media (max-width: 480px) {
        #universal-drawer-card {
          width: 320px !important;
          max-width: 88vw !important;
          right: 0 !important;
          left: auto !important;
          transform: translate3d(100%, 0, 0) !important;
        }
        #universal-drawer-card.open {
          transform: translate3d(0, 0, 0) !important;
        }
      }
      .drawer-profile-header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
        color: #ffffff !important;
        padding: 24px 18px 18px 18px !important;
        border-bottom: 2px solid #334155 !important;
        position: relative !important;
      }
      .drawer-close-btn {
        position: absolute !important;
        top: 14px !important;
        right: 14px !important;
        background: rgba(255, 255, 255, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        color: #ffffff !important;
        width: 32px !important;
        height: 32px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.2rem !important;
        cursor: pointer !important;
        line-height: 1 !important;
      }
      .drawer-close-btn:hover {
        background: rgba(239, 68, 68, 0.8) !important;
      }
      .drawer-menu-list {
        padding: 14px 12px 30px 12px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        background: #ffffff !important;
      }
      /* Single-line full width utility rows */
      .drawer-util-single-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 10px 14px !important;
        border-radius: 12px !important;
        text-decoration: none !important;
        cursor: pointer !important;
        font-weight: 800 !important;
        font-size: 0.88rem !important;
        border: 1.5px solid #e2e8f0 !important;
        background: #f8fafc !important;
        margin-bottom: 6px !important;
        transition: all 0.2s ease !important;
      }
      .drawer-util-single-row:hover {
        background: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
      }
            .drawer-nav-item-btn {
        width: 100% !important;
        background: #ffffff !important;
        color: #0f172a !important;
        border: 1.5px solid #cbd5e1 !important;
        border-radius: 12px !important;
        padding: 13px 15px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-weight: 900 !important;
        font-size: 0.95rem !important;
        text-decoration: none !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        box-sizing: border-box !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05) !important;
      }
      .drawer-nav-item-btn:hover {
        background: #f8fafc !important;
        border-color: #64748b !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
        transform: translateY(-1px) !important;
      }
      .drawer-nav-item-btn.active-pill {
        background: #f0fdf4 !important;
        border-color: #22c55e !important;
        color: #15803d !important;
        box-shadow: 0 3px 10px rgba(34, 197, 94, 0.15) !important;
      }
      .drawer-item-left {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }
      .drawer-icon-box {
        width: 36px !important;
        height: 36px !important;
        border-radius: 10px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.05rem !important;
        flex-shrink: 0 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
      }
      .drawer-item-title {
        font-weight: 900 !important;
        font-size: 0.96rem !important;
        letter-spacing: 0.2px !important;
        color: #0f172a !important;
      }
      .drawer-tag-pill {
        font-size: 0.75rem !important;
        font-weight: 900 !important;
        padding: 3px 10px !important;
        border-radius: 20px !important;
        background: #e2e8f0 !important;
        color: #0f172a !important;
      }
      .drawer-accordion-arrow {
        font-size: 0.88rem !important;
        color: #475569 !important;
        font-weight: 900 !important;
        transition: transform 0.25s ease !important;
      }
      .drawer-nav-item-btn.expanded .drawer-accordion-arrow {
        transform: rotate(180deg) !important;
      }
      .drawer-submenu-panel {
        display: none;
        flex-direction: column !important;
        gap: 6px !important;
        padding: 6px 0 8px 12px !important;
        border-left: 2px solid #cbd5e1 !important;
        margin-left: 18px !important;
      }
      .drawer-submenu-panel.open {
        display: flex !important;
      }
      .drawer-sub-link-item {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 10px 14px !important;
        background: #ffffff !important;
        border: 1.5px solid #cbd5e1 !important;
        border-radius: 10px !important;
        text-decoration: none !important;
        color: #0f172a !important;
        font-size: 0.88rem !important;
        font-weight: 800 !important;
        transition: all 0.15s ease !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
      }
      .drawer-sub-link-item span,
      .drawer-sub-link-item .drawer-item-left span,
      .drawer-sub-link-item div span {
        color: #0f172a !important;
        font-weight: 800 !important;
        font-size: 0.88rem !important;
      }
      .drawer-sub-link-item:hover {
        background: #f0fdf4 !important;
        border-color: #22c55e !important;
        color: #15803d !important;
        transform: translateX(4px) !important;
        box-shadow: 0 3px 8px rgba(34, 197, 94, 0.15) !important;
      }
      .drawer-sub-link-item:hover span,
      .drawer-sub-link-item:hover .drawer-item-left span,
      .drawer-sub-link-item:hover div span {
        color: #15803d !important;
      }
      .drawer-sub-icon-box {
        width: 28px !important;
        height: 28px !important;
        border-radius: 8px !important;
        background: #e2e8f0 !important;
        color: #1e293b !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 0.85rem !important;
        flex-shrink: 0 !important;
      }
      
      /* Right Docked Bar */
      .universal-sticky-dock-bar {
        position: fixed !important;
        right: 0 !important;
        top: auto !important;
        bottom: 84px !important;
        transform: none !important;
        z-index: 99990 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
        background: rgba(15, 23, 42, 0.88) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        padding: 6px 5px 6px 7px !important;
        border-radius: 14px 0 0 14px !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-right: none !important;
        box-shadow: -4px 6px 20px rgba(0, 0, 0, 0.25) !important;
        opacity: 0.4 !important; /* 40% default translucent opacity */
        transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease !important;
      }
      .universal-sticky-dock-bar.dock-idle-faded {
        opacity: 0.4 !important;
      }
      .universal-sticky-dock-bar:hover,
      .universal-sticky-dock-bar:active,
      .universal-sticky-dock-bar:focus-within,
      .universal-sticky-dock-bar.dock-active-focus,
      body.ai-tour-in-progress .universal-sticky-dock-bar {
        opacity: 1 !important;
        transform: scale(1.02) !important;
      }
      @media (max-width: 768px) {
        .universal-sticky-dock-bar {
          bottom: 78px !important;
          top: auto !important;
          transform: none !important;
          padding: 5px 4px 5px 6px !important;
          gap: 5px !important;
          opacity: 0.4 !important;
        }
        .dock-pill-btn {
          width: 35px !important;
          height: 35px !important;
          font-size: 0.95rem !important;
        }
      }
      .dock-pill-btn {
        width: 40px !important;
        height: 40px !important;
        border-radius: 10px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        color: #ffffff !important;
        font-size: 1.1rem !important;
        border: none !important;
        text-decoration: none !important;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
      }
      .dock-pill-btn:hover, .dock-pill-btn:active {
        transform: scale(1.14) !important;
      }
      .dock-gift-btn {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        box-shadow: 0 2px 10px rgba(245, 158, 11, 0.5) !important;
      }
      .dock-tube-btn {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        box-shadow: 0 2px 10px rgba(239, 68, 68, 0.5) !important;
      }
      .dock-audio-btn {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
      }
      .dock-share-btn {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
      }
      .dock-pwa-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      }

      /* Mobile 7-Tab Bottom Nav */
      @media (max-width: 768px) {
        .universal-mobile-bottom-nav {
          display: flex !important;
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          height: 60px !important;
          background: #ffffff !important;
          border-top: 1.5px solid #e2e8f0 !important;
          box-shadow: 0 -3px 16px rgba(0, 0, 0, 0.08) !important;
          z-index: 99999 !important;
          justify-content: space-around !important;
          align-items: center !important;
          padding: 4px 2px calc(4px + env(safe-area-inset-bottom)) 2px !important;
          box-sizing: border-box !important;
        }
        .universal-mobile-bottom-nav .u-nav-tab {
          flex: 1 !important;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-decoration: none !important;
          color: #64748b !important;
          gap: 2px !important;
        }
        .universal-mobile-bottom-nav .u-nav-tab .u-icon-wrap {
          font-size: 1.15rem !important;
          line-height: 1 !important;
        }
        .universal-mobile-bottom-nav .u-nav-tab span {
          font-size: 0.68rem !important;
          font-weight: 800 !important;
          white-space: nowrap !important;
        }
        .universal-mobile-bottom-nav .u-nav-tab.active {
          color: #16a34a !important;
        }
        .universal-mobile-bottom-nav .u-nav-tab.active .u-icon-wrap {
          transform: scale(1.12);
        }
      }

      /* Suppress legacy duplicate left floating buttons */
      #at-floating-pill,
      #agy-floating-gift-box {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // -------------------------------------------------------------
  // IS BOOK LANDING PAGE DETECTOR (PREVENTS MOBILE BOTTOM DRAWER OVERLAY)
  // -------------------------------------------------------------
  function isBookLandingPage() {
    const currentPath = (window.location.pathname || '').toLowerCase();
    const currentSearch = (window.location.search || '').toLowerCase();

    // 1. Direct path / filename matching for book landing pages
    if (
      currentPath.includes('book-landing') ||
      currentPath.includes('demo-book') ||
      currentPath.includes('demo-kharif') ||
      currentPath.includes('kharif-master-guide') ||
      currentPath.includes('kheti-dr') ||
      currentPath.includes('landingpage') ||
      currentPath.includes('sample-ai-book') ||
      currentPath.includes('book-details') ||
      currentPath.includes('bundle') ||
      currentPath.includes('ai-website-guide')
    ) {
      return true;
    }

    // 2. /ebooks/ or /ebook/ landing page context
    if (currentPath.includes('/ebook') && (currentSearch.includes('book=') || currentSearch.includes('id=') || currentSearch.includes('preview='))) {
      return true;
    }

    // 3. Body class or DOM element checks
    if (document.body && (document.body.classList.contains('book-landing-page') || document.body.dataset.pageType === 'book-landing')) {
      return true;
    }

    if (
      document.getElementById('ubl-mobile-sticky-bar') ||
      document.querySelector('.mobile-sticky-bar') ||
      document.querySelector('.sticky-buy-bar') ||
      document.getElementById('sticky-thumb-img') ||
      document.getElementById('stickyBuyBtn') ||
      document.getElementById('sticky-buy-btn') ||
      document.querySelector('[data-book-landing="true"]')
    ) {
      return true;
    }

    return false;
  }

  function injectUniversalSideDrawer() {
    ensureDrawerStylesInjected();
    updateHeaderUserBadge();
    if (window.USER_NOTIFICATIONS && typeof window.USER_NOTIFICATIONS.ensureBellIcon === 'function') {
      window.USER_NOTIFICATIONS.ensureBellIcon();
    }
    if (document.getElementById('universal-side-drawer-wrap')) {
      window.updateUniversalDrawerProfile();
      return;
    }

    let cartCount = 0;
    try {
      const c = JSON.parse(localStorage.getItem('AI_CART_ITEMS') || '[]');
      cartCount = Array.isArray(c) ? c.length : 0;
    } catch (e) { }

    let wishCount = 0;
    try {
      const w = JSON.parse(localStorage.getItem('AAROGYAM_WISHLIST') || '[]');
      wishCount = Array.isArray(w) ? w.length : 0;
    } catch (e) { }

    const currentPath = (window.location.pathname || '').toLowerCase();
    const currentSearch = (window.location.search || '').toLowerCase();
    const isInstalled = isPwaInstalled();
    const isBookLanding = isBookLandingPage();

    let drawerUserPhone = '';
    try {
      const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || '{}');
      drawerUserPhone = (localStorage.getItem('aim_user_mobile') || localStorage.getItem('user_phone') || u.mobile || u.phone || '').replace(/\D/g, '').slice(-10);
    } catch (_) { }
    const isMasterAdmin = Boolean(drawerUserPhone === '7974422572' || drawerUserPhone === '7049294111');

    if (isBookLanding && document.body) {
      try {
        document.body.classList.add('book-landing-page');
        document.body.dataset.pageType = 'book-landing';
      } catch (e) { }
    }

    const drawerHtml = `
      <div id="universal-side-drawer-wrap">
        <!-- Backdrop Overlay -->
        <div id="universal-drawer-backdrop" onclick="window.closeUniversalDrawer()"></div>

        <!-- Slide-in Drawer Card (Right Side on Desktop & Mobile) -->
        <div id="universal-drawer-card">
          
          <!-- Sleek User Profile Header Banner -->
          <div class="drawer-profile-header">
            ${generateDrawerProfileHeaderHtml()}
          </div>

          <!-- Clean White & Slate Canvas Menu List -->
          <div class="drawer-menu-list" style="flex:1;overflow-y:auto;">

            <!-- 1. HOME (Direct Button) -->
            <a href="/index.html" class="drawer-nav-item-btn ${currentPath === '/' || currentPath.endsWith('index.html') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#e0e7ff;color:#4338ca;"><i class="fa-solid fa-house"></i></div>
                <span class="drawer-item-title">Home</span>
              </div>
            </a>

            <!-- 2. SAKHI AI (Direct Hero Button) -->
            <a href="/aarogyam-sakhi.html" onclick="window.closeUniversalDrawer();" class="drawer-nav-item-btn ${currentPath.includes('aarogyam-sakhi') ? 'active-pill' : ''}" style="background:#f0fdf4 !important; border-color:#86efac !important;">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#15803d;color:#ffffff;"><i class="fa-solid fa-robot"></i></div>
                <span class="drawer-item-title" style="color:#15803d;font-weight:900;">Sakhi AI</span>
              </div>
              <span class="drawer-tag-pill" style="background:#dcfce7;color:#15803d;font-weight:900;">AI</span>
            </a>

            <!-- 3. PROFILE & ACCOUNT (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-profile" onclick="window.toggleDrawerAccordion('profile', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#ede9fe;color:#7c3aed;"><i class="fa-solid fa-user-gear"></i></div>
                <span class="drawer-item-title">Profile & Account</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-profile">
              <a href="/ucas/index.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-id-card"></i></div><span>My Profile Dashboard</span></div>
              </a>
              <a href="/purchases.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-file-invoice-dollar"></i></div><span>My Invoice</span></div>
              </a>
              <a href="/ebooks/my-library.html?tab=purchased#purchased" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-download"></i></div><span>Download Center</span></div>
              </a>
              <a href="/ebooks/share-rewards.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-wallet"></i></div><span>Share and Earn</span></div>
              </a>
            </div>

            <!-- 4. E-BOOKS & COMBOS (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-ebooks" onclick="window.toggleDrawerAccordion('ebooks', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#fef3c7;color:#d97706;"><i class="fa-solid fa-book-bookmark"></i></div>
                <span class="drawer-item-title">E-Books & Combos</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-ebooks">
              <a href="/ebooks/ebook.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-store"></i></div><span>All E-Books Store</span></div>
              </a>
              <a href="/ebooks/agriculture.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-seedling"></i></div><span>Agriculture E-Books</span></div>
              </a>
              <a href="/ebooks/my-library.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-book-open-reader"></i></div><span>My Library</span></div>
                <span class="drawer-tag-pill">Reader 📖</span>
              </a>
              <a href="/ebooks/business.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-chart-pie"></i></div><span>Business & Marketing Books</span></div>
              </a>
              <a href="/ebooks/education.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-graduation-cap"></i></div><span>Education & Self-Help</span></div>
              </a>
              <a href="/ebooks/digital-ai.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-microchip"></i></div><span>Digital & AI Guides</span></div>
              </a>
              <a href="/ebooks/wishlist.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-heart"></i></div><span>Wishlist</span></div>
                <span class="drawer-tag-pill" style="display:${wishCount > 0 ? 'inline-block' : 'none'};">${wishCount}</span>
              </a>
              <a href="/ebooks/cart.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-cart-shopping"></i></div><span>Shopping Cart</span></div>
                <span class="drawer-tag-pill" style="display:${cartCount > 0 ? 'inline-block' : 'none'};">${cartCount}</span>
              </a>
            </div>

            <!-- 5. HEALTH (ALL 13 PAGES ACCORDION) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-health" onclick="window.toggleDrawerAccordion('health', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#fee2e2;color:#ef4444;"><i class="fa-solid fa-heart-pulse"></i></div>
                <span class="drawer-item-title">Health</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-health">
              <a href="/categories/health.html" class="drawer-sub-link-item" style="background:#fef2f2;border-color:#fca5a5;">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box" style="background:#ef4444;color:#fff;"><i class="fa-solid fa-hospital"></i></div><span style="font-weight:900;color:#b91c1c;">Health Care Hub</span></div>
                <span class="drawer-tag-pill" style="background:#ef4444;color:#fff;">MAIN</span>
              </a>
              <a href="/health/diabetes.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-droplet"></i></div><span>1. Diabetes Care</span></div>
              </a>
              <a href="/health/joint-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-bone"></i></div><span>2. Joint & Muscle Care</span></div>
              </a>
              <a href="/health/heart-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-heart"></i></div><span>3. Heart Health</span></div>
              </a>
              <a href="/health/womens-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-person-dress"></i></div><span>4. Women's Health</span></div>
              </a>
              <a href="/health/weight-loss.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-weight-scale"></i></div><span>5. Weight Management</span></div>
              </a>
              <a href="/health/liver-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-shield-virus"></i></div><span>6. Liver Care</span></div>
              </a>
              <a href="/health/thyroid-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-dna"></i></div><span>7. Thyroid Care</span></div>
              </a>
              <a href="/health/skin-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-spa"></i></div><span>8. Skin Care</span></div>
              </a>
              <a href="/health/hair-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-wind"></i></div><span>9. Hair Care</span></div>
              </a>
              <a href="/health/kids-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-child"></i></div><span>10. Kids Wellness</span></div>
              </a>
              <a href="/health/dental-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-tooth"></i></div><span>11. Dental Care</span></div>
              </a>
              <a href="/health/home-care.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-house-chimney-medical"></i></div><span>12. Home & Hygiene Care</span></div>
              </a>
              <a href="/health/sexual-wellness.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-venus-mars"></i></div><span>13. Sexual Wellness</span></div>
              </a>
            </div>

            <!-- 6. NETSURF HUB & CAREER (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-netsurf" onclick="window.toggleDrawerAccordion('netsurf', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#dcfce7;color:#16a34a;"><i class="fa-solid fa-boxes-stacked"></i></div>
                <span class="drawer-item-title">Netsurf Hub</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-netsurf">
              <a href="/categories/netsurf-products.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-file-pdf"></i></div><span>Product Catalog</span></div>
              </a>
              <a href="/categories/netsurf.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-briefcase"></i></div><span>Business Plan & Career</span></div>
              </a>
              <a href="/categories/netsurf-pathfinder.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-compass"></i></div><span>Pathfinder Leader Portal</span></div>
              </a>
            </div>

            <!-- 7. KISAN & VETERINARY SERVICES (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-services" onclick="window.toggleDrawerAccordion('services', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#e0f2fe;color:#0284c7;"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                <span class="drawer-item-title">Kisan & Veterinary Services</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-services">
              <a href="/pashu-palan.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-cow"></i></div><span>Pashupalan & Dairy Hub</span></div>
              </a>
              <a href="/mandi.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-chart-line"></i></div><span>Live Mandi Bhav (APMC Rates)</span></div>
                <span class="drawer-tag-pill" style="background:#ef4444;color:#fff;">LIVE 🔴</span>
              </a>
              <a href="/weather.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-cloud-sun"></i></div><span>7-Day Weather Forecast</span></div>
              </a>
              <a href="/krishi-panchang.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-om"></i></div><span>Krishi Panchang (Farming Calendar)</span></div>
              </a>
              <a href="/crop-doctor.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-stethoscope"></i></div><span>Crop Doctor AI Diagnostic</span></div>
              </a>
              <a href="/aarogyam-sakhi.html" onclick="window.closeUniversalDrawer();" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box" style="background:#15803d;color:#fff;"><i class="fa-solid fa-robot"></i></div><span>Aarogyam Sakhi Consultation</span></div>
                <span class="drawer-tag-pill" style="background:#22c55e;color:#0f172a;font-weight:900;">AI 🔬</span>
              </a>
              <a href="/webinar.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-video"></i></div><span>Weekly Live Farmer Webinar</span></div>
              </a>
              <a href="javascript:void(0)" onclick="window.location.href=window.getPersonalizedWhatsAppUrl('24x7 AI Expert Consultation'); window.closeUniversalDrawer();" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-brands fa-whatsapp"></i></div><span>WhatsApp Kisan AI Assistant</span></div>
              </a>
            </div>

            <!-- 8. MY TEAM (Digital Diary & CRM - Inner Ledger Preserved) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-team" onclick="window.toggleDrawerAccordion('team', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#ffe4e6;color:#e11d48;"><i class="fa-solid fa-users-gear"></i></div>
                <span class="drawer-item-title">My Team</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-team">
              <a href="/pages/myteam.html" class="drawer-sub-link-item ${currentPath.endsWith('myteam.html') ? 'active-pill' : ''}">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box" style="background:#dcfce7;color:#16a34a;"><i class="fa-solid fa-pen-to-square"></i></div><span>Team Entry (सरल किसान व टीम एंट्री)</span></div>
              </a>
              <a href="/pages/myteam-bahikhata.html" class="drawer-sub-link-item ${currentPath.includes('bahikhata') ? 'active-pill' : ''}">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box" style="background:#ffe4e6;color:#e11d48;"><i class="fa-solid fa-book-journal-whills"></i></div><span>आरोग्यम बहीखाता (उधारी व जमा खाता)</span></div>
              </a>
              <a href="/pages/myteam-followup.html" class="drawer-sub-link-item ${currentPath.includes('followup') ? 'active-pill' : ''}">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box" style="background:#e0f2fe;color:#0284c7;"><i class="fa-brands fa-whatsapp"></i></div><span>1-Tap WhatsApp फॉलो-अप</span></div>
              </a>
              <a href="/pages/myteam-todo.html" class="drawer-sub-link-item ${currentPath.includes('todo') ? 'active-pill' : ''}">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box" style="background:#fef3c7;color:#d97706;"><i class="fa-solid fa-list-check"></i></div><span>To-Do कार्य-डायरी</span></div>
              </a>
              <a href="/pages/myteam-dairy.html" class="drawer-sub-link-item ${currentPath.includes('dairy') ? 'active-pill' : ''}">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box" style="background:#f3e8ff;color:#9333ea;"><i class="fa-solid fa-arrows-rotate"></i></div><span>ऑटोशिप व डेली डायरी</span></div>
              </a>
            </div>

            <!-- 9. AAROGYAM TUBE (Direct Button with Real Official Logo) -->
            <a href="/tube.html" class="drawer-nav-item-btn ${currentPath.includes('tube') ? 'active-pill' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#fee2e2;display:flex;align-items:center;justify-content:center;">
                  <img src="/images/logo/aarogyamtube-logo.png" alt="Tube" style="width:26px;height:26px;object-fit:contain;display:block;">
                </div>
                <span class="drawer-item-title">Aarogyam Tube</span>
              </div>
            </a>

            <!-- 10. WEBSITE TOUR GUIDE (Hero Direct Button in Main Menu) -->
            <a href="javascript:void(0)" onclick="if(window.triggerWebsiteTour){window.triggerWebsiteTour(true);}else if(window.startUniversalWalkthrough){window.startUniversalWalkthrough(true);} window.closeUniversalDrawer();" class="drawer-nav-item-btn" style="background:#f0fdf4 !important; border-color:#86efac !important;">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#16a34a;color:#ffffff;"><i class="fa-solid fa-compass"></i></div>
                <span class="drawer-item-title" style="color:#15803d;font-weight:900;">Website Tour Guide</span>
              </div>
              <span class="drawer-tag-pill" style="background:#16a34a;color:#fff;font-weight:900;">TOUR 🧭</span>
            </a>

            <!-- 11. SUPPORT & LEGAL POLICIES (Accordion) -->
            <button type="button" class="drawer-nav-item-btn" id="drawer-btn-support" onclick="window.toggleDrawerAccordion('support', event)">
              <div class="drawer-item-left">
                <div class="drawer-icon-box" style="background:#f1f5f9;color:#475569;"><i class="fa-solid fa-headset"></i></div>
                <span class="drawer-item-title">Support & Legal Policies</span>
              </div>
              <i class="fa-solid fa-chevron-down drawer-accordion-arrow"></i>
            </button>
            <div class="drawer-submenu-panel" id="drawer-panel-support">
              <a href="/contact.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-phone-volume"></i></div><span>Contact Support</span></div>
              </a>
              <a href="/faq.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-circle-question"></i></div><span>Frequently Asked Questions (FAQ)</span></div>
              </a>
              <a href="/terms.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-file-contract"></i></div><span>Terms & Conditions</span></div>
              </a>
              <a href="/privacy-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-shield-halved"></i></div><span>Privacy Policy</span></div>
              </a>
              <a href="/shipping-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-truck"></i></div><span>Shipping & Delivery Policy</span></div>
              </a>
              <a href="/refund-policy.html" class="drawer-sub-link-item">
                <div class="drawer-item-left"><div class="drawer-sub-icon-box"><i class="fa-solid fa-rotate-left"></i></div><span>Cancellation & Refund Policy</span></div>
              </a>
            </div>

          </div>
        </div>
      </div>

      <!-- Sticky Floating Actions: Right Docked Bar (Sequence: Gift -> Tube -> Sound -> Share -> Install) -->
      ${isBookLanding ? '' : `
      <div class="universal-sticky-dock-bar" id="universal-sticky-dock-bar">
        <!-- 1. Gift Promo Button -->
        <button type="button" onclick="if(window.AarogyamPromotionGateway?.openModal){window.AarogyamPromotionGateway.openModal();}else if(window.openGiftPromoModal){window.openGiftPromoModal();}" class="dock-pill-btn dock-gift-btn" id="universal-sticky-gift-btn" title="उपहार / पॉइंट्स कमाएँ" aria-label="Gift Promo">
          <span style="font-size:1.35rem;line-height:1;display:block;">🎁</span>
        </button>

        <!-- 2. Aarogyam Tube Button (Real Official Icon) -->
        <a href="/tube.html" class="dock-pill-btn dock-tube-btn" id="universal-sticky-tube-btn" title="Aarogyam Tube" aria-label="Aarogyam Tube">
          <img src="/images/logo/aarogyamtube-logo.png" alt="AarogyamTube" style="width:26px;height:26px;object-fit:contain;display:block;">
        </a>

        <!-- 3. Audio Greeting Button -->
        <button type="button" onclick="window.handleUniversalStickyAudioToggle?.(event)" class="dock-pill-btn dock-audio-btn" id="universal-sticky-audio-btn" title="Page Audio Listen / Mute" aria-label="Audio">
          <i class="fa-solid fa-volume-high"></i>
        </button>

        <!-- 4. Share Referral Button -->
        <button type="button" onclick="if(window.triggerUniversalPageShare){window.triggerUniversalPageShare();}else if(window.triggerUniversalShare){window.triggerUniversalShare();}else{window.triggerViralPageShare();}" class="dock-pill-btn dock-share-btn" id="universal-sticky-share-btn" title="Share & Earn Points" aria-label="Share">
          <i class="fa-solid fa-share-nodes"></i>
        </button>

        <!-- 5. Install App Button -->
        <button type="button" onclick="window.triggerPwaInstall()" class="dock-pill-btn dock-pwa-btn" id="universal-sticky-pwa-install-btn" title="Install Aarogyam App (1MB)" aria-label="Install App" style="${isInstalled ? 'display:none !important;' : 'display:flex;'}">
          <i class="fa-solid fa-mobile-screen-button"></i>
        </button>
      </div>
      `}

      ${isBookLanding ? '' : `
      <!-- Universal Sticky Mobile Bottom 7-Tab Navigation Bar -->
      <!-- Sequence: HOME -> PROFILE -> LIBRARY -> MY TEAM -> TUBE -> HEALTH -> NETSURF -->
      <nav class="universal-mobile-bottom-nav" id="universal-mobile-bottom-nav">
        <!-- 1. Home -->
        <a href="/index.html" class="u-nav-tab ${(currentPath === '/' || currentPath.endsWith('index.html')) && !currentPath.includes('ucas') && !currentPath.includes('smart-etailer') && !currentPath.includes('tube') && !currentPath.includes('netsurf') && !currentPath.includes('health') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-house"></i></div>
          <span>Home</span>
        </a>
        <!-- 2. Profile -->
        <a href="/ucas/index.html" class="u-nav-tab ${(currentPath.includes('ucas') || currentPath.includes('profile')) && !currentPath.includes('smart-etailer') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-user" style="color:#7c3aed;"></i></div>
          <span>Profile</span>
        </a>
        <!-- 3. Library -->
        <a href="/ebooks/my-library.html" class="u-nav-tab ${currentPath.includes('my-library') || (currentPath.includes('ebook') && !currentPath.includes('smart-etailer')) ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-book-bookmark" style="color:#d97706;"></i></div>
          <span>Library</span>
        </a>
        <!-- 4. My Team (कार्य डायरी व बहीखाता) -->
        <a href="/pages/myteam.html" class="u-nav-tab ${currentPath.includes('myteam') || currentPath.includes('smart-etailer') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-users-gear" style="color:#e11d48;"></i></div>
          <span style="color:#e11d48;font-weight:900;">My Team</span>
        </a>
        <!-- 5. Tube -->
        <a href="/tube.html" class="u-nav-tab ${currentPath.includes('tube') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-brands fa-youtube" style="color:#ef4444;"></i></div>
          <span style="color:#ef4444;font-weight:800;">Tube</span>
        </a>
        <!-- 6. Health -->
        <a href="/categories/health.html" class="u-nav-tab ${currentPath.includes('health') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-heart-pulse" style="color:#059669;"></i></div>
          <span style="color:#059669;font-weight:800;">Health</span>
        </a>
        <!-- 7. Netsurf -->
        <a href="/categories/netsurf.html" class="u-nav-tab ${currentPath.includes('netsurf') ? 'active' : ''}">
          <div class="u-icon-wrap"><i class="fa-solid fa-briefcase" style="color:#2563eb;"></i></div>
          <span style="color:#2563eb;font-weight:800;">Netsurf</span>
        </a>
      </nav>
      `}
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
    if (isBookLanding) {
      const bottomNav = document.getElementById('universal-mobile-bottom-nav');
      if (bottomNav) bottomNav.remove();
    }
    bindDrawerTriggers();
    checkPwaInstallState();
  }

  function bindDrawerTriggers() {
    const triggers = document.querySelectorAll('.menu-button, #btn-drawer-toggle, [data-drawer-toggle], .header-menu-btn, .navbar-toggler, #mobile-menu-btn, .menu-btn, #menuBtn');
    triggers.forEach(btn => {
      if (btn.dataset.drawerBound) return;
      btn.dataset.drawerBound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openUniversalDrawer(e);
      });
    });

    const backdrop = document.getElementById('universal-drawer-backdrop');
    if (backdrop && !backdrop.dataset.bound) {
      backdrop.dataset.bound = 'true';
      backdrop.addEventListener('click', window.closeUniversalDrawer);
    }
  }

  window.openUniversalDrawer = function (e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (window.USER_NOTIFICATIONS && typeof window.USER_NOTIFICATIONS.updateBadgeCount === 'function') {
      window.USER_NOTIFICATIONS.updateBadgeCount();
    }
    if (typeof window.updateDrawerNotificationStatus === 'function') {
      window.updateDrawerNotificationStatus();
    }
    const backdrop = document.getElementById('universal-drawer-backdrop');
    const card = document.getElementById('universal-drawer-card');
    if (backdrop) backdrop.classList.add('open');
    if (card) card.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  window.closeUniversalDrawer = function (e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const backdrop = document.getElementById('universal-drawer-backdrop');
    const card = document.getElementById('universal-drawer-card');
    if (backdrop) backdrop.classList.remove('open');
    if (card) card.classList.remove('open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeUniversalDrawer();
    }
  });

  // Alias for backward compatibility if invoked from bottom scripts
  if (typeof window.logoutUniversalUser !== 'function') {
    window.logoutUniversalUser = function () {
      if (typeof purgeAllStoredUserData === 'function') purgeAllStoredUserData();
      alert('आप सफलतापूर्वक लॉगआउट हो चुके हैं। (Logged out successfully)');
      window.location.reload();
    };
  }

  function showDrawerToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${type === 'success' ? '#16a34a' : '#1e293b'};color:#fff;padding:10px 18px;border-radius:25px;font-weight:700;font-size:0.85rem;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:9999999;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }

  // Universal Auto-Loader & Direct FAB Injector for Aarogyam Sakhi AI Omni-Domain Engine
  function injectSakhiPillDirectly() {
    if (document.getElementById('sakhiFloatingPill')) return;
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('aarogyam-sakhi.html') || path.includes('tube') || isBookLandingPage()) return;

    let pillLabel = 'आरोग्यम सखी AI';
    if (path.includes('hair') || path.includes('skin') || path.includes('beauty')) {
      pillLabel = 'सौंदर्य सखी AI';
    } else if (path.includes('pashu') || path.includes('dairy')) {
      pillLabel = 'पशु सखी AI';
    } else if (path.includes('health') || path.includes('diabetes') || path.includes('joint') || path.includes('thyroid')) {
      pillLabel = 'स्वास्थ्य सखी AI';
    } else if (path.includes('netsurf') || path.includes('pathfinder')) {
      pillLabel = 'बिज़नेस सखी AI';
    }

    const pill = document.createElement('div');
    pill.id = 'sakhiFloatingPill';
    pill.className = 'sakhi-floating-pill';
    pill.setAttribute('role', 'button');
    pill.setAttribute('aria-label', pillLabel);
    pill.innerHTML = `
      <div class="sakhi-pill-avatar-wrap">
        <img src="/images/sakhi/aarogyam-sakhi.webp" alt="Aarogyam Sakhi" onerror="this.src='/images/logo/fevicon.png'" />
      </div>
      <span class="sakhi-pill-label">${pillLabel}</span>
      <span class="sakhi-pill-live-dot"></span>
    `;

    pill.onclick = function (e) {
      if (e) e.preventDefault();
      window.location.href = '/aarogyam-sakhi.html';
    };
    pill.style.position = 'fixed';
    pill.style.setProperty('top', '88px', 'important');
    pill.style.setProperty('left', '14px', 'important');
    pill.style.setProperty('bottom', 'auto', 'important');
    pill.style.setProperty('right', 'auto', 'important');
    pill.style.setProperty('z-index', '999999', 'important');
    if (window.innerWidth <= 768) {
      pill.style.setProperty('top', '84px', 'important');
      pill.style.setProperty('left', '12px', 'important');
    }

    if (document.body) {
      document.body.appendChild(pill);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(pill));
    }

    // 5-SECOND SMART AUTO-COLLAPSE (CUT TEXT, KEEP AVATAR COIN)
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

  function ensureAarogyamSakhiLoaded() {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('aarogyam-sakhi.html') || path.includes('tube') || isBookLandingPage()) return;

    if (!document.querySelector('link[href*="aarogyam-sakhi-ai.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/css/aarogyam-sakhi-ai.css?v=20261029_v15';
      document.head.appendChild(link);
    }

    const loadSakhiScript = () => {
      if (!window.AarogyamSakhi && !document.querySelector('script[src*="aarogyam-sakhi-ai.js"]')) {
        const script = document.createElement('script');
        script.src = '/js/aarogyam-sakhi-ai.js?v=20261019_v330';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadSakhiScript, { timeout: 4000 });
    } else {
      setTimeout(loadSakhiScript, 2500);
    }
  }

  function purgeBookLandingDrawerNav() {
    if (isBookLandingPage()) {
      if (document.body) {
        document.body.classList.add('book-landing-page');
        document.body.dataset.pageType = 'book-landing';
      }
      const bNav = document.getElementById('universal-mobile-bottom-nav');
      if (bNav) bNav.remove();
      const fWidget = document.getElementById('universal-sticky-float-widget');
      if (fWidget) fWidget.remove();
      const dockBar = document.getElementById('universal-sticky-dock-bar');
      if (dockBar) dockBar.remove();
    }
  }

  function initUniversalDrawerAndSakhi() {
    purgeBookLandingDrawerNav();
    injectUniversalSideDrawer();
    purgeBookLandingDrawerNav();
    checkPwaInstallState();
    const path = (window.location.pathname || '').toLowerCase();
    if (!path.includes('tube') && !path.includes('aarogyam-sakhi.html') && !isBookLandingPage()) {
      ensureAarogyamSakhiLoaded();
      injectSakhiPillDirectly();
    }
    if (!isBookLandingPage() && !document.querySelector('script[src*="universal-walkthrough-tour.js"]')) {
      const tourScript = document.createElement('script');
      tourScript.src = '/js/universal-walkthrough-tour.js?v=20261121_v1';
      tourScript.async = true;
      document.body.appendChild(tourScript);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalDrawerAndSakhi);
  } else {
    initUniversalDrawerAndSakhi();
    resetDockIdleTimer();
  }
  window.addEventListener('load', () => {
    purgeBookLandingDrawerNav();
    checkPwaInstallState();
    const path = (window.location.pathname || '').toLowerCase();
    if (!path.includes('tube') && !path.includes('aarogyam-sakhi.html') && !isBookLandingPage()) {
      injectSakhiPillDirectly();
    }
  });
})();


// Universal Sticky Audio Toggle & Auto-Loader Helper
window.handleUniversalStickyAudioToggle = function (e) {
  if (e) {
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }

  // If on My Library page, delegate to the sub-header library guide
  if (window.location.pathname.includes('my-library')) {
    if (typeof window.toggleLibraryAudioGuide === 'function') {
      window.toggleLibraryAudioGuide(e);
      return;
    }
  }

  // If audio greeting engine is already loaded, toggle it directly
  if (typeof window.togglePageAudioGreeting === 'function') {
    window.togglePageAudioGreeting(e);
    return;
  }

  // Otherwise, load audio-greeting-engine dynamically on demand
  const btn = document.getElementById('universal-sticky-audio-btn');
  if (btn) {
    btn.classList.add('playing');
    const icon = btn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-spinner fa-spin';
  }

  const s = document.createElement('script');
  s.src = '/js/audio-greeting-engine.js?v=' + Date.now();
  s.onload = function () {
    if (typeof window.togglePageAudioGreeting === 'function') {
      window.togglePageAudioGreeting(e);
    }
  };
  s.onerror = function () {
    if (btn) {
      btn.classList.remove('playing');
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-volume-high';
    }
  };
  document.head.appendChild(s);
};

// Universal Website Walkthrough Tour Trigger
window.triggerWebsiteTour = function (forceRestart) {
  if (typeof window.startUniversalWalkthrough === 'function') {
    window.startUniversalWalkthrough(forceRestart);
  } else {
    const s = document.createElement('script');
    s.src = '/js/universal-walkthrough-tour.js?v=' + Date.now();
    s.onload = function () {
      if (typeof window.startUniversalWalkthrough === 'function') {
        window.startUniversalWalkthrough(forceRestart);
      }
    };
    document.head.appendChild(s);
  }
};


// Floating Side Dock Opacity: 40% resting, 100% on direct interaction / click
let dockIdleTimeout = null;
function activateDockFullOpacity() {
  const dock = document.getElementById('universal-sticky-dock-bar');
  if (!dock) return;
  dock.classList.add('dock-active-focus');
  clearTimeout(dockIdleTimeout);
  dockIdleTimeout = setTimeout(() => {
    dock.classList.remove('dock-active-focus');
  }, 6000);
}

document.addEventListener('DOMContentLoaded', () => {
  const dock = document.getElementById('universal-sticky-dock-bar');
  if (dock) {
    dock.addEventListener('mouseenter', activateDockFullOpacity);
    dock.addEventListener('touchstart', activateDockFullOpacity, { passive: true });
    dock.addEventListener('click', activateDockFullOpacity);
  }
});
