import json, sys
sys.stdout.reconfigure(encoding='utf-8')

vids = json.load(open('data/webinar-recordings.json', encoding='utf-8'))['recordings']
print(f"Total videos in recordings: {len(vids)}")
for v in vids:
    cat = (v.get('category','') + ' ' + v.get('subject','') + ' ' + v.get('title','')).upper()
    if 'NETSURF' in cat or 'FACTORY' in cat or 'BIOFIT' in cat or 'NATURAMORE' in cat:
        print(f"ID: {v.get('id')} | YT: {v.get('youtube_id')} | Title: {v.get('title')}")
