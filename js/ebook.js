/**
 * ====================================================================
 * AAROGYAM INDIA - EBOOK STOREFRONT ENGINE (AMAZON / KINDLE STYLE)
 * Version: 2.0 (Dynamic Shelves, Ticker, Live Search, Wishlist & Cart)
 * ====================================================================
 */

'use strict';

(function () {
  let allStoreBooks = [];
  let activeCategory = 'all';

  document.addEventListener('DOMContentLoaded', () => {
    initStoreData();
    initBreakingTicker();
    initSearchFilter();
    initCategoryTabs();
    initUserAuthHeader();
    initComingSoonModal();
  });

  // -------------------------------------------------------------
  // 1. DATA LOADER & NORMALIZATION
  // -------------------------------------------------------------
  async function initStoreData() {
    let jsonBooks = [];
    let landingPages = [];

    try {
      const [resBooks, resLp] = await Promise.all([
        fetch('/data/books.json').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/data/universal-book-landing-pages.json').then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      jsonBooks = Array.isArray(resBooks) ? resBooks : (resBooks.books || []);
      landingPages = Array.isArray(resLp) ? resLp : (resLp.bookLandingPages || []);
    } catch (e) {}

    // Merge LocalStorage custom books and deleted IDs
    let customBooks = [];
    let customLp = [];
    let deletedIds = [];
    try {
      customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      customLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
      deletedIds = JSON.parse(localStorage.getItem('AAROGYAM_DELETED_LANDING_PAGES') || '[]');
    } catch (e) {}

    // Build unique book map
    const bookMap = new Map();

    // 1. Primary from books.json
    jsonBooks.forEach(b => {
      if (b && b.id) bookMap.set(b.id.toUpperCase(), b);
    });

    // 2. Overlay from custom books
    customBooks.forEach(b => {
      if (b && b.id) bookMap.set(b.id.toUpperCase(), Object.assign({}, bookMap.get(b.id.toUpperCase()) || {}, b));
    });

    // 3. Overlay from Landing Pages (both static and custom)
    [...landingPages, ...customLp].forEach(lp => {
      if (!lp || !lp.id) return;
      const bId = lp.id.toUpperCase();
      const existing = bookMap.get(bId) || {};
      const hero = lp.hero || {};
      bookMap.set(bId, {
        id: bId,
        slug: lp.slug || bId.toLowerCase(),
        heading: hero.title || existing.heading || existing.name || bId,
        name: hero.title || existing.heading || existing.name || bId,
        subtitle: hero.subtitle || existing.subtitle || '',
        description: hero.description || existing.description || '',
        category: lp.category || existing.category || 'Agriculture',
        language: 'Hindi',
        mrp: hero.mrp || existing.mrp || 299,
        offerPrice: hero.offer_price || existing.offerPrice || 99,
        cover: hero.cover_image || existing.cover || existing.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
        thumbnail: hero.cover_image || existing.thumbnail || existing.cover || '/images/books/kharif-master-guide-2026-cover.webp',
        banner: hero.banner_image || existing.banner,
        status: lp.status || existing.status || 'active',
        publish_targets: lp.publish_targets || existing.publish_targets || ['ebook_store', 'category_page', 'my_library', 'home_page'],
        store_badge: lp.store_badge || existing.store_badge || 'best_seller',
        badge: lp.store_badge || existing.badge || 'best_seller',
        isComingSoon: (lp.is_coming_soon === true || lp.is_coming_soon === 'true' || (lp.is_coming_soon === undefined && (existing.isComingSoon === true || existing.status === 'coming_soon'))),
        features: hero.features || existing.features || ['120+ रंगीन पेज', '300+ फोटो', 'स्प्रे साइंस', 'Mobile PDF'],
        landingPage: bId === 'BK001' ? '/ebooks/kharif-master-guide-2026.html' : (bId === 'BK002' ? '/ebooks/kheti-dr.html' : `/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`),
        checkoutPage: '/ebooks/checkout.html',
        readerPage: '/ebooks/reader.html'
      });
    });

    // Filter out deleted books and inactive books
    allStoreBooks = Array.from(bookMap.values()).filter(b => {
      const bIdUpper = String(b.id).toUpperCase();
      if (bIdUpper === 'BK001' || bIdUpper === 'BK002') return true; // Always show top 2 agriculture books
      if (deletedIds.includes(bIdUpper)) return false;
      if (b.status === 'draft' || b.status === 'inactive') return false;
      if (b.publish_targets && Array.isArray(b.publish_targets)) {
        if (!b.publish_targets.includes('ebook_store')) return false;
      }
      return true;
    });

    // Ensure BK001 and BK002 are in allStoreBooks
    if (!allStoreBooks.some(b => b.id === 'BK001')) {
      allStoreBooks.unshift({
        id: 'BK001',
        heading: 'खरीफ फसल मास्टर गाइड 2026',
        category: 'Agriculture',
        mrp: 299,
        offerPrice: 99,
        cover: '/images/books/kharif-master-guide-2026-cover.webp',
        features: ['120+ रंगीन पेज', '300+ फोटो', 'स्प्रे साइंस', 'Mobile PDF'],
        badge: 'best_seller',
        store_badge: 'best_seller',
        isComingSoon: false,
        landingPage: '/ebooks/kharif-master-guide-2026.html'
      });
    }
    if (!allStoreBooks.some(b => b.id === 'BK002')) {
      allStoreBooks.splice(1, 0, {
        id: 'BK002',
        heading: 'खेती का डॉक्टर (Pocket Doctor)',
        category: 'Agriculture',
        mrp: 299,
        offerPrice: 99,
        cover: '/images/books/fasal-ka-doctor-cover.webp',
        features: ['सटीक रोग पहचान', 'तत्काल स्प्रे फॉर्मूला', 'Mobile Friendly'],
        badge: 'best_seller',
        store_badge: 'best_seller',
        isComingSoon: false,
        landingPage: '/ebooks/kheti-dr.html'
      });
    }

    renderAllStoreShelves();
    renderHeroSlider();
  }

  // -------------------------------------------------------------
  // 2. HERO CAROUSEL SLIDER RENDERER (MULTI-SLIDE AUTO-ROTATING)
  // -------------------------------------------------------------
  let currentSlideIndex = 0;
  let sliderTimer = null;

  function renderHeroSlider() {
    const sliderWrap = document.getElementById('store-hero-slider-wrap');
    if (!sliderWrap) return;

    // 1. Check if page editor custom config exists
    let pageConfig = null;
    try {
      const siteConfig = JSON.parse(localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG') || '[]');
      if (Array.isArray(siteConfig)) {
        pageConfig = siteConfig.find(p => p.slug === 'ebook' || p.id === 'page_ebook_store');
      }
    } catch (e) {}

    let slides = (pageConfig && pageConfig.hero_slides && pageConfig.hero_slides.length > 0) ? pageConfig.hero_slides : null;

    if (!slides || slides.length === 0) {
      slides = [
        {
          image: '/images/books/kharif-master-guide-2026-cover.webp',
          tag: '🌾 BESTSELLER AGRICULTURE EBOOK',
          title: 'खरीफ फसल मास्टर गाइड 2026',
          subtitle: 'धान, सोयाबीन, मक्का की सम्पूर्ण प्रैक्टिकल गाइड — 300+ रंगीन फोटो व स्प्रे साइंस चार्ट!',
          cta_text: '⚡ अभी आर्डर करें - मात्र ₹99',
          cta_link: '/ebooks/kharif-master-guide-2026.html',
          cta_secondary_text: '🛒 कार्ट में जोड़ें',
          cta_secondary_link: '/ebooks/cart.html'
        },
        {
          image: '/images/books/fasal-ka-doctor-cover.webp',
          tag: '🩺 सर्वाधिक बिकने वाली ई-बुक (TOP BESTSELLER)',
          title: 'खेती का डॉक्टर (फसल का डॉक्टर)',
          subtitle: 'किसान का Pocket Doctor 🌾 रोग, कीट, वायरल, फंगल व पोषण कमी की पहचान व तुरंत स्प्रे फॉर्मूला!',
          cta_text: '⚡ अभी आर्डर करें - मात्र ₹99',
          cta_link: '/ebooks/kheti-dr.html',
          cta_secondary_text: '🛒 कार्ट में जोड़ें',
          cta_secondary_link: '/ebooks/cart.html'
        }
      ];
    }

    sliderWrap.innerHTML = `
      <div class="hero-slider-main-container" style="position:relative;overflow:hidden;border-radius:20px;">
        <div id="hero-slider-track" style="display:flex;transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);">
          ${slides.map((s, idx) => `
            <div class="store-hero-slide" style="min-width:100%;box-sizing:border-box;">
              <div class="hero-banner-inner" style="background: linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%); border-radius: 20px; padding: 32px; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 280px;">
                  <span style="background: #eab308; color: #000; font-weight: 900; font-size: 0.75rem; padding: 4px 14px; border-radius: 20px; text-transform: uppercase;">
                    ${s.tag || '🌾 Special Edition'}
                  </span>
                  <h1 style="font-size: 2rem; font-weight: 900; margin: 12px 0 8px 0; color: #ffffff; line-height: 1.25;">
                    ${s.title}
                  </h1>
                  <p style="font-size: 0.95rem; color: #bbf7d0; margin-bottom: 18px; line-height: 1.5;">
                    ${s.subtitle}
                  </p>
                  <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                    <a href="${s.cta_link || '#'}" class="btn" style="background: #eab308; color: #000; font-weight: 900; font-size: 0.95rem; padding: 12px 26px; border-radius: 30px; box-shadow: 0 8px 20px rgba(0,0,0,0.3); text-decoration:none;">
                      ${s.cta_text || '⚡ अभी देखें'}
                    </a>
                    ${s.cta_secondary_text ? `
                      <a href="${s.cta_secondary_link || '#'}" style="font-size: 0.9rem; color: #fde047; font-weight: 800; text-decoration: underline;">
                        ${s.cta_secondary_text}
                      </a>
                    ` : ''}
                    <span style="font-size: 0.85rem; color: #dcfce7; font-weight: 700;">
                      🎁 24×7 WhatsApp AI डॉक्टर सहायता फ्री!
                    </span>
                  </div>
                </div>
                <div style="width: 170px; height: 230px; perspective: 1000px; cursor: pointer;" onclick="window.location.href='${s.cta_link || '#'}'">
                  <img src="${s.image}" alt="${s.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px 14px 14px 8px; box-shadow: -8px 12px 28px rgba(0,0,0,0.4); transform: rotateY(-10deg);" />
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Slider Navigation Indicators / Dots -->
        <div style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;">
          ${slides.map((_, idx) => `
            <button type="button" class="slider-dot-btn" data-slide-index="${idx}" style="width:${idx === 0 ? '24px' : '8px'};height:8px;border-radius:4px;background:${idx === 0 ? '#fde047' : 'rgba(255,255,255,0.4)'};border:none;cursor:pointer;padding:0;transition:all 0.3s;"></button>
          `).join('')}
        </div>
      </div>
    `;

    // Initialize auto-rotation
    if (sliderTimer) clearInterval(sliderTimer);
    if (slides.length > 1) {
      currentSlideIndex = 0;
      sliderTimer = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateSliderPosition(slides.length);
      }, 5000);

      // Bind dots
      sliderWrap.querySelectorAll('.slider-dot-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentSlideIndex = parseInt(e.target.dataset.slideIndex, 10) || 0;
          updateSliderPosition(slides.length);
        });
      });
    }
  }

  function updateSliderPosition(totalSlides) {
    const track = document.getElementById('hero-slider-track');
    if (!track) return;
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

    const dots = document.querySelectorAll('.slider-dot-btn');
    dots.forEach((d, idx) => {
      d.style.width = idx === currentSlideIndex ? '24px' : '8px';
      d.style.background = idx === currentSlideIndex ? '#fde047' : 'rgba(255,255,255,0.4)';
    });
  }

  // -------------------------------------------------------------
  // 3. RENDER ALL SHELVES & INTERSPERSED MARKETING CARDS
  // -------------------------------------------------------------
  function renderAllStoreShelves() {
    renderBestSellersShelf();
    renderInterspersedMarketingCards();
    renderNewArrivalsShelf();
    renderComingSoonShelf();
    renderAllBooksGrid();
  }

  function renderBestSellersShelf() {
    const grid = document.getElementById('bestsellers-grid');
    if (!grid) return;
    const bestSellers = allStoreBooks.filter(b => !b.isComingSoon);
    grid.innerHTML = bestSellers.map(b => window.renderUniversalBookMarketingCard(b)).join('');
  }

  function renderInterspersedMarketingCards() {
    const grid = document.getElementById('interspersed-marketing-grid');
    if (!grid) return;

    // 1. Get from custom page editor marketing cards
    let marketingList = [];
    try {
      const siteConfig = JSON.parse(localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG') || '[]');
      const pageConfig = siteConfig.find(p => p.slug === 'ebook' || p.id === 'page_ebook_store');
      if (pageConfig && pageConfig.marketing_cards && pageConfig.marketing_cards.length > 0) {
        marketingList = pageConfig.marketing_cards;
      }
    } catch (e) {}

    let booksToRender = [];
    if (marketingList.length > 0) {
      booksToRender = marketingList.map(m => {
        const found = allStoreBooks.find(b => b.id === m.book_id) || allStoreBooks[0];
        if (!found) return null;
        return {
          ...found,
          badge: m.tag || 'best_seller',
          heading: m.headline || found.heading,
          subtitle: m.desc || found.subtitle
        };
      }).filter(Boolean);
    }

    if (booksToRender.length === 0) {
      booksToRender = allStoreBooks.slice(0, 3);
    }

    grid.innerHTML = booksToRender.map(b => window.renderUniversalBookMarketingCard(b)).join('');
  }

  function renderNewArrivalsShelf() {
    const grid = document.getElementById('new-arrivals-grid');
    if (!grid) return;
    const newItems = allStoreBooks.filter(b => b.badge === 'new_arrival' || b.badge === 'trending' || b.id === 'BK002' || b.id === 'BK006');
    const displayList = newItems.length > 0 ? newItems : allStoreBooks.slice(0, 4);
    grid.innerHTML = displayList.map(b => window.renderUniversalBookMarketingCard(b)).join('');
  }

  function renderComingSoonShelf() {
    const shelfWrap = document.getElementById('sec-coming-soon-shelf');
    const grid = document.getElementById('coming-soon-grid');
    if (!grid) return;
    const comingSoonBooks = allStoreBooks.filter(b => b.isComingSoon || b.badge === 'coming_soon');
    
    if (comingSoonBooks.length === 0) {
      // Provide high quality default upcoming books for farmer engagement
      const sampleComingSoon = [
        {
          id: 'CS001',
          heading: 'रबी फसल सम्पूर्ण डॉक्टर गाइड 2026',
          category: 'Agriculture',
          mrp: 299,
          offerPrice: 99,
          cover: '/images/books/kharif-master-guide-2026-cover.webp',
          features: ['गेहूं, चना, सरसों गाइड', 'उर्वरक शेड्यूल', 'रोग पहचान'],
          isComingSoon: true,
          badge: 'coming_soon'
        },
        {
          id: 'CS002',
          heading: 'जैविक खाद व प्राकृतिक कीटनाशक फॉर्मूला',
          category: 'Agriculture',
          mrp: 199,
          offerPrice: 79,
          cover: '/images/books/kheti-dr-hero-banner.webp',
          features: ['जीवामृत, बीजामृत विधि', 'घर पर स्प्रे बनाएं', 'कम लागत खेती'],
          isComingSoon: true,
          badge: 'coming_soon'
        }
      ];
      grid.innerHTML = sampleComingSoon.map(b => window.renderUniversalBookMarketingCard(b)).join('');
      if (shelfWrap) shelfWrap.style.display = 'block';
    } else {
      grid.innerHTML = comingSoonBooks.map(b => window.renderUniversalBookMarketingCard(b)).join('');
      if (shelfWrap) shelfWrap.style.display = 'block';
    }
  }

  function renderAllBooksGrid() {
    const grid = document.getElementById('all-books-grid');
    if (!grid) return;

    let filtered = allStoreBooks;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(b => (b.category || '').toLowerCase() === activeCategory.toLowerCase());
    }

    const keyword = (document.getElementById('store-book-search-input')?.value || '').trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(b => 
        (b.heading || b.name || '').toLowerCase().includes(keyword) ||
        (b.subtitle || '').toLowerCase().includes(keyword) ||
        (b.category || '').toLowerCase().includes(keyword)
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #fff; border-radius: 16px; border: 1.5px dashed #cbd5e1;">
          <span style="font-size: 2.5rem;">🔍</span>
          <h3 style="margin: 10px 0 6px 0; color: #1e293b;">कोई पुस्तक नहीं मिली</h3>
          <p style="color: #64748b; font-size: 0.88rem;">कृपया अलग कीवर्ड या कैटेगरी चुनकर पुनः प्रयास करें।</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(b => window.renderUniversalBookMarketingCard(b)).join('');
  }

  // -------------------------------------------------------------
  // 4. CATEGORY QUICK CARDS INTERACTION
  // -------------------------------------------------------------
  function initCategoryTabs() {
    const cards = document.querySelectorAll('.cat-quick-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const cat = card.getAttribute('data-cat') || 'all';
        if (cat === 'external_agri') {
          return; // Let normal navigation to agriculture.html proceed
        }
        e.preventDefault();
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        activeCategory = cat;
        renderAllBooksGrid();
        const targetSec = document.getElementById('sec-all-books-shelf');
        if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // -------------------------------------------------------------
  // 5. LIVE SEARCH FILTER
  // -------------------------------------------------------------
  function initSearchFilter() {
    const input = document.getElementById('store-book-search-input');
    if (!input) return;
    input.addEventListener('input', () => {
      renderAllBooksGrid();
    });
  }

  // -------------------------------------------------------------
  // 6. BREAKING NEWS TICKER
  // -------------------------------------------------------------
  function initBreakingTicker() {
    const textEl = document.getElementById('store-breaking-ticker-text');
    if (!textEl) return;
    const items = [
      '🌾 खरीफ फसल मास्टर गाइड 2026 पर 67% की विशेष छूट!',
      '📲 प्रत्येक ई-बुक के साथ 24×7 WhatsApp AI डॉक्टर सहायता 100% बिल्कुल FREE!',
      '📢 10,000+ प्रगतिशील किसानों का पहला पसंदीदा डिजिटल प्लेटफॉर्म!',
      '⭐ आज आर्डर करने पर VIP Pro 1-वर्षीय मेंबरशिप अनलॉक!'
    ];
    textEl.textContent = items.join('   ✦   ') + '   ✦   ' + items.join('   ✦   ');
  }

  // -------------------------------------------------------------
  // 7. USER AUTH HEADER SYNCHRONIZATION
  // -------------------------------------------------------------
  function initUserAuthHeader() {
    try {
      const rawUser = localStorage.getItem('aarogyam_user') || localStorage.getItem('CURRENT_USER') || localStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      const userBox = document.getElementById('header-user-profile-box');
      if (userBox && user) {
        const name = user.name || user.fullName || user.phone || 'किसान मित्र';
        userBox.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.2);padding:5px 12px;border-radius:20px;color:#fff;font-weight:700;font-size:0.82rem;">
            <span>👤 ${name}</span>
            <a href="/pages/profile.html" style="color:#fff;text-decoration:underline;font-size:0.75rem;">प्रोफ़ाइल</a>
          </div>
        `;
      }
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // 8. COMING SOON INTEREST MODAL
  // -------------------------------------------------------------
  function initComingSoonModal() {
    window.openComingSoonModal = function (bId, title) {
      const phone = prompt(`🔔 '${title}' के लॉन्च होते ही WhatsApp पर सूचना पाने के लिए अपना 10-अंकों का मोबाइल नंबर दर्ज करें:`);
      if (phone && phone.trim().length >= 10) {
        window.AarogyamWishlist.showToast('✅ आपका नंबर दर्ज कर लिया गया है। लॉन्च होते ही आपको सूचित किया जाएगा!', 'success');
      }
    };
  }

})();
