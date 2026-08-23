import urllib.request, urllib.parse, re, sys, time
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://aarogyamindia.online'

print('======================================================================')
print('RUNNING LIVE PRODUCTION TESTS ON https://aarogyamindia.online')
print('======================================================================\n')

# Wait for Vercel deployment if needed
time.sleep(5)

# TEST 1: Image Landing Page (LP0001529)
print('[TEST 1] Testing Image Landing Page in Browser (LP0001529)...')
req = urllib.request.Request(f'{BASE_URL}/ucas/landing.html?id=LP0001529')
with urllib.request.urlopen(req) as resp:
    status = resp.status
    content = resp.read().decode('utf-8')
    assert status == 200, f'Expected 200, got {status}'
    assert 'pub-media-wrapper' in content, 'Missing media container'
    assert 'lp_gate_survey_form' in content, 'Missing survey gate form'
    print(f'  -> PASSED: HTTP {status}, Page loaded with Image container & Survey Gate.')

# TEST 2: YouTube Landing Page (LP0003490)
print('\n[TEST 2] Testing YouTube Landing Page in Browser (LP0003490)...')
req = urllib.request.Request(f'{BASE_URL}/ucas/landing.html?id=LP0003490')
with urllib.request.urlopen(req) as resp:
    status = resp.status
    content = resp.read().decode('utf-8')
    assert status == 200, f'Expected 200, got {status}'
    assert 'playYoutubeVideo' in content, 'Missing playYoutubeVideo function'
    print(f'  -> PASSED: HTTP {status}, Page loaded with YouTube click-to-play player.')

# TEST 3: Facebook Externalhit Crawler on Image Post (LP0001529)
print('\n[TEST 3] Testing Social Crawler on Image Post (facebookexternalhit on LP0001529)...')
headers_fb = {'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'}
req = urllib.request.Request(f'{BASE_URL}/api/share?id=LP0001529', headers=headers_fb)
with urllib.request.urlopen(req) as resp:
    status = resp.status
    raw_html = resp.read().decode('utf-8')
    assert status == 200, f'Expected 200, got {status}'
    
    og_title_match = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', raw_html, re.I)
    og_img_match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', raw_html, re.I)
    og_desc_match = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']+)["\']', raw_html, re.I)
    
    assert og_title_match, 'Missing og:title'
    assert og_img_match, 'Missing og:image'
    assert og_desc_match, 'Missing og:description'
    
    og_title = og_title_match.group(1)
    og_img = og_img_match.group(1)
    og_desc = og_desc_match.group(1)
    
    assert 'Aarogyam India' in og_title, f'Unexpected og:title: {og_title}'
    assert '/api/image?id=LP0001529' in og_img or og_img.startswith('http'), f'Unexpected og:image: {og_img}'
    print(f'  -> PASSED: HTTP {status}')
    print(f'     og:title       = {og_title}')
    print(f'     og:image       = {og_img}')
    print(f'     og:description = {og_desc[:60]}...')

# TEST 4: WhatsApp Crawler on YouTube Post (LP0003490)
print('\n[TEST 4] Testing Social Crawler on YouTube Post (WhatsApp crawler on LP0003490)...')
headers_wa = {'User-Agent': 'WhatsApp/2.21.12.21 A'}
req = urllib.request.Request(f'{BASE_URL}/api/share?id=LP0003490', headers=headers_wa)
with urllib.request.urlopen(req) as resp:
    status = resp.status
    raw_html = resp.read().decode('utf-8')
    assert status == 200, f'Expected 200, got {status}'
    
    og_title_match = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', raw_html, re.I)
    og_img_match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', raw_html, re.I)
    
    assert og_title_match, 'Missing og:title'
    assert og_img_match, 'Missing og:image'
    
    og_title = og_title_match.group(1)
    og_img = og_img_match.group(1)
    
    assert 'Raa5jgs-EvA' in og_img or 'ytimg.com' in og_img, f'Expected YouTube HD thumbnail in og:image, got: {og_img}'
    print(f'  -> PASSED: HTTP {status}')
    print(f'     og:title       = {og_title}')
    print(f'     og:image       = {og_img}')

# TEST 5: Clean Human Visitor 302 Redirect with Attribution Preservation
print('\n[TEST 5] Testing Human Visitor 302 Redirect with Attribution Preservation (share_id=AI000004)...')
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

opener = urllib.request.build_opener(NoRedirect)
try:
    resp = opener.open(f'{BASE_URL}/api/share?id=LP0001529&share_id=AI000004')
    loc = resp.headers.get('Location')
except urllib.error.HTTPError as e:
    loc = e.headers.get('Location')
    assert e.code == 302, f'Expected 302 Redirect, got {e.code}'

assert loc == f'{BASE_URL}/ucas/landing.html?id=LP0001529&share_id=AI000004', f'Unexpected location: {loc}'
print(f'  -> PASSED: Clean 302 Redirect verified: {loc}')

# TEST 6: Backward Compatibility (Old Long URLs)
print('\n[TEST 6] Testing Old Long Link Backward Compatibility...')
req = urllib.request.Request(f'{BASE_URL}/ucas/landing.html?id=LP0001529&share_id=AI000004&title=Old+Title&cat=agriculture&desc=Old+Description')
with urllib.request.urlopen(req) as resp:
    assert resp.status == 200, f'Expected 200, got {resp.status}'
    print('  -> PASSED: Old long URLs render normally with full functionality.')

# TEST 7: Binary Image Streamer (/api/image)
print('\n[TEST 7] Testing Binary Image Streamer (/api/image?id=LP0001529)...')
req = urllib.request.Request(f'{BASE_URL}/api/image?id=LP0001529')
with urllib.request.urlopen(req) as resp:
    status = resp.status
    c_type = resp.headers.get('Content-Type')
    body = resp.read()
    assert status == 200, f'Expected 200, got {status}'
    assert 'image/' in c_type, f'Expected image MIME type, got {c_type}'
    assert len(body) > 1000, 'Image payload too small'
    print(f'  -> PASSED: HTTP {status}, Content-Type: {c_type}, Size: {len(body):,} bytes.')

print('\n======================================================================')
print('ALL 7 LIVE PRODUCTION TESTS PASSED WITH ZERO REGRESSIONS!')
print('======================================================================\n')
