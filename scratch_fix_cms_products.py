import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/live-page-cms-bridge.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the renderDynamicProducts function
start_marker = '  function renderDynamicProducts(pageConfig) {'
end_marker = '  function renderDynamicReviews'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f"ERROR: Could not find markers. start={start_idx}, end={end_idx}")
    exit(1)

print(f"Found renderDynamicProducts at {start_idx} to {end_idx}")

old_func = content[start_idx:end_idx]
print(f"Old function length: {len(old_func)} chars")

new_func = '''  function renderDynamicProducts(pageConfig) {
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

    // Inject responsive product grid CSS once
    if (!document.getElementById('cms-products-responsive-style')) {
      const st = document.createElement('style');
      st.id = 'cms-products-responsive-style';
      st.textContent = `
        .cms-products-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
        }
        @media (min-width: 480px) {
          .cms-products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
        }
        @media (min-width: 640px) {
          .cms-products-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important; gap: 16px !important; }
        }
        @media (min-width: 768px) {
          .cms-products-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important; gap: 20px !important; }
        }
        .cms-product-img-wrap {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          box-sizing: border-box;
        }
        .cms-product-img-wrap img {
          width: 100%;
          height: auto;
          max-height: 160px;
          object-fit: contain;
          display: block;
        }
        @media (min-width: 640px) {
          .cms-product-img-wrap img { max-height: 180px; }
        }
        .cms-product-card { display: flex; flex-direction: column; justify-content: space-between; }
        .product-order-toggle-btn {
          width: 100%;
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 10px 10px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.2s;
          margin-top: 10px;
        }
        .product-order-toggle-btn:hover { background: #1d4ed8; }
        .product-order-toggle-btn.selected { background: #16a34a; }
      `;
      document.head.appendChild(st);
    }

    // Apply responsive grid class to the grid element
    if (!grid.classList.contains('cms-products-grid')) {
      grid.classList.add('cms-products-grid');
    }
    // Remove any inline grid styles that override responsive CSS
    if (grid.style.gridTemplateColumns) grid.style.gridTemplateColumns = '';
    if (grid.style.display) grid.style.display = '';

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
        <div class="cms-product-card" style="background:#fff; border-radius:16px; border:1.5px solid #e2e8f0; padding:14px; box-shadow:0 4px 14px rgba(0,0,0,0.03); transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div>
            ${hasRealImg ? `<div class="cms-product-img-wrap"><img src="${escapeHtml(rawImg)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>` : ''}
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:4px;">
              <span style="background:#fef08a; color:#854d0e; font-weight:800; font-size:0.7rem; padding:2px 8px; border-radius:8px; white-space:nowrap;">${escapeHtml(badge)}</span>
              <div style="text-align:right;">
                <span style="font-size:1.05rem; font-weight:900; color:${primaryColor};">&#x20B9;${offerPrice || mrp}</span>
                ${discount > 0 ? `<span style="font-size:0.72rem; text-decoration:line-through; color:#94a3b8; margin-left:4px;">&#x20B9;${mrp}</span>` : ''}
              </div>
            </div>
            <h4 style="font-size:0.95rem; font-weight:900; color:#0f172a; margin:0 0 6px 0; line-height:1.35;">${escapeHtml(name)}</h4>
            ${desc ? `<p style="font-size:0.78rem; color:#64748b; line-height:1.45; margin-bottom:10px;">${escapeHtml(desc)}</p>` : ''}
          </div>
          <button type="button" class="product-order-toggle-btn" onclick="window.toggleProductSelection ? window.toggleProductSelection(this, '${escapeHtml(id)}', '${escapeHtml(name)}', ${offerPrice || mrp}) : (window.toggleProductOrder && window.toggleProductOrder('${escapeHtml(id)}', '${escapeHtml(name)}', ${offerPrice || mrp}, ${mrp}, this))">
            <i class="fa-solid fa-cart-plus"></i> ऑर्डर जोड़ें
          </button>
        </div>
      `;
    }).join('');

    if (typeof window.syncPageButtonStates === 'function') {
      window.syncPageButtonStates();
    }
  }

  '''

content = content[:start_idx] + new_func + content[end_idx:]

with open('js/live-page-cms-bridge.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"DONE: renderDynamicProducts updated successfully!")
print(f"New content length: {len(content)}")
