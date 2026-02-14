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

const PAGE_URL = "https://footprintiq.app/deleteme-vs-footprintiq";

const webPageSchema = buildWebPageSchema({
  name: "DeleteMe vs FootprintIQ – Removal vs Intelligence (2026) | FootprintIQ",
  description:
    "Compare DeleteMe and FootprintIQ in 2026. DeleteMe automates data broker removal. FootprintIQ maps your full digital exposure with ethical OSINT intelligence.",
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
      name: "Is DeleteMe the same as FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. DeleteMe is a data broker removal service that submits opt-out requests on your behalf. FootprintIQ is a digital footprint intelligence platform that maps your full public exposure — including profiles, username reuse, and breach signals — and provides a prioritised remediation roadmap.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use DeleteMe and FootprintIQ together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — they work well together. FootprintIQ maps your full exposure and helps you prioritise what matters most. DeleteMe then handles the automated removal of data broker listings. Together, they provide intelligence-driven privacy management.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ remove data broker listings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ provides the intelligence layer — mapping your exposure, scoring risk, and generating a prioritised remediation roadmap with official opt-out links. The actual removal action is up to you or a dedicated service like DeleteMe.",
      },
    },
    {
      "@type": "Question",
      name: "Does DeleteMe detect username reuse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. DeleteMe focuses specifically on data broker and people-search site removal. It doesn't scan for public profiles, username reuse across platforms, or cross-platform identity chains. FootprintIQ provides these capabilities.",
      },
    },
    {
      "@type": "Question",
      name: "Which is cheaper — DeleteMe or FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They serve different purposes so direct price comparison isn't straightforward. DeleteMe charges for automated removal services. FootprintIQ offers free scans for basic exposure visibility, with Pro plans for deeper intelligence. You're paying for different things — removal vs intelligence.",
      },
    },
    {
      "@type": "Question",
      name: "Why do I need intelligence if I can just remove everything?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because removal services only cover data brokers — typically 100-200 sites. Your digital footprint extends across social media, forums, code repositories, professional networks, and more. Intelligence shows you the full picture so you know what to prioritise. Without it, removal services operate partially blind.",
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
    { "@type": "ListItem", position: 3, name: "DeleteMe vs FootprintIQ", item: PAGE_URL },
  ],
};

type CellValue = "yes" | "no" | "partial" | string;

const comparisonRows: { feature: string; deleteme: CellValue; footprintiq: CellValue }[] = [
  { feature: "Data broker removal", deleteme: "yes", footprintiq: "Guidance & links" },
  { feature: "People-search site removal", deleteme: "yes", footprintiq: "Guidance & links" },
  { feature: "Public profile scanning", deleteme: "no", footprintiq: "yes" },
  { feature: "Username reuse detection", deleteme: "no", footprintiq: "yes" },
  { feature: "Breach signal detection", deleteme: "no", footprintiq: "yes" },
  { feature: "Exposure scoring", deleteme: "no", footprintiq: "yes" },
  { feature: "Remediation roadmap", deleteme: "no", footprintiq: "yes" },
  { feature: "Progress reports", deleteme: "yes", footprintiq: "yes" },
  { feature: "Automated opt-out requests", deleteme: "yes", footprintiq: "no" },
  { feature: "Ethical OSINT methodology", deleteme: "partial", footprintiq: "yes" },
  { feature: "Free tier available", deleteme: "no", footprintiq: "yes" },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (value === "no") return <XCircle className="w-4 h-4 text-muted-foreground/40" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-muted-foreground/60" />;
  return <span className="text-sm">{value}</span>;
}

