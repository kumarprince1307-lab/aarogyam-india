import urllib.request
import json

SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"

url = f"{SUPABASE_URL}/rest/v1/profiles?select=id,full_name,mobile,share_id,referred_by,created_at,is_active,registration_source&limit=100"
req = urllib.request.Request(url, headers={
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
})

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print(f"Total profiles: {len(data)}")
    
    # Check all unique referred_by values
    ref_vals = set(p.get('referred_by') for p in data)
    print("Unique referred_by values in DB:", ref_vals)
    
    # Filter where referred_by contains AI000004 or 52ef705c-bb45-4137-bee4-a3f8df73b676
    matching = [p for p in data if p.get('referred_by') in ['AI000004', '52ef705c-bb45-4137-bee4-a3f8df73b676', 'AI000004 ']]
    print(f"\nMatching referral profiles: {len(matching)}")
    print("First 3 matching:")
    for m in matching[:3]:
        print(m)
