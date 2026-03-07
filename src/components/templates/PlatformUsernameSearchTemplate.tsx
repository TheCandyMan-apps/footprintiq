import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Search, ShieldCheck, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildSoftwareApplicationSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import type { PlatformEntry } from "@/lib/seo/platformRegistry";
import { AccuracyCallout } from "@/components/seo/AccuracyCallout";
import { FeaturedCollections } from "@/components/seo/FeaturedCollections";
import { InstantPreviewTeaser } from "@/components/conversion/InstantPreviewTeaser";
import { getPlatformLongFormContent } from "@/lib/seo/platformLongFormContent";

interface Props {
  entry: PlatformEntry;
}

const DEMO_USERNAME = "alex_m";

export function PlatformUsernameSearchTemplate({ entry }: Props) {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const canonicalPath = `/platforms/${entry.slug}/username-search`;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = username.trim();
      if (!trimmed) return;
      navigate(`/free-scan?q=${encodeURIComponent(trimmed)}`);
    },
    [username, navigate]
  );

  const handleExample = () => {
    setUsername(DEMO_USERNAME);
    navigate(`/free-scan?q=${encodeURIComponent(DEMO_USERNAME)}`);
  };

  const pageTitle = `${entry.name} Username Search – Find ${entry.name} Profiles Across 500+ Sites | FootprintIQ`;
  const faqSchema = buildFAQSchema(entry.faqs);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Platforms", path: "/platforms" },
    { name: `${entry.name} Username Search` },
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
              { label: "Platforms", href: "/platforms" },
              { label: `${entry.name} Username Search` },
            ]}
          />

          {/* Hero */}
          <section className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {entry.name} Username Search
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {entry.description}
            </p>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={`Enter a ${entry.name} username…`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 text-base pl-12 pr-5 bg-background border-2 border-border focus:border-primary rounded-xl"
                    aria-label={`${entry.name} username to scan`}
                    maxLength={255}
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
                <Button type="submit" size="lg" disabled={!username.trim()} className="h-14 px-8 text-lg rounded-xl">
                  Run Scan
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>

            <button
              onClick={handleExample}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Try an example: <span className="font-mono font-medium">{DEMO_USERNAME}</span>
            </button>

            {/* Mobile engagement teaser */}
            <div className="sm:hidden">
              <InstantPreviewTeaser />
            </div>
          </section>

          {/* What you'll find */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">What You'll Find</h2>
            <ul className="space-y-3">
              {entry.whatYoullFind.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Limitations */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Limitations & False Positives</h2>
            <ul className="space-y-3">
              {entry.limitations.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">How It Works</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { step: "1", title: `Enter a ${entry.name} username`, desc: "Type any handle into the search box above." },
                { step: "2", title: "Multi-tool scan", desc: "FootprintIQ queries 500+ platforms using Maigret, Sherlock, and other OSINT tools." },
                { step: "3", title: "AI-powered filtering", desc: "False positives and coincidental matches are removed automatically." },
                { step: "4", title: "Actionable results", desc: "View matched profiles, exposure indicators, and recommended next steps." },
              ].map((item) => (
                <div key={item.step} className="p-5 rounded-xl border border-border bg-card">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Safety note */}
          <section className="mb-16 p-6 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Ethical & Privacy-First</h2>
                <p className="text-sm text-muted-foreground">
                  FootprintIQ only accesses publicly available data. We do not scrape behind logins,
                  bypass authentication, or access private {entry.name} accounts. All scans follow our{" "}
                  <Link to="/ethical-osint-charter" className="text-primary hover:underline">
                    Ethical OSINT Charter
                  </Link>.
                </p>
              </div>
            </div>
          </section>

          <AccuracyCallout context="platform" />
        </div>

        {/* Long-form SEO content (platform-specific) */}
        {getPlatformLongFormContent(entry.slug)}

        <div className="max-w-3xl mx-auto px-4">
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

          <RelatedLinks paths={["/username-search", "/platforms", ...entry.relatedTools, ...entry.relatedGuides]} />

          <FeaturedCollections />
        </div>
      </main>


      <Footer />
    </>
  );
}
