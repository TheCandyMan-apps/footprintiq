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

const PAGE_URL = "https://footprintiq.app/incogni-vs-footprintiq";

const webPageSchema = buildWebPageSchema({
  name: "Incogni vs FootprintIQ – Privacy Removal vs Exposure Intelligence (2026) | FootprintIQ",
  description:
    "Compare Incogni and FootprintIQ in 2026. Incogni automates data broker removal requests. FootprintIQ maps your full digital exposure with ethical OSINT intelligence.",
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
      name: "Is Incogni the same as FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Incogni is a data removal service by Surfshark that sends automated opt-out requests to data brokers. FootprintIQ is a digital footprint intelligence platform that maps your full public exposure — including profiles, username reuse, and breach signals — and provides a prioritised remediation roadmap.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use Incogni and FootprintIQ together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. FootprintIQ maps your full exposure and prioritises what matters most. Incogni then handles the automated removal of data broker listings. Together, they provide intelligence-driven privacy management — visibility first, targeted action second.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ send removal requests?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ provides the intelligence layer — mapping your exposure, scoring risk, and generating a prioritised remediation roadmap with official opt-out links. The removal action is up to you or a service like Incogni.",
      },
    },
    {
      "@type": "Question",
      name: "Does Incogni detect username reuse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Incogni focuses exclusively on data broker removal. It doesn't scan for public profiles, username reuse across platforms, or cross-platform identity chains. FootprintIQ provides these capabilities as part of its broader exposure mapping.",
      },
    },
    {
      "@type": "Question",
      name: "Is Incogni cheaper than FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They serve different purposes, so direct price comparison isn't straightforward. Incogni charges a subscription for automated broker removal. FootprintIQ offers free scans for basic exposure visibility, with Pro plans for deeper intelligence. You're paying for different things — removal mechanics vs exposure intelligence.",
      },
    },
    {
      "@type": "Question",
      name: "Why choose intelligence over just removing everything?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because data brokers are only one slice of your digital footprint. Your public social media profiles, forum posts, code contributions, professional network activity, and username reuse patterns remain untouched by removal services. Intelligence shows you the full picture so you can prioritise strategically rather than acting blindly on a subset.",
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
    { "@type": "ListItem", position: 3, name: "Incogni vs FootprintIQ", item: PAGE_URL },
  ],
};

type CellValue = "yes" | "no" | "partial" | string;

const comparisonRows: { feature: string; incogni: CellValue; footprintiq: CellValue }[] = [
  { feature: "Data broker removal", incogni: "yes", footprintiq: "Guidance & links" },
  { feature: "Number of brokers covered", incogni: "180+", footprintiq: "Guidance for 200+" },
  { feature: "Public profile scanning", incogni: "no", footprintiq: "yes" },
  { feature: "Username reuse detection", incogni: "no", footprintiq: "yes" },
  { feature: "Breach signal detection", incogni: "no", footprintiq: "yes" },
  { feature: "Exposure scoring", incogni: "no", footprintiq: "yes" },
  { feature: "Remediation priority ranking", incogni: "no", footprintiq: "yes" },
  { feature: "Progress tracking", incogni: "yes", footprintiq: "yes" },
  { feature: "Automated opt-out requests", incogni: "yes", footprintiq: "no" },
  { feature: "Ethical OSINT methodology", incogni: "partial", footprintiq: "yes" },
  { feature: "Free tier available", incogni: "no", footprintiq: "yes" },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-muted-foreground/60" />;
  return <span className="text-sm">{value}</span>;
}

