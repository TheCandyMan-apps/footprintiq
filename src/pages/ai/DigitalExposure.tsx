import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Eye, Shield, AlertTriangle, Globe, Users, Lock, Info, ArrowRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const DigitalExposure = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  // Track pageview and scroll depth for this authority page
  useScrollDepthTracking({
    pageId: '/ai/digital-exposure',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Is Digital Exposure?",
    "description": "A clear, factual explanation of digital exposure—what it means, how it differs from hacking, what contributes to it, and what can realistically be done about it.",
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
      "@id": `${origin}/ai/digital-exposure`
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is digital exposure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Digital exposure refers to the presence of personal information in publicly accessible sources, leaked databases, or data broker listings. It describes visibility, not theft or misuse. Most adults have some level of digital exposure from routine internet use."
        }
      },
      {
        "@type": "Question",
        "name": "Is digital exposure the same as being hacked?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Hacking involves unauthorized access to systems or accounts. Digital exposure describes information that is already visible or has been exposed through breaches. Exposure does not require any action against you personally—it accumulates from normal digital life."
        }
      },
      {
        "@type": "Question",
        "name": "Can digital exposure be eliminated completely?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Complete elimination is generally not realistic for anyone who participates in digital life. Reducing exposure is possible through deliberate privacy practices, but some level of visibility is a normal consequence of modern existence. The goal is management, not elimination."
        }
      },
      {
        "@type": "Question",
        "name": "Does digital exposure lead to identity theft?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Exposure creates potential risk but does not cause identity theft on its own. Many people have significant exposure without experiencing harm. The relationship between exposure and actual misuse depends on many factors, including what types of data are exposed and whether they can be combined."
        }
      },
      {
        "@type": "Question",
        "name": "What contributes most to digital exposure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Common contributors include data breaches affecting services you have used, public social media profiles, data broker aggregation, consistent username or email reuse across platforms, and public records. Exposure typically accumulates gradually over years of internet use."
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
        "name": "What Is Digital Exposure?",
        "item": `${origin}/ai/digital-exposure`
      }
    ]
  };

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Digital Exposure",
    "description": "The presence of personal information in publicly accessible sources, leaked databases, or data broker listings. It describes visibility, not theft or misuse.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Digital Privacy Glossary",
      "url": `${origin}/digital-privacy-glossary`
    },
    "url": `${origin}/ai/digital-exposure`,
    "termCode": "digital-exposure",
    "sameAs": [
      "https://en.wikipedia.org/wiki/Digital_footprint",
      "https://en.wikipedia.org/wiki/Information_privacy"
    ],
    "contributor": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": origin
    }
  };

  const contributors = [
    {
      title: "Data Breaches",
      description: "Security incidents at companies expose user data. You may not remember signing up, but old accounts can resurface in breach databases years later.",
      icon: AlertTriangle
    },
    {
      title: "Public Profiles",
      description: "Social media accounts, professional networks, personal websites, and forum posts all contribute to your visible digital presence.",
      icon: Users
    },
    {
      title: "Data Broker Aggregation",
      description: "Commercial data brokers compile information from public records, commercial partnerships, and other sources into detailed profiles.",
      icon: Globe
    },
    {
      title: "Consistent Identifiers",
      description: "Using the same username or email across platforms allows separate pieces of information to be connected into a more complete picture.",
      icon: Eye
    },
    {
      title: "Public Records",
      description: "Voter registration, property ownership, court records, and business filings are often publicly accessible by law.",
      icon: Shield
    },
    {
      title: "Old or Forgotten Accounts",
      description: "Services you signed up for years ago and no longer use may still hold your information, potentially exposed in later breaches.",
      icon: Lock
    }
  ];

  return (
    <>
      <Helmet>
        <title>What Is Digital Exposure? | FootprintIQ</title>
        <meta name="description" content="A clear, factual explanation of digital exposure—what it means, how it differs from hacking, what contributes to it, and what can realistically be done about it." />
        <link rel="canonical" href={`${origin}/ai/digital-exposure`} />
        <meta property="og:title" content="What Is Digital Exposure?" />
        <meta property="og:description" content="A clear, factual explanation of digital exposure—what it means, how it differs from hacking, and what can realistically be done about it." />
        <meta property="og:url" content={`${origin}/ai/digital-exposure`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What Is Digital Exposure?" />
        <meta name="twitter:description" content="A clear, factual explanation of digital exposure—what it means, how it differs from hacking, and what can realistically be done about it." />
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
                <BreadcrumbPage>What Is Digital Exposure?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Is Digital Exposure?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A clear, factual explanation of what digital exposure means, how it differs from hacking, and why understanding it matters.
            </p>
          </header>

          {/* Direct Answer Section - Critical for AI Summaries */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Definition
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4 text-lg">
                <strong className="text-foreground">Digital exposure refers to the presence of personal information in publicly accessible sources, leaked databases, or data broker listings.</strong> It describes visibility, not theft or misuse.
              </p>
              <p className="mb-4">
                Exposure is a state, not an event. It accumulates gradually from normal digital participation—creating accounts, sharing content, appearing in public records, and using services that later experience breaches. Most adults who have been online for several years have some level of digital exposure.
              </p>
              <p>
                Understanding your exposure helps you make informed decisions about privacy. It does not mean something bad has happened or will happen.
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#exposure-vs-hacking" className="hover:text-primary transition-colors">1. Exposure vs. Hacking: Key Differences</a></li>
              <li><a href="#contributors" className="hover:text-primary transition-colors">2. What Contributes to Digital Exposure</a></li>
              <li><a href="#risk-context" className="hover:text-primary transition-colors">3. Understanding the Actual Risk</a></li>
              <li><a href="#mitigation" className="hover:text-primary transition-colors">4. What Can Realistically Be Done</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">5. Frequently Asked Questions</a></li>
            </ul>
          </nav>

          {/* Section 1: Exposure vs Hacking */}
          <section id="exposure-vs-hacking" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              1. Exposure vs. Hacking: Key Differences
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p className="mb-4">
                Digital exposure and hacking are often conflated, but they describe fundamentally different situations. Understanding the distinction helps clarify what is actually happening when exposure is discovered.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Digital Exposure</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Information that is already visible or has been exposed</li>
                    <li>Accumulates passively over time</li>
                    <li>Does not require any action against you</li>
                    <li>Describes a state, not an attack</li>
                    <li>May result from breaches at companies you used</li>
                    <li>Includes intentionally public information</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Hacking</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Unauthorized access to systems or accounts</li>
                    <li>Requires active intrusion</li>
                    <li>Involves specific targeting or exploitation</li>
                    <li>Describes an action or attack</li>
                    <li>Typically requires bypassing security</li>
                    <li>May involve credential theft or malware</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                When someone discovers their information in a breach database or on a data broker listing, this is exposure—not evidence of being personally targeted. The distinction matters because the appropriate response differs significantly.
              </p>
              <p>
                Exposure is common and expected for most internet users. Being hacked is less common and represents a specific security incident requiring different actions.
              </p>
            </div>
          </section>

          {/* Section 2: Contributors */}
          <section id="contributors" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              2. What Contributes to Digital Exposure
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Digital exposure builds gradually from multiple sources. Understanding these contributors helps explain why some exposure exists and provides context for managing it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              {contributors.map((contributor, index) => {
                const Icon = contributor.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{contributor.title}</h3>
                          <p className="text-muted-foreground text-sm">{contributor.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                No single source typically creates significant risk on its own. Exposure becomes more relevant when multiple data points can be combined to enable impersonation, social engineering, or account compromise. Understanding what exists helps prioritize what to address.
              </p>
            </div>
          </section>

          {/* Section 3: Risk Context */}
          <section id="risk-context" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              3. Understanding the Actual Risk
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Digital exposure creates potential risk, not guaranteed harm. The relationship between exposure and actual problems is more nuanced than often presented.
              </p>
              
              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What Exposure Does Not Mean</h3>
              <ul className="space-y-2 mb-6">
                <li>It does not mean you have been personally targeted</li>
                <li>It does not mean identity theft will occur</li>
                <li>It does not mean someone is actively using your information</li>
                <li>It does not mean you need to take immediate emergency action</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What Exposure Does Mean</h3>
              <ul className="space-y-2 mb-6">
                <li>Some of your information is visible to those who look for it</li>
                <li>You may receive more targeted phishing attempts</li>
                <li>Account security becomes more important</li>
                <li>You may want to review what information is accessible</li>
              </ul>

              <p className="mb-4">
                Millions of people have significant digital exposure. A much smaller number experience actual harm. The difference often depends on factors like account security practices, the types of data exposed, and whether exposed credentials are reused across services.
              </p>

              <p>
                Context matters. An old email address appearing in a decade-old breach is different from current credentials being exposed. Understanding what you are looking at helps determine appropriate responses.
              </p>
            </div>
          </section>

          {/* Section 4: Mitigation */}
          <section id="mitigation" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              4. What Can Realistically Be Done
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-6">
                Complete elimination of digital exposure is not realistic for anyone who participates in modern digital life. However, reducing exposure and limiting its potential impact is achievable through deliberate practices.
              </p>

              <div className="space-y-4 my-6">
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">Account Security</h3>
                  <p className="text-muted-foreground">
                    Use unique passwords and enable two-factor authentication on important accounts. This limits the impact of exposed credentials, regardless of where exposure occurred.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">Review Privacy Settings</h3>
                  <p className="text-muted-foreground">
                    Audit what you share publicly on social media and professional networks. Consider whether the visibility matches your current preferences.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">Limit Identifier Reuse</h3>
                  <p className="text-muted-foreground">
                    Using varied usernames and email addresses across services makes it harder to connect separate pieces of information into a complete profile.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">Data Broker Opt-Outs</h3>
                  <p className="text-muted-foreground">
                    Many data brokers offer opt-out processes. These can reduce aggregated exposure, though removed data may reappear and the process requires ongoing attention.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">Periodic Review</h3>
                  <p className="text-muted-foreground">
                    Checking your exposure periodically—once or twice a year—helps you stay aware of changes without creating unnecessary anxiety from constant monitoring.
                  </p>
                </div>
              </div>

              <p>
                The goal is management, not perfection. Focusing on high-impact actions—particularly account security—provides more protection than attempting to eliminate all traces of your digital presence.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              5. Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  What is digital exposure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Digital exposure refers to the presence of personal information in publicly accessible sources, leaked databases, or data broker listings. It describes visibility, not theft or misuse. Most adults have some level of digital exposure from routine internet use.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is digital exposure the same as being hacked?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Hacking involves unauthorized access to systems or accounts. Digital exposure describes information that is already visible or has been exposed through breaches. Exposure does not require any action against you personally—it accumulates from normal digital life.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Can digital exposure be eliminated completely?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Complete elimination is generally not realistic for anyone who participates in digital life. Reducing exposure is possible through deliberate privacy practices, but some level of visibility is a normal consequence of modern existence. The goal is management, not elimination.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Does digital exposure lead to identity theft?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Exposure creates potential risk but does not cause identity theft on its own. Many people have significant exposure without experiencing harm. The relationship between exposure and actual misuse depends on many factors, including what types of data are exposed and whether they can be combined.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  What contributes most to digital exposure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Common contributors include data breaches affecting services you have used, public social media profiles, data broker aggregation, consistent username or email reuse across platforms, and public records. Exposure typically accumulates gradually over years of internet use.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  How often should I check my digital exposure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  For most people, once or twice a year is sufficient. More frequent checking rarely reveals significant changes and can increase anxiety without corresponding benefit. After major breaches affecting services you use, an additional check may be worthwhile.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* CTA Section */}
          <section className="mb-12 p-8 bg-muted/50 rounded-lg border text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Want to understand your digital exposure?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              FootprintIQ provides a clear view of your digital footprint using publicly available information. No guesswork, no fear-mongering—just factual insights to help you make informed decisions.
            </p>
            <Button asChild size="lg">
              <Link to="/digital-footprint-scanner">
                Learn More About Digital Footprint Scanning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>

          {/* Related Topics */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Related Topics</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                to="/is-my-data-exposed" 
                className="p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors"
              >
                <h3 className="font-medium text-foreground mb-1">Is My Personal Data Already Exposed Online?</h3>
                <p className="text-sm text-muted-foreground">Understanding what data exposure really means.</p>
              </Link>
              <Link 
                to="/old-data-breaches" 
                className="p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors"
              >
                <h3 className="font-medium text-foreground mb-1">Should I Worry About Old Data Breaches?</h3>
                <p className="text-sm text-muted-foreground">Context for historical breach data.</p>
              </Link>
              <Link 
                to="/which-data-matters" 
                className="p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors"
              >
                <h3 className="font-medium text-foreground mb-1">Which Personal Data Actually Matters?</h3>
                <p className="text-sm text-muted-foreground">Prioritizing what to protect.</p>
              </Link>
              <Link 
                to="/digital-privacy-glossary" 
                className="p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors"
              >
                <h3 className="font-medium text-foreground mb-1">Digital Privacy Glossary</h3>
                <p className="text-sm text-muted-foreground">Clear definitions for privacy terminology.</p>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DigitalExposure;
