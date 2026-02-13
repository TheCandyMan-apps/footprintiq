import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";

const faqItems = [
  {
    question: "How do I check how exposed I am online?",
    answer:
      "Start with a free digital footprint scan that searches public databases, breach indexes, social platforms, and data broker listings for your email, username, or phone number. Tools like FootprintIQ aggregate results from multiple OSINT sources and present an Exposure Score that summarises your overall public visibility.",
  },
  {
    question: "What is a digital footprint scan?",
    answer:
      "A digital footprint scan searches publicly accessible sources — including social media platforms, forums, people-search sites, breach databases, and public records — to identify where your personal information appears online. It does not access private accounts or bypass authentication.",
  },
  {
    question: "Is it legal to check my own digital exposure?",
    answer:
      "Yes. Checking your own publicly available information is legal in virtually all jurisdictions. Ethical OSINT tools like FootprintIQ only access publicly available data and do not bypass authentication, scrape behind logins, or access private systems.",
  },
  {
    question: "What's the difference between a data breach and digital exposure?",
    answer:
      "A data breach is a specific security incident where protected data is accessed without authorisation. Digital exposure is an ongoing state — it describes all the publicly discoverable information about you, whether from breaches, social media, data brokers, or public records.",
  },
  {
    question: "Can I remove my information from the internet?",
    answer:
      "You can reduce your exposure by submitting opt-out requests to data brokers, adjusting privacy settings on social platforms, deleting unused accounts, and requesting content removal from search engines. Full removal is rarely possible, but meaningful reduction is achievable with consistent effort.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  articleSection: "Educational",
  headline: "How Exposed Am I Online? (2026 Digital Footprint Guide)",
  description:
    "Learn how to measure your online exposure using ethical OSINT techniques. Comprehensive 2026 guide covering digital footprint scans, breach checks, and exposure reduction.",
  image: "https://footprintiq.app/blog-images/digital-footprint.webp",
  datePublished: "2026-02-13T09:00:00Z",
  dateModified: "2026-02-13T09:00:00Z",
  author: {
    "@type": "Organization",
    name: "FootprintIQ",
  },
  publisher: organizationSchema,
  wordCount: 2200,
  keywords:
    "how exposed am I online, digital footprint check, online exposure, digital footprint scan, OSINT, privacy, data broker, breach check",
  about: [
    { "@type": "Thing", name: "Digital exposure" },
    { "@type": "Thing", name: "Digital footprint" },
    { "@type": "Thing", name: "OSINT" },
    { "@type": "Thing", name: "Online privacy" },
  ],
};

const breadcrumbs = {
  "@context": "https://schema.org" as const,
  "@type": "BreadcrumbList" as const,
  itemListElement: [
    {
      "@type": "ListItem" as const,
      position: 1,
      name: "Home",
      item: "https://footprintiq.app",
    },
    {
      "@type": "ListItem" as const,
      position: 2,
      name: "Blog",
      item: "https://footprintiq.app/blog",
    },
    {
      "@type": "ListItem" as const,
      position: 3,
      name: "How Exposed Am I Online?",
    },
  ],
};

const webPageSchema = buildWebPageSchema({
  name: "How Exposed Am I Online? (2026 Digital Footprint Guide)",
  description:
    "Learn how to measure your online exposure using ethical OSINT techniques. Comprehensive 2026 guide covering digital footprint scans, breach checks, and exposure reduction.",
  url: "https://footprintiq.app/blog/how-exposed-am-i-online",
  datePublished: "2026-02-13",
  dateModified: "2026-02-13",
  lastReviewed: "2026-02-13",
});

export default function HowExposedAmIOnline() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="How Exposed Am I Online? (2026 Digital Footprint Guide)"
        description="Learn how to measure your online exposure using ethical OSINT techniques. Comprehensive 2026 guide covering digital footprint scans, breach checks, and exposure reduction."
        canonical="https://footprintiq.app/blog/how-exposed-am-i-online"
        ogImage="https://footprintiq.app/blog-images/digital-footprint.webp"
        article={{
          publishedTime: "2026-02-13T09:00:00Z",
          modifiedTime: "2026-02-13T09:00:00Z",
          author: "FootprintIQ",
          tags: [
            "Digital Footprint",
            "Online Exposure",
            "OSINT",
            "Privacy",
            "Breach Check",
          ],
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs: breadcrumbs,
          custom: articleSchema,
        }}
      />
      <JsonLd data={faqSchema} />
      <JsonLd data={webPageSchema} />
      <Header />

      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Back Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Header Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              2026 Guide
            </Badge>
            <Badge variant="outline">Privacy</Badge>
            <Badge variant="outline">OSINT</Badge>
            <span className="text-muted-foreground">February 13, 2026</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">11 min read</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            How Exposed Am I Online? (2026 Digital Footprint Guide)
          </h1>

          {/* Gradient Divider */}
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8"></div>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:my-4
            prose-ul:my-6 prose-ol:my-6
            prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline"
          >
            {/* Snippet-optimised direct answer */}
            <p className="text-xl leading-relaxed !text-foreground/80 !my-8">
              Your online exposure is the sum of all publicly discoverable information
              connected to your identity — including social media profiles, breach
              records, data broker listings, forum posts, and public records. A digital
              footprint scan checks these sources using ethical OSINT (Open Source
              Intelligence) techniques and presents an exposure score that summarises
              your overall public visibility. Most people are more exposed than they
              realise.
            </p>

            <h2>What Does "Online Exposure" Actually Mean?</h2>

            <p>
              Online exposure — sometimes called digital exposure or digital footprint
              visibility — describes how much information about you can be found,
              connected, and interpreted by anyone with access to public sources. This
              isn't about hacking or surveillance. It's about what's already visible.
            </p>

            <p>
              Your exposure includes several categories of publicly accessible
              information:
            </p>

            <ul>
              <li>
                <strong>Social media profiles</strong> — Public accounts on platforms
                like Instagram, Twitter/X, LinkedIn, Reddit, and TikTok
              </li>
              <li>
                <strong>Breach records</strong> — Email addresses, passwords, or
                personal details exposed in past data breaches
              </li>
              <li>
                <strong>Data broker listings</strong> — People-search sites like
                Spokeo, BeenVerified, and MyLife that aggregate public records
              </li>
              <li>
                <strong>Forum and community posts</strong> — Comments, profiles, and
                content on public forums, Discord servers, and community sites
              </li>
              <li>
                <strong>Username reuse patterns</strong> — The same handle appearing
                across multiple platforms, creating a connectable trail
              </li>
              <li>
                <strong>Public records</strong> — Property records, court filings,
                business registrations, and other government-held information
              </li>
            </ul>

            <p>
              The key insight is that individual data points become more significant
              when they connect.{" "}
              <Link to="/blog/what-is-digital-exposure">
                Digital exposure
              </Link>{" "}
              is cumulative — each piece of information adds context that makes the
              overall picture more detailed.
            </p>

            <h2>Why Your Online Exposure Matters</h2>

            <p>
              Understanding your exposure isn't about creating anxiety. It's about
              making informed decisions. Here's why it matters in practical terms:
            </p>

            <h3>Identity Theft and Social Engineering</h3>

            <p>
              Attackers use publicly available information to craft convincing phishing
              emails, impersonate you in social engineering attacks, or answer security
              questions to gain access to your accounts. The more information that's
              publicly connected to your identity, the easier these attacks become.
            </p>

            <h3>Reputation and Professional Risk</h3>

            <p>
              Employers, clients, and colleagues routinely search for people online.
              Old forum posts, cached social media content, or accounts you've
              forgotten can create impressions you didn't intend. Understanding what's
              visible helps you manage your professional narrative.
            </p>

            <h3>Data Broker Exploitation</h3>

            <p>
              People-search sites aggregate public records and make them searchable by
              name, address, phone number, or email. This information is often sold to
              marketers, background check services, and sometimes used for harassment
              or stalking. Our guide on{" "}
              <Link to="/blog/remove-data-brokers">
                removing your data from brokers
              </Link>{" "}
              covers the opt-out process in detail.
            </p>

            <h3>Credential Stuffing and Account Takeover</h3>

            <p>
              If your email appears in breach databases alongside reused passwords,
              attackers can use automated tools to try those credentials across hundreds
              of services. Understanding which breaches affect you is the first step to
              securing your accounts.
            </p>

            <h2>How a Digital Footprint Scan Works</h2>

            <p>
              A digital footprint scan — sometimes called an exposure scan or OSINT
              scan — searches publicly accessible sources for information connected to
              an identifier you provide. Here's how the process typically works:
            </p>

            <ol>
              <li>
                <strong>Input an identifier</strong> — You provide a username, email
                address, or phone number to scan
              </li>
              <li>
                <strong>Multi-source search</strong> — The scan queries multiple
                databases, platforms, and indexes simultaneously
              </li>
              <li>
                <strong>Result correlation</strong> — Findings are cross-referenced to
                identify connections between different data points
              </li>
              <li>
                <strong>False-positive filtering</strong> — Advanced scans use
                confidence scoring to distinguish genuine matches from coincidental
                similarities
              </li>
              <li>
                <strong>Exposure scoring</strong> — Results are aggregated into a
                structured summary that indicates your overall visibility level
              </li>
            </ol>

            <p>
              FootprintIQ's{" "}
              <Link to="/scan">exposure scan</Link> follows this
              process, drawing on multiple OSINT tools and applying our{" "}
              <Link to="/lens">LENS confidence framework</Link> to
              reduce false positives and provide context for each finding.
            </p>

            <h2>What Ethical OSINT Means (and Why It Matters)</h2>

            <p>
              Not all exposure-checking tools are created equal. Ethical OSINT tools
              follow specific principles that distinguish them from surveillance or
              invasive data collection:
            </p>

            <ul>
              <li>
                <strong>Public data only</strong> — No scraping behind logins, no
                bypassing authentication, no accessing private databases
              </li>
              <li>
                <strong>User-initiated</strong> — Scans run only when you request them,
                not as passive monitoring
              </li>
              <li>
                <strong>Transparency</strong> — Results explain what was found, where,
                and with what level of confidence
              </li>
              <li>
                <strong>No certainty claims</strong> — Responsible tools acknowledge
                uncertainty rather than presenting every match as definitive
              </li>
              <li>
                <strong>Privacy-first architecture</strong> — Your scan data isn't sold,
                shared, or used for purposes beyond your investigation
              </li>
            </ul>

            <p>
              For a deeper exploration of these principles, see our article on{" "}
              <Link to="/blog/ethical-osint-exposure">
                ethical OSINT and exposure assessment
              </Link>
              .
            </p>

            <h2>When to Check Your Digital Exposure</h2>

            <p>
              There are several situations where running a digital footprint scan is
              particularly valuable:
            </p>

            <ul>
              <li>
                <strong>After a reported data breach</strong> — Check whether your
                credentials or personal details were included
              </li>
              <li>
                <strong>Before a job search</strong> — Understand what employers will
                find when they search for you
              </li>
              <li>
                <strong>Periodically (every 3–6 months)</strong> — New breaches, data
                broker updates, and platform changes mean your exposure evolves over
                time
              </li>
              <li>
                <strong>When changing your online identity</strong> — Verify that old
                accounts and associations are no longer publicly linked
              </li>
              <li>
                <strong>If you suspect impersonation</strong> — Check whether accounts
                exist using your name, photos, or identifiers that you didn't create
              </li>
            </ul>

            <h2>When NOT to Use a Digital Footprint Scan</h2>

            <p>
              Digital footprint scans are designed for self-assessment and authorised
              investigation. They should not be used for:
            </p>

            <ul>
              <li>
                <strong>Investigating someone without authorisation</strong> — Scanning
                another person's identifiers without their knowledge or consent raises
                ethical and potentially legal concerns
              </li>
              <li>
                <strong>Stalking or harassment</strong> — Using OSINT tools to track,
                monitor, or harass individuals is unethical and illegal
              </li>
              <li>
                <strong>Bypassing privacy settings</strong> — If someone has made their
                information private, ethical tools respect those boundaries
              </li>
              <li>
                <strong>Making definitive identity claims</strong> — A username match
                across platforms doesn't prove ownership. Our{" "}
                <Link to="/blog/username-reuse">
                  research on username reuse
                </Link>{" "}
                found that approximately 41% of automated matches are false positives
              </li>
            </ul>

            <h2>Common Misconceptions About Online Exposure</h2>

            <h3>"I have nothing to hide, so exposure doesn't matter"</h3>

            <p>
              Exposure isn't about hiding things. It's about context. Information
              shared in one context (a gaming forum) can be interpreted differently in
              another (a job application). Understanding your exposure helps you manage
              how information travels between contexts.
            </p>

            <h3>"Deleting my accounts removes my exposure"</h3>

            <p>
              Deleting an account removes your ability to post new content, but cached
              versions, screenshots, and third-party copies may persist. Data brokers
              often retain information independently of the original source. Exposure
              reduction requires addressing multiple sources, not just the original
              platform.
            </p>

            <h3>"Only famous people need to worry about digital exposure"</h3>

            <p>
              Credential stuffing attacks, phishing campaigns, and identity theft
              target ordinary people far more frequently than public figures. Automated
              tools don't discriminate based on fame — they exploit any exposed
              credentials they can find.
            </p>

            <h3>"A clean Google search means I'm not exposed"</h3>

            <p>
              Google indexes only a fraction of the publicly accessible internet. Breach
              databases, data broker listings, archived forums, and platform-specific
              searches often reveal information that doesn't appear in standard search
              results.
            </p>

            <h2>
              Digital Footprint Scans vs. Have I Been Pwned vs. Data Broker Checks
            </h2>

            <p>
              Different tools serve different purposes. Here's how they compare:
            </p>

            <ul>
              <li>
                <strong>Have I Been Pwned (HIBP)</strong> — Focuses specifically on
                email and phone number appearances in known data breaches. Excellent for
                breach awareness, but doesn't cover social media presence, data broker
                listings, or username patterns.
              </li>
              <li>
                <strong>Data broker opt-out services</strong> — Focus on removing your
                information from people-search sites. They address one dimension of
                exposure but don't check breaches, social platforms, or username
                visibility.
              </li>
              <li>
                <strong>Comprehensive digital footprint scans</strong> — Tools like
                FootprintIQ combine multiple dimensions: breach records, social platform
                presence, data broker listings, username reuse, and more. They provide a
                holistic view of exposure rather than a single-dimension check.
              </li>
            </ul>

            <p>
              These tools are complementary, not competing. Using HIBP alongside a
              broader footprint scan gives you both depth (detailed breach data) and
              breadth (overall visibility assessment). See our{" "}
              <Link to="/blog/check-email-breach">
                email breach checking guide
              </Link>{" "}
              for more on this topic.
            </p>

            <h2>How to Reduce Your Online Exposure</h2>

            <p>
              Once you understand your exposure, you can take targeted action to reduce
              it:
            </p>

            <ol>
              <li>
                <strong>Audit your accounts</strong> — Identify and delete or deactivate
                accounts you no longer use, especially those with reused passwords
              </li>
              <li>
                <strong>Submit data broker opt-outs</strong> — Request removal from
                people-search sites like Spokeo, BeenVerified, and Whitepages. Our{" "}
                <Link to="/remove-personal-information-from-internet">
                  removal guide
                </Link>{" "}
                provides step-by-step instructions
              </li>
              <li>
                <strong>Tighten privacy settings</strong> — Review and restrict privacy
                settings on social media platforms. Our{" "}
                <Link to="/blog/social-media-privacy">
                  social media privacy guide
                </Link>{" "}
                covers major platforms
              </li>
              <li>
                <strong>Use unique passwords</strong> — A password manager eliminates
                credential reuse, which is the primary vector for account takeover
                attacks
              </li>
              <li>
                <strong>Enable two-factor authentication</strong> — Even if credentials
                are exposed in a breach, 2FA prevents unauthorised access
              </li>
              <li>
                <strong>Vary your usernames</strong> — Using different handles across
                platforms breaks the connection chain that makes cross-platform
                identification possible
              </li>
              <li>
                <strong>Request search engine removal</strong> — Google and Bing allow
                you to request removal of specific personal information from search
                results
              </li>
            </ol>

            <h2>Understanding Your Exposure Score</h2>

            <p>
              FootprintIQ's Exposure Score (0–100) provides a structured summary of
              your digital visibility based on four dimensions:
            </p>

            <ul>
              <li>
                <strong>Public profile presence</strong> — How many platforms show
                accounts linked to your identifier (the largest factor)
              </li>
              <li>
                <strong>Breach association</strong> — Whether your email or credentials
                appear in known data breaches
              </li>
              <li>
                <strong>High-severity signals</strong> — Critical findings such as
                exposed financial data or government records
              </li>
              <li>
                <strong>Identifier reuse</strong> — Whether the same identifier appears
                across multiple independent sources
              </li>
            </ul>

            <p>
              Scores are categorised as <strong>Low</strong> (0–24),{" "}
              <strong>Moderate</strong> (25–49), <strong>High</strong> (50–74), or{" "}
              <strong>Severe</strong> (75+). A higher score doesn't necessarily mean
              danger — it means greater public visibility that may warrant review.
            </p>

            {/* Cite this page */}
            <div className="my-12 p-6 bg-muted/40 rounded-2xl border border-border">
              <p className="text-sm text-muted-foreground !my-0">
                <strong className="text-foreground">Cite this page:</strong>{" "}
                FootprintIQ — "How Exposed Am I Online? (2026 Digital Footprint
                Guide)." Published February 2026. FootprintIQ is an independent
                digital exposure intelligence platform focused on ethical OSINT and
                public-data awareness.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-8 pb-3 border-b border-border">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqItems.map((item, i) => (
                <div key={i} className="p-6 bg-card rounded-2xl border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-3">
              See how exposed you are — in under 60 seconds
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Run a free Exposure Score scan with your email, username, or phone
              number. No credit card required. Public sources only.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link to="/scan">Run a Free Exposure Scan</Link>
            </Button>
          </div>

          {/* Related Articles */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/blog/what-is-digital-exposure" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">
                    Foundational
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    What Is Digital Exposure?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understand what digital exposure means and how it differs from a
                    data breach.
                  </p>
                </Card>
              </Link>
              <Link to="/blog/check-email-breach" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">
                    Practical
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    How to Check If Your Email Was Breached
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step guide to checking if your email was compromised in a
                    data breach.
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <RelatedToolsGrid currentPath="/blog/how-exposed-am-i-online" />
      <Footer />
    </div>
  );
}
