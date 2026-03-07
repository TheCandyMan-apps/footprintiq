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
import { Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";

export interface SearchPlatformUsernameConfig {
  platform: string;
  slug: string;
  profilePattern: string;
  metaDesc: string;
  howItWorks: React.ReactNode;
  findingProfiles: React.ReactNode;
  usernameReuse?: React.ReactNode;
  osintInvestigation: React.ReactNode;
  privacyExposure: React.ReactNode;
  faqs: { q: string; a: string }[];
}

export function SearchPlatformUsernameTemplate({ config }: { config: SearchPlatformUsernameConfig }) {
  const canonical = `${CANONICAL_BASE}/${config.slug}`;
  const title = `Search ${config.platform} Username – Find Profiles | FootprintIQ`;
  const h1 = `Search ${config.platform} Username`;

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: config.faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: CANONICAL_BASE },
      { "@type": "ListItem", position: 2, name: h1, item: canonical },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={config.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={config.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Search className="h-3 w-3 mr-1.5" />{config.platform} Username Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{h1}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Search any {config.platform} username to check profile existence and discover linked accounts across 500+ platforms. {config.platform} profiles follow the pattern <code className="text-sm">{config.profilePattern}</code>.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Username Searches Work On {config.platform}</h2>
            {config.howItWorks}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Investigators Track {config.platform} Accounts</h2>
            {config.findingProfiles}
          </div>
        </section>

        {config.usernameReuse && (
          <section className="py-16 bg-muted/20">
            <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
              <h2>Username Reuse Across Social Platforms</h2>
              {config.usernameReuse}
            </div>
          </section>
        )}

        <section className={`py-16 ${config.usernameReuse ? '' : 'bg-muted/20'}`}>
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Username Investigation</h2>
            {config.osintInvestigation}
          </div>
        </section>

        <section className={`py-16 ${config.usernameReuse ? 'bg-muted/20' : ''}`}>
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Privacy Risks Of Public Usernames</h2>
            {config.privacyExposure}
            <p>
              Use FootprintIQ's <Link to="/username-search" className="text-primary hover:underline">username search tool</Link> to audit your own exposure, run a <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link>, or check your full digital presence with the <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint checker</Link>.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {config.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-6">
                  <AccordionTrigger className="text-foreground font-medium text-left py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <FinalCTA />
        <section className="py-12 bg-muted/10"><div className="max-w-3xl mx-auto px-6 space-y-8"><AboutFootprintIQBlock /></div></section>
      </main>
      <Footer />
    </>
  );
}
