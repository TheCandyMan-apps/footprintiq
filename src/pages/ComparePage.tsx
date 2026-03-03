import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
  ChevronRight,
  Shield,
  Scale,
  Search,
  Eye,
  BarChart3,
  ShieldCheck,
  Ban,
  ScanLine,
  Zap,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

/* ── Comparison data ── */

interface ComparisonRow {
  feature: string;
  dataBrokers: "yes" | "no" | "partial";
  osintTools: "yes" | "no" | "partial";
  footprintiq: "yes" | "no" | "partial";
}

const comparisonRows: ComparisonRow[] = [
  { feature: "Designed for self-protection", dataBrokers: "no", osintTools: "partial", footprintiq: "yes" },
  { feature: "Consent-based scanning", dataBrokers: "no", osintTools: "no", footprintiq: "yes" },
  { feature: "Privacy-first architecture", dataBrokers: "no", osintTools: "partial", footprintiq: "yes" },
  { feature: "Published ethical charter", dataBrokers: "no", osintTools: "no", footprintiq: "yes" },
  { feature: "Sells or monetises personal data", dataBrokers: "yes", osintTools: "no", footprintiq: "no" },
  { feature: "Abuse prevention safeguards", dataBrokers: "no", osintTools: "partial", footprintiq: "yes" },
  { feature: "Exposure risk scoring", dataBrokers: "no", osintTools: "partial", footprintiq: "yes" },
  { feature: "Remediation roadmap", dataBrokers: "no", osintTools: "no", footprintiq: "yes" },
  { feature: "Breach signal detection", dataBrokers: "partial", osintTools: "partial", footprintiq: "yes" },
  { feature: "Multi-tool OSINT pipeline", dataBrokers: "no", osintTools: "yes", footprintiq: "yes" },
  { feature: "Free tier available", dataBrokers: "partial", osintTools: "yes", footprintiq: "yes" },
  { feature: "Data broker opt-out guidance", dataBrokers: "no", osintTools: "no", footprintiq: "yes" },
];

const faqs = [
  {
    question: "Is FootprintIQ a people-search or data broker site?",
    answer:
      "No. People-search sites aggregate and resell personal data about third parties. FootprintIQ is a self-assessment platform that shows you what's publicly visible about you, then helps you reduce that exposure. We never sell data and operate under a published Ethical OSINT Charter.",
  },
  {
    question: "How does FootprintIQ differ from investigator OSINT tools like Maltego or SpiderFoot?",
    answer:
      "Investigator OSINT tools are designed for professionals conducting research on third-party targets. FootprintIQ is purpose-built for individuals assessing their own digital exposure. It combines multi-tool scanning with risk scoring and guided remediation — without requiring technical expertise.",
  },
  {
    question: "Can FootprintIQ be used to look up other people?",
    answer:
      "FootprintIQ is designed for self-assessment and authorised, consent-based research only. Abuse prevention safeguards are built into the platform, and usage that targets individuals without consent violates our terms and ethical charter.",
  },
  {
    question: "What happens to my data after a scan?",
    answer:
      "Scan results are retained for 30 days by default to allow you to review and act on findings. You can export or delete your data at any time. FootprintIQ never shares, sells, or monetises your personal information. Full details are available in our Data Lifecycle policy.",
  },
  {
    question: "Is FootprintIQ suitable for journalists, activists, or at-risk individuals?",
    answer:
      "Yes. FootprintIQ is built with privacy-first principles specifically suited to high-risk users. Scans are consent-based, data is not retained beyond the configurable retention window, and the platform never creates profiles of third parties without authorisation.",
  },
];

const PAGE_URL = "https://footprintiq.app/compare";
const PAGE_TITLE = "FootprintIQ vs People Search & OSINT Tools – Honest Comparison | FootprintIQ";
const PAGE_DESCRIPTION =
  "Compare FootprintIQ with data brokers and investigator OSINT tools. See how privacy-first self-protection differs from surveillance-oriented people-search services.";

function CellIcon({ value }: { value: string }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-warning flex-shrink-0" />;
  return null;
}

function CellLabel({ value }: { value: string }) {
  if (value === "yes") return <span className="font-medium text-foreground">Yes</span>;
  if (value === "no") return <span className="text-muted-foreground/60">No</span>;
  if (value === "partial") return <span className="text-warning">Partial</span>;
  return <span className="text-sm">{value}</span>;
}

/* ── Remediation Steps ── */
const remediationSteps = [
  {
    icon: ScanLine,
    title: "Scan",
    description: "Run a multi-tool scan across 400+ platforms, breach databases, and data broker listings to map your public exposure.",
  },
  {
    icon: Zap,
    title: "Act",
    description: "Follow prioritised remediation steps with effort estimates, opt-out links, and guided removal workflows.",
  },
  {
    icon: RefreshCw,
    title: "Verify",
    description: "Re-scan to confirm removals have taken effect. Track which exposures have been resolved.",
  },
  {
    icon: TrendingUp,
    title: "Measure",
    description: "Monitor your Exposure Reduction Score over time and receive alerts if new signals appear.",
  },
];

