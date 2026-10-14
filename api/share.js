// Vercel Serverless Function: Social Share & Open Graph Pre-Renderer for UCAS Landing Pages
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
const DEFAULT_FALLBACK_IMAGE = 'https://aarogyamindia.online/images/banners/og_image-bk015-sec_audio-ba-436589-2buf.webp';
const HOST_ORIGIN = 'https://aarogyamindia.online';

function readJsonSafely(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim();
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn(`[SafeJSON] Failed to parse ${filePath}:`, e.message);
  }
  return null;
}

function getBookLandingPageData(bId) {
  if (!bId) return null;
  const cleanId = String(bId).trim().toUpperCase();
  const cleanSlug = String(bId).trim().toLowerCase();

  try {
    const dataPath = path.join(process.cwd(), 'data', 'universal-book-landing-pages.json');
    const json = readJsonSafely(dataPath);
    if (json) {
      const list = json.bookLandingPages || [];
      const found = list.find(p => (p.id && p.id.toUpperCase() === cleanId) || (p.slug && p.slug.toLowerCase() === cleanSlug));
      if (found) {
        found.og_image = found.og_image_landscape || found.og_image || found.hero?.og_image || found.hero?.banner_image || found.hero?.cover_image || '/images/books/kharif-master-guide-2026-cover.webp';
        return found;
      }
    }
  } catch (e) {}

  try {
    const booksPath = path.join(process.cwd(), 'data', 'books.json');
    const json = readJsonSafely(booksPath);
    if (json) {
      const list = json.books || [];
      const found = list.find(p => (p.id && p.id.toUpperCase() === cleanId) || (p.slug && p.slug.toLowerCase() === cleanSlug));
      if (found) {
        let ogImg = found.og_image_landscape || found.og_image || found.banner || found.cover || found.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp';
        return {
          id: found.id,
          landingPage: found.landingPage,
          og_title: found.heading || found.name,
          og_description: found.description || `${found.heading || found.name} - सम्पूर्ण वैज्ञानिक एवं Practical गाइड।`,
          og_image: ogImg,
          hero: {
            title: found.heading || found.name,
            description: found.description,
            cover_image: ogImg
          }
        };
      }
    }
  } catch (e) {}

  return null;
}

