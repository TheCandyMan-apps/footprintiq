import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Search,
  CheckCircle,
  ArrowRight,
  Eye,
  Globe,
  Lock,
  Users,
  Fingerprint,
  Scale,
  Zap,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What are OSINT tools?",
    answer:
      "OSINT tools are software applications that collect, analyse, and correlate publicly available information from the internet. They automate the process of searching social media platforms, forums, public records, breach databases, and other open sources to produce actionable intelligence.",
  },
  {
    question: "Are OSINT tools legal to use?",
    answer:
      "Yes, when used to access publicly available information. OSINT tools query data that anyone can find through search engines and public websites. They do not bypass authentication, access private accounts, or scrape behind login walls. However, how you use the results must comply with applicable privacy laws and platform terms of service.",
  },
  {
    question: "What is the difference between OSINT and hacking?",
    answer:
      "OSINT exclusively uses publicly accessible information — the same data anyone can find by browsing the internet. Hacking involves unauthorised access to systems, accounts, or data. Ethical OSINT tools never bypass authentication, exploit vulnerabilities, or access private information.",
  },
  {
    question: "Can OSINT tools find private information?",
    answer:
      "No. Legitimate OSINT tools only access publicly available data. Private accounts, encrypted communications, and data behind authentication barriers are not accessible. If a tool claims to access private data, it is not operating within ethical OSINT boundaries.",
  },
  {
    question: "How do OSINT tools help with cybersecurity?",
    answer:
      "OSINT tools help security teams map attack surfaces, identify exposed credentials, detect impersonation attempts, assess social engineering risks, and monitor brand mentions. They provide the intelligence needed to proactively address vulnerabilities before they're exploited.",
  },
  {
    question: "What makes FootprintIQ different from other OSINT tools?",
    answer:
      "FootprintIQ combines multi-tool OSINT scanning with AI-powered confidence scoring and false-positive filtering. Rather than returning raw, unfiltered results, it categorises findings by risk level and provides actionable remediation guidance — making OSINT accessible to both professionals and everyday users.",
  },
];

