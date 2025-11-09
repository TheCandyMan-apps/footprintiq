#!/usr/bin/env python3
"""
WhatsMyName Worker API Server
Exposes REST API for username OSINT lookups
"""

import json
import subprocess
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class WhatsMyNameHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        if self.path == '/health':
            self._set_headers()
            self.wfile.write(json.dumps({
                'status': 'healthy',
                'service': 'whatsmyname-worker'
            }).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def do_POST(self):
        if self.path == '/scan':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))

                username = data.get('username')
                filters = data.get('filters', '')
                
                if not username:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'error': 'Username required'}).encode())
                    return

                # Build whatsmyname command
                cmd = ['whatsmyname', '-u', username, '-j']
                
                # Add filters if provided (e.g., category:social)
                if filters:
                    cmd.extend(['--filter', filters])

                # Execute whatsmyname
                print(f"[WhatsMyName] Scanning username: {username}, filters: {filters}")
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minute timeout
                )

                if result.returncode != 0:
                    print(f"[WhatsMyName] Error: {result.stderr}")
                    self._set_headers(500)
                    self.wfile.write(json.dumps({
                        'error': 'Scan failed',
                        'details': result.stderr
                    }).encode())
                    return

                # Parse JSON output
                try:
                    scan_results = json.loads(result.stdout)
                except json.JSONDecodeError:
                    # If not JSON, wrap the output
                    scan_results = {
                        'username': username,
                        'raw_output': result.stdout
                    }

                print(f"[WhatsMyName] Scan complete for {username}")
                self._set_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'username': username,
                    'results': scan_results
                }).encode())

            except subprocess.TimeoutExpired:
                self._set_headers(504)
                self.wfile.write(json.dumps({'error': 'Scan timeout'}).encode())
            except Exception as e:
                print(f"[WhatsMyName] Exception: {str(e)}")
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    'error': 'Internal server error',
                    'details': str(e)
                }).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

def run_server(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, WhatsMyNameHandler)
    print(f'[WhatsMyName] Server running on port {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    run_server(port)
