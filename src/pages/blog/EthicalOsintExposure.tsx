import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Eye, CheckCircle, XCircle, Scale, Heart, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function EthicalOsintExposure() {
  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: "https://footprintiq.app"
      },
      {
        "@type": "ListItem" as const,
        position: 2,
        name: "Blog",
        item: "https://footprintiq.app/blog"
      },
      {
        "@type": "ListItem" as const,
        position: 3,
        name: "Ethical OSINT"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Ethical OSINT: How to Assess Exposure Without Surveillance",
    description: "OSINT tools exist on a spectrum from helpful to harmful. Learn the principles that separate ethical exposure assessment from surveillance, and why transparency matters.",
    image: getBlogHeroImage("ethical-osint-exposure"),
    datePublished: "2026-01-21T12:00:00Z",
    dateModified: "2026-01-21T12:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "ethical OSINT, privacy, surveillance, digital exposure, transparency"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Ethical OSINT: How to Assess Exposure Without Surveillance | FootprintIQ"
        description="OSINT tools exist on a spectrum from helpful to harmful. Learn the principles that separate ethical exposure assessment from surveillance."
        canonical="https://footprintiq.app/blog/ethical-osint-exposure"
        ogImage={getBlogHeroImage("ethical-osint-exposure")}
        article={{
          publishedTime: "2026-01-21T12:00:00Z",
          modifiedTime: "2026-01-21T12:00:00Z",
          author: "FootprintIQ",
          tags: ["Ethical OSINT", "Privacy", "Transparency"]
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs: breadcrumbs,
          custom: articleSchema
        }}
      />
      <Header />
      
      <main className="flex-1">
        <article className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-primary">Thought Leadership</Badge>
                <Badge variant="outline">Ethics</Badge>
                <span className="text-sm text-muted-foreground">10 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Ethical OSINT: How to Assess Exposure Without Surveillance
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2026-01-21">January 21, 2026</time>
                <span>•</span>
                <span>By FootprintIQ Research Team</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={getBlogHeroImage("ethical-osint-exposure")} 
                alt="Ethical OSINT principles"
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                OSINT—Open Source Intelligence—exists on a spectrum. On one end: legitimate 
                security research, self-auditing, and threat awareness. On the other: stalking, 
                doxxing, and invasive surveillance. The same tools can serve either purpose.
              </p>
              <p className="text-xl leading-relaxed text-muted-foreground mt-4">
                What separates ethical OSINT from harmful surveillance isn't the technology. 
                It's <strong>intent, transparency, and boundaries</strong>.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1: The Spectrum */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Scale className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">The OSINT Spectrum</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                      <CheckCircle className="w-5 h-5" />
                      Ethical OSINT
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Self-auditing your own digital presence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Authorized corporate security assessments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Journalism with public interest justification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Threat intelligence for protective purposes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Research with appropriate IRB oversight</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6 border-2 border-destructive/20 bg-destructive/5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
                      <XCircle className="w-5 h-5" />
                      Harmful Surveillance
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Tracking individuals without consent</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Doxxing or harassment campaigns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Stalking or relationship surveillance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Compiling dossiers for manipulation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Bypassing consent or access controls</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="FootprintIQ Philosophy">
                Calm intelligence beats scary dashboards. The goal is understanding, not power over others.
              </BlogPullQuote>

              {/* Section 2: Core Principles */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Core Ethical Principles</h2>
                </div>
                
                <div className="space-y-4">
                  <Card className="p-6 border-l-4 border-l-primary">
                    <h3 className="text-xl font-semibold mb-3">1. Public Data ≠ Permission to Use</h3>
                    <p className="text-muted-foreground">
                      Just because information is publicly accessible doesn't mean it's ethical 
                      to collect, correlate, or act on it. Context matters. A photo posted for 
                      friends is technically public—but scraping it for facial recognition 
                      violates reasonable expectations.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary">
                    <h3 className="text-xl font-semibold mb-3">2. Intent Defines Ethics</h3>
                    <p className="text-muted-foreground">
                      The same search can be protective or predatory. Checking your own 
                      exposure is self-defense. Checking someone else's without their knowledge 
                      or authorization crosses into surveillance. Ask: "Would I be comfortable 
                      if the subject knew I was doing this?"
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary">
                    <h3 className="text-xl font-semibold mb-3">3. Minimize Collection</h3>
                    <p className="text-muted-foreground">
                      Ethical OSINT collects only what's necessary for the stated purpose. 
                      Checking breach exposure doesn't require building a complete profile. 
                      Username scanning doesn't require scraping all associated content.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary">
                    <h3 className="text-xl font-semibold mb-3">4. Transparency Over Secrecy</h3>
                    <p className="text-muted-foreground">
                      Ethical tools explain what they do and don't do. They don't hide 
                      capabilities or obscure data sources. Users should understand exactly 
                      what information is being collected and how.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary">
                    <h3 className="text-xl font-semibold mb-3">5. No Interaction with Protected Systems</h3>
                    <p className="text-muted-foreground">
                      Ethical OSINT analyzes publicly available information. It doesn't probe 
                      systems, bypass authentication, or access restricted areas. The moment 
                      you're trying to get past a barrier, you've left OSINT territory.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Section 3: What We Don't Do */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Explicit Boundaries</h2>
                </div>
                
                <BlogCallout type="info" title="FootprintIQ Transparency">
                  <p>
                    We believe in stating clearly what we <strong>don't</strong> do—not just 
                    what we do. Ambiguity enables abuse.
                  </p>
                </BlogCallout>

                <Card className="p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">FootprintIQ Does Not:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Monitor individuals</strong> — We don't track ongoing activity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Access private accounts</strong> — No login bypass, no credential testing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Interact with restricted systems</strong> — Public data only</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Perform surveillance</strong> — Scans are user-initiated, point-in-time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Store unnecessary data</strong> — Minimal retention, user-controlled</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Identify victims or perpetrators</strong> — We show exposure, not attribution</span>
                    </li>
                  </ul>
                </Card>
              </section>

              {/* Section 4: The Visibility Model */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">The Visibility Model</h2>
                </div>
                
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    Ethical OSINT operates on a <strong>visibility model</strong>, not a 
                    surveillance model. The difference is fundamental:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">Visibility Model</h4>
                      <p className="text-sm text-muted-foreground">
                        "Here's what's publicly visible about you. You can decide what to do with 
                        this information."
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-muted-foreground mb-2">Surveillance Model</h4>
                      <p className="text-sm text-muted-foreground">
                        "Here's everything we can find about this person. Use it as you see fit."
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-lg mt-4">
                    The visibility model empowers individuals to understand and manage their 
                    own exposure. The surveillance model empowers observers to profile subjects 
                    without their knowledge or consent.
                  </p>
                </Card>
              </section>

              {/* Section 5: Responsible Use */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Responsible Use Guidelines</h2>
                </div>
                
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Scan Yourself First
                    </h3>
                    <p className="text-muted-foreground">
                      Before assessing anyone else's exposure (even with authorization), 
                      understand what the tool reveals by running it on yourself. This 
                      builds empathy for how findings feel to subjects.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Document Authorization
                    </h3>
                    <p className="text-muted-foreground">
                      For corporate or investigative use, ensure written authorization 
                      exists before running scans on employees, candidates, or third parties. 
                      "It's publicly available" isn't sufficient justification.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Share Findings Appropriately
                    </h3>
                    <p className="text-muted-foreground">
                      OSINT findings should go to people who can act on them responsibly—not 
                      shared publicly or used for gossip. Consider: Who needs to know, and 
                      what's the appropriate action?
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Respect the Uncertainty
                    </h3>
                    <p className="text-muted-foreground">
                      OSINT is probabilistic. Confidence scores exist for a reason. Never 
                      treat findings as conclusive without verification. Acknowledge limitations 
                      when presenting results.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Conclusion */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">The Bottom Line</h2>
                </div>
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <p className="text-lg mb-4">
                    OSINT is a tool. Like any tool, it can build or destroy. The same 
                    capabilities that help someone understand their exposure can be 
                    weaponized against them if used without ethics.
                  </p>
                  <p className="text-lg mb-4 text-muted-foreground">
                    Ethical OSINT isn't about collecting less data—it's about <strong>claiming 
                    less certainty</strong>, <strong>respecting boundaries</strong>, and 
                    <strong>being transparent</strong> about what we do and don't do.
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    We provide visibility. You make the decisions. That's the ethical standard.
                  </p>
                </Card>
              </section>

              {/* Trust Footer */}
              <div className="p-4 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground border border-border">
                <p>
                  <strong>Ethical OSINT</strong> • Public data only • No monitoring • No surveillance
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
