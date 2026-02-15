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
  Search,
  Mail,
  Shield,
  Globe,
  Terminal,
  Zap,
  Lock,
  Eye,
  Database,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/best-osint-tools";

const webPageSchema = buildWebPageSchema({
  name: "Best OSINT Tools in 2026 – Complete Guide to Open Source Intelligence Tools",
  description:
    "Compare the best OSINT tools for username search, email breach detection, dark web monitoring, and digital footprint analysis. Free and paid options reviewed.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "What are OSINT tools?",
    answer:
      "OSINT (Open Source Intelligence) tools are software applications that collect, analyse, and correlate publicly available information from the internet. They scan sources like social media platforms, public records, breach databases, and forums to produce actionable intelligence — without accessing private accounts or bypassing any authentication.",
  },
  {
    question: "Are OSINT tools legal?",
    answer:
      "Yes, OSINT tools are legal when they only access publicly available data. The legality depends on how the results are used, not the collection itself. Using OSINT for self-assessment, authorised investigations, or corporate security is legal in most jurisdictions. Using it for harassment, stalking, or unauthorised profiling is illegal. FootprintIQ operates under a published Ethical OSINT Charter.",
  },
  {
    question: "What are the best free OSINT tools in 2026?",
    answer:
      "Popular free OSINT tools in 2026 include Sherlock (username enumeration), Maigret (advanced username search), Holehe (email registration checks), SpiderFoot (automated reconnaissance), and WhatsMyName (cross-platform username checks). FootprintIQ offers a free tier that combines multiple tools with false-positive filtering and breach correlation in a single scan.",
  },
  {
    question: "How does FootprintIQ compare to CLI-based OSINT tools?",
    answer:
      "CLI tools like Sherlock and Maigret are powerful but require technical setup, produce raw output with many false positives, and don't correlate across data types. FootprintIQ wraps multiple OSINT tools in an automated pipeline with AI-powered false-positive filtering (LENS), breach correlation, risk scoring, and actionable remediation guidance — all through a web interface.",
  },
  {
    question: "Can OSINT tools access private accounts or the dark web?",
    answer:
      "Legitimate OSINT tools only access publicly available data. They cannot log into private accounts or bypass authentication. Some tools reference dark web breach databases that aggregate previously leaked credentials, but they do not actively crawl dark web marketplaces. FootprintIQ clearly distinguishes between publicly accessible findings and breach-database references.",
  },
  {
    question: "What is the best OSINT tool for username searches?",
    answer:
      "For username searches, Sherlock and Maigret are the most popular CLI tools. WhatsMyName maintains one of the largest platform databases. FootprintIQ combines results from multiple tools, applies AI confidence scoring to eliminate false positives, and correlates username findings with breach data and email exposure — making it the most comprehensive option for non-technical users.",
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
    { "@type": "ListItem", position: 2, name: "Best OSINT Tools", item: PAGE_URL },
  ],
};

