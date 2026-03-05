import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildDefinedTermSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";
import type { ContentEntry } from "@/lib/seo/contentRegistry";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";

interface GlossaryTemplateProps {
  entry: ContentEntry;
  /** Main definition text */
  definition: string;
  /** Examples of the term in context */
  examples?: string[];
  /** Why this concept matters */
  whyItMatters: string;
}

export function GlossaryTemplate({ entry, definition, examples, whyItMatters }: GlossaryTemplateProps) {
  const shortTitle = entry.title.split(" – ")[0].split(" | ")[0];

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Glossary", path: "/digital-privacy-glossary" },
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
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <JsonLd data={buildDefinedTermSchema({ name: shortTitle, description: definition, url: entry.path })} />
      <JsonLd data={buildBreadcrumbListSchema(breadcrumbItems)} />

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Glossary", href: "/digital-privacy-glossary" },
              { label: shortTitle },
            ]}
          />

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{shortTitle}</h1>

          {/* Definition */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">Definition</h2>
            <p className="text-muted-foreground leading-relaxed">{definition}</p>
          </section>

          {/* Examples */}
          {examples && examples.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-3">Examples</h2>
              <ul className="space-y-2">
                {examples.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Why it matters */}
          <section className="mb-10 p-6 rounded-xl bg-muted/30 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-3">Why It Matters</h2>
            <p className="text-muted-foreground leading-relaxed">{whyItMatters}</p>
          </section>

          <RelatedLinks paths={entry.related} />
        </div>
      </main>

      <Footer />
    </>
  );
}
