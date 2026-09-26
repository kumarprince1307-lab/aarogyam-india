import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('data/netsurf-products-master.json', 'r', encoding='utf-8') as f:
    master_data = json.load(f)

prods = master_data.get('products', [])
print(f"=== Total products in netsurf-products-master.json: {len(prods)} ===")
for i, p in enumerate(prods):
    print(f"[{i+1}] {p.get('id')} | {p.get('name')} | Cat: {p.get('category')} / {p.get('subcategory')} | Img: {p.get('image')}")
