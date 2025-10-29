import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Database, Lock, Eye, FileCheck, MapPin } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TrustAIAgents() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="AI Agent Transparency - FootprintIQ"
        description="Learn how our AI agents work, what data they access, and how we protect your privacy"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">AI Agent Transparency</h1>
            <p className="text-xl text-muted-foreground">
              How our AI agents work and protect your data
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Data Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Our AI agents only access data you've already collected through FootprintIQ scans.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>Internal workspace data only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>No external web scraping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>User-scoped access controls</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Agents operate with strict security boundaries and audit trails.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>Read-only by default</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>Manual approval for destructive actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>Scoped API keys with expiration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <CardTitle>Privacy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  We never send raw PII to AI models - only anonymized summaries.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>PII redaction enforced</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>Aggregated metrics only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>No external model training</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <CardTitle>Audit Trail</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Every agent action is logged with full transparency.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>Query logging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>Execution timestamps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">✓</Badge>
                    <span>Daily admin summaries</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle>Data Residency</CardTitle>
              </div>
              <CardDescription>
                Your data stays in the same region as your FootprintIQ deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                All AI agent processing happens within the same infrastructure as your primary data storage.
                We honor regional data residency requirements and never transfer data across jurisdictions
                without explicit consent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Types & Purposes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-primary pl-4">
                  <h3 className="font-semibold mb-1">Trend Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzes recent findings to identify emerging patterns and threats.
                    Helps you stay ahead of evolving risks.
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <h3 className="font-semibold mb-1">Summary Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Generates weekly intelligence briefings from your scan data.
                    Saves analyst time on routine reporting.
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <h3 className="font-semibold mb-1">Data QA Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Checks for duplicate entities, schema errors, and data quality issues.
                    Maintains database integrity automatically.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Opt-Out & Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                You have full control over AI agent features:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <Badge className="mt-0.5">Setting</Badge>
                  <span>Disable all agents per workspace in Settings → AI Agents</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="mt-0.5">Granular</Badge>
                  <span>Enable/disable individual agent types</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="mt-0.5">Contact</Badge>
                  <span>Email privacy@footprintiq.com for custom configurations</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
