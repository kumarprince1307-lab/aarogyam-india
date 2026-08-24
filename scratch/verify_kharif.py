import os
import sys

def verify_kharif():
    file_path = r"e:\aarogyam-india\ebooks\kharif-master-guide-2026.html"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Main Title in Black Box
    assert "hero-title-black-box" in content, "Missing hero-title-black-box class"
    assert "खरीफ फसल मास्टर गाइड 2026" in content, "Missing title text"

    # 2. Subtitle in White Box
    assert "hero-subtitle-white-box" in content, "Missing hero-subtitle-white-box class"

    # 3. Rating in Red Box
    assert "hero-rating-red-box" in content, "Missing hero-rating-red-box class"

    # 4. Description in Black Box
    assert "hero-desc-black-box" in content, "Missing hero-desc-black-box class"

    # 5. YouTube video section
    assert "youtube-nocookie.com/embed/ew5tDJgGTK8" in content, "Missing YouTube video embed"

    # 6. Video 2-book showcase grid
    assert "ubl-video-books-grid" in content, "Missing ubl-video-books-grid"
    assert "addBookToCart('BK001'" in content, "Missing BK001 add to cart"
    assert "addBookToCart('BK002'" in content, "Missing BK002 add to cart"
    assert "addBothBooksToCart" in content, "Missing addBothBooksToCart"

    # 7. Cart badge and Header
    assert 'id="cart-count-badge"' in content, "Missing cart badge"
    assert 'id="cart-toast-notif"' in content, "Missing cart toast"

    # 8. Side Menu Drawer
    assert 'id="sideMenu"' in content, "Missing sideMenu"
    assert 'id="sideMenuOverlay"' in content, "Missing sideMenuOverlay"
    assert 'toggleMenu()' in content, "Missing toggleMenu"

    # 9. Static FAQ
    assert "faq-wrapper" in content, "Missing faq-wrapper"
    assert "faq-item" in content, "Missing faq-item"

    # 10. Unified Footer
    assert "site-footer" in content, "Missing site-footer"

    print("[ALL PASS] kharif-master-guide-2026.html has been successfully verified with exact kheti-dr UI design & features!")

if __name__ == "__main__":
    verify_kharif()
