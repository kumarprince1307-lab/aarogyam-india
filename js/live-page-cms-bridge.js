/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL LIVE PAGE CMS BRIDGE & DYNAMIC ENGINE
 * Version: 32.0 (Rock-Solid Multi-Page Synchronization & Zero Cache-Lag)
 * ====================================================================
 * Connects all live customer-facing pages (index.html, pashu-palan.html,
 * health/*.html, categories/*.html, ebooks/*.html, etc.) directly to
 * the Admin Page Editor CMS data.
 * 
 * Synchronizes in Real-Time:
 * 1. Live Breaking News Ticker (Marquee & Speed) - Always preserved at top
 * 2. Hero Banners & Panoramic Carousel (Slides, Badges, CTAs, Images)
 * 3. 3D Floating Action Banners (Image, Badge, Link, 3D Animations)
 * 4. Section Reordering & Instant Section Show/Hide
 * 5. Feature & Trust Badges (KPI Cards with Hindi Speech & Native Share)
 * 6. Health Consultation Cards (Diseases, Badges, Symptoms, Remedies)
 * 7. Agricultural Crop Cards (Seasons, Pests, Spray Schedules)
 * 8. Pashu Palan & Dairy Livestock Cards (Milk, Fat%, Nutrition)
 * 9. Live Products Catalog (Custom Pricing, Discounts, Badges, Direct Order)
 * 10. YouTube Video Guides & Walkthrough Showcase
 * 11. Top Achievers Showcase (Avatars, Quotes, Achievements)
 * 12. Verified Customer & Farmer Reviews (Star Ratings, Testimonials)
 * 13. Interactive FAQs Accordion (Questions & Detailed Answers)
 * 14. 24x7 WhatsApp AI Doctor Support (Direct Numbers & Auto-Prompts)
 * 15. Audio Narration Greetings (Web Speech Hindi Engine Integration)
 * 16. Theme Colors & Dynamic OpenGraph Social Meta Tags
 * ====================================================================
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function resolveAssetSrc(item, field = 'image', fallback = '') {
    if (!item) return fallback;
    const path = item[field] || '';
    if (!path) return fallback;
    try {
      const offSync = JSON.parse(localStorage.getItem('AI_OFFLINE_UPLOADS') || '{}');
      if (offSync[path]) return offSync[path];
      const norm = '/' + path.replace(/^\/+/, '');
      if (offSync[norm]) return offSync[norm];
    } catch (e) {}
    return path || fallback;
  }

  function getPageMatch(allPages) {
    if (!Array.isArray(allPages) || allPages.length === 0) return null;
    const path = (window.location.pathname || '').toLowerCase().trim();
    const cleanFilename = (path.split('/').pop() || '').replace('.html', '').trim();
    
    // 1. Exact URL match (Highest Priority)
    const exactUrl = allPages.find(p => p.url && p.url.toLowerCase().trim() === path);
    if (exactUrl) return exactUrl;

    // 2. Path ends with configured URL (e.g. domain.com/health/diabetes.html ends with /health/diabetes.html)
    const endsUrl = allPages.find(p => p.url && path.endsWith(p.url.toLowerCase().trim()));
    if (endsUrl) return endsUrl;

    // 3. Homepage check
    const isHomePage = path === '/' || path === '' || path.endsWith('/index.html') || path.endsWith('index.html');
    if (isHomePage) {
      const homePage = allPages.find(p => p.id === 'page_home' || p.id === 'page_index' || p.slug === 'index');
      if (homePage) return homePage;
    }

    // 4. Exact filename / subpage slug match (e.g. /health/diabetes.html -> health-diabetes or diabetes)
    if (cleanFilename) {
      const subpageMatch = allPages.find(p => {
        const s = (p.slug || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        return s === `health-${cleanFilename}` || s === cleanFilename || id === `page_health_${cleanFilename.replace(/-/g, '_')}` || id === `page_${cleanFilename.replace(/-/g, '_')}`;
      });
      if (subpageMatch) return subpageMatch;
    }

    // 5. Explicit section keywords
    if (path.includes('pashu')) {
      const pashuPage = allPages.find(p => p.id === 'page_pashu' || p.id === 'page_pashu_palan' || p.id.includes('cattle'));
      if (pashuPage) return pashuPage;
    }

    if (path.includes('agriculture')) {
      const agriPage = allPages.find(p => p.id && p.id.includes('agriculture'));
      if (agriPage) return agriPage;
    }

    return null;
  }

  async function loadConfigData() {
    let allPages = [];
    let serverConfigLoaded = false;

    // 1. Always attempt Network-First fetch with cache-busting timestamp
    const cacheBuster = Date.now();
    const paths = [
      `/data/site-pages-config.json?t=${cacheBuster}`,
      `../data/site-pages-config.json?t=${cacheBuster}`,
      `./data/site-pages-config.json?t=${cacheBuster}`
    ];

    for (const p of paths) {
      try {
        const res = await fetch(p, { cache: 'no-store' });
        if (res.ok) {
          const j = await res.json();
          if (j && Array.isArray(j.sitePages) && j.sitePages.length > 0) {
            allPages = j.sitePages;
            serverConfigLoaded = true;
            break;
          }
        }
      } catch (err) {}
    }

    // 2. Safe Local Storage Sync: Server is always the single source of truth
    try {
      const stored = localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG');
      if (stored) {
        const localParsed = JSON.parse(stored);
        if (Array.isArray(localParsed) && localParsed.length > 0) {
          if (!serverConfigLoaded || allPages.length === 0) {
            allPages = localParsed;
          } else {
            // Only merge if explicitly in developer preview mode (?admin_preview=1)
            const isPreviewMode = window.location.search.includes('admin_preview=1') || window.location.search.includes('cms_draft=1');
            if (isPreviewMode) {
              localParsed.forEach(lp => {
                const sIdx = allPages.findIndex(sp => sp.id === lp.id || sp.slug === lp.slug);
                if (sIdx >= 0) {
                  allPages[sIdx] = Object.assign({}, allPages[sIdx], lp);
                } else {
                  allPages.push(lp);
                }
              });
            }
          }
        }
      }
      // If server loaded successfully, refresh localStorage with fresh server data
      if (serverConfigLoaded && allPages.length > 0) {
        localStorage.setItem('AAROGYAM_SITE_PAGES_CONFIG', JSON.stringify(allPages));
      }
    } catch (e) {}

    window.AAROGYAM_SITE_PAGES_CONFIG = allPages;
    return allPages;
  }

  function applyPageThemeAndMeta(pageConfig) {
    if (!pageConfig) return;

    // 1. Primary & Dark Theme Colors
    if (pageConfig.theme_primary) {
      document.documentElement.style.setProperty('--primary-color', pageConfig.theme_primary);
      document.documentElement.style.setProperty('--color-primary', pageConfig.theme_primary);
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.setAttribute('content', pageConfig.theme_primary);
    }
    if (pageConfig.theme_dark) {
      document.documentElement.style.setProperty('--primary-dark', pageConfig.theme_dark);
    }

    // Helper to safely set or create meta tags
    function setOrCreateMeta(selector, attrName, attrVal, content) {
      if (!content) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    // 2. Page Title & Meta Tags
    if (pageConfig.og_title) {
      document.title = pageConfig.og_title;
      setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', pageConfig.og_title);
      setOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageConfig.og_title);
    } else if (pageConfig.name) {
      document.title = `${pageConfig.name} | Aarogyam India`;
      setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', `${pageConfig.name} | Aarogyam India`);
    }

    if (pageConfig.og_description) {
      setOrCreateMeta('meta[name="description"]', 'name', 'description', pageConfig.og_description);
      setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', pageConfig.og_description);
      setOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', pageConfig.og_description);
    }

    window.AAROGYAM_ACTIVE_PAGE_CMS = pageConfig;

    if (pageConfig.og_image) {
      let resolvedOg = resolveAssetSrc(pageConfig, 'og_image');
      if (resolvedOg && resolvedOg.startsWith('/')) {
        resolvedOg = 'https://aarogyamindia.online' + resolvedOg;
      }
      setOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', resolvedOg);
      setOrCreateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', resolvedOg);
      setOrCreateMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    }
  }

  function renderDynamicTicker(pageConfig) {
    const text = pageConfig.ticker_text || (pageConfig.live_ticker && pageConfig.live_ticker.text);
    if (!text) return;
    const tickerTrack = document.getElementById('home-live-ticker-track') || document.querySelector('.ticker-marquee-scroll');
    if (tickerTrack) {
      tickerTrack.textContent = text;
    }
  }

  function setupUniversalCarouselController(carouselContainer, totalSlides) {
    if (!carouselContainer || totalSlides <= 1) return;

    // Reset init lock so fresh slides can be controlled cleanly
    delete carouselContainer.dataset.carouselInit;
    const parentSec = carouselContainer.closest('section') || carouselContainer.parentElement;
    if (parentSec) delete parentSec.dataset.carouselInit;

    // Try global carousel engines first
    if (typeof window.initPanoramicCarousel === 'function') {
      try { window.initPanoramicCarousel(); return; } catch (e) {}
    }
    if (typeof window.initHeroCarousel === 'function') {
      try { window.initHeroCarousel(); return; } catch (e) {}
    }
    if (typeof window.initUniversalHeroCarousel === 'function') {
      try { window.initUniversalHeroCarousel(); return; } catch (e) {}
    }

    // Fallback standalone carousel controller
    let currentIdx = 0;
    const slides = carouselContainer.querySelectorAll('.home-hero-slide-item');
    const parentScope = carouselContainer.closest('.container') || carouselContainer.parentElement || carouselContainer;
    const dots = parentScope.querySelectorAll('.bighaat-carousel-dot');
    const prevBtn = carouselContainer.querySelector('.bighaat-carousel-arrow.prev') || parentScope.querySelector('.bighaat-carousel-arrow.prev');
    const nextBtn = carouselContainer.querySelector('.bighaat-carousel-arrow.next') || parentScope.querySelector('.bighaat-carousel-arrow.next');

    function showSlide(index) {
      if (slides.length === 0) return;
      currentIdx = (index + slides.length) % slides.length;
      slides.forEach((s, i) => {
        if (i === currentIdx) {
          s.style.display = 'block';
          s.style.opacity = '0';
          s.style.transform = 'scale(0.98)';
          s.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          requestAnimationFrame(() => {
            s.style.opacity = '1';
            s.style.transform = 'scale(1)';
          });
        } else {
          s.style.display = 'none';
          s.style.opacity = '0';
        }
      });
      dots.forEach((d, i) => {
        if (i === currentIdx) {
          d.classList.add('active');
          d.style.background = '#16a34a';
        } else {
          d.classList.remove('active');
          d.style.background = '#cbd5e1';
        }
      });
    }

    let autoTimer = setInterval(() => showSlide(currentIdx + 1), 5000);
    function resetTimer() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => showSlide(currentIdx + 1), 5000);
    }

    if (prevBtn) {
      prevBtn.onclick = (e) => { e.preventDefault(); showSlide(currentIdx - 1); resetTimer(); };
    }
    if (nextBtn) {
      nextBtn.onclick = (e) => { e.preventDefault(); showSlide(currentIdx + 1); resetTimer(); };
    }
    dots.forEach((dot, idx) => {
      dot.onclick = () => { showSlide(idx); resetTimer(); };
    });
  }

  function renderDynamicHeroSlides(pageConfig) {
    if (!Array.isArray(pageConfig.hero_slides) || pageConfig.hero_slides.length === 0) return;
    const carouselContainer = document.querySelector('.bighaat-carousel-container') || 
                              document.querySelector('.home-hero-section') || 
                              document.getElementById('sec-hero-slider');
    if (!carouselContainer) return;

    const validSlides = pageConfig.hero_slides.filter(s => s && (s.image || s.image_preview));
    if (validSlides.length === 0) return;

    // Reset init lock
    delete carouselContainer.dataset.carouselInit;
    const parentSec = carouselContainer.closest('section') || carouselContainer.parentElement;
    if (parentSec) delete parentSec.dataset.carouselInit;

    // Remove existing slide items
    const existingSlides = carouselContainer.querySelectorAll('.home-hero-slide-item');
    existingSlides.forEach(el => el.remove());

    const isHealthPage = window.location.pathname.includes('/health/');

    validSlides.forEach((s, idx) => {
      const imgSrc = resolveAssetSrc(s, 'image', '/images/banners/health-banner.jpeg');
      const slideDiv = document.createElement('div');
      slideDiv.className = 'home-hero-slide-item';
      if (idx !== 0) slideDiv.style.display = 'none';

      // Banner mode detection:
      // If s.banner_mode === 'full' OR (isHealthPage && !s.subtitle) OR non-health page:
      // render 100% full panoramic banner so 1600x639 wide banners are NEVER cropped!
      const isCardMode = s.banner_mode === 'card' || (isHealthPage && s.banner_mode !== 'full' && (s.subtitle && s.subtitle.trim().length > 0));

      if (isCardMode) {
        const tag = s.tag || 'HEALTH CARE';
        const title = s.title || 'आरोग्यम स्वास्थ्य समाधान';
        const desc = s.subtitle || s.description || '';
        const ctaText = s.cta_text || 'मुफ़्त परामर्श लें';
        const ctaLink = s.cta_link || '#sec-products';

        slideDiv.innerHTML = `
          <div class="home-hero-slide-card" style="background:linear-gradient(135deg, #090d16 0%, #1e3a8a 50%, #2563eb 100%); border-color:#60a5fa;">
            <div style="flex:1; min-width:280px;">
              <span class="home-hero-tag" style="background:#fde047; color:#000;">${escapeHtml(tag)}</span>
              <h1 class="home-hero-title">${escapeHtml(title)}</h1>
              ${desc ? `<p class="home-hero-desc">${escapeHtml(desc)}</p>` : ''}
              <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:14px;">
                <a href="${escapeHtml(ctaLink)}" class="btn" style="background:#22c55e; color:#fff; font-weight:900; padding:12px 24px; border-radius:30px; text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
                  <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(ctaText)}
                </a>
                ${s.cta_secondary_text ? `<a href="${escapeHtml(s.cta_secondary_link || '#')}" style="color:#fde047; font-weight:800; font-size:0.9rem; text-decoration:underline;">${escapeHtml(s.cta_secondary_text)}</a>` : ''}
              </div>
            </div>
            <div class="home-hero-3d-book" style="flex:0 0 auto; max-width:320px; width:100%; border-radius:14px; overflow:hidden; box-shadow:0 12px 28px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.25); padding:4px;">
              <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(title)}" style="width:100%; height:auto; max-height:220px; object-fit:contain; border-radius:12px;" onerror="this.src='/images/banners/health-banner.jpeg'" />
            </div>
          </div>
        `;
      } else {
        // Full Panoramic Banner (100% full width, natural aspect ratio, zero horizontal or vertical clipping)
        slideDiv.innerHTML = `
          <div class="home-hero-full-banner-wrap" style="width:100%; border-radius:18px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.12); position:relative;">
            <a href="${escapeHtml(s.cta_link || '#sec-products')}" class="landscape-hero-banner-link" title="${escapeHtml(s.title || s.tag || '')}" style="display:block; width:100%; line-height:0; text-decoration:none;">
              <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(s.title || 'Hero Banner')}" class="landscape-hero-banner-img" style="width:100%; height:auto; display:block; object-fit:contain; border-radius:18px;" onerror="this.onerror=null; this.src='/images/banners/health-banner.jpeg';" />
            </a>
          </div>
        `;
      }

      // Insert before dots if they exist inside container, else append
      const dotsEl = carouselContainer.querySelector('.bighaat-carousel-dots');
      if (dotsEl) {
        carouselContainer.insertBefore(slideDiv, dotsEl);
      } else {
        carouselContainer.appendChild(slideDiv);
      }
    });

    const parentScope = carouselContainer.closest('.container') || carouselContainer.parentElement || carouselContainer;
    let dotsContainer = parentScope.querySelector('.bighaat-carousel-dots') || carouselContainer.querySelector('.bighaat-carousel-dots');
    if (!dotsContainer && validSlides.length > 1) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'bighaat-carousel-dots';
      carouselContainer.appendChild(dotsContainer);
    }
    if (dotsContainer) {
      dotsContainer.innerHTML = validSlides.map((_, i) => `<span class="bighaat-carousel-dot${i === 0 ? ' active' : ''}"></span>`).join('');
    }

    setupUniversalCarouselController(carouselContainer, validSlides.length);
  }

  function applySectionReorderingAndVisibility(pageConfig) {
    if (!pageConfig) return;

    // 1. Process Hidden Sections
    if (Array.isArray(pageConfig.hidden_sections) && pageConfig.hidden_sections.length > 0) {
      const sectionKeyMap = {
        'sec_ticker': ['.home-live-ticker-wrap', '#sec_ticker'],
        'sec_hero_slider': ['.home-hero-section', '#sec_hero_slider', '#sec-hero-slider', '.bighaat-carousel-container'],
        'sec_kpi_badges': ['#sec-kpi-badges', '#sec_kpi_badges'],
        'sec_category_pills': ['#sec-quick-hub', '#sec-category-pills', '.quick-hub-grid'],
        'sec_shelves_bestseller': ['.shelf-section', '#sec-bestsellers', '#sec_shelves_bestseller'],
        'sec_interspersed_marketing': ['#sec-interspersed-marketing', '#sec_interspersed_marketing'],
        'sec_combo_promo': ['#sec-combo-promo', '#sec-combo-box'],
        'sec_products': ['#sec-products', '#products-cattle', '.products-catalog-section'],
        'sec_videos': ['#sec-videos', '#sec-video-guides'],
        'sec_reviews': ['#sec-reviews', '#sec-reviews-showcase'],
        'sec_faqs': ['#sec-faqs', '#sec-faqs-accordion'],
        'sec_health_consultation': ['#sec-health-consultation'],
        'sec_major_crops': ['#sec-major-crops'],
        'sec_pashu_palan': ['#sec-pashu-palan', '#products-cattle'],
        'sec_career_business': ['#sec-career-business'],
        'sec_achievers_showcase': ['#sec-achievers-showcase'],
        'sec_help_support': ['#sec-help-support']
      };

      pageConfig.hidden_sections.forEach(secKey => {
        const selectors = sectionKeyMap[secKey] || [`#${secKey}`];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          // Never hide .health-kpi-matrix-section
          if (el && !el.classList.contains('health-kpi-matrix-section')) {
            el.style.display = 'none';
            break;
          }
        }
      });
    }

    // 2. Section reordering: We preserve the natural, semantic HTML DOM order on ALL pages.
    // Zero insertBefore manipulation ensures that unlisted sections (e.g. Health Consultation, Crops, Diet Charts)
    // NEVER get stranded out of order or pushed above the header/banner.
  }

  function renderDynamicKpiBadges(pageConfig) {
    if (!pageConfig || !Array.isArray(pageConfig.kpi_cards) || pageConfig.kpi_cards.length === 0) return;
    let kpiSection = document.getElementById('sec-kpi-badges');
    if (!kpiSection) {
      kpiSection = document.createElement('section');
      kpiSection.id = 'sec-kpi-badges';
      kpiSection.className = 'cms-dynamic-kpi-badges-section';
      kpiSection.style.cssText = 'padding: 16px 0; background: #ffffff; border-bottom: 1.5px solid #e2e8f0;';
      const matrix = document.querySelector('.health-kpi-matrix-section');
      const hero = document.getElementById('sec-hero-slider') || document.querySelector('.home-hero-section') || document.querySelector('.bighaat-carousel-container')?.closest('section');
      if (matrix && matrix.nextSibling) {
        matrix.parentNode.insertBefore(kpiSection, matrix.nextSibling);
      } else if (hero && hero.nextSibling) {
        hero.parentNode.insertBefore(kpiSection, hero.nextSibling);
      } else {
        document.body.prepend(kpiSection);
      }
    }

    kpiSection.innerHTML = `
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          ${pageConfig.kpi_cards.map(c => `
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s ease;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(37,99,235,0.1); color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
                <i class="fa-solid ${escapeHtml(c.icon || 'fa-check')}"></i>
              </div>
              <div style="flex:1;">
                <h4 style="margin: 0 0 2px 0; font-size: 0.95rem; font-weight: 800; color: #0f172a;">${escapeHtml(c.title || '')}</h4>
                <p style="margin: 0; font-size: 0.76rem; color: #64748b; line-height: 1.3;">${escapeHtml(c.desc || '')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderDynamicProducts(pageConfig) {
    if (!pageConfig || !Array.isArray(pageConfig.products) || pageConfig.products.length === 0) {
      return;
    }

    const section = document.getElementById('sec-products') || 
                    document.getElementById('products-cattle') || 
                    document.querySelector('.products-catalog-section');
    if (!section) return;

    const container = section.querySelector('.container') || section;
    const grid = container.querySelector('div[style*="grid"]') || container.querySelector('.products-grid') || container.children[1];
    if (!grid) return;

    const prods = pageConfig.products;
    const isPashu = window.location.pathname.includes('pashu');
    const primaryColor = isPashu ? '#15803d' : (pageConfig.theme_primary || '#2563eb');

    grid.innerHTML = prods.map((p, idx) => {
      const id = p.id || `PROD_${idx + 1}`;
      const name = p.name || p.title || 'आरोग्यम उत्पाद';
      const mrp = Number(p.mrp || p.price || 0);
      const discount = Number(p.discount_pct || 0);
      const offerPrice = (mrp > 0 && discount > 0) ? Math.round(mrp * (1 - discount / 100)) : (Number(p.price) || mrp);
      const badge = p.badge || (isPashu ? 'आयुर्वेदिक पशु पोषण' : 'प्रमाणित हर्बल किट');
      const desc = p.description || p.dose || '';
      const rawImg = resolveAssetSrc(p, 'image', '');
      const hasRealImg = rawImg && !rawImg.includes('logo.png') && !rawImg.endsWith('/logo.png');

      return `
        <div style="background:#fff; border-radius:16px; border:1.5px solid #e2e8f0; padding:20px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 4px 14px rgba(0,0,0,0.03); transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div>
            ${hasRealImg ? `<div style="width:100%; height:140px; border-radius:10px; overflow:hidden; margin-bottom:12px; background:#f8fafc; display:flex; align-items:center; justify-content:center;"><img src="${escapeHtml(rawImg)}" alt="${escapeHtml(name)}" style="width:100%; height:100%; object-fit:contain; padding:6px;" onerror="this.parentElement.style.display='none'"></div>` : ''}
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <span style="background:#fef08a; color:#854d0e; font-weight:800; font-size:0.72rem; padding:2px 8px; border-radius:8px;">${escapeHtml(badge)}</span>
              <div style="text-align:right;">
                <span style="font-size:1.15rem; font-weight:900; color:${primaryColor};">₹${offerPrice || mrp}</span>
                ${discount > 0 ? `<span style="font-size:0.75rem; text-decoration:line-through; color:#94a3b8; margin-left:4px;">₹${mrp}</span>` : ''}
              </div>
            </div>
            <h4 style="font-size:1.1rem; font-weight:900; color:#0f172a; margin:0 0 6px 0;">${escapeHtml(name)}</h4>
            ${desc ? `<p style="font-size:0.82rem; color:#64748b; line-height:1.45; margin-bottom:14px;">${escapeHtml(desc)}</p>` : ''}
          </div>
          <button type="button" class="product-order-toggle-btn" onclick="window.toggleProductSelection ? window.toggleProductSelection(this, '${escapeHtml(id)}', '${escapeHtml(name)}', ${offerPrice || mrp}) : (window.toggleProductOrder && window.toggleProductOrder('${escapeHtml(id)}', '${escapeHtml(name)}', ${offerPrice || mrp}, ${mrp}, this))">
            <i class="fa-solid fa-cart-plus"></i> ऑर्डर सूची में जोड़ें
          </button>
        </div>
      `;
    }).join('');

    if (typeof window.syncPageButtonStates === 'function') {
      window.syncPageButtonStates();
    }
  }

  function renderDynamicReviews(pageConfig) {
    if (!Array.isArray(pageConfig.reviews) || pageConfig.reviews.length === 0) return;
    const grid = document.getElementById('home-reviews-grid') || 
                 document.querySelector('#sec-reviews .reviews-grid') || 
                 document.querySelector('.reviews-grid') || 
                 document.querySelector('#sec-reviews div[style*="grid"]') ||
                 document.getElementById('sec-reviews-grid');
    if (!grid) return;

    // Safety: If static HTML already has 3 or more rich reviews and incoming config has fewer, don't downgrade/wipe them!
    const existingCount = grid.querySelectorAll('div[style*="border-radius"], .review-card').length;
    if (existingCount >= 3 && pageConfig.reviews.length < existingCount) {
      return;
    }

    grid.innerHTML = pageConfig.reviews.map(r => `
      <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 22px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="color: #facc15; font-size: 1rem; margin-bottom: 8px;">★★★★★</div>
          <p style="font-size: 0.88rem; color: #334155; line-height: 1.5; margin-bottom: 14px;">
            "${escapeHtml(r.comment || r.text || '')}"
          </p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:42px; height:42px; border-radius:50%; background:#eff6ff; border:1.5px solid #3b82f6; display:flex; align-items:center; justify-content:center; font-size:1.3rem;">
            ${r.avatar || '👨‍🌾'}
          </div>
          <div>
            <h4 style="font-size:0.95rem; font-weight:800; margin:0; color:#0f172a;">${escapeHtml(r.name || 'किसान / ग्राहक मित्र')}</h4>
            <div style="font-size:0.75rem; color:#64748b;">📍 ${escapeHtml(r.location || 'भारत')}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderDynamicFaqs(pageConfig) {
    if (!Array.isArray(pageConfig.faqs) || pageConfig.faqs.length === 0) return;
    const faqContainer = document.getElementById('home-faq-accordion') || 
      document.querySelector('#sec-faqs .faq-accordion') ||
      document.querySelector('.faq-accordion') ||
      document.querySelector('#sec-faqs div[style*="flex-direction"]') ||
      document.querySelector('#sec-faqs-accordion div[style*="flex-direction"]');
    if (!faqContainer) return;

    // Safety: If static HTML already has more FAQs than incoming config, don't downgrade/wipe them!
    const existingCount = faqContainer.querySelectorAll('details').length;
    if (existingCount >= 3 && pageConfig.faqs.length < existingCount) {
      return;
    }

    faqContainer.innerHTML = pageConfig.faqs.map((f, i) => `
      <details style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:16px 20px; cursor:pointer; color:#0f172a; margin-bottom:10px;" ${i === 0 ? 'open' : ''}>
        <summary style="font-weight:800; color:#2563eb; font-size:0.96rem;">${i + 1}. ${escapeHtml(f.question || f.q)}</summary>
        <p style="margin:10px 0 0 0; font-size:0.88rem; color:#475569; line-height:1.5;">${escapeHtml(f.answer || f.a)}</p>
      </details>
    `).join('');
  }

  function renderDynamicClinicalBreakdown(pageConfig) {
    if (!pageConfig || !pageConfig.clinical_breakdown) return;
    const cb = pageConfig.clinical_breakdown;
    const sec = document.getElementById('sec-scientific-breakdown') || 
                document.getElementById('sec-mastitis') ||
                document.querySelector('section:has(.breakdown-grid)');
    if (!sec) return;

    if (cb.badge_text) {
      const badge = sec.querySelector('span[style*="uppercase"]') || sec.querySelector('span[style*="border-radius:20px"]') || sec.querySelector('span');
      if (badge) badge.textContent = cb.badge_text;
    }
    if (cb.main_title) {
      const h2 = sec.querySelector('h2');
      if (h2) h2.textContent = cb.main_title;
    }

    const grid = sec.querySelector('.breakdown-grid') || sec.querySelector('div[style*="grid"]');
    if (!grid || !Array.isArray(cb.cards) || cb.cards.length === 0) return;

    grid.innerHTML = cb.cards.map(c => `
      <div style="background:#fff; border-radius:16px; border:1.5px solid #e2e8f0; padding:22px; box-shadow:0 4px 14px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          ${c.image ? `
            <div style="width:100%; height:180px; border-radius:12px; overflow:hidden; margin-bottom:14px; background:#f1f5f9; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              <img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.title || '')}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.style.display='none'">
            </div>
          ` : ''}
          <h3 style="font-size:1.15rem; font-weight:900; color:${c.color || '#2563eb'}; margin:0 0 10px 0;">${escapeHtml(c.title || '')}</h3>
          <ul style="padding-left:18px; margin:0; font-size:0.86rem; color:#475569; line-height:1.6;">
            ${(Array.isArray(c.points) ? c.points : (c.points || '').split('\n')).filter(Boolean).map(pt => `<li>${pt}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  function renderDynamicDietExercise(pageConfig) {
    if (!pageConfig || !pageConfig.diet_exercise) return;
    const de = pageConfig.diet_exercise;
    const sec = document.getElementById('sec-diet');
    if (!sec) return;

    // Diet Card
    if (de.diet && de.diet.title) {
      const dietBox = sec.querySelector('div[style*="background:#eff6ff"], div[style*="background:#f0fdf4"]') || sec.querySelector('div[style*="border-radius:18px"]');
      if (dietBox) {
        const titleEl = dietBox.querySelector('h3');
        if (titleEl) titleEl.textContent = de.diet.title;
        const listDiv = dietBox.querySelector('div[style*="flex-direction:column"]') || dietBox.querySelector('div[style*="display:flex"]');
        if (listDiv && de.diet.items) {
          const items = Array.isArray(de.diet.items) ? de.diet.items : de.diet.items.split('\n').filter(Boolean);
          listDiv.innerHTML = items.map(it => `<p style="margin:0;">${it}</p>`).join('');
        }

        // Render Multi-Image Gallery for Diet
        let dietGallery = dietBox.querySelector('.cms-diet-gallery');
        if (Array.isArray(de.diet.images) && de.diet.images.length > 0) {
          if (!dietGallery) {
            dietGallery = document.createElement('div');
            dietGallery.className = 'cms-diet-gallery';
            dietGallery.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-top:14px;';
            dietBox.appendChild(dietGallery);
          }
          dietGallery.innerHTML = de.diet.images.map(imgObj => {
            const url = typeof imgObj === 'string' ? imgObj : (imgObj.image || imgObj.url || '');
            const caption = typeof imgObj === 'object' ? (imgObj.caption || '') : '';
            if (!url) return '';
            return `
              <div style="background:#ffffff; border-radius:10px; overflow:hidden; border:1.5px solid #bfdbfe; box-shadow:0 2px 6px rgba(0,0,0,0.04); display:flex; flex-direction:column;">
                <img src="${escapeHtml(url)}" alt="${escapeHtml(caption || 'डाइट फोटो')}" loading="lazy" style="width:100%; height:100px; object-fit:cover; display:block;" onerror="this.parentElement.style.display='none'">
                ${caption ? `<div style="padding:4px 6px; font-size:0.72rem; font-weight:700; color:#1e3a8a; text-align:center; line-height:1.2; background:#f0f9ff;">${escapeHtml(caption)}</div>` : ''}
              </div>
            `;
          }).join('');
        }
      }
    }

    // Exercise Card
    if (de.exercise && de.exercise.title) {
      const exBox = document.getElementById('sec-exercise') || sec.querySelectorAll('div[style*="border-radius:18px"]')[1];
      if (exBox) {
        const titleEl = exBox.querySelector('h3');
        if (titleEl) titleEl.textContent = de.exercise.title;
        const listDiv = exBox.querySelector('div[style*="flex-direction:column"]') || exBox.querySelector('div[style*="display:flex"]');
        if (listDiv && de.exercise.items) {
          const items = Array.isArray(de.exercise.items) ? de.exercise.items : de.exercise.items.split('\n').filter(Boolean);
          listDiv.innerHTML = items.map(it => `<p style="margin:0;">${it}</p>`).join('');
        }

        // Render Multi-Image Gallery for Exercise & Yoga
        let exGallery = exBox.querySelector('.cms-exercise-gallery');
        if (Array.isArray(de.exercise.images) && de.exercise.images.length > 0) {
          if (!exGallery) {
            exGallery = document.createElement('div');
            exGallery.className = 'cms-exercise-gallery';
            exGallery.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-top:14px;';
            exBox.appendChild(exGallery);
          }
          exGallery.innerHTML = de.exercise.images.map(imgObj => {
            const url = typeof imgObj === 'string' ? imgObj : (imgObj.image || imgObj.url || '');
            const caption = typeof imgObj === 'object' ? (imgObj.caption || '') : '';
            if (!url) return '';
            return `
              <div style="background:#ffffff; border-radius:10px; overflow:hidden; border:1.5px solid #bbf7d0; box-shadow:0 2px 6px rgba(0,0,0,0.04); display:flex; flex-direction:column;">
                <img src="${escapeHtml(url)}" alt="${escapeHtml(caption || 'व्यायाम व योगासन')}" loading="lazy" style="width:100%; height:100px; object-fit:cover; display:block;" onerror="this.parentElement.style.display='none'">
                ${caption ? `<div style="padding:4px 6px; font-size:0.72rem; font-weight:700; color:#14532d; text-align:center; line-height:1.2; background:#f0fdf4;">${escapeHtml(caption)}</div>` : ''}
              </div>
            `;
          }).join('');
        }
      }
    }
  }

  // Universal In-Page AarogyamTube Video Player Modal (Prevents external redirection)
  window.openUniversalVideoModal = function (title, ytId) {
    if (!ytId) {
      window.location.href = '/tube.html';
      return;
    }
    let modal = document.getElementById('aarogyam_tube_video_modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aarogyam_tube_video_modal';
      modal.style.cssText = 'position:fixed; inset:0; background:rgba(15,23,42,0.95); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(10px);';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background:#090d16; border:1.5px solid #3b82f6; border-radius:18px; width:100%; max-width:760px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,0.8); display:flex; flex-direction:column; position:relative; z-index:1000000;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 18px; background:linear-gradient(90deg, #1e3a8a, #0f172a); border-bottom:1px solid #1e293b;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="background:#ef4444; color:#fff; font-weight:900; font-size:0.72rem; padding:3px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;">
              <i class="fa-brands fa-youtube"></i> AarogyamTube
            </span>
            <span style="color:#f8fafc; font-weight:800; font-size:0.88rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:400px;">${escapeHtml(title || 'आरोग्यम विशेष वीडियो')}</span>
          </div>
          <button type="button" onclick="document.getElementById('aarogyam_tube_video_modal').remove()" style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:32px; height:32px; border-radius:50%; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
        </div>
        <div style="position:relative; width:100%; padding-bottom:56.25%; background:#000;">
          <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0&modestbranding=1" title="${escapeHtml(title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:none;"></iframe>
        </div>
        <div style="padding:14px 18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:#0f172a;">
          <div style="font-size:0.78rem; color:#94a3b8;">
            ✦ AarogyamTube सुरक्षित प्लेयर — आप आरोग्यम इंडिया पर ही वीडियो देख रहे हैं
          </div>
          <div style="display:flex; gap:8px;">
            <a href="/tube.html" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; padding:7px 14px; border-radius:20px; font-weight:800; font-size:0.78rem; text-decoration:none; display:inline-flex; align-items:center; gap:5px;">
              🎬 AarogyamTube हब देखें
            </a>
            <button type="button" onclick="document.getElementById('aarogyam_tube_video_modal').remove()" style="background:#334155; color:#fff; border:none; padding:7px 14px; border-radius:20px; font-weight:700; font-size:0.78rem; cursor:pointer;">
              बंद करें
            </button>
          </div>
        </div>
      </div>
    `;
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  };

  function renderDynamicVideos(pageConfig) {
    if (!Array.isArray(pageConfig.videos) || pageConfig.videos.length === 0) return;
    const videoContainer = document.querySelector('.universal-video-showcase') ||
                           document.getElementById('home-video-showcase') ||
                           document.querySelector('#sec-videos .universal-video-showcase') ||
                           document.querySelector('#sec-videos div[style*="grid"]');
    if (!videoContainer) return;

    videoContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; width: 100%;">
        ${pageConfig.videos.map(v => {
          const ytUrl = v.youtube_url || v.url || '';
          const ytMatch = ytUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{10,12})/);
          const ytId = ytMatch ? ytMatch[1] : (v.youtube_id || '');
          const thumb = v.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/images/banners/health-banner.jpeg');
          const title = v.title || 'आरोग्यम विशेष वीडियो';
          const dur = v.duration || 'मास्टरक्लास';
          return `
            <div class="universal-video-card" style="background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 14px rgba(0,0,0,0.06); display:flex; flex-direction:column; transition:transform 0.2s, box-shadow 0.2s; cursor:pointer;" onclick="window.openUniversalVideoModal('${escapeHtml(title)}', '${ytId}')">
              <div style="position:relative; width:100%; padding-bottom:56.25%; background:#0f172a; overflow:hidden;">
                <img src="${thumb}" alt="${escapeHtml(title)}" loading="lazy" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; opacity:0.92;" onerror="this.src='/images/banners/health-banner.jpeg'" />
                <div style="position:absolute; inset:0; background:linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%);"></div>
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:46px; height:46px; border-radius:50%; background:rgba(239,68,68,0.92); color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 4px 15px rgba(239,68,68,0.6);">
                  ▶
                </div>
                <div style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.75); color:#fff; font-size:0.7rem; font-weight:700; padding:2px 6px; border-radius:4px;">
                  ⏱️ ${escapeHtml(dur)}
                </div>
              </div>
              <div style="padding:14px; display:flex; flex-direction:column; flex:1; justify-content:space-between;">
                <h4 style="font-size:0.92rem; font-weight:800; color:#0f172a; margin:0 0 8px 0; line-height:1.4;">${escapeHtml(title)}</h4>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:#64748b;">
                  <span style="color:#ef4444; font-weight:800;">🔴 AarogyamTube Masterclass</span>
                  <span>▶ अभी देखें</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderFloatingBanner(pageConfig) {
    let fbEl = document.getElementById('home-3d-floating-banner') || document.getElementById('live-3d-floating-banner');
    if (!pageConfig || !pageConfig.floating_banner || !pageConfig.floating_banner.image) {
      if (fbEl) fbEl.style.display = 'none';
      return;
    }
    const fb = pageConfig.floating_banner;
    // Don't render if explicitly disabled without valid action
    if (fb.enabled === false && !fb.image) {
      if (fbEl) fbEl.style.display = 'none';
      return;
    }

    // Ensure 3D Floating Animation Style is injected on ALL pages
    if (!document.getElementById('style-floating-3d-anim')) {
      const st = document.createElement('style');
      st.id = 'style-floating-3d-anim';
      st.textContent = `
        @keyframes ublFloat3DKeyframes {
          0%, 100% { transform: translateY(0px) rotateX(4deg) rotateY(-5deg) scale(1); }
          50% { transform: translateY(-12px) rotateX(-4deg) rotateY(5deg) scale(1.03); }
        }
        .ubl-float-3d-anim {
          animation: ublFloat3DKeyframes 3.6s ease-in-out infinite !important;
          transform-style: preserve-3d !important;
          perspective: 800px !important;
          will-change: transform;
        }
        @media (max-width: 768px) {
          #live-3d-floating-banner {
            top: 95px !important;
            left: 10px !important;
            max-width: 155px !important;
          }
        }
      `;
      document.head.appendChild(st);
    }

    if (!fbEl) {
      fbEl = document.createElement('div');
      fbEl.id = 'live-3d-floating-banner';
      fbEl.style.cssText = `
        position: fixed; top: 110px; left: 18px; z-index: 9990;
        max-width: 220px; cursor: pointer; transition: transform 0.3s ease;
      `;
      document.body.appendChild(fbEl);
    }
    fbEl.style.display = 'block';
    const animClass = fb.animation === 'none' ? '' : 'ubl-float-3d-anim';
    const fbImg = resolveAssetSrc(fb, 'image', '/images/banners/agriculture-banner.jpeg');

    fbEl.innerHTML = `
      <div style="position:relative;">
        <button type="button" aria-label="Close" onclick="event.stopPropagation(); this.closest('#live-3d-floating-banner').style.display='none';" style="position:absolute; top:-7px; right:-7px; z-index:10; background:#0f172a; color:#fff; border:1.5px solid #fff; border-radius:50%; width:22px; height:22px; font-size:11px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.35);">✕</button>
        <a href="${escapeHtml(fb.action_link || '#')}" style="display:block; text-decoration:none; text-align:center;">
          ${fb.badge_title ? `<div style="background:#16a34a; color:#fff; font-size:0.72rem; font-weight:800; padding:4px 8px; border-radius:10px; margin-bottom:5px; box-shadow:0 2px 8px rgba(0,0,0,0.3); line-height:1.2;">${escapeHtml(fb.badge_title)}</div>` : ''}
          <img src="${escapeHtml(fbImg)}" alt="3D Feature Banner" class="${animClass}" style="width:100%; border-radius:14px; box-shadow:0 14px 32px rgba(0,0,0,0.45); border:2.5px solid #38bdf8;" />
        </a>
      </div>
    `;
  }

  function applyWhatsAppSupport(pageConfig) {
    if (!pageConfig || !pageConfig.whatsapp_support) return;
    const { number, prompt } = pageConfig.whatsapp_support;
    if (!number && !prompt) return;

    const waNum = (number || '7974422572').replace(/\D/g, '');
    const defaultText = prompt || 'नमस्ते Aarogyam India! मुझे सहायता चाहिए।';

    window.getPersonalizedWhatsAppUrl = function(customPrompt) {
      const text = customPrompt || defaultText;
      return `https://wa.me/91${waNum}?text=${encodeURIComponent(text)}`;
    };

    document.querySelectorAll('.ai-expert-red-btn, a[href*="wa.me"]').forEach(btn => {
      if (btn.tagName === 'A') {
        btn.href = `https://wa.me/91${waNum}?text=${encodeURIComponent(defaultText)}`;
      }
    });
  }

  function syncAudioNarration(pageConfig) {
    if (!pageConfig || (!pageConfig.audio_script && !pageConfig.audio_url)) return;
    try {
      const existing = JSON.parse(localStorage.getItem('AAROGYAM_PAGE_AUDIO_SCRIPTS') || '{}');
      const key = pageConfig.slug || (pageConfig.id ? pageConfig.id.replace(/^page_/, '') : '');
      if (key) {
        existing[key] = {
          title: pageConfig.audio_title || pageConfig.name,
          script: pageConfig.audio_script || '',
          audio_url: pageConfig.audio_url || ''
        };
        const cleanKey = key.replace(/^health_/, '').replace(/^page_health_/, '');
        existing[cleanKey] = existing[key];
        if (key === 'index' || pageConfig.id === 'page_home') {
          existing['index'] = existing[key];
        }
      }
      localStorage.setItem('AAROGYAM_PAGE_AUDIO_SCRIPTS', JSON.stringify(existing));
      if (typeof window.syncCmsAudioScripts === 'function') {
        window.syncCmsAudioScripts();
      }
    } catch (e) {}
  }

  async function initLiveCmsBridge() {
    try {
      // Ensure page is scrollable (prevent any modal/drawer scroll freeze)
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      const allPages = await loadConfigData();
      const pageConfig = getPageMatch(allPages);
      if (pageConfig) {
        window.AAROGYAM_ACTIVE_PAGE_CMS = pageConfig;
        
        applyPageThemeAndMeta(pageConfig);
        renderDynamicTicker(pageConfig);
        renderDynamicHeroSlides(pageConfig);
        applySectionReorderingAndVisibility(pageConfig);
        renderDynamicKpiBadges(pageConfig);
        renderDynamicProducts(pageConfig);
        renderDynamicClinicalBreakdown(pageConfig);
        renderDynamicDietExercise(pageConfig);
        renderDynamicReviews(pageConfig);
        renderDynamicFaqs(pageConfig);
        renderDynamicVideos(pageConfig);
        renderFloatingBanner(pageConfig);
        applyWhatsAppSupport(pageConfig);
        syncAudioNarration(pageConfig);

        const curPath = (window.location.pathname || '').toLowerCase();
        const isHome = curPath === '/' || curPath === '' || curPath.endsWith('/index.html') || curPath.endsWith('index.html');
        if (isHome && typeof window.startHomeRevampEngine === 'function') {
          window.startHomeRevampEngine();
        }
      }
    } catch (e) {
      console.warn('[LivePageCMS] Hydration skipped, using static fallback:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveCmsBridge);
  } else {
    initLiveCmsBridge();
  }

  window.initLiveCmsBridge = initLiveCmsBridge;
})();
