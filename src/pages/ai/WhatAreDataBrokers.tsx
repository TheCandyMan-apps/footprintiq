import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Building2, Database, DollarSign, Shield, Info, Users, Globe, FileSearch } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const WhatAreDataBrokers = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai/what-are-data-brokers',
    pageType: 'authority',
  });

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "What Are Data Brokers?",
    "description": "A clear, factual explanation of data brokers—what they are, where they get information, and how the industry operates.",
    "url": `${origin}/ai/what-are-data-brokers`,
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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a data broker?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A data broker is a company that collects personal information from various sources—public records, commercial transactions, online activity—and sells or licenses that data to other businesses, marketers, or individuals."
        }
      },
      {
        "@type": "Question",
        "name": "Where do data brokers get their information?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Data brokers gather information from public records (court filings, property records, voter registrations), commercial sources (purchase histories, warranty cards, loyalty programs), online sources (social media, websites, apps), and other data brokers through data sharing agreements."
        }
      },
      {
        "@type": "Question",
        "name": "Is data brokerage legal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In most jurisdictions, data brokerage is legal when it involves publicly available information or data collected with consent. However, regulations like GDPR in Europe and CCPA in California have introduced requirements for transparency and opt-out rights."
        }
      },
      {
        "@type": "Question",
        "name": "Can I remove my information from data brokers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Many data brokers offer opt-out processes, though they vary in complexity and effectiveness. Some require written requests, others have online forms. The process can be time-consuming as there are hundreds of data brokers, and information may reappear over time from new sources."
        }
      }
    ]
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "What Are Data Brokers?",
        "item": `${origin}/ai/what-are-data-brokers`
      }
    ]
  };

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Data Broker",
    "description": "A company that collects, aggregates, and sells personal information from public and commercial sources to other businesses, marketers, or individuals.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Digital Privacy Glossary",
      "url": `${origin}/digital-privacy-glossary`
    }
  };

  const sourceTypes = [
    {
      title: "Public Records",
      description: "Court filings, property records, voter registrations, business filings, marriage and divorce records, professional licenses.",
      icon: FileSearch
    },
    {
      title: "Commercial Sources",
      description: "Purchase histories, warranty registrations, loyalty program data, magazine subscriptions, donation records.",
      icon: DollarSign
    },
    {
      title: "Online Activity",
      description: "Social media profiles, website registrations, app usage data, browsing behavior tracked through cookies and pixels.",
      icon: Globe
    },
    {
      title: "Other Data Brokers",
      description: "Data sharing agreements, purchased datasets, and aggregated information from partner companies.",
      icon: Database
    }
  ];

  const brokerTypes = [
    {
      title: "People-Search Sites",
      description: "Websites that allow searching for individuals by name, providing addresses, phone numbers, relatives, and other personal details. Examples include Spokeo, BeenVerified, and Whitepages."
    },
    {
      title: "Marketing Data Companies",
      description: "Companies that compile consumer profiles for targeted advertising, including demographic data, purchase preferences, and lifestyle indicators."
    },
    {
      title: "Risk Assessment Providers",
      description: "Companies that aggregate data for background checks, credit decisions, tenant screening, and employment verification."
    },
    {
      title: "Location Data Brokers",
      description: "Companies that collect and sell location data from mobile apps, often used for advertising, analytics, and foot traffic analysis."
    }
  ];

  return (
    <>
      <Helmet>
        <title>What Are Data Brokers? | FootprintIQ</title>
        <meta name="description" content="A clear, factual explanation of data brokers—what they are, where they get information, and how the industry operates." />
        <link rel="canonical" href={`${origin}/ai/what-are-data-brokers`} />
        <meta property="og:title" content="What Are Data Brokers?" />
        <meta property="og:description" content="A clear, factual explanation of data brokers—what they are, where they get information, and how the industry operates." />
        <meta property="og:url" content={`${origin}/ai/what-are-data-brokers`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(webPageJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(definedTermJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb Navigation */}
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
                  <Link to="/ai">AI Answers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>What Are Data Brokers?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Are Data Brokers?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Companies that collect, aggregate, and sell personal information—explained simply, without exaggeration.
            </p>
          </header>

          {/* Definition Section */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Definition
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4 text-lg">
                <strong className="text-foreground">A data broker is a company that collects personal information from various sources and sells or licenses that data to other businesses.</strong>
              </p>
              <p className="mb-4">
                Data brokers gather information from public records, commercial transactions, online activity, and other data providers. They aggregate this information into profiles that can be searched, purchased, or used for marketing, background checks, and risk assessment.
              </p>
              <p>
                The data broker industry operates largely in the background of everyday commerce. Most people interact with data broker services indirectly—when a company verifies their identity, when they receive targeted advertising, or when their information appears on a people-search website.
              </p>
            </div>
          </section>

          {/* How Data Brokers Operate */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              How Data Brokers Operate
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Data brokers follow a collection, aggregation, and distribution model. They acquire information from multiple sources, combine it into searchable databases, and sell access to that data.
              </p>
              <p>
                The business model relies on scale. Individual pieces of information have limited value, but comprehensive profiles—combining names, addresses, phone numbers, employment history, purchasing patterns, and social connections—become commercially valuable.
              </p>
              <p>
                Most data brokers do not interact directly with the individuals whose data they collect. Information flows from source to broker to customer without the data subject's direct involvement or, often, their awareness.
              </p>
            </div>
          </section>

          {/* Where Data Comes From */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Where Data Brokers Get Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {sourceTypes.map((source, index) => {
                const Icon = source.icon;
                return (
                  <Card key={index} disableHover className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{source.title}</h3>
                          <p className="text-sm text-muted-foreground">{source.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Types of Data Brokers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Types of Data Brokers
            </h2>
            <div className="space-y-4">
              {brokerTypes.map((type, index) => (
                <div key={index} className="p-6 bg-muted/30 rounded-lg border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">{type.title}</h3>
                  <p className="text-muted-foreground">{type.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Legal Context */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Legal Context
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">Data brokerage is legal in most jurisdictions</strong> when it involves publicly available information or data collected with appropriate consent. The industry operates within legal frameworks, though those frameworks vary significantly by country and region.
              </p>
              <p>
                Regulations like GDPR in Europe and CCPA in California have introduced requirements for transparency and consumer rights. These include the right to know what data is held, the right to request deletion, and the right to opt out of sale.
              </p>
              <p>
                However, enforcement is inconsistent, and many data brokers operate across jurisdictions with different rules. The practical reality is that data brokerage continues at scale, with varying levels of transparency and consumer control.
              </p>
            </div>
          </section>

          {/* Opting Out */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Can You Remove Your Information?
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">Many data brokers offer opt-out processes, though they vary in complexity and effectiveness.</strong> Some require written requests, others have online forms, and some require identity verification before processing removals.
              </p>
              <p>
                The challenge is scale. There are hundreds of data brokers, and submitting opt-out requests to each one is time-consuming. Additionally, information may reappear over time as data brokers acquire new data from their sources.
              </p>
              <p>
                Some services and tools help automate this process, but complete removal is difficult to achieve and maintain. The more realistic goal is reducing visibility rather than eliminating it entirely.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium">
                  How is a data broker different from a credit bureau?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Credit bureaus (like Equifax, Experian, TransUnion) are regulated data brokers that specifically collect and report credit-related information. They operate under laws like the Fair Credit Reporting Act that impose accuracy requirements and consumer rights. General data brokers have fewer regulatory constraints and collect a broader range of information beyond credit history.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium">
                  Do data brokers sell my information to anyone?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Data brokers typically sell to businesses, marketers, researchers, and individuals. Most have terms of service that prohibit certain uses, but enforcement varies. Some data broker information ends up being used for fraud, stalking, or harassment—uses the brokers officially prohibit but cannot fully prevent.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium">
                  Is information from data brokers accurate?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Accuracy varies significantly. Data broker profiles often contain outdated information, errors from source data, and incorrect associations between people with similar names. There is no universal standard for accuracy, and individuals have limited ability to correct errors across the many brokers that may hold their data.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium">
                  Why haven't data brokers been more regulated?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Data brokers argue they provide valuable services—fraud prevention, marketing efficiency, identity verification. The industry has successfully lobbied against comprehensive regulation in many jurisdictions. Additionally, the complexity of the data ecosystem makes regulation challenging to design and enforce effectively.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Related Topics */}
          <section className="mb-12 p-6 bg-muted/30 rounded-lg border border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Related Topics</h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/ai/digital-exposure" className="text-sm text-primary hover:underline">
                What Is Digital Exposure?
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/ai/what-is-identity-profiling" className="text-sm text-primary hover:underline">
                What Is Identity Profiling?
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/digital-privacy-glossary" className="text-sm text-primary hover:underline">
                Digital Privacy Glossary
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WhatAreDataBrokers;
