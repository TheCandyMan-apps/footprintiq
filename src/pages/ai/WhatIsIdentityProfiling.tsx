import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Layers, Database, Scale, MapPin, Lightbulb, ShieldQuestion, Heart } from "lucide-react";
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
          "text": "Identity profiling is the process of inferring characteristics, relationships, or risk indicators about an individual by analysing patterns across multiple data sources. It typically happens automatically without human review."
        }
      },
      {
        "@type": "Question",
        "name": "How does identity profiling differ from tracking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tracking follows specific actions in real time. Profiling analyses existing data to infer patterns. Tracking collects new data; profiling interprets data that already exists."
        }
      },
      {
        "@type": "Question",
        "name": "Is identity profiling the same as surveillance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Surveillance implies intentional, ongoing monitoring by a specific actor. Identity profiling usually happens passively through automated data aggregation, often without any human directly involved."
        }
      },
      {
        "@type": "Question",
        "name": "Can identity profiling be avoided?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Complete avoidance is impractical for most people. However, reducing exposure is possible through using different usernames across platforms, limiting public information, and being selective about what you share."
        }
      },
      {
        "@type": "Question",
        "name": "Why does identity profiling matter?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Profiling affects decisions made about you—from the content you see to credit assessments and job screening. Understanding how it works helps you make more informed choices about your digital presence."
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
    "description": "Identity profiling is the process of inferring characteristics, relationships, or risk indicators about an individual by analysing patterns across multiple data sources.",
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

  const dataContributions = [
    { category: "Account Identifiers", examples: "Usernames, email addresses, phone numbers, profile photos" },
    { category: "Public Content", examples: "Social media posts, comments, reviews, forum contributions" },
    { category: "Professional Information", examples: "Job titles, company affiliations, published work, LinkedIn profiles" },
    { category: "Behavioural Signals", examples: "Posting times, engagement patterns, platform preferences" },
    { category: "Social Connections", examples: "Friends lists, followers, group memberships, tagged associations" },
    { category: "Metadata", examples: "Timestamps, location tags in photos, device signatures" }
  ];

  const commonUses = [
    {
      sector: "Digital Advertising",
      description: "Profiles determine which ads you see based on inferred interests, demographics, and purchasing intent."
    },
    {
      sector: "Content Recommendation",
      description: "Streaming services, news sites, and social platforms use profiles to suggest content you might engage with."
    },
    {
      sector: "Risk Assessment",
      description: "Some financial services and insurers use alternative data to supplement traditional credit scoring."
    },
    {
      sector: "Recruitment",
      description: "Employers and recruiters may review publicly available information when evaluating candidates."
    },
    {
      sector: "Security and Fraud Prevention",
      description: "Profiles help identify unusual behaviour patterns that might indicate fraudulent activity."
    },
    {
      sector: "Data Brokerage",
      description: "Companies aggregate and sell profiles to other businesses for marketing, verification, or research purposes."
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
              <li><a href="#definition" className="hover:text-primary transition-colors">1. Plain-Language Definition</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">2. How Identity Profiling Works</a></li>
              <li><a href="#data-contributions" className="hover:text-primary transition-colors">3. What Data Contributes to Identity Profiling</a></li>
              <li><a href="#vs-tracking-surveillance" className="hover:text-primary transition-colors">4. Identity Profiling vs Tracking vs Surveillance</a></li>
              <li><a href="#common-uses" className="hover:text-primary transition-colors">5. Where Identity Profiling Is Commonly Used</a></li>
              <li><a href="#why-it-matters" className="hover:text-primary transition-colors">6. Why Identity Profiling Matters</a></li>
              <li><a href="#can-it-be-avoided" className="hover:text-primary transition-colors">7. Can Identity Profiling Be Avoided?</a></li>
              <li><a href="#awareness" className="hover:text-primary transition-colors">8. Awareness and Context</a></li>
            </ul>
          </nav>

          {/* Section 1: Plain-Language Definition */}
          <section id="definition" className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              1. Plain-Language Definition
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">Identity profiling is the process of inferring characteristics, relationships, or risk indicators about an individual by analysing patterns across multiple data sources.</strong> It is inference-based, not observation-based.
              </p>
              <p>
                When separate data points are combined, patterns may emerge. A username used on multiple platforms, an email address appearing in public records, or consistent posting habits across sites can contribute to inferences about interests, habits, demographics, or associations.
              </p>
              <p>
                Profiling typically happens automatically. Algorithms analyse information that already exists, often running at scale across millions of data points. Human analysts are not necessarily involved, and the inferences drawn may or may not be accurate.
              </p>
            </div>
          </section>

          {/* Section 2: How It Works */}
          <section id="how-it-works" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              2. How Identity Profiling Works
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Identity profiling follows a predictable sequence. Understanding these steps explains why profiling happens so quietly and at such scale.
              </p>
              <p>
                <strong className="text-foreground">Data aggregation</strong> comes first. Separate pieces of information from different sources are collected and stored together. A single username might link profiles across dozens of platforms. An email address might appear in breach databases, public directories, and social media accounts.
              </p>
              <p>
                <strong className="text-foreground">Pattern recognition</strong> follows aggregation. Algorithms identify recurring behaviours, preferences, or associations. Posting times, topic interests, writing style, and engagement patterns all contribute to inferred characteristics.
              </p>
              <p>
                <strong className="text-foreground">Identity linking</strong> connects appearances. When the same identifier—a username, email, or phone number—appears in multiple places, systems create connections between those appearances. This builds a more complete picture than any single source provides.
              </p>
              <p>
                <strong className="text-foreground">Inference and prediction</strong> complete the process. Based on aggregated data and recognised patterns, automated systems make predictions about demographics, interests, or likely behaviours. These inferences may or may not be accurate, but they inform decisions made about you.
              </p>
              <p>
                The entire process is usually automated. Most profiling happens without any human reviewing individual accounts. Systems process data at scale, handling billions of data points across hundreds of millions of users.
              </p>
            </div>
          </section>

          {/* Section 3: Data Contributions */}
          <section id="data-contributions" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              3. What Data Contributes to Identity Profiling
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
                  {dataContributions.map((item, index) => (
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
                The power of profiling comes from correlation. A username that appears on a forum, a social platform, and a gaming site creates a link between those activities—even if no single account reveals much on its own. The sum reveals more than the parts.
              </p>
            </div>
          </section>

          {/* Section 4: Profiling vs Tracking vs Surveillance */}
          <section id="vs-tracking-surveillance" className="mb-12 p-8 bg-muted/30 rounded-lg border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              4. Identity Profiling vs Tracking vs Surveillance
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                These terms are often confused, but they describe different processes with different implications.
              </p>
              <p>
                <strong className="text-foreground">Tracking</strong> follows specific actions in real time. Website cookies that monitor which pages you visit, apps that log your location, or analytics that record your clicks are all forms of tracking. Tracking creates new data about current behaviour.
              </p>
              <p>
                <strong className="text-foreground">Surveillance</strong> implies intentional, ongoing monitoring by a specific actor. Law enforcement watching a suspect, an employer monitoring employee communications, or a stalker following someone's movements are forms of surveillance. Surveillance involves deliberate attention from an observer.
              </p>
              <p>
                <strong className="text-foreground">Identity profiling</strong> is different. It analyses data that already exists rather than creating new data. It does not require real-time monitoring or deliberate attention. Profiling happens passively, often without any human involvement, by connecting information that was shared at different times and places.
              </p>
              <p>
                The key distinction is that profiling is inferential and retrospective. No one needs to follow you. Algorithms piece together what has already been made available. This makes profiling feel less intrusive in the moment, but its effects can be equally significant.
              </p>
            </div>
          </section>

          {/* Section 5: Common Uses */}
          <section id="common-uses" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              5. Where Identity Profiling Is Commonly Used
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 mb-6">
              <p>
                Identity profiling is widespread across industries. Understanding where it occurs helps contextualise its effects on daily life.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {commonUses.map((use, index) => (
                <Card key={index} className="border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">{use.sector}</h3>
                    <p className="text-muted-foreground text-sm">{use.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                In most cases, profiling is a byproduct of normal operations rather than a deliberate investigation. Systems are designed to process data automatically, making decisions at scale without individual review.
              </p>
            </div>
          </section>

          {/* Section 6: Why It Matters */}
          <section id="why-it-matters" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              6. Why Identity Profiling Matters
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Identity profiling matters because it affects decisions made about you—often without your knowledge or input.
              </p>
              <p>
                <strong className="text-foreground">Content and pricing.</strong> The information you see online, the prices you are offered, and the products recommended to you may all be influenced by your profile. Two people searching for the same product might see different results or different prices.
              </p>
              <p>
                <strong className="text-foreground">Access and opportunity.</strong> Profiles can influence employment screening, rental applications, insurance quotes, and credit decisions. Inferences drawn from your <Link to="/ai/digital-exposure" className="text-primary hover:underline">digital exposure</Link> may affect opportunities before you know you are being evaluated.
              </p>
              <p>
                <strong className="text-foreground">Accuracy and fairness.</strong> Profiling is based on inference, not certainty. Conclusions drawn from patterns may be incorrect. You might be categorised based on associations rather than your actual characteristics, leading to decisions based on flawed assumptions.
              </p>
              <p>
                <strong className="text-foreground">Persistence and context collapse.</strong> Information shared in one context may be interpreted in another. A casual comment from years ago, a username chosen as a teenager, or a group membership that no longer reflects your views—all can become part of a profile that follows you indefinitely.
              </p>
              <p>
                Understanding profiling is not about fear. It is about recognising how digital information flows and the downstream effects of that flow.
              </p>
            </div>
          </section>

          {/* Section 7: Can It Be Avoided? */}
          <section id="can-it-be-avoided" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <ShieldQuestion className="h-6 w-6 text-primary" />
              7. Can Identity Profiling Be Avoided?
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Complete avoidance of identity profiling is impractical for most people who participate in modern digital life. However, reducing exposure and limiting correlation is possible.
              </p>
              <p>
                <strong className="text-foreground">Use varied identifiers.</strong> Different usernames and email addresses for different contexts make it harder to connect your activities across platforms. Compartmentalisation limits what any single profile can reveal.
              </p>
              <p>
                <strong className="text-foreground">Review privacy settings.</strong> Many platforms offer controls over what information is public. Regular audits of these settings can reduce the data available for aggregation.
              </p>
              <p>
                <strong className="text-foreground">Be selective about sharing.</strong> Not everything needs to be posted publicly. Considering whether information needs to be shared—and with whom—can limit your digital footprint over time.
              </p>
              <p>
                <strong className="text-foreground">Search for yourself.</strong> Knowing what is already available helps you understand your current exposure. You cannot manage what you are not aware of.
              </p>
              <p>
                <strong className="text-foreground">Accept practical limits.</strong> Some profiling is unavoidable. Using email, making purchases, and engaging with online services all generate data. The goal is not elimination but informed participation.
              </p>
              <p>
                Reducing profiling is a matter of degree. Small changes—using different identifiers, limiting public information, being thoughtful about new sharing—can meaningfully reduce how easily your activities are connected without requiring complete withdrawal from digital life.
              </p>
            </div>
          </section>

          {/* Section 8: Awareness and Context */}
          <section id="awareness" className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              8. Awareness and Context
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Identity profiling is a reality of modern digital life. It happens continuously, automatically, and at scale. Understanding it is not a call to fear but an invitation to awareness.
              </p>
              <p>
                Most profiling is mundane. It determines which ads you see, what content is recommended, and how platforms personalise your experience. These applications are unremarkable and often beneficial.
              </p>
              <p>
                What makes profiling worth understanding is its cumulative effect. Individual data points seem harmless. Combined across platforms, services, and years, they create detailed pictures that inform decisions about your life—from job opportunities to financial products to the information you encounter.
              </p>
              <p>
                The appropriate response is not alarm but context. Profiling is not something done <em>to</em> you by a shadowy actor. It is an emergent property of how data flows through interconnected systems. Once you understand this, you can engage with digital life more thoughtfully.
              </p>
              <p>
                Awareness allows choice. You can decide what to share, where to participate, and how much compartmentalisation feels right for you. There is no single correct answer—only the answer that fits your values and circumstances.
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
                  Identity profiling is the process of inferring characteristics, relationships, or risk indicators about an individual by analysing patterns across multiple data sources. It typically happens automatically without human review.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does identity profiling differ from tracking?</AccordionTrigger>
                <AccordionContent>
                  Tracking follows specific actions in real time. Profiling analyses existing data to infer patterns. Tracking collects new data; profiling interprets data that already exists.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is identity profiling the same as surveillance?</AccordionTrigger>
                <AccordionContent>
                  No. Surveillance implies intentional, ongoing monitoring by a specific actor. Identity profiling usually happens passively through automated data aggregation, often without any human directly involved.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Can identity profiling be avoided?</AccordionTrigger>
                <AccordionContent>
                  Complete avoidance is impractical for most people. However, reducing exposure is possible through using different usernames across platforms, limiting public information, and being selective about what you share.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Why does identity profiling matter?</AccordionTrigger>
                <AccordionContent>
                  Profiling affects decisions made about you—from the content you see to credit assessments and job screening. Understanding how it works helps you make more informed choices about your digital presence.
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
