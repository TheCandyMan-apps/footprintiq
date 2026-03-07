import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { HeroInputField } from "@/components/HeroInputField";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export interface SearchByUsernamePlatformConfig {
  platform: string;
  slug: string;
  urlPattern: string;
  titleSuffix: string;
  metaDesc: string;
  howItWorks: React.ReactNode;
  canYouFind: React.ReactNode;
  osintTechniques: React.ReactNode;
  privacyTips: React.ReactNode;
  faqs: { q: string; a: string }[];
}

export function SearchByUsernameTemplate({ config }: { config: SearchByUsernamePlatformConfig }) {
  const { platform, slug, faqs } = config;
  const canonical = `https://footprintiq.app/${slug}`;

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: `Search ${platform} By Username`, item: canonical },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{`Search ${platform} By Username – ${config.titleSuffix} | FootprintIQ`}</title>
        <meta name="description" content={config.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={`Search ${platform} By Username – ${config.titleSuffix} | FootprintIQ`} />
        <meta property="og:description" content={config.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Shield className="h-3 w-3 mr-1.5" />{platform} Username Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Search {platform} By Username
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Enter a {platform} username to check profile availability, discover cross-platform accounts, and assess digital exposure across 500+ public platforms.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Username Search Works On {platform}</h2>
            {config.howItWorks}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Can You Find Someone On {platform} By Username?</h2>
            {config.canYouFind}
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Username Reuse Across Social Networks</h2>
            <p>
              Username reuse remains one of the most common — and most underestimated — privacy vulnerabilities online. Research from FootprintIQ's{" "}
              <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">2026 Username Reuse & Digital Exposure Report</Link>{" "}
              shows the average user maintains the same primary handle across 4–7 platforms. Each additional platform adds new dimensions to the digital identity: professional details, personal interests, geographic indicators, and social connections.
            </p>
            <p>
              A username first used on {platform} may also appear on Instagram, Twitter/X, Reddit, GitHub, Steam, and dozens of niche communities. When these accounts are linked together — which FootprintIQ does automatically — the combined picture reveals significantly more than any single profile.
            </p>
            <p>
              FootprintIQ's{" "}
              <Link to="/username-reuse-risks" className="text-primary hover:underline">username reuse risk assessment</Link>{" "}
              quantifies this exposure and provides specific, actionable recommendations for reducing cross-platform traceability. For a full overview of searchable platforms, see our{" "}
              <Link to="/username-search-platforms" className="text-primary hover:underline">username search platforms</Link> guide.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Techniques For Investigating Usernames</h2>
            {config.osintTechniques}
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Protecting Your Privacy On {platform}</h2>
            {config.privacyTips}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-6">
                  <AccordionTrigger className="text-foreground font-medium text-left py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <FinalCTA />
        <section className="py-12 bg-muted/10">
          <div className="max-w-3xl mx-auto px-6 space-y-8"><AboutFootprintIQBlock /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
