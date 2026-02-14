import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  ArrowRight,
  ChevronRight,
  Activity,
  Bell,
  TrendingDown,
  BarChart3,
  ShieldCheck,
  Zap,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Minus,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/continuous-exposure-monitoring-explained";

const webPageSchema = buildWebPageSchema({
  name: "Continuous Exposure Monitoring Explained (2026) | FootprintIQ",
  description:
    "Understand how continuous exposure monitoring works, why single scans aren't enough, and how FootprintIQ Pro delivers prioritised intelligence — not just alerts.",
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
      name: "What is continuous exposure monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Continuous exposure monitoring is the automated, ongoing tracking of your digital footprint across platforms, data brokers, breach databases, and public sources. Unlike a one-time scan that captures a single snapshot, continuous monitoring detects changes over time — alerting you when new exposures appear, old ones reappear after removal, or your overall risk profile shifts.",
      },
    },
    {
      "@type": "Question",
      name: "How is continuous monitoring different from dark web monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dark web monitoring focuses narrowly on breach databases and credential dumps. Continuous exposure monitoring is broader — it tracks your visibility across social platforms, data brokers, search engines, forums, and breach sources simultaneously. It answers 'what's publicly visible about me and how is it changing?' rather than just 'have my credentials been leaked?'",
      },
    },
    {
      "@type": "Question",
      name: "How often does FootprintIQ Pro re-scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FootprintIQ Pro runs automated re-scans on a configurable schedule. The system tracks changes between scans and surfaces only meaningful differences — new exposures, resolved items, and risk score changes — rather than re-displaying the same static results.",
      },
    },
    {
      "@type": "Question",
      name: "Will I get overwhelmed with alerts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ Pro uses confidence scoring and false-positive filtering to ensure you only receive alerts that matter. Findings are prioritised by risk level and relevance, so you see actionable intelligence rather than a firehose of raw matches. This is the key difference between monitoring and intelligence.",
      },
    },
    {
      "@type": "Question",
      name: "Can I monitor multiple identities or usernames?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — FootprintIQ Pro supports multi-profile monitoring. You can track multiple usernames, email addresses, and phone numbers across your digital presence. The system correlates findings across identifiers to build a unified exposure picture.",
      },
    },
    {
      "@type": "Question",
      name: "Do I still need monitoring if I've already removed myself from data brokers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Data brokers re-list information regularly from new sources. Platforms change privacy defaults. New breaches expose old credentials. Removal is one action at one point in time — monitoring ensures that action stays effective. Without monitoring, you won't know when your exposure increases again.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Continuous Exposure Monitoring", item: PAGE_URL },
  ],
};

type CellVal = "yes" | "no" | "partial";

const comparisonRows: { capability: string; free: CellVal; generic: CellVal; pro: CellVal }[] = [
  { capability: "On-demand snapshot scans", free: "yes", generic: "yes", pro: "yes" },
  { capability: "Automated re-scanning", free: "no", generic: "yes", pro: "yes" },
  { capability: "Change detection (new / resolved)", free: "no", generic: "partial", pro: "yes" },
  { capability: "Exposure trend graphs", free: "no", generic: "no", pro: "yes" },
  { capability: "False-positive filtering", free: "partial", generic: "no", pro: "yes" },
  { capability: "Confidence-scored findings", free: "partial", generic: "no", pro: "yes" },
  { capability: "Prioritised risk alerts", free: "no", generic: "partial", pro: "yes" },
  { capability: "Broker re-listing detection", free: "no", generic: "partial", pro: "yes" },
  { capability: "Multi-profile monitoring", free: "no", generic: "no", pro: "yes" },
  { capability: "Remediation progress tracking", free: "no", generic: "no", pro: "yes" },
  { capability: "Exportable intelligence reports", free: "no", generic: "no", pro: "yes" },
];

function CellIcon({ value }: { value: CellVal }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40" />;
  return <Minus className="w-4 h-4 text-muted-foreground/60" />;
}

