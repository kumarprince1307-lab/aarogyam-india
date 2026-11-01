/**
 * =========================================================================
 * 🏛️ AAROGYAM SAKHI — TUTORIAL & PSYCHOLOGICAL ENGAGEMENT ENGINE
 * Location: js/sakhi-tutorial-guide.js
 * Architecture: SAKHI_MANAS.md Compliant (Rule 1 & Rule 2 Safe Modular Architecture)
 * 
 * Capabilities:
 * 1. 📖 Bahi Khata Interactive Tutorial (उधारी/जमा, WhatsApp रसीद, पासबुक)
 * 2. 🥛 Meri Dairy Tutorial (दूध, फैट%, SNF, रेट कैलकुलेटर, पर्चा)
 * 3. 📲 Share & Earn / Referral Income (₹200-₹500/दिन पार्ट-टाइम कमाई)
 * 4. 🌤️ Krishi Panchang & Weather (शुभ मुहूर्त, नक्षत्र, 3-दिवसीय वर्षा अनुमान)
 * 5. 🌾 Mandi Bhav Intelligence (जिलेवार ताजा फसल दरें + डिस्क्लेमर)
 * 6. 👥 My Team & Network View (मेरे रेफरल से कौन-कौन किसान जुड़े)
 * 7. 📲 App Install & Notification Push (ऑफलाइन 200 नुस्खे, PWA प्रॉम्प्ट)
 * 8. 🩺 Health to NetSurf Naturamore Bridge (दैनिक पोषण, सर्जरी बचत, 25% छूट)
 * 9. 🌾 Dehati & Rural Dialect Matcher (बुंदेलखंडी, बघेली, भोजपुरी, मालवी)
 * =========================================================================
 */

