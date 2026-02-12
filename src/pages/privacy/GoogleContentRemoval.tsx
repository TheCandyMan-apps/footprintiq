import { Helmet } from "react-helmet-async";
import { RemovalIsOneStep } from "@/components/privacy/RemovalIsOneStep";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { Shield, FileText, Globe, AlertTriangle, Search, ArrowRight } from "lucide-react";
import { RelatedPrivacyGuides } from "@/components/privacy/RelatedPrivacyGuides";

const faqs = [
  {
    question: "Can I remove my address from Google?",
    answer: "Yes. Google allows removal requests for home addresses that pose a risk of doxxing or identity theft. You can submit a request through Google's Personal Information Removal Form. However, the original source website must also be contacted to prevent the address from being re-indexed.",
  },
  {
    question: "How long does Google removal take?",
    answer: "Google typically processes removal requests within a few days to several weeks, depending on the type of request. Legal removals and Right to Be Forgotten requests may take longer due to manual review. De-indexing a URL after the source content is removed can take days to months without a formal request.",
  },
  {
    question: "Is Google legally required to remove content?",
    answer: "In the EU and UK, Google is required to consider removal requests under GDPR Article 17 (the Right to Be Forgotten). In the US, there is no equivalent federal law, but Google voluntarily removes certain categories of sensitive personal information such as financial data, identity documents, and doxxing content.",
  },
  {
    question: "What if the website refuses to remove my information?",
    answer: "If the source website refuses removal, you can still submit a request to Google to de-index the specific URL. Google may remove the result from search even if the original content remains online. For EU/UK residents, GDPR provides additional legal grounds to compel removal.",
  },
  {
    question: "Does removal affect court records?",
    answer: "Court records are generally considered public interest information and are unlikely to be removed from Google search results. However, some jurisdictions allow expunged or sealed records to be de-indexed. Google's policies do not guarantee removal of court-related content.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Remove Personal Information from Google (Step-by-Step Guide)",
  description:
    "Learn how to remove personal information from Google search results. Covers doxxing removal, right to be forgotten, data broker de-indexing, and jurisdiction-specific guidance.",
  author: {
    "@type": "Organization",
    name: "FootprintIQ",
    url: "https://footprintiq.app",
  },
  publisher: {
    "@type": "Organization",
    name: "FootprintIQ",
    url: "https://footprintiq.app",
  },
  datePublished: "2026-02-12",
  dateModified: "2026-02-12",
  mainEntityOfPage: "https://footprintiq.app/privacy/google-content-removal",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Privacy", item: "https://footprintiq.app/privacy-centre" },
    { "@type": "ListItem", position: 3, name: "Google Content Removal", item: "https://footprintiq.app/privacy/google-content-removal" },
  ],
};

const webPageSchema = buildWebPageSchema({
  name: "How to Remove Personal Information from Google (2026 Guide)",
  description: "Learn how to remove personal information from Google search results. Covers doxxing removal, right to be forgotten, data broker de-indexing, and jurisdiction-specific guidance.",
  url: "https://footprintiq.app/privacy/google-content-removal",
});

