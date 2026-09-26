import glob, re, os

for f in sorted(glob.glob('health/*.html')):
    content = open(f, encoding='utf-8').read()
    print(f"\n==================== {f} ====================")
    sec_match = re.search(r'<section[^>]*id=["\']sec-products["\'][^>]*>(.*?)</section>', content, re.DOTALL | re.IGNORECASE)
    if sec_match:
        sec_text = sec_match.group(0)
        print(f"Length of sec-products: {len(sec_text)} chars")
        # Print grid container style
        grids = re.findall(r'<div[^>]*grid[^>]*>', sec_text, re.IGNORECASE)
        for g in grids:
            print("  Grid container:", g)
        # Check products inside
        cards = re.findall(r'<div[^>]*border-radius:\s*16px[^>]*>', sec_text, re.IGNORECASE)
        print(f"  Product cards found in static HTML: {len(cards)}")
        # Check img tags
        imgs = re.findall(r'<img[^>]*>', sec_text, re.IGNORECASE)
        print(f"  Img tags found: {len(imgs)}")
        for img in imgs:
            print("    ", img[:100])
    else:
        print("  NO <section id='sec-products'> FOUND!")
