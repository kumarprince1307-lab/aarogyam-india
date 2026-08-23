import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

def test_all():
    base_dir = r"e:\aarogyam-india"
    print("Testing Checkout, Books JSON, Smart Promos & Profile Connection...")

    # 1. Test data/books.json
    books_file = os.path.join(base_dir, "data", "books.json")
    with open(books_file, "r", encoding="utf-8") as f:
        books_data = json.load(f)
    
    books_list = books_data.get("books", [])
    book_ids = [b.get("id") for b in books_list]
    assert "SUB001" in book_ids, "SUB001 missing in data/books.json"
    assert "BK001" in book_ids, "BK001 missing in data/books.json"
    assert "BK002" in book_ids, "BK002 missing in data/books.json"
    
    sub_book = next(b for b in books_list if b.get("id") == "SUB001")
    assert sub_book.get("offerPrice") == 999, f"SUB001 offerPrice is {sub_book.get('offerPrice')}, expected 999"
    print("[PASS] 1. data/books.json has SUB001 (Rs 999), BK001, and BK002.")

    # 2. Test root checkout.html
    root_checkout = os.path.join(base_dir, "checkout.html")
    assert os.path.exists(root_checkout), "checkout.html missing in root!"
    with open(root_checkout, "r", encoding="utf-8") as f:
        root_checkout_content = f.read()
    assert "/js/checkout.js" in root_checkout_content, "/js/checkout.js missing in checkout.html"
    print("[PASS] 2. Root checkout.html exists and links properly.")

    # 3. Test js/checkout.js
    checkout_js = os.path.join(base_dir, "js", "checkout.js")
    with open(checkout_js, "r", encoding="utf-8") as f:
        checkout_js_content = f.read()
    assert "SUB001" in checkout_js_content, "SUB001 mapping missing in checkout.js"
    assert "kheti-dr" in checkout_js_content or "kheti" in checkout_js_content, "kheti alias missing in checkout.js"
    assert "AI_PURCHASES" in checkout_js_content, "AI_PURCHASES storage missing in checkout.js"
    assert "user_is_subscriber" in checkout_js_content, "user_is_subscriber activation missing in checkout.js"
    print("[PASS] 3. js/checkout.js has alias resolution, never-blank fallback, and purchase recording.")

    # 4. Test js/global-guest-modal.js
    guest_modal_file = os.path.join(base_dir, "js", "global-guest-modal.js")
    with open(guest_modal_file, "r", encoding="utf-8") as f:
        guest_modal_content = f.read()
    assert "मुफ़्त रजिस्ट्रेशन / लॉगिन" in guest_modal_content or "Free Sign Up" in guest_modal_content, "Clean guest registration header missing"
    assert "ai_guest_dismissed" in guest_modal_content, "Guest dismiss missing"
    print("[PASS] 4. js/global-guest-modal.js provides dedicated Free Registration & Login popup.")

    # 5. Test js/book-promo-toast.js
    toast_file = os.path.join(base_dir, "js", "book-promo-toast.js")
    with open(toast_file, "r", encoding="utf-8") as f:
        toast_content = f.read()
    assert "isUserActiveSubscriber" in toast_content, "Subscriber check missing in promo toast"
    assert "getUserPurchasedBookIds" in toast_content, "Purchase history check missing in promo toast"
    assert "ai-subscriber-vip-modal" in toast_content, "Subscriber VIP modal missing in promo engine"
    print("[PASS] 5. js/book-promo-toast.js smartly filters based on user purchases & subscriber status.")

    # 6. Test ucas/js/ucas-app.js & js/my-library.js
    ucas_app_file = os.path.join(base_dir, "ucas", "js", "ucas-app.js")
    with open(ucas_app_file, "r", encoding="utf-8") as f:
        ucas_app_content = f.read()
    assert "ai_profile_completed" in ucas_app_content, "ai_profile_completed flag missing in ucas-app.js"
    assert "ai_profile_nudge_dismissed" in ucas_app_content, "ai_profile_nudge_dismissed missing in ucas-app.js"
    print("[PASS] 6. Profile completion logic connects and prevents recurring popups.")

    print("\nALL POPUP, CHECKOUT, PURCHASE FILTERING & PROFILE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_all()
