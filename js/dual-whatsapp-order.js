/**
 * Aarogyam India - Physical Product Catalog & Dual WhatsApp Order Engine
 * Manual Dispatch System:
 * - Button 1: Central Aarogyam Helpline (7974422572)
 * - Button 2: Upline / Referrer Sponsor (via ?ref= or localStorage or prompt)
 * Zero Egress, Local Real-Time MRP Calculation
 */

(function () {
  'use strict';

  const AAROGYAM_CENTRAL_PHONE = '917974422572';

  // Read referrer from URL if provided (e.g., ?ref=9876543210)
  const urlParams = new URLSearchParams(window.location.search);
  const refFromUrl = urlParams.get('ref') || urlParams.get('sponsor') || urlParams.get('upline');
  if (refFromUrl) {
    const cleanRef = refFromUrl.replace(/\D/g, '');
    if (cleanRef.length >= 10) {
      localStorage.setItem('aarogyam_upline_phone', cleanRef);
    }
  }

  // Selected products state
  let selectedProducts = new Map();

  function getUserName() {
    return localStorage.getItem('aarogyam_user_name') || 
           localStorage.getItem('user_name') || 
           localStorage.getItem('farmer_name') || 
           'साथी / किसान भाई';
  }

  function getPageTopic() {
    const heading = document.querySelector('h1')?.innerText || document.title || 'आरोग्यम उत्पाद';
    return heading.replace(/\s+/g, ' ').trim();
  }

  // Inject or update the Sticky WhatsApp Order Drawer
  function updateOrderDrawer() {
    let drawer = document.getElementById('sticky-whatsapp-order-drawer');
    const totalCount = selectedProducts.size;

    if (totalCount === 0) {
      if (drawer) {
        drawer.style.transform = 'translateY(120%)';
      }
      return;
    }

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'sticky-whatsapp-order-drawer';
      drawer.className = 'sticky-order-drawer-wrap';
      document.body.appendChild(drawer);
    }

    let totalMrp = 0;
    selectedProducts.forEach(item => {
      totalMrp += Number(item.mrp) || 0;
    });

    const uplinePhone = localStorage.getItem('aarogyam_upline_phone') || '';

    drawer.innerHTML = `
      <div class="container sticky-order-drawer-content">
        <div class="order-summary-info">
          <div class="order-count-pill">
            <span class="order-counter-badge">${totalCount}</span>
            <span>उत्पाद चुने गए</span>
          </div>
          <div class="order-mrp-total">
            कुल MRP: <strong>₹${totalMrp.toLocaleString('en-IN')}</strong>
            <span class="order-discount-hint">(व्हाट्सएप पर विशेष छूट उपलब्ध)</span>
          </div>
        </div>

        <div class="order-actions-dual">
          <!-- Button 1: Central Aarogyam Helpline -->
          <button type="button" class="btn-wa-order btn-wa-aarogyam" onclick="window.sendWhatsAppOrder('admin')">
            <i class="fa-brands fa-whatsapp"></i>
            <div class="wa-btn-text">
              <span class="wa-btn-title">आरोग्यम मुख्य हेल्पलाइन</span>
              <span class="wa-btn-sub">7974422572 पर भेजें</span>
            </div>
          </button>

          <!-- Button 2: Upline / Referrer -->
          <button type="button" class="btn-wa-order btn-wa-upline" onclick="window.sendWhatsAppOrder('upline')">
            <i class="fa-solid fa-user-check"></i>
            <div class="wa-btn-text">
              <span class="wa-btn-title">सलाहकार / अपलाइन</span>
              <span class="wa-btn-sub">${uplinePhone ? 'नंबर: ' + uplinePhone.slice(-4) + '...' : 'नंबर दर्ज करें'}</span>
            </div>
          </button>
        </div>
      </div>
    `;

    drawer.style.transform = 'translateY(0)';
  }

  // Construct structured WhatsApp message and dispatch
  window.sendWhatsAppOrder = function (target) {
    if (selectedProducts.size === 0) {
      alert('कृपया पहले कम से कम एक उत्पाद चुनें!');
      return;
    }

    let targetPhone = AAROGYAM_CENTRAL_PHONE;

    if (target === 'upline') {
      let savedUpline = localStorage.getItem('aarogyam_upline_phone') || '';
      if (!savedUpline || savedUpline.trim() === '') {
        const inputPhone = prompt('कृपया अपने सलाहकार/अपलाइन का 10 अंकों का व्हाट्सएप नंबर दर्ज करें:', '');
        if (!inputPhone) return;
        const clean = inputPhone.replace(/\D/g, '');
        if (clean.length < 10) {
          alert('अमान्य फोन नंबर! कृपया 10 अंकों का वैध व्हाट्सएप नंबर डालें।');
          return;
        }
        savedUpline = clean.length === 10 ? '91' + clean : clean;
        localStorage.setItem('aarogyam_upline_phone', savedUpline);
      }
      targetPhone = savedUpline;
    }

    const userName = getUserName();
    const topic = getPageTopic();

    let productLines = '';
    let totalMrp = 0;
    let idx = 1;

    selectedProducts.forEach(item => {
      productLines += `${idx}. *${item.name}* - ₹${item.mrp}\n`;
      totalMrp += Number(item.mrp) || 0;
      idx++;
    });

    const message = `🌿 *आरोग्यम इंडिया - नया उत्पाद परामर्श व ऑर्डर* 🌿\n\n` +
      `👤 *ग्राहक का नाम:* ${userName}\n` +
      `📋 *समस्या / विषय:* ${topic}\n\n` +
      `📦 *चुने गए उत्पाद:*\n${productLines}\n` +
      `💰 *कुल अनुमानित MRP:* ₹${totalMrp.toLocaleString('en-IN')}\n\n` +
      `ℹ️ *नोट:* कृपया मुझे इस समस्या के लिए सही उपयोग विधि, विशेष डिस्काउंट और घर तक डिलीवरी की जानकारी प्रदान करें। धन्यवाद!`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  };

  // Toggle selection for a product card
  window.toggleProductSelection = function (btn, productId, name, mrp) {
    if (selectedProducts.has(productId)) {
      selectedProducts.delete(productId);
      btn.classList.remove('selected');
      btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> ऑर्डर सूची में जोड़ें';
    } else {
      selectedProducts.set(productId, { id: productId, name, mrp });
      btn.classList.add('selected');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> चुना गया (हटाएं)';
    }
    updateOrderDrawer();
  };

  // Inject Drawer CSS styles dynamically
  function injectStyles() {
    if (document.getElementById('dual-whatsapp-order-styles')) return;

    const style = document.createElement('style');
    style.id = 'dual-whatsapp-order-styles';
    style.textContent = `
      .sticky-order-drawer-wrap {
        position: fixed;
        bottom: 60px;
        left: 0;
        right: 0;
        background: #0f172a;
        color: #ffffff;
        border-top: 2px solid #22c55e;
        box-shadow: 0 -8px 25px rgba(0,0,0,0.3);
        z-index: 9985;
        padding: 10px 0 calc(10px + env(safe-area-inset-bottom, 0px)) 0;
        transform: translateY(120%);
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .sticky-order-drawer-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .order-summary-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .order-count-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        font-size: 0.9rem;
      }
      .order-counter-badge {
        background: #22c55e;
        color: #000;
        font-size: 0.8rem;
        font-weight: 900;
        padding: 2px 8px;
        border-radius: 12px;
      }
      .order-mrp-total {
        font-size: 0.95rem;
        color: #fde047;
      }
      .order-discount-hint {
        font-size: 0.72rem;
        color: #94a3b8;
        display: block;
      }
      .order-actions-dual {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .btn-wa-order {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        border-radius: 24px;
        border: none;
        cursor: pointer;
        font-weight: 800;
        color: #fff;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      }
      .btn-wa-order:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.35);
      }
      .btn-wa-order i {
        font-size: 1.3rem;
      }
      .wa-btn-text {
        display: flex;
        flex-direction: column;
        text-align: left;
      }
      .wa-btn-title {
        font-size: 0.82rem;
        line-height: 1.1;
      }
      .wa-btn-sub {
        font-size: 0.68rem;
        opacity: 0.85;
      }
      .btn-wa-aarogyam {
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      }
      .btn-wa-upline {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      }
      .product-order-toggle-btn {
        width: 100%;
        padding: 9px 14px;
        border-radius: 10px;
        border: 1.5px solid #16a34a;
        background: #f0fdf4;
        color: #16a34a;
        font-weight: 800;
        font-size: 0.85rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;
      }
      .product-order-toggle-btn:hover {
        background: #16a34a;
        color: #ffffff;
      }
      .product-order-toggle-btn.selected {
        background: #22c55e;
        color: #ffffff;
        border-color: #16a34a;
      }
      @media (max-width: 640px) {
        .sticky-order-drawer-wrap {
          bottom: 56px;
          padding: 8px 12px;
        }
        .order-actions-dual {
          width: 100%;
          justify-content: space-between;
        }
        .btn-wa-order {
          flex: 1;
          padding: 7px 10px;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }
})();
