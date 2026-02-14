import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  ArrowRight,
  ChevronRight,
  Terminal,
  FileText,
  Mail,
  Globe,
  ShieldCheck,
  Clock,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/data-broker-opt-out-guide";

const webPageSchema = buildWebPageSchema({
  name: "Data Broker Opt-Out Guide — Technical Deep Dive (2026) | FootprintIQ",
  description:
    "A technical, broker-by-broker opt-out reference covering verification methods, request formats, legal frameworks (GDPR/CCPA), response timelines, and re-listing prevention strategies.",
  url: PAGE_URL,
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What legal basis should I cite in a data broker removal request?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For UK/EU residents, cite GDPR Article 17 (Right to Erasure). For California residents, cite CCPA §1798.105 (Right to Delete). For other US states with privacy laws (Virginia CDPA, Colorado CPA, Connecticut CTDPA), cite the equivalent deletion right. Always include your full name, the specific listing URL, and a clear statement that you are exercising your statutory right to deletion.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to verify my identity to opt out of a data broker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most brokers require some form of identity verification. Common methods include email confirmation, providing the URL of your specific listing, answering knowledge-based questions, or uploading government-issued ID. Under GDPR, brokers can request verification but cannot demand disproportionate identification — they must balance verification against data minimisation principles.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between suppression and deletion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Suppression hides your listing from public search results but retains your data internally (often to prevent re-listing from the same source). Deletion removes your data from the broker's database entirely. Some brokers offer only suppression by default. Under GDPR, you can specifically request deletion rather than suppression. Under CCPA, 'deletion' is the standard, though brokers may retain data needed for legal compliance.",
      },
    },
    {
      "@type": "Question",
      name: "How do I handle brokers that don't respond to my opt-out request?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "First, re-submit the request with a clear reference to the applicable law and a deadline. If still ignored: for GDPR, file a complaint with the ICO (UK) or relevant EU Data Protection Authority. For CCPA, file a complaint with the California Attorney General. Document all communication attempts — timestamps, email addresses, and request content. Regulatory complaints carry real weight and brokers typically respond quickly once a supervisory authority is involved.",
      },
    },
    {
      "@type": "Question",
      name: "Can I automate the opt-out process with scripts or APIs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Some brokers offer APIs or structured web forms that can be programmatically accessed, but most opt-out flows include CAPTCHAs, email verification loops, or manual review steps that resist automation. Automated scraping of broker sites may also violate their Terms of Service. Paid removal services (DeleteMe, Optery, Kanary) handle this at scale. FootprintIQ focuses on the discovery and prioritisation layer — mapping where you're listed so you can target removals efficiently.",
      },
    },
    {
      "@type": "Question",
      name: "How do I prevent re-listing after a successful removal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can't fully prevent re-listing because brokers continuously ingest data from public records and commercial sources. However, you can reduce the likelihood by: (1) freezing your credit with all three bureaus, (2) opting out of pre-screened credit offers, (3) removing your information from voter registration public access where possible, (4) using a PO Box or mail forwarding service for public-facing addresses, and (5) running regular monitoring scans to catch re-listings early.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Privacy Resources", item: "https://footprintiq.app/privacy-centre" },
    { "@type": "ListItem", position: 3, name: "Data Broker Opt-Out Guide", item: PAGE_URL },
  ],
};

interface BrokerEntry {
  name: string;
  optOutUrl: string;
  method: string;
  verification: string;
  timeline: string;
  legalBasis: string;
  notes: string;
}

