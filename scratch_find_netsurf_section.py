import sys
sys.stdout.reconfigure(encoding='utf-8')

content = open('js/admin-pages-page-editor.js', encoding='utf-8').read()

# Find pe-section-products to understand the pattern and where to insert
# Find the end of the products section
idx = content.find('id="pe-section-products"')
print(f'pe-section-products at: {idx}')

# Find the next section after products to know where to insert
# Let's find pe-sec-kpis and see what comes before it
idx2 = content.find('id="pe-sec-kpis"')
print(f'pe-sec-kpis at: {idx2}')

# Show what's between
print('\nContent between products and kpis (last 500 chars before kpis):')
print(repr(content[max(0, idx2-500):idx2+50]))