const SITE_PAGES_FALLBACK_MAP = {
  'index': {
    id: 'page_home',
    destUrl: 'https://aarogyamindia.online/index.html',
    og_title: '🏠 मुख्य पृष्ठ (Home Page) | Aarogyam India',
    og_description: 'Aarogyam India - भारत का सम्पूर्ण डिजिटल मंच। कृषि ई-बुक्स, फसल सुरक्षा, मौसम, मंडी भाव, स्वास्थ्य परामर्श, पशु पालन, और Netsurf डायरेक्ट बिज़नेस ग्रोथ।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-bk015-sec_audio-ba-436589-2buf.webp'
  },
  'home': {
    id: 'page_home',
    destUrl: 'https://aarogyamindia.online/index.html',
    og_title: '🏠 मुख्य पृष्ठ (Home Page) | Aarogyam India',
    og_description: 'Aarogyam India - भारत का सम्पूर्ण डिजिटल मंच। कृषि ई-बुक्स, फसल सुरक्षा, मौसम, मंडी भाव, स्वास्थ्य परामर्श, पशु पालन, और Netsurf डायरेक्ट बिज़नेस ग्रोथ।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-bk015-sec_audio-ba-436589-2buf.webp'
  },
  'pashu-palan': {
    id: 'page_pashu_palan',
    destUrl: 'https://aarogyamindia.online/pashu-palan.html',
    og_title: 'गाय-भैंस में दूध और FAT 2X बढ़ाएं | 100% आयुर्वेदिक पशु पोषण एवं देखभाल',
    og_description: 'बांझपन, थनैला और पाचन समस्याओं का सटीक समाधान। 24×7 WhatsApp AI डॉक्टर परामर्श और प्रमाणित बायो-फिट Pet-Vet उत्पाद प्राप्त करें।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-pashupalan-029612-sv0a.webp'
  },
  'netsurf': {
    id: 'page_netsurf_career',
    destUrl: 'https://aarogyamindia.online/categories/netsurf.html',
    og_title: 'क्या आप पार्ट टाइम में अपने सपने पूरे करना चाहते हैं? | Netsurf & Aarogyam India',
    og_description: 'बिना नौकरी छोड़े पार्ट-टाइम में पाएं फाइनेंशियल फ्रीडम! 26 साल पुरानी भरोसेमंद डायरेक्ट सेलिंग कंपनी Netsurf और Aarogyam के डिजिटल ऑटोमेशन सिस्टम से 15-दिवसीय क्लोजिंग में ₹8,19,250 तक कमाने का सुनहरा मौका।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-netsurf-398382-r3uq.webp'
  },
  'netsurf-products': {
    id: 'page_netsurf_products',
    destUrl: 'https://aarogyamindia.online/categories/netsurf-products.html',
    og_title: 'सम्पूर्ण नेटसर्फ उत्पाद कैटलॉग (All Netsurf Products) | 7 भाषाओं में PDF',
    og_description: 'कृषि, पशु पोषण, स्वास्थ्य व पर्सनल केयर के सभी 39+ ऑर्गेनिक प्रोडक्ट्स। 7 भाषाओं में पर्सनलाइज्ड PDF कैटलॉग डाउनलोड करें।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-netsurf-398382-r3uq.webp'
  },
  'health': {
    id: 'page_health',
    destUrl: 'https://aarogyamindia.online/categories/health.html',
    og_title: 'आरोग्यम स्वास्थ्य केंद्र | प्राकृतिक व आयुर्वेदिक समाधान',
    og_description: 'मधुमेह, जोड़ों का दर्द, मोटापा, बाल झड़ना व त्वचा समस्याओं का 100% आयुर्वेदिक व वैज्ञानिक समाधान।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-health-og-676433-sb3k.webp'
  },
  'health-joint-care': {
    id: 'page_health_joint_care',
    destUrl: 'https://aarogyamindia.online/health/joint-care.html',
    og_title: '🔥 क्या आपको पता है आपके जोड़ों का दर्द बार-बार क्यों लौटता है?',
    og_description: 'घुटनों का दर्द, कट-कट की आवाज, कार्टिलेज घिसाव व यूरिक एसिड का आयुर्वेदिक उपचार व डाइट चार्ट।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-1003678899-976100-9wi4.webp'
  },
  'joint-care': {
    id: 'page_health_joint_care',
    destUrl: 'https://aarogyamindia.online/health/joint-care.html',
    og_title: '🔥 क्या आपको पता है आपके जोड़ों का दर्द बार-बार क्यों लौटता है?',
    og_description: 'घुटनों का दर्द, कट-कट की आवाज, कार्टिलेज घिसाव व यूरिक एसिड का आयुर्वेदिक उपचार व डाइट चार्ट।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-1003678899-976100-9wi4.webp'
  },
  'health-diabetes': {
    id: 'page_health_diabetes',
    destUrl: 'https://aarogyamindia.online/health/diabetes.html',
    og_title: 'Aarogyam India | मधुमेह नियंत्रण की सही राह | डाइट, एक्सरसाइज और सही मार्गदर्शन',
    og_description: '“90 दिन में शुगर कंट्रोल? 😳 सच क्या है? जो बात आपको आज तक नहीं बताई गई - HbA1c, इंसुलिन रेजिस्टेंस और प्राकृतिक डाइट चार्ट।”',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-whatsapp-image-202-936789-y196.webp'
  },
  'diabetes': {
    id: 'page_health_diabetes',
    destUrl: 'https://aarogyamindia.online/health/diabetes.html',
    og_title: 'Aarogyam India | मधुमेह नियंत्रण की सही राह | डाइट, एक्सरसाइज और सही मार्गदर्शन',
    og_description: '“90 दिन में शुगर कंट्रोल? 😳 सच क्या है? जो बात आपको आज तक नहीं बताई गई - HbA1c, इंसुलिन रेजिस्टेंस और प्राकृतिक डाइट चार्ट।”',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-whatsapp-image-202-936789-y196.webp'
  },
  'health-hair-care': {
    id: 'page_health_hair_care',
    destUrl: 'https://aarogyamindia.online/health/hair-care.html',
    og_title: '🚨 क्या आप भी बालों के झड़ने और गंजेपन से परेशान हैं? | 100% आयुर्वेदिक समाधान',
    og_description: 'कंघी करते समय गुच्छों में गिरते बाल, चौड़ी होती मांग या जिद्दी डैंड्रफ? जानिए बालों के झड़ने की असली जड़ और 100% आयुर्वेदिक हेयर री-ग्रोथ फॉर्मूला।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-hair-77-154412-g45q.webp'
  },
  'hair-care': {
    id: 'page_health_hair_care',
    destUrl: 'https://aarogyamindia.online/health/hair-care.html',
    og_title: '🚨 क्या आप भी बालों के झड़ने और गंजेपन से परेशान हैं? | 100% आयुर्वेदिक समाधान',
    og_description: 'कंघी करते समय गुच्छों में गिरते बाल, चौड़ी होती मांग या जिद्दी डैंड्रफ? जानिए बालों के झड़ने की असली जड़ और 100% आयुर्वेदिक हेयर री-ग्रोथ फॉर्मूला।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-hair-77-154412-g45q.webp'
  },
  'health-skin-care': {
    id: 'page_health_skin_care',
    destUrl: 'https://aarogyamindia.online/health/skin-care.html',
    og_title: '🚨 चेहरे पर पिंपल्स, जिद्दी झाइयां व डार्क सर्कल्स? | 100% आयुर्वेदिक समाधान',
    og_description: 'क्या महंगे प्रोडक्ट्स लगाकर भी दाग-धब्बे और मुँहासे ठीक नहीं हो रहे? जानिए त्वचा समस्याओं की अंदरूनी जड़ और प्राकृतिक त्वचा कायाकल्प फॉर्मूला।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-skine-1-794718-e42c.webp'
  },
  'skin-care': {
    id: 'page_health_skin_care',
    destUrl: 'https://aarogyamindia.online/health/skin-care.html',
    og_title: '🚨 चेहरे पर पिंपल्स, जिद्दी झाइयां व डार्क सर्कल्स? | 100% आयुर्वेदिक समाधान',
    og_description: 'क्या महंगे प्रोडक्ट्स लगाकर भी दाग-धब्बे और मुँहासे ठीक नहीं हो रहे? जानिए त्वचा समस्याओं की अंदरूनी जड़ और प्राकृतिक त्वचा कायाकल्प फॉर्मूला।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-skine-1-794718-e42c.webp'
  },
  'health-weight-loss': {
    id: 'page_health_weight_loss',
    destUrl: 'https://aarogyamindia.online/health/weight-loss.html',
    og_title: 'मोटापा व पेट की चर्बी घटाने का प्राकृतिक डाइट चार्ट | Aarogyam India',
    og_description: 'बिना कमजोरी और बिना भूखे रहे 30 दिनों में 4 से 6 किलो वजन नियंत्रित करने का संपूर्ण वैज्ञानिक व आयुर्वेदिक मार्गदर्शन।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-motapa-490448-grer.webp'
  },
  'weight-loss': {
    id: 'page_health_weight_loss',
    destUrl: 'https://aarogyamindia.online/health/weight-loss.html',
    og_title: 'मोटापा व पेट की चर्बी घटाने का प्राकृतिक डाइट चार्ट | Aarogyam India',
    og_description: 'बिना कमजोरी और बिना भूखे रहे 30 दिनों में 4 से 6 किलो वजन नियंत्रित करने का संपूर्ण वैज्ञानिक व आयुर्वेदिक मार्गदर्शन।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-motapa-490448-grer.webp'
  },
  'health-sexual-wellness': {
    id: 'page_health_sexual_wellness',
    destUrl: 'https://aarogyamindia.online/health/sexual-wellness.html',
    og_title: 'Aarogyam India | पौरुष शक्ति व यौन स्वास्थ्य | वैज्ञानिक व प्राकृतिक समाधान',
    og_description: '“ED, शीघ्रपतन, लो टेस्टोस्टेरोन और स्पर्म काउंट की कमी का सच। भ्रामक विज्ञापनों से बचें, प्राकृतिक व वैज्ञानिक समाधान अपनाएं।”',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-ed-677895-iqr6.webp'
  },
  'sexual-wellness': {
    id: 'page_health_sexual_wellness',
    destUrl: 'https://aarogyamindia.online/health/sexual-wellness.html',
    og_title: 'Aarogyam India | पौरुष शक्ति व यौन स्वास्थ्य | वैज्ञानिक व प्राकृतिक समाधान',
    og_description: '“ED, शीघ्रपतन, लो टेस्टोस्टेरोन और स्पर्म काउंट की कमी का सच। भ्रामक विज्ञापनों से बचें, प्राकृतिक व वैज्ञानिक समाधान अपनाएं।”',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-ed-677895-iqr6.webp'
  },
  'health-kids-care': {
    id: 'page_health_kids_care',
    destUrl: 'https://aarogyamindia.online/health/kids-care.html',
    og_title: 'बच्चों का संपूर्ण शारीरिक व मानसिक विकास गाइड | Aarogyam India',
    og_description: 'बच्चों की लंबाई, वजन, रोग प्रतिरोधक क्षमता व याददाश्त बढ़ाने के प्राकृतिक पोषण उपाय।',
    og_image: 'https://aarogyamindia.online/images/banners/health-kids-care.jpg'
  },
  'kids-care': {
    id: 'page_health_kids_care',
    destUrl: 'https://aarogyamindia.online/health/kids-care.html',
    og_title: 'बच्चों का संपूर्ण शारीरिक व मानसिक विकास गाइड | Aarogyam India',
    og_description: 'बच्चों की लंबाई, वजन, रोग प्रतिरोधक क्षमता व याददाश्त बढ़ाने के प्राकृतिक पोषण उपाय।',
    og_image: 'https://aarogyamindia.online/images/banners/health-kids-care.jpg'
  },
  'health-home-care': {
    id: 'page_health_home_care',
    destUrl: 'https://aarogyamindia.online/health/home-care.html',
    og_title: 'केमिकल-मुक्त सुरक्षित व स्वच्छ घर समाधान | Aarogyam India',
    og_description: 'फलों-सब्जियों से कीटनाशक हटाने व बायो-एंजाइम क्लीनिंग के 100% प्राकृतिक समाधान।',
    og_image: 'https://aarogyamindia.online/images/banners/health-home-care.jpg'
  },
  'home-care': {
    id: 'page_health_home_care',
    destUrl: 'https://aarogyamindia.online/health/home-care.html',
    og_title: 'केमिकल-मुक्त सुरक्षित व स्वच्छ घर समाधान | Aarogyam India',
    og_description: 'फलों-सब्जियों से कीटनाशक हटाने व बायो-एंजाइम क्लीनिंग के 100% प्राकृतिक समाधान।',
    og_image: 'https://aarogyamindia.online/images/banners/health-home-care.jpg'
  },
  'health-dental-care': {
    id: 'page_health_dental_care',
    destUrl: 'https://aarogyamindia.online/health/dental-care.html',
    og_title: '🦷 क्या आपका टूथपेस्ट आपके दांतों को धीरे-धीरे सड़ा रहा है? फ्लोराइड का कड़वा सच',
    og_description: 'मार्केट के केमिकल टूथपेस्ट, पायरिया, मुंह के छाले और दांतों में झनझनाहट (Sensitivity) का स्थायी आयुर्वेदिक समाधान व दंत पोषण गाइड।',
    og_image: 'https://aarogyamindia.online/images/banners/health-banner.jpeg'
  },
  'dental-care': {
    id: 'page_health_dental_care',
    destUrl: 'https://aarogyamindia.online/health/dental-care.html',
    og_title: '🦷 क्या आपका टूथपेस्ट आपके दांतों को धीरे-धीरे सड़ा रहा है? फ्लोराइड का कड़वा सच',
    og_description: 'मार्केट के केमिकल टूथपेस्ट, पायरिया, मुंह के छाले और दांतों में झनझनाहट (Sensitivity) का स्थायी आयुर्वेदिक समाधान व दंत पोषण गाइड।',
    og_image: 'https://aarogyamindia.online/images/banners/health-banner.jpeg'
  },
  'health-liver-care': {
    id: 'page_health_liver_care',
    destUrl: 'https://aarogyamindia.online/health/liver-care.html',
    og_title: '🫀 क्या आपका लिवर धीरे-धीरे फेल हो रहा है? फैटी लिवर और सिरोसिस का कड़वा सच',
    og_description: 'भारत में हर 3 में से 1 व्यक्ति फैटी लिवर का शिकार! लिवर सिरोसिस, पीलिया, पेट में भारीपन व थकान का संपूर्ण आयुर्वेदिक डिटॉक्स व डाइट चार्ट।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-health-og-676433-sb3k.webp'
  },
  'liver-care': {
    id: 'page_health_liver_care',
    destUrl: 'https://aarogyamindia.online/health/liver-care.html',
    og_title: '🫀 क्या आपका लिवर धीरे-धीरे फेल हो रहा है? फैटी लिवर और सिरोसिस का कड़वा सच',
    og_description: 'भारत में हर 3 में से 1 व्यक्ति फैटी लिवर का शिकार! लिवर सिरोसिस, पीलिया, पेट में भारीपन व थकान का संपूर्ण आयुर्वेदिक डिटॉक्स व डाइट चार्ट।',
    og_image: 'https://aarogyamindia.online/images/banners/og_image-health-og-676433-sb3k.webp'
  },
  'health-thyroid-care': {
    id: 'page_health_thyroid_care',
    destUrl: 'https://aarogyamindia.online/health/thyroid-care.html',
    og_title: '🦋 क्या गोली खाने के बाद भी थायरॉइड ठीक नहीं हो रहा? लिवर-थायरॉइड का अनदेखा सच',
    og_description: 'शरीर में 80% T4 को सक्रिय T3 में बदलने का काम लिवर करता है! थायरॉइड, अचानक वजन बढ़ना, बाल झड़ना व थकान का संपूर्ण आयुर्वेदिक व वैज्ञानिक डाइट चार्ट।',
    og_image: 'https://aarogyamindia.online/images/banners/health_card-2-585308-wpfz.webp'
  },
  'thyroid-care': {
    id: 'page_health_thyroid_care',
    destUrl: 'https://aarogyamindia.online/health/thyroid-care.html',
    og_title: '🦋 क्या गोली खाने के बाद भी थायरॉइड ठीक नहीं हो रहा? लिवर-थायरॉइड का अनदेखा सच',
    og_description: 'शरीर में 80% T4 को सक्रिय T3 में बदलने का काम लिवर करता है! थायरॉइड, अचानक वजन बढ़ना, बाल झड़ना व थकान का संपूर्ण आयुर्वेदिक व वैज्ञानिक डाइट चार्ट।',
    og_image: 'https://aarogyamindia.online/images/banners/health_card-2-585308-wpfz.webp'
  },
  'health-heart-care': {
    id: 'page_health_heart_care',
    destUrl: 'https://aarogyamindia.online/health/heart-care.html',
    og_title: '❤️ क्या आपकी धमनियां धीरे-धीरे ब्लॉक हो रही हैं? भारत में कम उम्र में हार्ट अटैक का खौफनाक सच',
    og_description: '25 से 45 साल में अचानक हार्ट अटैक क्यों? रेस्टिंग हार्ट रेट (RHR), सीने में भारीपन, सांस फूलने के लक्षण और धमनियों की प्राकृतिक सफाई की संपूर्ण आयुर्वेदिक गाइड।',
    og_image: 'https://aarogyamindia.online/images/banners/health-banner.jpeg'
  },
  'heart-care': {
    id: 'page_health_heart_care',
    destUrl: 'https://aarogyamindia.online/health/heart-care.html',
    og_title: '❤️ क्या आपकी धमनियां धीरे-धीरे ब्लॉक हो रही हैं? भारत में कम उम्र में हार्ट अटैक का खौफनाक सच',
    og_description: '25 से 45 साल में अचानक हार्ट अटैक क्यों? रेस्टिंग हार्ट रेट (RHR), सीने में भारीपन, सांस फूलने के लक्षण और धमनियों की प्राकृतिक सफाई की संपूर्ण आयुर्वेदिक गाइड।',
    og_image: 'https://aarogyamindia.online/images/banners/health-banner.jpeg'
  }
};

