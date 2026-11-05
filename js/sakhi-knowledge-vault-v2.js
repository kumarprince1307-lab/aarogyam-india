/**
 * =========================================================================
 * 🏛️ AAROGYAM SAKHI — KNOWLEDGE VAULT V2, TEMPLATES & ESTIMATES ENGINE
 * Module: js/sakhi-knowledge-vault-v2.js
 * Architecture: SAKHI_MANAS.md Compliant (Rule 1 & Rule 2 Safe Modular Architecture)
 * 
 * Capabilities:
 * 1. 🏷️ Updated Netsurf Biofit & Naturamore Master Pricing (SHET ₹1200, Active/Orig ₹1450, Kids ₹1225, Women ₹1425, Premeal ₹335)
 * 2. 🐄 Ruminant 4 Stomach Anatomy (रूमेन, रेटिकुलम, ओमेसम, एबोमेसम) & Pet-Vet Live Solutions
 * 3. 🧮 Livestock Economics & Daily Feed Cost Estimates (दूध-फैट व आहार खर्च एस्टीमेट)
 * 4. 🎨 Dynamic 8K Image Prompt Generator (Subject & Crop Aware - DALL-E / Gemini)
 * 5. 🎭 6 Multi-Persona Conversational Templates (Rural, Clinical, 1-Min Action, Dadi Nuskha, Economic, Weather-Aware)
 * 6. 🌐 Clean Wikipedia & External Search Query Sanitizer (Noise-Free)
 * 7. 🩺 Common Weakness & Fatigue vs Intimate Health Separation Guardrail
 * =========================================================================
 */

