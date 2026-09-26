import json, sys
sys.stdout.reconfigure(encoding='utf-8')

try:
    d = json.load(open('data/webinar-recordings.json', encoding='utf-8'))
    r = d.get('recordings', [])
    print(f'Total recordings: {len(r)}')
    for i, rec in enumerate(r[:5]):
        print(f'  [{i+1}] title={rec.get("title", "")[:50]}')
        print(f'       yt_id={rec.get("youtube_id", "")} | url={rec.get("youtube_url", "")[:60]}')
except Exception as e:
    print(f'Error: {e}')
