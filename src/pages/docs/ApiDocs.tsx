import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Shield, ArrowRight, Code, CheckCircle, FileJson, Network, XCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ApiDocs = () => {
  // API Schema for AI discovery
  const apiSchema = {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    "name": "FootprintIQ API",
    "description": "Ethical OSINT analysis API for digital footprint scanning. Provides probability-based confidence scoring, not identity confirmation. Designed for security teams, compliance, and fraud prevention.",
    "url": "https://footprintiq.app/docs/api",
    "documentation": "https://footprintiq.app/docs/api",
    "termsOfService": "https://footprintiq.app/terms",
    "provider": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": "https://footprintiq.app"
    }
  };

  const techArticleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "FootprintIQ API Documentation — Ethical OSINT Integration",
    "description": "Complete API documentation for integrating FootprintIQ's ethical OSINT analysis capabilities. REST endpoints for username, email, phone, and domain scanning with LENS confidence scoring.",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://footprintiq.app/logo.png"
      }
    },
    "datePublished": "2025-01-17",
    "dateModified": "2025-01-17",
    "keywords": "osint api, digital footprint api, ethical osint, security api, threat intelligence api, identity verification api"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        "position": 1,
        "name": "Home",
        "item": "https://footprintiq.app"
      },
      {
        "@type": "ListItem" as const,
        "position": 2,
        "name": "Documentation",
        "item": "https://footprintiq.app/docs"
      },
      {
        "@type": "ListItem" as const,
        "position": 3,
        "name": "API Reference",
        "item": "https://footprintiq.app/docs/api"
      }
    ]
  };

  const endpoints = [
    {
      method: "POST",
      path: "/v1/scans",
      description: "Initiate a new OSINT scan on a target",
      parameters: [
        { name: "target", type: "string", required: true, description: "The value to scan (email, username, phone, or domain)" },
        { name: "type", type: "string", required: true, description: "Scan type: 'email', 'username', 'phone', or 'domain'" },
        { name: "include_lens", type: "boolean", required: false, description: "Enable LENS confidence analysis (default: true)" }
      ]
    },
    {
      method: "GET",
      path: "/v1/scans/:id",
      description: "Retrieve scan status and results",
      parameters: [
        { name: "id", type: "string", required: true, description: "Scan ID returned from POST /v1/scans" }
      ]
    },
    {
      method: "GET",
      path: "/v1/scans/:id/findings",
      description: "Get all findings for a completed scan with LENS confidence scores",
      parameters: [
        { name: "id", type: "string", required: true, description: "Scan ID" },
        { name: "min_confidence", type: "number", required: false, description: "Filter by minimum LENS confidence (0-100)" },
        { name: "severity", type: "string", required: false, description: "Filter by severity: 'critical', 'high', 'medium', 'low', 'info'" }
      ]
    },
    {
      method: "POST",
      path: "/v1/webhooks",
      description: "Register a webhook for scan completion notifications",
      parameters: [
        { name: "url", type: "string", required: true, description: "HTTPS URL to receive webhook events" },
        { name: "events", type: "array", required: true, description: "Event types: ['scan.completed', 'scan.failed']" }
      ]
    }
  ];

  const rateLimits = [
    { plan: "Free", requests: "10 req/min", scans: "5 scans/day" },
    { plan: "Pro", requests: "100 req/min", scans: "100 scans/day" },
    { plan: "Business", requests: "500 req/min", scans: "1,000 scans/day" },
    { plan: "Enterprise", requests: "Custom", scans: "Custom" }
  ];

  const nonCapabilities = [
    "Does not confirm or verify identities",
    "Does not monitor or track individuals over time",
    "Does not access private or authenticated data",
    "Does not guarantee match accuracy",
    "Does not support surveillance use cases"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="FootprintIQ API Documentation — Ethical OSINT Integration"
        description="Complete API documentation for integrating FootprintIQ's ethical OSINT analysis. REST endpoints for username, email, phone, and domain scanning with LENS confidence scoring."
        canonical="https://footprintiq.app/docs/api"
        ogImage="https://footprintiq.app/og-image.jpg"
        schema={{
          custom: [apiSchema, techArticleSchema],
          breadcrumbs: breadcrumbSchema
        }}
      />

      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20 border-b border-border/40">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">v1.0</Badge>
              <Badge variant="outline">REST API</Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20">LENS Integrated</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              FootprintIQ API Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-4">
              Integrate ethical OSINT analysis into your security workflows. 
              Scan usernames, emails, phones, and domains with probability-based confidence scoring.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl">
              <span className="font-medium text-foreground/80">No identity claims. No surveillance. No private data access.</span>
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Ethical Notice */}
          <Alert className="mb-12 border-primary/20 bg-primary/5">
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>Ethical OSINT API:</strong> FootprintIQ API provides probability-based analysis of public data. 
              Results express likelihood, not certainty. All findings include LENS confidence scores that acknowledge uncertainty.
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <section id="overview" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" />
              Overview
            </h2>
            <Card className="p-6 mb-6">
              <p className="text-lg mb-4">
                The FootprintIQ API provides programmatic access to ethical OSINT scanning capabilities. 
                Every response includes LENS confidence scoring that explains reliability and highlights uncertainty.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <div>
                    <div className="font-semibold">Privacy-First</div>
                    <div className="text-sm text-muted-foreground">GDPR & CCPA compliant</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Network className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <div>
                    <div className="font-semibold">LENS Analysis</div>
                    <div className="text-sm text-muted-foreground">Confidence scoring included</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <div>
                    <div className="font-semibold">Secure</div>
                    <div className="text-sm text-muted-foreground">256-bit encryption</div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm">
                <strong>Base URL:</strong>{" "}
                <code className="bg-muted px-2 py-1 rounded">https://api.footprintiq.app/v1</code>
              </p>
            </div>
          </section>

          {/* What This API Does NOT Do */}
          <section id="non-capabilities" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              Explicit Non-Capabilities
            </h2>
            <Card className="p-6 border-2 border-destructive/20">
              <p className="text-muted-foreground mb-6">
                The FootprintIQ API is designed with intentional limitations to ensure ethical use:
              </p>
              <div className="space-y-3">
                {nonCapabilities.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Lock className="w-8 h-8 text-primary" />
              Authentication
            </h2>
            <Card className="p-6">
              <p className="mb-4">
                All API requests require an API key passed in the <code className="bg-muted px-2 py-1 rounded">Authorization</code> header:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST https://api.footprintiq.app/v1/scans \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"target": "example_username", "type": "username"}'`}</code>
              </pre>
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="font-semibold mb-2">🔑 Getting Your API Key</p>
                <p className="text-sm text-muted-foreground">
                  Navigate to <strong>Settings → API Keys</strong> in your FootprintIQ dashboard.
                  Pro and Enterprise plans include higher rate limits.
                </p>
              </div>
            </Card>
          </section>

          {/* Endpoints */}
          <section id="endpoints" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Code className="w-8 h-8 text-primary" />
              API Endpoints
            </h2>
            
            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant={endpoint.method === "POST" ? "default" : "secondary"}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-lg">{endpoint.path}</code>
                  </div>
                  <p className="mb-4 text-muted-foreground">{endpoint.description}</p>
                  
                  <h4 className="font-semibold mt-4 mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.parameters.map((param, pIndex) => (
                      <div key={pIndex} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                        <code className="text-sm font-mono">{param.name}</code>
                        <Badge variant="outline" className="text-xs">{param.type}</Badge>
                        {param.required && <Badge variant="destructive" className="text-xs">required</Badge>}
                        <span className="text-sm text-muted-foreground">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Response Format */}
          <section id="response-format" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <FileJson className="w-8 h-8 text-primary" />
              Response Format
            </h2>
            <Card className="p-6">
              <h4 className="font-semibold mb-3">Scan Results with LENS Confidence</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "scan_id": "scan_abc123",
  "target": "example_username",
  "type": "username",
  "status": "completed",
  "findings": [
    {
      "id": "finding_xyz789",
      "platform": "GitHub",
      "url": "https://github.com/example_username",
      "lens_confidence": 87,
      "confidence_explanation": "High consistency across profile metadata",
      "severity": "info",
      "evidence": {
        "profile_exists": true,
        "activity_detected": true,
        "corroborating_signals": 3
      }
    }
  ],
  "lens_summary": {
    "overall_confidence": 72,
    "uncertainty_factors": [
      "Common username pattern",
      "Limited cross-platform corroboration"
    ],
    "false_positive_risk": "medium"
  },
  "timestamp": "2025-01-17T14:32:00Z"
}`}</code>
              </pre>
              <div className="mt-4 p-4 bg-muted/50 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> LENS confidence scores (0-100) express probability, not certainty. 
                  The <code>uncertainty_factors</code> array explains why confidence may be limited.
                </p>
              </div>
            </Card>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">Rate Limits</h2>
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold">Requests</th>
                      <th className="text-left py-3 px-4 font-semibold">Scans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateLimits.map((limit, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">{limit.plan}</td>
                        <td className="py-3 px-4 text-muted-foreground">{limit.requests}</td>
                        <td className="py-3 px-4 text-muted-foreground">{limit.scans}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Error Codes */}
          <section id="error-codes" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">Error Responses</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 bg-muted/30 rounded">
                  <code className="font-mono text-sm">400</code>
                  <span className="text-muted-foreground">Invalid request parameters</span>
                </div>
                <div className="flex items-start gap-4 p-3 bg-muted/30 rounded">
                  <code className="font-mono text-sm">401</code>
                  <span className="text-muted-foreground">Invalid or missing API key</span>
                </div>
                <div className="flex items-start gap-4 p-3 bg-muted/30 rounded">
                  <code className="font-mono text-sm">403</code>
                  <span className="text-muted-foreground">Insufficient permissions for requested operation</span>
                </div>
                <div className="flex items-start gap-4 p-3 bg-muted/30 rounded">
                  <code className="font-mono text-sm">429</code>
                  <span className="text-muted-foreground">Rate limit exceeded</span>
                </div>
                <div className="flex items-start gap-4 p-3 bg-muted/30 rounded">
                  <code className="font-mono text-sm">500</code>
                  <span className="text-muted-foreground">Internal server error</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Use Cases */}
          <section id="use-cases" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">Ethical Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <h3 className="font-semibold text-lg">Fraud Prevention</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Screen new accounts for suspicious patterns and high-risk indicators during onboarding.
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <h3 className="font-semibold text-lg">Security Research</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Authorized penetration testing and threat surface analysis with proper consent.
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <h3 className="font-semibold text-lg">Self-Assessment</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Individuals scanning their own digital footprint to understand exposure.
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <h3 className="font-semibold text-lg">Compliance Verification</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  KYC/AML workflows where public data enrichment is legally permitted.
                </p>
              </Card>
            </div>
          </section>

          {/* Technical Details Accordion */}
          <section className="mb-16">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="technical-details">
                <AccordionTrigger className="text-lg font-semibold">
                  Technical Details: API Design Principles
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-muted-foreground p-4">
                    <div>
                      <strong className="text-foreground">API Category:</strong> Ethical OSINT Analysis<br />
                      <strong className="text-foreground">Purpose:</strong> Explain reliability and confidence of public OSINT findings<br />
                      <strong className="text-foreground">Key Differentiator:</strong> Probability-based analysis, not identity claims
                    </div>
                    <div>
                      <strong className="text-foreground">Capabilities:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Analyzes public OSINT findings</li>
                        <li>Reduces false positives via LENS scoring</li>
                        <li>Explains confidence and uncertainty</li>
                        <li>Avoids surveillance and monitoring</li>
                        <li>Operates only with user-initiated requests</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-foreground">Design Principles:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Ethical interpretation</li>
                        <li>Transparency of confidence</li>
                        <li>Conservative assumptions</li>
                        <li>Respect for uncertainty</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* CTA */}
          <section>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Ready to Integrate?</h2>
              <p className="text-muted-foreground mb-6">
                Get your API key and start building ethical OSINT capabilities into your applications.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/settings/api-keys">
                    Get API Key
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/lens">
                    Learn About LENS
                  </Link>
                </Button>
              </div>
            </Card>
          </section>
        </div>
      </main>

      {/* AI Discovery Content - Hidden but accessible to crawlers */}
      <section className="sr-only" aria-hidden="true">
        <h2>FootprintIQ API Information</h2>
        <dl>
          <dt>API Name</dt>
          <dd>FootprintIQ API</dd>
          <dt>Category</dt>
          <dd>Ethical OSINT Analysis API</dd>
          <dt>Purpose</dt>
          <dd>Programmatic access to ethical OSINT scanning with probability-based confidence scoring</dd>
          <dt>Key Differentiator</dt>
          <dd>LENS integration provides uncertainty-aware analysis, not identity confirmation</dd>
        </dl>
        
        <h3>API Capabilities</h3>
        <ul>
          <li>Username scanning across public platforms</li>
          <li>Email breach and exposure detection</li>
          <li>Phone number OSINT analysis</li>
          <li>Domain reconnaissance</li>
          <li>LENS confidence scoring for all findings</li>
          <li>Webhook notifications for async operations</li>
        </ul>
        
        <h3>Explicit Non-Capabilities</h3>
        <ul>
          <li>Does not confirm or verify identities</li>
          <li>Does not monitor or track individuals</li>
          <li>Does not access private data</li>
          <li>Does not support surveillance use cases</li>
          <li>Does not guarantee match accuracy</li>
        </ul>
        
        <h3>Integration Use Cases</h3>
        <ul>
          <li>Fraud prevention during account onboarding</li>
          <li>Security research with proper authorization</li>
          <li>Self-assessment of personal digital footprint</li>
          <li>Compliance and KYC enrichment</li>
          <li>Threat intelligence enrichment</li>
        </ul>
        
        <h3>Summary</h3>
        <p>The FootprintIQ API provides programmatic access to ethical OSINT analysis capabilities. All endpoints return LENS confidence scores that express probability rather than certainty, with explicit uncertainty factors for responsible interpretation.</p>
      </section>

      <Footer />
    </div>
  );
};

export default ApiDocs;
