#!/usr/bin/env python3
"""
Multi-Tool OSINT Worker API Server
Exposes REST API for WhatsMyName, Holehe, and GoSearch
"""

import json
import subprocess
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class OsintWorkerHandler(BaseHTTPRequestHandler):
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
                'service': 'osint-worker',
                'tools': ['sherlock', 'holehe', 'gosearch']
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

                # Validate token if OSINT_WORKER_TOKEN is set
                worker_token = os.environ.get('OSINT_WORKER_TOKEN')
                if worker_token:
                    request_token = data.get('token')
                    if not request_token or request_token != worker_token:
                        self._set_headers(401)
                        self.wfile.write(json.dumps({'error': 'Unauthorized: invalid token'}).encode())
                        return

                # Determine tool (default to whatsmyname for backwards compatibility)
                tool = data.get('tool', 'whatsmyname')
                
                # Route to appropriate handler
                if tool == 'whatsmyname':
                    result = self._handle_whatsmyname(data)
                elif tool == 'holehe':
                    result = self._handle_holehe(data)
                elif tool == 'gosearch':
                    result = self._handle_gosearch(data)
                else:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'error': f'Unknown tool: {tool}'}).encode())
                    return

                self._set_headers()
                self.wfile.write(json.dumps(result).encode())

            except subprocess.TimeoutExpired:
                self._set_headers(504)
                self.wfile.write(json.dumps({'error': 'Scan timeout'}).encode())
            except Exception as e:
                print(f"[OSINT Worker] Exception: {str(e)}")
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    'error': 'Internal server error',
                    'details': str(e)
                }).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def _handle_whatsmyname(self, data):
        username = data.get('username', '').strip()
        filters = data.get('filters', '')
        
        # Sanitize username - remove special chars that might break Sherlock
        # Keep alphanumeric, underscore, hyphen only
        sanitized = ''.join(c for c in username if c.isalnum() or c in ['_', '-'])
        
        if sanitized != username:
            print(f"[Sherlock] Sanitized username from '{username}' to '{sanitized}'")
        
        if not sanitized:
            return self._send_json({
                'tool': 'whatsmyname',
                'username': username,
                'results': [],
                'error': 'Invalid username format - only alphanumeric, underscore, and hyphen allowed'
            })
        
        username = sanitized

        # Use sherlock instead (more reliable, proper CLI)
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.json', delete=False) as f:
            output_file = f.name
        
        try:
            # Build sherlock command
            cmd = ['sherlock', username, '--json', output_file, '--timeout', '30']
            
            # Add site filtering if provided
            if filters:
                # Sherlock doesn't have category filters like whatsmyname
                # Let it search all sites for now
                pass
            
            # Execute sherlock
            print(f"[Sherlock/WhatsMyName] Scanning username: {username}")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            # Sherlock returns 0 even if username not found on all sites
            # Read JSON output
            with open(output_file, 'r') as f:
                scan_results = json.load(f)
            
            # Debug logging for raw Sherlock output
            print(f"[Sherlock] RAW JSON OUTPUT (first 2000 chars):")
            print(json.dumps(scan_results)[:2000])
            
            # Transform sherlock format to whatsmyname-like format
            # Sherlock JSON: { "username": { "site": {"url": "...", "status": "Claimed"} } }
            transformed_results = []
            for username_key, sites in scan_results.items():
                if isinstance(sites, dict):
                    for site_name, site_data in sites.items():
                        if isinstance(site_data, dict) and site_data.get('url_user'):
                            transformed_results.append({
                                'site': site_name,
                                'url': site_data.get('url_user'),
                                'status': site_data.get('http_status'),
                                'response_time': site_data.get('response_time_s'),
                                'found': True
                            })
            
            # Debug logging for transformed results
            print(f"[Sherlock] TRANSFORMED {len(transformed_results)} results from raw JSON")
            if transformed_results:
                print(f"[Sherlock] FIRST RESULT: {json.dumps(transformed_results[0])}")
            else:
                print(f"[Sherlock] WARNING: No results transformed from raw JSON")
            
            return {
                'tool': 'whatsmyname',  # Keep identifier for compatibility
                'username': username,
                'results': transformed_results,
                'raw_output': None
            }
        
        finally:
            # Clean up temp file
            import os
            if os.path.exists(output_file):
                os.remove(output_file)

    def _handle_holehe(self, data):
        email = data.get('email')
        
        if not email:
            raise ValueError('Email required for holehe')

        # Build holehe command
        cmd = ['holehe', email, '--json', '--no-color']

        # Execute holehe
        print(f"[Holehe] Scanning email: {email}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode != 0:
            print(f"[Holehe] Error: {result.stderr}")
            raise RuntimeError(f'Holehe failed: {result.stderr}')

        # Parse JSON output
        try:
            scan_results = json.loads(result.stdout)
        except json.JSONDecodeError:
            # If not JSON, wrap the output
            scan_results = []

        return {
            'tool': 'holehe',
            'email': email,
            'results': scan_results,
            'raw_output': result.stdout if not scan_results else None
        }

    def _handle_gosearch(self, data):
        username = data.get('username')
        
        if not username:
            raise ValueError('Username required for gosearch')

        # Build gosearch command
        cmd = ['gosearch', '-u', username, '--no-false-positives']

        # Execute gosearch
        print(f"[GoSearch] Scanning username: {username}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode != 0:
            print(f"[GoSearch] Error: {result.stderr}")
            # GoSearch might return non-zero even on success, check output
            if not result.stdout:
                raise RuntimeError(f'GoSearch failed: {result.stderr}')

        # GoSearch may not support JSON output, parse text output
        results = []
        raw_output = result.stdout
        
        # Try to parse structured output if available
        for line in result.stdout.split('\n'):
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('['):
                # Basic parsing: look for patterns like "site: url"
                if ':' in line:
                    parts = line.split(':', 1)
                    if len(parts) == 2:
                        results.append({
                            'site': parts[0].strip(),
                            'url': parts[1].strip(),
                            'username': username,
                            'status': 'found'
                        })

        return {
            'tool': 'gosearch',
            'username': username,
            'results': results,
            'raw_output': raw_output if not results else None
        }

def run_server(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, OsintWorkerHandler)
    print(f'[OSINT Worker] Server running on port {port}')
    print(f'[OSINT Worker] Available tools: WhatsMyName, Holehe, GoSearch')
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    run_server(port)
