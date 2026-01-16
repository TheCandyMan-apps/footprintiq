import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Layers, Eye, Shield, Network, Lightbulb, CheckCircle, Lock, Scale, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function LensIntroduction() {
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
        name: "Introducing LENS"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "From Results to Reliability: Introducing LENS",
    description: "Introducing LENS (Link & Evidence Network System) - a new approach to OSINT confidence scoring that transforms raw results into verified intelligence.",
    image: getBlogHeroImage("lens-introduction"),
    datePublished: "2026-01-17T09:00:00Z",
    dateModified: "2026-01-17T09:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "LENS, OSINT, confidence scoring, evidence analysis, digital intelligence"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="From Results to Reliability: Introducing LENS | FootprintIQ"
        description="Introducing LENS (Link & Evidence Network System) - a new approach to OSINT confidence scoring that transforms raw results into verified intelligence."
        canonical="https://footprintiq.app/blog/lens-introduction"
        ogImage={getBlogHeroImage("lens-introduction")}
        article={{
          publishedTime: "2026-01-17T09:00:00Z",
          modifiedTime: "2026-01-17T09:00:00Z",
          author: "FootprintIQ",
          tags: ["LENS", "OSINT", "Product Launch"]
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
                <Badge className="bg-primary">LENS</Badge>
                <Badge variant="outline">Product Launch</Badge>
                <span className="text-sm text-muted-foreground">8 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                From Results to Reliability: Introducing LENS
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2026-01-17">January 17, 2026</time>
                <span>•</span>
                <span>By FootprintIQ Research Team</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={getBlogHeroImage("lens-introduction")} 
                alt="LENS - Link & Evidence Network System"
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                OSINT tools excel at finding things. They scan hundreds of platforms, search breach databases, 
                and return results in seconds. The <strong>collection problem</strong> has largely been solved.
              </p>
              <p className="text-xl leading-relaxed text-muted-foreground">
                But collection is not intelligence. The gap between "we found something" and "we know something" 
                remains vast. <strong>LENS bridges that gap.</strong>
              </p>
            </div>

            <BlogCallout type="info" title="What is LENS?">
              <p>
                <strong>LENS (Link & Evidence Network System)</strong> is a confidence scoring and evidence 
                analysis layer built into FootprintIQ. It transforms raw OSINT results into verified intelligence 
                by analyzing signals, weighing evidence, and providing explainable confidence scores.
              </p>
            </BlogCallout>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1: The Gap Between Data and Intelligence */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Layers className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">The Gap Between Data and Intelligence</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    Consider the output of a typical OSINT scan: dozens of username matches, several email 
                    appearances, multiple profile links. The data is there. But what does it <em>mean</em>?
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Which results belong to the target, and which are coincidental matches?</li>
                    <li>• How confident should you be in each finding?</li>
                    <li>• What signals corroborate or contradict the data?</li>
                    <li>• What should you investigate next?</li>
                  </ul>
                  <p className="text-lg">
                    These questions require analysis, not just collection. LENS provides that analysis layer.
                  </p>
                </Card>
              </section>

              <BlogPullQuote author="LENS Design Philosophy">
                OSINT results require explanation, not just enumeration. Analysts need to understand not 
                just what was found, but why it matters and how confident they should be.
              </BlogPullQuote>

              {/* Section 2: Design Philosophy */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Design Philosophy</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  LENS was built around three core principles that guide every decision in its development:
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Transparency</h3>
                    <p className="text-muted-foreground text-sm">
                      Every confidence score comes with an explanation. No black boxes. Analysts can see 
                      exactly which signals contributed to the assessment and why.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Explainability</h3>
                    <p className="text-muted-foreground text-sm">
                      Confidence must be understandable. A score of 75% means nothing without context. 
                      LENS explains what evidence supports (and contradicts) each finding.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Privacy-First</h3>
                    <p className="text-muted-foreground text-sm">
                      Powerful analysis comes with responsibility. LENS is designed for ethical use cases 
                      only: self-audit, authorized investigations, and compliance-aligned research.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Section 3: How LENS Works */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Network className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">How LENS Works</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Signal Collection</h3>
                        <p className="text-muted-foreground">
                          LENS ingests results from multiple OSINT tools and data sources. Each result 
                          contains signals: username patterns, temporal data, platform metadata, profile 
                          content, and cross-references.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Evidence Weighting</h3>
                        <p className="text-muted-foreground">
                          Not all signals are equal. LENS weights evidence based on specificity, reliability, 
                          and corroboration. A verified email match carries more weight than a common username. 
                          Geographic consistency increases confidence. Contradictions decrease it.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Confidence Scoring</h3>
                        <p className="text-muted-foreground">
                          Based on the weighted evidence, LENS generates a confidence score from 0-100%. 
                          The score reflects the probability that the finding accurately attributes to the 
                          subject, accounting for both supporting and contradicting signals.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Explanation Generation</h3>
                        <p className="text-muted-foreground">
                          Every score includes a narrative explanation: which signals contributed, how they 
                          corroborated, and what uncertainties remain. The explanation helps analysts 
                          calibrate their own judgment and plan next steps.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              <BlogCallout type="tip" title="Key Insight">
                <p>
                  LENS doesn't just score—it <strong>recommends</strong>. Based on confidence levels, it suggests 
                  whether to rely on a finding, seek additional verification, or treat the result with caution.
                </p>
              </BlogCallout>

              {/* Section 4: Ethical Boundaries */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Ethical Boundaries</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    Powerful analysis tools require clear ethical boundaries. LENS is designed for legitimate 
                    use cases only:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Self-audit:</strong> Understanding your own digital exposure</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Authorized investigations:</strong> Corporate-sanctioned security research</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Risk assessment:</strong> Evaluating threat surface and exposure</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Compliance research:</strong> Privacy-aligned due diligence</span>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mt-4">
                    LENS explicitly does not support harassment, stalking, unauthorized surveillance, or 
                    any activity that violates privacy laws or platform terms of service.
                  </p>
                </Card>
              </section>

              <BlogPullQuote>
                Better intelligence through better analysis—not through more invasive collection. 
                That's the LENS philosophy.
              </BlogPullQuote>

              {/* Section 5: What LENS Changes */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Scale className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">What LENS Changes</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-2 border-muted">
                    <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Without LENS</h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        Raw results require manual verification
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        No confidence indicators
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        False positives consume investigation time
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        Conclusions based on intuition
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                    <h3 className="text-lg font-semibold mb-4 text-primary">With LENS</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Results pre-analyzed with confidence scores
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Clear explanations for every finding
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        False positives flagged before investigation
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Evidence-based decision making
                      </li>
                    </ul>
                  </Card>
                </div>
              </section>

              {/* CTA Section */}
              <Card className="p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your OSINT?</h3>
                <p className="text-muted-foreground mb-6">
                  Experience the difference evidence-based confidence scoring makes in your investigations.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/lens">
                    <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      Explore LENS Features
                    </button>
                  </Link>
                  <Link to="/scan">
                    <button className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">
                      Start a Scan
                    </button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
