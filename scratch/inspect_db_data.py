import urllib.request
import json

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

print("1. All profiles count:")
ok, res = query_supabase("profiles?select=id,full_name,mobile,share_id,referred_by&limit=100")
if ok:
    print(f"Total profiles returned: {len(res)}")
    # Find profile with share_id AI000004 or similar
    ai04 = [p for p in res if p.get('share_id') == 'AI000004']
    print(f"Profiles with share_id AI000004: {ai04}")
    referred_by_ai04 = [p for p in res if p.get('referred_by') in ['AI000004', (ai04[0]['id'] if ai04 else '')]]
    print(f"Profiles referred by AI000004: {len(referred_by_ai04)}")
else:
    print("Error:", res)

print("\n2. All surveys count:")
ok, res = query_supabase("surveys?select=id,name,mobile,profile_id,created_at&limit=100")
if ok:
    print(f"Total surveys returned: {len(res)}")
    if ai04:
        surveys_user = [s for s in res if s.get('profile_id') == ai04[0]['id']]
        print(f"Surveys with user profile_id: {len(surveys_user)}")
else:
    print("Error:", res)

print("\n3. All purchases count:")
ok, res = query_supabase("purchases?select=*&limit=100")
if ok:
    print(f"Total purchases: {len(res)}")
else:
    print("Error:", res)
