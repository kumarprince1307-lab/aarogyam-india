import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/live-page-cms-bridge.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_css_block = '''    // Inject mobile-responsive product CSS once
    if (!document.getElementById('cms-products-responsive-style')) {
      const st = document.createElement('style');
      st.id = 'cms-products-responsive-style';
      st.textContent = `
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
        @media (max-width: 639px) {
          #sec-products .container > div[style*="grid"],
          #sec-products .container .products-grid,
          #products-cattle .container > div[style*="grid"] {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .cms-product-img-wrap img { max-height: 120px; }
        }
        .cms-product-card { display: flex; flex-direction: column; justify-content: space-between; }
      `;
      document.head.appendChild(st);
    }'''

new_css_block = '''    // Inject product image CSS once (safe - no !important overrides)
    if (!document.getElementById('cms-products-responsive-style')) {
      const st = document.createElement('style');
      st.id = 'cms-products-responsive-style';
      st.textContent = `
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
        .cms-product-card { display: flex; flex-direction: column; justify-content: space-between; }
      `;
      document.head.appendChild(st);
    }'''

if old_css_block in content:
    content = content.replace(old_css_block, new_css_block)
    print("CSS block replaced successfully!")
else:
    print("ERROR: Old CSS block not found!")
    # Show what's there
    idx = content.find('cms-products-responsive-style')
    print(f"Found at: {idx}")
    print(repr(content[max(0,idx-50):idx+500]))

with open('js/live-page-cms-bridge.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Done. File size: {len(content)}")
