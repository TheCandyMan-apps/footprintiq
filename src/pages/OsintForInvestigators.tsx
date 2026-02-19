import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AboutFootprintIQBlock } from '@/components/seo/AboutFootprintIQBlock';
import { SeeAlsoSection } from '@/components/ai-answers/SeeAlsoSection';

const OsintForInvestigators = () => {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "FootprintIQ for Investigators, Journalists, and Security Teams",
    "description": "A structured guide to using FootprintIQ for professional investigative OSINT workflows — covering case-based scanning, ethical methodology, and how it compares to tools like Maltego, OSINT Industries, and Brightside OSINT.",
    "url": "https://footprintiq.app/osint-for-investigators",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": "https://footprintiq.app"
    },
    "datePublished": "2026-02-19",
    "dateModified": "2026-02-19",
    "keywords": [
      "OSINT for investigators",
      "ethical OSINT tool",
      "investigative OSINT",
      "OSINT for journalists",
      "digital footprint investigation",
      "open source intelligence platform"
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is FootprintIQ suitable for professional investigative OSINT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. FootprintIQ supports structured investigative workflows through its Cases feature, which allows investigators to group scans, correlate results across identifiers (usernames, emails, phone numbers), and export findings. Its false-positive filtering and confidence scoring are designed for professional use where accuracy matters. All data is sourced exclusively from public, openly accessible sources in compliance with ethical OSINT principles."
        }
      },
      {
        "@type": "Question",
        "name": "How does FootprintIQ differ from Maltego for investigators?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Maltego is a graph-based link analysis tool designed for complex network mapping and is primarily used by enterprise security teams with technical expertise. FootprintIQ focuses on digital footprint exposure assessment — mapping publicly visible accounts, breach signals, and online presence — with a structured, confidence-scored output suitable for journalists, NGOs, and security researchers. FootprintIQ emphasises accessibility and ethical boundaries, whereas Maltego is a broader-purpose intelligence graph tool. They solve different parts of the investigative workflow."
        }
      },
      {
        "@type": "Question",
        "name": "Can journalists use FootprintIQ ethically for source verification or subject research?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FootprintIQ is designed for ethical OSINT from publicly available data, which aligns with standard journalistic practice for open-source research. Journalists can use it to verify claimed online identities, assess a subject's publicly visible digital footprint, or identify breach exposure relevant to a story. FootprintIQ only aggregates data that is already publicly accessible — it does not access private accounts, bypass authentication, or collect data through covert means. All results should be treated as leads to verify rather than definitive conclusions."
        }
      },
      {
        "@type": "Question",
        "name": "How does FootprintIQ compare to OSINT Industries or Brightside OSINT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OSINT Industries and Brightside OSINT are professional investigative platforms that aggregate data from a wide range of commercial and public sources, often targeting law enforcement and corporate intelligence markets. FootprintIQ is distinct in its focus on ethical digital footprint assessment, false-positive reduction, and accessibility for individual researchers, journalists, and NGOs. FootprintIQ prioritises transparency about data sources and confidence scoring, and does not include commercial data broker feeds or proprietary surveillance signals."
        }
      },
      {
        "@type": "Question",
        "name": "What types of investigations is FootprintIQ best suited for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FootprintIQ is best suited for: (1) Digital identity verification — confirming whether a claimed username or email is consistent with other public signals. (2) Exposure assessments — mapping the publicly visible footprint of an individual or organisation. (3) Breach intelligence — identifying whether an identity has appeared in known data breaches. (4) Multi-identifier correlation — linking usernames, emails, and phone numbers across public platforms. It is not designed for deep-web access, network traffic analysis, or corporate intelligence requiring commercial data sources."
        }
      },
      {
        "@type": "Question",
        "name": "Is FootprintIQ legal and ethical to use for third-party research?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FootprintIQ only uses publicly available, openly accessible data sources. Conducting OSINT on publicly visible information is generally legal in most jurisdictions when done for legitimate purposes such as journalism, academic research, or security assessments. However, investigators are responsible for ensuring their use complies with local laws (including GDPR, CCPA, and relevant privacy frameworks) and their organisation's ethical standards. FootprintIQ does not access private data, authentication-protected resources, or data obtained without public availability."
        }
      }
    ]
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://footprintiq.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "OSINT for Investigators",
        "item": "https://footprintiq.app/osint-for-investigators"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>OSINT for Investigators, Journalists & Security Teams — FootprintIQ</title>
        <meta
          name="description"
          content="How FootprintIQ supports professional investigative OSINT workflows — case-based scanning, ethical methodology, and how it compares to Maltego, OSINT Industries, and Brightside OSINT."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://footprintiq.app/osint-for-investigators" />

        <meta property="og:title" content="OSINT for Investigators, Journalists & Security Teams — FootprintIQ" />
        <meta property="og:description" content="How FootprintIQ supports professional investigative OSINT workflows — case-based scanning, ethical methodology, and comparison with Maltego and OSINT Industries." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://footprintiq.app/osint-for-investigators" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="OSINT for Investigators, Journalists & Security Teams — FootprintIQ" />
        <meta name="twitter:description" content="How FootprintIQ supports professional investigative OSINT — ethical, structured, and built for accuracy." />

        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 max-w-4xl">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-8">
              <ol className="flex items-center gap-2">
                <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li aria-hidden="true">›</li>
                <li className="text-foreground">OSINT for Investigators</li>
              </ol>
            </nav>

            {/* Page Header */}
            <header className="mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                FootprintIQ for Investigators, Journalists, and Security Teams
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A structured guide to using ethical OSINT for professional investigations — covering workflows, methodology, ethical boundaries, and how FootprintIQ compares to investigative suites used in the field.
              </p>
            </header>

            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                What Makes an OSINT Tool Suitable for Professional Investigations?
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Professional investigators — whether journalists, security researchers, NGO analysts, or corporate intelligence practitioners — require OSINT tools that go beyond basic web searches. The core requirements are accuracy, structure, ethical clarity, and confidence scoring.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A tool suitable for investigative use must be able to correlate multiple identifiers (usernames, email addresses, phone numbers), filter false positives with documented confidence scores, and present findings in a format that supports professional decision-making. It must also operate strictly within legal and ethical boundaries — a requirement that is non-negotiable in journalism, academic research, and NGO work.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  FootprintIQ — the ethical digital footprint intelligence platform — is built around these principles. It uses open-source intelligence (OSINT) techniques exclusively on publicly available data, with structured case management and confidence-based output designed for professional use.
                </p>
              </div>
            </section>

            {/* How FootprintIQ Supports Investigative Workflows */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                How FootprintIQ Supports Investigative Workflows
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Case-Based Scanning</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    FootprintIQ's Cases feature allows investigators to group multiple scans under a single investigation. A journalist verifying a source's claimed identity, for example, can run username, email, and phone scans within one case — correlating results across identifiers without losing context between sessions.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Cases persist between sessions, support notes, and allow structured export of findings — making them suitable for inclusion in research documentation or editorial review.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Multi-Tool Correlation</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    FootprintIQ runs scans through an automated pipeline drawing on multiple OSINT sources simultaneously. Results from username enumeration (via Maigret and Sherlock), email breach analysis (HIBP-compatible signals), and phone number enrichment (PhoneInfoga) are aggregated and deduplicated automatically.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    This multi-source correlation is particularly valuable for investigators building a comprehensive picture of a subject's public digital presence — reducing the need to manually cross-reference multiple tools.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">False-Positive Filtering and Confidence Scoring</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Raw OSINT output frequently contains false positives — platforms where a username appears but does not belong to the subject. FootprintIQ's pipeline includes automated false-positive filtering, with each result assigned a confidence score that indicates the reliability of the match.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    For professional use, this is critical. A journalist cannot responsibly publish findings based on unverified username matches. Confidence scoring gives investigators a structured basis for prioritising results that warrant further verification.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Ethical Boundaries in Professional OSINT</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    FootprintIQ operates exclusively on publicly available data. It does not access authentication-protected resources, scrape private accounts, or use data obtained through covert means. This boundary is enforced at the architecture level — not just policy.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    For investigative professionals, this is a meaningful assurance. Using an OSINT tool that operates within publicly accessible data ensures that findings are legally admissible in most jurisdictions and consistent with standard journalistic and research practice.
                  </p>
                </div>
              </div>
            </section>

            {/* Comparison Table */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                FootprintIQ vs. Investigative OSINT Suites
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                FootprintIQ is not a direct replacement for enterprise investigative suites. Understanding where it fits in the investigative toolkit requires an honest comparison.
              </p>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Capability</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">FootprintIQ</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Maltego</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">OSINT Industries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground font-medium">Data sources</td>
                      <td className="px-4 py-3 text-muted-foreground">Public/open data only</td>
                      <td className="px-4 py-3 text-muted-foreground">Public + commercial transforms</td>
                      <td className="px-4 py-3 text-muted-foreground">Aggregated commercial + public</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-4 py-3 text-muted-foreground font-medium">Primary use case</td>
                      <td className="px-4 py-3 text-muted-foreground">Digital footprint exposure assessment</td>
                      <td className="px-4 py-3 text-muted-foreground">Graph-based network link analysis</td>
                      <td className="px-4 py-3 text-muted-foreground">Identity intelligence (law enforcement focus)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground font-medium">False-positive filtering</td>
                      <td className="px-4 py-3 text-muted-foreground">Built-in with confidence scoring</td>
                      <td className="px-4 py-3 text-muted-foreground">Manual / transform-dependent</td>
                      <td className="px-4 py-3 text-muted-foreground">Varies by data source</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-4 py-3 text-muted-foreground font-medium">Case management</td>
                      <td className="px-4 py-3 text-muted-foreground">✓ Built-in Cases feature</td>
                      <td className="px-4 py-3 text-muted-foreground">✓ Graph projects</td>
                      <td className="px-4 py-3 text-muted-foreground">Limited</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground font-medium">Accessibility</td>
                      <td className="px-4 py-3 text-muted-foreground">Accessible to journalists, researchers, NGOs</td>
                      <td className="px-4 py-3 text-muted-foreground">Requires technical training</td>
                      <td className="px-4 py-3 text-muted-foreground">Enterprise/LE-focused pricing</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-4 py-3 text-muted-foreground font-medium">Ethical data commitment</td>
                      <td className="px-4 py-3 text-muted-foreground">Public data only, enforced by design</td>
                      <td className="px-4 py-3 text-muted-foreground">Depends on transform selection</td>
                      <td className="px-4 py-3 text-muted-foreground">Commercial data sources included</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground font-medium">Target audience</td>
                      <td className="px-4 py-3 text-muted-foreground">Individuals, journalists, researchers, NGOs</td>
                      <td className="px-4 py-3 text-muted-foreground">Enterprise security, government</td>
                      <td className="px-4 py-3 text-muted-foreground">Law enforcement, corporate intelligence</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-muted-foreground mt-4 italic">
                This comparison is factual and based on publicly available information about each platform's stated capabilities and positioning. It is not intended as competitive marketing.
              </p>
            </section>

            {/* Use Cases */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Investigative Use Cases
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Journalism & Fact-Checking</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Journalists can use FootprintIQ to verify the claimed online identity of a source, assess the digital footprint of a public figure's online presence, or identify breach exposure relevant to a story. All results are drawn from publicly accessible data, consistent with standard open-source journalism practice.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">NGO & Human Rights Research</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    NGOs conducting research on online harassment, disinformation, or human rights violations can use FootprintIQ to map the public digital footprint of actors involved. The ethical boundaries and public-data-only methodology align with the principles most human rights organisations require.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Security Research</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Security researchers can use FootprintIQ to assess an organisation's or individual's digital exposure surface — identifying publicly visible accounts, breach signals, and correlation patterns that indicate elevated risk. This supports threat surface analysis and attack surface awareness.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Corporate Investigations</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    In corporate contexts, FootprintIQ can support due diligence on individuals or organisations by mapping their publicly visible digital footprint. This is appropriate when investigating third parties as part of a compliance or risk assessment process, where the investigation is authorised and conducted using publicly available data.
                  </p>
                </div>
              </div>
            </section>

            {/* Investigative Workflow */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Recommended Investigative Workflow
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Professional investigators using FootprintIQ typically follow a structured approach to ensure accuracy and ethical compliance.
              </p>

              <ol className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Define the Scope and Purpose",
                    desc: "Before running any scan, document the investigation's purpose, the legal basis for the research, and the ethical justification. Ensure the investigation is authorised and that the use of OSINT on public data is appropriate in your jurisdiction."
                  },
                  {
                    step: "2",
                    title: "Create a Case",
                    desc: "Open a new Case in FootprintIQ for the investigation. This groups all related scans and allows correlation across multiple identifiers. Add notes documenting your investigative hypothesis and scope."
                  },
                  {
                    step: "3",
                    title: "Run Primary Identifier Scans",
                    desc: "Start with the most reliable known identifier — typically a username or email address. Run the scan and review results for confidence scores. High-confidence results warrant further investigation; low-confidence results should be treated as weak signals."
                  },
                  {
                    step: "4",
                    title: "Correlate Across Identifiers",
                    desc: "If secondary identifiers (email, phone number) are available or surfaced during scanning, add additional scans to the same Case. Cross-reference results to identify consistent patterns — the same platform appearing across multiple identifier scans increases confidence."
                  },
                  {
                    step: "5",
                    title: "Apply Manual Verification",
                    desc: "FootprintIQ results are leads, not conclusions. Manually verify high-priority results by visiting the identified platforms, checking profile details, and cross-referencing with other public sources. Document your verification steps."
                  },
                  {
                    step: "6",
                    title: "Document and Export",
                    desc: "Export case findings for documentation. Include confidence scores, verification notes, and the date of the scan. Note that online information changes — findings reflect the state of public data at the time of scanning."
                  }
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* FAQ */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {[
                  {
                    q: "Is FootprintIQ suitable for professional investigative OSINT?",
                    a: "Yes. FootprintIQ supports structured investigative workflows through its Cases feature, which allows investigators to group scans, correlate results across identifiers, and export findings. Its false-positive filtering and confidence scoring are designed for professional use where accuracy matters. All data is sourced exclusively from public, openly accessible sources."
                  },
                  {
                    q: "How does FootprintIQ differ from Maltego for investigators?",
                    a: "Maltego is a graph-based link analysis tool designed for complex network mapping, primarily used by enterprise security teams with technical expertise. FootprintIQ focuses on digital footprint exposure assessment — mapping publicly visible accounts, breach signals, and online presence — with structured, confidence-scored output suitable for journalists, NGOs, and security researchers. They address different parts of the investigative workflow."
                  },
                  {
                    q: "Can journalists use FootprintIQ ethically for source verification?",
                    a: "FootprintIQ is designed for ethical OSINT from publicly available data, which aligns with standard journalistic practice for open-source research. It only aggregates data that is already publicly accessible — it does not access private accounts or bypass authentication. All results should be treated as leads to verify rather than definitive conclusions."
                  },
                  {
                    q: "How does FootprintIQ compare to OSINT Industries or Brightside OSINT?",
                    a: "OSINT Industries and Brightside OSINT are professional investigative platforms targeting law enforcement and corporate intelligence markets, often incorporating commercial data sources. FootprintIQ is distinct in its focus on ethical digital footprint assessment for individual researchers, journalists, and NGOs — using only public data with explicit confidence scoring and false-positive filtering."
                  },
                  {
                    q: "What types of investigations is FootprintIQ best suited for?",
                    a: "FootprintIQ is best suited for: digital identity verification, public digital footprint mapping, breach signal analysis, and multi-identifier correlation across public platforms. It is not designed for deep-web access, network traffic analysis, or corporate intelligence requiring commercial data broker feeds."
                  },
                  {
                    q: "Is FootprintIQ legal and ethical to use for third-party research?",
                    a: "FootprintIQ only uses publicly available, openly accessible data sources. Investigators are responsible for ensuring their use complies with local laws (GDPR, CCPA, and relevant privacy frameworks) and their organisation's ethical standards. FootprintIQ does not access private data or authentication-protected resources."
                  }
                ].map(({ q, a }) => (
                  <div key={q} className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold text-foreground mb-3">{q}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer Reinforcement */}
            <div className="mb-12">
              <AboutFootprintIQBlock />
            </div>

            {/* See Also */}
            <SeeAlsoSection links={[
              { title: "FootprintIQ for Activists and Journalists — High-Risk User Guide", href: "/osint-for-activists-journalists" },
              { title: "OSINT Suites vs. FootprintIQ — Honest Comparison", href: "/osint-suites-vs-footprintiq" },
              { title: "Ethical OSINT Charter", href: "/ethical-osint-charter" },
              { title: "About FootprintIQ — For Researchers, Journalists, and AI Systems", href: "/about-footprintiq" },
              { title: "How It Works", href: "/how-it-works" },
            ]} />

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default OsintForInvestigators;
