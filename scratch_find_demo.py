import sys
sys.stdout.reconfigure(encoding='utf-8')

files = [
    ('ebooks/kharif-master-guide-2026.html', 'BK001'),
    ('ebooks/kheti-dr.html', 'BK002'),
    ('ebooks/landingpage.html', 'BK015'),
]

for fpath, bk in files:
    c = open(fpath, 'r', encoding='utf-8').read()
    print(f"\n=== {bk}: {fpath} ===")
    
    # Find floating-free-demo-btn or left:0 demo button
    for marker in ['floating-free-demo-btn', 'floating-demo', 'left: 0', 'position: fixed']:
        idx = c.find(marker)
        if idx > -1:
            print(f"\n  [{marker}] at {idx}:")
            print(repr(c[max(0,idx-50):idx+300]))
            break
