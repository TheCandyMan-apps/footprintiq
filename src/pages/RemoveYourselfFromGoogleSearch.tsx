import { Helmet } from "react-helmet-async";
import { RemovalIsOneStep } from "@/components/privacy/RemovalIsOneStep";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can I remove my name from Google completely?",
    answer:
      "It is very difficult to remove your name from Google entirely. Google indexes content from millions of websites, many of which are outside your control. You can request removal of specific URLs, but new pages may appear over time. Ongoing monitoring is recommended.",
  },
  {
    question: "How long does Google removal take?",
    answer:
      "Google typically processes removal requests within a few days to several weeks. Temporary removal via the Removals tool takes effect within hours but expires after six months. Permanent removal requires the content to be deleted or blocked at the source first.",
  },
  {
    question: "Is the right to be forgotten available in the US?",
    answer:
      "The right to be forgotten under GDPR applies to EU and UK residents. US residents do not have an equivalent federal right, but Google does offer removal of certain sensitive personal information such as financial data, medical records, and explicit images regardless of jurisdiction.",
  },
  {
    question: "Can I remove news articles from Google?",
    answer:
      "Google generally does not remove legitimate news articles, as they may be considered in the public interest. If the article contains sensitive personal data, you can submit a removal request, but approval depends on a case-by-case balancing of privacy versus public interest.",
  },
  {
    question: "Can I remove mugshots from Google?",
    answer:
      "Google updated its policies to allow removal of mugshot images from exploitative sites that charge fees for removal. You can submit a request through Google's content removal form. The original site may also need to be contacted directly.",
  },
  {
    question: "Can I remove court records from Google search?",
    answer:
      "Court records are typically considered public information and Google may not remove them. However, if the records contain sensitive personal identifiers or are from jurisdictions with expungement or sealing provisions, you may have grounds for a removal request.",
  },
  {
    question: "Why does my address appear in Google?",
    answer:
      "Your address may appear in Google because it is listed on data broker sites, property records, voter registrations, or business filings. Removing it requires contacting each source directly and then requesting Google to de-index the cached page.",
  },
  {
    question: "What if Google denies my removal request?",
    answer:
      "If Google denies your request, review the denial reason carefully. You may be able to resubmit with additional context. For EU/UK residents, you can escalate to your national data protection authority. In all cases, removing the content from the source website strengthens your case.",
  },
  {
    question: "Does removing a result from Google remove it from other search engines?",
    answer:
      "No. Google removal only affects Google search results. You must submit separate requests to Bing, Yahoo, DuckDuckGo, and other search engines. Removing content at the source is the most effective approach as it affects all search engines simultaneously.",
  },
  {
    question: "Can I remove old social media profiles from Google?",
    answer:
      "If you delete or deactivate a social media account, the profile page will eventually drop out of Google's index. You can speed this up by using Google's URL removal tool once the page returns a 404 error. Cached versions may persist briefly.",
  },
  {
    question: "Can companies remove search results about them?",
    answer:
      "Companies can request removal of specific content that violates Google's policies, such as doxxing of employees or leaked confidential data. For other content, companies typically work with the source website to remove or update the information, then request Google to de-index the outdated page.",
  },
  {
    question: "Is removal from Google permanent?",
    answer:
      "Not necessarily. If the original content remains online, Google may re-index it during future crawls. Permanent removal requires deleting the content at the source. Even after source deletion, data brokers may re-aggregate your information from other public records, so ongoing monitoring is recommended.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Remove Your Name from Google Search (Step-by-Step Guide)",
  description:
    "Learn how to remove personal information from Google search results. Includes right to be forgotten, legal options, and step-by-step removal guidance.",
  author: { "@type": "Organization", name: "FootprintIQ" },
  publisher: { "@type": "Organization", name: "FootprintIQ" },
  datePublished: "2026-02-12",
  dateModified: "2026-02-12",
  url: "https://footprintiq.app/remove-yourself-from-google-search",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://footprintiq.app/guides" },
    {
      "@type": "ListItem",
      position: 3,
      name: "Remove Yourself from Google Search",
      item: "https://footprintiq.app/remove-yourself-from-google-search",
    },
  ],
};

