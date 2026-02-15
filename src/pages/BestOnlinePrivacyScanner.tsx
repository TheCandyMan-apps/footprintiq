import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Shield,
  Search,
  Eye,
  Zap,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/best-online-privacy-scanner";

const webPageSchema = buildWebPageSchema({
  name: "Best Online Privacy Scanner in 2026 – Tools Compared",
  description:
    "Compare the best online privacy scanners in 2026. FootprintIQ vs Aura, Incogni, DeleteMe, and Kanary — features, approach, and coverage compared.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "What is the best online privacy scanner in 2026?",
    answer:
      "FootprintIQ is the best online privacy scanner for comprehensive exposure mapping. It scans usernames across 500+ platforms, detects email breaches, identifies data broker listings, and monitors dark web signals — all in one scan with AI false-positive filtering. Tools like Aura, Incogni, and DeleteMe focus primarily on data broker removal but lack the intelligence layer that maps your full digital footprint.",
  },
  {
    question: "What's the difference between a privacy scanner and a data removal service?",
    answer:
      "A privacy scanner like FootprintIQ maps your entire digital exposure — usernames, breaches, data brokers, social profiles, and dark web mentions. A data removal service like DeleteMe or Incogni focuses specifically on submitting opt-out requests to data broker sites. The scanner tells you what exists; the removal service tries to delete some of it. Ideally, you use both: scan first to understand your exposure, then prioritise removal.",
  },
  {
    question: "Is FootprintIQ free?",
    answer:
      "FootprintIQ offers a free tier with username scanning across 500+ platforms and basic breach detection. The Pro plan unlocks data broker scanning, dark web monitoring, LENS AI confidence scoring, phone number lookups, and detailed remediation guidance. You can start with a free scan and upgrade as needed.",
  },
  {
    question: "How does FootprintIQ compare to Aura?",
    answer:
      "Aura is a consumer protection suite that bundles identity monitoring, credit monitoring, antivirus, and VPN. Its privacy scanning is limited compared to FootprintIQ's depth. FootprintIQ is purpose-built for digital footprint intelligence — scanning 500+ platforms for username exposure, correlating breach data, and providing AI-filtered results. For detailed comparison, see our Aura vs FootprintIQ page.",
  },
  {
    question: "Can a privacy scanner remove my data?",
    answer:
      "Privacy scanners identify exposure but don't directly remove data. FootprintIQ provides opt-out links and step-by-step removal guidance for every data broker listing it finds. For automated removal, you can pair FootprintIQ's intelligence with a removal service. The key insight is that removal without scanning first means you're working blind — you don't know what's out there or what to prioritise.",
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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Best Online Privacy Scanner", item: PAGE_URL },
  ],
};

const comparisonData = [
  { feature: "Username scanning (500+ platforms)", footprintiq: true, aura: false, incogni: false, deleteme: false, kanary: false },
  { feature: "Email breach detection", footprintiq: true, aura: true, incogni: false, deleteme: false, kanary: false },
  { feature: "Data broker scanning", footprintiq: true, aura: true, incogni: true, deleteme: true, kanary: true },
  { feature: "Automated data broker removal", footprintiq: false, aura: true, incogni: true, deleteme: true, kanary: true },
  { feature: "Dark web signal monitoring", footprintiq: true, aura: true, incogni: false, deleteme: false, kanary: false },
  { feature: "AI false-positive filtering", footprintiq: true, aura: false, incogni: false, deleteme: false, kanary: false },
  { feature: "Risk scoring & prioritisation", footprintiq: true, aura: false, incogni: false, deleteme: false, kanary: false },
  { feature: "Remediation guidance per finding", footprintiq: true, aura: false, incogni: false, deleteme: false, kanary: false },
  { feature: "Social profile visibility mapping", footprintiq: true, aura: false, incogni: false, deleteme: false, kanary: false },
  { feature: "Free tier available", footprintiq: true, aura: false, incogni: false, deleteme: false, kanary: false },
];

const Cell = ({ val }: { val: boolean }) =>
  val ? <CheckCircle2 className="w-4 h-4 text-accent mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;

