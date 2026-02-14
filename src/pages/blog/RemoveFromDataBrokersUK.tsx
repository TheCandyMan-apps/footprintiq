import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { Link } from "react-router-dom";

const CANONICAL = "https://footprintiq.app/blog/remove-from-data-brokers-uk";

const faqData = [
  {
    q: "What is a data broker?",
    a: "A data broker is a company that collects, aggregates, and sells personal information — including names, addresses, phone numbers, and online activity — from public records, social media, and commercial databases. In the UK, major brokers include 192.com, Spokeo, and various people-search directories.",
  },
  {
    q: "Can I force a UK data broker to delete my data?",
    a: "Yes. Under UK GDPR Article 17, you have the right to request erasure of your personal data. The data controller must respond within one calendar month. If they refuse without legal basis, you can escalate to the Information Commissioner's Office (ICO).",
  },
  {
    q: "How long does data broker removal take?",
    a: "Most UK data brokers process erasure requests within 30 days, as required by GDPR. Some respond within days, while others take the full month. International brokers may take longer, especially those operating outside GDPR jurisdictions.",
  },
  {
    q: "Will my data reappear after I remove it?",
    a: "Possibly. Many data brokers re-collect information from public sources on a recurring basis. Removal is rarely permanent without ongoing monitoring. Re-scanning periodically helps you catch re-listings early.",
  },
  {
    q: "Is there a free way to find which data brokers have my information?",
    a: "Running a digital exposure scan can identify where your personal data appears across data broker sites, people-search directories, and public databases. This saves hours compared to searching each broker manually.",
  },
  {
    q: "What's the difference between opting out and requesting erasure?",
    a: "Opting out typically removes your listing from public search results on the broker's site. An erasure request under GDPR requires the broker to delete your data entirely from their systems. Erasure is stronger but may not prevent future re-collection from public sources.",
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
  headline: "How to Remove Yourself From Data Brokers (UK Guide)",
  description:
    "Complete UK guide to removing your personal information from data brokers. Covers GDPR rights, opt-out processes, and ongoing monitoring strategies.",
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
    { "@type": "ListItem", position: 3, name: "Remove From Data Brokers UK", item: CANONICAL },
  ],
};

