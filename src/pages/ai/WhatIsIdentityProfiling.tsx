import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Layers, Database, Puzzle, TrendingUp, Users, ShieldCheck, Info, HelpCircle } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const WhatIsIdentityProfiling = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai/what-is-identity-profiling',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Is Identity Profiling? (And How It Happens Quietly Online)",
    "description": "A clear, factual explanation of identity profiling—how patterns are inferred from public data, why it happens automatically, and what it means for everyday users.",
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
      "@id": `${origin}/ai/what-is-identity-profiling`
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is identity profiling?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Identity profiling is the process of building a picture of someone by connecting data points from different sources. It involves pattern inference rather than direct observation."
        }
      },
      {
        "@type": "Question",
        "name": "How does identity profiling happen online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Identity profiling typically happens through automated data aggregation. When separate pieces of information—usernames, email addresses, public posts—are combined, patterns emerge that suggest interests, habits, or associations."
        }
      },
      {
        "@type": "Question",
        "name": "Is identity profiling the same as surveillance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Surveillance implies intentional, ongoing monitoring by a specific actor. Identity profiling usually happens passively through normal data aggregation by algorithms, often without any human directly involved."
        }
      },
      {
        "@type": "Question",
        "name": "Who creates identity profiles?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Profiles are created by many types of organisations—advertisers, data brokers, platforms, and search engines. Most profiling is automated and happens as a byproduct of normal data processing."
        }
      },
      {
        "@type": "Question",
        "name": "Can I see my own identity profile?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can search for your own usernames, emails, and names to see what publicly available information exists. This gives you insight into what others might piece together about you."
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
        "name": "What Is Identity Profiling?",
        "item": `${origin}/ai/what-is-identity-profiling`
      }
    ]
  };

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Identity Profiling",
    "description": "Identity profiling is the process of inferring characteristics, behaviours, or associations about a person by connecting and analysing data points from multiple sources.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Digital Privacy Glossary",
      "url": `${origin}/digital-privacy-glossary`
    },
    "url": `${origin}/ai/what-is-identity-profiling`,
    "termCode": "identity-profiling",
    "contributor": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": origin
    }
  };

  const dataPointExamples = [
    { category: "Account Information", examples: "Usernames, email addresses, profile photos used across platforms" },
    { category: "Public Activity", examples: "Posts, comments, reviews, and forum contributions" },
    { category: "Metadata", examples: "Timestamps, locations embedded in photos, device information" },
    { category: "Professional Data", examples: "Job titles, company affiliations, published articles" },
    { category: "Social Connections", examples: "Public friends lists, group memberships, follows and followers" },
    { category: "Consumer Behaviour", examples: "Purchase reviews, wishlist items, brand interactions" }
  ];

  const howProfilingHappens = [
    {
      title: "Data Aggregation",
      description: "Separate pieces of information from different sources are collected and stored together. A single username might link profiles across dozens of platforms.",
      icon: Database
    },
    {
      title: "Pattern Recognition",
      description: "Algorithms identify recurring behaviours, preferences, or associations. Posting times, topic interests, and writing style all contribute to inferred patterns.",
      icon: TrendingUp
    },
    {
      title: "Identity Linking",
      description: "When the same identifier appears in multiple places, systems connect those appearances to build a more complete picture.",
      icon: Puzzle
    },
    {
      title: "Inference and Prediction",
      description: "Based on aggregated data and patterns, automated systems make predictions about interests, demographics, or likely behaviours.",
      icon: Layers
    }
  ];

  const commonMisconceptions = [
    {
      misconception: "Someone is watching me",
      reality: "Most profiling is automated. Algorithms process data without human involvement. The concern is not individual attention but systemic data aggregation."
    },
    {
      misconception: "Only tech companies do this",
      reality: "Data brokers, advertisers, employers, and many other organisations build or purchase profiles. The practice is widespread across industries."
    },
    {
      misconception: "I have nothing to hide",
      reality: "Profiling is not about secrets. It is about how aggregated information can be used to make decisions—about credit, employment, insurance, or content shown to you."
    },
    {
      misconception: "Deleting accounts removes profiles",
      reality: "Data may persist in archives, caches, or third-party databases long after the original source is removed. Complete erasure is difficult."
    }
  ];

  return (
    <>
      <Helmet>
        <title>What Is Identity Profiling? (And How It Happens Quietly Online) | FootprintIQ</title>
        <meta name="description" content="A clear, factual explanation of identity profiling—how patterns are inferred from public data, why it happens automatically, and what it means for everyday users." />
        <link rel="canonical" href={`${origin}/ai/what-is-identity-profiling`} />
        <meta property="og:title" content="What Is Identity Profiling? (And How It Happens Quietly Online)" />
        <meta property="og:description" content="Understand how identity profiling works through data aggregation and pattern inference—explained simply and without alarm." />
        <meta property="og:url" content={`${origin}/ai/what-is-identity-profiling`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What Is Identity Profiling? (And How It Happens Quietly Online)" />
        <meta name="twitter:description" content="Understand how identity profiling works through data aggregation and pattern inference—explained simply and without alarm." />
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
                <BreadcrumbPage>What Is Identity Profiling?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Is Identity Profiling?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              How patterns about you emerge from scattered data—and why it usually happens quietly, automatically, and without anyone specifically watching.
            </p>
          </header>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#definition" className="hover:text-primary transition-colors">1. What Identity Profiling Means</a></li>
              <li><a href="#how-it-happens" className="hover:text-primary transition-colors">2. How Profiling Happens</a></li>
              <li><a href="#data-points" className="hover:text-primary transition-colors">3. What Data Points Contribute</a></li>
              <li><a href="#who-creates" className="hover:text-primary transition-colors">4. Who Creates Profiles</a></li>
              <li><a href="#misconceptions" className="hover:text-primary transition-colors">5. Common Misconceptions</a></li>
              <li><a href="#related-concepts" className="hover:text-primary transition-colors">6. Related Concepts</a></li>
              <li><a href="#awareness" className="hover:text-primary transition-colors">7. Awareness Without Alarm</a></li>
            </ul>
          </nav>

          {/* Section 1: Definition */}
          <section id="definition" className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              1. What Identity Profiling Means
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">Identity profiling is the process of building a picture of someone by connecting data points from different sources.</strong> It involves inference rather than direct observation.
              </p>
              <p>
                When separate pieces of publicly available information are combined—usernames, post histories, professional affiliations—patterns emerge. These patterns allow systems to make educated guesses about a person's interests, habits, demographics, or associations.
              </p>
              <p>
                Profiling is not inherently malicious. It happens as a natural consequence of how data flows through the internet. Every time information is shared publicly, it becomes available for aggregation.
              </p>
              <p>
                The key distinction is that profiling typically happens <em>indirectly</em>. No one needs to follow you around. Algorithms piece together what you have already made available.
              </p>
            </div>
          </section>

          {/* Section 2: How It Happens */}
          <section id="how-it-happens" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              2. How Profiling Happens
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                Identity profiling typically follows a predictable pattern. Understanding these steps helps explain why it happens so quietly.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-6">
              {howProfilingHappens.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Card key={index} className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-3">
                        <IconComponent className="h-5 w-5 text-primary mt-1" />
                        <h3 className="font-semibold text-foreground text-lg">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                This entire process is usually automated. Most profiling happens without any human reviewing individual accounts. Systems are designed to process data at scale, connecting millions of data points across billions of users.
              </p>
            </div>
          </section>

          {/* Section 3: Data Points */}
          <section id="data-points" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              3. What Data Points Contribute
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                Many types of publicly available information can contribute to an identity profile. Each piece alone may seem insignificant, but combined they form a more complete picture. This aggregated information becomes part of your <Link to="/ai/digital-footprint" className="text-primary hover:underline">digital footprint</Link>.
              </p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Data Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPointExamples.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-3 px-4 font-medium text-foreground">{item.category}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                The power of profiling comes from correlation. A username that appears on a forum, a social platform, and a gaming site creates a link between those activities—even if no single account reveals much on its own.
              </p>
            </div>
          </section>

          {/* Section 4: Who Creates Profiles */}
          <section id="who-creates" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              4. Who Creates Profiles
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Many different types of organisations build or use identity profiles. This is not limited to any single industry.
              </p>
              <ul className="space-y-3">
                <li>
                  <strong className="text-foreground">Advertisers and marketers</strong> build profiles to target ads based on inferred interests and demographics.
                </li>
                <li>
                  <strong className="text-foreground">Data brokers</strong> aggregate public records and online activity to create comprehensive dossiers that they sell to other businesses.
                </li>
                <li>
                  <strong className="text-foreground">Social platforms</strong> use engagement patterns to recommend content and connections.
                </li>
                <li>
                  <strong className="text-foreground">Search engines</strong> personalise results based on past queries and browsing behaviour.
                </li>
                <li>
                  <strong className="text-foreground">Employers and recruiters</strong> may review publicly available information when evaluating candidates.
                </li>
                <li>
                  <strong className="text-foreground">Financial services</strong> sometimes use alternative data sources in risk assessment.
                </li>
              </ul>
              <p>
                In most cases, profiling is a byproduct of normal operations rather than a deliberate investigation. Systems are designed to process data automatically at scale.
              </p>
            </div>
          </section>

          {/* Section 5: Misconceptions */}
          <section id="misconceptions" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              5. Common Misconceptions
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                Several common beliefs about identity profiling are not quite accurate. Understanding the reality helps maintain perspective.
              </p>
            </div>

            <div className="space-y-4">
              {commonMisconceptions.map((item, index) => (
                <Card key={index} className="border-muted">
                  <CardContent className="pt-6">
                    <p className="font-semibold text-foreground mb-2">Misconception: "{item.misconception}"</p>
                    <p className="text-muted-foreground text-sm">{item.reality}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Section 6: Related Concepts */}
          <section id="related-concepts" className="mb-12 p-6 bg-muted/30 rounded-lg border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Puzzle className="h-6 w-6 text-primary" />
              6. Related Concepts
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Identity profiling is closely related to several other concepts in digital privacy:
              </p>
              <ul className="space-y-3">
                <li>
                  <strong className="text-foreground"><Link to="/ai/digital-footprint" className="text-primary hover:underline">Digital Footprint</Link></strong> — The complete trail of data you leave online, both intentionally and unintentionally. Your footprint provides the raw material for profiling.
                </li>
                <li>
                  <strong className="text-foreground"><Link to="/ai/digital-exposure" className="text-primary hover:underline">Digital Exposure</Link></strong> — The portion of your digital footprint that is publicly discoverable. Exposure determines what data is available for profiling.
                </li>
                <li>
                  <strong className="text-foreground"><Link to="/ai/what-is-osint" className="text-primary hover:underline">OSINT (Open-Source Intelligence)</Link></strong> — The method of gathering and analysing publicly available information. Profiling uses OSINT techniques, often at scale.
                </li>
              </ul>
              <p>
                These concepts overlap but are distinct. Your footprint is what you create. Your exposure is what can be found. Profiling is what can be inferred by connecting exposed data.
              </p>
            </div>
          </section>

          {/* Section 7: Awareness */}
          <section id="awareness" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              7. Awareness Without Alarm
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Understanding identity profiling is not about fear. It is about awareness.
              </p>
              <p>
                Profiling is a reality of modern digital life. It happens continuously, automatically, and at scale. Most of it is mundane—used to show you relevant ads or suggest content you might like.
              </p>
              <p>
                The goal of awareness is not to disconnect entirely, but to make informed choices about what you share and where. Small decisions—like using different usernames for different contexts—can limit how easily your activities are connected.
              </p>
              <p>
                Searching for your own name, email, or username helps you understand what others might find. This knowledge puts you in a better position to manage your digital presence deliberately rather than by accident.
              </p>
              <p>
                Identity profiling is not something done <em>to</em> you by a specific actor. It is an emergent property of how data flows. Once you understand this, you can engage with the digital world more thoughtfully.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is identity profiling?</AccordionTrigger>
                <AccordionContent>
                  Identity profiling is the process of building a picture of someone by connecting data points from different sources. It involves pattern inference rather than direct observation.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does identity profiling happen online?</AccordionTrigger>
                <AccordionContent>
                  Identity profiling typically happens through automated data aggregation. When separate pieces of information—usernames, email addresses, public posts—are combined, patterns emerge that suggest interests, habits, or associations.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is identity profiling the same as surveillance?</AccordionTrigger>
                <AccordionContent>
                  No. Surveillance implies intentional, ongoing monitoring by a specific actor. Identity profiling usually happens passively through normal data aggregation by algorithms, often without any human directly involved.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Who creates identity profiles?</AccordionTrigger>
                <AccordionContent>
                  Profiles are created by many types of organisations—advertisers, data brokers, platforms, and search engines. Most profiling is automated and happens as a byproduct of normal data processing.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I see my own identity profile?</AccordionTrigger>
                <AccordionContent>
                  You can search for your own usernames, emails, and names to see what publicly available information exists. This gives you insight into what others might piece together about you.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Related Topics */}
          <section className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Related Topics</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/ai/digital-footprint" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
                Digital Footprint
              </Link>
              <Link to="/ai/digital-exposure" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
                Digital Exposure
              </Link>
              <Link to="/ai/what-is-osint" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
                What Is OSINT?
              </Link>
              <Link to="/digital-privacy-glossary" className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm">
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

export default WhatIsIdentityProfiling;
