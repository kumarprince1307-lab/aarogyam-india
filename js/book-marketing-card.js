/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL BOOK MARKETING CARD & WISHLIST ENGINE
 * Version: 4.0 (Ultra-Clean 5-Button Transparent Share Modal & Responsive Cards)
 * ====================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. GLOBAL WISHLIST ENGINE (AAROGYAM_WISHLIST)
  // -------------------------------------------------------------
  window.AarogyamWishlist = {
    getKey: function () {
      return 'AAROGYAM_WISHLIST';
    },

    getItems: function () {
      try {
        const raw = localStorage.getItem(this.getKey());
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },

    isInWishlist: function (bookId) {
      if (!bookId) return false;
      const items = this.getItems();
      const bIdUpper = String(bookId).trim().toUpperCase();
      return items.some(function (it) {
        const itId = typeof it === 'string' ? it : (it.id || it.link || '');
        return String(itId).trim().toUpperCase() === bIdUpper;
      });
    },

    toggle: function (book) {
      if (!book) return false;
      const bId = (typeof book === 'string' ? book : (book.id || book.link || '')).trim().toUpperCase();
      if (!bId) return false;

      let items = this.getItems();
      const existsIndex = items.findIndex(function (it) {
        const itId = typeof it === 'string' ? it : (it.id || it.link || '');
        return String(itId).trim().toUpperCase() === bId;
      });

      let added = false;
      if (existsIndex >= 0) {
        items.splice(existsIndex, 1);
        added = false;
        this.showToast('💔 विशलिस्ट से हटा दिया गया!', 'info');
      } else {
        const saveObj = typeof book === 'object' ? book : { id: bId, title: bId };
        items.unshift(saveObj);
        added = true;
        this.showToast('❤️ विशलिस्ट में सुरक्षित कर लिया गया!', 'success');
      }

      try {
        localStorage.setItem(this.getKey(), JSON.stringify(items));
      } catch (e) {}

      this.updateBadges();
      this.updateCardHearts(bId, added);
      return added;
    },

    updateBadges: function () {
      const items = this.getItems();
      const count = items.length;
      const badges = document.querySelectorAll('#wishlist-count-badge, .wishlist-count-badge');
      badges.forEach(function (b) {
        b.textContent = count;
        b.style.display = count > 0 ? 'inline-flex' : 'none';
      });
    },

    updateCardHearts: function (bId, isAdded) {
      const buttons = document.querySelectorAll(`[data-wishlist-id="${bId}"]`);
      buttons.forEach(function (btn) {
        if (isAdded) {
          btn.classList.add('in-wishlist');
          btn.innerHTML = '❤️';
          btn.setAttribute('title', 'विशलिस्ट में सुरक्षित है');
        } else {
          btn.classList.remove('in-wishlist');
          btn.innerHTML = '🤍';
          btn.setAttribute('title', 'विशलिस्ट में जोड़ें');
        }
      });
    },

    showToast: function (msg, type) {
      let toast = document.getElementById('ubl-global-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ubl-global-toast';
        toast.style.cssText = 'position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:12px 24px;border-radius:30px;box-shadow:0 10px 30px rgba(0,0,0,0.4);z-index:9999999;font-size:0.88rem;font-weight:700;display:flex;align-items:center;gap:8px;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);opacity:0;pointer-events:none;border:1px solid rgba(255,255,255,0.15);';
        document.body.appendChild(toast);
      }
      const icon = type === 'success' ? '✅' : 'ℹ️';
      toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.pointerEvents = 'auto';

      clearTimeout(window._ublToastTimer);
      window._ublToastTimer = setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        toast.style.pointerEvents = 'none';
      }, 3000);
    }
  };

  // -------------------------------------------------------------
  // 2. GLOBAL CART HELPER
  // -------------------------------------------------------------
  window.AarogyamCart = {
    getKey: function () {
      return 'AI_CART_ITEMS';
    },

    getItems: function () {
      try {
        const raw = localStorage.getItem(this.getKey());
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },

    addBook: function (book) {
      if (!book) return;
      const bId = (book.id || book.link || 'BK001').trim().toUpperCase();
      let items = this.getItems();
      const existing = items.find(function (x) {
        return String(x.id || x.link || x || '').trim().toUpperCase() === bId;
      });

      if (!existing) {
        items.push(bId);
        try {
          localStorage.setItem(this.getKey(), JSON.stringify(items));
        } catch (e) {}
      }

      this.updateBadges();
      window.AarogyamWishlist.showToast(`🛒 '${book.heading || book.name || "ई-बुक"}' कार्ट में जोड़ दी गई!`, 'success');
    },

    updateBadges: function () {
      const items = this.getItems();
      const count = items.length;
      const badges = document.querySelectorAll('#cart-count-badge, .cart-count-badge, #cartCount');
      badges.forEach(function (b) {
        b.textContent = count;
        b.style.display = count > 0 ? 'inline-flex' : 'inline-flex';
      });
    }
  };

  // -------------------------------------------------------------
  // 3. NATIVE DIRECT SHARE & 5-BUTTON TRANSPARENT SHARE MODAL
  // -------------------------------------------------------------
  function buildBookSharePayload(bId, title, price) {
    const rawId = String(bId || 'BK001').trim().toUpperCase();
    let url = `${window.location.origin}/ebooks/book-landing.html?id=${encodeURIComponent(rawId)}`;
    if (rawId === 'BK001') url = `${window.location.origin}/ebooks/kharif-master-guide-2026.html`;
    else if (rawId === 'BK002') url = `${window.location.origin}/ebooks/kheti-dr.html`;

    if (typeof window.generateReferralShareUrl === 'function') {
      url = window.generateReferralShareUrl(url);
    }
    const cleanTitle = title || 'Aarogyam India Digital eBook';
    const cleanPrice = price || 99;
    const text = `🌾 *${cleanTitle}*\n\n🔥 विशेष ऑफर: मात्र ₹${cleanPrice} में सम्पूर्ण Practical Guide!\n🎁 साथ में 24×7 AI एक्सपर्ट परामर्श व मुफ़्त बोनस ई-बुक्स शामिल!\n\nअभी यहाँ से तुरंत देखें व डाउनलोड करें:\n👉 ${url}`;
    
    return { title: cleanTitle, text: text, url: url, price: cleanPrice };
  }

  function checkBookShareAuth(callback) {
    const isLogged = (window.isUserLoggedIn && typeof window.isUserLoggedIn === 'function')
      ? window.isUserLoggedIn()
      : ((window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') ? window.V1_SESSION.isLoggedIn() : false);

    if (!isLogged) {
      if (typeof window.openGuestLoginModal === 'function') {
        window.openGuestLoginModal(() => {
          if (typeof callback === 'function') callback();
        }, { force: false, source: 'UniversalShareGate' });
        return false;
      }
    }
    return true;
  }

  // 3A. Direct Native Share (Button 1: Share Now - Routes to 5-Button Modal with Auth Gate)
  window.nativeDirectShare = function (bId, title, price) {
    if (!checkBookShareAuth(() => window.nativeDirectShare(bId, title, price))) return;
    window.openShareDrawer(bId, title, price);
  };

  // 3B. Animated Social Channels (5 Sharp Buttons Stack with Transparent Background)
  window.openShareDrawer = function (bId, title, price) {
    if (!checkBookShareAuth(() => window.openShareDrawer(bId, title, price))) return;

    const data = buildBookSharePayload(bId, title, price);
    const encodedUrl = encodeURIComponent(data.url);
    const encodedText = encodeURIComponent(data.text);

    let overlay = document.getElementById('ai-share-drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ai-share-drawer-overlay';
      overlay.className = 'ai-share-drawer-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="ai-share-buttons-stack" id="ai-share-buttons-stack">
        
        <!-- 1. WhatsApp Button -->
        <a href="https://api.whatsapp.com/send?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-whatsapp" onclick="if(window.recordModalShareEvent)window.recordModalShareEvent('whatsapp','${data.url}','${data.title.replace(/'/g, "\\'")}'); window.closeShareDrawer();">
          <div class="ai-share-icon-wrap" style="background:#25D366;color:#fff;">
            <i class="fa-brands fa-whatsapp"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>WhatsApp</strong>
            <span>किसान ग्रुप्स व दोस्तों को तुरंत मैसेज भेजें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 2. Facebook Button -->
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" class="ai-share-btn-item ch-facebook" onclick="window.closeShareDrawer()">
          <div class="ai-share-icon-wrap" style="background:#1877F2;color:#fff;">
            <i class="fa-brands fa-facebook-f"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Facebook</strong>
            <span>फेसबुक फीड या मैसेंजर पर पोस्ट करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 3. Twitter / X Button -->
        <a href="https://twitter.com/intent/tweet?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-twitter" onclick="window.closeShareDrawer()">
          <div class="ai-share-icon-wrap" style="background:#000000;color:#fff;">
            <i class="fa-brands fa-x-twitter"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Twitter / X</strong>
            <span>ट्विटर पर पोस्ट या ट्वीट करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 4. Telegram Button -->
        <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" target="_blank" class="ai-share-btn-item ch-telegram" onclick="window.closeShareDrawer()">
          <div class="ai-share-icon-wrap" style="background:#229ED9;color:#fff;">
            <i class="fa-brands fa-telegram"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Telegram</strong>
            <span>टेलीग्राम ग्रुप व चैनल्स में शेयर करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 5. Copy Link Button -->
        <div class="ai-share-btn-item ch-copylink" id="ai-share-copy-row-btn" style="cursor:pointer;">
          <div class="ai-share-icon-wrap" style="background:#2563eb;color:#fff;">
            <i class="fa-solid fa-link"></i>
          </div>
          <div class="ai-share-btn-text" style="overflow:hidden;">
            <strong id="ai-share-copy-title">Copy Link</strong>
            <span style="font-family:monospace;font-size:0.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">${escapeHtml(data.url)}</span>
          </div>
          <button type="button" class="ai-share-copy-badge" id="ai-share-copy-badge-action">
            📋 कॉपी करें
          </button>
        </div>

      </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);

    overlay.onclick = function (e) {
      if (e.target === overlay) {
        window.closeShareDrawer();
      }
    };

    const copyRow = document.getElementById('ai-share-copy-row-btn');
    const copyBadge = document.getElementById('ai-share-copy-badge-action');
    const copyTitle = document.getElementById('ai-share-copy-title');

    function performCopy(e) {
      if (e) e.stopPropagation();
      navigator.clipboard.writeText(data.url).then(() => {
        if (copyBadge) {
          copyBadge.textContent = '✅ कॉपी हो गया!';
          copyBadge.style.background = '#16a34a';
        }
        if (copyTitle) copyTitle.textContent = '✅ लिंक कॉपी हो गया!';
        setTimeout(() => {
          if (copyBadge) {
            copyBadge.textContent = '📋 कॉपी करें';
            copyBadge.style.background = '#2563eb';
          }
          if (copyTitle) copyTitle.textContent = 'Copy Link';
        }, 2000);
      }).catch(() => {
        if (copyBadge) copyBadge.textContent = '✅ कॉपी हो गया!';
      });
    }

    copyRow?.addEventListener('click', performCopy);
    copyBadge?.addEventListener('click', performCopy);
  };

  window.closeShareDrawer = function () {
    const overlay = document.getElementById('ai-share-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 250);
    }
  };

  window.shareBookWhatsApp = function (bId, title, price) {
    window.openShareDrawer(bId, title, price);
  };

  // -------------------------------------------------------------
  // 4. UNIVERSAL MARKETING BOOK CARD RENDERER
  // -------------------------------------------------------------
  window.renderUniversalBookMarketingCard = function (book, opts) {
    opts = opts || {};
    const bId = (book.id || book.link || 'BK001').trim().toUpperCase();
    const title = book.heading || book.name || book.title || 'Aarogyam India eBook';
    const subtitle = book.subtitle || book.description || 'बीज उपचार से लेकर कटाई तक सम्पूर्ण प्रैक्टिकल गाइड।';
    const category = book.category || 'Agriculture';
    const cover = book.cover || book.thumbnail || book.image || '/images/books/kharif-master-guide-2026-cover.webp';
    const mrp = parseInt(book.mrp || 299, 10);
    const offerPrice = parseInt(book.offerPrice || book.price || 99, 10);
    const discountPercent = Math.max(10, Math.round(((mrp - offerPrice) / mrp) * 100));
    
    let landingUrl = '';
    if (bId === 'BK001') {
      landingUrl = '/ebooks/kharif-master-guide-2026.html';
    } else if (bId === 'BK002') {
      landingUrl = '/ebooks/kheti-dr.html';
    } else {
      landingUrl = book.landingPage || `/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`;
    }
    const isLiveAgri = (bId === 'BK001' || bId === 'BK002' || bId === 'BK006' || bId === 'BK015' || bId === 'SUB001');
    const isComingSoon = !isLiveAgri && (
      book.isComingSoon === true || 
      book.is_coming_soon === true || 
      book.badge === 'coming_soon' || 
      book.store_badge === 'coming_soon' || 
      book.status === 'coming_soon' || 
      book.status !== 'active'
    );
    
    const isStudioDemo = !isLiveAgri && ((book.type === 'demo' || book.isDemo === true || bId.startsWith('DEMO')) && !bId.startsWith('BONUS') && !bId.startsWith('FREE'));
    const isStudioBonus = !isLiveAgri && ((book.type === 'bonus_free' || book.isBonus === true || bId.startsWith('BONUS') || bId.startsWith('FREE')) && !bId.startsWith('DEMO'));
    const isFreeOrDemo = isStudioDemo || isStudioBonus;

    if (isFreeOrDemo) {
      landingUrl = book.landingPage || `/ebooks/demo-kharif.html?id=${encodeURIComponent(bId)}`;
    }

    // Store Badge Calculation
    let badgeText = 'Launch Offer';
    let badgeClass = 'badge-offer';
    if (isFreeOrDemo) {
      badgeText = isStudioBonus ? '🎁 100% Free Bonus' : '📖 Free Demo Sample';
      badgeClass = isStudioBonus ? 'badge-bestseller' : 'badge-discount';
    } else if (isComingSoon) {
      badgeText = '⏳ Coming Soon';
      badgeClass = 'badge-coming-soon';
    } else if (book.badge === 'best_seller' || book.store_badge === 'best_seller' || bId === 'BK001') {
      badgeText = '🔥 Best Seller';
      badgeClass = 'badge-bestseller';
    } else if (book.badge === 'new_arrival' || book.store_badge === 'new_arrival') {
      badgeText = '🆕 New Arrival';
      badgeClass = 'badge-new';
    } else if (book.badge === 'trending' || book.store_badge === 'trending') {
      badgeText = '⭐ Trending';
      badgeClass = 'badge-trending';
    } else {
      badgeText = `${discountPercent}% OFF`;
      badgeClass = 'badge-discount';
    }

    const inWishlist = window.AarogyamWishlist.isInWishlist(bId);

    // KPI Badges List
    let featuresList = ['🎧 ऑडियो बुक', '📷 300+ फोटो', '🧪 स्प्रे साइंस', '📱 Mobile PDF'];
    if (book.features && Array.isArray(book.features) && book.features.length > 0) {
      featuresList = book.features.map(f => typeof f === 'object' ? (f.text || '') : f).filter(Boolean);
    }
    if (book.hasAudioBook) {
      featuresList.unshift('🎧 ऑडियो बुक उपलब्ध');
    }

    const jsonPayload = JSON.stringify({
      id: bId,
      heading: title,
      name: title,
      offerPrice: isFreeOrDemo ? 0 : offerPrice,
      mrp: isFreeOrDemo ? 0 : mrp,
      cover: cover,
      category: category,
      landingPage: landingUrl
    }).replace(/"/g, '&quot;');

    return `
      <div class="kindle-book-card" id="book-card-${bId}" data-category="${category}">
        <!-- Top Badges & Wishlist Trigger -->
        <div class="card-badge-row">
          <span class="card-badge ${badgeClass}">${badgeText}</span>
          <button 
            type="button" 
            class="card-wishlist-btn ${inWishlist ? 'in-wishlist' : ''}" 
            data-wishlist-id="${bId}"
            onclick='window.AarogyamWishlist.toggle(${jsonPayload})'
            title="${inWishlist ? 'विशलिस्ट में सुरक्षित है' : 'विशलिस्ट में जोड़ें'}"
          >
            ${inWishlist ? '❤️' : '🤍'}
          </button>
        </div>

        <!-- 3D Book Cover Presentation -->
        <div class="card-cover-wrap" onclick="window.location.href='${landingUrl}'">
          <div class="card-3d-book">
            <img src="${cover}" alt="${title}" loading="lazy" class="card-cover-img" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp'" />
            <div class="card-cover-glare"></div>
          </div>
          <div class="card-category-pill">${category}</div>
        </div>

        <!-- Book Info & Ratings -->
        <div class="card-body">
          <div class="card-rating-row">
            <div class="card-stars">★★★★★</div>
            <span class="card-rating-score">4.9</span>
            <span class="card-rating-count">(${isFreeOrDemo ? 'डेमो / फ्री प्रिव्यू' : '120+ रिव्यूज'})</span>
          </div>

          <h3 class="card-title" onclick="window.location.href='${landingUrl}'" title="${title}">
            ${title}
          </h3>
          <p class="card-subtitle">${subtitle}</p>

          <!-- Key Feature KPI Badges -->
          <div class="card-kpi-badges">
            ${featuresList.slice(0, 3).map(f => `<span class="card-kpi-tag">${f}</span>`).join('')}
          </div>

          <!-- Price & Savings Block -->
          ${isFreeOrDemo ? `
            <div class="card-price-block" style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:8px 12px;margin:8px 0;">
              <div class="card-prices" style="display:flex;align-items:center;justify-content:space-between;">
                <span class="card-offer-price" style="color:#16a34a;font-size:1.05rem;font-weight:900;">100% मुफ़्त (FREE)</span>
                <span class="card-save-badge" style="background:#16a34a;color:#fff;font-weight:800;font-size:0.75rem;padding:2px 8px;border-radius:6px;">No Cost</span>
              </div>
              <div class="card-savings-text" style="color:#15803d;font-size:0.78rem;margin-top:2px;">सीधे ऑनलाइन पढ़ें या डिजिटल लाइब्रेरी में देखें</div>
            </div>
          ` : `
            <div class="card-price-block">
              <div class="card-prices">
                <span class="card-offer-price">₹${offerPrice}</span>
                <span class="card-mrp">₹${mrp}</span>
                <span class="card-save-badge">${discountPercent}% छूट</span>
              </div>
              <div class="card-savings-text">आप बचाएंगे ₹${mrp - offerPrice}</div>
            </div>
          `}

          <!-- Action Buttons Bar: Coming Soon Wishlist / Buy Now / Free Demo Controls -->
          <div class="card-actions-container">
            ${isComingSoon ? `
              <div style="display:flex;gap:8px;align-items:center;">
                <button 
                  type="button" 
                  class="btn-pre-interest" 
                  style="flex:1;background:linear-gradient(135deg, #16a34a, #059669);color:#fff;font-weight:800;border:none;border-radius:10px;padding:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:0.84rem;box-shadow:0 4px 12px rgba(22,163,74,0.25);transition:all 0.2s;" 
                  onclick="window.openComingSoonModal('${bId}', '${escapeHtml(title)}')"
                >
                  <i class="fa-solid fa-bell"></i> <span>जल्द आ रही है (रुचि दर्ज करें)</span>
                </button>
                <button 
                  type="button" 
                  class="btn-card-share-green" 
                  style="width:42px;height:42px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#25d366;color:#fff;border:none;cursor:pointer;flex-shrink:0;" 
                  onclick="window.nativeDirectShare('${bId}', '${escapeHtml(title)}', ${offerPrice})" 
                  title="शेयर करें"
                >
                  <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i>
                </button>
              </div>
            ` : isFreeOrDemo ? `
              <div class="card-actions-grid-2x2">
                <!-- 1. Read Free / Demo Online (Green Button) -->
                <a href="${landingUrl}" class="btn-card-buy-orange" style="background:linear-gradient(135deg,#16a34a,#15803d);box-shadow:0 4px 12px rgba(22,163,74,0.3);text-decoration:none;" title="मुफ़्त ऑनलाइन पढ़ें">
                  <i class="fa-solid fa-book-open"></i> <span>मुफ़्त पढ़ें</span>
                </a>

                <!-- 2. My Library (Blue Button) -->
                <a href="/ebooks/my-library.html" class="btn-card-cart-blue" style="background:linear-gradient(135deg,#0284c7,#0369a1);box-shadow:0 4px 12px rgba(2,132,199,0.3);text-decoration:none;display:flex;align-items:center;justify-content:center;gap:5px;" title="लाइब्रेरी खोलें">
                  <i class="fa-solid fa-book-bookmark"></i> <span>My Library</span>
                </a>

                <!-- 3. Share Now (Green Native Direct Share) -->
                <button 
                  type="button" 
                  class="btn-card-share-green" 
                  onclick="window.nativeDirectShare('${bId}', '${escapeHtml(title)}', 0)"
                  title="सीधे मोबाइल में शेयर करें"
                >
                  <i class="fa-brands fa-whatsapp"></i> <span>Share Now</span>
                </button>

                <!-- 4. Audio Demo or Share Drawer -->
                ${book.hasAudioBook ? `
                  <a href="/ebooks/reader.html?book=${encodeURIComponent(bId)}&demo=1&audio=1" class="btn-card-share-channels" style="background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:5px;" title="ऑडियो डेमो सुनें">
                    <i class="fa-solid fa-headphones"></i> <span>ऑडियो</span>
                  </a>
                ` : `
                  <button 
                    type="button" 
                    class="btn-card-share-channels" 
                    onclick="window.openShareDrawer('${bId}', '${escapeHtml(title)}', 0)"
                    title="सोशल मीडिया ऑप्शंस खोलें"
                  >
                    <i class="fa-solid fa-share-nodes"></i> <span>Share By</span>
                  </button>
                `}
              </div>
            ` : `
              <div class="card-actions-grid-2x2">
                <!-- 1. Add to Cart (Blue Button) -->
                <button 
                  type="button" 
                  class="btn-card-cart-blue" 
                  onclick='window.AarogyamCart.addBook(${jsonPayload})'
                  title="कार्ट में जोड़ें"
                >
                  <i class="fa-solid fa-cart-plus"></i> <span>Add Cart</span>
                </button>

                <!-- 2. Buy Now (Orange Button) -->
                <a href="${landingUrl}" class="btn-card-buy-orange" title="अभी खरीदें">
                  <i class="fa-solid fa-bolt"></i> <span>Buy Now</span>
                </a>

                <!-- 3. Share Now (Green Native Direct Share) -->
                <button 
                  type="button" 
                  class="btn-card-share-green" 
                  onclick="window.nativeDirectShare('${bId}', '${escapeHtml(title)}', ${offerPrice})"
                  title="सीधे मोबाइल में शेयर करें"
                >
                  <i class="fa-brands fa-whatsapp"></i> <span>Share Now</span>
                </button>

                <!-- 4. Share By (Channels Drawer) -->
                <button 
                  type="button" 
                  class="btn-card-share-channels" 
                  onclick="window.openShareDrawer('${bId}', '${escapeHtml(title)}', ${offerPrice})"
                  title="सोशल मीडिया ऑप्शंस खोलें"
                >
                  <i class="fa-solid fa-share-nodes"></i> <span>Share By</span>
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  };

  // -------------------------------------------------------------
  // UNIVERSAL COMING SOON LEAD / INTEREST CAPTURE MODAL
  // -------------------------------------------------------------
  window.openComingSoonModal = function (bookId, bookTitle) {
    const existingModal = document.getElementById('ai-coming-soon-modal-overlay');
    if (existingModal) existingModal.remove();

    let defaultName = '';
    let defaultPhone = '';
    try {
      const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
      if (u.name || u.full_name) defaultName = u.name || u.full_name;
      if (u.phone || u.mobile) defaultPhone = u.phone || u.mobile;
    } catch (e) {}

    const modalHtml = `
      <div id="ai-coming-soon-modal-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.75);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;">
        <div style="background:#ffffff;border-radius:20px;max-width:420px;width:100%;padding:28px 24px;box-shadow:0 25px 50px rgba(0,0,0,0.25);position:relative;animation:aiModalFadeIn 0.25s ease-out;font-family:inherit;">
          <button type="button" onclick="document.getElementById('ai-coming-soon-modal-overlay').remove()" style="position:absolute;top:14px;right:14px;background:#f1f5f9;border:none;width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer;color:#64748b;display:flex;align-items:center;justify-content:center;">&times;</button>
          
          <div style="text-align:center;margin-bottom:18px;">
            <div style="width:54px;height:54px;background:#dcfce7;color:#16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto 12px;">
              🔔
            </div>
            <h3 style="margin:0 0 6px 0;font-size:1.25rem;font-weight:900;color:#0f172a;">आगामी पुस्तक — रुचि दर्ज करें</h3>
            <p style="margin:0;font-size:0.85rem;color:#64748b;line-height:1.4;">
              <strong style="color:#16a34a;">${escapeHtml(bookTitle)}</strong> जल्द ही लॉन्च हो रही है। लॉन्च होते ही WhatsApp पर सूचना व स्पेशल डिस्काउंट पाने के लिए अपना नंबर दर्ज करें।
            </p>
          </div>

          <form id="ai-cs-lead-form" onsubmit="window.handleComingSoonLeadSubmit(event, '${escapeHtml(bookId)}', '${escapeHtml(bookTitle)}')">
            <div style="margin-bottom:12px;">
              <label style="display:block;font-size:0.78rem;font-weight:700;color:#334155;margin-bottom:4px;">👤 आपका नाम</label>
              <input type="text" id="ai-cs-name" value="${escapeHtml(defaultName)}" placeholder="अपना नाम दर्ज करें" style="width:100%;padding:10px 14px;border:1.5px solid #cbd5e1;border-radius:10px;font-size:0.9rem;box-sizing:border-box;outline:none;" />
            </div>

            <div style="margin-bottom:18px;">
              <label style="display:block;font-size:0.78rem;font-weight:700;color:#334155;margin-bottom:4px;">📱 WhatsApp मोबाइल नंबर *</label>
              <input type="tel" id="ai-cs-phone" required maxlength="10" value="${escapeHtml(defaultPhone)}" placeholder="10 अंकों का WhatsApp नंबर" style="width:100%;padding:10px 14px;border:1.5px solid #cbd5e1;border-radius:10px;font-size:0.95rem;font-weight:700;letter-spacing:1px;box-sizing:border-box;outline:none;" />
            </div>

            <button type="submit" style="width:100%;background:linear-gradient(135deg, #16a34a 0%, #059669 100%);color:#fff;font-weight:900;font-size:0.95rem;padding:12px;border:none;border-radius:12px;cursor:pointer;box-shadow:0 6px 16px rgba(22,163,74,0.35);">
              ✅ मुझे WhatsApp पर सूचित करें (Notify Me)
            </button>
          </form>

          <div style="margin-top:14px;text-align:center;">
            <a href="https://wa.me/917974422572?text=${encodeURIComponent('नमस्ते Aarogyam India, मुझे ' + bookTitle + ' पुस्तक के बारे में जानकारी चाहिए।')}" target="_blank" style="font-size:0.8rem;color:#16a34a;font-weight:700;text-decoration:none;">
              💬 सीधे WhatsApp पर पूछें →
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  window.handleComingSoonLeadSubmit = function (e, bookId, bookTitle) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('ai-cs-name');
    const phoneInput = document.getElementById('ai-cs-phone');
    const name = (nameInput?.value || 'किसान पाठक').trim();
    const phone = (phoneInput?.value || '').replace(/[^0-9]/g, '');

    if (!phone || phone.length < 10) {
      alert('कृपया सही 10-अंकों का WhatsApp मोबाइल नंबर दर्ज करें।');
      return;
    }

    try {
      let leads = JSON.parse(localStorage.getItem('AAROGYAM_COMING_SOON_LEADS') || '[]');
      leads.unshift({
        userName: name,
        userPhone: phone,
        bookId: bookId,
        bookTitle: bookTitle,
        registeredAt: new Date().toLocaleString('hi-IN')
      });
      localStorage.setItem('AAROGYAM_COMING_SOON_LEADS', JSON.stringify(leads));

      // Also add to Wishlist automatically
      window.AarogyamWishlist.toggle({
        id: bookId,
        heading: bookTitle,
        name: bookTitle,
        category: 'Agriculture'
      });
    } catch (err) {}

    const overlay = document.getElementById('ai-coming-soon-modal-overlay');
    if (overlay) overlay.remove();

    window.AarogyamWishlist.showToast('✅ आपकी रुचि दर्ज कर ली गई है! लॉन्च होते ही आपको WhatsApp पर सूचित किया जाएगा।', 'success');
  };

  // -------------------------------------------------------------
  // 6. UNIVERSAL YOUTUBE VIDEO MODAL ENGINE (MULTI-VIDEO PLAYLIST)
  // -------------------------------------------------------------
  window.extractYoutubeEmbedUrl = function (url) {
    if (!url) return '';
    let str = String(url).trim();
    if (str.includes('embed/')) return str;
    
    // Match standard youtube.com/watch?v=ID or youtu.be/ID or youtube.com/shorts/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = str.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
    }
    return str;
  };

  window.openBookVideoModal = function (bookTitle, videos) {
    let old = document.getElementById('ai-book-video-modal-overlay');
    if (old) old.remove();

    let list = [];
    if (Array.isArray(videos)) {
      list = videos.map((v, i) => typeof v === 'string' ? { title: `वीडियो #${i + 1}`, url: v } : v).filter(v => v && v.url);
    } else if (typeof videos === 'string' && videos.trim()) {
      list = [{ title: '📺 पुस्तक वीडियो डेमो', url: videos.trim() }];
    }

    if (list.length === 0) {
      alert('इस पुस्तक के लिए कोई वीडियो लिंक उपलब्ध नहीं है।');
      return;
    }

    const firstUrl = window.extractYoutubeEmbedUrl(list[0].url);

    const modalHtml = `
      <div id="ai-book-video-modal-overlay" class="ai-coming-soon-modal-overlay" style="display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:9999999;padding:16px;">
        <div style="background:#0f172a;border:1.5px solid #334155;border-radius:20px;max-width:700px;width:100%;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.6);position:relative;animation:modalScale 0.25s cubic-bezier(0.4,0,0.2,1);color:#fff;">
          
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#1e293b;border-bottom:1px solid #334155;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.2rem;color:#ef4444;">🎬</span>
              <h3 style="margin:0;font-size:1.05rem;font-weight:900;color:#f8fafc;">
                ${escapeHtml(bookTitle)} — वीडियो डेमो
              </h3>
            </div>
            <button onclick="document.getElementById('ai-book-video-modal-overlay').remove()" style="background:transparent;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer;line-height:1;padding:4px 8px;">&times;</button>
          </div>

          <!-- Video Player Iframe Container -->
          <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:#000;">
            <iframe 
              id="ai-active-video-frame" 
              src="${firstUrl}" 
              title="${escapeHtml(bookTitle)}" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen 
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;">
            </iframe>
          </div>

          <!-- Multi-Video Playlist Selector (If more than 1 video) -->
          ${list.length > 1 ? `
            <div style="padding:14px 18px;background:#0b1329;border-top:1px solid #1e293b;">
              <div style="font-size:0.78rem;font-weight:800;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
                📺 वीडियो प्लेलिस्ट (${list.length} उपलब्ध):
              </div>
              <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;">
                ${list.map((v, idx) => `
                  <button 
                    type="button" 
                    onclick="window.switchActiveVideoModal('${window.extractYoutubeEmbedUrl(v.url)}', this)" 
                    class="ai-video-playlist-btn ${idx === 0 ? 'active' : ''}" 
                    style="padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:700;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;background:${idx === 0 ? '#ef4444' : '#1e293b'};color:#fff;border:1px solid ${idx === 0 ? '#ef4444' : '#334155'};transition:all 0.2s;"
                  >
                    <span>▶</span> <span>${escapeHtml(v.title || `भाग #${idx + 1}`)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Footer Actions -->
          <div style="padding:12px 18px;display:flex;justify-content:space-between;align-items:center;background:#0f172a;flex-wrap:wrap;gap:10px;">
            <div style="font-size:0.8rem;color:#94a3b8;">
              🌾 Aarogyam India Digital Video Hub
            </div>
            <button onclick="document.getElementById('ai-book-video-modal-overlay').remove()" style="background:#334155;color:#fff;border:none;padding:6px 16px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;">
              बंद करें (Close)
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  window.switchActiveVideoModal = function (url, btn) {
    const frame = document.getElementById('ai-active-video-frame');
    if (frame && url) {
      frame.src = url;
    }
    document.querySelectorAll('.ai-video-playlist-btn').forEach(b => {
      b.style.background = '#1e293b';
      b.style.borderColor = '#334155';
    });
    if (btn) {
      btn.style.background = '#ef4444';
      btn.style.borderColor = '#ef4444';
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }


  // =========================================================================
  // =========================================================================
  // WORLD-CLASS MEGA DEAL OF THE DAY ENGINE (AMAZON / FLIPKART STYLE)
  // 100% Dynamic & Connected Directly to Admin Panel (data/book-bundles.json)
  // =========================================================================
  window._cachedActiveBundle = null;
  let _bundleFetchPromise = null;
  let _dealCountdownTimer = null;

  // Global Countdown Timer for Deal Urgency (15-Minute Rolling FOMO Timer)
  window.initDealCountdown = function () {
    if (_dealCountdownTimer) return;
    let secondsLeft = 14 * 60 + 42; // 14 min 42 sec
    const timerEls = document.querySelectorAll('.deal-countdown-digits');
    
    _dealCountdownTimer = setInterval(function () {
      secondsLeft--;
      if (secondsLeft <= 0) secondsLeft = 15 * 60; // Reset rolling 15 min
      const m = Math.floor(secondsLeft / 60);
      const s = secondsLeft % 60;
      const str = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      
      const currentEls = document.querySelectorAll('.deal-countdown-digits');
      currentEls.forEach(function (el) {
        el.textContent = str;
      });
    }, 1000);
  };

  window.getOrFetchActiveBundle = async function () {
    if (window._cachedActiveBundle) return window._cachedActiveBundle;
    if (_bundleFetchPromise) return _bundleFetchPromise;

    _bundleFetchPromise = (async () => {
      try {
        let masterBundles = [];

        // 1. Check LocalStorage (Immediate live changes from Admin Panel)
        try {
          const localB = JSON.parse(localStorage.getItem('AAROGYAM_BUNDLE_LANDING_PAGES') || '[]');
          if (Array.isArray(localB) && localB.length > 0) {
            masterBundles = localB;
          }
        } catch (_) {}

        // 2. Load from data/book-bundles.json (Server / Git Master)
        try {
          const res = await fetch('/data/book-bundles.json?v=' + Date.now());
          if (res.ok) {
            const data = await res.json();
            const serverBundles = Array.isArray(data) ? data : (data.bundles || []);
            if (serverBundles.length > 0) {
              if (masterBundles.length === 0) {
                masterBundles = serverBundles;
              } else {
                serverBundles.forEach(sb => {
                  if (!sb || !sb.id) return;
                  const idx = masterBundles.findIndex(m => m && m.id && m.id.toLowerCase() === sb.id.toLowerCase());
                  if (idx >= 0) {
                    if (new Date(sb.updated_at || 0) > new Date(masterBundles[idx].updated_at || 0)) {
                      masterBundles[idx] = sb;
                    }
                  } else {
                    masterBundles.push(sb);
                  }
                });
              }
            }
          }
        } catch (_) {}

        // Pick active bundle (prefer BUNDLE_KISAN_5IN1 or status active)
        const activeBundle = masterBundles.find(b => b && b.status === 'active' && b.id !== 'BUNDLE_KISAN_4IN1') 
                          || masterBundles.find(b => b && b.status === 'active') 
                          || masterBundles[0] 
                          || null;

        if (!activeBundle) return null;

        // Fetch catalog books to resolve covers and titles dynamically
        let catalogBooks = [];
        try {
          const cRes = await fetch('/data/books.json?v=' + Date.now());
          if (cRes.ok) {
            const cData = await cRes.json();
            catalogBooks = cData.books || cData || [];
          }
        } catch (_) {}

        try {
          const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
          if (Array.isArray(customBooks)) catalogBooks = [...catalogBooks, ...customBooks];
        } catch (_) {}

        // Resolve Book Objects
        const resolvedBooks = (activeBundle.bookIds || []).map(bId => {
          const cleanId = String(bId || '').toUpperCase().trim();
          const match = catalogBooks.find(b => b && String(b.id || '').toUpperCase().trim() === cleanId);
          return {
            id: cleanId,
            title: match?.heading || match?.title || match?.name || cleanId,
            cover: match?.cover || match?.thumbnail || match?.hero?.cover_image || ('/images/books/' + cleanId.toLowerCase() + '-cover.webp'),
            mrp: match?.mrp || 299,
            offerPrice: match?.offerPrice || 99
          };
        });

        // Compute dynamic MRP & Offer
        const calcMrp = activeBundle.mrp || resolvedBooks.reduce((sum, b) => sum + (Number(b.mrp) || 0), 0) || 3395;
        const offer = activeBundle.offerPrice || 199;
        const discountPct = calcMrp > offer ? Math.round(((calcMrp - offer) / calcMrp) * 100) + '%' : '94%';

        window._cachedActiveBundle = {
          ...activeBundle,
          resolvedBooks,
          computedMrp: calcMrp,
          computedOffer: offer,
          computedDiscount: discountPct
        };

        return window._cachedActiveBundle;
      } catch (err) {
        console.warn('Error fetching active bundle:', err);
        return null;
      } finally {
        _bundleFetchPromise = null;
      }
    })();

    return _bundleFetchPromise;
  };

  // Refresh all deal banners and trays across the page dynamically
  window.refreshAllMegaDealSlots = async function () {
    const bundle = await window.getOrFetchActiveBundle();
    if (!bundle) return;

    // Refresh Top Mega Deal Slots
    const dealSlots = document.querySelectorAll('#library-top-mega-deal-slot, .mega-deal-banner-container');
    dealSlots.forEach(slot => {
      slot.innerHTML = window.renderMegaDealBannerHTML(bundle);
    });

    // Refresh Grids Promo Trays
    const trays = document.querySelectorAll('.bundle-featured-promo-tray[data-dynamic-bundle]');
    trays.forEach(tray => {
      const parent = tray.parentElement;
      if (parent) {
        const temp = document.createElement('div');
        temp.innerHTML = window.renderBundlePromoCardHTML(bundle);
        const newTray = temp.firstElementChild;
        if (newTray) parent.replaceChild(newTray, tray);
      }
    });

    window.initDealCountdown();
  };

  // -------------------------------------------------------------
  // MASTER RENDER 1: FULL-WIDTH MEGA HERO DEAL BANNER (AMAZON STYLE)
  // -------------------------------------------------------------
  window.renderMegaDealBannerHTML = function (bundleInput) {
    const b = bundleInput || window._cachedActiveBundle;

    // Trigger async load in background if not ready
    if (!window._cachedActiveBundle) {
      window.getOrFetchActiveBundle().then(() => {
        window.refreshAllMegaDealSlots();
      });
    }

    const title = b?.title || '🌾 सम्पूर्ण किसान 5-इन-1 महाबचत कॉम्बो पैक';
    const subtitle = b?.subtitle || 'खेती का डॉक्टर + दवा सलाहकार + 11 सब्जी खेती + गेहूँ व चना मास्टर गाइड्स का सम्पूर्ण संग्रह!';
    const offerPrice = b?.computedOffer || b?.offerPrice || 199;
    const mrp = b?.computedMrp || b?.mrp || 3395;
    const discount = b?.computedDiscount || (mrp > offerPrice ? Math.round(((mrp - offerPrice) / mrp) * 100) + '%' : '94%');
    const bundleId = b?.id || 'BUNDLE_KISAN_5IN1';
    const bundleUrl = '/bundle.html?id=' + encodeURIComponent(bundleId);
    const buyBtnText = b?.buyBtnText || ('🛒 पूरा कॉम्बो ₹' + offerPrice + ' में अभी अनलॉक करें');

    const books = (b && Array.isArray(b.resolvedBooks) && b.resolvedBooks.length > 0)
      ? b.resolvedBooks
      : [
          { id: 'BK017', title: 'प्राकृतिक खेती', cover: '/images/books/bk017-cover.webp' },
          { id: 'BK016', title: 'दवा डायरेक्टरी', cover: '/images/books/bk016-cover.webp' },
          { id: 'BK002', title: '11 सब्जियां', cover: '/images/books/bk002-cover.webp' },
          { id: 'BK019', title: 'गेहूं की खेती', cover: '/images/books/bk019-cover.webp' },
          { id: 'BK015', title: 'चना की खेती', cover: '/images/books/bk015-cover.webp' }
        ];

    const totalBooks = books.length;
    let totalPages = '490+ रंगीन पेज';
    if (b && Array.isArray(b.heroKpis)) {
      const pMatch = b.heroKpis.find(k => String(k).includes('पेज'));
      if (pMatch) totalPages = pMatch;
    }

    // Trigger countdown ticker
    setTimeout(window.initDealCountdown, 100);

    return `
      <div class="mega-deal-banner-container" style="width: 100%; border-radius: 22px; overflow: hidden; background: radial-gradient(circle at top left, #064e3b 0%, #062413 55%, #021a12 100%); border: 2.5px solid #facc15; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45), 0 0 35px rgba(250, 204, 21, 0.28); color: #ffffff; padding: 22px 24px; box-sizing: border-box; position: relative;">
        
        <!-- Live Deal Ticker Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="background: linear-gradient(135deg, #dc2626, #ef4444); color: #ffffff; font-size: 0.8rem; font-weight: 900; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(239,68,68,0.45); animation: aiPulsePill 2s infinite ease-in-out;">
              🔥 आज का हॉट सेलिंग महा-ऑफर (Deal of the Day)
            </span>
            <span style="background: rgba(250,204,21,0.22); color: #fde047; border: 1px solid rgba(250,204,21,0.45); font-size: 0.78rem; font-weight: 800; padding: 4px 12px; border-radius: 14px;">
              ⚡ ${discount} की ऐतिहासिक बचत
            </span>
          </div>

          <!-- FOMO Countdown Timer -->
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); padding: 5px 14px; border-radius: 20px;">
            <span style="font-size: 0.8rem; color: #f1f5f9;">⏰ ऑफर समाप्त होने में:</span>
            <span class="deal-countdown-digits" style="font-size: 0.95rem; font-weight: 900; color: #facc15; font-family: 'Outfit', monospace; letter-spacing: 1px;">
              14:42
            </span>
          </div>
        </div>

        <!-- 2 Columns: Persuasive Pitch + 3D Interactive Fan Display -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px;">
          
          <!-- Left Column (Copy + Pricing + Conversion Action) -->
          <div style="flex: 1 1 340px; min-width: 280px;">
            <h2 style="margin: 0 0 8px 0; font-size: 1.55rem; font-weight: 900; line-height: 1.3; color: #ffffff; font-family: 'Outfit', sans-serif;">
              ${escapeHtml(title)}
            </h2>
            <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 0.92rem; line-height: 1.5;">
              ${escapeHtml(subtitle)}
            </p>

            <!-- 4 Badges Pillars -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
              <span style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 800; color: #ffffff;">
                📚 ${totalBooks} सम्पूर्ण ई-बुक्स
              </span>
              <span style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 800; color: #ffffff;">
                📄 ${totalPages}
              </span>
              <span style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 800; color: #ffffff;">
                🎯 100% वैज्ञानिक गाइड
              </span>
              <span style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 800; color: #ffffff;">
                ⚡ लाइफटाइम लाइब्रेरी एक्सेस
              </span>
            </div>

            <!-- Price & Call-To-Action (Amazon Lightning Deal Styling) -->
            <div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap;">
              <div>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                  <span style="font-size: 2.1rem; font-weight: 900; color: #facc15; font-family: 'Outfit', sans-serif; line-height: 1;">
                    ₹${offerPrice}
                  </span>
                  <span style="font-size: 1.1rem; color: #94a3b8; text-decoration: line-through; font-weight: 600;">
                    ₹${mrp}
                  </span>
                </div>
                <div style="font-size: 0.78rem; color: #4ade80; font-weight: 800; margin-top: 4px;">
                  (कुल सीधी बचत: ₹${Math.max(0, mrp - offerPrice)})
                </div>
              </div>

              <!-- High-Converting Pulsing Buy Button -->
              <a href="${bundleUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; font-weight: 900; font-size: 1rem; padding: 13px 24px; border-radius: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 8px 24px rgba(245,158,11,0.5); border: 1px solid #fde047; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                <span>${escapeHtml(buyBtnText)}</span>
                <span style="font-size: 1.2rem;">→</span>
              </a>
            </div>
          </div>

          <!-- Right Column: 3D Interactive Miniature Books Stack -->
          <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: center; position: relative; width: 310px; height: 190px; margin: 10px auto; cursor: pointer;" onclick="window.location.href='${bundleUrl}'" title="क्लिक करके ${totalBooks}-इन-1 कॉम्बो ऑफर देखें">
            ${books.map((bk, i) => {
              const centerIdx = Math.floor(totalBooks / 2);
              const offsetStep = totalBooks > 1 ? Math.min(42, 170 / (totalBooks - 1)) : 0;
              const x = (i - (totalBooks - 1) / 2) * offsetStep;
              const r = (i - (totalBooks - 1) / 2) * 7;
              const z = (i === centerIdx) ? 8 : (6 - Math.abs(i - centerIdx));
              const isCenter = (i === centerIdx);
              return `
                <div style="position: absolute; left: 50%; transform: translateX(-50%) translateX(${x}px) translateY(${Math.abs(r)*0.8}px) rotate(${r}deg); z-index: ${z}; width: 95px; height: 140px; border-radius: 8px; overflow: hidden; box-shadow: 0 14px 30px rgba(0,0,0,0.65); border: ${isCenter ? '2.5px solid #22c55e' : '1px solid rgba(255,255,255,0.3)'}; transition: transform 0.3s ease; background: #0f172a;">
                  <img src="${bk.cover}" alt="${escapeHtml(bk.title)}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';" />
                </div>
              `;
            }).join('')}
          </div>

        </div>

      </div>
    `;
  };

  // -------------------------------------------------------------
  // MASTER RENDER 2: GRID-COMPATIBLE PROMO TRAY (FOR SHELVES)
  // -------------------------------------------------------------
  window.renderBundlePromoCardHTML = function (bundleInput) {
    return window.renderMegaDealBannerHTML(bundleInput);
  };

  // Auto-init badges on DOM load
  document.addEventListener('DOMContentLoaded', function () {
    window.AarogyamWishlist.updateBadges();
    window.AarogyamCart.updateBadges();
  });
})();

