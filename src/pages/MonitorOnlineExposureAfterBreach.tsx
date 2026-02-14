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
  ChevronRight,
  Activity,
  Eye,
  TrendingUp,
  RefreshCw,
  Bell,
  CheckCircle2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/how-to-monitor-your-online-exposure-after-a-breach";

const webPageSchema = buildWebPageSchema({
  name: "How To Monitor Your Online Exposure After a Breach | FootprintIQ",
  description:
    "Learn why monitoring your digital exposure after a data breach is essential. Understand the difference between one-time scanning and continuous monitoring, and how FootprintIQ Pro helps you track exposure trends over time.",
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
      name: "Why should I monitor my exposure after a breach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Data breaches have long-term consequences that extend beyond the initial incident. Leaked data can surface on paste sites, get incorporated into data broker profiles, or be used in credential-stuffing attacks months or years later. Continuous monitoring ensures new exposures are caught early, before they can be exploited.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between scanning and monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scanning is a point-in-time assessment — it tells you what's visible right now. Monitoring is an ongoing process that tracks changes over time, alerting you when new exposures appear or existing ones change. FootprintIQ's free tier provides scanning. Pro plans add continuous monitoring with trend tracking and alerts.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I check my digital exposure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After a breach, you should scan immediately and then monitor regularly. For most people, a monthly check is a good baseline. If you're in a high-risk category — public figure, executive, journalist, activist — more frequent monitoring is recommended. FootprintIQ Pro automates this process with scheduled scans and trend tracking.",
      },
    },
    {
      "@type": "Question",
      name: "Can data brokers get my information from a breach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Data brokers primarily aggregate information from public records, social media, and commercial databases — not directly from breaches. However, breached data that becomes publicly accessible (e.g., posted on forums or paste sites) can eventually be incorporated into broker profiles. This is why monitoring both breach exposure and data broker listings is important.",
      },
    },
    {
      "@type": "Question",
      name: "What does FootprintIQ Pro monitoring include?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FootprintIQ Pro includes exposure trend tracking over time, historical Exposure Reduction Score graphs, false-positive filtering, deeper intelligence on each finding, scheduled automated scans, data broker monitoring, and a prioritised remediation roadmap that updates as your exposure changes. It transforms one-time scanning into continuous privacy management.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ monitor the dark web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FootprintIQ incorporates breach signals and publicly referenced dark web indicators as part of its analysis. However, it is an ethical digital footprint intelligence platform focused on publicly accessible data — it does not access private dark web forums or marketplaces. All intelligence is derived from public-data OSINT under a published Ethical OSINT Charter.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Monitor Exposure After a Breach", item: PAGE_URL },
  ],
};

