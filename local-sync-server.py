"""
Aarogyam India - Local Disk Sync Server
Listens on http://127.0.0.1:5505 to automatically save uploaded assets
and page configs directly to the local disk during Live Server preview.
"""
import http.server
import json
import base64
import os
import sys

PORT = 5505
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class LocalSyncHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean logging
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
            "server": "Aarogyam Local Disk Sync",
            "baseDir": BASE_DIR
        }).encode('utf-8'))

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            action = data.get('action')
            rel_path = data.get('path', '').replace('\\', '/').lstrip('/')
            
            if not rel_path:
                self._send_cors_headers(400)
                self.wfile.write(json.dumps({"success": False, "error": "Missing path"}).encode('utf-8'))
                return

            target_path = os.path.abspath(os.path.join(BASE_DIR, rel_path))
            # Security verification
            if not target_path.startswith(BASE_DIR):
                self._send_cors_headers(403)
                self.wfile.write(json.dumps({"success": False, "error": "Path traversal prohibited"}).encode('utf-8'))
                return

            os.makedirs(os.path.dirname(target_path), exist_ok=True)

            if action == 'upload_asset' or 'base64' in data:
                b64_str = data.get('base64', '')
                if ',' in b64_str:
                    b64_str = b64_str.split(',', 1)[1]
                file_bytes = base64.b64decode(b64_str)
                with open(target_path, 'wb') as f:
                    f.write(file_bytes)
                print(f"[LocalSync OK] Saved asset to disk: {rel_path} ({len(file_bytes)} bytes)")
                self._send_cors_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "path": rel_path,
                    "size": len(file_bytes),
                    "url": "/" + rel_path
                }).encode('utf-8'))

            elif action == 'save_config' or rel_path.endswith('.json'):
                content = data.get('content')
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
                self._send_cors_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "path": rel_path
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
    print(f"[LocalSync] Server started on http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[LocalSync] Stopping Server...")
        server.server_close()
