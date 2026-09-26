import re
c = open('health/diabetes.html', encoding='utf-8').read()
secs = re.findall(r'<section[^>]*id=["\']([^"\']+)["\'][^>]*>', c)
print("Sections in diabetes.html:")
for s in secs:
    print(" -", s)
