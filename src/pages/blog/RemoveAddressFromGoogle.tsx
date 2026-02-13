import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { Link } from "react-router-dom";

const CANONICAL = "https://footprintiq.app/blog/remove-address-from-google";

const faqData = [
  {
    q: "How long does it take Google to remove my address?",
    a: "Google typically processes removal requests within a few days to a few weeks. If the request meets their criteria, the result will be de-indexed from search. However, the original data may still exist on the source website until you request removal from the publisher directly.",
  },
  {
    q: "Can I remove my address from Google if I live outside the UK or EU?",
    a: "Yes. Google's personal information removal tool is available globally, not just in GDPR jurisdictions. US residents can also use it, though the legal protections differ. Google evaluates requests based on risk of harm regardless of location.",
  },
  {
    q: "What's the difference between removing from Google and removing from the source?",
    a: "Removing from Google only de-indexes the result — it stops appearing in search. The data remains on the original website. For complete removal, you must also contact the source publisher or data broker directly and request deletion.",
  },
  {
    q: "Will Google remove my address if it appears in a news article?",
    a: "Generally no. Google balances personal privacy against public interest. If your address appears in a legitimate news article, they will likely decline the request. Exceptions may apply if the information creates a specific safety risk.",
  },
  {
    q: "Can I use GDPR to force Google to remove my data?",
    a: "Under GDPR Article 17, you can submit a Right to Erasure request to Google. However, Google can refuse if there is a legitimate public interest in the information. GDPR does not grant an absolute right to deletion — it's a balancing test.",
  },
  {
    q: "How do I find out where my address is published online?",
    a: "Running a digital exposure scan can help identify where your personal data — including your address — appears publicly. Tools like FootprintIQ scan public sources to surface this information so you can take targeted removal action.",
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
  headline: "How to Remove Your Address From Google (UK & Global Guide)",
  description:
    "Step-by-step guide to removing your home address from Google search results. Covers the Google removal request process, GDPR rights, data broker considerations, and international differences.",
  author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  datePublished: "2026-02-13",
  dateModified: "2026-02-13",
  mainEntityOfPage: CANONICAL,
  image: "https://footprintiq.app/blog-images/digital-footprint.webp",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
    { "@type": "ListItem", position: 3, name: "Remove Address From Google", item: CANONICAL },
  ],
};

