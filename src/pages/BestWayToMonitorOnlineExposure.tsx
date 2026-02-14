import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
  ChevronRight,
  TrendingUp,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/best-way-to-monitor-your-online-exposure";

const webPageSchema = buildWebPageSchema({
  name: "Best Way to Monitor Your Online Exposure (2026 Guide) | FootprintIQ",
  description:
    "Learn why online exposure changes over time and how to monitor it effectively. Compare snapshot scanning vs continuous monitoring and find the right approach for your needs.",
  url: PAGE_URL,
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why does my online exposure change over time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your digital footprint is dynamic. New accounts get created, old profiles get indexed by search engines, data brokers re-list removed information, breaches expose credentials, and third parties share content that references you. Even if you take no action, your exposure can increase passively over time.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a snapshot scan and continuous monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A snapshot scan captures your digital exposure at a single point in time — useful for understanding your current state. Continuous monitoring tracks changes over time, alerting you when new exposures appear, old ones reappear, or your risk profile shifts. Snapshot scanning answers 'what's visible now?' while monitoring answers 'what's changing?'",
      },
    },
    {
      "@type": "Question",
      name: "How often should I scan my digital footprint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At minimum, quarterly. After a known breach or major life event (job change, move, new social accounts), scan immediately. For ongoing privacy management, monthly or continuous automated monitoring provides the best visibility into changes and emerging exposures.",
      },
    },
    {
      "@type": "Question",
      name: "Can I monitor my exposure for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — FootprintIQ offers free scans that map your public digital exposure across hundreds of platforms. Free scans provide a snapshot. Pro plans add continuous monitoring, exposure trend tracking, automated re-scanning, and prioritised alerts when your risk profile changes.",
      },
    },
    {
      "@type": "Question",
      name: "What should a good monitoring tool track?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A comprehensive monitoring tool should track: public profile visibility across platforms, username reuse patterns, data broker re-listings, breach signal detection, exposure score changes over time, and new indexing by search engines. It should also provide prioritised alerts rather than overwhelming you with noise.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ offer continuous monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — FootprintIQ Pro includes automated re-scanning, exposure trend graphs, historical comparison, and prioritised alerts when new exposures are detected or your risk profile shifts. Free users can run on-demand scans at any time for snapshot visibility.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Best Way to Monitor Online Exposure", item: PAGE_URL },
  ],
};

type CellValue = "yes" | "no" | "partial" | string;

const comparisonRows: { feature: string; snapshot: CellValue; continuous: CellValue; footprintiqPro: CellValue }[] = [
  { feature: "Current exposure visibility", snapshot: "yes", continuous: "yes", footprintiqPro: "yes" },
  { feature: "Change detection over time", snapshot: "no", continuous: "yes", footprintiqPro: "yes" },
  { feature: "Exposure trend graphs", snapshot: "no", continuous: "partial", footprintiqPro: "yes" },
  { feature: "New exposure alerts", snapshot: "no", continuous: "yes", footprintiqPro: "yes" },
  { feature: "Data broker re-listing detection", snapshot: "no", continuous: "yes", footprintiqPro: "yes" },
  { feature: "Breach signal correlation", snapshot: "partial", continuous: "partial", footprintiqPro: "yes" },
  { feature: "Username reuse tracking", snapshot: "partial", continuous: "no", footprintiqPro: "yes" },
  { feature: "Remediation progress tracking", snapshot: "no", continuous: "partial", footprintiqPro: "yes" },
  { feature: "Historical comparison", snapshot: "no", continuous: "partial", footprintiqPro: "yes" },
  { feature: "Prioritised risk scoring", snapshot: "partial", continuous: "partial", footprintiqPro: "yes" },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-muted-foreground/60" />;
  return <span className="text-sm">{value}</span>;
}