function getSitePageData(pageTarget) {
  if (!pageTarget) return null;
  const target = String(pageTarget).trim().toLowerCase();

  // 1. Dynamic check against site-pages-config.json
  try {
    const pathsToTry = [
      path.join(process.cwd(), 'data', 'site-pages-config.json'),
      path.join(__dirname, '..', 'data', 'site-pages-config.json')
    ];
    for (const p of pathsToTry) {
      const json = readJsonSafely(p);
      if (json) {
        const list = json.sitePages || [];
        const found = list.find(item => {
          const pid = (item.id || '').toLowerCase();
          const pslug = (item.slug || '').toLowerCase();
          const purl = (item.url || '').toLowerCase();
          return (
            (target === 'index' && (pid === 'page_home' || pslug === 'home' || purl.endsWith('/index.html'))) ||
            pid === target ||
            pslug === target ||
            purl === target ||
            pid === `page_${target.replace(/-/g, '_')}` ||
            pslug === target.replace('health-', '') ||
            purl.endsWith(target) ||
            purl.endsWith(`${target}.html`) ||
            purl.endsWith(`/${target}`) ||
            purl.endsWith(`/${target}.html`)
          );
        });
        if (found && (found.og_image || found.og_title)) {
          let ogImg = found.og_image || '/images/banners/og_image-bk015-sec_audio-ba-436589-2buf.webp';
          if (ogImg && !ogImg.startsWith('http')) {
            ogImg = `${HOST_ORIGIN}${ogImg.startsWith('/') ? '' : '/'}${ogImg}`;
          }
          let destUrl = found.url || '/index.html';
          if (!destUrl.startsWith('http')) {
            destUrl = `${HOST_ORIGIN}${destUrl.startsWith('/') ? '' : '/'}${destUrl}`;
          }
          return {
            id: found.id,
            destUrl,
            og_title: found.og_title || found.name || 'Aarogyam India',
            og_description: found.og_description || 'Aarogyam India - भारत का सम्पूर्ण डिजिटल मंच।',
            og_image: ogImg
          };
        }
      }
    }
  } catch (e) {
    console.warn('Error reading dynamic site pages config:', e);
  }

  // 2. High-reliability fallback dictionary
  if (SITE_PAGES_FALLBACK_MAP[target]) {
    return SITE_PAGES_FALLBACK_MAP[target];
  }
  const strippedTarget = target.replace(/^health-/, '');
  if (SITE_PAGES_FALLBACK_MAP[strippedTarget]) {
    return SITE_PAGES_FALLBACK_MAP[strippedTarget];
  }

  return null;
}

