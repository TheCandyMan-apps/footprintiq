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

const PAGE_URL = "https://footprintiq.app/kanary-vs-footprintiq";

const webPageSchema = buildWebPageSchema({
  name: "Kanary vs FootprintIQ – Personal Data Removal vs Exposure Intelligence (2026) | FootprintIQ",
  description:
    "Compare Kanary and FootprintIQ in 2026. Kanary finds and removes personal data from data brokers. FootprintIQ maps your full digital exposure with ethical OSINT intelligence.",
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
      name: "Is Kanary the same as FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Kanary focuses on finding and removing your personal data from data brokers and people-search sites. FootprintIQ is a digital footprint intelligence platform that maps your full public exposure — including username reuse, public profiles, and breach signals — and provides a prioritised remediation roadmap.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use Kanary and FootprintIQ together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — they complement each other well. FootprintIQ maps your full exposure and helps you prioritise what matters most. Kanary then handles the automated discovery and removal of personal data from broker sites. Intelligence first, targeted removal second.",
      },
    },
    {
      "@type": "Question",
      name: "Does Kanary detect username reuse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Kanary focuses on personal data discovery and removal from data brokers. It doesn't scan for public profiles across social media, detect username reuse patterns, or map cross-platform identity chains. FootprintIQ provides these capabilities.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ remove personal data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ provides the intelligence layer — mapping your exposure, scoring risk, and generating a prioritised remediation roadmap with official opt-out links. The removal action is up to you or a dedicated service like Kanary.",
      },
    },
    {
      "@type": "Question",
      name: "Which is better for digital privacy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They address different aspects of privacy. Kanary is better for automated personal data removal from brokers. FootprintIQ is better for understanding your complete digital exposure — including profiles, username reuse, and breach signals — and making strategic decisions about what to address first. The most effective approach uses both.",
      },
    },
    {
      "@type": "Question",
      name: "Does Kanary re-check after removal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — Kanary provides continuous monitoring and re-removal if your data reappears on broker sites. FootprintIQ Pro also offers ongoing exposure monitoring, but across a broader range of sources including social media, forums, and breach databases — not just data brokers.",
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
    { "@type": "ListItem", position: 3, name: "Kanary vs FootprintIQ", item: PAGE_URL },
  ],
};

type CellValue = "yes" | "no" | "partial" | string;

const comparisonRows: { feature: string; kanary: CellValue; footprintiq: CellValue }[] = [
  { feature: "Personal data discovery", kanary: "yes", footprintiq: "yes" },
  { feature: "Automated removal requests", kanary: "yes", footprintiq: "no" },
  { feature: "Re-removal monitoring", kanary: "yes", footprintiq: "no" },
  { feature: "Public profile scanning", kanary: "partial", footprintiq: "yes" },
  { feature: "Username reuse detection", kanary: "no", footprintiq: "yes" },
  { feature: "Breach signal detection", kanary: "no", footprintiq: "yes" },
  { feature: "Exposure scoring", kanary: "no", footprintiq: "yes" },
  { feature: "Remediation priority ranking", kanary: "no", footprintiq: "yes" },
  { feature: "Cross-platform visibility map", kanary: "no", footprintiq: "yes" },
  { feature: "Ethical OSINT methodology", kanary: "partial", footprintiq: "yes" },
  { feature: "Free tier available", kanary: "no", footprintiq: "yes" },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-muted-foreground/60" />;
  return <span className="text-sm">{value}</span>;
}