const MonitorOnlineExposureAfterBreach = () => {
  return (
    <>
      <Helmet>
        <title>How To Monitor Your Online Exposure After a Breach | FootprintIQ</title>
        <meta
          name="description"
          content="Learn why monitoring your digital exposure after a data breach is essential. Understand the difference between one-time scanning and continuous monitoring, and how FootprintIQ Pro helps you track exposure trends over time."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How To Monitor Your Online Exposure After a Breach | FootprintIQ" />
        <meta property="og:description" content="Breaches have long-term consequences. Here's how to monitor your exposure — not just check it once." />
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
            <li className="text-foreground font-medium">Monitor Exposure After a Breach</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Ongoing Exposure Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              How To Monitor Your Online Exposure{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                After a Breach
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A breach isn't a one-time event — its consequences unfold over months and years. Here's how to stay ahead of your exposure.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Start Your First Scan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Why Breaches Increase Long-Term Exposure ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Why Breaches Increase Long-Term Exposure</h2>
            <p>
              When a data breach is announced, the immediate advice is straightforward: change your passwords, enable two-factor authentication, and monitor your financial accounts. These steps address the acute risk. But the downstream effects of a breach extend far beyond the first few weeks.
            </p>
            <p>
              Breached data doesn't simply disappear after the initial incident. It follows a lifecycle that can span years:
            </p>
            <ul>
              <li><strong>Initial exposure:</strong> Data is stolen and may be sold, shared, or dumped on underground forums. At this stage, it's primarily accessible to the attackers and their immediate network.</li>
              <li><strong>Secondary distribution:</strong> Breached datasets are traded, repackaged, and combined with data from other breaches. Compilation databases like "Collection #1" merge multiple breaches into massive searchable archives.</li>
              <li><strong>Public surfacing:</strong> Over time, breached data appears on paste sites, public forums, and even indexed web pages. What was once hidden behind underground forums becomes publicly discoverable.</li>
              <li><strong>Data broker incorporation:</strong> Information that becomes publicly accessible can be aggregated by data brokers and people-search sites, adding it to existing profiles alongside public records and social media data.</li>
              <li><strong>Credential-stuffing campaigns:</strong> Leaked credentials are tested against hundreds of services in automated attacks. These campaigns can continue for years after the original breach, targeting services you haven't even thought about.</li>
            </ul>
            <p>
              This lifecycle means that a breach you were notified about today may still be generating new exposure six months, a year, or even longer from now. A single check immediately after the breach won't catch these delayed consequences. This is why ongoing monitoring is essential — and why <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> is designed for continuous exposure tracking, not just one-time scanning.
            </p>
          </div>
        </section>

        {/* ── Monitoring vs One-Time Scanning ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Monitoring vs One-Time Scanning</h2>
            <p>
              There's an important distinction between <em>scanning</em> and <em>monitoring</em> — and understanding it changes how you approach digital privacy after a breach.
            </p>
            <p>
              <strong>Scanning</strong> is a point-in-time assessment. You run a scan, see your current exposure, and act on what you find. It answers the question: <em>"What's visible right now?"</em> This is valuable and essential — but it's a snapshot. The internet doesn't stand still, and neither does your exposure.
            </p>
            <p>
              <strong>Monitoring</strong> is an ongoing process. It tracks changes over time, comparing your current exposure against previous scans to identify new risks, resolved items, and emerging patterns. It answers the harder question: <em>"How is my exposure changing — and am I making progress?"</em>
            </p>
            <p>
              After a breach, one-time scanning gives you a baseline. Monitoring gives you a trajectory. Both are necessary, but monitoring is what transforms reactive breach response into proactive privacy management.
            </p>
            <p>
              FootprintIQ's free tier provides robust scanning — enough to understand your current exposure and identify the highest-priority risks. <Link to="/pricing" className="text-accent hover:underline">Pro plans</Link> add the monitoring layer: scheduled scans, historical comparisons, trend graphs, and the ability to track your Exposure Reduction Score™ over time. Learn more about <Link to="/how-it-works" className="text-accent hover:underline">how the platform works</Link>.
            </p>
          </div>
        </section>

        {/* ── Data Broker Tracking ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Data Broker Tracking</h2>
            <p>
              Data brokers and people-search sites represent one of the most persistent and underappreciated sources of digital exposure. Sites like Spokeo, BeenVerified, WhitePages, and dozens of others aggregate public records, social media data, and commercial databases into searchable profiles. These profiles often include your name, address, phone number, email, age, family members, and sometimes employment history.
            </p>
            <p>
              After a breach, data broker tracking becomes especially important for several reasons:
            </p>
            <ul>
              <li><strong>New data aggregation:</strong> If breached data becomes publicly accessible, data brokers may incorporate it into existing profiles, making those profiles more detailed and potentially more damaging.</li>
              <li><strong>Re-listing after removal:</strong> Even if you've previously opted out of data broker sites, many will re-list you when they acquire new data. Monitoring ensures you catch these re-listings before they become entrenched.</li>
              <li><strong>Cross-referencing:</strong> Brokers cross-reference multiple data sources. A breach that exposes your email address may allow a broker to link that email to other records they hold, expanding your profile significantly.</li>
            </ul>
            <p>
              FootprintIQ's scanning pipeline checks for data broker presence as a core component of your exposure assessment. Pro monitoring tracks these listings over time, alerting you when new listings appear or previously removed ones resurface. Combined with the <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>, all data broker analysis is conducted using publicly accessible sources only.
            </p>
          </div>
        </section>

        {/* ── Exposure Trend Tracking ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Exposure{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Trend Tracking</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Numbers tell a story. Trends tell you whether you're winning.
              </p>
            </div>

            <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
              <p>
                A single exposure score is useful. A trend line is transformative. When you track your digital exposure over weeks and months, you gain insights that no single scan can provide:
              </p>
              <ul>
                <li><strong>Remediation validation:</strong> Did removing that data broker listing actually reduce your exposure? Trend tracking confirms whether your actions had the intended effect.</li>
                <li><strong>New exposure detection:</strong> If your score drops between scans, you know something changed — a new profile was indexed, a data broker re-listed you, or previously private information became public.</li>
                <li><strong>Progress motivation:</strong> Seeing your Exposure Reduction Score™ climb from 45 to 72 over three months provides tangible evidence that your privacy efforts are working.</li>
                <li><strong>Baseline establishment:</strong> Your first scan establishes a baseline. Every subsequent scan measures progress against that baseline, giving you a clear picture of your privacy trajectory.</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center hover:border-accent/30 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Scan</h3>
                <p className="text-sm text-muted-foreground">See your current exposure across hundreds of platforms and data sources.</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center hover:border-accent/30 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Track</h3>
                <p className="text-sm text-muted-foreground">Monitor how your exposure changes over time with historical trend graphs.</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center hover:border-accent/30 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Reduce</h3>
                <p className="text-sm text-muted-foreground">Follow the prioritised remediation roadmap and watch your score improve.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pro Monitoring ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pro Monitoring:{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Intelligence + Control</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Free scans show where you stand. Pro monitoring shows where you're heading — and keeps you on track.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-4">Free Tier</h3>
                <p className="text-sm text-muted-foreground mb-4">Essential exposure awareness — the starting point for any privacy assessment.</p>
                <ul className="space-y-3">
                  {[
                    "Point-in-time exposure scanning",
                    "Current Exposure Reduction Score™",
                    "Basic platform detection",
                    "High-level remediation guidance",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-accent/30 bg-card p-6 md:p-8 relative">
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  Recommended after a breach
                </div>
                <h3 className="text-xl font-semibold mb-4">Pro Intelligence</h3>
                <p className="text-sm text-muted-foreground mb-4">Continuous monitoring and deep intelligence for ongoing privacy management.</p>
                <ul className="space-y-3">
                  {[
                    "Historical Exposure Reduction Score™ tracking",
                    "Trend graphs and progress analytics",
                    "False-positive filtering and confidence scoring",
                    "Deeper intelligence on each finding",
                    "Data broker monitoring and re-listing alerts",
                    "Scheduled automated scans",
                    "Prioritised, updating remediation roadmap",
                    "Exportable intelligence reports",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full mt-6">
                  <Link to="/pricing">
                    Switch to Pro Intelligence <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="max-w-3xl mx-auto mt-8 prose prose-lg dark:prose-invert">
              <p>
                Pro monitoring is particularly valuable after a breach because the delayed consequences of data exposure — secondary distribution, data broker incorporation, and credential-stuffing campaigns — unfold over months. A single scan captures the immediate picture. Pro monitoring ensures you catch the downstream effects as they emerge.
              </p>
              <p>
                All monitoring operates under FootprintIQ's published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>. No private data access, no scraping behind logins, no data brokerage. Every insight is derived from publicly accessible sources with full transparency.
              </p>
            </div>
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
              Start Monitoring Your Exposure Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Begin with a free scan to see where you stand. Upgrade to Pro for continuous monitoring that catches what one-time checks miss.
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

export default MonitorOnlineExposureAfterBreach;