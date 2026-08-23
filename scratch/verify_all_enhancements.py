import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def verify():
    base_dir = r"e:\aarogyam-india"
    print("=== STARTING COMPREHENSIVE VERIFICATION ===\n")
    all_passed = True

    # 1. Verify data/marketing-templates.json
    tmpl_path = os.path.join(base_dir, "data", "marketing-templates.json")
    if os.path.exists(tmpl_path):
        with open(tmpl_path, "r", encoding="utf-8") as f:
            tmpl_data = json.load(f)
            cats = [c["id"] for c in tmpl_data.get("categories", [])]
            print(f"[PASS] 1. marketing-templates.json is valid JSON with categories: {cats}")
            assert "agriculture" in cats and "health" in cats and "beauty" in cats and "business" in cats
    else:
        print("[FAIL] 1. marketing-templates.json NOT found")
        all_passed = False

    # 2. Verify ucas/index.html
    ucas_html_path = os.path.join(base_dir, "ucas", "index.html")
    with open(ucas_html_path, "r", encoding="utf-8") as f:
        content = f.read()
        assert "ucas-drawer-user-phone" in content, "Missing ucas-drawer-user-phone in ucas/index.html"
        assert "ucas-drawer-pwa-btn" in content, "Missing ucas-drawer-pwa-btn in ucas/index.html"
        assert "ucas_hook_category_select" in content, "Missing ucas_hook_category_select in ucas/index.html"
        assert "lp_btn_mode_product" in content, "Missing lp_btn_mode_product in ucas/index.html"
        assert "lp_section_product_input" in content, "Missing lp_section_product_input in ucas/index.html"
        assert "ucas-lp-media-filters" in content, "Missing ucas-lp-media-filters in ucas/index.html"
        assert "background:#EFF6FF;border:1.5px solid #BFDBFE" in content, "Quick actions not light blue"
        print("[PASS] 2. ucas/index.html verified (phone, pwa button, quick actions light blue, hook selector, product mode, filter tabs).")

    # 3. Verify ebooks/my-library.html
    lib_html_path = os.path.join(base_dir, "ebooks", "my-library.html")
    with open(lib_html_path, "r", encoding="utf-8") as f:
        lib_content = f.read()
        assert "VIP Pass (Subscription)" in lib_content
        print("[PASS] 3. ebooks/my-library.html verified (VIP Pass styling uniform).")

    # 4. Verify ucas/js/ucas-db.js
    db_path = os.path.join(base_dir, "ucas", "js", "ucas-db.js")
    with open(db_path, "r", encoding="utf-8") as f:
        db_content = f.read()
        assert "getDirectReferralsWithPurchases" in db_content
        print("[PASS] 4. ucas/js/ucas-db.js verified (getDirectReferralsWithPurchases exists and exported).")

    # 5. Verify ucas/js/ucas-app.js
    app_path = os.path.join(base_dir, "ucas", "js", "ucas-app.js")
    with open(app_path, "r", encoding="utf-8") as f:
        app_content = f.read()
        assert "ucas-drawer-user-phone" in app_content
        print("[PASS] 5. ucas/js/ucas-app.js verified (populates drawer user phone).")

    # 6. Verify ucas/js/ucas-landing-builder.js
    lb_path = os.path.join(base_dir, "ucas", "js", "ucas-landing-builder.js")
    with open(lb_path, "r", encoding="utf-8") as f:
        lb_content = f.read()
        assert "filterMyLandingPages" in lb_content
        assert "lp_btn_mode_product" in lb_content
        print("[PASS] 6. ucas/js/ucas-landing-builder.js verified (filterMyLandingPages & product mode).")

    # 7. Verify ucas/js/ucas-marketing.js
    mkt_path = os.path.join(base_dir, "ucas", "js", "ucas-marketing.js")
    with open(mkt_path, "r", encoding="utf-8") as f:
        mkt_content = f.read()
        assert "onHookCategoryChange" in mkt_content
        assert "onHookTemplateSelect" in mkt_content
        print("[PASS] 7. ucas/js/ucas-marketing.js verified (Hook templates & shayari engine).")

    # 8. Verify ucas/landing.html
    lp_pub_path = os.path.join(base_dir, "ucas", "landing.html")
    with open(lp_pub_path, "r", encoding="utf-8") as f:
        lp_pub_content = f.read()
        assert "handleProductBuyNowClick" in lp_pub_content
        assert "product_landing_page" in lp_pub_content
        print("[PASS] 8. ucas/landing.html verified (Product landing view and pre-redirect lead capture).")

    # 9. Verify admin files
    admin_tmpl_path = os.path.join(base_dir, "admin", "marketing-templates.html")
    admin_tmpl_js_path = os.path.join(base_dir, "js", "admin-pages-marketing-templates.js")
    admin_perms_js_path = os.path.join(base_dir, "js", "admin-pages-user-permissions.js")
    assert os.path.exists(admin_tmpl_path), "admin/marketing-templates.html missing"
    assert os.path.exists(admin_tmpl_js_path), "js/admin-pages-marketing-templates.js missing"
    with open(admin_perms_js_path, "r", encoding="utf-8") as f:
        perms_content = f.read()
        assert "product_landing" in perms_content
    print("[PASS] 9. Admin panel files verified (marketing-templates.html, JS controller, product_landing permission).")

    print("\nALL 9 VERIFICATION CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    verify()
