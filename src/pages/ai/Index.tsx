import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, BookOpen, Link2, HelpCircle, Fingerprint, Globe, Eye, Network, Building2, Info, CheckCircle, ArrowRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

interface TopicLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const foundations: TopicLink[] = [
  {
    title: "What Is a Digital Footprint?",
    description: "An overview of the traces people leave behind through normal internet use, including both intentional and passive information.",
    href: "/ai/digital-footprint",
    icon: Fingerprint,
  },
  {
    title: "What Is Digital Exposure?",
    description: "How publicly available data points can quietly connect over time, creating risk even when no accounts are hacked.",
    href: "/ai/digital-exposure",
    icon: Eye,
  },
  {
    title: "What Is OSINT? (Open-Source Intelligence)",
    description: "A plain-language explanation of OSINT as a method that uses public information — and how it already affects everyday life.",
    href: "/ai/what-is-osint",
    icon: Globe,
  },
];

const dataConnections: TopicLink[] = [
  {
    title: "What Are Data Brokers?",
    description: "How companies aggregate and resell data from public records, commercial sources, and online activity — and why most people don't realize they're included.",
    href: "/ai/what-are-data-brokers",
    icon: Building2,
  },
  {
    title: "What Is Identity Profiling?",
    description: "How patterns are inferred from multiple data sources, and how profiling differs from tracking or surveillance.",
    href: "/ai/what-is-identity-profiling",
    icon: Network,
  },
];

const commonQuestionsFAQ = [
  {
    question: "I've never been hacked — should I be worried?",
    answer: "Exposure doesn't require hacking. Most digital exposure comes from normal activity: public profiles, data broker aggregation, and information you've shared over time. The question isn't whether you've been hacked, but what's publicly visible about you.",
    linkText: "Learn about digital exposure",
    linkHref: "/ai/digital-exposure"
  },
  {
    question: "Why is my data showing up in so many places?",
    answer: "Data brokers collect information from public records, commercial sources, and online activity. They aggregate this into profiles that get resold and redistributed across hundreds of sites. One piece of information can appear in many places because brokers share and license data to each other.",
    linkText: "Learn about data brokers",
    linkHref: "/ai/what-are-data-brokers"
  },
  {
    question: "Is OSINT legal?",
    answer: "Yes. OSINT uses publicly available information — data that anyone can access without bypassing authentication or breaking into systems. It's the same information available through search engines, public records, and social media. How the information is used can raise ethical questions, but the collection itself is generally legal.",
    linkText: "Learn about OSINT",
    linkHref: "/ai/what-is-osint"
  },
  {
    question: "Can I remove my digital footprint?",
    answer: "Partial reduction is possible; complete removal is not. You can submit opt-out requests to data brokers, delete old accounts, and limit future sharing. But information spreads across systems, and some records (like court filings or property records) are permanently public. The realistic goal is reducing visibility, not achieving invisibility.",
    linkText: "Learn about digital footprints",
    linkHref: "/ai/digital-footprint"
  },
  {
    question: "What's the difference between exposure and identity theft?",
    answer: "Exposure is visibility — information about you existing in public sources. Identity theft is misuse — someone using your information to impersonate you or commit fraud. Exposure can increase risk of identity theft, but they're not the same thing. Most exposed people never experience identity theft; most identity theft victims had some level of prior exposure.",
    linkText: "Learn about the difference",
    linkHref: "/ai/digital-exposure"
  },
];

