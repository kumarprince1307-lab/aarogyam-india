import os

def verify_share_id_search():
    api_path = r"e:\aarogyam-india\js\admin-api.js"
    with open(api_path, "r", encoding="utf-8") as f:
        api_content = f.read()

    assert "share_id.ilike." in api_content, "Missing share_id.ilike in fetchUsers query"
    assert "referral_code.ilike." in api_content, "Missing referral_code.ilike in fetchUsers query"
    assert "share_id, referral_code" in api_content, "Missing share_id and referral_code in select projection"

    users_page_path = r"e:\aarogyam-india\js\admin-pages-users.js"
    with open(users_page_path, "r", encoding="utf-8") as f:
        users_content = f.read()

    assert "Share ID" in users_content, "Missing Share ID placeholder in users search input"

    print("[PASS] Share ID search system successfully verified in All Users and Admin API!")

if __name__ == "__main__":
    verify_share_id_search()
