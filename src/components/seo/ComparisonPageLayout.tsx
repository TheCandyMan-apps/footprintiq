import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
  ChevronRight,
  Shield,
  Scale,
} from "lucide-react";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ── Comparison cluster links ── */
const comparisonPages = [
  { to: "/best-digital-footprint-scanner", label: "Best Digital Footprint Scanners" },
  { to: "/aura-vs-footprintiq", label: "Aura vs FootprintIQ" },
  { to: "/deleteme-vs-footprintiq", label: "DeleteMe vs FootprintIQ" },
  { to: "/incogni-vs-footprintiq", label: "Incogni vs FootprintIQ" },
  { to: "/kanary-vs-footprintiq", label: "Kanary vs FootprintIQ" },
];

export interface ComparisonRow {
  feature: string;
  competitor: "yes" | "no" | "partial" | string;
  footprintiq: "yes" | "no" | "partial" | string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ComparisonPageData {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  competitorName: string;
  competitorTagline: string;
  footprintiqTagline: string;
  introText: string;
  whoIsCompetitorFor: string[];
  whoIsFootprintiqFor: string[];
  comparisonRows: ComparisonRow[];
  whyFootprintiqBetter: string[];
  whyCompetitorBetter: string[];
  faqs: FaqItem[];
}

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

export function ComparisonPageLayout({ data }: { data: ComparisonPageData }) {
  const pageUrl = `https://footprintiq.app/${data.slug}`;

  const webPageSchema = buildWebPageSchema({
    name: data.title,
    description: data.metaDescription,
    url: pageUrl,
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Comparisons", item: "https://footprintiq.app/best-digital-footprint-scanner" },
      { "@type": "ListItem", position: 3, name: data.competitorName !== "Overview" ? `${data.competitorName} vs FootprintIQ` : "Best Scanners", item: pageUrl },
    ],
  };

  const otherComparisons = comparisonPages.filter((p) => p.to !== `/${data.slug}`);

  return (
    <>
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.metaDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.metaDescription} />
        <meta property="og:url" content={pageUrl} />
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
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link to="/best-digital-footprint-scanner" className="hover:text-foreground transition-colors">Comparisons</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium truncate">{data.competitorName !== "Overview" ? `${data.competitorName} vs FootprintIQ` : "Best Scanners"}</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Scale className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Objective Comparison</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">{data.h1}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">{data.subtitle}</p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/scan">
                Try FootprintIQ Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Neutral Intro ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">{data.introText}</p>
            <div className="mt-6 p-4 rounded-xl border border-accent/20 bg-accent/5">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-accent">FootprintIQ</span> — Ethical Digital Footprint Intelligence Platform
              </p>
            </div>
          </div>
        </section>

        {/* ── Who Each Tool Is For ── */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Who Each Tool Is{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">Best For</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">{data.competitorName}</h3>
                <p className="text-xs text-muted-foreground/60 mb-4 uppercase tracking-wider">{data.competitorTagline}</p>
                <ul className="space-y-2">
                  {data.whoIsCompetitorFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-accent/30 bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">FootprintIQ</h3>
                <p className="text-xs text-accent/70 mb-4 uppercase tracking-wider">{data.footprintiqTagline}</p>
                <ul className="space-y-2">
                  {data.whoIsFootprintiqFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Comparison Table ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Feature Comparison
            </h2>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
              <div className="grid grid-cols-3 bg-muted/40 border-b border-border/50">
                <div className="p-4 text-sm font-semibold text-muted-foreground">Feature</div>
                <div className="p-4 text-sm font-semibold text-center">{data.competitorName}</div>
                <div className="p-4 text-sm font-semibold text-center text-accent">FootprintIQ</div>
              </div>
              {data.comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${i < data.comparisonRows.length - 1 ? "border-b border-border/30" : ""}`}
                >
                  <div className="p-4 text-sm font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-center flex items-center justify-center gap-2">
                    <CellIcon value={row.competitor} />
                    <CellLabel value={row.competitor} />
                  </div>
                  <div className="p-4 text-sm text-center flex items-center justify-center gap-2">
                    <CellIcon value={row.footprintiq} />
                    <CellLabel value={row.footprintiq} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── When Each Is Better ── */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  When FootprintIQ Is the{" "}
                  <span className="bg-gradient-accent bg-clip-text text-transparent">Better Choice</span>
                </h2>
                <ul className="space-y-3">
                  {data.whyFootprintiqBetter.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">
                  When {data.competitorName} May Be Better
                </h2>
                <ul className="space-y-3">
                  {data.whyCompetitorBetter.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ethical Positioning ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Our Commitment</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">Ethical Intelligence, Not Surveillance</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              FootprintIQ only analyses publicly accessible information. We never access private accounts, bypass authentication, or sell user data. Our goal is to help you understand and reduce your digital exposure — not create more of it.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Trusted by privacy-conscious individuals and professionals.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {data.faqs.map((faq, i) => (
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

        {/* ── Other Comparisons ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">More Comparisons</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {otherComparisons.map((page) => (
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

        {/* ── About FootprintIQ ── */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Map Your Digital Footprint?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover where your identity is publicly visible — ethically and transparently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
