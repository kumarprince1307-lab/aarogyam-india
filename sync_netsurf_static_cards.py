import json, re

with open('data/netsurf-products-master.json', 'r', encoding='utf-8') as f:
    master_data = json.load(f)

prods = master_data.get('products', [])
print(f"Total master products to generate: {len(prods)}")

cards_html = []
for p in prods:
    mrp = int(p.get('mrp', 0) or 0)
    disc = int(p.get('discount_pct', 0) or 0)
    offer = p.get('discounted_price') or (round(mrp * (1 - disc / 100)) if disc else (p.get('price') or mrp))
    img = p.get('image') or '/images/logo/logo.png'
    cat = p.get('category', 'all')
    sub = p.get('subcategory', '')
    cat_label = p.get('category_label', cat)
    sub_label = p.get('subcategory_label', '')
    name = p.get('name', '')
    badge = p.get('badge', '')
    desc = p.get('description', '')
    ing = p.get('ingredients', '')
    dose = p.get('dose', '')
    prec = p.get('precautions', '')

    badge_html = f'<span style="position:absolute;top:8px;left:8px;background:rgba(21,128,61,0.92);color:#fff;font-size:0.68rem;padding:3px 8px;border-radius:12px;font-weight:800;backdrop-filter:blur(4px);">{badge}</span>' if badge else ''
    sub_badge = f'<span style="font-size:0.7rem;background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:10px;font-weight:600;">{sub_label}</span>' if sub_label else ''
    disc_html = f'<span style="text-decoration:line-through;color:#94a3b8;font-size:0.85rem;">₹{mrp}</span> <span style="font-size:0.75rem;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:6px;font-weight:800;">{disc}% छूट</span>' if mrp > offer else ''
    ing_html = f'<div style="background:#f8fafc;border-left:3px solid #10b981;padding:6px 10px;border-radius:4px;margin-bottom:8px;font-size:0.76rem;color:#334155;"><strong style="color:#059669;">🌱 मुख्य घटक:</strong> {ing}</div>' if ing else ''
    dose_html = f'<div style="background:#f0fdf4;border-left:3px solid #22c55e;padding:6px 10px;border-radius:4px;margin-bottom:8px;font-size:0.76rem;color:#166534;"><strong style="color:#15803d;">📋 उपयोग व खुराक:</strong> {dose}</div>' if dose else ''
    prec_html = f'<div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:6px 10px;border-radius:4px;margin-bottom:12px;font-size:0.76rem;color:#92400e;"><strong style="color:#b45309;">⚠️ सावधानियां:</strong> {prec}</div>' if prec else ''

    wa_msg = f"नमस्ते! मुझे नेटसर्फ उत्पाद: *{name}* (MRP: ₹{mrp}, ऑफर रेट: ₹{offer}, {disc}% छूट) की जानकारी चाहिए व ऑर्डर करना है।"
    from urllib.parse import quote
    wa_url = f"https://api.whatsapp.com/send?phone=917974422572&text={quote(wa_msg)}"

    card = f"""        <div class="ns-product-card" data-product-cat="{cat}" data-product-sub="{sub}">
          <div class="ns-product-img-wrap" style="position:relative; width:100%; height:180px; max-height:190px; background:#f8fafc; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center; margin-bottom:12px; border:1px solid #e2e8f0;">
            <img src="{img}" alt="{name}" style="width:100%; height:100%; object-fit:contain; padding:8px;" onerror="this.src='/images/logo/logo.png';" loading="lazy">
            {badge_html}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px;flex-wrap:wrap;">
            <span class="ns-product-badge" style="background:#dcfce7;color:#15803d;font-size:0.72rem;padding:3px 8px;border-radius:12px;font-weight:700;">
              {cat_label}
            </span>
            {sub_badge}
          </div>
          <h3 class="ns-product-title" style="font-size:1.1rem;font-weight:800;color:#0f172a;margin:2px 0 6px 0;line-height:1.35;">{name}</h3>
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
            <span style="font-size:1.2rem;font-weight:900;color:#16a34a;">₹{offer}</span>
            {disc_html}
          </div>
          <p class="ns-product-benefits" style="font-size:0.84rem;color:#475569;margin-bottom:10px;line-height:1.45;">
            {desc}
          </p>
          {ing_html}
          {dose_html}
          {prec_html}
          <div style="margin-top:auto;padding-top:10px;">
            <a href="{wa_url}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#16a34a;color:#ffffff;font-weight:800;font-size:0.82rem;padding:9px 14px;border-radius:8px;text-decoration:none;box-shadow:0 3px 10px rgba(22,163,74,0.3);transition:all 0.2s;" onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">
              <i class="fa-brands fa-whatsapp" style="font-size:1rem;"></i>
              <span>ऑर्डर / WhatsApp पूछताछ</span>
            </a>
          </div>
        </div>"""
    cards_html.append(card)

full_grid_content = "\n\n".join(cards_html)

# Update categories/netsurf.html
with open('categories/netsurf.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace .ns-kyp-grid contents
pattern = r'(<div class="ns-kyp-grid">)(.*?)(</div>\s*</div>\s*</section>)'
m = re.search(pattern, html, re.DOTALL)
if m:
    new_html = html[:m.start(2)] + "\n" + full_grid_content + "\n      " + html[m.end(2):]
    with open('categories/netsurf.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Successfully synchronized all 37 product cards in categories/netsurf.html!")
else:
    print("Could not match .ns-kyp-grid in categories/netsurf.html!")
