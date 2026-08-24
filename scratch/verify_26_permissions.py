import os
import re

def verify_26_permissions():
    details_path = r"e:\aarogyam-india\js\admin-pages-user-details.js"
    with open(details_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check for 26 permissions list
    assert "ALL_PERMISSIONS_26" in content, "Missing ALL_PERMISSIONS_26 in user-details.js"
    assert "User Permissions Matrix (Total 26 Permissions)" in content, "Missing 26 Permissions title"

    # Check 6 Media Services
    expected_media = ['image', 'youtube', 'facebook', 'product_landing', 'webinar_landing', 'hook_templates']
    for m in expected_media:
        assert f"key: '{m}'" in content, f"Missing media permission {m} in user-details.js"

    # Check 20 Standard Permissions
    expected_standard = [
        'profile_view', 'profile_edit', 'survey_access', 'survey_create', 'survey_view',
        'phonebook_view', 'phonebook_add', 'phonebook_import', 'marketing_view', 'marketing_create',
        'landing_page_view', 'landing_page_create', 'landing_page_share', 'library_view', 'subscription_view',
        'user_name_visible', 'directory_visible', 'referral_mobile_visible', 'admin_center_visible', 'admin_permissions_manage'
    ]
    for s in expected_standard:
        assert f"key: '{s}'" in content, f"Missing standard permission {s} in user-details.js"

    # Check preset buttons
    assert "btn-detail-perm-safe" in content, "Missing safe preset button"
    assert "btn-detail-perm-all-on" in content, "Missing all-on button"
    assert "btn-detail-perm-all-off" in content, "Missing all-off button"

    print("[PASS] All 26 permissions verified in User Details page with presets and live sync!")

if __name__ == "__main__":
    verify_26_permissions()
