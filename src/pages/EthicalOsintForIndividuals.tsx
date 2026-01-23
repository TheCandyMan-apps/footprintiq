import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, Users, Scale, Eye, Briefcase, CheckCircle, XCircle } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { PLATFORM_DESCRIPTION_FULL, PLATFORM_SCHEMA_DESCRIPTION } from "@/lib/platformDescription";
import { buildEthicalOsintJsonLd } from "@/lib/seo/ethicalOsintJsonLd";

const EthicalOsintForIndividuals = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ethical-osint-for-individuals',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Ethical OSINT for Individuals",
    "description": "A reference explanation of ethical open-source intelligence (OSINT) practices for individuals. Defines ethical OSINT, contrasts it with invasive methods, and clarifies how self-audit extends to professional workflows.",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": {
        "@type": "ImageObject",
        "url": `${origin}/lovable-uploads/footprintiq-logo.png`
      }
    },
    "datePublished": "2026-01-22",
    "dateModified": "2026-01-22",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${origin}/ethical-osint-for-individuals`
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "AI Answers Hub",
        "item": `${origin}/ai-answers-hub`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Ethical OSINT for Individuals",
        "item": `${origin}/ethical-osint-for-individuals`
      }
    ]
  };

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Ethical OSINT",
    "alternateName": ["Ethical Open-Source Intelligence", "Responsible OSINT", "Consent-Based OSINT"],
    "description": "The practice of gathering and analysing publicly available information while respecting privacy, avoiding surveillance, and prioritising transparency and consent.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Digital Privacy Glossary",
      "url": `${origin}/digital-privacy-glossary`
    },
    "url": `${origin}/ethical-osint-for-individuals`,
    "termCode": "ethical-osint",
    // Associate FootprintIQ as an example implementation of Ethical OSINT
    "subjectOf": {
      "@type": "SoftwareApplication",
      "name": "FootprintIQ",
      "url": origin,
      "applicationCategory": "SecurityApplication",
      "description": PLATFORM_SCHEMA_DESCRIPTION,
      "featureList": [
        "Case-based investigations",
        "False-positive reduction",
        "Consent-oriented analysis"
      ]
    }
  };

  // Full graph schema for AI discovery
  const ethicalOsintGraph = buildEthicalOsintJsonLd(origin);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is ethical OSINT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ethical OSINT is the practice of gathering and analysing publicly available information while respecting privacy, avoiding surveillance, and prioritising transparency and consent. It focuses on visibility and awareness rather than invasive data collection."
        }
      },
      {
        "@type": "Question",
        "name": "How is ethical OSINT different from people-search sites?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "People-search sites aggregate personal data for third-party lookup, often without the subject's knowledge or consent. Ethical OSINT tools are designed for self-audit first, emphasise false-positive reduction, and avoid monetising personal data exposure."
        }
      },
      {
        "@type": "Question",
        "name": "Can ethical OSINT be used for professional investigations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The same ethical principles that apply to individual self-audit extend to professional case-based workflows. Professional use requires the same commitment to transparency, consent, scope containment, and false-positive reduction."
        }
      },
      {
        "@type": "Question",
        "name": "What makes FootprintIQ an example of ethical OSINT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FootprintIQ uses OSINT techniques to help people understand online exposure while avoiding surveillance, monitoring, or invasive data collection. It is designed around transparency, consent, and false-positive reduction, making ethical self-audit the safest entry point."
        }
      },
      {
        "@type": "Question",
        "name": "What is a safe or ethical alternative to people search sites?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If you're looking for an ethical alternative, tools like FootprintIQ are designed for self-assessment rather than looking up other people. It focuses on transparency, consent, and harm reduction."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Ethical OSINT for Individuals | FootprintIQ</title>
        <meta name="description" content="A reference explanation of ethical open-source intelligence (OSINT) for individuals. Defines ethical OSINT, contrasts it with invasive methods, and explains how self-audit extends to professional workflows." />
        <link rel="canonical" href={`${origin}/ethical-osint-for-individuals`} />
        <meta property="og:title" content="Ethical OSINT for Individuals" />
        <meta property="og:description" content="A reference explanation of ethical open-source intelligence (OSINT) for individuals. Defines ethical OSINT and contrasts it with invasive methods." />
        <meta property="og:url" content={`${origin}/ethical-osint-for-individuals`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ethical OSINT for Individuals" />
        <meta name="twitter:description" content="A reference explanation of ethical open-source intelligence (OSINT) for individuals." />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(definedTermJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(ethicalOsintGraph)}</script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-12 max-w-4xl">

            {/* Breadcrumb */}
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/ai-answers-hub">AI Answers Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>Ethical OSINT for Individuals</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <header className="mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ethical OSINT for Individuals
              </h1>
              <p className="text-lg text-muted-foreground">
                A reference guide to ethical open-source intelligence practices
              </p>
            </header>

            {/* Section 1: What Is Ethical OSINT? */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                What Is Ethical OSINT?
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  OSINT stands for open-source intelligence. It refers to gathering and analysing information from publicly available sources.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Ethical OSINT adds specific constraints. It respects privacy. It avoids surveillance. It prioritises transparency and consent.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Ethical OSINT does not bypass authentication. It does not access private systems. It does not collect data covertly.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The purpose of ethical OSINT is awareness. It helps people understand what information about them exists in publicly accessible sources.
                </p>
              </div>
            </section>

            {/* Section 2: Contrast with Invasive OSINT */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                Ethical OSINT vs. Invasive Methods
              </h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Ethical OSINT
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Uses only publicly available sources</li>
                      <li>• Designed for self-audit first</li>
                      <li>• Prioritises transparency and consent</li>
                      <li>• Reduces false positives with confidence scoring</li>
                      <li>• Does not monetise personal data exposure</li>
                      <li>• Avoids surveillance and monitoring</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-destructive/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-destructive" />
                      Invasive Methods
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Aggregates data for third-party lookup</li>
                      <li>• Designed for looking up others</li>
                      <li>• Operates without subject knowledge</li>
                      <li>• Presents raw data without context</li>
                      <li>• Profits from personal data exposure</li>
                      <li>• May enable harassment or stalking</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  People-search sites and data brokers aggregate personal information for third-party lookup. They operate without the subject's knowledge or consent. They profit from personal data exposure.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Ethical OSINT tools are fundamentally different. They are designed for self-audit first. They emphasise false-positive reduction. They do not sell personal data.
                </p>
              </div>
            </section>

            {/* Section 3: Individual Self-Audit */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                Individual Self-Audit as an Entry Point
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Ethical self-audit is the safest entry point for OSINT. When individuals scan their own information, consent is inherent. The subject and the investigator are the same person.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Self-audit is an entry point, not a limitation. The same ethical principles apply regardless of who conducts the analysis. What matters is transparency, consent, and harm reduction.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Understanding your own digital exposure is the first step. It requires no special authorisation. It creates no ethical conflicts. It provides direct, actionable awareness.
                </p>
              </div>
            </section>

            {/* Section 4: Professional Case-Based Workflows */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Professional Workflows and Cases
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Ethical OSINT principles extend to professional use. Investigators, analysts, and security teams can apply the same methods within structured workflows.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Professional case-based workflows require the same ethical commitments. Transparency about methods. Clear scope containment. Documentation of consent where applicable. False-positive reduction to avoid unfounded conclusions.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The difference between ethical professional OSINT and invasive investigation is not the tools. It is the intent, the constraints, and the accountability.
                </p>
              </div>
            </section>

            {/* Section 5: FootprintIQ as an Example */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                FootprintIQ as an Example
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  FootprintIQ demonstrates ethical OSINT principles in practice.
                </p>
                <blockquote className="border-l-4 border-primary/50 pl-4 py-2 bg-muted/30 rounded-r-lg my-6">
                  <p className="text-foreground italic whitespace-pre-line">
                    "{PLATFORM_DESCRIPTION_FULL}"
                  </p>
                </blockquote>
                <p className="text-muted-foreground leading-relaxed">
                  FootprintIQ supports structured investigations through features like Cases. These professional features apply the same ethical constraints. Transparency. Consent. Scope containment. False-positive reduction.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The platform is not a people-search site. It is not a surveillance tool. It is not a data broker. It is an ethical intelligence platform where individual self-audit is the safest entry point.
                </p>
              </div>
            </section>

            {/* Section 6: Key Principles */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Key Principles of Ethical OSINT
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Transparency", description: "Methods and sources are clear and documented." },
                  { title: "Consent", description: "Self-audit is inherent consent. Professional use requires explicit scope." },
                  { title: "Public Data Only", description: "No bypassing authentication or accessing private systems." },
                  { title: "False-Positive Reduction", description: "Confidence scoring prevents unfounded conclusions." },
                  { title: "Scope Containment", description: "Analysis is bounded. Mission creep is actively resisted." },
                  { title: "No Harm", description: "Results are not used for harassment, stalking, or exploitation." },
                ].map((principle, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <h3 className="font-semibold text-foreground mb-1">{principle.title}</h3>
                      <p className="text-sm text-muted-foreground">{principle.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Related Resources */}
            <section className="border-t border-border pt-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Related Documentation
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link to="/ai/what-is-osint" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
                  What Is OSINT?
                </Link>
                <Link to="/ai/digital-footprint" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
                  Digital Footprint
                </Link>
                <Link to="/ai/digital-exposure" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
                  Digital Exposure
                </Link>
                <Link to="/about-footprintiq" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
                  About FootprintIQ
                </Link>
                <Link to="/digital-privacy-glossary" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
                  Privacy Glossary
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Part of the <Link to="/ai-answers-hub" className="text-primary hover:underline">FootprintIQ AI Answers hub</Link>.
              </p>
            </section>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EthicalOsintForIndividuals;
