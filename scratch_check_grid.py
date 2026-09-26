import sys
sys.stdout.reconfigure(encoding='utf-8')
c = open('health/diabetes.html', encoding='utf-8').read()
marker = 'id="sec-products"'
idx = c.find(marker)
# Find the grid div inside
grid_idx = c.find('display:grid', idx)
print(f'Grid at: {grid_idx}')
print(repr(c[max(0,grid_idx-20):grid_idx+200]))
