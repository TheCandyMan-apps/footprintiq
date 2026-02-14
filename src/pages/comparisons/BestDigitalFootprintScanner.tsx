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

const PAGE_URL = "https://footprintiq.app/best-digital-footprint-scanner";

const webPageSchema = buildWebPageSchema({
  name: "Best Digital Footprint Scanner (2026 Comparison Guide) | FootprintIQ",
  description:
    "Compare the best digital footprint scanners in 2026. See how FootprintIQ, Aura, DeleteMe, Incogni, and Kanary compare on features, methodology, and approach.",
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
      name: "What is a digital footprint scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A digital footprint scanner is a tool that searches publicly accessible sources to discover where your personal information — usernames, email addresses, profiles, and data broker listings — appears online. It maps your public digital exposure so you can understand what's visible and take steps to reduce it.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best digital footprint scanner in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your goal. If you want to understand your full public exposure — including username reuse, breach signals, and cross-platform visibility — FootprintIQ provides the most comprehensive intelligence. If you want automated data broker removal, services like DeleteMe or Incogni specialise in that. For identity protection with credit monitoring, Aura is a strong option.",
      },
    },
    {
      "@type": "Question",
      name: "Is FootprintIQ free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — FootprintIQ offers free scans that show where your digital exposure exists across hundreds of platforms. Pro plans provide deeper intelligence, false-positive filtering, exposure trend tracking, and structured remediation guidance.",
      },
    },
    {
      "@type": "Question",
      name: "How is FootprintIQ different from removal services?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FootprintIQ is an ethical digital footprint intelligence platform, not a removal service. It maps your full public exposure, scores your risk, and provides a prioritised remediation roadmap with official opt-out links. Removal services like DeleteMe and Incogni focus specifically on submitting automated opt-out requests to data brokers. The two approaches complement each other.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a scanner and a removal service?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ideally, yes. Scanning tools like FootprintIQ map your full exposure and help you prioritise what matters most. Removal services handle the opt-out process for data brokers specifically. Using both gives you intelligence-driven visibility combined with targeted action.",
      },
    },
    {
      "@type": "Question",
      name: "Why does ethical OSINT methodology matter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ethical OSINT ensures that scanning tools only use publicly accessible data, respect user consent, and don't engage in practices like scraping behind logins or accessing private databases. FootprintIQ operates under a published Ethical OSINT Charter that guarantees transparency about data sources, methodology, and limitations. This matters because the tools you use to protect your privacy should themselves be trustworthy.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Best Digital Footprint Scanner", item: PAGE_URL },
  ],
};

type CellValue = "yes" | "no" | "partial" | string;

const comparisonRows: { feature: string; footprintiq: CellValue; aura: CellValue; deleteme: CellValue; incogni: CellValue; kanary: CellValue }[] = [
  { feature: "Public profile scanning", footprintiq: "yes", aura: "partial", deleteme: "no", incogni: "no", kanary: "no" },
  { feature: "Username reuse detection", footprintiq: "yes", aura: "no", deleteme: "no", incogni: "no", kanary: "no" },
  { feature: "Data broker monitoring", footprintiq: "yes", aura: "yes", deleteme: "yes", incogni: "yes", kanary: "yes" },
  { feature: "Automated removal requests", footprintiq: "no", aura: "yes", deleteme: "yes", incogni: "yes", kanary: "yes" },
  { feature: "Breach signal detection", footprintiq: "yes", aura: "yes", deleteme: "no", incogni: "no", kanary: "no" },
  { feature: "Exposure scoring", footprintiq: "yes", aura: "partial", deleteme: "no", incogni: "no", kanary: "no" },
  { feature: "Remediation roadmap", footprintiq: "yes", aura: "no", deleteme: "no", incogni: "no", kanary: "no" },
  { feature: "Identity theft insurance", footprintiq: "no", aura: "yes", deleteme: "no", incogni: "no", kanary: "no" },
  { feature: "Credit monitoring", footprintiq: "no", aura: "yes", deleteme: "no", incogni: "no", kanary: "no" },
  { feature: "Ethical OSINT methodology", footprintiq: "yes", aura: "partial", deleteme: "partial", incogni: "partial", kanary: "partial" },
  { feature: "Free tier available", footprintiq: "yes", aura: "no", deleteme: "no", incogni: "no", kanary: "no" },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-muted-foreground/60" />;
  return <span className="text-sm">{value}</span>;
}

