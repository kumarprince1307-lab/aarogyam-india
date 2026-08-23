import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"

def query_supabase(path):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return True, data
    except Exception as e:
        return False, str(e)

profile_id = "52ef705c-bb45-4137-bee4-a3f8df73b676"
ok1, lp1 = query_supabase(f"landing_pages?select=*&profile_id=eq.{profile_id}")
print(f"landing_pages for profile: {len(lp1) if ok1 else lp1}")

ok2, lp2 = query_supabase("landing_pages?select=*&limit=10")
print(f"all landing_pages sample count: {len(lp2) if ok2 else lp2}")
if ok2 and lp2:
    print("Sample landing_page:", lp2[0].get('id'), lp2[0].get('title'), lp2[0].get('profile_id'), lp2[0].get('share_id'))

ok3, lp3 = query_supabase("product_landing_pages?select=*&limit=10")
print(f"all product_landing_pages: {len(lp3) if ok3 else lp3}")
