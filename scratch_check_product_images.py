import sys, json
sys.stdout.reconfigure(encoding='utf-8')

master = json.load(open('data/netsurf-products-master.json', encoding='utf-8'))
prods = master.get('products', [])

print(f"Total: {len(prods)} products")
no_img = []
has_logo = []
has_real = []

for p in prods:
    img = p.get('image', '')
    if not img:
        no_img.append(p.get('name','')[:40])
    elif 'logo' in img.lower():
        has_logo.append({'name': p.get('name','')[:40], 'img': img})
    else:
        has_real.append(p.get('name','')[:40])

print(f"\nNo image: {len(no_img)}")
for n in no_img[:10]:
    print(f"  - {n}")

print(f"\nHas logo.png: {len(has_logo)}")
for p in has_logo[:10]:
    print(f"  - {p['name']}: {p['img']}")

print(f"\nHas real image: {len(has_real)}")
for n in has_real[:5]:
    print(f"  - {n}")
