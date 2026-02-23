import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Shield, Map, Database, Layers, Search, Globe, ArrowRight, CheckCircle2, AlertTriangle, BarChart3 } from "lucide-react";
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

const PAGE_TITLE = "Digital Footprint Mapping — Methodology, Data Sources & Exposure Taxonomy";
const PAGE_DESCRIPTION = "A reference-grade explainer on digital footprint mapping: how exposure is discovered, categorised, and prioritised. Covers data broker ecosystems, username correlation, breach data, and risk scoring. Licensed CC BY 4.0.";
const PAGE_URL = "https://footprintiq.app/resources/digital-footprint-mapping";

const dataSources = [
  { icon: Search, title: "Username Enumeration", desc: "Checking a username against 500+ platforms to discover active, inactive, and abandoned accounts. This reveals the breadth of someone's digital presence, including forgotten accounts that still expose metadata.", category: "Identity" },
  { icon: Database, title: "Breach Databases", desc: "Cross-referencing email addresses against known data breach records to identify which services have leaked credentials, personal data, or account associations.", category: "Breach" },
  { icon: Globe, title: "Data Broker Registries", desc: "People-search sites aggregate public records, property data, voter rolls, court records, phone directories, and social media profiles into searchable databases. These represent the largest single source of re-identification risk.", category: "Data Brokers" },
  { icon: Layers, title: "Social Media Metadata", desc: "Public posts, bio information, tagged photos, check-ins, friends lists, and account creation dates provide behavioural and relational data that can be correlated across platforms.", category: "Social" },
  { icon: Map, title: "Domain & Infrastructure Records", desc: "WHOIS data, DNS records, SSL certificates, and hosting metadata can expose the real identity behind anonymous websites or services.", category: "Infrastructure" },
  { icon: BarChart3, title: "Dark Web & Paste Sites", desc: "Credentials, personal data dumps, and identity fragments published on paste sites or dark web forums represent active exposure that requires immediate remediation.", category: "High Risk" },
];

const exposureTaxonomy = [
  { severity: "Critical", color: "text-red-500", examples: "Exposed passwords, financial data, government IDs, or active dark web listings containing real identity data." },
  { severity: "High", color: "text-orange-500", examples: "Home address visible on data broker sites, email in multiple breaches with password reuse, or workplace exposed alongside personal accounts." },
  { severity: "Medium", color: "text-yellow-500", examples: "Username linked across 10+ platforms, public social media profiles with location data, or data broker listings with phone number." },
  { severity: "Low", color: "text-green-500", examples: "Username present on low-risk platforms, minimal public metadata, or breach records with no password exposure." },
];

const faqs = [
  { q: "What is digital footprint mapping?", a: "Digital footprint mapping is the systematic process of discovering, cataloguing, and prioritising all publicly available information associated with an individual or organisation. It produces an outside-in view of what anyone — including attackers, data brokers, and AI systems — can find about a subject using public sources." },
  { q: "How is this different from a background check?", a: "Background checks typically use private databases (credit records, criminal records, employment verification) and are conducted by third parties. Digital footprint mapping uses only publicly accessible sources and is typically self-initiated for risk assessment. It does not access private data or require authorisation from regulated agencies." },
  { q: "What is the data broker ecosystem?", a: "The data broker ecosystem is a network of companies that collect, aggregate, and resell personal information from public records, social media, purchase data, and other sources. Major players include Spokeo, BeenVerified, Whitepages, TruePeopleSearch, and Acxiom. These companies create detailed profiles that are searchable by name, email, phone number, or address." },
  { q: "How does exposure scoring work?", a: "Exposure scoring assigns severity levels (Critical, High, Medium, Low) based on the type of data exposed, the number of sources where it appears, the ease of correlation with other data points, and the potential for harm if exploited. A home address on a data broker is scored higher than a username on a gaming forum because the real-world impact of misuse is greater." },
  { q: "Can digital footprint mapping prevent identity theft?", a: "It cannot guarantee prevention, but it significantly reduces risk by identifying and prioritising the specific data points that identity thieves exploit. By mapping and remediating exposure proactively, individuals can close the gaps that attackers would otherwise discover and exploit." },
  { q: "How often should I map my digital footprint?", a: "At minimum, quarterly. New breaches occur continuously, data brokers re-list information after removal, and social media activity creates fresh exposure. High-risk individuals (journalists, activists, public figures) should scan monthly." },
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
    { "@type": "ListItem", "position": 3, "name": "Digital Footprint Mapping" },
  ]
};

