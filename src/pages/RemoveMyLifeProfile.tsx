import { Helmet } from "react-helmet-async";
import { RemovalIsOneStep } from "@/components/privacy/RemovalIsOneStep";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, FileText, AlertTriangle, CheckCircle, Globe, Scale, ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "How do I remove my profile from MyLife?",
    answer:
      "You can request removal by visiting MyLife's opt-out page, verifying your identity, and submitting a deletion request. Alternatively, you can submit a written GDPR or CCPA request via email. This guide walks through both approaches step by step.",
  },
  {
    question: "Does MyLife have to delete my data under GDPR?",
    answer:
      "If you are a resident of the EU/EEA or the UK, you have the right to request erasure of your personal data under Article 17 of the GDPR. MyLife must respond within 30 days. If they fail to comply, you can escalate to your local data protection authority.",
  },
  {
    question: "Can I remove my MyLife profile under CCPA?",
    answer:
      "Yes. If you are a California resident, the California Consumer Privacy Act (CCPA) grants you the right to request deletion of your personal information. MyLife is required to honour verified requests within 45 days.",
  },
  {
    question: "Will my MyLife profile come back after removal?",
    answer:
      "It is possible. People-search sites like MyLife aggregate data from public records and may re-list your information over time. Periodic monitoring and re-submission of removal requests may be necessary.",
  },
  {
    question: "Is it safe to verify my identity on MyLife's opt-out page?",
    answer:
      "MyLife's opt-out process may ask you to confirm personal details. Only provide the minimum information required to identify your listing. Never share passwords, financial information, or government ID numbers during an opt-out process.",
  },
  {
    question: "How long does MyLife take to process a removal request?",
    answer:
      "Processing times vary. Manual opt-out requests are typically processed within a few days. GDPR and CCPA requests have legal deadlines of 30 and 45 days respectively. If you do not receive confirmation, follow up in writing.",
  },
  {
    question: "What information does MyLife show about me?",
    answer:
      "MyLife profiles may include your full name, age, current and previous addresses, phone numbers, email addresses, relatives, associates, and a 'reputation score.' All data is aggregated from publicly available sources and third-party databases.",
  },
  {
    question: "Can I remove my MyLife reputation score?",
    answer:
      "MyLife's reputation score is generated from aggregated public data. Submitting a full profile removal request should also remove the associated score. If the score persists after profile deletion, follow up with a written request referencing the original removal confirmation.",
  },
  {
    question: "Does MyLife charge a fee to remove my profile?",
    answer:
      "Submitting a removal request to MyLife is free. You should not need to pay or create an account to opt out. If you encounter a paywall during the opt-out process, use the GDPR or CCPA email template approach instead.",
  },
  {
    question: "Can I remove someone else's profile from MyLife?",
    answer:
      "Generally, removal requests must be submitted by the data subject (the person whose data is listed) or an authorised representative. Submitting requests on behalf of someone else without their consent may not be honoured by the broker.",
  },
  {
    question: "What should I do if MyLife ignores my removal request?",
    answer:
      "Document all correspondence including dates, confirmation numbers, and screenshots. If MyLife does not respond within the legally required timeframe, you can file a complaint with your local data protection authority (e.g., ICO for UK residents) or the California Attorney General for CCPA matters.",
  },
  {
    question: "Does removing my MyLife profile affect other data brokers?",
    answer:
      "No. Each data broker operates independently. Removing your profile from MyLife does not affect your listings on Spokeo, BeenVerified, Whitepages, or other sites. You need to submit separate requests to each broker.",
  },
];

const faqJsonLd = {
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

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Remove Your MyLife Profile (GDPR & CCPA Guide)",
  description:
    "Step-by-step guide to removing your MyLife listing. Includes GDPR/CCPA template and manual opt-out instructions.",
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
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://footprintiq.app/guides" },
    { "@type": "ListItem", position: 3, name: "Remove MyLife Profile", item: "https://footprintiq.app/remove-mylife-profile" },
  ],
};

const webPageSchema = buildWebPageSchema({
  name: "How to Remove Your MyLife Profile (GDPR & CCPA Guide)",
  description: "Step-by-step guide to removing your MyLife listing. Includes GDPR/CCPA template and manual opt-out instructions.",
  url: "https://footprintiq.app/remove-mylife-profile",
});

