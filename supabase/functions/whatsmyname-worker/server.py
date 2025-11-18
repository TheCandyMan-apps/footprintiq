#!/usr/bin/env python3
"""
Multi-Tool OSINT Worker API Server
Exposes REST API for WhatsMyName, Holehe, and GoSearch
"""

import json
import subprocess
import os
import sys
import tempfile
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

def log(msg):
    """Log with timestamp to stderr for immediate Cloud Run visibility"""
    timestamp = datetime.now().isoformat()
    sys.stderr.write(f"[{timestamp}] {msg}\n")
    sys.stderr.flush()

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
        elif self.path == '/test-sherlock':
            # Test endpoint to verify Sherlock installation
            self._set_headers()
            try:
                proc = subprocess.run(
                    ["sherlock", "--version"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                self.wfile.write(json.dumps({
                    'sherlock_installed': True,
                    'version_output': proc.stdout + proc.stderr,
                    'return_code': proc.returncode
                }).encode())
            except Exception as e:
                self.wfile.write(json.dumps({
                    'sherlock_installed': False,
                    'error': str(e)
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
                log(f"[OSINT Worker] Exception: {str(e)}")
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
            log(f"[Sherlock] Sanitized username from '{username}' to '{sanitized}'")
        
        if not sanitized:
            return self._send_json({
                'tool': 'whatsmyname',
                'username': username,
                'results': [],
                'error': 'Invalid username format - only alphanumeric, underscore, and hyphen allowed'
            })
        
        username = sanitized

        # Use sherlock instead (more reliable, proper CLI)
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.json', delete=False) as f:
            output_file = f.name
        
        try:
            # Build sherlock command
            cmd = ['sherlock', username, '--json', output_file, '--nsfw', '--timeout', '30']
            
            log(f"[Sherlock] Scanning username: {username}")
            log(f"[Sherlock] Executing command: {' '.join(cmd)}")
            log(f"[Sherlock] Output file: {output_file}")
            
            # Execute sherlock
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            # Log subprocess output
            log(f"[Sherlock] Return code: {result.returncode}")
            if result.stdout:
                log(f"[Sherlock] stdout: {result.stdout[:500]}")
            if result.stderr:
                log(f"[Sherlock] stderr: {result.stderr[:500]}")
            
            # Check file existence and size
            if os.path.exists(output_file):
                file_size = os.path.getsize(output_file)
                log(f"[Sherlock] ✓ Output file exists, size: {file_size} bytes")
            else:
                log(f"[Sherlock] ❌ Output file NOT created")
                return {
                    'tool': 'whatsmyname',
                    'username': username,
                    'results': [],
                    'error': 'Sherlock did not create output file'
                }

            # Read and parse JSON output
            try:
                with open(output_file, 'r') as f:
                    raw_content = f.read()
                    log(f"[Sherlock] RAW JSON OUTPUT ({len(raw_content)} chars):")
                    log(raw_content[:1000])  # First 1000 chars
                    scan_results = json.loads(raw_content)
            except json.JSONDecodeError as e:
                log(f"[Sherlock] ❌ Failed to parse JSON: {e}")
                return {
                    'tool': 'whatsmyname',
                    'username': username,
                    'results': [],
                    'error': f'Failed to parse Sherlock JSON output: {str(e)}'
                }
            
            log(f"[Sherlock] Parsed JSON type: {type(scan_results)}")
            log(f"[Sherlock] JSON keys: {list(scan_results.keys()) if isinstance(scan_results, dict) else 'not a dict'}")
            
            # Transform sherlock format to whatsmyname-like format
            # Sherlock can output in multiple formats:
            # 1. {"claimed": [{"name": "...", "url": "...", "urlMain": "..."}]}
            # 2. {"username": {"site": {"url_user": "...", "status": "..."}}}
            # 3. Direct dict of sites (no username wrapper)
            transformed_results = []
            
            # Try format 1: claimed array (newest Sherlock versions)
            if 'claimed' in scan_results and isinstance(scan_results['claimed'], list):
                log(f"[Sherlock] Found 'claimed' array format with {len(scan_results['claimed'])} results")
                for item in scan_results['claimed']:
                    if isinstance(item, dict):
                        # Extract URL from various possible fields
                        url = (
                            item.get('url') or 
                            item.get('urlUser') or 
                            item.get('url_user') or
                            item.get('urlMain') or
                            item.get('url_main')
                        )
                        
                        if url:
                            transformed_results.append({
                                'site': item.get('name') or item.get('site') or 'Unknown',
                                'url': url,
                                'status': item.get('status') or item.get('http_status'),
                                'found': True
                            })
            
            # Try format 2 & 3: nested username->sites structure OR direct sites dict
            else:
                log(f"[Sherlock] Trying nested/direct sites format")
                
                # If username is a top-level key, go one level deeper
                sites_dict = scan_results
                if username in scan_results and isinstance(scan_results[username], dict):
                    sites_dict = scan_results[username]
                    log(f"[Sherlock] Found username wrapper, unwrapping to {len(sites_dict)} sites")
                
                # Now iterate through sites
                if isinstance(sites_dict, dict):
                    for site_name, site_data in sites_dict.items():
                        if not isinstance(site_data, dict):
                            continue
                        
                        # Extract URL from various possible fields
                        url = (
                            site_data.get('url_user') or 
                            site_data.get('url') or
                            site_data.get('url_main') or 
                            site_data.get('urlMain') or
                            site_data.get('urlUser')
                        )
                        
                        # Check if found (various status indicators)
                        status_str = str(site_data.get('status', '')).lower()
                        http_status = site_data.get('http_status')
                        
                        # Multiple ways to indicate "found"
                        found = (
                            site_data.get('claimed') or
                            site_data.get('found') or 
                            site_data.get('exists') or
                            'claim' in status_str or
                            'found' in status_str or
                            http_status in [200, 301, 302] or
                            url  # If URL exists, assume found
                        )
                        
                        if url and found:
                            transformed_results.append({
                                'site': site_name,
                                'url': url,
                                'status': http_status,
                                'response_time': site_data.get('response_time_s'),
                                'found': True
                            })
            
            # Debug logging for transformed results
            log(f"[Sherlock] TRANSFORMED {len(transformed_results)} results from raw JSON")
            if transformed_results:
                log(f"[Sherlock] FIRST RESULT: {json.dumps(transformed_results[0])}")
            else:
                log(f"[Sherlock] ⚠️  WARNING: No results transformed. Raw structure sample:")
                log(json.dumps(scan_results)[:500])
            
            return {
                'tool': 'whatsmyname',  # Keep identifier for compatibility
                'username': username,
                'results': transformed_results,
                'raw_output': None
            }
        
        except Exception as e:
            log(f"[Sherlock] ❌ Exception in _handle_whatsmyname: {str(e)}")
            import traceback
            log(f"[Sherlock] Traceback: {traceback.format_exc()}")
            raise
        
        finally:
            # Clean up temp file
            if os.path.exists(output_file):
                try:
                    os.remove(output_file)
                    log(f"[Sherlock] Cleaned up temp file: {output_file}")
                except Exception as e:
                    log(f"[Sherlock] Failed to cleanup temp file: {e}")

    def _handle_holehe(self, data):
        email = data.get('email')
        
        if not email:
            raise ValueError('Email required for holehe')

        # Build holehe command
        cmd = ['holehe', email, '--json', '--no-color']

        # Execute holehe
        log(f"[Holehe] Scanning email: {email}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode != 0:
            log(f"[Holehe] Error: {result.stderr}")
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
        log(f"[GoSearch] Scanning username: {username}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode != 0:
            log(f"[GoSearch] Error: {result.stderr}")
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
    log(f'[OSINT Worker] Server running on port {port}')
    log(f'[OSINT Worker] Available tools: WhatsMyName (Sherlock), Holehe, GoSearch')
    log(f'[OSINT Worker] Test endpoint: /test-sherlock')
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    run_server(port)
