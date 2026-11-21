/**
 * ====================================================================
 * AAROGYAM INDIA - IMMERSIVE DARK BLUR SPOTLIGHT TOUR
 * Version: 12.0 - Ultra Fluid Flow, Clamped Shelf Cutout, 60fps RAF Glued
 * ====================================================================
 */

(function () {
  'use strict';

  const TOUR_STORAGE_KEY = 'AI_WALKTHROUGH_V12';

  // 12 Seamless, Focused Guided Steps
  const tourSteps = [
    {
      // 1. Welcome Brand Logo
      target: 'header .brand-logo-pill, .brand-logo-pill',
      arrow: 'UP',
      isFixed: true,
      title: '🌿 Aarogyam India me Swagat Hai!',
      desc: 'भारत का पहला सर्टिफाइड जैविक कृषि व स्वास्थ्य सहायता मंच! चलिए 1 मिनट में मुख्य फीचर्स सीखें।',
      badge: 'Step 1 of 12'
    },
    {
      // 2. All-in-One Menu Drawer
      target: 'header button.menu-button, button.menu-button, button[onclick*="openUniversalDrawer"]',
      arrow: 'UP',
      isFixed: true,
      title: '📂 All-in-One Menu Drawer',
      desc: 'यहाँ क्लिक करके सम्पूर्ण मेनू, प्रोफाइल, माय इनवॉइस, बहीखाता और ई-बुक्स खोलें।',
      badge: 'Step 2 of 12'
    },
    {
      // 3. Sakhi AI Floating Avatar Coin
      target: '#sakhiFloatingPill, .sakhi-floating-pill, .sakhi-pill-avatar-wrap',
      arrow: 'LEFT',
      isFixed: true,
      title: '🤖 24×7 Aarogyam Sakhi AI Doctor',
      desc: 'आपकी डिजिटल सखी! अपनी फसल या पशु की बीमारी का फोटो भेजें या बोलकर पूछें — तुरंत सही दवा व इलाज पाएं।',
      badge: 'Step 3 of 12'
    },
    {
      // 4. Gift Box on Right Dock
      target: '#universal-sticky-gift-btn, .dock-gift-btn, #universal-sticky-dock-bar button:first-child',
      arrow: 'RIGHT',
      isFixed: true,
      title: '🎁 Uphaar & Offers (Gift Box)',
      desc: 'यहाँ क्लिक करके 5-इन-1 कॉम्बो ऑफर पाएं और 10 साथियों को शेयर करके वॉलेट डिस्काउंट पॉइंट्स कमाएं!',
      badge: 'Step 4 of 12'
    },
    {
      // 5. Aarogyam Tube on Right Dock
      target: '#universal-sticky-tube-btn, .dock-tube-btn, #universal-sticky-dock-bar a[href*="tube"]',
      arrow: 'RIGHT',
      isFixed: true,
      title: '🎥 Aarogyam Tube (वीडियो गाइड्स)',
      desc: 'जैविक खेती, दवा छिड़काव और पशुपालन के असली प्रैक्टिकल वीडियो बिना किसी विज्ञापन के HD में देखें।',
      badge: 'Step 5 of 12'
    },
    {
      // 6. Share & Earn on Right Dock
      target: '#universal-sticky-share-btn, .dock-share-btn, #universal-sticky-dock-bar button[onclick*="Share"]',
      arrow: 'RIGHT',
      isFixed: true,
      title: '📤 Share & Earn (डायरेक्ट टीम)',
      desc: 'आपके शेयर लिंक से जुड़ने वाले आपकी डायरेक्ट टीम बनेंगे! उनके डैशबोर्ड में आपका नाम अपलाइन दिखेगा और पॉइंट्स मिलेंगे।',
      badge: 'Step 6 of 12'
    },
    {
      // 7. Install App on Right Dock
      target: '#universal-sticky-pwa-install-btn, .dock-pwa-btn, #universal-sticky-dock-bar button[onclick*="Pwa"]',
      arrow: 'RIGHT',
      isFixed: true,
      title: '📲 1-Click Fast App Install',
      desc: 'सिर्फ 1 MB में वेबसाइट को ऐप की तरह अपने मोबाइल की होम स्क्रीन पर इंस्टॉल करें!',
      badge: 'Step 7 of 12'
    },
    {
      // 8. E-Books Shelf (Focused spotlight on first book/bundle card so background stays 100% dark & blurred)
      target: '.universal-bundle-card, .universal-book-card, #home-bundles-shelf-container .universal-shelf-scroll-wrap, #home-bundles-shelf-container, .shelf-section',
      arrow: 'DOWN',
      isFixed: false,
      maxHeight: 220,
      maxWidth: 340,
      title: '📚 E-Books Shelf (किताबों का शेल्फ)',
      desc: 'यहाँ नीचे सभी प्रमाणित कृषि, बागवानी, पशुपालन व बिज़नेस ई-बुक्स के शेल्फ हैं — 1-क्लिक में पढ़ें व सीखें!',
      badge: 'Step 8 of 12'
    },
    {
      // 9. Bottom Nav Tab 2: Profile
      target: '#universal-mobile-bottom-nav .u-nav-tab:nth-child(2), #universal-mobile-bottom-nav a[href*="ucas"]',
      arrow: 'DOWN',
      isFixed: true,
      title: '👤 My Profile Dashboard',
      desc: 'यहाँ आपका प्रोफाइल, ई-बुक्स डाउनलोड सेंटर, माय इनवॉइस और शेयर एंड अर्न वॉलेट सुरक्षित रहता है।',
      badge: 'Step 9 of 12'
    },
    {
      // 10. Bottom Nav Tab 6: Health Care
      target: '#universal-mobile-bottom-nav .u-nav-tab:nth-child(6), #universal-mobile-bottom-nav a[href*="health"]',
      arrow: 'DOWN',
      isFixed: true,
      title: '❤️ Health Care (स्वास्थ्य समाधान)',
      desc: 'डायबिटीज, जोड़ों का दर्द, लिवर, हार्ट और पर्सनल केयर की सभी प्रमाणित गाइड्स व समाधान।',
      badge: 'Step 10 of 12'
    },
    {
      // 11. Bottom Nav Tab 7: Netsurf Hub
      target: '#universal-mobile-bottom-nav .u-nav-tab:nth-child(7), #universal-mobile-bottom-nav a[href*="netsurf"]',
      arrow: 'DOWN',
      isFixed: true,
      title: '🌱 Netsurf Hub (उत्पाद कैटलॉग)',
      desc: '100% जैविक बायो-फिट कृषि उत्पाद कैटलॉग, बिज़नेस प्लान और पाथफाइंडर लीडर पोर्टल।',
      badge: 'Step 11 of 12'
    },
    {
      // 12. Tour Complete
      target: null,
      arrow: 'NONE',
      isFixed: true,
      title: '🎉 Shuru Karein — Aarogyam India!',
      desc: 'बधाई हो! आपने वेबसाइट का स्मार्ट टूर समझ लिया। साइड मेनू में "Website Tour Guide" से इसे कभी भी दोबारा देख सकते हैं।',
      badge: 'Step 12 of 12'
    }
  ];

  let currentStepIndex = 0;
  let backdropEl = null;
  let spotlightFrame = null;
  let tourContainer = null;
  let targetArrowEl = null;
  let isTourActive = false;
  let rafScrollId = null;

  function isLandingPage() {
    const p = (window.location.pathname || '').toLowerCase();
    const s = (window.location.search || '').toLowerCase();
    return p.includes('book-landing') || p.includes('landingpage') || p.includes('bundle') || s.includes('bk=') || s.includes('bundle=');
  }

  function injectTourStyles() {
    if (document.getElementById('ai-tour-v12-style')) return;
    const style = document.createElement('style');
    style.id = 'ai-tour-v12-style';
    style.textContent = `
      /* 1. SOLID 100% RELIABLE FULL-PAGE DARK BLUR OVERLAY WITH HARD CUTOUT */
      #ai-tour-dark-backdrop {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(4, 8, 18, 0.90) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        backdrop-filter: blur(12px) !important;
        z-index: 999990 !important;
        pointer-events: auto !important;
        cursor: pointer !important;
      }

      /* 2. CRISP WHITE SPOTLIGHT FRAME AROUND THE CUTOUT HOLE (100% TRANSPARENT INSIDE) */
      #ai-tour-spotlight-frame {
        position: fixed !important;
        background: transparent !important;
        border-radius: 14px !important;
        border: 2.5px solid #ffffff !important;
        box-shadow: 0 0 22px rgba(255, 255, 255, 0.95), 0 0 45px rgba(34, 197, 94, 0.5) !important;
        pointer-events: none !important;
        z-index: 999994 !important;
        transition: all 0.12s ease-out !important;
        opacity: 0;
        box-sizing: border-box !important;
      }
      #ai-tour-spotlight-frame.active {
        opacity: 1 !important;
      }
      #ai-tour-spotlight-frame::after {
        content: '' !important;
        position: absolute !important;
        inset: -6px !important;
        border-radius: 18px !important;
        border: 2px solid rgba(255, 255, 255, 0.75) !important;
        animation: aiTourPulseRing 1.6s ease-out infinite !important;
        pointer-events: none !important;
      }
      @keyframes aiTourPulseRing {
        0% { transform: scale(0.96); opacity: 0.9; }
        100% { transform: scale(1.22); opacity: 0; }
      }

      /* 3. PURE FLOATING TEXT VIEW (ABSOLUTELY NO BOX, NO BORDER, NO BACKGROUND) */
      #ai-tour-floating-view {
        position: fixed !important;
        z-index: 999996 !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        color: #ffffff !important;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        box-sizing: border-box !important;
        opacity: 0;
        pointer-events: auto !important;
        transition: opacity 0.15s ease !important;
      }
      #ai-tour-floating-view.active {
        opacity: 1 !important;
      }

      /* Header Badge */
      .ai-tour-v12-hdr {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        margin-bottom: 8px !important;
      }
      .ai-tour-v12-badge {
        font-size: 0.84rem !important;
        font-weight: 900 !important;
        padding: 4px 14px !important;
        border-radius: 20px !important;
        background: rgba(255, 255, 255, 0.18) !important;
        color: #ffffff !important;
        border: 1.5px solid rgba(255, 255, 255, 0.45) !important;
        letter-spacing: 0.5px !important;
        text-shadow: 0 1px 4px rgba(0,0,0,0.9) !important;
      }
      .ai-tour-v12-skip {
        background: rgba(255, 255, 255, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.35) !important;
        color: #f1f5f9 !important;
        font-size: 0.88rem !important;
        font-weight: 800 !important;
        cursor: pointer !important;
        padding: 4px 12px !important;
        border-radius: 20px !important;
        backdrop-filter: blur(8px) !important;
        transition: all 0.2s !important;
      }
      .ai-tour-v12-skip:hover {
        background: rgba(239, 68, 68, 0.4) !important;
        border-color: #ef4444 !important;
        color: #ffffff !important;
      }

      /* Pure Bold Text (High Contrast & Legibility on Dark Backdrop) */
      .ai-tour-v12-title {
        font-size: 1.48rem !important;
        font-weight: 900 !important;
        color: #ffffff !important;
        margin: 0 0 8px 0 !important;
        line-height: 1.25 !important;
        letter-spacing: 0.2px !important;
        text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95), 0 0 25px #000000 !important;
      }
      .ai-tour-v12-desc {
        font-size: 1.04rem !important;
        color: #ffffff !important;
        line-height: 1.55 !important;
        margin: 0 0 16px 0 !important;
        font-weight: 700 !important;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.95), 0 0 20px #000000 !important;
      }

      /* Action Buttons */
      .ai-tour-v12-actions {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }
      .ai-tour-v12-btn-prev {
        background: rgba(255, 255, 255, 0.15) !important;
        color: #ffffff !important;
        border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
        padding: 9px 20px !important;
        border-radius: 30px !important;
        font-weight: 800 !important;
        font-size: 0.92rem !important;
        cursor: pointer !important;
        backdrop-filter: blur(8px) !important;
        transition: all 0.2s !important;
      }

      /* "आगे बढ़ें ➔" BUTTON: SOLID JET BLACK WITH SHARP WHITE BORDER */
      .ai-tour-v12-btn-next {
        background: #000000 !important;
        color: #ffffff !important;
        border: 2px solid #ffffff !important;
        padding: 10px 26px !important;
        border-radius: 30px !important;
        font-weight: 900 !important;
        font-size: 0.98rem !important;
        cursor: pointer !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 12px rgba(255, 255, 255, 0.3) !important;
        transition: all 0.15s !important;
      }
      .ai-tour-v12-btn-next:hover {
        background: #1e293b !important;
        border-color: #ffffff !important;
        transform: scale(1.04) !important;
      }

      /* 4. INDEPENDENT ANCHORED ARROW POINTER (Positions DIRECTLY on the Target) */
      #ai-tour-anchored-arrow {
        position: fixed !important;
        pointer-events: none !important;
        z-index: 999997 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        filter: drop-shadow(0 0 10px #ffffff) drop-shadow(0 2px 6px rgba(0,0,0,0.95)) !important;
        opacity: 0;
        transition: opacity 0.15s ease !important;
      }
      #ai-tour-anchored-arrow.active {
        opacity: 1 !important;
      }
      #ai-tour-anchored-arrow svg {
        width: 44px;
        height: 44px;
        stroke: #ffffff;
        stroke-width: 4.8;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Directional Animations */
      .ai-arrow-anim-right {
        animation: aiAnimRight 0.85s infinite alternate ease-in-out !important;
      }
      @keyframes aiAnimRight {
        0% { transform: translateX(0px); }
        100% { transform: translateX(10px); }
      }

      .ai-arrow-anim-left {
        animation: aiAnimLeft 0.85s infinite alternate ease-in-out !important;
      }
      @keyframes aiAnimLeft {
        0% { transform: translateX(0px); }
        100% { transform: translateX(-10px); }
      }

      .ai-arrow-anim-up {
        animation: aiAnimUp 0.85s infinite alternate ease-in-out !important;
      }
      @keyframes aiAnimUp {
        0% { transform: translateY(0px); }
        100% { transform: translateY(-10px); }
      }

      .ai-arrow-anim-down {
        animation: aiAnimDown 0.85s infinite alternate ease-in-out !important;
      }
      @keyframes aiAnimDown {
        0% { transform: translateY(0px); }
        100% { transform: translateY(10px); }
      }
    `;
    document.head.appendChild(style);
  }

  function positionTourAndArrow(targetEl, preferredArrow, maxCutW, maxCutH) {
    if (!tourContainer || !spotlightFrame || !targetArrowEl || !backdropEl) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const pad = 6;
    const margin = 16;

    try {
      if (targetEl && targetEl !== document.body) {
        const rawRect = targetEl.getBoundingClientRect();

        if (rawRect && (rawRect.width > 0 || rawRect.height > 0)) {
          // Clamp cutout dimensions so large sections (like E-Books Shelf) don't eat the whole screen blur!
          const targetW = maxCutW ? Math.min(rawRect.width, maxCutW) : rawRect.width;
          const targetH = maxCutH ? Math.min(rawRect.height, maxCutH) : rawRect.height;
          
          const centerX = rawRect.left + (rawRect.width / 2);
          const centerY = rawRect.top + (rawRect.height / 2);

          const holeL = Math.max(0, Math.round(centerX - (targetW / 2) - pad));
          const holeT = Math.max(0, Math.round(centerY - (targetH / 2) - pad));
          const holeR = Math.min(winW, Math.round(centerX + (targetW / 2) + pad));
          const holeB = Math.min(winH, Math.round(centerY + (targetH / 2) + pad));

          // 1. PHYSICAL CUTOUT HOLE IN DARK BLUR BACKDROP (Preserves 100% blur around it)
          const clipPoly = `polygon(0px 0px, 0px ${winH}px, ${holeL}px ${winH}px, ${holeL}px ${holeT}px, ${holeR}px ${holeT}px, ${holeR}px ${holeB}px, ${holeL}px ${holeB}px, ${holeL}px ${winH}px, ${winW}px ${winH}px, ${winW}px 0px)`;
          backdropEl.style.clipPath = clipPoly;
          backdropEl.style.webkitClipPath = clipPoly;

          // 2. Spotlight Frame directly around the cutout hole
          spotlightFrame.style.width = `${Math.round(holeR - holeL)}px`;
          spotlightFrame.style.height = `${Math.round(holeB - holeT)}px`;
          spotlightFrame.style.left = `${Math.round(holeL)}px`;
          spotlightFrame.style.top = `${Math.round(holeT)}px`;
          spotlightFrame.classList.add('active');

          const containerW = Math.min(360, winW - 32);
          tourContainer.style.width = `${containerW}px`;

          let textLeft = margin;
          let textTop = winH / 2 - 80;
          let arrowX = 0;
          let arrowY = 0;
          let arrowDir = preferredArrow || 'DOWN';

          // CASE A: Right Dock Buttons (Gift Box, Tube, Share, Install App)
          if (arrowDir === 'RIGHT' || rawRect.right > winW * 0.72) {
            arrowDir = 'RIGHT';
            arrowX = holeL - 46;
            arrowY = holeT + ((holeB - holeT) / 2) - 22;

            textLeft = Math.max(margin, holeL - containerW - 55);
            textTop = Math.max(70, Math.min(winH - 260, holeT - 60));
          }
          // CASE B: Left Element (Sakhi Floating Avatar Coin)
          else if (arrowDir === 'LEFT' || rawRect.left < winW * 0.30) {
            arrowDir = 'LEFT';
            arrowX = holeR + 8;
            arrowY = holeT + ((holeB - holeT) / 2) - 22;

            textLeft = Math.min(winW - containerW - margin, holeR + 58);
            textTop = Math.max(70, Math.min(winH - 260, holeT - 40));
          }
          // CASE C: Bottom Navigation Tabs (Profile, Health, Netsurf) or Books Shelf
          else if (arrowDir === 'DOWN' || rawRect.top > winH * 0.55) {
            arrowDir = 'DOWN';
            arrowX = holeL + ((holeR - holeL) / 2) - 22;
            arrowY = holeT - 48;

            textLeft = Math.max(margin, Math.min(winW - containerW - margin, holeL + ((holeR - holeL) / 2) - (containerW / 2)));
            textTop = Math.max(60, Math.min(winH - 320, holeT - 230));
          }
          // CASE D: Top Header Elements (Welcome Brand Logo, Menu Button)
          else if (arrowDir === 'UP' || rawRect.bottom < winH * 0.35) {
            arrowDir = 'UP';
            arrowX = holeL + ((holeR - holeL) / 2) - 22;
            arrowY = holeB + 8;

            textLeft = Math.max(margin, Math.min(winW - containerW - margin, holeL + ((holeR - holeL) / 2) - (containerW / 2)));
            textTop = Math.min(winH - 240, holeB + 55);
          }

          // Apply Tour Text Position
          tourContainer.style.left = `${Math.round(textLeft)}px`;
          tourContainer.style.top = `${Math.round(textTop)}px`;
          tourContainer.style.transform = 'none';

          // Apply Anchored Arrow Position
          targetArrowEl.style.left = `${Math.round(arrowX)}px`;
          targetArrowEl.style.top = `${Math.round(arrowY)}px`;
          targetArrowEl.className = `ai-arrow-anim-${arrowDir.toLowerCase()} active`;

          let svgContent = '';
          if (arrowDir === 'RIGHT') svgContent = '<svg viewBox="0 0 48 48"><path d="M6 24H38M38 24L26 12M38 24L26 36"/></svg>';
          else if (arrowDir === 'LEFT') svgContent = '<svg viewBox="0 0 48 48"><path d="M42 24H10M10 24L22 12M10 24L22 36"/></svg>';
          else if (arrowDir === 'UP') svgContent = '<svg viewBox="0 0 48 48"><path d="M24 42V10M24 10L12 22M24 10L36 22"/></svg>';
          else if (arrowDir === 'DOWN') svgContent = '<svg viewBox="0 0 48 48"><path d="M24 6V38M24 38L12 26M24 38L36 26"/></svg>';

          targetArrowEl.innerHTML = svgContent;
          return;
        }
      }

      // Default Center Fallback (Tour Complete)
      backdropEl.style.clipPath = 'none';
      backdropEl.style.webkitClipPath = 'none';

      spotlightFrame.classList.remove('active');
      spotlightFrame.style.width = '0px';
      spotlightFrame.style.height = '0px';

      targetArrowEl.classList.remove('active');
      targetArrowEl.innerHTML = '';

      tourContainer.style.width = `${Math.min(380, winW - 32)}px`;
      tourContainer.style.left = '50%';
      tourContainer.style.top = '50%';
      tourContainer.style.transform = 'translate(-50%, -50%)';
    } catch (_) {
      if (tourContainer) {
        tourContainer.style.left = '50%';
        tourContainer.style.top = '50%';
        tourContainer.style.transform = 'translate(-50%, -50%)';
      }
    }
  }

  function getStepTargetEl(step) {
    if (!step || !step.target) return null;
    const selectors = step.target.split(',');
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel.trim());
        if (el) return el;
      } catch (_) {}
    }
    return null;
  }

  function renderStep(index) {
    if (index < 0 || index >= tourSteps.length) {
      window.endUniversalWalkthrough();
      return;
    }
    currentStepIndex = index;
    const step = tourSteps[index];

    const targetEl = getStepTargetEl(step);

    // If target is in page body (not fixed) and outside view, scroll smoothly once
    if (targetEl && !step.isFixed) {
      try {
        const r = targetEl.getBoundingClientRect();
        if (r.top < 80 || r.bottom > window.innerHeight - 80) {
          targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      } catch (_) {}
    }

    const isLast = (index === tourSteps.length - 1);

    // Pure Text Layout (ABSOLUTELY NO BOX CONTAINER)
    tourContainer.innerHTML = `
      <div class="ai-tour-v12-hdr">
        <span class="ai-tour-v12-badge">${step.badge}</span>
        <button type="button" class="ai-tour-v12-skip" onclick="window.endUniversalWalkthrough()">छोड़ें ✕</button>
      </div>
      <h2 class="ai-tour-v12-title">${step.title}</h2>
      <p class="ai-tour-v12-desc">${step.desc}</p>
      <div class="ai-tour-v12-actions">
        ${index > 0 ? `<button type="button" class="ai-tour-v12-btn-prev" onclick="window.prevUniversalWalkthrough()">❮ पीछे</button>` : ''}
        <button type="button" class="ai-tour-v12-btn-next" onclick="${isLast ? 'window.endUniversalWalkthrough()' : 'window.nextUniversalWalkthrough()'}">
          ${isLast ? 'शुरू करें 🎉' : 'आगे बढ़ें ➔'}
        </button>
      </div>
    `;

    positionTourAndArrow(targetEl, step.arrow, step.maxWidth, step.maxHeight);
    tourContainer.classList.add('active');
  }

  function onViewportScrollOrResize() {
    if (!isTourActive) return;
    if (rafScrollId) cancelAnimationFrame(rafScrollId);
    rafScrollId = requestAnimationFrame(() => {
      const step = tourSteps[currentStepIndex];
      if (!step) return;
      const targetEl = getStepTargetEl(step);
      positionTourAndArrow(targetEl, step.arrow, step.maxWidth, step.maxHeight);
    });
  }

  window.startUniversalWalkthrough = function (force = false) {
    if (isLandingPage()) return;
    if (!force && localStorage.getItem(TOUR_STORAGE_KEY)) return;

    injectTourStyles();
    isTourActive = true;
    document.body.classList.add('ai-tour-in-progress');

    // 1. SOLID 100% Dark Blur Backdrop with Cutout Hole
    if (!backdropEl) {
      backdropEl = document.createElement('div');
      backdropEl.id = 'ai-tour-dark-backdrop';
      backdropEl.addEventListener('click', function (e) {
        if (e.target === backdropEl) {
          window.nextUniversalWalkthrough();
        }
      });
      document.body.appendChild(backdropEl);
    }

    // 2. Spotlight Cutout Frame (Border only, 100% Transparent inside)
    if (!spotlightFrame) {
      spotlightFrame = document.createElement('div');
      spotlightFrame.id = 'ai-tour-spotlight-frame';
      document.body.appendChild(spotlightFrame);
    }

    // 3. Anchored Arrow Element (Positions right on the target!)
    if (!targetArrowEl) {
      targetArrowEl = document.createElement('div');
      targetArrowEl.id = 'ai-tour-anchored-arrow';
      document.body.appendChild(targetArrowEl);
    }

    // 4. Floating Pure Text View (No Box)
    if (!tourContainer) {
      tourContainer = document.createElement('div');
      tourContainer.id = 'ai-tour-floating-view';
      document.body.appendChild(tourContainer);
    }

    // 60FPS RAF Throttled Viewport Handler (Zero Lag, Zero Freezing)
    window.addEventListener('scroll', onViewportScrollOrResize, { passive: true });
    window.addEventListener('resize', onViewportScrollOrResize, { passive: true });

    renderStep(0);
  };

  window.nextUniversalWalkthrough = function () {
    renderStep(currentStepIndex + 1);
  };

  window.prevUniversalWalkthrough = function () {
    renderStep(currentStepIndex - 1);
  };

  window.endUniversalWalkthrough = function () {
    isTourActive = false;
    document.body.classList.remove('ai-tour-in-progress');
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (_) {}

    window.removeEventListener('scroll', onViewportScrollOrResize);
    window.removeEventListener('resize', onViewportScrollOrResize);

    if (rafScrollId) cancelAnimationFrame(rafScrollId);

    if (tourContainer) {
      tourContainer.classList.remove('active');
      setTimeout(() => {
        if (tourContainer) tourContainer.remove();
        tourContainer = null;
      }, 100);
    }

    if (targetArrowEl) {
      targetArrowEl.classList.remove('active');
      setTimeout(() => {
        if (targetArrowEl) targetArrowEl.remove();
        targetArrowEl = null;
      }, 100);
    }

    if (spotlightFrame) {
      spotlightFrame.classList.remove('active');
      setTimeout(() => {
        if (spotlightFrame) spotlightFrame.remove();
        spotlightFrame = null;
      }, 100);
    }

    if (backdropEl) {
      backdropEl.remove();
      backdropEl = null;
    }
  };

  // Auto start on first visit
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => window.startUniversalWalkthrough(false), 1400);
    });
  } else {
    setTimeout(() => window.startUniversalWalkthrough(false), 1400);
  }


})();