export default function RemoveMyLifeProfile() {
  return (
    <>
      <Helmet>
        <title>How to Remove Your MyLife Profile (GDPR &amp; CCPA Guide)</title>
        <meta
          name="description"
          content="Step-by-step guide to removing your MyLife listing. Includes GDPR/CCPA template and manual opt-out instructions."
        />
        <link rel="canonical" href="https://footprintiq.app/remove-mylife-profile" />
        <meta property="og:title" content="How to Remove Your MyLife Profile (GDPR & CCPA Guide)" />
        <meta property="og:description" content="Step-by-step guide to removing your MyLife listing. Includes GDPR/CCPA template and manual opt-out instructions." />
        <meta property="og:url" content="https://footprintiq.app/remove-mylife-profile" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Remove Your MyLife Profile (GDPR & CCPA Guide)" />
        <meta name="twitter:description" content="Step-by-step guide to removing your MyLife listing. Includes GDPR/CCPA template and manual opt-out instructions." />
        <meta property="og:image" content="https://footprintiq.app/og-image.jpg" />
        <meta property="og:site_name" content="FootprintIQ" />
      </Helmet>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto px-6 pt-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/guides" className="hover:text-primary transition-colors">Guides</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">Remove MyLife Profile</li>
          </ol>
        </nav>

        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero */}
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How to Remove Your MyLife Profile
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              A step-by-step guide to removing your listing from MyLife.com using manual opt-out, GDPR, or CCPA requests.
            </p>
          </header>

          {/* Section: What Is MyLife */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">What Is MyLife?</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                MyLife is a people-search website that aggregates publicly available information — including names, addresses, phone numbers, and reputation scores — from public records, social media, and other data sources.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Many people discover their MyLife profiles unexpectedly, often through a search engine result. If you've found your information listed on MyLife and want it removed, this guide explains your options.
              </p>
            </div>
          </section>

          {/* Section: Manual Opt-Out */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Manual Opt-Out Process</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                MyLife provides an opt-out mechanism. Follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>Visit the MyLife website and locate your profile using the search function.</li>
                <li>Look for the opt-out or removal link, typically found in the site's privacy policy or footer.</li>
                <li>Verify your identity using the minimum information required (e.g., name, email).</li>
                <li>Submit the opt-out request and note any confirmation or reference number.</li>
                <li>Check back after 7–14 days to confirm your listing has been removed.</li>
              </ol>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Only provide the minimum personal details needed to identify your listing. Never share passwords, financial data, or government-issued IDs.
                </p>
              </div>
            </div>
          </section>

          {/* Section: GDPR Removal */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">GDPR Removal Request</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the EU, EEA, or UK, the General Data Protection Regulation (GDPR) grants you the right to request erasure of your personal data under Article 17.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To exercise this right, send a written request to MyLife's data protection contact or privacy email address. Include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your full name and the URL of your MyLife profile</li>
                <li>A clear statement that you are exercising your right to erasure under GDPR Article 17</li>
                <li>Your country of residence</li>
                <li>A request for confirmation of deletion within 30 days</li>
              </ul>
              <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  FootprintIQ's <Link to="/privacy-centre" className="text-accent hover:underline">Privacy Centre</Link> can generate a GDPR removal template pre-filled with your details for brokers like MyLife.
                </p>
              </div>
            </div>
          </section>

          {/* Section: CCPA Removal */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">CCPA Removal Request</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                California residents have the right to request deletion of personal information under the California Consumer Privacy Act (CCPA). MyLife must process verified requests within 45 days.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your request should include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your full name and profile URL</li>
                <li>A statement that you are a California resident exercising your CCPA rights</li>
                <li>A request to delete all personal information held about you</li>
                <li>A request for written confirmation of deletion</li>
              </ul>
            </div>
          </section>

          {/* Section: What to Do If Removal Fails */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">What to Do If Removal Fails</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If your removal request is ignored or denied, you have several escalation options:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>GDPR:</strong> File a complaint with your local Data Protection Authority (DPA).</li>
                <li><strong>CCPA:</strong> Report the violation to the California Attorney General's office.</li>
                <li><strong>Follow up:</strong> Send a second written request referencing your original submission date and any reference numbers.</li>
                <li><strong>Document everything:</strong> Keep copies of all correspondence, screenshots, and timestamps.</li>
              </ul>
            </div>
          </section>

          {/* Section: Ongoing Monitoring */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Ongoing Monitoring</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                People-search sites frequently re-list profiles using newly aggregated public records. After successful removal, consider:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Running periodic scans to check if your information has been re-listed</li>
                <li>Setting up alerts for your name across search engines</li>
                <li>Reviewing other data broker sites that may hold similar information</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                FootprintIQ's <Link to="/scan" className="text-accent hover:underline">username scan</Link> can help identify where your information appears across public sources.
              </p>
            </div>
          </section>

          <RemovalIsOneStep />

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="group bg-gradient-card border border-border/50 hover:border-accent/50 rounded-2xl px-8 shadow-sm hover:shadow-[0_0_20px_rgba(0,230,230,0.1)] transition-all duration-300"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* See Also */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/privacy-centre"
                className="group bg-card border border-border/50 hover:border-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-accent transition-colors">Privacy Centre</h3>
                    <p className="text-sm text-muted-foreground mt-1">Generate removal templates and track broker opt-outs</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
              <Link
                to="/scan"
                className="group bg-card border border-border/50 hover:border-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-accent transition-colors">Username Scan</h3>
                    <p className="text-sm text-muted-foreground mt-1">Check where your username appears across public sources</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            </div>
          </section>

          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-4">Related Data Broker Removal Guides</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><Link to="/data-broker-removal-guide" className="text-accent hover:underline">Complete Data Broker Removal Guide</Link></li>
              <li><Link to="/privacy-centre" className="text-accent hover:underline">Privacy Centre – Templates & Tracking</Link></li>
              <li><Link to="/remove-spokeo-profile" className="text-accent hover:underline">How to Remove Your Spokeo Profile</Link></li>
              <li><Link to="/remove-beenverified-profile" className="text-accent hover:underline">How to Remove Your BeenVerified Profile</Link></li>
              <li><Link to="/incogni-vs-diy-data-removal" className="text-accent hover:underline">Incogni vs DIY Data Removal – Comparison</Link></li>
            </ul>
          </section>

          <GuideCitationBlock />
        </article>
      </main>

      <Footer />
    </>
  );
}