export default function ComparePage() {
  const webPageSchema = buildWebPageSchema({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Compare", item: PAGE_URL },
    ],
  };

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
            <li className="text-foreground font-medium">Compare</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Scale className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Honest Comparison</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              FootprintIQ vs People Search & OSINT Tools
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Not all intelligence tools are built the same. Understand the difference between data brokerage, investigator OSINT, and privacy-first self-protection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run free scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View plans</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Three-Way Comparison Table ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Feature Comparison</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A neutral, side-by-side comparison of data brokers, investigator OSINT tools, and FootprintIQ.
            </p>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
              {/* Table header */}
              <div className="grid grid-cols-4 bg-muted/40 border-b border-border/50">
                <div className="p-3 md:p-4 text-xs md:text-sm font-semibold text-muted-foreground">Feature</div>
                <div className="p-3 md:p-4 text-xs md:text-sm font-semibold text-center">Data Brokers</div>
                <div className="p-3 md:p-4 text-xs md:text-sm font-semibold text-center">OSINT Tools</div>
                <div className="p-3 md:p-4 text-xs md:text-sm font-semibold text-center text-accent">FootprintIQ</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-4 ${i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}`}
                >
                  <div className="p-3 md:p-4 text-xs md:text-sm font-medium">{row.feature}</div>
                  <div className="p-3 md:p-4 text-xs md:text-sm text-center flex items-center justify-center gap-1.5">
                    <CellIcon value={row.dataBrokers} />
                    <span className="hidden sm:inline"><CellLabel value={row.dataBrokers} /></span>
                  </div>
                  <div className="p-3 md:p-4 text-xs md:text-sm text-center flex items-center justify-center gap-1.5">
                    <CellIcon value={row.osintTools} />
                    <span className="hidden sm:inline"><CellLabel value={row.osintTools} /></span>
                  </div>
                  <div className="p-3 md:p-4 text-xs md:text-sm text-center flex items-center justify-center gap-1.5">
                    <CellIcon value={row.footprintiq} />
                    <span className="hidden sm:inline"><CellLabel value={row.footprintiq} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What You Get with FootprintIQ ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              What You Get with{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">FootprintIQ</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Built for self-protection — not surveillance.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Search,
                  title: "Multi-Tool Scanning",
                  description: "Automated pipeline across 400+ platforms including social media, forums, data brokers, and breach databases.",
                },
                {
                  icon: BarChart3,
                  title: "Exposure Risk Scoring",
                  description: "Every finding is scored by confidence, severity, and exposure risk — not just listed as a match.",
                },
                {
                  icon: Eye,
                  title: "Remediation Guidance",
                  description: "Prioritised removal steps with effort estimates, opt-out links, and progress tracking.",
                },
                {
                  icon: ShieldCheck,
                  title: "Privacy-First Architecture",
                  description: "Consent-based scanning, 30-day retention, full data export and deletion controls.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What We Won't Do ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Ban className="w-5 h-5 text-destructive/70" />
              <h2 className="text-3xl font-bold">What We Won't Do</h2>
            </div>
            <p className="text-center text-muted-foreground mb-10">
              These are non-negotiable ethical boundaries — not features we haven't built yet.
            </p>

            <div className="space-y-4">
              {[
                "Sell, share, or monetise your personal data — ever.",
                "Profile third parties without their knowledge or consent.",
                "Access private accounts, bypass authentication, or scrape behind logins.",
                "Provide tools for stalking, harassment, doxxing, or unauthorised surveillance.",
                "Retain your data beyond the configurable retention window without your consent.",
                "Use dark web data, illegal databases, or paywalled court records.",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card">
                  <XCircle className="w-5 h-5 text-destructive/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl border border-accent/20 bg-accent/5 text-center">
              <p className="text-sm text-muted-foreground">
                Read our full commitments in the{" "}
                <Link to="/ethical-osint-charter" className="text-accent hover:underline font-medium">
                  Ethical OSINT Charter
                </Link>{" "}
                and{" "}
                <Link to="/data-lifecycle" className="text-accent hover:underline font-medium">
                  Data Lifecycle Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* ── How Remediation Works ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How Remediation Works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              A structured, repeatable workflow to reduce your digital exposure.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {remediationSteps.map(({ icon: Icon, title, description }, i) => (
                <div key={title} className="relative text-center">
                  {/* Step number */}
                  <div className="text-xs font-bold text-accent/60 uppercase tracking-widest mb-3">
                    Step {i + 1}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
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

        {/* ── Related Comparisons ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Comparisons</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { to: "/people-search-vs-footprintiq", label: "People-Search Sites vs FootprintIQ" },
                { to: "/osint-suites-vs-footprintiq", label: "OSINT Suites vs FootprintIQ" },
                { to: "/best-digital-footprint-scanner", label: "Best Digital Footprint Scanners" },
                { to: "/deleteme-vs-footprintiq", label: "DeleteMe vs FootprintIQ" },
                { to: "/incogni-vs-footprintiq", label: "Incogni vs FootprintIQ" },
                { to: "/aura-vs-footprintiq", label: "Aura vs FootprintIQ" },
              ].map((page) => (
                <Link
                  key={page.to}
                  to={page.to}
                  className="rounded-xl border border-border/50 bg-card p-4 text-center hover:border-accent/40 transition-all duration-200 group"
                >
                  <span className="text-sm font-medium group-hover:text-accent transition-colors">{page.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to See What's Publicly Visible?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Map your digital exposure ethically and transparently — in under two minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run free scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
