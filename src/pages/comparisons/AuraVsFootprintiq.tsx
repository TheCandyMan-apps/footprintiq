import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/aura-vs-footprintiq";

const webPageSchema = buildWebPageSchema({
  name: "Aura vs FootprintIQ – Digital Protection Comparison (2026) | FootprintIQ",
  description:
    "Compare Aura and FootprintIQ in 2026. Aura offers identity theft protection and credit monitoring. FootprintIQ provides ethical digital footprint intelligence and exposure mapping.",
  url: PAGE_URL,
  datePublished: "2026-02-12",
  dateModified: "2026-02-14",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Aura the same as FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Aura is an identity theft protection suite that bundles credit monitoring, VPN, antivirus, and insurance. FootprintIQ is a digital footprint intelligence platform that maps your public exposure and provides remediation guidance using ethical OSINT.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use both Aura and FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — they complement each other well. Aura protects against identity theft and fraud reactively. FootprintIQ shows you what's publicly visible so you can proactively reduce your exposure before it becomes a problem.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ offer credit monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ focuses on digital footprint intelligence — mapping public profiles, username reuse, data broker listings, and breach signals. For credit monitoring, a service like Aura would be more appropriate.",
      },
    },
    {
      "@type": "Question",
      name: "Which is better for privacy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your definition. Aura protects your identity from theft. FootprintIQ helps you understand and reduce what's publicly visible. For proactive digital privacy management, FootprintIQ provides deeper exposure intelligence.",
      },
    },
    {
      "@type": "Question",
      name: "Does Aura detect username reuse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Aura focuses on identity theft protection, credit monitoring, and bundled security tools. FootprintIQ scans for username reuse across hundreds of platforms, showing where the same handle creates a linked chain of visible identity.",
      },
    },
    {
      "@type": "Question",
      name: "Is FootprintIQ free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — FootprintIQ offers free scans that reveal your public digital exposure. Pro plans add deeper intelligence, false-positive filtering, exposure trend tracking, and structured remediation guidance. Aura does not offer a free tier.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Best Digital Footprint Scanner", item: "https://footprintiq.app/best-digital-footprint-scanner" },
    { "@type": "ListItem", position: 3, name: "Aura vs FootprintIQ", item: PAGE_URL },
  ],
};

type CellValue = "yes" | "no" | "partial" | string;

const comparisonRows: { feature: string; aura: CellValue; footprintiq: CellValue }[] = [
  { feature: "Public profile scanning", aura: "partial", footprintiq: "yes" },
  { feature: "Username reuse detection", aura: "no", footprintiq: "yes" },
  { feature: "Credit monitoring", aura: "yes", footprintiq: "no" },
  { feature: "Dark web monitoring", aura: "yes", footprintiq: "Breach signals" },
  { feature: "VPN included", aura: "yes", footprintiq: "no" },
  { feature: "Antivirus included", aura: "yes", footprintiq: "no" },
  { feature: "Identity theft insurance", aura: "yes", footprintiq: "no" },
  { feature: "Exposure scoring", aura: "no", footprintiq: "yes" },
  { feature: "Remediation roadmap", aura: "no", footprintiq: "yes" },
  { feature: "Ethical OSINT methodology", aura: "no", footprintiq: "yes" },
  { feature: "Free tier available", aura: "no", footprintiq: "yes" },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-muted-foreground/60" />;
  return <span className="text-sm">{value}</span>;
}

