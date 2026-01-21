import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, AlertTriangle, CheckCircle, Filter, Sparkles, BarChart3, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function OsintToInsight() {
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
        name: "From OSINT to Insight"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "From OSINT to Insight: Reducing False Positives in Risk Intelligence",
    description: "Raw OSINT data creates noise. Learn how probabilistic analysis, confidence scoring, and multi-signal correlation transform data into actionable intelligence.",
    image: getBlogHeroImage("osint-to-insight"),
    datePublished: "2026-01-21T11:00:00Z",
    dateModified: "2026-01-21T11:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "OSINT, false positives, risk intelligence, confidence scoring, threat analysis"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="From OSINT to Insight: Reducing False Positives in Risk Intelligence | FootprintIQ"
        description="Raw OSINT data creates noise. Learn how probabilistic analysis, confidence scoring, and multi-signal correlation transform data into actionable intelligence."
        canonical="https://footprintiq.app/blog/osint-to-insight"
        ogImage={getBlogHeroImage("osint-to-insight")}
        article={{
          publishedTime: "2026-01-21T11:00:00Z",
          modifiedTime: "2026-01-21T11:00:00Z",
          author: "FootprintIQ",
          tags: ["OSINT", "Risk Intelligence", "False Positives"]
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
                <Badge variant="outline">Risk Intelligence</Badge>
                <span className="text-sm text-muted-foreground">9 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                From OSINT to Insight: Reducing False Positives in Risk Intelligence
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
                src={getBlogHeroImage("osint-to-insight")} 
                alt="From OSINT data to actionable insight"
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                OSINT tools are excellent at finding data. They're terrible at telling you 
                what it means. The gap between "data found" and "insight gained" is where 
                most investigations waste time, make mistakes, and lose trust.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1: The False Positive Problem */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                  <h2 className="text-3xl font-bold">The False Positive Problem</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    A username search returns 47 matches. An email scan finds references in 
                    12 breach databases. A phone lookup returns carrier data and registration 
                    history. <strong>Now what?</strong>
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Without context, these are just data points—not intelligence.
                  </p>
                </Card>

                <BlogCallout type="warning" title="The Real Cost of False Positives">
                  <p>
                    A missed finding is inconvenient. A false positive can lead to incorrect 
                    conclusions, wasted investigation time, reputational harm, or poor decisions. 
                    <strong> False positives erode trust in the entire process.</strong>
                  </p>
                </BlogCallout>
              </section>

              <BlogPullQuote author="FootprintIQ Philosophy">
                Calm intelligence beats scary dashboards. The goal is understanding, not alarm.
              </BlogPullQuote>

              {/* Section 2: Why False Positives Happen */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Why False Positives Happen</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-semibold mb-3">Common Names</h3>
                    <p className="text-muted-foreground">
                      "john_smith" appears on thousands of platforms. Without additional 
                      signals, a username match is nearly meaningless for identification.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-semibold mb-3">Stale Data</h3>
                    <p className="text-muted-foreground">
                      Breach data from 2015 still circulates in 2026. The email might be 
                      valid, but the associated password has been changed five times.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-semibold mb-3">Pattern Matching Errors</h3>
                    <p className="text-muted-foreground">
                      Fuzzy matching algorithms cast wide nets. "jsmith123" might match 
                      "j.smith.123" and "john_smith_1234"—none of which are the same person.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-semibold mb-3">Lack of Corroboration</h3>
                    <p className="text-muted-foreground">
                      A single match on one platform proves nothing. Identity requires 
                      multiple independent signals pointing to the same conclusion.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Section 3: The OSINT-to-Insight Pipeline */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Filter className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">The OSINT-to-Insight Pipeline</h2>
                </div>
                
                <p className="text-lg mb-6 text-muted-foreground">
                  Transforming raw data into intelligence requires a structured approach:
                </p>

                <div className="space-y-4">
                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        1
                      </div>
                      <h3 className="text-xl font-semibold">Collection</h3>
                    </div>
                    <p className="text-muted-foreground ml-14">
                      Gather data from multiple sources—username databases, breach archives, 
                      social platforms, public records. Breadth matters here.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        2
                      </div>
                      <h3 className="text-xl font-semibold">Normalization</h3>
                    </div>
                    <p className="text-muted-foreground ml-14">
                      Standardize data formats. Extract consistent fields. Identify 
                      duplicates. This stage cleans the raw input.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        3
                      </div>
                      <h3 className="text-xl font-semibold">Correlation</h3>
                    </div>
                    <p className="text-muted-foreground ml-14">
                      Look for signals that connect findings. Shared usernames. Matching 
                      profile images. Linked domains. Bio similarity. The more independent 
                      signals that align, the higher the confidence.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        4
                      </div>
                      <h3 className="text-xl font-semibold">Confidence Scoring</h3>
                    </div>
                    <p className="text-muted-foreground ml-14">
                      Assign probabilistic scores based on evidence strength. A single 
                      username match might be 30% confidence. Add matching email = 55%. 
                      Add profile image match = 85%.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        5
                      </div>
                      <h3 className="text-xl font-semibold">Actionability Assessment</h3>
                    </div>
                    <p className="text-muted-foreground ml-14">
                      Determine what, if anything, should be done. Historical breaches 
                      with changed passwords? No action. Active credential exposure? Review 
                      recommended.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Section 4: Confidence Scoring in Practice */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Confidence Scoring in Practice</h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-6 text-center border-2 border-muted">
                    <div className="text-4xl font-bold text-muted-foreground mb-2">
                      &lt;40%
                    </div>
                    <Badge variant="outline" className="mb-3">Historical</Badge>
                    <p className="text-sm text-muted-foreground">
                      Weak evidence. Often a coincidence or stale data. No action required.
                    </p>
                  </Card>

                  <Card className="p-6 text-center border-2 border-blue-500/30">
                    <div className="text-4xl font-bold text-blue-500 mb-2">
                      40-70%
                    </div>
                    <Badge variant="outline" className="mb-3 text-blue-600 border-blue-500">Contextual</Badge>
                    <p className="text-sm text-muted-foreground">
                      Possible connection. Relevance unclear. Worth noting, not acting on.
                    </p>
                  </Card>

                  <Card className="p-6 text-center border-2 border-amber-500/30">
                    <div className="text-4xl font-bold text-amber-500 mb-2">
                      &gt;70%
                    </div>
                    <Badge variant="outline" className="mb-3 text-amber-600 border-amber-500">Review</Badge>
                    <p className="text-sm text-muted-foreground">
                      Strong signal alignment. Worth investigation. May require action.
                    </p>
                  </Card>
                </div>

                <BlogCallout type="info" title="Important Distinction" className="mt-6">
                  <p>
                    <strong>Confidence is not certainty.</strong> A 90% confidence score means 
                    "highly likely based on available evidence"—not "definitely true." 
                    Verification always requires human judgment.
                  </p>
                </BlogCallout>
              </section>

              {/* Section 5: Reducing False Positives */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Practical False Positive Reduction</h2>
                </div>
                
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Require Multiple Independent Signals
                    </h3>
                    <p className="text-muted-foreground">
                      Never rely on a single data point. Username match + email match + 
                      bio similarity creates much higher confidence than any one alone.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Weight Signals by Specificity
                    </h3>
                    <p className="text-muted-foreground">
                      A unique email address is more identifying than a common username. 
                      Profile photo matches are stronger than bio text similarity.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Consider Contradicting Evidence
                    </h3>
                    <p className="text-muted-foreground">
                      If 3 signals support and 2 contradict, confidence should be moderate 
                      at best. LENS explicitly weighs both supporting and weakening signals.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Apply Temporal Decay
                    </h3>
                    <p className="text-muted-foreground">
                      A breach from 2015 matters less than one from 2024. Recency affects 
                      both confidence and actionability.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Collapse Low-Confidence Findings
                    </h3>
                    <p className="text-muted-foreground">
                      Don't hide weak findings—collapse them. Available on demand, but 
                      not cluttering the primary view.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Conclusion */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">From Data to Decision</h2>
                </div>
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <p className="text-lg mb-4">
                    The goal of OSINT isn't to collect the most data. It's to provide 
                    <strong> the clearest understanding</strong> with the least noise.
                  </p>
                  <p className="text-lg mb-4 text-muted-foreground">
                    False positive reduction isn't about filtering aggressively—it's about 
                    evaluating honestly. Presenting findings with appropriate confidence. 
                    Making uncertainty explicit rather than hidden.
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    That's how you move from OSINT to insight. Calm beats scary. Precision 
                    beats volume. Context beats alarm.
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
