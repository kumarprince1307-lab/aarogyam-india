import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"

test_record = {
    "id": "WBTEST01",
    "profile_id": "ALL_USERS",
    "share_id": "ALL_USERS",
    "title": "Test Webinar",
    "message": "Test Message",
    "category": "webinar",
    "status": "active",
    "webinar_data": {
        "zoom_link": "https://zoom.us/j/1234567890",
        "meeting_id": "1234567890",
        "passcode": "123456"
    }
}

req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/landing_pages",
    data=json.dumps([test_record]).encode('utf-8'),
    headers={
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        print("Success:", resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
