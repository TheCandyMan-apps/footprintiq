import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Zap, Shield, ArrowRight, Code, CheckCircle } from "lucide-react";

const ApiDocs = () => {
  return (
    <>
      <SEO
        title="FootprintIQ API Documentation (v1) — OSINT & Persona Intelligence"
        description="Integrate FootprintIQ's OSINT, Persona DNA, and Predictive Risk Index via REST API. Complete developer documentation with authentication, endpoints, and examples."
        canonical="https://footprintiq.app/docs/api"
        ogImage="https://footprintiq.app/og/persona-dna.webp"
        schema={{
          custom: {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "FootprintIQ API Documentation (v1) — OSINT & Persona Intelligence",
            "description": "Integrate FootprintIQ's OSINT, Persona DNA, and Predictive Risk Index via REST API.",
            "author": {
              "@type": "Organization",
              "name": "FootprintIQ Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "FootprintIQ",
              "logo": {
                "@type": "ImageObject",
                "url": "https://footprintiq.app/logo.png"
              }
            },
            "datePublished": "2025-01-15",
            "dateModified": "2025-01-15"
          }
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 border-b border-border/40">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">v1.0</Badge>
              <Badge variant="outline">REST API</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              FootprintIQ API Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Integrate OSINT intelligence, Persona DNA profiling, and Predictive Risk Index scoring directly into your security workflows.
            </p>
          </div>
        </section>

        <div className="container max-w-5xl mx-auto px-4 py-12">
          {/* Overview */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" />
              Overview
            </h2>
            <Card className="p-6 mb-6">
              <p className="text-lg mb-4">
                The FootprintIQ API provides programmatic access to our comprehensive OSINT scanning engine, 
                persona correlation algorithms, and risk assessment models. Built for security teams, fraud analysts, 
                and compliance professionals.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Privacy-First</div>
                    <div className="text-sm text-muted-foreground">GDPR & CCPA compliant</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Real-Time</div>
                    <div className="text-sm text-muted-foreground">Sub-second responses</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Secure</div>
                    <div className="text-sm text-muted-foreground">256-bit encryption</div>
                  </div>
                </div>
              </div>
            </Card>

            <Alert className="border-primary/20 bg-primary/5">
              <Code className="w-4 h-4" />
              <AlertDescription>
                <strong>Base URL:</strong> <code className="bg-muted px-2 py-1 rounded">https://api.footprintiq.app/v1</code>
              </AlertDescription>
            </Alert>
          </section>

          {/* Authentication */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Lock className="w-8 h-8 text-primary" />
              Authentication
            </h2>
            <Card className="p-6">
              <p className="mb-4">
                All API requests require an API key passed in the <code className="bg-muted px-2 py-1 rounded">Authorization</code> header:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`curl -X POST https://api.footprintiq.app/v1/findings \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"target": "example@email.com", "type": "email"}'`}</code>
              </pre>
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="font-semibold mb-2">🔑 Getting Your API Key</p>
                <p className="text-sm text-muted-foreground">
                  Navigate to <strong>Settings → API Keys</strong> in your FootprintIQ dashboard to generate a new key. 
                  Pro and Enterprise plans include higher rate limits.
                </p>
              </div>
            </Card>
          </section>

          {/* Endpoints */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
            
            {/* POST /findings */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge>POST</Badge>
                <code className="text-lg">/findings</code>
              </div>
              <p className="mb-4">Run an OSINT scan on an email, username, domain, phone, or IP address.</p>
              
              <h4 className="font-semibold mt-6 mb-3">Request Body</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                <code>{`{
  "target": "john.doe@example.com",
  "type": "email",
  "include_persona": true,
  "include_risk_score": true
}`}</code>
              </pre>

              <h4 className="font-semibold mt-6 mb-3">Response (200 OK)</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`{
  "scan_id": "scan_abc123",
  "target": "john.doe@example.com",
  "findings": [
    {
      "id": "finding_xyz789",
      "type": "breach",
      "title": "LinkedIn Breach (2021)",
      "severity": "high",
      "provider": "haveibeenpwned",
      "evidence": { "breach_date": "2021-06-15", "compromised_data": ["emails", "passwords"] }
    }
  ],
  "persona_dna": {
    "identity_score": 0.87,
    "clusters": ["professional", "developer"],
    "linked_accounts": 12
  },
  "risk_index": 72,
  "timestamp": "2025-01-15T14:32:00Z"
}`}</code>
              </pre>
            </Card>

            {/* GET /persona */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">GET</Badge>
                <code className="text-lg">/persona/:scan_id</code>
              </div>
              <p className="mb-4">Retrieve Persona DNA correlation map for a completed scan.</p>
              
              <h4 className="font-semibold mt-6 mb-3">Response (200 OK)</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`{
  "scan_id": "scan_abc123",
  "persona_dna": {
    "identity_score": 0.87,
    "clusters": ["professional", "developer", "photographer"],
    "linked_accounts": 12,
    "correlation_graph": {
      "nodes": [...],
      "edges": [...]
    }
  },
  "generated_at": "2025-01-15T14:32:00Z"
}`}</code>
              </pre>
            </Card>

            {/* GET /status */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">GET</Badge>
                <code className="text-lg">/status/:scan_id</code>
              </div>
              <p className="mb-4">Check the status of a running scan.</p>
              
              <h4 className="font-semibold mt-6 mb-3">Response (200 OK)</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`{
  "scan_id": "scan_abc123",
  "status": "completed",
  "progress": 100,
  "findings_count": 14,
  "started_at": "2025-01-15T14:30:00Z",
  "completed_at": "2025-01-15T14:32:00Z"
}`}</code>
              </pre>
            </Card>
          </section>

          {/* Compliance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Compliance & Usage</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Rate Limits</div>
                    <div className="text-sm text-muted-foreground">
                      Free: 10 req/min • Pro: 100 req/min • Enterprise: Custom
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Data Retention</div>
                    <div className="text-sm text-muted-foreground">
                      Scan results stored for 90 days (configurable in Enterprise)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Acceptable Use</div>
                    <div className="text-sm text-muted-foreground">
                      API must only be used for legitimate security research, fraud prevention, and compliance purposes. See our <a href="/responsible-use" className="text-primary hover:underline">Responsible Use Policy</a>.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Use Cases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Example Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">🛡️ Fraud Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Screen new user registrations for compromised emails, high-risk domains, and suspicious patterns.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">📊 Threat Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Enrich alerts with OSINT context, breach history, and persona correlation for faster triage.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">🔍 Due Diligence</h3>
                <p className="text-sm text-muted-foreground">
                  Verify identities during onboarding with comprehensive digital footprint analysis.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">🎯 Red Team Operations</h3>
                <p className="text-sm text-muted-foreground">
                  Automate reconnaissance workflows with API-driven OSINT collection and reporting.
                </p>
              </Card>
            </div>
          </section>

          {/* Roadmap */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">API Roadmap</h2>
            <Card className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Q1 2025:</span> Webhooks for async scan completion
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Q2 2025:</span> Bulk scanning endpoints (CSV upload)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Q2 2025:</span> GraphQL API support
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Q3 2025:</span> Real-time monitoring subscriptions
                  </div>
                </li>
              </ul>
            </Card>
          </section>

          {/* Support */}
          <section>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-6">
                Our developer support team is here to help you integrate the FootprintIQ API.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/support" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contact Support
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a 
                  href="/blog/persona-dna-and-evidence-packs" 
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Read Launch Blog
                </a>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default ApiDocs;