const brokerDirectory: BrokerEntry[] = [
  {
    name: "Spokeo",
    optOutUrl: "https://www.spokeo.com/optout",
    method: "Web form + email confirmation",
    verification: "Listing URL + email",
    timeline: "24–48 hours",
    legalBasis: "CCPA §1798.105",
    notes: "Must provide the exact listing URL. Confirmation email expires after 72 hours.",
  },
  {
    name: "BeenVerified",
    optOutUrl: "https://www.beenverified.com/app/optout/search",
    method: "Web form + email confirmation",
    verification: "Search + select profile + email",
    timeline: "24 hours – 7 days",
    legalBasis: "CCPA §1798.105",
    notes: "Search for your record first, then request removal. May require multiple attempts for duplicate listings.",
  },
  {
    name: "MyLife",
    optOutUrl: "https://www.mylife.com/privacy-policy#opt-out",
    method: "Phone call or email request",
    verification: "Phone verification or email + ID",
    timeline: "7–14 days",
    legalBasis: "CCPA §1798.105",
    notes: "Known for aggressive upselling during phone opt-out. Email to privacy@mylife.com is often more effective.",
  },
  {
    name: "Whitepages",
    optOutUrl: "https://www.whitepages.com/suppression-requests",
    method: "Web form + phone verification",
    verification: "Phone call with automated code",
    timeline: "24–48 hours",
    legalBasis: "CCPA §1798.105",
    notes: "Suppression only (not full deletion). Re-listing from new sources is common. Check quarterly.",
  },
  {
    name: "Radaris",
    optOutUrl: "https://radaris.com/control/privacy",
    method: "Web form (account required)",
    verification: "Account creation + email",
    timeline: "2–7 days",
    legalBasis: "CCPA §1798.105 / GDPR Art. 17",
    notes: "Requires creating an account to opt out — a common dark pattern. Use a disposable email if possible.",
  },
  {
    name: "PeopleFinder",
    optOutUrl: "https://www.peoplefinder.com/optout",
    method: "Web form + email confirmation",
    verification: "Listing URL + email",
    timeline: "3–5 days",
    legalBasis: "CCPA §1798.105",
    notes: "Often shares data with affiliated sites. Opt out of Intelius and ZabaSearch simultaneously.",
  },
  {
    name: "Intelius",
    optOutUrl: "https://www.intelius.com/opt-out",
    method: "Web form + email confirmation",
    verification: "Profile selection + email",
    timeline: "3–7 days",
    legalBasis: "CCPA §1798.105",
    notes: "Parent company of multiple broker sites. Removing from Intelius may not remove from subsidiaries automatically.",
  },
  {
    name: "TruePeopleSearch",
    optOutUrl: "https://www.truepeoplesearch.com/removal",
    method: "Web form (no account needed)",
    verification: "CAPTCHA only",
    timeline: "24–72 hours",
    legalBasis: "CCPA §1798.105",
    notes: "One of the easier opt-outs. No email verification required. Confirm removal after 72 hours.",
  },
];

