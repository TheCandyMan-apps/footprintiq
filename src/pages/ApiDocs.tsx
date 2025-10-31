import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Key, Shield, Zap } from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="API Documentation - FootprintIQ"
        description="Complete API reference for integrating FootprintIQ OSINT capabilities into your applications"
        canonical="https://footprintiq.app/api-docs"
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4">API v1.0</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">API Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Build powerful OSINT integrations with our REST API
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 text-center">
                <Key className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground">API key-based auth</p>
              </Card>
              <Card className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Secure</h3>
                <p className="text-sm text-muted-foreground">TLS encryption</p>
              </Card>
              <Card className="p-6 text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Fast</h3>
                <p className="text-sm text-muted-foreground">Low latency</p>
              </Card>
              <Card className="p-6 text-center">
                <Code className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">RESTful</h3>
                <p className="text-sm text-muted-foreground">Standard HTTP</p>
              </Card>
            </div>

            <Tabs defaultValue="authentication" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="scan">Scan</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
              </TabsList>

              <TabsContent value="authentication" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                  <p className="text-muted-foreground mb-6">
                    All API requests require an API key passed in the Authorization header.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Generate API Key</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Navigate to Settings → API Keys</li>
                        <li>Click "Generate New Key"</li>
                        <li>Configure scopes and permissions</li>
                        <li>Copy and securely store your key</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Using Your Key</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <div className="text-green-600"># cURL</div>
                        <div>curl -H "Authorization: Bearer YOUR_API_KEY" \</div>
                        <div className="ml-4">https://footprintiq.app/functions/v1/api/scan</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Available Scopes</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">scan:write</Badge>
                          <span className="text-sm">Create new scans</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">findings:read</Badge>
                          <span className="text-sm">Read scan findings</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">report:read</Badge>
                          <span className="text-sm">Download reports</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="scan" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">POST /api/scan</h2>
                  <p className="text-muted-foreground mb-6">
                    Create a new OSINT scan job
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Request Body</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`{
  "type": "email | username | domain | phone",
  "value": "target@example.com",
  "options": {
    "deep_scan": true,
    "providers": ["hibp", "dehashed"]
  }
}`}</pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Response (202 Accepted)</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}`}</pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Example Request</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`curl -X POST \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"email","value":"target@example.com"}' \\
  https://footprintiq.app/functions/v1/api/scan`}</pre>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="findings" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">GET /api/findings</h2>
                  <p className="text-muted-foreground mb-6">
                    Retrieve findings from completed scans
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Query Parameters</h3>
                      <ul className="space-y-2 text-sm">
                        <li><code className="bg-muted px-2 py-1 rounded">since</code> - ISO 8601 timestamp (optional)</li>
                        <li><code className="bg-muted px-2 py-1 rounded">limit</code> - Max results (1-100, default: 100)</li>
                        <li><code className="bg-muted px-2 py-1 rounded">offset</code> - Pagination offset</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Response (200 OK)</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`{
  "findings": [
    {
      "id": "...",
      "entity": "target@example.com",
      "entity_type": "email",
      "created_at": "2025-10-31T12:00:00Z",
      "findings": { ... }
    }
  ],
  "total": 42,
  "limit": 100,
  "offset": 0,
  "has_more": false
}`}</pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Example Request</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://footprintiq.app/functions/v1/api/findings?limit=10"`}</pre>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="health" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">GET /api/health</h2>
                  <p className="text-muted-foreground mb-6">
                    Check API health and status
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Response (200 OK)</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`{
  "status": "healthy",
  "timestamp": "2025-10-31T12:00:00Z",
  "version": "1.0.0",
  "database": "up"
}`}</pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Example Request</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`curl https://footprintiq.app/functions/v1/api/health`}</pre>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="p-6 mt-8">
              <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  API rate limits depend on your subscription tier:
                </p>
                <ul className="space-y-2">
                  <li><strong>Analyst:</strong> 100 requests/hour</li>
                  <li><strong>Pro:</strong> 500 requests/hour</li>
                  <li><strong>Enterprise:</strong> Custom limits</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Rate limit headers are included in all responses: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
                </p>
              </div>
            </Card>

            <Card className="p-6 mt-8">
              <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">HTTP Status Codes</h3>
                  <ul className="space-y-2 text-sm">
                    <li><code className="bg-muted px-2 py-1 rounded">200</code> - Success</li>
                    <li><code className="bg-muted px-2 py-1 rounded">202</code> - Accepted (async job created)</li>
                    <li><code className="bg-muted px-2 py-1 rounded">400</code> - Bad request</li>
                    <li><code className="bg-muted px-2 py-1 rounded">401</code> - Unauthorized (invalid API key)</li>
                    <li><code className="bg-muted px-2 py-1 rounded">403</code> - Forbidden (insufficient permissions)</li>
                    <li><code className="bg-muted px-2 py-1 rounded">429</code> - Rate limit exceeded</li>
                    <li><code className="bg-muted px-2 py-1 rounded">500</code> - Internal server error</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Error Response Format</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`{
  "error": "unauthorized",
  "message": "Invalid or expired API key"
}`}</pre>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}