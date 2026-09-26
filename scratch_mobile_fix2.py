import sys, re
sys.stdout.reconfigure(encoding='utf-8')

files_to_fix = [
    'pashu-palan.html',
]

# Also check all HTML files in root
import os
root_htmls = [f for f in os.listdir('.') if f.endswith('.html')]
files_to_fix.extend(root_htmls)

# Deduplicate
files_to_fix = list(dict.fromkeys(files_to_fix))

# Pattern: large minmax values in product grids (inside sec-products or products-cattle sections)
large_minmax = re.compile(r'grid-template-columns:repeat\(auto-fit, minmax\(([2-9]\d{2})px, 1fr\)\)')

total_fixed = 0
for path in files_to_fix:
    if not os.path.exists(path):
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Only fix if the file contains product-related sections
    if 'sec-products' not in content and 'products-cattle' not in content and 'ns-kyp-grid' not in content:
        continue
    
    orig = content
    
    # Replace all large minmax values with 160px for mobile-first
    def fix_minmax(m):
        val = int(m.group(1))
        if val >= 220:  # Only fix values >= 220px
            return f'grid-template-columns:repeat(auto-fit, minmax(160px, 1fr))'
        return m.group(0)
    
    content = large_minmax.sub(fix_minmax, content)
    
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        # Count changes
        changes = len(re.findall(r'minmax\(160px', content)) - len(re.findall(r'minmax\(160px', orig))
        print(f"  FIXED: {path}")
        total_fixed += 1
    
print(f"\nTotal files fixed: {total_fixed}")
