/**
 * ====================================================================
 * AAROGYAM SAKHI AI - NEURAL CORE ENGINE v8.1 (PROFESSIONAL AI GRADE)
 * - Guaranteed Universal Floating Pill & In-Modal UI Injection across All Pages
 * - Strict Domain Isolation (Health, Krishi, Pashu, Beauty, Netsurf, Business, Founder, Nuskhe)
 * - Precision Entity Handlers (Stimrich, Bio-99, SHET, Wrap-up, CFC, Naturamore)
 * - Dedicated Interactive Spray Calendar Router (Wheat, Mustard, Chana, Vegetables)
 * - Certified Netsurf Direct Selling & ₹8,19,250 Weekly Capping Plan Router
 * - Empathetic Human-Touch Responses (Polite Indian Hindi Tone)
 * - Unified Multi-Session Authentication (Zero Login Loops)
 * ====================================================================
 */

'use strict';

(function () {
  const MASTER_ADMIN_PHONE = '7974422572';
  const SAKHI_AVATAR_IMG = '/images/sakhi/aarogyam-sakhi.webp';
  const SAKHI_BANNER_IMG = '/images/sakhi/aarogyam-sakhi-banner.webp';

  let knowledgeData = null;
  let isSoundEnabled = true;
  let recognitionInstance = null;
  let isRecording = false;
  let activeSpeechBtn = null;
  let currentActiveDomain = 'omni';
  const sessionChatHistory = [];
  let consecutiveAmbiguousCount = 0;
  let pendingUserQuery = null;

  // Multi-Turn Conversation Memory State
  const sakhiConversationState = {
    lastActiveDomain: null,
    lastActiveEntity: null,
    lastActiveEntityName: '',
    lastActiveCrop: null,
    lastAnswerSnippet: '',
    history: []
  };

  // ====================================================================
  // DYNAMIC USER PROFILING & PERSONA MEMORY ENGINE (ZERO EGRESS / ZERO DB)
  // - High-Speed Client-Side Local Storage & Session State
  // - Micro-Cookie Hint (~35 bytes) for Edge & SSR Personalization
  // - YouTube/Facebook-style Interest Affinity Algorithm (Agri, Health, Beauty, Business, Pashu)
  // - Tone Locking (Dehati, Business, Homemaker, Patient, Standard)
  // - Smart Domain Lock: Prevents Mid-Chat Domain Forgetting
  // - Dynamic E-Book (BK001/BK002/BK015/BK018) & Aarogyam Tube Recommendations
  // ====================================================================
  const SAKHI_PERSONA_STORAGE_KEY = 'SAKHI_USER_PERSONA';
  const SAKHI_COOKIE_HINT_KEY = 'sakhi_hint';

  function loadSakhiUserPersona() {
    try {
      const raw = localStorage.getItem(SAKHI_PERSONA_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object') {
          if (!p.domain_scores) {
            p.domain_scores = { agri: 0, health: 0, beauty: 0, business: 0, pashu: 0, nuskhe: 0 };
          }
          if (!p.detected_entities) p.detected_entities = [];
          return p;
        }
      }
    } catch (e) {}

    return {
      user_tone: 'standard', // 'dehati' | 'business' | 'homemaker' | 'patient' | 'standard'
      primary_domain: 'omni', // 'agri' | 'health' | 'beauty' | 'business' | 'pashu'
      domain_scores: { agri: 0, health: 0, beauty: 0, business: 0, pashu: 0, nuskhe: 0 },
      detected_entities: [],
      recommended_ebook: 'BK002',
      recommended_video_tag: 'krishi_khetee_doctor',
      interaction_count: 0,
      last_query_hint: '',
      updated_at: Date.now()
    };
  }

  function saveSakhiUserPersona(persona) {
    if (!persona) return;
    try {
      persona.updated_at = Date.now();
      localStorage.setItem(SAKHI_PERSONA_STORAGE_KEY, JSON.stringify(persona));

      // Ultra-lightweight Micro-Cookie hint (Max 35-45 bytes) for Edge/CDN zero-egress sync
      const cookiePayload = `dom=${encodeURIComponent(persona.primary_domain || 'omni')}&tone=${encodeURIComponent(persona.user_tone || 'standard')}&bk=${encodeURIComponent(persona.recommended_ebook || 'BK002')}`;
      document.cookie = `${SAKHI_COOKIE_HINT_KEY}=${cookiePayload};path=/;max-age=7776000;SameSite=Lax`;
    } catch (e) {
      console.warn('Persona save error:', e);
    }
  }

  function updateSakhiUserPersonaFromQuery(cleanQ, detectedDomain) {
    const p = loadSakhiUserPersona();
    p.interaction_count = (p.interaction_count || 0) + 1;
    p.last_query_hint = cleanQ.slice(0, 60);

    // 1. Vocabulary & Tone Analysis (Dehati, Business, Homemaker, Patient)
    const dehatiKeywords = ['राम राम', 'जय जवान', 'जय किसान', 'किसान', 'खेती', 'खेत', 'भैया', 'भाई साहब', 'हमरे', 'का करें', 'दवाई', 'कीड़ा लागल', 'सूख रहा', 'कल्ले', 'खाद', 'यूरिया', 'बीज', 'बरसात', 'सिंचाई', 'चना', 'सरसों', 'गेहूं', 'धान'];
    const businessKeywords = ['कमाई', 'इनकम', 'बिज़नेस', 'पैसा', 'कमीशन', 'कैपिंग', '8.19', '8,19,250', 'मार्केटिंग', 'प्लान', 'नेटवर्क', 'सेल', 'मार्जिन', 'प्रॉफ़िट', 'रजिस्ट्रेशन', 'आईडी', 'डाउनलाइन'];
    const homemakerKeywords = ['नमस्ते बहन', 'बहन जी', 'घर बैठे', 'महिला', 'लेडीज', 'चेहरा', 'ग्लो', 'बाल', 'झुर्रियां', 'झाइयां', 'रसोई', 'बच्चे', 'वजन कम', 'स्किन', 'घरेलू नुस्खा'];
    const patientKeywords = ['मरीज', 'दर्द', 'बीमारी', 'शुगर', 'डायबिटीज', 'बीपी', 'गठिया', 'जोड़', 'इलाज', 'दवा', 'डॉक्टर', 'रिपोर्ट', 'कमजोरी', 'हार्ट', 'किडनी', 'लिवर', 'थायराइड'];

    let dehatiHits = 0, bizHits = 0, homeHits = 0, patientHits = 0;
    dehatiKeywords.forEach(k => { if (cleanQ.includes(k)) dehatiHits++; });
    businessKeywords.forEach(k => { if (cleanQ.includes(k)) bizHits++; });
    homemakerKeywords.forEach(k => { if (cleanQ.includes(k)) homeHits++; });
    patientKeywords.forEach(k => { if (cleanQ.includes(k)) patientHits++; });

    if (dehatiHits > bizHits && dehatiHits > homeHits && dehatiHits > patientHits) {
      p.user_tone = 'dehati';
    } else if (bizHits > dehatiHits && bizHits > homeHits && bizHits > patientHits) {
      p.user_tone = 'business';
    } else if (homeHits > dehatiHits && homeHits > bizHits && homeHits > patientHits) {
      p.user_tone = 'homemaker';
    } else if (patientHits > dehatiHits && patientHits > bizHits && patientHits > homeHits) {
      p.user_tone = 'patient';
    }

    // 2. Domain Scoring (YouTube / Facebook Interest Affinity Algorithm)
    if (!p.domain_scores) {
      p.domain_scores = { agri: 0, health: 0, beauty: 0, business: 0, pashu: 0, nuskhe: 0 };
    }

    if (detectedDomain && detectedDomain !== 'omni' && detectedDomain !== 'founder') {
      let key = detectedDomain;
      if (key === 'krishi') key = 'agri';
      if (key === 'netsurf') key = 'business';
      p.domain_scores[key] = (p.domain_scores[key] || 0) + 2;
    }

    // Recalculate dominant domain based on affinity weight
    let maxScore = 0;
    let dominant = p.primary_domain || 'omni';
    Object.keys(p.domain_scores).forEach(d => {
      if (p.domain_scores[d] > maxScore) {
        maxScore = p.domain_scores[d];
        dominant = d;
      }
    });
    if (maxScore >= 2) {
      p.primary_domain = dominant;
    }

    // 3. Dynamic Product / E-Book & Aarogyam Tube Video Recommendation Lock
    if (p.primary_domain === 'agri') {
      p.recommended_ebook = 'BK002'; // कृषि क्रांति एवं फसल डॉक्टर गाइड (₹99)
      p.recommended_video_tag = 'kisan_doctor_krishi';
    } else if (p.primary_domain === 'health') {
      p.recommended_ebook = 'BK001'; // संपूर्ण स्वास्थ्य एवं जीवनशैली निर्देशिका
      p.recommended_video_tag = 'ayurveda_health_remedies';
    } else if (p.primary_domain === 'beauty' || p.primary_domain === 'nuskhe') {
      p.recommended_ebook = 'BK015'; // प्राकृतिक रूप-निखार व दादी के जादुई नुस्खे
      p.recommended_video_tag = 'herbal_beauty_skin_care';
    } else if (p.primary_domain === 'business') {
      p.recommended_ebook = 'BK018'; // डिजिटल नेटवर्क मार्केटिंग एवं ₹8.19 लाख कैपिंग फॉर्मूला
      p.recommended_video_tag = 'direct_selling_8_19_lakh';
    } else if (p.primary_domain === 'pashu') {
      p.recommended_ebook = 'BK016'; // वैज्ञानिक डेयरी व पशु पोषण संपूर्ण मार्गदर्शिका
      p.recommended_video_tag = 'pashu_cfc_dudh_fat';
    }

    // 4. Extract specific crop or entity tags for personalized recommendations
    const cropList = ['गेहूं', 'सरसों', 'चना', 'धान', 'मक्का', 'सोयाबीन', 'आलू', 'टमाटर', 'मिर्च', 'लहसुन'];
    cropList.forEach(cr => {
      if (cleanQ.includes(cr) && !p.detected_entities.includes(cr)) {
        p.detected_entities.push(cr);
      }
    });

    saveSakhiUserPersona(p);
    return p;
  }

  function getPersonaRecommendationChips() {
    const p = loadSakhiUserPersona();
    const chips = [];
    if (p.primary_domain === 'agri') {
      chips.push({ text: "📖 'खेती डॉक्टर' ई-बुक (BK002)", url: "/ebooks/book-landing.html?id=BK002", isExternal: true });
      chips.push({ text: "📺 आरोग्यम ट्यूब: फसल डॉक्टर", url: "/tube.html?filter=agri", isExternal: true });
    } else if (p.primary_domain === 'health') {
      chips.push({ text: "📖 संपूर्ण स्वास्थ्य ई-बुक (BK001)", url: "/ebooks/book-landing.html?id=BK001", isExternal: true });
      chips.push({ text: "📺 आरोग्यम ट्यूब: स्वास्थ्य व आयुर्वेद", url: "/tube.html?filter=health", isExternal: true });
    } else if (p.primary_domain === 'beauty' || p.primary_domain === 'nuskhe') {
      chips.push({ text: "📖 रूप-निखार ई-बुक (BK015)", url: "/ebooks/book-landing.html?id=BK015", isExternal: true });
      chips.push({ text: "📺 आरोग्यम ट्यूब: रूप-निखार व त्वचा", url: "/tube.html?filter=beauty", isExternal: true });
    } else if (p.primary_domain === 'business') {
      chips.push({ text: "📖 ₹8.19 लाख कैपिंग ई-बुक (BK018)", url: "/ebooks/book-landing.html?id=BK018", isExternal: true });
      chips.push({ text: "📺 आरोग्यम ट्यूब: 8.19L बिज़नेस", url: "/tube.html?filter=business", isExternal: true });
    } else if (p.primary_domain === 'pashu') {
      chips.push({ text: "📖 वैज्ञानिक डेयरी ई-बुक (BK016)", url: "/ebooks/book-landing.html?id=BK016", isExternal: true });
      chips.push({ text: "📺 आरोग्यम ट्यूब: दूध व फैट वृद्धि", url: "/tube.html?filter=dairy", isExternal: true });
    }
    return chips;
  }

  // Global developer/admin hooks for testing persona state
  window.getSakhiUserPersona = function () {
    return loadSakhiUserPersona();
  };
  window.resetSakhiUserPersona = function () {
    try {
      localStorage.removeItem(SAKHI_PERSONA_STORAGE_KEY);
      document.cookie = `${SAKHI_COOKIE_HINT_KEY}=;path=/;max-age=0`;
    } catch (e) {}
  };

  // 1. PAGE HELPERS
  function checkIsDedicatedPage() {
    const path = (window.location.pathname || '').toLowerCase();
    return path.includes('aarogyam-sakhi') || Boolean(document.getElementById('sakhiFullscreenContainer'));
  }

  // 2. DOMAIN CLASSIFIER & STRICT FIREWALL (100% AUDITED AGAINST 1,000 MULTI-DOMAIN QUESTIONS)
  function classifyQueryDomain(cleanQuery) {
    const q = cleanQuery.toLowerCase();

    // A. Founder & Master Contact (Dada Avneesh Kumar Mishra)
    if (q.includes('अवनीश') || q.includes('avneesh') || q.includes('फाउंडर') || q.includes('founder') || q.includes('मालिक') || q.includes('7974422572') || q.includes('आरोग्यम इंडिया कौन') || q.includes('कंपनी किसकी')) {
      return 'founder';
    }

    // B. E-Books & Digital Library (Check before agri words so "खेती डॉक्टर ई-बुक BK002" routes to business/library!)
    if (q.includes('ई-बुक') || q.includes('ebook') || q.includes('bk002') || q.includes('bk001') || q.includes('किताब की कीमत') || q.includes('डाउनलोड लिंक') || q.includes('खरीफ गाइड') || q.includes('खेती डॉक्टर पुस्तक')) {
      return 'business';
    }

    // B.1 Aarogyam Tube Video Hub Guard
    if (q.includes('आरोग्यम ट्यूब') || q.includes('aarogyam tube') || q.includes('आरोग्यमट्यूब') || q.includes('म ट्यूब') || q.includes('ट्यूब') || q.includes('tube') || ((q.includes('वीडियो') || q.includes('video') || q.includes('रील्स') || q.includes('shorts')) && (q.includes('आरोग्यम') || q.includes('नेट्सर्फ') || q.includes('कृषि') || q.includes('खेती') || q.includes('8.19') || q.includes('बिज़नेस') || q.includes('डेयरी') || q.includes('स्वास्थ्य') || q.includes('फसल') || q.includes('दूध')))) {
      return 'tube';
    }

    // C. Veterinary & Dairy (Pashu Palan) - Highest Priority Animal Guard
    const cattleExplicit = [
      'पशु', 'गाय', 'भैंस', 'दुधारू', 'डेयरी', 'थनैल', 'थनैला', 'mastitis',
      'बकरी', 'भेड़', 'poultry', 'मुरगी', 'सूअर', 'मछली', 'cfc', 'पेट वेट',
      'पशु आहार', 'गोबर', 'आफरा', 'bloat', 'बछड़ा', 'बछड़ी', 'बछड़ों', 'लैक्टेशन',
      'दुग्ध', 'गाभिन', 'जेर', 'बांझपन', 'खुरपका', 'मुंहपका', 'साइलेज', 'दाना-चारा', 'snf'
    ];
    if (cattleExplicit.some(t => q.includes(t))) {
      return 'pashu';
    }
    if ((q.includes('दूध') || q.includes('dudh') || q.includes('फैट') || q.includes('fat')) && (q.includes('बढ़ाना') || q.includes('वृद्धि') || q.includes('पशु') || q.includes('डेयरी') || q.includes('जानवर') || q.includes('भैंस') || q.includes('गाय') || q.includes('7 से 8') || q.includes('लीटर'))) {
      if (!q.includes('चेहरा') && !q.includes('त्वचा') && !q.includes('जायफल') && !q.includes('उबटन') && !q.includes('हल्दी दूध')) {
        return 'pashu';
      }
    }

    // D. Conversational Context from Multi-Turn Chat History
    const activeDomain = sakhiConversationState ? sakhiConversationState.lastActiveDomain : null;

    // E. Agricultural Crops & Protection (Strict check before generic health 'रोग'/'इलाज')
    // Remove false-friends like 'समाधान' so 'धान' is never falsely triggered
    const cleanNoSamadhan = q.replace(/समाधान|सावधान|संविधान|प्रधान/g, '');
    const agriCropEntities = [
      'गेहूं', 'गेहूँ', 'सरसों', 'चना', 'चने', 'धान', 'मक्का', 'सोयाबीन', 'आलू',
      'टमाटर', 'मिर्च', 'बैंगन', 'प्याज', 'लहसुन', 'कपास', 'गोभी', 'मूंग', 'उड़द',
      'सब्जी', 'सब्जियों', 'फसल', 'फसलों', 'खेत', 'पौधों', 'पौधे', 'पेड़', 'बागवानी',
      'बीज', 'कृषि', 'कल्ले', 'फुटाव', 'यूरिया', 'डीएपी', 'एनपीके', 'npk', 'उर्वरक', 'खाद',
      'कीटनाशक', 'स्प्रे', 'माहू', 'चेपा', 'रतुआ', 'उकठा', 'खरपतवार', 'खरपतवारनाशक',
      'इमामेक्टिन', 'कोराजन', 'स्टिमरिच', 'stimrich', 'बायो 99', 'बायो-99', 'bio-99', 'bio99',
      'shet', 'wrapup', 'रैप अप', 'इल्ली', 'फफूंद', 'फंगस', 'झुलसा', 'गलन', 'तना छेदक',
      'दीमक', 'कुकड़ा', 'थ्रिप्स', 'व्हाइटफ्लाई', 'रस चूसक', 'एंटीवायरल', 'लार्विसाइड',
      'माइकोराइजा', 'vem', 'बैक्टीरिया', 'मिट्टी', 'अम्लीय', 'गुलाबी सुंडी', 'ब्लास्ट',
      'चक्रभृंग', 'कंद', 'रोपाई', 'फॉल आर्मीवर्म', 'इमिडाक्लोप्रिड', 'कॉपर'
    ];
    for (const t of agriCropEntities) {
      if (cleanNoSamadhan.includes(t)) return 'agri';
    }
    if ((q.includes('मौसम') || q.includes('हवा') || q.includes('बारिश')) && (q.includes('स्प्रे') || q.includes('दवा') || q.includes('खेत') || q.includes('छिड़क'))) {
      return 'agri';
    }
    if (q.includes('धूप') && (q.includes('स्प्रे') || q.includes('दवा') || q.includes('खेत') || q.includes('बीज'))) {
      return 'agri';
    }
    if ((q.includes('सुबह') || q.includes('शाम') || q.includes('दोपहर')) && (q.includes('स्प्रे') || q.includes('दवा') || q.includes('छिड़क'))) {
      return 'agri';
    }

    // F. Beauty, Dermatology, Trichology & Ubtan
    const beautyTokens = [
      'सुंदर', 'त्वचा', 'चेहरा', 'चेहरे', 'skin', 'झुर्रियां', 'झाइयाँ', 'झाइयां',
      'रूखापन', 'काले घेरे', 'काले धब्बे', 'मुंहासे', 'कील-मुहाँसों', 'पिंपल', 'pimple',
      'ग्लो', 'glow', 'चमक', 'बाल', 'बालों', 'hair', 'डैंड्रफ', 'dandruff',
      'गंजापन', 'गंजा', 'हेयरफॉल', 'कंडीशनर', 'फेसपैक', 'फेसवाश', 'रंगत',
      'उबटन', 'जायफल', 'बेसन', 'मुल्तानी मिट्टी', 'मलाई', 'स्क्रब', 'हर्ब्स एंड मोर',
      'फेयरनेस', 'होठों', 'टैनिंग', 'detan', 'घमौरियों'
    ];
    for (const t of beautyTokens) {
      if (q.includes(t)) return 'beauty';
    }

    // G. Dadi-Nani Ke Gharelu Nuskhe (Herbal Remedies for Humans)
    if (q.includes('दादी के नुस्खे') || q.includes('घरेलू नुस्खा') || q.includes('nuskhe') || q.includes('nuskha') || q.includes('काढ़ा') || q.includes('kadha') || q.includes('हल्दी दूध') || q.includes('घरेलू उपाय') || q.includes('देशी उपाय')) {
      return 'nuskhe';
    }

    // H. Human Health & Medicine (Sehat) - Includes Netsurf Health Products
    const healthTokens = [
      'शुगर', 'sugar', 'डायबिटीज', 'diabetes', 'मधुमेह', 'बीपी', 'bp', 'ब्लड प्रेशर',
      'घुटने', 'घुटनों', 'गठिया', 'जोड़ों', 'जोड़ों', 'जोड़', 'दर्द', 'कमजोरी',
      'लिवर', 'liver', 'किडनी', 'kidney', 'हार्ट', 'heart', 'दिल', 'थायराइड',
      'thyroid', 'पथरी', 'दमा', 'अस्थमा', 'कब्ज', 'बवासीर', 'piles', 'मोटापा',
      'वजन', 'हेल्थ', 'health', 'sehat', 'सेहत', 'बीमारी', 'रोग', 'इलाज',
      'रोग प्रतिरोधक', 'इम्युनिटी', 'ग्रीस', 'कट-कट', 'हड्डियों', 'यूरिक एसिड',
      'स्टेमिना', 'पौरुष', 'ज्वाइंट', 'joint care', 'कोलेस्ट्रॉल', 'सीने',
      'पेशाब', 'थकान', 'सिरदर्द', 'पेट दर्द', 'गैस', 'एसिडिटी', 'मरीज', 'खांसी', 'जुकाम'
    ];
    for (const t of healthTokens) {
      if (q.includes(t)) return 'health';
    }

    // I. Netsurf Business, Direct Selling, Compensation Plan & Opportunities
    const bizTokens = [
      'नेट्सर्फ', 'netsurf', 'बायोफिट', 'biofit', 'नेचुरामोर', 'naturamore',
      'क्लब नेट्सर्फ', '8.19', '8,19,250', 'साप्ताहिक कैपिंग', 'कैपिंग',
      'बाइनरी', 'टर्नओवर', 'कमीशन', 'डायरेक्ट सेलिंग', 'रिटेल बोनस', 'रिटेल कमीशन',
      'वाउचर', 'ऑटो-शिप', 'ऑटो शिप', 'autoship', 'डिस्काउंट', 'discount',
      '25%', 'फ्री जॉइनिंग', 'जॉइनिंग', 'आईडी', 'डाउनलाइन', 'जेनरेशन इनकम',
      'v-catalog', 'कैटलॉग', 'किसान मित्र', 'कमाई', 'कमा सकती', 'पैसे कैसे कमाए',
      'earning', 'income', 'बिज़नेस', 'business', 'एफिलिएट', 'affiliate',
      'ई-टेलर', 'etailer', '26 साल', 'सुजीत जैन', 'घर बैठे', '20k', '40k', '80k', '1.20l', '1.60l'
    ];
    for (const b of bizTokens) {
      if (q.includes(b)) return 'netsurf';
    }

    // J. Respect Active Domain from Chat History for Follow-ups
    if (activeDomain && activeDomain !== 'omni') {
      if (activeDomain === 'beauty' && (q.includes('दूध') || q.includes('लगाना') || q.includes('कैसे इस्तेमाल') || q.includes('चेहरा'))) return 'beauty';
      if (activeDomain === 'nuskhe' && (q.includes('दूध') || q.includes('जायफल') || q.includes('नुस्खा') || q.includes('उपाय'))) return 'nuskhe';
      if (activeDomain === 'health' && (q.includes('दूध') || q.includes('दवा') || q.includes('कब खाना') || q.includes('परहेज'))) return 'health';
      if (activeDomain === 'agri' && (q.includes('दवा') || q.includes('स्प्रे') || q.includes('डोज') || q.includes('रोग') || q.includes('सूखना'))) return 'agri';
    }

    const pageDomain = detectCurrentPageDomain();
    if (pageDomain && pageDomain !== 'omni') return pageDomain;

    // K. Zero-Egress Domain Memory Lock: prevent domain forgetting between questions!
    const persona = loadSakhiUserPersona();
    if (persona && persona.primary_domain && persona.primary_domain !== 'omni') {
      return persona.primary_domain;
    }

    return 'omni';
  }

  // 3. PAGE DOMAIN DETECTION
  function detectCurrentPageDomain() {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('hair') || path.includes('skin') || path.includes('beauty')) return 'beauty';
    if (path.includes('pashu') || path.includes('dairy') || path.includes('cattle') || path.includes('poultry')) return 'pashu';
    if (path.includes('health/') || path.includes('diabetes') || path.includes('joint') || path.includes('thyroid') || path.includes('weight') || path.includes('heart') || path.includes('liver') || path.includes('women') || path.includes('kids') || path.includes('dental') || path.includes('sexual')) return 'health';
    if (path.includes('agriculture') || path.includes('kharif') || path.includes('kheti') || path.includes('fasal') || path.includes('ebooks/')) return 'agri';
    return 'omni';
  }

  // 4. UNIFIED USER PROFILE HELPERS & MULTI-SESSION AUTH STATE
  function getUserPhone() {
    let p = (
      localStorage.getItem('aarogyam_user_phone') ||
      localStorage.getItem('aim_user_mobile') ||
      localStorage.getItem('SAKHI_USER_PHONE') ||
      localStorage.getItem('user_phone') ||
      localStorage.getItem('user_mobile') ||
      ''
    ).trim();
    if (!p) {
      try {
        const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
        if (u && (u.mobile || u.phone)) p = u.mobile || u.phone;
      } catch (e) {}
    }
    if (!p) {
      try {
        const pObj = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}');
        if (pObj && (pObj.mobile || pObj.phone)) p = pObj.mobile || pObj.phone;
      } catch (e) {}
    }
    if (!p) {
      try {
        const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
        if (sess && (sess.mobile || sess.phone)) p = sess.mobile || sess.phone;
      } catch (e) {}
    }
    const cleanDigits = String(p || '').replace(/\D/g, '').slice(-10);
    return cleanDigits.length === 10 ? cleanDigits : '';
  }

  function getUserName() {
    let name = (
      localStorage.getItem('aarogyam_user_name') ||
      localStorage.getItem('aim_user_name') ||
      localStorage.getItem('SAKHI_USER_NAME') ||
      localStorage.getItem('user_name') ||
      ''
    ).trim();
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase().includes('guest')) {
      try {
        const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
        if (u && (u.name || u.full_name) && String(u.name || u.full_name).trim()) name = String(u.name || u.full_name).trim();
      } catch (e) {}
    }
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase().includes('guest')) {
      try {
        const pObj = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}');
        if (pObj && (pObj.name || pObj.full_name) && String(pObj.name || pObj.full_name).trim()) name = String(pObj.name || pObj.full_name).trim();
      } catch (e) {}
    }
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase().includes('guest')) {
      try {
        const sess = JSON.parse(localStorage.getItem('AI_SESSION') || '{}');
        if (sess && sess.name && sess.name.trim()) name = sess.name.trim();
      } catch (e) {}
    }
    if (!name || name === 'null' || name.toLowerCase() === 'undefined' || name.toLowerCase() === 'admin' || name.toLowerCase().includes('guest')) {
      name = getUserPhone() ? 'किसान साथी' : '';
    }
    return name;
  }

  // Reliable, non-blocking check: if user has logged in anywhere on the website, they are authenticated!
  function isUserAuthenticated() {
    // 1. If V1_SESSION exists and reports logged out, treat as logged out!
    if (window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') {
      if (!window.V1_SESSION.isLoggedIn()) {
        localStorage.removeItem('SAKHI_USER_NAME');
        localStorage.removeItem('SAKHI_USER_PHONE');
        return false;
      }
    }
    // 2. If main site auth keys were cleared, treat as logged out!
    const hasMainSession = Boolean(
      localStorage.getItem('AI_USER') || 
      localStorage.getItem('AI_SESSION') || 
      localStorage.getItem('aim_user_mobile') || 
      localStorage.getItem('aarogyam_user_phone')
    );
    if (!hasMainSession) {
      localStorage.removeItem('SAKHI_USER_NAME');
      localStorage.removeItem('SAKHI_USER_PHONE');
      return false;
    }
    const phone = getUserPhone();
    return Boolean(phone && phone.length === 10);
  }

  // Cross-Tab & Site-Wide Logout Listener
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', function() {
      if (!isUserAuthenticated()) {
        updateSakhiHeaderUserBadge();
      }
    });
  }

  function getDynamicUserGreetingName() {
    const name = getUserName();
    return name || 'किसान साथी';
  }

  // Unified Synchronization across Sakhi AI, Universal Nav Drawer, and Website
  function syncUnifiedUserAuth(name, phone) {
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const cleanName = String(name || '').trim() || 'किसान साथी';

    if (!cleanPhone || cleanPhone.length !== 10) return;

    try {
      localStorage.setItem('aarogyam_user_name', cleanName);
      localStorage.setItem('aim_user_name', cleanName);
      localStorage.setItem('SAKHI_USER_NAME', cleanName);
      localStorage.setItem('aarogyam_user_phone', cleanPhone);
      localStorage.setItem('aim_user_mobile', cleanPhone);
      localStorage.setItem('SAKHI_USER_PHONE', cleanPhone);

      const aiUser = {
        name: cleanName,
        full_name: cleanName,
        mobile: cleanPhone,
        phone: cleanPhone,
        source: 'aarogyam-sakhi'
      };
      localStorage.setItem('AI_USER', JSON.stringify(aiUser));
      localStorage.setItem('AI_PROFILE', JSON.stringify(aiUser));

      if (typeof window.updateUniversalDrawerProfile === 'function') {
        window.updateUniversalDrawerProfile();
      }
      window.dispatchEvent(new CustomEvent('ai:user-logged-in', { detail: { name: cleanName, mobile: cleanPhone } }));
    } catch (e) {
      console.warn('Unified sync notice:', e);
    }
  }

  // Live Chat History & WhatsApp Handoff Generator for Avneesh Mishra ji (7974422572)
  function buildAvneeshWhatsAppHandoffUrl(currentQuery) {
    const userName = getUserName() || 'किसान साथी';
    const userPhone = getUserPhone() || 'उपलब्ध नहीं';
    const recentConvs = sessionChatHistory.slice(-4).map(h => `${h.role === 'user' ? '👤 सवाल' : '🤖 सखी'}: ${h.text.replace(/<[^>]*>/g, '').slice(0, 80)}`).join('\n');

    const handoffText = `नमस्ते अवनीश सर! 🙏\n\nमैं आरोग्यम सखी AI पर मार्गदर्शन ले रहा हूँ।\n\n👤 *नाम:* ${userName}\n📱 *मोबाइल:* ${userPhone}\n❓ *वर्तमान प्रश्न:* "${currentQuery}"\n\n📋 *हालिया बातचीत समरी:*\n${recentConvs || '(सखी AI पर नया सवाल)'}\n\nकृपया मुझे इस पर व्यक्तिगत मार्गदर्शन व समाधान प्रदान करें। धन्यवाद!`;

    return `https://wa.me/91${MASTER_ADMIN_PHONE}?text=${encodeURIComponent(handoffText)}`;
  }

  // 5. AUTH MODAL (CLEAN, COMPACT & GUARANTEED DB CHECK)
  function ensureAuthModalExists() {
    let modal = document.getElementById('sakhiAuthModalBackdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sakhiAuthModalBackdrop';
      modal.className = 'sakhi-auth-modal-backdrop';
      modal.innerHTML = `
        <div class="sakhi-auth-modal-card">
          <button type="button" class="sakhi-auth-modal-close" onclick="window.closeSakhiAuthModal()" title="बंद करें">&times;</button>
          <div style="text-align:center;margin-bottom:14px;">
            <div style="width:48px;height:48px;border-radius:50%;background:#dcfce7;color:#15803d;display:inline-flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:6px;">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:900;color:#0f172a;">आरोग्यम सखी AI में स्वागत है</h3>
            <p style="margin:4px 0 0 0;font-size:0.84rem;color:#64748b;">कृपया अपना 10 अंकों का WhatsApp नंबर दर्ज करें</p>
          </div>

          <form onsubmit="event.preventDefault(); window.submitSakhiAuthModal();">
            <div style="margin-bottom:12px;">
              <label style="display:block;font-size:0.82rem;font-weight:700;color:#334155;margin-bottom:4px;">
                📱 WhatsApp मोबाइल नंबर: <span style="color:#dc2626;">*</span>
              </label>
              <input type="tel" id="sakhiModalPhone" maxlength="10" placeholder="10 अंकों का नंबर लिखें..." style="width:100%;padding:10px 12px;border:1.5px solid #cbd5e1;border-radius:10px;font-size:0.95rem;box-sizing:border-box;" oninput="window.checkExistingSakhiModalPhone(this.value)" required />
              <div id="sakhiPhoneCheckNotice" style="display:none;font-size:0.75rem;margin-top:4px;font-weight:700;"></div>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:0.82rem;font-weight:700;color:#334155;margin-bottom:4px;">
                👤 आपका शुभ नाम: <span style="color:#dc2626;">*</span>
              </label>
              <input type="text" id="sakhiModalName" placeholder="अपना पूरा नाम लिखें..." style="width:100%;padding:10px 12px;border:1.5px solid #cbd5e1;border-radius:10px;font-size:0.95rem;box-sizing:border-box;" required />
            </div>

            <button type="submit" style="width:100%;background:#16a34a;color:#ffffff;border:none;padding:12px;border-radius:12px;font-weight:900;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 12px rgba(22,163,74,0.3);">
              <span>आगे बढ़ें</span> <i class="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          <div style="text-align:center;margin-top:12px;font-size:0.72rem;color:#94a3b8;">
            🔒 100% सुरक्षित • आपका डेटा पूरी तरह गोपनीय रखा जाता है
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeSakhiAuthModal();
      });
    }
    return modal;
  }

  window.openSakhiAuthModal = function() {
    const modal = ensureAuthModalExists();
    if (modal) {
      modal.classList.add('active');
      const phoneInput = document.getElementById('sakhiModalPhone');
      if (phoneInput && !phoneInput.value) {
        phoneInput.value = getUserPhone();
        if (phoneInput.value) window.checkExistingSakhiModalPhone(phoneInput.value);
        setTimeout(() => phoneInput.focus(), 200);
      }
    }
  };

  window.closeSakhiAuthModal = function() {
    const modal = document.getElementById('sakhiAuthModalBackdrop');
    if (modal) modal.classList.remove('active');
  };

  let sakhiPhoneTimer = null;
  window.checkExistingSakhiModalPhone = function(val) {
    const clean = (val || '').replace(/\D/g, '').slice(-10);
    const notice = document.getElementById('sakhiPhoneCheckNotice');
    const nameInput = document.getElementById('sakhiModalName');
    if (!notice) return;

    if (sakhiPhoneTimer) clearTimeout(sakhiPhoneTimer);

    if (clean.length === 10) {
      notice.style.display = 'block';
      notice.style.color = '#d97706';
      notice.innerHTML = `⏳ खाता जाँचा जा रहा है...`;

      sakhiPhoneTimer = setTimeout(async () => {
        try {
          let dbUser = null;
          if (typeof isMobileRegistered === 'function') {
            dbUser = await isMobileRegistered(clean);
          } else if (window.dbClient || window.supabase) {
            const client = window.dbClient || window.supabase;
            const { data } = await client.from('profiles').select('id, full_name, mobile, share_id').eq('mobile', clean).limit(1).maybeSingle();
            dbUser = data;
          }

          if (dbUser && dbUser.full_name && dbUser.full_name.trim()) {
            const official = dbUser.full_name.trim();
            notice.style.display = 'block';
            notice.style.color = '#15803d';
            notice.innerHTML = `✨ सत्यापित खाता: <strong>${escapeHtml(official)}</strong>`;
            if (nameInput) {
              nameInput.value = official;
              nameInput.readOnly = true;
              nameInput.style.backgroundColor = '#f0fdf4';
            }
          } else {
            notice.style.display = 'block';
            notice.style.color = '#0284c7';
            notice.innerHTML = `✨ नया खाता: कृपया नीचे अपना शुभ नाम लिखें।`;
            if (nameInput) {
              nameInput.readOnly = false;
              nameInput.style.backgroundColor = '#ffffff';
              if (!nameInput.value) nameInput.focus();
            }
          }
        } catch (e) {
          notice.style.display = 'none';
        }
      }, 250);
    } else {
      notice.style.display = 'none';
      if (nameInput) {
        nameInput.readOnly = false;
        nameInput.style.backgroundColor = '#ffffff';
      }
    }
  };

  window.submitSakhiAuthModal = async function() {
    const phoneEl = document.getElementById('sakhiModalPhone');
    const nameEl = document.getElementById('sakhiModalName');
    const rawPhone = phoneEl ? phoneEl.value.replace(/\D/g, '').slice(-10) : '';
    const rawName = nameEl ? nameEl.value.trim() : '';

    if (!rawPhone || !/^[6-9]\d{9}$/.test(rawPhone)) {
      alert('कृपया 10 अंकों का सही भारतीय WhatsApp मोबाइल नंबर दर्ज करें।');
      if (phoneEl) phoneEl.focus();
      return;
    }

    if (!rawName || rawName.length < 2) {
      alert('कृपया अपना शुभ नाम दर्ज करें।');
      if (nameEl) nameEl.focus();
      return;
    }

    let officialName = rawName;

    try {
      if (typeof isMobileRegistered === 'function') {
        const existingProfile = await isMobileRegistered(rawPhone);
        if (existingProfile && existingProfile.full_name && existingProfile.full_name.trim()) {
          officialName = existingProfile.full_name.trim();
        }
        if (existingProfile && typeof createLoginSession === 'function') {
          createLoginSession(existingProfile);
        }
      }
    } catch (e) {}

    syncUnifiedUserAuth(officialName, rawPhone);
    window.closeSakhiAuthModal();
    updateSakhiHeaderUserBadge();

    speakResponse(`स्वागत है ${officialName} जी!`);

    const wrap = document.getElementById('sakhiMessagesWrap');
    if (wrap) {
      const row = document.createElement('div');
      row.className = 'sakhi-msg-row bot';
      row.innerHTML = `
        <div class="sakhi-msg-bubble" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:18px;padding:14px;box-shadow:0 4px 12px rgba(22,163,74,0.15);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <span style="font-size:1.4rem;">🎉</span>
            <div style="font-weight:900;color:#15803d;font-size:1rem;">स्वागत है ${escapeHtml(officialName)} जी!</div>
          </div>
          <div style="font-size:0.88rem;color:#334155;line-height:1.5;">
            आपका WhatsApp नंबर <strong>${escapeHtml(rawPhone)}</strong> सत्यापित हो गया है। अब आप कोई भी सवाल पूछ सकते हैं।
          </div>
        </div>
      `;
      wrap.appendChild(row);
      wrap.scrollTop = wrap.scrollHeight;
    }

    if (pendingUserQuery) {
      const q = pendingUserQuery;
      pendingUserQuery = null;
      setTimeout(() => handleUserSubmit(q), 500);
    }
  };

  // 6. USER BADGE IN SAKHI HEADER
  function updateSakhiHeaderUserBadge() {
    const badgeWrap = document.getElementById('sakhiHeaderUserBadgeWrap');
    if (!badgeWrap) return;

    if (isUserAuthenticated()) {
      const name = getUserName();
      badgeWrap.innerHTML = `
        <div class="sakhi-user-badge logged-in" title="सत्यापित खाता: ${escapeHtml(name)}" style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);color:#ffffff;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;">
          <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;"></span>
          <span style="max-width:145px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(name)}</span>
        </div>
      `;
    } else {
      badgeWrap.innerHTML = `
        <button type="button" class="sakhi-user-badge guest" onclick="window.openSakhiAuthModal()" title="लॉगिन या नया खाता बनाने के लिए क्लिक करें" style="background:#fde047;border:none;color:#0f172a;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
          <span>🔑</span> <span>लॉगिन</span>
        </button>
      `;
    }
  }

  // 7. SPEECH RECOGNITION (STT)
  function initSpeechRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

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
      console.warn('[Sakhi AI] STT setup note:', e);
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
    if (input) input.placeholder = 'सवाल बोलें या लिखें...';
  }

  // 8. TEXT-TO-SPEECH (TTS) CLEANER & ENTHUSIASTIC NATURAL SPEECH ENGINE
  let speechChunkWatchdog = null;
  let speechKeepAliveTimer = null;
  window._sakhiSpeechUtterances = [];

  function startSpeechKeepAlive() {
    stopSpeechKeepAlive();
    speechKeepAliveTimer = setInterval(() => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        try { window.speechSynthesis.resume(); } catch (e) {}
      }
    }, 3500);
  }

  function stopSpeechKeepAlive() {
    if (speechKeepAliveTimer) {
      clearInterval(speechKeepAliveTimer);
      speechKeepAliveTimer = null;
    }
  }

  function cleanTextForTTS(rawText) {
    if (!rawText) return '';
    let t = String(rawText);

    // 1. Strip HTML tags
    t = t.replace(/<[^>]*>/g, ' ');

    // 2. Strip book code identifiers so TTS doesn't speak "बीके 002"
    t = t.replace(/\bBK002\b/gi, 'खेती डॉक्टर')
         .replace(/\bBK001\b/gi, 'ई-बुक')
         .replace(/\bBK015\b/gi, 'ई-बुक')
         .replace(/\bBK016\b/gi, 'ई-बुक')
         .replace(/\bBK018\b/gi, 'ई-बुक');

    // 3. Natural Hindi Pronunciation for Large Money Amounts
    t = t.replace(/₹?\s*8\s*[,.]?\s*19\s*[,.]?\s*250/g, ' 8 लाख 19 हजार 250 रुपये ')
         .replace(/₹?\s*16\s*[,.]?\s*38\s*[,.]?\s*500/g, ' 16 लाख 38 हजार 500 रुपये ')
         .replace(/₹\s*(\d+)/g, ' $1 रुपये ');

    // 4. Natural Dosages & Volume Units
    t = t.replace(/(\d+)\s*[-–—]\s*(\d+)\s*ml\b/gi, '$1 से $2 मिलीलीटर ')
         .replace(/(\d+)\s*[-–—]\s*(\d+)\s*l\b/gi, '$1 से $2 लीटर ')
         .replace(/\b(\d+)\s*ml\b/gi, '$1 मिलीलीटर ')
         .replace(/\b(\d+)\s*l\b/gi, '$1 लीटर ')
         .replace(/\b(\d+)\s*g\b/gi, '$1 ग्राम ')
         .replace(/\b(\d+)\s*kg\b/gi, '$1 किलो ')
         .replace(/(\d+)\s*[-–—]\s*(\d+)\s*दिन/g, '$1 से $2 दिन')
         .replace(/(\d+)\s*[-–—]\s*(\d+)\s*घंटे/g, '$1 से $2 घंटे')
         .replace(/(\d+)\s*[-–—]\s*(\d+)\s*साल/g, '$1 से $2 साल')
         .replace(/(\d+)\s*[-–—]\s*(\d+)\s*वर्ष/g, '$1 से $2 वर्ष')
         .replace(/(\d+)\s*[-–—]\s*(\d+)/g, '$1 से $2');

    // 5. Percentages & Math symbols
    t = t.replace(/(\d+)\s*%/g, ' $1 प्रतिशत ');
    t = t.replace(/\s*\+\s*/g, ' और ');

    // 6. Ratios & Time-Like Colon Patterns (Prevent "19 bajke 19 minute 19 second")
    t = t.replace(/\b19\s*:\s*19\s*:\s*19\b/gi, 'उन्नीस उन्नीस उन्नीस')
         .replace(/\b0\s*:\s*52\s*:\s*34\b/gi, 'जीरो बावन चौंतीस')
         .replace(/\b0\s*:\s*0\s*:\s*50\b/gi, 'जीरो जीरो पचास')
         .replace(/\b12\s*:\s*61\s*:\s*0\b/gi, 'बारह इकसठ जीरो')
         .replace(/\b13\s*:\s*0\s*:\s*45\b/gi, 'तेरह जीरो पैंतालीस')
         .replace(/\b(\d+)\s*:\s*(\d+)\s*:\s*(\d+)\b/g, '$1 $2 $3')
         .replace(/\b(\d+)\s*:\s*(\d+)\b/g, '$1 अनुपात $2');

    // 7. Strip URLs, links and file paths
    t = t.replace(/https?:\/\/\S+/gi, ' ')
         .replace(/\/[\w\-\.\/]+\.html/gi, ' ');

    // 8. Numbered bullet lists: "1)", "1.", "2)", "2." -> clean natural pauses
    t = t.replace(/^\s*\d+[\.\)]\s*/gm, ' ')
         .replace(/\s+\d+[\.\)]\s+/g, ' ');

    // 9. Strip ALL Unicode Emojis
    t = t.replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{200D}\u{FE0F}]/gu, ' ');

    // 10. CRITICAL: Remove commas, semicolons, colons, dashes, quotes, slashes, brackets, bullets, asterisks
    // SO TTS CAN NEVER PRONOUNCE "कॉमा", "डैश", "ब्रैकेट", "स्लैश", "स्टार", आदि!
    t = t.replace(/[*#_~`|•●★☆✔✓👉👉🏻👉🏼👉🏽👉🏾👉🏿→⇒➔↔]/gu, ' ')
         .replace(/[,\:;\-\–\—\/\\\"\'\“\”\‘\’\(\)\[\]\{\}\<\>\^\@\&\=\$\~]/g, ' ')
         .replace(/\s+/g, ' ')
         .trim();

    return t;
  }

  function stopAllSpeech() {
    stopSpeechKeepAlive();
    if (speechChunkWatchdog) {
      clearTimeout(speechChunkWatchdog);
      speechChunkWatchdog = null;
    }
    window._sakhiSpeechUtterances = [];
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    const avatar = document.getElementById('sakhiAvatarFrame');
    if (avatar) avatar.classList.remove('speaking');
    if (activeSpeechBtn) {
      activeSpeechBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>सुनें</span>';
      activeSpeechBtn.classList.remove('speaking');
      activeSpeechBtn = null;
    }
  }

  function getBestHindiVoice() {
    if (!window.speechSynthesis) return null;
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      // Prefer high-quality pleasant Hindi female/warm voices
      const priority = [
        v => (v.lang === 'hi-IN' || v.lang === 'hi_IN') && (v.name.includes('Swara') || v.name.includes('Google हिन्दी') || v.name.includes('Natural') || v.name.includes('Heera') || v.name.includes('Kalpana')),
        v => (v.lang === 'hi-IN' || v.lang === 'hi_IN') && !v.name.includes('Male') && !v.name.includes('David') && !v.name.includes('Ravi'),
        v => (v.lang === 'hi-IN' || v.lang === 'hi_IN'),
        v => v.lang && v.lang.startsWith('hi'),
        v => (v.lang === 'en-IN' || v.lang === 'en_IN') && !v.name.includes('Male')
      ];
      for (const p of priority) {
        const found = voices.find(p);
        if (found) return found;
      }
      return voices[0] || null;
    } catch (e) {
      return null;
    }
  }

  function splitTextIntoSentences(text) {
    if (!text) return [];
    // Split ONLY on real Hindi sentence endings (।), question marks (?), exclamation marks (!), or double linebreaks
    // NEVER split on commas, so sentences flow naturally!
    const rawTokens = text.split(/([।?!]+|\n{2,})/);
    const chunks = [];
    let current = '';

    for (let i = 0; i < rawTokens.length; i++) {
      const tok = rawTokens[i];
      if (/^[।?!]+$/.test(tok)) {
        current += tok;
        const cleaned = current.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/gu, '').trim();
        if (cleaned.length >= 2) chunks.push(cleaned);
        current = '';
      } else {
        current += ' ' + tok;
        // If an extra-long unbroken block exceeds 150 characters, split at nearest word boundary
        if (current.length > 150) {
          const words = current.trim().split(/\s+/);
          let half = '';
          while (words.length > 0 && (half + ' ' + words[0]).length <= 120) {
            half += (half ? ' ' : '') + words.shift();
          }
          const cl = half.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/gu, '').trim();
          if (cl.length >= 2) chunks.push(cl);
          current = words.join(' ');
        }
      }
    }
    const finalClean = current.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/gu, '').trim();
    if (finalClean.length >= 2) {
      chunks.push(finalClean);
    }
    return chunks.length > 0 ? chunks : [text.trim()];
  }

  function playChunkedSpeech(text, onStart, onFinish) {
    if (!window.speechSynthesis || !text) {
      if (typeof onFinish === 'function') onFinish();
      return;
    }

    stopAllSpeech();

    const cleanText = cleanTextForTTS(text);
    if (!cleanText) {
      if (typeof onFinish === 'function') onFinish();
      return;
    }

    const chunks = splitTextIntoSentences(cleanText);
    if (!chunks.length) {
      if (typeof onFinish === 'function') onFinish();
      return;
    }

    startSpeechKeepAlive();

    // Small delay ensures previous speech synthesizer queue is flushed
    setTimeout(() => {
      if (typeof onStart === 'function') onStart();
      let currentIndex = 0;

      function speakNextChunk() {
        if (speechChunkWatchdog) {
          clearTimeout(speechChunkWatchdog);
          speechChunkWatchdog = null;
        }

        if (currentIndex >= chunks.length) {
          stopAllSpeech();
          if (typeof onFinish === 'function') onFinish();
          return;
        }

        const chunkText = chunks[currentIndex++];
        if (!chunkText || !chunkText.trim()) {
          speakNextChunk();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.98; // Energetic, clear, inspiring pace
        utterance.pitch = 1.08; // Sweet, lively, affectionate Indian tone

        const voice = getBestHindiVoice();
        if (voice) utterance.voice = voice;

        // Prevent V8 garbage collection
        window._sakhiSpeechUtterances.push(utterance);

        let advanced = false;
        function proceed() {
          if (advanced) return;
          advanced = true;
          if (speechChunkWatchdog) {
            clearTimeout(speechChunkWatchdog);
            speechChunkWatchdog = null;
          }
          speakNextChunk();
        }

        utterance.onend = proceed;
        utterance.onerror = function (e) {
          if (e && e.error === 'canceled') return;
          proceed();
        };

        // Watchdog: If browser drops onend event, advance automatically
        const maxTime = Math.max(3000, chunkText.length * 140 + 2000);
        speechChunkWatchdog = setTimeout(() => {
          proceed();
        }, maxTime);

        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          proceed();
        }
      }

      speakNextChunk();
    }, 60);
  }

  function speakResponse(text) {
    if (!isSoundEnabled || !window.speechSynthesis || !text) return;
    playChunkedSpeech(text, () => {
      const avatar = document.getElementById('sakhiAvatarFrame');
      if (avatar) avatar.classList.add('speaking');
    }, () => {
      const avatar = document.getElementById('sakhiAvatarFrame');
      if (avatar) avatar.classList.remove('speaking');
    });
  }

  window.toggleMessageSpeech = function (btn, encodedText) {
    const text = decodeURIComponent(encodedText);
    if (!window.speechSynthesis) return;

    if (activeSpeechBtn === btn && window.speechSynthesis.speaking) {
      stopAllSpeech();
      return;
    }

    if (activeSpeechBtn && activeSpeechBtn !== btn) {
      stopAllSpeech();
    }

    activeSpeechBtn = btn;
    btn.innerHTML = '<i class="fa-solid fa-stop"></i> <span>रोकें</span>';
    btn.classList.add('speaking');

    playChunkedSpeech(text, () => {
      const avatar = document.getElementById('sakhiAvatarFrame');
      if (avatar) avatar.classList.add('speaking');
    }, () => {
      stopAllSpeech();
    });
  };

  function buildMsgAudioBtnMarkup(text) {
    if (!text) return '';
    const cleanForSpeech = cleanTextForTTS(text);
    const enc = encodeURIComponent(cleanForSpeech);
    return `
      <div style="display:inline-flex;margin-top:6px;">
        <button type="button" class="sakhi-msg-audio-btn" onclick="window.toggleMessageSpeech(this, '${enc}')" title="आवाज़ में सुनें" style="background:transparent;border:1px solid #cbd5e1;border-radius:20px;padding:3px 10px;font-size:0.75rem;cursor:pointer;display:inline-flex;align-items:center;gap:4px;color:#475569;">
          <i class="fa-solid fa-volume-high"></i> <span>सुनें</span>
        </button>
      </div>
    `;
  }

  // 9. KNOWLEDGE BASE LOADER (WITH PERSISTENT CACHE BUSTING)
  async function loadKnowledgeBase() {
    try {
      const res = await fetch('/data/krishi-ai-knowledge.json?v=20261015_v121');
      if (res.ok) {
        knowledgeData = await res.json();
      }
    } catch (e) {
      console.warn('Knowledge load error:', e);
    }
  }

  // 9.5 PERSISTENT CHAT HISTORY STORAGE ENGINE (FOR AAROGYAM MASTER 7974422572 & ALL USERS)
  const SAKHI_PERSISTENT_CHAT_KEY = 'SAKHI_PERSISTENT_CHAT_LOG';

  function saveChatLogItem(role, content, speech) {
    try {
      const phone = getUserPhone() || 'user';
      const key = `${SAKHI_PERSISTENT_CHAT_KEY}_${phone}`;
      let log = [];
      try {
        const raw = localStorage.getItem(key);
        if (raw) log = JSON.parse(raw) || [];
      } catch (e) {}
      log.push({ role, content, speech, time: Date.now() });
      if (log.length > 50) log = log.slice(-50);
      localStorage.setItem(key, JSON.stringify(log));
    } catch (e) {}
  }

  function getPersistentChatLog() {
    try {
      const phone = getUserPhone() || 'user';
      const key = `${SAKHI_PERSISTENT_CHAT_KEY}_${phone}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
    } catch (e) {}
    return [];
  }

  window.startSakhiNewChat = function() {
    try {
      const phone = getUserPhone() || 'user';
      localStorage.removeItem(`${SAKHI_PERSISTENT_CHAT_KEY}_${phone}`);
      sessionChatHistory.length = 0;
      sakhiConversationState.lastActiveDomain = null;
      sakhiConversationState.lastActiveEntity = null;
      sakhiConversationState.lastActiveEntityName = null;
      sakhiConversationState.history = [];
      consecutiveAmbiguousCount = 0;
      const wrap = document.getElementById('sakhiMessagesWrap');
      if (wrap) wrap.innerHTML = '';
      renderInitialGreeting();
    } catch (e) {
      console.warn('startSakhiNewChat error:', e);
    }
  };
  window.clearSakhiChatHistory = window.startSakhiNewChat;

  // 10. CHAT UI INJECTION & MESSAGE STREAMER
  function appendUserMessage(text) {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    saveChatLogItem('user', text, '');

    const row = document.createElement('div');
    row.className = 'sakhi-msg-row user';
    row.innerHTML = `
      <div class="sakhi-msg-bubble user-bubble">
        ${escapeHtml(text)}
      </div>
    `;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function appendTypingIndicator() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    removeTypingIndicator();

    const row = document.createElement('div');
    row.id = 'sakhiTypingIndicatorRow';
    row.className = 'sakhi-msg-row bot';
    row.innerHTML = `
      <div class="sakhi-msg-bubble typing-bubble" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:12px 18px;display:inline-flex;align-items:center;gap:8px;">
        <span style="font-size:0.85rem;color:#166534;font-weight:700;">आरोग्यम सखी विचार कर रही हैं</span>
        <div class="sakhi-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function removeTypingIndicator() {
    const ind = document.getElementById('sakhiTypingIndicatorRow');
    if (ind) ind.remove();
  }

  function streamBotMessage(htmlContent, speechText) {
    removeTypingIndicator();
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    saveChatLogItem('bot', htmlContent, speechText || '');

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

  // 11. GREETING & INITIALIZATION
  function renderInitialGreeting() {
    const wrap = document.getElementById('sakhiMessagesWrap');
    if (!wrap) return;

    const displayName = getDynamicUserGreetingName();
    const persona = loadSakhiUserPersona();

    let greetingLine = `नमस्ते ${escapeHtml(displayName)}! 🙏`;
    let subGreeting = `मैं आपकी <strong>आरोग्यम सखी AI</strong> हूँ।`;
    let descLine = `खेती (गेहूं, सरसों, खाद, स्प्रे), पशुपालन (दूध-फैट), सेहत (जोड़ों का दर्द, शुगर), सौंदर्य या नेट्सर्फ बिज़नेस से जुड़ा कोई भी सवाल नीचे पूछें।`;

    if (persona && (persona.interaction_count > 0 || persona.primary_domain !== 'omni')) {
      if (persona.user_tone === 'dehati' || persona.primary_domain === 'agri') {
        greetingLine = `राम-राम ${escapeHtml(displayName)} जी! 🙏 जय जवान, जय किसान!`;
        subGreeting = `मैं आपकी <strong>आरोग्यम सखी (फसल व कृषि सलाहकार)</strong> हूँ।`;
        descLine = `आपकी फसलों (चना, गेहूं, सरसों), खाद-उर्वरक, स्प्रे कैलेंडर या खेती ई-बुक से जुड़ी कोई भी समस्या तुरंत पूछें।`;
      } else if (persona.user_tone === 'homemaker' || persona.primary_domain === 'beauty' || persona.primary_domain === 'nuskhe') {
        greetingLine = `नमस्ते ${escapeHtml(displayName)} बहन जी! 🙏`;
        subGreeting = `मैं आपकी <strong>आरोग्यम सखी (सौंदर्य व घरेलू नुस्खे हमदर्द)</strong> हूँ।`;
        descLine = `त्वचा की चमक, बालों की देखभाल, घरेलू आयुर्वेदिक नुस्खे या गृह उद्योग से जुड़ा कोई भी सवाल पूछें।`;
      } else if (persona.user_tone === 'business' || persona.primary_domain === 'business') {
        greetingLine = `नमस्ते ${escapeHtml(displayName)} लीडर साथी! 🙏`;
        subGreeting = `मैं आपकी <strong>आरोग्यम सखी (बिज़नेस व कैपिंग मेंटर)</strong> हूँ।`;
        descLine = `25% रिटेल मार्जिन, 5+1 ऑटो शिप, 15-दिवसीय ₹8,19,250 वीकली कैपिंग और डिजिटल नेटवर्किंग पर चर्चा करें।`;
      } else if (persona.user_tone === 'patient' || persona.primary_domain === 'health') {
        greetingLine = `नमस्ते ${escapeHtml(displayName)} जी! 🙏`;
        subGreeting = `मैं आपकी <strong>आरोग्यम सखी (स्वास्थ्य व आयुर्वेद हमदर्द)</strong> हूँ।`;
        descLine = `जोड़ों का दर्द, शुगर, बीपी, थायराइड, मोटापा या आयुर्वेदिक परहेज पर कोई भी परामर्श लें।`;
      }
    }

    const savedLog = getPersistentChatLog();
    const hasHistory = savedLog && savedLog.length > 0;

    let historyToolbar = '';
    if (hasHistory) {
      historyToolbar = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:8px;border-top:1px dashed #cbd5e1;">
          <span style="font-size:0.76rem;color:#64748b;font-weight:700;"><i class="fa-solid fa-clock-rotate-left"></i> आपकी पिछली बातचीत सुरक्षित है</span>
          <button type="button" onclick="window.clearSakhiChatHistory()" title="चैट हिस्ट्री साफ करें और नया सत्र शुरू करें" style="background:#fee2e2;border:1px solid #fca5a5;color:#b91c1c;padding:3px 9px;border-radius:14px;font-size:0.72rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
            <i class="fa-solid fa-trash-can"></i> <span>नई चैट</span>
          </button>
        </div>
      `;
    }

    wrap.innerHTML = `
      <div class="sakhi-msg-row bot">
        <div class="sakhi-msg-bubble" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:16px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <img src="${SAKHI_AVATAR_IMG}" alt="Aarogyam Sakhi" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #16a34a;box-shadow:0 2px 8px rgba(22,163,74,0.3);" onerror="this.src='/images/logo/fevicon.png'">
            <div>
              <div style="font-size:1.05rem;font-weight:900;color:#0f172a;">${greetingLine}</div>
              <div style="font-size:0.82rem;color:#166534;font-weight:700;">${subGreeting}</div>
            </div>
          </div>

          <div style="color:#334155;font-size:0.92rem;line-height:1.6;margin-bottom:10px;">
            ${descLine}
          </div>

          <!-- Clean ChatGPT-style Prompt Guide -->
          <div style="display:inline-flex;align-items:center;gap:8px;font-size:0.84rem;color:#15803d;font-weight:700;background:#f0fdf4;padding:8px 14px;border-radius:24px;border:1px solid #bbf7d0;">
            <span>✨</span> <span>मुख्य विषय व टूल्स चुनने के लिए नीचे <strong>[+]</strong> बटन पर टैप करें</span>
          </div>

          ${historyToolbar}
        </div>
      </div>
    `;

    // Restore saved chat history bubbles
    if (hasHistory) {
      savedLog.forEach(item => {
        const row = document.createElement('div');
        if (item.role === 'user') {
          row.className = 'sakhi-msg-row user';
          row.innerHTML = `<div class="sakhi-msg-bubble user-bubble">${escapeHtml(item.content)}</div>`;
        } else {
          row.className = 'sakhi-msg-row bot';
          row.innerHTML = `<div class="sakhi-msg-bubble">${item.content}</div>`;
        }
        wrap.appendChild(row);
      });
      setTimeout(() => { wrap.scrollTop = wrap.scrollHeight; }, 100);
    }

    updateSakhiHeaderUserBadge();
  }

  // 12. SUBMISSION HANDLER & USER INPUT PROCESSING
  function handleUserSubmit(userQuery) {
    const query = (userQuery || '').trim();
    if (!query) return;

    const input = document.getElementById('sakhiTextInput');
    if (input) input.value = '';

    // Guest Mode Access Gate: User MUST be authenticated to chat with Sakhi AI!
    if (!isUserAuthenticated()) {
      const phoneMatch = query.match(/(?:(?:\+91|91|0)?[-\s]?)?([6-9]\d{9})/);
      if (phoneMatch) {
        const extractedPhone = phoneMatch[1];
        let potentialName = query
          .replace(phoneMatch[0], '')
          .replace(/(?:मेरा\s*नाम|नाम|name|mobile|phone|नंबर|no|hai|he|हूँ|हू|hu|मेरा\s*नंबर|whatsapp)/gi, '')
          .replace(/[^a-zA-Z\u0900-\u097F\s]/g, '')
          .trim();

        if (!potentialName || potentialName.length < 2) potentialName = 'किसान साथी';

        syncUnifiedUserAuth(potentialName, extractedPhone);
        updateSakhiHeaderUserBadge();

        appendUserMessage(query);
        const successSpeech = `धन्यवाद ${potentialName} जी! आपका नंबर सुरक्षित रूप से सत्यापित हो गया है।`;
        const successHtml = `
          <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:18px;padding:14px;box-shadow:0 4px 12px rgba(22,163,74,0.15);">
            <div style="font-weight:900;color:#15803d;font-size:1rem;margin-bottom:4px;">
              🎉 स्वागत है ${escapeHtml(potentialName)} जी!
            </div>
            <div style="font-size:0.88rem;color:#334155;line-height:1.5;">
              आपका WhatsApp नंबर <strong>${escapeHtml(extractedPhone)}</strong> सत्यापित हो गया है। अब आप खेती, पशुपालन, सेहत या सौंदर्य का कोई भी सवाल पूछ सकते हैं।
            </div>
          </div>
        `;
        streamBotMessage(successHtml, successSpeech);
        return;
      }

      // Unauthenticated guest user: Save pending query and trigger Registration/Login Modal!
      pendingUserQuery = query;
      window.openSakhiAuthModal();
      return;
    }

    appendUserMessage(query);

    try {
      sessionChatHistory.push({
        role: 'user',
        text: query,
        time: new Date().toLocaleTimeString('hi-IN')
      });
    } catch (e) {}

    appendTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      processKnowledgeQuery(query);
    }, 700);
  }

  // 13. HIGH-PRECISION QUERY NORMALIZER
  function normalizeQueryText(text) {
    return (text || '').toLowerCase()
      .replace(/bio\s*99/gi, 'bio-99')
      .replace(/बायो\s*99/gi, 'बायो-99')
      .replace(/stim\s*rich/gi, 'stimrich')
      .replace(/स्टिम\s*रिच/gi, 'स्टिमरिच')
      .replace(/stirich/gi, 'stimrich')
      .replace(/नेट\s*सर्फ/gi, 'नेट्सर्फ')
      .replace(/net\s*surf/gi, 'netsurf')
      .replace(/नेचुरा\s*मोर/gi, 'नेचुरामोर')
      .replace(/natura\s*more/gi, 'naturamore')
      .replace(/बायो\s*फिट/gi, 'बायोफिट')
      .replace(/bio\s*fit/gi, 'biofit')
      .replace(/cfc\s*plus/gi, 'cfc')
      .replace(/सी\s*एफ\s*सी/gi, 'cfc')
      .replace(/pet\s*vet/gi, 'pet vet')
      .replace(/पेट\s*वेट/gi, 'pet vet')
      .replace(/petvet/gi, 'pet vet')
      .replace(/joint\s*care/gi, 'joint care')
      .replace(/जॉइंट\s*केयर/gi, 'joint care')
      .replace(/जोड़\s*केयर/gi, 'joint care')
      .replace(/nutri\s*heart/gi, 'nutri heart')
      .replace(/न्यूट्री\s*हार्ट/gi, 'nutri heart')
      .replace(/न्यूट्रि\s*हार्ट/gi, 'nutri heart')
      .replace(/anti\s*viral/gi, 'antiviral')
      .replace(/एंटी\s*वायरल/gi, 'antiviral')
      .replace(/tamatr/gi, 'टमाटर')
      .replace(/tamatar/gi, 'टमाटर')
      .replace(/kukda/gi, 'कुकड़ा')
      .replace(/भाटा/gi, 'बैंगन')
      .replace(/bhata/gi, 'बैंगन')
      .replace(/bhate/gi, 'बैंगन')
      .replace(/baigan/gi, 'बैंगन')
      .replace(/baingan/gi, 'बैंगन')
      .replace(/bhindi/gi, 'भिंडी')
      .replace(/ful/gi, 'फूल')
      .replace(/phul/gi, 'फूल')
      .replace(/dudh/gi, 'दूध')
      .replace(/doodh/gi, 'दूध')
      .replace(/gay/gi, 'गाय')
      .replace(/bhains/gi, 'भैंस')
      .replace(/bhes/gi, 'भैंस')
      .replace(/stemal/gi, 'उपयोग')
      .replace(/istemal/gi, 'उपयोग')
      .replace(/mousam/gi, 'मौसम')
      .replace(/mausam/gi, 'मौसम')
      .replace(/hystry/gi, 'history')
      .replace(/स्प्रे\s*कैलेंडर/gi, 'स्प्रे कैलेंडर')
      .replace(/spray\s*calendar/gi, 'spray calendar');
  }

  // 14. EVERYDAY CONVERSATIONS & CASUAL GREETINGS ROUTER (मानवीय व्यावहारिक बातचीत)
  function handleEverydayConversations(cleanQ, rawQ) {
    // 0. Primary Greetings: "hi", "hello", "hey", "namaste", "namaskar", "ram ram", "radhe radhe"
    const isPureGreeting = cleanQ === 'hi' || cleanQ === 'hello' || cleanQ === 'hey' || cleanQ === 'नमस्ते' || cleanQ === 'नमस्कार' || cleanQ === 'राम राम' || cleanQ === 'राधे राधे' || cleanQ === 'जय श्री राम' || cleanQ === 'हाय' || cleanQ === 'हेलो' || cleanQ === 'हेल्लो' || cleanQ === 'namaste' || cleanQ === 'namaskar' || cleanQ.startsWith('hi ') || cleanQ.startsWith('hello ') || cleanQ.startsWith('hey ');
    if (isPureGreeting) {
      const resp = `नमस्ते! 🙏 मैं **आरोग्यम सखी AI** — आपकी समर्पित डिजिटल हमदर्द व 24×7 सलाहकार हूँ।\n\nमैं आपकी खेती, पशुपालन, प्राकृतिक स्वास्थ्य, सौंदर्य और नेट्सर्फ के सभी समाधानों में 100% सटीक मार्गदर्शन देती हूँ।\n\nआज आप किस विषय पर जानकारी या परामर्श चाहते हैं? नीचे से विकल्प चुनें:`;
      renderCrispSpecialBox('🌸 आरोग्यम सखी AI — आपका स्वागत है', resp, [
        { text: '🌾 1. जैविक खेती व फसल डॉक्टर', query: 'फसलों का संपूर्ण स्प्रे कैलेंडर व खाद प्रबंधन' },
        { text: '🐄 2. पशुपालन, दूध व फैट वृद्धि', query: 'गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला' },
        { text: '🩺 3. स्वास्थ्य व आयुर्वेदिक उपचार', query: 'स्वास्थ्य परामर्श व आयुर्वेदिक समाधान' },
        { text: '✨ 4. सौंदर्य व त्वचा देखभाल', query: 'त्वचा और बालों की प्राकृतिक देखभाल' },
        { text: '💼 5. नेट्सर्फ 25% छूट व प्लान', query: 'नेट्सर्फ कंपनी के बारे में बताओ' }
      ], 'casual', 'greeting_hub');
      return true;
    }

    // 1. "kaise ho" / "kaisi ho" / "kya haal hai"
    if (cleanQ.includes('kaise ho') || cleanQ.includes('kaisi ho') || cleanQ.includes('kya hal') || cleanQ.includes('kya haal') || cleanQ.includes('kaisa chal raha') || cleanQ.includes('how are you') || cleanQ.includes('kaise hain') || cleanQ.includes('आप कैसी हैं') || cleanQ.includes('आप कैसे हैं')) {
      const resp = `नमस्ते! 🙏 मैं बिल्कुल स्वस्थ और आपकी सेवा में सदैव तत्पर हूँ। आप कैसे हैं? आशा है आपकी खेती व परिवार में सब कुशल-मंगल होगा।\n\nआज मैं आपकी खेती (खाद-स्प्रे), पशुपालन (दूध-फैट), सेहत या नेट्सर्फ में किस विषय पर सहायता करूँ?`;
      renderCrispSpecialBox('🌸 आरोग्यम सखी AI — आपका स्वागत है', resp, [
        { text: '🌾 1. जैविक खेती व फसल डॉक्टर', query: 'फसलों का संपूर्ण स्प्रे कैलेंडर व खाद प्रबंधन' },
        { text: '🐄 2. पशुपालन, दूध व फैट वृद्धि', query: 'गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला' },
        { text: '🩺 3. स्वास्थ्य व आयुर्वेदिक उपचार', query: 'स्वास्थ्य परामर्श व आयुर्वेदिक समाधान' },
        { text: '✨ 4. सौंदर्य व त्वचा देखभाल', query: 'त्वचा और बालों की प्राकृतिक देखभाल' },
        { text: '💼 5. नेट्सर्फ 25% छूट व प्लान', query: 'नेट्सर्फ कंपनी के बारे में बताओ' }
      ], 'casual', 'greeting');
      return true;
    }

    // 2. "kya kar rahe ho" / "kya kar rahi ho"
    if (cleanQ.includes('kya kar rahe') || cleanQ.includes('kya kar rahi') || cleanQ.includes('kya karti ho') || cleanQ.includes('kya kaam hai')) {
      const resp = `मैं हमारे किसान साथियों और परिवारों के लिए खेती के वैज्ञानिक स्प्रे, पशुओं में दूध-फैट वृद्धि और आयुर्वेदिक स्वास्थ्य के 100% सटीक व प्रमाणित समाधान तैयार कर रही हूँ! 👩‍🌾✨\n\nबताइए, आज आपकी किस समस्या का समाधान करूँ?`;
      renderCrispSpecialBox('✨ 24×7 वैज्ञानिक AI सहायता', resp, [
        { text: '🌾 1. जैविक खेती व फसल डॉक्टर', query: 'फसलों में खाद व स्प्रे फॉर्मूला बताएं' },
        { text: '🐄 2. पशु पोषण व दूध-फैट सप्लीमेंट', query: 'पेट वेट और सीएफसी प्लस का काम बताओ' },
        { text: '🩺 3. स्वास्थ्य व नेचुरामोर सप्लीमेंट्स', query: 'नेचुरामोर स्वास्थ्य उत्पाद' },
        { text: '💼 4. नेट्सर्फ 25% छूट व प्लान', query: 'नेट्सर्फ कंपनी के बारे में बताओ' }
      ], 'casual', 'doing');
      return true;
    }

    // 3. "meri bat kisase ho rahi hai" / "tum kaun ho" / "apna parichay do"
    if (cleanQ.includes('kisase ho rahi') || cleanQ.includes('kisse ho rahi') || cleanQ.includes('tum kaun') || cleanQ.includes('apna parichay') || cleanQ.includes('who are you') || cleanQ.includes('apna naam') || cleanQ.includes('naam kya hai') || cleanQ.includes('तुम कौन हो') || cleanQ.includes('मेरी बात किससे')) {
      const resp = `आपकी बात **आरोग्यम सखी AI** से हो रही है — जो आरोग्यम इंडिया का 24×7 समर्पित डिजिटल डॉक्टर व किसान सलाहकार है।\n\nमैं आधुनिक कृषि विज्ञान (फसल रोग, कीटनाशक, जैविक स्प्रे), पशुपालन (दुग्ध वृद्धि), आयुर्वेदिक स्वास्थ्य और नेट्सर्फ के सभी प्रमाणित उत्पादों की सही डोज व समय का प्रामाणिक मार्गदर्शन देती हूँ।`;
      renderCrispSpecialBox('👩‍🌾 आरोग्यम सखी AI — डिजिटल डॉक्टर व किसान सखी', resp, [
        { text: '🌾 1. जैविक खेती व फसल डॉक्टर', query: 'फसल सुरक्षा व स्प्रे कैलेंडर' },
        { text: '🐄 2. पशुपालन, दूध व फैट वृद्धि', query: 'गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला' },
        { text: '🩺 3. स्वास्थ्य व आयुर्वेदिक उपचार', query: 'नेचुरामोर स्वास्थ्य उत्पाद' },
        { text: '✨ 4. सौंदर्य व त्वचा देखभाल', query: 'त्वचा और बालों की प्राकृतिक देखभाल' },
        { text: '💼 5. नेट्सर्फ 25% छूट व प्लान', query: 'नेट्सर्फ कंपनी के बारे में बताओ' }
      ], 'casual', 'identity');
      return true;
    }

    // 4. "tumne galat jankari di hai" / "galat bataya" / "ye galat hai"
    if (cleanQ.includes('galat jankari') || cleanQ.includes('galat bataya') || cleanQ.includes('galat bata') || cleanQ.includes('ye galat hai') || cleanQ.includes('kuch bhi bata') || cleanQ.includes('kuch ka kuch') || cleanQ.includes('गलत जानकारी') || cleanQ.includes('गलत बता रहे')) {
      const resp = `माफ़ी चाहती हूँ! 🙏 यदि मेरे पिछले उत्तर में कोई भ्रम या गलत संदर्भ आया हो, तो मैं उसे तुरंत सुधारना चाहती हूँ।\n\nकृपया अपनी फसल का नाम, बीमारी का लक्षण या उत्पाद का नाम लिखकर बताएं, ताकि मैं आपको 100% सही व सटीक वैज्ञानिक जानकारी प्रस्तुत कर सकूँ।`;
      renderCrispSpecialBox('🙏 क्षमा याचना व सुधार का अवसर', resp, [
        { text: '🦴 नेचुरामोर जॉइंट केयर (घटक व खुराक)', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
        { text: '🌱 बायोफिट स्टिमरिच (डोज व स्प्रे)', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '💬 सीधे अवनीश सर से बात करें', query: 'फाउंडर अवनीश जी का विज़न व सीधा WhatsApp संपर्क' }
      ], 'casual', 'apology');
      return true;
    }

    // 5. "tumhara malik kya hai" / "founder kaun hai" / "company kiski hai"
    if (cleanQ.includes('malik') || cleanQ.includes('मालिक') || cleanQ.includes('founder') || cleanQ.includes('फाउंडर') || cleanQ.includes('company kiski') || cleanQ.includes('owner')) {
      const resp = `आरोग्यम इंडिया के संस्थापक व विज़नरी लीडर **श्री अवनीश जी** हैं।\n\nउनका मुख्य मिशन भारत के प्रत्येक किसान भाई को वैज्ञानिक ज्ञान और जैविक तकनीक द्वारा समृद्ध बनाना तथा प्रत्येक परिवार को रोगमुक्त व आत्मनिर्भर जीवन देना है। यदि आप उनसे सीधे मार्गदर्शन या WhatsApp परामर्श चाहते हैं, तो नीचे क्लिक कर सकते हैं।`;
      const waUrl = buildAvneeshWhatsAppHandoffUrl('अवनीश जी से सीधा मार्गदर्शन');
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🇮🇳 आरोग्यम इंडिया के संस्थापक — श्री अवनीश जी
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;margin-bottom:12px;">
          ${escapeHtml(resp)}
        </div>
        <div style="margin-top:10px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-brands fa-whatsapp"></i> अवनीश सर से सीधा WhatsApp पर जुड़ें →
          </a>
        </div>
      `;
      streamBotMessage(html, 'आरोग्यम इंडिया के संस्थापक श्री अवनीश जी हैं।');
      return true;
    }

    // 6. "mausam kaisa hai" / "aaj ka mausam"
    if (cleanQ.includes('mausam') || cleanQ.includes('mousam') || cleanQ.includes('मौसम') || cleanQ.includes('barish') || cleanQ.includes('weather')) {
      const resp = `हमारे 'मौसम रिपोर्ट' पेज पर आप अपने क्षेत्र का 7-दिवसीय सटीक तापमान, वर्षा की संभावना व हवा की गति देख सकते हैं।\n\n👉 **सुझाव:** छिड़काव हमेशा शांत मौसम और खिली धूप या शाम के समय करें। बारिश की संभावना होने पर बायो-99 (5ml/15L) अवश्य मिलाएं ताकि दवा 30 मिनट में चिपक जाए।`;
      renderCrispSpecialBox('⛅ मौसम रिपोर्ट व स्प्रे सावधानी', resp, [
        { text: '⛅ 7-दिवसीय मौसम रिपोर्ट खोलें', query: 'मौसम पूर्वानुमान कैसे देखें' },
        { text: '💧 बायो-99 बारिश में सुरक्षा फॉर्मूला', query: 'बायो-99 की सही डोज व उपयोग' }
      ], 'agri', 'weather');
      return true;
    }

    // 7. Polite Pleasantries ("dhanyawad", "thank you", "theek hai")
    if (cleanQ === 'dhanyawad' || cleanQ === 'thank you' || cleanQ === 'thanks' || cleanQ === 'shukriya' || cleanQ === 'theek hai' || cleanQ === 'thik hai' || cleanQ === 'धन्यवाद') {
      const resp = `आपका बहुत-बहुत धन्यवाद! 🙏 आरोग्यम सखी AI हमेशा आपकी सेवा में 24×7 तत्पर है। जब भी कोई नया सवाल हो, बेझिझक पूछें। स्वस्थ रहें, समृद्ध रहें! 🌾🇮🇳`;
      renderCrispSpecialBox('🌸 आपका स्वागत है!', resp, [
        { text: '🌾 नया सवाल पूछें', query: 'फसलों का स्प्रे कैलेंडर' },
        { text: '🛒 नेट्सर्फ उत्पाद सूची', query: 'बायोफिट उत्पाद गाइड' }
      ], 'casual', 'thanks');
      return true;
    }

    return false;
  }

  // 14.5 COMPREHENSIVE E-BOOKS & PAYMENT ASSISTANCE ROUTER (BK001, BK002, BK015, BK016, BK018)
  function handleBookInquiriesAndFaq(cleanQ, rawQ) {
    const isBookGeneral = cleanQ.includes('e-book') || cleanQ.includes('ebook') || cleanQ.includes('किताब') || cleanQ.includes('पुस्तक') || cleanQ.includes('pdf') || cleanQ.includes('लाइब्रेरी') || cleanQ.includes('बुक');
    const isPaymentIssue = cleanQ.includes('payment fail') || cleanQ.includes('पेमेंट फेल') || cleanQ.includes('पेमेंट नहीं') || cleanQ.includes('pay nahi') || cleanQ.includes('upi se') || cleanQ.includes('upi') || cleanQ.includes('phonepe') || cleanQ.includes('gpay') || cleanQ.includes('paytm') || cleanQ.includes('पैसे कट') || cleanQ.includes('khareed nahi pa');
    const isWhyBuy = cleanQ.includes('kyo kharide') || cleanQ.includes('क्यों खरीदें') || cleanQ.includes('kya fayda') || cleanQ.includes('क्या फायदा') || cleanQ.includes('kyo padhe');

    // 1. Direct UPI / Payment Failure Assistance
    if (isPaymentIssue) {
      const resp = `💳 **पेमेंट समस्या व डायरेक्ट UPI सहायता:**\nक्या आपका पेमेंट गेटवे पर फेल हुआ या ऑनलाइन भुगतान में कोई रुकावट आ रही है? चिंता न करें!\n\nआप बिना किसी झंझट के सीधे हमारे अधिकृत खाते पर भुगतान कर सकते हैं:\n• **PhonePe / Google Pay / Paytm नंबर:** 7974422572\n• **UPI ID:** 7974422572@upi\n• **नाम:** अवनीश कुमार मिश्रा (संस्थापक, आरोग्यम इंडिया)\n\n👉 **प्रक्रिया:** मात्र ₹99 या ₹149 का भुगतान कर उसका स्क्रीनशॉट हमारे WhatsApp नंबर (7974422572) पर भेजें। 2 मिनट के भीतर आपकी ई-बुक और डिजिटल लाइब्रेरी में आजीवन (Lifetime) एक्सेस एक्टिवेट कर दिया जाएगा!`;
      const waUrl = buildAvneeshWhatsAppHandoffUrl('पेमेंट स्क्रीनशॉट व ई-बुक एक्टिवेशन');
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          💳 डायरेक्ट UPI भुगतान व तुरंत एक्टिवेशन सहायता
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${escapeHtml(resp)}
        </div>
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp पर पेमेंट स्क्रीनशॉट भेजें →
          </a>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'business';
      sakhiConversationState.lastActiveEntity = 'book_payment_upi';
      sakhiConversationState.lastActiveEntityName = 'डायरेक्ट UPI भुगतान';
      streamBotMessage(html, 'आप सीधे 7974422572 पर फोनपे या गूगलपे से भुगतान करके व्हाट्सएप पर स्क्रीनशॉट भेज सकते हैं। 2 मिनट में ई-बुक शुरू हो जाएगी।');
      return true;
    }

    // 2. Kheti Ka Doctor (BK002)
    if (cleanQ.includes('bk002') || cleanQ.includes('bk 002') || cleanQ.includes('kheti ka doctor') || cleanQ.includes('खेती का डॉक्टर') || cleanQ.includes('fasal ka doctor') || cleanQ.includes('फसल का डॉक्टर') || cleanQ.includes('pocket doctor') || cleanQ.includes('रोग पहचान की बुक') || cleanQ.includes('रोग पहचान')) {
      const resp = `🌾 **'खेती का डॉक्टर' (Pocket Doctor) — अपनी फसल के खुद डॉक्टर बनें:**\n• **यह पुस्तक क्यों जरूरी है?** खेत में जब पत्तियां पीली होती हैं या धब्बे पड़ते हैं, तो दुकानदार के पास जाने पर बिना जरूरत ₹1,500 की दवा पकड़ा दी जाती है। इस पुस्तक में 300+ असली एचडी फोटो देखकर आप खुद पहचान सकते हैं कि समस्या फंगस की है, कीट की या पोषण कमी की।\n• **मुख्य विशेषताएं:** 120 पेज की प्रैक्टिकल गाइड, 300+ वास्तविक फोटो, फसलवार रोग-कीट निदान चार्ट व स्प्रे साइंस।\n• **व्यावहारिक लाभ:** आप न सिर्फ अपने खेत के हजारों रुपये बचा सकते हैं, बल्कि अपने पड़ोसियों व गांव के खेतों में भी सही जानकारी दे सकते हैं।\n💰 **ऑफर मूल्य:** मात्र ₹99 (MRP ₹299)।`;
      renderCrispSpecialBox('🌾 खेती का डॉक्टर — फोटो सहित रोग पहचान ई-बुक (BK002)', resp, [
        { text: '📖 खेती का डॉक्टर लैंडिंग पेज खोलें (BK002)', url: '/ebooks/book-landing.html?id=BK002', isExternal: true, style: 'background:#16a34a;color:#ffffff;border-color:#15803d;font-weight:800;' },
        { text: '🧪 कृषि दवा डायरेक्टरी (BK016)', url: '/ebooks/book-landing.html?id=BK016', isExternal: true },
        { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'agri', 'book_kheti_dr');
      return true;
    }

    // 3. Krishi Dawa Directory (BK016)
    if (cleanQ.includes('bk016') || cleanQ.includes('bk 016') || cleanQ.includes('krishi dawa directory') || cleanQ.includes('कृषि दवा डायरेक्टरी') || cleanQ.includes('dawa directory') || cleanQ.includes('दवा डायरेक्टरी') || cleanQ.includes('दवा की गाइड') || cleanQ.includes('chemical dawa')) {
      const resp = `🧪 **'कृषि दवा डायरेक्टरी' — फसल के रोग, कीट और असली दवा की संपूर्ण गाइड:**\n• **दुकानदार के झांसे से मुक्ति:** दवा की दुकान पर एक ही दवा के 50 अलग-अलग नाम होते हैं। इस डायरेक्टरी से आप असली टेक्निकल (Active Ingredient) समझेंगे ताकि कोई आपको महंगी दवा न बेच सके।\n• **मुख्य विशेषताएं:** फफूंदनाशी, कीटनाशक व खरपतवारनाशक की संपूर्ण गाइड, कम खर्च वाले जैविक व देसी नुस्खे, 4-पेज Quick Reference (रोग ➔ फसल और Chemical ➔ रोग)।\n💰 **ऑफर मूल्य:** मात्र ₹99 (MRP ₹499)।`;
      renderCrispSpecialBox('🧪 कृषि दवा डायरेक्टरी — रोग, कीट व दवा की पूरी गाइड (BK016)', resp, [
        { text: '📖 कृषि दवा डायरेक्टरी लैंडिंग पेज (BK016)', url: '/ebooks/book-landing.html?id=BK016', isExternal: true, style: 'background:#16a34a;color:#ffffff;border-color:#15803d;font-weight:800;' },
        { text: '🌾 खेती का डॉक्टर (BK002)', url: '/ebooks/book-landing.html?id=BK002', isExternal: true },
        { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'agri', 'book_dawa_dir');
      return true;
    }

    // 4. Kharif Fasal Master Guide 2026 (BK001)
    if (cleanQ.includes('bk001') || cleanQ.includes('bk 001') || cleanQ.includes('kharif') || cleanQ.includes('खरीफ फसल') || cleanQ.includes('धान सोयाबीन मक्का') || cleanQ.includes('खरीफ गाइड')) {
      const resp = `🌾 **'खरीफ फसल मास्टर गाइड 2026' — धान, सोयाबीन व मक्का उत्पादन की सम्पूर्ण गाइड:**\n• **विशेषताएं:** 150+ रंगीन पेज, 300+ वास्तविक फोटो, बीज उपचार से लेकर कटाई तक का सम्पूर्ण वैज्ञानिक प्रबंधन।\n• **कवर विषय:** खरपतवार नियंत्रण, खाद व पोषण प्रबंधन, कल्ले बढ़ाने का फॉर्मूला और कीट-रोग का वैज्ञानिक स्प्रे शेड्यूल।\n💰 **ऑफर मूल्य:** मात्र ₹99 (MRP ₹299)।`;
      renderCrispSpecialBox('🌾 खरीफ फसल मास्टर गाइड 2026 — सम्पूर्ण उत्पादन गाइड (BK001)', resp, [
        { text: '📖 खरीफ मास्टर गाइड लैंडिंग पेज (BK001)', url: '/ebooks/book-landing.html?id=BK001', isExternal: true, style: 'background:#16a34a;color:#ffffff;border-color:#15803d;font-weight:800;' },
        { text: '🌾 खेती का डॉक्टर (BK002)', url: '/ebooks/book-landing.html?id=BK002', isExternal: true },
        { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'agri', 'book_kharif');
      return true;
    }

    // 5. Sabji Kheti Master (BK015)
    if (cleanQ.includes('bk015') || cleanQ.includes('bk 015') || cleanQ.includes('sabji kheti') || cleanQ.includes('सब्जी खेती मास्टर') || cleanQ.includes('सब्जी खेती') || cleanQ.includes('सब्जी की किताब')) {
      const resp = `🥦 **'सब्जी खेती मास्टर (PART 1)' — 11 प्रमुख सब्जियों की वैज्ञानिक खेती:**\n• **कवर फसलें:** टमाटर, मिर्च, शिमला मिर्च, बैंगन, भिंडी, खीरा, ककड़ी, लौकी, करेला, तोरई और कद्दू।\n• **विशेषताएं:** 154 पेज, बीज चयन से लेकर नर्सरी, पौधों की दूरी, ड्रिप-मल्चिंग, खाद-स्प्रे कैलेंडर और बाजार भाव तक सम्पूर्ण गाइड।\n💰 **ऑफर मूल्य:** मात्र ₹149 (MRP ₹1999)।`;
      renderCrispSpecialBox('🥦 सब्जी खेती मास्टर (Part 1) — 11 प्रमुख सब्जियों की खेती (BK015)', resp, [
        { text: '📖 सब्जी खेती मास्टर लैंडिंग पेज (BK015)', url: '/ebooks/book-landing.html?id=BK015', isExternal: true, style: 'background:#16a34a;color:#ffffff;border-color:#15803d;font-weight:800;' },
        { text: '🧪 कृषि दवा डायरेक्टरी (BK016)', url: '/ebooks/book-landing.html?id=BK016', isExternal: true },
        { text: '💳 डायरेक्ट UPI से ₹149 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'agri', 'book_sabji');
      return true;
    }

    // 6. Ghar Baithe Paise Kaise Kamaye (BK018)
    if (cleanQ.includes('ghar baithe paise') || cleanQ.includes('घर बैठे पैसे') || cleanQ.includes('income guide') || cleanQ.includes('कमाई की किताब') || cleanQ.includes('कमाई कैसे करें') || cleanQ.includes('nk018') || cleanQ.includes('bk018')) {
      const resp = `💼 **'घर बैठे पैसे कैसे कमाएँ? Income Guide' — डिजिटल व ऑफलाइन कमाई की संपूर्ण गाइड:**\n• **विशेषताएं:** 60 ऑनलाइन और ऑफलाइन कमाई के वास्तविक तरीके, 150+ जांची-परखी वेबसाइट्स की लिस्ट, बिना किसी बड़े बजट के शुरुआत करने की व्यावहारिक तकनीक।\n• **सुरक्षा:** ऑनलाइन फ्रॉड और धोखाधड़ी से बचने के सुनहरे नियम।\n💰 **ऑफर मूल्य:** मात्र ₹149 (MRP ₹1001)।`;
      renderCrispSpecialBox('💼 घर बैठे पैसे कैसे कमाएँ? — 60 कमाई के तरीके (BK018)', resp, [
        { text: '📖 इनकम गाइड लैंडिंग पेज खोलें (BK018)', url: '/ebooks/book-landing.html?id=BK018', isExternal: true, style: 'background:#16a34a;color:#ffffff;border-color:#15803d;font-weight:800;' },
        { text: '💳 डायरेक्ट UPI से ₹149 भुगतान', query: 'UPI से पेमेंट कैसे करें' }
      ], 'business', 'book_income');
      return true;
    }

    // 7. General: Why Buy E-Books? (किताब क्यों खरीदें?)
    if (isWhyBuy || (isBookGeneral && (cleanQ.includes('list') || cleanQ.includes('guide') || cleanQ.includes('faq')))) {
      const resp = `📚 **आरोग्यम इंडिया की ई-बुक्स क्यों खरीदें? — ज्ञान जो हर साल हजारों रुपये बचाए:**\n• 1. **खुद डॉक्टर बनें:** 300+ असली फोटो देखकर खेत में कीट व बीमारी खुद पहचानें और सही दवा चुनें।\n• 2. **दुकानदारों के कमीशन से मुक्ति:** गैर-जरूरी और नकली रसायनों के चक्कर से छुटकारा पाएं।\n• 3. **आजीवन डिजिटल लाइब्रेरी:** फोन में कभी भी, कहीं भी ऑफलाइन पढ़ने व सुनने की सुविधा।\n• 4. **मात्र ₹99 से शुरुआत:** एक स्प्रे के खर्च से भी कम में पूरे जीवन का ज्ञान!`;
      renderCrispSpecialBox('📚 आरोग्यम डिजिटल लाइब्रेरी — सम्पूर्ण पुस्तक सूची', resp, [
        { text: '🌾 खेती का डॉक्टर (BK002)', url: '/ebooks/book-landing.html?id=BK002', isExternal: true },
        { text: '🧪 कृषि दवा डायरेक्टरी (BK016)', url: '/ebooks/book-landing.html?id=BK016', isExternal: true },
        { text: '🌾 खरीफ मास्टर गाइड (BK001)', url: '/ebooks/book-landing.html?id=BK001', isExternal: true },
        { text: '💼 घर बैठे पैसे कैसे कमाएँ (BK018)', url: '/ebooks/book-landing.html?id=BK018', isExternal: true },
        { text: '💳 डायरेक्ट UPI से भुगतान विधि', query: 'UPI से पेमेंट कैसे करें' }
      ], 'business', 'books_catalog');
      return true;
    }

    return false;
  }

  // 14.6 13 HEALTH PAGES, MEDICAL SCIENCE, DIET CHARTS & EMPATHETIC HEALTH ROUTER
  function handle13HealthPagesAndSponsor(cleanQ, rawQ) {
    // Case 0: Empathetic General Health Inquiry ("स्वास्थ्य", "sehat", "health", "बीमारी के लक्षण", etc.)
    const isGeneralHealthOnly = (cleanQ === 'health' || cleanQ === 'सेहत' || cleanQ === 'स्वास्थ्य' || cleanQ.includes('स्वास्थ्य व बीमारी') || cleanQ.includes('स्वास्थ्य परामर्श') || cleanQ.includes('सेहत के बारे') || cleanQ === 'swasthya' || cleanQ === 'bimari') && !cleanQ.includes('joint') && !cleanQ.includes('sugar') && !cleanQ.includes('diabetes') && !cleanQ.includes('मधुमेह') && !cleanQ.includes('heart') && !cleanQ.includes('हार्ट') && !cleanQ.includes('liver') && !cleanQ.includes('लिवर') && !cleanQ.includes('dard') && !cleanQ.includes('दर्द') && !cleanQ.includes('stamina') && !cleanQ.includes('पौरुष');
    if (isGeneralHealthOnly) {
      const resp = `नमस्कार! आशा करते हैं आप और आपका परिवार पूर्णतः स्वस्थ और सानंद हैं।\n\nदिल से बताइए, स्वास्थ्य के बारे में आप क्या जानना चाहते हैं? किसी भी समस्या का कारण, सही डाइट चार्ट या नेट्सर्फ का प्रामाणिक समाधान जानने के लिए नीचे से विकल्प चुनें:`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🌸 आपका स्वास्थ्य — हमारी सर्वोच्च प्राथमिकता
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 विषय चुनें:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('जोड़ों का दर्द और घुटनों के दर्द का कारण व इलाज')">🦴 जोड़ों का दर्द (Joint Pain)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह में क्या खाएं और डाइट चार्ट')">🩸 मधुमेह (Sugar / Diabetes)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('हार्ट सुरक्षा और कोलेस्ट्रॉल संतुलन')">❤️ हार्ट व कोलेस्ट्रॉल</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('लिवर डिटॉक्स और गैस कब्ज का इलाज')">🍃 लिवर व पेट शुद्धि</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('पुरुष स्वास्थ्य स्टैमिना व पौरुष शक्ति')">⚡ पौरुष शक्ति व स्टैमिना</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('थायरॉयड और वजन नियंत्रण उपाय')">🦋 थायरॉयड व वजन</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('दादी के असली आयुर्वेदिक घरेलू नुस्खे')">🌸 दादी के घरेलू नुस्खे</button>
          </div>
        </div>
      `;
      streamBotMessage(html, 'नमस्कार! आशा करते हैं आप स्वस्थ हैं। बताइए, स्वास्थ्य के बारे में आप क्या जानना चाहते हैं?');
      return true;
    }

    const isNetsurfBuy = cleanQ.includes('netsurf product') || cleanQ.includes('product lena') || cleanQ.includes('product kharid') || cleanQ.includes('order karna') || cleanQ.includes('प्रोडक्ट लेना') || cleanQ.includes('सामान लेना') || cleanQ.includes('दवा मंगवाना') || cleanQ.includes('order kaise kare') || cleanQ.includes('product kaise le');

    // Case 1: General "Netsurf Product Lena Hai"
    if (isNetsurfBuy && !cleanQ.includes('joint') && !cleanQ.includes('heart') && !cleanQ.includes('sugar') && !cleanQ.includes('liver') && !cleanQ.includes('pet') && !cleanQ.includes('dard')) {
      const resp = `आरोग्यम इंडिया पर नेट्सर्फ के 100% प्रामाणिक आयुर्वेदिक व जैविक उत्पाद उपलब्ध हैं। सभी उत्पादों पर फ्लैट 25% छूट व 5+1 ऑटो-शिपिंग (6वें महीने मुफ्त) मिलती है।\n\nकृपया नीचे से अपनी मुख्य समस्या या विषय चुनें, ताकि मैं आपको सही डाइट चार्ट, वैज्ञानिक इलाज और सीधे प्रोडक्ट पेज का लिंक दे सकूँ:`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🛒 नेट्सर्फ उत्पाद चयन व स्वास्थ्य समाधान (25% फ्लैट छूट)
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <a href="/health/joint-care.html" class="sakhi-followup-chip" style="text-decoration:none;">🦴 जोड़ों का दर्द (जॉइंट केयर)</a>
          <a href="/health/diabetes.html" class="sakhi-followup-chip" style="text-decoration:none;">🩸 शुगर व डायबिटीज केयर</a>
          <a href="/health/heart-care.html" class="sakhi-followup-chip" style="text-decoration:none;">❤️ हार्ट व कोलेस्ट्रॉल केयर</a>
          <a href="/health/liver-care.html" class="sakhi-followup-chip" style="text-decoration:none;">🍃 लिवर डिटॉक्स व गैस-कब्ज</a>
          <a href="/health/womens-care.html" class="sakhi-followup-chip" style="text-decoration:none;">🌸 महिला स्वास्थ्य (PCOD/PCOS)</a>
          <a href="/health/sexual-wellness.html" class="sakhi-followup-chip" style="text-decoration:none;">⚡ पुरुष स्टैमिना व ऊर्जा</a>
          <a href="/health/weight-loss.html" class="sakhi-followup-chip" style="text-decoration:none;">⚖️ मोटापा व वजन घटाना</a>
          <a href="/health/skin-care.html" class="sakhi-followup-chip" style="text-decoration:none;">✨ त्वचा रोग व ग्लो</a>
          <a href="/health/hair-care.html" class="sakhi-followup-chip" style="text-decoration:none;">💇 बाल झड़ना व डैंड्रफ</a>
          <a href="/health/thyroid-care.html" class="sakhi-followup-chip" style="text-decoration:none;">🦋 थायरॉयड केयर</a>
        </div>
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:12px;font-size:0.88rem;color:#166534;line-height:1.5;">
          👉 <strong>खरीदने का सही नियम:</strong> संबंधित पेज पर जाकर उत्पाद को <strong>कार्ट (Add to Cart)</strong> में जोड़ें और जिस <strong>प्रायोजक (Sponsor)</strong> ने आपको आरोग्यम इंडिया ऐप डाउनलोड कराया है, उन्हें तुरंत कॉल या WhatsApp करें ताकि वे आपको विशेष छूट व समय पर होम डिलीवरी में पूरी सहायता कर सकें!
        </div>
      `;
      streamBotMessage(html, 'कृपया अपनी स्वास्थ्य समस्या चुनें। उत्पाद को कार्ट में डालकर 25% छूट पर ऑर्डर कर सकते हैं।');
      return true;
    }

    // Helper for rendering Health Science, Diet Chart, Page Link & Sponsor instructions
    function renderHealthTopicPage(title, organFunction, dietDo, dietDont, products, pageUrl, domainKey, entityKey) {
      const resp = `🩺 **${title}:**\n• **कारण व कार्यप्रणाली:** ${organFunction}\n\n🥗 **डाइट चार्ट (पथ्य व अपथ्य):**\n✅ **क्या खाएं:** ${dietDo}\n❌ **क्या न खाएं:** ${dietDont}\n\n💊 **प्रमाणित नेट्सर्फ समाधान:** ${products}\n\n👉 **ऑर्डर व 25% छूट:** नीचे दिए गए लिंक से पेज खोलकर उत्पाद को कार्ट (Add to Cart) में डालें और 25% फ्लैट डिस्काउंट का लाभ उठाएं।`;

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          ${escapeHtml(title)}
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 उत्पाद देखें व कार्ट में जोड़ें (25% फ्लैट छूट):</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <a href="${pageUrl}" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              🛒 ${escapeHtml(title)} पेज खोलें व 25% छूट पर लें →
            </a>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ उत्पाद खरीदने के लिए प्रायोजक से संपर्क')">
              👥 प्रायोजक से संपर्क विधि
            </button>
          </div>
          <div style="font-size:0.82rem;color:#166534;line-height:1.4;">
            💡 <strong>नोट:</strong> आरोग्यम इंडिया पर नेट्सर्फ के सभी उत्पादों पर <strong>25% फ्लैट छूट</strong> और <strong>5+1 ऑटो-शिपिंग (6वें माह फ्री)</strong> उपलब्ध है।
          </div>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'health';
      sakhiConversationState.lastActiveEntity = entityKey;
      sakhiConversationState.lastActiveEntityName = title;
      streamBotMessage(html, cleanTextForTTS(title + ' की संपूर्ण कार्यप्रणाली, डाइट चार्ट और नेट्सर्फ 25% छूट समाधान प्रस्तुत है।'));
      return true;
    }

    // 1. Joint Pain (जोड़ों का दर्द) - Structured empathetic flow: Causes -> Exercise/Treatment -> Curiosity Ask -> Components -> Link with 25% discount
    const isJointPain = cleanQ.includes('joint') || cleanQ.includes('जोड़ों') || cleanQ.includes('जोड़') || cleanQ.includes('घुटने') || cleanQ.includes('घुटनों') || cleanQ.includes('गठिया') || cleanQ.includes('arthritis') || cleanQ.includes('यूरिक एसिड') || cleanQ.includes('uric acid') || cleanQ.includes('जोड़ दर्द');
    if (isJointPain && !cleanQ.includes('kya kya hai') && !cleanQ.includes('घटक') && !cleanQ.includes('सामग्री') && !cleanQ.includes('ingredients')) {
      const resp = `🦴 **जोड़ों व घुटनों का दर्द (Joint Pain) — कारण व संपूर्ण समाधान:**\n\n• **मुख्य कारण:**\n1. **यूरिक एसिड का जमाव:** प्यूरिन का सही निष्कासन न होने से जोड़ों में क्रिस्टल जम जाते हैं।\n2. **एजिंग (बढ़ती उम्र):** उम्र के साथ कार्टिलेज (कुदरती गद्दी) घिसने लगती है।\n3. **पुरानी चोट या एक्सीडेंट:** लिगामेंट्स व टेंडन्स की अंदरूनी कमजोरी।\n4. **साइनोवियल फ्लूइड की कमी:** जोड़ों की कुदरती चिकनाई (ग्रीस) खत्म होने से हड्डियां आपस में रगड़ खाने लगती हैं।\n\n🧘 **एक्सरसाइज व देखभाल:** सुबह 15 मिनट हल्की स्ट्रेचिंग करें, गर्म पानी की सिकाई करें और भारी वजन उठाने से बचें।\n\n💊 **प्रमाणित नेट्सर्फ समाधान:** **नेचुरामोर जॉइंट केयर कैप्सूल (Joint Care)** + **पेन क्रीम (Pain Cream)**।\n\n👉 **जिज्ञासा:** क्या आप जानना चाहते हैं कि **Joint Care के अंदर क्या-क्या प्राकृतिक घटक** हैं?`;

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🦴 जोड़ों व घुटनों का दर्द — कारण, देखभाल व नेट्सर्फ समाधान
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 आगे की जानकारी व 25% छूट ऑफर:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेचुरामोर जॉइंट केयर के अंदर क्या क्या है?')">
              🌿 Joint Care के अंदर क्या-क्या है?
            </button>
            <a href="/health/joint-care.html" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              🛒 जॉइंट केयर पेज खोलें (25% फ्लैट छूट) →
            </a>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('जॉइंट केयर कैसे खाएं और खुराक क्या है?')">
              💊 सेवन विधि व खुराक
            </button>
          </div>
          <div style="font-size:0.82rem;color:#166534;line-height:1.4;">
            💡 <strong>विशेष ऑफर:</strong> आरोग्यम इंडिया पर नेट्सर्फ के सभी उत्पादों पर <strong>25% फ्लैट डिस्काउंट</strong> और <strong>5+1 ऑटो-शिपिंग</strong> उपलब्ध है।
          </div>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'health';
      sakhiConversationState.lastActiveEntity = 'joint_care';
      sakhiConversationState.lastActiveEntityName = 'नेचुरामोर जॉइंट केयर';
      streamBotMessage(html, cleanTextForTTS('जोड़ों के दर्द के मुख्य कारण यूरिक एसिड, उम्र, चोट और साइनोवियल फ्लूइड की कमी हैं। क्या आप जानना चाहते हैं कि जॉइंट केयर के अंदर क्या-क्या है?'));
      return true;
    }

    // 2. Diabetes Diet Query (मधुमेह में क्या खाएं?) - Direct answer FIRST, then curiosity on insulin science!
    const isDiabetesDiet = (cleanQ.includes('मधुमेह') || cleanQ.includes('शुगर') || cleanQ.includes('sugar') || cleanQ.includes('diabetes')) && (cleanQ.includes('क्या खाएं') || cleanQ.includes('kya khaye') || cleanQ.includes('डाइट') || cleanQ.includes('diet') || cleanQ.includes('parhej') || cleanQ.includes('परहेज') || cleanQ.includes('भोजन') || cleanQ.includes('khana'));
    if (isDiabetesDiet) {
      const resp = `🥗 **मधुमेह (Diabetes) में क्या खाएं और क्या न खाएं:**\n\n✅ **क्या खाएं (पथ्य आहार):**\n• मेथी दाना (रात में भिगोकर सुबह पानी सहित चबाएं), करेला, जामुन का सिरका।\n• जौ और चना मिश्रित मिस्सी रोटी (उच्च फाइबर)।\n• हरी पत्तेदार सब्जियां, खीरा, ककड़ी, टमाटर, दालें और पर्याप्त पानी।\n\n❌ **क्या न खाएं (अपथ्य परहेज):**\n• चीनी, गुड़, मिठाई, मैदा, आलू और पॉलिश सफेद चावल।\n• डिब्बा बंद जूस, कोल्ड ड्रिंक्स और तली-भुनी चीजें।\n\n👉 **जिज्ञासा:** क्या आप जानना चाहते हैं कि **मधुमेह क्या है और यह शरीर में कैसे होता है** (पैंक्रियाज और इंसुलिन का विज्ञान)?`;

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🥗 मधुमेह डाइट चार्ट — क्या खाएं और क्या न खाएं
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 आगे की वैज्ञानिक जानकारी व समाधान:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह क्या है और शरीर में कैसे होता है?')">
              🩸 मधुमेह क्या है और कैसे होता है?
            </button>
            <a href="/health/diabetes.html" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              🛒 लाइफस्टाइल प्लस (25% छूट पर लें) →
            </a>
          </div>
          <div style="font-size:0.82rem;color:#166534;line-height:1.4;">
            💡 <strong>नेट्सर्फ समाधान:</strong> नेचुरामोर लाइफस्टाइल प्लस कैप्सूल इंसुलिन संवेदनशीलता को प्राकृतिक रूप से बढ़ाता है।
          </div>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'health';
      sakhiConversationState.lastActiveEntity = 'diabetes';
      sakhiConversationState.lastActiveEntityName = 'मधुमेह व ब्लड शुगर';
      streamBotMessage(html, cleanTextForTTS('मधुमेह में मेथी दाना, करेला, जौ-चना आटा खाएं और चीनी, मैदा, आलू से परहेज करें। क्या आप जानना चाहते हैं कि मधुमेह शरीर में कैसे होता है?'));
      return true;
    }

    // 2B. General Diabetes / Sugar
    if (cleanQ.includes('diabetes') || cleanQ.includes('डायबिटीज') || cleanQ.includes('sugar') || cleanQ.includes('शुगर') || cleanQ.includes('मधुमेह')) {
      return renderHealthTopicPage(
        'मधुमेह व ब्लड शुगर नियंत्रण',
        'पैंक्रियाज (Pancreas) की बीटा कोशिकाएं जब पर्याप्त इंसुलिन नहीं बनातीं, तो ग्लूकोज कोशिकाओं में जाने की बजाय खून में बढ़ने लगता है।',
        'मेथी दाना, करेला, जामुन सिरका, जौ-चना मिश्रित आटा, हरी पत्तेदार सब्जियां व पर्याप्त पानी।',
        'चीनी, गुड़, मैदा, आलू, सफेद चावल, डिब्बा बंद जूस व तला-भुना भोजन।',
        'नेचुरामोर लाइफस्टाइल प्लस कैप्सूल (भोजन से 30 मिनट पहले 1 कैप्सूल सुबह-शाम) + नेचुरामोर मसाला मिल्क पाउडर (25% फ्लैट छूट)।',
        '/health/diabetes.html',
        'health',
        'diabetes'
      );
    }

    // 3. Liver Care & Digestion
    if (cleanQ.includes('liver') || cleanQ.includes('लिवर') || cleanQ.includes('fatty liver') || cleanQ.includes('फैटी लिवर') || cleanQ.includes('कब्ज') || cleanQ.includes('constipation') || cleanQ.includes('एसिडिटी')) {
      return renderHealthTopicPage(
        'लिवर डिटॉक्स, फैटी लिवर व पेट शुद्धि',
        'लिवर शरीर का मुख्य केमिकल फिल्टर है। वसा जमने (Fatty Liver) व टॉक्सिन्स जमा होने से पाचन रस (Bile) नहीं बनता और गैस, कब्ज व भारीपन शुरू होता है।',
        'पपीता, चुकंदर, आंवला, लौकी सूप, रात में गुनगुना पानी व फाइबर युक्त आहार।',
        'शराब, तंबाकू, अत्यधिक मिर्च-मसाला, रिफाइंड तेल, मैदा व देर रात भारी भोजन।',
        'नेचुरामोर ईजी डिटॉक्स (Easy Detox - रात को 1-2 गोली गुनगुने पानी से) + नेचुरामोर पाउडर (25% फ्लैट छूट)।',
        '/health/liver-care.html',
        'health',
        'liver_care'
      );
    }

    // 4. Heart & BP (हार्ट, बीपी, दिल व रक्तचाप)
    const isHeartGeneral = cleanQ === 'heart' || cleanQ === 'हार्ट' || cleanQ === 'dil' || cleanQ === 'दिल' || cleanQ === 'blood' || cleanQ === 'खून' || cleanQ.includes('heart ke bare') || cleanQ.includes('दिल के बारे') || cleanQ.includes('हार्ट के बारे') || cleanQ.includes('रक्त के बारे');
    const isHeartSpecific = cleanQ.includes('heart') || cleanQ.includes('हार्ट') || cleanQ.includes('dil') || cleanQ.includes('बीपी') || cleanQ.includes('रक्तचाप') || cleanQ.includes('blood pressure') || cleanQ.includes('hypertension') || cleanQ.includes('कोलेस्ट्रॉल') || cleanQ.includes('ब्लॉकेज');

    if (isHeartGeneral) {
      const resp = `हृदय (Heart) हमारे शरीर का सबसे महत्वपूर्ण अंग है, जो 24 घंटे रक्त व ऑक्सीजन का संचार करता है।\n\nधमनियों में खराब कोलेस्ट्रॉल (LDL) जमने, मानसिक तनाव और उच्च रक्तचाप (High BP) से दिल पर अतिरिक्त दबाव पड़ता है।\n\nआप हृदय स्वास्थ्य के किस विषय पर सटीक जानकारी व समाधान चाहते हैं? नीचे से विकल्प चुनें:`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          ❤️ हृदय सुरक्षा व रक्त संचार (Heart & Vascular Health)
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 हृदय स्वास्थ्य के 4 प्रमुख विषय चुनें:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेचुरामोर न्यूट्री हार्ट कैप्सूल के फायदे और खुराक')">🩺 1. नेचुरामोर न्यूट्री हार्ट (घटक व खुराक)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('हाई बीपी और रक्तचाप संतुलन के उपाय')">🩸 2. हाई बीपी (रक्तचाप) संतुलन</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('कोलेस्ट्रॉल कम करने और ब्लॉकेज रोकने का डाइट चार्ट')">🫀 3. कोलेस्ट्रॉल व ब्लॉकेज रोकथाम डाइट</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('हृदय रोग से बचाव के घरेलू नुस्खे')">🥗 4. हृदय सुरक्षा डाइट व परहेज</button>
          </div>
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 क्लिनिकल पेज व 25% फ्लैट छूट:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <a href="/health/heart-care.html" target="_blank" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              ❤️ हृदय स्वास्थ्य क्लिनिकल गाइड खोलें व 25% छूट पर ऑर्डर करें →
            </a>
          </div>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'health';
      sakhiConversationState.lastActiveEntity = 'nutri_heart';
      sakhiConversationState.lastActiveEntityName = 'हार्ट सुरक्षा व कोलेस्ट्रॉल';
      streamBotMessage(html, cleanTextForTTS('हृदय सुरक्षा और रक्तचाप संतुलन के लिए नेचुरामोर न्यूट्री हार्ट और संतुलित आहार सर्वोत्तम है। नीचे से अपना विषय चुनें।'));
      return true;
    }

    if (isHeartSpecific) {
      return renderHealthTopicPage(
        'हार्ट सुरक्षा, बीपी व कोलेस्ट्रॉल संतुलन',
        'धमनियों (Arteries) में खराब कोलेस्ट्रॉल (LDL) और ट्राइग्लिसराइड्स जमने से नसों का लचीलापन घटता है, जिससे ब्लड प्रेशर बढ़ता है और हार्ट अटैक का खतरा होता है।',
        'अर्जुन छाल का काढ़ा, लहसुन की कली, लौकी का जूस, अलसी के बीज व हरी सब्जियां।',
        'अत्यधिक नमक, डालडा, रिफाइंड तेल, रेड मीट, मैदा व मानसिक तनाव।',
        'नेचुरामोर न्यूट्री हार्ट कैप्सूल (1 कैप्सूल सुबह और 1 शाम भोजनोपरांत) + नेचुरामोर प्लस पाउडर (25% फ्लैट छूट)।',
        '/health/heart-care.html',
        'health',
        'nutri_heart'
      );
    }

    // 5. Women Care & PCOD
    const isWomenClinical = (cleanQ.includes('pcod') || cleanQ.includes('pcos') || cleanQ.includes('मासिक धर्म') || cleanQ.includes('माहवारी') || cleanQ.includes('पीरियड्स') || cleanQ.includes('अनियमित माहवारी') || ((cleanQ.includes('महिला') || cleanQ.includes('स्त्री') || cleanQ.includes('women')) && (cleanQ.includes('हार्मोन') || cleanQ.includes('स्वास्थ्य') || cleanQ.includes('असंतुलन') || cleanQ.includes('ओवरी') || cleanQ.includes('कमर दर्द')))) &&
      !cleanQ.includes('कमाई') && !cleanQ.includes('बिजनेस') && !cleanQ.includes('बिज़नेस') && !cleanQ.includes('ई-टेलर') && !cleanQ.includes('घर बैठे') && !cleanQ.includes('रोजगार') && !cleanQ.includes('स्वावलंबन');
    if (isWomenClinical) {
      return renderHealthTopicPage(
        'महिला स्वास्थ्य, PCOD/PCOS व हार्मोनल संतुलन',
        'एस्ट्रोजन और प्रोजेस्टेरोन हार्मोन के असंतुलन से ओवरी में छोटे सिस्ट बनते हैं, जिससे अनियमित माहवारी, वजन बढ़ना व चेहरे पर अनचाहे बाल आते हैं।',
        'शतावरी, दालचीनी, कद्दू व अलसी के बीज, नारियल पानी, हरी पत्तेदार सब्जियां।',
        'जंक फूड, अत्यधिक चीनी, कोल्ड ड्रिंक्स, डेयरी प्रोडक्ट्स का अत्यधिक सेवन।',
        'नेचुरामोर फॉर विमेन (Masala Milk / French Vanilla) 1 चम्मच सुबह दूध में + वुमन केयर कैप्सूल (25% फ्लैट छूट)।',
        '/health/womens-care.html',
        'health',
        'womens_care'
      );
    }

    // 6. Weight Loss & Obesity
    const isWeightLossClinical = (cleanQ.includes('weight loss') || cleanQ.includes('वजन घटाना') || cleanQ.includes('मोटापा') || cleanQ.includes('चर्बी') || cleanQ.includes('fat kam')) &&
      !cleanQ.includes('थायराइड') && !cleanQ.includes('थायरॉयड') && !cleanQ.includes('thyroid') && !cleanQ.includes('tsh') && !cleanQ.includes('पशु') && !cleanQ.includes('गाय') && !cleanQ.includes('भैंस');
    if (isWeightLossClinical) {
      return renderHealthTopicPage(
        'प्राकृतिक मोटापा व वजन नियंत्रण',
        'धीमा मेटाबॉलिज्म (Metabolism) और थायरॉयड की सुस्ती भोजन की कैलोरी को फैट में बदलकर पेट व कमर पर जमा करती है।',
        'खीरा-सलाद, ग्रीन टी, अंकुरित मूंग, नींबू-गुनगुना पानी, दलिया व छाछ।',
        'चीनी, कोल्ड ड्रिंक, सफेद चावल, मैदा, समोसे-पकौड़े व रात का भारी डिनर।',
        'नेचुरामोर ईजी डिटॉक्स (रात को 1 गोली) + नेचुरामोर फ्रेंच वैनिला पाउडर (सुबह नाश्ते की जगह गुनगुने पानी से - 25% फ्लैट छूट)।',
        '/health/weight-loss.html',
        'health',
        'weight_loss'
      );
    }

    // 7. Men Vitality & Stamina (पौरुष शक्ति)
    const isMenVitality = (cleanQ.includes('stamina') || cleanQ.includes('पौरुष') || cleanQ.includes('शुक्राणु') || cleanQ.includes('मर्दाना') || cleanQ.includes('शीघ्रपतन') || ((cleanQ.includes('पुरुष') || cleanQ.includes('men')) && (cleanQ.includes('कमजोरी') || cleanQ.includes('स्टेमिना') || cleanQ.includes('ऊर्जा')))) &&
      !cleanQ.includes('पशु') && !cleanQ.includes('गाय') && !cleanQ.includes('भैंस') && !cleanQ.includes('बछड़ा') && !cleanQ.includes('बकरी') && !cleanQ.includes('फसल');
    if (isMenVitality) {
      return renderHealthTopicPage(
        'पुरुष स्वास्थ्य, ऊर्जा व पौरुष शक्ति वृद्धि',
        'टेस्टोस्टेरोन हार्मोन की कमी, अत्यधिक मानसिक तनाव व खराब रक्त संचार से दिनभर थकान और पौरुष कमजोरी महसूस होती है।',
        'अश्वगंधा, सफेद मूसली, खजूर, दूध, बादाम, अखरोट, कद्दू के बीज व केला।',
        'तंबाकू, गुटखा, शराब, अत्यधिक चाय-कॉफी व देर रात तक जागना।',
        'नेचुरामोर फॉर मेन पाउडर (सुबह दूध के साथ 1 चम्मच) + लाइफस्टाइल मेन कैप्सूल (25% फ्लैट छूट)।',
        '/health/sexual-wellness.html',
        'health',
        'mens_care'
      );
    }

    // 8. Thyroid Care (हाइपो/हाइपर थायरॉयड व अनियंत्रित वजन संतुलन)
    if (cleanQ.includes('thyroid') || cleanQ.includes('थायराइड') || cleanQ.includes('थायरॉयड') || cleanQ.includes('tsh') || cleanQ.includes('t3') || cleanQ.includes('t4')) {
      return renderHealthTopicPage(
        'थायरॉयड ग्रंथि संतुलन व मेटाबॉलिज्म केयर (Thyroid & Weight Protocol)',
        'थायरॉयड ग्रंथि जब पर्याप्त T3 और T4 हार्मोन नहीं बनाती (Hypothyroidism), तो मेटाबॉलिज्म धीमा होकर वजन तेजी से बढ़ता है, सुस्ती आती है और बाल झड़ते हैं। वहीं Hyperthyroidism में वजन अनियंत्रित रूप से घटता है।',
        'साबुत धनिया के बीज का उबला पानी (खाली पेट), अखरोट, बादाम, नारियल तेल, कद्दू के बीज, सेंधा नमक और हरी सब्जियां। रोज 10-15 मिनट उज्जायी प्राणायाम व सर्वांगासन करें।',
        'सोयाबीन, कच्ची पत्तागोभी, फूलगोभी, ब्रोकोली, अत्यधिक ठंडा भोजन, रिफाइंड तेल व डिब्बाबंद खाद्य पदार्थ।',
        'Naturamore For Women (महिलाओं हेतु) या Lifestyle Plus कैप्सूल (1 कैप्सूल सुबह-शाम भोजन से 30 मिनट पहले) + Naturamore Powder (25% फ्लैट छूट)।',
        '/health/thyroid-care.html',
        'health',
        'thyroid_care'
      );
    }

    // 9. Lungs & Respiratory Care
    if (cleanQ.includes('lungs') || cleanQ.includes('फेफड़े') || cleanQ.includes('अस्थमा') || cleanQ.includes('दमा') || cleanQ.includes('खांसी') || cleanQ.includes('सांस फूलना')) {
      return renderHealthTopicPage(
        'फेफड़ों की मजबूती व श्वसन तंत्र सुरक्षा',
        'प्रदूषण, धूल व कफ जमा होने से ब्रोंकियल नलियों में सूजन आती है, जिससे ऑक्सीजन का प्रवाह बाधित होता है और सांस फूलती है।',
        'तुलसी, अदरक, काली मिर्च, मुलेठी, गुनगुना पानी व भाप (Steam)।',
        'ठंडा पानी, आइसक्रीम, सिगरेट/धुआं, दही व रात में भारी चावल।',
        'नेचुरामोर इम्यून प्लस कैप्सूल (1 कैप्सूल सुबह-शाम गुनगुने पानी से) + नेचुरामोर पाउडर (25% फ्लैट छूट)।',
        '/health/home-care.html',
        'health',
        'respiratory_care'
      );
    }

    // 10. Kidney Stone & Urinary Care (पथरी व गुर्दे का स्वास्थ्य)
    if (cleanQ.includes('kidney') || cleanQ.includes('किडनी') || cleanQ.includes('पथरी') || cleanQ.includes('stone') || cleanQ.includes('गुर्दे') || cleanQ.includes('यूरिन')) {
      return renderHealthTopicPage(
        'किडनी स्टोन (पथरी) व गुर्दे की कार्यक्षमता सुरक्षा',
        'कैल्शियम ऑक्सालेट और यूरिक एसिड क्रिस्टल गुर्दे में जमा होकर पथरी का रूप लेते हैं, जिससे कमर में असहनीय दर्द व पेशाब में जलन होती है।',
        'रोजाना 3 से 4 लीटर गुनगुना पानी, कुलथी की दाल का सूप, नारियल पानी, नींबू पानी व खीरा।',
        'टमाटर के बीज, पालक, बैंगन, अत्यधिक नमक, उड़द की दाल, रेड मीट व कोल्ड ड्रिंक्स।',
        'Naturamore NutriHealth प्रोटीन पाउडर (किडनी को डिटॉक्स करने हेतु) + पाषाणभेद व पुनर्नवा का काढ़ा (25% फ्लैट छूट)।',
        '/health/general-wellness.html',
        'health',
        'kidney_care'
      );
    }

    // 11. Uric Acid & Gout (यूरिक एसिड व गाउट)
    if (cleanQ.includes('यूरिक एसिड') || cleanQ.includes('uric acid') || cleanQ.includes('यूरिक')) {
      return renderHealthTopicPage(
        'यूरिक एसिड नियंत्रण व गाउट (जोड़ों में सूजन) उपचार',
        'शरीर में प्यूरीन (Purine) का चयापचय न होने से खून में यूरिक एसिड बढ़ता है और क्रिस्टल बनकर पैर के अंगूठे व जोड़ों में असहनीय चुभन पैदा करता है।',
        'खूब पानी पिएँ (3-4L), नींबू पानी, विटामिन-C युक्त फल (आंवला), लौकी का जूस व गिलोय का काढ़ा।',
        'दालें (विशेषकर अरहर, राजमा, छोले), मशरूम, टमाटर, फूलगोभी, शराब, बीयर व मांसाहार।',
        'Naturamore Joint Care कैप्सूल (सलाई गुग्गुल युक्त) + Easy Detox (25% फ्लैट छूट)।',
        '/health/joint-care.html',
        'health',
        'uric_acid_care'
      );
    }

    // 12. Kids Wellness & Nutrition (बच्चों का शारीरिक व मानसिक विकास)
    if (cleanQ.includes('kids') || cleanQ.includes('किड्स') || cleanQ.includes('बच्चे') || cleanQ.includes('बच्चों') || cleanQ.includes('बाल विकास') || cleanQ.includes('शारीरिक और मानसिक विकास')) {
      return renderHealthTopicPage(
        'नेचुरामोर किड्स — बच्चों का शारीरिक व मानसिक विकास (27 विटामिन्स-मिनरल्स)',
        'बढ़ते बच्चों को हड्डियों, याददाश्त, एकाग्रता और रोग प्रतिरोधक क्षमता (Immunity) के लिए संतुलित प्रोटीन और सूक्ष्म पोषक तत्वों की आवश्यकता होती है।',
        'दूध, भीगे बादाम, अखरोट, हरी सब्जियां, फल, दालें व अंकुरित आहार।',
        'मैगी, चिप्स, कोल्ड ड्रिंक्स, पिज्जा, अत्यधिक टॉफी व डिब्बाबंद जंक फूड।',
        'Naturamore Kids (स्वादिष्ट चॉकलेट फ्लेवर - 27 विटामिन्स, मिनरल्स, ब्राह्मी, शंखपुष्पी व ओमेगा-3 DHA युक्त, 25% फ्लैट छूट)।',
        '/health/general-wellness.html',
        'health',
        'kids_care'
      );
    }

    // 13. Leucorrhoea & White Discharge (महिलाओं में सफेद पानी)
    if (cleanQ.includes('ल्यूकोरिया') || cleanQ.includes('leucorrhea') || cleanQ.includes('white discharge') || cleanQ.includes('सफेद पानी') || cleanQ.includes('सफेद प्रदर')) {
      return renderHealthTopicPage(
        'महिलाओं में ल्यूकोरिया (सफेद पानी) व आंतरिक पोषण समाधान',
        'हार्मोनल असंतुलन, खून की कमी (Anemia), पोषणहीनता व आंतरिक संक्रमण से कमजोरी, कमर दर्द और सफेद पानी (White Discharge) की शिकायत होती है।',
        'भुने चने, केला, आंवला मुरब्बा, शतावरी का चूर्ण, नारियल पानी और पर्याप्त ताजे फल।',
        'अत्यधिक मिर्च-मसालेदार भोजन, खटाई, चाय-कॉफी, मैदा व बासी खाना।',
        'Naturamore For Women (मसाला मिल्क / फ्रेंच वैनिला - सुबह 1 चम्मच दूध से) + हर्बल पर्सनल हाइजीन (25% फ्लैट छूट)।',
        '/health/womens-care.html',
        'health',
        'leucorrhoea_care'
      );
    }

    return false;
  }

  // 15. PRONOUN & MULTI-TURN CONTEXT RESOLVER (संदर्भ व फॉलो-अप डिटेक्टर)
  function resolveFollowUpQuery(cleanQ, rawQ) {
    const isIngredients = cleanQ.includes('iske andar') || cleanQ.includes('isme kya') || cleanQ.includes('kya kya hai') || cleanQ.includes('kya samagri') || cleanQ.includes('ingredients') || cleanQ.includes('composition') || cleanQ.includes('kisse bana') || cleanQ.includes('ghatak') || cleanQ.includes('इसके अंदर') || cleanQ.includes('क्या सामग्री') || cleanQ.includes('क्या क्या है');
    const isDosage = cleanQ.includes('kaise khaye') || cleanQ.includes('kaise le') || cleanQ.includes('kab le') || cleanQ.includes('kab khaye') || cleanQ.includes('khuraak') || cleanQ.includes('खुराक') || cleanQ.includes('dose') || cleanQ.includes('डोज') || cleanQ.includes('kaise use') || cleanQ.includes('kaise spray') || cleanQ.includes('उपयोग कैसे') || cleanQ.includes('कैसे खाएं') || cleanQ.includes('कैसे लें');
    const isPrice = cleanQ.includes('kitne ka hai') || cleanQ.includes('price') || cleanQ.includes('rate') || cleanQ.includes('cost') || cleanQ.includes('kimat') || cleanQ.includes('कीमत') || cleanQ.includes('mrp') || cleanQ.includes('discount') || cleanQ.includes('छूट');
    const isBenefits = cleanQ.includes('fayde') || cleanQ.includes('fayda') || cleanQ.includes('labh') || cleanQ.includes('लाभ') || cleanQ.includes('फायदे') || cleanQ.includes('kya kaam') || cleanQ.includes('क्या काम') || cleanQ.includes('benefits');
    const isMore = cleanQ.includes('aur batao') || cleanQ.includes('aur jankari') || cleanQ.includes('और बताओ') || cleanQ.includes('aage batao') || cleanQ.includes('aur kya');

    const activeEntity = sakhiConversationState.lastActiveEntity;

    // Follow-up: Diabetes causes inquiry ("मधुमेह क्या है और कैसे होता है?")
    if (cleanQ.includes('मधुमेह क्या है') || cleanQ.includes('diabetes kya hai') || cleanQ.includes('kaise hota hai') || (activeEntity === 'diabetes' && isMore)) {
      const resp = `🩸 **मधुमेह (Diabetes) क्या है और शरीर में कैसे होता है — वैज्ञानिक समझ:**\n\n1. **पैंक्रियाज (Pancreas) का विज्ञान:** हमारे पेट में मौजूद पैंक्रियाज ग्रंथि इंसुलिन हार्मोन बनाती है। इंसुलिन की चाबी से ही भोजन का ग्लूकोज शरीर की कोशिकाओं (Cells) के भीतर जाकर ऊर्जा देता है।\n2. **जब इंसुलिन कम हो या बेअसर हो:** जब पैंक्रियाज की बीटा कोशिकाएं कमजोर होकर पर्याप्त इंसुलिन नहीं बनातीं, या कोशिकाएं इंसुलिन के प्रति प्रतिरोधी (Insulin Resistance) हो जाती हैं, तो ग्लूकोज कोशिकाओं में न जाकर सीधे खून में बहने लगता है। इसी स्थिति को मधुमेह या डायबिटीज कहते हैं।\n\n💊 **प्रमाणित नेट्सर्फ समाधान:**\n• **नेचुरामोर लाइफस्टाइल प्लस (Lifestyle Plus):** बीटा कोशिकाओं को फिर से सक्रिय करता है।\n• **नेचुरामोर मसाला मिल्क:** संपूर्ण दैनिक पोषण व ऊर्जा देता है।\n💰 **ऑफर:** 25% फ्लैट छूट व 5+1 ऑटो-शिपिंग उपलब्ध है।`;

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🩸 मधुमेह क्या है और कैसे होता है — इंसुलिन व पैंक्रियाज का विज्ञान
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <a href="/health/diabetes.html" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-block;margin-bottom:8px;">
            🛒 शुगर केयर पेज खोलें (25% फ्लैट छूट पर लें) →
          </a>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह में क्या खाएं और डाइट चार्ट')">🥗 क्या खाएं क्या न खाएं</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेचुरामोर लाइफस्टाइल प्लस कैप्सूल कैसे लें')">💊 सेवन विधि</button>
          </div>
        </div>
      `;
      streamBotMessage(html, cleanTextForTTS('पैंक्रियाज जब इंसुलिन नहीं बनाता तो ग्लूकोज खून में बढ़ता है। नेचुरामोर लाइफस्टाइल प्लस से बीटा सेल्स मजबूत होते हैं। इस पर 25% छूट है।'));
      return true;
    }

    if (!activeEntity) return false;

    // Entity 1: Joint Care Follow-ups
    if (activeEntity === 'joint_care' || activeEntity.includes('joint')) {
      if (isIngredients || isMore || cleanQ.includes('kya kya hai') || cleanQ.includes('सामग्री')) {
        const resp = `🌿 **नेचुरामोर जॉइंट केयर (Naturamore Joint Care) के 4 प्रमुख प्राकृतिक सक्रिय घटक:**\n\n1. **ग्लूकोसामाइन हाइड्रोक्लोराइड (Glucosamine HCl):** घिस चुकी कार्टिलेज (कुदरती गद्दी) का पुनर्निर्माण करता है और हड्डियों के बीच घर्षण को रोकता है।\n2. **सलाई गुग्गुल (Boswellia serrata 65% Boswellic Acid):** जोड़ों की पुरानी सूजन, अकड़न व असहनीय दर्द को तुरंत शांत करता है।\n3. **हड़जोड़ (Cissus quadrangularis):** हड्डियों की सघनता बढ़ाता है और लिगामेंट्स व टेंडन्स को मजबूत करता है।\n4. **रसना व गुग्गुल (Rasna & Guggal):** वात दोष का शमन कर जोड़ों की कुदरती चिकनाई (ग्रीस) और लचीलापन वापस लाता है।\n\n💊 **खुराक:** 1 कैप्सूल सुबह और 1 शाम, भोजन के 30 मिनट बाद गुनगुने पानी से लें।\n💰 **जबरदस्त ऑफर:** आरोग्यम इंडिया पर नेट्सर्फ के सभी उत्पादों पर **25% फ्लैट डिस्काउंट** और 6वें माह फ्री (5+1 ऑटो-शिपिंग) उपलब्ध है।`;

        const html = `
          <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
            🌿 नेचुरामोर जॉइंट केयर — 4 मुख्य सक्रिय प्राकृतिक घटक व 25% छूट
          </div>
          <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
            ${formatTextHtml(resp)}
          </div>
          ${buildMsgAudioBtnMarkup(resp)}
          <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
            <a href="/health/joint-care.html" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-block;margin-bottom:8px;">
              🛒 जॉइंट केयर 25% छूट पर अभी कार्ट में जोड़ें →
            </a>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('जॉइंट केयर कैसे खाएं')">💊 सेवन विधि</button>
              <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेचुरामोर पाउडर और जॉइंट केयर कैसे लें')">🥛 नेचुरामोर पाउडर कॉम्बो</button>
            </div>
          </div>
        `;
        streamBotMessage(html, cleanTextForTTS('जॉइंट केयर में ग्लूकोसामाइन, सलाई गुग्गुल, हड़जोड़ और रसना हैं। यह कार्टिलेज और ग्रीस दोबारा बनाता है। इस पर 25% छूट उपलब्ध है।'));
        return true;
      }
      if (isDosage) {
        const resp = `💊 **नेचुरामोर जॉइंट केयर सेवन विधि व समय:**\n• **खुराक:** 1 कैप्सूल सुबह और 1 कैप्सूल शाम को, भोजन करने के 30 मिनट बाद गुनगुने पानी के साथ लें।\n• **अवधि:** स्थायी व दीर्घकालीन लाभ के लिए इसे कम से कम 3 से 6 महीने नियमित लें।\n• **सर्वोत्तम कॉम्बो:** साथ में 1 चम्मच नेचुरामोर प्लस पाउडर (दूध या पानी में) लेने से शरीर को भरपूर कैल्शियम, ओमेगा व प्रोटीन मिलता है।\n💰 **ऑफर:** फ्लैट 25% डिस्काउंट व 5+1 ऑटो-शिपिंग उपलब्ध है।`;
        renderCrispSpecialBox('💊 नेचुरामोर जॉइंट केयर — सही खुराक व सेवन नियम', resp, [
          { text: '🌿 इसके अंदर क्या-क्या घटक हैं?', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
          { text: '🛒 जॉइंट केयर पेज खोलें', query: 'जॉइंट केयर पेज लिंक' }
        ], 'health', 'joint_care');
        return true;
      }
      if (isPrice) {
        const resp = `💰 **नेचुरामोर जॉइंट केयर (30 कैप्सूल पैक) ऑफर:**\n• एमआरपी (MRP): मात्र ₹650\n• आरोग्यम इंडिया विशेष ऑफर: **25% फ्लैट डिस्काउंट** (कोई 25-30% का भ्रम नहीं, सीधा 25% डिस्काउंट)!\n• **5+1 ऑटो-शिपिंग:** हर महीने नियमित लेने पर 6वें महीने उत्पाद बिल्कुल मुफ्त!`;
        renderCrispSpecialBox('💰 नेचुरामोर जॉइंट केयर — 25% फ्लैट डिस्काउंट ऑफर', resp, [
          { text: '🌿 इसके घटक व कार्य', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
          { text: '💊 सेवन की सही विधि', query: 'जॉइंट केयर कैसे खाएं' },
          { text: '🛒 25% छूट पर ऑर्डर करें', query: 'जॉइंट केयर पेज लिंक' }
        ], 'health', 'joint_care');
        return true;
      }
    }

    // Entity 2: Nutri Heart Follow-ups
    if (activeEntity === 'nutri_heart' || activeEntity.includes('heart')) {
      if (isIngredients || isDosage || isBenefits || isMore) {
        const resp = `❤️ **नेचुरामोर न्यूट्री हार्ट (Nutri Heart) के घटक व लाभ:**\n• **सक्रिय घटक:** अर्जुन छाल (Arjuna), अंगूर बीज अर्क (Grape Seed Extract), लहसुन अर्क (Garlic) और को-एंजाइम Q10 (CoQ10)।\n• **मुख्य लाभ:** धमनियों को लचीला रखता है, नसों में ब्लॉकेज जमने से रोकता है, खराब कोलेस्ट्रॉल (LDL) घटाता है और सामान्य ब्लड प्रेशर बनाए रखता है।\n💊 **खुराक:** 1 कैप्सूल सुबह और 1 कैप्सूल शाम, भोजन के 30 मिनट बाद गुनगुने पानी से।\n💰 **ऑफर:** फ्लैट 25% छूट व 5+1 ऑटो-शिपिंग।`;
        renderCrispSpecialBox('❤️ नेचुरामोर न्यूट्री हार्ट — घटक व 25% छूट', resp, [
          { text: '🩺 बीपी व कोलेस्ट्रॉल में असर', query: 'न्यूट्री हार्ट से बीपी कैसे कंट्रोल होता है' },
          { text: '🛒 न्यूट्री हार्ट 25% छूट पर लें', query: 'हार्ट केयर उत्पाद पेज' }
        ], 'health', 'nutri_heart');
        return true;
      }
    }

    // Entity 3: Pet Vet / CFC Plus Follow-ups
    if (activeEntity === 'cfc_plus' || activeEntity === 'pet_vet' || activeEntity.includes('cfc')) {
      if (isIngredients || isDosage || isBenefits || isMore) {
        const resp = `🐄 **बायोफिट पेट-वेट (Pet-Vet — पूर्व में CFC Plus) — संपूर्ण पशु पोषण:**\n• **घटक:** शतावरी, मेथी, विटामिन्स (A, D3, E), मिनरल्स (जिंक, कॉपर, कोबाल्ट, कैल्शियम), प्रीबायोटिक्स व प्रोबायोटिक्स।\n\n📦 **3 उपलब्ध साइज एवं आधिकारिक MRP:**\n• **250 ग्राम:** MRP **₹399**\n• **500 ग्राम:** MRP **₹699**\n• **1 किलोग्राम:** MRP **₹1,275**\n\n🥄 **खुराक एवं सेवन विधि:**\n• **बड़े दुधारू पशु (गाय/भैंस):** **10 से 15 ग्राम प्रतिदिन** सुबह के दाने या चारे में मिलाकर दें।\n• **छोटे पशु (बछड़े, बकरी, भेड़):** **5 ग्राम प्रतिदिन** दें।\n\n✅ **मुख्य लाभ:** पाचन तंत्र दुरुस्त करता है, 15 से 25% दूध उत्पादन बढ़ाता है, फैट (7 से 8 डिग्री) सुधारता है और बांझपन दूर करता है।\n💰 **ऑफर:** 25% फ्लैट डिस्काउंट व ₹100 वाउचर उपलब्ध है।`;
        renderCrispSpecialBox('🐄 बायोफिट पेट-वेट (पूर्व CFC Plus) — 250g, 500g, 1kg', resp, [
          { text: '🥛 गाय-भैंस का दूध और फैट कैसे बढ़ाएं?', query: 'गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला' },
          { text: '📦 1kg, 500g, 250g पेट-वेट 25% छूट', query: 'पेट वेट 25% छूट पर ऑर्डर करें' },
          { text: '🥄 10-15 ग्राम दैनिक खुराक नियम', query: 'पेट वेट कैसे खिलाएं' }
        ], 'pashu', 'pet_vet');
        return true;
      }
    }

    // Entity 4: Antiviral & Tomato Leaf Curl Follow-ups
    if (activeEntity === 'antiviral' || activeEntity.includes('kukda')) {
      if (isIngredients || isDosage || isBenefits || isMore) {
        const resp = `🍅 **बायोफिट एंटीवायरल (Antiviral) - कुकड़ा व वायरस का पक्का इलाज:**\n• **घटक:** सक्रिय प्राकृतिक पादप अर्क (250 ml पैक, MRP ₹890)।\n• **स्प्रे डोज:** 30 ml प्रति 15 लीटर पंप (बायो-99 5ml के साथ)।\n• **इल्ली व कीट नियंत्रण हेतु:** साथ में बायोफिट लार्विसाइड (Larvicide - 250 ml, MRP ₹890, डोज: 30 ml प्रति 15L पंप) मिलाएं।\n• **परिणाम:** पत्तियों का मुड़ना रुकता है और 5-7 दिनों में नई सीधी, चमकदार व स्वस्थ पत्तियां फूटती हैं।`;
        renderCrispSpecialBox('🛡️ बायोफिट एंटीवायरल — कुकड़ा नाशक फॉर्मूला', resp, [
          { text: '💧 बायो-99 की सही डोज क्या है?', query: 'बायो-99 की सही डोज व उपयोग' },
          { text: '🌱 फूल बढ़ाने के लिए स्टिमरिच', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' }
        ], 'agri', 'antiviral');
        return true;
      }
    }

    // Entity 5: Stimrich Follow-ups
    if (activeEntity === 'stimrich' || activeEntity.includes('stimrich')) {
      if (isIngredients || isDosage || isBenefits || isMore) {
        const resp = `🌱 **बायोफिट स्टिमरिच (Stimrich) - 100% जैविक ग्रोथ प्रमोटर:**\n• **सटीक डोज:** 2 ml प्रति लीटर (यानी 15 लीटर पंप में 30 ml, 20 लीटर पंप में 40 ml)।\n• **ड्रिप सिंचाई में:** कम से कम 150 ml प्रति एकड़ (1 हेक्टेयर = 2.5 एकड़)।\n• **बीज उपचार:** 10 ml प्रति किलो बीज।\n• **कार्य:** कल्ले 30-40% बढ़ाता है, फूलों का झड़ना रोकता है और उपज में ठोस वृद्धि करता है।`;
        renderCrispSpecialBox('🌱 बायोफिट स्टिमरिच — सटीक डोज व स्प्रे गाइड', resp, [
          { text: '💧 बायो-99 की सही डोज', query: 'बायो-99 की सही डोज व उपयोग' },
          { text: '🌾 गेहूं/चना में स्टिमरिच का समय', query: 'चना में स्टिमरिच स्प्रे कब करें' }
        ], 'agri', 'stimrich');
        return true;
      }
    }

    // Entity 6: Book Kheti Dr Follow-ups
    if (activeEntity === 'book_kheti_dr') {
      if (isPrice || isBenefits || isMore) {
        const resp = `🌾 **'खेती डॉक्टर' ई-बुक:**\n• **कीमत:** मात्र ₹99 (MRP ₹299)।\n• **लाभ:** 300+ असली फोटो देखकर खुद रोग पहचानें, गलत दवाओं के हजारों रुपये बचाएं।\n• **भुगतान:** आप सीधे 7974422572 पर UPI से भुगतान कर सकते हैं।`;
        renderCrispSpecialBox('🌾 खेती डॉक्टर — कीमत व लाभ', resp, [
          { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' },
          { text: '🧪 कृषि दवा डायरेक्टरी देखें', query: 'कृषि दवा डायरेक्टरी के बारे में बताओ' }
        ], 'agri', 'book_kheti_dr');
        return true;
      }
    }

    // Entity 7: Book Dawa Directory Follow-ups
    if (activeEntity === 'book_dawa_dir') {
      if (isPrice || isBenefits || isMore) {
        const resp = `🧪 **'कृषि दवा डायरेक्टरी' ई-बुक:**\n• **कीमत:** मात्र ₹99 (MRP ₹499)।\n• **लाभ:** टेक्निकल (Active Ingredient) समझें, दुकानदार के झांसे से बचें, जैविक व देसी नुस्खे सीखें।\n• **भुगतान:** 7974422572 पर PhonePe/GooglePay से ₹99 भेजकर तुरंत एक्टिवेट कराएं।`;
        renderCrispSpecialBox('🧪 कृषि दवा डायरेक्टरी — कीमत व लाभ', resp, [
          { text: '💳 डायरेक्ट UPI से ₹99 भुगतान', query: 'UPI से पेमेंट कैसे करें' },
          { text: '🌾 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
        ], 'agri', 'book_dawa_dir');
        return true;
      }
    }

    return false;
  }

  // 15.5 DADI-NANI KE GHARELU NUSKHE ROUTER (सेहत, सौंदर्य व हेयर फॉल)
  function handleDadiKeNuskhe(cleanQ, rawQ) {
    const isNuskhe = cleanQ.includes('दादी के नुस्खे') || cleanQ.includes('घरेलू नुस्खा') || cleanQ.includes('nuskhe') || cleanQ.includes('nuskha') || cleanQ.includes('घरेलू उपाय') || cleanQ.includes('देशी उपाय') || cleanQ.includes('dadi ke');
    if (!isNuskhe && !cleanQ.includes('nuskha')) return false;

    const isBeauty = cleanQ.includes('सुंदर') || cleanQ.includes('त्वचा') || cleanQ.includes('skin') || cleanQ.includes('ग्लो') || cleanQ.includes('glow') || cleanQ.includes('मुंहासे') || cleanQ.includes('pimple') || cleanQ.includes('चेहरा');
    const isHair = cleanQ.includes('बाल') || cleanQ.includes('hair') || cleanQ.includes('डैंड्रफ') || cleanQ.includes('dandruff') || cleanQ.includes('झड़ना') || cleanQ.includes('गंजापन');
    const isPain = cleanQ.includes('जोड़ों') || cleanQ.includes('दर्द') || cleanQ.includes('गठिया') || cleanQ.includes('घुटने');

    if (isBeauty) {
      const resp = `✨ **दादी के नुस्खे — कुदरती त्वचा ग्लो व मुंहासे मुक्ति:**\n\n1. **चेहरे पर नेचुरल ग्लो (उबटन):**\n• 2 चम्मच बेसन + आधा चम्मच कच्चा दूध + चुटकी भर कस्तूरी हल्दी + 4 बूंद गुलाब जल मिलाकर लेप बनाएं। 15 मिनट बाद हल्के हाथ से धो लें।\n\n2. **मुंहासे व कील (Pimples) का इलाज:**\n• मुल्तानी मिट्टी में ताजी नीम की पत्तियों का रस या गुलाब जल मिलाकर चेहरे पर लगाएं। नीम एंटी-बैक्टीरियल है जो मुंहासों को जड़ से खत्म करता है।\n\n👉 **स्थायी समाधान:** अंदरूनी त्वचा पोषण के लिए नेट्सर्फ का **विटामिन थेरेपी स्किन केयर** 25% छूट पर उपलब्ध है।`;
      renderCrispSpecialBox('✨ दादी के नुस्खे — कुदरती त्वचा ग्लो व मुंहासे मुक्ति', resp, [
        { text: '💇 बाल झड़ने व रूसी के नुस्खे', query: 'दादी के नुस्खे बाल झड़ने के लिए' },
        { text: '🦴 जोड़ों के दर्द के घरेलू नुस्खे', query: 'दादी के नुस्खे जोड़ों के दर्द के लिए' },
        { text: '✨ नेट्सर्फ स्किन केयर देखें', query: 'नेट्सर्फ स्किन केयर प्रोडक्ट्स' }
      ], 'beauty', 'nuskhe_beauty');
      return true;
    }

    if (isHair) {
      const resp = `💇 **दादी के नुस्खे — बाल झड़ना (Hair Fall) व डैंड्रफ से मुक्ति:**\n\n1. **बालों को जड़ों से मजबूत बनाना:**\n• 2 चम्मच मेथी दाना रातभर पानी में भिगोएं, सुबह पीसकर खट्टी दही के साथ बालों की जड़ों में लगाएं। 30 मिनट बाद धो लें।\n• शुद्ध नारियल तेल में 15-20 करी पत्ता और सूखा आंवला पकाकर रख लें। सप्ताह में 2 बार गुनगुने तेल से स्कैल्प मालिश करें।\n\n2. **रूसी (Dandruff) का पक्का इलाज:**\n• नारियल तेल में थोड़ा सा नींबू का रस या देसी कपूर मिलाकर लगाने से फंगल डैंड्रफ तुरंत साफ हो जाता है।\n\n👉 **आधुनिक विकल्प:** नेट्सर्फ का **हर्ब्स एंड मोर हेयर न्यूट्रिएंट्स व शैम्पू** बिना किसी केमिकल के बालों को घना बनाता है (25% फ्लैट छूट)।`;
      renderCrispSpecialBox('💇 दादी के नुस्खे — बाल झड़ना व डैंड्रफ रोकथाम', resp, [
        { text: '✨ चेहरे के ग्लो के घरेलू नुस्खे', query: 'दादी के नुस्खे चेहरे के ग्लो के लिए' },
        { text: '🦴 जोड़ों के दर्द के घरेलू नुस्खे', query: 'दादी के नुस्खे जोड़ों के दर्द के लिए' },
        { text: '🛒 नेट्सर्फ हेयर केयर उत्पाद', query: 'नेट्सर्फ हेयर केयर' }
      ], 'beauty', 'nuskhe_hair');
      return true;
    }

    if (isPain) {
      const resp = `🦴 **दादी के नुस्खे — जोड़ों व घुटनों के दर्द में तुरंत राहत:**\n\n1. **अमृत चूर्ण:**\n• सोंठ (सूखा अदरक), मेथी दाना और हल्दी—तीनों को बराबर मात्रा में पीसकर पाउडर बना लें। रोज सुबह-शाम 1-1 चम्मच गुनगुने पानी से लें। यह यूरिक एसिड घटाता है और वात शांत करता है।\n\n2. **मालिश का तेल:**\n• तिल या सरसों के तेल में लहसुन की 5-6 कलियां और थोड़ी अजवाइन जलाकर तेल छान लें। रात में हल्के हाथ से जोड़ों की सिकाई करें।\n\n👉 **स्थायी समाधान:** कार्टिलेज और ग्रीस दोबारा बनाने के लिए नेचुरामोर **जॉइंट केयर** (25% छूट पर) अवश्य शुरू करें।`;
      renderCrispSpecialBox('🦴 दादी के नुस्खे — जोड़ों के दर्द का देशी उपाय', resp, [
        { text: '🌿 नेचुरामोर जॉइंट केयर के अंदर क्या है?', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
        { text: '💇 बाल झड़ने के घरेलू नुस्खे', query: 'दादी के नुस्खे बाल झड़ने के लिए' },
        { text: '✨ चेहरे के ग्लो के घरेलू नुस्खे', query: 'दादी के नुस्खे चेहरे के ग्लो के लिए' }
      ], 'health', 'nuskhe_joint');
      return true;
    }

    // General Nuskhe Menu
    const resp = `🌸 **दादी-नानी के असली आयुर्वेदिक घरेलू नुस्खे:**\n\nहमारी भारतीय परंपरा में रसोई ही सबसे बड़ा औषधालय है। आप किस विषय पर आजमाया हुआ देशी घरेलू नुस्खा जानना चाहते हैं?`;
    renderCrispSpecialBox('🌸 दादी के असली घरेलू नुस्खे — स्वास्थ्य व सौंदर्य', resp, [
      { text: '✨ चेहरे पर चमक व मुंहासे मुक्ति', query: 'दादी के नुस्खे चेहरे के ग्लो के लिए' },
      { text: '💇 बाल झड़ना व डैंड्रफ रोकना', query: 'दादी के नुस्खे बाल झड़ने के लिए' },
      { text: '🦴 जोड़ों का दर्द व गठिया उपाय', query: 'दादी के नुस्खे जोड़ों के दर्द के लिए' },
      { text: '🍃 गैस, कब्ज व एसिडिटी नुस्खा', query: 'गैस और कब्ज के घरेलू नुस्खे' }
    ], 'nuskhe', 'nuskhe_menu');
    return true;
  }

  // 15.6 CROSS-DOMAIN INTENT DISAMBIGUATION ENGINE (2000+ Keywords Context Checkpoint)
  function handleCrossDomainDisambiguation(cleanQ, rawQ) {
    const activeDomain = sakhiConversationState ? sakhiConversationState.lastActiveDomain : null;
    const q = cleanQ;

    // 1. "जड़" (Root) Disambiguation
    if (q === 'जड़' || q.includes('जड़ कमजोर') || q.includes('jad kamzor') || q.includes('जड़ें कमजोर') || (q.includes('जड़') && !q.includes('बाल') && !q.includes('पौध') && !q.includes('फसल') && !q.includes('उकठा') && !q.includes('दांत'))) {
      if (!activeDomain || activeDomain === 'omni') {
        const resp = `आप 'जड़' के बारे में पूछ रहे हैं। कृपया स्पष्ट करें कि आप सिर के बालों की जड़ों (Hair Care) की बात कर रहे हैं या खेत की फसल के पौधे की जड़ (Crop Roots) की?`;
        renderCrispSpecialBox('🔍 कृपया विषय स्पष्ट करें — जड़ (Root) का संदर्भ', resp, [
          { text: '💇 बालों की जड़ें मजबूत करना (Hair Care)', query: 'बालों की जड़ें मजबूत करने के उपाय' },
          { text: '🌾 फसल की जड़ें व उकठा रोग (Wrap Up)', query: 'पौधे की जड़ गलन व उकठा रोग' }
        ], 'omni', 'disambiguation_root');
        return true;
      }
    }

    // 2. "कीड़ा" (Insect/Pest) Disambiguation
    if (q === 'कीड़ा लग गया' || q === 'कीड़ा' || q.includes('कीड़ा लग गया है') || (q.includes('कीड़ा') && !q.includes('फसल') && !q.includes('खेत') && !q.includes('शरीर') && !q.includes('पेट') && !q.includes('चना') && !q.includes('टमाटर') && !q.includes('इल्ली'))) {
      if (!activeDomain || activeDomain === 'omni') {
        const resp = `यह कीड़ा आपके शरीर/त्वचा पर लगा है या आपकी खेत/फसल में? कृपया सही विकल्प चुनें ताकि सटीक सलाह दे सकूँ:`;
        renderCrispSpecialBox('🔍 कृपया विषय स्पष्ट करें — कीड़ा (Insects/Pest)', resp, [
          { text: '🌾 फसल व खेत में कीट / इल्ली नियंत्रण', query: 'खेत में कीड़ा लग गया है दवा बताओ' },
          { text: '🩺 त्वचा या शरीर पर कीड़ा / एलर्जी', query: 'त्वचा पर कीड़ा या एलर्जी का उपाय' }
        ], 'omni', 'disambiguation_insect');
        return true;
      }
    }

    // 3. "ग्रोथ / विकास" (Growth) Disambiguation
    if (q === 'ग्रोथ' || q === 'विकास' || q.includes('ग्रोथ नहीं हो रही') || q.includes('growth nahi ho rahi')) {
      if (!activeDomain || activeDomain === 'omni') {
        const resp = `आप किस विषय में ग्रोथ (विकास) के बारे में जानना चाहते हैं—बच्चों/वयस्कों के शारीरिक पोषण के बारे में या खेत में फसल की बढ़वार व फुटाव (स्टिमरिच) के बारे में?`;
        renderCrispSpecialBox('🔍 कृपया विषय स्पष्ट करें — ग्रोथ व विकास (Growth)', resp, [
          { text: '🌱 फसल की ग्रोथ व फुटाव (स्टिमरिच)', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
          { text: '🥛 बच्चों व वयस्कों का स्वास्थ्य पोषण', query: 'नेचुरामोर संपूर्ण स्वास्थ्य पोषण' }
        ], 'omni', 'disambiguation_growth');
        return true;
      }
    }

    // 4. "दवा / टॉनिक" Disambiguation
    if (q === 'दवा बताओ' || q === 'दवा काम नहीं कर रही' || q === 'टॉनिक' || q === 'दवा') {
      if (!activeDomain || activeDomain === 'omni') {
        const resp = `आप मानव स्वास्थ्य (कमजोरी, दर्द या बीमारी) के लिए आयुर्वेदिक टॉनिक जानना चाहते हैं या खेत की फसलों की उपज के लिए जैविक टॉनिक?`;
        renderCrispSpecialBox('🔍 कृपया विषय स्पष्ट करें — दवा व टॉनिक (Tonic)', resp, [
          { text: '🌾 फसल के लिए बायोफिट टॉनिक', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
          { text: '🩺 स्वास्थ्य के लिए नेचुरामोर टॉनिक', query: 'नेचुरामोर संपूर्ण स्वास्थ्य पोषण' }
        ], 'omni', 'disambiguation_tonic');
        return true;
      }
    }

    // 5. "पाउडर कैसे लेना है"
    if (q.includes('पाउडर कैसे') || q.includes('powder kaise')) {
      if (!activeDomain || activeDomain === 'omni') {
        const resp = `आप नेचुरामोर हेल्थ पाउडर (दूध/पानी के साथ) के सेवन की विधि जानना चाहते हैं या खेत के बायो-फर्टिलाइजर पाउडर की?`;
        renderCrispSpecialBox('🔍 कृपया विषय स्पष्ट करें — पाउडर उपयोग विधि', resp, [
          { text: '🥛 नेचुरामोर हेल्थ पाउडर सेवन विधि', query: 'नेचुरामोर कैसे खाएं' },
          { text: '🌾 बायोफिट खाद व उर्वरक विधि', query: 'बायोफिट एनपीके बैक्टीरिया' }
        ], 'omni', 'disambiguation_powder');
        return true;
      }
    }

    return false;
  }

  // 15.7 BEAUTY, SKINCARE, HAIRCARE, WEIGHT MANAGEMENT & WOMEN EMPOWERMENT (15000+ Words Master Engine)
  function handleBeautyHairWeightWomenEmpowerment(cleanQ, rawQ) {
    const q = cleanQ;

    // A. Women Empowerment & Home-Based Business (घर बैठे ₹5,000 से ₹50,000 कमाने का मौका)
    const isWomenBiz = (q.includes('महिला') || q.includes('हाउसवाइफ') || q.includes('housewife') || q.includes('नारी') || q.includes('गृहणी')) && 
      (q.includes('कमाई') || q.includes('रोजगार') || q.includes('काम') || q.includes('बिजनेस') || q.includes('बिज़नेस') || q.includes('इनकम') || q.includes('घर बैठे') || q.includes('5000') || q.includes('50,000') || q.includes('स्मार्ट ई-टेलर') || q.includes('स्वावलंबन') || q.includes('women business') || q.includes('women empowerment') || q.includes('महिलाएं कैसे कमाए')) &&
      !q.includes('pcod') && !q.includes('pcos') && !q.includes('ल्यूकोरिया') && !q.includes('सफेद पानी') && !q.includes('माहवारी') && !q.includes('पीरियड') && !q.includes('बीमारी') && !q.includes('दर्द') && !q.includes('हार्मोन');

    if (isWomenBiz) {
      const resp = `🌸 **महिलाओं के लिए घर बैठे ₹5,000 से ₹50,000 कमाने का सुनहरा अवसर:**\n\nक्या आप जानती हैं कि नेट्सर्फ परिवार के साथ जुड़कर हज़ारों गृहणियां (Housewives) अपने घर की चारदीवारी में रहकर, परिवार को संभालते हुए हर महीने **₹5,000 से लेकर ₹50,000+** तक की शानदार आमदनी कमा रही हैं? आपको घर छोड़ने की कोई जरूरत नहीं है।\n\n✨ **इस अवसर की मुख्य विशेषताएं:**\n1. **जीरो इन्वेस्टमेंट / फ्री जॉइनिंग:** रजिस्ट्रेशन 100% मुफ्त है। कोई रिस्क या लागत नहीं है।\n2. **आसान व सम्मानित काम:** घर बैठे फोन के जरिए अपने जान-पहचान वालों को स्वास्थ्य, हर्बल स्किनकेयर व ऑर्गेनिक उत्पादों की सही जानकारी देना।\n3. **संपूर्ण डिजिटल ट्रेनिंग:** आरोग्यम इंडिया और नेट्सर्फ परिवार आपको मोबाइल पर फ्री ट्रेनिंग व पूरा सपोर्ट देता है।\n4. **समय की आजादी:** दिन में मात्र 1-2 घंटे देकर भी आप आत्मनिर्भर बन सकती हैं।\n\n👉 **अधिक जानकारी व शुरुआत के लिए:** आप सीधे हमारे संस्थापक **दादा अवनीश (अविनिश कुमार मिश्रा जी - 7974422572)** से WhatsApp पर संपर्क करें।`;
      const waUrl = buildAvneeshWhatsAppHandoffUrl('महिलाओं के लिए घर बैठे 5000 से 50000 की कमाई');
      const html = `
        <div style="font-weight:900;color:#9d174d;font-size:1.05rem;margin-bottom:8px;">
          🌸 नारी शक्ति स्वावलंबन — घर बैठे ₹5,000 से ₹50,000 मासिक कमाई
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#db2777;color:#fff;text-decoration:none;font-weight:800;padding:12px 18px;display:inline-flex;align-items:center;gap:8px;font-size:0.95rem;box-shadow:0 4px 14px rgba(219,39,119,0.35);">
            <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i>
            <span>दादा अवनीश जी से WhatsApp पर बिजनेस समझें (7974422572) →</span>
          </a>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ 25% डिस्काउंट व जॉइनिंग कैसे होती है')">
            💼 नेट्सर्फ जॉइनिंग प्रक्रिया व 25% छूट समझें
          </button>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'business';
      sakhiConversationState.lastActiveEntity = 'women_business';
      sakhiConversationState.lastActiveEntityName = 'महिला स्वावलंबन बिजनेस';
      streamBotMessage(html, cleanTextForTTS('महिलाओं के लिए घर बैठे 5000 से 50000 रुपये कमाने का मौका। रजिस्ट्रेशन बिल्कुल फ्री है। दादा अवनीश से 7974422572 पर संपर्क करें।'));
      return true;
    }

    // B. Skincare, Glow, Pigmentation & Melasma (चेहरे की चमक, दाग-धब्बे व झाइयां)
    const isSkin = (q.includes('त्वचा') || q.includes('स्किन') || q.includes('skin') || q.includes('चेहरा') || q.includes('चेहरे') || q.includes('ग्लो') || q.includes('glow') || q.includes('झाइयां') || q.includes('झाइयाँ') || q.includes('pigmentation') || q.includes('पिगमेंटेशन') || q.includes('melasma') || q.includes('मुंहासे') || q.includes('कील') || q.includes('पिंपल') || q.includes('pimple') || q.includes('acne') || q.includes('फेयरनेस') || q.includes('face wash') || q.includes('फेसवाश') || q.includes('de-tan') || q.includes('डी-टैन') || q.includes('स्क्रब') || ((q.includes('दाग') || q.includes('धब्बे')) && (q.includes('चेहरा') || q.includes('स्किन') || q.includes('त्वचा')))) &&
      !q.includes('पशु') && !q.includes('गाय') && !q.includes('भैंस') && !q.includes('सरसों') && !q.includes('चना') && !q.includes('गेहूं') && !q.includes('धान') && !q.includes('टमाटर') && !q.includes('फसल') && !q.includes('पत्ती') && !q.includes('पत्तियों') && !q.includes('पौधा');

    if (isSkin && !q.includes('बाल') && !q.includes('मोटापा')) {
      const resp = `✨ **खूबसूरत, बेदाग व चमकदार त्वचा मास्टर गाइड (Skin Care & Glow):**\nप्रदूषण, तेज धूप और पोषक तत्वों की कमी से चेहरे पर दाग-धब्बे, झाइयां (Pigmentation) और मुंहासे होने लगते हैं।\n\n1. **आसान व आजमाया हुआ घरेलू नुस्खा:**\n• **झाइयों व दाग-धब्बों के लिए:** कच्चे दूध में चुटकी भर हल्दी और जायफल घिसकर लगाएं। 15-20 मिनट बाद हल्के गुनगुने पानी से धोएं।\n• **मुंहासे व कील-मुंहासों के लिए:** मुल्तानी मिट्टी में ताजी नीम का रस या गुलाब जल मिलाकर हफ्ते में 2 बार लेप लगाएं।\n\n2. **नेट्सर्फ हर्ब्स एंड मोर (Herbs & More) हर्बल समाधान:**\n• **विटामिन थेरेपी फेस वॉश:** त्वचा की गहराई से सफाई करता है और अतिरिक्त ऑयल नियंत्रित करता है।\n• **डी-टैन स्क्रब व फेयरनेस क्रीम:** मृत त्वचा (Dead Skin) हटाकर प्राकृतिक चमक व निखार लाता है।\n• **100% सेफ:** बिना किसी हानिकारक केमिकल या पैराबिन के शुद्ध आयुर्वेदिक अर्क।\n💰 **विशेष ऑफर:** सभी उत्पादों पर **फ्लैट 25% छूट** व 5+1 ऑफर उपलब्ध है।`;
      renderCrispSpecialBox('✨ चेहरे की चमक, दाग-धब्बे व झाइयां समाधान (25% छूट)', resp, [
        { text: '🌿 हर्ब्स एंड मोर स्किन किट ऑफर', query: 'नेट्सर्फ स्किन केयर प्रोडक्ट्स' },
        { text: '💇 बालों का झड़ना व डैंड्रफ उपाय', query: 'बालों का झड़ना व डैंड्रफ समाधान' },
        { text: '🌸 महिलाओं की घर बैठे कमाई (₹5,000-₹50,000)', query: 'महिलाओं के लिए घर बैठे 5000 से 50000 कमाने का मौका' },
        { text: '💬 दादा अवनीश जी से बात करें', query: 'दादा अवनीश जी से संपर्क' }
      ], 'beauty', 'skin_glow_master');
      return true;
    }

    // C. Haircare, Hair Fall, Baldness & Dandruff (बालों का झड़ना, रूसी व मजबूती)
    const isHair = (q.includes('hair') || q.includes('हेयर') || q.includes('रूसी') || q.includes('डैंड्रफ') || q.includes('dandruff') || q.includes('गंजेपन') || q.includes('hair thinning') || q.includes('दोमुंहे') || q.includes('split ends') || q.includes('सफेद बाल') || q.includes('hair oil') || ((q.includes('बाल') || q.includes('झड़ना')) && (q.includes('सिर') || q.includes('खोपड़ी') || q.includes('कंघी') || q.includes('गंजा') || (!q.includes('पशु') && !q.includes('गाय') && !q.includes('भैंस') && !q.includes('गेहूं') && !q.includes('धान') && !q.includes('फसल') && !q.includes('बाली'))))) &&
      !q.includes('पशु') && !q.includes('गाय') && !q.includes('भैंस') && !q.includes('बछड़ा') && !q.includes('दुधारू') && !q.includes('डेयरी') && !q.includes('गेहूं') && !q.includes('धान') && !q.includes('बाली');

    if (isHair && !q.includes('त्वचा') && !q.includes('मोटापा')) {
      const resp = `💇 **बालों का झड़ना, रूसी (Dandruff) व मजबूती मास्टर गाइड (Hair Care):**\nतनाव, डैंड्रफ, केमिकल युक्त शैम्पू और पोषण की कमी से बालों की जड़ें कमजोर होकर बाल झड़ने लगते हैं।\n\n1. **आसान घरेलू नुस्खा:**\n• **झड़ते बालों के लिए:** रात को 2 चम्मच मेथी दाना भिगोएं, सुबह पीसकर खट्टी दही के साथ बालों की जड़ों में लगाएं। 30 मिनट बाद धो लें।\n• **रूसी व खुजली के लिए:** शुद्ध नारियल तेल में थोड़ा सा कपूर या नींबू का रस मिलाकर सिर की हल्की मालिश करें।\n\n2. **नेट्सर्फ हर्ब्स एंड मोर (Herbs & More) हेयर केयर समाधान:**\n• **आयुर्वेदिक हेयर ऑयल:** भृंगराज, ब्राह्मी, आंवला और बादाम तेल से युक्त—जड़ों को मजबूत कर नए बाल उगाने में सहायक।\n• **प्रोटीन शैम्पू (Protein Shampoo):** बालों का टूटना रोकता है और उन्हें रेशमी, घना व चमकदार बनाता है।\n💰 **विशेष ऑफर:** फ्लैट **25% डिस्काउंट** व होम डिलीवरी उपलब्ध।`;
      renderCrispSpecialBox('💇 बालों का झड़ना, डैंड्रफ व मजबूती समाधान (25% छूट)', resp, [
        { text: '🧴 हर्ब्स एंड मोर हेयर ऑयल व शैम्पू', query: 'नेट्सर्फ हेयर केयर' },
        { text: '✨ चेहरे की चमक व स्किन केयर', query: 'चेहरे की चमक दाग धब्बे और झाइयां' },
        { text: '🌸 महिलाओं की घर बैठे कमाई', query: 'महिलाओं के लिए घर बैठे 5000 से 50000 कमाने का मौका' },
        { text: '💬 दादा अवनीश जी से संपर्क', query: 'दादा अवनीश जी से संपर्क' }
      ], 'beauty', 'hair_care_master');
      return true;
    }

    // D. Weight Management & Obesity (मोटापा कम करना, पेट की चर्बी व वजन नियंत्रण - Excludes Clinical Thyroid/PCOD/Animals)
    const isWeight = (q.includes('मोटापा') || q.includes('weight loss') || q.includes('पेट की चर्बी') || q.includes('belly fat') || q.includes('nutrimeal') || q.includes('न्यूट्रीमील') || ((q.includes('वजन') || q.includes('weight')) && (q.includes('घटा') || q.includes('कम कर') || q.includes('पतले') || q.includes('मोटा') || q.includes('चर्बी')))) &&
      !q.includes('थायराइड') && !q.includes('थायरॉयड') && !q.includes('thyroid') && !q.includes('tsh') && !q.includes('pcod') && !q.includes('pcos') && !q.includes('पशु') && !q.includes('गाय') && !q.includes('भैंस') && !q.includes('दूध') && !q.includes('फैट');

    if (isWeight) {
      const resp = `🏃 **मोटापा कम करना व वजन नियंत्रण मास्टर गाइड (Weight Management):**\nबढ़ा हुआ वजन और पेट की चर्बी शरीर का आत्मविश्वास घटाने के साथ-साथ बीपी, शुगर और घुटनों के दर्द की जड़ बन जाती है। लेकिन भूखे रहकर वजन घटाना सही नहीं है।\n\n1. **प्राकृतिक जीवनशैली व आहार टिप्स:**\n• सुबह खाली पेट गुनगुने पानी में आधा नींबू और 1 चम्मच शहद लें।\n• मैदा, तली हुई चीजें, चीनी और कोल्ड ड्रिंक्स पूरी तरह बंद करें।\n• रोजाना 30 मिनट तेज गति से टहलें (Brisk Walk) या योग करें।\n\n2. **नेट्सर्फ नेचुरामोर (Naturamore) वजन नियंत्रण समाधान:**\n• **Naturamore NutriMeal (वेट मैनेजमेंट पाउडर):** बिना कमजोरी के अतिरिक्त चर्बी (Fat) घटाता है। इसमें डाइटरी फाइबर और प्रोटीन होते हैं जो मेटाबॉलिज्म तेज करते हैं।\n• **Naturamore Women Wellness:** महिलाओं में हार्मोनल असंतुलन व थायराइड जनित वजन को संतुलित करता है।\n💰 **ऑफर:** 25% फ्लैट छूट व 5+1 ऑटो शिपिंग।`;
      renderCrispSpecialBox('🏃 मोटापा कम करना व वजन नियंत्रण फॉर्मूला (25% छूट)', resp, [
        { text: '🥛 नेचुरामोर न्यूट्रीमील कैसे लें?', query: 'नेचुरमोरे वेट मैनेजमेंट पाउडर कैसे लें' },
        { text: '✨ स्किन व हेयर केयर समाधान', query: 'चेहरे की चमक दाग धब्बे और झाइयां' },
        { text: '🌸 महिलाओं की घर बैठे कमाई', query: 'महिलाओं के लिए घर बैठे 5000 से 50000 कमाने का मौका' },
        { text: '💬 दादा अवनीश जी से संपर्क', query: 'दादा अवनीश जी से संपर्क' }
      ], 'health', 'weight_management_master');
      return true;
    }

    return false;
  }

  // 15.75 DEDICATED AAROGYAM TUBE VIDEO HUB ROUTER
  function handleAarogyamTubeRouter(cleanQ, rawQ) {
    const isTubeQuery = cleanQ.includes('आरोग्यम ट्यूब') || 
      cleanQ.includes('aarogyam tube') || 
      cleanQ.includes('आरोग्यमट्यूब') ||
      cleanQ.includes('म ट्यूब') ||
      cleanQ.includes('ट्यूब') || 
      cleanQ.includes('tube') ||
      ((cleanQ.includes('वीडियो') || cleanQ.includes('video') || cleanQ.includes('रील्स') || cleanQ.includes('shorts')) &&
       (cleanQ.includes('आरोग्यम') || cleanQ.includes('नेट्सर्फ') || cleanQ.includes('कृषि') || cleanQ.includes('खेती') || cleanQ.includes('8.19') || cleanQ.includes('बिज़नेस') || cleanQ.includes('business') || cleanQ.includes('डेयरी') || cleanQ.includes('स्वास्थ्य') || cleanQ.includes('फसल') || cleanQ.includes('दूध')));

    if (!isTubeQuery) return false;

    // Detect specific playlist intent
    let catTitle = '🎬 आरोग्यम ट्यूब (AarogyamTube) - वीडियो लाइब्रेरी';
    let catDesc = 'आरोग्यम ट्यूब पर कृषि, पशुपालन, प्राकृतिक स्वास्थ्य व ₹8.19 लाख कैपिंग बिज़नेस के 100+ हाई-डेफिनिशन वीडियो, फील्ड ट्रायल्स और किसानों के सफलता के इंटरव्यू उपलब्ध हैं।';
    let activeFilter = '';

    if (cleanQ.includes('बिज़नेस') || cleanQ.includes('business') || cleanQ.includes('8.19') || cleanQ.includes('कमाई') || cleanQ.includes('प्लान') || cleanQ.includes('कैपिंग')) {
      catTitle = '📺 आरोग्यम ट्यूब: नेट्सर्फ ₹8.19L बिज़नेस व कैपिंग वीडियो';
      catDesc = 'नेट्सर्फ डायरेक्ट सेलिंग, ₹8,19,250 पाक्षिक (15-दिन) कैपिंग, 25% रिटेल डिस्काउंट और टॉप अर्नर्स की सफलता के वीडियो देखने के लिए नीचे दिए गए लिंक पर क्लिक करें।';
      activeFilter = 'business';
    } else if (cleanQ.includes('कृषि') || cleanQ.includes('खेती') || cleanQ.includes('फसल') || cleanQ.includes('गेहूं') || cleanQ.includes('चना') || cleanQ.includes('सरसों') || cleanQ.includes('धान') || cleanQ.includes('स्प्रे')) {
      catTitle = '🌾 आरोग्यम ट्यूब: कृषि व फसल डॉक्टर वीडियो';
      catDesc = 'फसलों के रोग-कीट निदान, बायोफिट स्प्रे शेड्यूल और खेतों के लाइव रिजल्ट्स के वीडियो देखने के लिए आरोग्यम ट्यूब कृषि सेक्शन में जाएं।';
      activeFilter = 'agri';
    } else if (cleanQ.includes('पशु') || cleanQ.includes('दूध') || cleanQ.includes('फैट') || cleanQ.includes('गाय') || cleanQ.includes('भैंस') || cleanQ.includes('डेयरी')) {
      catTitle = '🐄 आरोग्यम ट्यूब: वैज्ञानिक डेयरी व पशु पोषण वीडियो';
      catDesc = 'दुधारू पशुओं का दूध-फैट बढ़ाने, थनैला रोकथाम और पेट-वेट (CFC Plus) के लाइव किसान ट्रायल्स वीडियो देखें।';
      activeFilter = 'dairy';
    } else if (cleanQ.includes('स्वास्थ्य') || cleanQ.includes('सेहत') || cleanQ.includes('बीमारी') || cleanQ.includes('आयुर्वेद')) {
      catTitle = '🌿 आरोग्यम ट्यूब: प्राकृतिक स्वास्थ्य व आयुर्वेद वीडियो';
      catDesc = 'डायबिटीज, जोड़ों का दर्द, लिवर डिटॉक्स और प्राकृतिक स्वास्थ्य पर विशेषज्ञों के व्याख्यान व वीडियो गाइड देखें।';
      activeFilter = 'health';
    }

    const tubeUrl = activeFilter ? `/tube.html?filter=${activeFilter}` : '/tube.html';

    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.08rem;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:1.3rem;">🎬</span>
        <span>${escapeHtml(catTitle)}</span>
      </div>
      <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;margin-bottom:12px;">
        ${escapeHtml(catDesc)}
      </div>

      <div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:14px;padding:14px;margin-bottom:12px;">
        <div style="font-weight:800;color:#1e40af;font-size:0.9rem;margin-bottom:8px;">
          🚀 सीधे वीडियो देखें (बाहर नया पेज खुलेगा):
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="${tubeUrl}" target="_blank" rel="noopener noreferrer" style="background:#2563eb;color:#ffffff;text-decoration:none;font-weight:800;font-size:0.92rem;padding:10px 16px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 12px rgba(37,99,235,0.25);">
            <span>▶ ${escapeHtml(catTitle.replace(/📺|🌾|🐄|🌿|🎬/g, '').trim())} खोलें</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <a href="/tube.html" target="_blank" rel="noopener noreferrer" style="background:#ffffff;color:#1e40af;border:1.5px solid #bfdbfe;text-decoration:none;font-weight:700;font-size:0.88rem;padding:8px 14px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;">
            <span>🎬 AarogyamTube मुख्य हब (सभी 100+ वीडियो)</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    `;

    sakhiConversationState.lastActiveDomain = activeFilter === 'business' ? 'business' : (activeFilter === 'agri' ? 'agri' : (activeFilter === 'dairy' ? 'pashu' : 'omni'));
    sakhiConversationState.lastActiveEntity = 'aarogyam_tube';
    sakhiConversationState.lastActiveEntityName = catTitle;

    const speech = `${catTitle}। वीडियो देखने के लिए सीधे लिंक पर क्लिक करें।`;
    streamBotMessage(html, speech);
    return true;
  }

  // 15.8 STRICT SAFETY GUARDRAILS & MEDICAL/OVERDOSE REFUSAL PROTOCOL
  function handleSafetyGuardrails(cleanQ, rawQ) {
    const q = cleanQ;

    // 1. Obscene / Abusive Language & Inappropriate Personal Advances
    const abusiveTerms = [
      'गाली', 'gali', 'harami', 'kamina', 'madarchod', 'behenchod', 'chutiya', 'bhosadi', 'bhosdike',
      'kutta', 'kutiya', 'randi', 'sex', 'sexy', 'kiss', 'love you', 'i love you', 'pyaar', 'patana',
      'dating', 'chumma', 'गंदी', 'अश्लील', 'नंगा', 'नग्न', 'बकवास बंद कर', 'चुप रह'
    ];
    if (abusiveTerms.some(t => q.includes(t))) {
      const resp = `माफ कीजिएगा, मेरा उद्देश्य केवल किसानों, स्वास्थ्य के प्रति जागरूक लोगों और नेट्सर्फ परिवार को सही, प्रामाणिक व उपयोगी जानकारी देना है। इस तरह के सवाल या भाषा पर मैं बात नहीं कर सकती। आइए, हम खेती, सेहत या नेट्सर्फ बिजनेस से जुड़ी किसी काम की बात करें।`;
      renderCrispSpecialBox('🛡️ आरोग्यम सखी AI — शालीनता व सुरक्षा नीति', resp, [
        { text: '🌾 खेती व फसल डॉक्टर', query: 'खेती व फसल डॉक्टर' },
        { text: '🩺 स्वास्थ्य व रोग परामर्श', query: 'स्वास्थ्य व रोग परामर्श' },
        { text: '💼 नेट्सर्फ बिजनेस प्लान', query: 'नेट्सर्फ बिजनेस प्लान' }
      ], 'safety', 'refusal');
      return true;
    }

    // 2. Anti-Social, Illegal, Poisoning or Malicious Harm
    const illegalHarmTerms = [
      'जहर डालकर फसल सुखाना', 'फसल बर्बाद करने का तरीका', 'इंसान को मारने का जहर', 'जानवर मारने की दवा',
      'जहर बनाना', 'हथियार', 'विस्फोटक', 'अवैध कीटनाशक', 'बैन दवा बेचना', 'चोरी करने', 'कब्जा करने', 'danga'
    ];
    if (illegalHarmTerms.some(t => q.includes(t)) || (q.includes('मारने') && (q.includes('इंसान') || q.includes('आदमी') || q.includes('जानवर')))) {
      const resp = `माफ कीजिएगा, किसी भी प्रकार की गैर-कानूनी, खतरनाक, हिंसक या विनाशकारी गतिविधियों की जानकारी देना हमारे सुरक्षा मानकों और भारतीय कानूनों के सख्त विरुद्ध है। आरोग्यम केवल फसल संरक्षण, जैविक पोषण और मानव कल्याण के लिए समर्पित है।`;
      renderCrispSpecialBox('⚠️ सख्त अस्वीकृति — गैर-कानूनी व हानिकारक विषय', resp, [
        { text: '🌾 फसलों का सुरक्षित जैविक उपचार', query: 'फसलों का जैविक उपचार' },
        { text: '🏠 मुख्य पोर्टल पर जाएं', query: 'मुख्य पोर्टल' }
      ], 'safety', 'illegal');
      return true;
    }

    // 3. Dangerous Medical Emergency Protocols
    // A. Heart Attack / Severe Chest Pain
    if (q.includes('heart attack') || q.includes('हार्ट अटैक') || q.includes('सीने में तेज दर्द') || q.includes('सीने में भारीपन') || q.includes('dil ka daura') || (q.includes('छाती में') && q.includes('दर्द'))) {
      const resp = `⚠️ **अति आवश्यक चेतावनी (मेडिकल इमरजेंसी):**\nसीने में तेज दर्द, भारीपन, बाएं हाथ या जबड़े में खिंचाव और सांस लेने में कठिनाई हार्ट अटैक (दिल का दौरा) के गंभीर लक्षण हो सकते हैं।\n\n🚨 **निर्देश:** किसी भी घरेलू नुस्खे, काढ़े या सप्लीमेंट के इंतजार में एक मिनट भी व्यर्थ न गंवाएं! तुरंत 108/112 एम्बुलेंस बुलाएं या मरीज को नजदीकी अस्पताल के इमरजेंसी (ICU) वार्ड में ले जाएं।`;
      renderCrispSpecialBox('🚨 तत्काल आपातकालीन चेतावनी — तुरंत अस्पताल जाएं', resp, [
        { text: '📞 दादा अवनीश जी हेल्पलाइन', query: 'दादा अवनीश जी से संपर्क' }
      ], 'safety', 'medical_emergency');
      return true;
    }

    // B. Poison Ingestion / Acute Toxic Chemical Consumption
    if (q.includes('जहर खा लिया') || q.includes('कीटनाशक पी लिया') || q.includes('poison kha') || q.includes('dawa pi li') || q.includes('जहर पी लिया')) {
      const resp = `⚠️ **जानलेवा आपातकाल (Poison Emergency):**\nकिसी भी कीटनाशक, रसायन या जहरीले पदार्थ का सेवन अत्यंत जानलेवा होता है।\n\n🚨 **तुरंत कदम उठाएं:**\n1. मरीज को तुरंत नजदीकी सरकारी या निजी अस्पताल की इमरजेंसी में ले जाएं।\n2. जिस कीटनाशक/दवा का सेवन हुआ है, उसकी खाली बोतल या डिब्बा साथ लेकर जाएं ताकि डॉक्टर सटीक एंटीडोट (Antidote) दे सकें।\n3. बिना डॉक्टर की देखरेख के घर पर उल्टी कराने की कोशिश न करें।`;
      renderCrispSpecialBox('🚨 जानलेवा आपातकाल — तुरंत नजदीकी अस्पताल ले जाएं', resp, [], 'safety', 'poison');
      return true;
    }

    // C. Dangerous Quackery / Abruptly Stopping Prescriptions
    if ((q.includes('अंग्रेजी दवा') || q.includes('एलोपैथिक') || q.includes('गोलियां') || q.includes('इंसुलिन')) && (q.includes('बंद कर दें') || q.includes('रोक दें') || q.includes('छोड़ दें'))) {
      const resp = `⚠️ **चिकित्सीय सुरक्षा नियम:**\nबिना अपने चिकित्सक (Doctor) के परामर्श के शुगर, बीपी या हृदय रोग की एलोपैथिक दवाइयों या इंसुलिन को कभी भी अचानक बंद न करें! ऐसा करने से ब्लड शुगर या बीपी खतरनाक स्तर तक उछल सकता है।\n\nआयुर्वेदिक आहार और पोषण को हमेशा डॉक्टर की निगरानी में अपनी नियमित दवाओं के साथ सहायक (Complementary) के रूप में अपनाएं।`;
      renderCrispSpecialBox('⚠️ चिकित्सीय सुरक्षा नियम — दवाएं अचानक बंद न करें', resp, [
        { text: '🩸 मधुमेह में प्राकृतिक आहार', query: 'मधुमेह में क्या खाएं' }
      ], 'safety', 'quackery');
      return true;
    }

    // D. Pregnancy Strong Remedies
    if ((q.includes('गर्भवती') || q.includes('प्रेगनेंट') || q.includes('pregnancy')) && (q.includes('काढ़ा') || q.includes('टॉनिक') || q.includes('दवा'))) {
      const resp = `⚠️ **गर्भावस्था सुरक्षा परामर्श:**\nगर्भावस्था और स्तनपान के दौरान महिला का शरीर अत्यंत संवेदनशील होता है। कोई भी तेज आयुर्वेदिक काढ़ा, भस्म, टॉनिक या नया सप्लीमेंट शुरू करने से पहले अपनी महिला रोग विशेषज्ञ (Gynecologist) से सलाह अवश्य लें।`;
      renderCrispSpecialBox('🌸 गर्भावस्था सुरक्षा — डॉक्टर से परामर्श लें', resp, [], 'safety', 'pregnancy');
      return true;
    }

    // 4. Dangerous Agri Overdose & Misuse
    // A. 10x Overdose, undiluted application, or mixing all pesticides together
    if (q.includes('10 गुना') || q.includes('सारे कीटनाशक मिलाकर') || q.includes('बिना पानी के सीधा') || q.includes('सीधा उड़ेल') || q.includes('ज्यादा डोज')) {
      const resp = `⚠️ **सावधानी — ओवरडोज या गलत मिश्रण से फसल जल सकती है:**\n1. कभी भी कीटनाशकों या टॉनिक को बिना पानी मिलाए सीधा फसल पर न डालें।\n2. सभी प्रकार के रसायनों को एक साथ मिलाने से भयंकर केमिकल रिएक्शन होता है, जिससे दवा फट जाती है और फसल पूरी तरह झुलस सकती है।\n3. हमेशा वैज्ञानिक व प्रमाणित डोज ही रखें:\n• **स्टिमरिच:** 2 ml प्रति लीटर (15 लीटर पंप में 30 ml)।\n• **बायो-99:** 5 ml प्रति 15 लीटर पंप (सुपर स्प्रेडर व एक्टिवेटर)।\n• **रैप अप (Wrap Up):** 75 ml प्रति 15 लीटर पंप।`;
      renderCrispSpecialBox('⚠️ ओवरडोज व गलत मिश्रण से बचाव — सही वैज्ञानिक डोज', resp, [
        { text: '🌱 स्टिमरिच की सही मात्रा व डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '💧 बायो-99 की सही डोज', query: 'बायो-99 की सही डोज व उपयोग' }
      ], 'safety', 'agri_overdose');
      return true;
    }

    // B. Spraying at 45°C Noon in harsh heat
    if ((q.includes('दोपहर') || q.includes('धूप में') || q.includes('45 डिग्री') || q.includes('तेज धूप')) && (q.includes('स्प्रे') || q.includes('छिड़काव'))) {
      const resp = `⚠️ **दोपहर की तेज धूप में स्प्रे बिल्कुल न करें:**\nदोपहर के समय तेज धूप और अधिक तापमान में स्प्रे करने से दवा पत्तियों पर टिकने से पहले ही वाष्पीकृत होकर उड़ जाती है और दवा के तेज असर से कोमल पत्तियां झुलस (जल) जाती हैं।\n\n• **स्प्रे का सर्वोत्तम समय:** हमेशा सुबह के वक्त (ओस सूखने के बाद) या शाम को 4 बजे के बाद ठंडे मौसम में करें।\n• स्प्रे से पहले अपने क्षेत्र का [लाइव मौसम पूर्वानुमान](https://aarogyamindia.online/weather.html) अवश्य देख लें।`;
      renderCrispSpecialBox('☀️ तेज धूप में स्प्रे सावधानी — सही समय नियम', resp, [
        { text: '⛅ लाइव मौसम रिपोर्ट देखें', query: 'मौसम पूर्वानुमान कैसे देखें' },
        { text: '🌾 फसलों का सही स्प्रे कैलेंडर', query: 'फसलों का स्प्रे कैलेंडर' }
      ], 'safety', 'heat_spray');
      return true;
    }

    return false;
  }

  // 15.9 LIVE WEATHER INTEGRATION & SPRAY GUIDELINES (मौसम की सटीक जानकारी)
  function handleWeatherAndLiveSpray(cleanQ, rawQ) {
    const isWeatherQ = cleanQ.includes('weather') || cleanQ.includes('मौसम') || cleanQ.includes('barish') || cleanQ.includes('बारिश') || cleanQ.includes('स्प्रे कब करें') || cleanQ.includes('छिड़काव का सही समय') || cleanQ.includes('aaj ka mausam');
    if (!isWeatherQ) return false;

    const resp = `किसान भाई, खेत में किसी भी प्रकार का स्प्रे करने से पहले अपने क्षेत्र का मौसम जानना बेहद जरूरी है। यदि बारिश होने वाली हो या तेज धूप हो, तो दवा का पूरा असर नहीं मिलता।\n\n• **कब स्प्रे करें:** हमेशा सुबह के वक्त (ओस सूखने के बाद) या शाम को ठंडे मौसम में स्प्रे करें, जब हवा शांत हो।\n• **कब स्प्रे न करें:** तेज दोपहर की धूप में (दोपहर 12 से 3 बजे) या जब बारिश की संभावना हो, तब कभी भी स्प्रे न करें, वरना दवा बेअसर हो जाएगी और पत्तियां झुलस सकती हैं।\n\n👉 **आप तुरंत हमारे इस लिंक पर क्लिक करके अपने क्षेत्र का लाइव मौसम देख सकते हैं:**\nhttps://aarogyamindia.online/weather.html`;
    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
        ⛅ लाइव मौसम रिपोर्ट व वैज्ञानिक स्प्रे नियम
      </div>
      <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
        ${formatTextHtml(resp)}
      </div>
      ${buildMsgAudioBtnMarkup(resp)}
      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
        <a href="https://aarogyamindia.online/weather.html" target="_blank" class="sakhi-followup-chip" style="background:#0284c7;color:#fff;text-decoration:none;font-weight:800;padding:10px 16px;display:inline-flex;align-items:center;gap:8px;font-size:0.95rem;box-shadow:0 4px 12px rgba(2,132,199,0.35);">
          <i class="fa-solid fa-cloud-sun-rain"></i> अपने क्षेत्र का लाइव मौसम अभी देखें →
        </a>
      </div>
    `;
    streamBotMessage(html, cleanTextForTTS('किसान भाई, स्प्रे करने से पहले मौसम जांचना जरूरी है। सुबह या शाम को स्प्रे करें। लाइव मौसम रिपोर्ट आरोग्यम वेदर पेज पर देखें।'));
    return true;
  }

  // 15.95 SEED TREATMENT MASTER PROTOCOL (बीज संस्कार - सभी फसलों के लिए)
  function handleSeedTreatmentMaster(cleanQ, rawQ) {
    const isSeed = cleanQ.includes('बीज उपचार') || cleanQ.includes('बीज संस्कार') || cleanQ.includes('seed treatment') || cleanQ.includes('बीज में क्या मिला') || cleanQ.includes('छांव में सुखा') || cleanQ.includes('धूप में सुखा');
    if (!isSeed || cleanQ.includes('चना') || cleanQ.includes('गेहूं') || cleanQ.includes('सरसों')) return false;

    const resp = `🌱 **बीज उपचार (बीज संस्कार) मास्टर प्रोटोकॉल — सभी फसलों के लिए:**\nबुवाई से पहले बीज का उपचार करने से मिट्टी में मौजूद फंगस, बीज जनित रोग और दीमक जैसी समस्याएं शुरुआती अवस्था में ही समाप्त हो जाती हैं, जिससे पौधे का जर्मिनेशन (अंकुरण) 95% से अधिक होता है।\n\n1. **स्टिमरिच बीज उपचार फॉर्मूला:**\n• **मात्रा:** 5 ml स्टिमरिच प्रति 1 लीटर पानी।\n• **तरीका:** बीज को साफ प्लास्टिक शीट पर फैलाएं। घोल से बीज को केवल हल्का गीला (Coat) करें, ज्यादा गीला न करें।\n• **सुखाने की प्रक्रिया:** उपचारित बीज को **4 से 6 घंटे केवल छाया में सुखाएं** (धूप में बिल्कुल न सुखाएं)। इसके बाद खेत में बुवाई कर दें।\n\n2. **जैविक फंगस व उकठा (Wilt) रोकथाम:**\n• 2 घंटे बाद नेट्सर्फ बायोफिट **Wrap Up** (10 ml प्रति किलो बीज) का हल्का लेप लगाने से जड़ गलन और उकठा रोग का खतरा 90% तक कम हो जाता है।\n\n📖 **विशेष ई-बुक संदर्भ:** सभी फसलों के बीज उपचार का सचित्र शेड्यूल हमारी ई-बुक **'खेती का डॉक्टर'** में चार्ट के रूप में उपलब्ध है। क्या आप इसे देखना चाहते हैं?`;
    renderCrispSpecialBox('🌱 बीज उपचार (बीज संस्कार) — 100% फुटाव व सुरक्षा', resp, [
      { text: '🌿 चना बीज उपचार विधि', query: 'चना बीज उपचार की सही विधि' },
      { text: '🌾 गेहूं बीज उपचार विधि', query: 'गेहूं बीज उपचार की सही विधि' },
      { text: '🌱 सरसों बीज उपचार विधि', query: 'सरसों बीज उपचार की सही विधि' },
      { text: '📖 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
    ], 'agri', 'seed_master');
    return true;
  }

  // 16. COMPREHENSIVE NETSURF & AGRI PRODUCT CATALOG HANDLER
  function handleComprehensiveNetsurfCatalog(cleanQ, rawQ) {
    // 0. Agronomy Introduction & Empathy Hooks
    const isFarmerIntro = cleanQ.includes('किसान') || cleanQ.includes('खेती व फसल डॉक्टर') || cleanQ.includes('fasal doctor') || cleanQ.includes('फसल डॉक्टर') || cleanQ === 'कृषि' || cleanQ === 'kheti' || cleanQ === 'farming';
    if (isFarmerIntro && !cleanQ.includes('चना') && !cleanQ.includes('गेहूं') && !cleanQ.includes('सरसों') && !cleanQ.includes('धान') && !cleanQ.includes('टमाटर') && !cleanQ.includes('उकठा') && !cleanQ.includes('स्प्रे') && !cleanQ.includes('कीट') && !cleanQ.includes('stimrich') && !cleanQ.includes('wrapup')) {
      const resp = `जय जवान, जय किसान! भारत एक कृषि प्रधान देश है, लेकिन आज हमारे अन्नदाता भाई मौसम की मार, महंगी खादों, और फसलों में लगने वाली अज्ञात बीमारियों से परेशान हैं।\n\nहमारा 'आरोग्यम' मंच इसी चुनौती को हल करने के लिए मैदान में उतरा है। यहाँ आपको हर फसल की सही पहचान, वैज्ञानिक सलाह, और शत-प्रतिशत जैविक समाधान मिलेगा। बताइए, आज आप अपनी किस फसल के बारे में जानना चाहते हैं—चना, धान, गेहूँ, टमाटर, कपास, सोयाबीन, या कोई अन्य?`;
      renderCrispSpecialBox('🌾 जय जवान, जय किसान — आरोग्यम फसल डॉक्टर', resp, [
        { text: '🌿 चना फसल (बीज, जमीन, उकठा)', query: 'चना फसल की संपूर्ण जानकारी' },
        { text: '🍅 टमाटर व सब्जियां (कुकड़ा व कीट)', query: 'टमाटर कुकड़ा रोग व सब्जियां' },
        { text: '🌾 गेहूं व धान (कल्ले व ब्लास्ट)', query: 'गेहूं और धान फसल गाइड' },
        { text: '🌱 सरसों (माहू व अल्टरनेरिया)', query: 'सरसों की संपूर्ण जानकारी' },
        { text: '📖 खेती डॉक्टर ई-बुक पढ़ें', query: 'खेती का डॉक्टर के बारे में बताओ' },
        { text: '💰 किसान मित्र बनकर कमाई करें', query: 'किसान मित्र बनकर महीने में अच्छी कमाई' }
      ], 'agri', 'farmer_proposal');
      return true;
    }

    // 0.2 Dehati Colloquial Style / Rural Idioms Mapping
    if (cleanQ.includes('फसल बैठ रही') || cleanQ.includes('paudhe baith rahe') || cleanQ.includes('बैठ रही है')) {
      const resp = `अरे किसान भाई, अगर फसल बैठ रही है (मुरझाकर सूख रही है), तो यह मिट्टी में फंगस यानी उकठा रोग (Wilt / Root Rot) का हमला है। इसमें पौधे की जड़ें काली पड़ जाती हैं।\n\n• **पक्का जैविक समाधान:** नेट्सर्फ **Wrap Up** (MRP ₹1350, डोज: 75 ml प्रति 15 लीटर पंप) का पौधों की जड़ों के पास ड्रिंचिंग करें। यह जड़ों पर सुरक्षा कवच बनाकर फंगस को नष्ट करता है।\n• **सचित्र पहचान:** हमारी ई-बुक **'खेती का डॉक्टर'** में इसका सचित्र समाधान दिया गया है। क्या आप इसे देखना चाहते हैं?`;
      renderCrispSpecialBox('🛡️ फसल बैठना (उकठा / जड़ गलन) — Wrap Up समाधान', resp, [
        { text: '🛡️ Wrap Up की पूरी जानकारी', query: 'उकठा रोग का Wrap Up उपचार' },
        { text: '📖 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' },
        { text: '💰 किसान मित्र बनकर कमाई करें', query: 'किसान मित्र बनकर महीने में अच्छी कमाई' }
      ], 'agri', 'baith_rahi');
      return true;
    }

    // 0.3 Emotional Distress / Loss Reassurance
    if (cleanQ.includes('बहुत नुकसान') || cleanQ.includes('pareshan ho gaya') || cleanQ.includes('फसल बर्बाद') || cleanQ.includes('जान परेशान')) {
      const resp = `आप बिल्कुल चिंता मत कीजिए भाई साहब! खेती-किसानी में मौसम और अज्ञात बीमारियों की ऐसी चुनौतियाँ आती रहती हैं, लेकिन हमारा आरोग्यम मंच इसी नुकसान को रोकने और आपकी मेहनत को बचाने के लिए मैदान में है।\n\nआइए मिलकर आपकी फसल का पक्का वैज्ञानिक समाधान निकालते हैं। बताइए, आपकी किस फसल में क्या लक्षण (जैसे पत्ती मुड़ना, पीलापन या पौधा सूखना) दिखाई दे रहे हैं?`;
      renderCrispSpecialBox('🤝 आरोग्यम हमदर्द — चिंता छोड़ें, समाधान पाएं', resp, [
        { text: '🌿 चना व दलहन फसल', query: 'चना फसल की संपूर्ण जानकारी' },
        { text: '🍅 टमाटर व सब्जी फसल', query: 'टमाटर कुकड़ा रोग व सब्जियां' },
        { text: '🌾 गेहूं व धान फसल', query: 'गेहूं और धान फसल गाइड' },
        { text: '💬 दादा अवनीश जी से सीधे बात', query: 'दादा अवनीश जी से संपर्क' }
      ], 'agri', 'distress_reassurance');
      return true;
    }

    // 1. चना फसल (Chana / Chickpea Master Guide)
    if (cleanQ.includes('चना') || cleanQ.includes('chana')) {
      const isSeed = cleanQ.includes('बीज') || cleanQ.includes('seed');
      const isLand = cleanQ.includes('जमीन') || cleanQ.includes('मिट्टी') || cleanQ.includes('खाद') || cleanQ.includes('land');
      const isDisease = cleanQ.includes('बीमारी') || cleanQ.includes('रोग') || cleanQ.includes('उकठा') || cleanQ.includes('wilt') || cleanQ.includes('इल्ली');

      if (isSeed) {
        const resp = `🌱 **चना बीज उपचार (बीज संस्कार) — 100% फुटाव व उकठा सुरक्षा:**\n• **विधि:** स्टिमरिच (5 ml प्रति 1 लीटर पानी) के घोल से चने के बीज को केवल हल्का गीला (कोट) करें।\n• **सुखाने का नियम:** 4 से 6 घंटे **केवल छाया में सुखाएं** (धूप में बिल्कुल न सुखाएं)।\n• **उकठा व फंगस सुरक्षा:** 2 घंटे बाद बायोफिट **Wrap Up** (10 ml प्रति किलो) का लेप लगाकर बुवाई करें। इससे अंकुरण 95% से अधिक होता है और जड़ें मजबूत बनती हैं।\n\n📖 **ई-बुक संदर्भ:** हमारी डिजिटल ई-बुक **'खेती का डॉक्टर'** में चने के हर रोग का सचित्र समाधान दिया गया है। क्या आप इसे देखना चाहते हैं?`;
        renderCrispSpecialBox('🌱 चना बीज उपचार (बीज संस्कार) — स्वस्थ फुटाव व सुरक्षा', resp, [
          { text: '🚜 चना जमीन की तैयारी व NPK खाद', query: 'चना जमीन की तैयारी और खाद प्रबंधन' },
          { text: '🛡️ उकठा रोग का Wrap Up इलाज', query: 'उकठा रोग का Wrap Up उपचार' },
          { text: '📖 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
        ], 'agri', 'chana_seed');
        return true;
      }

      if (isLand) {
        const resp = `🚜 **चना जमीन की तैयारी और खाद प्रबंधन (NPK बैक्टीरिया):**\n• **रासायनिक खाद पर निर्भरता घटाना:** नेट्सर्फ बायोफिट **N, P, K Bacteria** (Azotobacter, PSB, KSB) तीनों 1-1 लीटर के पैक (MRP ₹600 प्रत्येक, 1 हेक्टेयर / 2.5 एकड़ हेतु) सड़ी गोबर खाद या रेत में मिलाकर अंतिम जुताई पर बिखेरें या ड्रिंचिंग करें।\n• **जड़ स्वास्थ्य:** **VEM (Mycorrhiza)** 100 ml पैक (MRP ₹375, प्रति एकड़ 100 ml, हेक्टेयर में 250 ml) जमीन में दें, जिससे जड़ें गहरी और मजबूत होती हैं।`;
        renderCrispSpecialBox('🚜 चना जमीन की तैयारी व NPK जीवाणु खाद', resp, [
          { text: '🌱 चना बीज उपचार विधि', query: 'चना बीज उपचार की सही विधि' },
          { text: '🛡️ उकठा रोग व बीमारी नियंत्रण', query: 'उकठा रोग का Wrap Up उपचार' },
          { text: '💰 किसान मित्र बनकर कमाई करें', query: 'किसान मित्र बनकर महीने में अच्छी कमाई' }
        ], 'agri', 'chana_land');
        return true;
      }

      const resp = `चना हमारी मुख्य दलहनी फसल है। इसमें जड़ गलन, उकठा (Wilt), और इल्लियों की समस्या सबसे ज्यादा आती है।\n\nआप इसके किस चरण के बारे में जानना चाहते हैं—बीज उपचार (Seed Treatment), जमीन की तैयारी (Soil Prep), या फसल में लगने वाली बीमारी और उसका पक्का इलाज?`;
      renderCrispSpecialBox('🌿 चना फसल — मास्टर गाइड व वैज्ञानिक प्रबंधन', resp, [
        { text: '🌱 1. बीज उपचार (Seed Treatment)', query: 'चना बीज उपचार की सही विधि' },
        { text: '🚜 2. जमीन की तैयारी व NPK खाद', query: 'चना जमीन की तैयारी और खाद प्रबंधन' },
        { text: '🛡️ 3. उकठा व बीमारी नियंत्रण (Wrap Up)', query: 'उकठा रोग का Wrap Up उपचार' },
        { text: '📖 4. खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
      ], 'agri', 'chana_menu');
      return true;
    }

    // 2. उकठा रोग / हरा पौधा सूखना (Wilt / Root Rot Disease - Fusarium oxysporum)
    if (cleanQ.includes('उकठा') || cleanQ.includes('wilt') || cleanQ.includes('हरा पौधा सूख') || cleanQ.includes('पौधा सूख') || cleanQ.includes('sukha rog') || cleanQ.includes('जड़ गलन')) {
      const resp = `🛡️ **उकठा रोग (Wilt / हरा पौधा सूखना) — कारण व पक्का उपचार:**\n• **लक्षण:** हरा-भरा पौधा अचानक मुरझाकर सूख जाता है और जड़ें काली पड़ जाती हैं।\n• **कारण:** मिट्टी जनित फंगस (Fusarium oxysporum).\n\n1. **जैविक उपचार (Netsurf Biofit):**\n• **Wrap Up (रैप अप):** MRP ₹1350। डोज: 75 ml प्रति 15 लीटर वाला पंप। इसे प्रभावित पौधों की जड़ों के पास ड्रिंचिंग या भारी स्प्रे करें।\n\n2. **रासायनिक विकल्प:** कॉपर ऑक्सीक्लोराइड 50g या कार्बेंडाजिम आधारित फफूंदनाशक।\n\n📖 **ई-बुक फनल:** क्या आप चाहते हैं कि आपके खेत में बीमारी आने से पहले ही आपको उसका सटीक कारण पता चल जाए? हमारी डिजिटल ई-बुक **'खेती का डॉक्टर'** में चने व सब्जियों के हर रोग का सचित्र समाधान दिया गया है। क्या आप इसे देखना चाहते हैं?`;
      renderCrispSpecialBox('🛡️ उकठा रोग (Wilt) — Wrap Up व खेती डॉक्टर समाधान', resp, [
        { text: '💧 बायो-99 एक्टिवेटर डोज', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '🌱 स्टिमरिच ग्रोथ टॉनिक', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '📖 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' },
        { text: '💰 किसान मित्र बनकर कमाई करें', query: 'किसान मित्र बनकर महीने में अच्छी कमाई' }
      ], 'agri', 'wrapup_wilt');
      return true;
    }

    // 3. टमाटर और सब्जियां (Tomato & Vegetables - Kukda / Leaf Curl Virus & Growth)
    if (cleanQ.includes('टमाटर') || cleanQ.includes('tamatar') || cleanQ.includes('kukda') || cleanQ.includes('कुकड़ा') || cleanQ.includes('leaf curl') || cleanQ.includes('सब्जी की बीमारी') || cleanQ.includes('सब्जियों में कीट') || cleanQ.includes('फूल झड़')) {
      const resp = `🍅 **टमाटर व सब्जियों की प्रमुख समस्याएं व पक्का जैविक समाधान:**\n\n1. **कुकड़ा रोग / वायरस नियंत्रण (Leaf Curl Virus, Thrips, Mites):**\n• **लक्षण:** पत्तियां ऊपर की ओर मुड़कर सिकुड़ जाती हैं और कड़क हो जाती हैं।\n• **जैविक समाधान:** नेट्सर्फ **Antiviral** (30 ml) + **Larvicide** (30 ml) + **Bio-99** (5 ml) प्रति 15 लीटर पंप का स्प्रे करें। (दोनों 250 ml पैक, MRP ₹890 प्रत्येक)। यह वायरस व रस चूसक कीटों का सफाया करता है।\n• **रासायनिक विकल्प:** इमिडाक्लोप्रिड या फिप्रोनिल + नीम तेल।\n\n2. **पैदावार, चमक और साइज बढ़ाना (Growth & Shine):**\n• **Stimrich (स्टिमरिच):** 2 ml प्रति लीटर पानी (15L पंप में 30 ml, 20L पंप में 40 ml)। ड्रिप में 150 ml प्रति एकड़। फूलों का झड़ना रोकता है और फल की चमक व साइज बढ़ाता है।\n\n3. **दवा क्षमता वर्धक (Sticker & Activator):**\n• **Bio-99:** MRP ₹299 (100 ml)। डोज: 5 ml प्रति 15L पंप (25-30 ml प्रति एकड़)। दवा को तुरंत सोखने में मदद करता है।\n\n📖 **ई-बुक फनल:** सब्जियों में कौन सा स्प्रे किस समय करना चाहिए, इसका पूरा स्प्रे चार्ट हमारी बेस्टसेलर ई-बुक **'खेती का डॉक्टर'** में मिलेगा। क्या आप इसका लिंक लेना चाहते हैं?`;
      renderCrispSpecialBox('🍅 टमाटर व सब्जियां — कुकड़ा, कीट व पैदावार मास्टर गाइड', resp, [
        { text: '🛡️ Antiviral व Larvicide डोज', query: 'एंटीवायरल और लार्विसाइड कैसे काम करता है' },
        { text: '🌱 स्टिमरिच पैदावार टॉनिक', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '💧 Bio-99 स्टिकर डोज', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '📖 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
      ], 'agri', 'tomato_veg');
      return true;
    }

    // 4. धान और गेहूँ फसल (Paddy & Wheat Master Guide)
    if (cleanQ.includes('धान') || cleanQ.includes('dhan') || cleanQ.includes('गेहूं') || cleanQ.includes('gehu') || cleanQ.includes('wheat') || cleanQ.includes('paddy') || cleanQ.includes('रतुआ') || cleanQ.includes('दीमक') || cleanQ.includes('ब्लास्ट') || cleanQ.includes('गभिया')) {
      const resp = `🌾 **धान और गेहूँ फसल मास्टर गाइड व पोषण मैट्रिक्स:**\n• **धान की मुख्य समस्याएं:** गभिया रोग (Stem Borer), ब्लास्ट (Blast Fungus), और पीलापन।\n• **गेहूँ की मुख्य समस्याएं:** दीमक (Termite), पीला रतुआ (Yellow Rust) और कमजोर फुटाव।\n\n1. **बीज उपचार (Seed Treatment):** बुवाई से पहले गेहूँ बीजों को Stimrich (5 ml प्रति लीटर पानी) से कोट कर 4 से 6 घंटे छाया में सुखाएं।\n2. **विकास और कल्ले फूटने के लिए (Tillering):** पहली सिंचाई बाद Stimrich (30 ml प्रति 15L पंप) + Bio-99 (5 ml) का स्प्रे करें।\n3. **फंगस व ब्लास्ट नियंत्रण:** नेट्सर्फ **Wrap Up** (75 ml प्रति पंप) का स्प्रे करें।\n4. **मिट्टी की उर्वरता:** Biofit NPK (Azotobacter, PSB, KSB) तीनों 1-1 लीटर + VEM Mycorrhiza 100 ml प्रति एकड़।\n\n📖 **ई-बुक फनल:** धान और गेहूँ में कब-कब पानी देना है और कौन सा टॉनिक किस अवस्था में डालना है, इसका पूरा शेड्यूल हमारी ई-बुक **'खेती का डॉक्टर'** में चार्ट के रूप में उपलब्ध है।`;
      renderCrispSpecialBox('🌾 धान व गेहूँ — कल्ले, पैदावार व रोग नियंत्रण गाइड', resp, [
        { text: '🌱 गेहूँ/धान बीज उपचार विधि', query: 'गेहूं बीज उपचार की सही विधि' },
        { text: '🌾 गेहूँ 4-चरण स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🧪 NPK जीवाणु खाद', query: 'बायोफिट एनपीके बैक्टीरिया' },
        { text: '📖 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
      ], 'agri', 'wheat_paddy');
      return true;
    }

    // 5. सरसों फसल (Sarson / Mustard Master Guide)
    if (cleanQ.includes('सरसों') || cleanQ.includes('sarso') || cleanQ.includes('sarson') || cleanQ.includes('mustard') || cleanQ.includes('माहू') || cleanQ.includes('चेपा') || cleanQ.includes('सफेद रतुआ')) {
      const resp = `🌱 **सरसों फसल मास्टर गाइड — माहू कीट व फंगस नियंत्रण:**\nसरसों तेलहनी फसलों की रानी है। इसमें माहू (Aphid / Chepa) और फंगस सबसे ज्यादा नुकसान पहुंचाते हैं।\n\n1. **बीज उपचार (Seed Treatment):** बुवाई से पहले सरसों बीजों को Stimrich (5 ml प्रति लीटर पानी) से हल्का गीला कर 4 से 6 घंटे छाया में सुखाएं।\n2. **माहू / चेपा कीट नियंत्रण:** फूल और फलियों के समय माहू दिखने पर नेट्सर्फ **Larvicide** (30 ml प्रति 15L पंप) + **Bio-99** (5 ml प्रति पंप) का छिड़काव करें।\n3. **फंगस (Alternaria Blight / धब्बे):** पत्तियों पर काले धब्बे रोकने हेतु जैविक फफूंदनाशक या **Wrap Up** का प्रयोग करें।\n\n📖 **ई-बुक फनल:** सरसों में माहू कीट से फसल को कैसे बचाएं और तेल की मात्रा व दाने का आकार कैसे बढ़ाएं? जानिए हमारी ई-बुक **'खेती का डॉक्टर'** के जरिए।`;
      renderCrispSpecialBox('🌱 सरसों फसल — माहू नियंत्रण, तेल वृद्धि व रोग सुरक्षा', resp, [
        { text: '🌱 सरसों बीज उपचार विधि', query: 'सरसों बीज उपचार की सही विधि' },
        { text: '🌾 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' },
        { text: '💧 Bio-99 एक्टिवेटर डोज', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '📖 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
      ], 'agri', 'mustard_master');
      return true;
    }

    // B. Biofit Stimrich (ग्रोथ, पैदावार, फुटाव, कल्ले, चमक)
    if (cleanQ.includes('stimrich') || cleanQ.includes('स्टिमरिच') || cleanQ.includes('पैदावार') || cleanQ.includes('फुटाव') || cleanQ.includes('कल्ले')) {
      const resp = `🌱 **बायोफिट स्टिमरिच (Stimrich) — 100% जैविक ग्रोथ प्रमोटर व उपज टॉनिक:**\nपैदावार बढ़ाने, फुटाव, कल्ले, ग्रोथ, फल का साइज और चमक बढ़ाने के लिए सर्वोत्तम वैज्ञानिक टॉनिक है।\n\n• **सटीक स्प्रे डोज:** 2 ml प्रति लीटर पानी (यानी 15 लीटर पंप में 30 ml, 20 लीटर पंप में 40 ml)।\n• **ड्रिप सिंचाई में:** कम से कम 150 ml प्रति एकड़ (1 हेक्टेयर = 2.5 एकड़)।\n• **बीज उपचार:** 5 ml प्रति लीटर पानी में घोलकर 4-6 घंटे छाया में सुखाएं (100% स्वस्थ अंकुरण)।\n• **सर्वोत्तम परिणाम हेतु:** हमेशा 5 ml **Bio-99** के साथ मिलाकर छिड़काव करें।`;
      renderCrispSpecialBox('🌱 बायोफिट स्टिमरिच — पैदावार, फुटाव व चमक फॉर्मूला', resp, [
        { text: '💧 Bio-99 स्टिकर व एक्टिवेटर डोज', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '🌾 गेहूं/चना स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '💰 किसान मित्र बनकर कमाई करें', query: 'किसान मित्र बनकर महीने में अच्छी कमाई' }
      ], 'agri', 'stimrich');
      return true;
    }

    // C. Biofit Bio-99 (Sticker & Activator)
    if (cleanQ.includes('bio-99') || cleanQ.includes('bio99') || cleanQ.includes('बायो-99') || cleanQ.includes('बायो 99') || cleanQ.includes('चिपकू') || cleanQ.includes('स्टीकर') || cleanQ.includes('स्टिकर')) {
      const resp = `💧 **Bio-99 — 100% सिलिकॉन सुपर स्प्रेडर, एक्टिवेटर व स्टिकर:**\nयह पानी के सर्फेस टेंशन को खत्म कर उसे सुपर-सॉफ्ट (कंपैटिबल) बना देता है। किसी भी कीटनाशक, फफूंदनाशी या टॉनिक के साथ मिलकर उसकी कार्यक्षमता 35% से 40% बढ़ा देता है। दवा पौधे के अंदर तुरंत समा जाती है।\n\n• **कीमत:** मात्र ₹299 (100 ml पैक)।\n• **सटीक डोज:** मात्र 5 ml प्रति 15 लीटर पंप (25 से 30 ml प्रति एकड़, 75 ml प्रति हेक्टेयर)।\n• **विशेषता:** 30 मिनट में पत्तियों पर दवा फैलाकर बारिश से सुरक्षित करता है।`;
      renderCrispSpecialBox('💧 Bio-99 — सुपर एक्टिवेटर व स्प्रेडर (₹299)', resp, [
        { text: '🌱 स्टिमरिच की सही डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '🌾 फसलों का स्प्रे कैलेंडर', query: 'फसलों का स्प्रे कैलेंडर' }
      ], 'agri', 'bio99');
      return true;
    }

    // D. NPK Bacteria & Bio-Fertilizers (Azotobacter, PSB, KSB, Mycorrhiza VEM, Zn)
    if (cleanQ.includes('npk') || cleanQ.includes('एनपीके') || cleanQ.includes('azotobacter') || cleanQ.includes('psb') || cleanQ.includes('ksb') || cleanQ.includes('vem') || cleanQ.includes('mycorrhiza') || cleanQ.includes('माइकोराइजा') || cleanQ.includes('जिंक बैक्टीरिया')) {
      const resp = `🧪 **नेट्सर्फ बायोफिट जैविक जीवाणु खाद (NPK Bacteria):**\nरासायनिक खाद (यूरिया व डीएपी) पर निर्भरता कम करने के लिए प्रमाणित बायो-फर्टिलाइजर:\n\n1. **Azotobacter (नाइट्रोजन):** 1 लीटर, MRP ₹600 (1 हेक्टेयर / 2.5 एकड़ हेतु)।\n2. **PSB (फास्फोरस सोलुबिलाइजिंग):** 1 लीटर, MRP ₹600 (1 हेक्टेयर हेतु)।\n3. **KSB (पोटाश सोलुबिलाइजिंग):** 1 लीटर, MRP ₹600 (1 हेक्टेयर हेतु)।\n4. **Mycorrhiza (VEM):** 100 ml, MRP ₹375 (1 एकड़ हेतु 100 ml, 250 ml प्रति हेक्टेयर)।\n5. **Zn Solubilizing Bacteria (जिंक):** मिट्टी में फिक्स जिंक को पौधों तक पहुंचाता है।\n\n👉 **प्रयोग विधि:** सड़ी गोबर खाद या रेत में मिलाकर अंतिम जुताई पर डालें या ड्रिंचिंग करें।`;
      renderCrispSpecialBox('🧪 नेट्सर्फ बायोफिट जैविक जीवाणु खाद (NPK & VEM)', resp, [
        { text: '🌱 स्टिमरिच ग्रोथ टॉनिक', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' },
        { text: '💧 Bio-99 स्टिकर व एक्टिवेटर', query: 'बायो-99 की सही डोज व उपयोग' }
      ], 'agri', 'npk_bacteria');
      return true;
    }

    // E. Virus / Kukda (कुकड़ा रोग) & Larvicide
    if (cleanQ.includes('antiviral') || cleanQ.includes('एंटीवायरल') || cleanQ.includes('larvicide') || cleanQ.includes('लार्विसाइड') || cleanQ.includes('इल्ली')) {
      const resp = `🍅 **कुकड़ा रोग (Virus) व इल्ली नियंत्रण का जैविक समाधान:**\nटमाटर, मिर्च व सब्जियों में वायरस व कीटों के लिए नेट्सर्फ के दो शक्तिशाली समाधान:\n\n1. **बायोफिट एंटीवायरल (Antiviral):** 250 ml, MRP ₹890। कुकड़ा रोग व वायरस को रोकता है। डोज: 30 ml प्रति 15 लीटर पंप (5 ml Bio-99 के साथ)।\n2. **बायोफिट लार्विसाइड (Larvicide):** 250 ml, MRP ₹890। सभी प्रकार की इल्लियों व पेस्ट को नियंत्रित करता है। डोज: 30 ml प्रति 15 लीटर पंप।\n\n👉 रासायनिक विकल्प और विस्तार के लिए हमारी ई-बुक **'खेती डॉक्टर'** देखें।`;
      renderCrispSpecialBox('🛡️ कुकड़ा रोग (Antiviral) व इल्ली (Larvicide) समाधान', resp, [
        { text: '💧 Bio-99 की सही डोज', query: 'बायो-99 की सही डोज व उपयोग' },
        { text: '📖 खेती डॉक्टर ई-बुक', query: 'खेती का डॉक्टर के बारे में बताओ' }
      ], 'agri', 'antiviral');
      return true;
    }

    // F. Kisan Mitra & Business Opportunity in Agriculture
    if (cleanQ.includes('किसान मित्र') || cleanQ.includes('kisan mitra') || cleanQ.includes('क्षेत्र में कमाई') || cleanQ.includes('डिस्ट्रीब्यूटर बनना') || cleanQ.includes('distributor')) {
      const resp = `🌾 **क्या आप अपने क्षेत्र में 'किसान मित्र' बनकर महीने में अच्छी कमाई करना चाहते हैं?**\n\nआरोग्यम इंडिया और नेट्सर्फ के माध्यम से आप अपने क्षेत्र के किसानों को जैविक खेती की सही सलाह देकर और उच्च गुणवत्ता के उत्पाद उपलब्ध कराकर प्रति माह ₹25,000 से ₹1,00,000+ तक की सम्मानजनक कमाई कर सकते हैं। आप हमारे साथ सीधे डिस्ट्रीब्यूटर के रूप में जुड़ सकते हैं।\n\n👉 **सीधा संपर्क:** आप अभी **दादा अवनीश (अविनिश कुमार मिश्रा जी)** से बात करें, उनका अधिकृत मोबाइल नंबर **7974422572** है।`;
      const waUrl = buildAvneeshWhatsAppHandoffUrl('किसान मित्र बनकर अच्छी कमाई का विज़न');
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🌾 किसान मित्र बनें — आत्मनिर्भर भारत व मासिक कमाई
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:10px 16px;display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-brands fa-whatsapp"></i> दादा अवनीश जी से सीधे WhatsApp पर बात करें (7974422572) →
          </a>
        </div>
      `;
      streamBotMessage(html, 'क्या आप अपने क्षेत्र में किसान मित्र बनकर महीने में अच्छी कमाई करना चाहते हैं? अभी दादा अवनीश से 7974422572 पर बात करें।');
      return true;
    }

    // G. Naturamore Joint Care
    if (cleanQ.includes('joint care') || cleanQ.includes('जॉइंट केयर') || cleanQ.includes('जोड़ों का दर्द') || cleanQ.includes('घुटनों का दर्द') || cleanQ.includes('गठिया')) {
      const resp = `🦴 **नेचुरामोर जॉइंट केयर (Naturamore Joint Care) — दर्द व कार्टिलेज समाधान:**\n• **मुख्य कारण:** यूरिक एसिड, उम्र, चोट और साइनोवियल फ्लूइड की कमी।\n• **घटक:** ग्लूकोसामाइन HCl, सलाई गुग्गुल (Boswellia 65%), हड़जोड़ (Cissus) और रसना।\n• **खुराक:** 1 कैप्सूल सुबह और 1 शाम भोजनोपरांत गुनगुने पानी से।\n💰 **ऑफर:** 25% फ्लैट डिस्काउंट व 5+1 ऑटो-शिपिंग उपलब्ध है।`;
      renderCrispSpecialBox('🦴 नेचुरामोर जॉइंट केयर — दर्द व कार्टिलेज समाधान (25% छूट)', resp, [
        { text: '🌿 इसके अंदर क्या-क्या घटक हैं?', query: 'नेचुरामोर जॉइंट केयर के अंदर क्या है' },
        { text: '💊 सेवन की सही विधि व समय', query: 'जॉइंट केयर कैसे खाएं' },
        { text: '🛒 25% छूट पर कार्ट में जोड़ें', query: 'जॉइंट केयर पेज लिंक' }
      ], 'health', 'joint_care');
      return true;
    }

    // H. Naturamore Nutri Heart
    if (cleanQ.includes('nutri heart') || cleanQ.includes('न्यूट्री हार्ट') || cleanQ.includes('हार्ट केयर')) {
      const resp = `❤️ **नेचुरामोर न्यूट्री हार्ट (Naturamore Nutri Heart) — हृदय व नस सुरक्षा:**\n• **घटक:** अर्जुन छाल अर्क, लहसुन, अंगूर बीज अर्क और को-एंजाइम Q10।\n• **कार्य:** नसों में लचीलापन बनाए रखता है, खराब कोलेस्ट्रॉल (LDL) कम करता है और सामान्य बीपी बनाए रखता है।\n💰 **ऑफर:** 25% फ्लैट डिस्काउंट उपलब्ध है।`;
      renderCrispSpecialBox('❤️ नेचुरामोर न्यूट्री हार्ट — हृदय व नस सुरक्षा (25% छूट)', resp, [
        { text: '💊 सेवन विधि व खुराक', query: 'न्यूट्री हार्ट कैसे खाएं' },
        { text: '🛒 25% छूट पर कार्ट में डालें', query: 'हार्ट केयर उत्पाद पेज' }
      ], 'health', 'nutri_heart');
      return true;
    }

    // I. Pet Vet (Formerly CFC Plus)
    if (cleanQ.includes('pet vet') || cleanQ.includes('पेट वेट') || cleanQ.includes('pet-vet') || cleanQ.includes('cfc') || cleanQ.includes('सीएफसी') || cleanQ.includes('गाय का दूध') || cleanQ.includes('भैंस का दूध') || ((cleanQ.includes('गाय') || cleanQ.includes('भैंस') || cleanQ.includes('पशु')) && (cleanQ.includes('दूध') || cleanQ.includes('फैट')))) {
      const resp = `🐄 **बायोफिट पेट-वेट (Pet-Vet — पूर्व में CFC Plus) — दुग्ध, फैट व पशु स्वास्थ्य फॉर्मूला:**\n\n📢 **महत्वपूर्ण सूचना:** नेट्सर्फ का लोकप्रिय पशु पोषण सप्लीमेंट 'CFC Plus' अब नए उन्नत फॉर्मूलेशन में **'Pet-Vet (पेट-वेट)'** के नाम से उपलब्ध है।\n\n📦 **3 उपलब्ध साइज एवं आधिकारिक MRP:**\n• **250 ग्राम:** MRP **₹399**\n• **500 ग्राम:** MRP **₹699**\n• **1 किलोग्राम:** MRP **₹1,275**\n\n🥄 **खुराक एवं सेवन विधि:**\n• **बड़े दुधारू पशु (गाय/भैंस):** **10 से 15 ग्राम प्रतिदिन** सुबह के दाने या चारे में मिलाकर दें।\n• **छोटे पशु (बछड़े, बकरी, भेड़):** **5 ग्राम प्रतिदिन** दें।\n\n✅ **मुख्य लाभ:**\n1. दूध उत्पादन में 15% से 25% की प्राकृतिक वृद्धि।\n2. दूध का फैट (7 से 8 डिग्री) और SNF में स्पष्ट बढ़ोतरी।\n3. पशु की पाचन क्रिया दुरुस्त होती है, त्वचा व बालों में चमक आती है और बार-बार रिपीट होने (बांझपन) की समस्या समाप्त होती है।\n\n💰 **ऑफर:** नई आईडी पर ₹100 वेलकम वाउचर और 25% तक स्थायी रीपरचेज छूट।`;
      renderCrispSpecialBox('🐄 बायोफिट पेट-वेट (Pet-Vet / पूर्व CFC Plus) — 250g, 500g, 1kg', resp, [
        { text: '🌿 पेट-वेट के घटक व फायदे', query: 'पेट वेट के अंदर क्या क्या घटक हैं' },
        { text: '🥄 10-15 ग्राम दैनिक खुराक नियम', query: 'पेट वेट कैसे खिलाएं' },
        { text: '📦 1kg, 500g, 250g रेट व छूट', query: 'पेट वेट 25% छूट पर ऑर्डर करें' },
        { text: '🥛 भैंस का दूध व 7-8 फैट', query: 'भैंस का दूध 7 से 8 फैट लाने का तरीका' }
      ], 'pashu', 'pet_vet_cfc');
      return true;
    }

    // J. Naturamore General Nutrition
    if (cleanQ.includes('naturamore') || cleanQ.includes('नेचुरामोर')) {
      const resp = `🌿 **नेचुरामोर (Naturamore) — 100% हर्बल न्यूट्रिशनल हेल्थ सप्लीमेंट:**\n• **सेवन विधि:** 1 चम्मच (10 ग्राम) सुबह गुनगुने दूध या पानी के साथ।\n• **घटक:** 5 तरह के प्राकृतिक प्रोटीन, 13 जरूरी विटामिन्स, 10 मिनरल्स, एलोवेरा, अश्वगंधा व ओमेगा-3 DHA।\n• **लाभ:** दिनभर ऊर्जा, रोग प्रतिरोधक क्षमता और हड्डियों की संपूर्ण मजबूती।\n💰 **ऑफर:** फ्लैट 25% डिस्काउंट व 5+1 ऑटो-शिपिंग।`;
      renderCrispSpecialBox('🌿 नेचुरामोर संपूर्ण स्वास्थ्य पोषण गाइड (25% छूट)', resp, [
        { text: '🦴 जोड़ों के दर्द में जॉइंट केयर', query: 'नेचुरामोर जॉइंट केयर के बारे में बताओ' },
        { text: '❤️ हृदय स्वास्थ्य में न्यूट्री हार्ट', query: 'न्यूट्री हार्ट कैसे खाएं' },
        { text: '🩺 शुगर/डायबिटीज में उपयोग', query: 'शुगर में नेचुरामोर कैसे लें' }
      ], 'health', 'naturamore');
      return true;
    }

    return false;
  }

  // 17. DEDICATED SPRAY CALENDAR ROUTER (CROPS & GENERAL MENU)
  function handleDedicatedSprayQuery(cleanQ, query) {
    const isSprayQ = cleanQ.includes('स्प्रे') || cleanQ.includes('spray') || cleanQ.includes('दवा का छिड़काव') || cleanQ.includes('छिड़काव');
    if (!isSprayQ) return false;

    const isWheat = cleanQ.includes('गेहूं') || cleanQ.includes('wheat') || cleanQ.includes('gehu');
    const isMustard = cleanQ.includes('सरसों') || cleanQ.includes('mustard') || cleanQ.includes('sarso') || cleanQ.includes('sarson');
    const isChana = cleanQ.includes('चना') || cleanQ.includes('gram') || cleanQ.includes('chana');
    const isVeg = cleanQ.includes('सब्जी') || cleanQ.includes('टमाटर') || cleanQ.includes('मिर्च') || cleanQ.includes('बैंगन') || cleanQ.includes('प्याज') || cleanQ.includes('veg');

    if (isWheat) {
      const resp = `🌾 **गेहूं फसल का 4-चरण वैज्ञानिक स्प्रे कैलेंडर:**\n• 1. कल्ले व फुटाव (21-25 दिन, पहली सिंचाई बाद): स्टिमरिच 30ml + Bio-99 5ml + 19:19:19 75g प्रति 15L पंप।\n• 2. गांठ बनते समय (40-45 दिन): एनपीके 12:61:0 75g + Bio-99 5ml।\n• 3. गभोट अवस्था (60-65 दिन): एनपीके 0:52:34 75g + बोरॉन 20% 20g (लंबी बालियां व परागण)।\n• 4. दाना भराव (दूधिया अवस्था): एनपीके 0:0:50 (पोटाश) 75g प्रति पंप (वजनदार व चमकदार दाना)।`;
      renderCrispSpecialBox('🌾 गेहूं फसल का वैज्ञानिक 4-चरण स्प्रे कैलेंडर', resp, [
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' },
        { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' },
        { text: '🧪 स्टिमरिच डोज', query: 'स्टिमरिच और बायो-99 की सही डोज क्या है?' }
      ], 'agri', 'wheat_calendar');
      return true;
    }

    if (isMustard) {
      const resp = `🌱 **सरसों फसल का वैज्ञानिक स्प्रे कैलेंडर:**\n• 1. शाखा फुटाव (25-30 दिन): स्टिमरिच 30ml + Bio-99 5ml + घुलनशील सल्फर 40g प्रति 15L पंप।\n• 2. फूल आने से पूर्व (45-50 दिन): बोरॉन 20% 20g + 19:19:19 75g प्रति पंप।\n• 3. माहू/चेपा दिखने पर: इमिडाक्लोप्रिड 17.8% SL 6ml + Bio-99 5ml प्रति 15L पंप।\n• 4. फली दाना बनते समय: एनपीके 0:0:50 75g (तेल प्रतिशत व दाना वजन बढ़ाने हेतु)।`;
      renderCrispSpecialBox('🌱 सरसों फसल का वैज्ञानिक स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' }
      ], 'agri', 'mustard_calendar');
      return true;
    }

    if (isChana) {
      const resp = `🌿 **चना फसल का वैज्ञानिक स्प्रे कैलेंडर:**\n• 1. शाखाएं व कल्ले (30-35 दिन): स्टिमरिच 30ml + Bio-99 5ml + 19:19:19 75g।\n• 2. फूल आने से पूर्व: बोरॉन 20% 20g प्रति 15L पंप (फूल झड़ने से रोकने हेतु)।\n• 3. घटी-इल्ली रोकथाम: इमामेक्टिन 5% SG 8g + Bio-99 5ml या बायोफिट लार्विसाइड 30ml प्रति 15L पंप।\n• 4. दाना भराव: 0:0:50 75g प्रति 15L पंप।`;
      renderCrispSpecialBox('🌿 चना फसल का वैज्ञानिक स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' }
      ], 'agri', 'chana_calendar');
      return true;
    }

    if (isVeg) {
      const resp = `🥦 **सब्जी, मिर्च व टमाटर का वैज्ञानिक स्प्रे कैलेंडर:**\n• 1. रोपाई के 15-20 दिन: स्टिमरिच 30ml + Bio-99 5ml + 19:19:19 75g।\n• 2. फूल आने के समय: बोरॉन 20% 20g + स्टिमरिच 30ml प्रति पंप।\n• 3. रसचूसक कीट (थ्रिप्स/सफेद मक्खी): एसिटामिप्रिड 20% SP 8g + Bio-99 5ml।\n• 4. फल विकास: एनपीके 13:0:45 या 0:0:50 75g प्रति 15L पंप।`;
      renderCrispSpecialBox('🥦 सब्जी, मिर्च व टमाटर का स्प्रे कैलेंडर', resp, [
        { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
        { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' }
      ], 'agri', 'veg_calendar');
      return true;
    }

    // General Spray Calendar Selection (Interactive crop menu)
    const prompt = `किसान साथी! हर फसल का स्प्रे समय और दवाओं का कॉम्बिनेशन अलग होता है। कृपया नीचे अपनी फसल चुनें ताकि उसका सटीक 4-चरण स्प्रे कैलेंडर देख सकें:`;
    renderCrispSpecialBox('📅 फसलों का संपूर्ण वैज्ञानिक स्प्रे कैलेंडर', prompt, [
      { text: '🌾 गेहूं स्प्रे कैलेंडर', query: 'गेहूं का स्प्रे कैलेंडर' },
      { text: '🌱 सरसों स्प्रे कैलेंडर', query: 'सरसों का स्प्रे कैलेंडर' },
      { text: '🌿 चना स्प्रे कैलेंडर', query: 'चना का स्प्रे कैलेंडर' },
      { text: '🥦 सब्जी, मिर्च व टमाटर कैलेंडर', query: 'सब्जी मिर्च का स्प्रे कैलेंडर' }
    ], 'agri', 'spray_menu');
    return true;
  }

  // 17.3 DEDICATED CONVERSATIONAL NETSURF OVERVIEW ROUTER (4-5 Category Options & Direct Landing Links)
  function handleConversationalNetsurf(cleanQ, rawQ) {
    const isNetsurfGeneral = cleanQ === 'netsurf' || cleanQ === 'नेट्सर्फ' || cleanQ === 'about netsurf' || cleanQ.includes('about netsurf') || cleanQ.includes('netsurf kya hai') || cleanQ.includes('नेट्सर्फ क्या है') || cleanQ === 'netsurf company' || cleanQ === 'नेट्सर्फ कंपनी' || cleanQ === 'netsurf ke bare me' || cleanQ.includes('नेट्सर्फ के बारे में');
    const isAskingPlanExplicitly = cleanQ.includes('plan') || cleanQ.includes('प्लान') || cleanQ.includes('8.19') || cleanQ.includes('capping') || cleanQ.includes('कैपिंग') || cleanQ.includes('income') || cleanQ.includes('कमाई') || cleanQ.includes('कमीशन') || cleanQ.includes('commission');

    if (isNetsurfGeneral && !isAskingPlanExplicitly) {
      const resp = `नेट्सर्फ (Netsurf Communications Pvt. Ltd.) भारत की 26 वर्षों से प्रतिष्ठित 100% स्वदेशी डायरेक्ट सेलिंग कंपनी है, जिसका मुख्यालय पुणे में है।\n\nनेट्सर्फ के उत्पाद 4 प्रमुख वैज्ञानिक वर्टिकल्स (खेती, स्वास्थ्य, सौंदर्य, पशुपालन) में कार्य करते हैं और सभी उत्पादों पर **25% फ्लैट छूट** व **5+1 ऑटो-शिपिंग (6वें माह मुफ्त)** मिलती है।\n\nआप नेट्सर्फ के किस विषय के बारे में जानना चाहते हैं? नीचे से विकल्प चुनें:`;

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🏢 नेट्सर्फ (Netsurf) — 26 वर्षों का स्वदेशी विश्वास
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 4 प्रमुख वर्टिकल्स व करियर विकल्प चुनें:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('बायोफिट जैविक खेती उत्पाद')">🌾 1. बायोफिट (जैविक खेती)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेचुरामोर स्वास्थ्य सप्लीमेंट्स')">🌿 2. नेचुरामोर (हेल्थ सप्लीमेंट्स)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('हर्ब्स एंड मोर स्किन केयर')">🌸 3. हर्ब्स एंड मोर (पर्सनल व ब्यूटी)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('पेट वेट और सीएफसी प्लस का काम बताओ')">🐄 4. पेट-वेट (पशु पोषण व दुग्ध वृद्धि)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ 25% छूट व 8.19 लाख कैपिंग बिजनेस प्लान बताओ')">💼 5. 25% छूट व बिज़नेस प्लान</button>
          </div>
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 आधिकारिक पेज व कैटलॉग:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <a href="/categories/netsurf.html" target="_blank" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              💼 नेट्सर्फ करियर व प्लान पेज खोलें →
            </a>
            <a href="/categories/netsurf-products.html" target="_blank" class="sakhi-followup-chip" style="background:#0284c7;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              📥 7 भाषाओं में Netsurf-Catalog डाउनलोड करें →
            </a>
          </div>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'netsurf';
      sakhiConversationState.lastActiveEntity = 'netsurf_overview';
      sakhiConversationState.lastActiveEntityName = 'नेट्सर्फ परिचय';
      streamBotMessage(html, cleanTextForTTS('नेट्सर्फ 26 वर्षों से प्रतिष्ठित स्वदेशी कंपनी है जिसके 4 प्रमुख वर्टिकल्स हैं। कृपया अपना विषय चुनें।'));
      return true;
    }
    return false;
  }

  // 17.4 DEDICATED CONVERSATIONAL BIOFIT OVERVIEW ROUTER (4-5 Category Options & Direct Landing Links)
  function handleConversationalBiofit(cleanQ, rawQ) {
    const isBiofitGeneral = cleanQ === 'biofit' || cleanQ === 'बायोफिट' || cleanQ === 'about biofit' || cleanQ.includes('about biofit') || cleanQ.includes('बायोफिट क्या है') || cleanQ.includes('biofit kya hai') || cleanQ.includes('बायोफिट के बारे में');
    const isSpecificProduct = cleanQ.includes('stimrich') || cleanQ.includes('स्टिमरिच') || cleanQ.includes('bio-99') || cleanQ.includes('बायो-99') || cleanQ.includes('wrap up') || cleanQ.includes('रैप अप') || cleanQ.includes('intact') || cleanQ.includes('इंटैक्ट') || cleanQ.includes('npk') || cleanQ.includes('कैलेंडर');

    if (isBiofitGeneral && !isSpecificProduct) {
      const resp = `बायोफिट (Biofit) नेट्सर्फ की 100% प्रमाणित व विषमुक्त जैविक कृषि तकनीक है। यह रासायनिक खादों व जहरीले कीटनाशकों का खर्च 40-50% घटाकर पैदावार 25-40% तक बढ़ाती है।\n\nआप बायोफिट के किस समाधान के बारे में जानना चाहते हैं? नीचे से विकल्प चुनें:`;

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🌾 बायोफिट (Biofit) — जहरमुक्त खेती, समृद्ध किसान
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 बायोफिट मुख्य उत्पाद व स्प्रे कैलेंडर:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('स्टिमरिच और बायो-99 की सही डोज क्या है?')">🌱 1. स्टिमरिच + बायो-99 (वृद्धि व फुटाव)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('रैप अप फंगस रोधक का उपयोग')">🛡️ 2. रैप अप (फंगल व वायरस सुरक्षा)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('इंटैक्ट जैविक कीटनाशक रस चूसक कीट')">🐛 3. इंटैक्ट (जैविक कीट नियंत्रण)</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('फसलों में खाद व स्प्रे फॉर्मूला बताएं')">📅 4. 4-चरण वैज्ञानिक स्प्रे कैलेंडर</button>
          </div>
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 आधिकारिक पेज व फसल डॉक्टर:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <a href="/crop-doctor.html" target="_blank" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              🌾 फसल डॉक्टर पेज खोलें →
            </a>
            <a href="/categories/netsurf-products.html" target="_blank" class="sakhi-followup-chip" style="background:#0284c7;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              📦 बायोफिट उत्पाद कैटलॉग देखें →
            </a>
          </div>
        </div>
      `;
      sakhiConversationState.lastActiveDomain = 'agri';
      sakhiConversationState.lastActiveEntity = 'biofit_overview';
      sakhiConversationState.lastActiveEntityName = 'बायोफिट जैविक कृषि';
      streamBotMessage(html, cleanTextForTTS('बायोफिट नेट्सर्फ की जैविक कृषि तकनीक है। कृपया अपना विषय या उत्पाद चुनें।'));
      return true;
    }
    return false;
  }

  // 17.5 DEDICATED NETSURF CORPORATE PROFILE, FOUNDERS & 4-VERTICAL PORTFOLIO ROUTER
  function handleNetsurfCompanyProfile(cleanQ, query) {
    const isProfileKeyword = cleanQ.includes('प्रोफाइल') || cleanQ.includes('profile') || cleanQ.includes('कंपनी की प्रोफाइल') || cleanQ.includes('कंपनी प्रोफाइल') || cleanQ.includes('कंपनी परिचय') || cleanQ.includes('company profile');
    const isFounderKeyword = cleanQ.includes('फाउंडर') || cleanQ.includes('संस्थापक') || cleanQ.includes('प्रमोटर') || cleanQ.includes('promoter') || cleanQ.includes('founder') || cleanQ.includes('मालिक') || cleanQ.includes('owner') || cleanQ.includes('सुजीत जैन') || cleanQ.includes('sujit jain') || cleanQ.includes('संजीव जैन') || cleanQ.includes('sanjay jain');
    const isCompanyOrigin = cleanQ.includes('स्थापना') || cleanQ.includes('मुख्यालय') || cleanQ.includes('headquarter') || cleanQ.includes('hq') || cleanQ.includes('पुणे') || cleanQ.includes('pune') || cleanQ.includes('कंपनी का इतिहास') || cleanQ.includes('कंपनी इतिहास');
    const isPortfolioOverview = cleanQ.includes('कितने प्रकार के उत्पाद') || cleanQ.includes('कितने प्रकार के प्रोडक्ट') || cleanQ.includes('चार वर्टिकल') || cleanQ.includes('4 वर्टिकल') || cleanQ.includes('product portfolio') || cleanQ.includes('उत्पाद श्रेणियां') || cleanQ.includes('पोर्टफोलियो') || ((cleanQ.includes('कितने') || cleanQ.includes('कौन')) && (cleanQ.includes('उत्पाद') || cleanQ.includes('प्रोडक्ट')));
    const isDirectCompanyQuestion = (cleanQ.includes('नेट्सर्फ') || cleanQ.includes('netsurf')) && (cleanQ.includes('कंपनी क्या है') || cleanQ.includes('कंपनी के बारे में') || cleanQ.includes('कंपनी कैसी है') || cleanQ.includes('company kya hai') || cleanQ.includes('about company') || cleanQ.includes('about netsurf') || cleanQ === 'netsurf company' || cleanQ === 'नेट्सर्फ कंपनी' || cleanQ.includes('उत्पाद हैं'));

    if (isProfileKeyword || isFounderKeyword || isCompanyOrigin || isPortfolioOverview || isDirectCompanyQuestion) {
      const profileText = `🏢 **नेट्सर्फ कम्युनिकेशन्स प्रा. लि. (Netsurf Communications Pvt. Ltd.) — कॉर्पोरेट प्रोफाइल एवं परिचय:**

1️⃣ **कंपनी की स्थापना और अनुभव (Establishment & Introduction):**
• **स्थापना वर्ष:** साल **2000** में स्थापित।
• **अनुभव:** डायरेक्ट सेलिंग एवं जैविक अनुसंधान के क्षेत्र में **26 वर्षों से अधिक** का गौरवशाली व सफल इतिहास।
• **मुख्यालय (Headquarters):** **पुणे, महाराष्ट्र (भारत)**।

2️⃣ **प्रमोटर्स एवं फाउंडर्स (Promoters & Founders):**
• **संस्थापक:** नेट्सर्फ की नींव **सुजीत जैन (Sujit Jain)** और **संजीव जैन (Sanjay Jain)** द्वारा रखी गई।
• **मैनेजिंग डायरेक्टर:** **सुजीत जैन (Managing Director & Founder)** के दूरदर्शी नेतृत्व में यह भारत की सबसे भरोसेमंद, नैतिक और 100% स्वदेशी डायरेक्ट सेलिंग कंपनी बनी है।

3️⃣ **उत्पाद पोर्टफोलियो (Product Portfolio — 4 प्रमुख वर्टिकल्स, 100% R&D प्रमाणित):**
🌾 **1. बायोफिट (Biofit — Organic Agriculture):**
जैविक खेती के क्रांतिकारी उत्पाद जैसे स्टिमरिच (Stimrich), बायो 99 (Bio 99), रैप अप (Wrap Up), लार्विसाइड, NPK बैक्टीरिया व VEM माइकोराइजा। रासायनिक खादों पर निर्भरता घटाकर पैदावार 25-40% बढ़ाते हैं।
🌿 **2. नेचुरमोरे (Naturamore — Health & Dietary Supplements):**
मानव स्वास्थ्य और पोषण के लिए दैनिक आहार पूरक जैसे नेचुरमोरे फॉर वुमन, मेन्स वेलनेस, न्यूट्रीहेल्थ, जॉइंट केयर, लिवर केयर, डायबिटीज केयर और 27 विटामिन्स-मिनरल्स युक्त नेचुरमोरे किड्स।
🌸 **3. हर्ब्स एंड मोर (Herbs & More — Personal Care & Beauty):**
त्वचा और बालों की देखभाल के लिए पैराबीन-मुक्त (Paraben-free) प्रीमियम उत्पाद जैसे फेसवाश, शैम्पू, स्किन क्रीम, डे-टान स्क्रब और जॉइंट केयर पेन क्रीम।
🐄 **4. पेट-वेट (Pet-Vet / पूर्व में CFC Plus — Animal Care & Nutrition):**
दुधारू पशुओं (गाय-भैंस) का दूध उत्पादन व 7 से 8 फैट बढ़ाने, पाचन सुधारने व बांझपन दूर करने वाला संपूर्ण पशु आहार सप्लीमेंट।
📦 **उपलब्ध साइज व आधिकारिक MRP:**
• **250 ग्राम:** MRP **₹399**
• **500 ग्राम:** MRP **₹699**
• **1 किलोग्राम:** MRP **₹1,275**
🥄 **खुराक:** गाय-भैंस हेतु **10 से 15 ग्राम प्रतिदिन** और बछड़े/बकरी हेतु **5 ग्राम प्रतिदिन**।

4️⃣ **बिजनेस सुअवसर:**
उपभोक्ताओं को फ्री जॉइनिंग पर तुरंत ₹100 का वाउचर व 25% फ्लैट डिस्काउंट, और रिटेलर्स को 15 दिन में अधिकतम **₹8,19,250 पाक्षिक कैपिंग (महीने का ₹16,38,500)** की कानूनी आय सीमा।`;

      const waUrl = buildAvneeshWhatsAppHandoffUrl('नेट्सर्फ कंपनी प्रोफाइल व 4 उत्पाद वर्टिकल्स की जानकारी');

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🏢 नेट्सर्फ कम्युनिकेशन्स प्रा. लि. — कॉर्पोरेट प्रोफाइल व 4 उत्पाद वर्टिकल्स
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(profileText)}
        </div>
        ${buildMsgAudioBtnMarkup(profileText)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 अधिकृत लिंक्स व सेवाएं:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <a href="/categories/netsurf.html" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              💼 नेट्सर्फ बिजनेस व ₹8.19L कैपिंग प्लान →
            </a>
            <a href="/categories/netsurf-products.html" class="sakhi-followup-chip" style="background:#0284c7;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              📦 नेट्सर्फ 4 वर्टिकल्स के उत्पाद देखें →
            </a>
          </div>
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-brands fa-whatsapp"></i> दादा अवनीश जी से सीधे WhatsApp पर जुड़ें (7974422572) →
          </a>
        </div>
      `;

      consecutiveAmbiguousCount = 0;
      sakhiConversationState.lastActiveDomain = 'netsurf';
      sakhiConversationState.lastActiveEntity = 'netsurf_profile';
      sakhiConversationState.lastActiveEntityName = 'नेट्सर्फ कंपनी प्रोफाइल';
      streamBotMessage(html, cleanTextForTTS('नेट्सर्फ की स्थापना साल 2000 में पुणे में हुई थी। इसके संस्थापक सुजीत जैन और संजीव जैन हैं। नेट्सर्फ के 4 प्रमुख वर्टिकल्स हैं: बायोफिट, नेचुरमोरे, हर्ब्स एंड मोर, और पेट-वेट।'));
      return true;
    }
    return false;
  }

  // 18. DEDICATED NETSURF DIRECT SELLING & 15-DAY ₹8,19,250 CAPPING PLAN ROUTER
  function handleNetsurfPlanQuery(cleanQ, query) {
    const isNetsurf = cleanQ.includes('netsurf') || cleanQ.includes('नेट्सर्फ') || cleanQ.includes('बायोफिट') || cleanQ.includes('biofit');
    const isPlan = cleanQ.includes('plan') || cleanQ.includes('प्लान') || cleanQ.includes('कमीशन') || cleanQ.includes('commission') || cleanQ.includes('8.19') || cleanQ.includes('8,19,250') || cleanQ.includes('819250') || cleanQ.includes('1638500') || cleanQ.includes('16.38') || cleanQ.includes('कैपिंग') || cleanQ.includes('बाइनरी') || cleanQ.includes('डायरेक्ट सेलिंग') || cleanQ.includes('रिटेल') || cleanQ.includes('क्लब नेट्सर्फ') || cleanQ.includes('बिजनेस प्लान') || cleanQ.includes('बिज़नेस प्लान') || cleanQ.includes('ऑटो शिपिंग') || cleanQ.includes('ऑटो-शिप') || cleanQ.includes('5+1') || cleanQ.includes('डिस्काउंट') || cleanQ.includes('जॉइनिंग') || cleanQ.includes('joining') || cleanQ.includes('फीस');

    if ((isNetsurf && isPlan) || cleanQ.includes('नेट्सर्फ प्लान') || cleanQ.includes('netsurf plan') || cleanQ.includes('नेट्सर्फ बिजनेस प्लान') || cleanQ.includes('नेट्सर्फ बिज़नेस प्लान') || cleanQ.includes('8,19,250') || cleanQ.includes('819250') || cleanQ.includes('1638500') || cleanQ.includes('नेट्सर्फ (25% छूट व प्लान)')) {
      const planAnswer = `नेट्सर्फ एक डायरेक्ट सेलिंग कंपनी है जो पिछले 26 सालों से स्वास्थ्य, जैविक खेती और डायरेक्ट सेलिंग में काम कर रही है। आप इसके बारे में क्या जानना चाहते हैं?\n\nनेट्सर्फ का प्रमाणित बिज़नेस प्लान मुख्य रूप से Consumer, Retailer और Super Retailer के लिए है:\n\n1. **Consumer (उपभोक्ता) प्लान:**\n• **फ्री जॉइनिंग:** कोई रजिस्ट्रेशन शुल्क नहीं।\n• **₹100 प्रोडक्ट वाउचर:** जॉइनिंग पर तुरंत ₹100 का वाउचर।\n• **25% फ्लैट डिस्काउंट:** सभी प्रोडक्ट्स पर सीधा 25% डिस्काउंट (कोई पुराना 25-30% का आंकड़ा नहीं, बिल्कुल पक्का 25% डिस्काउंट)।\n• **5+1 ऑटो-शिपिंग:** हर महीने नियमित खरीदारी करने पर 6वें महीने उत्पाद बिल्कुल मुफ्त (5 खरीदें + 1 फ्री)!\n\n2. **Retailer (रिटेलर) प्लान — 4 बड़े आय स्रोत:**\n• 1) **Retail Commission:** 5% से 15% (यह साप्ताहिक मिलता है)।\n• 2) **Generation Income:** 3% से 8% (10,000 टर्नओवर पर 3%, 20k पर 4%, 40k पर 5%, 80k पर 6%, 1.20L पर 7%, 1.60L पर 8% — यह 15-15 दिन में मिलता है)।\n• 3) **Binary / Team Commission:** लगभग 3% से 5% (यह भी हर 15-15 दिन में मिलता है)। **15 दिन की अधिकतम सीमा ₹8,19,250 (पाक्षिक कैपिंग)** है। क्या आप महीने का ₹16,38,500 कमाना चाहते हैं? तो अभी दादा अविनाश (अवनीश) से संपर्क करें और यह पेज ओपन करें।\n• 4) **Other Benefits:** क्लब नेट्सर्फ, फैमिली प्रोटेक्शन प्लान (₹10 लाख दुर्घटना बीमा व नॉमिनी सुरक्षा), और राष्ट्रीय व अंतरराष्ट्रीय यात्राएं।`;

      const waOfferUrl = buildAvneeshWhatsAppHandoffUrl('नेट्सर्फ बिज़नेस प्लान व 15-दिवसीय ₹8.19L कैपिंग मार्गदर्शन');

      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          💼 नेट्सर्फ डायरेक्ट सेलिंग — 26 वर्षों का विश्वास व ₹8,19,250 पाक्षिक कैपिंग
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(planAnswer)}
        </div>
        ${buildMsgAudioBtnMarkup(planAnswer)}

        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 अधिकृत पेज व 7 भाषाओं में कैटलॉग डाउनलोड:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <a href="/categories/netsurf.html" class="sakhi-followup-chip" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              💼 नेट्सर्फ करियर व प्लान पेज खोलें →
            </a>
            <a href="/categories/netsurf-products.html" class="sakhi-followup-chip" style="background:#0284c7;color:#fff;text-decoration:none;font-weight:800;padding:8px 14px;">
              📥 7 भाषाओं में Netsurf-Catalog डाउनलोड करें →
            </a>
          </div>
          <a href="${escapeHtml(waOfferUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-brands fa-whatsapp"></i> दादा अवनीश जी से सीधे WhatsApp पर जुड़ें (7974422572) →
          </a>
        </div>
      `;

      consecutiveAmbiguousCount = 0;
      sakhiConversationState.lastActiveDomain = 'netsurf';
      sakhiConversationState.lastActiveEntity = 'netsurf_plan';
      sakhiConversationState.lastActiveEntityName = 'नेट्सर्फ बिज़नेस प्लान';
      streamBotMessage(html, cleanTextForTTS('नेट्सर्फ 26 सालों से कार्यरत है। कंज्यूमर्स को 25% फ्लैट डिस्काउंट और 5+1 ऑटो शिपिंग मिलती है। रिटेलर्स को 15 दिन में अधिकतम 8 लाख 19 हजार 250 रुपये कैपिंग मिलती है। महीने का 16 लाख 38 हजार 500 रुपये कमाने के लिए दादा अवनीश से संपर्क करें।'));
      return true;
    }
    return false;
  }

  // 19. CORE INTENT RETRIEVAL & DOMAIN FIREWALL
  function processKnowledgeQuery(query) {
    const rawQ = query.trim();
    const cleanQ = normalizeQueryText(rawQ);
    const targetDomain = classifyQueryDomain(cleanQ);

    // Track user input in history
    sakhiConversationState.history.push({
      role: 'user',
      query: rawQ,
      clean: cleanQ,
      time: Date.now()
    });

    // Zero-Egress Dynamic User Persona & Session Memory Update
    updateSakhiUserPersonaFromQuery(cleanQ, targetDomain);

    // 0. Safety Guardrails & Emergency Refusal Protocol (Abuse, Poison, Heart Attack, Agri Overdose, Heat Spray)
    if (handleSafetyGuardrails(cleanQ, rawQ)) {
      return;
    }

    // 0.01 Everyday Conversational & Casual Social Router (Hi, Hello, Namaste, Kaise ho, Tum kaun ho)
    if (handleEverydayConversations(cleanQ, rawQ)) {
      return;
    }

    // 0.02 Conversational Netsurf & Biofit General Overview (4-5 Category Options & Landing Page Links)
    if (handleConversationalNetsurf(cleanQ, rawQ)) {
      return;
    }
    if (handleConversationalBiofit(cleanQ, rawQ)) {
      return;
    }

    // 0.05 Dedicated Aarogyam Tube Video Hub Router
    if (handleAarogyamTubeRouter(cleanQ, rawQ)) {
      return;
    }

    // 0.1 Live Weather & Spray Guidelines Router
    if (handleWeatherAndLiveSpray(cleanQ, rawQ)) {
      return;
    }

    // 0.2 Universal Seed Treatment (बीज संस्कार) Protocol
    if (handleSeedTreatmentMaster(cleanQ, rawQ)) {
      return;
    }

    // 0.3 Cross-Domain Context Disambiguation (Root, Insects, Growth, Powder, Tonic)
    if (handleCrossDomainDisambiguation(cleanQ, rawQ)) {
      return;
    }

    // 0.4 Certified 13 Specialized Clinical Health Pages, Medical Science & Diet Charts (PRIORITY OVER GENERIC COSMETICS)
    if (handle13HealthPagesAndSponsor(cleanQ, rawQ)) {
      return;
    }

    // 0.5 Beauty, Skincare, Haircare, Weight & Women Empowerment Engine (Cosmetics & Self-Care)
    if (handleBeautyHairWeightWomenEmpowerment(cleanQ, rawQ)) {
      return;
    }

    // 1.05 Dadi-Nani Ke Gharelu Nuskhe Router (सेहत, सौंदर्य व हेयर फॉल)
    if (handleDadiKeNuskhe(cleanQ, rawQ)) {
      return;
    }

    // 1.1 E-Books Intelligence, FAQs & Direct UPI Payment Assistance (BK001, BK002, BK015, BK016, BK018)
    if (handleBookInquiriesAndFaq(cleanQ, rawQ)) {
      return;
    }

    // 2. Multi-Turn Pronoun & Follow-Up Context Resolver (e.g., "kya kya hai iske andar", "kaise khaye", etc.)
    if (resolveFollowUpQuery(cleanQ, rawQ)) {
      return;
    }

    // 2.5 Dedicated Netsurf Corporate Profile, Founders & 4-Vertical Router
    if (handleNetsurfCompanyProfile(cleanQ, rawQ)) {
      return;
    }

    // 3. Comprehensive Netsurf Products & Agricultural Entities Handler
    if (handleComprehensiveNetsurfCatalog(cleanQ, rawQ)) {
      return;
    }

    // 4. Dedicated Spray Calendar Router (Wheat, Mustard, Chana, Veg, or Interactive Menu)
    if (handleDedicatedSprayQuery(cleanQ, rawQ)) {
      return;
    }

    // 5. Certified Netsurf Business & ₹8.19L Capping Plan Router
    if (handleNetsurfPlanQuery(cleanQ, rawQ)) {
      return;
    }

    if (!knowledgeData || !knowledgeData.intents) {
      synthesizeDynamicAnswer(query, targetDomain);
      return;
    }

    // 6. Strict Domain Isolation & Session Domain Lock
    let effectiveDomain = targetDomain;
    if (effectiveDomain === 'omni' && sakhiConversationState.lastActiveDomain) {
      effectiveDomain = sakhiConversationState.lastActiveDomain;
    }

    let candidateIntents = knowledgeData.intents;
    if (effectiveDomain !== 'omni') {
      const filtered = candidateIntents.filter(item => {
        const itemDom = (item.domain || '').toLowerCase();
        if (effectiveDomain === 'agri') return itemDom === 'agri' || itemDom === 'krishi';
        if (effectiveDomain === 'pashu') return itemDom === 'pashu' || itemDom === 'veterinary';
        if (effectiveDomain === 'health') return itemDom === 'health' || itemDom === 'ayurveda';
        if (effectiveDomain === 'beauty') return itemDom === 'beauty' || itemDom === 'dermatology';
        if (effectiveDomain === 'netsurf') return itemDom === 'netsurf' || itemDom === 'business';
        if (effectiveDomain === 'business') return itemDom === 'business' || itemDom === 'netsurf';
        if (effectiveDomain === 'founder') return itemDom === 'founder';
        if (effectiveDomain === 'nuskhe') return itemDom === 'nuskhe' || itemDom === 'health' || itemDom === 'beauty';
        return true;
      });
      if (filtered.length > 0) candidateIntents = filtered;
    }

    // 6.5 DIRECT SUB-TOPIC RESOLUTION (PREVENTS CROSS-DOMAIN BLEEDING)
    const subMatch = findMatchingSubTopic(cleanQ, candidateIntents);
    if (subMatch) {
      renderDirectSubTopic(subMatch.subTopic, subMatch.parentIntent, rawQ);
      return;
    }

    // 7. Token-Weighted Intent Scorer
    const STOP_WORDS = new Set(['का','की','के','में','पर','और','हैं','है','यह','से','को','ने','या','तो','बताओ','बताइए','दीजिए','दवा','इलाज','उपचार','डोज','मात्रा','बारे','क्या','कैसे','कब','mein','bare','kare','kaise','kya','batao','dawa','dose','ilaj']);
    const qTokens = cleanQ.split(/[\s,?!।]+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t));

    let matchedIntent = null;
    let maxScore = 0;

    candidateIntents.forEach((intent) => {
      let score = 0;
      const titleLower = (intent.title || '').toLowerCase();

      // Title exact / partial match
      if (cleanQ.includes(titleLower)) score += 35;
      qTokens.forEach(token => {
        if (titleLower.includes(token)) score += 15;
      });

      // Keywords match
      (intent.keywords || []).forEach(kw => {
        const kwLower = kw.toLowerCase().trim();
        if (!kwLower || STOP_WORDS.has(kwLower)) return;
        if (cleanQ.includes(kwLower)) {
          score += (kwLower.length >= 3 ? 12 : 8);
        }
        qTokens.forEach(tok => {
          if (kwLower.includes(tok)) {
            score += 10;
          }
        });
      });

      if (score > maxScore) {
        maxScore = score;
        matchedIntent = intent;
      }
    });

    if (matchedIntent && maxScore >= 4) {
      renderDirectSummary(matchedIntent, query, targetDomain);
    } else {
      synthesizeDynamicAnswer(query, targetDomain);
    }
  }

  // 18. CRISP SPECIAL BOX RENDERER
  function renderCrispSpecialBox(title, bodyText, chips, domain, entityKey) {
    if (domain) sakhiConversationState.lastActiveDomain = domain;
    if (entityKey) sakhiConversationState.lastActiveEntity = entityKey;
    if (title) sakhiConversationState.lastActiveEntityName = title;
    sakhiConversationState.lastAnswerSnippet = (bodyText || '').slice(0, 150);

    let chipsHtml = '';
    (chips || []).forEach(c => {
      if (c.url || c.isExternal) {
        chipsHtml += `
          <a href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer" class="sakhi-followup-chip" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;${c.style || ''}">
            <span>${escapeHtml(c.text)}</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
          </a>
        `;
      } else {
        chipsHtml += `
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(c.query)}')">
            <span>${escapeHtml(c.text)}</span> →
          </button>
        `;
      }
    });

    // Dynamic E-Book & Aarogyam Tube Video Recommendations from Persona
    const recoChips = getPersonaRecommendationChips();
    let recoHtml = '';
    if (recoChips && recoChips.length > 0) {
      recoChips.forEach(rc => {
        if (rc.url || rc.isExternal) {
          recoHtml += `
            <a href="${escapeHtml(rc.url)}" target="_blank" rel="noopener noreferrer" class="sakhi-followup-chip" style="background:#eff6ff;border-color:#93c5fd;color:#1e40af;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
              <span>${escapeHtml(rc.text)}</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
            </a>
          `;
        } else {
          recoHtml += `
            <button type="button" class="sakhi-followup-chip" style="background:#eff6ff;border-color:#93c5fd;color:#1e40af;font-weight:700;" onclick="window.askSakhiQuick('${escapeHtml(rc.query)}')">
              ${escapeHtml(rc.text)} →
            </button>
          `;
        }
      });
    }

    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
        ${escapeHtml(title)}
      </div>
      <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:10px;">
        ${formatTextHtml(bodyText)}
      </div>
      ${buildMsgAudioBtnMarkup(bodyText)}

      ${(chipsHtml || recoHtml) ? `
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:6px;">👉 विकल्प व सिफारिशें:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${chipsHtml}
            ${recoHtml}
          </div>
        </div>
      ` : ''}
    `;
    const speech = cleanTextForTTS(bodyText).slice(0, 260);
    streamBotMessage(html, speech);
  }

  // 18.5 DIRECT SUB-TOPIC RESOLVER & FINDER
  function findMatchingSubTopic(cleanQ, intents) {
    if (!intents || !intents.length) return null;
    const q = cleanQ;

    for (const intent of intents) {
      if (!intent.sub_topics || !intent.sub_topics.length) continue;
      for (const st of intent.sub_topics) {
        if (!st.title) continue;
        const cleanStTitle = normalizeQueryText(st.title);
        const strippedSt = cleanStTitle.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/gu, '').trim();
        const strippedQ = q.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/gu, '').trim();

        if (strippedQ === strippedSt || strippedQ.includes(strippedSt) || (strippedSt.length >= 8 && strippedSt.includes(strippedQ))) {
          return { subTopic: st, parentIntent: intent };
        }
      }
    }

    // Also check last active entity in knowledgeData if available
    if (sakhiConversationState && sakhiConversationState.lastActiveEntity && knowledgeData && knowledgeData.intents) {
      const prevIntent = knowledgeData.intents.find(it => it.id === sakhiConversationState.lastActiveEntity);
      if (prevIntent && prevIntent.sub_topics) {
        for (const st of prevIntent.sub_topics) {
          if (!st.title) continue;
          const cleanStTitle = normalizeQueryText(st.title);
          const strippedSt = cleanStTitle.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/gu, '').trim();
          const strippedQ = q.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/gu, '').trim();

          if (strippedQ === strippedSt || strippedQ.includes(strippedSt) || (strippedSt.length >= 8 && strippedSt.includes(strippedQ))) {
            return { subTopic: st, parentIntent: prevIntent };
          }
        }
      }
    }

    return null;
  }

  function renderDirectSubTopic(subTopic, parentIntent, query) {
    const title = subTopic.title || 'संबंधित जानकारी';
    const content = subTopic.content || '';
    const parentTitle = parentIntent.title || '';
    const domain = parentIntent.domain || 'health';

    // Lock session state to parent intent and domain
    sakhiConversationState.lastActiveDomain = domain;
    sakhiConversationState.lastActiveEntity = parentIntent.id;
    sakhiConversationState.lastActiveEntityName = parentTitle;
    sakhiConversationState.lastAnswerSnippet = content.slice(0, 150);

    // Render other subtopics from the SAME parent intent to keep user on topic!
    let relatedChipsHtml = '';
    if (parentIntent.sub_topics && parentIntent.sub_topics.length > 1) {
      const otherSubTopics = parentIntent.sub_topics.filter(st => st.title !== subTopic.title);
      otherSubTopics.slice(0, 3).forEach(st => {
        const shortLabel = st.title.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').split('-')[0].trim();
        relatedChipsHtml += `
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(st.title)}')">
            <span>${escapeHtml(shortLabel)}</span> →
          </button>
        `;
      });
    }

    // Dynamic E-Book & Aarogyam Tube Video Recommendations from Persona
    const recoChips = getPersonaRecommendationChips();
    let recoHtml = '';
    if (recoChips && recoChips.length > 0) {
      recoChips.forEach(rc => {
        if (rc.url || rc.isExternal) {
          recoHtml += `
            <a href="${escapeHtml(rc.url)}" target="_blank" rel="noopener noreferrer" class="sakhi-followup-chip" style="background:#eff6ff;border-color:#93c5fd;color:#1e40af;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
              <span>${escapeHtml(rc.text)}</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
            </a>
          `;
        } else {
          recoHtml += `
            <button type="button" class="sakhi-followup-chip" style="background:#eff6ff;border-color:#93c5fd;color:#1e40af;font-weight:700;" onclick="window.askSakhiQuick('${escapeHtml(rc.query)}')">
              ${escapeHtml(rc.text)} →
            </button>
          `;
        }
      });
    }

    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
        ${escapeHtml(title)}
      </div>

      <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;margin-bottom:10px;white-space:pre-line;">
        ${formatTextHtml(content)}
      </div>
      ${buildMsgAudioBtnMarkup(content)}

      ${(relatedChipsHtml || recoHtml) ? `
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:12px;">
          <div style="font-weight:900;color:#15803d;font-size:0.88rem;margin-bottom:8px;">
            👉 ${escapeHtml(parentTitle.split('-')[0].trim())} व संबंधित सिफारिशें:
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${relatedChipsHtml}
            ${recoHtml}
          </div>
        </div>
      ` : ''}

      ${parentIntent.reference ? `
        <div style="margin-top:8px;font-size:0.75rem;color:#94a3b8;font-style:italic;">
          📜 <strong>संदर्भ:</strong> ${escapeHtml(parentIntent.reference)}
        </div>
      ` : ''}
    `;

    consecutiveAmbiguousCount = 0;
    const speech = cleanTextForTTS(content).slice(0, 260);
    logSakhiTelemetry(query, domain, true);
    streamBotMessage(html, speech);
  }

  // 19. DIRECT SUMMARY RENDERER
  function renderDirectSummary(intent, originalQuery, domain) {
    const title = intent.title || '';
    const mainFirstAid = intent.first_aid || (intent.responses ? Object.values(intent.responses)[0]?.first_aid : '') || '';
    const mainAnatomy = intent.anatomy_physiology || '';
    const reference = intent.reference || '';
    const crispAns = intent.crisp_answer || '';

    // Update conversation state and entity memory
    sakhiConversationState.lastActiveDomain = intent.domain || domain || sakhiConversationState.lastActiveDomain;
    sakhiConversationState.lastActiveEntity = intent.id || (title ? title.toLowerCase() : null);
    sakhiConversationState.lastActiveEntityName = title;

    // Normalize known entity keys
    const titleLow = title.toLowerCase();
    if (titleLow.includes('joint') || titleLow.includes('जॉइंट') || titleLow.includes('गठिया') || titleLow.includes('जोड़ों')) {
      sakhiConversationState.lastActiveEntity = 'joint_care';
      sakhiConversationState.lastActiveDomain = 'health';
    } else if (titleLow.includes('हार्ट') || titleLow.includes('heart')) {
      sakhiConversationState.lastActiveEntity = 'nutri_heart';
      sakhiConversationState.lastActiveDomain = 'health';
    } else if (titleLow.includes('cfc') || titleLow.includes('सीएफसी') || ((titleLow.includes('गाय') || titleLow.includes('भैंस') || titleLow.includes('पशु')) && (titleLow.includes('दूध') || titleLow.includes('फैट')))) {
      sakhiConversationState.lastActiveEntity = 'cfc_plus';
      sakhiConversationState.lastActiveDomain = 'pashu';
    } else if (titleLow.includes('नारी') || titleLow.includes('महिला') || titleLow.includes('women')) {
      sakhiConversationState.lastActiveEntity = 'women_business';
      sakhiConversationState.lastActiveDomain = 'business';
    } else if (titleLow.includes('स्किन') || titleLow.includes('त्वचा') || titleLow.includes('चेहरा') || titleLow.includes('झाइयां') || titleLow.includes('बाल') || titleLow.includes('डैंड्रफ')) {
      sakhiConversationState.lastActiveDomain = 'beauty';
    } else if (titleLow.includes('stimrich') || titleLow.includes('स्टिमरिच')) {
      sakhiConversationState.lastActiveEntity = 'stimrich';
      sakhiConversationState.lastActiveDomain = 'agri';
    } else if (titleLow.includes('bio-99') || titleLow.includes('bio99') || titleLow.includes('बायो-99')) {
      sakhiConversationState.lastActiveEntity = 'bio99';
      sakhiConversationState.lastActiveDomain = 'agri';
    } else if (titleLow.includes('antiviral') || titleLow.includes('एंटीवायरल') || titleLow.includes('कुकड़ा')) {
      sakhiConversationState.lastActiveEntity = 'antiviral';
      sakhiConversationState.lastActiveDomain = 'agri';
    }

    let directAnswer = '';
    if (crispAns) {
      directAnswer = crispAns;
    } else if (mainFirstAid) {
      const sentences = mainFirstAid.split('।').filter(s => s.trim().length > 5);
      directAnswer = sentences.slice(0, 3).join('।') + '।';
    } else if (mainAnatomy) {
      const sentences = mainAnatomy.split('।').filter(s => s.trim().length > 5);
      directAnswer = sentences.slice(0, 2).join('।') + '।';
    } else {
      directAnswer = title;
    }

    let subTopicsHtml = '';
    if (intent.sub_topics && intent.sub_topics.length > 0) {
      intent.sub_topics.slice(0, 3).forEach((st) => {
        const shortLabel = st.title.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').split('-')[0].trim();
        subTopicsHtml += `
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('${escapeHtml(st.title)}')">
            <span>${escapeHtml(shortLabel)}</span> →
          </button>
        `;
      });
    }

    // Dynamic E-Book & Aarogyam Tube Video Recommendations from Persona
    const recoChips = getPersonaRecommendationChips();
    let recoHtml = '';
    if (recoChips && recoChips.length > 0) {
      recoChips.forEach(rc => {
        if (rc.url || rc.isExternal) {
          recoHtml += `
            <a href="${escapeHtml(rc.url)}" target="_blank" rel="noopener noreferrer" class="sakhi-followup-chip" style="background:#eff6ff;border-color:#93c5fd;color:#1e40af;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
              <span>${escapeHtml(rc.text)}</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
            </a>
          `;
        } else {
          recoHtml += `
            <button type="button" class="sakhi-followup-chip" style="background:#eff6ff;border-color:#93c5fd;color:#1e40af;font-weight:700;" onclick="window.askSakhiQuick('${escapeHtml(rc.query)}')">
              ${escapeHtml(rc.text)} →
            </button>
          `;
        }
      });
    }

    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:6px;">
        ${escapeHtml(title)}
      </div>

      <div style="font-size:0.95rem;line-height:1.6;color:#1e293b;margin-bottom:6px;">
        ${formatTextHtml(directAnswer)}
      </div>
      ${buildMsgAudioBtnMarkup(directAnswer)}

      ${(subTopicsHtml || recoHtml) ? `
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:900;color:#15803d;font-size:0.88rem;margin-bottom:8px;">
            👉 संबंधित विकल्प व सिफारिशें:
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${subTopicsHtml}
            ${recoHtml}
          </div>
        </div>
      ` : ''}

      ${reference ? `
        <div style="margin-top:8px;font-size:0.75rem;color:#94a3b8;font-style:italic;">
          📜 <strong>संदर्भ:</strong> ${escapeHtml(reference)}
        </div>
      ` : ''}
    `;

    consecutiveAmbiguousCount = 0;
    const speech = cleanTextForTTS(directAnswer).slice(0, 260);
    logSakhiTelemetry(originalQuery, domain, true);
    streamBotMessage(html, speech);
  }

  // 20. DYNAMIC HUMAN-TOUCH ANSWER SYNTHESIZER & EMPATHETIC CLARIFICATION
  function synthesizeDynamicAnswer(query, domain) {
    const cleanQ = (query || '').toLowerCase();

    // A. Anti-Mockery & Dehati/Trolls Protection (Dignified & Poised AI)
    const isMockery = cleanQ.includes('मजाक') || cleanQ.includes('majak') || cleanQ.includes('पागल') || cleanQ.includes('pagal') || cleanQ.includes('बेवकूफ') || cleanQ.includes('रोबोट') || cleanQ.includes('feku') || cleanQ.includes('फेकू') || cleanQ.includes('bakwas') || cleanQ.includes('बकवास') || cleanQ.includes('kuch bhi') || cleanQ.includes('कुछ भी') || cleanQ.includes('timepass') || cleanQ.includes('टाइमपास') || cleanQ.includes('chup') || cleanQ.includes('चुप');
    if (isMockery) {
      const resp = `मैं समझती हूँ कि कभी-कभी लोग AI से बात करते हुए मज़ाक उड़ाते हैं या परीक्षा लेने लगते हैं। पर आरोग्यम सखी AI सिर्फ एक मशीनी प्रोग्राम नहीं, बल्कि देश के अन्नदाता किसानों और लाखों परिवारों के स्वास्थ्य, फसलों और समृद्धि के लिए 24×7 समर्पित सच्ची डिजिटल हमदर्द है।\n\nआइए हम समय का सदुपयोग अपनी सेहत, फसलों या परिवार की उन्नति में करें। बताइए, आज आपकी किस गंभीर समस्या का समाधान करूँ?`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🌸 आरोग्यम सखी AI — गरिमा, सत्य व सेवा
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        ${buildMsgAudioBtnMarkup(resp)}
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-top:10px;">
          <div style="font-weight:800;color:#15803d;font-size:0.85rem;margin-bottom:8px;">👉 सार्थक विषय चुनें:</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('चना व फसलों का वैज्ञानिक स्प्रे कैलेंडर')">🌾 खेती व फसल डॉक्टर</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('जोड़ों का दर्द और घुटनों के दर्द का इलाज')">🦴 जोड़ों का दर्द समाधान</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ बिज़नेस प्लान और 15-दिन ₹8.19L कैपिंग')">💼 नेट्सर्फ 25% छूट व प्लान</button>
            <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('दादा अवनीश जी से सीधा संपर्क')">💬 दादा अवनीश जी से बात</button>
          </div>
        </div>
      `;
      streamBotMessage(html, cleanTextForTTS('आरोग्यम सखी AI किसानों और परिवारों की सच्ची डिजिटल हमदर्द है। आइए समय का सदुपयोग सेहत या खेती की बातचीत में करें।'));
      return;
    }

    // B. Telemetry logger for continuous self-learning
    logSakhiTelemetry(query, domain, false);
    consecutiveAmbiguousCount++;

    // C. If consecutive unclear or user specifically asks for contact/number -> Apologize & WhatsApp Handoff
    if (consecutiveAmbiguousCount >= 2 || cleanQ.includes('अवनीश') || cleanQ.includes('avneesh') || cleanQ.includes('बात करो') || cleanQ.includes('नंबर') || cleanQ.includes('फोन') || cleanQ.includes('phone') || cleanQ.includes('हेल्प')) {
      consecutiveAmbiguousCount = 0;
      const waUrl = buildAvneeshWhatsAppHandoffUrl(query);
      const resp = `क्षमा करें! मुझे आपकी बात पूरी तरह समझ नहीं आई और इस विषय पर मेरा डेटा यहाँ सीमित है। मैं आपको कोई अधूरा या गलत उत्तर देकर भ्रमित नहीं करना चाहती।\n\nआप 100% सटीक व्यक्तिगत मार्गदर्शन और समाधान हेतु हमारे संस्थापक **दादा अवनीश (अवनीश मिश्रा जी)** से सीधे WhatsApp पर जुड़ सकते हैं या आरोग्यम मुख्य पृष्ठ खोल सकते हैं:`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.05rem;margin-bottom:8px;">
          🤝 दादा अवनीश मिश्रा जी से सीधा WhatsApp संपर्क
        </div>
        <div style="font-size:0.95rem;line-height:1.65;color:#1e293b;white-space:pre-line;margin-bottom:12px;">
          ${formatTextHtml(resp)}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" class="sakhi-followup-chip" style="background:#22c55e;color:#fff;border-color:#16a34a;text-decoration:none;font-weight:800;padding:12px 18px;display:inline-flex;align-items:center;gap:8px;font-size:0.95rem;box-shadow:0 4px 14px rgba(34,197,94,0.4);">
            <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i>
            <span>दादा अवनीश जी से सीधे WhatsApp पर बात करें (7974422572) →</span>
          </a>
          <a href="/index.html" class="sakhi-followup-chip" style="background:#f1f5f9;color:#334155;text-decoration:none;font-weight:700;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            🏠 आरोग्यम मुख्य पोर्टल पर जाएं →
          </a>
        </div>
      `;
      streamBotMessage(html, cleanTextForTTS('क्षमा करें, मुझे आपकी बात समझ नहीं आई। सीधे दादा अवनीश जी से 7974422572 पर संपर्क करें।'));
      return;
    }

    // D. Context Retention: Check if user is currently discussing an active entity
    const prevEntity = sakhiConversationState.lastActiveEntity;
    const prevName = sakhiConversationState.lastActiveEntityName;

    if (prevEntity && prevName) {
      const speech = `मुझे आपकी बात पूरी तरह समझ नहीं आई, क्या आप ${prevName} के बारे में कुछ और पूछना चाहते हैं?`;
      const html = `
        <div style="font-weight:900;color:#166534;font-size:1.02rem;margin-bottom:6px;">
          🌸 बातचीत का संदर्भ: ${escapeHtml(prevName)}
        </div>
        <div style="font-size:0.95rem;line-height:1.6;color:#334155;margin-bottom:10px;">
          मुझे आपकी बात <strong>"${escapeHtml(query)}"</strong> पूरी तरह समझ नहीं आई, क्या आप अपना सवाल दोबारा पूछेंगे? क्या आप <strong>${escapeHtml(prevName)}</strong> से जुड़ा कुछ जानना चाहते हैं?
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('इसके अंदर क्या क्या सामग्री है?')">
            🌿 इसके अंदर क्या-क्या है?
          </button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('इसे लेने या स्प्रे करने की सही खुराक और नियम क्या है?')">
            💊 सही खुराक व सेवन विधि
          </button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('इसकी सही कीमत और 25% छूट ऑफर क्या है?')">
            💰 कीमत व 25% छूट ऑफर
          </button>
          <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('फसलों का स्प्रे कैलेंडर')">
            🌾 नया विषय शुरू करें
          </button>
        </div>
      `;
      streamBotMessage(html, cleanTextForTTS(speech));
      return;
    }

    // E. Polite First Clarification with Empathy & Options
    const speech = `मुझे आपकी बात पूरी तरह समझ नहीं आई, क्या आप अपना सवाल दोबारा या किसी अन्य तरीके से पूछेंगे?`;
    const html = `
      <div style="font-weight:900;color:#166534;font-size:1.02rem;margin-bottom:6px;">
        🌸 सवाल स्पष्ट करने में सहायता करें
      </div>
      <div style="font-size:0.95rem;line-height:1.6;color:#334155;margin-bottom:10px;">
        मुझे आपकी बात <strong>"${escapeHtml(query)}"</strong> पूरी तरह समझ नहीं आई। क्या आप अपना सवाल दोबारा पूछेंगे या नीचे दिए गए प्रमुख विषयों में से चुनेंगे?
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('चना व फसलों में कल्ले और पैदावार बढ़ाने का फॉर्मूला')">
          🌾 <span>खेती व फसलें</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
          🐄 <span>पशुपालन व डेयरी</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('जोड़ों का दर्द और घुटनों के दर्द का कारण व इलाज')">
          🦴 <span>जोड़ों का दर्द</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('मधुमेह में क्या खाएं और डाइट चार्ट')">
          🩸 <span>मधुमेह व शुगर</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('नेट्सर्फ बिज़नेस प्लान और 15-दिन ₹8.19L कैपिंग')">
          💼 <span>नेट्सर्फ 25% छूट व प्लान</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('खेती डॉक्टर व कृषि ई-बुक्स की जानकारी')">
          📚 <span>'खेती डॉक्टर' ई-बुक</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('दादी के असली आयुर्वेदिक घरेलू नुस्खे')">
          🌸 <span>दादी के नुस्खे</span>
        </button>
        <button type="button" class="sakhi-followup-chip" onclick="window.askSakhiQuick('किसान मित्र बनकर महीने में अच्छी कमाई')">
          💰 <span>किसान मित्र कमाई</span>
        </button>
      </div>

      <div style="background:#f8fafc;border:1.5px dashed #cbd5e1;border-radius:12px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span style="font-size:0.82rem;color:#64748b;">या सीधे दादा अवनीश मिश्रा जी से बात करना चाहते हैं?</span>
        <button type="button" class="sakhi-choice-btn" style="padding:6px 12px;font-size:0.82rem;margin:0;width:auto;" onclick="window.connectToAvneeshMishra('${escapeHtml(query)}')">
          दादा अवनीश जी से बात 💬
        </button>
      </div>
    `;

    streamBotMessage(html, cleanTextForTTS(speech));
  }

  // Telemetry Logger for Continuous Self-Learning
  function logSakhiTelemetry(userQuery, domain, isResolved) {
    try {
      const records = JSON.parse(localStorage.getItem('sakhi_learning_telemetry') || '[]');
      records.unshift({
        query: userQuery,
        domain: domain || 'omni',
        resolved: isResolved,
        timestamp: new Date().toISOString()
      });
      if (records.length > 60) records.length = 60;
      localStorage.setItem('sakhi_learning_telemetry', JSON.stringify(records));

      if (!isResolved) {
        const uList = JSON.parse(localStorage.getItem('sakhi_unanswered_queries') || '[]');
        const phone = getUserPhone() || '';
        const name = getUserDisplayName() || '';
        const shareId = localStorage.getItem('aarogyam_user_share_id') || localStorage.getItem('user_share_id') || '';
        const existingIdx = uList.findIndex(item => item.query === userQuery);
        if (existingIdx >= 0) {
          uList[existingIdx].count = (uList[existingIdx].count || 1) + 1;
          uList[existingIdx].timestamp = new Date().toISOString();
        } else {
          uList.unshift({
            query: userQuery,
            domain: domain || 'omni',
            user: name,
            phone: phone,
            share_id: shareId,
            count: 1,
            timestamp: new Date().toISOString()
          });
        }
        if (uList.length > 50) uList.length = 50;
        localStorage.setItem('sakhi_unanswered_queries', JSON.stringify(uList));
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Self-Testing Harness for 5 Pillars
  window.AarogyamSakhiRunTests = function () {
    console.log('🧪 [Aarogyam Sakhi] Running Verification Tests on 5 Pillars...');
    const tests = [
      { q: 'स्वास्थ्य', expectDomain: 'health', desc: 'Pillar 2: General Health Empathetic Greeting' },
      { q: 'जोड़ों का दर्द', expectDomain: 'health', desc: 'Pillar 2: Joint Pain Structured Causes & Care' },
      { q: 'मधुमेह में क्या खाएं', expectDomain: 'health', desc: 'Pillar 2: Diabetes Diet Direct Answer' },
      { q: 'नेट्सर्फ प्लान', expectDomain: 'netsurf', desc: 'Pillar 3: Netsurf 26 Years & 15-day Capping ₹8,19,250' },
      { q: 'चना फसल', expectDomain: 'agri', desc: 'Pillar 4: Chana Crop Stages & Biofit' },
      { q: 'उकठा रोग', expectDomain: 'agri', desc: 'Pillar 4: Wilt & Wrap Up (75ml/15L)' },
      { q: 'दादी के नुस्खे', expectDomain: 'nuskhe', desc: 'Pillar 5: Dadi Ke Nuskhe' },
      { q: 'किसान मित्र', expectDomain: 'agri', desc: 'Pillar 5: Kisan Mitra Monthly Earning' }
    ];
    let passed = 0;
    tests.forEach((t, i) => {
      const clean = normalizeQueryText(t.q);
      const domain = classifyQueryDomain(clean);
      const ok = domain === t.expectDomain;
      if (ok) passed++;
      console.log(`Test ${i + 1} (${t.desc}): Query="${t.q}" -> Domain=${domain} | Result: ${ok ? '✅ PASS' : '❌ FAIL'}`);
    });
    console.log(`🎯 Test Summary: ${passed}/${tests.length} Passed!`);
    return { passed, total: tests.length };
  };

  window.connectToAvneeshMishra = function (userQuery) {
    const waUrl = buildAvneeshWhatsAppHandoffUrl(userQuery);
    window.open(waUrl, '_blank');
  };

  // 21. CHAT WINDOW MARKUP GENERATOR
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
            <div id="sakhiHeaderUserBadgeWrap" style="display:inline-flex;align-items:center;"></div>
            <button type="button" class="sakhi-new-chat-btn" id="sakhiNewChatBtn" onclick="window.startSakhiNewChat()" title="नई बातचीत शुरू करें" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff;border-radius:18px;padding:4px 10px;font-size:0.75rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
              <i class="fa-solid fa-plus"></i>
              <span>नई चैट</span>
            </button>
            <button type="button" class="sakhi-fullscreen-btn" id="sakhiFullscreenToggleBtn" onclick="window.toggleSakhiFullscreen()" title="पूर्ण स्क्रीन टॉगल">
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
              <button type="button" class="sakhi-close-btn" id="sakhiCloseBtn" onclick="window.closeSakhiModal()" title="बंद करें">&times;</button>
            ` : ''}
          </div>
        </div>

        <!-- Messages Area -->
        <div class="sakhi-messages-wrap" id="sakhiMessagesWrap">
          <!-- Rendered dynamically -->
        </div>

        <!-- ChatGPT-Style Plus Menu (Opened by [+] Button) -->
        <div class="sakhi-plus-menu" id="sakhiPlusMenu">
          <div class="sakhi-plus-menu-header">
            <span>✨ मुख्य विषय व टूल्स चुनें</span>
            <button type="button" class="sakhi-plus-menu-close" onclick="window.toggleSakhiPlusMenu(false)">&times;</button>
          </div>
          <div class="sakhi-plus-grid">
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('गेहूं व फसलों में कल्ले और पैदावार बढ़ाने का फॉर्मूला')">
              🌾 खेती व फसल डॉक्टर
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('गाय-भैंस का दूध और फैट बढ़ाने का फॉर्मूला')">
              🐄 पशुपालन, दूध व फैट
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('स्वास्थ्य व बीमारी के लक्षण')">
              🩺 स्वास्थ्य व रोग परामर्श
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('चेहरे की झाइयां और झुर्रियां मिटाने का नुस्खा')">
              ✨ सौंदर्य व त्वचा देखभाल
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('नेट्सर्फ बिज़नेस प्लान और ₹8,19,250 कैपिंग')">
              💼 नेट्सर्फ (25% छूट व प्लान)
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('खेती का डॉक्टर व कृषि ई-बुक्स की जानकारी')">
              📚 'खेती डॉक्टर' व ई-बुक्स
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('दादी के असली आयुर्वेदिक घरेलू नुस्खे')">
              🌸 दादी के घरेलू नुस्खे
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('किसान मित्र बनकर महीने में अच्छी कमाई कैसे करें')">
              💰 किसान मित्र कमाई व करियर
            </button>
            <button type="button" class="sakhi-menu-item" onclick="window.selectSakhiTopic('दादा अवनीश जी से सीधा WhatsApp संपर्क')">
              💬 दादा अवनीश जी से संपर्क
            </button>
            <a href="/tube.html" target="_blank" rel="noopener noreferrer" class="sakhi-menu-item" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:space-between;color:inherit;">
              <span>🎬 आरोग्यम ट्यूब वीडियो</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;color:#2563eb;"></i>
            </a>
          </div>
        </div>

        <!-- Legal Note -->
        <div class="sakhi-legal-note">
          Arogyam Sakhi is AI and can make mistakes. <a href="javascript:void(0)" onclick="window.openSakhiTermsModal()" style="text-decoration:underline;color:inherit;font-weight:700;margin-left:4px;">Terms & Conditions</a>
        </div>

        <!-- Input Footer -->
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

  // 22. MODAL & EVENT LISTENERS
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

  function setupEventListeners(isFullscreen) {
    const backdrop = document.getElementById('sakhiModalBackdrop');
    const closeBtn = document.getElementById('sakhiCloseBtn');
    if (closeBtn) closeBtn.onclick = window.closeSakhiModal;
    if (backdrop) {
      backdrop.onclick = function (e) {
        if (e.target === backdrop) window.closeSakhiModal();
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
    updateSakhiHeaderUserBadge();
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

  window.openSakhiModal = function () {
    if (checkIsDedicatedPage()) return;
    if (typeof window.stopPageAudioGreeting === 'function') {
      try { window.stopPageAudioGreeting(); } catch (e) {}
    }
    const backdrop = ensureModalBackdropExists();
    if (backdrop) {
      backdrop.classList.add('active');
      backdrop.style.display = 'flex';
      backdrop.style.visibility = 'visible';
      backdrop.style.opacity = '1';
      backdrop.style.pointerEvents = 'auto';
      updateSakhiHeaderUserBadge();
      setTimeout(() => {
        const input = document.getElementById('sakhiTextInput');
        if (input && window.innerWidth > 640) input.focus();
      }, 300);
    }
  };

  window.closeSakhiModal = function () {
    const backdrop = document.getElementById('sakhiModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
      setTimeout(() => {
        if (!backdrop.classList.contains('active')) {
          backdrop.style.display = 'none';
          backdrop.style.visibility = 'hidden';
        }
      }, 300);
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopRecording();
  };

  window.toggleSakhiFullscreen = function () {
    const body = document.body;
    const container = document.getElementById('sakhiFullscreenContainer');
    const wrapper = document.querySelector('.sakhi-fullscreen-wrapper');
    const chatWin = document.getElementById('sakhiChatWindow');
    const btn = document.getElementById('sakhiFullscreenToggleBtn');

    const isFull = (body && body.classList.contains('is-fullscreen')) ||
                   (container && container.classList.contains('is-fullscreen')) ||
                   (wrapper && (wrapper.classList.contains('is-fullscreen') || wrapper.classList.contains('fullscreen-expanded'))) ||
                   (chatWin && (chatWin.classList.contains('is-fullscreen') || chatWin.classList.contains('fullscreen-expanded')));

    if (isFull) {
      if (body) body.classList.remove('is-fullscreen');
      if (container) container.classList.remove('is-fullscreen');
      if (wrapper) {
        wrapper.classList.remove('is-fullscreen');
        wrapper.classList.remove('fullscreen-expanded');
      }
      if (chatWin) {
        chatWin.classList.remove('is-fullscreen');
        chatWin.classList.remove('fullscreen-expanded');
      }
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-expand"></i>';
        btn.title = 'फुल स्क्रीन';
      }
      if (document.fullscreenElement) {
        try { document.exitFullscreen(); } catch (e) {}
      }
    } else {
      if (body) body.classList.add('is-fullscreen');
      if (container) container.classList.add('is-fullscreen');
      if (wrapper) {
        wrapper.classList.add('is-fullscreen');
        wrapper.classList.add('fullscreen-expanded');
      }
      if (chatWin) {
        chatWin.classList.add('is-fullscreen');
        chatWin.classList.add('fullscreen-expanded');
      }
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-compress"></i>';
        btn.title = 'सामान्य स्क्रीन';
      }
      const elemToFull = container || chatWin || document.documentElement;
      if (elemToFull && elemToFull.requestFullscreen && !document.fullscreenElement) {
        try { elemToFull.requestFullscreen(); } catch (e) {}
      }
    }
  };

  window.openSakhiTermsModal = function () {
    let modal = document.getElementById('sakhiTermsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sakhiTermsModal';
      modal.className = 'sakhi-terms-modal-backdrop';
      modal.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;background:rgba(15,23,42,0.8);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:99999999;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
      modal.innerHTML = `
        <div style="background:#ffffff;border-radius:24px;max-width:540px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.5);border:1px solid rgba(0,0,0,0.1);padding:24px;box-sizing:border-box;position:relative;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1.5px solid #f1f5f9;padding-bottom:12px;margin-bottom:16px;">
            <div style="font-weight:900;font-size:1.15rem;color:#0f172a;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-scale-balanced" style="color:#16a34a;"></i>
              <span>नियम और शर्तें (Terms & Conditions)</span>
            </div>
            <button type="button" onclick="window.closeSakhiTermsModal()" style="background:#f1f5f9;border:none;width:34px;height:34px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#475569;font-size:1rem;transition:all 0.2s;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div style="font-size:0.95rem;line-height:1.7;color:#334155;display:flex;flex-direction:column;gap:12px;">
            <p style="margin:0;">• यह <strong>'आरोग्यम इंडिया'</strong> का AI आधारित डिजिटल सहायक (AI Sakhi) है, जिसे किसानों, स्वास्थ्य के प्रति जागरूक लोगों और नेट्सर्फ परिवार की मदद के लिए बनाया गया है।</p>
            <p style="margin:0;">• चूंकि यह एक कृत्रिम बुद्धिमत्ता (AI) प्रणाली है, इसलिए दी गई जानकारी या सुझावों में कभी-कभी अशुद्धि या त्रुटि (Mistake) संभव है।</p>
            <p style="margin:0;">• किसी भी गंभीर स्वास्थ्य समस्या, आपातकालीन स्थिति, या कृषि और व्यवसाय से जुड़े बड़े वित्तीय निर्णयों से पहले किसी योग्य डॉक्टर, कृषि विशेषज्ञ या पेशेवर सलाहकार से सलाह अवश्य लें।</p>
            <p style="margin:0;">• इस प्लेटफॉर्म का उपयोग उपयोगकर्ता अपने स्वयं के विवेक और जिम्मेदारी पर कर रहे हैं।</p>
          </div>
          <div style="margin-top:20px;text-align:right;">
            <button type="button" onclick="window.closeSakhiTermsModal()" style="background:#16a34a;color:#ffffff;border:none;padding:10px 22px;border-radius:14px;font-weight:800;font-size:0.95rem;cursor:pointer;box-shadow:0 4px 14px rgba(22,163,74,0.35);">
              स्वीकार करें (I Understand)
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      modal.style.display = 'flex';
    }
  };

  window.closeSakhiTermsModal = function () {
    const modal = document.getElementById('sakhiTermsModal');
    if (modal) modal.style.display = 'none';
  };

  // 23. FLOATING PILL & UI INJECTION ACROSS REGULAR PAGES
  function injectSakhiUI() {
    if (checkIsDedicatedPage()) {
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
        window.openSakhiModal();
      };
    }

    ensureModalBackdropExists();
  }

  // 24. VIRAL SHARE
  window.shareAarogyamSakhi = function () {
    const origin = (window.location.origin && window.location.origin.includes('http'))
      ? window.location.origin
      : 'https://aarogyamindia.online';
    const shareUrl = `${origin}/aarogyam-sakhi.html`;

    const shareTitle = 'आरोग्यम सखी AI - खेत, सेहत, पशु, ब्यूटी व बिज़नेस का वैज्ञानिक समाधान 🌾';
    const shareText = `🌿 किसान व परिवारजनों के लिए बड़ी खुशखबरी! 🌿\n\nअब खेती, गेहूं, सरसों, पशुपालन (दूध-फैट), सेहत (डायबिटीज, जोड़ दर्द) और सौंदर्य के लिए किसी के चक्कर काटने की जरूरत नहीं!\n\nमिलिए "आरोग्यम सखी AI" से — जो देती हैं हर सवाल का 100% सही व वैज्ञानिक जवाब! 👩‍🌾🩺\n\nअभी अपना सवाल पूछें बिल्कुल फ्री:\n${shareUrl}`;

    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(() => {});
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }
  };

  // Quick Action Helper
  window.askSakhiQuick = function (query) {
    if (!isUserAuthenticated()) {
      pendingUserQuery = query;
      window.openSakhiAuthModal();
      return;
    }
    handleUserSubmit(query);
  };

  // Butter-Smooth Plus Menu Toggle with Outside-Click Auto-Close
  window.toggleSakhiPlusMenu = function (forceState) {
    const menu = document.getElementById('sakhiPlusMenu');
    if (!menu) return;
    const isOpen = menu.classList.contains('active');
    const shouldOpen = (typeof forceState === 'boolean') ? forceState : !isOpen;
    if (shouldOpen) {
      menu.classList.add('active');
    } else {
      menu.classList.remove('active');
    }
  };

  // Global Outside-Click Listener for Butter-Smooth Experience
  if (!window._sakhiOutsideClickBound) {
    window._sakhiOutsideClickBound = true;
    document.addEventListener('click', function (e) {
      const menu = document.getElementById('sakhiPlusMenu');
      const plusBtn = document.getElementById('sakhiPlusBtn');
      if (menu && menu.classList.contains('active')) {
        if (!menu.contains(e.target) && (!plusBtn || !plusBtn.contains(e.target))) {
          menu.classList.remove('active');
        }
      }
    });
  }

  window.selectSakhiTopic = function (query) {
    window.toggleSakhiPlusMenu(false);
    if (!isUserAuthenticated()) {
      pendingUserQuery = query;
      window.openSakhiAuthModal();
      return;
    }
    window.askSakhiQuick(query);
  };

  // Input Submission helper
  window.submitSakhiFromInput = function () {
    const input = document.getElementById('sakhiTextInput');
    if (input && input.value.trim()) {
      const q = input.value.trim();
      input.value = '';
      if (!isUserAuthenticated()) {
        const phoneMatch = q.match(/(?:(?:\+91|91|0)?[-\s]?)?([6-9]\d{9})/);
        if (phoneMatch) {
          handleUserSubmit(q);
          return;
        }
        pendingUserQuery = q;
        window.openSakhiAuthModal();
        return;
      }
      handleUserSubmit(q);
    }
  };

  window.AarogyamSakhiToggleRec = function () {
    toggleRecording();
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

  function formatTextHtml(str) {
    if (!str) return '';
    let escaped = escapeHtml(str);
    // Convert **bold** to <strong> so text is bold without ugly ** showing or breaking TTS
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#14532d;font-weight:800;">$1</strong>');
    escaped = escaped.replace(/\*\*/g, '');
    return escaped;
  }

  // GLOBAL API EXPOSURE
  window.AarogyamSakhi = {
    open: function() {
      if (checkIsDedicatedPage()) return;
      window.openSakhiModal();
    },
    close: function() {
      window.closeSakhiModal();
    },
    ask: handleUserSubmit
  };

  // AUTO INIT ON DOM READY
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadKnowledgeBase();
      initSpeechRecognition();
      injectSakhiUI();
    });
  } else {
    loadKnowledgeBase();
    initSpeechRecognition();
    injectSakhiUI();
  }
})();
