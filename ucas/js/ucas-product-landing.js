/* ==========================================================================
   UCAS DEDICATED PRODUCT LANDING PAGES ENGINE
   Handles:
   - Dedicated Product Landing Page Creation (MRP, Offer Price, Buy Now Link, Image)
   - Real-time Product Live Preview
   - My Product Landing Pages List & Status Badges
   - Product Inquiries / Leads Tracking
   - WhatsApp, Facebook, Native Sharing & Link Copying
   ========================================================================== */

(function (window) {
  'use strict';

  let productPages = [];
  let editingProductId = null;
  let previewProductImageBase64 = '';

  function getLandingCategories() {
    try {
      const stored = localStorage.getItem('AAROGYAM_PROD_CATEGORIES') || localStorage.getItem('AAROGYAM_LP_CATEGORIES') || localStorage.getItem('AAROGYAM_GLOBAL_LP_CATEGORIES');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: 'agriculture', name: '🌾 Agriculture (कृषि उत्पाद)' },
      { id: 'healthcare', name: '❤️ Health Care (स्वास्थ्य उत्पाद)' },
      { id: 'cattlecare', name: '🐄 Cattle Care (पशु आहार/दवा)' },
      { id: 'beautycare', name: '💄 Beauty Care (सौंदर्य उत्पाद)' },
      { id: 'haircare', name: '💇 Hair Care (केश तेल/शैम्पू)' },
      { id: 'netsurf', name: '💼 NetSurf Products' },
      { id: 'other', name: '📦 अन्य प्रोडक्ट (Other)' }
    ];
  }

  function populateProductCategories() {
    const cats = getLandingCategories();
    const select = document.getElementById('prod_select_category');
    if (select) {
      const cur = select.value;
      select.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      if (cur && cats.some(c => c.id === cur)) select.value = cur;
    }
  }

  function init() {
    populateProductCategories();
    bindFormEvents();
    loadProductLandingPages();
  }

  function bindFormEvents() {
    const titleInput = document.getElementById('prod_input_title');
    const mrpInput = document.getElementById('prod_input_mrp');
    const offerInput = document.getElementById('prod_input_offer_price');
    const buyUrlInput = document.getElementById('prod_input_buynow_url');
    const msgInput = document.getElementById('prod_input_message');
    const imgFileInput = document.getElementById('prod_image_file_input');
    const catSelect = document.getElementById('prod_select_category');
    const form = document.getElementById('ucas-product-landing-form');

    titleInput?.addEventListener('input', updateProductPreview);
    mrpInput?.addEventListener('input', updateProductPreview);
    offerInput?.addEventListener('input', updateProductPreview);
    buyUrlInput?.addEventListener('input', updateProductPreview);
    msgInput?.addEventListener('input', updateProductPreview);
    catSelect?.addEventListener('change', updateProductPreview);

    imgFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        window.UCAS_APP.showToast('कृपया केवल इमेज फाइल (JPG, PNG, WEBP) चुनें।', 'error');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        window.UCAS_APP.showToast('इमेज का आकार 5MB से कम होना चाहिए।', 'error');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        previewProductImageBase64 = event.target.result;
        updateProductPreview();
      };
      reader.readAsDataURL(file);
    });

    form?.addEventListener('submit', handleProductFormSubmit);
  }

  function updateProductPreview() {
    const title = document.getElementById('prod_input_title')?.value.trim() || 'उत्पाद का नाम यहाँ दिखेगा';
    const mrp = document.getElementById('prod_input_mrp')?.value.trim() || '1999';
    const offerPrice = document.getElementById('prod_input_offer_price')?.value.trim() || '999';
    const msg = document.getElementById('prod_input_message')?.value.trim() || 'इस उत्पाद के विशेष लाभ और विवरण यहाँ प्रदर्शित होंगे।';
    const cat = document.getElementById('prod_select_category')?.value || 'agriculture';

    const pTitle = document.getElementById('prod_preview_title');
    const pMrp = document.getElementById('prod_preview_mrp');
    const pOffer = document.getElementById('prod_preview_offer');
    const pMsg = document.getElementById('prod_preview_msg');
    const pCat = document.getElementById('prod_preview_cat');
    const pImg = document.getElementById('prod_preview_image');
    const pPlaceholder = document.getElementById('prod_preview_placeholder');
    const pDiscount = document.getElementById('prod_preview_discount');

    if (pTitle) pTitle.textContent = title;
    if (pMrp) pMrp.textContent = `₹${mrp}`;
    if (pOffer) pOffer.textContent = `₹${offerPrice}`;
    if (pMsg) pMsg.textContent = msg;
    if (pCat) pCat.textContent = cat.toUpperCase();

    // Discount percentage
    const numMrp = parseFloat(mrp) || 0;
    const numOffer = parseFloat(offerPrice) || 0;
    if (pDiscount) {
      if (numMrp > numOffer && numMrp > 0) {
        const discPercent = Math.round(((numMrp - numOffer) / numMrp) * 100);
        pDiscount.textContent = `${discPercent}% छूट (OFF)`;
        pDiscount.style.display = 'inline-block';
      } else {
        pDiscount.style.display = 'none';
      }
    }

    if (previewProductImageBase64 && pImg && pPlaceholder) {
      pImg.src = previewProductImageBase64;
      pImg.style.display = 'block';
      pPlaceholder.style.display = 'none';
    } else if (pImg && pPlaceholder && !pImg.src) {
      pImg.style.display = 'none';
      pPlaceholder.style.display = 'flex';
    }
  }

  async function loadProductLandingPages() {
    let profileId = window.UCAS_SESSION?.getUserId();
    if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(profileId).trim())) {
      profileId = '52ef705c-bb45-4137-bee4-a3f8df73b676';
    }
    const shareId = window.UCAS_SESSION?.getShareId() || 'AI000004';
    const client = window.UCAS_DB?.getDb();

    let fetched = [];

    // 1. Fetch from Supabase landing_pages where content_type = 'product'
    if (client) {
      try {
        const { data: dbPages } = await client
          .from('landing_pages')
          .select('*')
          .or(`profile_id.eq.${profileId},share_id.eq.${shareId},share_id.eq.ADMIN,share_id.eq.ALL_USERS`)
          .eq('content_type', 'product')
          .order('created_at', { ascending: false });

        if (dbPages && dbPages.length > 0) {
          fetched = dbPages;
        }
      } catch (e) {
        console.warn('Supabase product landing pages fetch notice:', e);
      }
    }

    // 2. Combine with LocalStorage product landing pages
    const combinedMap = new Map();
    fetched.forEach(p => combinedMap.set(p.id, p));

    try {
      const localList = JSON.parse(localStorage.getItem(`UCAS_PRODUCT_LP_${profileId}`) || localStorage.getItem('UCAS_PRODUCT_LANDING_PAGES') || '[]');
      (Array.isArray(localList) ? localList : [localList]).forEach(p => {
        if (p && p.id && !combinedMap.has(p.id)) {
          combinedMap.set(p.id, p);
        }
      });
    } catch (e) {}

    // 3. Fallback Starter Product Page if none exist yet
    if (combinedMap.size === 0) {
      const starterProduct = {
        id: 'LP_PROD_' + Math.floor(1000 + Math.random() * 9000),
        profile_id: profileId,
        share_id: shareId,
        title: 'जैविक कृषि संपूर्ण पोषण किट (50% विशेष छूट)',
        category: 'agriculture',
        content_type: 'product',
        media_url: 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg',
        thumbnail_url: 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg',
        message: 'फसलों की पैदावार दोगुनी करने और मिट्टी को उपजाऊ बनाने के लिए संपूर्ण जैविक किट। अभी ऑर्डर करें और विशेष छूट पाएं!',
        mrp: 1999,
        offer_price: 999,
        buynow_url: 'https://aarogyamindia.in',
        product_data: {
          mrp: '1999',
          offer_price: '999',
          buynow_url: 'https://aarogyamindia.in',
          image: 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg'
        },
        status: 'active',
        response_count: 0,
        created_at: new Date().toISOString()
      };
      combinedMap.set(starterProduct.id, starterProduct);
      try {
        localStorage.setItem(`UCAS_PRODUCT_LP_${profileId}`, JSON.stringify([starterProduct]));
      } catch (e) {}
    }

    productPages = Array.from(combinedMap.values());

    // 4. Attach real-time Leads count from surveys
    if (client) {
      try {
        const { data: surveys } = await client
          .from('surveys')
          .select('id, category_answers')
          .eq('profile_id', profileId);

        if (surveys && surveys.length > 0) {
          productPages.forEach(p => {
            const count = surveys.filter(s => {
              const lpId = s?.category_answers?.landing_page_id;
              const prodTitle = s?.category_answers?.product_title;
              return lpId === p.id || prodTitle === p.title;
            }).length;
            p.response_count = count;
          });
        }
      } catch (e) {}
    }

    renderProductLandingPagesTable(productPages);
    updateProductKPIs();
  }

  function updateProductKPIs() {
    const totalEl = document.getElementById('ucas-prod-kpi-total');
    const leadsEl = document.getElementById('ucas-prod-kpi-leads');
    const activeEl = document.getElementById('ucas-prod-kpi-active');
    const listCountEl = document.getElementById('ucas-my-product-lps-count');

    let totalLeads = 0;
    let activePages = 0;

    productPages.forEach(p => {
      totalLeads += (Number(p.response_count) || 0);
      if (p.status === 'active' || !p.status) activePages++;
    });

    if (totalEl) totalEl.textContent = productPages.length;
    if (leadsEl) leadsEl.textContent = totalLeads;
    if (activeEl) activeEl.textContent = activePages;
    if (listCountEl) listCountEl.textContent = productPages.length;
  }

  function renderProductLandingPagesTable(pages) {
    const container = document.getElementById('ucas-my-product-lps-container');
    if (!container) return;

    if (!pages || pages.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:2.5rem 1.5rem;color:var(--text-muted);background:#F8FAFC;border-radius:var(--radius-md);border:1.5px dashed #CBD5E1;">
          <div style="font-size:2.5rem;margin-bottom:8px;">🛒</div>
          <strong style="font-size:1.05rem;color:var(--text-main);">आपने अभी तक कोई प्रोडक्ट लैंडिंग पेज नहीं बनाया है।</strong>
          <p style="font-size:0.85rem;margin-top:4px;">ऊपर दिए गए फॉर्म से अपना पहला प्रोडक्ट लैंडिंग पेज बनाएं और सीधे ग्राहकों तक पहुंचाएं।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = pages.map((lp, idx) => {
      const shareUrl = getProductShareUrl(lp);
      const dateStr = lp.created_at ? new Date(lp.created_at).toLocaleDateString('hi-IN') : '-';
      const mrp = lp.mrp || lp.product_data?.mrp || '1999';
      const offerPrice = lp.offer_price || lp.product_data?.offer_price || '999';
      const buyUrl = lp.buynow_url || lp.product_data?.buynow_url || '#';
      const imgUrl = lp.thumbnail_url || lp.media_url || lp.product_data?.image || 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';
      const responsesCount = lp.response_count || 0;
      const isAdminCreated = Boolean(lp.created_by_admin || lp.is_admin_template);

      return `
        <div class="ucas-post-elevated-card" style="border-left:4px solid #F59E0B;margin-bottom:14px;background:#fff;border-radius:var(--radius-md);padding:14px 16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid #E2E8F0;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <!-- Left: Thumb & Info -->
            <div style="display:flex;gap:12px;align-items:flex-start;flex:1;min-width:240px;">
              <div style="width:72px;height:72px;border-radius:8px;overflow:hidden;background:#F1F5F9;flex-shrink:0;border:1px solid #E2E8F0;display:flex;align-items:center;justify-content:center;">
                <img src="${imgUrl}" alt="${lp.title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';">
              </div>
              <div>
                <div style="font-weight:800;font-size:1.02rem;color:var(--text-main);line-height:1.35;">
                  ${lp.title} ${isAdminCreated ? '<span style="font-size:0.7rem;background:#FEF3C7;color:#B45309;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:4px;">👑 एडमिन जारी</span>' : ''}
                </div>
                <div style="font-size:0.78rem;color:var(--text-muted);margin-top:3px;">
                  ID: <strong style="color:var(--primary-dark);font-family:monospace;">${lp.id}</strong> • 📅 ${dateStr}
                </div>
                <div style="margin-top:6px;display:flex;align-items:center;gap:8px;">
                  <span style="font-size:1.05rem;font-weight:800;color:#15803D;">₹${offerPrice}</span>
                  ${mrp ? `<span style="font-size:0.82rem;color:#94A3B8;text-decoration:line-through;">₹${mrp}</span>` : ''}
                  <span style="font-size:0.75rem;background:#FEF3C7;color:#B45309;padding:2px 6px;border-radius:4px;font-weight:700;">
                    <i class="fa-solid fa-cart-shopping"></i> ${(lp.category || 'Product').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Status & Leads -->
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
              <span style="background:#DCFCE7;color:#15803D;padding:3px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:800;display:inline-flex;align-items:center;gap:4px;">
                <i class="fa-solid fa-circle-check"></i> Live Promotion
              </span>
              <span style="font-weight:800;font-size:0.85rem;color:#1D4ED8;background:#EFF6FF;border:1px solid #BFDBFE;padding:3px 10px;border-radius:var(--radius-full);display:inline-flex;align-items:center;gap:4px;">
                <i class="fa-solid fa-clipboard-check"></i> ${responsesCount} Inquiries / Leads
              </span>
            </div>
          </div>

          <!-- Description / Message -->
          <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:6px;padding:8px 12px;margin:10px 0;font-size:0.82rem;color:#92400E;line-height:1.4;">
            ${lp.message || 'फसलों व स्वास्थ्य के लिए उत्कृष्ट उत्पाद।'}
          </div>

          <!-- 2 Rows of Action Buttons -->
          <div class="ucas-actions-two-rows" style="margin-top:10px;">
            <!-- Row 1: 4 Share Buttons -->
            <div class="ucas-btn-row-4">
              <button class="ucas-btn-act ucas-btn-act-wa" onclick="UCAS_PRODUCT_LANDING.shareProductWhatsApp('${lp.id}')" title="WhatsApp पर शेयर करें">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </button>
              <button class="ucas-btn-act ucas-btn-act-fb" onclick="UCAS_PRODUCT_LANDING.shareProductFacebook('${lp.id}')" title="Facebook पर शेयर करें">
                <i class="fa-brands fa-facebook"></i> Facebook
              </button>
              <button class="ucas-btn-act ucas-btn-act-share" onclick="UCAS_PRODUCT_LANDING.shareProductNative('${lp.id}')" title="अन्य ऐप्स पर शेयर करें">
                <i class="fa-solid fa-share-nodes"></i> शेयर
              </button>
              <button class="ucas-btn-act ucas-btn-act-copy" onclick="UCAS_PRODUCT_LANDING.copyProductLink('${lp.id}')" title="लिंक कॉपी करें">
                <i class="fa-regular fa-copy"></i> कॉपी लिंक
              </button>
            </div>
            <!-- Row 2: Management Buttons -->
            <div class="ucas-btn-row-3">
              <button class="ucas-btn-act ucas-btn-act-view" onclick="window.open('${shareUrl}', '_blank')" title="पेज देखें">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> लाइव देखें
              </button>
              ${isAdminCreated ? `
                <button class="ucas-btn-act ucas-btn-act-edit" style="opacity:0.7;background:#F1F5F9;color:#64748B;cursor:not-allowed;" onclick="window.UCAS_APP.showToast('🔒 यह प्रोडक्ट पेज एडमिन द्वारा जारी किया गया है।', 'info')">
                  <i class="fa-solid fa-lock"></i> एडमिन पेज
                </button>
                <button class="ucas-btn-act ucas-btn-act-delete" style="opacity:0.7;background:#F1F5F9;color:#64748B;cursor:not-allowed;" onclick="window.UCAS_APP.showToast('🔒 एडमिन पेज हटाया नहीं जा सकता।', 'info')">
                  <i class="fa-solid fa-lock"></i> सुरक्षित
                </button>
              ` : `
                <button class="ucas-btn-act ucas-btn-act-edit" onclick="UCAS_PRODUCT_LANDING.editProductLandingPage('${lp.id}')" title="एडिट करें">
                  <i class="fa-solid fa-pen-to-square"></i> एडिट
                </button>
                <button class="ucas-btn-act ucas-btn-act-delete" onclick="UCAS_PRODUCT_LANDING.deleteProductLandingPage('${lp.id}')" title="हटाएं">
                  <i class="fa-solid fa-trash-can"></i> हटाएं
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getProductShareUrl(lp) {
    const origin = window.location.origin || 'https://aarogyamindia.online';
    const currentUserId = window.UCAS_SESSION?.getUserId();
    const currentUserShareId = window.UCAS_SESSION?.getShareId() || 'AI000004';
    const isBroadcastOrAdmin = Boolean(lp.created_by_admin || lp.is_admin_template || lp.share_id === 'ADMIN' || lp.share_id === 'ALL_USERS' || lp.profile_id === 'ALL_USERS' || (lp.profile_id && lp.profile_id !== currentUserId));
    const shareId = isBroadcastOrAdmin ? currentUserShareId : (lp.share_id || currentUserShareId);
    return `${origin}/ucas/landing.html?id=${encodeURIComponent(lp.id)}&share_id=${encodeURIComponent(shareId)}`;
  }

  async function handleProductFormSubmit(e) {
    if (e) e.preventDefault();

    const title = document.getElementById('prod_input_title')?.value.trim();
    const category = document.getElementById('prod_select_category')?.value || 'agriculture';
    const mrp = document.getElementById('prod_input_mrp')?.value.trim();
    const offerPrice = document.getElementById('prod_input_offer_price')?.value.trim();
    const buynowUrl = document.getElementById('prod_input_buynow_url')?.value.trim();
    const message = document.getElementById('prod_input_message')?.value.trim();
    const submitBtn = document.getElementById('prod_btn_submit');

    if (!title) {
      window.UCAS_APP.showToast('कृपया प्रोडक्ट का नाम/शीर्षक दर्ज करें।', 'error');
      return;
    }

    if (!offerPrice) {
      window.UCAS_APP.showToast('कृपया ऑफर/डिस्काउंट प्राइस दर्ज करें।', 'error');
      return;
    }

    if (!buynowUrl) {
      window.UCAS_APP.showToast('कृपया Buy Now का वेब लिंक दर्ज करें।', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सेव हो रहा है...';
    }

    const profileId = window.UCAS_SESSION?.getUserId() || '52ef705c-bb45-4137-bee4-a3f8df73b676';
    const shareId = window.UCAS_SESSION?.getShareId() || 'AI000004';
    const id = editingProductId || ('LP_PROD_' + Math.floor(100000 + Math.random() * 900000));

    const finalImage = previewProductImageBase64 || 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';

    const payload = {
      id,
      profile_id: profileId,
      share_id: shareId,
      title,
      category,
      content_type: 'product',
      media_url: finalImage,
      thumbnail_url: finalImage,
      message: message || `विशेष ऑफर पर ${title} अभी खरीदें।`,
      mrp: mrp ? parseFloat(mrp) : null,
      offer_price: parseFloat(offerPrice),
      buynow_url: buynowUrl,
      product_data: {
        mrp,
        offer_price: offerPrice,
        buynow_url: buynowUrl,
        image: finalImage
      },
      status: 'active',
      updated_at: new Date().toISOString()
    };

    if (!editingProductId) {
      payload.created_at = new Date().toISOString();
      payload.response_count = 0;
    }

    // Save to Supabase landing_pages table
    const client = window.UCAS_DB?.getDb();
    if (client) {
      try {
        await client.from('landing_pages').upsert(payload);
      } catch (err) {
        console.warn('Product landing page DB upsert notice:', err);
      }
    }

    // Save to LocalStorage
    try {
      const storageKey = `UCAS_PRODUCT_LP_${profileId}`;
      let localList = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const existIdx = localList.findIndex(p => p.id === id);
      if (existIdx >= 0) {
        localList[existIdx] = { ...localList[existIdx], ...payload };
      } else {
        localList.unshift(payload);
      }
      localStorage.setItem(storageKey, JSON.stringify(localList));
    } catch (e) {}

    window.UCAS_APP.showToast(editingProductId ? '✅ प्रोडक्ट लैंडिंग पेज अपडेट हो गया!' : '🎉 प्रोडक्ट लैंडिंग पेज सफलतापूर्वक बन गया!', 'success');

    // Reset Form
    resetProductForm();
    await loadProductLandingPages();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> 🛒 प्रोडक्ट लैंडिंग पेज बनाएं (Create Product Page)';
    }

    document.getElementById('ucas-my-product-lps-container')?.scrollIntoView({ behavior: 'smooth' });
  }

  function editProductLandingPage(lpId) {
    const lp = productPages.find(p => p.id === lpId);
    if (!lp) return;

    editingProductId = lp.id;

    const titleInput = document.getElementById('prod_input_title');
    const catSelect = document.getElementById('prod_select_category');
    const mrpInput = document.getElementById('prod_input_mrp');
    const offerInput = document.getElementById('prod_input_offer_price');
    const buyUrlInput = document.getElementById('prod_input_buynow_url');
    const msgInput = document.getElementById('prod_input_message');
    const submitBtn = document.getElementById('prod_btn_submit');
    const cancelBtn = document.getElementById('prod_btn_cancel_edit');

    if (titleInput) titleInput.value = lp.title || '';
    if (catSelect) catSelect.value = lp.category || 'agriculture';
    if (mrpInput) mrpInput.value = lp.mrp || lp.product_data?.mrp || '';
    if (offerInput) offerInput.value = lp.offer_price || lp.product_data?.offer_price || '';
    if (buyUrlInput) buyUrlInput.value = lp.buynow_url || lp.product_data?.buynow_url || '';
    if (msgInput) msgInput.value = lp.message || '';

    previewProductImageBase64 = lp.thumbnail_url || lp.media_url || '';

    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> परिवर्तन सेव करें (Update Product Page)';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';

    updateProductPreview();
    document.getElementById('prod_lp_creator_card')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelEdit() {
    resetProductForm();
  }

  function resetProductForm() {
    editingProductId = null;
    previewProductImageBase64 = '';

    const form = document.getElementById('ucas-product-landing-form');
    if (form) form.reset();

    const submitBtn = document.getElementById('prod_btn_submit');
    const cancelBtn = document.getElementById('prod_btn_cancel_edit');
    const pImg = document.getElementById('prod_preview_image');
    const pPlaceholder = document.getElementById('prod_preview_placeholder');

    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> 🛒 प्रोडक्ट लैंडिंग पेज बनाएं (Create Product Page)';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (pImg) { pImg.src = ''; pImg.style.display = 'none'; }
    if (pPlaceholder) pPlaceholder.style.display = 'flex';

    updateProductPreview();
  }

  async function deleteProductLandingPage(lpId) {
    if (!confirm('क्या आप वाकई इस प्रोडक्ट लैंडिंग पेज को हटाना चाहते हैं?')) return;

    const profileId = window.UCAS_SESSION?.getUserId() || '52ef705c-bb45-4137-bee4-a3f8df73b676';
    const client = window.UCAS_DB?.getDb();

    if (client) {
      try {
        await client.from('landing_pages').delete().eq('id', lpId);
      } catch (e) {}
    }

    try {
      const storageKey = `UCAS_PRODUCT_LP_${profileId}`;
      let localList = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localList = localList.filter(p => p.id !== lpId);
      localStorage.setItem(storageKey, JSON.stringify(localList));
    } catch (e) {}

    window.UCAS_APP.showToast('🗑️ प्रोडक्ट लैंडिंग पेज हटा दिया गया।', 'info');
    await loadProductLandingPages();
  }

  function shareProductWhatsApp(lpId) {
    const lp = productPages.find(p => p.id === lpId);
    if (!lp) return;
    const shareUrl = getProductShareUrl(lp);
    const offerPrice = lp.offer_price || lp.product_data?.offer_price || '';
    const mrp = lp.mrp || lp.product_data?.mrp || '';
    const priceText = offerPrice ? `\n💰 विशेष ऑफर मूल्य: ₹${offerPrice} ${mrp ? '(MRP: ₹' + mrp + ')' : ''}` : '';
    const text = `🛍️ *${lp.title}*${priceText}\n\n${lp.message}\n\n👉 अधिक जानकारी व डिस्काउंट के लिए यहाँ क्लिक करें:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareProductFacebook(lpId) {
    const lp = productPages.find(p => p.id === lpId);
    if (!lp) return;
    const shareUrl = getProductShareUrl(lp);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  }

  function shareProductNative(lpId) {
    const lp = productPages.find(p => p.id === lpId);
    if (!lp) return;
    const shareUrl = getProductShareUrl(lp);
    if (navigator.share) {
      navigator.share({
        title: lp.title,
        text: lp.message,
        url: shareUrl
      }).catch(() => {});
    } else {
      copyProductLink(lpId);
    }
  }

  function copyProductLink(lpId) {
    const lp = productPages.find(p => p.id === lpId);
    if (!lp) return;
    const shareUrl = getProductShareUrl(lp);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        window.UCAS_APP.showToast('📋 प्रोडक्ट लैंडिंग पेज लिंक कॉपी हो गया!', 'success');
      });
    } else {
      window.UCAS_APP.showToast('लिंक: ' + shareUrl, 'info');
    }
  }

  window.UCAS_PRODUCT_LANDING = {
    init,
    loadProductLandingPages,
    updateProductPreview,
    cancelEdit,
    editProductLandingPage,
    deleteProductLandingPage,
    shareProductWhatsApp,
    shareProductFacebook,
    shareProductNative,
    copyProductLink
  };

  console.log('✅ UCAS Dedicated Product Landing Module Ready.');
})(window);
