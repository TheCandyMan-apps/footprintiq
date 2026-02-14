import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { Link } from "react-router-dom";

const CANONICAL = "https://footprintiq.app/blog/what-is-digital-footprint-check";

const faqData = [
  {
    q: "What does a digital footprint check show?",
    a: "A digital footprint check reveals publicly visible information associated with your identity — including social media profiles, forum accounts, data broker listings, breach exposure, and public records. The goal is to give you a clear picture of what others can find about you online.",
  },
  {
    q: "Is a digital footprint check the same as a background check?",
    a: "No. A background check typically involves regulated databases, criminal records, and credit history. A digital footprint check focuses on publicly accessible information — what anyone with internet access could find using search engines, people-search sites, and OSINT tools.",
  },
  {
    q: "How often should I run a digital footprint check?",
    a: "We recommend running a check every 3–6 months, or after any significant life event (changing jobs, moving house, creating new accounts). Regular checks help you catch new exposures before they become problems.",
  },
  {
    q: "Can a digital footprint check find everything about me online?",
    a: "No tool can find everything. A footprint check surfaces publicly indexed information across known platforms and databases. Content behind logins, private messages, and unindexed pages are not visible. The check provides a practical snapshot, not a complete inventory.",
  },
  {
    q: "Is it legal to run a digital footprint check on yourself?",
    a: "Yes. Checking your own digital footprint is perfectly legal and is considered best practice for personal security hygiene. Running checks on other people requires appropriate authorisation and must comply with applicable privacy laws.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What Is a Digital Footprint Check?",
  description:
    "Learn what a digital footprint check is, what it reveals, how it works, and why regular self-auditing is essential for personal privacy and security.",
  author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
  mainEntityOfPage: CANONICAL,
  image: "https://footprintiq.app/blog-images/digital-footprint.webp",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
    { "@type": "ListItem", position: 3, name: "Digital Footprint Check", item: CANONICAL },
  ],
};