const KanaryVsFootprintiq = () => {
  return (
    <>
      <Helmet>
        <title>Kanary vs FootprintIQ – Personal Data Removal vs Exposure Intelligence (2026) | FootprintIQ</title>
        <meta
          name="description"
          content="Compare Kanary and FootprintIQ in 2026. Kanary finds and removes personal data from data brokers. FootprintIQ maps your full digital exposure with ethical OSINT intelligence."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Kanary vs FootprintIQ – Personal Data Removal vs Exposure Intelligence (2026)" />
        <meta property="og:description" content="Personal data removal compared with ethical digital footprint intelligence." />
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
            <li className="text-foreground font-medium">Kanary vs FootprintIQ</li>
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
              Kanary vs{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                FootprintIQ
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Automated personal data removal compared with comprehensive digital footprint intelligence. Two complementary layers of a privacy-first strategy.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Try FootprintIQ Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Kanary Overview ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is Kanary?</h2>
            <p>
              Kanary is a personal data removal service that scans the web for your name, address, phone number, email, and other personal identifiers on data broker and people-search sites. When it finds your information, it submits removal requests automatically and monitors for re-listings over time.
            </p>
            <p>
              Kanary's approach is <strong>discovery plus removal</strong>. Unlike some competitors that focus purely on opt-out submission, Kanary emphasises the discovery phase — showing you where your personal data appears before initiating removal. It provides a clean, user-friendly dashboard that tracks the status of each removal request and alerts you if data reappears.
            </p>
            <p>
              The service is newer to the market compared to established players like DeleteMe, but has gained traction for its <strong>straightforward interface and focused execution</strong>. Kanary handles the tedious, repetitive process of contacting data brokers, filling out opt-out forms, and following up — saving users significant time and effort.
            </p>
            <p>
              However, like all data broker removal services, Kanary's scope is limited to a specific category of digital exposure. It doesn't scan for public social media profiles, detect username reuse across platforms, incorporate breach signals, or provide the kind of cross-platform exposure intelligence that a broader footprint analysis requires.
            </p>
          </div>
        </section>

        {/* ── FootprintIQ Overview ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is FootprintIQ?</h2>
            <p>
              <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> operates at a different layer. Rather than focusing on removal of a specific data category, FootprintIQ maps your <em>entire</em> public digital presence — showing you everything that's visible, how different exposures connect, and which ones carry the highest risk.
            </p>
            <p>
              The platform scans hundreds of platforms for public profiles, detects username reuse that creates cross-platform identity chains, checks data broker presence, incorporates breach signals, and generates a quantified Exposure Reduction Score™. The output is a prioritised remediation roadmap — not just a list of findings, but a structured plan that tells you what to address first and why.
            </p>
            <p>
              FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>: only publicly accessible data, consent-based scanning, no data brokerage, and full methodological transparency. It offers free scans for basic visibility, with Pro plans providing deeper intelligence, false-positive filtering, exposure trend tracking, and structured guidance.
            </p>
            <p>
              Learn more about <Link to="/how-it-works" className="text-accent hover:underline">how FootprintIQ's scanning pipeline works</Link>.
            </p>
          </div>
        </section>

        {/* ── Discovery & Removal vs Intelligence ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Discovery & Removal vs Full Exposure Intelligence</h2>
            <p>
              Kanary and FootprintIQ overlap in one area — both discover where your information appears online. But they diverge sharply in scope, depth, and what they do with that information.
            </p>
            <p>
              <strong>Kanary's scope is data brokers.</strong> It identifies your personal information on people-search and data aggregation sites, then automates the removal process. This is valuable, targeted work. Data brokers are persistent — they re-list information regularly, and having a service that monitors and re-submits removal requests saves significant ongoing effort.
            </p>
            <p>
              <strong>FootprintIQ's scope is your entire digital footprint.</strong> Data brokers are one category, but your public exposure extends across social media platforms, forums, code repositories, professional networks, public records, and search engine results. Username reuse creates invisible links between accounts. Breach signals indicate where your credentials may have been exposed. FootprintIQ maps all of this, scores the risk, and provides a prioritised plan.
            </p>
            <p>
              The key insight is that <strong>removal without intelligence is incomplete</strong>. If you remove your data from 200 broker sites but leave the same username visible across 50 social platforms, your exposure hasn't fundamentally changed — it's just shifted. FootprintIQ provides the strategic layer that ensures your privacy efforts are targeted where they matter most.
            </p>
            <p>
              This is why FootprintIQ positions itself as the <strong>intelligence layer above removal services</strong>. Map it. Prioritise it. Reduce it. Services like Kanary handle the removal mechanics for the broker category; FootprintIQ handles the strategic intelligence for everything.
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
                Kanary and FootprintIQ compared across 11 key capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-muted-foreground">Feature</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Kanary</th>
                    <th className="p-4 text-center text-sm font-semibold text-accent">FootprintIQ</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 text-sm font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.kanary} /></div></td>
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

        {/* ── Use Case Breakdown ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">When to Choose Each Tool</h2>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Choose Kanary If…</h3>
            <ul>
              <li><strong>Your main goal is personal data removal:</strong> You know your name, address, and phone number are listed on data broker sites and you want a service to find and remove them systematically.</li>
              <li><strong>You want continuous re-monitoring:</strong> Kanary checks for re-listings and re-submits removal requests automatically — important because brokers frequently re-add information after initial removal.</li>
              <li><strong>You prefer a clean, focused interface:</strong> Kanary's dashboard is straightforward — it shows what was found, what's been removed, and what's still pending.</li>
              <li><strong>You don't need broader exposure intelligence:</strong> If data brokers are your primary concern and you're not worried about social media visibility, username reuse, or breach signals, Kanary covers that slice well.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Choose FootprintIQ If…</h3>
            <ul>
              <li><strong>You want the full picture first:</strong> Before deciding what to remove, you want to understand your complete digital exposure — profiles, username chains, breach signals, broker listings, and public records.</li>
              <li><strong>Username reuse is a concern:</strong> FootprintIQ reveals cross-platform identity chains that removal services miss entirely — showing how different accounts link together through shared handles.</li>
              <li><strong>You need prioritised, strategic guidance:</strong> Instead of treating all exposures equally, FootprintIQ ranks them by risk and impact with a structured remediation roadmap.</li>
              <li><strong>You want a free starting point:</strong> FootprintIQ offers free scans to assess your exposure before committing to a paid plan. Kanary requires a subscription.</li>
              <li><strong>Ethical methodology and transparency matter:</strong> FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> with full methodological transparency.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Use Both Together</h3>
            <p>
              The strongest privacy strategy layers intelligence with targeted action. Use FootprintIQ to map your full digital exposure and identify what matters most. Use Kanary to handle the automated discovery and removal of personal data from broker sites. FootprintIQ's remediation roadmap includes official opt-out links, so you can also handle removal manually if preferred.
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

export default KanaryVsFootprintiq;
