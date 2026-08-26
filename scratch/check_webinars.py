import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"

url = f"{SUPABASE_URL}/rest/v1/landing_pages?select=id,title,category,status,webinar_data,profile_id,share_id,created_at&order=created_at.desc&limit=10"
req = urllib.request.Request(url, headers={
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
})

try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Total landing_pages fetched: {len(data)}")
        for item in data:
            print("---")
            print("ID:", item.get("id"))
            print("Title:", item.get("title"))
            print("Category:", item.get("category"))
            print("Profile ID:", item.get("profile_id"))
            print("Webinar Data:", item.get("webinar_data"))
except Exception as e:
    print("Error:", e)
