import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Shield, Eye, Ban, CheckCircle2, XCircle, Lock, RefreshCw, Trash2, ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const PAGE_TITLE = "Responsible OSINT: What's Public vs Private | FootprintIQ";
const PAGE_DESCRIPTION = "A reference guide to responsible OSINT practice — defining public vs private data, ethical guardrails, prohibited use cases, and the FootprintIQ data lifecycle.";
const PAGE_URL = "https://footprintiq.app/resources/responsible-osint";

const faqs = [
  {
    q: "What counts as public data in OSINT?",
    a: "Public data is any information accessible without authentication, authorisation, or circumventing access controls. This includes social media profiles set to public, domain WHOIS records, published news articles, court records, and open government databases."
  },
  {
    q: "Does FootprintIQ access private accounts or messages?",
    a: "No. FootprintIQ only analyses publicly accessible information. It never logs into accounts, scrapes behind authentication walls, intercepts messages, or accesses paywalled content."
  },
  {
    q: "Is OSINT legal?",
    a: "Collecting and analysing publicly available information is generally legal in most jurisdictions. However, legality depends on how the data is used. Ethical OSINT practitioners must comply with data protection laws such as GDPR, avoid harassment, and respect individual rights."
  },
  {
    q: "How long does FootprintIQ retain my scan data?",
    a: "Scan findings and associated metadata are retained for 30 days by default. You can export or delete your data at any time. Processing logs are purged within 48 hours of a deletion request."
  },
  {
    q: "Can someone use FootprintIQ to investigate me without my knowledge?",
    a: "FootprintIQ is designed for self-assessment and authorised research only. Abuse-prevention controls including rate limiting, consent gates, and usage monitoring are in place to deter misuse. If you believe someone has misused the platform, you can report it via our support channel."
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Resources", item: "https://footprintiq.app/resources" },
    { "@type": "ListItem", position: 3, name: "Responsible OSINT", item: PAGE_URL },
  ],
};

export default function ResponsibleOsint() {
  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />
      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Responsible OSINT</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Responsible OSINT: What's Public vs Private
          </h1>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            A reference guide for journalists, researchers, and security professionals who need a clear, citable definition of responsible Open Source Intelligence practice — and how FootprintIQ implements it.
          </p>

          {/* Definitions */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Key Definitions</h2>

            <div className="space-y-6">
              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-primary shrink-0" />
                  <h3 className="font-semibold text-foreground">Open Source Intelligence (OSINT)</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The collection and analysis of information from publicly accessible sources to produce actionable intelligence. OSINT does not involve hacking, social engineering, or accessing restricted systems. It relies on data that any member of the public could, in principle, obtain.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <h3 className="font-semibold text-foreground">Public Data</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Information available without authentication or access control. Examples include public social media profiles, published articles, open government records, domain registration data, and publicly listed business information. Public availability does not imply consent to aggregation or misuse.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-destructive shrink-0" />
                  <h3 className="font-semibold text-foreground">Private Data</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Information protected by authentication, access controls, or reasonable expectation of privacy. This includes private messages, password-protected accounts, medical records, sealed court documents, and content behind paywalls. Responsible OSINT never accesses private data.
                </p>
              </div>
            </div>
          </section>

          {/* What FootprintIQ does / does not do */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">What FootprintIQ Does — and Doesn't Do</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              FootprintIQ is a privacy-first <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint scanner</Link> designed for self-assessment and authorised exposure audits. It operates exclusively on public data and implements strict ethical guardrails.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> We Do
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />Scan publicly accessible platforms for username and email exposure</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />Provide actionable steps to reduce your digital footprint</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />Support self-audit and organisation-authorised research</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />Apply abuse-prevention and rate-limiting controls</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />Give users full control over data export and deletion</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-destructive/20 bg-card">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-destructive" /> We Don't
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />Access private accounts, messages, or paywalled content</li>
                  <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />Sell, share, or broker personal data</li>
                  <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />Enable covert surveillance or stalking workflows</li>
                  <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />Scrape dark web marketplaces or illegal sources</li>
                  <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />Make definitive identity claims — results are exposure signals, not conclusions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Ethical guardrails */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Ethical Guardrails &amp; Prohibited Use Cases</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Responsible OSINT requires clear boundaries. The following guardrails govern all activity on FootprintIQ and align with our <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link>.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-medium text-foreground mb-1">Consent-based scanning</h3>
                <p className="text-sm text-muted-foreground">Scans should be initiated by the individual themselves or with explicit authorisation. FootprintIQ is not a "find anyone" tool.</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-medium text-foreground mb-1">No labelling or intent prediction</h3>
                <p className="text-sm text-muted-foreground">Results describe public exposure — they do not label individuals as "suspicious", predict behaviour, or assign moral judgments.</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-medium text-foreground mb-1">Proportionality</h3>
                <p className="text-sm text-muted-foreground">Data collection is limited to what is necessary for the stated purpose. We do not over-collect or retain data beyond its useful life.</p>
              </div>
              <div className="p-4 rounded-lg border border-destructive/20 bg-muted/30">
                <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Ban className="h-4 w-4 text-destructive" /> Prohibited
                </h3>
                <p className="text-sm text-muted-foreground">Harassment, doxxing, unauthorised surveillance, bypassing authentication, scraping behind logins, data brokerage, and any use that violates applicable law or the <Link to="/responsible-use" className="text-primary hover:underline">Responsible Use Policy</Link>.</p>
              </div>
            </div>
          </section>

          {/* Data lifecycle */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Lifecycle Overview</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              FootprintIQ follows a transparent, six-step data lifecycle. For full technical details, see the <Link to="/data-lifecycle" className="text-primary hover:underline">Data Lifecycle Policy</Link>.
            </p>

            <ol className="space-y-3">
              {[
                { icon: Shield, step: "Input", desc: "User provides a username, email, or phone number." },
                { icon: Eye, step: "OSINT Analysis", desc: "Public sources are queried — no private access." },
                { icon: CheckCircle2, step: "Results Generation", desc: "Findings are deduplicated, scored, and presented." },
                { icon: RefreshCw, step: "Retention", desc: "Findings retained for 30 days. Metadata retained separately." },
                { icon: Lock, step: "User Controls", desc: "Export or delete your data at any time via the dashboard." },
                { icon: Trash2, step: "Deletion", desc: "Deletion requests processed within 48 hours." },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                  <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
                  <div>
                    <span className="font-medium text-foreground">{item.step}</span>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Key links */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Further Reading</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/trust-safety" className="text-sm text-primary hover:underline">Trust &amp; Safety →</Link>
              <Link to="/responsible-use" className="text-sm text-primary hover:underline">Responsible Use Policy →</Link>
              <Link to="/privacy-policy" className="text-sm text-primary hover:underline">Privacy Policy →</Link>
              <Link to="/data-lifecycle" className="text-sm text-primary hover:underline">Data Lifecycle →</Link>
              <Link to="/ethical-osint-charter" className="text-sm text-primary hover:underline">Ethical OSINT Charter →</Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-foreground">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <section className="text-center py-10 px-6 rounded-xl border border-border bg-muted/30 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-2">Run a Privacy-First Scan</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              See what's publicly visible about you — no private data accessed, no data sold.
            </p>
            <Button asChild size="lg">
              <Link to="/scan">
                Start Free Scan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>

          <AboutFootprintIQBlock />
          <GuideCitationBlock />
        </article>
      </main>
      <Footer />
    </>
  );
}
