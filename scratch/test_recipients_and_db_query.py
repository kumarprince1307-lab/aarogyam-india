import urllib.request
import json

def test_everything():
    # 1. Test Supabase PostgREST query as called by ucas-db.js
    url = "https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/landing_pages?select=*&or=(profile_id.eq.52ef705c-bb45-4137-bee4-a3f8df73b676,share_id.eq.AI639559,share_id.eq.ADMIN,share_id.eq.ALL_USERS)&order=created_at.desc"
    req = urllib.request.Request(url, headers={
        "apikey": "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU",
        "Authorization": "Bearer sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"
    })
    
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        print(f"[PASS] 1. Supabase PostgREST query executed with 200 OK! Total results: {len(data)}")
    except urllib.error.HTTPError as e:
        print(f"[FAIL] Query error: {e.code} {e.read().decode('utf-8')}")
        raise

    # 2. Check ucas-db.js
    with open(r"e:\aarogyam-india\ucas\js\ucas-db.js", "r", encoding="utf-8") as f:
        ucas_db = f.read()
    assert "share_id.eq.ALL_USERS" in ucas_db
    assert "profile_id.eq.ALL_USERS" not in ucas_db
    print("[PASS] 2. ucas-db.js is clean of UUID syntax errors.")

    # 3. Check admin-pages-landing-pages.js
    with open(r"e:\aarogyam-india\js\admin-pages-landing-pages.js", "r", encoding="utf-8") as f:
        lp_js = f.read()
    assert "openRecipientsDrawer" in lp_js
    assert "openResponsesDrawer" in lp_js
    assert "btn-view-recipients" in lp_js
    print("[PASS] 3. admin-pages-landing-pages.js has Recipients drawer and View buttons.")

    # 4. Check admin-pages-webinars.js
    with open(r"e:\aarogyam-india\js\admin-pages-webinars.js", "r", encoding="utf-8") as f:
        wb_js = f.read()
    assert "openWebinarRecipientsDrawer" in wb_js
    assert "btn-view-wb-recipients" in wb_js
    print("[PASS] 4. admin-pages-webinars.js has Recipients drawer and View buttons.")

    print("\nALL VERIFICATIONS PASSED 100%!")

if __name__ == "__main__":
    test_everything()
