import os
import re

def verify_manual_purchase_system():
    # 1. Check admin-api.js exports
    api_path = r"e:\aarogyam-india\js\admin-api.js"
    with open(api_path, "r", encoding="utf-8") as f:
        api_content = f.read()

    assert "export async function fetchAvailableBooks" in api_content, "Missing fetchAvailableBooks export in admin-api.js"
    assert "export async function addManualPurchase" in api_content, "Missing addManualPurchase export in admin-api.js"
    assert "export async function deletePurchase" in api_content, "Missing deletePurchase export in admin-api.js"

    # 2. Check admin-pages-user-details.js
    details_path = r"e:\aarogyam-india\js\admin-pages-user-details.js"
    with open(details_path, "r", encoding="utf-8") as f:
        details_content = f.read()

    assert "btn-open-add-purchase" in details_content, "Missing btn-open-add-purchase in user-details.js"
    assert "manual-purchase-form" in details_content, "Missing manual-purchase-form in user-details.js"
    assert "addManualPurchase({" in details_content, "Missing addManualPurchase call in user-details.js"
    assert "deletePurchase(" in details_content, "Missing deletePurchase call in user-details.js"
    assert "fetchAvailableBooks()" in details_content, "Missing fetchAvailableBooks call in user-details.js"

    print("[PASS] Manual Add Purchase & Delete Purchase system successfully verified in Admin Panel!")

if __name__ == "__main__":
    verify_manual_purchase_system()
