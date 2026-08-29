/**
 * ====================================================================
 * AAROGYAM INDIA - AGRICULTURE HUB (AMAZON / KINDLE EDITION)
 * Version: 2.0 (Dynamic Agriculture Books, 2-Book Combos, Wishlist & Cart)
 * ====================================================================
 */

'use strict';

(function () {
  let agriBooks = [];

  document.addEventListener('DOMContentLoaded', () => {
    initAgriStoreData();
    initAgriSearch();
  });

  async function initAgriStoreData() {
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

    let customBooks = [];
    let customLp = [];
    let deletedIds = [];
    try {
      customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      customLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
      deletedIds = JSON.parse(localStorage.getItem('AAROGYAM_DELETED_LANDING_PAGES') || '[]');
    } catch (e) {}

    const bookMap = new Map();

    jsonBooks.forEach(b => {
      if (b && b.id && (b.category || 'Agriculture').toLowerCase() === 'agriculture') {
        bookMap.set(b.id.toUpperCase(), b);
      }
    });

    customBooks.forEach(b => {
      if (b && b.id && (b.category || 'Agriculture').toLowerCase() === 'agriculture') {
        bookMap.set(b.id.toUpperCase(), Object.assign({}, bookMap.get(b.id.toUpperCase()) || {}, b));
      }
    });

    [...landingPages, ...customLp].forEach(lp => {
      if (!lp || !lp.id) return;
      if ((lp.category || 'Agriculture').toLowerCase() !== 'agriculture') return;
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
        category: 'Agriculture',
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
        isComingSoon: (bId !== 'BK001' && bId !== 'BK002') || lp.is_coming_soon === true || existing.isComingSoon === true || existing.status === 'coming_soon',
        features: hero.features || existing.features || ['120+ रंगीन पेज', '300+ फोटो', 'स्प्रे साइंस', 'Mobile PDF'],
        landingPage: bId === 'BK001' ? '/ebooks/kharif-master-guide-2026.html' : (bId === 'BK002' ? '/ebooks/kheti-dr.html' : `/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`),
        checkoutPage: '/ebooks/checkout.html',
        readerPage: '/ebooks/reader.html'
      });
    });

    agriBooks = Array.from(bookMap.values()).filter(b => {
      const bIdUpper = String(b.id).toUpperCase();
      if (bIdUpper === 'BK001' || bIdUpper === 'BK002') return true; // Always show top 2 agriculture books
      if (deletedIds.includes(bIdUpper)) return false;
      if (b.status === 'draft' || b.status === 'inactive') return false;
      if (b.publish_targets && Array.isArray(b.publish_targets)) {
        if (!b.publish_targets.includes('category_page')) return false;
      }
      return true;
    });

    if (!agriBooks.some(b => b.id === 'BK001')) {
      agriBooks.unshift({
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
    if (!agriBooks.some(b => b.id === 'BK002')) {
      agriBooks.splice(1, 0, {
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

    renderAgriHeroSlider();
    renderAgriBooks();
    renderAgriInterspersedMarketing();
    renderAgriCombo();
  }

  // -------------------------------------------------------------
  // HERO SLIDER FOR AGRICULTURE
  // -------------------------------------------------------------
  let agriSlideIndex = 0;
  let agriSliderTimer = null;

  function renderAgriHeroSlider() {
    const sliderWrap = document.getElementById('agri-hero-slider-wrap');
    if (!sliderWrap) return;

    let pageConfig = null;
    try {
      const siteConfig = JSON.parse(localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG') || '[]');
      if (Array.isArray(siteConfig)) {
        pageConfig = siteConfig.find(p => p.slug === 'agriculture' || p.id === 'page_agriculture');
      }
    } catch (e) {}

    let slides = (pageConfig && pageConfig.hero_slides && pageConfig.hero_slides.length > 0) ? pageConfig.hero_slides : null;

    if (!slides || slides.length === 0) {
      slides = [
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
      ];
    }

    sliderWrap.innerHTML = `
      <div class="hero-slider-main-container" style="position:relative;overflow:hidden;border-radius:20px;">
        <div id="agri-slider-track" style="display:flex;transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);">
          ${slides.map((s, idx) => `
            <div class="store-hero-slide" style="min-width:100%;box-sizing:border-box;">
              <div class="hero-banner-inner" style="background: linear-gradient(135deg, #14532d 0%, #15803d 70%, #166534 100%); border-radius: 20px; padding: 30px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px;">
                  <span style="background: #eab308; color: #000; font-weight: 800; font-size: 0.75rem; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">
                    ${s.tag || '🌾 AGRICULTURE HUB'}
                  </span>
                  <h1 style="font-size: 2rem; font-weight: 900; margin: 12px 0 8px 0; color: #ffffff;">
                    ${s.title}
                  </h1>
                  <p style="color: #dcfce7; font-size: 0.92rem; line-height: 1.5; margin-bottom: 16px;">
                    ${s.subtitle}
                  </p>
                  <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                    <a href="${s.cta_link || '#'}" style="background:#eab308;color:#000;font-weight:900;padding:10px 22px;border-radius:25px;text-decoration:none;font-size:0.9rem;">
                      ${s.cta_text || '📖 देखें'}
                    </a>
                    ${s.cta_secondary_text ? `
                      <a href="${s.cta_secondary_link || '#'}" style="color:#fde047;font-weight:800;font-size:0.88rem;text-decoration:underline;">
                        ${s.cta_secondary_text}
                      </a>
                    ` : ''}
                  </div>
                </div>
                <div style="width: 140px; height: 190px; perspective: 1000px; cursor: pointer;" onclick="window.location.href='${s.cta_link || '#'}'">
                  <img src="${s.image}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;box-shadow:-6px 10px 24px rgba(0,0,0,0.4);transform:rotateY(-12deg);" />
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (slides.length > 1) {
      if (agriSliderTimer) clearInterval(agriSliderTimer);
      agriSlideIndex = 0;
      agriSliderTimer = setInterval(() => {
        agriSlideIndex = (agriSlideIndex + 1) % slides.length;
        const track = document.getElementById('agri-slider-track');
        if (track) track.style.transform = `translateX(-${agriSlideIndex * 100}%)`;
      }, 5000);
    }
  }

  function renderAgriInterspersedMarketing() {
    const grid = document.getElementById('agri-interspersed-marketing-grid');
    if (!grid) return;

    let marketingList = [];
    try {
      const siteConfig = JSON.parse(localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG') || '[]');
      const pageConfig = siteConfig.find(p => p.slug === 'agriculture' || p.id === 'page_agriculture');
      if (pageConfig && pageConfig.marketing_cards && pageConfig.marketing_cards.length > 0) {
        marketingList = pageConfig.marketing_cards;
      }
    } catch (e) {}

    let booksToRender = [];
    if (marketingList.length > 0) {
      booksToRender = marketingList.map(m => {
        const found = agriBooks.find(b => b.id === m.book_id) || agriBooks[0];
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
      booksToRender = agriBooks.slice(0, 2);
    }

    grid.innerHTML = booksToRender.map(b => window.renderUniversalBookMarketingCard(b)).join('');
  }

  function renderAgriBooks() {
    const grid = document.getElementById('agri-books-grid');
    if (!grid) return;

    const keyword = (document.getElementById('agri-search-input')?.value || '').trim().toLowerCase();
    let filtered = agriBooks;
    if (keyword) {
      filtered = filtered.filter(b => 
        (b.heading || b.name || '').toLowerCase().includes(keyword) ||
        (b.subtitle || '').toLowerCase().includes(keyword) ||
        (b.description || '').toLowerCase().includes(keyword)
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fff; border-radius: 16px; border: 1.5px dashed #cbd5e1;">
          <span style="font-size: 2.5rem;">🌾</span>
          <h3 style="margin: 10px 0 6px 0; color: #1e293b;">कोई कृषि पुस्तक नहीं मिली</h3>
          <p style="color: #64748b; font-size: 0.88rem;">कृपया अलग शब्द खोजकर देखें।</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(b => window.renderUniversalBookMarketingCard(b)).join('');
  }

  function renderAgriCombo() {
    const comboWrap = document.getElementById('agri-combo-box');
    if (!comboWrap) return;
    const b1 = agriBooks.find(b => b.id === 'BK001') || agriBooks[0];
    const b2 = agriBooks.find(b => b.id === 'BK002') || agriBooks[1] || agriBooks[0];
    if (!b1 || !b2) return;

    const comboTotal = (b1.offerPrice || 99) + (b2.offerPrice || 99);
    const comboMrp = (b1.mrp || 299) + (b2.mrp || 299);

    comboWrap.innerHTML = `
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #86efac; border-radius: 20px; padding: 24px; box-shadow: 0 10px 25px rgba(22,163,74,0.12);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <span style="background: #16a34a; color: #fff; font-weight: 800; font-size: 0.75rem; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">
              🔥 BESTSELLER 2-BOOK COMBO
            </span>
            <h3 style="font-size: 1.35rem; font-weight: 900; color: #14532d; margin-top: 6px;">
              साथ में ये दोनों पुस्तकें खरीदें और पाएं अतिरिक्त लाभ!
            </h3>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.6rem; font-weight: 900; color: #15803d;">₹${comboTotal}</div>
            <div style="font-size: 0.85rem; color: #94a3b8; text-decoration: line-through;">₹${comboMrp}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
          <div style="text-align: center; width: 120px;">
            <img src="${b1.cover}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.15);" />
            <strong style="font-size: 0.78rem; display: block; margin-top: 6px; color: #1e293b;">${b1.heading || b1.name}</strong>
          </div>
          <span style="font-size: 1.8rem; font-weight: 900; color: #16a34a;">+</span>
          <div style="text-align: center; width: 120px;">
            <img src="${b2.cover}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.15);" />
            <strong style="font-size: 0.78rem; display: block; margin-top: 6px; color: #1e293b;">${b2.heading || b2.name}</strong>
          </div>
        </div>

        <div style="text-align: center;">
          <button 
            type="button" 
            onclick="window.addBothAgriBooksToCart('${b1.id}', '${b2.id}')"
            style="background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; font-weight: 800; font-size: 0.95rem; padding: 12px 32px; border-radius: 30px; border: none; cursor: pointer; box-shadow: 0 8px 20px rgba(22,163,74,0.3);"
          >
            🛒 दोनों पुस्तकें एक साथ कार्ट में जोड़ें (₹${comboTotal})
          </button>
        </div>
      </div>
    `;
  }

  window.addBothAgriBooksToCart = function (id1, id2) {
    const b1 = agriBooks.find(b => b.id === id1);
    const b2 = agriBooks.find(b => b.id === id2);
    if (b1) window.AarogyamCart.addBook(b1);
    if (b2) window.AarogyamCart.addBook(b2);
    window.AarogyamWishlist.showToast('🛒 2-बुक कॉम्बो कार्ट में सफलतापूर्वक जोड़ दिया गया!', 'success');
  };

  function initAgriSearch() {
    const input = document.getElementById('agri-search-input');
    if (!input) return;
    input.addEventListener('input', () => {
      renderAgriBooks();
    });
  }

  window.openComingSoonModal = function (bId, title) {
    const phone = prompt(`🔔 '${title}' के लॉन्च होते ही WhatsApp पर सूचना पाने के लिए अपना 10-अंकों का मोबाइल नंबर दर्ज करें:`);
    if (phone && phone.trim().length >= 10) {
      window.AarogyamWishlist.showToast('✅ आपका नंबर दर्ज कर लिया गया है। लॉन्च होते ही आपको सूचित किया जाएगा!', 'success');
    }
  };
})();