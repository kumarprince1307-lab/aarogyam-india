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
  let isDrawerMinimized = false;
  let autoHideTimer = null;

  function resetAutoHideTimer() {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
    if (!isDrawerMinimized && cartItems.length > 0) {
      autoHideTimer = setTimeout(() => {
        isDrawerMinimized = true;
        isDrawerExpanded = false;
        updateOrderDrawer();
      }, 12000); // 12 seconds auto-hide
    }
  }

  function cancelAutoHideTimer() {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
  }

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
      cancelAutoHideTimer();
      if (drawer) {
        drawer.style.transform = 'translateY(150%) scale(0.9)';
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

    // Reset 12-second auto-hide timer whenever cart changes or updates
    resetAutoHideTimer();

    // A) If Minimized: Show Discreet Left-Floating Pill
    if (isDrawerMinimized) {
      drawer.className = 'sticky-order-drawer-wrap minimized-bubble';
      drawer.onmouseenter = null;
      drawer.onmouseleave = null;
      drawer.innerHTML = `
        <div onclick="window.minimizeWhatsAppCart(false)" style="display:flex; align-items:center; gap:8px; cursor:pointer; background:linear-gradient(135deg, #059669 0%, #047857 100%); padding:8px 16px; border-radius:30px; box-shadow:0 8px 24px rgba(5,150,105,0.4); border:2px solid #ffffff; color:#ffffff; font-weight:800; font-size:0.84rem; user-select:none; animation: waCartPulse 2s infinite ease-in-out;">
          <span style="font-size:1.15rem;">🛒</span>
          <span>ऑर्डर (${totalCount})</span>
          <span style="font-size:0.78rem; background:rgba(0,0,0,0.3); padding:2px 8px; border-radius:12px; color:#fde047;">₹${totalMrp.toLocaleString('en-IN')}</span>
        </div>
      `;
      drawer.style.transform = 'translateY(0) scale(1)';
      syncPageButtonStates();
      return;
    }

    // B) Full Compact Floating Card on Left Side
    drawer.className = 'sticky-order-drawer-wrap left-floating-card';
    
    // Pause auto-hide timer when user hovers or interacts with the card
    drawer.onmouseenter = cancelAutoHideTimer;
    drawer.onmouseleave = resetAutoHideTimer;

    drawer.innerHTML = `
      <div class="compact-order-card-content">
        <!-- Card Top Bar: Icon, Title, MRP & Close '✕' Button -->
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:8px; padding-bottom:8px; border-bottom:1px solid #1e293b;">
          <div style="display:flex; align-items:center; gap:8px; cursor:pointer;" onclick="window.toggleWhatsAppCartExpand()">
            <span style="background:#22c55e; color:#000; font-size:0.76rem; font-weight:900; padding:2px 7px; border-radius:10px;">${totalCount}</span>
            <strong style="color:#ffffff; font-size:0.86rem; display:flex; align-items:center; gap:4px;">
              <span>🛒</span> <span>उत्पाद (${isDrawerExpanded ? '▲ बंद' : '▼ देखें'})</span>
            </strong>
            <span style="color:#fde047; font-weight:800; font-size:0.86rem; margin-left:4px;">₹${totalMrp.toLocaleString('en-IN')}</span>
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <!-- Manual Cross / Minimize Button -->
            <button type="button" onclick="window.minimizeWhatsAppCart(true)" style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); color:#cbd5e1; width:26px; height:26px; border-radius:50%; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; justify-content:center; transition:all 0.2s ease;" title="कार्ड हटाएं / मिनीमाइज करें">
              ✕
            </button>
          </div>
        </div>

        <!-- Expandable Itemized +/- Tray (Opens only on click) -->
        <div id="wa-cart-items-tray" style="display:${isDrawerExpanded ? 'block' : 'none'}; width:100%; max-height:200px; overflow-y:auto; margin:8px 0; padding-right:4px;">
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${cartItems.map((item) => `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#070d19; padding:6px 10px; border-radius:8px; border:1px solid #1e293b; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px; flex:1; overflow:hidden;">
                  ${item.img ? `<img src="${item.img}" alt="${item.name}" style="width:30px; height:30px; object-fit:contain; border-radius:4px; border:1px solid #334155; background:#fff;" onerror="this.style.display='none'">` : '<span style="font-size:1.1rem;">📦</span>'}
                  <div style="overflow:hidden;">
                    <div style="font-size:0.78rem; font-weight:800; color:#ffffff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.name}">
                      ${item.name}
                    </div>
                    <div style="font-size:0.72rem; color:#94a3b8;">
                      ₹${item.mrp} × ${item.qty || 1} = <strong style="color:#86efac;">₹${((Number(item.mrp) || 0) * (item.qty || 1)).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                <!-- Quantity Controls & Cross Removal -->
                <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                  <button type="button" onclick="window.changeWhatsAppCartQty('${item.id}', -1)" style="background:#1e293b; border:1px solid #334155; color:#fff; width:22px; height:22px; border-radius:4px; font-weight:900; font-size:0.75rem; cursor:pointer;">-</button>
                  <span style="font-size:0.78rem; font-weight:800; color:#fde047; min-width:16px; text-align:center;">${item.qty || 1}</span>
                  <button type="button" onclick="window.changeWhatsAppCartQty('${item.id}', 1)" style="background:#1e293b; border:1px solid #334155; color:#fff; width:22px; height:22px; border-radius:4px; font-weight:900; font-size:0.75rem; cursor:pointer;">+</button>
                  <button type="button" onclick="window.removeWhatsAppCartItem('${item.id}')" style="background:rgba(239,68,68,0.25); border:1px solid #ef444450; color:#f87171; width:22px; height:22px; border-radius:4px; font-size:0.72rem; font-weight:900; cursor:pointer; margin-left:3px;" title="हटाएं">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Card Bottom Action: 1-Click WhatsApp Order Button -->
        <div style="margin-top:8px; width:100%;">
          <button type="button" onclick="window.sendWhatsAppOrder()" style="width:100%; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; border:none; padding:9px 14px; border-radius:10px; font-weight:900; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(16,185,129,0.35); transition:all 0.2s ease;">
            <i class="fa-solid fa-user-check" style="font-size:0.95rem;"></i>
            <span>सलाहकार को ऑर्डर भेजें (${currentAdvisorData.display})</span>
          </button>
        </div>
      </div>
    `;

    drawer.style.transform = 'translateY(0) scale(1)';
    syncPageButtonStates();
  }

  window.minimizeWhatsAppCart = function(minimize = true) {
    isDrawerMinimized = minimize;
    updateOrderDrawer();
  };
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
      isDrawerExpanded = true; // Open full item tray on selection so user clearly sees what was added
      isDrawerMinimized = false;
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
      @keyframes waCartPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(5,150,105,0.4); }
        50% { transform: scale(1.04); box-shadow: 0 8px 24px rgba(5,150,105,0.6); }
      }

      /* 1. Left-Side Compact Floating Card */
      .sticky-order-drawer-wrap.left-floating-card {
        position: fixed !important;
        bottom: calc(75px + env(safe-area-inset-bottom, 0px)) !important;
        left: 20px !important;
        right: auto !important;
        background: #0f172a !important;
        color: #ffffff !important;
        border: 1.5px solid #10b981 !important;
        border-radius: 16px !important;
        box-shadow: 0 12px 32px rgba(0,0,0,0.55), 0 4px 12px rgba(16,185,129,0.2) !important;
        z-index: 9995 !important;
        padding: 12px 14px !important;
        width: 320px !important;
        max-width: calc(100vw - 40px) !important;
        transform: translateY(0) scale(1) !important;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        box-sizing: border-box !important;
      }

      /* 2. Minimized Discreet Floating Pill on Left Side */
      .sticky-order-drawer-wrap.minimized-bubble {
        position: fixed !important;
        bottom: calc(75px + env(safe-area-inset-bottom, 0px)) !important;
        left: 20px !important;
        right: auto !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        z-index: 9995 !important;
        width: auto !important;
        transform: translateY(0) scale(1) !important;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .compact-order-card-content {
        display: flex;
        flex-direction: column;
        width: 100%;
        box-sizing: border-box;
      }

      @media (max-width: 640px) {
        .sticky-order-drawer-wrap.left-floating-card {
          left: 12px !important;
          right: auto !important;
          bottom: calc(65px + env(safe-area-inset-bottom, 0px)) !important;
          width: 300px !important;
          max-width: calc(100vw - 24px) !important;
          padding: 10px 12px !important;
        }
        .sticky-order-drawer-wrap.minimized-bubble {
          left: 12px !important;
          right: auto !important;
          bottom: calc(65px + env(safe-area-inset-bottom, 0px)) !important;
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