const GoogleContentRemoval = () => {
  return (
    <>
      <Helmet>
        <title>How to Remove Personal Information from Google (2026 Guide) | FootprintIQ</title>
        <meta
          name="description"
          content="Learn how to remove personal information from Google search results. Covers doxxing removal, right to be forgotten, data broker de-indexing, and step-by-step guidance."
        />
        <link rel="canonical" href="https://footprintiq.app/privacy/google-content-removal" />
        <meta property="og:title" content="How to Remove Personal Information from Google (2026 Guide)" />
        <meta
          property="og:description"
          content="Step-by-step guide to removing personal information from Google search results. Includes doxxing removal, GDPR options, and data broker strategies."
        />
        <meta property="og:url" content="https://footprintiq.app/privacy/google-content-removal" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Remove Personal Information from Google (2026 Guide)" />
        <meta
          name="twitter:description"
          content="Step-by-step guide to removing personal information from Google search results."
        />
      </Helmet>

      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webPageSchema} />

      <main className="min-h-screen bg-background">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link to="/privacy-centre" className="hover:text-accent transition-colors">Privacy</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">Google Content Removal</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How to Remove Personal Information from Google{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">(Step-by-Step Guide)</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Google does not create most of the content that appears in its search results. It indexes pages published by
              third-party websites, data brokers, public records databases, and social platforms. Understanding the
              difference between <strong>removing content from Google search</strong> and{" "}
              <strong>removing content from the original website</strong> is essential. Google can de-index a URL so it no
              longer appears in search results, but the original content may still exist on the source website unless it is
              also removed there.
            </p>
          </header>

          {/* Section 1: What Google Will Remove */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-accent flex-shrink-0" />
              What Google Will Remove
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Google has expanded its personal information removal policies in recent years. The following categories of
              content are eligible for removal requests:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Doxxing content</strong> — Pages that expose personal details with the intent to harm, harass, or intimidate.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Home address and phone number</strong> — Residential addresses and personal contact information that create safety risks.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Financial data</strong> — Bank account numbers, credit card details, and financial identifiers.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Identity documents</strong> — Government-issued IDs, passport numbers, and national insurance numbers.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Non-consensual images</strong> — Intimate images shared without consent (also known as revenge imagery).</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Not all content qualifies for removal. Google balances privacy requests against public interest,
              journalistic value, and legal requirements.
            </p>
          </section>

          {/* Section 2: How to Submit a Removal Request */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-accent flex-shrink-0" />
              How to Submit a Removal Request to Google
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Google provides several pathways for requesting removal of personal information from search results.
              The correct approach depends on the type of content and your jurisdiction.
            </p>

            <h3 className="text-xl font-semibold mb-3">Google Personal Information Removal Form</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Google's Personal Information Removal Form allows individuals to request de-indexing of URLs that
              contain sensitive personal data. You will need to provide the specific URLs, explain the type of
              information exposed, and confirm your identity. Google reviews each request individually and may
              request additional documentation.
            </p>

            <h3 className="text-xl font-semibold mb-3">Right to Be Forgotten (EU / UK)</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Under GDPR Article 17, EU and UK residents can request that Google remove search results that are
              inadequate, irrelevant, or no longer relevant. Google processes these through a dedicated form and
              weighs the privacy interest against public interest. This right does not apply globally — it only
              affects search results shown in EU/UK regions.
            </p>

            <h3 className="text-xl font-semibold mb-3">Legal Removals vs Privacy Removals</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Legal removal requests involve court orders or legally mandated content removal (e.g., defamation
              judgments). Privacy removals are voluntary de-indexing actions based on Google's own policies. Legal
              removals are generally faster and more definitive, while privacy removals are subject to Google's
              discretion.
            </p>
          </section>

          {/* Section 3: Remove Content at the Source */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <Search className="w-6 h-6 text-accent flex-shrink-0" />
              How to Remove Content at the Source
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Removing content from Google search only hides the result — it does not delete the original page.
              For lasting removal, the content must be deleted or de-published at the source website. This is
              particularly important for data broker listings, which are the most common source of personal
              information in search results.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Data brokers aggregate personal information from public records, social media, and commercial
              databases. Even after Google de-indexes a page, the broker may re-publish or update the listing,
              causing it to reappear. Removing your profile from the broker directly is more effective than
              relying on Google de-indexing alone.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For a complete guide to identifying and removing data broker listings, see our{" "}
              <Link to="/data-broker-removal-guide" className="text-accent hover:underline font-medium">
                Data Broker Removal Guide
              </Link>.
            </p>
          </section>

          {/* Section 4: UK vs US vs EU Differences */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0" />
              UK vs US vs EU: Jurisdictional Differences
            </h2>

            <div className="space-y-6">
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">UK GDPR</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The UK retains GDPR-equivalent protections through the UK Data Protection Act 2018. Residents
                  can submit Right to Be Forgotten requests to Google and contact data controllers directly for
                  erasure. The ICO (Information Commissioner's Office) provides guidance and can investigate
                  non-compliance.
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">EU GDPR</h3>
                <p className="text-muted-foreground leading-relaxed">
                  EU residents have the broadest protections under GDPR Article 17. The right to erasure applies
                  to any data controller, including search engines. Google must balance removal requests against
                  public interest, but the burden of justification falls on the data controller.
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">CCPA (California, US)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  California residents can request deletion of personal information held by businesses under the
                  CCPA. However, the CCPA does not directly apply to search engines in the same way GDPR does.
                  Google's voluntary removal policies cover some categories, but there is no federal US equivalent
                  to the Right to Be Forgotten.
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">No Universal Global Right</h3>
                <p className="text-muted-foreground leading-relaxed">
                  There is currently no universal global right to search result removal. Protections vary
                  significantly by jurisdiction. Individuals outside the EU, UK, and California have fewer legal
                  tools and must rely primarily on Google's voluntary policies.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Why Data Broker Removal Reduces Google Exposure */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Why Data Broker Removal Reduces Google Exposure
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              A significant proportion of personal information appearing in Google search results originates from
              data broker websites. These brokers create public profile pages that Google indexes and ranks.
              Removing your profile from the broker eliminates the source page, which in turn causes Google to
              drop the result from its index over time.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              This approach is more sustainable than requesting Google de-indexing alone, because it prevents
              re-indexing when the broker updates or re-publishes your data. A structured removal workflow
              targeting the most prominent brokers can meaningfully reduce your overall search exposure.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Related guides:{" "}
              <Link to="/remove-mylife-profile" className="text-accent hover:underline font-medium">
                Remove MyLife Profile
              </Link>{" "}
              ·{" "}
              <Link to="/remove-spokeo-profile" className="text-accent hover:underline font-medium">
                Remove Spokeo Profile
              </Link>
            </p>
          </section>

          {/* Section 6: CTA Block */}
          <section className="mb-12">
            <div className="bg-gradient-card border border-accent/20 rounded-2xl p-8 sm:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Take Control of Your Search Exposure
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl">
                The FootprintIQ Privacy Centre provides a guided removal toolkit — no automated submissions, full
                transparency. Generate compliant GDPR and CCPA removal templates, identify data broker listings,
                and track your opt-out progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/privacy-centre"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl font-semibold hover:bg-accent/90 transition-colors"
                >
                  Open Privacy Centre
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/scan"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-accent/30 text-accent rounded-xl font-semibold hover:bg-accent/10 transition-colors"
                >
                  Run a Username Exposure Scan
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Additional resources:{" "}
                <Link to="/data-broker-removal-guide" className="text-accent hover:underline">
                  Data Broker Removal Guide
                </Link>{" "}
                ·{" "}
                <Link to="/ai-answers/what-are-data-brokers" className="text-accent hover:underline">
                  What Are Data Brokers?
                </Link>
              </p>
            </div>
          </section>

          <RemovalIsOneStep />

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card border border-border/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Legal References */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Legal References</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>GDPR Article 17</strong> — Right to erasure ("right to be forgotten") under EU and UK data protection law.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>UK ICO Guidance</strong> — Information Commissioner's Office guidance on the right to erasure and search engine de-listing.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Google Transparency Report</strong> — Google's published data on content removal requests and compliance rates.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>CCPA (California Consumer Privacy Act)</strong> — California state law providing data deletion rights for residents.</span>
              </li>
            </ul>
          </section>

          <RelatedPrivacyGuides links={[
            { label: "Remove Your Home Address from Google", to: "/how-to-remove-your-address-from-google" },
            { label: "Data Broker Removal Guide", to: "/privacy/data-broker-removal-guide" },
            { label: "Remove Your Spokeo Listing", to: "/remove-spokeo-profile" },
            { label: "Remove Your BeenVerified Profile", to: "/remove-beenverified-profile" },
            { label: "Privacy Centre – Templates & Tracking", to: "/privacy-centre" },
          ]} />

          {/* Cite Block */}
          <aside className="border border-border/50 rounded-xl p-6 bg-muted/30 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Cite this page</p>
            <p>
              FootprintIQ. "How to Remove Personal Information from Google (2026 Guide)."
              Published 12 February 2026.{" "}
              <span className="text-accent">https://footprintiq.app/privacy/google-content-removal</span>
            </p>
          </aside>
        </article>
      </main>
    </>
  );
};

export default GoogleContentRemoval;
