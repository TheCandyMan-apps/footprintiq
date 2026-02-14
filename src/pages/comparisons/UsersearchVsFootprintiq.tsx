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

const PAGE_URL = "https://footprintiq.app/usersearch-vs-footprintiq";

const webPageSchema = buildWebPageSchema({
  name: "UserSearch vs FootprintIQ – Username Lookup vs Exposure Intelligence (2026) | FootprintIQ",
  description:
    "Compare UserSearch and FootprintIQ in 2026. UserSearch offers free username lookups. FootprintIQ provides ethical digital footprint intelligence with exposure scoring and remediation.",
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
      name: "Is UserSearch the same as FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. UserSearch is a free username lookup tool that checks whether a username exists across social media and websites. FootprintIQ is a comprehensive digital footprint intelligence platform that maps public exposure, detects username reuse patterns, incorporates breach signals, and provides a prioritised remediation roadmap.",
      },
    },
    {
      "@type": "Question",
      name: "Is UserSearch free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — UserSearch is a free tool. FootprintIQ also offers free scans for basic exposure visibility, with Pro plans providing deeper intelligence, false-positive filtering, exposure trend tracking, and structured remediation guidance.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ do username lookups?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — username scanning is one of FootprintIQ's core capabilities. But it goes much further: it detects cross-platform username reuse patterns, scores the risk of each finding, filters false positives, and generates a prioritised remediation plan. It treats username exposure as intelligence, not just a list of matches.",
      },
    },
    {
      "@type": "Question",
      name: "Why would I pay for FootprintIQ when UserSearch is free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "UserSearch provides raw results — a list of sites where a username was found. FootprintIQ provides intelligence: exposure scoring, false-positive filtering, breach signal correlation, data broker detection, cross-platform identity chain analysis, and a structured remediation roadmap. The difference is between data and actionable insight.",
      },
    },
    {
      "@type": "Question",
      name: "Does UserSearch check for data breaches?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. UserSearch only checks whether a username exists on various platforms. It doesn't incorporate breach signals, data broker listings, or exposure scoring. FootprintIQ combines username scanning with breach signal detection and broader exposure mapping for a more complete picture.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use UserSearch and FootprintIQ together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can, though FootprintIQ already includes username lookup as part of its broader scanning pipeline. If you start with UserSearch for a quick check, FootprintIQ adds the intelligence layer — context, scoring, false-positive filtering, and remediation guidance — that turns raw results into actionable privacy strategy.",
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
    { "@type": "ListItem", position: 3, name: "UserSearch vs FootprintIQ", item: PAGE_URL },
  ],
};

type CellValue = "yes" | "no" | "partial" | string;

const comparisonRows: { feature: string; usersearch: CellValue; footprintiq: CellValue }[] = [
  { feature: "Username lookup", usersearch: "yes", footprintiq: "yes" },
  { feature: "Cross-platform reuse detection", usersearch: "partial", footprintiq: "yes" },
  { feature: "False-positive filtering", usersearch: "no", footprintiq: "yes" },
  { feature: "Confidence scoring", usersearch: "no", footprintiq: "yes" },
  { feature: "Data broker scanning", usersearch: "no", footprintiq: "yes" },
  { feature: "Breach signal detection", usersearch: "no", footprintiq: "yes" },
  { feature: "Exposure scoring", usersearch: "no", footprintiq: "yes" },
  { feature: "Remediation roadmap", usersearch: "no", footprintiq: "yes" },
  { feature: "Ethical OSINT methodology", usersearch: "partial", footprintiq: "yes" },
  { feature: "API access", usersearch: "no", footprintiq: "Pro" },
  { feature: "Free tier available", usersearch: "yes", footprintiq: "yes" },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-muted-foreground/60" />;
  return <span className="text-sm">{value}</span>;
}

