import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const guides = [
  {
    to: "/guides/interpret-osint-results",
    title: "How to Interpret OSINT Scan Results Responsibly",
    description: "Covers confidence levels, false positives, partial matches, and ethical considerations for evaluating scan output.",
  },
  {
    to: "/guides/what-osint-results-mean",
    title: "What OSINT Scan Results Actually Mean (and What They Don't)",
    description: "Clarifies the difference between correlation and attribution, and how to evaluate findings without over-interpreting them.",
  },
  {
    to: "/guides/is-osint-scan-worth-it",
    title: "Is an OSINT Scan Worth It for Personal Privacy?",
    description: "A balanced look at when OSINT scans are useful, when they are not, and how to evaluate cost versus value honestly.",
  },
  {
    to: "/guides/free-vs-paid-osint-tools",
    title: "Free vs Paid OSINT Tools: What's the Real Difference?",
    description: "A neutral comparison covering coverage, correlation depth, false-positive filtering, and ethical considerations.",
  },
  {
    to: "/guides/good-osint-scan-result",
    title: "What a 'Good' OSINT Scan Result Looks Like",
    description: "Explains why fewer high-confidence findings beat volume, and how to evaluate quality over quantity.",
  },
  {
    to: "/guides/how-username-search-tools-work",
    title: "How Username Search Tools Actually Work (and Where They Fail)",
    description: "Explains how username search tools function, their limitations, and where false positives come from.",
  },
];

const origin = "https://footprintiq.app";

const GuidesIndex = () => {
  return (
    <>
      <SEO
        title="OSINT Guides — FootprintIQ"
        description="Educational guides on interpreting OSINT scan results, understanding digital footprints, and evaluating open-source intelligence tools responsibly."
        canonical={`${origin}/guides`}
        ogType="website"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "OSINT Guides",
          description: "Educational guides on interpreting OSINT scan results, understanding digital footprints, and evaluating open-source intelligence tools responsibly.",
          url: `${origin}/guides`,
          isPartOf: { "@type": "WebSite", url: origin },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
            { "@type": "ListItem", position: 2, name: "Guides", item: `${origin}/guides` },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "FootprintIQ OSINT Guides",
          numberOfItems: guides.length,
          itemListElement: guides.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${origin}${g.to}`,
            name: g.title,
          })),
        }}
      />

      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Guides</span>
          </nav>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-7 h-7 text-primary" />
              <h1 className="text-3xl font-bold">OSINT Guides</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Educational resources for understanding OSINT scan results, evaluating tools, and interpreting digital footprint data responsibly.
            </p>
          </div>

          <div className="grid gap-4">
            {guides.map((guide) => (
              <Link
                key={guide.to}
                to={guide.to}
                className="group block rounded-lg border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors mb-1">
                  {guide.title}
                </h2>
                <p className="text-sm text-muted-foreground">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GuidesIndex;
