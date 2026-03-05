import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildDatasetSchema, buildBreadcrumbListSchema, buildFAQSchema } from "@/lib/seo/schema";
import type { ContentEntry } from "@/lib/seo/contentRegistry";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatasetTemplateProps {
  entry: ContentEntry;
  /** Table of dataset fields: [field, type, description] */
  fields?: [string, string, string][];
  /** Usage notes for the dataset */
  usageNotes?: string;
  children?: React.ReactNode;
}

export function DatasetTemplate({ entry, fields, usageNotes, children }: DatasetTemplateProps) {
  const shortTitle = entry.title.split(" | ")[0].split(" – ")[0];
  const faqSchema = buildFAQSchema(entry.faqs);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Datasets" },
    { name: shortTitle },
  ];

  return (
    <>
      <Helmet>
        <title>{entry.title}</title>
        <meta name="description" content={entry.description} />
        <link rel="canonical" href={`${CANONICAL_BASE}${entry.path}`} />
        <meta property="og:title" content={entry.title} />
        <meta property="og:description" content={entry.description} />
        <meta property="og:url" content={`${CANONICAL_BASE}${entry.path}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <JsonLd data={buildDatasetSchema({ name: shortTitle, description: entry.description, url: entry.path })} />
      <JsonLd data={buildBreadcrumbListSchema(breadcrumbItems)} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Datasets" },
              { label: shortTitle },
            ]}
          />

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{shortTitle}</h1>
          <p className="text-lg text-muted-foreground mb-10">{entry.description}</p>

          {/* Fields table */}
          {fields && fields.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Dataset Fields</h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-semibold text-foreground">Field</th>
                      <th className="text-left p-3 font-semibold text-foreground">Type</th>
                      <th className="text-left p-3 font-semibold text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(([field, type, desc], i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-3 font-mono text-foreground">{field}</td>
                        <td className="p-3 text-muted-foreground">{type}</td>
                        <td className="p-3 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Usage notes */}
          {usageNotes && (
            <section className="mb-10 p-6 rounded-xl bg-muted/30 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-3">Usage Notes</h2>
              <p className="text-muted-foreground leading-relaxed">{usageNotes}</p>
            </section>
          )}

          {/* Download CTA placeholder */}
          <section className="mb-10 text-center p-8 rounded-xl border-2 border-dashed border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">Download Dataset</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Dataset downloads will be available soon. Sign up to be notified.
            </p>
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </section>

          {children}

          {entry.faqs.length > 0 && (
            <section className="mt-12">
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

          <RelatedLinks paths={entry.related} />
        </div>
      </main>

      <Footer />
    </>
  );
}
