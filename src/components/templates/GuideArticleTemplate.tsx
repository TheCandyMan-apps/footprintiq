import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";
import type { ContentEntry } from "@/lib/seo/contentRegistry";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { ArrowRight } from "lucide-react";

interface GuideArticleTemplateProps {
  entry: ContentEntry;
  children: React.ReactNode;
}

const BUILD_DATE = new Date().toISOString().slice(0, 10);

export function GuideArticleTemplate({ entry, children }: GuideArticleTemplateProps) {
  const shortTitle = entry.title.split(" | ")[0].split(" – ")[0];
  const faqSchema = buildFAQSchema(entry.faqs);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
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

      <JsonLd data={buildArticleSchema({ headline: shortTitle, description: entry.description, url: entry.path })} />
      <JsonLd data={buildBreadcrumbListSchema(breadcrumbItems)} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <article className="max-w-3xl mx-auto">
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: shortTitle },
            ]}
          />

          {/* Author / date block */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">FootprintIQ Research Team</span>
            <span>·</span>
            <time dateTime={BUILD_DATE}>Last updated {BUILD_DATE}</time>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
            {shortTitle}
          </h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {children}
          </div>

          {/* FAQs */}
          {entry.faqs.length > 0 && (
            <section className="mt-16">
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
        </article>
      </main>

      <Footer />
    </>
  );
}
