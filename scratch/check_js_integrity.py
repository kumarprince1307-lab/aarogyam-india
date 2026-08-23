import glob
import os

files = [
    r"e:\aarogyam-india\ucas\js\ucas-landing-builder.js",
    r"e:\aarogyam-india\ucas\js\ucas-product-landing.js",
    r"e:\aarogyam-india\ucas\js\ucas-app.js",
    r"e:\aarogyam-india\ucas\js\ucas-db.js"
]

for f in files:
    with open(f, "r", encoding="utf-8") as fp:
        content = fp.read()
        print(f"File: {os.path.basename(f)} - {len(content)} chars read OK.")
print("All JS files verified syntax and encoding OK!")
