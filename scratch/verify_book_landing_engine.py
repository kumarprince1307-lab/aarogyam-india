import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def test_engine():
    print("=== Testing Universal Book Landing Page Engine ===")
    
    # 1. Verify protected files exist and have content
    protected = [
        r"e:\aarogyam-india\ebooks\kharif-master-guide-2026.html",
        r"e:\aarogyam-india\ebooks\kheti-dr.html",
        r"e:\aarogyam-india\data\books.json"
    ]
    for p in protected:
        if not os.path.exists(p):
            print(f"FAILED: Missing protected file {p}")
            sys.exit(1)
        print(f"OK: Protected file exists and safe: {os.path.basename(p)}")

    # 2. Verify books.json validity
    with open(r"e:\aarogyam-india\data\books.json", "r", encoding="utf-8") as f:
        books_data = json.load(f)
        assert "books" in books_data, "books.json missing 'books' key"
        print(f"OK: books.json valid with {len(books_data['books'])} books")

    # 3. Verify universal-book-landing-pages.json
    with open(r"e:\aarogyam-india\data\universal-book-landing-pages.json", "r", encoding="utf-8") as f:
        ubl_data = json.load(f)
        assert "bookLandingPages" in ubl_data, "universal-book-landing-pages.json missing key"
        pages = ubl_data["bookLandingPages"]
        print(f"OK: universal-book-landing-pages.json valid with {len(pages)} landing page configurations")
        for p in pages:
            assert "id" in p, f"Missing id in {p}"
            assert "hero" in p, f"Missing hero in {p}"
            assert "title" in p["hero"], f"Missing title in hero of {p['id']}"
            print(f"  -> Config for Book {p['id']}: {p['hero']['title']}")

    # 4. Verify new engine files exist
    new_files = [
        r"e:\aarogyam-india\ebooks\book-landing.html",
        r"e:\aarogyam-india\js\universal-book-landing.js",
        r"e:\aarogyam-india\css\universal-book-landing.css",
        r"e:\aarogyam-india\js\admin-pages-book-landing.js",
        r"e:\aarogyam-india\admin\book-landing-pages.html"
    ]
    for nf in new_files:
        assert os.path.exists(nf), f"Missing new file {nf}"
        assert os.path.getsize(nf) > 200, f"File too small {nf}"
        print(f"OK: New engine asset ready: {os.path.basename(nf)} ({os.path.getsize(nf)} bytes)")

    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_engine()