const BestWayToMonitorOnlineExposure = () => {
  return (
    <>
      <Helmet>
        <title>Best Way to Monitor Your Online Exposure (2026 Guide) | FootprintIQ</title>
        <meta
          name="description"
          content="Learn why online exposure changes over time and how to monitor it effectively. Compare snapshot scanning vs continuous monitoring and find the right approach."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Best Way to Monitor Your Online Exposure (2026 Guide)" />
        <meta property="og:description" content="Snapshot scanning vs continuous monitoring — which approach protects your privacy better?" />
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
            <li className="text-foreground font-medium">Best Way to Monitor Online Exposure</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">2026 Guide</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Best Way to Monitor Your{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Online Exposure
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Your digital footprint isn't static. Learn why exposure changes over time and how to choose between snapshot scanning, continuous monitoring, and intelligence-driven approaches.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Run a Free Exposure Scan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Why Exposure Changes ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Why Your Online Exposure Changes Over Time</h2>
            <p>
              Most people think of their digital footprint as something they create and control. The reality is more complex. Your online exposure is a <strong>living, evolving surface</strong> that changes constantly — often without your knowledge or action.
            </p>

            <div className="not-prose grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <TrendingUp className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">Passive growth</h3>
                <p className="text-sm text-muted-foreground">Search engines index old profiles. Data brokers aggregate new records. Third parties mention you in posts, reviews, or public documents. Your exposure grows even when you do nothing.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <RefreshCw className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">Re-listing cycles</h3>
                <p className="text-sm text-muted-foreground">Data brokers frequently re-add information after removal. A broker you opted out of six months ago may have re-listed your data from a different source. Without monitoring, you won't know.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <Eye className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">Breach cascades</h3>
                <p className="text-sm text-muted-foreground">When a service you used years ago gets breached, your credentials enter circulation. This creates new exposure — your email, username, or password hash becomes discoverable in breach databases.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <Activity className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">Platform changes</h3>
                <p className="text-sm text-muted-foreground">Social platforms update privacy settings, sometimes making previously private information public by default. API changes can expose data that was previously hidden. Settings you configured years ago may no longer apply.</p>
              </div>
            </div>

            <p>
              The implication is clear: a single scan tells you where you stand <em>today</em>, but it says nothing about tomorrow. Effective privacy management requires understanding not just your current exposure, but how it's changing over time.
            </p>
          </div>
        </section>

        {/* ── Snapshot vs Continuous ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Snapshot Scanning vs Continuous Monitoring</h2>
            <p>
              There are two fundamental approaches to tracking digital exposure. Understanding the difference is essential for choosing the right strategy.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Snapshot Scanning</h3>
            <p>
              A snapshot scan captures your digital exposure at a single point in time. You run a scan, receive results, and take action based on what's found. It answers the question: <em>"What's visible about me right now?"</em>
            </p>
            <p>
              Snapshot scans are valuable as a starting point. They give you a baseline understanding of your exposure and a clear set of items to remediate. Most free tools — including FootprintIQ's free tier — operate in this mode.
            </p>
            <p>
              The limitation is temporal blindness. A snapshot taken in January won't reflect a broker re-listing in March, a new breach in April, or a platform privacy change in May. Without follow-up scans, your picture becomes stale quickly.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Continuous Monitoring</h3>
            <p>
              Continuous monitoring tracks your exposure over time, detecting changes as they happen. It answers a more powerful question: <em>"What's changing about my exposure, and should I be concerned?"</em>
            </p>
            <p>
              Good monitoring systems provide: automated re-scanning on a schedule, alerts when new exposures are detected, trend graphs showing whether your overall exposure is increasing or decreasing, and historical comparison so you can see the impact of your remediation efforts.
            </p>
            <p>
              The trade-off is cost and complexity. Continuous monitoring typically requires a paid subscription. But for users who take privacy seriously — particularly after a <Link to="/breach-vs-digital-footprint-risk" className="text-accent hover:underline">breach event</Link> — the visibility into how exposure changes over time is invaluable.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">The Intelligence Approach</h3>
            <p>
              The most effective strategy combines both with an intelligence layer. <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> provides snapshot scans (free) and continuous monitoring (Pro), but adds what most tools lack: <em>prioritised, scored intelligence</em> that tells you not just what changed, but whether it matters and what to do about it.
            </p>
            <p>
              Instead of receiving a firehose of alerts, you get a prioritised view — ranked by risk, filtered for false positives, and linked to specific remediation steps. This is the difference between <strong>data and actionable intelligence</strong>.
            </p>
          </div>
        </section>

        {/* ── What to Look For ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What to Look for in a Monitoring Tool</h2>
            <p>
              Not all monitoring tools are equal. When evaluating options, consider these criteria:
            </p>
            <ul>
              <li><strong>Breadth of coverage:</strong> Does the tool monitor only data brokers, or does it cover social media, forums, search engines, breach databases, and public records? The broader the coverage, the fewer blind spots in your exposure tracking.</li>
              <li><strong>Change detection:</strong> Can the tool tell you what's <em>new</em> since your last scan? Detecting new exposures is more valuable than simply re-listing the same findings. Look for explicit "new", "changed", and "resolved" indicators.</li>
              <li><strong>Exposure trending:</strong> Does the tool show your exposure trajectory over time? A trend graph that shows your Exposure Reduction Score™ improving (or worsening) is far more actionable than a static number.</li>
              <li><strong>Signal vs noise:</strong> How well does the tool filter false positives and prioritise findings? A tool that sends 50 alerts for username matches belonging to other people creates alert fatigue, not security. Look for confidence scoring and intelligent filtering.</li>
              <li><strong>Remediation guidance:</strong> Does the tool tell you <em>what to do</em> about new exposures, or just that they exist? The best tools provide prioritised, actionable remediation steps — not just a list of problems.</li>
              <li><strong>Ethical methodology:</strong> Is the tool transparent about its scanning methods? Does it use only publicly accessible data? Is there a published methodology? Trust matters when you're giving a tool access to sensitive information about your digital presence.</li>
            </ul>
            <p>
              FootprintIQ meets all six criteria, operating under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> with full methodological transparency.
            </p>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Monitoring Approaches{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Compared</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Snapshot tools, generic continuous monitoring, and FootprintIQ Pro compared across 10 key capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-muted-foreground">Capability</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Snapshot Tools</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Generic Monitoring</th>
                    <th className="p-4 text-center text-sm font-semibold text-accent">FootprintIQ Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 text-sm font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.snapshot} /></div></td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.continuous} /></div></td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.footprintiqPro} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-4">
              ✓ = Full support &nbsp; — = Partial &nbsp; ✕ = Not included.
            </p>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                See how FootprintIQ compares:{" "}
                <Link to="/best-digital-footprint-scanner" className="text-accent hover:underline">Best Scanner Guide</Link>{" · "}
                <Link to="/how-to-monitor-your-online-exposure-after-a-breach" className="text-accent hover:underline">Post-Breach Monitoring</Link>
              </p>
            </div>
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
              Start With a Free Snapshot
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a free ethical footprint scan to see your current exposure. Upgrade to Pro for continuous monitoring, trend tracking, and prioritised intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Run Your Ethical Footprint Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pro Monitoring</Link>
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

export default BestWayToMonitorOnlineExposure;
