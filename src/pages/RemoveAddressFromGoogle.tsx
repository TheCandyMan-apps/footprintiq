import { Helmet } from "react-helmet-async";
import { RemovalIsOneStep } from "@/components/privacy/RemovalIsOneStep";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
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
    question: "Can I remove my address from Google completely?",
    answer:
      "It is very difficult to remove your address from Google entirely. Google indexes content from many third-party websites. You can request removal of specific URLs, but new listings may appear over time from other sources. Ongoing monitoring is recommended.",
  },
  {
    question: "How long does Google removal take?",
    answer:
      "Google typically processes removal requests within a few days to several weeks. Temporary removal via the Removals tool takes effect within hours but expires after six months. Permanent removal requires the content to be deleted or blocked at the source first.",
  },
  {
    question: "What if my address appears on a data broker?",
    answer:
      "Data brokers aggregate public records and publish them on people-search sites. To remove your address, you need to submit opt-out requests directly to each broker. Once the source removes the listing, you can then request Google to de-index the cached page.",
  },
  {
    question: "Can I remove property records from Google?",
    answer:
      "Property records are typically public information maintained by government agencies. Google may not remove them because they are considered publicly available. In some jurisdictions, you may be able to request redaction of certain details from the original agency.",
  },
  {
    question: "Can I remove court records from Google search?",
    answer:
      "Court records are generally considered public information. Google may decline removal unless the records contain sensitive personal identifiers or are from jurisdictions with expungement or sealing provisions. Contact the court directly for record-level changes.",
  },
  {
    question: "Can businesses remove their addresses from Google?",
    answer:
      "Businesses can manage their Google Business Profile to control what appears in search. However, third-party sites may also list business addresses. Removing those requires contacting each site individually. Google's personal information removal policies primarily apply to individuals.",
  },
  {
    question: "Is removal from Google permanent?",
    answer:
      "Removal from Google search results is not always permanent. If the source website continues to publish your address, Google may re-index it. Permanent removal requires deleting the information at the source and ensuring it is not republished.",
  },
  {
    question: "Does Google notify the website owner when content is removed?",
    answer:
      "Google does not typically notify website owners when a URL is de-indexed through a personal information removal request. However, Google may inform website operators in certain circumstances, such as legal removal requests.",
  },
  {
    question: "What if Google denies my removal request?",
    answer:
      "If Google denies your request, review the reason provided and consider whether additional evidence supports your case. You may resubmit with more detail, contact the source website directly, or seek legal advice if the content involves sensitive personal information.",
  },
  {
    question: "Can someone repost my address after removal?",
    answer:
      "Yes. Removing your address from one source does not prevent it from appearing elsewhere. Data brokers regularly refresh their databases from public records. Ongoing monitoring helps identify new listings so you can submit additional removal requests.",
  },
  {
    question: "Does removing my address from Google delete it from the internet?",
    answer:
      "No. Google removal only affects search results — it does not delete the content from the original website. To fully remove your address, you must contact the source website and request deletion there as well.",
  },
  {
    question: "Can I use GDPR to remove my address from Google?",
    answer:
      "If you are an EU or UK resident, GDPR Article 17 gives you the right to request erasure of personal data, including your address, from search engines. Google evaluates these requests on a case-by-case basis, balancing privacy against public interest.",
  },
];

const PAGE_URL = "https://footprintiq.app/how-to-remove-your-address-from-google";

const articleMeta = {
  datePublished: "2026-02-12",
  dateModified: "2026-02-12",
  url: PAGE_URL,
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Privacy Guides",
      item: "https://footprintiq.app/privacy-center",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Remove Your Address from Google",
      item: PAGE_URL,
    },
  ],
};

