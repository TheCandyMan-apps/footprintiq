import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import type { FAQHubEntry } from "@/lib/seo/faqHubData";
import { FeaturedCollections } from "@/components/seo/FeaturedCollections";

interface Props {
  entry: FAQHubEntry;
}

const BUILD_DATE = new Date().toISOString().slice(0, 10);

export function FAQHubTemplate({ entry }: Props) {
  const canonicalPath = `/faq/${entry.slug}`;
  const allFaqs = entry.sections.flatMap((s) => s.faqs);
  const faqSchema = buildFAQSchema(allFaqs);

  return (
    <>
      <Helmet>
        <title>{entry.seoTitle}</title>
        <meta name="description" content={entry.description} />
        <link rel="canonical" href={`${CANONICAL_BASE}${canonicalPath}`} />
        <meta property="og:title" content={entry.seoTitle} />
        <meta property="og:description" content={entry.description} />
        <meta property="og:url" content={`${CANONICAL_BASE}${canonicalPath}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <JsonLd data={buildBreadcrumbListSchema([
        { name: "Home", path: "/" },
        { name: "FAQ" },
        { name: entry.title },
      ])} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "FAQ" },
              { label: entry.title },
            ]}
          />

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">FootprintIQ Research Team</span>
            <span>·</span>
            <time dateTime={BUILD_DATE}>Last updated {BUILD_DATE}</time>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            {entry.title}
          </h1>

          <p className="text-lg text-muted-foreground mb-12">{entry.intro}</p>

          {entry.sections.map((section, si) => (
            <section key={si} className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">{section.heading}</h2>
                <Link
                  to={section.sourcePath}
                  className="text-xs text-primary hover:underline shrink-0"
                >
                  From: {section.sourceLabel} →
                </Link>
              </div>
              <div className="space-y-3">
                {section.faqs.map((faq, i) => (
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
          ))}

          <FeaturedCollections />
        </div>
      </main>

      <Footer />
    </>
  );
}
