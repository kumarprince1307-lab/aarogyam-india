import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

health_dir = 'health'
files = [f for f in os.listdir(health_dir) if f.endswith('.html')]

total_fixed = 0
for fname in files:
    path = os.path.join(health_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # Fix: change minmax(200px to minmax(160px in product grid
    # The format is: display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px;
    content = content.replace(
        'display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px;',
        'display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:16px;'
    )
    
    # Also fix 260px pattern if exists
    content = content.replace(
        'display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px;',
        'display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:16px;'
    )
    
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  FIXED: {fname}")
        total_fixed += 1
    else:
        print(f"  No change: {fname}")

print(f"\nTotal fixed: {total_fixed}")
