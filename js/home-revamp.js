/**
 * ====================================================================
 * AAROGYAM INDIA - HOME PAGE COMPLETE REVAMP & CMS CONTROLLER
 * Version: 5.0 (Instant Bulletproof Data, Health, Crops, Pashu, Achievers, Bestsellers)
 * ====================================================================
 */

'use strict';

(function () {
  // Global Safe AI Consultation WhatsApp Redirection Helper
  window.consultAiExpert = function (topic, details) {
    let text = `नमस्ते Aarogyam India AI एक्सपर्ट! मुझे "${topic || 'कृषि व स्वास्थ्य'}" के बारे में उचित सलाह व समाधान चाहिए।`;
    if (details) {
      text += `\nविवरण: ${details}`;
    }
    if (typeof window.getPersonalizedWhatsAppUrl === 'function') {
      window.location.href = window.getPersonalizedWhatsAppUrl(text);
    } else {
      window.location.href = `https://wa.me/917974422572?text=${encodeURIComponent(text)}`;
    }
  };

  // Universal KPI Card Audio Player (Hindi Speech Synthesis)
  window.playKpiCardAudio = function (event, title, text) {
    if (event) {
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }
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
  };

  // Universal KPI Card Blue Share Trigger (Native WebShare with WhatsApp fallback)
  window.triggerKpiNativeShare = function (event, title, text, targetUrl) {
    if (event) {
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }
    const pageUrl = targetUrl ? (new URL(targetUrl, window.location.origin).href) : window.location.href;
    const cleanTitle = (title || 'Aarogyam India').replace(/<[^>]+>/g, '');
    const cleanText = (text || '').replace(/<[^>]+>/g, '');
    const shareMessage = `🌾 *${cleanTitle}*\n${cleanText ? cleanText + '\n\n' : ''}👉 सम्पूर्ण विवरण व आयुर्वेदिक उपाय देखें:\n${pageUrl}`;

    if (navigator.share) {
      navigator.share({
        title: cleanTitle,
        text: shareMessage,
        url: pageUrl
      }).catch(() => { });
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
      window.open(waUrl, '_blank');
    }
  };

  // -------------------------------------------------------------
  const DEFAULT_HEALTH_DISEASES = [
    {
      id: "DIS001",
      name: "मधुमेह / डायबिटीज",
      nameEn: "Diabetes & Blood Sugar Support",
      icon: "🩸",
      image: "/images/banners/health-diabetes.jpg",
      badge: "सर्वाधिक सामान्य",
      color: "#3b82f6",
      symptoms: ["बार-बार पेशाब आना", "थकान व कमजोरी", "शुगर लेवल असंतुलन", "घाव देर से भरना"],
      description: "प्राकृतिक हर्बल सप्लीमेंट्स और आहार नियंत्रण से ब्लड शुगर को प्राकृतिक रूप से संतुलित रखें।",
      solution: "जामुन-करेला अर्क, गिलोय व मेथी दाना का प्राकृतिक योग और वैज्ञानिक डाइट प्लान।",
      topic: "मधुमेह / डायबिटीज"
    },
    {
      id: "DIS002",
      name: "जोड़ों का दर्द व गठिया",
      nameEn: "Joint Pain & Arthritis Care",
      icon: "🦴",
      image: "/images/banners/health-joint-care.jpg",
      badge: "तेज राहत",
      color: "#8b5cf6",
      symptoms: ["घुटनों व जोड़ों में दर्द", "चलने-फिरने में तकलीफ", "सूजन व जकड़न", "यूरिक एसिड वृद्धि"],
      description: "कार्टिलेज पोषण, यूरिक एसिड नियंत्रण और जोड़ों के दर्द से प्राकृतिक आयुर्वेदिक समाधान।",
      solution: "शल्लाकी, निर्गुंडी, अश्वगंधा तेल मालिश व कैल्शियम-ग्लूकोसामाइन पोषण थेरेपी।",
      topic: "जोड़ों का दर्द व गठिया"
    },
    {
      id: "DIS003",
      name: "महिला स्वास्थ्य / PCOD व PCOS",
      nameEn: "Women's Health & Hormonal Balance",
      icon: "🌸",
      image: "/images/banners/health-banner.jpeg",
      badge: "100% सुरक्षित",
      color: "#ec4899",
      symptoms: ["अनियमित मासिक धर्म", "हार्मोनल असंतुलन", "वजन बढ़ना व कमजोरी", "चेहरे पर अनचाहे बाल"],
      description: "हार्मोनल संतुलन, गर्भाशय पोषण और पीसीओडी/पीसीओएस का सम्पूर्ण सुरक्षित हर्बल समाधान।",
      solution: "शतावरी, अशोकारिष्ट, लोध्र और प्राकृतिक हार्मोनल बैलेंसिंग आयुर्वेदिक किट।",
      topic: "महिला स्वास्थ्य (PCOD/PCOS)"
    },
    {
      id: "DIS004",
      name: "बाल झड़ना व डैंड्रफ",
      nameEn: "Hair Fall & Scalp Nutrition",
      icon: "💇",
      image: "/images/banners/health-hair-care.jpg",
      badge: "हर्बल केयर",
      color: "#6366f1",
      symptoms: ["तेजी से बाल झड़ना", "रूसी व डैंड्रफ", "सिर में खुजली", "बालों का पतलापन व गंजापन"],
      description: "बालों की जड़ों को पोषण, नए बालों का विकास और डैंड्रफ मुक्त घने बालों के लिए विशेष थेरेपी।",
      solution: "भृंगराज, ब्राह्मी, आंवला व प्याज अर्क आधारित रूट-न्यूट्रीशन हेयर ऑयल थेरेपी।",
      topic: "बाल झड़ना व डैंड्रफ"
    },
    {
      id: "DIS005",
      name: "त्वचा रोग, पिंपल्स व एलर्जी",
      nameEn: "Skin Care, Acne & Glow",
      icon: "✨",
      image: "/images/banners/health-banner.jpeg",
      badge: "ग्लोइंग स्किन",
      color: "#06b6d4",
      symptoms: ["कील-मुंहासे (पिंपल्स)", "दाद, खाज व खुजली", "त्वचा का कालापन", "एलर्जी व रैशेज"],
      description: "रक्त शुद्धि और प्राकृतिक जड़ी-बूटियों द्वारा पिंपल्स, झाइयों और त्वचा संक्रमण से राहत।",
      solution: "नीम, मंजिष्ठा, खदिरारिष्ट द्वारा रक्त शोधन और हर्बल लेप उपचार।",
      topic: "त्वचा रोग, पिंपल्स व एलर्जी"
    },
    {
      id: "DIS006",
      name: "पुरुष स्वास्थ्य व स्टैमिना",
      nameEn: "Men's Vitality & Strength",
      icon: "⚡",
      image: "/images/banners/health-banner.jpeg",
      badge: "ऊर्जा व ताकत",
      color: "#0ea5e9",
      symptoms: ["शारीरिक कमजोरी", "स्टैमिना व ऊर्जा की कमी", "तनाव व अनिद्रा", "पौरुष दुर्बलता"],
      description: "शिलाजीत, अश्वगंधा व स्वर्ण भस्म युक्त सुरक्षित आयुर्वेदिक फॉर्मूले द्वारा ऊर्जा और पौरुष वृद्धि।",
      solution: "शुद्ध शिलाजीत, कौंच बीज, सफेद मूसली व गोखरू युक्त नेचुरल एनर्जी बूस्टर।",
      topic: "पुरुष स्वास्थ्य व स्टैमिना"
    },
    {
      id: "DIS007",
      name: "गैस, एसिडिटी व कब्ज",
      nameEn: "Digestion & Acidity Relief",
      icon: "🍃",
      image: "/images/banners/health-banner.jpeg",
      badge: "तुरंत आराम",
      color: "#14b8a6",
      symptoms: ["पेट में भारीपन व जलन", "पुरानी कब्ज (Constipation)", "खट्टी डकारें व बदहजमी", "भूख न लगना"],
      description: "पाचन तंत्र की सफाई, आंतों की मजबूती और गैस-एसिडिटी से स्थायी प्राकृतिक राहत।",
      solution: "त्रिफला, हिंग्वाष्टक चूर्ण, एलोवेरा जूस व प्रोबायोटिक गट-हेल्थ फॉर्मूला।",
      topic: "गैस, एसिडिटी व कब्ज"
    },
    {
      id: "DIS008",
      name: "मोटापा व वजन नियंत्रण",
      nameEn: "Weight Management & Metabolism",
      icon: "⚖️",
      image: "/images/banners/health-weight-loss.jpg",
      badge: "फैट बर्न",
      color: "#f59e0b",
      symptoms: ["पेट की चर्बी बढ़ना", "थकान व सांस फूलना", "धीमा मेटाबॉलिज्म", "जोड़ों पर भारीपन"],
      description: "आयुर्वेदिक फैट बर्नर, 24 घंटे का डिटॉक्स डाइट चार्ट और सुरक्षित प्राकृतिक वजन नियंत्रण।",
      solution: "मेदोहर गुग्गुलु, गार्सिनिया, ग्रीन टी व गर्म पानी डिटॉक्स विधि।",
      topic: "मोटापा व वजन नियंत्रण"
    },
    {
      id: "DIS009",
      name: "हाई बीपी व हृदय स्वास्थ्य",
      nameEn: "Blood Pressure & Heart Care",
      icon: "❤️",
      badge: "स्वस्थ दिल",
      color: "#f43f5e",
      symptoms: ["रक्तचाप (BP) बढ़ना", "घबराहट व बेचैनी", "कोलेस्ट्रॉल का बढ़ना", "हृदय में भारीपन"],
      description: "धमनियों की शुद्धि, कोलेस्ट्रॉल नियंत्रण और हृदय की मांसपेशियों को मजबूत बनाने के उपाय।",
      solution: "अर्जुन की छाल का काढ़ा, सर्पगंधा, लहसुन अर्क और लिपिड प्रोफाइल सुधार।",
      topic: "हाई बीपी व हृदय स्वास्थ्य"
    },
    {
      id: "DIS010",
      name: "आँखों की देखभाल व दृष्टि",
      nameEn: "Eye Care & Vision Support",
      icon: "👁️",
      badge: "नेत्र सुरक्षा",
      color: "#38bdf8",
      symptoms: ["आँखों से पानी आना", "स्क्रीन देखने से जलन", "चश्मे का नंबर बढ़ना", "धुंधला दिखाई देना"],
      description: "आँखों की रोशनी बढ़ाने, मोतियाबिंद की रोकथाम और डिजिटल स्क्रीन तनाव से राहत के फॉर्मूले।",
      solution: "त्रिफला नेत्र प्रक्षालन, सप्तामृत लौह, ल्यूटिन पोषण और आई-ड्रॉप थेरेपी।",
      topic: "आँखों की देखभाल व दृष्टि"
    }
  ];

  const DEFAULT_CROPS = [
    {
      id: "CROP001",
      name: "सोयाबीन (Soybean)",
      season: "खरीफ फसल",
      image: "/images/crops/soyabeen.jpeg",
      badge: "प्रमुख तिलहन",
      color: "#3b82f6",
      mainIssues: ["गर्डल बीटल (चक्रीय भृंग)", "पीला मोज़ेक वायरस", "तना मक्खी व सेमीलूपर", "जड़ सड़न व फफूंद"],
      solution: "बीज उपचार, सही समय पर कीटनाशक-फफूंदनाशक स्प्रे और पोटाश-बोरोन पोषण प्रबंधन।",
      topic: "सोयाबीन फसल सुरक्षा"
    },
    {
      id: "CROP002",
      name: "धान / चावल (Paddy / Rice)",
      season: "खरीफ / रबी",
      image: "/images/crops/paddy.jpeg",
      badge: "अन्नदाता फसल",
      color: "#8b5cf6",
      mainIssues: ["ब्लास्ट (झुलसा रोग)", "तना छेदक (Stem Borer)", "भूरा माहू (BPH)", "शीथ ब्लाइट"],
      solution: "ट्राइसाइक्लाजोल व नीम ऑयल स्प्रे, जिंक सल्फेट प्रयोग और जल स्तर प्रबंधन तालिका।",
      topic: "धान फसल सुरक्षा"
    },
    {
      id: "CROP003",
      name: "गेहूं (Wheat)",
      season: "रबी फसल",
      image: "/images/crops/wheat.jpeg",
      badge: "मुख्य खाद्यान्न",
      color: "#6366f1",
      mainIssues: ["पीला व भूरा रतुआ (Rust)", "दीमक व जड़ माहू", "करनाल बंट", "दाने का छोटा रह जाना"],
      solution: "प्रोपिकोनाजोल स्प्रे, कल्ले बढ़ाते समय नैनो यूरिया व सागरिका/ह्यूमिक एसिड का वैज्ञानिक प्रयोग।",
      topic: "गेहूं फसल सुरक्षा"
    },
    {
      id: "CROP004",
      name: "कपास / नरमा (Cotton)",
      season: "खरीफ व जायद",
      image: "/images/banners/hero-banner-1.jpeg",
      badge: "सफेद सोना",
      color: "#0ea5e9",
      mainIssues: ["गुलाबी सुंडी (Pink Bollworm)", "सफेद मक्खी व हरा तेला", "पत्ती मरोड़ वायरस", "फूल-टिंडे का झड़ना"],
      solution: "फेरोमोन ट्रैप, प्रोफेनोफॉस/इमिडाक्लोप्रिड स्प्रे और बोरॉन-कैल्शियम से टिंडे झड़ने की रोकथाम।",
      topic: "कपास फसल सुरक्षा"
    },
    {
      id: "CROP005",
      name: "मक्का (Maize / Corn)",
      season: "खरीफ / जायद",
      image: "/images/crops/maize.jpeg",
      badge: "अनाज व चारा",
      color: "#06b6d4",
      mainIssues: ["फॉल आर्मीवर्म (सैनिक कीट)", "तना छेदक", "पत्ती झुलसा", "भुट्टे में दाने न भरना"],
      solution: "एमामेक्टिन बेंजोएट या कोराजन का सटीक छिड़काव व दानेदार कीटनाशक का पोंगे में प्रयोग।",
      topic: "मक्का फसल सुरक्षा"
    },
    {
      id: "CROP006",
      name: "सब्जियां, मिर्च व टमाटर",
      season: "वर्ष भर",
      image: "/images/banners/hero-banner-2.jpeg",
      badge: "दैनिक नकदी फसल",
      color: "#a855f7",
      mainIssues: ["मिर्च में चुर्रा-मुर्रा (Leaf Curl)", "टमाटर में फल छेदक व अगेती झुलसा", "थ्रिप्स व माइट्स", "फूलों का झड़ना"],
      solution: "पेगासस/डाइफेन्थियूरॉन स्प्रे, टॉनिक और जैविक कवकनाशी द्वारा वायरस की रोकथाम।",
      topic: "सब्जियां, मिर्च व टमाटर सुरक्षा"
    },
    {
      id: "CROP007",
      name: "गन्ना (Sugarcane)",
      season: "वार्षिक फसल",
      image: "/images/banners/hero-banner-3.jpeg",
      badge: "मीठी नकदी फसल",
      color: "#14b8a6",
      mainIssues: ["लाल सड़न (Red Rot)", "कंसुआ व चोटी छेदक कीट", "पायरिला कीट", "गन्ने की मोटाई व वजन कम होना"],
      solution: "ट्राइकोडर्मा से मिट्टी उपचार, क्लोरेंट्रानिलिप्रोल ड्रेंचिंग व पोटाश-सल्फर पोषण प्रबंधन।",
      topic: "गन्ना फसल सुरक्षा व मोटाई"
    },
    {
      id: "CROP008",
      name: "दलहन / चना व अरहर (Pulses)",
      season: "रबी व खरीफ",
      image: "/images/crops/wheat.jpeg",
      badge: "प्रोटीन युक्त फसल",
      color: "#38bdf8",
      mainIssues: ["उकठा रोग (Wilt / मुरझान)", "फली छेदक इल्ली (Pod Borer)", "जड़ गलन", "फूलों का झड़ना"],
      solution: "राइजोबियम कल्चर बीज शोधन, फ्लुबेंडामाइड स्प्रे और फूल आते समय सल्फर/NPK 0:52:34 स्प्रे।",
      topic: "दलहन (चना व अरहर) सुरक्षा"
    }
  ];

  const DEFAULT_PASHU_CARDS = [
    {
      id: "PASHU001",
      name: "गाय - दुग्ध वृद्धि व पोषण",
      category: "गाय पालन (Cow Care)",
      icon: "🐄",
      image: "/images/banners/pashu-cow-care.jpg",
      badge: "1-2 लीटर दूध वृद्धि",
      color: "#3b82f6",
      mainIssues: ["दूध उत्पादन में कमी", "समय पर गाभिन न होना", "खुर व त्वचा रोग", "कैल्शियम व मिनरल की कमी"],
      solution: "आयुर्वेदिक मिनरल मिक्सचर, प्रोबायोटिक फीड सप्लीमेंट और कैल्शियम संतुलित आहार तालिका।",
      topic: "गाय का दूध व पोषण वृद्धि"
    },
    {
      id: "PASHU002",
      name: "भैंस - FAT% व SNF वृद्धि",
      category: "भैंस पालन (Buffalo Care)",
      icon: "🐃",
      image: "/images/banners/pashu-cow-care.jpg",
      badge: "FAT 8% तक",
      color: "#8b5cf6",
      mainIssues: ["दूध में फैट (FAT) कम आना", "गर्मी में हांफना व सुस्ती", "बांझपन (Repeat Breeding)", "पाचन विकार"],
      solution: "बायपास फैट, रुमेन बफर और हर्बल पाचक चूर्ण द्वारा दूध में गाढ़ापन और उच्चतम फैट प्रतिशत।",
      topic: "भैंस के दूध का फैट (FAT%) व गाढ़ापन"
    },
    {
      id: "PASHU003",
      name: "बकरी पालन - तेजी से वजन वृद्धि",
      category: "बकरी पालन (Goat Farming)",
      icon: "🐐",
      image: "/images/banners/pashu-goat-care.jpg",
      badge: "उच्च मुनाफा",
      color: "#6366f1",
      mainIssues: ["बच्चों में दस्त व निमोनिया", "वजन धीमी गति से बढ़ना", "पीपीआर (PPR) व ईटीवी रोग", "पेट के कीड़े (Worms)"],
      solution: "नियमित डीवर्मिंग (कृमिनाशक), प्रोटीन युक्त दाना मिश्रण और ग्रोथ प्रमोटर सप्लीमेंट्स।",
      topic: "बकरी का वजन वृद्धि व दस्त रोकथाम"
    },
    {
      id: "PASHU004",
      name: "मुर्गी पालन (Poultry Farm Care)",
      category: "पोल्ट्री फार्मिंग",
      icon: "🐔",
      image: "/images/banners/pashu-palan-banner.jpg",
      badge: "अंडा व मांस वृद्धि",
      color: "#ec4899",
      mainIssues: ["मुर्गियों में सांस की बीमारी (CRD)", "अंडा उत्पादन गिरना", "गंभीर रानीखेत संक्रमण", "अचानक मृत्यु दर"],
      solution: "इम्युनिटी बूस्टर टॉनिक, मल्टीविटामिन और फार्म बायो-सिक्योरिटी सैनिटाइजेशन गाइड।",
      topic: "मुर्गी पालन अंडा व वजन वृद्धि"
    },
    {
      id: "PASHU005",
      name: "मछली पालन (Fish Farming)",
      category: "मत्स्य पालन",
      icon: "🐟",
      image: "/images/banners/pashu-palan-banner.jpg",
      badge: "बायोफ्लॉक / तालाब",
      color: "#06b6d4",
      mainIssues: ["पानी में ऑक्सीजन की कमी", "मछलियों में पंख व त्वचा सड़न", "अमोनिया गैस वृद्धि", "ग्रोथ रुकना"],
      solution: "तालाब जल शोधन, प्रोबायोटिक वाटर कंडीशनर और उच्च प्रोटीन फ्लोटिंग फीड मैनेजमेंट।",
      topic: "मछली पालन व वाटर कंडीशनर"
    },
    {
      id: "PASHU006",
      name: "पशुओं में थनैला व पाचन रोग",
      category: "आपातकालीन पशु सुरक्षा",
      icon: "🩺",
      image: "/images/banners/pashu-cow-care.jpg",
      badge: "तुरंत राहत",
      color: "#f43f5e",
      mainIssues: ["थनों में सूजन व दर्द (थनैला)", "दूध में खून या छिछड़े आना", "अफरा (पेट फूलना / Bloat)", "बुखार व मुंहपका"],
      solution: "एंटी-मैस्टाइटिस हर्बल स्प्रे, अफरा नाशक ड्राप और थनों की प्राकृतिक सुरक्षा किट।",
      topic: "पशुओं में थनैला व पाचन रोग"
    }
  ];

  const DEFAULT_ACHIEVERS = [
    {
      id: "ACH001",
      name: "Prafull Upadhyay",
      nameHindi: "प्रफुल्ल उपाध्याय",
      location: "Rewa, Madhya Pradesh",
      rank: "⭐ Rock Star Achiever (July 2026)",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      avatar: "👨‍💼",
      image: "/images/team/achiever-1.jpg",
      achievement: "डिजिटल कृषि ई-बुक्स व जैविक उत्पादों के प्रसार में रिकॉर्ड परिणाम देकर जुलाई 2026 रॉकस्टार क्लब हासिल किया।",
      quote: "Aarogyam India के डिजिटल टूल्स ने मुझे सीधे हजारों किसानों तक त्वरित व प्रामाणिक समाधान पहुँचाने की शक्ति दी।"
    },
    {
      id: "ACH002",
      name: "Shikha Upadhyay",
      nameHindi: "शिखा उपाध्याय",
      location: "Rewa, Madhya Pradesh",
      rank: "⭐ Rock Star Achiever (July 2026)",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      avatar: "👩‍💼",
      image: "/images/team/achiever-2.jpg",
      achievement: "महिला सशक्तिकरण व स्वास्थ्य-पोषण अभियान का सफल नेतृत्व कर जुलाई माह में रॉकस्टार अचीवर बनीं।",
      quote: "डिजिटल मंच के माध्यम से हर घर तक प्रामाणिक स्वास्थ्य और पोषण पहुँचाना ही हमारा मुख्य संकल्प है।"
    },
    {
      id: "ACH003",
      name: "Ratna Joshi",
      nameHindi: "रत्ना जोशी",
      location: "Madhya Pradesh",
      rank: "⭐ Rock Star Achiever (July 2026)",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      avatar: "👩‍💼",
      image: "/images/team/achiever-3.jpg",
      achievement: "आयुर्वेदिक वेलनेस व ई-लर्निंग कंसल्टेंसी में उत्कृष्ट योगदान देकर जुलाई रॉकस्टार मुकाम पाया।",
      quote: "Aarogyam India के साथ जुड़कर वास्तविक सम्मान, ज्ञान और डिजिटल आत्मनिर्भरता प्राप्त हुई।"
    },
    {
      id: "ACH004",
      name: "Amrendra Singh",
      nameHindi: "अमरेन्द्र सिंह",
      location: "Satna, Madhya Pradesh",
      rank: "⭐ Rock Star Achiever (July 2026)",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      avatar: "👨‍💼",
      image: "/images/team/achiever-4.jpg",
      achievement: "उन्नत फसल सुरक्षा व वैज्ञानिक स्प्रे साइंस अभियानों का सफल नेतृत्व कर रॉकस्टार क्लब हासिल किया।",
      quote: "किसानों को समय पर सही डिजिटल गाइड और 24×7 AI परामर्श से जोड़कर अद्भुत परिणाम मिले।"
    },
    {
      id: "ACH005",
      name: "Sadhna Holker",
      nameHindi: "साधना होल्कर",
      location: "Indore, Madhya Pradesh",
      rank: "⭐ Rock Star Achiever (July 2026)",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      avatar: "👩‍💼",
      image: "/images/team/achiever-5.jpg",
      achievement: "डायरेक्ट कंसल्टेंसी व वेलनेस उत्पादों के प्रसार में असाधारण योगदान देकर रॉकस्टार क्लब में स्थान बनाया।",
      quote: "डिजिटल सिस्टम ने हमारे काम को बहुत आसान, पारदर्शी और अत्यधिक प्रभावी बना दिया है।"
    },
    {
      id: "ACH006",
      name: "Pavan Pandey",
      nameHindi: "पवन पाण्डेय",
      location: "Madhya Pradesh",
      rank: "⚡ Fast Track Achiever",
      badgeColor: "#38bdf8",
      badgeBg: "rgba(56, 189, 248, 0.15)",
      avatar: "👨‍🌾",
      image: "/images/team/achiever-1.jpg",
      achievement: "फास्ट ट्रैक क्लब क्वालीफाई कर सैकड़ों किसानों को आधुनिक डिजिटल कृषि व स्प्रे शेड्यूल से जोड़ा।",
      quote: "कम समय में फास्ट ट्रैक मुकाम हासिल करना Aarogyam India के मजबूत इकोसिस्टम का नतीजा है।"
    },
    {
      id: "ACH007",
      name: "Hari Narayan Mahto",
      nameHindi: "हरी नारायण महतो",
      location: "Bihar / Jharkhand",
      rank: "⚡ Fast Track Achiever",
      badgeColor: "#38bdf8",
      badgeBg: "rgba(56, 189, 248, 0.15)",
      avatar: "👨‍🌾",
      image: "/images/team/achiever-4.jpg",
      achievement: "जैविक कृषि व मृदा संवर्धन मिशन में अभूतपूर्व प्रगति कर फास्ट ट्रैक अचीवर का गौरव हासिल किया।",
      quote: "किसानों की लागत घटाने और सही उत्पाद सीधे पहुंचाने में हमें व्यापक जनसमर्थन मिला।"
    }
  ];

  // -------------------------------------------------------------
  // 1. ADMIN CMS CONFIGURATION LOADER
  // -------------------------------------------------------------
  function getHomeCmsConfig() {
    try {
      const saved = localStorage.getItem('AAROGYAM_HOME_CMS_CONFIG') || localStorage.getItem('site_page_index') || '{}';
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  }

  function initHomeCmsLoader() {
    const config = getHomeCmsConfig();
    const tickerTrack = document.getElementById('home-live-ticker-track');

    if (tickerTrack) {
      if (config.ticker_text) {
        tickerTrack.textContent = config.ticker_text;
      } else {
        const realAlerts = [
          '🌾 10,000+ किसानों का पहला भरोसेमंद मंच | 24×7 AI एक्सपर्ट सहायता उपलब्ध! ✦ प्रमाणित ई-बुक्स व मंडी भाव',
          '⚡ खरीफ फसल मास्टर गाइड 2026 व खेती का डॉक्टर ई-बुक पर बम्पर छूट!',
          '👑 Aarogyam Pro VIP पास - 1 वर्ष का सम्पूर्ण ऑल-एक्सेस मात्र ₹99 में'
        ];
        tickerTrack.textContent = realAlerts.join('   ✦   ');
      }
    }
  }

  // -------------------------------------------------------------
  // 2. HERO BANNER CAROUSEL
  // -------------------------------------------------------------
  let heroSlideIndex = 0;
  let heroSlideTimer = null;

  function initHeroCarousel() {
    const container = document.querySelector('.bighaat-carousel-container') || document.querySelector('.home-hero-section');
    const slides = document.querySelectorAll('.home-hero-slide-item');
    const dots = document.querySelectorAll('.bighaat-carousel-dot, .hero-dot-indicator');
    const prevBtn = document.querySelector('.bighaat-carousel-arrow.prev');
    const nextBtn = document.querySelector('.bighaat-carousel-arrow.next');

    if (!slides.length) return;

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      slides.forEach((s, idx) => {
        if (idx === index) {
          s.style.display = 'block';
          s.style.opacity = '0';
          s.style.transition = 'opacity 0.4s ease';
          requestAnimationFrame(() => {
            s.style.opacity = '1';
          });
        } else {
          s.style.display = 'none';
        }
      });

      dots.forEach((d, idx) => {
        if (idx === index) {
          d.classList.add('active');
          d.style.background = '#16a34a';
          d.style.width = '28px';
        } else {
          d.classList.remove('active');
          d.style.background = '#cbd5e1';
          d.style.width = '8px';
        }
      });

      heroSlideIndex = index;
    }

    function startAutoSlide() {
      if (heroSlideTimer) clearInterval(heroSlideTimer);
      heroSlideTimer = setInterval(() => {
        showSlide(heroSlideIndex + 1);
      }, 5000);
    }

    function stopAutoSlide() {
      if (heroSlideTimer) clearInterval(heroSlideTimer);
    }

    showSlide(0);

    if (slides.length > 1) {
      startAutoSlide();

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          showSlide(heroSlideIndex - 1);
          startAutoSlide();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          showSlide(heroSlideIndex + 1);
          startAutoSlide();
        });
      }

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          showSlide(idx);
          startAutoSlide();
        });
      });

      if (container) {
        container.addEventListener('mouseenter', stopAutoSlide);
        container.addEventListener('mouseleave', startAutoSlide);

        // Touch Swipe for Mobile
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) {
              showSlide(heroSlideIndex + 1); // Swipe left -> Next
            } else {
              showSlide(heroSlideIndex - 1); // Swipe right -> Prev
            }
            startAutoSlide();
          }
        }, { passive: true });
      }
    }
  }

  if (typeof window.initPanoramicCarousel !== 'function') {
    window.initPanoramicCarousel = initHeroCarousel;
  }

  // -------------------------------------------------------------
  // 3. HEALTH DISEASE CONSULTATION CARDS (10 GLOWING BLUE CARDS)
  // -------------------------------------------------------------
  async function loadHealthDiseaseCards() {
    const grid = document.getElementById('health-diseases-grid');
    if (!grid) return;

    let list = [...DEFAULT_HEALTH_DISEASES];

    try {
      const config = getHomeCmsConfig();
      if (Array.isArray(config.health_diseases) && config.health_diseases.length > 0) {
        list = config.health_diseases;
      } else {
        const cacheTime = Math.floor(Date.now() / 300000);
        const urls = ['data/health-diseases.json', '/data/health-diseases.json', '../data/health-diseases.json'];
        for (const url of urls) {
          try {
            const res = await fetch(url + '?v=' + cacheTime);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data.diseases) && data.diseases.length > 0) {
                list = data.diseases;
                break;
              }
            }
          } catch (err) { }
        }
      }
    } catch (e) {
      console.warn('[Home Revamp] Error loading health disease cards:', e);
    }

    if (!list || !list.length) return;

    // Show compact top 4 on home page
    const compactList = list.slice(0, 4);

    const subPageMap = {
      'DIS001': '/health/diabetes.html',
      'DIS002': '/health/joint-care.html',
      'DIS003': '/health/womens-care.html',
      'DIS004': '/health/hair-care.html',
      'DIS005': '/health/skin-care.html'
    };

    grid.innerHTML = compactList.map(item => {
      const title = item.name || item.title || 'स्वास्थ्य समस्या';
      const desc = item.description || item.desc || '';
      const remedy = item.solution || item.remedy || 'प्राकृतिक आयुर्वेदिक परामर्श व आहार संतुलन।';
      const color = item.color || '#3b82f6';
      const icon = item.icon || '🩺';
      const badge = item.badge || 'परामर्श उपलब्ध';
      const symptomsList = Array.isArray(item.symptoms) ? item.symptoms : (item.symptoms ? [item.symptoms] : []);
      const subPageLink = subPageMap[item.id] || '/categories/health.html';

      const safeTitle = title.replace(/"/g, '&quot;');
      const safeDesc = desc.replace(/"/g, '&quot;');

      return `
        <div class="health-disease-card" style="border-top: 4px solid ${color}; padding:0; overflow:hidden;">
          <div style="height:150px; overflow:hidden; position:relative; background:#0f172a; cursor:pointer;" onclick="window.location.href='${subPageLink}'" title="${safeTitle} - विस्तार से देखें">
            <img src="${item.image || '/images/banners/health-banner.jpeg'}" alt="${safeTitle}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/health-banner.jpeg'" />
            <span style="position:absolute; top:10px; left:10px; background:${color}; color:#ffffff; font-size:0.72rem; font-weight:900; padding:3px 10px; border-radius:20px; box-shadow:0 3px 8px rgba(0,0,0,0.35);">
              ${badge}
            </span>
          </div>

          <div style="padding:18px;">
            <div class="health-card-top" style="margin-bottom:10px;">
              <div class="health-card-icon-box" style="color:${color};">
                ${icon}
              </div>
              <div style="flex:1;">
                <h3 style="font-size:1.15rem;font-weight:900;margin:0;color:#ffffff;">
                  <a href="${subPageLink}" style="color:#ffffff; text-decoration:none;">${title}</a>
                </h3>
              </div>
            </div>

            <div style="font-size:0.86rem;color:#bfdbfe;margin-bottom:10px;line-height:1.45;">
              ${desc}
            </div>

            ${symptomsList.length > 0 ? `
              <div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:4px;">
                ${symptomsList.slice(0, 3).map(s => `<span class="health-symptom-tag" style="font-size:0.7rem;padding:2px 6px;">• ${s}</span>`).join('')}
              </div>
            ` : ''}

            <div style="background:rgba(15,23,42,0.6);padding:10px 12px;border-radius:10px;border:1px solid rgba(59,130,246,0.25);margin-bottom:12px;">
              <div style="font-size:0.75rem;font-weight:800;color:#fde047;margin-bottom:3px;">
                🌿 आयुर्वेदिक उपचार:
              </div>
              <div style="font-size:0.82rem;color:#e2e8f0;line-height:1.4;">
                ${remedy}
              </div>
            </div>

            <div class="kpi-actions-row">
              <a href="${subPageLink}" class="btn" style="background:rgba(255,255,255,0.15); color:#fff; font-size:0.8rem; font-weight:800; padding:8px 12px; border-radius:10px; text-decoration:none; white-space:nowrap;">
                विस्तार से →
              </a>
              <button type="button" class="kpi-audio-btn" onclick="window.playKpiCardAudio(event, '${safeTitle}', '${safeDesc}')" title="ऑडियो विवरण सुनें">
                <i class="fa-solid fa-volume-high"></i>
                <span>ऑडियो</span>
              </button>
              <button type="button" class="kpi-blue-share-btn" onclick="window.triggerKpiNativeShare(event, '${safeTitle}', '${safeDesc}', '${subPageLink}')" title="शेयर करें">
                <i class="fa-solid fa-share-nodes"></i>
                <span>Share</span>
              </button>
              <button type="button" onclick="window.consultAiExpert('${safeTitle}', '${safeDesc}')" class="ai-expert-red-btn" style="flex:1; margin:0; padding:8px 12px; font-size:0.82rem; border-radius:10px;">
                <i class="fa-brands fa-whatsapp"></i>
                <span>सलाह लें</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------------
  // 4. MAJOR CROPS PROTECTION CARDS (8 CARDS)
  // -------------------------------------------------------------
  async function loadCropProtectionCards() {
    const grid = document.getElementById('major-crops-grid');
    if (!grid) return;

    let list = [...DEFAULT_CROPS];

    try {
      const config = getHomeCmsConfig();
      if (Array.isArray(config.crops) && config.crops.length > 0) {
        list = config.crops;
      } else {
        const cacheTime = Math.floor(Date.now() / 300000);
        const urls = ['data/crop-cards.json', '/data/crop-cards.json', '../data/crop-cards.json'];
        for (const url of urls) {
          try {
            const res = await fetch(url + '?v=' + cacheTime);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data.crops) && data.crops.length > 0) {
                list = data.crops;
                break;
              }
            }
          } catch (err) { }
        }
      }
    } catch (e) {
      console.warn('[Home Revamp] Error loading crop cards:', e);
    }

    if (!list || !list.length) return;

    const compactCrops = list.slice(0, 4);

    grid.innerHTML = compactCrops.map(item => {
      const name = item.name || item.cropName || 'फसल';
      const season = item.season || 'प्रमुख फसल';
      const image = item.image || '/images/crops/soyabeen.jpeg';
      const issues = Array.isArray(item.mainIssues) ? item.mainIssues.join(', ') : (item.issues || item.mainIssues || 'कीट व रोग');
      const solution = item.solution || 'सटीक स्प्रे व पोषण प्रबंधन।';
      const safeName = name.replace(/"/g, '&quot;');
      const safeIssues = issues.replace(/"/g, '&quot;');
      const cropPageLink = '/ebooks/agriculture.html';

      return `
        <div class="agri-item-card">
          <div class="agri-card-img-wrap" style="height:150px; position:relative; overflow:hidden; background:#0f172a; cursor:pointer;" onclick="window.location.href='${cropPageLink}'" title="${safeName} - कृषि हब पर देखें">
            <img src="${image}" alt="${safeName}" loading="lazy" onerror="this.src='/images/crops/soyabeen.jpeg'" style="width:100%; height:100%; object-fit:cover;" />
            <span style="position:absolute;top:10px;left:10px;background:#15803d;color:#ffffff;font-size:0.72rem;font-weight:900;padding:3px 10px;border-radius:20px;box-shadow:0 3px 8px rgba(0,0,0,0.3);">
              ${season}
            </span>
          </div>

          <div class="agri-card-content">
            <div>
              <h3 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:0 0 6px 0;">
                <a href="${cropPageLink}" style="color:#ffffff;text-decoration:none;">🌾 ${name}</a>
              </h3>
              <div style="font-size:0.84rem;color:#bfdbfe;margin-bottom:8px;line-height:1.4;">
                <strong style="color:#fde047;">मुख्य समस्याएं:</strong> ${issues}
              </div>
              <div style="background:rgba(15,23,42,0.6);padding:8px 10px;border-radius:8px;border:1px solid rgba(59,130,246,0.25);font-size:0.8rem;color:#cbd5e1;line-height:1.4;">
                <span style="color:#86efac;font-weight:800;">✓ सटीक उपाय:</span> ${solution}
              </div>
            </div>

            <div class="kpi-actions-row">
              <a href="${cropPageLink}" class="btn" style="background:rgba(255,255,255,0.15); color:#fff; font-size:0.8rem; font-weight:800; padding:8px 12px; border-radius:10px; text-decoration:none; white-space:nowrap;">
                विस्तार से →
              </a>
              <button type="button" class="kpi-audio-btn" onclick="window.playKpiCardAudio(event, '${safeName} फसल सुरक्षा', 'समस्याएं: ${safeIssues}')" title="ऑडियो सुनें">
                <i class="fa-solid fa-volume-high"></i>
                <span>ऑडियो</span>
              </button>
              <button type="button" class="kpi-blue-share-btn" onclick="window.triggerKpiNativeShare(event, '${safeName} फसल सुरक्षा', 'समस्याएं: ${safeIssues}', '${cropPageLink}')" title="शेयर करें">
                <i class="fa-solid fa-share-nodes"></i>
                <span>Share</span>
              </button>
              <button type="button" onclick="window.consultAiExpert('${safeName} फसल सुरक्षा', 'समस्याएं: ${safeIssues}')" class="ai-expert-red-btn" style="flex:1; margin:0; padding:8px 12px; font-size:0.82rem; border-radius:10px;">
                <i class="fa-brands fa-whatsapp"></i>
                <span>सलाह लें</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------------
  // 5. PASHU PALAN & LIVESTOCK CARDS (6 CARDS)
  // -------------------------------------------------------------
  async function loadPashuPalanCards() {
    const grid = document.getElementById('pashu-palan-grid');
    if (!grid) return;

    let list = [...DEFAULT_PASHU_CARDS];

    try {
      const config = getHomeCmsConfig();
      if (Array.isArray(config.pashu_cards) && config.pashu_cards.length > 0) {
        list = config.pashu_cards;
      } else {
        const cacheTime = Math.floor(Date.now() / 300000);
        const urls = ['data/pashu-cards.json', '/data/pashu-cards.json', '../data/pashu-cards.json'];
        for (const url of urls) {
          try {
            const res = await fetch(url + '?v=' + cacheTime);
            if (res.ok) {
              const data = await res.json();
              const pashuList = data.livestock || data.pashu || [];
              if (Array.isArray(pashuList) && pashuList.length > 0) {
                list = pashuList;
                break;
              }
            }
          } catch (err) { }
        }
      }
    } catch (e) {
      console.warn('[Home Revamp] Error loading pashu cards:', e);
    }

    if (!list || !list.length) return;

    const compactPashu = list.slice(0, 3);

    grid.innerHTML = compactPashu.map(item => {
      const name = item.name || item.animalName || 'पशु पालन';
      const icon = item.icon || '🐄';
      const badge = item.badge || 'पशु पोषण';
      const issues = Array.isArray(item.mainIssues) ? item.mainIssues.join(', ') : (item.issues || item.mainIssues || 'दूध व स्वास्थ्य समस्याएं');
      const solution = item.solution || 'आयुर्वेदिक मिनरल व पोषण आहार।';
      const safeName = name.replace(/"/g, '&quot;');
      const safeIssues = issues.replace(/"/g, '&quot;');
      const pashuPageLink = '/pashu-palan.html';

      return `
        <div class="agri-item-card">
          <div class="agri-card-img-wrap" style="height:150px; position:relative; overflow:hidden; background:#0f172a; cursor:pointer;" onclick="window.location.href='${pashuPageLink}'" title="${safeName} - पशु पालन हब पर देखें">
            <img src="${item.image || '/images/banners/pashu-palan-banner.jpg'}" alt="${safeName}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/pashu-palan-banner.jpg'" />
            <span style="position:absolute;top:10px;left:10px;background:#0284c7;color:#ffffff;font-size:0.72rem;font-weight:900;padding:3px 10px;border-radius:20px;box-shadow:0 3px 8px rgba(0,0,0,0.35);">
              ${badge}
            </span>
          </div>

          <div class="agri-card-content">
            <div>
              <h3 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:0 0 6px 0;">
                <a href="${pashuPageLink}" style="color:#ffffff;text-decoration:none;">${icon} ${name}</a>
              </h3>
              <div style="font-size:0.84rem;color:#bfdbfe;margin-bottom:8px;line-height:1.4;">
                <strong style="color:#fde047;">प्रमुख लक्ष्य:</strong> ${issues}
              </div>
              <div style="background:rgba(15,23,42,0.6);padding:8px 10px;border-radius:8px;border:1px solid rgba(59,130,246,0.25);font-size:0.8rem;color:#cbd5e1;line-height:1.4;">
                <span style="color:#86efac;font-weight:800;">✓ पोषण फॉर्मूला:</span> ${solution}
              </div>
            </div>

            <div class="kpi-actions-row">
              <a href="${pashuPageLink}" class="btn" style="background:rgba(255,255,255,0.15); color:#fff; font-size:0.8rem; font-weight:800; padding:8px 12px; border-radius:10px; text-decoration:none; white-space:nowrap;">
                विस्तार से →
              </a>
              <button type="button" class="kpi-audio-btn" onclick="window.playKpiCardAudio(event, '${safeName}', 'विवरण: ${safeIssues}')" title="ऑडियो सुनें">
                <i class="fa-solid fa-volume-high"></i>
                <span>ऑडियो</span>
              </button>
              <button type="button" class="kpi-blue-share-btn" onclick="window.triggerKpiNativeShare(event, '${safeName}', 'विवरण: ${safeIssues}', '${pashuPageLink}')" title="शेयर करें">
                <i class="fa-solid fa-share-nodes"></i>
                <span>Share</span>
              </button>
              <button type="button" onclick="window.consultAiExpert('${safeName}', 'विवरण: ${safeIssues}')" class="ai-expert-red-btn" style="flex:1; margin:0; padding:8px 12px; font-size:0.82rem; border-radius:10px;">
                <i class="fa-brands fa-whatsapp"></i>
                <span>सलाह लें</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------------
  // 6. ACHIEVERS SCROLLING MARQUEE
  // -------------------------------------------------------------
  async function loadAchieversShowcase() {
    const track = document.getElementById('achievers-track-inner');
    if (!track) return;

    let list = [...DEFAULT_ACHIEVERS];

    try {
      const directAchievers = localStorage.getItem('AAROGYAM_ACHIEVERS_CONFIG');
      if (directAchievers) {
        const parsed = JSON.parse(directAchievers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } else {
        const config = getHomeCmsConfig();
        if (Array.isArray(config.achievers) && config.achievers.length > 0) {
          list = config.achievers;
        } else {
          const cacheTime = Math.floor(Date.now() / 300000);
          const urls = ['data/achievers.json', '/data/achievers.json', '../data/achievers.json'];
          for (const url of urls) {
            try {
              const res = await fetch(url + '?v=' + cacheTime);
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.achievers) && data.achievers.length > 0) {
                  list = data.achievers;
                  break;
                }
              }
            } catch (err) { }
          }
        }
      }
    } catch (e) {
      console.warn('[Home Revamp] Error loading achievers:', e);
    }

    if (!list || !list.length) return;

    const doubleList = [...list, ...list];

    track.innerHTML = doubleList.map(item => `
      <div class="achiever-badge-card" style="border-top: 4px solid ${item.badgeColor || '#f59e0b'};">
        <div>
          <!-- Top Row: Avatar & Details -->
          <div style="display:flex;align-items:flex-start;gap:14px;">
            <div class="achiever-avatar-circle" style="border: 2px solid ${item.badgeColor || '#f59e0b'}; overflow:hidden; padding:0; display:flex; align-items:center; justify-content:center; width:52px; height:52px; border-radius:50%; background:#1e293b;">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100\%;height:100\%;object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span style="display:none;font-size:1.8rem;">${item.avatar || '👨‍💼'}</span>` : `<span style="font-size:1.8rem;">${item.avatar || '👨‍💼'}</span>`}
            </div>
            <div style="flex:1;">
              <h3 class="achiever-name-en">
                ${item.name}
              </h3>
              <span class="achiever-name-hi">
                ${item.nameHindi || ''}
              </span>
              <div>
                <span class="achiever-rank-tag" style="background:${item.badgeBg || 'rgba(245,158,11,0.15)'};color:${item.badgeColor || '#f59e0b'};border:1px solid ${item.badgeColor || '#f59e0b'}50;">
                  ${item.rank}
                </span>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div style="font-size:0.78rem;color:#94a3b8;margin:12px 0 6px 0;display:flex;align-items:center;gap:6px;">
            <i class="fa-solid fa-location-dot" style="color:#ef4444;font-size:0.85rem;"></i>
            <span>${item.location}</span>
          </div>

          <!-- Achievement Highlight -->
          <div class="achiever-achievement-box">
            <span style="color:#fde047;font-weight:800;">🏆 उपलब्धि:</span> ${item.achievement}
          </div>
        </div>

        <!-- Quote -->
        <div class="achiever-quote-box">
          <i class="fa-solid fa-quote-left" style="color:rgba(255,255,255,0.25);margin-right:5px;"></i>
          ${item.quote}
        </div>
      </div>
    `).join('');
  }

  // -------------------------------------------------------------
  // 7. KINDLE 3D BEST SELLERS SHELVES (ZERO DUPLICATE BOOKS)
  // -------------------------------------------------------------
  async function loadKindleBestsellers() {
    const grid = document.getElementById('home-kindle-bestsellers-grid');
    if (!grid) return;

    let bestsellers = [
      {
        id: 'BK001',
        title: 'खरीफ फसल मास्टर गाइड 2026',
        subtitle: 'धान, सोयाबीन, मक्का व कपास की सम्पूर्ण सचित्र वैज्ञानिक गाइड',
        price: '₹99',
        oldPrice: '₹299',
        image: '/images/books/kharif-master-guide-2026-cover.webp',
        link: '/ebooks/kharif-master-guide-2026.html',
        tag: '🔥 सर्वाधिक लोकप्रिय'
      },
      {
        id: 'BK002',
        title: 'खेती का डॉक्टर (Pocket Doctor)',
        subtitle: 'फसल के 50+ रोगों, कीटों व पोषक तत्वों की कमी की फोटो सहित पहचान व तत्काल स्प्रे फॉर्मूला',
        price: '₹99',
        oldPrice: '₹299',
        image: '/images/books/fasal-ka-doctor-cover.webp',
        link: '/ebooks/kheti-dr.html',
        tag: '🩺 किसान का डॉक्टर'
      }
    ];

    try {
      let jsonBooks = [];
      let jsonLp = [];
      try {
        const [rB, rL] = await Promise.all([
          fetch('/data/books.json?v=' + Date.now()).then(r => r.ok ? r.json() : {}).catch(() => ({})),
          fetch('/data/universal-book-landing-pages.json?v=' + Date.now()).then(r => r.ok ? r.json() : {}).catch(() => ({}))
        ]);
        jsonBooks = rB.books || [];
        jsonLp = rL.bookLandingPages || [];
      } catch (e) { }

      let customBooks = [];
      let customLp = [];
      try {
        customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
        customLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
      } catch (e) { }

      const allActive = [...jsonBooks, ...jsonLp, ...customBooks, ...customLp].filter(b => {
        if (!b || !b.id) return false;
        const bIdUpper = b.id.toUpperCase();
        if (bIdUpper === 'BK001' || bIdUpper === 'BK002') return false;
        if (b.status === 'draft' || b.status === 'inactive' || b.isComingSoon || b.is_coming_soon) return false;
        return true;
      });

      allActive.forEach(b => {
        const hero = b.hero || {};
        const bId = b.id.toUpperCase();
        if (!bestsellers.some(x => x.id === bId)) {
          bestsellers.push({
            id: bId,
            title: hero.title || b.heading || b.name || bId,
            subtitle: hero.subtitle || b.subtitle || 'सम्पूर्ण प्रैक्टिकल गाइड',
            price: `₹${hero.offer_price || b.offerPrice || 99}`,
            oldPrice: `₹${hero.mrp || b.mrp || 299}`,
            image: hero.cover_image || b.cover || b.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
            link: `/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`,
            tag: b.store_badge === 'new_arrival' ? '🆕 New Arrival' : '⭐ Bestseller'
          });
        }
      });
    } catch (e) { }

    // Guarantee zero duplicates by ID and title
    const seenKeys = new Set();
    const uniqueBestsellers = [];
    bestsellers.forEach(book => {
      const key = String(book.id || book.title).trim().toUpperCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueBestsellers.push(book);
      }
    });

    grid.innerHTML = uniqueBestsellers.map(book => `
      <div class="shelf-book-card" style="background:#ffffff;border:1.5px solid #e2e8f0;border-radius:18px;padding:18px;display:flex;gap:18px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,0.06);flex-wrap:wrap;">
        <div class="kindle-book-cover-3d" style="width:110px;height:150px;flex-shrink:0;cursor:pointer;" onclick="window.location.href='${book.link}'">
          <img src="${book.image}" alt="${book.title}" style="width:100%;height:100%;object-fit:cover;border-radius:6px 12px 12px 6px;box-shadow:-6px 8px 20px rgba(0,0,0,0.35);" />
        </div>
        <div style="flex:1;min-width:200px;">
          <span style="background:#fef08a;color:#854d0e;font-size:0.72rem;font-weight:900;padding:3px 10px;border-radius:20px;display:inline-block;margin-bottom:6px;">
            ${book.tag}
          </span>
          <h3 style="font-size:1.15rem;font-weight:900;margin:0 0 6px 0;color:#0f172a;">
            ${book.title}
          </h3>
          <p style="font-size:0.84rem;color:#64748b;margin:0 0 12px 0;line-height:1.4;">
            ${book.subtitle}
          </p>
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:1.3rem;font-weight:900;color:#16a34a;">${book.price}</span>
            <span style="font-size:0.9rem;color:#94a3b8;text-decoration:line-through;">${book.oldPrice}</span>
            <a href="${book.link}" class="btn" style="background:#facc15;color:#000;font-weight:900;font-size:0.85rem;padding:8px 18px;border-radius:20px;text-decoration:none;margin-left:auto;">
              ⚡ ऑर्डर करें
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // -------------------------------------------------------------
  // 8. USER REVIEWS SUBMISSION & LOCALSTORAGE SYNC
  // -------------------------------------------------------------
  window.openSubmitReviewModal = function () {
    let modal = document.getElementById('user-review-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'user-review-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.75);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
      modal.innerHTML = `
        <div style="background:#ffffff;border-radius:22px;max-width:500px;width:100%;padding:26px;box-shadow:0 20px 50px rgba(0,0,0,0.3);position:relative;border:1.5px solid #cbd5e1;max-height:90vh;overflow-y:auto;box-sizing:border-box;">
          <button type="button" onclick="document.getElementById('user-review-modal').remove()" style="position:absolute;top:16px;right:16px;background:#f1f5f9;border:none;width:34px;height:34px;border-radius:50%;font-size:1.1rem;font-weight:900;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
          
          <div style="text-align:center;margin-bottom:18px;">
            <div style="width:50px;height:50px;border-radius:50%;background:#dcfce7;color:#16a34a;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:8px;">✍️</div>
            <h3 style="margin:0;font-size:1.3rem;font-weight:900;color:#0f172a;">अपना रिव्यू / अनुभव साझा करें</h3>
            <p style="margin:4px 0 0 0;font-size:0.84rem;color:#64748b;">Aarogyam India परिवार के साथ अपना बहुमूल्य फीडबैक शेयर करें</p>
          </div>

          <form id="aarogyam-review-form" onsubmit="window.handleReviewFormSubmit(event)">
            <div style="margin-bottom:14px;">
              <label style="display:block;font-size:0.84rem;font-weight:800;color:#334155;margin-bottom:5px;">आपका पूरा नाम *</label>
              <input type="text" id="review-user-name" required placeholder="उदा. रमेश पटेल" style="width:100%;padding:10px 14px;border:1.5px solid #cbd5e1;border-radius:12px;font-size:0.9rem;box-sizing:border-box;" />
            </div>

            <div style="margin-bottom:14px;display:flex;gap:12px;">
              <div style="flex:1;">
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#334155;margin-bottom:5px;">स्थान / ज़िला *</label>
                <input type="text" id="review-user-location" required placeholder="उदा. रीवा, मध्य प्रदेश" style="width:100%;padding:10px 14px;border:1.5px solid #cbd5e1;border-radius:12px;font-size:0.9rem;box-sizing:border-box;" />
              </div>
              <div style="width:120px;">
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#334155;margin-bottom:5px;">रेटिंग *</label>
                <select id="review-user-rating" style="width:100%;padding:10px;border:1.5px solid #cbd5e1;border-radius:12px;font-size:0.9rem;background:#fff;box-sizing:border-box;">
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <label style="display:block;font-size:0.84rem;font-weight:800;color:#334155;margin-bottom:5px;">संबंधित विषय *</label>
              <select id="review-user-topic" style="width:100%;padding:10px 14px;border:1.5px solid #cbd5e1;border-radius:12px;font-size:0.9rem;background:#fff;box-sizing:border-box;">
                <option value="कृषि ई-बुक्स">🌱 कृषि ई-बुक्स व फसल डॉक्टर</option>
                <option value="पशु पालन व दुग्ध">🐄 पशु पालन व दुग्ध वृद्धि</option>
                <option value="स्वास्थ्य व वेलनेस">❤️ स्वास्थ्य परामर्श व हर्बल सप्लीमेंट्स</option>
                <option value="डिजिटल बिज़नेस">💼 डिजिटल करियर व Netsurf ग्रोथ</option>
              </select>
            </div>

            <div style="margin-bottom:18px;">
              <label style="display:block;font-size:0.84rem;font-weight:800;color:#334155;margin-bottom:5px;">आपका अनुभव व समीक्षा *</label>
              <textarea id="review-user-text" rows="3" required placeholder="आपको ई-बुक या सेवा से क्या लाभ मिला..." style="width:100%;padding:10px 14px;border:1.5px solid #cbd5e1;border-radius:12px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
            </div>

            <button type="submit" style="width:100%;background:#16a34a;color:#fff;border:none;padding:12px;border-radius:30px;font-weight:900;font-size:0.95rem;cursor:pointer;box-shadow:0 6px 18px rgba(22,163,74,0.35);">
              ✓ समीक्षा सबमिट करें
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }
  };

  window.handleReviewFormSubmit = function (e) {
    e.preventDefault();
    const name = document.getElementById('review-user-name')?.value?.trim();
    const loc = document.getElementById('review-user-location')?.value?.trim();
    const rating = parseInt(document.getElementById('review-user-rating')?.value || '5', 10);
    const topic = document.getElementById('review-user-topic')?.value || 'सामान्य';
    const text = document.getElementById('review-user-text')?.value?.trim();

    if (!name || !text) return;

    const newRev = {
      id: 'REV_' + Date.now(),
      name,
      location: loc,
      rating,
      topic,
      text,
      date: new Date().toLocaleDateString('hi-IN')
    };

    try {
      const existing = JSON.parse(localStorage.getItem('aarogyam_user_reviews') || '[]');
      existing.unshift(newRev);
      localStorage.setItem('aarogyam_user_reviews', JSON.stringify(existing));
    } catch (err) { }

    // Close modal
    const modal = document.getElementById('user-review-modal');
    if (modal) modal.remove();

    // Render immediately into review grid
    renderSavedReviews();

    alert('धन्यवाद ' + name + '! आपका रिव्यू सफलतापूर्वक दर्ज कर लिया गया है।');
  };

  function renderSavedReviews() {
    try {
      const saved = JSON.parse(localStorage.getItem('aarogyam_user_reviews') || '[]');
      const grid = document.getElementById('home-reviews-grid');
      if (!grid || !saved.length) return;

      const stars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

      saved.forEach(r => {
        if (document.getElementById(r.id)) return;
        const card = document.createElement('div');
        card.id = r.id;
        card.style.cssText = 'background:#ffffff;border:2px solid #86efac;border-radius:18px;padding:22px;box-shadow:0 8px 24px rgba(22,163,74,0.1);position:relative;';
        card.innerHTML = `
          <span style="position:absolute;top:12px;right:14px;background:#dcfce7;color:#15803d;font-size:0.7rem;font-weight:900;padding:2px 8px;border-radius:12px;">नया रिव्यू</span>
          <div style="color:#facc15;font-size:1rem;margin-bottom:8px;">${stars(r.rating)}</div>
          <p style="font-size:0.88rem;color:#334155;line-height:1.5;margin-bottom:14px;">
            "${r.text}"
          </p>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:42px;height:42px;border-radius:50%;background:#dcfce7;border:1.5px solid #16a34a;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">👤</div>
            <div>
              <h4 style="font-size:0.95rem;font-weight:800;margin:0;color:#0f172a;">${r.name}</h4>
              <div style="font-size:0.75rem;color:#64748b;">📍 ${r.location || 'भारत'} • <span style="color:#16a34a;font-weight:700;">${r.topic}</span></div>
            </div>
          </div>
        `;
        grid.prepend(card);
      });
    } catch (e) { }
  }

  // -------------------------------------------------------------
  // INITIALIZATION TRIGGER (Robust for all DOM States)
  // -------------------------------------------------------------
  function startHomeRevampEngine() {
    initHomeCmsLoader();
    initHeroCarousel();
    loadHealthDiseaseCards();
    loadCropProtectionCards();
    loadPashuPalanCards();
    loadAchieversShowcase();
    loadKindleBestsellers();
    renderSavedReviews();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startHomeRevampEngine);
  } else {
    startHomeRevampEngine();
  }

})();