const AuraVsFootprintiq = () => {
  return (
    <>
      <Helmet>
        <title>Aura vs FootprintIQ – Digital Protection Comparison (2026) | FootprintIQ</title>
        <meta
          name="description"
          content="Compare Aura and FootprintIQ in 2026. Aura offers identity theft protection and credit monitoring. FootprintIQ provides ethical digital footprint intelligence and exposure mapping."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Aura vs FootprintIQ – Digital Protection Comparison (2026)" />
        <meta property="og:description" content="Identity theft protection compared with ethical digital footprint intelligence." />
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
            <li><Link to="/best-digital-footprint-scanner" className="hover:text-foreground transition-colors">Best Scanner</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Aura vs FootprintIQ</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">2026 Comparison</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Aura vs{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                FootprintIQ
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Identity theft protection compared with ethical digital footprint intelligence. Two different approaches to the same goal — keeping your personal data safe.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Try FootprintIQ Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Overview: Aura ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is Aura?</h2>
            <p>
              Aura is a comprehensive identity protection service that bundles multiple security products into a single subscription. It combines credit monitoring across all three bureaus, dark web surveillance, identity theft insurance (up to $5 million), a VPN, antivirus software, password management, and parental controls.
            </p>
            <p>
              Aura's approach is <strong>reactive and protective</strong>. It monitors for signs that your identity has already been compromised — fraudulent credit applications, social security number misuse, dark web listings — and alerts you when something is detected. If identity theft occurs, Aura provides insurance and remediation support to help you recover.
            </p>
            <p>
              This makes Aura well-suited for users who want a broad security umbrella. It's particularly appealing for families, since many plans include multi-device coverage and parental controls. The tradeoff is that Aura focuses on <em>what has already happened</em> rather than mapping what's currently visible about you online.
            </p>
          </div>
        </section>

        {/* ── Overview: FootprintIQ ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is FootprintIQ?</h2>
            <p>
              <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> takes a fundamentally different approach. Rather than monitoring for identity theft after the fact, FootprintIQ maps your <em>current</em> public digital exposure — showing you exactly what's visible about you across the internet right now.
            </p>
            <p>
              FootprintIQ scans hundreds of platforms for public profiles, detects username reuse that creates chains of linked identity, checks data broker presence, incorporates breach signals, and generates a quantified Exposure Reduction Score™. The output is a prioritised remediation roadmap that tells you what to address first and why.
            </p>
            <p>
              The platform operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>, ensuring that all scanning uses only publicly accessible data, respects user consent, and maintains full transparency about methodology and limitations. This makes FootprintIQ <strong>proactive and intelligence-driven</strong> — it helps you understand and reduce your exposure before it leads to problems.
            </p>
            <p>
              FootprintIQ offers free scans for basic exposure visibility, with Pro plans providing deeper intelligence, false-positive filtering, exposure trend tracking, and structured remediation guidance. Learn more about <Link to="/how-it-works" className="text-accent hover:underline">how the scanning pipeline works</Link>.
            </p>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Feature{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Comparison</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Aura and FootprintIQ compared across 11 key capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-muted-foreground">Feature</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Aura</th>
                    <th className="p-4 text-center text-sm font-semibold text-accent">FootprintIQ</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 text-sm font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.aura} /></div></td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.footprintiq} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-4">
              ✓ = Full support &nbsp; — = Partial &nbsp; ✕ = Not included. Based on publicly available information as of February 2026.
            </p>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                See more comparisons:{" "}
                <Link to="/best-digital-footprint-scanner" className="text-accent hover:underline">Best Scanner Guide</Link>{" · "}
                <Link to="/deleteme-vs-footprintiq" className="text-accent hover:underline">DeleteMe vs FootprintIQ</Link>{" · "}
                <Link to="/incogni-vs-footprintiq" className="text-accent hover:underline">Incogni vs FootprintIQ</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── Who Should Choose Aura ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Who Should Choose Aura?</h2>
            <p>
              Aura is the right choice if your primary concern is <strong>identity theft protection and fraud prevention</strong>. Specifically, choose Aura if:
            </p>
            <ul>
              <li><strong>You want bundled security:</strong> Credit monitoring, VPN, antivirus, and password management in a single subscription — without managing multiple tools.</li>
              <li><strong>Credit monitoring is essential:</strong> If tracking your credit score and receiving fraud alerts across all three bureaus is a priority, Aura delivers this natively.</li>
              <li><strong>You need identity theft insurance:</strong> Aura provides up to $5 million in identity theft insurance, covering financial losses and recovery costs.</li>
              <li><strong>Family protection matters:</strong> Aura's family plans include parental controls and multi-device coverage, making it practical for households.</li>
              <li><strong>You prefer reactive monitoring:</strong> Aura excels at detecting when something has gone wrong — fraudulent applications, dark web listings, account breaches — and alerting you immediately.</li>
            </ul>
            <p>
              Aura's strength is breadth. It covers many aspects of digital security, though it sacrifices depth in any single area. It won't tell you which platforms your username appears on or how your public profiles link together.
            </p>
          </div>
        </section>

        {/* ── Who Should Choose FootprintIQ ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Who Should Choose FootprintIQ?</h2>
            <p>
              FootprintIQ is the right choice if your primary concern is <strong>understanding and reducing your public digital exposure</strong>. Specifically, choose FootprintIQ if:
            </p>
            <ul>
              <li><strong>You want to see what's visible:</strong> FootprintIQ maps your public presence across hundreds of platforms — social media, forums, data brokers, search results — showing exactly what anyone can find about you.</li>
              <li><strong>Username reuse concerns you:</strong> If you've used the same username across multiple platforms, FootprintIQ reveals these linked identity chains that most tools miss entirely.</li>
              <li><strong>You want intelligence, not just alerts:</strong> Instead of reactive notifications, FootprintIQ provides a structured, prioritised remediation roadmap that tells you what to address first based on risk and impact.</li>
              <li><strong>Ethical methodology matters:</strong> FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> — only public data, no scraping behind logins, full transparency about methods and limitations.</li>
              <li><strong>You want a free starting point:</strong> FootprintIQ offers free scans to assess your exposure before committing to a paid plan. Aura requires a subscription from the start.</li>
              <li><strong>You're conducting professional OSINT:</strong> Security professionals, risk analysts, and privacy researchers use FootprintIQ for authorised self-assessments and exposure audits.</li>
            </ul>
            <p>
              FootprintIQ's strength is depth and intelligence. It provides a comprehensive, quantified picture of your digital exposure with actionable guidance — but it doesn't include credit monitoring, antivirus, or identity theft insurance.
            </p>
          </div>
        </section>

        {/* ── The Complementary Approach ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Using Both Together</h2>
            <p>
              Aura and FootprintIQ aren't competitors in the traditional sense — they address different layers of the same problem. Aura protects you <em>after</em> exposure becomes a threat. FootprintIQ helps you understand and reduce that exposure <em>before</em> it leads to problems.
            </p>
            <p>
              A combined approach gives you both <strong>proactive intelligence</strong> (know what's visible, reduce it systematically) and <strong>reactive protection</strong> (detect fraud, recover from identity theft). For users who take digital privacy seriously, this layered strategy provides the most complete coverage.
            </p>
            <p>
              Learn more about the difference between <Link to="/breach-vs-digital-footprint-risk" className="text-accent hover:underline">breach risk and digital footprint risk</Link>, or explore <Link to="/how-to-monitor-your-online-exposure-after-a-breach" className="text-accent hover:underline">how to monitor your exposure after a breach</Link>.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
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

        {/* ── Final CTA ── */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See Your Digital Exposure — Free
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a free ethical footprint scan and discover what's publicly visible about you across hundreds of platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Run Your Ethical Footprint Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer Reinforcement Block ── */}
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

export default AuraVsFootprintiq;
