import json, os, glob, sys
sys.stdout.reconfigure(encoding='utf-8')

print("=== RECENT IMAGES IN WORKSPACE ===")
img_files = glob.glob('images/**/*.*', recursive=True)
img_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
for f in img_files[:30]:
    print(f"{f} -> {os.path.getsize(f)} bytes")

print("\n=== PRODUCTS IN SITE-PAGES-CONFIG ===")
d = json.load(open('data/site-pages-config.json', encoding='utf-8'))
for pg in d.get('sitePages', []):
    prods = pg.get('products', [])
    if prods:
        print(f"\nPage: {pg.get('id')} ({len(prods)} products)")
        for p in prods:
            print(f"  ID: {p.get('id')} | Name: {p.get('name')} | Price: {p.get('price')} | Image: {p.get('image')}")
            if p.get('desc') or p.get('description'):
                print(f"    Desc: {p.get('desc') or p.get('description')}")
            if p.get('ingredients'):
                print(f"    Ingr: {p.get('ingredients')}")
            if p.get('dosage'):
                print(f"    Dosage: {p.get('dosage')}")
            if p.get('precautions'):
                print(f"    Prec: {p.get('precautions')}")
