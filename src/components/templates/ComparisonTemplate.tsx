import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildSoftwareApplicationSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import type { ComparisonEntry } from "@/lib/seo/comparisonRegistry";
import { AccuracyCallout } from "@/components/seo/AccuracyCallout";
import { FeaturedCollections } from "@/components/seo/FeaturedCollections";

const BUILD_DATE = new Date().toISOString().slice(0, 10);

interface Props {
  entry: ComparisonEntry;
}

export function ComparisonTemplate({ entry }: Props) {
  const canonicalPath = `/comparisons/${entry.slug}`;
  const pageTitle = `${entry.name} vs FootprintIQ – ${entry.category} Comparison | FootprintIQ`;
  const faqSchema = buildFAQSchema(entry.faqs);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: `${entry.name} vs FootprintIQ` },
  ];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={entry.description} />
        <link rel="canonical" href={`${CANONICAL_BASE}${canonicalPath}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={entry.description} />
        <meta property="og:url" content={`${CANONICAL_BASE}${canonicalPath}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={entry.description} />
      </Helmet>

      <JsonLd data={buildSoftwareApplicationSchema()} />
      <JsonLd data={buildBreadcrumbListSchema(breadcrumbItems)} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Compare", href: "/compare" },
              { label: `${entry.name} vs FootprintIQ` },
            ]}
          />

          {/* Hero */}
          <section className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              {entry.category}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {entry.name} vs FootprintIQ
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {entry.description}
            </p>
          </section>

          {/* Author / date block */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
            <span className="font-medium text-foreground">FootprintIQ Research Team</span>
            <span>·</span>
            <time dateTime={BUILD_DATE}>Last updated {BUILD_DATE}</time>
          </div>

          {/* Intro */}
          <section className="mb-16">
            <p className="text-muted-foreground leading-relaxed">{entry.intro}</p>
          </section>

          {/* Feature comparison table */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Feature Comparison</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                    <th className="text-left p-4 font-semibold text-foreground">{entry.name}</th>
                    <th className="text-left p-4 font-semibold text-primary">FootprintIQ</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.features.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{row.feature}</td>
                      <td className="p-4 text-muted-foreground">{row.competitor}</td>
                      <td className="p-4 text-foreground font-medium">{row.footprintiq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pros & Cons */}
          <section className="mb-16 grid sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">{entry.name} Strengths</h2>
              <ul className="space-y-2">
                {entry.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">{entry.name} Limitations</h2>
              <ul className="space-y-2">
                {entry.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Who it's for */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">Who Should Use What?</h2>
            <p className="text-muted-foreground leading-relaxed">{entry.whoItsFor}</p>
          </section>

          {/* When NOT to use FootprintIQ */}
          <section className="mb-16 p-6 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Ethical Positioning</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{entry.ethicalPositioning}</p>
                <Link to="/ethical-osint-charter" className="inline-block mt-3 text-sm text-primary hover:underline">
                  Read our Ethical OSINT Charter →
                </Link>
              </div>
            </div>
          </section>

          <AccuracyCallout context="comparison" />

          {/* FAQs */}
          {entry.faqs.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {entry.faqs.map((faq, i) => (
                  <details key={i} className="group p-4 rounded-xl border border-border bg-card">
                    <summary className="font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                      {faq.q}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-2" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <RelatedLinks paths={["/compare", ...entry.relatedTools, ...entry.relatedGuides]} />

          <FeaturedCollections />
        </div>
      </main>

      <Footer />
    </>
  );
}