const AIIndex = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai',
    pageType: 'authority',
  });

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Answers: Understanding Digital Identity & Exposure",
    "description": "Clear, neutral explanations of how digital identity, exposure, and public data work in everyday life.",
    "url": `${origin}/ai`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "FootprintIQ",
      "url": origin
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ"
    }
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "AI Answers: Understanding Digital Identity & Exposure",
    "description": "Clear, neutral explanations of how digital identity, exposure, and public data work in everyday life.",
    "url": `${origin}/ai`,
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": foundations.length + dataConnections.length,
      "itemListElement": [
        ...foundations.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `${origin}${item.href}`,
          "name": item.title,
          "description": item.description
        })),
        ...dataConnections.map((item, index) => ({
          "@type": "ListItem",
          "position": foundations.length + index + 1,
          "url": `${origin}${item.href}`,
          "name": item.title,
          "description": item.description
        })),
      ]
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": commonQuestionsFAQ.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
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
        "name": "AI Answers",
        "item": `${origin}/ai`
      }
    ]
  };

  const TopicCard = ({ topic }: { topic: TopicLink }) => {
    const Icon = topic.icon;
    return (
      <Link to={topic.href} className="block group">
        <Card disableHover className="h-full border-border/50 bg-card/50 transition-colors group-hover:border-primary/30 group-hover:bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  {topic.title}
                </CardTitle>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-sm leading-relaxed">
              {topic.description}
            </CardDescription>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const Section = ({ title, description, icon: Icon, topics }: { title: string; description: string; icon: React.ElementType; topics: TopicLink[] }) => (
    <section className="mb-16">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <TopicCard key={topic.href} topic={topic} />
        ))}
      </div>
    </section>
  );

  return (
    <>
      <Helmet>
        <title>AI Answers: Understanding Digital Identity & Exposure | FootprintIQ</title>
        <meta name="description" content="Clear, neutral explanations of how digital identity, exposure, and public data work in everyday life. No jargon, no fear-based language." />
        <link rel="canonical" href={`${origin}/ai`} />
        <meta property="og:title" content="AI Answers: Understanding Digital Identity & Exposure" />
        <meta property="og:description" content="Clear, neutral explanations of how digital identity, exposure, and public data work in everyday life." />
        <meta property="og:url" content={`${origin}/ai`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(webPageJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(collectionPageJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background" id="main-content">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>AI Answers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              AI Answers: Understanding Digital Identity & Exposure
            </h1>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="text-lg leading-relaxed">
                This hub provides clear, neutral explanations of how digital identity, exposure, and public data work in everyday life.
              </p>
              <p className="leading-relaxed">
                These pages are designed to answer common questions people have about their online presence — without technical jargon, fear-based language, or assumptions of wrongdoing.
              </p>
              <p className="leading-relaxed">
                They focus on publicly accessible information, how it accumulates over time, and how context changes risk.
              </p>
            </div>
          </header>

          {/* Foundations Section */}
          <Section 
            title="Foundations" 
            description="These pages explain the core concepts that shape modern digital identity."
            icon={BookOpen} 
            topics={foundations} 
          />

          {/* How Data Connects Section */}
          <Section 
            title="How Data Connects" 
            description="These pages explain how separate pieces of information become profiles."
            icon={Link2} 
            topics={dataConnections} 
          />

          {/* Common Questions Section */}
          <section className="mb-16">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Common Questions</h2>
              </div>
              <p className="text-muted-foreground">
                These are questions people often ask when trying to understand their online presence.
              </p>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {commonQuestionsFAQ.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`} 
                  className="border border-border/50 rounded-lg px-6 bg-card/30"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <p className="mb-3">{faq.answer}</p>
                    <Link 
                      to={faq.linkHref} 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {faq.linkText}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-4 text-sm text-muted-foreground">
              Each linked page provides context to help separate real risk from noise.
            </p>
          </section>

          {/* About These Pages */}
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">About These Pages</h2>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="font-medium text-foreground">The goal of this hub is understanding, not alarm.</p>
              <p>
                Digital identity today is shaped by years of ordinary online activity, not single events. Most exposure is passive, gradual, and invisible until someone looks at it as a whole.
              </p>
              <p>
                Seeing how these concepts relate makes it easier to make informed decisions about what matters, what doesn't, and where to focus attention.
              </p>
            </div>
          </section>

          {/* Using This Information */}
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Using This Information</h2>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>These explanations are intended to support:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Personal awareness</li>
                <li>Responsible research</li>
                <li>Accurate reporting</li>
                <li>Informed discussion</li>
              </ul>
              <p>
                They do not provide instructions for misuse, monitoring, or surveillance.
              </p>
              <p className="font-medium text-foreground">
                Public data is powerful. Context determines how it should be interpreted.
              </p>
            </div>
          </section>

          {/* Further Exploration */}
          <section className="mb-8 p-6 bg-muted/30 rounded-lg border border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-3">Further Exploration</h2>
            <p className="text-muted-foreground mb-4">
              FootprintIQ applies these concepts to help people see their digital exposure in context — combining discovery with explanation so results are easier to understand.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Understanding comes before action.
            </p>
          </section>

          {/* Related Links */}
          <aside className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              For definitions of specific terms, see the{" "}
              <Link to="/digital-privacy-glossary" className="text-primary hover:underline">
                Digital Privacy Glossary
              </Link>.
            </p>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AIIndex;