const DeletemeVsFootprintiq = () => {
  return (
    <>
      <Helmet>
        <title>DeleteMe vs FootprintIQ – Removal vs Intelligence (2026) | FootprintIQ</title>
        <meta
          name="description"
          content="Compare DeleteMe and FootprintIQ in 2026. DeleteMe automates data broker removal. FootprintIQ maps your full digital exposure with ethical OSINT intelligence."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="DeleteMe vs FootprintIQ – Removal vs Intelligence (2026)" />
        <meta property="og:description" content="Data broker removal compared with ethical digital footprint intelligence." />
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
            <li className="text-foreground font-medium">DeleteMe vs FootprintIQ</li>
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
              DeleteMe vs{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                FootprintIQ
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Automated data broker removal compared with comprehensive digital footprint intelligence. Two complementary approaches to protecting your privacy.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Try FootprintIQ Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── DeleteMe Overview ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is DeleteMe?</h2>
            <p>
              DeleteMe is a dedicated data broker removal service operated by Abine. It identifies your personal information on people-search sites and data brokers — services like Spokeo, WhitePages, BeenVerified, and Intelius — and submits opt-out requests on your behalf.
            </p>
            <p>
              The process is largely <strong>hands-off</strong>. You provide your personal details (name, addresses, phone numbers, email), and DeleteMe's team submits removal requests to its network of data broker sites. You receive regular reports showing what was found and what's been removed. The service runs on an annual subscription, with periodic re-checks to catch re-listings.
            </p>
            <p>
              DeleteMe excels at what it does — automated, systematic removal of data broker listings. However, its scope is limited to data brokers and people-search sites. It doesn't scan for public social media profiles, detect username reuse, check for breach signals, or provide broader exposure intelligence. It handles one critical slice of the privacy puzzle, but not the full picture.
            </p>
          </div>
        </section>

        {/* ── FootprintIQ Overview ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is FootprintIQ?</h2>
            <p>
              <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> operates upstream from removal services. Before you can remove or remediate your digital exposure, you need to understand what exists. FootprintIQ provides that understanding.
            </p>
            <p>
              The platform scans hundreds of platforms for public profiles, detects username reuse that creates cross-platform identity chains, checks data broker presence, incorporates breach signals, and generates a quantified Exposure Reduction Score™. The output is a prioritised remediation roadmap — not just a list of findings, but a structured plan that tells you what to address first and why.
            </p>
            <p>
              FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>: only publicly accessible data, consent-based scanning, no data brokerage, and full methodological transparency. It offers free scans for basic visibility, with Pro plans providing deeper intelligence, false-positive filtering, trend tracking, and structured guidance. See <Link to="/how-it-works" className="text-accent hover:underline">how the scanning pipeline works</Link>.
            </p>
          </div>
        </section>

        {/* ── Removal vs Intelligence ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Removal vs Intelligence: A Critical Distinction</h2>
            <p>
              The fundamental difference between DeleteMe and FootprintIQ is the difference between <strong>action</strong> and <strong>intelligence</strong>. Both matter, but they serve different roles in a privacy strategy.
            </p>
            <p>
              <strong>Removal services operate on a narrow scope.</strong> DeleteMe targets data brokers — sites that aggregate and resell personal information. There are roughly 200-400 of these in operation. Removing your data from these sites is valuable, but it addresses only one category of digital exposure. Your public social media profiles, forum posts, code contributions, professional network activity, and username reuse patterns remain untouched.
            </p>
            <p>
              <strong>Intelligence platforms map the full landscape.</strong> FootprintIQ shows you everything that's publicly visible — across social media, forums, data brokers, public records, search engine results, and more. It quantifies your exposure, identifies the highest-risk items, and provides a structured plan for reducing your footprint systematically.
            </p>
            <p>
              Think of it this way: removal services are like hiring someone to clean specific rooms in your house. Intelligence platforms give you a blueprint of the entire building, showing which rooms exist, which ones have open windows, and which ones you should secure first. The most effective approach uses both — <em>intelligence to guide strategy, removal to execute specific actions</em>.
            </p>
            <p>
              This is why FootprintIQ positions itself as the <strong>intelligence layer above removal services</strong>. Map it. Prioritise it. Reduce it. Removal services handle the last step for a specific category; FootprintIQ handles the first two for everything.
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
                DeleteMe and FootprintIQ compared across 11 key capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-muted-foreground">Feature</th>
                    <th className="p-4 text-center text-sm font-semibold text-muted-foreground">DeleteMe</th>
                    <th className="p-4 text-center text-sm font-semibold text-accent">FootprintIQ</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}>
                      <td className="p-4 text-sm font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><div className="flex justify-center"><CellIcon value={row.deleteme} /></div></td>
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
                <Link to="/incogni-vs-footprintiq" className="text-accent hover:underline">Incogni vs FootprintIQ</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── Use Case Breakdown ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">When to Choose Each Tool</h2>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Choose DeleteMe If…</h3>
            <ul>
              <li><strong>Your main goal is data broker removal:</strong> You know your information is listed on people-search sites and you want a service to handle the opt-out process systematically.</li>
              <li><strong>You want a hands-off service:</strong> DeleteMe manages the entire removal workflow — you submit your details and receive reports. Minimal ongoing effort required.</li>
              <li><strong>You don't need broader exposure mapping:</strong> If data brokers are your primary concern and you're not worried about social media visibility, username reuse, or breach signals, DeleteMe covers your needs.</li>
              <li><strong>You want an established track record:</strong> DeleteMe has been operating since 2011, making it one of the longest-running removal services with extensive broker coverage.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Choose FootprintIQ If…</h3>
            <ul>
              <li><strong>You want the full picture first:</strong> Before deciding what to remove, you want to understand your complete digital exposure — not just broker listings, but profiles, username chains, breach signals, and public records.</li>
              <li><strong>Username reuse is a concern:</strong> If you've used the same handle across platforms, FootprintIQ reveals these linked identity chains that removal services miss entirely.</li>
              <li><strong>You need prioritised guidance:</strong> Instead of addressing all exposures equally, FootprintIQ ranks them by risk and impact, helping you focus effort where it matters most.</li>
              <li><strong>You want a free starting point:</strong> FootprintIQ offers free scans to assess your exposure before committing to a paid plan.</li>
              <li><strong>Ethical methodology matters:</strong> You want a tool that operates transparently, with a published charter explaining exactly what data it accesses and how.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Use Both Together</h3>
            <p>
              The strongest privacy strategy combines intelligence with action. Use FootprintIQ to map your full digital exposure and identify what matters most. Use DeleteMe (or a similar service) to handle automated broker removal for the data broker slice. FootprintIQ's remediation roadmap includes official opt-out links for brokers, so you can also handle removal manually if preferred.
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
              Map Your Exposure Before You Remove It
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

export default DeletemeVsFootprintiq;