const ContinuousExposureMonitoring = () => {
  return (
    <>
      <Helmet>
        <title>Continuous Exposure Monitoring Explained (2026) | FootprintIQ</title>
        <meta
          name="description"
          content="Understand how continuous exposure monitoring works, why single scans aren't enough, and how FootprintIQ Pro delivers prioritised intelligence — not just alerts."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Continuous Exposure Monitoring Explained (2026)" />
        <meta property="og:description" content="Why one-time scans aren't enough and how intelligent monitoring protects your digital footprint over time." />
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
            <li className="text-foreground font-medium">Continuous Exposure Monitoring</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Pro Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Continuous Exposure{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Monitoring Explained
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A single scan shows where you stand today. Continuous monitoring shows where your exposure is heading — and tells you when to act.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Start With a Free Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">Switch to Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── The Problem With Snapshots ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">The Problem With One-Time Scans</h2>
            <p>
              A single scan gives you a snapshot — a useful starting point, but fundamentally limited. Your digital footprint is not static. It changes constantly through forces outside your control:
            </p>
            <ul>
              <li><strong>Data brokers re-list</strong> your information weeks after removal, sourced from a different public record or commercial database.</li>
              <li><strong>New breaches</strong> expose credentials from services you used years ago and forgot about.</li>
              <li><strong>Platform privacy changes</strong> make previously private profiles publicly searchable.</li>
              <li><strong>Third-party mentions</strong> — reviews, forum posts, tagged photos — create new exposure without your involvement.</li>
              <li><strong>Search engine indexing</strong> surfaces old content that wasn't previously ranked.</li>
            </ul>
            <p>
              A scan from January tells you nothing about a broker re-listing in March, a breach in April, or a privacy setting change in May. Without ongoing visibility, your picture of reality degrades rapidly.
            </p>
            <p>
              This is why monitoring exists — not to replace scans, but to extend their value over time.
            </p>
          </div>
        </section>

        {/* ── What Monitoring Actually Means ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Continuous Monitoring Actually Does</h2>
            <p>
              True continuous monitoring is more than automated re-scanning. It's a system that tracks, compares, and interprets your exposure over time. Here's what separates real monitoring from basic alert services:
            </p>

            <div className="not-prose grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <RefreshCw className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">Automated Re-Scanning</h3>
                <p className="text-sm text-muted-foreground">Scheduled scans run without manual intervention, checking your identifiers against platforms, brokers, and breach databases on a recurring basis.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <Eye className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">Change Detection</h3>
                <p className="text-sm text-muted-foreground">The system compares new results against previous scans and surfaces what's different — new exposures, resolved items, and re-listings. You see what changed, not the same static list.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <BarChart3 className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">Exposure Trending</h3>
                <p className="text-sm text-muted-foreground">Track whether your overall exposure is increasing or decreasing over time. Trend graphs show the impact of your remediation efforts and highlight when new risks emerge.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <Bell className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">Prioritised Alerts</h3>
                <p className="text-sm text-muted-foreground">Not every change matters equally. Intelligent monitoring ranks findings by risk level and filters false positives, so you respond to what matters — not noise.</p>
              </div>
            </div>

            <p>
              The goal isn't to bombard you with notifications. It's to give you a clear, ongoing picture of your exposure trajectory and surface the moments that require your attention.
            </p>
          </div>
        </section>

        {/* ── Monitoring vs Intelligence ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Monitoring vs Intelligence</h2>
            <p>
              Most monitoring tools stop at detection: <em>"Something changed."</em> That's useful but incomplete. What you actually need to know is: <em>"Does this change matter, and what should I do about it?"</em>
            </p>
            <p>
              This is the difference between <strong>monitoring</strong> and <strong>intelligence</strong>:
            </p>

            <div className="not-prose space-y-4 my-8">
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Monitoring tells you:</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 mt-2">
                  <li>• A new listing appeared on Spokeo</li>
                  <li>• Your email was found in a breach database</li>
                  <li>• A username match was detected on a new platform</li>
                </ul>
              </div>
              <div className="bg-card border border-accent/30 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2 text-accent">Intelligence tells you:</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 mt-2">
                  <li>• The Spokeo listing is a <strong>re-listing</strong> — you removed it 3 months ago and it's back from a new source. Priority: high.</li>
                  <li>• The breach is from 2019 and contains only an email hash — no plaintext password. Priority: low.</li>
                  <li>• The username match has a <strong>42% confidence score</strong> — likely a different person. Flagged as probable false positive.</li>
                </ul>
              </div>
            </div>

            <p>
              FootprintIQ Pro operates at the intelligence layer. It doesn't just detect changes — it <strong>scores, filters, prioritises, and contextualises</strong> them so you can make informed decisions rather than reacting to noise.
            </p>
          </div>
        </section>

        {/* ── What Pro Includes ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">What FootprintIQ Pro Monitoring Includes</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Pro gives you control — not just visibility. Here's what's included beyond the free snapshot tier:
            </p>

            <div className="space-y-4">
              {[
                { icon: RefreshCw, title: "Automated Re-Scanning", desc: "Scheduled scans across platforms, brokers, and breach sources — no manual intervention needed." },
                { icon: TrendingDown, title: "Exposure Trend Tracking", desc: "Visualise whether your digital footprint is growing or shrinking over weeks and months." },
                { icon: ShieldCheck, title: "False-Positive Filtering", desc: "Confidence-scored results with intelligent filtering so you focus on real exposures, not noise." },
                { icon: Bell, title: "Prioritised Change Alerts", desc: "Notifications ranked by risk level — new high-severity exposures surface immediately, low-risk changes are batched." },
                { icon: BarChart3, title: "Historical Comparison", desc: "Compare any two scan periods side-by-side to see exactly what appeared, disappeared, or changed." },
                { icon: Zap, title: "Multi-Profile Monitoring", desc: "Track multiple usernames, emails, and phone numbers across your digital presence in one unified dashboard." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start bg-card border border-border/50 rounded-xl p-5 hover:border-accent/30 transition-colors">
                  <item.icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Plus: exportable intelligence reports, removal workflow tracking, and remediation priority ranking. See{" "}
              <Link to="/pricing" className="text-accent hover:underline">full Pro feature breakdown</Link>.
            </p>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Free vs Generic vs{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Pro Intelligence</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                How FootprintIQ Pro compares to free snapshots and generic monitoring services across 11 capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-muted-foreground">Capability</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Free Scans</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">Generic Monitoring</th>
                    <th className="p-4 text-center text-sm font-semibold text-accent">FootprintIQ Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.capability} className={i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 text-sm font-medium">{row.capability}</td>
                      <td className="p-4"><div className="flex justify-center"><CellIcon value={row.free} /></div></td>
                      <td className="p-4"><div className="flex justify-center"><CellIcon value={row.generic} /></div></td>
                      <td className="p-4"><div className="flex justify-center"><CellIcon value={row.pro} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-4">
              ✓ Full support · — Partial · ✕ Not included
            </p>
          </div>
        </section>

        {/* ── Who Needs Monitoring ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Who Needs Continuous Monitoring?</h2>
            <p>
              Not everyone needs continuous monitoring — but more people benefit from it than realise. Consider monitoring if you fall into any of these categories:
            </p>
            <ul>
              <li><strong>After a data breach:</strong> If your credentials were exposed in a breach, monitoring tracks whether the exposure spreads and alerts you to credential-stuffing risks across linked accounts.</li>
              <li><strong>After data broker removal:</strong> Removal without monitoring is incomplete. Brokers re-list data regularly. Monitoring catches re-listings before the data propagates to downstream brokers.</li>
              <li><strong>Public-facing professionals:</strong> Journalists, executives, lawyers, and public figures have inherently higher exposure. Monitoring provides early warning when new personal information becomes publicly accessible.</li>
              <li><strong>Security-conscious individuals:</strong> If you've taken steps to reduce your digital footprint, monitoring validates that those efforts are holding — and alerts you when they aren't.</li>
              <li><strong>Organisations managing employee exposure:</strong> Security teams can monitor multiple profiles to assess organisational exposure and track remediation progress across the team.</li>
            </ul>
            <p>
              For a deeper look at post-breach monitoring specifically, see{" "}
              <Link to="/how-to-monitor-your-online-exposure-after-a-breach" className="text-accent hover:underline">
                How to Monitor Your Exposure After a Breach
              </Link>.
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

        {/* ── CTA ── */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Map It. Monitor It. Reduce It.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Start with a free scan to see your current exposure. Upgrade to Pro for continuous monitoring, trend tracking, and prioritised intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Run Your Free Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">Switch to Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>

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

export default ContinuousExposureMonitoring;
