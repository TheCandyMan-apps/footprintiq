import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbListSchema } from "@/lib/seo/schema";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { platformPages } from "@/lib/seo/platformRegistry";

export default function PlatformHub() {
  const pageTitle = "Platform Username Search – Scan Any Platform | FootprintIQ";
  const description = "Search usernames across specific platforms. Choose a platform below to run a targeted username scan across 500+ public sites.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${CANONICAL_BASE}/platforms`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${CANONICAL_BASE}/platforms`} />
      </Helmet>

      <JsonLd data={buildBreadcrumbListSchema([
        { name: "Home", path: "/" },
        { name: "Platforms" },
      ])} />

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ContentBreadcrumb items={[
            { label: "Home", href: "/" },
            { label: "Platforms" },
          ]} />

          <section className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Platform Username Search
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a platform to search a username across 500+ public sites. Every scan uses the same multi-tool OSINT pipeline with AI-powered false-positive filtering.
            </p>
          </section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformPages.map((platform) => (
              <Link
                key={platform.slug}
                to={`/platforms/${platform.slug}/username-search`}
                className="group flex items-center justify-between p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {platform.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Username search</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>

          <section className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Don't see your platform? Our general username search covers 500+ sites.
            </p>
            <Link
              to="/username-search"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Run a general username search
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
