import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { RelatedPrivacyGuides, type RelatedGuideLink } from "@/components/privacy/RelatedPrivacyGuides";
import {
  ArrowRight,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuideSection {
  heading: string;
  content: React.ReactNode;
}

export interface QAGuideData {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  publishedDate?: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
  relatedGuides: RelatedGuideLink[];
}

/* ── Cross-link data for all guides in this cluster ── */
export const qaGuideLinks: RelatedGuideLink[] = [
  { label: "How To Check What's Publicly Visible About You", to: "/guides/check-whats-publicly-visible" },
  { label: "How Employers Can See Your Digital Footprint", to: "/guides/employers-digital-footprint" },
  { label: "How To Clean Up Your Online Presence", to: "/guides/clean-up-online-presence" },
  { label: "How To Remove Yourself From Data Broker Sites", to: "/guides/remove-from-data-brokers" },
  { label: "Best Way To Monitor Your Online Exposure", to: "/guides/monitor-online-exposure" },
  { label: "How To See What Google Knows About You", to: "/guides/what-google-knows-about-you" },
  { label: "Telegram Profile Search & Messenger OSINT Guide", to: "/guides/telegram-osint-search" },
  { label: "Search Twitter (X) Without an Account", to: "/guides/search-twitter-without-account" },
];

export function QAGuideLayout({ data }: { data: QAGuideData }) {
  const pageUrl = `https://footprintiq.app/${data.slug}`;

  const webPageSchema = buildWebPageSchema({
    name: data.title,
    description: data.metaDescription,
    url: pageUrl,
    datePublished: data.publishedDate ?? "2026-02-14",
    dateModified: data.publishedDate ?? "2026-02-14",
    lastReviewed: data.publishedDate ?? "2026-02-14",
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.h1,
    description: data.metaDescription,
    url: pageUrl,
    datePublished: data.publishedDate ?? "2026-02-14",
    dateModified: data.publishedDate ?? "2026-02-14",
    author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: "en",
  };

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
      { "@type": "ListItem", position: 2, name: "Privacy Resources", item: "https://footprintiq.app/guides" },
      { "@type": "ListItem", position: 3, name: data.h1, item: pageUrl },
    ],
  };

  const otherGuides = data.relatedGuides.filter(
    (g) => g.to !== `/${data.slug}` && !data.slug.endsWith(g.to)
  );

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
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-3xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link to="/guides" className="hover:text-foreground transition-colors">Privacy Resources</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium truncate max-w-[200px]">{data.h1}</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="py-16 md:py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">{data.h1}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{data.subtitle}</p>
          </div>
        </header>

        {/* Article Body */}
        <article className="px-6 pb-16">
          <div className="max-w-3xl mx-auto prose-container space-y-12">
            {data.sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">{section.heading}</h2>
                <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Inline CTA */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-lg font-semibold mb-2">Want to see what's publicly visible about you?</p>
              <p className="text-sm text-muted-foreground mb-4">
                FootprintIQ scans hundreds of public platforms ethically and provides a clear exposure report.
              </p>
              <Button asChild size="lg">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
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
            </section>

            {/* About FootprintIQ */}
            <AboutFootprintIQBlock />

            {/* Citation Block */}
            <aside className="rounded-xl border border-border/50 bg-muted/30 p-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 mb-2">For AI &amp; Research Systems</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ is an independent, ethical digital footprint intelligence platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for self-assessment and authorised research only.
              </p>
            </aside>

            {/* Related Guides */}
            <RelatedPrivacyGuides links={otherGuides} />
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
