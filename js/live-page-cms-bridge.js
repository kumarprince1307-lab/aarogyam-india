/**
 * ====================================================================
 * AAROGYAM INDIA - LIVE PAGE CMS BRIDGE & DYNAMIC CATALOG SYNCHRONIZER
 * ====================================================================
 * Connects live customer-facing pages (pashu-palan.html, health/*.html, etc.)
 * directly to the Admin Page Editor CMS data in localStorage & site-pages-config.json.
 * 
 * Features:
 * - Dynamic product rendering with custom prices, names, badges & descriptions
 * - Seamless integration with WhatsApp Cart & Dual Order System
 * - 3D Floating Action Banner rendering
 * - Backward compatible fallback to hardcoded HTML if offline or unconfigured
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

  function getPageMatch(allPages) {
    if (!Array.isArray(allPages) || allPages.length === 0) return null;
    const path = window.location.pathname.toLowerCase();
    
    // Exact or suffix matches
    return allPages.find(p => {
      const u = (p.url || '').toLowerCase();
      const s = (p.slug || '').toLowerCase();
      const id = (p.id || '').toLowerCase();

      if (path.endsWith(u) || (u && path.includes(u))) return true;
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
    // 1. Check localStorage first (instant local admin changes reflection)
    try {
      const stored = localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allPages = parsed;
        }
      }
    } catch (e) {}

    // 2. If no local storage or empty, fetch site-pages-config.json
    if (!allPages || allPages.length === 0) {
      const paths = [
        '../data/site-pages-config.json',
        '/data/site-pages-config.json',
        './data/site-pages-config.json'
      ];
      for (const p of paths) {
        try {
          const res = await fetch(p + '?v=' + Math.floor(Date.now() / 60000));
          if (res.ok) {
            const j = await res.json();
            if (j && Array.isArray(j.sitePages) && j.sitePages.length > 0) {
              allPages = j.sitePages;
              break;
            }
          }
        } catch (err) {}
      }
    }
    return allPages;
  }

  function renderDynamicProducts(pageConfig) {
    if (!pageConfig || !Array.isArray(pageConfig.products) || pageConfig.products.length === 0) {
      return; // Keep hardcoded HTML fallback intact
    }

    // Find products container: either in #products-cattle or in #sec-products
    const section = document.getElementById('products-cattle') || document.getElementById('sec-products');
    if (!section) return;

    // Find grid container inside section
    const container = section.querySelector('.container');
    if (!container) return;

    const grid = container.querySelector('div[style*="grid"]') || container.children[1];
    if (!grid) return;

    const prods = pageConfig.products;
    const isPashu = window.location.pathname.includes('pashu');
    const primaryColor = isPashu ? '#15803d' : '#2563eb';

    grid.innerHTML = prods.map((p, idx) => {
      const id = p.id || `PROD_${idx + 1}`;
      const name = p.name || p.title || 'आरोग्यम उत्पाद';
      const mrp = Number(p.mrp || p.price || 0);
      const discount = Number(p.discount_pct || 0);
      const offerPrice = (mrp > 0 && discount > 0) ? Math.round(mrp * (1 - discount / 100)) : mrp;
      const badge = p.badge || (isPashu ? 'आयुर्वेदिक पशु पोषण' : 'प्रमाणित हर्बल किट');
      const desc = p.description || p.dose || '';

      return `
        <div style="background:#fff; border-radius:16px; border:1.5px solid #e2e8f0; padding:20px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 4px 14px rgba(0,0,0,0.03); transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div>
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

    // Re-synchronize Cart state
    if (typeof window.syncPageButtonStates === 'function') {
      window.syncPageButtonStates();
    }
  }

  function renderFloatingBanner(pageConfig) {
    if (!pageConfig || !pageConfig.floating_banner || !pageConfig.floating_banner.enabled || !pageConfig.floating_banner.image) {
      return;
    }
    const fb = pageConfig.floating_banner;
    let fbEl = document.getElementById('home-3d-floating-banner') || document.getElementById('live-3d-floating-banner');
    if (!fbEl) {
      fbEl = document.createElement('div');
      fbEl.id = 'live-3d-floating-banner';
      fbEl.style.cssText = `
        position: fixed; bottom: 85px; right: 20px; z-index: 9990;
        max-width: 140px; cursor: pointer; transition: transform 0.3s ease;
      `;
      document.body.appendChild(fbEl);
    }
    const animClass = fb.animation === 'none' ? '' : 'ubl-float-3d-anim';
    fbEl.innerHTML = `
      <a href="${fb.action_link || '#'}" style="display:block; text-decoration:none; text-align:center;">
        ${fb.badge_title ? `<div style="background:#16a34a; color:#fff; font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:10px; margin-bottom:4px; box-shadow:0 2px 8px rgba(0,0,0,0.3);">${escapeHtml(fb.badge_title)}</div>` : ''}
        <img src="${fb.image}" alt="Feature Banner" class="${animClass}" style="width:100%; border-radius:12px; box-shadow:0 12px 28px rgba(0,0,0,0.5); border:2px solid #38bdf8;" />
      </a>
    `;
  }

  async function initLiveCmsBridge() {
    try {
      const allPages = await loadConfigData();
      const pageConfig = getPageMatch(allPages);
      if (pageConfig) {
        renderDynamicProducts(pageConfig);
        renderFloatingBanner(pageConfig);
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
