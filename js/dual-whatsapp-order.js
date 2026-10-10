/**
 * Aarogyam India - Physical Product Catalog & Persistent WhatsApp Cart Engine
 * Features:
 * - Hidden by default until items are added
 * - Persists in localStorage ('aarogyam_whatsapp_cart')
 * - Expandable drawer with item thumbnail, name, MRP, quantity controls, and cross '✕' removal
 * - Dual WhatsApp Dispatch: Aarogyam Helpline (7974422572) & Upline Sponsor
 */

(function () {
  'use strict';

  const CART_STORAGE_KEY = 'aarogyam_whatsapp_cart';

  // Read referrer from URL or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const refFromUrl = urlParams.get('ref') || urlParams.get('sponsor') || urlParams.get('upline') || urlParams.get('share_id') || urlParams.get('r') || urlParams.get('aff');
  if (refFromUrl) {
    const cleanRef = refFromUrl.replace(/\D/g, '');
    if (cleanRef.length >= 10) {
      localStorage.setItem('aarogyam_upline_phone', cleanRef.slice(-10));
      localStorage.setItem('aim_ns_sponsor_phone', '91' + cleanRef.slice(-10));
    } else {
      localStorage.setItem('aim_last_sponsor_id', refFromUrl.trim().toUpperCase());
      localStorage.setItem('AOI_REFERRER_ID', refFromUrl.trim().toUpperCase());
    }
  }

  let currentAdvisorData = {
    name: 'आरोग्यम सलाहकार',
    phone: '917974422572',
    display: '7974422572',
    isPersonalized: false
  };

  async function resolveCurrentAdvisor() {
    try {
      // 1. Direct from URL
      if (refFromUrl) {
        const cleanRef = refFromUrl.replace(/\D/g, '');
        if (cleanRef.length >= 10 && cleanRef !== '7974422572') {
          currentAdvisorData = {
            name: 'अधिकृत विक्रेता',
            phone: '91' + cleanRef.slice(-10),
            display: cleanRef.slice(-10),
            isPersonalized: true
          };
          updateDrawerAdvisorLabel();
          return currentAdvisorData;
        }

        if (refFromUrl.trim().toUpperCase() !== 'AI000004' && cleanRef.length < 10) {
          const uplineId = refFromUrl.trim().toUpperCase();
          const activeDb = window.supabaseClient || window.db || (window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient('https://qjhjrzsnrtahmhswxyvb.supabase.co', 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU') : null);
          if (activeDb) {
            const { data: prof } = await activeDb.from('profiles').select('full_name, mobile').or(`share_id.eq.${uplineId},referral_code.eq.${uplineId}`).limit(1).maybeSingle();
            if (prof && prof.mobile) {
              const mob = String(prof.mobile).replace(/\D/g, '').slice(-10);
              if (mob.length === 10) {
                currentAdvisorData = {
                  name: prof.full_name || 'अधिकृत विक्रेता',
                  phone: '91' + mob,
                  display: mob,
                  isPersonalized: true
                };
                updateDrawerAdvisorLabel();
                return currentAdvisorData;
              }
            }
          }
        }
      }

      // 2. NO URL Referral -> Dynamic Check for Active Logged-in User
      let currentUser = null;
      if (window.V1_SESSION && typeof window.V1_SESSION.getCurrentUser === 'function') {
        currentUser = window.V1_SESSION.getCurrentUser();
      }
      if (!currentUser) {
        try { currentUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}'); } catch(e) {}
      }

      const currentMobile = currentUser && currentUser.mobile ? String(currentUser.mobile).replace(/\D/g, '').slice(-10) : '';

      if (currentMobile && currentMobile.length === 10) {
        const userCacheKey = 'aim_upline_for_user_' + currentMobile;
        const cached = localStorage.getItem(userCacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.phone) {
              currentAdvisorData = {
                name: parsed.name || 'अधिकृत विक्रेता',
                phone: parsed.phone,
                display: parsed.phone.slice(-10),
                isPersonalized: parsed.isPersonalized !== false
              };
              updateDrawerAdvisorLabel();
              return currentAdvisorData;
            }
          } catch(e) {}
        }

        const db = window.supabaseClient || window.db || null;
        let sponsorProf = null;

        if (db) {
          const { data: myProf } = await db.from('profiles')
            .select('id, full_name, mobile, referral_code, referral_mobile, referred_by')
            .eq('mobile', currentMobile)
            .limit(1)
            .maybeSingle();

          if (myProf) {
            if (myProf.referred_by) {
              const { data: upProf } = await db.from('profiles').select('id, full_name, mobile').eq('id', myProf.referred_by).limit(1).maybeSingle();
              if (upProf && upProf.mobile) sponsorProf = upProf;
            }
            if (!sponsorProf && myProf.referral_code && myProf.referral_code.toUpperCase() !== 'AI000004') {
              const { data: upProf } = await db.from('profiles').select('id, full_name, mobile').or(`share_id.eq.${myProf.referral_code},referral_code.eq.${myProf.referral_code}`).limit(1).maybeSingle();
              if (upProf && upProf.mobile) sponsorProf = upProf;
            }
            if (!sponsorProf && myProf.referral_mobile) {
              const cleanRefMob = String(myProf.referral_mobile).replace(/\D/g, '').slice(-10);
              if (cleanRefMob.length === 10 && cleanRefMob !== '7974422572') {
                const { data: upProf } = await db.from('profiles').select('id, full_name, mobile').eq('mobile', cleanRefMob).limit(1).maybeSingle();
                if (upProf && upProf.mobile) sponsorProf = upProf;
                else sponsorProf = { full_name: 'अधिकृत विक्रेता', mobile: cleanRefMob };
              }
            }
          }
        } else {
          // Direct REST fetch fallback
          const sbKey = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
          const myRes = await fetch(`https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/profiles?mobile=eq.${encodeURIComponent(currentMobile)}&select=id,referral_code,referral_mobile,referred_by&limit=1`, {
            headers: { 'apikey': sbKey, 'Authorization': 'Bearer ' + sbKey }
          });
          if (myRes.ok) {
            const myRows = await myRes.json();
            const myProf = myRows && myRows[0];
            if (myProf) {
              if (myProf.referred_by) {
                const upRes = await fetch(`https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/profiles?id=eq.${encodeURIComponent(myProf.referred_by)}&select=full_name,mobile&limit=1`, {
                  headers: { 'apikey': sbKey, 'Authorization': 'Bearer ' + sbKey }
                });
                if (upRes.ok) {
                  const upRows = await upRes.json();
                  if (upRows && upRows[0] && upRows[0].mobile) sponsorProf = upRows[0];
                }
              }
              if (!sponsorProf && myProf.referral_code && myProf.referral_code.toUpperCase() !== 'AI000004') {
                const upRes = await fetch(`https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/profiles?or=(share_id.eq.${encodeURIComponent(myProf.referral_code)},referral_code.eq.${encodeURIComponent(myProf.referral_code)})&select=full_name,mobile&limit=1`, {
                  headers: { 'apikey': sbKey, 'Authorization': 'Bearer ' + sbKey }
                });
                if (upRes.ok) {
                  const upRows = await upRes.json();
                  if (upRows && upRows[0] && upRows[0].mobile) sponsorProf = upRows[0];
                }
              }
            }
          }
        }

        if (sponsorProf && sponsorProf.mobile) {
          const mob = String(sponsorProf.mobile).replace(/\D/g, '').slice(-10);
          if (mob.length === 10 && mob !== '7974422572') {
            currentAdvisorData = {
              name: sponsorProf.full_name || 'अधिकृत विक्रेता',
              phone: '91' + mob,
              display: mob,
              isPersonalized: true
            };
            try {
              localStorage.setItem(userCacheKey, JSON.stringify({
                name: currentAdvisorData.name,
                phone: currentAdvisorData.phone,
                isPersonalized: true
              }));
            } catch(e) {}
            updateDrawerAdvisorLabel();
            return currentAdvisorData;
          }
        }

        // Direct user with no upline in DB
        currentAdvisorData = {
          name: 'आरोग्यम मुख्य सलाहकार',
          phone: '917974422572',
          display: '7974422572',
          isPersonalized: false
        };
        try {
          localStorage.setItem(userCacheKey, JSON.stringify({
            name: currentAdvisorData.name,
            phone: currentAdvisorData.phone,
            isPersonalized: false
          }));
        } catch(e) {}
        updateDrawerAdvisorLabel();
        return currentAdvisorData;
      }

      // 3. Guest User -> Default Official Advisor
      currentAdvisorData = {
        name: 'आरोग्यम मुख्य सलाहकार',
        phone: '917974422572',
        display: '7974422572',
        isPersonalized: false
      };
    } catch(e) {
      console.warn('[WhatsAppOrder] Advisor resolution notice:', e);
    }

    updateDrawerAdvisorLabel();
    return currentAdvisorData;
  }

  function updateDrawerAdvisorLabel() {
    const el = document.getElementById('wa-drawer-advisor-sub');
    if (el) {
      el.textContent = `${currentAdvisorData.name} (${currentAdvisorData.display})`;
    }
  }

  // Cart state stored as Array of items: [{ id, name, mrp, img, dose, qty }]
  let cartItems = [];
  let isDrawerExpanded = false;

  function loadCart() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        cartItems = JSON.parse(saved);
        if (!Array.isArray(cartItems)) cartItems = [];
      }
    } catch (e) {
      cartItems = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {}
  }

  function getUserName() {
    return localStorage.getItem('aarogyam_user_name') || 
           localStorage.getItem('user_name') || 
           localStorage.getItem('farmer_name') || 
           'किसान साथी';
  }

  function getUserPhone() {
    return localStorage.getItem('aarogyam_user_phone') || '';
  }

  function getPageTopic() {
    const heading = document.querySelector('h1')?.innerText || document.title || 'आरोग्यम उत्पाद';
    return heading.replace(/\s+/g, ' ').trim();
  }

  // Update Drawer UI
  function updateOrderDrawer() {
    let drawer = document.getElementById('sticky-whatsapp-order-drawer');
    const totalCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);

    if (totalCount === 0) {
      if (drawer) {
        drawer.style.transform = 'translateY(120%)';
        drawer.style.display = 'none';
      }
      syncPageButtonStates();
      return;
    }

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'sticky-whatsapp-order-drawer';
      drawer.className = 'sticky-order-drawer-wrap';
      document.body.appendChild(drawer);
    }

    drawer.style.display = 'block';

    let totalMrp = 0;
    cartItems.forEach(item => {
      totalMrp += (Number(item.mrp) || 0) * (item.qty || 1);
    });

    resolveCurrentAdvisor();

    drawer.innerHTML = `
      <div class="container sticky-order-drawer-content">
        <!-- Drawer Header / Top Summary -->
        <div class="order-summary-row" style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-wrap:wrap; gap:10px;">
          <div class="order-summary-info" style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.toggleWhatsAppCartExpand()">
            <div class="order-count-pill" style="display:flex; align-items:center; gap:6px; font-weight:800; font-size:0.9rem;">
              <span class="order-counter-badge" style="background:#22c55e; color:#000; font-size:0.8rem; font-weight:900; padding:2px 8px; border-radius:12px;">${totalCount}</span>
              <span>🛒 उत्पाद कार्ट</span>
              <span style="font-size:0.75rem; color:#38bdf8; text-decoration:underline;">(${isDrawerExpanded ? 'बंद करें ▲' : 'सूची देखें ▼'})</span>
            </div>
            <div class="order-mrp-total" style="font-size:0.95rem; color:#fde047; font-weight:800;">
              कुल: ₹${totalMrp.toLocaleString('en-IN')}
            </div>
          </div>

          <div class="order-actions-single" style="display:flex; align-items:center; gap:10px;">
            <!-- Dedicated Referral Salahkar Button (Only Advisor) -->
            <button type="button" class="btn-wa-order btn-wa-upline" onclick="window.sendWhatsAppOrder()" style="background:linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
              <i class="fa-solid fa-user-check"></i>
              <div class="wa-btn-text">
                <span class="wa-btn-title">सलाहकार को ऑर्डर भेजें</span>
                <span class="wa-btn-sub" id="wa-drawer-advisor-sub">${currentAdvisorData.name} (${currentAdvisorData.display})</span>
              </div>
            </button>

            <!-- Drawer Close Icon -->
            <button type="button" onclick="window.toggleWhatsAppCartExpand()" style="background:rgba(255,255,255,0.12); border:none; color:#cbd5e1; width:28px; height:28px; border-radius:50%; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:center;" title="सूची देखें/छुपाएं">
              ${isDrawerExpanded ? '✕' : '▲'}
            </button>
          </div>
        </div>

        <!-- Expandable Itemized Cart Tray -->
        <div id="wa-cart-items-tray" style="display:${isDrawerExpanded ? 'block' : 'none'}; width:100%; max-height:220px; overflow-y:auto; margin-top:10px; padding-top:10px; border-top:1px solid #334155;">
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${cartItems.map((item, idx) => `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#1e293b; padding:8px 12px; border-radius:10px; border:1px solid #334155; gap:10px;">
                <div style="display:flex; align-items:center; gap:10px; flex:1; overflow:hidden;">
                  ${item.img ? `<img src="${item.img}" alt="${item.name}" style="width:34px; height:34px; object-fit:cover; border-radius:6px; border:1px solid #475569;" onerror="this.style.display='none'">` : '<span style="font-size:1.2rem;">📦</span>'}
                  <div style="overflow:hidden;">
                    <div style="font-size:0.84rem; font-weight:800; color:#ffffff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${item.name}
                    </div>
                    <div style="font-size:0.75rem; color:#94a3b8;">
                      ₹${item.mrp} × ${item.qty || 1} = <strong style="color:#86efac;">₹${((Number(item.mrp) || 0) * (item.qty || 1)).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                <!-- Quantity Controls & Cross Removal -->
                <div style="display:flex; align-items:center; gap:6px;">
                  <button type="button" onclick="window.changeWhatsAppCartQty('${item.id}', -1)" style="background:#334155; border:none; color:#fff; width:24px; height:24px; border-radius:6px; font-weight:900; cursor:pointer;">-</button>
                  <span style="font-size:0.82rem; font-weight:800; color:#fde047; min-width:18px; text-align:center;">${item.qty || 1}</span>
                  <button type="button" onclick="window.changeWhatsAppCartQty('${item.id}', 1)" style="background:#334155; border:none; color:#fff; width:24px; height:24px; border-radius:6px; font-weight:900; cursor:pointer;">+</button>
                  <button type="button" onclick="window.removeWhatsAppCartItem('${item.id}')" style="background:#ef4444; border:none; color:#fff; width:24px; height:24px; border-radius:6px; font-size:0.75rem; font-weight:900; cursor:pointer; margin-left:4px;" title="हटाएं">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    drawer.style.transform = 'translateY(0)';
    syncPageButtonStates();
  }

  window.toggleWhatsAppCartExpand = function () {
    isDrawerExpanded = !isDrawerExpanded;
    updateOrderDrawer();
  };

  window.changeWhatsAppCartQty = function (productId, delta) {
    const item = cartItems.find(x => x.id === productId);
    if (!item) return;
    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) {
      cartItems = cartItems.filter(x => x.id !== productId);
    }
    saveCart();
    updateOrderDrawer();
  };

  window.removeWhatsAppCartItem = function (productId) {
    cartItems = cartItems.filter(x => x.id !== productId);
    saveCart();
    updateOrderDrawer();
  };

  // Sync button styles on page (added vs not added)
  function syncPageButtonStates() {
    document.querySelectorAll('.product-order-toggle-btn, .btn-add-to-cart').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      const match = onclickAttr.match(/toggleProductSelection\([^,]+,\s*['"]([^'"]+)['"]/);
      if (match && match[1]) {
        const pId = match[1];
        const isPresent = cartItems.some(x => x.id === pId);
        if (isPresent) {
          btn.classList.add('selected');
          if (btn.classList.contains('product-order-toggle-btn')) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> चुना गया (कार्ट से हटाएं)';
          } else {
            btn.style.background = '#dcfce7';
            btn.style.borderColor = '#22c55e';
            btn.style.color = '#15803d';
          }
        } else {
          btn.classList.remove('selected');
          if (btn.classList.contains('product-order-toggle-btn')) {
            btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> ऑर्डर सूची में जोड़ें';
          } else {
            btn.style.background = '#f8fafc';
            btn.style.borderColor = '#cbd5e1';
            btn.style.color = '#1e293b';
          }
        }
      }
    });
  }

  // Toggle selection for a product card
  window.toggleProductSelection = function (btn, productId, name, mrp, img, dose) {
    const existingIndex = cartItems.findIndex(x => x.id === productId);
    if (existingIndex >= 0) {
      cartItems.splice(existingIndex, 1);
    } else {
      cartItems.push({
        id: productId,
        name: name || productId,
        mrp: mrp || 0,
        img: img || '',
        dose: dose || '',
        qty: 1
      });
      isDrawerExpanded = false; // keep collapsed by default
    }
    saveCart();
    updateOrderDrawer();
  };

  // Construct structured WhatsApp message and dispatch
  window.sendWhatsAppOrder = function () {
    if (cartItems.length === 0) {
      alert('कृपया पहले कम से कम एक उत्पाद चुनें!');
      return;
    }

    const targetPhone = currentAdvisorData.phone || '917974422572';

    const userName = getUserName();
    const userPhone = getUserPhone();
    const topic = getPageTopic();

    let productLines = '';
    let totalMrp = 0;
    let totalQty = 0;

    cartItems.forEach((item, idx) => {
      const q = item.qty || 1;
      const subtotal = (Number(item.mrp) || 0) * q;
      totalMrp += subtotal;
      totalQty += q;
      productLines += `${idx + 1}. *${item.name}* (मात्रा: ${q}) - ₹${subtotal.toLocaleString('en-IN')}\n`;
    });

    const message = `🌿 *आरोग्यम इंडिया - नया उत्पाद ऑर्डर व परामर्श* 🌿\n\n` +
      `👤 *ग्राहक का नाम:* ${userName}${userPhone ? ' (' + userPhone + ')' : ''}\n` +
      `📋 *पेज / संदर्भ:* ${topic}\n` +
      `🤝 *आरोग्यम सलाहकार:* ${currentAdvisorData.name} (${currentAdvisorData.display})\n\n` +
      `📦 *ऑर्डर सूची (${totalQty} नग):*\n${productLines}\n` +
      `💰 *कुल अनुमानित MRP:* ₹${totalMrp.toLocaleString('en-IN')}\n\n` +
      `ℹ️ *नोट:* कृपया मुझे इन उत्पादों के लिए विशेष डिस्काउंट, प्रयोग विधि और कैश ऑन डिलीवरी (COD) की जानकारी भेजें। धन्यवाद!`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;
    window.open(waUrl, '_blank');
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
        box-shadow: 0 -8px 25px rgba(0,0,0,0.4);
        z-index: 9985;
        padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)) 16px;
        transform: translateY(120%);
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: none;
      }
      .sticky-order-drawer-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
      }
      .order-actions-dual, .order-actions-single {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .btn-wa-order {
        display: inline-flex;
        align-items: center;
        gap: 8px;
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
        font-size: 1.2rem;
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
          bottom: calc(60px + env(safe-area-inset-bottom, 0px));
          padding: 8px 10px;
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

  function init() {
    injectStyles();
    loadCart();
    updateOrderDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
