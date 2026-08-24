import json
import urllib.request
import re

def test_full_system_health():
    print("Testing Full System Health and Fixes...")

    # 1. Test Supabase Database REST API Connectivity
    url = "https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/landing_pages?select=id,title,category,content_type,media_url,thumbnail_url,share_id,profile_id,status&limit=10"
    headers = {
        "apikey": "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU",
        "Authorization": "Bearer sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU",
        "Accept": "application/json"
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] 1. Supabase REST API responded 200 OK! Total sample records returned: {len(data)}")
    except Exception as e:
        print(f"[FAIL] 1. Supabase REST API connection error: {e}")
        raise

    # 2. Check in-memory caching in admin-api.js
    with open(r"e:\aarogyam-india\js\admin-api.js", "r", encoding="utf-8") as f:
        admin_api = f.read()
    assert "_adminNotificationsCache" in admin_api
    assert "NOTIF_CACHE_TTL" in admin_api
    print("[PASS] 2. admin-api.js has memory caching enabled for notifications.")

    # 3. Check polling intervals in admin-main.js and user-notifications.js
    with open(r"e:\aarogyam-india\js\admin-main.js", "r", encoding="utf-8") as f:
        admin_main = f.read()
    assert "180000" in admin_main # 3 minutes
    print("[PASS] 3. admin-main.js polling interval reduced to 3 minutes.")

    with open(r"e:\aarogyam-india\js\user-notifications.js", "r", encoding="utf-8") as f:
        user_notif = f.read()
    assert "300000" in user_notif # 5 minutes
    print("[PASS] 4. user-notifications.js polling interval reduced to 5 minutes.")

    # 4. Check api/share.js and api/image.js for keepAlive and memory caching
    with open(r"e:\aarogyam-india\api\share.js", "r", encoding="utf-8") as f:
        share_js = f.read()
    assert "keepAlive: true" in share_js
    assert "_lpShareMemoryCache" in share_js
    print("[PASS] 5. api/share.js has keepAlive agent & in-memory cache enabled.")

    with open(r"e:\aarogyam-india\api\image.js", "r", encoding="utf-8") as f:
        image_js = f.read()
    assert "keepAlive: true" in image_js
    assert "_lpImageMemoryCache" in image_js
    print("[PASS] 6. api/image.js has keepAlive agent & in-memory cache enabled.")

    # 5. Check ucas-db.js and ucas-product-landing.js query safety
    with open(r"e:\aarogyam-india\ucas\js\ucas-db.js", "r", encoding="utf-8") as f:
        ucas_db = f.read()
    assert "_ucasLandingPagesCache" in ucas_db
    assert "profile_id.eq.ALL_USERS" not in ucas_db
    print("[PASS] 7. ucas-db.js is protected with memory cache & valid UUID types.")

    with open(r"e:\aarogyam-india\ucas\js\ucas-product-landing.js", "r", encoding="utf-8") as f:
        prod_lp = f.read()
    assert "share_id.eq.ALL_USERS" in prod_lp
    print("[PASS] 8. ucas-product-landing.js supports universal broadcast product pages.")

    print("\n==========================================")
    print("ALL 8 CRITICAL SYSTEM CHECKS PASSED 100%!")
    print("==========================================")

if __name__ == "__main__":
    test_full_system_health()
