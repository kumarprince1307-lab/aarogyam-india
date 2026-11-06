/* ==========================================================================
   AAROGYAM INDIA — DYNAMIC BUNDLE LANDING PAGE ENGINE (V6)
   Features:
   - 100% Dynamic configuration (LocalStorage / Supabase / data/book-bundles.json)
   - Dynamic Top Countdown Timer Ribbon (On/Off, Duration, Text)
   - Dynamic Section Reordering (Drag/Drop/Move) & Section ON/OFF Visibility
   - Multi-Video Horizontal Carousel Slider (AarogyamTube / YouTube / Direct)
   - Audio Narration with Auto-Play & Hindi Web Speech API + MP3 fallback
   - 3D Animated Book Fan Stack (Large, Unclipped, Touch-Optimized)
   - Dynamic Expandable KPIs in Hero features strip
   - Short descriptions & selective key points per book (No [object Object])
   - Grand Total Calculation Stack (Total MRP, Regular Offer Total, Combo Price, Net Savings)
   - Dynamic "Why Buy Combo" feature cards
   - Real Reviews & FAQs aggregated from included books with delete/add capability
   - Pinch-Zoom Book Demo Pages Gallery with Left-Right Swipe Lightbox
   - Dynamic Final Buy Section with Guarantees & Multi-Thumb Stack
   - Universal Share System integration
   - Baby Browser (In-App Modal Sheet) with Dark Green Back button & Pulsing Combo Bar
   - Multi-Book Checkout Integration (Unlocks all books individually in My Library)
   ========================================================================== */

