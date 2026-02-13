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
    question: "What is the difference between a username OSINT scan and a reverse username lookup?",
    answer:
      "A reverse username lookup typically searches for accounts matching a specific username across platforms. A username OSINT scan goes further — it also analyses patterns, cross-references findings with other identifiers, checks breach databases, and applies confidence scoring to distinguish genuine matches from false positives. The scan produces intelligence, not just a list of URLs.",
  },
  {
    question: "Are username OSINT scans legal?",
    answer:
      "Yes, when conducted ethically. Username OSINT scans access only publicly available information — the same data anyone could find through manual searching. They do not bypass authentication, scrape behind logins, or access private databases. Self-assessment and authorised professional investigations are standard lawful use cases.",
  },
  {
    question: "How accurate are automated username scan results?",
    answer:
      "Accuracy varies significantly by tool. FootprintIQ research found that approximately 41% of automated username matches represent false positives or unverified correlations. Advanced tools use confidence scoring, profile metadata analysis, and multi-signal correlation to improve accuracy, but no automated tool achieves 100% precision.",
  },
  {
    question: "Can a username OSINT scan find deleted accounts?",
    answer:
      "In some cases, yes. Cached versions of pages, web archives, and third-party data aggregators may retain references to accounts that have been deleted from the original platform. However, these references become less reliable over time and should be interpreted with caution.",
  },
  {
    question: "Should I use a username OSINT scan to investigate someone else?",
    answer:
      "Only with proper authorisation. Ethical OSINT tools are designed for self-assessment, corporate security investigations with appropriate legal authority, and threat intelligence within professional frameworks. Using these tools to stalk, harass, or investigate individuals without consent raises serious ethical and legal concerns.",
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
  headline: "What Is a Username OSINT Scan?",
  description:
    "Learn what a username OSINT scan is, how it works, its accuracy limitations, and when to use one. Authoritative 2026 guide to ethical username investigation.",
  image: "https://footprintiq.app/blog-images/username-security.webp",
  datePublished: "2026-02-13T10:00:00Z",
  dateModified: "2026-02-13T10:00:00Z",
  author: {
    "@type": "Organization",
    name: "FootprintIQ",
  },
  publisher: organizationSchema,
  wordCount: 2100,
  keywords:
    "username OSINT scan, reverse username lookup, username investigation tool, find accounts by username, OSINT, digital footprint",
  about: [
    { "@type": "Thing", name: "Username OSINT scan" },
    { "@type": "Thing", name: "Open Source Intelligence" },
    { "@type": "Thing", name: "Reverse username lookup" },
    { "@type": "Thing", name: "Digital footprint" },
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
      name: "What Is a Username OSINT Scan?",
    },
  ],
};

const webPageSchema = buildWebPageSchema({
  name: "What Is a Username OSINT Scan?",
  description:
    "Learn what a username OSINT scan is, how it works, its accuracy limitations, and when to use one. Authoritative 2026 guide to ethical username investigation.",
  url: "https://footprintiq.app/blog/what-is-username-osint-scan",
  datePublished: "2026-02-13",
  dateModified: "2026-02-13",
  lastReviewed: "2026-02-13",
});

