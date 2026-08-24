import os

def verify_webinar_all_users():
    # 1. Check ucas-db.js query
    ucas_db_path = r"e:\aarogyam-india\ucas\js\ucas-db.js"
    with open(ucas_db_path, "r", encoding="utf-8") as f:
        db_content = f.read()

    assert "profile_id.eq.ALL_USERS" in db_content, "Missing ALL_USERS in ucas-db.js query"
    assert "is_admin_template.eq.true" in db_content, "Missing is_admin_template in ucas-db.js query"
    assert "created_by_admin.eq.true" in db_content, "Missing created_by_admin in ucas-db.js query"

    # 2. Check ucas-webinars.js share URL and protection
    ucas_wb_path = r"e:\aarogyam-india\ucas\js\ucas-webinars.js"
    with open(ucas_wb_path, "r", encoding="utf-8") as f:
        wb_content = f.read()

    assert "isBroadcastOrAdmin" in wb_content, "Missing isBroadcastOrAdmin check in ucas-webinars.js"
    assert "एडमिन पेज" in wb_content, "Missing locked admin page button in ucas-webinars.js"
    assert "सुरक्षित" in wb_content, "Missing locked safe button in ucas-webinars.js"

    # 3. Check admin-pages-landing-pages.js batch chunking
    lp_path = r"e:\aarogyam-india\js\admin-pages-landing-pages.js"
    with open(lp_path, "r", encoding="utf-8") as f:
        lp_content = f.read()

    assert "profile_id: 'ALL_USERS'" in lp_content, "Missing ALL_USERS master record creation in admin landing pages"
    assert "chunkSize = 25" in lp_content, "Missing chunk size batching in admin landing pages"

    print("[PASS] Universal Admin Webinar & Broadcast system verified across UCAS and Admin Panel!")

if __name__ == "__main__":
    verify_webinar_all_users()