(function () {
  'use strict';

  let currentBundle = null;
  let allCatalogBooks = [];
  let allLandingPages = [];

  document.addEventListener('DOMContentLoaded', async () => {
    await initBundlePage();
  });

  async function initBundlePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const bundleId = urlParams.get('id') || urlParams.get('bundle') || urlParams.get('slug');

    // 1. Fetch live catalogs (Books & Landing Pages)
    allCatalogBooks = await fetchCatalogBooks();
    allLandingPages = await fetchLandingPages();

    // 2. Fetch Bundle Configuration
    currentBundle = await loadBundleConfig(bundleId);

    if (!currentBundle) {
      renderBundleNotFound();
      return;
    }

    // 3. Inject Dynamic SEO, Open Graph & Facebook Pixel
    injectMarketingMeta(currentBundle);

    // 4. Render Bundle UI Elements
    renderBundleHero(currentBundle);
    renderVideoSection(currentBundle);
    renderIncludedBooks(currentBundle);
    renderCalculationStack(currentBundle);
    renderDemoGallery(currentBundle);
    renderWhyBuySection(currentBundle);
    renderReviews(currentBundle);
    renderFaqs(currentBundle);
    renderFinalCta(currentBundle);
    renderStickyBar(currentBundle);
    initBundleAudio(currentBundle);

    // 5. Setup Countdown Timer
    setupCountdownTimer(currentBundle);

    // 6. Section Visibility & Order Controls (Drag/Drop Reorder & On/Off)
    applySectionControls(currentBundle);

    // 7. Bind Global Click Handlers
    bindActionButtons(currentBundle);
  }

  // --- 1. DATA LOADERS ---
  async function fetchCatalogBooks() {
    try {
      const resp = await fetch('/data/books.json?v=' + Math.floor(Date.now() / 15000));
      if (resp.ok) {
        const data = await resp.json();
        let list = data.books || data || [];
        try {
          const localCustom = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
          if (Array.isArray(localCustom)) {
            localCustom.forEach(cb => {
              const idx = list.findIndex(x => (x.id || '').toUpperCase() === (cb.id || '').toUpperCase());
              if (idx >= 0) list[idx] = Object.assign({}, list[idx], cb);
              else list.unshift(cb);
            });
          }
        } catch (_) { }
        return list;
      }
    } catch (_) { }
    return [];
  }

  async function fetchLandingPages() {
    try {
      const resp = await fetch('/data/universal-book-landing-pages.json?v=' + Math.floor(Date.now() / 15000));
      if (resp.ok) {
        const data = await resp.json();
        let pages = data.bookLandingPages || data || [];
        try {
          const localLps = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
          if (Array.isArray(localLps)) {
            localLps.forEach(lp => {
              const idx = pages.findIndex(x => (x.id || '').toUpperCase() === (lp.id || '').toUpperCase());
              if (idx >= 0) pages[idx] = Object.assign({}, pages[idx], lp);
              else pages.unshift(lp);
            });
          }
        } catch (_) { }
        return pages;
      }
    } catch (_) { }
    return [];
  }

  async function loadBundleConfig(targetKey) {
    // 1. Load from data/book-bundles.json (Server Git Master)
    let masterBundles = [];
    try {
      const resp = await fetch('/data/book-bundles.json?v=' + Date.now());
      if (resp.ok) {
        const data = await resp.json();
        masterBundles = Array.isArray(data) ? data : (data.bundles || []);
      }
    } catch (_) { }

    // Merge with any recent local editor overrides
    try {
      const localBundles = JSON.parse(localStorage.getItem('AAROGYAM_BUNDLE_LANDING_PAGES') || '[]');
      if (Array.isArray(localBundles) && localBundles.length > 0) {
        localBundles.forEach(loc => {
          if (!loc || !loc.id) return;
          const idx = masterBundles.findIndex(m => m.id.toLowerCase() === loc.id.toLowerCase());
          if (idx >= 0) {
            if (new Date(loc.updated_at || 0) > new Date(masterBundles[idx].updated_at || 0)) {
              masterBundles[idx] = loc;
            }
          } else {
            masterBundles.push(loc);
          }
        });
      }
    } catch (_) { }

    if (masterBundles.length > 0) {
      if (targetKey) {
        const match = masterBundles.find(b =>
          (b.id && b.id.toLowerCase() === targetKey.toLowerCase()) ||
          (b.slug && b.slug.toLowerCase() === targetKey.toLowerCase())
        );
        if (match) return match;
      }
      const active = masterBundles.find(b => b.status === 'active') || masterBundles[0];
      if (active) return active;
    }

    // 2. Check Supabase site_configs table
    try {
      const db = window.dbClient || window.supabase;
      if (db) {
        const { data } = await db.from('site_configs').select('value').eq('key', 'AAROGYAM_BUNDLE_LANDING_PAGES').maybeSingle();
        if (data && data.value) {
          const bundles = Array.isArray(data.value) ? data.value : JSON.parse(data.value || '[]');
          if (targetKey) {
            const match = bundles.find(b =>
              (b.id && b.id.toLowerCase() === targetKey.toLowerCase()) ||
              (b.slug && b.slug.toLowerCase() === targetKey.toLowerCase())
            );
            if (match) return match;
          } else {
            const active = bundles.find(b => b.status === 'active') || bundles[0];
            if (active) return active;
          }
        }
      }
    } catch (_) { }

    // 3. Check data/book-bundles.json
    try {
      const resp = await fetch('/data/book-bundles.json?v=' + Date.now());
      if (resp.ok) {
        const data = await resp.json();
        const bundles = data.bundles || data || [];
        if (Array.isArray(bundles) && bundles.length > 0) {
          if (targetKey) {
            const match = bundles.find(b =>
              (b.id && b.id.toLowerCase() === targetKey.toLowerCase()) ||
              (b.slug && b.slug.toLowerCase() === targetKey.toLowerCase())
            );
            if (match) return match;
          } else {
            const active = bundles.find(b => b.status === 'active') || bundles[0];
            if (active) return active;
          }
        }
      }
    } catch (_) { }

    // 4. Default High-Converting Master Bundle (5-in-1 Active Master)
    return {
      id: "BUNDLE_KISAN_5IN1",
      slug: "kisan-master-bundle-5in1",
      title: "महाबचत 5-इन-1 सम्पूर्ण किसान मास्टर कॉम्बो",
      subtitle: "खेती का डॉक्टर + दवा सलाहकार + 11 सब्जी खेती + गेहूँ व चना मास्टर गाइड्स का सम्पूर्ण संग्रह!",
      description: "बीज उपचार से लेकर कटाई तक सम्पूर्ण व्यावहारिक व वैज्ञानिक समाधान। 5 प्रमुख कृषि मार्गदर्शिकाओं का ऐसा संग्रह जो आपकी खेती की लागत को आधा और पैदावार को दोगुना करने में मदद करेगा।",
      badge: "धमाका कॉम्बो / 94% की महाबचत",
      buyBtnText: "🛒 पूरा 5-इन-1 कॉम्बो मात्र ₹199 में अनलॉक करें",
      bookIds: ["BK017", "BK016", "BK002", "BK019", "BK015"],
      mrp: 3395,
      offerPrice: 199,
      heroKpis: [
        { icon: "📚", value: "5 संपूर्ण ई-बुक्स", label: "गाइड्स" },
        { icon: "📄", value: "490+ रंगीन पेज", label: "विस्तृत सामग्री" },
        { icon: "🎯", value: "100% वैज्ञानिक गाइड", label: "सटीक समाधान" },
        { icon: "⚡", value: "तुरंत डिजिटल अनलॉकिंग", label: "लाइफटाइम एक्सेस" }
      ],
      videos: [
        {
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          title: "🎥 सम्पूर्ण 5-इन-1 कॉम्बो बंडल वीडियो झलक (भाग 1)",
          subtitle: "जानिए कैसे यह संग्रह आपकी समस्याओं का त्वरित समाधान करेगा:"
        },
        {
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          title: "🌾 फसल सुरक्षा एवं खाद प्रबंधन गाइड (भाग 2)",
          subtitle: "रोग व कीट पहचान की वैज्ञानिक पद्धति:"
        }
      ],
      videoAutoPlay: false,
      audioAutoPlay: true,
      audioScript: "नमस्ते किसान भाइयों! आरोग्यम इंडिया के इस विशेष महाबचत 5-इन-1 कॉम्बो बंडल में आपका स्वागत है। इस बंडल में आपको मिलती हैं खेती का डॉक्टर, कृषि दवा सलाहकार, 11 सब्जी खेती मास्टर, गेहूँ की खेती और चना की खेती की संपूर्ण मास्टर गाइड्स। इन 5 पुस्तकों में फसलों के समस्त रोग-कीट, सटीक खाद-स्प्रे शेड्यूल और पैदावार बढ़ाने के वैज्ञानिक तरीके दिए गए हैं। यह कॉम्बो बंडल आज आपको 94% की विशेष छूट पर मात्र ₹199 में मिल रहा है। नीचे दिए बटन पर क्लिक करके इसे अभी अनलॉक करें!",
      audioUrl: "",
      bannerImage: "/images/banners/farmer-community-banner.jpeg",
      ogTitle: "धमाका कॉम्बो: 1 किताब की कीमत में 5 मास्टर गाइड्स!",
      ogImage: "/images/banners/farmer-community-banner.jpeg",
      whatsappShareText: "🌾 *AAROGYAM INDIA — महाबचत 5-इन-1 ई-बुक कॉम्बो बंडल* 📚\n━━━━━━━━━━━━━━━━━━━━\n✨ 5 प्रमुख कृषि, सब्जी व फसल डॉक्टर मास्टर गाइड्स अब एक साथ!\n💰 कुल MRP: ~₹3,395~ | आज का विशेष कॉम्बो ऑफर: मात्र *₹199*!\n\n👇 *सम्पूर्ण बंडल अभी यहाँ से अनलॉक करें:*\n{LINK}"
    };
  }

  // --- 2. DYNAMIC SEO & SOCIAL SHARING META ---
  function injectMarketingMeta(bundle) {
    if (bundle.title) {
      document.title = `${bundle.title} — आरोग्यम इंडिया`;
      const seoTitle = document.getElementById('page-seo-title');
      if (seoTitle) seoTitle.textContent = `${bundle.title} — आरोग्यम इंडिया`;
    }
    const ogTitle = document.getElementById('og-title-meta');
    if (ogTitle) ogTitle.content = bundle.ogTitle || bundle.title;

    const ogImg = document.getElementById('og-image-meta');
    if (ogImg && bundle.ogImage) ogImg.content = bundle.ogImage;

    const ogUrl = document.getElementById('og-url-meta');
    if (ogUrl) ogUrl.content = window.location.href;

    const seoKeywords = document.getElementById('page-seo-keywords');
    if (seoKeywords && bundle.seoKeywords) seoKeywords.content = bundle.seoKeywords;

    // Facebook Pixel ViewContent Tracking
    if (typeof fbq === 'function') {
      fbq('track', 'ViewContent', {
        content_name: bundle.title,
        content_ids: bundle.bookIds,
        content_type: 'product_group',
        value: bundle.offerPrice || 199,
        currency: 'INR'
      });
    }
  }

  // --- 3. RENDER HERO SECTION ---
  function renderBundleHero(bundle) {
    const titleEl = document.getElementById('hero-title');
    const subEl = document.getElementById('hero-subtitle');
    const descEl = document.getElementById('hero-desc');
    const tagEl = document.getElementById('hero-tag');
    const ribbonBadge = document.getElementById('ribbonBadge');
    const oldPriceEl = document.getElementById('hero-old-price');
    const newPriceEl = document.getElementById('hero-new-price');
    const offerBadgeEl = document.getElementById('hero-offer-badge');
    const bannerImg = document.getElementById('hero-banner-img');
    const fanStackEl = document.getElementById('bundleFanStack');
    const featWrap = document.getElementById('hero-features-wrap');

    const resolvedBooks = getResolvedBundleBooks(bundle);

    if (titleEl) titleEl.textContent = bundle.title;
    if (subEl) subEl.textContent = bundle.subtitle;
    if (descEl && bundle.description) descEl.textContent = bundle.description;
    if (tagEl) tagEl.textContent = `🌾 ${bundle.badge || 'महाबचत कॉम्बो ऑफर'}`;
    if (ribbonBadge) ribbonBadge.textContent = bundle.badge || 'महाबचत कॉम्बो ऑफर';

    if (bannerImg && bundle.bannerImage) {
      bannerImg.src = bundle.bannerImage;
      bannerImg.style.display = 'block';
    }

    // Calculate Prices
    let totalMrp = bundle.mrp || 0;
    let totalRegular = 0;
    let totalPages = 0;

    resolvedBooks.forEach(b => {
      if (!bundle.mrp) totalMrp += (b.mrp || 299);
      totalRegular += (b.regularOffer || 99);
      totalPages += (b.totalPages || 120);
    });

    const finalOffer = bundle.offerPrice || 199;
    const savings = Math.max(0, totalMrp - finalOffer);
    const savingsPct = Math.round((savings / totalMrp) * 100);

    if (oldPriceEl) oldPriceEl.textContent = `₹${totalMrp}`;
    if (newPriceEl) newPriceEl.textContent = `₹${finalOffer}`;
    if (offerBadgeEl) offerBadgeEl.textContent = `बचत ₹${savings} (${savingsPct}% छूट)`;

    // Render Dynamic Expandable KPIs
    if (featWrap) {
      if (Array.isArray(bundle.heroKpis) && bundle.heroKpis.length > 0) {
        featWrap.innerHTML = bundle.heroKpis.map(k => {
          const icon = typeof k === 'object' ? (k.icon || '⚡') : '⚡';
          const val = typeof k === 'object' ? (k.value || k.label || '') : k;
          return `
            <div class="hero-feature">
              <span>${icon}</span>
              <span>${escapeHtml(val)}</span>
            </div>
          `;
        }).join('');
      } else {
        featWrap.innerHTML = `
          <div class="hero-feature"><span>📚</span> <span>${resolvedBooks.length} संपूर्ण ई-बुक्स</span></div>
          <div class="hero-feature"><span>📄</span> <span>${totalPages}+ रंगीन पेज</span></div>
          <div class="hero-feature"><span>🎯</span> <span>100% वैज्ञानिक गाइड</span></div>
          <div class="hero-feature"><span>⚡</span> <span>लाइफटाइम लाइब्रेरी एक्सेस</span></div>
        `;
      }
    }


    // 3D Book Fan Stack with Touch Swipe & 2-sec Smooth Auto-Slide Carousel
    initInteractive3DFanStack(resolvedBooks);


    const heroBuyBtn = document.getElementById('hero-buy-btn');
    if (heroBuyBtn) {
      const btnText = bundle.buyBtnText || `🛒 पूरा कॉम्बो ₹${finalOffer} में अभी खरीदें`;
      heroBuyBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${escapeHtml(btnText.replace(/^🛒\s*/, ''))}`;
    }
  }


  // =========================================================================
  // 3D FAN STACK TOUCH SWIPE & AUTO-SLIDE CAROUSEL ENGINE
  // =========================================================================
  let _fanBooks = [];
  let _fanCenterIdx = 2;
  let _fanAutoSlideTimer = null;
  let _fanTouchStartX = 0;
  let _fanTouchStartY = 0;
  let _fanIsSwiping = false;

  function updateFanPositions() {
    const stackEl = document.getElementById('bundleFanStack');
    if (!stackEl || _fanBooks.length === 0) return;

    const items = stackEl.querySelectorAll('.bundle-fan-book-item');
    const total = _fanBooks.length;

    items.forEach((item) => {
      const idx = parseInt(item.getAttribute('data-book-idx'), 10);
      let diff = (idx - _fanCenterIdx + total) % total;
      if (diff > total / 2) diff -= total;

      item.className = 'bundle-fan-book-item bundle-fan-book';
      if (diff === 0) {
        item.classList.add('fan-slot-center');
      } else if (diff === -1) {
        item.classList.add('fan-slot-left');
      } else if (diff === -2 || diff < -2) {
        item.classList.add('fan-slot-far-left');
      } else if (diff === 1) {
        item.classList.add('fan-slot-right');
      } else if (diff >= 2) {
        item.classList.add('fan-slot-far-right');
      }
    });

    // Update dots
    const dots = document.querySelectorAll('#fanDotsContainer .fan-dot');
    dots.forEach((dot) => {
      const dIdx = parseInt(dot.getAttribute('data-idx'), 10);
      if (dIdx === _fanCenterIdx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function setFanCenterIndex(newIdx) {
    if (_fanBooks.length === 0) return;
    _fanCenterIdx = (newIdx + _fanBooks.length) % _fanBooks.length;
    updateFanPositions();
  }

  function rotateFanStack(dir) {
    setFanCenterIndex(_fanCenterIdx + dir);
  }

  function startAutoSlide() {
    stopAutoSlide();
    _fanAutoSlideTimer = setInterval(() => {
      rotateFanStack(1);
    }, 2000);
  }

  function stopAutoSlide() {
    if (_fanAutoSlideTimer) {
      clearInterval(_fanAutoSlideTimer);
      _fanAutoSlideTimer = null;
    }
  }

  let _fanResumeTimer = null;
  function resetAutoSlide() {
    stopAutoSlide();
    if (_fanResumeTimer) clearTimeout(_fanResumeTimer);
    _fanResumeTimer = setTimeout(() => {
      startAutoSlide();
    }, 4000);
  }

  function initInteractive3DFanStack(books) {
    const stackEl = document.getElementById('bundleFanStack');
    const container = document.querySelector('.bundle-fan-stack-container');
    const hintEl = document.querySelector('.bundle-fan-hint');
    if (!stackEl || !Array.isArray(books) || books.length === 0) return;

    _fanBooks = books.slice(0, 5);
    _fanCenterIdx = Math.min(2, Math.floor(_fanBooks.length / 2));

    stackEl.innerHTML = _fanBooks.map((b, idx) => {
      return `
        <div 
          class="bundle-fan-book-item bundle-fan-book" 
          data-book-idx="${idx}" 
          data-book-id="${escapeHtml(b.id)}"
          title="${escapeHtml(b.title)} - क्लिक करके अंदर देखें"
        >
          <img 
            src="${b.cover}" 
            alt="${escapeHtml(b.title)}" 
            class="bundle-fan-book-cover"
            onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';"
          />
          <div class="bundle-fan-book-label">
            <span class="fan-book-name">${escapeHtml(b.title)}</span>
            <span class="fan-book-action">📖 अंदर देखें</span>
          </div>
        </div>
      `;
    }).join('');

    if (hintEl) {
      hintEl.innerHTML = `
        <div class="fan-controls-row">
          <button type="button" class="fan-arrow-btn prev" title="पिछली किताब">◀</button>
          <div class="fan-dots" id="fanDotsContainer">
            ${_fanBooks.map((_, i) => `<span class="fan-dot ${i === _fanCenterIdx ? 'active' : ''}" data-idx="${i}"></span>`).join('')}
          </div>
          <button type="button" class="fan-arrow-btn next" title="अगली किताब">▶</button>
        </div>
        <div class="fan-hint-text">
          <span>👆 स्वाइप करें या टैप करें • बीच वाली किताब पर क्लिक कर अंदर का पेज देखें</span>
        </div>
      `;

      hintEl.querySelector('.fan-arrow-btn.prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        rotateFanStack(-1);
        resetAutoSlide();
      });
      hintEl.querySelector('.fan-arrow-btn.next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        rotateFanStack(1);
        resetAutoSlide();
      });
      hintEl.querySelectorAll('.fan-dot').forEach((dot) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetIdx = parseInt(dot.getAttribute('data-idx'), 10);
          setFanCenterIndex(targetIdx);
          resetAutoSlide();
        });
      });
    }

    const bookItems = stackEl.querySelectorAll('.bundle-fan-book-item');
    bookItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const bookIdx = parseInt(item.getAttribute('data-book-idx'), 10);
        const bookId = item.getAttribute('data-book-id');

        if (bookIdx === _fanCenterIdx) {
          if (window.openBabyBrowser) window.openBabyBrowser(bookId);
        } else {
          setFanCenterIndex(bookIdx);
          resetAutoSlide();
        }
      });
    });

    if (container && !container.dataset.swipeBound) {
      container.dataset.swipeBound = '1';
      container.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        _fanTouchStartX = e.touches[0].clientX;
        _fanTouchStartY = e.touches[0].clientY;
        _fanIsSwiping = true;
        stopAutoSlide();
      }, { passive: true });

      container.addEventListener('touchmove', (e) => {
        if (!_fanIsSwiping || !e.touches || e.touches.length === 0) return;
        const currentY = e.touches[0].clientY;
        if (Math.abs(currentY - _fanTouchStartY) > 50 && Math.abs(e.touches[0].clientX - _fanTouchStartX) < 25) {
          _fanIsSwiping = false;
        }
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        if (!_fanIsSwiping) return;
        _fanIsSwiping = false;
        const touchEndX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : _fanTouchStartX;
        const diffX = touchEndX - _fanTouchStartX;

        if (diffX > 35) {
          rotateFanStack(-1);
        } else if (diffX < -35) {
          rotateFanStack(1);
        }
        resetAutoSlide();
      });

      container.addEventListener('mouseenter', stopAutoSlide);
      container.addEventListener('mouseleave', resetAutoSlide);
    }

    updateFanPositions();
    startAutoSlide();
  }


  // --- 4. RENDER MULTI-VIDEO HORIZONTAL CAROUSEL ---
  let _activeVideoIdx = 0;
  let _bundleVideos = [];

  function renderVideoSection(bundle) {
    const videoSec = document.getElementById('sec-bundle-video');
    const container = document.getElementById('bundleVideoPlayerContainer');
    const titleEl = document.getElementById('bundleVideoTitle');
    const subEl = document.getElementById('bundleVideoSubtitle');
    const dotsEl = document.getElementById('bundleVideosDots');

    if (!videoSec || !container) return;

    // Collect videos
    if (Array.isArray(bundle.videos) && bundle.videos.length > 0) {
      _bundleVideos = bundle.videos.filter(v => v && (v.url || v.videoUrl));
    } else if (bundle.videoUrl) {
      _bundleVideos = [{
        url: bundle.videoUrl,
        title: bundle.videoTitle || "सम्पूर्ण कॉम्बो बंडल वीडियो झलक",
        subtitle: bundle.videoSubtitle || ""
      }];
    } else {
      _bundleVideos = [];
    }

    if (_bundleVideos.length === 0) {
      videoSec.style.display = 'none';
      return;
    }

    videoSec.style.display = 'block';
    if (titleEl) titleEl.textContent = bundle.videoTitle || "🎥 सम्पूर्ण कॉम्बो बंडल वीडियो झलक";
    if (subEl) subEl.textContent = bundle.videoSubtitle || "जानिए कैसे यह संग्रह आपकी समस्याओं का त्वरित समाधान करेगा:";

    // Render video slides
    container.innerHTML = _bundleVideos.map((v, idx) => {
      const vUrl = v.url || v.videoUrl;
      const isDirect = /\.(mp4|webm|ogg)($|\?)/i.test(vUrl);
      const isAutoPlay = idx === 0 && Boolean(bundle.videoAutoPlay);

      let mediaHtml = '';
      if (isDirect) {
        mediaHtml = `
          <video 
            src="${vUrl}" 
            controls 
            playsinline 
            ${isAutoPlay ? 'autoplay muted' : ''} 
            style="width:100%;height:100%;max-height:420px;border-radius:12px;background:#000;display:block;margin:0 auto;object-fit:contain;">
          </video>
        `;
      } else {
        const embedUrl = getEmbedUrl(vUrl, isAutoPlay);
        mediaHtml = `
          <div style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;background:#000;">
            <iframe 
              src="${embedUrl}" 
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:12px;" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        `;
      }

      return `
        <div class="bundle-video-slide" data-index="${idx}">
          ${mediaHtml}
          ${v.title ? `<div style="margin-top:8px;font-weight:800;color:#0f172a;font-size:0.92rem;text-align:center;">${escapeHtml(v.title)}</div>` : ''}
          ${v.subtitle ? `<div style="font-size:0.8rem;color:#64748b;text-align:center;">${escapeHtml(v.subtitle)}</div>` : ''}
        </div>
      `;
    }).join('');

    // Render dots if more than 1 video
    if (dotsEl) {
      if (_bundleVideos.length > 1) {
        dotsEl.innerHTML = _bundleVideos.map((_, i) => `
          <span class="bundle-video-dot ${i === 0 ? 'active' : ''}" onclick="window.goToBundleVideo(${i})"></span>
        `).join('');
      } else {
        dotsEl.innerHTML = '';
      }
    }

    _activeVideoIdx = 0;
    updateVideoSlidePosition();
  }

  function getEmbedUrl(url, autoplay) {
    if (!url) return '';
    let autoParam = autoplay ? '&autoplay=1&mute=1' : '';
    if (url.includes('youtube.com/watch?v=')) {
      const vidId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vidId}?rel=0${autoParam}`;
    } else if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vidId}?rel=0${autoParam}`;
    }
    return url;
  }

  window.slideBundleVideos = function (dir) {
    if (!_bundleVideos || _bundleVideos.length <= 1) return;
    _activeVideoIdx += dir;
    if (_activeVideoIdx < 0) _activeVideoIdx = _bundleVideos.length - 1;
    if (_activeVideoIdx >= _bundleVideos.length) _activeVideoIdx = 0;
    updateVideoSlidePosition();
  };

  window.goToBundleVideo = function (idx) {
    if (idx < 0 || idx >= _bundleVideos.length) return;
    _activeVideoIdx = idx;
    updateVideoSlidePosition();
  };

  function updateVideoSlidePosition() {
    const container = document.getElementById('bundleVideoPlayerContainer');
    if (!container) return;
    const slides = container.querySelectorAll('.bundle-video-slide');
    if (slides.length > _activeVideoIdx && slides[_activeVideoIdx]) {
      const targetSlide = slides[_activeVideoIdx];
      container.scrollTo({
        left: targetSlide.offsetLeft - container.offsetLeft,
        behavior: 'smooth'
      });
    }
    // Update dots
    const dots = document.querySelectorAll('.bundle-video-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === _activeVideoIdx);
    });
  }

  // --- 5. RENDER INCLUDED BOOKS (INDIVIDUAL PRICES, NO "100% FREE", CLEAN BULLETS) ---
  function renderIncludedBooks(bundle) {
    const grid = document.getElementById('bundleBooksGrid');
    if (!grid) return;

    const resolvedBooks = getResolvedBundleBooks(bundle);

    grid.innerHTML = resolvedBooks.map(b => {
      return `
        <div class="bundle-book-card">
          <div class="bundle-card-img-wrap" onclick="window.openBabyBrowser('${b.id}')" title="किताब का पूरा पेज देखने के लिए टैप करें" style="cursor:pointer;position:relative;flex-shrink:0;">
            <img src="${b.cover}" alt="${escapeHtml(b.title)}" class="bundle-card-thumb" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';" />
            <span style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.85);color:#fde047;font-size:0.62rem;font-weight:800;padding:2px 6px;border-radius:4px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,0.3);">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> झलक देखें
            </span>
          </div>
          <div class="bundle-card-content">
            <h4 class="bundle-card-title" onclick="window.openBabyBrowser('${b.id}')" style="cursor:pointer;" title="किताब का पूरा पेज देखने के लिए टैप करें">
              ${escapeHtml(b.title)}
            </h4>
            <div class="bundle-card-meta">
              <span><i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i> ${b.totalPages} पेज</span>
              <span><i class="fa-solid fa-check-circle" style="color:#16a34a;"></i> सम्पूर्ण वैज्ञानिक गाइड</span>
            </div>

            <!-- Short Description (Configured by Admin for Curiosity & Knowledge) -->
            <p class="bundle-card-desc" style="font-size:0.84rem;color:#475569;margin:6px 0;line-height:1.45;">
              ${escapeHtml(b.desc)}
            </p>

            <!-- Key points bullet box (ONLY rendered if explicitly provided in Admin) -->
            ${b.keyPoints && b.keyPoints.length > 0 ? `
              <div class="bundle-card-points" style="background:#f8fafc;border-left:3px solid #16a34a;padding:6px 10px;border-radius:6px;margin:8px 0;font-size:0.78rem;color:#334155;border:1px solid #e2e8f0;border-left:3px solid #16a34a;">
                <strong style="color:#16a34a;display:block;margin-bottom:3px;font-size:0.8rem;">✨ मुख्य बिंदु:</strong>
                <ul style="margin:0;padding-left:16px;list-style-type:disc;display:flex;flex-direction:column;gap:3px;">
                  ${b.keyPoints.map(pt => `<li>${escapeHtml(pt)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div class="bundle-card-pricing">
              MRP: <span class="old-mrp">₹${b.mrp}</span>
              सामान्य ऑफर मूल्य: <span class="single-offer">₹${b.regularOffer}</span>
            </div>
            <div>
              <button type="button" class="bundle-preview-btn" onclick="window.openBabyBrowser('${b.id}')">
                <i class="fa-solid fa-book-open"></i> 📖 इस किताब की पूरी जानकारी देखें →
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- 6. RENDER GRAND TOTAL CALCULATION STACK ---
  function renderCalculationStack(bundle) {
    const resolvedBooks = getResolvedBundleBooks(bundle);

    let totalMrp = bundle.mrp || 0;
    let totalRegular = 0;

    resolvedBooks.forEach(b => {
      if (!bundle.mrp) totalMrp += (b.mrp || 299);
      totalRegular += (b.regularOffer || 99);
    });

    const finalOffer = bundle.offerPrice || 199;
    const savings = Math.max(0, totalMrp - finalOffer);
    const savingsPct = Math.round((savings / totalMrp) * 100);

    const calcTotalMrp = document.getElementById('calcTotalMrp');
    const calcTotalRegular = document.getElementById('calcTotalRegular');
    const calcFinalPrice = document.getElementById('calcFinalPrice');
    const calcSavingsAmount = document.getElementById('calcSavingsAmount');
    const calcBuyBtn = document.getElementById('bundleCalcBuyBtn');

    if (calcTotalMrp) calcTotalMrp.textContent = `₹${totalMrp}`;
    if (calcTotalRegular) calcTotalRegular.textContent = `₹${totalRegular}`;
    if (calcFinalPrice) calcFinalPrice.textContent = `₹${finalOffer}`;
    if (calcSavingsAmount) calcSavingsAmount.textContent = `₹${savings} (${savingsPct}% की महाबचत)`;
    if (calcBuyBtn) calcBuyBtn.textContent = `🛒 पूरा कॉम्बो ₹${finalOffer} में अभी अनलॉक करें`;

    const finalBuyBtn = document.getElementById('final-buy-btn');
    if (finalBuyBtn) finalBuyBtn.textContent = `🛒 पूरा कॉम्बो ₹${finalOffer} में अभी खरीदें`;
  }

  // --- 7. RENDER PINCH-TO-ZOOM DEMO PAGES GALLERY ---
  function renderDemoGallery(bundle) {
    const grid = document.getElementById('preview-gallery-grid');
    if (!grid) return;

    let demoList = [];

    // Check if custom demo images were set in Admin
    if (Array.isArray(bundle.demoImages) && bundle.demoImages.length > 0) {
      demoList = bundle.demoImages.map(img => ({
        img: img,
        title: bundle.title || 'सैंपल पृष्ठ'
      }));
    } else {
      // Auto-extract 2 demo images from each included book
      (bundle.bookIds || []).forEach(bId => {
        const lp = allLandingPages.find(p => (p.id || '').toUpperCase() === String(bId).toUpperCase());
        const cb = allCatalogBooks.find(b => (b.id || '').toUpperCase() === String(bId).toUpperCase());
        const bookTitle = lp?.hero?.title || cb?.heading || cb?.name || bId;
        let images = lp?.demo_images || lp?.preview_images || cb?.demoImages || [];
        if (!images || images.length === 0) {
          images = [
            `/images/books/${bId.toLowerCase()}-cover.webp`
          ];
        }
        images.slice(0, 2).forEach((img, i) => {
          demoList.push({
            img: img,
            title: `${bookTitle} (पेज #${i + 1})`
          });
        });
      });
    }

    if (demoList.length === 0) {
      demoList = [
        { img: "/images/books/kharif-master-guide-2026-preview-01.webp", title: "खरीफ गाइड सैंपल #1" },
        { img: "/images/books/kharif-master-guide-2026-preview-02.webp", title: "खरीफ गाइड सैंपल #2" },
        { img: "/images/books/kheti-dr-demo-1.webp", title: "खेती डॉक्टर सैंपल #1" },
        { img: "/images/books/kheti-dr-demo-2.webp", title: "खेती डॉक्टर सैंपल #2" }
      ];
    }

    window.bundleDemoImages = demoList.map(x => x.img);

    grid.innerHTML = demoList.map((item, idx) => `
      <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);text-align:center;cursor:zoom-in;" onclick="window.openUniversalGalleryLightbox ? window.openUniversalGalleryLightbox(${idx}, window.bundleDemoImages) : (window.openPinchZoomLightbox && window.openPinchZoomLightbox('${item.img}'))">
        <div style="font-size:0.75rem;font-weight:800;color:#64748b;padding:6px 8px;background:#f1f5f9;border-bottom:1px solid #e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${escapeHtml(item.title)}
        </div>
        <img 
          src="${item.img}" 
          alt="${escapeHtml(item.title)}" 
          style="width:100%;height:auto;max-height:360px;object-fit:contain;cursor:zoom-in;display:block;margin:0 auto;" 
          onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';"
        />
      </div>
    `).join('');
  }

  // --- 8. RENDER WHY BUY COMBO SECTION ---
  function renderWhyBuySection(bundle) {
    const titleEl = document.getElementById('why-title');
    const descEl = document.getElementById('why-desc');
    const grid = document.getElementById('whyCardsGrid');

    if (titleEl && bundle.whyBuyTitle) titleEl.textContent = bundle.whyBuyTitle;
    if (descEl && bundle.whyBuyDesc) descEl.textContent = bundle.whyBuyDesc;

    if (grid && Array.isArray(bundle.whyBuyFeatures) && bundle.whyBuyFeatures.length > 0) {
      grid.innerHTML = bundle.whyBuyFeatures.map((item, idx) => `
        <div class="why-card">
          <div class="why-icon" style="font-size: 26px; margin-bottom: 10px;">${escapeHtml(item.icon || '✨')}</div>
          <h3>${idx + 1}. ${escapeHtml(item.title || '')}</h3>
          <p>${escapeHtml(item.desc || '')}</p>
        </div>
      `).join('');
    }
  }

  // --- 9. RENDER REVIEWS ---
  function renderReviews(bundle) {
    const reviewsGrid = document.getElementById('bundleReviewsGrid');
    if (!reviewsGrid) return;

    let collectedReviews = [];
    if (Array.isArray(bundle.reviews) && bundle.reviews.length > 0) {
      collectedReviews = bundle.reviews;
    } else {
      (bundle.bookIds || []).forEach(bId => {
        const lp = allLandingPages.find(p => (p.id || '').toUpperCase() === String(bId).toUpperCase());
        if (lp && Array.isArray(lp.reviews) && lp.reviews.length > 0) {
          collectedReviews.push(...lp.reviews);
        }
      });
    }

    if (collectedReviews.length === 0) {
      collectedReviews = [
        {
          name: "राजेश पाटीदार (उज्जैन, म.प्र.)",
          rating: 5,
          text: "मैंने यह कॉम्बो बंडल खरीदा। धान, सोयाबीन और सब्जी डॉक्टर की सभी किताबें एक ही जगह मिल गईं। फोटो देखकर कीट व दवा समझना बहुत आसान है। बहुत ही उपयोगी बंडल!",
          verified: true
        },
        {
          name: "सुरेश कुमार शर्मा (सीकर, राजस्थान)",
          rating: 5,
          text: "एक-एक किताब लेने की जगह यह कॉम्बो पैक लिया। सीधे ₹1000 की बचत हुई और फोन में सारी ई-बुक्स तुरंत आ गईं। ऑडियो भी बहुत स्पष्ट है।",
          verified: true
        },
        {
          name: "महेंद्र सिंह धाकड़ (कोटा, राजस्थान)",
          rating: 5,
          text: "कृषि विज्ञान केंद्र के वैज्ञानिकों द्वारा लिखी यह किताबें हर किसान के पास होनी चाहिए। खाद प्रबंधन और रोग पहचान से फसल में काफी सुधार हुआ।",
          verified: true
        }
      ];
    }

    reviewsGrid.innerHTML = collectedReviews.slice(0, 8).map(r => `
      <div style="background:#ffffff;border:1.5px solid #e2e8f0;border-radius:14px;padding:18px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-weight:800;color:#0f172a;font-size:0.96rem;">${escapeHtml(r.name || 'किसान साथी')}</div>
          <div style="color:#f59e0b;font-size:0.9rem;">★★★★★</div>
        </div>
        <p style="font-size:0.9rem;color:#334155;line-height:1.6;margin-bottom:10px;">"${escapeHtml(r.text || r.comment || '')}"</p>
        <div style="font-size:0.75rem;color:#16a34a;font-weight:800;display:flex;align-items:center;gap:4px;">
          <i class="fa-solid fa-circle-check"></i> सत्यापित खरीदार (Verified Buyer)
        </div>
      </div>
    `).join('');
  }

  // --- 10. RENDER FAQS ---
  function renderFaqs(bundle) {
    const accordion = document.getElementById('bundleFaqAccordion');
    if (!accordion) return;

    if (Array.isArray(bundle.faqs) && bundle.faqs.length > 0) {
      accordion.innerHTML = bundle.faqs.map((f, idx) => `
        <details class="faq-item" style="background:#ffffff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 18px;margin-bottom:12px;" ${idx === 0 ? 'open' : ''}>
          <summary style="font-weight:800;color:#0f172a;cursor:pointer;font-size:1.02rem;">${idx + 1}. ${escapeHtml(f.q || f.question || '')}</summary>
          <p style="margin-top:10px;font-size:0.92rem;color:#334155;line-height:1.6;">${escapeHtml(f.a || f.answer || '')}</p>
        </details>
      `).join('');
    }
  }

  // --- 11. RENDER FINAL BUY SECTION ---
  function renderFinalCta(bundle) {
    const finalBuyBtn = document.getElementById('final-buy-btn');
    const finalOffer = bundle.offerPrice || 199;

    if (finalBuyBtn) {
      const btnText = bundle.finalCta?.buttonText || bundle.buyBtnText || `🛒 पूरा कॉम्बो ₹${finalOffer} में अभी खरीदें`;
      finalBuyBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${escapeHtml(btnText.replace(/^🛒\s*/, ''))}`;
    }
  }

  // --- 12. RENDER STICKY BAR ---
  function renderStickyBar(bundle) {
    const resolvedBooks = getResolvedBundleBooks(bundle);
    const thumb1 = document.getElementById('sticky-thumb-1');
    const thumb2 = document.getElementById('sticky-thumb-2');
    const oldPrice = document.getElementById('stickyOldPrice');
    const newPrice = document.getElementById('stickyNewPrice');

    if (thumb1 && resolvedBooks[0]) thumb1.src = resolvedBooks[0].cover;
    if (thumb2 && resolvedBooks[1]) thumb2.src = resolvedBooks[1].cover;
    else if (thumb2 && resolvedBooks[0]) thumb2.src = resolvedBooks[0].cover;

    let totalMrp = bundle.mrp || 0;
    resolvedBooks.forEach(b => {
      if (!bundle.mrp) totalMrp += (b.mrp || 299);
    });

    const finalOffer = bundle.offerPrice || 199;
    if (oldPrice) oldPrice.textContent = `₹${totalMrp}`;
    if (newPrice) newPrice.textContent = `₹${finalOffer}`;

    // Update Baby Browser Buy button
    const babyBuyText = document.getElementById('babyBrowserBuyText');
    if (babyBuyText) {
      babyBuyText.textContent = `🛒 पूरा कॉम्बो ₹${finalOffer} में खरीदें`;
    }
  }

  // --- 13. BABY BROWSER CONTROLLER (ACTUAL BOOK LANDING PAGE) ---
  window.openBabyBrowser = function (bookId) {
    const backdrop = document.getElementById('babyBrowserBackdrop');
    const iframe = document.getElementById('babyBrowserIframe');
    const babyBuyText = document.getElementById('babyBrowserBuyText');

    if (currentBundle) {
      const resolvedBooks = getResolvedBundleBooks(currentBundle);
      const targetBook = resolvedBooks.find(x => String(x.id).toUpperCase() === String(bookId).toUpperCase()) || resolvedBooks[0];
      const singleOffer = targetBook ? (targetBook.regularOffer || 99) : 99;
      const comboOffer = currentBundle.offerPrice || 199;

      const singleNotice = document.getElementById('babySingleNoticePrice');
      const comboNotice = document.getElementById('babyComboNoticePrice');
      if (singleNotice) singleNotice.textContent = `₹${singleOffer}`;
      if (comboNotice) comboNotice.textContent = `₹${comboOffer}`;

      if (babyBuyText) {
        babyBuyText.textContent = `🛒 पूरा कॉम्बो ₹${comboOffer} में खरीदें`;
      }
    }

    if (iframe) {
      iframe.src = `/ebooks/book-landing.html?id=${encodeURIComponent(bookId)}&bundle_preview=1`;
    }

    if (backdrop) {
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeBabyBrowser = function () {
    const backdrop = document.getElementById('babyBrowserBackdrop');
    const iframe = document.getElementById('babyBrowserIframe');

    if (backdrop) {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Clear iframe after transition to stop any media playing inside
    setTimeout(() => {
      if (iframe && (!backdrop || !backdrop.classList.contains('open'))) {
        iframe.src = 'about:blank';
      }
    }, 300);
  };

  // --- 14. AUDIO NARRATION SYSTEM WITH AUTO-PLAY & HINDI TTS / MP3 SUPPORT ---
  let _bundleAudio = null;
  let _audioPlaying = false;
  let _speechUtterance = null;

  function initBundleAudio(bundle) {
    _bundleAudio = document.getElementById('bundleNarrationAudio');
    const audioPill = document.getElementById('bundleFloatingAudioPill');
    const audioLabel = document.getElementById('bundleAudioPillLabel');
    if (!audioPill) return;

    const audioUrl = bundle.audioUrl;
    const audioScript = bundle.audioScript;

    if (!audioUrl && !audioScript) {
      audioPill.style.display = 'none';
      return;
    }

    audioPill.style.display = 'inline-flex';
    if (audioLabel) audioLabel.textContent = bundle.audioTitle || '🎙️ कॉम्बो ऑडियो झलक';
    scheduleAudioPillAutoShrink(4000);

    if (bundle.audioAutoPlay && !bundle.videoAutoPlay) {
      const attemptAuto = () => {
        playNarration(bundle);
      };

      try {
        attemptAuto();
      } catch (_) { }

      // Unlock on first tap if browser blocked autoplay
      const unlockAudio = () => {
        if (!_audioPlaying) playNarration(bundle);
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      };
      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
    }
  }

  function playNarration(bundle) {
    if (!bundle) bundle = currentBundle;
    if (!bundle) return;

    if (bundle.audioUrl && _bundleAudio) {
      _bundleAudio.src = bundle.audioUrl;
      _bundleAudio.play().then(() => {
        setAudioState(true);
      }).catch(() => {
        if (bundle.audioScript && 'speechSynthesis' in window) {
          playSpeechScript(bundle.audioScript);
        }
      });
      _bundleAudio.onended = () => setAudioState(false);
      _bundleAudio.onpause = () => setAudioState(false);
      _bundleAudio.onplay = () => setAudioState(true);
      return;
    }

    if (bundle.audioScript && 'speechSynthesis' in window) {
      playSpeechScript(bundle.audioScript);
    }
  }

  function playSpeechScript(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      _speechUtterance = new SpeechSynthesisUtterance(text);
      _speechUtterance.lang = 'hi-IN';
      _speechUtterance.rate = 0.95;
      _speechUtterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang && (v.lang.startsWith('hi') || v.name.includes('Hindi')));
      if (hiVoice) _speechUtterance.voice = hiVoice;

      _speechUtterance.onstart = () => setAudioState(true);
      _speechUtterance.onend = () => setAudioState(false);
      _speechUtterance.onerror = () => setAudioState(false);

      window.speechSynthesis.speak(_speechUtterance);
    } catch (_) {
      setAudioState(false);
    }
  }

  function setAudioState(isPlaying) {
    _audioPlaying = isPlaying;
    const pill = document.getElementById('bundleFloatingAudioPill');
    const toggleBtn = document.getElementById('bundleAudioPillToggleBtn');
    if (!pill) return;
    if (isPlaying) {
      pill.classList.add('playing');
      if (toggleBtn) toggleBtn.textContent = '⏸️';
    } else {
      pill.classList.remove('playing');
      if (toggleBtn) toggleBtn.textContent = '▶️';
    }
  }

  window.toggleBundleAudio = function () {
    if (_audioPlaying) {
      if (_bundleAudio && !_bundleAudio.paused) {
        _bundleAudio.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setAudioState(false);
    } else {
      playNarration(currentBundle);
    }
  };

  let _audioAutoShrinkTimer = null;

  function scheduleAudioPillAutoShrink(delayMs = 4000) {
    if (_audioAutoShrinkTimer) clearTimeout(_audioAutoShrinkTimer);
    _audioAutoShrinkTimer = setTimeout(() => {
      compressAudioPill();
    }, delayMs);
  }

  function compressAudioPill() {
    const pill = document.getElementById('bundleFloatingAudioPill');
    if (pill && !pill.classList.contains('compressed')) {
      pill.classList.add('compressed');
      const cBtn = document.getElementById('bundleAudioCompressBtn');
      if (cBtn) cBtn.textContent = '🗖';
    }
  }

  function expandAudioPill() {
    const pill = document.getElementById('bundleFloatingAudioPill');
    if (pill) {
      pill.classList.remove('compressed');
      const cBtn = document.getElementById('bundleAudioCompressBtn');
      if (cBtn) cBtn.textContent = '🗕';
      scheduleAudioPillAutoShrink(4000);
    }
  }

  window.closeBundleAudioPill = function () {
    if (_bundleAudio) {
      _bundleAudio.pause();
      _bundleAudio.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAudioState(false);
    if (_audioAutoShrinkTimer) clearTimeout(_audioAutoShrinkTimer);
    const pill = document.getElementById('bundleFloatingAudioPill');
    if (pill) {
      pill.style.display = 'none';
      try { sessionStorage.setItem('AIM_BUNDLE_AUDIO_CLOSED', 'true'); } catch (_) { }
    }
  };
  window.stopBundleAudio = window.closeBundleAudioPill;

  window.toggleCompressAudioPill = function () {
    const pill = document.getElementById('bundleFloatingAudioPill');
    if (!pill) return;
    if (pill.classList.contains('compressed')) {
      expandAudioPill();
    } else {
      compressAudioPill();
    }
  };

  window.onAudioPillClick = function (e) {
    const pill = document.getElementById('bundleFloatingAudioPill');
    if (pill && pill.classList.contains('compressed')) {
      expandAudioPill();
      return;
    }
    window.toggleBundleAudio();
  };

  // --- 15. SECTION CONTROLS (ON/OFF VISIBILITY & DYNAMIC REORDERING) ---
  function applySectionControls(bundle) {
    if (!bundle) return;

    // 1. Visibility Check
    const vis = bundle.sectionVisibility || {};
    Object.keys(vis).forEach(secId => {
      const el = document.getElementById(secId);
      if (el) {
        if (vis[secId] === false) {
          el.style.setProperty('display', 'none', 'important');
        } else {
          el.style.removeProperty('display');
        }
      }
    });

    // 2. Section Reordering
    if (Array.isArray(bundle.sectionOrder) && bundle.sectionOrder.length > 0) {
      const headerEl = document.getElementById('header') || document.querySelector('header');
      const footerEl = document.querySelector('footer.site-footer') || document.querySelector('footer');
      if (footerEl && footerEl.parentNode) {
        bundle.sectionOrder.forEach(secId => {
          const secEl = document.getElementById(secId);
          if (!secEl) return;
          if (secId === 'sec-top-ribbon' && headerEl && headerEl.parentNode) {
            headerEl.parentNode.insertBefore(secEl, headerEl);
          } else if (secEl !== footerEl && secEl.parentNode === footerEl.parentNode) {
            footerEl.parentNode.insertBefore(secEl, footerEl);
          }
        });
      }
    }
  }

  // --- 16. COUNTDOWN TIMER ENGINE ---
  function setupCountdownTimer(bundle) {
    const ribbon = document.getElementById('sec-top-ribbon');
    const timerBadge = document.getElementById('ribbonBadge');
    const timerEl = document.getElementById('bundleCountdown');
    const clockMin = document.getElementById('ubl-clock-minutes');
    const clockSec = document.getElementById('ubl-clock-seconds');

    if (bundle && bundle.timerConfig) {
      if (bundle.timerConfig.enabled === false && ribbon) {
        ribbon.style.display = 'none';
        return;
      }
      if (timerBadge && bundle.timerConfig.badgeText) {
        timerBadge.textContent = bundle.timerConfig.badgeText;
      }
    }

    let durationMinutes = (bundle?.timerConfig?.durationMinutes) || 15;
    let seconds = durationMinutes * 60;
    setInterval(() => {
      if (seconds <= 0) {
        seconds = durationMinutes * 60;
      }
      seconds--;
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `00:${m}:${s}`;
      if (clockMin) clockMin.textContent = m;
      if (clockSec) clockSec.textContent = s;
    }, 1000);
  }

  // --- 17. MULTI-BOOK CHECKOUT INITIATION ---
  window.initiateBundleCheckout = function () {
    if (!currentBundle) return;
    const finalPrice = currentBundle.offerPrice || 199;
    const bookParams = (currentBundle.bookIds || []).join(',');

    // Track Facebook Pixel InitiateCheckout
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout', {
        content_name: currentBundle.title,
        content_ids: currentBundle.bookIds,
        value: finalPrice,
        currency: 'INR'
      });
    }

    // Close Baby browser if open
    window.closeBabyBrowser();

    // Redirect to checkout with multi-book bundle parameter
    window.location.href = `/ebooks/checkout.html?bundle=${encodeURIComponent(currentBundle.id)}&books=${encodeURIComponent(bookParams)}&price=${finalPrice}&title=${encodeURIComponent(currentBundle.title)}`;
  };

  // --- 18. OFFICIAL UNIVERSAL SHARE INTEGRATION ---
  window.handleUniversalBookShare = function (event) {
    if (event) {
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }
    if (!currentBundle) return;

    let userShareId = 'AI000004';
    try {
      const userObj = JSON.parse(localStorage.getItem('AI_USER') || '{}');
      if (userObj && (userObj.share_id || userObj.ref_code || userObj.phone)) {
        userShareId = userObj.share_id || userObj.ref_code || userObj.phone;
      }
    } catch (_) { }

    const origin = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://aarogyamindia.online';
    const shareUrl = `${origin}/bundle.html?id=${encodeURIComponent(currentBundle.id)}&share_id=${encodeURIComponent(userShareId)}`;

    let shareText = (currentBundle.whatsappShareText || '').replace('{LINK}', shareUrl);
    if (!shareText) {
      shareText = `🌾 *AAROGYAM INDIA — ${currentBundle.title}* 📚\n━━━━━━━━━━━━━━━━━━━━\n${currentBundle.subtitle}\n💰 कॉम्बो ऑफर: मात्र *₹${currentBundle.offerPrice || 199}*!\n\n👇 *सम्पूर्ण बंडल अभी यहाँ से अनलॉक करें:*\n${shareUrl}`;
    }

    if (typeof window.openUniversalShareModal === 'function') {
      window.openUniversalShareModal({
        title: currentBundle.title,
        url: shareUrl,
        text: shareText
      });
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: currentBundle.title,
        text: shareText
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  // --- 19. HELPERS & BINDINGS ---
  function bindActionButtons() {
    const buyButtons = ['hero-buy-btn', 'bundleCalcBuyBtn', 'final-buy-btn', 'sticky-buy-btn'];
    buyButtons.forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.onclick = () => window.initiateBundleCheckout();
      }
    });
  }

  function getResolvedBundleBooks(bundle) {
    return (bundle.bookIds || []).map(bId => {
      const b = allCatalogBooks.find(item => (item.id || '').toUpperCase() === String(bId).toUpperCase());
      const lp = allLandingPages.find(item => (item.id || '').toUpperCase() === String(bId).toUpperCase());

      const mrp = lp?.hero?.mrp || b?.mrp || 299;
      const regularOffer = lp?.hero?.offer_price || b?.offerPrice || 99;

      const customConfig = bundle.bookCustomDetails && (bundle.bookCustomDetails[bId] || bundle.bookCustomDetails[String(bId).toUpperCase()]);

      let desc = customConfig?.shortDesc || customConfig?.desc || customConfig?.subtitle || lp?.hero?.description || b?.description || b?.shortDesc || '';
      if (!desc && lp?.meta?.description) desc = lp.meta.description;
      if (!desc) {
        desc = `फसलों के सम्पूर्ण कीट, रोग नियंत्रण, खाद-उर्वरक प्रबंधन व पैदावार बढ़ाने की व्यावहारिक वैज्ञानिक जानकारी।`;
      }

      // ONLY include keyPoints if admin specifically configured them (no [object Object] fallback)
      let keyPoints = [];
      if (customConfig && Array.isArray(customConfig.keyPoints) && customConfig.keyPoints.length > 0) {
        keyPoints = customConfig.keyPoints
          .map(p => typeof p === 'string' ? p.trim() : (p.text || p.title || ''))
          .filter(Boolean);
      }

      const rawCover = lp?.hero?.cover_image || b?.cover || b?.thumbnail || `/images/books/${bId.toLowerCase()}-cover.webp`;
      const updateTime = lp?.updated_at || b?.updated_at || bundle.updated_at || '';
      const versionedCover = versionBookImg(rawCover, updateTime);

      return {
        id: bId,
        title: lp?.hero?.title || b?.heading || b?.name || b?.title || bId,
        cover: versionedCover,
        mrp: mrp,
        regularOffer: regularOffer,
        totalPages: b?.totalPages || 120,
        desc: desc,
        keyPoints: keyPoints
      };
    });
  }

  function versionBookImg(url, timestamp) {
    if (!url || typeof url !== 'string') return url || '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    const ver = timestamp ? new Date(timestamp).getTime() : Math.floor(Date.now() / 30000);
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}t=${ver}`;
  }

  function renderBundleNotFound() {
    document.body.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#0f172a;font-family:sans-serif;">
        <div style="font-size:48px;margin-bottom:12px;">🔍</div>
        <h2>कॉम्बो बंडल उपलब्ध नहीं है।</h2>
        <p style="color:#64748b;margin:12px 0 24px;">कृपया लिंक पुनः जांचें या हमारी ई-बुक लाइब्रेरी देखें।</p>
        <a href="/index.html" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:800;display:inline-block;">होमपेज पर जाएं</a>
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

})();
