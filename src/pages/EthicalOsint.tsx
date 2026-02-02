import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  BookOpen, 
  Shield, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Eye,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";

export default function EthicalOsint() {
  const origin = "https://footprintiq.app";
  const publishDate = "2026-02-02T00:00:00Z";
  
  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: origin
      },
      {
        "@type": "ListItem" as const,
        position: 2,
        name: "What Is Ethical OSINT"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What Is Ethical OSINT? Principles, Boundaries, and Best Practices",
    description: "A comprehensive guide to ethical open-source intelligence (OSINT), explaining what it means, what it is not, and why ethics matter in digital research and people search tools.",
    datePublished: publishDate,
    dateModified: publishDate,
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    inLanguage: "en",
    isAccessibleForFree: true,
    keywords: "ethical OSINT, open source intelligence ethics, OSINT principles, responsible data research, digital privacy, people search ethics",
    about: [
      { "@type": "Thing", name: "Open Source Intelligence" },
      { "@type": "Thing", name: "Research Ethics" },
      { "@type": "Thing", name: "Digital Privacy" },
      { "@type": "Thing", name: "Data Accuracy" }
    ]
  };

  const principles = [
    {
      title: "Consent and Authorization",
      description: "Ethical OSINT prioritizes self-initiated research. Individuals auditing their own digital footprint is fundamentally different from investigating others without consent."
    },
    {
      title: "Accuracy Over Volume",
      description: "Quality matters more than quantity. Responsible practitioners acknowledge uncertainty, flag potential false positives, and avoid overstating confidence in results."
    },
    {
      title: "Proportionality",
      description: "The depth and scope of research should be appropriate to the legitimate purpose. Not everything that can be found should be found."
    },
    {
      title: "Transparency",
      description: "Ethical tools and practitioners are clear about their methods, sources, limitations, and the potential for error in their findings."
    },
    {
      title: "Minimization",
      description: "Collect only what is necessary. Avoid aggregating or correlating data beyond what serves the stated, legitimate purpose."
    },
    {
      title: "Harm Prevention",
      description: "Consider the potential consequences of research and findings. Avoid actions that could facilitate harassment, stalking, or discrimination."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO 
        title="What Is Ethical OSINT? Principles, Boundaries, and Best Practices | FootprintIQ"
        description="A comprehensive guide to ethical open-source intelligence (OSINT), explaining what it means, what it is not, and why ethics matter in digital research and people search tools."
        canonical={`${origin}/ethical-osint`}
        ogType="article"
        article={{
          publishedTime: publishDate,
          modifiedTime: publishDate,
          author: "FootprintIQ",
          tags: ["Ethical OSINT", "Research Ethics", "Digital Privacy", "Open Source Intelligence"]
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs: breadcrumbs,
          custom: articleSchema
        }}
      />
      <Header />
      
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Back Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Resources
          </Link>

          {/* Badge */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <Scale className="w-3 h-3 mr-1" />
              Cornerstone Guide
            </Badge>
            <Badge variant="outline">Ethics & Principles</Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            What Is Ethical OSINT?
          </h1>

          {/* Gradient Divider */}
          <div className="h-1 w-32 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8"></div>

          {/* Lead Section */}
          <div className="text-xl text-foreground/80 leading-relaxed mb-12 space-y-4">
            <p>
              Open-source intelligence (OSINT) refers to the collection and analysis of information 
              from publicly available sources. But the fact that data is public does not automatically 
              make its collection or use ethical.
            </p>
            <p>
              This guide defines ethical OSINT, establishes clear boundaries, and explains why 
              responsible practices matter — for individuals, researchers, and the tools that 
              serve them.
            </p>
          </div>

          <Separator className="my-12" />

          {/* Article Content */}
          <div className="prose prose-lg max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:my-4
            prose-ul:my-6 prose-ol:my-6
            prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline">
            
            {/* Section 1: What OSINT Is */}
            <h2 className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              What OSINT Is
            </h2>

            <p>
              OSINT — Open-Source Intelligence — is the practice of collecting and analyzing 
              information from publicly accessible sources to answer specific questions or 
              understand a subject.
            </p>

            <p>
              These sources include:
            </p>

            <ul>
              <li><strong>Public websites and social media profiles</strong> — posts, bios, connections</li>
              <li><strong>Government records</strong> — court filings, corporate registrations, property records</li>
              <li><strong>News and media</strong> — articles, press releases, archived content</li>
              <li><strong>Academic and research publications</strong> — papers, datasets, conference proceedings</li>
              <li><strong>Technical data</strong> — domain registrations, certificate transparency logs, code repositories</li>
            </ul>

            <p>
              OSINT has legitimate applications across many fields: journalists verify sources, 
              security researchers identify vulnerabilities, businesses conduct due diligence, 
              and individuals audit their own digital exposure.
            </p>

            <BlogCallout type="info" title="Key Distinction">
              <p>
                OSINT relies on publicly available information. It does not involve hacking, 
                unauthorized access, or deception to obtain data. If information requires 
                bypassing access controls, it is not OSINT.
              </p>
            </BlogCallout>

            {/* Section 2: What Ethical OSINT Means */}
            <h2 className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              What Ethical OSINT Means
            </h2>

            <p>
              Ethical OSINT acknowledges that <strong>legality and morality are not the same thing</strong>. 
              Just because information is accessible does not mean its collection, aggregation, 
              or use is responsible.
            </p>

            <p>
              Ethical OSINT is guided by six core principles:
            </p>

            <div className="grid gap-4 my-8">
              {principles.map((principle, index) => (
                <Card key={index} className="p-4 border-l-4 border-l-primary">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    {principle.title}
                  </h4>
                  <p className="text-sm text-muted-foreground m-0">
                    {principle.description}
                  </p>
                </Card>
              ))}
            </div>

            <BlogPullQuote>
              Ethical OSINT asks not just "Can I find this?" but "Should I? And what might 
              happen if I do?"
            </BlogPullQuote>

            <p>
              These principles apply whether you are researching yourself, conducting authorized 
              investigations, or building tools that others will use. The standard remains the same: 
              responsible intent, proportionate scope, and honest acknowledgment of limitations.
            </p>

            {/* Section 3: What Ethical OSINT Is Not */}
            <h2 className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-primary" />
              What Ethical OSINT Is Not
            </h2>

            <p>
              Clarifying what ethical OSINT is <em>not</em> is as important as defining what it is. 
              Many tools and practices carry the OSINT label while violating its ethical foundations.
            </p>

            <h3>Not Surveillance</h3>

            <p>
              Ethical OSINT is not a tool for monitoring individuals without their knowledge or 
              consent. Tracking someone's online activity, aggregating their personal information 
              across sources, or building dossiers for the purpose of control or manipulation 
              falls outside ethical boundaries — regardless of whether the underlying data is public.
            </p>

            <h3>Not Doxing</h3>

            <p>
              Publishing someone's private information (real name, address, workplace, family members) 
              with the intent to harm, harass, or intimidate is never ethical — even when that 
              information was obtained from public sources.
            </p>

            <h3>Not Background Checking Without Consent</h3>

            <p>
              Using OSINT techniques to screen job candidates, tenants, or romantic partners 
              without their knowledge raises serious ethical and legal concerns. In many 
              jurisdictions, this violates data protection regulations and fair information practices.
            </p>

            <h3>Not Stalking or Harassment</h3>

            <p>
              Tools that enable tracking someone's location, social connections, or daily 
              patterns — even using public data — can facilitate stalking. Ethical OSINT 
              practitioners and platforms actively design against such misuse.
            </p>

            <BlogCallout type="warning" title="The Platform Responsibility">
              <p>
                Tools shape behavior. Platforms that make it easy to aggregate and correlate 
                personal data across sources bear responsibility for how that capability is used. 
                Ethical tool design includes friction against misuse — not just terms of service.
              </p>
            </BlogCallout>

            {/* Section 4: Public Data vs Harmful Use */}
            <h2 className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-primary" />
              Public Data vs Harmful Use
            </h2>

            <p>
              A common defense of problematic OSINT practices is: "But the data is public!" 
              This reasoning conflates availability with appropriateness.
            </p>

            <p>
              Consider these scenarios:
            </p>

            <ul>
              <li>
                <strong>A photo posted on social media</strong> — Public in a limited context. 
                Scraping it into a facial recognition database changes its nature entirely.
              </li>
              <li>
                <strong>A court record</strong> — Legally public, but aggregating someone's entire 
                legal history creates a profile they never consented to.
              </li>
              <li>
                <strong>A username on a forum</strong> — Visible to forum members. Correlating it 
                across platforms to build an identity profile crosses ethical lines.
              </li>
            </ul>

            <p>
              The ethical question is not just "Is this data accessible?" but:
            </p>

            <ul>
              <li>What was the <strong>context</strong> in which it was shared?</li>
              <li>What are the <strong>reasonable expectations</strong> of the person who shared it?</li>
              <li>What is the <strong>purpose</strong> of collecting and using it?</li>
              <li>What are the <strong>potential consequences</strong> of aggregation?</li>
            </ul>

            <BlogPullQuote>
              Public does not mean fair game. Context collapse — removing data from its 
              original context — transforms information in ways that can cause real harm.
            </BlogPullQuote>

            {/* Section 5: Accuracy, Context, and False Positives */}
            <h2 className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Accuracy, Context, and False Positives
            </h2>

            <p>
              Ethical OSINT requires rigorous attention to accuracy. Raw data from public sources 
              is often incomplete, outdated, or misattributed. Responsible practitioners acknowledge 
              these limitations rather than presenting findings as certainties.
            </p>

            <h3>The False Positive Problem</h3>

            <p>
              Research suggests that approximately <strong>41% of automated username matches</strong> represent 
              false positives or unverified correlations. Common sources include:
            </p>

            <ul>
              <li><strong>Common names and handles</strong> — "alex" exists on every platform, owned by different people</li>
              <li><strong>Recycled accounts</strong> — Usernames reassigned after deletion</li>
              <li><strong>Detection errors</strong> — Tools misinterpreting platform responses</li>
              <li><strong>Outdated information</strong> — Profiles that no longer reflect the person today</li>
            </ul>

            <p>
              Our <Link to="/research/username-reuse-report-2026">research on username reuse patterns</Link> explores 
              how these errors compound when correlating across platforms.
            </p>

            <h3>Contextual Interpretation</h3>

            <p>
              Data without context is noise. A username match is not proof of identity. An email 
              in a breach database doesn't indicate how the breach occurred or what actions followed. 
              Ethical analysis requires:
            </p>

            <ul>
              <li><strong>Confidence indicators</strong> — How likely is this match correct?</li>
              <li><strong>Temporal context</strong> — When was this information current?</li>
              <li><strong>Source transparency</strong> — Where did this come from?</li>
              <li><strong>Correlation warnings</strong> — What assumptions are being made?</li>
            </ul>

            <p>
              For more on how these issues affect username search tools specifically, see our guide on 
              <Link to="/guides/how-username-search-tools-work"> how username search tools actually work</Link>.
            </p>

            {/* Section 6: Why Ethics Matter in People Search Tools */}
            <h2 className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              Why Ethics Matter in People Search Tools
            </h2>

            <p>
              Tools that help people understand their digital exposure serve a legitimate purpose. 
              But the same capabilities can be misused. The difference between an ethical tool 
              and a harmful one often lies not in features but in design choices.
            </p>

            <h3>Ethical Tool Design Includes:</h3>

            <ul>
              <li>
                <strong>Self-search emphasis</strong> — Optimizing for users auditing their own exposure, 
                not investigating others
              </li>
              <li>
                <strong>Friction against misuse</strong> — Making it harder to aggregate information 
                about third parties without legitimate purpose
              </li>
              <li>
                <strong>Accuracy acknowledgment</strong> — Clearly communicating confidence levels, 
                potential false positives, and limitations
              </li>
              <li>
                <strong>Data minimization</strong> — Not storing, selling, or sharing the data 
                processed through the platform
              </li>
              <li>
                <strong>Transparency</strong> — Being clear about methods, sources, and what the 
                tool can and cannot determine
              </li>
            </ul>

            <BlogCallout type="tip" title="The FootprintIQ Approach">
              <p>
                FootprintIQ is designed primarily as a self-audit tool. We emphasize probability-based 
                analysis over false certainty, acknowledge limitations in our findings, and do not 
                store or sell user data. Learn more about our 
                <Link to="/responsible-use"> responsible use policy</Link> and 
                <Link to="/how-we-source-data"> data sourcing practices</Link>.
              </p>
            </BlogCallout>

            <h3>The Broader Stakes</h3>

            <p>
              As OSINT tools become more powerful and accessible, their potential for harm grows 
              alongside their potential for good. The choices made by tool designers, practitioners, 
              and users shape whether this technology serves to protect people or to exploit them.
            </p>

            <p>
              Ethical OSINT is not a constraint on capability. It is a framework for ensuring that 
              capability serves human dignity rather than undermining it.
            </p>

            <BlogPullQuote>
              The question is not whether we can build powerful tools. The question is whether 
              we can build them responsibly.
            </BlogPullQuote>

            <Separator className="my-12" />

            {/* Conclusion */}
            <h2 className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              Summary: The Ethical OSINT Framework
            </h2>

            <p>
              Ethical OSINT is defined by:
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-8">
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Ethical OSINT IS
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2 m-0 pl-4">
                  <li>User-initiated self-research</li>
                  <li>Authorized investigation with consent</li>
                  <li>Accurate, contextualized findings</li>
                  <li>Transparent about methods and limitations</li>
                  <li>Proportionate to legitimate purpose</li>
                  <li>Designed to minimize harm</li>
                </ul>
              </Card>
              <Card className="p-4 bg-destructive/5 border-destructive/20">
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Ethical OSINT IS NOT
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2 m-0 pl-4">
                  <li>Surveillance without consent</li>
                  <li>Doxing or harassment enablement</li>
                  <li>Background checks without authorization</li>
                  <li>Stalking or tracking tools</li>
                  <li>Data aggregation for profit</li>
                  <li>Certainty claims without evidence</li>
                </ul>
              </Card>
            </div>

            <p>
              Whether you are an individual assessing your own exposure, a researcher conducting 
              legitimate investigation, or a developer building OSINT tools — these principles 
              provide a foundation for responsible practice.
            </p>

            <p>
              For further reading, explore our <Link to="/blog/osint-beginners-guide">beginner's guide to OSINT</Link>, 
              our <Link to="/ethical-osint-for-individuals">guide to ethical OSINT for individuals</Link>, 
              or our <Link to="/responsible-use">responsible use policy</Link>.
            </p>

          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                Audit Your Own Digital Footprint
              </h3>
              <p className="text-muted-foreground mb-6">
                FootprintIQ helps you understand where your information appears online — 
                with honest accuracy assessment and transparent methodology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/scan">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Your Scan
                  </Button>
                </Link>
                <Link to="/how-we-source-data">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    How We Source Data
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
