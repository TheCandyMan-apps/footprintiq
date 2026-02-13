import { Helmet } from "react-helmet-async";
import { ChecklistDownloadCallout } from "@/components/resources/ChecklistDownloadCallout";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { PrivacyBreadcrumb } from "@/components/privacy/PrivacyBreadcrumb";
import { RelatedPrivacyGuides } from "@/components/privacy/RelatedPrivacyGuides";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, AlertTriangle, Shield, FileText, Globe, Clock } from "lucide-react";

const PAGE_URL = "https://footprintiq.app/resources/2026-data-broker-removal-checklist";
const DATE_PUBLISHED = "2026-02-12";
const DATE_MODIFIED = "2026-02-12";

const faqs = [
  {
    q: "How long does it take to remove my data from data brokers?",
    a: "Most data broker opt-out requests take between 7 and 45 days to process. Some brokers respond within 72 hours, while others may require follow-up. The full process across all brokers typically takes 2–3 months when done manually.",
  },
  {
    q: "Do I need to pay to remove my data from people search sites?",
    a: "No. The majority of data brokers are legally required to honour free opt-out requests. Some brokers make the process more difficult to discourage removal, but payment is not required in most cases.",
  },
  {
    q: "Will my data come back after I remove it?",
    a: "Yes, it often does. Data brokers continuously aggregate information from public records, marketing databases, and other sources. Removal is not permanent — periodic re-checking every 60–90 days is recommended.",
  },
  {
    q: "What is the difference between Google removal and data broker removal?",
    a: "Google removal de-indexes a page from search results, but the original listing may still exist on the data broker's website. Data broker removal deletes the listing at the source. Both steps are often needed for complete removal.",
  },
  {
    q: "Can I use GDPR to remove my data from US-based brokers?",
    a: "GDPR applies to organisations that process data of EU/UK residents, regardless of where the company is based. However, enforcement against US-based brokers can be difficult. Filing a complaint with your national data protection authority (e.g. the ICO in the UK) is the recommended escalation path.",
  },
  {
    q: "What is the CCPA and how does it help with data removal?",
    a: "The California Consumer Privacy Act (CCPA) gives California residents the right to request deletion of personal information held by businesses. Several other US states have enacted similar laws. Eligibility depends on residency and the broker's jurisdiction.",
  },
  {
    q: "How do I know which data brokers have my information?",
    a: "You can manually search major people-search sites using your name, phone number, or email address. Alternatively, a structured exposure scan can identify listings across multiple brokers simultaneously, saving significant time.",
  },
  {
    q: "Is it worth using a paid service for data broker removal?",
    a: "Paid services automate the opt-out process and handle re-listing monitoring. They are most useful for individuals who lack time for manual submissions or who have data spread across many brokers. DIY removal is effective but requires ongoing effort.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The 2026 Data Broker Removal Checklist",
  description:
    "A structured checklist covering Google removal, data broker opt-outs, GDPR erasure requests, and exposure monitoring.",
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
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  url: PAGE_URL,
  inLanguage: "en",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Privacy Resources", item: "https://footprintiq.app/privacy-centre" },
    { "@type": "ListItem", position: 3, name: "2026 Data Broker Removal Checklist", item: PAGE_URL },
  ],
};

const webPageSchema = buildWebPageSchema({
  name: "The 2026 Data Broker Removal Checklist",
  description:
    "A structured checklist covering Google removal, data broker opt-outs, GDPR erasure requests, and exposure monitoring.",
  url: PAGE_URL,
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  lastReviewed: DATE_MODIFIED,
});

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function SectionHeading({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
      <Icon className="w-6 h-6 text-accent shrink-0" />
      {children}
    </h2>
  );
}

const relatedLinks = [
  { label: "Remove Personal Information from Google", to: "/privacy/google-content-removal" },
  { label: "Data Broker Removal Guide", to: "/privacy/data-broker-removal-guide" },
  { label: "Remove Your Address from Google", to: "/how-to-remove-your-address-from-google" },
  { label: "Remove Spokeo Listing", to: "/remove-spokeo-profile" },
  { label: "Ethical OSINT Principles", to: "/ethical-osint-principles" },
];