export default function OsintTools() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "OSINT Tools", item: "https://footprintiq.app/osint-tools" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Best OSINT Tools for Digital Investigations (2026)",
    description: "Comprehensive guide to open source intelligence tools for cybersecurity, digital investigations, and privacy auditing. Covers username search, digital footprint analysis, and social media intelligence.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: { "@type": "ImageObject", url: "https://footprintiq.app/og-image.png" },
    },
    datePublished: "2026-03-07",
    dateModified: "2026-03-07",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/osint-tools" },
  };

  return (
    <>
      <Helmet>
        <title>OSINT Tools – Best Open Source Intelligence Tools (2026) | FootprintIQ</title>
        <meta
          name="description"
          content="The best OSINT tools for digital investigations in 2026. Discover open source intelligence tools for username search, digital footprint analysis, and social media intelligence."
        />
        <link rel="canonical" href="https://footprintiq.app/osint-tools" />
        <meta property="og:title" content="OSINT Tools – Best Open Source Intelligence Tools (2026) | FootprintIQ" />
        <meta property="og:description" content="Comprehensive guide to OSINT investigation tools for cybersecurity, privacy auditing, and digital investigations." />
        <meta property="og:url" content="https://footprintiq.app/osint-tools" />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Shield className="h-3 w-3 mr-1.5" />
              Digital Investigation Tools
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              The Best OSINT Tools for Digital Investigations
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              A comprehensive guide to open source intelligence tools used by cybersecurity
              professionals, privacy researchers, and everyday users to investigate digital
              footprints, map online exposure, and protect personal information.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl mx-auto">
              Updated for 2026. Covers username search, social media intelligence, breach analysis,
              and digital footprint scanning.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/scan">
                  Try FootprintIQ Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/best-osint-tools">Compare OSINT Tools</Link>
              </Button>
            </div>
            <div className="mt-8">
              <EthicalOsintTrustBlock />
            </div>
          </div>
        </section>

        {/* What Is OSINT */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>What Is Open Source Intelligence (OSINT)?</h2>

            <p>
              Open Source Intelligence — commonly abbreviated as OSINT — is the practice of collecting,
              analysing, and correlating information from publicly available sources. The term originates
              from military and government intelligence, but has expanded into cybersecurity, corporate
              security, journalism, and personal privacy management.
            </p>

            <p>
              The "open source" in OSINT refers to the accessibility of the data, not to open-source
              software. OSINT sources include:
            </p>

            <ul>
              <li>
                <strong>Social media platforms</strong> — public profiles, posts, comments, and metadata
                on Instagram, Twitter/X, LinkedIn, Reddit, TikTok, Facebook, and hundreds of niche
                networks.
              </li>
              <li>
                <strong>Public records and databases</strong> — government filings, court records, domain
                registration (WHOIS) data, and corporate registries.
              </li>
              <li>
                <strong>Forums and communities</strong> — discussion boards, Q&A platforms, developer
                communities, and archived web content.
              </li>
              <li>
                <strong>Breach databases</strong> — publicly indexed datasets from data breaches that
                reveal compromised email addresses, usernames, and password hashes.
              </li>
              <li>
                <strong>Data broker listings</strong> — people-search sites and data aggregation
                platforms that compile and resell personal information.
              </li>
              <li>
                <strong>Search engine results</strong> — cached pages, indexed profiles, and
                search-discoverable content across the surface web.
              </li>
            </ul>

            <p>
              <strong>OSINT tools</strong> automate the process of querying these sources systematically.
              Rather than manually visiting hundreds of websites, an OSINT investigation tool checks
              multiple data sources simultaneously — returning structured, categorised results in seconds.
            </p>
          </div>
        </section>

        {/* Why OSINT Tools Matter */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why OSINT Tools Matter For Cybersecurity</h2>

            <p>
              In modern cybersecurity, understanding your adversary's capabilities starts with
              understanding what they can see. Every piece of publicly available information about an
              individual or organisation is a potential attack vector — and OSINT tools reveal exactly
              what's exposed.
            </p>

            <h3>Attack Surface Mapping</h3>
            <p>
              Security teams use <strong>OSINT investigation tools</strong> to map their organisation's
              public attack surface. This includes employee social media profiles, exposed credentials
              in breach databases, publicly accessible infrastructure details, and corporate metadata
              leaked through documents and filings. Understanding this exposure is the first step toward
              reducing it.
            </p>

            <h3>Threat Intelligence</h3>
            <p>
              OSINT provides early warning indicators for emerging threats. Monitoring public forums,
              social media, and dark web mentions can reveal planned attacks, credential dumps, or
              brand impersonation attempts before they escalate. This proactive approach is
              significantly more effective than reactive incident response.
            </p>

            <h3>Social Engineering Defence</h3>
            <p>
              The quality of a social engineering attack is directly proportional to the quality of
              intelligence available to the attacker. By auditing what's publicly discoverable about
              key personnel — using the same <strong>digital investigation tools</strong> an attacker
              would use — organisations can identify and mitigate social engineering vectors before
              they're exploited.
            </p>

            <h3>Compliance and Due Diligence</h3>
            <p>
              Regulatory frameworks increasingly require organisations to understand their digital
              exposure. OSINT tools support compliance efforts by providing documented evidence of
              public data exposure, enabling informed decisions about privacy controls and data
              protection measures.
            </p>
          </div>
        </section>

        {/* Username Search Tools */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Username Search Tools</h2>

            <p>
              Username enumeration is one of the most widely used OSINT techniques. These tools take a
              known username and check whether it exists across hundreds of public platforms —
              revealing cross-platform presence, forgotten accounts, and identity correlation
              patterns.
            </p>

            <h3>How Username OSINT Tools Work</h3>
            <p>
              Username search tools construct predictable profile URLs for each platform (e.g.,
              <code>twitter.com/handle</code>, <code>github.com/handle</code>) and analyse the HTTP
              response to determine whether a profile exists. Advanced tools like FootprintIQ add
              confidence scoring and false-positive filtering — distinguishing genuine matches from
              coincidental ones, especially for common usernames.
            </p>

            <h3>Key Tools in This Category</h3>
            <ul>
              <li>
                <strong>Sherlock</strong> — open-source CLI tool that checks usernames across 400+
                platforms. Fast and widely used, but produces raw results without confidence scoring.
              </li>
              <li>
                <strong>Maigret</strong> — an advanced fork of Sherlock with improved detection
                accuracy, additional platforms, and metadata extraction capabilities.
              </li>
              <li>
                <strong>WhatsMyName</strong> — maintained by the OSINT community with 600+ platform
                checks. Focuses on breadth of coverage.
              </li>
              <li>
                <strong>FootprintIQ</strong> — a modern OSINT platform that aggregates results from
                multiple scanning engines, applies AI-powered false-positive filtering, and provides
                categorised results with remediation guidance. Designed for both professionals and
                non-technical users. <Link to="/usernames" className="text-primary hover:underline">Try the username search →</Link>
              </li>
            </ul>

            <p>
              The critical differentiator between these tools is not coverage — it's accuracy. A tool
              that returns 500 matches without filtering is less useful than one that returns 50
              verified, contextualised results. For a detailed comparison, see our{" "}
              <Link to="/username-search-tools" className="text-primary hover:underline">
                username search tools comparison
              </Link>.
            </p>
          </div>
        </section>

        {/* Digital Footprint Analysis */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Digital Footprint Analysis</h2>

            <p>
              Digital footprint analysis goes beyond simple username enumeration to provide a
              comprehensive view of an individual's or organisation's online presence. This category
              of <strong>open source intelligence tools</strong> combines multiple data sources into
              a unified exposure assessment.
            </p>

            <h3>What Digital Footprint Tools Analyse</h3>
            <ul>
              <li>
                <strong>Username reuse patterns</strong> — where the same handle appears across
                platforms, revealing cross-platform identity correlations.
              </li>
              <li>
                <strong>Email exposure</strong> — whether email addresses appear in breach databases,
                data broker listings, or publicly indexed pages.
              </li>
              <li>
                <strong>Data broker presence</strong> — appearances on people-search sites that
                aggregate and resell personal information.
              </li>
              <li>
                <strong>Search engine indexing</strong> — what information about you surfaces in
                Google, Bing, and other search results.
              </li>
              <li>
                <strong>Domain and WHOIS data</strong> — publicly registered domain ownership
                information that may expose personal details.
              </li>
            </ul>

            <p>
              FootprintIQ's{" "}
              <Link to="/digital-footprint-checker" className="text-primary hover:underline">
                digital footprint checker
              </Link>{" "}
              combines these analysis vectors into a single scan, providing categorised results with
              prioritised remediation steps. Rather than using five separate tools, investigators can
              run a comprehensive assessment from one interface.
            </p>

            <p>
              For organisations, digital footprint analysis supports security auditing, employee
              exposure assessments, and pre-incident threat surface mapping. For individuals, it
              provides the visibility needed to make informed decisions about online privacy.
            </p>
          </div>
        </section>

        {/* Social Media Intelligence Tools */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Social Media Intelligence Tools</h2>

            <p>
              Social media intelligence (SOCMINT) is a subset of OSINT focused specifically on
              information gathered from social media platforms. These <strong>digital investigation
              tools</strong> analyse public posts, profiles, connections, and metadata to extract
              actionable intelligence.
            </p>

            <h3>Platform-Specific Analysis</h3>
            <p>
              Each social media platform exposes different types of data. Effective SOCMINT tools
              understand these differences:
            </p>

            <ul>
              <li>
                <strong>Instagram</strong> — public profiles, follower/following counts, tagged
                locations in posts, linked accounts. FootprintIQ offers a dedicated{" "}
                <Link to="/instagram-username-search" className="text-primary hover:underline">
                  Instagram username search
                </Link>.
              </li>
              <li>
                <strong>Twitter/X</strong> — public tweets, reply networks, follower graphs, and
                bio metadata. Historical tweet analysis can reveal behavioural patterns and
                geographic indicators.
              </li>
              <li>
                <strong>LinkedIn</strong> — professional history, educational background, skills,
                and corporate affiliations. Often the richest source of professional intelligence.
              </li>
              <li>
                <strong>Reddit</strong> — post and comment history revealing interests, expertise
                areas, and pseudonymous activity patterns.
              </li>
              <li>
                <strong>TikTok</strong> — username presence, public video metadata, and
                cross-platform handle reuse. See our{" "}
                <Link to="/tiktok-username-search" className="text-primary hover:underline">
                  TikTok username search
                </Link>.
              </li>
            </ul>

            <h3>Cross-Platform Correlation</h3>
            <p>
              The real power of social media intelligence emerges when findings are correlated across
              platforms. A username that appears on both Instagram and a niche forum, with matching
              profile photos and bio details, provides high-confidence identity correlation. This
              cross-referencing — automated by tools like FootprintIQ — transforms individual data
              points into comprehensive intelligence assessments.
            </p>
          </div>
        </section>

        {/* How Investigators Use OSINT */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Investigators Use OSINT</h2>

            <p>
              Professional investigators — whether in cybersecurity, corporate security, journalism,
              or law enforcement — follow structured methodologies when using{" "}
              <strong>OSINT investigation tools</strong>. Understanding these workflows helps
              contextualise how the tools are designed and why certain features matter.
            </p>

            <h3>The OSINT Investigation Cycle</h3>
            <ol>
              <li>
                <strong>Requirements definition.</strong> What questions need answering? What identifiers
                are known (usernames, emails, phone numbers, real names)? What are the legal and ethical
                boundaries?
              </li>
              <li>
                <strong>Collection.</strong> Systematically querying data sources using OSINT tools.
                This phase prioritises breadth — casting a wide net across platforms to identify all
                potentially relevant data points.
              </li>
              <li>
                <strong>Processing.</strong> Raw results are filtered, deduplicated, and normalised.
                False positives are identified and removed. Data is structured for analysis.
              </li>
              <li>
                <strong>Analysis.</strong> Processed data is examined for patterns, correlations, and
                anomalies. This is where individual findings are synthesised into coherent intelligence.
              </li>
              <li>
                <strong>Dissemination.</strong> Findings are documented and communicated to
                stakeholders — whether that's a security team, a client, or yourself reviewing your
                own digital footprint.
              </li>
              <li>
                <strong>Feedback.</strong> Results inform the next iteration. New identifiers discovered
                during analysis become inputs for additional collection cycles.
              </li>
            </ol>

            <p>
              Modern OSINT platforms like FootprintIQ compress the collection, processing, and initial
              analysis phases into a single automated workflow — reducing what traditionally took hours
              of manual work into a scan that completes in seconds. The investigator's expertise is
              then focused on the analysis and dissemination phases, where human judgement is most
              valuable.
            </p>
          </div>
        </section>

        {/* Ethical Considerations */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Ethical Considerations</h2>

            <p>
              The power of OSINT tools carries significant ethical responsibilities. Access to
              information does not automatically justify its use. Responsible OSINT practice requires
              clear boundaries and principled decision-making.
            </p>

            <h3>Core Ethical Principles</h3>
            <ul>
              <li>
                <strong>Public data only.</strong> Ethical OSINT tools access information that is already
                publicly available — the same data anyone can find through search engines and public
                websites. No authentication bypass, no private account access, no exploitation of
                vulnerabilities.
              </li>
              <li>
                <strong>Proportionality.</strong> The scope of an investigation should be proportional
                to its legitimate purpose. Self-auditing your own digital footprint requires different
                boundaries than a corporate security assessment.
              </li>
              <li>
                <strong>Data minimisation.</strong> Collect only what's necessary. Responsible tools
                don't store query data, don't build surveillance profiles, and don't retain results
                beyond what the user explicitly saves.
              </li>
              <li>
                <strong>Transparency.</strong> Users should understand exactly what an OSINT tool does
                and doesn't do. Claims about capabilities should be accurate and limitations should
                be clearly communicated.
              </li>
              <li>
                <strong>No harassment or doxxing.</strong> OSINT tools are designed for security
                research, self-assessment, and authorised investigations — never for harassment,
                stalking, or publishing private information about individuals.
              </li>
            </ul>

            <p>
              FootprintIQ is built around these principles. We publish our{" "}
              <Link to="/ethical-osint" className="text-primary hover:underline">
                Ethical OSINT Charter
              </Link>{" "}
              and{" "}
              <Link to="/trust-safety" className="text-primary hover:underline">
                Trust & Safety commitment
              </Link>{" "}
              publicly, and design our tools to make ethical use the default — not an afterthought.
              For a deeper exploration of responsible practices, see our{" "}
              <Link to="/resources/responsible-osint" className="text-primary hover:underline">
                Responsible OSINT Framework
              </Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Try FootprintIQ — Modern OSINT for Everyone</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Scan usernames, emails, and digital footprints across 500+ public platforms. Free,
              instant results with confidence scoring and remediation guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/scan">
                  Run a Free Scan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/best-osint-tools">Compare OSINT Tools</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card border border-border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-foreground font-medium text-left py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Related Resources</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild variant="ghost" size="sm"><Link to="/usernames">Username Search</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/reverse-username-search">Reverse Username Search</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/digital-footprint-checker">Digital Footprint Checker</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/email-breach-check">Email Breach Check</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/username-search-tools">Username Search Tools</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/ethical-osint">Ethical OSINT</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/what-is-osint">What Is OSINT?</Link></Button>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="py-12 bg-muted/10">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
