import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"

req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/landing_pages?id=eq.WBTEST01",
    headers={
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    },
    method="DELETE"
)

try:
    with urllib.request.urlopen(req) as resp:
        print("Cleaned up WBTEST01")
except Exception as e:
    print("Delete error:", e)