function getWebinarOrVideoData(id, type, query) {
  const cleanId = String(id || '').trim();
  const cleanType = String(type || '').trim().toLowerCase();

  // 1. Specific AarogyamTube Video / Masterclass / Short
  if (cleanType === 'video' || cleanType === 'short' || cleanType === 'masterclass' || cleanId.startsWith('VID_') || cleanId.startsWith('REC_') || query.vid || query.yt || query.v) {
    const vidId = String(query.vid || query.id || cleanId).trim();
    let found = null;
    
    const pathsToTry = [
      path.join(process.cwd(), 'data', 'webinar-recordings.json'),
      path.join(__dirname, '..', 'data', 'webinar-recordings.json')
    ];

    for (const recsPath of pathsToTry) {
      if (found) break;
      try {
        if (fs.existsSync(recsPath)) {
          const content = fs.readFileSync(recsPath, 'utf8');
          const json = JSON.parse(content);
          const list = Array.isArray(json.recordings) ? json.recordings : (Array.isArray(json) ? json : []);
          found = list.find(r => 
            (r.id && r.id.toLowerCase() === vidId.toLowerCase()) || 
            (r.youtube_id && r.youtube_id === vidId) ||
            (r.video_url && r.video_url.includes(vidId)) ||
            (extractYoutubeVideoId(r.video_url) && extractYoutubeVideoId(r.video_url) === extractYoutubeVideoId(vidId))
          );
        }
      } catch (e) {}
    }

    const ytId = found?.youtube_id || extractYoutubeVideoId(found?.video_url || query.yt || query.v || query.thumb || vidId);
    let thumb = query.thumb || query.img || query.thumbnail || found?.thumbnail;
    if (!thumb && ytId) thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    if (!thumb || thumb.includes('.svg')) {
      thumb = `${HOST_ORIGIN}/images/banners/agriculture-hero-banner-1.webp`;
    } else if (thumb.startsWith('//')) {
      thumb = `https:${thumb}`;
    } else if (thumb.startsWith('/')) {
      thumb = `${HOST_ORIGIN}${thumb}`;
    } else if (!thumb.startsWith('http')) {
      thumb = `${HOST_ORIGIN}/${thumb}`;
    }

    const isShortFormat = found?.format === 'short_reel' || String(found?.id || vidId).startsWith('VID_S') || cleanType === 'short' || found?.category === 'Shorts & Reels';
    const defaultDesc = isShortFormat
      ? `${found?.speaker || 'आरोग्यम विशेषज्ञ'} — 1-मिनट का प्रैक्टिकल कृषि वीडियो। AarogyamTube पर अभी देखें।`
      : `${found?.speaker || 'आरोग्यम विशेषज्ञ'} — संपूर्ण कृषि मास्टरक्लास ट्रेनिंग गाइड। AarogyamTube पर अभी देखें।`;

    const title = (query.title || found?.title || 'AarogyamTube — कृषि वीडियो').trim();
    const description = (query.desc || query.msg || query.message || found?.description || defaultDesc).trim();

    return {
      is_video: true,
      id: found?.id || vidId || 'video',
      title: title,
      description: description,
      image: thumb,
      destUrl: `${HOST_ORIGIN}/tube.html?vid=${encodeURIComponent(found?.id || vidId)}`
    };
  }

  // 2. Master Webinar / Live Zoom
  if (cleanType === 'webinar' || cleanId === 'WB_MASTER' || cleanId === 'webinar' || cleanId === 'zoom') {
    try {
      const wbPath = path.join(process.cwd(), 'data', 'webinar-master.json');
      if (fs.existsSync(wbPath)) {
        const content = fs.readFileSync(wbPath, 'utf8');
        const json = JSON.parse(content);
        const wm = json.webinarMaster || json || {};
        return {
          is_webinar: true,
          id: wm.id || 'WB_MASTER',
          title: wm.og_title || wm.title || '🔴 Aarogyam India — लाइव ज़ूम वेबिनार',
          description: wm.og_description || wm.description || 'लाइव ज़ूम ट्रेनिंग में भाग लें और विशेषज्ञ मार्गदर्शन प्राप्त करें।',
          image: wm.og_image || wm.cover_image || '/images/banners/universal-zoom-webinar-og.jpg',
          destUrl: `${HOST_ORIGIN}/webinar.html`
        };
      }
    } catch (e) {}
  }

  return null;
}

