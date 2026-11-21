/**
 * ====================================================================
 * AAROGYAM INDIA - MY TEAM IMMERSIVE SPOTLIGHT GUIDED TOUR
 * Version: 21.0 - Ultra Fluid RAF Glued Element Tracking & Page Aware
 * ====================================================================
 */

(function () {
  'use strict';

  const TOUR_STORAGE_KEY = 'AAROGYAM_MYTEAM_TOUR_V21';

  // 1. Detect active sub-page
  function getPageType() {
    const p = (window.location.pathname || '').toLowerCase();
    if (p.includes('bahikhata')) return 'bahikhata';
    if (p.includes('followup')) return 'followup';
    if (p.includes('todo')) return 'todo';
    if (p.includes('dairy')) return 'dairy';
    return 'entry'; // default myteam.html
  }

  // 2. Define page-specific tour steps
  const tourConfigs = {
    bahikhata: [
      {
        target: '#kbCustomerSearchInput, .kb-search-container, .kb-ledger-header',
        title: '🔍 ग्राहक खोजें व फ़िल्टर',
        desc: 'यहाँ किसी भी किसान या सप्लायर का नाम या मोबाइल नंबर टाइप करके उसका खाता 1 सेकंड में खोजें।',
        badge: 'कदम 1 / 5'
      },
      {
        target: '.kb-balance-summary-card, #kbSummaryBalanceCard, .kb-party-tabs',
        title: '💰 उधारी व जमा का कुल हिसाब',
        desc: 'आप देंगे (उधार) और आपको मिलेंगे (जमा) का लाइव योग यहाँ हमेशा सही व पारदर्शी दिखता है।',
        badge: 'कदम 2 / 5'
      },
      {
        target: '#kbCustomerList, .kb-customer-item, #kbEmptyState',
        title: '📖 ग्राहकों की खाता सूची',
        desc: 'यहाँ आपके सभी ग्राहकों की लिस्ट है। किसी भी नाम पर क्लिक करके उसका पूरा ऑनलाइन लेजर देखें।',
        badge: 'कदम 3 / 5'
      },
      {
        target: '#kbMainFabBtn, .kb-fab-btn, button[onclick*="kbOpenAddPartyModal"]',
        title: '➕ नया ग्राहक जोड़ें (Khatabook स्टाइल)',
        desc: 'नीचे दाएँ (Bottom-Right) लाल बटन को दबाकर तुरंत नया ग्राहक या सप्लायर जोड़ें और खाता शुरू करें!',
        badge: 'कदम 4 / 5'
      },
      {
        target: '#myTeamQuickNavGrid, .smart-hub-nav-grid',
        title: '🚀 क्विक नेविगेशन ग्रिड',
        desc: 'यहाँ से 1-क्लिक में सरल किसान एंट्री, 1-टैप फॉलो-अप, To-Do कार्य सूची या ऑटो-शिपिंग डायरी में जाएँ।',
        badge: 'कदम 5 / 5'
      }
    ],
    followup: [
      {
        target: '#tab-diary-followup, .smart-hub-header, #followupQueueControls',
        title: '⚡ 1-टैप स्मार्ट फॉलो-अप CRM',
        desc: 'यह आपकी फॉलो-अप कतार है। यहाँ आपके सभी किसान, प्रोस्पेक्ट और डिस्ट्रीब्यूटर लाइन से लगे होते हैं।',
        badge: 'कदम 1 / 5'
      },
      {
        target: '#hubMainSubjectSelect, #hubSubItemSelect, .message-subject-selector',
        title: '🎯 मैसेज का विषय व उत्पाद चुनें',
        desc: 'फसल डॉक्टर, जैविक उत्पाद, ट्यूब वीडियो या सुविचार चुनें — मैसेज स्वतः हिंदी में तैयार हो जाता है!',
        badge: 'कदम 2 / 5'
      },
      {
        target: '#btnHubSendWa, .btn-royal-green',
        title: '🟢 1-टैप WhatsApp & Next',
        desc: 'इस हरे बटन को दबाते ही किसान को WhatsApp मैसेज जाएगा और स्क्रीन पर अगला किसान तुरंत आ जाएगा!',
        badge: 'कदम 3 / 5'
      },
      {
        target: '#btnHubSendSms, .btn-royal-blue',
        title: '🔵 1-टैप SMS & Next',
        desc: 'यदि किसान के पास इंटरनेट या WhatsApp नहीं है, तो इस नीले बटन से सीधा साधारण SMS भेजें।',
        badge: 'कदम 4 / 5'
      },
      {
        target: '#myTeamQuickNavGrid, .smart-hub-nav-grid',
        title: '🚀 क्विक नेविगेशन ग्रिड',
        desc: 'यहाँ से 1-क्लिक में सरल किसान एंट्री, बहीखाता (उधारी-जमा), To-Do कार्य सूची या ऑटो-शिपिंग डायरी में जाएँ।',
        badge: 'कदम 5 / 5'
      }
    ],
    entry: [
      {
        target: '#myTeamFormCard, #smartDiaryForm',
        title: '👋 My Team — सरल किसान व टीम एंट्री!',
        desc: 'यह आपकी मुख्य कार्य स्क्रीन है। यहाँ से आप 30 सेकंड में किसी भी नए किसान या टीम साथी की प्रविष्टि दर्ज कर सकते हैं।',
        badge: 'कदम 1 / 5'
      },
      {
        target: '.entity-toggle-wrap, #btnEntityCustomer',
        title: '🌾 ग्राहक या टीम साथी चुनें',
        desc: 'यहाँ से आसानी से चुनें: 🌾 किसान/ग्राहक, 🤝 टीम साथी (NetSurf डिस्ट्रीब्यूटर), या 🎁 6-महीने ऑटोशिप ग्राहक।',
        badge: 'कदम 2 / 5'
      },
      {
        target: '.contact-dock-box, button[onclick*="openDiaryContactPicker"]',
        title: '⚡ त्वरित संपर्क चुनें (Auto-Fill)',
        desc: 'नंबर याद रखने की ज़रूरत नहीं! अपनी 📖 डायरी, 📱 फ़ोन बुक या 🌟 डायरेक्ट टीम रेफरल्स से 1-क्लिक में नाम व नंबर स्वतः भरें।',
        badge: 'कदम 3 / 5'
      },
      {
        target: '#btnSubmitDiaryEntry',
        title: '💾 1-क्लिक में सुरक्षित करें',
        desc: 'इस नीले बटन को दबाते ही आपकी प्रविष्टि हमेशा के लिए सुरक्षित हो जाएगी और WhatsApp फॉलो-अप व बहीखाता में जुड़ जाएगी।',
        badge: 'कदम 4 / 5'
      },
      {
        target: '#myTeamQuickNavGrid, .smart-hub-nav-grid',
        title: '🚀 4 बड़े क्विक नेविगेशन कार्ड्स',
        desc: 'यहाँ से 1-क्लिक में 📕 बहीखाता (उधारी-जमा), ⚡ स्मार्ट फॉलो-अप CRM, 📋 To-Do कार्य सूची और 🎁 ऑटो-शिपिंग डायरी खोलें!',
        badge: 'कदम 5 / 5'
      }
    ],
    todo: [
      {
        target: '#todoInput, .todo-add-box',
        title: '📋 नया कार्य (Task) जोड़ें',
        desc: 'आज के महत्वपूर्ण काम जैसे किसान को फोन करना, डिलीवरी देना आदि यहाँ लिखें और जोड़ें।',
        badge: 'कदम 1 / 4'
      },
      {
        target: '#todoList, .todo-list-wrap',
        title: '✅ कार्य सूची व स्टेटस',
        desc: 'यहाँ आपके सभी काम दिखते हैं। काम पूरा होने पर टिकमार्क करें।',
        badge: 'कदम 2 / 4'
      },
      {
        target: '.todo-filter-pills, .status-pill-btn',
        title: '🎯 फ़िल्टर व प्राथमिकता',
        desc: 'आज के काम, लंबित काम और पूरे किए गए काम को अलग-अलग देखें।',
        badge: 'कदम 3 / 4'
      },
      {
        target: '#myTeamQuickNavGrid, .smart-hub-nav-grid',
        title: '🚀 क्विक नेविगेशन ग्रिड',
        desc: 'यहाँ से 1-क्लिक में सरल किसान एंट्री, बहीखाता (उधारी-जमा), 1-टैप फॉलो-अप में जाएँ।',
        badge: 'कदम 4 / 4'
      }
    ],
    dairy: [
      {
        target: '#autoshipRadarCard, .smart-form-card:first-of-type',
        title: '🎁 6-महीने ऑटोशिप रडार',
        desc: 'लगातार 5 महीने उत्पाद लेने वाले किसानों का रिकॉर्ड — 6वें महीने उन्हें 100% मुफ़्त लॉयल्टी उपहार मिलता है!',
        badge: 'कदम 1 / 4'
      },
      {
        target: '#dailyExpenseCard, .smart-form-card:nth-of-type(2), #pocketExpenseForm',
        title: '⛽ दैनिक फील्ड खर्च व पेट्रोल ट्रैकर',
        desc: 'फील्ड में होने वाले पेट्रोल, बस किराया और नाश्ते का खर्च यहाँ दर्ज करें ताकि आपकी शुद्ध मासिक बचत साफ दिखे।',
        badge: 'कदम 2 / 4'
      },
      {
        target: '#btnSaveExpense, button[type="submit"]',
        title: '💾 प्रविष्टि सुरक्षित करें',
        desc: '1-क्लिक में खर्च सुरक्षित करें और क्लाउड पर हमेशा के लिए रिकॉर्ड रखें।',
        badge: 'कदम 3 / 4'
      },
      {
        target: '#myTeamQuickNavGrid, .smart-hub-nav-grid',
        title: '🚀 क्विक नेविगेशन ग्रिड',
        desc: 'यहाँ से 1-क्लिक में सरल किसान एंट्री, बहीखाता (उधारी-जमा), 1-टैप फॉलो-अप में जाएँ।',
        badge: 'कदम 4 / 4'
      }
    ]
  };

  let currentStepIdx = 0;
  let backdropEl = null;
  let spotlightFrame = null;
  let tourBoxEl = null;
  let isTourActive = false;
  let rafTrackId = null;
  let activeSteps = [];

  function injectTourStyles() {
    if (document.getElementById('myteam-tour-v21-style')) return;
    const style = document.createElement('style');
    style.id = 'myteam-tour-v21-style';
    style.textContent = `
      /* 1. DARK BLUR BACKDROP WITH PRECISE POLYGON CUTOUT HOLE */
      #myteam-tour-backdrop {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(3, 7, 18, 0.88) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        backdrop-filter: blur(8px) !important;
        z-index: 1000000 !important;
        cursor: pointer !important;
        transition: clip-path 0.15s ease-out !important;
      }

      /* 2. GLOWING SPOTLIGHT BORDER FRAME */
      #myteam-tour-spotlight-frame {
        position: fixed !important;
        background: transparent !important;
        border-radius: 14px !important;
        border: 2.5px solid #ffffff !important;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.95), 0 0 40px rgba(37, 99, 235, 0.6) !important;
        pointer-events: none !important;
        z-index: 1000002 !important;
        transition: all 0.12s ease-out !important;
        box-sizing: border-box !important;
        opacity: 0;
      }
      #myteam-tour-spotlight-frame.active {
        opacity: 1 !important;
      }
      #myteam-tour-spotlight-frame::after {
        content: '' !important;
        position: absolute !important;
        inset: -5px !important;
        border-radius: 18px !important;
        border: 2px solid rgba(255, 255, 255, 0.8) !important;
        animation: myTeamPulseRing 1.6s ease-out infinite !important;
        pointer-events: none !important;
      }
      @keyframes myTeamPulseRing {
        0% { transform: scale(0.96); opacity: 0.9; }
        100% { transform: scale(1.22); opacity: 0; }
      }

      /* 3. SHARP HIGH-CONTRAST STEP CARD */
      #myteam-tour-card {
        position: fixed !important;
        z-index: 1000005 !important;
        width: min(340px, calc(100vw - 32px)) !important;
        background: #ffffff !important;
        border-radius: 16px !important;
        padding: 16px !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0,0,0,0.06) !important;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: #0f172a !important;
        box-sizing: border-box !important;
        transition: opacity 0.15s ease, transform 0.15s ease !important;
      }
      #myteam-tour-card * {
        box-sizing: border-box !important;
      }
      .m-tour-hdr {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        margin-bottom: 8px !important;
      }
      .m-tour-badge {
        font-size: 0.78rem !important;
        font-weight: 900 !important;
        padding: 3px 10px !important;
        border-radius: 20px !important;
        background: #eff6ff !important;
        color: #1d4ed8 !important;
        border: 1px solid #bfdbfe !important;
      }
      .m-tour-close {
        background: none !important;
        border: none !important;
        color: #64748b !important;
        font-size: 1.25rem !important;
        cursor: pointer !important;
        padding: 2px 6px !important;
        line-height: 1 !important;
      }
      .m-tour-close:hover {
        color: #ef4444 !important;
      }
      .m-tour-title {
        font-size: 1.05rem !important;
        font-weight: 900 !important;
        color: #0f172a !important;
        margin: 0 0 6px 0 !important;
        line-height: 1.3 !important;
      }
      .m-tour-desc {
        font-size: 0.85rem !important;
        color: #334155 !important;
        line-height: 1.45 !important;
        margin: 0 0 14px 0 !important;
        font-weight: 600 !important;
      }
      .m-tour-actions {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
      }
      .m-tour-btn-prev {
        background: #f1f5f9 !important;
        border: 1px solid #cbd5e1 !important;
        color: #334155 !important;
        padding: 7px 14px !important;
        border-radius: 8px !important;
        font-size: 0.82rem !important;
        font-weight: 800 !important;
        cursor: pointer !important;
      }
      .m-tour-btn-next {
        background: #0052cc !important;
        border: none !important;
        color: #ffffff !important;
        padding: 8px 18px !important;
        border-radius: 8px !important;
        font-size: 0.85rem !important;
        font-weight: 900 !important;
        cursor: pointer !important;
        box-shadow: 0 3px 10px rgba(0, 82, 204, 0.35) !important;
      }
      .m-tour-btn-next * {
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);
  }

  function resolveTarget(selector) {
    if (!selector) return null;
    const parts = selector.split(',').map(s => s.trim());
    for (const part of parts) {
      const el = document.querySelector(part);
      if (el && el.offsetParent !== null) return el;
    }
    return document.querySelector(parts[0]) || null;
  }

  function updateSpotlightRAF(targetEl) {
    if (!isTourActive || !backdropEl || !spotlightFrame || !tourBoxEl) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const pad = 6;
    const margin = 14;

    if (targetEl && targetEl !== document.body) {
      const r = targetEl.getBoundingClientRect();
      if (r && (r.width > 0 || r.height > 0)) {
        const holeL = Math.max(0, Math.round(r.left - pad));
        const holeT = Math.max(0, Math.round(r.top - pad));
        const holeR = Math.min(winW, Math.round(r.right + pad));
        const holeB = Math.min(winH, Math.round(r.bottom + pad));

        // 1. Physical Polygon Cutout in dark backdrop
        const clipPoly = `polygon(0px 0px, 0px ${winH}px, ${holeL}px ${winH}px, ${holeL}px ${holeT}px, ${holeR}px ${holeT}px, ${holeR}px ${holeB}px, ${holeL}px ${holeB}px, ${holeL}px ${winH}px, ${winW}px ${winH}px, ${winW}px 0px)`;
        backdropEl.style.clipPath = clipPoly;
        backdropEl.style.webkitClipPath = clipPoly;

        // 2. Spotlight frame
        spotlightFrame.style.width = `${Math.round(holeR - holeL)}px`;
        spotlightFrame.style.height = `${Math.round(holeB - holeT)}px`;
        spotlightFrame.style.left = `${Math.round(holeL)}px`;
        spotlightFrame.style.top = `${Math.round(holeT)}px`;
        spotlightFrame.classList.add('active');

        // 3. Tour card positioning: intelligent above or below placement
        const cardW = Math.min(340, winW - 28);
        tourBoxEl.style.width = `${cardW}px`;

        let cardLeft = Math.max(margin, Math.min(winW - cardW - margin, Math.round(holeL + ((holeR - holeL) / 2) - (cardW / 2))));
        let cardTop = 80;

        const cardH = tourBoxEl.offsetHeight || 180;

        if (holeB + cardH + 16 < winH) {
          // Place below target
          cardTop = holeB + 14;
        } else if (holeT - cardH - 14 > 10) {
          // Place above target
          cardTop = Math.max(10, holeT - cardH - 14);
        } else {
          // Target occupies middle of screen: place at top or bottom where there is more space
          if (holeT > (winH - holeB)) {
            cardTop = Math.max(10, holeT - cardH - 10);
          } else {
            cardTop = Math.min(winH - cardH - 10, holeB + 10);
          }
        }

        tourBoxEl.style.left = `${cardLeft}px`;
        tourBoxEl.style.top = `${cardTop}px`;
        return;
      }
    }

    // Fallback: full center screen modal if target not found
    backdropEl.style.clipPath = 'none';
    backdropEl.style.webkitClipPath = 'none';
    spotlightFrame.classList.remove('active');

    const cardW = Math.min(340, winW - 28);
    tourBoxEl.style.width = `${cardW}px`;
    tourBoxEl.style.left = `${Math.round((winW - cardW) / 2)}px`;
    tourBoxEl.style.top = `${Math.round(winH * 0.3)}px`;
  }

  function startRafLoop(targetEl) {
    if (rafTrackId) cancelAnimationFrame(rafTrackId);
    function tick() {
      if (!isTourActive) return;
      updateSpotlightRAF(targetEl);
      rafTrackId = requestAnimationFrame(tick);
    }
    rafTrackId = requestAnimationFrame(tick);
  }

  function renderCurrentStep() {
    if (!isTourActive || currentStepIdx >= activeSteps.length) {
      endTour();
      return;
    }

    const step = activeSteps[currentStepIdx];
    const targetEl = resolveTarget(step.target);

    // Smoothly scroll target into center view
    if (targetEl && targetEl !== document.body) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Render Tour Card Contents
    const isFirst = (currentStepIdx === 0);
    const isLast = (currentStepIdx === activeSteps.length - 1);

    tourBoxEl.innerHTML = `
      <div class="m-tour-hdr">
        <span class="m-tour-badge">${step.badge || `कदम ${currentStepIdx + 1} / ${activeSteps.length}`}</span>
        <button class="m-tour-close" onclick="window.closeMyTeamTour()" title="टूर बंद करें">&times;</button>
      </div>
      <div class="m-tour-title">${step.title}</div>
      <div class="m-tour-desc">${step.desc}</div>
      <div class="m-tour-actions">
        ${!isFirst ? '<button class="m-tour-btn-prev" onclick="window.prevMyTeamTourStep()">← पीछे</button>' : '<div></div>'}
        <button class="m-tour-btn-next" onclick="window.nextMyTeamTourStep()">${isLast ? '✓ समझ गया, शुरू करें' : 'आगे बढ़ें →'}</button>
      </div>
    `;

    // Start RAF glued tracking
    startRafLoop(targetEl);
  }

  function startTour(forceRestart) {
    injectTourStyles();

    const pageType = getPageType();
    activeSteps = tourConfigs[pageType] || tourConfigs.entry;

    if (!forceRestart && localStorage.getItem(TOUR_STORAGE_KEY + '_' + pageType) === 'done') {
      return;
    }

    currentStepIdx = 0;
    isTourActive = true;

    if (!backdropEl) {
      backdropEl = document.createElement('div');
      backdropEl.id = 'myteam-tour-backdrop';
      backdropEl.onclick = function (e) {
        if (e.target === backdropEl) {
          window.nextMyTeamTourStep();
        }
      };
      document.body.appendChild(backdropEl);
    }

    if (!spotlightFrame) {
      spotlightFrame = document.createElement('div');
      spotlightFrame.id = 'myteam-tour-spotlight-frame';
      document.body.appendChild(spotlightFrame);
    }

    if (!tourBoxEl) {
      tourBoxEl = document.createElement('div');
      tourBoxEl.id = 'myteam-tour-card';
      document.body.appendChild(tourBoxEl);
    }

    backdropEl.style.display = 'block';
    spotlightFrame.style.display = 'block';
    tourBoxEl.style.display = 'block';

    renderCurrentStep();
  }

  function nextStep() {
    if (currentStepIdx < activeSteps.length - 1) {
      currentStepIdx++;
      renderCurrentStep();
    } else {
      endTour();
    }
  }

  function prevStep() {
    if (currentStepIdx > 0) {
      currentStepIdx--;
      renderCurrentStep();
    }
  }

  function endTour() {
    isTourActive = false;
    if (rafTrackId) cancelAnimationFrame(rafTrackId);

    if (backdropEl) backdropEl.style.display = 'none';
    if (spotlightFrame) spotlightFrame.style.display = 'none';
    if (tourBoxEl) tourBoxEl.style.display = 'none';

    const pageType = getPageType();
    try {
      localStorage.setItem(TOUR_STORAGE_KEY + '_' + pageType, 'done');
    } catch (e) { }
  }

  // Public API
  window.startMyTeamTour = startTour;
  window.nextMyTeamTourStep = nextStep;
  window.prevMyTeamTourStep = prevStep;
  window.closeMyTeamTour = endTour;

  // Auto-run on first visit after page load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      startTour(false);
    }, 1200);
  });
})();
