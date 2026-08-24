import urllib.request
import json

def check_table_errors():
    headers = {
        "apikey": "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU",
        "Authorization": "Bearer sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU",
        "Accept": "application/json"
    }

    tables = ["product_landing_pages", "leads", "landing_pages", "surveys", "profiles", "purchases", "checkout_logs", "phonebook"]
    for t in tables:
        url = f"https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/{t}?select=*&limit=1"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                print(f"[OK 200] Table exists: {t}")
        except urllib.error.HTTPError as e:
            print(f"[ERROR {e.code}] Table issue for '{t}': {e.read().decode('utf-8')}")
        except Exception as e:
            print(f"[TIMEOUT/ERROR] for '{t}': {e}")

if __name__ == "__main__":
    check_table_errors()
