import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('data/netsurf-products-master.json', encoding='utf-8'))
products = data.get('products', [])
for i, p in enumerate(products[:20]):
    print(f"\n[{i+1}] ID: {p.get('id')} | Name: {p.get('name')}")
    print(f"    Image: {p.get('image')}")
    print(f"    Price: MRP {p.get('mrp')} | Net: {p.get('price')} | Disc: {p.get('discount')}%")
    print(f"    Desc: {p.get('description')}")
    print(f"    Ingr: {p.get('ingredients')}")
    print(f"    Dosage: {p.get('dosage')}")
    print(f"    Prec: {p.get('precautions')}")
