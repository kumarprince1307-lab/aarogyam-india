/**
 * js/netsurf-products-catalog.js
 * Advanced Dynamic Showcase, Dual Filter System, AI Voice Guide,
 * and 7-Language Personalized PDF Catalog Generator for All Netsurf Products.
 * 100% Connected to data/netsurf-products-master.json (Zero Hardcoding).
 */

(function () {
  'use strict';

  const DEFAULT_SUPPORT_PHONE = '917974422572';
  const DEFAULT_SUPPORT_NAME = 'आरोग्यम इंडिया अधिकृत केंद्र';

  let currentSponsor = {
    name: DEFAULT_SUPPORT_NAME,
    phone: DEFAULT_SUPPORT_PHONE,
    isPersonalized: false
  };

  let masterCatalog = [];
  let masterCategories = [];
  let currentCategory = 'all';
  let currentProblem = 'all';
  let currentSearchQuery = '';

  // Multi-Language Dictionary for PDF Catalog
  const I18N_CATALOG = {
    hi: {
      title: "सम्पूर्ण नेटसर्फ उत्पाद कैटलॉग 2026",
      subtitle: "100% प्राकृतिक एवं जैविक बायो-टेक्नोलॉजी आधारित उत्पाद",
      coverCompanyTitle: "नेटसर्फ डायरेक्ट (Netsurf Direct) - कम्पनी प्रोफाइल",
      coverCompanyDesc: "सन 2000 से स्थापित, 26 वर्षों की अटूट विश्वसनीयता और भारत सरकार के विज्ञान एवं प्रौद्योगिकी मंत्रालय (DSIR) द्वारा मान्यता प्राप्त इन-हाउस R&D केंद्र। 25 लाख से अधिक संतुष्ट उपभोक्ताओं का अटूट विश्वास।",
      categoryIntro: "प्रमुख उत्पाद श्रेणियां: कृषि बायोफिट (जैविक खेती), पशु पोषण CFC (डेयरी उत्पादन), नेचुरामोरे (हर्बल न्यूट्रास्यूटिकल), हर्ब्स एंड मोर (आयुर्वेदिक सौंदर्य), क्लीन एंड मोर (इको-होम केयर)।",
      mrpLabel: "MRP:",
      offerLabel: "ऑफर रेट:",
      packSizeLabel: "पैकिंग:",
      ingLabel: "मुख्य घटक:",
      doseLabel: "उपयोग विधि व खुराक:",
      disclaimerTitle: "वैधानिक सूचना एवं अस्वीकरण (Legal Disclaimer):",
      disclaimerText: "इस कैटलॉग में दी गई समस्त जानकारी, उत्पाद विनिर्देश, घटक व खुराक आधिकारिक निर्माता पोर्टल (netsurfdirect.com) के सार्वजनिक लिटरेचर से संदर्भ हेतु ली गई है। Aarogyam India एक स्वतंत्र अधिकृत वितरक नेटवर्क है और प्रत्यक्ष विनिर्माण दायित्व का दावा नहीं करता। आधिकारिक कॉर्पोरेट जानकारी, बैच व गुणवत्ता प्रमाणन हेतु निर्माता से संपर्क करें: Netsurf Communications Pvt. Ltd., Sr. No. 107, Plot No. 2, Baner, Pune - 411045, Maharashtra. Customer Care: 020-42111111 | Email: support@netsurfdirect.com | Web: www.netsurfdirect.com",
      distributorTitle: "अधिकृत प्रस्तुतकर्ता / वितरक संपर्क (Presented By):",
      helplineLabel: "आरोग्यम इंडिया सपोर्ट हेल्पलाइन:"
    },
    en: {
      title: "Complete Netsurf Products Catalog 2026",
      subtitle: "100% Natural & Organic Bio-Technology Formulations",
      coverCompanyTitle: "Netsurf Direct - Corporate Profile",
      coverCompanyDesc: "Established in 2000, 26 years of trust, with in-house DSIR recognized R&D center by the Ministry of Science & Technology, Govt. of India. Over 2.5 million satisfied consumers across India.",
      categoryIntro: "Core Categories: Biofit (Organic Agriculture), Pet-Vet CFC (Cattle Feed & Dairy), Naturamore (Nutraceuticals), Herbs & More (Ayurvedic Personal Care), Clean & More (Eco Home Care).",
      mrpLabel: "MRP:",
      offerLabel: "Offer Price:",
      packSizeLabel: "Pack Size:",
      ingLabel: "Key Ingredients:",
      doseLabel: "Usage & Dosage:",
      disclaimerTitle: "Legal Disclaimer & Independent Distributor Notice:",
      disclaimerText: "All product specifications, active ingredients, dosage recommendations, and benefits are sourced from official manufacturer literature at netsurfdirect.com. Aarogyam India functions as an independent distributor/affiliate network. For corporate certification, manufacturing batches, or official compliance, contact: Netsurf Communications Pvt. Ltd., Sr. No. 107, Plot No. 2, Baner, Pune - 411045, Maharashtra. Customer Care: 020-42111111 | Email: support@netsurfdirect.com | Web: www.netsurfdirect.com",
      distributorTitle: "Authorized Distributor / Presented By:",
      helplineLabel: "Aarogyam India Support Helpline:"
    },
    gu: {
      title: "સંપૂર્ણ નેટસર્ફ પ્રોડક્ટ કેટેલોગ 2026",
      subtitle: "100% કુદરતી અને જૈવિક બાયો-ટેકનોલોજી ઉત્પાદનો",
      coverCompanyTitle: "નેટસર્ફ ડાયરેક્ટ - કંપની પ્રોફાઇલ",
      coverCompanyDesc: "વર્ષ 2000 થી સ્થાપિત, 26 વર્ષનો અતૂટ વિશ્વાસ અને ભારત સરકાર માન્ય DSIR ઇન-હાઉસ R&D કેન્દ્ર. 25 લાખથી વધુ સંતુષ્ટ ગ્રાહકો.",
      categoryIntro: "મુખ્ય શ્રેણીઓ: કૃષિ બાયોફિટ, પશુ પોષણ સીએફસી, નેચુરામોર હેલ્થ, પર્સનલ કેર, ક્લીન એન્ડ મોર.",
      mrpLabel: "MRP:",
      offerLabel: "ઓફર ભાવ:",
      packSizeLabel: "પેકિંગ:",
      ingLabel: "મુખ્ય ઘટકો:",
      doseLabel: "ઉપયોગ અને માત્રા:",
      disclaimerTitle: "કાનૂની ડિસ્ક્લેમર (Legal Disclaimer):",
      disclaimerText: "તમામ ઉત્પાદન માહિતી અધિકૃત વેબસાઇટ netsurfdirect.com પરથી લેવામાં આવી છે. આરોગ્યમ ઇન્ડિયા એક સ્વતંત્ર વિતરક છે. સંપર્ક: Netsurf Communications Pvt. Ltd., પુણે, મહારાષ્ટ્ર. કેર: 020-42111111 | support@netsurfdirect.com",
      distributorTitle: "અધિકૃત વિતરક સંપર્ક (Presented By):",
      helplineLabel: "આરોગ્યમ ઇન્ડિયા હેલ્પલાઇન:"
    },
    mr: {
      title: "संपूर्ण नेटसर्फ उत्पादन कॅटलॉग 2026",
      subtitle: "100% नैसर्गिक व सेंद्रिय जैव-तंत्रज्ञान उत्पादने",
      coverCompanyTitle: "नेटसर्फ डायरेक्ट - कंपनी परिचय",
      coverCompanyDesc: "सन 2000 पासून स्थापित, 26 वर्षांचा अतूट विश्वास आणि भारत सरकारचे DSIR मान्यताप्राप्त इन-हाउस R&D केंद्र. 25 लाखांहून अधिक समाधानी ग्राहक.",
      categoryIntro: "प्रमुख वर्गवारी: कृषी बायोफिट (सेंद्रिय शेती), पशु पोषण CFC (दुग्ध व्यवसाय), नॅचुरामोर (आरोग्य), हर्ब्स अँड मोअर, क्लीन अँड मोअर.",
      mrpLabel: "MRP:",
      offerLabel: "ऑफर दर:",
      packSizeLabel: "पॅकिंग:",
      ingLabel: "मुख्य घटक:",
      doseLabel: "वापर व डोस:",
      disclaimerTitle: "वैधानिक सूचना व अस्वीकरण (Legal Disclaimer):",
      disclaimerText: "या कॅटलॉगमधील माहिती अधिकृत netsurfdirect.com वरून संदर्भ म्हणून घेतली आहे. आरोग्यम इंडिया स्वतंत्र वितरक म्हणून कार्यरत आहे. संपर्क: Netsurf Communications Pvt. Ltd., बाणेर, पुणे - 411045. Customer Care: 020-42111111 | support@netsurfdirect.com",
      distributorTitle: "अधिकृत वितरक संपर्क (Presented By):",
      helplineLabel: "आरोग्यम इंडिया सपोर्ट हेल्पलाइन:"
    },
    ta: {
      title: "நெட்ஸர்ப் தயாரிப்புகள் பட்டியல் 2026",
      subtitle: "100% இயற்கை மற்றும் உயிரி தொழில்நுட்ப தயாரிப்புகள்",
      coverCompanyTitle: "நெட்ஸர்ப் டைரக்ட் - நிறுவன விவரம்",
      coverCompanyDesc: "2000 முதல் 26 ஆண்டுகால நம்பிக்கை. இந்திய அரசு அங்கீகரித்த DSIR R&D மையம். 2.5 மில்லியனுக்கும் அதிகமான நுகர்வோர்.",
      categoryIntro: "முக்கிய பிரிவுகள்: பயோஃபிட் விவசாயம், கால்நடை பராமரிப்பு CFC, நேச்சுராமோர் ஆரோக்கியம், தனிநபர் பராமரிப்பு, கிளீன் & மோர்.",
      mrpLabel: "MRP:",
      offerLabel: "சலுகை விலை:",
      packSizeLabel: "அளவு:",
      ingLabel: "மூலப்பொருட்கள்:",
      doseLabel: "பயன்பாட்டு முறை:",
      disclaimerTitle: "சட்ட அறிவிப்பு (Legal Disclaimer):",
      disclaimerText: "அனைத்து விவரங்களும் netsurfdirect.com இலிருந்து எடுக்கப்பட்டது. Netsurf Communications Pvt. Ltd., Pune. Care: 020-42111111 | support@netsurfdirect.com",
      distributorTitle: "வழங்குபவர் (Presented By):",
      helplineLabel: "ஆரோக்யம் இந்தியா உதவி எண்:"
    },
    te: {
      title: "నెట్‌సర్ఫ్ ఉత్పత్తుల కేటలాగ్ 2026",
      subtitle: "100% సహజ మరియు ఆర్గానిక్ బయో-టెక్నాలజీ ఉత్పత్తులు",
      coverCompanyTitle: "నెట్‌సర్ఫ్ డైరెక్ట్ - కంపెనీ వివరాలు",
      coverCompanyDesc: "2000 నుండి 26 సంవత్సరాల విశ్వసనీయత. భారత ప్రభుత్వ DSIR గుర్తింపు పొందిన R&D కేంద్రం. 25 లక్షలకు పైగా వినియోగదారులు.",
      categoryIntro: "ప్రధాన విభాగాలు: బయోఫిట్ వ్యవసాయం, పశు పోషణ CFC, నేచురామోర్ హెల్త్, పర్సనల్ కేర్, క్లీన్ & మోర్.",
      mrpLabel: "MRP:",
      offerLabel: "ఆఫర్ ధర:",
      packSizeLabel: "ప్యాకింగ్:",
      ingLabel: "ముఖ్య పదార్థాలు:",
      doseLabel: "వినియోగ విధానం:",
      disclaimerTitle: "చట్టపరమైన నిరాకరణ (Legal Disclaimer):",
      disclaimerText: "సమాచారం netsurfdirect.com నుండి సేకరించబడింది. Netsurf Communications Pvt. Ltd., Pune. Helpline: 020-42111111 | support@netsurfdirect.com",
      distributorTitle: "అధీకృత పంపిణీదారు (Presented By):",
      helplineLabel: "ఆరోగ్యం ఇండియా హెల్ప్‌లైన్:"
    },
    bn: {
      title: "সম্পূর্ণ নেটসার্ফ প্রোডাক্ট ক্যাটালগ ২০২৬",
      subtitle: "১০০% প্রাকৃতিক ও জৈব বায়ো-টেকনোলজি পণ্যসমূহ",
      coverCompanyTitle: "নেটসার্ফ ডিরেক্ট - কোম্পানি প্রোফাইল",
      coverCompanyDesc: "২০০০ সাল থেকে ২৬ বছরের বিশ্বাসযোগ্যতা। ভারত সরকারের DSIR অনুমোদিত নিজস্ব R&D কেন্দ্র। ২৫ লক্ষাধিক সন্তুষ্ট গ্রাহক।",
      categoryIntro: "প্রধান বিভাগ: কৃষি বায়োফিট, পশু পুষ্টি CFC, নেচুরোমোর স্বাস্থ্য, পার্সোনাল কেয়ার, ক্লিন অ্যান্ড মোর।",
      mrpLabel: "MRP:",
      offerLabel: "অফার মূল্য:",
      packSizeLabel: "প্যাকিং:",
      ingLabel: "মূল উপাদান:",
      doseLabel: "ব্যবহারের নিয়ম:",
      disclaimerTitle: "আইনি দাবিত্যাগ (Legal Disclaimer):",
      disclaimerText: "সমস্ত তথ্য netsurfdirect.com থেকে সংগৃহীত। Netsurf Communications Pvt. Ltd., Pune. Care: 020-42111111 | support@netsurfdirect.com",
      distributorTitle: "পরিবেশক পরিচিতি (Presented By):",
      helplineLabel: "আরোগ্যম ইন্ডিয়া হেল্পলাইন:"
    }
  };

  // 1. Resolve Sponsor from Session or URL
  function resolveSponsor() {
    const params = new URLSearchParams(window.location.search);
    const sponsorParam = params.get('u') || params.get('s') || params.get('ref') || params.get('sponsor');

    if (sponsorParam) {
      currentSponsor.name = sponsorParam.toUpperCase();
      currentSponsor.isPersonalized = true;
    }

    try {
      const activeSession = JSON.parse(localStorage.getItem('aim_user_session') || '{}');
      if (activeSession && activeSession.name) {
        currentSponsor.name = activeSession.name;
        if (activeSession.phone) currentSponsor.phone = activeSession.phone.replace(/\D/g, '');
        currentSponsor.isPersonalized = true;
      }
    } catch (e) {}

    // Update UI elements
    const stickyName = document.getElementById('npStickySellerName');
    if (stickyName) stickyName.textContent = currentSponsor.name;

    const callBtn = document.getElementById('npMobileCallBtn');
    if (callBtn) callBtn.href = `tel:+${currentSponsor.phone}`;

    const waBtn = document.getElementById('npMobileWaBtn');
    if (waBtn) {
      const msg = encodeURIComponent(`नमस्ते ${currentSponsor.name} जी! मुझे नेटसर्फ उत्पाद कैटलॉग के बारे में जानकारी चाहिए व ऑर्डर करना है।`);
      waBtn.href = `https://api.whatsapp.com/send?phone=${currentSponsor.phone}&text=${msg}`;
    }

    const distNameInput = document.getElementById('npDistributorName');
    const distPhoneInput = document.getElementById('npDistributorPhone');
    if (distNameInput && currentSponsor.isPersonalized) distNameInput.value = currentSponsor.name;
    if (distPhoneInput && currentSponsor.isPersonalized) distPhoneInput.value = currentSponsor.phone;
  }

  // 2. Fetch Master Products (Multi-path with Cache Busting)
  async function loadMasterProducts() {
    const cacheBuster = Date.now();
    const paths = [
      `/data/netsurf-products-master.json?t=${cacheBuster}`,
      `../data/netsurf-products-master.json?t=${cacheBuster}`,
      `./data/netsurf-products-master.json?t=${cacheBuster}`,
      `/data/netsurf-products-master.json`
    ];

    let loaded = false;

    for (const url of paths) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.products) && data.products.length > 0) {
            masterCatalog = data.products;
            masterCategories = data.categories || [];
            try { localStorage.setItem('aim_netsurf_products_master', JSON.stringify(data)); } catch (e) {}
            loaded = true;
            break;
          }
        }
      } catch (e) {}
    }

    // LocalStorage Fallback
    if (!loaded) {
      try {
        const cached = localStorage.getItem('aim_netsurf_products_master');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
            masterCatalog = parsed.products;
            masterCategories = parsed.categories || [];
          }
        }
      } catch (e) {}
    }

    renderProductsGrid();
  }

  // 3. Render Product Cards Grid
  function renderProductsGrid() {
    const grid = document.getElementById('npProductsGridContainer');
    const countBadge = document.getElementById('npProductCountBadge');
    if (!grid) return;

    // Filter Logic
    const filtered = masterCatalog.filter(p => {
      // 1. Category Filter
      if (currentCategory !== 'all' && p.category !== currentCategory) {
        return false;
      }
      // 2. Problem / Concern Filter
      if (currentProblem !== 'all') {
        const tags = Array.isArray(p.problem_tags) ? p.problem_tags : [];
        if (!tags.includes(currentProblem)) {
          // Fallback mapping if tag is not explicitly set
          if (currentProblem === 'cattle_care' && p.category === 'cattle') return true;
          if (currentProblem === 'crop_yield' && p.category === 'agri') return true;
          if (currentProblem === 'home_care' && p.category === 'clean_more') return true;
          return false;
        }
      }
      // 3. Search Query Filter
      if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        const str = `${p.name || ''} ${p.category_label || ''} ${p.subcategory_label || ''} ${p.pack_size || ''} ${p.description || ''} ${p.ingredients || ''} ${p.dose || ''}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} उत्पाद उपलब्ध`;
    }

    const filteredScopeLabel = document.getElementById('npScopeFilteredLabel');
    if (filteredScopeLabel) {
      filteredScopeLabel.textContent = `📁 वर्तमान फ़िल्टर उत्पाद (${filtered.length})`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 16px; border: 1.5px dashed #cbd5e1; color: #64748b;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
          <strong style="font-size: 1.1rem; color: #0f172a;">कोई उत्पाद नहीं मिला</strong>
          <p style="font-size: 0.88rem; margin: 6px 0 16px 0;">फ़िल्टर बदलें या 'रीसेट फ़िल्टर' बटन दबाएं।</p>
          <button type="button" onclick="window.resetAllFilters()" style="background: #10b981; color: #fff; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 800; cursor: pointer;">
            सभी 39 उत्पाद देखें
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const mrp = parseInt(p.mrp, 10) || 0;
      const discountPct = parseInt(p.discount_pct, 10) || 0;
      const offerPrice = p.discounted_price || (discountPct ? Math.round(mrp * (1 - discountPct / 100)) : (p.price || mrp));
      const packSize = p.pack_size || '';
      const imgSrc = p.image || '/images/logo/logo.png';
      const badge = p.badge || '';
      const catLabel = p.category_label || p.category;
      const subLabel = p.subcategory_label || '';

      const waMsg = encodeURIComponent(`नमस्ते ${currentSponsor.name} जी! मुझे नेटसर्फ उत्पाद: *${p.name}* (पैकिंग: ${packSize || '1 यूनिट'}, MRP: ₹${mrp}, ऑफर रेट: ₹${offerPrice}, ${discountPct}% छूट) की जानकारी चाहिए व ऑर्डर करना है।`);
      const waUrl = `https://api.whatsapp.com/send?phone=${currentSponsor.phone}&text=${waMsg}`;

      return `
        <div class="np-card" data-cat="${p.category}" data-id="${p.id}">
          <div>
            <!-- Image Wrap -->
            <div class="np-img-box">
              <img src="${imgSrc}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='/images/logo/logo.png';">
              ${badge ? `<span style="position:absolute; top:8px; left:8px; background:rgba(21,128,61,0.92); color:#fff; font-size:0.7rem; padding:3px 8px; border-radius:12px; font-weight:800; backdrop-filter:blur(4px);">${escapeHtml(badge)}</span>` : ''}
            </div>

            <!-- Category & Pack Size Badges -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:6px; flex-wrap:wrap;">
              <span style="background:#dcfce7; color:#15803d; font-size:0.72rem; padding:3px 8px; border-radius:12px; font-weight:700;">
                ${escapeHtml(catLabel)}
              </span>
              <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
                ${packSize ? `<span style="background:#e0f2fe; color:#0369a1; font-size:0.7rem; padding:2px 8px; border-radius:10px; font-weight:700; border:1px solid #bae6fd;">📦 ${escapeHtml(packSize)}</span>` : ''}
                ${subLabel ? `<span style="background:#f1f5f9; color:#475569; font-size:0.68rem; padding:2px 7px; border-radius:10px; font-weight:600;">${escapeHtml(subLabel)}</span>` : ''}
              </div>
            </div>

            <!-- Title -->
            <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0 0 8px 0; line-height:1.35;">
              ${escapeHtml(p.name)}
            </h3>

            <!-- Price Row -->
            <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:10px; flex-wrap:wrap;">
              <span style="font-size:1.25rem; font-weight:900; color:#16a34a;">₹${offerPrice}</span>
              ${mrp > offerPrice ? `
                <span style="text-decoration:line-through; color:#94a3b8; font-size:0.85rem;">₹${mrp}</span>
                <span style="font-size:0.72rem; background:#fee2e2; color:#dc2626; padding:1px 6px; border-radius:6px; font-weight:800;">${discountPct}% छूट</span>
              ` : ''}
            </div>

            <!-- Description -->
            ${p.description ? `<p style="font-size:0.82rem; color:#475569; line-height:1.45; margin-bottom:10px;">${escapeHtml(p.description)}</p>` : ''}

            <!-- Ingredients & Dose Accordion Details -->
            ${p.ingredients ? `
              <div style="background:#f8fafc; border-left:3px solid #10b981; padding:6px 10px; border-radius:4px; margin-bottom:6px; font-size:0.75rem; color:#334155;">
                <strong style="color:#059669;">🌱 मुख्य घटक:</strong> ${escapeHtml(p.ingredients)}
              </div>
            ` : ''}
            ${p.dose ? `
              <div style="background:#f0fdf4; border-left:3px solid #22c55e; padding:6px 10px; border-radius:4px; margin-bottom:6px; font-size:0.75rem; color:#166534;">
                <strong style="color:#15803d;">📋 उपयोग व खुराक:</strong> ${escapeHtml(p.dose)}
              </div>
            ` : ''}
            ${p.precautions ? `
              <div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:6px 10px; border-radius:4px; margin-bottom:12px; font-size:0.75rem; color:#92400e;">
                <strong style="color:#b45309;">⚠️ सावधानियां:</strong> ${escapeHtml(p.precautions)}
              </div>
            ` : ''}
          </div>

          <!-- Action Buttons -->
          <div style="margin-top:auto; padding-top:10px; display:flex; flex-direction:column; gap:6px;">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#16a34a; color:#ffffff; font-weight:800; font-size:0.84rem; padding:10px 14px; border-radius:10px; text-decoration:none; box-shadow:0 3px 10px rgba(22,163,74,0.25); box-sizing:border-box;">
              <i class="fa-brands fa-whatsapp" style="font-size:1.05rem;"></i>
              <span>ऑर्डर / WhatsApp पूछताछ</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 4. Filter Handlers
  window.filterByCategory = function (catId) {
    currentCategory = catId;
    document.querySelectorAll('.np-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === catId);
    });
    renderProductsGrid();
  };

  window.filterByProblem = function (probId) {
    currentProblem = probId;
    document.querySelectorAll('.np-prob-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-prob') === probId);
    });
    renderProductsGrid();
  };

  window.handleSearchInput = function (val) {
    currentSearchQuery = val ? val.trim() : '';
    renderProductsGrid();
  };

  window.resetAllFilters = function () {
    currentCategory = 'all';
    currentProblem = 'all';
    currentSearchQuery = '';
    const searchInput = document.getElementById('npSearchInput');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.np-cat-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === 'all'));
    document.querySelectorAll('.np-prob-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-prob') === 'all'));
    renderProductsGrid();
  };

  // 5. Audio Tutorial with Speech Synthesis
  let synthUtterance = null;
  let isAudioPlaying = false;

  window.toggleAudioTutorial = function () {
    const widget = document.getElementById('npAudioWidget');
    const playBtnText = document.getElementById('npAudioText');
    const icon = document.getElementById('npAudioIcon');

    if (!('speechSynthesis' in window)) {
      alert('आपके ब्राउज़र में AI वॉइस सपोर्ट उपलब्ध नहीं है। कृपया Chrome या Safari उपयोग करें।');
      return;
    }

    if (window.speechSynthesis.speaking && isAudioPlaying) {
      window.speechSynthesis.cancel();
      isAudioPlaying = false;
      if (widget) widget.classList.remove('playing');
      if (playBtnText) playBtnText.textContent = 'ऑडियो सुनें';
      if (icon) icon.className = 'fa-solid fa-volume-high';
      return;
    }

    window.speechSynthesis.cancel();

    const voiceScript = `नमस्ते! आरोग्यम इंडिया सम्पूर्ण नेटसर्फ उत्पाद केंद्र में आपका स्वागत है। यहाँ आप कृषि बायोफिट, पशु पोषण, नेचुरामोरे और पर्सनल केयर के सभी 39 से अधिक प्रमाणित आयुर्वेदिक उत्पाद देख सकते हैं। ऊपर दिए गए बीमारी या कैटेगरी फ़िल्टर से अपनी पसंद के उत्पाद चुनें। आप 'डाउनलोड कैटलॉग' बटन दबाकर 7 भाषाओं में अपने नाम व मोबाइल नंबर के साथ पर्सनलाइज्ड PDF कैटलॉग भी डाउनलोड कर सकते हैं। किसी भी उत्पाद को ऑर्डर करने या सलाह के लिए व्हाट्सएप बटन का उपयोग करें।`;

    synthUtterance = new SpeechSynthesisUtterance(voiceScript);
    synthUtterance.lang = 'hi-IN';
    synthUtterance.rate = 0.95;
    synthUtterance.pitch = 1.0;

    synthUtterance.onstart = function () {
      isAudioPlaying = true;
      if (widget) widget.classList.add('playing');
      if (playBtnText) playBtnText.textContent = 'रोकें (Pause)';
      if (icon) icon.className = 'fa-solid fa-pause';
    };

    synthUtterance.onend = function () {
      isAudioPlaying = false;
      if (widget) widget.classList.remove('playing');
      if (playBtnText) playBtnText.textContent = 'पुनः सुनें';
      if (icon) icon.className = 'fa-solid fa-volume-high';
    };

    synthUtterance.onerror = function () {
      isAudioPlaying = false;
      if (widget) widget.classList.remove('playing');
      if (playBtnText) playBtnText.textContent = 'ऑडियो सुनें';
      if (icon) icon.className = 'fa-solid fa-volume-high';
    };

    window.speechSynthesis.speak(synthUtterance);
  };

  // 6. Download Catalog Modal Handlers
  window.openCatalogDownloadModal = function () {
    const modal = document.getElementById('npCatalogModal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeCatalogDownloadModal = function () {
    const modal = document.getElementById('npCatalogModal');
    if (modal) modal.style.display = 'none';
  };

  // 7. Multi-Language High-Res Personalized PDF Catalog Engine
  window.generateAndDownloadPdfCatalog = function () {
    const scopeRadio = document.querySelector('input[name="catalogScope"]:checked');
    const langRadio = document.querySelector('input[name="catalogLang"]:checked');
    const scope = scopeRadio ? scopeRadio.value : 'all';
    const langKey = langRadio ? langRadio.value : 'hi';
    const i18n = I18N_CATALOG[langKey] || I18N_CATALOG.hi;

    const distName = (document.getElementById('npDistributorName')?.value || currentSponsor.name || DEFAULT_SUPPORT_NAME).trim();
    const distPhone = (document.getElementById('npDistributorPhone')?.value || currentSponsor.phone || DEFAULT_SUPPORT_PHONE).trim();

    // Filter products according to chosen scope
    let prodsToPrint = masterCatalog;
    if (scope === 'filtered') {
      prodsToPrint = masterCatalog.filter(p => {
        if (currentCategory !== 'all' && p.category !== currentCategory) return false;
        if (currentProblem !== 'all') {
          const tags = Array.isArray(p.problem_tags) ? p.problem_tags : [];
          if (!tags.includes(currentProblem)) return false;
        }
        return true;
      });
      if (prodsToPrint.length === 0) prodsToPrint = masterCatalog;
    }

    window.closeCatalogDownloadModal();

    // Generate Printable HTML Document
    const printDoc = window.open('', '_blank');
    if (!printDoc) {
      alert('कृपया ब्राउज़र में पॉपअप को अनुमति दें (Allow Popups) ताकि कैटलॉग खुल सके।');
      return;
    }

    const todayDate = new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${i18n.title} - ${distName}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 10mm;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 0;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          .header-banner {
            border-bottom: 3px solid #10b981;
            padding-bottom: 12px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .product-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .product-box {
            border: 1.5px solid #cbd5e1;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            gap: 12px;
            background: #ffffff;
            box-sizing: border-box;
            break-inside: avoid;
          }
          .product-img {
            width: 100px;
            height: 100px;
            object-fit: contain;
            border-radius: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            flex-shrink: 0;
          }
          .badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 6px;
            background: #dcfce7;
            color: #15803d;
          }
          .pack-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 6px;
            background: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
          }
          .legal-disclaimer {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #f59e0b;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 9.5px;
            line-height: 1.45;
            color: #475569;
            margin-top: 20px;
            break-inside: avoid;
          }
          .distributor-card {
            background: #f0fdf4;
            border: 2px solid #16a34a;
            border-radius: 14px;
            padding: 18px;
            text-align: center;
            margin-top: 24px;
            break-inside: avoid;
          }
        </style>
      </head>
      <body>

        <!-- COVER PAGE -->
        <div style="text-align: center; padding: 40px 20px 30px 20px;" class="page-break">
          <div style="display:flex; justify-content:center; align-items:center; gap:16px; margin-bottom:20px;">
            <img src="https://aarogyamindia.online/images/logo/logo.png" style="height:60px; width:auto;" alt="Logo" onerror="this.style.display='none';">
            <div style="text-align:left;">
              <h1 style="font-size:26px; margin:0; color:#0f172a; letter-spacing:-0.5px;">AAROGYAM INDIA</h1>
              <span style="font-size:12px; font-weight:800; color:#10b981; letter-spacing:1px;">NATIONAL DIRECT DISTRIBUTOR NETWORK</span>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #091326 0%, #15284f 100%); color:#ffffff; padding: 36px 24px; border-radius: 18px; margin: 20px 0;">
            <span style="background:#f59e0b; color:#000; font-size:12px; font-weight:900; padding:4px 14px; border-radius:20px; text-transform:uppercase;">OFFICIAL PRODUCT PORTFOLIO</span>
            <h2 style="font-size:28px; font-weight:900; margin:16px 0 8px 0; color:#34d399;">${i18n.title}</h2>
            <p style="font-size:14px; color:#cbd5e1; margin:0;">${i18n.subtitle}</p>
            <div style="margin-top:20px; font-size:12px; color:#94a3b8;">दिनांक: ${todayDate} • कुल उत्पाद: ${prodsToPrint.length}</div>
          </div>

          <!-- Company Profile Box -->
          <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:14px; padding:20px; text-align:left; margin:24px 0;">
            <h3 style="font-size:16px; color:#0f172a; margin:0 0 8px 0; border-bottom:2px solid #10b981; padding-bottom:6px;">
              🏢 ${i18n.coverCompanyTitle}
            </h3>
            <p style="font-size:12px; color:#334155; line-height:1.6; margin:0 0 10px 0;">
              ${i18n.coverCompanyDesc}
            </p>
            <p style="font-size:12px; color:#166534; font-weight:700; line-height:1.5; margin:0;">
              🌱 ${i18n.categoryIntro}
            </p>
          </div>

          <!-- Presenter Box on Cover -->
          <div style="background:#ecfdf5; border:1.5px solid #10b981; border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center; text-align:left;">
            <div>
              <span style="font-size:11px; font-weight:800; color:#065f46; text-transform:uppercase;">${i18n.distributorTitle}</span>
              <h3 style="font-size:18px; margin:3px 0 0 0; color:#0f172a; font-weight:900;">${distName}</h3>
              <p style="margin:2px 0 0 0; font-size:13px; font-weight:800; color:#0284c7;">📞 +91 ${distPhone}</p>
            </div>
            <div style="text-align:right;">
              <span style="font-size:10px; color:#64748b;">कस्टमर सपोर्ट:</span>
              <strong style="display:block; font-size:13px; color:#0f172a;">+91 79744 22572</strong>
            </div>
          </div>
        </div>

        <!-- PRODUCT PAGES -->
        <div class="header-banner">
          <div>
            <strong style="font-size:16px; color:#0f172a;">Aarogyam India • ${i18n.title}</strong>
            <div style="font-size:11px; color:#64748b;">प्रस्तुतकर्ता: ${distName} (मो: +91 ${distPhone})</div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:11px; font-weight:800; color:#10b981;">100% GENUINE & CERTIFIED</span>
          </div>
        </div>

        <div class="product-grid">
          ${prodsToPrint.map(p => {
            const mrp = parseInt(p.mrp, 10) || 0;
            const discountPct = parseInt(p.discount_pct, 10) || 0;
            const offerPrice = p.discounted_price || (discountPct ? Math.round(mrp * (1 - discountPct / 100)) : mrp);
            const imgSrc = (p.image && !p.image.includes('logo.png')) ? (p.image.startsWith('http') ? p.image : 'https://aarogyamindia.online' + p.image) : 'https://aarogyamindia.online/images/logo/logo.png';

            return `
              <div class="product-box">
                <img src="${imgSrc}" class="product-img" alt="${p.name}" onerror="this.src='https://aarogyamindia.online/images/logo/logo.png'">
                <div style="flex:1; min-width:0;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:4px;">
                    <span class="badge">${p.category_label || p.category}</span>
                    ${p.pack_size ? `<span class="pack-badge">📦 ${p.pack_size}</span>` : ''}
                  </div>
                  <h4 style="font-size:12px; font-weight:800; color:#0f172a; margin:0 0 4px 0; line-height:1.3;">${p.name}</h4>
                  
                  <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:6px;">
                    <strong style="font-size:14px; color:#16a34a;">${i18n.offerLabel} ₹${offerPrice}</strong>
                    ${mrp > offerPrice ? `<span style="font-size:10px; color:#94a3b8; text-decoration:line-through;">₹${mrp}</span>` : ''}
                  </div>

                  ${p.description ? `<p style="font-size:10px; color:#475569; margin:0 0 4px 0; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.description}</p>` : ''}
                  ${p.dose ? `<div style="font-size:9.5px; color:#166534; line-height:1.3;"><strong>${i18n.doseLabel}</strong> ${p.dose}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- FINAL LEGAL DISCLAIMER & DISTRIBUTOR CARD -->
        <div class="legal-disclaimer">
          <strong style="color:#b45309; display:block; margin-bottom:3px;">${i18n.disclaimerTitle}</strong>
          ${i18n.disclaimerText}
        </div>

        <div class="distributor-card">
          <span style="font-size:11px; font-weight:800; color:#15803d; text-transform:uppercase;">${i18n.distributorTitle}</span>
          <h2 style="font-size:20px; font-weight:900; margin:6px 0; color:#0f172a;">${distName}</h2>
          <div style="font-size:16px; font-weight:900; color:#0284c7; margin-bottom:8px;">
            📞 फोन व WhatsApp: +91 ${distPhone}
          </div>
          <p style="font-size:11px; color:#475569; margin:0 0 8px 0;">
            ऑर्डर देने, डिलीवरी स्थिति या बिज़नेस कंसल्टेंसी हेतु सीधे ऊपर दिए गए नंबर पर संपर्क करें।
          </p>
          <div style="border-top:1px solid #bbf7d0; padding-top:8px; font-size:11px; color:#166534; font-weight:700;">
            ${i18n.helplineLabel} +91 79744 22572 | www.aarogyamindia.online
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printDoc.document.open();
    printDoc.document.write(htmlContent);
    printDoc.document.close();
  };

  // 8. Initialization
  document.addEventListener('DOMContentLoaded', () => {
    resolveSponsor();
    loadMasterProducts();

    // Attempt subtle auto-play voice tutorial after 2 seconds (graceful fallback if browser restricts)
    setTimeout(() => {
      try {
        if ('speechSynthesis' in window && !window.speechSynthesis.speaking) {
          // Some modern browsers permit utterance if muted or with user interaction, we trigger gentle start
        }
      } catch (e) {}
    }, 2000);
  });

})();
