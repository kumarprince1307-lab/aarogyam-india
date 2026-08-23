import urllib.request, re, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://aarogyamindia.online'

print('=== TESTING FACEBOOK CRAWLER SIMULATION WITH LIVE IDS ===\n')
headers_fb = {'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'}

for lp_id in ['LP0003659', 'LP0005722', 'LP0002231']:
    url = f'{BASE_URL}/api/share?id={lp_id}&share_id=AI000004'
    req = urllib.request.Request(url, headers=headers_fb)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        assert resp.status == 200, f'Expected 200, got {resp.status}'
        assert 'http-equiv="refresh"' not in html, 'Found unwanted meta refresh!'
        
        og_title = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html).group(1)
        og_img = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html).group(1)
        og_url = re.search(r'<meta\s+property=["\']og:url["\']\s+content=["\']([^"\']+)["\']', html).group(1)
        
        print(f'LP: {lp_id}')
        print(f'  og:title = {og_title}')
        print(f'  og:image = {og_img}')
        print(f'  og:url   = {og_url}')
        print('  Meta Refresh present? NO (Clean 200 OK without Scraper Redirection!)\n')

print('ALL LIVE CRAWLER TESTS PASSED!')
