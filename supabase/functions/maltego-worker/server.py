#!/usr/bin/env python3
"""
Maltego Transform REST API Server
Executes OSINT transforms and returns graph data
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess
import os
from urllib.parse import parse_qs, urlparse

class MaltegoTransformHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Health check endpoint"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy"}).encode())
        else:
            self.send_error(404)

    def do_POST(self):
        """Execute transform endpoint"""
        if self.path != '/transform':
            self.send_error(404)
            return

        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request = json.loads(post_data.decode('utf-8'))

            entity = request.get('entity')
            transforms = request.get('transforms', [])
            timeout = request.get('timeout', 30)

            if not entity:
                self.send_error(400, "Missing 'entity' parameter")
                return

            # Execute transforms
            results = self.execute_transforms(entity, transforms, timeout)

            # Return graph data
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(results).encode())

        except Exception as e:
            self.send_error(500, str(e))

    def execute_transforms(self, entity, transforms, timeout):
        """
        Execute Maltego transforms using maltego-trx
        Returns graph data with nodes and edges
        """
        nodes = []
        edges = []
        
        # Add initial entity as root node
        root_id = f"entity_{entity}"
        nodes.append({
            "id": root_id,
            "label": entity,
            "type": "root",
            "properties": {}
        })

        # Execute each transform
        for transform_name in transforms:
            try:
                # Map transform names to actual commands
                if transform_name == "To IP from Domain":
                    results = self.dns_to_ip(entity)
                elif transform_name == "To Email from Domain":
                    results = self.domain_to_emails(entity)
                elif transform_name == "To Phone from Name":
                    results = self.name_to_phone(entity)
                elif transform_name == "To Social Media from Username":
                    results = self.username_to_social(entity)
                elif transform_name == "To WHOIS from Domain":
                    results = self.domain_to_whois(entity)
                else:
                    continue

                # Add results as nodes and edges
                for result in results:
                    node_id = f"{transform_name}_{result['value']}"
                    nodes.append({
                        "id": node_id,
                        "label": result['value'],
                        "type": result['type'],
                        "properties": result.get('properties', {})
                    })
                    edges.append({
                        "from": root_id,
                        "to": node_id,
                        "label": transform_name,
                        "weight": result.get('confidence', 1.0)
                    })

            except Exception as e:
                print(f"Transform {transform_name} failed: {e}")
                continue

        return {
            "nodes": nodes,
            "edges": edges,
            "entity": entity,
            "transforms_executed": len(transforms)
        }

    def dns_to_ip(self, domain):
        """DNS resolution transform"""
        import dns.resolver
        results = []
        try:
            answers = dns.resolver.resolve(domain, 'A')
            for rdata in answers:
                results.append({
                    "value": str(rdata),
                    "type": "ip_address",
                    "confidence": 1.0
                })
        except:
            pass
        return results

    def domain_to_emails(self, domain):
        """Extract emails associated with domain"""
        # Placeholder - would integrate with email discovery APIs
        return [
            {"value": f"info@{domain}", "type": "email", "confidence": 0.5},
            {"value": f"contact@{domain}", "type": "email", "confidence": 0.5}
        ]

    def name_to_phone(self, name):
        """Find phone numbers associated with name"""
        # Placeholder - would integrate with phone lookup APIs
        return []

    def username_to_social(self, username):
        """Find social media profiles"""
        # Placeholder - would integrate with Maigret or similar
        platforms = ["twitter", "instagram", "linkedin", "github"]
        results = []
        for platform in platforms:
            results.append({
                "value": f"https://{platform}.com/{username}",
                "type": "social_media",
                "properties": {"platform": platform},
                "confidence": 0.7
            })
        return results

    def domain_to_whois(self, domain):
        """WHOIS lookup"""
        # Placeholder - would integrate with WHOIS APIs
        return [
            {
                "value": f"WHOIS data for {domain}",
                "type": "whois",
                "properties": {"registrar": "Unknown"},
                "confidence": 0.8
            }
        ]

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 8080))
    server = HTTPServer(('0.0.0.0', PORT), MaltegoTransformHandler)
    print(f'Maltego Transform Server running on port {PORT}')
    server.serve_forever()
