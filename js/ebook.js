/**
 * ====================================================================
 * AAROGYAM INDIA - EBOOK STOREFRONT ENGINE (AMAZON / KINDLE STYLE)
 * Version: 5.0 (Dual Interactive Filters, Non-Duplicate Grid & Custom Combo Maker)
 * ====================================================================
 */

'use strict';

(function () {
  let allStoreBooks = [];
  let activeCategory = 'all';
  let activeStatus = 'live';
  let selectedComboBooks = [];

  document.addEventListener('DOMContentLoaded', () => {
    initStoreData();
    initBreakingTicker();
    initSearchFilter();
    initDualFilterBars();
    initCustomComboMaker();
  });

  // -------------------------------------------------------------
  // 1. DATA LOADER & NORMALIZATION (ZERO DUPLICATION)
  // -------------------------------------------------------------
  async function initStoreData() {
    let jsonBooks = [];
    let landingPages = [];

    try {
      const cacheBust = Date.now();
      const [resBooks, resLp] = await Promise.all([
        fetch('/data/books.json?v=' + cacheBust).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/data/universal-book-landing-pages.json?v=' + cacheBust).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      jsonBooks = Array.isArray(resBooks) ? resBooks : (resBooks.books || []);
      landingPages = Array.isArray(resLp) ? resLp : (resLp.bookLandingPages || []);
    } catch (e) {}

    // Merge LocalStorage custom books
    let customBooks = [];
    let customLp = [];
    let freeDemoBooks = [];
    let deletedIds = [];
    try {
      customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
      customLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
      freeDemoBooks = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
      deletedIds = JSON.parse(localStorage.getItem('AAROGYAM_DELETED_LANDING_PAGES') || '[]');
    } catch (e) {}

    // Build unique book map
    const bookMap = new Map();

    // 1. Primary from books.json
    jsonBooks.forEach(b => {
      if (b && b.id) bookMap.set(b.id.toUpperCase(), b);
    });

    // 2. Overlay from custom books & free demo studio
    customBooks.forEach(b => {
      if (b && b.id) bookMap.set(b.id.toUpperCase(), Object.assign({}, bookMap.get(b.id.toUpperCase()) || {}, b));
    });
    freeDemoBooks.forEach(b => {
      if (b && b.id) bookMap.set(b.id.toUpperCase(), Object.assign({}, bookMap.get(b.id.toUpperCase()) || {}, b));
    });

    // 3. Overlay from Landing Pages (both static and custom)
    const lpMap = new Map();
    landingPages.forEach(lp => { if (lp && lp.id) lpMap.set(lp.id.toUpperCase(), lp); });
    customLp.forEach(lp => {
      if (!lp || !lp.id) return;
      const key = lp.id.toUpperCase();
      const existing = lpMap.get(key);
      if (!existing) {
        lpMap.set(key, lp);
      } else {
        const jsonTime = new Date(existing.updated_at || 0).getTime();
        const localTime = new Date(lp.updated_at || 0).getTime();
        if (localTime > jsonTime) lpMap.set(key, lp);
      }
    });

    Array.from(lpMap.values()).forEach(lp => {
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
        isComingSoon: (lp.is_coming_soon === true || lp.is_coming_soon === 'true' || lp.status === 'coming_soon' || lp.store_badge === 'coming_soon' || (lp.is_coming_soon === undefined && (existing.isComingSoon === true || existing.is_coming_soon === true || existing.status === 'coming_soon' || existing.badge === 'coming_soon' || existing.store_badge === 'coming_soon'))),
        features: hero.features || existing.features || ['120+ रंगीन पेज', '300+ फोटो', 'स्प्रे साइंस', 'Mobile PDF'],
        landingPage: bId === 'BK001' ? '/ebooks/kharif-master-guide-2026.html' : (bId === 'BK002' ? '/ebooks/kheti-dr.html' : `/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`),
        checkoutPage: '/ebooks/checkout.html',
        readerPage: '/ebooks/reader.html'
      });
    });

    // Filter out deleted books
    allStoreBooks = Array.from(bookMap.values()).filter(b => {
      const bIdUpper = String(b.id).toUpperCase();
      if (bIdUpper === 'BK001' || bIdUpper === 'BK002') return true;
      if (deletedIds.includes(bIdUpper)) return false;
      // DEMO BOOK SECURITY RULE: Demo books NEVER appear in eBook Store trays/catalog
      if (bIdUpper.startsWith('DEMO') || b.book_type === 'demo' || b.type === 'demo') return false;
      if (b.publish_targets && Array.isArray(b.publish_targets) && !b.publish_targets.includes('ebook_store')) return false;
      if (b.status === 'draft' || b.status === 'inactive') return false;
      return true;
    });

    // Ensure Top 2 books exist
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

    renderUnifiedBooksGrid();
    renderCustomComboChecklist();
  }

  // -------------------------------------------------------------
  // 2. UNIFIED NON-DUPLICATE BOOKSHELF RENDERER
  // -------------------------------------------------------------
  function renderUnifiedBooksGrid() {
    const grid = document.getElementById('store-books-unified-grid');
    const countBadge = document.getElementById('filtered-count');
    if (!grid) return;

    let filtered = [...allStoreBooks];

    // Filter 1: Category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(b => {
        const cat = (b.category || '').toLowerCase();
        if (activeCategory === 'agriculture') return cat.includes('agri') || cat.includes('कृषि');
        if (activeCategory === 'health') return cat.includes('health') || cat.includes('स्वास्थ्य');
        if (activeCategory === 'business') return cat.includes('business') || cat.includes('व्यवसाय') || cat.includes('selling');
        if (activeCategory === 'netsurf') return cat.includes('netsurf') || cat.includes('direct');
        if (activeCategory === 'digital-ai') return cat.includes('digital') || cat.includes('ai');
        return cat === activeCategory.toLowerCase();
      });
    }

    // Filter 2: Status
    if (activeStatus !== 'all') {
      filtered = filtered.filter(b => {
        if (activeStatus === 'bestseller') return b.store_badge === 'best_seller' || b.badge === 'best_seller' || b.id === 'BK001' || b.id === 'BK002';
        if (activeStatus === 'live') return !b.isComingSoon;
        if (activeStatus === 'free_demo') return b.hasAudioDemo || b.audio_files || b.id === 'BK001' || b.id === 'BK002';
        if (activeStatus === 'free') return b.offerPrice === 0 || b.isFree === true || b.mrp === 0;
        if (activeStatus === 'coming_soon') return b.isComingSoon || b.badge === 'coming_soon';
        return true;
      });
    }

    // Filter 3: Search Query
    const searchVal = (document.getElementById('store-book-search-input')?.value || '').trim().toLowerCase();
    if (searchVal) {
      filtered = filtered.filter(b => {
        const title = (b.heading || b.name || '').toLowerCase();
        const sub = (b.subtitle || '').toLowerCase();
        const cat = (b.category || '').toLowerCase();
        return title.includes(searchVal) || sub.includes(searchVal) || cat.includes(searchVal);
      });
    }

    if (countBadge) countBadge.textContent = filtered.length;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #ffffff; border-radius: 20px; border: 1.5px dashed #cbd5e1;">
          <span style="font-size: 2.8rem;">🔍</span>
          <h3 style="margin: 14px 0 6px 0; color: #1e293b; font-size: 1.25rem;">कोई ई-बुक नहीं मिली</h3>
          <p style="color: #64748b; font-size: 0.9rem;">कृपया अलग कैटेगरी चुनें या अन्य कीवर्ड टाइप करके देखें।</p>
          <button type="button" onclick="window.resetStoreFilters()" class="btn" style="margin-top:14px; background:#0f172a; color:#fde047; font-weight:800; padding:8px 20px; border-radius:20px;">
            सारे फिल्टर्स रीसेट करें
          </button>
        </div>
      `;
      return;
    }

    // Deduplicate by ID just in case
    const renderedIds = new Set();
    const uniqueList = [];
    filtered.forEach(b => {
      const bId = String(b.id).toUpperCase();
      if (!renderedIds.has(bId)) {
        renderedIds.add(bId);
        uniqueList.push(b);
      }
    });

    grid.innerHTML = uniqueList.map(b => window.renderUniversalBookMarketingCard(b)).join('');
  }

  // -------------------------------------------------------------
  // 3. DUAL FILTER BARS CONTROLLER
  // -------------------------------------------------------------
  window.selectEbookCategory = function (category, el) {
    activeCategory = (activeCategory === category) ? 'all' : category;
    document.querySelectorAll('#ebookCategoryKpiGrid .cat-kpi-card').forEach(card => {
      const c = card.getAttribute('data-category');
      if (c === activeCategory) {
        card.classList.add('active');
        card.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
        card.style.borderColor = '#86efac';
        card.style.boxShadow = '0 4px 14px rgba(22,163,74,0.18)';
      } else {
        card.classList.remove('active');
        card.style.background = '#ffffff';
        card.style.borderColor = '#e2e8f0';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      }
    });
    renderUnifiedBooksGrid();
  };

  window.setStoreStatusFilter = function (status, el) {
    activeStatus = status;
    document.querySelectorAll('#statusChipsTrack .status-chip').forEach(chip => {
      chip.classList.remove('active');
      chip.style.background = '#ffffff';
      chip.style.color = '#334155';
      chip.style.borderColor = '#cbd5e1';
    });
    if (el) {
      el.classList.add('active');
      el.style.background = '#0f172a';
      el.style.color = '#fde047';
      el.style.borderColor = '#0f172a';
    }
    renderUnifiedBooksGrid();
  };

  function initDualFilterBars() {
    window.resetStoreFilters = function () {
      activeCategory = 'all';
      activeStatus = 'live';
      document.querySelectorAll('#ebookCategoryKpiGrid .cat-kpi-card').forEach(card => {
        card.classList.remove('active');
        card.style.background = '#ffffff';
        card.style.borderColor = '#e2e8f0';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      });
      document.querySelectorAll('#statusChipsTrack .status-chip').forEach(c => {
        const isLive = c.getAttribute('data-status') === 'live';
        c.classList.toggle('active', isLive);
        c.style.background = isLive ? '#0f172a' : '#ffffff';
        c.style.color = isLive ? '#fde047' : '#334155';
        c.style.borderColor = isLive ? '#0f172a' : '#cbd5e1';
      });
      const search = document.getElementById('store-book-search-input');
      if (search) search.value = '';
      renderUnifiedBooksGrid();
    };
  }

  // -------------------------------------------------------------
  // 4. LIVE SEARCH FILTER
  // -------------------------------------------------------------
  function initSearchFilter() {
    const input = document.getElementById('store-book-search-input');
    if (!input) return;
    input.addEventListener('input', () => {
      renderUnifiedBooksGrid();
    });
  }

  // -------------------------------------------------------------
  // 5. CUSTOM COMBO MAKER ENGINE (BK001, BK002, BK015)
  // -------------------------------------------------------------
  function initCustomComboMaker() {
    selectedComboBooks = ['BK001', 'BK002', 'BK015'];
    updateComboCalculationUI();
  }

  function renderCustomComboChecklist() {
    const selectorGrid = document.getElementById('combo-books-selector-grid');
    if (!selectorGrid) return;

    // Guaranteed 3 books combo: BK001, BK002, BK015
    const comboSourceIds = ['BK001', 'BK002', 'BK015'];
    const comboBooks = comboSourceIds.map(id => {
      let b = allStoreBooks.find(item => String(item.id).toUpperCase() === id);
      if (!b) {
        if (id === 'BK001') {
          b = { id: 'BK001', heading: 'खरीफ फसल मास्टर गाइड 2026', mrp: 299, offerPrice: 99, cover: '/images/books/kharif-master-guide-2026-cover.webp', category: 'Agriculture' };
        } else if (id === 'BK002') {
          b = { id: 'BK002', heading: 'खेती का डॉक्टर (Pocket Doctor)', mrp: 299, offerPrice: 99, cover: '/images/books/fasal-ka-doctor-cover.webp', category: 'Agriculture' };
        } else if (id === 'BK015') {
          b = { id: 'BK015', heading: 'सब्जी खेती मास्टर गाइड (भाग 1)', mrp: 299, offerPrice: 99, cover: '/images/books/kharif-master-guide-2026-cover.webp', category: 'Agriculture' };
        }
      }
      return b;
    }).filter(Boolean);

    selectorGrid.innerHTML = comboBooks.map(b => {
      const bId = String(b.id).toUpperCase();
      const isSelected = selectedComboBooks.includes(bId);
      const title = b.heading || b.name || bId;
      const cover = b.cover || b.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp';
      const cat = b.category || 'Agriculture';

      return `
        <div class="combo-book-item ${isSelected ? 'selected' : ''}" onclick="window.toggleComboBookSelection('${bId}')" id="combo-item-${bId}">
          <input type="checkbox" ${isSelected ? 'checked' : ''} style="width:18px; height:18px; accent-color:#22c55e; pointer-events:none;">
          <img src="${cover}" alt="${title}" style="width:40px; height:54px; object-fit:cover; border-radius:4px; box-shadow:0 2px 6px rgba(0,0,0,0.4);">
          <div style="flex:1; overflow:hidden;">
            <div style="font-size:0.88rem; font-weight:800; color:#ffffff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${title}
            </div>
            <div style="font-size:0.75rem; color:#94a3b8;">${cat} • <s>₹${b.mrp || 299}</s> <span style="color:#86efac;font-weight:800;">₹${b.offerPrice || 99}</span></div>
          </div>
        </div>
      `;
    }).join('');

    updateComboCalculationUI();
  }

  window.toggleComboBookSelection = function (bookId) {
    const bId = String(bookId).toUpperCase();
    const index = selectedComboBooks.indexOf(bId);

    if (index >= 0) {
      selectedComboBooks.splice(index, 1);
    } else {
      if (selectedComboBooks.length >= 3) {
        if (window.AarogyamWishlist && window.AarogyamWishlist.showToast) {
          window.AarogyamWishlist.showToast('⚠️ आप कॉम्बो में अधिकतम 3 पुस्तकें ही चुन सकते हैं!', 'info');
        } else {
          alert('आप कॉम्बो में अधिकतम 3 पुस्तकें ही चुन सकते हैं!');
        }
        return;
      }
      selectedComboBooks.push(bId);
    }

    // Update checkbox & class
    const el = document.getElementById(`combo-item-${bId}`);
    if (el) {
      const isSel = selectedComboBooks.includes(bId);
      el.classList.toggle('selected', isSel);
      const chk = el.querySelector('input[type="checkbox"]');
      if (chk) chk.checked = isSel;
    }

    updateComboCalculationUI();
  };

  function updateComboCalculationUI() {
    const countEl = document.getElementById('combo-selected-count');
    const priceEl = document.getElementById('combo-calculated-price');
    const savingsEl = document.getElementById('combo-savings-text');
    const checkoutBtn = document.getElementById('combo-checkout-btn');

    const count = selectedComboBooks.length;
    if (countEl) countEl.textContent = count;

    let price = 0;
    let savingsText = '';
    let btnActive = false;

    if (count === 0) {
      price = 0;
      savingsText = 'कृपया कम से कम 1 या 2 पुस्तकें चुनें';
      btnActive = false;
    } else if (count === 1) {
      price = 99;
      savingsText = '💡 1 और पुस्तक जोड़ें और ₹179 में 2 किताबें पाएं (बचत ₹19)!';
      btnActive = true;
    } else if (count === 2) {
      price = 179;
      savingsText = '🎉 2-पुस्तक कॉम्बो एक्टिव! कुल बचत ₹19 (मूल्य ₹198 → मात्र ₹179)! 1 और जोड़कर ₹249 में पाएं!';
      btnActive = true;
    } else if (count === 3) {
      price = 249;
      savingsText = '🔥 3-पुस्तक सुपर कॉम्बो एक्टिव! कुल बचत ₹48 + 1-वर्ष Pro VIP AI पास बिल्कुल FREE!';
      btnActive = true;
    }

    if (priceEl) priceEl.textContent = `कुल मूल्य: ₹${price}`;
    if (savingsEl) savingsEl.textContent = savingsText;

    if (checkoutBtn) {
      if (btnActive) {
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.pointerEvents = 'auto';
      } else {
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.pointerEvents = 'none';
      }
    }
  }

  window.proceedCustomComboCheckout = function () {
    if (selectedComboBooks.length === 0) return;
    const count = selectedComboBooks.length;
    const booksParam = selectedComboBooks.join(',');
    let comboType = count === 3 ? 'combo3' : (count === 2 ? 'combo2' : 'single');
    window.location.href = `/ebooks/checkout.html?combo=${comboType}&books=${encodeURIComponent(booksParam)}`;
  };

  // -------------------------------------------------------------
  // 6. LIVE TICKER
  // -------------------------------------------------------------
  function initBreakingTicker() {
    const textEl = document.getElementById('home-live-ticker-track');
    if (!textEl) return;
    const items = [
      '🌾 खरीफ फसल मास्टर गाइड 2026 पर 67% की विशेष छूट!',
      '🎯 कस्टम कॉम्बो ऑफर: कोई भी 2 पुस्तकें मात्र ₹179 और 3 पुस्तकें ₹249!',
      '📲 प्रत्येक ई-बुक के साथ 24×7 WhatsApp AI डॉक्टर सहायता 100% बिल्कुल FREE!',
      '⭐ 10,000+ प्रगतिशील किसानों का पहला पसंदीदा डिजिटल प्लेटफॉर्म!'
    ];
    textEl.textContent = items.join('   ✦   ') + '   ✦   ' + items.join('   ✦   ');
  }

})();
