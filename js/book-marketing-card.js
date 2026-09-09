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

  // 3A. Direct Native Share (Button 1: Share Now - Native OS Share)
  window.nativeDirectShare = function (bId, title, price) {
    const data = buildBookSharePayload(bId, title, price);
    if (navigator.share) {
      navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      }).catch(err => {
        if (err.name !== 'AbortError') {
          window.openShareDrawer(bId, title, price);
        }
      });
    } else {
      window.openShareDrawer(bId, title, price);
    }
  };

  // 3B. Animated Social Channels (5 Sharp Buttons Stack with Transparent Background)
  window.openShareDrawer = function (bId, title, price) {
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
        <a href="https://api.whatsapp.com/send?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-whatsapp" onclick="window.closeShareDrawer()">
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
    const isLiveAgri = (bId === 'BK001' || bId === 'BK002' || bId === 'SUB001');
    const isComingSoon = !isLiveAgri && (
      book.isComingSoon === true || 
      book.is_coming_soon === true || 
      book.badge === 'coming_soon' || 
      book.store_badge === 'coming_soon' || 
      book.status === 'coming_soon' || 
      book.status !== 'active'
    );
    
    // Store Badge Calculation
    let badgeText = 'Launch Offer';
    let badgeClass = 'badge-offer';
    if (isComingSoon) {
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
    let featuresList = ['🌱 120+ रंगीन पेज', '📷 300+ फोटो', '🧪 स्प्रे साइंस', '📱 Mobile PDF'];
    if (book.features && Array.isArray(book.features) && book.features.length > 0) {
      featuresList = book.features.map(f => typeof f === 'object' ? (f.text || '') : f).filter(Boolean);
    }

    const jsonPayload = JSON.stringify({
      id: bId,
      heading: title,
      name: title,
      offerPrice: offerPrice,
      mrp: mrp,
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
            <span class="card-rating-count">(120+ रिव्यूज)</span>
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
          <div class="card-price-block">
            <div class="card-prices">
              <span class="card-offer-price">₹${offerPrice}</span>
              <span class="card-mrp">₹${mrp}</span>
              <span class="card-save-badge">${discountPercent}% छूट</span>
            </div>
            <div class="card-savings-text">आप बचाएंगे ₹${mrp - offerPrice}</div>
          </div>

          <!-- Action Buttons Bar: Coming Soon Wishlist / Buy Now Controls -->
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Auto-init badges on DOM load
  document.addEventListener('DOMContentLoaded', function () {
    window.AarogyamWishlist.updateBadges();
    window.AarogyamCart.updateBadges();
  });
})();