const RemoveYourselfFromGoogleSearch = () => {
  return (
    <>
      <Helmet>
        <title>How to Remove Your Name from Google Search (Step-by-Step Guide)</title>
        <meta
          name="description"
          content="Learn how to remove personal information from Google search results. Includes right to be forgotten, legal options, and step-by-step removal guidance."
        />
        <link rel="canonical" href="https://footprintiq.app/remove-yourself-from-google-search" />
        <meta property="og:title" content="How to Remove Your Name from Google Search (Step-by-Step Guide)" />
        <meta
          property="og:description"
          content="Learn how to remove personal information from Google search results. Includes right to be forgotten, legal options, and step-by-step instructions."
        />
        <meta property="og:url" content="https://footprintiq.app/remove-yourself-from-google-search" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://footprintiq.app/og-image.jpg" />
        <meta property="og:site_name" content="FootprintIQ" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Remove Your Name from Google Search (Step-by-Step Guide)" />
        <meta
          name="twitter:description"
          content="Learn how to remove personal information from Google search results. Includes right to be forgotten, legal options, and step-by-step instructions."
        />
        <meta name="twitter:image" content="https://footprintiq.app/og-image.jpg" />
      </Helmet>

      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
          {/* H1 */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-6">
            How to Remove Your Name from Google Search Results
          </h1>

          <p className="text-muted-foreground text-lg mb-10">
            Google indexes content from billions of web pages, but Google itself does not create
            most of this content. When your name, address, or other personal information appears in
            search results, it is usually because a third-party website published it. Your removal
            options depend on the type of content, the source website, and your jurisdiction.
          </p>

          {/* Why Your Name Appears */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Your Name Appears in Google</h2>
            <p className="text-muted-foreground mb-4">
              Google's search index reflects publicly accessible web content. Common reasons your
              personal information appears include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Search indexing:</strong> Google's crawlers continuously discover and index
                new pages. If a page mentions your name, it may appear in search results.
              </li>
              <li>
                <strong>Data broker listings:</strong> Sites such as Spokeo, MyLife, and
                BeenVerified aggregate public records and publish people-search profiles.
              </li>
              <li>
                <strong>Public records:</strong> Court filings, property records, voter
                registrations, and business filings are often digitised and indexed.
              </li>
              <li>
                <strong>Social media:</strong> Public profiles on platforms like Facebook, LinkedIn,
                Twitter, and Instagram are indexed by default.
              </li>
              <li>
                <strong>News articles:</strong> Online news coverage, press releases, and blog posts
                that mention your name are indexed and may persist indefinitely.
              </li>
              <li>
                <strong>Cached content:</strong> Even after a page is updated or removed, Google may
                continue to show a cached version until the next crawl cycle refreshes the index.
              </li>
            </ul>
          </section>

          {/* Can You Remove Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Can You Remove Information from Google?</h2>
            <p className="text-muted-foreground mb-6">
              Yes, in certain circumstances. The approach depends on where the information
              originates and your legal rights.
            </p>

            <h3 className="text-xl font-semibold mb-2">1. Removing Content from the Source Website</h3>
            <p className="text-muted-foreground mb-4">
              The most effective method is to contact the website that published the information and
              request removal. Once the source page is deleted or returns a 404 error, Google will
              eventually drop it from search results during its next crawl cycle.
            </p>

            <h3 className="text-xl font-semibold mb-2">2. Requesting Google De-indexing</h3>
            <p className="text-muted-foreground mb-4">
              If the content has been removed from the source but still appears in Google's cache,
              you can use Google's{" "}
              <a
                href="https://search.google.com/search-console/removals"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Removals tool
              </a>{" "}
              (requires Search Console access) or the{" "}
              <a
                href="https://www.google.com/webmasters/tools/removals"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                outdated content removal tool
              </a>{" "}
              to request de-indexing.
            </p>

            <h3 className="text-xl font-semibold mb-2">3. Right to Be Forgotten (EU/UK Residents)</h3>
            <p className="text-muted-foreground mb-4">
              Under GDPR Article 17, EU and UK residents can request that Google de-list search
              results that are inadequate, irrelevant, or no longer relevant. This does not delete
              the content from the source website — it only removes the link from Google's search
              results in applicable regions.
            </p>

            <h3 className="text-xl font-semibold mb-2">4. Sensitive Information Removal</h3>
            <p className="text-muted-foreground mb-4">
              Google allows removal requests for specific categories of sensitive personal
              information regardless of jurisdiction, including: doxxing content, non-consensual
              explicit images, financial information (bank accounts, credit card numbers), medical
              records, and government-issued ID numbers.
            </p>
          </section>

          {/* Step by Step */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Step-by-Step — How to Request Removal from Google
            </h2>
            <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
              <li>
                <strong>Identify the search result URL.</strong> Search your name on Google and
                note the exact URL of each result you want removed.
              </li>
              <li>
                <strong>Determine whether removal must happen at source.</strong> If the content is
                still live on the original website, contact the site owner or use their opt-out
                process first. Google generally will not remove content that is still publicly
                accessible.
              </li>
              <li>
                <strong>Use Google's removal request forms.</strong> For outdated content, use the{" "}
                <a
                  href="https://www.google.com/webmasters/tools/removals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Remove outdated content tool
                </a>
                . For sensitive personal information, use{" "}
                <a
                  href="https://support.google.com/websearch/troubleshooter/9685456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Google's personal information removal request form
                </a>
                .
              </li>
              <li>
                <strong>Submit a legal request if applicable.</strong> EU/UK residents can submit a{" "}
                <a
                  href="https://www.google.com/webmasters/tools/legal-removal-request"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  right to be forgotten request
                </a>{" "}
                through Google's legal removal form.
              </li>
              <li>
                <strong>Monitor search results.</strong> After submitting a request, check Google
                periodically to confirm the result has been removed. New listings may appear over
                time as data brokers re-publish information.
              </li>
            </ol>
          </section>

          {/* Right to Be Forgotten */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Right to Be Forgotten (UK & EU)</h2>
            <p className="text-muted-foreground mb-4">
              GDPR Article 17 grants EU and UK residents the right to request erasure of personal
              data when it is no longer necessary for the purpose it was collected, or when the
              individual withdraws consent. Google has processed millions of these requests since
              the ruling in 2014.
            </p>
            <p className="text-muted-foreground mb-4">
              Google evaluates each request by balancing the individual's privacy rights against the
              public interest in access to information. Requests relating to public figures,
              criminal convictions, or professional conduct may be declined if the information is
              considered relevant.
            </p>
            <p className="text-muted-foreground">
              To submit a request, use Google's{" "}
              <a
                href="https://www.google.com/webmasters/tools/legal-removal-request"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                legal removal request form
              </a>
              . You will need to provide the specific URLs and explain why each result should be
              de-listed.
            </p>
          </section>

          {/* US Residents */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">US Residents — What Are Your Options?</h2>
            <p className="text-muted-foreground mb-4">
              While the US does not have a federal equivalent of the right to be forgotten, Google
              has expanded its removal policies to cover certain categories of sensitive content for
              all users, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Non-consensual explicit imagery</li>
              <li>Financial information (bank account numbers, credit card numbers)</li>
              <li>Government-issued identification numbers</li>
              <li>Medical records</li>
              <li>Login credentials</li>
              <li>Content from exploitative removal-fee sites</li>
            </ul>
            <p className="text-muted-foreground">
              For other types of personal information, the primary approach for US residents is to
              remove content at the source — by contacting data brokers, website administrators, or
              using opt-out processes — and then requesting Google to de-index the cached version.
            </p>
          </section>

          {/* Limitations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Important Limitations</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Google does not control third-party websites.</strong> Removing a result
                from Google does not delete the original content. The page remains accessible via
                direct URL or other search engines.
              </li>
              <li>
                <strong>Removal from Google does not remove the original content.</strong> To fully
                remove information, you must contact the source website directly.
              </li>
              <li>
                <strong>Some content may be legally protected.</strong> News articles, court
                records, and government filings may be considered public interest content and may
                not be eligible for removal.
              </li>
              <li>
                <strong>Data brokers may re-list your information.</strong> Even after successful
                removal, data brokers may re-aggregate and re-publish your details from new public
                records. Periodic monitoring is important.
              </li>
            </ul>
          </section>

          {/* Structured Removal Workflow */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Structured Removal Workflow</h2>
            <p className="text-muted-foreground mb-4">
              A structured approach increases the likelihood of successful removal and reduces
              the time spent on repeated requests. A typical workflow involves:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground mb-6">
              <li>
                <strong>Identify source websites</strong> — Search your name and document every URL
                where your personal information appears.
              </li>
              <li>
                <strong>Generate compliant removal templates</strong> — Use standardised GDPR or
                CCPA request templates to contact each source with a legally grounded removal request.
              </li>
              <li>
                <strong>Track submission status</strong> — Record which requests have been sent,
                acknowledged, and completed to avoid duplicating effort.
              </li>
            </ol>
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <p className="text-foreground font-medium mb-2">Generate a GDPR/CCPA Removal Template</p>
              <p className="text-muted-foreground">
                The{" "}
                <Link to="/privacy-centre" className="text-accent hover:underline">
                  Privacy Centre
                </Link>{" "}
                provides ready-to-use removal request templates that comply with GDPR Article 17
                and CCPA requirements.
              </p>
            </div>
          </section>

          {/* Monitoring */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Monitor Your Search Exposure Over Time</h2>
            <p className="text-muted-foreground mb-4">
              Search results change over time. New data broker listings, social media mentions, or
              public records may surface after an initial removal. Structured, periodic monitoring
              reduces long-term exposure and helps you catch new listings early.
            </p>
            <div className="bg-card border border-border/50 rounded-xl p-6 space-y-3">
              <p className="text-foreground font-medium">Take action:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <Link to="/scan" className="text-accent hover:underline">
                    Run a Username Exposure Scan
                  </Link>{" "}
                  to see where your identity appears across 500+ platforms.
                </li>
                <li>
                  <Link to="/privacy-centre" className="text-accent hover:underline">
                    Use the Privacy Centre
                  </Link>{" "}
                  to generate compliant GDPR and CCPA removal requests.
                </li>
              </ul>
            </div>
          </section>

          <RemovalIsOneStep />

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Legal References */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Legal References</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <a
                  href="https://gdpr-info.eu/art-17-gdpr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  GDPR Article 17 — Right to Erasure
                </a>
              </li>
              <li>
                <a
                  href="https://transparencyreport.google.com/eu-privacy/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Google Transparency Report — EU Privacy Removals
                </a>
              </li>
              <li>
                <a
                  href="https://oag.ca.gov/privacy/ccpa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  California Consumer Privacy Act (CCPA) — Overview
                </a>
              </li>
              <li>
                <a
                  href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/right-to-erasure/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  UK ICO — Right to Erasure Guidance
                </a>
              </li>
            </ul>
          </section>

          {/* Related Guides */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-4">Related Data Broker Removal Guides</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <Link to="/data-broker-removal-guide" className="text-accent hover:underline">
                  Complete Data Broker Removal Guide
                </Link>
              </li>
              <li>
                <Link to="/privacy-centre" className="text-accent hover:underline">
                  Privacy Centre — Templates & Tracking
                </Link>
              </li>
              <li>
                <Link to="/remove-mylife-profile" className="text-accent hover:underline">
                  How to Remove Your MyLife Profile
                </Link>
              </li>
              <li>
                <Link to="/remove-spokeo-profile" className="text-accent hover:underline">
                  How to Remove Your Spokeo Profile
                </Link>
              </li>
            </ul>
          </section>

          <GuideCitationBlock />
        </article>
      </main>

      <Footer />
    </>
  );
};

export default RemoveYourselfFromGoogleSearch;
