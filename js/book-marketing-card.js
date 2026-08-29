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
    const isComingSoon = book.isComingSoon === true || book.is_coming_soon === true || book.badge === 'coming_soon' || book.status === 'coming_soon';
    
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

          <!-- Modern Action Buttons Bar (Add Cart Blue, Buy Now Orange, Share Now Native & Share Drawer) -->
          <div class="card-actions-container">
            ${isComingSoon ? `
              <button type="button" class="btn-pre-interest" onclick="window.openComingSoonModal('${bId}', '${title}')">
                🔔 Pre-Interest / Notify
              </button>
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
                  onclick="window.nativeDirectShare('${bId}', '${title}', ${offerPrice})"
                  title="सीधे मोबाइल में शेयर करें"
                >
                  <i class="fa-brands fa-whatsapp"></i> <span>Share Now</span>
                </button>

                <!-- 4. Share By (Channels Drawer) -->
                <button 
                  type="button" 
                  class="btn-card-share-channels" 
                  onclick="window.openShareDrawer('${bId}', '${title}', ${offerPrice})"
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