const DataBrokerOptOutGuide = () => {
  return (
    <>
      <Helmet>
        <title>Data Broker Opt-Out Guide — Technical Deep Dive (2026) | FootprintIQ</title>
        <meta
          name="description"
          content="Broker-by-broker opt-out reference with verification methods, request formats, GDPR/CCPA legal frameworks, response timelines, and re-listing prevention."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Data Broker Opt-Out Guide — Technical Deep Dive (2026)" />
        <meta property="og:description" content="Detailed technical reference for removing yourself from every major data broker." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link to="/privacy-centre" className="hover:text-foreground transition-colors">Privacy Resources</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Data Broker Opt-Out Guide</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Technical Reference</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Data Broker Opt-Out{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Technical Guide
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Broker-by-broker opt-out reference with verification methods, legal frameworks, request templates, timelines, and re-listing prevention strategies.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Scan to Find Your Listings
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Legal Frameworks ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Legal Frameworks for Removal Requests</h2>
            </div>
            <p>
              Your legal right to request data deletion depends on your jurisdiction. Understanding the applicable law strengthens your request and gives brokers less room to delay or refuse.
            </p>

            <div className="not-prose grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">GDPR (UK / EU)</h3>
                <ul className="text-sm text-muted-foreground space-y-2 mt-3">
                  <li>• <strong>Article 17</strong> — Right to Erasure</li>
                  <li>• <strong>Article 21</strong> — Right to Object to processing</li>
                  <li>• 30-day response deadline (mandatory)</li>
                  <li>• Complaint route: ICO (UK) or national DPA (EU)</li>
                  <li>• Applies to any organisation processing EU/UK residents' data, regardless of where the broker is based</li>
                </ul>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">CCPA (California)</h3>
                <ul className="text-sm text-muted-foreground space-y-2 mt-3">
                  <li>• <strong>§1798.105</strong> — Right to Delete</li>
                  <li>• <strong>§1798.120</strong> — Right to Opt Out of Sale</li>
                  <li>• 45-day response deadline (+45-day extension)</li>
                  <li>• Complaint route: California Attorney General</li>
                  <li>• Applies to businesses meeting revenue/data thresholds processing CA residents' data</li>
                </ul>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">State Privacy Laws (US)</h3>
                <ul className="text-sm text-muted-foreground space-y-2 mt-3">
                  <li>• Virginia CDPA, Colorado CPA, Connecticut CTDPA</li>
                  <li>• Texas TDPSA, Oregon OCPA, Montana MCDPA</li>
                  <li>• All include deletion rights with varying timelines</li>
                  <li>• Check your state's specific statute and AG office</li>
                </ul>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">No Applicable Law?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 mt-3">
                  <li>• Most brokers still honour opt-out requests voluntarily</li>
                  <li>• Frame request as "opt-out of data sale" where possible</li>
                  <li>• Reference the broker's own privacy policy terms</li>
                  <li>• Persistence and documentation are your strongest tools</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Request Templates ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Opt-Out Request Templates</h2>
            </div>
            <p>
              When a broker requires an email request rather than a web form, use a structured template that cites the applicable law and includes all necessary identifiers. Below are templates for the two most common frameworks.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3">GDPR Erasure Request</h3>
            <div className="not-prose">
              <pre className="bg-muted/50 border border-border/50 rounded-xl p-5 text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`Subject: Data Erasure Request — GDPR Article 17

To whom it may concern,

I am writing to exercise my right to erasure under Article 17 of the
UK/EU General Data Protection Regulation (GDPR).

I request that you delete all personal data you hold about me,
including but not limited to:

  Full name: [Your Name]
  Listing URL: [URL of your profile on their site]
  Email address: [Your Email]
  Associated addresses or phone numbers: [if applicable]

Please confirm deletion within 30 days as required by law.
If you are unable to comply, please provide a written explanation
citing the specific legal exemption under Article 17(3).

I reserve the right to file a complaint with the Information
Commissioner's Office (ICO) if this request is not fulfilled
within the statutory timeframe.

Regards,
[Your Name]`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-3">CCPA Deletion Request</h3>
            <div className="not-prose">
              <pre className="bg-muted/50 border border-border/50 rounded-xl p-5 text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`Subject: Consumer Data Deletion Request — CCPA §1798.105

To whom it may concern,

Pursuant to the California Consumer Privacy Act (CCPA), specifically
Civil Code §1798.105, I am requesting deletion of all personal
information your organisation has collected about me.

Additionally, under §1798.120, I opt out of any sale of my personal
information.

  Full name: [Your Name]
  Listing URL: [URL of your profile on their site]
  Email: [Your Email]
  State of residence: California

Please confirm deletion within 45 days as required by law.

Regards,
[Your Name]`}
              </pre>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              <strong>Tip:</strong> Always send from an email address associated with your listing. BCC yourself and save a copy with a timestamp for your records. If the broker doesn't respond within the statutory deadline, this documentation supports a regulatory complaint.
            </p>
          </div>
        </section>

        {/* ── Broker Directory ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Globe className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Broker-by-Broker Opt-Out Directory</h2>
            </div>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              Technical reference for the most common data brokers. Each entry includes the opt-out mechanism, verification requirements, expected timeline, and operational notes.
            </p>

            <div className="space-y-4">
              {brokerDirectory.map((broker) => (
                <div
                  key={broker.name}
                  className="bg-card border border-border/50 rounded-xl p-6 hover:border-accent/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h3 className="text-xl font-bold">{broker.name}</h3>
                    <a
                      href={broker.optOutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline break-all"
                    >
                      {broker.optOutUrl.replace("https://", "")}
                    </a>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Method</span>
                      <span className="font-medium">{broker.method}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Verification</span>
                      <span className="font-medium">{broker.verification}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Timeline</span>
                      <span className="font-medium">{broker.timeline}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Legal Basis</span>
                      <span className="font-medium">{broker.legalBasis}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 border-t border-border/30 pt-3">
                    <strong>Notes:</strong> {broker.notes}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              For step-by-step walkthroughs, see:
              {" "}<Link to="/remove-spokeo-profile" className="text-accent hover:underline">Spokeo</Link>,
              {" "}<Link to="/remove-beenverified-profile" className="text-accent hover:underline">BeenVerified</Link>,
              {" "}<Link to="/remove-mylife-profile" className="text-accent hover:underline">MyLife</Link>.
            </p>
          </div>
        </section>

        {/* ── Re-listing Prevention ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <RefreshCw className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Preventing Re-Listing</h2>
            </div>
            <p>
              Removal is not permanent. Brokers continuously ingest data from public records, commercial databases, and each other. A successful opt-out today doesn't prevent re-listing next quarter from a different source. Here's how to reduce the probability:
            </p>
            <ul>
              <li><strong>Freeze your credit</strong> with Equifax, Experian, and TransUnion. This limits the data available to brokers from credit reporting sources.</li>
              <li><strong>Opt out of pre-screened offers</strong> via <a href="https://www.optoutprescreen.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">OptOutPrescreen.com</a> to reduce commercial data sharing.</li>
              <li><strong>Limit public records exposure</strong> where possible — use a PO Box for voter registration, business filings, and property records where your jurisdiction allows it.</li>
              <li><strong>Monitor regularly</strong> — the single most effective strategy. Run periodic scans to catch re-listings early, before the data propagates to downstream brokers. FootprintIQ's <Link to="/best-way-to-monitor-your-online-exposure" className="text-accent hover:underline">continuous monitoring</Link> automates this process.</li>
              <li><strong>Document everything</strong> — maintain a spreadsheet or log of opt-out requests with dates, confirmation emails, and follow-up status. This record is essential if you need to escalate to a regulator.</li>
            </ul>

            <div className="not-prose bg-card border border-accent/20 rounded-xl p-6 my-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Suppression ≠ Deletion</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Some brokers (notably Whitepages) use "suppression" rather than deletion — your listing is hidden from search results but your data is retained internally. Under GDPR, you can specifically request deletion rather than suppression. Under CCPA, request confirmation that data has been deleted, not merely suppressed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Verification & Tracking ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Tracking & Verifying Removals</h2>
            </div>
            <p>
              Submitting a request is only half the process. You need to verify that data was actually removed and track the status of each request. Here's a systematic approach:
            </p>

            <div className="not-prose my-8">
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/50">
                      <th className="p-4 text-left font-semibold text-muted-foreground">Field</th>
                      <th className="p-4 text-left font-semibold text-muted-foreground">What to Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    <tr><td className="p-4 font-medium">Broker name</td><td className="p-4 text-muted-foreground">e.g. Spokeo, BeenVerified</td></tr>
                    <tr><td className="p-4 font-medium">Listing URL</td><td className="p-4 text-muted-foreground">Full URL of your profile before removal</td></tr>
                    <tr><td className="p-4 font-medium">Request date</td><td className="p-4 text-muted-foreground">Date opt-out was submitted</td></tr>
                    <tr><td className="p-4 font-medium">Method used</td><td className="p-4 text-muted-foreground">Web form / email / phone / postal</td></tr>
                    <tr><td className="p-4 font-medium">Confirmation received</td><td className="p-4 text-muted-foreground">Yes/No + confirmation email/reference ID</td></tr>
                    <tr><td className="p-4 font-medium">Expected timeline</td><td className="p-4 text-muted-foreground">Broker-stated processing time</td></tr>
                    <tr><td className="p-4 font-medium">Verification date</td><td className="p-4 text-muted-foreground">Date you checked the listing was actually removed</td></tr>
                    <tr><td className="p-4 font-medium">Status</td><td className="p-4 text-muted-foreground">Submitted / Confirmed / Removed / Re-listed</td></tr>
                    <tr><td className="p-4 font-medium">Next re-check</td><td className="p-4 text-muted-foreground">Scheduled date for follow-up verification</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p>
              FootprintIQ's <Link to="/privacy-centre" className="text-accent hover:underline">Privacy Centre</Link> provides built-in removal request tracking with status management, re-check scheduling, and GDPR/CCPA template generation — eliminating the need for manual spreadsheets.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Technical FAQ
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.name}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.acceptedAnswer.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Map Your Exposure Before You Start Opting Out
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a free scan to discover which brokers and platforms list your information — then use this guide to systematically remove yourself.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Run Your Free Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/how-to-remove-yourself-from-data-brokers">Beginner Guide</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default DataBrokerOptOutGuide;