const webPageSchema = buildWebPageSchema({
  name: "How to Remove Your Address from Google Search (Step-by-Step Guide)",
  description:
    "Learn how to remove your home address from Google search results. Includes Google removal forms, GDPR rights, and data broker removal guidance.",
  url: PAGE_URL,
  datePublished: articleMeta.datePublished,
  dateModified: articleMeta.dateModified,
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function RemoveAddressFromGoogle() {
  return (
    <>
      <Helmet>
        <title>How to Remove Your Address from Google Search (Step-by-Step Guide)</title>
        <meta
          name="description"
          content="Learn how to remove your home address from Google search results. Includes Google removal forms, GDPR rights, and data broker removal guidance."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta
          property="og:title"
          content="How to Remove Your Address from Google Search (Step-by-Step Guide)"
        />
        <meta
          property="og:description"
          content="Learn how to remove your home address from Google search results. Includes Google removal forms, GDPR rights, and data broker removal guidance."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://footprintiq.app/og-image.jpg" />
      </Helmet>

      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-6 py-16 text-foreground">
          {/* H1 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            How to Remove Your Home Address from Google Search
          </h1>

          {/* Intro */}
          <p className="text-muted-foreground leading-relaxed mb-4">
            If your home address appears in Google search results, it is most likely because Google
            has indexed content from third-party websites — such as data brokers, public record
            databases, or old directory listings — that publish this information.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Google does not create most personal information listings. It indexes content that
            already exists on other websites. Whether your address can be removed depends on the
            original source, the type of record, and your jurisdiction.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-10">
            This guide explains how to identify where your address is published, how to request
            removal from source websites and from Google, and what legal rights may apply.
          </p>

          {/* Why Your Address Appears */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Why Your Address Appears in Google</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your home address may appear in Google search results for several reasons:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                <strong>Data broker websites</strong> — People-search sites like Spokeo, Whitepages,
                and BeenVerified aggregate public records and publish personal details including
                addresses.
              </li>
              <li>
                <strong>Public records</strong> — Voter registrations, property filings, and
                business registrations are publicly available in many jurisdictions.
              </li>
              <li>
                <strong>Property databases</strong> — Real estate listings, tax assessor records, and
                property transaction databases often include residential addresses.
              </li>
              <li>
                <strong>Cached content</strong> — Even after a page is updated or removed, Google may
                continue to display a cached version for a period of time.
              </li>
              <li>
                <strong>Old directory listings</strong> — Phone directories, professional
                registrations, and archived web pages may still contain outdated address information.
              </li>
            </ul>
          </section>

          {/* Step 1 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Step 1 — Remove the Address at the Source
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The most effective way to remove your address from Google is to remove it from the
              website that originally published it. Google indexes third-party content — if the
              source removes the listing, Google will eventually de-index it.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                Contact data brokers directly and submit opt-out or removal requests through their
                designated forms.
              </li>
              <li>
                Remove listings from people-search sites such as{" "}
                <Link
                  to="/privacy/remove-spokeo"
                  className="text-accent hover:underline"
                >
                  Spokeo
                </Link>
                ,{" "}
                <Link
                  to="/privacy/remove-whitepages"
                  className="text-accent hover:underline"
                >
                  Whitepages
                </Link>
                , and similar platforms.
              </li>
              <li>
                Submit formal removal requests citing applicable privacy regulations where relevant.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              For a comprehensive list of data brokers and how to opt out, see the{" "}
              <Link
                to="/privacy/data-broker-removal-guide"
                className="text-accent hover:underline"
              >
                Data Broker Removal Guide
              </Link>
              .
            </p>
          </section>

          {/* Step 2 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Step 2 — Request Removal from Google
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Google provides a personal information removal request form that allows individuals to
              request de-indexing of URLs containing sensitive personal information, including home
              addresses.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                <strong>Google personal information removal form</strong> — Submit specific URLs
                that display your address for review.
              </li>
              <li>
                <strong>Sensitive personal information policies</strong> — Google may remove content
                that includes personal contact information when it poses a risk of harm.
              </li>
              <li>
                <strong>Doxxing policy</strong> — If your address has been published with intent to
                harass or threaten, Google has specific policies for expedited removal.
              </li>
              <li>
                <strong>De-indexing vs deletion</strong> — Google removal only affects search
                results. It does not delete the content from the original website.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Approval is not guaranteed. Google evaluates each request based on the nature of the
              content, its public interest value, and applicable policies. For more detail, see the{" "}
              <Link
                to="/privacy/google-content-removal"
                className="text-accent hover:underline"
              >
                Google Content Removal Guide
              </Link>
              .
            </p>
          </section>

          {/* UK & EU */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              UK &amp; EU Residents — Right to Erasure
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Under GDPR Article 17, EU and UK residents have the right to request erasure of
              personal data — including home addresses — from search engines and data controllers.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                <strong>Right to be Forgotten</strong> — You can request Google to de-list search
                results that are inadequate, irrelevant, or excessive in relation to their purpose.
              </li>
              <li>
                <strong>Public interest balancing</strong> — Google weighs your privacy rights
                against the public's right to access information. Not all requests are approved.
              </li>
              <li>
                Requests should include the specific URLs, the personal data involved, and the
                reason the content is no longer relevant or necessary.
              </li>
            </ul>
          </section>

          {/* US Residents */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              US Residents — What Can Be Removed?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The United States does not have a federal equivalent to the right to be forgotten.
              However, Google does allow removal of certain categories of sensitive personal
              information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                Government-issued identification numbers (e.g. Social Security numbers, passport
                numbers)
              </li>
              <li>Financial account numbers, credit card details, or bank information</li>
              <li>Medical records or personally identifiable health information</li>
              <li>
                Home addresses when published alongside threats, doxxing, or intent to harass
              </li>
              <li>Handwritten signatures and personal contact information used for fraud</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Publicly available records — such as property filings or voter registrations — may not
              qualify for removal under Google's current policies. Each request is evaluated
              individually.
            </p>
          </section>

          {/* Limitations */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Important Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              It is important to understand the boundaries of what Google removal can achieve:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                Google does not control third-party websites. Removal from search results does not
                delete the content from the original source.
              </li>
              <li>
                Some public records — such as property transactions and court filings — are legally
                required to remain accessible and cannot be removed.
              </li>
              <li>
                Data brokers regularly refresh their databases from public sources. Address listings
                may reappear even after successful removal.
              </li>
              <li>
                Cached or archived versions of pages may persist temporarily even after the live
                page is updated.
              </li>
            </ul>
          </section>

          {/* Structured Removal Workflow */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Structured Removal Workflow</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A structured approach to address removal can help ensure consistency and reduce the
              time spent on individual requests:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                <strong>Identify all broker listings</strong> — Scan multiple data broker sites to
                build a complete picture of where your address is published.
              </li>
              <li>
                <strong>Generate compliant removal templates</strong> — Use standardised templates
                that reference applicable regulations (GDPR, CCPA) to submit consistent requests.
              </li>
              <li>
                <strong>Track submissions</strong> — Maintain a record of submitted requests,
                response timelines, and outcomes for follow-up.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <Link to="/privacy-center" className="text-accent hover:underline">
                Generate a GDPR/CCPA Removal Template →
              </Link>
            </p>
          </section>

          {/* Monitor */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Monitor Your Search Exposure</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Address listings may reappear over time as data brokers refresh their records from
              public sources. Periodic monitoring helps identify new listings early so you can take
              action before they propagate further.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                Exposure scanning helps identify new data broker listings and cached pages that
                reference your address.
              </li>
              <li>
                Regular monitoring reduces long-term exposure by catching new listings before they
                are widely indexed.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <Link to="/scan" className="text-accent hover:underline">
                Run a Username Exposure Scan →
              </Link>
            </p>
          </section>

          <RemovalIsOneStep />

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-muted/30 border border-border/40 rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-semibold text-base">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Legal References */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Legal References</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>GDPR Article 17</strong> — Right to erasure ("right to be forgotten") under
                the General Data Protection Regulation.
              </li>
              <li>
                <strong>UK ICO guidance</strong> — Information Commissioner's Office guidance on the
                right to erasure and search engine de-listing.
              </li>
              <li>
                <strong>Google transparency policy</strong> — Google's policies on content removal,
                personal information, and de-indexing requests.
              </li>
              <li>
                <strong>CCPA overview</strong> — California Consumer Privacy Act provisions for data
                deletion and opt-out rights.
              </li>
            </ul>
          </section>

          <GuideCitationBlock />
        </article>
      </main>

      <Footer />
    </>
  );
}
