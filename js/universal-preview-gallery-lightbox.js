/**
 * Aarogyam India - Universal Preview Gallery & Lightbox Slider Engine
 * -------------------------------------------------------------------
 * Features:
 * - Desktop: Sleek Left/Right Navigation Arrows + Keyboard Arrow Keys (Left/Right/Esc).
 * - Mobile: High-performance Touch Screen Slider / Swipe Left-Right gesture.
 * - Interactive Pinch-to-Zoom (2-finger) + Double-Tap Zoom + Mouse Wheel Zoom.
 * - Zoom Pan: Smooth 2D panning when image is zoomed in.
 * - Page Counter Badge ("पेज 2 / 5") + Bottom Dots Indicator Strip.
 * - Fully decoupled & safe: Works on book-landing.html, BK001, BK002, and all demo pages.
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window._UniversalPreviewLightboxLoaded) return;
  window._UniversalPreviewLightboxLoaded = true;

  let galleryImages = [];
  let currentIndex = 0;
  let currentZoom = 1;
  let panX = 0;
  let panY = 0;

  // Touch tracking for mobile swipe & pinch
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchCurrentX = 0;
  let isSwiping = false;
  let isPinching = false;
  let initialPinchDistance = 0;
  let lastTapTime = 0;

  // DOM Elements cache
  let modalEl = null;
  let imgEl = null;
  let prevArrowEl = null;
  let nextArrowEl = null;
  let counterEl = null;
  let zoomTextEl = null;
  let dotsContainerEl = null;
  let viewportEl = null;

  // Inject Dedicated Styles
  function injectStyles() {
    if (document.getElementById('ubl-universal-lightbox-styles')) return;
    const style = document.createElement('style');
    style.id = 'ubl-universal-lightbox-styles';
    style.textContent = `
      .ubl-univ-modal {
        position: fixed;
        inset: 0;
        background: rgba(10, 15, 29, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 999999;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
      }
      .ubl-univ-toolbar {
        position: absolute;
        top: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(30, 41, 59, 0.85);
        padding: 6px 14px;
        border-radius: 30px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 1000002;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }
      .ubl-univ-btn {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        font-size: 1.1rem;
        font-weight: 900;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .ubl-univ-btn:hover {
        background: #16a34a;
        transform: scale(1.08);
      }
      .ubl-univ-btn-close {
        background: #dc2626 !important;
        font-size: 1.3rem;
      }
      .ubl-univ-btn-close:hover {
        background: #b91c1c !important;
      }
      .ubl-univ-counter-badge {
        background: rgba(15, 23, 42, 0.9);
        color: #fef08a;
        border: 1px solid rgba(245, 158, 11, 0.4);
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
      .ubl-univ-viewport {
        position: relative;
        width: 100vw;
        height: calc(100vh - 120px);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .ubl-univ-img-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        will-change: transform;
      }
      .ubl-univ-img {
        max-width: 90vw;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.8);
        transition: transform 0.15s ease-out;
        will-change: transform;
        pointer-events: auto;
      }
      .ubl-univ-img.sliding-next {
        animation: ublSlideInFromRight 0.28s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
      }
      .ubl-univ-img.sliding-prev {
        animation: ublSlideInFromLeft 0.28s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
      }
      @keyframes ublSlideInFromRight {
        0% { transform: translateX(80px) scale(0.95); opacity: 0.3; }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes ublSlideInFromLeft {
        0% { transform: translateX(-80px) scale(0.95); opacity: 0.3; }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      /* Desktop Navigation Arrows */
      .ubl-univ-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 52px;
        height: 52px;
        background: rgba(30, 41, 59, 0.85);
        color: #ffffff;
        border: 1.5px solid rgba(255, 255, 255, 0.25);
        border-radius: 50%;
        font-size: 26px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000002;
        transition: all 0.25s ease;
        box-shadow: 0 10px 25px rgba(0,0,0,0.6);
      }
      .ubl-univ-arrow:hover {
        background: #16a34a;
        border-color: #22c55e;
        transform: translateY(-50%) scale(1.12);
        box-shadow: 0 0 20px rgba(22, 163, 74, 0.6);
      }
      .ubl-univ-arrow-prev {
        left: 20px;
      }
      .ubl-univ-arrow-next {
        right: 20px;
      }
      /* Bottom Dots Strip */
      .ubl-univ-dots {
        position: absolute;
        bottom: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 23, 42, 0.75);
        padding: 6px 14px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        z-index: 1000002;
        max-width: 90vw;
        overflow-x: auto;
      }
      .ubl-univ-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.35);
        cursor: pointer;
        transition: all 0.25s ease;
      }
      .ubl-univ-dot.active {
        background: #22c55e;
        width: 22px;
        border-radius: 10px;
        box-shadow: 0 0 8px #22c55e;
      }
      /* Mobile Swipe Helper Hint */
      .ubl-univ-swipe-hint {
        position: absolute;
        bottom: 46px;
        font-size: 0.75rem;
        color: #94a3b8;
        pointer-events: none;
        z-index: 1000001;
        letter-spacing: 0.3px;
      }
      @media (max-width: 768px) {
        .ubl-univ-arrow {
          width: 42px;
          height: 42px;
          font-size: 20px;
          background: rgba(15, 23, 42, 0.75);
        }
        .ubl-univ-arrow-prev { left: 8px; }
        .ubl-univ-arrow-next { right: 8px; }
        .ubl-univ-img { max-width: 94vw; max-height: 75vh; }
      }
    `;
    document.head.appendChild(style);
  }

  // Create or reuse DOM Modal
  function createModalDOM() {
    let existing = document.getElementById('ubl-universal-lightbox-layer');
    if (existing) {
      modalEl = existing;
    } else {
      modalEl = document.createElement('div');
      modalEl.id = 'ubl-universal-lightbox-layer';
      modalEl.className = 'ubl-univ-modal';
      modalEl.innerHTML = `
        <div class="ubl-univ-toolbar">
          <button type="button" id="ubl-univ-btn-zoom-out" class="ubl-univ-btn" title="Zoom Out">&minus;</button>
          <span id="ubl-univ-zoom-text" style="color:#ffffff;font-family:monospace;font-weight:800;font-size:0.85rem;min-width:44px;text-align:center;">100%</span>
          <button type="button" id="ubl-univ-btn-zoom-in" class="ubl-univ-btn" title="Zoom In">+</button>
          <button type="button" id="ubl-univ-btn-zoom-reset" class="ubl-univ-btn" title="Reset Zoom">↺</button>
          <span id="ubl-univ-counter" class="ubl-univ-counter-badge">1 / 1</span>
          <button type="button" id="ubl-univ-btn-close" class="ubl-univ-btn ubl-univ-btn-close" title="Close Lightbox">&times;</button>
        </div>

        <!-- Left Navigation Arrow (Desktop & Tablet) -->
        <button type="button" id="ubl-univ-arrow-prev" class="ubl-univ-arrow ubl-univ-arrow-prev" title="Previous Image (←)">&#10094;</button>

        <!-- Main Viewport -->
        <div class="ubl-univ-viewport" id="ubl-univ-viewport">
          <div class="ubl-univ-img-wrapper" id="ubl-univ-img-wrapper">
            <img id="ubl-univ-img" src="" alt="Book Preview" class="ubl-univ-img">
          </div>
        </div>

        <!-- Right Navigation Arrow (Desktop & Tablet) -->
        <button type="button" id="ubl-univ-arrow-next" class="ubl-univ-arrow ubl-univ-arrow-next" title="Next Image (→)">&#10095;</button>

        <!-- Mobile Swipe Hint -->
        <div class="ubl-univ-swipe-hint">👈 Swipe left / right to change page 👉</div>

        <!-- Bottom Dots Indicator -->
        <div class="ubl-univ-dots" id="ubl-univ-dots"></div>
      `;
      document.body.appendChild(modalEl);
    }

    imgEl = document.getElementById('ubl-univ-img');
    prevArrowEl = document.getElementById('ubl-univ-arrow-prev');
    nextArrowEl = document.getElementById('ubl-univ-arrow-next');
    counterEl = document.getElementById('ubl-univ-counter');
    zoomTextEl = document.getElementById('ubl-univ-zoom-text');
    dotsContainerEl = document.getElementById('ubl-univ-dots');
    viewportEl = document.getElementById('ubl-univ-viewport');

    bindEvents();
  }

  // Scan and gather images from active page
  function collectGalleryImages() {
    const images = [];
    const seen = new Set();

    // 1. Check window.activePreviewGalleryList first (set by book landing engine)
    if (Array.isArray(window.activePreviewGalleryList) && window.activePreviewGalleryList.length > 0) {
      window.activePreviewGalleryList.forEach(url => {
        const clean = cleanUrl(url);
        if (clean && !seen.has(clean)) {
          seen.add(clean);
          images.push(clean);
        }
      });
    }

    // 2. Scan DOM preview cards
    const cardSelectors = [
      '#preview-gallery-grid img',
      '.preview-gallery img',
      '.preview-card img',
      '.book-preview-gallery img',
      '.book-preview-card img',
      '#sec-book-preview img',
      '#preview-banner-img'
    ];

    document.querySelectorAll(cardSelectors.join(',')).forEach(img => {
      const src = img.getAttribute('src') || img.src;
      const clean = cleanUrl(src);
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        images.push(clean);
      }
    });

    galleryImages = images;
    renderDots();
  }

  function cleanUrl(url) {
    if (!url) return '';
    let str = String(url).trim();
    if (str.startsWith('data:')) return '';
    return str;
  }

  // Render bottom dots
  function renderDots() {
    if (!dotsContainerEl) return;
    if (galleryImages.length <= 1) {
      dotsContainerEl.style.display = 'none';
      if (prevArrowEl) prevArrowEl.style.display = 'none';
      if (nextArrowEl) nextArrowEl.style.display = 'none';
      return;
    }
    dotsContainerEl.style.display = 'flex';
    if (prevArrowEl) prevArrowEl.style.display = 'flex';
    if (nextArrowEl) nextArrowEl.style.display = 'flex';

    dotsContainerEl.innerHTML = galleryImages.map((_, i) => `
      <span class="ubl-univ-dot ${i === currentIndex ? 'active' : ''}" data-idx="${i}"></span>
    `).join('');

    dotsContainerEl.querySelectorAll('.ubl-univ-dot').forEach(dot => {
      dot.onclick = () => {
        const targetIdx = parseInt(dot.dataset.idx, 10);
        goToIndex(targetIdx);
      };
    });
  }

  // Apply visual transform (zoom + pan)
  function applyTransform(transition = false) {
    if (!imgEl) return;
    imgEl.style.transition = transition ? 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'none';
    imgEl.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    if (zoomTextEl) {
      zoomTextEl.textContent = `${Math.round(currentZoom * 100)}%`;
    }
  }

  // Go to specific index with animation direction
  function goToIndex(idx, direction = 'next') {
    if (galleryImages.length === 0) return;

    if (idx < 0) idx = galleryImages.length - 1;
    if (idx >= galleryImages.length) idx = 0;

    currentIndex = idx;
    currentZoom = 1;
    panX = 0;
    panY = 0;

    if (imgEl) {
      imgEl.className = 'ubl-univ-img';
      void imgEl.offsetWidth; // Trigger reflow for animation restart
      imgEl.className = `ubl-univ-img sliding-${direction}`;
      imgEl.src = galleryImages[currentIndex];
      imgEl.onerror = function() {
        if (typeof window.handleImageError === 'function') {
          window.handleImageError(this);
        }
      };
      applyTransform();
    }

    if (counterEl) {
      counterEl.textContent = `पेज ${currentIndex + 1} / ${galleryImages.length}`;
    }

    renderDots();
  }

  function nextImage() {
    goToIndex(currentIndex + 1, 'next');
  }

  function prevImage() {
    goToIndex(currentIndex - 1, 'prev');
  }

  // Open modal for a specific URL or index
  window.openUniversalGalleryLightbox = function (targetUrlOrIndex, customImageList) {
    injectStyles();
    createModalDOM();

    if (Array.isArray(customImageList) && customImageList.length > 0) {
      galleryImages = customImageList.map(cleanUrl).filter(Boolean);
    } else {
      collectGalleryImages();
    }

    // Determine target index
    let startIdx = 0;
    if (typeof targetUrlOrIndex === 'number') {
      startIdx = targetUrlOrIndex;
    } else if (typeof targetUrlOrIndex === 'string') {
      const cleanTarget = cleanUrl(targetUrlOrIndex);
      const foundIdx = galleryImages.findIndex(u => u.includes(cleanTarget) || cleanTarget.includes(u));
      if (foundIdx !== -1) {
        startIdx = foundIdx;
      } else {
        // Target url was not in list, prepend it
        galleryImages.unshift(cleanTarget);
        startIdx = 0;
      }
    }

    if (modalEl) {
      modalEl.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    goToIndex(startIdx, 'next');
  };

  // Backwards compatibility hook: Replace old openPinchZoomLightbox
  window.openPinchZoomLightbox = function (url) {
    window.openUniversalGalleryLightbox(url);
  };

  function closeModal() {
    if (modalEl) modalEl.style.display = 'none';
    document.body.style.overflow = '';
    currentZoom = 1;
    panX = 0;
    panY = 0;
  }

  // Attach controls & gesture handlers
  function bindEvents() {
    // Buttons
    document.getElementById('ubl-univ-btn-close')?.addEventListener('click', closeModal);
    prevArrowEl?.addEventListener('click', prevImage);
    nextArrowEl?.addEventListener('click', nextImage);

    document.getElementById('ubl-univ-btn-zoom-in')?.addEventListener('click', () => {
      if (currentZoom < 3) { currentZoom += 0.35; applyTransform(true); }
    });
    document.getElementById('ubl-univ-btn-zoom-out')?.addEventListener('click', () => {
      if (currentZoom > 0.6) {
        currentZoom = Math.max(0.6, currentZoom - 0.35);
        if (currentZoom <= 1) { panX = 0; panY = 0; }
        applyTransform(true);
      }
    });
    document.getElementById('ubl-univ-btn-zoom-reset')?.addEventListener('click', () => {
      currentZoom = 1; panX = 0; panY = 0; applyTransform(true);
    });

    // Close on clicking backdrop outside image
    modalEl?.addEventListener('click', (e) => {
      if (e.target === modalEl || e.target === viewportEl) {
        closeModal();
      }
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!modalEl || modalEl.style.display !== 'flex') return;
      if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'Escape') closeModal();
    });

    // Mouse wheel zoom
    imgEl?.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0 && currentZoom < 3.2) {
        currentZoom += 0.2;
      } else if (e.deltaY > 0 && currentZoom > 0.7) {
        currentZoom -= 0.2;
        if (currentZoom <= 1) { panX = 0; panY = 0; }
      }
      applyTransform(false);
    }, { passive: false });

    // Touch events for Mobile Swipe & Pinch-to-Zoom
    const targetArea = viewportEl || imgEl;

    targetArea?.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchCurrentX = t.clientX;
        touchStartTime = Date.now();
        isSwiping = (currentZoom <= 1.05);

        // Double tap detection
        const now = Date.now();
        if (now - lastTapTime < 300) {
          e.preventDefault();
          if (currentZoom > 1.2) {
            currentZoom = 1; panX = 0; panY = 0;
          } else {
            currentZoom = 2.2;
          }
          applyTransform(true);
        }
        lastTapTime = now;

      } else if (e.touches.length === 2) {
        isPinching = true;
        isSwiping = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: false });

    targetArea?.addEventListener('touchmove', (e) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (initialPinchDistance > 0) {
          const ratio = dist / initialPinchDistance;
          currentZoom = Math.min(3.2, Math.max(0.6, currentZoom * ratio));
          initialPinchDistance = dist;
          applyTransform(false);
        }
        return;
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];
        const deltaX = t.clientX - touchStartX;
        const deltaY = t.clientY - touchStartY;
        touchCurrentX = t.clientX;

        if (currentZoom > 1.05) {
          // Pan when zoomed
          e.preventDefault();
          panX += (t.clientX - (touchCurrentX || t.clientX));
          panY += deltaY * 0.2;
          applyTransform(false);
        } else if (isSwiping && Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal interactive drag preview
          e.preventDefault();
          if (imgEl) {
            imgEl.style.transition = 'none';
            imgEl.style.transform = `translateX(${deltaX * 0.75}px) scale(0.98)`;
          }
        }
      }
    }, { passive: false });

    targetArea?.addEventListener('touchend', (e) => {
      if (isPinching) {
        isPinching = false;
        if (currentZoom < 1) { currentZoom = 1; panX = 0; panY = 0; applyTransform(true); }
        return;
      }

      if (isSwiping && currentZoom <= 1.05) {
        const deltaX = touchCurrentX - touchStartX;
        const elapsed = Date.now() - touchStartTime;
        const isQuickFlick = (elapsed < 300 && Math.abs(deltaX) > 30);

        if (deltaX < -50 || (isQuickFlick && deltaX < 0)) {
          // Swipe Left -> Next
          nextImage();
        } else if (deltaX > 50 || (isQuickFlick && deltaX > 0)) {
          // Swipe Right -> Prev
          prevImage();
        } else {
          // Snap back
          if (imgEl) {
            imgEl.style.transition = 'transform 0.2s ease-out';
            imgEl.style.transform = 'translateX(0) scale(1)';
          }
        }
      }

      isSwiping = false;
    });
  }

  // Auto-bind to DOM preview elements on load
  function autoBindPagePreviewCards() {
    collectGalleryImages();
    document.querySelectorAll('.preview-card, .book-preview-card').forEach((card, i) => {
      card.style.cursor = 'zoom-in';
      card.addEventListener('click', (e) => {
        // Prevent conflict if button inside card was clicked
        if (e.target.closest('button, a')) return;
        const img = card.querySelector('img');
        const src = img ? (img.getAttribute('src') || img.src) : null;
        window.openUniversalGalleryLightbox(src || i);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBindPagePreviewCards);
  } else {
    autoBindPagePreviewCards();
  }

})();