const BestDigitalFootprintScanner = () => {
  return (
    <>
      <Helmet>
        <title>Best Digital Footprint Scanner (2026 Comparison Guide) | FootprintIQ</title>
        <meta
          name="description"
          content="Compare the best digital footprint scanners in 2026. See how FootprintIQ, Aura, DeleteMe, Incogni, and Kanary compare on features, methodology, and approach."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Best Digital Footprint Scanner (2026 Comparison Guide) | FootprintIQ" />
        <meta property="og:description" content="An objective comparison of the leading digital footprint tools in 2026." />
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
            <li className="text-foreground font-medium">Best Digital Footprint Scanner</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">2026 Comparison Guide</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Best Digital Footprint Scanners{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                in 2026
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              An objective comparison of the leading tools for understanding and reducing your online exposure. Different tools, different strengths — here's how to choose.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Try FootprintIQ Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── What Is a Digital Footprint Scanner ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is a Digital Footprint Scanner?</h2>
            <p>
              A digital footprint scanner is a tool that searches publicly accessible sources across the internet to discover where your personal information appears. This includes social media profiles (active and forgotten), username reuse across platforms, data broker listings, public records, forum posts, and search engine results.
            </p>
            <p>
              The goal is visibility. Before you can reduce your digital exposure, you need to understand what exists. A good scanner maps your public presence comprehensively and helps you prioritise which exposures matter most — based on risk, severity, and potential impact.
            </p>
            <p>
              Digital footprint scanners differ from <Link to="/breach-vs-digital-footprint-risk" className="text-accent hover:underline">breach checkers</Link> (like Have I Been Pwned), which focus specifically on data leaked in security incidents. Scanners assess your <em>current</em> public visibility, not just what was leaked in the past. Some tools combine both capabilities; others specialise in one.
            </p>
            <p>
              The market has grown significantly in recent years, with tools ranging from pure intelligence platforms to automated removal services. Understanding the differences is essential for choosing the right approach for your needs.
            </p>
          </div>
        </section>

        {/* ── What to Look For ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What to Look for in a Digital Footprint Scanner</h2>
            <p>
              Not all digital footprint tools are created equal. When evaluating options, consider these key criteria:
            </p>
            <ul>
              <li><strong>Breadth of coverage:</strong> How many platforms and data sources does the tool check? Some focus only on data brokers. Others scan social media, forums, public records, and search engines. The broader the coverage, the more complete your exposure picture.</li>
              <li><strong>Username reuse detection:</strong> This is a critical capability that many removal-focused tools overlook entirely. If you use the same username across platforms, anyone who finds one account can discover others. Cross-platform username analysis reveals these chains of linked identity.</li>
              <li><strong>Actionable output:</strong> Raw results aren't enough. Look for tools that provide <em>prioritised</em> guidance — telling you not just what's visible, but what to address first and why. A remediation roadmap transforms data into action.</li>
              <li><strong>Exposure scoring:</strong> A quantified risk metric gives you a baseline to measure against and a clear way to track progress. Without scoring, it's hard to know whether your privacy efforts are actually working.</li>
              <li><strong>Transparency and methodology:</strong> Does the tool explain how it works? What data sources does it use? Is there a published methodology? Tools that operate as black boxes may be effective, but you can't verify their claims or understand their limitations.</li>
              <li><strong>Ethical framework:</strong> The tools you use to protect your privacy should themselves be ethical. Look for published policies on data handling, consent, and the boundaries of what the tool will and won't do.</li>
              <li><strong>Free tier:</strong> The ability to see your exposure before committing to a paid plan is valuable. It lets you evaluate the tool's quality and relevance to your situation.</li>
            </ul>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                2026 Comparison:{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">5 Leading Tools</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                FootprintIQ, Aura, DeleteMe, Incogni, and Kanary compared across 11 key capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-muted-foreground">Feature</th>
                    <th className="p-4 text-center text-sm font-semibold text-accent">FootprintIQ</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Aura</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">DeleteMe</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Incogni</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Kanary</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 text-sm font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.footprintiq} /></div></td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.aura} /></div></td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.deleteme} /></div></td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.incogni} /></div></td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.kanary} /></div></td>
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
                See detailed comparisons:{" "}
                <Link to="/aura-vs-footprintiq" className="text-accent hover:underline">Aura vs FootprintIQ</Link>{" · "}
                <Link to="/deleteme-vs-footprintiq" className="text-accent hover:underline">DeleteMe vs FootprintIQ</Link>{" · "}
                <Link to="/incogni-vs-footprintiq" className="text-accent hover:underline">Incogni vs FootprintIQ</Link>{" · "}
                <Link to="/kanary-vs-footprintiq" className="text-accent hover:underline">Kanary vs FootprintIQ</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── When Each Tool Is Appropriate ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">When Each Tool Is the Right Choice</h2>
            <p>
              There's no single "best" tool — it depends on what you need. Here's an honest assessment of when each option makes sense:
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">FootprintIQ</h3>
            <p>
              Best for: users who want to <strong>understand their full digital exposure</strong> before deciding what to do about it. FootprintIQ maps public profiles, detects username reuse, checks data broker presence, incorporates breach signals, and provides a prioritised remediation roadmap with an Exposure Reduction Score™. It's an intelligence platform — it tells you what's visible, scores the risk, and guides your response. Ideal for privacy-conscious individuals, professionals conducting ethical OSINT research, and anyone who values understanding before action.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Aura</h3>
            <p>
              Best for: users who want a <strong>comprehensive identity protection suite</strong>. Aura combines data broker removal with credit monitoring, identity theft insurance, VPN, and antivirus in a single subscription. It's a broader security product rather than a focused footprint scanner. Good for families or individuals who want all-in-one protection without managing multiple tools.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">DeleteMe</h3>
            <p>
              Best for: users who want <strong>dedicated, hands-off data broker removal</strong>. DeleteMe focuses specifically on identifying and removing your information from people-search sites and data brokers. It provides regular reports showing what was found and removed. Ideal for people who know they want broker listings removed and want a service to handle the process entirely.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Incogni</h3>
            <p>
              Best for: users who want <strong>affordable, automated broker removal</strong> with minimal friction. Developed by Surfshark, Incogni sends removal requests to data brokers on your behalf and tracks progress. It's competitively priced and integrates well with Surfshark's broader privacy suite. Good for budget-conscious users who want a set-and-forget approach.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Kanary</h3>
            <p>
              Best for: users who want <strong>focused personal data removal</strong> with a clean, straightforward interface. Kanary scans for your personal information across data broker sites and submits removal requests. It's newer to the market but has gained traction for its simplicity and effectiveness in the broker removal space.
            </p>

            <p className="mt-6">
              Many privacy-conscious users combine an intelligence platform (like FootprintIQ) with a removal service (like DeleteMe or Incogni). The intelligence layer tells you <em>what's visible and what matters most</em>. The removal layer handles the <em>opt-out mechanics</em>. Together, they provide both visibility and action.
            </p>
          </div>
        </section>

        {/* ── Why Ethical OSINT Matters ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Why Ethical OSINT Methodology Matters</h2>
            <p>
              When you use a tool to assess your digital exposure, you're trusting it with sensitive information about your online presence. The methodology behind that tool matters — not just for effectiveness, but for integrity.
            </p>
            <p>
              <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> that establishes clear boundaries:
            </p>
            <ul>
              <li><strong>Public data only:</strong> No accessing private databases, no scraping behind login walls, no exploiting API vulnerabilities. Every data point comes from publicly accessible sources.</li>
              <li><strong>Consent-based scanning:</strong> Users initiate their own scans. The platform doesn't conduct unsolicited surveillance or background checks on third parties.</li>
              <li><strong>No data brokerage:</strong> FootprintIQ doesn't sell, trade, or monetise user data or scan results. The business model is subscription-based intelligence, not data commerce.</li>
              <li><strong>Confidence scoring:</strong> Results include probability-based confidence scores rather than definitive identity assertions. This reduces false positives and ensures users aren't misled by uncertain matches.</li>
              <li><strong>Transparency by design:</strong> The methodology, data sources, and limitations are documented and available. Users can understand exactly how their results were generated.</li>
            </ul>
            <p>
              Not all privacy tools operate with this level of transparency. When evaluating scanners, ask: Does the tool explain its methodology? Does it have a published ethical framework? Would you trust it with your most sensitive data? These questions matter as much as feature lists.
            </p>
            <p>
              Learn more about <Link to="/how-it-works" className="text-accent hover:underline">how FootprintIQ's scanning pipeline works</Link>.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6">
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
        <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See Where You Stand — Free
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

export default BestDigitalFootprintScanner;