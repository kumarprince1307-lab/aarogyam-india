/**
 * ==========================================================================
 * AAROGYAM SMART eTAILER (MISSION ₹8,19,250) - CORE GAMING & BUSINESS ENGINE
 * Offline-First PWA | Zero Egress Midnight Batch Sync | 15-Day Dual Closing
 * Version: 4.0 (Robust Tab Switching, Responsive Dual Theme & Live Custom Plans)
 * ==========================================================================
 */

(function (window, document) {
  'use strict';

  // -------------------------------------------------------------
  // 1. CONSTANTS & INITIAL STATE
  // -------------------------------------------------------------
  const STORAGE_KEY_VAULT = 'AAROGYAM_ETAILER_VAULT_V1';
  const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';

  let catalogData = null;
  let activeCategory = 'agri';
  let selectedProblem = null;
  let audioPlayer = new Audio();
  let currentPlayingLessonId = null;
  let careerLadderData = null;
  let activeAudioCategory = 'all';
  let pendingAudioLesson = null;

  // 16 Full Masterclass Audio Lessons (5 Company Heritage + 11 Product Masterclasses)
  const DEFAULT_AUDIO_LESSONS = [
    {
      "id": "al_company_profile",
      "category": "company",
      "title": "🏢 1. नेटसर्फ कंपनी प्रोफाइल & 25 साल की गौरवशाली विरासत (2000-2026)",
      "speaker": "संजय मालपानी (सीनियर लीडर)",
      "duration": "3:40 Min",
      "audio_url": "",
      "summary": "नमस्ते साथियों! नेटसर्फ डायरेक्ट भारत की सबसे पुरानी, सबसे सुरक्षित और 25 साल से लगातार सफल डायरेक्ट सेलिंग कंपनी है। नेटसर्फ की स्थापना सन 2000 में पुणे, महाराष्ट्र में हुई थी। कंपनी के पास अपनी खुद की वर्ल्ड-क्लास R&D लैब्स और हिमाचल व महाराष्ट्र में विशाल मैन्युफैक्चरिंग प्लांट्स हैं। कंपनी के पास 65 से ज्यादा 100% जैविक, पेटेंटेड और रिसर्च-बेस्ड प्रोडक्ट्स हैं। 25 लाख से ज्यादा संतुष्ट उपभोक्ता और लाखों करोड़पति लीडर्स नेटसर्फ की सबसे बड़ी ताकत हैं। शून्य कर्ज वाली यह कंपनी भारत सरकार के सभी डायरेक्ट सेलिंग नियमों का 100% पालन करती है।"
    },
    {
      "id": "al_company_rd_gmp",
      "category": "company",
      "title": "🧪 2. DSIR मान्यता प्राप्त R&D एवं वर्ल्ड-क्लास GMP फैक्ट्रियां",
      "speaker": "डॉ. अजय जोशी (चीफ साइंटिस्ट)",
      "duration": "3:15 Min",
      "audio_url": "",
      "summary": "साथियों, नेटसर्फ कोई ट्रेडिंग कंपनी नहीं है। नेटसर्फ के पास भारत सरकार के विज्ञान एवं प्रौद्योगिकी मंत्रालय (DSIR) से मान्यता प्राप्त अत्याधुनिक अनुसंधान केंद्र हैं। कंपनी के वैज्ञानिक पिछले 25 वर्षों से भारतीय मिट्टी, फसलों, पशुओं और मानव स्वास्थ्य पर गहन शोध करके 100% जैविक, नैनो-टेक्नोलॉजी आधारित फॉर्मूलेशन तैयार करते हैं। हमारे सभी उत्पाद हिमाचल के बद्दी और महाराष्ट्र के पुणे में स्थित WHO-GMP सर्टिफाइड प्लांट्स में बनते हैं, जहां स्वच्छता और शुद्धता का अंतरराष्ट्रीय स्तर पर परीक्षण होता है।"
    },
    {
      "id": "al_company_ethics_zero_debt",
      "category": "company",
      "title": "🛡️ 3. 100% लीगल, शून्य कर्ज एवं 25 साल की अटूट विश्वसनीयता",
      "speaker": "अमित गर्ग (लीगल हेड)",
      "duration": "2:55 Min",
      "audio_url": "",
      "summary": "डायरेक्ट सेलिंग में सबसे महत्वपूर्ण बात कंपनी की स्थिरता होती है। नेटसर्फ देश की उन गिनी-चुनी कंपनियों में से है, जिसके ऊपर 1 रुपये का भी बैंक कर्ज नहीं है। सन 2000 से लेकर आज 2026 तक, कंपनी ने हर महीने और हर 15 दिन में तय समय पर अपने डिस्ट्रीब्यूटर्स के बैंक खाते में पे-आउट ट्रांसफर किया है। कंपनी भारत सरकार के 'डायरेक्ट सेलिंग रूल्स 2021' और उपभोक्ता संरक्षण कानून का 100% पालन करती है। यहां आपका भविष्य, समय और मान-सम्मान पूरी तरह सुरक्षित है।"
    },
    {
      "id": "al_leader_mindset_rejection",
      "category": "company",
      "title": "🦁 4. लीडरशिप माइंडसेट: फील्ड में 'ना' (Rejection) को 'हां' में कैसे बदलें?",
      "speaker": "दिलीप बोरसे (टॉप अचीवर)",
      "duration": "3:30 Min",
      "audio_url": "",
      "summary": "साथियों, जब आप किसी किसान या ग्राहक के पास जाते हैं और वह मना करता है, तो निराश न हों! 'NO' का मतलब होता है 'Next Opportunity' यानी अगली संभावना। किसान केमिकल इसलिए इस्तेमाल करता है क्योंकि उसे जैविक के सही परिणामों का पता नहीं है। जब आप उसे विश्वास से रिजल्ट्स दिखाते हैं, 1-पंप का डेमो करते हैं या खाता बुक पर रिजल्ट की गारंटी देते हैं, तो वही ग्राहक आपका सबसे बड़ा प्रचारक बन जाता है। रोज़ 5 नए लोगों से मिलने का संकल्प लें — सफलता आपकी दासी बन जाएगी!"
    },
    {
      "id": "al_netsurf_plan_mastery",
      "category": "company",
      "title": "💼 5. शुक्रवार 15% रिटेल बोनस व ₹8,19,250 15-दिन कैपिंग का महामंत्र",
      "speaker": "दिलीप बोरसे (टॉप नेटसर्फ लीडर)",
      "duration": "4:15 Min",
      "audio_url": "",
      "summary": "साथियों, नेटसर्फ बिज़नेस प्लान भारत का सबसे पारदर्शी और अमीर बनाने वाला प्लान है। सबसे पहले हर शुक्रवार को रिटेल क्लोजिंग होती है। यदि आप हफ्ते में ₹8,000 की रिटेल सेल करते हैं, तो आपका 15% मैक्सिमम रिटेल डिस्काउंट अनलॉक हो जाता है। इसके बाद हर 15 दिन में टर्नओवर मैचिंग बोनस मिलता है। Team 1 और Team 2 से टर्नओवर मैच होने पर आपको 3% से 5% तक बाइनरी इनकम मिलती है। जब आपकी दोनों टीमों से 15 दिन में 81 लाख 92 हजार 500 रुपये का टर्नओवर मैच होता है, तो आपको 15 दिन का 8 लाख 19 हजार 250 रुपये का कैपिंग चेक मिलता है!"
    },
    {
      "id": "al_prod_stimrich",
      "category": "biofit",
      "title": "🌾 6. बायोफिट स्टीमरिच (Stimrich) — पौधों का ग्रोथ व पैदावार बूस्टर",
      "speaker": "सुभाष शर्मा (एग्रीकल्चर एक्सपर्ट)",
      "duration": "3:20 Min",
      "audio_url": "",
      "summary": "स्टीमरिच पौधों के लिए एक संपूर्ण जैविक टॉनिक है। यह पौधों में प्रकाश संश्लेषण की क्रिया को तेज करता है, जिससे पौधे अधिक भोजन बनाते हैं। इसका स्प्रे करने से 3 दिन में नई शाखाएं, कल्ले और कोपलें फूटती हैं। फूल अवस्था में स्प्रे करने से फूल झड़ने से रुकते हैं और फलों का आकार 25 से 30% बड़ा व वजनदार होता है। खुराक: मात्र 20ml से 25ml प्रति 15 लीटर पंप। हर फसल में 2 से 3 बार इसका स्प्रे करवाएं और किसान को 25% अधिक उपज दिलाएं।"
    },
    {
      "id": "al_prod_bio99",
      "category": "biofit",
      "title": "💧 7. बायोफिट बायो-99 (Bio99) — 100% सिलिकॉन स्प्रेडर, स्टीकर व एक्टिवेटर",
      "speaker": "सुभाष शर्मा (एग्रीकल्चर एक्सपर्ट)",
      "duration": "3:10 Min",
      "audio_url": "",
      "summary": "बायो-99 कोई साधारण गोंद नहीं, बल्कि 100% शुद्ध सिलिकॉन बेस्ड नॉन-आयनिक एक्टिवेटर है। जब आप किसी भी कीटनाशक, फंगीसाइड या टॉनिक के साथ बायो-99 मिलाते हैं, तो यह पानी के पृष्ठ तनाव को तोड़कर दवा की एक बूंद को पूरे पत्ते पर महीन परत में फैला देता है। यह दवा को 10 सेकंड में पत्ते की नसों के अंदर पहुंचा देता है, जिससे स्प्रे के 15 मिनट बाद बारिश आने पर भी दवा नहीं धुलती। खुराक: मात्र 5ml प्रति 15 लीटर पंप।"
    },
    {
      "id": "al_prod_set_npk",
      "category": "biofit",
      "title": "🌱 8. बायोफिट सेट (Set) — मिट्टी सुधारक, खारापन निवारक व केंचुआ जाग्रत",
      "speaker": "सुभाष शर्मा (एग्रीकल्चर एक्सपर्ट)",
      "duration": "3:15 Min",
      "audio_url": "",
      "summary": "लगातार रासायनिक खाद डालने से हमारी उपजाऊ जमीन कड़क और पथरीली हो चुकी है। बायोफिट सेट (Set) मिट्टी का प्राकृतिक कंडीशनर है। इसमें मौजूद लाभकारी सूक्ष्मजीव और कार्बनिक तत्व जमीन के कड़ेपन को तोड़कर उसे भुरभुरा और हवादार बनाते हैं। यह मिट्टी के पीएच मान (खारेपन) को संतुलित करता है और जमीन में सुप्त पड़े देशी केंचुओं को सक्रिय करता है। 1 लीटर सेट प्रति एकड़ सिंचाई के साथ देने से रासायनिक खाद की 25% तक बचत होती है।"
    },
    {
      "id": "al_prod_wrapup",
      "category": "biofit",
      "title": "🍄 9. बायोफिट रैपअप (Wrapup) — फफूंद, उकठा व जड़ गलन का अभेद्य कवच",
      "speaker": "सुभाष शर्मा (एग्रीकल्चर एक्सपर्ट)",
      "duration": "3:00 Min",
      "audio_url": "",
      "summary": "रैपअप पौधों को फंगस, बैक्टीरिया और वायरल रोगों से बचाने का अद्वितीय जैव-नियंत्रक है। जब रैपअप का स्प्रे किया जाता है, तो यह पौधे के पत्तों और तने पर एक अदृश्य, पारदर्शी जैविक सुरक्षा कवच बना देता है। हवा में उड़ते हुए हानिकारक फंगस के बीजाणु पौधे के संपर्क में नहीं आ पाते। जड़ गलन और उकठा रोग में रैपअप की ड्रेंचिंग करने से 48 घंटे में फफूंद का फैलाव रुक जाता है। खुराक: 30ml प्रति पंप।"
    },
    {
      "id": "al_prod_intact_bio303",
      "category": "biofit",
      "title": "🐛 10. बायोफिट इंटैक्ट (Intact) & बायो-आर 303 — जैविक कीट एवं इल्ली काल",
      "speaker": "सुभाष शर्मा (एग्रीकल्चर एक्सपर्ट)",
      "duration": "3:10 Min",
      "audio_url": "",
      "summary": "इंटैक्ट और बायो-आर 303 रस चूसक कीटों जैसे थ्रिप्स, सफेद मक्खी, माहू और सभी प्रकार की इल्लियों का 100% जैविक समाधान हैं। रासायनिक जहर कीटों के साथ मित्र कीटों को भी मार देते हैं और फसल में जहरीला अंश छोड़ते हैं। इंटैक्ट कीट के तंत्रिका तंत्र और पाचन तंत्र पर असर करता है, जिससे कीट का भोजन तुरंत बंद हो जाता है और 48 घंटे में वह खत्म हो जाता है। यह जैविक प्रमाणीकरण युक्त सुरक्षित फॉर्मूला है। खुराक: 30ml इंटैक्ट + 5ml बायो99।"
    },
    {
      "id": "al_prod_cfc_plus",
      "category": "cfc",
      "title": "🐄 11. सीएफसी प्लस (CFC Plus) — दुग्ध वृद्धि, फैट/मलाई व प्रजनन संजीवनी",
      "speaker": "राजेश पटेल (डेयरी कंसलटेंट)",
      "duration": "3:30 Min",
      "audio_url": "",
      "summary": "पशुपालकों के लिए सीएफसी प्लस वरदान है। इसमें प्रीबायोटिक, प्रोबायोटिक, 22 चेलेटेड मिनरल्स, शतावरी, मेथी और विटामिन्स हैं। रोज सुबह-शाम 5 से 10 ग्राम दाने में मिलाकर देने से 7 दिन में दूध 1 से 1.5 लीटर बढ़ता है, डेयरी में फैट 0.5 से 1.2 डिग्री ज्यादा आता है, और जो पशु बार-बार खाली रह जाते हैं, वे 30 दिन में सही समय पर गाभिन ठहरते हैं। ₹8 का रोज का खर्च और ₹50 का अतिरिक्त मुनाफा!"
    },
    {
      "id": "al_prod_joint_care",
      "category": "naturamore",
      "title": "🦵 12. नेचुरामोर जॉइंट केयर (Joint Care) — घुटनों के दर्द व कार्टिलेज का पुनर्निर्माण",
      "speaker": "डॉ. अनिल वर्मा (आयुर्वेद विशेषज्ञ)",
      "duration": "3:15 Min",
      "audio_url": "",
      "summary": "उम्र बढ़ने या पोषण की कमी से जब घुटनों का कार्टिलेज और साइनोवियल फ्लूइड (ग्रीस) घिस जाता है, तो हड्डियां आपस में टकराकर दर्द और सूजन पैदा करती हैं। नेचुरामोर जॉइंट केयर में प्राकृतिक ग्लूकोसामाइन, सलाई गुग्गुल, रास्ना और अश्वगंधा है। यह कार्टिलेज को दोबारा पोषण देकर लचीला बनाता है और बिना किसी पेनकिलर के दर्द व सूजन में 15 दिनों में स्थायी आराम दिलाता है। खुराक: 1 कैप्सूल सुबह-शाम भोजन के बाद।"
    },
    {
      "id": "al_prod_naturamore_powder",
      "category": "naturamore",
      "title": "💊 13. नेचुरामोर न्यूट्रिशन पाउडर — संपूर्ण परिवार स्वास्थ्य, इम्युनिटी व स्टैमिना",
      "speaker": "डॉ. अनिल वर्मा (आयुर्वेद विशेषज्ञ)",
      "duration": "3:25 Min",
      "audio_url": "",
      "summary": "नेचुरामोर पाउडर भारत का सबसे भरोसेमंद 100% शाकाहारी न्यूट्रिशन है। इसमें 13 आवश्यक विटामिन्स, 10 मिनरल्स, ओमेगा 3 DHA, एलोवेरा और अश्वगंधा का अनूठा संतुलन है। यह शरीर की रोग प्रतिरोधक क्षमता बढ़ाता है, दिनभर स्फूर्ति रखता है और पोषण की कमियों को पूरा करता है। पुरुषों के लिए नेचुरामोर प्लस, महिलाओं के लिए फॉर विमेन (शतावरी युक्त), बच्चों के लिए स्वादिष्ट चॉकलेट कुकी फ्लेवर में उपलब्ध है।"
    },
    {
      "id": "al_prod_easy_detox",
      "category": "naturamore",
      "title": "🍵 14. नेचुरामोर ईजी डिटॉक्स (Easy Detox) — आंतों की सफाई, लिवर स्वास्थ्य व गैस मुक्ति",
      "speaker": "डॉ. अनिल वर्मा (आयुर्वेद विशेषज्ञ)",
      "duration": "3:05 Min",
      "audio_url": "",
      "summary": "आयुर्वेद का नियम है: 90% बीमारियां पेट और आंतों की गंदगी से पैदा होती हैं। जब पेट में मल सड़ता है तो गैस, एसिडिटी, मोटापा और लिवर पर चर्बी चढ़ती है। ईजी डिटॉक्स में त्रिफला, सनाय, कुटकी और हरीतकी है। रात को 1 गोली लेने से यह आंतों में वर्षों से जमे टॉक्सिन्स को बिना मरोड़ के बाहर निकाल देता है। यह आंतों के प्राकृतिक बैक्टीरिया को सुरक्षित रखता है और सुबह एकदम हल्का, तरोताजा पेट देता है।"
    },
    {
      "id": "al_prod_herbs_face_skin",
      "category": "herbs_more",
      "title": "✨ 15. हर्ब्स एंड मोर विटामिन थेरेपी — कील-मुंहासे, पिगमेंटेशन व नेचुरल स्किन ग्लो",
      "speaker": "मीनाक्षी राव (ब्यूटी कंसलटेंट)",
      "duration": "3:10 Min",
      "audio_url": "",
      "summary": "हर्ब्स एंड मोर विटामिन थेरेपी रेंज त्वचा को भीतर से पोषण देती है। नीम और हल्दी फेस वॉश त्वचा से हानिकारक बैक्टीरिया और अतिरिक्त तेल हटाकर पिंपल्स को ठीक करता है। विटामिन B3 और E युक्त डे क्रीम त्वचा को धूप से बचाकर झाइयों और काले धब्बों को हल्का करती है। नाइट क्रीम सोते समय स्किन सेल्स को रिपेयर करके चेहरे पर प्राकृतिक दमक और कसाव लाती है। यह 100% पैराबेन-मुक्त व सल्फेट-मुक्त सुरक्षित फॉर्मूला है।"
    },
    {
      "id": "al_prod_herbs_hair_care",
      "category": "herbs_more",
      "title": "💇 16. हर्ब्स एंड मोर हेयर केयर — बाल झड़ना, डैंड्रफ रोकथाम व जड़ों का पोषण",
      "speaker": "मीनाक्षी राव (ब्यूटी कंसलटेंट)",
      "duration": "2:55 Min",
      "audio_url": "",
      "summary": "बालों के झड़ने और डैंड्रफ का सबसे बड़ा कारण स्कैल्प में पोषण की कमी और फंगल इन्फेक्शन होता है। हर्ब्स एंड मोर नरिशिंग हेयर ऑयल भृंगराज, ब्राह्मी और आंवला से समृद्ध है जो बालों की जड़ों को मजबूत बनाता है। एंटी-डैंड्रफ शैम्पू टी-ट्री ऑयल से डैंड्रफ को जड़ से समाप्त करता है और हेयर सीरम बालों को रेशमी, मुलायम और चमकदार बनाता है। 15 दिन में बाल झड़ना 90% तक नियंत्रित हो जाता है।"
    },
    {
      "id": "al_tut_ebook_library",
      "category": "tutorial",
      "title": "📚 17. आरोग्यम ई-बुक & डिजिटल लाइब्रेरी गाइड (eBook & Guides Hub)",
      "speaker": "आरोग्यम टेक कोच",
      "duration": "3:10 Min",
      "audio_url": "",
      "summary": "नमस्ते साथियों! आरोग्यम डिजिटल ई-बुक लाइब्रेरी हर ई-टेलर का सबसे शक्तिशाली डिजिटल हथियार है। यहां आपको फसलों की संपूर्ण ऑर्गेनिक मार्गदर्शिका, पशुपालन दुग्ध वृद्धि गाइड, नेचुरामोर स्वास्थ्य डाइट चार्ट और हर्ब्स ब्यूटी कैटलॉग बिल्कुल मुफ्त पीडीएफ और डिजिटल फ्लिप-बुक के रूप में मिलते हैं। आप किसी भी ई-बुक को 1-टैप में पढ़ सकते हैं और सीधे अपने किसान या ग्राहक को WhatsApp पर शेयर कर सकते हैं। जब आप ग्राहक को लिखित ई-बुक भेजते हैं तो आपका विश्वास और अधिकार 10 गुना बढ़ जाता है और ऑर्डर तुरंत क्लोज होता है!"
    },
    {
      "id": "al_tut_mkt_engine",
      "category": "tutorial",
      "title": "🚀 18. मार्केटिंग इंजन & WhatsApp हुक्स स्टूडियो गाइड",
      "speaker": "आरोग्यम ग्रोथ एक्सपर्ट",
      "duration": "3:30 Min",
      "audio_url": "",
      "summary": "साथियों, मार्केटिंग इंजन आपके रोज़मर्रा के प्रचार को 100% ऑटोमेट करता है। इसमें 5 श्रेणियों के 50 से अधिक उच्च-रूपांतरणकारी WhatsApp हुक्स, किसान शायरी और स्टेटस मैसेज पहले से लिखे हुए हैं। बस श्रेणी चुनें, अपनी पसंद का हुक मैसेज सेलेक्ट करें और नीचे 'कॉपी' या सीधे 'WhatsApp शेयर' पर टैप करें। यह मैसेज आपके नाम, मोबाइल नंबर और रेफरल लिंक के साथ तैयार होकर जाता है। सुबह 7 से 9 बजे के बीच स्टेटस लगाने और किसानों के ग्रुप में भेजने से आपको रोजाना 3 से 5 नई लीड्स और कॉल्स मिलेंगी!"
    },
    {
      "id": "al_tut_survey_diagnosis",
      "category": "tutorial",
      "title": "🌾 19. 30-सेकंड स्मार्ट कंज्यूमर सर्वे & 1-क्लिक नुस्खा गाइड",
      "speaker": "आरोग्यम टेक कोच",
      "duration": "3:20 Min",
      "audio_url": "",
      "summary": "साथियों, जब भी आप किसी किसान या ग्राहक से मिलते हैं, तो आपको याद रखने की ज़रूरत नहीं है कि किस बीमारी में क्या देना है। 30-सेकंड स्मार्ट सर्वे खोलें, श्रेणी चुनें जैसे 'कृषि बायोफिट' या 'पशुपालन', और सामने दिख रही समस्या (जैसे पीलापन, उकठा या कम दूध) पर टैप करें। सिस्टम तुरंत सटीक 3 प्रोडक्ट्स का कॉम्बो, उनकी सही खुराक (Dose), बचत और उपयोग का तरीका स्क्रीन पर दिखा देता है। 'WhatsApp नुस्खा भेजें' पर टैप करते ही पूरा नुस्खा किसान के मोबाइल पर पहुंच जाता है!"
    },
    {
      "id": "al_tut_khata_autoship",
      "category": "tutorial",
      "title": "📖 20. ई-टेलर खाता बुक & ऑटोशिप 6th मंथ फ्री रडार मास्टरक्लास",
      "speaker": "आरोग्यम बिज़नेस कोच",
      "duration": "3:45 Min",
      "audio_url": "",
      "summary": "साथियों, यह मॉड्यूल आपके रिटेल मुनाफे को सुरक्षित करता है। जब भी आप किसी को प्रोडक्ट दें, '+ नई खाता एंट्री' में नाम, फोन और नकद/उधार राशि दर्ज करें। यह राशि सीधे आपके शुक्रवार के 15% रिटेल बोनस ट्रैकर में जुड़ती है। साथ ही ऑटोशिप रडार ट्रैक करता है कि कौन सा ग्राहक कितने महीनों से सामान ले रहा है। जैसे ही किसी ग्राहक के 5 महीने पूरे होते हैं, सिस्टम आपको ग्रीन अलर्ट देता है ताकि आप 6वें महीने उसे 100% मुफ़्त प्रोडक्ट गिफ्ट देकर जीवनभर का पक्का ग्राहक बना सकें!"
    }
  ];

  let publishedAudioLessons = DEFAULT_AUDIO_LESSONS;

  // Real-Time Audio Player State
  let audioState = {
    isPlaying: false,
    isPaused: false,
    currentTitle: '',
    currentSpeaker: '',
    currentTime: 0,
    totalDuration: 180, // estimated seconds
    timerInterval: null,
    speechUtterance: null
  };

  // Speech-to-Text Recognition State
  let voiceRecognition = null;
  let isVoiceRecording = false;

  // Default Vault State
  let vault = {
    user_mobile: '',
    distributor_name: 'प्रिय ई-टेलर',
    share_id: 'AI000004',
    level: 2,
    xp: 350,
    user_start_date: '2026-07-15',
    current_rank_id: 'rank_rock_star',
    completed_ranks: ['rank_pro_etailer'],
    income_logs: [
      { id: 'inc_1', cycle_name: '1-15 अगस्त 2026 (साइकल 1)', retail: 2400, matching: 3500, total: 5900, date: '2026-08-15' },
      { id: 'inc_2', cycle_name: '16-31 अगस्त 2026 (साइकल 2)', retail: 3800, matching: 6200, total: 10000, date: '2026-08-31' }
    ],
    target_income: 25000,
    custom_cycle_end_date: '',
    current_cycle_id: 'CYCLE_' + new Date().getFullYear() + '_' + (new Date().getMonth() + 1),
    friday_retail_total: 0,
    fortnight_turnover: 0,
    khata_records: [],
    todo_tasks: [
      { id: 'td_1', title: 'रामलाल जी को कॉल करें (सोयाबीन स्प्रे फीडबैक)', date: new Date().toISOString().split('T')[0], phone: '9826011223', done: false },
      { id: 'td_2', title: 'दिनेश जी से CFC आर्डर पर चर्चा करें', date: new Date().toISOString().split('T')[0], phone: '9826033445', done: false },
      { id: 'td_3', title: 'सुरेश जी को ई-टेलर बिज़नेस प्लान दिखाएं', date: new Date().toISOString().split('T')[0], phone: '9826055667', done: true }
    ],
    growth_history: [
      { cycle: 'साइकल 1', retail: 3400, turnover: 18000, consumers: 4 },
      { cycle: 'साइकल 2', retail: 5800, turnover: 42000, consumers: 9 },
      { cycle: 'साइकल 3', retail: 9200, turnover: 88000, consumers: 16 },
      { cycle: 'वर्तमान', retail: 12400, turnover: 145000, consumers: 24 }
    ],
    dsr_counters: {
      farmers_met: 3,
      plans_shown: 1,
      orders_closed: 2400,
      followups_done: 2,
      daily_score: 75,
      last_updated_date: new Date().toISOString().split('T')[0]
    },
    last_synced_at: null
  };

  // -------------------------------------------------------------
  // 2. THEME ENGINE (DARK / LUXURY LIGHT)
  // -------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem('AI_THEME') || 'dark';
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.removeAttribute('data-theme');
    }
    updateThemeButtonUI();
  }

  function updateThemeButtonUI() {
    const isLight = document.body.classList.contains('light-theme');
    const iconEl = document.getElementById('themeToggleIcon');
    const labelEl = document.getElementById('themeToggleLabel');
    if (iconEl) iconEl.textContent = isLight ? '🌞' : '🌓';
    if (labelEl) labelEl.textContent = isLight ? 'Dark Mode' : 'Light Mode';
  }

  // -------------------------------------------------------------
  // 3. STORAGE & PROFILE ENGINE
  // -------------------------------------------------------------
  function loadLocalVault() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VAULT);
      if (stored) {
        vault = Object.assign({}, vault, JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Vault load error:", e);
    }
  }

  function saveLocalVault() {
    try {
      localStorage.setItem(STORAGE_KEY_VAULT, JSON.stringify(vault));
    } catch (e) {
      console.warn("Vault save error:", e);
    }
  }

  function initUserProfile() {
    try {
      const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
      if (u.mobile || u.phone) vault.user_mobile = u.mobile || u.phone;
      if (u.full_name || u.name) vault.distributor_name = u.full_name || u.name;
      if (u.share_id || u.referral_code) vault.share_id = u.share_id || u.referral_code;
    } catch (e) {}

    try {
      const adminConfig = JSON.parse(localStorage.getItem('AI_ADMIN_SMART_ETAILER_CONFIG') || '{}');
      if (adminConfig.official_cycle_end_date && !vault.custom_cycle_end_date) {
        vault.custom_cycle_end_date = adminConfig.official_cycle_end_date.split('T')[0];
      }
      if (adminConfig.announcement_ticker) {
        const tickerEl = document.getElementById('liveAnnouncementTicker');
        if (tickerEl) tickerEl.textContent = adminConfig.announcement_ticker;
      }
      if (adminConfig.page_title) {
        const pageTitleEl = document.getElementById('pageMainHeading');
        if (pageTitleEl) pageTitleEl.textContent = adminConfig.page_title;
      }
    } catch (e) {}

    saveLocalVault();

    const nameEl = document.getElementById('hudDistributorName');
    const mobileEl = document.getElementById('hudDistributorMobile');
    const levelEl = document.getElementById('hudLevelBadge');
    if (nameEl) nameEl.textContent = vault.distributor_name;
    if (mobileEl) mobileEl.textContent = vault.user_mobile ? `📱 ${vault.user_mobile}` : '📱 ID: AI-LEADER';
    if (levelEl) levelEl.textContent = `LEVEL ${vault.level || 1} 🔥`;
  }

  // -------------------------------------------------------------
  // 4. DIAGNOSIS CATALOG & CAREER LADDER
  // -------------------------------------------------------------
  async function loadDiagnosisCatalog() {
    const cacheBucket = Math.floor(Date.now() / 3600000);
    // 1. Diagnosis Catalog
    try {
      let res = await fetch('/data/netsurf-diagnosis-catalog.json?v=' + cacheBucket).catch(() => null);
      if (!res || !res.ok) res = await fetch('../data/netsurf-diagnosis-catalog.json?v=' + cacheBucket).catch(() => null);
      if (!res || !res.ok) res = await fetch('data/netsurf-diagnosis-catalog.json?v=' + cacheBucket).catch(() => null);
      if (res && res.ok) {
        catalogData = await res.json();
      }
    } catch (e) {}

    // 2. Marketing Hooks Seed
    try {
      let mktRes = await fetch('/data/netsurf-marketing-hooks.json?v=' + cacheBucket).catch(() => null);
      if (!mktRes || !mktRes.ok) mktRes = await fetch('../data/netsurf-marketing-hooks.json?v=' + cacheBucket).catch(() => null);
      if (!mktRes || !mktRes.ok) mktRes = await fetch('data/netsurf-marketing-hooks.json?v=' + cacheBucket).catch(() => null);
      if (mktRes && mktRes.ok) {
        const hooks = await mktRes.json();
        if (Array.isArray(hooks) && hooks.length) {
          mktCategories = hooks;
        }
      }
    } catch (e) {}

    // 3. Audio Training Scripts Seed
    try {
      let audRes = await fetch('/data/netsurf-audio-scripts.json?v=' + cacheBucket).catch(() => null);
      if (!audRes || !audRes.ok) audRes = await fetch('../data/netsurf-audio-scripts.json?v=' + cacheBucket).catch(() => null);
      if (!audRes || !audRes.ok) audRes = await fetch('data/netsurf-audio-scripts.json?v=' + cacheBucket).catch(() => null);
      if (audRes && audRes.ok) {
        const auds = await audRes.json();
        if (Array.isArray(auds) && auds.length) {
          publishedAudioLessons = auds;
        }
      }
    } catch (e) {}

    // Check for Admin Custom Catalog Overrides
    try {
      const customCatalog = JSON.parse(localStorage.getItem('AI_ADMIN_CATALOG_OVERRIDE') || 'null');
      if (customCatalog && customCatalog.categories && Array.isArray(customCatalog.categories)) {
        if (!catalogData) catalogData = { categories: [] };
        // Merge or replace categories
        customCatalog.categories.forEach(customCat => {
          const existIdx = catalogData.categories.findIndex(c => c.id === customCat.id);
          if (existIdx >= 0) {
            catalogData.categories[existIdx] = customCat;
          } else {
            catalogData.categories.push(customCat);
          }
        });
      }
    } catch (e) {
      console.warn("Error loading custom catalog override:", e);
    }

    // Check for Admin Marketing Category Overrides
    try {
      const adminMkt = JSON.parse(localStorage.getItem('AI_ADMIN_MARKETING_CATEGORIES') || 'null');
      if (Array.isArray(adminMkt) && adminMkt.length) {
        mktCategories = adminMkt;
      }
    } catch (e) {}

    // Check for Admin Audio Lesson Overrides
    try {
      const adminAud = JSON.parse(localStorage.getItem('AI_ADMIN_AUDIO_LESSONS') || 'null');
      if (Array.isArray(adminAud) && adminAud.length) {
        publishedAudioLessons = adminAud;
      }
    } catch (e) {}

    try {
      let cRes = await fetch('/data/netsurf-career-ladder.json?v=' + cacheBucket).catch(() => null);
      if (!cRes || !cRes.ok) cRes = await fetch('../data/netsurf-career-ladder.json?v=' + cacheBucket).catch(() => null);
      if (!cRes || !cRes.ok) cRes = await fetch('data/netsurf-career-ladder.json?v=' + cacheBucket).catch(() => null);
      if (cRes && cRes.ok) {
        careerLadderData = await cRes.json();
      }
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // 5. TAB SWITCHING ENGINE (100% ROBUST & RELIABLE)
  // -------------------------------------------------------------
  function switchTab(tabId) {
    if (!tabId) return;

    // 1. Update Buttons
    const buttons = document.querySelectorAll('.g-tab-btn, .diary-nav-btn');
    buttons.forEach(b => {
      const bTab = b.getAttribute('data-tab');
      if (bTab === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // 2. Update Tab Panes
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(p => {
      if (p.id === tabId) {
        p.classList.add('active');
        p.style.display = 'block';
      } else {
        p.classList.remove('active');
        p.style.display = 'none';
      }
    });

    // 3. Trigger Sub-Views
    if (tabId === 'tab-survey') {
      renderSurveyCategories();
    } else if (tabId === 'tab-khata') {
      renderKhataLedger();
    } else if (tabId === 'tab-autoship') {
      renderAutoshipTracker();
    } else if (tabId === 'tab-dsr') {
      renderDsrCounters();
      renderGrowthAnalyticsChart();
      renderTargetReverseCalculator();
    } else if (tabId === 'tab-success-path') {
      renderCareerLadderAndSuccessPath();
    } else if (tabId === 'tab-training') {
      renderTrainingHub();
    }
  }

  // -------------------------------------------------------------
  // 6. DUAL CLOSING COUNTDOWN ENGINE
  // -------------------------------------------------------------
  function initDualTimers() {
    updateClosingTimers();
    setInterval(updateClosingTimers, 1000);
  }

  function updateClosingTimers() {
    const now = new Date();

    // A. Weekly Friday Closing
    const nextFriday = new Date(now);
    const dayOfWeek = now.getDay();
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0 && now.getHours() >= 23 && now.getMinutes() >= 59) {
      daysUntilFriday = 7;
    }
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(23, 59, 59, 999);

    const diffFri = Math.max(0, nextFriday - now);
    const friDays = Math.floor(diffFri / (1000 * 60 * 60 * 24));
    const friHours = Math.floor((diffFri % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const friMins = Math.floor((diffFri % (1000 * 60 * 60)) / (1000 * 60));
    const friSecs = Math.floor((diffFri % (1000 * 60)) / 1000);

    const friTimerEl = document.getElementById('fridayCountdownDisplay');
    if (friTimerEl) {
      friTimerEl.textContent = `${friDays}d : ${String(friHours).padStart(2, '0')}h : ${String(friMins).padStart(2, '0')}m : ${String(friSecs).padStart(2, '0')}s`;
    }

    // B. 15-Day Mega Cycle Countdown
    let cycleEndDate;
    if (vault.custom_cycle_end_date) {
      cycleEndDate = new Date(vault.custom_cycle_end_date + 'T23:59:59');
    } else {
      const isFirstHalf = now.getDate() <= 15;
      cycleEndDate = new Date(now.getFullYear(), now.getMonth(), isFirstHalf ? 15 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), 23, 59, 59);
    }

    const diffCycle = Math.max(0, cycleEndDate - now);
    const cycDays = Math.floor(diffCycle / (1000 * 60 * 60 * 24));
    const cycHours = Math.floor((diffCycle % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const cycMins = Math.floor((diffCycle % (1000 * 60)) / (1000 * 60));
    const cycSecs = Math.floor((diffCycle % (1000 * 60)) / 1000);

    const cycTimerEl = document.getElementById('megaCycleCountdownDisplay');
    if (cycTimerEl) {
      cycTimerEl.textContent = `${cycDays}d : ${String(cycHours).padStart(2, '0')}h : ${String(cycMins).padStart(2, '0')}m : ${String(cycSecs).padStart(2, '0')}s`;
    }
  }

  // -------------------------------------------------------------
  // 7. RENDER ALL VIEWS
  // -------------------------------------------------------------
  function renderAllViews() {
    renderClosingStats();
    renderSurveyCategories();
    renderMarketingModule();
    renderKhataLedger();
    renderAutoshipTracker();
    renderDsrCounters();
    renderTodoList();
    renderCareerLadderAndSuccessPath();
    renderTrainingHub();
  }

  function renderClosingStats() {
    const friTotal = vault.friday_retail_total || 0;
    const fortTotal = vault.fortnight_turnover || 0;

    const friTotalEl = document.getElementById('fridayRetailTotalVal');
    const fortTotalEl = document.getElementById('fortnightTurnoverVal');
    if (friTotalEl) friTotalEl.textContent = `₹${friTotal.toLocaleString('en-IN')}`;
    if (fortTotalEl) fortTotalEl.textContent = `₹${fortTotal.toLocaleString('en-IN')}`;

    const friBarEl = document.getElementById('fridayProgressBar');
    if (friBarEl) {
      const progressPercent = Math.min(100, Math.round((friTotal / 8000) * 100));
      friBarEl.style.width = `${Math.max(5, progressPercent)}%`;
    }

    const fortBarEl = document.getElementById('megaCycleProgressBar');
    if (fortBarEl) {
      const capPercent = Math.min(100, (fortTotal / 819250) * 100);
      fortBarEl.style.width = `${Math.max(3, capPercent)}%`;
    }
  }

  // -------------------------------------------------------------
  // 8. TAB 1: SURVEY & SOLUTION DIAGNOSIS
  // -------------------------------------------------------------
  function renderSurveyCategories() {
    const wrap = document.getElementById('surveyCategoryList');
    if (!wrap || !catalogData || !catalogData.categories) return;

    wrap.innerHTML = catalogData.categories.map(c => `
      <button 
        type="button" 
        class="cat-pick-btn ${c.id === activeCategory ? 'selected' : ''}" 
        data-cat="${c.id}"
        onclick="window.AarogyamETailer.selectCategory('${c.id}')"
      >
        <div style="font-size:1.6rem;margin-bottom:4px;">${c.icon || '🌱'}</div>
        <div style="font-weight:800;">${c.badge || c.name}</div>
      </button>
    `).join('');

    renderCategoryProblems();
  }

  function renderCategoryProblems(searchQuery) {
    const listWrap = document.getElementById('surveyProblemList');
    if (!listWrap || !catalogData) return;

    let problemsToRender = [];
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      (catalogData.categories || []).forEach(cat => {
        (cat.problems || []).forEach(p => {
          if (
            (p.title && p.title.toLowerCase().includes(q)) ||
            (p.symptoms && p.symptoms.toLowerCase().includes(q)) ||
            ((p.products || []).join(' ').toLowerCase().includes(q))
          ) {
            problemsToRender.push(p);
          }
        });
      });
    } else {
      const currentCat = (catalogData.categories || []).find(c => c.id === activeCategory);
      if (currentCat && currentCat.problems) {
        problemsToRender = currentCat.problems;
      }
    }

    if (!problemsToRender || problemsToRender.length === 0) {
      listWrap.innerHTML = '<div style="color:var(--text-muted);padding:14px;text-align:center;background:var(--bg-card-inner);border-radius:10px;">🔍 कोई समस्या या लक्षण नहीं मिला। कृपया पुनः खोजें।</div>';
      return;
    }

    listWrap.innerHTML = problemsToRender.map(p => `
      <div 
        class="prob-pick-item ${selectedProblem && selectedProblem.id === p.id ? 'selected' : ''}"
        onclick="window.AarogyamETailer.selectProblem('${p.id}')"
      >
        <div>
          <h4 style="font-size:0.92rem;font-weight:800;margin:0;">${p.title}</h4>
          <p style="font-size:0.75rem;color:var(--text-muted);margin-top:3px;">${p.symptoms || (p.products ? p.products.join(' + ') : '')}</p>
        </div>
        <span style="font-size:1.2rem;color:#38bdf8;flex-shrink:0;">👉</span>
      </div>
    `).join('');

    renderDiagnosisResult();
  }

  function renderDiagnosisResult() {
    const resBox = document.getElementById('surveyDiagnosisResultBox');
    if (!resBox) return;

    if (!selectedProblem) {
      resBox.style.display = 'none';
      return;
    }

    resBox.style.display = 'block';
    resBox.innerHTML = `
      <div style="background:var(--bg-card-inner);border:1.5px solid #10b981;border-radius:12px;padding:14px;margin-top:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="background:rgba(16,185,129,0.2);color:#34d399;font-size:0.72rem;font-weight:800;padding:2px 8px;border-radius:4px;">सटीक कॉम्बो समाधान</span>
          <span style="color:#fbbf24;font-size:0.75rem;font-weight:800;">100% जैविक परिणाम</span>
        </div>
        <h4 style="font-size:1rem;color:var(--text-title);margin:6px 0;">${selectedProblem.title}</h4>
        
        <div style="font-size:0.82rem;color:#e2e8f0;margin:6px 0;">
          <strong>🧪 दिए जाने वाले प्रोडक्ट्स:</strong> ${(selectedProblem.products || []).join(' + ')}
        </div>
        <div style="font-size:0.8rem;color:#cbd5e1;">
          <strong>💧 उपयोग विधि:</strong> ${selectedProblem.dosage || ''}
        </div>
        <div style="font-size:0.8rem;color:#34d399;margin-top:4px;">
          <strong>✨ लाभ:</strong> ${selectedProblem.benefits || ''}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:12px;">
          <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:6px 6px;font-size:0.75rem;justify-content:center;" onclick="window.AarogyamETailer.openAddToKhataModal('${selectedProblem.id}')">
            <span>📖 खाता</span>
          </button>
          <button type="button" class="btn-action-green" style="padding:6px 6px;font-size:0.75rem;justify-content:center;" onclick="window.AarogyamETailer.sendSolutionWhatsApp('${selectedProblem.id}')">
            <span>📲 WhatsApp</span>
          </button>
          <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:6px 6px;font-size:0.75rem;background:#3b82f6;justify-content:center;" onclick="window.AarogyamETailer.sendSolutionNative('${selectedProblem.id}')">
            <span>🌐 अन्य शेयर</span>
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // 8.5 INTEGRATED MARKETING ENGINE (UCAS MERGED WITH ZERO EGRESS)
  // -------------------------------------------------------------
  const CORE_LANDING_PAGES = [
    {
      id: 'kharif_guide',
      title: '🌾 खरीफ मास्टर गाइड 2026',
      category: 'agriculture',
      path: '/ebooks/kharif-master-guide-2026.html',
      badge: 'Bestseller 🔥',
      defaultHook: 'फसल की पैदावार 30% तक बढ़ाएं और कीटनाशक का खर्च आधा करें!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप इस सीजन में अपनी फसल (सोयाबीन/कपास/मक्का/धान) से बंपर उत्पादन लेना चाहते हैं?\n\nआरोग्यम इंडिया की प्रामाणिक "खरीफ मास्टर गाइड 2026" अब उपलब्ध है।\n\n👉 अभी गाइड पढ़ें:\n{link}\n\nसम्पर्क: {my_name}'
    },
    {
      id: 'kheti_dr',
      title: '👨‍⚕️ खेती डॉक्टर — सम्पूर्ण फसल सुरक्षा',
      category: 'agriculture',
      path: '/ebooks/kheti-dr.html',
      badge: 'Biofit Special 🌾',
      defaultHook: 'फसल में लगने वाले हर कीट, इल्ली व रोग का 100% जैविक समाधान!',
      defaultMsg: 'नमस्ते {name} जी,\n\nफसलों में कीट, इल्ली, रस चूसक कीट व पीलापन की समस्या से परेशान हैं? "खेती डॉक्टर" से पाएं जैविक और वैज्ञानिक समाधान।\n\n👉 यहाँ देखें सम्पूर्ण जानकारी:\n{link}\n\nशुभकामनाएं,\n{my_name}'
    },
    {
      id: 'cfc_dairy',
      title: '🐄 CFC Plus — डेयरी पशुधन क्रांति',
      category: 'cattle',
      path: '/pages/smart-etailer.html',
      badge: 'Dairy Booster 🥛',
      defaultHook: 'पशुओं का दूध 15-20% बढ़ाएं और फैट में 1.0 डिग्री तक का सुधार पाएं!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप गाय/भैंस के कम दूध और कम फैट से परेशान हैं? नेटसर्फ CFC Plus से 7 दिनों में दूध व फैट बढ़ाएं।\n\n👉 पूरी रिपोर्ट और खुराक यहाँ देखें:\n{link}\n\nसम्पर्क: {my_name}'
    },
    {
      id: 'health_naturamore',
      title: '💊 नेचुरामोर — सम्पूर्ण स्वास्थ्य व पोषण',
      category: 'health',
      path: '/ebooks/health.html',
      badge: 'Wellness ❤️',
      defaultHook: 'डायबिटीज, बीपी और जोड़ों के दर्द का सुरक्षित व प्राकृतिक समाधान!',
      defaultMsg: 'नमस्ते {name} जी,\n\nस्वस्थ और रोगमुक्त जीवन के लिए नेचुरामोर पोषण और आयुर्वेदिक डाइट चार्ट देखें।\n\n👉 अपनी हेल्थ गाइड अभी पढ़ें:\n{link}\n\nसादर,\n{my_name}'
    },
    {
      id: 'netsurf_opportunity',
      title: '🏢 नेटसर्फ बिज़नेस & ₹8,19,250 प्लान',
      category: 'business',
      path: '/pages/smart-etailer.html',
      badge: 'Income Plan 💎',
      defaultHook: 'हर शुक्रवार 15% रिटेल बोनस व 15 दिन में ₹8,19,250 तक कमाने का अवसर!',
      defaultMsg: 'नमस्ते {name} जी,\n\nस्मार्टफोन से पार्ट-टाइम काम करके हर हफ्ते शुक्रवार को 15% रिटेल बोनस कमाएं। 25 साल पुरानी डायरेक्ट सेलिंग कंपनी के साथ जुड़ें।\n\n👉 पूरी बिज़नेस योजना यहाँ देखें:\n{link}\n\nलीडर: {my_name}'
    }
  ];

  let selectedMktLpId = 'kharif_guide';
  let mktCategories = [
    {
      id: 'agriculture',
      name: '🌾 कृषि एवं फसल सुरक्षा (Agriculture)',
      templates: [
        {
          id: 'ag_01',
          title: 'फसल में कीट, इल्ली व पीलापन का 100% जैविक समाधान',
          hook: '🚨 *क्या आपकी फसल में भी कीट, इल्ली या पीलापन आ रहा है?*\n\nरासायनिक कीटनाशकों का खर्च आधा करें! 100% जैविक समाधान से पाएं 30% अधिक पैदावार। 🌱',
          shayari: '🌾 *मेहनत किसान की, रंग लाएगी हर बार,*\n*आरोग्यम के साथ बनेगी, खुशहाली की सरकार!* ✨',
          cta: '📲 अभी संपूर्ण मार्गदर्शिका देखने के लिए यहाँ क्लिक करें:'
        },
        {
          id: 'ag_02',
          title: 'कम लागत में बंपर पैदावार व जैविक खाद फॉर्मूला',
          hook: '🌾 *कम लागत, ज्यादा मुनाफा! जैविक खाद से बदलें अपनी खेती का भविष्य।*\n\nमिट्टी की उर्वरा शक्ति बढ़ाएं और बिना खतरनाक रसायनों के अपनी फसल का दाना चमकदार बनाएं। 🚜',
          shayari: '🌱 *धरती माता मुस्कुराए जब जैविक खाद डले,*\n*किसान का हर एक सपना खुशहाली से फले!* 🌾',
          cta: '👉 पूरी रिपोर्ट और किसानों के अनुभव देखें:'
        }
      ]
    },
    {
      id: 'cattle',
      name: '🐄 डेयरी व पशुधन (CFC Care)',
      templates: [
        {
          id: 'ct_01',
          title: 'गाय-भैंस का दूध व फैट बढ़ाने का अचूक फॉर्मूला',
          hook: '🐄 *डेयरी किसान भाई ध्यान दें! क्या पशुओं का दूध व फैट घट गया है?*\n\nरोजाना 10g CFC Plus दें और 7 से 10 दिनों में दूध और फैट दोनों में आश्चर्यजनक बढ़ोतरी पाएं। 🥛',
          shayari: '🥛 *दूध-मलाई की बहेगी धार,*\n*CFC Plus से चमकेगा व्यापार!* ✨',
          cta: '👉 खुराक व लाइव टेस्ट रिजल्ट यहाँ देखें:'
        }
      ]
    },
    {
      id: 'health',
      name: '💊 स्वास्थ्य व आयुर्वेद (Naturamore)',
      templates: [
        {
          id: 'hl_01',
          title: 'डायबिटीज, बीपी व जोड़ों के दर्द का सुरक्षित उपाय',
          hook: '🩺 *क्या आप या परिवार में कोई जोड़ों के दर्द, थकान या शुगर से परेशान है?*\n\nप्राचीन भारतीय आयुर्वेद और शुद्ध पोषण से शरीर को डिटॉक्स करें और ऊर्जावान जीवन जिएं। 🌿',
          shayari: '🌿 *आयुर्वेद का संग मिले तो हर बीमारी भागे,*\n*स्वस्थ रहे शरीर तो नया सवेरा जागे!* ☀️',
          cta: '👉 डाइट चार्ट व आयुर्वेदिक नुस्खा यहाँ देखें:'
        }
      ]
    },
    {
      id: 'business',
      name: '💼 रोजगार व नेटसर्फ प्लान (Income & Business)',
      templates: [
        {
          id: 'bs_01',
          title: 'स्मार्टफोन से हर शुक्रवार 15% बोनस व ₹8.19L कैपिंग',
          hook: '💰 *स्मार्टफोन का सही इस्तेमाल करें और हर हफ्ते अतिरिक्त कमाई करें!*\n\nनेटसर्फ डायरेक्ट सेलिंग के साथ जुड़कर 15% शुक्रवार वीकली रिटेल बोनस और 15-दिन में ₹8,19,250 कैपिंग पाएं। 🚀',
          shayari: '🚀 *मंजिलें उन्हीं को मिलती हैं जिनके सपनों में जान होती है,*\n*पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है!* 🌈',
          cta: '👉 फ्री ट्रेनिंग और पूरा प्लान देखने के लिए यहाँ क्लिक करें:'
        }
      ]
    },
    {
      id: 'product',
      name: '🎁 स्पेशल कॉम्बो व ऑफर्स (Special Offers)',
      templates: [
        {
          id: 'pr_01',
          title: 'धमाकेदार ऑफर — Pro-eTailer ₹5,000 / ₹8,000 किट',
          hook: '🎁 *विशेष सीमित समय ऑफर! सीधे घर तक फ्री डिलीवरी!*\n\nPro-eTailer किट पर 30%-40% भारी डिस्काउंट + 6th मंथ फ्री ऑटोशिप उपहार। 📦',
          shayari: '💎 *गुणवत्ता में नंबर वन, कीमत में सबसे खास,*\n*आरोग्यम उत्पाद लाएं, खुशियों का अहसास!* ✨',
          cta: '🛍️ अभी ऑफर प्राइस देखें और ऑर्डर बुक करें:'
        }
      ]
    }
  ];

  function getDynamicReferralUrl(path) {
    const shareId = vault.share_id || (window.getUserShareId ? window.getUserShareId() : 'AI-LEADER');
    const origin = window.location.origin || '';
    const base = path.startsWith('http') ? path : (origin + path);
    try {
      const u = new URL(base, origin || 'http://localhost');
      u.searchParams.set('share_id', shareId);
      u.searchParams.set('ref', shareId);
      if (vault.user_mobile) u.searchParams.set('phone', vault.user_mobile);
      return u.toString();
    } catch (e) {
      return base + `?share_id=${shareId}&ref=${shareId}`;
    }
  }

  function renderMarketingModule() {
    renderMktLandingPages();
    populateMktHookCategoryDropdown();
    updateMktMessagePreview();
    renderMktRecipients('all');
  }

  function renderMktLandingPages() {
    const grid = document.getElementById('mktLandingPagesGrid');
    if (!grid) return;

    let pages = [...CORE_LANDING_PAGES];
    try {
      const customLps = JSON.parse(localStorage.getItem('AI_ADMIN_MARKETING_PAGES') || '[]');
      if (Array.isArray(customLps) && customLps.length) {
        pages = [...customLps, ...pages];
      }
    } catch (e) {}

    grid.innerHTML = pages.map(lp => {
      const isSelected = (lp.id === selectedMktLpId);
      return `
        <div class="mkt-landing-card ${isSelected ? 'active' : ''}" onclick="window.AarogyamETailer.selectMktLandingPage('${lp.id}')">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:0.7rem;background:var(--bg-page);color:#38bdf8;padding:2px 8px;border-radius:6px;font-weight:800;">${lp.badge || 'PRO'}</span>
            ${isSelected ? '<span style="font-size:0.75rem;color:#10b981;font-weight:900;">✅ एक्टिव</span>' : ''}
          </div>
          <strong style="font-size:0.88rem;color:var(--text-title);display:block;margin:2px 0;">${lp.title}</strong>
          <span style="font-size:0.72rem;color:var(--text-muted);display:block;">${lp.defaultHook || ''}</span>
        </div>
      `;
    }).join('');

    const activeBadge = document.getElementById('mktActiveLpBadge');
    const currLp = pages.find(p => p.id === selectedMktLpId) || pages[0];
    if (activeBadge && currLp) {
      activeBadge.textContent = currLp.title;
    }
  }

  function populateMktHookCategoryDropdown() {
    const catSelect = document.getElementById('mktHookCategorySelect');
    if (!catSelect) return;

    try {
      const adminCats = JSON.parse(localStorage.getItem('AI_ADMIN_MARKETING_CATEGORIES') || '[]');
      if (Array.isArray(adminCats) && adminCats.length) {
        mktCategories = adminCats;
      }
    } catch (e) {}

    catSelect.innerHTML = mktCategories.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('');

    if (mktCategories.length > 0) {
      populateMktHookTemplatesDropdown(mktCategories[0].id);
    }
  }

  function populateMktHookTemplatesDropdown(catId) {
    const tmplSelect = document.getElementById('mktHookTemplateSelect');
    if (!tmplSelect) return;

    const cat = mktCategories.find(c => c.id === catId);
    if (!cat || !cat.templates) {
      tmplSelect.innerHTML = '<option value="">कोई टेम्पलेट नहीं</option>';
      return;
    }

    tmplSelect.innerHTML = cat.templates.map(t => `
      <option value="${t.id}">${t.title}</option>
    `).join('');
  }

  function updateMktMessagePreview() {
    const msgBox = document.getElementById('mktMessageBox');
    const linkDisplay = document.getElementById('mktReferralLinkDisplay');
    if (!msgBox) return;

    const pages = [...CORE_LANDING_PAGES];
    const currLp = pages.find(p => p.id === selectedMktLpId) || pages[0];
    const targetUrl = getDynamicReferralUrl(currLp.path);

    if (linkDisplay) {
      linkDisplay.value = targetUrl;
    }

    const catSelect = document.getElementById('mktHookCategorySelect');
    const tmplSelect = document.getElementById('mktHookTemplateSelect');
    const activeCatId = catSelect ? catSelect.value : (mktCategories[0] && mktCategories[0].id);
    const cat = mktCategories.find(c => c.id === activeCatId);
    const activeTmplId = tmplSelect ? tmplSelect.value : (cat && cat.templates && cat.templates[0] && cat.templates[0].id);
    const tmpl = (cat && cat.templates && cat.templates.find(t => t.id === activeTmplId)) || (cat && cat.templates && cat.templates[0]);

    let fullMsg = '';
    const myName = vault.distributor_name || 'स्मार्ट ई-टेलर लीडर';

    if (tmpl) {
      fullMsg = `${tmpl.hook || ''}\n\n${tmpl.shayari || ''}\n\n${tmpl.cta || '👉 यहाँ देखें संपूर्ण विवरण:'}\n${targetUrl}\n\nसादर,\n${myName} (📱 ${vault.user_mobile || ''})`;
    } else {
      fullMsg = (currLp.defaultMsg || '')
        .replace('{name}', 'किसान मित्र')
        .replace('{link}', targetUrl)
        .replace('{my_name}', myName);
    }

    msgBox.value = fullMsg;
  }

  function renderMktRecipients(filterCat) {
    const listWrap = document.getElementById('mktRecipientsList');
    if (!listWrap) return;

    const khataRecs = vault.khata_records || [];
    let contacts = [];

    // Fallback default sample contacts if ledger is empty
    if (khataRecs.length === 0) {
      contacts = [
        { name: 'रामलाल पाटीदार', phone: '9826011223', category: 'agriculture', note: 'कपास व सोयाबीन' },
        { name: 'दिनेश जाट', phone: '9826033445', category: 'cattle', note: '4 गाय, 2 भैंस' },
        { name: 'सुरेश पटेल', phone: '9826055667', category: 'health', note: 'जोड़ों का दर्द' },
        { name: 'मुकेश शर्मा', phone: '9826077889', category: 'netsurf', note: 'बिज़नेस प्रोस्पेक्ट' }
      ];
    } else {
      contacts = khataRecs.map(r => ({
        name: r.customer_name,
        phone: r.mobile,
        category: (r.products_detail || '').toLowerCase().includes('cfc') ? 'cattle' : 'agriculture',
        note: r.products_detail || 'नियमित ग्राहक'
      }));
    }

    if (filterCat && filterCat !== 'all') {
      contacts = contacts.filter(c => c.category === filterCat);
    }

    if (contacts.length === 0) {
      listWrap.innerHTML = `
        <div style="text-align:center;padding:14px;color:var(--text-muted);font-size:0.8rem;">
          कोई कांटेक्ट उपलब्ध नहीं। खाता बुक में एंट्री जोड़ें!
        </div>
      `;
      return;
    }

    listWrap.innerHTML = contacts.map(c => `
      <div class="mkt-recipient-item">
        <div>
          <strong style="color:var(--text-title);font-size:0.86rem;">${c.name}</strong>
          <span style="font-size:0.72rem;color:var(--text-muted);margin-left:6px;">📱 ${c.phone || ''}</span>
          <div style="font-size:0.7rem;color:#38bdf8;">📌 ${c.note}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:4px 8px;font-size:0.72rem;background:#16a34a !important;border:none;" onclick="window.AarogyamETailer.sendMktToIndividual('${c.phone}', \`${(c.name).replace(/`/g, '')}\`)">
            <i class="fa-brands fa-whatsapp"></i> <span>भेजें</span>
          </button>
          ${c.phone ? `
            <a href="tel:${c.phone}" class="btn-royal-blue btn-royal-blue-sm" style="padding:4px 8px;font-size:0.72rem;background:var(--bg-card);border:1px solid var(--border-card);text-decoration:none;color:var(--text-main);">
              <i class="fa-solid fa-phone"></i>
            </a>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // -------------------------------------------------------------
  // 9. TAB 2: KHATA BOOK & CASH/UDHAR LEDGER
  // -------------------------------------------------------------
  function renderKhataLedger() {
    const listWrap = document.getElementById('khataRecordsList');
    const totalSalesEl = document.getElementById('khataTotalSalesVal');
    const totalCashEl = document.getElementById('khataTotalCashVal');
    const totalUdharEl = document.getElementById('khataTotalUdharVal');

    const records = vault.khata_records || [];
    let totSales = 0, totCash = 0, totUdhar = 0;

    records.forEach(r => {
      totSales += (Number(r.bill_amount) || 0);
      totCash += (Number(r.cash_paid) || 0);
      totUdhar += (Number(r.udhar_balance) || 0);
    });

    if (totalSalesEl) totalSalesEl.textContent = `₹${totSales.toLocaleString('en-IN')}`;
    if (totalCashEl) totalCashEl.textContent = `₹${totCash.toLocaleString('en-IN')}`;
    if (totalUdharEl) totalUdharEl.textContent = `₹${totUdhar.toLocaleString('en-IN')}`;

    if (!listWrap) return;

    if (records.length === 0) {
      listWrap.innerHTML = `
        <div style="text-align:center;padding:24px 12px;color:var(--text-muted);background:var(--bg-card);border:1px dashed var(--border-subtle);border-radius:12px;">
          <p style="font-size:0.9rem;margin-bottom:8px;">📖 अभी तक कोई खाता एंट्री दर्ज नहीं है।</p>
          <button type="button" class="btn-royal-blue btn-royal-blue-sm" onclick="window.AarogyamETailer.openManualKhataModal()">
            <span>➕ पहली सेल एंट्री दर्ज करें</span>
          </button>
        </div>
      `;
      return;
    }

    listWrap.innerHTML = records.map((r, idx) => `
      <div style="background:var(--bg-card);border:1px solid var(--border-card);border-radius:10px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <strong style="color:var(--text-title);font-size:0.92rem;">${r.customer_name}</strong>
          <span style="font-size:0.75rem;color:var(--text-muted);margin-left:6px;">📱 ${r.mobile || 'No Phone'}</span>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">📦 ${r.products_detail || 'Netsurf Products'}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="text-align:right;">
            <div style="font-size:0.95rem;font-weight:800;color:var(--text-title);">₹${Number(r.bill_amount).toLocaleString('en-IN')}</div>
            <div style="font-size:0.72rem;color:${r.udhar_balance > 0 ? '#ef4444' : '#10b981'};font-weight:700;">
              ${r.udhar_balance > 0 ? `उधार: ₹${Number(r.udhar_balance).toLocaleString('en-IN')}` : '✅ पूर्ण भुगतान'}
            </div>
          </div>
          <button type="button" style="background:#ef444422;border:1px solid #ef4444;color:#ef4444;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:0.75rem;" onclick="window.AarogyamETailer.deleteKhataEntry(${idx})">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  // -------------------------------------------------------------
  // 10. TAB 3: AUTOSHIP 6TH MONTH RADAR
  // -------------------------------------------------------------
  function renderAutoshipTracker() {
    const listWrap = document.getElementById('autoshipTrackerList');
    if (!listWrap) return;

    const customers = [
      { name: 'रामलाल पाटीदार', phone: '9826011223', currentMonth: 5, avgOrder: 2500, giftFree: 'Stimrich (1L) + Bio99 (500ml)' },
      { name: 'दिनेश जाट', phone: '9826033445', currentMonth: 4, avgOrder: 1800, giftFree: 'CFC Plus (1kg) Combo' },
      { name: 'सुरेश पटेल', phone: '9826055667', currentMonth: 2, avgOrder: 3200, giftFree: 'Naturamore Family Pack' }
    ];

    listWrap.innerHTML = customers.map(c => `
      <div style="background:var(--bg-card);border:1.5px solid ${c.currentMonth >= 5 ? '#f59e0b' : 'var(--border-card)'};border-radius:12px;padding:14px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong style="color:var(--text-title);font-size:0.95rem;">${c.name}</strong>
            <span style="font-size:0.75rem;color:var(--text-muted);margin-left:6px;">📱 ${c.phone}</span>
          </div>
          <span style="background:${c.currentMonth >= 5 ? '#f59e0b' : '#3b82f6'};color:#000;font-weight:900;padding:2px 8px;border-radius:12px;font-size:0.72rem;">
            महीना ${c.currentMonth} / 6
          </span>
        </div>
        <div style="font-size:0.78rem;color:#fde047;margin-top:6px;">
          🎁 6वें महीने का मुफ़्त गिफ्ट: <strong>${c.giftFree}</strong>
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="width:100%;" onclick="window.AarogyamETailer.sendAutoshipAlertWhatsApp('${c.name}', '${c.phone}', ${c.currentMonth}, '${c.giftFree}')">
            <span>📲 किसान को 6th Month Free गिफ्ट अलर्ट भेजें</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  // -------------------------------------------------------------
  // 11. TAB 4: DSR COUNTERS, GOALS & CHARTS
  // -------------------------------------------------------------
  function renderDsrCounters() {
    const dsr = vault.dsr_counters || {};
    const countFarmers = document.getElementById('dsrCountFarmers');
    const countStp = document.getElementById('dsrCountStp');
    const countDemo = document.getElementById('dsrCountDemo');
    const countOrder = document.getElementById('dsrCountOrder');

    if (countFarmers) countFarmers.textContent = dsr.farmers_met || 0;
    if (countStp) countStp.textContent = dsr.plans_shown || 0;
    if (countDemo) countDemo.textContent = dsr.followups_done || 0;
    if (countOrder) countOrder.textContent = `₹${(dsr.orders_closed || 0).toLocaleString('en-IN')}`;
  }

  function renderTodoList() {
    const listWrap = document.getElementById('dsrTodoListContainer');
    if (!listWrap) return;
    const tasks = vault.todo_tasks || [];

    listWrap.innerHTML = tasks.map((t, idx) => `
      <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-card-inner);padding:8px 12px;border-radius:8px;margin-bottom:6px;border:1px solid var(--border-subtle);">
        <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:${t.done ? 'var(--text-muted)' : 'var(--text-main)'};text-decoration:${t.done ? 'line-through' : 'none'};cursor:pointer;">
          <input type="checkbox" ${t.done ? 'checked' : ''} onchange="window.AarogyamETailer.toggleTodoTask(${idx})">
          <span>${t.title}</span>
        </label>
        <button type="button" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.9rem;" onclick="window.AarogyamETailer.deleteTodoTask(${idx})">🗑️</button>
      </div>
    `).join('');
  }

  function renderGrowthAnalyticsChart() {
    const canvas = document.getElementById('growthAnalyticsCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 320;
    const height = canvas.height = 160;

    ctx.clearRect(0, 0, width, height);

    const data = [18000, 42000, 88000, 145000];
    const maxVal = 160000;
    const stepX = (width - 60) / (data.length - 1);

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    data.forEach((val, i) => {
      const x = 30 + i * stepX;
      const y = height - 25 - (val / maxVal) * (height - 50);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Points
    data.forEach((val, i) => {
      const x = 30 + i * stepX;
      const y = height - 25 - (val / maxVal) * (height - 50);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    });
  }

  function renderTargetReverseCalculator() {
    const targetIncome = vault.target_income || 25000;
    const retailNeeded = Math.round(targetIncome * 0.4);
    const matchingNeeded = Math.round((targetIncome * 0.6) / 0.03);
    const consumersNeeded = Math.ceil(retailNeeded / 2000);

    const consumersEl = document.getElementById('calcConsumersNeeded');
    const retailEl = document.getElementById('calcRetailNeeded');
    const matchingEl = document.getElementById('calcMatchingNeeded');

    if (consumersEl) consumersEl.textContent = `${consumersNeeded} किसान`;
    if (retailEl) retailEl.textContent = `₹${retailNeeded.toLocaleString('en-IN')}`;
    if (matchingEl) matchingEl.textContent = `₹${matchingNeeded.toLocaleString('en-IN')}`;
  }

  // -------------------------------------------------------------
  // 12. TAB 5: SUCCESS PATH, DATES & CUSTOM PLANS
  // -------------------------------------------------------------
  function getCareerLadderList() {
    if (careerLadderData && Array.isArray(careerLadderData.career_ladder)) {
      return careerLadderData.career_ladder;
    }
    return [
      { level: 1, id: "rank_pro_etailer", name: "प्रो ई-टेलर (Pro eTailer)", badge: "PRO eTAILER", color: "#38bdf8", target_desc: "₹5,000 की परचेज / ID एक्टिवेशन", reward_xp: 100, perks: "5%-10% रिटेल डिस्काउंट", icon: "🌱" },
      { level: 2, id: "rank_rock_star", name: "रॉक स्टार (Rock Star)", badge: "ROCK STAR", color: "#f59e0b", target_desc: "₹8,000 डायरेक्ट पर्सनल रिटेल टर्नओवर", reward_xp: 250, perks: "🔥 15% शुक्रवार रिटेल कमिशन अनलॉक", icon: "⭐" },
      { level: 3, id: "rank_bc", name: "बिज़नेस कंसलटेंट (BC)", badge: "BC LEADER", color: "#10b981", target_desc: "Team 1: ₹10,000 | Team 2: ₹10,000 मैचिंग", reward_xp: 500, perks: "3% बाइनरी मैचिंग + G1 3%", icon: "💼" },
      { level: 4, id: "rank_sbc", name: "सीनियर BC (SBC)", badge: "SENIOR BC", color: "#8b5cf6", target_desc: "3 महीने में Team 1: ₹1L | Team 2: ₹1L मैचिंग", reward_xp: 1200, perks: "4% मैचिंग + लीडरशिप पिन", icon: "🏆" },
      { level: 5, id: "rank_fastrack", name: "फास्ट ट्रैक अचीवर (Fast Track)", badge: "FAST TRACK", color: "#ec4899", target_desc: "Team 1: ₹3L | Team 2: ₹3L प्रति साइकल", reward_xp: 2500, perks: "5% मैचिंग + रेजिडेंशियल ट्रिप", icon: "🚀" },
      { level: 6, id: "rank_club_elite", name: "क्लब एलीट लीडर (Club Elite)", badge: "CLUB ELITE", color: "#06b6d4", target_desc: "Team 1: ₹15L | Team 2: ₹15L प्रति साइकल", reward_xp: 5000, perks: "5% मैचिंग + कार फंड", icon: "👑" },
      { level: 7, id: "rank_cap_summit", name: "₹8,19,250 15-दिन कैप शिखर", badge: "CAP SUMMIT", color: "#fbbf24", target_desc: "Team 1: ₹81.92L | Team 2: ₹81.92L मैचिंग", reward_xp: 10000, perks: "₹8,19,250 प्रति 15 दिन उच्चतम पे-आउट", icon: "🎖️" },
      { level: 8, id: "rank_crore_legend", name: "₹1 करोड़ लेजेंडरी समिट क्लब", badge: "1 CRORE LEGEND", color: "#e0e7ff", target_desc: "कुल क्युमुलेटिव कमाई ₹1,00,00,000 पार करना", reward_xp: 25000, perks: "हॉल ऑफ़ फेम लेजेंड ट्रॉफी + रॉयल्टी क्लब", icon: "💎" }
    ];
  }

  function renderCareerLadderAndSuccessPath() {
    const list = getCareerLadderList();
    const completedRanks = vault.completed_ranks || ['rank_pro_etailer'];

    // Render Career Nodes
    const nodesContainer = document.getElementById('careerLadderNodesContainer');
    if (nodesContainer) {
      nodesContainer.innerHTML = list.map(r => {
        const isDone = completedRanks.includes(r.id);
        const rankColor = r.color || '#3b82f6';
        return `
          <div class="path-node-card ${isDone ? 'completed' : ''}" data-rank-id="${r.id}" style="--rank-color:${rankColor};">
            <div class="path-node-icon-wrap" style="background:${rankColor}20;border:1.5px solid ${rankColor};color:${rankColor};">${isDone ? '👑' : r.icon}</div>
            <div style="flex:1;">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
                <h4 class="path-node-title" style="font-size:0.96rem;font-weight:900;margin:0;">${r.name}</h4>
                <span class="path-node-status-badge ${isDone ? 'done' : 'target'}">
                  ${isDone ? '✅ अचीव्ड' : '🎯 आगामी लक्ष्य'}
                </span>
              </div>
              <div class="path-node-desc" style="font-size:0.82rem;margin-top:4px;">🎯 ${r.target_desc}</div>
              <div class="path-node-perks" style="font-size:0.8rem;margin-top:2px;">🎁 ${r.perks}</div>
              <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
                <span class="path-node-xp">+${r.reward_xp} XP</span>
                ${!isDone ? `
                  <button type="button" class="btn-royal-blue btn-royal-blue-sm" onclick="window.AarogyamETailer.completeCareerRank('${r.id}', ${r.reward_xp})">
                    <span>✓ पूरा हुआ</span>
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    renderCustomPlansAndOffers();
  }

  function renderCustomPlansAndOffers() {
    const wrap = document.getElementById('userCustomPlansContainer');
    if (!wrap) return;

    let plans = [];
    try {
      plans = JSON.parse(localStorage.getItem('AI_ADMIN_CUSTOM_PLANS') || '[]');
    } catch (e) {}

    if (!plans || !plans.length) {
      plans = [
        {
          id: 'plan_goa_2026',
          title: '🌴 3D/2N गोवा नेशनल लीडरशिप रिट्रीट (Goa Tour)',
          type: 'National Tour & Training',
          matching_target: 300000,
          reward: 'फ्लाइट टिकट + 5-स्टार होटल स्टे + नेशनल लीडरशिप ट्रेनिंग',
          deadline: '2026-10-31',
          description: 'दोनों टीमों (Team 1 & Team 2) से 3-3 लाख रुपये का फ्रेश टर्नओवर मैच करें और गोवा ट्रिप पाएं।'
        },
        {
          id: 'plan_car_club_2026',
          title: '🚗 अचीवर्स कार फंड क्लब (Car Achiever Bonus)',
          type: 'Special Club Offer',
          matching_target: 1500000,
          reward: '₹50,000 एकमुश्त कार डाउनपेमेंट बोनस + क्लब एलिट ट्रॉफी',
          deadline: '2026-12-31',
          description: '15 लाख मैचिंग टर्नओवर प्राप्त करें और कार अचीवर क्लब में शामिल हों।'
        }
      ];
    }

    wrap.innerHTML = plans.map(p => {
      const targetVal = Number(p.matching_target) || 300000;
      const currentTurnover = vault.fortnight_turnover || 0;
      const progressPercent = Math.min(100, Math.round((currentTurnover / targetVal) * 100));

      return `
        <div style="background:var(--bg-card);border:1.5px solid #f59e0b;border-radius:12px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
              <h4 style="color:var(--text-title);font-size:0.92rem;margin:0;font-weight:800;">${p.title}</h4>
              <span style="font-size:0.65rem;background:#3b82f622;color:#60a5fa;border:1px solid #3b82f6;padding:2px 6px;border-radius:4px;white-space:nowrap;">${p.type || 'Offer'}</span>
            </div>
            
            <div style="margin-top:6px;font-size:0.78rem;color:#34d399;font-weight:800;">
              🎯 मैचिंग लक्ष्य: ₹${targetVal.toLocaleString('en-IN')}
            </div>
            <div style="font-size:0.75rem;color:#fde047;margin-top:2px;">
              🎁 रिवॉर्ड: ${p.reward}
            </div>

            <div style="margin-top:8px;">
              <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-muted);margin-bottom:2px;">
                <span>प्रगति (₹${currentTurnover.toLocaleString('en-IN')})</span>
                <span style="color:#fbbf24;font-weight:800;">${progressPercent}%</span>
              </div>
              <div style="background:var(--border-subtle);height:6px;border-radius:4px;overflow:hidden;">
                <div style="background:linear-gradient(90deg, #f59e0b, #10b981);height:100%;width:${progressPercent}%;"></div>
              </div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span style="font-size:0.7rem;color:var(--text-muted);">⏳ ${p.deadline || 'खुली अवधि'}</span>
            <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:3px 8px;font-size:0.72rem;" onclick="window.AarogyamETailer.openIncomeLogModal()">
              <span>+ दर्ज करें</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------------
  // 13. TAB 6: AUDIO TRAINING & LIVE PROGRESS AUDIO PLAYER
  // -------------------------------------------------------------
  function cleanTextForSpeech(text) {
    if (!text) return '';
    return text
      .replace(/[*_#`~>]/g, '')
      .replace(/[\[\]\(\)\{\}]/g, ' ')
      .replace(/[•★✅👉🎧🎙️📌💡🔥🚀⚡💊🌾🐄🥛💰🎯]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getHighConfidenceHindiVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    const naturalHindi = voices.find(v => (v.lang.startsWith('hi') || v.lang === 'hi-IN') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Swara') || v.name.includes('Madhur') || v.name.includes('Neural') || v.name.includes('Female')));
    if (naturalHindi) return naturalHindi;
    const standardHi = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
    if (standardHi) return standardHi;
    return voices.find(v => v.lang === 'en-IN' || v.name.includes('India')) || null;
  }

  function getNextAudioLesson(currentId) {
    let allLessons = (publishedAudioLessons && publishedAudioLessons.length) ? publishedAudioLessons : DEFAULT_AUDIO_LESSONS;
    try {
      const adminLessons = JSON.parse(localStorage.getItem('AI_ADMIN_AUDIO_LESSONS') || '[]');
      if (Array.isArray(adminLessons) && adminLessons.length) allLessons = adminLessons;
    } catch (e) {}
    
    const filteredList = activeAudioCategory === 'all' 
      ? allLessons 
      : allLessons.filter(l => l.category === activeAudioCategory);
    
    if (!filteredList || !filteredList.length) return null;
    const idx = filteredList.findIndex(l => l.id === currentId);
    if (idx !== -1 && idx < filteredList.length - 1) {
      return filteredList[idx + 1];
    }
    return null;
  }

  function getPrevAudioLesson(currentId) {
    let allLessons = (publishedAudioLessons && publishedAudioLessons.length) ? publishedAudioLessons : DEFAULT_AUDIO_LESSONS;
    try {
      const adminLessons = JSON.parse(localStorage.getItem('AI_ADMIN_AUDIO_LESSONS') || '[]');
      if (Array.isArray(adminLessons) && adminLessons.length) allLessons = adminLessons;
    } catch (e) {}
    
    const filteredList = activeAudioCategory === 'all' 
      ? allLessons 
      : allLessons.filter(l => l.category === activeAudioCategory);
    
    if (!filteredList || !filteredList.length) return null;
    const idx = filteredList.findIndex(l => l.id === currentId);
    if (idx > 0) {
      return filteredList[idx - 1];
    }
    return null;
  }

  function autoPlayNextAudio() {
    const nextLesson = getNextAudioLesson(currentPlayingLessonId);
    if (nextLesson) {
      showToast(`⏭️ अगला पाठ: ${nextLesson.title.slice(0, 24)}...`, "info");
      setTimeout(() => {
        window.AarogyamETailer.playAudioWithProgressBar(
          nextLesson.id,
          nextLesson.title,
          nextLesson.speaker || 'आरोग्यम लीडर',
          nextLesson.summary || nextLesson.title,
          nextLesson.audio_url || ''
        );
      }, 1000);
    } else {
      window.AarogyamETailer.stopAllAudio();
      showToast("🎉 सभी पाठ पूरे हुए!", "success");
    }
  }

  function renderTrainingHub(filterCat) {
    const audioWrap = document.getElementById('audioTrainingLessonsList');
    if (!audioWrap) return;

    if (filterCat !== undefined) {
      activeAudioCategory = filterCat;
    }

    let allLessons = (publishedAudioLessons && publishedAudioLessons.length) ? publishedAudioLessons : DEFAULT_AUDIO_LESSONS;
    try {
      const adminLessons = JSON.parse(localStorage.getItem('AI_ADMIN_AUDIO_LESSONS') || '[]');
      if (Array.isArray(adminLessons) && adminLessons.length) {
        allLessons = adminLessons;
      }
    } catch (e) {}

    const categories = [
      { id: 'all', label: `🌟 सभी (${allLessons.length})`, count: allLessons.length },
      { id: 'tutorial', label: `📱 आरोग्यम ट्यूटोरियल्स (${allLessons.filter(l => l.category === 'tutorial').length})`, count: allLessons.filter(l => l.category === 'tutorial').length },
      { id: 'company', label: `🏢 कंपनी प्रोफाइल (${allLessons.filter(l => l.category === 'company').length})`, count: allLessons.filter(l => l.category === 'company').length },
      { id: 'biofit', label: `🌾 कृषि बायोफिट (${allLessons.filter(l => l.category === 'biofit').length})`, count: allLessons.filter(l => l.category === 'biofit').length },
      { id: 'cfc', label: `🐄 पशुपालन (${allLessons.filter(l => l.category === 'cfc').length})`, count: allLessons.filter(l => l.category === 'cfc').length },
      { id: 'naturamore', label: `💊 स्वास्थ्य (${allLessons.filter(l => l.category === 'naturamore').length})`, count: allLessons.filter(l => l.category === 'naturamore').length },
      { id: 'herbs_more', label: `💄 ब्यूटी & स्किन (${allLessons.filter(l => l.category === 'herbs_more').length})`, count: allLessons.filter(l => l.category === 'herbs_more').length }
    ];

    const displayLessons = activeAudioCategory === 'all' 
      ? allLessons 
      : allLessons.filter(l => l.category === activeAudioCategory);

    let playerHtml = `
      <!-- Active Live Audio Player Widget -->
      <div class="audio-player-widget" id="universalAudioPlayerWidget" style="background:linear-gradient(135deg, rgba(30,58,138,0.25), rgba(15,23,42,0.6));border:1.5px solid #3b82f6;border-radius:14px;padding:16px;margin-bottom:16px;box-shadow:0 8px 24px rgba(0,0,0,0.3);">
        <div class="audio-player-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div class="audio-track-title" style="display:flex;align-items:center;gap:8px;">
            <span id="activePlayerTitle" style="font-weight:900;font-size:0.95rem;color:var(--text-title);">🎙️ 1. नेटसर्फ कंपनी प्रोफाइल & 25 साल की विरासत</span>
            <div class="audio-equalizer" id="activePlayerEqualizer">
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
            </div>
          </div>
          <span id="activePlayerSpeaker" style="font-size:0.75rem; color:#38bdf8; font-weight:800;">🎙️ AI मास्टर वॉयस</span>
        </div>

        <!-- Live Progress Track & Interactive Scrubber -->
        <div class="audio-progress-container" onclick="window.AarogyamETailer.seekAudioProgress(event, this)" style="cursor:pointer;padding:6px 0;">
          <div class="audio-progress-track" style="background:rgba(255,255,255,0.15);height:7px;border-radius:4px;overflow:hidden;">
            <div class="audio-progress-fill" id="universalAudioProgressFill" style="background:linear-gradient(90deg, #38bdf8, #3b82f6);height:100%;width: 0%;"></div>
          </div>
        </div>

        <div class="audio-time-row" style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">
          <span id="audioCurrentTimeDisplay">00:00</span>
          <span id="audioTotalDurationDisplay">03:40</span>
        </div>

        <div class="audio-controls-row" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:5px 8px;" onclick="window.AarogyamETailer.playPrevAudio()" title="पिछला ऑडियो">
              <span>⏮️</span>
            </button>
            <button type="button" class="btn-royal-blue btn-royal-blue-sm" id="btnUniversalPlayPause" onclick="window.AarogyamETailer.togglePlayPauseAudio()">
              <span id="universalPlayPauseIcon">▶️ चलाएं</span>
            </button>
            <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:5px 8px;" onclick="window.AarogyamETailer.playNextAudio()" title="अगला ऑडियो">
              <span>⏭️</span>
            </button>
            <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="background:#475569 !important; border:none; padding:5px 8px;" onclick="window.AarogyamETailer.stopAllAudio()" title="स्टॉप">
              <span>⏹️</span>
            </button>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn-action-green" style="padding:5px 10px;font-size:0.75rem;" onclick="window.AarogyamETailer.shareTrainingWhatsApp(audioState.currentTitle, audioState.currentSummary, currentPlayingLessonId)">
              <span>📲 WhatsApp</span>
            </button>
            <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:5px 10px;font-size:0.75rem;background:#3b82f6;" onclick="window.AarogyamETailer.shareTrainingNative(audioState.currentTitle, audioState.currentSummary, currentPlayingLessonId)">
              <span>🌐 शेयर</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:14px;flex-wrap:wrap;">
        ${categories.map(c => `
          <button type="button" onclick="window.AarogyamETailer.filterTrainingHub('${c.id}')" style="background:${activeAudioCategory === c.id ? '#1d4ed8' : 'var(--bg-card)'};color:${activeAudioCategory === c.id ? '#ffffff' : 'var(--text-muted)'};border:1.5px solid ${activeAudioCategory === c.id ? '#1d4ed8' : 'var(--border-subtle)'};padding:6px 12px;border-radius:20px;font-size:0.76rem;font-weight:800;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;">
            ${c.label}
          </button>
        `).join('')}
      </div>

      <div style="font-size:0.88rem; font-weight:800; margin:6px 0 12px 0; color:var(--text-title); display:flex; justify-content:space-between; align-items:center;">
        <span>📚 उपलब्ध ऑडियो लेसन्स (${displayLessons.length}):</span>
        <span style="font-size:0.72rem;color:var(--text-muted);">ऑटो-प्ले प्लेलिस्ट सक्रिय</span>
      </div>
    `;

    audioWrap.innerHTML = playerHtml + (displayLessons.length === 0 ? `
      <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.85rem;">
        इस श्रेणी में कोई ऑडियो नहीं मिला।
      </div>
    ` : displayLessons.map(l => `
      <div class="audio-card-item" style="background:var(--bg-card);border:1.5px solid var(--border-card);border-radius:12px;padding:14px;margin-bottom:12px;transition:all 0.2s ease;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div>
            <h4 style="color:var(--text-title);font-size:0.94rem;margin:0 0 4px 0;font-weight:900;line-height:1.3;">${l.title}</h4>
            <span style="font-size:0.74rem;color:#38bdf8;font-weight:800;background:var(--bg-card-inner);padding:2px 8px;border-radius:6px;display:inline-block;">🎙️ ${l.speaker || 'आरोग्यम लीडर'} • ⏱️ ${l.duration || '3:00 Min'}</span>
          </div>
          <span style="font-size:1.4rem;">🎧</span>
        </div>
        <p style="font-size:0.8rem;color:var(--text-main);margin:10px 0;line-height:1.5;background:var(--bg-card-inner);padding:10px;border-radius:8px;border-left:3px solid #3b82f6;">
          ${l.summary || ''}
        </p>
        
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px;">
          <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:6px 6px;font-size:0.75rem;justify-content:center;" onclick="window.AarogyamETailer.playAudioWithProgressBar('${l.id}', \`${(l.title).replace(/`/g, '\\`')}\`, '${l.speaker || 'ट्रेनर'}', \`${(l.summary || l.title).replace(/`/g, '\\`')}\`, '${l.audio_url || ''}')">
            <span id="play-icon-${l.id}">▶️ सुनें</span>
          </button>
          <button type="button" class="btn-action-green" style="padding:6px 6px;font-size:0.75rem;justify-content:center;" onclick="window.AarogyamETailer.shareTrainingWhatsApp(\`${(l.title).replace(/`/g, '\\`')}\`, \`${(l.summary || '').replace(/`/g, '\\`')}\`, '${l.id}')">
            <span>📲 WhatsApp</span>
          </button>
          <button type="button" class="btn-royal-blue btn-royal-blue-sm" style="padding:6px 6px;font-size:0.75rem;background:#3b82f6;justify-content:center;" onclick="window.AarogyamETailer.shareTrainingNative(\`${(l.title).replace(/`/g, '\\`')}\`, \`${(l.summary || '').replace(/`/g, '\\`')}\`, '${l.id}')">
            <span>🌐 अन्य शेयर</span>
          </button>
        </div>
      </div>
    `).join(''));
  }

  // -------------------------------------------------------------
  // 14. STORAGE & CLOUD SYNC (Midnight Auto-Sync)
  // -------------------------------------------------------------
  function getMsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }

  function setupMidnightAutoSyncSchedule() {
    setTimeout(function runMidnightSync() {
      syncVaultToCloud(true);
      setInterval(() => syncVaultToCloud(true), 24 * 60 * 60 * 1000);
    }, getMsUntilMidnight());
  }

  async function syncVaultToCloud(isSilent) {
    const syncBtn = document.getElementById('hudSyncBtn');
    if (syncBtn) {
      syncBtn.innerHTML = '<span>⏳ सिंक...</span>';
    }

    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const payload = {
          user_mobile: vault.user_mobile || 'AI_GUEST_' + Date.now(),
          distributor_name: vault.distributor_name,
          share_id: vault.share_id,
          current_cycle_id: vault.current_cycle_id,
          friday_retail_total: vault.friday_retail_total,
          fortnight_turnover: vault.fortnight_turnover,
          khata_ledger_json: vault.khata_records,
          dsr_counters_json: vault.dsr_counters,
          last_synced_at: new Date().toISOString()
        };
        await client.from('retail_distributor_vault').upsert([payload], { onConflict: 'user_mobile' });
      }
      vault.last_synced_at = new Date().toISOString();
      saveLocalVault();
      if (!isSilent) showToast("🎉 क्लाउड बैकअप सुरक्षित हो गया!", "success");
    } catch (e) {
      if (!isSilent) showToast("💾 डेटा मोबाइल में सुरक्षित है!", "info");
    } finally {
      if (syncBtn) syncBtn.innerHTML = '<span>⚡ सिंक</span>';
    }
  }

  function showToast(msg, type) {
    let t = document.getElementById('gamingToastNotification');
    if (!t) {
      t = document.createElement('div');
      t.id = 'gamingToastNotification';
      t.style.cssText = 'position:fixed;bottom:25px;left:50%;transform:translateX(-50%);background:#10b981;color:#000;padding:10px 20px;border-radius:25px;font-weight:800;font-size:0.85rem;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,0.5);text-align:center;';
      document.body.appendChild(t);
    }
    t.style.background = (type === 'success') ? '#10b981' : '#3b82f6';
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
  }

  // -------------------------------------------------------------
  // 14.1 SMART DEEP LINK & LEAD CAPTURE ENGINE (ZERO EGRESS)
  // -------------------------------------------------------------
  function getPublicShareBaseUrl() {
    const origin = window.location.origin || '';
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('file:')) {
      return 'https://aarogyam-india.pages.dev/pages/smart-etailer.html';
    }
    return `${origin}${window.location.pathname}`;
  }

  function handleDeepLinkedAudio(audioId) {
    const allLessons = (publishedAudioLessons && publishedAudioLessons.length) ? publishedAudioLessons : DEFAULT_AUDIO_LESSONS;
    const lesson = allLessons.find(l => l.id === audioId) || allLessons[0];
    if (!lesson) return;

    pendingAudioLesson = lesson;
    const modal = document.getElementById('leadCaptureAudioModal');
    const titleEl = document.getElementById('leadModalAudioTitle');
    const spkEl = document.getElementById('leadModalAudioSpeaker');
    const formView = document.getElementById('leadModalFormView');
    const directView = document.getElementById('leadModalDirectPlayView');
    const welcomeEl = document.getElementById('leadModalWelcomeUser');

    if (titleEl) titleEl.textContent = lesson.title;
    if (spkEl) spkEl.textContent = `🎙️ ${lesson.speaker || 'आरोग्यम लीडर'} • ⏱️ ${lesson.duration || '3:00 Min'}`;

    // Check if user is already registered or captured
    const guestInfo = JSON.parse(localStorage.getItem('AI_GUEST_INFO') || 'null');
    const isRegistered = Boolean(vault.user_mobile || (guestInfo && guestInfo.phone));
    const userName = vault.distributor_name || (guestInfo && guestInfo.name) || 'साथी';

    if (isRegistered) {
      if (formView) formView.style.display = 'none';
      if (directView) directView.style.display = 'block';
      if (welcomeEl) welcomeEl.textContent = `🎉 स्वागत है ${userName} जी! ऑडियो सुनने के लिए नीचे टैप करें:`;
    } else {
      if (formView) formView.style.display = 'block';
      if (directView) directView.style.display = 'none';
    }

    if (modal) modal.classList.add('show');
  }

  function startPendingAudioPlay() {
    const modal = document.getElementById('leadCaptureAudioModal');
    if (modal) modal.classList.remove('show');
    if (pendingAudioLesson) {
      window.AarogyamETailer.playAudioWithProgressBar(
        pendingAudioLesson.id,
        pendingAudioLesson.title,
        pendingAudioLesson.speaker || 'आरोग्यम लीडर',
        pendingAudioLesson.summary || pendingAudioLesson.title,
        pendingAudioLesson.audio_url || ''
      );
    }
  }

  async function submitLeadAndPlayAudio(event) {
    if (event) event.preventDefault();
    const nameEl = document.getElementById('leadGuestName');
    const phoneEl = document.getElementById('leadGuestPhone');
    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';

    if (!name || !phone || phone.length < 10) {
      alert("कृपया सही 10 अंकों का व्हाट्सएप नंबर दर्ज करें!");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref') || vault.share_id || 'DIRECT';

    // 1. Save Locally (Zero Latency & Egress-free Instant Unlock)
    const guestData = {
      name: name,
      phone: phone,
      referral_code: refCode,
      captured_at: new Date().toISOString(),
      audio_requested: pendingAudioLesson ? pendingAudioLesson.id : ''
    };
    localStorage.setItem('AI_GUEST_INFO', JSON.stringify(guestData));
    vault.user_mobile = phone;
    vault.distributor_name = name;
    saveLocalVault();

    // 2. Write-Only Zero Egress Sync to Supabase (Non-blocking async)
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        client.from('retail_leads').insert([{
          lead_name: name,
          mobile: phone,
          referral_code: refCode,
          source: 'smart_etailer_audio_deeplink',
          details_json: { audio_id: pendingAudioLesson ? pendingAudioLesson.id : '' },
          created_at: new Date().toISOString()
        }]).then(() => {}).catch(() => {});
      }
    } catch (e) {}

    // 3. Close Modal
    const modal = document.getElementById('leadCaptureAudioModal');
    if (modal) modal.classList.remove('show');
    showToast(`🎉 स्वागत है ${name} जी! ऑडियो शुरू हो रहा है...`, "success");

    // 4. Play Audio Immediately
    if (pendingAudioLesson) {
      window.AarogyamETailer.playAudioWithProgressBar(
        pendingAudioLesson.id,
        pendingAudioLesson.title,
        pendingAudioLesson.speaker || 'आरोग्यम लीडर',
        pendingAudioLesson.summary || pendingAudioLesson.title,
        pendingAudioLesson.audio_url || ''
      );
    }
  }

  // -------------------------------------------------------------
  // 15. PUBLIC GLOBAL CONTROLLER EXPORT
  // -------------------------------------------------------------
  // =============================================================
  // SMART BUSINESS DIARY - ZERO EGRESS ENGINE
  // Dynamic Quotas | Single Form | Cashflow Manager | 1-Tap WhatsApp
  // =============================================================
  let currentEntityType = 'customer';
  let currentTeamStatus = 'prospect';
  let currentNeedCategory = 'कृषि व फसल रोग';
  let currentLedgerFilter = 'all';
  let currentIncomeTarget = Number(localStorage.getItem('AAROGYAM_INCOME_TARGET')) || 25000;

  // Cloud Config (Zero-Egress Cache with Supabase fallback)
  let diaryGlobalConfig = {
    free_limit: 50,
    active_limit: 500,
    paid_mode: 'freemium',
    pro_price: 49,
    download_perm: 'all',
    expense_module: 'enabled',
    wa_action: 'enabled'
  };

  try {
    const savedCfg = localStorage.getItem('SMART_ETAILER_GLOBAL_CONFIG');
    if (savedCfg) diaryGlobalConfig = { ...diaryGlobalConfig, ...JSON.parse(savedCfg) };
  } catch (_) {}

  // Sync Global Quotas in Background once
  try {
    fetch('https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/site_configs?key=eq.SMART_ETAILER_GLOBAL_CONFIG&limit=1', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Accept': 'application/json' }
    }).then(r => r.json()).then(arr => {
      if (Array.isArray(arr) && arr[0] && arr[0].value) {
        const val = typeof arr[0].value === 'string' ? JSON.parse(arr[0].value) : arr[0].value;
        diaryGlobalConfig = { ...diaryGlobalConfig, ...val };
        localStorage.setItem('SMART_ETAILER_GLOBAL_CONFIG', JSON.stringify(diaryGlobalConfig));
        updateDiaryHeroLevel();
      }
    }).catch(() => {});
  } catch (_) {}

  function getLocalDiaryEntries() {
    try {
      return JSON.parse(localStorage.getItem('AAROGYAM_SMART_DIARY_ENTRIES') || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveLocalDiaryEntries(entries) {
    localStorage.setItem('AAROGYAM_SMART_DIARY_ENTRIES', JSON.stringify(entries));
    updateDiaryHeroLevel();
    renderDiaryLedger();
    renderDiaryFollowups();
  }

  function getLocalCashflow() {
    try {
      return JSON.parse(localStorage.getItem('AAROGYAM_SMART_CASHFLOW') || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveLocalCashflow(cf) {
    localStorage.setItem('AAROGYAM_SMART_CASHFLOW', JSON.stringify(cf));
    renderCashflowSummary();
  }

  // Check Quota Limit (No Hardcoded Numbers)
  function checkDiaryQuota() {
    const entries = getLocalDiaryEntries();
    const limit = Number(diaryGlobalConfig.free_limit) || 50;
    const mode = diaryGlobalConfig.paid_mode || 'freemium';

    if (mode === 'freemium' && entries.length >= limit) {
      const price = diaryGlobalConfig.pro_price ? `₹${diaryGlobalConfig.pro_price}` : 'प्रो अपग्रेड';
      alert(`⚠️ आपकी ${limit} मुफ़्त प्रविष्टियों की सीमा पूरी हो चुकी है!\n\nअसीमित डायरी, क्लाउड बैकअप व PDF डाउनलोड हेतु ${price} में प्रो एक्टिवेट करें या एडमिन से संपर्क करें।`);
      return false;
    }
    return true;
  }

  // ====================================================================
  // AAROGYAM 8-LEVEL GAMIFIED FIELD PROGRESSION ENGINE
  // ====================================================================
  const DIARY_LEVELS = [
    { level: 1, name: 'शुरुआत', icon: '🥉', minPts: 0, maxPts: 50, hint: 'फील्ड में कदम रखा! पहले 5 किसान या साथी जोड़ें।' },
    { level: 2, name: 'फील्ड साथी', icon: '🥈', minPts: 51, maxPts: 150, hint: 'नियमित फील्ड विजिट व फॉलो-अप शुरू करें।' },
    { level: 3, name: 'एक्टिव प्रमोटर', icon: '🥇', minPts: 151, maxPts: 300, hint: 'मजबूत ग्राहक आधार बनाएं और WhatsApp फॉलो-अप करें।' },
    { level: 4, name: 'स्टार डिस्ट्रीब्यूटर', icon: '💎', minPts: 301, maxPts: 500, hint: 'उधारी वसूली व नियमित डायरी प्रविष्टियों से टीम विस्तार।' },
    { level: 5, name: 'सिल्वर लीडर', icon: '👑', minPts: 501, maxPts: 800, hint: 'फील्ड लीडरशिप व खाता नियंत्रण में महारत हासिल।' },
    { level: 6, name: 'गोल्ड मास्टर', icon: '🏆', minPts: 801, maxPts: 1200, hint: 'हाई-टर्नओवर व एक्टिव टीम मेंटॉरिंग चैंपियन।' },
    { level: 7, name: 'डायमंड मेंटर', icon: '🌟', minPts: 1201, maxPts: 2000, hint: 'बड़े नेटवर्क का कुशल संचालन व डिजिटल ट्रेनिंग।' },
    { level: 8, name: 'क्राउन लीजेंड', icon: '🔱', minPts: 2001, maxPts: 999999, hint: 'सर्वोच्च आरोग्यम लीजेंड! आपका फील्ड रिकॉर्ड प्रेरणादायक है।' }
  ];

  function calculateDiaryPoints() {
    const entries = getLocalDiaryEntries();
    const cashflows = getLocalCashflow();
    let pts = 0;
    entries.forEach(e => {
      if (e.type === 'customer') pts += 10;
      else pts += 15;
      if (e.followup_done) pts += 5;
    });
    pts += (cashflows.length * 5);
    return pts;
  }

  function getDiaryLevelInfo(points) {
    for (let i = DIARY_LEVELS.length - 1; i >= 0; i--) {
      if (points >= DIARY_LEVELS[i].minPts) {
        const cur = DIARY_LEVELS[i];
        const next = DIARY_LEVELS[i + 1] || null;
        const ptsInLevel = points - cur.minPts;
        const totalNeededInLevel = next ? (next.minPts - cur.minPts) : 100;
        const pct = next ? Math.min(100, Math.round((ptsInLevel / totalNeededInLevel) * 100)) : 100;
        const remaining = next ? Math.max(0, next.minPts - points) : 0;
        return {
          current: cur,
          next: next,
          points: points,
          pct: pct,
          remaining: remaining
        };
      }
    }
    return {
      current: DIARY_LEVELS[0],
      next: DIARY_LEVELS[1],
      points: points,
      pct: 0,
      remaining: 51
    };
  }

  function updateDiaryHeroLevel() {
    const pts = calculateDiaryPoints();
    const info = getDiaryLevelInfo(pts);
    const entries = getLocalDiaryEntries();
    const count = entries.length;

    const bar = document.getElementById('diaryHeroProgressBar');
    const rankEl = document.getElementById('diaryHeroRankBadge');
    const badgeEl = document.getElementById('diaryQuotaCounterBadge');
    const hintEl = document.getElementById('diaryHeroNextRankHint');
    const userEl = document.getElementById('diaryHeroUserName');
    const ptsEl = document.getElementById('diaryPointsMeter');
    const tipEl = document.getElementById('diaryHeroActionTip');

    // Get user name from session
    try {
      const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
      if (u.name && userEl) userEl.textContent = '👤 ' + u.name;
    } catch (_) {}

    if (bar) bar.style.width = Math.max(8, info.pct) + '%';
    if (rankEl) rankEl.innerHTML = `${info.current.icon} लेवल ${info.current.level}: ${info.current.name}`;
    if (ptsEl) ptsEl.innerHTML = `⚡ <strong>${pts}</strong> अंक ${info.next ? `(अगला लक्ष्य: ${info.next.minPts})` : '🏆'}`;
    
    if (hintEl) {
      if (info.next) {
        hintEl.innerHTML = `🎯 अगले स्तर (लेवल ${info.next.level}: ${info.next.name}) हेतु <strong>${info.remaining} अंक शेष!</strong>`;
      } else {
        hintEl.innerHTML = `🎉 बधाई! आप सर्वोच्च ${info.current.name} स्तर पर हैं!`;
      }
    }

    if (tipEl && info.next) {
      const kisanNeeded = Math.ceil(info.remaining / 10);
      const fuNeeded = Math.ceil(info.remaining / 5);
      tipEl.innerHTML = `👉 <strong>${kisanNeeded}</strong> किसान जोड़ें (+10 अंक) या <strong>${fuNeeded}</strong> फॉलो-अप पूर्ण करें (+5 अंक)!`;
    }

    const limit = Number(diaryGlobalConfig.free_limit) || 50;
    if (badgeEl) {
      badgeEl.textContent = `कुल प्रविष्टियां: ${count}/${limit}`;
      badgeEl.style.color = count >= limit ? '#f87171' : '#94a3b8';
    }
  }

  function openLevelRoadmapModal() {
    let modal = document.getElementById('diaryLevelRoadmapModal');
    if (!modal) return;
    modal.classList.add('active');
    modal.style.display = 'flex';
  }

  function closeLevelRoadmapModal() {
    let modal = document.getElementById('diaryLevelRoadmapModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }

  function switchTutorialVideo(url, btn) {
    const iframe = document.getElementById('tutorialVideoIframe');
    if (iframe && url) {
      iframe.src = url;
    }
    if (btn) {
      document.querySelectorAll('.btn-tutorial-video-tab').forEach(b => {
        b.style.background = '#1e293b';
        b.style.borderColor = '#334155';
        b.style.color = '#cbd5e1';
      });
      btn.style.background = '#2563eb';
      btn.style.borderColor = '#60a5fa';
      btn.style.color = '#ffffff';
    }
  }

    // Toggle Entity Type
  function setEntityType(type) {
    currentEntityType = type;
    const btnCust = document.getElementById('btnEntityCustomer');
    const btnTeam = document.getElementById('btnEntityTeam');
    const teamWrap = document.getElementById('diaryTeamStatusWrap');

    if (type === 'team') {
      if (btnCust) btnCust.classList.remove('active');
      if (btnTeam) btnTeam.classList.add('active');
      if (teamWrap) teamWrap.style.display = 'block';
    } else {
      if (btnCust) btnCust.classList.add('active');
      if (btnTeam) btnTeam.classList.remove('active');
      if (teamWrap) teamWrap.style.display = 'none';
    }
  }

  // Toggle Team Status
  function setTeamStatus(st) {
    currentTeamStatus = st;
    document.querySelectorAll('.status-pills-grid .status-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-status') === st) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Toggle Need Category
  function setNeedCategory(need) {
    currentNeedCategory = need;
    document.querySelectorAll('#diaryNeedPillsWrap .status-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-need') === need) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Form Submit Handler
  async function handleDiaryFormSubmit(e) {
    e.preventDefault();
    if (!checkDiaryQuota()) return;

    const name = (document.getElementById('diaryInputName')?.value || '').trim();
    const mobile = (document.getElementById('diaryInputMobile')?.value || '').trim().replace(/\\D/g, '');
    const place = (document.getElementById('diaryInputPlace')?.value || '').trim();
    const amt = Number(document.getElementById('diaryInputAmount')?.value) || 0;
    const khataType = document.getElementById('diaryInputKhataType')?.value || 'none';

    if (!name || mobile.length < 10) {
      alert('कृपया वैध नाम और 10 अंकों का मोबाइल नंबर दर्ज करें!');
      return;
    }

    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: name,
      mobile: mobile,
      place: place || 'स्थानीय',
      type: currentEntityType,
      team_status: currentEntityType === 'team' ? currentTeamStatus : null,
      need: currentNeedCategory,
      due_amount: khataType === 'give' ? amt : (khataType === 'got' ? -amt : 0),
      khata_type: khataType,
      created_at: new Date().toISOString(),
      followup_done: false
    };

    const entries = getLocalDiaryEntries();
    entries.unshift(newEntry);
    saveLocalDiaryEntries(entries);

    // Asynchronously push to Supabase phonebook without blocking UI
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        client.from('phonebook').insert([{
          name: name,
          mobile: mobile,
          place: place || 'स्थानीय',
          source: 'smart_diary'
        }]).then(() => {}).catch(() => {});
      }
    } catch (_) {}

    showToast(`🎉 ${name} जी की डायरी एंट्री सुरक्षित हो गई!`, 'success');

    // Reset Form
    document.getElementById('diaryInputName').value = '';
    document.getElementById('diaryInputMobile').value = '';
    document.getElementById('diaryInputPlace').value = '';
    document.getElementById('diaryInputAmount').value = '';
    document.getElementById('diaryInputKhataType').value = 'none';

    // Switch to Ledger view to see the entry
    switchTab('tab-diary-ledger');
  }

  // Render Ledger
  function renderDiaryLedger() {
    const listEl = document.getElementById('diaryLedgerCardsList');
    const mContacts = document.getElementById('ledgerMetricContacts');
    const mFollowups = document.getElementById('ledgerMetricFollowups');
    const mDues = document.getElementById('ledgerMetricPendingDues');
    if (!listEl) return;

    const entries = getLocalDiaryEntries();
    let totalDues = 0;
    let pendingFollowups = 0;

    entries.forEach(e => {
      if (e.due_amount > 0) totalDues += e.due_amount;
      if (!e.followup_done) pendingFollowups += 1;
    });

    if (mContacts) mContacts.textContent = entries.length;
    if (mFollowups) mFollowups.textContent = pendingFollowups;
    if (mDues) mDues.textContent = '₹' + totalDues.toLocaleString('hi-IN');

    const searchQ = (document.getElementById('ledgerSearchInput')?.value || '').toLowerCase().trim();

    const filtered = entries.filter(e => {
      if (currentLedgerFilter === 'customer' && e.type !== 'customer') return false;
      if (currentLedgerFilter === 'team' && e.type !== 'team') return false;
      if (currentLedgerFilter === 'dues' && e.due_amount <= 0) return false;

      if (searchQ) {
        const str = `${e.name} ${e.mobile} ${e.place} ${e.need}`.toLowerCase();
        return str.includes(searchQ);
      }
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:32px 14px; background:#0f172a; border-radius:12px; border:1px solid #1e293b; color:#94a3b8;">
          <div style="font-size:2rem; margin-bottom:8px;">📖</div>
          <div style="font-weight:700; color:#cbd5e1; font-size:0.95rem;">कोई प्रविष्टि नहीं मिली</div>
          <p style="font-size:0.75rem; margin:4px 0 14px 0;">पहले टैब से अपनी पहली ग्राहक या टीम एंट्री जोड़ें।</p>
          <button type="button" class="admin-btn admin-btn-primary" style="padding:8px 16px; font-weight:800; font-size:0.80rem;" onclick="window.AarogyamETailer.switchTab('tab-diary-entry')">
            ✍️ नई एंट्री जोड़ें
          </button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(e => {
      const isTeam = e.type === 'team';
      const statusBadge = isTeam
        ? `<span style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); padding:2px 8px; border-radius:12px; font-size:0.70rem; font-weight:800;">🤝 टीम: ${e.team_status || 'साथी'}</span>`
        : `<span style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:2px 8px; border-radius:12px; font-size:0.70rem; font-weight:800;">🌾 ग्राहक / किसान</span>`;

      let duesBadge = '';
      if (e.due_amount > 0) {
        duesBadge = `<span style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); padding:2px 8px; border-radius:12px; font-size:0.72rem; font-weight:900;">🔴 ₹${e.due_amount} बाकी</span>`;
      } else if (e.due_amount < 0) {
        duesBadge = `<span style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); padding:2px 8px; border-radius:12px; font-size:0.72rem; font-weight:900;">🟢 जमा ₹${Math.abs(e.due_amount)}</span>`;
      }

      const waMsg = encodeURIComponent(`नमस्ते ${e.name} जी! 🙏 आरोग्यम इंडिया से संपर्क किया गया है। आपकी (${e.need}) के संबंध में उचित मार्गदर्शन और समाधान उपलब्ध है।`);
      const waUrl = `https://wa.me/91${e.mobile}?text=${waMsg}`;

      return `
        <div style="background:#0f172a; border:1.5px solid #1e293b; border-radius:12px; padding:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong style="font-size:0.95rem; color:#f8fafc;">${e.name}</strong>
              ${statusBadge}
              ${duesBadge}
            </div>
            <div style="font-size:0.76rem; color:#94a3b8; margin-top:4px;">
              📍 ${e.place || 'स्थानीय'} • 📱 ${e.mobile} • 💡 ${e.need}
            </div>
          </div>
          <div style="display:flex; gap:6px;">
            <a href="tel:${e.mobile}" class="btn-action-call" title="कॉल करें">📞 कॉल</a>
            <a href="${waUrl}" target="_blank" class="btn-action-wa" title="WhatsApp भेजें">💬 WA</a>
            <button type="button" class="admin-btn admin-btn-secondary" style="padding:6px 10px; color:#ef4444; border-color:#475569; font-size:0.72rem;" onclick="window.AarogyamETailer.deleteDiaryEntry('${e.id}')" title="हटाएं">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function setLedgerFilter(filter) {
    currentLedgerFilter = filter;
    document.querySelectorAll('[data-filter]').forEach(b => {
      if (b.getAttribute('data-filter') === filter) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    renderDiaryLedger();
  }

  function filterLedgerEntries() {
    renderDiaryLedger();
  }

  function deleteDiaryEntry(id) {
    if (!confirm('क्या आप वाकई इस डायरी प्रविष्टि को हटाना चाहते हैं?')) return;
    let entries = getLocalDiaryEntries().filter(e => e.id !== id);
    saveLocalDiaryEntries(entries);
    showToast('प्रविष्टि हटा दी गई!', 'info');
  }

  // Follow-up Hub State & Filtering
  let currentFollowupFilter = 'all';

  function setFollowupFilter(filter) {
    currentFollowupFilter = filter;
    
    // Update active filter pill UI
    const pills = document.querySelectorAll('.followup-filter-chip');
    pills.forEach(pill => {
      const onclickAttr = pill.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${filter}'`)) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    renderDiaryFollowups();
  }

  function renderDiaryFollowups() {
    const wrap = document.getElementById('diaryFollowupList');
    if (!wrap) return;

    let entries = getLocalDiaryEntries();
    if (!entries || entries.length === 0) {
      wrap.innerHTML = '<div style="text-align:center; padding:25px; color:#94a3b8; font-size:0.85rem;">📭 कोई फॉलो-अप प्रविष्टि उपलब्ध नहीं है। ऊपर "सरल एंट्री" से किसान या साथी जोड़ें!</div>';
      return;
    }

    // Apply Filter
    if (currentFollowupFilter === 'customer') {
      entries = entries.filter(e => e.type === 'customer');
    } else if (currentFollowupFilter === 'prospect') {
      entries = entries.filter(e => e.type === 'team' && (e.team_status === 'prospect' || !e.team_status));
    } else if (currentFollowupFilter === 'joined') {
      entries = entries.filter(e => e.type === 'team' && e.team_status === 'joined');
    } else if (currentFollowupFilter === 'active') {
      entries = entries.filter(e => e.type === 'team' && e.team_status === 'active');
    } else if (currentFollowupFilter === 'core') {
      entries = entries.filter(e => e.type === 'team' && e.team_status === 'core');
    } else if (currentFollowupFilter === 'dues') {
      entries = entries.filter(e => Number(e.due_amount) > 0);
    }

    if (entries.length === 0) {
      wrap.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8; font-size:0.85rem;">इस श्रेणी में फिलहाल कोई सक्रिय फॉलो-अप नहीं है।</div>';
      return;
    }

    wrap.innerHTML = entries.map(e => {
      const isDone = !!e.followup_done;
      const dueAmt = Number(e.due_amount) || 0;
      
      // Determine badge
      let typeBadge = '';
      if (e.type === 'customer') {
        typeBadge = '<span style="background:#064e3b; color:#34d399; font-size:0.70rem; padding:2px 7px; border-radius:6px; font-weight:800;">🌾 किसान ग्राहक</span>';
      } else {
        const statusMap = {
          prospect: '1️⃣ नया प्रोस्पेक्ट',
          joined: '2️⃣ नया जॉइन हुआ',
          active: '3️⃣ सक्रिय साथी',
          core: '4️⃣ कोर लीडर'
        };
        typeBadge = `<span style="background:#1e3a8a; color:#93c5fd; font-size:0.70rem; padding:2px 7px; border-radius:6px; font-weight:800;">${statusMap[e.team_status] || '👥 टीम साथी'}</span>`;
      }

      // WhatsApp Message based on context
      let customMsg = `नमस्ते ${e.name} जी! 🙏 आरोग्यम इंडिया से संपर्क किया गया है।`;
      if (dueAmt > 0) {
        customMsg = `नमस्ते ${e.name} जी! 🙏 आरोग्यम से आपका हिसाब: आपके खाते में ₹${dueAmt} की उधारी शेष है। कृपया समय पर चुकता करें। धन्यवाद!`;
      } else if (e.type === 'customer') {
        customMsg = `नमस्ते ${e.name} जी! 🌱 आपकी फसल व जैविक उपचार (${e.need || 'आरोग्यम उत्पाद'}) के संबंध में आपसे बात करनी थी। क्या आप अभी उपलब्ध हैं?`;
      } else if (e.team_status === 'prospect') {
        customMsg = `नमस्ते ${e.name} जी! 🚀 आरोग्यम बिजनेस मॉडल और जैविक खेती से आर्थिक प्रगति के बारे में बात करने हेतु संपर्क किया है।`;
      } else if (e.team_status === 'joined') {
        customMsg = `नमस्ते ${e.name} जी! 🌟 आरोग्यम टीम में आपका स्वागत है। अगले चरण और फील्ड ऑर्डर की योजना हेतु कॉल करें।`;
      }

      const waUrl = `https://wa.me/91${e.mobile}?text=${encodeURIComponent(customMsg)}`;

      return `
        <div class="followup-item-card" style="background:${isDone ? '#091322' : '#0f172a'}; border:1px solid ${isDone ? '#10b981' : '#1e3a8a'};">
          <div style="flex:1; min-width:200px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="font-weight:900; font-size:0.95rem; color:#ffffff;">${e.name}</span>
              ${typeBadge}
              ${dueAmt > 0 ? `<span class="badge-udhar">उधारी: ₹${dueAmt}</span>` : ''}
              ${isDone ? '<span style="background:#065f46; color:#a7f3d0; font-size:0.68rem; padding:2px 6px; border-radius:4px; font-weight:800;">✔️ संपर्क हुआ</span>' : ''}
            </div>
            <div style="font-size:0.78rem; color:#cbd5e1;">
              📍 <strong>${e.place || 'क्षेत्र दर्ज नहीं'}</strong> • 📱 <span style="color:#38bdf8; font-weight:700;">${e.mobile}</span>
              ${e.need ? ` • 🎯 विषय: <span style="color:#fde047;">${e.need}</span>` : ''}
            </div>
          </div>
          <div class="followup-action-btn-group" style="margin-top:6px;">
            <a href="tel:${e.mobile}" class="btn-action-call">📞 कॉल</a>
            <a href="${waUrl}" target="_blank" class="btn-action-wa">💬 WhatsApp</a>
            <button type="button" class="btn-action-call" style="background:${isDone ? '#065f46' : '#334155'}; color:#ffffff;" onclick="window.AarogyamETailer.markFollowupDone('${e.id}')">
              ${isDone ? '🔄 री-ओपन' : '✅ पूर्ण'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function markFollowupDone(id) {
    let entries = getLocalDiaryEntries();
    entries.forEach(e => {
      if (e.id === id) {
        e.followup_done = !e.followup_done;
      }
    });
    saveLocalDiaryEntries(entries);
    renderDiaryFollowups();
    updateDiaryHeroLevel();
    renderGrowthProjection();
    showToast('फॉलो-अप स्थिति अपडेट हुई! 🎯 (+10 पॉइंट्स)', 'success');
  }

  // Growth & Closing Projection Engine
  function renderGrowthProjection() {
    const box = document.getElementById('diaryGrowthProjectionBox');
    if (!box) return;

    const entries = getLocalDiaryEntries();
    let custCount = 0;
    let prospectCount = 0;
    let joinedCount = 0;
    let activeCount = 0;
    let totalDues = 0;

    entries.forEach(e => {
      totalDues += (Number(e.due_amount) || 0);
      if (e.type === 'customer') {
        custCount++;
      } else {
        if (e.team_status === 'prospect' || !e.team_status) prospectCount++;
        else if (e.team_status === 'joined') joinedCount++;
        else if (e.team_status === 'active' || e.team_status === 'core') activeCount++;
      }
    });

    const retailPotential = custCount * 600; // Average retail profit per customer order
    const teamBonusPotential = (prospectCount * 300) + (joinedCount * 800) + (activeCount * 1500);
    const totalPotential = retailPotential + teamBonusPotential;

    box.innerHTML = `
      <div class="growth-projection-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #1e3a8a; padding-bottom:8px;">
          <div>
            <div style="font-weight:900; font-size:0.95rem; color:#60a5fa; display:flex; align-items:center; gap:6px;">
              <span>🚀 आपकी डायरी से संभावित कमाई व ग्रोथ (AI Projection)</span>
            </div>
            <div style="font-size:0.74rem; color:#cbd5e1; margin-top:2px;">
              आपके दर्ज किए गए ${entries.length} संपर्कों के आधार पर क्लोजिंग कैलकुलेशन:
            </div>
          </div>
          <span style="background:#2563eb; color:#ffffff; font-size:0.72rem; padding:4px 9px; border-radius:12px; font-weight:800;">
            CEO डैशबोर्ड
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:12px;">
          <div style="background:#0b1120; border:1px solid #1e3a8a; border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:0.72rem; color:#cbd5e1; font-weight:700;">🌾 किसान रिटेल लाभ</div>
            <div style="font-size:1.05rem; font-weight:900; color:#34d399; margin-top:2px;">+₹${retailPotential.toLocaleString('en-IN')}</div>
            <div style="font-size:0.68rem; color:#60a5fa;">${custCount} किसान ग्राहक</div>
          </div>
          <div style="background:#0b1120; border:1px solid #1e3a8a; border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:0.72rem; color:#cbd5e1; font-weight:700;">👥 टीम लीडरशिप बोनस</div>
            <div style="font-size:1.05rem; font-weight:900; color:#38bdf8; margin-top:2px;">+₹${teamBonusPotential.toLocaleString('en-IN')}</div>
            <div style="font-size:0.68rem; color:#60a5fa;">${prospectCount + joinedCount + activeCount} टीम साथी</div>
          </div>
          <div style="background:#0b1120; border:1px solid #1e3a8a; border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:0.72rem; color:#cbd5e1; font-weight:700;">🔴 उधारी वसूली लक्ष्य</div>
            <div style="font-size:1.05rem; font-weight:900; color:#f87171; margin-top:2px;">₹${totalDues.toLocaleString('en-IN')}</div>
            <div style="font-size:0.68rem; color:#fca5a5;">खाता बुक बकाया</div>
          </div>
        </div>

        <div style="background:rgba(37, 99, 235, 0.15); border:1px solid #2563eb; border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:800; font-size:0.86rem; color:#ffffff;">🎯 कुल संभावित फील्ड ग्रोथ कमाई:</div>
            <div style="font-size:0.72rem; color:#93c5fd;">इन सभी संपर्कों को फॉलो-अप कर क्लोज करने पर संभावित शुद्ध मुनाफा</div>
          </div>
          <div style="font-size:1.25rem; font-weight:900; color:#fde047;">
            ₹${totalPotential.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    `;
  }

    // Report Download (Permissions-aware)
  function downloadDiaryReport() {
    const perm = diaryGlobalConfig.download_perm || 'all';
    const entries = getLocalDiaryEntries();

    if (entries.length === 0) {
      alert('डाउनलोड हेतु डायरी में कम से कम 1 प्रविष्टि होना आवश्यक है!');
      return;
    }

    // Generate CSV content
    let csv = 'नाम,मोबाइल,गाँव,श्रेणी,स्थिति,बकाया राशि,तारीख\n';
    entries.forEach(e => {
      csv += `"${e.name}","${e.mobile}","${e.place}","${e.need}","${e.type}","${e.due_amount}","${new Date(e.created_at).toLocaleDateString('hi-IN')}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `आरोग्यम_स्मार्ट_डायरी_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('🎉 डायरी रिपोर्ट सफलतापूर्वक डाउनलोड हो गई!', 'success');
  }

  // Income Target Calculator
  function setIncomeTarget(target) {
    currentIncomeTarget = Number(target) || 25000;
    localStorage.setItem('AAROGYAM_INCOME_TARGET', String(currentIncomeTarget));
    document.querySelectorAll('.goal-target-chip').forEach(c => {
      if (Number(c.getAttribute('data-target')) === currentIncomeTarget) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
    renderIncomeTarget();
  }

  function renderIncomeTarget() {
    const card = document.getElementById('goalResultCard');
    if (!card) return;

    let dailyFarmers = 2;
    let weeklyTeam = 3;
    let dailyNet = Math.round(currentIncomeTarget / 30);

    if (currentIncomeTarget <= 10000) {
      dailyFarmers = 1;
      weeklyTeam = 1;
    } else if (currentIncomeTarget >= 50000) {
      dailyFarmers = 4;
      weeklyTeam = 5;
    }

    card.innerHTML = `
      <div style="font-size:0.85rem; font-weight:900; color:#38bdf8; margin-bottom:8px;">
        🎯 ₹${currentIncomeTarget.toLocaleString('hi-IN')}/माह हेतु आपका दैनिक एक्शन प्लान:
      </div>
      <div style="font-size:0.80rem; color:#e2e8f0; line-height:1.6;">
        <div>🌾 <strong>प्रतिदिन 1-2 किसानों</strong> को फसल सुरक्षा या पशु आहार का डेमो दें।</div>
        <div>🤝 <strong>हफ्ते में ${weeklyTeam} नए साथियों</strong> को आरोग्यम बिज़नेस मॉडल शेयर करें।</div>
        <div style="margin-top:6px; color:#34d399; font-weight:800;">
          💵 दैनिक शुद्ध इन-हैंड बचत लक्ष्य: <strong>₹${dailyNet} / दिन</strong>
        </div>
      </div>
    `;
  }

  // Pocket Cashflow Manager
  function handleCashflowSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('cashflowType')?.value || 'expense_good';
    const amt = Number(document.getElementById('cashflowAmount')?.value) || 0;
    const note = (document.getElementById('cashflowNote')?.value || '').trim();

    if (amt <= 0) {
      alert('कृपया वैध राशि दर्ज करें!');
      return;
    }

    const item = {
      id: 'cf_' + Date.now(),
      type: type,
      amount: amt,
      note: note || (type === 'income' ? 'दैनिक बिक्री कमाई' : (type === 'expense_good' ? 'पेट्रोल / फील्ड भोजन' : 'अनावश्यक / फालतू खर्च')),
      timestamp: new Date().toISOString()
    };

    const list = getLocalCashflow();
    list.unshift(item);
    saveLocalCashflow(list);

    showToast('खर्च / आय सफलतापूर्वक दर्ज हुई!', 'success');
    document.getElementById('cashflowAmount').value = '';
    document.getElementById('cashflowNote').value = '';
  }

  function renderCashflowSummary() {
    const list = getLocalCashflow();
    let totalIn = 0;
    let totalGoodExp = 0;
    let totalBadExp = 0;

    list.forEach(c => {
      if (c.type === 'income') totalIn += c.amount;
      else if (c.type === 'expense_good') totalGoodExp += c.amount;
      else if (c.type === 'expense_bad') totalBadExp += c.amount;
    });

    const netSavings = totalIn - (totalGoodExp + totalBadExp);

    const histWrap = document.getElementById('cashflowHistoryList');
    if (!histWrap) return;

    histWrap.innerHTML = `
      <div style="background:#0b1120; border:1px solid #1e293b; border-radius:10px; padding:12px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; font-size:0.80rem; margin-bottom:4px;">
          <span style="color:#34d399; font-weight:700;">🟢 कुल कमाई: +₹${totalIn}</span>
          <span style="color:#f87171; font-weight:700;">🔴 ज़रूरी खर्च: -₹${totalGoodExp}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.80rem; margin-bottom:6px;">
          <span style="color:#fbbf24; font-weight:700;">⚠️ फालतू खर्च: -₹${totalBadExp}</span>
          <span style="color:#38bdf8; font-weight:900;">💵 शुद्ध बचत: ₹${netSavings}</span>
        </div>
      </div>
      <div style="font-size:0.75rem; color:#94a3b8; font-weight:800; margin-bottom:6px;">हालिया लेन-देन:</div>
      ${list.slice(0, 6).map(c => {
        const isInc = c.type === 'income';
        const isBad = c.type === 'expense_bad';
        const color = isInc ? '#34d399' : (isBad ? '#f87171' : '#cbd5e1');
        const sign = isInc ? '+' : '-';
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #1e293b; font-size:0.76rem;">
            <span style="color:#e2e8f0;">${escapeHtml(c.note)}</span>
            <strong style="color:${color};">${sign}₹${c.amount}</strong>
          </div>
        `;
      }).join('')}
    `;
  }

  function toggleExpenseCategories() {}

  function toggleLegacyTools() {
    const wrap = document.getElementById('legacyToolsWrap');
    if (wrap) {
      const isHidden = wrap.style.display === 'none';
      wrap.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        wrap.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }


  window.AarogyamETailer = {
    setFollowupFilter: setFollowupFilter,
    renderDiaryFollowups: renderDiaryFollowups,
    renderGrowthProjection: renderGrowthProjection,
    // Smart Business Diary API
    setEntityType: setEntityType,
    setTeamStatus: setTeamStatus,
    setNeedCategory: setNeedCategory,
    handleDiaryFormSubmit: handleDiaryFormSubmit,
    setLedgerFilter: setLedgerFilter,
    filterLedgerEntries: filterLedgerEntries,
    deleteDiaryEntry: deleteDiaryEntry,
    downloadDiaryReport: downloadDiaryReport,
    setIncomeTarget: setIncomeTarget,
    handleCashflowSubmit: handleCashflowSubmit,
    toggleExpenseCategories: toggleExpenseCategories,
    toggleLegacyTools: toggleLegacyTools,
    markFollowupDone: markFollowupDone,

    switchTab: switchTab,
    
    toggleTheme: function () {
      const isLight = document.body.classList.contains('light-theme');
      const nextTheme = isLight ? 'dark' : 'light';
      localStorage.setItem('AI_THEME', nextTheme);
      applyTheme(nextTheme);
      showToast(nextTheme === 'light' ? '🌞 लाइट मोड सक्रिय!' : '🌙 डार्क मोड सक्रिय!', 'success');
    },

    selectCategory: function (catId) {
      activeCategory = catId;
      selectedProblem = null;
      renderSurveyCategories();
    },

    selectProblem: function (probId) {
      const currentCat = (catalogData && catalogData.categories || []).find(c => c.id === activeCategory);
      if (currentCat && currentCat.problems) {
        selectedProblem = currentCat.problems.find(p => p.id === probId);
      }
      renderCategoryProblems();
    },

    sendSolutionWhatsApp: function (probId) {
      if (!selectedProblem) return;
      let msg = selectedProblem.whatsapp_msg || '';
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    },

    openAddToKhataModal: function (probId) {
      const modal = document.getElementById('addKhataModal');
      if (modal) modal.classList.add('show');
    },

    openManualKhataModal: function () {
      const modal = document.getElementById('addKhataModal');
      if (modal) modal.classList.add('show');
    },

    closeKhataModal: function () {
      const modal = document.getElementById('addKhataModal');
      if (modal) modal.classList.remove('show');
    },

    saveKhataEntry: function (e) {
      e.preventDefault();
      const name = document.getElementById('khataModalName').value.trim();
      const phone = document.getElementById('khataModalPhone').value.trim();
      const prods = document.getElementById('khataModalProducts').value.trim();
      const bill = Number(document.getElementById('khataModalBill').value) || 0;
      const cash = Number(document.getElementById('khataModalCash').value) || 0;
      const udhar = Math.max(0, bill - cash);

      if (!name || bill <= 0) {
        alert("कृपया ग्राहक का नाम और बिल राशि दर्ज करें।");
        return;
      }

      if (!vault.khata_records) vault.khata_records = [];
      vault.khata_records.unshift({
        id: 'kh_' + Date.now(),
        customer_name: name,
        mobile: phone,
        products_detail: prods,
        bill_amount: bill,
        cash_paid: cash,
        udhar_balance: udhar,
        date: new Date().toISOString().split('T')[0]
      });

      vault.friday_retail_total = (vault.friday_retail_total || 0) + bill;
      vault.fortnight_turnover = (vault.fortnight_turnover || 0) + bill;
      saveLocalVault();

      window.AarogyamETailer.closeKhataModal();
      renderAllViews();
      showToast("🎉 खाता एंट्री दर्ज हो गई!", "success");
      document.getElementById('khataEntryForm').reset();
    },

    deleteKhataEntry: function (idx) {
      if (confirm("क्या आप वाकई इस प्रविष्टि को हटाना चाहते हैं?")) {
        vault.khata_records.splice(idx, 1);
        saveLocalVault();
        renderKhataLedger();
        renderClosingStats();
      }
    },

    openIncomeLogModal: function () {
      const modal = document.getElementById('addIncomeLogModal');
      if (modal) modal.classList.add('show');
    },

    closeIncomeLogModal: function () {
      const modal = document.getElementById('addIncomeLogModal');
      if (modal) modal.classList.remove('show');
    },

    saveIncomeLogEntry: function (e) {
      e.preventDefault();
      const cycleName = document.getElementById('incomeLogCycleName').value.trim();
      const total = Number(document.getElementById('incomeLogTotal').value) || 0;

      if (!cycleName || total <= 0) {
        alert("कृपया विवरण और राशि दर्ज करें।");
        return;
      }

      vault.xp = (vault.xp || 0) + 50;
      vault.fortnight_turnover = (vault.fortnight_turnover || 0) + total;
      saveLocalVault();

      window.AarogyamETailer.closeIncomeLogModal();
      renderAllViews();
      showToast("🎉 कमाई दर्ज हुई!", "success");
      document.getElementById('incomeLogForm').reset();
    },

    openTutorialModal: function () {
      const modal = document.getElementById('smartETailerTutorialModal');
      if (modal) {
        try {
          const tut = JSON.parse(localStorage.getItem('AI_ADMIN_TUTORIAL_CONFIG') || '{}');
          if (tut.video_url) {
            const iframe = document.getElementById('tutorialVideoIframe');
            if (iframe) iframe.src = tut.video_url;
          }
          if (tut.steps && Array.isArray(tut.steps) && tut.steps.length) {
            const guideBox = modal.querySelector('#tutorialModalContent ol');
            if (guideBox) {
              guideBox.innerHTML = tut.steps.map(s => `<li style="margin-bottom:6px;">${s}</li>`).join('');
            }
          }
        } catch (e) {}
        modal.classList.add('show');
      }
    },

    closeTutorialModal: function () {
      const modal = document.getElementById('smartETailerTutorialModal');
      if (modal) modal.classList.remove('show');
    },

    completeCareerRank: function (rankId, rewardXp) {
      if (!vault.completed_ranks) vault.completed_ranks = [];
      if (!vault.completed_ranks.includes(rankId)) {
        vault.completed_ranks.push(rankId);
        vault.xp = (vault.xp || 0) + (rewardXp || 200);
        saveLocalVault();
        renderCareerLadderAndSuccessPath();
        showToast(`🏆 मुकाम पूरा हुआ! +${rewardXp} XP मिला!`, "success");
      }
    },

    // ---------------------------------------------------------
    // REAL-TIME AUDIO CONTROLLER WITH LIVE PROGRESS BAR & SEEK
    // ---------------------------------------------------------
    playAudioWithProgressBar: function (id, title, speaker, text, audioUrl) {
      window.AarogyamETailer.stopAllAudio();
      currentPlayingLessonId = id;
      audioState.currentTitle = title || 'ऑडियो लेसन';
      audioState.currentSpeaker = speaker || 'आरोग्यम ट्रेनर';
      audioState.currentTime = 0;
      
      const cleanedText = cleanTextForSpeech(text || title || '');
      // Estimate duration based on Hindi word count (approx 2.2 words per sec for steady confidence)
      const wordCount = cleanedText.split(/\s+/).length;
      audioState.totalDuration = Math.max(25, Math.round(wordCount / 2.2));
      audioState.isPlaying = true;
      audioState.isPaused = false;

      // Update UI elements
      const titleEl = document.getElementById('activePlayerTitle');
      const spkEl = document.getElementById('activePlayerSpeaker');
      const eqEl = document.getElementById('activePlayerEqualizer');
      const iconEl = document.getElementById('universalPlayPauseIcon');
      const totalDurEl = document.getElementById('audioTotalDurationDisplay');
      
      if (titleEl) titleEl.textContent = `🎙️ ${audioState.currentTitle}`;
      if (spkEl) spkEl.textContent = `🎙️ ${audioState.currentSpeaker}`;
      if (eqEl) eqEl.classList.add('playing');
      if (iconEl) iconEl.textContent = '⏸️ पॉज़ करें';
      if (totalDurEl) {
        const mins = Math.floor(audioState.totalDuration / 60);
        const secs = audioState.totalDuration % 60;
        totalDurEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      // Background MediaSession API Integration (Lock screen & Notification bar playback widget)
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: audioState.currentTitle,
            artist: audioState.currentSpeaker,
            album: 'आरोग्यम स्मार्ट ई-टेलर 2026',
            artwork: [
              { src: '/images/aarogyam-logo.png', sizes: '96x96', type: 'image/png' },
              { src: '/images/aarogyam-logo.png', sizes: '192x192', type: 'image/png' },
              { src: '/images/aarogyam-logo.png', sizes: '512x512', type: 'image/png' }
            ]
          });
          navigator.mediaSession.playbackState = 'playing';

          navigator.mediaSession.setActionHandler('play', () => {
            window.AarogyamETailer.togglePlayPauseAudio();
          });
          navigator.mediaSession.setActionHandler('pause', () => {
            window.AarogyamETailer.togglePlayPauseAudio();
          });
          navigator.mediaSession.setActionHandler('stop', () => {
            window.AarogyamETailer.stopAllAudio();
          });
          navigator.mediaSession.setActionHandler('nexttrack', () => {
            window.AarogyamETailer.playNextAudio();
          });
          navigator.mediaSession.setActionHandler('previoustrack', () => {
            window.AarogyamETailer.playPrevAudio();
          });
          navigator.mediaSession.setActionHandler('seekbackward', () => {
            audioState.currentTime = Math.max(0, audioState.currentTime - 10);
            window.AarogyamETailer.updateAudioProgressUI();
          });
          navigator.mediaSession.setActionHandler('seekforward', () => {
            audioState.currentTime = Math.min(audioState.totalDuration, audioState.currentTime + 10);
            window.AarogyamETailer.updateAudioProgressUI();
          });
        } catch (e) {}
      }

      // If audio file URL is available, play via Audio element
      if (audioUrl && audioUrl.startsWith('http')) {
        audioPlayer.src = audioUrl;
        audioPlayer.loop = false;
        audioPlayer.play().catch(() => {});
        audioPlayer.ontimeupdate = () => {
          if (audioPlayer.duration) {
            audioState.currentTime = Math.round(audioPlayer.currentTime);
            audioState.totalDuration = Math.round(audioPlayer.duration);
            window.AarogyamETailer.updateAudioProgressUI();
          }
        };
        audioPlayer.onended = () => {
          autoPlayNextAudio();
        };
      } else if ('speechSynthesis' in window && cleanedText) {
        // Continuous Background Audio Keep-Alive Channel (Locks audio session so OS does not sleep when screen locked)
        try {
          audioPlayer.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
          audioPlayer.loop = true;
          audioPlayer.volume = 0.01;
          audioPlayer.play().catch(() => {});
        } catch (e) {}

        // High-Confidence Natural Hindi Speech Synthesis
        const u = new SpeechSynthesisUtterance(cleanedText);
        u.lang = 'hi-IN';
        u.rate = 0.95; // Steady and assertive leadership tempo
        u.pitch = 1.0; // Firm pitch to eliminate voice tremor/jitter
        
        const hiVoice = getHighConfidenceHindiVoice();
        if (hiVoice) u.voice = hiVoice;

        u.onend = () => {
          autoPlayNextAudio();
        };

        u.onerror = (err) => {
          console.warn("Audio speech playback notice:", err);
          window.AarogyamETailer.stopAllAudio();
        };

        audioState.speechUtterance = u;
        window.speechSynthesis.speak(u);

        // Progress bar tick interval (every 250ms)
        if (audioState.timerInterval) clearInterval(audioState.timerInterval);
        audioState.timerInterval = setInterval(() => {
          if (audioState.isPlaying && !audioState.isPaused) {
            audioState.currentTime += 0.25;
            if (audioState.currentTime >= audioState.totalDuration) {
              audioState.currentTime = audioState.totalDuration;
            }
            window.AarogyamETailer.updateAudioProgressUI();
          }
        }, 250);
      }

      showToast(`🔊 '${audioState.currentTitle}' शुरू हुआ!`, "info");
    },

    updateAudioProgressUI: function () {
      const fillEl = document.getElementById('universalAudioProgressFill');
      const curTimeEl = document.getElementById('audioCurrentTimeDisplay');
      
      const pct = Math.min(100, (audioState.currentTime / Math.max(1, audioState.totalDuration)) * 100);
      if (fillEl) fillEl.style.width = `${pct}%`;
      
      if (curTimeEl) {
        const curSec = Math.floor(audioState.currentTime);
        const mins = Math.floor(curSec / 60);
        const secs = curSec % 60;
        curTimeEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    },

    togglePlayPauseAudio: function () {
      if (!audioState.isPlaying) {
        // Start Master audio if none is playing
        window.AarogyamETailer.playTutorialMasterAudio();
        return;
      }

      const iconEl = document.getElementById('universalPlayPauseIcon');
      const eqEl = document.getElementById('activePlayerEqualizer');

      if (audioState.isPaused) {
        // Resume
        if ('speechSynthesis' in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else if (audioPlayer.src) {
          audioPlayer.play();
        }
        audioState.isPaused = false;
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
        if (iconEl) iconEl.textContent = '⏸️ पॉज़ करें';
        if (eqEl) eqEl.classList.add('playing');
        showToast("▶️ ऑडियो पुनः शुरू", "info");
      } else {
        // Pause
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
        } else if (audioPlayer.src) {
          audioPlayer.pause();
        }
        audioState.isPaused = true;
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
        if (iconEl) iconEl.textContent = '▶️ चलाएं';
        if (eqEl) eqEl.classList.remove('playing');
        showToast("⏸️ ऑडियो पॉज़ किया गया", "info");
      }
    },

    seekAudioProgress: function (event, containerEl) {
      if (!audioState.isPlaying) return;
      const rect = containerEl.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      audioState.currentTime = pct * audioState.totalDuration;
      window.AarogyamETailer.updateAudioProgressUI();
      showToast(`⏱️ समय: ${Math.round(pct * 100)}% पर सेट`, "info");
    },

    stopAllAudio: function () {
      audioState.isPlaying = false;
      audioState.isPaused = false;
      audioState.currentTime = 0;
      if (audioState.timerInterval) {
        clearInterval(audioState.timerInterval);
        audioState.timerInterval = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.loop = false;
        audioPlayer.currentTime = 0;
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      const fillEl = document.getElementById('universalAudioProgressFill');
      const curTimeEl = document.getElementById('audioCurrentTimeDisplay');
      const iconEl = document.getElementById('universalPlayPauseIcon');
      const eqEl = document.getElementById('activePlayerEqualizer');
      
      if (fillEl) fillEl.style.width = '0%';
      if (curTimeEl) curTimeEl.textContent = '00:00';
      if (iconEl) iconEl.textContent = '▶️ चलाएं';
      if (eqEl) eqEl.classList.remove('playing');
    },

    toggleAudioLesson: function (id, url, summary) {
      window.AarogyamETailer.playAudioWithProgressBar(id, 'ट्रेनिंग लेसन', 'आरोग्यम लीडर', summary, url);
    },

    playTutorialMasterAudio: function () {
      const text = "नमस्ते ई-टेलर साथियों! स्मार्ट ई-टेलर आपके मोबाइल का सबसे बड़ा बिजनेस टूल है। सबसे पहले टैब 1 में 'कंज्यूमर सर्वे' है, जहां आप 30 सेकंड में किसी भी किसान या ग्राहक की समस्या चुनकर 1-क्लिक में WhatsApp नुस्खा भेज सकते हैं। टैब 2 में 'खाता बुक' है, जहां आप जो भी नकद या उधार सेल दर्ज करते हैं, वह सीधे आपके शुक्रवार के 15% रिटेल बोनस में जुड़ जाती है। टैब 3 में 'ऑटोशिप 6th मंथ रडार' है, जिससे आप 5 महीने प्रोडक्ट लेने वाले ग्राहक को 6वें महीने फ्री गिफ्ट देकर पक्का ग्राहक बना सकते हैं। टैब 4 में 'DSR' है जहां रोज 5 किसानों से मिलकर आप ₹8,19,250 कैप की ओर बढ़ते हैं। और टैब 5 में आपको अपनी ₹1 करोड़ कमाने की अनुमानित तारीख दिखती है!";
      window.AarogyamETailer.playAudioWithProgressBar('master_tut', 'मास्टर ई-टेलर वॉकथ्रू', 'मास्टर ट्रेनर', text, '');
    },

    playCustomAudio: function (lessonId) {
      let lessons = (publishedAudioLessons && publishedAudioLessons.length) ? publishedAudioLessons : ((catalogData && catalogData.audio_training_lessons) || []);
      try {
        const adminLessons = JSON.parse(localStorage.getItem('AI_ADMIN_AUDIO_LESSONS') || '[]');
        if (Array.isArray(adminLessons) && adminLessons.length) {
          lessons = adminLessons;
        }
      } catch (e) {}

      const found = lessons.find(l => l.id === lessonId);
      if (found && (found.summary || found.title)) {
        window.AarogyamETailer.playAudioWithProgressBar(lessonId, found.title, found.speaker || 'ट्रेनर', found.summary || found.title, found.audio_url || '');
      } else {
        showToast("⚠️ ऑडियो लोड हो रहा है...", "info");
      }
    },

    // ---------------------------------------------------------
    // GOOGLE VOICE / SPEECH-TO-TEXT (बोलकर डेटा टाइप करें)
    // ---------------------------------------------------------
    startVoiceInput: function (targetInputId, micButtonId) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("⚠️ आपके ब्राउज़र में Google Voice Typing (Speech Recognition) सपोर्ट उपलब्ध नहीं है। कृपया Chrome/Edge का उपयोग करें।");
        return;
      }

      const inputEl = document.getElementById(targetInputId);
      const btnEl = micButtonId ? document.getElementById(micButtonId) : null;
      if (!inputEl) return;

      if (isVoiceRecording && voiceRecognition) {
        voiceRecognition.stop();
        isVoiceRecording = false;
        if (btnEl) btnEl.classList.remove('listening');
        showToast("🛑 माइक बंद हुआ", "info");
        return;
      }

      try {
        voiceRecognition = new SpeechRecognition();
        voiceRecognition.lang = 'hi-IN'; // Default Hindi (also recognizes mixed Hinglish/English)
        voiceRecognition.continuous = false;
        voiceRecognition.interimResults = false;

        if (btnEl) btnEl.classList.add('listening');
        isVoiceRecording = true;
        showToast("🎙️ बोलिए... (हिंदी/English में)", "success");

        voiceRecognition.onresult = function (event) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            if (inputEl.value) {
              inputEl.value = inputEl.value + ' ' + transcript;
            } else {
              inputEl.value = transcript;
            }
            showToast(`✅ टाइप हुआ: "${transcript}"`, "success");
          }
        };

        voiceRecognition.onerror = function (event) {
          console.warn("Voice input error:", event.error);
          isVoiceRecording = false;
          if (btnEl) btnEl.classList.remove('listening');
          showToast("⚠️ आवाज़ स्पष्ट नहीं थी, पुनः बोलें", "info");
        };

        voiceRecognition.onend = function () {
          isVoiceRecording = false;
          if (btnEl) btnEl.classList.remove('listening');
        };

        voiceRecognition.start();
      } catch (err) {
        console.error("SpeechRecognition start error:", err);
        isVoiceRecording = false;
        if (btnEl) btnEl.classList.remove('listening');
      }
    },

    playNextAudio: function () {
      autoPlayNextAudio();
    },

    playPrevAudio: function () {
      const prevLesson = getPrevAudioLesson(currentPlayingLessonId);
      if (prevLesson) {
        window.AarogyamETailer.playAudioWithProgressBar(
          prevLesson.id,
          prevLesson.title,
          prevLesson.speaker || 'आरोग्यम लीडर',
          prevLesson.summary || prevLesson.title,
          prevLesson.audio_url || ''
        );
      } else {
        showToast("ℹ️ यह पहला पाठ है", "info");
      }
    },

    filterTrainingHub: function (cat) {
      renderTrainingHub(cat);
    },

    renderTrainingHub: function () {
      renderTrainingHub();
    },

    shareTrainingWhatsApp: function (title, summary, lessonId) {
      const id = lessonId || currentPlayingLessonId || 'al_company_profile';
      const baseUrl = getPublicShareBaseUrl();
      const shareUrl = `${baseUrl}?audio=${encodeURIComponent(id)}&ref=${encodeURIComponent(vault.share_id || 'AI000004')}`;
      const msg = `🎧 *आरोग्यम लीडरशिप मास्टरक्लास*\n\n📌 *${title || 'आरोग्यम मास्टरक्लास'}*\n\n${summary || ''}\n\n👉 *यहाँ क्लिक करके सीधे फ्री ऑडियो सुनें:*\n${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    },

    shareTrainingNative: function (title, summary, lessonId) {
      const id = lessonId || currentPlayingLessonId || 'al_company_profile';
      const baseUrl = getPublicShareBaseUrl();
      const shareUrl = `${baseUrl}?audio=${encodeURIComponent(id)}&ref=${encodeURIComponent(vault.share_id || 'AI000004')}`;
      const msg = `🎧 *आरोग्यम लीडरशिप मास्टरक्लास*\n\n📌 *${title || 'आरोग्यम मास्टरक्लास'}*\n\n${summary || ''}\n\n👉 *यहाँ क्लिक करके सीधे फ्री ऑडियो सुनें:*\n${shareUrl}`;
      if (navigator.share) {
        navigator.share({
          title: title || 'आरोग्यम मास्टरक्लास',
          text: msg,
          url: shareUrl
        }).catch(() => {});
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      }
    },

    sendSolutionNative: function (probId) {
      if (!selectedProblem) return;
      const msg = selectedProblem.whatsapp_msg || `${selectedProblem.title}\n${(selectedProblem.products || []).join(' + ')}`;
      const shareUrl = getPublicShareBaseUrl();
      if (navigator.share) {
        navigator.share({
          title: selectedProblem.title || 'आरोग्यम नुस्खा',
          text: msg,
          url: shareUrl
        }).catch(() => {});
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      }
    },

    startPendingAudioPlay: function () {
      startPendingAudioPlay();
    },

    submitLeadAndPlayAudio: function (event) {
      submitLeadAndPlayAudio(event);
    },

    closeLeadCaptureModal: function () {
      const modal = document.getElementById('leadCaptureAudioModal');
      if (modal) modal.classList.remove('show');
    },

    sendAutoshipAlertWhatsApp: function (name, phone, month, gift) {
      const msg = `नमस्ते ${name} जी!\n\n🎁 आपके 6-Month Autoship का ${month}वां महीना पूरा हो रहा है। अगले महीने आपको *${gift}* 100% मुफ़्त मिलेगा!`;
      window.open(`https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(msg)}`, '_blank');
    },

    incrementDsr: function (key, val) {
      if (!vault.dsr_counters) vault.dsr_counters = {};
      vault.dsr_counters[key] = (vault.dsr_counters[key] || 0) + val;
      saveLocalVault();
      renderDsrCounters();
    },

    toggleTodoTask: function (idx) {
      if (vault.todo_tasks && vault.todo_tasks[idx]) {
        vault.todo_tasks[idx].done = !vault.todo_tasks[idx].done;
        saveLocalVault();
        renderTodoList();
      }
    },

    deleteTodoTask: function (idx) {
      if (vault.todo_tasks) {
        vault.todo_tasks.splice(idx, 1);
        saveLocalVault();
        renderTodoList();
      }
    },

    addTodoPrompt: function () {
      const title = prompt("नया टास्क दर्ज करें:");
      if (title && title.trim()) {
        vault.todo_tasks.unshift({
          id: 'td_' + Date.now(),
          title: title.trim(),
          date: new Date().toISOString().split('T')[0],
          done: false
        });
        saveLocalVault();
        renderTodoList();
      }
    },

    filterSurveyProblems: function (query) {
      renderCategoryProblems(query);
    },

    setCustomCycleDate: function (val) {
      vault.custom_cycle_end_date = val;
      saveLocalVault();
      updateClosingTimers();
    },

    // Marketing Engine Actions
    selectMktLandingPage: function (lpId) {
      selectedMktLpId = lpId;
      renderMktLandingPages();
      updateMktMessagePreview();
      showToast("✅ लैंडिंग पेज चुना गया!", "info");
    },

    onMktCategoryChange: function (catId) {
      populateMktHookTemplatesDropdown(catId);
      updateMktMessagePreview();
    },

    onMktTemplateSelect: function (tmplId) {
      updateMktMessagePreview();
    },

    shareMktWhatsAppBroadcast: function () {
      const msg = document.getElementById('mktMessageBox')?.value || '';
      if (!msg.trim()) {
        showToast("⚠️ संदेश खाली है", "info");
        return;
      }
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    },

    shareMktNative: function () {
      const msg = document.getElementById('mktMessageBox')?.value || '';
      const link = document.getElementById('mktReferralLinkDisplay')?.value || window.location.href;
      if (navigator.share) {
        navigator.share({
          title: 'आरोग्यम इंडिया — स्मार्ट ई-टेलर बिज़नेस',
          text: msg,
          url: link
        }).catch(() => {});
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      }
    },

    copyMktFullMessage: function () {
      const msg = document.getElementById('mktMessageBox')?.value || '';
      if (!msg) return;
      navigator.clipboard.writeText(msg).then(() => {
        showToast("📋 पूरा संदेश कॉपी हो गया!", "success");
      }).catch(() => {
        showToast("📋 मैसेज कॉपी हुआ", "info");
      });
    },

    copyMktReferralLink: function () {
      const link = document.getElementById('mktReferralLinkDisplay')?.value || '';
      if (!link) return;
      navigator.clipboard.writeText(link).then(() => {
        showToast("📋 रेफरल लिंक कॉपी हो गया!", "success");
      }).catch(() => {
        showToast("📋 लिंक कॉपी हुआ", "info");
      });
    },

    previewMktLandingPage: function () {
      const link = document.getElementById('mktReferralLinkDisplay')?.value || '';
      if (link) {
        window.open(link, '_blank');
      }
    },

    filterMktRecipients: function (cat) {
      renderMktRecipients(cat);
    },

    sendMktToIndividual: function (phone, name) {
      const msg = document.getElementById('mktMessageBox')?.value || '';
      let personalizedMsg = msg;
      if (name) {
        personalizedMsg = personalizedMsg.replace('किसान मित्र', name).replace('{name}', name);
      }
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
      const url = cleanPhone ? 
        `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(personalizedMsg)}` :
        `https://api.whatsapp.com/send?text=${encodeURIComponent(personalizedMsg)}`;
      window.open(url, '_blank');
    },

    manualSyncNow: function () {
      syncVaultToCloud(false);
    }
  };

  // -------------------------------------------------------------
  // 15.1 REMOTE ADMIN CONFIG & CLOSING DATE SYNC (ZERO EGRESS)
  // -------------------------------------------------------------
  async function syncRemoteAdminSettings() {
    try {
      if (window.supabaseClient) {
        const { data } = await window.supabaseClient
          .from('site_configs')
          .select('key, value');
        
        if (data && Array.isArray(data)) {
          data.forEach(row => {
            if (row.key === 'smart_etailer_config' && row.value) {
              const remoteConfig = row.value;
              localStorage.setItem('AI_ADMIN_SMART_ETAILER_CONFIG', JSON.stringify(remoteConfig));
              if (remoteConfig.official_cycle_end_date) {
                vault.custom_cycle_end_date = remoteConfig.official_cycle_end_date.split('T')[0];
                const customCycleInput = document.getElementById('customCycleDateInput');
                if (customCycleInput) customCycleInput.value = vault.custom_cycle_end_date;
                updateClosingTimers();
              }
              if (remoteConfig.announcement_ticker) {
                const tickerEl = document.getElementById('liveAnnouncementTicker');
                const tickerElTrack = document.getElementById('home-live-ticker-track');
                if (tickerEl) tickerEl.textContent = remoteConfig.announcement_ticker;
                if (tickerElTrack) tickerElTrack.textContent = remoteConfig.announcement_ticker;
              }
            } else if (row.key === 'custom_business_plans' && row.value) {
              localStorage.setItem('AI_ADMIN_CUSTOM_PLANS', JSON.stringify(row.value));
              renderCustomPlansAndOffers();
            } else if (row.key === 'marketing_categories' && row.value) {
              localStorage.setItem('AI_ADMIN_MARKETING_CATEGORIES', JSON.stringify(row.value));
              if (document.getElementById('tab-marketing')?.classList.contains('active')) {
                renderMarketingModule();
              }
            } else if (row.key === 'audio_lessons' && row.value) {
              localStorage.setItem('AI_ADMIN_AUDIO_LESSONS', JSON.stringify(row.value));
            }
          });
        }
      }
    } catch (err) {}
  }

  // -------------------------------------------------------------
  // 16. INIT ENGINE CALL ON DOM READY
  // -------------------------------------------------------------
  async function initEngine() {
    loadLocalVault();
    // Initialize Smart Business Diary Components
    updateDiaryHeroLevel();
    renderDiaryLedger();
    renderDiaryFollowups();
    renderIncomeTarget();
    renderCashflowSummary();
    initTheme();
    initUserProfile();
    await loadDiagnosisCatalog();
    initDualTimers();
    renderAllViews();
    setupMidnightAutoSyncSchedule();
    syncRemoteAdminSettings();

    // Check URL search parameters for initial tab routing & Smart Deep-Links (Zero reload lag)
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      const audioParam = params.get('audio');
      const refParam = params.get('ref');

      if (refParam && !vault.share_id) {
        vault.share_id = refParam;
        saveLocalVault();
      }

      if (audioParam) {
        switchTab('tab-training');
        setTimeout(() => {
          handleDeepLinkedAudio(audioParam);
        }, 400);
      } else if (tab) {
        const targetTabId = tab.startsWith('tab-') ? tab : ('tab-' + tab);
        switchTab(targetTabId);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }

})(window, document);


  // Auto-play page audio greeting (with interaction fallback)
  setTimeout(() => {
    try {
      if (typeof window.playPageAudioGreeting === 'function') {
        window.playPageAudioGreeting(true);
      } else if (typeof window.togglePageAudioGreeting === 'function') {
        const startAudioOnce = () => {
          try { window.togglePageAudioGreeting(); } catch (_) {}
          document.removeEventListener('click', startAudioOnce);
          document.removeEventListener('touchstart', startAudioOnce);
        };
        document.addEventListener('click', startAudioOnce, { once: true });
        document.addEventListener('touchstart', startAudioOnce, { once: true });
      }
    } catch (_) {}
  }, 1200);
