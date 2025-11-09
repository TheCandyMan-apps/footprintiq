#!/usr/bin/env python3
"""
Recon-ng REST API Worker
Executes recon-ng modules and returns results as JSON
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import subprocess
import tempfile
import os

class ReconNgHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/scan':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request = json.loads(post_data.decode('utf-8'))
            
            target = request.get('target')
            modules = request.get('modules', [])
            workspace = request.get('workspace', 'default')
            
            try:
                # Create workspace and script
                with tempfile.NamedTemporaryFile(mode='w', suffix='.rc', delete=False) as script:
                    script.write(f"workspaces create {workspace}\n")
                    script.write(f"workspaces load {workspace}\n")
                    
                    for module in modules:
                        script.write(f"modules load {module}\n")
                        script.write(f"options set SOURCE {target}\n")
                        script.write("run\n")
                    
                    script.write("show hosts\n")
                    script.write("show contacts\n")
                    script.write("show locations\n")
                    script_path = script.name
                
                # Execute recon-ng
                result = subprocess.run(
                    ['recon-ng', '-r', script_path],
                    capture_output=True,
                    text=True,
                    timeout=300
                )
                
                # Clean up
                os.unlink(script_path)
                
                # Parse output (simplified)
                response = {
                    'success': result.returncode == 0,
                    'output': result.stdout,
                    'error': result.stderr,
                    'results': self._parse_results(result.stdout)
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def _parse_results(self, output):
        """Parse recon-ng output for results"""
        results = []
        # Simple parsing logic - extract key findings
        lines = output.split('\n')
        for line in lines:
            if 'Results:' in line or 'Found:' in line:
                results.append(line.strip())
        return results

def run_server(port=8080):
    server = HTTPServer(('0.0.0.0', port), ReconNgHandler)
    print(f'Recon-ng worker listening on port {port}')
    server.serve_forever()

if __name__ == '__main__':
    run_server()
