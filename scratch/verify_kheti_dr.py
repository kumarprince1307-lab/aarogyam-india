import re
import sys

def verify_kheti_dr_corrections():
    with open(r"e:\aarogyam-india\ebooks\kheti-dr.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Check Main Title is black box with white text
    assert 'hero-title-black-box' in html, "hero-title-black-box class missing"
    assert 'खेती का डॉक्टर' in html, "Main title text missing"
    assert '.hero-title-black-box' in html and 'background: #000000' in html, "Black box CSS missing for title"

    # 2. Check Subtitle is white background with black text
    assert 'hero-subtitle-white-box' in html, "hero-subtitle-white-box class missing"
    assert 'सम्पूर्ण कृषि समाधान | किसान का Pocket Doctor' in html, "Subtitle text missing"
    assert '.hero-subtitle-white-box' in html and 'background: #ffffff' in html, "White background CSS missing for subtitle"

    # 3. Check Rating is red small box
    assert 'hero-rating-red-box' in html, "hero-rating-red-box class missing"
    assert '4.9 (120+ Ratings)' in html, "Rating text missing"
    assert '.hero-rating-red-box' in html and 'background: #dc2626' in html, "Red box CSS missing for rating"

    # 4. Check Description is black box with white text
    assert 'hero-desc-black-box' in html, "hero-desc-black-box class missing"
    assert '🌾 किसान का Pocket Doctor' in html, "Description text missing"
    assert '.hero-desc-black-box' in html and 'background: #0f172a' in html, "Black box CSS missing for description"

    # 5. Check Video section has both books and add to cart
    assert 'ubl-video-books-grid' in html, "ubl-video-books-grid missing"
    assert "addBookToCart('BK002', 'खेती का डॉक्टर', 99, this)" in html, "Book 1 Add to Cart call missing"
    assert "addBookToCart('BK001', 'खरीफ फसल मास्टर गाइड 2026', 99, this)" in html, "Book 2 Add to Cart call missing"
    assert 'addBothBooksToCart(this)' in html, "Add both books call missing"
    assert 'showCartToast' in html, "showCartToast function missing"
    assert 'cart-count-badge' in html, "cart-count-badge missing"

    # 6. Check Footer is full width and not shifted right
    assert '.site-footer' in html and 'margin-left: 0 !important' in html, "Footer reset CSS missing in kheti-dr.html"
    
    with open(r"e:\aarogyam-india\css\my-library.css", "r", encoding="utf-8") as f:
        lib_css = f.read()
    assert "body:has(.library-sidebar) .site-footer" in lib_css or ".has-sidebar .site-footer" in lib_css, "Sidebar-scoped footer CSS missing in my-library.css"

    print("[ALL PASS] All requirements for 'Kheti Ka Doctor' successfully verified!")

if __name__ == "__main__":
    verify_kheti_dr_corrections()
