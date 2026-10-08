/**
 * ==========================================================================
 * AAROGYAM INDIA - NETSURF DIRECT SELLING & CAREER ENGINE
 * File: /js/netsurf-career.js
 * Version: 2026.1 (Interactive UX, Dynamic Referrer & 2-Way WhatsApp Dispatch)
 * ==========================================================================
 */

(function (window, document) {
  'use strict';

  // Central Aarogyam Support Default
  const DEFAULT_SUPPORT_PHONE = '917974422572';
  const DEFAULT_SPONSOR_NAME = 'आरोग्यम इंडिया सेंट्रल सपोर्ट';

  let currentSponsor = {
    name: DEFAULT_SPONSOR_NAME,
    phone: DEFAULT_SUPPORT_PHONE,
    isPersonalized: false
  };

  // Video Masterclass Playlist (Authentic Aarogyam India YouTube Channel Videos)
  const MASTERCLASS_VIDEOS = [
    {
      id: 'factory_profile',
      title: '🏭 कंपनी प्रोफ़ाइल व R&D फैक्ट्री टूर (₹1500 करोड़ कमीशन का सच)',
      embedUrl: 'https://www.youtube-nocookie.com/embed/bk2bxcHeKsM?rel=0&playsinline=1',
      videoId: 'bk2bxcHeKsM',
      desc: 'नेटसर्फ की 26 साल की विरासत, पुणे हेडक्वार्टर, DSIR अप्रूव्ड लैब्स और अपनी मैन्युफैक्चरिंग यूनिट की अंदरूनी झलक।'
    },
    {
      id: 'why_90_fail',
      title: '⚠️ नेटसर्फ में 90% लोग फेल क्यों होते हैं? (सच जो कोई नहीं बताता)',
      embedUrl: 'https://www.youtube-nocookie.com/embed/HI5D8KYWJK0?rel=0&playsinline=1',
      videoId: 'HI5D8KYWJK0',
      desc: 'गलत तरीके से काम करने का नुकसान और 10% टॉप अचीवर्स की सही कार्यप्रणाली।'
    },
    {
      id: 'autoship_formula',
      title: '📊 ₹45,000/माह फिक्स इनकम फॉर्मूला (5+1 फ्री ऑटोशिप सिस्टम)',
      embedUrl: 'https://www.youtube-nocookie.com/embed/8I9qX1elzgg?rel=0&playsinline=1',
      videoId: '8I9qX1elzgg',
      desc: '180 संतुष्ट उपभोक्ता और 5 महीने पर 1 महीना फ्री ऑटोशिप द्वारा स्थायी मासिक आय व जैविक प्रोडक्ट्स का कमाल।'
    },
    {
      id: 'nominee_security',
      title: '🛡️ फैमिली प्रोटेक्शन व नॉमिनी फैसिलिटी (आजीवन सुरक्षा)',
      embedUrl: 'https://www.youtube-nocookie.com/embed/OlX2t84-8Es?rel=0&playsinline=1',
      videoId: 'OlX2t84-8Es',
      desc: 'मेडिक्लेम, एक्सीडेंटल कवर और परिवार के नाम बिज़नेस की अटूट सुरक्षा।'
    }
  ];

  // ── Resolve image: check AI_OFFLINE_UPLOADS localStorage first ──
  function resolveProductImg(imgPath) {
    if (!imgPath) return '/images/logo/logo.png';
    try {
      const offline = JSON.parse(localStorage.getItem('AI_OFFLINE_UPLOADS') || '{}');
      if (offline[imgPath]) return offline[imgPath];
      const norm = '/' + imgPath.replace(/^\/+/, '');
      if (offline[norm]) return offline[norm];
    } catch (e) {}
    return imgPath || '/images/logo/logo.png';
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    detectSponsorReferral();
    initShareButton();
    initIncomeCalculator();
    initSurveyForm();
    initVideoPlayer();
    initKypProductsAndTabs();
    initFaqAccordion();
  });

  // ── Share Button (same as other pages) ──
  function initShareButton() {
    const shareBtns = document.querySelectorAll('[data-action="ns-share"], .ns-share-btn');
    shareBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof window.triggerViralPageShare === 'function') {
          window.triggerViralPageShare({
            title: 'नेटसर्फ डायरेक्ट सेलिंग करियर - Aarogyam India',
            text: 'नेटसर्फ डायरेक्ट सेलिंग बिज़नेस और ₹8,19,250 क्लोजिंग प्लान देखें:',
            url: window.location.href
          });
        } else {
          // Native share fallback
          const shareData = {
            title: 'नेटसर्फ करियर - Aarogyam India',
            text: 'नेटसर्फ डायरेक्ट सेलिंग बिज़नेस देखें',
            url: window.location.href
          };
          if (navigator.share) {
            navigator.share(shareData).catch(() => {});
          } else {
            // WhatsApp share
            const waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareData.text + ' ' + shareData.url);
            window.open(waUrl, '_blank');
          }
        }
      });
    });
  }

  /**
   * 1. DETECT SPONSOR REFERRAL FROM URL & UNIFIED SHARE ID
   */
  async function detectSponsorReferral() {
    const params = new URLSearchParams(window.location.search);
    const rawRef = (params.get('ref') || params.get('share_id') || params.get('aff') || params.get('r') || params.get('upline') || params.get('sponsor_phone') || params.get('phone') || '').trim();
    const refName = params.get('sponsor') || params.get('name') || params.get('by');

    if (rawRef) {
      try { 
        localStorage.setItem('AOI_REFERRER_ID', rawRef);
        const dig = rawRef.replace(/\D/g, '');
        if (dig.length >= 10) {
          localStorage.setItem('aarogyam_upline_phone', dig.slice(-10));
          localStorage.setItem('aim_ns_sponsor_phone', '91' + dig.slice(-10));
        } else {
          localStorage.setItem('aim_last_sponsor_id', rawRef.toUpperCase());
        }
      } catch(e) {}
    }

    let effectiveRef = rawRef;
    if (!effectiveRef) {
      effectiveRef = localStorage.getItem('AOI_REFERRER_ID') || 
                     localStorage.getItem('aim_last_sponsor_id') || 
                     localStorage.getItem('aarogyam_upline_phone') || 
                     localStorage.getItem('aim_ns_sponsor_phone') || '';
    }

    const cleanDigits = effectiveRef.replace(/\D/g, '').slice(-10);

    // Case A: 10-digit direct phone number
    if (cleanDigits.length === 10 && cleanDigits !== '7974422572') {
      currentSponsor.phone = '91' + cleanDigits;
      currentSponsor.name = refName ? decodeURIComponent(refName).trim() : (localStorage.getItem('aim_ns_sponsor_name') || 'अधिकृत बिज़नेस पार्टनर');
      currentSponsor.isPersonalized = true;
      try {
        localStorage.setItem('aim_ns_sponsor_phone', currentSponsor.phone);
        localStorage.setItem('aim_ns_sponsor_name', currentSponsor.name);
        localStorage.setItem('aarogyam_upline_phone', cleanDigits);
      } catch (e) {}
      renderSponsorElements();
      return;
    }

    // Case B: Master Aarogyam Share ID
    if (effectiveRef.toUpperCase() === 'AI000004') {
      currentSponsor.phone = DEFAULT_SUPPORT_PHONE;
      currentSponsor.name = DEFAULT_SPONSOR_NAME;
      currentSponsor.isPersonalized = false;
      renderSponsorElements();
      return;
    }

    // Case C: Check localStorage cached sponsor
    const savedPhone = (localStorage.getItem('aim_ns_sponsor_phone') || localStorage.getItem('aarogyam_upline_phone') || '').replace(/\D/g, '').slice(-10);
    const savedName = localStorage.getItem('aim_ns_sponsor_name');
    if (savedPhone && savedPhone.length === 10 && savedPhone !== '7974422572') {
      currentSponsor.phone = '91' + savedPhone;
      currentSponsor.name = savedName || 'अधिकृत बिज़नेस पार्टनर';
      currentSponsor.isPersonalized = true;
      renderSponsorElements();
    } else {
      renderSponsorElements();
    }

    // Case D: Asynchronous resolution for Share IDs (e.g., AI100002, alphanumeric) via Supabase
    if (effectiveRef && effectiveRef.toUpperCase() !== 'AI000004' && cleanDigits.length !== 10) {
      resolveSponsorFromDb(effectiveRef);
    }
  }

  async function resolveSponsorFromDb(shareId) {
    try {
      // 1. Check local cache first
      const cached = localStorage.getItem('aim_sharer_prof_' + shareId);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const data = parsed.data || parsed;
          if (data && data.mobile) {
            const cleanMob = String(data.mobile).replace(/\D/g, '').slice(-10);
            if (cleanMob.length === 10) {
              currentSponsor.phone = '91' + cleanMob;
              currentSponsor.name = data.full_name || 'अधिकृत बिज़नेस पार्टनर';
              currentSponsor.isPersonalized = true;
              renderSponsorElements();
              return;
            }
          }
        } catch(e) {}
      }

      // 2. Query Supabase
      const db = (window.supabaseClient && typeof window.supabaseClient.from === 'function')
        ? window.supabaseClient
        : ((window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

      if (db) {
        const { data: prof, error } = await db
          .from('profiles')
          .select('id, full_name, mobile, share_id, referral_code')
          .or(`share_id.eq.${shareId},referral_code.eq.${shareId}`)
          .limit(1)
          .maybeSingle();

        if (!error && prof && prof.mobile) {
          const cleanMob = prof.mobile.replace(/\D/g, '').slice(-10);
          if (cleanMob.length === 10) {
            currentSponsor.phone = '91' + cleanMob;
            currentSponsor.name = prof.full_name || 'अधिकृत बिज़नेस पार्टनर';
            currentSponsor.isPersonalized = true;

            try {
              localStorage.setItem('aim_ns_sponsor_phone', currentSponsor.phone);
              localStorage.setItem('aim_ns_sponsor_name', currentSponsor.name);
              localStorage.setItem('aarogyam_upline_phone', cleanMob);
              localStorage.setItem('aim_sharer_prof_' + shareId, JSON.stringify({ data: prof, _ts: Date.now() }));
            } catch (e) {}

            renderSponsorElements();
            return;
          }
        }
      } else {
        // Direct REST fetch fallback
        const sbKey = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
        const res = await fetch(`https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/profiles?or=(share_id.eq.${encodeURIComponent(shareId)},referral_code.eq.${encodeURIComponent(shareId)})&select=full_name,mobile&limit=1`, {
          headers: {
            'apikey': sbKey,
            'Authorization': 'Bearer ' + sbKey
          }
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows && rows[0] && rows[0].mobile) {
            const prof = rows[0];
            const cleanMob = String(prof.mobile).replace(/\D/g, '').slice(-10);
            if (cleanMob.length === 10) {
              currentSponsor.phone = '91' + cleanMob;
              currentSponsor.name = prof.full_name || 'अधिकृत बिज़नेस पार्टनर';
              currentSponsor.isPersonalized = true;

              try {
                localStorage.setItem('aim_ns_sponsor_phone', currentSponsor.phone);
                localStorage.setItem('aim_ns_sponsor_name', currentSponsor.name);
                localStorage.setItem('aarogyam_upline_phone', cleanMob);
                localStorage.setItem('aim_sharer_prof_' + shareId, JSON.stringify({ data: prof, _ts: Date.now() }));
              } catch (e) {}

              renderSponsorElements();
              return;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Netsurf] Sponsor lookup note:', err);
    }
  }

  function renderSponsorElements() {
    const banner = document.getElementById('nsSponsorBanner');
    const nameEl = document.getElementById('nsSponsorNameText');
    const callBtn = document.getElementById('nsSponsorCallBtn');
    const waBtn = document.getElementById('nsSponsorWaBtn');
    const mobileCallBtn = document.getElementById('nsMobileCallBtn');
    const mobileWaBtn = document.getElementById('nsMobileWaBtn');

    if (nameEl) nameEl.textContent = currentSponsor.name;

    const telLink = 'tel:+' + currentSponsor.phone;
    const waText = encodeURIComponent(`नमस्ते ${currentSponsor.name} जी! मैंने आपका नेटसर्फ डायरेक्ट सेलिंग करियर पेज देखा। मुझे इस बिज़नेस मॉडल और ₹8,19,250 क्लोजिंग प्लान की पूरी जानकारी चाहिए।`);
    const waLink = `https://api.whatsapp.com/send?phone=${currentSponsor.phone}&text=${waText}`;

    if (callBtn) callBtn.href = telLink;
    if (waBtn) waBtn.href = waLink;

    if (mobileCallBtn) {
      mobileCallBtn.href = telLink;
      mobileCallBtn.title = 'कॉल करें: ' + currentSponsor.name;
      const callSpan = mobileCallBtn.querySelector('span');
      if (callSpan) {
        callSpan.textContent = currentSponsor.isPersonalized ? 'अपलाइन को कॉल' : 'प्रायोजक को कॉल';
      }
    }

    if (mobileWaBtn) {
      mobileWaBtn.href = waLink;
      mobileWaBtn.target = '_blank';
      mobileWaBtn.rel = 'noopener noreferrer';
      mobileWaBtn.title = 'व्हाट्सएप चैट: ' + currentSponsor.name;
      const waSpan = mobileWaBtn.querySelector('span');
      if (waSpan) {
        waSpan.textContent = currentSponsor.isPersonalized ? 'अपलाइन व्हाट्सएप' : 'व्हाट्सएप संदेश';
      }
    }

    if (banner && currentSponsor.isPersonalized) {
      banner.style.display = 'flex';
    }

    // Synchronize all on-page product card WhatsApp links with current sponsor
    const targetPhone = currentSponsor.isPersonalized ? currentSponsor.phone : DEFAULT_SUPPORT_PHONE;
    const prodWaLinks = document.querySelectorAll('.ns-product-card a[href*="whatsapp.com"], .ns-product-card a[href*="wa.me"]');
    prodWaLinks.forEach(a => {
      try {
        const currentHref = a.getAttribute('href') || '';
        if (currentHref.includes('phone=')) {
          a.href = currentHref.replace(/phone=\d+/, `phone=${targetPhone}`);
        }
      } catch(e) {}
    });
  }

  /**
   * 2. INTERACTIVE COMMISSION & INCOME CALCULATOR
   */
  function initIncomeCalculator() {
    const retailSlider = document.getElementById('calcRetailSlider');
    const teamSlider = document.getElementById('calcTeamSlider');
    if (!retailSlider || !teamSlider) return;

    function recalculate() {
      const retailTurnover = parseInt(retailSlider.value, 10) || 0;
      const teamTurnover = parseInt(teamSlider.value, 10) || 0;

      // Display inputs
      document.getElementById('calcRetailVal').textContent = '₹' + retailTurnover.toLocaleString('en-IN');
      document.getElementById('calcTeamVal').textContent = '₹' + teamTurnover.toLocaleString('en-IN');

      // 1. Retail Profit (5% to 15%)
      let retailPct = 5;
      if (retailTurnover >= 8000) retailPct = 15;
      else if (retailTurnover >= 4000) retailPct = 10;
      else retailPct = 5;

      const weeklyRetailIncome = Math.round((retailTurnover * retailPct) / 100);
      const monthlyRetailIncome = weeklyRetailIncome * 4;

      // 2. Generation Commission (3% to 8%)
      // ₹10,000 -> 3%, ₹20,000 -> 4%, ₹40,000 -> 5%, ₹80,000 -> 6%, ₹1,20,000 -> 7%, ₹1,60,000+ -> 8%
      let genPct = 3;
      if (teamTurnover >= 160000) genPct = 8;
      else if (teamTurnover >= 120000) genPct = 7;
      else if (teamTurnover >= 80000) genPct = 6;
      else if (teamTurnover >= 40000) genPct = 5;
      else if (teamTurnover >= 20000) genPct = 4;
      else if (teamTurnover >= 10000) genPct = 3;
      else genPct = 0;

      const monthlyGenIncome = Math.round((teamTurnover * genPct) / 100);

      // 3. Team Turnover Matching Bonus (3%, 4%, 5%)
      // Up to 25k total income -> 3%, 25k-50k -> 4%, 50k+ -> 5%
      let turnoverPct = 3;
      if (teamTurnover >= 50000) turnoverPct = 5;
      else if (teamTurnover >= 25000) turnoverPct = 4;
      else turnoverPct = 3;

      const biMonthlyTurnoverIncome = Math.round((teamTurnover * turnoverPct) / 100);

      // Total 15-day Projected Income (capped at ₹8,19,250)
      let total15Day = (weeklyRetailIncome * 2) + Math.round(monthlyGenIncome / 2) + biMonthlyTurnoverIncome;
      if (total15Day > 819250) {
        total15Day = 819250; // Cap
      }

      const totalMonthly = total15Day * 2;

      // Update UI Elements
      document.getElementById('calcRetailResult').textContent = `₹${weeklyRetailIncome.toLocaleString('en-IN')} / सप्ताह (${retailPct}%)`;
      document.getElementById('calcGenResult').textContent = `₹${monthlyGenIncome.toLocaleString('en-IN')} / माह (${genPct}%)`;
      document.getElementById('calcTurnoverResult').textContent = `₹${biMonthlyTurnoverIncome.toLocaleString('en-IN')} (${turnoverPct}%)`;
      document.getElementById('calcTotal15Day').textContent = `₹${total15Day.toLocaleString('en-IN')}`;
      document.getElementById('calcTotalMonthly').textContent = `₹${totalMonthly.toLocaleString('en-IN')}`;
    }

    retailSlider.addEventListener('input', recalculate);
    teamSlider.addEventListener('input', recalculate);
    recalculate();
  }

  /**
   * 3. 2-WAY SURVEY LEAD DISPATCH
   */
  function initSurveyForm() {
    const form = document.getElementById('nsCareerSurveyForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('ns_survey_name')?.value?.trim();
      const mobile = document.getElementById('ns_survey_mobile')?.value?.trim();
      const city = document.getElementById('ns_survey_city')?.value?.trim() || 'अज्ञात';
      const background = document.getElementById('ns_survey_bg')?.value || 'उत्सुक नागरिक';
      const target = document.getElementById('ns_survey_goal')?.value || '₹15,000 - ₹50,000';
      const interest = document.getElementById('ns_survey_category')?.value || 'सम्पूर्ण बिज़नेस व प्रोडक्ट';

      if (!name || !mobile || mobile.length < 10) {
        alert('कृपया अपना सही नाम और 10-अंकों का व्हाट्सएप नंबर दर्ज करें।');
        return;
      }

      // Format WhatsApp Message
      const message = 
`🚀 *नेटसर्फ डायरेक्ट सेलिंग करियर सर्वे (Aarogyam India)* 🚀
━━━━━━━━━━━━━━━━━━━━
👤 *नाम:* ${name}
📱 *व्हाट्सएप:* ${mobile}
📍 *शहर/राज्य:* ${city}
💼 *वर्तमान प्रोफ़ाइल:* ${background}
🎯 *मासिक आय लक्ष्य:* ${target}
🌾 *रुचि का क्षेत्र:* ${interest}
🤝 *प्रायोजक (Sponsor):* ${currentSponsor.name}
━━━━━━━━━━━━━━━━━━━━
✅ _मैं नेटसर्फ बिज़नेस मॉडल और आरोग्यम डिजिटल सिस्टम से शुरुआत करने हेतु परामर्श चाहता/चाहती हूँ।_`;

      const encodedMsg = encodeURIComponent(message);
      const targetPhone = currentSponsor.isPersonalized ? currentSponsor.phone : DEFAULT_SUPPORT_PHONE;
      const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;

      // Store lead locally for safety
      try {
        const storedLeads = JSON.parse(localStorage.getItem('aim_ns_leads') || '[]');
        storedLeads.push({ name, mobile, city, background, target, interest, sponsor: currentSponsor.name, date: new Date().toISOString() });
        localStorage.setItem('aim_ns_leads', JSON.stringify(storedLeads));
      } catch (err) {}

      // Confirmation Alert
      alert(`धन्यवाद ${name} जी! आपकी जानकारी दर्ज हो गई है। अब आपको सीधे व्हाट्सएप पर हमारे एक्सपर्ट से कनेक्ट किया जा रहा है।`);

      // Open WhatsApp window
      window.open(waUrl, '_blank');
      form.reset();
    });
  }

  /**
   * 4. VIDEO MASTERCLASS PLAYER
   */
  function initVideoPlayer() {
    const tabs = document.querySelectorAll('.ns-video-tab-btn');
    const player = document.getElementById('nsMasterclassIframe');
    const titleEl = document.getElementById('nsVideoActiveTitle');
    const descEl = document.getElementById('nsVideoActiveDesc');

    if (!tabs || tabs.length === 0 || !player) return;

    // Ensure player has active video initially
    if (player && (!player.src || player.src.includes('demo') || player.src.includes('PLwB_a_9'))) {
      player.src = MASTERCLASS_VIDEOS[0].embedUrl;
      if (titleEl) titleEl.textContent = MASTERCLASS_VIDEOS[0].title;
      if (descEl) descEl.textContent = MASTERCLASS_VIDEOS[0].desc;
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const videoData = MASTERCLASS_VIDEOS[index] || MASTERCLASS_VIDEOS[0];
        if (titleEl) titleEl.textContent = videoData.title;
        if (descEl) descEl.textContent = videoData.desc;

        // In-page embedded video without bouncing out
        player.src = videoData.embedUrl;
      });
    });
  }

  /**
   * 5. DYNAMIC KYP PRODUCTS & CATEGORY FILTER TABS
   */
  async function initKypProductsAndTabs() {
    const tabsContainer = document.querySelector('.ns-kyp-tabs');
    const gridContainer = document.querySelector('.ns-kyp-grid');
    if (!gridContainer) return;

    let productsData = null;

    // 1. Multi-path network-first fetch with cache-busting timestamp
    const tBuster = Date.now();
    const candidatePaths = [
      `/data/netsurf-products-master.json?t=${tBuster}`,
      `../data/netsurf-products-master.json?t=${tBuster}`,
      `./data/netsurf-products-master.json?t=${tBuster}`,
      `/data/netsurf-products-master.json`
    ];

    for (const pUrl of candidatePaths) {
      try {
        const res = await fetch(pUrl, { cache: 'no-store' });
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && Array.isArray(remoteData.products) && remoteData.products.length > 0) {
            productsData = remoteData;
            try {
              localStorage.setItem('aim_netsurf_products_master', JSON.stringify(remoteData));
            } catch (e) {}
            break;
          }
        }
      } catch (err) {}
    }

    // 2. Safe Local Storage fallback if network fetch was blocked
    if (!productsData || !productsData.products) {
      try {
        const localCached = localStorage.getItem('aim_netsurf_products_master');
        if (localCached) {
          productsData = JSON.parse(localCached);
        }
      } catch (e) {}
    }

    if (productsData && productsData.products && productsData.products.length > 0) {
      // Dynamically render category tabs
      if (tabsContainer && productsData.categories && productsData.categories.length > 0) {
        let tabsHtml = `
          <button type="button" class="ns-kyp-tab-btn active" data-cat="all">
            <span>🌟</span> सभी उत्पाद (${productsData.products.length})
          </button>
        `;
        productsData.categories.forEach(cat => {
          const count = productsData.products.filter(p => p.category === cat.id).length;
          tabsHtml += `
            <button type="button" class="ns-kyp-tab-btn" data-cat="${cat.id}">
              ${cat.name} (${count})
            </button>
          `;
        });
        tabsContainer.innerHTML = tabsHtml;
      }

      // Dynamically render product cards
      const targetPhone = currentSponsor.isPersonalized ? currentSponsor.phone : DEFAULT_SUPPORT_PHONE;
      let gridHtml = '';

      productsData.products.forEach(p => {
        const mrp = parseInt(p.mrp, 10) || 0;
        const discountPct = parseInt(p.discount_pct, 10) || 0;
        const offerPrice = p.discounted_price || (discountPct ? Math.round(mrp * (1 - discountPct / 100)) : mrp);
        const imgSrc = resolveProductImg(p.image);

        const waMsg = encodeURIComponent(`नमस्ते ${currentSponsor.name} जी! मुझे नेटसर्फ उत्पाद: *${p.name}* (MRP: ₹${mrp}, ऑफर रेट: ₹${offerPrice}, ${discountPct}% छूट) की जानकारी चाहिए व ऑर्डर करना है।`);
        const waOrderUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${waMsg}`;

        gridHtml += `
          <div class="ns-product-card" data-product-cat="${p.category}" data-product-sub="${p.subcategory || ''}">
            <div class="ns-product-img-wrap" style="position:relative;">
              <img src="${imgSrc}" alt="${p.name}" onerror="this.src='/images/logo/logo.png';" loading="lazy">
              ${p.badge ? `<span style="position:absolute;top:8px;left:8px;background:rgba(21,128,61,0.92);color:#fff;font-size:0.68rem;padding:3px 8px;border-radius:12px;font-weight:800;backdrop-filter:blur(4px);">${p.badge}</span>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px;flex-wrap:wrap;">
              <span class="ns-product-badge" style="background:#dcfce7;color:#15803d;font-size:0.72rem;padding:3px 8px;border-radius:12px;font-weight:700;">
                ${p.category_label || p.category}
              </span>
              ${p.subcategory_label ? `<span style="font-size:0.7rem;background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:10px;font-weight:600;">${p.subcategory_label}</span>` : ''}
            </div>
            <h3 class="ns-product-title" style="font-size:1.1rem;font-weight:800;color:#0f172a;margin:2px 0 6px 0;line-height:1.35;">${p.name}</h3>
            
            <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
              <span style="font-size:1.2rem;font-weight:900;color:#16a34a;">₹${offerPrice}</span>
              ${mrp > offerPrice ? `
                <span style="text-decoration:line-through;color:#94a3b8;font-size:0.85rem;">₹${mrp}</span>
                <span style="font-size:0.75rem;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:6px;font-weight:800;">${discountPct}% छूट</span>
              ` : ''}
            </div>

            <p class="ns-product-benefits" style="font-size:0.84rem;color:#475569;margin-bottom:10px;line-height:1.45;">
              ${p.description || ''}
            </p>

            ${p.ingredients ? `
              <div style="background:#f8fafc;border-left:3px solid #10b981;padding:6px 10px;border-radius:4px;margin-bottom:8px;font-size:0.76rem;color:#334155;">
                <strong style="color:#059669;">🌱 मुख्य घटक:</strong> ${p.ingredients}
              </div>
            ` : ''}

            ${p.dose ? `
              <div style="background:#f0fdf4;border-left:3px solid #22c55e;padding:6px 10px;border-radius:4px;margin-bottom:8px;font-size:0.76rem;color:#166534;">
                <strong style="color:#15803d;">📋 उपयोग व खुराक:</strong> ${p.dose}
              </div>
            ` : ''}

            ${p.precautions ? `
              <div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:6px 10px;border-radius:4px;margin-bottom:12px;font-size:0.76rem;color:#92400e;">
                <strong style="color:#b45309;">⚠️ सावधानियां:</strong> ${p.precautions}
              </div>
            ` : ''}

            <div style="margin-top:auto;padding-top:10px;">
              <a href="${waOrderUrl}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#16a34a;color:#ffffff;font-weight:800;font-size:0.82rem;padding:9px 14px;border-radius:8px;text-decoration:none;box-shadow:0 3px 10px rgba(22,163,74,0.3);transition:all 0.2s;" onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">
                <i class="fa-brands fa-whatsapp" style="font-size:1rem;"></i>
                <span>ऑर्डर / WhatsApp पूछताछ</span>
              </a>
            </div>
          </div>
        `;
      });

      gridContainer.innerHTML = gridHtml;
    }

    // Attach Tab Filtering Listeners — AFTER innerHTML is set
    const allTabs = document.querySelectorAll('.ns-kyp-tab-btn');
    allTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        allTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.getAttribute('data-cat');
        // Re-query cards each time (they exist after innerHTML was set)
        const cards = document.querySelectorAll('.ns-product-card');
        cards.forEach(card => {
          if (cat === 'all' || card.getAttribute('data-product-cat') === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /**
   * 6. FAQ ACCORDION TOGGLE
   */
  function initFaqAccordion() {
    const items = document.querySelectorAll('.ns-faq-item');
    items.forEach(item => {
      const q = item.querySelector('.ns-faq-question');
      if (!q) return;
      q.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        items.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });
  }

})(window, document);
