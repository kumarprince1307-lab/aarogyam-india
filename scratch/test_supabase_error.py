import urllib.request
import json

SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"

def test_query(param):
    url = f"{SUPABASE_URL}/rest/v1/profiles?select=id,full_name,mobile,referred_by&{param}"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"SUCCESS for '{param}': {len(data)} rows")
    except urllib.error.HTTPError as e:
        print(f"HTTP ERROR for '{param}': {e.code} - {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"ERROR for '{param}': {e}")

# Test 1: with UUID
test_query("referred_by=eq.52ef705c-bb45-4137-bee4-a3f8df73b676")

# Test 2: with Share ID string AI000004
test_query("referred_by=eq.AI000004")

# Test 3: with .or(referred_by.eq.UUID,referred_by.eq.AI000004)
test_query("or=(referred_by.eq.52ef705c-bb45-4137-bee4-a3f8df73b676,referred_by.eq.AI000004)")
