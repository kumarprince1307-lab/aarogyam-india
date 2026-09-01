/* ==========================================================
   AAROGYAM INDIA — UNIVERSAL DYNAMIC BOOK LANDING PAGE JS (PRO V25.0)
   Full Dynamic Engine for ebooks/book-landing.html
   ========================================================== */

(function (window) {
  'use strict';

  let currentBookId = 'BK001';
  let allBooks = [];
  let allLandingPages = [];
  let currentBookData = null;
  let currentLandingData = null;
  let currentZoom = 1;
  let timerInterval = null;

  // Universal Smart Book Sharing Handler (Available globally)
  window.handleUniversalBookShare = function(e) {
    if (e) {
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      if (typeof e.preventDefault === 'function') e.preventDefault();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const bId = (currentBookData?.id || currentBookId || urlParams.get('id') || 'BK001').toUpperCase();
    const l = currentLandingData || {};
    const hero = l.hero || {};
    const b = currentBookData || {};
    const title = l.og_title || hero.title || b.heading || b.name || document.title || 'Aarogyam India eBook';

    // 1. Resolve User Share / Affiliate ID
    let userShareId = 'AI000004';
    try {
      const userObj = JSON.parse(localStorage.getItem('AI_USER') || '{}');
      if (userObj && (userObj.share_id || userObj.ref_code || userObj.phone)) {
        userShareId = userObj.share_id || userObj.ref_code || userObj.phone;
      }
    } catch (err) {}

    // 2. Resolve Smart Serverless Share URL
    const origin = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://aarogyamindia.online';
    const shareUrl = `${origin}/api/share?id=${encodeURIComponent(bId)}&share_id=${encodeURIComponent(userShareId)}`;

    // 3. Resolve Custom Promo Text
    const customPromo = (l.whatsapp_share_message || l.whatsapp_share_text || '').trim();
    const promoText = customPromo 
      ? `${customPromo}\n\n👉 अभी पुस्तक देखें और ऑर्डर करें:\n${shareUrl}`
      : `🌾 *${title}*\n${hero.subtitle || hero.description || 'सम्पूर्ण वैज्ञानिक एवं Practical समाधान।'}\n\n👉 विशेष छूट पर अभी देखें:\n${shareUrl}`;

    // 4. Mobile WhatsApp / WebShare Trigger
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (navigator.share && isMobile) {
      navigator.share({
        title: title,
        text: promoText,
        url: shareUrl
      }).catch(() => {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(promoText)}`;
        window.location.href = waUrl;
      });
      return;
    }

    const waUrl = isMobile 
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(promoText)}` 
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(promoText)}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(promoText).catch(() => {});
    }

    const win = window.open(waUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = waUrl;
    }
  };

  async function init() {
    extractQueryParameters();
    await loadBookAndLandingData();
    applyThemeColors();
    applyDynamicSectionOrdering();
    renderAllSections();
    renderKpiHighlights();
    renderCountdownTimer();
    renderMultiVideos();
    renderPinchZoomLightbox();
    renderSuggestedBooksSection();
    renderCustomCustomerReviews();
    renderVipPerkSection();
    renderCustomStickyBar();
    renderDynamicOpenGraph();
    bindInteractiveEvents();
  }

  function extractQueryParameters() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') || params.get('book') || params.get('book_id');
    const slugParam = params.get('slug');

    if (idParam) {
      currentBookId = idParam.trim().toUpperCase();
    } else if (slugParam) {
      currentBookId = slugParam.trim().toLowerCase();
    }
  }

  async function loadBookAndLandingData() {
    // 1. Fetch data/books.json
    try {
      const res = await fetch('/data/books.json?v=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        allBooks = json.books || [];
      }
    } catch (e) {}

    // Check custom books in localStorage
    try {
      const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      if (Array.isArray(customBooks)) {
        customBooks.forEach(cb => {
          if (!cb || !cb.id) return;
          const idx = allBooks.findIndex(x => x.id && x.id.toUpperCase() === cb.id.toUpperCase());
          if (idx >= 0) allBooks[idx] = cb;
          else allBooks.unshift(cb);
        });
      }
    } catch (e) {}

    // 2. Fetch data/universal-book-landing-pages.json
    try {
      const res = await fetch('/data/universal-book-landing-pages.json?v=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        allLandingPages = json.bookLandingPages || [];
      }
    } catch (e) {}

    // 3. Scan LocalStorage for latest Admin Edits (ALWAYS OVERRIDE STATIC JSON)
    try {
      const stored = localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES');
      if (stored) {
        const localList = JSON.parse(stored);
        if (Array.isArray(localList)) {
          localList.forEach(item => {
            if (!item || !item.id) return;
            const itemIdUpper = item.id.trim().toUpperCase();
            const itemSlugLower = (item.slug || '').trim().toLowerCase();
            const idx = allLandingPages.findIndex(x => 
              (x.id && x.id.trim().toUpperCase() === itemIdUpper) || 
              (x.slug && itemSlugLower && x.slug.trim().toLowerCase() === itemSlugLower)
            );
            if (idx >= 0) {
              allLandingPages[idx] = item; // Override with latest admin edit
            } else {
              allLandingPages.unshift(item);
            }
          });
        }
      }
    } catch (e) {}

    // 4. Resolve Landing Page Data FIRST (by query key / slug)
    const qKey = (currentBookId || 'BK001').trim().toUpperCase();
    const qSlug = (currentBookId || 'BK001').trim().toLowerCase();

    currentLandingData = allLandingPages.find(p => 
      (p.id && p.id.trim().toUpperCase() === qKey) || 
      (p.slug && p.slug.trim().toLowerCase() === qSlug)
    );

    if (!currentLandingData) {
      const bookInLib = allBooks.find(b => 
        (b.id && b.id.trim().toUpperCase() === qKey) ||
        (b.slug && b.slug.trim().toLowerCase() === qSlug)
      );
      if (bookInLib) {
        currentLandingData = {
          id: bookInLib.id,
          slug: bookInLib.slug || bookInLib.id.toLowerCase(),
          category: bookInLib.category || 'Agriculture',
          status: bookInLib.status || 'active',
          theme_primary: '#2E7D32',
          theme_dark: '#1B5E20',
          cover_effect: '3d_float',
          hero: {
            tag: '🌾 Agriculture Practical Guide',
            title: bookInLib.heading || bookInLib.name || 'ई-बुक प्रैक्टिकल गाइड',
            subtitle: bookInLib.subtitle || '',
            description: bookInLib.description || 'सम्पूर्ण प्रैक्टिकल जानकारी।',
            mrp: bookInLib.mrp || 299,
            offer_price: bookInLib.offerPrice || 99,
            offer_badge: 'Launch Offer',
            rating_score: '4.9',
            rating_count: '120+ Ratings',
            cover_image: bookInLib.cover || bookInLib.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
            banner_image: bookInLib.banner || '/images/banners/kharif-master-guide-2026-hero-banner.webp',
            features: [
              { icon: 'fa-seedling', text: `${bookInLib.totalPages || 120}+ रंगीन पेज` },
              { icon: 'fa-camera', text: '300+ फोटो' },
              { icon: 'fa-flask', text: 'स्प्रे साइंस' },
              { icon: 'fa-gift', text: 'Free Bonus' }
            ]
          }
        };
      } else if (currentBookId && qKey !== 'BK001') {
        // Stop silent fallback to BK001 - Show proper Not Found state
        renderBookNotFound(currentBookId);
        return;
      } else {
        currentLandingData = allLandingPages[0] || {};
      }
    }

    const landingId = (currentLandingData.id || qKey).trim().toUpperCase();
    const landingSlug = (currentLandingData.slug || qSlug).trim().toLowerCase();

    // 5. Resolve Book Data from allBooks OR synthesize directly from landing page
    const matchedBook = allBooks.find(b => 
      (b.id && b.id.trim().toUpperCase() === landingId) || 
      (b.slug && b.slug.trim().toLowerCase() === landingSlug) ||
      (b.id && b.id.trim().toUpperCase() === qKey)
    );

    if (matchedBook) {
      currentBookData = matchedBook;
    } else {
      // Auto-synthesize new book object from landing data so it never falls back to BK001
      const hero = currentLandingData.hero || {};
      currentBookData = {
        id: landingId,
        slug: landingSlug,
        heading: hero.title || 'ई-बुक प्रैक्टिकल गाइड',
        name: hero.title || 'ई-बुक प्रैक्टिकल गाइड',
        category: currentLandingData.category || 'Agriculture',
        language: 'Hindi',
        author: 'Aarogyam India',
        version: '2026',
        mrp: hero.mrp || 299,
        offerPrice: hero.offer_price || 99,
        cover: hero.cover_image || '/images/books/kharif-master-guide-2026-cover.webp',
        thumbnail: hero.cover_image || '/images/books/kharif-master-guide-2026-cover.webp',
        banner: hero.banner_image || '/images/banners/kharif-master-guide-2026-hero-banner.webp',
        totalPages: 120,
        status: currentLandingData.status || 'active'
      };
    }
  }

  function applyThemeColors() {
    const l = currentLandingData || {};
    const primary = l.theme_primary || '#2E7D32';
    const dark = l.theme_dark || '#1B5E20';
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-dark', dark);
    
    const metaTheme = document.getElementById('page-theme-color-meta');
    if (metaTheme) metaTheme.setAttribute('content', primary);
  }

  // ==========================================================
  // DYNAMIC SECTION REORDERING ENGINE
  // ==========================================================
  function applyDynamicSectionOrdering() {
    const container = document.getElementById('landing-sections-container');
    if (!container) return;

    const l = currentLandingData || {};
    const defaultOrder = [
      'sec_hero',
      'sec_timer',
      'sec_kpis',
      'sec_trust',
      'sec_why_buy',
      'sec_vip_stack',
      'sec_video',
      'sec_preview',
      'sec_suggested',
      'sec_bonuses',
      'sec_ai_support',
      'sec_specs_toc',
      'sec_reviews',
      'sec_faqs',
      'sec_final_buy',
      'sec_help'
    ];

    const rawOrder = (l.sections_order && Array.isArray(l.sections_order) && l.sections_order.length > 0) ? 
      l.sections_order : defaultOrder;

    let finalOrder = [...rawOrder];
    if (!finalOrder.includes('sec_ai_support')) {
      const bonusIdx = finalOrder.indexOf('sec_bonuses');
      if (bonusIdx >= 0) {
        finalOrder.splice(bonusIdx + 1, 0, 'sec_ai_support');
      } else {
        finalOrder.push('sec_ai_support');
      }
    }

    const sectionIdMap = {
      'sec_hero': 'sec-hero',
      'sec_timer': 'sec-offer-timer',
      'sec_kpis': 'sec-kpis-highlights',
      'sec_trust': 'sec-trust-bar',
      'sec_why_buy': 'sec-why-book',
      'sec_vip_stack': 'sec-vip-stack',
      'sec_video': 'sec-book-video',
      'sec_preview': 'sec-sample-book',
      'sec_suggested': 'sec-suggested-books',
      'sec_bonuses': 'sec-bonus-wrapper',
      'sec_ai_support': 'sec-ai-support',
      'sec_specs_toc': 'sec-book-details',
      'sec_reviews': 'sec-customer-reviews',
      'sec_faqs': 'sec-faq-section',
      'sec_final_buy': 'sec-final-buy',
      'sec_help': 'sec-help-support'
    };

    finalOrder.forEach(secKey => {
      const elId = sectionIdMap[secKey] || secKey;
      const el = document.getElementById(elId);
      if (el && el.parentElement === container) {
        container.appendChild(el);
      }
    });

    // Check hidden sections
    if (l.hidden_sections && Array.isArray(l.hidden_sections)) {
      l.hidden_sections.forEach(secKey => {
        const elId = sectionIdMap[secKey] || secKey;
        const el = document.getElementById(elId);
        if (el) el.style.display = 'none';
      });
    }
  }

  function renderAllSections() {
    const b = currentBookData || {};
    const l = currentLandingData || {};
    const hero = l.hero || {};

    // Dynamic Theme Color Application
    if (l.theme_primary) {
      document.documentElement.style.setProperty('--primary', l.theme_primary);
      document.documentElement.style.setProperty('--primary-dark', l.theme_dark || l.theme_primary);
      const metaTheme = document.getElementById('page-theme-color-meta');
      if (metaTheme) metaTheme.setAttribute('content', l.theme_primary);
    }

    const title = hero.title || b.heading || b.name || 'Aarogyam India eBook';
    const subtitle = hero.subtitle || 'सम्पूर्ण Practical Guide';
    const desc = hero.description || b.description || 'बीज उपचार से लेकर कटाई तक सम्पूर्ण जानकारी।';
    const mrp = hero.mrp || b.mrp || 299;
    const offer = hero.offer_price || b.offerPrice || 99;
    const badge = hero.offer_badge || 'Launch Offer';
    const cover = hero.cover_image || b.cover || b.thumbnail || '../images/books/kharif-master-guide-2026-cover.webp';
    const banner = hero.banner_image || b.banner || '../images/banners/kharif-master-guide-2026-hero-banner.webp';
    const ratingScore = hero.rating_score || '4.9';
    const ratingCount = hero.rating_count || '120+ Ratings';

    // 1. SEO & Document Title
    document.title = `${title} | Aarogyam India`;
    const titleEl = document.getElementById('page-seo-title');
    if (titleEl) titleEl.textContent = `${title} | Aarogyam India`;
    const descEl = document.getElementById('page-seo-desc');
    if (descEl) descEl.setAttribute('content', desc);

    // 2. Hero Section
    setElemText('hero-tag', hero.tag || '🌾 Bestseller Agriculture eBook');
    setElemText('hero-title', title);
    setElemText('hero-subtitle', subtitle);
    setElemText('hero-rating-text', `${ratingScore} (${ratingCount})`);
    setElemText('hero-desc', desc);
    setElemText('hero-old-price', `₹${mrp}`);
    setElemText('hero-new-price', `₹${offer}`);
    setElemText('hero-offer-badge', badge);

    const coverImg = document.getElementById('hero-book-cover');
    if (coverImg) {
      coverImg.src = cover;
      if (l.cover_effect === 'static') {
        coverImg.classList.add('static-cover');
      } else {
        coverImg.classList.remove('static-cover');
      }
    }
    setElemSrc('hero-banner-img', banner);

    // Universal Section Banners Injection (Only shows if banner is present)
    const sb = l.section_banners || {};
    renderSectionBanner('sec-hero', sb.sec_hero);
    renderSectionBanner('sec-offer-timer', sb.sec_timer || l.timer?.banner_image);
    renderSectionBanner('sec-kpis-highlights', sb.sec_kpis || l.kpis_banner);
    renderSectionBanner('sec-trust-bar', sb.sec_trust || l.trust_banner);
    renderSectionBanner('sec-why-book', sb.sec_why_buy || l.why_read?.banner_image);
    renderSectionBanner('sec-vip-stack', sb.sec_vip_stack || l.value_stack?.vip_banner);
    renderSectionBanner('sec-book-video', sb.sec_video || l.video_section_banner);
    renderSectionBanner('sec-sample-book', sb.sec_preview || l.preview_banner);
    renderSectionBanner('sec-suggested-books', sb.sec_suggested || l.suggested_banner);
    renderSectionBanner('sec-bonus-wrapper', sb.sec_bonuses || l.bonuses_banner);
    renderSectionBanner('sec-book-details', sb.sec_specs_toc || l.specs_banner);
    renderSectionBanner('sec-customer-reviews', sb.sec_reviews || l.reviews_banner);
    renderSectionBanner('sec-faq-section', sb.sec_faqs || l.faqs_banner);
    renderSectionBanner('sec-final-buy', sb.sec_final_buy || l.final_buy_banner);
    renderSectionBanner('sec-help-support', sb.sec_help || l.help_banner);

    // Hero Features / Badges inside hero
    const featWrap = document.getElementById('hero-features-wrap');
    if (featWrap) {
      const feats = (hero.features && hero.features.length > 0) ? hero.features : [
        { icon: 'fa-seedling', text: `${b.totalPages || 120}+ रंगीन पेज` },
        { icon: 'fa-camera', text: '300+ फोटो' },
        { icon: 'fa-circle-check', text: 'Scientific Guide' },
        { icon: 'fa-gift', text: 'Free Bonus PDF' }
      ];
      featWrap.innerHTML = feats.map(f => {
        let fIconHtml = '<i class="fa-solid fa-check"></i>';
        if (f.icon) {
          if (f.icon.startsWith('fa-') || f.icon.startsWith('fa ')) {
            fIconHtml = `<i class="fa-solid ${f.icon}"></i>`;
          } else {
            fIconHtml = `<span style="font-size:1.15rem;line-height:1;">${escapeHtml(f.icon)}</span>`;
          }
        }
        return `
          <div class="hero-feature">
            ${fIconHtml}
            <span>${escapeHtml(f.text)}</span>
          </div>
        `;
      }).join('');
    }

    // 3. Header, Checkout Button URLs, Share & Sticky Sync
    const checkoutUrl = `checkout.html?id=${encodeURIComponent(b.id || currentBookId)}`;
    const buyBtns = ['hero-buy-btn', 'preview-buy-btn', 'final-buy-btn', 'vip-stack-unlock-btn', 'sticky-buy-btn'];
    buyBtns.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.href = checkoutUrl;
    });

    setElemText('header-book-title', title);
    setElemText('sticky-book-title', title);
    setElemText('sticky-price-val', `₹${offer}`);
    setElemText('sticky-mrp-val', `₹${mrp}`);
    setElemSrc('sticky-thumb-img', cover);

    // Update Book Share Data for Universal Share Engine
    const shareDataEl = document.getElementById('book-share-data');
    if (shareDataEl) {
      shareDataEl.dataset.id = b.id || currentBookId;
      shareDataEl.dataset.title = title;
      shareDataEl.dataset.description = desc;
      shareDataEl.dataset.price = `₹${offer}`;
      shareDataEl.dataset.mrp = `₹${mrp}`;
      shareDataEl.dataset.url = window.location.href;
      shareDataEl.dataset.image = cover;
    }

    // Attach asset ID to all share buttons
    document.querySelectorAll('[data-share-button="true"]').forEach(btn => {
      btn.dataset.assetId = b.id || currentBookId;
      btn.dataset.assetType = 'book';
    });

    updateCartCountBadge();
    injectTrackingPixels();

    // 4. WhatsApp Links with Rich Book Details
    const waPrompt = l.whatsapp_prompt || `🌾 नमस्ते Aarogyam India,\nमुझे '${title}' (मूल्य: ₹${offer}) ई-बुक के बारे में जानकारी चाहिए और इसे ऑर्डर करना है।\nलिंक: ${window.location.href}`;
    const waUrl = `https://wa.me/917974422572?text=${encodeURIComponent(waPrompt)}`;
    
    const waHelpLink = document.getElementById('wa-help-link');
    if (waHelpLink) waHelpLink.href = waUrl;
    const stickyHelpBtn = document.getElementById('sticky-help-btn');
    if (stickyHelpBtn) stickyHelpBtn.href = waUrl;

    // 5. Why Buy Section (Icon & Emoji rendering safety)
    const why = l.why_read;
    const defaultWhyCards = [
      { icon: '🌱', title: 'वैज्ञानिक जानकारी', desc: 'कृषि वैज्ञानिकों द्वारा तैयार 100% प्रमाणित एवं Practical जानकारी।' },
      { icon: '📷', title: '300+ वास्तविक फोटो', desc: 'रोग, कीट एवं पोषक तत्वों की वास्तविक पहचान करना बेहद आसान।' },
      { icon: '📘', title: 'Step by Step Guide', desc: 'बीज उपचार, खाद शेड्यूल और स्प्रे फॉर्मूला की सम्पूर्ण जानकारी।' },
      { icon: '🎁', title: 'Free Bonus Gift', desc: 'इस पुस्तक के साथ विशेष बोनस सामग्री और WhatsApp सपोर्ट मुफ्त।' }
    ];
    if (why) {
      if (why.title) setElemText('why-title', why.title);
      if (why.subtitle || why.desc) setElemText('why-desc', why.subtitle || why.desc);
      const whyGrid = document.getElementById('why-cards-grid');
      const cards = (why.cards && why.cards.length > 0) ? why.cards : defaultWhyCards;
      if (whyGrid) {
        whyGrid.innerHTML = cards.map(c => {
          let iconHtml = '🌱';
          if (c.icon) {
            if (c.icon.startsWith('fa-') || c.icon.startsWith('fa ')) {
              iconHtml = `<i class="fa-solid ${c.icon}"></i>`;
            } else {
              iconHtml = `<span style="font-size:2.2rem;line-height:1;">${escapeHtml(c.icon)}</span>`;
            }
          }
          return `
            <div class="why-card">
              <div class="why-icon">${iconHtml}</div>
              <h3>${escapeHtml(c.title)}</h3>
              <p>${escapeHtml(c.desc)}</p>
            </div>
          `;
        }).join('');
      }
    }

    // 6. Preview Gallery (Pinch-to-Zoom)
    const previewSection = document.getElementById('sec-sample-book');
    const galleryGrid = document.getElementById('preview-gallery-grid');
    const demoImages = (l.demo_images && Array.isArray(l.demo_images) && l.demo_images.length > 0) ? l.demo_images : (b.demoImages && Array.isArray(b.demoImages) && b.demoImages.length > 0 ? b.demoImages : []);
    
    if (galleryGrid) {
      if (demoImages.length > 0) {
        galleryGrid.innerHTML = demoImages.map((imgUrl, i) => `
          <div class="preview-card" onclick="window.openPinchZoomLightbox('${imgUrl}')">
            <img src="${imgUrl}" alt="Preview Page ${i + 1}" loading="lazy" style="cursor:zoom-in;">
          </div>
        `).join('');
      } else {
        galleryGrid.innerHTML = '';
      }
    }

    const prevBannerWrap = document.getElementById('preview-banner-wrap');
    const prevBannerImg = document.getElementById('preview-banner-img');
    if (prevBannerWrap && prevBannerImg) {
      if (l.preview_banner && l.preview_banner.trim()) {
        prevBannerImg.src = l.preview_banner.trim();
        prevBannerWrap.style.display = 'block';
        prevBannerImg.onclick = () => window.openPinchZoomLightbox(prevBannerImg.src);
      } else {
        prevBannerWrap.style.display = 'none';
      }
    }

    if (previewSection && demoImages.length === 0 && (!l.preview_banner || !l.preview_banner.trim())) {
      previewSection.style.display = 'none';
    }

    // 7. Separate AI Support Section
    const aiSupportSec = document.getElementById('sec-ai-support');
    if (aiSupportSec) {
      aiSupportSec.style.display = 'block';
      const aiTitle = l.ai_support_title || '🌾 FREE AI WHATSAPP SUPPORT & SPRAY FORMULA 🎁';
      const aiDesc = l.ai_support_desc || 'किताब पढ़ते समय अगर कोई बात समझ न आए, पोषक तत्वों की पहचान, महत्वपूर्ण टिप्स या फसल की समस्या हो, तो परेशान होने की जरूरत नहीं। बस WhatsApp Help बटन पर क्लिक करें और अपनी समस्या बताएं।';
      const aiCover = l.ai_support_cover || '/images/books/kharif-fasal-hero-2.webp';

      setElemSrc('ai-support-cover-img', aiCover);
      setElemText('ai-support-title', aiTitle);
      setElemText('ai-support-desc', aiDesc);

      const aiListEl = document.getElementById('ai-support-list-items');
      if (aiListEl) {
        const points = (l.bonus_points && l.bonus_points.length > 0) ? l.bonus_points : [
          '24×7 WhatsApp Priority Support',
          '💬 आपका सवाल → हमारी मदद → आसान समाधान',
          '📖 किताब की जानकारी समझने में सहायता',
          '🌱 फसल संबंधी विशेष स्प्रे फॉर्मूला',
          '📱 Mobile Friendly PDF & Lifetime Access'
        ];
        aiListEl.innerHTML = points.map(pt => `<li>✅ ${escapeHtml(pt)}</li>`).join('');
      }
    }

    // 8. Separate Free Bonus Books & Extra Gifts Grid
    const bonusWrapper = document.getElementById('sec-bonus-wrapper');
    const freeBooksGrid = document.getElementById('free-books-grid');
    if (bonusWrapper && freeBooksGrid) {
      const defaultBonuses = [
        {
          title: 'खरीफ फसल सुरक्षा व सम्पूर्ण स्प्रे गाइड 2026',
          description: 'रोग, कीट, खरपतवार और पोषण प्रबंधन का वैज्ञानिक स्प्रे चार्ट।',
          mrp: 199,
          image: '/images/books/kharif-master-guide-2026-cover.webp',
          features: ['120+ रंगीन पेज', '300+ फोटो', 'स्प्रे साइंस चार्ट', 'Mobile PDF']
        },
        {
          title: 'खेती डॉक्टर पॉकेट गाइड (Quick Diagnosis)',
          description: 'पौधों के पत्तों व जड़ों के रोगों की तुरंत पहचान और जैविक/रासायनिक उपचार।',
          mrp: 299,
          image: '/images/books/fasal-ka-doctor-cover.webp',
          features: ['Instant Diagnosis', '100% Practical', 'विशेषज्ञ समाधान']
        }
      ];

      const rawBonuses = (l.bonuses && l.bonuses.length > 0) ? l.bonuses : ((l.bonus_books && l.bonus_books.length > 0) ? l.bonus_books : defaultBonuses);
      
      // Filter out pure text/support items so only actual bonus books & files are in this grid
      const bonusBooks = rawBonuses.filter(bn => bn && bn.title && !bn.title.toUpperCase().includes('WHATSAPP SUPPORT'));
      const renderList = bonusBooks.length > 0 ? bonusBooks : rawBonuses;

      bonusWrapper.style.display = 'block';
      freeBooksGrid.innerHTML = renderList.map(bn => {
        const bImg = bn.image || bn.cover || '/images/books/kharif-master-guide-2026-cover.webp';
        const bTitle = bn.title || 'विशेष बोनस ई-बुक';
        const bDesc = bn.description || 'इस मुख्य पुस्तक के साथ बिल्कुल फ्री लाइफटाइम एक्सेस।';
        const bMrp = bn.mrp || 199;
        
        // Parse individual KPI features for this free book
        let kpis = [];
        if (Array.isArray(bn.features) && bn.features.length > 0) {
          kpis = bn.features;
        } else if (typeof bn.features === 'string' && bn.features.trim()) {
          kpis = bn.features.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(bn.kpis) && bn.kpis.length > 0) {
          kpis = bn.kpis;
        } else {
          kpis = ['120+ रंगीन पेज', '300+ फोटो', 'Free Lifetime Access'];
        }

        return `
          <div class="free-book-card" style="background:#ffffff;border:2px solid #bbf7d0;border-radius:16px;padding:20px;box-shadow:0 10px 25px rgba(22,163,74,0.08);display:flex;flex-direction:column;justify-content:space-between;position:relative;transition:transform 0.3s ease;">
            <div style="position:absolute;top:12px;right:12px;background:#16a34a;color:#ffffff;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:20px;box-shadow:0 2px 6px rgba(22,163,74,0.3);">
              🎁 100% FREE
            </div>
            <div>
              <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:12px;">
                <img src="${bImg}" alt="${escapeHtml(bTitle)}" style="width:75px;height:105px;object-fit:cover;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);flex-shrink:0;">
                <div style="flex:1;">
                  <h4 style="margin:0 0 6px 0;font-size:1.05rem;font-weight:800;color:#065f46;line-height:1.3;">${escapeHtml(bTitle)}</h4>
                  <div style="font-size:0.82rem;margin-bottom:6px;">
                    <span style="color:#94a3b8;text-decoration:line-through;margin-right:6px;">मूल्य: ₹${bMrp}</span>
                    <span style="color:#16a34a;font-weight:800;background:#dcfce7;padding:2px 8px;border-radius:6px;">₹0 मुफ़्त</span>
                  </div>
                  <p style="margin:0;font-size:0.8rem;color:#475569;line-height:1.4;">${escapeHtml(bDesc)}</p>
                </div>
              </div>

              <!-- Individual KPI Features for this Free Book -->
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed #e2e8f0;">
                ${kpis.map(feat => `
                  <span style="background:#f0fdf4;border:1px solid #86efac;color:#15803d;font-size:0.75rem;font-weight:700;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;">
                    🌱 ${escapeHtml(feat)}
                  </span>
                `).join('')}
              </div>
            </div>

            <div style="margin-top:14px;padding-top:10px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:0.78rem;color:#64748b;font-weight:600;">📱 Mobile Friendly PDF</span>
              ${(bn.file_url || bn.pdf_url) ? `
                <a href="${bn.file_url || bn.pdf_url}" target="_blank" style="background:#16a34a;color:#fff;font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                  📥 डाउनलोड
                </a>
              ` : `
                <span style="color:#16a34a;font-weight:800;font-size:0.8rem;">लाइब्रेरी में शामिल 🎁</span>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    // 8. Book Specification & TOC
    setElemText('spec-name', title);
    setElemText('spec-lang', b.language || 'Hindi');
    setElemText('spec-pages', `${b.totalPages || 120}+ Pages`);
    setElemText('spec-images', '300+ Real Images');
    setElemText('spec-author', b.author || 'Aarogyam India');
    setElemText('spec-version', `${b.version || '2026'} Edition`);

    const tocList = document.getElementById('toc-list');
    const defaultToc = [
      'बीज उपचार एवं अंकुरण परीक्षण',
      'खेत की गहरी जुताई व तैयारी',
      'बुवाई की वैज्ञानिक विधि व समय',
      'संतुलित खाद एवं उर्वरक प्रबंधन',
      'खरपतवार नियंत्रण (Weed Control)',
      'मुख्य रोग एवं कीट प्रबंधन (IPM)',
      'सूक्ष्म पोषक तत्वों की कमी व पहचान',
      'फसलवार सम्पूर्ण स्प्रे चार्ट 2026',
      'फसल सुरक्षा व अधिक पैदावार के गुप्त उपाय',
      'कृषि विशेषज्ञों के विशेष सुझाव'
    ];
    const tocPoints = (l.table_of_contents && l.table_of_contents.length > 0) ? l.table_of_contents : defaultToc;
    if (tocList) {
      tocList.innerHTML = tocPoints.map(ch => `<li>✅ ${escapeHtml(ch)}</li>`).join('');
    }

    // 9. FAQs
    const faqWrap = document.getElementById('faq-list-wrapper');
    const defaultFaqs = [
      { q: 'यह पुस्तक किसके लिए है?', a: 'यह पुस्तक किसान, कृषि विद्यार्थी, कृषि सलाहकार और कृषि व्यवसाय से जुड़े लोगों के लिए अत्यंत उपयोगी है।' },
      { q: 'क्या यह Printed Book है?', a: 'नहीं, यह एक Digital PDF eBook है जिसे मोबाइल, टैबलेट और कंप्यूटर पर कभी भी तुरंत पढ़ा जा सकता है।' },
      { q: 'भुगतान के बाद पुस्तक कब मिलेगी?', a: 'सफल भुगतान के तुरंत बाद आपकी Library में पुस्तक उपलब्ध होगी और Instant Download का लिंक भी मिलेगा।' },
      { q: 'क्या मुझे किताब बार-बार डाउनलोड करनी पड़ेगी?', a: '❌ नहीं। एक बार खरीदने के बाद आप Lifetime Access के साथ Reader में सीधे मोबाइल पर पढ़ सकते हैं।' },
      { q: 'क्या बिना डाउनलोड किए भी किताब पढ़ सकता हूँ?', a: '✅ हाँ। Reader खोलिए और सीधे मोबाइल में पढ़ना शुरू कीजिए।' },
      { q: 'यदि कोई समस्या हो तो संपर्क कैसे करें?', a: 'आप हमारी 24×7 WhatsApp Support टीम से सीधे संपर्क कर सकते हैं।' }
    ];
    const faqs = (l.faqs && l.faqs.length > 0) ? l.faqs : defaultFaqs;
    if (faqWrap) {
      faqWrap.innerHTML = faqs.map(f => `
        <div class="faq-item">
          <h3>${escapeHtml(f.q)}</h3>
          <p>${escapeHtml(f.a)}</p>
        </div>
      `).join('');
    }

    // 10. Final Section
    setElemText('final-title', title);
    setElemText('final-old-price', `₹${mrp}`);
    setElemText('final-new-price', `₹${offer}`);
  }

  // ==========================================================
  // FEATURE HIGHLIGHTS / KPI BADGES BAR (KHETI DR. STYLE)
  // ==========================================================
  function renderKpiHighlights() {
    const grid = document.getElementById('kpis-badges-grid');
    if (!grid) return;

    const l = currentLandingData || {};
    const b = currentBookData || {};
    const hero = l.hero || {};

    const badges = (hero.features && hero.features.length > 0) ? hero.features : [
      { icon: 'fa-seedling', text: `${b.totalPages || 120} पेज की प्रीमियम गाइड` },
      { icon: 'fa-camera', text: '300+ वास्तविक रंगीन फोटो' },
      { icon: 'fa-flask', text: 'स्प्रे साइंस व सटीक फॉर्मूला' },
      { icon: 'fa-gift', text: 'फ्री बोनस PDF व WhatsApp हेल्प' }
    ];

    grid.innerHTML = badges.map(badge => {
      let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
      if (badge.icon) {
        if (badge.icon.startsWith('fa-') || badge.icon.startsWith('fa ')) {
          iconHtml = `<i class="fa-solid ${badge.icon}"></i>`;
        } else {
          iconHtml = `<span style="font-size:1.6rem;line-height:1;">${escapeHtml(badge.icon)}</span>`;
        }
      }
      return `
        <div class="ubl-kpi-badge-card">
          <div class="ubl-kpi-icon-wrap">
            ${iconHtml}
          </div>
          <div class="ubl-kpi-badge-text">
            ${escapeHtml(badge.text)}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================
  // OFFER COUNTDOWN TIMER
  // ==========================================================
  function renderCountdownTimer() {
    const section = document.getElementById('sec-offer-timer');
    const l = currentLandingData || {};
    const timerCfg = l.timer || {};

    if (!section) return;

    if (timerCfg.enabled === false) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    if (timerCfg.text) {
      setElemText('timer-message-text', timerCfg.text);
    }

    let minutes = timerCfg.minutes || 15;
    let seconds = 0;

    const minEl = document.getElementById('ubl-clock-minutes');
    const secEl = document.getElementById('ubl-clock-seconds');

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          minutes = 14;
          seconds = 59;
        } else {
          minutes--;
          seconds = 59;
        }
      } else {
        seconds--;
      }

      if (minEl) minEl.textContent = String(minutes).padStart(2, '0');
      if (secEl) secEl.textContent = String(seconds).padStart(2, '0');
    }, 1000);
  }

  // ==========================================================
  // MULTI-VIDEO ENGINE (AUTO-RESPONSIVE 16:9 & 9:16 SHORTS/REELS)
  // ==========================================================
  function renderMultiVideos() {
    const section = document.getElementById('sec-book-video');
    const grid = document.getElementById('video-grid-container');
    const l = currentLandingData || {};

    let videos = l.videos || [];
    if (videos.length === 0 && l.video && l.video.enabled && l.video.youtube_url) {
      videos = [{
        url: l.video.youtube_url,
        title: l.video.title || '🎥 पुस्तक वीडियो अवलोकन',
        ratio: (l.video.youtube_url.includes('shorts') || l.video.isShorts) ? '9:16' : '16:9',
        description: l.video.description || 'देखें इस पुस्तक के मुख्य अध्याय व लाइव गाइडेंस।'
      }];
    }

    if (!section || !grid) return;
    if (videos.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    // If single video, render dedicated centered player
    if (videos.length === 1) {
      const v = videos[0];
      const ytId = extractYouTubeId(v.url || v.youtube_url);
      const isVertical = (v.url?.includes('shorts') || v.ratio === '9:16' || v.format === '9:16' || v.isShorts);
      const playerClass = isVertical ? 'ubl-video-player-9-16' : 'ubl-video-player-16-9';

      grid.innerHTML = `
        <div style="grid-column: 1 / -1; width: 100%;">
          <div class="${playerClass}">
            <div class="video-inner">
              <iframe 
                src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1" 
                title="${escapeHtml(v.title || 'Video')}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
              </iframe>
            </div>
          </div>
          <div style="text-align: center; margin-top: 14px;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${escapeHtml(v.title || '🎥 वीडियो अवलोकन')}</h3>
            ${v.description ? `<p style="font-size: 0.88rem; color: #64748b; margin: 0;">${escapeHtml(v.description)}</p>` : ''}
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = videos.map(v => {
      const ytId = extractYouTubeId(v.url || v.youtube_url);
      if (!ytId) return '';
      const isVertical = (v.url?.includes('shorts') || v.ratio === '9:16' || v.format === '9:16' || v.isShorts);
      const frameClass = isVertical ? 'ubl-video-frame-wrap-9-16' : 'ubl-video-frame-wrap-16-9';

      return `
        <div class="ubl-video-card">
          <div class="${frameClass}">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1" 
              title="${escapeHtml(v.title || 'Video')}" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
          </div>
          <div class="ubl-video-card-info">
            <h4>${escapeHtml(v.title || '🎥 वीडियो अवलोकन')}</h4>
            ${v.description ? `<p>${escapeHtml(v.description)}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================
  // PINCH-TO-ZOOM INTERACTIVE LIGHTBOX
  // ==========================================================
  function renderPinchZoomLightbox() {
    const modal = document.getElementById('ubl-pinch-lightbox');
    const img = document.getElementById('ubl-pinch-img');
    const closeBtn = document.getElementById('ubl-lightbox-close');
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const zoomOutBtn = document.getElementById('btn-zoom-out');
    const zoomResetBtn = document.getElementById('btn-zoom-reset');
    const zoomText = document.getElementById('zoom-level-text');

    window.openPinchZoomLightbox = function (url) {
      if (!modal || !img) return;
      img.src = url;
      currentZoom = 1;
      applyZoom();
      modal.style.display = 'flex';
    };

    function applyZoom() {
      if (img) img.style.transform = `scale(${currentZoom})`;
      if (zoomText) zoomText.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    zoomInBtn?.addEventListener('click', () => {
      if (currentZoom < 3) { currentZoom += 0.25; applyZoom(); }
    });

    zoomOutBtn?.addEventListener('click', () => {
      if (currentZoom > 0.5) { currentZoom -= 0.25; applyZoom(); }
    });

    zoomResetBtn?.addEventListener('click', () => {
      currentZoom = 1;
      applyZoom();
    });

    closeBtn?.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Touch Pinch & Mouse Wheel
    img?.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0 && currentZoom < 3) currentZoom += 0.15;
      else if (e.deltaY > 0 && currentZoom > 0.5) currentZoom -= 0.15;
      applyZoom();
    }, { passive: false });
  }

  // ==========================================================
  // SUGGESTED BOOKS / FREQUENTLY BOUGHT TOGETHER (2-BOOK COMBO)
  // ==========================================================
  function renderSuggestedBooksSection() {
    const section = document.getElementById('sec-suggested-books');
    const grid = document.getElementById('suggested-books-grid');

    if (!section || !grid) return;

    const l = currentLandingData || {};
    let comboBooks = [];

    // 1. Include primary book first
    comboBooks.push({
      id: currentBookData.id || currentBookId || 'BK001',
      tag: '🌾 मुख्य पुस्तक',
      heading: currentLandingData.hero?.title || currentBookData.heading || currentBookData.name || 'मुख्य ई-बुक गाइड',
      cover: currentLandingData.hero?.cover_image || currentBookData.cover || '/images/books/kharif-master-guide-2026-cover.webp',
      offerPrice: parseInt(currentLandingData.hero?.offer_price || currentBookData.offerPrice || 99, 10),
      mrp: parseInt(currentLandingData.hero?.mrp || currentBookData.mrp || 299, 10),
      desc: currentBookData.totalPages ? `${currentBookData.totalPages}+ रंगीन पेज • सम्पूर्ण Practical Guide` : '150+ पेज • 40+ फसलें • रोग व खाद प्रबंधन'
    });

    // 2. Determine 2nd book in combo
    if (l.suggested_books_list && l.suggested_books_list.length > 0) {
      l.suggested_books_list.forEach(sb => {
        comboBooks.push({
          id: sb.link || sb.id || 'BK002',
          tag: '🏆 Bestseller Guide',
          heading: sb.title || 'संबंधित ई-बुक',
          cover: sb.image || '/images/books/fasal-ka-doctor-cover.webp',
          offerPrice: parseInt(sb.offerPrice || 99, 10),
          mrp: parseInt(sb.mrp || 299, 10),
          desc: '120+ रंगीन पेज • 300+ फोटो • स्प्रे साइंस'
        });
      });
    } else {
      // Pick alternative companion book from library
      const primaryId = (currentBookData.id || currentBookId || 'BK001').toUpperCase();
      const otherBook = allBooks.find(b => b.id && b.id.toUpperCase() !== primaryId && (b.status === 'active' || !b.status)) || {
        id: primaryId === 'BK002' ? 'BK001' : 'BK002',
        name: primaryId === 'BK002' ? 'खरीफ फसल मास्टर गाइड 2026' : 'खेती का डॉक्टर (Pocket Doctor)',
        heading: primaryId === 'BK002' ? 'खरीफ फसल मास्टर गाइड 2026' : 'खेती का डॉक्टर (Pocket Doctor)',
        cover: primaryId === 'BK002' ? '/images/books/kharif-master-guide-2026-cover.webp' : '/images/books/fasal-ka-doctor-cover.webp',
        offerPrice: 99,
        mrp: 299,
        desc: '120+ रंगीन पेज • 300+ फोटो • स्प्रे साइंस'
      };

      comboBooks.push({
        id: otherBook.id,
        tag: otherBook.id === 'BK002' ? '🏆 Bestseller Guide' : '🌾 खरीफ मास्टर गाइड',
        heading: otherBook.heading || otherBook.name,
        cover: otherBook.cover || otherBook.thumbnail || '/images/books/fasal-ka-doctor-cover.webp',
        offerPrice: parseInt(otherBook.offerPrice || 99, 10),
        mrp: parseInt(otherBook.mrp || 299, 10),
        desc: otherBook.desc || '120+ रंगीन पेज • 300+ फोटो • स्प्रे साइंस'
      });
    }

    // Limit to top 2 for clean side-by-side combo like Kheti Dr
    const displayBooks = comboBooks.slice(0, 2);
    const totalPrice = displayBooks.reduce((sum, b) => sum + (parseInt(b.offerPrice, 10) || 99), 0);

    grid.innerHTML = displayBooks.map((b, idx) => `
      <div class="ubl-combo-book-card">
        <img src="${b.cover}" alt="${escapeHtml(b.heading)}" class="ubl-combo-book-thumb" style="animation: ublFloatBook3D 4.5s ease-in-out infinite ${idx * 1.5}s;">
        <div style="text-align: left; flex: 1;">
          <span class="ubl-combo-tag" style="background:${idx === 0 ? '#16a34a' : '#0284c7'};">${b.tag || '🏆 Bestseller Guide'}</span>
          <h3 style="font-size: 1.05rem; font-weight: 900; color: #1e293b; margin: 4px 0 2px 0;">${escapeHtml(b.heading)}</h3>
          <p style="font-size: 0.78rem; color: #64748b; margin: 0 0 8px 0;">${escapeHtml(b.desc || '120+ रंगीन पेज • 300+ फोटो')}</p>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 1.25rem; font-weight: 900; color: #16a34a;">₹${b.offerPrice || 99}</span>
            <span style="font-size: 0.82rem; text-decoration: line-through; color: #94a3b8;">₹${b.mrp || 299}</span>
            <button type="button" class="ubl-btn-add-cart-mini" onclick="window.addSuggestedBookToCart('${b.id}', '${escapeHtml(b.heading)}', ${b.offerPrice || 99}, this)">
              <i class="fa-solid fa-cart-plus"></i> कार्ट में जोड़ें
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Setup Both Books Combo CTA Button (Dynamic Price Calculation e.g. ₹198)
    const comboBtn = document.getElementById('btn-add-both-combo-books');
    if (comboBtn) {
      comboBtn.innerHTML = `📦 दोनों पुस्तकें कार्ट में जोड़ें (₹${totalPrice})`;
      comboBtn.onclick = function() {
        try {
          const raw = localStorage.getItem('AI_CART_ITEMS');
          let items = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(items)) items = [];
          displayBooks.forEach(db => {
            const cleanId = (db.id || 'BK001').toUpperCase();
            if (!items.includes(cleanId)) items.push(cleanId);
          });
          localStorage.setItem('AI_CART_ITEMS', JSON.stringify(items));
          updateCartCountBadge();

          if (typeof window.fbq === 'function') {
            window.fbq('track', 'AddToCart', {
              content_name: `Combo: ${displayBooks.map(x => x.heading).join(' + ')}`,
              content_ids: displayBooks.map(x => x.id),
              value: totalPrice,
              currency: 'INR'
            });
          }
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'add_to_cart', {
              items: displayBooks.map(x => ({ item_id: x.id, item_name: x.heading, price: x.offerPrice })),
              value: totalPrice,
              currency: 'INR'
            });
          }

          const originalHTML = comboBtn.innerHTML;
          comboBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> दोनों पुस्तकें कार्ट में जुड़ गईं!';
          comboBtn.style.background = '#15803d';
          setTimeout(() => {
            comboBtn.innerHTML = originalHTML;
            comboBtn.style.background = '';
          }, 2500);

          showCartToast(`🛒 दोनों पुस्तकें कार्ट में जोड़ दी गई हैं! (कुल: ${items.length})`);
        } catch (e) {
          console.error('Add both books error:', e);
        }
      };
    }

    window.addSuggestedBookToCart = function(bId, bTitle, bPrice, btnElement) {
      try {
        const raw = localStorage.getItem('AI_CART_ITEMS');
        let items = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(items)) items = [];
        const cleanId = (bId || 'BK002').toUpperCase();
        if (!items.includes(cleanId)) {
          items.push(cleanId);
          localStorage.setItem('AI_CART_ITEMS', JSON.stringify(items));
        }
        updateCartCountBadge();

        if (typeof window.fbq === 'function') {
          window.fbq('track', 'AddToCart', {
            content_name: bTitle || 'Suggested Book',
            content_ids: [cleanId],
            value: bPrice || 99,
            currency: 'INR'
          });
        }
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'add_to_cart', {
            items: [{ item_id: cleanId, item_name: bTitle, price: bPrice }],
            value: bPrice,
            currency: 'INR'
          });
        }

        if (btnElement) {
          const originalHTML = btnElement.innerHTML;
          btnElement.innerHTML = '<i class="fa-solid fa-check"></i> कार्ट में जुड़ा';
          btnElement.style.background = '#15803d';
          setTimeout(() => {
            btnElement.innerHTML = originalHTML;
            btnElement.style.background = '';
          }, 2200);
        }

        showCartToast(`🛒 '${bTitle || "ई-बुक"}' कार्ट में जोड़ दी गई है! (कुल: ${items.length})`);
      } catch (e) {
        console.error('addSuggestedBookToCart error:', e);
      }
    };
  }

  // Update Cart Counter Badge in Header
  function updateCartCountBadge() {
    try {
      const raw = localStorage.getItem('AI_CART_ITEMS');
      const items = raw ? JSON.parse(raw) : [];
      const count = Array.isArray(items) ? items.length : 0;
      const badges = document.querySelectorAll('#cart-count-badge, .cart-count-badge');
      badges.forEach(b => {
        b.textContent = count;
        b.style.display = count > 0 ? 'flex' : 'flex';
      });
    } catch (e) {}
  }

  // Non-blocking Cart Toast
  function showCartToast(msg) {
    const toast = document.getElementById('cart-toast-notif');
    const msgEl = document.getElementById('cart-toast-msg');
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    toast.style.pointerEvents = 'auto';

    clearTimeout(window._ublCartToastTimer);
    window._ublCartToastTimer = setTimeout(() => {
      toast.style.transform = 'translateY(-30px)';
      toast.style.opacity = '0';
      toast.style.pointerEvents = 'none';
    }, 3500);
  }

  // ==========================================================
  // CUSTOMER REVIEWS WITH AVATARS (👨/👩)
  // ==========================================================
  function renderCustomCustomerReviews() {
    const grid = document.getElementById('reviews-grid');
    const l = currentLandingData || {};

    const defaultReviews = [
      { name: 'पवन पांडे', location: 'सागर, मध्य प्रदेश', rating: 5, gender: 'male', comment: 'सरल भाषा और वास्तविक फोटो के कारण रोग पहचानना बहुत आसान हो गया। मेरी सोयाबीन की फसल बच गई।' },
      { name: 'अनिता शर्मा', location: 'उदयपुर, राजस्थान', rating: 5, gender: 'female', comment: 'पौधों के पोषण और स्प्रे की सही मात्रा सीखने के लिए यह सबसे अच्छी किताब है।' },
      { name: 'तरुण कुमार मिश्रा', location: 'वाराणसी, उत्तर प्रदेश', rating: 5, gender: 'male', comment: 'कृषि विद्यार्थियों के लिए भी यह एक बेहतरीन Practical Guide है।' },
      { name: 'माखन दाऊ', location: 'गुना, मध्य प्रदेश', rating: 5, gender: 'male', comment: 'कम कीमत में इतनी उपयोगी जानकारी मिलना वास्तव में शानदार है।' }
    ];

    const reviews = (l.testimonials && l.testimonials.length > 0) ? l.testimonials : defaultReviews;
    if (!grid) return;

    grid.innerHTML = reviews.map(r => {
      const avatarHtml = r.photo ? 
        `<img src="${r.photo}" alt="${escapeHtml(r.name)}" class="ubl-review-avatar-img" />` : 
        `<div class="ubl-review-avatar-icon">${(r.gender === 'female') ? '👩' : '👨'}</div>`;

      return `
        <div class="review-card">
          <div class="review-stars">${'⭐'.repeat(r.rating || 5)}</div>
          <p>"${escapeHtml(r.comment)}"</p>
          <div class="ubl-review-avatar-wrap">
            ${avatarHtml}
            <div>
              <h4 style="margin:0;font-size:0.95rem;font-weight:800;color:#0f172a;">${escapeHtml(r.name)}</h4>
              <small style="color:#64748b;font-size:0.75rem;">${escapeHtml(r.location || 'India')}</small>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================
  // AAROGYAM PRO VIP PERKS & VALUE STACK
  // ==========================================================
  function renderVipPerkSection() {
    const l = currentLandingData || {};
    const b = currentBookData || {};
    const hero = l.hero || {};
    const stack = l.value_stack || {};

    const offerPrice = stack.offer_price || hero.offer_price || b.offerPrice || 99;
    const bookMrp = stack.book_mrp || hero.mrp || b.mrp || 299;
    const vipVal = stack.vip_value || 1999;
    const bonusVal = stack.bonus_value || 199;
    const totalVal = bookMrp + vipVal + bonusVal;

    setElemText('stack-offer-price-val', `₹${offerPrice}`);
    setElemText('stack-total-mrp-val', `₹${totalVal}`);

    const textEl = document.getElementById('vip-perk-text');
    if (textEl && stack.subscriber_perk) {
      textEl.textContent = stack.subscriber_perk;
    }

    const vipBannerImg = document.getElementById('vip-banner-img');
    if (vipBannerImg && stack.vip_banner) {
      vipBannerImg.src = stack.vip_banner;
      vipBannerImg.style.display = 'block';
    }
  }

  // ==========================================================
  // CUSTOMIZABLE STICKY ACTION BAR
  // ==========================================================
  function renderCustomStickyBar() {
    const l = currentLandingData || {};
    const b = currentBookData || {};
    const hero = l.hero || {};

    const thumb = document.getElementById('sticky-thumb-img');
    const price = document.getElementById('sticky-price-val');
    const mrp = document.getElementById('sticky-mrp-val');
    const buyBtn = document.getElementById('sticky-buy-btn');

    const cover = hero.cover_image || b.cover || b.thumbnail || '../images/books/kharif-master-guide-2026-cover.webp';
    if (thumb) thumb.src = cover;
    if (price) price.textContent = `₹${hero.offer_price || b.offerPrice || 99}`;
    if (mrp) mrp.textContent = `₹${hero.mrp || b.mrp || 299}`;

    if (buyBtn) {
      buyBtn.href = `checkout.html?id=${encodeURIComponent(b.id || currentBookId)}`;
      if (l.sticky_button_text) buyBtn.innerHTML = `🛒 ${escapeHtml(l.sticky_button_text)}`;
      if (l.theme_primary) buyBtn.style.background = l.theme_primary;
    }
  }

  function toAbsoluteUrl(url) {
    if (!url || typeof url !== 'string') return 'https://aarogyamindia.online/images/books/kharif-fasal-og.webp';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const origin = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://aarogyamindia.online';
    if (trimmed.startsWith('/')) return origin + trimmed;
    if (trimmed.startsWith('../')) return origin + trimmed.replace(/^\.\./, '');
    return origin + '/' + trimmed;
  }

  // ==========================================================
  // DYNAMIC OPENGRAPH META INJECTION
  // ==========================================================
  function renderDynamicOpenGraph() {
    const l = currentLandingData || {};
    const b = currentBookData || {};
    const hero = l.hero || {};

    const title = l.og_title || hero.title || b.heading || 'Aarogyam India eBook';
    const desc = l.og_description || hero.description || b.description || 'सम्पूर्ण Practical Guide। अभी विशेष छूट पर उपलब्ध।';
    const rawImg = l.og_image || hero.banner_image || hero.cover_image || '/images/books/kharif-fasal-og.webp';
    const absImg = toAbsoluteUrl(rawImg);

    setMetaProp('og-title-meta', title);
    setMetaProp('og-desc-meta', desc);
    setMetaProp('og-image-meta', absImg);
    setMetaProp('og-url-meta', window.location.href);
    setMetaProp('twitter-title-meta', title);
    setMetaProp('twitter-desc-meta', desc);
    setMetaProp('twitter-image-meta', absImg);
  }

  // ==========================================================
  // FACEBOOK PIXEL & GOOGLE ANALYTICS ENGINE (KHETI DR. MATCHED)
  // ==========================================================
  function injectTrackingPixels() {
    const l = currentLandingData || {};
    const b = currentBookData || {};
    const hero = l.hero || {};
    const title = hero.title || b.heading || b.name || 'Aarogyam India eBook';

    // 1. Facebook Meta Pixel (Built-In ID: 1671873500553134)
    const isFbEnabled = l.facebook_pixel_id !== 'disabled' && l.facebook_pixel_enabled !== false;
    if (isFbEnabled && typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'PageView');
      } catch (e) {}
    }

    // 2. Google Tag / Analytics (Built-In ID: G-2BWPJVQWPK)
    const isGaEnabled = l.google_analytics_id !== 'disabled' && l.google_analytics_enabled !== false;
    if (isGaEnabled && typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'page_view', {
          page_title: title,
          page_location: window.location.href
        });
      } catch (e) {}
    }
  }

  function bindInteractiveEvents() {
    // FAQ Accordion
    document.querySelectorAll('.faq-item h3').forEach(h3 => {
      h3.addEventListener('click', () => {
        const item = h3.parentElement;
        item.classList.toggle('active');
      });
    });

    // Universal Smart Book Sharing Handler
    window.handleUniversalBookShare = function(e) {
      if (e) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.preventDefault === 'function') e.preventDefault();
      }

      const l = currentLandingData || {};
      const hero = l.hero || {};
      const b = currentBookData || {};
      const bId = (b.id || currentBookId || 'BK001').toUpperCase();
      const title = l.og_title || hero.title || b.heading || b.name || 'Aarogyam India eBook';
      
      // 1. Resolve User Share / Affiliate ID
      let userShareId = 'AI000004';
      try {
        const userObj = JSON.parse(localStorage.getItem('AI_USER') || '{}');
        if (userObj && (userObj.share_id || userObj.ref_code || userObj.phone)) {
          userShareId = userObj.share_id || userObj.ref_code || userObj.phone;
        }
      } catch (err) {}

      // 2. Resolve Smart Serverless Share URL
      const origin = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://aarogyamindia.online';
      const shareUrl = `${origin}/api/share?id=${encodeURIComponent(bId)}&share_id=${encodeURIComponent(userShareId)}`;

      // 3. Resolve Custom Promo Text
      const customPromo = l.whatsapp_share_message || l.whatsapp_share_text || '';
      const promoText = customPromo 
        ? `${customPromo}\n\n👉 अभी पुस्तक देखें और ऑर्डर करें:\n${shareUrl}`
        : `🌾 *${title}*\n${hero.subtitle || hero.description || 'सम्पूर्ण वैज्ञानिक एवं Practical समाधान।'}\n\n👉 विशेष छूट पर अभी देखें:\n${shareUrl}`;

      // 4. Mobile WhatsApp / WebShare Trigger
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

      if (isMobile) {
        // Direct 1-Click WhatsApp Launch on Mobile
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(promoText)}`;
        window.open(waUrl, '_blank');
      } else {
        // Desktop: Copy to clipboard and launch WhatsApp Web or Share dialog
        navigator.clipboard?.writeText(promoText).then(() => {
          showCartToast(`📲 WhatsApp शेयर संदेश व लिंक कॉपी हो गया! WhatsApp Web पर पेस्ट करें।`);
        }).catch(() => {
          prompt('WhatsApp पर शेयर करने के लिए संदेश कॉपी करें:', promoText);
        });

        // Also open WhatsApp Web in new tab
        const waWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(promoText)}`;
        window.open(waWebUrl, '_blank');
      }
    };

    // Add to Cart Button
    const addCartBtn = document.getElementById('hero-add-cart-btn');
    addCartBtn?.addEventListener('click', () => {
      try {
        const raw = localStorage.getItem('AI_CART_ITEMS');
        let items = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(items)) items = [];
        const bId = (currentBookData.id || currentBookId || 'BK001').toUpperCase();
        if (!items.includes(bId)) {
          items.push(bId);
          localStorage.setItem('AI_CART_ITEMS', JSON.stringify(items));
        }
        updateCartCountBadge();
        
        // Track AddToCart in Pixel
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'AddToCart', {
            content_name: currentBookData.name || currentBookData.heading,
            content_ids: [bId],
            value: currentBookData.offerPrice || 99,
            currency: 'INR'
          });
        }
        // Track AddToCart in Google Analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'add_to_cart', {
            currency: 'INR',
            value: currentBookData.offerPrice || 99,
            items: [{ item_id: bId, item_name: currentBookData.name || currentBookData.heading, price: currentBookData.offerPrice || 99 }]
          });
        }

        if (confirm('🛒 पुस्तक आपके कार्ट में जोड़ दी गई है!\n\nक्या आप अभी कार्ट देखना चाहते हैं?')) {
          window.location.href = 'cart.html';
        }
      } catch (e) {}
    });

    // Track InitiateCheckout on all Buy Now clicks
    document.querySelectorAll('.buy-btn, .btn-primary, #sticky-buy-btn, #final-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = (currentBookData.id || currentBookId || 'BK001').toUpperCase();
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'InitiateCheckout', {
            content_name: currentBookData.name || currentBookData.heading,
            content_ids: [bId],
            value: currentBookData.offerPrice || 99,
            currency: 'INR'
          });
        }
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'begin_checkout', {
            currency: 'INR',
            value: currentBookData.offerPrice || 99,
            items: [{ item_id: bId, item_name: currentBookData.name || currentBookData.heading, price: currentBookData.offerPrice || 99 }]
          });
        }
      });
    });
  }

  function updateCartCountBadge() {
    try {
      const raw = localStorage.getItem('AI_CART_ITEMS');
      const items = raw ? JSON.parse(raw) : [];
      const badge = document.getElementById('cart-count-badge');
      if (badge && Array.isArray(items)) {
        badge.textContent = items.length;
      }
    } catch (e) {}
  }

  function injectTrackingPixels() {
    const l = currentLandingData || {};
    const pixelId = l.facebook_pixel_id || '1671873500553134';

    // Facebook Pixel Injection
    if (pixelId && !window._fb_pixel_injected && pixelId !== 'disabled') {
      window._fb_pixel_injected = true;
      try {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
        window.fbq('track', 'ViewContent', {
          content_name: currentBookData.name || currentBookData.heading || 'Aarogyam India eBook',
          content_ids: [currentBookData.id || currentBookId],
          value: currentLandingData.hero?.offer_price || currentBookData.offerPrice || 99,
          currency: 'INR'
        });
      } catch (e) {}
    }

    // Google Analytics Injection
    const gaId = l.google_analytics_id;
    if (gaId && !window._ga_injected && gaId !== 'disabled') {
      window._ga_injected = true;
      try {
        const s = document.createElement('script');
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(s);

        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', gaId);
      } catch (e) {}
    }
  }

  function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    url = url.trim();
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;

    // Direct Shorts match (e.g. /shorts/ew5tDJgGTK8?si=...)
    const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

    // youtu.be match (e.g. youtu.be/ew5tDJgGTK8?si=...)
    const youtuMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
    if (youtuMatch && youtuMatch[1]) return youtuMatch[1];

    // watch?v= or &v= match
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) return watchMatch[1];

    // embed or v match
    const embedMatch = url.match(/(?:embed|v)\/([a-zA-Z0-9_-]{11})/i);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    // General fallback
    const genMatch = url.match(/([a-zA-Z0-9_-]{11})/);
    return genMatch ? genMatch[1] : null;
  }

  function renderSectionBanner(secId, bannerUrl) {
    const secEl = document.getElementById(secId);
    if (!secEl) return;

    let bannerWrap = secEl.querySelector('.ubl-section-banner-wrap');
    if (bannerUrl && typeof bannerUrl === 'string' && bannerUrl.trim().length > 0) {
      if (!bannerWrap) {
        bannerWrap = document.createElement('div');
        bannerWrap.className = 'ubl-section-banner-wrap';
        bannerWrap.innerHTML = `<img src="${escapeHtml(bannerUrl.trim())}" alt="Section Banner" class="ubl-section-banner-img" />`;
        // Insert right after container heading or at top of section
        const container = secEl.querySelector('.container') || secEl;
        if (container.firstChild) {
          container.insertBefore(bannerWrap, container.firstChild);
        } else {
          container.appendChild(bannerWrap);
        }
      } else {
        const img = bannerWrap.querySelector('img');
        if (img) img.src = bannerUrl.trim();
        bannerWrap.style.display = 'block';
      }
    } else {
      if (bannerWrap) {
        bannerWrap.remove();
      }
    }
  }

  function setElemText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function setElemSrc(id, src) {
    const el = document.getElementById(id);
    if (el && src) el.src = src;
  }

  function setMetaProp(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute('content', val);
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

  // Global Menu and Login Helpers
  window.toggleMenu = function () {
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('sideMenuOverlay');
    if (sideMenu) {
      const isActive = sideMenu.classList.toggle('active');
      if (overlay) overlay.style.display = isActive ? 'block' : 'none';
    }
  };

  window.openLoginPopup = function () {
    const popup = document.getElementById('login-popup-overlay');
    if (popup) popup.style.display = 'flex';
  };

  window.closeLoginPopup = function () {
    const popup = document.getElementById('login-popup-overlay');
    if (popup) popup.style.display = 'none';
  };

  window.logoutUser = function () {
    localStorage.removeItem('AI_USER');
    localStorage.removeItem('AI_PROFILE');
    window.location.reload();
  };

  function renderBookNotFound(bookId) {
    const container = document.getElementById('landing-sections-container');
    const stickyBar = document.querySelector('.mobile-sticky-bar');
    if (stickyBar) stickyBar.style.display = 'none';
    if (container) {
      container.innerHTML = `
        <div style="max-width: 600px; margin: 80px auto; padding: 40px 24px; text-align: center; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">📚</div>
          <h2 style="font-size: 1.6rem; color: #1e293b; margin-bottom: 8px;">पुस्तक उपलब्ध नहीं है (Book Not Found)</h2>
          <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.6;">
            Book ID: <strong style="color:#ef4444;">${escapeHtml(bookId)}</strong> का विवरण अभी प्रकाशित नहीं हुआ है या लिंक अमान्य है।
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="/ebooks/ebook.html" style="background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none;">
              📖 सभी ई-बुक्स देखें
            </a>
            <a href="/index.html" style="background: #f1f5f9; color: #475569; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none;">
              🏠 होम पेज
            </a>
          </div>
        </div>
      `;
    }
  }

  // Check login state on load
  function checkLoginHeaderState() {
    try {
      const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
      const isLoggedIn = storedUser.id || storedUser.mobile;
      const menuName = document.getElementById('menuUserName');
      const memberStatus = document.getElementById('mobileMemberStatus');
      const mobilePhone = document.getElementById('mobileUserPhone');
      const loginBtn = document.getElementById('mobile-login-btn');
      const logoutBtn = document.getElementById('mobile-logout-btn');

      if (isLoggedIn) {
        if (menuName) menuName.textContent = storedUser.full_name || storedUser.name || 'प्रिय पाठक';
        if (memberStatus) memberStatus.textContent = storedUser.is_subscriber ? 'VIP Pro Member' : 'Active Reader';
        if (mobilePhone && storedUser.mobile) mobilePhone.textContent = `(${storedUser.mobile})`;
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'flex';
      } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    } catch (e) {}
  }

  // Side Menu Toggle Controller
  window.toggleMenu = function() {
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('sideMenuOverlay');
    if (sideMenu) {
      if (sideMenu.classList.contains('active')) {
        sideMenu.classList.remove('active');
        sideMenu.style.right = '-320px';
      } else {
        sideMenu.classList.add('active');
        sideMenu.style.right = '0px';
      }
    }
    if (overlay) {
      if (overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
      } else {
        overlay.classList.add('active');
        overlay.style.display = 'block';
        overlay.style.opacity = '1';
      }
    }
  };

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      checkLoginHeaderState();
    });
  } else {
    init();
    checkLoginHeaderState();
  }

})(window);