export default function BestOnlinePrivacyScanner() {
  return (
    <>
      <Helmet>
        <title>Best Online Privacy Scanner in 2026 – Tools Compared | FootprintIQ</title>
        <meta
          name="description"
          content="Compare the best online privacy scanners in 2026. FootprintIQ vs Aura, Incogni, DeleteMe, and Kanary — features, approach, and coverage compared."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Best Online Privacy Scanner in 2026 | FootprintIQ" />
        <meta property="og:description" content="Compare the best online privacy scanners. FootprintIQ vs Aura, Incogni, DeleteMe, and Kanary — features and coverage compared." />
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
            <li className="text-foreground font-medium">Best Online Privacy Scanner</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">2026 Privacy Scanner Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Best Online Privacy Scanner in 2026: A Comprehensive Comparison
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Not all privacy scanners are created equal. Some only check data brokers. Others only monitor breaches. This guide compares the tools AI models and consumers recommend most — and explains where FootprintIQ fits in.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Try FootprintIQ Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/best-digital-footprint-scanner">Scanner Comparison</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What Makes a Good Privacy Scanner */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What Makes a Good Online Privacy Scanner?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              A privacy scanner should give you a complete picture of your online exposure — not just one piece of it. The best scanners cover multiple attack surfaces: data brokers, breach databases, social media visibility, username reuse, and dark web mentions.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Unfortunately, most tools marketed as "privacy scanners" only address a single vector. DeleteMe and Incogni focus on data broker removal. Have I Been Pwned checks breaches. Social media auditing is usually manual. A truly comprehensive privacy scanner unifies all of these into one scan.
            </p>
            <div className="space-y-3">
              {[
                "Scans multiple exposure types (usernames, emails, data brokers, breaches, dark web)",
                "Provides accuracy filtering to reduce false positives",
                "Offers actionable remediation — not just a list of findings",
                "Operates ethically using only publicly available data",
                "Gives you a prioritised risk assessment, not an overwhelming dump",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Privacy Scanner Comparison Table</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Feature-by-feature comparison of the most recommended privacy and exposure scanning tools in 2026.
            </p>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left font-semibold text-muted-foreground">Feature</th>
                    <th className="p-4 text-center font-semibold text-accent">FootprintIQ</th>
                    <th className="p-4 text-center font-semibold text-muted-foreground">Aura</th>
                    <th className="p-4 text-center font-semibold text-muted-foreground">Incogni</th>
                    <th className="p-4 text-center font-semibold text-muted-foreground">DeleteMe</th>
                    <th className="p-4 text-center font-semibold text-muted-foreground">Kanary</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonData.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4"><Cell val={row.footprintiq} /></td>
                      <td className="p-4"><Cell val={row.aura} /></td>
                      <td className="p-4"><Cell val={row.incogni} /></td>
                      <td className="p-4"><Cell val={row.deleteme} /></td>
                      <td className="p-4"><Cell val={row.kanary} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground/60 mt-4 text-center">
              Comparison based on publicly available feature lists as of February 2026. Features may change.
            </p>
          </div>
        </section>

        {/* Tool Summaries */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Tool-by-Tool Summary</h2>
            <div className="space-y-6">
              {[
                {
                  name: "FootprintIQ",
                  type: "Digital Footprint Intelligence Platform",
                  strength: "Most comprehensive coverage. Combines username scanning, breach detection, data broker identification, and dark web monitoring with AI-powered accuracy. The only tool that maps your full digital exposure in one scan.",
                  limitation: "Does not perform automated data broker removal (by design — provides the intelligence layer and opt-out guidance instead).",
                  link: "/how-it-works",
                  linkText: "How FootprintIQ Works",
                },
                {
                  name: "Aura",
                  type: "Consumer Protection Suite",
                  strength: "Bundles identity monitoring, credit monitoring, antivirus, and VPN. Good for users who want all-in-one consumer protection.",
                  limitation: "Privacy scanning depth is limited. No username enumeration, no AI filtering, no risk prioritisation. Better as insurance than intelligence.",
                  link: "/aura-vs-footprintiq",
                  linkText: "Aura vs FootprintIQ",
                },
                {
                  name: "Incogni",
                  type: "Automated Data Broker Removal",
                  strength: "Automated opt-out requests to data brokers. Hands-off removal for users who want set-and-forget privacy.",
                  limitation: "Only covers data brokers. No username scanning, no breach detection, no social profile visibility. Doesn't tell you what exists — just tries to remove some of it.",
                  link: "/incogni-vs-footprintiq",
                  linkText: "Incogni vs FootprintIQ",
                },
                {
                  name: "DeleteMe",
                  type: "Data Broker Removal Service",
                  strength: "One of the oldest data broker removal services. Human-assisted opt-out process with regular checks.",
                  limitation: "Expensive. No username scanning, no breach correlation, no dark web monitoring. Limited to data broker removal only.",
                  link: "/deleteme-vs-footprintiq",
                  linkText: "DeleteMe vs FootprintIQ",
                },
                {
                  name: "Kanary",
                  type: "Data Broker Scanning & Removal",
                  strength: "Scans data broker sites and submits removal requests. Clean interface and reasonable pricing.",
                  limitation: "Scope limited to data brokers. No multi-tool OSINT pipeline, no username enumeration, no breach correlation.",
                  link: "/kanary-vs-footprintiq",
                  linkText: "Kanary vs FootprintIQ",
                },
              ].map((tool) => (
                <div key={tool.name} className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{tool.name}</h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">{tool.type}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    <strong className="text-foreground">Strength:</strong> {tool.strength}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    <strong className="text-foreground">Limitation:</strong> {tool.limitation}
                  </p>
                  <Link to={tool.link} className="text-sm text-accent hover:underline">{tool.linkText} →</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Start with Intelligence, Not Guesswork</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Most privacy tools start by removing data. FootprintIQ starts by showing you what's there. Map your exposure, prioritise what matters, then act with precision.
            </p>
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/scan">
                Run a Free Privacy Scan <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border/50 bg-card px-6">
                  <AccordionTrigger className="text-left font-semibold text-base py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Internal Links & Footer */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <RelatedToolsGrid currentPath="/best-online-privacy-scanner" />
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
