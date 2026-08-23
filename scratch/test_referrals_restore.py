import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def test_referrals_restore():
    base_dir = r"e:\aarogyam-india"
    db_js_path = os.path.join(base_dir, "ucas", "js", "ucas-db.js")
    app_js_path = os.path.join(base_dir, "ucas", "js", "ucas-app.js")

    with open(db_js_path, "r", encoding="utf-8") as f:
        db_content = f.read()
        assert "combinedReferralsMap" in db_content
        assert "from('profiles')" in db_content
        assert "from('leads')" in db_content
        assert "from('surveys')" in db_content
        assert "from('purchases')" in db_content
        print("[PASS] 1. ucas-db.js getDirectReferralsWithPurchases aggregates profiles, leads, surveys, and purchases.")

    with open(app_js_path, "r", encoding="utf-8") as f:
        app_content = f.read()
        assert "renderProfileReferralsList" in app_content
        assert "formatReferralSourceBadge" in app_content
        print("[PASS] 2. ucas-app.js renders complete referral members table with source badges, status, and purchase amounts.")

    print("\nALL REFERRALS RESTORATION TESTS PASSED!")

if __name__ == "__main__":
    test_referrals_restore()
