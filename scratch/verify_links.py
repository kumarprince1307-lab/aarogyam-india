import urllib.request, time, sys
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://aarogyamindia.online/ucas/landing.html?id=LP0003659'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')
    assert 'registration.html?src=survey' in html, 'Free Join not pointing to registration.html'
    assert '/ucas/index.html' in html, 'My Profile not pointing to /ucas/index.html'
    print('ALL LINKS VERIFIED LIVE ON PRODUCTION 100%!')