const UsersearchVsFootprintiq = () => {
  return (
    <>
      <Helmet>
        <title>UserSearch vs FootprintIQ – Username Lookup vs Exposure Intelligence (2026) | FootprintIQ</title>
        <meta
          name="description"
          content="Compare UserSearch and FootprintIQ in 2026. UserSearch offers free username lookups. FootprintIQ provides ethical digital footprint intelligence with exposure scoring and remediation."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="UserSearch vs FootprintIQ – Username Lookup vs Exposure Intelligence (2026)" />
        <meta property="og:description" content="Free username lookup compared with comprehensive digital footprint intelligence." />
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
            <li className="text-foreground font-medium">UserSearch vs FootprintIQ</li>
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
              UserSearch vs{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                FootprintIQ
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Free username lookup compared with comprehensive digital footprint intelligence. The difference between raw results and actionable insight.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Try FootprintIQ Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── UserSearch Overview ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is UserSearch?</h2>
            <p>
              UserSearch is a free online tool that checks whether a specific username exists across social media platforms, websites, and online services. You enter a username, and UserSearch queries hundreds of sites to report where that handle has been registered.
            </p>
            <p>
              The tool is <strong>fast, free, and straightforward</strong>. It serves a simple purpose — answering the question "where does this username appear?" This makes it useful for quick checks, curiosity-driven lookups, and basic reconnaissance. For many users, it's a first step in understanding their digital presence.
            </p>
            <p>
              However, UserSearch provides <strong>raw results without context</strong>. It returns a list of sites where a username was found (or likely found), but doesn't score the risk of each finding, filter false positives, detect cross-platform identity patterns, or provide guidance on what to do with the results. It's a lookup tool, not an intelligence platform.
            </p>
            <p>
              UserSearch also doesn't scan for data broker listings, incorporate breach signals, or map the broader digital footprint beyond username matches. For users who need more than a list, the gap between lookup and intelligence becomes significant.
            </p>
          </div>
        </section>

        {/* ── FootprintIQ Overview ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is FootprintIQ?</h2>
            <p>
              <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> includes username scanning as one component of a much broader exposure mapping pipeline. It scans hundreds of platforms for public profiles, detects username reuse that creates cross-platform identity chains, checks data broker presence, incorporates breach signals, and generates a quantified Exposure Reduction Score™.
            </p>
            <p>
              The critical difference is <strong>intelligence over data</strong>. Where UserSearch returns a list of matches, FootprintIQ returns scored, filtered, contextualised results with a prioritised remediation roadmap. Each finding includes a confidence score, reducing false positives that plague raw lookup tools. Cross-platform patterns are analysed to reveal how different accounts link together — showing the full chain of exposure, not just individual nodes.
            </p>
            <p>
              FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>: only publicly accessible data, consent-based scanning, no data brokerage, and full methodological transparency. It offers free scans for basic visibility, with Pro plans providing deeper intelligence, trend tracking, and structured guidance.
            </p>
            <p>
              Learn more about <Link to="/how-it-works" className="text-accent hover:underline">how FootprintIQ's scanning pipeline works</Link>.
            </p>
          </div>
        </section>

        {/* ── Lookup vs Intelligence ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Lookup vs Intelligence: The Gap That Matters</h2>
            <p>
              Username lookup tools like UserSearch answer a binary question: <em>does this username exist on this site?</em> That's useful — but it's only the beginning of understanding your digital exposure.
            </p>
            <p>
              <strong>The false-positive problem.</strong> Raw lookup tools often report matches that aren't actually your account. A username like "alex_2024" might return hundreds of hits — most belonging to other people. Without confidence scoring and filtering, you're left manually verifying each result. FootprintIQ uses multi-signal analysis to score confidence and filter noise, saving significant time and reducing misleading results.
            </p>
            <p>
              <strong>The context gap.</strong> Finding a username on a site tells you it exists. It doesn't tell you how risky that exposure is, whether it links to other accounts, or what you should do about it. FootprintIQ provides risk scoring, cross-platform chain analysis, and a prioritised remediation roadmap — transforming a list of sites into an actionable privacy strategy.
            </p>
            <p>
              <strong>The scope limitation.</strong> Username lookups cover only one dimension of digital exposure. Your full footprint includes data broker listings, breach signals, email exposure, public records, and more. FootprintIQ maps all of these, providing a complete picture rather than a single-axis view.
            </p>
            <p>
              Think of UserSearch as a flashlight — it illuminates what's directly in front of you. FootprintIQ is a full-room scan with a floor plan, hazard assessment, and clean-up checklist.
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
                UserSearch and FootprintIQ compared across 11 key capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-muted-foreground">Feature</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">UserSearch</th>
                    <th className="p-4 text-center text-sm font-semibold text-accent">FootprintIQ</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 text-sm font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.usersearch} /></div></td>
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

            <h3 className="text-2xl font-semibold mt-8 mb-3">Choose UserSearch If…</h3>
            <ul>
              <li><strong>You want a quick, free username check:</strong> You just want to know whether a specific username appears on various platforms — no scoring, no context, no remediation needed.</li>
              <li><strong>You're doing a one-time curiosity lookup:</strong> You've heard about someone or want to see if a username is available before registering it somewhere.</li>
              <li><strong>You don't need false-positive filtering:</strong> You're comfortable manually verifying results and distinguishing your accounts from same-username matches belonging to others.</li>
              <li><strong>Budget is zero:</strong> You need a completely free tool with no registration required.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Choose FootprintIQ If…</h3>
            <ul>
              <li><strong>You want intelligence, not just a list:</strong> You need scored, filtered results with confidence levels and a prioritised plan — not raw data you have to interpret yourself.</li>
              <li><strong>Username reuse creates real risk for you:</strong> FootprintIQ maps cross-platform identity chains, showing how different accounts link together and which patterns create the highest exposure.</li>
              <li><strong>You need the full picture:</strong> Beyond usernames, you want data broker scanning, breach signal detection, exposure scoring, and a structured remediation roadmap.</li>
              <li><strong>False positives waste your time:</strong> FootprintIQ's multi-signal analysis and confidence scoring dramatically reduce noise, so you act on real findings rather than chasing ghosts.</li>
              <li><strong>You want ethical, transparent methodology:</strong> FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> — UserSearch's methodology is less documented.</li>
              <li><strong>You want a free start with room to grow:</strong> FootprintIQ's free scans provide more context than raw lookup tools, and Pro plans unlock the full intelligence engine.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-3">The Upgrade Path</h3>
            <p>
              Many users start with free tools like UserSearch to get a rough sense of their username exposure. The natural next step is FootprintIQ — it takes the same starting point (username scanning) and adds the intelligence layer that transforms data into strategy. Map it. Prioritise it. Reduce it.
            </p>
            <p>
              Learn more about the relationship between <Link to="/breach-vs-digital-footprint-risk" className="text-accent hover:underline">breach risk and digital footprint risk</Link>.
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
              Go Beyond Username Lookup
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a free ethical footprint scan and discover what's publicly visible about you — with scored results, false-positive filtering, and a clear remediation plan.
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

export default UsersearchVsFootprintiq;
