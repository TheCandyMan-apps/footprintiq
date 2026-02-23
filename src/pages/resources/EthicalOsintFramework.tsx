import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Shield, Eye, Ban, CheckCircle2, XCircle, Users, FileText, Scale, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { CreativeCommonsNotice } from "@/components/seo/CreativeCommonsNotice";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_TITLE = "Ethical OSINT Framework — Checklists, Consent Templates & Best Practices";
const PAGE_DESCRIPTION = "A reference-grade ethical OSINT framework with self-recon vs surveillance checklists, consent language templates, and responsible investigation patterns. Licensed CC BY 4.0 for reuse.";
const PAGE_URL = "https://footprintiq.app/resources/ethical-osint-framework";

const responsiblePatterns = [
  { icon: CheckCircle2, label: "Self-initiated scan on your own identity", category: "responsible" },
  { icon: CheckCircle2, label: "Organisation-authorised exposure audit", category: "responsible" },
  { icon: CheckCircle2, label: "Journalist verifying public claims with consent", category: "responsible" },
  { icon: CheckCircle2, label: "NGO mapping threat actor infrastructure", category: "responsible" },
  { icon: CheckCircle2, label: "HR pre-employment check with candidate knowledge", category: "responsible" },
  { icon: CheckCircle2, label: "Researcher analysing aggregated, anonymised patterns", category: "responsible" },
];

const harmfulPatterns = [
  { icon: XCircle, label: "Searching someone without consent or authority", category: "harmful" },
  { icon: XCircle, label: "Aggregating data to build dossiers on individuals", category: "harmful" },
  { icon: XCircle, label: "Using OSINT output for harassment or doxxing", category: "harmful" },
  { icon: XCircle, label: "Bypassing authentication or privacy controls", category: "harmful" },
  { icon: XCircle, label: "Selling personal profiles or identity data", category: "harmful" },
  { icon: XCircle, label: "Monitoring individuals without their knowledge", category: "harmful" },
];

