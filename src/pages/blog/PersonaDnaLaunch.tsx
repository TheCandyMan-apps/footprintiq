import { SEO, organizationSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Share2, Twitter, Linkedin, Link as LinkIcon, Sparkles, Shield, Zap, FileText, TrendingUp, Lock } from "lucide-react";
import { toast } from "sonner";

const PersonaDnaLaunch = () => {
  const articleSchema = {
    "@context": "https://schema.org" as const,
    "@type": "Article" as const,
    headline: "Introducing Persona DNA and Evidence Packs: The Future of OSINT Intelligence",
    description: "Discover Persona DNA, Predictive Risk Index, and Evidence Packs — the next generation of OSINT intelligence from FootprintIQ.",
    image: "https://footprintiq.app/og/persona-dna.webp",
    author: {
      "@type": "Organization" as const,
      name: "FootprintIQ Team"
    },
    publisher: {
      "@type": "Organization" as const,
      name: "FootprintIQ",
      logo: {
        "@type": "ImageObject" as const,
        url: "https://footprintiq.app/logo.png"
      }
    },
    datePublished: "2025-01-15T09:00:00Z",
    dateModified: "2025-01-15T09:00:00Z"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Persona DNA and Evidence Packs" }
    ]
  };

  const shareUrl = "https://footprintiq.app/blog/persona-dna-and-evidence-packs";
  const shareTitle = "Introducing Persona DNA and Evidence Packs from FootprintIQ";

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } else if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  return (
    <>
      <SEO
        title="Introducing Persona DNA and Evidence Packs: The Future of OSINT Intelligence"
        description="Discover Persona DNA, Predictive Risk Index, and Evidence Packs — the next generation of OSINT intelligence from FootprintIQ. Privacy-first identity correlation and forensic reporting."
        canonical="https://footprintiq.app/blog/persona-dna-and-evidence-packs"
        ogImage="https://footprintiq.app/og/persona-dna.webp"
        ogType="article"
        article={{
          publishedTime: "2025-01-15T09:00:00Z",
          modifiedTime: "2025-01-15T09:00:00Z",
          author: "FootprintIQ Team",
          tags: ["OSINT", "Privacy", "Security", "AI", "Product Launch"]
        }}
        schema={{
          article: articleSchema,
          breadcrumbs: breadcrumbSchema,
          organization: organizationSchema
        }}
      />

      <article className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="relative py-20 border-b border-border/40 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="default" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Product Launch
              </Badge>
              <Badge variant="outline">January 15, 2025</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Introducing Persona DNA and Evidence Packs: The Future of OSINT Intelligence
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              FootprintIQ's next leap forward in privacy-first identity correlation and forensic reporting.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By FootprintIQ Team</span>
              <span>•</span>
              <span>8 min read</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="container max-w-4xl mx-auto px-4 -mt-12 mb-12">
          <div className="aspect-[2/1] rounded-xl overflow-hidden shadow-2xl border border-border/40">
            <img 
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop" 
              alt="Digital identity visualization with network connections" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-4xl mx-auto px-4 pb-20">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <p className="text-xl leading-relaxed">
                Today, we're thrilled to unveil the <strong>Atlas Expansion</strong> — FootprintIQ's most significant 
                product update since launch. This release introduces three game-changing capabilities that transform 
                how security teams, fraud analysts, and investigators understand digital identities.
              </p>
            </section>

            {/* What We're Launching */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                What We're Launching
              </h2>
              
              <div className="grid gap-6 mb-8">
                <Card className="p-6 border-l-4 border-l-primary">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Persona DNA</h3>
                      <p className="text-muted-foreground">
                        Our privacy-preserving identity correlation engine that maps connections between email addresses, 
                        usernames, domains, and online accounts — creating a comprehensive "digital fingerprint" without 
                        storing PII.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-secondary">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <Shield className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Predictive Risk Index</h3>
                      <p className="text-muted-foreground">
                        An AI-driven risk scoring model (0-100) that evaluates breach history, exposed credentials, 
                        suspicious patterns, and persona fragmentation to predict security threats before they materialize.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-accent">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <FileText className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Evidence Packs</h3>
                      <p className="text-muted-foreground">
                        One-click forensic reports (PDF/JSON) that bundle all OSINT findings, Persona DNA graphs, 
                        risk assessments, and remediation guidance — perfect for compliance audits, legal proceedings, 
                        and incident response.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Deep Dive */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8">Deep Dive: How It Works</h2>
              
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Persona DNA: Your Digital Fingerprint
              </h3>
              <p className="mb-6">
                Traditional OSINT tools show you isolated data points. Persona DNA connects the dots. When you scan 
                an email address, our correlation engine:
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Identifies linked usernames across 200+ platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Maps domain ownership and historical registrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Discovers breach patterns and credential reuse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Clusters accounts by behavior, language, and metadata</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Generates a confidence score (0.0-1.0) for each connection</span>
                </li>
              </ul>

              <Card className="p-6 bg-muted mb-8">
                <p className="text-sm font-mono">
                  <strong>Example:</strong> Scanning <code>john.doe@corp.com</code> reveals connections to 
                  Twitter (@j_doe), GitHub (johndoe-dev), a personal domain (johndoeportfolio.com), and 12 data breaches. 
                  Persona DNA clusters these into a <strong>Professional Identity</strong> with an 87% confidence score.
                </p>
              </Card>

              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Predictive Risk Index: Threat Forecasting
              </h3>
              <p className="mb-6">
                The Risk Index analyzes over 40 signals to produce a single, actionable score:
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span><strong>Low (0-33):</strong> Minimal exposure, good password hygiene</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span><strong>Medium (34-66):</strong> Some breaches, moderate risk patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span><strong>High (67-100):</strong> Actively compromised, urgent action required</span>
                </li>
              </ul>

              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Evidence Packs: Forensic-Ready Reports
              </h3>
              <p className="mb-6">
                Every scan can now be exported as a timestamped, cryptographically signed PDF or JSON file containing:
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Executive summary with Risk Index and key findings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Visual Persona DNA graph with annotated connections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Detailed finding cards (breach dates, exposed data, sources)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Step-by-step remediation playbook</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Compliance attestation (GDPR, CCPA, SOC 2)</span>
                </li>
              </ul>
            </section>

            {/* Use Cases */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8">Real-World Impact</h2>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="font-semibold text-lg mb-2">🔍 Fraud Investigation Teams</h4>
                  <p className="text-muted-foreground">
                    "Persona DNA helped us link a fake customer profile to 8 other fraudulent accounts across our 
                    platform. We blocked $47K in attempted fraud before payout."
                  </p>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold text-lg mb-2">🛡️ Security Operations Centers</h4>
                  <p className="text-muted-foreground">
                    "The Predictive Risk Index flags high-risk employees before they click phishing links. We've 
                    reduced incident response time by 60%."
                  </p>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold text-lg mb-2">⚖️ Legal & Compliance</h4>
                  <p className="text-muted-foreground">
                    "Evidence Packs saved us 20+ hours of manual OSINT research during a recent litigation. The 
                    reports are court-admissible and auditor-approved."
                  </p>
                </Card>
              </div>
            </section>

            {/* Privacy Commitment */}
            <section className="mb-16">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start gap-4">
                  <Lock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Our Privacy Commitment</h3>
                    <p className="text-muted-foreground mb-4">
                      Persona DNA operates on publicly available data and cryptographic hashing — we never store 
                      raw PII. All correlations are computed in real-time and can be purged instantly. Our infrastructure 
                      is GDPR Article 25 compliant (privacy by design) and audited annually by third-party security firms.
                    </p>
                    <Button variant="outline" asChild>
                      <a href="/privacy-policy">Read Our Privacy Policy</a>
                    </Button>
                  </div>
                </div>
              </Card>
            </section>

            {/* API Integration */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Zap className="w-8 h-8 text-primary" />
                Built for Developers
              </h2>
              <p className="mb-6">
                All three features are now available via our REST API. Integrate Persona DNA, Risk Index, and 
                Evidence Pack generation directly into your security workflows:
              </p>
              <Card className="p-6 bg-muted">
                <pre className="overflow-x-auto">
                  <code className="text-sm">{`curl -X POST https://api.footprintiq.app/v1/findings \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"target": "user@example.com", "include_persona": true}'`}</code>
                </pre>
              </Card>
              <div className="mt-4">
                <Button asChild>
                  <a href="/docs/api">View Full API Documentation →</a>
                </Button>
              </div>
            </section>

            {/* Pricing */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8">Availability & Pricing</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <Badge variant="outline" className="mb-4">Free</Badge>
                  <h4 className="font-semibold text-lg mb-2">Basic Scans</h4>
                  <p className="text-sm text-muted-foreground">
                    All features included, limited to 10 scans/month
                  </p>
                </Card>
                <Card className="p-6 border-primary">
                  <Badge variant="default" className="mb-4">Pro</Badge>
                  <h4 className="font-semibold text-lg mb-2">Unlimited Access</h4>
                  <p className="text-sm text-muted-foreground">
                    £49.99/month — unlimited scans, API access, priority support
                  </p>
                </Card>
                <Card className="p-6">
                  <Badge variant="secondary" className="mb-4">Enterprise</Badge>
                  <h4 className="font-semibold text-lg mb-2">Custom Solutions</h4>
                  <p className="text-sm text-muted-foreground">
                    White-label, SSO, SLA guarantees, dedicated CSM
                  </p>
                </Card>
              </div>
            </section>

            {/* CTA */}
            <section className="mb-16">
              <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <h2 className="text-3xl font-bold mb-4">Ready to See Your Persona DNA?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Try FootprintIQ Atlas today. No credit card required for your first 10 scans.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a href="/scan">Start Free Scan →</a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/pricing">View Pricing</a>
                  </Button>
                </div>
              </Card>
            </section>

            <Separator className="my-12" />

            {/* Share Section */}
            <section>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share this article</span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare("twitter")}
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare("linkedin")}
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare("copy")}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </article>
    </>
  );
};

export default PersonaDnaLaunch;