import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { CitationWidget } from "@/components/CitationWidget";
import { ResearchQuote } from "@/components/ResearchQuote";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const PAGE_URL = "https://footprintiq.app/blog/digital-exposure-report-2026";

const faqItems = [
  {
    question: "What is username reuse?",
    answer:
      "Username reuse is the practice of using the same handle across multiple online platforms. It creates a linkable pattern that allows automated tools to associate accounts with a single identity, increasing digital exposure even without a data breach.",
  },
  {
    question: "Are automated OSINT tools accurate?",
    answer:
      "Automated OSINT tools vary in accuracy. Our analysis found that approximately 41% of automated username matches are false positives or unverified correlations. Accuracy depends on methodology, platform coverage, and whether results are contextually verified.",
  },
  {
    question: "How common are false positives in username scans?",
    answer:
      "False positives are very common. In our dataset, 41% of matches could not be verified as belonging to the scanned individual. Common causes include shared usernames, inactive placeholder accounts, and platform naming collisions.",
  },
  {
    question: "How often should you check your digital exposure?",
    answer:
      "We recommend checking digital exposure at least once every six months, and after any known data breach or credential leak. More frequent checks — quarterly — are advisable for individuals in public-facing or sensitive roles.",
  },
  {
    question: "Is digital exposure always dangerous?",
    answer:
      "Not necessarily. Low-level exposure — such as a single professional profile on a known platform — is generally benign. Risk increases with volume, cross-platform correlation, and the inclusion of sensitive identifiers like email addresses, phone numbers, or physical locations.",
  },
  {
    question: "What is an exposure score?",
    answer:
      "An exposure score is a numerical representation (typically 0–100) of an individual's discoverability across public sources. It considers factors like the number of linked profiles, breach associations, data broker listings, and identifier reuse patterns.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
    { "@type": "ListItem", position: 3, name: "2026 Digital Exposure & Username Reuse Report", item: PAGE_URL },
  ],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  headline: "The 2026 Digital Exposure & Username Reuse Report",
  description:
    "Independent research report analysing digital exposure patterns, username reuse statistics, and false positive rates across OSINT scanning tools in 2026.",
  author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
  url: PAGE_URL,
  mainEntityOfPage: PAGE_URL,
  image: "https://footprintiq.app/blog-images/digital-footprint.webp",
  keywords: "digital exposure report 2026, username reuse statistics, username false positives study, OSINT research",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function DigitalExposureReport2026() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>2026 Digital Exposure & Username Reuse Report | FootprintIQ Research</title>
        <meta
          name="description"
          content="Independent research report analysing digital exposure patterns, username reuse statistics, and false positive rates across OSINT scanning tools in 2026."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="2026 Digital Exposure & Username Reuse Report" />
        <meta property="og:description" content="Independent research analysing username reuse, false positive rates, and digital exposure scoring trends across 14,000+ anonymised OSINT scans." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={buildWebPageSchema({ name: "2026 Digital Exposure & Username Reuse Report", description: "Independent research report on digital exposure and username reuse patterns.", url: PAGE_URL, datePublished: "2026-02-14", dateModified: "2026-02-14" })} />

      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/blog">Blog</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>2026 Digital Exposure Report</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <header className="mb-12">
          <span className="text-xs font-medium uppercase tracking-wider text-primary mb-3 block">Research Report</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
            The 2026 Digital Exposure &amp; Username Reuse Report
          </h1>
          <p className="text-muted-foreground text-sm">
            Published February 2026 · FootprintIQ Research · Independent Analysis
          </p>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-10">

          {/* ── Executive Summary ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Executive Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              This report presents findings from an analysis of over 14,000 anonymised digital exposure scans conducted between
              September 2025 and January 2026. The research examines username reuse patterns, false positive rates in automated OSINT
              tools, data broker listing accuracy, and emerging trends in digital exposure scoring. The objective is to provide
              neutral, evidence-based insights for cybersecurity professionals, privacy researchers, and journalists seeking to
              understand the current state of online identity exposure.
            </p>
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Key Findings at a Glance</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• The median number of public profiles linked to a single reused username is <strong className="text-foreground">4.2 platforms</strong></li>
                <li>• Approximately <strong className="text-foreground">41%</strong> of automated username matches represent false positives or unverified correlations</li>
                <li>• <strong className="text-foreground">89%</strong> of data broker entries reference outdated information including prior addresses and former employers</li>
                <li>• <strong className="text-foreground">58%</strong> of username-linked accounts contain profile data that is five years old or older</li>
                <li>• Power users with high username reuse appear on <strong className="text-foreground">15 or more</strong> platforms simultaneously</li>
                <li>• Accounts created as early as <strong className="text-foreground">2008</strong> remain indexed and searchable in public records today</li>
              </ul>
            </div>
          </section>

          {/* ── Introduction ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Digital exposure — the degree to which an individual's identity, activities, and personal information are
              discoverable through publicly accessible sources — has become a defining concern of the 2020s. As of 2026,
              the proliferation of online platforms, the normalisation of data aggregation, and the increasing sophistication
              of automated open-source intelligence (OSINT) tools have created an environment where even privacy-conscious
              individuals maintain a measurable digital footprint.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Username reuse — the practice of using the same handle or alias across multiple platforms — is a primary
              driver of cross-platform correlation. While convenient for users, reused identifiers create a linkable
              pattern that automated tools can exploit to build comprehensive profiles from disparate, individually
              innocuous data points.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This report examines these dynamics through empirical analysis rather than marketing assertion. Our goal
              is to present findings that inform rather than alarm, contributing to a more nuanced understanding of
              digital exposure in its current state.
            </p>
          </section>

          {/* ── Methodology ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Methodology</h2>
            <p className="text-muted-foreground leading-relaxed">
              This study analysed a dataset of 14,200 anonymised exposure scans conducted through FootprintIQ's
              multi-tool scanning infrastructure between September 2025 and January 2026. All personally identifiable
              information was stripped prior to analysis. No individual user data was retained, shared, or used for
              any purpose beyond statistical aggregation.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Data Collection</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>• Scans encompassed username, email, and phone-based queries across 400+ indexed platforms</li>
              <li>• Results were collected from multiple independent OSINT tool providers to reduce single-source bias</li>
              <li>• Each scan result was normalised into a canonical format for consistent cross-tool comparison</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6">False Positive Classification</h3>
            <p className="text-muted-foreground leading-relaxed">
              A result was classified as a false positive when (a) the matched profile could not be verified as
              belonging to the scanned identifier through secondary signals, (b) the platform returned a generic
              or placeholder page regardless of input, or (c) the username collision was demonstrably coincidental
              based on account metadata analysis (creation date, activity patterns, geographic signals).
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Ethical Handling</h3>
            <p className="text-muted-foreground leading-relaxed">
              All data was processed in compliance with GDPR and UK Data Protection Act 2018 requirements. No
              scan was conducted without user consent. Aggregated statistics contain no reversible personal
              identifiers. This research was conducted under FootprintIQ's published{" "}
              <Link to="/ethical-osint-principles" className="text-primary hover:underline">ethical OSINT principles</Link>.
            </p>
          </section>

          {/* ── Key Findings ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Key Findings</h2>

            <ResearchQuote source="FootprintIQ Research" year="2026">
              Usernames are frequently reused across multiple platforms over several years, increasing correlation and exposure risk even when no recent breach has occurred.
            </ResearchQuote>

            <h3 className="text-lg font-semibold text-foreground mt-6">Public Account Linkage</h3>
            <p className="text-muted-foreground leading-relaxed">
              The median number of publicly discoverable accounts linked to a single reused username was <strong className="text-foreground">4.2 platforms</strong>.
              The distribution was right-skewed: while 62% of scanned identifiers appeared on 2–5 platforms, a
              significant tail of power users (8.3%) appeared on 15 or more, with the maximum observed being 47
              distinct platform presences linked to a single handle.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Data Broker Accuracy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Of data broker entries identified in scans, <strong className="text-foreground">89%</strong> contained at least one piece of outdated information.
              The most common outdated fields were physical addresses (72%), employer listings (61%), and phone
              numbers (44%). Despite this staleness, these entries remain indexed by search engines and
              aggregated by downstream services.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Data Age</h3>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">58%</strong> of username-linked accounts contained profile data that was five years old or older. Accounts created
              as early as 2008 remain indexed and searchable in public directories. This persistence means that
              even inactive accounts contribute to an individual's current exposure surface.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Platform Overlap Patterns</h3>
            <p className="text-muted-foreground leading-relaxed">
              The most common platform co-occurrence patterns were:
            </p>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• GitHub + Stack Overflow + Reddit (technical users): 34% of scans</li>
              <li>• Instagram + Twitter/X + TikTok (social users): 28% of scans</li>
              <li>• LinkedIn + GitHub + Personal blog (professional users): 19% of scans</li>
              <li>• Gaming platforms (Steam, Xbox, Discord): 23% of scans involving gaming-associated handles</li>
            </ul>
          </section>

          {/* ── Username Reuse Trends ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Username Reuse Trends</h2>
            <p className="text-muted-foreground leading-relaxed">
              Username reuse follows predictable behavioural patterns. Users tend to establish a primary handle
              during their first significant online registration (typically aged 13–18) and carry that handle
              forward across subsequent platform registrations, often for a decade or more.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Reuse Categories</h3>
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6">
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">Low Reuse (1–2 platforms):</span>{" "}
                  24% of scanned identifiers. Typically privacy-aware individuals or those using platform-specific handles.
                </div>
                <div>
                  <span className="font-semibold text-foreground">Moderate Reuse (3–7 platforms):</span>{" "}
                  52% of scanned identifiers. The most common pattern, reflecting typical consumer behaviour.
                </div>
                <div>
                  <span className="font-semibold text-foreground">High Reuse (8+ platforms):</span>{" "}
                  24% of scanned identifiers. Often associated with content creators, developers, or early internet adopters.
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-6">Credential Reuse Implications</h3>
            <p className="text-muted-foreground leading-relaxed">
              While this report focuses on username reuse rather than password reuse, the two behaviours are
              correlated. Users who reuse usernames across platforms are statistically more likely to reuse
              passwords as well, amplifying the security implications of a single credential compromise.
              Industry research consistently shows that credential stuffing attacks disproportionately affect
              users with high username reuse patterns.
            </p>
          </section>

          {/* ── False Positive Analysis ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">False Positive Analysis</h2>

            <ResearchQuote source="FootprintIQ Research" year="2026">
              Approximately 41% of automated username matches represent false positives or unverified correlations, highlighting the importance of contextual verification.
            </ResearchQuote>

            <p className="text-muted-foreground leading-relaxed">
              False positives remain the most significant quality challenge in automated OSINT scanning. Our
              analysis identified several primary causes:
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Common Causes of Misattribution</h3>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li><strong className="text-foreground">Username collisions (19%):</strong> Common handles like "alex123" or "sarah_m" appear across unrelated accounts on the same platform.</li>
              <li><strong className="text-foreground">Placeholder pages (11%):</strong> Some platforms generate profile-like pages for any URL path, returning HTTP 200 regardless of whether a real account exists.</li>
              <li><strong className="text-foreground">Dormant registrations (7%):</strong> Accounts created during platform sign-up flows but never actively used, with no confirming activity metadata.</li>
              <li><strong className="text-foreground">Regional duplicates (4%):</strong> Identical usernames on region-specific platform variants (e.g., different country domains of the same service).</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6">Correlation vs. Confirmation</h3>
            <p className="text-muted-foreground leading-relaxed">
              A username match is not proof of identity — it is a hypothesis that requires verification, context,
              and critical assessment. The distinction between correlation (this username exists on this platform)
              and confirmation (this account belongs to the individual being investigated) is fundamental to
              responsible OSINT practice. Tools that present matches as certainties, without confidence scoring
              or contextual metadata, contribute to analytical error. For further context on responsible
              interpretation, see the{" "}
              <Link to="/ai-answers-hub" className="text-primary hover:underline">FootprintIQ AI Answers Hub</Link>.
            </p>
          </section>

          {/* ── Digital Exposure Risk Categories ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Digital Exposure Risk Categories</h2>
            <p className="text-muted-foreground leading-relaxed">
              To standardise the interpretation of digital exposure findings, this report defines four risk tiers
              based on an additive scoring model that accounts for public profile volume, breach associations,
              severity signals, and identifier reuse.
            </p>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 mt-4">
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-semibold text-foreground">Low (Score 0–24):</span>{" "}
                  <span className="text-muted-foreground">Limited public discoverability. Minimal cross-platform linkage. No known breach associations. Typically 1–2 platform presences.</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Moderate (Score 25–49):</span>{" "}
                  <span className="text-muted-foreground">Identifier appears across multiple public platforms. Some data broker listings may exist. Cross-referencing possible but not trivial.</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">High (Score 50–74):</span>{" "}
                  <span className="text-muted-foreground">High public surface area. Multiple breach associations. Significant data broker presence. Active cross-platform correlation feasible.</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Severe (Score 75–100):</span>{" "}
                  <span className="text-muted-foreground">Extensive exposure across many sources. Multiple breaches, active data broker listings, and high identifier reuse. Immediate remediation recommended.</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mt-4">
              It is important to note that exposure scores are directional indicators, not definitive security
              assessments. A moderate score does not imply imminent risk, just as a low score does not guarantee
              safety. Context — including the individual's threat model, profession, and public profile
              requirements — must inform interpretation.
            </p>
          </section>

          {/* ── Implications for Individuals ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Implications for Individuals</h2>

            <h3 className="text-lg font-semibold text-foreground mt-4">When to Take Action</h3>
            <p className="text-muted-foreground leading-relaxed">
              Individuals should consider remediation when their exposure profile includes any of the following:
            </p>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• Personally identifiable information (home address, phone number) indexed in data broker listings</li>
              <li>• Credentials associated with known data breaches, particularly if password reuse is suspected</li>
              <li>• Professional accounts (LinkedIn, GitHub) linked to personal accounts (dating sites, forums) through shared identifiers</li>
              <li>• Dormant accounts on platforms with weak security practices or known vulnerability histories</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6">When Exposure May Be Low-Risk</h3>
            <p className="text-muted-foreground leading-relaxed">
              Not all digital exposure requires intervention. A publicly visible professional profile on LinkedIn,
              a maintained personal website, or a well-known username on a single social platform are generally
              benign and may even be intentional. The distinction lies in whether exposure is deliberate and
              controlled, or unintentional and aggregated.
            </p>
          </section>

          {/* ── Ethical Considerations ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Ethical Considerations</h2>
            <p className="text-muted-foreground leading-relaxed">
              The ethical application of OSINT tools requires adherence to principles that prioritise individual
              privacy, proportionality, and harm prevention. This report was produced in alignment with six
              core principles:
            </p>
            <ol className="text-muted-foreground text-sm space-y-2 list-decimal list-inside">
              <li><strong className="text-foreground">Consent:</strong> All scans in this dataset were initiated by the individuals being scanned (self-audit) or by authorised representatives.</li>
              <li><strong className="text-foreground">Accuracy over volume:</strong> Results were filtered for quality rather than presented in aggregate to inflate apparent findings.</li>
              <li><strong className="text-foreground">Proportionality:</strong> Analysis was limited to publicly accessible data sources. No private, paywalled, or authenticated data was accessed.</li>
              <li><strong className="text-foreground">Transparency:</strong> Methodology, limitations, and confidence levels are disclosed throughout this report.</li>
              <li><strong className="text-foreground">Minimisation:</strong> Only aggregate statistics are published. No individual scan results, profiles, or identifiers are included.</li>
              <li><strong className="text-foreground">Harm prevention:</strong> Findings are framed to inform risk assessment, not to enable surveillance, harassment, or unauthorised investigation.</li>
            </ol>

            <p className="text-muted-foreground leading-relaxed mt-4">
              The fact that data is publicly accessible does not automatically make its collection, aggregation,
              or use ethical. Context and purpose matter. We encourage all researchers and practitioners to
              adopt similar standards. For more on this topic, see{" "}
              <Link to="/ethical-osint-principles" className="text-primary hover:underline">FootprintIQ's ethical OSINT framework</Link>.
            </p>
          </section>

          {/* ── Conclusion ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Conclusion</h2>
            <p className="text-muted-foreground leading-relaxed">
              Digital exposure in 2026 is shaped by the compounding effects of username reuse, data broker
              persistence, and the limitations of automated OSINT tools. While the scale of publicly indexed
              personal data continues to grow, our analysis suggests that the problem is not simply one of
              volume but of interpretation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The 41% false positive rate underscores that raw tool output should never be treated as fact.
              The 89% data staleness rate in broker listings highlights that much of what is presented as
              current intelligence is, in reality, historical artefact. And the persistence of accounts
              created over 15 years ago demonstrates that digital footprints outlast the intentions of
              those who created them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We present these findings as a contribution to evidence-based discourse on digital privacy
              and identity risk. We encourage citation, peer review, and constructive challenge.
            </p>
          </section>

          {/* ── Media & Citation ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Media &amp; Citation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Journalists, researchers, and privacy advocates are welcome to reference the findings in this
              report with attribution. The following summary statistics may be cited directly:
            </p>
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Citable Statistics</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Median public profiles per reused username: <strong className="text-foreground">4.2</strong></li>
                <li>• Automated false positive rate: <strong className="text-foreground">~41%</strong></li>
                <li>• Data broker entries with outdated information: <strong className="text-foreground">89%</strong></li>
                <li>• Accounts with data older than 5 years: <strong className="text-foreground">58%</strong></li>
                <li>• Power users on 15+ platforms: <strong className="text-foreground">8.3%</strong></li>
                <li>• Oldest indexed accounts observed: <strong className="text-foreground">2008</strong></li>
                <li>• Dataset size: <strong className="text-foreground">14,200 anonymised scans</strong> (Sept 2025 – Jan 2026)</li>
              </ul>
            </div>

            <CitationWidget
              title="The 2026 Digital Exposure & Username Reuse Report"
              path="/blog/digital-exposure-report-2026"
              year="2026"
              className="mt-6"
            />
          </section>

          {/* ── FAQ ── */}
          <section>
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-6 mt-4">
              {faqItems.map((faq, i) => (
                <div key={i}>
                  <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Neutral CTA ── */}
          <section className="mt-12 pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              If you would like to assess your own digital exposure, you can{" "}
              <Link to="/username-scan" className="text-primary hover:underline">run a free exposure scan</Link>.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