export default function WhatIsUsernameOsintScan() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="What Is a Username OSINT Scan? | FootprintIQ"
        description="Learn what a username OSINT scan is, how it works, its accuracy limitations, and when to use one. Authoritative 2026 guide to ethical username investigation."
        canonical="https://footprintiq.app/blog/what-is-username-osint-scan"
        ogImage="https://footprintiq.app/blog-images/username-security.webp"
        article={{
          publishedTime: "2026-02-13T10:00:00Z",
          modifiedTime: "2026-02-13T10:00:00Z",
          author: "FootprintIQ",
          tags: [
            "Username OSINT",
            "Reverse Username Lookup",
            "OSINT",
            "Privacy",
            "Digital Footprint",
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
              OSINT Guide
            </Badge>
            <Badge variant="outline">Username Intelligence</Badge>
            <span className="text-muted-foreground">February 13, 2026</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">10 min read</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            What Is a Username OSINT Scan?
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
              A username OSINT scan is an automated search that checks whether a
              specific username exists across hundreds of online platforms, forums,
              and services using publicly available data. It uses Open Source
              Intelligence (OSINT) techniques to identify where a handle appears,
              correlate findings across sources, and assess confidence levels —
              helping individuals and security professionals understand username
              exposure without accessing private systems.
            </p>

            <h2>Defining Username OSINT</h2>

            <p>
              OSINT — Open Source Intelligence — refers to the collection and analysis
              of information from publicly accessible sources. A username OSINT scan
              applies this discipline specifically to usernames: searching public
              platforms, breach databases, forums, and registries for accounts
              matching a given handle.
            </p>

            <p>
              Unlike a simple search engine query, a username OSINT scan uses
              specialised tools — such as{" "}
              <Link to="/ai-answers-hub">Maigret, Sherlock, and WhatsMyName</Link>{" "}
              — that query platform-specific endpoints directly. This allows detection
              of profiles that may not appear in Google results due to indexing
              limitations, robots.txt restrictions, or platform-level privacy settings.
            </p>

            <p>
              The output is a structured report showing which platforms returned a
              match, the confidence level of each finding, and — in advanced tools —
              how those findings relate to each other.
            </p>

            <h2>How Username Reuse Works Across Platforms</h2>

            <p>
              Most people reuse usernames. Research conducted by FootprintIQ found that
              the median number of public profiles linked to a reused username is 4.2
              platforms. This reuse creates a visibility pattern — a connectable thread
              across otherwise unrelated services.
            </p>

            <p>
              Username reuse happens for understandable reasons: memorable handles are
              convenient, personal branding benefits from consistency, and managing
              different usernames across dozens of services is impractical for most
              people.
            </p>

            <p>
              However, this reuse has consequences for privacy and security:
            </p>

            <ul>
              <li>
                <strong>Cross-platform identification</strong> — A username that appears
                on both a professional networking site and a gaming forum connects two
                contexts that the user may have preferred to keep separate
              </li>
              <li>
                <strong>Attack surface expansion</strong> — Each additional platform
                where a username exists creates another potential entry point for social
                engineering or credential-based attacks
              </li>
              <li>
                <strong>Historical exposure</strong> — Forgotten accounts on defunct or
                rarely-used platforms may still be publicly accessible, exposing
                information the user considers obsolete
              </li>
              <li>
                <strong>Inference chains</strong> — When combined with other identifiers
                (email addresses, profile photos, or writing style), username matches
                across platforms can build a detailed profile of an individual
              </li>
            </ul>

            <p>
              For a deeper analysis of these patterns, see our{" "}
              <Link to="/blog/username-reuse">
                research on username reuse and digital exposure
              </Link>.
            </p>

            <h2>What Automated Username Tools Actually Check</h2>

            <p>
              A username OSINT scan doesn't simply Google a handle. Automated tools
              perform several distinct operations:
            </p>

            <h3>Platform-Specific Endpoint Queries</h3>

            <p>
              Tools maintain databases of hundreds of platform URLs with known patterns
              (e.g., <code>twitter.com/&#123;username&#125;</code>,{" "}
              <code>github.com/&#123;username&#125;</code>). They send HTTP requests to
              each endpoint and analyse the response — checking status codes, page
              content, and metadata to determine whether an account exists.
            </p>

            <h3>Response Classification</h3>

            <p>
              Not all platforms respond the same way. Some return a 404 for
              non-existent users. Others redirect to a search page. Some return a 200
              status code regardless, requiring content analysis to determine whether
              the page represents an actual profile. Sophisticated tools handle these
              variations with platform-specific parsing logic.
            </p>

            <h3>Breach Database Cross-Referencing</h3>

            <p>
              Advanced scans check whether the username (or associated email addresses)
              appears in known data breaches. This adds a security dimension beyond
              simple presence detection, helping identify whether credentials linked
              to the handle have been compromised.
            </p>

            <h3>Profile Metadata Analysis</h3>

            <p>
              Some tools extract additional context from discovered profiles — account
              creation dates, bio text, follower counts, and activity indicators. This
              metadata helps analysts assess whether a match is likely genuine or
              coincidental.
            </p>

            <h3>Confidence Scoring</h3>

            <p>
              FootprintIQ's{" "}
              <Link to="/lens">LENS framework</Link> applies
              confidence scoring to each finding, evaluating signal quality,
              corroboration across sources, and contextual consistency. This
              distinguishes tools that produce raw match lists from those that produce
              actionable intelligence.
            </p>

            <h2>Accuracy Limitations and False Positives</h2>

            <p>
              No automated username scan achieves perfect accuracy. Understanding the
              limitations is essential for interpreting results correctly.
            </p>

            <h3>The False Positive Problem</h3>

            <p>
              FootprintIQ's research found that approximately <strong>41% of
              automated username matches represent false positives</strong> or
              unverified correlations. Common usernames — "admin", "john",
              "gamer123" — generate particularly high false-positive rates because
              multiple unrelated individuals use the same handle independently.
            </p>

            <h3>Platform-Level Ambiguity</h3>

            <p>
              Some platforms don't clearly differentiate between "this account exists"
              and "this username is reserved" or "this page exists but belongs to a
              different entity." Without careful parsing, tools can misclassify these
              responses.
            </p>

            <h3>Temporal Accuracy</h3>

            <p>
              Scan results reflect a point in time. Accounts may be created, deleted,
              renamed, or made private between scans. Cached results in third-party
              databases (including data brokers) often lag behind the current state of
              platforms, sometimes by months or years. In fact, FootprintIQ research
              indicates that{" "}
              <strong>89% of data broker entries reference outdated or stale
              information</strong>.
            </p>

            <h3>Identity vs. Existence</h3>

            <p>
              A scan can determine that an account with a given username exists on a
              platform. It cannot, by itself, prove that the account belongs to a
              specific person. This distinction is critical — and often overlooked by
              tools that present matches as definitive identifications.
            </p>

            <p>
              For a detailed exploration of why confidence matters more than match
              count, see{" "}
              <Link to="/blog/lens-osint-confidence-wrong">
                why most OSINT tools get confidence wrong
              </Link>.
            </p>

            <h2>Ethical and Legal Considerations</h2>

            <p>
              Username OSINT scans operate in a space where capability and
              responsibility must be carefully balanced.
            </p>

            <h3>Legality</h3>

            <p>
              Accessing publicly available information is legal in most jurisdictions.
              Username OSINT scans check the same data anyone could find through manual
              searching — they simply do it faster and at scale. However, how the
              results are used matters significantly. Using scan results for harassment,
              stalking, or discrimination can violate laws regardless of how the data
              was obtained.
            </p>

            <h3>Ethical Boundaries</h3>

            <p>
              Responsible OSINT practitioners follow clear ethical guidelines:
            </p>

            <ul>
              <li>
                <strong>Public data only</strong> — No scraping behind logins, no
                bypassing authentication, no accessing restricted databases
              </li>
              <li>
                <strong>Proportionality</strong> — The scope of investigation should
                match the legitimate purpose
              </li>
              <li>
                <strong>No certainty overclaiming</strong> — Presenting a username
                match as proof of identity is irresponsible without corroborating
                evidence
              </li>
              <li>
                <strong>Consent and authorisation</strong> — Self-assessment and
                authorised investigations are appropriate; unsolicited surveillance is
                not
              </li>
              <li>
                <strong>Minimisation</strong> — Collect only what's needed for the
                stated purpose, and retain it only as long as necessary
              </li>
            </ul>

            <p>
              FootprintIQ's approach to these principles is detailed in our{" "}
              <Link to="/blog/ethical-osint-exposure">
                ethical OSINT framework
              </Link>.
            </p>

            <h2>When to Use a Username OSINT Scan</h2>

            <p>
              Username OSINT scans are valuable in several well-defined contexts:
            </p>

            <ul>
              <li>
                <strong>Personal exposure assessment</strong> — Understanding where
                your own username appears online and what information is publicly
                connected to it
              </li>
              <li>
                <strong>Pre-employment security review</strong> — Checking your own
                digital footprint before a job search to identify potentially
                problematic content
              </li>
              <li>
                <strong>Incident response</strong> — After a breach notification,
                scanning to understand the scope of exposure linked to a compromised
                identifier
              </li>
              <li>
                <strong>Authorised corporate investigations</strong> — Security teams
                investigating threats, brand impersonation, or insider risks with
                proper legal authority
              </li>
              <li>
                <strong>Account consolidation</strong> — Identifying forgotten accounts
                that should be deleted or secured as part of a digital hygiene routine
              </li>
            </ul>

            <p>
              FootprintIQ's{" "}
              <Link to="/scan">username scan</Link> covers 500+
              platforms and applies LENS confidence scoring to every result.
            </p>

            <h2>When NOT to Use a Username OSINT Scan</h2>

            <p>
              Username OSINT scans should not be used in the following situations:
            </p>

            <ul>
              <li>
                <strong>Investigating someone without authorisation</strong> — Scanning
                another person's username without their knowledge or legal authority is
                ethically problematic and may violate privacy regulations
              </li>
              <li>
                <strong>Making identity claims from username matches alone</strong> — A
                shared username does not prove shared identity. Drawing conclusions
                without corroborating evidence is unreliable and potentially harmful
              </li>
              <li>
                <strong>Circumventing platform privacy controls</strong> — If an
                account is set to private, ethical tools respect that boundary
              </li>
              <li>
                <strong>Harassment, doxxing, or stalking</strong> — Using any OSINT
                tool to target, threaten, or expose an individual is unethical and
                illegal
              </li>
              <li>
                <strong>Replacing professional investigation</strong> — For legal
                proceedings, due diligence, or formal inquiries, automated scans
                should supplement — not replace — qualified human analysis
              </li>
            </ul>

            <h2>Automated vs. Manual Username OSINT: A Balanced Comparison</h2>

            <p>
              Both automated and manual OSINT have legitimate roles. Understanding
              their strengths and weaknesses helps you choose the right approach.
            </p>

            <h3>Automated Scans</h3>

            <ul>
              <li>
                <strong>Strengths:</strong> Speed, breadth (hundreds of platforms in
                seconds), consistency, and repeatability
              </li>
              <li>
                <strong>Weaknesses:</strong> Higher false-positive rates, limited
                contextual understanding, inability to assess nuance or intent, and
                susceptibility to platform changes that break parsing logic
              </li>
              <li>
                <strong>Best for:</strong> Initial discovery, broad exposure
                assessment, and identifying platforms to investigate further
              </li>
            </ul>

            <h3>Manual Investigation</h3>

            <ul>
              <li>
                <strong>Strengths:</strong> Contextual understanding, ability to verify
                identity through content analysis, nuanced interpretation of
                ambiguous results, and adaptive methodology
              </li>
              <li>
                <strong>Weaknesses:</strong> Time-intensive, limited platform coverage,
                inconsistent across analysts, and difficult to scale
              </li>
              <li>
                <strong>Best for:</strong> Verification of automated findings,
                attribution analysis, and investigations requiring legal-grade
                evidence
              </li>
            </ul>

            <h3>The Optimal Approach</h3>

            <p>
              The most effective methodology combines both: automated scans for
              discovery and breadth, followed by manual verification of high-priority
              findings. FootprintIQ's LENS confidence scoring bridges this gap by
              helping analysts prioritise which automated findings warrant manual
              follow-up — reducing time spent on false positives while maintaining
              thorough coverage.
            </p>

            <p>
              For more context on how this hybrid approach works, explore our{" "}
              <Link to="/ai-answers-hub">
                AI Answers Hub
              </Link>{" "}
              or review{" "}
              <Link to="/blog/lens-introduction">
                how LENS bridges the gap between raw data and intelligence
              </Link>.
            </p>

            {/* Cite this page */}
            <div className="my-12 p-6 bg-muted/40 rounded-2xl border border-border">
              <p className="text-sm text-muted-foreground !my-0">
                <strong className="text-foreground">Cite this page:</strong>{" "}
                FootprintIQ — "What Is a Username OSINT Scan?" Published February
                2026. FootprintIQ is an independent digital exposure intelligence
                platform focused on ethical OSINT and public-data awareness.
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
              Check your username exposure across 500+ platforms
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Run a free username scan to see where your handle appears online.
              Results include confidence scoring and false-positive filtering. No
              credit card required.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link to="/scan">Run a Free Username Scan</Link>
            </Button>
          </div>

          {/* Related Articles */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/blog/username-reuse" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">
                    Research
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Why Username Reuse Creates Digital Exposure
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    How using the same handle across platforms affects your
                    visibility and security.
                  </p>
                </Card>
              </Link>
              <Link to="/blog/lens-osint-confidence-wrong" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">LENS</Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Why Most OSINT Tools Get Confidence Wrong
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Binary results mislead analysts. Learn why probabilistic
                    thinking matters in OSINT.
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <RelatedToolsGrid currentPath="/blog/what-is-username-osint-scan" />
      <Footer />
    </div>
  );
}
