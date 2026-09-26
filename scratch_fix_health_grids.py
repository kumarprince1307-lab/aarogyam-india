import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

health_dir = 'health'
files = [f for f in os.listdir(health_dir) if f.endswith('.html')]
print(f"Health files: {files}")

for fname in files:
    path = os.path.join(health_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # Fix product grid: change minmax(260px, 1fr) or minmax(280px, 1fr) to responsive
    # The sec-products div with grid
    # Pattern: display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));
    content = re.sub(
        r'(<div style="display:grid; grid-template-columns:repeat\(auto-fit, minmax\()(\d+)px(, 1fr\); gap:\d+px;">)',
        lambda m: m.group(1) + '160px' + m.group(3),
        content
    )
    
    # Also look for inline style product grids
    content = re.sub(
        r'(grid-template-columns:repeat\(auto-fit, minmax\()(\d{3,})px(, 1fr\))',
        lambda m: m.group(1) + '160px' + m.group(3),
        content
    )
    
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  FIXED: {fname}")
    else:
        print(f"  No change: {fname}")