export default function DataBrokerRemovalChecklist2026() {
  return (
    <>
      <Helmet>
        <title>The 2026 Data Broker Removal Checklist | Step-by-Step Privacy Workflow</title>
        <meta
          name="description"
          content="A structured checklist covering Google removal, data broker opt-outs, GDPR erasure requests, and exposure monitoring."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="The 2026 Data Broker Removal Checklist | Step-by-Step Privacy Workflow" />
        <meta
          property="og:description"
          content="A structured checklist covering Google removal, data broker opt-outs, GDPR erasure requests, and exposure monitoring."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={webPageSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <main className="min-h-screen bg-background">
        <article className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <PrivacyBreadcrumb currentPage="2026 Data Broker Removal Checklist" />

          <header className="mb-12">
            <p className="text-sm font-medium text-accent mb-3">2026 Edition</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              A Step-by-Step Workflow for Data Broker Opt-Outs and Privacy Requests
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A structured workflow for reducing online exposure across search engines and data brokers.
            </p>
          </header>

          <section className="prose prose-lg max-w-none text-muted-foreground leading-relaxed mb-8">
            <p>
              This checklist provides a step-by-step workflow for identifying, removing, and monitoring personal
              information across public search results and data broker platforms. It is designed for individuals and
              professionals who want a structured, repeatable process for managing digital exposure.
            </p>
          </section>

          <ChecklistDownloadCallout />

          {/* SECTION 1 */}
          <SectionHeading icon={Globe}>1. Identify Where Your Data Appears</SectionHeading>
          <ul className="space-y-3 text-muted-foreground">
            <CheckItem>Search for your full name on major people-search sites (Spokeo, BeenVerified, Whitepages, Radaris, MyLife)</CheckItem>
            <CheckItem>Run Google searches using patterns: "your name" + city, phone number, email address</CheckItem>
            <CheckItem>Check for home address exposure on property record and voter registration aggregators</CheckItem>
            <CheckItem>Search your phone number across reverse-lookup directories</CheckItem>
            <CheckItem>Review cached and archived versions of pages using Google cache and the Wayback Machine</CheckItem>
            <CheckItem>Check public records databases for court filings, licences, and professional registrations</CheckItem>
          </ul>

          {/* SECTION 2 */}
          <SectionHeading icon={FileText}>2. Remove Data at the Source</SectionHeading>
          <p className="text-muted-foreground mb-4">
            For each data broker listing identified, follow this structured removal workflow:
          </p>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Locate the specific listing page containing your personal information</li>
            <li>Confirm the listing matches your identity (name, location, associated records)</li>
            <li>Document the full URL and take a screenshot for your records</li>
            <li>Navigate to the broker's opt-out or removal request page and submit the request</li>
            <li>Save any confirmation email, reference number, or tracking ID</li>
            <li>Record the submission date and expected processing timeline in your tracking system</li>
          </ol>

          {/* SECTION 3 */}
          <SectionHeading icon={Shield}>3. Submit Google Removal Requests</SectionHeading>
          <p className="text-muted-foreground mb-4">
            Even after a data broker removes your listing, the page may remain indexed in Google search results.
            Google provides a dedicated form for requesting removal of sensitive personal information.
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <CheckItem>Use Google's "Remove sensitive personal information" request form</CheckItem>
            <CheckItem>Understand the difference: de-indexing removes the page from search results, but does not delete the content from the source website</CheckItem>
            <CheckItem>Prepare screenshot evidence showing the personal information visible on the page</CheckItem>
            <CheckItem>Track each submission using Google's case reference system</CheckItem>
          </ul>
          <p className="text-muted-foreground mt-4">
            For a detailed walkthrough, see our guide:{" "}
            <Link
              to="/how-to-remove-your-address-from-google"
              className="text-accent hover:underline font-medium"
            >
              How to Remove Your Address from Google
            </Link>
            .
          </p>

          {/* SECTION 4 */}
          <SectionHeading icon={Shield}>4. UK &amp; EU Rights (GDPR Article 17)</SectionHeading>
          <p className="text-muted-foreground mb-4">
            If you are a UK or EU resident, the General Data Protection Regulation provides the Right to Erasure
            under Article 17. This applies to any organisation processing your personal data, regardless of where
            they are based.
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <CheckItem>
              <strong>Right to Erasure:</strong> You can request deletion of personal data where there is no compelling
              reason for continued processing
            </CheckItem>
            <CheckItem>
              <strong>Balancing test:</strong> The controller must weigh your privacy rights against any legitimate
              interest in retaining the data (e.g. public interest, journalistic use)
            </CheckItem>
            <CheckItem>
              <strong>ICO complaint escalation:</strong> If the organisation does not respond within one month, you can
              escalate by filing a complaint with the Information Commissioner's Office (UK) or your national data
              protection authority
            </CheckItem>
          </ul>

          {/* SECTION 5 */}
          <SectionHeading icon={Shield}>5. US Privacy Rights (CCPA / State Laws)</SectionHeading>
          <p className="text-muted-foreground mb-4">
            Several US states have enacted consumer privacy laws that include deletion rights, most notably the
            California Consumer Privacy Act (CCPA).
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <CheckItem>
              <strong>Identity verification:</strong> Brokers may require you to verify your identity before processing
              a deletion request — typically via email confirmation or government ID
            </CheckItem>
            <CheckItem>
              <strong>Scope limitations:</strong> CCPA applies to businesses meeting specific revenue or data-volume
              thresholds. Smaller brokers may not be covered
            </CheckItem>
            <CheckItem>
              <strong>State law variation:</strong> Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), and other
              states have their own data privacy laws with varying scope and enforcement mechanisms
            </CheckItem>
          </ul>

          {/* SECTION 6 */}
          <SectionHeading icon={Clock}>6. Prevent Reappearance</SectionHeading>
          <p className="text-muted-foreground mb-4">
            Data removal is not a one-time event. Brokers continuously re-aggregate personal information from
            public records, marketing lists, and other data sources.
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <CheckItem>
              <strong>60–90 day review cycle:</strong> Re-check all previously identified brokers every 60–90 days to
              catch re-listings
            </CheckItem>
            <CheckItem>
              <strong>Monitoring strategy:</strong> Set calendar reminders or use a structured monitoring workflow to
              ensure consistent follow-up
            </CheckItem>
            <CheckItem>
              <strong>Structured tracking system:</strong> Maintain a spreadsheet or database to log every broker,
              submission date, status, and next review date
            </CheckItem>
          </ul>
          <p className="text-muted-foreground mt-6 p-4 rounded-xl border border-accent/20 bg-accent/5">
            Use a{" "}
            <Link to="/" className="text-accent hover:underline font-medium">
              structured exposure scan
            </Link>{" "}
            to identify new listings as they appear across public sources.
          </p>

          {/* SECTION 7 */}
          <SectionHeading icon={FileText}>7. Tracking Template</SectionHeading>
          <p className="text-muted-foreground mb-4">
            Use a table like the one below to track every removal request. Consistent tracking is the difference
            between a one-off effort and a reliable privacy workflow.
          </p>
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broker</TableHead>
                  <TableHead>Listing URL</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Follow-Up Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground">Spokeo</TableCell>
                  <TableCell className="text-muted-foreground text-xs">spokeo.com/John-Doe/abc123</TableCell>
                  <TableCell className="text-muted-foreground">2026-02-10</TableCell>
                  <TableCell className="text-muted-foreground">Submitted</TableCell>
                  <TableCell className="text-muted-foreground">2026-03-10</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">BeenVerified</TableCell>
                  <TableCell className="text-muted-foreground text-xs">beenverified.com/optout</TableCell>
                  <TableCell className="text-muted-foreground">2026-02-11</TableCell>
                  <TableCell className="text-muted-foreground">Pending</TableCell>
                  <TableCell className="text-muted-foreground">2026-03-11</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Whitepages</TableCell>
                  <TableCell className="text-muted-foreground text-xs">whitepages.com/removal</TableCell>
                  <TableCell className="text-muted-foreground">2026-02-08</TableCell>
                  <TableCell className="text-muted-foreground">Confirmed</TableCell>
                  <TableCell className="text-muted-foreground">2026-04-08</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* SECTION 8 */}
          <SectionHeading icon={AlertTriangle}>8. Common Mistakes</SectionHeading>
          <ul className="space-y-3 text-muted-foreground">
            <CheckItem>
              <strong>Removing from Google only:</strong> De-indexing a page does not delete the listing. The data
              remains on the broker's site and can be re-indexed
            </CheckItem>
            <CheckItem>
              <strong>Ignoring smaller brokers:</strong> Niche and regional data aggregators often fly under the radar
              but can still expose sensitive personal information
            </CheckItem>
            <CheckItem>
              <strong>Not tracking requests:</strong> Without a systematic log, it is easy to lose track of which
              brokers have been contacted and which require follow-up
            </CheckItem>
            <CheckItem>
              <strong>Assuming removal is permanent:</strong> Data brokers re-aggregate information continuously.
              Periodic monitoring is essential to maintain privacy
            </CheckItem>
          </ul>

          {/* FAQ */}
          <section className="mt-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-muted/30 border border-border/50 rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-semibold">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Related Guides */}
          <RelatedPrivacyGuides links={relatedLinks} />

          {/* Footer Authority Block */}
          <GuideCitationBlock />

          <div className="mt-8 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Maintained by FootprintIQ, an ethical OSINT exposure awareness platform focused on structured digital
              footprint analysis.
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
