/**
 * ====================================================================
 * AAROGYAM INDIA - BUTTER-SMOOTH IMAGE POPUP VIEWER (TAP ANYWHERE TO CLOSE)
 * Version: 2026.2.0 (Zero Frustration, Instant Return to Page)
 * ====================================================================
 * Displays images in an elegant, elevated card with smooth pop-in animation.
 * Tapping or clicking ANYWHERE on the screen immediately returns to the page.
 * No complex pinch-zoom or trapped states.
 * ====================================================================
 */

(function () {
  'use strict';

  // Inject Styles for Simple Lightbox
  const styleId = 'aarogyam-lightbox-styles';
  let existingStyle = document.getElementById(styleId);
  if (existingStyle) existingStyle.remove();

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .ai-lightbox-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(10, 15, 28, 0.92);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.24s ease;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      padding: 16px;
      box-sizing: border-box;
    }
    .ai-lightbox-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    /* Floating Close Instruction Pill */
    .ai-lightbox-top-pill {
      position: absolute;
      top: 20px;
      background: rgba(239, 68, 68, 0.92);
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 800;
      padding: 8px 18px;
      border-radius: 30px;
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 12px rgba(239, 68, 68, 0.5);
      letter-spacing: 0.3px;
      font-family: 'Outfit', sans-serif;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10;
      animation: aiPulsePill 2s infinite ease-in-out;
    }
    @keyframes aiPulsePill {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.04); }
    }

    /* Elevated Image Card */
    .ai-lightbox-card {
      position: relative;
      max-width: 92vw;
      max-height: 82vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 30px 70px -10px rgba(0, 0, 0, 0.8), 0 0 0 1.5px rgba(255, 255, 255, 0.25);
      transform: scale(0.92);
      transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .ai-lightbox-overlay.active .ai-lightbox-card {
      transform: scale(1);
    }

    .ai-lightbox-img {
      max-width: 90vw;
      max-height: 72vh;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
      background: #f8fafc;
      border-radius: 20px 20px 0 0;
    }

    /* Card Footer Caption */
    .ai-lightbox-caption-box {
      width: 100%;
      background: #ffffff;
      padding: 12px 18px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      box-sizing: border-box;
    }
    .ai-lightbox-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .ai-lightbox-sub {
      font-size: 0.78rem;
      color: #64748b;
      margin: 0;
      font-weight: 600;
    }

    /* Clickable Indicator on Web Images */
    img.ai-zoomable-img {
      cursor: pointer !important;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    img.ai-zoomable-img:active {
      transform: scale(0.98) !important;
    }

    @media (max-width: 640px) {
      .ai-lightbox-top-pill {
        top: 14px;
        font-size: 0.74rem;
        padding: 6px 14px;
      }
      .ai-lightbox-card {
        max-width: 95vw;
        max-height: 85vh;
        border-radius: 16px;
      }
      .ai-lightbox-img {
        max-width: 95vw;
        max-height: 68vh;
      }
      .ai-lightbox-caption-box {
        padding: 10px 14px;
      }
      .ai-lightbox-title {
        font-size: 0.9rem;
      }
    }
  `;
  document.head.appendChild(style);

  let overlayEl = null;
  let cardEl = null;
  let imgEl = null;
  let titleEl = null;
  let subEl = null;

  function createLightboxDOM() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.className = 'ai-lightbox-overlay';
    overlayEl.title = 'स्क्रीन पर कहीं भी टैप करें और वापस जाएं';
    overlayEl.innerHTML = `
      <div class="ai-lightbox-top-pill">
        <span>✖ कहीं भी टैप करें और वापस जाएं (Close)</span>
      </div>
      <div class="ai-lightbox-card" id="ai-lb-card">
        <img class="ai-lightbox-img" id="ai-lb-img" src="" alt="Aarogyam India" />
        <div class="ai-lightbox-caption-box">
          <div class="ai-lightbox-title" id="ai-lb-title"></div>
          <div class="ai-lightbox-sub" id="ai-lb-sub">Aarogyam India • सुरक्षित व प्राकृतिक समाधान</div>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);

    cardEl = document.getElementById('ai-lb-card');
    imgEl = document.getElementById('ai-lb-img');
    titleEl = document.getElementById('ai-lb-title');
    subEl = document.getElementById('ai-lb-sub');

    // CRITICAL: Tap ANYWHERE on the screen (overlay, card, image, text) instantly closes and returns!
    overlayEl.addEventListener('click', () => {
      closeLightbox();
    });

    // Mobile touch tap anywhere closes immediately
    overlayEl.addEventListener('touchend', (e) => {
      e.preventDefault();
      closeLightbox();
    });

    // Keyboard Escape key closes
    window.addEventListener('keydown', (e) => {
      if (overlayEl.classList.contains('active') && (e.key === 'Escape' || e.key === 'Backspace')) {
        closeLightbox();
      }
    });
  }

  function openLightbox(src, titleText, captionText) {
    createLightboxDOM();
    if (!src) return;

    imgEl.src = src;
    titleEl.textContent = titleText || 'आरोग्यम इंडिया फ़ोटो';
    if (captionText) {
      subEl.textContent = captionText;
    } else {
      subEl.textContent = 'स्क्रीन पर कहीं भी टैप कर वापस जाएं';
    }

    overlayEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!overlayEl) return;
    overlayEl.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (imgEl) imgEl.src = '';
    }, 200);
  }

  // Bind zoom on all images
  function bindZoomableImages() {
    const images = document.querySelectorAll(`
      .landscape-hero-banner-img,
      .home-hero-slide-item img,
      .home-hero-full-banner-wrap img,
      .health-disease-card img,
      .home-disease-card img,
      .kpi-card img,
      .pe-kpi-card img,
      .pashu-card img,
      .product-card img,
      .ns-product-card img,
      .doctor-consult-img,
      .remedy-diagram-img,
      section:not(#header) img:not([src*="logo"]):not([src*="fevicon"]):not([src*="icon"]):not(.header-brand-wrap img)
    `);

    images.forEach(img => {
      if (img.dataset.aiZoomBound) return;
      img.dataset.aiZoomBound = '1';
      img.classList.add('ai-zoomable-img');

      img.addEventListener('click', (e) => {
        const parentLink = img.closest('a');
        if (parentLink) {
          const href = parentLink.getAttribute('href') || '';
          if (href === '#' || href.startsWith('#sec-') || href === 'javascript:void(0)') {
            e.preventDefault();
          }
        }

        const src = img.currentSrc || img.src;
        if (!src) return;

        const parentCard = img.closest('.health-disease-card, .home-disease-card, .kpi-card, .product-card, .pashu-card, .home-hero-slide-item') || img.parentElement;
        const headingEl = parentCard ? parentCard.querySelector('h1, h2, h3, h4, .title, .name') : null;
        const headingText = headingEl ? headingEl.textContent.trim() : (img.alt || img.title || 'Aarogyam India');
        const descEl = parentCard ? parentCard.querySelector('p, .desc, .subtitle') : null;
        const captionText = descEl ? descEl.textContent.trim() : '';

        openLightbox(src, headingText, captionText);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindZoomableImages);
  } else {
    bindZoomableImages();
  }

  const observer = new MutationObserver(bindZoomableImages);
  observer.observe(document.body, { childList: true, subtree: true });

  window.AarogyamLightbox = {
    open: openLightbox,
    close: closeLightbox,
    rebind: bindZoomableImages
  };

})();
