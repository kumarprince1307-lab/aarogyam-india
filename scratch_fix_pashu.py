import sys, re
sys.stdout.reconfigure(encoding='utf-8')

path = 'pashu-palan.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

orig = content

# Check current grid patterns
import re
grids = re.findall(r'grid-template-columns:repeat\([^)]+\)', content)
print(f"Grid patterns found: {len(grids)}")
for g in grids[:10]:
    print(f"  {g}")

# Fix product grid: change large minmax to 160px for mobile
content = content.replace(
    'display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px;',
    'display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:16px;'
)
content = content.replace(
    'display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px;',
    'display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:16px;'
)
content = content.replace(
    'display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px;',
    'display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:16px;'
)

if content != orig:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("FIXED: pashu-palan.html")
else:
    print("No change in pashu-palan.html")
