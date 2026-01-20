import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Footprints, Shield, Clock, Globe, Users, Eye, Info, Layers } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const DigitalFootprint = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  // Track pageview and scroll depth for this authority page
  useScrollDepthTracking({
    pageId: '/ai/digital-footprint',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Is a Digital Footprint?",
    "description": "A clear, factual explanation of digital footprints—what they are, the difference between active and passive footprints, how they differ from exposure, and why understanding them matters.",
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
      "@id": `${origin}/ai/digital-footprint`
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a digital footprint?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A digital footprint is the trail of data you leave behind when using the internet. This includes websites you visit, emails you send, information you submit online, and content you post on social media. Everyone who uses the internet has a digital footprint."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between active and passive digital footprints?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An active digital footprint consists of data you intentionally share, such as social media posts, forum comments, or newsletter signups. A passive digital footprint is collected without your direct action, including browsing history, IP addresses logged by websites, and cookies tracking your behavior."
        }
      },
      {
        "@type": "Question",
        "name": "How is a digital footprint different from digital exposure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A digital footprint describes all the data you leave online, both intentional and unintentional. Digital exposure specifically refers to when that information becomes visible to others—through data breaches, public records, or aggregation by data brokers. Footprint is what exists; exposure is what others can find."
        }
      },
      {
        "@type": "Question",
        "name": "Does my digital footprint grow over time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Digital footprints tend to accumulate as you continue using online services. Old accounts, forgotten profiles, and outdated information remain part of your footprint even when you no longer use them. The longer you participate online, the larger your footprint typically becomes."
        }
      },
      {
        "@type": "Question",
        "name": "Can I delete my digital footprint completely?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Complete deletion is generally not realistic for anyone who has used the internet regularly. You can reduce your footprint by deleting accounts, requesting data removal, and being more selective about future sharing. However, some information may persist in archives, backups, or third-party databases beyond your control."
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
        "name": "What Is a Digital Footprint?",
        "item": `${origin}/ai/digital-footprint`
      }
    ]
  };

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Digital Footprint",
    "description": "The trail of data left behind when using the internet, including websites visited, emails sent, information submitted online, and content posted on social media.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Digital Privacy Glossary",
      "url": `${origin}/digital-privacy-glossary`
    },
    "url": `${origin}/ai/digital-footprint`,
    "termCode": "digital-footprint",
    "sameAs": [
      "https://en.wikipedia.org/wiki/Digital_footprint",
      "https://en.wikipedia.org/wiki/Online_identity"
    ],
    "contributor": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": origin
    }
  };

  const footprintTypes = [
    {
      title: "Active Footprint",
      description: "Data you intentionally share: social media posts, forum comments, profile information, newsletter signups, online purchases, and any content you deliberately publish.",
      icon: Users,
      examples: ["Posting a photo on Instagram", "Signing up for an email newsletter", "Writing a product review", "Creating a LinkedIn profile"]
    },
    {
      title: "Passive Footprint",
      description: "Data collected without direct action: IP addresses logged by websites, cookies tracking browsing behavior, location data from apps, and metadata attached to files.",
      icon: Eye,
      examples: ["Websites recording your IP address", "Cookies tracking your browsing history", "Apps logging your location", "Email open tracking"]
    }
  ];

  const timeFactors = [
    {
      title: "Account Accumulation",
      description: "Over years of internet use, you may have created dozens or hundreds of accounts—many of which you no longer remember or use.",
      icon: Layers
    },
    {
      title: "Data Persistence",
      description: "Information posted online can remain accessible long after you intended. Archived versions, screenshots, and cached copies extend the life of digital data.",
      icon: Clock
    },
    {
      title: "Service Changes",
      description: "Companies change privacy policies, are acquired, or go out of business. Data you shared under one set of expectations may later exist under different terms.",
      icon: Shield
    },
    {
      title: "Aggregation Effect",
      description: "Isolated pieces of data from different sources can be combined to create more complete profiles. This aggregation increases over time as more data becomes available.",
      icon: Globe
    }
  ];

  return (
    <>
      <Helmet>
        <title>What Is a Digital Footprint? | FootprintIQ</title>
        <meta name="description" content="A clear, factual explanation of digital footprints—what they are, the difference between active and passive footprints, how they differ from exposure, and why understanding them matters." />
        <link rel="canonical" href={`${origin}/ai/digital-footprint`} />
        <meta property="og:title" content="What Is a Digital Footprint?" />
        <meta property="og:description" content="A clear, factual explanation of digital footprints—active vs passive, how they differ from exposure, and why time changes risk." />
        <meta property="og:url" content={`${origin}/ai/digital-footprint`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What Is a Digital Footprint?" />
        <meta name="twitter:description" content="A clear, factual explanation of digital footprints—active vs passive, how they differ from exposure, and why time changes risk." />
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
                  <Link to="/ai">AI Answers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>What Is a Digital Footprint?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Is a Digital Footprint?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A clear, factual explanation of what digital footprints are, how they form, and why understanding them helps you make informed choices about your online presence.
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
                <strong className="text-foreground">A digital footprint is the trail of data you leave behind when using the internet.</strong> This includes websites you visit, emails you send, information you submit online, and content you post on social media.
              </p>
              <p className="mb-4">
                Everyone who uses the internet has a digital footprint. It begins with your first online activity and grows with each interaction. Your footprint is neither inherently good nor bad—it is simply a record of your digital participation.
              </p>
              <p>
                Understanding your footprint helps you make informed decisions about what you share and how you engage online. It is not something to fear, but something to be aware of.
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#types" className="hover:text-primary transition-colors">1. Active vs. Passive Footprints</a></li>
              <li><a href="#footprint-vs-exposure" className="hover:text-primary transition-colors">2. Footprint vs. Exposure: The Distinction</a></li>
              <li><a href="#time-factor" className="hover:text-primary transition-colors">3. Why Time Changes Risk</a></li>
              <li><a href="#realistic-expectations" className="hover:text-primary transition-colors">4. Realistic Expectations</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">5. Frequently Asked Questions</a></li>
            </ul>
          </nav>

          {/* Section 1: Active vs Passive */}
          <section id="types" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Footprints className="h-6 w-6 text-primary" />
              1. Active vs. Passive Footprints
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Digital footprints come in two forms, depending on whether you actively create them or whether they are collected automatically.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-6">
              {footprintTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <Card key={index} className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{type.title}</h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                      <div className="border-t pt-4">
                        <p className="text-xs font-medium text-foreground mb-2">Examples:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {type.examples.map((example, i) => (
                            <li key={i}>• {example}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Both types of footprints are normal parts of internet use. Being aware of them helps you understand what data exists about you and make choices about what you share intentionally.
              </p>
            </div>
          </section>

          {/* Section 2: Footprint vs Exposure */}
          <section id="footprint-vs-exposure" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              2. Footprint vs. Exposure: The Distinction
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p className="mb-4">
                These terms are often used interchangeably, but they describe different aspects of your online presence. Understanding the distinction helps clarify what you are actually assessing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Digital Footprint</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>All data you leave behind online</li>
                    <li>Includes both public and private data</li>
                    <li>Describes what exists</li>
                    <li>Neutral—neither good nor bad</li>
                    <li>Grows with every online interaction</li>
                    <li>Includes data only you can access</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">
                    <Link to="/ai/digital-exposure" className="hover:text-primary transition-colors">
                      Digital Exposure
                    </Link>
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Data that others can find or access</li>
                    <li>Subset of your footprint that is visible</li>
                    <li>Describes what others can see</li>
                    <li>Creates potential risk context</li>
                    <li>Increases through breaches and aggregation</li>
                    <li>Includes leaked and public information</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Your footprint is everything you have done online. Your <Link to="/ai/digital-exposure" className="text-primary hover:underline">exposure</Link> is the portion of that footprint that others can discover. Not all of your footprint becomes exposure—private accounts, encrypted communications, and data you control remain part of your footprint without being exposed.
              </p>
              <p>
                When assessing privacy, both concepts matter. Footprint awareness helps you make better choices going forward. Exposure awareness helps you understand current visibility.
              </p>
            </div>
          </section>

          {/* Section 3: Time Factor */}
          <section id="time-factor" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              3. Why Time Changes Risk
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Digital footprints are not static. The passage of time affects both the size of your footprint and the risk profile of the data within it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              {timeFactors.map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{factor.title}</h3>
                          <p className="text-muted-foreground text-sm">{factor.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Information that seemed harmless when shared may become more sensitive as contexts change. A username that was anonymous in 2015 may now be linked to your real identity through data aggregation. An old forum post may resurface in unexpected contexts.
              </p>
              <p>
                This does not mean old data will necessarily cause problems—most of it never becomes relevant. But understanding that time compounds the effects of digital participation helps explain why periodic assessment is worthwhile.
              </p>
            </div>
          </section>

          {/* Section 4: Realistic Expectations */}
          <section id="realistic-expectations" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              4. Realistic Expectations
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Understanding digital footprints should lead to informed choices, not anxiety. Here is what is realistic to expect:
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What You Can Do</h3>
              <ul className="space-y-2 mb-6">
                <li><strong>Reduce future growth:</strong> Be more selective about what you share, which services you use, and what accounts you create.</li>
                <li><strong>Clean up existing data:</strong> Delete old accounts, remove outdated profiles, and request data removal from brokers where possible.</li>
                <li><strong>Understand your current footprint:</strong> Periodically check what information is publicly associated with your name, email, or username.</li>
                <li><strong>Protect sensitive accounts:</strong> Use strong passwords, enable two-factor authentication, and monitor accounts that matter most.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What Is Not Realistic</h3>
              <ul className="space-y-2 mb-6">
                <li><strong>Complete erasure:</strong> If you have used the internet for years, some data will persist. Archives, backups, and third-party copies exist outside your control.</li>
                <li><strong>Perfect privacy:</strong> Participating in digital life requires some level of data sharing. The goal is informed management, not elimination.</li>
                <li><strong>One-time fixes:</strong> Digital footprints grow continuously. Maintaining awareness requires ongoing attention, not a single cleanup.</li>
              </ul>

              <p>
                Having a digital footprint is not a failure or a problem to solve. It is a consequence of modern life. The question is not whether to have a footprint, but how much awareness and control you want over its size and composition.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              5. Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  What is a digital footprint?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  A digital footprint is the trail of data you leave behind when using the internet. This includes websites you visit, emails you send, information you submit online, and content you post on social media. Everyone who uses the internet has a digital footprint.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  What is the difference between active and passive digital footprints?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  An active digital footprint consists of data you intentionally share, such as social media posts, forum comments, or newsletter signups. A passive digital footprint is collected without your direct action, including browsing history, IP addresses logged by websites, and cookies tracking your behavior.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  How is a digital footprint different from digital exposure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  A digital footprint describes all the data you leave online, both intentional and unintentional. <Link to="/ai/digital-exposure" className="text-primary hover:underline">Digital exposure</Link> specifically refers to when that information becomes visible to others—through data breaches, public records, or aggregation by data brokers. Footprint is what exists; exposure is what others can find.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Does my digital footprint grow over time?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Digital footprints tend to accumulate as you continue using online services. Old accounts, forgotten profiles, and outdated information remain part of your footprint even when you no longer use them. The longer you participate online, the larger your footprint typically becomes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Can I delete my digital footprint completely?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Complete deletion is generally not realistic for anyone who has used the internet regularly. You can reduce your footprint by deleting accounts, requesting data removal, and being more selective about future sharing. However, some information may persist in archives, backups, or third-party databases beyond your control.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Should I be worried about my digital footprint?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Having a digital footprint is normal and expected for internet users. Rather than worry, focus on understanding what exists and making informed choices about future sharing. Most people have substantial footprints without experiencing harm. Awareness enables better decisions; anxiety does not.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Related Topics */}
          <section className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Related Topics</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                to="/ai/digital-exposure" 
                className="p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">What Is Digital Exposure?</h3>
                <p className="text-sm text-muted-foreground mt-1">Understanding when your footprint becomes visible to others.</p>
              </Link>
              <Link 
                to="/digital-privacy-glossary" 
                className="p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">Digital Privacy Glossary</h3>
                <p className="text-sm text-muted-foreground mt-1">Definitions of key privacy and security terms.</p>
              </Link>
            </div>
          </section>

          {/* Editorial Note */}
          <aside className="p-6 bg-muted/30 rounded-lg border border-muted mb-8">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Editorial note:</strong> This page is designed to provide factual, educational information about digital footprints. It is written for general audiences, researchers, journalists, and AI systems seeking neutral reference content. 
              See our <Link to="/editorial-ethics-policy" className="text-primary hover:underline">Editorial & Ethics Policy</Link> for more about how we approach content.
            </p>
          </aside>

          <p className="text-sm text-muted-foreground text-center mb-8">
            Part of the <Link to="/ai" className="text-primary hover:underline">FootprintIQ AI Answers hub</Link>
          </p>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DigitalFootprint;
