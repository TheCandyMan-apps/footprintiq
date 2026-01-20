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
          "text": "OSINT stands for open-source intelligence. It means gathering and analysing information from sources that anyone can access—like websites, social media, news articles, and public records. No special permissions or hacking required."
        }
      },
      {
        "@type": "Question",
        "name": "Is OSINT legal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gathering publicly available information is generally legal. However, how you use that information matters. Using public data for harassment, stalking, or fraud is illegal. The method of collection, type of information, and intended use all affect legality."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use OSINT on myself?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Searching for your own name, email, or username to understand what others might find about you is one of the most practical uses of open-source intelligence methods. It helps you understand and manage your own digital presence."
        }
      },
      {
        "@type": "Question",
        "name": "How is OSINT different from hacking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OSINT only uses publicly available information that anyone can access. Hacking involves gaining unauthorised access to protected systems or data. OSINT does not bypass security, guess passwords, or exploit vulnerabilities."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between OSINT, digital footprint, and digital exposure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OSINT is a method of gathering public information. A digital footprint is all the data you leave behind online. Digital exposure is the portion of your footprint that others can actually find. OSINT is how someone might discover your exposure."
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
    { category: "Social Media", examples: "Public posts, profile information, connections, and comments on platforms like LinkedIn, Twitter, or Facebook" },
    { category: "News and Media", examples: "Published articles, press releases, interviews, podcasts, and video content" },
    { category: "Government Records", examples: "Company registrations, court filings, property ownership, and regulatory databases" },
    { category: "Professional Directories", examples: "Industry memberships, certifications, alumni networks, and business registries" },
    { category: "Web Archives", examples: "Historical versions of websites preserved by archiving services" },
    { category: "Academic Sources", examples: "Published research, conference papers, and institutional publications" }
  ];

  const everydayUses = [
    {
      title: "Employment Decisions",
      description: "Employers often review public social media profiles and professional networks when evaluating candidates. Job seekers research companies through news, reviews, and public filings before accepting offers.",
      icon: Users
    },
    {
      title: "Fraud Prevention",
      description: "Banks and businesses verify identity claims using public records. Individuals check whether a company or seller is legitimate before making purchases or investments.",
      icon: Shield
    },
    {
      title: "Journalism",
      description: "Reporters verify claims, identify sources, and investigate stories using public records, social media posts, and official statements. Fact-checkers use the same methods to confirm accuracy.",
      icon: BookOpen
    },
    {
      title: "Avoiding Scams",
      description: "Before wiring money or sharing sensitive information, people search for warning signs—checking if a person, company, or offer has been reported as fraudulent elsewhere online.",
      icon: Eye
    }
  ];

  const ethicalPrinciples = [
    {
      principle: "Public Data Only",
      description: "Information should be genuinely publicly accessible. If you need special access, deception, or technical exploitation to obtain it, it is not appropriate for ethical OSINT."
    },
    {
      principle: "No Ongoing Monitoring",
      description: "A one-time search is different from continuous surveillance. Ethical practice means gathering information for a specific purpose, not tracking someone indefinitely."
    },
    {
      principle: "No Impersonation",
      description: "Creating fake accounts, pretending to be someone else, or deceiving people to gain information crosses ethical and often legal lines. Genuine OSINT does not require deception."
    },
    {
      principle: "Proportionate Purpose",
      description: "The depth of research should match the legitimate need. Extensive investigation into an individual requires stronger justification than a simple background check."
    },
    {
      principle: "Consider Impact",
      description: "Even when information is public, consider how its use might affect the person involved. Public availability does not automatically justify any use."
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
              Open-source intelligence explained simply: what it means, where it comes from, and why understanding publicly available information matters.
            </p>
          </header>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#definition" className="hover:text-primary transition-colors">1. What OSINT Actually Means</a></li>
              <li><a href="#what-counts" className="hover:text-primary transition-colors">2. What Counts as OSINT</a></li>
              <li><a href="#vs-hacking" className="hover:text-primary transition-colors">3. OSINT vs. Hacking</a></li>
              <li><a href="#everyday-use" className="hover:text-primary transition-colors">4. How OSINT Is Used in Everyday Life</a></li>
              <li><a href="#ethical-principles" className="hover:text-primary transition-colors">5. Ethical OSINT Principles</a></li>
              <li><a href="#concepts-compared" className="hover:text-primary transition-colors">6. OSINT vs. Digital Footprint vs. Digital Exposure</a></li>
              <li><a href="#on-yourself" className="hover:text-primary transition-colors">7. Can You Use OSINT on Yourself?</a></li>
              <li><a href="#closing" className="hover:text-primary transition-colors">8. Awareness, Not Alarm</a></li>
            </ul>
          </nav>

          {/* Section 1: Plain-language definition */}
          <section id="definition" className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              1. What OSINT Actually Means
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4 text-lg">
                <strong className="text-foreground">OSINT stands for open-source intelligence.</strong> In plain terms, it means gathering and analysing information from sources that anyone can access—websites, social media, news articles, public records, and similar materials.
              </p>
              <p className="mb-4">
                The "open" refers to the availability of the information, not to open-source software. If you can find it without needing passwords, special access, or hacking, it qualifies as open-source information.
              </p>
              <p className="mb-4">
                The term originated in government contexts, but the practice itself is something ordinary people do every day. When you search for information about a company before a job interview, check reviews before a purchase, or look up someone's professional background, you are using open-source intelligence methods.
              </p>
              <p>
                OSINT is a method—a way of finding and using publicly available information. It is not a job title, a profession, or a technology. It describes how information is gathered, not who gathers it.
              </p>
            </div>
          </section>

          {/* Section 2: What Counts as OSINT */}
          <section id="what-counts" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              2. What Counts as OSINT
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                For information to qualify as open-source, it must be genuinely publicly accessible. This means anyone can find and view it without needing special credentials, insider knowledge, or technical exploitation.
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

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                <strong className="text-foreground">What does NOT count as OSINT:</strong>
              </p>
              <ul className="space-y-2">
                <li>Private messages or emails accessed without permission</li>
                <li>Password-protected content you are not authorised to view</li>
                <li>Information obtained by impersonating someone else</li>
                <li>Data from hacking, phishing, or exploiting system vulnerabilities</li>
                <li>Leaked data that was never intended to be public</li>
              </ul>
              <p className="mt-4">
                The distinction matters. If accessing the information required bypassing security or deceiving someone, it is not open-source intelligence—regardless of what the information contains.
              </p>
            </div>
          </section>

          {/* Section 3: OSINT vs Hacking */}
          <section id="vs-hacking" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              3. OSINT vs. Hacking
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                A common misconception is that OSINT involves hacking or technical intrusion. This is incorrect. The two are fundamentally different in method, legality, and ethics.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">OSINT (Legal)</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Uses information anyone can access</li>
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
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Hacking (Illegal)</h3>
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

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                <strong className="text-foreground">The legal distinction:</strong> Gathering publicly available information is legal in most places. Accessing information that requires bypassing security—even if the security is weak—is typically illegal.
              </p>
              <p>
                <strong className="text-foreground">The ethical distinction:</strong> OSINT respects existing access controls. If a profile is private, OSINT does not attempt to view it. If a database requires authentication, OSINT does not attempt to access it. The practice operates within boundaries, not around them.
              </p>
            </div>
          </section>

          {/* Section 4: Everyday Uses */}
          <section id="everyday-use" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              4. How OSINT Is Used in Everyday Life
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Open-source intelligence is not exotic or specialised. Most people use these methods regularly, often without thinking of it in formal terms.
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
                In each case, the underlying method is the same: gathering publicly available information to make better decisions. The formality varies, but the principle does not.
              </p>
            </div>
          </section>

          {/* Section 5: Ethical Principles */}
          <section id="ethical-principles" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              5. Ethical OSINT Principles
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                The fact that information is publicly available does not mean every use of that information is appropriate. Ethical practice requires considering not just what is possible, but what is responsible.
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
                These principles distinguish responsible inquiry from problematic behaviour. The question is not only "can I find this?" but "should I find this, and what will I do with it?"
              </p>
            </div>
          </section>

          {/* Section 6: Concepts Compared */}
          <section id="concepts-compared" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              6. OSINT vs. Digital Footprint vs. Digital Exposure
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                These three terms are related but describe different things. Understanding the distinctions helps clarify what each concept actually means.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 my-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">OSINT</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    <strong>What it is:</strong> A method of gathering information from public sources.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>In practice:</strong> How someone might research you, a company, or a topic using publicly available data.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">
                    <Link to="/ai/digital-footprint" className="hover:text-primary transition-colors">Digital Footprint</Link>
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    <strong>What it is:</strong> All the data you leave behind when using the internet.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>In practice:</strong> Every account, post, search, and interaction—both public and private.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">
                    <Link to="/ai/digital-exposure" className="hover:text-primary transition-colors">Digital Exposure</Link>
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    <strong>What it is:</strong> The portion of your footprint that others can actually find.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>In practice:</strong> Public profiles, breached data, information in data broker listings.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                <strong className="text-foreground">How they connect:</strong> Your <Link to="/ai/digital-footprint" className="text-primary hover:underline">digital footprint</Link> is everything you leave behind online. Your <Link to="/ai/digital-exposure" className="text-primary hover:underline">digital exposure</Link> is the subset of that footprint that is visible to others. OSINT is how someone might discover and analyse your exposure.
              </p>
              <p>
                When you use OSINT methods to research yourself, you are essentially measuring your own digital exposure—seeing what others could find using the same publicly available sources.
              </p>
            </div>
          </section>

          {/* Section 7: On Yourself */}
          <section id="on-yourself" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              7. Can You Use OSINT on Yourself?
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4 text-lg">
                <strong className="text-foreground">Yes.</strong> Searching for your own name, email addresses, usernames, and other identifiers is one of the most practical applications of open-source intelligence methods.
              </p>
              <p className="mb-4">
                This kind of self-research helps you understand what others might find when they look for information about you. It can reveal forgotten accounts, outdated information, or data you did not know was public.
              </p>
              
              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What you might discover:</h3>
              <ul className="space-y-2 mb-6">
                <li>Old social media profiles you no longer use</li>
                <li>Your information in data broker databases</li>
                <li>Public records containing your address or phone number</li>
                <li>Forum posts or comments from years ago</li>
                <li>Professional profiles with outdated information</li>
                <li>Photos or mentions by others that include you</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What you can do with this information:</h3>
              <ul className="space-y-2 mb-6">
                <li>Delete or deactivate accounts you no longer need</li>
                <li>Update outdated information on active profiles</li>
                <li>Request removal from data broker listings</li>
                <li>Adjust privacy settings on platforms where you are active</li>
                <li>Make more informed decisions about future sharing</li>
              </ul>

              <p>
                Self-research is not about paranoia. It is about understanding your own visibility and making conscious choices about your online presence.
              </p>
            </div>
          </section>

          {/* Section 8: Calm Closing */}
          <section id="closing" className="mb-12 p-8 bg-muted/50 rounded-lg border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              8. Awareness, Not Alarm
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Learning about OSINT and digital visibility is not meant to create anxiety. The goal is understanding—knowing what exists, how it can be found, and what choices you have.
              </p>
              <p className="mb-4">
                Most people have a digital presence. That is a normal part of modern life. Having information online does not mean something bad will happen. Most publicly available information is never accessed by anyone with harmful intent.
              </p>
              <p className="mb-4">
                What understanding OSINT provides is context. When you know how public information can be gathered and connected, you can make better decisions about what you share, where you share it, and how you present yourself online.
              </p>
              <p className="mb-4">
                You do not need to disappear from the internet or live in fear of what exists about you online. You simply benefit from knowing what is there.
              </p>
              <p>
                <strong className="text-foreground">Awareness enables informed choices. That is the point.</strong>
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
                  OSINT stands for open-source intelligence. It means gathering and analysing information from sources that anyone can access—like websites, social media, news articles, and public records. No special permissions or hacking required.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is OSINT legal?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Gathering publicly available information is generally legal. However, how you use that information matters. Using public data for harassment, stalking, or fraud is illegal. The method of collection, type of information, and intended use all affect legality.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Can I use OSINT on myself?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Searching for your own name, email, or username to understand what others might find about you is one of the most practical uses of open-source intelligence methods. It helps you understand and manage your own digital presence.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  How is OSINT different from hacking?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  OSINT only uses publicly available information that anyone can access. Hacking involves gaining unauthorised access to protected systems or data. OSINT does not bypass security, guess passwords, or exploit vulnerabilities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  What is the difference between OSINT, digital footprint, and digital exposure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  OSINT is a method of gathering public information. A <Link to="/ai/digital-footprint" className="text-primary hover:underline">digital footprint</Link> is all the data you leave behind online. <Link to="/ai/digital-exposure" className="text-primary hover:underline">Digital exposure</Link> is the portion of your footprint that others can actually find. OSINT is how someone might discover your exposure.
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
