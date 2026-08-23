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
# test query
ok, data = query_supabase(f"landing_pages?select=*&or=(profile_id.eq.{profile_id},share_id.eq.AI000004)")
print(f"Query returned {len(data) if ok else data} records")
for d in (data if ok else []):
    print(f"  - [{d.get('content_type')}] {d.get('title')} (ID: {d.get('id')})")
