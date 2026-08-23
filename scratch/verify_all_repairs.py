import os
import json
import re
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def verify():
    print("=== VERIFYING ALL AAROGYAM INDIA REPAIRS & UNIFIED LEFT SIDEBARS ===")
    
    # 1. Check Root checkout.html is deleted
    root_checkout = r"e:\aarogyam-india\checkout.html"
    ebook_checkout = r"e:\aarogyam-india\ebooks\checkout.html"
    assert not os.path.exists(root_checkout), "Root checkout.html still exists!"
    assert os.path.exists(ebook_checkout), "ebooks/checkout.html missing!"
    print("[PASS] 1. Root checkout.html removed; ebooks/checkout.html verified.")

    # 2. Check books.json SUB001 and checkoutPage
    with open(r"e:\aarogyam-india\data\books.json", "r", encoding="utf-8") as f:
        books_data = json.load(f)
    sub001 = next((b for b in books_data.get("books", []) if b.get("id") == "SUB001"), None)
    assert sub001 is not None, "SUB001 missing in books.json"
    assert sub001.get("checkoutPage") == "/ebooks/checkout.html", "Incorrect checkoutPage in SUB001"
    print(f"[PASS] 2. books.json SUB001 verified ({sub001.get('title')}).")

    # 3. Check Admin User Permissions Matrix
    assert os.path.exists(r"e:\aarogyam-india\admin\user-permissions.html"), "admin/user-permissions.html missing!"
    with open(r"e:\aarogyam-india\js\admin-pages-user-permissions.js", "r", encoding="utf-8") as f:
        content = f.read()
    for key in ['image', 'youtube', 'facebook', 'other', 'export_csv']:
        assert f"key: '{key}'" in content, f"Permission key '{key}' missing in admin-pages-user-permissions.js"
    print("[PASS] 3. Admin user permissions matrix contains all 5 granular media services.")

    # 4. Check UCAS Left Sidebar, Drawer and Clean Header with All Merged Items
    with open(r"e:\aarogyam-india\ucas\index.html", "r", encoding="utf-8") as f:
        ucas_html = f.read()
    assert "class=\"ucas-sidebar\"" in ucas_html, "Left sidebar missing in ucas/index.html!"
    assert "id=\"ucas-user-drawer\"" in ucas_html, "User drawer missing in ucas/index.html!"
    assert "/subscription.html" in ucas_html, "subscription.html link missing in ucas/index.html"
    assert "VIP Pass" in ucas_html, "VIP Pass missing in ucas/index.html"
    assert "/purchases.html" in ucas_html, "purchases.html missing in ucas/index.html"
    assert "/ebooks/wishlist.html" in ucas_html, "wishlist.html missing in ucas/index.html"
    assert "site-footer" in ucas_html, "Unified footer missing in ucas/index.html"
    print("[PASS] 4. UCAS Left Sidebar & Drawer present with complete merged navigation.")

    # 5. Check My Library Left Sidebar, Drawer Navigation and Unified Footer
    with open(r"e:\aarogyam-india\ebooks\my-library.html", "r", encoding="utf-8") as f:
        lib_content = f.read()
    assert "class=\"library-sidebar\"" in lib_content, "Left sidebar missing in ebooks/my-library.html!"
    assert "id=\"sideMenu\"" in lib_content, "Side menu drawer missing in ebooks/my-library.html!"
    assert "/subscription.html" in lib_content, "subscription.html missing in my-library.html"
    assert "fa-solid fa-bell" in lib_content and "10B981" in lib_content, "Green bell icon missing in my-library.html"
    assert "site-footer" in lib_content, "Unified footer missing in ebooks/my-library.html"
    assert "/ucas/index.html" in lib_content, "UCAS/My Profile missing in my-library.html"
    print("[PASS] 5. My Library left sidebar, drawer navigation, and footer unified.")

    # 6. Check Desktop Sidebar & Mobile Responsive Styles in ucas.css and my-library.css
    with open(r"e:\aarogyam-india\ucas\ucas.css", "r", encoding="utf-8") as f:
        css_content = f.read()
    assert "margin-left: var(--sidebar-w)" in css_content, "Desktop margin-left missing in ucas.css"
    assert "grid-template-columns: repeat(2, 1fr)" in css_content, "Mobile 2x2 grid missing in ucas.css"
    assert "tirangaWave" in css_content, "Tiranga animation missing in ucas.css"

    with open(r"e:\aarogyam-india\css\my-library.css", "r", encoding="utf-8") as f:
        lib_css = f.read()
    assert ".library-sidebar" in lib_css, "library-sidebar missing in my-library.css"
    assert "margin-left: 260px" in lib_css, "Desktop margin-left missing in my-library.css"
    print("[PASS] 6. Desktop Left Sidebars & responsive CSS verified in both ucas.css & my-library.css.")

    # 7. Check Direct Referrals Multi-Filters & Source Column
    assert "profile_ref_search_input" in ucas_html, "Search input missing in ucas/index.html"
    assert "profile_ref_date_preset" in ucas_html, "Date preset dropdown missing in ucas/index.html"
    assert "profile_ref_status_filter" in ucas_html, "Status filter missing in ucas/index.html"
    assert "स्रोत (Source)" in ucas_html, "Source column header missing in ucas/index.html"

    with open(r"e:\aarogyam-india\ucas\js\ucas-app.js", "r", encoding="utf-8") as f:
        ucas_app = f.read()
    assert "formatReferralSourceBadge" in ucas_app, "formatReferralSourceBadge missing in ucas-app.js"
    assert "applyReferralsFilter" in ucas_app, "applyReferralsFilter missing in ucas-app.js"
    print("[PASS] 7. UCAS Direct Referrals Multi-Filter & Source column verified.")

    # 8. Check Survey Categories Formatting (no raw JSON code)
    with open(r"e:\aarogyam-india\ucas\js\ucas-survey.js", "r", encoding="utf-8") as f:
        survey_js = f.read()
    assert "formatCategoryBadges" in survey_js, "formatCategoryBadges missing in ucas-survey.js"
    assert "formatCategoryAnswersSection" in survey_js, "formatCategoryAnswersSection missing in ucas-survey.js"
    assert "<pre style=\"font-size:0.78rem;background:#fff;padding:6px;border-radius:4px;white-space:pre-wrap;\">${JSON.stringify(ans" not in survey_js, "Raw JSON stringify still present in ucas-survey.js"
    print("[PASS] 8. UCAS Survey categories formatted into clean badges & labels (no raw JSON).")

    print("\nALL 8 AUDIT CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify()
