import json, sys
sys.stdout.reconfigure(encoding='utf-8')

# Load master products
master = json.load(open('data/netsurf-products-master.json', encoding='utf-8'))
master_prods = master.get('products', [])
print(f"Master products: {len(master_prods)}")

# Load site-pages-config
with open('data/site-pages-config.json', 'r', encoding='utf-8') as f:
    config = json.load(f)

sp = config.get('sitePages', [])

# Find netsurf career page
ns_idx = next((i for i, p in enumerate(sp) if p.get('id') == 'page_netsurf_career'), None)
if ns_idx is None:
    print("ERROR: page_netsurf_career not found!")
    sys.exit(1)

print(f"Found page_netsurf_career at index {ns_idx}")
print(f"Current products count: {len(sp[ns_idx].get('products', []))}")

# Populate all master products into netsurf career page
sp[ns_idx]['products'] = master_prods

print(f"Updated products count: {len(sp[ns_idx]['products'])}")

# Save back
with open('data/site-pages-config.json', 'w', encoding='utf-8') as f:
    json.dump(config, f, ensure_ascii=False, indent=2)

print("DONE: site-pages-config.json updated with all 37 master products in page_netsurf_career")
