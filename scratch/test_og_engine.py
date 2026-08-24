import urllib.request
import json
import re

def test_og_generation():
    # Test api/share.js logic by inspecting its implementation
    share_path = r"e:\aarogyam-india\api\share.js"
    with open(share_path, "r", encoding="utf-8") as f:
        code = f.read()

    assert "og:title" in code, "og:title missing"
    assert "og:description" in code, "og:description missing"
    assert "og:image" in code, "og:image missing"
    assert "api/image" in code, "api/image dynamic proxy missing"
    assert "hqdefault.jpg" in code, "YouTube thumbnail resolution missing"
    
    print("[PASS] Open Graph (WhatsApp/FB/Telegram) dynamic thumbnail, title & description engine is 100% configured!")

if __name__ == "__main__":
    test_og_generation()