const toolCategories = [
  {
    icon: Search,
    title: "Username Enumeration Tools",
    description:
      "These tools search for a specific username across hundreds of social media platforms, forums, and communities. They reveal where a username appears publicly — useful for self-audit and exposure mapping.",
    tools: ["Sherlock", "Maigret", "WhatsMyName", "Namechk"],
    footprintiq:
      "FootprintIQ combines multiple username enumeration engines and applies AI confidence scoring (LENS) to eliminate false positives that plague standalone tools.",
  },
  {
    icon: Mail,
    title: "Email Breach Detection Tools",
    description:
      "Email breach tools check whether an email address has appeared in known data breaches. They reference aggregated breach databases to identify compromised credentials.",
    tools: ["Have I Been Pwned", "Holehe", "DeHashed", "IntelX"],
    footprintiq:
      "FootprintIQ integrates breach detection with username and data broker scanning, providing a unified exposure view rather than siloed breach-only results.",
  },
  {
    icon: Globe,
    title: "Dark Web & Breach Monitoring",
    description:
      "Dark web monitoring tools scan for mentions of your personal data in leaked databases, paste sites, and underground forums. They reference previously leaked data rather than actively crawling dark web marketplaces.",
    tools: ["SpiderFoot", "Recon-NG", "Dehashed", "Breach Directory APIs"],
    footprintiq:
      "FootprintIQ includes dark web signal detection as part of its multi-tool pipeline, correlating breach findings with your username and email exposure for a complete risk picture.",
  },
  {
    icon: Database,
    title: "Data Broker & People-Search Scanning",
    description:
      "Data broker scanners check whether your personal information appears on people-search sites like Spokeo, BeenVerified, and MyLife. This is critical for privacy protection and opt-out prioritisation.",
    tools: ["Manual checks", "DeleteMe", "Kanary", "Incogni"],
    footprintiq:
      "FootprintIQ scans for data broker exposure alongside username and breach results, giving you a single scan that covers all vectors of digital exposure.",
  },
  {
    icon: Eye,
    title: "Digital Footprint Analysis",
    description:
      "Digital footprint tools provide a holistic view of your online presence — combining username exposure, breach history, data broker listings, and social media visibility into an overall risk assessment.",
    tools: ["Manual Google searches", "Social media privacy checks", "Browser extensions"],
    footprintiq:
      "FootprintIQ is purpose-built for digital footprint analysis. It automates the entire process with multi-tool scanning, AI-powered accuracy, and prioritised remediation guidance.",
  },
];

const comparisonRows = [
  { feature: "No technical setup required", manual: false, automated: true },
  { feature: "AI false-positive filtering", manual: false, automated: true },
  { feature: "Multi-tool correlation", manual: false, automated: true },
  { feature: "Breach + username + email in one scan", manual: false, automated: true },
  { feature: "Actionable remediation guidance", manual: false, automated: true },
  { feature: "Risk scoring and prioritisation", manual: false, automated: true },
  { feature: "Full CLI control and customisation", manual: true, automated: false },
  { feature: "Open source and auditable", manual: true, automated: "partial" },
  { feature: "Free tier available", manual: true, automated: true },
];

