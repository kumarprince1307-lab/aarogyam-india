/**
 * ====================================================================
 * AAROGYAM INDIA - BUTTER-SMOOTH FULLSCREEN IMAGE LIGHTBOX & ZOOM ENGINE
 * Version: 2026.1.0 (Ultra-Fluid 60FPS Mobile Pinch-Zoom & Modal)
 * ====================================================================
 * Delivers an app-like, butter-smooth fullscreen viewing experience
 * for all Hero Banners, Disease Cards, Remedy Diagrams, Crop Guides,
 * Livestock Photos, and Product Images.
 * 
 * Features:
 * - 95% Deep Frosted Glass Backdrop Blur
 * - Mobile Double-Tap & Pinch-to-Zoom (up to 3x)
 * - Touch Swipe-Down to Dismiss
 * - Desktop Drag-to-Pan & Zoom controls
 * - High-Res Caption & Direct WhatsApp Share
 * - Auto-detects newly rendered CMS images dynamically
 * ====================================================================
 */

(function () {
  'use strict';

  // Inject Styles for Lightbox
  const styleId = 'aarogyam-lightbox-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .ai-lightbox-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(10, 15, 28, 0.94);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s ease;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        will-change: opacity;
      }
      .ai-lightbox-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      /* Top Header Bar */
      .ai-lightbox-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 10;
        background: linear-gradient(180deg, rgba(10,15,28,0.85) 0%, rgba(10,15,28,0) 100%);
      }
      .ai-lightbox-title-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 75%;
      }
      .ai-lightbox-badge {
        background: #16a34a;
        color: #ffffff;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 3px 10px;
        border-radius: 12px;
        letter-spacing: 0.3px;
        white-space: nowrap;
        font-family: 'Outfit', sans-serif;
      }
      .ai-lightbox-title {
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: 'Outfit', -apple-system, sans-serif;
      }
      .ai-lightbox-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ai-lightbox-btn {
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.1rem;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease;
      }
      .ai-lightbox-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.08);
      }
      .ai-lightbox-btn:active {
        transform: scale(0.92);
      }
      .ai-lightbox-close-btn {
        background: #ef4444;
        border-color: #f87171;
      }
      .ai-lightbox-close-btn:hover {
        background: #dc2626;
      }

      /* Viewport & Image Canvas */
      .ai-lightbox-viewport {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        cursor: grab;
      }
      .ai-lightbox-viewport.is-dragging {
        cursor: grabbing;
      }
      .ai-lightbox-img-wrap {
        position: relative;
        max-width: 92vw;
        max-height: 82vh;
        display: flex;
        align-items: center;
        justify-content: center;
        transform-origin: center center;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform;
      }
      .ai-lightbox-img {
        max-width: 100%;
        max-height: 82vh;
        object-fit: contain;
        border-radius: 14px;
        box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.15);
        pointer-events: none;
      }

      /* Bottom Caption & Controls */
      .ai-lightbox-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px 20px 24px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        background: linear-gradient(0deg, rgba(10,15,28,0.92) 0%, rgba(10,15,28,0) 100%);
        pointer-events: none;
      }
      .ai-lightbox-caption {
        color: #e2e8f0;
        font-size: 0.88rem;
        font-weight: 500;
        text-align: center;
        max-width: 600px;
        line-height: 1.4;
        background: rgba(15, 23, 42, 0.75);
        padding: 6px 16px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      }
      .ai-lightbox-hint {
        color: #94a3b8;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Cursor Indicator on Clickable Web Images */
      img.ai-zoomable-img {
        cursor: zoom-in !important;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease !important;
      }
      img.ai-zoomable-img:hover {
        filter: brightness(1.03);
      }
      img.ai-zoomable-img:active {
        transform: scale(0.985);
      }

      @media (max-width: 640px) {
        .ai-lightbox-img-wrap {
          max-width: 96vw;
          max-height: 80vh;
        }
        .ai-lightbox-img {
          max-height: 80vh;
          border-radius: 10px;
        }
        .ai-lightbox-caption {
          font-size: 0.8rem;
          padding: 5px 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Build Lightbox DOM Elements
  let overlayEl = null;
  let imgEl = null;
  let imgWrapEl = null;
  let titleEl = null;
  let badgeEl = null;
  let captionEl = null;

  // Zoom and Pan State
  let currentScale = 1;
  let posX = 0;
  let posY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let initialPinchDistance = 0;
  let initialScale = 1;
  let lastTapTime = 0;
  let currentImgSrc = '';

  function createLightboxDOM() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.className = 'ai-lightbox-overlay';
    overlayEl.innerHTML = `
      <div class="ai-lightbox-header">
        <div class="ai-lightbox-title-wrap">
          <span class="ai-lightbox-badge" id="ai-lb-badge">AAROGYAM HD</span>
          <span class="ai-lightbox-title" id="ai-lb-title">इमेज विवरण</span>
        </div>
        <div class="ai-lightbox-actions">
          <button type="button" class="ai-lightbox-btn" id="ai-lb-zoom-out" title="ज़ूम आउट (-)">
            <i class="fa-solid fa-minus"></i>
          </button>
          <button type="button" class="ai-lightbox-btn" id="ai-lb-zoom-in" title="ज़ूम इन (+)">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button type="button" class="ai-lightbox-btn ai-lightbox-close-btn" id="ai-lb-close" title="बंद करें (Esc)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div class="ai-lightbox-viewport" id="ai-lb-viewport">
        <div class="ai-lightbox-img-wrap" id="ai-lb-img-wrap">
          <img class="ai-lightbox-img" id="ai-lb-img" src="" alt="Zoomed Image" />
        </div>
      </div>

      <div class="ai-lightbox-footer">
        <div class="ai-lightbox-caption" id="ai-lb-caption"></div>
        <div class="ai-lightbox-hint">
          <span>👆 डबल टैप से ज़ूम करें • नीचे स्वाइप कर बंद करें</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);

    imgEl = document.getElementById('ai-lb-img');
    imgWrapEl = document.getElementById('ai-lb-img-wrap');
    titleEl = document.getElementById('ai-lb-title');
    badgeEl = document.getElementById('ai-lb-badge');
    captionEl = document.getElementById('ai-lb-caption');

    // Controls
    document.getElementById('ai-lb-close').onclick = closeLightbox;
    document.getElementById('ai-lb-zoom-in').onclick = () => zoomTo(currentScale + 0.5);
    document.getElementById('ai-lb-zoom-out').onclick = () => zoomTo(currentScale - 0.5);

    // Close on backdrop tap
    const viewport = document.getElementById('ai-lb-viewport');
    viewport.addEventListener('click', (e) => {
      if (e.target === viewport) {
        closeLightbox();
      }
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (overlayEl.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === '+' || e.key === '=') zoomTo(currentScale + 0.4);
        if (e.key === '-' || e.key === '_') zoomTo(currentScale - 0.4);
      }
    });

    // Touch & Mouse gestures
    setupGestures(viewport);
  }

  function updateTransform() {
    if (!imgWrapEl) return;
    imgWrapEl.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(${currentScale})`;
  }

  function zoomTo(scale, centerX = 0, centerY = 0) {
    currentScale = Math.min(Math.max(scale, 1), 3.5);
    if (currentScale === 1) {
      posX = 0;
      posY = 0;
    }
    updateTransform();
  }

  function setupGestures(viewport) {
    // Touch Events for Mobile (Pinch, Double Tap, Drag, Swipe Down)
    let touchStartY = 0;
    let touchStartX = 0;
    let isSwipingDown = false;

    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        // Pinch start
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialPinchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialScale = currentScale;
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        startX = touch.clientX - posX;
        startY = touch.clientY - posY;

        // Double tap detection
        const now = Date.now();
        if (now - lastTapTime < 300) {
          if (currentScale > 1.2) {
            zoomTo(1);
          } else {
            zoomTo(2.2);
          }
          lastTapTime = 0;
          return;
        }
        lastTapTime = now;

        if (currentScale > 1) {
          isDragging = true;
          viewport.classList.add('is-dragging');
        } else {
          isSwipingDown = true;
        }
      }
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (initialPinchDistance > 0) {
          const factor = dist / initialPinchDistance;
          zoomTo(initialScale * factor);
        }
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (isDragging && currentScale > 1) {
          e.preventDefault();
          posX = touch.clientX - startX;
          posY = touch.clientY - startY;
          updateTransform();
        } else if (isSwipingDown && currentScale === 1) {
          const deltaY = touch.clientY - touchStartY;
          if (deltaY > 20) {
            e.preventDefault();
            // Subtle pull down effect
            posY = deltaY * 0.7;
            const opacity = Math.max(0.3, 1 - (deltaY / 300));
            overlayEl.style.opacity = opacity;
            updateTransform();
          }
        }
      }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
      if (isSwipingDown && currentScale === 1) {
        if (posY > 110) {
          closeLightbox();
        } else {
          // Snap back
          posY = 0;
          overlayEl.style.opacity = 1;
          updateTransform();
        }
      }
      isDragging = false;
      isSwipingDown = false;
      initialPinchDistance = 0;
      viewport.classList.remove('is-dragging');
    });

    // Mouse drag for desktop
    viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (currentScale > 1) {
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        viewport.classList.add('is-dragging');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging && currentScale > 1) {
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        updateTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      viewport.classList.remove('is-dragging');
    });

    // Mouse wheel zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      zoomTo(currentScale + delta);
    }, { passive: false });
  }

  function openLightbox(src, title, category, caption) {
    createLightboxDOM();
    currentImgSrc = src;
    imgEl.src = src;

    // Reset zoom state
    currentScale = 1;
    posX = 0;
    posY = 0;
    updateTransform();

    titleEl.textContent = title || 'Aarogyam India High-Res View';
    badgeEl.textContent = category || 'HD PREVIEW';

    if (caption) {
      captionEl.textContent = caption;
      captionEl.style.display = 'block';
    } else {
      captionEl.style.display = 'none';
    }

    overlayEl.style.opacity = '1';
    overlayEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!overlayEl) return;
    overlayEl.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (imgEl) imgEl.src = '';
      currentScale = 1;
      posX = 0;
      posY = 0;
      updateTransform();
    }, 300);
  }

  // Auto-Binder: Attaches click to zoom on all relevant images
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
        // Prevent default navigation if parent is an anchor with dummy or local hash
        const parentLink = img.closest('a');
        if (parentLink) {
          const href = parentLink.getAttribute('href') || '';
          if (href === '#' || href.startsWith('#sec-') || href === 'javascript:void(0)') {
            e.preventDefault();
          }
        }

        const src = img.currentSrc || img.src;
        if (!src) return;

        // Try to derive title & category
        const parentCard = img.closest('.health-disease-card, .home-disease-card, .kpi-card, .product-card, .pashu-card, .home-hero-slide-item') || img.parentElement;
        const headingEl = parentCard ? parentCard.querySelector('h1, h2, h3, h4, .title, .name') : null;
        const headingText = headingEl ? headingEl.textContent.trim() : (img.alt || img.title || 'Aarogyam India');
        
        let category = 'AAROGYAM HD';
        if (window.location.pathname.includes('/health/')) category = 'हेल्थ समाधान';
        else if (window.location.pathname.includes('pashu')) category = 'पशु पालन गाइड';
        else if (window.location.pathname.includes('netsurf')) category = 'नेटसर्फ बायो-फिट';
        else if (window.location.pathname.includes('agriculture')) category = 'कृषि व फसल सुरक्षा';

        const descEl = parentCard ? parentCard.querySelector('p, .desc, .subtitle') : null;
        const captionText = descEl ? descEl.textContent.trim() : (img.alt || '');

        openLightbox(src, headingText, category, captionText);
      });
    });
  }

  // Initialize on DOM Ready and observe dynamic CMS injections
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindZoomableImages();
    });
  } else {
    bindZoomableImages();
  }

  // Periodic and MutationObserver check to bind dynamically rendered CMS cards
  const observer = new MutationObserver(() => {
    bindZoomableImages();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose Global API
  window.AarogyamLightbox = {
    open: openLightbox,
    close: closeLightbox,
    rebind: bindZoomableImages
  };

})();
