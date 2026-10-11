/**
 * js/netsurf-products-catalog.js
 * Advanced Dynamic Showcase, Category-Wise Sections, Dropdown Problem Filter, Audio Auto-Play with Floating Speaker Bridge,
 * and 100% Multi-Language PDF Catalog Generator for All Netsurf Products.
 * 100% Connected to data/netsurf-products-master.json and data/netsurf-products-i18n.json (Zero Hardcoding & Full Dynamic Sync).
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
  let masterI18n = null;
  let currentSiteLang = 'hi';
  try { localStorage.removeItem('aim_catalog_lang'); } catch (e) {}

  let masterCatalogSettings = {
    cover_badge: "🌿 100% प्राकृतिक व वैज्ञानिक बायो-टेक्नोलॉजी उत्पाद",
    cover_title: "आरोग्यम भारत - सम्पूर्ण नेट्सर्फ उत्पाद कैटलॉग 2026",
    cover_subtitle: "स्वास्थ्य, जैविक कृषि, पशु पोषण, त्वचा-केश देखभाल एवं पर्यावरण अनुकूल होम केयर के प्रामाणिक समाधान",
    company_profile: "सन 2000 से स्थापित, 26 वर्षों की अटूट विश्वसनीयता और भारत सरकार के विज्ञान एवं प्रौद्योगिकी मंत्रालय (DSIR) द्वारा मान्यता प्राप्त इन-हाउस R&D केंद्र। 25 लाख से अधिक संतुष्ट उपभोक्ताओं का अटूट विश्वास।",
    categories_overview: "प्रमुख श्रेणियां: बायोफिट जैविक कृषि (Biofit Agriculture), बायोफिट पशु पोषण (Cattle Care), नेचुरामोरे न्यूट्रिशन (Naturamore Health), हर्ब्स एंड मोर पर्सनल केयर (Herbs & More) व क्लीन एंड मोर होम केयर (Clean & More)।",
    distributor_heading: "अधिकृत प्रस्तुतकर्ता / वितरक संपर्क (Presented By)",
    order_note: "ऑर्डर देने, डिलीवरी स्थिति या बिज़नेस कंसल्टेंसी हेतु सीधे ऊपर दिए गए नंबर पर संपर्क करें।",
    customer_care_text: "Netsurf Customer Care: 020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
    official_address: "Netsurf Communications Pvt. Ltd., Sr. No. 107, Plot No. 2, Emirus Building, Baner, Pune - 411045, Maharashtra.",
    legal_disclaimer: "वैधानिक सूचना एवं अस्वीकरण: इस कैटलॉग में दी गई समस्त जानकारी, उत्पाद विनिर्देश, घटक व खुराक आधिकारिक निर्माता पोर्टल (netsurfdirect.com) के सार्वजनिक लिटरेचर से संदर्भ हेतु ली गई है। Aarogyam India एक स्वतंत्र अधिकृत वितरक नेटवर्क है और प्रत्यक्ष विनिर्माण दायित्व का दावा नहीं करता।"
  };

  let currentCategory = 'all';
  let currentProblem = 'all';
  let currentSearchQuery = '';

  // 100% Comprehensive Multi-Language Dictionary for Catalog UI & PDF (7 Languages)
  const I18N_CATALOG = {
    hi: {
      coverBadge: "🌿 100% प्राकृतिक व वैज्ञानिक बायो-टेक्नोलॉजी उत्पाद",
      title: "सम्पूर्ण नेटसर्फ उत्पाद कैटलॉग 2026",
      subtitle: "स्वास्थ्य, जैविक कृषि, पशु पोषण, त्वचा-केश देखभाल एवं पर्यावरण अनुकूल होम केयर",
      slogan: "सेहत • बरकत • मुस्कुराहट",
      sloganTagline: "26 वर्षों का अटूट विश्वास • DSIR मान्यता प्राप्त इन-हाउस R&D केंद्र (सन 2000 से स्थापित)",
      dateLabel: "दिनांक:",
      totalProductsLabel: "कुल उत्पाद:",
      coverCompanyTitle: "नेटसर्फ डायरेक्ट (Netsurf Direct) - कम्पनी प्रोफाइल",
      coverCompanyDesc: "सन 2000 से स्थापित, 26 वर्षों की अटूट विश्वसनीयता और भारत सरकार के विज्ञान एवं प्रौद्योगिकी मंत्रालय (DSIR) द्वारा मान्यता प्राप्त इन-हाउस R&D केंद्र। 25 लाख से अधिक संतुष्ट उपभोक्ताओं का अटूट विश्वास।",
      categoryIntroTitle: "प्रमुख उत्पाद श्रेणियां:",
      categoryIntro: "बायोफिट जैविक कृषि (Biofit), पशु पोषण CFC (डेयरी उत्पादन), नेचुरामोरे न्यूट्रास्यूटिकल (स्वास्थ्य), हर्ब्स एंड मोर (आयुर्वेदिक पर्सनल केयर) एवं क्लीन एंड मोर (इको-होम केयर)।",
      mrpLabel: "MRP:",
      offerLabel: "ऑफर रेट:",
      discountBadge: "छूट",
      packSizeLabel: "पैकिंग:",
      ingLabel: "🌱 मुख्य घटक:",
      doseLabel: "📋 उपयोग विधि व खुराक:",
      precautionsLabel: "⚠️ सावधानियां:",
      genuineBadge: "100% प्रामाणिक व प्रमाणित",
      distributorTitle: "अधिकृत प्रस्तुतकर्ता एवं स्वास्थ्य परामर्शदाता (Presented By):",
      phoneWaLabel: "📞 फोन व WhatsApp:",
      orderNote: "ऑर्डर देने, डिलीवरी स्थिति या व्यक्तिगत खुराक सलाह हेतु सीधे ऊपर दिए गए नंबर पर संपर्क करें।",
      howToOrderTitle: "ऑर्डर व सेवा प्रक्रिया:",
      howToOrderStep1: "1. अपनी आवश्यकतानुसार उत्पाद चुनें",
      howToOrderStep2: "2. ऊपर दिए गए नंबर पर कॉल या व्हाट्सएप्प करें",
      howToOrderStep3: "3. सुरक्षित होम डिलीवरी व निरंतर मार्गदर्शन पाएं",
      corporateAddressTitle: "कॉर्पोरेट पंजीकृत कार्यालय:",
      corporateAddressText: "Netsurf Communications Pvt. Ltd., Sr. No. 107, Plot No. 2, Emirus Building, Baner, Pune - 411045, Maharashtra, India.",
      customerCareLabel: "कंपनी हेल्पलाइन:",
      customerCareText: "020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
      disclaimerTitle: "वैधानिक सूचना एवं सुरक्षा अस्वीकरण (Legal Disclaimer):",
      disclaimerText: "इस कैटलॉग में दी गई समस्त जानकारी, उत्पाद विनिर्देश, घटक व खुराक आधिकारिक निर्माता पोर्टल (netsurfdirect.com) के सार्वजनिक लिटरेचर से संदर्भ व जन-सुविधा हेतु ली गई है। AAROGYAM INDIA एक स्वतंत्र अधिकृत वितरक नेटवर्क है और प्रत्यक्ष विनिर्माण दायित्व का दावा नहीं करता। आधिकारिक कॉर्पोरेट जानकारी, बैच व गुणवत्ता प्रमाणन हेतु निर्माता Netsurf Communications Pvt. Ltd. से संपर्क करें। किसी भी गंभीर स्वास्थ्य विकार में उपयोग से पूर्व चिकित्सक से परामर्श लें।",
      helplineLabel: "AAROGYAM INDIA सपोर्ट:",
      footerMission: "AAROGYAM INDIA • Digital Health & Agro Mission • www.aarogyamindia.online",
      presentedByHeader: "प्रस्तुतकर्ता:",
      officialPartner: "आधिकारिक पार्टनर",
      pageLabel: "पृष्ठ",
      genuineFooter: "100% प्रामाणिक व DSIR मान्यता प्राप्त उत्पाद",
      helplineFooter: "24×7 सहायता: +91 79744 22572 • www.aarogyamindia.online",
      categoryBannerPrefix: "श्रेणी:",
      productsCountSuffix: "उत्पाद",
      viewOnlyCatBtn: "केवल यह श्रेणी देखें",
      categories: {
        agri: "🌾 कृषि बायोफिट (Biofit)",
        cattle: "🐄 पशु पोषण (Biofit Cattle Care)",
        health: "❤️ स्वास्थ्य नेचुरामोरे (Naturamore)",
        herbs_more: "🌿 पर्सनल केयर (Herbs & More)",
        clean_more: "🏡 क्लीन एंड मोर (Clean & More)"
      }
    },
    en: {
      coverBadge: "🌿 100% Natural & Bio-Technology Formulations",
      title: "Complete Netsurf Products Catalog 2026",
      subtitle: "Health Wellness, Organic Agriculture, Cattle Nutrition, Skin & Hair, Eco-Home Care",
      slogan: "Health • Prosperity • Happiness",
      sloganTagline: "26 Years of Corporate Trust • DSIR Recognized In-House R&D Center (Since 2000)",
      dateLabel: "Date:",
      totalProductsLabel: "Total Products:",
      coverCompanyTitle: "Netsurf Direct - Corporate Profile",
      coverCompanyDesc: "Established in 2000, 26 years of trust with in-house DSIR recognized R&D center by the Ministry of Science & Technology, Govt. of India. Over 2.5 million satisfied consumers across India.",
      categoryIntroTitle: "Core Product Categories:",
      categoryIntro: "Biofit (Organic Agriculture), Pet-Vet CFC (Cattle Care & Dairy), Naturamore (Herbal Nutraceuticals), Herbs & More (Ayurvedic Personal Care), Clean & More (Eco Home Care).",
      mrpLabel: "MRP:",
      offerLabel: "Offer Price:",
      discountBadge: "OFF",
      packSizeLabel: "Pack Size:",
      ingLabel: "🌱 Key Ingredients:",
      doseLabel: "📋 Usage & Dosage:",
      precautionsLabel: "⚠️ Precautions:",
      genuineBadge: "100% GENUINE & CERTIFIED",
      distributorTitle: "Authorized Presenter & Wellness Consultant (Presented By):",
      phoneWaLabel: "📞 Phone & WhatsApp:",
      orderNote: "For product orders, doorstep delivery, or personalized dosage consultation, contact directly on the number above.",
      howToOrderTitle: "Easy Ordering Process:",
      howToOrderStep1: "1. Select required products and pack sizes",
      howToOrderStep2: "2. Call or WhatsApp on the contact number above",
      howToOrderStep3: "3. Receive fast, genuine home delivery with full support",
      corporateAddressTitle: "Corporate Registered Office:",
      corporateAddressText: "Netsurf Communications Pvt. Ltd., Sr. No. 107, Plot No. 2, Emirus Building, Baner, Pune - 411045, Maharashtra, India.",
      customerCareLabel: "Company Helpline:",
      customerCareText: "020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
      disclaimerTitle: "Legal Disclaimer & Independent Distributor Notice:",
      disclaimerText: "All product specifications, active ingredients, dosage recommendations, and benefits are compiled from official manufacturer literature at netsurfdirect.com. Aarogyam India functions as an independent distributor network and does not manufacture products. For corporate compliance, manufacturing batches, or certificates, contact Netsurf Communications Pvt. Ltd. Consult a medical or agricultural specialist before use.",
      helplineLabel: "Aarogyam India Support:",
      footerMission: "Aarogyam India Digital Health & Organic Mission • www.aarogyamindia.online",
      presentedByHeader: "Presented By:",
      officialPartner: "OFFICIAL PARTNER",
      pageLabel: "Page",
      genuineFooter: "100% Genuine & DSIR Recognized Products",
      helplineFooter: "24×7 Support: +91 79744 22572 • www.aarogyamindia.online",
      categoryBannerPrefix: "Category:",
      productsCountSuffix: "Products",
      viewOnlyCatBtn: "View This Category Only",
      categories: {
        agri: "🌾 Biofit Organic Agriculture",
        cattle: "🐄 Cattle Care & Dairy Nutrition",
        health: "❤️ Naturamore Health & Wellness",
        herbs_more: "🌿 Herbs & More Personal Care",
        clean_more: "🏡 Clean & More Eco Home Care"
      }
    },
    gu: {
      coverBadge: "🌿 100% કુદરતી અને વૈજ્ઞાનિક બાયો-ટેકનોલોજી ઉત્પાદનો",
      title: "સંપૂર્ણ નેટસર્ફ પ્રોડક્ટ કેટેલોગ 2026",
      subtitle: "સ્વાસ્થ્ય, જૈવિક ખેતી, પશુ પોષણ, ત્વચા-વાળ સંભાળ અને ઇકો-હોમ કેર",
      slogan: "સ્વાસ્થ્ય • બરકત • સ્મિત",
      sloganTagline: "26 વર્ષનો અતૂટ વિશ્વાસ • ભારત સરકાર માન્ય DSIR ઇન-હાઉસ R&D કેન્દ્ર",
      dateLabel: "તારીખ:",
      totalProductsLabel: "કુલ ઉત્પાદનો:",
      coverCompanyTitle: "નેટસર્ફ ડાયરેક્ટ - કંપની પ્રોફાઇલ",
      coverCompanyDesc: "વર્ષ 2000 થી સ્થાપિત, 26 વર્ષનો અતૂટ વિશ્વાસ અને ભારત સરકારના વિજ્ઞાન અને ટેકનોલોજી મંત્રાલય (DSIR) માન્ય ઇન-હાઉસ R&D કેન્દ્ર. 25 લાખથી વધુ સંતુષ્ટ ગ્રાહકો.",
      categoryIntroTitle: "મુખ્ય ઉત્પાદન શ્રેણીઓ:",
      categoryIntro: "બાયોફિટ કૃષિ (જૈવિક ખેતી), પશુ પોષણ સીએફસી (ડેરી), નેચુરામોર (આરોગ્ય), હર્બ્સ એન્ડ મોર (પર્સનલ કેર), ક્લીન એન્ડ મોર (હોમ કેર).",
      mrpLabel: "MRP:",
      offerLabel: "ઓફર ભાવ:",
      discountBadge: "છૂટ",
      packSizeLabel: "પેકિંગ:",
      ingLabel: "🌱 મુખ્ય ઘટકો:",
      doseLabel: "📋 ઉપયોગ અને માત્રા:",
      precautionsLabel: "⚠️ સાવચેતીઓ:",
      genuineBadge: "100% પ્રમાણિત અને અસલી",
      distributorTitle: "અધિકૃત પ્રસ્તુતકર્તા અને સલાહકાર (Presented By):",
      phoneWaLabel: "📞 ફોન અને WhatsApp:",
      orderNote: "ઉત્પાદનોના ઓર્ડર, હોમ ડિલિવરી અને સચોટ સલાહ માટે ઉપર આપેલા નંબર પર સીધો સંપર્ક કરો.",
      howToOrderTitle: "ઓર્ડર આપવાની પ્રક્રિયા:",
      howToOrderStep1: "1. તમારી જરૂરિયાત મુજબ ઉત્પાદન પસંદ કરો",
      howToOrderStep2: "2. ઉપર આપેલા નંબર પર કોલ અથવા વોટ્સએપ કરો",
      howToOrderStep3: "3. સુરક્ષિત હોમ ડિલિવરી મેળવો",
      corporateAddressTitle: "કોર્પોરેટ નોંધાયેલ કાર્યાલય:",
      corporateAddressText: "Netsurf Communications Pvt. Ltd., Baner, Pune - 411045, Maharashtra, India.",
      customerCareLabel: "કંપની હેલ્પલાઇન:",
      customerCareText: "020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
      disclaimerTitle: "કાનૂની સૂચના અને ડિસ્ક્લેમર (Legal Disclaimer):",
      disclaimerText: "તમામ ઉત્પાદન માહિતી અધિકૃત પોર્ટલ netsurfdirect.com પરથી સંદર્ભ માટે લેવામાં આવી છે. આરોગ્યમ ઇન્ડિયા એક સ્વતંત્ર વિતરક નેટવર્ક છે. વિગતો માટે Netsurf Communications Pvt. Ltd. નો સંપર્ક કરો.",
      helplineLabel: "આરોગ્યમ ઇન્ડિયા હેલ્પલાઇન:",
      footerMission: "આરોગ્યમ ઇન્ડિયા ડિજિટલ હેલ્થ અને જૈવિક મિશન • www.aarogyamindia.online",
      presentedByHeader: "પ્રસ્તુતકર્તા:",
      officialPartner: "સત્તાવાર ભાગીદાર",
      pageLabel: "પૃષ્ઠ",
      genuineFooter: "100% પ્રમાણિત અને DSIR માન્ય ઉત્પાદનો",
      helplineFooter: "24×7 સહાય: +91 79744 22572 • www.aarogyamindia.online",
      categoryBannerPrefix: "શ્રેણી:",
      productsCountSuffix: "ઉત્પાદનો",
      viewOnlyCatBtn: "માત્ર આ શ્રેણી જુઓ",
      categories: {
        agri: "🌾 કૃષિ બાયોફિટ (Biofit Agriculture)",
        cattle: "🐄 પશુ પોષણ અને ડેરી (Cattle Care)",
        health: "❤️ નેચુરામોર આરોગ્ય (Naturamore)",
        herbs_more: "🌿 હર્બ્સ એન્ડ મોર (Herbs & More)",
        clean_more: "🏡 ક્લીન એન્ડ મોર (Clean & More)"
      }
    },
    mr: {
      coverBadge: "🌿 100% नैसर्गिक व वैज्ञानिक जैव-तंत्रज्ञान उत्पादने",
      title: "संपूर्ण नेटसर्फ उत्पादन कॅटलॉग 2026",
      subtitle: "आरोग्य, सेंद्रिय शेती, पशु पोषण, त्वचा-केस काळजी व पर्यावरणपूरक होम केअर",
      slogan: "आरोग्य • भरभराट • आनंद",
      sloganTagline: "26 वर्षांचा अतूट विश्वास • भारत सरकार मान्यताप्राप्त DSIR इन-हाउस R&D केंद्र",
      dateLabel: "दिनांक:",
      totalProductsLabel: "एकूण उत्पादने:",
      coverCompanyTitle: "नेटसर्फ डायरेक्ट - कंपनी परिचय",
      coverCompanyDesc: "सन 2000 पासून स्थापित, 26 वर्षांचा अतूट विश्वास आणि भारत सरकारच्या विज्ञान व तंत्रज्ञान मंत्रालय (DSIR) मान्यताप्राप्त इन-हाउस R&D केंद्र. 25 लाखांहून अधिक समाधानी ग्राहक.",
      categoryIntroTitle: "प्रमुख उत्पादन वर्गवारी:",
      categoryIntro: "बायोफिट शेती (सेंद्रिय उत्पादने), पशु पोषण CFC (दुग्ध विकास), नॅचुरामोर (आरोग्य पूरक), हर्ब्स अँड मोअर (सौंदर्य काळजी) व क्लीन अँड मोअर (स्वच्छता).",
      mrpLabel: "MRP:",
      offerLabel: "ऑफर दर:",
      discountBadge: "सूट",
      packSizeLabel: "पॅकिंग:",
      ingLabel: "🌱 मुख्य घटक:",
      doseLabel: "📋 वापर व डोस:",
      precautionsLabel: "⚠️ काळजी घ्या:",
      genuineBadge: "100% अस्सल व प्रमाणित",
      distributorTitle: "अधिकृत प्रस्तुतकर्ता व आरोग्य सल्लागार (Presented By):",
      phoneWaLabel: "📞 फोन व WhatsApp:",
      orderNote: "उत्पादनांची ऑर्डर, होम डिलिव्हरी व योग्य सल्ल्यासाठी थेट वरील क्रमांकावर संपर्क साधा.",
      howToOrderTitle: "ऑर्डर व सेवा प्रक्रिया:",
      howToOrderStep1: "1. आवश्यक उत्पादने निवडा",
      howToOrderStep2: "2. वरील क्रमांकावर कॉल किंवा व्हॉट्सॲप करा",
      howToOrderStep3: "3. खात्रीशीर व वेगवान होम डिलिव्हरी मिळवा",
      corporateAddressTitle: "कॉर्पोरेट नोंदणीकृत कार्यालय:",
      corporateAddressText: "Netsurf Communications Pvt. Ltd., Baner, Pune - 411045, Maharashtra, India.",
      customerCareLabel: "कंपनी हेल्पलाइन:",
      customerCareText: "020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
      disclaimerTitle: "वैधानिक सूचना व अस्वीकरण (Legal Disclaimer):",
      disclaimerText: "या कॅटलॉगमधील सर्व माहिती अधिकृत netsurfdirect.com वरून संकलित केली आहे. आरोग्यम इंडिया स्वतंत्र वितरक नेटवर्क आहे. कायदेशीर व गुणवत्ता तपासणीसाठी Netsurf Communications Pvt. Ltd. शी संपर्क साधा.",
      helplineLabel: "आरोग्यम इंडिया सपोर्ट:",
      footerMission: "आरोग्यम इंडिया डिजिटल आरोग्य व सेंद्रिय शेती मिशन • www.aarogyamindia.online",
      presentedByHeader: "प्रस्तुतकर्ता:",
      officialPartner: "अधिकृत भागीदार",
      pageLabel: "पान",
      genuineFooter: "100% अस्सल व DSIR मान्यताप्राप्त उत्पादने",
      helplineFooter: "24×7 मदत: +91 79744 22572 • www.aarogyamindia.online",
      categoryBannerPrefix: "वर्गवारी:",
      productsCountSuffix: "उत्पादने",
      viewOnlyCatBtn: "फक्त ही वर्गवारी पहा",
      categories: {
        agri: "🌾 कृषी बायोफिट (Biofit Agriculture)",
        cattle: "🐄 पशु पोषण व दुग्ध व्यवसाय (Cattle Care)",
        health: "❤️ नॅचुरामोर आरोग्य (Naturamore)",
        herbs_more: "🌿 हर्ब्स अँड मोअर (Herbs & More)",
        clean_more: "🏡 क्लीन अँड मोअर (Clean & More)"
      }
    },
    ta: {
      coverBadge: "🌿 100% இயற்கை மற்றும் உயிரி தொழில்நுட்ப தயாரிப்புகள்",
      title: "முழுமையான நெட்ஸர்ப் தயாரிப்புகள் பட்டியல் 2026",
      subtitle: "ஆரோக்கியம், இயற்கை விவசாயம், கால்நடை ஊட்டச்சத்து, தனிநபர் பராமரிப்பு, வீட்டுப் பராமரிப்பு",
      slogan: "ஆரோக்கியம் • செழிப்பு • புன்னகை",
      sloganTagline: "26 ஆண்டுகால அசைக்க முடியாத நம்பிக்கை • DSIR அங்கீகரிக்கப்பட்ட R&D மையம்",
      dateLabel: "தேதி:",
      totalProductsLabel: "மொத்த தயாரிப்புகள்:",
      coverCompanyTitle: "நெட்ஸர்ப் டைரக்ட் - நிறுவன விவரம்",
      coverCompanyDesc: "2000 முதல் 26 ஆண்டுகால நம்பிக்கை. இந்திய அறிவியல் & தொழில்நுட்ப அமைச்சகத்தின் (DSIR) அங்கீகரிக்கப்பட்ட சொந்த R&D மையம். 2.5 மில்லியனுக்கும் அதிகமான திருப்தியான நுகர்வோர்.",
      categoryIntroTitle: "முக்கிய தயாரிப்பு பிரிவுகள்:",
      categoryIntro: "பயோஃபிட் இயற்கை விவசாயம், கால்நடை ஊட்டச்சத்து CFC, நேச்சுராமோர் ஆரோக்கியம், ஹெர்ப்ஸ் & மோர், கிளீன் & மோர்.",
      mrpLabel: "MRP:",
      offerLabel: "சலுகை விலை:",
      discountBadge: "தள்ளுபடி",
      packSizeLabel: "அளவு:",
      ingLabel: "🌱 முக்கிய மூலப்பொருட்கள்:",
      doseLabel: "📋 பயன்படுத்தும் முறை & அளவு:",
      precautionsLabel: "⚠️ முன்னெச்சரிக்கைகள்:",
      genuineBadge: "100% அசல் மற்றும் சான்றளிக்கப்பட்டவை",
      distributorTitle: "அங்கீகரிக்கப்பட்ட ஆலோசகர் & வழங்குபவர் (Presented By):",
      phoneWaLabel: "📞 தொலைபேசி & WhatsApp:",
      orderNote: "தயாரிப்புகளை ஆர்டர் செய்ய, வீட்டிற்கே டெலிவரி பெற மற்றும் ஆலோசனைக்கு மேலே உள்ள எண்ணைத் தொடர்பு கொள்ளவும்.",
      howToOrderTitle: "ஆர்டர் செய்யும் முறை:",
      howToOrderStep1: "1. தயாரிப்புகளைத் தேர்ந்தெடுக்கவும்",
      howToOrderStep2: "2. மேலே உள்ள எண்ணுக்கு கால் அல்லது வாட்ஸ்அப் செய்யவும்",
      howToOrderStep3: "3. பாதுகாப்பான டெலிவரி பெறவும்",
      corporateAddressTitle: "கார்ப்பரேட் பதிவு செய்யப்பட்ட அலுவலகம்:",
      corporateAddressText: "Netsurf Communications Pvt. Ltd., Baner, Pune - 411045, Maharashtra, India.",
      customerCareLabel: "நிறுவன உதவி எண்:",
      customerCareText: "020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
      disclaimerTitle: "சட்ட அறிவிப்பு மற்றும் மறுப்பு (Legal Disclaimer):",
      disclaimerText: "அனைத்து விவரங்களும் netsurfdirect.com அதிகாரப்பூர்வ தளத்திலிருந்து எடுக்கப்பட்டது. Aarogyam India ஒரு சுயாதீன விநியோகஸ்தர் நெட்வொர்க். தயாரிப்பு தொடர்பான விவரங்களுக்கு Netsurf Communications Pvt. Ltd. ஐ அணுகவும்.",
      helplineLabel: "ஆரோக்யம் இந்தியா உதவி எண்:",
      footerMission: "ஆரோக்யம் இந்தியா டிஜிட்டல் நல மற்றும் இயற்கை இயக்கம் • www.aarogyamindia.online",
      presentedByHeader: "வழங்குபவர்:",
      officialPartner: "அதிகாரப்பூர்வ கூட்டாளர்",
      pageLabel: "பக்கம்",
      genuineFooter: "100% அசல் மற்றும் DSIR அங்கீகரிக்கப்பட்ட தயாரிப்புகள்",
      helplineFooter: "24×7 ஆதரவு: +91 79744 22572 • www.aarogyamindia.online",
      categoryBannerPrefix: "பிரிவு:",
      productsCountSuffix: "தயாரிப்புகள்",
      viewOnlyCatBtn: "இந்த பிரிவை மட்டும் காண்க",
      categories: {
        agri: "🌾 பயோஃபிட் விவசாயம் (Biofit Agriculture)",
        cattle: "🐄 கால்நடை பராமரிப்பு & பால் வளம் (Cattle Care)",
        health: "❤️ நேச்சுராமோர் ஆரோக்கியம் (Naturamore)",
        herbs_more: "🌿 ஹெர்ப்ஸ் & மோர் (Herbs & More)",
        clean_more: "🏡 கிளீன் & மோர் (Clean & More)"
      }
    },
    te: {
      coverBadge: "🌿 100% సహజ మరియు బయో-టెక్నాలజీ ఉత్పత్తులు",
      title: "సంపూర్ణ నెట్‌సర్ఫ్ ఉత్పత్తుల కేటలాగ్ 2026",
      subtitle: "ఆరోగ్యం, సేంద్రీయ వ్యవసాయం, పశు పోషణ, చర్మ-జుట్టు సంరక్షణ మరియు హోమ్ కేర్",
      slogan: "ఆరోగ్యం • శ్రేయస్సు • చిరునవ్వు",
      sloganTagline: "26 సంవత్సరాల అచంచల విశ్వాసం • DSIR గుర్తింపు పొందిన స్వంత R&D కేంద్రం",
      dateLabel: "తేదీ:",
      totalProductsLabel: "మొత్తం ఉత్పత్తులు:",
      coverCompanyTitle: "నెట్‌సర్ఫ్ డైరెక్ట్ - కంపెనీ ప్రొఫైల్",
      coverCompanyDesc: "2000 నుండి 26 సంవత్సరాల తిరుగులేని నమ్మకం. భారత ప్రభుత్వ DSIR గుర్తింపు పొందిన స్వంత R&D కేంద్రం. 25 లక్షలకు పైగా సంతృప్తి చెందిన వినియోగదారులు.",
      categoryIntroTitle: "ప్రధాన ఉత్పత్తుల విభాగాలు:",
      categoryIntro: "బయోఫిట్ వ్యవసాయం (సేంద్రీయ సాగు), పశు పోషణ CFC (పాడి), నేచురామోర్ (ఆరోగ్యం), హెర్బ్స్ & మోర్, క్లీన్ & మోర్.",
      mrpLabel: "MRP:",
      offerLabel: "ఆఫర్ ధర:",
      discountBadge: "రాయితీ",
      packSizeLabel: "ప్యాకింగ్:",
      ingLabel: "🌱 ముఖ్య పదార్థాలు:",
      doseLabel: "📋 వినియోగం & మోతాదు:",
      precautionsLabel: "⚠️ జాగ్రత్తలు:",
      genuineBadge: "100% నిజమైన & ధృవీకరించబడినవి",
      distributorTitle: "అధీకృత సమర్పకుడు & ఆరోగ్య సలహాదారు (Presented By):",
      phoneWaLabel: "📞 ఫోన్ & WhatsApp:",
      orderNote: "ఉత్పత్తుల ఆర్డర్, హోమ్ డెలివరీ మరియు సలహా కొరకు నేరుగా పైన పేర్కొన్న నంబర్‌ను సంప్రదించండి.",
      howToOrderTitle: "ఆర్డర్ ప్రక్రియ:",
      howToOrderStep1: "1. కావలసిన ఉత్పత్తులను ఎంచుకోండి",
      howToOrderStep2: "2. పై నంబర్‌కు కాల్ లేదా వాట్సాప్ చేయండి",
      howToOrderStep3: "3. హోమ్ డెలివరీ పొందండి",
      corporateAddressTitle: "కార్పొరేట్ నమోదిత కార్యాలయం:",
      corporateAddressText: "Netsurf Communications Pvt. Ltd., Baner, Pune - 411045, Maharashtra, India.",
      customerCareLabel: "కంపెనీ హెల్ప్‌లైన్:",
      customerCareText: "020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
      disclaimerTitle: "చట్టపరమైన సమాచారం & నిరాకరణ (Legal Disclaimer):",
      disclaimerText: "సమాచారం netsurfdirect.com నుండి సేకరించబడింది. Aarogyam India స్వతంత్ర పంపిణీదారు నెట్‌వర్క్. Netsurf Communications Pvt. Ltd. తో సంప్రదించండి.",
      helplineLabel: "ఆరోగ్యం ఇండియా సపోర్ట్:",
      footerMission: "ఆరోగ్యం ఇండియా డిజిటల్ హెల్త్ & సేంద్రీయ మిషన్ • www.aarogyamindia.online",
      presentedByHeader: "సమర్పకులు:",
      officialPartner: "అధికారిక భాగస్వామి",
      pageLabel: "పేజీ",
      genuineFooter: "100% నిజమైన మరియు DSIR గుర్తింపు పొందిన ఉత్పత్తులు",
      helplineFooter: "24×7 సహాయం: +91 79744 22572 • www.aarogyamindia.online",
      categoryBannerPrefix: "విభాగం:",
      productsCountSuffix: "ఉత్పత్తులు",
      viewOnlyCatBtn: "ఈ విభాగాన్ని మాత్రమే చూడండి",
      categories: {
        agri: "🌾 బయోఫిట్ వ్యవసాయం (Biofit Agriculture)",
        cattle: "🐄 పశు పోషణ & పాడి (Cattle Care)",
        health: "❤️ నేచురామోర్ ఆరోగ్యం (Naturamore)",
        herbs_more: "🌿 హెర్బ్స్ & మోర్ (Herbs & More)",
        clean_more: "🏡 క్లీన్ & మోర్ (Clean & More)"
      }
    },
        pa: {
      coverBadge: "🌿 100% ਕੁਦਰਤੀ ਅਤੇ ਵਿਗਿਆਨਕ ਬਾਇਓ-ਤਕਨਾਲੋਜੀ ਉਤਪਾਦ",
      title: "ਸੰਪੂਰਨ ਨੈੱਟਸਰਫ ਉਤਪਾਦ ਕੈਟਾਲਾਗ 2026",
      subtitle: "ਸਿਹਤ, ਜੈਵਿਕ ਖੇਤੀਬਾੜੀ, ਪਸ਼ੂ ਪੋਸ਼ਣ, ਚਮੜੀ-ਵਾਲਾਂ ਦੀ ਦੇਖਭਾਲ ਅਤੇ ਈਕੋ ਹੋਮ ਕੇਅਰ",
      slogan: "ਸਿਹਤ • ਬਰਕਤ • ਮੁਸਕਰਾਹਟ",
      sloganTagline: "26 ਸਾਲਾਂ ਦਾ ਅਟੁੱਟ ਵਿਸ਼ਵਾਸ • DSIR ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਇਨ-ਹਾਊਸ R&D ਕੇਂਦਰ (ਸੰਨ 2000 ਤੋਂ ਸਥਾਪਿਤ)",
      dateLabel: "ਮਿਤੀ:",
      totalProductsLabel: "ਕੁੱਲ ਉਤਪਾਦ:",
      coverCompanyTitle: "ਨੈੱਟਸਰਫ ਡਾਇਰੈਕਟ (Netsurf Direct) - ਕੰਪਨੀ ਪ੍ਰੋਫਾਈਲ",
      coverCompanyDesc: "ਸੰਨ 2000 ਤੋਂ ਸਥਾਪਿਤ, 26 ਸਾਲਾਂ ਦੀ ਅਟੁੱਟ ਭਰੋਸੇਯੋਗਤਾ ਅਤੇ ਭਾਰਤ ਸਰਕਾਰ ਦੇ ਵਿਗਿਆਨ ਅਤੇ ਤਕਨਾਲੋਜੀ ਮੰਤਰਾਲੇ (DSIR) ਦੁਆਰਾ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਇਨ-ਹਾਊਸ R&D ਲੈਬਜ਼। 25 ਲੱਖ ਤੋਂ ਵੱਧ ਸੰਤੁਸ਼ਟ ਪਰਿਵਾਰਾਂ ਦਾ ਵਿਸ਼ਵਾਸ।",
      categoryIntroTitle: "ਮੁੱਖ ਉਤਪਾਦ ਸ਼੍ਰੇਣੀਆਂ:",
      categoryIntro: "ਬਾਇਓਫਿਟ ਜੈਵਿਕ ਖੇਤੀਬਾੜੀ (Biofit), ਪਸ਼ੂ ਪੋਸ਼ਣ CFC (ਡੇਅਰੀ ਉਤਪਾਦਨ), ਨੈਚੁਰਾਮੋਰ ਨਿਊਟਰਾਸਿਊਟੀਕਲਜ਼ (ਸਿਹਤ), ਹਰਬਸ ਐਂਡ ਮੋਰ (ਆਯੁਰਵੈਦਿਕ ਪਰਸਨਲ ਕੇਅਰ) ਅਤੇ ਕਲੀਨ ਐਂਡ ਮੋਰ (ਈਕੋ ਹੋਮ ਕੇਅਰ)।",
      mrpLabel: "MRP:",
      offerLabel: "ਆਫਰ ਰੇਟ:",
      discountBadge: "ਛੋਟ",
      packSizeLabel: "ਪੈਕਿੰਗ:",
      ingLabel: "🌱 ਮੁੱਖ ਸਮੱਗਰੀ:",
      doseLabel: "📋 ਵਰਤੋਂ ਵਿਧੀ ਤੇ ਖੁਰਾਕ:",
      precautionsLabel: "⚠️ ਸਾਵਧਾਨੀਆਂ:",
      genuineBadge: "100% ਪ੍ਰਮਾਣਿਕ ਤੇ ਪ੍ਰਮਾਣਿਤ",
      distributorTitle: "ਅਧਿਕਾਰਤ ਪੇਸ਼ਕਾਰ ਅਤੇ ਸਿਹਤ ਸਲਾਹਕਾਰ (Presented By):",
      phoneWaLabel: "📞 ਫ਼ੋਨ ਤੇ WhatsApp:",
      orderNote: "ਆਰਡਰ ਦੇਣ, ਡਿਲੀਵਰੀ ਸਥਿਤੀ ਜਾਂ ਨਿੱਜੀ ਖੁਰਾਕ ਸਲਾਹ ਲਈ ਸਿੱਧਾ ਉੱਪਰ ਦਿੱਤੇ ਨੰਬਰ ਤੇ ਸੰਪਰਕ ਕਰੋ।",
      howToOrderTitle: "ਆਰਡਰ ਕਰਨ ਦਾ ਤਰੀਕਾ:",
      howToOrderStep1: "1. ਆਪਣੀ ਪਸੰਦ ਦਾ ਉਤਪਾਦ ਚੁਣੋ",
      howToOrderStep2: "2. ਉੱਪਰ ਦਿੱਤੇ ਮੋਬਾਈਲ ਨੰਬਰ 'ਤੇ ਕਾਲ ਜਾਂ ਵਟਸਐਪ ਕਰੋ",
      howToOrderStep3: "3. ਘਰ ਬੈਠੇ ਤੇਜ਼ ਤੇ ਸੁਰੱਖਿਅਤ ਡਿਲੀਵਰੀ ਪ੍ਰਾਪਤ ਕਰੋ",
      corporateAddressTitle: "ਰਜਿਸਟਰਡ ਕਾਰਪੋਰੇਟ ਦਫ਼ਤਰ:",
      customerCareLabel: "ਕੰਪਨੀ ਹੈਲਪਲਾਈਨ:",
      disclaimerTitle: "ਕਾਨੂੰਨੀ ਬੇਦਾਅਵਾ (Legal Disclaimer):",
      disclaimerText: "ਸਮੁੱਚੀ ਜਾਣਕਾਰੀ netsurfdirect.com ਤੋਂ ਪ੍ਰਮਾਣਿਤ ਹੈ। AAROGYAM INDIA ਇੱਕ ਸੁਤੰਤਰ ਵਿਤਰਕ ਨੈੱਟਵਰਕ ਹੈ। ਵਧੇਰੇ ਜਾਣਕਾਰੀ ਲਈ Netsurf Communications Pvt. Ltd. ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      helplineLabel: "AAROGYAM INDIA Support:",
      footerMission: "AAROGYAM INDIA • Digital Health & Agro Mission • www.aarogyamindia.online",
      corporateAddressText: "ਨੈੱਟਸਰਫ ਕਮਿਊਨੀਕੇਸ਼ਨਜ਼ ਪ੍ਰਾਈਵੇਟ ਲਿਮਿਟੇਡ, ਨੈੱਟਸਰਫ ਹਾਊਸ, ਬਾਣੇਰ ਰੋਡ, ਪੁਣੇ, ਮਹਾਰਾਸ਼ਟਰ - 411045",
      customerCareText: "020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
      presentedByHeader: "ਪੇਸ਼ਕਾਰ:",
      officialPartner: "ਅਧਿਕਾਰਤ ਭਾਈਵਾਲ",
      pageLabel: "ਪੰਨਾ",
      genuineFooter: "100% ਪ੍ਰਮਾਣਿਕ ਤੇ DSIR ਪ੍ਰਮਾਣਿਤ ਉਤਪਾਦ",
      helplineFooter: "24×7 ਸਹਾਇਤਾ: +91 79744 22572 • www.aarogyamindia.online",
      categoryBannerPrefix: "ਸ਼੍ਰੇਣੀ:",
      productsCountSuffix: "ਉਤਪਾਦ",
      viewOnlyCatBtn: "ਸਿਰਫ਼ ਇਹ ਸ਼੍ਰੇਣੀ ਦੇਖੋ",
      categories: {
        agri: "🌾 ਖੇਤੀਬਾੜੀ ਬਾਇਓਫਿਟ (Biofit Agriculture)",
        cattle: "🐄 ਪਸ਼ੂ ਪੋਸ਼ਣ ਤੇ ਡੇਅਰੀ (Cattle Care)",
        health: "❤️ ਸਿਹਤ ਨੈਚੁਰਾਮੋਰ (Naturamore)",
        herbs_more: "🌿 ਹਰਬਸ ਐਂਡ ਮੋਰ (Herbs & More)",
        clean_more: "🏡 ਕਲੀਨ ਐਂਡ ਮੋਰ (Clean & More)"
      }
    },
    bn: {
      coverBadge: "🌿 ১০০% প্রাকৃতিক ও বায়ো-টেকনোলজি ফর্মুলেশন",
      title: "সম্পূর্ণ নেটসার্ফ প্রোডাক্ট ক্যাটালগ ২০২৬",
      subtitle: "স্বাস্থ্য, জৈব কৃষি, পশু পুষ্টি, ত্বক ও চুলের যত্ন এবং পরিবেশবান্ধব হোম কেয়ার",
      slogan: "স্বাস্থ্য • সমৃদ্ধি • হাসি",
      sloganTagline: "২৬ বছরের অবিচল আস্থা • ভারত সরকার অনুমোদিত DSIR নিজস্ব R&D কেন্দ্র",
      dateLabel: "তারিখ:",
      totalProductsLabel: "মোট পণ্য:",
      coverCompanyTitle: "নেটসার্ফ ডিরেক্ট - কোম্পানি প্রোফাইল",
      coverCompanyDesc: "২০০০ সাল থেকে ২৬ বছরের অবিচল বিশ্বাস। ভারত সরকারের বিজ্ঞান ও প্রযুক্তি মন্ত্রকের (DSIR) অনুমোদিত নিজস্ব R&D কেন্দ্র। ২৫ লক্ষাধিক সন্তুষ্ট গ্রাহক।",
      categoryIntroTitle: "প্রধান পণ্য বিভাগসমূহ:",
      categoryIntro: "বায়োফিট জৈব কৃষি, পশু পুষ্টি CFC (দুগ্ধ বিকাশ), নেচুরোমোর স্বাস্থ্য, হার্বস অ্যান্ড মোর, ক্লিন অ্যান্ড মোর।",
      mrpLabel: "MRP:",
      offerLabel: "অফার মূল্য:",
      discountBadge: "ছাড়",
      packSizeLabel: "প্যাকিং:",
      ingLabel: "🌱 মূল উপাদান:",
      doseLabel: "📋 ব্যবহারের নিয়ম ও মাত্রা:",
      precautionsLabel: "⚠️ সতর্কতা:",
      genuineBadge: "১০০% খাঁটি ও প্রত্যয়িত",
      distributorTitle: "অনুমোদিত পরিবেশক ও স্বাস্থ্য পরামর্শদাতা (Presented By):",
      phoneWaLabel: "📞 ফোন ও WhatsApp:",
      orderNote: "পণ্য অর্ডার, হোম ডেলিভারি এবং সঠিক ডোজ সংক্রান্ত পরামর্শের জন্য সরাসরি উপরের নম্বরে যোগাযোগ করুন।",
      howToOrderTitle: "অর্ডার করার নিয়ম:",
      howToOrderStep1: "১. পছন্দের পণ্য নির্বাচন করুন",
      howToOrderStep2: "২. উপরের নম্বরে কল বা হোয়াটসঅ্যাপ করুন",
      howToOrderStep3: "৩. দ্রুত ও নিরাপদ হোম ডেলিভারি পান",
      corporateAddressTitle: "কর্পোরেট নিবন্ধিত কার্যালয়:",
      corporateAddressText: "Netsurf Communications Pvt. Ltd., Baner, Pune - 411045, Maharashtra, India.",
      customerCareLabel: "কোম্পানি হেল্পলাইন:",
      customerCareText: "020-42111111 | helpdesk@netsurfdirect.com | www.netsurfdirect.com",
      disclaimerTitle: "আইনি বিজ্ঞপ্তি ও দাবিত্যাগ (Legal Disclaimer):",
      disclaimerText: "সমস্ত তথ্য netsurfdirect.com থেকে রেফারেন্স হিসেবে সংগৃহীত। AAROGYAM INDIA একটি স্বাধীন পরিবেশক নেটওয়ার্ক। বিশদ তথ্যের জন্য Netsurf Communications Pvt. Ltd.-এর সাথে যোগাযোগ করুন।",
      helplineLabel: "AAROGYAM INDIA Support:",
      footerMission: "AAROGYAM INDIA • Digital Health & Agro Mission • www.aarogyamindia.online",
      presentedByHeader: "পরিবেশক:",
      officialPartner: "অফিসিয়াল পার্টনার",
      pageLabel: "পৃষ্ঠা",
      genuineFooter: "১০০% খাঁটি ও DSIR অনুমোদিত পণ্য",
      helplineFooter: "২৪×৭ সহায়তা: +91 79744 22572 • www.aarogyamindia.online",
      categoryBannerPrefix: "বিভাগ:",
      productsCountSuffix: "পণ্য",
      viewOnlyCatBtn: "শুধুমাত্র এই বিভাগ দেখুন",
      categories: {
        agri: "🌾 কৃষি বায়োফিট (Biofit Agriculture)",
        cattle: "🐄 পশু পুষ্টি ও দুগ্ধ বিকাশ (Cattle Care)",
        health: "❤️ নেচুরোমোর স্বাস্থ্য (Naturamore)",
        herbs_more: "🌿 হার্বস অ্যান্ড মোর (Herbs & More)",
        clean_more: "🏡 ক্লিন অ্যান্ড মোর (Clean & More)"
      }
    }
  };

  // Helper to translate pack sizes accurately across languages
  function translatePackSize(rawSize, langKey) {
    if (!rawSize) return '';
    const s = String(rawSize).trim();
    if (!langKey || langKey === 'hi') return s;

    const match = s.match(/(\d+)\s*(कैप्सूल|गोलियां|पीस|capsules?|tablets?|units?|gm|ml|kg|ltr|litre|nos)/i);
    const num = match ? match[1] : '';
    const unit = match ? match[2].toLowerCase() : s;

    if (unit.includes('कैप्सूल') || unit.includes('capsule')) {
      if (langKey === 'pa') return `${num} ਕੈਪਸੂਲ`;
      if (langKey === 'te') return `${num} క్యాప్సూల్స్`;
      if (langKey === 'ta') return `${num} காப்ஸ்யூல்கள்`;
      if (langKey === 'bn') return `${num} ক্যাপসুল`;
      if (langKey === 'gu') return `${num} કેપ્સ્યુલ્સ`;
      if (langKey === 'mr') return `${num} कॅप्सूल`;
      return `${num} Capsules`;
    }
    if (unit.includes('गोलियां') || unit.includes('tablet')) {
      if (langKey === 'pa') return `${num} ਗੋਲੀਆਂ`;
      if (langKey === 'te') return `${num} మాత్రలు`;
      if (langKey === 'ta') return `${num} மாத்திரைகள்`;
      if (langKey === 'bn') return `${num} ট্যাবলেট`;
      if (langKey === 'gu') return `${num} ગોળીઓ`;
      if (langKey === 'mr') return `${num} गोळ्या`;
      return `${num} Tablets`;
    }
    if (unit.includes('पीस') || unit.includes('nos') || unit.includes('unit') || unit.includes('piece')) {
      if (langKey === 'pa') return `${num || '1'} ਯੂਨਿਟ`;
      if (langKey === 'te') return `${num || '1'} యూనిట్`;
      if (langKey === 'ta') return `${num || '1'} அலகு`;
      if (langKey === 'bn') return `${num || '১'} পিস`;
      if (langKey === 'gu') return `${num || '1'} નંગ`;
      if (langKey === 'mr') return `${num || '1'} नग`;
      return `${num || '1'} Units`;
    }

    return s.replace(/लीटर/g, 'Litre').replace(/ग्राम/g, 'gm').replace(/किग्रा/g, 'kg');
  }

  // Helper to translate category dynamically
  function getTranslatedCategory(catId, langKey) {
    if (!langKey) langKey = 'hi';
    if (masterI18n && masterI18n.categories && masterI18n.categories[catId] && masterI18n.categories[catId][langKey]) {
      return masterI18n.categories[catId][langKey];
    }
    const dict = I18N_CATALOG[langKey] || I18N_CATALOG.hi;
    if (dict.categories && dict.categories[catId]) {
      return dict.categories[catId];
    }
    const matched = masterCategories.find(c => c.id === catId);
    return matched ? matched.name : catId;
  }

  // Helper to provide 100% pure translated product data for all 7 languages from masterI18n
  function getProductMultilingualData(p, langKey) {
    if (!langKey) langKey = 'hi';

    // 1. Check dynamic i18n database
    if (masterI18n && masterI18n.products && masterI18n.products[p.id] && masterI18n.products[p.id][langKey]) {
      const entry = masterI18n.products[p.id][langKey];
      return {
        name: entry.name || p.name,
        description: entry.description || p.description || '',
        ingredients: entry.ingredients || p.ingredients || '',
        dose: entry.dose || p.dose || '',
        precautions: entry.precautions || p.precautions || ''
      };
    }

    // 2. Safe Fallback
    let cleanName = p.name;
    if (langKey === 'en') {
      const engMatch = p.name.match(/\(([^)]+)\)/);
      if (engMatch && /[a-zA-Z]/.test(engMatch[1])) {
        cleanName = engMatch[1].trim();
      } else if (/[a-zA-Z]/.test(p.name)) {
        cleanName = p.name.replace(/[ऀ-ॿ]/g, '').trim();
      }
    }

    return {
      name: cleanName || p.name,
      description: p.description || '',
      ingredients: p.ingredients || '',
      dose: p.dose || '',
      precautions: p.precautions || ''
    };
  }

  // 1. Resolve Sponsor & Logged-In User from Session or URL
  function resolveSponsor() {
    const params = new URLSearchParams(window.location.search);
    const sponsorNameParam = params.get('sponsor_name') || params.get('name') || params.get('u') || params.get('s') || params.get('sponsor');
    const sponsorPhoneParam = (params.get('sponsor_phone') || params.get('phone') || params.get('m') || '').replace(/\D/g, '');
    const refParam = params.get('ref') || params.get('share_id') || params.get('share');

    if (sponsorNameParam) {
      currentSponsor.name = sponsorNameParam.trim();
      currentSponsor.isPersonalized = true;
    }
    if (sponsorPhoneParam && sponsorPhoneParam.length === 10) {
      currentSponsor.phone = sponsorPhoneParam;
      currentSponsor.isPersonalized = true;
    }
    if (refParam) {
      currentSponsor.shareId = refParam.trim();
    }

    const sessionKeys = [
      'AI_USER', 'AI_PROFILE', 'UCAS_USER', 'aoi_user_session',
      'current_user', 'CURRENT_USER', 'user', 'loggedInUser',
      'aim_user_session', 'active_user'
    ];

    let loggedInProfile = null;
    for (const key of sessionKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const name = parsed.name || parsed.full_name || parsed.userName || parsed.user_name || '';
            const phone = (parsed.phone || parsed.mobile || parsed.user_phone || parsed.user_mobile || '').replace(/\D/g, '');
            if (phone || name) {
              loggedInProfile = { name, phone, share_id: parsed.share_id || parsed.referral_code };
              break;
            }
          }
        }
      } catch (e) {}
    }

    if (!loggedInProfile) {
      const fallbackPhone = (localStorage.getItem('aim_user_mobile') || localStorage.getItem('aarogyam_user_phone') || localStorage.getItem('user_phone') || localStorage.getItem('aim_user_phone') || localStorage.getItem('active_user_mobile') || '').replace(/\D/g, '');
      const fallbackName = localStorage.getItem('aim_user_name') || localStorage.getItem('aarogyam_user_name') || localStorage.getItem('user_name') || '';
      if (fallbackPhone || fallbackName) {
        loggedInProfile = { name: fallbackName, phone: fallbackPhone };
      }
    }

    if (loggedInProfile && !sponsorNameParam) {
      if (loggedInProfile.name) currentSponsor.name = loggedInProfile.name;
      if (loggedInProfile.phone) currentSponsor.phone = loggedInProfile.phone;
      if (loggedInProfile.share_id) currentSponsor.shareId = loggedInProfile.share_id;
      currentSponsor.isPersonalized = true;
    }

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
    if (distNameInput) distNameInput.value = currentSponsor.name;
    if (distPhoneInput) distPhoneInput.value = currentSponsor.phone;

    const leadSharer = document.getElementById('npLeadSharerName');
    if (leadSharer) leadSharer.textContent = `${currentSponsor.name} (+91 ${currentSponsor.phone})`;
  }

  // 2. Fetch Master Products and i18n Translations
  async function loadMasterI18n() {
    const cacheBuster = Date.now();
    const paths = [
      `/data/netsurf-products-i18n.json?t=${cacheBuster}`,
      `../data/netsurf-products-i18n.json?t=${cacheBuster}`,
      `./data/netsurf-products-i18n.json?t=${cacheBuster}`,
      `/data/netsurf-products-i18n.json`
    ];

    for (const url of paths) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.products) {
            masterI18n = data;
            try { localStorage.setItem('aim_netsurf_products_i18n', JSON.stringify(data)); } catch (e) {}
            break;
          }
        }
      } catch (e) {}
    }

    if (!masterI18n) {
      try {
        const cached = localStorage.getItem('aim_netsurf_products_i18n');
        if (cached) masterI18n = JSON.parse(cached);
      } catch (e) {}
    }
  }

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
            if (data.catalog_settings) {
              masterCatalogSettings = { ...masterCatalogSettings, ...data.catalog_settings };
            }
            try { localStorage.setItem('aim_netsurf_products_master', JSON.stringify(data)); } catch (e) {}
            loaded = true;
            break;
          }
        }
      } catch (e) {}
    }

    if (!loaded) {
      try {
        const cached = localStorage.getItem('aim_netsurf_products_master');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
            masterCatalog = parsed.products;
            masterCategories = parsed.categories || [];
            if (parsed.catalog_settings) {
              masterCatalogSettings = { ...masterCatalogSettings, ...parsed.catalog_settings };
            }
          }
        }
      } catch (e) {}
    }

    syncTopKpis();
    renderShelves();
  }

  // Category Icon & Accent Map
  const CATEGORY_META = {
    agri: { icon: '🌾', accent: '#10b981', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
    cattle: { icon: '🐄', accent: '#f59e0b', bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
    health: { icon: '❤️', accent: '#f43f5e', bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
    herbs_more: { icon: '🌿', accent: '#14b8a6', bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' },
    clean_more: { icon: '🏡', accent: '#6366f1', bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' },
    other: { icon: '📦', accent: '#64748b', bg: '#f8fafc', text: '#334155', border: '#cbd5e1' }
  };

  // 1. Sync Animated Glassy KPI Cards with Live Category Counts
  function syncTopKpis() {
    const kpiCards = document.querySelectorAll('.np-glass-kpi-card');
    kpiCards.forEach(card => {
      const cat = card.getAttribute('data-cat');
      if (cat === currentCategory) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    const i18n = I18N_CATALOG[currentSiteLang] || I18N_CATALOG.hi;
    const suffix = i18n.productsCountSuffix || 'उत्पाद';

    const countAllEl = document.getElementById('npKpiCountAll');
    if (countAllEl) countAllEl.textContent = `${masterCatalog.length} ${suffix}`;

    const countAgriEl = document.getElementById('npKpiCountAgri');
    if (countAgriEl) {
      const c = masterCatalog.filter(p => p.category === 'agri').length;
      countAgriEl.textContent = `${c} ${suffix}`;
    }

    const countCattleEl = document.getElementById('npKpiCountCattle');
    if (countCattleEl) {
      const c = masterCatalog.filter(p => p.category === 'cattle').length;
      countCattleEl.textContent = `${c} ${suffix}`;
    }

    const countHealthEl = document.getElementById('npKpiCountHealth');
    if (countHealthEl) {
      const c = masterCatalog.filter(p => p.category === 'health').length;
      countHealthEl.textContent = `${c} ${suffix}`;
    }

    const countHerbsEl = document.getElementById('npKpiCountHerbs');
    if (countHerbsEl) {
      const c = masterCatalog.filter(p => p.category === 'herbs_more').length;
      countHerbsEl.textContent = `${c} ${suffix}`;
    }

    const countCleanEl = document.getElementById('npKpiCountClean');
    if (countCleanEl) {
      const c = masterCatalog.filter(p => p.category === 'clean_more').length;
      countCleanEl.textContent = `${c} ${suffix}`;
    }
  }

  // Robust Disease / Health Concern / Subcategory Matcher
  function matchesProblem(p, prob) {
    if (!prob || prob === 'all') return true;
    const probTags = Array.isArray(p.problem_tags) ? p.problem_tags : [];
    if (probTags.includes(prob)) return true;

    const fullText = `${p.name || ''} ${p.category_label || ''} ${p.subcategory_label || ''} ${p.description || ''} ${p.dose || ''} ${p.ingredients || ''}`.toLowerCase();

    const problemKeywords = {
      agri_pest: ['कीट', 'इल्ली', 'रसचूसक', 'pest', 'bio 99', 'bio-99', 'intact', 'wrapup', 'insect', 'larva'],
      agri_fungus: ['फंगस', 'फफूंद', 'ब्लाइट', 'fungus', 'wrapup', 'wrap up', 'blight', 'mildew'],
      agri_virus: ['वायरस', 'विषाणु', 'virus', 'viral'],
      agri_growth: ['विकास', 'पैदावार', 'stim rich', 'stimrich', 'growth', 'उपज', 'फूल', 'फल'],
      agri_soil: ['मिट्टी', 'जीवाणु', 'खाद', 'shatavari', 'biofit', 'n.p.k', 'npk', 'sheth', 'soil'],
      cattle_care: ['गाय', 'भैंस', 'दूध', 'फैट', 'cfc', 'milk', 'fat', 'cattle', 'dairy'],
      cattle_health: ['पशु', 'पाचन', 'रोग', 'cfc', 'livestock', 'digestion', 'immunity'],
      aqua_fish: ['मछली', 'aqua', 'fish', 'जलीय'],
      poultry_care: ['मुर्गी', 'poultry', 'bird', 'पक्षी'],
      diabetes: ['डायबिटीज', 'शुगर', 'मधुमेह', 'diabetes', 'sugar'],
      joint_pain: ['जोड़ों', 'गठिया', 'दर्द', 'joint', 'arthritis', 'pain', 'cartilage'],
      weight_loss: ['वजन', 'मोटापा', 'weight', 'slim', 'diet'],
      hair_care: ['बाल', 'हेयर', 'डैंड्रफ', 'hair', 'dandruff', 'scalp'],
      skin_care: ['त्वचा', 'स्किन', 'पिंपल्स', 'skin', 'glow', 'face', 'beauty'],
      womens_care: ['महिला', 'women', 'हार्मोन', 'female', 'menstrual', 'hormone'],
      kids_care: ['बच्चे', 'kids', 'child', 'शिशु', 'growth'],
      vitality_wellness: ['ऊर्जा', 'स्टैमिना', 'पौरुष', 'vitality', 'wellness', 'stamina', 'shilajit', 'ashwagandha', 'vigor', 'men'],
      home_care: ['होम', 'फैब्रिक', 'क्लीन', 'home', 'fabric', 'clean', 'detergent', 'hygiene']
    };

    const kws = problemKeywords[prob] || [prob];
    return kws.some(kw => fullText.includes(kw.toLowerCase()));
  }

  // 2. Render Website Product Card
  function renderWebsiteCard(p) {
    const mrp = parseInt(p.mrp, 10) || 0;
    const discountPct = parseInt(p.discount_pct, 10) || 0;
    const offerPrice = p.discounted_price || (discountPct ? Math.round(mrp * (1 - discountPct / 100)) : (p.price || mrp));
    const packSize = p.pack_size || '';
    const imgSrc = p.image || '/images/logo/logo.png';
    const badge = p.badge || '';
    const subLabel = p.subcategory_label || '';
    const multi = getProductMultilingualData(p, currentSiteLang);
    const translatedCat = getTranslatedCategory(p.category, currentSiteLang);
    const packTranslated = translatePackSize(packSize, currentSiteLang);
    const meta = CATEGORY_META[p.category] || CATEGORY_META.other;
    const i18n = I18N_CATALOG[currentSiteLang] || I18N_CATALOG.hi;

    const waMsg = encodeURIComponent(`नमस्ते ${currentSponsor.name} जी! मुझे नेटसर्फ उत्पाद: *${multi.name}* (पैकिंग: ${packSize || '1 यूनिट'}, MRP: ₹${mrp}, ऑफर रेट: ₹${offerPrice}, ${discountPct}% छूट) की जानकारी चाहिए व ऑर्डर करना है।`);
    const waUrl = `https://api.whatsapp.com/send?phone=${currentSponsor.phone}&text=${waMsg}`;

    return `
      <div class="np-card" data-cat="${p.category}" data-id="${p.id}">
        <div>
          <!-- Image Box -->
          <div class="np-img-box">
            <img src="${imgSrc}" alt="${escapeHtml(multi.name)}" loading="lazy" onerror="this.src='/images/logo/logo.png';">
            ${badge ? `<span style="position:absolute; top:8px; left:8px; background:rgba(21,128,61,0.92); color:#fff; font-size:0.7rem; padding:3px 8px; border-radius:12px; font-weight:800; backdrop-filter:blur(4px);">${escapeHtml(badge)}</span>` : ''}
          </div>

          <!-- Category Pill & Pack Size -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:6px; flex-wrap:wrap;">
            <span style="background:${meta.bg}; color:${meta.text}; border:1px solid ${meta.border}; font-size:0.72rem; padding:2px 8px; border-radius:10px; font-weight:700;">
              ${escapeHtml(translatedCat)}
            </span>
            <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
              ${packTranslated ? `<span style="background:#e0f2fe; color:#0369a1; font-size:0.7rem; padding:2px 7px; border-radius:10px; font-weight:700; border:1px solid #bae6fd;">📦 ${escapeHtml(packTranslated)}</span>` : ''}
              ${subLabel ? `<span style="background:#f1f5f9; color:#475569; font-size:0.68rem; padding:2px 6px; border-radius:8px; font-weight:600;">${escapeHtml(subLabel)}</span>` : ''}
            </div>
          </div>

          <!-- Title -->
          <h3 style="font-size:1.02rem; font-weight:800; color:#0f172a; margin:0 0 6px 0; line-height:1.35;">
            ${escapeHtml(multi.name)}
          </h3>

          <!-- Price Row -->
          <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:10px; flex-wrap:wrap;">
            <span style="font-size:1.25rem; font-weight:900; color:#16a34a;">₹${offerPrice}</span>
            ${mrp > offerPrice ? `
              <span style="text-decoration:line-through; color:#94a3b8; font-size:0.85rem;">₹${mrp}</span>
              <span style="font-size:0.72rem; background:#fee2e2; color:#dc2626; padding:1px 6px; border-radius:6px; font-weight:800;">${discountPct}% ${i18n.discountBadge}</span>
            ` : ''}
          </div>

          <!-- Description -->
          ${multi.description ? `<p style="font-size:0.82rem; color:#475569; line-height:1.42; margin:0 0 8px 0;">${escapeHtml(multi.description)}</p>` : ''}

          <!-- Ingredients, Dose, Precautions Highlights -->
          ${multi.ingredients ? `
            <div style="background:#f8fafc; border-left:3px solid #10b981; padding:5px 8px; border-radius:4px; margin-bottom:5px; font-size:0.74rem; color:#334155;">
              <strong style="color:#059669;">${i18n.ingLabel}</strong> ${escapeHtml(multi.ingredients)}
            </div>
          ` : ''}
          ${multi.dose ? `
            <div style="background:#f0fdf4; border-left:3px solid #22c55e; padding:5px 8px; border-radius:4px; margin-bottom:5px; font-size:0.74rem; color:#166534;">
              <strong style="color:#15803d;">${i18n.doseLabel}</strong> ${escapeHtml(multi.dose)}
            </div>
          ` : ''}
          ${multi.precautions ? `
            <div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:5px 8px; border-radius:4px; margin-bottom:10px; font-size:0.74rem; color:#92400e;">
              <strong style="color:#b45309;">${i18n.precautionsLabel}</strong> ${escapeHtml(multi.precautions)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 3. Render Pure Category Shelves (Clean Shelves With ZERO 'केवल यह शेल्फ देखें' Button)
  function renderShelves() {
    const container = document.getElementById('npShelvesContainer');
    const countBadge = document.getElementById('npProductCountBadge');
    if (!container) return;

    // Filter by category, problem/concern and search query
    const filtered = masterCatalog.filter(p => {
      if (currentCategory !== 'all' && p.category !== currentCategory) return false;
      if (currentProblem !== 'all' && !matchesProblem(p, currentProblem)) return false;
      if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        const str = `${p.name || ''} ${p.category_label || ''} ${p.subcategory_label || ''} ${p.pack_size || ''} ${p.description || ''} ${p.ingredients || ''} ${p.dose || ''} ${(p.problem_tags || []).join(' ')}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });

    const i18n = I18N_CATALOG[currentSiteLang] || I18N_CATALOG.hi;

    if (countBadge) {
      countBadge.textContent = `${filtered.length} ${i18n.productsCountSuffix || 'उत्पाद'} उपलब्ध`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 18px; border: 1.5px dashed #cbd5e1; color: #64748b;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
          <strong style="font-size: 1.15rem; color: #0f172a; display: block;">कोई उत्पाद नहीं मिला</strong>
          <p style="font-size: 0.88rem; margin: 6px 0 16px 0;">कृपया समस्या विकल्प बदलें या 'रीसेट' बटन दबाएं।</p>
          <button type="button" onclick="window.resetAllFilters()" style="background: #10b981; color: #fff; border: none; padding: 10px 22px; border-radius: 20px; font-weight: 800; cursor: pointer;">
            सभी उत्पाद देखें (Show All)
          </button>
        </div>
      `;
      return;
    }

    const shelvesHtml = [];

    masterCategories.forEach(cat => {
      if (currentCategory !== 'all' && cat.id !== currentCategory) return;

      const catProds = filtered.filter(p => p.category === cat.id);
      if (catProds.length === 0) return;

      const catName = getTranslatedCategory(cat.id, currentSiteLang);
      const meta = CATEGORY_META[cat.id] || CATEGORY_META.other;

      // Pure Shelf Header: Only Icon, Title, and Product Count Badge (ZERO 'केवल यह शेल्फ देखें' button)
      shelvesHtml.push(`
        <section class="np-shelf" id="shelf-${cat.id}" data-cat="${cat.id}">
          <div class="np-shelf-header" style="border-left: 4px solid ${meta.accent}; padding-left: 12px;">
            <div class="np-shelf-title-wrap">
              <span class="np-shelf-icon">${meta.icon}</span>
              <h2 class="np-shelf-title">${escapeHtml(catName)}</h2>
              <span class="np-shelf-count-badge" style="background:${meta.bg}; color:${meta.text}; border-color:${meta.border};">
                ${catProds.length} ${i18n.productsCountSuffix || 'उत्पाद'}
              </span>
            </div>
          </div>
          <div class="np-shelf-grid">
            ${catProds.map(p => renderWebsiteCard(p)).join('')}
          </div>
        </section>
      `);
    });

    // Handle any other products
    if (currentCategory === 'all' || currentCategory === 'other') {
      const knownIds = masterCategories.map(c => c.id);
      const otherProds = filtered.filter(p => !knownIds.includes(p.category));
      if (otherProds.length > 0) {
        shelvesHtml.push(`
          <section class="np-shelf" id="shelf-other" data-cat="other">
            <div class="np-shelf-header" style="border-left: 4px solid #64748b; padding-left: 12px;">
              <div class="np-shelf-title-wrap">
                <span class="np-shelf-icon">📦</span>
                <h2 class="np-shelf-title">अन्य उत्पाद (Other Products)</h2>
                <span class="np-shelf-count-badge" style="background:#f8fafc; color:#334155; border-color:#cbd5e1;">
                  ${otherProds.length} उत्पाद
                </span>
              </div>
            </div>
            <div class="np-shelf-grid">
              ${otherProds.map(p => renderWebsiteCard(p)).join('')}
            </div>
          </section>
        `);
      }
    }

    container.innerHTML = shelvesHtml.join('');
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

  // Website Language: Permanently Locked to Pure Hindi
  window.changeSiteLanguage = function () {
    currentSiteLang = 'hi';
    try { localStorage.removeItem('aim_catalog_lang'); } catch (e) {}
    syncTopKpis();
    renderShelves();
  };

  // 4. Primary Category Filter (Connected to Animated Glassy KPI Cards)
  window.filterByCategory = function (catId) {
    currentCategory = catId || 'all';
    syncTopKpis();
    renderShelves();

    if (catId && catId !== 'all') {
      const shelfEl = document.getElementById(`shelf-${catId}`);
      if (shelfEl) {
        shelfEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        shelfEl.classList.add('np-shelf-highlight');
        setTimeout(() => shelfEl.classList.remove('np-shelf-highlight'), 1600);
      }
    } else {
      const container = document.getElementById('npShelvesContainer');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // 5. Health Concern / Disease Filter (Connected to #npProblemSelect Dropdown)
  window.filterByProblem = function (probId) {
    currentProblem = probId || 'all';
    const select = document.getElementById('npProblemSelect');
    if (select && select.value !== currentProblem) select.value = currentProblem;
    renderShelves();
  };

  window.handleSearchInput = function (val) {
    currentSearchQuery = val ? val.trim() : '';
    const clearBtn = document.getElementById('npSearchClearBtn');
    if (clearBtn) clearBtn.style.display = currentSearchQuery ? 'block' : 'none';
    renderShelves();
  };

  window.clearSearchInput = function () {
    const input = document.getElementById('npSearchInput');
    if (input) input.value = '';
    currentSearchQuery = '';
    const clearBtn = document.getElementById('npSearchClearBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    renderShelves();
  };

  window.resetAllFilters = function () {
    currentCategory = 'all';
    currentProblem = 'all';
    currentSearchQuery = '';

    const searchInput = document.getElementById('npSearchInput');
    if (searchInput) searchInput.value = '';

    const clearBtn = document.getElementById('npSearchClearBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    const probSelect = document.getElementById('npProblemSelect');
    if (probSelect) probSelect.value = 'all';

    syncTopKpis();
    renderShelves();
  };

  // 5. Audio Tutorial with Speech Synthesis & Floating Speaker Bridge
  let synthUtterance = null;
  let isAudioPlaying = false;

  function updateSideAudioSpeakerState(isPlaying) {
    const btn = document.getElementById('universal-sticky-audio-btn');
    if (!btn) return;
    if (isPlaying) {
      btn.style.background = '#10b981';
      btn.style.boxShadow = '0 0 16px rgba(16,185,129,0.7)';
      btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      btn.title = 'ऑडियो रोकें (Pause Audio)';
    } else {
      btn.style.background = '#8b5cf6';
      btn.style.boxShadow = '';
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      btn.title = 'पेज ऑडियो सुनें (Play Voice Guide)';
    }
  }

  window.toggleAudioTutorial = function (forcePlay) {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking && isAudioPlaying && !forcePlay) {
      window.speechSynthesis.cancel();
      isAudioPlaying = false;
      updateSideAudioSpeakerState(false);
      return;
    }

    window.speechSynthesis.cancel();

    const voiceScript = `नमस्ते! आरोग्यम इंडिया सम्पूर्ण नेटसर्फ उत्पाद केंद्र में आपका स्वागत है। यहाँ आप कृषि बायोफिट, पशु पोषण, नेचुरामोरे और पर्सनल केयर के सभी प्रमाणित जैविक व आयुर्वेदिक उत्पाद देख सकते हैं। ऊपर दिए गए बीमारी या कैटेगरी फ़िल्टर से अपनी पसंद के उत्पाद चुनें। आप 'डाउनलोड कैटलॉग' बटन दबाकर 7 भाषाओं में अपने नाम व मोबाइल नंबर के साथ पर्सनलाइज्ड PDF कैटलॉग भी डाउनलोड कर सकते हैं। किसी भी उत्पाद को ऑर्डर करने या सलाह के लिए व्हाट्सएप बटन का उपयोग करें।`;

    synthUtterance = new SpeechSynthesisUtterance(voiceScript);
    synthUtterance.lang = 'hi-IN';
    synthUtterance.rate = 0.95;
    synthUtterance.pitch = 1.0;

    synthUtterance.onstart = function () {
      isAudioPlaying = true;
      updateSideAudioSpeakerState(true);
    };

    synthUtterance.onend = function () {
      isAudioPlaying = false;
      updateSideAudioSpeakerState(false);
    };

    synthUtterance.onerror = function () {
      isAudioPlaying = false;
      updateSideAudioSpeakerState(false);
    };

    window.speechSynthesis.speak(synthUtterance);
  };

  window.togglePageAudioGreeting = function () {
    window.toggleAudioTutorial();
  };

  window.playPageAudioGreeting = function () {
    window.toggleAudioTutorial(true);
  };

  // 6. Universal Lead Gatekeeper & Registration Handlers
  window.isCatalogUserRegistered = function () {
    if (typeof window.isLoggedIn === 'function' && window.isLoggedIn()) return true;
    if (typeof window.getCurrentUser === 'function') {
      const u = window.getCurrentUser();
      if (u && (u.mobile || u.id)) return true;
    }
    const reg = localStorage.getItem('aarogyam_user_registered');
    const mob = (localStorage.getItem('aim_user_mobile') || localStorage.getItem('aarogyam_user_phone') || '').replace(/\D/g, '').slice(-10);
    return (reg === 'true' && mob.length === 10) || (mob.length === 10);
  };

  window.openLeadGateModal = function () {
    const modal = document.getElementById('npLeadGateModal');
    if (modal) {
      modal.style.display = 'flex';
      const sharerEl = document.getElementById('npLeadSharerName');
      if (sharerEl) {
        sharerEl.textContent = `${currentSponsor.name} (+91 ${currentSponsor.phone})`;
      }
    }
  };

  window.closeLeadGateModal = function () {
    const modal = document.getElementById('npLeadGateModal');
    if (modal) modal.style.display = 'none';
  };

  window.handleLeadGateSubmit = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const nameInput = document.getElementById('npLeadName');
    const phoneInput = document.getElementById('npLeadPhone');
    const msgEl = document.getElementById('npLeadGateMsg');
    const name = (nameInput ? nameInput.value : '').trim();
    const phone = (phoneInput ? phoneInput.value : '').replace(/\D/g, '').slice(-10);

    if (!name || name.length < 2) {
      if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.background = '#fee2e2';
        msgEl.style.color = '#dc2626';
        msgEl.textContent = 'कृपया अपना पूरा नाम दर्ज करें।';
      }
      return;
    }
    if (phone.length !== 10) {
      if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.background = '#fee2e2';
        msgEl.style.color = '#dc2626';
        msgEl.textContent = 'कृपया 10-अंकों का वैध व्हाट्सएप मोबाइल नंबर दर्ज करें।';
      }
      return;
    }

    const newShareId = 'AI' + phone.slice(-6);
    const userObj = {
      id: 'AI_' + phone,
      name: name,
      full_name: name,
      mobile: phone,
      phone: phone,
      share_id: newShareId,
      referral_code: currentSponsor.shareId || 'AI000004',
      referral_name: currentSponsor.name,
      referral_phone: currentSponsor.phone,
      registration_source: 'NetsurfCatalog'
    };

    try {
      localStorage.setItem('AI_USER', JSON.stringify(userObj));
      localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
      localStorage.setItem('UCAS_USER', JSON.stringify(userObj));
      localStorage.setItem('aim_user_name', name);
      localStorage.setItem('aim_user_mobile', phone);
      localStorage.setItem('aarogyam_user_registered', 'true');

      let existingSession = {};
      try { existingSession = JSON.parse(localStorage.getItem('AI_SESSION') || '{}'); } catch(err) {}
      existingSession.user_id = userObj.id;
      existingSession.mobile = phone;
      existingSession.full_name = name;
      existingSession.referral_share_id = currentSponsor.shareId || 'AI000004';
      localStorage.setItem('AI_SESSION', JSON.stringify(existingSession));
    } catch(err) {
      console.warn('Local session write notice:', err);
    }

    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        const db = window.supabase.createClient('https://qjhjrzsnrtahmhswxyvb.supabase.co', 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU');
        db.from('profiles').upsert([{
          full_name: name,
          mobile: phone,
          share_id: newShareId,
          referral_code: currentSponsor.shareId || 'AI000004',
          referral_mobile: currentSponsor.phone,
          registration_source: 'NetsurfCatalog'
        }]).then(() => {}).catch(() => {});
      }
    } catch(err) {}

    currentSponsor.name = name;
    currentSponsor.phone = phone;
    currentSponsor.shareId = newShareId;
    currentSponsor.isPersonalized = true;

    const stickyName = document.getElementById('npStickySellerName');
    if (stickyName) stickyName.textContent = name;
    const distNameInput = document.getElementById('npDistributorName');
    const distPhoneInput = document.getElementById('npDistributorPhone');
    if (distNameInput) distNameInput.value = name;
    if (distPhoneInput) distPhoneInput.value = phone;

    window.closeLeadGateModal();
    const catModal = document.getElementById('npCatalogModal');
    if (catModal) catModal.style.display = 'flex';
  };

  // Viral Universal Sharing for Netsurf Catalog
  window.shareNetsurfCatalogPage = function () {
    if (!window.isCatalogUserRegistered()) {
      window.openLeadGateModal();
      return;
    }
    const user = (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : null;
    const name = user?.full_name || localStorage.getItem('aim_user_name') || currentSponsor.name || 'आरोग्यम मित्र';
    const phone = (user?.mobile || localStorage.getItem('aim_user_mobile') || currentSponsor.phone || '').replace(/\D/g, '').slice(-10);
    const shareId = (typeof window.getUnifiedShareId === 'function') ? window.getUnifiedShareId() : ('AI' + (phone ? phone.slice(-6) : '000004'));

    const baseUrl = window.location.origin + '/categories/netsurf-products.html';
    const shareUrl = `${baseUrl}?ref=${shareId}&sponsor_name=${encodeURIComponent(name)}&sponsor_phone=${encodeURIComponent(phone)}`;
    const shareText = `🌿 *आरोग्यम भारत - सम्पूर्ण नेटसर्फ उत्पाद कैटलॉग 2026*\n\nकृषि बायोफिट, पशु पोषण, नेचुरामोरे न्यूट्रिशन और पर्सनल केयर के 100% प्रामाणिक जैविक व आयुर्वेदिक उत्पाद देखें एवं पर्सनलाइज्ड PDF कैटलॉग डाउनलोड करें:\n👉 ${shareUrl}\n\n_प्रस्तुतकर्ता: ${name} (+91 ${phone})_`;

    if (navigator.share) {
      navigator.share({
        title: 'सम्पूर्ण नेटसर्फ उत्पाद कैटलॉग 2026',
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  // Download Catalog Modal Handlers
  window.openCatalogDownloadModal = function () {
    if (!window.isCatalogUserRegistered()) {
      window.openLeadGateModal();
      return;
    }

    const modal = document.getElementById('npCatalogModal');
    if (modal) modal.style.display = 'flex';

    // Default chosen language radio
    const langRadio = document.querySelector(`input[name="catalogLang"][value="${currentSiteLang}"]`);
    if (langRadio) langRadio.checked = true;

    const user = (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : null;
    const defName = user?.full_name || user?.name || localStorage.getItem('aim_user_name') || currentSponsor.name;
    const defPhone = (user?.mobile || user?.phone || localStorage.getItem('aim_user_mobile') || currentSponsor.phone || '').replace(/\D/g, '').slice(-10);

    const distNameInput = document.getElementById('npDistributorName');
    const distPhoneInput = document.getElementById('npDistributorPhone');
    if (distNameInput && defName) distNameInput.value = defName;
    if (distPhoneInput && defPhone) distPhoneInput.value = defPhone;
  };

  window.closeCatalogDownloadModal = function () {
    const modal = document.getElementById('npCatalogModal');
    if (modal) modal.style.display = 'none';
  };

  // 7. Ultra High-Definition Personalized PDF Catalog Generator (Photoshop Graphic-Designer Quality)
  // Strict 3-Color Palette: Royal Navy Blue (#0c2340), Dark Red (#b91c1c), Bold Jet Black (#0a0f1d) on Glossy Light Blue (#edf5fc) Canvas.
  // 2-Column Grid (6 Products Per Page) + Product Philosophy & Complete Compensation Business Plan (Retail, Binary, Generation Table).
  
  // 100% Pure Multilingual Plan Pages Dictionary (Page 9: Philosophy & Page 10: Compensation Plan)
  const I18N_PLAN_PAGES = {
    hi: {
      headerSub9: "उत्पाद दर्शन, R&D एवं पारिवारिक सुरक्षा",
      sec1Title: "नेटसर्फ का वैज्ञानिक दृष्टिकोण एवं उत्पाद दर्शन",
      sec1Desc: "नेटसर्फ डायरेक्ट भारत में विषमुक्त कृषि, स्वस्थ जीवनशैली और पर्यावरण सुरक्षा का एक महाअभियान है। सन 2000 से स्थापित कंपनी के सभी उत्पाद भारत सरकार के विज्ञान एवं प्रौद्योगिकी मंत्रालय (DSIR) द्वारा मान्यता प्राप्त इन-हाउस R&D केंद्र में कठोर परीक्षणों के बाद ही निर्मित होते हैं।",
      pillar1Title: "DSIR मान्यता प्राप्त R&D केंद्र",
      pillar1Desc: "पुणे स्थित अत्याधुनिक अनुसंधान केंद्र में शीर्ष वैज्ञानिकों द्वारा निरंतर फॉर्मूलेशन परीक्षण।",
      pillar2Title: "100% प्राकृतिक व नॉन-टॉक्सिक",
      pillar2Desc: "हानिकारक रसायनों व कृत्रिम स्टेरॉयड से पूर्णतः मुक्त। मनुष्य, मिट्टी व पशुओं के लिए 100% सुरक्षित।",
      pillar3Title: "ISO 9001:2015 एवं GMP प्रमाणित",
      pillar3Desc: "अत्याधुनिक ऑटोमेटेड इकाइयां जो स्वच्छता व गुणवत्ता मानकों का कड़ाई से पालन करती हैं।",
      pillar4Title: "25 लाख+ संतुष्ट परिवारों का विश्वास",
      pillar4Desc: "पूरे भारत में 26 वर्षों से अटूट विश्वास। लाखों किसानों की फसल लागत घटी व पैदावार बढ़ी।",
      divHeader: "प्रमुख उत्पाद श्रेणियों का दार्शनिक उद्देश्य:",
      divAgri: "रासायनिक खादों व कीटनाशकों से बंजर होती धरती को पुनर्जीवित कर किसानों को समृद्ध बनाना।",
      divCattle: "दुधारू पशुओं के पाचन तंत्र को मजबूत कर बिना हानिकारक इंजेक्शन के दूध व फैट बढ़ाना।",
      divHealth: "आधुनिक जीवनशैली के कुपोषण और तनाव को दूर करने हेतु शुद्ध हर्बल प्रोटीन व पोषण।",
      divHerbs: "सल्फेट-मुक्त सुरक्षित सौंदर्य संगम और एंजाइम आधारित पर्यावरण अनुकूल होम केयर।",
      sec2Title: "ज़ीरो इग्रेस फॉर्मूला (Zero Egress Formula)",
      sec2Badge: "100% सुरक्षित करियर",
      sec2Desc: "पारंपरिक कंपनियों में टारगेट न होने पर रैंक गिर जाती है या वॉल्यूम शून्य हो जाता है। नेटसर्फ में आपकी मेहनत का एक-एक रुपया और रैंक हमेशा सुरक्षित रहती है।",
      pillDemotion: "नो डिमोशन", pillDemotionSub: "हासिल रैंक आजीवन कायम",
      pillCarry: "लाइफटाइम कैरी-फॉरवर्ड", pillCarrySub: "अनमैच्ड वॉल्यूम कभी लैप्स नहीं",
      pillStock: "शून्य अनिवार्य स्टॉक", pillStockSub: "घर में पेटी रखने की मजबूरी नहीं",
      pillAuto: "5+1 फ्री ऑटोशिप", pillAutoSub: "5 माह पर 1 माह उत्पाद मुफ्त",
      sec3Title: "फैमिली प्रोटेक्शन प्लान (पारिवारिक सुरक्षा कवच)",
      sec3Badge: "आजीवन सुरक्षा",
      sec3Desc: "नेटसर्फ अपने सफल डायरेक्ट सेलर्स और उनके परिवारों के भविष्य को पूर्ण सामाजिक व वित्तीय सुरक्षा प्रदान करता है:",
      sec3MedTitle: "₹3,00,000 मेडिक्लेम", sec3MedSub: "परिवार हेतु स्वास्थ्य बीमा सुरक्षा",
      sec3AccTitle: "₹5,00,000 दुर्घटना कवर", sec3AccSub: "आकस्मिक सुरक्षा पॉलिसी",
      sec3NomTitle: "नॉमिनी ट्रांसफर", sec3NomSub: "बिज़नेस व रॉयल्टी आजीवन हस्तांतरणीय",
      guaranteeText: "गुणवत्ता गारंटी: प्रत्येक उत्पाद बैच-परीक्षित व क्यूआर कोड सुरक्षित है।",
      missionText: "आरोग्यम भारत डिजिटल हेल्थ मिशन",
      headerSub10: "नेटसर्फ सम्पूर्ण बिज़नेस इनकम प्लान एवं संपर्क",
      plan1Title: "1. वीकली रिटेल डिस्काउंट व कमीशन (25% फ्लैट + ₹100 वाउचर + 5% से 15% स्लैब)",
      plan1Payout: "पे-आउट: हर सोमवार (Min ₹100 NEFT)",
      consumerAdv: "उपभोक्ता लाभ:",
      consumerAdvText: "उपभोक्ताओं को 25% फ्लैट छूट तथा केवल ऑनलाइन खरीदी करने पर ₹100 का अतिरिक्त प्रोडक्ट वाउचर उपलब्ध।",
      slab1: "₹2,000 से कम", slab2: "₹2,001 - ₹4,000", slab3: "₹4,001 - ₹8,000", slab4: "₹8,001 से ऊपर",
      plan2Title: "2. टीम टर्नओवर मैचिंग बोनस (3%, 4%, 5% बाइनरी मैचिंग)",
      plan2Closing: "15-दिवसीय क्लोजिंग",
      tier1Label: "कुल आय ₹25,000 तक", tier2Label: "₹25,001 से ₹50,000", tier3Label: "₹50,000 से ऊपर (आजीवन)",
      tier3Badge: "5% (सर्वोच्च)",
      plan2Capping: "पाक्षिक क्लोजिंग कैपिंग: ₹8,19,250 (माह में ₹16,38,500 की कानूनी आय सीमा)",
      plan3Title: "3. जनरेशन कमीशन बोनस मैट्रिक्स (3% से 8%)",
      plan3Payout: "पाक्षिक रॉयल्टी",
      colSlab: "15-दिवसीय टर्नओवर स्लैब", colGen: "जनरेशन %", colBonus: "बोनस", colBenefit: "अतिरिक्त लीडरशिप लाभ",
      genRow1Benefit: "बेसिक जनरेशन अनलॉक",
      genRow2Benefit: "एक्टिव लीडरशिप रिकॉग्निशन",
      genRow3Benefit: "बिज़नेस कंसलटेंट (BC)",
      genRow4Benefit: "रीजनल लीडरशिप पूल",
      genRow5Benefit: "सीनियर कंसलटेंट अचीवमेंट",
      genRow6Benefit: "फास्ट ट्रैक व रेजिडेंशियल ट्रिप"
    },
    en: {
      headerSub9: "Product Philosophy & Family Protection",
      sec1Title: "Scientific R&D & Product Philosophy",
      sec1Desc: "Netsurf Direct is India's pioneer in direct biotechnology. Operating since 2000, all formulations are born out of DSIR-recognized in-house R&D facilities with rigorous multi-stage validations for human, crop, and cattle safety.",
      pillar1Title: "DSIR Recognized In-House R&D",
      pillar1Desc: "Dedicated biotech labs in Pune developing pure non-toxic solutions.",
      pillar2Title: "100% Organic & Non-Toxic",
      pillar2Desc: "Zero synthetic steroids, toxic pesticides or chemicals. Safe for all.",
      pillar3Title: "ISO 9001:2015 & GMP Certified",
      pillar3Desc: "Automated manufacturing adhering to global purity standards.",
      pillar4Title: "2.5 Million+ Satisfied Families",
      pillar4Desc: "26 years of corporate trust with proven field & wellness results.",
      divHeader: "Four Core Research Divisions:",
      divAgri: "Organic microbial agri inputs reducing fertilizer costs and rejuvenating soil health.",
      divCattle: "Enzyme-rich animal feed supplements boosting natural milk yield and fat without hormones.",
      divHealth: "Herbal proteins, omega-3 DHA and vital nutrients countering modern lifestyle stress.",
      divHerbs: "Sulfate/paraben-free Ayurveda personal care and enzyme-based eco home cleaners.",
      sec2Title: "Zero Egress Formula (100% Secure Career)",
      sec2Badge: "NO DEMOTION",
      sec2Desc: "Unlike traditional MLM companies where lack of target demotes rank or resets volume, Netsurf preserves your lifetime achievements with zero mandatory monthly inventory loading.",
      pillDemotion: "No Demotion", pillDemotionSub: "Lifetime Rank Retention",
      pillCarry: "Carry Forward", pillCarrySub: "Volume Never Lapses",
      pillStock: "Zero Stocking", pillStockSub: "No Forced Inventory",
      pillAuto: "5+1 Autoship", pillAutoSub: "1 Mo. Free on 5 Mo.",
      sec3Title: "Family Protection Plan (Social Security Shield)",
      sec3Badge: "LIFETIME SECURITY",
      sec3Desc: "Netsurf provides comprehensive institutional welfare benefits to successful direct sellers and their families:",
      sec3MedTitle: "₹3,00,000 Mediclaim", sec3MedSub: "Family Health Insurance Cover",
      sec3AccTitle: "₹5,00,000 Accidental Cover", sec3AccSub: "Accident Insurance Policy",
      sec3NomTitle: "Nominee Transfer", sec3NomSub: "Lifetime Business Transfer",
      guaranteeText: "Quality Guarantee: Every batch is tested and authenticated.",
      missionText: "AAROGYAM INDIA DIGITAL MISSION",
      headerSub10: "Complete Compensation Business Plan & Contact",
      plan1Title: "1. Retail Profit: 25% Flat + ₹100 Voucher + 5% to 15% Slabs",
      plan1Payout: "Payout: Every Monday (Min ₹100 NEFT)",
      consumerAdv: "Consumer Advantage:",
      consumerAdvText: "Flat 25% discount on products + ₹100 voucher on online orders.",
      slab1: "Below ₹2,000", slab2: "₹2,001 - ₹4,000", slab3: "₹4,001 - ₹8,000", slab4: "Above ₹8,001",
      plan2Title: "2. Team Turnover Matching Bonus (3%, 4%, 5% Binary Matching)",
      plan2Closing: "15-Day Closing",
      tier1Label: "Income up to ₹25K", tier2Label: "₹25K to ₹50K", tier3Label: "Above ₹50K (Lifetime)",
      tier3Badge: "5% (Highest)",
      plan2Capping: "15-Day Capping: ₹8,19,250 (Max ₹16,38,500 / Month per ID)",
      plan3Title: "3. Generation Royalty Bonus (3% to 8%)",
      plan3Payout: "Fortnightly Royalty",
      colSlab: "15-Day Turnover Slab", colGen: "Gen. %", colBonus: "Bonus", colBenefit: "Rank / Leadership Benefit",
      genRow1Benefit: "Basic Generation Unlock",
      genRow2Benefit: "Active Leadership Recognition",
      genRow3Benefit: "Business Consultant (BC)",
      genRow4Benefit: "Regional Leadership Pool",
      genRow5Benefit: "Senior Consultant Achievement",
      genRow6Benefit: "Fast Track & Residential Trip"
    },
    pa: {
      headerSub9: "ਉਤਪਾਦ ਫ਼ਲਸਫ਼ਾ, R&D ਅਤੇ ਪਰਿਵਾਰਕ ਸੁਰੱਖਿਆ",
      sec1Title: "ਨੈੱਟਸਰਫ ਦਾ ਵਿਗਿਆਨਕ ਦ੍ਰਿਸ਼ਟੀਕੋਣ ਅਤੇ ਉਤਪਾਦ ਫ਼ਲਸਫ਼ਾ",
      sec1Desc: "ਨੈੱਟਸਰਫ ਡਾਇਰੈਕਟ ਭਾਰਤ ਵਿੱਚ ਜ਼ਹਿਰ-ਮੁਕਤ ਖੇਤੀਬਾੜੀ, ਸਿਹਤਮੰਦ ਜੀਵਨ ਸ਼ੈਲੀ ਅਤੇ ਵਾਤਾਵਰਣ ਸੁਰੱਖਿਆ ਦੀ ਮੋਹਰੀ ਸੰਸਥਾ ਹੈ। ਸੰਨ 2000 ਤੋਂ ਸਥਾਪਿਤ ਕੰਪਨੀ ਦੇ ਸਾਰੇ ਉਤਪਾਦ ਭਾਰਤ ਸਰਕਾਰ ਦੀ DSIR ਦੁਆਰਾ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਇਨ-ਹਾਊਸ R&D ਲੈਬਜ਼ ਵਿੱਚ ਤਿਆਰ ਹੁੰਦੇ ਹਨ।",
      pillar1Title: "DSIR ਮਾਨਤਾ ਪ੍ਰਾਪਤ R&D ਕੇਂਦਰ",
      pillar1Desc: "ਪੁਣੇ ਸਥਿਤ ਅਤਿ-ਆਧੁਨਿਕ ਖੋਜ ਕੇਂਦਰ ਵਿੱਚ ਚੋਟੀ ਦੇ ਵਿਗਿਆਨੀਆਂ ਦੁਆਰਾ ਨਿਰੰਤਰ ਜਾਂਚ।",
      pillar2Title: "100% ਕੁਦਰਤੀ ਤੇ ਗੈਰ-ਜ਼ਹਿਰੀਲੇ",
      pillar2Desc: "ਹਾਨੀਕਾਰਕ ਰਸਾਇਣਾਂ ਤੇ ਸਟੀਰੌਇਡਜ਼ ਤੋਂ ਮੁਕਤ। ਮਨੁੱਖ, ਮਿੱਟੀ ਤੇ ਪਸ਼ੂਆਂ ਲਈ 100% ਸੁਰੱਖਿਅਤ।",
      pillar3Title: "ISO 9001:2015 ਅਤੇ GMP ਪ੍ਰਮਾਣਿਤ",
      pillar3Desc: "ਅਤਿ-ਆਧੁਨਿਕ ਆਟੋਮੇਟਿਡ ਪਲਾਂਟ ਜੋ ਗੁਣਵੱਤਾ ਦੇ ਮਾਪਦੰਡਾਂ ਦੀ ਸਖ਼ਤੀ ਨਾਲ ਪਾਲਣਾ ਕਰਦੇ ਹਨ।",
      pillar4Title: "25 ਲੱਖ+ ਸੰਤੁਸ਼ਟ ਪਰਿਵਾਰਾਂ ਦਾ ਵਿਸ਼ਵਾਸ",
      pillar4Desc: "ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ 26 ਸਾਲਾਂ ਤੋਂ ਅਟੁੱਟ ਵਿਸ਼ਵਾਸ। ਲੱਖਾਂ ਕਿਸਾਨਾਂ ਦੀ ਲਾਗਤ ਘਟੀ ਤੇ ਝਾੜ ਵਧਿਆ।",
      divHeader: "ਪ੍ਰਮੁੱਖ ਉਤਪਾਦ ਸ਼੍ਰੇਣੀਆਂ ਦਾ ਉਦੇਸ਼:",
      divAgri: "ਰਸਾਇਣਕ ਖਾਦਾਂ ਤੋਂ ਬੰਜਰ ਹੁੰਦੀ ਜ਼ਮੀਨ ਨੂੰ ਉਪਜਾਊ ਬਣਾ ਕੇ ਕਿਸਾਨਾਂ ਨੂੰ ਖੁਸ਼ਹਾਲ ਬਣਾਉਣਾ।",
      divCattle: "ਦੁਧਾਰੂ ਪਸ਼ੂਆਂ ਦੇ ਪਾਚਨ ਨੂੰ ਸੁਧਾਰ ਕੇ ਬਿਨਾਂ ਟੀਕੇ ਤੋਂ ਦੁੱਧ ਤੇ ਫੈਟ ਵਧਾਉਣਾ।",
      divHealth: "ਅਜੋਕੀ ਜੀਵਨ ਸ਼ੈਲੀ ਦੇ ਤਣਾਅ ਤੇ ਕਮਜ਼ੋਰੀ ਨੂੰ ਦੂਰ ਕਰਨ ਲਈ ਸ਼ੁੱਧ ਹਰਬਲ ਪ੍ਰੋਟੀਨ ਤੇ ਪੋਸ਼ਣ।",
      divHerbs: "ਸਲਫੇਟ-ਮੁਕਤ ਆਯੁਰਵੈਦਿਕ ਨਿੱਜੀ ਦੇਖਭਾਲ ਅਤੇ ਐਂਜ਼ਾਈਮ ਅਧਾਰਤ ਈਕੋ ਹੋਮ ਕੇਅਰ।",
      sec2Title: "ਜ਼ੀਰੋ ਇਗ੍ਰੈੱਸ ਫ਼ਾਰਮੂਲਾ (Zero Egress Formula)",
      sec2Badge: "100% ਸੁਰੱਖਿਅਤ ਕਰੀਅਰ",
      sec2Desc: "ਰਵਾਇਤੀ ਕੰਪਨੀਆਂ ਵਾਂਗ ਟਾਰਗੇਟ ਨਾ ਹੋਣ 'ਤੇ ਰੈਂਕ ਨਹੀਂ ਡਿੱਗਦਾ ਤੇ ਵਾਲੀਅਮ ਜ਼ੀਰੋ ਨਹੀਂ ਹੁੰਦਾ। ਨੈੱਟਸਰਫ ਵਿੱਚ ਤੁਹਾਡੀ ਮਿਹਨਤ ਹਮੇਸ਼ਾ ਸੁਰੱਖਿਅਤ ਰਹਿੰਦੀ ਹੈ।",
      pillDemotion: "ਕੋਈ ਡਿਮੋਸ਼ਨ ਨਹੀਂ", pillDemotionSub: "ਹਾਸਲ ਰੈਂਕ ਉਮਰ ਭਰ ਕਾਇਮ",
      pillCarry: "ਲਾਈਫ਼ਟਾਈਮ ਕੈਰੀ-ਫਾਰਵਰਡ", pillCarrySub: "ਵਾਲੀਅਮ ਕਦੇ ਲੈਪਸ ਨਹੀਂ",
      pillStock: "ਜ਼ੀਰੋ ਸਟਾਕਿੰਗ", pillStockSub: "ਘਰ ਵਿੱਚ ਸਟਾਕ ਰੱਖਣ ਦੀ ਮਜਬੂਰੀ ਨਹੀਂ",
      pillAuto: "5+1 ਮੁਫ਼ਤ ਆਟੋਸ਼ਿਪ", pillAutoSub: "5 ਮਹੀਨੇ 'ਤੇ 1 ਮਹੀਨਾ ਮੁਫ਼ਤ",
      sec3Title: "ਫੈਮਿਲੀ ਪ੍ਰੋਟੈਕਸ਼ਨ ਪਲਾਨ (ਪਰਿਵਾਰਕ ਸੁਰੱਖਿਆ ਢਾਲ)",
      sec3Badge: "ਉਮਰ ਭਰ ਸੁਰੱਖਿਆ",
      sec3Desc: "ਨੈੱਟਸਰਫ ਆਪਣੇ ਸਫਲ ਡਾਇਰੈਕਟ ਸੈਲਰਾਂ ਅਤੇ ਉਨ੍ਹਾਂ ਦੇ ਪਰਿਵਾਰਾਂ ਨੂੰ ਪੂਰਨ ਸਮਾਜਿਕ ਤੇ ਵਿੱਤੀ ਸੁਰੱਖਿਆ ਦਿੰਦਾ ਹੈ:",
      sec3MedTitle: "₹3,00,000 ਮੈਡੀਕਲੇਮ", sec3MedSub: "ਪਰਿਵਾਰ ਲਈ ਸਿਹਤ ਬੀਮਾ ਸੁਰੱਖਿਆ",
      sec3AccTitle: "₹5,00,000 ਦੁਰਘਟਨਾ ਕਵਰ", sec3AccSub: "ਹਾਦਸਾ ਸੁਰੱਖਿਆ ਪਾਲਿਸੀ",
      sec3NomTitle: "ਨੌਮਿਨੀ ਟਰਾਂਸਫਰ", sec3NomSub: "ਬਿਜ਼ਨਸ ਤੇ ਰਾਇਲਟੀ ਉਮਰ ਭਰ ਬਦਲੀਯੋਗ",
      guaranteeText: "ਗੁਣਵੱਤਾ ਗਾਰੰਟੀ: ਹਰ ਉਤਪਾਦ ਬੈਚ-ਟੈਸਟਿਡ ਅਤੇ ਕਿਊਆਰ ਕੋਡ ਪ੍ਰਮਾਣਿਤ ਹੈ।",
      missionText: "ਆਰੋਗਿਅਮ ਇੰਡੀਆ ਡਿਜੀਟਲ ਮਿਸ਼ਨ",
      headerSub10: "ਨੈੱਟਸਰਫ ਸੰਪੂਰਨ ਬਿਜ਼ਨਸ ਇਨਕਮ ਪਲਾਨ ਅਤੇ ਸੰਪਰਕ",
      plan1Title: "1. ਰੀਟੇਲ ਮੁਨਾਫ਼ਾ ਤੇ ਕਮਿਸ਼ਨ (25% ਫਲੈਟ + ₹100 ਵਾਊਚਰ + 5% ਤੋਂ 15% ਸਲੈਬ)",
      plan1Payout: "ਪੇ-ਆਊਟ: ਹਰ ਸੋਮਵਾਰ (Min ₹100 NEFT)",
      consumerAdv: "ਗਾਹਕ ਲਾਭ:",
      consumerAdvText: "ਗਾਹਕਾਂ ਨੂੰ 25% ਫਲੈਟ ਛੋਟ ਅਤੇ ਆਨਲਾਈਨ ਖ਼ਰੀਦ 'ਤੇ ₹100 ਦਾ ਵਾਧੂ ਪ੍ਰੋਡਕਟ ਵਾਊਚਰ।",
      slab1: "₹2,000 ਤੋਂ ਘੱਟ", slab2: "₹2,001 - ₹4,000", slab3: "₹4,001 - ₹8,000", slab4: "₹8,001 ਤੋਂ ਵੱਧ",
      plan2Title: "2. ਟੀਮ ਟਰਨਓਵਰ ਮੈਚਿੰਗ ਬੋਨਸ (3%, 4%, 5% ਬਾਇਨਰੀ ਮੈਚਿੰਗ)",
      plan2Closing: "15-ਦਿਨਾ ਕਲੋਜ਼ਿੰਗ",
      tier1Label: "ਕੁੱਲ ਆਮਦਨ ₹25,000 ਤੱਕ", tier2Label: "₹25,001 ਤੋਂ ₹50,000", tier3Label: "₹50,000 ਤੋਂ ਵੱਧ (ਉਮਰ ਭਰ)",
      tier3Badge: "5% (ਸਰਵਉੱਚ)",
      plan2Capping: "15-ਦਿਨਾ ਕੈਪਿੰਗ: ₹8,19,250 (ਮਹੀਨੇ ਵਿੱਚ ₹16,38,500 ਦੀ ਕਾਨੂੰਨੀ ਸੀਮਾ)",
      plan3Title: "3. ਜਨਰੇਸ਼ਨ ਰਾਇਲਟੀ ਬੋਨਸ (3% ਤੋਂ 8%)",
      plan3Payout: "ਪੰਦਰਵਾੜਾ ਰਾਇਲਟੀ",
      colSlab: "15-ਦਿਨਾ ਟਰਨਓਵਰ ਸਲੈਬ", colGen: "ਜਨਰੇਸ਼ਨ %", colBonus: "ਬੋਨਸ", colBenefit: "ਲੀਡਰਸ਼ਿਪ ਲਾਭ",
      genRow1Benefit: "ਬੇਸਿਕ ਜਨਰੇਸ਼ਨ ਅਨਲਾਕ",
      genRow2Benefit: "ਐਕਟਿਵ ਲੀਡਰਸ਼ਿਪ ਪਛਾਣ",
      genRow3Benefit: "ਬਿਜ਼ਨਸ ਕੰਸਲਟੈਂਟ (BC)",
      genRow4Benefit: "ਰੀਜਨਲ ਲੀਡਰਸ਼ਿਪ ਪੂਲ",
      genRow5Benefit: "ਸੀਨੀਅਰ ਕੰਸਲਟੈਂਟ ਪ੍ਰਾਪਤੀ",
      genRow6Benefit: "ਫਾਸਟ ਟਰੈਕ ਤੇ ਰਿਹਾਇਸ਼ੀ ਯਾਤਰਾ"
    },
    mr: {
      headerSub9: "उत्पादन तत्त्वज्ञान, R&D व कौटुंबिक सुरक्षा",
      sec1Title: "नेटसर्फचा वैज्ञानिक दृष्टिकोन व उत्पादन तत्त्वज्ञान",
      sec1Desc: "नेटसर्फ डायरेक्ट ही विषमुक्त शेती, निरोगी जीवनशैली आणि पर्यावरण रक्षणाची अग्रगण्य संस्था आहे. सन २००० पासून स्थापित कंपनीची सर्व उत्पादने भारत सरकारच्या विज्ञान व तंत्रज्ञान मंत्रालयाद्वारे (DSIR) मान्यताप्राप्त प्रयोगशाळेत तयार होतात.",
      pillar1Title: "DSIR मान्यताप्राप्त R&D केंद्र",
      pillar1Desc: "पुणे येथील अत्याधुनिक संशोधन केंद्रात शास्त्रज्ञांद्वारे सातत्यपूर्ण फॉर्म्युलेशन चाचण्या.",
      pillar2Title: "100% नैसर्गिक व नॉन-टॉक्सिक",
      pillar2Desc: "घातक रसायने व कृत्रिम स्टिरॉइड्सपासून पूर्णपणे मुक्त. मानव, माती व जनावरांसाठी १००% सुरक्षित.",
      pillar3Title: "ISO 9001:2015 व GMP प्रमाणित",
      pillar3Desc: "स्वच्छता व गुणवत्ता मानकांचे काटेकोर पालन करणाऱ्या अत्याधुनिक स्वयंचलित उत्पादन युनिट्स.",
      pillar4Title: "25 लाख+ समाधानी कुटुंबांचा विश्वास",
      pillar4Desc: "संपूर्ण भारतात २६ वर्षांपासून अखंड विश्वास. लाखो शेतकऱ्यांचा उत्पादन खर्च कमी व उत्पन्न दुप्पट.",
      divHeader: "प्रमुख उत्पादन विभागांचे उद्दिष्ट:",
      divAgri: "रासायनिक खतांनी नापीक होणारी जमीन सुपीक बनवून शेतकऱ्यांना समृद्ध करणे.",
      divCattle: "दुभत्या जनावरांची पचनसंस्था बळकट करून कोणत्याही इंजेक्शनशिवाय दूध व फॅट वाढवणे.",
      divHealth: "आधुनिक जीवनशैलीतील कुपोषण व ताणतणाव दूर करण्यासाठी शुद्ध हर्बल प्रोटीन व पोषण.",
      divHerbs: "सल्फेट-मुक्त सुरक्षित सौंदर्य प्रसाधने आणि एन्झाइम आधारित पर्यावरणपूरक होम केअर.",
      sec2Title: "झिरो इग्रेस फॉर्म्युला (Zero Egress Formula)",
      sec2Badge: "100% सुरक्षित करिअर",
      sec2Desc: "पारंपरिक कंपन्यांमध्ये टार्गेट पूर्ण न झाल्यास रँक घसरते किंवा व्हॉल्यूम शून्य होतो. नेटसर्फमध्ये तुमची मेहनत व रँक नेहमी सुरक्षित राहते.",
      pillDemotion: "नो डिमोशन", pillDemotionSub: "मिळालेली रँक आजीवन कायम",
      pillCarry: "लाइफटाइम कॅरी-फॉरवर्ड", pillCarrySub: "अनमॅच्ड व्हॉल्यूम कधीही लॅप्स नाही",
      pillStock: "शून्य सक्तीचा स्टॉक", pillStockSub: "घरात पेटी ठेवण्याची सक्ती नाही",
      pillAuto: "5+1 मोफत ऑटोशिप", pillAutoSub: "५ महिन्यांवर १ महिना उत्पादन मोफत",
      sec3Title: "फॅमिली प्रोटेक्शन प्लॅन (कौटुंबिक सुरक्षा कवच)",
      sec3Badge: "आजीवन सुरक्षा",
      sec3Desc: "नेटसर्फ आपल्या यशस्वी डायरेक्ट सेलर्सना आणि त्यांच्या कुटुंबांना संपूर्ण सामाजिक व आर्थिक सुरक्षा प्रदान करते:",
      sec3MedTitle: "₹3,00,000 मेडिक्लेम", sec3MedSub: "कुटुंबासाठी आरोग्य विमा संरक्षण",
      sec3AccTitle: "₹5,00,000 अपघात विमा", sec3AccSub: "अपघात सुरक्षा पॉलिसी",
      sec3NomTitle: "नॉमिनी ट्रान्सफर", sec3NomSub: "व्यवसाय व रॉयल्टी आजीवन हस्तांतरणीय",
      guaranteeText: "गुणवत्ता हमी: प्रत्येक उत्पादन बॅच-परीक्षित व क्यूआर कोड सुरक्षित आहे.",
      missionText: "आरोग्यम भारत डिजिटल हेल्थ मिशन",
      headerSub10: "नेटसर्फ संपूर्ण बिझनेस इन्कम प्लॅन व संपर्क",
      plan1Title: "1. रिटेल नफा व कमिशन (25% फ्लॅट + ₹100 व्हाउचर + 5% ते 15% स्लॅब)",
      plan1Payout: "पे-आउट: दर सोमवारी (Min ₹100 NEFT)",
      consumerAdv: "ग्राहक लाभ:",
      consumerAdvText: "ग्राहकांना २५% फ्लॅट सवलत आणि ऑनलाइन खरेदीवर ₹१०० चे अतिरिक्त प्रॉडक्ट व्हाउचर.",
      slab1: "₹2,000 पेक्षा कमी", slab2: "₹2,001 - ₹4,000", slab3: "₹4,001 - ₹8,000", slab4: "₹8,001 पेक्षा जास्त",
      plan2Title: "2. टीम टर्नओव्हर मॅचिंग बोनस (3%, 4%, 5% बायनरी मॅचिंग)",
      plan2Closing: "15-दिवसीय क्लोजिंग",
      tier1Label: "एकूण उत्पन्न ₹25,000 पर्यंत", tier2Label: "₹25,001 ते ₹50,000", tier3Label: "₹50,000 पेक्षा जास्त (आजीवन)",
      tier3Badge: "5% (सर्वोच्च)",
      plan2Capping: "पाक्षिक क्लोजिंग कॅपिंग: ₹8,19,250 (महिन्याला ₹16,38,500 ची कायदेशीर मर्यादा)",
      plan3Title: "3. जनरेशन रॉयल्टी बोनस (3% ते 8%)",
      plan3Payout: "पाक्षिक रॉयल्टी",
      colSlab: "15-दिवसीय टर्नओव्हर स्लॅब", colGen: "जनरेशन %", colBonus: "बोनस", colBenefit: "अतिरिक्त लीडरशिप लाभ",
      genRow1Benefit: "बेसिक जनरेशन अनलॉक",
      genRow2Benefit: "अॅक्टिव्ह लीडरशिप सन्मान",
      genRow3Benefit: "बिझनेस कन्सल्टंट (BC)",
      genRow4Benefit: "रीजनल लीडरशिप पूल",
      genRow5Benefit: "सिनियर कन्सल्टंट यश",
      genRow6Benefit: "फास्ट ट्रॅक व निवासी ट्रिप"
    },
    gu: {
      headerSub9: "ઉત્પાદન દર્શન, R&D અને પારિવારિક સુરક્ષા",
      sec1Title: "નેટસર્ફનો વૈજ્ઞાનિક અભિગમ અને ઉત્પાદન દર્શન",
      sec1Desc: "નેટસર્ફ ડાયરેક્ટ વિષમુક્ત ખેતી, સ્વસ્થ જીવનશૈલી અને પર્યાવરણ સુરક્ષાનું અગ્રણી અભિયાન છે. વર્ષ 2000થી સ્થાપિત કંપનીના તમામ ઉત્પાદનો ભારત સરકારના વિજ્ઞાન અને ટેકનોલોજી મંત્રાલય (DSIR) માન્ય R&D કેન્દ્રમાં તૈયાર થાય છે.",
      pillar1Title: "DSIR માન્ય ઇન-હાઉસ R&D કેન્દ્ર",
      pillar1Desc: "પુણે સ્થિત અત્યાધુનિક સંશોધન કેન્દ્રમાં વૈજ્ઞાનિકો દ્વારા સતત ફોર્મ્યુલેશન પરીક્ષણ.",
      pillar2Title: "100% કુદરતી અને બિન-ઝેરી",
      pillar2Desc: "હાનિકારક રસાયણો અને સ્ટેરોઇડ્સથી મુક્ત. માનવ, માટી અને પશુઓ માટે 100% સુરક્ષિત.",
      pillar3Title: "ISO 9001:2015 અને GMP પ્રમાણિત",
      pillar3Desc: "ગુણવત્તાના વૈશ્વિક ધોરણોનું પાલન કરતા અત્યાધુનિક ઓટોમેટેડ ઉત્પાદન એકમો.",
      pillar4Title: "25 લાખ+ સંતુષ્ટ પરિવારોનો વિશ્વાસ",
      pillar4Desc: "સમગ્ર ભારતમાં 26 વર્ષથી અતૂટ વિશ્વાસ. લાખો ખેડૂતોનો ખર્ચ ઘટ્યો અને ઉત્પાદન વધ્યું.",
      divHeader: "મુખ્ય ઉત્પાદન વિભાગોનો ઉદ્દેશ્ય:",
      divAgri: "રાસાયણિક ખાતરોથી બંજર થતી જમીનને પુનર્જીવિત કરી ખેડૂતોને સમૃદ્ધ બનાવવા.",
      divCattle: "દૂધાળા પશુઓની પાચનતંત્ર મજબૂત કરી કોઈપણ ઇન્જેક્શન વગર દૂધ અને ફેટ વધારવા.",
      divHealth: "આધુનિક જીવનશૈલીના કુપોષણ અને તણાવને દૂર કરવા શુદ્ધ હર્બલ પ્રોટીન અને પોષણ.",
      divHerbs: "સલ્ફેટ-મુક્ત સલામત પર્સનલ કેર અને એન્ઝાઇમ આધારિત ઇકો હોમ કેર ક્લીનર્સ.",
      sec2Title: "ઝીરો ઇગ્રેસ ફોર્મ્યુલા (Zero Egress Formula)",
      sec2Badge: "100% સુરક્ષિત કારકિર્દી",
      sec2Desc: "પરંપરાગત કંપનીઓની જેમ ટાર્ગેટ ન હોવા પર રેન્ક ઘટતો નથી કે વોલ્યુમ શૂન્ય થતું નથી. નેટસર્ફમાં તમારી મહેનત હંમેશા સુરક્ષિત રહે છે.",
      pillDemotion: "નો ડિમોશન", pillDemotionSub: "મેળવેલ રેન્ક આજીવન કાયમ",
      pillCarry: "લાઇફટાઇમ કેરી-ફોરવર્ડ", pillCarrySub: "વોલ્યુમ ક્યારેય લેપ્સ થતું નથી",
      pillStock: "શૂન્ય ફરજિયાત સ્ટોક", pillStockSub: "ઘરમાં પેટી રાખવાની મજબૂરી નથી",
      pillAuto: "5+1 મફત ઓટોશિપ", pillAutoSub: "5 મહિના પર 1 મહિનો પ્રોડક્ટ મફત",
      sec3Title: "ફેમિલી પ્રોટેક્શન પ્લાન (પારિવારિક સુરક્ષા કવચ)",
      sec3Badge: "આજીવન સુરક્ષા",
      sec3Desc: "નેટસર્ફ પોતાના સફળ ડાયરેક્ટ સેલર્સ અને તેમના પરિવારોને સંપૂર્ણ સામાજિક અને આર્થિક સુરક્ષા આપે છે:",
      sec3MedTitle: "₹3,00,000 મેડિક્લેમ", sec3MedSub: "પરિવાર માટે સ્વાસ્થ્ય વીમા સુરક્ષા",
      sec3AccTitle: "₹5,00,000 અકસ્માત કવર", sec3AccSub: "અકસ્માત સુરક્ષા પોલિસી",
      sec3NomTitle: "નોમિની ટ્રાન્સફર", sec3NomSub: "બિઝનેસ અને રોયલ્ટી આજીવન ટ્રાન્સફરેબલ",
      guaranteeText: "ગુણવત્તા ગેરંટી: દરેક પ્રોડક્ટ બેચ-ટેસ્ટેડ અને ક્યુઆર કોડ સુરક્ષિત છે.",
      missionText: "આરોગ્યમ ભારત ડિજિટલ મિશન",
      headerSub10: "નેટસર્ફ સંપૂર્ણ બિઝનેસ ઇનકમ પ્લાન અને સંપર્ક",
      plan1Title: "1. રિટેલ નફો અને કમિશન (25% ફ્લેટ + ₹100 વાઉચર + 5% થી 15% સ્લેબ)",
      plan1Payout: "પે-આઉટ: દર સોમવારે (Min ₹100 NEFT)",
      consumerAdv: "ગ્રાહક લાભ:",
      consumerAdvText: "ગ્રાહકોને 25% ફ્લેટ છૂટ અને ઓનલાઇન ખરીદી પર ₹100 નું વધારાનું પ્રોડક્ટ વાઉચર.",
      slab1: "₹2,000 થી ઓછું", slab2: "₹2,001 - ₹4,000", slab3: "₹4,001 - ₹8,000", slab4: "₹8,001 થી વધુ",
      plan2Title: "2. ટીમ ટર્નઓવર મેચિંગ બોનસ (3%, 4%, 5% બાઈનરી મેચિંગ)",
      plan2Closing: "15-દિવસીય ક્લોઝિંગ",
      tier1Label: "કુલ આવક ₹25,000 સુધી", tier2Label: "₹25,001 થી ₹50,000", tier3Label: "₹50,000 થી વધુ (આજીવન)",
      tier3Badge: "5% (સર્વોચ્ચ)",
      plan2Capping: "પાક્ષિક ક્લોઝિંગ કેપિંગ: ₹8,19,250 (મહિને ₹16,38,500 ની કાયદેસર મર્યાદા)",
      plan3Title: "3. જનરેશન રોયલ્ટી બોનસ (3% થી 8%)",
      plan3Payout: "પાક્ષિક રોયલ્ટી",
      colSlab: "15-દિવસીય ટર્નઓવર સ્લેબ", colGen: "જનરેશન %", colBonus: "બોનસ", colBenefit: "લીડરશિપ લાભ",
      genRow1Benefit: "બેસિક જનરેશન અનલોક",
      genRow2Benefit: "એક્ટિવ લીડરશિપ સન્માન",
      genRow3Benefit: "બિઝનેસ કન્સલ્ટન્ટ (BC)",
      genRow4Benefit: "રીજનલ લીડરશિપ પૂલ",
      genRow5Benefit: "સિનિયર કન્સલ્ટન્ટ સિદ્ધિ",
      genRow6Benefit: "ફાસ્ટ ટ્રેક અને રેસિડેન્શિયલ ટ્રીપ"
    },
    bn: {
      headerSub9: "পণ্য দর্শন, R&D ও পারিবারিক সুরক্ষা",
      sec1Title: "নেটসার্ফের বৈজ্ঞানিক দৃষ্টিভঙ্গি ও পণ্য দর্শন",
      sec1Desc: "নেটসার্ফ ডিরেক্ট ভারতে বিষমুক্ত কৃষি, সুস্থ জীবনযাত্রা ও পরিবেশ সুরক্ষার পথিকৃৎ। ২০০০ সাল থেকে ভারত সরকারের বিজ্ঞান ও প্রযুক্তি মন্ত্রক (DSIR) অনুমোদিত নিজস্ব গবেষণাগারে কঠোর পরীক্ষার পর প্রতিটি পণ্য তৈরি হয়।",
      pillar1Title: "DSIR অনুমোদিত ইন-হাউস R&D কেন্দ্র",
      pillar1Desc: "পুনেতে অবস্থিত অত্যাধুনিক গবেষণা কেন্দ্রে বিজ্ঞানীদের দ্বারা নিরবচ্ছিন্ন ফর্মুলেশন পরীক্ষা।",
      pillar2Title: "১০০% প্রাকৃতিক ও নন-টক্সিক",
      pillar2Desc: "ক্ষতিকর রাসায়নিক ও কৃত্রিম স্টেরয়েড মুক্ত। মানুষ, মাটি ও গবাদিপশুর জন্য ১০০% নিরাপদ।",
      pillar3Title: "ISO 9001:2015 এবং GMP সার্টিফাইড",
      pillar3Desc: "আন্তর্জাতিক পরিচ্ছন্নতা ও গুণমান বজায় রাখা অত্যাধুনিক স্বয়ংক্রিয় প্ল্যান্ট।",
      pillar4Title: "২৫ লাখ+ সন্তুষ্ট পরিবারের বিশ্বাস",
      pillar4Desc: "সারা ভারতে ২৬ বছরের অটল আস্থা। লক্ষ লক্ষ কৃষকের চাষের খরচ কমেছে ও ফলন বেড়েছে।",
      divHeader: "প্রধান পণ্য বিভাগসমূহের উদ্দেশ্য:",
      divAgri: "রাসায়নিক সারের দূষণ থেকে মাটিকে পুনরুজ্জীবিত করে কৃষকদের সমৃদ্ধ করা।",
      divCattle: "দুগ্ধবতী পশুর পরিপাকতন্ত্র উন্নত করে হরমোন ইনজেকশন ছাড়াই দুধ ও ফ্যাট বাড়ানো।",
      divHealth: "আধুনিক জীবনের অপুষ্টি ও ক্লান্তি দূর করতে খাঁটি ভেষজ প্রোটিন ও পুষ্টি।",
      divHerbs: "সালফেট-মুক্ত নিরাপদ রূপচর্চা এবং এনজাইম ভিত্তিক পরিবেশবান্ধব হোম কেয়ার।",
      sec2Title: "জিরো ইগ্রেস ফর্মুলা (Zero Egress Formula)",
      sec2Badge: "১০০% নিরাপদ ক্যারিয়ার",
      sec2Desc: "প্রথাগত এমএলএম কোম্পানির মতো টার্গেট পূরণ না হলে পদমর্যাদা কমে না বা ভলিউم শূন্য হয় না। নেটসার্ফে আপনার পরিশ্রম সর্বদা সুরক্ষিত।",
      pillDemotion: "কোনো ডিমোশন নেই", pillDemotionSub: "অর্জিত পদমর্যাদা আজীবন বহাল",
      pillCarry: "লাইফটাইম ক্যারি-ফরওয়ার্ড", pillCarrySub: "আনম্যাচড ভলিউম কখনও বাতিল হয় না",
      pillStock: "শূন্য বাধ্যতামূলক স্টক", pillStockSub: "বাড়িতে পণ্য মজুত রাখার বাধ্যবাধকতা নেই",
      pillAuto: "৫+১ ফ্রি অটোশিপ", pillAutoSub: "৫ মাসে ১ মাসের পণ্য সম্পূর্ণ বিনামূল্যে",
      sec3Title: "ফ্যামিলি প্রোটেকশন প্ল্যান (পারিবারিক সুরক্ষা ঢাল)",
      sec3Badge: "আজীবন সুরক্ষা",
      sec3Desc: "নেটসার্ফ তার সফল ডিরেক্ট সেলার এবং তাদের পরিবারকে সম্পূর্ণ সামাজিক ও আর্থিক সুরক্ষা প্রদান করে:",
      sec3MedTitle: "₹৩,০০,০০০ মেডিক্লেম", sec3MedSub: "পরিবারের স্বাস্থ্য বীমা সুরক্ষা",
      sec3AccTitle: "₹৫,০০,০০০ দুর্ঘটনা বীমা", sec3AccSub: "আকস্মিক দুর্ঘটনা সুরক্ষা পলিসি",
      sec3NomTitle: "নমিনি ট্রান্সফার", sec3NomSub: "ব্যবসা ও রয়্যালটি আজীবন হস্তান্তরযোগ্য",
      guaranteeText: "গুণমান গ্যারান্টি: প্রতিটি পণ্য ব্যাচ-পরীক্ষিত ও কিউআর কোড সুরক্ষিত।",
      missionText: "আরোগ্যম ভারত ডিজিটাল হেলথ মিশন",
      headerSub10: "নেটসার্ফ সম্পূর্ণ বিজনেস ইনকাম প্ল্যান ও যোগাযোগ",
      plan1Title: "১. রিটেল লাভ ও কমিশন (২৫% ফ্ল্যাট + ₹১০০ ভাউচার + ৫% থেকে ১৫% স্ল্যাব)",
      plan1Payout: "পে-আউট: প্রতি সোমবার (Min ₹100 NEFT)",
      consumerAdv: "ভোক্তা সুবিধা:",
      consumerAdvText: "গ্রাহকদের জন্য ২৫% ফ্ল্যাট ছাড় এবং অনলাইন কেনাকাটায় ₹১০০ অতিরিক্ত প্রোডাক্ট ভাউচার।",
      slab1: "₹২,০০০ এর কম", slab2: "₹২,০০১ - ₹৪,০০০", slab3: "₹৪,০০১ - ₹৮,০০০", slab4: "₹৮,০০১ এর উপরে",
      plan2Title: "২. টিম টার্নওভার ম্যাচিং বোনাস (৩%, ৪%, ৫% বাইনারি ম্যাচিং)",
      plan2Closing: "১৫-দিনের ক্লোজিং",
      tier1Label: "মোট আয় ₹২৫,০০০ পর্যন্ত", tier2Label: "₹২৫,০০১ থেকে ₹৫০,০০০", tier3Label: "₹৫০,০০০ এর উপরে (আজীবন)",
      tier3Badge: "৫% (সর্বোচ্চ)",
      plan2Capping: "পাক্ষিক ক্লোজিং ক্যাপিং: ₹৮,১৯,২৫০ (মাসে ₹১৬,৩৮,৫০০ বৈধ আয়ের সীমা)",
      plan3Title: "৩. জেনারেশন রয়্যালটি বোনাস (৩% থেকে ৮%)",
      plan3Payout: "পাক্ষিক রয়্যালটি",
      colSlab: "১৫-দিনের টার্নওভার স্ল্যাব", colGen: "জেনারেশন %", colBonus: "বোনাস", colBenefit: "নেতৃত্বের সুবিধা",
      genRow1Benefit: "বেসিক জেনারেশন আনলক",
      genRow2Benefit: "অ্যাক্টিভ লিডারশিপ স্বীকৃতি",
      genRow3Benefit: "বিজনেস কনসালট্যান্ট (BC)",
      genRow4Benefit: "রিজিওনাল লিডারশিপ পুল",
      genRow5Benefit: "সিনিয়র কনসালট্যান্ট সাফল্য",
      genRow6Benefit: "ফাস্ট ট্র্যাক ও আবাসিক ভ্রমণ"
    },
    te: {
      headerSub9: "ఉత్పాదక సిద్ధాంతం, R&D & కుటుంబ భద్రత",
      sec1Title: "నెట్‌సర్ఫ్ శాస్త్రీయ దృక్పథం & ఉత్పాదక సిద్ధాంతం",
      sec1Desc: "నెట్‌సర్ఫ్ డైరెక్ట్ విషరహిత వ్యవసాయం, ఆరోగ్యకరమైన జీవనశైలి మరియు పర్యావరణ పరిరక్షణలో భారతదేశంలోనే అగ్రగామి. 2000 నుండి DSIR గుర్తింపు పొందిన పరిశోధనా కేంద్రాలలో ఈ ఉత్పత్తులు తయారవుతున్నాయి.",
      pillar1Title: "DSIR గుర్తింపు పొందిన R&D కేంద్రం",
      pillar1Desc: "పూణేలోని పరిశోధనా కేంద్రంలో శాస్త్రవేత్తల నిరంతర నాణ్యతా పరీక్షలు.",
      pillar2Title: "100% సేంద్రీయ & విషరహితం",
      pillar2Desc: "రసాయనాలు మరియు స్టెరాయిడ్స్ లేనివి. మానవులకు, నేలకు, పశువులకు 100% సురక్షితం.",
      pillar3Title: "ISO 9001:2015 & GMP సర్టిఫైడ్",
      pillar3Desc: "అంతర్జాతీయ ప్రమాణాలతో కూడిన అత్యాధునిక ఆటోమేటెడ్ తయారీ యూనిట్లు.",
      pillar4Title: "25 లక్షలకు పైగా కుటుంబాల విశ్వాసం",
      pillar4Desc: "భారతదేశం అంతటా 26 సంవత్సరాల తిరుగులేని నమ్మకం. లక్షలాది రైతులకు అధిక లాభాలు.",
      divHeader: "ప్రధాన విభాగాల లక్ష్యం:",
      divAgri: "రసాయన ఎరువులతో నిస్సారమైన నేలను సారవంతం చేసి రైతులను సంపన్నులుగా చేయడం.",
      divCattle: "పాడి పశువుల జీర్ణక్రియను మెరుగుపరిచి సహజంగా పాలు, వెన్న శాతాన్ని పెంచడం.",
      divHealth: "ఆధునిక జీవనశైలి అలసటను దూరం చేయడానికి స్వచ్ఛమైన హెర్బల్ ప్రోటీన్ మరియు పోషణ.",
      divHerbs: "సల్ఫేట్ లేని వ్యక్తిగత సంరక్షణ మరియు పర్యావరణ అనుకూల గృహ శుభ్రత ఉత్పత్తులు.",
      sec2Title: "జీరో ఇగ్రెసెస్ ఫార్ములా (Zero Egress Formula)",
      sec2Badge: "100% సురక్షిత కెరీర్",
      sec2Desc: "ఇతర కంపెనీల వలె టార్గెట్లు లేకపోతే ర్యాంక్ తగ్గడం లేదా వాల్యూమ్ రద్దు కావడం జరగదు. మీ కష్టం ఎల్లప్పుడూ సురక్షితం.",
      pillDemotion: "నో డిమోషన్", pillDemotionSub: "సాధించిన ర్యాంక్ జీవితాంతం పదిలం",
      pillCarry: "లైఫ్‌టైమ్ క్యారీ-ఫార్వర్డ్", pillCarrySub: "వాల్యూమ్ ఎప్పటికీ రద్దు కాదు",
      pillStock: "జీరో స్టాకింగ్", pillStockSub: "ఇంట్లో స్టాక్ ఉంచే అవసరం లేదు",
      pillAuto: "5+1 ఉచిత ఆటోషిప్", pillAutoSub: "5 నెలలకు 1 నెల ఉచిత ఉత్పత్తులు",
      sec3Title: "ఫ్యామిలీ ప్రొటెక్షన్ ప్లాన్ (కుటుంబ రక్షణ కవచం)",
      sec3Badge: "జీవితకాల భద్రత",
      sec3Desc: "నెట్‌సర్ఫ్ తన డైరెక్ట్ సెల్లర్లకు మరియు వారి కుటుంబాలకు పూర్తి సామాజిక, ఆర్థిక భద్రతను అందిస్తుంది:",
      sec3MedTitle: "₹3,00,000 మెడిక్లెయిమ్", sec3MedSub: "కుటుంబ ఆరోగ్య బీమా రక్షణ",
      sec3AccTitle: "₹5,00,000 ప్రమాద బీమా", sec3AccSub: "ప్రమాద రక్షణ పాలసీ",
      sec3NomTitle: "నామినీ బదిలీ", sec3NomSub: "వ్యాపారం మరియు రాయల్టీ జీవితకాల బదిలీ",
      guaranteeText: "నాణ్యత హామీ: ప్రతి బ్యాచ్ పరీక్షించబడినది మరియు QR కోడ్ సురక్షితం.",
      missionText: "ఆరోగ్యం భారత్ డిజిటల్ మిషన్",
      headerSub10: "నెట్‌సర్ఫ్ సంపూర్ణ బిజినెస్ ప్లాన్ & సంప్రదింపులు",
      plan1Title: "1. రిటైల్ లాభం & కమీషన్ (25% ఫ్లాట్ + ₹100 వోచర్ + 5% నుండి 15% స్లాబ్స్)",
      plan1Payout: "చెల్లింపు: ప్రతి సోమవారం (Min ₹100 NEFT)",
      consumerAdv: "వినియోగదారుల ప్రయోజనం:",
      consumerAdvText: "వినియోగదారులకు 25% ఫ్లాట్ డిస్కౌంట్ మరియు ఆన్‌లైన్ కొనుగోళ్లపై ₹100 అదనపు వోచర్.",
      slab1: "₹2,000 కంటే తక్కువ", slab2: "₹2,001 - ₹4,000", slab3: "₹4,001 - ₹8,000", slab4: "₹8,001 కంటే ఎక్కువ",
      plan2Title: "2. టీమ్ టర్నోవర్ మ్యాచింగ్ బోనస్ (3%, 4%, 5% బైనరీ మ్యాచింగ్)",
      plan2Closing: "15-రోజుల క్లోజింగ్",
      tier1Label: "మొత్తం ఆదాయం ₹25,000 వరకు", tier2Label: "₹25,001 నుండి ₹50,000", tier3Label: "₹50,000 కంటే ఎక్కువ (జీవితాంతం)",
      tier3Badge: "5% (అత్యధికం)",
      plan2Capping: "15-రోజుల క్యాపింగ్: ₹8,19,250 (నెలకు ₹16,38,500 చట్టబద్ధ పరిమితి)",
      plan3Title: "3. జనరేషన్ రాయల్టీ బోనస్ (3% నుండి 8%)",
      plan3Payout: "పాక్షిక రాయల్టీ",
      colSlab: "15-రోజుల టర్నోవర్ స్లాబ్", colGen: "జనరేషన్ %", colBonus: "బోనస్", colBenefit: "నాయకత్వ ప్రయోజనం",
      genRow1Benefit: "బేసిక్ జనరేషన్ అన్‌లాక్",
      genRow2Benefit: "క్రియాశీల నాయకత్వ గుర్తింపు",
      genRow3Benefit: "బిజినెస్ కన్సల్టెంట్ (BC)",
      genRow4Benefit: "రీజినల్ లీడర్‌షిప్ పూల్",
      genRow5Benefit: "సీనియర్ కన్సల్టెంట్ సాఫల్యం",
      genRow6Benefit: "ఫాస్ట్ ట్రాక్ & నివాస పర్యటన"
    },
    ta: {
      headerSub9: "தயாரிப்பு தத்துவம், R&D மற்றும் குடும்ப பாதுகாப்பு",
      sec1Title: "நெட்சர்ஃப் அறிவியல் அணுகுமுறை மற்றும் தயாரிப்பு தத்துவம்",
      sec1Desc: "நெட்சர்ஃப் டைரக்ட் நச்சு இல்லாத விவசாயம், ஆரோக்கியமான வாழ்க்கை முறை மற்றும் சுற்றுச்சூழல் பாதுகாப்பில் முன்னணியில் உள்ளது. 2000 முதல் DSIR அங்கீகரிக்கப்பட்ட சொந்த ஆராய்ச்சி கூடங்களில் தயாரிப்புகள் உருவாகின்றன.",
      pillar1Title: "DSIR அங்கீகரிக்கப்பட்ட R&D மையம்",
      pillar1Desc: "புனேவில் உள்ள அதிநவீன மையத்தில் விஞ்ஞானிகளால் தொடர் ஆராய்ச்சி சோதனைகள்.",
      pillar2Title: "100% இயற்கை & நச்சுத்தன்மையற்றது",
      pillar2Desc: "ரசாயனங்கள் மற்றும் ஸ்டீராய்டுகள் இல்லாதது. மனிதர்கள், மண் மற்றும் கால்நடைகளுக்கு 100% பாதுகாப்பானது.",
      pillar3Title: "ISO 9001:2015 & GMP சான்றளிக்கப்பட்டது",
      pillar3Desc: "சர்வதேச தரத்தை கடைபிடிக்கும் அதிநவீன தானியங்கி உற்பத்தி பிரிவுகள்.",
      pillar4Title: "25 லட்சம்+ திருப்தியடைந்த குடும்பங்களின் நம்பிக்கை",
      pillar4Desc: "இந்தியா முழுவதும் 26 வருட அசைக்க முடியாத நம்பிக்கை. லட்சக்கணக்கான விவசாயிகளுக்கு அதிக லாபம்.",
      divHeader: "முக்கிய பிரிவுகளின் நோக்கம்:",
      divAgri: "ரசாயன உரங்களால் பாழாகும் மண்ணை வளப்படுத்தி விவசாயிகளை வளப்படுத்துதல்.",
      divCattle: "கால்நடைகளின் செரிமானத்தை சீராக்கி ஊசி இன்றி பால் மற்றும் கொழுப்பை அதிகரித்தல்.",
      divHealth: "நவீன வாழ்க்கை சோர்வை போக்க தூய மூலிகை புரதம் மற்றும் ஊட்டச்சத்து அளித்தல்.",
      divHerbs: "சல்பேட் இல்லாத தனிநபர் பராமரிப்பு மற்றும் இயற்கை வீட்டு சுத்திகரிப்பு திரவங்கள்.",
      sec2Title: "ஜீரோ எக்ரஸ் ஃபார்முலா (Zero Egress Formula)",
      sec2Badge: "100% பாதுகாப்பான தொழில்",
      sec2Desc: "வழக்கமான நிறுவனங்கள் போல இலக்குகள் தவறினால் பதவி இறக்கம் அல்லது பிசினஸ் இழப்பு ஏற்படாது. உங்கள் உழைப்பு என்றும் பாதுகாப்பானது.",
      pillDemotion: "பதவி இறக்கம் இல்லை", pillDemotionSub: "அடைந்த பதவி வாழ்நாள் முழுவதும்",
      pillCarry: "வாழ்நாள் கேரி-ஃபார்வர்டு", pillCarrySub: "பிசினஸ் வால்யூம் அழியாது",
      pillStock: "பொருட்கள் தேக்கம் இல்லை", pillStockSub: "வீட்டில் இருப்பு வைக்க தேவையில்லை",
      pillAuto: "5+1 இலவச ஆட்டோஷிப்", pillAutoSub: "5 மாதத்திற்கு 1 மாதம் பொருட்கள் இலவசம்",
      sec3Title: "ஃபேமிலி புரொடக்ஷன் பிளான் (குடும்ப பாதுகாப்பு கவசம்)",
      sec3Badge: "வாழ்நாள் பாதுகாப்பு",
      sec3Desc: "நெட்சர்ஃப் தனது விற்பனையாளர்களுக்கும் அவர்களின் குடும்பங்களுக்கும் முழு சமூக, நிதி பாதுகாப்பை வழங்குகிறது:",
      sec3MedTitle: "₹3,00,000 மெடிக்ளைம்", sec3MedSub: "குடும்ப மருத்துவ காப்பீடு பாதுகாப்பு",
      sec3AccTitle: "₹5,00,000 விபத்து காப்பீடு", sec3AccSub: "விபத்து பாதுகாப்பு பாலிசி",
      sec3NomTitle: "வாரிசுரிமை மாற்றம்", sec3NomSub: "தொழில் மற்றும் ராயல்டி வாழ்நாள் மாற்றம்",
      guaranteeText: "தர உத்தரவாதம்: ஒவ்வொரு தயாரிப்பும் பரிசோதிக்கப்பட்டு QR குறியீடு பாதுகாப்பு கொண்டது.",
      missionText: "ஆரோக்கியம் பாரத் டிஜிட்டல் மிஷன்",
      headerSub10: "நெட்சர்ஃப் முழு வணிக வருமான திட்டம் & தொடர்பு",
      plan1Title: "1. சில்லறை லாபம் & கமிஷன் (25% பிளாட் + ₹100 வவுச்சர் + 5% முதல் 15% ஸ்லாப்)",
      plan1Payout: "வருமானம்: ஒவ்வொரு திங்கட்கிழமையும் (Min ₹100 NEFT)",
      consumerAdv: "வாடிக்கையாளர் நன்மை:",
      consumerAdvText: "வாடிக்கையாளர்களுக்கு 25% நேரடி தள்ளுபடி மற்றும் ஆன்லைன் ஆர்டருக்கு ₹100 கூடுதல் தயாரிப்பு வவுச்சர்.",
      slab1: "₹2,000-க்கு கீழ்", slab2: "₹2,001 - ₹4,000", slab3: "₹4,001 - ₹8,000", slab4: "₹8,001-க்கு மேல்",
      plan2Title: "2. டீம் டர்ன்ஓவர் மேட்சிங் போனஸ் (3%, 4%, 5% பைனரி மேட்சிங்)",
      plan2Closing: "15-நாள் குளோசிங்",
      tier1Label: "மொத்த வருமானம் ₹25,000 வரை", tier2Label: "₹25,001 முதல் ₹50,000", tier3Label: "₹50,000-க்கு மேல் (வாழ்நாள்)",
      tier3Badge: "5% (உச்சபட்சம்)",
      plan2Capping: "15-நாள் உச்சவரம்பு: ₹8,19,250 (மாதத்திற்கு ₹16,38,500 சட்ட வரம்பு)",
      plan3Title: "3. ஜெனரேஷன் ராயல்டி போனஸ் (3% முதல் 8%)",
      plan3Payout: "15-நாள் ராயல்டி",
      colSlab: "15-நாள் டர்ன்ஓவர் ஸ்லாப்", colGen: "ஜெனரேஷன் %", colBonus: "போனஸ்", colBenefit: "தலைமைத்துவ நன்மை",
      genRow1Benefit: "அடிப்படை ஜெனரேஷன் அன்லாக்",
      genRow2Benefit: "செயல்பாட்டு தலைமை அங்கீகாரம்",
      genRow3Benefit: "பிசினஸ் கன்சல்டன்ட் (BC)",
      genRow4Benefit: "மண்டல தலைமைத்துவ பூல்",
      genRow5Benefit: "மூத்த கன்சல்டன்ட் சாதனை",
      genRow6Benefit: "ஃபாஸ்ட் டிராக் & தங்கும் சுற்றுலா"
    }
  };

  window.generateAndDownloadPdfCatalog = function () {
    const scopeRadio = document.querySelector('input[name="catalogScope"]:checked');
    const langRadio = document.querySelector('input[name="catalogLang"]:checked');
    const scope = scopeRadio ? scopeRadio.value : 'all';
    const langKey = langRadio ? langRadio.value : (currentSiteLang || 'hi');
    const baseI18n = I18N_CATALOG[langKey] || I18N_CATALOG.hi;
    const planI18n = I18N_PLAN_PAGES[langKey] || I18N_PLAN_PAGES.hi;

    const s = masterCatalogSettings || {};
    const i18n = {
      ...baseI18n,
      coverBadge: (langKey === 'hi' && s.cover_badge) ? s.cover_badge : baseI18n.coverBadge,
      title: (langKey === 'hi' && s.cover_title) ? s.cover_title : baseI18n.title,
      subtitle: (langKey === 'hi' && s.cover_subtitle) ? s.cover_subtitle : baseI18n.subtitle,
      coverCompanyDesc: (langKey === 'hi' && s.company_profile) ? s.company_profile : baseI18n.coverCompanyDesc,
      categoryIntro: (langKey === 'hi' && s.categories_overview) ? s.categories_overview : baseI18n.categoryIntro,
      distributorTitle: (langKey === 'hi' && s.distributor_heading) ? s.distributor_heading : baseI18n.distributorTitle,
      orderNote: (langKey === 'hi' && s.order_note) ? s.order_note : baseI18n.orderNote,
      corporateAddressText: s.official_address || baseI18n.corporateAddressText,
      customerCareText: s.customer_care_text || baseI18n.customerCareText,
      disclaimerText: (langKey === 'hi' && s.legal_disclaimer) ? s.legal_disclaimer : baseI18n.disclaimerText
    };

    const distName = (document.getElementById('npDistributorName')?.value || currentSponsor.name || DEFAULT_SUPPORT_NAME).trim();
    const distPhone = (document.getElementById('npDistributorPhone')?.value || currentSponsor.phone || DEFAULT_SUPPORT_PHONE).trim();

    // Filter products according to chosen scope
    let prodsToPrint = masterCatalog;
    if (scope === 'filtered') {
      prodsToPrint = masterCatalog.filter(p => {
        if (currentCategory !== 'all' && p.category !== currentCategory) return false;
        if (currentProblem !== 'all' && !matchesProblem(p, currentProblem)) return false;
        return true;
      });
      if (prodsToPrint.length === 0) prodsToPrint = masterCatalog;
    }

    window.closeCatalogDownloadModal();

    // Sort products in standard masterCategories sequence:
    const orderedCatIds = masterCategories.map(c => c.id);
    const sortedProds = [...prodsToPrint].sort((a, b) => {
      const idxA = orderedCatIds.indexOf(a.category);
      const idxB = orderedCatIds.indexOf(b.category);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

    // Chunk into 6 products per page (2 columns x 3 rows grid)
    const productPages = [];
    for (let i = 0; i < sortedProds.length; i += 6) {
      productPages.push(sortedProds.slice(i, i + 6));
    }

    const totalProductPages = productPages.length;
    // Total Pages: Cover (1) + Product Pages (7) + Philosophy & Protection (1) + Compensation Plan & Back Cover (1) = 10 Pages Total
    const totalPages = totalProductPages + 3;
    const todayDate = new Date().toLocaleDateString(langKey === 'en' ? 'en-US' : (langKey === 'hi' ? 'hi-IN' : 'en-IN'), { year: 'numeric', month: 'long', day: 'numeric' });

    // Render individual 2-column product card with enlarged images & bold typography
    function renderPdfGridProductCard(p) {
      const mrp = parseInt(p.mrp, 10) || 0;
      const discountPct = parseInt(p.discount_pct, 10) || 0;
      const offerPrice = p.discounted_price || (discountPct ? Math.round(mrp * (1 - discountPct / 100)) : mrp);
      const imgSrc = (p.image && !p.image.includes('logo.png')) ? (p.image.startsWith('http') ? p.image : 'https://aarogyamindia.online' + p.image) : 'https://aarogyamindia.online/images/logo/logo.png';
      const multi = getProductMultilingualData(p, langKey);
      const packTranslated = translatePackSize(p.pack_size, langKey);
      
      // Clean, short brand tag to give title full horizontal width
      const shortBrandTag = ({
        agri: 'Biofit',
        cattle: 'Cattle Care',
        health: 'Naturamore',
        herbs_more: 'Herbs & More',
        clean_more: 'Clean & More'
      })[p.category] || 'Netsurf';

      // Dynamic Auto-Font Scaling:
      // Computes font size dynamically based on character count so short text is bold & prominent,
      // and longer text scales smoothly without ever overflowing or pushing dosage out of view.
      const nameLen = (multi.name || '').length;
      const descLen = (multi.description || '').length;
      const ingLen = (multi.ingredients || '').length;
      const doseLen = (multi.dose || '').length;
      const totalChars = nameLen + descLen + ingLen + doseLen;

      let titleFont = '14.2px';
      let titleLh = '1.24';
      let descFont = '11.0px';
      let descLh = '1.34';
      let boxFont = '10.2px';
      let boxLh = '1.30';
      let boxPad = '3.5px 7px';
      let boxMargin = '3px';

      if (totalChars < 160) {
        // Short text: Maximum font size and impact
        titleFont = '14.8px';
        titleLh = '1.28';
        descFont = '11.5px';
        descLh = '1.38';
        boxFont = '10.6px';
        boxLh = '1.34';
        boxPad = '4px 8px';
        boxMargin = '4px';
      } else if (totalChars <= 250) {
        // Balanced standard
        titleFont = '13.8px';
        titleLh = '1.24';
        descFont = '10.8px';
        descLh = '1.32';
        boxFont = '10.0px';
        boxLh = '1.28';
        boxPad = '3px 7px';
        boxMargin = '3px';
      } else if (totalChars <= 320) {
        // Moderate length: Scaled down gracefully
        titleFont = '12.8px';
        titleLh = '1.20';
        descFont = '10.0px';
        descLh = '1.28';
        boxFont = '9.5px';
        boxLh = '1.24';
        boxPad = '2.5px 6px';
        boxMargin = '2.5px';
      } else {
        // Dense text: Scaled down to prevent overflow
        titleFont = '12.0px';
        titleLh = '1.18';
        descFont = '9.4px';
        descLh = '1.24';
        boxFont = '8.9px';
        boxLh = '1.20';
        boxPad = '2px 5px';
        boxMargin = '2px';
      }

      return `
        <div class="pdf-product-card-grid">
          <!-- Left: Larger Product Image, Pack Size & Dark Red Pricing -->
          <div class="pdf-card-left-grid">
            <div class="pdf-card-img-box-grid">
              <img src="${imgSrc}" alt="${escapeHtml(multi.name)}" onerror="this.src='https://aarogyamindia.online/images/logo/logo.png'">
            </div>
            ${packTranslated ? `<span class="pdf-pack-chip-grid">📦 ${escapeHtml(packTranslated)}</span>` : ''}
            <div class="pdf-price-box-grid">
              <span class="pdf-offer-price-grid">₹${offerPrice}</span>
              ${mrp > offerPrice ? `
                <div style="display:flex; align-items:center; justify-content:center; gap:3px; margin-top:2px;">
                  <span class="pdf-mrp-cross-grid">MRP ₹${mrp}</span>
                  <span class="pdf-discount-badge-grid">${discountPct}% ${escapeHtml(i18n.discountBadge || 'छूट')}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right: Bold Black Titles, Category Badge, Benefits & Dosage -->
          <div class="pdf-card-right-grid" style="display:flex; flex-direction:column; justify-content:space-between; flex:1; overflow:hidden;">
            <div>
              <div class="pdf-title-row-grid">
                <h4 class="pdf-product-title-grid" style="font-size:${titleFont}; line-height:${titleLh};">${escapeHtml(multi.name)}</h4>
                <span class="pdf-cat-chip-grid">${escapeHtml(shortBrandTag)}</span>
              </div>

              ${multi.description ? `
                <div class="pdf-card-desc-grid" style="font-size:${descFont}; line-height:${descLh}; margin:2px 0 ${boxMargin} 0;">
                  ${escapeHtml(multi.description)}
                </div>
              ` : ''}
            </div>

            <div style="display:flex; flex-direction:column; gap:${boxMargin};">
              ${multi.ingredients ? `
                <div class="pdf-card-box-grid" style="font-size:${boxFont}; line-height:${boxLh}; padding:${boxPad};">
                  <strong style="color:#0c2340; font-weight:800;">${escapeHtml(i18n.ingLabel)}</strong> ${escapeHtml(multi.ingredients)}
                </div>
              ` : ''}

              ${multi.dose ? `
                <div class="pdf-card-box-grid dose" style="font-size:${boxFont}; line-height:${boxLh}; padding:${boxPad};">
                  <strong style="color:#b91c1c; font-weight:800;">${escapeHtml(i18n.doseLabel)}</strong> ${escapeHtml(multi.dose)}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Corporate feature filler card to balance the 6-slot grid on the final product page
    function renderPdfQualityGuaranteeFiller(title, icon, desc) {
      return `
        <div class="pdf-product-card-grid" style="border: 2px solid #0c2340; background: #f8fbfe; height: 75mm; max-height: 75mm;">
          <div class="pdf-card-left-grid" style="justify-content: center; align-items: center; border-right: 1.5px dashed #cbdfe9;">
            <div style="width: 70px; height: 70px; border-radius: 50%; background: #0c2340; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 30px; box-shadow: 0 3px 8px rgba(12,35,64,0.12);">
              ${icon}
            </div>
            <span style="font-size: 9.5px; font-weight: 900; color: #b91c1c; text-transform: uppercase; margin-top: 5px; letter-spacing: 0.5px;">100% प्रामाणिक</span>
          </div>
          <div class="pdf-card-right-grid" style="justify-content: center; gap: 5px;">
            <span class="pdf-cat-chip-grid" style="align-self: flex-start; font-size: 9.5px; padding: 2px 7px;">✓ आधिकारिक नेटसर्फ गारंटी</span>
            <h4 class="pdf-product-title-grid" style="color: #0c2340; font-size: 14px; margin: 2px 0;">${title}</h4>
            <div class="pdf-card-desc-grid" style="color: #334155; font-size: 10.5px; line-height: 1.38; -webkit-line-clamp: 3;">
              ${desc}
            </div>
            <div style="background: #ffffff; border: 1.5px solid #cbdfe9; border-radius: 6px; padding: 4px 8px; font-size: 9.5px; color: #0c2340; font-weight: 700; margin-top: 3px;">
              📞 WhatsApp परामर्श: +91 ${escapeHtml(distPhone)}
            </div>
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(i18n.title)} - ${escapeHtml(distName)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @page {
            size: A4 portrait;
            margin: 5mm 7mm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', Roboto, Arial, sans-serif;
            color: #000000;
            margin: 0;
            padding: 0;
            background: #edf5fc !important;
            font-size: 10px;
            line-height: 1.35;
            -webkit-font-smoothing: subpixel-antialiased;
            text-rendering: geometricPrecision;
          }

          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: #edf5fc !important;
            }
          }

          .page-break {
            page-break-after: always;
            break-after: page;
          }

          /* Main Page Canvas: Glossy Light Blue */
          .pdf-page-wrap {
            height: 284mm;
            max-height: 284mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #edf5fc;
            box-sizing: border-box;
            padding: 2mm 0;
          }

          /* Master Corporate Cover Outer Frame */
          .cover-outer-frame {
            border: 3px solid #0c2340;
            border-radius: 14px;
            padding: 4px;
            background: #ffffff;
            height: 284mm;
            max-height: 284mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
          }
          .cover-inner-frame {
            border: 1.5px solid #0c2340;
            border-radius: 10px;
            padding: 16px 18px;
            display: flex;
            flex-direction: column;
            height: 100%;
            justify-content: space-between;
            box-sizing: border-box;
            background: #edf5fc;
          }

          /* Running Header */
          .running-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0c2340;
            background: #ffffff;
            padding: 5px 12px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(12, 35, 64, 0.04);
            margin-bottom: 5px;
          }

          /* Running Footer */
          .running-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1.5px solid #0c2340;
            padding-top: 4px;
            margin-top: 4px;
            font-size: 8.5px;
            color: #0c2340;
            font-weight: 700;
          }

          /* Category Header Bar */
          .pdf-cat-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #0c2340;
            color: #ffffff;
            padding: 5px 12px;
            border-radius: 7px;
            margin-bottom: 6px;
            border-left: 5px solid #b91c1c;
          }

          /* 2-Column Grid: 6 Products Per Page (2 cols x 3 rows) - Fixed 75mm Shelf Slots */
          .pdf-grid-6 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(3, 75mm);
            gap: 2.5mm 3.5mm;
            height: 232mm;
            max-height: 232mm;
            overflow: hidden;
            margin: 2px 0 3px 0;
          }

          /* Individual 2-Column Product Shelf Card - High-Contrast Razor-Sharp Typography */
          .pdf-product-card-grid {
            background: #ffffff;
            border: 1.5px solid #0c2340;
            border-radius: 9px;
            padding: 6px 9px;
            display: flex;
            gap: 10px;
            box-shadow: 0 2px 6px rgba(12, 35, 64, 0.06);
            box-sizing: border-box;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            height: 75mm;
            max-height: 75mm;
            overflow: hidden;
            align-items: stretch;
          }

          .pdf-card-left-grid {
            width: 100px;
            min-width: 100px;
            max-width: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            gap: 2px;
            flex-shrink: 0;
            border-right: 1.5px dashed #cbdfe9;
            padding-right: 8px;
          }

          .pdf-card-img-box-grid {
            width: 90px;
            height: 90px;
            background: #ffffff;
            border: 1.2px solid #cbdfe9;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 3px;
            box-sizing: border-box;
          }
          .pdf-card-img-box-grid img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .pdf-pack-chip-grid {
            font-size: 10.5px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            background: #edf5fc;
            color: #0c2340;
            border: 1px solid #cbdfe9;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
            white-space: nowrap;
          }

          .pdf-price-box-grid {
            text-align: center;
            width: 100%;
            border-top: 1.5px solid #edf5fc;
            padding-top: 2px;
          }
          .pdf-offer-price-grid {
            font-size: 22px;
            font-weight: 900;
            color: #b91c1c;
            display: block;
            line-height: 1.1;
          }
          .pdf-mrp-cross-grid {
            font-size: 10.5px;
            color: #475569;
            text-decoration: line-through;
            font-weight: 700;
          }
          .pdf-discount-badge-grid {
            font-size: 9.5px;
            font-weight: 800;
            background: #fee2e2;
            color: #b91c1c;
            padding: 1px 5px;
            border-radius: 3px;
            border: 1px solid #fecaca;
          }

          .pdf-card-right-grid {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 2.5px;
            overflow: hidden;
          }
          .pdf-title-row-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 6px;
          }
          .pdf-product-title-grid {
            font-size: 14px;
            font-weight: 900;
            color: #000000;
            margin: 0;
            line-height: 1.25;
            letter-spacing: -0.2px;
          }
          .pdf-cat-chip-grid {
            font-size: 9px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 4px;
            background: #edf5fc;
            color: #0c2340;
            border: 1px solid #0c2340;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .pdf-card-desc-grid {
            font-size: 10.8px;
            font-weight: 600;
            color: #0f172a;
            line-height: 1.35;
            margin: 2px 0;
          }
          .pdf-card-box-grid {
            background: #f8fbfe;
            border-left: 3.5px solid #0c2340;
            border-radius: 4px;
            padding: 3px 7px;
            font-size: 10px;
            line-height: 1.32;
            color: #000000;
            font-weight: 600;
          }
          .pdf-card-box-grid.dose {
            border-left-color: #b91c1c;
            background: #fff8f8;
            color: #000000;
          }

          /* Running Header & Footer Font Increases */
          .running-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0c2340;
            background: #ffffff;
            padding: 6px 14px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(12, 35, 64, 0.04);
            margin-bottom: 5px;
          }
          .running-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1.5px solid #0c2340;
            padding-top: 5px;
            margin-top: 4px;
            font-size: 10px;
            color: #0c2340;
            font-weight: 800;
          }
          .pdf-cat-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #0c2340;
            color: #ffffff;
            padding: 6px 14px;
            border-radius: 7px;
            margin-bottom: 5px;
            border-left: 5px solid #b91c1c;
            font-size: 12px;
            font-weight: 800;
          }

          /* Grand Netsurf Hero Branding Card */
          .netsurf-grand-brand-card {
            background: #ffffff;
            border: 2px solid #0c2340;
            border-radius: 12px;
            padding: 14px 16px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(12, 35, 64, 0.08);
            margin: 6px 0;
          }
          .netsurf-slogan-title {
            font-size: 26px;
            font-weight: 900;
            color: #b91c1c;
            letter-spacing: 0.5px;
            margin: 4px 0 2px 0;
          }
          .netsurf-slogan-tagline {
            font-size: 11px;
            font-weight: 700;
            color: #0c2340;
            margin-bottom: 6px;
          }

          .cover-hero-card {
            background: #0c2340;
            color: #ffffff;
            border-radius: 12px;
            padding: 14px 16px;
            text-align: center;
            margin: 6px 0;
          }
          .cover-badge-pill {
            display: inline-block;
            background: #b91c1c;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 900;
            padding: 3px 14px;
            border-radius: 16px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .cover-title-text {
            font-size: 21px;
            font-weight: 900;
            color: #ffffff;
            margin: 6px 0 3px 0;
            line-height: 1.2;
          }
          .cover-subtitle-text {
            font-size: 10.5px;
            color: #edf5fc;
            margin: 0;
            line-height: 1.4;
          }

          /* Presenter Platinum Card */
          .presenter-platinum-card {
            background: #0c2340;
            color: #ffffff;
            border-radius: 10px;
            padding: 12px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 6px;
            border-left: 5px solid #b91c1c;
          }

          /* Plan Table Styles */
          .pdf-plan-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(12, 35, 64, 0.04);
            margin: 6px 0;
          }
          .pdf-plan-table th {
            background: #0c2340;
            color: #ffffff;
            padding: 6px 10px;
            text-align: left;
            font-weight: 800;
            border: 1px solid #0c2340;
          }
          .pdf-plan-table td {
            padding: 5px 10px;
            border: 1px solid #cbdfe9;
            color: #0a0f1d;
          }
          .pdf-plan-table tr:nth-child(even) {
            background: #f8fbfe;
          }
        </style>
      </head>
      <body>

        <!-- Screen Only Top Toolbar -->
        <div class="no-print" style="position: sticky; top: 0; z-index: 99999; background: #0c2340; color: #ffffff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 16px rgba(0,0,0,0.3); border-bottom: 3px solid #b91c1c;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:24px;">📥</span>
            <div>
              <strong style="font-size:14px; display:block;">${escapeHtml(i18n.title)} (${prodsToPrint.length} ${escapeHtml(i18n.productsCountSuffix || 'उत्पाद')})</strong>
              <span style="font-size:11px; color:#cbd5e1;">2-कॉलम 6-उत्पाद ग्रिड • पूर्ण प्रोडक्ट फिलॉसफी व बिज़नेस प्लान शामिल</span>
            </div>
          </div>
          <div style="display:flex; gap:10px;">
            <button type="button" onclick="window.print()" style="background:#b91c1c; color:#fff; border:none; padding:9px 20px; border-radius:20px; font-weight:800; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 3px 10px rgba(185,28,28,0.4);">
              📥 PDF डाउनलोड / प्रिंट करें
            </button>
            <button type="button" onclick="window.close()" style="background:#1e293b; color:#cbd5e1; border:none; padding:9px 16px; border-radius:20px; font-weight:700; font-size:12px; cursor:pointer;">
              ✕ बंद करें
            </button>
          </div>
        </div>

        <div style="padding: 6px 8px;">

          <!-- ================= PAGE 1: GRAND CORPORATE COVER ================= -->
          <div class="page-break">
            <div class="cover-outer-frame">
              <div class="cover-inner-frame">

                <!-- Header: Aarogyam India & Official Netsurf Logo -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0c2340; padding-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://aarogyamindia.online/images/logo/logo.png" style="height: 46px; width: auto;" alt="Aarogyam India" onerror="this.src='/images/logo/logo.png'">
                    <div>
                      <h1 style="font-size: 21px; font-weight: 900; color: #0c2340; margin: 0; letter-spacing: -0.5px;">AAROGYAM INDIA</h1>
                      <span style="font-size: 9.5px; font-weight: 800; color: #b91c1c; letter-spacing: 0.8px;">NATIONAL DIRECT HEALTH & AGRI NETWORK</span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="text-align: right;">
                      <span style="font-size: 8px; font-weight: 800; color: #0c2340; letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(i18n.officialPartner)}</span>
                      <div style="font-size: 12px; font-weight: 900; color: #b91c1c;">NETSURF DIRECT</div>
                    </div>
                    <img src="https://aarogyamindia.online/images/logo/netsurf-logo.png" style="height: 42px; width: 42px; object-fit: contain; border-radius: 6px; border: 1.5px solid #0c2340;" alt="Netsurf" onerror="this.src='/images/logo/netsurf-logo.png'">
                  </div>
                </div>

                <!-- Grand Netsurf Hero Branding Card with Slogan: सेहत, बरकत, मुस्कुराहट -->
                <div class="netsurf-grand-brand-card">
                  <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 4px;">
                    <img src="https://aarogyamindia.online/images/logo/netsurf-sehat-barkat.png" style="height: 64px; max-width: 290px; object-fit: contain;" alt="Netsurf Direct - सेहत, बरकत, मुस्कुराहट" onerror="this.style.display='none';">
                  </div>
                  <div class="netsurf-slogan-title">
                    ✨ ${escapeHtml(i18n.slogan || 'सेहत • बरकत • मुस्कुराहट')} ✨
                  </div>
                  <div class="netsurf-slogan-tagline">
                    ${escapeHtml(i18n.sloganTagline || '26 वर्षों का अटूट विश्वास • DSIR मान्यता प्राप्त इन-हाउस R&D केंद्र (सन 2000 से स्थापित)')}
                  </div>
                  <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                    <span style="background: #edf5fc; border: 1px solid #0c2340; font-size: 8.5px; font-weight: 800; color: #0c2340; padding: 3px 10px; border-radius: 6px;">
                      🏛️ DSIR Recognized In-House R&D
                    </span>
                    <span style="background: #edf5fc; border: 1px solid #0c2340; font-size: 8.5px; font-weight: 800; color: #b91c1c; padding: 3px 10px; border-radius: 6px;">
                      🌿 100% Bio-Technology & Organic
                    </span>
                    <span style="background: #edf5fc; border: 1px solid #0c2340; font-size: 8.5px; font-weight: 800; color: #0c2340; padding: 3px 10px; border-radius: 6px;">
                      👥 2.5 Million+ Satisfied Families
                    </span>
                  </div>
                </div>

                <!-- Main Hero Plaque -->
                <div class="cover-hero-card">
                  <div class="cover-badge-pill">${i18n.coverBadge}</div>
                  <h2 class="cover-title-text">${i18n.title}</h2>
                  <p class="cover-subtitle-text">${i18n.subtitle}</p>
                  <div style="margin-top: 6px; display: flex; justify-content: center; gap: 16px; font-size: 10px; color: #edf5fc; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px;">
                    <span>📅 ${i18n.dateLabel} <strong style="color: #ffffff;">${todayDate}</strong></span>
                    <span>📦 ${i18n.totalProductsLabel} <strong style="color: #ffffff;">${prodsToPrint.length}</strong></span>
                    <span>🌐 <strong>7-Language Certified</strong></span>
                  </div>
                </div>

                <!-- Corporate Credibility Box -->
                <div style="background: #ffffff; border: 1.5px solid #d4e5f2; border-left: 5px solid #0c2340; border-radius: 10px; padding: 10px 14px; margin: 4px 0;">
                  <h3 style="font-size: 11.5px; font-weight: 800; color: #0c2340; margin: 0 0 3px 0;">
                    🏢 ${i18n.coverCompanyTitle}
                  </h3>
                  <p style="font-size: 9.2px; color: #334155; line-height: 1.42; margin: 0 0 5px 0;">
                    ${i18n.coverCompanyDesc}
                  </p>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <span style="background: #edf5fc; border: 1px solid #cbdfe9; font-size: 8.5px; font-weight: 700; color: #0c2340; padding: 2px 7px; border-radius: 4px;">
                      🏛️ 26 Years Corporate Trust
                    </span>
                    <span style="background: #edf5fc; border: 1px solid #cbdfe9; font-size: 8.5px; font-weight: 700; color: #b91c1c; padding: 2px 7px; border-radius: 4px;">
                      🔬 In-House DSIR Recognized R&D
                    </span>
                    <span style="background: #edf5fc; border: 1px solid #cbdfe9; font-size: 8.5px; font-weight: 700; color: #0c2340; padding: 2px 7px; border-radius: 4px;">
                      🇮🇳 Direct Selling Rules 2021 Compliant
                    </span>
                  </div>
                </div>

                <!-- 5-Category Executive Colorful KPI Cards -->
                <div style="background: #ffffff; border: 2px solid #0c2340; border-radius: 12px; padding: 10px 14px; margin: 6px 0; box-shadow: 0 4px 12px rgba(12,35,64,0.06);">
                  <div style="font-size: 13px; font-weight: 900; color: #0c2340; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                    <span>🌱 ${i18n.categoryIntroTitle}</span>
                    <span style="font-size: 10px; font-weight: 800; color: #b91c1c;">5 प्रमुख वैज्ञानिक श्रेणियां</span>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; border-radius: 10px; padding: 10px 4px; box-shadow: 0 4px 10px rgba(5,150,105,0.25);">
                      <div style="font-size: 20px; line-height: 1;">🌾</div>
                      <strong style="font-size: 11.5px; display: block; margin-top: 4px; color: #ffffff;">Biofit Agri</strong>
                      <span style="font-size: 8.5px; color: #a7f3d0; font-weight: 700; display: block;">जैविक कृषि</span>
                    </div>
                    <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; border-radius: 10px; padding: 10px 4px; box-shadow: 0 4px 10px rgba(217,119,6,0.25);">
                      <div style="font-size: 20px; line-height: 1;">🐄</div>
                      <strong style="font-size: 11.5px; display: block; margin-top: 4px; color: #ffffff;">Cattle Care</strong>
                      <span style="font-size: 8.5px; color: #fde68a; font-weight: 700; display: block;">पशु पोषण व डेयरी</span>
                    </div>
                    <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff; border-radius: 10px; padding: 10px 4px; box-shadow: 0 4px 10px rgba(225,29,72,0.25);">
                      <div style="font-size: 20px; line-height: 1;">❤️</div>
                      <strong style="font-size: 11.5px; display: block; margin-top: 4px; color: #ffffff;">Naturamore</strong>
                      <span style="font-size: 8.5px; color: #fecdd3; font-weight: 700; display: block;">स्वास्थ्य पोषण</span>
                    </div>
                    <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; border-radius: 10px; padding: 10px 4px; box-shadow: 0 4px 10px rgba(13,148,136,0.25);">
                      <div style="font-size: 20px; line-height: 1;">🌿</div>
                      <strong style="font-size: 11.5px; display: block; margin-top: 4px; color: #ffffff;">Herbs & More</strong>
                      <span style="font-size: 8.5px; color: #99f6e4; font-weight: 700; display: block;">पर्सनल केयर</span>
                    </div>
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; border-radius: 10px; padding: 10px 4px; box-shadow: 0 4px 10px rgba(37,99,235,0.25);">
                      <div style="font-size: 20px; line-height: 1;">🏡</div>
                      <strong style="font-size: 11.5px; display: block; margin-top: 4px; color: #ffffff;">Clean & More</strong>
                      <span style="font-size: 8.5px; color: #bfdbfe; font-weight: 700; display: block;">इको होम केयर</span>
                    </div>
                  </div>
                </div>

                <!-- Platinum Presenter Business Card on Cover -->
                <div class="presenter-platinum-card">
                  <div>
                    <span style="font-size: 8.5px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">${i18n.distributorTitle}</span>
                    <div style="font-size: 15px; font-weight: 900; color: #ffffff; margin-top: 2px;">${escapeHtml(distName)}</div>
                    <div style="font-size: 13px; font-weight: 900; color: #fca5a5; margin-top: 2px;">${i18n.phoneWaLabel} +91 ${escapeHtml(distPhone)}</div>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 8.5px; color: #cbd5e1;">${i18n.helplineLabel}</span>
                    <strong style="display: block; font-size: 12px; color: #ffffff;">+91 79744 22572</strong>
                    <span style="font-size: 8.5px; color: #cbd5e1;">www.aarogyamindia.online</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- ================= 2-COLUMN GRID PRODUCT PAGES (6 Products Per Page) ================= -->
          ${productPages.map((pageProds, pageIdx) => {
            const catsOnPage = [...new Set(pageProds.map(p => getTranslatedCategory(p.category, langKey)))];
            const fillerCount = 6 - pageProds.length;
            const fillers = [];

            if (fillerCount > 0) {
              const fillerData = [
                { title: 'DSIR शोध व गुणवत्ता', icon: '🔬', desc: 'भारत सरकार मान्यता प्राप्त इन-हाउस R&D केंद्र द्वारा 100% बायो-टेक्नोलॉजी आधारित प्रामाणिक फॉर्मूलेशन।' },
                { title: 'घर-घर सुरक्षित डिलीवरी', icon: '🚚', desc: 'सीधे कंपनी से मूल सील-पैक उत्पाद सुरक्षित होम डिलीवरी व संपूर्ण सलाहकार मार्गदर्शन के साथ उपलब्ध।' },
                { title: '24×7 कस्टमर सपोर्ट', icon: '📞', desc: 'उत्पाद खुराक, फसल सुरक्षा या पशु पोषण सलाह हेतु सीधे हमारे अधिकृत केंद्र से संपर्क करें।' }
              ];
              for (let f = 0; f < fillerCount; f++) {
                const item = fillerData[f % fillerData.length];
                fillers.push(renderPdfQualityGuaranteeFiller(item.title, item.icon, item.desc));
              }
            }

            return `
              <div class="page-break pdf-page-wrap">

                <!-- Running Header -->
                <div class="running-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="https://aarogyamindia.online/images/logo/logo.png" style="height: 30px; width: auto;" alt="Aarogyam India" onerror="this.src='/images/logo/logo.png'">
                    <div>
                      <strong style="font-size: 12.5px; color: #0c2340; display: block; line-height: 1.1;">AAROGYAM INDIA</strong>
                      <span style="font-size: 9.5px; font-weight: 700; color: #b91c1c;">${escapeHtml(i18n.title)}</span>
                    </div>
                  </div>

                  <div style="text-align: center; font-size: 9.5px; color: #0a0f1d;">
                    <span>${escapeHtml(i18n.presentedByHeader)} <strong style="color: #0c2340;">${escapeHtml(distName)}</strong></span>
                    <span style="display: block; font-size: 9.5px; color: #b91c1c; font-weight: 800;">📞 WhatsApp: +91 ${escapeHtml(distPhone)}</span>
                  </div>

                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="text-align: right;">
                      <span style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block;">${escapeHtml(i18n.officialPartner)}</span>
                      <strong style="font-size: 10px; font-weight: 900; color: #b91c1c;">NETSURF DIRECT</strong>
                    </div>
                    <img src="https://aarogyamindia.online/images/logo/netsurf-logo.png" style="height: 28px; width: 28px; object-fit: contain; border-radius: 4px; border: 1px solid #cbd5e1;" alt="Netsurf" onerror="this.src='/images/logo/netsurf-logo.png'">
                  </div>
                </div>

                <!-- Category Header Bar -->
                <div class="pdf-cat-bar">
                  <span style="display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 800;">
                    <span>📑</span>
                    <span>${i18n.categoryBannerPrefix || 'श्रेणी:'} ${escapeHtml(catsOnPage.join(' • '))}</span>
                  </span>
                  <span style="font-size: 9px; font-weight: 700; color: #cbd5e1;">
                    (${i18n.pageLabel || 'पृष्ठ'} ${pageIdx + 1} / ${totalProductPages} • 6 ${i18n.productsCountSuffix || 'उत्पाद स्लॉट'})
                  </span>
                </div>

                <!-- 2-Column Grid (6 Products) -->
                <div class="pdf-grid-6">
                  ${pageProds.map(p => renderPdfGridProductCard(p)).join('')}
                  ${fillers.join('')}
                </div>

                <!-- Running Footer -->
                <div class="running-footer">
                  <span>📄 ${i18n.pageLabel || 'पृष्ठ'} ${pageIdx + 2} / ${totalPages}</span>
                  <span>🛡️ ${i18n.genuineFooter}</span>
                  <span>${i18n.helplineFooter}</span>
                </div>
              </div>
            `;
          }).join('')}

          <!-- ================= PAGE A: PRODUCT PHILOSOPHY, R&D & ZERO EGRESS FAMILY PROTECTION (PAGE 9) ================= -->
          <div class="page-break pdf-page-wrap">
            <div class="running-header">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="https://aarogyamindia.online/images/logo/logo.png" style="height: 34px; width: auto;" alt="Aarogyam India" onerror="this.src='/images/logo/logo.png'">
                <div>
                  <strong style="font-size: 14px; color: #0c2340; display: block; line-height: 1.1;">AAROGYAM INDIA</strong>
                  <span style="font-size: 10.5px; font-weight: 700; color: #b91c1c;">${planI18n.headerSub9}</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 11px; font-weight: 900; color: #b91c1c;">NETSURF DIRECT</strong>
                <img src="https://aarogyamindia.online/images/logo/netsurf-logo.png" style="height: 32px; width: 32px; object-fit: contain; border-radius: 4px; border: 1px solid #cbd5e1;" alt="Netsurf">
              </div>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: #ffffff; border: 2px solid #0c2340; border-radius: 12px; padding: 14px 18px; margin: 4px 0; gap: 10px;">
              <!-- Section 1: 26 Years Scientific Heritage & 4 Research Pillars -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0c2340; padding-bottom: 5px; margin-bottom: 8px;">
                  <h2 style="font-size: 17px; font-weight: 900; color: #0c2340; margin: 0;">🔬 ${planI18n.sec1Title}</h2>
                  <span style="background: #b91c1c; color: #fff; font-size: 9.5px; font-weight: 800; padding: 3px 10px; border-radius: 10px;">100% ORGANIC & BIOTECH</span>
                </div>
                <p style="font-size: 11px; color: #334155; line-height: 1.45; margin: 0 0 10px 0;">
                  ${planI18n.sec1Desc}
                </p>

                <!-- 4 Research Pillars -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                  <div style="background: #edf5fc; border-left: 4px solid #0c2340; border-radius: 7px; padding: 8px 10px;">
                    <strong style="font-size: 12px; color: #0c2340; display: block;">🏛️ ${planI18n.pillar1Title}</strong>
                    <span style="font-size: 9.8px; color: #334155; line-height: 1.35; display: block; margin-top: 2px;">${planI18n.pillar1Desc}</span>
                  </div>
                  <div style="background: #edf5fc; border-left: 4px solid #b91c1c; border-radius: 7px; padding: 8px 10px;">
                    <strong style="font-size: 12px; color: #b91c1c; display: block;">🌿 ${planI18n.pillar2Title}</strong>
                    <span style="font-size: 9.8px; color: #334155; line-height: 1.35; display: block; margin-top: 2px;">${planI18n.pillar2Desc}</span>
                  </div>
                  <div style="background: #edf5fc; border-left: 4px solid #0c2340; border-radius: 7px; padding: 8px 10px;">
                    <strong style="font-size: 12px; color: #0c2340; display: block;">🏭 ${planI18n.pillar3Title}</strong>
                    <span style="font-size: 9.8px; color: #334155; line-height: 1.35; display: block; margin-top: 2px;">${planI18n.pillar3Desc}</span>
                  </div>
                  <div style="background: #edf5fc; border-left: 4px solid #b91c1c; border-radius: 7px; padding: 8px 10px;">
                    <strong style="font-size: 12px; color: #b91c1c; display: block;">👥 ${planI18n.pillar4Title}</strong>
                    <span style="font-size: 9.8px; color: #334155; line-height: 1.35; display: block; margin-top: 2px;">${planI18n.pillar4Desc}</span>
                  </div>
                </div>

                <!-- Division Summaries -->
                <div style="border: 1.5px solid #cbdfe9; border-radius: 8px; padding: 8px 12px; background: #f8fbfe;">
                  <strong style="font-size: 12px; color: #0c2340; display: block; margin-bottom: 5px;">📋 ${planI18n.divHeader}</strong>
                  <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10.2px; color: #334155; line-height: 1.35;">
                    <div><strong>🌾 Biofit Agriculture:</strong> ${planI18n.divAgri}</div>
                    <div><strong>🐄 Pet-Vet Cattle Care:</strong> ${planI18n.divCattle}</div>
                    <div><strong>❤️ Naturamore Nutraceuticals:</strong> ${planI18n.divHealth}</div>
                    <div><strong>🌿 Herbs & More & Clean & More:</strong> ${planI18n.divHerbs}</div>
                  </div>
                </div>
              </div>

              <!-- Section 2: Zero Egress Formula -->
              <div style="background: #0c2340; color: #ffffff; border-radius: 10px; padding: 10px 14px; border-left: 5px solid #b91c1c;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h3 style="font-size: 14.5px; font-weight: 900; margin: 0; color: #ffffff;">🛡️ ${planI18n.sec2Title}</h3>
                  <span style="background: #b91c1c; font-size: 9px; font-weight: 900; padding: 2.5px 9px; border-radius: 10px;">${planI18n.sec2Badge}</span>
                </div>
                <p style="font-size: 10.5px; color: #edf5fc; margin: 4px 0 7px 0; line-height: 1.38;">
                  ${planI18n.sec2Desc}
                </p>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; font-size: 10px;">
                  <div style="background: rgba(255,255,255,0.12); padding: 5px; border-radius: 6px;"><strong style="font-size:11px;">${planI18n.pillDemotion}</strong><br>${planI18n.pillDemotionSub}</div>
                  <div style="background: rgba(255,255,255,0.12); padding: 5px; border-radius: 6px;"><strong style="font-size:11px;">${planI18n.pillCarry}</strong><br>${planI18n.pillCarrySub}</div>
                  <div style="background: rgba(255,255,255,0.12); padding: 5px; border-radius: 6px;"><strong style="font-size:11px;">${planI18n.pillStock}</strong><br>${planI18n.pillStockSub}</div>
                  <div style="background: rgba(255,255,255,0.12); padding: 5px; border-radius: 6px;"><strong style="font-size:11px;">${planI18n.pillAuto}</strong><br>${planI18n.pillAutoSub}</div>
                </div>
              </div>

              <!-- Section 3: Family Protection Plan -->
              <div style="border: 2px solid #b91c1c; border-radius: 10px; padding: 10px 14px; background: #fff8f8;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="font-size: 14px; color: #b91c1c;">👨‍👩‍👧 ${planI18n.sec3Title}</strong>
                  <span style="background: #b91c1c; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2.5px 9px; border-radius: 10px;">${planI18n.sec3Badge}</span>
                </div>
                <p style="font-size: 10.5px; color: #334155; margin: 4px 0 7px 0; line-height: 1.38;">
                  ${planI18n.sec3Desc}
                </p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; font-size: 10px;">
                  <div style="background: #ffffff; border: 1.5px solid #fecaca; border-radius: 6px; padding: 6px 4px;">
                    <strong style="color: #b91c1c; font-size: 12.5px; display: block;">🏥 ${planI18n.sec3MedTitle}</strong>
                    <span style="color: #475569;">${planI18n.sec3MedSub}</span>
                  </div>
                  <div style="background: #ffffff; border: 1.5px solid #fecaca; border-radius: 6px; padding: 6px 4px;">
                    <strong style="color: #b91c1c; font-size: 12.5px; display: block;">🛡️ ${planI18n.sec3AccTitle}</strong>
                    <span style="color: #475569;">${planI18n.sec3AccSub}</span>
                  </div>
                  <div style="background: #ffffff; border: 1.5px solid #fecaca; border-radius: 6px; padding: 6px 4px;">
                    <strong style="color: #b91c1c; font-size: 12.5px; display: block;">👨‍👩‍👧 ${planI18n.sec3NomTitle}</strong>
                    <span style="color: #475569;">${planI18n.sec3NomSub}</span>
                  </div>
                </div>
              </div>

              <!-- Quality Guarantee Strip -->
              <div style="background: #edf5fc; border: 1.5px solid #0c2340; border-radius: 7px; padding: 7px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px;">
                <span style="color: #0c2340; font-weight: 800;">🛡️ ${planI18n.guaranteeText}</span>
                <span style="color: #b91c1c; font-weight: 900;">${planI18n.missionText}</span>
              </div>
            </div>

            <div class="running-footer">
              <span>📄 ${i18n.pageLabel || 'पृष्ठ'} 9 / 10</span>
              <span>🛡️ ${i18n.genuineFooter}</span>
              <span>${i18n.helplineFooter}</span>
            </div>
          </div>

          <!-- ================= PAGE B: MASTER BUSINESS INCOME PLAN & EXECUTIVE BACK COVER (PAGE 10) ================= -->
          <div class="page-break pdf-page-wrap">
            <div class="running-header">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="https://aarogyamindia.online/images/logo/logo.png" style="height: 34px; width: auto;" alt="Aarogyam India" onerror="this.src='/images/logo/logo.png'">
                <div>
                  <strong style="font-size: 14px; color: #0c2340; display: block; line-height: 1.1;">AAROGYAM INDIA</strong>
                  <span style="font-size: 10.5px; font-weight: 700; color: #b91c1c;">${planI18n.headerSub10}</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 11px; font-weight: 900; color: #b91c1c;">NETSURF DIRECT</strong>
                <img src="https://aarogyamindia.online/images/logo/netsurf-logo.png" style="height: 32px; width: 32px; object-fit: contain; border-radius: 4px; border: 1px solid #cbd5e1;" alt="Netsurf">
              </div>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: #ffffff; border: 2px solid #0c2340; border-radius: 12px; padding: 12px 16px; margin: 4px 0; gap: 8px;">
              <!-- 1. Retail Profit & Slabs -->
              <div style="border: 2px solid #0c2340; border-radius: 9px; padding: 9px 12px; background: #edf5fc;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <strong style="font-size: 13.5px; color: #0c2340;">${planI18n.plan1Title}</strong>
                  <span style="background: #0c2340; color: #ffffff; font-size: 9.5px; font-weight: 800; padding: 3px 9px; border-radius: 6px;">${planI18n.plan1Payout}</span>
                </div>
                <div style="font-size: 10.5px; color: #334155; line-height: 1.38; margin-bottom: 6px;">
                  • <strong>${planI18n.consumerAdv}</strong> ${planI18n.consumerAdvText}
                </div>
                <!-- 4 Slabs -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center;">
                  <div style="background: #ffffff; border: 1px solid #cbdfe9; border-radius: 5px; padding: 5px;">
                    <span style="font-size: 9.5px; color: #64748b;">${planI18n.slab1}</span><br>
                    <strong style="font-size: 15px; color: #0c2340;">5%</strong>
                  </div>
                  <div style="background: #ffffff; border: 1px solid #cbdfe9; border-radius: 5px; padding: 5px;">
                    <span style="font-size: 9.5px; color: #64748b;">${planI18n.slab2}</span><br>
                    <strong style="font-size: 15px; color: #0c2340;">10%</strong>
                  </div>
                  <div style="background: #ffffff; border: 1px solid #cbdfe9; border-radius: 5px; padding: 5px;">
                    <span style="font-size: 9.5px; color: #64748b;">${planI18n.slab3}</span><br>
                    <strong style="font-size: 15px; color: #0c2340;">12%</strong>
                  </div>
                  <div style="background: #fff8f8; border: 1.5px solid #b91c1c; border-radius: 5px; padding: 5px;">
                    <span style="font-size: 9.5px; color: #b91c1c; font-weight: 700;">${planI18n.slab4}</span><br>
                    <strong style="font-size: 15px; color: #b91c1c;">15% (Max)</strong>
                  </div>
                </div>
              </div>

              <!-- 2. Binary Matching & Cap -->
              <div style="border: 2px solid #0c2340; border-radius: 9px; padding: 9px 12px; background: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <strong style="font-size: 13.5px; color: #0c2340;">${planI18n.plan2Title}</strong>
                  <span style="background: #b91c1c; color: #ffffff; font-size: 9px; font-weight: 800; padding: 3px 9px; border-radius: 6px;">${planI18n.plan2Closing}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; margin: 4px 0;">
                  <div style="background: #edf5fc; border: 1.5px solid #cbdfe9; border-radius: 6px; padding: 6px 3px;">
                    <span style="font-size: 9.5px; color: #64748b;">${planI18n.tier1Label}</span><br>
                    <strong style="font-size: 16px; color: #0c2340;">3%</strong>
                  </div>
                  <div style="background: #edf5fc; border: 1.5px solid #cbdfe9; border-radius: 6px; padding: 6px 3px;">
                    <span style="font-size: 9.5px; color: #64748b;">${planI18n.tier2Label}</span><br>
                    <strong style="font-size: 16px; color: #0c2340;">4%</strong>
                  </div>
                  <div style="background: #fff8f8; border: 1.5px solid #b91c1c; border-radius: 6px; padding: 6px 3px;">
                    <span style="font-size: 9.5px; color: #b91c1c; font-weight: 700;">${planI18n.tier3Label}</span><br>
                    <strong style="font-size: 16px; color: #b91c1c;">${planI18n.tier3Badge}</strong>
                  </div>
                </div>
                <div style="font-size: 11px; color: #0c2340; font-weight: 800; text-align: center; margin-top: 2px;">
                  👑 ${planI18n.plan2Capping}
                </div>
              </div>

              <!-- 3. Generation Royalty Matrix Table -->
              <div style="border: 2px solid #0c2340; border-radius: 9px; padding: 8px 12px; background: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="font-size: 13px; color: #0c2340;">${planI18n.plan3Title}</strong>
                  <span style="background: #0c2340; color: #fff; font-size: 8.5px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">${planI18n.plan3Payout}</span>
                </div>
                <table class="pdf-plan-table" style="margin: 3px 0; font-size: 10px; width: 100%;">
                  <thead>
                    <tr>
                      <th style="padding: 4px 8px; font-size: 10.5px;">${planI18n.colSlab}</th>
                      <th style="padding: 4px 8px; font-size: 10.5px;">${planI18n.colGen}</th>
                      <th style="padding: 4px 8px; font-size: 10.5px;">${planI18n.colBonus}</th>
                      <th style="padding: 4px 8px; font-size: 10.5px;">${planI18n.colBenefit}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style="padding: 3.5px 8px;"><strong>₹10,000</strong></td><td style="padding: 3.5px 8px;"><strong style="color:#0c2340;">3%</strong></td><td style="padding: 3.5px 8px;">₹300</td><td style="padding: 3.5px 8px;">${planI18n.genRow1Benefit}</td></tr>
                    <tr><td style="padding: 3.5px 8px;"><strong>₹20,000</strong></td><td style="padding: 3.5px 8px;"><strong style="color:#0c2340;">4%</strong></td><td style="padding: 3.5px 8px;">₹800</td><td style="padding: 3.5px 8px;">${planI18n.genRow2Benefit}</td></tr>
                    <tr><td style="padding: 3.5px 8px;"><strong>₹40,000</strong></td><td style="padding: 3.5px 8px;"><strong style="color:#0c2340;">5%</strong></td><td style="padding: 3.5px 8px;">₹2,000</td><td style="padding: 3.5px 8px;">${planI18n.genRow3Benefit}</td></tr>
                    <tr><td style="padding: 3.5px 8px;"><strong>₹80,000</strong></td><td style="padding: 3.5px 8px;"><strong style="color:#0c2340;">6%</strong></td><td style="padding: 3.5px 8px;">₹4,800</td><td style="padding: 3.5px 8px;">${planI18n.genRow4Benefit}</td></tr>
                    <tr><td style="padding: 3.5px 8px;"><strong>₹1,20,000</strong></td><td style="padding: 3.5px 8px;"><strong style="color:#0c2340;">7%</strong></td><td style="padding: 3.5px 8px;">₹8,400</td><td style="padding: 3.5px 8px;">${planI18n.genRow5Benefit}</td></tr>
                    <tr style="background: #fff8f8; font-weight: 800;"><td style="padding: 3.5px 8px;"><strong>₹1,60,000+</strong></td><td style="padding: 3.5px 8px; color:#b91c1c; font-size:11.5px;">8% (Max)</td><td style="padding: 3.5px 8px; color:#b91c1c;">₹12,800+</td><td style="padding: 3.5px 8px; color:#b91c1c;">${planI18n.genRow6Benefit}</td></tr>
                  </tbody>
                </table>
              </div>

              <!-- 4. Executive Distributor Contact Card & Order Guide -->
              <div style="border: 2.5px solid #d97706; border-radius: 10px; padding: 11px 14px; background: #ffffff; text-align: center; box-shadow: 0 4px 12px rgba(217,119,6,0.12);">
                <span style="font-size: 11px; font-weight: 900; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.8px;">
                  🛡️ ${i18n.distributorTitle}
                </span>
                <h3 style="font-size: 22px; font-weight: 900; color: #0c2340; margin: 3px 0 2px 0;">
                  ${escapeHtml(distName)}
                </h3>
                <div style="font-size: 16px; font-weight: 900; color: #b91c1c; margin-bottom: 4px;">
                  ${i18n.phoneWaLabel} +91 ${escapeHtml(distPhone)}
                </div>
                <div style="font-size: 10.5px; color: #334155; font-weight: 600;">
                  ${i18n.orderNote}
                </div>
              </div>
            </div>

            <div class="running-footer">
              <span>📄 ${i18n.pageLabel || 'पृष्ठ'} 10 / 10</span>
              <span>🛡️ ${i18n.genuineFooter}</span>
              <span>${i18n.helplineFooter}</span>
            </div>
          </div>

<script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              try {
                window.print();
              } catch(e) {}
            }, 800);
          });
        </script>
      </body>
      </html>
    `;

    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const printDoc = window.open(blobUrl, '_blank');
      if (!printDoc) {
        window.location.href = blobUrl;
      }
    } catch(err) {
      const printDoc = window.open('', '_blank');
      if (printDoc) {
        printDoc.document.open();
        printDoc.document.write(htmlContent);
        printDoc.document.close();
      } else {
        alert('कृपया ब्राउज़र में पॉपअप को अनुमति दें (Allow Popups) ताकि कैटलॉग खुल सके।');
      }
    }
  };

  // 8. Initialization
  document.addEventListener('DOMContentLoaded', async () => {
    resolveSponsor();
    await loadMasterI18n();
    await loadMasterProducts();

    // Sync site language selector if present
    const select = document.getElementById('npSiteLangSelect');
    if (select) select.value = currentSiteLang;

    // Auto-play audio after 1.5 seconds gentle pause
    setTimeout(() => {
      try {
        if ('speechSynthesis' in window && !window.speechSynthesis.speaking) {
          window.toggleAudioTutorial(true);
        }
      } catch (e) {}
    }, 1500);
  });

})();
