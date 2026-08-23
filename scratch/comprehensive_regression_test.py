# Comprehensive Pre-Deployment Regression Test Suite
import urllib.request, urllib.parse, json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co'
SUPABASE_ANON_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU'

headers_supabase = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
}

print('======================================================================')
print('RUNNING UCAS V1 COMPREHENSIVE REGRESSION SUITE')
print('======================================================================\n')

# TEST 1: Database OG Columns Verification
print('[TEST 1] Verifying Supabase landing_pages schema has og columns...')
req = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/landing_pages?limit=1', headers=headers_supabase)
with urllib.request.urlopen(req) as resp:
    cols = list(json.loads(resp.read().decode('utf-8'))[0].keys())
    assert 'og_title' in cols, 'Missing og_title'
    assert 'og_description' in cols, 'Missing og_description'
    assert 'og_image_url' in cols, 'Missing og_image_url'
    print('  -> PASSED: og_title, og_description, og_image_url verified in DB schema.')

# TEST 2: Image Post DB Record (LP0001529)
print('\n[TEST 2] Verifying Image Post Data (LP0001529)...')
req = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/landing_pages?id=eq.LP0001529', headers=headers_supabase)
with urllib.request.urlopen(req) as resp:
    rows = json.loads(resp.read().decode('utf-8'))
    assert len(rows) > 0, 'LP0001529 not found in DB'
    lp = rows[0]
    assert lp['content_type'] == 'image', f'Expected image, got {lp["content_type"]}'
    print(f'  -> PASSED: LP0001529 verified as image post with title "{lp["title"]}".')

# TEST 3: YouTube Post DB Record (LP0003490)
print('\n[TEST 3] Verifying YouTube Post Data (LP0003490)...')
req = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/landing_pages?id=eq.LP0003490', headers=headers_supabase)
with urllib.request.urlopen(req) as resp:
    rows = json.loads(resp.read().decode('utf-8'))
    assert len(rows) > 0, 'LP0003490 not found in DB'
    lp = rows[0]
    assert 'youtube.com' in lp['media_url'] or 'youtu.be' in lp['media_url'], 'media_url must be YouTube URL'
    assert not lp['media_url'].endswith('.jpg'), 'media_url MUST NOT be thumbnail image'
    print(f'  -> PASSED: LP0003490 media_url is pure video URL "{lp["media_url"]}".')

# TEST 4: Surveys & Attribution Schema
print('\n[TEST 4] Verifying surveys table schema for lead attribution...')
req = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/surveys?limit=1', headers=headers_supabase)
with urllib.request.urlopen(req) as resp:
    cols = list(json.loads(resp.read().decode('utf-8'))[0].keys())
    assert 'profile_id' in cols, 'Missing profile_id in surveys'
    assert 'category_answers' in cols, 'Missing category_answers in surveys'
    assert 'mobile' in cols, 'Missing mobile in surveys'
    assert 'name' in cols, 'Missing name in surveys'
    print('  -> PASSED: surveys schema verified with profile_id, name, mobile, category_answers.')

print('\n======================================================================')
print('PRE-FLIGHT DATABASE & SCHEMA INTEGRITY TESTS 100% PASSED!')
print('======================================================================\n')