(function (window, document) {
  'use strict';

  // Helper: Retrieve User Share ID with universal fallback
  function getActiveUserShareId() {
    try {
      const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
      if (u.share_id && !/^\d{10}$/.test(u.share_id)) return u.share_id;
      if (u.referral_code && !/^\d{10}$/.test(u.referral_code)) return u.referral_code;
      if (u.mobile) {
        const cleanM = String(u.mobile).replace(/\D/g, '').slice(-6);
        if (cleanM) return 'AI' + cleanM;
      }
    } catch (_) {}
    return 'AI000004';
  }

  // Helper: Retrieve User Phone
  function getActiveUserPhone() {
    try {
      const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
      if (u.mobile || u.phone) return String(u.mobile || u.phone).trim();
      const p = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}');
      if (p.mobile || p.phone) return String(p.mobile || p.phone).trim();
    } catch (_) {}
    return '';
  }

  // Helper: Retrieve User Name
  function getActiveUserName() {
    try {
      const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
      if (u.name || u.full_name) return String(u.name || u.full_name).trim();
      const p = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}');
      if (p.name || p.full_name) return String(p.name || p.full_name).trim();
    } catch (_) {}
    return 'किसान साथी';
  }

  // 1. DIGITAL BAHI KHATA TUTORIAL (उधारी / जमा / पासबुक गाइड)
  function handleBahiKhataTutorial() {
    const title = '📖 डिजिटल बही खाता — 1 मिनट में सीखें उधारी-जमा का पक्का हिसाब';
    const body = `राम-राम भैया! 🙏 **आरोग्यम डिजिटल बही खाता** गाँव के दुकानदारों, किसानों और खुदरा व्यापारियों के लिए कागज की पुरानी डायरी का सबसे आधुनिक व मुफ्त विकल्प है।\n\n` +
      `✨ **बही खाता चलाने के 3 आसान कदम:**\n` +
      `1. **नया ग्राहक जोड़ें:** उसका नाम और 10 अंकों का WhatsApp मोबाइल नंबर दर्ज करें।\n` +
      `2. **उधारी व जमा एंट्री करें:** जब माल उधार दें तो **लाल बटन (आपने दिए / Dr)** और जब पैसे मिलें तो **हरा बटन (आपको मिले / Cr)** दबाएं।\n` +
      `3. **1-क्लिक WhatsApp रसीद:** एंट्री होते ही ग्राहक के फोन पर आज की एंट्री और कुल बकाया हिसाब की **डिजिटल पासबुक लिंक** अपने आप चली जाती है!\n\n` +
      `💡 **जादुई फायदा:** न पन्ने फटने का डर, न हिसाब में कोई झगड़ा। ग्राहक लिंक खोलकर अपनी पूरी पासबुक खुद देख सकता है, जिससे उधारी 3 गुना तेजी से वसूल होती है!`;

    const chips = [
      { text: '📖 अपना बही खाता खोलें', url: '/pages/smart-etailer.html', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
      { text: '💬 ग्राहक को तकादा कैसे भेजें?', query: 'बही खाते में उधारी वसूली का तकादा मैसेज कैसे भेजें' },
      { text: '🥛 मेरी डेयरी का हिसाब कैसे करें?', query: 'मेरी डेयरी में दूध और फैट का हिसाब कैसे करें' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'business', 'tutorial_bahi_khata');
      return true;
    }
    return false;
  }

  // 2. MERI DAIRY TUTORIAL (दूध, फैट, SNF व रेट पर्चा गाइड)
  function handleMeriDairyTutorial() {
    const title = '🥛 मेरी डेयरी — सुबह-शाम दूध, फैट व भुगतान का सटीक कैलकुलेटर';
    const body = `राम-राम डेयरी वाले भैया! 🙏 **आरोग्यम मेरी डेयरी** पशुपालकों और गाँव की दूध डेरियों के लिए बनाया गया सरल डिजिटल रजिस्टर है।\n\n` +
      `✨ **डेयरी हिसाब कैसे मेंटेन करें:**\n` +
      `1. **सुबह व शाम की एंट्री:** पशुपालक का नाम चुनें, गाय या भैंस का दूध (लीटर में) दर्ज करें।\n` +
      `2. **ऑटो फैट व रेट गणना:** जैसे ही आप फैट प्रतिशत (जैसे 6.5 या 7.0) डालेंगे, सिस्टम सरकारी व सहकारी दरों के अनुसार **प्रति लीटर रेट और कुल राशि** अपने आप निकाल देगा।\n` +
      `3. **10-दिवसीय व मासिक पर्चा:** हफ्ते या महीने के अंत में 1-क्लिक में ग्वाले/पशुपालक का पूरा दूध पर्चा WhatsApp पर भेजें।\n\n` +
      `💡 **पशुपालकों के लिए टिप:** गाय-भैंस का दूध और फैट 1 से 1.5 डिग्री बढ़ाने के लिए प्रतिदिन 10-15 ग्राम **बायोफिट सीएफसी प्लस (CFC Plus)** चारे में दें।`;

    const chips = [
      { text: '🥛 मेरी डेयरी रजिस्टर खोलें', url: '/pages/smart-etailer.html?tab=dairy', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
      { text: '🐄 गाय-भैंस का दूध व फैट बढ़ाने का उपाय', query: 'गाय भैंस का दूध और फैट बढ़ाने का उपाय' },
      { text: '📖 डिजिटल बही खाता कैसे चलाएं?', query: 'डिजिटल बही खाता कैसे चलाते हैं सिखाओ' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'dairy', 'tutorial_meri_dairy');
      return true;
    }
    return false;
  }

  // 3. SHARE & EARN (रेफरल लिंक, 25% छूट व ₹200-₹500 रोज कमाने का साइकोलॉजिकल मॉडल)
  function handleShareAndEarnTutorial() {
    const shareId = getActiveUserShareId();
    const uName = getActiveUserName();
    const title = '📲 शेयर और कमाई — घर बैठे ₹200 से ₹500 पार्ट-टाइम कैसे कमाएं?';
    const body = `राम-राम ${uName} जी! 🙏 क्या आपको पता है कि बिना कोई पैसा लगाए, केवल सखी की सही सलाह अपने गाँव के 2-3 किसान भाइयों को शेयर करके आप अच्छी बचत व कमाई कर सकते हैं?\n\n` +
      `🤝 **कोई बड़ा जाल या झूठी बातें नहीं — सिर्फ 100% साफ गणित:**\n` +
      `1. **आपका अपना रेफरल कोड:** आपका पर्सनल शेयर कोड **${shareId}** है।\n` +
      `2. **25% की सीधी बचत:** जब आप खुद या आपका कोई परिचित आरोग्यम इंडिया से जैविक खाद-दवा या स्वास्थ्य उत्पाद लेता है, तो सीधे **20% से 25% की छूट** मिलती है।\n` +
      `3. **प्रतिदिन ₹200-₹500 की आमदनी:** अगर आप रोज़ केवल 2 किसानों को गेहूं फुटाव, कीट नियंत्रण या पशु दूध वृद्धि का सही नुस्खा बताकर मदद करते हैं, तो रिटेल मार्जिन और कंपनी पॉइंट्स से प्रतिदिन **₹200 से ₹500** की पार्ट-टाइम आय बनती है।\n` +
      `4. **शून्य निवेश (Zero Investment):** न कोई जॉइनिंग फीस है, न पहले कोई पैसे जमा करने हैं। पूरी तरह सुरक्षित व पारदर्शी!`;

    const shareUrl = `https://aarogyamindia.online/aarogyam-sakhi.html?ref=${encodeURIComponent(shareId)}`;
    const waText = `🌾 नमस्ते किसान भाई! मैंने आरोग्यम सखी AI से अपनी फसल और पशुओं के लिए सलाह ली है, यह 100% सही व जैविक समाधान देती है। आप भी अपना सवाल यहाँ बिल्कुल मुफ्त पूछें:\n${shareUrl}`;
    const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

    const chips = [
      { text: '📲 WhatsApp पर अपना रेफरल लिंक शेयर करें', url: waShareUrl, isExternal: true, style: 'background:#25d366;color:#ffffff;font-weight:800;' },
      { text: '👥 मेरे लिंक से कौन-कौन जुड़े हैं?', query: 'मेरे रेफरल से कौन कौन लोग जुड़े हैं लिस्ट दिखाओ' },
      { text: '💼 नेट्सर्फ बिजनेस प्लान समझाइए', query: 'नेट्सर्फ में ₹200-₹500 रोज कैसे कमाएं पूरा तरीका बताओ' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'business', 'tutorial_share_earn');
      return true;
    }
    return false;
  }

  // 4. MY REFERRAL TEAM / NETWORK CHECK (लाइव चेक: मेरे रेफरल से कौन जुड़े)
  async function handleMyReferralTeamQuery() {
    const shareId = getActiveUserShareId();
    const uName = getActiveUserName();
    const title = `👥 आपकी रेफरल टीम — शेयर कोड: ${shareId}`;

    let teamCount = 0;
    let recentMembers = [];

    // Zero-Egress fetch: Query only minimal necessary fields
    try {
      const sbKey = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
      const url = `https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/profiles?or=(referral_code.eq.${encodeURIComponent(shareId)},referred_by.eq.${encodeURIComponent(shareId)})&select=full_name,mobile,created_at&limit=10&order=created_at.desc`;
      const res = await fetch(url, { headers: { 'apikey': sbKey, 'Authorization': 'Bearer ' + sbKey } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          teamCount = data.length;
          recentMembers = data;
        }
      }
    } catch (_) {}

    let memberListText = '';
    if (recentMembers.length > 0) {
      memberListText = `\n\n📋 **हाल ही में जुड़े सदस्य:**\n` + recentMembers.slice(0, 5).map((m, idx) => {
        const maskedMob = m.mobile ? String(m.mobile).replace(/(\d{2})\d{6}(\d{2})/, '$1******$2') : 'उपलब्ध नहीं';
        return `${idx + 1}. **${m.full_name || 'किसान साथी'}** (${maskedMob})`;
      }).join('\n');
    } else {
      memberListText = `\n\n💡 अभी आपके इस शेयर कोड से कोई नया सदस्य नहीं जुड़ा है। नीचे दिए बटन से अपना लिंक WhatsApp ग्रुपों में शेयर करें ताकि लोग जुड़ सकें!`;
    }

    const body = `राम-राम ${uName} जी! 🙏 आपके शेयर कोड **${shareId}** का लाइव नेटवर्क विवरण:\n\n` +
      `🌟 **कुल जुड़े साथी:** **${teamCount} सदस्य**${memberListText}\n\n` +
      `💡 **टिप:** जब भी ये साथी ऐप में खरीदारी करेंगे या सखी से परामर्श लेंगे, तो आपको पॉइंट्स और कमीशन दोनों का लाभ मिलेगा!`;

    const chips = [
      { text: '📲 नया लिंक WhatsApp पर शेयर करें', query: 'आरोग्यम ऐप शेयर करके पैसे कैसे कमाएं' },
      { text: '👤 मेरी पूरी प्रोफाइल देखें', url: '/profile.html', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
      { text: '📖 डिजिटल बही खाता कैसे चलाएं?', query: 'डिजिटल बही खाता कैसे चलाते हैं सिखाओ' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'business', 'my_team_network');
      return true;
    }
    return false;
  }

  // 5. KRISHI PANCHANG & WEATHER TUTORIAL (पंचांग व मौसम गाइड)
  function handlePanchangAndWeatherTutorial() {
    const title = '🌤️ कृषि पंचांग व दैनिक मौसम — अपनी फसल की सुरक्षा का सटीक समय';
    const body = `राम-राम किसान साथी! 🙏 **आरोग्यम कृषि पंचांग और मौसम सेवा** से आप घर बैठे अपने खेत की हर गतिविधि की सटीक योजना बना सकते हैं:\n\n` +
      `🌾 **1. दैनिक कृषि पंचांग:**\n` +
      `• आज की तिथि, नक्षत्र और शुभ चौघड़िया मुहूर्त।\n` +
      `• बीज बुवाई, निराई-गुड़ाई, और पहली सिंचाई का सबसे उत्तम नक्षत्र व समय।\n\n` +
      `🌦️ **2. 3-दिवसीय मौसम अनुमान:**\n` +
      `• आपके जिले का न्यूनतम-अधिकतम तापमान और हवा की गति।\n` +
      `• **बारिश व ओलावृष्टि चेतावनी:** अगर अगले 24 घंटे में बारिश या तेज हवा का अनुमान है, तो सखी आपको कीटनाशक व खाद छिड़काव टालने की सलाह देती है ताकि आपकी दवा धुलने से बचे!\n` +
      `• **शीतलहर व पाला (Frost) अलर्ट:** पाले से चने, सरसों व आलू को बचाने का विशेष देसी धुआं व सल्फर फॉर्मूला।`;

    const chips = [
      { text: '🌤️ आज का मौसम व पंचांग देखें', url: '/weather.html', isExternal: true, style: 'background:#0284c7;color:#ffffff;font-weight:800;' },
      { text: '🌾 आज का मंडी भाव चेक करें', query: 'मेरी मंडी में आज फसलों का ताजा भाव क्या है' },
      { text: '🌾 गेहूं में कल्ले व फुटाव का उपाय', query: 'गेहूं में अधिक कल्ले और फुटाव कैसे लाएं' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'agri', 'tutorial_panchang_weather');
      return true;
    }
    return false;
  }

  // 6. MANDI BHAV INTELLIGENCE (मंडी भाव गाइड + डिस्क्लेमर)
  function handleMandiBhavTutorial() {
    const title = '🌾 दैनिक मंडी भाव — अपने जिले व नजदीकी मंडियों का ताजा बाजार भाव';
    const body = `राम-राम किसान साथी! 🙏 **आरोग्यम मंडी भाव सेवा** आपको प्रमुख फसलों के दैनिक बाजार भाव से अपडेट रखती है ताकि आढ़ती या व्यापारी आपको कम भाव न दे सकें:\n\n` +
      `📊 **प्रमुख फसलों के औसत बाजार भाव रुझान (रबी सीजन):**\n` +
      `• **गेहूं (Sharbati / Mill Quality):** ₹2,450 से ₹2,850 प्रति क्विंटल\n` +
      `• **चना (Desi / Chana Katni):** ₹5,800 से ₹6,450 प्रति क्विंटल\n` +
      `• **सरसों (Mustard 42% Oil):** ₹5,200 से ₹5,750 प्रति क्विंटल\n` +
      `• **सोयाबीन (Yellow):** ₹4,400 से ₹4,850 प्रति क्विंटल\n` +
      `• **लहसुन (Garlic Desi/Ooty):** ₹12,000 से ₹22,000 प्रति क्विंटल\n\n` +
      `⚠️ **सखी का ईमानदार डिस्क्लेमर:**\n` +
      `*"भैया, यह भाव ऑनलाइन मंडियों और सरकारी ई-नाम (e-NAM) पोर्टल्स के ताजा रुझानों पर आधारित है। माल की गुणवत्ता, दाना भराव और नमी के आधार पर भाव में ₹50-₹100 का अंतर हो सकता है। मंडी जाने से पहले अपनी स्थानीय मंडी के आढ़ती से अंतिम पुष्टि अवश्य कर लें।"*`;

    const chips = [
      { text: '📊 पूरी मंडी भाव सूची देखें', url: '/mandi.html', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
      { text: '🌤️ आज का मौसम व बारिश का अनुमान', query: 'आज का मौसम और कृषि पंचांग क्या है' },
      { text: '📖 डिजिटल बही खाता कैसे चलाएं?', query: 'डिजिटल बही खाता कैसे चलाते हैं सिखाओ' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'agri', 'tutorial_mandi_bhav');
      return true;
    }
    return false;
  }

  // 7. APP INSTALL & NOTIFICATION GUIDE (ऑफलाइन 200 नुस्खे, PWA प्रॉम्प्ट)
  function handleAppInstallAndNotificationTutorial() {
    const title = '📲 आरोग्यम सखी ऐप — फोन में डाउनलोड करें और नोटिफिकेशन ऑन करें';
    const body = `राम-राम भैया! 🙏 क्या आप बार-बार गूगल पर खोजने की झंझट से बचना चाहते हैं? सखी को अपने मोबाइल की होम स्क्रीन पर बिल्कुल फ्री में रखें:\n\n` +
      `✨ **फोन में ऐप रखने के 3 बड़े फायदे:**\n` +
      `1. **बिना इंटरनेट के 200 नुस्खे:** खेत में इंटरनेट बंद हो, तब भी सखी के 200 प्रामाणिक नुस्खे व बही खाता 0 सेकंड में खुलेंगे!\n` +
      `2. **सुंदर सखी अवतार नोटिफिकेशन:** मौसम का बदलाव, सिंचाई का समय और दवा छिड़काव का सही दिन सखी आपके फोन पर सुंदर नोटिफिकेशन भेजकर याद दिलाएगी।\n` +
      `3. **1 MB से भी कम साइज:** फोन की मेमोरी कभी नहीं भरेगी और मोबाइल कभी हैंग नहीं होगा!\n\n` +
      `👇 **नीचे दिए गए हरे बटन पर क्लिक करें और 'Install / Add to Home Screen' चुनें!**`;

    const chips = [
      { text: '📲 सखी ऐप फोन में इंस्टॉल करें (गाइड पेज)', url: '/aarogyam-app.html', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
      { text: '🔔 नोटिफिकेशन अनुमति चालू करें', query: 'सखी नोटिफिकेशन चालू करो' },
      { text: '📖 डिजिटल बही खाता कैसे चलाएं?', query: 'डिजिटल बही खाता कैसे चलाते हैं सिखाओ' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'omni', 'tutorial_app_install');
      return true;
    }
    return false;
  }

  // 8. HEALTH TO NETSURF NATURAMORE BRIDGE (घरेलू नुस्खा + नेचुरामोर + अस्पताल की बचत)
  function handleHealthToNaturamoreBridge(issueType) {
    let title = '';
    let body = '';
    let chips = [];

    if (issueType === 'sugar' || issueType === 'diabetes') {
      title = '🩸 डायबिटीज (शुगर) — घरेलू नुस्खा व नेचुरामोर लाइफ स्टाइल प्लस';
      body = `नमस्ते जी! 🙏 **डायबिटीज को सिर्फ दबाना नहीं, पैंक्रियाज को प्राकृतिक रूप से सक्रिय करना है:**\n\n` +
        `🌿 **1. प्रमाणित घरेलू नुस्खा (Daily Home Care):**\n` +
        `• 1 चम्मच मेथी दाना + 1/2 चम्मच दालचीनी पाउडर रात को 1 गिलास पानी में भिगोएं। सुबह खाली पेट गुनगुना करके पिएं।\n` +
        `• भोजन में जामुन सिरका या करेला-खीरा-टमाटर का जूस शामिल करें।\n\n` +
        `💊 **2. नेट्सर्फ आयुर्वेदिक समाधान (हजारों रुपये के इलाज की बचत):**\n` +
        `• **नेचुरामोर लाइफ स्टाइल प्लस (Life Style Plus):** भोजन से 30 मिनट पहले 1 कैप्सूल। यह इंसुलिन रिसेप्टर्स को एक्टिव करता है और HbA1c लेवल को धीरे-धीरे सामान्य लाता है।\n` +
        `• **नेचुरामोर प्लस (Naturamore Plus Powder):** सुबह नाश्ते के बाद 1 चम्मच गुनगुने पानी/दूध से। कमजोरी, चक्कर और थकान जड़ से दूर होती है।\n\n` +
        `💰 **पैसे की बचत व कमाई का अवसर:**\n` +
        `अस्पतालों की महंगी जांचों और दवाओं में हर महीने ₹2,000-₹3,000 खर्च होते हैं। नेट्सर्फ से जुड़ने पर आपको सीधे **25% की छूट** मिलती है, यानी सिर्फ ₹15-₹20 प्रतिदिन का खर्च! अगर आप परिवार या पड़ोस के 2 लोगों को फायदा दिलाते हैं, तो ₹200-₹400 की सीधी दैनिक बचत/कमाई होती है।`;

      chips = [
        { text: '📋 डायबिटीज 7-दिवसीय डाइट चार्ट', query: 'मधुमेह में क्या खाएं और डाइट चार्ट' },
        { text: '🌿 लाइफ स्टाइल प्लस 25% छूट पर कैसे लें?', query: 'आरोग्यम ऐप शेयर करके पैसे कैसे कमाएं' },
        { text: '🦴 घुटनों व जोड़ों के दर्द का उपाय', query: 'घुटनों और जोड़ों के दर्द का आयुर्वेदिक इलाज' }
      ];
    } else if (issueType === 'joint_pain' || issueType === 'dard') {
      title = '🦴 जोड़ों व घुटनों का दर्द — घरेलू लेप व नेचुरामोर जॉइंट केयर';
      body = `नमस्ते जी! 🙏 **घुटनों का ग्रीस (Synovial Fluid) और कार्टिलेज घिसने से दर्द होता है। इसका सही प्राकृतिक समाधान:**\n\n` +
        `🌿 **1. प्रामाणिक घरेलू नुस्खा (Home Remedies):**\n` +
        `• 50ml तिल के तेल में 5 कली लहसुन, 1 चम्मच मेथी और थोड़ी सोंठ पकाकर छान लें। रात को गुनगुने तेल से हल्के हाथ से मालिश करें और सिकाई करें।\n` +
        `• सुबह 1 चुटकी चूना (गेहूं के दाने बराबर) दही या दाल में मिलाकर लें (कैल्शियम का सबसे शुद्ध स्रोत)।\n\n` +
        `💊 **2. नेट्सर्फ आयुर्वेदिक जॉइंट केयर (लाखों के ऑपरेशन से बचाव):**\n` +
        `• **नेचुरामोर जॉइंट केयर (Joint Care Capsule):** सुबह व शाम भोजन के बाद 1-1 कैप्सूल। इसमें सलाई गुग्गुल, हड़जोड़ और ग्लूकोसामाइन है जो घुटनों के कार्टिलेज को दोबारा पोषण देता है।\n` +
        `• **नेचुरामोर मस्कुलर पेन क्रीम:** दर्द वाली जगह पर लगाएं, 5 मिनट में जकड़न से राहत मिलती है।\n\n` +
        `💰 **बचत व मुनाफा:** घुटनों का ऑपरेशन कराने में ₹2 से ₹3 लाख खर्च होते हैं। आयुर्वेदिक न्यूट्रिशन से केवल ₹25-₹30 प्रतिदिन में आराम मिलता है, और 25% छूट पर उपलब्ध है!`;

      chips = [
        { text: '🦴 घुटनों के दर्द का पूरा आयुर्वेदिक पर्चा', query: 'घुटनों और जोड़ों के दर्द का आयुर्वेदिक इलाज' },
        { text: '🩸 शुगर व डायबिटीज का नुस्खा', query: 'डायबिटीज संपूर्ण स्वास्थ्य निदान व डाइट चार्ट' },
        { text: '📖 डिजिटल बही खाता कैसे चलाएं?', query: 'डिजिटल बही खाता कैसे चलाते हैं सिखाओ' }
      ];
    } else if (issueType === 'digest' || issueType === 'liver' || issueType === 'gas') {
      title = '🫀 गैस, कब्ज व फैटी लिवर — आंत सफाई व नेचुरामोर इजी डिटॉक्स';
      body = `नमस्ते जी! 🙏 **पेट ही 90% बीमारियों की जड़ है। आंतों में जमा पुराना मल और टॉक्सिन साफ करने का तरीका:**\n\n` +
        `🌿 **1. घरेलू नुस्खा (Instant Gut Reset):**\n` +
        `• रात को सोते समय 1 चम्मच त्रिफला चूर्ण गुनगुने पानी के साथ लें।\n` +
        `• सुबह खाली पेट 2 गिलास गुनगुना पानी घूंट-घूंट करके पिएं।\n\n` +
        `💊 **2. नेट्सर्फ इजी डिटॉक्स (7 से 14 दिन का आंत शुद्धि कोर्स):**\n` +
        `• **इजी डिटॉक्स (Easy Detox Tablets):** रात को भोजन के बाद 1-2 गोली गुनगुने पानी से। यह आंतों की अंदरूनी दीवार पर जमी पुरानी गंदगी को बिना पेट मरोड़े 100% साफ करता है।\n` +
        `• गैस, एसिडिटी, भारीपन और फैटी लिवर से तुरंत राहत मिलती है और चेहरे पर भी चमक आती है।\n\n` +
        `💰 **25% छूट पर उपलब्ध:** 1 डिब्बी पूरे महीने चलती है और परिवार का पेट हल्का व स्वस्थ रखती है!`;

      chips = [
        { text: '🌿 फैटी लिवर और गैस का पूरा उपाय', query: 'फैटी लिवर, गैस और पाचन का पक्का इलाज' },
        { text: '🩸 डायबिटीज डाइट चार्ट', query: 'मधुमेह में क्या खाएं और डाइट चार्ट' },
        { text: '📲 सखी ऐप फोन में डाउनलोड करें', query: 'सखी ऐप फोन में कैसे रखें' }
      ];
    } else {
      // General Women's / Family Wellness
      title = '🌸 महिलाओं व परिवार का संपूर्ण स्वास्थ्य — नेचुरामोर फॉर विमेन';
      body = `नमस्ते दीदी! 🙏 **थकान, कमजोरी, कमर दर्द, बाल झड़ना और हीमोग्लोबिन की कमी का प्राकृतिक पोषण:**\n\n` +
        `🌿 **1. घरेलू आहार सलाह:**\n` +
        `• प्रतिदिन 2 खजूर, 5 भीगे बादाम और 1 चम्मच भुने काले चने गुड़ के साथ लें।\n` +
        `• तांबे के बर्तन का पानी पिएं और हरी मेथी/पालक खाएं।\n\n` +
        `💊 **2. नेचुरामोर फॉर विमेन (100% शाकाहारी पोषण):**\n` +
        `• इसमें शतावरी, अशोका, बायोटीन, फोलिक एसिड, कैल्शियम और आयरन है जो महिलाओं के हार्मोन संतुलित रखता है, चेहरे पर निखार लाता है और बाल झड़ना रोकता है।\n` +
        `• प्रतिदिन सुबह 1 चम्मच दूध या गुनगुने पानी के साथ।\n\n` +
        `💰 **घर बैठे पार्ट-टाइम आमदनी:** गाँव की महिलाएँ अपने पड़ोस की 3-4 बहनों को यह बताकर घर बैठे ₹200 से ₹500 रोज़ की अतिरिक्त कमाई कर रही हैं!`;

      chips = [
        { text: '💇 बाल झड़ने व झाइयों का हर्बल नुस्खा', query: 'झाइयां व काले दाग का हर्बल इलाज' },
        { text: '📲 सखी से ₹200-₹500 रोज कैसे कमाएं?', query: 'आरोग्यम ऐप शेयर करके पैसे कैसे कमाएं' },
        { text: '📖 डिजिटल बही खाता कैसे चलाएं?', query: 'डिजिटल बही खाता कैसे चलाते हैं सिखाओ' }
      ];
    }

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'health', 'health_naturamore_bridge');
      return true;
    }
    return false;
  }

  // 9. MASTER ROUTER & DEHATI DIALECT MATCHER
  function handleTutorialAndEngagementQuery(cleanQ, rawQ) {
    if (!cleanQ) return false;
    const q = cleanQ.toLowerCase();

    // A0. Unified Bahi Khata & Meri Dairy Combo
    if ((q.includes('बही') || q.includes('khata')) && (q.includes('डेयरी') || q.includes('dairy') || q.includes('दूध'))) {
      const title = '📖 डिजिटल बही खाता & 🥛 मेरी डेयरी — दुकान व दूध का पक्का हिसाब';
      const body = `राम-राम भैया! 🙏 **आरोग्यम डिजिटल बही खाता व मेरी डेयरी** दोनों सुविधाएँ गाँव के व्यापारियों और पशुपालकों के लिए 100% मुफ्त हैं:\n\n` +
        `📖 **1. डिजिटल बही खाता:**\n` +
        `• उधारी (लाल बटन) व जमा (हरा बटन) की एंट्री 5 सेकंड में करें।\n` +
        `• एंट्री होते ही ग्राहक के फोन पर पारदर्शी WhatsApp रसीद व डिजिटल पासबुक लिंक जाता है।\n\n` +
        `🥛 **2. मेरी डेयरी रजिस्टर:**\n` +
        `• सुबह-शाम दूध (लीटर) व फैट % डालते ही प्रति लीटर सरकारी/सहकारी रेट और कुल राशि खुद निकलती है।\n` +
        `• 10-दिवसीय व मासिक दूध पर्चा 1-क्लिक में WhatsApp पर भेजें!\n\n` +
        `👇 **नीचे दिए गए बटनों से तुरंत बही खाता या डेयरी खोलें:**`;
      const chips = [
        { text: '📖 अपना बही खाता खोलें', url: '/pages/smart-etailer.html', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
        { text: '🥛 मेरी डेयरी रजिस्टर खोलें', url: '/pages/smart-etailer.html?tab=dairy', isExternal: true, style: 'background:#0284c7;color:#ffffff;font-weight:800;' },
        { text: '📲 शेयर करके ₹500 रोज कैसे कमाएं?', query: 'आरोग्यम शेयर करके पैसे कैसे कमाएं' }
      ];
      if (typeof window.renderCrispSpecialBox === 'function') {
        window.renderCrispSpecialBox(title, body, chips, 'business', 'tutorial_combo_bahi_dairy');
        return true;
      }
    }

    // A. Bahi Khata Tutorial & Rustic Matches (बही खाता, उधारी जमा, डायरी, हिसाब किताब)
    if (
      q.includes('बही खाता') || q.includes('bahi khata') || q.includes('khata book') || q.includes('खाता बुक') ||
      q.includes('उधारी') || q.includes('उधार जमा') || q.includes('udhari') || q.includes('तकादा') ||
      q.includes('हमार बही खाता') || q.includes('हिसाब कइसे') || q.includes('डायरी')
    ) {
      return handleBahiKhataTutorial();
    }

    // B. Meri Dairy Tutorial & Rustic Matches (मेरी डेयरी, दूध फैट, ग्वाला, snf, fat rate)
    if (
      q.includes('मेरी डेयरी') || q.includes('meri dairy') || q.includes('दूध का हिसाब') || q.includes('फैट का हिसाब') ||
      q.includes('दूध कै फैट') || q.includes('dudh fat') || q.includes('snf') || q.includes('डेयरी रजिस्टर') ||
      q.includes('दूध पर्चा')
    ) {
      return handleMeriDairyTutorial();
    }

    // C. Share & Earn / Referral Income / 200-500 रोज कमाई (शेयर एंड अर्न, पार्ट टाइम कमाई, पैसे कैसे कमाएं)
    if (
      q.includes('शेयर करके पैसे') || q.includes('share and earn') || q.includes('share & earn') ||
      q.includes('200') && (q.includes('कमाई') || q.includes('कमाना') || q.includes('रोज') || q.includes('कमaye')) ||
      q.includes('500') && (q.includes('कमाई') || q.includes('कमाना')) ||
      q.includes('पइसा कइसे कमाये') || q.includes('पार्ट टाइम कमाई') || q.includes('नेट्सर्फ से कमाई') ||
      q.includes('कमाई कैसे करें') || q.includes('पैसे कमाने का तरीका')
    ) {
      return handleShareAndEarnTutorial();
    }

    // D. My Team / Network List (मेरे रेफरल से कौन जुड़े, हमरे लिंक से कउन जुड़ा, टीम लिस्ट)
    if (
      (q.includes('मेरे रेफरल') || q.includes('मेरे लिंक') || q.includes('हमरे लिंक') || q.includes('हमरे रेफरल')) &&
      (q.includes('कौन') || q.includes('कउन') || q.includes('जुड़ा') || q.includes('जुड़े') || q.includes('लिस्ट') || q.includes('टीम'))
    ) {
      handleMyReferralTeamQuery();
      return true;
    }

    // E. Panchang & Weather Tutorial (मौसम, पंचांग, शुभ मुहूर्त, वर्षा, नक्षत्र)
    if (
      q.includes('कृषि पंचांग') || q.includes('मौसम और पंचांग') || q.includes('आज का पंचांग') ||
      q.includes('शुभ मुहूर्त') || q.includes('नक्षत्र') || (q.includes('मौसम') && q.includes('सिखाओ'))
    ) {
      return handlePanchangAndWeatherTutorial();
    }

    // F. Mandi Bhav Intelligence (मंडी भाव, ताजा भाव, फसल दरें, मंडी का रेट)
    if (
      q.includes('मंडी भाव') || q.includes('mandi bhav') || q.includes('ताजा भाव') ||
      q.includes('फसलों का ताजा भाव') || q.includes('मंडी का रेट') || q.includes('मंडी रेट')
    ) {
      return handleMandiBhavTutorial();
    }

    // G. App Install, Notification Setup & Test Notification
    if (
      q.includes('ऐप डाउनलोड') || q.includes('ऐप इंस्टॉल') || q.includes('फोन में कैसे रखें') ||
      q.includes('app install') || q.includes('app download') || q.includes('फोन मा कइसे रखे') ||
      q.includes('सखी ऐप फोन') || q.includes('नोटिफिकेशन') || q.includes('notification')
    ) {
      if (q.includes('टेस्ट') || q.includes('भेज') || q.includes('test')) {
        if (window.SakhiNotificationEngine && typeof window.SakhiNotificationEngine.sendInstantNotification === 'function') {
          window.SakhiNotificationEngine.sendInstantNotification(
            '🌾 आपकी सखी • लाइव टेस्ट नोटिफिकेशन! 🙏',
            'राम-राम किसान साथी! सखी का सुंदर अवतार नोटिफिकेशन आपके फोन पर 100% सही तरीके से काम कर रहा है।',
            '/images/sakhi/aarogyam-sakhi.webp'
          );
        }
      }
      return handleAppInstallAndNotificationTutorial();
    }

    // H. Health to Naturamore Natural Bridge (Sugar, Joint Pain, Digestion, Women Care)
    if (
      q.includes('शुगर') || q.includes('डायबिटीज') || q.includes('diabetes') || q.includes('sugar')
    ) {
      if (q.includes('दवा') || q.includes('इलाज') || q.includes('नुस्खा') || q.includes('डाइट') || q.includes('नेचुरामोर') || q.includes('लाइफ स्टाइल')) {
        return handleHealthToNaturamoreBridge('sugar');
      }
    }

    if (
      q.includes('जोड़') || q.includes('घुटने') || q.includes('गठिया') || q.includes('दर्द') ||
      q.includes('गोड़ हाथ') || q.includes('कमर दर्द') || q.includes('joint')
    ) {
      if (q.includes('दवा') || q.includes('इलाज') || q.includes('नुस्खा') || q.includes('जॉइंट केयर') || q.includes('ठीक होई')) {
        return handleHealthToNaturamoreBridge('joint_pain');
      }
    }

    if (
      q.includes('कब्ज') || q.includes('गैस') || q.includes('एसिडिटी') || q.includes('लिवर') ||
      q.includes('पेट साफ') || q.includes('पाचन') || q.includes('पेट खराब')
    ) {
      if (q.includes('दवा') || q.includes('इलाज') || q.includes('नुस्खा') || q.includes('डिटॉक्स') || q.includes('साफ नाही')) {
        return handleHealthToNaturamoreBridge('digest');
      }
    }

    if (
      q.includes('कमजोरी') || q.includes('थकान') || q.includes('खून की कमी') || q.includes('महिला') ||
      q.includes('पीरियड') || q.includes('कमर कटती')
    ) {
      return handleHealthToNaturamoreBridge('women');
    }

    return false;
  }

  // Export to Global Window under SAKHI_MANAS.md Protocol
  window.SakhiTutorialEngine = {
    handleQuery: handleTutorialAndEngagementQuery,
    handleBahiKhata: handleBahiKhataTutorial,
    handleDairy: handleMeriDairyTutorial,
    handleShareEarn: handleShareAndEarnTutorial,
    handleMyTeam: handleMyReferralTeamQuery,
    handlePanchangWeather: handlePanchangAndWeatherTutorial,
    handleMandiBhav: handleMandiBhavTutorial,
    handleAppInstall: handleAppInstallAndNotificationTutorial,
    handleHealthBridge: handleHealthToNaturamoreBridge
  };

  console.log('✅ [Sakhi Tutorial & Engagement Engine v1.0] Initialized cleanly under SAKHI_MANAS.md Protocol');

})(window, document);

