/* ==========================================================================
   AAROGYAM INDIA — CROSS-SITE BUNDLE POPUP & SAKHI AI PROMOTER (V2)
   Automatically displays high-converting floating combo popups based on
   Admin timer & page targeting settings, and exposes recommendation cards for Sakhi AI.
   ========================================================================== */

(function () {
  'use strict';

  // Do not show popup on checkout, payment or admin pages or bundle page itself
  const path = window.location.pathname.toLowerCase();
  if (path.includes('checkout') || path.includes('payment') || path.includes('admin') || path.includes('bundle.html')) {
    return;
  }

  // Session check to avoid annoying user repeatedly in same session
  if (sessionStorage.getItem('AI_BUNDLE_POPUP_DISMISSED')) {
    return;
  }

  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const bundle = await getActiveBundle();
      if (!bundle || bundle.popupEnabled === false) return;

      // Page Targeting Check
      if (!isPageTargetMatched(bundle.popupTargets)) {
        return;
      }

      const delayMs = (Number(bundle.popupDelaySeconds) || 15) * 1000;
      setTimeout(() => {
        showBundlePopup(bundle);
      }, delayMs);
    } catch (_) { }
  });

  function isPageTargetMatched(targets) {
    if (!Array.isArray(targets) || targets.length === 0) {
      return true; // Default: show on standard pages
    }

    const currentPath = window.location.pathname.toLowerCase();

    for (const t of targets) {
      if (t === 'home' && (currentPath === '/' || currentPath.endsWith('index.html') || currentPath === '')) return true;
      if (t === 'library' && (currentPath.includes('library') || currentPath.includes('my-books'))) return true;
      if (t === 'books' && (currentPath.includes('book-landing') || currentPath.includes('/ebooks/'))) return true;
      if (t === 'tube' && (currentPath.includes('tube') || currentPath.includes('webinar'))) return true;
      if (t === 'health' && (currentPath.includes('health') || currentPath.includes('disease') || currentPath.includes('category'))) return true;
    }

    return false;
  }

  async function getActiveBundle() {
    try {
      const local = JSON.parse(localStorage.getItem('AAROGYAM_BUNDLE_LANDING_PAGES') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        const act = local.find(b => b.status === 'active' && b.popupEnabled !== false);
        if (act) return act;
      }
    } catch (_) { }

    try {
      const db = window.dbClient || window.supabase;
      if (db) {
        const { data } = await db.from('site_configs').select('value').eq('key', 'AAROGYAM_BUNDLE_LANDING_PAGES').maybeSingle();
        if (data && data.value) {
          const list = Array.isArray(data.value) ? data.value : JSON.parse(data.value || '[]');
          return list.find(b => b.status === 'active' && b.popupEnabled !== false) || null;
        }
      }
    } catch (_) { }

    try {
      const resp = await fetch('/data/book-bundles.json?v=' + Date.now());
      if (resp.ok) {
        const data = await resp.json();
        const list = data.bundles || data || [];
        return list.find(b => b.status === 'active' && b.popupEnabled !== false) || null;
      }
    } catch (_) { }

    return null;
  }

  function showBundlePopup(bundle) {
    if (document.getElementById('aiBundleFloatingPopup')) return;

    const popup = document.createElement('div');
    popup.id = 'aiBundleFloatingPopup';
    popup.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 350px;
      width: calc(100% - 40px);
      background: linear-gradient(145deg, #0f172a, #1e293b);
      border: 2px solid #10b981;
      border-radius: 16px;
      padding: 14px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 20px rgba(16,185,129,0.25);
      z-index: 999999;
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideUpBundlePopup 0.35s ease;
    `;

    const bookCount = (bundle.bookIds || []).length;
    const finalPrice = bundle.offerPrice || 199;
    const mrp = bundle.mrp || 1196;
    const targetUrl = `/bundle.html?id=${encodeURIComponent(bundle.id)}`;

    const popupTitle = bundle.popupTitle || bundle.title || 'महाबचत ई-बुक कॉम्बो बंडल';
    const popupSubtitle = bundle.popupSubtitle || bundle.subtitle || `${bookCount} मास्टर गाइड्स एक साथ विशेष छूट पर!`;
    const popupCta = bundle.popupCtaText || `🛒 पूरा कॉम्बो ₹${finalPrice} में अनलॉक करें`;
    const popupImg = bundle.popupImage || bundle.bannerImage || bundle.ogImage || '/images/books/kharif-master-guide-2026-cover.webp';

    popup.innerHTML = `
      <style>
        @keyframes slideUpBundlePopup {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="background:rgba(245,158,11,0.2); color:#fbbf24; font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #f59e0b;">
          ${escapeHtml(bundle.badge || '🎁 विशेष कॉम्बो ऑफर')}
        </span>
        <button type="button" id="btnCloseBundlePopup" style="background:transparent; border:none; color:#94a3b8; font-size:1.1rem; cursor:pointer; line-height:1; padding:2px;" title="बंद करें">✕</button>
      </div>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
        <img src="${popupImg}" alt="Combo" style="width:55px; height:74px; border-radius:6px; object-fit:cover; border:1px solid rgba(255,255,255,0.2); flex-shrink:0;" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp';" />
        <div style="min-width:0; flex:1;">
          <h4 style="margin:0 0 4px 0; font-size:0.92rem; font-weight:800; color:#fff; line-height:1.25; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
            ${escapeHtml(popupTitle)}
          </h4>
          <p style="margin:0 0 4px 0; font-size:0.75rem; color:#94a3b8; line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${escapeHtml(popupSubtitle)}
          </p>
          <div style="display:flex; align-items:baseline; gap:6px;">
            <span style="text-decoration:line-through; color:#ef4444; font-size:0.78rem;">₹${mrp}</span>
            <span style="color:#10b981; font-weight:900; font-size:1.05rem;">₹${finalPrice}</span>
            <span style="color:#fbbf24; font-size:0.7rem; font-weight:800;">(बचत ₹${Math.max(0, mrp - finalPrice)})</span>
          </div>
        </div>
      </div>
      <a href="${targetUrl}" style="display:flex; align-items:center; justify-content:center; gap:6px; background:linear-gradient(135deg, #10b981, #059669); color:#fff; text-decoration:none; font-weight:900; font-size:0.85rem; padding:8px 12px; border-radius:8px; box-shadow:0 4px 12px rgba(16,185,129,0.4); text-align:center;">
        ${escapeHtml(popupCta)} →
      </a>
    `;

    document.body.appendChild(popup);

    document.getElementById('btnCloseBundlePopup')?.addEventListener('click', () => {
      popup.remove();
      sessionStorage.setItem('AI_BUNDLE_POPUP_DISMISSED', '1');
    });
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

})();