const IncogniVsFootprintiq = () => {
  return (
    <>
      <Helmet>
        <title>Incogni vs FootprintIQ – Privacy Removal vs Exposure Intelligence (2026) | FootprintIQ</title>
        <meta
          name="description"
          content="Compare Incogni and FootprintIQ in 2026. Incogni automates data broker removal requests. FootprintIQ maps your full digital exposure with ethical OSINT intelligence."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Incogni vs FootprintIQ – Privacy Removal vs Exposure Intelligence (2026)" />
        <meta property="og:description" content="Automated data removal compared with comprehensive exposure mapping." />
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
            <li className="text-foreground font-medium">Incogni vs FootprintIQ</li>
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
              Incogni vs{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                FootprintIQ
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Affordable automated data broker removal compared with comprehensive digital footprint intelligence. Two complementary tools for a layered privacy strategy.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Try FootprintIQ Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Incogni Overview ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is Incogni?</h2>
            <p>
              Incogni is a data broker removal service developed by Surfshark, the VPN company. It automates the process of sending opt-out and data deletion requests to data brokers and people-search sites that collect and sell personal information.
            </p>
            <p>
              The service works on a <strong>set-and-forget subscription model</strong>. You provide your personal details, and Incogni submits removal requests to its network of 180+ data brokers on your behalf. It tracks the status of each request and re-submits periodically, since many brokers re-list information after initial removal. You receive a dashboard showing progress across all targeted brokers.
            </p>
            <p>
              Incogni's primary advantage is <strong>affordability and simplicity</strong>. It's competitively priced compared to other removal services, particularly when bundled with Surfshark's VPN subscription. The interface is clean and straightforward — there's minimal setup, and the service handles everything automatically after onboarding.
            </p>
            <p>
              However, like all removal services, Incogni's scope is limited to data brokers. It doesn't scan for public social media profiles, detect username reuse across platforms, check for breach exposure, or provide broader exposure intelligence. It addresses one important category of digital exposure, but not the full landscape.
            </p>
          </div>
        </section>

        {/* ── FootprintIQ Overview ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is FootprintIQ?</h2>
            <p>
              <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> operates upstream from removal services. Rather than acting on a specific subset of your exposure, FootprintIQ maps your <em>entire</em> public digital presence — showing you exactly what's visible, where it exists, and how different exposures connect to each other.
            </p>
            <p>
              The platform scans hundreds of platforms for public profiles, detects username reuse that creates cross-platform identity chains, checks data broker presence, incorporates breach signals, and generates a quantified Exposure Reduction Score™. The output is a prioritised remediation roadmap that tells you what to address first and why — based on risk, impact, and remediation difficulty.
            </p>
            <p>
              FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>: only publicly accessible data, consent-based scanning, no data brokerage, and full methodological transparency. It offers free scans for basic visibility, with Pro plans providing deeper intelligence, false-positive filtering, exposure trend tracking, and structured remediation guidance.
            </p>
            <p>
              Learn more about <Link to="/how-it-works" className="text-accent hover:underline">how FootprintIQ's scanning pipeline works</Link>.
            </p>
          </div>
        </section>

        {/* ── Removal vs Intelligence ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Removal vs Intelligence: Why Both Matter</h2>
            <p>
              Incogni and FootprintIQ represent two distinct layers of a comprehensive privacy strategy. Understanding the difference helps you decide which you need — or whether you need both.
            </p>
            <p>
              <strong>Incogni handles removal mechanics.</strong> It automates the tedious process of contacting data brokers, submitting opt-out forms, and tracking compliance. This is valuable work — data brokers are persistent, often re-listing information within months. Having a service that continuously manages this process saves significant time and effort.
            </p>
            <p>
              <strong>FootprintIQ provides the intelligence layer.</strong> It answers the question that removal services can't: <em>what does my full digital exposure actually look like?</em> Data brokers represent roughly 180-400 sites. But your digital footprint extends across social media platforms, forums, code repositories, professional networks, public records, and search engine results — thousands of potential exposure points that removal services never touch.
            </p>
            <p>
              Without intelligence, removal services operate on a fixed list of targets. With intelligence, you can see the complete picture, understand which exposures carry the highest risk, and make informed decisions about where to invest effort. FootprintIQ positions itself as the <strong>intelligence layer above removal services</strong> — map it, prioritise it, reduce it.
            </p>
            <p>
              The most effective privacy strategy combines both: use FootprintIQ to understand your full exposure and build a prioritised plan, then use Incogni (or a similar service) to automate the broker removal component of that plan.
            </p>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Feature{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Comparison</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Incogni and FootprintIQ compared across 11 key capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-muted-foreground">Feature</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Incogni</th>
                    <th className="p-4 text-center text-sm font-semibold text-accent">FootprintIQ</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 text-sm font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.incogni} /></div></td>
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
                <Link to="/aura-vs-footprintiq" className="text-accent hover:underline">Aura vs FootprintIQ</Link>{" · "}
                <Link to="/deleteme-vs-footprintiq" className="text-accent hover:underline">DeleteMe vs FootprintIQ</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── Use Case Breakdown ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">When to Choose Each Tool</h2>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Choose Incogni If…</h3>
            <ul>
              <li><strong>Your main goal is affordable broker removal:</strong> Incogni offers competitive pricing for automated data broker opt-outs, especially when bundled with Surfshark VPN.</li>
              <li><strong>You want a simple, hands-off service:</strong> Minimal setup, automatic re-submissions, and a clean dashboard. Set it and forget it.</li>
              <li><strong>You're already a Surfshark user:</strong> Incogni integrates well with Surfshark's broader privacy suite, making it a natural add-on.</li>
              <li><strong>You don't need broader exposure mapping:</strong> If data brokers are your primary concern and you're not worried about social media visibility, username reuse, or breach signals, Incogni covers that slice effectively.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Choose FootprintIQ If…</h3>
            <ul>
              <li><strong>You want the full picture first:</strong> Before deciding what to remove, you want to understand your complete digital exposure — profiles, username chains, breach signals, broker listings, and public records.</li>
              <li><strong>Username reuse is a concern:</strong> FootprintIQ reveals linked identity chains across platforms that removal services miss entirely.</li>
              <li><strong>You need prioritised, intelligence-driven guidance:</strong> Instead of treating all exposures equally, FootprintIQ ranks them by risk and impact with a structured remediation roadmap.</li>
              <li><strong>You want a free starting point:</strong> FootprintIQ offers free scans to assess your exposure before committing to a paid plan. Incogni requires a subscription from the start.</li>
              <li><strong>Ethical methodology and transparency matter:</strong> FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> with full methodological transparency.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Use Both Together</h3>
            <p>
              The strongest privacy strategy layers intelligence with automated action. Use FootprintIQ to map your full digital exposure and identify what matters most. Use Incogni to handle the automated broker removal component. FootprintIQ's remediation roadmap includes official opt-out links, so you can also handle removal manually if you prefer not to subscribe to a separate service.
            </p>
            <p>
              Learn more about <Link to="/breach-vs-digital-footprint-risk" className="text-accent hover:underline">breach risk vs digital footprint risk</Link> and <Link to="/how-to-monitor-your-online-exposure-after-a-breach" className="text-accent hover:underline">how to monitor your exposure after a breach</Link>.
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
              Map It. Prioritise It. Reduce It.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a free ethical footprint scan and discover what's publicly visible about you — across data brokers, social media, forums, and more.
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

export default IncogniVsFootprintiq;
