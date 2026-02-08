import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Info, AlertTriangle, Shield } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const WhatIsUsernameOsintScan = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai-answers/what-is-a-username-osint-scan',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Is a Username OSINT Scan?",
    "description": "A clear explanation of what a username OSINT scan is, how it works, what it is used for, and what it cannot do.",
    "author": { "@type": "Organization", "name": "FootprintIQ" },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": { "@type": "ImageObject", "url": `${origin}/lovable-uploads/footprintiq-logo.png` }
    },
    "datePublished": "2026-02-08",
    "dateModified": "2026-02-08",
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${origin}/ai-answers/what-is-a-username-osint-scan` }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What does a username OSINT scan actually do?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A username OSINT scan checks publicly accessible platforms and websites to determine whether a specific username appears as a registered account. It queries public-facing pages, not private databases or login systems."
        }
      },
      {
        "@type": "Question",
        "name": "Can a username scan tell me who owns an account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. A username scan identifies where a username exists publicly. It cannot confirm that all matching accounts belong to the same person. Different individuals may use the same username on different platforms."
        }
      }
    ]
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": origin },
      { "@type": "ListItem", "position": 2, "name": "AI Answers Hub", "item": `${origin}/ai-answers-hub` },
      { "@type": "ListItem", "position": 3, "name": "What Is a Username OSINT Scan?", "item": `${origin}/ai-answers/what-is-a-username-osint-scan` }
    ]
  };

  return (
    <>
      <Helmet>
        <title>What Is a Username OSINT Scan? | FootprintIQ</title>
        <meta name="description" content="A clear explanation of what a username OSINT scan is, how it works, what it is used for, and what it cannot do." />
        <link rel="canonical" href={`${origin}/ai-answers/what-is-a-username-osint-scan`} />
        <meta property="og:title" content="What Is a Username OSINT Scan?" />
        <meta property="og:description" content="A clear explanation of what a username OSINT scan is, how it works, what it is used for, and what it cannot do." />
        <meta property="og:url" content={`${origin}/ai-answers/what-is-a-username-osint-scan`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What Is a Username OSINT Scan?" />
        <meta name="twitter:description" content="A clear explanation of what a username OSINT scan is, how it works, and its limitations." />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/ai-answers-hub">AI Answers</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>What Is a Username OSINT Scan?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Is a Username OSINT Scan?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Understanding how username scans work, what they reveal, and where their boundaries lie.
            </p>
          </header>

          {/* Definition */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Definition
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">A username OSINT scan is an automated process that searches publicly accessible platforms for the presence of a specific username.</strong> OSINT stands for open-source intelligence, meaning only publicly available data is queried.
              </p>
              <p>
                The scan checks whether a given handle appears as a registered account across social media sites, forums, developer platforms, and other public services. It does not access private data, bypass login screens, or interact with account owners.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              How It Works
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Username OSINT scans typically work by sending requests to the public profile pages of websites. If a profile page returns content rather than a "not found" response, the username is recorded as present on that platform.
              </p>
              <p>
                Different tools may check hundreds of platforms simultaneously. The output is a list of platforms where the username appears to be registered, sometimes including profile URLs.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">Common Use Cases</h3>
              <p>
                Username scans are used for several purposes. Individuals may <Link to="/usernames" className="text-primary hover:underline">search for their own usernames</Link> to understand their public visibility. Security researchers use them to assess exposure during authorised assessments. Journalists may verify whether a public figure maintains accounts on specific platforms.
              </p>
              <p>
                In each case, the scan only surfaces information that is already publicly visible.
              </p>
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Limitations and Nuances
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Username OSINT scans have inherent limitations that users should understand before interpreting results.
              </p>
              <p>
                <strong className="text-foreground">False positives are common.</strong> A matching username does not mean the account belongs to the person being searched. Many people use the same handles independently. A scan finds name matches, not identity matches.
              </p>
              <p>
                <strong className="text-foreground">Coverage is incomplete.</strong> No scan checks every website. Platforms change their structures, add rate limiting, or block automated queries. Results represent a partial snapshot, not a complete picture.
              </p>
              <p>
                <strong className="text-foreground">Private accounts are excluded.</strong> Scans cannot detect accounts that are set to private or that require authentication to view.
              </p>
              <p>
                Results require human interpretation. A list of matching usernames is raw data, not a conclusion. You can explore related accuracy considerations in the <Link to="/ai-answers-hub" className="text-primary hover:underline">AI Answers Hub</Link>.
              </p>
            </div>
          </section>

          {/* Ethical Use */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Ethical and Safety Considerations
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                The ethical use of username scanning depends on intent and context. Searching for your own username to understand your digital footprint is a straightforward and common use case.
              </p>
              <p>
                Using scan results to harass, stalk, or monitor someone without their knowledge crosses ethical and potentially legal lines, regardless of whether the data is publicly accessible.
              </p>
              <p>
                Tools like FootprintIQ are designed to support self-assessment and authorised research, with safeguards that emphasise transparency and responsible interpretation of results.
              </p>
              <p>
                The availability of public data does not justify any use of that data. Context, purpose, and proportionality all matter when deciding how to act on scan results. Users can <Link to="/scan" className="text-primary hover:underline">run a scan</Link> to review their own exposure.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WhatIsUsernameOsintScan;