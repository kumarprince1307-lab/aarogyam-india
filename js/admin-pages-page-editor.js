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
  // WEBP CANVAS IMAGE COMPRESSION (HD 1600px Banners & Cards) & AUTO GITHUB SYNC
  // ====================================================================
  function getAutoSyncApiUrl() {
    if (typeof window !== 'undefined') {
      const h = window.location.hostname;
      if (h === '127.0.0.1' || h === 'localhost' || h === '' || window.location.protocol === 'file:') {
        return 'https://aarogyamindia.online/api/auto-sync-book';
      }
    }
    return '/api/auto-sync-book';
  }

  async function syncAssetToGitHub(path, base64Data) {
    const cleanPath = String(path || '').replace(/^\/+/, '');
    const cleanBase64 = String(base64Data || '').replace(/^data:[^;]+;base64,/, '');

    if (!cleanPath || !cleanBase64) return { success: false, error: 'Path and Base64 required' };

    // 1. If on 127.0.0.1 or localhost, first save directly to local disk via local-sync-server (port 5505)
    if (typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')) {
      try {
        const localRes = await fetch('http://127.0.0.1:5505', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: cleanPath.endsWith('.json') ? 'save_config' : 'upload_asset',
            path: cleanPath,
            base64: cleanBase64
          })
        });
        const localData = await localRes.json().catch(() => ({}));
        if (localRes.ok && localData.success) {
          console.log('[Admin LocalSync] Wrote asset directly to disk:', cleanPath);
          return { success: true, localDisk: true, data: localData };
        }
      } catch (e) {
        console.warn('[Admin LocalSync] Local server not reachable on 5505, using fallback:', e);
        showToast('⚠️ Local Sync Server (port 5505) चालू नहीं है — GitHub fallback से sync होगा।', 'info');
      }
    }

    // 2. Production / Remote auto-sync fallback
    const apiUrl = getAutoSyncApiUrl();

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

  function getPreviewImgSrc(item, field = 'image', fallback = '') {
    if (!item) return fallback;
    if (item.image_preview) return item.image_preview;
    const path = item[field] || '';
    if (!path) return fallback;
    try {
      const offSync = JSON.parse(localStorage.getItem('AI_OFFLINE_UPLOADS') || '{}');
      if (offSync[path]) return offSync[path];
      const norm = '/' + path.replace(/^\/+/, '');
      if (offSync[norm]) return offSync[norm];
    } catch (e) {}
    return path || fallback;
  }

  async function compressImageToWebp(file, maxTargetBytes = 180000, maxWidth = 1600) {
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

            let quality = 0.88;
            let dataUrl = canvas.toDataURL('image/webp', quality);
            let sizeBytes = Math.round((dataUrl.length * 3) / 4);

            const qualitySteps = [0.82, 0.76, 0.70];
            for (let i = 0; i < qualitySteps.length && sizeBytes > maxTargetBytes; i++) {
              quality = qualitySteps[i];
              dataUrl = canvas.toDataURL('image/webp', quality);
              sizeBytes = Math.round((dataUrl.length * 3) / 4);
            }

            // Only downscale if drastically exceeding sizeBytes and width is still very wide (>1200px)
            if (sizeBytes > maxTargetBytes && w > 1200) {
              const scaleCanvas = document.createElement('canvas');
              const scaleW = Math.round(w * 0.85);
              const scaleH = Math.round(h * 0.85);
              scaleCanvas.width = scaleW;
              scaleCanvas.height = scaleH;
              const sctx = scaleCanvas.getContext('2d');
              sctx.drawImage(canvas, 0, 0, scaleW, scaleH);
              dataUrl = scaleCanvas.toDataURL('image/webp', 0.72);
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
    // Auto-detect folder based on upload type
    let folder = 'images/banners';
    if (category === 'product') folder = 'images/products';
    else if (category === 'kpi_card' || category === 'kpi_section') folder = 'images/kpi';
    else if (category === 'review' || category === 'achiever') folder = 'images/team';
    else if (category === 'floating_banner') folder = 'images/banners';
    return `${folder}/${category}-${cleanName}-${stamp}-${rand}.webp`;
  }

  window.handleAdminImageUpload = async function(event, targetType, targetIndex, fieldName = 'image') {
    const file = event.target?.files?.[0];
    if (!file) return;

    const isBanner = ['hero_slide', 'floating_banner', 'banner', 'og_image'].includes(targetType);
    const maxTargetBytes = isBanner ? 180000 : 75000;
    const maxWidth = isBanner ? 1600 : 800;

    showToast(`⏳ इमेज प्रोसेस हो रही है (${isBanner ? 'HD WebP 1600px' : 'WebP'} कम्प्रेशन)...`, 'info');

    try {
      const { dataUrl, sizeBytes } = await compressImageToWebp(file, maxTargetBytes, maxWidth);
      if (!dataUrl) {
        showToast('❌ इमेज प्रोसेस करने में त्रुटि', 'error');
        return;
      }

      const sizeKb = (sizeBytes / 1024).toFixed(1);
      const generatedPath = generateAssetPath(targetType, file.name);
      const webpPath = '/' + generatedPath;

      // Cache locally in browser offline uploads store
      try {
        const offSync = JSON.parse(localStorage.getItem('AI_OFFLINE_UPLOADS') || '{}');
        offSync[webpPath] = dataUrl;
        localStorage.setItem('AI_OFFLINE_UPLOADS', JSON.stringify(offSync));
      } catch (e) {}

      if (targetType === 'hero_slide' && currentSlides[targetIndex]) {
        currentSlides[targetIndex][fieldName] = webpPath;
        currentSlides[targetIndex]['image_preview'] = dataUrl;
        renderHeroSlidesInBuilder();
      } else if (targetType === 'floating_banner') {
        const inputEl = document.getElementById('pe_input_floating_banner_img');
        if (inputEl) inputEl.value = webpPath;
        const chkEl = document.getElementById('pe_chk_floating_banner');
        if (chkEl) chkEl.checked = true;
        const prevWrap = document.getElementById('pe_floating_banner_preview');
        const prevImg = document.getElementById('pe_floating_banner_preview_img');
        if (prevWrap && prevImg) {
          prevImg.src = dataUrl;
          prevWrap.style.display = 'block';
        }
      } else if (targetType === 'achiever' && currentAchievers[targetIndex]) {
        currentAchievers[targetIndex][fieldName] = webpPath;
        currentAchievers[targetIndex]['image_preview'] = dataUrl;
        renderAchieversList();
      } else if (targetType === 'health_card' && currentHealthDiseases[targetIndex]) {
        currentHealthDiseases[targetIndex][fieldName] = webpPath;
        currentHealthDiseases[targetIndex]['image_preview'] = dataUrl;
        renderHealthCardsInBuilder();
      } else if (targetType === 'crop_card' && currentCrops[targetIndex]) {
        currentCrops[targetIndex][fieldName] = webpPath;
        currentCrops[targetIndex]['image_preview'] = dataUrl;
        renderCropCardsInBuilder();
      } else if (targetType === 'pashu_card' && currentPashuCards[targetIndex]) {
        currentPashuCards[targetIndex][fieldName] = webpPath;
        currentPashuCards[targetIndex]['image_preview'] = dataUrl;
        renderPashuCardsInBuilder();
      } else if (targetType === 'marketing_card' && currentMarketingCards[targetIndex]) {
        currentMarketingCards[targetIndex][fieldName] = webpPath;
        currentMarketingCards[targetIndex]['image_preview'] = dataUrl;
        renderMarketingCardsInBuilder();
      } else if (targetType === 'review' && currentReviews[targetIndex]) {
        currentReviews[targetIndex][fieldName] = webpPath;
        currentReviews[targetIndex]['image_preview'] = dataUrl;
        renderReviewsInBuilder();
      } else if (targetType === 'product' && currentProducts[targetIndex]) {
        currentProducts[targetIndex][fieldName] = webpPath;
        currentProducts[targetIndex]['image_preview'] = dataUrl;
        renderProductsInBuilder();
      } else if (targetType === 'kpi_card' && currentKpiCards[targetIndex]) {
        currentKpiCards[targetIndex][fieldName] = webpPath;
        currentKpiCards[targetIndex]['image_preview'] = dataUrl;
        renderKpiCardsInBuilder();
      } else if (targetType === 'kpi_section' && currentPageKpiSections[targetIndex]) {
        currentPageKpiSections[targetIndex][fieldName] = webpPath;
        currentPageKpiSections[targetIndex]['image_preview'] = dataUrl;
        renderPageKpiSectionsInBuilder();
      } else if (targetType === 'og_image') {
        const inputEl = document.getElementById('pe_input_og_image');
        if (inputEl) inputEl.value = webpPath;
        const prevWrap = document.getElementById('pe_og_image_preview');
        const prevImg = document.getElementById('pe_og_image_preview_img');
        if (prevWrap && prevImg) {
          prevImg.src = dataUrl;
          prevWrap.style.display = 'block';
        }
      }

      showToast(`⚡ HD WebP तैयार (${sizeKb} KB) | सर्वर व GitHub पर सिंक हो रही है...`, 'info');

      const syncRes = await syncAssetToGitHub(generatedPath, dataUrl);
      if (syncRes.success) {
        showToast(`✅ इमेज GitHub पर सफलतापूर्वक सिंक हो गई! (${sizeKb} KB HD WebP)`, 'success');
      } else {
        const _errMsg = syncRes.error || '';
        const _isTokenErr = _errMsg.includes('401') || _errMsg.includes('403') ||
          _errMsg.toLowerCase().includes('token') || _errMsg.toLowerCase().includes('bad credential');
        if (_isTokenErr) {
          showToast(`❌ GitHub Token expire हो गया! Vercel में GITHUB_TOKEN update करें। (इमेज सिर्फ इस browser में दिखेगी)`, 'error');
        } else {
          console.warn('[Admin] GitHub sync info (local preview active):', syncRes.error);
          showToast(`✅ इमेज तैयार (${sizeKb} KB) | प्रीव्यू सक्रिय! (GitHub sync pending)`, 'success');
        }
      }
    } catch (err) {
      console.error('[Admin] Upload error:', err);
      showToast('⚠️ अपलोड तैयार: स्थानीय प्रीव्यू सक्रिय', 'info');
    }
  };

  const defaultPages = [
    {
        "id": "page_home",
        "slug": "index",
        "name": "🏠 मुख्य पृष्ठ (Home Page)",
        "url": "/index.html",
        "category": "Core",
        "status": "active",
        "theme_primary": "#15803d",
        "theme_dark": "#0e5227",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "📢 10,000+ किसानों का पहला भरोसेमंद मंच | 24×7 WhatsApp AI डॉक्टर सहायता उपलब्ध! ✦ प्रमाणित ई-बुक्स व मंडी भाव",
        "hero_slides": [
            {
                "image": "/images/banners/kharif-master-guide-2026-hero-banner.webp",
                "tag": "🌾 खरीफ 2026 स्पेशल एडिशन",
                "title": "Aarogyam India - सम्पूर्ण किसान व डिजिटल ज्ञान मंच",
                "subtitle": "वैज्ञानिक खेती, फसल डॉक्टर, मंडी भाव, और 100% प्रमाणित डिजिटल ई-बुक्स",
                "cta_text": "📚 डिजिटल स्टोर देखें",
                "cta_link": "/ebooks/ebook.html",
                "cta_secondary_text": "🌱 कृषि हब",
                "cta_secondary_link": "/ebooks/agriculture.html"
            },
            {
                "image": "/images/banners/farmer-community-banner.jpeg",
                "tag": "👑 VIP Annual Pass",
                "title": "Aarogyam Pro VIP सदस्यता - 1 वर्ष का ऑल-एक्सेस",
                "subtitle": "सभी ई-बुक्स, लाइव वेबिनार्स और 24×7 WhatsApp AI डॉक्टर सहायता बिल्कुल मुफ़्त!",
                "cta_text": "👑 VIP मेम्बर बनें (₹99)",
                "cta_link": "/subscription.html",
                "cta_secondary_text": "🛒 कार्ट देखें",
                "cta_secondary_link": "/ebooks/cart.html"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_category_pills",
            "sec_shelves_bestseller",
            "sec_interspersed_marketing",
            "sec_shelves_new",
            "sec_combo_promo",
            "sec_videos",
            "sec_reviews",
            "sec_trust_guarantee",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [
            {
                "icon": "fa-book-open",
                "title": "120+ रंगीन पेज",
                "desc": "उच्च गुणवत्ता सचित्र मार्गदर्शिका"
            },
            {
                "icon": "fa-bolt",
                "title": "इंस्टेंट PDF डाउनलोड",
                "desc": "भुगतान के तुरंत बाद आजीवन एक्सेस"
            },
            {
                "icon": "fa-robot",
                "title": "24×7 WhatsApp AI डॉक्टर",
                "desc": "किताब पढ़ते समय तुरंत सवाल पूछें"
            },
            {
                "icon": "fa-shield-halved",
                "title": "100% सुरक्षित भुगतान",
                "desc": "UPI, PhonePe, GPay व कार्ड्स"
            }
        ],
        "videos": [
            {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "title": "📖 खरीफ मास्टर गाइड - अंदर के पेज व डेमो",
                "desc": "300+ वास्तविक फोटो और स्प्रे साइंस चार्ट का लाइव प्रीव्यू।",
                "ratio": "16:9"
            },
            {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "title": "📲 24×7 WhatsApp AI डॉक्टर सहायता कैसे काम करती है?",
                "desc": "किताब पढ़ते समय सवाल पूछने और तुरंत समाधान पाने का तरीका।",
                "ratio": "16:9"
            }
        ],
        "marketing_cards": [
            {
                "book_id": "BK001",
                "tag": "🔥 सर्वाधिक लोकप्रिय",
                "headline": "खरीफ फसल मास्टर गाइड 2026",
                "desc": "सोयाबीन, मक्का, धान व कपास की वैज्ञानिक खेती और रोग समाधान।",
                "sales_counter": "1,420+ किसानों ने खरीदा"
            },
            {
                "book_id": "BK002",
                "tag": "🌱 किसान का पॉकेट डॉक्टर",
                "headline": "खेती का डॉक्टर (फसल का डॉक्टर)",
                "desc": "रोग, कीट, फंगल और पोषक तत्वों की कमी की पहचान व सटीक इलाज।",
                "sales_counter": "980+ किसानों ने खरीदा"
            }
        ],
        "reviews": [
            {
                "name": "रामेश्वर पटेल",
                "location": "उज्जैन, मध्य प्रदेश",
                "rating": 5,
                "comment": "खरीफ मास्टर गाइड बहुत ही उपयोगी है। स्प्रे साइंस चार्ट से मेरी फसल बच गई।"
            },
            {
                "name": "सुरेश कुमार यादव",
                "location": "करनाल, हरियाणा",
                "rating": 5,
                "comment": "WhatsApp AI डॉक्टर सहायता से जब भी सवाल पूछा तुरंत उत्तर मिला। बहुत बढ़िया मंच!"
            }
        ],
        "faqs": [
            {
                "q": "ई-बुक खरीदने के बाद कैसे मिलेगी?",
                "a": "भुगतान होते ही आपको तुरंत PDF डाउनलोड लिंक मिलेगा और पुस्तक आपकी \"मेरी लाइब्रेरी\" में आजीवन सुरक्षित रहेगी।"
            },
            {
                "q": "क्या मैं मोबाइल पर पढ़ सकता हूँ?",
                "a": "हाँ, सभी पुस्तकें मोबाइल और टैबलेट के लिए पूरी तरह ऑप्टिमाइज़्ड हैं।"
            }
        ],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते आरोग्यम इंडिया, मुझे वेबसाइट व ई-बुक्स के बारे में जानकारी चाहिए।"
        },
        "audio_title": "मुख्य पृष्ठ (होम)",
        "audio_script": "नमस्ते {name} जी! आरोग्यम इंडिया में आपका हार्दिक स्वागत है। यह भारत का पहला संपूर्ण डिजिटल ज्ञान मंच है जहाँ किसानों और परिवारों के लिए सभी समाधान उपलब्ध हैं। यहाँ आपको खरीफ फसल मास्टर गाइड और खेती का डॉक्टर जैसी प्रमाणित ई-बुक्स, फसलों का सचित्र वैज्ञानिक स्प्रे शेड्यूल, गाय और भैंस में दूध व फैट वृद्धि के उपाय, और डायबिटीज, जोड़ों का दर्द व मोटापे का प्राकृतिक आयुर्वेदिक परामर्श मिलता है। किसी भी सवाल या समस्या के लिए आप सीधे व्हाट्सएप पर हमारे विशेषज्ञों से 24 घंटे निःशुल्क सलाह ले सकते हैं। आरोग्यम इंडिया के साथ जुड़ने के लिए धन्यवाद!"
    },
    {
        "id": "page_agriculture",
        "slug": "agriculture",
        "name": "🌱 कृषि मार्गदर्शिका हब (Agriculture Hub)",
        "url": "/ebooks/agriculture.html",
        "category": "eBooks",
        "status": "active",
        "theme_primary": "#15803d",
        "theme_dark": "#0e5227",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🌾 खरीफ व रबी स्पेशल फसल गाइड्स उपलब्ध | ₹198 में 2-बुक कॉम्बो बंडल व WhatsApp AI डॉक्टर सहायता!",
        "hero_slides": [
            {
                "image": "/images/books/kharif-master-guide-2026-cover.webp",
                "tag": "🌾 BESTSELLER AGRICULTURE EBOOK",
                "title": "खरीफ फसल मास्टर गाइड 2026",
                "subtitle": "धान, सोयाबीन व मक्का की सम्पूर्ण प्रैक्टिकल गाइड। बीज उपचार से लेकर कटाई तक सम्पूर्ण समाधान।",
                "cta_text": "⚡ अभी ऑर्डर करें (₹99)",
                "cta_link": "/ebooks/kharif-master-guide-2026.html",
                "cta_secondary_text": "← सभी पुस्तकें",
                "cta_secondary_link": "/ebooks/ebook.html"
            },
            {
                "image": "/images/books/fasal-ka-doctor-cover.webp",
                "tag": "🩺 सर्वाधिक बिकने वाली ई-बुक (TOP BESTSELLER)",
                "title": "खेती का डॉक्टर (फसल का डॉक्टर)",
                "subtitle": "रोग, कीट, वायरल, फंगल और पोषक तत्वों की कमी की पहचान सीखें। अब तक की सर्वाधिक बिकने वाली ई-बुक!",
                "cta_text": "⚡ अभी ऑर्डर करें (₹99)",
                "cta_link": "/ebooks/kheti-dr.html",
                "cta_secondary_text": "← सभी पुस्तकें",
                "cta_secondary_link": "/ebooks/ebook.html"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_combo_promo",
            "sec_kpi_badges",
            "sec_shelves_bestseller",
            "sec_interspersed_marketing",
            "sec_videos",
            "sec_reviews",
            "sec_trust_guarantee",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [
            {
                "icon": "fa-seedling",
                "title": "बीज उपचार व किस्में",
                "desc": "टॉप उन्नत वैरायटी का चयन"
            },
            {
                "icon": "fa-spray-can",
                "title": "स्प्रे साइंस चार्ट",
                "desc": "सटीक रासायनिक व जैविक स्प्रे"
            },
            {
                "icon": "fa-bug",
                "title": "कीट व रोग नियंत्रण",
                "desc": "लक्षण व प्रमाणित रोकथाम"
            },
            {
                "icon": "fa-comments",
                "title": "24×7 WhatsApp AI सहायता",
                "desc": "कृषि विशेषज्ञों का डिजिटल सहयोग"
            }
        ],
        "videos": [
            {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "title": "🎥 खरीफ फसलों में रोग व कीट प्रबंधन कैसे करें?",
                "desc": "खेत पर विशेषज्ञों द्वारा तैयार विस्तृत वीडियो गाइड।",
                "ratio": "16:9"
            }
        ],
        "marketing_cards": [
            {
                "book_id": "BK001",
                "tag": "🌾 खरीफ स्पेशल",
                "headline": "खरीफ फसल मास्टर गाइड 2026",
                "desc": "सोयाबीन, मक्का व धान के उत्पादन को दोगुना करने के वैज्ञानिक तरीके।",
                "sales_counter": "1,420+ किसानों ने खरीदा"
            },
            {
                "book_id": "BK002",
                "tag": "🌱 फसल डॉक्टर",
                "headline": "खेती का डॉक्टर",
                "desc": "सभी प्रकार के रोगों और कीटों का 1-क्लिक समाधान।",
                "sales_counter": "980+ किसानों ने खरीदा"
            }
        ],
        "reviews": [
            {
                "name": "दिनेश जाट",
                "location": "इंदौर, मध्य प्रदेश",
                "rating": 5,
                "comment": "सोयाबीन में खरपतवार नियंत्रण का बहुत ही सही फॉर्मूला इस किताब में मिला।"
            },
            {
                "name": "प्रदीप वर्मा",
                "location": "वाराणसी, उत्तर प्रदेश",
                "rating": 5,
                "comment": "धान की फसल के लिए धान मास्टर गाइड और खेती डॉक्टर दोनों लाजवाब हैं।"
            }
        ],
        "faqs": [
            {
                "q": "क्या कॉम्बो में दोनों पुस्तकें तुरंत मिलेंगी?",
                "a": "हाँ, पेमेंट के बाद दोनों PDF डाउनलोड लिंक्स तुरंत स्क्रीन पर दिखेंगे।"
            }
        ],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे कृषि पुस्तकों और कॉम्बो ऑफर के बारे में जानकारी चाहिए।"
        },
        "audio_title": "वैज्ञानिक कृषि व फसल सुरक्षा हब",
        "audio_script": "नमस्ते {name} जी! आरोग्यम कृषि हब में आपका स्वागत है। यहाँ आप खरीफ फसल मास्टर गाइड और फसल का डॉक्टर ई-बुक प्राप्त कर सकते हैं। साथ ही सभी प्रमुख फसलों के रोग, जैविक उपचार और नेटसर्फ बायो-फिट स्प्रे शेड्यूल की पूरी जानकारी देख सकते हैं।"
    },
    {
        "id": "page_health",
        "slug": "health",
        "name": "❤️ सम्पूर्ण स्वास्थ्य केंद्र (Health Hub)",
        "url": "/categories/health.html",
        "category": "Health",
        "status": "active",
        "theme_primary": "#dc2626",
        "theme_dark": "#7f1d1d",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🌿 50,000+ परिवारों का भरोसा! • सभी 8 स्वास्थ्य विकारों के प्राकृतिक आयुर्वेदिक समाधान • 24×7 WhatsApp AI डॉक्टर परामर्श सक्रिय",
        "hero_slides": [
            {
                "image": "/images/banners/health-banner.jpeg",
                "tag": "❤️ ALL HEALTH DOMAINS",
                "title": "आरोग्यम सम्पूर्ण स्वास्थ्य केंद्र",
                "subtitle": "डायबिटीज, जोड़ों का दर्द, वजन नियंत्रण, महिला व पुरुष स्वास्थ्य का प्राकृतिक आयुर्वेदिक समाधान",
                "cta_text": "🩺 समाधान चुनें",
                "cta_link": "#sec-categories",
                "cta_secondary_text": "💬 डॉक्टर परामर्श",
                "cta_secondary_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_reviews",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [
            {
                "icon": "fa-heart-pulse",
                "title": "100% प्राकृतिक",
                "desc": "हानिरहित आयुर्वेदिक फॉर्मूलेशन"
            },
            {
                "icon": "fa-user-doctor",
                "title": "AI डॉक्टर परामर्श",
                "desc": "24×7 व्यक्तिगत डाइट व सलाह"
            },
            {
                "icon": "fa-shield-halved",
                "title": "प्रमाणित शुद्धता",
                "desc": "GMP व ISO प्रमाणित तत्व"
            }
        ],
        "videos": [],
        "marketing_cards": [],
        "reviews": [
            {
                "name": "कमलेश शर्मा",
                "location": "भोपाल, मध्य प्रदेश",
                "rating": 5,
                "comment": "डायबिटीज केयर और डाइट प्लान से मेरा शुगर लेवल 3 महीने में काफी नियंत्रित हुआ।"
            }
        ],
        "faqs": [
            {
                "q": "क्या परामर्श के लिए कोई शुल्क है?",
                "a": "नहीं, आरोग्यम इंडिया पर प्राथमिक AI व विशेषज्ञ परामर्श निःशुल्क है।"
            }
        ],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे स्वास्थ्य समस्याओं के बारे में परामर्श चाहिए।"
        },
        "audio_title": "आरोग्यम संपूर्ण स्वास्थ्य केंद्र",
        "audio_script": "नमस्ते {name} जी! आरोग्यम स्वास्थ्य केंद्र में आपका स्वागत है। यहाँ आपको मोटापा, डायबिटीज, जोड़ों का दर्द, हेयर केयर और महिला स्वास्थ्य की संपूर्ण प्राकृतिक डाइट, योगासन और हर्बल उपचार मिलेंगे।"
    },
    {
        "id": "page_pashu",
        "slug": "pashu-palan",
        "name": "🐄 पशु पालन व दुग्ध संवर्धन हब (Pashu Palan Hub)",
        "url": "/pashu-palan.html",
        "category": "Agriculture",
        "status": "active",
        "theme_primary": "#0284c7",
        "theme_dark": "#075985",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🐄 10,000+ पशुपालकों का भरोसा | थनैला मुक्ति, दूध व फैट वृद्धि के 100% सफल फॉर्मूले",
        "hero_slides": [
            {
                "image": "/images/banners/pashu-palan-banner.jpg",
                "tag": "🐄 PASHU PALAN SPECIAL",
                "title": "पशु पालन, पोषण व दुग्ध संवर्धन हब",
                "subtitle": "गाय-भैंस में थनैला रोग, दूध व फैट वृद्धि, बांझपन और आफरा का 100% सफल निवारण",
                "cta_text": "🐄 समाधान देखें",
                "cta_link": "#problems-matrix",
                "cta_secondary_text": "📦 CFL ऑर्डर करें",
                "cta_secondary_link": "#products-cattle"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_reviews",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [
            {
                "icon": "fa-glass-water-droplet",
                "title": "1-2L दूध वृद्धि",
                "desc": "CFL मिनरल मिक्सचर व बायपास फैट"
            },
            {
                "icon": "fa-shield-virus",
                "title": "थनैला से सुरक्षा",
                "desc": "एंटीसेप्टिक व प्राकृतिक हर्बल अर्क"
            },
            {
                "icon": "fa-cow",
                "title": "प्रजनन स्वास्थ्य",
                "desc": "समय पर हीट में आना व गर्भधारण"
            }
        ],
        "videos": [],
        "marketing_cards": [],
        "reviews": [
            {
                "name": "भंवरलाल चौधरी",
                "location": "नागौर, राजस्थान",
                "rating": 5,
                "comment": "CFL मिनरल मिक्सचर देने के 15 दिन बाद ही मेरी भैंस का फैट 6 से बढ़कर 7.5 हो गया।"
            }
        ],
        "faqs": [
            {
                "q": "क्या CFL मिनरल मिक्सचर सभी पशुओं को दिया जा सकता है?",
                "a": "हाँ, गाय, भैंस और बकरियों के लिए यह अत्यंत लाभकारी है।"
            }
        ],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "राम राम, मुझे पशुओं के स्वास्थ्य व दुग्ध वृद्धि के बारे में जानकारी चाहिए।"
        },
        "audio_title": "पशु पालन व दुग्ध संवर्धन हब",
        "audio_script": "राम राम {name} जी! आरोग्यम पशु पालन केंद्र में आपका स्वागत है। यहाँ गाय-भैंस में थनैला रोग, दूध व फैट बढ़ाने के फॉर्मूले, बांझपन और पाचन समस्याओं का 100% सफल समाधान मिलेगा।",
        "products": [
            {
                "id": "PAS001",
                "name": "CFL Mineral Feed (1kg)",
                "price": 650.0,
                "mrp": 650.0,
                "badge": "दुग्ध वृद्धि बूस्टर",
                "description": "बायपास प्रोटीन, चेलेटेड मिनरल्स व प्रोबायोटिक्स युक्त। 7 दिन में दूध और फैट में अचूक सुधार लाता है।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "PAS002",
                "name": "Mastitis Shield Care Kit",
                "price": 850.0,
                "mrp": 850.0,
                "badge": "थनैला रक्षक",
                "description": "अयन की सूजन, गांठ व दूध में छीछड़ों को दूर करने वाली 100% सुरक्षित आयुर्वेदिक एंटी-इंफ्लेमेटरी किट।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "PAS003",
                "name": "Doodh Dhara High-Cal (1L)",
                "price": 450.0,
                "mrp": 450.0,
                "badge": "लिक्विड कैल्शियम",
                "description": "विटामिन D3, B12 व बायोटीन युक्त बायो-अवेलेबल कैल्शियम। ब्यात के बाद मिल्क फीवर से बचाता है।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "PAS004",
                "name": "Uterus Tone Cleanser (500ml)",
                "price": 550.0,
                "mrp": 550.0,
                "badge": "बांझपन निवारक",
                "description": "बच्चेदानी की गंदगी साफ कर समय पर शुद्ध हीट में लाता है और गर्भ ठहरने की संभावना 90% बढ़ाता है।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            }
        ]
    },
    {
        "id": "page_ebook_store",
        "slug": "ebook",
        "name": "📚 ई-बुक स्टोर (eBook Store Marketplace)",
        "url": "/ebooks/ebook.html",
        "category": "eBooks",
        "status": "active",
        "theme_primary": "#14532d",
        "theme_dark": "#052e16",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🚨 स्पेशल ऑफर: ₹1999 की VIP Pro मेम्बरशिप व AI डॉक्टर सहायता बिल्कुल FREE! ✦ 10,000+ किसानों का विश्वास",
        "hero_slides": [
            {
                "image": "/images/banners/ebook-banner.jpeg",
                "tag": "📚 ई-बुक स्टोर",
                "title": "आरोग्यम डिजिटल ई-बुक स्टोर",
                "subtitle": "कृषि, पशु पालन व स्वास्थ्य की सभी प्रमाणित हिंदी पुस्तकें",
                "cta_text": "⚡ अभी देखें",
                "cta_link": "#bestsellers-shelf",
                "cta_secondary_text": "🛒 कार्ट देखें",
                "cta_secondary_link": "/ebooks/cart.html"
            },
            {
                "image": "/images/banners/offer-banner-kharif-2026.webp",
                "tag": "🌾 खरीफ स्पेशल कॉम्बो",
                "title": "खरीफ फसल मास्टर गाइड 2026",
                "subtitle": "धान, सोयाबीन व मक्का की सम्पूर्ण प्रैक्टिकल गाइड",
                "cta_text": "⚡ मात्र ₹99",
                "cta_link": "/ebooks/kharif-master-guide-2026.html",
                "cta_secondary_text": "🛒 कार्ट में जोड़ें",
                "cta_secondary_link": "/ebooks/cart.html"
            },
            {
                "image": "/images/banners/agriculture-banner.jpeg",
                "tag": "🌱 वैज्ञानिक कृषि",
                "title": "खेती का डॉक्टर - रोग व कीट निवारण",
                "subtitle": "सटीक स्प्रे शेड्यूल व पोषक तत्व प्रबंधन",
                "cta_text": "⚡ अभी ऑर्डर करें",
                "cta_link": "/ebooks/kheti-dr.html",
                "cta_secondary_text": "🛒 कार्ट में जोड़ें",
                "cta_secondary_link": "/ebooks/cart.html"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_category_pills",
            "sec_shelves_bestseller",
            "sec_interspersed_marketing",
            "sec_shelves_new",
            "sec_shelves_coming_soon",
            "sec_videos",
            "sec_trust_guarantee",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [
            {
                "icon": "fa-bolt",
                "title": "Instant PDF",
                "desc": "1-सेकंड में डाउनलोड"
            },
            {
                "icon": "fa-seedling",
                "title": "100% Practical",
                "desc": "प्रमाणित वैज्ञानिक ज्ञान"
            },
            {
                "icon": "fa-robot",
                "title": "AI Doctor Support",
                "desc": "24×7 WhatsApp सहायता"
            },
            {
                "icon": "fa-lock",
                "title": "256-Bit SSL",
                "desc": "100% सुरक्षित चेकआउट"
            }
        ],
        "videos": [
            {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "title": "📖 खरीफ फसल मास्टर गाइड - अंदर के पेज व डेमो",
                "desc": "300+ वास्तविक फोटो और स्प्रे साइंस चार्ट का लाइव प्रीव्यू।",
                "ratio": "16:9"
            },
            {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "title": "📲 24×7 WhatsApp AI डॉक्टर सहायता कैसे काम करती है?",
                "desc": "किताब पढ़ते समय सवाल पूछने और तुरंत समाधान पाने का तरीका।",
                "ratio": "16:9"
            }
        ],
        "marketing_cards": [
            {
                "book_id": "BK001",
                "tag": "🔥 Best Seller",
                "headline": "खरीफ फसल मास्टर गाइड 2026",
                "desc": "सोयाबीन, मक्का, धान व कपास की सम्पूर्ण प्रैक्टिकल गाइड।",
                "sales_counter": "1,420+ किसानों ने खरीदा"
            },
            {
                "book_id": "BK002",
                "tag": "🌱 Top Rated",
                "headline": "खेती का डॉक्टर (फसल डॉक्टर)",
                "desc": "रोग, कीट और फंगल का 1-क्लिक समाधान।",
                "sales_counter": "980+ किसानों ने खरीदा"
            }
        ],
        "reviews": [
            {
                "name": "मनोज सिंह",
                "location": "भोपाल, मध्य प्रदेश",
                "rating": 5,
                "comment": "किंडल जैसी 3D कवर्स और शानदार लेआउट! तुरंत डाउनलोड हो गया।"
            },
            {
                "name": "विक्रम सिंह",
                "location": "जयपुर, राजस्थान",
                "rating": 5,
                "comment": "Aarogyam India का यह स्टोर किसानों के लिए बहुत बड़ा वरदान है।"
            }
        ],
        "faqs": [
            {
                "q": "क्या पुस्तकें डाउनलोड के बाद ऑफलाइन पढ़ी जा सकती हैं?",
                "a": "हाँ, एक बार डाउनलोड करने के बाद आप बिना इंटरनेट के भी कभी भी पढ़ सकते हैं।"
            }
        ],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे ई-बुक स्टोर के बारे में जानकारी चाहिए।"
        },
        "audio_title": "आरोग्यम डिजिटल ई-बुक स्टोर",
        "audio_script": "नमस्ते {name} जी! आरोग्यम ई-बुक स्टोर में आपका स्वागत है। यहाँ आपको कृषि, पशु पालन और स्वास्थ्य से संबंधित सभी प्रमाणित हिंदी पुस्तकें मिलेंगी। किसी भी पुस्तक का डेमो देख सकते हैं या मात्र 99 रुपये में तुरंत डाउनलोड कर सकते हैं।"
    },
    {
        "id": "page_cart",
        "slug": "cart",
        "name": "🛒 शॉपिंग कार्ट (Shopping Cart)",
        "url": "/ebooks/cart.html",
        "category": "Checkout",
        "status": "active",
        "theme_primary": "#15803d",
        "theme_dark": "#0e5227",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "⚡ 256-Bit SSL सुरक्षित भुगतान | इंस्टेंट PDF डाउनलोड व लाइफटाइम एक्सेस",
        "hero_slides": [],
        "sections_order": [
            "sec_ticker",
            "sec_trust_guarantee",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे कार्ट चेकआउट में सहायता चाहिए।"
        }
    },
    {
        "id": "page_library",
        "slug": "my-library",
        "name": "📖 मेरी डिजिटल लाइब्रेरी (My Library)",
        "url": "/ebooks/my-library.html",
        "category": "User Area",
        "status": "active",
        "theme_primary": "#15803d",
        "theme_dark": "#0e5227",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "📖 आपकी सभी खरीदी गई ई-बुक्स और बोनस गाइड्स यहाँ सुरक्षित हैं",
        "hero_slides": [],
        "sections_order": [
            "sec_ticker",
            "sec_shelves_bestseller",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे मेरी लाइब्रेरी एक्सेस में मदद चाहिए।"
        }
    },
    {
        "id": "page_wishlist",
        "slug": "wishlist",
        "name": "❤️ मेरी विशलिस्ट (Saved Wishlist)",
        "url": "/ebooks/wishlist.html",
        "category": "User Area",
        "status": "active",
        "theme_primary": "#db2777",
        "theme_dark": "#831843",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "❤️ आपकी पसंदीदा पुस्तकें सुरक्षित हैं - जब चाहें 1-क्लिक में कार्ट में जोड़ें",
        "hero_slides": [],
        "sections_order": [
            "sec_ticker",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे विशलिस्ट में मदद चाहिए।"
        }
    },
    {
        "id": "page_profile",
        "slug": "profile",
        "name": "👤 यूजर प्रोफ़ाइल (User Profile)",
        "url": "/pages/profile.html",
        "category": "User Area",
        "status": "active",
        "theme_primary": "#15803d",
        "theme_dark": "#0e5227",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "👑 Aarogyam Pro VIP मेम्बरशिप डैशबोर्ड व सेटिंग्स",
        "hero_slides": [],
        "sections_order": [
            "sec_ticker",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे यूजर प्रोफ़ाइल में मदद चाहिए।"
        }
    },
    {
        "id": "page_mandi",
        "slug": "mandi",
        "name": "🌾 मंडी भाव (Mandi Rates Live)",
        "url": "/mandi.html",
        "category": "Utilities",
        "status": "active",
        "theme_primary": "#0284c7",
        "theme_dark": "#075985",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🌾 ताज़ा मंडी भाव अपडेट्स | सोयाबीन, गेहूं, धान, कपास और दलहन के दैनिक प्रमाणित दाम",
        "hero_slides": [],
        "sections_order": [
            "sec_ticker",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे आज के मंडी भाव के बारे में जानकारी चाहिए।"
        }
    },
    {
        "id": "page_weather",
        "slug": "weather",
        "name": "⛅ मौसम पूर्वानुमान (Live Weather)",
        "url": "/weather.html",
        "category": "Utilities",
        "status": "active",
        "theme_primary": "#0284c7",
        "theme_dark": "#075985",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "⛅ आज का मौसम, आगामी 7 दिनों का पूर्वानुमान व स्प्रे अनुकूलता अलर्ट्स",
        "hero_slides": [],
        "sections_order": [
            "sec_ticker",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे मौसम पूर्वानुमान के बारे में जानकारी चाहिए।"
        }
    },
    {
        "id": "page_kharif_guide",
        "slug": "kharif-master-guide-2026",
        "name": "🌾 खरीफ फसल मास्टर गाइड 2026 (Kharif Guide Landing Page)",
        "url": "/ebooks/kharif-master-guide-2026.html",
        "category": "Book Landing Page",
        "status": "active",
        "theme_primary": "#2E7D32",
        "theme_dark": "#1B5E20",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🌾 खरीफ स्पेशल: ₹299 की जगह मात्र ₹99 में सम्पूर्ण गाइड | धान • सोयाबीन • मक्का • कपास ✦ 24×7 AI डॉक्टर सपोर्ट",
        "hero_slides": [
            {
                "image": "/images/banners/kharif-master-guide-2026-hero-banner.webp",
                "tag": "🌾 Bestseller Agriculture eBook",
                "title": "खरीफ फसल मास्टर गाइड 2026",
                "subtitle": "धान • सोयाबीन • मक्का की सम्पूर्ण Practical Guide",
                "cta_text": "⚡ अभी ऑर्डर करें (₹99)",
                "cta_link": "/ebooks/checkout.html?id=BK001",
                "cta_secondary_text": "📖 फ्री डेमो देखें",
                "cta_secondary_link": "/ebooks/demo-kharif.html"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_combo_promo",
            "sec_videos",
            "sec_reviews",
            "sec_trust_guarantee",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [
            {
                "icon": "fa-seedling",
                "title": "150+ रंगीन पेज",
                "desc": "उच्च गुणवत्ता सचित्र मार्गदर्शिका"
            },
            {
                "icon": "fa-camera",
                "title": "300+ वास्तविक फोटो",
                "desc": "रोग, कीट व पोषण की वास्तविक पहचान"
            },
            {
                "icon": "fa-circle-check",
                "title": "Scientific Guide",
                "desc": "वैज्ञानिक व प्रैक्टिकल कृषि समाधान"
            },
            {
                "icon": "fa-robot",
                "title": "24×7 WhatsApp AI डॉक्टर",
                "desc": "किताब पढ़ते समय त्वरित समाधान"
            }
        ],
        "videos": [
            {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "title": "🎥 खरीफ फसल मास्टर गाइड - वीडियो ओवरव्यू व डेमो",
                "desc": "धान, सोयाबीन व मक्का की सम्पूर्ण सुरक्षा तकनीक।",
                "ratio": "16:9"
            }
        ],
        "marketing_cards": [
            {
                "book_id": "BK002",
                "tag": "🌱 कॉम्बो सुझाव",
                "headline": "खेती का डॉक्टर (फसल डॉक्टर)",
                "desc": "रोग, कीट और फंगल का 1-क्लिक समाधान।",
                "sales_counter": "980+ किसानों ने खरीदा"
            }
        ],
        "reviews": [
            {
                "name": "रामेश्वर पटेल",
                "location": "उज्जैन, मध्य प्रदेश",
                "rating": 5,
                "comment": "खरीफ मास्टर गाइड बहुत ही उपयोगी है। स्प्रे साइंस चार्ट से मेरी फसल बच गई।"
            },
            {
                "name": "सुरेश कुमार यादव",
                "location": "करनाल, हरियाणा",
                "rating": 5,
                "comment": "WhatsApp AI डॉक्टर सहायता से जब भी सवाल पूछा तुरंत उत्तर मिला। बहुत बढ़िया गाइड!"
            }
        ],
        "faqs": [
            {
                "q": "ई-बुक खरीदने के बाद कैसे मिलेगी?",
                "a": "भुगतान होते ही आपको तुरंत PDF डाउनलोड लिंक मिलेगा और पुस्तक आपकी \"मेरी लाइब्रेरी\" में आजीवन सुरक्षित रहेगी।"
            },
            {
                "q": "क्या मैं मोबाइल पर पढ़ सकता हूँ?",
                "a": "हाँ, सभी पुस्तकें मोबाइल और टैबलेट के लिए पूरी तरह ऑप्टिमाइज़्ड हैं।"
            }
        ],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे खरीफ फसल मास्टर गाइड 2026 के बारे में जानकारी चाहिए।"
        }
    },
    {
        "id": "page_kheti_dr",
        "slug": "kheti-dr",
        "name": "🩺 खेती का डॉक्टर (Kheti Ka Doctor Landing Page)",
        "url": "/ebooks/kheti-dr.html",
        "category": "Book Landing Page",
        "status": "active",
        "theme_primary": "#059669",
        "theme_dark": "#064e3b",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🩺 किसान का पॉकेट डॉक्टर: रोग, कीट, फंगल व पोषक तत्वों की कमी की पहचान व सटीक स्प्रे फॉर्मूला",
        "hero_slides": [
            {
                "image": "../images/banners/kheti-dr-banner-1.webp",
                "tag": "🩺 Pocket Doctor Edition",
                "title": "खेती का डॉक्टर (फसल का डॉक्टर)",
                "subtitle": "रोग, कीट, वायरल, फंगल और पोषण प्रबंधन का सचित्र गाइड",
                "cta_text": "⚡ अभी ऑर्डर करें (₹99)",
                "cta_link": "/ebooks/checkout.html?id=BK002",
                "cta_secondary_text": "📖 फ्री डेमो देखें",
                "cta_secondary_link": "/ebooks/demo-kharif.html"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_combo_promo",
            "sec_videos",
            "sec_reviews",
            "sec_trust_guarantee",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [
            {
                "icon": "fa-stethoscope",
                "title": "पॉकेट डॉक्टर",
                "desc": "खेत पर तुरंत रोग व कीट पहचान"
            },
            {
                "icon": "fa-spray-can",
                "title": "स्प्रे फॉर्मूले",
                "desc": "सटीक दवा व खुराक की तालिका"
            },
            {
                "icon": "fa-circle-check",
                "title": "120+ रंगीन पेज",
                "desc": "सचित्र व सरल हिंदी भाषा"
            },
            {
                "icon": "fa-robot",
                "title": "24×7 AI हेल्प",
                "desc": "WhatsApp पर तुरंत समाधान"
            }
        ],
        "videos": [
            {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "title": "🎥 खेती का डॉक्टर - वीडियो डेमो व गाइड",
                "desc": "फसलों के मुख्य रोगों की पहचान व वैज्ञानिक स्प्रे विधि।",
                "ratio": "16:9"
            }
        ],
        "marketing_cards": [
            {
                "book_id": "BK001",
                "tag": "🌾 कॉम्बो सुझाव",
                "headline": "खरीफ फसल मास्टर गाइड 2026",
                "desc": "धान, सोयाबीन व मक्का की अधिक पैदावार के गुर।",
                "sales_counter": "1,420+ किसानों ने खरीदा"
            }
        ],
        "reviews": [
            {
                "name": "कमलेश पाटीदार",
                "location": "रतलाम, मध्य प्रदेश",
                "rating": 5,
                "comment": "रोगों की फोटो देखकर पहचानना बहुत आसान हो गया। हर किसान के पास यह किताब होनी चाहिए।"
            }
        ],
        "faqs": [
            {
                "q": "क्या इसमें कीटनाशकों की मात्रा भी दी गई है?",
                "a": "हाँ, प्रति एकड़ व प्रति पंप सही खुराक व मिश्रण की विस्तृत जानकारी दी गई है।"
            }
        ],
        "whatsapp_support": {
            "number": "919876543210",
            "prompt": "नमस्ते, मुझे खेती का डॉक्टर ई-बुक के बारे में जानकारी चाहिए।"
        }
    },
    {
        "id": "page_cattle_care",
        "slug": "pashu-palan",
        "name": "🐄 पशु पालन व दुग्ध उत्पादन (Cattle Care Hub)",
        "url": "/pashu-palan.html",
        "category": "Livestock",
        "status": "active",
        "theme_primary": "#0284c7",
        "theme_dark": "#0369a1",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🐄 दुग्ध वृद्धि, बांझपन निवारण व पशु स्वास्थ्य | 24×7 WhatsApp AI पशु डॉक्टर परामर्श सक्रिय!",
        "hero_slides": [
            {
                "image": "/images/banners/pashu-palan-banner.jpg",
                "tag": "🐄 पशु पालन विशेष",
                "title": "पशु पालन व दुग्ध संवर्धन हब",
                "subtitle": "दुग्ध वृद्धि, बांझपन निवारण व थनैला उपचार",
                "cta_text": "💬 WhatsApp परामर्श",
                "cta_link": "https://wa.me/917974422572",
                "cta_secondary_text": "🛒 उत्पाद देखें",
                "cta_secondary_link": "#pashu-products"
            },
            {
                "image": "/images/banners/pashu-cow-care.jpg",
                "tag": "🥛 दुग्ध वृद्धि फॉर्मूला",
                "title": "गाय-भैंस में दूध व फैट वृद्धि",
                "subtitle": "नेचुरल हर्बल सप्लीमेंट्स और मिनरल मिक्सचर",
                "cta_text": "💬 ऑर्डर करें",
                "cta_link": "https://wa.me/917974422572",
                "cta_secondary_text": "📞 संपर्क करें",
                "cta_secondary_link": "#vet-consult"
            },
            {
                "image": "/images/banners/pashu-goat-care.jpg",
                "tag": "🐐 बकरी पालन गाइड",
                "title": "उन्नत बकरी पालन व वजन वृद्धि",
                "subtitle": "रोग रोकथाम व वैज्ञानिक पोषण प्रबंधन",
                "cta_text": "💬 जानकारी लें",
                "cta_link": "https://wa.me/917974422572",
                "cta_secondary_text": "📖 गाइड पढ़ें",
                "cta_secondary_link": "/ebooks/ebook.html"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_reviews",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [
            {
                "icon": "fa-cow",
                "title": "दूध उत्पादन वृद्धि",
                "desc": "प्राकृतिक आयुर्वेदिक मिनरल व पोषण"
            },
            {
                "icon": "fa-shield-virus",
                "title": "मस्टाइटिस व थनैला",
                "desc": "सटीक लक्षण पहचान व हर्बल उपचार"
            },
            {
                "icon": "fa-dna",
                "title": "बांझपन से मुक्ति",
                "desc": "समय पर हीट में लाना व गर्भाधान"
            },
            {
                "icon": "fa-robot",
                "title": "24×7 AI पशु डॉक्टर",
                "desc": "WhatsApp पर तुरंत परामर्श"
            }
        ],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे पशु पालन व दुग्ध वृद्धि के बारे में सलाह चाहिए।"
        },
        "audio_title": "पशु पालन व दुग्ध संवर्धन हब",
        "audio_script": "राम राम {name} जी! आरोग्यम पशु पालन केंद्र में आपका स्वागत है। यहाँ गाय-भैंस में थनैला रोग, दूध व फैट बढ़ाने के फॉर्मूले, बांझपन और पाचन समस्याओं का 100% सफल समाधान मिलेगा। आप सीएफएल और बायो-फिट उत्पाद सीधे व्हाट्सएप द्वारा ऑर्डर कर सकते हैं।",
        "products": [
            {
                "id": "PAS001",
                "name": "CFL Mineral Feed (1kg)",
                "price": 650.0,
                "mrp": 650.0,
                "badge": "दुग्ध वृद्धि बूस्टर",
                "description": "बायपास प्रोटीन, चेलेटेड मिनरल्स व प्रोबायोटिक्स युक्त। 7 दिन में दूध और फैट में अचूक सुधार लाता है।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "PAS002",
                "name": "Mastitis Shield Care Kit",
                "price": 850.0,
                "mrp": 850.0,
                "badge": "थनैला रक्षक",
                "description": "अयन की सूजन, गांठ व दूध में छीछड़ों को दूर करने वाली 100% सुरक्षित आयुर्वेदिक एंटी-इंफ्लेमेटरी किट।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "PAS003",
                "name": "Doodh Dhara High-Cal (1L)",
                "price": 450.0,
                "mrp": 450.0,
                "badge": "लिक्विड कैल्शियम",
                "description": "विटामिन D3, B12 व बायोटीन युक्त बायो-अवेलेबल कैल्शियम। ब्यात के बाद मिल्क फीवर से बचाता है।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "PAS004",
                "name": "Uterus Tone Cleanser (500ml)",
                "price": 550.0,
                "mrp": 550.0,
                "badge": "बांझपन निवारक",
                "description": "बच्चेदानी की गंदगी साफ कर समय पर शुद्ध हीट में लाता है और गर्भ ठहरने की संभावना 90% बढ़ाता है।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            }
        ]
    },
    {
        "id": "page_health_hub",
        "slug": "health-hub",
        "name": "❤️ सम्पूर्ण स्वास्थ्य केंद्र (Health & Wellness Hub)",
        "url": "/categories/health.html",
        "category": "Healthcare",
        "status": "active",
        "theme_primary": "#dc2626",
        "theme_dark": "#991b1b",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🌿 सम्पूर्ण 8 स्वास्थ्य विकारों के प्राकृतिक आयुर्वेदिक समाधान | 24×7 WhatsApp AI डॉक्टर परामर्श!",
        "hero_slides": [
            {
                "image": "/images/banners/health-banner.jpeg",
                "tag": "🌿 सम्पूर्ण स्वास्थ्य केंद्र",
                "title": "आरोग्यम हेल्थ एंड वेलनेस हब",
                "subtitle": "8 प्रमुख लाइफस्टाइल विकारों के प्राकृतिक आयुर्वेदिक समाधान",
                "cta_text": "💬 डॉक्टर से पूछें",
                "cta_link": "https://wa.me/917974422572",
                "cta_secondary_text": "🔍 रोग चुनें",
                "cta_secondary_link": "#health-categories"
            },
            {
                "image": "/images/banners/health-diabetes.jpg",
                "tag": "🩸 डायबिटीज केयर",
                "title": "प्राकृतिक शुगर नियंत्रण व रिवर्सल",
                "subtitle": "आयुर्वेदिक अर्क व वैज्ञानिक आहार तालिका",
                "cta_text": "📖 विस्तार से देखें",
                "cta_link": "/health/diabetes.html",
                "cta_secondary_text": "💬 परामर्श",
                "cta_secondary_link": "https://wa.me/917974422572"
            },
            {
                "image": "/images/banners/health-joint-care.jpg",
                "tag": "🦴 जॉइंट केयर",
                "title": "जोड़ों के दर्द व गठिया से मुक्ति",
                "subtitle": "नेचुरल हर्बल कार्टिलेज पोषण व तेल मालिश",
                "cta_text": "📖 विस्तार से देखें",
                "cta_link": "/health/joint-care.html",
                "cta_secondary_text": "💬 परामर्श",
                "cta_secondary_link": "https://wa.me/917974422572"
            },
            {
                "image": "/images/banners/health-weight-loss.jpg",
                "tag": "🔥 वेट लॉस",
                "title": "प्राकृतिक मोटापा व वजन नियंत्रण",
                "subtitle": "बिना कमजोरी के सुरक्षित फैट बर्निंग",
                "cta_text": "📖 विस्तार से देखें",
                "cta_link": "/health/weight-loss.html",
                "cta_secondary_text": "💬 परामर्श",
                "cta_secondary_link": "https://wa.me/917974422572"
            },
            {
                "image": "/images/banners/health-hair-care.jpg",
                "tag": "💇‍♀️ हेयर केयर",
                "title": "बाल झड़ना रोकें व डैंड्रफ मुक्ति",
                "subtitle": "भृंगराज व आंवला युक्त हर्बल हेयर थेरेपी",
                "cta_text": "📖 विस्तार से देखें",
                "cta_link": "/health/hair-care.html",
                "cta_secondary_text": "💬 परामर्श",
                "cta_secondary_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_category_pills",
            "sec_videos",
            "sec_reviews",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे स्वास्थ्य परामर्श चाहिए।"
        },
        "audio_title": "आरोग्यम संपूर्ण स्वास्थ्य केंद्र",
        "audio_script": "नमस्ते {name} जी! आरोग्यम स्वास्थ्य केंद्र में आपका स्वागत है। यहाँ आपको मोटापा, डायबिटीज, जोड़ों का दर्द, हेयर केयर और महिला स्वास्थ्य की संपूर्ण प्राकृतिक डाइट, योगासन और हर्बल उपचार मिलेंगे। अपनी समस्या का चयन करें और स्थायी स्वास्थ्य लाभ पाएं।"
    },
    {
        "id": "page_health_diabetes",
        "slug": "health-diabetes",
        "name": "🩸 मधुमेह (डायबिटीज) केयर",
        "url": "/health/diabetes.html",
        "category": "Healthcare Sub-page",
        "status": "active",
        "theme_primary": "#2563eb",
        "theme_dark": "#1e40af",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🩸 15,000+ लोगों ने प्राकृतिक रूप से शुगर नियंत्रित की | 24×7 AI डॉक्टर परामर्श सक्रिय",
        "hero_slides": [
            {
                "image": "/images/banners/health-diabetes.jpg",
                "tag": "🩸 डायबिटीज केयर",
                "title": "मधुमेह व ब्लड शुगर नियंत्रण",
                "subtitle": "इंसुलिन संवेदनशीलता सुधार व प्राकृतिक अर्क",
                "cta_text": "💬 AI डॉक्टर परामर्श",
                "cta_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे मधुमेह / डायबिटीज समाधान चाहिए।"
        },
        "audio_title": "डायबिटीज व ब्लड शुगर नियंत्रण",
        "audio_script": "नमस्ते {name} जी! डायबिटीज केयर पेज पर आपका स्वागत है। यहाँ इंसुलिन रेजिस्टेंस दूर करने, शुगर लेवल सामान्य रखने की प्राकृतिक डाइट, एक्सरसाइज और आयुर्वेदिक फार्मूला उपलब्ध है।",
        "products": [
            {
                "id": "DB001",
                "name": "Madhu-Mukti Care (60 Cap)",
                "price": 750.0,
                "mrp": 750.0,
                "badge": "शुगर केयर कैप्सूल",
                "description": "गुड़मार, विजयसार, जामुन गुठली व गिलोय अर्क। इंसुलिन संवेदनशीलता सुधारकर फास्टिंग व PP शुगर को संतुलित रखता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "DB002",
                "name": "Karela-Jamun Juice (1L)",
                "price": 450.0,
                "mrp": 450.0,
                "badge": "प्योर अर्क",
                "description": "शुद्ध नीम, करेला व जामुन का कोल्ड प्रेस्ड रस। रक्त शोधन करता है और भोजन के बाद शुगर स्पाइक रोकता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "DB003",
                "name": "Gymnema Churna (100g)",
                "price": 350.0,
                "mrp": 350.0,
                "badge": "शुगर डिस्ट्रॉयर",
                "description": "मीठे की लत (Sugar Craving) मिटाता है और आंतों में ग्लूकोज के अवशोषण को कम करता है।",
                "image": "/images/logo/logo.png"
            }
        ]
    },
    {
        "id": "page_health_weight_loss",
        "slug": "health-weight-loss",
        "name": "🔥 मोटापा व वजन नियंत्रण (Weight Loss)",
        "url": "/health/weight-loss.html",
        "category": "Healthcare Sub-page",
        "status": "active",
        "theme_primary": "#d97706",
        "theme_dark": "#b45309",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🔥 बिना कमजोरी या भूखे रहे प्राकृतिक फैट बर्निंग | फ्री डाइट चार्ट उपलब्ध",
        "hero_slides": [
            {
                "image": "/images/banners/health-weight-loss.jpg",
                "tag": "🔥 वेट लॉस",
                "title": "मोटापा व प्राकृतिक वजन नियंत्रण",
                "subtitle": "जिद्दी चर्बी घटाने की सम्पूर्ण डाइट व हर्बल सप्लीमेंट",
                "cta_text": "💬 फ्री डाइट चार्ट लें",
                "cta_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे वजन घटाने / फैट लॉस का समाधान चाहिए।"
        },
        "audio_title": "मोटापा व प्राकृतिक वजन नियंत्रण",
        "audio_script": "नमस्ते {name} जी! वेट लॉस गाइड में आपका स्वागत है। यहाँ आपको पेट की जिद्दी चर्बी घटाने के मुख्य कारण, लक्षण, 24 घंटे का संपूर्ण डाइट चार्ट और फैट बर्नर हर्बल सप्लीमेंट की जानकारी मिलेगी।",
        "products": [
            {
                "id": "WL001",
                "name": "Slim-Fit Herbal Fat Burner",
                "price": 850.0,
                "mrp": 850.0,
                "badge": "फैट बर्नर",
                "description": "गार्सिनिया कैम्बोजिया, ग्रीन कॉफी व गुग्गुल अर्क युक्त। भूख को नियंत्रित कर जिद्दी फैट बर्न करता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "WL002",
                "name": "Triphala Detox Cleanse",
                "price": 650.0,
                "mrp": 650.0,
                "badge": "टॉक्सिन क्लींजर",
                "description": "आंतों में जमा पुराना मल व टॉक्सिन्स बाहर निकालता है। पेट फूलने और गैस से तुरंत मुक्ति।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "WL003",
                "name": "Metabolic Boost Green Tea",
                "price": 450.0,
                "mrp": 450.0,
                "badge": "मेटाबॉलिक टी",
                "description": "दालचीनी, तुलसी, लेमनग्रास व सौंठ का शक्तिशाली मिश्रण। दैनिक 2 कप पीने से कैलोरी बर्न 30% तेज।",
                "image": "/images/logo/logo.png"
            }
        ]
    },
    {
        "id": "page_health_joint_care",
        "slug": "health-joint-care",
        "name": "🦴 जोड़ों का दर्द व गठिया (Joint Care)",
        "url": "/health/joint-care.html",
        "category": "Healthcare Sub-page",
        "status": "active",
        "theme_primary": "#16a34a",
        "theme_dark": "#15803d",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🦴 घुटनों का दर्द, यूरिक एसिड व जोड़ों की ग्रीस बढ़ाएं | 100% हर्बल थेरेपी",
        "hero_slides": [
            {
                "image": "/images/banners/health-joint-care.jpg",
                "tag": "🦴 जॉइंट केयर",
                "title": "जोड़ों का दर्द व गठिया राहत",
                "subtitle": "कार्टिलेज मजबूती व यूरिक एसिड नियंत्रण",
                "cta_text": "💬 हर्बल थेरेपी परामर्श",
                "cta_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे जोड़ों के दर्द व गठिया का समाधान चाहिए।"
        },
        "audio_title": "जोड़ों का दर्द व गठिया राहत",
        "audio_script": "नमस्ते {name} जी! जोड़ों के दर्द व आर्थराइटिस केयर पेज पर आपका स्वागत है। कार्टिलेज को दोबारा मजबूत बनाने, यूरिक एसिड घटाने और सूजन दूर करने की सम्पूर्ण जानकारी यहाँ दी गई है।",
        "products": [
            {
                "id": "JC001",
                "name": "Sandhi-Sudha Pain Oil (100ml)",
                "price": 450.0,
                "mrp": 450.0,
                "badge": "दर्द निवारक तेल",
                "description": "शल्लाकी, निर्गुंडी, महानारायण व गंधपुरा तेल। 10 मिनट में जोड़ों की गहराई तक पहुंचकर दर्द खींचता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "JC002",
                "name": "Ortho-Care Cartilage Cap",
                "price": 850.0,
                "mrp": 850.0,
                "badge": "कार्टिलेज रिपेयर",
                "description": "ग्लूकोसामाइन, बोसवेलिया व अश्वगंधा। साइनोवियल फ्लूइड की कमी को दूर कर घुटनों का घिसना रोकता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "JC003",
                "name": "Natural Calcium & Vit D3",
                "price": 550.0,
                "mrp": 550.0,
                "badge": "बोन डेंसिटी",
                "description": "शंख भस्म व मोरिंगा आधारित प्राकृतिक बायो-कैल्शियम। पेट में पथरी बनाए बिना 100% अवशोषित होता है।",
                "image": "/images/logo/logo.png"
            }
        ]
    },
    {
        "id": "page_health_womens_care",
        "slug": "health-womens-care",
        "name": "🌸 महिला स्वास्थ्य (PCOD / PCOS Care)",
        "url": "/health/womens-care.html",
        "category": "Healthcare Sub-page",
        "status": "active",
        "theme_primary": "#db2777",
        "theme_dark": "#be185d",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🌸 PCOD, अनियमित पीरियड्स व हार्मोन संतुलन का सुरक्षित आयुर्वेदिक उपचार",
        "hero_slides": [
            {
                "image": "/images/banners/health-banner.jpeg",
                "tag": "🌸 महिला स्वास्थ्य",
                "title": "महिला स्वास्थ्य व हार्मोनल संतुलन",
                "subtitle": "PCOD, थायरॉयड व अनियमित पीरियड्स का सुरक्षित उपचार",
                "cta_text": "💬 महिला रोग विशेषज्ञ परामर्श",
                "cta_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे महिला स्वास्थ्य व हार्मोन संतुलन की सलाह चाहिए।"
        },
        "audio_title": "महिला स्वास्थ्य व हार्मोनल संतुलन",
        "audio_script": "नमस्ते {name} जी! महिला स्वास्थ्य केंद्र में आपका स्वागत है। पीसीओडी, अनियमित माहवारी, कमजोरी और हार्मोनल असंतुलन का सुरक्षित व हर्बल समाधान यहाँ मिलेगा।",
        "products": [
            {
                "id": "WC001",
                "name": "Nari-Kalyan PCOD Tonic (200ml)",
                "price": 450.0,
                "mrp": 450.0,
                "badge": "PCOD स्पेशल",
                "description": "अशोक, लोध्र, शतावरी व कंचनार गुग्गुल। गर्भाशय की सफाई कर ओवरी सिस्ट को प्राकृतिक रूप से घोलता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "WC002",
                "name": "Shatavari Extract Cap (60 Cap)",
                "price": 550.0,
                "mrp": 550.0,
                "badge": "हार्मोन बैलेंस",
                "description": "प्राकृतिक एस्ट्रोजन बूस्टर। कमजोरी, थकान, कमर दर्द दूर करता है और प्रजनन तंत्र को शक्ति प्रदान करता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "WC003",
                "name": "Iron & Folic Tonic (200ml)",
                "price": 350.0,
                "mrp": 350.0,
                "badge": "हीमोग्लोबिन बूस्टर",
                "description": "द्राक्षा, आंवला व लोह भस्म। बिना कब्ज किए हीमोग्लोबिन 15 दिन में बढ़ाता है और सुस्ती भगाता है।",
                "image": "/images/logo/logo.png"
            }
        ]
    },
    {
        "id": "page_health_hair_care",
        "slug": "health-hair-care",
        "name": "💇‍♀️ हेयर केयर (बाल झड़ना व डैंड्रफ)",
        "url": "/health/hair-care.html",
        "category": "Healthcare Sub-page",
        "status": "active",
        "theme_primary": "#0d9488",
        "theme_dark": "#0f766e",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "💇‍♀️ भृंगराज व आंवला से बालों का झड़ना रोकें | फ्री हेयर एनालिसिस उपलब्ध",
        "hero_slides": [
            {
                "image": "/images/banners/health-hair-care.jpg",
                "tag": "💇‍♀️ हेयर केयर",
                "title": "हेयर केयर व डैंड्रफ समाधान",
                "subtitle": "नए बाल उगाने व हेयर फॉल रोकने का प्राकृतिक फॉर्मूला",
                "cta_text": "💬 हेयर एनालिसिस करवाएं",
                "cta_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे हेयर केयर व बाल झड़ने का समाधान चाहिए।"
        },
        "audio_title": "हेयर केयर व डैंड्रफ समाधान",
        "audio_script": "नमस्ते {name} जी! हेयर केयर गाइड में आपका स्वागत है। नए बाल उगाने, बालों का झड़ना तुरंत रोकने और डैंड्रफ खत्म करने के प्राकृतिक फॉर्मूले और ऑयल्स की जानकारी यहाँ देखें।",
        "products": [
            {
                "id": "HC001",
                "name": "Kesh-Sanjivani Hair Oil (100ml)",
                "price": 450.0,
                "mrp": 450.0,
                "badge": "रूट न्यूट्रिशन ऑयल",
                "description": "भृंगराज, ब्राह्मी, आंवला, शिकाकाई व प्याज अर्क। जड़ों को मजबूत कर 15 दिन में बाल झड़ना रोकता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "HC002",
                "name": "Neem Anti-Dandruff Shampoo",
                "price": 350.0,
                "mrp": 350.0,
                "badge": "एंटी-डैंड्रफ",
                "description": "सल्फेट-फ्री हर्बल फॉर्मूला। नीम व टी-ट्री ऑयल स्कैल्प के फंगस को पहली वॉश में ही नष्ट कर देता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "HC003",
                "name": "Hair-Vital Biotin Cap (60 Cap)",
                "price": 750.0,
                "mrp": 750.0,
                "badge": "बायोटिन + DHT ब्लॉकर",
                "description": "प्राकृतिक सेसबानिया बायोटिन व ग्रीन टी अर्क। नए बाल उगाने और पतले बालों को मोटा करने में सक्षम।",
                "image": "/images/logo/logo.png"
            }
        ]
    },
    {
        "id": "page_health_skin_care",
        "slug": "health-skin-care",
        "name": "🌺 स्किन केयर (मुँहासे व त्वचा चमक)",
        "url": "/health/skin-care.html",
        "category": "Healthcare Sub-page",
        "status": "active",
        "theme_primary": "#e11d48",
        "theme_dark": "#9f1239",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🌸 नीम व मंजिष्ठा से रक्त शुद्धि व पिंपल्स से छुटकारा",
        "hero_slides": [
            {
                "image": "/images/banners/health-banner.jpeg",
                "tag": "🌺 स्किन केयर",
                "title": "स्किन ग्लो व त्वचा सुरक्षा",
                "subtitle": "पिंपल्स व झाइयों से मुक्ति और प्राकृतिक निखार",
                "cta_text": "💬 स्किन एक्सपर्ट से पूछें",
                "cta_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे स्किन केयर व पिंपल्स का समाधान चाहिए।"
        },
        "audio_title": "स्किन ग्लो व त्वचा सुरक्षा",
        "audio_script": "नमस्ते {name} जी! नेचुरल स्किन केयर पेज पर आपका स्वागत है। पिंपल्स, झाइयां और डल स्किन को ठीक कर चेहरे पर प्राकृतिक ग्लो लाने की आयुर्वेदिक टिप्स यहाँ उपलब्ध हैं।",
        "products": [
            {
                "id": "SK001",
                "name": "Rakt-Shodhak Syrup (200ml)",
                "price": 350.0,
                "mrp": 350.0,
                "badge": "रक्त शोधक",
                "description": "मंजिष्ठा, नीम, चिरायता व अनंतमूल। खून की गंदगी साफ कर पिंपल्स को जड़ से समाप्त करता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "SK002",
                "name": "Kumkumadi Radiance Oil (30ml)",
                "price": 650.0,
                "mrp": 650.0,
                "badge": "ग्लो सीरम",
                "description": "कश्मीरी केसर, चंदन व उशीर। झाइयों (Melasma), डार्क स्पॉट्स और झुर्रियों को मिटाकर प्राकृतिक तेज देता है।",
                "image": "/images/logo/logo.png"
            },
            {
                "id": "SK003",
                "name": "Neem-Tulsi Face Wash (100ml)",
                "price": 250.0,
                "mrp": 250.0,
                "badge": "हर्बल क्लींजर",
                "description": "सल्फेट-मुक्त प्राकृतिक फेस वॉश। अतिरिक्त तेल और बैक्टीरिया को हटाकर रोमछिद्रों को साफ रखता है।",
                "image": "/images/logo/logo.png"
            }
        ]
    },
    {
        "id": "page_health_kids_care",
        "slug": "health-kids-care",
        "name": "🧸 किड्स केयर (बाल पोषण व विकास)",
        "url": "/health/kids-care.html",
        "category": "Healthcare Sub-page",
        "status": "active",
        "theme_primary": "#d97706",
        "theme_dark": "#b45309",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🌟 ब्राह्मी व शंखपुष्पी से तेज दिमाग, भूख सुधार व इम्युनिटी वृद्धि",
        "hero_slides": [
            {
                "image": "/images/banners/achievers-banner.jpeg",
                "tag": "🧸 किड्स केयर",
                "title": "बच्चों का मानसिक व शारीरिक विकास",
                "subtitle": "स्मृति वृद्धि, भूख सुधार व रोग प्रतिरोधक क्षमता",
                "cta_text": "💬 पोषण विशेषज्ञ परामर्श",
                "cta_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे किड्स केयर व पोषण समाधान चाहिए।"
        },
        "audio_title": "बच्चों का मानसिक व शारीरिक विकास",
        "audio_script": "नमस्ते {name} जी! किड्स केयर पेज पर आपका स्वागत है। बच्चों की याददाश्त, एकाग्रता, लंबाई और रोग प्रतिरोधक क्षमता बढ़ाने का सम्पूर्ण पोषण प्लान यहाँ देखें।",
        "products": [
            {
                "id": "kids_choco_protein",
                "name": "Kids Choco-Nutri Protein Shake (500g)",
                "price": 999.0,
                "mrp": 1199.0,
                "badge": "शारीरिक विकास व वजन",
                "description": "स्वादिष्ट चॉकलेट फ्लेवर में व्हे प्रोटीन, सोया प्रोटीन, कैल्शियम और 24 आवश्यक विटामिन्स का संपूर्ण सम्मिश्रण।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "brahmi_brain_syrup",
                "name": "Brahmi-Shankhpushpi Brain Tonic (300ml)",
                "price": 399.0,
                "mrp": 499.0,
                "badge": "तेज याददाश्त व एकाग्रता",
                "description": "आयुर्वेदिक मेध्य रसायन। भूलने की समस्या दूर करे, पढ़ाई में एकाग्रता और मानसिक ऊर्जा में अप्रत्याशित सुधार।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "kids_immunity_gummies",
                "name": "Kids Herbal Immunity Gummies (60 Pcs)",
                "price": 549.0,
                "mrp": 699.0,
                "badge": "रोग प्रतिरोधक ढाल",
                "description": "आंवला, विटामिन C, जिंक और गिलोय युक्त च्यूएबल गमीज। मौसम बदलने पर होने वाले सर्दी-जुकाम से प्राकृतिक सुरक्षा।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            }
        ]
    },
    {
        "id": "page_health_home_care",
        "slug": "health-home-care",
        "name": "🏡 होम केयर (केमिकल-मुक्त सुरक्षित घर)",
        "url": "/health/home-care.html",
        "category": "Healthcare Sub-page",
        "status": "active",
        "theme_primary": "#0284c7",
        "theme_dark": "#0369a1",
        "fb_pixel": true,
        "ga_tag": true,
        "ticker_text": "🍃 फलों-सब्जियों से कीटनाशक हटाने व केमिकल-फ्री क्लीनिंग गाइड",
        "hero_slides": [
            {
                "image": "/images/banners/farmer-community-banner.jpeg",
                "tag": "🏡 होम केयर",
                "title": "नेचुरल होम केयर व टॉक्सिन-मुक्त घर",
                "subtitle": "केमिकल-मुक्त सुरक्षित व स्वच्छ वातावरण",
                "cta_text": "💬 होम केयर उत्पाद देखें",
                "cta_link": "https://wa.me/917974422572"
            }
        ],
        "sections_order": [
            "sec_ticker",
            "sec_hero_slider",
            "sec_kpi_badges",
            "sec_videos",
            "sec_faqs",
            "sec_help_support"
        ],
        "hidden_sections": [],
        "kpi_cards": [],
        "videos": [],
        "marketing_cards": [],
        "reviews": [],
        "faqs": [],
        "whatsapp_support": {
            "number": "917974422572",
            "prompt": "नमस्ते, मुझे केमिकल-मुक्त होम केयर समाधान चाहिए।"
        },
        "audio_title": "नेचुरल होम केयर व टॉक्सिन-मुक्त घर",
        "audio_script": "नमस्ते {name} जी! होम केयर पेज पर आपका स्वागत है। घर को केमिकल-मुक्त, स्वच्छ व सुरक्षित रखने के इको-फ्रेंडली समाधान यहाँ उपलब्ध हैं।",
        "products": [
            {
                "id": "natural_veggie_wash",
                "name": "Natural Veggie & Fruit Wash Concentrate (500ml)",
                "price": 399.0,
                "mrp": 499.0,
                "badge": "सब्जी व फल शोधक",
                "description": "प्राकृतिक एंजाइम व नीम अर्क। सब्जियों व फलों से 99.9% कीटनाशक, बैक्टीरिया और मोम की परत को सुरक्षित रूप से हटाए।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "herbal_floor_cleaner",
                "name": "Herbal Bio-Enzyme Floor Cleaner (1000ml)",
                "price": 299.0,
                "mrp": 399.0,
                "badge": "एसिड-फ्री फर्श सुरक्षा",
                "description": "नीम, लेमनग्रास और पाइन ऑयल से निर्मित। फर्श को चमकाए, मक्खी-मच्छरों को दूर रखे और बच्चों व पालतू जानवरों के लिए 100% सुरक्षित।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            },
            {
                "id": "bio_dishwash_gel",
                "name": "Bio-Enzyme Dishwash Liquid Gel (500ml)",
                "price": 269.0,
                "mrp": 349.0,
                "badge": "शून्य रासायनिक अवशेष",
                "description": "रीठा व नींबू का प्राकृतिक सत्व। चिकनाई को तुरंत काटे, बर्तनों पर कोई रासायनिक परत नहीं छोड़ता और हाथों की त्वचा को मुलायम रखता है।",
                "image": "/images/banners/pashu-palan-banner.jpg"
            }
        ]
    }
];

  // Load order: 1) site-pages-config.json (Server Truth Network First) -> 2) localStorage fallback -> 3) defaultPages
  let allPages = [];
  try {
    const cacheTime = Date.now();
    const pathsToTry = [
      '/data/site-pages-config.json?v=' + cacheTime,
      '../data/site-pages-config.json?v=' + cacheTime,
      './data/site-pages-config.json?v=' + cacheTime
    ];
    for (const p of pathsToTry) {
      try {
        const res = await fetch(p, { cache: 'no-store' });
        if (res.ok) {
          const j = await res.json();
          if (j && Array.isArray(j.sitePages) && j.sitePages.length > 0) {
            allPages = j.sitePages;
            break;
          }
        }
      } catch (err) {}
    }
  } catch (e) {}

  if (allPages.length === 0) {
    try {
      const stored = localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allPages = parsed;
        }
      }
    } catch (e) {}
  }

  if (allPages.length === 0) {
    allPages = JSON.parse(JSON.stringify(defaultPages));
  } else {
    // Merge missing default pages & restore missing product lists from defaultPages
    defaultPages.forEach(dp => {
      const existing = allPages.find(p => p.id === dp.id || p.slug === dp.slug);
      if (!existing) {
        allPages.push(JSON.parse(JSON.stringify(dp)));
      } else {
        // If existing has empty products but defaultPages has products, hydrate them!
        if ((!existing.products || existing.products.length === 0) && dp.products && dp.products.length > 0) {
          existing.products = JSON.parse(JSON.stringify(dp.products));
        }
        // Ensure category and url match ground truth
        if (!existing.category && dp.category) existing.category = dp.category;
        if (!existing.url && dp.url) existing.url = dp.url;
      }
    });
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

  // Load AarogyamTube recordings for video selector
  let availableTubeRecordings = [];
  try {
    const cacheTime = Math.floor(Date.now() / 300000);
    const res = await fetch('/data/webinar-recordings.json?v=' + cacheTime);
    if (res.ok) {
      const j = await res.json();
      availableTubeRecordings = j.recordings || [];
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
  let currentProducts = [];           // NEW: Product Manager
  let currentPageKpiSections = [];    // NEW: Page-specific KPI sections (health sub-pages)
  let currentDietImages = [];         // NEW: Multi-image gallery for Diet
  let currentExerciseImages = [];     // NEW: Multi-image gallery for Exercise
  let pagesCurrentPage = 1;
  let pagesPageSize = 25;
  let activeCategoryFilter = 'all';

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

    <!-- BACKDROP OVERLAY FOR SIDE DRAWER -->
    <div id="page-editor-drawer-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 99998; transition: opacity 0.25s ease;"></div>

    <!-- ADVANCED UNIVERSAL PAGE EDITOR STUDIO (FULL-SCREEN WORKSPACE) -->
    <div id="page-editor-form-card" class="pe-studio-container" style="display: none; position: fixed; inset: 0; width: 100%; height: 100%; max-width: 100%; z-index: 99999; margin: 0; border-radius: 0; border: none; background: #070d19; box-shadow: none; overflow: hidden; padding: 0; flex-direction: column; box-sizing: border-box;">
      <!-- 1. Top Header Bar -->
      <header class="pe-studio-header" style="height: 56px; min-height: 56px; flex-shrink: 0; background: #0f172a; padding: 0 16px; border-bottom: 1.5px solid #1e293b; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 18px rgba(0,0,0,0.4); z-index: 50;">
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; overflow: hidden;">
          <!-- Mobile Sidebar Drawer Toggle Button -->
          <button type="button" id="btn-toggle-pe-mobile-nav" class="pe-mobile-nav-toggle admin-button" style="display: none; background: #1e293b; border: 1.5px solid #38bdf8; color: #38bdf8; padding: 6px 12px; font-size: 0.8rem; font-weight: 800; border-radius: 8px; cursor: pointer; white-space: nowrap; align-items: center; gap: 4px; flex-shrink: 0;">
            <span>📑</span> <span>सेक्शंस</span>
          </button>
          <span class="pe-desktop-only" style="font-size: 1.3rem; flex-shrink: 0;">📑</span>
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; overflow: hidden;">
              <h3 id="page-editor-form-title" style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #60a5fa; line-height: 1.2; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
                Universal Page Editor Studio
              </h3>
              <span id="pe_studio_cat_pill" style="font-size: 0.7rem; background: rgba(59,130,246,0.2); color: #38bdf8; padding: 2px 8px; border-radius: 12px; font-weight: 700; flex-shrink: 0;">Studio Mode</span>
            </div>
            <small class="pe-desktop-only" style="color: var(--admin-muted); font-size: 0.72rem; display: block;">पेज के सभी सेक्शंस, 3D बैनर, WhatsApp उत्पाद व लाइव सेलिंग प्रबंधित करें</small>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <button type="button" id="btn-studio-save-top" onclick="window.savePageConfig()" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 900; padding: 7px 12px; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 4px 14px rgba(22,163,74,0.35); cursor: pointer; border-radius: 8px; white-space: nowrap;">
            <span>💾</span> <span>Save Live</span>
          </button>
          <button type="button" id="btn-close-page-editor-form" class="admin-button icon-button" style="color: #cbd5e1; font-size: 1.3rem; background: rgba(255,255,255,0.08); border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;" title="बंद करें">✕</button>
        </div>
      </header>

      <!-- 2. Mobile Horizontal Section Chips Bar (Visible on mobile screens <= 768px) -->
      <nav id="pe-mobile-chips-nav" class="pe-mobile-chips-bar" style="display: none; background: #090f1d; border-bottom: 1px solid #1e293b; padding: 8px 10px; overflow-x: auto; white-space: nowrap; gap: 6px; -webkit-overflow-scrolling: touch; z-index: 45;">
        <button type="button" class="pe-chip-link active" onclick="window.scrollToPeSection('pe-sec-basic', this)">⚙️ 1. मूल</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-ticker', this)">🚨 2. टिकर</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-audio', this)">🎙️ 3. ऑडियो</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-og', this)">🔗 4. OG</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-hero', this)">🖼️ 5. बैनर</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-section-products', this)">🛍️ 6. उत्पाद</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-kpis', this)">✨ 7. KPI</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-marketing', this)">📢 8. सेलिंग</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-section-health-cards', this)">🩺 9. रोग</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-section-clinical-breakdown', this)">🔬 9.1 विश्लेषण व डाइट</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-section-crop-cards', this)">🌾 10. फसल</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-section-pashu-cards', this)">🐄 11. पशु</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-section-page-kpi', this)">📋 12. पेज KPI</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-videos', this)">🎥 13. वीडियो</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-reviews', this)">💬 14. समीक्षा</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-faqs', this)">❓ 15. FAQ</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-sections-reorder', this)">🔀 16. क्रम</button>
        <button type="button" class="pe-chip-link" onclick="window.scrollToPeSection('pe-sec-whatsapp-support', this)">💬 17. AI डॉक्टर</button>
      </nav>

      <!-- 3. Studio Middle Workspace Area (Flex: 1, min-height: 0, overflow: hidden) -->
      <div class="pe-studio-body" style="flex: 1; min-height: 0; display: flex; overflow: hidden; position: relative;">
        <!-- Left Studio Navigation Sidebar -->
        <div id="pe-studio-nav-sidebar" class="pe-studio-sidebar" style="width: 240px; min-width: 240px; background: #0b1120; border-right: 1.5px solid #1e293b; overflow-y: auto; padding: 14px 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="font-size: 0.72rem; font-weight: 800; color: #64748b; text-transform: uppercase; padding: 4px 8px; letter-spacing: 0.5px;">सेक्शन नेविगेशन</div>
          <button type="button" class="pe-nav-link active" onclick="window.scrollToPeSection('pe-sec-basic', this)">⚙️ 1. मूल पेज सेटिंग्स</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-ticker', this)">🚨 2. न्यूज़ टिकर बार</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-audio', this)">🎙️ 3. ऑडियो वाचन व वॉइस</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-og', this)">🔗 4. OG व सोशल शेयर</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-hero', this)">🖼️ 5. हीरो व 3D बैनर</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-section-products', this)">🛍️ 6. WhatsApp उत्पाद</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-kpis', this)">✨ 7. KPI व फीचर्स</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-marketing', this)">📢 8. लाइव सेलिंग कार्ड्स</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-section-health-cards', this)">🩺 9. स्वास्थ्य रोग कार्ड्स</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-section-clinical-breakdown', this)">🔬 9.1 वैज्ञानिक विश्लेषण व डाइट</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-section-crop-cards', this)">🌾 10. फसल सुरक्षा कार्ड्स</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-section-pashu-cards', this)">🐄 11. पशु पालन कार्ड्स</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-section-page-kpi', this)">📋 12. पेज KPI सेक्शन</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-videos', this)">🎥 13. यूट्यूब वीडियो डेमो</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-reviews', this)">💬 14. पाठक समीक्षाएं</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-faqs', this)">❓ 15. अक्सर पूछे सवाल</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-sections-reorder', this)">🔀 16. सेक्शंस क्रम व दृश्यता</button>
          <button type="button" class="pe-nav-link" onclick="window.scrollToPeSection('pe-sec-whatsapp-support', this)">💬 17. 24x7 AI डॉक्टर सपोर्ट</button>
        </div>

        <!-- Right Main Workspace Canvas -->
        <div id="pe-studio-main-canvas" class="pe-studio-canvas" style="flex: 1; min-width: 0; overflow-y: auto; padding: 20px 24px 30px 24px; background: #070d19; scroll-behavior: smooth;">
          <form id="site-page-customizer-form" novalidate onsubmit="event.preventDefault(); window.savePageConfig(); return false;">
          <!-- 1. Basic Page Settings -->
          <div id="pe-sec-basic" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <span>⚙️ 1. मूल पेज सेटिंग्स (Page Information & Route)</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">पेज का नाम (Page Name)*</label>
              <input type="text" id="pe_input_name" class="admin-input" placeholder="उदा. 📚 ई-बुक स्टोर (eBook Store)" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">पेज स्लग (Slug)*</label>
              <input type="text" id="pe_input_slug" class="admin-input" placeholder="उदा. ebook, agriculture, health" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">Live URL / Path*</label>
              <input type="text" id="pe_input_url" class="admin-input" placeholder="/ebooks/ebook.html" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">कैटेगरी (Category)</label>
              <select id="pe_select_category" class="admin-select" style="width: 100%; padding: 8px 12px;">
                <option value="eBooks">eBooks / डिजिटल स्टोर</option>
                <option value="Agriculture">Agriculture / कृषि</option>
                <option value="Health">Health / स्वास्थ्य</option>
                <option value="Healthcare Sub-page">Healthcare Sub-page (रोग विशेष पेज)</option>
                <option value="Livestock">Livestock / पशु पालन</option>
                <option value="Book Landing Page">Book Landing Page (पुस्तक लैंडिंग पेज)</option>
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
        <div id="pe-sec-ticker" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>🚨 2. ब्रेकिंग न्यूज़ लाइव टिकर बार (Live Marquee Ticker)</span>
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">टिकर हेडलाइंस टेक्स्ट (Marquee Headline Text)</label>
            <input type="text" id="pe_input_ticker" class="admin-input" placeholder="उदा. 🌾 खरीफ फसल मास्टर गाइड 2026 पर 67% छूट! ✦ 📲 24×7 WhatsApp AI डॉक्टर सहायता मुफ़्त!" style="width: 100%; padding: 8px 12px;" />
          </div>
        </div>

        <!-- 2.1 Page Audio Voice Narration (Hindi Speech Script) -->
        <div id="pe-sec-audio" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #c084fc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
              <span>🗣️ 2.1 पेज का ऑडियो परिचय व हिंदी वॉइस स्क्रिप्ट (Page Audio Voice Narration)</span>
            </div>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <button type="button" id="btn-test-page-audio-speech" class="admin-button small-button" style="background: #7c3aed; color: #fff; font-weight: 800; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s; position: relative;">
                🔊 <span id="pe-audio-btn-label">आवाज़ टेस्ट करें</span>
              </button>
              <button type="button" id="btn-stop-page-audio-speech" class="admin-button small-button" style="background: #ef4444; color: #fff; font-weight: 800; font-size: 0.78rem; display: none; align-items: center; gap: 5px;" title="ऑडियो बंद करें">
                ⏹ रोकें (Stop)
              </button>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 10px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">ऑडियो शीर्षक (Audio Headline)</label>
              <input type="text" id="pe_input_audio_title" class="admin-input" placeholder="उदा. आरोग्यम इंडिया मुख्य पृष्ठ ऑडियो परिचय" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">कस्टम MP3 ऑडियो URL (वैकल्पिक)</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="text" id="pe_input_audio_url" class="admin-input" placeholder="https://... / audio.mp3" style="flex:1; padding: 7px 10px; font-size:0.8rem;" />
                <label class="admin-button small-button" style="background:#8b5cf6; color:#fff; cursor:pointer; padding:6px 10px; font-size:0.75rem; white-space:nowrap; margin:0;">
                  📁 MP3 अपलोड
                  <input type="file" id="pe_file_audio" accept="audio/*" style="display:none;" onchange="window.handlePageAudioFileUpload(this)">
                </label>
              </div>
            </div>
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">
              हिंदी वॉइस स्क्रिप्ट (Speech Script Text - यदि MP3 नहीं है तो यह ब्राउज़र की आवाज़ में बोला जाएगा)
            </label>
            <textarea id="pe_input_audio_script" class="admin-input" rows="3" placeholder="नमस्ते {name} जी! आरोग्यम इंडिया में आपका स्वागत है..." style="width: 100%; padding: 8px 12px; font-family: inherit; line-height: 1.5;"></textarea>
            <small style="color: var(--admin-muted); font-size: 0.74rem;">टिप: {name} लिखने पर यूजर का नाम अपने आप बोला जाएगा।</small>
          </div>
        </div>

        <!-- 2.2 Social Sharing, OpenGraph (OG) & WhatsApp Share Message -->
        <div id="pe-sec-og" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #0284c750;">
          <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <span>🔗 2.2 सोशल शेयरिंग, OpenGraph (OG) व WhatsApp शेयर संदेश (Social Share Engine Layer)</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">OG शेयर टाइटल (OG Title)</label>
              <input type="text" id="pe_input_og_title" class="admin-input" placeholder="उदा. Aarogyam India - खरीफ स्पेशल कृषि व स्वास्थ्य मंच" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">OG इमेज थंबनेल (WebP 10-15 KB)</label>
              <input type="text" id="pe_input_og_image" class="admin-input" placeholder="/images/banners/..." style="width: 100%; padding: 8px 12px;" />
              <div style="display:flex; gap:6px; margin-top:6px; align-items:center;">
                <input type="file" id="pe_file_og_image" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'og_image', 0, 'image')">
                <button type="button" onclick="document.getElementById('pe_file_og_image').click()" class="admin-button small-button" style="background:#0284c7; color:#fff; padding:4px 10px; font-size:0.75rem; font-weight:800;">
                  📁 थंबनेल अपलोड (WebP)
                </button>
              </div>
              <div id="pe_og_image_preview" style="margin-top:6px; display:none;">
                <img id="pe_og_image_preview_img" src="" alt="OG Preview" style="height:48px; border-radius:6px; object-fit:cover; border:1px solid #0284c7;" />
              </div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">OG संक्षिप्त विवरण (OG Description - WhatsApp/FB प्रीव्यू)</label>
            <textarea id="pe_input_og_description" rows="2" class="admin-input" placeholder="उदा. 100% प्रमाणित डिजिटल ई-बुक्स, फसल सुरक्षा गाइड व 24x7 WhatsApp AI डॉक्टर परामर्श।" style="width: 100%; padding: 8px 12px; font-size: 0.82rem;"></textarea>
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">WhatsApp व शेयर इंजन के साथ जाने वाला संदेश (Custom Share Message)</label>
            <textarea id="pe_input_share_message" rows="3" class="admin-input" placeholder="उदा. 🌾 *{title}*\n{description}\n👉 तुरंत पढ़ें व ऑर्डर करें:\n{url}" style="width: 100%; padding: 8px 12px; font-size: 0.82rem;"></textarea>
            <small style="color: var(--admin-muted); font-size: 0.72rem;">नोट: {title}, {description}, {url} अपने आप संबंधित पेज व रेफरल कोड से बदल जाएंगे।</small>
          </div>
        </div>

        <!-- 3. Multi-Slide Hero Banner Slider Customizer & 3D Floating Banner -->
        <div id="pe-sec-hero" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <!-- 3.0 Floating 3D Banner & Live Animation Layer -->
          <div style="background: #0f172a; border-radius: 10px; padding: 14px; margin-bottom: 16px; border: 1.5px solid #3b82f640;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
              <div style="font-weight: 800; color: #60a5fa; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
                <span>🔮 3.0 तैरता हुआ 3D बैनर व एनिमेशन (Floating 3D Banner Layer)</span>
              </div>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #38bdf8; cursor: pointer; font-weight: 700;">
                <input type="checkbox" id="pe_chk_floating_banner" style="width: 16px; height: 16px; accent-color: #3b82f6;" />
                <span>3D फ्लोटिंग बैनर सक्रिय करें</span>
              </label>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 8px;">
              <div>
                <label class="admin-label" style="font-size: 0.75rem; font-weight: 700; color: var(--admin-text);">बैनर इमेज URL (WebP)</label>
                <input type="text" id="pe_input_floating_banner_img" class="admin-input" placeholder="/images/banners/..." style="width: 100%; padding: 6px 10px; font-size: 0.8rem;" />
                <div style="display:flex; gap:6px; margin-top:4px;">
                  <input type="file" id="pe_file_floating_banner" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'floating_banner', 0, 'image')">
                  <button type="button" onclick="document.getElementById('pe_file_floating_banner').click()" class="admin-button small-button" style="background:#2563eb; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                    📁 3D इमेज अपलोड (WebP)
                  </button>
                </div>
                <div id="pe_floating_banner_preview" style="margin-top:6px; display:none;">
                  <img id="pe_floating_banner_preview_img" src="" alt="3D Preview" class="pe-3d-float-preview" style="height:55px; border-radius:6px; object-fit:cover; border:1px solid #3b82f6; box-shadow:0 8px 16px rgba(0,0,0,0.5);" />
                </div>
              </div>
              <div>
                <label class="admin-label" style="font-size: 0.75rem; font-weight: 700; color: var(--admin-text);">बैनर हेडलाइन / बैज (Badge Title)</label>
                <input type="text" id="pe_input_floating_banner_title" class="admin-input" placeholder="उदा. 🌟 विशेष संस्करण 2026" style="width: 100%; padding: 6px 10px; font-size: 0.8rem;" />
              </div>
              <div>
                <label class="admin-label" style="font-size: 0.75rem; font-weight: 700; color: var(--admin-text);">क्लिक लिंक (Action Link)</label>
                <input type="text" id="pe_input_floating_banner_link" class="admin-input" placeholder="/ebooks/kharif-master-guide-2026.html" style="width: 100%; padding: 6px 10px; font-size: 0.8rem;" />
              </div>
              <div>
                <label class="admin-label" style="font-size: 0.75rem; font-weight: 700; color: var(--admin-text);">3D एनिमेशन प्रभाव (Animation)</label>
                <select id="pe_select_floating_banner_anim" class="admin-select" style="width: 100%; padding: 6px 10px; font-size: 0.8rem;">
                  <option value="ublFloatBook3D">🌟 3D Smooth Float & Bob (ublFloatBook3D)</option>
                  <option value="gentle_pulse">💫 Gentle Pulse (हल्की चमक)</option>
                  <option value="none">स्थिर (Static)</option>
                </select>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🖼️ 3.1 हीरो बैनर स्लाइडर (Hero Banner Slider / Carousel)</span>
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
        <div id="pe-section-health-cards" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #dc262640;">
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
        <!-- 9.1 Deep Scientific Breakdown, Symptoms & 24-Hr Diet/Exercise Chart -->
        <div id="pe-section-clinical-breakdown" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #2563eb60;">
          <div style="font-weight: 800; color: #60a5fa; font-size: 0.95rem; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span>🔬 9.1 वैज्ञानिक विश्लेषण (कारण, लक्षण, खतरे) व 24-घंटे का डाइट/व्यायाम चार्ट</span>
            <span style="font-size: 0.72rem; background: rgba(37,99,235,0.2); color: #93c5fd; padding: 2px 8px; border-radius: 10px;">रोग विशेष व स्वास्थ्य सब-पेज</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 14px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">सेक्शन बैज (Badge Text)</label>
              <input type="text" id="pe_input_cb_badge" class="admin-input" placeholder="🔬 वैज्ञानिक विश्लेषण" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">मुख्य विश्लेषण शीर्षक (Main Title)</label>
              <input type="text" id="pe_input_cb_title" class="admin-input" placeholder="डायबिटीज: कारण, लक्षण व गंभीर खतरे" style="width: 100%; padding: 8px 12px;" />
            </div>
          </div>

          <!-- 3 Cards: Causes, Symptoms, Risks -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 14px;">
            <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: #60a5fa;">❓ कारण शीर्षक (Causes Title)</label>
              <input type="text" id="pe_input_cb_causes_title" class="admin-input" placeholder="❓ क्यों होती है डायबिटीज? (Causes)" style="width: 100%; padding: 6px 10px; margin-bottom: 8px;" />
              <label class="admin-label" style="font-size: 0.76rem; color: var(--admin-muted);">कारण फोटो (Causes Card Image)</label>
              <div style="display:flex; gap:6px; align-items:center; margin-bottom:8px;">
                <input type="text" id="pe_input_cb_causes_img" class="admin-input" placeholder="/images/banners/diabetes-causes-infographic.webp" style="flex:1; padding:6px 10px;" onchange="window.previewCbCardImage(0, this.value)" />
                <label class="admin-button small-button" style="background:#2563eb; color:#fff; cursor:pointer; padding:6px 10px; margin:0; font-size:0.75rem; white-space:nowrap;">
                  📁 अपलोड
                  <input type="file" accept="image/*" style="display:none;" onchange="window.handleCbCardImageUpload(0, this)">
                </label>
              </div>
              <div id="pe_cb_causes_img_preview" style="margin-bottom:8px; display:none; max-height:80px; border-radius:6px; overflow:hidden; border:1px solid #334155;">
                <img id="pe_cb_causes_img_preview_img" src="" style="width:100%; height:80px; object-fit:cover;">
              </div>
              <label class="admin-label" style="font-size: 0.76rem; color: var(--admin-muted);">कारण बिंदु (1 बिंदु प्रति लाइन)</label>
              <textarea id="pe_input_cb_causes_points" class="admin-textarea" rows="4" placeholder="इंसुलिन प्रतिरोध (Resistance)...&#10;पैंक्रियाज की कमजोरी...&#10;तनाव व कोर्टिसोल..." style="width: 100%; font-size: 0.8rem; padding: 6px 10px;"></textarea>
            </div>
            <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: #60a5fa;">⚠️ मुख्य लक्षण (Symptoms Title)</label>
              <input type="text" id="pe_input_cb_symptoms_title" class="admin-input" placeholder="⚠️ मुख्य लक्षण (Symptoms)" style="width: 100%; padding: 6px 10px; margin-bottom: 8px;" />
              <label class="admin-label" style="font-size: 0.76rem; color: var(--admin-muted);">लक्षण फोटो (Symptoms Card Image)</label>
              <div style="display:flex; gap:6px; align-items:center; margin-bottom:8px;">
                <input type="text" id="pe_input_cb_symptoms_img" class="admin-input" placeholder="/images/banners/diabetes-symptoms-infographic.webp" style="flex:1; padding:6px 10px;" onchange="window.previewCbCardImage(1, this.value)" />
                <label class="admin-button small-button" style="background:#2563eb; color:#fff; cursor:pointer; padding:6px 10px; margin:0; font-size:0.75rem; white-space:nowrap;">
                  📁 अपलोड
                  <input type="file" accept="image/*" style="display:none;" onchange="window.handleCbCardImageUpload(1, this)">
                </label>
              </div>
              <div id="pe_cb_symptoms_img_preview" style="margin-bottom:8px; display:none; max-height:80px; border-radius:6px; overflow:hidden; border:1px solid #334155;">
                <img id="pe_cb_symptoms_img_preview_img" src="" style="width:100%; height:80px; object-fit:cover;">
              </div>
              <label class="admin-label" style="font-size: 0.76rem; color: var(--admin-muted);">लक्षण बिंदु (1 बिंदु प्रति लाइन)</label>
              <textarea id="pe_input_cb_symptoms_points" class="admin-textarea" rows="4" placeholder="रात में बार-बार पेशाब जाना...&#10;भूख लगना और थकान...&#10;हाथ-पैरों में जलन या सुन्नपन..." style="width: 100%; font-size: 0.8rem; padding: 6px 10px;"></textarea>
            </div>
            <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: #f87171;">🚨 साइड इफेक्ट्स व खतरे (Risks Title)</label>
              <input type="text" id="pe_input_cb_risks_title" class="admin-input" placeholder="🚨 साइड इफेक्ट्स व खतरे (Risks)" style="width: 100%; padding: 6px 10px; margin-bottom: 8px;" />
              <label class="admin-label" style="font-size: 0.76rem; color: var(--admin-muted);">खतरे फोटो (Risks Card Image)</label>
              <div style="display:flex; gap:6px; align-items:center; margin-bottom:8px;">
                <input type="text" id="pe_input_cb_risks_img" class="admin-input" placeholder="/images/banners/diabetes-risks-infographic.webp" style="flex:1; padding:6px 10px;" onchange="window.previewCbCardImage(2, this.value)" />
                <label class="admin-button small-button" style="background:#dc2626; color:#fff; cursor:pointer; padding:6px 10px; margin:0; font-size:0.75rem; white-space:nowrap;">
                  📁 अपलोड
                  <input type="file" accept="image/*" style="display:none;" onchange="window.handleCbCardImageUpload(2, this)">
                </label>
              </div>
              <div id="pe_cb_risks_img_preview" style="margin-bottom:8px; display:none; max-height:80px; border-radius:6px; overflow:hidden; border:1px solid #334155;">
                <img id="pe_cb_risks_img_preview_img" src="" style="width:100%; height:80px; object-fit:cover;">
              </div>
              <label class="admin-label" style="font-size: 0.76rem; color: var(--admin-muted);">खतरे बिंदु (1 बिंदु प्रति लाइन)</label>
              <textarea id="pe_input_cb_risks_points" class="admin-textarea" rows="4" placeholder="किडनी डैमेज (नेफ्रोपैथी)...&#10;डायबिटिक न्यूरोपैथी...&#10;हार्ट अटैक व स्ट्रोक जोखिम..." style="width: 100%; font-size: 0.8rem; padding: 6px 10px;"></textarea>
            </div>
          </div>

          <!-- 2 Cards: 24-Hr Diet Protocol & Exercise/Lifestyle Guidance -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
            <div style="background: #064e3b30; padding: 12px; border-radius: 8px; border: 1.5px solid #05966950;">
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: #34d399;">🥗 24-घंटे का डाइट चार्ट (Diet Protocol Title)</label>
              <input type="text" id="pe_input_diet_title" class="admin-input" placeholder="शुगर बैलेंसिंग डाइट प्रोटोकॉल" style="width: 100%; padding: 6px 10px; margin-bottom: 8px;" />
              <label class="admin-label" style="font-size: 0.76rem; color: var(--admin-muted);">डाइट शेड्यूल (1 मील/समय प्रति लाइन)</label>
              <textarea id="pe_input_diet_items" class="admin-textarea" rows="4" placeholder="सुबह 6:30 AM: 1 चम्मच मेथी दाना भीगा पानी...&#10;नाश्ता 8:30 AM: बेसन चीला / स्प्राउट्स...&#10;दोपहर भोजन 1:00 PM: 1 बड़ी प्लेट सलाद + जौ-चना रोटी...&#10;शाम 5:00 PM: मखाने + दालचीनी चाय...&#10;रात भोजन 7:30 PM: मूंग दाल सूप..." style="width: 100%; font-size: 0.8rem; padding: 6px 10px; margin-bottom: 8px;"></textarea>
              
              <!-- Diet Multi-Images -->
              <div style="border-top: 1px dashed #05966950; padding-top: 8px; margin-top: 6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.75rem; font-weight:800; color:#34d399;">🖼️ डाइट फोटो गैलरी (Multiple Images)</span>
                  <button type="button" onclick="window.addDietImage()" class="admin-button small-button" style="background:#059669; color:#fff; font-size:0.72rem; padding:3px 8px; font-weight:800;">+ नई फोटो जोड़ें</button>
                </div>
                <div id="pe_diet_images_container" style="display:flex; flex-direction:column; gap:6px;"></div>
              </div>
            </div>

            <div style="background: #1e1b4b30; padding: 12px; border-radius: 8px; border: 1.5px solid #6366f150;">
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: #a5b4fc;">🧘 प्राणायाम, व्यायाम व उपचार (Exercise & Therapy Title)</label>
              <input type="text" id="pe_input_exercise_title" class="admin-input" placeholder="इंसुलिन सक्रियता व मोबिलिटी" style="width: 100%; padding: 6px 10px; margin-bottom: 8px;" />
              <label class="admin-label" style="font-size: 0.76rem; color: var(--admin-muted);">व्यायाम व नियम (1 अभ्यास प्रति लाइन)</label>
              <textarea id="pe_input_exercise_items" class="admin-textarea" rows="4" placeholder="1. मंडूकासन (Frog Pose): पैंक्रियाज पर दबाव देकर इंसुलिन स्राव बढ़ाता है।&#10;2. पवनमुक्तासन: पेट की गैस व पाचन दुरुस्त करता है।&#10;3. कपालभाति प्राणायाम: 15 मिनट रोजाना।&#10;4. भोजनोपरांत शतपावली: भोजन के बाद 20 मिनट टहलें।" style="width: 100%; font-size: 0.8rem; padding: 6px 10px; margin-bottom: 8px;"></textarea>

              <!-- Exercise Multi-Images -->
              <div style="border-top: 1px dashed #6366f150; padding-top: 8px; margin-top: 6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.75rem; font-weight:800; color:#a5b4fc;">🖼️ व्यायाम व योगासन फोटो (Multiple Images)</span>
                  <button type="button" onclick="window.addExerciseImage()" class="admin-button small-button" style="background:#4f46e5; color:#fff; font-size:0.72rem; padding:3px 8px; font-weight:800;">+ नई फोटो जोड़ें</button>
                </div>
                <div id="pe_exercise_images_container" style="display:flex; flex-direction:column; gap:6px;"></div>
              </div>
            </div>
          </div>
        </div>


        <!-- 3.2 Major Crops Protection Cards Manager (8 Cards) -->
        <div id="pe-section-crop-cards" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #16a34a40;">
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
        <div id="pe-section-pashu-cards" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #0284c740;">
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
        <div id="pe-sec-sections-reorder" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
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
        <div id="pe-sec-kpis" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
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
        <div id="pe-sec-marketing" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
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
        <div id="pe-sec-videos" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
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
        <div id="pe-sec-reviews" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
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
        <div id="pe-sec-faqs" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
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

        <!-- 10.1 Page-Specific KPI Sections (for Health Sub-pages: Symptoms / Yoga / Remedy) -->
        <div id="pe-section-page-kpi" style="display:none; background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #0284c750;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>✨ 10.1 पेज-विशिष्ट KPI सेक्शंस (लक्षण • योगासन • उपाय) — Page KPI Sections</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">इस पेज के लिए: बैनर इमेज, KPI शीर्षक, लक्षण/योगा की सूची और ऑडियो KPI टेक्स्ट यहाँ से जोड़ें</small>
            </div>
            <button type="button" id="btn_add_page_kpi_section" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 800;">
              + नया KPI सेक्शन जोड़ें
            </button>
          </div>
          <div id="pe_page_kpi_sections_container" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 10.2 Product Manager (उत्पाद: Image, Title, MRP, Discount%, Dose) -->
        <div id="pe-section-products" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1.5px solid #7c3aed50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #c084fc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🛍️ 10.2 उत्पाद प्रबंधक (Product Manager — इमेज • MRP • छूट% • खुराक)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">पेज पर दिखाए जाने वाले उत्पादों की WebP इमेज (auto-folder), MRP, डिस्काउंट% और खुराक प्रबंधित करें</small>
            </div>
            <button type="button" id="btn_add_product" class="admin-button small-button" style="background: #7c3aed; color: #fff; font-weight: 800;">
              + नया उत्पाद जोड़ें
            </button>
          </div>
          <div id="pe_products_container" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 10. WhatsApp AI Support & Social Share Settings -->
        <div id="pe-sec-whatsapp-support" style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 20px; border: 1px solid var(--admin-border);">
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

          </form>
        </div>
      </div>

      <!-- 4. Permanent Docked Studio Bottom Footer Bar -->
      <footer id="pe-studio-docked-footer" class="pe-studio-footer" style="height: 56px; min-height: 56px; flex-shrink: 0; background: #0b1220; border-top: 1.5px solid #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 50; box-shadow: 0 -4px 16px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden;">
          <span id="pe_footer_active_badge" style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
            🏡 मुख्य पृष्ठ (Home Page)
          </span>
          <span class="pe-desktop-only" style="font-size: 0.75rem; color: #94a3b8; white-space: nowrap;">
            • बदलाव करने के बाद 'Save Page' दबाएं
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; max-width: 100%;">
          <button type="button" id="btn-export-pages-json" onclick="window.exportPagesJson()" class="pe-desktop-only admin-button" style="background: #0284c7; color: #fff; font-weight: 800; padding: 8px 14px; font-size: 0.82rem; border-radius: 8px; cursor: pointer; white-space: nowrap;">
            📥 बैकअप JSON
          </button>
          <button type="button" id="btn-cancel-page-editor-form" class="admin-button" style="background: transparent; border: 1.5px solid #334155; color: #cbd5e1; padding: 8px 14px; font-weight: 700; font-size: 0.82rem; border-radius: 8px; cursor: pointer;">
            रद्द करें
          </button>
          <button type="button" id="btn-save-page-editor-form" onclick="window.savePageConfig()" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 900; padding: 9px 18px; font-size: 0.88rem; border-radius: 8px; box-shadow: 0 4px 14px rgba(22,163,74,0.4); cursor: pointer; white-space: nowrap;">
            💾 सुरक्षित करें (Save Page)
          </button>
        </div>
      </footer>
    </div>

    <!-- Active Site Pages Table / Compact Directory -->
    <div class="admin-card" style="margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--admin-text); display: flex; align-items: center; gap: 8px;">
            <span>📋 वेबसाइट पेजेस डायरेक्टरी (Universal Pages Directory)</span>
            <span id="pe_total_pages_count" style="font-size: 0.75rem; background: rgba(59,130,246,0.18); color: #38bdf8; padding: 2px 10px; border-radius: 12px; font-weight: 800;">23 Pages</span>
          </h3>
          <small style="color: var(--admin-muted); font-size: 0.76rem;">सभी 23 पेजों की सेटिंग्स, मॉड्यूल्स, और लाइव स्थिति एक कॉम्पैक्ट दृश्य में देखें व प्रबंधित करें</small>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="pe_search_input" class="admin-input" placeholder="🔍 नाम, रूट या कैटेगरी खोजें..." style="min-width: 260px; padding: 7px 12px; font-size: 0.84rem; border-radius: 8px;" />
        </div>
      </div>

      <!-- Category Filter Pills Bar -->
      <div id="pe_cat_filter_bar" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--admin-border);">
        <!-- Dynamically rendered -->
      </div>

      <div id="pe_table_container" class="admin-table-wrapper" style="overflow-x: auto;">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <style>
      /* Base Navigation Links */
      .pe-nav-link {
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #94a3b8;
        font-size: 0.8rem;
        font-weight: 700;
        text-align: left;
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        width: 100%;
      }
      .pe-nav-link:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #f8fafc;
      }
      .pe-nav-link.active {
        background: rgba(59, 130, 246, 0.16);
        color: #38bdf8;
        border-left: 3px solid #3b82f6;
      }

      /* Mobile Horizontal Chips */
      .pe-chip-link {
        background: #1e293b;
        border: 1px solid #334155;
        color: #cbd5e1;
        font-size: 0.74rem;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 20px;
        cursor: pointer;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
      }
      .pe-chip-link:hover, .pe-chip-link.active {
        background: #2563eb;
        color: #ffffff;
        border-color: #3b82f6;
        box-shadow: 0 2px 8px rgba(37,99,235,0.4);
      }
      .pe-mobile-chips-bar {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .pe-mobile-chips-bar::-webkit-scrollbar {
        display: none;
      }

      /* ==============================================================
         HIGH-CONTRAST STUDIO STYLES (NO MORE WHITE-ON-WHITE OR BLACK-ON-BLACK)
         ============================================================== */
      #page-editor-form-card {
        --pe-input-bg: #090e1a;
        --pe-input-text: #ffffff;
        --pe-input-border: #334155;
        --pe-label-text: #cbd5e1;
      }

      /* Inputs, Selects, and Textareas in Studio */
      #page-editor-form-card .admin-input,
      #page-editor-form-card .admin-select,
      #page-editor-form-card textarea {
        background: #090e1a !important;
        color: #ffffff !important;
        border: 1.5px solid #334155 !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
        font-size: 0.88rem !important;
        font-weight: 500 !important;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      #page-editor-form-card .admin-input:focus,
      #page-editor-form-card .admin-select:focus,
      #page-editor-form-card textarea:focus {
        border-color: #38bdf8 !important;
        background: #0d1629 !important;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25) !important;
        outline: none !important;
      }

      #page-editor-form-card .admin-input::placeholder,
      #page-editor-form-card textarea::placeholder {
        color: #64748b !important;
        opacity: 1 !important;
      }

      #page-editor-form-card select.admin-select option {
        background: #0f172a !important;
        color: #ffffff !important;
      }

      #page-editor-form-card label.admin-label,
      #page-editor-form-card label {
        color: #cbd5e1 !important;
        font-size: 0.8rem !important;
        font-weight: 700 !important;
        margin-bottom: 4px !important;
      }

      #page-editor-form-card small {
        color: #94a3b8 !important;
      }

      /* Light Theme Studio Overrides when body has light-theme */
      body.light-theme #page-editor-form-card {
        background: #f1f5f9 !important;
      }
      body.light-theme #page-editor-form-card header.pe-studio-header {
        background: #ffffff !important;
        border-bottom-color: #cbd5e1 !important;
      }
      body.light-theme #page-editor-form-card #page-editor-form-title {
        color: #1e40af !important;
      }
      body.light-theme #page-editor-form-card #pe-mobile-chips-nav {
        background: #ffffff !important;
        border-bottom-color: #cbd5e1 !important;
      }
      body.light-theme #page-editor-form-card .pe-chip-link {
        background: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
        color: #334155 !important;
      }
      body.light-theme #page-editor-form-card .pe-chip-link.active {
        background: #2563eb !important;
        color: #ffffff !important;
        border-color: #2563eb !important;
      }
      body.light-theme #page-editor-form-card #pe-studio-nav-sidebar {
        background: #ffffff !important;
        border-right-color: #cbd5e1 !important;
      }
      body.light-theme #page-editor-form-card .pe-nav-link {
        color: #475569 !important;
      }
      body.light-theme #page-editor-form-card .pe-nav-link:hover {
        background: #f1f5f9 !important;
        color: #0f172a !important;
      }
      body.light-theme #page-editor-form-card .pe-nav-link.active {
        background: rgba(37, 99, 235, 0.1) !important;
        color: #2563eb !important;
        border-left-color: #2563eb !important;
      }
      body.light-theme #page-editor-form-card #pe-studio-main-canvas {
        background: #f8fafc !important;
      }
      body.light-theme #page-editor-form-card [id^="pe-sec-"],
      body.light-theme #page-editor-form-card [id^="pe-section-"] {
        background: #ffffff !important;
        border-color: #cbd5e1 !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
      }
      body.light-theme #page-editor-form-card [id^="pe-sec-"] > div:first-child span,
      body.light-theme #page-editor-form-card [id^="pe-section-"] > div:first-child span {
        color: #0f172a !important;
      }
      body.light-theme #page-editor-form-card .admin-input,
      body.light-theme #page-editor-form-card .admin-select,
      body.light-theme #page-editor-form-card textarea {
        background: #ffffff !important;
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
      }
      body.light-theme #page-editor-form-card .admin-input:focus,
      body.light-theme #page-editor-form-card .admin-select:focus,
      body.light-theme #page-editor-form-card textarea:focus {
        border-color: #2563eb !important;
        background: #ffffff !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
      }
      body.light-theme #page-editor-form-card label.admin-label,
      body.light-theme #page-editor-form-card label {
        color: #1e293b !important;
      }
      body.light-theme #page-editor-form-card small {
        color: #64748b !important;
      }
      body.light-theme #page-editor-form-card select.admin-select option {
        background: #ffffff !important;
        color: #0f172a !important;
      }
      body.light-theme #page-editor-form-card .pe-studio-footer {
        background: #ffffff !important;
        border-top-color: #cbd5e1 !important;
      }
      body.light-theme #page-editor-form-card #btn-cancel-page-editor-form {
        background: #f1f5f9 !important;
        color: #475569 !important;
        border-color: #cbd5e1 !important;
      }

      /* ==============================================================
         MOBILE RESPONSIVE RULES (MAX-WIDTH: 768px)
         ============================================================== */
      @media (max-width: 768px) {
        .pe-desktop-only { display: none !important; }
        .pe-mobile-nav-toggle { display: inline-flex !important; }
        #pe-mobile-chips-nav { display: flex !important; }
        
        #page-editor-form-card {
          width: 100vw !important;
          max-width: 100vw !important;
          left: 0 !important;
          right: 0 !important;
          top: 0 !important;
          bottom: 0 !important;
        }

        /* Compact Header on Mobile so Close (X) is always fully visible */
        .pe-studio-header {
          padding: 0 10px !important;
          gap: 6px !important;
          width: 100% !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
        }
        .pe-studio-header > div:first-child {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .pe-studio-header > div:last-child {
          flex: 0 0 auto !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .pe-studio-header #page-editor-form-title {
          display: none !important;
        }
        #pe_studio_cat_pill {
          max-width: 110px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        #btn-close-page-editor-form {
          width: 34px !important;
          height: 34px !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Sidebar becomes off-canvas drawer on mobile */
        #pe-studio-nav-sidebar {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          bottom: 0 !important;
          width: 270px !important;
          z-index: 60 !important;
          transform: translateX(-100%) !important;
          box-shadow: 6px 0 24px rgba(0,0,0,0.7) !important;
        }
        #pe-studio-nav-sidebar.drawer-open {
          transform: translateX(0) !important;
        }
        
        /* Full width canvas on mobile */
        #pe-studio-main-canvas {
          padding: 12px 10px 24px 10px !important;
          width: 100% !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
        #pe-studio-main-canvas * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        #pe-studio-main-canvas input,
        #pe-studio-main-canvas select,
        #pe-studio-main-canvas textarea {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        #pe-studio-main-canvas [id^="pe-sec-"],
        #pe-studio-main-canvas [id^="pe-section-"] {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 14px 10px !important;
        }
        
        /* Stack all multi-column grids to 1 column */
        #pe-studio-main-canvas div[style*="grid-template-columns"] {
          grid-template-columns: 1fr !important;
        }
        
        /* Mobile Footer touch-friendly buttons */
        .pe-studio-footer {
          padding: 8px 10px !important;
          width: 100% !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
        }
        .pe-studio-footer > div:last-child {
          width: 100% !important;
          display: flex !important;
          justify-content: space-between !important;
          gap: 8px !important;
        }
        .pe-studio-footer #btn-cancel-page-editor-form {
          flex: 1 1 35% !important;
          text-align: center !important;
          padding: 8px 10px !important;
          font-size: 0.8rem !important;
          white-space: nowrap !important;
        }
        .pe-studio-footer #btn-save-page-editor-form {
          flex: 2 1 65% !important;
          text-align: center !important;
          padding: 8px 12px !important;
          font-size: 0.82rem !important;
          white-space: nowrap !important;
        }
        #pe_footer_active_badge {
          display: none !important;
        }
      }

      @keyframes ublFloatBook3DAnim {
        0% { transform: translateY(0px) rotateX(4deg) rotateY(-4deg); }
        50% { transform: translateY(-8px) rotateX(8deg) rotateY(-8deg); }
        100% { transform: translateY(0px) rotateX(4deg) rotateY(-4deg); }
      }
      .pe-3d-float-preview {
        animation: ublFloatBook3DAnim 3.5s ease-in-out infinite;
        perspective: 800px;
      }
    </style>
  `;

  const formCard = document.getElementById('page-editor-form-card');
  const toggleBtn = document.getElementById('btn-toggle-page-editor-form');
  const closeBtn = document.getElementById('btn-close-page-editor-form');
  const cancelBtn = document.getElementById('btn-cancel-page-editor-form');
  const footerSaveBtn = document.getElementById('btn-save-page-editor-form');
  const form = document.getElementById('site-page-customizer-form');
  const searchInput = document.getElementById('pe_search_input');
  const exportBtn = document.getElementById('btn-export-pages-json');
  const mobileNavToggle = document.getElementById('btn-toggle-pe-mobile-nav');
  const sidebarNav = document.getElementById('pe-studio-nav-sidebar');

  // Mobile sidebar drawer toggle
  mobileNavToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebarNav) {
      sidebarNav.classList.toggle('drawer-open');
    }
  });

  // Close mobile drawer when clicking canvas
  document.getElementById('pe-studio-main-canvas')?.addEventListener('click', () => {
    if (sidebarNav && sidebarNav.classList.contains('drawer-open')) {
      sidebarNav.classList.remove('drawer-open');
    }
  });

  function openPageDrawer() {
    const backdrop = document.getElementById('page-editor-drawer-backdrop');
    if (backdrop) backdrop.style.display = 'block';
    if (formCard) formCard.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closePageDrawer() {
    const backdrop = document.getElementById('page-editor-drawer-backdrop');
    if (backdrop) backdrop.style.display = 'none';
    if (formCard) formCard.style.display = 'none';
    if (sidebarNav) sidebarNav.classList.remove('drawer-open');
    document.body.style.overflow = '';
  }

  window.openPageDrawer = openPageDrawer;
  window.closePageDrawer = closePageDrawer;

  window.scrollToPeSection = function(sectionId, btnEl) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.querySelectorAll('.pe-nav-link, .pe-chip-link').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    // Also highlight corresponding link in other nav bar
    if (sectionId) {
      const relatedLinks = document.querySelectorAll(`[onclick*="'${sectionId}'"]`);
      relatedLinks.forEach(l => l.classList.add('active'));
    }
    // Close mobile drawer if open
    if (sidebarNav) sidebarNav.classList.remove('drawer-open');
  };

  const studioSaveTopBtn = document.getElementById('btn-studio-save-top');
  studioSaveTopBtn?.addEventListener('click', () => {
    savePageConfig();
  });
  footerSaveBtn?.addEventListener('click', () => {
    savePageConfig();
  });

  const floatImgInput = document.getElementById('pe_input_floating_banner_img');
  floatImgInput?.addEventListener('input', () => {
    const val = (floatImgInput.value || '').trim();
    const prevWrap = document.getElementById('pe_floating_banner_preview');
    const prevImg = document.getElementById('pe_floating_banner_preview_img');
    if (prevWrap && prevImg) {
      if (val) {
        prevImg.src = val;
        prevWrap.style.display = 'block';
      } else {
        prevWrap.style.display = 'none';
      }
    }
  });

  toggleBtn?.addEventListener('click', () => {
    resetPageForm();
    openPageDrawer();
  });

  closeBtn?.addEventListener('click', closePageDrawer);
  cancelBtn?.addEventListener('click', closePageDrawer);
  document.getElementById('page-editor-drawer-backdrop')?.addEventListener('click', closePageDrawer);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePageDrawer();
  });

  searchInput?.addEventListener('input', () => {
    pagesCurrentPage = 1;
    renderPagesTable();
  });
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
              <img src="${escapeHtml(getPreviewImgSrc(ach, 'image', '/images/team/achiever-1.jpg'))}" alt="${ach.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/team/achiever-1.jpg'">
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
            <input type="text" value="${escapeHtml(ach.image)}" onchange="window.updateAchieverField(${idx}, 'image', this.value); if (currentAchievers[${idx}]) delete currentAchievers[${idx}].image_preview; window.renderAchieversList();" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
            <div style="display:flex;gap:4px;margin-top:4px;align-items:center;">
              <input type="file" id="achiever_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'achiever', ${idx}, 'image')">
              <button type="button" onclick="document.getElementById('achiever_file_${idx}').click()" class="admin-button small-button" style="background:#3b82f6;color:#fff;padding:3px 8px;font-size:0.72rem;font-weight:800;">
                📁 फोटो अपलोड (WebP)
              </button>
              <select onchange="window.updateAchieverField(${idx}, 'image', this.value); if (currentAchievers[${idx}]) delete currentAchievers[${idx}].image_preview; window.renderAchieversList();" class="admin-select" style="flex:1; padding: 3px 6px; font-size: 0.72rem;">
                <option value="">-- प्रीसेट चुनें --</option>
                ${availablePhotos.map(ph => `<option value="${ph}" ${ach.image === ph ? 'selected' : ''}>${ph}</option>`).join('')}
              </select>
            </div>
            ${(ach.image_preview || ach.image) ? `
              <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                <img src="${escapeHtml(getPreviewImgSrc(ach, 'image', '/images/team/achiever-1.jpg'))}" alt="Preview" style="height:44px; width:44px; border-radius:50%; object-fit:cover; border:2px solid #f59e0b; display:block;" onerror="this.src='/images/team/achiever-1.jpg'" />
                <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${ach.image_preview ? '✓ नया अपलोड (WebP)' : '✓ एक्टिव फोटो'}</span>
              </div>
            ` : ''}
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

  // Audio Speech Test Listener - with Stop Button & Pulse Animation
  (function() {
    const playBtn = document.getElementById('btn-test-page-audio-speech');
    const stopBtn = document.getElementById('btn-stop-page-audio-speech');
    const labelEl = document.getElementById('pe-audio-btn-label');

    function setAudioPlaying(isPlaying) {
      if (!playBtn || !stopBtn) return;
      if (isPlaying) {
        playBtn.style.background = '#6d28d9';
        playBtn.style.animation = 'peAudioPulse 1.2s ease-in-out infinite';
        if (labelEl) labelEl.textContent = 'चल रहा है...';
        stopBtn.style.display = 'inline-flex';
      } else {
        playBtn.style.animation = '';
        playBtn.style.background = '#7c3aed';
        if (labelEl) labelEl.textContent = 'आवाज़ टेस्ट करें';
        stopBtn.style.display = 'none';
      }
    }

    // Inject pulse keyframe CSS
    if (!document.getElementById('pe-audio-pulse-css')) {
      const style = document.createElement('style');
      style.id = 'pe-audio-pulse-css';
      style.textContent = `
        @keyframes peAudioPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7); transform: scale(1); }
          50% { box-shadow: 0 0 0 8px rgba(124, 58, 237, 0); transform: scale(1.04); }
        }
      `;
      document.head.appendChild(style);
    }

    playBtn?.addEventListener('click', () => {
      const text = document.getElementById('pe_input_audio_script')?.value || '';
      if (!text) {
        showToast('⚠️ पहले हिंदी वॉइस स्क्रिप्ट लिखें!', 'error');
        return;
      }
      // If already speaking, cancel
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
        setAudioPlaying(false);
        showToast('⏹ ऑडियो बंद किया', 'info');
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
        ut.onstart = () => setAudioPlaying(true);
        ut.onend = () => { setAudioPlaying(false); showToast('✅ ऑडियो टेस्ट पूरा हुआ!', 'success'); };
        ut.onerror = () => setAudioPlaying(false);
        window.speechSynthesis.speak(ut);
        // Fallback in case onstart doesn't fire (some browsers)
        setTimeout(() => { if (window.speechSynthesis.speaking) setAudioPlaying(true); }, 200);
        showToast('🔊 ऑडियो वॉइस टेस्ट शुरू हो गया...', 'info');
      } else {
        showToast('❌ ब्राउज़र में स्पीच सिंथेसिस उपलब्ध नहीं है', 'error');
      }
    });

    stopBtn?.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setAudioPlaying(false);
      showToast('⏹ ऑडियो बंद किया', 'info');
    });
  })();

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
    const firstRec = availableTubeRecordings[0] || {};
    currentVideos.push({
      video_id: firstRec.id || 'VID_S432998',
      title: firstRec.title || '🎬 AarogyamTube विशेष वीडियो',
      desc: firstRec.description?.substring(0, 100) || 'वैज्ञानिक कृषि व पशु पोषण गाइड',
      url: firstRec.id ? `/tube.html?vid=${firstRec.id}` : '/tube.html',
      youtube_id: firstRec.youtube_id || '',
      thumbnail: firstRec.thumbnail || '',
      duration: firstRec.duration || '',
      target_page: 'all',
      ratio: firstRec.format === 'short_reel' ? '9:16' : '16:9'
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

  document.getElementById('btn_add_product')?.addEventListener('click', () => {
    currentProducts.push({
      title: 'नया उत्पाद (New Product)',
      description: 'उत्पाद के लाभ व उपयोग विधि यहाँ लिखें...',
      image: '',
      mrp: 850,
      discount_pct: 0,
      dose: '2ml / लीटर पानी',
      whatsapp_link: 'https://wa.me/917974422572'
    });
    renderProductsInBuilder();
  });

  document.getElementById('btn_add_page_kpi_section')?.addEventListener('click', () => {
    currentPageKpiSections.push({
      id: `KPI_SEC_${Date.now()}`,
      title: 'नया KPI सेक्शन',
      icon: '✨',
      image: '',
      audio_kpi: '',
      items: ['पहला बिंदु', 'दूसरा बिंदु', 'तीसरा बिंदु']
    });
    renderPageKpiSectionsInBuilder();
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
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">बैनर इमेज URL (HD WebP 1600px)</label>
            <input type="text" value="${escapeHtml(slide.image)}" onchange="window.updateHeroSlideField(${idx}, 'image', this.value); window.renderHeroSlidesInBuilder();" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
            <div style="display:flex;gap:4px;margin-top:4px;align-items:center;">
              <input type="file" id="hero_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'hero_slide', ${idx}, 'image')">
              <button type="button" onclick="document.getElementById('hero_file_${idx}').click()" class="admin-button small-button" style="background:#16a34a;color:#fff;padding:3px 8px;font-size:0.72rem;font-weight:800;">
                📁 बैनर अपलोड (HD WebP)
              </button>
              <select onchange="window.updateHeroSlideField(${idx}, 'image', this.value); window.renderHeroSlidesInBuilder();" class="admin-select" style="flex:1; padding: 3px 6px; font-size: 0.72rem;">
                <option value="">-- त्वरित प्रीसेट चुनें --</option>
                ${bannerPresets.map(bp => `<option value="${bp.val}" ${slide.image === bp.val ? 'selected' : ''}>${bp.lbl}</option>`).join('')}
              </select>
            </div>
            ${(slide.image_preview || slide.image) ? `
              <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                <img src="${escapeHtml(slide.image_preview || slide.image)}" alt="Preview" style="height:55px; max-width:140px; border-radius:6px; object-fit:cover; border:2px solid #3b82f6; display:block;" onerror="this.src='/images/banners/agriculture-banner.jpeg'" />
                <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${slide.image_preview ? '✓ नया अपलोड (HD Preview)' : '✓ एक्टिव बैनर'}</span>
              </div>
            ` : ''}
          </div>
          <div>
            <label style="font-size: 0.72rem; color: #38bdf8; font-weight: 800; display: block;">🖼️ बैनर डिस्प्ले मोड (Banner Size / Layout)</label>
            <select onchange="window.updateHeroSlideField(${idx}, 'banner_mode', this.value); window.renderHeroSlidesInBuilder();" class="admin-select" style="width: 100%; padding: 5px 8px; font-size: 0.8rem; border-color: #38bdf8;">
              <option value="full" ${slide.banner_mode === 'full' || (!slide.subtitle && !slide.tag) ? 'selected' : ''}>🖼️ फुल चौड़ा पैनोरमिक बैनर (Full Width - 100% पूरा दिखेगा)</option>
              <option value="card" ${slide.banner_mode === 'card' ? 'selected' : ''}>🎴 3D कार्ड + टेक्स्ट (Card with Title, Text & Floating Box)</option>
            </select>
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
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">Secondary CTA टेक्स्ट</label>
            <input type="text" value="${escapeHtml(slide.cta_secondary_text || '')}" onchange="window.updateHeroSlideField(${idx}, 'cta_secondary_text', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">Secondary CTA लिंक (URL)</label>
            <input type="text" value="${escapeHtml(slide.cta_secondary_link || '')}" onchange="window.updateHeroSlideField(${idx}, 'cta_secondary_link', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">← बैक बटन टेक्स्ट (Back Navigation)</label>
            <input type="text" value="${escapeHtml(slide.back_text || '← वापस जाएं')}" onchange="window.updateHeroSlideField(${idx}, 'back_text', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" placeholder="← वापस जाएं"/>
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">← बैक लिंक URL (Back Link)</label>
            <input type="text" value="${escapeHtml(slide.back_link || '')}" onchange="window.updateHeroSlideField(${idx}, 'back_link', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" placeholder="/categories/health.html"/>
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
      const safeImg = escapeHtml(getPreviewImgSrc(item, 'image', '/images/banners/health-banner.jpeg'));
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
              <input type="text" value="${safeImg}" onchange="window.updateHealthCardField(${idx}, 'image', this.value); if (currentHealthDiseases[${idx}]) delete currentHealthDiseases[${idx}].image_preview; window.renderHealthCardsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
              <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
                <input type="file" id="health_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'health_card', ${idx}, 'image')">
                <button type="button" onclick="document.getElementById('health_file_${idx}').click()" class="admin-button small-button" style="background:#dc2626; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                  📁 इमेज बदलें (WebP)
                </button>
              </div>
              ${(item.image_preview || item.image) ? `
                <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                  <img src="${safeImg}" alt="Preview" style="height:44px; width:65px; border-radius:6px; object-fit:cover; border:1.5px solid ${safeColor}; display:block;" onerror="this.src='/images/banners/health-banner.jpeg'" />
                  <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${item.image_preview ? '✓ नया अपलोड (WebP)' : '✓ एक्टिव कार्ड'}</span>
                </div>
              ` : ''}
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
      const safeImg = escapeHtml(getPreviewImgSrc(item, 'image', '/images/banners/agriculture-banner.jpeg'));
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
              <input type="text" value="${safeImg}" onchange="window.updateCropCardField(${idx}, 'image', this.value); if (currentCrops[${idx}]) delete currentCrops[${idx}].image_preview; window.renderCropCardsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
              <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
                <input type="file" id="crop_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'crop_card', ${idx}, 'image')">
                <button type="button" onclick="document.getElementById('crop_file_${idx}').click()" class="admin-button small-button" style="background:#16a34a; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                  📁 इमेज बदलें (WebP)
                </button>
              </div>
              ${(item.image_preview || item.image) ? `
                <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                  <img src="${safeImg}" alt="Preview" style="height:44px; width:65px; border-radius:6px; object-fit:cover; border:1.5px solid #16a34a; display:block;" onerror="this.src='/images/banners/agriculture-banner.jpeg'" />
                  <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${item.image_preview ? '✓ नया अपलोड (WebP)' : '✓ एक्टिव फसल'}</span>
                </div>
              ` : ''}
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

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">प्रमुख रोग व समस्याएं (Issues)</label>
              <textarea rows="2" onchange="window.updateCropCardField(${idx}, 'mainIssues', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;">${escapeHtml(issuesStr)}</textarea>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">जैविक / वैज्ञानिक समाधान (Solution)</label>
              <textarea rows="2" onchange="window.updateCropCardField(${idx}, 'solution', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;">${safeSolution}</textarea>
            </div>
          </div>

          <!-- Product & Book Funnel Integration -->
          <div style="background:#1e293b; border-radius:8px; padding:10px; border:1px solid #334155;">
            <div style="font-size:0.75rem; font-weight:800; color:#38bdf8; margin-bottom:8px;">📦 उत्पाद व ई-बुक लिंक (Marketing & Order Funnel):</div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:8px;">
              <div>
                <label style="font-size:0.7rem; color:var(--admin-muted); display:block;">संबंधित ई-बुक लिंक (Book Link)</label>
                <input type="text" value="${escapeHtml(item.book_link || '/ebooks/kharif-master-guide-2026.html')}" placeholder="/ebooks/kharif-master-guide-2026.html" onchange="window.updateCropCardField(${idx}, 'book_link', this.value)" class="admin-input" style="width:100%; padding:4px 6px; font-size:0.76rem;" />
              </div>
              <div>
                <label style="font-size:0.7rem; color:var(--admin-muted); display:block;">Biofit उत्पाद नाम (Product Name)</label>
                <input type="text" value="${escapeHtml(item.product_name || 'Biofit Wrap-Up')}" placeholder="उदा. Biofit Wrap-Up" onchange="window.updateCropCardField(${idx}, 'product_name', this.value)" class="admin-input" style="width:100%; padding:4px 6px; font-size:0.76rem;" />
              </div>
              <div>
                <label style="font-size:0.7rem; color:var(--admin-muted); display:block;">उत्पाद MRP (₹)</label>
                <input type="number" value="${item.product_mrp || 850}" placeholder="850" onchange="window.updateCropCardField(${idx}, 'product_mrp', Number(this.value))" class="admin-input" style="width:100%; padding:4px 6px; font-size:0.76rem;" />
              </div>
              <div>
                <label style="font-size:0.7rem; color:var(--admin-muted); display:block;">उत्पाद कार्य (Work / Benefit)</label>
                <input type="text" value="${escapeHtml(item.product_work || 'फंगस शील्ड')}" placeholder="फंगस शील्ड" onchange="window.updateCropCardField(${idx}, 'product_work', this.value)" class="admin-input" style="width:100%; padding:4px 6px; font-size:0.76rem;" />
              </div>
              <div>
                <label style="font-size:0.7rem; color:var(--admin-muted); display:block;">खुराक / डोज़ (Dosage)</label>
                <input type="text" value="${escapeHtml(item.product_dose || '2ml / लीटर पानी')}" placeholder="2ml / लीटर पानी" onchange="window.updateCropCardField(${idx}, 'product_dose', this.value)" class="admin-input" style="width:100%; padding:4px 6px; font-size:0.76rem;" />
              </div>
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
      const safeImg = escapeHtml(getPreviewImgSrc(item, 'image', '/images/banners/pashu-palan-banner.jpg'));
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
              <input type="text" value="${safeImg}" onchange="window.updatePashuCardField(${idx}, 'image', this.value); if (currentPashuCards[${idx}]) delete currentPashuCards[${idx}].image_preview; window.renderPashuCardsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
              <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
                <input type="file" id="pashu_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'pashu_card', ${idx}, 'image')">
                <button type="button" onclick="document.getElementById('pashu_file_${idx}').click()" class="admin-button small-button" style="background:#0284c7; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                  📁 इमेज बदलें (WebP)
                </button>
              </div>
              ${(item.image_preview || item.image) ? `
                <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                  <img src="${safeImg}" alt="Preview" style="height:44px; width:65px; border-radius:6px; object-fit:cover; border:1.5px solid #0284c7; display:block;" onerror="this.src='/images/banners/pashu-palan-banner.jpg'" />
                  <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${item.image_preview ? '✓ नया अपलोड (WebP)' : '✓ एक्टिव पशु'}</span>
                </div>
              ` : ''}
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

    if (currentKpiCards.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:12px;">कोई KPI कार्ड नहीं है। "+ नया फीचर कार्ड जोड़ें" बटन दबाएं।</div>';
      return;
    }

    wrap.innerHTML = currentKpiCards.map((card, idx) => {
      const safeImg = escapeHtml(getPreviewImgSrc(card, 'image', ''));
      return `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #34d399;">KPI #${idx + 1}</span>
          <button type="button" onclick="window.removeKpiCard(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem;">&times;</button>
        </div>
        <input type="text" value="${escapeHtml(card.icon || '')}" onchange="window.updateKpiCard(${idx}, 'icon', this.value)" class="admin-input" placeholder="FontAwesome Icon (e.g. fa-seedling)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <input type="text" value="${escapeHtml(card.title || '')}" onchange="window.updateKpiCard(${idx}, 'title', this.value)" class="admin-input" placeholder="शीर्षक (Title)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <input type="text" value="${escapeHtml(card.desc || '')}" onchange="window.updateKpiCard(${idx}, 'desc', this.value)" class="admin-input" placeholder="विवरण (Desc)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
          <input type="file" id="kpi_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'kpi_card', ${idx}, 'image')">
          <button type="button" onclick="document.getElementById('kpi_file_${idx}').click()" class="admin-button small-button" style="background:#16a34a; color:#fff; padding:3px 8px; font-size:0.7rem; font-weight:800;">📁 KPI बैनर इमेज (WebP)</button>
          <input type="text" value="${safeImg}" onchange="window.updateKpiCard(${idx}, 'image', this.value); if (currentKpiCards[${idx}]) delete currentKpiCards[${idx}].image_preview; window.renderKpiCardsInBuilder();" class="admin-input" placeholder="/images/kpi/..." style="flex:1; padding:3px 6px; font-size:0.7rem;" />
        </div>
        ${(card.image_preview || card.image) ? `
          <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
            <img src="${safeImg}" alt="KPI Preview" style="height:38px; width:60px; border-radius:4px; object-fit:cover; border:1px solid #16a34a; display:block;" onerror="this.src='/images/banners/agriculture-banner.jpeg'" />
            <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${card.image_preview ? '✓ नया अपलोड (WebP)' : '✓ KPI बैनर'}</span>
          </div>
        ` : ''}
      </div>
    `;
    }).join('');
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
            <input type="text" value="${escapeHtml(m.image || '')}" onchange="window.updateMarketingCardField(${idx}, 'image', this.value); if (currentMarketingCards[${idx}]) delete currentMarketingCards[${idx}].image_preview; window.renderMarketingCardsInBuilder();" class="admin-input" placeholder="/images/..." style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
            <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
              <input type="file" id="mkt_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'marketing_card', ${idx}, 'image')">
              <button type="button" onclick="document.getElementById('mkt_file_${idx}').click()" class="admin-button small-button" style="background:#f59e0b; color:#000; padding:3px 8px; font-size:0.72rem; font-weight:800;">
                📁 इमेज बदलें (WebP)
              </button>
            </div>
            ${(m.image_preview || m.image) ? `
              <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                <img src="${escapeHtml(getPreviewImgSrc(m, 'image', '/images/banners/ebook-banner.jpeg'))}" alt="Preview" style="height:40px; width:65px; border-radius:4px; object-fit:cover; border:1px solid #f59e0b; display:block;" onerror="this.src='/images/banners/ebook-banner.jpeg'" />
                <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${m.image_preview ? '✓ नया अपलोड (WebP)' : '✓ सेलिंग कार्ड'}</span>
              </div>
            ` : ''}
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
      <div style="background: #0b1120; border: 1.5px solid #1e293b; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: #ef4444; color: #fff; font-size: 0.7rem; font-weight: 900; padding: 2px 8px; border-radius: 6px;">AarogyamTube</span>
            <span style="font-size: 0.85rem; font-weight: 800; color: #f8fafc;">वीडियो #${idx + 1}</span>
            ${v.duration ? `<span style="font-size: 0.72rem; color: #94a3b8; background: #1e293b; padding: 2px 6px; border-radius: 4px;">⏱️ ${escapeHtml(v.duration)}</span>` : ''}
          </div>
          <button type="button" onclick="window.removeVideoItem(${idx})" class="admin-button small-button" style="background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 4px 10px; font-size: 0.75rem;">&times; हटाएं</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
          <div>
            <label style="font-size: 0.72rem; color: #38bdf8; font-weight: 800; display: block; margin-bottom: 4px;">
              🎬 AarogyamTube वीडियो लाइब्रेरी से चुनें:
            </label>
            <select onchange="window.selectAarogyamTubeVideo(${idx}, this.value)" class="admin-select" style="width: 100%; padding: 7px 10px; font-size: 0.8rem; background: #0f172a; color: #38bdf8; border: 1.5px solid #38bdf8; border-radius: 8px; font-weight: 700;">
              <option value="">-- AarogyamTube वीडियो चुनें --</option>
              ${availableTubeRecordings.map(r => `
                <option value="${r.id}" ${(v.video_id === r.id || v.url?.includes(r.id)) ? 'selected' : ''}>
                  ${r.format === 'short_reel' ? '📱 [शॉर्ट]' : '🎬 [वीडियो]'} ${escapeHtml(r.title.substring(0, 44))} (${r.duration || ''})
                </option>
              `).join('')}
            </select>
          </div>

          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block; margin-bottom: 4px;">प्रदर्शित करने वाला पेज (Target Page)</label>
            <select onchange="window.updateVideoItem(${idx}, 'target_page', this.value)" class="admin-select" style="width: 100%; padding: 7px 10px; font-size: 0.8rem; background: #1e293b; color: #fff; border-radius: 8px;">
              ${pageTargetOptions.map(opt => `<option value="${opt.id}" ${(v.target_page || 'all') === opt.id ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block; margin-bottom: 4px;">वीडियो शीर्षक (Title)</label>
            <input type="text" value="${escapeHtml(v.title || '')}" onchange="window.updateVideoItem(${idx}, 'title', this.value)" class="admin-input" style="width: 100%; padding: 7px 10px; font-size: 0.82rem;" />
          </div>

          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block; margin-bottom: 4px;">विवरण (Description)</label>
            <input type="text" value="${escapeHtml(v.desc || '')}" onchange="window.updateVideoItem(${idx}, 'desc', this.value)" class="admin-input" style="width: 100%; padding: 7px 10px; font-size: 0.82rem;" />
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #070d19; padding: 8px 12px; border-radius: 8px; border: 1px solid #1e293b; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${v.thumbnail || '/images/banners/agriculture-hero-banner-1.webp'}" alt="Thumb" style="width: 56px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid #334155;" onerror="this.src='/images/banners/agriculture-hero-banner-1.webp'" />
            <span style="font-size: 0.75rem; color: #94a3b8; font-family: monospace;">${escapeHtml(v.url || '/tube.html')}</span>
          </div>
          <a href="${v.url || '/tube.html'}" target="_blank" style="color: #38bdf8; font-size: 0.75rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
            <span>▶ AarogyamTube में देखें</span>
          </a>
        </div>
      </div>
    `).join('');
  }

  window.selectAarogyamTubeVideo = function(idx, recId) {
    if (!currentVideos[idx]) return;
    const rec = availableTubeRecordings.find(r => r.id === recId);
    if (rec) {
      currentVideos[idx].video_id = rec.id;
      currentVideos[idx].title = rec.title;
      currentVideos[idx].desc = rec.description?.substring(0, 140) || '';
      currentVideos[idx].url = `/tube.html?vid=${rec.id}`;
      currentVideos[idx].youtube_id = rec.youtube_id || '';
      currentVideos[idx].thumbnail = rec.thumbnail || (rec.youtube_id ? `https://img.youtube.com/vi/${rec.youtube_id}/hqdefault.jpg` : '');
      currentVideos[idx].duration = rec.duration || '';
      currentVideos[idx].ratio = rec.format === 'short_reel' ? '9:16' : '16:9';
      renderVideosInBuilder();
    }
  };

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
            <input type="text" value="${escapeHtml(r.image || r.avatar || '')}" onchange="window.updateReviewItem(${idx}, 'image', this.value); if (currentReviews[${idx}]) delete currentReviews[${idx}].image_preview; window.renderReviewsInBuilder();" class="admin-input" placeholder="/images/..." style="width: 100%; padding: 4px 6px; font-size: 0.75rem;" />
            <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
              <input type="file" id="rev_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'review', ${idx}, 'image')">
              <button type="button" onclick="document.getElementById('rev_file_${idx}').click()" class="admin-button small-button" style="background:#8b5cf6; color:#fff; padding:2px 8px; font-size:0.72rem; font-weight:800;">
                📁 फोटो बदलें (WebP)
              </button>
            </div>
            ${(r.image_preview || r.image || r.avatar) ? `
              <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                <img src="${escapeHtml(getPreviewImgSrc(r, 'image', '/images/team/achiever-1.jpg'))}" alt="Avatar" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid #8b5cf6; display:block;" onerror="this.src='/images/team/achiever-1.jpg'" />
                <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${r.image_preview ? '✓ नया अवतार' : '✓ एक्टिव'}</span>
              </div>
            ` : ''}
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
  // PRODUCT MANAGER RENDER
  // -------------------------------------------------------------
  function renderProductsInBuilder() {
    const wrap = document.getElementById('pe_products_container');
    if (!wrap) return;
    if (currentProducts.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:12px;">कोई उत्पाद नहीं है। "+ नया उत्पाद जोड़ें" बटन दबाएं।</div>';
      return;
    }
    wrap.innerHTML = currentProducts.map((prod, idx) => {
      const safeImg = escapeHtml(getPreviewImgSrc(prod, 'image', ''));
      const prodTitle = prod.title || prod.name || '';
      const prodMrp = (prod.mrp !== undefined && prod.mrp !== '') ? prod.mrp : (prod.price || '');
      const prodBadge = prod.badge || '';
      const prodDose = prod.dose || '';
      const prodDesc = prod.description || '';
      const offerPrice = (prodMrp && prod.discount_pct) ? Math.round(prodMrp * (1 - prod.discount_pct / 100)) : null;
      return `
        <div style="background:#0f172a; border:1.5px solid #7c3aed50; border-radius:10px; padding:14px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-weight:800; color:#c084fc; font-size:0.92rem;">🛍️ उत्पाद #${idx + 1}: ${escapeHtml(prodTitle || 'New Product')}</span>
            <button type="button" onclick="window.removeProduct(${idx})" style="background:transparent; border:none; color:#ef4444; font-weight:800; cursor:pointer; font-size:0.82rem;">&times; हटाएं</button>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:10px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">उत्पाद इमेज (WebP)</label>
              <input type="text" value="${safeImg}" onchange="window.updateProduct(${idx}, 'image', this.value); if (currentProducts[${idx}]) delete currentProducts[${idx}].image_preview; window.renderProductsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" />
              <div style="display:flex; gap:6px; margin-top:4px;">
                <input type="file" id="prod_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'product', ${idx}, 'image')">
                <button type="button" onclick="document.getElementById('prod_file_${idx}').click()" class="admin-button small-button" style="background:#7c3aed; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">📁 इमेज अपलोड (WebP)</button>
              </div>
              ${(prod.image_preview || prod.image) ? `
                <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                  <img src="${safeImg}" alt="Preview" style="height:48px; width:48px; border-radius:4px; object-fit:cover; border:1px solid #7c3aed; display:block;" onerror="this.src='/images/banners/agriculture-banner.jpeg'" />
                  <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${prod.image_preview ? '✓ नया अपलोड' : '✓ प्रोडक्ट'}</span>
                </div>
              ` : ''}
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">उत्पाद का नाम (Title / Name)*</label>
              <input type="text" value="${escapeHtml(prodTitle)}" onchange="window.updateProduct(${idx}, 'title', this.value); window.updateProduct(${idx}, 'name', this.value);" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" placeholder="उदा. CFL Mineral Feed (1kg)"/>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">MRP (₹)*</label>
              <input type="number" value="${prodMrp}" onchange="window.updateProduct(${idx}, 'mrp', Number(this.value)); window.updateProduct(${idx}, 'price', Number(this.value)); window.renderProductsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" placeholder="650"/>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">बैज / श्रेणी (Badge)</label>
              <input type="text" value="${escapeHtml(prodBadge)}" onchange="window.updateProduct(${idx}, 'badge', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" placeholder="उदा. दुग्ध वृद्धि बूस्टर"/>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">खुराक / डोज़ (Dose)</label>
              <input type="text" value="${escapeHtml(prodDose)}" onchange="window.updateProduct(${idx}, 'dose', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" placeholder="50g दैनिक"/>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">WhatsApp ऑर्डर लिंक (वैकल्पिक)</label>
              <input type="text" value="${escapeHtml(prod.whatsapp_link || '')}" onchange="window.updateProduct(${idx}, 'whatsapp_link', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" placeholder="https://wa.me/917974422572"/>
            </div>
          </div>
          <div>
            <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">उत्पाद विवरण (Description)</label>
            <textarea rows="2" onchange="window.updateProduct(${idx}, 'description', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem;" placeholder="उत्पाद के लाभ व उपयोग...">${escapeHtml(prodDesc)}</textarea>
          </div>
        </div>
      `;
    }).join('');
  }
  window.renderProductsInBuilder = renderProductsInBuilder;
  window.updateProduct = function(idx, field, val) { if (currentProducts[idx]) currentProducts[idx][field] = val; };
  window.removeProduct = function(idx) { currentProducts.splice(idx, 1); renderProductsInBuilder(); };

  // -------------------------------------------------------------
  // PAGE KPI SECTIONS RENDER (Health Sub-pages: Symptoms / Yoga / Remedy)
  // -------------------------------------------------------------
  function renderPageKpiSectionsInBuilder() {
    const wrap = document.getElementById('pe_page_kpi_sections_container');
    if (!wrap) return;
    if (currentPageKpiSections.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:12px;">कोई KPI सेक्शन नहीं है। "+ नया KPI सेक्शन जोड़ें" बटन दबाएं। (जैसे: मुख्य लक्षण, योगासन, घरेलू उपाय)</div>';
      return;
    }
    wrap.innerHTML = currentPageKpiSections.map((sec, idx) => {
      const safeImg = escapeHtml(getPreviewImgSrc(sec, 'image', ''));
      const itemsStr = Array.isArray(sec.items) ? sec.items.join('\n') : (sec.items || '');
      return `
        <div style="background:#0f172a; border:1.5px solid #0284c750; border-radius:10px; padding:14px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.4rem;">${escapeHtml(sec.icon || '✨')}</span>
              <span style="font-weight:800; color:#38bdf8; font-size:0.92rem;">KPI सेक्शन #${idx + 1}: ${escapeHtml(sec.title || '')}</span>
            </div>
            <button type="button" onclick="window.removePageKpiSection(${idx})" style="background:transparent; border:none; color:#ef4444; font-weight:800; cursor:pointer; font-size:0.82rem;">&times; हटाएं</button>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:10px;">
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">बैनर इमेज (WebP — auto: images/kpi/)</label>
              <input type="text" value="${safeImg}" onchange="window.updatePageKpiSection(${idx}, 'image', this.value); if (currentPageKpiSections[${idx}]) delete currentPageKpiSections[${idx}].image_preview; window.renderPageKpiSectionsInBuilder();" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;"/>
              <div style="display:flex; gap:6px; margin-top:4px;">
                <input type="file" id="kpi_sec_file_${idx}" accept="image/*" style="display:none;" onchange="window.handleAdminImageUpload(event, 'kpi_section', ${idx}, 'image')">
                <button type="button" onclick="document.getElementById('kpi_sec_file_${idx}').click()" class="admin-button small-button" style="background:#0284c7; color:#fff; padding:3px 8px; font-size:0.72rem; font-weight:800;">📁 बैनर अपलोड (WebP)</button>
              </div>
              ${(sec.image_preview || sec.image) ? `
                <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                  <img src="${safeImg}" alt="Preview" style="height:40px; width:65px; border-radius:4px; object-fit:cover; border:1px solid #0284c7; display:block;" onerror="this.src='/images/banners/health-banner.jpeg'" />
                  <span style="font-size:0.72rem; color:#86efac; font-weight:700;">${sec.image_preview ? '✓ नया अपलोड' : '✓ सेक्शन'}</span>
                </div>
              ` : ''}
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">सेक्शन शीर्षक (Title)</label>
              <input type="text" value="${escapeHtml(sec.title || '')}" onchange="window.updatePageKpiSection(${idx}, 'title', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" placeholder="जैसे: मुख्य लक्षण, योगासन, उपाय"/>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">आइकन इमोजी (Icon)</label>
              <input type="text" value="${escapeHtml(sec.icon || '✨')}" onchange="window.updatePageKpiSection(${idx}, 'icon', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" placeholder="✨ 🩺 🧘 🌿"/>
            </div>
            <div>
              <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">🔊 ऑडियो KPI टेक्स्ट (यह बोला जाएगा)</label>
              <input type="text" value="${escapeHtml(sec.audio_kpi || '')}" onchange="window.updatePageKpiSection(${idx}, 'audio_kpi', this.value)" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.8rem;" placeholder="इस सेक्शन का ऑडियो परिचय..."/>
            </div>
          </div>
          <div>
            <label style="font-size:0.72rem; color:var(--admin-muted); display:block;">📋 आइटम्स की सूची (एक लाइन = एक आइटम) — लक्षण / योगासन / उपाय</label>
            <textarea rows="4" onchange="window.updatePageKpiSection(${idx}, 'items', this.value.split('\\n').map(s=>s.trim()).filter(s=>s))" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.78rem; font-family:inherit;" placeholder="बार-बार पेशाब आना&#10;थकान व कमजोरी&#10;प्यास अधिक लगना">${escapeHtml(itemsStr)}</textarea>
          </div>
        </div>
      `;
    }).join('');
  }
  window.renderPageKpiSectionsInBuilder = renderPageKpiSectionsInBuilder;
  window.updatePageKpiSection = function(idx, field, val) { if (currentPageKpiSections[idx]) currentPageKpiSections[idx][field] = val; };
  window.removePageKpiSection = function(idx) { currentPageKpiSections.splice(idx, 1); renderPageKpiSectionsInBuilder(); };

  // Context-aware section show/hide based on page category
  function updateContextualSections(category) {
    const healthSection = document.getElementById('pe-section-health-cards');
    const cropSection = document.getElementById('pe-section-crop-cards');
    const pashuSection = document.getElementById('pe-section-pashu-cards');
    const pageKpiSection = document.getElementById('pe-section-page-kpi');

    const isHealthSubPage = category === 'Healthcare Sub-page';
    const isAgri = category === 'Agriculture' || category === 'eBooks' || category === 'Core';
    const isPashu = category === 'Livestock';
    const showHealth = category === 'Health' || category === 'Healthcare' || category === 'Core';

    if (healthSection) healthSection.style.display = (showHealth && !isHealthSubPage) ? 'block' : 'none';
    if (cropSection) cropSection.style.display = (isAgri && !isHealthSubPage) ? 'block' : 'none';
    if (pashuSection) pashuSection.style.display = (isPashu || category === 'Core') ? 'block' : 'none';
    if (pageKpiSection) pageKpiSection.style.display = isHealthSubPage ? 'block' : 'none';
  }
  window.updateContextualSections = updateContextualSections;

  // -------------------------------------------------------------
  // TABLE & ACTIONS (Compact 5-Column Directory with Category Filter Pills)
  // -------------------------------------------------------------
  function renderCategoryFilterPills() {
    const bar = document.getElementById('pe_cat_filter_bar');
    if (!bar) return;

    const categories = [
      { id: 'all', label: 'All Pages' },
      { id: 'Core', label: 'Core / Home' },
      { id: 'eBooks', label: 'eBooks' },
      { id: 'Agriculture', label: 'Agriculture (कृषि)' },
      { id: 'Livestock', label: 'Livestock (पशु पालन)' },
      { id: 'Health', label: 'Health & Care' },
      { id: 'Book Landing Page', label: 'Book Landing' },
      { id: 'Utilities', label: 'Utilities' },
      { id: 'User Area', label: 'User Area' }
    ];

    const counts = { all: allPages.length };
    categories.slice(1).forEach(c => {
      counts[c.id] = allPages.filter(p => {
        const cat = (p.category || '').toLowerCase();
        if (c.id === 'Health') return cat.includes('health');
        if (c.id === 'Core') return cat === 'core';
        if (c.id === 'Agriculture') return cat.includes('agri');
        if (c.id === 'Livestock') return cat.includes('live') || cat.includes('pashu');
        if (c.id === 'Book Landing Page') return cat.includes('landing');
        return cat === c.id.toLowerCase();
      }).length;
    });

    bar.innerHTML = categories.map(c => {
      const isActive = activeCategoryFilter === c.id;
      const count = counts[c.id] !== undefined ? counts[c.id] : 0;
      return `
        <button type="button" class="admin-button small-button" onclick="window.setPageCategoryFilter('${c.id}')"
          style="border-radius: 20px; padding: 4px 12px; font-size: 0.78rem; font-weight: 700; transition: all 0.2s ease; cursor: pointer;
                 background: ${isActive ? '#2563eb' : 'rgba(255,255,255,0.05)'};
                 color: ${isActive ? '#fff' : 'var(--admin-muted)'};
                 border: 1px solid ${isActive ? '#3b82f6' : 'var(--admin-border)'};">
          ${c.label} <span style="font-size: 0.7rem; opacity: 0.85; margin-left: 3px;">(${count})</span>
        </button>
      `;
    }).join('');
  }

  window.setPageCategoryFilter = function(catId) {
    activeCategoryFilter = catId;
    pagesCurrentPage = 1;
    renderCategoryFilterPills();
    renderPagesTable();
  };

  function renderPagesTable() {
    renderCategoryFilterPills();

    const wrap = document.getElementById('pe_table_container');
    if (!wrap) return;

    const countBadge = document.getElementById('pe_total_pages_count');

    const q = (searchInput?.value || '').toLowerCase().trim();
    const filtered = allPages.filter(p => {
      if (activeCategoryFilter !== 'all') {
        const cat = (p.category || '').toLowerCase();
        let catMatch = false;
        if (activeCategoryFilter === 'Health') catMatch = cat.includes('health');
        else if (activeCategoryFilter === 'Core') catMatch = (cat === 'core');
        else if (activeCategoryFilter === 'Agriculture') catMatch = cat.includes('agri');
        else if (activeCategoryFilter === 'Livestock') catMatch = cat.includes('live') || cat.includes('pashu');
        else if (activeCategoryFilter === 'Book Landing Page') catMatch = cat.includes('landing');
        else catMatch = (cat === activeCategoryFilter.toLowerCase());
        if (!catMatch) return false;
      }
      if (!q) return true;
      return (p.name || '').toLowerCase().includes(q) ||
             (p.url || '').toLowerCase().includes(q) ||
             (p.slug || '').toLowerCase().includes(q) ||
             (p.category || '').toLowerCase().includes(q);
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} / ${allPages.length} Pages`;
    }

    if (filtered.length === 0) {
      wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--admin-muted);">कोई पेज नहीं मिला।</div>';
      return;
    }

    const totalPages = Math.ceil(filtered.length / pagesPageSize) || 1;
    if (pagesCurrentPage > totalPages) pagesCurrentPage = totalPages;
    if (pagesCurrentPage < 1) pagesCurrentPage = 1;

    const startIdx = (pagesCurrentPage - 1) * pagesPageSize;
    const endIdx = Math.min(startIdx + pagesPageSize, filtered.length);
    const paginated = filtered.slice(startIdx, endIdx);

    wrap.innerHTML = `
      <table class="admin-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="min-width: 220px;">पेज व रूट (Page & Route)</th>
            <th style="min-width: 110px;">कैटेगरी</th>
            <th style="min-width: 200px;">मॉड्यूल्स व सामग्री (Modules)</th>
            <th style="min-width: 90px; text-align: center;">स्थिति</th>
            <th style="min-width: 130px; text-align: center;">एक्शन</th>
          </tr>
        </thead>
        <tbody>
          ${paginated.map(p => {
            const isLive = p.status === 'active';
            const slidesCount = (p.hero_slides || []).length;
            const secCount = (p.sections_order || []).length;

            return `
              <tr>
                <td>
                  <div style="font-weight: 800; color: #f8fafc; font-size: 0.92rem; margin-bottom: 3px;">${escapeHtml(p.name)}</div>
                  <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <a href="${p.url}" target="_blank" style="font-size: 0.74rem; color: #10b981; background: rgba(16,185,129,0.1); padding: 2px 6px; border-radius: 4px; text-decoration: none; font-weight: 600;">
                      ${escapeHtml(p.url)}
                    </a>
                    <span style="font-size: 0.72rem; color: #64748b;">(${escapeHtml(p.slug || p.id)})</span>
                  </div>
                  ${p.ticker_text ? `<div style="font-size: 0.72rem; color: var(--admin-muted); margin-top: 2px;">📢 ${escapeHtml(p.ticker_text.substring(0, 48))}...</div>` : ''}
                </td>
                <td>
                  <span style="font-size: 0.74rem; background: rgba(59,130,246,0.15); color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">
                    ${escapeHtml(p.category || 'General')}
                  </span>
                </td>
                <td>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    <span style="font-size: 0.72rem; background: rgba(168,85,247,0.15); color: #c084fc; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
                      🖼️ ${slidesCount} Slides
                    </span>
                    <span style="font-size: 0.72rem; background: rgba(30,58,138,0.3); color: #93c5fd; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
                      📑 ${secCount} Secs
                    </span>
                    ${p.products && p.products.length ? `<span style="font-size:0.72rem; background:rgba(234,179,8,0.15); color:#facc15; padding:2px 6px; border-radius:4px; font-weight:700;">🛍️ ${p.products.length} Prod</span>` : ''}
                    ${p.audio_script ? `<span style="font-size:0.72rem; background:rgba(16,185,129,0.15); color:#34d399; padding:2px 6px; border-radius:4px; font-weight:700;">🎙️ Audio</span>` : ''}
                    ${p.floating_banner?.enabled ? `<span style="font-size:0.72rem; background:rgba(236,72,153,0.15); color:#f472b6; padding:2px 6px; border-radius:4px; font-weight:700;">🔮 3D Float</span>` : ''}
                    ${p.fb_pixel !== false ? `<span style="font-size:0.7rem; background:rgba(37,99,235,0.12); color:#60a5fa; padding:2px 5px; border-radius:4px;">🔵 Pixel</span>` : ''}
                  </div>
                </td>
                <td style="text-align: center;">
                  <button type="button" onclick="window.toggleSitePageStatus('${p.id}')" class="admin-button small-button" style="background:${isLive ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)'};color:${isLive ? '#16a34a' : '#ef4444'};border:1px solid ${isLive ? '#16a34a' : '#ef4444'};padding:3px 8px;border-radius:6px;font-size:0.76rem;font-weight:800; cursor: pointer;">
                    ${isLive ? '🟢 Live' : '🔴 Draft'}
                  </button>
                </td>
                <td style="text-align: center;">
                  <div style="display: flex; gap: 6px; align-items: center; justify-content: center;">
                    <button type="button" onclick="window.editSitePage('${p.id}')" class="admin-button small-button" style="background: #f59e0b; color: #000; font-weight: 900; padding: 4px 10px; font-size: 0.78rem;" title="एडिट स्टूडियो खोलें">
                      ✏️ एडिट
                    </button>
                    <a href="${p.url}" target="_blank" class="admin-button small-button" style="background: #2563eb; color: #fff; text-decoration: none; font-weight: 700; padding: 4px 8px; font-size: 0.78rem;" title="लाइव देखें">
                      👁️ देखें
                    </a>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Directory Pagination Controller Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#0f172a; border-top:1px solid var(--admin-border); flex-wrap:wrap; gap:10px; margin-top:8px; border-radius:0 0 10px 10px;">
        <div style="font-size:0.8rem; color:var(--admin-muted);">
          पेज <strong style="color:#38bdf8;">${pagesCurrentPage}</strong> का <strong style="color:#f8fafc;">${totalPages}</strong> (दिख रहे हैं: ${startIdx + 1}–${endIdx} / कुल: ${filtered.length} पेजेस)
        </div>
        ${totalPages > 1 ? `
        <div style="display:flex; gap:6px; align-items:center;">
          <button type="button" onclick="window.changePagesPage(${pagesCurrentPage - 1})" ${pagesCurrentPage <= 1 ? 'disabled' : ''} class="admin-button small-button" style="padding:4px 10px; font-size:0.78rem; opacity:${pagesCurrentPage <= 1 ? '0.35' : '1'}; cursor:${pagesCurrentPage <= 1 ? 'not-allowed' : 'pointer'};">
            ◀ पिछला
          </button>
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNo => `
            <button type="button" onclick="window.changePagesPage(${pageNo})" class="admin-button small-button" style="padding:4px 10px; font-size:0.78rem; background:${pageNo === pagesCurrentPage ? '#2563eb' : 'transparent'}; color:#fff; border:1px solid ${pageNo === pagesCurrentPage ? '#3b82f6' : 'var(--admin-border)'}; font-weight:${pageNo === pagesCurrentPage ? '900' : '600'};">
              ${pageNo}
            </button>
          `).join('')}
          <button type="button" onclick="window.changePagesPage(${pagesCurrentPage + 1})" ${pagesCurrentPage >= totalPages ? 'disabled' : ''} class="admin-button small-button" style="padding:4px 10px; font-size:0.78rem; opacity:${pagesCurrentPage >= totalPages ? '0.35' : '1'}; cursor:${pagesCurrentPage >= totalPages ? 'not-allowed' : 'pointer'};">
            अगला ▶
          </button>
        </div>
        ` : ''}
      </div>
    `;
  }

  window.changePagesPage = function(pageNo) {
    pagesCurrentPage = pageNo;
    renderPagesTable();
  };

  window.editSitePage = function(pageId) {
    const p = allPages.find(x => x.id === pageId);
    if (!p) return;

    editingPageId = p.id;
    document.getElementById('page-editor-form-title').textContent = `✏️ पेज एडिट करें: ${p.name}`;
    const footerBadge = document.getElementById('pe_footer_active_badge');
    if (footerBadge) footerBadge.textContent = `✏️ ${p.name || 'Site Page'}`;
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
    const audioUrlEl = document.getElementById('pe_input_audio_url');
    if (audioTitleEl) audioTitleEl.value = p.audio_title || p.name || '';
    if (audioScriptEl) audioScriptEl.value = p.audio_script || '';
    if (audioUrlEl) audioUrlEl.value = p.audio_url || '';

    // Social Sharing, OG & WhatsApp Custom Share Message
    const ogTitleEl = document.getElementById('pe_input_og_title');
    const ogImgEl = document.getElementById('pe_input_og_image');
    const ogDescEl = document.getElementById('pe_input_og_description');
    const shareMsgEl = document.getElementById('pe_input_share_message');
    if (ogTitleEl) ogTitleEl.value = p.og_title || '';
    if (ogImgEl) ogImgEl.value = p.og_image || '';
    if (ogDescEl) ogDescEl.value = p.og_description || '';
    if (shareMsgEl) shareMsgEl.value = p.share_message || '';

    const ogPrevWrap = document.getElementById('pe_og_image_preview');
    const ogPrevImg = document.getElementById('pe_og_image_preview_img');
    if (ogPrevWrap && ogPrevImg) {
      if (p.og_image) {
        ogPrevImg.src = p.og_image;
        ogPrevWrap.style.display = 'block';
      } else {
        ogPrevWrap.style.display = 'none';
      }
    }

    // 3.1B Clinical Breakdown & Diet/Exercise
    const cbData = p.clinical_breakdown || {};
    const cbCards = cbData.cards || [];
    const causesCard = cbCards[0] || {};
    const symptomsCard = cbCards[1] || {};
    const risksCard = cbCards[2] || {};

    const cbBadgeEl = document.getElementById('pe_input_cb_badge');
    const cbTitleEl = document.getElementById('pe_input_cb_title');
    const cbCausesTitleEl = document.getElementById('pe_input_cb_causes_title');
    const cbCausesPointsEl = document.getElementById('pe_input_cb_causes_points');
    const cbSymptomsTitleEl = document.getElementById('pe_input_cb_symptoms_title');
    const cbSymptomsPointsEl = document.getElementById('pe_input_cb_symptoms_points');
    const cbRisksTitleEl = document.getElementById('pe_input_cb_risks_title');
    const cbRisksPointsEl = document.getElementById('pe_input_cb_risks_points');

    if (cbBadgeEl) cbBadgeEl.value = cbData.badge_text || '🔬 वैज्ञानिक विश्लेषण';
    if (cbTitleEl) cbTitleEl.value = cbData.main_title || '';
    if (cbCausesTitleEl) cbCausesTitleEl.value = causesCard.title || '❓ कारण (Causes)';
    if (cbCausesPointsEl) cbCausesPointsEl.value = Array.isArray(causesCard.points) ? causesCard.points.join('\n') : (causesCard.points || '');
    if (cbSymptomsTitleEl) cbSymptomsTitleEl.value = symptomsCard.title || '⚠️ मुख्य लक्षण (Symptoms)';
    if (cbSymptomsPointsEl) cbSymptomsPointsEl.value = Array.isArray(symptomsCard.points) ? symptomsCard.points.join('\n') : (symptomsCard.points || '');
    if (cbRisksTitleEl) cbRisksTitleEl.value = risksCard.title || '🚨 साइड इफेक्ट्स व खतरे (Risks)';
    if (cbRisksPointsEl) cbRisksPointsEl.value = Array.isArray(risksCard.points) ? risksCard.points.join('\n') : (risksCard.points || '');

    const cbCausesImgEl = document.getElementById('pe_input_cb_causes_img');
    const cbSymptomsImgEl = document.getElementById('pe_input_cb_symptoms_img');
    const cbRisksImgEl = document.getElementById('pe_input_cb_risks_img');
    if (cbCausesImgEl) {
      cbCausesImgEl.value = causesCard.image || '';
      if (typeof window.previewCbCardImage === 'function') window.previewCbCardImage(0, causesCard.image);
    }
    if (cbSymptomsImgEl) {
      cbSymptomsImgEl.value = symptomsCard.image || '';
      if (typeof window.previewCbCardImage === 'function') window.previewCbCardImage(1, symptomsCard.image);
    }
    if (cbRisksImgEl) {
      cbRisksImgEl.value = risksCard.image || '';
      if (typeof window.previewCbCardImage === 'function') window.previewCbCardImage(2, risksCard.image);
    }

    const deData = p.diet_exercise || {};
    const dietData = deData.diet || {};
    const exData = deData.exercise || {};

    const dietTitleEl = document.getElementById('pe_input_diet_title');
    const dietItemsEl = document.getElementById('pe_input_diet_items');
    const exTitleEl = document.getElementById('pe_input_exercise_title');
    const exItemsEl = document.getElementById('pe_input_exercise_items');

    if (dietTitleEl) dietTitleEl.value = dietData.title || '';
    if (dietItemsEl) dietItemsEl.value = Array.isArray(dietData.items) ? dietData.items.join('\n') : (dietData.items || '');
    if (exTitleEl) exTitleEl.value = exData.title || '';
    if (exItemsEl) exItemsEl.value = Array.isArray(exData.items) ? exData.items.join('\n') : (exData.items || '');

    // 3.0 Floating 3D Banner & Live Animation Layer
    const floatChk = document.getElementById('pe_chk_floating_banner');
    const floatImg = document.getElementById('pe_input_floating_banner_img');
    const floatTitle = document.getElementById('pe_input_floating_banner_title');
    const floatLink = document.getElementById('pe_input_floating_banner_link');
    const floatAnim = document.getElementById('pe_select_floating_banner_anim');
    const floatPrevWrap = document.getElementById('pe_floating_banner_preview');
    const floatPrevImg = document.getElementById('pe_floating_banner_preview_img');

    const fbData = p.floating_banner || {};
    if (floatChk) floatChk.checked = Boolean(fbData.enabled);
    if (floatImg) floatImg.value = fbData.image || '';
    if (floatTitle) floatTitle.value = fbData.badge_title || '';
    if (floatLink) floatLink.value = fbData.action_link || '';
    if (floatAnim) floatAnim.value = fbData.animation || 'ublFloatBook3D';

    if (floatPrevWrap && floatPrevImg) {
      if (fbData.image) {
        floatPrevImg.src = fbData.image;
        floatPrevWrap.style.display = 'block';
      } else {
        floatPrevWrap.style.display = 'none';
      }
    }

    // Studio Category Pill in top bar
    const studioCatPill = document.getElementById('pe_studio_cat_pill');
    if (studioCatPill) {
      studioCatPill.textContent = `${p.category || 'eBooks'} • ${p.slug || p.id}`;
    }

    currentSlides = Array.isArray(p.hero_slides) ? JSON.parse(JSON.stringify(p.hero_slides)) : [];
    currentSectionsOrder = Array.isArray(p.sections_order) && p.sections_order.length > 0 ? [...p.sections_order] : ALL_SECTION_DEFS.map(s => s.key);
    currentHiddenSections = Array.isArray(p.hidden_sections) ? [...p.hidden_sections] : [];
    currentKpiCards = Array.isArray(p.kpi_cards) ? JSON.parse(JSON.stringify(p.kpi_cards)) : [];
    currentVideos = Array.isArray(p.videos) ? JSON.parse(JSON.stringify(p.videos)) : [];
    currentMarketingCards = Array.isArray(p.marketing_cards) ? JSON.parse(JSON.stringify(p.marketing_cards)) : [];
    currentReviews = Array.isArray(p.reviews) ? JSON.parse(JSON.stringify(p.reviews)) : [];
    currentFaqs = Array.isArray(p.faqs) ? JSON.parse(JSON.stringify(p.faqs)) : [];
    // For health sub-pages, don't load global disease defaults — start empty or load page-specific
    const isHealthSubPage = (p.category === 'Healthcare Sub-page');
    currentHealthDiseases = Array.isArray(p.health_diseases) ? JSON.parse(JSON.stringify(p.health_diseases)) : (isHealthSubPage ? [] : JSON.parse(JSON.stringify(DEFAULT_HEALTH_DISEASES)));
    currentCrops = Array.isArray(p.crops) ? JSON.parse(JSON.stringify(p.crops)) : (isHealthSubPage ? [] : JSON.parse(JSON.stringify(DEFAULT_CROPS_LIST)));
    currentPashuCards = Array.isArray(p.pashu_cards) ? JSON.parse(JSON.stringify(p.pashu_cards)) : (isHealthSubPage ? [] : JSON.parse(JSON.stringify(DEFAULT_PASHU_LIST)));
    currentProducts = Array.isArray(p.products) ? JSON.parse(JSON.stringify(p.products)) : [];
    currentPageKpiSections = Array.isArray(p.page_kpi_sections) ? JSON.parse(JSON.stringify(p.page_kpi_sections)) : [];
    currentDietImages = Array.isArray(dietData.images) ? JSON.parse(JSON.stringify(dietData.images)) : [];
    currentExerciseImages = Array.isArray(exData.images) ? JSON.parse(JSON.stringify(exData.images)) : [];

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
    renderProductsInBuilder();
    renderPageKpiSectionsInBuilder();
    renderDietImagesInBuilder();
    renderExerciseImagesInBuilder();

    openPageDrawer();
    setTimeout(() => updateContextualSections(p.category || 'eBooks'), 60);
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
    document.getElementById('page-editor-form-title').textContent = 'नया साइट पेज बनाएं (Universal Page Editor Drawer)';
    const footerBadge = document.getElementById('pe_footer_active_badge');
    if (footerBadge) footerBadge.textContent = '✨ नया साइट पेज (New Page)';
    document.getElementById('site-page-customizer-form')?.reset();
    const audioTitleEl = document.getElementById('pe_input_audio_title');
    const audioScriptEl = document.getElementById('pe_input_audio_script');
    const audioUrlEl = document.getElementById('pe_input_audio_url');
    if (audioTitleEl) audioTitleEl.value = '';
    if (audioScriptEl) audioScriptEl.value = '';
    if (audioUrlEl) audioUrlEl.value = '';

    const ogTitleEl = document.getElementById('pe_input_og_title');
    const ogImgEl = document.getElementById('pe_input_og_image');
    const ogDescEl = document.getElementById('pe_input_og_description');
    const shareMsgEl = document.getElementById('pe_input_share_message');
    if (ogTitleEl) ogTitleEl.value = '';
    if (ogImgEl) ogImgEl.value = '';
    if (ogDescEl) ogDescEl.value = '';
    if (shareMsgEl) shareMsgEl.value = '';

    const ogPrevWrap = document.getElementById('pe_og_image_preview');
    if (ogPrevWrap) ogPrevWrap.style.display = 'none';

    // Reset Clinical Breakdown & Diet
    ['pe_input_cb_badge', 'pe_input_cb_title', 'pe_input_cb_causes_title', 'pe_input_cb_causes_points',
     'pe_input_cb_symptoms_title', 'pe_input_cb_symptoms_points', 'pe_input_cb_risks_title', 'pe_input_cb_risks_points',
     'pe_input_diet_title', 'pe_input_diet_items', 'pe_input_exercise_title', 'pe_input_exercise_items'].forEach(id => {
       const el = document.getElementById(id);
       if (el) el.value = '';
    });

    // Reset Floating 3D Banner
    const floatChk = document.getElementById('pe_chk_floating_banner');
    const floatImg = document.getElementById('pe_input_floating_banner_img');
    const floatTitle = document.getElementById('pe_input_floating_banner_title');
    const floatLink = document.getElementById('pe_input_floating_banner_link');
    const floatAnim = document.getElementById('pe_select_floating_banner_anim');
    const floatPrevWrap = document.getElementById('pe_floating_banner_preview');
    if (floatChk) floatChk.checked = false;
    if (floatImg) floatImg.value = '';
    if (floatTitle) floatTitle.value = '';
    if (floatLink) floatLink.value = '';
    if (floatAnim) floatAnim.value = 'ublFloatBook3D';
    if (floatPrevWrap) floatPrevWrap.style.display = 'none';

    const studioCatPill = document.getElementById('pe_studio_cat_pill');
    if (studioCatPill) studioCatPill.textContent = 'New Page Studio';

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
    currentProducts = [];
    currentPageKpiSections = [];
    currentDietImages = [];
    currentExerciseImages = [];

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
    renderProductsInBuilder();
    renderPageKpiSectionsInBuilder();
    renderDietImagesInBuilder();
    renderExerciseImagesInBuilder();
    updateContextualSections('eBooks');
  }

  function savePageConfig() {
    let slug = (document.getElementById('pe_input_slug')?.value || '').trim();
    let name = (document.getElementById('pe_input_name')?.value || '').trim();
    let url = (document.getElementById('pe_input_url')?.value || '').trim();

    if (!slug && editingPageId) {
      slug = editingPageId.replace(/^page_/, '');
    }
    if (!slug) slug = 'index';
    if (!name) name = 'मुख्य पृष्ठ';
    if (!url) url = '/' + (slug === 'index' ? 'index.html' : slug + '.html');

    const existingPage = (editingPageId ? allPages.find(x => x.id === editingPageId) : null) || (slug ? allPages.find(x => x.slug === slug) : null);

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
    const audioUrl = (document.getElementById('pe_input_audio_url')?.value || '').trim();

    const ogTitle = (document.getElementById('pe_input_og_title')?.value || '').trim();
    const ogImage = (document.getElementById('pe_input_og_image')?.value || '').trim();
    const ogDesc = (document.getElementById('pe_input_og_description')?.value || '').trim();
    const shareMsg = (document.getElementById('pe_input_share_message')?.value || '').trim();

    // 3.1B Clinical Breakdown (Causes, Symptoms, Risks)
    const cbBadge = (document.getElementById('pe_input_cb_badge')?.value || '').trim();
    const cbTitle = (document.getElementById('pe_input_cb_title')?.value || '').trim();
    const cbCausesTitle = (document.getElementById('pe_input_cb_causes_title')?.value || '').trim();
    const cbCausesImg = (document.getElementById('pe_input_cb_causes_img')?.value || '').trim();
    const cbCausesPoints = (document.getElementById('pe_input_cb_causes_points')?.value || '').trim();
    const cbSymptomsTitle = (document.getElementById('pe_input_cb_symptoms_title')?.value || '').trim();
    const cbSymptomsImg = (document.getElementById('pe_input_cb_symptoms_img')?.value || '').trim();
    const cbSymptomsPoints = (document.getElementById('pe_input_cb_symptoms_points')?.value || '').trim();
    const cbRisksTitle = (document.getElementById('pe_input_cb_risks_title')?.value || '').trim();
    const cbRisksImg = (document.getElementById('pe_input_cb_risks_img')?.value || '').trim();
    const cbRisksPoints = (document.getElementById('pe_input_cb_risks_points')?.value || '').trim();

    let clinical_breakdown = null;
    if (cbCausesTitle || cbSymptomsTitle || cbRisksTitle || cbTitle || cbCausesImg || cbSymptomsImg || cbRisksImg) {
      clinical_breakdown = {
        badge_text: cbBadge || '🔬 वैज्ञानिक विश्लेषण',
        main_title: cbTitle,
        cards: [
          {
            title: cbCausesTitle || '❓ कारण (Causes)',
            color: '#2563eb',
            image: cbCausesImg,
            points: cbCausesPoints ? cbCausesPoints.split('\n').map(s => s.trim()).filter(Boolean) : []
          },
          {
            title: cbSymptomsTitle || '⚠️ मुख्य लक्षण (Symptoms)',
            color: '#2563eb',
            image: cbSymptomsImg,
            points: cbSymptomsPoints ? cbSymptomsPoints.split('\n').map(s => s.trim()).filter(Boolean) : []
          },
          {
            title: cbRisksTitle || '🚨 साइड इफेक्ट्स व खतरे (Risks)',
            color: '#dc2626',
            image: cbRisksImg,
            points: cbRisksPoints ? cbRisksPoints.split('\n').map(s => s.trim()).filter(Boolean) : []
          }
        ]
      };
    }

    // Diet & Exercise
    const dietTitle = (document.getElementById('pe_input_diet_title')?.value || '').trim();
    const dietItems = (document.getElementById('pe_input_diet_items')?.value || '').trim();
    const exTitle = (document.getElementById('pe_input_exercise_title')?.value || '').trim();
    const exItems = (document.getElementById('pe_input_exercise_items')?.value || '').trim();

    let diet_exercise = null;
    if (dietTitle || exTitle || dietItems || exItems || currentDietImages.length > 0 || currentExerciseImages.length > 0) {
      diet_exercise = {
        diet: {
          title: dietTitle,
          items: dietItems ? dietItems.split('\n').map(s => s.trim()).filter(Boolean) : [],
          images: Array.isArray(currentDietImages) ? currentDietImages.filter(x => x && (x.image || x.url)) : []
        },
        exercise: {
          title: exTitle,
          items: exItems ? exItems.split('\n').map(s => s.trim()).filter(Boolean) : [],
          images: Array.isArray(currentExerciseImages) ? currentExerciseImages.filter(x => x && (x.image || x.url)) : []
        }
      };
    }

    // 3.0 Floating 3D Banner
    const floatImg = (document.getElementById('pe_input_floating_banner_img')?.value || '').trim();
    const floatTitle = (document.getElementById('pe_input_floating_banner_title')?.value || '').trim();
    const floatLink = (document.getElementById('pe_input_floating_banner_link')?.value || '').trim();
    const floatAnim = document.getElementById('pe_select_floating_banner_anim')?.value || 'ublFloatBook3D';
    const floatChk = document.getElementById('pe_chk_floating_banner');
    const floatEnabled = floatChk ? floatChk.checked : Boolean(floatImg);

    const floating_banner = {
      enabled: floatEnabled,
      image: floatImg,
      badge_title: floatTitle,
      action_link: floatLink,
      animation: floatAnim
    };

    function stripImagePreviews(obj) {
      if (!obj) return obj;
      try {
        const clone = JSON.parse(JSON.stringify(obj));
        function walk(o) {
          if (Array.isArray(o)) {
            o.forEach(walk);
          } else if (o && typeof o === 'object') {
            delete o.image_preview;
            Object.values(o).forEach(walk);
          }
        }
        walk(clone);
        return clone;
      } catch (e) {
        return obj;
      }
    }

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
      audio_url: audioUrl,
      og_title: ogTitle,
      og_image: ogImage,
      og_description: ogDesc,
      share_message: shareMsg,
      floating_banner: stripImagePreviews(floating_banner),
      fb_pixel: fb,
      ga_tag: ga,
      hero_slides: stripImagePreviews(currentSlides),
      sections_order: currentSectionsOrder,
      hidden_sections: currentHiddenSections,
      kpi_cards: stripImagePreviews(currentKpiCards),
      marketing_cards: stripImagePreviews(currentMarketingCards),
      videos: stripImagePreviews(currentVideos),
      reviews: stripImagePreviews(currentReviews),
      faqs: stripImagePreviews(currentFaqs),
      health_diseases: stripImagePreviews(currentHealthDiseases),
      crops: stripImagePreviews(currentCrops),
      pashu_cards: stripImagePreviews(currentPashuCards),
      products: stripImagePreviews(currentProducts),
      page_kpi_sections: stripImagePreviews(currentPageKpiSections),
      clinical_breakdown: clinical_breakdown || existingPage?.clinical_breakdown || null,
      diet_exercise: diet_exercise || existingPage?.diet_exercise || null,
      whatsapp_support: {
        number: waNum,
        prompt: waPrompt
      }
    };

    const existingIdx = allPages.findIndex(x => x.id === pageObj.id);
    if (existingIdx >= 0) allPages[existingIdx] = pageObj;
    else allPages.unshift(pageObj);

    savePagesToStorage();
    closePageDrawer();
    resetPageForm();
    renderPagesTable();
    showToast(`✅ पेज '${name}' सम्पूर्ण कॉन्फ़िगरेशन के साथ सुरक्षित हो गया!`, 'success');

    // Universal Triple-Sync: 1) PHP API (Direct Server File Write + Git), 2) GitHub Contents API, 3) LocalStorage
    try {
      const cleanAllPages = stripImagePreviews(allPages);
      const configStr = JSON.stringify({ sitePages: cleanAllPages }, null, 2);
      const base64Data = btoa(unescape(encodeURIComponent(configStr)));

      // Call dedicated PHP save API (matches Universal Book Landing flow)
      fetch('/api/save_site_pages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_site_pages', sitePages: cleanAllPages })
      }).then(r => r.json()).then(phpRes => {
        if (phpRes && phpRes.success) {
          console.log('[Admin Save] PHP API success:', phpRes);
          showToast('⚡ सर्वर JSON व गिट पर तुरंत लाइव सुरक्षित हो गया!', 'success');
        }
      }).catch(() => {
        fetch('/api/save_book_landing.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_site_pages', sitePages: cleanAllPages })
        }).catch(() => null);
      });

      // Call GitHub Contents API (Serverless / Cloud Sync)
      syncAssetToGitHub('data/site-pages-config.json', base64Data).then(res => {
        if (res.success) {
          if (res.localDisk) {
            showToast('💾 स्थानीय डिस्क पर site-pages-config.json तुरंत सुरक्षित हो गया!', 'success');
          } else {
            showToast('🚀 GitHub व लाइव वेबसाइट पर डेटा सिंक हो गया!', 'success');
          }
        } else {
          console.warn('[Admin Save] GitHub sync warning:', res);
        }
      }).catch(err => {
        console.warn('[Admin Save] GitHub sync fetch error:', err);
      });
    } catch (e) {
      console.warn('[Admin Save] Serialization error:', e);
    }
  }

  window.savePageConfig = savePageConfig;
  window.exportPagesJson = exportPagesJson;

  window.previewCbCardImage = function(cardIdx, url) {
    const ids = ['pe_cb_causes_img_preview', 'pe_cb_symptoms_img_preview', 'pe_cb_risks_img_preview'];
    const imgIds = ['pe_cb_causes_img_preview_img', 'pe_cb_symptoms_img_preview_img', 'pe_cb_risks_img_preview_img'];
    const wrap = document.getElementById(ids[cardIdx]);
    const img = document.getElementById(imgIds[cardIdx]);
    if (wrap && img) {
      if (url && url.trim()) {
        img.src = url.trim();
        wrap.style.display = 'block';
      } else {
        wrap.style.display = 'none';
      }
    }
  };

  window.handleCbCardImageUpload = async function(cardIdx, inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];
    showToast('⏳ फोटो कंप्रेस व प्रोसेस हो रही है (WebP)...', 'info');
    try {
      const { dataUrl, sizeBytes } = await compressImageToWebp(file, 160000, 1200);
      if (!dataUrl) {
        showToast('❌ इमेज प्रोसेस करने में त्रुटि', 'error');
        return;
      }
      const sizeKb = (sizeBytes / 1024).toFixed(1);
      const generatedPath = generateAssetPath('health_card', file.name);
      const webpPath = '/' + generatedPath;

      // Cache locally in browser offline uploads store
      try {
        const offSync = JSON.parse(localStorage.getItem('AI_OFFLINE_UPLOADS') || '{}');
        offSync[webpPath] = dataUrl;
        localStorage.setItem('AI_OFFLINE_UPLOADS', JSON.stringify(offSync));
      } catch (e) {}

      const inputIds = ['pe_input_cb_causes_img', 'pe_input_cb_symptoms_img', 'pe_input_cb_risks_img'];
      const targetInput = document.getElementById(inputIds[cardIdx]);
      if (targetInput) {
        targetInput.value = webpPath;
        window.previewCbCardImage(cardIdx, dataUrl);
      }

      showToast(`⚡ HD WebP तैयार (${sizeKb} KB) | सर्वर व GitHub पर सिंक हो रही है...`, 'info');
      const syncRes = await syncAssetToGitHub(generatedPath, dataUrl);
      if (syncRes && syncRes.success) {
        showToast(`✅ फोटो सफलतापूर्वक अपलोड व सिंक हो गई! (${sizeKb} KB)`, 'success');
      } else {
        showToast(`✅ फोटो तैयार (${sizeKb} KB) | स्थानीय प्रीव्यू सक्रिय!`, 'success');
      }
    } catch (e) {
      console.error('[Admin] Clinical Breakdown Card Image error:', e);
      showToast('❌ एरर: ' + (e?.message || 'Upload error'), 'error');
    }
  };

  // ==========================================
  // MULTI-IMAGE BUILDER FOR DIET & EXERCISE
  // ==========================================
  function renderDietImagesInBuilder() {
    const container = document.getElementById('pe_diet_images_container');
    if (!container) return;
    if (!Array.isArray(currentDietImages) || currentDietImages.length === 0) {
      container.innerHTML = '<small style="color:var(--admin-muted); font-size:0.72rem;">कोई फोटो नहीं जोड़ी गई। "+ नई फोटो जोड़ें" दबाएं।</small>';
      return;
    }
    container.innerHTML = currentDietImages.map((item, idx) => `
      <div style="background:#091910; border:1px solid #05966960; border-radius:6px; padding:6px 8px; display:flex; align-items:center; gap:8px;">
        <div style="width:48px; height:48px; border-radius:4px; overflow:hidden; background:#000; flex-shrink:0; border:1px solid #059669;">
          <img src="${escapeHtml(item.image_preview || item.image || item.url || '/images/banners/health-banner.jpeg')}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/health-banner.jpeg'">
        </div>
        <div style="flex:1; display:flex; flex-direction:column; gap:4px; min-width:0;">
          <input type="text" value="${escapeHtml(item.caption || '')}" onchange="window.updateDietImageField(${idx}, 'caption', this.value)" class="admin-input" placeholder="कैप्शन (उदा. मेथी दाना पानी / सलाद)" style="padding:4px 8px; font-size:0.75rem;" />
          <div style="display:flex; gap:4px; align-items:center;">
            <input type="text" value="${escapeHtml(item.image || item.url || '')}" onchange="window.updateDietImageField(${idx}, 'image', this.value)" class="admin-input" placeholder="/images/banners/..." style="flex:1; padding:3px 6px; font-size:0.7rem;" />
            <label class="admin-button small-button" style="background:#059669; color:#fff; cursor:pointer; padding:3px 6px; font-size:0.7rem; margin:0; white-space:nowrap;">
              📁 फोटो
              <input type="file" accept="image/*" style="display:none;" onchange="window.handleDietImageUpload(${idx}, this)">
            </label>
          </div>
        </div>
        <button type="button" onclick="window.removeDietImage(${idx})" style="background:none; border:none; color:#ef4444; font-weight:800; cursor:pointer; font-size:1.1rem; padding:0 4px;" title="हटाएं">✕</button>
      </div>
    `).join('');
  }

  window.addDietImage = function() {
    if (!Array.isArray(currentDietImages)) currentDietImages = [];
    currentDietImages.push({ image: '', caption: '' });
    renderDietImagesInBuilder();
  };

  window.removeDietImage = function(idx) {
    if (!Array.isArray(currentDietImages)) return;
    currentDietImages.splice(idx, 1);
    renderDietImagesInBuilder();
  };

  window.updateDietImageField = function(idx, field, val) {
    if (!currentDietImages[idx]) return;
    currentDietImages[idx][field] = val;
    if (field === 'image') currentDietImages[idx].url = val;
  };

  window.handleDietImageUpload = async function(idx, inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];
    showToast('⏳ डाइट फोटो प्रोसेस हो रही है...', 'info');
    try {
      const { dataUrl, sizeBytes } = await compressImageToWebp(file, 140000, 1000);
      const generatedPath = generateAssetPath('diet_card', file.name);
      const webpPath = '/' + generatedPath;

      try {
        const offSync = JSON.parse(localStorage.getItem('AI_OFFLINE_UPLOADS') || '{}');
        offSync[webpPath] = dataUrl;
        localStorage.setItem('AI_OFFLINE_UPLOADS', JSON.stringify(offSync));
      } catch (e) {}

      if (currentDietImages[idx]) {
        currentDietImages[idx].image = webpPath;
        currentDietImages[idx].url = webpPath;
        currentDietImages[idx].image_preview = dataUrl;
        renderDietImagesInBuilder();
      }

      await syncAssetToGitHub(generatedPath, dataUrl);
      showToast('✅ डाइट फोटो सुरक्षित हो गई!', 'success');
    } catch (err) {
      showToast('❌ एरर: ' + err.message, 'error');
    }
  };

  function renderExerciseImagesInBuilder() {
    const container = document.getElementById('pe_exercise_images_container');
    if (!container) return;
    if (!Array.isArray(currentExerciseImages) || currentExerciseImages.length === 0) {
      container.innerHTML = '<small style="color:var(--admin-muted); font-size:0.72rem;">कोई फोटो नहीं जोड़ी गई। "+ नई फोटो जोड़ें" दबाएं।</small>';
      return;
    }
    container.innerHTML = currentExerciseImages.map((item, idx) => `
      <div style="background:#0e1329; border:1px solid #6366f160; border-radius:6px; padding:6px 8px; display:flex; align-items:center; gap:8px;">
        <div style="width:48px; height:48px; border-radius:4px; overflow:hidden; background:#000; flex-shrink:0; border:1px solid #6366f1;">
          <img src="${escapeHtml(item.image_preview || item.image || item.url || '/images/banners/health-banner.jpeg')}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/health-banner.jpeg'">
        </div>
        <div style="flex:1; display:flex; flex-direction:column; gap:4px; min-width:0;">
          <input type="text" value="${escapeHtml(item.caption || '')}" onchange="window.updateExerciseImageField(${idx}, 'caption', this.value)" class="admin-input" placeholder="कैप्शन (उदा. मंडूकासन / पवनमुक्तासन)" style="padding:4px 8px; font-size:0.75rem;" />
          <div style="display:flex; gap:4px; align-items:center;">
            <input type="text" value="${escapeHtml(item.image || item.url || '')}" onchange="window.updateExerciseImageField(${idx}, 'image', this.value)" class="admin-input" placeholder="/images/banners/..." style="flex:1; padding:3px 6px; font-size:0.7rem;" />
            <label class="admin-button small-button" style="background:#4f46e5; color:#fff; cursor:pointer; padding:3px 6px; font-size:0.7rem; margin:0; white-space:nowrap;">
              📁 फोटो
              <input type="file" accept="image/*" style="display:none;" onchange="window.handleExerciseImageUpload(${idx}, this)">
            </label>
          </div>
        </div>
        <button type="button" onclick="window.removeExerciseImage(${idx})" style="background:none; border:none; color:#ef4444; font-weight:800; cursor:pointer; font-size:1.1rem; padding:0 4px;" title="हटाएं">✕</button>
      </div>
    `).join('');
  }

  window.addExerciseImage = function() {
    if (!Array.isArray(currentExerciseImages)) currentExerciseImages = [];
    currentExerciseImages.push({ image: '', caption: '' });
    renderExerciseImagesInBuilder();
  };

  window.removeExerciseImage = function(idx) {
    if (!Array.isArray(currentExerciseImages)) return;
    currentExerciseImages.splice(idx, 1);
    renderExerciseImagesInBuilder();
  };

  window.updateExerciseImageField = function(idx, field, val) {
    if (!currentExerciseImages[idx]) return;
    currentExerciseImages[idx][field] = val;
    if (field === 'image') currentExerciseImages[idx].url = val;
  };

  window.handleExerciseImageUpload = async function(idx, inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];
    showToast('⏳ व्यायाम/योगासन फोटो प्रोसेस हो रही है...', 'info');
    try {
      const { dataUrl, sizeBytes } = await compressImageToWebp(file, 140000, 1000);
      const generatedPath = generateAssetPath('exercise_card', file.name);
      const webpPath = '/' + generatedPath;

      try {
        const offSync = JSON.parse(localStorage.getItem('AI_OFFLINE_UPLOADS') || '{}');
        offSync[webpPath] = dataUrl;
        localStorage.setItem('AI_OFFLINE_UPLOADS', JSON.stringify(offSync));
      } catch (e) {}

      if (currentExerciseImages[idx]) {
        currentExerciseImages[idx].image = webpPath;
        currentExerciseImages[idx].url = webpPath;
        currentExerciseImages[idx].image_preview = dataUrl;
        renderExerciseImagesInBuilder();
      }

      await syncAssetToGitHub(generatedPath, dataUrl);
      showToast('✅ व्यायाम फोटो सुरक्षित हो गई!', 'success');
    } catch (err) {
      showToast('❌ एरर: ' + err.message, 'error');
    }
  };

  // Custom MP3 Audio File Upload Handler
  window.handlePageAudioFileUpload = async function(inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];
    showToast('⏳ ऑडियो फाइल प्रोसेस हो रही है...', 'info');
    try {
      const reader = new FileReader();
      reader.onload = async function(e) {
        const dataUrl = e.target.result;
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const assetPath = `audio/page_audio_${Date.now()}_${cleanName}`;
        const inputUrlEl = document.getElementById('pe_input_audio_url');
        if (inputUrlEl) inputUrlEl.value = '/' + assetPath;

        try {
          const offSync = JSON.parse(localStorage.getItem('AI_OFFLINE_UPLOADS') || '{}');
          offSync['/' + assetPath] = dataUrl;
          localStorage.setItem('AI_OFFLINE_UPLOADS', JSON.stringify(offSync));
        } catch (err) {}

        showToast('⚡ ऑडियो तैयार | सर्वर पर सिंक हो रहा है...', 'info');
        await syncAssetToGitHub(assetPath, dataUrl);
        showToast('✅ कस्टम ऑडियो फाइल सुरक्षित हो गई!', 'success');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('❌ ऑडियो एरर: ' + err.message, 'error');
    }
  };

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
        if (p.audio_script || p.audio_url) {
          const rawSlug = p.slug || p.id.replace(/^page_/, '');
          existingScripts[rawSlug] = {
            title: p.audio_title || p.name,
            script: p.audio_script || '',
            audio_url: p.audio_url || ''
          };
          const cleanKey = rawSlug.replace(/^health_/, '').replace(/^page_health_/, '');
          existingScripts[cleanKey] = existingScripts[rawSlug];
          if (p.slug === 'index' || p.id === 'page_home') {
            existingScripts['index'] = existingScripts[rawSlug];
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
    let queryPart = '';
    if (location.hash && location.hash.includes('?')) {
      queryPart = location.hash.substring(location.hash.indexOf('?') + 1);
    } else if (location.search && location.search.length > 1) {
      queryPart = location.search.substring(1);
    }
    const params = new URLSearchParams(queryPart);
    const targetPage = params.get('page');
    if (targetPage) {
      const found = allPages.find(p => p.slug === targetPage || p.id === targetPage || p.id.includes(targetPage) || (targetPage === 'home' && (p.slug === 'index' || p.id === 'page_home')) || (targetPage === 'pashu' && (p.id.includes('pashu') || p.id.includes('cattle'))));
      if (found) {
        window.editSitePage(found.id);
      }
    }
  } catch (e) {}
}