export default function BestOsintTools() {
  return (
    <>
      <Helmet>
        <title>Best OSINT Tools in 2026 – Complete Guide | FootprintIQ</title>
        <meta
          name="description"
          content="Compare the best OSINT tools for username search, email breach detection, dark web monitoring, and digital footprint analysis. Free and paid options reviewed."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Best OSINT Tools in 2026 – Complete Guide | FootprintIQ" />
        <meta
          property="og:description"
          content="Compare the best OSINT tools for username search, email breach detection, dark web monitoring, and digital footprint analysis."
        />
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
            <li className="text-foreground font-medium">Best OSINT Tools</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">2026 OSINT Tools Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Best OSINT Tools in 2026: The Complete Guide to Open Source Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A comprehensive, category-by-category review of the most effective OSINT tools for username search, email breach detection, dark web monitoring, and digital footprint analysis — with honest assessments of strengths and limitations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Try FootprintIQ Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What Are OSINT Tools */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What Are OSINT Tools?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              OSINT (Open Source Intelligence) tools collect and analyse information from publicly accessible sources — social media profiles, public records, breach databases, forums, and more. They are used by cybersecurity professionals, journalists, investigators, and everyday individuals who want to understand their own digital exposure.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              The key distinction is that OSINT tools only access <strong className="text-foreground">publicly available data</strong>. They do not hack, bypass logins, or access private information. When used ethically, they are powerful tools for self-assessment, corporate security, and authorised research.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The challenge for most users is that the OSINT ecosystem is fragmented. Username search, email breach detection, data broker scanning, and dark web monitoring each require separate tools — often CLI-based — with no built-in correlation or false-positive filtering. This guide explains each category and how modern platforms like <Link to="/how-it-works" className="text-accent hover:underline">FootprintIQ</Link> unify them.
            </p>
          </div>
        </section>

        {/* Tool Categories */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Categories of OSINT Tools
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              OSINT tools span multiple categories, each targeting a different aspect of digital exposure. Here's what each category does and which tools lead in 2026.
            </p>

            <div className="space-y-8">
              {toolCategories.map((cat) => (
                <div
                  key={cat.title}
                  className="rounded-xl border border-border/50 bg-card p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <cat.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold">{cat.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {cat.description}
                  </p>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-muted-foreground/80 mb-2">Popular tools:</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-3 py-1 rounded-full bg-muted text-sm text-foreground"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-accent">FootprintIQ approach:</span>{" "}
                      {cat.footprintiq}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Manual vs Automated Comparison */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Manual CLI Tools vs. Automated Platforms
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              CLI-based OSINT tools offer power and flexibility but require technical expertise. Automated platforms trade some customisation for accessibility, accuracy, and correlation.
            </p>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
              <div className="grid grid-cols-3 bg-muted/40 border-b border-border/50">
                <div className="p-4 text-sm font-semibold text-muted-foreground">Capability</div>
                <div className="p-4 text-sm font-semibold text-center">Manual CLI</div>
                <div className="p-4 text-sm font-semibold text-center text-accent">Automated (FootprintIQ)</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}`}
                >
                  <div className="p-4 text-sm font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-center">
                    {row.manual === true ? (
                      <CheckCircle2 className="w-4 h-4 text-accent mx-auto" />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>
                  <div className="p-4 text-sm text-center">
                    {row.automated === true ? (
                      <CheckCircle2 className="w-4 h-4 text-accent mx-auto" />
                    ) : row.automated === "partial" ? (
                      <span className="text-warning text-xs">Partial</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ethical OSINT */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-3xl font-bold">Ethical OSINT: What Matters</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Not all OSINT tools are created equal when it comes to ethics. The best tools are transparent about their methodology, respect user consent, and clearly distinguish between public data and private information.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Only access publicly available data — never bypass authentication or access private accounts",
                "Provide clear documentation of data sources and methodology",
                "Designed for self-assessment and authorised use, not surveillance",
                "Include accuracy indicators and confidence scoring to prevent misinterpretation",
                "Operate under a published ethical charter or responsible use policy",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ publishes a full{" "}
              <Link to="/ethical-osint-charter" className="text-accent hover:underline">
                Ethical OSINT Charter
              </Link>{" "}
              and is designed for privacy-first intelligence — helping you understand your exposure, not create more of it.
            </p>
          </div>
        </section>

        {/* How FootprintIQ Fits */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How FootprintIQ Unifies OSINT Tools</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Rather than requiring you to install, configure, and cross-reference multiple CLI tools, FootprintIQ wraps the best OSINT engines into a single automated pipeline. Here's what a single scan covers:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: Search, label: "Username enumeration across 500+ platforms" },
                { icon: Mail, label: "Email breach detection and credential monitoring" },
                { icon: Globe, label: "Data broker and people-search exposure" },
                { icon: Shield, label: "Dark web signal detection" },
                { icon: Zap, label: "LENS AI confidence scoring to filter false positives" },
                { icon: Eye, label: "Prioritised remediation with effort estimates" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card">
                  <item.icon className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Learn more about our methodology on the{" "}
              <Link to="/how-it-works" className="text-accent hover:underline">How It Works</Link>{" "}
              page, or{" "}
              <Link to="/scan" className="text-accent hover:underline">run a free scan</Link>{" "}
              to see results for yourself.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* About FootprintIQ */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>

        {/* Related Tools */}
        <RelatedToolsGrid currentPath="/best-osint-tools" />

        {/* Final CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Scan Your Digital Footprint?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Skip the CLI setup. Get a comprehensive, multi-tool OSINT scan with false-positive filtering — in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
