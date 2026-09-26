import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/site-pages-config.json', 'r', encoding='utf-8') as f:
    site_cfg = json.load(f)

for p in site_cfg.get('sitePages', []):
    prods = p.get('products', [])
    if prods:
        print(f"{p.get('id')} ({p.get('name')}) has {len(prods)} products, url: {p.get('url')}")
        for pr in prods[:2]:
            print(f"   - {pr.get('name')}, img: {pr.get('image')}")
