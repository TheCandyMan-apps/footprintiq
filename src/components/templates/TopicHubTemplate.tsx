import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import type { TopicHubEntry } from "@/lib/seo/topicHubData";
import { FeaturedCollections } from "@/components/seo/FeaturedCollections";
import { Button } from "@/components/ui/button";

interface Props {
  entry: TopicHubEntry;
}

const BUILD_DATE = new Date().toISOString().slice(0, 10);

export function TopicHubTemplate({ entry }: Props) {
  const canonicalPath = `/topics/${entry.slug}`;
  const faqSchema = buildFAQSchema(entry.faqs);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Topics" },
    { name: entry.title },
  ];

  return (
    <>
      <Helmet>
        <title>{entry.seoTitle}</title>
        <meta name="description" content={entry.description} />
        <link rel="canonical" href={`${CANONICAL_BASE}${canonicalPath}`} />
        <meta property="og:title" content={entry.seoTitle} />
        <meta property="og:description" content={entry.description} />
        <meta property="og:url" content={`${CANONICAL_BASE}${canonicalPath}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <JsonLd data={buildArticleSchema({ headline: entry.title, description: entry.description, url: canonicalPath })} />
      <JsonLd data={buildBreadcrumbListSchema(breadcrumbItems)} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Topics" },
              { label: entry.title },
            ]}
          />

          {/* Hero */}
          <section className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {entry.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              {entry.description}
            </p>
            <Link to="/scan">
              <Button size="lg" className="h-14 px-8 text-lg rounded-xl">
                <Search className="w-5 h-5 mr-2" />
                Start a Free Scan
              </Button>
            </Link>
          </section>

          {/* Last updated */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
            <span className="font-medium text-foreground">FootprintIQ Research Team</span>
            <span>·</span>
            <time dateTime={BUILD_DATE}>Last updated {BUILD_DATE}</time>
          </div>

          {/* Intro */}
          <section className="mb-12">
            <p className="text-muted-foreground leading-relaxed text-base">{entry.intro}</p>
          </section>

          {/* Popular Pages grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Popular Pages</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {entry.popularPages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {page.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">{page.description}</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-2 self-end group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </section>

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

          <FeaturedCollections />

          <RelatedLinks paths={entry.relatedHubs} title="Related Topic Hubs" />
        </div>
      </main>

      <Footer />
    </>
  );
}
