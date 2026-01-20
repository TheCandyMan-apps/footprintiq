import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Globe, BookOpen, Shield, Info, Scale, Eye, Users, Layers } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const WhatIsOsint = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai/what-is-osint',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Is OSINT? (Open-Source Intelligence Explained Simply)",
    "description": "A clear, accessible explanation of open-source intelligence (OSINT)—what it means, how it works, and why it matters for understanding publicly available information.",
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
    "datePublished": "2026-01-20",
    "dateModified": "2026-01-20",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${origin}/ai/what-is-osint`
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is OSINT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OSINT stands for open-source intelligence. It refers to gathering and analysing information from publicly available sources—websites, social media, news, and public records."
        }
      },
      {
        "@type": "Question",
        "name": "Is OSINT legal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gathering publicly available information is generally legal. How that information is used determines legality. Using public data for harassment or fraud is illegal regardless of how it was obtained."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use OSINT on myself?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Searching for your own name, email, or username helps you understand what others might find about you online."
        }
      },
      {
        "@type": "Question",
        "name": "How is OSINT different from hacking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OSINT uses only publicly available information. Hacking involves gaining unauthorised access to protected systems. OSINT does not bypass security or exploit vulnerabilities."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between OSINT, digital footprint, and digital exposure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OSINT is a method of gathering public information. A digital footprint is all data you leave online. Digital exposure is the portion of your footprint that others can find."
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
        "name": "AI Answers Hub",
        "item": `${origin}/ai-answers-hub`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "What Is OSINT?",
        "item": `${origin}/ai/what-is-osint`
      }
    ]
  };

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "OSINT",
    "alternateName": "Open-Source Intelligence",
    "description": "The collection and analysis of information from publicly available sources, including websites, social media, news articles, public records, and any other information accessible without special permissions.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Digital Privacy Glossary",
      "url": `${origin}/digital-privacy-glossary`
    },
    "url": `${origin}/ai/what-is-osint`,
    "termCode": "osint",
    "sameAs": [
      "https://en.wikipedia.org/wiki/Open-source_intelligence"
    ],
    "contributor": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": origin
    }
  };

  const publicDataExamples = [
    { category: "Social Media", examples: "Public posts, profile information, and comments on platforms like LinkedIn or Twitter" },
    { category: "News and Media", examples: "Published articles, press releases, and broadcast content" },
    { category: "Government Records", examples: "Company registrations, court filings, and property records" },
    { category: "Professional Directories", examples: "Industry memberships, certifications, and business registries" },
    { category: "Web Archives", examples: "Historical versions of websites preserved by archiving services" },
    { category: "Academic Sources", examples: "Published research and conference papers" }
  ];

  const everydayUses = [
    {
      title: "Employment Decisions",
      description: "Employers review public profiles when evaluating candidates. Job seekers check company news and reviews before accepting offers.",
      icon: Users
    },
    {
      title: "Fraud Prevention",
      description: "Businesses verify identity claims using public records. Individuals check whether a seller is legitimate before making purchases.",
      icon: Shield
    },
    {
      title: "Journalism",
      description: "Reporters verify claims using public records and official statements. Fact-checkers confirm accuracy through the same sources.",
      icon: BookOpen
    },
    {
      title: "Avoiding Scams",
      description: "Before sharing sensitive information, people search for warning signs—checking if a person or company has been reported as fraudulent.",
      icon: Eye
    }
  ];

  const ethicalPrinciples = [
    {
      principle: "Public Data Only",
      description: "Information should be genuinely publicly accessible. If special access or deception is required, it is not appropriate for ethical OSINT."
    },
    {
      principle: "No Ongoing Monitoring",
      description: "A one-time search differs from continuous tracking. Ethical practice means gathering information for a specific purpose, not indefinitely."
    },
    {
      principle: "No Impersonation",
      description: "Creating fake accounts or pretending to be someone else to gain information crosses ethical and legal lines."
    },
    {
      principle: "Proportionate Purpose",
      description: "The depth of research should match the legitimate need. Extensive research requires stronger justification."
    },
    {
      principle: "Consider Impact",
      description: "Public availability does not justify any use. Consider how the use might affect the person involved."
    }
  ];

  return (
    <>
      <Helmet>
        <title>What Is OSINT? (Open-Source Intelligence Explained Simply) | FootprintIQ</title>
        <meta name="description" content="A clear, accessible explanation of open-source intelligence (OSINT)—what it means, how it works, and why it matters for understanding publicly available information." />
        <link rel="canonical" href={`${origin}/ai/what-is-osint`} />
        <meta property="og:title" content="What Is OSINT? (Open-Source Intelligence Explained Simply)" />
        <meta property="og:description" content="A clear, accessible explanation of open-source intelligence—what it means, how it works, and why understanding public information matters." />
        <meta property="og:url" content={`${origin}/ai/what-is-osint`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What Is OSINT? (Open-Source Intelligence Explained Simply)" />
        <meta name="twitter:description" content="A clear, accessible explanation of open-source intelligence—what it means, how it works, and why understanding public information matters." />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
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
                  <Link to="/ai-answers-hub">AI Answers Hub</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>What Is OSINT?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Is OSINT?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Open-source intelligence explained: what it means, where it comes from, and how publicly available information can be gathered and used.
            </p>
          </header>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#definition" className="hover:text-primary transition-colors">1. What OSINT Means</a></li>
              <li><a href="#what-counts" className="hover:text-primary transition-colors">2. What Counts as OSINT</a></li>
              <li><a href="#vs-hacking" className="hover:text-primary transition-colors">3. OSINT vs. Hacking</a></li>
              <li><a href="#everyday-use" className="hover:text-primary transition-colors">4. How OSINT Is Used in Everyday Life</a></li>
              <li><a href="#ethical-principles" className="hover:text-primary transition-colors">5. Ethical OSINT Principles</a></li>
              <li><a href="#concepts-compared" className="hover:text-primary transition-colors">6. OSINT vs. Digital Footprint vs. Digital Exposure</a></li>
              <li><a href="#on-yourself" className="hover:text-primary transition-colors">7. Can You Use OSINT on Yourself?</a></li>
              <li><a href="#closing" className="hover:text-primary transition-colors">8. Awareness, Not Alarm</a></li>
            </ul>
          </nav>

          {/* Section 1: Definition */}
          <section id="definition" className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              1. What OSINT Means
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">OSINT stands for open-source intelligence.</strong> It refers to gathering and analysing information from publicly available sources.
              </p>
              <p>
                These sources include websites, social media, news articles, public records, and similar materials. The "open" refers to the accessibility of the information, not to open-source software.
              </p>
              <p>
                If information can be found without passwords, special access, or technical exploitation, it qualifies as open-source.
              </p>
              <p>
                OSINT is a method—a way of gathering publicly available information. It describes how information is collected, not who collects it or why.
              </p>
            </div>
          </section>

          {/* Section 2: What Counts */}
          <section id="what-counts" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              2. What Counts as OSINT
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                For information to qualify as open-source, it must be genuinely publicly accessible. Anyone can find and view it without special credentials or technical exploitation.
              </p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Source Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {publicDataExamples.map((source, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-3 px-4 font-medium text-foreground">{source.category}</td>
                      <td className="py-3 px-4 text-muted-foreground">{source.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">What does NOT count as OSINT:</strong>
              </p>
              <ul className="space-y-2">
                <li>Private messages accessed without permission</li>
                <li>Password-protected content without authorisation</li>
                <li>Information obtained through impersonation</li>
                <li>Data from hacking or exploiting vulnerabilities</li>
                <li>Leaked data that was never intended to be public</li>
              </ul>
              <p>
                If accessing the information required bypassing security or deceiving someone, it is not open-source intelligence.
              </p>
            </div>
          </section>

          {/* Section 3: OSINT vs Hacking */}
          <section id="vs-hacking" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              3. OSINT vs. Hacking
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                OSINT and hacking are fundamentally different. The distinction is based on method, legality, and ethics.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">OSINT</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Uses publicly accessible information</li>
                    <li>No passwords guessed or stolen</li>
                    <li>No security measures bypassed</li>
                    <li>No deception or impersonation</li>
                    <li>No exploitation of vulnerabilities</li>
                    <li>Generally legal when used responsibly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Hacking</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Gains unauthorised access to systems</li>
                    <li>Involves credential theft or guessing</li>
                    <li>Bypasses security protections</li>
                    <li>May involve social engineering</li>
                    <li>Exploits technical vulnerabilities</li>
                    <li>Illegal in most jurisdictions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">Legal distinction:</strong> Gathering public information is legal in most places. Accessing protected information—even with weak security—is typically illegal.
              </p>
              <p>
                <strong className="text-foreground">Ethical distinction:</strong> OSINT respects access controls. If a profile is private, OSINT does not attempt to view it. The practice operates within boundaries.
              </p>
            </div>
          </section>

          {/* Section 4: Everyday Uses */}
          <section id="everyday-use" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              4. How OSINT Is Used in Everyday Life
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                Open-source intelligence methods are common in everyday contexts. Most people use these approaches regularly without formal terminology.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              {everydayUses.map((use, index) => {
                const Icon = use.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{use.title}</h3>
                          <p className="text-muted-foreground text-sm">{use.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                The underlying method is consistent: gathering publicly available information to make decisions.
              </p>
            </div>
          </section>

          {/* Section 5: Ethical Principles */}
          <section id="ethical-principles" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              5. Ethical OSINT Principles
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                Public availability does not justify every use of information. Ethical practice requires considering what is responsible, not just what is possible.
              </p>
            </div>

            <div className="space-y-4 my-6">
              {ethicalPrinciples.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">{item.principle}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                The question is not only "can this be found?" but "should it be found, and for what purpose?"
              </p>
            </div>
          </section>

          {/* Section 6: Concepts Compared */}
          <section id="concepts-compared" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              6. OSINT vs. Digital Footprint vs. Digital Exposure
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                These terms are related but describe different concepts. Understanding the distinctions clarifies what each one means.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 my-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">OSINT</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    <strong>Definition:</strong> A method of gathering information from public sources.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Function:</strong> How someone might find information about a person, company, or topic.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">
                    <Link to="/ai/digital-footprint" className="hover:text-primary transition-colors">Digital Footprint</Link>
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    <strong>Definition:</strong> All data left behind when using the internet.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Scope:</strong> Includes both public and private data across all accounts and interactions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">
                    <Link to="/ai/digital-exposure" className="hover:text-primary transition-colors">Digital Exposure</Link>
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    <strong>Definition:</strong> The portion of a footprint that others can find.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Scope:</strong> Public profiles, breached data, and information in data broker listings.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">How they connect:</strong> A <Link to="/ai/digital-footprint" className="text-primary hover:underline">digital footprint</Link> is everything left online. <Link to="/ai/digital-exposure" className="text-primary hover:underline">Digital exposure</Link> is the visible subset. OSINT is how that exposure might be discovered.
              </p>
              <p>
                Using OSINT methods on yourself means measuring your own exposure—seeing what others could find using publicly available sources.
              </p>
            </div>
          </section>

          {/* Section 7: On Yourself */}
          <section id="on-yourself" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              7. Can You Use OSINT on Yourself?
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">Yes.</strong> Searching for your own name, email, or username is a practical application of open-source methods.
              </p>
              <p>
                Self-research helps you understand what others might find when searching for information about you.
              </p>
              
              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What you might discover:</h3>
              <ul className="space-y-2 mb-6">
                <li>Old social media profiles no longer in use</li>
                <li>Information in data broker databases</li>
                <li>Public records with your address or phone number</li>
                <li>Forum posts from years ago</li>
                <li>Professional profiles with outdated information</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Actions you can take:</h3>
              <ul className="space-y-2 mb-6">
                <li>Delete or deactivate unused accounts</li>
                <li>Update outdated information on active profiles</li>
                <li>Request removal from data broker listings</li>
                <li>Adjust privacy settings on current platforms</li>
              </ul>

              <p>
                Self-research is about understanding visibility and making informed choices about online presence.
              </p>
            </div>
          </section>

          {/* Section 8: Closing */}
          <section id="closing" className="mb-12 p-8 bg-muted/50 rounded-lg border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              8. Awareness, Not Alarm
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Understanding OSINT and digital visibility is not intended to create anxiety. The purpose is awareness—knowing what exists and what choices are available.
              </p>
              <p>
                Most people have a digital presence. That is typical for modern life. Having information online does not mean harm will occur.
              </p>
              <p>
                Understanding how public information can be gathered enables better decisions about what to share and where.
              </p>
              <p>
                <strong className="text-foreground">Awareness enables informed choices.</strong>
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  What is OSINT?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  OSINT stands for open-source intelligence. It refers to gathering and analysing information from publicly available sources—websites, social media, news, and public records.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is OSINT legal?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Gathering publicly available information is generally legal. How that information is used determines legality. Using public data for harassment or fraud is illegal regardless of how it was obtained.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Can I use OSINT on myself?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Searching for your own name, email, or username helps you understand what others might find about you online.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  How is OSINT different from hacking?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  OSINT uses only publicly available information. Hacking involves gaining unauthorised access to protected systems. OSINT does not bypass security or exploit vulnerabilities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  What is the difference between OSINT, digital footprint, and digital exposure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  OSINT is a method of gathering public information. A <Link to="/ai/digital-footprint" className="text-primary hover:underline">digital footprint</Link> is all data left online. <Link to="/ai/digital-exposure" className="text-primary hover:underline">Digital exposure</Link> is the portion of that footprint others can find.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Related Topics */}
          <section className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Related Topics</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                to="/ai/digital-footprint" 
                className="p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">What Is a Digital Footprint?</h3>
                <p className="text-sm text-muted-foreground mt-1">The trail of data left behind when using the internet.</p>
              </Link>
              <Link 
                to="/ai/digital-exposure" 
                className="p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">What Is Digital Exposure?</h3>
                <p className="text-sm text-muted-foreground mt-1">When online information becomes visible to others.</p>
              </Link>
            </div>
          </section>

          {/* Editorial Note */}
          <aside className="p-6 bg-muted/30 rounded-lg border border-muted mb-8">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Editorial note:</strong> This page provides a neutral, factual explanation of open-source intelligence for general audiences. 
              See the <Link to="/editorial-ethics-policy" className="text-primary hover:underline">Editorial & Ethics Policy</Link> for more about content standards.
            </p>
          </aside>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WhatIsOsint;