(function (window, document) {
  'use strict';

  // 1. UPDATED MASTER PRODUCT PRICING & INGREDIENT CATALOG (2026-27 SSOT)
  const MASTER_CATALOG = {
    shet: {
      id: 'biofit_shet_1l',
      name: 'बायोफिट शेत (Biofit SHET)',
      pack: '1 Litre',
      mrp: 1200,
      discount_price: 900,
      discount_pct: '25%',
      desc: 'जमीन में लॉक फास्फोरस, पोटाश, जिंक व सूक्ष्म पोषक तत्वों को सक्रिय करने वाला 100% जैविक तरल बैक्टीरिया कल्चर।',
      dosage: '1 लीटर प्रति एकड़ ड्रिप, फ्लड इरिगेशन या वेंचुरी द्वारा।'
    },
    naturamore_original: {
      id: 'naturamore_original_400g',
      name: 'नेचुरामोर ओरिजिनल (Naturamore Original)',
      pack: '400g',
      flavor: 'मसाला फ्लेवर (Masala)',
      mrp: 1450,
      discount_price: 1088,
      discount_pct: '25%',
      desc: '5 प्राकृतिक प्रोटीन स्रोत (सोया, व्हे, मटर, चावल, दूध), 13 विटामिन, 10 खनिज व एलोवेरा युक्त संपूर्ण दैनिक परिवार पोषण।',
      dosage: '1 चम्मच (10g) सुबह नाश्ते के बाद गुनगुने पानी या दूध के साथ।'
    },
    naturamore_active: {
      id: 'naturamore_active_400g',
      name: 'नेचुरामोर एक्टिव (Naturamore Active - New)',
      pack: '400g',
      flavor: 'चॉकलेट फ्लेवर (Delicious Chocolate)',
      mrp: 1450,
      discount_price: 1088,
      discount_pct: '25%',
      desc: 'सक्रिय युवाओं, एथलीट्स और कामकाजी लोगों के लिए विशेष चॉकलेट स्वाद में ऊर्जा, स्टैमिना और ओमेगा-3 (DHA) युक्त एक्टिव न्यूट्रिशन।',
      dosage: '1 चम्मच (10g) वर्कआउट या नाश्ते के बाद दूध/पानी में।'
    },
    naturamore_women: {
      id: 'naturamore_women_400g',
      name: 'नेचुरामोर फॉर विमेन (Naturamore for Women)',
      pack: '400g',
      flavors: ['फ्रेंच वैनिला (French Vanilla)', 'मसाला मिल्क (Masala Milk)'],
      mrp: 1425,
      discount_price: 1069,
      discount_pct: '25%',
      desc: 'शतावरी, हरिद्रा, बायोटीन, फोलिक एसिड, कैल्शियम और आयरन युक्त महिला हार्मोन संतुलन, हीमोग्लोबिन व त्वचा-बाल पोषण।',
      dosage: '1 चम्मच (10g) प्रतिदिन गुनगुने दूध के साथ।'
    },
    naturamore_kids: {
      id: 'naturamore_kids_pack',
      name: 'नेचुरामोर किड्स (Naturamore Kids)',
      pack: '350g/400g',
      flavor: 'चॉकलेट कुकी फ्लेवर (Chocolate)',
      mrp: 1225,
      discount_price: 919,
      discount_pct: '25%',
      desc: 'ब्राह्मी, शंखपुष्पी, अश्वगंधा व व्हे प्रोटीन युक्त बच्चों की याददाश्त, मानसिक एकाग्रता, रोग प्रतिरोधक क्षमता और लंबाई विकास।',
      dosage: '1 छोटा चम्मच (5g) दिन में 1-2 बार गुनगुने दूध में।'
    },
    naturamore_premeal: {
      id: 'naturamore_premeal_200g',
      name: 'नेचुरामोर प्री-मील (Naturamore Pre-Meal)',
      pack: '200g',
      mrp: 335,
      discount_price: 251,
      discount_pct: '25%',
      desc: 'भोजन से 20-30 मिनट पहले तृप्ति देने वाला घुलनशील फाइबर फॉर्मूला। फैट बर्निंग और अतिरिक्त कार्बोहाइड्रेट अवशोषण रोकने में मददगार।',
      dosage: 'भोजन से 20 मिनट पहले 1 चम्मच 1 गिलास सामान्य पानी में घोलकर तुरंत पिएं।'
    },
    pet_vet: {
      id: 'biofit_pet_vet_cfc',
      name: 'बायोफिट पेट-वेट (Biofit Pet-Vet / पूर्व CFC Plus)',
      pack: '1 kg / 500g / 250g',
      mrp: 1275, // 1kg
      discount_price: 956,
      desc: 'मेथानाइन, शतावरी, जीवंती, विटामिन्स और रूमेन पाचक माइक्रोब्स युक्त संपूर्ण पशु आहार संपूरक। दूध में 1.5-2L और फैट में 1-1.5 डिग्री वृद्धि।',
      dosage: 'बड़ा पशु (गाय/भैंस): 10-15 ग्राम रोज | छोटा पशु (बछड़ा/बकरी): 5 ग्राम रोज।'
    }
  };

  // 2. LIVESTOCK 4 STOMACH ANATOMY & COST ESTIMATE ENGINE
  function handleLivestockStomachAndCostEstimate(cleanQ) {
    const q = cleanQ.toLowerCase();
    
    // B. LIVESTOCK FEED & PET-VET COST ESTIMATE (Run first if query mentions estimate/cost/budget)
    const isCostEstimate = (q.includes('एस्टीमेट') || q.includes('estimate') || q.includes('खर्च') || q.includes('लागत') || q.includes('बजट') || q.includes('मुनाफा')) &&
      (q.includes('पशु') || q.includes('गाय') || q.includes('भैंस') || q.includes('डेयरी') || q.includes('पेट वेट') || q.includes('दूध'));

    if (isCostEstimate) {
      const title = '🧮 दुधारू पशु आहार, पेट-वेट खुराक व दैनिक मुनाफा एस्टीमेट (Live Budget Calculator)';
      const body = `🥛 **2 दुधारू गाय/भैंस (10-12 लीटर दूध क्षमता) का वैज्ञानिक दैनिक खर्च व लाभ एस्टीमेट:**\n\n` +
        `📊 **1. दैनिक आहार व खर्च विवरण (प्रति पशु):**\n` +
        `• हरा चारा (20-25 kg) + सूखा भूसा (5-6 kg): ₹45 - ₹55\n` +
        `• संतुलित दाना मिश्रण / खली-चोकर (3-4 kg): ₹70 - ₹85\n` +
        `• **बायोफिट पेट-वेट (Pet-Vet) खुराक (15 ग्राम/दिन):** मात्र **₹14 से ₹15 प्रतिदिन**\n` +
        `• **कुल दैनिक आहार लागत:** लगभग **₹135 से ₹155 प्रति पशु/दिन**\n\n` +
        `💰 **2. पेट-वेट से अतिरिक्त दूध व फैट का शुद्ध मुनाफा:**\n` +
        `• **अतिरिक्त दूध वृद्धि:** 1.5 से 2 लीटर प्रतिदिन (दूध दर ₹40-₹50/L): **+₹70 से ₹90 प्रतिदिन**\n` +
        `• **फैट में 1 डिग्री सुधार:** प्रति लीटर ₹3-₹4 अतिरिक्त बोनस\n` +
        `• **पेट-वेट पर निवेश:** ₹15/दिन\n` +
        `• **प्रति पशु शुद्ध अतिरिक्त दैनिक बचत/मुनाफा:** **₹55 से ₹75 प्रतिदिन** (यानी 2 पशुओं पर महीने में ₹3,300 से ₹4,500 की सीधी बचत)!\n\n` +
        `✨ **अतिरिक्त अप्रत्यक्ष लाभ:** पशु समय पर हीट में आता है, जेर आसानी से गिरती है और डॉक्टर का इंजेक्शन खर्च 80% बचता है।`;

      const chips = [
        { text: '🛒 25% छूट पर पेट-वेट 1kg ऑर्डर करें', url: '/categories/pashupalan.html', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
        { text: '🐄 पशु के पेट के 4 भाग समझें', query: 'पशु के पेट के 4 भाग बताओ' },
        { text: '📖 मेरी डेयरी में दूध-फैट का हिसाब जोड़ें', url: '/pages/smart-etailer.html?tab=dairy', isExternal: true }
      ];

      if (typeof window.renderCrispSpecialBox === 'function') {
        window.renderCrispSpecialBox(title, body, chips, 'pashu', 'livestock_feed_cost_estimate');
        return true;
      }
    }

    // A. 4 STOMACH ANATOMY CHECK
    const isStomachQuery = (q.includes('पेट') || q.includes('stomach') || q.includes('पाचन') || q.includes('रूमेन') || q.includes('जुगाली')) &&
      (q.includes('4') || q.includes('चार') || q.includes('भाग') || q.includes('अंग') || q.includes('हिस्से') || q.includes('जुगाली') || q.includes('रूमेन') || q.includes('गाय') || q.includes('पशु') || q.includes('भैंस'));

    if (isStomachQuery) {
      const title = '🐄 पशु के पेट के 4 मुख्य भाग (Ruminant Anatomy) व पाचक समाधान';
      const body = `🐄 **गाय-भैंस में पेट के 4 मुख्य भाग और उनका वैज्ञानिक कार्य:**\n\n` +
        `गाय और भैंस जुगाली करने वाले (Ruminant) पशु हैं। इनका पेट साधारण न होकर **4 विशेष कक्षों (Compartments)** में बंटा होता है:\n\n` +
        `1. **रूमेन (Rumen - प्रथम व सबसे बड़ा पेट / 80% क्षमता):**\n` +
        `   • यहाँ खाया गया सूखा-हरा चारा जमा होता है। इसमें 100 खरब से अधिक सूक्ष्म जीवाणु (Microbes व Protozoa) होते हैं जो घास के सेल्यूलोज को किण्वन (Ferment) करके पचने योग्य बनाते हैं।\n` +
        `2. **रेटिकुलम (Reticulum - जालीदार दूसरा पेट / 5% क्षमता):**\n` +
        `   • यह छलनी की तरह काम करता है। भारी भोजन को छांटता है और चारे के गोलों को वापस मुंह में **जुगाली (Chewing Cud)** के लिए भेजता है।\n` +
        `3. **ओमेसम (Omasum - पत्तीदार तीसरा पेट / 7-8% क्षमता):**\n` +
        `   • यह पत्तियों जैसी परतों वाला अंग है जो जुगाली किए चारे से 60-70% अतिरिक्त पानी, खनिज और वोलेटाइल फैटी एसिड्स को सोखता है।\n` +
        `4. **एबोमेसम (Abomasum - चौथा या 'सत्य पेट' / 8% क्षमता):**\n` +
        `   • यह इंसान के आमाशय जैसा होता है। यहाँ हाइड्रोक्लोरिक एसिड (HCl) और पाचक एंजाइम चारे और सूक्ष्मजीवों के प्रोटीन को पचाते हैं।\n\n` +
        `💡 **पशुपालक के लिए जरूरी सूत्र:**\n` +
        `जब तक रूमेन के बैक्टीरिया स्वस्थ हैं, तब तक पशु बीमार नहीं पड़ता और दूध-फैट भरपूर देता है। रूमेन को हमेशा सक्रिय रखने के लिए रोज 10-15 ग्राम **बायोफिट पेट-वेट (Pet-Vet / CFC)** चारे में अवश्य दें।`;

      const chips = [
        { text: '🧮 2 दुधारू पशुओं का दैनिक खर्च एस्टीमेट', query: 'दो पशुओं का आहार और पेट वेट खर्च एस्टीमेट बताओ' },
        { text: '🐄 पेट-वेट (CFC Plus) खुराक व फायदे', query: 'पेट वेट और सीएफसी प्लस का काम बताओ' },
        { text: '🥛 दूध व फैट बढ़ाने का घरेलू उपाय', query: 'गाय भैंस का दूध और फैट बढ़ाने का उपाय' }
      ];

      if (typeof window.renderCrispSpecialBox === 'function') {
        window.renderCrispSpecialBox(title, body, chips, 'pashu', 'ruminant_4_stomach_anatomy');
        return true;
      }
    }

    return false;
  }

  // 3. UPDATED PRICING QUERIES ROUTER
  function handleUpdatedPricingQueries(cleanQ) {
    const q = cleanQ.toLowerCase();

    // Check SHET specifically
    if (q.includes('शेत') || q.includes('shet')) {
      const p = MASTER_CATALOG.shet;
      const title = `🏷️ ${p.name} — अधिकृत मूल्य, छूट व कार्य विवरण`;
      const body = `🌾 **${p.name} (100% जैविक तरल बैक्टीरिया खाद):**\n\n` +
        `• **पैकिंग:** ${p.pack}\n` +
        `• **एमआरपी (MRP):** **₹${p.mrp}**\n` +
        `• **आरोग्यम विशेष छूट रेट:** **₹${p.discount_price}** (${p.discount_pct} फ्लैट छूट, बचत ₹${p.mrp - p.discount_price})\n\n` +
        `🔬 **मुख्य कार्य व लाभ:**\n${p.desc}\n• **उपयोग विधि:** ${p.dosage}`;

      const chips = [
        { text: '🛒 25% छूट पर शेत ऑर्डर करें', url: '/categories/agriculture.html', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
        { text: '🌾 गेहूं/फसल में शेत का उपयोग कैसे करें?', query: 'बायोफिट शेत का प्रयोग फसल में कैसे करें' },
        { text: '📋 संपूर्ण नेट्सर्फ मूल्य सूची देखें', query: 'नेट्सर्फ बायोफिट प्रमाणित मूल्य सूची' }
      ];

      if (typeof window.renderCrispSpecialBox === 'function') {
        window.renderCrispSpecialBox(title, body, chips, 'agri', 'shet_pricing_card');
        return true;
      }
    }

    // Check Naturamore Products
    if (q.includes('नेचुरामोर') || q.includes('naturamore') || q.includes('प्री-मील') || q.includes('premeal') || q.includes('pre meal')) {
      // Original
      if (q.includes('ओरिजिनल') || q.includes('original') || (q.includes('मसाला') && !q.includes('विमेन'))) {
        const p = MASTER_CATALOG.naturamore_original;
        return renderNaturamoreProductCard(p, 'मसाला फ्लेवर (Masala)');
      }
      // Active
      if (q.includes('एक्टिव') || q.includes('active') || (q.includes('चॉकलेट') && (q.includes('एक्टिव') || q.includes('पुरुष') || q.includes('युवा')))) {
        const p = MASTER_CATALOG.naturamore_active;
        return renderNaturamoreProductCard(p, 'चॉकलेट फ्लेवर (Delicious Chocolate)');
      }
      // Women
      if (q.includes('महिला') || q.includes('women') || q.includes('विमेन') || q.includes('औरत') || q.includes('वैनिला')) {
        const p = MASTER_CATALOG.naturamore_women;
        return renderNaturamoreProductCard(p, '2 फ्लेवर: फ्रेंच वैनिला व मसाला मिल्क');
      }
      // Kids
      if (q.includes('किड्स') || q.includes('kids') || q.includes('बच्च') || q.includes('बालक')) {
        const p = MASTER_CATALOG.naturamore_kids;
        return renderNaturamoreProductCard(p, 'चॉकलेट कुकी फ्लेवर (Chocolate Cookie)');
      }
      // Pre-meal
      if (q.includes('प्री-मील') || q.includes('premeal') || q.includes('pre meal') || q.includes('335') || q.includes('वजन घटाने का पाउडर')) {
        const p = MASTER_CATALOG.naturamore_premeal;
        return renderNaturamoreProductCard(p, 'नेचुरल फाइबर फ्लेवर');
      }

      // Master Naturamore Range Overview
      const title = '🏷️ नेचुरामोर प्रमाणित अधिकृत मूल्य सूची (New 2026-27 MRP & Flavors)';
      const body = `🌿 **नेचुरामोर दैनिक स्वास्थ्य पोषण श्रृंखला — अधिकृत रेट लिस्ट:**\n\n` +
        `1. **नेचुरामोर ओरिजिनल (400g - मसाला फ्लेवर):**\n` +
        `   • MRP: **₹1,450** | आरोग्यम छूट रेट: **₹1,088**\n` +
        `2. **नेचुरामोर एक्टिव (400g - चॉकलेट फ्लेवर):**\n` +
        `   • MRP: **₹1,450** | आरोग्यम छूट रेट: **₹1,088**\n` +
        `3. **नेचुरामोर फॉर विमेन (400g - फ्रेंच वैनिला व मसाला मिल्क):**\n` +
        `   • MRP: **₹1,425** | आरोग्यम छूट रेट: **₹1,069**\n` +
        `4. **नेचुरामोर किड्स (चॉकलेट फ्लेवर):**\n` +
        `   • MRP: **₹1,225** | आरोग्यम छूट रेट: **₹919**\n` +
        `5. **नेचुरामोर प्री-मील (200g - वजन नियंत्रण फाइबर):**\n` +
        `   • MRP: **₹335** | आरोग्यम छूट रेट: **₹251**\n\n` +
        `✨ **100% शाकाहारी, ग्लूटेन फ्री व GMP प्रमाणित!** घर बैठे 25% छूट पर उपलब्ध।`;

      const chips = [
        { text: '🌸 नेचुरामोर फॉर विमेन के फायदे', query: 'नेचुरामोर फॉर विमेन के फायदे और फ्लेवर' },
        { text: '🍫 नेचुरामोर एक्टिव चॉकलेट के फायदे', query: 'नेचुरामोर एक्टिव चॉकलेट फ्लेवर क्या है' },
        { text: '🥗 नेचुरामोर प्री-मील वजन घटाने का नियम', query: 'नेचुरामोर प्री-मील का प्रयोग कैसे करें' }
      ];

      if (typeof window.renderCrispSpecialBox === 'function') {
        window.renderCrispSpecialBox(title, body, chips, 'health', 'naturamore_master_pricing');
        return true;
      }
    }

    return false;
  }

  function renderNaturamoreProductCard(p, flavorText) {
    const title = `🏷️ ${p.name} — MRP ₹${p.mrp} (छूट ₹${p.discount_price})`;
    const body = `🌿 **${p.name} (आधिकारिक विवरण):**\n\n` +
      `• **पैकिंग व वजन:** ${p.pack}\n` +
      `• **उपलब्ध फ्लेवर:** **${flavorText}**\n` +
      `• **एमआरपी (MRP):** **₹${p.mrp}**\n` +
      `• **आरोग्यम विशेष छूट रेट:** **₹${p.discount_price}** (25% फ्लैट छूट, बचत ₹${p.mrp - p.discount_price})\n\n` +
      `🔬 **मुख्य घटक व लाभ:**\n${p.desc}\n• **उपयोग विधि:** ${p.dosage}`;

    const chips = [
      { text: `🛒 25% छूट पर ${p.name.slice(0, 16)} लें`, url: '/categories/health.html', isExternal: true, style: 'background:#16a34a;color:#ffffff;font-weight:800;' },
      { text: '📋 पूरी नेचुरामोर रेंज देखें', query: 'नेचुरामोर अधिकृत रेट लिस्ट दिखाओ' },
      { text: '📲 सखी से ₹200-₹500 रोज कैसे कमाएं?', query: 'आरोग्यम शेयर करके पैसे कैसे कमाएं' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'health', p.id);
      return true;
    }
    return false;
  }

  // 4. DYNAMIC 8K IMAGE PROMPT GENERATOR (Subject & Crop Aware)
  function handleDynamicImagePromptGenerator(cleanQ, rawQ) {
    const q = cleanQ.toLowerCase();
    const isImagePromptReq = (
      q.includes('prompt') || q.includes('प्रॉम्प्ट') || q.includes('image bana') || q.includes('इमेज बना') ||
      q.includes('फोटो बना') || q.includes('image prompt') || q.includes('प्रमोशनल इमेज') ||
      q.includes('poster prompt') || q.includes('promt') || q.includes('ai photo') || q.includes('ai poster') ||
      (q.includes('फोटो') && (q.includes('बना') || q.includes('प्रॉम्प्ट') || q.includes('तैयार')))
    );

    if (!isImagePromptReq) return false;

    // Detect Subject & Context dynamically
    let detectedSubject = 'कृषि व फसल क्रांति';
    let promptSubjectEn = 'an Indian lush green organic farm with golden crop harvest';

    if (q.includes('गेहूं') || q.includes('wheat')) {
      detectedSubject = 'गेहूं की बंपर फसल';
      promptSubjectEn = 'a magnificent lush golden-green wheat field with heavy ear heads (baliyan) sparkling in warm sunrise';
    } else if (q.includes('टमाटर') || q.includes('tomato')) {
      detectedSubject = 'टमाटर की जैविक खेती';
      promptSubjectEn = 'a thriving Indian tomato farm loaded with shiny red and green fresh organic tomatoes on healthy vines';
    } else if (q.includes('सरसों') || q.includes('mustard')) {
      detectedSubject = 'पीली सरसों के लहलहाते खेत';
      promptSubjectEn = 'a scenic endless yellow mustard (sarson) field in full bloom under crystal clear rural winter sunshine';
    } else if (q.includes('आलू') || q.includes('potato')) {
      detectedSubject = 'आलू की बंपर पैदावार';
      promptSubjectEn = 'a rich fertile potato field with healthy green canopy and fresh big organic potato tubers displayed cleanly';
    } else if (q.includes('दूध') || q.includes('पशु') || q.includes('डेयरी') || q.includes('भैंस') || q.includes('गाय')) {
      detectedSubject = 'दुधारू गाय-भैंस व डेयरी समृद्धि';
      promptSubjectEn = 'a majestic healthy shining Murrah buffalo and Gir cow in a pristine modern dairy farm with overflowing steel milk bucket';
    } else if (q.includes('नेट्सर्फ') || q.includes('बिजनेस') || q.includes('कैरियर') || q.includes('पाथफाइंडर')) {
      detectedSubject = 'नेट्सर्फ बिजनेस व आत्मनिर्भर भारत';
      promptSubjectEn = 'a dynamic corporate leadership stage with sapphire and golden lighting, success trophy, and professional Indian distributor portrait layout';
    } else if (q.includes('स्वास्थ्य') || q.includes('कमजोरी') || q.includes('नेचुरामोर') || q.includes('फैमिली')) {
      detectedSubject = 'नेचुरामोर संपूर्ण पारिवारिक स्वास्थ्य';
      promptSubjectEn = 'a vibrant happy healthy Indian family smiling with vitality in a clean natural ayurvedic herbal wellness environment';
    }

    const userName = (typeof window.getUserName === 'function' ? window.getUserName() : '') || 'आरोग्यम साथी';
    const userPhone = (typeof window.getUserPhone === 'function' ? window.getUserPhone() : '') || '7974422572';

    const promptText = `Hyper-realistic 8K photorealistic vertical poster of ${promptSubjectEn}. Atmospheric volumetric morning lighting, rich cinematic depth of field, vibrant natural colors. Prominent clean typography banner in golden and bold white Hindi text: "आरोग्यम जैविक क्रांति — 100% शुद्ध परिणाम व खुशहाल किसान!". In the lower third, an elegant frosted-glass portrait card layout: "कृषि सलाहकार: ${userName} | संपर्क: ${userPhone}". Masterpiece photography, Hasselblad medium format camera style, 9:16 vertical ratio.`;

    const title = `🎨 AI पोस्टर प्रॉम्प्ट — ${detectedSubject} (ChatGPT / Gemini / Midjourney)`;
    const body = `🌸 **आपके लिए ${detectedSubject} का 8K अल्ट्रा-एचडी पोस्टर प्रॉम्प्ट तैयार है:**\n\n` +
      `\`\`\`text\n${promptText}\n\`\`\`\n\n` +
      `💡 **पोस्टर 10 सेकंड में कैसे बनाएं:**\n` +
      `1. ऊपर दिए बॉक्स से **'प्रॉम्प्ट कॉपी'** करें।\n` +
      `2. **ChatGPT** या **Google Gemini** ऐप में जाएं और यह प्रॉम्प्ट पेस्ट करके 'Generate' दबाएं।\n` +
      `3. 8K क्वालिटी का सुंदर पोस्टर आपकी आँखों के सामने तैयार होगा!`;

    const chips = [
      { text: '🌾 गेहूं व फसल प्रॉम्प्ट बनाएं', query: 'गेहूं फसल का इमेज प्रॉम्प्ट दो' },
      { text: '🥛 पशुपालन व दूध वृद्धि प्रॉम्प्ट', query: 'पशुपालन दूध वृद्धि का इमेज प्रॉम्प्ट दो' },
      { text: '💼 नेट्सर्फ बिज़नेस पोस्टर प्रॉम्प्ट', query: 'नेट्सर्फ बिज़नेस पोस्टर का इमेज प्रॉम्प्ट दो' }
    ];

    if (typeof window.renderCrispSpecialBox === 'function') {
      window.renderCrispSpecialBox(title, body, chips, 'omni', 'dynamic_image_prompt');
      return true;
    }
    return false;
  }

  // 5. 6 MULTI-PERSONA CONVERSATIONAL TEMPLATES ENGINE
  function formatResponseInPersonaStyle(title, baseContent, styleIndex = 0) {
    const styles = [
      // 0: Rural Friendly (ठेठ किसान मित्र)
      {
        prefix: 'राम-राम भैया! 🙏 खेत-खलिहान और परिवार की भलाई के लिए बिल्कुल सीधी और जमीनी बात:\n\n',
        suffix: '\n\n🌾 *चिंता मत करना भैया, आपकी सखी हर कदम पर साथ है।*'
      },
      // 1: Clinical & Precise (डॉक्टर व वैज्ञानिक)
      {
        prefix: 'नमस्ते! 🩺 वैज्ञानिक दृष्टिकोण और गहन परीक्षण के आधार पर इसका सटीक विश्लेषण:\n\n',
        suffix: '\n\n🔬 *100% वैज्ञानिक व प्रामाणिक परामर्श।*'
      },
      // 2: 1-Minute Action (सीधे 1-2-3 बुलेट पॉइंट्स)
      {
        prefix: '⚡ **सीधे 1-मिनट एक्शन प्लान (Quick Action Steps):**\n\n',
        suffix: '\n\n👉 *आज ही इन कदमों का पालन करें और तुरंत लाभ देखें।*'
      },
      // 3: Dadi Nuskha (दादी का घरेलू व आयुर्वेदिक नुस्खा)
      {
        prefix: '🌿 **दादी माँ का प्रामाणिक घरेलू व प्राकृतिक समाधान:**\n\n',
        suffix: '\n\n👵 *प्रकृति के नियमों का पालन करें, स्वास्थ्य अपने आप लौटेगा।*'
      },
      // 4: Economic & Profit Calculation (बचत व मुनाफा शैली)
      {
        prefix: '💰 **शुद्ध आर्थिक बचत व लाभ का गणित:**\n\n',
        suffix: '\n\n📊 *कम लागत में तीन गुना बचत और अधिक आमदनी।*'
      },
      // 5: Weather & Season Aware (मौसम व रबी अनुकूल)
      {
        prefix: '🌤️ **वर्तमान रबी सीजन व मौसम अनुकूल परामर्श:**\n\n',
        suffix: '\n\n🌡️ *मौसम के अनुसार सही समय पर किया गया कार्य ही सबसे अधिक फल देता है।*'
      }
    ];

    const chosen = styles[styleIndex % styles.length];
    return chosen.prefix + baseContent + chosen.suffix;
  }

  // 6. COMMON WEAKNESS & FATIGUE vs INTIMATE HEALTH SEPARATION
  function handleGeneralFatigueAndWeakness(cleanQ) {
    const q = cleanQ.toLowerCase();
    
    // Explicit Intimate/Sexual terms check
    const isExplicitIntimate = /(?:यौन|शीघ्रपतन|लिंग|धातु|stamina|टाइमिंग|semen|erectile|शिथिलता)/i.test(q);
    if (isExplicitIntimate) return false; // Handled by dedicated confidential handler

    // General fatigue/weakness/dizziness/chakkar
    const isGeneralWeakness = (q.includes('कमजोरी') || q.includes('थकान') || q.includes('चक्कर') || q.includes('kamjori') || q.includes('chakkar')) &&
      !q.includes('फसल') && !q.includes('पौधा');

    if (isGeneralWeakness) {
      const title = '🩺 शारीरिक कमजोरी, चक्कर व थकान — कारण, घरेलू आहार व संपूर्ण पोषण';
      const body = `नमस्ते साथी! 🙏 **शारीरिक कमजोरी, सिर घूमना या जल्दी थकान होने के मुख्य कारण व प्राकृतिक समाधान:**\n\n` +
        `🔍 **1. आम लक्षण व संभावित कारण:**\n` +
        `• **खून (हीमोग्लोबिन) की कमी:** शरीर में ऑक्सीजन न पहुंचने से सीढ़ियां चढ़ने या उठने-बैठने पर आंखों के आगे अंधेरा छाना।\n` +
        `• **ब्लड प्रेशर का उतार-चढ़ाव (BP Dip):** पानी कम पीने या नमक-पानी असंतुलन से अचानक चक्कर आना।\n` +
        `• **पोषक तत्वों (विटामिन B12 व D3) की कमी:** मांसपेशियों और नसों में खिंचाव व सुस्ती।\n\n` +
        `🌿 **2. तुरंत राहत हेतु प्रमाणित घरेलू नुस्खा:**\n` +
        `• 1 गिलास पानी में 1 चुटकी सेंधा नमक, 1 चम्मच मिश्री और आधा नींबू निचोड़कर पिएं (तात्कालिक इलेक्ट्रोलाइट)।\n` +
        `• रात को 5 मुनक्का और 4 भीगे बादाम सुबह चबाकर खाएं। गुड़ और भुने चने का सेवन हीमोग्लोबिन तुरंत बढ़ाता है।\n\n` +
        `💊 **3. संपूर्ण आयुर्वेदिक पोषण (नेचुरामोर समाधान):**\n` +
        `• **नेचुरामोर ओरिजिनल (Naturamore Original 400g - MRP ₹1450):** 1 चम्मच सुबह नाश्ते के बाद दूध से। इसमें 13 विटामिन्स, 10 मिनरल्स और 5 प्रोटीन्स हैं जो नसों की कमजोरी को जड़ से मिटाते हैं। (छूट रेट मात्र ₹1,088)।`;

      const chips = [
        { text: '🩸 डायबिटीज व बीपी डाइट चार्ट देखें', query: 'मधुमेह में क्या खाएं और डाइट चार्ट' },
        { text: '🌿 नेचुरामोर 25% छूट पर कैसे लें?', query: 'आरोग्यम शेयर करके पैसे कैसे कमाएं' },
        { text: '🦴 घुटनों व जोड़ों के दर्द का उपाय', query: 'घुटनों और जोड़ों के दर्द का आयुर्वेदिक इलाज' }
      ];

      if (typeof window.renderCrispSpecialBox === 'function') {
        window.renderCrispSpecialBox(title, body, chips, 'health', 'general_weakness_fatigue');
        return true;
      }
    }

    return false;
  }

  // 7. POTATO PROFILE INTRO REPAIR HELPER (Eliminates 'undefined' permanently)
  function getPotatoSafeIntro() {
    return 'आलू भारत की सबसे लोकप्रिय कंदवर्गीय (Tuber) नकदी फसल है जो 90 से 110 दिनों में पककर तैयार होती है। इसके कंदों के उत्तम आकार और बंपर पैदावार के लिए भुरभुरी मिट्टी, पोटाश और झुलसा रोग से सुरक्षा अनिवार्य है।';
  }

  // 8. MASTER ROUTER FOR KNOWLEDGE VAULT V2
  function handleKnowledgeVaultV2Query(cleanQ, rawQ) {
    if (!cleanQ) return false;

    // 1. Check Livestock Anatomy & Cost Estimate
    if (handleLivestockStomachAndCostEstimate(cleanQ)) return true;

    // 2. Check Updated Master Pricing
    if (handleUpdatedPricingQueries(cleanQ)) return true;

    // 3. Check Dynamic Image Prompt Studio
    if (handleDynamicImagePromptGenerator(cleanQ, rawQ)) return true;

    // 4. Check General Weakness & Fatigue
    if (handleGeneralFatigueAndWeakness(cleanQ)) return true;

    return false;
  }

  // 9. GEMINI 3-TIER TEXT QUERY FALLBACK ENGINE (Constitutional Architecture)
  // Respects SAKHI_GEMINI_MASTER_SWITCH (Admin Switch) & Zero-Egress Rules
  const DEFAULT_GEMINI_KEY = atob('QVEuQWI4Uk42SWVCNkN0N3V0MERrUzJHRkVHOEMxR3p1YUJPdFdMZEEwekZnaUt1LWJORVE=');

  function isGeminiMasterActive() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('SAKHI_GEMINI_MASTER_SWITCH') !== 'OFF';
      }
    } catch (_) { }
    return true;
  }

  function getGeminiApiKey() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('SAKHI_GEMINI_API_KEY') || DEFAULT_GEMINI_KEY;
      }
    } catch (_) { }
    return DEFAULT_GEMINI_KEY;
  }

  function recordGeminiTokens(count) {
    try {
      if (window.SakhiVision && typeof window.SakhiVision.recordTokenUsage === 'function') {
        window.SakhiVision.recordTokenUsage(count, 'chat');
      }
    } catch (_) { }
  }

  async function queryGeminiTextFallback(rawQ, cleanQ, targetDomain) {
    // Rule 1 Check: Gemini Master Switch in Admin must be ON
    if (!isGeminiMasterActive()) {
      console.log('🛡️ [Gemini Fallback Guard] SAKHI_GEMINI_MASTER_SWITCH is OFF. Bypassing Gemini text fallback.');
      return null;
    }

    const q = (rawQ || cleanQ || '').trim();
    if (!q || q.length < 3) return null;

    const apiKey = getGeminiApiKey();
    if (!apiKey) return null;

    // Fast, lightweight and responsive Google Gemini model cascade
    const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    // Dynamic Persona & Salutation Guide based on actual user profile (SAKHI_MANAS.md Protocol)
    let userSalutationRule = 'शुरुआत आत्मीय व सम्मानजनक अभिवादन से करें (जैसे "राम-राम जी!", "नमस्ते जी!")। कभी भी "भाई/बहन" स्लैश न लगाएं।';
    try {
      let prof = {};
      try { prof = JSON.parse(localStorage.getItem('AI_PROFILE') || '{}'); } catch (_) { }
      const rawName = (typeof localStorage !== 'undefined' ? (localStorage.getItem('aarogyam_user_name') || localStorage.getItem('SAKHI_USER_NAME') || prof.name || '') : '').trim();
      const cleanName = rawName.replace(/^(श्री|श्रीमती|सुश्री|डॉ|डॉक्टर|mr|mrs|ms)\.?\s*/gi, '').replace(/\s*(जी|ji|bhai|भाई|didi|दीदी)$/gi, '').trim();
      const gender = (prof.gender || '').toLowerCase();
      
      if (gender === 'female') {
        userSalutationRule = `उपयोगकर्ता महिला हैं${cleanName ? ` (नाम: "${cleanName}")` : ''}। उन्हें सम्मानपूर्वक "नमस्ते ${cleanName ? cleanName + ' दीदी' : 'दीदी / बहन जी'}!" या "राम-राम दीदी!" से संबोधित करें। कभी भी "भाई/बहन" स्लैश न लगाएं।`;
      } else if (gender === 'male' || (cleanName && !['user', 'guest', 'farmer'].includes(cleanName.toLowerCase()))) {
        userSalutationRule = `उपयोगकर्ता पुरुष हैं${cleanName ? ` (नाम: "${cleanName}")` : ''}। उन्हें सम्मानपूर्वक "राम-राम ${cleanName ? cleanName + ' भाई' : 'किसान साथी'}!" या "नमस्ते ${cleanName ? cleanName + ' जी' : 'भाई जी'}!" से संबोधित करें। कभी भी "भाई/बहन" स्लैश न लगाएं।`;
      } else if (cleanName) {
        userSalutationRule = `उपयोगकर्ता का नाम "${cleanName}" है। उन्हें सम्मानपूर्वक "नमस्ते ${cleanName} जी!" या "राम-राम जी!" से संबोधित करें। कभी भी "भाई/बहन" स्लैश न लगाएं।`;
      }
    } catch (_) { }

    const systemInstruction = `आप "आरोग्यम सखी AI" (Aarogyam Sakhi AI) हैं — भारतीय किसानों, पशुपालकों और ग्रामीण परिवारों की आत्मीय, बुद्धिमान और भरोसेमंद डिजिटल सखी।
उपयोगकर्ता के सवाल का जवाब देते समय इन नियमों का अक्षरशः पालन करें:
1. ${userSalutationRule}
2. जवाब को 3 से 4 स्पष्ट, व्यावहारिक और उपयोगी बुलेट पॉइंट्स में समझाएं।
3. कोई अनावश्यक लंबा भाषण, विदेशी इतिहास या अंग्रेजी के कठिन शब्द न लिखें।
4. यदि कृषि, पशुपालन या स्वास्थ्य का विषय हो तो सटीक, सुरक्षित और आजमाया हुआ देसी/वैज्ञानिक उपाय बताएं।`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemInstruction + `\n\nउपयोगकर्ता का प्रश्न: "${q}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 600
      }
    };

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        
        let controller = null;
        let timeoutId = null;
        if (typeof AbortController !== 'undefined') {
          controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), 14000);
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller ? controller.signal : undefined
        });

        if (timeoutId) clearTimeout(timeoutId);

        if (!res.ok) {
          console.warn(`[Gemini Text Fallback] Model ${model} HTTP status ${res.status}`);
          if (res.status === 429) {
            // Rate limit or quota exhausted: exit gracefully
            return null;
          }
          continue; // Try next fallback model
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          const tokens = data.usageMetadata?.totalTokenCount || 350;
          recordGeminiTokens(tokens);
          return {
            source: '🧠 सखी AI (Google Gemini Live)',
            summary: text.trim()
          };
        }
      } catch (err) {
        console.warn(`[Gemini Text Fallback] Error with model ${model}:`, err.message || err);
      }
    }

    return null;
  }

  // Export to Global Window under SAKHI_MANAS.md Protocol
  window.SakhiKnowledgeVaultV2 = {
    handleQuery: handleKnowledgeVaultV2Query,
    catalog: MASTER_CATALOG,
    getPotatoSafeIntro: getPotatoSafeIntro,
    formatPersona: formatResponseInPersonaStyle,
    isGeminiActive: isGeminiMasterActive,
    getGeminiApiKey: getGeminiApiKey,
    queryGeminiTextFallback: queryGeminiTextFallback
  };

  console.log('✅ [Sakhi Knowledge Vault v2.0] Loaded cleanly under SAKHI_MANAS.md Protocol');

})(window, document);
