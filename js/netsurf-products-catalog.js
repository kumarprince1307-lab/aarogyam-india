/**
 * js/netsurf-products-catalog.js
 * Advanced Dynamic Showcase, Dual Filter System, AI Voice Guide,
 * and 7-Language Personalized High-Definition PDF Catalog Generator for All Netsurf Products.
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

  // 100% Comprehensive Multi-Language Dictionary for PDF Catalog
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
      disclaimerText: "इस कैटलॉग में दी गई समस्त जानकारी, उत्पाद विनिर्देश, घटक व खुराक आधिकारिक निर्माता पोर्टल (netsurfdirect.com) के सार्वजनिक लिटरेचर से संदर्भ व जन-सुविधा हेतु ली गई है। Aarogyam India एक स्वतंत्र अधिकृत वितरक नेटवर्क है और प्रत्यक्ष विनिर्माण दायित्व का दावा नहीं करता। आधिकारिक कॉर्पोरेट जानकारी, बैच व गुणवत्ता प्रमाणन हेतु निर्माता Netsurf Communications Pvt. Ltd. से संपर्क करें। किसी भी गंभीर स्वास्थ्य विकार में उपयोग से पूर्व चिकित्सक से परामर्श लें।",
      helplineLabel: "आरोग्यम भारत सपोर्ट:",
      footerMission: "आरोग्यम भारत डिजिटल स्वास्थ्य एवं जैविक संवर्धन मिशन • www.aarogyamindia.online",
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
      disclaimerText: "সমস্ত তথ্য netsurfdirect.com থেকে রেফারেন্স হিসেবে সংগৃহীত। আরোগ্যম ইন্ডিয়া একটি স্বাধীন পরিবেশক নেটওয়ার্ক। বিশদ তথ্যের জন্য Netsurf Communications Pvt. Ltd.-এর সাথে যোগাযোগ করুন।",
      helplineLabel: "আরোগ্যম ইন্ডিয়া সাপোর্ট:",
      footerMission: "আরোগ্যম ইন্ডিয়া ডিজিটাল স্বাস্থ্য ও জৈব মিশন • www.aarogyamindia.online",
      categories: {
        agri: "🌾 কৃষি বায়োফিট (Biofit Agriculture)",
        cattle: "🐄 পশু পুষ্টি ও দুগ্ধ বিকাশ (Cattle Care)",
        health: "❤️ নেচুরোমোর স্বাস্থ্য (Naturamore)",
        herbs_more: "🌿 হার্বস অ্যান্ড মোর (Herbs & More)",
        clean_more: "🏡 ক্লিন অ্যান্ড মোর (Clean & More)"
      }
    }
  };

  // Helper to translate category dynamically
  function getTranslatedCategory(catId, langKey) {
    const dict = I18N_CATALOG[langKey] || I18N_CATALOG.hi;
    if (dict.categories && dict.categories[catId]) {
      return dict.categories[catId];
    }
    // Fallback lookup from masterCategories
    const matched = masterCategories.find(c => c.id === catId);
    return matched ? matched.name : catId;
  }

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

    const voiceScript = `नमस्ते! आरोग्यम इंडिया सम्पूर्ण नेटसर्फ उत्पाद केंद्र में आपका स्वागत है। यहाँ आप कृषि बायोफिट, पशु पोषण, नेचुरामोरे और पर्सनल केयर के सभी प्रमाणित जैविक व आयुर्वेदिक उत्पाद देख सकते हैं। ऊपर दिए गए बीमारी या कैटेगरी फ़िल्टर से अपनी पसंद के उत्पाद चुनें। आप 'डाउनलोड कैटलॉग' बटन दबाकर 7 भाषाओं में अपने नाम व मोबाइल नंबर के साथ पर्सनलाइज्ड PDF कैटलॉग भी डाउनलोड कर सकते हैं। किसी भी उत्पाद को ऑर्डर करने या सलाह के लिए व्हाट्सएप बटन का उपयोग करें।`;

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

  // 7. Ultra High-Definition Personalized PDF Catalog Generator (100% Translated)
  window.generateAndDownloadPdfCatalog = function () {
    const scopeRadio = document.querySelector('input[name="catalogScope"]:checked');
    const langRadio = document.querySelector('input[name="catalogLang"]:checked');
    const scope = scopeRadio ? scopeRadio.value : 'all';
    const langKey = langRadio ? langRadio.value : 'hi';
    const baseI18n = I18N_CATALOG[langKey] || I18N_CATALOG.hi;

    // Merge dynamic custom settings from masterCatalogSettings (customized in Admin Studio)
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

    // Open print document window
    const printDoc = window.open('', '_blank');
    if (!printDoc) {
      alert('कृपया ब्राउज़र में पॉपअप को अनुमति दें (Allow Popups) ताकि कैटलॉग खुल सके।');
      return;
    }

    const todayDate = new Date().toLocaleDateString(langKey === 'en' ? 'en-US' : (langKey === 'hi' ? 'hi-IN' : 'en-IN'), { year: 'numeric', month: 'long', day: 'numeric' });

    // Category accent color map
    const catColorMap = {
      agri: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
      cattle: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
      health: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
      herbs_more: { bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' },
      clean_more: { bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' }
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${i18n.title} - ${distName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
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
            min-height: 260mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .cover-inner-frame {
            border: 1.5px solid #d97706;
            border-radius: 12px;
            padding: 24px 20px;
            display: flex;
            flex-direction: column;
            height: 100%;
            justify-content: space-between;
          }

          .cover-hero-card {
            background: linear-gradient(135deg, #0a192f 0%, #0f2b48 55%, #053b3b 100%);
            color: #ffffff;
            border-radius: 16px;
            padding: 28px 22px;
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
            font-size: 10.5px;
            font-weight: 900;
            padding: 4px 14px;
            border-radius: 20px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 2px 8px rgba(217,119,6,0.3);
          }

          .cover-title-text {
            font-size: 26px;
            font-weight: 900;
            color: #34d399;
            margin: 14px 0 6px 0;
            line-height: 1.25;
            letter-spacing: -0.3px;
          }

          .cover-subtitle-text {
            font-size: 13px;
            color: #e2e8f0;
            margin: 0;
            line-height: 1.45;
          }

          /* Running Page Header */
          .running-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 14px;
          }

          /* Product Grid: 2 Crisp Columns */
          .product-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .product-card {
            border: 1.2px solid #cbd5e1;
            border-radius: 10px;
            padding: 10px;
            background: #ffffff;
            display: flex;
            gap: 10px;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .product-card-img-box {
            width: 95px;
            height: 95px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;
          }

          .product-card-img-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .product-cat-chip {
            display: inline-block;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid transparent;
          }

          .product-pack-chip {
            display: inline-block;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            background: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
          }

          .product-title {
            font-size: 11.5px;
            font-weight: 800;
            color: #0a192f;
            margin: 3px 0;
            line-height: 1.25;
          }

          .price-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            margin: 3px 0 5px 0;
          }

          .offer-price {
            font-size: 13.5px;
            font-weight: 900;
            color: #059669;
          }

          .mrp-cross {
            font-size: 10px;
            color: #94a3b8;
            text-decoration: line-through;
          }

          .discount-badge {
            font-size: 8.5px;
            font-weight: 800;
            background: #fee2e2;
            color: #dc2626;
            padding: 1px 4px;
            border-radius: 4px;
          }

          .card-snippet {
            font-size: 9px;
            color: #475569;
            line-height: 1.35;
            margin-bottom: 4px;
          }

          .card-ing-box {
            background: #f8fafc;
            border-left: 2.5px solid #10b981;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 8.5px;
            color: #334155;
            margin-bottom: 3px;
            line-height: 1.3;
          }

          .card-dose-box {
            background: #f0fdf4;
            border-left: 2.5px solid #22c55e;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 8.5px;
            color: #166534;
            line-height: 1.3;
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
            font-size: 9px;
            line-height: 1.45;
            color: #475569;
            margin-top: 14px;
          }
        </style>
      </head>
      <body>

        <!-- ================= PAGE 1: LUXURY COVER ================= -->
        <div class="page-break">
          <div class="cover-outer-frame">
            <div class="cover-inner-frame">
              
              <!-- Top Branding Header -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="https://aarogyamindia.online/images/logo/logo.png" style="height: 52px; width: auto;" alt="Aarogyam India" onerror="this.style.display='none';">
                  <div>
                    <h1 style="font-size: 22px; font-weight: 900; color: #0a192f; margin: 0; letter-spacing: -0.5px;">AAROGYAM INDIA</h1>
                    <span style="font-size: 10.5px; font-weight: 800; color: #059669; letter-spacing: 1px;">NATIONAL DIRECT HEALTH & AGRI NETWORK</span>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 9.5px; font-weight: 800; padding: 4px 10px; border-radius: 20px;">
                    🛡️ ${i18n.genuineBadge}
                  </span>
                </div>
              </div>

              <!-- Main Hero Plaque -->
              <div class="cover-hero-card" style="margin: 20px 0;">
                <div class="cover-badge-pill">${i18n.coverBadge}</div>
                <h2 class="cover-title-text">${i18n.title}</h2>
                <p class="cover-subtitle-text">${i18n.subtitle}</p>
                <div style="margin-top: 16px; display: flex; justify-content: center; gap: 18px; font-size: 10.5px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
                  <span>📅 ${i18n.dateLabel} <strong style="color: #ffffff;">${todayDate}</strong></span>
                  <span>📦 ${i18n.totalProductsLabel} <strong style="color: #34d399;">${prodsToPrint.length}</strong></span>
                  <span>🌐 <strong style="color: #38bdf8;">7-Language Certified</strong></span>
                </div>
              </div>

              <!-- Corporate Profile Card -->
              <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <h3 style="font-size: 14px; font-weight: 800; color: #0a192f; margin: 0 0 6px 0;">
                  🏢 ${i18n.coverCompanyTitle}
                </h3>
                <p style="font-size: 10.5px; color: #334155; line-height: 1.55; margin: 0 0 10px 0;">
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
              <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 18px;">
                <div style="font-size: 10.5px; font-weight: 800; color: #059669; margin-bottom: 8px;">
                  🌱 ${i18n.categoryIntroTitle}
                </div>
                <p style="font-size: 10px; color: #475569; margin: 0 0 10px 0; line-height: 1.45;">
                  ${i18n.categoryIntro}
                </p>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; text-align: center;">
                  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 6px 4px; font-size: 9px; font-weight: 800; color: #065f46;">
                    🌾 Biofit Agri
                  </div>
                  <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 4px; font-size: 9px; font-weight: 800; color: #92400e;">
                    🐄 Cattle Care
                  </div>
                  <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 6px 4px; font-size: 9px; font-weight: 800; color: #9f1239;">
                    ❤️ Naturamore
                  </div>
                  <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 6px 4px; font-size: 9px; font-weight: 800; color: #115e59;">
                    🌿 Herbs & More
                  </div>
                  <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 6px 4px; font-size: 9px; font-weight: 800; color: #3730a3;">
                    🏡 Clean & More
                  </div>
                </div>
              </div>

              <!-- Executive Presenter Badge on Cover -->
              <div style="background: #0a192f; color: #ffffff; border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-size: 9.5px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px;">${i18n.distributorTitle}</span>
                  <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 2px;">${distName}</div>
                  <div style="font-size: 12.5px; font-weight: 800; color: #38bdf8; margin-top: 2px;">${i18n.phoneWaLabel} +91 ${distPhone}</div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 9.5px; color: #94a3b8;">${i18n.helplineLabel}</span>
                  <strong style="display: block; font-size: 12.5px; color: #34d399;">+91 79744 22572</strong>
                  <span style="font-size: 9px; color: #cbd5e1;">www.aarogyamindia.online</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ================= PRODUCT PAGES ================= -->
        <div class="running-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="font-size: 13px; color: #0a192f;">AAROGYAM INDIA</strong>
            <span style="color: #cbd5e1;">•</span>
            <span style="font-size: 11px; font-weight: 700; color: #059669;">${i18n.title}</span>
          </div>
          <div style="font-size: 10px; color: #64748b;">
            ${i18n.distributorTitle.split('(')[0]} <strong style="color: #0a192f;">${distName}</strong> (+91 ${distPhone})
          </div>
        </div>

        <div class="product-grid">
          ${prodsToPrint.map(p => {
            const mrp = parseInt(p.mrp, 10) || 0;
            const discountPct = parseInt(p.discount_pct, 10) || 0;
            const offerPrice = p.discounted_price || (discountPct ? Math.round(mrp * (1 - discountPct / 100)) : mrp);
            const imgSrc = (p.image && !p.image.includes('logo.png')) ? (p.image.startsWith('http') ? p.image : 'https://aarogyamindia.online' + p.image) : 'https://aarogyamindia.online/images/logo/logo.png';
            const translatedCat = getTranslatedCategory(p.category, langKey);
            const catColors = catColorMap[p.category] || { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };

            return `
              <div class="product-card">
                <div class="product-card-img-box">
                  <img src="${imgSrc}" alt="${escapeHtml(p.name)}" onerror="this.src='https://aarogyamindia.online/images/logo/logo.png'">
                </div>

                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <!-- Category & Pack Size Pills -->
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; margin-bottom: 2px;">
                      <span class="product-cat-chip" style="background: ${catColors.bg}; color: ${catColors.text}; border-color: ${catColors.border};">
                        ${escapeHtml(translatedCat)}
                      </span>
                      ${p.pack_size ? `<span class="product-pack-chip">📦 ${escapeHtml(p.pack_size)}</span>` : ''}
                    </div>

                    <!-- Title -->
                    <h4 class="product-title">${escapeHtml(p.name)}</h4>

                    <!-- Price Row -->
                    <div class="price-row">
                      <span class="offer-price">${i18n.offerLabel} ₹${offerPrice}</span>
                      ${mrp > offerPrice ? `
                        <span class="mrp-cross">₹${mrp}</span>
                        <span class="discount-badge">${discountPct}% ${i18n.discountBadge}</span>
                      ` : ''}
                    </div>

                    <!-- Description Snippet -->
                    ${p.description ? `
                      <div class="card-snippet" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${escapeHtml(p.description)}
                      </div>
                    ` : ''}
                  </div>

                  <!-- Ingredients & Dose Details -->
                  <div>
                    ${p.ingredients ? `
                      <div class="card-ing-box">
                        <strong style="color: #059669;">${i18n.ingLabel}</strong> ${escapeHtml(p.ingredients)}
                      </div>
                    ` : ''}
                    ${p.dose ? `
                      <div class="card-dose-box">
                        <strong style="color: #15803d;">${i18n.doseLabel}</strong> ${escapeHtml(p.dose)}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- ================= FINAL CERTIFICATE & DISCLAIMER PAGE ================= -->
        <div style="margin-top: 24px;" class="last-page-frame">
          
          <!-- Distributor Gold Certificate Card -->
          <div class="distributor-gold-card">
            <span style="font-size: 10px; font-weight: 900; color: #059669; text-transform: uppercase; letter-spacing: 1px;">
              ${i18n.distributorTitle}
            </span>
            <h2 style="font-size: 22px; font-weight: 900; color: #0a192f; margin: 4px 0 6px 0;">
              ${distName}
            </h2>
            <div style="font-size: 17px; font-weight: 900; color: #0284c7; margin-bottom: 6px;">
              ${i18n.phoneWaLabel} +91 ${distPhone}
            </div>
            <p style="font-size: 11px; color: #334155; margin: 0 0 10px 0; font-weight: 600;">
              ${i18n.orderNote}
            </p>
          </div>

          <!-- 3-Step Easy Ordering Guide -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-top: 14px;">
            <div style="font-size: 11px; font-weight: 800; color: #0a192f; margin-bottom: 6px;">
              📦 ${i18n.howToOrderTitle}
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 10px; color: #475569;">
              <div>${i18n.howToOrderStep1}</div>
              <div>${i18n.howToOrderStep2}</div>
              <div>${i18n.howToOrderStep3}</div>
            </div>
          </div>

          <!-- Corporate Compliance & Helpline Box -->
          <div style="background: #f1f5f9; border-radius: 8px; padding: 10px 14px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #475569;">
            <div>
              <strong>${i18n.corporateAddressTitle}</strong> ${i18n.corporateAddressText}
            </div>
            <div style="text-align: right; flex-shrink: 0; padding-left: 12px;">
              <strong>${i18n.customerCareLabel}</strong> ${i18n.customerCareText}
            </div>
          </div>

          <!-- Comprehensive Legal Disclaimer -->
          <div class="legal-disclaimer-box">
            <strong style="color: #b45309; display: block; margin-bottom: 2px;">
              ⚖️ ${i18n.disclaimerTitle}
            </strong>
            ${i18n.disclaimerText}
          </div>

          <!-- Footer Mission -->
          <div style="text-align: center; margin-top: 12px; font-size: 9.5px; font-weight: 700; color: #059669;">
            ${i18n.footerMission}
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
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
  });

})();
