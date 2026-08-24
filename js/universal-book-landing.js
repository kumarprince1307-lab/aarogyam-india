/* ==========================================================
   AAROGYAM INDIA — UNIVERSAL DYNAMIC BOOK LANDING PAGE JS (PRO)
   Full Dynamic Engine for ebooks/book-landing.html
   ========================================================== */

(function (window) {
  'use strict';

  let currentBookId = 'BK001';
  let allBooks = [];
  let allLandingPages = [];
  let currentBookData = null;
  let currentLandingData = null;

  // Multi-cart state
  let selectedSuggestedBookIds = [];
  let currentZoom = 1;

  async function init() {
    extractQueryParameters();
    await loadBookAndLandingData();
    renderAllSections();
    renderMultiVideos();
    renderPinchZoomLightbox();
    renderSuggestedBooksSection();
    renderUpcomingBooksSection();
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

    // 2. Fetch data/universal-book-landing-pages.json
    try {
      const res = await fetch('/data/universal-book-landing-pages.json?v=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        allLandingPages = json.bookLandingPages || [];
      }
    } catch (e) {}

    // 3. Scan LocalStorage for latest Admin Edits
    try {
      const stored = localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES');
      if (stored) {
        const localList = JSON.parse(stored);
        if (Array.isArray(localList)) {
          localList.forEach(item => {
            const idx = allLandingPages.findIndex(x => x.id === item.id || (item.slug && x.slug === item.slug));
            if (idx >= 0) allLandingPages[idx] = item;
            else allLandingPages.push(item);
          });
        }
      }
    } catch (e) {}

    // Match Book
    currentBookData = allBooks.find(b => 
      b.id === currentBookId || 
      (b.slug && b.slug.toLowerCase() === currentBookId.toLowerCase())
    ) || allBooks[0] || {};

    // Match Landing Data
    currentLandingData = allLandingPages.find(p => 
      p.id === currentBookData.id || 
      (p.slug && p.slug === currentBookData.slug) || 
      p.id === currentBookId
    ) || allLandingPages[0] || {};
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
    
    // Value Stack Card
    const stack = l.value_stack || {};
    const bookMrpVal = stack.book_mrp || mrp;
    const vipVal = stack.vip_value || 1999;
    const bonusVal = stack.bonus_value || 199;
    const totalStackMrp = bookMrpVal + vipVal + bonusVal;
    setElemText('stack-card-book-mrp', `₹${bookMrpVal}`);
    setElemText('stack-card-total-mrp', `₹${totalStackMrp}`);
    setElemText('stack-card-offer-price', `आज मात्र ₹${offer}`);

    setElemSrc('hero-banner-img', banner);
    setElemSrc('hero-book-cover', cover);

    // Hero Features / KPIs
    const featWrap = document.getElementById('hero-features-wrap');
    if (featWrap) {
      const feats = hero.features || [
        { icon: 'fa-seedling', text: `${b.totalPages || 120}+ रंगीन पेज` },
        { icon: 'fa-camera', text: '300+ फोटो' },
        { icon: 'fa-circle-check', text: 'Scientific Guide' },
        { icon: 'fa-gift', text: 'Free Bonus PDF' }
      ];
      featWrap.innerHTML = feats.map(f => `
        <div class="hero-feature">
          <i class="fa-solid ${f.icon || 'fa-check'}"></i>
          <span>${escapeHtml(f.text)}</span>
        </div>
      `).join('');
    }

    // 3. Checkout Button URLs
    const checkoutUrl = `checkout.html?id=${encodeURIComponent(b.id || currentBookId)}`;
    const buyBtns = ['hero-buy-btn', 'preview-buy-btn', 'final-buy-btn'];
    buyBtns.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.href = checkoutUrl;
    });

    // Update Cart Badge
    updateCartCountBadge();
    injectTrackingPixels();

    // 4. WhatsApp Links
    const waPrompt = l.whatsapp_prompt || `नमस्ते, मुझे '${title}' पुस्तक के बारे में और जानकारी चाहिए।`;
    const waUrl = `https://wa.me/917974422572?text=${encodeURIComponent(waPrompt)}`;
    
    const waHelpLink = document.getElementById('wa-help-link');
    if (waHelpLink) waHelpLink.href = waUrl;
    const stickyHelpBtn = document.getElementById('sticky-help-btn');
    if (stickyHelpBtn) stickyHelpBtn.href = waUrl;
    const photoDiagBtn = document.getElementById('photo-diag-wa-btn');
    if (photoDiagBtn) {
      photoDiagBtn.href = `https://wa.me/917974422572?text=${encodeURIComponent(`नमस्ते, मैंने '${title}' के संदर्भ में फसल की फोटो ली है, कृपया रोग पहचान व सही समाधान बताएं।`)}`;
    }

    // 5. Why Buy Section
    const why = l.why_read;
    if (why) {
      if (why.title) setElemText('why-title', why.title);
      if (why.subtitle || why.desc) setElemText('why-desc', why.subtitle || why.desc);
      const whyGrid = document.getElementById('why-cards-grid');
      if (whyGrid && why.cards && why.cards.length > 0) {
        whyGrid.innerHTML = why.cards.map(c => `
          <div class="why-card">
            <div class="why-icon">${c.icon || '🌱'}</div>
            <h3>${escapeHtml(c.title)}</h3>
            <p>${escapeHtml(c.desc)}</p>
          </div>
        `).join('');
      }
    }

    // 6. Preview Gallery
    const galleryGrid = document.getElementById('preview-gallery-grid');
    const demoImages = l.demo_images || b.demoImages || [
      '../images/books/kharif-master-guide-2026-preview-01.webp',
      '../images/books/kharif-master-guide-2026-preview-02.webp',
      '../images/books/kharif-master-guide-2026-preview-03.webp',
      '../images/books/kharif-master-guide-2026-preview-04.webp',
      '../images/books/kharif-master-guide-2026-preview-05.webp'
    ];
    if (galleryGrid && demoImages.length > 0) {
      galleryGrid.innerHTML = demoImages.map((imgUrl, i) => `
        <div class="preview-card" onclick="window.openPinchZoomLightbox('${imgUrl}')">
          <img src="${imgUrl}" alt="Preview Page ${i + 1}" loading="lazy" style="cursor:zoom-in;">
        </div>
      `).join('');
    }

    const prevBanner = document.getElementById('preview-banner-img');
    if (prevBanner) {
      prevBanner.onclick = () => window.openPinchZoomLightbox(prevBanner.src);
    }

    // 7. Bonus Section
    const bonusWrapper = document.getElementById('bonus-section-wrapper');
    if (bonusWrapper) {
      const bonuses = l.bonuses || l.bonus_books;
      if (bonuses && bonuses.length > 0) {
        bonusWrapper.style.display = 'block';
        const b0 = bonuses[0];
        setElemSrc('bonus-cover-img', b0.image || '../images/books/kharif-fasal-hero-2.webp');
        setElemText('bonus-title', b0.title ? `🎁 ${b0.title}` : '🌾 FREE AI WHATSAPP SUPPORT 🎁');
        if (b0.description) setElemText('bonus-desc', b0.description);

        const listEl = document.getElementById('bonus-list-items');
        if (listEl) {
          listEl.innerHTML = bonuses.map(item => `
            <li>✅ <strong>${escapeHtml(item.title)}</strong> (मूल्य ₹${item.mrp || 199} - बिल्कुल FREE)</li>
          `).join('') + `
            <li>✅ 💬 24×7 WhatsApp Support</li>
            <li>✅ 📱 मोबाइल Reader & PDF Lifetime Access</li>
          `;
        }
      }
    }

    // 8. Book Specification & TOC
    setElemText('spec-name', title);
    setElemText('spec-lang', b.language || 'Hindi');
    setElemText('spec-pages', `${b.totalPages || 120}+ Pages`);
    setElemText('spec-images', '300+ Real Images');
    setElemText('spec-author', b.author || 'Aarogyam India');
    setElemText('spec-version', `${b.version || '2026'} Edition`);

    if (l.table_of_contents && l.table_of_contents.length > 0) {
      const tocList = document.getElementById('toc-list');
      if (tocList) {
        tocList.innerHTML = l.table_of_contents.map(ch => `<li>✅ ${escapeHtml(ch)}</li>`).join('');
      }
    }

    // 9. FAQs
    const faqWrap = document.getElementById('faq-list-wrapper');
    const defaultFaqs = [
      { q: 'यह पुस्तक किसके लिए है?', a: 'यह पुस्तक किसान, कृषि विद्यार्थी, कृषि सलाहकार और कृषि व्यवसाय से जुड़े लोगों के लिए उपयोगी है।' },
      { q: 'क्या यह Printed Book है?', a: 'नहीं, यह एक Digital PDF eBook है जिसे मोबाइल, टैबलेट और कंप्यूटर पर कभी भी पढ़ा जा सकता है।' },
      { q: 'भुगतान के बाद पुस्तक कब मिलेगी?', a: 'सफल भुगतान के तुरंत बाद आपकी Library में पुस्तक उपलब्ध होगी और Instant Download का लिंक भी मिलेगा।' },
      { q: 'क्या मुझे किताब बार-बार डाउनलोड करनी पड़ेगी?', a: '❌ नहीं। एक बार खरीदने के बाद बार-बार डाउनलोड करने की जरूरत नहीं है। आप Lifetime Access के साथ Reader में सीधे मोबाइल पर किताब पढ़ सकते हैं।' },
      { q: 'क्या बिना डाउनलोड किए भी किताब पढ़ सकता हूँ?', a: '✅ हाँ। Reader खोलिए और सीधे मोबाइल में पढ़ना शुरू कीजिए।' },
      { q: 'यदि कोई समस्या हो तो संपर्क कैसे करें?', a: 'आप हमारी WhatsApp Support टीम से सीधे संपर्क कर सकते हैं।' }
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
  // MULTI-VIDEO ENGINE (16:9 & 9:16 SHORTS/REELS)
  // ==========================================================
  function renderMultiVideos() {
    const section = document.getElementById('book-video-section');
    const grid = document.getElementById('video-grid-container');
    const l = currentLandingData || {};

    let videos = l.videos || [];
    if (videos.length === 0 && l.video && l.video.enabled && l.video.youtube_url) {
      videos = [{
        url: l.video.youtube_url,
        title: l.video.title || '🎥 पुस्तक वीडियो अवलोकन',
        ratio: '16:9',
        description: l.video.description || 'देखें इस पुस्तक के मुख्य अध्याय व लाइव गाइडेंस।'
      }];
    }

    if (!section || !grid) return;
    if (videos.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    grid.innerHTML = videos.map(v => {
      const ytId = extractYouTubeId(v.url || v.youtube_url);
      if (!ytId) return '';
      const isVertical = (v.ratio === '9:16' || v.format === '9:16' || v.isShorts);
      const frameClass = isVertical ? 'ubl-video-frame-wrap-9-16' : 'ubl-video-frame-wrap-16-9';

      return `
        <div class="ubl-video-card">
          <div class="${frameClass}">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0" 
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
  // SUGGESTED BOOKS / RELATED BOOKS MULTI-CART
  // ==========================================================
  function renderSuggestedBooksSection() {
    const section = document.getElementById('suggested-books-section');
    const grid = document.getElementById('suggested-books-grid');

    if (!section || !grid) return;

    const l = currentLandingData || {};
    let otherBooks = [];
    
    // Check if custom suggested books list was saved in Admin
    if (l.suggested_books_list && l.suggested_books_list.length > 0) {
      otherBooks = l.suggested_books_list.map(sb => {
        return {
          id: sb.link || sb.id || 'BK002',
          heading: sb.title || 'संबंधित ई-बुक',
          cover: sb.image || '../images/books/kharif-master-guide-2026-cover.webp',
          offerPrice: sb.offerPrice || 99,
          mrp: sb.mrp || 299,
          link: sb.link || sb.id || '#'
        };
      });
    } else if (l.suggested_books && l.suggested_books.length > 0) {
      l.suggested_books.forEach(sId => {
        const cleanId = sId.replace(/https?:\/\/[^\/]+\/.*[?&]id=/, '').trim();
        const found = allBooks.find(b => b.id === cleanId || (b.slug && b.slug.toLowerCase() === cleanId.toLowerCase()));
        if (found && found.id !== currentBookData.id && !otherBooks.some(x => x.id === found.id)) {
          otherBooks.push(found);
        }
      });
    }

    if (otherBooks.length === 0) {
      otherBooks = allBooks.filter(b => b.id !== currentBookData.id && (b.status === 'active' || !b.status));
    }

    if (otherBooks.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    grid.innerHTML = otherBooks.slice(0, 6).map(b => `
      <div class="ubl-suggested-card">
        <img src="${b.cover || b.thumbnail || '../images/books/kharif-master-guide-2026-cover.webp'}" alt="${escapeHtml(b.heading || b.name || b.title)}" class="ubl-suggested-thumb">
        <div class="ubl-suggested-info">
          <h4>${escapeHtml(b.heading || b.name || b.title)}</h4>
          <div class="price-row">
            <span class="price">₹${b.offerPrice || 99}</span>
            <span class="mrp">₹${b.mrp || 299}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button type="button" class="ubl-btn-add-cart-mini" onclick="window.addSuggestedBookToCart('${b.id || b.link || 'BK002'}', '${escapeHtml(b.heading || b.name || b.title)}', ${b.offerPrice || 99})">
              <i class="fa-solid fa-cart-plus"></i> कार्ट में जोड़ें
            </button>
            <a href="${(b.link && b.link.startsWith('http')) ? b.link : `book-landing.html?id=${encodeURIComponent(b.id || b.link || 'BK002')}`}" style="font-size:0.78rem;color:#2E7D32;font-weight:700;text-decoration:underline;">
              विवरण देखें &rarr;
            </a>
          </div>
        </div>
      </div>
    `).join('');

    window.addSuggestedBookToCart = function(bId, bTitle, bPrice) {
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

        if (confirm(`🛒 '${bTitle || cleanId}' कार्ट में जोड़ दी गई है!\n\nक्या आप अभी कार्ट देखना चाहते हैं?`)) {
          window.location.href = 'cart.html';
        }
      } catch (e) {}
    };
  }

  // ==========================================================
  // UPCOMING BOOKS SECTION
  // ==========================================================
  function renderUpcomingBooksSection() {
    const section = document.getElementById('upcoming-books-section');
    const grid = document.getElementById('upcoming-books-grid');

    const comingSoonBooks = allBooks.filter(b => b.status === 'coming_soon');
    if (!section || !grid) return;
    if (comingSoonBooks.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    grid.innerHTML = comingSoonBooks.slice(0, 4).map(b => `
      <div class="ubl-upcoming-card">
        <span class="ubl-upcoming-badge">⏳ जल्द आ रहा है (Coming Soon)</span>
        <img src="${b.cover || b.thumbnail || '../images/books/kharif-master-guide-2026-cover.webp'}" alt="${escapeHtml(b.heading || b.name)}" class="ubl-upcoming-thumb">
        <h4 style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${escapeHtml(b.heading || b.name)}</h4>
        <div style="color:var(--primary);font-weight:700;font-size:0.85rem;">2026 Edition</div>
      </div>
    `).join('');
  }

  // ==========================================================
  // ADVANCED CUSTOMER REVIEWS WITH AVATARS (👨/👩)
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
  // AAROGYAM PRO VIP PERKS
  // ==========================================================
  function renderVipPerkSection() {
    const l = currentLandingData || {};
    const textEl = document.getElementById('vip-perk-text');
    if (textEl && l.value_stack?.subscriber_perk) {
      textEl.textContent = l.value_stack.subscriber_perk;
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

  // ==========================================================
  // DYNAMIC OPENGRAPH META INJECTION
  // ==========================================================
  function renderDynamicOpenGraph() {
    const l = currentLandingData || {};
    const b = currentBookData || {};
    const hero = l.hero || {};

    const title = l.og_title || hero.title || b.heading || 'Aarogyam India eBook';
    const desc = l.og_description || hero.description || b.description || 'सम्पूर्ण Practical Guide। अभी विशेष छूट पर उपलब्ध।';
    const img = l.og_image || hero.banner_image || hero.cover_image || 'https://aarogyamindia.online/images/books/kharif-fasal-og.webp';

    setMetaProp('og-title-meta', title);
    setMetaProp('og-desc-meta', desc);
    setMetaProp('og-image-meta', img);
    setMetaProp('og-url-meta', window.location.href);
    setMetaProp('twitter-title-meta', title);
    setMetaProp('twitter-desc-meta', desc);
    setMetaProp('twitter-image-meta', img);

    const shareData = document.getElementById('book-share-data');
    if (shareData) {
      shareData.setAttribute('data-title', title);
      shareData.setAttribute('data-description', desc);
      shareData.setAttribute('data-price', `₹${hero.offer_price || b.offerPrice || 99}`);
      shareData.setAttribute('data-mrp', `₹${hero.mrp || b.mrp || 299}`);
      shareData.setAttribute('data-url', window.location.href);
      shareData.setAttribute('data-image', img);
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

    // Native Share
    const shareBtn = document.getElementById('hero-share-btn');
    shareBtn?.addEventListener('click', () => {
      const title = document.title;
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: title,
          text: `🌾 *${title}* — सम्पूर्ण प्रैक्टिकल गाइड आज ही विशेष ऑफर में प्राप्त करें!`,
          url: url
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url).then(() => {
          alert('📋 लिंक कॉपी हो गया! आप इसे WhatsApp पर शेयर कर सकते हैं।');
        });
      }
    });

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

        if (confirm('🛒 पुस्तक आपके कार्ट में जोड़ दी गई है!\n\nक्या आप अभी कार्ट देखना चाहते हैं?')) {
          window.location.href = 'cart.html';
        }
      } catch (e) {}
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
    if (pixelId && !window._fb_pixel_injected) {
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
    if (gaId && !window._ga_injected) {
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
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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

  // Global Menu and Login Helpers (Identical to my-library.html)
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