export default function RemoveFromDataBrokersUK() {
  return (
    <>
      <Helmet>
        <title>How to Remove Yourself From Data Brokers (UK Guide) | FootprintIQ</title>
        <meta
          name="description"
          content="Step-by-step UK guide to removing your personal data from data brokers. Covers GDPR erasure rights, opt-out processes, and ongoing monitoring strategies."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="How to Remove Yourself From Data Brokers (UK Guide)" />
        <meta
          property="og:description"
          content="Complete UK guide to data broker removal using GDPR rights, opt-out forms, and exposure monitoring."
        />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd
        data={buildWebPageSchema({
          name: "How to Remove Yourself From Data Brokers (UK Guide)",
          description:
            "Complete UK guide to removing your personal information from data brokers using GDPR rights and opt-out processes.",
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
            <span className="text-foreground">Remove From Data Brokers UK</span>
          </nav>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                Privacy
              </span>
              <span className="text-xs text-muted-foreground">February 14, 2026</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">13 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              How to Remove Yourself From Data Brokers (UK Guide)
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A practical, GDPR-focused guide to identifying which data brokers hold your personal information, submitting erasure requests, and monitoring for re-listings — with UK-specific steps and international considerations.
            </p>
          </header>

          {/* ── Direct Answer ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/20">
            <p className="text-foreground leading-relaxed">
              <strong>To remove yourself from data brokers in the UK</strong>, identify which brokers hold your data using a digital exposure scan, then submit individual erasure requests citing UK GDPR Article 17. Each broker must respond within 30 days. For international brokers outside GDPR jurisdiction, use their opt-out forms directly. Removal is rarely permanent — most brokers re-collect data from public sources, so ongoing monitoring is essential.
            </p>
          </section>

          {/* ── What Are Data Brokers ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              What Are Data Brokers and Why Do They Have Your Data?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Data brokers are companies that collect, aggregate, and sell personal information. They source data from public records, electoral rolls, social media profiles, commercial transactions, and other publicly accessible databases. In the UK, this includes Companies House filings, the open electoral register, court records, and property listings.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The data broker industry operates largely invisibly. Most people don't know which brokers hold their information or how it's being used. Brokers sell data to marketers, insurance companies, background check services, and — in some cases — individuals conducting personal searches.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Common UK-relevant data brokers include 192.com, Pipl, Spokeo, BeenVerified, Whitepages, and various people-search directories. International brokers like Acxiom, Oracle Data Cloud, and Experian's marketing division also hold UK consumer data.
            </p>
          </section>

          {/* ── Your GDPR Rights ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your GDPR Rights Against Data Brokers
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under the UK General Data Protection Regulation, you have several rights that apply directly to data brokers:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Article 15 — Right of Access</strong> — You can request a copy of all personal data a broker holds about you. They must respond within one month.</li>
              <li><strong>Article 17 — Right to Erasure</strong> — You can request deletion of your data when the processing is no longer necessary, you withdraw consent, or the data was processed unlawfully.</li>
              <li><strong>Article 21 — Right to Object</strong> — You can object to processing based on legitimate interests, including profiling and direct marketing.</li>
              <li><strong>Article 77 — Right to Complain</strong> — If a broker fails to comply, you can lodge a complaint with the ICO.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These rights apply to any organisation processing your personal data, regardless of whether they have a UK office — provided they offer services to UK residents or monitor their behaviour.
            </p>
          </section>

          {/* ── Step-by-Step Process ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Step-by-Step: Removing Your Data From Brokers
            </h2>
            <ol className="list-decimal list-inside text-muted-foreground space-y-4 ml-4">
              <li>
                <strong>Identify which brokers hold your data</strong> — Run a{" "}
                <Link to="/scan" className="text-primary hover:underline">digital exposure scan</Link>{" "}
                to discover where your information appears. This is faster than searching each broker manually.
              </li>
              <li>
                <strong>Prioritise by risk</strong> — Focus first on brokers exposing your home address, phone number, or financial information. Profile listings with only a name are lower priority.
              </li>
              <li>
                <strong>Submit erasure requests</strong> — For UK/EU brokers, send a written request citing UK GDPR Article 17. Include your full name, the specific data you want deleted, and a reference to the legal basis for erasure.
              </li>
              <li>
                <strong>Use opt-out forms for international brokers</strong> — US-based brokers like Spokeo and BeenVerified have dedicated opt-out pages. Follow their specific procedures, which may require email verification or identity confirmation.
              </li>
              <li>
                <strong>Track your requests</strong> — Keep a record of when you submitted each request, the broker's response, and any confirmation of deletion. This is essential if you need to escalate to the ICO.
              </li>
              <li>
                <strong>Monitor for re-listings</strong> — Set a reminder to re-scan every 3–6 months. Many brokers re-collect data from public sources automatically.
              </li>
            </ol>
          </section>

          {/* ── Cross-link insert ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/10">
            <p className="text-foreground leading-relaxed mb-3">
              Old, forgotten accounts are a common source of data broker listings. Cleaning up unused accounts reduces the surface area brokers can scrape.
            </p>
            <Link
              to="/blog/delete-old-accounts"
              className="text-sm font-medium text-primary hover:underline"
            >
              → How to Delete Old Accounts You No Longer Use
            </Link>
          </section>

          {/* ── UK-Specific Brokers ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              UK-Specific Data Brokers to Check
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Several data brokers specifically aggregate UK data. These should be your first targets:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>192.com</strong> — Aggregates electoral roll, director, and birth/marriage/death records. Offers an opt-out form on their website.</li>
              <li><strong>BT Phone Book / The Phone Book</strong> — If your landline is listed, contact BT to go ex-directory.</li>
              <li><strong>Companies House</strong> — Director addresses are public record. You can apply to use a service address instead, but existing filings remain visible.</li>
              <li><strong>Electoral roll (open register)</strong> — Contact your local council to opt out of the open register. The full register is only available to credit reference agencies and certain official bodies.</li>
              <li><strong>Land Registry</strong> — Property ownership data is public. You can apply for an exemption if you can demonstrate a safety risk.</li>
            </ul>
          </section>

          {/* ── When Removal Fails ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              What to Do When Removal Requests Are Refused
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Data brokers may refuse your erasure request if they believe they have a legitimate interest or legal obligation to retain the data. Common justifications include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>The data is required for the exercise or defence of legal claims</li>
              <li>The broker is a credit reference agency with a legal basis to process your data</li>
              <li>The data relates to your role as a public officeholder or company director</li>
              <li>Freedom of expression considerations outweigh your privacy rights</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you believe a refusal is unjustified, you can escalate to the ICO. The ICO can investigate, issue enforcement notices, and fine organisations for non-compliance. Before escalating, ensure you have documented your original request and the broker's response.
            </p>
          </section>

          {/* ── Cross-link insert ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/10">
            <p className="text-foreground leading-relaxed mb-3">
              Understanding your overall digital footprint helps you prioritise which brokers to target first. A footprint check reveals what's publicly linked to your identity.
            </p>
            <Link
              to="/blog/what-is-digital-footprint-check"
              className="text-sm font-medium text-primary hover:underline"
            >
              → What Is a Digital Footprint Check?
            </Link>
          </section>

          {/* ── Ongoing Monitoring ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Why Removal Is Only One Step
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Removing your data from data brokers is not a one-time action. The data broker ecosystem is cyclical — brokers re-collect information from public sources on a regular basis. A listing you remove today may reappear in 3–6 months.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Effective privacy management requires ongoing monitoring. Periodic exposure scans help you detect re-listings early, track which brokers are most persistent, and maintain an accurate picture of your public data footprint.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Additionally, reducing the sources that brokers scrape — such as{" "}
              <Link to="/blog/delete-old-accounts" className="text-primary hover:underline">deleting old accounts</Link>,
              opting out of the open electoral register, and using a service address for company filings — reduces future re-collection.
            </p>
          </section>

          {/* ── Ethical Considerations ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ethical and Legal Considerations
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The right to remove personal information from data brokers exists within a framework of competing interests. While individuals have a legitimate need to control their personal data, data brokers argue they serve valid commercial and public-interest purposes.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When submitting removal requests, be honest about your reasons. Misrepresenting the nature of your request or fabricating safety concerns can undermine your credibility. In the UK, GDPR gives you strong rights — you don't need to exaggerate to exercise them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Tools like FootprintIQ help you understand your exposure before taking action. Knowing exactly where your data appears allows you to make informed, proportionate decisions about which listings to prioritise.
            </p>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="mb-12 p-8 rounded-2xl border-2 border-primary/30 bg-primary/5 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Find Out Which Data Brokers Have Your Information
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              A free exposure scan identifies where your personal data appears across data broker sites, people-search directories, and public databases — so you can target removals efficiently.
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
                <Link to="/blog/what-is-digital-footprint-check" className="text-primary hover:underline">
                  What Is a Digital Footprint Check?
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

        <RelatedToolsGrid currentPath="/blog/remove-from-data-brokers-uk" />
      </main>

      <Footer />
    </>
  );
}
