import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Book, Zap, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="API Documentation | FootprintIQ"
        description="Complete API documentation for FootprintIQ OSINT platform. Integrate scanning, monitoring, and intelligence gathering into your workflows."
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-elegant">
              <Code className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                API Documentation
              </h1>
              <p className="text-muted-foreground mt-2">
                Integrate FootprintIQ's OSINT capabilities into your applications
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 hover:shadow-elevated transition-all duration-300">
              <Key className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Get API Keys</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate and manage your API keys
              </p>
              <Link to="/settings/api-keys">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Keys <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-elevated transition-all duration-300">
              <Zap className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Quick Start</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started with your first API call
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Guide <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-elevated transition-all duration-300">
              <Shield className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Rate Limits</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Understand usage limits and quotas
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Limits <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>

          <Tabs defaultValue="scanning" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scanning">Scanning</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="findings">Findings</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Scanning API */}
            <TabsContent value="scanning" className="space-y-6 mt-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">POST /api/v1/scan</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Initiate a comprehensive OSINT scan
                    </p>
                  </div>
                  <Badge>Enterprise</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Request Body</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "type": "email" | "username" | "domain" | "phone",
  "value": "target@example.com",
  "options": {
    "providers": ["hibp", "intelx", "dehashed"],
    "sensitiveSources": ["dating", "nsfw", "darkweb"],
    "darkweb": {
      "enabled": true,
      "depth": 2,
      "maxPages": 10
    }
  }
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Response</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "scanId": "scan_abc123",
  "status": "processing",
  "counts": {
    "total": 0,
    "byProvider": {}
  },
  "estimatedDuration": 15000
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Example (cURL)</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://api.footprintiq.app/v1/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "email",
    "value": "test@example.com",
    "options": {
      "providers": ["hibp", "dehashed"]
    }
  }'`}
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Monitoring API */}
            <TabsContent value="monitoring" className="space-y-6 mt-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">POST /api/v1/monitoring/targets</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a new dark web monitoring target
                    </p>
                  </div>
                  <Badge>Professional</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Request Body</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "type": "email" | "username" | "domain" | "wallet" | "keyword",
  "value": "target@example.com",
  "frequency": "daily" | "weekly",
  "alertChannels": ["email", "slack"]
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Response</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "id": "target_xyz789",
  "type": "email",
  "value": "target@example.com",
  "frequency": "daily",
  "active": true,
  "createdAt": "2025-01-15T10:30:00Z"
}`}
                    </pre>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">GET /api/v1/monitoring/targets</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      List all monitoring targets
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Query Parameters</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`?active=true&type=email&limit=50&offset=0`}
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Findings API */}
            <TabsContent value="findings" className="space-y-6 mt-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">GET /api/v1/findings</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Retrieve scan findings with filtering
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Query Parameters</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`?workspace=ws_abc&since=2025-01-01&category=breach&severity=high&limit=100`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Response</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "findings": [
    {
      "id": "finding_123",
      "type": "credential_breach",
      "severity": "high",
      "confidence": 0.95,
      "provider": "dehashed",
      "observedAt": "2025-01-10T14:22:00Z",
      "evidence": [
        { "key": "email", "value": "user@example.com" },
        { "key": "password", "value": "[REDACTED]" }
      ]
    }
  ],
  "total": 247,
  "page": 1,
  "limit": 100
}`}
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Reports API */}
            <TabsContent value="reports" className="space-y-6 mt-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">GET /api/v1/reports/:id.pdf</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate and download PDF report
                    </p>
                  </div>
                  <Badge>Professional</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Headers</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY
Accept: application/pdf`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Response</h4>
                    <p className="text-sm text-muted-foreground">
                      Binary PDF file with comprehensive scan results, charts, and AI analysis
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Authentication */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Authentication</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              All API requests require authentication using a Bearer token in the Authorization header.
            </p>
            <pre className="bg-muted p-4 rounded-lg">
{`Authorization: Bearer YOUR_API_KEY`}
            </pre>
            <div className="mt-4">
              <Link to="/settings/api-keys">
                <Button>
                  <Key className="w-4 h-4 mr-2" />
                  Manage API Keys
                </Button>
              </Link>
            </div>
          </Card>

          {/* Rate Limits */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Rate Limits</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Analyst Basic</span>
                <Badge variant="outline">60 requests/min</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Professional OSINT</span>
                <Badge variant="outline">300 requests/min</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Enterprise Intelligence</span>
                <Badge variant="outline">1000 requests/min</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Rate limit headers are included in all responses: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