export default function WhatIsDigitalFootprintCheck() {
  return (
    <>
      <Helmet>
        <title>What Is a Digital Footprint Check? | FootprintIQ</title>
        <meta
          name="description"
          content="Learn what a digital footprint check is, what it reveals about your online presence, and why regular self-auditing is essential for privacy and security."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="What Is a Digital Footprint Check?" />
        <meta
          property="og:description"
          content="Understand what a digital footprint check reveals and how to use it to protect your privacy."
        />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd
        data={buildWebPageSchema({
          name: "What Is a Digital Footprint Check?",
          description:
            "Learn what a digital footprint check is, what it reveals, and why regular self-auditing is essential for personal security.",
          url: CANONICAL,
          datePublished: "2026-02-14",
          dateModified: "2026-02-14",
        })}
      />

      <Header />

      <main className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-16 md:py-20 max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Digital Footprint Check</span>
          </nav>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                Privacy
              </span>
              <span className="text-xs text-muted-foreground">February 14, 2026</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">10 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              What Is a Digital Footprint Check?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A practical explanation of what digital footprint checks involve, what they reveal, their limitations, and why periodic self-auditing has become essential for personal privacy.
            </p>
          </header>

          {/* ── Direct Answer ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/20">
            <p className="text-foreground leading-relaxed">
              <strong>A digital footprint check</strong> is a systematic review of the publicly visible information associated with your identity — including social media profiles, forum accounts, data broker listings, breach exposure, and public records. It answers a simple question: "What can someone find about me online?" Regular checks help you identify exposures, clean up old accounts, and reduce your attack surface before problems occur.
            </p>
          </section>

          {/* ── What It Includes ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              What a Digital Footprint Check Includes
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A comprehensive footprint check examines multiple layers of your online presence:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Username exposure</strong> — Which platforms have accounts registered with your known usernames? A{" "}
                <Link to="/username-scan" className="text-primary hover:underline">username scan</Link>{" "}
                checks hundreds of sites automatically.
              </li>
              <li><strong>Email breach history</strong> — Has your email address appeared in known data breaches? This indicates whether your credentials may have been leaked.</li>
              <li><strong>Data broker listings</strong> — Do people-search sites like Spokeo, 192.com, or BeenVerified have your personal information? These listings aggregate public records and make them easily searchable.</li>
              <li><strong>Social media profiles</strong> — What public information is visible on your social media accounts? Profile photos, bios, and posts can all be indexed by search engines.</li>
              <li><strong>Public records</strong> — Electoral roll entries, company filings, property records, and court documents may contain your name and address.</li>
              <li><strong>Dark web signals</strong> — Have your credentials or personal data been referenced in publicly reported breach databases?</li>
            </ul>
          </section>

          {/* ── Active vs Passive Footprint ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Active vs Passive Digital Footprint
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your digital footprint consists of two categories:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Active footprint</strong> — Information you deliberately share: social media posts, profile bios, forum comments, blog posts, and public reviews. You have direct control over this.</li>
              <li><strong>Passive footprint</strong> — Information collected about you without your direct action: data broker aggregations, breach exposure, metadata from website visits, and public records. This is harder to control.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              A footprint check surfaces both categories. Most people are surprised by the volume of their passive footprint — data they never chose to share but that is publicly visible.
            </p>
          </section>

          {/* ── Cross-link insert ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/10">
            <p className="text-foreground leading-relaxed mb-3">
              One of the most effective ways to reduce your digital footprint is to find and delete accounts you no longer use. Dormant accounts are scraped by data brokers and targeted in credential stuffing attacks.
            </p>
            <Link
              to="/blog/delete-old-accounts"
              className="text-sm font-medium text-primary hover:underline"
            >
              → How to Delete Old Accounts You No Longer Use
            </Link>
          </section>

          {/* ── How It Works ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              How Digital Footprint Checks Work
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Automated footprint checks combine multiple techniques to build a picture of your public exposure:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3 ml-4">
              <li><strong>Username enumeration</strong> — Checking hundreds of platforms for accounts registered with your known usernames by querying public profile endpoints.</li>
              <li><strong>Email breach cross-referencing</strong> — Comparing your email addresses against known breach databases to identify leaked credentials.</li>
              <li><strong>Data broker indexing</strong> — Scanning people-search sites for listings containing your name, address, phone number, or other PII.</li>
              <li><strong>Search engine querying</strong> — Checking what Google and other search engines return for your name, usernames, and email addresses.</li>
              <li><strong>Confidence scoring</strong> — Evaluating how likely each finding is to be accurate, distinguishing confirmed matches from potential false positives.</li>
            </ol>
            <p className="text-muted-foreground leading-relaxed mt-4">
              No single tool covers everything. The most effective checks combine automated scanning with manual review for context and accuracy.
            </p>
          </section>

          {/* ── Why It Matters ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Why Regular Footprint Checks Matter
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your digital footprint changes over time — not just because you create new accounts, but because third parties continuously collect and publish information about you. Regular checks help you:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Catch new exposures early</strong> — New data broker listings, breach inclusions, and scraped profile data can appear at any time.</li>
              <li><strong>Verify past removals</strong> — Data brokers frequently re-collect information. Checking confirms whether previous removals have stuck.</li>
              <li><strong>Reduce identity theft risk</strong> — The more information publicly available about you, the easier it is for attackers to impersonate you or bypass security questions.</li>
              <li><strong>Prepare for life changes</strong> — Before job applications, public appearances, or relationship changes, understanding your exposure helps you control your narrative.</li>
            </ul>
          </section>

          {/* ── Cross-link insert ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/10">
            <p className="text-foreground leading-relaxed mb-3">
              If your footprint check reveals data broker listings, targeted removal requests can eliminate the most sensitive exposures. UK residents have strong GDPR rights for this.
            </p>
            <Link
              to="/blog/remove-from-data-brokers-uk"
              className="text-sm font-medium text-primary hover:underline"
            >
              → How to Remove Yourself From Data Brokers (UK Guide)
            </Link>
          </section>

          {/* ── Limitations ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Limitations of Digital Footprint Checks
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              It's important to understand what footprint checks cannot do:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>They can't see private content</strong> — Content behind login walls, private messages, and non-indexed pages are not visible to external scans.</li>
              <li><strong>False positives exist</strong> — Common usernames may match accounts belonging to different people. Confidence scoring helps, but manual verification is sometimes needed.</li>
              <li><strong>They provide a snapshot, not continuous monitoring</strong> — A check shows your exposure at a point in time. New data can appear between checks.</li>
              <li><strong>They don't automatically remove anything</strong> — A footprint check identifies exposures; removal requires separate action.</li>
            </ul>
          </section>

          {/* ── When to Run One ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              When Should You Run a Digital Footprint Check?
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Before applying for a new job or public-facing role</li>
              <li>After a data breach notification</li>
              <li>Before or after moving house (to check address exposure)</li>
              <li>Quarterly or semi-annually as routine security hygiene</li>
              <li>After deleting old accounts (to verify they're no longer indexed)</li>
              <li>Before engaging with data broker removal services</li>
            </ul>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="mb-12 p-8 rounded-2xl border-2 border-primary/30 bg-primary/5 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Run Your First Digital Footprint Check
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              A free exposure scan identifies public profiles, data broker listings, and breach exposure linked to your identity — giving you a clear picture of what's publicly visible.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Run Free Exposure Scan
            </Link>
          </section>

          {/* ── FAQ ── */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqData.map((f, i) => (
                <div key={i} className="border-b border-border/40 pb-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Related Articles ── */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Related Articles</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>
                <Link to="/blog/delete-old-accounts" className="text-primary hover:underline">
                  How to Delete Old Accounts You No Longer Use
                </Link>
              </li>
              <li>
                <Link to="/blog/remove-from-data-brokers-uk" className="text-primary hover:underline">
                  How to Remove Yourself From Data Brokers (UK Guide)
                </Link>
              </li>
              <li>
                <Link to="/blog/remove-address-from-google" className="text-primary hover:underline">
                  How to Remove Your Address From Google
                </Link>
              </li>
              <li>
                <Link to="/ai-answers-hub" className="text-primary hover:underline">
                  AI Answers Hub
                </Link>{" "}
                — Get answers to OSINT and digital privacy questions
              </li>
              <li>
                <Link to="/username-scan" className="text-primary hover:underline">
                  Username Scan
                </Link>{" "}
                — Check where a username appears across 500+ platforms
              </li>
            </ul>
          </section>

          <GuideCitationBlock />
        </article>

        <RelatedToolsGrid currentPath="/blog/what-is-digital-footprint-check" />
      </main>

      <Footer />
    </>
  );
}
