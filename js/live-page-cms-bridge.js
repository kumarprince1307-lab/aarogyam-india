/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL LIVE PAGE CMS BRIDGE & DYNAMIC ENGINE
 * Version: 28.0 (Bulletproof Live Page Real-Time Synchronization)
 * ====================================================================
 * Connects all live customer-facing pages (index.html, pashu-palan.html,
 * health/*.html, etc.) directly to the Admin Page Editor CMS data.
 * 
 * Synchronizes in Real-Time:
 * 1. Live Breaking News Ticker (Marquee & Speed)
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
    const path = (window.location.pathname || '').toLowerCase();
    
    // 1. Check Homepage first
    const isHomePage = path === '/' || path === '' || path.endsWith('/index.html') || path.endsWith('index.html');
    if (isHomePage) {
      const homePage = allPages.find(p => p.id === 'page_home' || p.slug === 'index' || (p.url && (p.url === '/' || p.url.includes('index.html'))));
      if (homePage) return homePage;
    }

    // 2. Exact or suffix matches
    return allPages.find(p => {
      const u = (p.url || '').toLowerCase();
      const s = (p.slug || '').toLowerCase();
      const id = (p.id || '').toLowerCase();

      if (u && (path.endsWith(u) || path.includes(u))) return true;
      if (path.includes('pashu') && (id.includes('pashu') || id.includes('cattle'))) return true;
      if (path.includes('diabetes') && id.includes('diabetes')) return true;
      if (path.includes('weight-loss') && id.includes('weight_loss')) return true;
      if (path.includes('joint-care') && id.includes('joint_care')) return true;
      if (path.includes('womens-care') && id.includes('womens_care')) return true;
      if (path.includes('hair-care') && id.includes('hair_care')) return true;
      if (path.includes('skin-care') && id.includes('skin_care')) return true;
      if (path.includes('kids-care') && id.includes('kids_care')) return true;
      if (path.includes('home-care') && id.includes('home_care')) return true;
      if (s && path.includes(s)) return true;
      return false;
    });
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

    // 2. Merge / Fallback with active local admin edits in localStorage
    try {
      const stored = localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG');
      if (stored) {
        const localParsed = JSON.parse(stored);
        if (Array.isArray(localParsed) && localParsed.length > 0) {
          if (!serverConfigLoaded || allPages.length === 0) {
            allPages = localParsed;
          } else {
            // Merge: If local edit has newer changes in active tab session, preserve them
            localParsed.forEach(lp => {
              const sIdx = allPages.findIndex(sp => sp.id === lp.id || sp.slug === lp.slug);
              if (sIdx >= 0) {
                // If local storage has customizations, keep them merged
                allPages[sIdx] = Object.assign({}, allPages[sIdx], lp);
              } else {
                allPages.push(lp);
              }
            });
          }
        }
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

    // 2. Page Title & Meta Tags
    if (pageConfig.name || pageConfig.og_title) {
      const newTitle = pageConfig.og_title || (pageConfig.name ? `${pageConfig.name} | Aarogyam India` : '');
      if (newTitle && !document.title.includes(pageConfig.name)) {
        document.title = newTitle;
      }
    }
    if (pageConfig.og_description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute('content', pageConfig.og_description);
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', pageConfig.og_description);
    }
    if (pageConfig.og_title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', pageConfig.og_title);
    }
    if (pageConfig.og_image) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', resolveAssetSrc(pageConfig, 'og_image'));
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

  function renderDynamicHeroSlides(pageConfig) {
    if (!Array.isArray(pageConfig.hero_slides) || pageConfig.hero_slides.length === 0) return;
    const carouselContainer = document.querySelector('.bighaat-carousel-container');
    if (!carouselContainer) return;

    const validSlides = pageConfig.hero_slides.filter(s => s && (s.image || s.image_preview));
    if (validSlides.length === 0) return;

    // Remove existing slide items
    const existingSlides = carouselContainer.querySelectorAll('.home-hero-slide-item');
    existingSlides.forEach(el => el.remove());

    const isHealthPage = window.location.pathname.includes('/health/');

    validSlides.forEach((s, idx) => {
      const imgSrc = resolveAssetSrc(s, 'image', '/images/banners/kharif-master-guide-2026-hero-banner.webp');
      const slideDiv = document.createElement('div');
      slideDiv.className = 'home-hero-slide-item';
      if (idx !== 0) slideDiv.style.display = 'none';

      if (isHealthPage && (s.title || s.tag || s.subtitle)) {
        // Health Card Hero Style
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
            <div class="home-hero-3d-book" style="width:200px; height:150px; border-radius:14px; overflow:hidden; box-shadow:0 12px 28px rgba(0,0,0,0.5);">
              <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(title)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/health-banner.jpeg'" />
            </div>
          </div>
        `;
      } else {
        // Landscape Banner Style
        slideDiv.innerHTML = `
          <a href="${s.cta_link || '#'}" class="landscape-hero-banner-link" title="${escapeHtml(s.title || s.tag || '')}">
            <img src="${imgSrc}" alt="${escapeHtml(s.title || 'Hero Banner')}" class="landscape-hero-banner-img" onerror="this.onerror=null; this.src='/images/banners/kharif-master-guide-2026-hero-banner.webp';" />
          </a>
        `;
      }

      carouselContainer.appendChild(slideDiv);
    });

    const dotsContainer = document.querySelector('.bighaat-carousel-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = validSlides.map((_, i) => `<span class="bighaat-carousel-dot${i === 0 ? ' active' : ''}"></span>`).join('');
    }

    if (typeof window.initHeroCarousel === 'function') {
      try { window.initHeroCarousel(); } catch (e) {}
    }
  }

  function applySectionReorderingAndVisibility(pageConfig) {
    if (!pageConfig) return;

    // 1. Process Hidden Sections
    if (Array.isArray(pageConfig.hidden_sections) && pageConfig.hidden_sections.length > 0) {
      const sectionKeyMap = {
        'sec_ticker': ['.home-live-ticker-wrap', '#sec_ticker'],
        'sec_hero_slider': ['.home-hero-section', '#sec_hero_slider'],
        'sec_kpi_badges': ['#sec-kpi-badges', '#sec_kpi_badges'],
        'sec_category_pills': ['#sec-quick-hub', '#sec-category-pills', '.quick-hub-grid'],
        'sec_shelves_bestseller': ['.shelf-section', '#sec-bestsellers', '#sec_shelves_bestseller'],
        'sec_interspersed_marketing': ['#sec-interspersed-marketing', '#sec_interspersed_marketing'],
        'sec_combo_promo': ['#sec-combo-promo', '#sec-combo-box'],
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
          if (el) {
            el.style.display = 'none';
            break;
          }
        }
      });
    }

    // 2. Process Section Reordering for ALL pages (not just Home)
    if (Array.isArray(pageConfig.sections_order) && pageConfig.sections_order.length > 0) {
      const order = pageConfig.sections_order;
      const getSectionEl = (key) => {
        if (key === 'sec_ticker') return document.querySelector('.home-live-ticker-wrap');
        if (key === 'sec_hero_slider') return document.querySelector('.home-hero-section');
        if (key === 'sec_kpi_badges') return document.getElementById('sec-kpi-badges');
        if (key === 'sec_category_pills') return document.getElementById('sec-quick-hub') || document.querySelector('.quick-hub-grid')?.closest('section');
        if (key === 'sec_shelves_bestseller') return document.querySelector('.shelf-section');
        if (key === 'sec_combo_promo') return document.getElementById('sec-combo-box') || document.getElementById('sec-combo-promo');
        if (key === 'sec_videos') return document.getElementById('sec-video-guides') || document.getElementById('sec-videos');
        if (key === 'sec_reviews') return document.getElementById('sec-reviews-showcase') || document.getElementById('sec-reviews');
        if (key === 'sec_faqs') return document.getElementById('sec-faqs-accordion') || document.getElementById('sec-faqs');
        if (key === 'sec_health_consultation') return document.getElementById('sec-health-consultation');
        if (key === 'sec_major_crops') return document.getElementById('sec-major-crops');
        if (key === 'sec_pashu_palan') return document.getElementById('sec-pashu-palan');
        if (key === 'sec_career_business') return document.getElementById('sec-career-business');
        if (key === 'sec_achievers_showcase') return document.getElementById('sec-achievers-showcase');
        return document.getElementById(key);
      };

      const parent = document.body;
      const footer = document.querySelector('footer');

      order.forEach(secKey => {
        const el = getSectionEl(secKey);
        if (el && parent.contains(el)) {
          if (footer && parent.contains(footer)) {
            parent.insertBefore(el, footer);
          } else {
            parent.appendChild(el);
          }
        }
      });
    }
  }

  function renderDynamicKpiBadges(pageConfig) {
    if (!Array.isArray(pageConfig.kpi_cards) || pageConfig.kpi_cards.length === 0) return;
    let kpiSection = document.getElementById('sec-kpi-badges');
    if (!kpiSection) {
      kpiSection = document.createElement('section');
      kpiSection.id = 'sec-kpi-badges';
      kpiSection.style.cssText = 'padding: 24px 0; background: #ffffff; border-bottom: 1.5px solid #e2e8f0;';
      const hero = document.querySelector('.home-hero-section');
      if (hero && hero.nextSibling) {
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

    const section = document.getElementById('products-cattle') || document.getElementById('sec-products') || document.querySelector('.products-catalog-section');
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
      const offerPrice = (mrp > 0 && discount > 0) ? Math.round(mrp * (1 - discount / 100)) : mrp;
      const badge = p.badge || (isPashu ? 'आयुर्वेदिक पशु पोषण' : 'प्रमाणित हर्बल किट');
      const desc = p.description || p.dose || '';
      const pImg = resolveAssetSrc(p, 'image', '/images/banners/agriculture-banner.jpeg');

      return `
        <div style="background:#fff; border-radius:16px; border:1.5px solid #e2e8f0; padding:20px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 4px 14px rgba(0,0,0,0.03); transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div>
            ${pImg ? `<div style="width:100%; height:130px; border-radius:10px; overflow:hidden; margin-bottom:12px; background:#f8fafc; display:flex; align-items:center; justify-content:center;"><img src="${escapeHtml(pImg)}" alt="${escapeHtml(name)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/images/banners/agriculture-banner.jpeg'"></div>` : ''}
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
    const grid = document.getElementById('home-reviews-grid');
    if (!grid) return;

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
            <h4 style="font-size:0.95rem; font-weight:800; margin:0; color:#0f172a;">${escapeHtml(r.name || 'किसान मित्र')}</h4>
            <div style="font-size:0.75rem; color:#64748b;">📍 ${escapeHtml(r.location || 'भारत')}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderDynamicFaqs(pageConfig) {
    if (!Array.isArray(pageConfig.faqs) || pageConfig.faqs.length === 0) return;
    const faqContainer = document.getElementById('home-faq-accordion') || 
      document.querySelector('#sec-faqs-accordion div[style*="flex-direction"]') ||
      document.querySelector('section details')?.parentElement;
    if (!faqContainer) return;

    faqContainer.innerHTML = pageConfig.faqs.map((f, i) => `
      <details style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:16px 20px; cursor:pointer; color:#0f172a; margin-bottom:10px;" ${i === 0 ? 'open' : ''}>
        <summary style="font-weight:800; color:#2563eb; font-size:0.96rem;">${i + 1}. ${escapeHtml(f.question || f.q)}</summary>
        <p style="margin:10px 0 0 0; font-size:0.88rem; color:#475569; line-height:1.5;">${escapeHtml(f.answer || f.a)}</p>
      </details>
    `).join('');
  }

  function renderFloatingBanner(pageConfig) {
    let fbEl = document.getElementById('home-3d-floating-banner') || document.getElementById('live-3d-floating-banner');
    if (!pageConfig || !pageConfig.floating_banner || !pageConfig.floating_banner.enabled || !pageConfig.floating_banner.image) {
      if (fbEl) fbEl.style.display = 'none';
      return;
    }
    const fb = pageConfig.floating_banner;
    if (!fbEl) {
      fbEl = document.createElement('div');
      fbEl.id = 'live-3d-floating-banner';
      fbEl.style.cssText = `
        position: fixed; bottom: 85px; right: 20px; z-index: 9990;
        max-width: 140px; cursor: pointer; transition: transform 0.3s ease;
      `;
      document.body.appendChild(fbEl);
    }
    fbEl.style.display = 'block';
    const animClass = fb.animation === 'none' ? '' : 'ubl-float-3d-anim';
    const fbImg = resolveAssetSrc(fb, 'image', '/images/banners/agriculture-banner.jpeg');

    fbEl.innerHTML = `
      <a href="${fb.action_link || '#'}" style="display:block; text-decoration:none; text-align:center;">
        ${fb.badge_title ? `<div style="background:#16a34a; color:#fff; font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:10px; margin-bottom:4px; box-shadow:0 2px 8px rgba(0,0,0,0.3);">${escapeHtml(fb.badge_title)}</div>` : ''}
        <img src="${fbImg}" alt="Feature Banner" class="${animClass}" style="width:100%; border-radius:12px; box-shadow:0 12px 28px rgba(0,0,0,0.5); border:2px solid #38bdf8;" />
      </a>
    `;
  }

  function applyWhatsAppSupport(pageConfig) {
    if (!pageConfig || !pageConfig.whatsapp_support) return;
    const { number, prompt } = pageConfig.whatsapp_support;
    if (!number && !prompt) return;

    const waNum = (number || '7974422572').replace(/\D/g, '');
    const defaultText = prompt || 'नमस्ते Aarogyam India! मुझे सहायता चाहिए।';

    // Hook into global WhatsApp helper
    window.getPersonalizedWhatsAppUrl = function(customPrompt) {
      const text = customPrompt || defaultText;
      return `https://wa.me/91${waNum}?text=${encodeURIComponent(text)}`;
    };

    // Update static AI Expert links
    document.querySelectorAll('.ai-expert-red-btn, a[href*="wa.me"]').forEach(btn => {
      if (btn.tagName === 'A') {
        btn.href = `https://wa.me/91${waNum}?text=${encodeURIComponent(defaultText)}`;
      }
    });
  }

  function syncAudioNarration(pageConfig) {
    if (!pageConfig || !pageConfig.audio_script) return;
    try {
      const existing = JSON.parse(localStorage.getItem('AAROGYAM_PAGE_AUDIO_SCRIPTS') || '{}');
      const key = pageConfig.slug || (pageConfig.id ? pageConfig.id.replace(/^page_/, '') : '');
      if (key) {
        existing[key] = {
          title: pageConfig.audio_title || pageConfig.name,
          script: pageConfig.audio_script
        };
        if (key === 'index' || pageConfig.id === 'page_home') {
          existing['index'] = {
            title: pageConfig.audio_title || pageConfig.name,
            script: pageConfig.audio_script
          };
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
        renderDynamicReviews(pageConfig);
        renderDynamicFaqs(pageConfig);
        renderFloatingBanner(pageConfig);
        applyWhatsAppSupport(pageConfig);
        syncAudioNarration(pageConfig);

        // If Home Revamp is present, trigger a smooth re-hydration of lists
        if (typeof window.startHomeRevampEngine === 'function') {
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
