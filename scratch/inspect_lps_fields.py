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

ok, all_lp = query_supabase("landing_pages?select=*")
if ok and all_lp:
    for lp in all_lp:
        print(f"ID: {lp.get('id')}")
        print(f"  content_type: {repr(lp.get('content_type'))}")
        print(f"  product_data: {repr(lp.get('product_data'))}")
        print(f"  profile_id: {repr(lp.get('profile_id'))}")
        print(f"  share_id: {repr(lp.get('share_id'))}")
