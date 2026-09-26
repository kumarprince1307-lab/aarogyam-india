import json, sys
sys.stdout.reconfigure(encoding='utf-8')

pages = json.load(open('data/site-pages-config.json', encoding='utf-8'))['sitePages']
for p in pages:
    pid = p.get('id', '')
    url = p.get('url', '')
    name = p.get('name', '')
    cat = p.get('category', '')
    if 'netsurf' in pid.lower() or 'career' in pid.lower() or 'netsurf' in url.lower() or 'career' in cat.lower() or 'netsurf' in name.lower():
        print(f"MATCH: ID: {pid} | Name: {name} | Cat: {cat} | URL: {url} | Keys: {list(p.keys())}")
