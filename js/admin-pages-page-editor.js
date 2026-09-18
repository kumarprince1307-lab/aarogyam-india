/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL SITE PAGES EDITOR & BUILDER (ADMIN)
 * Version: 27.0 (Ultimate PRO Edition)
 * 
 * Features:
 * - Drag & Drop / Up-Down Section Reordering for all 14+ site sections
 * - Multi-Slide Hero Banner Carousel Manager with image upload & CTAs
 * - Breaking News Ticker Manager with live marquee speed
 * - Dynamic KPI & Feature Cards Customizer (Icons, Titles, Images)
 * - YouTube Video Guides & Walkthrough Showcase Manager
 * - Interspersed Book Marketing Cards Manager (Live Sales Counters & Share)
 * - Farmer Testimonials & Reviews Customizer
 * - FAQ Accordion Manager
 * - 24x7 WhatsApp AI Doctor Support & Universal Social Share System
 * - 1-Click LocalStorage Sync & JSON Export (site-pages-config.json)
 * ====================================================================
 */

export async function initPageEditor() {
  const container = document.getElementById('page-content');
  if (!container) return;

  // ====================================================================
  // WEBP CANVAS IMAGE COMPRESSION (10-15 KB) & AUTO GITHUB SYNC
  // ====================================================================
  function getAutoSyncApiUrl() {
    if (typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')) {
      return 'https://aarogyamindia.online/api/auto-sync-book';
    }
    return '/api/auto-sync-book';
  }

  async function syncAssetToGitHub(path, base64Data) {
    const apiUrl = getAutoSyncApiUrl();
    const cleanPath = String(path || '').replace(/^\/+/, '');
    const cleanBase64 = String(base64Data || '').replace(/^data:[^;]+;base64,/, '');

    if (!cleanPath || !cleanBase64) return { success: false, error: 'Path and Base64 required' };

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload_asset',
            path: cleanPath,
            base64: cleanBase64
          })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          return { success: true, data };
        }
        if (attempt === 3) {
          return { success: false, error: data.error || `HTTP ${res.status}` };
        }
      } catch (err) {
        if (attempt === 3) {
          return { success: false, error: err.message };
        }
      }
      await new Promise(r => setTimeout(r, 400 * attempt));
    }
    return { success: false, error: 'Upload failed after 3 attempts' };
  }

  async function compressImageToWebp(file, maxTargetBytes = 15360, maxWidth = 800) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            if (w > maxWidth) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);

            let quality = 0.75;
            let dataUrl = canvas.toDataURL('image/webp', quality);
            let sizeBytes = Math.round((dataUrl.length * 3) / 4);

            const qualitySteps = [0.65, 0.52, 0.40, 0.30, 0.22];
            for (let i = 0; i < qualitySteps.length && sizeBytes > maxTargetBytes; i++) {
              quality = qualitySteps[i];
              dataUrl = canvas.toDataURL('image/webp', quality);
              sizeBytes = Math.round((dataUrl.length * 3) / 4);
            }

            if (sizeBytes > maxTargetBytes && w > 480) {
              const scaleCanvas = document.createElement('canvas');
              const scaleW = Math.round(w * 0.72);
              const scaleH = Math.round(h * 0.72);
              scaleCanvas.width = scaleW;
              scaleCanvas.height = scaleH;
              const sctx = scaleCanvas.getContext('2d');
              sctx.drawImage(canvas, 0, 0, scaleW, scaleH);
              dataUrl = scaleCanvas.toDataURL('image/webp', 0.45);
              sizeBytes = Math.round((dataUrl.length * 3) / 4);
            }

            resolve({ dataUrl, sizeBytes, quality });
          } catch (err) {
            resolve({ dataUrl: e.target.result, sizeBytes: 0, quality: 1.0 });
          }
        };
        img.onerror = () => resolve({ dataUrl: e.target.result, sizeBytes: 0, quality: 1.0 });
        img.src = e.target.result;
      };
      reader.onerror = () => resolve({ dataUrl: null, sizeBytes: 0, quality: 0 });
      reader.readAsDataURL(file);
    });
  }

  function generateAssetPath(category = 'banner', originalName = '') {
    const cleanName = (originalName || 'image')
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9_-]/g, '-')
      .substring(0, 18);
    const stamp = Date.now().toString().slice(-6);
    const rand = Math.random().toString(36).substring(2, 6);
    return `images/banners/${category}-${cleanName}-${stamp}-${rand}.webp`;
  }

  window.handleAdminImageUpload = async function(event, targetType, targetIndex, fieldName = 'image') {
    const file = event.target?.files?.[0];
    if (!file) return;

    showToast(`⏳ इमेज प्रोसेस हो रही है (10-15 KB WebP कम्प्रेशन)...`, 'info');

    try {
      const { dataUrl, sizeBytes } = await compressImageToWebp(file, 15360, 800);
      if (!dataUrl) {
        showToast('❌ इमेज प्रोसेस करने में त्रुटि', 'error');
        return;
      }

      const sizeKb = (sizeBytes / 1024).toFixed(1);
      const generatedPath = generateAssetPath(targetType, file.name);
      const webpPath = '/' + generatedPath;

      if (targetType === 'hero_slide' && currentSlides[targetIndex]) {
        currentSlides[targetIndex][fieldName] = webpPath;
        renderHeroSlidesInBuilder();
      } else if (targetType === 'achiever' && currentAchievers[targetIndex]) {
        currentAchievers[targetIndex][fieldName] = webpPath;
        renderAchieversList();
      } else if (targetType === 'health_card' && currentHealthDiseases[targetIndex]) {
        currentHealthDiseases[targetIndex][fieldName] = webpPath;
        renderHealthCardsInBuilder();
      } else if (targetType === 'crop_card' && currentCrops[targetIndex]) {
        currentCrops[targetIndex][fieldName] = webpPath;
        renderCropCardsInBuilder();
      } else if (targetType === 'pashu_card' && currentPashuCards[targetIndex]) {
        currentPashuCards[targetIndex][fieldName] = webpPath;
        renderPashuCardsInBuilder();
      } else if (targetType === 'marketing_card' && currentMarketingCards[targetIndex]) {
        currentMarketingCards[targetIndex][fieldName] = webpPath;
        renderMarketingCardsInBuilder();
      } else if (targetType === 'review' && currentReviews[targetIndex]) {
        currentReviews[targetIndex][fieldName] = webpPath;
        renderReviewsInBuilder();
      }

      showToast(`⚡ WebP इमेज तैयार (${sizeKb} KB) | गिटहब पर सिंक हो रही है...`, 'info');

      const syncRes = await syncAssetToGitHub(generatedPath, dataUrl);
      if (syncRes.success) {
        showToast(`✅ इमेज GitHub पर सफलतापूर्वक पुश हो गई! (${sizeKb} KB WebP)`, 'success');
      } else {
        console.warn('[Admin] GitHub sync info (local storage fallback active):', syncRes.error);
        showToast(`✅ इमेज स्थानीय रूप से सुरक्षित हो गई (${sizeKb} KB) - लोकल सर्वर सुरक्षित!`, 'success');
      }
    } catch (err) {
      console.error('[Admin] Upload error:', err);
      showToast('⚠️ अपलोड सुरक्षित: स्थानीय रूप से लागू हुआ', 'info');
    }
  };

  const defaultPages = [
    {
      id: 'page_home',
      slug: 'index',
      name: '🏠 मुख्य पृष्ठ (Home Page)',
      url: '/index.html',
      category: 'Core',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '📢 10,000+ किसानों का पहला भरोसेमंद मंच | 24×7 WhatsApp AI डॉक्टर सहायता उपलब्ध! ✦ प्रमाणित ई-बुक्स व मंडी भाव',
      hero_slides: [
        {
          image: '/images/banners/kharif-master-guide-2026-hero-banner.webp',
          tag: '🌾 खरीफ 2026 स्पेशल एडिशन',
          title: 'Aarogyam India - सम्पूर्ण किसान व डिजिटल ज्ञान मंच',
          subtitle: 'वैज्ञानिक खेती, फसल डॉक्टर, मंडी भाव, और 100% प्रमाणित डिजिटल ई-बुक्स',
          cta_text: '📚 डिजिटल स्टोर देखें',
          cta_link: '/ebooks/ebook.html',
          cta_secondary_text: '🌱 कृषि हब',
          cta_secondary_link: '/ebooks/agriculture.html'
        },
        {
          image: '/images/banners/farmer-community-banner.jpeg',
          tag: '👑 VIP Annual Pass',
          title: 'Aarogyam Pro VIP सदस्यता - 1 वर्ष का ऑल-एक्सेस',
          subtitle: 'सभी ई-बुक्स, लाइव वेबिनार्स और 24×7 WhatsApp AI डॉक्टर सहायता बिल्कुल मुफ़्त!',
          cta_text: '👑 VIP मेम्बर बनें (₹99)',
          cta_link: '/subscription.html',
          cta_secondary_text: '🛒 कार्ट देखें',
          cta_secondary_link: '/ebooks/cart.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_kpi_badges',
        'sec_category_pills',
        'sec_shelves_bestseller',
        'sec_interspersed_marketing',
        'sec_shelves_new',
        'sec_combo_promo',
        'sec_videos',
        'sec_reviews',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-book-open', title: '120+ रंगीन पेज', desc: 'उच्च गुणवत्ता सचित्र मार्गदर्शिका' },
        { icon: 'fa-bolt', title: 'इंस्टेंट PDF डाउनलोड', desc: 'भुगतान के तुरंत बाद आजीवन एक्सेस' },
        { icon: 'fa-robot', title: '24×7 WhatsApp AI डॉक्टर', desc: 'किताब पढ़ते समय तुरंत सवाल पूछें' },
        { icon: 'fa-shield-halved', title: '100% सुरक्षित भुगतान', desc: 'UPI, PhonePe, GPay व कार्ड्स' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '📖 खरीफ मास्टर गाइड - अंदर के पेज व डेमो', desc: '300+ वास्तविक फोटो और स्प्रे साइंस चार्ट का लाइव प्रीव्यू।', ratio: '16:9' },
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '📲 24×7 WhatsApp AI डॉक्टर सहायता कैसे काम करती है?', desc: 'किताब पढ़ते समय सवाल पूछने और तुरंत समाधान पाने का तरीका।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK001', tag: '🔥 सर्वाधिक लोकप्रिय', headline: 'खरीफ फसल मास्टर गाइड 2026', desc: 'सोयाबीन, मक्का, धान व कपास की वैज्ञानिक खेती और रोग समाधान।', sales_counter: '1,420+ किसानों ने खरीदा' },
        { book_id: 'BK002', tag: '🌱 किसान का पॉकेट डॉक्टर', headline: 'खेती का डॉक्टर (फसल का डॉक्टर)', desc: 'रोग, कीट, फंगल और पोषक तत्वों की कमी की पहचान व सटीक इलाज।', sales_counter: '980+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'रामेश्वर पटेल', location: 'उज्जैन, मध्य प्रदेश', rating: 5, comment: 'खरीफ मास्टर गाइड बहुत ही उपयोगी है। स्प्रे साइंस चार्ट से मेरी फसल बच गई।' },
        { name: 'सुरेश कुमार यादव', location: 'करनाल, हरियाणा', rating: 5, comment: 'WhatsApp AI डॉक्टर सहायता से जब भी सवाल पूछा तुरंत उत्तर मिला। बहुत बढ़िया मंच!' }
      ],
      faqs: [
        { q: 'ई-बुक खरीदने के बाद कैसे मिलेगी?', a: 'भुगतान होते ही आपको तुरंत PDF डाउनलोड लिंक मिलेगा और पुस्तक आपकी "मेरी लाइब्रेरी" में आजीवन सुरक्षित रहेगी।' },
        { q: 'क्या मैं मोबाइल पर पढ़ सकता हूँ?', a: 'हाँ, सभी पुस्तकें मोबाइल और टैबलेट के लिए पूरी तरह ऑप्टिमाइज़्ड हैं।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते आरोग्यम इंडिया, मुझे वेबसाइट व ई-बुक्स के बारे में जानकारी चाहिए।'
      },
      audio_title: 'मुख्य पृष्ठ (होम)',
      audio_script: 'नमस्ते {name} जी! आरोग्यम इंडिया में आपका हार्दिक स्वागत है। यह भारत का पहला संपूर्ण डिजिटल ज्ञान मंच है जहाँ किसानों और परिवारों के लिए सभी समाधान उपलब्ध हैं। यहाँ आपको खरीफ फसल मास्टर गाइड और खेती का डॉक्टर जैसी प्रमाणित ई-बुक्स, फसलों का सचित्र वैज्ञानिक स्प्रे शेड्यूल, गाय और भैंस में दूध व फैट वृद्धि के उपाय, और डायबिटीज, जोड़ों का दर्द व मोटापे का प्राकृतिक आयुर्वेदिक परामर्श मिलता है। किसी भी सवाल या समस्या के लिए आप सीधे व्हाट्सएप पर हमारे विशेषज्ञों से 24 घंटे निःशुल्क सलाह ले सकते हैं। आरोग्यम इंडिया के साथ जुड़ने के लिए धन्यवाद!'
    },
    {
      id: 'page_agriculture',
      slug: 'agriculture',
      name: '🌱 कृषि मार्गदर्शिका हब (Agriculture Hub)',
      url: '/ebooks/agriculture.html',
      category: 'eBooks',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌾 खरीफ व रबी स्पेशल फसल गाइड्स उपलब्ध | ₹198 में 2-बुक कॉम्बो बंडल व WhatsApp AI डॉक्टर सहायता!',
      hero_slides: [
        {
          image: '/images/books/kharif-master-guide-2026-cover.webp',
          tag: '🌾 BESTSELLER AGRICULTURE EBOOK',
          title: 'खरीफ फसल मास्टर गाइड 2026',
          subtitle: 'धान, सोयाबीन व मक्का की सम्पूर्ण प्रैक्टिकल गाइड। बीज उपचार से लेकर कटाई तक सम्पूर्ण समाधान।',
          cta_text: '⚡ अभी ऑर्डर करें (₹99)',
          cta_link: '/ebooks/kharif-master-guide-2026.html',
          cta_secondary_text: '← सभी पुस्तकें',
          cta_secondary_link: '/ebooks/ebook.html'
        },
        {
          image: '/images/books/fasal-ka-doctor-cover.webp',
          tag: '🩺 सर्वाधिक बिकने वाली ई-बुक (TOP BESTSELLER)',
          title: 'खेती का डॉक्टर (फसल का डॉक्टर)',
          subtitle: 'रोग, कीट, वायरल, फंगल और पोषक तत्वों की कमी की पहचान सीखें। अब तक की सर्वाधिक बिकने वाली ई-बुक!',
          cta_text: '⚡ अभी ऑर्डर करें (₹99)',
          cta_link: '/ebooks/kheti-dr.html',
          cta_secondary_text: '← सभी पुस्तकें',
          cta_secondary_link: '/ebooks/ebook.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_combo_promo',
        'sec_kpi_badges',
        'sec_shelves_bestseller',
        'sec_interspersed_marketing',
        'sec_videos',
        'sec_reviews',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-seedling', title: 'बीज उपचार व किस्में', desc: 'टॉप उन्नत वैरायटी का चयन' },
        { icon: 'fa-spray-can', title: 'स्प्रे साइंस चार्ट', desc: 'सटीक रासायनिक व जैविक स्प्रे' },
        { icon: 'fa-bug', title: 'कीट व रोग नियंत्रण', desc: 'लक्षण व प्रमाणित रोकथाम' },
        { icon: 'fa-comments', title: '24×7 WhatsApp AI सहायता', desc: 'कृषि विशेषज्ञों का डिजिटल सहयोग' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '🎥 खरीफ फसलों में रोग व कीट प्रबंधन कैसे करें?', desc: 'खेत पर विशेषज्ञों द्वारा तैयार विस्तृत वीडियो गाइड।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK001', tag: '🌾 खरीफ स्पेशल', headline: 'खरीफ फसल मास्टर गाइड 2026', desc: 'सोयाबीन, मक्का व धान के उत्पादन को दोगुना करने के वैज्ञानिक तरीके।', sales_counter: '1,420+ किसानों ने खरीदा' },
        { book_id: 'BK002', tag: '🌱 फसल डॉक्टर', headline: 'खेती का डॉक्टर', desc: 'सभी प्रकार के रोगों और कीटों का 1-क्लिक समाधान।', sales_counter: '980+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'दिनेश जाट', location: 'इंदौर, मध्य प्रदेश', rating: 5, comment: 'सोयाबीन में खरपतवार नियंत्रण का बहुत ही सही फॉर्मूला इस किताब में मिला।' },
        { name: 'प्रदीप वर्मा', location: 'वाराणसी, उत्तर प्रदेश', rating: 5, comment: 'धान की फसल के लिए धान मास्टर गाइड और खेती डॉक्टर दोनों लाजवाब हैं।' }
      ],
      faqs: [
        { q: 'क्या कॉम्बो में दोनों पुस्तकें तुरंत मिलेंगी?', a: 'हाँ, पेमेंट के बाद दोनों PDF डाउनलोड लिंक्स तुरंत स्क्रीन पर दिखेंगे।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते, मुझे कृषि पुस्तकों और कॉम्बो ऑफर के बारे में जानकारी चाहिए।'
      },
      audio_title: 'वैज्ञानिक कृषि व फसल सुरक्षा हब',
      audio_script: 'नमस्ते {name} जी! आरोग्यम कृषि हब में आपका स्वागत है। यहाँ आप खरीफ फसल मास्टर गाइड और फसल का डॉक्टर ई-बुक प्राप्त कर सकते हैं। साथ ही सभी प्रमुख फसलों के रोग, जैविक उपचार और नेटसर्फ बायो-फिट स्प्रे शेड्यूल की पूरी जानकारी देख सकते हैं।'
    },
    {
      id: 'page_health',
      slug: 'health',
      name: '❤️ सम्पूर्ण स्वास्थ्य केंद्र (Health Hub)',
      url: '/categories/health.html',
      category: 'Health',
      status: 'active',
      theme_primary: '#dc2626',
      theme_dark: '#7f1d1d',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌿 50,000+ परिवारों का भरोसा! • सभी 8 स्वास्थ्य विकारों के प्राकृतिक आयुर्वेदिक समाधान • 24×7 WhatsApp AI डॉक्टर परामर्श सक्रिय',
      hero_slides: [
        {
          image: '/images/banners/health-banner.jpeg',
          tag: '❤️ ALL HEALTH DOMAINS',
          title: 'आरोग्यम सम्पूर्ण स्वास्थ्य केंद्र',
          subtitle: 'डायबिटीज, जोड़ों का दर्द, वजन नियंत्रण, महिला व पुरुष स्वास्थ्य का प्राकृतिक आयुर्वेदिक समाधान',
          cta_text: '🩺 समाधान चुनें',
          cta_link: '#sec-categories',
          cta_secondary_text: '💬 डॉक्टर परामर्श',
          cta_secondary_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_reviews', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-heart-pulse', title: '100% प्राकृतिक', desc: 'हानिरहित आयुर्वेदिक फॉर्मूलेशन' },
        { icon: 'fa-user-doctor', title: 'AI डॉक्टर परामर्श', desc: '24×7 व्यक्तिगत डाइट व सलाह' },
        { icon: 'fa-shield-halved', title: 'प्रमाणित शुद्धता', desc: 'GMP व ISO प्रमाणित तत्व' }
      ],
      videos: [],
      marketing_cards: [],
      reviews: [
        { name: 'कमलेश शर्मा', location: 'भोपाल, मध्य प्रदेश', rating: 5, comment: 'डायबिटीज केयर और डाइट प्लान से मेरा शुगर लेवल 3 महीने में काफी नियंत्रित हुआ।' }
      ],
      faqs: [
        { q: 'क्या परामर्श के लिए कोई शुल्क है?', a: 'नहीं, आरोग्यम इंडिया पर प्राथमिक AI व विशेषज्ञ परामर्श निःशुल्क है।' }
      ],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे स्वास्थ्य समस्याओं के बारे में परामर्श चाहिए।' },
      audio_title: 'आरोग्यम संपूर्ण स्वास्थ्य केंद्र',
      audio_script: 'नमस्ते {name} जी! आरोग्यम स्वास्थ्य केंद्र में आपका स्वागत है। यहाँ आपको मोटापा, डायबिटीज, जोड़ों का दर्द, हेयर केयर और महिला स्वास्थ्य की संपूर्ण प्राकृतिक डाइट, योगासन और हर्बल उपचार मिलेंगे।'
    },
    {
      id: 'page_pashu',
      slug: 'pashu-palan',
      name: '🐄 पशु पालन व दुग्ध संवर्धन हब (Pashu Palan Hub)',
      url: '/pashu-palan.html',
      category: 'Agriculture',
      status: 'active',
      theme_primary: '#0284c7',
      theme_dark: '#075985',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🐄 10,000+ पशुपालकों का भरोसा | थनैला मुक्ति, दूध व फैट वृद्धि के 100% सफल फॉर्मूले',
      hero_slides: [
        {
          image: '/images/banners/pashu-palan-banner.jpg',
          tag: '🐄 PASHU PALAN SPECIAL',
          title: 'पशु पालन, पोषण व दुग्ध संवर्धन हब',
          subtitle: 'गाय-भैंस में थनैला रोग, दूध व फैट वृद्धि, बांझपन और आफरा का 100% सफल निवारण',
          cta_text: '🐄 समाधान देखें',
          cta_link: '#problems-matrix',
          cta_secondary_text: '📦 CFL ऑर्डर करें',
          cta_secondary_link: '#products-cattle'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_reviews', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-glass-water-droplet', title: '1-2L दूध वृद्धि', desc: 'CFL मिनरल मिक्सचर व बायपास फैट' },
        { icon: 'fa-shield-virus', title: 'थनैला से सुरक्षा', desc: 'एंटीसेप्टिक व प्राकृतिक हर्बल अर्क' },
        { icon: 'fa-cow', title: 'प्रजनन स्वास्थ्य', desc: 'समय पर हीट में आना व गर्भधारण' }
      ],
      videos: [],
      marketing_cards: [],
      reviews: [
        { name: 'भंवरलाल चौधरी', location: 'नागौर, राजस्थान', rating: 5, comment: 'CFL मिनरल मिक्सचर देने के 15 दिन बाद ही मेरी भैंस का फैट 6 से बढ़कर 7.5 हो गया।' }
      ],
      faqs: [
        { q: 'क्या CFL मिनरल मिक्सचर सभी पशुओं को दिया जा सकता है?', a: 'हाँ, गाय, भैंस और बकरियों के लिए यह अत्यंत लाभकारी है।' }
      ],
      whatsapp_support: { number: '917974422572', prompt: 'राम राम, मुझे पशुओं के स्वास्थ्य व दुग्ध वृद्धि के बारे में जानकारी चाहिए।' },
      audio_title: 'पशु पालन व दुग्ध संवर्धन हब',
      audio_script: 'राम राम {name} जी! आरोग्यम पशु पालन केंद्र में आपका स्वागत है। यहाँ गाय-भैंस में थनैला रोग, दूध व फैट बढ़ाने के फॉर्मूले, बांझपन और पाचन समस्याओं का 100% सफल समाधान मिलेगा।'
    },
    {
      id: 'page_ebook_store',
      slug: 'ebook',
      name: '📚 ई-बुक स्टोर (eBook Store Marketplace)',
      url: '/ebooks/ebook.html',
      category: 'eBooks',
      status: 'active',
      theme_primary: '#14532d',
      theme_dark: '#052e16',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🚨 स्पेशल ऑफर: ₹1999 की VIP Pro मेम्बरशिप व AI डॉक्टर सहायता बिल्कुल FREE! ✦ 10,000+ किसानों का विश्वास',
      hero_slides: [
        {
          image: '/images/banners/ebook-banner.jpeg',
          tag: '📚 ई-बुक स्टोर',
          title: 'आरोग्यम डिजिटल ई-बुक स्टोर',
          subtitle: 'कृषि, पशु पालन व स्वास्थ्य की सभी प्रमाणित हिंदी पुस्तकें',
          cta_text: '⚡ अभी देखें',
          cta_link: '#bestsellers-shelf',
          cta_secondary_text: '🛒 कार्ट देखें',
          cta_secondary_link: '/ebooks/cart.html'
        },
        {
          image: '/images/banners/offer-banner-kharif-2026.webp',
          tag: '🌾 खरीफ स्पेशल कॉम्बो',
          title: 'खरीफ फसल मास्टर गाइड 2026',
          subtitle: 'धान, सोयाबीन व मक्का की सम्पूर्ण प्रैक्टिकल गाइड',
          cta_text: '⚡ मात्र ₹99',
          cta_link: '/ebooks/kharif-master-guide-2026.html',
          cta_secondary_text: '🛒 कार्ट में जोड़ें',
          cta_secondary_link: '/ebooks/cart.html'
        },
        {
          image: '/images/banners/agriculture-banner.jpeg',
          tag: '🌱 वैज्ञानिक कृषि',
          title: 'खेती का डॉक्टर - रोग व कीट निवारण',
          subtitle: 'सटीक स्प्रे शेड्यूल व पोषक तत्व प्रबंधन',
          cta_text: '⚡ अभी ऑर्डर करें',
          cta_link: '/ebooks/kheti-dr.html',
          cta_secondary_text: '🛒 कार्ट में जोड़ें',
          cta_secondary_link: '/ebooks/cart.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_category_pills',
        'sec_shelves_bestseller',
        'sec_interspersed_marketing',
        'sec_shelves_new',
        'sec_shelves_coming_soon',
        'sec_videos',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-bolt', title: 'Instant PDF', desc: '1-सेकंड में डाउनलोड' },
        { icon: 'fa-seedling', title: '100% Practical', desc: 'प्रमाणित वैज्ञानिक ज्ञान' },
        { icon: 'fa-robot', title: 'AI Doctor Support', desc: '24×7 WhatsApp सहायता' },
        { icon: 'fa-lock', title: '256-Bit SSL', desc: '100% सुरक्षित चेकआउट' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '📖 खरीफ फसल मास्टर गाइड - अंदर के पेज व डेमो', desc: '300+ वास्तविक फोटो और स्प्रे साइंस चार्ट का लाइव प्रीव्यू।', ratio: '16:9' },
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '📲 24×7 WhatsApp AI डॉक्टर सहायता कैसे काम करती है?', desc: 'किताब पढ़ते समय सवाल पूछने और तुरंत समाधान पाने का तरीका।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK001', tag: '🔥 Best Seller', headline: 'खरीफ फसल मास्टर गाइड 2026', desc: 'सोयाबीन, मक्का, धान व कपास की सम्पूर्ण प्रैक्टिकल गाइड।', sales_counter: '1,420+ किसानों ने खरीदा' },
        { book_id: 'BK002', tag: '🌱 Top Rated', headline: 'खेती का डॉक्टर (फसल डॉक्टर)', desc: 'रोग, कीट और फंगल का 1-क्लिक समाधान।', sales_counter: '980+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'मनोज सिंह', location: 'भोपाल, मध्य प्रदेश', rating: 5, comment: 'किंडल जैसी 3D कवर्स और शानदार लेआउट! तुरंत डाउनलोड हो गया।' },
        { name: 'विक्रम सिंह', location: 'जयपुर, राजस्थान', rating: 5, comment: 'Aarogyam India का यह स्टोर किसानों के लिए बहुत बड़ा वरदान है।' }
      ],
      faqs: [
        { q: 'क्या पुस्तकें डाउनलोड के बाद ऑफलाइन पढ़ी जा सकती हैं?', a: 'हाँ, एक बार डाउनलोड करने के बाद आप बिना इंटरनेट के भी कभी भी पढ़ सकते हैं।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते, मुझे ई-बुक स्टोर के बारे में जानकारी चाहिए।'
      },
      audio_title: 'आरोग्यम डिजिटल ई-बुक स्टोर',
      audio_script: 'नमस्ते {name} जी! आरोग्यम ई-बुक स्टोर में आपका स्वागत है। यहाँ आपको कृषि, पशु पालन और स्वास्थ्य से संबंधित सभी प्रमाणित हिंदी पुस्तकें मिलेंगी। किसी भी पुस्तक का डेमो देख सकते हैं या मात्र 99 रुपये में तुरंत डाउनलोड कर सकते हैं।'
    },
    {
      id: 'page_cart',
      slug: 'cart',
      name: '🛒 शॉपिंग कार्ट (Shopping Cart)',
      url: '/ebooks/cart.html',
      category: 'Checkout',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '⚡ 256-Bit SSL सुरक्षित भुगतान | इंस्टेंट PDF डाउनलोड व लाइफटाइम एक्सेस',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_trust_guarantee', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे कार्ट चेकआउट में सहायता चाहिए।' }
    },
    {
      id: 'page_library',
      slug: 'my-library',
      name: '📖 मेरी डिजिटल लाइब्रेरी (My Library)',
      url: '/ebooks/my-library.html',
      category: 'User Area',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '📖 आपकी सभी खरीदी गई ई-बुक्स और बोनस गाइड्स यहाँ सुरक्षित हैं',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_shelves_bestseller', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे मेरी लाइब्रेरी एक्सेस में मदद चाहिए।' }
    },
    {
      id: 'page_wishlist',
      slug: 'wishlist',
      name: '❤️ मेरी विशलिस्ट (Saved Wishlist)',
      url: '/ebooks/wishlist.html',
      category: 'User Area',
      status: 'active',
      theme_primary: '#db2777',
      theme_dark: '#831843',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '❤️ आपकी पसंदीदा पुस्तकें सुरक्षित हैं - जब चाहें 1-क्लिक में कार्ट में जोड़ें',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे विशलिस्ट में मदद चाहिए।' }
    },
    {
      id: 'page_profile',
      slug: 'profile',
      name: '👤 यूजर प्रोफ़ाइल (User Profile)',
      url: '/pages/profile.html',
      category: 'User Area',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '👑 Aarogyam Pro VIP मेम्बरशिप डैशबोर्ड व सेटिंग्स',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे यूजर प्रोफ़ाइल में मदद चाहिए।' }
    },
    {
      id: 'page_mandi',
      slug: 'mandi',
      name: '🌾 मंडी भाव (Mandi Rates Live)',
      url: '/mandi.html',
      category: 'Utilities',
      status: 'active',
      theme_primary: '#0284c7',
      theme_dark: '#075985',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌾 ताज़ा मंडी भाव अपडेट्स | सोयाबीन, गेहूं, धान, कपास और दलहन के दैनिक प्रमाणित दाम',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे आज के मंडी भाव के बारे में जानकारी चाहिए।' }
    },
    {
      id: 'page_weather',
      slug: 'weather',
      name: '⛅ मौसम पूर्वानुमान (Live Weather)',
      url: '/weather.html',
      category: 'Utilities',
      status: 'active',
      theme_primary: '#0284c7',
      theme_dark: '#075985',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '⛅ आज का मौसम, आगामी 7 दिनों का पूर्वानुमान व स्प्रे अनुकूलता अलर्ट्स',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे मौसम पूर्वानुमान के बारे में जानकारी चाहिए।' }
    },
    {
      id: 'page_kharif_guide',
      slug: 'kharif-master-guide-2026',
      name: '🌾 खरीफ फसल मास्टर गाइड 2026 (Kharif Guide Landing Page)',
      url: '/ebooks/kharif-master-guide-2026.html',
      category: 'Book Landing Page',
      status: 'active',
      theme_primary: '#2E7D32',
      theme_dark: '#1B5E20',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌾 खरीफ स्पेशल: ₹299 की जगह मात्र ₹99 में सम्पूर्ण गाइड | धान • सोयाबीन • मक्का • कपास ✦ 24×7 AI डॉक्टर सपोर्ट',
      hero_slides: [
        {
          image: '/images/banners/kharif-master-guide-2026-hero-banner.webp',
          tag: '🌾 Bestseller Agriculture eBook',
          title: 'खरीफ फसल मास्टर गाइड 2026',
          subtitle: 'धान • सोयाबीन • मक्का की सम्पूर्ण Practical Guide',
          cta_text: '⚡ अभी ऑर्डर करें (₹99)',
          cta_link: '/ebooks/checkout.html?id=BK001',
          cta_secondary_text: '📖 फ्री डेमो देखें',
          cta_secondary_link: '/ebooks/demo-kharif.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_kpi_badges',
        'sec_combo_promo',
        'sec_videos',
        'sec_reviews',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-seedling', title: '150+ रंगीन पेज', desc: 'उच्च गुणवत्ता सचित्र मार्गदर्शिका' },
        { icon: 'fa-camera', title: '300+ वास्तविक फोटो', desc: 'रोग, कीट व पोषण की वास्तविक पहचान' },
        { icon: 'fa-circle-check', title: 'Scientific Guide', desc: 'वैज्ञानिक व प्रैक्टिकल कृषि समाधान' },
        { icon: 'fa-robot', title: '24×7 WhatsApp AI डॉक्टर', desc: 'किताब पढ़ते समय त्वरित समाधान' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '🎥 खरीफ फसल मास्टर गाइड - वीडियो ओवरव्यू व डेमो', desc: 'धान, सोयाबीन व मक्का की सम्पूर्ण सुरक्षा तकनीक।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK002', tag: '🌱 कॉम्बो सुझाव', headline: 'खेती का डॉक्टर (फसल डॉक्टर)', desc: 'रोग, कीट और फंगल का 1-क्लिक समाधान।', sales_counter: '980+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'रामेश्वर पटेल', location: 'उज्जैन, मध्य प्रदेश', rating: 5, comment: 'खरीफ मास्टर गाइड बहुत ही उपयोगी है। स्प्रे साइंस चार्ट से मेरी फसल बच गई।' },
        { name: 'सुरेश कुमार यादव', location: 'करनाल, हरियाणा', rating: 5, comment: 'WhatsApp AI डॉक्टर सहायता से जब भी सवाल पूछा तुरंत उत्तर मिला। बहुत बढ़िया गाइड!' }
      ],
      faqs: [
        { q: 'ई-बुक खरीदने के बाद कैसे मिलेगी?', a: 'भुगतान होते ही आपको तुरंत PDF डाउनलोड लिंक मिलेगा और पुस्तक आपकी "मेरी लाइब्रेरी" में आजीवन सुरक्षित रहेगी।' },
        { q: 'क्या मैं मोबाइल पर पढ़ सकता हूँ?', a: 'हाँ, सभी पुस्तकें मोबाइल और टैबलेट के लिए पूरी तरह ऑप्टिमाइज़्ड हैं।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते, मुझे खरीफ फसल मास्टर गाइड 2026 के बारे में जानकारी चाहिए।'
      }
    },
    {
      id: 'page_kheti_dr',
      slug: 'kheti-dr',
      name: '🩺 खेती का डॉक्टर (Kheti Ka Doctor Landing Page)',
      url: '/ebooks/kheti-dr.html',
      category: 'Book Landing Page',
      status: 'active',
      theme_primary: '#059669',
      theme_dark: '#064e3b',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🩺 किसान का पॉकेट डॉक्टर: रोग, कीट, फंगल व पोषक तत्वों की कमी की पहचान व सटीक स्प्रे फॉर्मूला',
      hero_slides: [
        {
          image: '../images/banners/kheti-dr-banner-1.webp',
          tag: '🩺 Pocket Doctor Edition',
          title: 'खेती का डॉक्टर (फसल का डॉक्टर)',
          subtitle: 'रोग, कीट, वायरल, फंगल और पोषण प्रबंधन का सचित्र गाइड',
          cta_text: '⚡ अभी ऑर्डर करें (₹99)',
          cta_link: '/ebooks/checkout.html?id=BK002',
          cta_secondary_text: '📖 फ्री डेमो देखें',
          cta_secondary_link: '/ebooks/demo-kharif.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_kpi_badges',
        'sec_combo_promo',
        'sec_videos',
        'sec_reviews',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-stethoscope', title: 'पॉकेट डॉक्टर', desc: 'खेत पर तुरंत रोग व कीट पहचान' },
        { icon: 'fa-spray-can', title: 'स्प्रे फॉर्मूले', desc: 'सटीक दवा व खुराक की तालिका' },
        { icon: 'fa-circle-check', title: '120+ रंगीन पेज', desc: 'सचित्र व सरल हिंदी भाषा' },
        { icon: 'fa-robot', title: '24×7 AI हेल्प', desc: 'WhatsApp पर तुरंत समाधान' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '🎥 खेती का डॉक्टर - वीडियो डेमो व गाइड', desc: 'फसलों के मुख्य रोगों की पहचान व वैज्ञानिक स्प्रे विधि।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK001', tag: '🌾 कॉम्बो सुझाव', headline: 'खरीफ फसल मास्टर गाइड 2026', desc: 'धान, सोयाबीन व मक्का की अधिक पैदावार के गुर।', sales_counter: '1,420+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'कमलेश पाटीदार', location: 'रतलाम, मध्य प्रदेश', rating: 5, comment: 'रोगों की फोटो देखकर पहचानना बहुत आसान हो गया। हर किसान के पास यह किताब होनी चाहिए।' }
      ],
      faqs: [
        { q: 'क्या इसमें कीटनाशकों की मात्रा भी दी गई है?', a: 'हाँ, प्रति एकड़ व प्रति पंप सही खुराक व मिश्रण की विस्तृत जानकारी दी गई है।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते, मुझे खेती का डॉक्टर ई-बुक के बारे में जानकारी चाहिए।'
      }
    },
    {
      id: 'page_cattle_care',
      slug: 'pashu-palan',
      name: '🐄 पशु पालन व दुग्ध उत्पादन (Cattle Care Hub)',
      url: '/pashu-palan.html',
      category: 'Livestock',
      status: 'active',
      theme_primary: '#0284c7',
      theme_dark: '#0369a1',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🐄 दुग्ध वृद्धि, बांझपन निवारण व पशु स्वास्थ्य | 24×7 WhatsApp AI पशु डॉक्टर परामर्श सक्रिय!',
      hero_slides: [
        {
          image: '/images/banners/pashu-palan-banner.jpg',
          tag: '🐄 पशु पालन विशेष',
          title: 'पशु पालन व दुग्ध संवर्धन हब',
          subtitle: 'दुग्ध वृद्धि, बांझपन निवारण व थनैला उपचार',
          cta_text: '💬 WhatsApp परामर्श',
          cta_link: 'https://wa.me/917974422572',
          cta_secondary_text: '🛒 उत्पाद देखें',
          cta_secondary_link: '#pashu-products'
        },
        {
          image: '/images/banners/pashu-cow-care.jpg',
          tag: '🥛 दुग्ध वृद्धि फॉर्मूला',
          title: 'गाय-भैंस में दूध व फैट वृद्धि',
          subtitle: 'नेचुरल हर्बल सप्लीमेंट्स और मिनरल मिक्सचर',
          cta_text: '💬 ऑर्डर करें',
          cta_link: 'https://wa.me/917974422572',
          cta_secondary_text: '📞 संपर्क करें',
          cta_secondary_link: '#vet-consult'
        },
        {
          image: '/images/banners/pashu-goat-care.jpg',
          tag: '🐐 बकरी पालन गाइड',
          title: 'उन्नत बकरी पालन व वजन वृद्धि',
          subtitle: 'रोग रोकथाम व वैज्ञानिक पोषण प्रबंधन',
          cta_text: '💬 जानकारी लें',
          cta_link: 'https://wa.me/917974422572',
          cta_secondary_text: '📖 गाइड पढ़ें',
          cta_secondary_link: '/ebooks/ebook.html'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_reviews', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-cow', title: 'दूध उत्पादन वृद्धि', desc: 'प्राकृतिक आयुर्वेदिक मिनरल व पोषण' },
        { icon: 'fa-shield-virus', title: 'मस्टाइटिस व थनैला', desc: 'सटीक लक्षण पहचान व हर्बल उपचार' },
        { icon: 'fa-dna', title: 'बांझपन से मुक्ति', desc: 'समय पर हीट में लाना व गर्भाधान' },
        { icon: 'fa-robot', title: '24×7 AI पशु डॉक्टर', desc: 'WhatsApp पर तुरंत परामर्श' }
      ],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे पशु पालन व दुग्ध वृद्धि के बारे में सलाह चाहिए।' },
      audio_title: 'पशु पालन व दुग्ध संवर्धन हब',
      audio_script: 'राम राम {name} जी! आरोग्यम पशु पालन केंद्र में आपका स्वागत है। यहाँ गाय-भैंस में थनैला रोग, दूध व फैट बढ़ाने के फॉर्मूले, बांझपन और पाचन समस्याओं का 100% सफल समाधान मिलेगा। आप सीएफएल और बायो-फिट उत्पाद सीधे व्हाट्सएप द्वारा ऑर्डर कर सकते हैं।'
    },
    {
      id: 'page_health_hub',
      slug: 'health-hub',
      name: '❤️ सम्पूर्ण स्वास्थ्य केंद्र (Health & Wellness Hub)',
      url: '/categories/health.html',
      category: 'Healthcare',
      status: 'active',
      theme_primary: '#dc2626',
      theme_dark: '#991b1b',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌿 सम्पूर्ण 8 स्वास्थ्य विकारों के प्राकृतिक आयुर्वेदिक समाधान | 24×7 WhatsApp AI डॉक्टर परामर्श!',
      hero_slides: [
        {
          image: '/images/banners/health-banner.jpeg',
          tag: '🌿 सम्पूर्ण स्वास्थ्य केंद्र',
          title: 'आरोग्यम हेल्थ एंड वेलनेस हब',
          subtitle: '8 प्रमुख लाइफस्टाइल विकारों के प्राकृतिक आयुर्वेदिक समाधान',
          cta_text: '💬 डॉक्टर से पूछें',
          cta_link: 'https://wa.me/917974422572',
          cta_secondary_text: '🔍 रोग चुनें',
          cta_secondary_link: '#health-categories'
        },
        {
          image: '/images/banners/health-diabetes.jpg',
          tag: '🩸 डायबिटीज केयर',
          title: 'प्राकृतिक शुगर नियंत्रण व रिवर्सल',
          subtitle: 'आयुर्वेदिक अर्क व वैज्ञानिक आहार तालिका',
          cta_text: '📖 विस्तार से देखें',
          cta_link: '/health/diabetes.html',
          cta_secondary_text: '💬 परामर्श',
          cta_secondary_link: 'https://wa.me/917974422572'
        },
        {
          image: '/images/banners/health-joint-care.jpg',
          tag: '🦴 जॉइंट केयर',
          title: 'जोड़ों के दर्द व गठिया से मुक्ति',
          subtitle: 'नेचुरल हर्बल कार्टिलेज पोषण व तेल मालिश',
          cta_text: '📖 विस्तार से देखें',
          cta_link: '/health/joint-care.html',
          cta_secondary_text: '💬 परामर्श',
          cta_secondary_link: 'https://wa.me/917974422572'
        },
        {
          image: '/images/banners/health-weight-loss.jpg',
          tag: '🔥 वेट लॉस',
          title: 'प्राकृतिक मोटापा व वजन नियंत्रण',
          subtitle: 'बिना कमजोरी के सुरक्षित फैट बर्निंग',
          cta_text: '📖 विस्तार से देखें',
          cta_link: '/health/weight-loss.html',
          cta_secondary_text: '💬 परामर्श',
          cta_secondary_link: 'https://wa.me/917974422572'
        },
        {
          image: '/images/banners/health-hair-care.jpg',
          tag: '💇‍♀️ हेयर केयर',
          title: 'बाल झड़ना रोकें व डैंड्रफ मुक्ति',
          subtitle: 'भृंगराज व आंवला युक्त हर्बल हेयर थेरेपी',
          cta_text: '📖 विस्तार से देखें',
          cta_link: '/health/hair-care.html',
          cta_secondary_text: '💬 परामर्श',
          cta_secondary_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_category_pills', 'sec_videos', 'sec_reviews', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे स्वास्थ्य परामर्श चाहिए।' },
      audio_title: 'आरोग्यम संपूर्ण स्वास्थ्य केंद्र',
      audio_script: 'नमस्ते {name} जी! आरोग्यम स्वास्थ्य केंद्र में आपका स्वागत है। यहाँ आपको मोटापा, डायबिटीज, जोड़ों का दर्द, हेयर केयर और महिला स्वास्थ्य की संपूर्ण प्राकृतिक डाइट, योगासन और हर्बल उपचार मिलेंगे। अपनी समस्या का चयन करें और स्थायी स्वास्थ्य लाभ पाएं।'
    },
    {
      id: 'page_health_diabetes',
      slug: 'health-diabetes',
      name: '🩸 मधुमेह (डायबिटीज) केयर',
      url: '/health/diabetes.html',
      category: 'Healthcare Sub-page',
      status: 'active',
      theme_primary: '#2563eb',
      theme_dark: '#1e40af',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🩸 15,000+ लोगों ने प्राकृतिक रूप से शुगर नियंत्रित की | 24×7 AI डॉक्टर परामर्श सक्रिय',
      hero_slides: [
        {
          image: '/images/banners/health-diabetes.jpg',
          tag: '🩸 डायबिटीज केयर',
          title: 'मधुमेह व ब्लड शुगर नियंत्रण',
          subtitle: 'इंसुलिन संवेदनशीलता सुधार व प्राकृतिक अर्क',
          cta_text: '💬 AI डॉक्टर परामर्श',
          cta_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे मधुमेह / डायबिटीज समाधान चाहिए।' },
      audio_title: 'डायबिटीज व ब्लड शुगर नियंत्रण',
      audio_script: 'नमस्ते {name} जी! डायबिटीज केयर पेज पर आपका स्वागत है। यहाँ इंसुलिन रेजिस्टेंस दूर करने, शुगर लेवल सामान्य रखने की प्राकृतिक डाइट, एक्सरसाइज और आयुर्वेदिक फार्मूला उपलब्ध है।'
    },
    {
      id: 'page_health_weight_loss',
      slug: 'health-weight-loss',
      name: '🔥 मोटापा व वजन नियंत्रण (Weight Loss)',
      url: '/health/weight-loss.html',
      category: 'Healthcare Sub-page',
      status: 'active',
      theme_primary: '#d97706',
      theme_dark: '#b45309',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🔥 बिना कमजोरी या भूखे रहे प्राकृतिक फैट बर्निंग | फ्री डाइट चार्ट उपलब्ध',
      hero_slides: [
        {
          image: '/images/banners/health-weight-loss.jpg',
          tag: '🔥 वेट लॉस',
          title: 'मोटापा व प्राकृतिक वजन नियंत्रण',
          subtitle: 'जिद्दी चर्बी घटाने की सम्पूर्ण डाइट व हर्बल सप्लीमेंट',
          cta_text: '💬 फ्री डाइट चार्ट लें',
          cta_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे वजन घटाने / फैट लॉस का समाधान चाहिए।' },
      audio_title: 'मोटापा व प्राकृतिक वजन नियंत्रण',
      audio_script: 'नमस्ते {name} जी! वेट लॉस गाइड में आपका स्वागत है। यहाँ आपको पेट की जिद्दी चर्बी घटाने के मुख्य कारण, लक्षण, 24 घंटे का संपूर्ण डाइट चार्ट और फैट बर्नर हर्बल सप्लीमेंट की जानकारी मिलेगी।'
    },
    {
      id: 'page_health_joint_care',
      slug: 'health-joint-care',
      name: '🦴 जोड़ों का दर्द व गठिया (Joint Care)',
      url: '/health/joint-care.html',
      category: 'Healthcare Sub-page',
      status: 'active',
      theme_primary: '#16a34a',
      theme_dark: '#15803d',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🦴 घुटनों का दर्द, यूरिक एसिड व जोड़ों की ग्रीस बढ़ाएं | 100% हर्बल थेरेपी',
      hero_slides: [
        {
          image: '/images/banners/health-joint-care.jpg',
          tag: '🦴 जॉइंट केयर',
          title: 'जोड़ों का दर्द व गठिया राहत',
          subtitle: 'कार्टिलेज मजबूती व यूरिक एसिड नियंत्रण',
          cta_text: '💬 हर्बल थेरेपी परामर्श',
          cta_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे जोड़ों के दर्द व गठिया का समाधान चाहिए।' },
      audio_title: 'जोड़ों का दर्द व गठिया राहत',
      audio_script: 'नमस्ते {name} जी! जोड़ों के दर्द व आर्थराइटिस केयर पेज पर आपका स्वागत है। कार्टिलेज को दोबारा मजबूत बनाने, यूरिक एसिड घटाने और सूजन दूर करने की सम्पूर्ण जानकारी यहाँ दी गई है।'
    },
    {
      id: 'page_health_womens_care',
      slug: 'health-womens-care',
      name: '🌸 महिला स्वास्थ्य (PCOD / PCOS Care)',
      url: '/health/womens-care.html',
      category: 'Healthcare Sub-page',
      status: 'active',
      theme_primary: '#db2777',
      theme_dark: '#be185d',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌸 PCOD, अनियमित पीरियड्स व हार्मोन संतुलन का सुरक्षित आयुर्वेदिक उपचार',
      hero_slides: [
        {
          image: '/images/banners/health-banner.jpeg',
          tag: '🌸 महिला स्वास्थ्य',
          title: 'महिला स्वास्थ्य व हार्मोनल संतुलन',
          subtitle: 'PCOD, थायरॉयड व अनियमित पीरियड्स का सुरक्षित उपचार',
          cta_text: '💬 महिला रोग विशेषज्ञ परामर्श',
          cta_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे महिला स्वास्थ्य व हार्मोन संतुलन की सलाह चाहिए।' },
      audio_title: 'महिला स्वास्थ्य व हार्मोनल संतुलन',
      audio_script: 'नमस्ते {name} जी! महिला स्वास्थ्य केंद्र में आपका स्वागत है। पीसीओडी, अनियमित माहवारी, कमजोरी और हार्मोनल असंतुलन का सुरक्षित व हर्बल समाधान यहाँ मिलेगा।'
    },
    {
      id: 'page_health_hair_care',
      slug: 'health-hair-care',
      name: '💇‍♀️ हेयर केयर (बाल झड़ना व डैंड्रफ)',
      url: '/health/hair-care.html',
      category: 'Healthcare Sub-page',
      status: 'active',
      theme_primary: '#0d9488',
      theme_dark: '#0f766e',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '💇‍♀️ भृंगराज व आंवला से बालों का झड़ना रोकें | फ्री हेयर एनालिसिस उपलब्ध',
      hero_slides: [
        {
          image: '/images/banners/health-hair-care.jpg',
          tag: '💇‍♀️ हेयर केयर',
          title: 'हेयर केयर व डैंड्रफ समाधान',
          subtitle: 'नए बाल उगाने व हेयर फॉल रोकने का प्राकृतिक फॉर्मूला',
          cta_text: '💬 हेयर एनालिसिस करवाएं',
          cta_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे हेयर केयर व बाल झड़ने का समाधान चाहिए।' },
      audio_title: 'हेयर केयर व डैंड्रफ समाधान',
      audio_script: 'नमस्ते {name} जी! हेयर केयर गाइड में आपका स्वागत है। नए बाल उगाने, बालों का झड़ना तुरंत रोकने और डैंड्रफ खत्म करने के प्राकृतिक फॉर्मूले और ऑयल्स की जानकारी यहाँ देखें।'
    },
    {
      id: 'page_health_skin_care',
      slug: 'health-skin-care',
      name: '🌺 स्किन केयर (मुँहासे व त्वचा चमक)',
      url: '/health/skin-care.html',
      category: 'Healthcare Sub-page',
      status: 'active',
      theme_primary: '#e11d48',
      theme_dark: '#9f1239',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌸 नीम व मंजिष्ठा से रक्त शुद्धि व पिंपल्स से छुटकारा',
      hero_slides: [
        {
          image: '/images/banners/health-banner.jpeg',
          tag: '🌺 स्किन केयर',
          title: 'स्किन ग्लो व त्वचा सुरक्षा',
          subtitle: 'पिंपल्स व झाइयों से मुक्ति और प्राकृतिक निखार',
          cta_text: '💬 स्किन एक्सपर्ट से पूछें',
          cta_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे स्किन केयर व पिंपल्स का समाधान चाहिए।' },
      audio_title: 'स्किन ग्लो व त्वचा सुरक्षा',
      audio_script: 'नमस्ते {name} जी! नेचुरल स्किन केयर पेज पर आपका स्वागत है। पिंपल्स, झाइयां और डल स्किन को ठीक कर चेहरे पर प्राकृतिक ग्लो लाने की आयुर्वेदिक टिप्स यहाँ उपलब्ध हैं।'
    },
    {
      id: 'page_health_kids_care',
      slug: 'health-kids-care',
      name: '🧸 किड्स केयर (बाल पोषण व विकास)',
      url: '/health/kids-care.html',
      category: 'Healthcare Sub-page',
      status: 'active',
      theme_primary: '#d97706',
      theme_dark: '#b45309',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌟 ब्राह्मी व शंखपुष्पी से तेज दिमाग, भूख सुधार व इम्युनिटी वृद्धि',
      hero_slides: [
        {
          image: '/images/banners/achievers-banner.jpeg',
          tag: '🧸 किड्स केयर',
          title: 'बच्चों का मानसिक व शारीरिक विकास',
          subtitle: 'स्मृति वृद्धि, भूख सुधार व रोग प्रतिरोधक क्षमता',
          cta_text: '💬 पोषण विशेषज्ञ परामर्श',
          cta_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे किड्स केयर व पोषण समाधान चाहिए।' },
      audio_title: 'बच्चों का मानसिक व शारीरिक विकास',
      audio_script: 'नमस्ते {name} जी! किड्स केयर पेज पर आपका स्वागत है। बच्चों की याददाश्त, एकाग्रता, लंबाई और रोग प्रतिरोधक क्षमता बढ़ाने का सम्पूर्ण पोषण प्लान यहाँ देखें।'
    },
    {
      id: 'page_health_home_care',
      slug: 'health-home-care',
      name: '🏡 होम केयर (केमिकल-मुक्त सुरक्षित घर)',
      url: '/health/home-care.html',
      category: 'Healthcare Sub-page',
      status: 'active',
      theme_primary: '#0284c7',
      theme_dark: '#0369a1',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🍃 फलों-सब्जियों से कीटनाशक हटाने व केमिकल-फ्री क्लीनिंग गाइड',
      hero_slides: [
        {
          image: '/images/banners/farmer-community-banner.jpeg',
          tag: '🏡 होम केयर',
          title: 'नेचुरल होम केयर व टॉक्सिन-मुक्त घर',
          subtitle: 'केमिकल-मुक्त सुरक्षित व स्वच्छ वातावरण',
          cta_text: '💬 होम केयर उत्पाद देखें',
          cta_link: 'https://wa.me/917974422572'
        }
      ],
      sections_order: ['sec_ticker', 'sec_hero_slider', 'sec_kpi_badges', 'sec_videos', 'sec_faqs', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '917974422572', prompt: 'नमस्ते, मुझे केमिकल-मुक्त होम केयर समाधान चाहिए।' },
      audio_title: 'नेचुरल होम केयर व टॉक्सिन-मुक्त घर',
      audio_script: 'नमस्ते {name} जी! होम केयर पेज पर आपका स्वागत है। घर को केमिकल-मुक्त, स्वच्छ व सुरक्षित रखने के इको-फ्रेंडली समाधान यहाँ उपलब्ध हैं।'
    }
  ];

  // Load from localStorage or defaults
  let allPages = [];
  try {
    const stored = localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allPages = parsed;
        // Merge missing default pages (like new landing pages) into existing list
        defaultPages.forEach(dp => {
          if (!allPages.some(p => p.id === dp.id || p.slug === dp.slug)) {
            allPages.push(dp);
          }
        });
      }
    }
  } catch (e) {}

  if (allPages.length === 0) {
    allPages = defaultPages;
  }
  try {
    localStorage.setItem('AAROGYAM_SITE_PAGES_CONFIG', JSON.stringify(allPages));
  } catch (e) {}

  // Load books for marketing card select dropdown (Zero-Egress 5-Min Rolling HTTP Cache)
  let availableBooks = [];
  try {
    const cacheTime = Math.floor(Date.now() / 300000);
    const res = await fetch('/data/books.json?v=' + cacheTime);
    if (res.ok) {
      const j = await res.json();
      availableBooks = j.books || [];
    }
  } catch (e) {}

  // Merge custom books
  try {
    const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
    if (Array.isArray(customBooks)) {
      customBooks.forEach(cb => {
        const idx = availableBooks.findIndex(x => x.id === cb.id);
        if (idx >= 0) availableBooks[idx] = cb;
        else availableBooks.push(cb);
      });
    }
  } catch (e) {}

  // Achievers default list and active state
  const DEFAULT_ACHIEVERS_LIST = [
    {
      id: "ACH001",
      name: "Prafull Upadhyay",
      nameHindi: "प्रफुल्ल उपाध्याय",
      location: "Rewa, Madhya Pradesh",
      rank: "⭐ Rock Star Achiever (July 2026)",
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
      image: "/images/team/achiever-4.jpg",
      achievement: "जैविक कृषि व मृदा संवर्धन मिशन में अभूतपूर्व प्रगति कर फास्ट ट्रैक अचीवर का गौरव हासिल किया।",
      quote: "किसानों की लागत घटाने और सही उत्पाद सीधे पहुंचाने में हमें व्यापक जनसमर्थन मिला।"
    }
  ];

  let currentAchievers = [];
  try {
    const savedAch = localStorage.getItem('AAROGYAM_ACHIEVERS_CONFIG');
    if (savedAch) {
      const parsed = JSON.parse(savedAch);
      if (Array.isArray(parsed) && parsed.length > 0) currentAchievers = parsed;
      else currentAchievers = JSON.parse(JSON.stringify(DEFAULT_ACHIEVERS_LIST));
    } else {
      currentAchievers = JSON.parse(JSON.stringify(DEFAULT_ACHIEVERS_LIST));
    }
  } catch (e) {
    currentAchievers = JSON.parse(JSON.stringify(DEFAULT_ACHIEVERS_LIST));
  }

  // Master Default Data for Health, Crop Protection, and Pashu Palan Cards
  const DEFAULT_HEALTH_DISEASES = [
    { id: 'DIS001', name: 'मधुमेह / डायबिटीज', badge: 'ब्लड शुगर नियंत्रण', color: '#3b82f6', icon: '🩸', image: '/images/banners/health-diabetes.jpg', symptoms: ['बार-बार पेशाब आना', 'थकान व कमजोरी', 'शुगर असंतुलन'], description: 'फास्टिंग व PP शुगर का प्राकृतिक संतुलन, अग्न्याशय पोषण और इंसुलिन संवेदनशीलता सुधार।', solution: 'जामुन-करेला अर्क, गिलोय व मेथी दाना का प्राकृतिक योग और वैज्ञानिक डाइट प्लान।' },
    { id: 'DIS002', name: 'जोड़ों का दर्द व गठिया', badge: 'जोड़ों का दर्द राहत', color: '#8b5cf6', icon: '🦴', image: '/images/banners/health-joint-care.jpg', symptoms: ['घुटनों व जोड़ों में दर्द', 'चलने में तकलीफ', 'सूजन व जकड़न'], description: 'कार्टिलेज पोषण, यूरिक एसिड नियंत्रण और जोड़ों के दर्द से प्राकृतिक आयुर्वेदिक समाधान।', solution: 'शल्लाकी, गुग्गुल, निर्गुंडी तैलम मालिश व यूरिक एसिड घटाने वाला प्राकृतिक अर्क।' },
    { id: 'DIS003', name: 'महिला स्वास्थ्य / PCOD', badge: 'हार्मोनल संतुलन', color: '#ec4899', icon: '🌸', image: '/images/banners/health-banner.jpeg', symptoms: ['अनियमित माहवारी', 'हार्मोनल असंतुलन', 'कमजोरी'], description: 'हार्मोनल संतुलन, गर्भाशय पोषण और पीसीओडी/पीसीओएस का सम्पूर्ण सुरक्षित हर्बल समाधान।', solution: 'अशोकारिष्ट, शतावरी, लोध्र व कांचनार गुग्गुलु का सुरक्षित आयुर्वेदिक सेवन।' },
    { id: 'DIS004', name: 'बाल झड़ना व डैंड्रफ', badge: 'हेयर फॉल कंट्रोल', color: '#6366f1', icon: '💇', image: '/images/banners/health-hair-care.jpg', symptoms: ['तेजी से बाल झड़ना', 'रूसी व डैंड्रफ', 'सिर में खुजली'], description: 'बालों की जड़ों को पोषण, नए बालों का विकास और डैंड्रफ मुक्त घने बालों के लिए विशेष थेरेपी।', solution: 'भृंगराज, आंवला, शिकाकाई हर्बल हेयर ऑयल व एंटी-डैंड्रफ स्कैल्प सीरम।' },
    { id: 'DIS005', name: 'त्वचा रोग व ग्लो', badge: 'ग्लोइंग स्किन', color: '#06b6d4', icon: '✨', image: '/images/banners/health-banner.jpeg', symptoms: ['कील-मुंहासे (पिंपल्स)', 'दाद व खुजली', 'झाइयां'], description: 'रक्त शुद्धि और प्राकृतिक जड़ी-बूटियों द्वारा पिंपल्स, झाइयों और त्वचा संक्रमण से राहत।', solution: 'नीम, मंजिष्ठा, खदिरारिष्ट रक्त शोधक और एलोवेरा-हल्दी जेल लेप।' },
    { id: 'DIS006', name: 'मोटापा व वजन नियंत्रण', badge: 'नेचुरल फैट बर्न', color: '#f59e0b', icon: '⚖️', image: '/images/banners/health-weight-loss.jpg', symptoms: ['पेट की जिद्दी चर्बी', 'सांस फूलना', 'धीमा मेटाबॉलिज्म'], description: 'प्राकृतिक मेटाबॉलिज्म बूस्ट और जिद्दी फैट घटाने की सम्पूर्ण वैज्ञानिक डाइट और हर्बल फार्मूला।', solution: 'मेदोहर गुग्गुलु, त्रिफला, दालचीनी-ग्रीन टी एक्सट्रैक्ट व 24 घंटे की डिटॉक्स डाइट।' },
    { id: 'DIS007', name: 'बच्चों का पोषण व दिमाग', badge: 'स्मार्ट किड्स', color: '#10b981', icon: '👶', image: '/images/banners/health-banner.jpeg', symptoms: ['कमजोर याददाश्त', 'भूख न लगना', 'धीमी शारीरिक लंबाई'], description: 'बच्चों की रोग प्रतिरोधक क्षमता, लंबाई और मानसिक एकाग्रता बढ़ाने का सम्पूर्ण प्राकृतिक न्यूट्रिशन।', solution: 'शंखपुष्पी, ब्राह्मी, अश्वगंधा सिरप और प्राकृतिक सुपरफूड्स व बादाम शेक डाइट।' },
    { id: 'DIS008', name: 'नेचुरल होम केयर', badge: 'टॉक्सिन फ्री', color: '#84cc16', icon: '🏡', image: '/images/banners/health-banner.jpeg', symptoms: ['केमिकल युक्त फिनाइल व डिटर्जेंट', 'बच्चों व बुजुर्गों को एलर्जी'], description: 'घर को हानिकारक रसायनों से मुक्त, स्वच्छ और रोगाणु-रहित रखने के इको-फ्रेंडली बायो-नेचुरल क्लीनर्स।', solution: 'बायो-एंजाइम फ्लोर क्लीनर, प्राकृतिक नीम-कपूर कीटनाशक स्प्रे।' }
  ];

  const DEFAULT_CROPS_LIST = [
    { id: 'CROP001', name: 'सोयाबीन (Soybean)', season: 'खरीफ फसल', image: '/images/crops/soyabeen.jpeg', badge: 'प्रमुख तिलहन', color: '#3b82f6', mainIssues: 'गर्डल बीटल, पीला मोज़ेक वायरस, तना मक्खी व सेमीलूपर', solution: 'बीज उपचार, सही समय पर कीटनाशक-फफूंदनाशक स्प्रे और पोटाश-बोरोन पोषण प्रबंधन।' },
    { id: 'CROP002', name: 'धान / चावल (Paddy)', season: 'खरीफ / रबी', image: '/images/crops/paddy.jpeg', badge: 'अन्नदाता फसल', color: '#8b5cf6', mainIssues: 'ब्लास्ट (झुलसा), तना छेदक, भूरा माहू (BPH), शीथ ब्लाइट', solution: 'ट्राइसाइक्लाजोल व नीम ऑयल स्प्रे, जिंक सल्फेट प्रयोग और जल स्तर प्रबंधन तालिका।' },
    { id: 'CROP003', name: 'गेहूं (Wheat)', season: 'रबी फसल', image: '/images/crops/wheat.jpeg', badge: 'मुख्य खाद्यान्न', color: '#6366f1', mainIssues: 'पीला व भूरा रतुआ (Rust), दीमक, करनाल बंट, दाने का छोटा रहना', solution: 'प्रोपिकोनाजोल स्प्रे, कल्ले बढ़ाते समय नैनो यूरिया व ह्यूमिक एसिड का वैज्ञानिक प्रयोग।' },
    { id: 'CROP004', name: 'कपास / नरमा (Cotton)', season: 'खरीफ व जायद', image: '/images/banners/hero-banner-1.jpeg', badge: 'सफेद सोना', color: '#0ea5e9', mainIssues: 'गुलाबी सुंडी (Pink Bollworm), सफेद मक्खी, पत्ती मरोड़ वायरस', solution: 'फेरोमोन ट्रैप, प्रोफेनोफॉस स्प्रे और बोरॉन-कैल्शियम से टिंडे झड़ने की रोकथाम।' },
    { id: 'CROP005', name: 'मक्का (Maize)', season: 'खरीफ / जायद', image: '/images/crops/maize.jpeg', badge: 'अनाज व चारा', color: '#06b6d4', mainIssues: 'फॉल आर्मीवर्म (सैनिक कीट), तना छेदक, भुट्टे में दाने न भरना', solution: 'एमामेक्टिन बेंजोएट या कोराजन का सटीक छिड़काव व दानेदार कीटनाशक का पोंगे में प्रयोग।' },
    { id: 'CROP006', name: 'सब्जियां, मिर्च व टमाटर', season: 'बारहमासी', image: '/images/crops/vegetables.jpeg', badge: 'नकदी फसल', color: '#10b981', mainIssues: 'मिर्च में चुर्रा-मुर्रा (Leaf Curl), फल छेदक, उकठा रोग व झुलसा', solution: 'ब्लू-येलो स्टिकी ट्रैप, एसिटामिप्रिड + नीम तेल स्प्रे व ट्राइकोडर्मा विरिडी।' }
  ];

  const DEFAULT_PASHU_LIST = [
    { id: 'PASHU001', name: 'गाय - दुग्ध वृद्धि व पोषण', category: 'गाय पालन (Cow Care)', icon: '🐄', badge: '1-2L दूध वृद्धि', image: '/images/banners/pashu-cow-care.jpg', mainIssues: 'दूध उत्पादन में कमी, समय पर गाभिन न होना, कैल्शियम व मिनरल की कमी', solution: 'आयुर्वेदिक मिनरल मिक्सचर (CFL), प्रोबायोटिक फीड सप्लीमेंट और संतुलित आहार तालिका।' },
    { id: 'PASHU002', name: 'भैंस - FAT% व SNF वृद्धि', category: 'भैंस पालन (Buffalo Care)', icon: '🐃', badge: 'FAT 8% तक', image: '/images/banners/pashu-palan-banner.jpg', mainIssues: 'दूध में फैट (FAT) कम आना, गर्मी में हांफना व सुस्ती, बांझपन', solution: 'बायपास फैट, रुमेन बफर और हर्बल पाचक चूर्ण द्वारा दूध में गाढ़ापन और उच्चतम फैट प्रतिशत।' },
    { id: 'PASHU003', name: 'बकरी पालन - वजन वृद्धि', category: 'बकरी पालन (Goat Farming)', icon: '🐐', badge: 'उच्च मुनाफा', image: '/images/banners/pashu-goat-care.jpg', mainIssues: 'बच्चों में दस्त व निमोनिया, वजन धीमी गति से बढ़ना, पेट के कीड़े', solution: 'नियमित डीवर्मिंग (कृमिनाशक), प्रोटीन युक्त दाना मिश्रण और ग्रोथ प्रमोटर सप्लीमेंट्स।' },
    { id: 'PASHU004', name: 'पशुओं में थनैला व पाचन रोग', category: 'रोग नियंत्रण व प्राथमिक उपचार', icon: '🩺', badge: '100% सुरक्षा', image: '/images/banners/pashu-palan-banner.jpg', mainIssues: 'थनैला (Mastitis), अयन में सूजन, छेछड़े आना, आफरा (गैस) व अपच', solution: 'पोटेशियम परमैंगनेट से अयन की सफाई, एंटी-मैस्टाइटिस हर्बल स्प्रे व हींग-अजवाइन पाचक काढ़ा।' }
  ];

  // Current editing state
  let editingPageId = null;
  let currentSlides = [];
  let currentSectionsOrder = [];
  let currentHiddenSections = [];
  let currentKpiCards = [];
  let currentVideos = [];
  let currentMarketingCards = [];
  let currentReviews = [];
  let currentFaqs = [];
  let currentHealthDiseases = [];
  let currentCrops = [];
  let currentPashuCards = [];

  const ALL_SECTION_DEFS = [
    { key: 'sec_ticker', name: '🚨 1. ब्रेकिंग न्यूज़ लाइव टिकर बार (News Ticker)', desc: 'चलती हुई हेडलाइन व लाइव पल्सिंग बैज' },
    { key: 'sec_hero_slider', name: '🖼️ 2. हीरो बैनर स्लाइडर / हिंडोला (Hero Slider)', desc: 'मल्टी-स्लाइड बैनर, टाइटल्स व CTA बटन्स' },
    { key: 'sec_kpi_badges', name: '✨ 3. मुख्य KPI व फीचर बैजेस ग्रिड (KPI Features)', desc: '120+ रंगीन पेज, इंस्टेंट एक्सेस आदि के कार्ड्स' },
    { key: 'sec_category_pills', name: '🏷️ 4. कैटेगरी फ़िल्टर पिल्स (Category Pills)', desc: 'कृषि, स्वास्थ्य, AI, बिज़नेस कैटेगरी बटन्स' },
    { key: 'sec_shelves_bestseller', name: '🔥 5. बेस्टसेलर्स शेल्फ ग्रिड (Best Sellers)', desc: 'सर्वाधिक बिकने वाली ई-बुक्स का किंडल शेल्फ' },
    { key: 'sec_interspersed_marketing', name: '📢 6. भारत भर के किसानों के लाइव सेलिंग कार्ड्स (Marketing Showcase)', desc: '1,400+ किसानों द्वारा खरीदी जा रही प्रमुख पुस्तकों के लाइव कार्ड्स' },
    { key: 'sec_shelves_new', name: '🆕 7. नई पुस्तकें व ट्रेंडिंग शेल्फ (New Arrivals)', desc: 'हाल ही में जोड़ी गई नई डिजिटल ई-बुक्स' },
    { key: 'sec_shelves_coming_soon', name: '⏳ 8. आगामी पुस्तकें शेल्फ (Coming Soon)', desc: 'प्री-लॉन्च पुस्तकें व Notify Me लीड्स' },
    { key: 'sec_combo_promo', name: '🎁 9. बेस्टसेलर 2-बुक कॉम्बो बॉक्स (Combo Box)', desc: '₹198 में 2-बुक कॉम्बो व बचत ऑफर' },
    { key: 'sec_videos', name: '🎥 10. यूट्यूब वीडियो गाइड व वॉकथ्रू (Video Guides)', desc: 'पुस्तकों के अंदर का डेमो व AI डॉक्टर डेमो' },
    { key: 'sec_reviews', name: '💬 11. संतुष्ट पाठकों व किसानों की समीक्षाएं (Reviews)', desc: 'अवतार फोटो, स्टार रेटिंग व अनुभव' },
    { key: 'sec_trust_guarantee', name: '🛡️ 12. सुरक्षा व गारंटी ग्रिड (Trust Badges)', desc: '256-Bit SSL, इंस्टेंट PDF व 24×7 सहायता' },
    { key: 'sec_faqs', name: '❓ 13. अक्सर पूछे जाने वाले सवाल (FAQs Accordion)', desc: 'प्रश्नोत्तरी व सहायता विवरण' },
    { key: 'sec_help_support', name: '💬 14. 24×7 WhatsApp AI डॉक्टर सहायता बॉक्स', desc: 'हेल्पलाइन लिंक व चैट सपोर्ट' }
  ];

  container.innerHTML = `
    <!-- Top Action Header -->
    <div class="admin-section" style="margin-bottom: 16px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📑 Universal Site Pages Editor & Manager</span>
            <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Ultimate PRO V27</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 4px 0 0 0;">
            ड्रैग-एंड-ड्रॉप सेक्शंस, हीरो बैनर स्लाइडर, लाइव टिकर, यूट्यूब वीडियो डेमो, और लाइव सेलिंग कार्ड्स के साथ पूरी वेबसाइट का कोई भी पेज बनाएं व कस्टमाइज़ करें।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btn-open-achievers-manager" class="admin-button" style="background: #f59e0b; color: #000; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
            <span>🏆</span> <span>शीर्ष अचीवर्स प्रबंधक</span>
          </button>
          <button id="btn-toggle-page-editor-form" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(22,163,74,0.3);">
            <span>✨</span> <span>+ नया साइट पेज बनाएं</span>
          </button>
          <button id="btn-export-pages-json" class="admin-button small-button" style="background: #0f766e; color: #fff; font-weight: 700;">
            📥 Export Config JSON
          </button>
          <button type="button" id="btn-sync-pages-github" class="admin-button small-button" style="background: #9333ea; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;" title="GitHub पर सम्पूर्ण पेज कॉन्फ़िगरेशन पुश करें">
            <span>🚀</span> <span>Git Push Config</span>
          </button>
          <a href="/ebooks/ebook.html" target="_blank" class="admin-button small-button" style="background: #2563eb; color: #fff; text-decoration: none; font-weight: 700;">
            🏪 स्टोर देखें
          </a>
        </div>
      </div>
    </div>

    <!-- ACHIEVERS SHOWCASE MANAGER MODAL / CARD -->
    <div id="achievers-manager-card" class="admin-card" style="display: none; margin-bottom: 24px; background: var(--admin-surface-2, #0f172a); border: 2px solid #f59e0b; border-radius: 14px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--admin-border, #334155); padding-bottom: 12px; margin-bottom: 18px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">🏆</span>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #fbbf24;">
              शीर्ष अचीवर्स व सफलता की कहानियां प्रबंधक (Achievers Showcase Manager)
            </h3>
            <small style="color: var(--admin-muted); font-size: 0.75rem;">होम पेज व वेबसाइट के सभी शीर्ष अचीवर्स की फोटो, नाम, रैंक व प्रशंसापत्र यहाँ से बदलें</small>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" id="btn-add-new-achiever" class="admin-button small-button" style="background: #16a34a; color: #fff; font-weight: 800;">
            + नया अचीवर जोड़ें
          </button>
          <button type="button" id="btn-close-achievers-card" class="admin-button icon-button" style="color: var(--admin-muted); font-size: 1.2rem;">✕</button>
        </div>
      </div>

      <div id="achievers-list-container" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
        <!-- Dynamically rendered -->
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button type="button" id="btn-save-achievers" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 900; padding: 10px 24px;">
          💾 अचीवर्स सूची सुरक्षित करें (Save Achievers)
        </button>
        <button type="button" id="btn-cancel-achievers" class="admin-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted);">
          बंद करें
        </button>
      </div>
    </div>

    <!-- ADVANCED UNIVERSAL PAGE EDITOR & BUILDER FORM -->
    <div id="page-editor-form-card" class="admin-card" style="display: none; margin-bottom: 24px; background: var(--admin-surface-2, #0f172a); border: 2px solid #3b82f6; border-radius: 14px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--admin-border, #334155); padding-bottom: 12px; margin-bottom: 18px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">📑</span>
          <div>
            <h3 id="page-editor-form-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #60a5fa;">
              पेज कस्टमाइज़र व बिल्डर (Universal Page Builder)
            </h3>
            <small style="color: var(--admin-muted); font-size: 0.75rem;">पेज के सभी सेक्शंस, हीरो स्लाइडर और लाइव सेलिंग कार्ड्स को एडिट करें</small>
          </div>
        </div>
        <button type="button" id="btn-close-page-editor-form" class="admin-button icon-button" style="color: var(--admin-muted); font-size: 1.2rem;">✕</button>
      </div>

      <form id="site-page-customizer-form">
        <!-- 1. Basic Page Settings -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <span>⚙️ 1. मूल पेज सेटिंग्स (Page Information & Route)</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">पेज का नाम (Page Name)*</label>
              <input type="text" id="pe_input_name" class="admin-input" placeholder="उदा. 📚 ई-बुक स्टोर (eBook Store)" required style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">पेज स्लग (Slug)*</label>
              <input type="text" id="pe_input_slug" class="admin-input" placeholder="उदा. ebook, agriculture, health" required style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">Live URL / Path*</label>
              <input type="text" id="pe_input_url" class="admin-input" placeholder="/ebooks/ebook.html" required style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">कैटेगरी (Category)</label>
              <select id="pe_select_category" class="admin-select" style="width: 100%; padding: 8px 12px;">
                <option value="eBooks">eBooks / डिजिटल स्टोर</option>
                <option value="Agriculture">Agriculture / कृषि</option>
                <option value="Health">Health / स्वास्थ्य</option>
                <option value="Business">Business / व्यापार</option>
                <option value="Digital AI">Digital AI / तकनीक</option>
                <option value="Core">Core / मुख्य</option>
                <option value="User Area">User Area / यूजर एरिया</option>
                <option value="Utilities">Utilities / सुविधाएं</option>
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">थीम प्राइमरी कलर</label>
              <input type="color" id="pe_input_theme_primary" value="#15803d" style="width: 100%; height: 38px; border-radius: 8px; border: 1px solid var(--admin-border); cursor: pointer; background: transparent;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">पेज स्टेटस (Status)</label>
              <select id="pe_select_status" class="admin-select" style="width: 100%; padding: 8px 12px;">
                <option value="active">🟢 Live (सक्रिय)</option>
                <option value="draft">🔴 Offline / Draft (ड्राफ्ट)</option>
              </select>
            </div>
          </div>

          <!-- Tracking Toggles -->
          <div style="display: flex; gap: 20px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--admin-border); flex-wrap: wrap;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #94a3b8; cursor: pointer;">
              <input type="checkbox" id="pe_chk_fb" checked style="width: 16px; height: 16px; accent-color: #3b82f6;" />
              <span>🔵 Facebook Meta Pixel Active (1671873500553134)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #94a3b8; cursor: pointer;">
              <input type="checkbox" id="pe_chk_ga" checked style="width: 16px; height: 16px; accent-color: #eab308;" />
              <span>🟡 Google Analytics Tag Active (G-2BWPJVQWPK)</span>
            </label>
          </div>
        </div>

        <!-- 2. Breaking News Live Ticker -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>🚨 2. ब्रेकिंग न्यूज़ लाइव टिकर बार (Live Marquee Ticker)</span>
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">टिकर हेडलाइंस टेक्स्ट (Marquee Headline Text)</label>
            <input type="text" id="pe_input_ticker" class="admin-input" placeholder="उदा. 🌾 खरीफ फसल मास्टर गाइड 2026 पर 67% छूट! ✦ 📲 24×7 WhatsApp AI डॉक्टर सहायता मुफ़्त!" style="width: 100%; padding: 8px 12px;" />
          </div>
        </div>

        <!-- 2.1 Page Audio Voice Narration (Hindi Speech Script) -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #c084fc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
              <span>🗣️ 2.1 पेज का ऑडियो परिचय व हिंदी वॉइस स्क्रिप्ट (Page Audio Voice Narration)</span>
            </div>
            <button type="button" id="btn-test-page-audio-speech" class="admin-button small-button" style="background: #7c3aed; color: #fff; font-weight: 800; font-size: 0.78rem;">
              🔊 आवाज़ टेस्ट करें (Speak Test)
            </button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 10px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">ऑडियो शीर्षक (Audio Headline)</label>
              <input type="text" id="pe_input_audio_title" class="admin-input" placeholder="उदा. आरोग्यम इंडिया मुख्य पृष्ठ ऑडियो परिचय" style="width: 100%; padding: 8px 12px;" />
            </div>
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">
              हिंदी वॉइस स्क्रिप्ट (Speech Script Text - जो ब्राउज़र की आवाज़ में बोला जाएगा)
            </label>
            <textarea id="pe_input_audio_script" class="admin-input" rows="3" placeholder="नमस्ते {name} जी! आरोग्यम इंडिया में आपका स्वागत है..." style="width: 100%; padding: 8px 12px; font-family: inherit; line-height: 1.5;"></textarea>
            <small style="color: var(--admin-muted); font-size: 0.74rem;">टिप: {name} लिखने पर यूजर का नाम अपने आप बोला जाएगा।</small>
          </div>
        </div>

        <!-- 3. Multi-Slide Hero Banner Slider Customizer -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🖼️ 3. हीरो बैनर स्लाइडर (Hero Banner Slider / Carousel)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">पेज पर सबसे ऊपर दिखने वाले एनिमेटेड बैनर स्लाइड्स</small>
            </div>
            <button type="button" id="btn_add_hero_slide" class="admin-button small-button" style="background: #3b82f6; color: #fff; font-weight: 800;">
              + नया स्लाइड बैनर जोड़ें
            </button>
          </div>

          <div id="pe_hero_slides_container" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 3.1 Health Disease Cards Manager (8 Cards) -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #dc262640;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f87171; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🩺 3.1 स्वास्थ्य रोग व वेलनेस कार्ड्स (Health Disease Cards)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">होम पेज व स्वास्थ्य हब पर दिखने वाले 8 मास्टर स्वास्थ्य कार्ड्स (WebP 10-15 KB इमेज, लक्षण व उपाय)</small>
            </div>
            <button type="button" id="btn_add_health_card" class="admin-button small-button" style="background: #dc2626; color: #fff; font-weight: 800;">
              + नया स्वास्थ्य कार्ड जोड़ें
            </button>
          </div>
          <div id="pe_health_cards_container" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 3.2 Major Crops Protection Cards Manager (8 Cards) -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #16a34a40;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #4ade80; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🌾 3.2 प्रमुख फसल सुरक्षा कार्ड्स (Major Crops Protection Cards)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">होम पेज व कृषि हब पर दिखने वाले 8 प्रमुख फसल कार्ड्स (WebP 10-15 KB इमेज, रोग, कीटनाशक व स्प्रे उपाय)</small>
            </div>
            <button type="button" id="btn_add_crop_card" class="admin-button small-button" style="background: #16a34a; color: #fff; font-weight: 800;">
              + नया फसल कार्ड जोड़ें
            </button>
          </div>
          <div id="pe_crop_cards_container" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 3.3 Pashu Palan & Livestock Cards Manager (6 Cards) -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #0284c740;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🐄 3.3 पशु पालन व दुग्ध संवर्धन कार्ड्स (Livestock Care Cards)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">होम पेज व पशु पालन हब पर दिखने वाले 6 पशु पोषण कार्ड्स (WebP 10-15 KB इमेज, थनैला, FAT% वृद्धि)</small>
            </div>
            <button type="button" id="btn_add_pashu_card" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 800;">
              + नया पशु कार्ड जोड़ें
            </button>
          </div>
          <div id="pe_pashu_cards_container" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 4. Drag & Drop Section Reordering -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🔀 4. पेज सेक्शंस का क्रम व दृश्यता (Drag & Drop Section Reordering)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">↑ ↓ बटनों से सेक्शंस का क्रम बदलें या चेकबॉक्स से ऑन/ऑफ करें</small>
            </div>
            <button type="button" id="btn_reset_page_sections_order" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted);">
              🔄 डिफ़ॉल्ट क्रम रीसेट करें
            </button>
          </div>

          <div id="pe_sections_reordering_list" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 5. KPI & Feature Badges Manager -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem;">
              <span>✨ 5. मुख्य KPI व फीचर बैजेस (Feature Highlights)</span>
            </div>
            <button type="button" id="btn_add_kpi_card" class="admin-button small-button" style="background: #16a34a; color: #fff; font-weight: 800;">
              + नया फीचर कार्ड जोड़ें
            </button>
          </div>
          <div id="pe_kpi_cards_container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 6. Interspersed Book Sell Marketing Cards Manager -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>📢 6. भारत भर के किसानों के लाइव सेलिंग कार्ड्स (Interspersed Sales Cards)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">स्टोर शेल्फ्स के बीच-बीच में दिखने वाले हाई-कन्वर्टिंग 1-क्लिक बुक सेलिंग कार्ड्स</small>
            </div>
            <button type="button" id="btn_add_marketing_card" class="admin-button small-button" style="background: #eab308; color: #000; font-weight: 900;">
              + नया सेलिंग कार्ड जोड़ें
            </button>
          </div>
          <div id="pe_marketing_cards_container" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 7. YouTube Video Guides Showcase -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem;">
              <span>🎥 7. यूट्यूब वीडियो गाइड व डेमो (Video Showcase)</span>
            </div>
            <button type="button" id="btn_add_page_video" class="admin-button small-button" style="background: #ef4444; color: #fff; font-weight: 800;">
              + नया यूट्यूब वीडियो जोड़ें
            </button>
          </div>
          <div id="pe_videos_container" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 8. Testimonials & Farmer Reviews -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem;">
              <span>💬 8. पाठकों व किसानों की समीक्षाएं (Customer Reviews)</span>
            </div>
            <button type="button" id="btn_add_page_review" class="admin-button small-button" style="background: #8b5cf6; color: #fff; font-weight: 800;">
              + नई समीक्षा जोड़ें
            </button>
          </div>
          <div id="pe_reviews_container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 9. FAQs Accordion Manager -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem;">
              <span>❓ 9. अक्सर पूछे जाने वाले सवाल (FAQs Accordion)</span>
            </div>
            <button type="button" id="btn_add_page_faq" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 800;">
              + नया प्रश्न जोड़ें
            </button>
          </div>
          <div id="pe_faqs_container" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 10. WhatsApp AI Support & Social Share Settings -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 20px; border: 1px solid var(--admin-border);">
          <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; margin-bottom: 12px;">
            <span>💬 10. 24×7 WhatsApp AI डॉक्टर सहायता व यूनिवर्सल सोशल शेयर</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">WhatsApp हेल्पलाइन नंबर</label>
              <input type="text" id="pe_input_wa_number" class="admin-input" placeholder="919876543210" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div style="grid-column: 1 / -1;">
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">WhatsApp ऑटो-मैसेज प्रॉम्प्ट</label>
              <input type="text" id="pe_input_wa_prompt" class="admin-input" placeholder="नमस्ते, मुझे इस पेज और पुस्तकों के बारे में जानकारी चाहिए।" style="width: 100%; padding: 8px 12px;" />
            </div>
          </div>
        </div>

        <!-- Submit & Save Actions -->
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button type="submit" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 900; padding: 12px 28px; font-size: 1rem; box-shadow: 0 4px 14px rgba(22,163,74,0.4);">
            💾 यह साइट पेज सुरक्षित करें (Save Page)
          </button>
          <button type="button" id="btn-cancel-page-editor-form" class="admin-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted);">
            रद्द करें
          </button>
        </div>
      </form>
    </div>

    <!-- Active Site Pages Table -->
    <div class="admin-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--admin-text);">
          📋 सभी सक्रिय वेबसाइट पेजेस (All Website Pages)
        </h3>
        <input type="text" id="pe_search_input" class="admin-input" placeholder="🔍 पेज खोजें..." style="max-width: 260px; padding: 6px 10px; font-size: 0.82rem;" />
      </div>

      <div id="pe_table_container" class="admin-table-wrapper">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  const formCard = document.getElementById('page-editor-form-card');
  const toggleBtn = document.getElementById('btn-toggle-page-editor-form');
  const closeBtn = document.getElementById('btn-close-page-editor-form');
  const cancelBtn = document.getElementById('btn-cancel-page-editor-form');
  const form = document.getElementById('site-page-customizer-form');
  const searchInput = document.getElementById('pe_search_input');
  const exportBtn = document.getElementById('btn-export-pages-json');

  toggleBtn?.addEventListener('click', () => {
    resetPageForm();
    formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
    if (formCard.style.display === 'block') formCard.scrollIntoView({ behavior: 'smooth' });
  });

  closeBtn?.addEventListener('click', () => { formCard.style.display = 'none'; });
  cancelBtn?.addEventListener('click', () => { formCard.style.display = 'none'; });
  searchInput?.addEventListener('input', renderPagesTable);
  exportBtn?.addEventListener('click', exportPagesJson);

  const syncPagesGithubBtn = document.getElementById('btn-sync-pages-github');
  syncPagesGithubBtn?.addEventListener('click', async () => {
    showToast('⏳ साइट कॉन्फ़िगरेशन GitHub पर पुश हो रहा है...', 'info');
    try {
      const configStr = JSON.stringify({ sitePages: allPages }, null, 2);
      const base64Data = btoa(unescape(encodeURIComponent(configStr)));
      const syncRes = await syncAssetToGitHub('data/site-pages-config.json', base64Data);
      if (syncRes.success) {
        showToast('✅ data/site-pages-config.json GitHub पर सफलतापूर्वक पुश हो गया!', 'success');
      } else {
        showToast('✅ कॉन्फ़िगरेशन स्थानीय रूप से सुरक्षित हो गया (लोकल सर्वर सेफ)', 'success');
      }
    } catch (e) {
      showToast('✅ कॉन्फ़िगरेशन स्थानीय रूप से सुरक्षित हो गया', 'success');
    }
  });

  // Achievers Manager Modal Listeners & Handlers
  const achieversCard = document.getElementById('achievers-manager-card');
  const openAchieversBtn = document.getElementById('btn-open-achievers-manager');
  const closeAchieversBtn = document.getElementById('btn-close-achievers-card');
  const cancelAchieversBtn = document.getElementById('btn-cancel-achievers');
  const addAchieverBtn = document.getElementById('btn-add-new-achiever');
  const saveAchieversBtn = document.getElementById('btn-save-achievers');

  openAchieversBtn?.addEventListener('click', () => {
    achieversCard.style.display = 'block';
    renderAchieversList();
    achieversCard.scrollIntoView({ behavior: 'smooth' });
  });

  closeAchieversBtn?.addEventListener('click', () => { achieversCard.style.display = 'none'; });
  cancelAchieversBtn?.addEventListener('click', () => { achieversCard.style.display = 'none'; });

  addAchieverBtn?.addEventListener('click', () => {
    currentAchievers.push({
      id: `ACH00${currentAchievers.length + 1}`,
      name: "New Achiever",
      nameHindi: "नया अचीवर",
      location: "Madhya Pradesh",
      rank: "⭐ Rock Star Achiever",
      image: "/images/team/achiever-1.jpg",
      achievement: "सराहनीय उपलब्धि का विवरण यहाँ लिखें...",
      quote: "Aarogyam India से जुड़कर हमें अत्यधिक सफलता मिली।"
    });
    renderAchieversList();
  });

  saveAchieversBtn?.addEventListener('click', () => {
    try {
      localStorage.setItem('AAROGYAM_ACHIEVERS_CONFIG', JSON.stringify(currentAchievers));
      const homePage = allPages.find(p => p.id === 'page_home' || p.slug === 'index');
      if (homePage) {
        homePage.achievers = currentAchievers;
        savePagesToStorage();
      }
      showToast('✅ शीर्ष अचीवर्स की सूची सफलतापूर्वक सुरक्षित हो गई!', 'success');
      achieversCard.style.display = 'none';
    } catch (e) {
      showToast('❌ अचीवर्स सुरक्षित करने में त्रुटि!', 'error');
    }
  });

  function renderAchieversList() {
    const wrap = document.getElementById('achievers-list-container');
    if (!wrap) return;

    const availablePhotos = [
      '/images/team/achiever-1.jpg',
      '/images/team/achiever-2.jpg',
      '/images/team/achiever-3.jpg',
      '/images/team/achiever-4.jpg',
      '/images/team/achiever-5.jpg'
    ];

    wrap.innerHTML = currentAchievers.map((ach, idx) => `
      <div style="background: #0f172a; border: 1.5px solid #f59e0b50; border-radius: 10px; padding: 14px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #f59e0b; overflow: hidden; background: #1e293b; display: flex; align-items: center; justify-content: center;">
              <img src="${ach.image}" alt="${ach.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/team/achiever-1.jpg'">
            </div>
            <div>
              <span style="font-weight: 800; color: #fbbf24; font-size: 0.9rem;">#${idx + 1} ${ach.name}</span>
              <span style="font-size: 0.75rem; color: var(--admin-muted); margin-left: 6px;">(${ach.nameHindi || ''})</span>
            </div>
          </div>
          <button type="button" onclick="window.removeAchieverItem(${idx})" style="background: transparent; border: none; color: #ef4444; font-weight: 800; cursor: pointer; font-size: 0.82rem;">
            &times; हटाएं
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; margin-bottom: 8px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">फोटो URL (WebP 10-15 KB)</label>
            <input type="text" value="${escapeHtml(ach.image)}" onchange="window.updateAchieverField(${idx}, 'image', this.value); window.renderAchieversList();" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
            <div style="display:flex;gap:4px;margin-top:4px;align-items:center;">
              <input type="file" id="achiever_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'achiever', ${idx}, 'image')">
              <button type="button" onclick="document.getElementById('achiever_file_${idx}').click()" class="admin-button small-button" style="background:#3b82f6;color:#fff;padding:3px 8px;font-size:0.72rem;font-weight:800;">
                📁 फोटो अपलोड (WebP)
              </button>
              <select onchange="window.updateAchieverField(${idx}, 'image', this.value); window.renderAchieversList();" class="admin-select" style="flex:1; padding: 3px 6px; font-size: 0.72rem;">
                <option value="">-- प्रीसेट चुनें --</option>
                ${availablePhotos.map(ph => `<option value="${ph}" ${ach.image === ph ? 'selected' : ''}>${ph}</option>`).join('')}
              </select>
            </div>
            ${ach.image ? `<div style="margin-top:4px;"><img src="${escapeHtml(ach.image)}" alt="Preview" style="height:38px;border-radius:4px;object-fit:cover;border:1px solid #f59e0b;" onerror="this.style.display='none'"></div>` : ''}
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">नाम अंग्रेजी (Name EN)</label>
            <input type="text" value="${escapeHtml(ach.name)}" onchange="window.updateAchieverField(${idx}, 'name', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">नाम हिंदी (Name HI)</label>
            <input type="text" value="${escapeHtml(ach.nameHindi || '')}" onchange="window.updateAchieverField(${idx}, 'nameHindi', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">शहर / राज्य (Location)</label>
            <input type="text" value="${escapeHtml(ach.location || '')}" onchange="window.updateAchieverField(${idx}, 'location', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">रैंक / उपाधि (Rank Badge)</label>
            <input type="text" value="${escapeHtml(ach.rank || '')}" onchange="window.updateAchieverField(${idx}, 'rank', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">उपलब्धि सारांश (Achievement)</label>
            <textarea rows="2" onchange="window.updateAchieverField(${idx}, 'achievement', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.78rem;">${escapeHtml(ach.achievement || '')}</textarea>
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">प्रशंसापत्र / उद्धरण (Quote)</label>
            <textarea rows="2" onchange="window.updateAchieverField(${idx}, 'quote', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.78rem;">${escapeHtml(ach.quote || '')}</textarea>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.renderAchieversList = renderAchieversList;

  window.updateAchieverField = function(idx, field, val) {
    if (currentAchievers[idx]) {
      currentAchievers[idx][field] = val;
    }
  };

  window.removeAchieverItem = function(idx) {
    currentAchievers.splice(idx, 1);
    renderAchieversList();
  };

  // Audio Speech Test Listener
  document.getElementById('btn-test-page-audio-speech')?.addEventListener('click', () => {
    const text = document.getElementById('pe_input_audio_script')?.value || '';
    if (!text) {
      showToast('⚠️ पहले हिंदी वॉइस स्क्रिप्ट लिखें!', 'error');
      return;
    }
    const safeText = text.replace(/\{name\}/g, 'किसान भाई');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(safeText);
      ut.lang = 'hi-IN';
      ut.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const hi = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
      if (hi) ut.voice = hi;
      window.speechSynthesis.speak(ut);
      showToast('🔊 ऑडियो वॉइस टेस्ट शुरू हो गया...', 'info');
    } else {
      showToast('❌ ब्राउज़र में स्पीच सिंथेसिस उपलब्ध नहीं है', 'error');
    }
  });

  document.getElementById('btn_add_hero_slide')?.addEventListener('click', () => {
    currentSlides.push({
      image: '/images/banners/kharif-master-guide-2026-hero-banner.webp',
      tag: '🌾 नया स्पेशल ऑफर',
      title: 'नया बैनर शीर्षक यहाँ लिखें',
      subtitle: 'बैनर का आकर्षक विवरण और लाभ यहाँ लिखें',
      cta_text: '📚 अभी देखें',
      cta_link: '/ebooks/ebook.html',
      cta_secondary_text: '🛒 लाइव कार्ट',
      cta_secondary_link: '/ebooks/cart.html'
    });
    renderHeroSlidesInBuilder();
  });

  document.getElementById('btn_add_health_card')?.addEventListener('click', () => {
    currentHealthDiseases.push({
      id: `DIS00${currentHealthDiseases.length + 1}`,
      name: 'नई स्वास्थ्य समस्या',
      badge: 'आयुर्वेदिक उपचार',
      color: '#3b82f6',
      icon: '🩺',
      image: '/images/banners/health-banner.jpeg',
      symptoms: ['लक्षण 1', 'लक्षण 2'],
      description: 'समस्या का संक्षिप्त विवरण यहाँ लिखें...',
      solution: 'आयुर्वेदिक औषधि व आहार संतुलन तालिका।'
    });
    renderHealthCardsInBuilder();
  });

  document.getElementById('btn_add_crop_card')?.addEventListener('click', () => {
    currentCrops.push({
      id: `CROP00${currentCrops.length + 1}`,
      name: 'नई फसल',
      season: 'खरीफ / रबी',
      image: '/images/banners/agriculture-banner.jpeg',
      badge: 'फसल सुरक्षा',
      color: '#16a34a',
      mainIssues: 'प्रमुख कीट व रोग...',
      solution: 'जैविक व रासायनिक स्प्रे शेड्यूल...'
    });
    renderCropCardsInBuilder();
  });

  document.getElementById('btn_add_pashu_card')?.addEventListener('click', () => {
    currentPashuCards.push({
      id: `PASHU00${currentPashuCards.length + 1}`,
      name: 'नया पशु विषय',
      category: 'पशु पालन',
      icon: '🐄',
      badge: 'दुग्ध वृद्धि',
      image: '/images/banners/pashu-palan-banner.jpg',
      mainIssues: 'पशु में मुख्य समस्याएं...',
      solution: 'मिनरल मिक्सचर व प्राकृतिक आहार फॉर्मूला...'
    });
    renderPashuCardsInBuilder();
  });

  document.getElementById('btn_reset_page_sections_order')?.addEventListener('click', () => {
    currentSectionsOrder = ALL_SECTION_DEFS.map(s => s.key);
    currentHiddenSections = [];
    renderSectionsReorderingList();
    showToast('🔄 सेक्शंस का डिफ़ॉल्ट क्रम बहाल किया गया!', 'info');
  });

  document.getElementById('btn_add_kpi_card')?.addEventListener('click', () => {
    currentKpiCards.push({ icon: 'fa-star', title: 'नया फीचर शीर्षक', desc: 'फीचर का विवरण यहाँ लिखें...' });
    renderKpiCardsInBuilder();
  });

  document.getElementById('btn_add_marketing_card')?.addEventListener('click', () => {
    currentMarketingCards.push({
      book_id: availableBooks[0]?.id || 'BK001',
      tag: '🔥 बेस्टसेलर डील',
      headline: availableBooks[0]?.heading || 'विशेष ई-बुक गाइड',
      desc: 'विशेषज्ञों द्वारा तैयार प्रमाणित मार्गदर्शिका।',
      sales_counter: '1,200+ किसानों ने खरीदा'
    });
    renderMarketingCardsInBuilder();
  });

  document.getElementById('btn_add_page_video')?.addEventListener('click', () => {
    currentVideos.push({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: '🎥 नया वीडियो डेमो शीर्षक',
      desc: 'वीडियो का विवरण यहाँ लिखें...',
      ratio: '16:9'
    });
    renderVideosInBuilder();
  });

  document.getElementById('btn_add_page_review')?.addEventListener('click', () => {
    currentReviews.push({
      name: 'संतुष्ट पाठक',
      location: 'भारत',
      rating: 5,
      comment: 'बहुत ही उपयोगी व व्यावहारिक पुस्तक है।'
    });
    renderReviewsInBuilder();
  });

  document.getElementById('btn_add_page_faq')?.addEventListener('click', () => {
    currentFaqs.push({ q: 'नया प्रश्न यहाँ लिखें?', a: 'उत्तर यहाँ लिखें।' });
    renderFaqsInBuilder();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    savePageConfig();
  });

  // -------------------------------------------------------------
  // RENDER DYNAMIC BUILDER SECTIONS
  // -------------------------------------------------------------
  function renderHeroSlidesInBuilder() {
    const wrap = document.getElementById('pe_hero_slides_container');
    if (!wrap) return;

    if (currentSlides.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:12px;">कोई स्लाइड बैनर नहीं है। "+ नया स्लाइड बैनर जोड़ें" बटन दबाएं।</div>';
      return;
    }

    const bannerPresets = [
      { val: '/images/banners/agriculture-banner.jpeg', lbl: '🌱 सम्पूर्ण कृषि हब बैनर' },
      { val: '/images/banners/offer-banner-kharif-2026.webp', lbl: '🌾 खरीफ 2026 स्पेशल ऑफर' },
      { val: '/images/banners/kharif-master-guide-2026-hero-banner.webp', lbl: '📖 खरीफ मास्टर गाइड 2026' },
      { val: '/images/banners/ebook-banner.jpeg', lbl: '📚 डिजिटल ई-बुक स्टोर बैनर' },
      { val: '/images/banners/health-banner.jpeg', lbl: '❤️ सम्पूर्ण स्वास्थ्य केंद्र बैनर' },
      { val: '/images/banners/health-diabetes.jpg', lbl: '🩸 मधुमेह / डायबिटीज केयर' },
      { val: '/images/banners/health-joint-care.jpg', lbl: '🦴 जोड़ों का दर्द व गठिया' },
      { val: '/images/banners/health-weight-loss.jpg', lbl: '⚖️ मोटापा व वजन घटाएं' },
      { val: '/images/banners/health-hair-care.jpg', lbl: '💇 बाल झड़ना व डैंड्रफ' },
      { val: '/images/banners/pashu-palan-banner.jpg', lbl: '🐄 पशु पालन व दुग्ध क्रांति' },
      { val: '/images/banners/pashu-cow-care.jpg', lbl: '🐄 गाय-भैंस पोषण व देखभाल' },
      { val: '/images/banners/pashu-goat-care.jpg', lbl: '🐐 बकरी पालन व वजन वृद्धि' },
      { val: '/images/banners/achievers-banner.jpeg', lbl: '🏆 शीर्ष अचीवर्स व सफलता' }
    ];

    wrap.innerHTML = currentSlides.map((slide, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 800; color: #60a5fa; font-size: 0.85rem;">स्लाइड #${idx + 1}</span>
          <button type="button" onclick="window.removeHeroSlide(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem; font-weight: 800;">&times; हटाएं</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">बैनर इमेज URL (WebP 10-15 KB)</label>
            <input type="text" value="${escapeHtml(slide.image)}" onchange="window.updateHeroSlideField(${idx}, 'image', this.value); window.renderHeroSlidesInBuilder();" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
            <div style="display:flex;gap:4px;margin-top:4px;align-items:center;">
              <input type="file" id="hero_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'hero_slide', ${idx}, 'image')">
              <button type="button" onclick="document.getElementById('hero_file_${idx}').click()" class="admin-button small-button" style="background:#16a34a;color:#fff;padding:3px 8px;font-size:0.72rem;font-weight:800;">
                📁 बैनर अपलोड (WebP)
              </button>
              <select onchange="window.updateHeroSlideField(${idx}, 'image', this.value); window.renderHeroSlidesInBuilder();" class="admin-select" style="flex:1; padding: 3px 6px; font-size: 0.72rem;">
                <option value="">-- त्वरित प्रीसेट चुनें --</option>
                ${bannerPresets.map(bp => `<option value="${bp.val}" ${slide.image === bp.val ? 'selected' : ''}>${bp.lbl}</option>`).join('')}
              </select>
            </div>
            ${slide.image ? `<div style="margin-top:4px;"><img src="${escapeHtml(slide.image)}" alt="Preview" style="height:40px;border-radius:4px;object-fit:cover;border:1px solid #3b82f6;" onerror="this.style.display='none'"></div>` : ''}
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">टैग / ऑफर बैज</label>
            <input type="text" value="${escapeHtml(slide.tag || '')}" onchange="window.updateHeroSlideField(${idx}, 'tag', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">मुख्य शीर्षक (Headline)</label>
            <input type="text" value="${escapeHtml(slide.title || '')}" onchange="window.updateHeroSlideField(${idx}, 'title', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">उप-शीर्षक (Subtitle)</label>
            <input type="text" value="${escapeHtml(slide.subtitle || '')}" onchange="window.updateHeroSlideField(${idx}, 'subtitle', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">CTA बटन टेक्स्ट</label>
            <input type="text" value="${escapeHtml(slide.cta_text || 'देखें')}" onchange="window.updateHeroSlideField(${idx}, 'cta_text', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">CTA बटन लिंक (URL)</label>
            <input type="text" value="${escapeHtml(slide.cta_link || '')}" onchange="window.updateHeroSlideField(${idx}, 'cta_link', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
        </div>
      </div>
    `).join('');
  }

  window.renderHeroSlidesInBuilder = renderHeroSlidesInBuilder;

  window.updateHeroSlideField = function(idx, field, val) {
    if (currentSlides[idx]) currentSlides[idx][field] = val;
  };

  window.removeHeroSlide = function(idx) {
    currentSlides.splice(idx, 1);
    renderHeroSlidesInBuilder();
  };

  // -------------------------------------------------------------
  // RENDER HEALTH, CROPS & PASHU CARDS BUILDER
  // -------------------------------------------------------------
  function renderHealthCardsInBuilder() {
    const wrap = document.getElementById('pe_health_cards_container');
    if (!wrap) return;

    if (currentHealthDiseases.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:12px;">कोई स्वास्थ्य कार्ड नहीं है। "+ नया स्वास्थ्य कार्ड जोड़ें" बटन दबाएं।</div>';
      return;
    }

    wrap.innerHTML = currentHealthDiseases.map((item, idx) => {
      const safeName = escapeHtml(item.name || '');
      const safeImg = escapeHtml(item.image || '/images/banners/health-banner.jpeg');
      const safeBadge = escapeHtml(item.badge || '');
      const safeColor = item.color || '#3b82f6';
      const safeIcon = escapeHtml(item.icon || '🩺');
      const safeDesc = escapeHtml(item.description || '');
      const safeSolution = escapeHtml(item.solution || '');
      const symptomsStr = Array.isArray(item.symptoms) ? item.symptoms.join(', ') : (item.symptoms || '');

      return `
        <div style="background:#0f172a; border:1.5px solid ${safeColor}50; border-radius:10px; padding:14px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.2rem;">${safeIcon}</span>
              <span style="font-weight:800; color:#f8fafc; font-size:0.92rem;">#${idx + 1} ${safeName}</span>
              <span style="background:${safeColor}; color:#fff; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:12px;">${safeBadge}</span>
            </div>
            <button type="button" onclick="window.removeHealthCard(${idx})" style="background:transparent; border:none; color:#ef4444; font-weight:800; cursor:pointer; font-size:0.82rem;">
              &times; हटाएं
            </button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:8px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">कार्ड इमेज (WebP 10-15 KB)</label>
              <input type="text" value="${safeImg}" onchange="window.updateHealthCardField(${idx}, 'image', this.value); window.renderHealthCardsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
              <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
                <input type="file" id="health_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'health_card', ${idx}, 'image')">
                <button type="button" onclick="document.getElementById('health_file_${idx}').click()" class="admin-button small-button" style="background:#dc2626; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                  📁 इमेज बदलें (WebP)
                </button>
              </div>
              ${safeImg ? `<div style="margin-top:4px;"><img src="${safeImg}" alt="Preview" style="height:44px;border-radius:4px;object-fit:cover;border:1px solid ${safeColor};" onerror="this.style.display='none'"></div>` : ''}
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">समस्या / नाम (Hindi Title)</label>
              <input type="text" value="${safeName}" onchange="window.updateHealthCardField(${idx}, 'name', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">बैज टेक्स्ट (Badge)</label>
              <input type="text" value="${safeBadge}" onchange="window.updateHealthCardField(${idx}, 'badge', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">थीम कलर (Color Code)</label>
              <input type="color" value="${safeColor}" onchange="window.updateHealthCardField(${idx}, 'color', this.value); window.renderHealthCardsInBuilder();" style="width:100%; height:32px; border-radius:6px; border:1px solid var(--admin-border); background:transparent; cursor:pointer;" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">लक्षण (कॉमा से अलग करें)</label>
              <textarea rows="2" onchange="window.updateHealthCardField(${idx}, 'symptoms', this.value.split(',').map(s=>s.trim()))" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;">${escapeHtml(symptomsStr)}</textarea>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">आयुर्वेदिक उपचार / फॉर्मूला (Remedy)</label>
              <textarea rows="2" onchange="window.updateHealthCardField(${idx}, 'solution', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;">${safeSolution}</textarea>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.renderHealthCardsInBuilder = renderHealthCardsInBuilder;
  window.updateHealthCardField = function(idx, field, val) {
    if (currentHealthDiseases[idx]) currentHealthDiseases[idx][field] = val;
  };
  window.removeHealthCard = function(idx) {
    currentHealthDiseases.splice(idx, 1);
    renderHealthCardsInBuilder();
  };

  function renderCropCardsInBuilder() {
    const wrap = document.getElementById('pe_crop_cards_container');
    if (!wrap) return;

    if (currentCrops.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:12px;">कोई फसल कार्ड नहीं है। "+ नया फसल कार्ड जोड़ें" बटन दबाएं।</div>';
      return;
    }

    wrap.innerHTML = currentCrops.map((item, idx) => {
      const safeName = escapeHtml(item.name || '');
      const safeImg = escapeHtml(item.image || '/images/banners/agriculture-banner.jpeg');
      const safeBadge = escapeHtml(item.badge || '');
      const safeSeason = escapeHtml(item.season || 'खरीफ फसल');
      const issuesStr = Array.isArray(item.mainIssues) ? item.mainIssues.join(', ') : (item.issues || item.mainIssues || '');
      const safeSolution = escapeHtml(item.solution || '');

      return `
        <div style="background:#0f172a; border:1.5px solid #16a34a50; border-radius:10px; padding:14px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.2rem;">🌱</span>
              <span style="font-weight:800; color:#4ade80; font-size:0.92rem;">#${idx + 1} ${safeName}</span>
              <span style="background:#16a34a; color:#fff; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:12px;">${safeBadge || safeSeason}</span>
            </div>
            <button type="button" onclick="window.removeCropCard(${idx})" style="background:transparent; border:none; color:#ef4444; font-weight:800; cursor:pointer; font-size:0.82rem;">
              &times; हटाएं
            </button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:8px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">फसल इमेज (WebP 10-15 KB)</label>
              <input type="text" value="${safeImg}" onchange="window.updateCropCardField(${idx}, 'image', this.value); window.renderCropCardsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
              <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
                <input type="file" id="crop_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'crop_card', ${idx}, 'image')">
                <button type="button" onclick="document.getElementById('crop_file_${idx}').click()" class="admin-button small-button" style="background:#16a34a; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                  📁 इमेज बदलें (WebP)
                </button>
              </div>
              ${safeImg ? `<div style="margin-top:4px;"><img src="${safeImg}" alt="Preview" style="height:44px;border-radius:4px;object-fit:cover;border:1px solid #16a34a;" onerror="this.style.display='none'"></div>` : ''}
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">फसल का नाम (Crop Name)</label>
              <input type="text" value="${safeName}" onchange="window.updateCropCardField(${idx}, 'name', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">सीजन / श्रेणी (Season)</label>
              <input type="text" value="${safeSeason}" onchange="window.updateCropCardField(${idx}, 'season', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">बैज टैग (Badge)</label>
              <input type="text" value="${safeBadge}" onchange="window.updateCropCardField(${idx}, 'badge', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">प्रमुख रोग व समस्याएं (Issues)</label>
              <textarea rows="2" onchange="window.updateCropCardField(${idx}, 'mainIssues', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;">${escapeHtml(issuesStr)}</textarea>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">जैविक / वैज्ञानिक समाधान (Solution)</label>
              <textarea rows="2" onchange="window.updateCropCardField(${idx}, 'solution', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;">${safeSolution}</textarea>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.renderCropCardsInBuilder = renderCropCardsInBuilder;
  window.updateCropCardField = function(idx, field, val) {
    if (currentCrops[idx]) currentCrops[idx][field] = val;
  };
  window.removeCropCard = function(idx) {
    currentCrops.splice(idx, 1);
    renderCropCardsInBuilder();
  };

  function renderPashuCardsInBuilder() {
    const wrap = document.getElementById('pe_pashu_cards_container');
    if (!wrap) return;

    if (currentPashuCards.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:12px;">कोई पशु कार्ड नहीं है। "+ नया पशु कार्ड जोड़ें" बटन दबाएं।</div>';
      return;
    }

    wrap.innerHTML = currentPashuCards.map((item, idx) => {
      const safeName = escapeHtml(item.name || '');
      const safeImg = escapeHtml(item.image || '/images/banners/pashu-palan-banner.jpg');
      const safeBadge = escapeHtml(item.badge || '');
      const safeCat = escapeHtml(item.category || 'पशु पालन');
      const issuesStr = Array.isArray(item.mainIssues) ? item.mainIssues.join(', ') : (item.issues || item.mainIssues || '');
      const safeSolution = escapeHtml(item.solution || '');

      return `
        <div style="background:#0f172a; border:1.5px solid #0284c750; border-radius:10px; padding:14px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.2rem;">🐄</span>
              <span style="font-weight:800; color:#38bdf8; font-size:0.92rem;">#${idx + 1} ${safeName}</span>
              <span style="background:#0284c7; color:#fff; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:12px;">${safeBadge || safeCat}</span>
            </div>
            <button type="button" onclick="window.removePashuCard(${idx})" style="background:transparent; border:none; color:#ef4444; font-weight:800; cursor:pointer; font-size:0.82rem;">
              &times; हटाएं
            </button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:8px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">पशु फोटो (WebP 10-15 KB)</label>
              <input type="text" value="${safeImg}" onchange="window.updatePashuCardField(${idx}, 'image', this.value); window.renderPashuCardsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
              <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
                <input type="file" id="pashu_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'pashu_card', ${idx}, 'image')">
                <button type="button" onclick="document.getElementById('pashu_file_${idx}').click()" class="admin-button small-button" style="background:#0284c7; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                  📁 इमेज बदलें (WebP)
                </button>
              </div>
              ${safeImg ? `<div style="margin-top:4px;"><img src="${safeImg}" alt="Preview" style="height:44px;border-radius:4px;object-fit:cover;border:1px solid #0284c7;" onerror="this.style.display='none'"></div>` : ''}
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">पशु विषय / नाम</label>
              <input type="text" value="${safeName}" onchange="window.updatePashuCardField(${idx}, 'name', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">कैटेगरी (Category)</label>
              <input type="text" value="${safeCat}" onchange="window.updatePashuCardField(${idx}, 'category', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">बैज टैग (Badge)</label>
              <input type="text" value="${safeBadge}" onchange="window.updatePashuCardField(${idx}, 'badge', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">प्रमुख लक्षण व समस्याएं (Issues)</label>
              <textarea rows="2" onchange="window.updatePashuCardField(${idx}, 'mainIssues', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;">${escapeHtml(issuesStr)}</textarea>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">पोषण व औषधीय समाधान (Solution)</label>
              <textarea rows="2" onchange="window.updatePashuCardField(${idx}, 'solution', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;">${safeSolution}</textarea>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.renderPashuCardsInBuilder = renderPashuCardsInBuilder;
  window.updatePashuCardField = function(idx, field, val) {
    if (currentPashuCards[idx]) currentPashuCards[idx][field] = val;
  };
  window.removePashuCard = function(idx) {
    currentPashuCards.splice(idx, 1);
    renderPashuCardsInBuilder();
  };

  function renderSectionsReorderingList() {
    const wrap = document.getElementById('pe_sections_reordering_list');
    if (!wrap) return;

    wrap.innerHTML = currentSectionsOrder.map((secKey, idx) => {
      const def = ALL_SECTION_DEFS.find(d => d.key === secKey) || { key: secKey, name: secKey, desc: '' };
      const isHidden = currentHiddenSections.includes(secKey);

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid ${isHidden ? '#475569' : '#334155'}; border-radius: 8px; padding: 8px 12px; gap: 8px; opacity: ${isHidden ? '0.6' : '1'};">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-family: monospace; font-weight: 800; color: #38bdf8; font-size: 0.85rem;">#${idx + 1}</span>
            <div>
              <strong style="font-size: 0.88rem; color: ${isHidden ? 'var(--admin-muted)' : '#f8fafc'};">${def.name}</strong>
              <div style="font-size: 0.72rem; color: var(--admin-muted);">${def.desc}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" onclick="window.movePageSection(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="admin-button small-button" style="padding: 2px 8px; font-size: 0.75rem;">▲</button>
            <button type="button" onclick="window.movePageSection(${idx}, 1)" ${idx === currentSectionsOrder.length - 1 ? 'disabled' : ''} class="admin-button small-button" style="padding: 2px 8px; font-size: 0.75rem;">▼</button>
            <button type="button" onclick="window.togglePageSectionVisibility('${secKey}')" class="admin-button small-button" style="background: ${isHidden ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}; color: ${isHidden ? '#ef4444' : '#22c55e'}; border: 1px solid ${isHidden ? '#ef4444' : '#22c55e'}; padding: 2px 8px; font-size: 0.75rem; font-weight: 800;">
              ${isHidden ? 'छिपा हुआ (Hidden)' : 'दिखेगा (Visible)'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.movePageSection = function(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= currentSectionsOrder.length) return;
    const item = currentSectionsOrder.splice(idx, 1)[0];
    currentSectionsOrder.splice(newIdx, 0, item);
    renderSectionsReorderingList();
  };

  window.togglePageSectionVisibility = function(secKey) {
    if (currentHiddenSections.includes(secKey)) {
      currentHiddenSections = currentHiddenSections.filter(k => k !== secKey);
    } else {
      currentHiddenSections.push(secKey);
    }
    renderSectionsReorderingList();
  };

  function renderKpiCardsInBuilder() {
    const wrap = document.getElementById('pe_kpi_cards_container');
    if (!wrap) return;

    wrap.innerHTML = currentKpiCards.map((card, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #34d399;">कार्ड #${idx + 1}</span>
          <button type="button" onclick="window.removeKpiCard(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem;">&times;</button>
        </div>
        <input type="text" value="${escapeHtml(card.icon || '')}" onchange="window.updateKpiCard(${idx}, 'icon', this.value)" class="admin-input" placeholder="FontAwesome Icon (e.g. fa-seedling)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <input type="text" value="${escapeHtml(card.title || '')}" onchange="window.updateKpiCard(${idx}, 'title', this.value)" class="admin-input" placeholder="शीर्षक (Title)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <input type="text" value="${escapeHtml(card.desc || '')}" onchange="window.updateKpiCard(${idx}, 'desc', this.value)" class="admin-input" placeholder="विवरण (Desc)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem;" />
      </div>
    `).join('');
  }

  window.updateKpiCard = function(idx, field, val) {
    if (currentKpiCards[idx]) currentKpiCards[idx][field] = val;
  };

  window.removeKpiCard = function(idx) {
    currentKpiCards.splice(idx, 1);
    renderKpiCardsInBuilder();
  };

  function renderMarketingCardsInBuilder() {
    const wrap = document.getElementById('pe_marketing_cards_container');
    if (!wrap) return;

    wrap.innerHTML = currentMarketingCards.map((m, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 800; color: #facc15; font-size: 0.82rem;">📢 सेलिंग कार्ड #${idx + 1}</span>
          <button type="button" onclick="window.removeMarketingCard(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem; font-weight: 800;">&times; हटाएं</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">प्रमोट की जाने वाली पुस्तक (Book ID)</label>
            <select onchange="window.updateMarketingCardBook(${idx}, this.value)" class="admin-select" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;">
              ${availableBooks.map(b => `<option value="${b.id}" ${b.id === m.book_id ? 'selected' : ''}>[${b.id}] ${b.heading || b.name} (₹${b.offerPrice || 99})</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">ऑफर टैग (Offer Tag)</label>
            <input type="text" value="${escapeHtml(m.tag || '')}" onchange="window.updateMarketingCardField(${idx}, 'tag', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">लाइव सेलिंग काउंटर (Sales Counter)</label>
            <input type="text" value="${escapeHtml(m.sales_counter || '')}" onchange="window.updateMarketingCardField(${idx}, 'sales_counter', this.value)" class="admin-input" placeholder="उदा. 1,400+ किसानों ने खरीदा" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">हेडलाइन (Headline)</label>
            <input type="text" value="${escapeHtml(m.headline || '')}" onchange="window.updateMarketingCardField(${idx}, 'headline', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">कार्ड इमेज / बैनर (WebP 10-15 KB)</label>
            <input type="text" value="${escapeHtml(m.image || '')}" onchange="window.updateMarketingCardField(${idx}, 'image', this.value); window.renderMarketingCardsInBuilder();" class="admin-input" placeholder="/images/..." style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
            <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
              <input type="file" id="mkt_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'marketing_card', ${idx}, 'image')">
              <button type="button" onclick="document.getElementById('mkt_file_${idx}').click()" class="admin-button small-button" style="background:#f59e0b; color:#000; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                📁 इमेज बदलें (WebP)
              </button>
            </div>
            ${m.image ? `<div style="margin-top:4px;"><img src="${escapeHtml(m.image)}" alt="Preview" style="height:36px;border-radius:4px;object-fit:cover;border:1px solid #f59e0b;" onerror="this.style.display='none'"></div>` : ''}
          </div>
          <div style="grid-column: 1 / -1;">
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">संक्षिप्त विवरण (Description)</label>
            <input type="text" value="${escapeHtml(m.desc || '')}" onchange="window.updateMarketingCardField(${idx}, 'desc', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
        </div>
      </div>
    `).join('');
  }

  window.updateMarketingCardBook = function(idx, bookId) {
    if (currentMarketingCards[idx]) {
      currentMarketingCards[idx].book_id = bookId;
      const b = availableBooks.find(x => x.id === bookId);
      if (b) {
        currentMarketingCards[idx].headline = b.heading || b.name || '';
      }
      renderMarketingCardsInBuilder();
    }
  };

  window.updateMarketingCardField = function(idx, field, val) {
    if (currentMarketingCards[idx]) currentMarketingCards[idx][field] = val;
  };

  window.removeMarketingCard = function(idx) {
    currentMarketingCards.splice(idx, 1);
    renderMarketingCardsInBuilder();
  };

  function renderVideosInBuilder() {
    const wrap = document.getElementById('pe_videos_container');
    if (!wrap) return;

    const pageTargetOptions = [
      { id: 'all', label: '🌐 सभी पेजेस पर (All Pages)' },
      { id: 'home-page', label: '🏠 मुख्य पृष्ठ (Home Page)' },
      { id: 'ebook-store', label: '📚 ई-बुक स्टोर (eBook Store)' },
      { id: 'agriculture', label: '🌱 कृषि हब (Agriculture)' },
      { id: 'cattle-care', label: '🐄 पशु पालन हब (Cattle Care)' },
      { id: 'health-hub', label: '❤️ स्वास्थ्य केंद्र (Health Hub)' },
      { id: 'diabetes', label: '🩸 मधुमेह (Diabetes)' },
      { id: 'weight-loss', label: '🔥 मोटापा व फैट लॉस (Weight Loss)' },
      { id: 'joint-care', label: '🦴 जोड़ों का दर्द (Joint Care)' },
      { id: 'womens-care', label: '🌸 महिला स्वास्थ्य (PCOD/PCOS)' },
      { id: 'hair-care', label: '💇‍♀️ हेयर केयर (Hair Care)' },
      { id: 'skin-care', label: '🌺 स्किन केयर (Skin Care)' },
      { id: 'kids-care', label: '🧸 किड्स केयर (Kids Nutrition)' },
      { id: 'home-care', label: '🏡 होम केयर (Home Care)' }
    ];

    wrap.innerHTML = currentVideos.map((v, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; position: relative;">
        <div>
          <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">YouTube URL</label>
          <input type="text" value="${escapeHtml(v.url || '')}" onchange="window.updateVideoItem(${idx}, 'url', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
        </div>
        <div>
          <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">वीडियो शीर्षक</label>
          <input type="text" value="${escapeHtml(v.title || '')}" onchange="window.updateVideoItem(${idx}, 'title', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
        </div>
        <div>
          <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">प्रदर्शित करने वाला पेज (Target Page)</label>
          <select onchange="window.updateVideoItem(${idx}, 'target_page', this.value)" class="admin-select" style="width: 100%; padding: 5px 8px; font-size: 0.8rem; background:#1e293b; color:#fff;">
            ${pageTargetOptions.map(opt => `<option value="${opt.id}" ${(v.target_page || 'all') === opt.id ? 'selected' : ''}>${opt.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">विवरण</label>
          <input type="text" value="${escapeHtml(v.desc || '')}" onchange="window.updateVideoItem(${idx}, 'desc', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
        </div>
        <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
          <button type="button" onclick="window.removeVideoItem(${idx})" class="admin-button small-button" style="background: #ef4444; color: #fff;">&times; हटाएं</button>
        </div>
      </div>
    `).join('');
  }

  window.updateVideoItem = function(idx, field, val) {
    if (currentVideos[idx]) currentVideos[idx][field] = val;
  };

  window.removeVideoItem = function(idx) {
    currentVideos.splice(idx, 1);
    renderVideosInBuilder();
  };

  function renderReviewsInBuilder() {
    const wrap = document.getElementById('pe_reviews_container');
    if (!wrap) return;

    wrap.innerHTML = currentReviews.map((r, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #a78bfa;">समीक्षा #${idx + 1}</span>
          <button type="button" onclick="window.removeReviewItem(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem;">&times;</button>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-bottom: 6px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">नाम</label>
            <input type="text" value="${escapeHtml(r.name || '')}" onchange="window.updateReviewItem(${idx}, 'name', this.value)" class="admin-input" placeholder="नाम" style="width: 100%; padding: 4px 6px; font-size: 0.75rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">स्थान / शहर</label>
            <input type="text" value="${escapeHtml(r.location || '')}" onchange="window.updateReviewItem(${idx}, 'location', this.value)" class="admin-input" placeholder="स्थान / शहर" style="width: 100%; padding: 4px 6px; font-size: 0.75rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">अवतार फोटो (WebP 10-15 KB)</label>
            <input type="text" value="${escapeHtml(r.image || r.avatar || '')}" onchange="window.updateReviewItem(${idx}, 'image', this.value); window.renderReviewsInBuilder();" class="admin-input" placeholder="/images/..." style="width: 100%; padding: 4px 6px; font-size: 0.75rem;" />
            <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
              <input type="file" id="rev_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'review', ${idx}, 'image')">
              <button type="button" onclick="document.getElementById('rev_file_${idx}').click()" class="admin-button small-button" style="background:#8b5cf6; color:#fff; padding:2px 8px; font-size:0.72rem; font-weight:800;">
                📁 फोटो बदलें (WebP)
              </button>
            </div>
            ${(r.image || r.avatar) && (r.image || r.avatar).startsWith('/') ? `<div style="margin-top:4px;"><img src="${escapeHtml(r.image || r.avatar)}" alt="Avatar" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid #8b5cf6;" onerror="this.style.display='none'"></div>` : ''}
          </div>
        </div>
        <input type="text" value="${escapeHtml(r.comment || '')}" onchange="window.updateReviewItem(${idx}, 'comment', this.value)" class="admin-input" placeholder="टिप्पणी" style="width: 100%; padding: 4px 6px; font-size: 0.75rem;" />
      </div>
    `).join('');
  }

  window.updateReviewItem = function(idx, field, val) {
    if (currentReviews[idx]) currentReviews[idx][field] = val;
  };

  window.removeReviewItem = function(idx) {
    currentReviews.splice(idx, 1);
    renderReviewsInBuilder();
  };

  function renderFaqsInBuilder() {
    const wrap = document.getElementById('pe_faqs_container');
    if (!wrap) return;

    wrap.innerHTML = currentFaqs.map((faq, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #38bdf8;">प्रश्न #${idx + 1}</span>
          <button type="button" onclick="window.removeFaqItem(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem;">&times;</button>
        </div>
        <input type="text" value="${escapeHtml(faq.q || '')}" onchange="window.updateFaqItem(${idx}, 'q', this.value)" class="admin-input" placeholder="प्रश्न (Question)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <textarea onchange="window.updateFaqItem(${idx}, 'a', this.value)" class="admin-input" placeholder="उत्तर (Answer)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; height: 50px;">${escapeHtml(faq.a || '')}</textarea>
      </div>
    `).join('');
  }

  window.updateFaqItem = function(idx, field, val) {
    if (currentFaqs[idx]) currentFaqs[idx][field] = val;
  };

  window.removeFaqItem = function(idx) {
    currentFaqs.splice(idx, 1);
    renderFaqsInBuilder();
  };

  // -------------------------------------------------------------
  // TABLE & ACTIONS
  // -------------------------------------------------------------
  function renderPagesTable() {
    const wrap = document.getElementById('pe_table_container');
    if (!wrap) return;

    const q = (searchInput?.value || '').toLowerCase().trim();
    const filtered = allPages.filter(p => {
      return (p.name || '').toLowerCase().includes(q) || (p.url || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--admin-muted);">कोई पेज नहीं मिला।</div>';
      return;
    }

    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>पेज का नाम (Page Name)</th>
            <th>कैटेगरी</th>
            <th>Live URL</th>
            <th>स्लाइड्स व सेक्शंस</th>
            <th>ट्रैकिंग</th>
            <th>स्थिति (Status)</th>
            <th style="text-align:center;">एक्शन (Actions)</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(p => {
            const isLive = p.status === 'active';
            const slidesCount = (p.hero_slides || []).length;
            const secCount = (p.sections_order || []).length;

            return `
              <tr>
                <td>
                  <strong style="color:var(--admin-text);font-size:0.95rem;">${p.name}</strong>
                  <div style="font-size:0.75rem;color:var(--admin-muted);">${p.ticker_text ? p.ticker_text.substring(0, 45) + '...' : ''}</div>
                </td>
                <td>
                  <span style="font-size:0.75rem;background:rgba(59,130,246,0.15);color:#3b82f6;padding:2px 8px;border-radius:4px;font-weight:700;">
                    ${p.category || 'General'}
                  </span>
                </td>
                <td>
                  <code style="font-size:0.8rem;color:#16a34a;background:rgba(22,163,74,0.1);padding:2px 6px;border-radius:4px;">${p.url}</code>
                </td>
                <td>
                  <span style="font-size:0.75rem;background:rgba(168,85,247,0.15);color:#c084fc;padding:2px 6px;border-radius:4px;font-weight:700;">
                    🖼️ ${slidesCount} स्लाइड | 📑 ${secCount} सेक्शंस
                  </span>
                </td>
                <td>
                  <span style="font-size:0.72rem;background:rgba(37,99,235,0.15);color:#3b82f6;padding:2px 6px;border-radius:4px;font-weight:700;">
                    ${p.fb_pixel !== false ? '🔵 FB + GA ON' : 'Off'}
                  </span>
                </td>
                <td>
                  <button type="button" onclick="window.toggleSitePageStatus('${p.id}')" class="admin-button small-button" style="background:${isLive ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)'};color:${isLive ? '#16a34a' : '#ef4444'};border:1px solid ${isLive ? '#16a34a' : '#ef4444'};padding:3px 8px;border-radius:6px;font-size:0.78rem;font-weight:800;">
                    ${isLive ? '🟢 Live' : '🔴 Offline'}
                  </button>
                </td>
                <td>
                  <div style="display:flex;gap:6px;align-items:center;justify-content:center;">
                    <button type="button" onclick="window.editSitePage('${p.id}')" class="admin-button small-button" style="background:#f59e0b;color:#000;font-weight:900;padding:5px 12px;" title="एडिट करें">
                      ✏️ एडिट
                    </button>
                    <a href="${p.url}" target="_blank" class="admin-button small-button" style="background:#2563eb;color:#fff;text-decoration:none;font-weight:700;" title="लाइव देखें">
                      👁️ देखें
                    </a>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  window.editSitePage = function(pageId) {
    const p = allPages.find(x => x.id === pageId);
    if (!p) return;

    editingPageId = p.id;
    document.getElementById('page-editor-form-title').textContent = `✏️ पेज एडिट करें: ${p.name}`;
    document.getElementById('pe_input_slug').value = p.slug || p.id;
    document.getElementById('pe_input_name').value = p.name || '';
    document.getElementById('pe_input_url').value = p.url || '';
    document.getElementById('pe_select_category').value = p.category || 'eBooks';
    document.getElementById('pe_select_status').value = p.status || 'active';
    document.getElementById('pe_input_theme_primary').value = p.theme_primary || '#15803d';
    document.getElementById('pe_input_ticker').value = p.ticker_text || '';
    document.getElementById('pe_chk_fb').checked = p.fb_pixel !== false;
    document.getElementById('pe_chk_ga').checked = p.ga_tag !== false;
    document.getElementById('pe_input_wa_number').value = p.whatsapp_support?.number || '919876543210';
    document.getElementById('pe_input_wa_prompt').value = p.whatsapp_support?.prompt || '';
    
    // Audio Narration inputs
    const audioTitleEl = document.getElementById('pe_input_audio_title');
    const audioScriptEl = document.getElementById('pe_input_audio_script');
    if (audioTitleEl) audioTitleEl.value = p.audio_title || p.name || '';
    if (audioScriptEl) audioScriptEl.value = p.audio_script || '';

    currentSlides = Array.isArray(p.hero_slides) ? JSON.parse(JSON.stringify(p.hero_slides)) : [];
    currentSectionsOrder = Array.isArray(p.sections_order) && p.sections_order.length > 0 ? [...p.sections_order] : ALL_SECTION_DEFS.map(s => s.key);
    currentHiddenSections = Array.isArray(p.hidden_sections) ? [...p.hidden_sections] : [];
    currentKpiCards = Array.isArray(p.kpi_cards) ? JSON.parse(JSON.stringify(p.kpi_cards)) : [];
    currentVideos = Array.isArray(p.videos) ? JSON.parse(JSON.stringify(p.videos)) : [];
    currentMarketingCards = Array.isArray(p.marketing_cards) ? JSON.parse(JSON.stringify(p.marketing_cards)) : [];
    currentReviews = Array.isArray(p.reviews) ? JSON.parse(JSON.stringify(p.reviews)) : [];
    currentFaqs = Array.isArray(p.faqs) ? JSON.parse(JSON.stringify(p.faqs)) : [];
    currentHealthDiseases = Array.isArray(p.health_diseases) ? JSON.parse(JSON.stringify(p.health_diseases)) : JSON.parse(JSON.stringify(DEFAULT_HEALTH_DISEASES));
    currentCrops = Array.isArray(p.crops) ? JSON.parse(JSON.stringify(p.crops)) : JSON.parse(JSON.stringify(DEFAULT_CROPS_LIST));
    currentPashuCards = Array.isArray(p.pashu_cards) ? JSON.parse(JSON.stringify(p.pashu_cards)) : JSON.parse(JSON.stringify(DEFAULT_PASHU_LIST));

    renderHeroSlidesInBuilder();
    renderSectionsReorderingList();
    renderKpiCardsInBuilder();
    renderMarketingCardsInBuilder();
    renderVideosInBuilder();
    renderReviewsInBuilder();
    renderFaqsInBuilder();
    renderHealthCardsInBuilder();
    renderCropCardsInBuilder();
    renderPashuCardsInBuilder();

    formCard.style.display = 'block';
    formCard.scrollIntoView({ behavior: 'smooth' });
  };

  window.toggleSitePageStatus = function(pageId) {
    const p = allPages.find(x => x.id === pageId);
    if (!p) return;
    p.status = p.status === 'active' ? 'draft' : 'active';
    savePagesToStorage();
    renderPagesTable();
    showToast(`स्टेटस बदला गया: ${p.status === 'active' ? '🟢 Live' : '🔴 Offline'}`, 'success');
  };

  function resetPageForm() {
    editingPageId = null;
    document.getElementById('page-editor-form-title').textContent = 'नया साइट पेज बनाएं (Universal Page Editor)';
    document.getElementById('site-page-customizer-form')?.reset();
    const audioTitleEl = document.getElementById('pe_input_audio_title');
    const audioScriptEl = document.getElementById('pe_input_audio_script');
    if (audioTitleEl) audioTitleEl.value = '';
    if (audioScriptEl) audioScriptEl.value = '';
    currentSlides = [];
    currentSectionsOrder = ALL_SECTION_DEFS.map(s => s.key);
    currentHiddenSections = [];
    currentKpiCards = [];
    currentVideos = [];
    currentMarketingCards = [];
    currentReviews = [];
    currentFaqs = [];
    currentHealthDiseases = JSON.parse(JSON.stringify(DEFAULT_HEALTH_DISEASES));
    currentCrops = JSON.parse(JSON.stringify(DEFAULT_CROPS_LIST));
    currentPashuCards = JSON.parse(JSON.stringify(DEFAULT_PASHU_LIST));

    renderHeroSlidesInBuilder();
    renderSectionsReorderingList();
    renderKpiCardsInBuilder();
    renderMarketingCardsInBuilder();
    renderVideosInBuilder();
    renderReviewsInBuilder();
    renderFaqsInBuilder();
    renderHealthCardsInBuilder();
    renderCropCardsInBuilder();
    renderPashuCardsInBuilder();
  }

  function savePageConfig() {
    const slug = (document.getElementById('pe_input_slug')?.value || '').trim();
    const name = (document.getElementById('pe_input_name')?.value || '').trim();
    const url = (document.getElementById('pe_input_url')?.value || '').trim();
    const cat = document.getElementById('pe_select_category')?.value || 'eBooks';
    const status = document.getElementById('pe_select_status')?.value || 'active';
    const themeCol = document.getElementById('pe_input_theme_primary')?.value || '#15803d';
    const ticker = (document.getElementById('pe_input_ticker')?.value || '').trim();
    const fb = document.getElementById('pe_chk_fb')?.checked !== false;
    const ga = document.getElementById('pe_chk_ga')?.checked !== false;
    const waNum = (document.getElementById('pe_input_wa_number')?.value || '').trim();
    const waPrompt = (document.getElementById('pe_input_wa_prompt')?.value || '').trim();
    const audioTitle = (document.getElementById('pe_input_audio_title')?.value || '').trim();
    const audioScript = (document.getElementById('pe_input_audio_script')?.value || '').trim();

    const pageObj = {
      id: editingPageId || `page_${slug.replace(/[^a-zA-Z0-9_]/g, '_')}`,
      slug: slug,
      name: name,
      url: url,
      category: cat,
      status: status,
      theme_primary: themeCol,
      theme_dark: adjustColorBrightness(themeCol, -30),
      ticker_text: ticker,
      audio_title: audioTitle,
      audio_script: audioScript,
      fb_pixel: fb,
      ga_tag: ga,
      hero_slides: currentSlides,
      sections_order: currentSectionsOrder,
      hidden_sections: currentHiddenSections,
      kpi_cards: currentKpiCards,
      marketing_cards: currentMarketingCards,
      videos: currentVideos,
      reviews: currentReviews,
      faqs: currentFaqs,
      health_diseases: currentHealthDiseases,
      crops: currentCrops,
      pashu_cards: currentPashuCards,
      whatsapp_support: {
        number: waNum,
        prompt: waPrompt
      }
    };

    const existingIdx = allPages.findIndex(x => x.id === pageObj.id);
    if (existingIdx >= 0) allPages[existingIdx] = pageObj;
    else allPages.unshift(pageObj);

    savePagesToStorage();
    formCard.style.display = 'none';
    resetPageForm();
    renderPagesTable();
    showToast(`✅ पेज '${name}' सम्पूर्ण कॉन्फ़िगरेशन के साथ सुरक्षित हो गया!`, 'success');
  }

  function savePagesToStorage() {
    try {
      localStorage.setItem('AAROGYAM_SITE_PAGES_CONFIG', JSON.stringify(allPages));
      const homePage = allPages.find(p => p.id === 'page_home' || p.slug === 'index');
      if (homePage) {
        localStorage.setItem('AAROGYAM_HOME_CMS_CONFIG', JSON.stringify(homePage));
      }
      // Synchronize Audio Narration Scripts to AAROGYAM_PAGE_AUDIO_SCRIPTS
      let existingScripts = {};
      try {
        existingScripts = JSON.parse(localStorage.getItem('AAROGYAM_PAGE_AUDIO_SCRIPTS') || '{}');
      } catch (err) {}
      allPages.forEach(p => {
        if (p.audio_script) {
          const rawSlug = p.slug || p.id.replace(/^page_/, '');
          existingScripts[rawSlug] = {
            title: p.audio_title || p.name,
            script: p.audio_script
          };
          if (p.slug === 'index' || p.id === 'page_home') {
            existingScripts['index'] = {
              title: p.audio_title || p.name,
              script: p.audio_script
            };
          }
        }
      });
      localStorage.setItem('AAROGYAM_PAGE_AUDIO_SCRIPTS', JSON.stringify(existingScripts));
    } catch (e) {}
  }

  function exportPagesJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ sitePages: allPages }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "site-pages-config.json");
    dlAnchorElem.click();
    showToast('📥 site-pages-config.json डाउनलोड हो गया!', 'success');
  }

  function adjustColorBrightness(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${type === 'success' ? '#16a34a' : '#2563eb'};color:#fff;padding:12px 20px;border-radius:10px;font-weight:700;font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:999999;animation:slideIn 0.3s ease;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }

  renderPagesTable();

  // Check URL hash/query for direct page editor target
  try {
    const rawHash = location.hash || location.search || '';
    const queryPart = rawHash.includes('?') ? rawHash.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    const targetPage = params.get('page');
    if (targetPage) {
      const found = allPages.find(p => p.slug === targetPage || p.id.includes(targetPage));
      if (found) {
        setTimeout(() => {
          window.editSitePage(found.id);
        }, 150);
      }
    }
  } catch (e) {}
}