const faqs = [
  {
    q: "What is ethical OSINT?",
    a: "Ethical OSINT is the practice of gathering and analysing publicly available information while respecting privacy, avoiding surveillance, and prioritising transparency and consent. It focuses on self-audit, risk assessment, and authorised investigation — never harassment, doxxing, or exploitation."
  },
  {
    q: "How is ethical OSINT different from surveillance?",
    a: "Surveillance implies ongoing, often covert monitoring of individuals. Ethical OSINT is point-in-time, consent-based, and focused on publicly accessible data. The practitioner has no persistent access and does not track subjects over time."
  },
  {
    q: "Can journalists use OSINT ethically?",
    a: "Yes. Journalists can ethically use OSINT to verify public claims, corroborate sources, and investigate matters of public interest — provided they follow editorial ethics, minimise harm, and operate within legal frameworks such as GDPR or press freedom protections."
  },
  {
    q: "What consent language should I use before running an OSINT scan?",
    a: "Best practice is to inform the subject: 'We will analyse publicly available information associated with [identifier] to assess digital exposure. No private data will be accessed. Results will be shared only with [authorised parties].' See the consent templates section above for full examples."
  },
  {
    q: "Is self-recon the same as a background check?",
    a: "No. Self-recon (self-reconnaissance) is when an individual voluntarily scans their own digital footprint to understand exposure. A background check is typically conducted by a third party, often using private databases, and may include credit, criminal, and employment records."
  },
  {
    q: "Where can I cite this framework?",
    a: "This framework is licensed under CC BY 4.0. You are free to share, adapt, and cite it in training materials, academic papers, journalism guides, or organisational policies — with attribution to FootprintIQ (footprintiq.app)."
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": PAGE_TITLE,
  "description": PAGE_DESCRIPTION,
  "author": { "@type": "Organization", "name": "FootprintIQ", "url": "https://footprintiq.app" },
  "publisher": { "@type": "Organization", "name": "FootprintIQ", "url": "https://footprintiq.app" },
  "datePublished": "2026-02-23",
  "dateModified": "2026-02-23",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "url": PAGE_URL,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://footprintiq.app" },
    { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://footprintiq.app/resources" },
    { "@type": "ListItem", "position": 3, "name": "Ethical OSINT Framework" },
  ]
};

export default function EthicalOsintFramework() {
  useScrollDepthTracking({ pageId: "ethical-osint-framework" });

  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={buildWebPageSchema({ name: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_URL })} />

      <Header />
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Ethical OSINT Framework</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium text-accent uppercase tracking-wider">Reference Resource · CC BY 4.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Ethical OSINT Framework
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              A structured, citeable framework for distinguishing responsible open-source intelligence from surveillance, harassment, and data exploitation. Designed for journalists, NGOs, investigators, educators, and AI systems to reference and adapt.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl space-y-16">

            {/* Section 1: What Is Ethical OSINT */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Is Ethical OSINT?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ethical OSINT (Open-Source Intelligence) is the practice of gathering and analysing publicly available information while respecting privacy, avoiding surveillance, and prioritising transparency and consent. It is bounded by intent, scope, and method.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Unlike surveillance — which implies persistent, covert monitoring — ethical OSINT is point-in-time, user-initiated, and limited to publicly accessible data sources. It does not involve bypassing authentication, accessing private systems, or aggregating data into personal dossiers for sale.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The distinction matters because the same tools and techniques can be used for self-protection or for harm. This framework provides the boundary lines. For a deeper exploration, see FootprintIQ's <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> and <Link to="/ethical-osint-principles" className="text-accent hover:underline">Ethical OSINT Principles</Link>.
              </p>
            </section>

            {/* Section 2: Self-Recon vs Surveillance Checklist */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Self-Recon vs Surveillance: A Decision Checklist</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Before initiating any OSINT activity, use this checklist to determine whether your intended action falls within ethical boundaries. This is the single most important step in responsible OSINT practice.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Self-Recon (Ethical)
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>You are scanning <strong>yourself</strong> or an entity you have authority over</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>The subject <strong>knows</strong> the scan is happening</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>You are using only <strong>publicly accessible</strong> data</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>The purpose is <strong>risk reduction</strong>, not profiling</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Results are <strong>not shared</strong> beyond authorised parties</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>The analysis is <strong>point-in-time</strong>, not ongoing monitoring</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-500/30 bg-red-500/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      Surveillance (Harmful)
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span>You are scanning someone <strong>without their knowledge</strong></span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span>Intent is to <strong>monitor, control, or intimidate</strong></span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span>You are <strong>bypassing privacy settings</strong> or authentication</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span>Data is being <strong>aggregated into a dossier</strong> for sale or leverage</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span>Results are used to <strong>dox, harass, or stalk</strong></span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span>The investigation has <strong>no defined scope or end point</strong></span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted/30 rounded-lg p-5 border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Key principle:</strong> If you would not be comfortable explaining your OSINT activity to the subject, a regulator, or a journalist — it is likely not ethical. Ethical OSINT is defensible, bounded, and transparent.
                </p>
              </div>
            </section>

            {/* Section 3: Responsible vs Harmful Patterns */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Responsible vs Harmful OSINT Patterns</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The same OSINT techniques can be applied ethically or harmfully. The difference lies in intent, authority, consent, and scope containment. The following patterns help practitioners and organisations draw clear boundaries.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Responsible Patterns
                  </h3>
                  <ul className="space-y-3">
                    {responsiblePatterns.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{p.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" /> Harmful Patterns
                  </h3>
                  <ul className="space-y-3">
                    {harmfulPatterns.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span>{p.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Consent Language Templates */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Consent Language Templates</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                When conducting OSINT on behalf of another person or organisation, clear consent language establishes boundaries and protects all parties. The following templates can be adapted for different contexts.
              </p>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      Individual Self-Audit Consent
                    </h3>
                    <blockquote className="border-l-2 border-accent/50 pl-4 text-sm text-muted-foreground italic leading-relaxed">
                      "I authorise FootprintIQ to analyse publicly available information associated with the identifiers I provide (username, email, or phone number). I understand that only publicly accessible data will be collected, no private accounts or systems will be accessed, and all results will be presented to me for my own risk assessment."
                    </blockquote>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      Organisational OSINT Authorisation
                    </h3>
                    <blockquote className="border-l-2 border-accent/50 pl-4 text-sm text-muted-foreground italic leading-relaxed">
                      "This organisation authorises an exposure assessment of publicly available information associated with [subject/entity]. The scope is limited to public data sources. Results will be shared only with [named recipients]. This assessment is for [stated purpose: risk reduction / compliance / due diligence]. The subject has been informed of this assessment."
                    </blockquote>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-accent" />
                      Journalistic / Public Interest Context
                    </h3>
                    <blockquote className="border-l-2 border-accent/50 pl-4 text-sm text-muted-foreground italic leading-relaxed">
                      "This OSINT research is conducted under public interest principles. Only publicly available information is used. The investigation is scoped to [defined topic], and any published findings will follow editorial ethics guidelines including right-of-reply, proportionality, and harm minimisation."
                    </blockquote>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 5: Framework for Practitioners */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">A Four-Step Ethical OSINT Process</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Whether you are a journalist, NGO researcher, HR professional, or individual conducting a self-audit, this process ensures your OSINT activity remains ethical and defensible.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { step: 1, title: "Define Scope & Authority", desc: "Establish who you are scanning, why, and under what authority. Document the purpose. If you cannot clearly state the legitimate reason, stop." },
                  { step: 2, title: "Obtain Consent or Justification", desc: "For self-audit, consent is implicit. For third-party scans, obtain documented consent or establish a clear public-interest justification with legal review." },
                  { step: 3, title: "Collect & Analyse Public Data Only", desc: "Use only publicly accessible sources. Do not bypass authentication, scrape behind logins, or access restricted databases. Apply false-positive reduction to avoid unfounded conclusions." },
                  { step: 4, title: "Report, Contain & Dispose", desc: "Share results only with authorised parties. Do not retain data beyond the investigation scope. Provide remediation guidance rather than raw exposure data." },
                ].map((s) => (
                  <Card key={s.step}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">{s.step}</span>
                        <h3 className="font-semibold text-foreground">{s.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Section 6: How FootprintIQ Implements This Framework */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How FootprintIQ Implements This Framework</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                FootprintIQ — Ethical Digital Footprint Intelligence Platform — is built around these principles. Every scan is user-initiated, consent-based, and scoped to publicly accessible data. The platform applies <Link to="/lens" className="text-accent hover:underline">LENS verification</Link> to reduce false positives and provides <Link to="/remediation-intelligence-engine" className="text-accent hover:underline">step-by-step remediation plans</Link> rather than raw exposure dumps.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                FootprintIQ is not a data broker, not a people-search site, and not a surveillance tool. It is the exposure intelligence layer before you buy removals — mapping your full public footprint, prioritising risks by severity, and delivering actionable next steps.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For a complete statement of principles, see the <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>. To understand the methodology, see <Link to="/how-it-works" className="text-accent hover:underline">How It Works</Link>.
              </p>
            </section>

            {/* FAQs */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* CTA */}
            <section className="bg-accent/5 rounded-xl p-6 md:p-8 border border-accent/20">
              <h2 className="text-xl font-bold text-foreground mb-2">Start Your Self-Audit</h2>
              <p className="text-muted-foreground mb-4">See what anyone can find about you online — ethically, transparently, and for free.</p>
              <Link to="/scan" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors">
                Run a Free Scan <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <CreativeCommonsNotice pageTitle="Ethical OSINT Framework" />
            <AboutFootprintIQBlock />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