function extractYoutubeVideoId(url) {
  if (!url) return null;
  const str = String(url).trim();
  if (!str || str.startsWith('data:')) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  const thumbMatch = str.match(/(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/([a-zA-Z0-9_-]{11})/i);
  if (thumbMatch && thumbMatch[1] && thumbMatch[1].length === 11) {
    return thumbMatch[1];
  }

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }
  return null;
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

function fetchOpenGraphImage(targetUrl, maxRedirects = 2) {
  return new Promise((resolve) => {
    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
      return resolve(null);
    }
    try {
      const parsed = new URL(targetUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : require('http');

      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 3000
      }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
          const nextUrl = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, targetUrl).toString();
          return fetchOpenGraphImage(nextUrl, maxRedirects - 1).then(resolve);
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          return resolve(null);
        }

        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
          if (raw.length > 500000) req.destroy();
        });
        res.on('end', () => {
          try {
            let m = raw.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
            if (!m) m = raw.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
            if (m && m[1]) {
              let imgUrl = m[1].replace(/&amp;/g, '&');
              return resolve(imgUrl);
            }
            resolve(null);
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    } catch (e) {
      resolve(null);
    }
  });
}

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 25,
  keepAliveMsecs: 60000
});

const _lpShareMemoryCache = new Map();
const LP_SHARE_CACHE_TTL = 300000; // 5 minutes cache