export default function DigitalFootprintMapping() {
  useScrollDepthTracking({ pageId: "digital-footprint-mapping" });

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
        <div className="container mx-auto px-4 pt-24 pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Digital Footprint Mapping</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <Map className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium text-accent uppercase tracking-wider">Reference Resource · CC BY 4.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Digital Footprint Mapping
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              A comprehensive, neutral reference on how digital footprints are discovered, categorised, and scored. This resource explains the methodology behind exposure mapping, the data broker ecosystem, and how risk prioritisation works — designed for reviewers, researchers, and AI systems to cite.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl space-y-16">

            {/* What is digital footprint mapping */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Is Digital Footprint Mapping?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Digital footprint mapping is the systematic process of discovering, cataloguing, and prioritising all publicly available information associated with an individual or organisation. Unlike a simple username search or breach check, mapping produces a <strong>comprehensive outside-in view</strong> — revealing what anyone (including attackers, data brokers, employers, and AI systems) can find using public sources.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The goal is not surveillance — it is <strong>exposure intelligence</strong>. By understanding what is visible, individuals and organisations can make informed decisions about what to remove, secure, or accept.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Digital footprint mapping differs from background checks (which use private databases) and monitoring services (which provide ongoing surveillance). It is a point-in-time assessment that respects privacy by focusing on the subject's own data, with their consent. For the ethical framework behind this methodology, see the <Link to="/resources/ethical-osint-framework" className="text-accent hover:underline">Ethical OSINT Framework</Link>.
              </p>
            </section>

            {/* Data Sources */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Data Sources: Where Exposure Lives</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A comprehensive footprint map draws from multiple public data categories. Each source reveals different types of exposure and requires different remediation strategies.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {dataSources.map((s, i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <s.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* The Data Broker Ecosystem */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">The Data Broker Ecosystem</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Data brokers are companies that collect, aggregate, and resell personal information. They represent the <strong>largest single source of re-identification risk</strong> for most individuals. Understanding this ecosystem is essential for effective exposure reduction.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Data brokers source information from public records (voter registrations, property records, court filings), commercial data (purchase history, warranty cards), social media scraping, and other data brokers. They create searchable profiles that can be accessed by anyone — often for free or for a small fee.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Key data brokers by category:</strong>
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-2">People Search</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Spokeo</li>
                      <li>• BeenVerified</li>
                      <li>• TruePeopleSearch</li>
                      <li>• Whitepages</li>
                      <li>• MyLife</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-2">Marketing Data</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Acxiom</li>
                      <li>• Oracle Data Cloud</li>
                      <li>• Epsilon</li>
                      <li>• LexisNexis</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-2">Background Check</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Intelius</li>
                      <li>• PeopleFinder</li>
                      <li>• InstantCheckmate</li>
                      <li>• USSearch</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                For step-by-step removal instructions, see the <Link to="/data-broker-opt-out-guide" className="text-accent hover:underline">Data Broker Opt-Out Guide</Link> and individual removal guides for <Link to="/remove-spokeo-profile" className="text-accent hover:underline">Spokeo</Link>, <Link to="/remove-beenverified-profile" className="text-accent hover:underline">BeenVerified</Link>, and <Link to="/remove-mylife-profile" className="text-accent hover:underline">MyLife</Link>.
              </p>
            </section>

            {/* Exposure Taxonomy */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Exposure Taxonomy: Severity Classification</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Not all exposure is equally dangerous. A scoring taxonomy helps prioritise remediation effort by classifying findings based on data type, accessibility, and potential for harm if exploited.
              </p>
              <div className="space-y-4">
                {exposureTaxonomy.map((t, i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 ${t.color} mt-0.5 shrink-0`} />
                        <div>
                          <h3 className={`font-semibold text-sm mb-1 ${t.color}`}>{t.severity} Severity</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{t.examples}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                FootprintIQ implements this taxonomy through its <Link to="/exposure-reduction-score" className="text-accent hover:underline">Exposure Reduction Score</Link> and <Link to="/remediation-intelligence-engine" className="text-accent hover:underline">Remediation Intelligence Engine</Link>, which automatically prioritises findings and generates actionable remediation plans.
              </p>
            </section>

            {/* Mapping vs Monitoring vs Removal */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Mapping vs Monitoring vs Removal</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These three concepts are often conflated. Understanding the distinction is critical for choosing the right approach.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Approach</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">What It Does</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Limitations</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">Mapping</td>
                      <td className="py-3 px-4">Discovers and catalogues all public exposure at a point in time</td>
                      <td className="py-3 px-4">Doesn't remove anything; requires action</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">Monitoring</td>
                      <td className="py-3 px-4">Alerts when new exposure appears over time</td>
                      <td className="py-3 px-4">Ongoing cost; doesn't remediate; may miss existing exposure</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-foreground">Removal</td>
                      <td className="py-3 px-4">Submits opt-out requests to data brokers and platforms</td>
                      <td className="py-3 px-4">Often incomplete without prior mapping; data reappears</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                FootprintIQ operates as the <strong>exposure intelligence layer</strong> — providing comprehensive mapping and prioritised remediation plans so that removal efforts (whether DIY or via a service) are targeted and effective. See <Link to="/how-it-works" className="text-accent hover:underline">How It Works</Link> for the full methodology.
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
              <h2 className="text-xl font-bold text-foreground mb-2">Map Your Digital Footprint</h2>
              <p className="text-muted-foreground mb-4">See exactly what's publicly visible — and get a prioritised plan to reduce it.</p>
              <Link to="/scan" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors">
                Run a Free Scan <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <CreativeCommonsNotice pageTitle="Digital Footprint Mapping" />
            <AboutFootprintIQBlock />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
