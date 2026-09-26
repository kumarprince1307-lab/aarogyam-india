import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

health_dir = 'health'
files = [f for f in os.listdir(health_dir) if f.endswith('.html')]

for fname in files:
    path = os.path.join(health_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # Revert: change minmax(160px back to minmax(260px
    content = re.sub(
        r'(grid-template-columns:repeat\(auto-fit, minmax\()160px(, 1fr\))',
        r'\g<1>200px\2',
        content
    )
    
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  REVERTED: {fname}")
    else:
        print(f"  No change: {fname}")

print("Done.")
