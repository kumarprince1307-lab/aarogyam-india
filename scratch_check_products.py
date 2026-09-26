import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('data/site-pages-config.json', encoding='utf-8'))
sp = data.get('sitePages', [])

# Check netsurf career page products
ns_page = next((p for p in sp if p.get('id') == 'page_netsurf_career'), None)
if ns_page:
    prods = ns_page.get('products', [])
    print(f"Netsurf career page products count: {len(prods)}")
    for i, p in enumerate(prods):
        print(f"  [{i+1}] id={p.get('id')} | name={p.get('name')} | cat={p.get('category')}")
else:
    print("page_netsurf_career NOT FOUND in site-pages-config.json")

# Check master products
master = json.load(open('data/netsurf-products-master.json', encoding='utf-8'))
master_prods = master.get('products', [])
print(f"\nMaster products count: {len(master_prods)}")
for i, p in enumerate(master_prods):
    print(f"  [{i+1}] id={p.get('id')} | name={p.get('name')} | cat={p.get('category')}")
