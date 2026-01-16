import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCheck, UserX, FileSearch, CheckCircle, XCircle, AlertTriangle, MapPin, Code, Pen, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function LensCaseStudyFalsePositive() {
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
        name: "Case Study: LENS Prevented Misidentification"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Case Study: How LENS Prevented a Costly Misidentification",
    description: "A real-world example showing how LENS confidence scoring prevented a false positive identification during pre-employment screening.",
    image: getBlogHeroImage("lens-case-study-false-positive"),
    datePublished: "2026-01-19T09:00:00Z",
    dateModified: "2026-01-19T09:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "LENS, case study, false positive, OSINT, pre-employment screening, confidence scoring"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Case Study: How LENS Prevented a Costly Misidentification | FootprintIQ"
        description="A real-world example showing how LENS confidence scoring prevented a false positive identification during pre-employment screening."
        canonical="https://footprintiq.app/blog/lens-case-study-false-positive"
        ogImage={getBlogHeroImage("lens-case-study-false-positive")}
        article={{
          publishedTime: "2026-01-19T09:00:00Z",
          modifiedTime: "2026-01-19T09:00:00Z",
          author: "FootprintIQ",
          tags: ["LENS", "Case Study", "False Positives"]
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
                <Badge variant="outline">Case Study</Badge>
                <span className="text-sm text-muted-foreground">7 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Case Study: How LENS Prevented a Costly Misidentification
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2026-01-19">January 19, 2026</time>
                <span>•</span>
                <span>By FootprintIQ Research Team</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={getBlogHeroImage("lens-case-study-false-positive")} 
                alt="LENS Case Study - Preventing False Positives"
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                A mid-sized technology company was conducting pre-employment background screening for a 
                senior engineering role. What they found appeared alarming—until LENS revealed the truth.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1: The Situation */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <FileSearch className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">The Situation</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    The candidate—we'll call them <strong>"Alex Chen"</strong>—had passed initial interviews 
                    and was progressing toward an offer. Standard practice included an OSINT review of the 
                    candidate's digital presence. The security team ran username and email searches across 
                    public platforms.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    What they found appeared alarming.
                  </p>
                </Card>
              </section>

              {/* Section 2: Initial Findings */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                  <h2 className="text-3xl font-bold">The Initial Findings</h2>
                </div>
                
                <BlogCallout type="warning" title="Alarming Discovery">
                  <p>
                    Traditional OSINT tools returned <strong>34 username matches</strong> for "alexchen" and variations. 
                    One result stood out: a forum account on a cybersecurity discussion board using "alex_chen_dev" 
                    that had posted about <strong>controversial hacking techniques</strong>.
                  </p>
                </BlogCallout>

                <Card className="p-6 mt-6 space-y-4">
                  <p className="text-lg">
                    The posts weren't illegal, but they raised concerns about judgment and company culture fit.
                  </p>
                  <p className="text-lg">
                    The security team's initial assessment: <strong>this appeared to be their candidate</strong>. 
                    The username followed the same pattern as the candidate's known accounts. The forum profile 
                    mentioned software development. The timing aligned roughly with the candidate's career progression.
                  </p>
                  <p className="text-lg text-destructive font-medium">
                    Based on these matches, the team prepared to flag the candidate for additional review—a 
                    process that would delay the hire and potentially damage the candidate's prospects.
                  </p>
                </Card>
              </section>

              {/* Section 3: What LENS Revealed */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <FileSearch className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">What LENS Revealed</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Before finalizing their assessment, the team ran the results through LENS for confidence analysis.
                </p>
                
                <Card className="p-6 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-amber-500">38%</div>
                    <div className="text-lg font-semibold text-amber-600">Weak Confidence</div>
                  </div>
                  <p className="text-center text-muted-foreground">
                    LENS returned a confidence score of <strong>38%</strong> for the forum account attribution—
                    categorized as "Weak" confidence.
                  </p>
                </Card>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Signals Supporting Attribution
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <UserCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Username pattern similarity (alex_chen_dev follows conventions)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Code className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Profile mentions software development background</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileSearch className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Account active during consistent timeframe</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6 border-2 border-destructive/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-destructive" />
                      Signals Weakening Attribution
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span><strong>Geographic inconsistency:</strong> Forum references Seattle; candidate lived in Boston</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Code className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span><strong>Technical focus mismatch:</strong> Forum discusses security; candidate is frontend dev</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Pen className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span><strong>Writing style divergence:</strong> Significant linguistic pattern differences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Link2 className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span><strong>No cross-platform links:</strong> None of 34 verified accounts referenced this forum</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="LENS Analysis Conclusion">
                The evidence supported a connection based on username pattern alone. However, multiple 
                independent signals contradicted the attribution. The most likely explanation: this forum 
                account belongs to a different person who happens to share a common name.
              </BlogPullQuote>

              <BlogCallout type="info" title="LENS Recommendation">
                <p>
                  <em>"Do not rely on this finding without substantial additional evidence. The signals that 
                  weaken attribution are more specific than those that support it."</em>
                </p>
              </BlogCallout>

              {/* Section 4: The Verification */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <UserCheck className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">The Verification</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    The security team decided to investigate further rather than flag the candidate immediately.
                  </p>
                  <p className="text-lg font-semibold">
                    Additional research confirmed LENS's analysis:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>The forum account had posted photos from Seattle-area locations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>The account's email domain was associated with a Seattle-based company</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>The candidate, when asked, expressed no familiarity with the forum topics</span>
                    </li>
                  </ul>
                  <p className="text-lg text-primary font-semibold mt-4">
                    The forum account belonged to a different Alex Chen—a security researcher based in 
                    Seattle with no connection to the job candidate.
                  </p>
                </Card>
              </section>

              <BlogCallout type="success" title="Outcome">
                <p>
                  <strong>The candidate was hired.</strong> They've been with the company for eight months 
                  and received a positive performance review. The Seattle-based security researcher continues 
                  posting on the forum, unaware they were briefly mistaken for someone else.
                </p>
              </BlogCallout>

              {/* Section 5: What Would Have Happened Without LENS */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <UserX className="w-8 h-8 text-destructive" />
                  <h2 className="text-3xl font-bold">What Would Have Happened Without LENS</h2>
                </div>
                <div className="space-y-4">
                  <Card className="p-6 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent">
                    <h3 className="text-xl font-semibold mb-2">Best Case Scenario</h3>
                    <p className="text-muted-foreground">
                      Flagged for additional review, delaying the hiring process by weeks. The candidate 
                      might have accepted another offer during this period. The company would have lost 
                      a qualified hire.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-transparent">
                    <h3 className="text-xl font-semibold mb-2">Worse Case Scenario</h3>
                    <p className="text-muted-foreground">
                      Forum findings included in report without verification. The candidate's offer might 
                      have been rescinded based on incorrect information. Legal and reputational consequences 
                      could follow if the candidate discovered the reason.
                    </p>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-muted bg-gradient-to-r from-muted/20 to-transparent">
                    <h3 className="text-xl font-semibold mb-2">Systemic Impact</h3>
                    <p className="text-muted-foreground">
                      The security team would have consumed significant time investigating a false lead. 
                      Trust in future OSINT findings would be diminished after the error was discovered. 
                      The same error pattern would likely recur.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Section 6: Key Lessons */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Key Lessons</h2>
                </div>
                <div className="grid gap-6">
                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3">1. Username Matches Are Not Evidence</h3>
                    <p className="text-muted-foreground">
                      Common names generate common usernames. "alexchen" appears on thousands of accounts 
                      worldwide. Without additional corroborating signals, a username match is nearly 
                      meaningless for identification purposes.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3">2. Contradictory Evidence Matters More</h3>
                    <p className="text-muted-foreground">
                      The signals that supported the attribution were generic: username pattern, profession 
                      category, general timing. The signals that contradicted it were specific: geographic 
                      location, technical specialty, writing style. <strong>Specific contradictions outweigh 
                      general confirmations.</strong>
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3">3. Confidence Scoring Prevents Premature Conclusions</h3>
                    <p className="text-muted-foreground">
                      Traditional tools would have returned the forum account as a "match" without qualification. 
                      LENS surfaced the contradictions automatically, preventing a hasty conclusion.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3">4. The Cost of False Positives Is Real</h3>
                    <p className="text-muted-foreground">
                      An innocent candidate nearly suffered professional harm. The company nearly lost a 
                      qualified hire. The security team nearly wasted resources on a false lead. These 
                      costs are often invisible until it's too late.
                    </p>
                  </Card>
                </div>
              </section>

              <BlogPullQuote>
                This is what evidence-based confidence scoring is designed to do: prevent harm by making 
                uncertainty visible before action is taken.
              </BlogPullQuote>

              {/* CTA Section */}
              <Card className="p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
                <h3 className="text-2xl font-bold mb-4">Protect Your Investigations with LENS</h3>
                <p className="text-muted-foreground mb-6">
                  See how confidence scoring and evidence analysis can prevent costly errors in your 
                  OSINT workflows.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/lens">
                    <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      Learn About LENS
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
