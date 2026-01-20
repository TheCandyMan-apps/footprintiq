import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Globe, BookOpen, Users, Shield, Info, Scale, Eye } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const WhatIsOsint = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  // Track pageview and scroll depth for this authority page
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
          "text": "OSINT stands for open-source intelligence. It refers to the collection and analysis of information from publicly available sources. This includes websites, social media, news articles, public records, and any other information that can be accessed without special permissions or hacking."
        }
      },
      {
        "@type": "Question",
        "name": "Is OSINT legal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gathering publicly available information is generally legal in most jurisdictions. However, how that information is used matters. Using public information for harassment, stalking, or fraud is illegal regardless of how it was obtained. The legality depends on the method of collection, the type of information, and the intended use."
        }
      },
      {
        "@type": "Question",
        "name": "Who uses OSINT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Many people use open-source intelligence methods in everyday contexts: journalists researching stories, businesses evaluating partners, individuals checking their own online presence, academics conducting research, and organisations assessing risks. It is a method of inquiry, not a profession limited to specialists."
        }
      },
      {
        "@type": "Question",
        "name": "How is OSINT different from hacking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OSINT only uses publicly available information that anyone can access. Hacking involves gaining unauthorised access to systems, accounts, or protected data. OSINT does not bypass security, guess passwords, or exploit vulnerabilities. If information requires special access to obtain, it is not open-source intelligence."
        }
      },
      {
        "@type": "Question",
        "name": "What sources does OSINT use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Open-source intelligence draws from many public sources: social media profiles, news websites, government databases, company registries, academic publications, court records, property records, and archived web pages. The defining characteristic is that these sources are accessible to anyone without requiring special credentials."
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

  const everydayExamples = [
    {
      title: "Checking a Company Before Applying",
      description: "Looking up a potential employer's reviews, news mentions, and public filings to understand the organisation before accepting a job offer.",
      icon: Search
    },
    {
      title: "Researching a News Story",
      description: "A journalist gathering public statements, social media posts, and official records to verify claims and build an accurate report.",
      icon: BookOpen
    },
    {
      title: "Verifying an Online Seller",
      description: "Checking a business's registration, customer reviews across platforms, and social media presence before making a significant purchase.",
      icon: Shield
    },
    {
      title: "Understanding Your Own Visibility",
      description: "Searching for your own name, email, or username to see what information about you is publicly accessible online.",
      icon: Eye
    },
    {
      title: "Academic Research",
      description: "Scholars using public datasets, archived websites, and published sources to study social trends, historical events, or public discourse.",
      icon: Globe
    },
    {
      title: "Reconnecting with Someone",
      description: "Searching public social media profiles or alumni directories to find contact information for a former colleague or old friend.",
      icon: Users
    }
  ];

  const sources = [
    { category: "Social Media", examples: "Public profiles, posts, comments, and connections on platforms like LinkedIn, Twitter, or Facebook" },
    { category: "News and Media", examples: "Published articles, press releases, interviews, and broadcast content" },
    { category: "Government Records", examples: "Company registrations, court filings, property records, and regulatory databases" },
    { category: "Academic Sources", examples: "Published research papers, conference proceedings, and institutional repositories" },
    { category: "Web Archives", examples: "Historical snapshots of websites preserved by archiving services" },
    { category: "Public Directories", examples: "Professional registries, organisational memberships, and publicly listed contact information" }
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
              Open-source intelligence explained simply: what it means, where it comes from, and why understanding publicly available information matters.
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
                <strong className="text-foreground">OSINT stands for open-source intelligence.</strong> It refers to the collection and analysis of information from publicly available sources—websites, social media, news articles, public records, and any other information accessible without special permissions.
              </p>
              <p className="mb-4">
                The term originated in government and intelligence contexts, but the practice itself is something most people do regularly without calling it by name. When you search for information about a company, look up someone's public profile, or research a topic using freely available sources, you are using open-source intelligence methods.
              </p>
              <p>
                OSINT is a method of inquiry, not a profession or a tool. It describes how information is gathered—from open, public sources—rather than who gathers it or why.
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#what-makes-it-open" className="hover:text-primary transition-colors">1. What Makes Information "Open Source"</a></li>
              <li><a href="#everyday-examples" className="hover:text-primary transition-colors">2. Everyday Examples of OSINT</a></li>
              <li><a href="#sources" className="hover:text-primary transition-colors">3. Common Sources of Public Information</a></li>
              <li><a href="#not-hacking" className="hover:text-primary transition-colors">4. How OSINT Differs from Hacking</a></li>
              <li><a href="#ethics" className="hover:text-primary transition-colors">5. Ethics and Responsible Use</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">6. Frequently Asked Questions</a></li>
            </ul>
          </nav>

          {/* Section 1: What Makes It Open */}
          <section id="what-makes-it-open" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              1. What Makes Information "Open Source"
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                The "open" in open-source intelligence does not refer to open-source software. Instead, it describes the accessibility of the information itself. Information qualifies as open-source when it meets certain criteria:
              </p>

              <ul className="space-y-2 mb-6">
                <li><strong>Publicly accessible:</strong> Anyone can find and view the information without requiring special credentials, passwords, or permissions.</li>
                <li><strong>Legally obtainable:</strong> Accessing the information does not require bypassing security measures, violating terms of service, or breaking laws.</li>
                <li><strong>No insider access required:</strong> The information is not confidential, classified, or restricted to specific groups.</li>
              </ul>

              <p className="mb-4">
                Examples of open-source information include published news articles, public social media posts, government records available online, company registration documents, academic papers, and archived web pages.
              </p>

              <p>
                Information that requires hacking, deception, or special access to obtain is not open-source intelligence—it falls into other categories entirely.
              </p>
            </div>
          </section>

          {/* Section 2: Everyday Examples */}
          <section id="everyday-examples" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              2. Everyday Examples of OSINT
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Open-source intelligence sounds technical, but the underlying practice is familiar. Most people gather and analyse public information regularly, often without thinking of it in these terms.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              {everydayExamples.map((example, index) => {
                const Icon = example.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{example.title}</h3>
                          <p className="text-muted-foreground text-sm">{example.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                In each case, the method is the same: gathering publicly available information to answer a question or make a decision. The formality and depth may vary, but the underlying approach is consistent.
              </p>
            </div>
          </section>

          {/* Section 3: Sources */}
          <section id="sources" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              3. Common Sources of Public Information
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Open-source intelligence draws from a wide range of publicly accessible sources. The common thread is that these sources do not require special access, insider knowledge, or technical exploitation to use.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-3 px-4 font-medium text-foreground">{source.category}</td>
                      <td className="py-3 px-4 text-muted-foreground">{source.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground mt-6">
              <p>
                The availability of these sources varies by jurisdiction and over time. What is public in one country may be restricted in another. What was once accessible may later be removed or protected.
              </p>
            </div>
          </section>

          {/* Section 4: Not Hacking */}
          <section id="not-hacking" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              4. How OSINT Differs from Hacking
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p className="mb-4">
                A common misconception is that open-source intelligence involves hacking or gaining unauthorised access to systems. This is incorrect. The distinction is fundamental:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Open-Source Intelligence</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Uses only publicly accessible information</li>
                    <li>Requires no special technical exploitation</li>
                    <li>Does not bypass passwords or security</li>
                    <li>Relies on what anyone could find</li>
                    <li>Analyses information that was meant to be accessible</li>
                    <li>Legal when conducted responsibly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Hacking</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Gains unauthorised access to protected systems</li>
                    <li>Exploits technical vulnerabilities</li>
                    <li>Bypasses security measures and credentials</li>
                    <li>Accesses information not meant to be public</li>
                    <li>Often involves deception or manipulation</li>
                    <li>Illegal in most jurisdictions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                If accessing information requires guessing passwords, exploiting software vulnerabilities, impersonating someone, or deceiving a person or system into granting access, it is not open-source intelligence.
              </p>
              <p>
                This distinction matters because it defines both the legal and ethical boundaries of the practice. OSINT works within these boundaries by design.
              </p>
            </div>
          </section>

          {/* Section 5: Ethics */}
          <section id="ethics" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              5. Ethics and Responsible Use
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                The fact that information is publicly available does not mean all uses of that information are appropriate. Ethical considerations apply regardless of how information was obtained.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Legitimate Uses</h3>
              <ul className="space-y-2 mb-6">
                <li>Researching your own <Link to="/ai/digital-footprint" className="text-primary hover:underline">digital footprint</Link> or online presence</li>
                <li>Verifying information before making decisions</li>
                <li>Journalistic investigation in the public interest</li>
                <li>Academic research using publicly available data</li>
                <li>Due diligence for business relationships</li>
                <li>Finding public contact information for legitimate purposes</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Inappropriate Uses</h3>
              <ul className="space-y-2 mb-6">
                <li>Harassment, stalking, or intimidation</li>
                <li>Building profiles of individuals without legitimate purpose</li>
                <li>Discrimination based on discovered information</li>
                <li>Sharing private details in harmful contexts</li>
                <li>Enabling fraud or identity theft</li>
              </ul>

              <p className="mb-4">
                The ethical question is not just "can I access this information?" but "should I access it, and what will I do with it?" Public availability is a necessary condition for open-source intelligence, but it is not sufficient justification for any particular use.
              </p>

              <p>
                Responsible practice means considering the purpose of the inquiry, the potential impact on individuals, and whether the use respects privacy even when that privacy is not legally protected.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              6. Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  What is OSINT?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  OSINT stands for open-source intelligence. It refers to the collection and analysis of information from publicly available sources. This includes websites, social media, news articles, public records, and any other information that can be accessed without special permissions or hacking.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is OSINT legal?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Gathering publicly available information is generally legal in most jurisdictions. However, how that information is used matters. Using public information for harassment, stalking, or fraud is illegal regardless of how it was obtained. The legality depends on the method of collection, the type of information, and the intended use.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Who uses OSINT?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Many people use open-source intelligence methods in everyday contexts: journalists researching stories, businesses evaluating partners, individuals checking their own online presence, academics conducting research, and organisations assessing risks. It is a method of inquiry, not a profession limited to specialists.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  How is OSINT different from hacking?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  OSINT only uses publicly available information that anyone can access. Hacking involves gaining unauthorised access to systems, accounts, or protected data. OSINT does not bypass security, guess passwords, or exploit vulnerabilities. If information requires special access to obtain, it is not open-source intelligence.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  What sources does OSINT use?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Open-source intelligence draws from many public sources: social media profiles, news websites, government databases, company registries, academic publications, court records, property records, and archived web pages. The defining characteristic is that these sources are accessible to anyone without requiring special credentials.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Can I use OSINT to check my own online presence?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. One of the most common and straightforward uses of open-source intelligence methods is understanding your own <Link to="/ai/digital-exposure" className="text-primary hover:underline">digital exposure</Link>. Searching for your own name, email addresses, usernames, and other identifiers helps you understand what others might find about you and take appropriate action if needed.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  Is OSINT the same as surveillance?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Surveillance typically implies ongoing monitoring of a person or group, often without their knowledge and sometimes using covert or intrusive methods. OSINT describes a method of gathering publicly available information at a point in time. While OSINT methods can be misused, the practice itself is distinct from systematic surveillance.
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
                <p className="text-sm text-muted-foreground mt-1">Understanding the trail of data you leave online.</p>
              </Link>
              <Link 
                to="/ai/digital-exposure" 
                className="p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">What Is Digital Exposure?</h3>
                <p className="text-sm text-muted-foreground mt-1">When your online information becomes visible to others.</p>
              </Link>
            </div>
          </section>

          {/* Editorial Note */}
          <aside className="p-6 bg-muted/30 rounded-lg border border-muted mb-8">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Editorial note:</strong> This page provides a neutral, educational explanation of open-source intelligence for general audiences. It is not a guide for practitioners and does not promote specific tools or techniques. 
              See our <Link to="/editorial-ethics-policy" className="text-primary hover:underline">Editorial & Ethics Policy</Link> for more about our approach to content.
            </p>
          </aside>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WhatIsOsint;
