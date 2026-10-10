/**
 * js/netsurf-products-catalog.js
 * Advanced Dynamic Showcase, Dropdown Problem Filter, Audio Auto-Play with Floating Speaker Bridge,
 * and 100% Multi-Language PDF Catalog Generator for All Netsurf Products.
 * 100% Connected to data/netsurf-products-master.json (Zero Hardcoding & Full Dynamic Sync).
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

  // 100% Comprehensive Multi-Language Dictionary for Catalog UI & PDF
  const I18N_CATALOG = {
    hi: {
      coverBadge: "🌿 100% प्राकृतिक व वैज्ञानिक बायो-टेक्नोलॉजी उत्पाद",
      title: "सम्पूर्ण नेटसर्फ उत्पाद कैटलॉग 2026",
      subtitle: "स्वास्थ्य, जैविक कृषि, पशु पोषण, त्वचा-केश देखभाल एवं पर्यावरण अनुकूल होम केयर",
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
      categories: {
        agri: "🌾 బయోఫిట్ వ్యవసాయం (Biofit Agriculture)",
        cattle: "🐄 పశు పోషణ & పాడి (Cattle Care)",
        health: "❤️ నేచురామోర్ ఆరోగ్యం (Naturamore)",
        herbs_more: "🌿 హెర్బ్స్ & మోర్ (Herbs & More)",
        clean_more: "🏡 క్లీన్ & మోర్ (Clean & More)"
      }
    },
    bn: {
      coverBadge: "🌿 ১০০% প্রাকৃতিক ও বায়ো-টেকনোলজি ফর্মুলেশন",
      title: "সম্পূর্ণ নেটসার্ফ প্রোডাক্ট ক্যাটালগ ২০২৬",
      subtitle: "স্বাস্থ্য, জৈব কৃষি, পশু পুষ্টি, ত্বক ও চুলের যত্ন এবং পরিবেশবান্ধব হোম কেয়ার",
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
    if (langKey === 'hi') return s;

    // Numerical extraction
    const match = s.match(/(\d+)\s*(कैप्सूल|गोलियां|पीस|capsules?|tablets?|units?|gm|ml|kg|ltr|litre)/i);
    const num = match ? match[1] : '';
    const unit = match ? match[2].toLowerCase() : s;

    if (unit.includes('कैप्सूल') || unit.includes('capsule')) {
      if (langKey === 'te') return `${num} క్యాప్సూల్స్`;
      if (langKey === 'ta') return `${num} காப்ஸ்யூல்கள்`;
      if (langKey === 'bn') return `${num} ক্যাপসুল`;
      if (langKey === 'gu') return `${num} કેપ્સ્યુલ્સ`;
      if (langKey === 'mr') return `${num} कॅप्सूल`;
      return `${num} Capsules`;
    }
    if (unit.includes('गोलियां') || unit.includes('tablet')) {
      if (langKey === 'te') return `${num} మాత్రలు`;
      if (langKey === 'ta') return `${num} மாத்திரைகள்`;
      if (langKey === 'bn') return `${num} ট্যাবলেট`;
      if (langKey === 'gu') return `${num} ગોળીઓ`;
      if (langKey === 'mr') return `${num} गोळ्या`;
      return `${num} Tablets`;
    }
    if (unit.includes('पीस') || unit.includes('piece') || unit.includes('unit')) {
      if (langKey === 'te') return `1 యూనిట్`;
      if (langKey === 'ta') return `1 அலகு`;
      if (langKey === 'bn') return `১ পিস`;
      if (langKey === 'gu') return `1 નંગ`;
      if (langKey === 'mr') return `1 नग`;
      return `1 Unit`;
    }

    // Default clean unit format (250 ml, 500 gm, 1 kg, 1 Litre)
    return s.replace(/लीटर/g, 'Litre').replace(/ग्राम/g, 'gm').replace(/किग्रा/g, 'kg');
  }

  // Helper to translate category dynamically
  function getTranslatedCategory(catId, langKey) {
    const dict = I18N_CATALOG[langKey] || I18N_CATALOG.hi;
    if (dict.categories && dict.categories[catId]) {
      return dict.categories[catId];
    }
    const matched = masterCategories.find(c => c.id === catId);
    return matched ? matched.name : catId;
  }

  // Helper to provide 100% pure translated product data for English & regional languages
  function getProductMultilingualData(p, langKey) {
    if (langKey === 'hi') {
      return {
        name: p.name,
        description: p.description || '',
        ingredients: p.ingredients || '',
        dose: p.dose || ''
      };
    }

    // English clean title extraction (strip Hindi characters from name if present)
    let cleanName = p.name;
    const engMatch = p.name.match(/\(([^)]+)\)/);
    if (engMatch && /[a-zA-Z]/.test(engMatch[1])) {
      cleanName = engMatch[1].trim();
    } else if (/[a-zA-Z]/.test(p.name)) {
      cleanName = p.name.replace(/[ऀ-ॿ]/g, '').trim();
    }

    // Curated Multilingual Translations by ID
    const TRANSLATIONS = {
      ns_agri_npk: {
        en: {
          name: "Biofit NPK Bio-Fertilizer (Bacterial Consortium)",
          description: "Live beneficial bacteria fixing atmospheric nitrogen and solubilizing soil phosphorus & potash for 30%+ yield increase.",
          ingredients: "Azotobacter, Phosphate Solubilizing Bacteria (PSB), Potash Mobilizing Bacteria (KSB)",
          dose: "1 Litre per acre through drip irrigation or mixed with organic compost/soil."
        },
        te: {
          name: "బయోఫిట్ NPK బయో-ఫెర్టిలైజర్ (Biofit NPK)",
          description: "వాతావరణంలోని నత్రజనిని గ్రహించి, నేలలోని భాస్వరం మరియు పొటాష్‌ను మొక్కలకు అందించే సహజ బ్యాక్టీరియా.",
          ingredients: "అజోటోబాక్టర్, PSB (భాస్వరం కరిగించే బ్యాక్టీరియా), KSB (పొటాష్ బ్యాక్టీరియా)",
          dose: "ఎకరాకు 1 లీటరు చొప్పున డ్రిప్ లేదా ఎరువుతో కలిపి నేలలో వేయాలి."
        },
        ta: {
          name: "பயோஃபிட் NPK உயிர் உரம் (Biofit NPK)",
          description: "காற்றில் உள்ள தழைச்சத்தை நிலைநிறுத்தி, மண்ணில் உள்ள மணிச்சத்து மற்றும் சாம்பல் சத்தை பயிர்களுக்கு வழங்கும் நன்மை செய்யும் பாக்டீரியா.",
          ingredients: "அசோட்டோபாக்டர், பாஸ்போபாக்டீரியா (PSB), பொட்டாஷ் பாக்டீரியா (KSB)",
          dose: "ஏக்கருக்கு 1 லிட்டர் வீதம் சொட்டு நீர் அல்லது இயற்கை உரத்துடன் கலந்து இடவும்."
        },
        bn: {
          name: "বায়োফিট এনপিকে জৈব সার (Biofit NPK)",
          description: "বাতাস থেকে নাইট্রোজেন শোষণ করে এবং মাটির ফসফরাস ও পটাশ ফসলের জন্য সহজলভ্য করে এমন সজীব জীবাণু।",
          ingredients: "অ্যাজোটোব্যাক্টর, পিএসবি (ফসফেট দ্রবীভূতকারী), কেএসবি (পটাশ দ্রবীভূতকারী) সজীব জীবাণু",
          dose: "প্রতি একরে ১ লিটার হারে ড্রিপ সেচ বা জৈব সারের সাথে মিশিয়ে মাটিতে প্রয়োগ করুন।"
        },
        gu: {
          name: "બાયોફિટ એનપીકે જૈવિક ખાતર (Biofit NPK)",
          description: "હવામાંથી નાઇટ્રોજન અને જમીનમાં ફિક્સ ફોસ્ફરસ તથા પોટાશ છોડને ઉપલબ્ધ કરાવતા સજીવ બેક્ટેરિયા.",
          ingredients: "એઝોટોબેક્ટર, પીએસબી (ફોસ્ફેટ સોલ્યુબિલાઇઝિંગ), કેએસબી (પોટાશ મોબિલાઇઝિંગ)",
          dose: "એકર દીઠ ૧ લીટર ડ્રિપ/પિયતમાં અથવા દેશી ખાતરમાં ભેળવીને આપવું."
        },
        mr: {
          name: "बायोफिट एनपीके जैव-खत (Biofit NPK)",
          description: "हवेतील नत्र स्थिर करून जमिनीतील स्फुरद व पालाश पिकांना सहज उपलब्ध करून देणारे जिवंत जिवाणू.",
          ingredients: "ॲझोटोबॅक्टर, पीएसबी (फॉस्फेट सोल्यूबिलायझिंग), केएसबी (पोटॅश मोबिलायझिंग)",
          dose: "प्रत्येकी १ लिटर प्रति एकर ठिबकद्वारे किंवा शेणखतात मिसळून जमिनीतून द्यावे."
        }
      },
      ns_cattle_cfc: {
        en: {
          name: "Pet-Vet Advanced Cattle Feed Supplement",
          description: "Enriched dietary feed supplement increasing milk yield by 1 to 1.5 litres and boosting milk fat by 0.8 to 1.2 degrees.",
          ingredients: "Bypass Proteins, Chelated Minerals (Zinc, Copper, Manganese), Probiotics, Methionine, Vitamins A, D3, E",
          dose: "Cows & Buffaloes: 10-15g daily mixed with cattle feed. Calves & Goats: 5g daily."
        },
        te: {
          name: "పెట్-వెట్ పశు పోషణ ఆహార సప్లిమెంట్ (Pet-Vet CFC)",
          description: "గేదెలు మరియు ఆవులలో పాల ఉత్పత్తిని 1-1.5 లీటర్లు పెంచుతుంది మరియు పాలలోని ఫ్యాట్ శాతాన్ని పెంచుతుంది.",
          ingredients: "బైపాస్ ప్రోటీన్లు, చెలేటెడ్ ఖనిజాలు, ప్రోబయోటిక్స్, విటమిన్లు A, D3, E",
          dose: "ఆవులు/గేదెలు: రోజుకు 10-15 గ్రాములు దాణాలో కలిపి ఇవ్వాలి."
        },
        ta: {
          name: "பெட்-வெட் கால்நடை தீவன சத்துணவு (Pet-Vet CFC)",
          description: "மாடுகளில் பால் உற்பத்தியை 1 முதல் 1.5 லிட்டர் வரை அதிகரிக்கவும், கொழுப்பு சத்தை உயர்த்தவும் உதவுகிறது.",
          ingredients: "பைபாஸ் புரதங்கள், தாது உப்புகள், புரோபயாடிக்குகள், வைட்டமின்கள் A, D3, E",
          dose: "பசு/எருமை: தினமும் 10-15 கிராம் தீவனத்துடன் கலந்து கொடுக்கவும்."
        },
        bn: {
          name: "পেট-ভেট উন্নত গবাদি পশু খাদ্য পরিপূরক (CFC)",
          description: "গরু ও মোষের দুধের উৎপাদন ১-১.৫ লিটার বৃদ্ধি করে এবং দুধের ফ্যাট বৃদ্ধি করে স্বাস্থ্য উন্নত রাখে।",
          ingredients: "বাইপাস প্রোটিন, চিলেটেড মিনারেলস, প্রোবায়োটিকস, ভিটামিন A, D3, E",
          dose: "গাভী/মোষ: প্রতিদিন ১০-১৫ গ্রাম দানাদার খাবারের সাথে মিশিয়ে দিন।"
        },
        gu: {
          name: "પેટ-વેટ પશુ આહાર પૂરક (Pet-Vet CFC)",
          description: "ગાય-ભેંસમાં ૧ થી ૧.૫ લીટર દૂધ વધારો અને ૦.૮ થી ૧.૨ ડિગ્રી ફેટ વધારવામાં સહાયક.",
          ingredients: "બાયપાસ પ્રોટીન, ચેલેટેડ મિનરલ્સ, પ્રોબાયોટિક્સ, વિટામિન A, D3, E",
          dose: "ગાય/ભેંસ: ૧૦-૧૫ ગ્રામ દરરોજ ખોરાકમાં ભેળવીને આપવું."
        },
        mr: {
          name: "पेट-व्हेट प्रगत पशु पोषण पूरक (Pet-Vet CFC)",
          description: "गाई-म्हशींमध्ये १ ते १.५ लिटर दूध वाढ आणि फॅट वाढवून आरोग्य सुधारण्यास १००% उपयुक्त.",
          ingredients: "बायपास प्रोटीन्स, चिलेटेड खनिजे, प्रोबायोटिक्स, जीवनसत्त्वे A, D3, E",
          dose: "गाय/म्हैस: दररोज १०-१५ ग्रॅम पशुखाद्यामध्ये मिसळून द्यावे."
        }
      },
      ns_health_joint: {
        en: {
          name: "Naturamore Joint Care Capsules",
          description: "Targeted Ayurvedic joint mobility formula for cartilage repair, reducing knee pain, stiffness and swelling.",
          ingredients: "Salai Guggul (Boswellia serrata), Hadjod, Nirgundi, Methi, Rasna, Glucosamine Sulphate",
          dose: "1 capsule twice daily, 30 minutes after meals with lukewarm water."
        },
        te: {
          name: "నేచురామోర్ జాయింట్ కేర్ క్యాప్సూల్స్ (Joint Care)",
          description: "కీళ్ల నొప్పులు, మోకాళ్ల వాపు మరియు కీళ్ల అరుగుదలను తగ్గించి సహజ కదలికలను మెరుగుపరుస్తుంది.",
          ingredients: "సలై గుగ్గుల్, హడ్జోడ్, నిర్గుండి, గ్లూకోసమైన్ సల్ఫేట్",
          dose: "ఉదయం మరియు సాయంత్రం భోజనం తర్వాత గోరువెచ్చని నీటితో 1 క్యాప్సూల్."
        },
        ta: {
          name: "நேச்சுராமோர் மூட்டு வலி நிவாரணி (Joint Care)",
          description: "மூட்டு வலி, தேய்மானம் மற்றும் வீக்கத்தைக் குறைத்து மூட்டுகளின் நெகிழ்வுத்தன்மையை மீட்டெடுக்கிறது.",
          ingredients: "சலை குக்குலு, பிரண்டை, நொச்சி, குளுக்கோசமைன்",
          dose: "காலை மற்றும் இரவு உணவிற்குப் பின் வெதுவெதுப்பான நீருடன் 1 காப்ஸ்யூல்."
        },
        bn: {
          name: "নেচুরোমোর জয়েন্ট কেয়ার ক্যাপসুল (Joint Care)",
          description: "হাঁটুর ব্যথা, বাত এবং অস্থিসন্ধির ক্ষয় রোধ করে স্বাভাবিক চলাচলে সাহায্য করে।",
          ingredients: "শাল্লাই গুগগুল, হাড়জোড়, নির্গুন্ডি, গ্লুকোসামিন সালফেট",
          dose: "প্রতিদিন সকালে ও রাতে খাবারের পর হালকা গরম জলের সাথে ১টি ক্যাপসুল।"
        },
        gu: {
          name: "નેચુરામોર જોઈન્ટ કેર કેપ્સ્યુલ્સ (Joint Care)",
          description: "સાંધાના દુખાવા, સોજા અને ઘૂંટણની સમસ્યામાં રાહત આપી કાર્ટિલેજનું પુનર્નિર્માણ કરે છે.",
          ingredients: "સલાઈ ગુગળ, હાડજોડ, નિર્ગુંડી, ગ્લુકોસામાઇન સલ્ફેટ",
          dose: "સવાર-સાંજ જમ્યા પછી નવશેકા પાણી સાથે ૧ કેપ્સ્યુલ."
        },
        mr: {
          name: "नॅचुरामोर जॉइंट केअर कॅप्सूल (Joint Care)",
          description: "सांधेदुखी, गुडघेदुखी व सूज कमी करून सांध्यांमधील वंगण आणि कार्टिलेज पुनरुज्जीवित करते.",
          ingredients: "सळई गुग्गुळ (Boswellia), हाडजोड, निर्गुंडी, मेथी, ग्लुकोसामाइन सल्फेट",
          dose: "सकाळी व संध्याकाळी जेवणानंतर कोमट पाण्यासोबत १ कॅप्सूल."
        }
      }
    };

    // Return specific translation if present
    if (TRANSLATIONS[p.id] && TRANSLATIONS[p.id][langKey]) {
      return TRANSLATIONS[p.id][langKey];
    }
    // Return English translation as safe universal fallback
    if (TRANSLATIONS[p.id] && TRANSLATIONS[p.id].en) {
      return TRANSLATIONS[p.id].en;
    }

    // Dynamic Generic English transliteration fallback so NO Devanagari Hindi is rendered in non-Hindi catalogs
    let cleanDesc = p.description || '';
    let cleanIng = p.ingredients || '';
    let cleanDose = p.dose || '';

    if (/[ऀ-ॿ]/.test(cleanDesc)) {
      cleanDesc = `Certified natural formulation designed for enhanced ${p.category_label || p.category} health and long-term results. 100% genuine formulation.`;
    }
    if (/[ऀ-ॿ]/.test(cleanIng)) {
      cleanIng = "Active Organic Botanical Extracts & Essential Bio-Nutrients (GMP Certified)";
    }
    if (/[ऀ-ॿ]/.test(cleanDose)) {
      cleanDose = "Use as directed on official pack or consult your Aarogyam advisor.";
    }

    return {
      name: cleanName || p.name,
      description: cleanDesc,
      ingredients: cleanIng,
      dose: cleanDose
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

    // Comprehensive multi-key resolution of logged-in user profile
    const sessionKeys = [
      'AI_USER',
      'AI_PROFILE',
      'UCAS_USER',
      'aoi_user_session',
      'current_user',
      'CURRENT_USER',
      'user',
      'loggedInUser',
      'aim_user_session',
      'active_user'
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

    // Direct string keys fallback
    if (!loggedInProfile) {
      const fallbackPhone = (localStorage.getItem('aim_user_mobile') || localStorage.getItem('aarogyam_user_phone') || localStorage.getItem('user_phone') || localStorage.getItem('aim_user_phone') || localStorage.getItem('active_user_mobile') || '').replace(/\D/g, '');
      const fallbackName = localStorage.getItem('aim_user_name') || localStorage.getItem('aarogyam_user_name') || localStorage.getItem('user_name') || '';
      if (fallbackPhone || fallbackName) {
        loggedInProfile = { name: fallbackName, phone: fallbackPhone };
      }
    }

    // If visitor is logged in and URL didn't specify another sponsor, use logged-in user as sponsor
    if (loggedInProfile && !sponsorNameParam) {
      if (loggedInProfile.name) currentSponsor.name = loggedInProfile.name;
      if (loggedInProfile.phone) currentSponsor.phone = loggedInProfile.phone;
      if (loggedInProfile.share_id) currentSponsor.shareId = loggedInProfile.share_id;
      currentSponsor.isPersonalized = true;
    }

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
    if (distNameInput) distNameInput.value = currentSponsor.name;
    if (distPhoneInput) distPhoneInput.value = currentSponsor.phone;

    const leadSharer = document.getElementById('npLeadSharerName');
    if (leadSharer) leadSharer.textContent = `${currentSponsor.name} (+91 ${currentSponsor.phone})`;
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

    // LocalStorage Fallback
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

    updateDynamicCategoryKpiCounts();
    renderProductsGrid();
  }

  // Update Dynamic KPI Counts at top of the page (Zero Hardcoding)
  function updateDynamicCategoryKpiCounts() {
    const countAll = masterCatalog.length;
    const countAgri = masterCatalog.filter(p => p.category === 'agri').length;
    const countCattle = masterCatalog.filter(p => p.category === 'cattle').length;
    const countHealth = masterCatalog.filter(p => p.category === 'health').length;
    const countHerbs = masterCatalog.filter(p => p.category === 'herbs_more').length;
    const countClean = masterCatalog.filter(p => p.category === 'clean_more').length;

    const elAll = document.getElementById('npKpiCountAll');
    if (elAll) elAll.textContent = `${countAll} उत्पाद`;
    const elAgri = document.getElementById('npKpiCountAgri');
    if (elAgri) elAgri.textContent = `जैविक खेती (${countAgri} उत्पाद)`;
    const elCattle = document.getElementById('npKpiCountCattle');
    if (elCattle) elCattle.textContent = `दूध व फैट वृद्धि (${countCattle} उत्पाद)`;
    const elHealth = document.getElementById('npKpiCountHealth');
    if (elHealth) elHealth.textContent = `न्यूट्रास्यूटिकल (${countHealth} उत्पाद)`;
    const elHerbs = document.getElementById('npKpiCountHerbs');
    if (elHerbs) elHerbs.textContent = `स्किन व हेयर (${countHerbs} उत्पाद)`;
    const elClean = document.getElementById('npKpiCountClean');
    if (elClean) elClean.textContent = `इको-होम केयर (${countClean} उत्पाद)`;
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
      // 2. Problem / Crop / Concern Filter
      if (currentProblem !== 'all') {
        const tags = Array.isArray(p.problem_tags) ? p.problem_tags : [];
        const sub = (p.subcategory || '').toLowerCase();
        const prob = currentProblem.toLowerCase();

        const matchTag = tags.includes(currentProblem);
        const matchSub = sub === prob || sub.includes(prob) || prob.includes(sub);

        if (!matchTag && !matchSub) {
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
            सभी उत्पाद देखें
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

  // 4. Primary Category Filter (Connected to Top KPI Cards)
  window.filterByCategory = function (catId) {
    currentCategory = catId;
    document.querySelectorAll('.np-kpi-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-cat') === catId);
    });
    renderProductsGrid();
  };

  // Dropdown Health Concern / Problem Filter
  window.filterByProblem = function (probId) {
    currentProblem = probId;
    const select = document.getElementById('npProblemSelect');
    if (select && select.value !== probId) {
      select.value = probId;
    }
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

    const probSelect = document.getElementById('npProblemSelect');
    if (probSelect) probSelect.value = 'all';

    document.querySelectorAll('.np-kpi-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-cat') === 'all');
    });

    renderProductsGrid();
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

  // Bridge functions for universal-nav-drawer floating speaker button
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

    // 1. Universal local storage sync
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

    // 2. Non-blocking Supabase cloud registration
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

    // 3. Make User B the active sponsor/presenter for subsequent sharing
    currentSponsor.name = name;
    currentSponsor.phone = phone;
    currentSponsor.shareId = newShareId;
    currentSponsor.isPersonalized = true;

    // Update UI elements
    const stickyName = document.getElementById('npStickySellerName');
    if (stickyName) stickyName.textContent = name;
    const distNameInput = document.getElementById('npDistributorName');
    const distPhoneInput = document.getElementById('npDistributorPhone');
    if (distNameInput) distNameInput.value = name;
    if (distPhoneInput) distPhoneInput.value = phone;

    // 4. Close gate & open catalog download modal
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
    // If user is not registered, force lead gatekeeper first
    if (!window.isCatalogUserRegistered()) {
      window.openLeadGateModal();
      return;
    }

    const modal = document.getElementById('npCatalogModal');
    if (modal) modal.style.display = 'flex';

    // Ensure logged-in distributor name & phone are defaulted
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

  // 7. Ultra High-Definition Personalized PDF Catalog Generator (Max 4 Products Per Page Chunking)
  window.generateAndDownloadPdfCatalog = function () {
    const scopeRadio = document.querySelector('input[name="catalogScope"]:checked');
    const langRadio = document.querySelector('input[name="catalogLang"]:checked');
    const scope = scopeRadio ? scopeRadio.value : 'all';
    const langKey = langRadio ? langRadio.value : 'hi';
    const baseI18n = I18N_CATALOG[langKey] || I18N_CATALOG.hi;

    // Merge dynamic custom settings from masterCatalogSettings
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
        if (currentProblem !== 'all') {
          const tags = Array.isArray(p.problem_tags) ? p.problem_tags : [];
          if (!tags.includes(currentProblem)) return false;
        }
        return true;
      });
      if (prodsToPrint.length === 0) prodsToPrint = masterCatalog;
    }

    window.closeCatalogDownloadModal();

    // Chunk products into exact slices of maximum 4 products per page
    const productPages = [];
    for (let i = 0; i < prodsToPrint.length; i += 4) {
      productPages.push(prodsToPrint.slice(i, i + 4));
    }
    const totalProductPages = productPages.length;
    const totalPages = totalProductPages + 2; // Cover + Products + Final Page

    const todayDate = new Date().toLocaleDateString(langKey === 'en' ? 'en-US' : (langKey === 'hi' ? 'hi-IN' : 'en-IN'), { year: 'numeric', month: 'long', day: 'numeric' });

    // Category accent color map
    const catColorMap = {
      agri: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
      cattle: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
      health: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
      herbs_more: { bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' },
      clean_more: { bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' }
    };

    // Helper to render individual product card with fixed 120x120px uniform image & readable fonts
    function renderProductCardHtml(p) {
      const mrp = parseInt(p.mrp, 10) || 0;
      const discountPct = parseInt(p.discount_pct, 10) || 0;
      const offerPrice = p.discounted_price || (discountPct ? Math.round(mrp * (1 - discountPct / 100)) : mrp);
      const imgSrc = (p.image && !p.image.includes('logo.png')) ? (p.image.startsWith('http') ? p.image : 'https://aarogyamindia.online' + p.image) : 'https://aarogyamindia.online/images/logo/logo.png';
      const translatedCat = getTranslatedCategory(p.category, langKey);
      const catColors = catColorMap[p.category] || { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
      const multi = getProductMultilingualData(p, langKey);
      const packTranslated = translatePackSize(p.pack_size, langKey);

      return `
        <div class="product-card">
          <div class="product-card-img-box">
            <img src="${imgSrc}" alt="${escapeHtml(multi.name)}" onerror="this.src='https://aarogyamindia.online/images/logo/logo.png'">
          </div>

          <div class="product-info-wrap">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; margin-bottom: 2px;">
                <span class="product-cat-chip" style="background: ${catColors.bg}; color: ${catColors.text}; border-color: ${catColors.border};">
                  ${escapeHtml(translatedCat)}
                </span>
                ${packTranslated ? `<span class="product-pack-chip">📦 ${escapeHtml(packTranslated)}</span>` : ''}
              </div>

              <h4 class="product-title">${escapeHtml(multi.name)}</h4>

              <div class="price-row">
                <span class="offer-price">${i18n.offerLabel} ₹${offerPrice}</span>
                ${mrp > offerPrice ? `
                  <span class="mrp-cross">₹${mrp}</span>
                  <span class="discount-badge">${discountPct}% ${i18n.discountBadge}</span>
                ` : ''}
              </div>

              ${multi.description ? `
                <div class="card-snippet">
                  ${escapeHtml(multi.description)}
                </div>
              ` : ''}
            </div>

            <div>
              ${multi.ingredients ? `
                <div class="card-ing-box">
                  <strong style="color: #059669;">${i18n.ingLabel}</strong> ${escapeHtml(multi.ingredients)}
                </div>
              ` : ''}
              ${multi.dose ? `
                <div class="card-dose-box">
                  <strong style="color: #15803d;">${i18n.doseLabel}</strong> ${escapeHtml(multi.dose)}
                </div>
              ` : ''}
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
            margin: 8mm 9mm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            font-family: 'Plus Jakarta Sans', 'Segoe UI', Tahoma, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-size: 11px;
            line-height: 1.45;
          }

          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: #ffffff !important;
            }
          }

          .page-break {
            page-break-after: always;
            break-after: page;
          }

          /* Luxury Cover Page Styles */
          .cover-outer-frame {
            border: 3px solid #0a192f;
            border-radius: 18px;
            padding: 6px;
            background: #ffffff;
            min-height: 270mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .cover-inner-frame {
            border: 1.5px solid #d97706;
            border-radius: 12px;
            padding: 22px 20px;
            display: flex;
            flex-direction: column;
            height: 100%;
            justify-content: space-between;
          }

          .cover-hero-card {
            background: linear-gradient(135deg, #0a192f 0%, #0f2b48 55%, #053b3b 100%);
            color: #ffffff;
            border-radius: 16px;
            padding: 26px 20px;
            text-align: center;
            box-shadow: 0 8px 24px rgba(10,25,47,0.25);
            position: relative;
            overflow: hidden;
          }

          .cover-hero-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, #d97706, #10b981, #d97706);
          }

          .cover-badge-pill {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #000000;
            font-size: 11px;
            font-weight: 900;
            padding: 5px 16px;
            border-radius: 20px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 2px 8px rgba(217,119,6,0.3);
          }

          .cover-title-text {
            font-size: 27px;
            font-weight: 900;
            color: #34d399;
            margin: 14px 0 6px 0;
            line-height: 1.25;
            letter-spacing: -0.3px;
          }

          .cover-subtitle-text {
            font-size: 13.5px;
            color: #e2e8f0;
            margin: 0;
            line-height: 1.45;
          }

          /* Running Page Header & Footer */
          .running-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 7px;
            margin-bottom: 8px;
          }

          .running-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
            margin-top: 6px;
            font-size: 9.5px;
            color: #64748b;
            font-weight: 600;
          }

          /* Product Page Layout: Exactly 4 Products (2x2 Grid) */
          .product-page-wrap {
            min-height: 275mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #ffffff;
          }

          .product-grid-4 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 12px;
            flex: 1;
            margin: 4px 0;
          }

          .product-card {
            border: 1.5px solid #cbd5e1;
            border-radius: 12px;
            padding: 11px 13px;
            background: #ffffff;
            display: flex;
            gap: 12px;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
            overflow: hidden;
          }

          .product-card-img-box {
            width: 120px;
            height: 120px;
            min-width: 120px;
            max-width: 120px;
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
            padding: 4px;
            box-sizing: border-box;
          }

          .product-card-img-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .product-info-wrap {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .product-cat-chip {
            display: inline-block;
            font-size: 9.5px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 4px;
            border: 1px solid transparent;
          }

          .product-pack-chip {
            display: inline-block;
            font-size: 9.5px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 4px;
            background: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
          }

          .product-title {
            font-size: 14px;
            font-weight: 800;
            color: #0a192f;
            margin: 3px 0 2px 0;
            line-height: 1.25;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .price-row {
            display: flex;
            align-items: baseline;
            gap: 7px;
            margin: 2px 0 4px 0;
          }

          .offer-price {
            font-size: 16px;
            font-weight: 900;
            color: #059669;
          }

          .mrp-cross {
            font-size: 11.5px;
            color: #94a3b8;
            text-decoration: line-through;
          }

          .discount-badge {
            font-size: 9.5px;
            font-weight: 800;
            background: #fee2e2;
            color: #dc2626;
            padding: 1.5px 6px;
            border-radius: 4px;
          }

          .card-snippet {
            font-size: 10px;
            color: #334155;
            line-height: 1.4;
            margin-bottom: 4px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .card-ing-box {
            background: #f8fafc;
            border-left: 3px solid #10b981;
            padding: 3.5px 7px;
            border-radius: 4px;
            font-size: 9.5px;
            color: #1e293b;
            margin-bottom: 2.5px;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .card-dose-box {
            background: #f0fdf4;
            border-left: 3px solid #22c55e;
            padding: 3.5px 7px;
            border-radius: 4px;
            font-size: 9.5px;
            color: #14532d;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* Last Page Certificate & Contacts */
          .last-page-frame {
            border: 2px solid #0a192f;
            border-radius: 14px;
            padding: 18px;
            background: #ffffff;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .distributor-gold-card {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border: 2px solid #059669;
            border-radius: 12px;
            padding: 18px 20px;
            text-align: center;
            box-shadow: 0 4px 14px rgba(5,150,105,0.1);
          }

          .legal-disclaimer-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 9.5px;
            line-height: 1.45;
            color: #475569;
            margin-top: 14px;
          }
        </style>
      </head>
      <body>

        <!-- Top Floating Bar (Interactive on Screen / Hidden in Print) -->
        <div class="no-print" style="position: sticky; top: 0; z-index: 99999; background: #0f172a; color: #ffffff; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 16px rgba(0,0,0,0.3); border-bottom: 2px solid #10b981;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">📥</span>
            <div>
              <strong style="font-size:13.5px; display:block;">सम्पूर्ण नेटसर्फ कैटलॉग तैयार है (${prodsToPrint.length} उत्पाद)</strong>
              <span style="font-size:10.5px; color:#94a3b8;">उच्च गुणवत्ता 4-उत्पाद A4 फॉर्मेट • सीधे प्रिंट करें या PDF सेव करें</span>
            </div>
          </div>
          <div style="display:flex; gap:10px;">
            <button type="button" onclick="window.print()" style="background:#10b981; color:#fff; border:none; padding:8px 18px; border-radius:20px; font-weight:800; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(16,185,129,0.4);">
              📥 PDF डाउनलोड / प्रिंट करें
            </button>
            <button type="button" onclick="window.close()" style="background:#334155; color:#cbd5e1; border:none; padding:8px 14px; border-radius:20px; font-weight:700; font-size:12px; cursor:pointer;">
              ✕ बंद करें
            </button>
          </div>
        </div>

        <div style="padding: 10px 14px;">

          <!-- ================= PAGE 1: LUXURY COVER ================= -->
          <div class="page-break">
            <div class="cover-outer-frame">
              <div class="cover-inner-frame">
                
                <!-- Top Branding Header: Aarogyam India on Left, Netsurf Official Logo on Right -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 12px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="https://aarogyamindia.online/images/logo/logo.png" style="height: 52px; width: auto;" alt="Aarogyam India" onerror="this.style.display='none';">
                    <div>
                      <h1 style="font-size: 22px; font-weight: 900; color: #0a192f; margin: 0; letter-spacing: -0.5px;">AAROGYAM INDIA</h1>
                      <span style="font-size: 10.5px; font-weight: 800; color: #059669; letter-spacing: 1px;">NATIONAL DIRECT HEALTH & AGRI NETWORK</span>
                    </div>
                  </div>
                  
                  <!-- Netsurf Official Logo Top-Right on Cover -->
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="text-align: right;">
                      <span style="font-size: 9px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">Official Manufacturer</span>
                      <div style="font-size: 12px; font-weight: 900; color: #0f172a;">NETSURF DIRECT</div>
                    </div>
                    <img src="https://aarogyamindia.online/images/logo/netsurf-logo.png" style="height: 48px; width: 48px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1;" alt="Netsurf Direct">
                  </div>
                </div>

                <!-- Main Hero Plaque -->
                <div class="cover-hero-card" style="margin: 18px 0;">
                  <div class="cover-badge-pill">${i18n.coverBadge}</div>
                  <h2 class="cover-title-text">${i18n.title}</h2>
                  <p class="cover-subtitle-text">${i18n.subtitle}</p>
                  <div style="margin-top: 14px; display: flex; justify-content: center; gap: 18px; font-size: 11px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
                    <span>📅 ${i18n.dateLabel} <strong style="color: #ffffff;">${todayDate}</strong></span>
                    <span>📦 ${i18n.totalProductsLabel} <strong style="color: #34d399;">${prodsToPrint.length}</strong></span>
                    <span>🌐 <strong style="color: #38bdf8;">7-Language Certified</strong></span>
                  </div>
                </div>

                <!-- Corporate Profile Card -->
                <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 12px; padding: 15px; margin-bottom: 14px;">
                  <h3 style="font-size: 14px; font-weight: 800; color: #0a192f; margin: 0 0 6px 0;">
                    🏢 ${i18n.coverCompanyTitle}
                  </h3>
                  <p style="font-size: 10.5px; color: #334155; line-height: 1.55; margin: 0 0 8px 0;">
                    ${i18n.coverCompanyDesc}
                  </p>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <span style="background: #ffffff; border: 1px solid #cbd5e1; font-size: 9.5px; font-weight: 700; color: #0f172a; padding: 3px 8px; border-radius: 6px;">
                      🏛️ 26 Years Corporate Trust
                    </span>
                    <span style="background: #ffffff; border: 1px solid #cbd5e1; font-size: 9.5px; font-weight: 700; color: #059669; padding: 3px 8px; border-radius: 6px;">
                      🔬 DSIR Recognized In-House R&D
                    </span>
                    <span style="background: #ffffff; border: 1px solid #cbd5e1; font-size: 9.5px; font-weight: 700; color: #d97706; padding: 3px 8px; border-radius: 6px;">
                      👥 2.5 Million+ Satisfied Families
                    </span>
                  </div>
                </div>

                <!-- Categories Overview Directory -->
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 13px; margin-bottom: 16px;">
                  <div style="font-size: 11px; font-weight: 800; color: #059669; margin-bottom: 6px;">
                    🌱 ${i18n.categoryIntroTitle}
                  </div>
                  <p style="font-size: 10px; color: #475569; margin: 0 0 8px 0; line-height: 1.45;">
                    ${i18n.categoryIntro}
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; text-align: center;">
                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 6px 4px; font-size: 9.5px; font-weight: 800; color: #065f46;">
                      🌾 Biofit Agri
                    </div>
                    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 4px; font-size: 9.5px; font-weight: 800; color: #92400e;">
                      🐄 Cattle Care
                    </div>
                    <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 6px 4px; font-size: 9.5px; font-weight: 800; color: #9f1239;">
                      ❤️ Naturamore
                    </div>
                    <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 6px 4px; font-size: 9.5px; font-weight: 800; color: #115e59;">
                      🌿 Herbs & More
                    </div>
                    <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 6px 4px; font-size: 9.5px; font-weight: 800; color: #3730a3;">
                      🏡 Clean & More
                    </div>
                  </div>
                </div>

                <!-- Executive Presenter Badge on Cover -->
                <div style="background: #0a192f; color: #ffffff; border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 9.5px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px;">${i18n.distributorTitle}</span>
                    <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 2px;">${escapeHtml(distName)}</div>
                    <div style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-top: 2px;">${i18n.phoneWaLabel} +91 ${escapeHtml(distPhone)}</div>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 9.5px; color: #94a3b8;">${i18n.helplineLabel}</span>
                    <strong style="display: block; font-size: 13px; color: #34d399;">+91 79744 22572</strong>
                    <span style="font-size: 9.5px; color: #cbd5e1;">www.aarogyamindia.online</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- ================= PRODUCT PAGES (MAX 4 PRODUCTS PER PAGE CHUNK) ================= -->
          ${productPages.map((pageGroup, pageIdx) => `
            <div class="page-break product-page-wrap">
              
              <!-- Running Header: Official Netsurf Logo on Top-Right -->
              <div class="running-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="https://aarogyamindia.online/images/logo/logo.png" style="height: 32px; width: auto;" alt="Aarogyam India" onerror="this.style.display='none';">
                  <div>
                    <strong style="font-size: 13.5px; color: #0a192f; display: block; line-height: 1.2;">AAROGYAM INDIA</strong>
                    <span style="font-size: 10.5px; font-weight: 700; color: #059669;">${escapeHtml(i18n.title)}</span>
                  </div>
                </div>

                <div style="text-align: center; font-size: 10.5px; color: #475569;">
                  <span>प्रस्तुतकर्ता: <strong style="color: #0a192f;">${escapeHtml(distName)}</strong></span>
                  <span style="display: block; font-size: 10px; color: #0284c7; font-weight: 800;">📞 WhatsApp: +91 ${escapeHtml(distPhone)}</span>
                </div>

                <!-- Official Netsurf Logo on Top-Right of Every Page -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="text-align: right;">
                    <span style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Official Partner</span>
                    <strong style="font-size: 11px; font-weight: 900; color: #0f172a;">NETSURF DIRECT</strong>
                  </div>
                  <img src="https://aarogyamindia.online/images/logo/netsurf-logo.png" style="height: 34px; width: 34px; object-fit: contain; border-radius: 6px; border: 1px solid #cbd5e1;" alt="Netsurf Direct">
                </div>
              </div>

              <!-- 2x2 Grid with exactly up to 4 products -->
              <div class="product-grid-4">
                ${pageGroup.map(p => renderProductCardHtml(p)).join('')}
              </div>

              <!-- Running Footer -->
              <div class="running-footer">
                <span>📄 पृष्ठ ${pageIdx + 2} / ${totalPages}</span>
                <span>🛡️ 100% प्रामाणिक व DSIR मान्यता प्राप्त उत्पाद</span>
                <span>24×7 सहायता: +91 79744 22572 • www.aarogyamindia.online</span>
              </div>
            </div>
          `).join('')}

          <!-- ================= FINAL CERTIFICATE & DISCLAIMER PAGE ================= -->
          <div class="page-break product-page-wrap">
            
            <!-- Running Header on Final Page as well -->
            <div class="running-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="https://aarogyamindia.online/images/logo/logo.png" style="height: 32px; width: auto;" alt="Aarogyam India" onerror="this.style.display='none';">
                <div>
                  <strong style="font-size: 13.5px; color: #0a192f; display: block; line-height: 1.2;">AAROGYAM INDIA</strong>
                  <span style="font-size: 10.5px; font-weight: 700; color: #059669;">${escapeHtml(i18n.title)}</span>
                </div>
              </div>
              <div style="text-align: center; font-size: 10.5px; color: #475569;">
                <span>प्रस्तुतकर्ता: <strong style="color: #0a192f;">${escapeHtml(distName)}</strong></span>
                <span style="display: block; font-size: 10px; color: #0284c7; font-weight: 800;">📞 WhatsApp: +91 ${escapeHtml(distPhone)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="text-align: right;">
                  <span style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Official Partner</span>
                  <strong style="font-size: 11px; font-weight: 900; color: #0f172a;">NETSURF DIRECT</strong>
                </div>
                <img src="https://aarogyamindia.online/images/logo/netsurf-logo.png" style="height: 34px; width: 34px; object-fit: contain; border-radius: 6px; border: 1px solid #cbd5e1;" alt="Netsurf Direct">
              </div>
            </div>

            <div class="last-page-frame" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
              
              <!-- Distributor Gold Certificate Card -->
              <div class="distributor-gold-card">
                <span style="font-size: 11px; font-weight: 900; color: #059669; text-transform: uppercase; letter-spacing: 1px;">
                  ${i18n.distributorTitle}
                </span>
                <h2 style="font-size: 24px; font-weight: 900; color: #0a192f; margin: 6px 0 6px 0;">
                  ${escapeHtml(distName)}
                </h2>
                <div style="font-size: 18px; font-weight: 900; color: #0284c7; margin-bottom: 8px;">
                  ${i18n.phoneWaLabel} +91 ${escapeHtml(distPhone)}
                </div>
                <p style="font-size: 12px; color: #334155; margin: 0 0 10px 0; font-weight: 600;">
                  ${i18n.orderNote}
                </p>
              </div>

              <!-- 3-Step Easy Ordering Guide -->
              <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-top: 14px;">
                <div style="font-size: 12px; font-weight: 800; color: #0a192f; margin-bottom: 8px;">
                  📦 ${i18n.howToOrderTitle}
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 10.5px; color: #475569;">
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">${i18n.howToOrderStep1}</div>
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">${i18n.howToOrderStep2}</div>
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">${i18n.howToOrderStep3}</div>
                </div>
              </div>

              <!-- Corporate Compliance & Helpline Box -->
              <div style="background: #f1f5f9; border-radius: 10px; padding: 12px 16px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #475569;">
                <div>
                  <strong>${i18n.corporateAddressTitle}</strong> ${i18n.corporateAddressText}
                </div>
                <div style="text-align: right; flex-shrink: 0; padding-left: 14px;">
                  <strong>${i18n.customerCareLabel}</strong> ${i18n.customerCareText}
                </div>
              </div>

              <!-- Comprehensive Legal Disclaimer -->
              <div class="legal-disclaimer-box">
                <strong style="color: #b45309; display: block; margin-bottom: 3px; font-size: 10px;">
                  ⚖️ ${i18n.disclaimerTitle}
                </strong>
                ${i18n.disclaimerText}
              </div>

              <!-- Footer Mission -->
              <div style="text-align: center; margin-top: 14px; font-size: 10.5px; font-weight: 700; color: #059669;">
                ${i18n.footerMission}
              </div>
            </div>

            <!-- Running Footer on Final Page -->
            <div class="running-footer">
              <span>📄 पृष्ठ ${totalPages} / ${totalPages}</span>
              <span>🛡️ आधिकारिक कॉर्पोरेट एवं वितरक दस्तावेज</span>
              <span>24×7 सहायता: +91 79744 22572 • www.aarogyamindia.online</span>
            </div>
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

    // High reliability Blob download / open (solves mobile popup blocker & browser issues)
    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const printDoc = window.open(blobUrl, '_blank');
      if (!printDoc) {
        window.location.href = blobUrl;
      }
    } catch(err) {
      // Fallback
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
  document.addEventListener('DOMContentLoaded', () => {
    resolveSponsor();
    loadMasterProducts();

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
