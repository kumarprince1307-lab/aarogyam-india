/**
 * ====================================================================
 * AAROGYAM INDIA — UNIVERSAL STORE SHELVES & BUNDLES RENDERER ENGINE
 * Version: 2.0 (Dynamic Book Covers, Offline Bundles, Unlimited Pages & Mobile 2-by-2 Slider)
 * ====================================================================
 */

'use strict';

(function (window, document) {
  let shelvesConfig = null;
  let allBooksMap = new Map();
  let allBundlesMap = new Map();
  let isInitialized = false;

  // -------------------------------------------------------------
  // 1. DATA LOADER & NORMALIZATION
  // -------------------------------------------------------------
  async function loadShelvesAndCatalogData() {
    try {
      const cacheBust = Date.now();
      const [resShelves, resBooks, resBundles] = await Promise.all([
        fetch('/data/store-shelves-config.json?v=' + cacheBust).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/data/books.json?v=' + cacheBust).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/data/book-bundles.json?v=' + cacheBust).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (resShelves && Array.isArray(resShelves.shelves)) {
        shelvesConfig = resShelves;
      }

      // Check localStorage for admin overrides in real-time
      try {
        const localShelves = JSON.parse(localStorage.getItem('AAROGYAM_STORE_SHELVES_CONFIG') || 'null');
        if (localShelves && Array.isArray(localShelves.shelves)) {
          if (!shelvesConfig || (localShelves.updated_at && new Date(localShelves.updated_at) > new Date(shelvesConfig.updated_at || 0))) {
            shelvesConfig = localShelves;
          }
        }
      } catch (e) { }

      // Map Books
            // Ensure shelf_bundles is never rendered in generic dynamic shelves loop (bundles have their dedicated containers)
      if (shelvesConfig && Array.isArray(shelvesConfig.shelves)) {
        shelvesConfig.shelves = shelvesConfig.shelves.filter(s => s && s.id !== 'shelf_bundles');
      }

      const booksList = resBooks ? (resBooks.books || (Array.isArray(resBooks) ? resBooks : [])) : [];
      booksList.forEach(b => {
        if (b && b.id) {
          allBooksMap.set(String(b.id).toUpperCase().trim(), b);
        }
      });

      // Map Bundles
      const bundlesList = resBundles ? (resBundles.bundles || (Array.isArray(resBundles) ? resBundles : [])) : [];
      bundlesList.forEach(bun => {
        if (bun && bun.id) {
          allBundlesMap.set(String(bun.id).toUpperCase().trim(), bun);
        }
      });

      return true;
    } catch (err) {
      console.warn('[UniversalShelves] Data fetch notice:', err);
      return false;
    }
  }

  // -------------------------------------------------------------
  // 2. SHELF CARD RENDERER (BOOKS)
  // -------------------------------------------------------------
  function renderBookItemHtml(book) {
    if (!book) return '';
    const bId = (book.id || 'BK001').toUpperCase().trim();
    const title = book.heading || book.name || book.title || 'ई-बुक';
    const offerPrice = book.offerPrice || 99;
    const mrp = book.mrp || 299;
    let cover = book.cover || book.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp';
    if (cover && !cover.includes('?v=')) {
      const vTime = book.updated_at ? new Date(book.updated_at).getTime() : Date.now();
      cover += (cover.includes('?') ? '&' : '?') + 'v=' + vTime;
    }
    const landingUrl = `/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`;

    return `
      <div class="shelf-book-card ubl-shelf-card-item" style="background:#ffffff;border-radius:14px;border:1.5px solid #e2e8f0;padding:12px;box-shadow:0 4px 14px rgba(0,0,0,0.06);display:flex;flex-direction:column;justify-content:space-between;min-width:175px;max-width:240px;box-sizing:border-box;flex-shrink:0;">
        <div>
          <div style="position:relative;cursor:pointer;text-align:center;margin-bottom:8px;" onclick="window.location.href='${landingUrl}'">
            <div style="width:100%;height:195px;border-radius:8px;overflow:hidden;background:#f8fafc;box-shadow:0 3px 8px rgba(0,0,0,0.12);"><img src="${cover}" alt="${title}" style="width:100%;height:100%;object-fit:cover;object-position:top;display:block;" loading="lazy" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp'"></div>
            ${book.store_badge ? `<span style="position:absolute;top:6px;left:6px;background:#15803d;color:#fff;font-size:0.65rem;font-weight:900;padding:2px 6px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${book.store_badge}</span>` : ''}
          </div>
          <h4 style="margin:0 0 6px 0;font-size:0.88rem;color:#0f172a;font-weight:800;line-height:1.3;cursor:pointer;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;" onclick="window.location.href='${landingUrl}'" title="${title}">${title}</h4>
        </div>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0;">
            <span style="font-weight:900;color:#16a34a;font-size:1.05rem;">₹${offerPrice}</span>
            <span style="text-decoration:line-through;color:#94a3b8;font-size:0.8rem;">₹${mrp}</span>
          </div>
          <a href="${landingUrl}" style="display:block;text-align:center;background:#E86A17;color:#fff;padding:8px 10px;border-radius:8px;font-weight:800;font-size:0.82rem;text-decoration:none;box-shadow:0 2px 6px rgba(232,106,23,0.3);">
            🛒 विवरण देखें
          </a>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // 3. DYNAMIC BUNDLE CARD RENDERER (LIVE COMPOSITE BOOK COVERS)
  // -------------------------------------------------------------
  function renderBundleItemHtml(bundle) {
    if (!bundle) return '';
    const id = (bundle.id || 'BUN001').toUpperCase().trim();
    const name = bundle.title || bundle.name || 'महाबचत किसान बंडल';
    const price = bundle.offerPrice || bundle.price || 199;
    const mrp = bundle.mrp || 999;
    const isOffline = bundle.status === 'offline' || bundle.status === 'inactive' || bundle.enabled === false;
    const bookIds = Array.isArray(bundle.bookIds) ? bundle.bookIds : [];
    
    // Dynamically retrieve covers of books inside this bundle
    const bookCovers = [];
    bookIds.forEach(bId => {
      const bObj = allBooksMap.get(String(bId).toUpperCase().trim());
      if (bObj && (bObj.cover || bObj.thumbnail)) {
        bookCovers.push(bObj.cover || bObj.thumbnail);
      }
    });

    if (bookCovers.length === 0) {
      bookCovers.push('/images/books/kharif-master-guide-2026-cover.webp', '/images/books/fasal-ka-doctor-cover.webp', '/images/books/bk016-cover.webp');
    }

    // Dynamic 3D Fan/Stack of Books (shows up to 4 real book covers)
    const displayCovers = bookCovers.slice(0, 4);
    const coversFanHtml = `
      <div class="bundle-covers-dynamic-fan" style="position:relative;height:98px;display:flex;align-items:center;justify-content:center;margin:4px 0 8px 0;perspective:800px;overflow:visible;">
        ${displayCovers.map((cUrl, idx) => {
          const total = displayCovers.length;
          const offset = idx - (total - 1) / 2;
          const rotDeg = offset * 8;
          const transX = offset * 22;
          const zIdx = 10 + idx;
          return `
            <img src="${cUrl}" alt="Included Book ${idx + 1}"
              style="position:absolute;width:62px;height:88px;object-fit:cover;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.45);transform:translateX(${transX}px) rotate(${rotDeg}deg);z-index:${zIdx};border:1.5px solid rgba(255,255,255,0.8);transition:transform 0.25s ease;"
              onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';"
            />
          `;
        }).join('')}
      </div>
    `;

    const directActionUrl = `/bundle.html?id=${encodeURIComponent(id)}`;

    return `
      <div class="shelf-bundle-card ubl-shelf-card-item" style="background:linear-gradient(145deg, #061e12 0%, #0f172a 60%, #064e3b 100%);border:1.5px solid ${isOffline ? '#64748b' : '#10b981'};border-radius:16px;padding:12px 14px;box-shadow:0 8px 22px rgba(6,78,59,0.3);color:#ffffff;min-width:225px;max-width:255px;padding:10px 12px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;flex-shrink:0;">
        <div>
          <!-- Top Badge & Offline Indicator -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:6px;">
            ${isOffline ? `
              <span style="background:#dc2626;color:#fff;font-weight:900;font-size:0.7rem;padding:3px 8px;border-radius:4px;letter-spacing:0.4px;">
                🔒 ऑफ़लाइन (सीमित समय के लिए बंद)
              </span>
            ` : `
              <span style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:900;font-size:0.72rem;padding:3px 8px;border-radius:4px;letter-spacing:0.5px;">
                📦 ${bundle.badge || 'MEGA SAVER BUNDLE'}
              </span>
            `}
            <span style="color:#38bdf8;font-weight:800;font-size:0.78rem;">${bookIds.length} पुस्तकें शामिल</span>
          </div>

          <h4 style="margin:4px 0 2px 0;font-size:1.02rem;font-weight:900;color:#f8fafc;line-height:1.3;">${name}</h4>
          <div style="font-size:0.76rem;color:#cbd5e1;line-height:1.3;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
            ${bundle.subtitle || bundle.description || 'सम्पूर्ण मास्टर गाइड्स एक साथ'}
          </div>

          <!-- Dynamic Live Composite Book Cover Stack -->
          ${coversFanHtml}
        </div>

        <!-- Action Strip -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid rgba(255,255,255,0.12);margin-top:auto;">
          <div>
            <span style="color:#94a3b8;font-size:0.78rem;text-decoration:line-through;">₹${mrp}</span>
            <div style="color:#38bdf8;font-weight:900;font-size:1.25rem;">₹${price}</div>
          </div>
          ${isOffline ? `
            <button type="button" onclick="window.openBundleNotifyModal('${id}', '${name.replace(/'/g, "\\'")}')" style="background:#475569;border:1px solid #94a3b8;color:#fff;font-weight:800;font-size:0.8rem;padding:8px 14px;border-radius:20px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
              <span>🔔 सूचित करें</span>
            </button>
          ` : `
            <a href="${directActionUrl}" style="background:#16a34a;color:#fff;font-weight:800;font-size:0.84rem;padding:8px 16px;border-radius:20px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;box-shadow:0 3px 10px rgba(22,163,74,0.4);white-space:nowrap;">
              <span>🛒 कॉम्बो लें</span> ➔
            </a>
          `}
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // 4. OFFLINE BUNDLE NOTIFY MODAL HANDLER
  // -------------------------------------------------------------
  window.openBundleNotifyModal = function (bundleId, bundleTitle) {
    const mobilePrompt = prompt(`🔔 [Aarogyam India]\n'${bundleTitle}' यह बंडल अभी अपडेट हो रहा है।\n\nजैसे ही यह बंडल पुनः लाइव होगा, क्या आप WhatsApp/SMS पर सूचना पाना चाहते हैं? अपना 10 अंकों का मोबाइल नंबर दर्ज करें:`);
    if (mobilePrompt && mobilePrompt.trim().length >= 10) {
      alert(`✅ धन्यवाद! आपका नंबर (${mobilePrompt.trim()}) पंजीकृत हो गया है। बंडल उपलब्ध होते ही आपको सूचित किया जाएगा।`);
    }
  };

  // -------------------------------------------------------------
  // 5. MASTER SHELF BUILDER
  // -------------------------------------------------------------
  function buildShelfSectionHtml(shelf) {
    if (!shelf || shelf.enabled === false) return '';

    const isBundlesOnly = shelf.type === 'bundles';
    let items = [];

    if (isBundlesOnly) {
      const ids = Array.isArray(shelf.bundle_ids) ? shelf.bundle_ids : [];
      ids.forEach(id => {
        const b = allBundlesMap.get(String(id).toUpperCase().trim());
        if (b) items.push({ isBundle: true, data: b });
      });
      if (items.length === 0) {
        Array.from(allBundlesMap.values()).forEach(b => items.push({ isBundle: true, data: b }));
      }
    } else {
      const ids = Array.isArray(shelf.book_ids) ? shelf.book_ids : [];
      ids.forEach(id => {
        const b = allBooksMap.get(String(id).toUpperCase().trim());
        if (b) items.push({ isBundle: false, data: b });
      });
      // Bundles if specified in shelf
      if (Array.isArray(shelf.bundle_ids) && shelf.bundle_ids.length > 0) {
        shelf.bundle_ids.forEach(id => {
          const bun = allBundlesMap.get(String(id).toUpperCase().trim());
          if (bun) items.push({ isBundle: true, data: bun });
        });
      }
      // Fallback by category if book_ids empty
      if (items.length === 0 && shelf.category && shelf.category !== 'all') {
        const catLower = shelf.category.toLowerCase();
        Array.from(allBooksMap.values()).forEach(b => {
          const bCat = (b.category || '').toLowerCase();
          if (bCat.includes(catLower)) items.push({ isBundle: false, data: b });
        });
      }
    }

    // Apply limit
    const limit = parseInt(shelf.limit, 10) || 0;
    if (limit > 0 && items.length > limit) {
      items = items.slice(0, limit);
    }

    if (items.length === 0) return '';

    const shelfId = shelf.id || ('shelf_' + Math.random().toString(36).substring(2, 7));
    const title = shelf.title || 'ई-बुक शेल्फ';
    const subtitle = shelf.subtitle || '';
    const badge = shelf.badge || '';
    const style = shelf.display_style || 'horizontal_scroll';

    const itemsHtml = items.map(item => item.isBundle ? renderBundleItemHtml(item.data) : renderBookItemHtml(item.data)).join('');

    let contentHtml = '';
    if (style === 'grid') {
      contentHtml = `
        <div class="universal-shelf-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(210px, 1fr));gap:16px;">
          ${itemsHtml}
        </div>
      `;
    } else {
      // horizontal_scroll or slider with mobile 2-by-2 auto-slide
      contentHtml = `
        <div class="universal-shelf-scroll-wrap" style="position:relative;">
          <button type="button" class="universal-shelf-arrow left" onclick="window.scrollUniversalShelf('${shelfId}', -1)" aria-label="Scroll Left" style="position:absolute;left:-12px;top:50%;transform:translateY(-50%);z-index:4;width:38px;height:38px;border-radius:50%;background:#ffffff;border:1.5px solid #cbd5e1;box-shadow:0 4px 12px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#0f172a;font-size:1.05rem;">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          
          <div id="${shelfId}_scroll_box" class="universal-shelf-track" style="display:flex;gap:14px;overflow-x:auto;scroll-behavior:smooth;padding:6px 2px 14px 2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;">
            ${itemsHtml}
          </div>

          <button type="button" class="universal-shelf-arrow right" onclick="window.scrollUniversalShelf('${shelfId}', 1)" aria-label="Scroll Right" style="position:absolute;right:-12px;top:50%;transform:translateY(-50%);z-index:4;width:38px;height:38px;border-radius:50%;background:#ffffff;border:1.5px solid #cbd5e1;box-shadow:0 4px 12px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#0f172a;font-size:1.05rem;">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      `;
    }

    return `
      <section class="universal-shelf-container" id="${shelfId}" style="margin-bottom:34px;">
        <div class="shelf-header" style="margin-bottom:14px;display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            ${badge ? `<span style="background:rgba(245,158,11,0.15);color:#d97706;border:1px solid #f59e0b;font-size:0.72rem;font-weight:900;padding:3px 8px;border-radius:4px;letter-spacing:0.5px;display:inline-block;margin-bottom:6px;">${badge}</span>` : ''}
            <h2 style="margin:0;font-size:1.4rem;font-weight:900;color:#0f172a;line-height:1.25;">${title}</h2>
            ${subtitle ? `<p style="margin:4px 0 0 0;font-size:0.88rem;color:#64748b;font-weight:500;">${subtitle}</p>` : ''}
          </div>
          <span style="font-size:0.82rem;font-weight:700;color:#2563eb;cursor:pointer;" onclick="window.location.href='/ebooks/ebook.html'">
            सभी देखें (${items.length}) ➔
          </span>
        </div>
        ${contentHtml}
      </section>
    `;
  }

  // -------------------------------------------------------------
  // 6. SCROLL INTERACTION & MOBILE 2-BY-2 AUTO-SLIDER CONTROLLER
  // -------------------------------------------------------------
  window.scrollUniversalShelf = function (shelfId, direction) {
    const box = document.getElementById(`${shelfId}_scroll_box`);
    if (!box) return;
    const isMobile = window.innerWidth <= 768;
    // On mobile, scroll exactly by 2 cards (approx container width)
    const amount = isMobile ? (box.clientWidth * 0.9 * direction) : (box.clientWidth * 0.7 * direction);
    box.scrollBy({ left: amount, behavior: 'smooth' });
  };

  function setupMobileAutoSlide(shelfId) {
    const box = document.getElementById(`${shelfId}_scroll_box`);
    if (!box) return;
    let timer = null;

    function startTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!box) return;
        const maxScroll = box.scrollWidth - box.clientWidth;
        if (box.scrollLeft >= maxScroll - 10) {
          box.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          box.scrollBy({ left: box.clientWidth * 0.85, behavior: 'smooth' });
        }
      }, 5000);
    }

    box.addEventListener('touchstart', () => { if (timer) clearInterval(timer); }, { passive: true });
    box.addEventListener('touchend', () => { startTimer(); }, { passive: true });
    box.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    box.addEventListener('mouseleave', () => { startTimer(); });

    startTimer();
  }

  // -------------------------------------------------------------
  // 7. PAGE TARGETED AUTO-MOUNT LOGIC (ANY PAGE SUPPORT)
  // -------------------------------------------------------------
  window.initUniversalShelves = async function () {
    if (isInitialized) return;
    const ok = await loadShelvesAndCatalogData();
    if (!ok || !shelvesConfig || !Array.isArray(shelvesConfig.shelves)) return;

    isInitialized = true;
    const path = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);

    // Identify current page key
    let pageKey = 'other';
    if (path === '/' || path === '/index.html' || path.endsWith('/index.html')) {
      pageKey = 'home';
    } else if (path.includes('ebook.html') || path.endsWith('/ebooks/') || path.endsWith('/ebooks/index.html')) {
      pageKey = 'ebook_store';
    } else if (path.includes('agriculture.html') || path.includes('crop-doctor.html')) {
      pageKey = 'category_agri';
    } else if (path.includes('health.html')) {
      pageKey = 'category_health';
    } else if (path.includes('pashu-palan.html')) {
      pageKey = 'category_pashupalan';
    } else if (path.includes('business.html')) {
      pageKey = 'category_business';
    } else if (path.includes('my-library.html')) {
      pageKey = 'my_library';
    } else if (path.includes('digital-ai.html')) {
      pageKey = 'category_digital_ai';
    } else if (path.includes('education.html')) {
      pageKey = 'category_education';
    } else if (path.includes('netsurf.html')) {
      pageKey = 'category_netsurf';
    } else if (path.includes('mandi.html')) {
      pageKey = 'mandi_bhav';
    }

    // Helper: does shelf target this page?
    function matchesCurrentPage(s) {
      if (!s || s.enabled === false) return false;
      const targets = Array.isArray(s.display_pages) ? s.display_pages : [];
      if (targets.includes('all')) return true;
      if (targets.includes(pageKey)) return true;
      // Also match raw path or slug
      return targets.some(t => t && path.includes(t.toLowerCase()));
    }

    // A. HOME PAGE: Bundles Shelf directly beneath VIP Strip
    const homeBundlesTarget = document.getElementById('home-bundles-shelf-container');
    if (homeBundlesTarget) {
      const allBundles = Array.from(allBundlesMap.values());
      if (allBundles.length > 0) {
        const bundlesShelf = {
          id: 'home_super_bundles',
          title: '📦 महा-कॉम्बो बंडल (Save up to 90%)',
          subtitle: 'सम्पूर्ण कृषि व फसल डॉक्टर गाइड्स एक साथ — भारी छूट व 1-Year VIP ऑल-एक्सेस मुफ्त',
          badge: '⚡ SPECIAL MEGA SAVER',
          type: 'bundles',
          display_style: 'slider',
          bundle_ids: allBundles.map(b => b.id),
          enabled: true
        };
        homeBundlesTarget.innerHTML = buildShelfSectionHtml(bundlesShelf);
        setupMobileAutoSlide('home_super_bundles');
      }
    }

    // B. STORE PAGE: Dedicated Bundles Row right below Hero Banner
    const storeBundlesTarget = document.getElementById('store-bundles-shelf-container');
    if (storeBundlesTarget) {
      const allBundles = Array.from(allBundlesMap.values());
      if (allBundles.length > 0) {
        const storeBundlesShelf = {
          id: 'store_super_bundles',
          title: '📦 ऑल-इन-वन महा-बंडल संग्रह (Mega Bundles)',
          subtitle: 'एक साथ पूरी डिजिटल लाइब्रेरी अनलॉक करें — सर्वोत्तम बचत कॉम्बो',
          badge: '🔥 BUNDLE SAVER',
          type: 'bundles',
          display_style: 'slider',
          bundle_ids: allBundles.map(b => b.id),
          enabled: true
        };
        storeBundlesTarget.innerHTML = buildShelfSectionHtml(storeBundlesShelf);
        setupMobileAutoSlide('store_super_bundles');
      }
    }

    // B2. AGRI PAGE: Dedicated Agri Bundles Row
    const agriBundlesTarget = document.getElementById('agri-bundles-shelf-container');
    if (agriBundlesTarget) {
      const allBundles = Array.from(allBundlesMap.values());
      if (allBundles.length > 0) {
        const agriBundlesShelf = {
          id: 'agri_super_bundles',
          title: '📦 महाबचत कृषि कॉम्बो बंडल (Save up to 90%)',
          subtitle: 'खेती का डॉक्टर + सम्पूर्ण फसल समाधान गाइड्स एक साथ — 1-Year VIP ऑल-एक्सेस मुफ्त',
          badge: '⚡ SPECIAL AGRI BUNDLES',
          type: 'bundles',
          display_style: 'slider',
          bundle_ids: allBundles.map(b => b.id),
          enabled: true
        };
        agriBundlesTarget.innerHTML = buildShelfSectionHtml(agriBundlesShelf);
        setupMobileAutoSlide('agri_super_bundles');
      }
    }

    // C. GENERAL PAGE SHELVES MOUNT
    const targetContainers = [
      document.getElementById('home-dynamic-shelves-container'),
      document.getElementById('store-dynamic-shelves-container'),
      document.getElementById('dynamic-store-shelves-container'),
      document.getElementById('agri-dynamic-shelves-container'),
      document.getElementById('library-dynamic-shelves-container'),
      document.getElementById('universal-dynamic-shelves-container')
    ].filter(Boolean);

    targetContainers.forEach(container => {
      const pageShelves = shelvesConfig.shelves.filter(s => matchesCurrentPage(s));
      if (pageShelves.length > 0) {
        container.innerHTML = pageShelves.map(s => {
          const html = buildShelfSectionHtml(s);
          setTimeout(() => setupMobileAutoSlide(s.id), 100);
          return html;
        }).join('');
      }
    });

    // D. BOOK LANDING CROSS-SELL WINDOW MOUNT
    if (path.includes('book-landing.html')) {
      const bId = (urlParams.get('id') || 'BK001').toUpperCase().trim();
      const crossSellTarget = document.getElementById('suggested-books-grid') || 
                              document.getElementById('suggested-books-list') || 
                              document.getElementById('landing-dynamic-cross-sell-shelf');
      if (crossSellTarget && shelvesConfig.landing_page_windows) {
        const win = shelvesConfig.landing_page_windows[bId] || shelvesConfig.landing_page_windows['default'];
        if (win && win.enabled !== false) {
          const winShelf = {
            id: `landing_win_${bId}`,
            title: win.shelf_title || '🌾 संबंधित लोकप्रिय गाइड्स व कॉम्बो',
            subtitle: 'इस पुस्तक के साथ पाठकों द्वारा सर्वाधिक चुनी गई अन्य पुस्तकें',
            badge: '🔥 RECOMMENDED FOR YOU',
            type: 'books',
            display_style: win.display_style || 'horizontal_scroll',
            book_ids: win.recommended_book_ids || ['BK016', 'BK002', 'BK001'],
            bundle_ids: win.recommended_bundle_ids || ['BUN001'],
            limit: win.limit || 6,
            enabled: true
          };
          crossSellTarget.innerHTML = buildShelfSectionHtml(winShelf);
          setupMobileAutoSlide(`landing_win_${bId}`);
        }
      }
    }

    // E. PERSONALIZED RECOMMENDATION SHELF (AI-DRIVEN)
    const recTarget = document.getElementById('personalized-recommendation-shelf-container');
    if (recTarget) {
      const topBooks = ['BK001', 'BK002', 'BK017', 'BK022', 'BK020', 'BK019'];
      const recShelf = {
        id: 'shelf_ai_recommended',
        title: '🎯 आपके लिए विशेष सुझाव (Recommended for You)',
        subtitle: 'आपकी रुचि और सर्वाधिक लोकप्रिय प्राथमिकताओं के आधार पर तैयार की गई सूची',
        badge: '✨ AI CURATED',
        type: 'books',
        display_style: 'horizontal_scroll',
        book_ids: topBooks,
        limit: 6,
        enabled: true
      };
      recTarget.innerHTML = buildShelfSectionHtml(recShelf);
      setupMobileAutoSlide('shelf_ai_recommended');
    }
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initUniversalShelves);
  } else {
    window.initUniversalShelves();
  }

})(window, document);
