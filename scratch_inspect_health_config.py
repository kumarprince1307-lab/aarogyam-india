import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('data/site-pages-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)

for p in cfg.get('sitePages', []):
    pid = p.get('id', '')
    slug = p.get('slug', '')
    url = p.get('url', '')
    if 'health' in pid or 'health' in slug or 'health' in url:
        prods = p.get('products', [])
        print(f"\n================ Page: {pid} | Slug: {slug} | URL: {url} ================")
        print(f"Products count: {len(prods)}")
        for x in prods:
            print(f"  - Name: {x.get('name') or x.get('title')} | MRP: {x.get('mrp')} | Image: {x.get('image')}")
