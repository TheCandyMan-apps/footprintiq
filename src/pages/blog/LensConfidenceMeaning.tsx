import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Scale, Brain, CircleHelp, TrendingUp, AlertTriangle, CheckCircle, Info, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function LensConfidenceMeaning() {
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
        name: "What Confidence Actually Means"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "What 'Confidence' Actually Means in OSINT",
    description: "Understanding LENS confidence scores: what they measure, how to interpret them, and why uncertainty is a feature, not a bug.",
    image: getBlogHeroImage("lens-confidence-meaning"),
    datePublished: "2026-01-18T09:00:00Z",
    dateModified: "2026-01-18T09:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "LENS, confidence scoring, OSINT analysis, evidence interpretation, uncertainty"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="What 'Confidence' Actually Means in OSINT | FootprintIQ"
        description="Understanding LENS confidence scores: what they measure, how to interpret them, and why uncertainty is a feature, not a bug."
        canonical="https://footprintiq.app/blog/lens-confidence-meaning"
        ogImage={getBlogHeroImage("lens-confidence-meaning")}
        article={{
          publishedTime: "2026-01-18T09:00:00Z",
          modifiedTime: "2026-01-18T09:00:00Z",
          author: "FootprintIQ",
          tags: ["LENS", "OSINT", "Confidence Scoring"]
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
                <Badge variant="outline">Deep Dive</Badge>
                <span className="text-sm text-muted-foreground">9 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                What "Confidence" Actually Means in OSINT
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2026-01-18">January 18, 2026</time>
                <span>•</span>
                <span>By FootprintIQ Research Team</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={getBlogHeroImage("lens-confidence-meaning")} 
                alt="Understanding LENS Confidence Scores"
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                When LENS reports a confidence score of 72%, what does that number actually mean? 
                Is the finding probably correct? Definitely correct? Worth investigating?
              </p>
              <p className="text-xl leading-relaxed text-muted-foreground">
                Understanding confidence is essential to using LENS effectively. This article explains 
                what confidence measures, how to interpret different score ranges, and why 
                <strong> expressing uncertainty is a strength, not a weakness</strong>.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1: Confidence Is Not Certainty */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <CircleHelp className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Confidence Is Not Certainty</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    A common misconception is that a high confidence score means "this is definitely true." 
                    It doesn't. Confidence scores express <strong>probability based on available evidence</strong>, 
                    not certainty.
                  </p>
                  <p className="text-lg">
                    A score of 85% means that based on the signals analyzed, the finding has an 85% probability 
                    of accurate attribution. That same score also means there's a <strong>15% probability</strong> 
                    the attribution is incorrect.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    This distinction matters. Treating high confidence as certainty leads to overconfidence. 
                    Treating moderate confidence as useless leads to underutilization.
                  </p>
                </Card>
              </section>

              <BlogPullQuote>
                Confidence expresses the probability of correct attribution based on available evidence. 
                It is not a guarantee. It is a calibrated estimate.
              </BlogPullQuote>

              {/* Section 2: The Confidence Scale */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Scale className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Understanding the Confidence Scale</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  LENS uses a 0-100% scale with five labeled bands. Each band carries specific implications 
                  for how findings should be treated:
                </p>
                
                <div className="space-y-4">
                  <Card className="p-5 border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Very Low (0-25%)
                      </h3>
                      <Badge variant="outline" className="border-red-500 text-red-500">Unreliable</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      <strong>Meaning:</strong> Little evidence supports attribution. Match may be coincidental.
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      <strong>Action:</strong> Do not rely on this finding without substantial additional evidence.
                    </p>
                  </Card>

                  <Card className="p-5 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-500/5 to-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Low (26-50%)
                      </h3>
                      <Badge variant="outline" className="border-orange-500 text-orange-500">Weak</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      <strong>Meaning:</strong> Some supporting signals exist but contradictions or gaps remain.
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      <strong>Action:</strong> Treat as a lead requiring verification, not a confirmed finding.
                    </p>
                  </Card>

                  <Card className="p-5 border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-500/5 to-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Info className="w-5 h-5 text-yellow-500" />
                        Moderate (51-70%)
                      </h3>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">Probable</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      <strong>Meaning:</strong> Evidence supports attribution more than it contradicts it.
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      <strong>Action:</strong> Reasonable to include in reports with appropriate caveats.
                    </p>
                  </Card>

                  <Card className="p-5 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        High (71-90%)
                      </h3>
                      <Badge variant="outline" className="border-emerald-500 text-emerald-500">Strong</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      <strong>Meaning:</strong> Multiple corroborating signals with few or no contradictions.
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      <strong>Action:</strong> Suitable for most investigative purposes. Still acknowledge uncertainty.
                    </p>
                  </Card>

                  <Card className="p-5 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        Very High (91-100%)
                      </h3>
                      <Badge className="bg-primary">Verified</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      <strong>Meaning:</strong> Strong corroboration from multiple independent sources.
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      <strong>Action:</strong> Can be relied upon for most purposes. Still not absolute certainty.
                    </p>
                  </Card>
                </div>
              </section>

              <BlogCallout type="tip" title="Practical Guidance">
                <p>
                  <strong>For most investigative purposes:</strong> Findings above 70% can be reported with 
                  appropriate caveats. Findings between 50-70% should be clearly labeled as "probable" 
                  or "likely." Findings below 50% require additional verification before inclusion.
                </p>
              </BlogCallout>

              {/* Section 3: What Signals Affect Confidence */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">What Signals Affect Confidence</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  LENS evaluates multiple signal types when calculating confidence. Understanding these 
                  helps interpret why a particular score was assigned:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Signals That Increase Confidence
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Username pattern consistency across platforms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Geographic signals that align</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Temporal patterns that match known activity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Cross-platform references (links between accounts)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Writing style consistency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Profile content alignment with known information</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6 border-2 border-destructive/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Signals That Decrease Confidence
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Common/generic username patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Geographic contradictions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Timeline inconsistencies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>No cross-platform corroboration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Writing style divergence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Profile content that contradicts known facts</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="Evidence Analysis Principle">
                Specific contradictions outweigh general confirmations. A geographic mismatch is more 
                informative than a username similarity.
              </BlogPullQuote>

              {/* Section 4: Why Uncertainty Is A Feature */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Why Uncertainty Is a Feature</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    Some users initially find LENS's uncertainty frustrating. "Why doesn't it just tell me 
                    if this is the person or not?" The answer is important: <strong>because OSINT cannot 
                    provide that certainty</strong>.
                  </p>
                  <p className="text-lg">
                    Tools that claim certainty are either:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">1.</span>
                      <span>Hiding their uncertainty (which misleads users)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">2.</span>
                      <span>Not actually performing analysis (just returning raw matches)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">3.</span>
                      <span>Overclaiming (which leads to errors)</span>
                    </li>
                  </ul>
                  <p className="text-lg mt-4">
                    LENS makes uncertainty visible so analysts can make informed decisions. A 60% confidence 
                    score with clear reasoning is more useful than a "match" label with no context.
                  </p>
                </Card>
              </section>

              <BlogCallout type="warning" title="The Danger of Overclaiming">
                <p>
                  Tools that present uncertain findings as certain facts enable <strong>false positives</strong> that 
                  damage reputations, waste resources, and erode trust in OSINT as a discipline. 
                  Expressing uncertainty is not weakness—it's honesty.
                </p>
              </BlogCallout>

              {/* Section 5: Using Confidence in Practice */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Using Confidence in Practice</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <h3 className="text-xl font-semibold mb-3">For Report Writing</h3>
                    <p className="text-muted-foreground">
                      Include the confidence score and key supporting/contradicting signals. Language should 
                      match confidence level: "likely" for 60-70%, "probably" for 70-85%, "with high confidence" 
                      for 85%+. Never claim certainty.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <h3 className="text-xl font-semibold mb-3">For Decision-Making</h3>
                    <p className="text-muted-foreground">
                      Consider the stakes. A 75% confidence finding might be sufficient for preliminary 
                      investigation but insufficient for formal accusations. Higher stakes require higher 
                      confidence thresholds.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <h3 className="text-xl font-semibold mb-3">For Verification Planning</h3>
                    <p className="text-muted-foreground">
                      LENS explanations identify what additional evidence would increase confidence. 
                      If geographic consistency is weak, verify location. If temporal patterns don't 
                      align, investigate timeline. Use the explanation to guide next steps.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Conclusion */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Conclusion</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    Confidence scoring is not about providing certainty—it's about <strong>calibrating 
                    uncertainty</strong>. A well-calibrated 72% score is more useful than an uncalibrated 
                    "match" label because it tells you exactly how much to trust the finding.
                  </p>
                  <p className="text-lg">
                    LENS makes confidence explainable so you can understand not just the score, but 
                    the reasoning behind it. This transparency supports human judgment rather than 
                    replacing it.
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    In OSINT, acknowledging what you don't know is as important as claiming what you do.
                  </p>
                </Card>
              </section>

              {/* CTA Section */}
              <Card className="p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
                <h3 className="text-2xl font-bold mb-4">See Confidence Scoring in Action</h3>
                <p className="text-muted-foreground mb-6">
                  Experience how LENS transforms raw OSINT data into calibrated intelligence with 
                  transparent, explainable confidence scores.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/lens">
                    <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      Learn More About LENS
                    </button>
                  </Link>
                  <Link to="/scan">
                    <button className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">
                      Try a Scan
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
