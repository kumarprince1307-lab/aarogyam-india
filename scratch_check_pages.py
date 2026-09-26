import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('data/site-pages-config.json', encoding='utf-8'))
sp = data.get('sitePages', [])
print(f"Total sitePages: {len(sp)}")
for i, p in enumerate(sp):
    print(f"[{i+1}] id={p.get('id')} | slug={p.get('slug')} | name={p.get('name')} | category={p.get('category')}")

# Check if netsurf career page exists
ns_pages = [p for p in sp if 'netsurf' in (p.get('id','') + p.get('slug','')).lower()]
print(f"\nNetsurf pages: {len(ns_pages)}")
for p in ns_pages:
    print(f"  id={p.get('id')} | netsurf_plan={p.get('netsurf_plan')}")
    if p.get('products'):
        prods = p.get('products', [])
        print(f"  products count: {len(prods)}")
