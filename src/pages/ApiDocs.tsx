import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Zap, Shield } from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="API Documentation | FootprintIQ"
        description="Complete API reference for FootprintIQ OSINT platform. Integrate powerful intelligence gathering into your applications."
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <Code className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">API Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Integrate FootprintIQ's OSINT capabilities into your applications
            </p>
          </div>

          {/* Quick Start */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Quick Start
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Get your API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate to Settings → API Keys and generate a new key
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Make your first request</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/scan/orchestrator \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": "john.doe@example.com",
    "scanType": "email",
    "providers": ["hibp", "intelx", "dehashed"]
  }'`}
                </pre>
              </div>
            </div>
          </Card>

          {/* API Reference */}
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scan">Scan</TabsTrigger>
              <TabsTrigger value="darkweb">Dark Web</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="consent">Consent</TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">POST /scan/orchestrator</h3>
                <p className="text-muted-foreground mb-4">Execute an OSINT scan on a target</p>
                
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`{
  "target": "string",          // Email, username, phone, domain, or IP
  "scanType": "string",        // email|username|phone|domain|ip
  "providers": ["string"],     // Optional: specific providers to use
  "options": {
    "deepScan": boolean,       // Use advanced features (costs more credits)
    "includeNSFW": boolean     // Include dating/NSFW platforms
  }
}`}
                </pre>

                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "scanId": "uuid",
  "status": "pending|processing|completed|failed",
  "findings": [...],
  "creditsUsed": number,
  "completedAt": "timestamp"
}`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="darkweb" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">POST /darkweb/monitor</h3>
                <p className="text-muted-foreground mb-4">Add a target for continuous dark web monitoring</p>
                
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "identifier": "string",      // Email, username, or domain
  "notifyEmail": "string"      // Optional: custom notification email
}`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="credits" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">GET /credits/balance</h3>
                <p className="text-muted-foreground mb-4">Check your current credit balance</p>
                
                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "balance": number,
  "subscriptionTier": "free|basic|premium|enterprise"
}`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="consent" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">POST /consent/verify</h3>
                <p className="text-muted-foreground mb-4">Verify consent before scanning a target</p>
                
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "target": "string",
  "consentType": "self|authorized|legal",
  "evidence": "string"         // Reason or authorization details
}`}
                </pre>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Rate Limits */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Rate Limits
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Endpoints</span>
                <span className="font-medium">1,000 requests/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Search Endpoints</span>
                <span className="font-medium">50 requests/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analytics Endpoints</span>
                <span className="font-medium">100 requests/hour</span>
              </div>
            </div>
          </Card>

          {/* Authentication */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Key className="w-6 h-6 text-primary" />
              Authentication
            </h2>
            <p className="text-muted-foreground mb-4">
              All API requests require an API key passed in the Authorization header:
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              Authorization: Bearer YOUR_API_KEY
            </pre>
          </Card>
        </div>
      </main>
    </div>
  );
}
