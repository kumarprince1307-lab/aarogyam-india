"""
Aarogyam India - Local Disk Sync & Git Auto-Publisher Server
Listens on http://127.0.0.1:5505 to automatically save uploaded assets,
save page configs directly to disk, and DIRECTLY COMMIT & PUSH to GitHub
with 1-click or automatically whenever the user clicks Save in Admin Studio.
"""
import http.server
import json
import base64
import os
import sys
import subprocess

PORT = 5505
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def git_commit_and_push(commit_msg="Update website via Admin Studio"):
    """Directly stages, commits, pulls, and pushes changes to GitHub main branch."""
    try:
        # 1. Stage all changes
        subprocess.run(['git', 'add', '-A'], cwd=BASE_DIR, capture_output=True, check=True)

        # 2. Check if there are any staged changes
        diff_res = subprocess.run(['git', 'diff', '--staged', '--name-only'], cwd=BASE_DIR, capture_output=True, text=True)
        changed_files = [f.strip() for f in diff_res.stdout.splitlines() if f.strip()]

        if not changed_files:
            return {
                "success": True,
                "pushed": False,
                "message": "गिट रिपॉजिटरी पहले से ही अप-टू-डेट है (Nothing to commit)."
            }

        # 3. Commit
        subprocess.run(['git', 'commit', '-m', commit_msg], cwd=BASE_DIR, capture_output=True, check=True)

        # 4. Pull origin main to incorporate any remote commits without conflict
        subprocess.run(['git', 'pull', '--no-rebase', 'origin', 'main'], cwd=BASE_DIR, capture_output=True)

        # 5. Push to GitHub
        push_res = subprocess.run(['git', 'push', 'origin', 'main'], cwd=BASE_DIR, capture_output=True, text=True)
        if push_res.returncode == 0:
            print(f"[LocalSync OK] Git push succeeded: {commit_msg}")
            return {
                "success": True,
                "pushed": True,
                "files": changed_files,
                "message": "बधाई! सभी बदलाव सीधे GitHub और लाइव वेबसाइट पर पब्लिश हो गए!"
            }
        else:
            print(f"[LocalSync WARN] Git push stderr: {push_res.stderr}")
            return {
                "success": False,
                "error": push_res.stderr or "Git push failed"
            }
    except Exception as e:
        print(f"[LocalSync ERR] Git auto-push exception: {e}")
        return {"success": False, "error": str(e)}

import re

def sync_og_to_html_files(site_pages):
    """Automatically updates static HTML <head> OG tags when Admin saves site-pages-config.json."""
    if not isinstance(site_pages, list):
        return
    for page in site_pages:
        if not isinstance(page, dict):
            continue
        url = page.get('url') or ''
        if not url or not url.endswith('.html'):
            if url == '/' or page.get('id') == 'page_home':
                url = '/index.html'
            else:
                continue
        rel_html = url.lstrip('/')
        target_html = os.path.abspath(os.path.join(BASE_DIR, rel_html))
        if not os.path.exists(target_html):
            continue

        og_title = (page.get('og_title') or page.get('name') or 'Aarogyam India').strip()
        og_desc = (page.get('og_description') or 'Aarogyam India - भारत का सम्पूर्ण डिजिटल मंच।').strip()
        og_img = (page.get('og_image') or '/images/banners/og_image-bk015-sec_audio-ba-436589-2buf.webp').strip()
        if og_img and not og_img.startswith('http'):
            og_img = 'https://aarogyamindia.online' + ('' if og_img.startswith('/') else '/') + og_img
        og_url = 'https://aarogyamindia.online' + ('' if url.startswith('/') else '/') + url

        try:
            with open(target_html, 'r', encoding='utf-8') as f:
                content = f.read()

            head_match = re.search(r'(<head[^>]*>)(.*?)(</head>)', content, re.DOTALL | re.IGNORECASE)
            if not head_match:
                continue

            head_open, head_inner, head_close = head_match.groups()
            head_clean = re.sub(r'<!--\s*OpenGraph\s*&\s*Social\s*Share\s*Meta[^-]*-->\s*', '', head_inner, flags=re.IGNORECASE)
            head_clean = re.sub(r'\s*<meta\s+property=["\']og:[^"\']+["\'][^>]*>', '', head_clean, flags=re.IGNORECASE)
            head_clean = re.sub(r'\s*<meta\s+name=["\']twitter:[^"\']+["\'][^>]*>', '', head_clean, flags=re.IGNORECASE)

            og_lines = [
                "\n  <!-- OpenGraph & Social Share Meta (Synced from Admin) -->",
                f'  <meta property="og:title" content="{og_title}">',
                f'  <meta property="og:description" content="{og_desc}">',
                f'  <meta property="og:image" content="{og_img}">',
                f'  <meta property="og:url" content="{og_url}">',
                f'  <meta property="og:type" content="website">',
                f'  <meta property="og:site_name" content="Aarogyam India">',
                f'  <meta name="twitter:card" content="summary_large_image">',
                f'  <meta name="twitter:title" content="{og_title}">',
                f'  <meta name="twitter:description" content="{og_desc}">',
                f'  <meta name="twitter:image" content="{og_img}">'
            ]
            og_block = "\n".join(og_lines) + "\n"

            link_idx = head_clean.find('<link')
            if link_idx >= 0:
                new_head_inner = head_clean[:link_idx] + og_block + "  " + head_clean[link_idx:]
            else:
                new_head_inner = head_clean + og_block

            new_content = content[:head_match.start(2)] + new_head_inner + content[head_match.end(2):]
            with open(target_html, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"[LocalSync OK] Auto-synced OG tags to: {rel_html}")
        except Exception as e:
            print(f"[LocalSync WARN] Failed to sync OG to {rel_html}: {e}")

class LocalSyncHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stdout.write(f"[LocalSync] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()

    def _send_cors_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.end_headers()

    def do_OPTIONS(self):
        self._send_cors_headers(204)

    def do_GET(self):
        self._send_cors_headers(200)
        self.wfile.write(json.dumps({
            "status": "online",
            "server": "Aarogyam Local Disk Sync & Git Auto-Publisher",
            "baseDir": BASE_DIR
        }).encode('utf-8'))

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            action = data.get('action')

            # 1. Direct Commit & Push Action
            if action == 'git_commit_push':
                commit_msg = data.get('message', 'Update website via Admin Studio')
                git_res = git_commit_and_push(commit_msg)
                self._send_cors_headers(200 if git_res.get('success') else 500)
                self.wfile.write(json.dumps(git_res).encode('utf-8'))
                return

            rel_path = data.get('path', '').replace('\\', '/').lstrip('/')
            if not rel_path:
                self._send_cors_headers(400)
                self.wfile.write(json.dumps({"success": False, "error": "Missing path"}).encode('utf-8'))
                return

            target_path = os.path.abspath(os.path.join(BASE_DIR, rel_path))
            if not target_path.startswith(BASE_DIR):
                self._send_cors_headers(403)
                self.wfile.write(json.dumps({"success": False, "error": "Path traversal prohibited"}).encode('utf-8'))
                return

            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            auto_push = data.get('auto_push', True)

            # 2. Upload Asset Action
            if action == 'upload_asset' or 'base64' in data:
                b64_str = data.get('base64', '')
                if ',' in b64_str:
                    b64_str = b64_str.split(',', 1)[1]
                file_bytes = base64.b64decode(b64_str)
                with open(target_path, 'wb') as f:
                    f.write(file_bytes)
                print(f"[LocalSync OK] Saved asset to disk: {rel_path} ({len(file_bytes)} bytes)")

                git_push_info = None
                if auto_push:
                    git_push_info = git_commit_and_push(f"Upload {rel_path} via Admin Studio")

                self._send_cors_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "path": rel_path,
                    "size": len(file_bytes),
                    "url": "/" + rel_path,
                    "gitPush": git_push_info
                }).encode('utf-8'))

            # 3. Save Config Action (Pages, Books, Combos, Audio Scripts, etc.)
            elif action == 'save_config' or action == 'save' or rel_path.endswith('.json'):
                content = data.get('content')
                # If content is not directly supplied, try base64 decoding
                if content is None and 'base64' in data:
                    try:
                        b64_str = data.get('base64', '')
                        if ',' in b64_str:
                            b64_str = b64_str.split(',', 1)[1]
                        raw_bytes = base64.b64decode(b64_str)
                        content = raw_bytes.decode('utf-8')
                        try:
                            content = json.loads(content)
                        except Exception:
                            pass
                    except Exception as err:
                        print(f"[LocalSync WARN] Failed to decode base64 json: {err}")

                # If book/combo landing page save action
                if action == 'save' and ('pageData' in data or 'bookData' in data):
                    page_data = data.get('pageData')
                    book_data = data.get('bookData')
                    backup_dir = os.path.join(BASE_DIR, 'data', 'backups')
                    os.makedirs(backup_dir, exist_ok=True)
                    from datetime import datetime
                    ts = datetime.now().strftime('%Y%m%d_%H%M%S')

                    # Update universal-book-landing-pages.json
                    if page_data and page_data.get('id'):
                        lp_path = os.path.join(BASE_DIR, 'data', 'universal-book-landing-pages.json')
                        lp_json = {"bookLandingPages": []}
                        if os.path.exists(lp_path):
                            try:
                                with open(lp_path, 'r', encoding='utf-8') as f:
                                    lp_json = json.load(f)
                                # Save atomic backup
                                with open(os.path.join(backup_dir, f'landing_backup_{ts}.json'), 'w', encoding='utf-8') as bf:
                                    json.dump(lp_json, bf, ensure_ascii=False, indent=2)
                            except Exception:
                                pass
                        lps = lp_json.get('bookLandingPages', [])
                        idx = next((i for i, x in enumerate(lps) if x.get('id') == page_data.get('id')), -1)
                        if idx >= 0:
                            if page_data.get('id') in ['BK001', 'BK002']:
                                lps[idx].update(page_data)
                            else:
                                lps[idx] = page_data
                        else:
                            lps.append(page_data)
                        lp_json['bookLandingPages'] = lps
                        with open(lp_path, 'w', encoding='utf-8') as f:
                            json.dump(lp_json, f, ensure_ascii=False, indent=2)

                    # Update books.json
                    if book_data and book_data.get('id'):
                        # Deduplicate demoImages if list
                        if 'demoImages' in book_data and isinstance(book_data['demoImages'], list):
                            book_data['demoImages'] = list(dict.fromkeys(book_data['demoImages']))
                            book_data['demo_images'] = book_data['demoImages']
                            book_data['preview_images'] = book_data['demoImages']

                        bk_path = os.path.join(BASE_DIR, 'data', 'books.json')
                        bk_json = {"books": []}
                        if os.path.exists(bk_path):
                            try:
                                with open(bk_path, 'r', encoding='utf-8') as f:
                                    bk_json = json.load(f)
                                # Save atomic backup
                                with open(os.path.join(backup_dir, f'books_backup_{ts}.json'), 'w', encoding='utf-8') as bf:
                                    json.dump(bk_json, bf, ensure_ascii=False, indent=2)
                            except Exception:
                                pass
                        bks = bk_json.get('books', [])
                        idx = next((i for i, x in enumerate(bks) if x.get('id') == book_data.get('id')), -1)
                        if idx >= 0:
                            if book_data.get('id') in ['BK001', 'BK002']:
                                bks[idx].update(book_data)
                            else:
                                bks[idx] = book_data
                        else:
                            bks.append(book_data)
                        bk_json['books'] = bks
                        with open(bk_path, 'w', encoding='utf-8') as f:
                            json.dump(bk_json, f, ensure_ascii=False, indent=2)

                    git_push_info = None
                    if auto_push:
                        title = (book_data or page_data or {}).get('title') or (book_data or page_data or {}).get('id') or 'Combo/Book'
                        git_push_info = git_commit_and_push(f"Update {title} landing page & catalog via Admin Studio")

                    self._send_cors_headers(200)
                    self.wfile.write(json.dumps({
                        "success": True,
                        "action": "save_combo_or_book",
                        "gitPush": git_push_info
                    }).encode('utf-8'))
                    return

                if content is None and 'sitePages' in data:
                    content = {"sitePages": data.get('sitePages')}

                if isinstance(content, (dict, list)):
                    out_text = json.dumps(content, ensure_ascii=False, indent=2)
                elif isinstance(content, str):
                    out_text = content
                else:
                    out_text = json.dumps(data, ensure_ascii=False, indent=2)

                with open(target_path, 'w', encoding='utf-8') as f:
                    f.write(out_text)
                print(f"[LocalSync OK] Saved JSON to disk: {rel_path} ({len(out_text)} chars)")

                # If site-pages-config.json was updated, auto-sync OG tags into HTML files on disk
                if rel_path.endswith('site-pages-config.json'):
                    try:
                        pages_list = None
                        if isinstance(content, dict):
                            pages_list = content.get('sitePages')
                        elif isinstance(content, list):
                            pages_list = content
                        if not pages_list:
                            parsed = json.loads(out_text)
                            pages_list = parsed.get('sitePages') if isinstance(parsed, dict) else parsed
                        if isinstance(pages_list, list):
                            sync_og_to_html_files(pages_list)
                    except Exception as og_err:
                        print(f"[LocalSync WARN] OG auto-sync exception: {og_err}")

                git_push_info = None
                if auto_push:
                    git_push_info = git_commit_and_push(f"Update {rel_path} via Admin Studio")

                self._send_cors_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "path": rel_path,
                    "gitPush": git_push_info
                }).encode('utf-8'))

            else:
                self._send_cors_headers(400)
                self.wfile.write(json.dumps({"success": False, "error": f"Unknown action: {action}"}).encode('utf-8'))

        except Exception as e:
            print(f"[LocalSync ERR] Error: {e}")
            self._send_cors_headers(500)
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))

if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), LocalSyncHandler)
    print(f"[LocalSync] Server with Git Auto-Publisher started on http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[LocalSync] Stopping Server...")
        server.server_close()
