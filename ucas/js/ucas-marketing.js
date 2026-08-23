/* ==========================================================================
   UCAS MARKETING ENGINE
   Core Customer Acquisition Workflow: SEARCH → FILTER → SEND
   - Landing Page Catalog
   - Compact Area & Category-wise Filtering
   - Real-Time Matching Counter
   - Message Builder with Placeholder Personalization ({name}, {place}, {link}, {my_name})
   - Clickable Call & WhatsApp Actions on every Recipient
   - Existing Share Engine & Share ID Integration
   - 1-Click Official Deep Links (WhatsApp, Native Share, Facebook, Telegram)
   ========================================================================== */

(function (window) {
  'use strict';

  const CORE_LANDING_PAGES = [
    {
      id: 'kharif_guide',
      title: '🌾 खरीफ मास्टर गाइड 2026',
      category: 'agriculture',
      path: '/ebooks/kharif-master-guide-2026.html',
      badge: 'Bestseller',
      defaultHook: 'फसल की पैदावार 30% तक बढ़ाएं और कीटनाशक का खर्च आधा करें!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप इस सीजन में अपनी फसल (सोयाबीन/मक्का/धान) से अधिकतम उत्पादन लेना चाहते हैं?\n\nAarogyam India की प्रामाणिक "खरीफ मास्टर गाइड 2026" ई-बुक अब उपलब्ध है।\n\n👉 अभी गाइड पढ़ें:\n{link}\n\nधन्यवाद,\n{my_name}'
    },
    {
      id: 'kheti_dr',
      title: '👨‍⚕️ खेती डॉक्टर — सम्पूर्ण फसल सुरक्षा',
      category: 'agriculture',
      path: '/ebooks/kheti-dr.html',
      badge: 'Popular',
      defaultHook: 'फसल में लगने वाले हर कीट व रोग का सटीक और प्राकृतिक समाधान!',
      defaultMsg: 'नमस्ते {name} जी,\n\nफसलों में कीट, इल्ली व पीलापन की समस्या से परेशान हैं? "खेती डॉक्टर" से पाएं वैज्ञानिक व जैविक समाधान।\n\n👉 यहाँ देखें सम्पूर्ण जानकारी:\n{link}\n\nसम्पर्क: {my_name}'
    },
    {
      id: 'health_ayurveda',
      title: '❤️ सम्पूर्ण स्वास्थ्य एवं आयुर्वेद समाधान',
      category: 'healthcare',
      path: '/ebooks/health.html',
      badge: 'Wellness',
      defaultHook: 'डायबिटीज, बीपी और जोड़ों के दर्द का सुरक्षित व प्राकृतिक उपचार!',
      defaultMsg: 'नमस्ते {name} जी,\n\nस्वस्थ और रोगमुक्त जीवन के लिए Aarogyam India का विशेष स्वास्थ्य परामर्श और आयुर्वेदिक ई-बुक गाइड देखें।\n\n👉 अपनी हेल्थ गाइड अभी पढ़ें:\n{link}\n\nशुभकामनाएं,\n{my_name}'
    },
    {
      id: 'insurance_care',
      title: '🛡️ संपूर्ण सुरक्षा एवं बीमा मार्गदर्शन (Insurance)',
      category: 'insurance',
      path: '/ucas/landing.html',
      badge: 'Protection',
      defaultHook: 'अपने और परिवार के भविष्य को सुरक्षित करें सबसे भरोसेमंद बीमा योजना के साथ!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप अपने परिवार के लिए सर्वश्रेष्ठ स्वास्थ्य व जीवन बीमा योजना की तलाश में हैं?\n\n👉 मुफ्त परामर्श और योजना की जानकारी के लिए यहाँ क्लिक करें:\n{link}\n\nसादर,\n{my_name}'
    },
    {
      id: 'property_realestate',
      title: '🏢 प्रीमियम प्रॉपर्टी एवं रियल एस्टेट अवसर',
      category: 'property',
      path: '/ucas/landing.html',
      badge: 'Real Estate',
      defaultHook: 'सर्वोत्तम लोकेशन पर प्लॉट, मकान व व्यावसायिक प्रॉपर्टी में सुरक्षित निवेश करें!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप प्राइम लोकेशन पर प्रॉपर्टी निवेश या अपना सपनों का घर तलाश रहे हैं?\n\n👉 पूरी प्रॉपर्टी लिस्टिंग और विवरण यहाँ देखें:\n{link}\n\nसम्पर्क: {my_name}'
    },
    {
      id: 'netsurf_biz',
      title: '💼 NetSurf बिजनेस एवं साइड इनकम अवसर',
      category: 'netsurf',
      path: '/ebooks/netsurf.html',
      badge: 'Income Opportunity',
      defaultHook: 'घर बैठे पार्ट-टाइम काम करके ₹25,000 - ₹50,000 महीना कमाएं!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप बिना किसी बड़े निवेश के अपने खाली समय में एक बेहतरीन साइड इनकम शुरू करना चाहते हैं?\n\nNetSurf एवं Aarogyam India के साथ आत्मनिर्भर बिजनेस की शुरुआत करें।\n\n👉 पूरा बिजनेस प्लान यहाँ देखें:\n{link}\n\nसादर,\n{my_name}'
    },
    {
      id: 'webinar_live_event',
      title: '🎥 लाइव वेबिनार आमंत्रण (Live Zoom Webinar)',
      category: 'webinar',
      path: '/ucas/landing.html',
      badge: 'Live Event',
      defaultHook: 'आधुनिक कृषि, स्वास्थ्य एवं बिज़नेस अवसर पर विशेष लाइव वेबिनार में भाग लें!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप आधुनिक कृषि तकनीक, जैविक समाधान और स्वास्थ्य पर आयोजित लाइव वेबिनार में भाग लेना चाहते हैं?\n\n👉 अपनी सीट तुरंत बुक करें (रजिस्ट्रेशन के तुरंत बाद Zoom लिंक मिल जाएगा):\n{link}\n\nसादर,\n{my_name}'
    },
    {
      id: 'free_registration',
      title: '📚 फ्री रजिस्ट्रेशन एवं डिजिटल लाइब्रेरी',
      category: 'other',
      path: '/registration.html',
      badge: 'Free Access',
      defaultHook: 'Aarogyam India पर फ्री अकाउंट बनाएं और सभी डेमो बुक्स तुरंत पढ़ें!',
      defaultMsg: 'नमस्ते {name} जी,\n\nAarogyam India डिजिटल लाइब्रेरी में आपका स्वागत है। नीचे दिए गए लिंक से फ्री में रजिस्टर करें और डेमो बुक्स का लाभ उठाएं।\n\n👉 फ्री साइन-अप लिंक:\n{link}\n\nधन्यवाद,\n{my_name}'
    },
    {
      id: 'main_home',
      title: '🏡 Aarogyam India मुख्य पोर्टल',
      category: 'other',
      path: '/index.html',
      badge: 'Official',
      defaultHook: 'कृषि, स्वास्थ्य और प्राकृतिक जीवनशैली का संपूर्ण समाधान!',
      defaultMsg: 'नमस्ते {name} जी,\n\nAarogyam India के आधिकारिक पोर्टल पर आपका स्वागत है।\n\n👉 विजिट करें:\n{link}\n\n{my_name}'
    }
  ];

  let dynamicLandingPages = [];
  let selectedLandingPage = CORE_LANDING_PAGES[0];
  let allRecipientsList = [];
  let filteredContacts = [];

  async function initMarketingModule() {
    await loadMarketingTemplates();
    await loadDynamicLandingPages();
    renderLandingPageCards();
    bindMarketingEvents();
    updateMarketingEngine();
    if (window.UCAS_LANDING_BUILDER) {
      window.UCAS_LANDING_BUILDER.init();
    }
  }

  async function loadDynamicLandingPages() {
    const profileId = window.UCAS_SESSION.getUserId();
    dynamicLandingPages = [];
    if (!profileId) return;

    try {
      if (window.UCAS_DB && typeof window.UCAS_DB.getLandingPages === 'function') {
        const res = await window.UCAS_DB.getLandingPages(profileId);
        const list = res.data || [];
        // Include all user's created landing pages that are not blocked
        dynamicLandingPages = list
          .filter(p => !p.status || (p.status !== 'blocked' && p.status !== 'disabled'))
          .map(p => {
            const isWb = p.category === 'webinar' || Boolean(p.webinar_data);
            return {
              id: p.id,
              title: `${isWb ? '🎥' : '📄'} ${p.title || 'Untitled Campaign'}`,
              category: p.category || 'other',
              path: `/ucas/landing.html?id=${p.id}`,
              isCustom: true,
              badge: isWb ? 'Live Webinar' : 'Custom Page',
              defaultHook: p.message ? (p.message.slice(0, 70) + (p.message.length > 70 ? '...' : '')) : 'विशेष कैम्पेन एवं सर्वे फॉर्म भरें',
              defaultMsg: `नमस्ते {name} जी,\n\n${p.title}\n\n${p.message || ''}\n\n👉 यहाँ देखें और रजिस्टर करें:\n{link}\n\nसादर,\n{my_name}`
            };
          });
      }
    } catch (e) {
      console.warn('Error loading dynamic landing pages for marketing:', e);
    }
  }

  async function refreshLandingPages() {
    await loadDynamicLandingPages();
    renderLandingPageCards();
    updateMarketingEngine();
  }

  function getAllLandingPages() {
    return [...dynamicLandingPages, ...CORE_LANDING_PAGES];
  }

  function renderLandingPageCards() {
    const container = document.getElementById('ucas-marketing-landing-pages');
    if (!container) return;

    const allPages = getAllLandingPages();
    container.innerHTML = allPages.map(lp => {
      const isSelected = selectedLandingPage.id === lp.id;
      const isCustom = Boolean(lp.isCustom);
      return `
        <div class="ucas-card ${isSelected ? 'selected' : ''}" style="cursor:pointer;border-width:2px;padding:12px;border-radius:var(--radius-md);transition:all 0.2s ease;${isSelected ? 'border-color:var(--primary);background:var(--primary-subtle);box-shadow:0 4px 12px rgba(11,122,62,0.15);' : isCustom ? 'border-color:#3B82F6;background:rgba(59,130,246,0.04);' : 'border-color:var(--border);'}" onclick="UCAS_MARKETING.selectLandingPage('${lp.id}')">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;flex-wrap:wrap;">
            <div style="font-weight:800;font-size:0.95rem;color:var(--text-main);line-height:1.3;flex:1;min-width:140px;">${lp.title}</div>
            <span style="font-size:0.7rem;background:${isCustom ? '#DBEAFE' : 'var(--secondary-subtle)'};color:${isCustom ? '#1D4ED8' : 'var(--secondary-dark)'};padding:2px 8px;border-radius:var(--radius-full);font-weight:800;white-space:nowrap;flex-shrink:0;">${lp.badge}</span>
          </div>
          <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.4;">${lp.defaultHook}</div>
        </div>
      `;
    }).join('');
  }

  function selectLandingPage(lpId) {
    const allPages = getAllLandingPages();
    const found = allPages.find(p => p.id === lpId);
    if (!found) return;
    selectedLandingPage = found;
    renderLandingPageCards();

    // Auto-set default message
    const msgTextarea = document.getElementById('ucas-marketing-message-box');
    if (msgTextarea) {
      msgTextarea.value = selectedLandingPage.defaultMsg;
    }

    updateMarketingEngine();
  }

  let marketingCategories = [];

  async function loadMarketingTemplates() {
    try {
      const res = await fetch('/data/marketing-templates.json');
      if (res.ok) {
        const data = await res.json();
        marketingCategories = data.categories || [];
      }
    } catch (e) {
      console.warn('Could not load marketing-templates.json, using defaults', e);
    }

    if (!marketingCategories || marketingCategories.length === 0) {
      marketingCategories = [
        {
          id: 'agriculture',
          name: '🌾 कृषि एवं फसल सुरक्षा (Agriculture)',
          templates: [
            {
              id: 'ag_01',
              title: 'फसल में कीट, इल्ली व पीलापन का 100% जैविक समाधान',
              hook: '🚨 *क्या आपकी फसल में भी कीट, इल्ली या पीलापन आ रहा है?*\n\nअब रासायनिक कीटनाशकों पर लाखों खर्च करने की जरूरत नहीं! आरोग्यम इंडिया का 100% जैविक समाधान अपनाएं और पाएं 30% तक अधिक पैदावार। 🌱',
              shayari: '🌾 *मेहनत किसान की, रंग लाएगी हर बार,*\n*आरोग्यम के साथ बनेगी, खुशहाली की सरकार!* ✨',
              cta: '📲 अभी मुफ्त संपूर्ण मार्गदर्शिका देखने के लिए क्लिक करें:'
            },
            {
              id: 'ag_02',
              title: 'कम लागत में बंपर पैदावार व जैविक खाद फॉर्मूला',
              hook: '🌾 *कम लागत, ज्यादा मुनाफा! जैविक खाद से बदलें अपनी खेती का भविष्य।*\n\nमिट्टी की उर्वरा शक्ति बढ़ाएं और बिना खतरनाक रसायनों के अपनी फसल का दाना चमकदार और वजनी बनाएं। हजारों किसान इसका लाभ ले चुके हैं। 🚜',
              shayari: '🌱 *धरती माता मुस्कुराए जब जैविक खाद डले,*\n*किसान का हर एक सपना खुशहाली से फले!* 🌾',
              cta: '👉 पूरी रिपोर्ट और किसानों के लाइव अनुभव देखें:'
            }
          ]
        },
        {
          id: 'health',
          name: '🌿 स्वास्थ्य व आयुर्वेद (Health & Ayurveda)',
          templates: [
            {
              id: 'hl_01',
              title: 'डायबिटीज (शुगर) व बीपी का प्राकृतिक आयुर्वेदिक नियंत्रण',
              hook: '🩺 *क्या आप या आपके परिवार में कोई शुगर, बीपी या जोड़ों के दर्द से परेशान है?*\n\nबिना किसी साइड-इफेक्ट के प्राचीन भारतीय आयुर्वेदिक पद्धति से पाएं स्वस्थ जीवन और नई ताजगी। शरीर को अंदर से डिटॉक्स करें। 🌿',
              shayari: '🌿 *आयुर्वेद का संग मिले तो हर बीमारी भागे,*\n*स्वस्थ रहे शरीर तो नया सवेरा जागे!* ☀️',
              cta: '👉 तुरंत प्राकृतिक स्वास्थ्य डाइट चार्ट व उपाय देखें:'
            }
          ]
        },
        {
          id: 'business',
          name: '💼 रोजगार व बिजनेस (Income & Business)',
          templates: [
            {
              id: 'bs_01',
              title: 'घर बैठे मोबाइल से ₹25,000-₹50,000 कमाने का सुनहरा अवसर',
              hook: '💰 *स्मार्टफोन का सही इस्तेमाल करें और हर महीने अतिरिक्त आय बनाएं!*\n\nआरोग्यम डिजिटल कम्युनिटी से जुड़कर पार्ट-टाइम या फुल-टाइम काम करें। बिना किसी रिस्क के सीखें डिजिटल मार्केटिंग।',
              shayari: '🚀 *मंजिलें उन्हीं को मिलती हैं जिनके सपनों में जान होती है,*\n*पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है!* 🌈',
              cta: '👉 फ्री ट्रेनिंग और ज़ूम वेबिनार में भाग लेने के लिए यहाँ रजिस्टर करें:'
            }
          ]
        },
        {
          id: 'product',
          name: '🛒 प्रोडक्ट व ऑफर्स (Products & Offers)',
          templates: [
            {
              id: 'pr_01',
              title: 'विशेष छूट ऑफर - सीधे घर तक डिलीवरी',
              hook: '🎁 *धमाकेदार ऑफर! प्रीमियम क्वालिटी प्रोडक्ट पर भारी छूट!*\n\nअसली और प्रमाणित उत्पाद सीधे आपके घर तक। ऑफर केवल सीमित समय तक मान्य है। 📦',
              shayari: '💎 *गुणवत्ता में नंबर वन, कीमत में सबसे खास,*\n*आरोग्यम उत्पाद लाएं, खुशियों का अहसास!* ✨',
              cta: '🛍️ अभी ऑफर प्राइस देखें और ऑर्डर करें:'
            }
          ]
        }
      ];
    }

    populateHookCategoryDropdown();
  }

  function populateHookCategoryDropdown() {
    const catSelect = document.getElementById('ucas_hook_category_select');
    if (!catSelect) return;
    catSelect.innerHTML = marketingCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    if (marketingCategories.length > 0) {
      onHookCategoryChange(marketingCategories[0].id);
    }
  }

  function onHookCategoryChange(categoryId) {
    const templateSelect = document.getElementById('ucas_hook_template_select');
    if (!templateSelect) return;

    const cat = marketingCategories.find(c => c.id === categoryId);
    if (!cat || !cat.templates || cat.templates.length === 0) {
      templateSelect.innerHTML = '<option value="">कोई टेम्पलेट उपलब्ध नहीं</option>';
      return;
    }

    templateSelect.innerHTML = cat.templates.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
    onHookTemplateSelect(cat.templates[0].id);
  }

  function onHookTemplateSelect(templateId) {
    if (!templateId) return;
    let found = null;
    for (const cat of marketingCategories) {
      const t = (cat.templates || []).find(item => item.id === templateId);
      if (t) {
        found = t;
        break;
      }
    }
    if (!found) return;

    const msgBox = document.getElementById('ucas-marketing-message-box');
    if (!msgBox) return;

    const fullMsg = `नमस्ते {name} जी,\n\n${found.hook}\n\n${found.cta}\n{link}\n\n${found.shayari}\n\nसादर,\n{my_name}`;
    msgBox.value = fullMsg;
    updateLiveMessagePreview();
  }

  function bindMarketingEvents() {
    const areaFilter = document.getElementById('mkt_filter_compact_area');
    const catFilter = document.getElementById('mkt_filter_compact_category');
    const msgTextarea = document.getElementById('ucas-marketing-message-box');

    const updateTrigger = () => filterTargetAudience();

    areaFilter?.addEventListener('change', updateTrigger);
    catFilter?.addEventListener('change', updateTrigger);
    msgTextarea?.addEventListener('input', updateLiveMessagePreview);
  }

  async function updateMarketingEngine() {
    await populateRecipientsAndFilterOptions();
    filterTargetAudience();
    updateReferralLink();
    updateLiveMessagePreview();
  }

  function normalizeIndianMobile(rawTel) {
    if (!rawTel) return null;
    let digits = String(rawTel).replace(/\D/g, '').trim();
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    else if (digits.length === 13 && digits.startsWith('091')) digits = digits.slice(3);
    else if (digits.length === 14 && digits.startsWith('0091')) digits = digits.slice(4);
    if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return digits;
    return null;
  }

  // ==========================================
  // COMPACT FILTER & RECIPIENT INGESTION
  // ==========================================

  async function populateRecipientsAndFilterOptions() {
    const profileId = window.UCAS_SESSION.getUserId();
    let surveys = [];
    let phonebook = [];

    try {
      const [surveysRes, phonebookRes] = await Promise.all([
        window.UCAS_DB.getSurveys(profileId),
        window.UCAS_DB.getPhonebook(profileId)
      ]);
      surveys = surveysRes.data || [];
      phonebook = phonebookRes.data || [];
    } catch (e) {
      surveys = window.UCAS_SURVEY ? window.UCAS_SURVEY.getSurveysList() : [];
      phonebook = window.UCAS_PHONEBOOK ? window.UCAS_PHONEBOOK.getContactsList() : [];
    }

    const combined = [];
    const seenMobiles = new Set();
    const uniqueAreas = new Set();

    // 1. Ingest Surveys
    surveys.forEach(s => {
      if (!s || !s.mobile || seenMobiles.has(s.mobile)) return;
      seenMobiles.add(s.mobile);

      const cats = Array.isArray(s.selected_categories) ? s.selected_categories : [s.selected_categories || 'General'];
      const area = (s.village || s.district || s.state || '').trim();
      if (area) uniqueAreas.add(area);

      combined.push({
        name: s.name || 'Survey Contact',
        mobile: s.mobile,
        place: area,
        categories: cats,
        categoryDisplay: cats.join(', '),
        source: 'Survey'
      });
    });

    // 2. Ingest Phonebook
    phonebook.forEach(p => {
      if (!p || !p.mobile || seenMobiles.has(p.mobile)) return;
      seenMobiles.add(p.mobile);

      const area = (p.place || '').trim();
      if (area) uniqueAreas.add(area);

      combined.push({
        name: p.name || 'Phonebook Contact',
        mobile: p.mobile,
        place: area,
        categories: ['phonebook'],
        categoryDisplay: 'Phonebook',
        source: p.source || 'Phonebook'
      });
    });

    allRecipientsList = combined;

    // Populate Area dropdown
    const areaSelect = document.getElementById('mkt_filter_compact_area');
    if (areaSelect) {
      const currentArea = areaSelect.value || 'all';
      const sortedAreas = Array.from(uniqueAreas).sort();
      areaSelect.innerHTML = `<option value="all">📍 सभी स्थान (All Areas)</option>` +
        sortedAreas.map(a => `<option value="${escapeHtml(a.toLowerCase())}">${escapeHtml(a)}</option>`).join('');
      areaSelect.value = currentArea;
    }

    // Populate Category dropdown dynamically
    const catSelect = document.getElementById('mkt_filter_compact_category');
    if (catSelect) {
      const curCat = catSelect.value || 'all';
      let lpCats = [
        { id: 'agriculture', name: '🌾 Agriculture (कृषि)' },
        { id: 'healthcare', name: '❤️ Health Care (स्वास्थ्य)' },
        { id: 'cattlecare', name: '🐄 Cattle Care (पशुपालन)' },
        { id: 'beautycare', name: '💄 Beauty Care (सौंदर्य)' },
        { id: 'haircare', name: '💇 Hair Care (केश)' },
        { id: 'netsurf', name: '💼 NetSurf (बिजनेस)' },
        { id: 'phonebook', name: '📱 Phonebook Contacts' },
        { id: 'other', name: '➕ अन्य (Other)' }
      ];
      try {
        const stored = localStorage.getItem('AAROGYAM_LP_CATEGORIES');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            lpCats = [...parsed, { id: 'phonebook', name: '📱 Phonebook Contacts' }];
          }
        }
      } catch (e) {}

      catSelect.innerHTML = `<option value="all">🏷️ सभी कैटेगरी (All Categories)</option>` +
        lpCats.map(c => `<option value="${escapeHtml(c.id.toLowerCase())}">${escapeHtml(c.name)}</option>`).join('');
      catSelect.value = curCat;
    }
  }

  function filterTargetAudience() {
    const areaVal = (document.getElementById('mkt_filter_compact_area')?.value || 'all').toLowerCase();
    const catVal = (document.getElementById('mkt_filter_compact_category')?.value || 'all').toLowerCase();

    filteredContacts = allRecipientsList.filter(contact => {
      // 1. Area Match
      let matchArea = true;
      if (areaVal !== 'all') {
        matchArea = (contact.place || '').toLowerCase().includes(areaVal);
      }

      // 2. Category Match
      let matchCat = true;
      if (catVal !== 'all') {
        matchCat = contact.categories.some(c => c && c.toLowerCase().includes(catVal));
      }

      return matchArea && matchCat;
    });

    renderFilteredRecipients(filteredContacts);
    updateLiveMessagePreview();
  }

  function renderFilteredRecipients(list) {
    const counterEl = document.getElementById('ucas-marketing-match-counter');
    const container = document.getElementById('ucas-marketing-recipients-list');

    if (counterEl) {
      counterEl.textContent = `🎯 ${list.length} Matching Contacts Found`;
    }

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;">
          कोई मेल खाने वाला संपर्क नहीं मिला। कृपया ऊपर से फ़िल्टर बदलें।
        </div>
      `;
      return;
    }

    const previewList = list.slice(0, 25);
    container.innerHTML = previewList.map((contact, idx) => {
      const cleanMob = normalizeIndianMobile(contact.mobile);
      const callLink = cleanMob ? `tel:${cleanMob}` : '#';

      return `
        <div class="ucas-recipient-item">
          <div>
            <div style="font-weight:700;font-size:0.92rem;color:var(--text-main);">${contact.name}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);display:flex;align-items:center;gap:8px;margin-top:2px;flex-wrap:wrap;">
              <a href="${callLink}" style="color:var(--primary-dark);font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:3px;" title="कॉल करें">
                <i class="fa-solid fa-phone" style="color:var(--primary);"></i> <code>${contact.mobile}</code>
              </a>
              ${contact.place ? `<span>• 📍 ${contact.place}</span>` : ''}
              <span>• 🏷️ ${contact.categoryDisplay}</span>
            </div>
          </div>
          <div class="ucas-recipient-actions">
            <a href="${callLink}" class="ucas-btn ucas-btn-sm ucas-btn-outline" style="padding:5px 12px;" title="कॉल करें">
              <i class="fa-solid fa-phone" style="color:var(--primary);"></i> Call
            </a>
            <button class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" onclick="UCAS_MARKETING.sendToOne('${contact.mobile}', '${encodeURIComponent(contact.name)}', '${encodeURIComponent(contact.place)}')" title="व्यक्तिगत WhatsApp भेजें" style="padding:5px 12px;">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp भेजें
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (list.length > 25) {
      container.innerHTML += `
        <div style="text-align:center;font-size:0.8rem;color:var(--text-muted);padding:8px;background:#F1F5F9;border-radius:var(--radius-md);">
          ... और कुल <strong>${list.length}</strong> में से शेष संपर्क
        </div>
      `;
    }
  }

  // ==========================================
  // REFERRAL LINK BUILDER (Existing Share Engine)
  // ==========================================

  function getGeneratedReferralLink() {
    const origin = window.location.origin || 'https://aarogyamindia.in';
    const shareId = window.UCAS_SESSION.getShareId();
    const landingPath = selectedLandingPage.path;
    const url = new URL(landingPath, origin);
    url.searchParams.set('share_id', shareId);
    url.searchParams.set('src', `ucas_mkt:${selectedLandingPage.id}`);
    return url.toString();
  }

  function updateReferralLink() {
    const linkInput = document.getElementById('ucas-marketing-referral-link');
    if (linkInput) {
      linkInput.value = getGeneratedReferralLink();
    }
  }

  function copyReferralLink() {
    const link = getGeneratedReferralLink();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        window.UCAS_APP.showToast('✅ रेफरल लिंक कॉपी हो गया!', 'success');
      });
    } else {
      window.UCAS_APP.showToast('लिंक: ' + link, 'info');
    }
  }

  // ==========================================
  // MESSAGE BUILDER & LIVE PREVIEW
  // ==========================================

  function buildPersonalizedMessage(name = '{name}', place = '{place}') {
    const rawTemplate = document.getElementById('ucas-marketing-message-box')?.value || selectedLandingPage.defaultMsg;
    const shareLink = getGeneratedReferralLink();
    const myName = window.UCAS_SESSION.getName();

    let msg = rawTemplate
      .replace(/{name}/g, name)
      .replace(/{place}/g, place)
      .replace(/{link}/g, shareLink)
      .replace(/{my_name}/g, myName)
      .replace(/{category}/g, selectedLandingPage.title);

    return msg;
  }

  function updateLiveMessagePreview() {
    const previewBox = document.getElementById('ucas-marketing-preview-bubble');
    if (!previewBox) return;

    const sampleContact = filteredContacts[0] || { name: 'राजेश पटेल', place: 'रीवा' };
    const personalized = buildPersonalizedMessage(sampleContact.name, sampleContact.place);

    previewBox.innerHTML = personalized.replace(/\n/g, '<br>');
  }

  // ==========================================
  // SEND & SHARE ACTIONS WITH UPGRADE PROMPT
  // ==========================================

  function showUpgradeModal(featureName = 'यह फीचर') {
    let modal = document.getElementById('ucas-upgrade-pro-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ucas-upgrade-pro-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 20px; max-width: 440px; width: 100%; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 2px solid #F59E0B; text-align: center;">
        <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 24px 20px 20px; color: #fff; position: relative;">
          <button type="button" onclick="document.getElementById('ucas-upgrade-pro-modal').style.display='none'" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.15); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1.1rem;">&times;</button>
          <div style="font-size: 2.2rem; margin-bottom: 6px;">👑</div>
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #FBBF24;">Aarogyam Pro / Active सदस्यता</h3>
          <p style="margin: 4px 0 0 0; font-size: 0.82rem; color: #94A3B8;">${featureName} केवल एक्टिव मेंबर्स के लिए उपलब्ध है</p>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 0.86rem; color: #475569; line-height: 1.45; margin-bottom: 18px;">
            इस फीचर को अनलॉक करने के लिए Aarogyam Pro VIP सदस्यता लें या कोई भी एक ई-बुक खरीदकर तुरंत अपना खाता एक्टिवेट करें।
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a href="/subscription.html" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #fff; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 800; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              👑 Aarogyam Pro VIP बनें (₹999 / वर्ष)
            </a>
            <a href="/ebooks/checkout.html?product=kheti-dr&amount=99&title=Kheti%20Doctor%20Book" style="background: #FEF3C7; border: 1.5px solid #F59E0B; color: #92400E; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 800; font-size: 0.88rem;">
              📖 ₹99 में ई-बुक खरीदकर एक्टिवेट करें
            </a>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }

  async function exportContactsCSV() {
    const profileId = window.UCAS_SESSION.getUserId();
    const perms = await window.UCAS_DB.getUserMediaPermissions(profileId);

    if (!perms.export_csv) {
      showUpgradeModal('CSV डेटा एक्सपोर्ट');
      return;
    }

    const list = filteredContacts.length > 0 ? filteredContacts : allRecipientsList;
    if (list.length === 0) {
      window.UCAS_APP.showToast('एक्सपोर्ट करने के लिए कोई संपर्क नहीं है।', 'warning');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Name,Mobile,Place,Categories,Source\r\n';

    list.forEach(c => {
      const row = [
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.mobile || '').replace(/"/g, '""')}"`,
        `"${(c.place || '').replace(/"/g, '""')}"`,
        `"${(c.categoryDisplay || '').replace(/"/g, '""')}"`,
        `"${(c.source || '').replace(/"/g, '""')}"`
      ].join(',');
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aarogyam_Contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.UCAS_APP.showToast(`✅ ${list.length} संपर्कों का CSV सफलतापूर्वक डाउनलोड हो गया!`, 'success');
  }

  async function sendToOne(rawMobile, encodedName, encodedPlace) {
    const profileId = window.UCAS_SESSION.getUserId();
    const perms = await window.UCAS_DB.getUserMediaPermissions(profileId);
    if (!perms.isActive) {
      showUpgradeModal('1-to-1 WhatsApp ब्रॉडकास्ट');
      return;
    }

    const cleanMobile = normalizeIndianMobile(rawMobile);
    if (!cleanMobile) {
      window.UCAS_APP.showToast('अमान्य मोबाइल नंबर।', 'error');
      return;
    }

    const name = decodeURIComponent(encodedName);
    const place = decodeURIComponent(encodedPlace);
    const msg = buildPersonalizedMessage(name, place);

    // Track attribution event via existing engine
    if (typeof trackAttributionEvent === 'function') {
      trackAttributionEvent({
        event_type: 'share',
        share_channel: 'whatsapp_marketing',
        asset_id: selectedLandingPage.path,
        asset_title: selectedLandingPage.title
      });
    }

    window.open(`https://wa.me/91${cleanMobile}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  function shareNative() {
    const link = getGeneratedReferralLink();
    const text = buildPersonalizedMessage('साथी', '');

    if (navigator.share) {
      navigator.share({
        title: selectedLandingPage.title,
        text: text,
        url: link
      }).catch(err => console.log('Native share closed', err));
    } else {
      copyReferralLink();
    }
  }

  function shareWhatsAppBroadcast() {
    const text = buildPersonalizedMessage('साथी', '');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareFacebook() {
    const link = getGeneratedReferralLink();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
  }

  function shareTelegram() {
    const link = getGeneratedReferralLink();
    const text = buildPersonalizedMessage('साथी', '');
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  window.UCAS_MARKETING = {
    init: initMarketingModule,
    refreshLandingPages,
    selectLandingPage,
    updateMarketingEngine,
    onHookCategoryChange,
    onHookTemplateSelect,
    sendToOne,
    shareNative,
    shareWhatsAppBroadcast,
    shareFacebook,
    shareTelegram,
    copyReferralLink,
    exportContactsCSV,
    showUpgradeModal
  };

  console.log('✅ UCAS Marketing Engine (with Hook Templates & Touchy Shayari Engine) Ready.');
})(window);
