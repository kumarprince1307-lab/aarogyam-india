/* ==========================================================
   AAROGYAM INDIA — CART ENGINE JAVASCRIPT (V21.0)
   - Loads items from localStorage AI_CART_ITEMS
   - Auto-calculates MRP, Discount, and Total Payable
   - Calculates the ₹1,999 VIP Free inclusion value stack
   - Redirects to checkout.html?ids=... for multi-book purchase
   ========================================================== */

(function () {
  'use strict';

  let allBooks = [];
  let cartItems = [];

  document.addEventListener('DOMContentLoaded', initCart);

  async function initCart() {
    await fetchBooks();
    loadCartFromStorage();
    renderCart();
    bindCartEvents();
  }

  async function fetchBooks() {
    try {
      const res = await fetch('/data/books.json?v=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        allBooks = json.books || [];
      }
    } catch (e) {
      console.warn('Could not fetch books.json', e);
    }

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
      const landingList = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
      if (Array.isArray(landingList)) {
        landingList.forEach(lp => {
          if (!lp || !lp.id) return;
          const idx = allBooks.findIndex(x => x.id && x.id.toUpperCase() === lp.id.toUpperCase());
          const synth = {
            id: lp.id,
            heading: lp.hero?.title || lp.id,
            name: lp.hero?.title || lp.id,
            category: lp.category || 'Agriculture',
            mrp: lp.hero?.mrp || 299,
            offerPrice: lp.hero?.offer_price || 99,
            cover: lp.hero?.cover_image || "/images/books/kharif-master-guide-2026-cover.webp"
          };
          if (idx >= 0) allBooks[idx] = Object.assign({}, allBooks[idx], synth);
          else allBooks.unshift(synth);
        });
      }
    } catch (e) {}
  }

  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem('AI_CART_ITEMS');
      cartItems = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cartItems)) cartItems = [];
      
      // Default to BK001 if cart is empty
      if (cartItems.length === 0) {
        const params = new URLSearchParams(window.location.search);
        const addId = params.get('add') || params.get('id');
        if (addId) {
          cartItems.push(addId.toUpperCase());
          localStorage.setItem('AI_CART_ITEMS', JSON.stringify(cartItems));
        }
      }
    } catch (e) {
      cartItems = [];
    }
  }

  function renderCart() {
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('cart-count-badge');
    const countText = document.getElementById('cart-items-count-text');
    const mrpTotalEl = document.getElementById('stack-mrp-total');
    const discTotalEl = document.getElementById('stack-discount-total');
    const payTotalEl = document.getElementById('stack-payable-total');

    if (badge) badge.textContent = cartItems.length;
    if (countText) countText.textContent = `${cartItems.length} पुस्तकें`;

    if (!container) return;

    if (cartItems.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <span style="font-size: 3rem;">🛒</span>
          <h3 style="color: #64748b; margin-top: 10px;">आपका कार्ट खाली है</h3>
          <p style="font-size: 0.88rem; color: #94a3b8;">अपनी पसंद की डिजिटल ई-बुक्स चुनें और विशेष छूट का लाभ उठाएं।</p>
          <a href="agriculture.html" style="background: #2E7D32; color: #fff; padding: 10px 24px; border-radius: 50px; text-decoration: none; font-weight: 800; display: inline-block; margin-top: 10px;">
            📚 ई-बुक्स देखें
          </a>
        </div>
      `;
      if (mrpTotalEl) mrpTotalEl.textContent = '₹0';
      if (discTotalEl) discTotalEl.textContent = '- ₹0';
      if (payTotalEl) payTotalEl.textContent = '₹0';
      return;
    }

    let sumMrp = 0;
    let sumOffer = 0;

    container.innerHTML = cartItems.map((bId, idx) => {
      const cleanKey = String(bId).trim().toLowerCase();
      const b = allBooks.find(x => (x.id && x.id.toLowerCase() === cleanKey) || (x.slug && x.slug.toLowerCase() === cleanKey)) || {
        id: bId,
        heading: (cleanKey === 'bk001' || cleanKey === 'kharif-2026') ? 'खरीफ फसल मास्टर गाइड 2026' : ((cleanKey === 'bk002' || cleanKey === 'kheti-dr' || cleanKey === 'fasal-ka-doctor') ? 'खेती का डॉक्टर (Pocket Doctor)' : 'Aarogyam India eBook'),
        category: 'Agriculture',
        mrp: 299,
        offerPrice: 99,
        cover: (cleanKey === 'bk002' || cleanKey === 'kheti-dr' || cleanKey === 'fasal-ka-doctor') ? '../images/books/fasal-ka-doctor-cover.webp' : '../images/books/kharif-master-guide-2026-cover.webp'
      };

      const mrp = b.mrp || 299;
      const price = b.offerPrice || 99;
      sumMrp += mrp;
      sumOffer += price;

      return `
        <div class="cart-item-row">
          <img src="${b.cover || b.thumbnail || '../images/books/kharif-master-guide-2026-cover.webp'}" alt="${escapeHtml(b.heading || b.name)}" class="cart-item-thumb">
          <div>
            <div class="cart-item-title">${escapeHtml(b.heading || b.name)}</div>
            <div class="cart-item-cat">📁 ${escapeHtml(b.category || 'Agriculture')} • 2026 Edition</div>
            <span style="font-size: 0.75rem; background: rgba(34,197,94,0.15); color: #16a34a; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">
              ✅ Lifetime Access & Download
            </span>
          </div>
          <div style="text-align: right;">
            <div class="cart-item-price">₹${price}</div>
            <span class="cart-item-mrp">₹${mrp}</span>
          </div>
          <div>
            <button type="button" onclick="window.removeCartItem(${idx})" class="cart-remove-btn" title="हटाएं">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Total Value Stack Math
    // Value includes ₹1,999 (VIP Subscription) + ₹199 (Bonus Spray Chart) + Book MRP
    const totalMarketValue = sumMrp + 1999 + 199;
    const totalSavings = totalMarketValue - sumOffer;

    if (mrpTotalEl) mrpTotalEl.textContent = `₹${sumMrp}`;
    if (discTotalEl) discTotalEl.textContent = `- ₹${totalSavings}`;
    if (payTotalEl) payTotalEl.textContent = `₹${sumOffer}`;
  }

  window.removeCartItem = function (idx) {
    cartItems.splice(idx, 1);
    localStorage.setItem('AI_CART_ITEMS', JSON.stringify(cartItems));
    renderCart();
  };

  function bindCartEvents() {
    document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
      if (confirm('क्या आप कार्ट की सभी पुस्तकें हटाना चाहते हैं?')) {
        cartItems = [];
        localStorage.setItem('AI_CART_ITEMS', JSON.stringify(cartItems));
        renderCart();
      }
    });

    document.getElementById('btn-proceed-checkout')?.addEventListener('click', () => {
      if (cartItems.length === 0) {
        alert('कृपया पहले कोई पुस्तक चुनें!');
        return;
      }
      const idsParam = cartItems.join(',');
      window.location.href = `checkout.html?ids=${encodeURIComponent(idsParam)}`;
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