function fetchLandingPageFromSupabase(lpId) {
  return new Promise((resolve) => {
    if (!lpId) return resolve(null);
    const cleanId = String(lpId).trim();

    // Check memory cache first
    const cached = _lpShareMemoryCache.get(cleanId);
    if (cached && (Date.now() - cached.timestamp < LP_SHARE_CACHE_TTL)) {
      return resolve(cached.data);
    }

    const apiUrl = `${SUPABASE_URL}/rest/v1/landing_pages?id=eq.${encodeURIComponent(cleanId)}&select=id,title,category,content_type,media_url,thumbnail_url,message,share_id,status,og_title,og_description,og_image_url`;

    const options = {
      agent: httpsAgent,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 3000
    };

    const req = https.get(apiUrl, options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const record = parsed[0];
              _lpShareMemoryCache.set(cleanId, { data: record, timestamp: Date.now() });
              if (_lpShareMemoryCache.size > 500) {
                const firstKey = _lpShareMemoryCache.keys().next().value;
                _lpShareMemoryCache.delete(firstKey);
              }
              return resolve(record);
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

const CRAWLER_USER_AGENTS = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|WhatsApp|Slackbot|Discordbot|SkypeUriPreview|Google-Structured-Data-Testing-Tool|Googlebot|bingbot|DuckDuckBot|Baiduspider|YandexBot/i;

function isBotScraper(userAgent) {
  if (!userAgent) return true; // Default to serving crawler HTML for unknown scrapers
  if (/WhatsApp/i.test(userAgent)) return true;
  if (/facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot/i.test(userAgent)) return true;
  const isHumanBrowser = /Mozilla\/5\.0.*(Mobile|Android|iPhone|iPad|Safari|Chrome)/i.test(userAgent) && !/facebookexternalhit|Facebot|Twitterbot|WhatsApp/i.test(userAgent);
  if (isHumanBrowser) return false;
  return CRAWLER_USER_AGENTS.test(userAgent);
}

// Master Landing Page Runtime Switch (Set true to enable, false for Egress Safe Mode)
const LANDING_PAGES_ENABLED = true;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. If Landing Pages are temporarily OFF, immediately serve lightweight fallback metadata with ZERO DB query
  if (!LANDING_PAGES_ENABLED) {
    const userAgent = req.headers['user-agent'] || '';
    const isBot = isBotScraper(userAgent);

    if (isBot) {
      const fallbackHtml = generateCrawlerMetaHtml({
        title: 'Aarogyam India — उन्नत कृषि एवं स्वास्थ्य समाधान',
        description: 'Aarogyam India के साथ जुड़ें और प्रामाणिक जैविक कृषि व स्वास्थ्य परामर्श प्राप्त करें।',
        imageUrl: DEFAULT_FALLBACK_IMAGE,
        canonicalUrl: 'https://aarogyamindia.online/index.html',
        isWebinar: false
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400');
      return res.status(200).send(fallbackHtml);
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400');
      return res.redirect(302, '/index.html');
    }
  }

  const query = req.query || {};
  const lpId = (query.id || query.lp || query.book || query.book_id || '').trim();
  const queryShareId = (query.share_id || query.ref || '').trim();
  const queryYt = (query.yt || query.v || query.video || '').trim();
  const queryThumb = (query.thumb || query.img || query.thumbnail || '').trim();
  const queryTitle = (query.title || '').trim();
  const queryDesc = (query.desc || query.msg || query.message || '').trim();
  const queryCat = (query.cat || query.category || '').trim();
  const queryPage = (query.page || query.p || '').trim();

  // 0. Check if request is for a Site Page (Homepage, Pashu-Palan, Netsurf, Health, etc.)
  if (queryPage) {
    let pageData = getSitePageData(queryPage) || SITE_PAGES_FALLBACK_MAP['index'];
    if (pageData) {
      const finalTitle = pageData.og_title;
      const finalDesc = pageData.og_description;
      const finalOgImage = pageData.og_image;
      const destUrl = pageData.destUrl;
      const canonicalShareUrl = `${HOST_ORIGIN}/api/share?page=${encodeURIComponent(queryPage)}`;

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const isWebp = finalOgImage.toLowerCase().endsWith('.webp');
      const isPng = finalOgImage.toLowerCase().endsWith('.png');
      const imgMime = isWebp ? 'image/webp' : (isPng ? 'image/png' : 'image/jpeg');

      const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(finalTitle)}</title>

  <!-- Open Graph / WhatsApp & Facebook Crawlers -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Aarogyam India">
  <meta property="og:title" content="${escapeHtml(finalTitle)}">
  <meta property="og:description" content="${escapeHtml(finalDesc)}">
  <meta property="og:image" content="${escapeHtml(finalOgImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(finalOgImage)}">
  <meta property="og:image:type" content="${imgMime}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(finalTitle)}">
  <meta property="og:url" content="${escapeHtml(canonicalShareUrl)}">
  <link rel="image_src" href="${escapeHtml(finalOgImage)}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@AarogyamIndia">
  <meta name="twitter:title" content="${escapeHtml(finalTitle)}">
  <meta name="twitter:description" content="${escapeHtml(finalDesc)}">
  <meta name="twitter:image" content="${escapeHtml(finalOgImage)}">
  <link rel="canonical" href="${escapeHtml(canonicalShareUrl)}">

  <!-- Instant Redirection for human visitors -->
  <script>
    (function() {
      try {
        window.location.replace("${destUrl}");
      } catch (e) {}
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(destUrl)}">
  </noscript>
</head>
<body style="margin:0;padding:0;background:#0f172a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#1e293b;max-width:440px;width:90%;margin:20px auto;padding:28px 20px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.5);text-align:center;border:1px solid #334155;">
    <div style="display:inline-flex;align-items:center;gap:6px;background:#16a34a;color:#fff;padding:4px 12px;border-radius:8px;font-weight:900;font-size:0.85rem;margin-bottom:12px;">
      <span>🌿</span> <span>Aarogyam India</span>
    </div>
    <h2 style="font-size:1.15rem;font-weight:800;color:#F8FAFC;margin:0 0 10px 0;line-height:1.35;">${escapeHtml(finalTitle)}</h2>
    <p style="font-size:0.88rem;color:#94A3B8;margin:0 0 20px 0;line-height:1.45;">${escapeHtml(finalDesc)}</p>
    <a href="${escapeHtml(destUrl)}" style="display:block;padding:14px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:800;font-size:1rem;box-shadow:0 4px 12px rgba(22,163,74,0.4);">पेज खोलें →</a>
  </div>
  <script>
    setTimeout(function() {
      try { window.location.href = "${destUrl}"; } catch(e) {}
    }, 150);
  </script>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }
  }

  // 1. Check if ID represents an eBook Landing Page (e.g. BK015, BK001, etc.)
  const bookData = getBookLandingPageData(lpId);
  if (bookData) {
    const finalTitle = (bookData.og_title || bookData.hero?.title || queryTitle || 'Aarogyam India eBook Practical Guide').trim();
    const finalDesc = (bookData.og_description || bookData.whatsapp_share_message || bookData.whatsapp_share_text || bookData.hero?.description || queryDesc || 'सम्पूर्ण Practical Guide। अभी विशेष छूट पर उपलब्ध।').slice(0, 200).trim();
    const rawImg = bookData.og_image || bookData.hero?.cover_image || bookData.hero?.banner_image || '/images/books/kharif-master-guide-2026-cover.webp';
    let finalOgImage = rawImg.startsWith('http') ? rawImg : `${HOST_ORIGIN}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    
    // Permanent Failsafe for WhatsApp & Social Crawlers:
    // Check if companion JPG version exists on disk for 100% WhatsApp crawler compatibility
    let jpgFallbackUrl = null;
    if (rawImg && rawImg.toLowerCase().endsWith('.webp')) {
      const potentialJpg = rawImg.replace(/\.webp$/i, '.jpg');
      const localJpgPath = path.join(process.cwd(), potentialJpg.startsWith('/') ? potentialJpg.slice(1) : potentialJpg);
      if (fs.existsSync(localJpgPath)) {
        jpgFallbackUrl = `${HOST_ORIGIN}${potentialJpg.startsWith('/') ? '' : '/'}${potentialJpg}`;
      }
    }

    let destUrl = `${HOST_ORIGIN}/ebooks/book-landing.html?id=${encodeURIComponent(bookData.id || lpId)}`;
    if (bookData.landingPage) {
      destUrl = bookData.landingPage.startsWith('http') ? bookData.landingPage : `${HOST_ORIGIN}${bookData.landingPage.startsWith('/') ? '' : '/'}${bookData.landingPage}`;
    }
    if (queryShareId) {
      destUrl += (destUrl.includes('?') ? '&' : '?') + `share_id=${encodeURIComponent(queryShareId)}`;
    }
    
    const canonicalShareUrl = `${HOST_ORIGIN}/api/share?id=${encodeURIComponent(bookData.id || lpId)}${queryShareId ? '&share_id=' + encodeURIComponent(queryShareId) : ''}`;

    const userAgent = String(req.headers['user-agent'] || '');
    const isCrawler = isBotScraper(userAgent);
    const isWhatsApp = /WhatsApp/i.test(userAgent);

    // If requested by WhatsApp crawler and companion JPG exists, use JPG as primary for 100% preview reliability
    let primaryOgImage = finalOgImage;
    if (isWhatsApp && jpgFallbackUrl) {
      primaryOgImage = jpgFallbackUrl;
    }

    if (!isCrawler && !query.debug) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
      return res.redirect(302, destUrl);
    }

    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
    const cleanTitle = finalTitle;

    const isWebp = primaryOgImage.toLowerCase().endsWith('.webp');
    const isPng = primaryOgImage.toLowerCase().endsWith('.png');
    const imgMime = isWebp ? 'image/webp' : (isPng ? 'image/png' : 'image/jpeg');

    const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(cleanTitle)}</title>

  <!-- Open Graph / WhatsApp & Facebook Crawlers -->
  <meta property="fb:app_id" content="966242223397117">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Aarogyam India">
  <meta property="og:title" content="${escapeHtml(finalTitle)}">
  <meta property="og:description" content="${escapeHtml(finalDesc)}">
  <meta property="og:image" content="${escapeHtml(primaryOgImage)}">
  <meta property="og:image:url" content="${escapeHtml(primaryOgImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(primaryOgImage)}">
  <meta property="og:image:type" content="${imgMime}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(finalTitle)}">
  ${jpgFallbackUrl && jpgFallbackUrl !== primaryOgImage ? `<meta property="og:image" content="${escapeHtml(jpgFallbackUrl)}">
  <meta property="og:image:url" content="${escapeHtml(jpgFallbackUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(jpgFallbackUrl)}">
  <meta property="og:image:type" content="image/jpeg">` : ''}
  <meta property="og:url" content="${escapeHtml(canonicalShareUrl)}">
  <meta itemprop="image" content="${escapeHtml(primaryOgImage)}">
  <link rel="image_src" href="${escapeHtml(primaryOgImage)}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@AarogyamIndia">
  <meta name="twitter:title" content="${escapeHtml(finalTitle)}">
  <meta name="twitter:description" content="${escapeHtml(finalDesc)}">
  <meta name="twitter:image" content="${escapeHtml(primaryOgImage)}">
  <link rel="canonical" href="${escapeHtml(canonicalShareUrl)}">

  <!-- Instant Client-Side Redirection for human visitors -->
  <script>
    (function() {
      try {
        window.location.replace("${destUrl}");
      } catch (e) {}
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(destUrl)}">
  </noscript>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#FFFFFF;max-width:440px;width:90%;margin:20px auto;padding:28px 20px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);text-align:center;border:1px solid #E2E8F0;">
    <img src="https://aarogyamindia.online/images/logo/logo.png" alt="Aarogyam India" style="height:44px;margin-bottom:14px;object-fit:contain;">
    <h2 style="font-size:1.15rem;font-weight:800;color:#0F172A;margin:0 0 10px 0;line-height:1.35;">${escapeHtml(cleanTitle)}</h2>
    <p style="font-size:0.88rem;color:#475569;margin:0 0 20px 0;line-height:1.45;">${escapeHtml(finalDesc)}</p>
    <a href="${escapeHtml(destUrl)}" style="display:block;padding:14px;background:#0B7A3E;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:800;font-size:1rem;box-shadow:0 4px 12px rgba(11,122,62,0.3);">यहाँ क्लिक करके पूरी जानकारी देखें →</a>
    <div style="margin-top:16px;font-size:0.75rem;color:#94A3B8;">Aarogyam India • सुरक्षित व प्रामाणिक जानकारी</div>
  </div>
  <script>
    setTimeout(function() {
      try { window.location.href = "${destUrl}"; } catch(e) {}
    }, 150);
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // 2. Check if ID or Type represents a Webinar or AarogyamTube Video / Reel
  const wbOrVid = getWebinarOrVideoData(lpId, query.type || query.format, query);
  if (wbOrVid) {
    const finalTitle = (wbOrVid.title || queryTitle || 'AarogyamTube — कृषि वीडियो').trim();
    const finalDesc = (wbOrVid.description || queryDesc || 'AarogyamTube पर 1-मिनट के प्रैक्टिकल कृषि शॉर्ट्स एवं संपूर्ण मास्टरक्लास देखें।').slice(0, 200).trim();
    const rawImg = wbOrVid.image || `${HOST_ORIGIN}/images/banners/agriculture-hero-banner-1.webp`;
    const finalOgImage = rawImg.startsWith('http') ? rawImg : `${HOST_ORIGIN}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    
    let destUrl = wbOrVid.destUrl || `${HOST_ORIGIN}/webinar.html`;
    if (queryShareId) {
      destUrl += (destUrl.includes('?') ? '&' : '?') + `ref=${encodeURIComponent(queryShareId)}`;
    }
    
    const canonicalShareUrl = `${HOST_ORIGIN}/api/share?${wbOrVid.is_video ? 'type=video&id=' + encodeURIComponent(wbOrVid.id) : 'type=webinar'}${queryShareId ? '&ref=' + encodeURIComponent(queryShareId) : ''}`;

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const isWebp = finalOgImage.toLowerCase().endsWith('.webp');
    const isPng = finalOgImage.toLowerCase().endsWith('.png');
    const imgMime = isWebp ? 'image/webp' : (isPng ? 'image/png' : 'image/jpeg');

    const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(finalTitle)}</title>

  <!-- Open Graph / WhatsApp & Facebook Crawlers -->
  <meta property="fb:app_id" content="966242223397117">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="AarogyamTube">
  <meta property="og:title" content="${escapeHtml(finalTitle)}">
  <meta property="og:description" content="${escapeHtml(finalDesc)}">
  <meta property="og:image" content="${escapeHtml(finalOgImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(finalOgImage)}">
  <meta property="og:image:type" content="${imgMime}">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="720">
  <meta property="og:image:alt" content="${escapeHtml(finalTitle)}">
  <meta property="og:url" content="${escapeHtml(canonicalShareUrl)}">
  <link rel="image_src" href="${escapeHtml(finalOgImage)}">
  <meta itemprop="name" content="${escapeHtml(finalTitle)}">
  <meta itemprop="description" content="${escapeHtml(finalDesc)}">
  <meta itemprop="image" content="${escapeHtml(finalOgImage)}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@AarogyamIndia">
  <meta name="twitter:title" content="${escapeHtml(finalTitle)}">
  <meta name="twitter:description" content="${escapeHtml(finalDesc)}">
  <meta name="twitter:image" content="${escapeHtml(finalOgImage)}">
  <link rel="canonical" href="${escapeHtml(canonicalShareUrl)}">

  <!-- Instant Client-Side Redirection for human visitors -->
  <script>
    (function() {
      try {
        window.location.replace("${destUrl}");
      } catch (e) {}
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(destUrl)}">
  </noscript>
</head>
<body style="margin:0;padding:0;background:#0B1120;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#131E36;max-width:440px;width:90%;margin:20px auto;padding:28px 20px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.5);text-align:center;border:1px solid #334155;">
    <div style="display:inline-flex;align-items:center;gap:6px;background:#FF0000;color:#fff;padding:4px 12px;border-radius:8px;font-weight:900;font-size:0.85rem;margin-bottom:12px;">
      <span>▶</span> <span>AarogyamTube</span>
    </div>
    <h2 style="font-size:1.15rem;font-weight:800;color:#F8FAFC;margin:0 0 10px 0;line-height:1.35;">${escapeHtml(finalTitle)}</h2>
    <p style="font-size:0.88rem;color:#94A3B8;margin:0 0 20px 0;line-height:1.45;">${escapeHtml(finalDesc)}</p>
    <a href="${escapeHtml(destUrl)}" style="display:block;padding:14px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:800;font-size:1rem;box-shadow:0 4px 12px rgba(37,99,235,0.4);">AarogyamTube पर वीडियो देखें →</a>
    <div style="margin-top:16px;font-size:0.75rem;color:#64748B;">AarogyamTube • लाइव कृषि व डिजिटल लर्निंग</div>
  </div>
  <script>
    setTimeout(function() {
      try { window.location.href = "${destUrl}"; } catch(e) {}
    }, 150);
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // 3. Fetch record from Supabase if ID provided
  let lp = null;
  if (lpId) {
    try {
      lp = await fetchLandingPageFromSupabase(lpId);
    } catch (e) {
      console.warn('Supabase fetch notice:', e);
    }
  }

  // 2. Resolve Content Details
  const rawTitle = (lp?.title || queryTitle || 'Aarogyam India विशेष जानकारी').trim();
  const finalTitle = (lp?.og_title || rawTitle).trim();
  const finalDesc = (lp?.og_description || lp?.message || queryDesc || 'Aarogyam India में आपका स्वागत है। प्रामाणिक जानकारी, समाधान और परामर्श के लिए अभी देखें।').slice(0, 160).trim();
  const finalShareId = lp?.share_id || queryShareId || '';
  const finalCategory = lp?.category || queryCat || 'agriculture';

  // 3. Determine Media & Thumbnail
  let finalOgImage = DEFAULT_FALLBACK_IMAGE;

  const detectedYtId = extractYoutubeVideoId(queryYt) ||
                       extractYoutubeVideoId(lp?.media_url) ||
                       extractYoutubeVideoId(lp?.thumbnail_url) ||
                       extractYoutubeVideoId(queryThumb);

  const isYouTube = Boolean(detectedYtId || lp?.content_type === 'youtube');

  // Check if custom thumbnail (Base64 data URI) was uploaded
  const customThumbData = (lp?.thumbnail_url && lp.thumbnail_url.startsWith('data:image/'))
    ? lp.thumbnail_url
    : (lp?.media_url && lp.media_url.startsWith('data:image/'))
    ? lp.media_url
    : null;

  if (customThumbData) {
    // User explicitly uploaded custom thumbnail image: Served as real binary image by /api/image
    finalOgImage = `${HOST_ORIGIN}/api/image?id=${encodeURIComponent(lp?.id || lpId || 'default')}`;
  } else if (isYouTube && detectedYtId) {
    // YouTube Video Post: High-Quality reliable thumbnail directly from YouTube HQ CDN
    finalOgImage = `https://i.ytimg.com/vi/${detectedYtId}/hqdefault.jpg`;
  } else if (lp?.og_image_url && (lp.og_image_url.startsWith('http://') || lp.og_image_url.startsWith('https://')) && !lp.og_image_url.includes('farmer-community-banner')) {
    finalOgImage = lp.og_image_url;
  } else {
    const candidateImg = lp?.thumbnail_url || queryThumb;
    if (candidateImg && candidateImg.startsWith('data:image/')) {
      finalOgImage = `${HOST_ORIGIN}/api/image?id=${encodeURIComponent(lp?.id || lpId || 'default')}`;
    } else if (candidateImg && (candidateImg.startsWith('http://') || candidateImg.startsWith('https://')) && !candidateImg.includes('farmer-community-banner')) {
      finalOgImage = candidateImg;
    } else if (lp?.media_url && (lp.media_url.startsWith('http://') || lp.media_url.startsWith('https://'))) {
      // Dynamically extract real OG Image from Facebook / Instagram / Web link!
      try {
        const dynamicOg = await fetchOpenGraphImage(lp.media_url);
        if (dynamicOg) {
          finalOgImage = dynamicOg;
        } else {
          finalOgImage = DEFAULT_FALLBACK_IMAGE;
        }
      } catch (ogErr) {
        finalOgImage = DEFAULT_FALLBACK_IMAGE;
      }
    } else {
      finalOgImage = DEFAULT_FALLBACK_IMAGE;
    }
  }

  const WEBINAR_FALLBACK_IMAGE = 'https://aarogyamindia.online/images/banners/universal-zoom-webinar-og.jpg';

  if (!finalOgImage || finalOgImage === DEFAULT_FALLBACK_IMAGE) {
    if (finalCategory === 'webinar' || lp?.category === 'webinar' || query.webinar || lpId === 'WB_MASTER' || (lpId && lpId.startsWith('WB'))) {
      finalOgImage = WEBINAR_FALLBACK_IMAGE;
    }
  }

  // 4. Construct Clean Destination URL for Human Visitors
  const destParams = new URLSearchParams();
  if (lpId) destParams.set('id', lpId);
  if (finalShareId) destParams.set('ref', finalShareId);

  const isWebinarPage = finalCategory === 'webinar' || lp?.category === 'webinar' || query.webinar || lpId === 'WB_MASTER' || (lpId && lpId.startsWith('WB'));
  const destinationLandingUrl = isWebinarPage 
    ? `${HOST_ORIGIN}/webinar.html?${destParams.toString()}`
    : `${HOST_ORIGIN}/ucas/landing.html?${destParams.toString()}`;
  const canonicalShareUrl = `${HOST_ORIGIN}/api/share?id=${encodeURIComponent(lpId || '')}${finalShareId ? '&share_id=' + encodeURIComponent(finalShareId) : ''}`;

  const userAgent = String(req.headers['user-agent'] || '');
  const isCrawler = isBotScraper(userAgent);

  // 5. If Human Visitor, issue immediate 302 Redirect
  if (!isCrawler && !query.debug) {
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
    return res.redirect(302, destinationLandingUrl);
  }

  // 6. If Social Crawler (or in-app webview fallback), return Pre-Rendered RAW HTML with real OG tags + instant client redirect
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
  const cleanTitle = finalTitle.includes('Aarogyam India') ? finalTitle : `${finalTitle} — Aarogyam India`;

  const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(cleanTitle)}</title>

  <!-- Open Graph / WhatsApp & Facebook Crawlers -->
  <meta property="fb:app_id" content="966242223397117">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Aarogyam India">
  <meta property="og:title" content="${escapeHtml(finalTitle)}">
  <meta property="og:description" content="${escapeHtml(finalDesc)}">
  <meta property="og:image" content="${escapeHtml(finalOgImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(finalOgImage)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(finalTitle)}">
  <meta property="og:url" content="${escapeHtml(canonicalShareUrl)}">
  <link rel="image_src" href="${escapeHtml(finalOgImage)}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@AarogyamIndia">
  <meta name="twitter:title" content="${escapeHtml(finalTitle)}">
  <meta name="twitter:description" content="${escapeHtml(finalDesc)}">
  <meta name="twitter:image" content="${escapeHtml(finalOgImage)}">
  <link rel="canonical" href="${escapeHtml(canonicalShareUrl)}">

  <!-- Instant Client-Side Redirection for human visitors -->
  <script>
    (function() {
      try {
        window.location.replace("${destinationLandingUrl}");
      } catch (e) {}
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(destinationLandingUrl)}">
  </noscript>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#FFFFFF;max-width:440px;width:90%;margin:20px auto;padding:28px 20px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);text-align:center;border:1px solid #E2E8F0;">
    <img src="https://aarogyamindia.online/images/logo/logo.png" alt="Aarogyam India" style="height:44px;margin-bottom:14px;object-fit:contain;">
    <h2 style="font-size:1.15rem;font-weight:800;color:#0F172A;margin:0 0 10px 0;line-height:1.35;">${escapeHtml(cleanTitle)}</h2>
    <p style="font-size:0.88rem;color:#475569;margin:0 0 20px 0;line-height:1.45;">${escapeHtml(finalDesc)}</p>
    <a href="${escapeHtml(destinationLandingUrl)}" style="display:block;padding:14px;background:#0B7A3E;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:800;font-size:1rem;box-shadow:0 4px 12px rgba(11,122,62,0.3);">यहाँ क्लिक करके पूरी जानकारी देखें →</a>
    <div style="margin-top:16px;font-size:0.75rem;color:#94A3B8;">Aarogyam India • सुरक्षित व प्रामाणिक जानकारी</div>
  </div>
  <script>
    setTimeout(function() {
      try { window.location.href = "${destinationLandingUrl}"; } catch(e) {}
    }, 150);
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
  return res.status(200).send(html);
};