export default function RemoveAddressFromGoogle() {
  return (
    <>
      <Helmet>
        <title>How to Remove Your Address From Google (UK & Global Guide) | FootprintIQ</title>
        <meta
          name="description"
          content="Step-by-step guide to removing your home address from Google search results. Covers the Google removal tool, GDPR rights, US/UK differences, and data broker opt-outs."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="How to Remove Your Address From Google (UK & Global Guide)" />
        <meta
          property="og:description"
          content="Learn how to remove your address from Google search results using official tools, GDPR rights, and data broker opt-outs."
        />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd
        data={buildWebPageSchema({
          name: "How to Remove Your Address From Google (UK & Global Guide)",
          description:
            "Step-by-step guide to removing your home address from Google search results, covering GDPR rights, data broker opt-outs, and global considerations.",
          url: CANONICAL,
          datePublished: "2026-02-13",
          dateModified: "2026-02-13",
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
            <span className="text-foreground">Remove Address From Google</span>
          </nav>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                Privacy
              </span>
              <span className="text-xs text-muted-foreground">February 13, 2026</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">12 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              How to Remove Your Address From Google (UK &amp; Global Guide)
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A compliance-focused walkthrough for removing your home address from Google search results — including UK GDPR rights, the official Google removal tool, data broker opt-outs, and what to do when Google refuses.
            </p>
          </header>

          {/* ── Direct Answer ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/20">
            <p className="text-foreground leading-relaxed">
              <strong>To remove your address from Google</strong>, you need to do two things: submit a removal request through Google's official personal information removal tool to de-index the result, and contact the original source website or data broker to delete the data at the root. Google will review your request within days to weeks. In the UK and EU, you can strengthen your request by citing GDPR Article 17 — but removal is not guaranteed and depends on a public-interest balancing test.
            </p>
          </section>

          {/* ── Why Addresses Appear ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Why Your Address Appears in Google Search Results
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Google doesn't generate content — it indexes what already exists on the public web. Your address can appear in search results because it was published by a data broker, a people-search directory, a public records database, a business registration, a court filing, or even a social media profile you once filled out.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Common sources include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Data brokers</strong> — Sites like Spokeo, BeenVerified, and MyLife aggregate public records and make them searchable by name.</li>
              <li><strong>Electoral rolls</strong> — In the UK, the open electoral register is publicly accessible and frequently scraped by third parties.</li>
              <li><strong>Companies House</strong> — UK business directors' registered addresses appear in public filings unless a service address is used.</li>
              <li><strong>Property records</strong> — Land registry data, planning applications, and council records can all expose residential addresses.</li>
              <li><strong>Social media &amp; forums</strong> — Old profiles or posts where you shared your address may still be indexed.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Understanding <em>where</em> the data originates is critical, because removing the Google listing without removing the source means the result will likely reappear after the next crawl cycle.
            </p>
          </section>

          {/* ── Google Removal Process ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Google's Personal Information Removal Request: Step by Step
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In 2022, Google expanded its removal policy beyond financial data and doxxing risks. You can now request removal of results containing your home address, phone number, email, or other personally identifiable information that could present a risk of identity theft, fraud, or harassment.
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3 ml-4">
              <li><strong>Navigate to Google's removal request form</strong> — Search for "Google personal information removal" or visit the form directly from Google's support pages.</li>
              <li><strong>Select the type of information</strong> — Choose "Contact information such as physical address" from the category list.</li>
              <li><strong>Provide the offending URLs</strong> — Submit the specific Google search result URLs (not the source page URLs) that display your address.</li>
              <li><strong>Explain the risk</strong> — Briefly describe why the exposure is harmful. You do not need to prove imminent danger, but specificity helps.</li>
              <li><strong>Submit and wait</strong> — Google reviews each request manually. You'll receive an email confirmation and a decision typically within 2–4 weeks.</li>
            </ol>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If approved, Google removes the result from search. The data on the source website remains untouched — that's a separate step.
            </p>
          </section>

          {/* ── UK/GDPR Guidance ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              UK-Specific Guidance: GDPR and Data Protection Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you are a UK or EU resident, you have stronger legal protections under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. The most relevant provisions are:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Article 17 — Right to Erasure</strong> — You can request deletion of personal data when the processing is no longer necessary, you withdraw consent, or the data was processed unlawfully.</li>
              <li><strong>Article 21 — Right to Object</strong> — You can object to processing based on legitimate interests, including the indexing of your personal data by search engines.</li>
              <li><strong>ICO complaints</strong> — If a data controller refuses your erasure request without valid justification, you can lodge a complaint with the Information Commissioner's Office (ICO).</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              In practice, Google operates a GDPR-specific removal form for European residents, separate from the general personal information tool. This form requires you to specify the search queries that surface your data and explain why the public interest does not outweigh your privacy rights.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To remove data from data brokers operating in the UK, send a written erasure request citing UK GDPR Article 17. The controller must respond within one calendar month. If they fail to respond or refuse without legal basis, the ICO can intervene.
            </p>
          </section>

          {/* ── US & International ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              US &amp; International Differences
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Outside the UK and EU, privacy rights regarding search engine de-indexing vary significantly:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>United States</strong> — There is no federal equivalent to GDPR's right to erasure. California's CCPA/CPRA grants some deletion rights, but these primarily apply to data held by businesses, not search engine indexing. Google's removal tool is your main option.</li>
              <li><strong>Canada</strong> — PIPEDA governs personal data, but there is no established "right to be forgotten" in Canadian law. Requests are handled case-by-case.</li>
              <li><strong>Australia</strong> — The Privacy Act 1988 includes correction rights, but de-indexing requests to Google are not specifically regulated.</li>
              <li><strong>Global</strong> — Google's personal information removal tool is available worldwide and does not require you to cite a specific law. The evaluation is based on harm potential.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Regardless of jurisdiction, the most effective approach combines Google de-indexing with direct removal requests to the source publishers.
            </p>
          </section>

          {/* ── Data Broker Considerations ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Data Broker Considerations
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Even if Google removes a search result, the underlying data often lives on data broker and people-search platforms. These sites aggregate public records and resell or freely display personal information, including home addresses.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To achieve meaningful removal, you need to identify which brokers hold your data and submit opt-out requests to each one individually. Major brokers include Spokeo, BeenVerified, MyLife, Whitepages, Radaris, and dozens more. Each has its own opt-out procedure — some require email verification, others require identity confirmation or even a phone call.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This is where a digital exposure scan can save significant time. Rather than manually searching each broker, an automated scan identifies where your data appears so you can prioritise removal efforts.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Be aware that removal from data brokers is rarely permanent. Many brokers re-collect data from public sources on a recurring basis. Ongoing monitoring is recommended.
            </p>
          </section>

          {/* ── When Google Will Refuse ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              When Google Will Refuse a Removal Request
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Google does not approve every request. Common reasons for refusal include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Public interest outweighs privacy</strong> — If the address appears in news articles, government records, or contexts with legitimate public interest, Google may decline.</li>
              <li><strong>Insufficient evidence of harm</strong> — Vague requests without clear explanation of why the exposure is harmful are more likely to be rejected.</li>
              <li><strong>Business addresses</strong> — Google typically won't remove addresses associated with registered businesses, as this information is considered commercially relevant.</li>
              <li><strong>Self-published data</strong> — If you voluntarily published your address on a personal website or social media profile, Google may direct you to remove it at the source first.</li>
              <li><strong>Duplicate requests</strong> — Submitting the same request repeatedly without new information will not change the outcome.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If your request is denied, you can appeal by providing additional context. In the UK, you can also escalate to the ICO if you believe your GDPR rights have been violated.
            </p>
          </section>

          {/* ── Ethical/Legal ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ethical and Legal Considerations
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The right to remove personal information from search results exists within a broader framework of competing interests. While privacy is a fundamental right, it must be balanced against:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Freedom of expression</strong> — Removing content from search engines can have implications for press freedom and public accountability.</li>
              <li><strong>Transparency requirements</strong> — Public officeholders, company directors, and those in public-facing roles may have reduced privacy expectations for certain categories of data.</li>
              <li><strong>Legitimate investigative purposes</strong> — Law enforcement, journalism, and authorised security research may have valid reasons to access publicly available address data.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              When submitting removal requests, be truthful about why you want the data removed. Misrepresenting the nature of the content or fabricating harm can undermine your credibility and, in some jurisdictions, may have legal consequences.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Tools like FootprintIQ help you identify what's exposed before taking action. Understanding your actual digital footprint allows you to make informed, proportionate decisions about which data to prioritise for removal.
            </p>
          </section>

          {/* ── CTA ── */}
          <section className="mb-12 p-6 rounded-xl border border-primary/30 bg-primary/5 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Check What's Publicly Visible About You
            </h2>
            <p className="text-muted-foreground mb-4">
              Before submitting removal requests, it helps to know exactly where your personal data appears online. Run a free exposure scan to identify your public footprint.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Run a Free Exposure Scan
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

          {/* ── Internal Links ── */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Related Resources</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
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
              <li>
                <Link to="/remove-personal-information-from-internet" className="text-primary hover:underline">
                  Remove Personal Information From the Internet
                </Link>{" "}
                — Comprehensive removal guide
              </li>
            </ul>
          </section>

          <GuideCitationBlock />
        </article>

        <RelatedToolsGrid currentPath="/blog/remove-address-from-google" />
      </main>

      <Footer />
    </>
  );
}
